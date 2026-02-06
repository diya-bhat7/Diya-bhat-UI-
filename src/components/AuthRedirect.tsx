import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * AuthRedirect - Redirects users based on authentication status
 * - Authenticated users → Dashboard
 * - Unauthenticated users → Login page
 */
export function AuthRedirect() {
    const { user, loading } = useAuth();

    // Show loading spinner while checking auth status
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect based on auth status
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/login" replace />;
}
