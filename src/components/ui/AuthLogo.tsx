/**
 * AuthLogo - Straatix Partners logo for authentication pages
 * Elegant design matching the brand identity
 */
export function AuthLogo({ size = 'lg' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeConfig = {
        sm: {
            container: 'h-14 px-5',
            monogram: 'text-lg',
            dividerH: 'h-6',
            text: 'text-[10px]',
            spacing: 'tracking-[0.2em]'
        },
        md: {
            container: 'h-16 px-6',
            monogram: 'text-xl',
            dividerH: 'h-7',
            text: 'text-xs',
            spacing: 'tracking-[0.2em]'
        },
        lg: {
            container: 'h-[72px] px-8',
            monogram: 'text-2xl',
            dividerH: 'h-8',
            text: 'text-sm',
            spacing: 'tracking-[0.25em]'
        },
    };

    const config = sizeConfig[size];

    return (
        <div
            className={`${config.container} rounded-xl inline-flex items-center gap-4`}
            style={{
                background: '#0f172a',
                boxShadow: '0 10px 40px -10px rgba(15, 23, 42, 0.5)'
            }}
        >
            {/* S/P Monogram - Stacked Style */}
            <div className="flex flex-col items-center justify-center leading-[0.9]">
                <span
                    className={`${config.monogram} text-white`}
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
                >
                    S
                </span>
                <div className="w-4 h-[1px] bg-white/50 my-[2px]" />
                <span
                    className={`${config.monogram} text-white`}
                    style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontStyle: 'italic' }}
                >
                    P
                </span>
            </div>

            {/* Vertical Divider */}
            <div className={`w-[1px] ${config.dividerH} bg-white/30`} />

            {/* Brand Text */}
            <div className="flex flex-col justify-center leading-tight">
                <span
                    className={`${config.text} ${config.spacing} text-white font-normal`}
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                    STRAATIX
                </span>
                <span
                    className={`${config.text} ${config.spacing} text-white font-normal`}
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                    PARTNERS
                </span>
            </div>
        </div>
    );
}
