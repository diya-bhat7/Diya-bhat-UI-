import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AppNotification {
    id: string;
    user_id: string;
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

    // Fetch notifications from Supabase
    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        const { data, error } = await (supabase as any)
            .from('app_notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching notifications:', error);
            return;
        }

        if (data) {
            setNotifications(data.map(n => ({
                id: n.id,
                user_id: n.user_id,
                title: n.title,
                message: n.message,
                type: n.type as any,
                timestamp: n.created_at,
                read: n.read,
                actionUrl: n.action_url
            })));
        }
    }, [user]);

    // Initial fetch and Realtime subscription
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        fetchNotifications();

        // Subscribe to new notifications
        const channel = supabase
            .channel('public:app_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'app_notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    const newN = payload.new as any;
                    const notification: AppNotification = {
                        id: newN.id,
                        user_id: newN.user_id,
                        title: newN.title,
                        message: newN.message,
                        type: newN.type as any,
                        timestamp: newN.created_at,
                        read: newN.read,
                        actionUrl: newN.action_url
                    };

                    setNotifications(prev => [notification, ...prev]);

                    // Show toast for new real-time alerts
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
    }, [user, fetchNotifications, toast]);

    const addNotification = useCallback(async (
        title: string,
        message: string,
        type: AppNotification['type'] = 'info',
        actionUrl?: string,
        targetUserId?: string
    ) => {
        const userIdToUse = targetUserId || user?.id;
        if (!userIdToUse) return;

        const { error } = await (supabase as any)
            .from('app_notifications')
            .insert({
                user_id: userIdToUse,
                title,
                message,
                type,
                action_url: actionUrl,
                read: false
            });

        if (error) {
            console.error('Error adding notification:', error);
        }
    }, [user]);

    const markAsRead = useCallback(async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

        const { error } = await (supabase as any)
            .from('app_notifications')
            .update({ read: true })
            .eq('id', id);

        if (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    const clearAll = useCallback(async () => {
        if (!user) return;
        setNotifications([]);

        const { error } = await (supabase as any)
            .from('app_notifications')
            .delete()
            .eq('user_id', user.id);

        if (error) {
            console.error('Error clearing notifications:', error);
        }
    }, [user]);

    return {
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        addNotification,
        markAsRead,
        clearAll,
    };
}
