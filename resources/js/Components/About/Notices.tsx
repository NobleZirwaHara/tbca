import { Link } from '@inertiajs/react';
import { Info, Scale } from 'lucide-react';

/** Reusable compact AI disclosure banner (variant 1). */
export function AiCompactNotice() {
    return (
        <div className="flex items-start gap-2 rounded-[6px] border border-gold-300 bg-gold-50/50 p-3 text-[0.75rem] text-ink-700">
            <Info className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
            <span className="flex-1">AI assisted. Human review required. See full disclosure for details.</span>
            <Link href="/about/ai-disclosure" className="shrink-0 font-semibold text-gold-700 hover:underline">
                View AI Disclosure
            </Link>
        </div>
    );
}

/** Compact professional limitation notice for service pages (blueprint component 32). */
export function LimitationCompactNotice() {
    return (
        <div className="flex items-start gap-2 rounded-[6px] border border-gold-300 bg-gold-50/50 p-3 text-[0.75rem] text-ink-700">
            <Scale className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
            <span className="flex-1">TBCA provides decision support, not legal, tax, audit or regulated financial advice. Obtain independent professional advice before relying on any output.</span>
            <Link href="/about/professional-limitation-notice" className="shrink-0 font-semibold text-gold-700 hover:underline">
                Read notice
            </Link>
        </div>
    );
}
