/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2, FileText, CheckCircle2, PartyPopper } from 'lucide-react';
import { DocumentPreviewInline } from '@/components/ui/DocumentPreview';
import { generateCustomizedInterviewPrep } from '@/lib/document-templates';

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
}

export function InterviewPrepForm({
    data,
    onChange,
    onFinish,
    onBack,
    loading = false,
    category,
}: InterviewPrepFormProps) {
    const [generating, setGenerating] = useState(false);

    const handleGenerateInterviewPrep = async () => {
        setGenerating(true);

        // Simulate AI processing delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Generate role-based interview prep using templates
        const customizedPrep = generateCustomizedInterviewPrep(category || 'General');

        onChange({ ...data, interviewPrepDoc: customizedPrep });
        setGenerating(false);
    };

    const canFinish = data.interviewPrepDoc.trim() !== '';

    return (
        <div className="space-y-6">
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
                                    Generate interview questions and evaluation criteria
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
                                    Generating...
                                </>
                            ) : data.interviewPrepDoc ? (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                    Generated
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
                <DocumentPreviewInline
                    title="Interview Preparation Document"
                    content={data.interviewPrepDoc}
                    isGenerated={true}
                />
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
