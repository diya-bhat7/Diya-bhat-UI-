import { useState } from 'react';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CandidateStatusBadge, CandidateStatus } from './CandidateStatusBadge';
import { Candidate } from './CandidateCard';
import { InterviewScorecard, ScorecardSummary } from './InterviewScorecard';
import { useInterviewScorecards, INTERVIEW_ROUNDS } from '@/hooks/useInterviewScorecards';
import {
    Mail,
    Phone,
    Linkedin,
    FileText,
    Star,
    Calendar,
    Clock,
    Edit,
    Trash2,
    ExternalLink,
    User,
    StickyNote,
    ClipboardCheck,
    Plus,
    TrendingUp,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface CandidateDetailModalProps {
    candidate: Candidate | null;
    open: boolean;
    onClose: () => void;
    onEdit: (candidate: Candidate) => void;
    onDelete: (candidate: Candidate) => void;
    onStatusChange: (candidate: Candidate, newStatus: CandidateStatus) => void;
}

// Status progression for quick status changes
const statusOrder: CandidateStatus[] = ['new', 'screening', 'interview', 'offer', 'hired'];

// Status-based colors
const statusColors: Record<CandidateStatus, string> = {
    new: 'bg-blue-500/10 border-blue-500/30',
    screening: 'bg-orange-500/10 border-orange-500/30',
    interview: 'bg-yellow-500/10 border-yellow-500/30',
    offer: 'bg-purple-500/10 border-purple-500/30',
    hired: 'bg-emerald-500/10 border-emerald-500/30',
    rejected: 'bg-red-500/10 border-red-500/30',
};

// Score color helper
function getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
}

export function CandidateDetailModal({
    candidate,
    open,
    onClose,
    onEdit,
    onDelete,
    onStatusChange,
}: CandidateDetailModalProps) {
    const [showScorecardForm, setShowScorecardForm] = useState(false);
    const [selectedRound, setSelectedRound] = useState<string>(INTERVIEW_ROUNDS[0]);
    const [expandedScorecards, setExpandedScorecards] = useState(false);

    const {
        scorecards,
        saveScorecard,
        averageScore,
        totalRounds
    } = useInterviewScorecards(candidate?.id || null);

    if (!candidate) return null;

    const initials = candidate.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const createdDate = new Date(candidate.created_at);
    const updatedDate = new Date(candidate.updated_at);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden flex flex-col">
                {/* Header with gradient accent */}
                <div className={`p-6 border-b ${statusColors[candidate.status]} flex-shrink-0`}>
                    <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 ring-4 ring-background shadow-lg">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <DialogHeader className="space-y-1">
                                <DialogTitle className="text-xl font-bold truncate">
                                    {candidate.name}
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5" />
                                    {candidate.email}
                                </p>
                            </DialogHeader>
                            <div className="flex items-center gap-2 mt-3">
                                <CandidateStatusBadge status={candidate.status} />

                                {/* Show Interview Score Badge if available */}
                                {averageScore !== null && (
                                    <div className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 border",
                                        getScoreColor(averageScore)
                                    )}>
                                        <TrendingUp className="h-3.5 w-3.5" />
                                        <span className="text-xs font-bold">{averageScore}%</span>
                                        <span className="text-[10px] text-muted-foreground">({totalRounds})</span>
                                    </div>
                                )}

                                {/* Legacy star rating */}
                                {candidate.rating && candidate.rating > 0 && !averageScore && (
                                    <div className="flex items-center gap-0.5 bg-yellow-500/15 px-2 py-1 rounded-full">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-3.5 w-3.5 ${i < candidate.rating!
                                                    ? 'text-yellow-500 fill-yellow-500'
                                                    : 'text-yellow-500/30'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Contact Info */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {candidate.phone && (
                                <a
                                    href={`tel:${candidate.phone}`}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                >
                                    <Phone className="h-4 w-4 text-primary" />
                                    <span className="text-sm">{candidate.phone}</span>
                                </a>
                            )}
                            {candidate.linkedin_url && (
                                <a
                                    href={candidate.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                                        <span className="text-sm">LinkedIn Profile</span>
                                    </div>
                                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                </a>
                            )}
                            {candidate.resume_url && (
                                <a
                                    href={candidate.resume_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-emerald-600" />
                                        <span className="text-sm">View Resume</span>
                                    </div>
                                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Interview Scorecards Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4" />
                                Interview Evaluation
                            </h3>
                            {!showScorecardForm && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowScorecardForm(true)}
                                    className="h-7 text-xs"
                                >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add Round
                                </Button>
                            )}
                        </div>

                        {/* Scorecard Form */}
                        {showScorecardForm && (
                            <div className="space-y-3">
                                <Select value={selectedRound} onValueChange={setSelectedRound}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select round type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INTERVIEW_ROUNDS.map((round) => (
                                            <SelectItem key={round} value={round}>
                                                {round}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InterviewScorecard
                                    roundName={selectedRound}
                                    onSave={(data) => {
                                        saveScorecard(data);
                                        setShowScorecardForm(false);
                                    }}
                                    onCancel={() => setShowScorecardForm(false)}
                                />
                            </div>
                        )}

                        {/* Existing Scorecards */}
                        {!showScorecardForm && scorecards.length > 0 && (
                            <div className="space-y-2">
                                {(expandedScorecards ? scorecards : scorecards.slice(0, 2)).map((sc) => (
                                    <ScorecardSummary key={sc.id} data={sc} />
                                ))}
                                {scorecards.length > 2 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setExpandedScorecards(!expandedScorecards)}
                                        className="w-full text-xs text-muted-foreground"
                                    >
                                        {expandedScorecards ? (
                                            <>
                                                <ChevronUp className="h-3 w-3 mr-1" />
                                                Show Less
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="h-3 w-3 mr-1" />
                                                Show {scorecards.length - 2} More
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Empty state */}
                        {!showScorecardForm && scorecards.length === 0 && (
                            <div className="text-center py-6 text-muted-foreground">
                                <ClipboardCheck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                <p className="text-xs">No interview evaluations yet</p>
                                <p className="text-[10px]">Click "Add Round" to rate this candidate</p>
                            </div>
                        )}
                    </div>

                    {/* Notes (Legacy) */}
                    {candidate.notes && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <StickyNote className="h-4 w-4" />
                                Notes
                            </h3>
                            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                                <p className="text-sm whitespace-pre-wrap">{candidate.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Quick Status Change */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Quick Status Change
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {statusOrder.map((status) => (
                                <Button
                                    key={status}
                                    variant={candidate.status === status ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onStatusChange(candidate, status)}
                                    className="capitalize"
                                >
                                    {status}
                                </Button>
                            ))}
                            <Button
                                variant={candidate.status === 'rejected' ? 'destructive' : 'outline'}
                                size="sm"
                                onClick={() => onStatusChange(candidate, 'rejected')}
                                className={candidate.status !== 'rejected' ? 'text-destructive border-destructive/50 hover:bg-destructive/10' : ''}
                            >
                                Rejected
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Timestamps */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Added {format(createdDate, 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Updated {format(updatedDate, 'MMM d, yyyy')}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                onClose();
                                onEdit(candidate);
                            }}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => {
                                onClose();
                                onDelete(candidate);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
