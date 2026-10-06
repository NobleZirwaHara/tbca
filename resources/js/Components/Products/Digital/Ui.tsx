import CoverArt from '@/Components/Art/CoverArt';
import type { ReactNode } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    ChevronLeft,
    ChevronRight,
    Download,
    FileText,
    Globe,
    Languages,
    Lock,
    Scale,
    ShieldCheck,
    type LucideIcon,
} from 'lucide-react';
import { Stepper } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import type { SharedProps } from '@/types';
import type { DpPagination } from './types';

/* ==========================================================================
   Digital Products building blocks shared across public, workspace and admin.
   ========================================================================== */

const TONES: Record<string, string> = {
    gold: 'from-ink-900 via-ink-800 to-gold-700',
    blue: 'from-ink-900 via-controlled-700 to-controlled-500',
    green: 'from-ink-900 via-verified-700 to-verified-500',
    teal: 'from-ink-900 via-ink-700 to-verified-600',
    purple: 'from-ink-900 via-referenced-700 to-referenced-500',
};

/** Product cover: gradient tile with the product title (replaces mockup photography). */
export function DpCover({ name, type, tone = 'gold', size = 'md', className, seed }: { name: string; type: string; tone?: string; size?: 'sm' | 'md' | 'lg'; className?: string; seed?: string }) {
    return (
        <div
            className={cn(
                'relative flex flex-col justify-between overflow-hidden rounded-[6px] bg-gradient-to-br p-3 text-parchment-100',
                TONES[tone] ?? TONES.gold,
                { sm: 'h-16 w-20 p-1.5', md: 'aspect-[4/3] w-full', lg: 'aspect-[4/3] w-full p-6' }[size],
                className,
            )}
            aria-hidden="true"
        >
            {/* Unique generated picture per product (seeded by slug or name); text sits on a scrim above it. */}
            <CoverArt seed={seed ?? name} category="digital-products" label={name} className="pointer-events-none absolute inset-0 h-full w-full" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/40 to-ink-950/10" />
            <span className={cn('relative font-bold tracking-wide text-gold-300 uppercase', size === 'sm' ? 'text-[0.4rem]' : 'text-[0.625rem]')}>{type}</span>
            <span
                className={cn(
                    'relative font-serif leading-tight font-semibold uppercase',
                    { sm: 'line-clamp-3 text-[0.45rem]', md: 'text-sm', lg: 'text-2xl' }[size],
                )}
            >
                {name}
            </span>
            {size !== 'sm' && <span className="relative text-[0.5625rem] text-ink-300">The Business Clinic.Africa™</span>}
        </div>
    );
}

/** "From ZAR x / or USD Available" price block. */
export function DpPrice({ zar, prefix = 'From', className, big }: { zar: number; prefix?: string; className?: string; big?: boolean }) {
    const price = usePrice();
    const { context } = usePage<SharedProps>().props;
    return (
        <div className={className}>
            <p className={cn('font-semibold text-ink-900', big ? 'font-serif text-3xl' : 'text-sm')}>
                {prefix && <span className={cn('font-normal text-ink-500', big ? 'text-lg' : 'text-xs')}>{prefix} </span>}
                {price(zar)}
            </p>
            <p className={cn('text-verified-600', big ? 'text-sm font-semibold' : 'text-[0.6875rem]')}>{context.currency === 'USD' ? 'ZAR source price applies' : 'or USD Available'}</p>
        </div>
    );
}

export function Chip({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'gold' | 'good' | 'warn' | 'bad' | 'info' | 'dark'; className?: string }) {
    const tones = {
        neutral: 'border-parchment-500 bg-parchment-100 text-ink-700',
        gold: 'border-gold-400 bg-gold-50 text-gold-800',
        good: 'border-verified-500/40 bg-verified-50 text-verified-700',
        warn: 'border-attested-500/40 bg-attested-50 text-attested-700',
        bad: 'border-risk-500/40 bg-risk-50 text-risk-700',
        info: 'border-controlled-500/40 bg-controlled-50 text-controlled-700',
        dark: 'border-ink-800 bg-ink-900 text-gold-300',
    }[tone];
    return <span className={cn('inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-[0.6875rem] font-semibold', tones, className)}>{children}</span>;
}

/** Trust strip shown under the hero and in the purchase flow footer. */
export const HERO_TRUST: { icon: LucideIcon; title: string; body?: string }[] = [
    { icon: BadgeCheck, title: 'Human-Reviewed Quality' },
    { icon: FileText, title: 'Version Controlled' },
    { icon: Download, title: 'Secure Downloads' },
    { icon: Languages, title: '7 Languages Available' },
    { icon: Globe, title: 'ZAR (Source) USD Available' },
];

export const FLOW_TRUST: { icon: LucideIcon; title: string; body: string }[] = [
    { icon: BadgeCheck, title: 'Human-Reviewed Quality', body: 'All products are expert-reviewed' },
    { icon: FileText, title: 'Version Controlled', body: 'You get the exact version you buy' },
    { icon: Download, title: 'Secure Downloads', body: 'Protected and traceable delivery' },
    { icon: Scale, title: 'South African Law Aligned', body: 'ECTA & CPA compliant' },
    { icon: Lock, title: 'Private & Confidential', body: 'Your data is always protected' },
];

export const ADMIN_TRUST: { icon: LucideIcon; title: string; body: string }[] = [
    { icon: BadgeCheck, title: 'Human-Reviewed Quality', body: 'All products are expert-reviewed' },
    { icon: ShieldCheck, title: 'Defensible & Verifiable', body: 'Every claim must have evidence' },
    { icon: FileText, title: 'Version Controlled', body: 'You get the exact version you buy' },
    { icon: Scale, title: 'South African Law Aligned', body: 'ECTA & CPA compliant' },
    { icon: Lock, title: 'Private & Confidential', body: 'Your data is always protected' },
];

export function TrustBand({ items, dark }: { items: { icon: LucideIcon; title: string; body?: string }[]; dark?: boolean }) {
    return (
        <ul className={cn('grid gap-3 rounded-[8px] border p-4 sm:grid-cols-2 lg:grid-cols-5', dark ? 'border-ink-700 bg-ink-950' : 'border-parchment-400 bg-white')}>
            {items.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex items-start gap-2.5">
                    <Icon className="mt-0.5 size-5 shrink-0 text-gold-500" aria-hidden="true" />
                    <div>
                        <p className={cn('text-[0.8125rem] font-semibold', dark ? 'text-parchment-100' : 'text-ink-900')}>{title}</p>
                        {body && <p className={cn('text-xs', dark ? 'text-ink-300' : 'text-ink-500')}>{body}</p>}
                    </div>
                </li>
            ))}
        </ul>
    );
}

export const PURCHASE_STEPS = ['Licence', 'Options', 'Disclosure', 'Checkout', 'Payment', 'Confirmation'];

export function PurchaseStepper({ current }: { current: number }) {
    return (
        <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white px-3 py-4">
            <Stepper steps={PURCHASE_STEPS} current={current} className="min-w-[520px]" />
        </div>
    );
}

/** Small icon + label / value meta item used in product headers. */
export function Meta({ icon: Icon, label, value }: { icon?: LucideIcon; label: string; value: ReactNode }) {
    return (
        <div className="flex items-start gap-2">
            {Icon && <Icon className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />}
            <div className="min-w-0">
                <p className="text-[0.6875rem] font-semibold text-ink-500">{label}</p>
                <p className="text-[0.8125rem] font-medium text-ink-900">{value}</p>
            </div>
        </div>
    );
}

/** Dark-headed summary card (Order Summary, Your Selection, Purchase & Download). */
export function DarkCard({ title, subtitle, children, className }: { title: ReactNode; subtitle?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={cn('overflow-hidden rounded-[8px] border border-parchment-400 bg-white', className)}>
            <header className="bg-ink-950 px-4 py-3 text-center">
                <h2 className="text-[0.8125rem] font-bold tracking-wide text-parchment-100 uppercase">{title}</h2>
                {subtitle && <p className="mt-0.5 text-xs text-gold-400">{subtitle}</p>}
            </header>
            <div className="p-4">{children}</div>
        </section>
    );
}

/** Query-string pagination used by library and admin tables. */
export function Pager({ pagination, label = 'results' }: { pagination: DpPagination; label?: string }) {
    const { page, pages, total, perPage } = pagination;
    const go = (p: number) => {
        const params = new URLSearchParams(window.location.search);
        params.set('page', String(p));
        router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveScroll: true, preserveState: true });
    };
    const from = total === 0 ? 0 : (page - 1) * perPage + 1;
    const to = Math.min(total, page * perPage);
    return (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-500">
            <span>
                Showing {from} to {to} of {total.toLocaleString()} {label}
            </span>
            <div className="flex items-center gap-1">
                <button type="button" disabled={page <= 1} onClick={() => go(page - 1)} className="rounded border border-parchment-500 bg-white p-1 disabled:opacity-40" aria-label="Previous page">
                    <ChevronLeft className="size-4" />
                </button>
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => go(p)}
                        className={cn('min-w-7 rounded border px-2 py-1 font-semibold', p === page ? 'border-gold-600 bg-gold-500 text-ink-900' : 'border-parchment-500 bg-white text-ink-700')}
                        aria-current={p === page ? 'page' : undefined}
                    >
                        {p}
                    </button>
                ))}
                {pages > 5 && <span className="px-1">… {pages}</span>}
                <button type="button" disabled={page >= pages} onClick={() => go(page + 1)} className="rounded border border-parchment-500 bg-white p-1 disabled:opacity-40" aria-label="Next page">
                    <ChevronRight className="size-4" />
                </button>
            </div>
        </div>
    );
}

/** Navigate with merged query params (filters/tabs), resetting page. */
export function useQueryNav(base: string, current: Record<string, unknown>) {
    return (patch: Record<string, string | string[] | undefined | null>) => {
        const merged: Record<string, unknown> = { ...current, ...patch, page: undefined };
        const clean = Object.fromEntries(
            Object.entries(merged).filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)),
        );
        router.get(base, clean as Record<string, string>, { preserveScroll: true, preserveState: true });
    };
}

/** SVG donut chart with legend. */
export function Donut({
    segments,
    centre,
    caption,
    size = 140,
}: {
    segments: { label: string; value: number; color: string }[];
    centre: ReactNode;
    caption?: ReactNode;
    size?: number;
}) {
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    const r = 15.9155;
    let offset = 25;
    return (
        <div className="flex flex-wrap items-center gap-5">
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                <svg viewBox="0 0 42 42" className="size-full -rotate-0" role="img" aria-label="Distribution chart">
                    <circle cx="21" cy="21" r={r} fill="none" stroke="var(--color-parchment-300)" strokeWidth="6" />
                    {segments.map((s) => {
                        const pct = (s.value / total) * 100;
                        const el = (
                            <circle
                                key={s.label}
                                cx="21"
                                cy="21"
                                r={r}
                                fill="none"
                                stroke={s.color}
                                strokeWidth="6"
                                strokeDasharray={`${pct} ${100 - pct}`}
                                strokeDashoffset={offset}
                            />
                        );
                        offset -= pct;
                        return el;
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-bold text-ink-900">{centre}</span>
                    {caption && <span className="text-[0.625rem] text-ink-500">{caption}</span>}
                </div>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
                {segments.map((s) => (
                    <li key={s.label} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 text-ink-700">
                            <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                            {s.label}
                        </span>
                        <span className="font-semibold text-ink-900 tabular-nums">
                            {s.value.toLocaleString()} <span className="font-normal text-ink-400">({((s.value / total) * 100).toFixed(1)}%)</span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export const CHART = ['#3f8f5a', '#2f6db3', '#d6a32e', '#e07b39', '#7a5cc2', '#c0392b', '#8a8f98'];

/** Colour-coded pill for the DP statuses, extending StatusPill tones. */
export function DpStatus({ status, className }: { status: string; className?: string }) {
    const s = status.toLowerCase().replace(/[\s-]+/g, '_');
    const tone = [
        'active', 'current', 'paid', 'pass', 'cleared', 'verified', 'eligible', 'delivered', 'resolved', 'contained', 'listed', 'approved', 'enabled', 'completed', 'released', 'ready_for_review',
    ].includes(s)
        ? 'good'
        : ['pending', 'in_review', 'under_review', 'processing', 'awaiting_evidence', 'pending_rework', 'partial', 'superseded', 'open', 'submitted', 'pass_on_signature', 'in_progress', 'price_proposed', 'in_analysis', 'awaiting_approval', 'needs_review', 'workflow_hold', 'pending_payment'].includes(s)
          ? 'warn'
          : ['failed', 'blocked', 'rejected', 'at_risk', 'withdrawn_unsafe', 'suspended', 'revoked', 'refunded', 'not_eligible', 'in_containment', 'high', 'block', 's1', 'declined', 'fail', 'not_active'].includes(s)
            ? 'bad'
            : ['legacy', 'historical', 'archived'].includes(s)
              ? 'neutral'
              : 'info';
    const tones = {
        good: 'border-verified-500/40 bg-verified-50 text-verified-700',
        warn: 'border-attested-500/40 bg-attested-50 text-attested-700',
        bad: 'border-risk-500/40 bg-risk-50 text-risk-700',
        neutral: 'border-parchment-500 bg-parchment-200 text-ink-600',
        info: 'border-controlled-500/40 bg-controlled-50 text-controlled-700',
    }[tone];
    return (
        <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[0.625rem] font-bold tracking-wide whitespace-nowrap uppercase', tones, className)}>
            {status.replace(/_/g, ' ')}
        </span>
    );
}

/** Light inline select for filter bars. */
export function FilterSelect({
    label,
    value,
    options,
    onChange,
}: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
}) {
    return (
        <label className="min-w-0">
            <span className="sr-only">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-9 w-full rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.8125rem] text-ink-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none"
            >
                <option value="">{label}</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

export function TextLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
    return (
        <Link href={href} className={cn('inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:text-gold-900 hover:underline', className)}>
            {children}
        </Link>
    );
}

/** Admin data table with header row; rows are pre-rendered cells. */
export function DataTable({ columns, rows, empty = 'No records match these filters.' }: { columns: ReactNode[]; rows: ReactNode[][]; empty?: string }) {
    return (
        <div className="overflow-x-auto rounded-[6px] border border-parchment-400">
            <table className="w-full text-left text-[0.75rem]">
                <thead className="bg-parchment-200 text-[0.6875rem] font-bold tracking-wide text-ink-600 uppercase">
                    <tr>
                        {columns.map((c, i) => (
                            <th key={i} scope="col" className="px-3 py-2 whitespace-nowrap">
                                {c}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-parchment-300 bg-white">
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="px-3 py-8 text-center text-ink-400">
                                {empty}
                            </td>
                        </tr>
                    )}
                    {rows.map((r, i) => (
                        <tr key={i} className="align-top hover:bg-parchment-100">
                            {r.map((cell, j) => (
                                <td key={j} className="px-3 py-2.5 text-ink-700">
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

/** Validation errors from the last request (server-side gate failures). */
export function ErrorList() {
    const { errors } = usePage<SharedProps & { errors: Record<string, string> }>().props;
    const list = Object.values(errors ?? {});
    if (list.length === 0) return null;
    return (
        <div role="alert" className="mb-4 rounded-[8px] border border-risk-500/30 bg-risk-50 p-3 text-[0.8125rem] text-risk-700">
            {list.map((e) => (
                <p key={e}>{e}</p>
            ))}
        </div>
    );
}
