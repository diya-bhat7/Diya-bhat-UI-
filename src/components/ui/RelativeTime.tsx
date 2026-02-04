import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface RelativeTimeProps {
    date: string | Date;
    prefix?: string;
    className?: string;
    showTooltip?: boolean;
}

export function RelativeTime({
    date,
    prefix = '',
    className,
    showTooltip = true,
}: RelativeTimeProps) {
    const formattedTime = useMemo(() => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return formatDistanceToNow(dateObj, { addSuffix: true });
    }, [date]);

    const fullDate = useMemo(() => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleString();
    }, [date]);

    return (
        <span
            className={cn('text-muted-foreground', className)}
            title={showTooltip ? fullDate : undefined}
        >
            {prefix}{formattedTime}
        </span>
    );
}

// Simple text component showing "Updated X ago"
interface LastUpdatedProps {
    date: string | Date;
    className?: string;
}

export function LastUpdated({ date, className }: LastUpdatedProps) {
    return (
        <RelativeTime
            date={date}
            prefix="Updated "
            className={cn('text-xs', className)}
        />
    );
}
