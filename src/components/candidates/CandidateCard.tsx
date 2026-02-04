/* eslint-disable react-refresh/only-export-components */
import { memo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CandidateStatus } from './CandidateStatusBadge';

export interface Candidate {
    id: string;
    position_id: string;
    name: string;
    email: string;
    phone?: string;
    resume_url?: string;
    linkedin_url?: string;
    status: CandidateStatus;
    notes?: string;
    rating?: number;
    voice_note_url?: string;
    created_at: string;
    updated_at: string;
}

interface CandidateCardProps {
    candidate: Candidate;
    onClick?: (candidate: Candidate) => void;
    onEdit: (candidate: Candidate) => void;
    onDelete: (candidate: Candidate) => void;
    onStatusChange: (candidate: Candidate, newStatus: CandidateStatus) => void;
}

// Status-based avatar colors
const statusAvatarColors: Record<CandidateStatus, string> = {
    new: 'bg-blue-100 text-blue-700',
    screening: 'bg-orange-100 text-orange-700',
    interview: 'bg-amber-100 text-amber-700',
    offer: 'bg-purple-100 text-purple-700',
    hired: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
};

export const CandidateCard = memo(function CandidateCard({
    candidate,
    onClick,
}: CandidateCardProps) {
    const initials = candidate.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div
            className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer transition-all"
            onClick={() => onClick?.(candidate)}
        >
            <Avatar className={`h-8 w-8 shrink-0 ${statusAvatarColors[candidate.status]}`}>
                <AvatarFallback className={`text-xs font-semibold ${statusAvatarColors[candidate.status]}`}>
                    {initials}
                </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-800 truncate">
                {candidate.name}
            </span>
        </div>
    );
});
