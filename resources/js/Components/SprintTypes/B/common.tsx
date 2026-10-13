import CoverArt from '@/Components/Art/CoverArt';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Bookmark, Check, ChevronRight, CircleCheck, Home, MessageSquare, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import { formatZar, usePrice } from '@/lib/money';
import type { SharedProps, SprintRecord } from '@/types';

/* ==========================================================================
   Shared building blocks for the group-B sprint type templates.
   ========================================================================== */

export const orderHref = (sprint: SprintRecord, packageKey?: string | null) =>
    `/sprints/${sprint.slug}/order${packageKey ? `?package=${encodeURIComponent(packageKey)}` : ''}`;

export const quoteHref = (sprint: SprintRecord, packageKey?: string | null) =>
    `/sprints/${sprint.slug}/quote${packageKey ? `?package=${encodeURIComponent(packageKey)}` : ''}`;

export const sprintHref = (sprint: Pick<SprintRecord, 'slug'>) => `/sprints/${sprint.slug}`;

export function askAbout(sprint: SprintRecord) {
    openAskQuestion({ subject: sprint.title, section: 'sprints' });
}

/** Typed accessor for the attributes JSON column. */
export function attrsOf<T>(sprint: SprintRecord): Partial<T> {
    return (sprint.attributes ?? {}) as Partial<T>;
}

/** Selected package state with a sensible default (popular package, else first). */
export function usePackage(sprint: SprintRecord) {
    const packages = sprint.packages ?? [];
    const initial = packages.find((p) => p.popular)?.key ?? packages[0]?.key ?? null;
    const [selected, setSelected] = useState<string | null>(initial);
    const current = packages.find((p) => p.key === selected) ?? null;
    return { packages, selected, setSelected, current };
}

/** Save toggles the sprint in the visitor's Saved Items (guests are sent to log in). */
export function useSaveSprint(sprint: SprintRecord) {
    const { auth } = usePage<SharedProps>().props;
    const [busy, setBusy] = useState(false);
    const save = () => {
        if (!auth.user) {
            router.visit('/login');
            return;
        }
        setBusy(true);
        router.post(
            '/saved',
            { item_type: 'sprint', item_key: sprint.slug, label: sprint.title, url: sprintHref(sprint) },
            { preserveScroll: true, onFinish: () => setBusy(false) },
        );
    };
    return { save, busy };
}

export function SaveButton({
    sprint,
    label = 'Save Sprint',
    className,
    tone = 'light',
}: {
    sprint: SprintRecord;
    label?: string;
    className?: string;
    tone?: 'light' | 'dark';
}) {
    const { save, busy } = useSaveSprint(sprint);
    return (
        <button
            type="button"
            onClick={save}
            disabled={busy}
            className={cn(
                'inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border px-3 text-[0.8125rem] font-medium transition-colors disabled:opacity-60',
                tone === 'dark'
                    ? 'border-ink-600 text-parchment-100 hover:border-gold-500 hover:text-gold-300'
                    : 'border-parchment-500 bg-white text-ink-800 hover:border-gold-500',
                className,
            )}
        >
            <Bookmark className="size-4" aria-hidden="true" />
            {label}
        </button>
    );
}

export function AskButton({
    sprint,
    label = 'Ask a Question',
    className,
    tone = 'light',
}: {
    sprint: SprintRecord;
    label?: string;
    className?: string;
    tone?: 'light' | 'dark';
}) {
    return (
        <button
            type="button"
            onClick={() => askAbout(sprint)}
            className={cn(
                'inline-flex h-10 items-center justify-center gap-2 rounded-[5px] border px-3 text-[0.8125rem] font-medium transition-colors',
                tone === 'dark'
                    ? 'border-ink-600 text-parchment-100 hover:border-gold-500 hover:text-gold-300'
                    : 'border-parchment-500 bg-white text-ink-800 hover:border-gold-500',
                className,
            )}
        >
            <MessageSquare className="size-4" aria-hidden="true" />
            {label}
        </button>
    );
}

/** Primary gold CTA rendered as an Inertia link. */
export function GoldLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
    return (
        <Link
            href={href}
            className={cn(
                'inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-gold-500 px-4 text-sm font-semibold text-ink-900 transition-colors hover:bg-gold-400',
                className,
            )}
        >
            {children}
            <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
    );
}

export interface CrumbItem {
    label: string;
    href?: string;
}

export function Crumbs({ items, tone = 'light', home = false }: { items: CrumbItem[]; tone?: 'light' | 'dark'; home?: boolean }) {
    return (
        <nav aria-label="Breadcrumb">
            <ol className={cn('flex flex-wrap items-center gap-1.5 text-[0.8125rem]', tone === 'dark' ? 'text-ink-300' : 'text-ink-500')}>
                {home && (
                    <li className="flex items-center gap-1.5">
                        <Link href="/" aria-label="Home" className="hover:text-gold-600">
                            <Home className="size-4" />
                        </Link>
                        <ChevronRight className="size-3.5 opacity-60" aria-hidden="true" />
                    </li>
                )}
                {items.map((c, i) => {
                    const last = i === items.length - 1;
                    return (
                        <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
                            {c.href && !last ? (
                                <Link href={c.href} className="hover:text-gold-600">
                                    {c.label}
                                </Link>
                            ) : (
                                <span aria-current={last ? 'page' : undefined} className={last ? (tone === 'dark' ? 'text-parchment-100' : 'font-medium text-ink-900') : undefined}>
                                    {c.label}
                                </span>
                            )}
                            {!last && <ChevronRight className="size-3.5 opacity-60" aria-hidden="true" />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export function CheckList({
    items,
    className,
    tone = 'gold',
    cols = 1,
    size = 'sm',
}: {
    items: ReactNode[];
    className?: string;
    tone?: 'gold' | 'green' | 'light';
    cols?: 1 | 2;
    size?: 'xs' | 'sm';
}) {
    const icon = {
        gold: 'text-gold-600',
        green: 'text-verified-500',
        light: 'text-gold-400',
    }[tone];
    return (
        <ul className={cn('grid gap-x-6 gap-y-1.5', cols === 2 && 'sm:grid-cols-2', size === 'xs' ? 'text-xs' : 'text-[0.8125rem]', className)}>
            {items.map((it, i) => (
                <li key={i} className="flex items-start gap-2">
                    <CircleCheck className={cn('mt-0.5 size-3.5 shrink-0', icon)} aria-hidden="true" />
                    <span>{it}</span>
                </li>
            ))}
        </ul>
    );
}

export function TickList({ items, className }: { items: ReactNode[]; className?: string }) {
    return (
        <ul className={cn('space-y-1.5 text-[0.8125rem]', className)}>
            {items.map((it, i) => (
                <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-gold-600" aria-hidden="true" />
                    <span>{it}</span>
                </li>
            ))}
        </ul>
    );
}

export function CrossList({ items, className }: { items: ReactNode[]; className?: string }) {
    return (
        <ul className={cn('space-y-1.5 text-[0.8125rem]', className)}>
            {items.map((it, i) => (
                <li key={i} className="flex items-start gap-2">
                    <X className="mt-0.5 size-3.5 shrink-0 text-risk-500" aria-hidden="true" />
                    <span>{it}</span>
                </li>
            ))}
        </ul>
    );
}

/** White bordered card with a bold heading (light template building block). */
export function Box({
    title,
    icon,
    children,
    className,
    tone = 'light',
}: {
    title?: ReactNode;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
    tone?: 'light' | 'dark' | 'cream';
}) {
    return (
        <section
            className={cn(
                'rounded-[8px] border p-4 sm:p-5',
                tone === 'dark' && 'border-ink-700 bg-ink-900 text-parchment-100',
                tone === 'light' && 'border-parchment-400 bg-white',
                tone === 'cream' && 'border-gold-200 bg-gold-50/60',
                className,
            )}
        >
            {title && (
                <h2 className={cn('mb-3 flex items-center gap-2 text-[0.9375rem] font-bold', tone === 'dark' ? 'text-gold-400' : 'text-ink-900')}>
                    {icon && <span className="text-gold-600">{icon}</span>}
                    {title}
                </h2>
            )}
            {children}
        </section>
    );
}

/** Label/value rows (purchase card facts, terms tables). */
export function FactRows({
    rows,
    tone = 'light',
    className,
}: {
    rows: [string, ReactNode][];
    tone?: 'light' | 'dark';
    className?: string;
}) {
    return (
        <dl className={cn('divide-y text-[0.8125rem]', tone === 'dark' ? 'divide-ink-700' : 'divide-parchment-300', className)}>
            {rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-3 py-1.5">
                    <dt className={tone === 'dark' ? 'text-ink-300' : 'text-ink-500'}>{k}</dt>
                    <dd className={cn('font-medium', tone === 'dark' ? 'text-parchment-100' : 'text-ink-900')}>{v}</dd>
                </div>
            ))}
        </dl>
    );
}

/** Formats a ZAR amount in the visitor's currency; falls back to "Quote" when null. */
export function useMoney() {
    const price = usePrice();
    return (zar: number | null | undefined, opts: { decimals?: boolean } = {}) => {
        if (zar === null || zar === undefined) return 'Quote';
        const out = price(zar);
        return opts.decimals && out.startsWith('R') ? `${out}.00` : out;
    };
}

export { formatZar };

/** "ZAR 14,800" style used on several mockups. */
export function zarComma(zar: number, decimals = false) {
    return `ZAR ${zar.toLocaleString('en-US', { minimumFractionDigits: decimals ? 2 : 0, maximumFractionDigits: decimals ? 2 : 0 })}`;
}

/** Rail of related sprints, linking to their product pages. */
export function RelatedSprints({
    related,
    title = 'Related Sprints',
    tone = 'light',
    className,
}: {
    related: SprintRecord[];
    title?: string;
    tone?: 'light' | 'dark';
    className?: string;
}) {
    const money = useMoney();
    if (!related.length) return null;
    return (
        <section className={className}>
            <h2 className={cn('mb-3 text-[0.9375rem] font-bold uppercase tracking-wide', tone === 'dark' ? 'text-gold-400' : 'text-ink-900')}>{title}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {related.slice(0, 4).map((r) => (
                    <Link
                        key={r.id}
                        href={sprintHref(r)}
                        className={cn(
                            'group flex flex-col overflow-hidden rounded-[8px] border p-4 transition-colors',
                            tone === 'dark' ? 'border-ink-700 bg-ink-900 hover:border-gold-500' : 'border-parchment-400 bg-white hover:border-gold-400',
                        )}
                    >
                        <CoverArt seed={r.slug} category={r.category} src={r.image_url} label={r.title} className="-mx-4 -mt-4 mb-3 aspect-[16/7] w-[calc(100%+2rem)] max-w-none" />
                        <span className="text-[0.6875rem] font-semibold tracking-wide text-gold-600 uppercase">{r.type.replace(/-/g, ' ')}</span>
                        <span className={cn('mt-1 text-sm leading-snug font-semibold', tone === 'dark' ? 'text-parchment-100' : 'text-ink-900')}>{r.title}</span>
                        {r.summary && <span className={cn('mt-1 line-clamp-2 text-xs', tone === 'dark' ? 'text-ink-300' : 'text-ink-500')}>{r.summary}</span>}
                        <span className="mt-auto flex items-center justify-between pt-3 text-[0.8125rem] font-semibold text-gold-700">
                            {r.price_zar ? `From ${money(r.price_zar)}` : 'Request a Quote'}
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    );
}

/** Horizontal trust strip with icon + two lines per item. */
export function TrustStrip({
    items,
    tone = 'light',
    className,
}: {
    items: { icon: ReactNode; title: string; text?: string }[];
    tone?: 'light' | 'dark';
    className?: string;
}) {
    return (
        <div
            className={cn(
                'grid gap-4 rounded-[8px] border p-4 sm:grid-cols-2 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none',
                tone === 'dark' ? 'border-ink-700 bg-ink-900 text-parchment-100' : 'border-parchment-400 bg-white',
                className,
            )}
        >
            {items.map((it) => (
                <div key={it.title} className="flex items-start gap-3">
                    <span className={cn('mt-0.5 shrink-0', tone === 'dark' ? 'text-gold-400' : 'text-gold-600')}>{it.icon}</span>
                    <div>
                        <p className={cn('text-[0.8125rem] font-semibold', tone === 'dark' ? 'text-parchment-100' : 'text-ink-900')}>{it.title}</p>
                        {it.text && <p className={cn('text-xs', tone === 'dark' ? 'text-ink-300' : 'text-ink-500')}>{it.text}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Key/value pairs from JSON arrays, guarded against bad data. */
export function pairs(v: unknown): [string, string][] {
    return Array.isArray(v) ? (v.filter((r) => Array.isArray(r) && r.length >= 2) as [string, string][]) : [];
}

export function list(v: unknown): string[] {
    return Array.isArray(v) ? (v.filter((x) => typeof x === 'string') as string[]) : [];
}
