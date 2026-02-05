import { Bell, Check, Trash2, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications, type AppNotification } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export function NotificationCenter() {
    const { notifications, unreadCount, markAsRead, clearAll } = useNotifications();

    const getIcon = (type: AppNotification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 transition-colors">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-background"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80 p-0 shadow-2xl border-border/50 rounded-2xl overflow-hidden">
                <div className="p-4 flex items-center justify-between bg-muted/30 border-b">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="rounded-full px-1.5 h-4 text-[10px] font-bold">
                                {unreadCount}
                            </Badge>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-red-500" onClick={clearAll}>
                            <Trash2 className="h-3 w-3 mr-1" />
                            Clear all
                        </Button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                                <Bell className="h-6 w-6 text-muted-foreground/30" />
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className={cn(
                                    "p-4 border-b flex gap-3 transition-colors cursor-default",
                                    !n.read ? "bg-primary/5" : "hover:bg-muted/30"
                                )}
                                onMouseEnter={() => !n.read && markAsRead(n.id)}
                            >
                                <div className="mt-0.5">{getIcon(n.type)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className={cn("text-xs font-bold truncate", !n.read ? "text-foreground" : "text-muted-foreground")}>
                                            {n.title}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                        {n.message}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-2 border-t">
                        <Button variant="ghost" className="w-full text-xs h-8 text-muted-foreground">
                            View all activities
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
