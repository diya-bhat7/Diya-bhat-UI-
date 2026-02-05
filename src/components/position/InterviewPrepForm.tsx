/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, FileText, CheckCircle2, PartyPopper, Bot, Cpu } from 'lucide-react';
import { DocumentPreviewInline } from '@/components/ui/DocumentPreview';
import { generateCustomizedInterviewPrep } from '@/lib/document-templates';
import { smartGenerateInterviewPrep, isAIAvailable } from '@/lib/ai-service';
import { cn } from '@/lib/utils';

export interface InterviewPrepData {
    generatedJd: string;
    interviewPrepDoc: string;
}

interface InterviewPrepFormProps {
    data: InterviewPrepData;
    onChange: (data: InterviewPrepData) => void;
    onFinish: () => void;
    onBack: () => void;
    loading?: boolean;
    category?: string; // Position category for role-based templates
    positionName?: string;
}

export function InterviewPrepForm({
    data,
    onChange,
    onFinish,
    onBack,
    loading = false,
    category,
    positionName,
}: InterviewPrepFormProps) {
    const [generating, setGenerating] = useState(false);
    const [usedAI, setUsedAI] = useState(false);

    const handleGenerateInterviewPrep = async () => {
        setGenerating(true);

        try {
            // Use smart generation - AI first, then templates
            const result = await smartGenerateInterviewPrep(
                data.generatedJd,
                {
                    positionName: positionName || 'Position',
                    category: category || 'General',
                },
                () => generateCustomizedInterviewPrep(category || 'General')
            );

            setUsedAI(result.usedAI);
            onChange({ ...data, interviewPrepDoc: result.content });
        } catch (err) {
            // If AI fails, fall back to templates
            const fallback = generateCustomizedInterviewPrep(category || 'General');
            onChange({ ...data, interviewPrepDoc: fallback });
            setUsedAI(false);
        }

        setGenerating(false);
    };

    const canFinish = data.interviewPrepDoc.trim() !== '';
    const aiAvailable = isAIAvailable();

    return (
        <div className="space-y-6">
            {/* AI Status Banner */}
            <div className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                aiAvailable
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-amber-500/10 border-amber-500/30"
            )}>
                <div className="flex items-center gap-2">
                    {aiAvailable ? (
                        <>
                            <Bot className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                Gemini AI Connected
                            </span>
                        </>
                    ) : (
                        <>
                            <Cpu className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                Using Smart Templates
                            </span>
                        </>
                    )}
                </div>
                <Badge variant="secondary" className="text-xs">
                    {aiAvailable ? 'AI-Powered' : 'Template-Based'}
                </Badge>
            </div>

            {/* Generated JD Display */}
            <DocumentPreviewInline
                title="Job Description"
                content={data.generatedJd}
                isGenerated={true}
            />

            {/* Generate Interview Prep Button */}
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-semibold">Interview Preparation</h4>
                                <p className="text-sm text-muted-foreground">
                                    {aiAvailable
                                        ? 'AI-generated questions tailored to this role'
                                        : 'Smart template-based interview guide'
                                    }
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleGenerateInterviewPrep}
                            disabled={generating || data.interviewPrepDoc !== ''}
                            variant={data.interviewPrepDoc ? 'outline' : 'default'}
                            className={data.interviewPrepDoc ? '' : 'btn-primary'}
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {aiAvailable ? 'AI Generating...' : 'Generating...'}
                                </>
                            ) : data.interviewPrepDoc ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                    Generated {usedAI && <Sparkles className="ml-1 h-3 w-3 text-amber-500" />}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Interview Prep
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Generated Interview Prep Display */}
            {data.interviewPrepDoc && (
                <div className="relative">
                    {usedAI && (
                        <Badge
                            className="absolute -top-2 right-4 z-10 bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                        >
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Generated
                        </Badge>
                    )}
                    <DocumentPreviewInline
                        title="Interview Preparation Document"
                        content={data.interviewPrepDoc}
                        isGenerated={true}
                    />
                </div>
            )}

            {/* Success Message */}
            {canFinish && (
                <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <PartyPopper className="h-6 w-6 text-green-600" />
                    <div>
                        <p className="font-medium text-green-700 dark:text-green-400">
                            Position setup complete!
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-500">
                            Click "Finish" to save and return to the dashboard.
                        </p>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onBack} disabled={loading || generating}>
                    Back
                </Button>
                <Button
                    onClick={onFinish}
                    disabled={!canFinish || loading || generating}
                    className="btn-primary"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Finishing...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Finish
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
