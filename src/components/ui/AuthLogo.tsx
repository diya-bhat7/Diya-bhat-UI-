/**
 * AuthLogo - Straatix Partners logo for authentication pages
 * Premium design with subtle enhancements
 */
export function AuthLogo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeConfig = {
        sm: {
            container: 'py-4 px-6',
            monogramSize: 'text-2xl',
            textSize: 'text-[10px]',
            dividerH: 'h-8',
            gap: 'gap-4'
        },
        md: {
            container: 'py-5 px-8',
            monogramSize: 'text-3xl',
            textSize: 'text-xs',
            dividerH: 'h-10',
            gap: 'gap-5'
        },
        lg: {
            container: 'py-6 px-10',
            monogramSize: 'text-4xl',
            textSize: 'text-sm',
            dividerH: 'h-12',
            gap: 'gap-6'
        },
    };

    const config = sizeConfig[size];

    return (
        <div
            className={`${config.container} inline-flex items-center ${config.gap} relative`}
            style={{
                background: 'linear-gradient(145deg, #1a3654 0%, #0d2137 100%)',
                boxShadow: '0 8px 32px rgba(13, 33, 55, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.05)'
            }}
        >
            {/* S/P Monogram */}
            <div className="flex items-center justify-center">
                <span
                    className={`${config.monogramSize} text-white leading-none`}
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontStyle: 'italic',
                        fontWeight: 400,
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                >
                    S
                </span>
                <span
                    className={`${config.monogramSize} text-white/50 leading-none`}
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontWeight: 300,
                        margin: '0 1px'
                    }}
                >
                    /
                </span>
                <span
                    className={`${config.monogramSize} text-white leading-none`}
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontStyle: 'italic',
                        fontWeight: 400,
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                >
                    P
                </span>
            </div>

            {/* Vertical Divider - thinner and more elegant */}
            <div
                className={`${config.dividerH}`}
                style={{
                    width: '1px',
                    background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.4) 20%, rgba(255,255,255,0.4) 80%, transparent 100%)'
                }}
            />

            {/* Brand Text */}
            <div className="flex flex-col justify-center">
                <span
                    className={`${config.textSize} text-white font-light leading-relaxed`}
                    style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        letterSpacing: '0.35em',
                        textShadow: '0 1px 2px rgba(0,0,0,0.15)'
                    }}
                >
                    STRAATIX
                </span>
                <span
                    className={`${config.textSize} text-white/90 font-light leading-relaxed`}
                    style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        letterSpacing: '0.35em',
                        textShadow: '0 1px 2px rgba(0,0,0,0.15)'
                    }}
                >
                    PARTNERS
                </span>
            </div>
        </div>
    );
}
