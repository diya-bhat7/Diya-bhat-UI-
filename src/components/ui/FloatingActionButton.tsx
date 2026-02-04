import { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
    onClick: () => void;
    label?: string;
    keyboardShortcut?: string;
    className?: string;
}

export function FloatingActionButton({
    onClick,
    label = 'Add',
    keyboardShortcut = 'n',
    className,
}: FloatingActionButtonProps) {
    // Keyboard shortcut handler
    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            // Don't trigger if user is typing in an input/textarea
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                event.target instanceof HTMLSelectElement
            ) {
                return;
            }

            // Check for the shortcut key (case insensitive, no modifiers)
            if (
                event.key.toLowerCase() === keyboardShortcut.toLowerCase() &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey
            ) {
                event.preventDefault();
                onClick();
            }
        },
        [onClick, keyboardShortcut]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    return (
        <>
            {/* Mobile FAB - fixed at bottom right */}
            <Button
                onClick={onClick}
                className={cn(
                    "fixed bottom-6 right-6 md:hidden z-40",
                    "h-14 w-14 rounded-full shadow-lg",
                    "bg-primary hover:bg-primary/90",
                    "transition-transform hover:scale-105 active:scale-95",
                    className
                )}
                size="icon"
            >
                <Plus className="h-6 w-6" />
                <span className="sr-only">{label}</span>
            </Button>

            {/* Keyboard shortcut hint for desktop - shown as tooltip/badge */}
            <div className="hidden md:block fixed bottom-6 right-6 z-40">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/80 backdrop-blur text-sm text-muted-foreground">
                    <span>Press</span>
                    <kbd className="px-2 py-0.5 rounded bg-background border text-xs font-mono font-semibold">
                        {keyboardShortcut.toUpperCase()}
                    </kbd>
                    <span>to {label.toLowerCase()}</span>
                </div>
            </div>
        </>
    );
}

// Hook for using keyboard shortcuts independently
export function useKeyboardShortcut(key: string, callback: () => void) {
    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                event.target instanceof HTMLSelectElement
            ) {
                return;
            }

            if (
                event.key.toLowerCase() === key.toLowerCase() &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey
            ) {
                event.preventDefault();
                callback();
            }
        },
        [key, callback]
    );

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);
}
