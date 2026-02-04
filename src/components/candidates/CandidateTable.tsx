import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CandidateStatusBadge, CandidateStatus } from './CandidateStatusBadge';
import { Candidate } from './CandidateCard';
import {
    Phone,
    Linkedin,
    FileText,
    Star,
    MoreHorizontal,
    Edit,
    Trash2,
    ExternalLink,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CandidateTableProps {
    candidates: Candidate[];
    onClick?: (candidate: Candidate) => void;
    onEdit: (candidate: Candidate) => void;
    onDelete: (candidate: Candidate) => void;
    onStatusChange: (candidate: Candidate, newStatus: CandidateStatus) => void;
}

// Status-based colors for avatar
const statusAvatarColors: Record<CandidateStatus, string> = {
    new: 'bg-blue-500/15 text-blue-600',
    screening: 'bg-orange-500/15 text-orange-600',
    interview: 'bg-yellow-500/15 text-yellow-700',
    offer: 'bg-purple-500/15 text-purple-600',
    hired: 'bg-emerald-500/15 text-emerald-600',
    rejected: 'bg-red-500/15 text-red-600',
};

export function CandidateTable({
    candidates,
    onClick,
    onEdit,
    onDelete,
    onStatusChange,
}: CandidateTableProps) {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[280px]">Candidate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Rating</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {candidates.map((candidate) => {
                        const createdDate = new Date(candidate.created_at);

                        return (
                            <TableRow
                                key={candidate.id}
                                className="group cursor-pointer hover:bg-muted/30 transition-colors"
                                onClick={() => onClick?.(candidate)}
                            >
                                {/* Candidate Info */}
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className={`h-10 w-10 ${statusAvatarColors[candidate.status]}`}>
                                            <AvatarFallback className={statusAvatarColors[candidate.status]}>
                                                {getInitials(candidate.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                                {candidate.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {candidate.email}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Status */}
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <CandidateStatusBadge status={candidate.status} />
                                </TableCell>

                                {/* Rating */}
                                <TableCell>
                                    <div className="flex items-center justify-center gap-0.5">
                                        {candidate.rating && candidate.rating > 0 ? (
                                            <>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-3.5 w-3.5 ${i < candidate.rating!
                                                                ? 'text-yellow-500 fill-yellow-500'
                                                                : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Contact Links */}
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-1">
                                        {candidate.phone && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                asChild
                                            >
                                                <a href={`tel:${candidate.phone}`} title={candidate.phone}>
                                                    <Phone className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                        {candidate.linkedin_url && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:text-[#0A66C2]"
                                                asChild
                                            >
                                                <a
                                                    href={candidate.linkedin_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="LinkedIn"
                                                >
                                                    <Linkedin className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                        {candidate.resume_url && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:text-emerald-600"
                                                asChild
                                            >
                                                <a
                                                    href={candidate.resume_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    title="Resume"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        )}
                                        {!candidate.phone && !candidate.linkedin_url && !candidate.resume_url && (
                                            <span className="text-xs text-muted-foreground">-</span>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Added Date */}
                                <TableCell>
                                    <span className="text-sm text-muted-foreground">
                                        {format(createdDate, 'MMM d, yyyy')}
                                    </span>
                                </TableCell>

                                {/* Actions */}
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem onClick={() => onEdit(candidate)}>
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => onDelete(candidate)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
