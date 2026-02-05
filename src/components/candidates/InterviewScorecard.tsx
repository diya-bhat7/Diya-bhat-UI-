import { useState } from 'react';
import { Star, TrendingUp, MessageSquare, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Define skill categories with labels and weights
const SKILL_CATEGORIES = [
    { key: 'communication', label: 'Communication', description: 'Clarity, articulation, listening skills', weight: 1 },
    { key: 'technical', label: 'Technical Skills', description: 'Role-specific expertise', weight: 1.5 },
    { key: 'problemSolving', label: 'Problem Solving', description: 'Analytical thinking and creativity', weight: 1.2 },
    { key: 'cultureFit', label: 'Culture Fit', description: 'Values alignment and teamwork', weight: 1 },
    { key: 'experience', label: 'Experience', description: 'Background relevance to role', weight: 1.3 },
] as const;

export type SkillKey = typeof SKILL_CATEGORIES[number]['key'];

export interface SkillRatings {
    communication: number;
    technical: number;
    problemSolving: number;
    cultureFit: number;
    experience: number;
}

export interface InterviewScorecardData {
    id?: string;
    roundName: string;
    ratings: SkillRatings;
    overallScore: number;
    comments: string;
    createdAt: string;
}

interface InterviewScorecardProps {
    initialData?: InterviewScorecardData;
    onSave: (data: InterviewScorecardData) => void;
    onCancel: () => void;
    roundName?: string;
}

// Star Rating Component
function StarRating({
    value,
    onChange,
    readonly = false
}: {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
}) {
    const [hoverValue, setHoverValue] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    className={cn(
                        "transition-all duration-150",
                        readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
                    )}
                    onMouseEnter={() => !readonly && setHoverValue(star)}
                    onMouseLeave={() => !readonly && setHoverValue(0)}
                    onClick={() => onChange?.(star)}
                >
                    <Star
                        className={cn(
                            "h-5 w-5 transition-colors",
                            (hoverValue || value) >= star
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

// Calculate overall weighted score
function calculateOverallScore(ratings: SkillRatings): number {
    let totalWeight = 0;
    let weightedSum = 0;

    SKILL_CATEGORIES.forEach((skill) => {
        const rating = ratings[skill.key];
        weightedSum += rating * skill.weight;
        totalWeight += skill.weight;
    });

    return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 20) : 0; // Scale to 0-100
}

// Get score color based on percentage
function getScoreColor(score: number): string {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
}

function getScoreBg(score: number): string {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
}

export function InterviewScorecard({
    initialData,
    onSave,
    onCancel,
    roundName = 'Interview Round'
}: InterviewScorecardProps) {
    const [ratings, setRatings] = useState<SkillRatings>(
        initialData?.ratings || {
            communication: 0,
            technical: 0,
            problemSolving: 0,
            cultureFit: 0,
            experience: 0,
        }
    );
    const [comments, setComments] = useState(initialData?.comments || '');

    const overallScore = calculateOverallScore(ratings);

    const handleRatingChange = (key: SkillKey, value: number) => {
        setRatings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        const data: InterviewScorecardData = {
            id: initialData?.id || crypto.randomUUID(),
            roundName,
            ratings,
            overallScore,
            comments,
            createdAt: initialData?.createdAt || new Date().toISOString(),
        };
        onSave(data);
    };

    const allRated = Object.values(ratings).every((r) => r > 0);

    return (
        <div className="bg-card border rounded-2xl p-6 shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{roundName}</h3>
                        <p className="text-xs text-muted-foreground">Rate the candidate's skills</p>
                    </div>
                </div>

                {/* Overall Score */}
                <div className="text-center">
                    <div className={cn("text-3xl font-bold", getScoreColor(overallScore))}>
                        {overallScore}%
                    </div>
                    <p className="text-xs text-muted-foreground">Overall Score</p>
                </div>
            </div>

            {/* Score Progress Bar */}
            <div className="mb-6">
                <Progress value={overallScore} className={cn("h-2", getScoreBg(overallScore))} />
            </div>

            {/* Skill Ratings Grid */}
            <div className="space-y-4 mb-6">
                {SKILL_CATEGORIES.map((skill) => (
                    <div
                        key={skill.key}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{skill.label}</span>
                                {skill.weight > 1 && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                        ×{skill.weight}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">{skill.description}</p>
                        </div>
                        <StarRating
                            value={ratings[skill.key]}
                            onChange={(v) => handleRatingChange(skill.key, v)}
                        />
                    </div>
                ))}
            </div>

            {/* Comments */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Interview Notes</span>
                </div>
                <Textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add detailed observations, strengths, areas for improvement..."
                    className="min-h-[100px] resize-none"
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={onCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={!allRated}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Scorecard
                </Button>
            </div>
        </div>
    );
}

// Read-only Scorecard Summary for display
export function ScorecardSummary({ data }: { data: InterviewScorecardData }) {
    return (
        <div className="bg-muted/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{data.roundName}</span>
                </div>
                <div className={cn("font-bold", getScoreColor(data.overallScore))}>
                    {data.overallScore}%
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
                {SKILL_CATEGORIES.map((skill) => (
                    <div key={skill.key} className="text-center">
                        <div className="text-xs text-muted-foreground truncate">{skill.label.split(' ')[0]}</div>
                        <div className="flex justify-center mt-1">
                            <StarRating value={data.ratings[skill.key]} readonly />
                        </div>
                    </div>
                ))}
            </div>

            {data.comments && (
                <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                    {data.comments}
                </p>
            )}
        </div>
    );
}
