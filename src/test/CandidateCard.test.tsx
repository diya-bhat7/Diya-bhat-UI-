import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CandidateCard, Candidate } from '@/components/candidates/CandidateCard';

// Mock candidate data
const mockCandidate: Candidate = {
    id: '1',
    position_id: 'pos-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    resume_url: 'https://example.com/resume.pdf',
    linkedin_url: 'https://linkedin.com/in/johndoe',
    status: 'interview',
    notes: 'Great candidate',
    rating: 4,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
};

describe('CandidateCard', () => {
    const mockOnEdit = vi.fn();
    const mockOnDelete = vi.fn();
    const mockOnStatusChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders candidate name and email', () => {
        render(
            <CandidateCard
                candidate={mockCandidate}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
            />
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    it('displays avatar with correct initials', () => {
        render(
            <CandidateCard
                candidate={mockCandidate}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
            />
        );

        expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('shows candidate status badge', () => {
        render(
            <CandidateCard
                candidate={mockCandidate}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
            />
        );

        expect(screen.getByText('Interview')).toBeInTheDocument();
    });

    it('renders star rating when present', () => {
        render(
            <CandidateCard
                candidate={mockCandidate}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
            />
        );

        // 5 stars should be rendered (4 filled, 1 empty)
        const stars = document.querySelectorAll('svg.lucide-star');
        expect(stars.length).toBe(5);
    });

    it('renders contact links when provided', () => {
        render(
            <CandidateCard
                candidate={mockCandidate}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
            />
        );

        // Phone link
        const phoneLink = document.querySelector('a[href^="tel:"]');
        expect(phoneLink).toBeInTheDocument();

        // LinkedIn link
        const linkedinLink = document.querySelector('a[href*="linkedin"]');
        expect(linkedinLink).toBeInTheDocument();

        // Resume link
        const resumeLink = document.querySelector('a[href*="resume"]');
        expect(resumeLink).toBeInTheDocument();
    });

    it('does not render phone link when phone is not provided', () => {
        const candidateWithoutPhone = { ...mockCandidate, phone: undefined };

        render(
            <CandidateCard
                candidate={candidateWithoutPhone}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
            />
        );

        const phoneLink = document.querySelector('a[href^="tel:"]');
        expect(phoneLink).not.toBeInTheDocument();
    });

    it('handles single name for initials correctly', () => {
        const singleNameCandidate = { ...mockCandidate, name: 'Madonna' };

        render(
            <CandidateCard
                candidate={singleNameCandidate}
                onEdit={mockOnEdit}
                onDelete={mockOnDelete}
                onStatusChange={mockOnStatusChange}
            />
        );

        expect(screen.getByText('M')).toBeInTheDocument();
    });
});
