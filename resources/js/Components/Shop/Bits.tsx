import type { ReactNode } from 'react';
import { BadgeCheck, Coins, Lock, ShieldCheck, Trophy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatZar } from '@/lib/money';
import { displayCurrency, displayMoney } from '@/lib/money';

/** Two-decimal ZAR for VAT lines, e.g. "ZAR 2,962.50". */
export function zar2(value: number): string {
    return `ZAR ${value.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\s/g, ',')}`;
}

export function zar(value: number): string {
    if (displayCurrency() !== 'ZAR') return displayMoney(value);
    return formatZar(value).replace('R', 'ZAR ');
}

const actTone: Record<string, string> = {
    A1: 'border-gold-400/60 bg-gold-50 text-gold-800',
    A2: 'border-verified-500/30 bg-verified-50 text-verified-700',
    A3: 'border-controlled-500/30 bg-controlled-50 text-controlled-700',
    A4: 'border-risk-500/30 bg-risk-50 text-risk-700',
    A5: 'border-referenced-500/30 bg-referenced-50 text-referenced-700',
    A6: 'border-attested-500/30 bg-attested-50 text-attested-700',
    A7: 'border-verified-500/40 bg-verified-50 text-verified-700',
};

export function ActTag({ act, label, className }: { act: string; label?: string; className?: string }) {
    return (
        <span className={cn('inline-flex items-center rounded-[4px] border px-1.5 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap', actTone[act] ?? actTone.A1, className)}>
            {label ?? act}
        </span>
    );
}

export function Chip({ children, tone = 'neutral', icon }: { children: ReactNode; tone?: 'neutral' | 'green' | 'gold'; icon?: ReactNode }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-[0.6875rem] font-medium whitespace-nowrap',
                tone === 'green' && 'border-verified-500/30 bg-verified-50 text-verified-700',
                tone === 'gold' && 'border-gold-300 bg-gold-50 text-gold-800',
                tone === 'neutral' && 'border-parchment-500 bg-white text-ink-600',
            )}
        >
            {icon}
            {children}
        </span>
    );
}

/** Dark hero band used across the shop (serif title, gold lead, optional KPI box). */
export function ShopHero({ crumbs, title, lead, intro, aside, children }: { crumbs?: ReactNode; title: ReactNode; lead?: ReactNode; intro?: ReactNode; aside?: ReactNode; children?: ReactNode }) {
    return (
        <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
            <div className="pointer-events-none absolute inset-0 motif-glow opacity-70" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-0 motif-grid opacity-25" aria-hidden="true" />
            <div className="container-tbca relative py-8 md:py-10">
                {crumbs}
                <div className="grid items-center gap-6 lg:grid-cols-12">
                    <div className={aside ? 'lg:col-span-7' : 'lg:col-span-12'}>
                        <h1 className="font-serif text-[2rem] leading-tight font-semibold md:text-[2.75rem]">{title}</h1>
                        {lead && <p className="mt-2 font-serif text-lg text-gold-400 md:text-xl">{lead}</p>}
                        {intro && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-200 md:text-[0.9375rem]">{intro}</p>}
                        {children}
                    </div>
                    {aside && <div className="lg:col-span-5">{aside}</div>}
                </div>
            </div>
        </section>
    );
}

/** Gold-bordered KPI box on the dark hero. */
export function HeroStats({ stats }: { stats: { icon: ReactNode; value: ReactNode; label: ReactNode; caption?: ReactNode }[] }) {
    return (
        <div className="grid grid-cols-2 gap-4 rounded-[8px] border border-gold-600/60 bg-ink-950/70 p-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {stats.map((s, i) => (
                <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-gold-400">{s.icon}</span>
                    <div className="min-w-0">
                        <p className="text-xl font-bold text-gold-400">{s.value}</p>
                        <p className="text-xs font-semibold text-parchment-100">{s.label}</p>
                        {s.caption && <p className="text-[0.6875rem] text-ink-300">{s.caption}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function ShopCrumbs({ items, tone = 'dark' }: { items: { label: string; href?: string }[]; tone?: 'dark' | 'light' }) {
    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className={cn('flex flex-wrap items-center gap-1.5 text-[0.8125rem]', tone === 'dark' ? 'text-ink-300' : 'text-ink-400')}>
                {items.map((c, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                        {c.href && i < items.length - 1 ? (
                            <a href={c.href} className={tone === 'dark' ? 'hover:text-parchment-100' : 'hover:text-ink-900'}>
                                {c.label}
                            </a>
                        ) : (
                            <span className={i === items.length - 1 ? 'text-gold-500' : undefined} aria-current={i === items.length - 1 ? 'page' : undefined}>
                                {c.label}
                            </span>
                        )}
                        {i < items.length - 1 && <span aria-hidden="true">›</span>}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

/** Bottom trust strip shown under every shop page. */
export function TrustStrip({ items }: { items?: { title: string; body?: string }[] }) {
    const list = items ?? [
        { title: 'Human-reviewed for accuracy', body: 'By TBCA professionals' },
        { title: 'Transparent pricing in ZAR', body: 'No hidden fees' },
        { title: 'Secure payments', body: 'Bank-grade security' },
        { title: 'Trusted by businesses across Africa', body: 'Proven. Ethical. Independent.' },
    ];
    const icons = [ShieldCheck, Coins, Lock, Trophy, BadgeCheck, ShieldCheck];

    return (
        <div className="border-t border-parchment-400 bg-white">
            <ul className="container-tbca grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
                {list.map((it, i) => {
                    const Icon = icons[i % icons.length];
                    return (
                        <li key={it.title} className="flex items-start gap-2.5">
                            <Icon className="mt-0.5 size-5 shrink-0 text-verified-500" aria-hidden="true" />
                            <div>
                                <p className="text-[0.8125rem] font-semibold text-ink-900">{it.title}</p>
                                {it.body && <p className="text-xs text-ink-500">{it.body}</p>}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/** Light stepper used in checkout and request journeys (done = check, current = filled). */
export function FlowSteps({ steps, current, done = current - 1 }: { steps: { title: string; sub?: string }[]; current: number; done?: number }) {
    return (
        <ol className="flex w-full gap-2 overflow-x-auto pb-1">
            {steps.map((s, i) => {
                const n = i + 1;
                const isDone = n <= done && n !== current;
                const isCurrent = n === current;
                return (
                    <li key={s.title} className="flex min-w-[8rem] flex-1 items-start gap-2">
                        <span
                            className={cn(
                                'flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                                isDone && 'border-verified-500 bg-verified-500 text-white',
                                isCurrent && 'border-verified-700 bg-verified-700 text-white',
                                !isDone && !isCurrent && 'border-parchment-500 bg-white text-ink-400',
                            )}
                            aria-current={isCurrent ? 'step' : undefined}
                        >
                            {isDone ? '✓' : n}
                        </span>
                        <span className="min-w-0">
                            <span className={cn('block text-xs font-semibold', isCurrent ? 'text-verified-700' : 'text-ink-800')}>{s.title}</span>
                            {s.sub && <span className="block text-[0.6875rem] text-ink-400">{s.sub}</span>}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

export function SideCard({ title, children, className, action }: { title?: ReactNode; children: ReactNode; className?: string; action?: ReactNode }) {
    return (
        <section className={cn('rounded-[8px] border border-parchment-400 bg-white p-5', className)}>
            {(title || action) && (
                <div className="mb-3 flex items-center justify-between gap-2">
                    {title && <h2 className="text-base font-semibold text-ink-900">{title}</h2>}
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}

export function NextSteps({ steps }: { steps: [string, string][] }) {
    return (
        <ol className="space-y-3">
            {steps.map(([t, b], i) => (
                <li key={t} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-verified-500 text-xs font-bold text-verified-700">{i + 1}</span>
                    <span>
                        <span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span>
                        <span className="block text-xs text-ink-500">{b}</span>
                    </span>
                </li>
            ))}
        </ol>
    );
}
