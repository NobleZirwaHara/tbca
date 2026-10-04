import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { BadgeCheck, Check, CheckCircle2, ChevronRight, Info, Lock, Receipt, ShieldCheck, UserCheck } from 'lucide-react';
import { cn } from '@/lib/cn';
import { ZAR_PER_USD } from '@/lib/money';
import DdIcon from './DdIcon';
import type { DdChip, DdJourneyStep, DdPrice } from '@/types/due-diligence';

/* ---------------------------------------------------------------- money */

export function rand(n: number | null | undefined, decimals = 0): string {
    if (n === null || n === undefined) return 'Quote';
    return 'R ' + n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function usd(n: number | null | undefined): string {
    if (n === null || n === undefined) return '';
    return 'USD ' + Math.round(n / ZAR_PER_USD).toLocaleString('en-US');
}

export function shortDate(iso?: string | null, withTime = false): string {
    if (!iso) return '—';
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return withTime ? `${date}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} SAST` : date;
}

/* ---------------------------------------------------------------- hero */

export function JourneyBox({ steps, current, completed = 0, title = 'Where you are in the journey' }: { steps: DdJourneyStep[]; current: number; completed?: number; title?: string }) {
    return (
        <div className="rounded-[12px] border border-ink-700 bg-ink-900/80 p-4 backdrop-blur">
            <p className="mb-3 text-center text-[0.8125rem] font-semibold text-parchment-200">{title}</p>
            <ol className="flex items-start" aria-label="Due diligence journey">
                {steps.map((s, i) => {
                    const done = s.n <= completed;
                    const active = s.n === current;
                    return (
                        <li key={s.n} className="relative flex flex-1 flex-col items-center text-center">
                            {i > 0 && <span aria-hidden="true" className={cn('absolute top-4 right-1/2 h-0.5 w-full', done || active ? 'bg-gold-500/70' : 'bg-ink-700')} />}
                            <span
                                aria-current={active ? 'step' : undefined}
                                className={cn(
                                    'relative z-10 flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold',
                                    done && !active && 'border-verified-500 bg-verified-500 text-white',
                                    active && 'border-gold-400 bg-gold-500 text-ink-950 shadow-[0_0_16px_rgba(214,163,46,0.6)]',
                                    !done && !active && 'border-ink-600 bg-ink-800 text-ink-300',
                                )}
                            >
                                {done && !active ? <Check className="size-4" /> : s.n}
                            </span>
                            <span className={cn('mt-1.5 hidden px-0.5 text-[0.625rem] leading-tight sm:block', active ? 'font-semibold text-gold-300' : 'text-ink-300')}>{s.label}</span>
                        </li>
                    );
                })}
            </ol>
            <p className="mt-2 text-center text-[0.6875rem] text-gold-300 sm:hidden">
                Step {current}: {steps[current - 1]?.label}
            </p>
        </div>
    );
}

export function StateChips({ chips }: { chips: DdChip[] }) {
    return (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Case states">
            {chips.map((c) => (
                <li key={c.label} className="rounded-[4px] border border-gold-500/30 bg-ink-900 px-2.5 py-1 text-[0.6875rem] text-parchment-200">
                    <span className="text-gold-400">{c.label}:</span> <span className="font-semibold">{c.value}</span>
                </li>
            ))}
        </ul>
    );
}

export function DdHero({
    crumbs,
    eyebrow,
    title,
    subtitle,
    description,
    journey,
    current,
    completed,
    chips,
    aside,
    children,
}: {
    crumbs?: { label: string; href?: string }[];
    eyebrow?: string;
    title: ReactNode;
    subtitle?: ReactNode;
    description?: ReactNode;
    journey?: DdJourneyStep[];
    current?: number;
    completed?: number;
    chips?: DdChip[];
    aside?: ReactNode;
    children?: ReactNode;
}) {
    return (
        <section className="relative overflow-hidden bg-ink-950">
            <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0 motif-grid opacity-30" aria-hidden="true" />
            <ShieldCheck className="pointer-events-none absolute -top-6 right-6 hidden size-48 text-gold-500/15 xl:block" aria-hidden="true" />
            <div className="container-tbca relative grid gap-8 py-8 lg:grid-cols-12 lg:py-10">
                <div className={cn(journey || aside ? 'lg:col-span-6 xl:col-span-6' : 'lg:col-span-12')}>
                    {crumbs && (
                        <nav aria-label="Breadcrumb" className="mb-3">
                            <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-300">
                                {crumbs.map((c, i) => (
                                    <li key={c.label + i} className="flex items-center gap-1">
                                        {c.href ? <Link href={c.href} className="hover:text-gold-300">{c.label}</Link> : <span className="text-parchment-200">{c.label}</span>}
                                        {i < crumbs.length - 1 && <ChevronRight className="size-3" aria-hidden="true" />}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    )}
                    {eyebrow && <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-gold-400 uppercase">{eyebrow}</p>}
                    <h1 className="font-serif text-[2rem] leading-tight font-semibold text-parchment-100 sm:text-[2.5rem]">{title}</h1>
                    {subtitle && <p className="mt-2 text-lg font-semibold text-gold-400 sm:text-xl">{subtitle}</p>}
                    {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-parchment-300 sm:text-[0.9375rem]">{description}</p>}
                    {chips && <StateChips chips={chips} />}
                    {children}
                </div>
                {(journey || aside) && (
                    <div className="lg:col-span-6 xl:col-span-6 lg:self-center">
                        {journey && current !== undefined && <JourneyBox steps={journey} current={current} completed={completed} />}
                        {aside}
                    </div>
                )}
            </div>
        </section>
    );
}

/* ---------------------------------------------------------------- blocks */

export function SampleBanner({ title, note, sample = true }: { title: ReactNode; note?: ReactNode; sample?: boolean }) {
    return (
        <div className="flex items-start gap-3 rounded-[8px] border border-attested-500/30 bg-attested-50 px-4 py-3">
            <Info className="mt-0.5 size-5 shrink-0 text-attested-600" aria-hidden="true" />
            <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold text-ink-900">{title}</p>
                {note && <p className="text-xs text-ink-600">{note}</p>}
            </div>
            {sample && <span className="rounded bg-gold-100 px-2 py-0.5 text-[0.6875rem] font-bold text-gold-800">SAMPLE</span>}
        </div>
    );
}

export function IconCard({ item, compact = false, className }: { item: { title: string; body?: string; icon?: string }; compact?: boolean; className?: string }) {
    return (
        <div className={cn('rounded-[8px] border border-parchment-400 bg-white p-4', className)}>
            <span className="mb-2 inline-flex text-gold-600">
                <DdIcon name={item.icon} className={compact ? 'size-5' : 'size-7'} />
            </span>
            <p className={cn('font-semibold text-ink-900', compact ? 'text-[0.8125rem]' : 'text-sm')}>{item.title}</p>
            {item.body && <p className="mt-1 text-xs leading-relaxed text-ink-500">{item.body}</p>}
        </div>
    );
}

export function IconRow({ item }: { item: { title: string; body?: string; icon?: string } }) {
    return (
        <div className="flex items-start gap-2.5">
            <span className="mt-0.5 text-gold-600">
                <DdIcon name={item.icon} className="size-5" />
            </span>
            <div>
                <p className="text-[0.8125rem] font-semibold text-ink-900">{item.title}</p>
                {item.body && <p className="text-xs text-ink-500">{item.body}</p>}
            </div>
        </div>
    );
}

export function H2({ children, className }: { children: ReactNode; className?: string }) {
    return <h2 className={cn('text-base font-bold text-ink-900 sm:text-lg', className)}>{children}</h2>;
}

export function Card({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={cn('rounded-[10px] border border-parchment-400 bg-white p-4 sm:p-5', className)}>
            {(title || action) && (
                <header className="mb-3 flex items-center justify-between gap-2">
                    {title && <h2 className="text-sm font-bold text-ink-900 sm:text-[0.9375rem]">{title}</h2>}
                    {action}
                </header>
            )}
            {children}
        </section>
    );
}

export function Ticks({ items, tone = 'good', className }: { items: ReactNode[]; tone?: 'good' | 'bad' | 'warn' | 'gold'; className?: string }) {
    const color = { good: 'text-verified-500', bad: 'text-risk-500', warn: 'text-attested-500', gold: 'text-gold-600' }[tone];
    return (
        <ul className={cn('space-y-1.5', className)}>
            {items.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-[0.8125rem] text-ink-700">
                    <CheckCircle2 className={cn('mt-0.5 size-4 shrink-0', color)} aria-hidden="true" />
                    <span>{t}</span>
                </li>
            ))}
        </ul>
    );
}

export function Ring({ value, label, size = 96, tone = 'gold' }: { value: number; label?: string; size?: number; tone?: 'gold' | 'good' }) {
    const r = 40;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(100, value));
    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${pct}% ${label ?? 'complete'}`}>
            <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-parchment-300" />
                <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} className={tone === 'good' ? 'text-verified-500' : 'text-gold-500'} />
            </svg>
            <span className="absolute text-center">
                <span className="block text-lg font-bold text-ink-900">{pct}%</span>
                {label && <span className="block text-[0.625rem] text-ink-500">{label}</span>}
            </span>
        </div>
    );
}

/** Multi-segment donut. Segments use fixed status colours. */
export function Donut({ segments, center, size = 120 }: { segments: { label: string; value: number; color: string }[]; center: ReactNode; size?: number }) {
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    const r = 38;
    const c = 2 * Math.PI * r;
    let offset = 0;
    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="relative" style={{ width: size, height: size }} role="img" aria-label={segments.map((s) => `${s.label} ${s.value}`).join(', ')}>
                <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="#ece6da" strokeWidth="14" />
                    {segments.map((s) => {
                        const len = (s.value / total) * c;
                        const el = <circle key={s.label} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="14" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
                        offset += len;
                        return el;
                    })}
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-center">{center}</span>
            </div>
            <ul className="space-y-1 text-xs text-ink-700">
                {segments.map((s) => (
                    <li key={s.label} className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                        {s.value} {s.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export const RISK_COLORS: Record<string, string> = { critical: '#b42318', high: '#e8590c', medium: '#d6a32e', low: '#2f9e44' };

/* ---------------------------------------------------------------- pricing */

export function PriceSummary({ price, title = 'Price summary (ex VAT)', from = true, footnote = true }: { price: DdPrice; title?: string; from?: boolean; footnote?: boolean }) {
    const f = from ? 'From ' : '';
    const rows: [string, string, boolean?][] = [
        ['TBCA Expert Fee', rand(price.expert, 2)],
        ['TBCA Platform Fee', rand(price.platform, 2)],
    ];
    if (price.external > 0) {
        rows.push(['External Third-Party Costs*', f + rand(price.external, 2)]);
        rows.push(['External Admin Margin (25%)', f + rand(price.margin, 2)]);
    }
    return (
        <div>
            <h3 className="mb-2 text-sm font-bold text-ink-900">{title}</h3>
            <dl className="divide-y divide-parchment-300 rounded-[8px] border border-parchment-400 bg-white text-[0.8125rem]">
                {rows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2 px-3 py-1.5">
                        <dt className="text-ink-600">{k}</dt>
                        <dd className="font-medium text-ink-900">{v}</dd>
                    </div>
                ))}
                <div className="flex justify-between gap-2 px-3 py-2 font-bold">
                    <dt>Subtotal (ex VAT)</dt>
                    <dd>{f + rand(price.subtotal, 2)}</dd>
                </div>
                <div className="flex justify-between gap-2 px-3 py-1.5">
                    <dt className="text-ink-600">VAT (15%)</dt>
                    <dd>{f + rand(price.vat, 2)}</dd>
                </div>
                <div className="flex justify-between gap-2 px-3 py-1.5">
                    <dt className="text-ink-600">Payment Handling Fee</dt>
                    <dd>{f + rand(price.handling, 2)}</dd>
                </div>
                <div className="flex justify-between gap-2 rounded-b-[8px] border-t-2 border-gold-400 bg-gold-50 px-3 py-2 font-bold">
                    <dt>Estimated Total (incl. VAT)</dt>
                    <dd>{f + rand(price.total, 2)}</dd>
                </div>
            </dl>
            {footnote && (
                <>
                    <p className="mt-2 text-[0.6875rem] text-ink-500">* Actual external costs vary by country, source and complexity. You must approve each cost before commitment.</p>
                    <p className="mt-1 flex items-center gap-1 text-[0.6875rem] font-medium text-verified-700">
                        <BadgeCheck className="size-3.5" aria-hidden="true" /> No hidden fees. Full transparency guaranteed.
                    </p>
                </>
            )}
        </div>
    );
}

/* ---------------------------------------------------------------- bands */

export const TRUST = [
    { title: 'Secure & Private', icon: Lock },
    { title: 'Human Reviewed', icon: UserCheck },
    { title: 'Transparent Fees', icon: Receipt },
    { title: 'Audit Ready', icon: BadgeCheck },
];

export function TrustIcons({ dark = false }: { dark?: boolean }) {
    return (
        <ul className="flex flex-wrap gap-4">
            {TRUST.map(({ title, icon: I }) => (
                <li key={title} className={cn('flex items-center gap-1.5 text-xs', dark ? 'text-parchment-200' : 'text-ink-700')}>
                    <I className="size-4 text-gold-500" aria-hidden="true" /> {title}
                </li>
            ))}
        </ul>
    );
}

export function NextStepBand({ items, actions, trust = false }: { items: { icon?: string; title: string; body: ReactNode }[]; actions?: ReactNode; trust?: boolean }) {
    return (
        <section className="bg-ink-950 text-parchment-100">
            <div className="container-tbca flex flex-col gap-5 py-6 lg:flex-row lg:items-center">
                <div className="grid flex-1 gap-5 sm:grid-cols-2">
                    {items.map((it) => (
                        <div key={it.title} className="flex items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold-500/60 text-gold-400">
                                <DdIcon name={it.icon ?? 'ShieldCheck'} className="size-5" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold">{it.title}</p>
                                <p className="text-xs text-ink-300">{it.body}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
                {trust && <TrustIcons dark />}
            </div>
        </section>
    );
}

export function GoldLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link href={href} className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700 hover:text-gold-800">
            {children} <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
    );
}

export function ReferenceStrip({ items }: { items: [string, ReactNode][] }) {
    return (
        <dl className="grid gap-px overflow-hidden rounded-[10px] border border-parchment-400 bg-parchment-300 sm:grid-cols-2 lg:grid-cols-4">
            {items.map(([k, v]) => (
                <div key={k} className="bg-white px-3 py-2">
                    <dt className="text-[0.6875rem] text-ink-500">{k}</dt>
                    <dd className="text-[0.8125rem] font-semibold break-words text-ink-900">{v}</dd>
                </div>
            ))}
        </dl>
    );
}

export function evidenceLabel(status: string, required: boolean) {
    if (status === 'uploaded' || status === 'approved') return ['Uploaded', 'text-verified-700'];
    if (status === 'waived') return ['Alternative approved', 'text-verified-700'];
    if (!required) return ['Not Required', 'text-ink-400'];
    if (status === 'partial') return ['Partial', 'text-attested-700'];
    if (status === 'rejected') return ['Rejected', 'text-risk-600'];
    if (status === 'alternative_proposed') return ['Alternative proposed', 'text-controlled-600'];
    return ['Pending', 'text-attested-700'];
}

