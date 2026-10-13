import { useEffect, useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';

/* ==========================================================================
   Shared display primitives used across sections and consoles.
   ========================================================================== */

/** White bordered panel with an optional uppercase title row. */
export function Panel({
    title,
    action,
    children,
    className,
    tone = 'light',
}: {
    title?: ReactNode;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    tone?: 'light' | 'dark';
}) {
    return (
        <section
            className={cn(
                'rounded-[8px] border p-5',
                tone === 'dark' ? 'border-ink-700 bg-ink-900 text-parchment-100' : 'border-parchment-400 bg-white',
                className,
            )}
        >
            {(title || action) && (
                <header className="mb-4 flex items-center justify-between gap-3">
                    {title && (
                        <h2 className={cn('text-[0.8125rem] font-bold tracking-wide uppercase', tone === 'dark' ? 'text-gold-400' : 'text-ink-900')}>
                            {title}
                        </h2>
                    )}
                    {action}
                </header>
            )}
            {children}
        </section>
    );
}

/** Metric tile: label, large value, optional delta / caption. */
export function KpiTile({
    label,
    value,
    caption,
    tone = 'neutral',
    icon,
    className,
}: {
    label: ReactNode;
    value: ReactNode;
    caption?: ReactNode;
    tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'gold';
    icon?: ReactNode;
    className?: string;
}) {
    const toneClass = {
        neutral: 'text-ink-900',
        good: 'text-verified-500',
        warn: 'text-attested-500',
        bad: 'text-risk-500',
        gold: 'text-gold-600',
    }[tone];

    return (
        <div className={cn('rounded-[8px] border border-parchment-400 bg-white p-4', className)}>
            <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-ink-500">{label}</p>
                {icon && <span className="text-gold-600">{icon}</span>}
            </div>
            <p className={cn('mt-1.5 text-2xl font-bold tracking-tight', toneClass)}>{value}</p>
            {caption && <p className="mt-0.5 text-xs text-ink-400">{caption}</p>}
        </div>
    );
}

const pillTones = {
    neutral: 'bg-parchment-300 text-ink-700 border-parchment-500',
    good: 'bg-verified-50 text-verified-700 border-verified-500/30',
    warn: 'bg-attested-50 text-attested-700 border-attested-500/30',
    bad: 'bg-risk-50 text-risk-700 border-risk-500/30',
    info: 'bg-controlled-50 text-controlled-700 border-controlled-500/30',
    gold: 'bg-gold-50 text-gold-800 border-gold-400/50',
    dark: 'bg-ink-900 text-gold-300 border-ink-700',
} as const;

export type PillTone = keyof typeof pillTones;

/** Maps common record statuses to a tone so status colouring is consistent everywhere. */
export function statusTone(status: string): PillTone {
    const s = status.toLowerCase().replace(/[\s-]+/g, '_');
    if (['paid', 'active', 'approved', 'complete', 'completed', 'confirmed', 'current', 'passed', 'published', 'purchasable', 'verified', 'succeeded', 'cleared', 'delivered', 'resolved', 'signed'].includes(s)) return 'good';
    if (['pending', 'awaiting_payment', 'in_review', 'in_progress', 'draft', 'review', 'due', 'scheduled', 'processing', 'open', 'received'].includes(s)) return 'warn';
    if (['failed', 'overdue', 'blocked', 'rejected', 'cancelled', 'expired', 'declined', 'high', 'critical', 'locked', 'disputed'].includes(s)) return 'bad';
    return 'neutral';
}

export function StatusPill({ status, tone, className }: { status: string; tone?: PillTone; className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap capitalize',
                pillTones[tone ?? statusTone(status)],
                className,
            )}
        >
            {status.replace(/_/g, ' ')}
        </span>
    );
}

/** Uppercase product-type tag, e.g. DASHBOARD SPRINT / VERSION CONTROLLED. */
export function Tag({ children, tone = 'gold', className }: { children: ReactNode; tone?: PillTone; className?: string }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.6875rem] font-semibold tracking-wide uppercase',
                pillTones[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}

/**
 * Horizontal tabs. Uncontrolled by default; pass value/onChange to control.
 * Tab content is rendered by the caller from the active key.
 */
export function Tabs({
    tabs,
    value,
    onChange,
    className,
    tone = 'light',
}: {
    tabs: { key: string; label: ReactNode; count?: number }[];
    value: string;
    onChange: (key: string) => void;
    className?: string;
    tone?: 'light' | 'dark';
}) {
    return (
        <div role="tablist" className={cn('flex gap-1 overflow-x-auto border-b', tone === 'dark' ? 'border-ink-700' : 'border-parchment-400', className)}>
            {tabs.map((t) => {
                const active = t.key === value;
                return (
                    <button
                        key={t.key}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(t.key)}
                        className={cn(
                            '-mb-px shrink-0 border-b-2 px-3 py-2.5 text-[0.8125rem] font-medium whitespace-nowrap transition-colors',
                            active
                                ? 'border-gold-500 text-gold-700'
                                : tone === 'dark'
                                  ? 'border-transparent text-ink-300 hover:text-parchment-100'
                                  : 'border-transparent text-ink-500 hover:text-ink-900',
                        )}
                    >
                        {t.label}
                        {t.count !== undefined && <span className="ms-1.5 rounded-full bg-parchment-300 px-1.5 text-[0.6875rem] text-ink-600">{t.count}</span>}
                    </button>
                );
            })}
        </div>
    );
}

/** Numbered progress stepper for multi-stage journeys. `current` is 1-based. */
export function Stepper({
    steps,
    current,
    className,
    tone = 'light',
}: {
    steps: string[];
    current: number;
    className?: string;
    tone?: 'light' | 'dark';
}) {
    return (
        <ol className={cn('flex w-full items-start', className)}>
            {steps.map((label, i) => {
                const n = i + 1;
                const done = n < current;
                const active = n === current;
                return (
                    <li key={label} className="relative flex flex-1 flex-col items-center text-center">
                        {i > 0 && (
                            <span
                                aria-hidden="true"
                                className={cn('absolute top-4 end-1/2 h-0.5 w-full', done || active ? 'bg-gold-500' : tone === 'dark' ? 'bg-ink-700' : 'bg-parchment-400')}
                            />
                        )}
                        <span
                            className={cn(
                                'relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold',
                                done && 'border-gold-500 bg-gold-500 text-ink-900',
                                active && 'border-gold-500 bg-ink-900 text-gold-400',
                                !done && !active && (tone === 'dark' ? 'border-ink-600 bg-ink-900 text-ink-400' : 'border-parchment-500 bg-white text-ink-400'),
                            )}
                            aria-current={active ? 'step' : undefined}
                        >
                            {done ? <Check className="size-4" /> : n}
                        </span>
                        <span
                            className={cn(
                                'mt-1.5 px-1 text-[0.6875rem] leading-tight font-medium',
                                active ? (tone === 'dark' ? 'text-gold-300' : 'text-ink-900') : tone === 'dark' ? 'text-ink-400' : 'text-ink-500',
                            )}
                        >
                            {label}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

/** Accessible modal dialog. Closes on Escape and backdrop click. */
export function Modal({
    open,
    onClose,
    title,
    children,
    footer,
    size = 'md',
}: {
    open: boolean;
    onClose: () => void;
    title: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-ink-950/60" onClick={onClose} aria-hidden="true" />
            <div
                role="dialog"
                aria-modal="true"
                className={cn(
                    'relative max-h-[90vh] w-full overflow-y-auto rounded-[10px] bg-white shadow-raised',
                    { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[size],
                )}
            >
                <header className="flex items-center justify-between border-b border-parchment-400 px-5 py-3.5">
                    <h2 className="text-base font-semibold text-ink-900">{title}</h2>
                    <button type="button" onClick={onClose} className="rounded p-1 text-ink-400 hover:text-ink-900" aria-label="Close">
                        <X className="size-5" />
                    </button>
                </header>
                <div className="px-5 py-4">{children}</div>
                {footer && <footer className="flex justify-end gap-2 border-t border-parchment-400 px-5 py-3">{footer}</footer>}
            </div>
        </div>
    );
}

/** Simple progress bar (0-100). */
export function Progress({ value, className, tone = 'gold' }: { value: number; className?: string; tone?: 'gold' | 'good' | 'bad' }) {
    return (
        <div className={cn('h-2 w-full overflow-hidden rounded-full bg-parchment-300', className)}>
            <div
                className={cn('h-full rounded-full', { gold: 'bg-gold-500', good: 'bg-verified-500', bad: 'bg-risk-500' }[tone])}
                style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
            />
        </div>
    );
}

/** Compact table for consoles and portal lists. */
export function SimpleTable({
    columns,
    rows,
    empty = 'Nothing to show yet.',
    className,
}: {
    columns: ReactNode[];
    rows: ReactNode[][];
    empty?: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('overflow-x-auto rounded-[6px] border border-parchment-400', className)}>
            <table className="w-full text-start text-[0.8125rem]">
                <thead className="bg-parchment-200 text-xs font-semibold text-ink-600">
                    <tr>
                        {columns.map((c, i) => (
                            <th key={i} className="px-3 py-2 whitespace-nowrap">
                                {c}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-parchment-300 bg-white">
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="px-3 py-6 text-center text-ink-400">
                                {empty}
                            </td>
                        </tr>
                    )}
                    {rows.map((r, i) => (
                        <tr key={i} className="hover:bg-parchment-100">
                            {r.map((cell, j) => (
                                <td key={j} className="px-3 py-2 align-top text-ink-700">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/** Copyable reference chip, e.g. order / case numbers. */
export function ReferenceChip({ value }: { value: string }) {
    const [copied, setCopied] = useState(false);
    return (
        <button
            type="button"
            onClick={() => {
                void navigator.clipboard?.writeText(value);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-parchment-100 px-2 py-0.5 font-mono text-xs text-ink-800 hover:border-gold-500"
            title="Copy reference"
        >
            {value}
            {copied && <Check className="size-3 text-verified-500" />}
        </button>
    );
}
