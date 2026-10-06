import type { ReactNode } from 'react';
import { Check, CircleAlert, CircleX, Info, Minus, Star, TriangleAlert } from 'lucide-react';
import Breadcrumbs, { type Crumb } from '@/Components/ui/Breadcrumbs';
import { cn } from '@/lib/cn';

/* ==========================================================================
   Shared Marketplace / Partner Services building blocks.
   ========================================================================== */

export const zar = (n: number | null | undefined, decimals = 0) =>
    `R ${Number(n ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).replace(/,/g, ' ')}`;

export const zarCode = (n: number | null | undefined, decimals = 0) =>
    `ZAR ${Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

/** Light page header used on marketplace public and client pages. */
export function MkHeader({
    crumbs,
    eyebrow,
    title,
    lead,
    aside,
    children,
}: {
    crumbs?: Crumb[];
    eyebrow?: string;
    title: ReactNode;
    lead?: ReactNode;
    aside?: ReactNode;
    children?: ReactNode;
}) {
    return (
        <header className="border-b border-parchment-400 bg-white">
            <div className="container-tbca py-8 md:py-10">
                {crumbs && <Breadcrumbs items={crumbs} />}
                <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="max-w-3xl min-w-0">
                        {eyebrow && <p className="mb-2 text-[0.6875rem] font-semibold tracking-[0.16em] text-gold-700 uppercase">{eyebrow}</p>}
                        <h1 className="font-serif text-3xl leading-tight font-bold text-ink-900 md:text-[2.5rem]">{title}</h1>
                        {lead && <div className="mt-3 text-[0.9375rem] leading-relaxed text-ink-500">{lead}</div>}
                        {children}
                    </div>
                    {aside && <div className="w-full shrink-0 md:w-auto">{aside}</div>}
                </div>
            </div>
        </header>
    );
}

/** Dark hero band used across Partner Services (page code chip, serif title, gold statement). */
export function DarkHero({
    crumbs,
    code,
    title,
    subtitle,
    children,
    aside,
}: {
    crumbs?: Crumb[];
    code?: string;
    title: ReactNode;
    subtitle?: ReactNode;
    children?: ReactNode;
    aside?: ReactNode;
}) {
    return (
        <header className="relative overflow-hidden bg-ink-950 text-parchment-100">
            <div className="pointer-events-none absolute inset-0 motif-glow opacity-70" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0 motif-grid opacity-30" aria-hidden="true" />
            <div className="container-tbca relative py-9 md:py-12">
                {crumbs && (
                    <div className="[&_a]:text-gold-400 [&_li]:text-ink-300">
                        <Breadcrumbs items={crumbs} />
                    </div>
                )}
                <div className="grid gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        {code && <CodeChip code={code} dark />}
                        <h1 className="mt-2 font-serif text-3xl leading-tight font-bold md:text-[2.6rem]">{title}</h1>
                        {subtitle && <p className="mt-2 text-lg font-medium text-gold-400">{subtitle}</p>}
                        {children && <div className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-200">{children}</div>}
                    </div>
                    {aside && <div className="lg:col-span-5">{aside}</div>}
                </div>
            </div>
        </header>
    );
}

export function CodeChip({ code, dark = false }: { code: string; dark?: boolean }) {
    return (
        <span className={cn('inline-block rounded-[4px] border px-2 py-0.5 text-[0.6875rem] font-bold tracking-wide', dark ? 'border-gold-500 text-gold-400' : 'border-gold-500 bg-gold-50 text-gold-800')}>
            {code}
        </span>
    );
}

/** Gold-titled content card. */
export function Card({
    title,
    action,
    children,
    className,
    tone = 'white',
    number,
}: {
    title?: ReactNode;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    tone?: 'white' | 'cream' | 'dark' | 'green' | 'blue' | 'red';
    number?: number | string;
}) {
    const tones = {
        white: 'border-parchment-400 bg-white',
        cream: 'border-gold-300/60 bg-parchment-100',
        dark: 'border-ink-700 bg-ink-900 text-parchment-100',
        green: 'border-verified-500/30 bg-verified-50',
        blue: 'border-controlled-500/30 bg-controlled-50',
        red: 'border-risk-500/30 bg-risk-50',
    };
    return (
        <section className={cn('rounded-[8px] border p-5', tones[tone], className)}>
            {(title || action) && (
                <header className="mb-4 flex items-start justify-between gap-3">
                    {title && (
                        <h2 className={cn('flex items-center gap-2 text-[0.8125rem] font-bold tracking-wide uppercase', tone === 'dark' ? 'text-gold-400' : 'text-gold-700')}>
                            {number !== undefined && (
                                <span className="flex size-6 items-center justify-center rounded-full bg-ink-900 text-[0.6875rem] text-gold-400">{number}</span>
                            )}
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

/** Label / value rows. */
export function InfoRows({ rows, className, dense = false }: { rows: [ReactNode, ReactNode][]; className?: string; dense?: boolean }) {
    return (
        <dl className={cn('divide-y divide-parchment-300', className)}>
            {rows.map(([k, v], i) => (
                <div key={i} className={cn('grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-3 text-[0.8125rem]', dense ? 'py-1.5' : 'py-2')}>
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="font-medium break-words text-ink-900">{v ?? '—'}</dd>
                </div>
            ))}
        </dl>
    );
}

type Mark = 'good' | 'warn' | 'bad' | 'x' | 'info' | 'none';

const markIcon: Record<Mark, ReactNode> = {
    good: <Check className="size-3.5 text-verified-500" aria-hidden="true" />,
    warn: <TriangleAlert className="size-3.5 text-attested-500" aria-hidden="true" />,
    bad: <CircleAlert className="size-3.5 text-risk-500" aria-hidden="true" />,
    x: <CircleX className="size-3.5 text-risk-500" aria-hidden="true" />,
    info: <Info className="size-3.5 text-controlled-500" aria-hidden="true" />,
    none: <Minus className="size-3.5 text-ink-300" aria-hidden="true" />,
};

export function CheckList({ items, mark = 'good', className }: { items: (ReactNode | [ReactNode, Mark])[]; mark?: Mark; className?: string }) {
    return (
        <ul className={cn('space-y-1.5 text-[0.8125rem] text-ink-700', className)}>
            {items.map((it, i) => {
                const [label, m] = Array.isArray(it) ? it : [it, mark];
                return (
                    <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0">{markIcon[m as Mark]}</span>
                        <span>{label}</span>
                    </li>
                );
            })}
        </ul>
    );
}

/** Horizontal stage tracker with numbered dots (1-based current; current > length = all done). */
export function StageTrack({ stages, current, dates, className }: { stages: string[]; current: number; dates?: (string | undefined)[]; className?: string }) {
    return (
        <div className={cn('overflow-x-auto pb-1', className)}>
            <ol className="flex min-w-[640px] items-start">
                {stages.map((label, i) => {
                    const n = i + 1;
                    const done = n < current;
                    const active = n === current;
                    return (
                        <li key={label} className="relative flex flex-1 flex-col items-center text-center">
                            {i > 0 && <span aria-hidden="true" className={cn('absolute top-3.5 right-1/2 h-0.5 w-full', done || active ? 'bg-verified-500' : 'bg-parchment-400')} />}
                            <span
                                aria-current={active ? 'step' : undefined}
                                className={cn(
                                    'relative z-10 flex size-7 items-center justify-center rounded-full border-2 text-[0.6875rem] font-bold',
                                    done && 'border-verified-500 bg-verified-500 text-white',
                                    active && 'border-gold-500 bg-gold-500 text-ink-900',
                                    !done && !active && 'border-parchment-500 bg-white text-ink-400',
                                )}
                            >
                                {done ? <Check className="size-3.5" /> : n}
                            </span>
                            <span className={cn('mt-1.5 px-1 text-[0.6875rem] leading-tight font-semibold', active ? 'text-gold-800' : done ? 'text-ink-800' : 'text-ink-400')}>{label}</span>
                            <span className="text-[0.625rem] text-ink-400">{dates?.[i] ?? (done ? 'Complete' : active ? 'Current' : 'Pending')}</span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}

/** SVG donut with legend. */
const donutColors = ['#1f9d55', '#d6a32e', '#2f6fdd', '#d64545', '#8b5cf6', '#94a3b8', '#0ea5e9', '#f97316'];

export function Donut({ items, total, label, size = 120 }: { items: { label: string; value: number }[]; total?: ReactNode; label?: string; size?: number }) {
    const sum = items.reduce((a, b) => a + b.value, 0) || 1;
    const r = 42;
    const c = 2 * Math.PI * r;
    let offset = 0;
    return (
        <div className="flex flex-wrap items-center gap-4">
            <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label ?? 'Breakdown chart'} className="shrink-0 -rotate-90">
                <circle cx="50" cy="50" r={r} fill="none" stroke="#ece6d8" strokeWidth="14" />
                {items.map((it, i) => {
                    const len = (it.value / sum) * c;
                    const el = <circle key={it.label} cx="50" cy="50" r={r} fill="none" stroke={donutColors[i % donutColors.length]} strokeWidth="14" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
                    offset += len;
                    return el;
                })}
                <text x="50" y="54" textAnchor="middle" className="fill-ink-900 text-[16px] font-bold" transform="rotate(90 50 50)">
                    {total ?? sum}
                </text>
            </svg>
            <ul className="min-w-0 flex-1 space-y-1 text-xs">
                {items.map((it, i) => (
                    <li key={it.label} className="flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5 capitalize">
                            <span className="size-2.5 shrink-0 rounded-full" style={{ background: donutColors[i % donutColors.length] }} />
                            <span className="truncate text-ink-700">{it.label}</span>
                        </span>
                        <span className="font-semibold text-ink-900">
                            {it.value} <span className="font-normal text-ink-400">({Math.round((it.value / sum) * 100)}%)</span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function MiniBar({ value, max = 100, tone = 'gold', label }: { value: number; max?: number; tone?: 'gold' | 'good' | 'bad' | 'blue' | 'warn'; label?: string }) {
    const pct = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
    const colors = { gold: 'bg-gold-500', good: 'bg-verified-500', bad: 'bg-risk-500', blue: 'bg-controlled-500', warn: 'bg-attested-500' };
    return (
        <div className="flex items-center gap-2" aria-label={label}>
            <div className="h-1.5 w-full min-w-12 overflow-hidden rounded-full bg-parchment-300">
                <div className={cn('h-full rounded-full', colors[tone])} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

export function Stars({ value, size = 'sm' }: { value: number | null; size?: 'sm' | 'md' }) {
    const v = value ?? 0;
    return (
        <span className="inline-flex items-center gap-0.5" aria-label={`${v} out of 5`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={cn(size === 'md' ? 'size-5' : 'size-3.5', i <= Math.round(v) ? 'fill-gold-500 text-gold-500' : 'text-parchment-500')} aria-hidden="true" />
            ))}
        </span>
    );
}

export function Notice({ tone = 'info', children, className, icon }: { tone?: 'info' | 'warn' | 'bad' | 'good' | 'gold'; children: ReactNode; className?: string; icon?: ReactNode }) {
    const tones = {
        info: 'border-controlled-500/30 bg-controlled-50 text-controlled-700',
        warn: 'border-attested-500/40 bg-attested-50 text-attested-700',
        bad: 'border-risk-500/30 bg-risk-50 text-risk-700',
        good: 'border-verified-500/30 bg-verified-50 text-verified-700',
        gold: 'border-gold-400/60 bg-gold-50 text-ink-800',
    };
    const icons = { info: <Info className="size-4" />, warn: <TriangleAlert className="size-4" />, bad: <CircleAlert className="size-4" />, good: <Check className="size-4" />, gold: <Info className="size-4" /> };
    return (
        <div role="note" className={cn('flex items-start gap-2.5 rounded-[6px] border px-4 py-3 text-[0.8125rem]', tones[tone], className)}>
            <span className="mt-0.5 shrink-0">{icon ?? icons[tone]}</span>
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}

/** Horizontal strip of label/value facts (e.g. "BRF ID | Price Version | Gate"). */
export function FactStrip({ items, className }: { items: { label: ReactNode; value: ReactNode; icon?: ReactNode }[]; className?: string }) {
    return (
        <div className={cn('grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border border-gold-300/60 bg-gold-300/40 sm:grid-cols-3 lg:grid-flow-col lg:grid-cols-none', className)}>
            {items.map((it, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white px-4 py-3">
                    {it.icon && <span className="mt-0.5 text-gold-600">{it.icon}</span>}
                    <div className="min-w-0">
                        <p className="text-[0.6875rem] font-medium text-ink-500">{it.label}</p>
                        <p className="text-[0.8125rem] font-bold break-words text-ink-900">{it.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Simple line chart (SVG) for trends. */
export function LineChart({ points, height = 140, format = (n: number) => String(n) }: { points: { label: string; value: number }[]; height?: number; format?: (n: number) => string }) {
    const max = Math.max(...points.map((p) => p.value), 1);
    const w = 300;
    const step = points.length > 1 ? w / (points.length - 1) : w;
    const coords = points.map((p, i) => [i * step, height - 20 - (p.value / max) * (height - 40)] as const);
    return (
        <svg viewBox={`-10 0 ${w + 20} ${height}`} className="w-full" role="img" aria-label="Trend chart">
            <polyline fill="none" stroke="#2f6fdd" strokeWidth="2.5" points={coords.map((c) => c.join(',')).join(' ')} />
            {coords.map(([x, y], i) => (
                <g key={i}>
                    <circle cx={x} cy={y} r="3.5" fill="#2f6fdd">
                        <title>{`${points[i].label}: ${format(points[i].value)}`}</title>
                    </circle>
                    <text x={x} y={height - 4} textAnchor="middle" className="fill-ink-400 text-[10px]">
                        {points[i].label}
                    </text>
                </g>
            ))}
        </svg>
    );
}

/** Right-rail reference card used by Partner Services journey pages. */
export function RefCard({ title = 'Request Reference', reference, rows, badge }: { title?: string; reference: string; rows: [ReactNode, ReactNode][]; badge?: ReactNode }) {
    return (
        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
            <p className="text-xs text-ink-500">{title}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <p className="font-serif text-xl font-bold text-ink-900">{reference}</p>
                {badge}
            </div>
            <InfoRows rows={rows} dense className="mt-3" />
        </div>
    );
}

export function Responsibility({ title = 'Your Responsibility', children }: { title?: string; children: ReactNode }) {
    return (
        <div className="rounded-[8px] border border-gold-400/60 bg-parchment-100 p-5 text-[0.8125rem] text-ink-700">
            <p className="mb-2 font-semibold text-gold-800">{title}</p>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

export function priorityTone(p: string | null | undefined): 'bad' | 'warn' | 'good' | 'neutral' {
    const s = (p ?? '').toLowerCase();
    if (['high', 'critical'].includes(s)) return 'bad';
    if (s === 'medium') return 'warn';
    if (s === 'low') return 'good';
    return 'neutral';
}

/** Maps Marketplace / Partner Services categories onto CoverArt colour families so each category reads as one set. */
const ART_FAMILY: Record<string, string> = {
    'financial-advisory': 'business-management',
    'due-diligence': 'due-diligence',
    'market-research': 'research-reports',
    'project-management': 'project-advisory',
    'compliance-risk': 'diagnostics',
    'tech-digital': 'technology',
    'automation-ai': 'ai-automation',
    'legal-contracts': 'templates-toolkits',
    'legal-services': 'templates-toolkits',
    'audit-assurance': 'data-dashboards',
    'tax-advisory': 'business-management',
    'esg-advisory': 'data-dashboards',
    'environmental-services': 'templates-toolkits',
    'engineering-technical': 'technology',
    'project-construction': 'project-advisory',
    'corporate-finance': 'digital-products',
    'specialist-compliance': 'diagnostics',
    'business-rescue': 'due-diligence',
    valuation: 'digital-products',
    'labour-employment': 'courses-learning',
    'corporate-governance': 'subscriptions-retainers',
};

export const artCategory = (category?: string | null) => ART_FAMILY[category ?? ''] ?? category ?? undefined;
