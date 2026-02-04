import { useMemo } from 'react';
import { useAllCandidates } from './useCandidates';
import { differenceInDays, parseISO } from 'date-fns';
import { CandidateStatus } from '@/components/candidates/CandidateStatusBadge';

export interface AnalyticsData {
    totalCandidates: number;
    hiredCount: number;
    avgTimeToHire: number;
    statusBreakdown: { name: string; value: number }[];
    timeToHireData: { date: string; days: number }[];
    conversionData: { stage: string; count: number; percentage: number }[];
}

export function useAnalytics() {
    const { data: candidates, isLoading } = useAllCandidates();

    const analytics = useMemo((): AnalyticsData => {
        if (!candidates || candidates.length === 0) {
            return {
                totalCandidates: 0,
                hiredCount: 0,
                avgTimeToHire: 0,
                statusBreakdown: [],
                timeToHireData: [],
                conversionData: [],
            };
        }

        const total = candidates.length;
        const hiredCandidates = candidates.filter(c => c.status === 'hired');
        const hiredCount = hiredCandidates.length;

        // Calculate Average Time to Hire (in days)
        let totalDays = 0;
        const timeToHireData: { date: string; days: number }[] = [];

        hiredCandidates.forEach(c => {
            const start = parseISO(c.created_at);
            const end = parseISO(c.updated_at);
            const days = Math.max(0, differenceInDays(end, start));
            totalDays += days;

            timeToHireData.push({
                date: new Date(c.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                days,
            });
        });

        const avgTimeToHire = hiredCount > 0 ? Math.round(totalDays / hiredCount) : 0;

        // Status Breakdown for Pie Chart
        const statusCounts: Record<CandidateStatus, number> = {
            new: 0,
            screening: 0,
            interview: 0,
            offer: 0,
            hired: 0,
            rejected: 0,
        };

        candidates.forEach(c => {
            statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
        });

        const statusBreakdown = Object.entries(statusCounts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
        })).filter(item => item.value > 0);

        // Conversion Stages
        const stages: { stage: string; status: CandidateStatus }[] = [
            { stage: 'Sourced', status: 'new' },
            { stage: 'Screening', status: 'screening' },
            { stage: 'Interview', status: 'interview' },
            { stage: 'Offer', status: 'offer' },
            { stage: 'Hired', status: 'hired' },
        ];

        const conversionData = stages.map(({ stage, status }) => {
            const count = candidates.filter(c => {
                // A candidate who reached "Interview" also passed through "Screening" and "new"
                const statusValues: Record<CandidateStatus, number> = {
                    new: 0,
                    screening: 1,
                    interview: 2,
                    offer: 3,
                    hired: 4,
                    rejected: -1,
                };
                return statusValues[c.status] >= statusValues[status];
            }).length;

            return {
                stage,
                count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0,
            };
        });

        return {
            totalCandidates: total,
            hiredCount,
            avgTimeToHire,
            statusBreakdown,
            timeToHireData,
            conversionData,
        };
    }, [candidates]);

    return { analytics, isLoading };
}
