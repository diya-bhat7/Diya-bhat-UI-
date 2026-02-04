import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
    children: ReactNode;
    className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
    return (
        <div
            className={cn(
                "animate-fade-in",
                "[animation-duration:0.3s]",
                className
            )}
        >
            {children}
        </div>
    );
}

// Wrapper for page main content with fade + slide
export function PageContent({ children, className }: PageTransitionProps) {
    return (
        <main
            className={cn(
                "animate-slide-up opacity-0",
                "[animation-duration:0.4s]",
                "[animation-fill-mode:forwards]",
                "[animation-delay:0.1s]",
                className
            )}
        >
            {children}
        </main>
    );
}
