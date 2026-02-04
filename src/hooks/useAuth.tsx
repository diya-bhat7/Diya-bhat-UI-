/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Company = Tables<'companies'>;

interface AuthContextType {
    user: User | null;
    session: Session | null;
    company: Company | null;
    loading: boolean;
    signUp: (email: string, password: string, companyData: Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    refreshCompany: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCompany = useCallback(async (userId: string) => {
        try {
            // Create timeout promise (10 seconds)
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out after 10s')), 10000)
            );

            // Create query promise
            const queryPromise = supabase
                .from('companies')
                .select('*')
                .eq('user_id', userId)
                .single();

            // Race between query and timeout
            const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

            if (error) {
                // PGRST116 means no rows found - this is normal for new users
                if (error.code === 'PGRST116') {
                    console.log('No company found for user - will be created on registration');
                    setCompany(null);
                } else {
                    console.error('fetchCompany error:', error.message);
                }
                return;
            }

            if (data) {
                setCompany(data);
            }
        } catch (err: any) {
            console.error('fetchCompany error:', err.message || err);
        }
    }, []);

    const refreshCompany = useCallback(async () => {
        if (user) {
            await fetchCompany(user.id);
        }
    }, [user, fetchCompany]);

    // Session timeout logic
    useEffect(() => {
        if (!user) return;

        const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
        let timeoutId: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(async () => {
                // Check if we still have a session before signing out
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    await supabase.auth.signOut();
                    setCompany(null);
                    // Optional: You could show a toast here via a global event or similar
                }
            }, INACTIVITY_TIMEOUT);
        };

        // Events to listen for activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        // Initial timer
        resetTimer();

        // Event listeners
        const handleActivity = () => {
            resetTimer();
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            clearTimeout(timeoutId);
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [user, fetchCompany]); // Re-run when user changes

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Add timeout to prevent hanging if Supabase connection fails
                const timeoutPromise = new Promise<{ data: { session: null }, error: Error }>((resolve) =>
                    setTimeout(() => resolve({ 
                        data: { session: null }, 
                        error: new Error('Auth initialization timed out after 5s') 
                    }), 5000)
                );

                const sessionPromise = supabase.auth.getSession();
                const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
                
                if (error) {
                    console.error('Error getting session:', error);
                    setLoading(false);
                    return;
                }
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchCompany(session.user.id);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchCompany(session.user.id);
                } else {
                    setCompany(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [fetchCompany]);

    const signUp = useCallback(async (
        email: string,
        password: string,
        companyData: Omit<Company, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ) => {
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('No user returned from sign up');

            // Create company record
            const { error: companyError } = await supabase
                .from('companies')
                .insert({
                    ...companyData,
                    user_id: authData.user.id,
                });

            if (companyError) throw companyError;

            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    }, []);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        setCompany(null);
    }, []);

    // Memoize context value to prevent unnecessary re-renders
    const value = useMemo(() => ({
        user,
        session,
        company,
        loading,
        signUp,
        signIn,
        signOut,
        refreshCompany,
    }), [user, session, company, loading, signUp, signIn, signOut, refreshCompany]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

