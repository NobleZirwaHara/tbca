import { cn } from '@/lib/cn';
import type { LedgerCode } from '@/types';

const registry: Record<LedgerCode, { label: string; short: string; tone: string }> = {
    V: {
        label: 'Ledger V — VERIFIED',
        short: 'VERIFIED',
        tone: 'bg-verified-50 text-verified-700 border-verified-500/35',
    },
    A: {
        label: 'Ledger A — TBCA ATTESTED',
        short: 'TBCA ATTESTED',
        tone: 'bg-attested-50 text-attested-700 border-attested-500/35',
    },
    R: {
        label: 'Ledger R — REFERENCED',
        short: 'REFERENCED',
        tone: 'bg-referenced-50 text-referenced-700 border-referenced-500/35',
    },
    G: {
        label: 'Ledger G — EVIDENCE-CONTROLLED',
        short: 'EVIDENCE-CONTROLLED',
        tone: 'bg-controlled-50 text-controlled-700 border-controlled-500/35',
    },
};

interface LedgerChipProps {
    code: LedgerCode;
    full?: boolean;
    className?: string;
}

/**
 * Every public trust claim is classified by evidence class.
 * The chip states how a claim is verified, attested or referenced.
 */
export default function LedgerChip({ code, full = true, className }: LedgerChipProps) {
    const entry = registry[code] ?? registry.R;

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-[3px] border px-2 py-[3px]',
                'text-[0.6875rem] font-semibold uppercase tracking-[0.06em]',
                entry.tone,
                className,
            )}
        >
            {full ? entry.label : entry.short}
        </span>
    );
}

export function ConfidenceChip({ grade, className }: { grade: string; className?: string }) {
    const tones: Record<string, string> = {
        A: 'bg-verified-50 text-verified-700 border-verified-500/35',
        B: 'bg-attested-50 text-attested-700 border-attested-500/35',
        C: 'bg-referenced-50 text-referenced-700 border-referenced-500/35',
        D: 'bg-controlled-50 text-controlled-700 border-controlled-500/35',
        E: 'bg-risk-50 text-risk-700 border-risk-500/35',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-[3px] border px-2 py-[3px]',
                'text-[0.6875rem] font-semibold uppercase tracking-[0.06em]',
                tones[grade] ?? tones.C,
                className,
            )}
        >
            Confidence {grade}
        </span>
    );
}
