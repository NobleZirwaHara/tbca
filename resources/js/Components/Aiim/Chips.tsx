import { AlertTriangle, BadgeCheck, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Evidence } from '@/types/aiim';

const tones = {
    good: 'border-verified-500/40 bg-verified-50 text-verified-700',
    warn: 'border-attested-500/40 bg-attested-50 text-attested-700',
    bad: 'border-risk-500/40 bg-risk-50 text-risk-700',
    info: 'border-controlled-500/40 bg-controlled-50 text-controlled-700',
    gold: 'border-gold-400/60 bg-gold-50 text-gold-800',
    purple: 'border-referenced-500/40 bg-referenced-50 text-referenced-700',
    dark: 'border-ink-600 bg-ink-800 text-parchment-200',
} as const;

export type ChipTone = keyof typeof tones;

export function Chip({ children, tone = 'gold', icon, className }: { children: ReactNode; tone?: ChipTone; icon?: ReactNode; className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap', tones[tone], className)}>
            {icon}
            {children}
        </span>
    );
}

export function levelTone(level: string): ChipTone {
    const l = level.toLowerCase();
    if (l.includes('very high') || l === 'high' || l.includes('high opportunity') || l === 'low' || l.includes('verified') || l === 'completed' || l === 'active' || l === 'yes' || l === 'passed') return 'good';
    if (l.includes('medium') || l.includes('moderate') || l.includes('growth') || l.includes('progress') || l.includes('review') || l.includes('pending')) return 'warn';
    if (l.includes('emerging') || l.includes('elevated') || l.includes('blocked') || l === 'no') return 'bad';
    return 'gold';
}

/** Risk levels read the other way round: High risk is bad. */
export function riskTone(level: string): ChipTone {
    const l = level.toLowerCase();
    if (l.startsWith('high') || l.includes('elevated')) return 'bad';
    if (l.includes('medium') || l.includes('moderate')) return 'warn';
    return 'good';
}

export function ConfidenceChip({ evidence, short = false }: { evidence: Pick<Evidence, 'confidence' | 'grade' | 'gradeLabel' | 'tone'>; short?: boolean }) {
    return (
        <Chip tone={evidence.tone} icon={<ShieldCheck className="size-3" />}>
            {short ? `Confidence: ${evidence.gradeLabel}` : `Confidence ${evidence.grade} · ${evidence.gradeLabel} (${evidence.confidence}%)`}
        </Chip>
    );
}

export function VerificationChip({ label }: { label: string }) {
    const human = label.toLowerCase().includes('human') || label.toLowerCase().includes('independ');
    return (
        <Chip tone={human ? 'info' : 'good'} icon={human ? <UserCheck className="size-3" /> : <BadgeCheck className="size-3" />}>
            {label}
        </Chip>
    );
}

/** Mandatory evidence strip: source, date, confidence, verification and next review (GAP-009). */
export function EvidenceStrip({ evidence, dark = false }: { evidence: Evidence; dark?: boolean }) {
    return (
        <div className={cn('flex flex-wrap items-center gap-2 text-[0.6875rem]', dark ? 'text-ink-300' : 'text-ink-500')}>
            <ConfidenceChip evidence={evidence} short />
            <VerificationChip label={evidence.verification} />
            <Chip tone="good" icon={<BadgeCheck className="size-3" />}>Source Verified</Chip>
            {evidence.source && <span>Source: {evidence.source}</span>}
            {evidence.updated && <span>· Updated {evidence.updated}</span>}
            {evidence.nextReview && <span>· Next review {evidence.nextReview}</span>}
            {!evidence.sellable && (
                <Chip tone="bad" icon={<AlertTriangle className="size-3" />}>Below sellability threshold</Chip>
            )}
        </div>
    );
}

export function LockedTag({ children = 'Locked' }: { children?: ReactNode }) {
    return <Chip tone="dark" icon={<Lock className="size-3" />}>{children}</Chip>;
}

export function SyntheticNotice({ className }: { className?: string }) {
    return (
        <div className={cn('rounded-[6px] border border-attested-500/30 bg-attested-50 px-3 py-2 text-xs text-attested-700', className)}>
            <p className="font-bold tracking-wide uppercase">Synthetic data only</p>
            <p>AIIM uses AI and human-reviewed public intelligence. Not financial or legal advice.</p>
        </div>
    );
}

/** Visible confidence label for figures that are layout placeholders until live API / Test Data arrives. */
export function PlaceholderTag({ className, short = false }: { className?: string; short?: boolean }) {
    return (
        <span title="Placeholder — to be replaced by API data" className={cn('inline-flex items-center gap-1 rounded-full border border-dashed border-attested-500/60 bg-attested-50 px-2 py-0.5 text-[0.625rem] font-semibold whitespace-nowrap text-attested-700', className)}>
            <AlertTriangle className="size-3" />
            {short ? 'Placeholder' : 'Placeholder — to be replaced by API data'}
        </span>
    );
}
