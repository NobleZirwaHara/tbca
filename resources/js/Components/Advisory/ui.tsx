import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, Check, CheckCircle2, CircleAlert, CircleX, Clock, DollarSign, Languages, ShieldCheck, UserCheck } from 'lucide-react';
import Breadcrumbs, { type Crumb } from '@/Components/ui/Breadcrumbs';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import { cn } from '@/lib/cn';
import { formatZar } from '@/lib/money';

export const zar = (n: number | null | undefined) => (n === null || n === undefined ? '—' : n < 0 ? `-${formatZar(Math.abs(n))}` : formatZar(n));
export const zarRange = (r: [number, number] | number[] | null | undefined, suffix = '') =>
    !r ? '—' : r[0] === r[1] ? `${zar(r[0])}${suffix}` : `${zar(r[0])} – ${zar(r[1])}${suffix}`;
export const zarCents = (n: number) => `ZAR ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ' ')}`;

/** Dark hero used by Services, Project Advisory and Technology Solutions public pages. */
export function DarkHero({
    crumbs,
    title,
    tagline,
    intro,
    chips = 'services',
    box,
    children,
    eyebrow,
}: {
    crumbs?: Crumb[];
    title: string;
    tagline?: string;
    intro?: ReactNode;
    chips?: 'services' | 'none' | { label: string; sub: string }[];
    box?: { title: string; items: string[]; footer?: ReactNode };
    children?: ReactNode;
    eyebrow?: string;
}) {
    const chipList =
        chips === 'services'
            ? [
                  { label: 'Market', sub: 'Africa (Active)' },
                  { label: 'Languages', sub: '7 Languages' },
                  { label: 'Pricing in', sub: 'ZAR (Source) · USD (Display)' },
                  { label: 'Human Review', sub: 'Available' },
                  { label: 'We recommend', sub: 'by fit, not margin' },
              ]
            : chips === 'none'
              ? []
              : chips;
    const icons = [ShieldCheck, Languages, DollarSign, UserCheck, CheckCircle2];
    return (
        <header className="relative overflow-hidden bg-ink-950 text-parchment-100">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{ background: 'radial-gradient(60% 80% at 85% 30%, rgba(214,163,46,0.22) 0%, transparent 60%), radial-gradient(40% 50% at 10% 100%, rgba(214,163,46,0.08) 0%, transparent 70%)' }}
            />
            <div className="container-tbca relative py-10 md:py-14">
                {crumbs && (
                    <div className="[&_a]:text-gold-400 [&_li]:text-ink-300">
                        <Breadcrumbs items={crumbs} />
                    </div>
                )}
                <div className="grid gap-8 lg:grid-cols-12">
                    <div className={box ? 'lg:col-span-7' : 'lg:col-span-10'}>
                        {eyebrow && <p className="mb-2 text-[0.6875rem] font-semibold tracking-[0.16em] text-gold-400 uppercase">{eyebrow}</p>}
                        <h1 className="font-serif text-[2.25rem] leading-[1.05] font-semibold md:text-[3.25rem]">{title}</h1>
                        {tagline && <p className="mt-3 text-lg font-semibold text-gold-400 md:text-xl">{tagline}</p>}
                        {intro && <div className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-200">{intro}</div>}
                        {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
                        {chipList.length > 0 && (
                            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
                                {chipList.map((c, i) => {
                                    const I = icons[i % icons.length];
                                    return (
                                        <li key={c.label} className="flex items-center gap-2 text-xs">
                                            <I className="size-5 shrink-0 text-gold-400" aria-hidden="true" />
                                            <span>
                                                <span className="block text-parchment-100">{c.label}</span>
                                                <span className="block text-ink-300">{c.sub}</span>
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                    {box && (
                        <aside className="lg:col-span-5">
                            <div className="rounded-[8px] border border-gold-600/60 bg-ink-900/80 p-6">
                                <h2 className="font-serif text-lg text-gold-400">{box.title}</h2>
                                <ul className="mt-3 space-y-2.5">
                                    {box.items.map((i) => (
                                        <li key={i} className="flex gap-2.5 text-sm text-ink-100">
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden="true" />
                                            {i}
                                        </li>
                                    ))}
                                </ul>
                                {box.footer && <div className="mt-4">{box.footer}</div>}
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </header>
    );
}

/** Light page title block used inside journeys and workspaces. */
export function PageTitle({ crumbs, title, sub, tag, actions, children }: { crumbs?: Crumb[]; title: string; sub?: ReactNode; tag?: ReactNode; actions?: ReactNode; children?: ReactNode }) {
    return (
        <div className="mb-6">
            {crumbs && <Breadcrumbs items={crumbs} />}
            <div className="mt-1 flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                    {tag}
                    <h1 className="font-serif text-[1.875rem] leading-tight font-semibold text-ink-900 md:text-[2.25rem]">{title}</h1>
                    {sub && <div className="mt-1.5 max-w-3xl text-sm text-ink-600">{sub}</div>}
                </div>
                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
            {children}
        </div>
    );
}

export function TrustBand({ items, tone = 'light' }: { items: [string, string][]; tone?: 'light' | 'dark' }) {
    return (
        <section className={cn('border-y', tone === 'dark' ? 'border-ink-800 bg-ink-950 text-parchment-100' : 'border-parchment-400 bg-parchment-100')}>
            <ul className="container-tbca grid grid-cols-2 gap-4 py-5 sm:grid-cols-3 lg:grid-cols-6">
                {items.map(([t, s]) => (
                    <li key={t} className="flex items-start gap-2.5">
                        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden="true" />
                        <span>
                            <span className={cn('block text-[0.8125rem] font-semibold', tone === 'dark' ? 'text-parchment-100' : 'text-ink-900')}>{t}</span>
                            <span className={cn('block text-xs', tone === 'dark' ? 'text-ink-300' : 'text-ink-500')}>{s}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export const SERVICES_TRUST: [string, string][] = [
    ['No margin steering', 'We recommend by fit, not margin.'],
    ['Human review available', 'When you need it.'],
    ['All viable options shown', 'Always equal visibility.'],
    ['Professional boundaries', 'Always respected.'],
    ['Africa (Active)', 'ZAR Source Pricing'],
    ['Secure & Private', 'Your data is protected.'],
];

const ledgerTone: Record<string, string> = {
    T: 'bg-verified-500 text-white',
    P: 'bg-controlled-500 text-white',
    X: 'bg-attested-500 text-white',
    S: 'bg-referenced-500 text-white',
    C: 'bg-risk-500 text-white',
};

export function LedgerBadge({ l, size = 'md' }: { l: string; size?: 'sm' | 'md' | 'lg' }) {
    return (
        <span
            className={cn(
                'inline-flex shrink-0 items-center justify-center rounded-[5px] font-serif font-bold',
                ledgerTone[l] ?? 'bg-ink-700 text-white',
                { sm: 'size-6 text-xs', md: 'size-8 text-sm', lg: 'size-11 text-xl' }[size],
            )}
            aria-label={`Ledger ${l}`}
        >
            {l}
        </span>
    );
}

export function Card({ title, num, icon, action, children, className, tone = 'light' }: { title?: ReactNode; num?: number | string; icon?: string; action?: ReactNode; children: ReactNode; className?: string; tone?: 'light' | 'dark' | 'gold' }) {
    return (
        <section
            className={cn(
                'rounded-[8px] border p-5',
                tone === 'dark' ? 'border-ink-700 bg-ink-900 text-parchment-100' : tone === 'gold' ? 'border-gold-300 bg-gold-50/70' : 'border-parchment-400 bg-white',
                className,
            )}
        >
            {(title || action) && (
                <header className="mb-3 flex items-start justify-between gap-3">
                    <h2 className={cn('flex items-center gap-2 text-[0.9375rem] font-semibold', tone === 'dark' ? 'text-gold-400' : 'text-ink-900')}>
                        {num !== undefined && <span className="inline-flex size-6 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-900">{num}</span>}
                        {icon && <AdvIcon name={icon} className="size-4 text-gold-600" />}
                        {title}
                    </h2>
                    {action}
                </header>
            )}
            {children}
        </section>
    );
}

export function CheckList({ items, tone = 'good', className }: { items: ReactNode[]; tone?: 'good' | 'bad' | 'gold'; className?: string }) {
    const I = tone === 'bad' ? CircleX : CheckCircle2;
    return (
        <ul className={cn('space-y-1.5', className)}>
            {items.map((i, k) => (
                <li key={k} className="flex gap-2 text-[0.8125rem] text-ink-700">
                    <I className={cn('mt-0.5 size-4 shrink-0', tone === 'bad' ? 'text-risk-500' : tone === 'gold' ? 'text-gold-600' : 'text-verified-500')} aria-hidden="true" />
                    <span>{i}</span>
                </li>
            ))}
        </ul>
    );
}

export function KV({ rows, className }: { rows: [ReactNode, ReactNode][]; className?: string }) {
    return (
        <dl className={cn('divide-y divide-parchment-300 text-[0.8125rem]', className)}>
            {rows.map(([k, v], i) => (
                <div key={i} className="flex justify-between gap-4 py-1.5">
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="text-right font-medium text-ink-900">{v}</dd>
                </div>
            ))}
        </dl>
    );
}

export function Stat({ label, value, sub, tone = 'neutral', icon }: { label: ReactNode; value: ReactNode; sub?: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'gold'; icon?: string }) {
    const c = { neutral: 'text-ink-900', good: 'text-verified-700', warn: 'text-attested-700', bad: 'text-risk-700', gold: 'text-gold-700' }[tone];
    return (
        <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-ink-500">{label}</p>
                {icon && <AdvIcon name={icon} className="size-4 text-gold-600" />}
            </div>
            <p className={cn('mt-1 text-xl font-bold tracking-tight', c)}>{value}</p>
            {sub && <p className="mt-0.5 text-xs text-ink-400">{sub}</p>}
        </div>
    );
}

export function Tracker({ items, className }: { items: { code?: string; label: string; state: 'done' | 'current' | 'todo' }[]; className?: string }) {
    return (
        <ol className={cn('flex gap-0 overflow-x-auto pb-1', className)} aria-label="Progress">
            {items.map((s, i) => (
                <li key={i} className="relative flex min-w-[72px] flex-1 flex-col items-center text-center">
                    {i > 0 && <span aria-hidden="true" className={cn('absolute top-3 right-1/2 h-0.5 w-full', s.state === 'todo' ? 'bg-parchment-400' : 'bg-verified-500')} />}
                    <span
                        aria-current={s.state === 'current' ? 'step' : undefined}
                        className={cn(
                            'relative z-10 flex size-6 items-center justify-center rounded-full border-2 text-[0.625rem] font-bold',
                            s.state === 'done' && 'border-verified-500 bg-verified-500 text-white',
                            s.state === 'current' && 'border-gold-500 bg-gold-500 text-ink-900 ring-4 ring-gold-200',
                            s.state === 'todo' && 'border-parchment-500 bg-white text-ink-400',
                        )}
                    >
                        {s.state === 'done' ? <Check className="size-3" /> : i + 1}
                    </span>
                    {s.code && <span className="mt-1 text-[0.625rem] font-bold text-ink-700">{s.code}</span>}
                    <span className={cn('mt-0.5 px-1 text-[0.625rem] leading-tight', s.state === 'current' ? 'font-semibold text-gold-700' : 'text-ink-500')}>{s.label}</span>
                </li>
            ))}
        </ol>
    );
}

export function StatusDot({ state }: { state: 'ok' | 'warn' | 'bad' | 'info' }) {
    const I = state === 'ok' ? CheckCircle2 : state === 'bad' ? CircleX : state === 'warn' ? CircleAlert : Clock;
    return <I className={cn('size-4 shrink-0', { ok: 'text-verified-500', warn: 'text-attested-500', bad: 'text-risk-500', info: 'text-controlled-500' }[state])} aria-hidden="true" />;
}

export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
    return (
        <Link href={href} className={cn('inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700 hover:text-gold-800', className)}>
            {children}
            <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
    );
}

export function Notice({ tone = 'info', children, className }: { tone?: 'info' | 'warn' | 'bad' | 'good'; children: ReactNode; className?: string }) {
    const c = {
        info: 'border-controlled-500/30 bg-controlled-50 text-controlled-700',
        warn: 'border-attested-500/30 bg-attested-50 text-attested-700',
        bad: 'border-risk-500/30 bg-risk-50 text-risk-700',
        good: 'border-verified-500/30 bg-verified-50 text-verified-700',
    }[tone];
    return <div className={cn('flex items-start gap-2 rounded-[6px] border px-3.5 py-2.5 text-[0.8125rem]', c, className)}>{children}</div>;
}

/** Donut chart from slices (pure SVG). */
export function Donut({ slices, size = 140, center, sub }: { slices: { value: number; color: string; label?: string }[]; size?: number; center?: ReactNode; sub?: ReactNode }) {
    const total = slices.reduce((s, x) => s + x.value, 0) || 1;
    const r = 15.9155;
    let acc = 0;
    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg viewBox="0 0 42 42" width={size} height={size} role="img" aria-label="Distribution chart" className="-rotate-90">
                <circle cx="21" cy="21" r={r} fill="none" stroke="#ebe0cd" strokeWidth="6" />
                {slices.map((s, i) => {
                    const pct = (s.value / total) * 100;
                    const el = <circle key={i} cx="21" cy="21" r={r} fill="none" stroke={s.color} strokeWidth="6" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-acc} />;
                    acc += pct;
                    return el;
                })}
            </svg>
            <div className="absolute text-center">
                <div className="text-lg font-bold text-ink-900">{center}</div>
                {sub && <div className="text-[0.625rem] text-ink-500">{sub}</div>}
            </div>
        </div>
    );
}

/** Semi-circle gauge 0-100. */
export function Gauge({ value, label, sub }: { value: number; label?: ReactNode; sub?: ReactNode }) {
    const v = Math.max(0, Math.min(100, value));
    const a = Math.PI * (1 - v / 100);
    const x = 50 + 40 * Math.cos(a);
    const y = 50 - 40 * Math.sin(a);
    return (
        <div className="text-center">
            <svg viewBox="0 0 100 58" className="mx-auto w-48" role="img" aria-label={`Score ${v} of 100`}>
                <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#ebe0cd" strokeWidth="9" strokeLinecap="round" />
                <path d={`M10 50 A40 40 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`} fill="none" stroke="#d6a32e" strokeWidth="9" strokeLinecap="round" />
                <text x="50" y="44" textAnchor="middle" className="fill-ink-900" style={{ fontSize: 18, fontWeight: 700 }}>
                    {v}
                </text>
                <text x="50" y="55" textAnchor="middle" className="fill-ink-500" style={{ fontSize: 6 }}>
                    /100
                </text>
            </svg>
            {label && <p className="mt-1 font-serif text-lg font-semibold text-gold-700">{label}</p>}
            {sub && <p className="text-xs text-ink-500">{sub}</p>}
        </div>
    );
}

export const CHART = ['#d6a32e', '#2f855a', '#3b6fb6', '#c05621', '#7b5ea7', '#9a9aa5', '#c53030'];
