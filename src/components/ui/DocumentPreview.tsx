import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Download,
    CheckCircle2,
    FileText,
    Copy,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DocumentPreviewProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    content: string;
    isGenerated?: boolean;
    onDownload?: () => void;
}

// Markdown-like section parsing
function parseContent(content: string) {
    const lines = content.split('\n');
    const sections: { type: 'heading' | 'subheading' | 'list' | 'text'; content: string }[] = [];

    let currentSection: string[] = [];

    lines.forEach((line) => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('## ')) {
            if (currentSection.length > 0) {
                sections.push({ type: 'text', content: currentSection.join('\n') });
                currentSection = [];
            }
            sections.push({ type: 'heading', content: trimmedLine.replace('## ', '') });
        } else if (trimmedLine.startsWith('# ')) {
            if (currentSection.length > 0) {
                sections.push({ type: 'text', content: currentSection.join('\n') });
                currentSection = [];
            }
            sections.push({ type: 'heading', content: trimmedLine.replace('# ', '') });
        } else if (trimmedLine.startsWith('### ')) {
            if (currentSection.length > 0) {
                sections.push({ type: 'text', content: currentSection.join('\n') });
                currentSection = [];
            }
            sections.push({ type: 'subheading', content: trimmedLine.replace('### ', '') });
        } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
            if (currentSection.length > 0 && !currentSection[0].startsWith('- ') && !currentSection[0].startsWith('* ')) {
                sections.push({ type: 'text', content: currentSection.join('\n') });
                currentSection = [];
            }
            currentSection.push(trimmedLine);
        } else if (trimmedLine !== '') {
            if (currentSection.length > 0 && (currentSection[0].startsWith('- ') || currentSection[0].startsWith('* '))) {
                sections.push({ type: 'list', content: currentSection.join('\n') });
                currentSection = [];
            }
            currentSection.push(line);
        }
    });

    if (currentSection.length > 0) {
        const isListSection = currentSection[0].startsWith('- ') || currentSection[0].startsWith('* ');
        sections.push({ type: isListSection ? 'list' : 'text', content: currentSection.join('\n') });
    }

    return sections;
}

export function DocumentPreview({
    open,
    onOpenChange,
    title,
    content,
    isGenerated = true,
    onDownload,
}: DocumentPreviewProps) {
    const [copied, setCopied] = useState(false);

    const sections = parseContent(content);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (onDownload) {
            onDownload();
        } else {
            // Default download behavior - create text file
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] p-0 gap-0">
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <DialogTitle className="text-lg">{title}</DialogTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            {isGenerated && (
                                <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700 border-0">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Generated
                                </Badge>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Document Content */}
                <ScrollArea className="flex-1 max-h-[50vh]">
                    <div className="px-6 py-4">
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border p-6 space-y-4">
                            {sections.map((section, index) => {
                                if (section.type === 'heading') {
                                    return (
                                        <h2
                                            key={index}
                                            className="text-lg font-bold text-foreground border-b pb-2 pt-2 first:pt-0"
                                        >
                                            {section.content}
                                        </h2>
                                    );
                                }
                                if (section.type === 'subheading') {
                                    return (
                                        <h3 key={index} className="text-md font-semibold text-foreground pt-2">
                                            {section.content}
                                        </h3>
                                    );
                                }
                                if (section.type === 'list') {
                                    return (
                                        <ul key={index} className="space-y-1.5 pl-1">
                                            {section.content.split('\n').map((item, itemIndex) => (
                                                <li
                                                    key={itemIndex}
                                                    className="flex items-start gap-2 text-sm text-muted-foreground"
                                                >
                                                    <span className="text-primary mt-1.5 h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                                                    <span>{item.replace(/^[-*]\s+/, '')}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    );
                                }
                                return (
                                    <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                                        {section.content}
                                    </p>
                                );
                            })}
                        </div>
                    </div>
                </ScrollArea>

                {/* Footer Actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
                    <div className="text-xs text-muted-foreground">
                        {content.split('\n').length} lines
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="gap-2"
                        >
                            <Copy className="h-4 w-4" />
                            {copied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleDownload}
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Inline preview component for use in forms
export function DocumentPreviewInline({
    title,
    content,
    isGenerated = true,
    onPreview,
    className,
}: {
    title: string;
    content: string;
    isGenerated?: boolean;
    onPreview?: () => void;
    className?: string;
}) {
    const [previewOpen, setPreviewOpen] = useState(false);

    const sections = parseContent(content);
    const previewLines = sections.slice(0, 3);

    return (
        <>
            <div
                className={cn(
                    "bg-gray-50 dark:bg-gray-900 rounded-lg border p-4 cursor-pointer hover:border-primary/50 transition-colors",
                    className
                )}
                onClick={() => onPreview ? onPreview() : setPreviewOpen(true)}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{title}</span>
                    </div>
                    {isGenerated && (
                        <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700 border-0 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            Generated
                        </Badge>
                    )}
                </div>

                {/* Preview Content */}
                <div className="space-y-2 text-sm text-muted-foreground">
                    {previewLines.map((section, index) => {
                        if (section.type === 'heading') {
                            return (
                                <div key={index} className="font-semibold text-foreground text-xs uppercase tracking-wide">
                                    {section.content}
                                </div>
                            );
                        }
                        return (
                            <div key={index} className="line-clamp-2 text-xs">
                                {section.content.substring(0, 100)}...
                            </div>
                        );
                    })}
                </div>

                {/* Click to view hint */}
                <div className="mt-3 pt-3 border-t text-xs text-primary font-medium">
                    Click to view full document →
                </div>
            </div>

            <DocumentPreview
                open={previewOpen}
                onOpenChange={setPreviewOpen}
                title={title}
                content={content}
                isGenerated={isGenerated}
            />
        </>
    );
}
