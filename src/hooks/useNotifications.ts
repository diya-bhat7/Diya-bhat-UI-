import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    read: boolean;
    actionUrl?: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const { toast } = useToast();
    const { user } = useAuth();

    // Subscribe to new candidates in real-time
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        // Listen for new candidates being added to any of the user's positions
        const channel = supabase
            .channel('new-applicants')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'candidates',
                },
                async (payload) => {
                    const newCandidate = payload.new as any;

                    // Get position details to verify ownership
                    const { data: position } = await supabase
                        .from('positions')
                        .select('position_name, company_id')
                        .eq('id', newCandidate.position_id)
                        .single();

                    if (!position) return;

                    // Get company to verify this is the user's company
                    const { data: company } = await supabase
                        .from('companies')
                        .select('user_id')
                        .eq('id', position.company_id)
                        .single();

                    if (!company || company.user_id !== user.id) return;

                    // Create notification
                    const notification: AppNotification = {
                        id: newCandidate.id,
                        title: "New Application Received! 🚀",
                        message: `${newCandidate.name} applied for ${position.position_name}`,
                        type: 'success',
                        timestamp: newCandidate.created_at,
                        read: false,
                        actionUrl: `/positions/${newCandidate.position_id}/candidates`
                    };

                    setNotifications(prev => [notification, ...prev]);

                    // Show toast for immediate feedback
                    toast({
                        title: notification.title,
                        description: notification.message,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, toast]);

    const addNotification = useCallback((
        title: string,
        message: string,
        type: AppNotification['type'] = 'info',
        actionUrl?: string
    ) => {
        const newNotification: AppNotification = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl,
        };

        setNotifications(prev => [newNotification, ...prev]);

        toast({
            title,
            description: message,
        });
    }, [toast]);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        addNotification,
        markAsRead,
        clearAll,
    };
}
