import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { CandidateCard, Candidate } from './CandidateCard';
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
    Calendar,
    StickyNote,
    Edit,
    Trash2,
    ExternalLink,
    X
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CopyText } from '@/components/ui/CopyButton';

interface CandidateKanbanProps {
    candidates: Candidate[];
    onClick?: (candidate: Candidate) => void;
    onEdit: (candidate: Candidate) => void;
    onDelete: (candidate: Candidate) => void;
    onStatusChange: (candidate: Candidate, newStatus: CandidateStatus) => void;
}

// Status colors
const statusColors: Record<CandidateStatus, { bg: string; border: string; text: string; accent: string }> = {
    new: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'bg-blue-500' },
    screening: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', accent: 'bg-orange-500' },
    interview: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'bg-amber-500' },
    offer: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', accent: 'bg-purple-500' },
    hired: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', accent: 'bg-emerald-500' },
    rejected: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', accent: 'bg-red-500' },
};

const statusAvatarColors: Record<CandidateStatus, string> = {
    new: 'bg-blue-100 text-blue-700',
    screening: 'bg-orange-100 text-orange-700',
    interview: 'bg-amber-100 text-amber-700',
    offer: 'bg-purple-100 text-purple-700',
    hired: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
};

// Status order for quick change buttons
const statusOrder: CandidateStatus[] = ['new', 'screening', 'interview', 'offer', 'hired'];

export function CandidateKanban({
    candidates,
    onClick,
    onEdit,
    onDelete,
    onStatusChange,
}: CandidateKanbanProps) {
    const [expandedStatus, setExpandedStatus] = useState<CandidateStatus | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

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

    const handleStatusClick = (status: CandidateStatus) => {
        if (expandedStatus === status) {
            setExpandedStatus(null);
            setSelectedCandidate(null);
        } else {
            setExpandedStatus(status);
            // Auto-select first candidate in the list
            const firstCandidate = candidatesByStatus[status][0];
            setSelectedCandidate(firstCandidate || null);
        }
    };

    const handleCandidateSelect = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
    };

    const getInitials = (name: string) => {
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className="space-y-3">
            {/* Status Pills Row */}
            <div className="flex flex-wrap gap-2">
                {CANDIDATE_STATUS_OPTIONS.map((status) => {
                    const colors = statusColors[status.value];
                    const count = candidatesByStatus[status.value].length;
                    const isExpanded = expandedStatus === status.value;

                    return (
                        <button
                            key={status.value}
                            onClick={() => handleStatusClick(status.value)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                                "hover:shadow-sm cursor-pointer text-sm",
                                isExpanded
                                    ? `${colors.bg} ${colors.border} shadow-sm`
                                    : "bg-white border-gray-200 hover:border-gray-300"
                            )}
                        >
                            {isExpanded ? (
                                <ChevronDown className={`h-3.5 w-3.5 ${colors.text}`} />
                            ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                            )}
                            <span className={`w-2 h-2 rounded-full ${colors.accent}`} />
                            <span className={cn(
                                "font-medium",
                                isExpanded ? colors.text : "text-gray-700"
                            )}>
                                {status.label}
                            </span>
                            <span className={cn(
                                "px-1.5 py-0.5 rounded text-xs font-semibold",
                                isExpanded ? `${colors.bg} ${colors.text}` : "bg-gray-100 text-gray-600"
                            )}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Expanded Master-Detail View */}
            {expandedStatus && (
                <div className={cn(
                    "rounded-xl border-2 overflow-hidden",
                    statusColors[expandedStatus].bg,
                    statusColors[expandedStatus].border
                )}>
                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-inherit">
                        <span className={`w-2.5 h-2.5 rounded-full ${statusColors[expandedStatus].accent}`} />
                        <h3 className={`font-semibold ${statusColors[expandedStatus].text}`}>
                            {CANDIDATE_STATUS_OPTIONS.find(s => s.value === expandedStatus)?.label}
                        </h3>
                        <span className={`text-sm ${statusColors[expandedStatus].text} opacity-70`}>
                            ({candidatesByStatus[expandedStatus].length} candidates)
                        </span>
                    </div>

                    {candidatesByStatus[expandedStatus].length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <Users className="h-10 w-10 mb-2 opacity-40" />
                            <p className="text-sm">No candidates in this stage</p>
                        </div>
                    ) : (
                        <div className="flex min-h-[350px]">
                            {/* Left: Candidate List */}
                            <div className="w-64 shrink-0 border-r border-inherit bg-white/50">
                                <ScrollArea className="h-[350px]">
                                    <div className="p-2 space-y-1">
                                        {candidatesByStatus[expandedStatus].map((candidate) => (
                                            <button
                                                key={candidate.id}
                                                onClick={() => handleCandidateSelect(candidate)}
                                                className={cn(
                                                    "w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-all",
                                                    selectedCandidate?.id === candidate.id
                                                        ? "bg-white shadow-sm border border-gray-200"
                                                        : "hover:bg-white/80"
                                                )}
                                            >
                                                <Avatar className={`h-8 w-8 shrink-0 ${statusAvatarColors[candidate.status]}`}>
                                                    <AvatarFallback className={`text-xs font-semibold ${statusAvatarColors[candidate.status]}`}>
                                                        {getInitials(candidate.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium text-gray-800 truncate">
                                                    {candidate.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Right: Candidate Details */}
                            <div className="flex-1 bg-white">
                                {selectedCandidate ? (
                                    <ScrollArea className="h-[350px]">
                                        <div className="p-5">
                                            {/* Profile Header */}
                                            <div className="flex items-start gap-4 mb-5">
                                                <Avatar className={`h-14 w-14 ${statusAvatarColors[selectedCandidate.status]}`}>
                                                    <AvatarFallback className={`text-lg font-bold ${statusAvatarColors[selectedCandidate.status]}`}>
                                                        {getInitials(selectedCandidate.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <h2 className="text-lg font-bold text-gray-900">
                                                        {selectedCandidate.name}
                                                    </h2>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1.5">
                                                        <Mail className="h-3.5 w-3.5 shrink-0" />
                                                        <CopyText text={selectedCandidate.email} className="text-gray-500" />
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <CandidateStatusBadge status={selectedCandidate.status} />
                                                        {selectedCandidate.rating && selectedCandidate.rating > 0 && (
                                                            <div className="flex items-center gap-0.5">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`h-3.5 w-3.5 ${i < selectedCandidate.rating!
                                                                            ? 'text-amber-400 fill-amber-400'
                                                                            : 'text-gray-200'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onEdit(selectedCandidate)}
                                                    >
                                                        <Edit className="h-3.5 w-3.5 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 hover:bg-red-50"
                                                        onClick={() => onDelete(selectedCandidate)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <Separator className="my-4" />

                                            {/* Contact & Links */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                                                {selectedCandidate.phone && (
                                                    <a
                                                        href={`tel:${selectedCandidate.phone}`}
                                                        className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <Phone className="h-4 w-4 text-gray-500" />
                                                        <span className="text-sm">{selectedCandidate.phone}</span>
                                                    </a>
                                                )}
                                                {selectedCandidate.linkedin_url && (
                                                    <a
                                                        href={selectedCandidate.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 p-3 rounded-lg bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 transition-colors"
                                                    >
                                                        <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                                                        <span className="text-sm">LinkedIn</span>
                                                        <ExternalLink className="h-3 w-3 text-gray-400 ml-auto" />
                                                    </a>
                                                )}
                                                {selectedCandidate.resume_url && (
                                                    <a
                                                        href={selectedCandidate.resume_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                                    >
                                                        <FileText className="h-4 w-4 text-emerald-600" />
                                                        <span className="text-sm">Resume</span>
                                                        <ExternalLink className="h-3 w-3 text-gray-400 ml-auto" />
                                                    </a>
                                                )}
                                            </div>

                                            {/* Notes */}
                                            {selectedCandidate.notes && (
                                                <div className="mb-5">
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                                        <StickyNote className="h-3.5 w-3.5" />
                                                        Notes
                                                    </h4>
                                                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                                                        {selectedCandidate.notes}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Quick Status Change */}
                                            <div>
                                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                                    Change Status
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {statusOrder.map((status) => (
                                                        <Button
                                                            key={status}
                                                            variant={selectedCandidate.status === status ? 'default' : 'outline'}
                                                            size="sm"
                                                            onClick={() => onStatusChange(selectedCandidate, status)}
                                                            className="text-xs capitalize"
                                                        >
                                                            {status}
                                                        </Button>
                                                    ))}
                                                    <Button
                                                        variant={selectedCandidate.status === 'rejected' ? 'destructive' : 'outline'}
                                                        size="sm"
                                                        onClick={() => onStatusChange(selectedCandidate, 'rejected')}
                                                        className={cn(
                                                            "text-xs",
                                                            selectedCandidate.status !== 'rejected' && "text-red-600 border-red-200 hover:bg-red-50"
                                                        )}
                                                    >
                                                        Rejected
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Timestamps */}
                                            <div className="flex items-center gap-4 mt-5 pt-4 border-t text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    Added {format(new Date(selectedCandidate.created_at), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400">
                                        <p className="text-sm">Select a candidate to view details</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Prompt when nothing is expanded */}
            {!expandedStatus && (
                <div className="flex items-center justify-center py-16 text-gray-400 border-2 border-dashed rounded-xl bg-gray-50/50">
                    <div className="text-center">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium text-gray-500">Click on a status above to view candidates</p>
                        <p className="text-xs mt-1">Total: {candidates.length} candidates in pipeline</p>
                    </div>
                </div>
            )}
        </div>
    );
}
