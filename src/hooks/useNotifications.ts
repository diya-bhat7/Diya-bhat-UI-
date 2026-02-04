import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    read: boolean;
    actionUrl?: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { toast } = useToast();

    const addNotification = useCallback((
        title: string,
        message: string,
        type: Notification['type'] = 'info',
        actionUrl?: string
    ) => {
        const newNotification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            message,
            type,
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl,
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Simulate Email Sending
        console.log(`[EMAIL SIMULATION] Sending email notification:
      To: Primary User
      Subject: ${title}
      Body: ${message}
      Link: ${actionUrl || 'N/A'}
    `);

        // Also show a toast for immediate feedback
        toast({
            title: `Notification: ${title}`,
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
