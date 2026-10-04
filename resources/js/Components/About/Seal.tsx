import { ShieldCheck } from 'lucide-react';
import AfricaMark from '@/Components/AfricaMark';
import { cn } from '@/lib/cn';

/** Circular gold-on-black seal ("TRUSTED · ETHICAL · IMPACTFUL · VERIFIED BY TBCA"). Pure SVG, no imagery. */
export default function Seal({
    top = 'TRUSTED · ETHICAL · IMPACTFUL',
    bottom = 'VERIFIED BY TBCA',
    variant = 'africa',
    className,
}: {
    top?: string;
    bottom?: string;
    variant?: 'africa' | 'shield';
    className?: string;
}) {
    return (
        <div className={cn('relative aspect-square w-56 shrink-0', className)} role="img" aria-label={`${top} — ${bottom}`}>
            <svg viewBox="0 0 200 200" className="absolute inset-0 size-full drop-shadow-xl" aria-hidden="true">
                <defs>
                    <path id="seal-top" d="M 30 100 A 70 70 0 0 1 170 100" />
                    <path id="seal-bottom" d="M 34 112 A 68 68 0 0 0 166 112" />
                    <radialGradient id="seal-bg" cx="50%" cy="40%" r="65%">
                        <stop offset="0%" stopColor="#1f1f1f" />
                        <stop offset="100%" stopColor="#050505" />
                    </radialGradient>
                </defs>
                <circle cx="100" cy="100" r="97" fill="#c9a24a" />
                <circle cx="100" cy="100" r="92" fill="url(#seal-bg)" />
                <circle cx="100" cy="100" r="62" fill="none" stroke="#c9a24a" strokeWidth="1.5" />
                <text fill="#e3c372" fontSize="13" fontWeight="700" letterSpacing="2.5">
                    <textPath href="#seal-top" startOffset="50%" textAnchor="middle">
                        {top}
                    </textPath>
                </text>
                <text fill="#e3c372" fontSize="13" fontWeight="700" letterSpacing="2.5">
                    <textPath href="#seal-bottom" startOffset="50%" textAnchor="middle">
                        {bottom}
                    </textPath>
                </text>
                <text x="38" y="105" fill="#e3c372" fontSize="10">★</text>
                <text x="154" y="105" fill="#e3c372" fontSize="10">★</text>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {variant === 'africa' ? (
                    <AfricaMark className="h-[38%] w-auto text-gold-400" strokeWidth={1.4} />
                ) : (
                    <ShieldCheck className="size-[34%] text-gold-400" strokeWidth={1.4} aria-hidden="true" />
                )}
            </div>
        </div>
    );
}
