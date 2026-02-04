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
                <ScrollArea className="flex-1 bg-muted/30">
                    <div className="px-10 py-12 flex justify-center">
                        <div
                            className="bg-white text-gray-900 shadow-2xl rounded-none border-t-[6px] border-t-primary w-full max-w-2xl min-h-[60vh] p-12 space-y-8 relative overflow-hidden"
                            style={{
                                fontFamily: 'Archivo, sans-serif',
                                boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
                            }}
                        >
                            {/* Watermark/Letterhead Background */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] rotate-[-45deg] pointer-events-none select-none">
                                <span className="text-8xl font-black uppercase tracking-[1em]">Straatix</span>
                            </div>

                            {/* Letterhead */}
                            <div className="flex justify-between items-start border-b-2 border-primary/10 pb-8 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-6 w-6 rounded flex items-center justify-center bg-primary text-white">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <span className="font-bold uppercase tracking-widest text-sm text-primary">Straatix Partners</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Professional Recruitment Platform</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Document Generated</p>
                                    <p className="text-xs font-bold">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="space-y-6 relative z-10">
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
                                        <p key={index} className="text-sm text-gray-600 leading-[1.8]">
                                            {section.content}
                                        </p>
                                    );
                                })}
                            </div>
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

// Inline preview component for use in forms - Premium Design
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
    const [copied, setCopied] = useState(false);

    const sections = parseContent(content);
    const previewSections = sections.slice(0, 4);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div
                className={cn(
                    "relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-background to-primary/5 transition-all duration-300",
                    "hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40",
                    className
                )}
            >
                {/* Decorative gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground">{title}</h4>
                            <p className="text-xs text-muted-foreground">{content.split('\n').length} lines</p>
                        </div>
                    </div>
                    {isGenerated && (
                        <Badge variant="secondary" className="gap-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            AI Generated
                        </Badge>
                    )}
                </div>

                {/* Content Preview */}
                <div
                    className="p-4 space-y-3 cursor-pointer"
                    onClick={() => onPreview ? onPreview() : setPreviewOpen(true)}
                >
                    <div className="bg-white dark:bg-gray-900/50 rounded-lg border p-4 space-y-3 max-h-48 overflow-hidden relative" style={{ fontFamily: 'Archivo, sans-serif' }}>
                        {previewSections.map((section, index) => {
                            if (section.type === 'heading') {
                                return (
                                    <div key={index} className="font-bold text-foreground text-sm border-l-4 border-primary pl-3 py-1">
                                        {section.content}
                                    </div>
                                );
                            }
                            if (section.type === 'subheading') {
                                return (
                                    <div key={index} className="font-semibold text-foreground/80 text-sm pl-3">
                                        {section.content}
                                    </div>
                                );
                            }
                            if (section.type === 'list') {
                                return (
                                    <ul key={index} className="space-y-1 pl-4">
                                        {section.content.split('\n').slice(0, 3).map((item, itemIndex) => (
                                            <li key={itemIndex} className="flex items-start gap-2 text-xs text-muted-foreground">
                                                <span className="text-primary mt-1 h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                                                <span className="line-clamp-1">{item.replace(/^[-*]\s+/, '')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                );
                            }
                            return (
                                <p key={index} className="text-xs text-muted-foreground line-clamp-2">
                                    {section.content}
                                </p>
                            );
                        })}

                        {/* Fade overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-900/50 to-transparent pointer-events-none" />
                    </div>

                    {/* Click to expand hint */}
                    <p className="text-xs text-center text-primary font-medium">
                        Click to view full document →
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 px-4 py-3 border-t bg-muted/30">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="gap-1.5 text-xs"
                    >
                        <Copy className="h-3.5 w-3.5" />
                        {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="gap-1.5 text-xs"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Download
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onPreview ? onPreview() : setPreviewOpen(true)}
                        className="gap-1.5 text-xs"
                    >
                        <FileText className="h-3.5 w-3.5" />
                        View Full
                    </Button>
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
