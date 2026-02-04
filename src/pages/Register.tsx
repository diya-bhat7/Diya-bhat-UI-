import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StraatixLogo } from '@/components/ui/StraatixLogo';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Building2, Globe, Linkedin, MapPin, Mail, User, Briefcase, Loader2 } from 'lucide-react';

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
    const { signUp } = useAuth();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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

        const { error } = await signUp(formData.contactEmail, formData.password, {
            company_name: formData.companyName,
            company_website: formData.companyWebsite || null,
            company_linkedin: formData.companyLinkedin || null,
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
                    <div className="flex justify-center mb-4">
                        <StraatixLogo size="lg" />
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
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full btn-primary"
                                disabled={loading}
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
