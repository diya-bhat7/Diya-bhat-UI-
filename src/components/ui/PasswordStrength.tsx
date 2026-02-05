import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, AlertCircle, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

interface PasswordStrengthProps {
    password: string;
}

interface PasswordMatchProps {
    password: string;
    confirmPassword: string;
}

// Password strength criteria
function getPasswordStrength(password: string): {
    score: number;
    label: 'weak' | 'medium' | 'strong';
    color: string;
    bgColor: string;
    criteria: { label: string; met: boolean }[];
} {
    const criteria = [
        { label: 'At least 6 characters', met: password.length >= 6 },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
        { label: 'Contains number', met: /\d/.test(password) },
        { label: 'Contains special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    const score = criteria.filter(c => c.met).length;

    if (score <= 2) {
        return {
            score,
            label: 'weak',
            color: 'text-red-500',
            bgColor: 'bg-red-500',
            criteria,
        };
    } else if (score <= 4) {
        return {
            score,
            label: 'medium',
            color: 'text-amber-500',
            bgColor: 'bg-amber-500',
            criteria,
        };
    } else {
        return {
            score,
            label: 'strong',
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500',
            criteria,
        };
    }
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthProps) {
    const strength = useMemo(() => getPasswordStrength(password), [password]);

    if (!password) return null;

    return (
        <div className="mt-2 space-y-2">
            {/* Strength Bar */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className={cn("h-full transition-all duration-300", strength.bgColor)}
                        style={{ width: `${(strength.score / 5) * 100}%` }}
                    />
                </div>
                <div className={cn("flex items-center gap-1 text-xs font-medium", strength.color)}>
                    {strength.label === 'weak' && <ShieldAlert className="h-3.5 w-3.5" />}
                    {strength.label === 'medium' && <Shield className="h-3.5 w-3.5" />}
                    {strength.label === 'strong' && <ShieldCheck className="h-3.5 w-3.5" />}
                    <span className="capitalize">{strength.label}</span>
                </div>
            </div>

            {/* Criteria List (only show if password is weak or medium) */}
            {strength.label !== 'strong' && (
                <div className="space-y-1">
                    {strength.criteria.map((item, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center gap-2 text-xs transition-colors",
                                item.met ? "text-emerald-500" : "text-muted-foreground"
                            )}
                        >
                            {item.met ? (
                                <Check className="h-3 w-3" />
                            ) : (
                                <X className="h-3 w-3" />
                            )}
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function PasswordMatchIndicator({ password, confirmPassword }: PasswordMatchProps) {
    if (!confirmPassword) return null;

    const matches = password === confirmPassword;

    return (
        <div className={cn(
            "mt-2 flex items-center gap-2 text-xs font-medium transition-colors",
            matches ? "text-emerald-500" : "text-red-500"
        )}>
            {matches ? (
                <>
                    <Check className="h-3.5 w-3.5" />
                    Passwords match
                </>
            ) : (
                <>
                    <AlertCircle className="h-3.5 w-3.5" />
                    Passwords do not match
                </>
            )}
        </div>
    );
}
