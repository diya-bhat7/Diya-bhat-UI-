/**
 * AuthLogo - Straatix Partners logo for authentication pages
 * Uses the actual brand logo image
 */
export function AuthLogo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'h-12',
        md: 'h-16',
        lg: 'h-20',
    };

    return (
        <img
            src="/straatix-logo-full.png"
            alt="Straatix Partners"
            className={`${sizeClasses[size]} w-auto object-contain`}
        />
    );
}
