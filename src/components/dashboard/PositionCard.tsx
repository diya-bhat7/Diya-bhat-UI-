import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    MapPin,
    Users,
    Calendar,
    Briefcase,
    Clock,
    Edit,
    Building2,
    UserSearch
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { candidateKeys } from '@/hooks/useCandidates';
import { supabase } from '@/integrations/supabase/client';
import { LastUpdated } from '@/components/ui/RelativeTime';

type Position = Tables<'positions'>;

interface PositionCardProps {
    position: Position;
    onEdit: (position: Position) => void;
    candidateCount?: number;
}

const priorityColors: Record<string, string> = {
    Critical: 'bg-red-500/10 text-red-600 border-red-200',
    High: 'bg-orange-500/10 text-orange-600 border-orange-200',
    Medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    Low: 'bg-green-500/10 text-green-600 border-green-200',
};

const statusColors: Record<string, string> = {
    draft: 'bg-gray-500/10 text-gray-600 border-gray-200',
    active: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    closed: 'bg-slate-500/10 text-slate-600 border-slate-200',
};

const categoryIcons: Record<string, string> = {
    Engineering: '💻',
    'Product Management': '📊',
    'UX Design': '🎨',
    QA: '🧪',
    SRE: '🔧',
    DevOps: '⚙️',
};

export function PositionCard({ position, onEdit, candidateCount }: PositionCardProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Prefetch candidates when hovering over a position card
    const prefetchCandidates = () => {
        queryClient.prefetchQuery({
            queryKey: candidateKeys.list(position.id),
            queryFn: async () => {
                const { data } = await supabase
                    .from('candidates')
                    .select('*')
                    .eq('position_id', position.id)
                    .order('created_at', { ascending: false });
                return data || [];
            },
            staleTime: 1000 * 60 * 5, // 5 minutes
        });
    };

    return (
        <Card
            className="group hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 ease-out border-border/50 hover:border-primary/30 overflow-hidden"
            onMouseEnter={prefetchCandidates}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{categoryIcons[position.category] || '📋'}</span>
                            <Badge variant="secondary" className="text-xs font-medium">
                                {position.category}
                            </Badge>
                        </div>
                        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                            {position.position_name}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className={`${priorityColors[position.priority] || priorityColors.Medium} border text-xs`}>
                            {position.priority}
                        </Badge>
                        <Badge className={`${statusColors[position.status || 'draft']} border text-xs capitalize`}>
                            {position.status || 'draft'}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pb-3 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{position.min_experience} - {position.max_experience} years</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{position.num_roles} role{position.num_roles > 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{position.work_type}</span>
                    </div>

                    {position.in_office_days && position.work_type !== 'Remote' && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{position.in_office_days} days/week</span>
                        </div>
                    )}
                </div>

                {position.preferred_locations && position.preferred_locations.length > 0 && (
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                            {position.preferred_locations.slice(0, 3).map((location, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                    {location}
                                </Badge>
                            ))}
                            {position.preferred_locations.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{position.preferred_locations.length - 3} more
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {position.hiring_start_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Hiring from {format(new Date(position.hiring_start_date), 'MMM d, yyyy')}</span>
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-3 border-t flex items-center gap-2">
                {position.updated_at && (
                    <LastUpdated date={position.updated_at} className="text-muted-foreground" />
                )}
                <Button
                    variant="ghost"
                    size="sm"
                    className="group-hover:bg-blue-500/10 transition-colors text-blue-600"
                    onClick={() => navigate(`/positions/${position.id}/candidates`)}
                >
                    <UserSearch className="h-4 w-4 mr-2" />
                    Candidates
                    {candidateCount !== undefined && candidateCount > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-xs font-semibold bg-blue-500/20 rounded-full">
                            {candidateCount}
                        </span>
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto group-hover:bg-primary/10 transition-colors"
                    onClick={() => onEdit(position)}
                >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                </Button>
            </CardFooter>
        </Card>
    );
}
