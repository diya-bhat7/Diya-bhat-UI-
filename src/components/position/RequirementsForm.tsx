/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/ui/MultiSelect';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2, Bot, Cpu } from 'lucide-react';
import { DocumentPreviewInline } from '@/components/ui/DocumentPreview';
import { generateCustomizedJD } from '@/lib/document-templates';
import { smartGenerateJD, isAIAvailable } from '@/lib/ai-service';
import { cn } from '@/lib/utils';

export interface RequirementsData {
    clientJdFile: File | null;
    clientJdText: string;
    keyRequirements: string;
    generatedJd: string;
}

interface RequirementsFormProps {
    data: RequirementsData;
    onChange: (data: RequirementsData) => void;
    onSubmit: () => void;
    onBack: () => void;
    onCancel: () => void;
    loading?: boolean;
    category?: string; // Position category for role-based templates
    positionName?: string;
}

export function RequirementsForm({
    data,
    onChange,
    onSubmit,
    onBack,
    onCancel,
    loading = false,
    category,
    positionName,
}: RequirementsFormProps) {
    const [generating, setGenerating] = useState(false);
    const [usedAI, setUsedAI] = useState(false);

    const handleChange = <K extends keyof RequirementsData>(
        key: K,
        value: RequirementsData[K]
    ) => {
        onChange({ ...data, [key]: value });
    };

    const handleGenerateJD = async () => {
        setGenerating(true);

        try {
            // Use smart generation - AI first, then templates
            const result = await smartGenerateJD(
                {
                    positionName: positionName || 'Position',
                    category: category || 'General',
                    companyName: 'Our Company',
                },
                () => generateCustomizedJD(
                    category || 'General',
                    data.keyRequirements,
                    data.clientJdText
                )
            );

            setUsedAI(result.usedAI);
            handleChange('generatedJd', result.content);
        } catch (err) {
            // If AI fails, fall back to templates
            const fallback = generateCustomizedJD(
                category || 'General',
                data.keyRequirements,
                data.clientJdText
            );
            handleChange('generatedJd', fallback);
            setUsedAI(false);
        }

        setGenerating(false);
    };

    const hasContent = data.clientJdText.trim() !== '' || data.keyRequirements.trim() !== '';
    const canSubmit = data.generatedJd.trim() !== '';
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

            {/* Upload JD Document */}
            <div className="space-y-2">
                <Label>Upload JD Document (Optional)</Label>
                <FileUpload
                    onFileSelect={(file) => handleChange('clientJdFile', file)}
                    selectedFile={data.clientJdFile}
                />
            </div>

            {/* Job Description Text */}
            <div className="space-y-2">
                <Label htmlFor="jdText">Job Description Text</Label>
                <Textarea
                    id="jdText"
                    placeholder="Paste or type the job description here..."
                    value={data.clientJdText}
                    onChange={(e) => handleChange('clientJdText', e.target.value)}
                    className="min-h-[120px] bg-background resize-y"
                />
            </div>

            {/* Key Requirements */}
            <div className="space-y-2">
                <Label htmlFor="requirements">Key Requirements</Label>
                <Textarea
                    id="requirements"
                    placeholder="List the key requirements for this position..."
                    value={data.keyRequirements}
                    onChange={(e) => handleChange('keyRequirements', e.target.value)}
                    className="min-h-[100px] bg-background resize-y"
                />
            </div>

            {/* Generate JD Button */}
            <div className="flex items-center justify-center py-4">
                <Button
                    onClick={handleGenerateJD}
                    disabled={!hasContent || generating}
                    className="btn-primary gap-2"
                    size="lg"
                >
                    {generating ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {aiAvailable ? 'AI Generating JD...' : 'Generating JD...'}
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-5 w-5" />
                            Generate JD {aiAvailable && '(AI)'}
                        </>
                    )}
                </Button>
            </div>

            {/* Generated JD Display */}
            {data.generatedJd && (
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
                        title="Job Description"
                        content={data.generatedJd}
                        isGenerated={true}
                    />
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t">
                <Button variant="outline" onClick={onBack} disabled={loading || generating}>
                    Back
                </Button>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={onCancel} disabled={loading || generating}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={!canSubmit || loading || generating}
                        className="btn-primary"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Next'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
