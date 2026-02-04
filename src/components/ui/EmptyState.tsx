import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: 'briefcase' | 'users' | 'search' | 'folder';
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

// Custom SVG illustrations for each empty state type
const illustrations = {
    briefcase: (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-48 h-40">
            {/* Background circles */}
            <circle cx="100" cy="80" r="60" className="fill-primary/5" />
            <circle cx="100" cy="80" r="45" className="fill-primary/10" />

            {/* Briefcase body */}
            <rect x="50" y="60" width="100" height="70" rx="8" className="fill-primary/20 stroke-primary/40" strokeWidth="2" />

            {/* Briefcase top */}
            <rect x="65" y="50" width="70" height="15" rx="4" className="fill-primary/30 stroke-primary/40" strokeWidth="2" />

            {/* Handle */}
            <rect x="85" y="40" width="30" height="15" rx="4" className="fill-background stroke-primary/40" strokeWidth="2" />

            {/* Lock/clasp */}
            <rect x="90" y="85" width="20" height="15" rx="3" className="fill-primary/40" />
            <circle cx="100" cy="92" r="3" className="fill-background" />

            {/* Decorative plus signs */}
            <g className="stroke-primary/30" strokeWidth="2">
                <line x1="165" y1="40" x2="165" y2="50" />
                <line x1="160" y1="45" x2="170" y2="45" />
            </g>
            <g className="stroke-primary/30" strokeWidth="2">
                <line x1="35" y1="100" x2="35" y2="110" />
                <line x1="30" y1="105" x2="40" y2="105" />
            </g>

            {/* Decorative dots */}
            <circle cx="155" cy="120" r="3" className="fill-primary/20" />
            <circle cx="45" cy="50" r="3" className="fill-primary/20" />
            <circle cx="170" cy="75" r="2" className="fill-primary/15" />
        </svg>
    ),
    users: (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-48 h-40">
            {/* Background circles */}
            <circle cx="100" cy="80" r="60" className="fill-primary/5" />
            <circle cx="100" cy="80" r="45" className="fill-primary/10" />

            {/* Main user */}
            <circle cx="100" cy="55" r="20" className="fill-primary/30 stroke-primary/40" strokeWidth="2" />
            <path d="M65 115 C65 90, 135 90, 135 115" className="fill-primary/20 stroke-primary/40" strokeWidth="2" />

            {/* Left user (smaller) */}
            <circle cx="55" cy="65" r="12" className="fill-primary/20 stroke-primary/30" strokeWidth="1.5" />
            <path d="M35 100 C35 85, 75 85, 75 100" className="fill-primary/15 stroke-primary/30" strokeWidth="1.5" />

            {/* Right user (smaller) */}
            <circle cx="145" cy="65" r="12" className="fill-primary/20 stroke-primary/30" strokeWidth="1.5" />
            <path d="M125 100 C125 85, 165 85, 165 100" className="fill-primary/15 stroke-primary/30" strokeWidth="1.5" />

            {/* Decorative plus signs */}
            <g className="stroke-primary/30" strokeWidth="2">
                <line x1="170" y1="40" x2="170" y2="50" />
                <line x1="165" y1="45" x2="175" y2="45" />
            </g>

            {/* Decorative dots */}
            <circle cx="30" cy="90" r="3" className="fill-primary/20" />
            <circle cx="180" cy="100" r="2" className="fill-primary/15" />
        </svg>
    ),
    search: (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-48 h-40">
            {/* Background circles */}
            <circle cx="100" cy="80" r="60" className="fill-muted/50" />
            <circle cx="100" cy="80" r="45" className="fill-muted" />

            {/* Magnifying glass */}
            <circle cx="90" cy="70" r="30" className="fill-background stroke-muted-foreground/40" strokeWidth="4" />
            <circle cx="90" cy="70" r="20" className="fill-muted/50" />

            {/* Handle */}
            <line x1="112" y1="92" x2="135" y2="115" className="stroke-muted-foreground/40" strokeWidth="4" strokeLinecap="round" />

            {/* Question mark */}
            <text x="85" y="78" className="fill-muted-foreground/40 text-2xl font-bold" fontFamily="sans-serif">?</text>

            {/* Decorative dots */}
            <circle cx="40" cy="50" r="3" className="fill-muted-foreground/20" />
            <circle cx="160" cy="40" r="3" className="fill-muted-foreground/20" />
            <circle cx="170" cy="120" r="2" className="fill-muted-foreground/15" />
        </svg>
    ),
    folder: (
        <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-48 h-40">
            {/* Background circles */}
            <circle cx="100" cy="80" r="60" className="fill-primary/5" />
            <circle cx="100" cy="80" r="45" className="fill-primary/10" />

            {/* Folder back */}
            <rect x="45" y="55" width="110" height="75" rx="6" className="fill-primary/20" />

            {/* Folder tab */}
            <path d="M45 55 L45 50 C45 47, 47 45, 50 45 L80 45 L90 55 Z" className="fill-primary/25" />

            {/* Folder front */}
            <rect x="40" y="60" width="120" height="65" rx="6" className="fill-primary/30 stroke-primary/40" strokeWidth="2" />

            {/* Document lines */}
            <line x1="60" y1="80" x2="140" y2="80" className="stroke-primary/20" strokeWidth="2" strokeLinecap="round" />
            <line x1="60" y1="95" x2="120" y2="95" className="stroke-primary/20" strokeWidth="2" strokeLinecap="round" />
            <line x1="60" y1="110" x2="100" y2="110" className="stroke-primary/20" strokeWidth="2" strokeLinecap="round" />

            {/* Decorative dots */}
            <circle cx="165" cy="45" r="3" className="fill-primary/20" />
            <circle cx="35" cy="100" r="2" className="fill-primary/15" />
        </svg>
    ),
};

export function EmptyState({
    icon = 'briefcase',
    title,
    description,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed rounded-xl border-muted-foreground/20 bg-muted/5",
                className
            )}
        >
            {/* Animated illustration */}
            <div className="mb-6 animate-fade-in">
                {illustrations[icon]}
            </div>

            {/* Title */}
            <h3 className="text-xl font-semibold mb-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                {title}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground mb-6 max-w-md animate-slide-up" style={{ animationDelay: '0.15s' }}>
                {description}
            </p>

            {/* Action button */}
            {actionLabel && onAction && (
                <Button onClick={onAction} className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
