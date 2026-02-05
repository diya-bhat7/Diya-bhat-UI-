/**
 * AuthLogo - Straatix Partners logo for authentication pages
 * Uses the dark blue logo design with white text
 */
export function AuthLogo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'h-12',
        md: 'h-16',
        lg: 'h-24',
    };

    return (
        <div
            className={`${sizeClasses[size]} w-auto flex items-center justify-center rounded-xl overflow-hidden shadow-lg`}
            style={{ aspectRatio: '16/9' }}
        >
            <div
                className="h-full w-full flex items-center justify-center px-6 py-4"
                style={{ backgroundColor: '#0f172a' }}
            >
                <div className="flex items-center gap-3">
                    {/* S/P Icon */}
                    <div className="flex flex-col items-center text-white font-light text-lg leading-none">
                        <span className="tracking-wider" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>S</span>
                        <div className="w-4 h-px bg-white/60 my-0.5" />
                        <span className="tracking-wider" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>P</span>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-10 bg-white/40" />

                    {/* Text */}
                    <div className="flex flex-col text-white">
                        <span
                            className="text-lg tracking-[0.3em] font-light"
                            style={{ fontFamily: 'system-ui, sans-serif' }}
                        >
                            STRAATIX
                        </span>
                        <span
                            className="text-lg tracking-[0.3em] font-light"
                            style={{ fontFamily: 'system-ui, sans-serif' }}
                        >
                            PARTNERS
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
