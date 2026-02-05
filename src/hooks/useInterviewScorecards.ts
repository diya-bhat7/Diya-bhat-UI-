import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { InterviewScorecardData, SkillRatings } from '@/components/candidates/InterviewScorecard';

// Store scorecards in localStorage for simplicity (no database migration needed)
const STORAGE_KEY = 'straatix_scorecards';

interface StoredScorecards {
    [candidateId: string]: InterviewScorecardData[];
}

function loadFromStorage(): StoredScorecards {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
}

function saveToStorage(data: StoredScorecards) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useInterviewScorecards(candidateId: string | null) {
    const [scorecards, setScorecards] = useState<InterviewScorecardData[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    // Load scorecards for this candidate
    useEffect(() => {
        if (!candidateId) {
            setScorecards([]);
            setLoading(false);
            return;
        }

        const allData = loadFromStorage();
        setScorecards(allData[candidateId] || []);
        setLoading(false);
    }, [candidateId]);

    // Add or update a scorecard
    const saveScorecard = useCallback((data: InterviewScorecardData) => {
        if (!candidateId) return;

        const allData = loadFromStorage();
        const candidateScorecards = allData[candidateId] || [];

        // Check if updating existing or adding new
        const existingIndex = candidateScorecards.findIndex(s => s.id === data.id);

        if (existingIndex >= 0) {
            candidateScorecards[existingIndex] = data;
        } else {
            candidateScorecards.push(data);
        }

        allData[candidateId] = candidateScorecards;
        saveToStorage(allData);
        setScorecards(candidateScorecards);

        toast({
            title: "Scorecard Saved ✓",
            description: `${data.roundName} evaluation recorded.`,
        });
    }, [candidateId, toast]);

    // Delete a scorecard
    const deleteScorecard = useCallback((scorecardId: string) => {
        if (!candidateId) return;

        const allData = loadFromStorage();
        const candidateScorecards = (allData[candidateId] || []).filter(s => s.id !== scorecardId);

        allData[candidateId] = candidateScorecards;
        saveToStorage(allData);
        setScorecards(candidateScorecards);

        toast({
            title: "Scorecard Deleted",
            description: "The evaluation has been removed.",
            variant: "destructive",
        });
    }, [candidateId, toast]);

    // Calculate average score across all rounds
    const averageScore = scorecards.length > 0
        ? Math.round(scorecards.reduce((sum, s) => sum + s.overallScore, 0) / scorecards.length)
        : null;

    // Get the latest scorecard
    const latestScorecard = scorecards.length > 0
        ? scorecards.reduce((latest, s) =>
            new Date(s.createdAt) > new Date(latest.createdAt) ? s : latest
        )
        : null;

    return {
        scorecards,
        loading,
        saveScorecard,
        deleteScorecard,
        averageScore,
        latestScorecard,
        totalRounds: scorecards.length,
    };
}

// Interview round presets
export const INTERVIEW_ROUNDS = [
    'Phone Screen',
    'Technical Interview',
    'System Design',
    'Culture Fit',
    'Hiring Manager',
    'Final Round',
] as const;
