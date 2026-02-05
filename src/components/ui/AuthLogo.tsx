/**
 * AuthLogo - Straatix Partners logo for authentication pages
 * Exact match to brand identity: S/P monogram, sharp corners
 */
export function AuthLogo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeConfig = {
        sm: {
            container: 'py-3 px-5',
            monogramSize: 'text-2xl',
            textSize: 'text-[10px]',
            dividerH: 'h-8',
            gap: 'gap-3'
        },
        md: {
            container: 'py-4 px-6',
            monogramSize: 'text-3xl',
            textSize: 'text-xs',
            dividerH: 'h-10',
            gap: 'gap-4'
        },
        lg: {
            container: 'py-5 px-8',
            monogramSize: 'text-4xl',
            textSize: 'text-sm',
            dividerH: 'h-12',
            gap: 'gap-5'
        },
    };

    const config = sizeConfig[size];

    return (
        <div
            className={`${config.container} inline-flex items-center ${config.gap}`}
            style={{
                backgroundColor: '#1e3a5f'  /* Softer navy blue */
            }}
        >
            {/* S/P Monogram */}
            <div className="flex items-center justify-center">
                <span
                    className={`${config.monogramSize} text-white leading-none`}
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontStyle: 'italic',
                        fontWeight: 300
                    }}
                >
                    S
                </span>
                <span
                    className={`${config.monogramSize} text-white/60 leading-none`}
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontWeight: 300,
                        margin: '0 -2px'
                    }}
                >
                    /
                </span>
                <span
                    className={`${config.monogramSize} text-white leading-none`}
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontStyle: 'italic',
                        fontWeight: 300
                    }}
                >
                    P
                </span>
            </div>

            {/* Vertical Divider */}
            <div className={`w-px ${config.dividerH} bg-white/40`} />

            {/* Brand Text */}
            <div className="flex flex-col justify-center">
                <span
                    className={`${config.textSize} text-white font-light tracking-[0.25em] leading-relaxed`}
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                    STRAATIX
                </span>
                <span
                    className={`${config.textSize} text-white font-light tracking-[0.25em] leading-relaxed`}
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                    PARTNERS
                </span>
            </div>
        </div>
    );
}
