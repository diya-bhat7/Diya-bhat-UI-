import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLogo } from '@/components/ui/AuthLogo';
import { PasswordStrengthIndicator, PasswordMatchIndicator } from '@/components/ui/PasswordStrength';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, Building2, Globe, Linkedin, MapPin, Mail, User, Briefcase, Loader2, Upload, ImageIcon, X } from 'lucide-react';

const LOCATIONS = [
    'Hyderabad',
    'NCR',
    'Mumbai',
    'Chennai',
    'Pune',
    'Bangalore',
    'Other Cities',
];

export default function Register() {
    const navigate = useNavigate();
    const { signUp, signInWithGoogle } = useAuth();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        companyName: '',
        companyWebsite: '',
        companyLinkedin: '',
        officeLocations: [] as string[],
        contactEmail: '',
        contactTitle: '',
        contactName: '',
        password: '',
        confirmPassword: '',
    });

    const handleLocationToggle = (location: string) => {
        setFormData(prev => ({
            ...prev,
            officeLocations: prev.officeLocations.includes(location)
                ? prev.officeLocations.filter(l => l !== location)
                : [...prev.officeLocations, location],
        }));
    };

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Invalid file type',
                    description: 'Please upload an image file.',
                    variant: 'destructive',
                });
                return;
            }
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'Logo must be under 2MB.',
                    variant: 'destructive',
                });
                return;
            }
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const uploadLogo = async (): Promise<string | null> => {
        if (!logoFile) return null;

        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `logos/${fileName}`;

        const { error } = await supabase.storage
            .from('company-assets')
            .upload(filePath, logoFile);

        if (error) {
            console.error('Logo upload error:', error);
            return null;
        }

        const { data: urlData } = supabase.storage
            .from('company-assets')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: 'Passwords do not match',
                description: 'Please ensure both passwords are the same.',
                variant: 'destructive',
            });
            return;
        }

        if (formData.password.length < 6) {
            toast({
                title: 'Password too short',
                description: 'Password must be at least 6 characters long.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        // Upload logo if provided
        let logoUrl: string | null = null;
        if (logoFile) {
            logoUrl = await uploadLogo();
        }

        const { error } = await signUp(formData.contactEmail, formData.password, {
            company_name: formData.companyName,
            company_website: formData.companyWebsite || null,
            company_linkedin: formData.companyLinkedin || null,
            company_logo: logoUrl,
            office_locations: formData.officeLocations,
            contact_email: formData.contactEmail,
            contact_title: formData.contactTitle || null,
            contact_name: formData.contactName,
        });

        setLoading(false);

        if (error) {
            toast({
                title: 'Registration failed',
                description: error.message,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Registration successful',
                description: 'Welcome to Straatix Partners!',
            });
            navigate('/dashboard');
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: 'var(--gradient-soft)' }}
        >
            {/* Decorative Floating Orbs */}
            <div className="orb orb-1" aria-hidden="true" />
            <div className="orb orb-2" aria-hidden="true" />
            <div className="orb orb-3" aria-hidden="true" />

            <div className="w-full max-w-2xl relative z-10">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex justify-center mb-6">
                        <AuthLogo size="lg" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        <span className="text-gradient">Create Your Account</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Register your company to start hiring the best talent
                    </p>
                </div>

                {/* Registration Form */}
                <Card className="form-card animate-fade-up border-0" style={{ animationDelay: '0.2s' }}>
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl">Company Registration</CardTitle>
                            <CardDescription>Fill in your company and contact details</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-6">
                            {/* Company Information Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Company Information
                                </h3>

                                {/* Company Logo Upload */}
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        Company Logo (Optional)
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        {logoPreview ? (
                                            <div className="relative group">
                                                <div className="h-20 w-20 rounded-xl border-2 border-primary/30 bg-white overflow-hidden shadow-sm">
                                                    <img
                                                        src={logoPreview}
                                                        alt="Company logo preview"
                                                        className="h-full w-full object-contain p-1"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="h-20 w-20 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 bg-muted/50 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                                            >
                                                <Upload className="h-5 w-5 text-muted-foreground" />
                                                <span className="text-[10px] text-muted-foreground">Upload</span>
                                            </button>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">
                                                Upload your company logo. It will appear in the dashboard header.
                                            </p>
                                            <p className="text-xs text-muted-foreground/70 mt-1">
                                                PNG, JPG, or SVG (max 2MB)
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoSelect}
                                        className="hidden"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName" className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            Company Name *
                                        </Label>
                                        <Input
                                            id="companyName"
                                            placeholder="Acme Corporation"
                                            value={formData.companyName}
                                            onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                                            required
                                            className="input-elegant"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="companyWebsite" className="flex items-center gap-2">
                                            <Globe className="h-4 w-4" />
                                            Company Website
                                        </Label>
                                        <Input
                                            id="companyWebsite"
                                            type="url"
                                            placeholder="https://example.com"
                                            value={formData.companyWebsite}
                                            onChange={e => setFormData(prev => ({ ...prev, companyWebsite: e.target.value }))}
                                            className="input-elegant"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="companyLinkedin" className="flex items-center gap-2">
                                        <Linkedin className="h-4 w-4" />
                                        Company LinkedIn
                                    </Label>
                                    <Input
                                        id="companyLinkedin"
                                        type="url"
                                        placeholder="https://linkedin.com/company/..."
                                        value={formData.companyLinkedin}
                                        onChange={e => setFormData(prev => ({ ...prev, companyLinkedin: e.target.value }))}
                                        className="input-elegant"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Office Locations
                                    </Label>
                                    <div className="flex flex-wrap gap-2">
                                        {LOCATIONS.map(location => (
                                            <button
                                                key={location}
                                                type="button"
                                                onClick={() => handleLocationToggle(location)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${formData.officeLocations.includes(location)
                                                    ? 'bg-primary text-primary-foreground shadow-md'
                                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                                    }`}
                                            >
                                                {location}
                                                {formData.officeLocations.includes(location) && (
                                                    <span className="ml-1">×</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Contact Information
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactName" className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Your Name *
                                        </Label>
                                        <Input
                                            id="contactName"
                                            placeholder="John Doe"
                                            value={formData.contactName}
                                            onChange={e => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                                            required
                                            className="input-elegant"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contactTitle" className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4" />
                                            Your Title
                                        </Label>
                                        <Input
                                            id="contactTitle"
                                            placeholder="Head of Talent Acquisition"
                                            value={formData.contactTitle}
                                            onChange={e => setFormData(prev => ({ ...prev, contactTitle: e.target.value }))}
                                            className="input-elegant"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail" className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        Email Address *
                                    </Label>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.contactEmail}
                                        onChange={e => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                                        required
                                        className="input-elegant"
                                    />
                                </div>
                            </div>

                            {/* Password Section */}
                            <div className="space-y-4 pt-4 border-t">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    Create Password
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password *</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                                required
                                                minLength={6}
                                                className="input-elegant pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <PasswordStrengthIndicator password={formData.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                        <Input
                                            id="confirmPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            required
                                            minLength={6}
                                            className="input-elegant"
                                        />
                                        <PasswordMatchIndicator
                                            password={formData.password}
                                            confirmPassword={formData.confirmPassword}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full btn-primary"
                                disabled={loading || googleLoading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>

                            {/* Divider */}
                            <div className="relative w-full">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>

                            {/* Google SSO Button */}
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full gap-2"
                                disabled={loading || googleLoading}
                                onClick={async () => {
                                    setGoogleLoading(true);
                                    const { error } = await signInWithGoogle();
                                    if (error) {
                                        toast({
                                            title: 'Google sign-in failed',
                                            description: error.message,
                                            variant: 'destructive',
                                        });
                                        setGoogleLoading(false);
                                    }
                                }}
                            >
                                {googleLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                )}
                                Continue with Google
                            </Button>

                            <p className="text-sm text-muted-foreground text-center">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary font-medium hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
