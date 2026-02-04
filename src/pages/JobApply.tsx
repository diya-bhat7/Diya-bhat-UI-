import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Basic routes
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Upload, CheckCircle2, FileText, Send, User, Mail, Phone, Link as LinkIcon, MapPin, Building2 } from 'lucide-react';
import { StraatixLogo } from '@/components/ui/StraatixLogo';
import { DocumentPreview } from '@/components/ui/DocumentPreview';
import { cn } from '@/lib/utils';

type Position = Tables<'positions'>;
type Company = Tables<'companies'>;

export default function JobApply() {
    const { positionId } = useParams<{ positionId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [position, setPosition] = useState<Position | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        notes: ''
    });

    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!positionId) return;

            try {
                // Fetch position info
                const { data: posData } = await supabase
                    .from('positions')
                    .select('*')
                    .eq('id', positionId)
                    .single();

                if (posData) {
                    setPosition(posData);

                    // Fetch company info
                    const { data: companyData } = await supabase
                        .from('companies')
                        .select('*')
                        .eq('id', posData.company_id)
                        .single();

                    if (companyData) setCompany(companyData);
                }
            } catch (error) {
                console.error('Error fetching job details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [positionId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!position || !formData.name || !formData.email || !file) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields and upload your resume.",
                variant: "destructive"
            });
            return;
        }

        setSubmitting(true);
        try {
            // 1. Upload Resume to 'resumes' bucket
            const fileExt = file.name.split('.').pop();
            const fileName = `${positionId}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(fileName, file, { upsert: true });

            if (uploadError) {
                if (uploadError.message.includes('Bucket not found')) {
                    throw new Error('Resume storage is not configured. Please contact the administrator.');
                }
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('resumes')
                .getPublicUrl(fileName);

            // 2. Insert Candidate
            const { error: insertError } = await supabase
                .from('candidates')
                .insert({
                    position_id: position.id,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || null,
                    linkedin_url: formData.linkedin || null,
                    notes: formData.notes || null,
                    resume_url: publicUrl,
                    status: 'new'
                });

            if (insertError) throw insertError;

            // 3. Notify Company Owner
            if (company.user_id) {
                await (supabase as any)
                    .from('app_notifications')
                    .insert({
                        user_id: company.user_id,
                        title: "New Application Received! 🚀",
                        message: `${formData.name} applied for the ${position.position_name} position.`,
                        type: 'success',
                        action_url: `/positions/${position.id}/candidates`,
                        read: false
                    });
            }

            setSubmitted(true);
            toast({
                title: "Application Submitted!",
                description: "Good luck! The recruiting team will review your profile."
            });
        } catch (error: any) {
            toast({
                title: "Submission Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!position || !company) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Position Not Found</h1>
                <p className="text-muted-foreground mb-6">This job posting is no longer active.</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center animate-in fade-in zoom-in duration-500">
                <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Thank You!</h1>
                <p className="text-slate-600 max-w-md mb-8">
                    Your application for the **{position.position_name}** role at **{company.company_name}** has been received successfully.
                </p>
                <div className="flex gap-4">
                    <Link to={`/careers/${company.id}`}>
                        <Button variant="outline">Back to Careers</Button>
                    </Link>
                    <Link to="/">
                        <StraatixLogo size="sm" showText={false} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="container max-w-6xl mx-auto h-16 flex items-center justify-between px-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Careers
                    </Button>
                    <StraatixLogo size="sm" showText={false} />
                </div>
            </header>

            <main className="container max-w-6xl mx-auto py-8 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Job Details Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl border p-8 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Badge variant="secondary" className="bg-primary/5 text-primary border-0">{position.category}</Badge>
                                <Badge variant="outline" className="border-emerald-200 text-emerald-700">{position.work_type}</Badge>
                            </div>
                            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{position.position_name}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 mb-8 border-b pb-8">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    {company.company_name}
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {position.preferred_locations?.join(', ') || 'Remote'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    {position.min_experience}+ Years
                                </div>
                            </div>

                            {/* JD Content - Paper Style */}
                            <div className="bg-slate-50/50 rounded-xl p-8 border border-dashed relative overflow-hidden">
                                <div className="absolute top-4 right-4 text-[10px] uppercase tracking-widest font-bold text-slate-300 pointer-events-none">
                                    Job Specification
                                </div>
                                <div className="prose prose-slate max-w-none text-slate-600 leading-[1.8]" style={{ fontFamily: 'Archivo, sans-serif' }}>
                                    {position.generated_jd ? (
                                        <div className="space-y-6">
                                            {position.generated_jd.split('\n').map((line, i) => (
                                                <p key={i}>{line}</p>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>Detailed job description pending...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Application Form Section */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24 border-primary/20 shadow-xl shadow-primary/5">
                            <CardHeader className="bg-primary/[0.02] border-b">
                                <CardTitle className="text-xl">Apply Now</CardTitle>
                                <p className="text-xs text-muted-foreground">Complete your application in 2 minutes</p>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                            <User className="h-3 w-3" /> Full Name
                                        </Label>
                                        <Input
                                            id="name"
                                            placeholder="John Doe"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                            <Mail className="h-3 w-3" /> Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                            <Phone className="h-3 w-3" /> Phone Number (Optional)
                                        </Label>
                                        <Input
                                            id="phone"
                                            placeholder="+1 (555) 000-0000"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="linkedin" className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                            <LinkIcon className="h-3 w-3" /> LinkedIn Portfolio
                                        </Label>
                                        <Input
                                            id="linkedin"
                                            placeholder="linkedin.com/in/johndoe"
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="resume" className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 font-primary">
                                            <Upload className="h-3 w-3" /> Resume (Required)
                                        </Label>
                                        <div
                                            className={cn(
                                                "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                                                file ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                                            )}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={handleFileChange}
                                                accept=".pdf,.doc,.docx"
                                            />
                                            {file ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                                    <span className="text-xs font-medium text-emerald-700 truncate max-w-full px-2">{file.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-1">
                                                    <Upload className="h-6 w-6 text-slate-400" />
                                                    <span className="text-[10px] text-slate-500">PDF or Word (Max 5MB)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider">Cover Note (Optional)</Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Tell us why you're a great fit..."
                                            rows={3}
                                            value={formData.notes}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 gap-2 mt-4"
                                        disabled={submitting}
                                    >
                                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        Submit Application
                                    </Button>
                                </form>
                            </CardContent>
                            <CardFooter className="bg-slate-50/50 p-4 border-t">
                                <p className="text-[10px] text-center text-muted-foreground w-full">
                                    By submitting, you agree to our Terms and Privacy Policy.
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
