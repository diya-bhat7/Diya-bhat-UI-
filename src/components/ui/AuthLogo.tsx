/**
 * AuthLogo - Straatix Partners logo for authentication pages
 * Professional horizontal dark blue design matching the brand
 */
export function AuthLogo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeConfig = {
        sm: { height: 'h-12', padding: 'px-4 py-2', iconSize: 'text-base', textSize: 'text-xs', gap: 'gap-2' },
        md: { height: 'h-16', padding: 'px-6 py-3', iconSize: 'text-xl', textSize: 'text-sm', gap: 'gap-3' },
        lg: { height: 'h-20', padding: 'px-8 py-4', iconSize: 'text-2xl', textSize: 'text-base', gap: 'gap-4' },
    };

    const config = sizeConfig[size];

    return (
        <div
            className={`${config.height} rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300`}
            style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
            }}
        >
            <div className={`h-full flex items-center ${config.padding} ${config.gap}`}>
                {/* S/P Monogram */}
                <div className="flex items-center justify-center leading-none">
                    <span
                        className={`${config.iconSize} text-white font-light`}
                        style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
                    >
                        S
                    </span>
                    <span
                        className={`${config.iconSize} text-white/60 font-light mx-0.5`}
                        style={{ fontFamily: 'Georgia, serif' }}
                    >
                        /
                    </span>
                    <span
                        className={`${config.iconSize} text-white font-light`}
                        style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}
                    >
                        P
                    </span>
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-10 bg-white/30" />

                {/* Brand Text */}
                <div className="flex flex-col leading-tight">
                    <span
                        className={`${config.textSize} text-white font-light tracking-[0.25em]`}
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    >
                        STRAATIX
                    </span>
                    <span
                        className={`${config.textSize} text-white font-light tracking-[0.25em]`}
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    >
                        PARTNERS
                    </span>
                </div>
            </div>
        </div>
    );
}
