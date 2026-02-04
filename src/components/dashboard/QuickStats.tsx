import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Briefcase, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickStatsProps {
    totalPositions: number;
    activePositions: number;
    totalRoles: number;
    className?: string;
}

interface StatItemProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    color: string;
}

function StatItem({ icon, label, value, color }: StatItemProps) {
    return (
        <div className="flex items-center gap-3 min-w-0">
            <div className={cn("p-2 rounded-lg shrink-0", color)}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground truncate">{label}</p>
            </div>
        </div>
    );
}

export function QuickStats({
    totalPositions,
    activePositions,
    totalRoles,
    className,
}: QuickStatsProps) {
    const stats = useMemo(() => [
        {
            icon: <Briefcase className="h-4 w-4 text-primary" />,
            label: 'Total Positions',
            value: totalPositions,
            color: 'bg-primary/10',
        },
        {
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
            label: 'Active',
            value: activePositions,
            color: 'bg-emerald-100 dark:bg-emerald-900/30',
        },
        {
            icon: <Users className="h-4 w-4 text-blue-600" />,
            label: 'Total Roles',
            value: totalRoles,
            color: 'bg-blue-100 dark:bg-blue-900/30',
        },
        {
            icon: <Clock className="h-4 w-4 text-amber-600" />,
            label: 'Pending',
            value: totalPositions - activePositions,
            color: 'bg-amber-100 dark:bg-amber-900/30',
        },
    ], [totalPositions, activePositions, totalRoles]);

    if (totalPositions === 0) return null;

    return (
        <Card className={cn("p-4", className)}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {stats.map((stat, index) => (
                    <StatItem
                        key={stat.label}
                        icon={stat.icon}
                        label={stat.label}
                        value={stat.value}
                        color={stat.color}
                    />
                ))}
            </div>
        </Card>
    );
}
