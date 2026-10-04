import type { ReactNode } from 'react';
import { router } from '@inertiajs/react';
import { Check, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Breadcrumbs, { type Crumb } from '@/Components/ui/Breadcrumbs';
import { cn } from '@/lib/cn';

/* ==========================================================================
   Building blocks shared by Digital Products, Subscriptions and Retainers.
   Family-specific components live in Components/Products/<Family>/.
   ========================================================================== */

/** Dark hero used by the three family landing pages. */
export function ProductsHero({
    crumbs,
    title,
    goldLine,
    lead,
    actions,
    aside,
    children,
}: {
    crumbs?: Crumb[];
    title: ReactNode;
    goldLine?: ReactNode;
    lead?: ReactNode;
    actions?: ReactNode;
    aside?: ReactNode;
    children?: ReactNode;
}) {
    return (
        <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
            <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0 motif-grid opacity-[0.3]" aria-hidden="true" />
            <div className="container-tbca relative py-12 lg:py-16">
                {crumbs && (
                    <div className="[&_a]:text-ink-300 [&_a:hover]:text-gold-300">
                        <Breadcrumbs items={crumbs} />
                    </div>
                )}
                <div className={cn('grid gap-10', aside && 'lg:grid-cols-12 lg:gap-12')}>
                    <div className={cn(aside && 'lg:col-span-7')}>
                        <h1 className="font-serif text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.02em] sm:text-[3rem]">{title}</h1>
                        {goldLine && <p className="mt-2 font-serif text-[1.5rem] leading-tight text-gold-400 sm:text-[2rem]">{goldLine}</p>}
                        {lead && <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-200 md:text-base">{lead}</p>}
                        {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
                        {children}
                    </div>
                    {aside && <div className="lg:col-span-5">{aside}</div>}
                </div>
            </div>
        </section>
    );
}

/** Light inner-page title block: breadcrumbs, serif title, sub copy, chips and actions. */
export function PageTitle({
    crumbs,
    title,
    lead,
    chips,
    actions,
    aside,
    className,
}: {
    crumbs?: Crumb[];
    title: ReactNode;
    lead?: ReactNode;
    chips?: ReactNode;
    actions?: ReactNode;
    aside?: ReactNode;
    className?: string;
}) {
    return (
        <header className={cn('border-b border-parchment-400 bg-parchment-100', className)}>
            <div className="container-tbca py-8 md:py-10">
                {crumbs && <Breadcrumbs items={crumbs} />}
                <div className="flex flex-wrap items-start justify-between gap-5">
                    <div className="min-w-0 max-w-3xl">
                        <h1 className="font-serif text-[1.875rem] leading-tight font-semibold tracking-[-0.015em] text-ink-900 md:text-[2.5rem]">
                            {title}
                        </h1>
                        {chips && <div className="mt-3 flex flex-wrap gap-2">{chips}</div>}
                        {lead && <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-600">{lead}</p>}
                    </div>
                    {(actions || aside) && (
                        <div className="flex flex-col items-end gap-3">
                            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
                            {aside}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

/** Green-tick checklist. */
export function CheckList({ items, className, tone = 'good' }: { items: ReactNode[]; className?: string; tone?: 'good' | 'gold' }) {
    return (
        <ul className={cn('space-y-2', className)}>
            {items.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-[0.8125rem] leading-relaxed text-ink-700">
                    <Check className={cn('mt-0.5 size-4 shrink-0', tone === 'good' ? 'text-verified-500' : 'text-gold-600')} aria-hidden="true" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

/** Label / value rows used in summaries ("Billing period — Monthly in advance"). */
export function LabelValues({
    rows,
    className,
}: {
    rows: { label: ReactNode; value: ReactNode; strong?: boolean }[];
    className?: string;
}) {
    return (
        <dl className={cn('divide-y divide-parchment-300 text-[0.8125rem]', className)}>
            {rows.map((r, i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-2">
                    <dt className="text-ink-500">{r.label}</dt>
                    <dd className={cn('text-right', r.strong ? 'font-bold text-ink-900' : 'font-medium text-ink-800')}>{r.value}</dd>
                </div>
            ))}
        </dl>
    );
}

/** Icon + title + body card. */
export function IconCard({
    icon: Icon,
    title,
    body,
    className,
    children,
}: {
    icon?: LucideIcon;
    title: ReactNode;
    body?: ReactNode;
    className?: string;
    children?: ReactNode;
}) {
    return (
        <div className={cn('rounded-[8px] border border-parchment-400 bg-white p-5', className)}>
            {Icon && (
                <span className="mb-3 inline-flex size-9 items-center justify-center rounded-[6px] border border-gold-300 bg-gold-50 text-gold-700">
                    <Icon className="size-[18px]" aria-hidden="true" />
                </span>
            )}
            <h3 className="text-[0.9375rem] font-semibold text-ink-900">{title}</h3>
            {body && <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{body}</p>}
            {children}
        </div>
    );
}

/** Row of small trust / assurance items shown at the foot of public pages. */
export function TrustRow({ items, tone = 'light' }: { items: { icon: LucideIcon; title: string; body?: string }[]; tone?: 'light' | 'dark' }) {
    return (
        <ul
            className={cn(
                'grid gap-px overflow-hidden rounded-[8px] border sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none',
                tone === 'dark' ? 'border-ink-700 bg-ink-700' : 'border-parchment-400 bg-parchment-400',
            )}
        >
            {items.map(({ icon: Icon, title, body }) => (
                <li key={title} className={cn('flex items-start gap-3 p-4', tone === 'dark' ? 'bg-ink-900' : 'bg-white')}>
                    <Icon className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden="true" />
                    <div className="min-w-0">
                        <p className={cn('text-[0.8125rem] font-semibold', tone === 'dark' ? 'text-parchment-100' : 'text-ink-900')}>{title}</p>
                        {body && <p className={cn('mt-0.5 text-xs', tone === 'dark' ? 'text-ink-300' : 'text-ink-500')}>{body}</p>}
                    </div>
                </li>
            ))}
        </ul>
    );
}

/** Tinted notice box (info / warning / boundary statements). */
export function Notice({
    title,
    children,
    tone = 'info',
    icon: Icon = Info,
    className,
}: {
    title?: ReactNode;
    children: ReactNode;
    tone?: 'info' | 'warn' | 'good' | 'bad' | 'gold' | 'purple';
    icon?: LucideIcon;
    className?: string;
}) {
    const tones = {
        info: 'border-controlled-500/30 bg-controlled-50 text-controlled-700',
        warn: 'border-attested-500/30 bg-attested-50 text-attested-700',
        good: 'border-verified-500/30 bg-verified-50 text-verified-700',
        bad: 'border-risk-500/30 bg-risk-50 text-risk-700',
        gold: 'border-gold-300 bg-gold-50 text-gold-800',
        purple: 'border-referenced-500/30 bg-referenced-50 text-referenced-700',
    }[tone];

    return (
        <div className={cn('flex gap-3 rounded-[8px] border p-4', tones, className)}>
            <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            <div className="min-w-0 text-[0.8125rem] leading-relaxed">
                {title && <p className="font-semibold">{title}</p>}
                <div className="text-ink-700">{children}</div>
            </div>
        </div>
    );
}

/**
 * Small inline button that POSTs an admin / workspace action through Inertia
 * (e.g. approve, reject, reserve). Asks for confirmation when `confirm` is given.
 */
export function ActionButton({
    href,
    data,
    children,
    confirm,
    tone = 'outline',
    className,
    method = 'post',
}: {
    href: string;
    data?: Record<string, string | number | boolean | null>;
    children: ReactNode;
    confirm?: string;
    tone?: 'gold' | 'outline' | 'danger' | 'ink';
    className?: string;
    method?: 'post' | 'patch' | 'delete';
}) {
    const tones = {
        gold: 'border-gold-500 bg-gold-500 text-ink-900 hover:bg-gold-400',
        outline: 'border-parchment-500 bg-white text-ink-800 hover:border-ink-900',
        danger: 'border-risk-500/40 bg-white text-risk-700 hover:bg-risk-50',
        ink: 'border-ink-900 bg-ink-900 text-parchment-100 hover:bg-ink-800',
    }[tone];

    return (
        <button
            type="button"
            onClick={() => {
                if (confirm && !window.confirm(confirm)) return;
                router.visit(href, { method, data: data ?? {}, preserveScroll: true });
            }}
            className={cn('inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors', tones, className)}
        >
            {children}
        </button>
    );
}

/** Horizontal bar used for simple in-page charts (usage, distribution). */
export function BarRow({ label, value, max, suffix, tone = 'gold' }: { label: ReactNode; value: number; max: number; suffix?: string; tone?: 'gold' | 'good' | 'bad' | 'info' }) {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    const bar = { gold: 'bg-gold-500', good: 'bg-verified-500', bad: 'bg-risk-500', info: 'bg-controlled-500' }[tone];

    return (
        <div className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 text-xs">
            <span className="truncate text-ink-600">{label}</span>
            <span className="h-2 overflow-hidden rounded-full bg-parchment-300">
                <span className={cn('block h-full rounded-full', bar)} style={{ width: `${pct}%` }} />
            </span>
            <span className="font-semibold text-ink-800 tabular-nums">
                {value.toLocaleString()}
                {suffix}
            </span>
        </div>
    );
}
