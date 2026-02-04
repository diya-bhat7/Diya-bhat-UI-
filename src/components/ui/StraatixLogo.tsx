import { cn } from '@/lib/utils';

interface StraatixLogoProps {
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    className?: string;
}

const sizes = {
    sm: { icon: 'h-10', text: 'text-xs', gap: 'gap-2' },
    md: { icon: 'h-14', text: 'text-sm', gap: 'gap-3' },
    lg: { icon: 'h-20', text: 'text-base', gap: 'gap-3' },
};

export function StraatixLogo({ size = 'md', showText = true, className }: StraatixLogoProps) {
    const { icon, text, gap } = sizes[size];

    return (
        <div className={cn('flex items-center', gap, className)}>
            {/* Brand Logo Image - with dark mode filter */}
            <img
                src="/straatix-logo.png"
                alt="Straatix Partners"
                className={cn(
                    icon,
                    'w-auto object-contain',
                    // Invert and adjust for dark mode to handle non-transparent logos
                    'dark:brightness-0 dark:invert dark:opacity-90'
                )}
            />

            {showText && (
                <div className="flex flex-col leading-none">
                    <span className={cn(text, 'font-bold tracking-[0.12em] text-primary dark:text-primary-foreground')}>
                        STRAATIX
                    </span>
                    <span className={cn(text, 'font-medium tracking-[0.12em] text-primary/70 dark:text-primary-foreground/70')}>
                        PARTNERS
                    </span>
                </div>
            )}
        </div>
    );
}
