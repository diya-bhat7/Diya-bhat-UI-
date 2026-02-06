import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateCompany, useCreateCompany } from '@/hooks/useCompany';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    Building2, Globe, Linkedin, MapPin, Mail, User, Briefcase,
    Loader2, ArrowLeft, Save, Pencil, X, ImagePlus, Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LOCATIONS = [
    'Hyderabad',
    'NCR',
    'Mumbai',
    'Chennai',
    'Pune',
    'Bangalore',
    'Other Cities',
];

export default function Profile() {
    const navigate = useNavigate();
    const { user, company, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);

    // React Query mutation for updating company
    const updateCompany = useUpdateCompany();
    const createCompany = useCreateCompany();

    const [formData, setFormData] = useState({
        companyName: '',
        companyWebsite: '',
        companyLinkedin: '',
        officeLocations: [] as string[],
        contactEmail: '',
        contactTitle: '',
        contactName: '',
    });

    // Logo upload state
    const logoInputRef = useRef<HTMLInputElement>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);

    // Redirect to login if not authenticated
    if (!authLoading && !user) {
        return <Navigate to="/login" replace />;
    }

    // Populate form when company data is available
    useEffect(() => {
        if (company) {
            setFormData({
                companyName: company.company_name || '',
                companyWebsite: company.company_website || '',
                companyLinkedin: company.company_linkedin || '',
                officeLocations: company.office_locations || [],
                contactEmail: company.contact_email || '',
                contactTitle: company.contact_title || '',
                contactName: company.contact_name || '',
            });
            // Set current logo URL
            setCurrentLogoUrl(company.company_logo || null);
        }
    }, [company]);

    // Logo file selection handler
    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast({
                title: 'Invalid file type',
                description: 'Please upload a PNG, JPG, SVG, or WebP image.',
                variant: 'destructive',
            });
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: 'File too large',
                description: 'Please upload an image smaller than 2MB.',
                variant: 'destructive',
            });
            return;
        }

        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
    };

    // Remove selected logo
    const handleRemoveLogo = () => {
        setLogoFile(null);
        setLogoPreview(null);
        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    // Upload logo to Supabase storage
    const uploadLogo = async (): Promise<string | null> => {
        if (!logoFile || !user) return null;

        setUploadingLogo(true);
        try {
            const fileExt = logoFile.name.split('.').pop();
            const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('company-assets')
                .upload(fileName, logoFile, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('company-assets')
                .getPublicUrl(fileName);

            return data.publicUrl;
        } catch (error: any) {
            toast({
                title: 'Logo upload failed',
                description: error.message,
                variant: 'destructive',
            });
            return null;
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleLocationToggle = (location: string) => {
        setFormData(prev => ({
            ...prev,
            officeLocations: prev.officeLocations.includes(location)
                ? prev.officeLocations.filter(l => l !== location)
                : [...prev.officeLocations, location],
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let logoUrl = currentLogoUrl;

            // 1. Upload new logo if selected
            if (logoFile) {
                const uploadedUrl = await uploadLogo();
                if (uploadedUrl) {
                    logoUrl = uploadedUrl;
                }
            }

            // 2. Update company record
            if (company) {
                await updateCompany.mutateAsync({
                    id: company.id,
                    company_name: formData.companyName,
                    company_website: formData.companyWebsite || null,
                    company_linkedin: formData.companyLinkedin || null,
                    company_logo: logoUrl,
                    office_locations: formData.officeLocations,
                    contact_title: formData.contactTitle || null,
                    contact_name: formData.contactName,
                });
            } else {
                await createCompany.mutateAsync({
                    company_name: formData.companyName,
                    company_website: formData.companyWebsite || null,
                    company_linkedin: formData.companyLinkedin || null,
                    company_logo: logoUrl,
                    office_locations: formData.officeLocations,
                    contact_email: formData.contactEmail,
                    contact_title: formData.contactTitle || null,
                    contact_name: formData.contactName,
                });
            }

            toast({
                title: company ? 'Profile updated' : 'Profile created',
                description: `Your company profile has been ${company ? 'saved' : 'created'} successfully.`,
            });
            setIsEditing(false);
            setLogoFile(null);
            setLogoPreview(null);
        } catch (error: any) {
            toast({
                title: company ? 'Update failed' : 'Creation failed',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    const handleCancelEdit = () => {
        // Reset form data to original company data
        if (company) {
            setFormData({
                companyName: company.company_name || '',
                companyWebsite: company.company_website || '',
                companyLinkedin: company.company_linkedin || '',
                officeLocations: company.office_locations || [],
                contactEmail: company.contact_email || '',
                contactTitle: company.contact_title || '',
                contactName: company.contact_name || '',
            });
        }
        setIsEditing(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Read-only view component
    const ProfileViewMode = () => (
        <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>
                        Your company details visible to our team
                    </CardDescription>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                >
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                </Button>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Company Information Section */}
                {/* Company Logo Display */}
                <div className="flex items-center gap-4 py-2">
                    <Avatar className="h-20 w-20 ring-2 ring-primary/10">
                        {currentLogoUrl ? (
                            <AvatarImage
                                src={currentLogoUrl}
                                alt={formData.companyName}
                                className="object-contain p-1"
                            />
                        ) : null}
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium">Company Logo</h4>
                        <p className="text-xs text-muted-foreground">
                            This logo appears in your dashboard header and documents.
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Company Name
                            </p>
                            <p className="font-medium">{formData.companyName || '—'}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Company Website
                            </p>
                            <p className="font-medium">
                                {formData.companyWebsite ? (
                                    <a
                                        href={formData.companyWebsite}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        {formData.companyWebsite}
                                    </a>
                                ) : '—'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Linkedin className="h-4 w-4" />
                            Company LinkedIn
                        </p>
                        <p className="font-medium">
                            {formData.companyLinkedin ? (
                                <a
                                    href={formData.companyLinkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    {formData.companyLinkedin}
                                </a>
                            ) : '—'}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Office Locations
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {formData.officeLocations.length > 0 ? (
                                formData.officeLocations.map(location => (
                                    <span
                                        key={location}
                                        className="px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                                    >
                                        {location}
                                    </span>
                                ))
                            ) : (
                                <span className="text-muted-foreground">No locations specified</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Information Section */}
                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Contact Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Your Name
                            </p>
                            <p className="font-medium">{formData.contactName || '—'}</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                Your Title
                            </p>
                            <p className="font-medium">{formData.contactTitle || '—'}</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Email Address
                        </p>
                        <p className="font-medium">{formData.contactEmail || '—'}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    // Edit mode component (existing form)
    const ProfileEditMode = () => (
        <Card className="border-border/50">
            <form onSubmit={handleSubmit}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Edit Company Information</CardTitle>
                        <CardDescription>
                            Update your company details visible to our team
                        </CardDescription>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="gap-2"
                    >
                        <X className="h-4 w-4" />
                        Cancel
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Company Logo Upload Section */}
                    <div className="space-y-4">
                        <Label className="flex items-center gap-2">
                            <ImagePlus className="h-4 w-4" />
                            Company Logo
                        </Label>
                        <div className="flex items-center gap-6">
                            <div className="relative group">
                                <Avatar className="h-24 w-24 ring-4 ring-primary/5">
                                    {logoPreview || currentLogoUrl ? (
                                        <AvatarImage
                                            src={logoPreview || currentLogoUrl || ''}
                                            className="object-contain p-1.5"
                                        />
                                    ) : null}
                                    <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                                        <Building2 className="h-10 w-10" />
                                    </AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute inset-0 bg-black/20 rounded-full" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => logoInputRef.current?.click()}
                                        disabled={uploadingLogo}
                                        className="h-9"
                                    >
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Logo
                                    </Button>
                                    {(logoPreview || currentLogoUrl) && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                if (logoPreview) {
                                                    handleRemoveLogo();
                                                } else {
                                                    setCurrentLogoUrl(null);
                                                }
                                            }}
                                            className="h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Recommended: Square PNG or SVG, max 2MB
                                </p>
                            </div>
                            <input
                                type="file"
                                ref={logoInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleLogoSelect}
                            />
                        </div>
                    </div>

                    <div className="my-6 border-t" />

                    {/* Company Information Section */}
                    <div className="space-y-4">
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
                                    className="bg-background"
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
                                    className="bg-background"
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
                                className="bg-background"
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
                                    className="bg-background"
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
                                    className="bg-background"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contactEmail" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Address
                            </Label>
                            <Input
                                id="contactEmail"
                                type="email"
                                value={formData.contactEmail}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                Email cannot be changed. Contact support if you need to update it.
                            </p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={updateCompany.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="btn-primary"
                        disabled={updateCompany.isPending}
                    >
                        {updateCompany.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-2xl pb-20 md:pb-8">
                {/* Back Link */}
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>

                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">
                        Company Profile
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isEditing ? 'Edit your company information' : 'View your company information and contact details'}
                    </p>
                </div>

                {/* Conditional render based on editing state */}
                {!company && !isEditing ? (
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                No Profile Found
                            </CardTitle>
                            <CardDescription>
                                You haven't set up your company profile yet. Please create one to manage your positions and candidates.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button onClick={() => setIsEditing(true)} className="btn-primary w-full">
                                Create Company Profile
                            </Button>
                        </CardFooter>
                    </Card>
                ) : isEditing ? (
                    <ProfileEditMode />
                ) : (
                    <ProfileViewMode />
                )}
            </main>
        </div>
    );
}
