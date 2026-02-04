import { memo, useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { StraatixLogo } from '@/components/ui/StraatixLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, LogOut, User, LayoutDashboard, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Header = memo(function Header() {
    const { user, company, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = useCallback(async () => {
        await signOut();
        navigate('/login');
    }, [signOut, navigate]);

    const handleNavigateProfile = useCallback(() => {
        navigate('/profile');
        setMobileMenuOpen(false);
    }, [navigate]);

    const handleNavigation = useCallback((href: string) => {
        navigate(href);
        setMobileMenuOpen(false);
    }, [navigate]);

    const initials = useMemo(() => {
        if (!company?.contact_name) return '';
        return company.contact_name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }, [company?.contact_name]);

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/candidates', label: 'All Candidates', icon: User },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                {/* Logo and Navigation */}
                <div className="flex items-center gap-8">
                    <Link to="/dashboard" className="flex items-center">
                        <StraatixLogo size="sm" showText={false} />
                    </Link>

                    {/* Desktop Navigation Links */}
                    {user && company && (
                        <nav className="hidden md:flex items-center gap-1">
                            {navLinks.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    to={href}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive(href)
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    )}
                </div>

                {/* Right side: Theme toggle + User Menu + Mobile Menu */}
                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    {/* Desktop User Menu */}
                    {user && company && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="hidden md:flex items-center gap-3 px-3 py-2 h-auto hover:bg-muted">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium hidden sm:inline-block max-w-[140px] truncate">
                                            {company.company_name}
                                        </span>
                                    </div>
                                    <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="flex items-center gap-3 p-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">{company.contact_name}</span>
                                        <span className="text-xs text-muted-foreground truncate max-w-[160px]">{company.contact_email}</span>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleNavigateProfile} className="cursor-pointer py-2">
                                    <User className="mr-2 h-4 w-4" />
                                    Profile Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive py-2">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Mobile Menu */}
                    {user && company && (
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-80">
                                <SheetHeader className="pb-6">
                                    <SheetTitle className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-semibold">{company.contact_name}</span>
                                            <span className="text-xs text-muted-foreground font-normal">{company.company_name}</span>
                                        </div>
                                    </SheetTitle>
                                </SheetHeader>

                                {/* Mobile Navigation */}
                                <nav className="flex flex-col gap-2">
                                    {navLinks.map(({ href, label, icon: Icon }) => (
                                        <button
                                            key={href}
                                            onClick={() => handleNavigation(href)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full text-left",
                                                isActive(href)
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                            {label}
                                        </button>
                                    ))}
                                </nav>

                                <div className="my-4 border-t" />

                                {/* Mobile Profile Actions */}
                                <nav className="flex flex-col gap-2">
                                    <button
                                        onClick={handleNavigateProfile}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full text-left"
                                    >
                                        <User className="h-5 w-5" />
                                        Profile Settings
                                    </button>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Sign out
                                    </button>
                                </nav>

                                {/* Theme Toggle in Mobile */}
                                <div className="mt-6 pt-4 border-t">
                                    <div className="flex items-center justify-between px-4">
                                        <span className="text-sm text-muted-foreground">Theme</span>
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    )}
                </div>
            </div>
        </header>
    );
});
