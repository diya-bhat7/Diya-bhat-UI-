/**
 * AuthLogo - Straatix Partners logo for authentication pages
 * Exact match to brand identity: S/P monogram with diagonal slash
 */
export function AuthLogo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeConfig = {
        sm: {
            container: 'py-4 px-6',
            monogramSize: 'text-3xl',
            textSize: 'text-[11px]',
            dividerH: 'h-10',
            gap: 'gap-4'
        },
        md: {
            container: 'py-5 px-8',
            monogramSize: 'text-4xl',
            textSize: 'text-xs',
            dividerH: 'h-12',
            gap: 'gap-5'
        },
        lg: {
            container: 'py-6 px-10',
            monogramSize: 'text-5xl',
            textSize: 'text-sm',
            dividerH: 'h-14',
            gap: 'gap-6'
        },
    };

    const config = sizeConfig[size];

    return (
        <div
            className={`${config.container} rounded-lg inline-flex items-center ${config.gap}`}
            style={{
                backgroundColor: '#0f172a'
            }}
        >
            {/* S/P Monogram - Crossed/Overlapping Style */}
            <div className="relative flex items-center justify-center">
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
                    className={`${config.monogramSize} text-white/70 leading-none -mx-1`}
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontWeight: 300
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
                    className={`${config.textSize} text-white font-normal tracking-[0.3em] leading-relaxed`}
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                    STRAATIX
                </span>
                <span
                    className={`${config.textSize} text-white font-normal tracking-[0.3em] leading-relaxed`}
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                    PARTNERS
                </span>
            </div>
        </div>
    );
}
