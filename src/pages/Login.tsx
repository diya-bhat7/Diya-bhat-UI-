import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthLogo } from '@/components/ui/AuthLogo';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Loader2 } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await signIn(formData.email, formData.password);

        setLoading(false);

        if (error) {
            toast({
                title: 'Login failed',
                description: error.message,
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Welcome back!',
                description: 'You have been successfully logged in.',
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

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex justify-center mb-6">
                        <AuthLogo size="lg" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        <span className="text-gradient">Welcome Back</span>
                    </h1>
                    <p className="text-muted-foreground">
                        Sign in to access your hiring dashboard
                    </p>
                </div>

                {/* Login Form */}
                <Card className="form-card animate-fade-up border-0" style={{ animationDelay: '0.2s' }}>
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl">Sign In</CardTitle>
                            <CardDescription>Enter your credentials to continue</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    required
                                    className="input-elegant"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                        required
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
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>

                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary hover:underline"
                            >
                                Forgot your password?
                            </Link>

                            <p className="text-sm text-muted-foreground text-center">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary font-medium hover:underline">
                                    Register your company
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>

                {/* Footer */}
                <p
                    className="text-center text-sm text-muted-foreground mt-8 animate-fade-up"
                    style={{ animationDelay: '0.3s' }}
                >
                    ✨ Secure login powered by Straatix Partners
                </p>
            </div>
        </div>
    );
}
