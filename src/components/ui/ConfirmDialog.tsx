import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void;
    onCancel?: () => void;
    loading?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    onConfirm,
    onCancel,
    loading = false,
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm();
        if (!loading) {
            onOpenChange(false);
        }
    };

    const handleCancel = () => {
        onCancel?.();
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleCancel} disabled={loading}>
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={loading}
                        className={cn(
                            variant === 'destructive' &&
                            'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        )}
                    >
                        {loading ? 'Please wait...' : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// Convenience hook for managing confirm dialog state
import { useState, useCallback } from 'react';

interface UseConfirmDialogOptions {
    title: string;
    description: string;
    confirmLabel?: string;
    variant?: 'default' | 'destructive';
}

export function useConfirmDialog(options: UseConfirmDialogOptions) {
    const [open, setOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const confirm = useCallback((action: () => void) => {
        setPendingAction(() => action);
        setOpen(true);
    }, []);

    const handleConfirm = useCallback(() => {
        pendingAction?.();
        setPendingAction(null);
    }, [pendingAction]);

    const handleCancel = useCallback(() => {
        setPendingAction(null);
    }, []);

    const dialogProps = {
        open,
        onOpenChange: setOpen,
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel,
        variant: options.variant,
        onConfirm: handleConfirm,
        onCancel: handleCancel,
    };

    return { confirm, dialogProps };
}
