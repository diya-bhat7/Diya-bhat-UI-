import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Candidate } from './CandidateCard';
import { CandidateStatus, CandidateStatusBadge, CANDIDATE_STATUS_OPTIONS } from './CandidateStatusBadge';
import {
    Users,
    ChevronDown,
    ChevronRight,
    Mail,
    Phone,
    Linkedin,
    FileText,
    Star,
    MoreHorizontal,
    Edit,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CandidateGridProps {
    candidates: Candidate[];
    onClick?: (candidate: Candidate) => void;
    onEdit: (candidate: Candidate) => void;
    onDelete: (candidate: Candidate) => void;
    onStatusChange: (candidate: Candidate, newStatus: CandidateStatus) => void;
}

// Status colors
const statusColors: Record<CandidateStatus, { bg: string; border: string; text: string; accent: string; cardBg: string }> = {
    new: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'bg-blue-500', cardBg: 'bg-blue-50/50' },
    screening: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', accent: 'bg-orange-500', cardBg: 'bg-orange-50/50' },
    interview: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'bg-amber-500', cardBg: 'bg-amber-50/50' },
    offer: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', accent: 'bg-purple-500', cardBg: 'bg-purple-50/50' },
    hired: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'bg-emerald-500', cardBg: 'bg-emerald-50/50' },
    rejected: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', accent: 'bg-red-500', cardBg: 'bg-red-50/50' },
};

const statusAvatarColors: Record<CandidateStatus, string> = {
    new: 'bg-blue-100 text-blue-700',
    screening: 'bg-orange-100 text-orange-700',
    interview: 'bg-amber-100 text-amber-700',
    offer: 'bg-purple-100 text-purple-700',
    hired: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
};

// Status order for quick change
const statusOrder: CandidateStatus[] = ['new', 'screening', 'interview', 'offer', 'hired', 'rejected'];

export function CandidateGrid({
    candidates,
    onClick,
    onEdit,
    onDelete,
    onStatusChange,
}: CandidateGridProps) {
    const [expandedStatuses, setExpandedStatuses] = useState<Set<CandidateStatus>>(new Set(['new', 'screening', 'interview']));

    const candidatesByStatus = useMemo(() => {
        const grouped: Record<CandidateStatus, Candidate[]> = {
            new: [],
            screening: [],
            interview: [],
            offer: [],
            hired: [],
            rejected: [],
        };

        candidates.forEach((candidate) => {
            const status = candidate.status || 'new';
            if (grouped[status]) {
                grouped[status].push(candidate);
            }
        });

        return grouped;
    }, [candidates]);

    const toggleStatus = (status: CandidateStatus) => {
        setExpandedStatuses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(status)) {
                newSet.delete(status);
            } else {
                newSet.add(status);
            }
            return newSet;
        });
    };

    const getInitials = (name: string) => {
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    // Only show statuses that have candidates or are commonly used
    const visibleStatuses = CANDIDATE_STATUS_OPTIONS.filter(
        status => candidatesByStatus[status.value].length > 0 || ['new', 'screening', 'interview'].includes(status.value)
    );

    return (
        <div className="space-y-4">
            {visibleStatuses.map((status) => {
                const colors = statusColors[status.value];
                const count = candidatesByStatus[status.value].length;
                const isExpanded = expandedStatuses.has(status.value);

                return (
                    <div
                        key={status.value}
                        className={cn(
                            "rounded-xl border-2 overflow-hidden transition-all",
                            colors.border,
                            isExpanded ? colors.bg : "bg-white"
                        )}
                    >
                        {/* Row Header */}
                        <button
                            onClick={() => toggleStatus(status.value)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 transition-colors",
                                "hover:bg-black/5"
                            )}
                        >
                            {isExpanded ? (
                                <ChevronDown className={`h-4 w-4 ${colors.text}`} />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                            <span className={`w-2.5 h-2.5 rounded-full ${colors.accent}`} />
                            <h3 className={`font-semibold ${colors.text}`}>
                                {status.label}
                            </h3>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-semibold",
                                colors.bg, colors.text
                            )}>
                                {count}
                            </span>
                        </button>

                        {/* Expanded Grid of Candidate Cards */}
                        {isExpanded && (
                            <div className="px-4 pb-4">
                                {count === 0 ? (
                                    <div className="flex items-center justify-center py-8 text-gray-400 border border-dashed rounded-lg bg-white/50">
                                        <div className="text-center">
                                            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                            <p className="text-sm">No candidates in this stage</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                        {candidatesByStatus[status.value].map((candidate) => (
                                            <Card
                                                key={candidate.id}
                                                className={cn(
                                                    "cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
                                                    "border-gray-200 bg-white"
                                                )}
                                                onClick={() => onClick?.(candidate)}
                                            >
                                                <CardContent className="p-4">
                                                    {/* Header with avatar and actions */}
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <Avatar className={`h-10 w-10 shrink-0 ${statusAvatarColors[candidate.status]}`}>
                                                            <AvatarFallback className={`text-sm font-semibold ${statusAvatarColors[candidate.status]}`}>
                                                                {getInitials(candidate.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-gray-900 truncate">
                                                                {candidate.name}
                                                            </h4>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {candidate.email}
                                                            </p>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                                <DropdownMenuItem onClick={() => onEdit(candidate)}>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {statusOrder.filter(s => s !== candidate.status).map(s => (
                                                                    <DropdownMenuItem
                                                                        key={s}
                                                                        onClick={() => onStatusChange(candidate, s)}
                                                                        className="capitalize"
                                                                    >
                                                                        Move to {s}
                                                                    </DropdownMenuItem>
                                                                ))}
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => onDelete(candidate)}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    {/* Status badge */}
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <CandidateStatusBadge status={candidate.status} />
                                                        {candidate.rating && candidate.rating > 0 && (
                                                            <div className="flex items-center gap-0.5 text-amber-400">
                                                                {[...Array(candidate.rating)].map((_, i) => (
                                                                    <Star key={i} className="h-3 w-3 fill-current" />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Quick info icons */}
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        {candidate.phone && (
                                                            <span title={candidate.phone}>
                                                                <Phone className="h-3.5 w-3.5" />
                                                            </span>
                                                        )}
                                                        {candidate.linkedin_url && (
                                                            <span title="LinkedIn profile">
                                                                <Linkedin className="h-3.5 w-3.5" />
                                                            </span>
                                                        )}
                                                        {candidate.resume_url && (
                                                            <span title="Resume available">
                                                                <FileText className="h-3.5 w-3.5" />
                                                            </span>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Empty state */}
            {candidates.length === 0 && (
                <div className="flex items-center justify-center py-16 text-gray-400 border-2 border-dashed rounded-xl bg-gray-50/50">
                    <div className="text-center">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium text-gray-500">No candidates in pipeline</p>
                    </div>
                </div>
            )}
        </div>
    );
}
