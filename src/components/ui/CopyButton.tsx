import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CopyButtonProps {
    text: string;
    label?: string;
    variant?: 'default' | 'ghost' | 'outline';
    size?: 'default' | 'sm' | 'icon';
    className?: string;
    showToast?: boolean;
}

export function CopyButton({
    text,
    label,
    variant = 'ghost',
    size = 'icon',
    className,
    showToast = true,
}: CopyButtonProps) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);

            if (showToast) {
                toast({
                    title: 'Copied!',
                    description: `"${text.length > 30 ? text.slice(0, 30) + '...' : text}" copied to clipboard`,
                });
            }

            // Reset after 2 seconds
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast({
                title: 'Failed to copy',
                description: 'Please try again or copy manually',
                variant: 'destructive',
            });
        }
    }, [text, showToast, toast]);

    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            onClick={handleCopy}
            className={cn(
                'transition-colors',
                copied && 'text-emerald-600',
                className
            )}
            title={copied ? 'Copied!' : `Copy ${label || 'to clipboard'}`}
        >
            {copied ? (
                <Check className="h-4 w-4" />
            ) : (
                <Copy className="h-4 w-4" />
            )}
            {label && size !== 'icon' && (
                <span className="ml-2">{copied ? 'Copied!' : label}</span>
            )}
        </Button>
    );
}

// Inline copy text component - shows text with copy button
interface CopyTextProps {
    text: string;
    className?: string;
    showToast?: boolean;
}

export function CopyText({ text, className, showToast = false }: CopyTextProps) {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);

            if (showToast) {
                toast({
                    title: 'Copied!',
                    description: `Copied to clipboard`,
                });
            }

            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            // Silent fail for inline copy
        }
    }, [text, showToast, toast]);

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={cn(
                'inline-flex items-center gap-1 text-left hover:text-primary transition-colors group cursor-pointer',
                className
            )}
            title={copied ? 'Copied!' : 'Click to copy'}
        >
            <span className="truncate">{text}</span>
            {copied ? (
                <Check className="h-3 w-3 text-emerald-600 shrink-0" />
            ) : (
                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-50 shrink-0 transition-opacity" />
            )}
        </button>
    );
}
