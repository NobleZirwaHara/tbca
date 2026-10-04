import { Link } from '@inertiajs/react';
import { ArrowRight, Bot, ChevronDown, CircleCheck, Clock, LayoutGrid, List, RefreshCw, Rocket, Scale, UserRound, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Modal } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import type { CatalogueFilters, CatalogueItem, FacetOption, Facets, Paginated } from '@/types/sprints';
import { CardBadge, IconTile, Rating } from './CatalogueCard';
import { hasValue, priceText, toggleValue } from './lib';

/* ------------------------------------------------------------------ Filters */

export interface FilterGroup {
    key: keyof CatalogueFilters;
    label: string;
    icon?: ReactNode;
    options: FacetOption[];
    single?: boolean;
}

export function buildGroups(facets: Facets, locked: string[] = [], extra: FilterGroup[] = []): FilterGroup[] {
    const groups: FilterGroup[] = [
        { key: 'category', label: 'Category', options: facets.categories },
        { key: 'audience', label: 'Buyer Route', options: facets.audiences },
        { key: 'need', label: 'Business Need', options: facets.needs },
        { key: 'delivery', label: 'Delivery Time', options: facets.delivery },
        { key: 'act', label: 'Commercial Route', options: facets.acts },
        { key: 'price', label: 'Price', options: facets.prices },
        { key: 'type', label: 'Sprint Type', options: facets.types },
        { key: 'rating', label: 'Rating', options: facets.ratings, single: true },
        ...extra,
    ];
    return groups.filter((g) => !locked.includes(g.key) && g.options.some((o) => o.count > 0));
}

export function FilterSidebar({
    title,
    groups,
    filters,
    onChange,
    onClear,
    tone = 'dark',
    header,
}: {
    title: string;
    groups: FilterGroup[];
    filters: CatalogueFilters;
    onChange: (key: keyof CatalogueFilters, value: string | null) => void;
    onClear: () => void;
    tone?: 'dark' | 'light';
    header?: ReactNode;
}) {
    const [open, setOpen] = useState<string | null>(groups.find((g) => filters[g.key])?.key ?? null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const dark = tone === 'dark';

    return (
        <aside className={cn('rounded-[8px] border p-4', dark ? 'border-ink-700 bg-ink-900 text-parchment-100' : 'border-parchment-400 bg-white')}>
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-[0.9375rem] font-semibold">{title}</h2>
                <button type="button" onClick={() => setMobileOpen((v) => !v)} className="text-[0.75rem] font-semibold text-gold-500 lg:hidden" aria-expanded={mobileOpen}>
                    {mobileOpen ? 'Hide filters' : 'Show filters'}
                </button>
                <button type="button" onClick={onClear} className="hidden items-center gap-1 text-[0.75rem] font-medium text-gold-500 hover:text-gold-400 lg:inline-flex">
                    Clear All <RefreshCw className="size-3" aria-hidden="true" />
                </button>
            </div>
            <div className={cn('mt-3 lg:block', mobileOpen ? 'block' : 'hidden')}>
                {header}
                <ul className={cn('divide-y', dark ? 'divide-ink-700' : 'divide-parchment-300')}>
                    {groups.map((g, i) => {
                        const expanded = open === g.key;
                        const active = filters[g.key];
                        return (
                            <li key={g.key}>
                                <button
                                    type="button"
                                    onClick={() => setOpen(expanded ? null : g.key)}
                                    aria-expanded={expanded}
                                    className="flex w-full items-center justify-between gap-2 py-2.5 text-left text-[0.8125rem] font-medium"
                                >
                                    <span>
                                        {i + 1}) {g.label}
                                        {active && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-gold-500 align-middle" />}
                                    </span>
                                    <span className={cn('flex items-center gap-1.5 text-[0.6875rem]', dark ? 'text-ink-300' : 'text-ink-400')}>
                                        ({g.options.filter((o) => o.count > 0).length})
                                        <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
                                    </span>
                                </button>
                                {expanded && (
                                    <ul className="space-y-1.5 pb-3">
                                        {g.options
                                            .filter((o) => o.count > 0 || hasValue(active, o.value))
                                            .map((o) => {
                                                const checked = hasValue(active, o.value);
                                                return (
                                                    <li key={o.value}>
                                                        <label className={cn('flex cursor-pointer items-center gap-2 text-[0.8125rem]', dark ? 'text-parchment-200' : 'text-ink-700')}>
                                                            <input
                                                                type={g.single ? 'radio' : 'checkbox'}
                                                                name={g.key}
                                                                checked={checked}
                                                                onChange={() => onChange(g.key, g.single ? (checked ? null : o.value) : toggleValue(active, o.value))}
                                                                className="size-3.5 accent-gold-500"
                                                            />
                                                            <span className="flex-1">{o.label}</span>
                                                            <span className={dark ? 'text-ink-400' : 'text-ink-400'}>{o.count}</span>
                                                        </label>
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
                <button type="button" onClick={onClear} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[4px] border border-gold-500/60 py-2 text-[0.8125rem] font-semibold text-gold-500 hover:bg-gold-500/10">
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    Clear All Filters
                </button>
            </div>
        </aside>
    );
}

/* ------------------------------------------------------------------ Toolbar */

export function ActiveChips({
    filters,
    groups,
    onRemove,
    onClear,
}: {
    filters: CatalogueFilters;
    groups: FilterGroup[];
    onRemove: (key: keyof CatalogueFilters, value: string | null) => void;
    onClear: () => void;
}) {
    const chips: { key: keyof CatalogueFilters; value: string; label: string }[] = [];
    for (const g of groups) {
        for (const v of (filters[g.key] ?? '').split(',').filter(Boolean)) {
            chips.push({ key: g.key, value: v, label: `${g.label}: ${g.options.find((o) => o.value === v)?.label ?? v}` });
        }
    }
    if (filters.q) chips.push({ key: 'q', value: filters.q, label: `Search: “${filters.q}”` });
    if (filters.flag) chips.push({ key: 'flag', value: filters.flag, label: `Show: ${filters.flag.replace('-', ' ')}` });
    if (!chips.length) return null;

    return (
        <div className="mt-3 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
                <span key={`${c.key}-${c.value}`} className="inline-flex items-center gap-1.5 rounded-[4px] border border-gold-300 bg-gold-50 px-2 py-1 text-[0.75rem] text-ink-800">
                    {c.label}
                    <button
                        type="button"
                        aria-label={`Remove ${c.label}`}
                        onClick={() => onRemove(c.key, c.key === 'q' || c.key === 'flag' || c.key === 'rating' ? null : toggleValue(filters[c.key], c.value))}
                        className="text-ink-500 hover:text-risk-500"
                    >
                        <X className="size-3" />
                    </button>
                </span>
            ))}
            <button type="button" onClick={onClear} className="text-[0.75rem] font-semibold text-gold-700 underline">
                Clear all
            </button>
        </div>
    );
}

export function ResultsToolbar({
    title,
    count,
    countLabel = 'Sprints available',
    sort,
    sorts,
    onSort,
    layout,
    onLayout,
    compareCount,
    onCompare,
    pill = false,
}: {
    title: string;
    count: number;
    countLabel?: string;
    sort: string;
    sorts: Record<string, string>;
    onSort: (s: string) => void;
    layout: 'grid' | 'list';
    onLayout: (l: 'grid' | 'list') => void;
    compareCount: number;
    onCompare: () => void;
    pill?: boolean;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-xl font-bold text-ink-900">{title}</h2>
                <span className={cn('text-[0.8125rem]', pill ? 'rounded-full border border-verified-500/30 bg-verified-50 px-2 py-0.5 text-[0.75rem] font-semibold text-verified-700' : 'text-ink-500')}>
                    {count.toLocaleString('en-ZA')} {countLabel}
                </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 text-[0.8125rem] text-ink-600">
                    <span className="hidden sm:inline">Sort by:</span>
                    <select value={sort} onChange={(e) => onSort(e.target.value)} className="h-9 rounded-[4px] border border-parchment-500 bg-white px-2 pr-7 text-[0.8125rem] text-ink-900 focus:border-gold-500 focus:outline-none">
                        {Object.entries(sorts).map(([k, v]) => (
                            <option key={k} value={k}>
                                {v}
                            </option>
                        ))}
                    </select>
                </label>
                <div className="flex overflow-hidden rounded-[4px] border border-parchment-500" role="group" aria-label="Layout">
                    <button type="button" onClick={() => onLayout('grid')} aria-pressed={layout === 'grid'} aria-label="Grid view" className={cn('p-2', layout === 'grid' ? 'bg-gold-500 text-ink-900' : 'bg-white text-ink-500')}>
                        <LayoutGrid className="size-4" />
                    </button>
                    <button type="button" onClick={() => onLayout('list')} aria-pressed={layout === 'list'} aria-label="List view" className={cn('p-2', layout === 'list' ? 'bg-gold-500 text-ink-900' : 'bg-white text-ink-500')}>
                        <List className="size-4" />
                    </button>
                </div>
                <button type="button" onClick={onCompare} disabled={compareCount < 2} title={compareCount < 2 ? 'Select at least two Sprints to compare' : undefined} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 text-[0.8125rem] font-medium text-ink-800 disabled:opacity-60">
                    <Scale className="size-4" aria-hidden="true" />
                    Compare Sprints ({compareCount})
                </button>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ Spotlight */

export function Spotlight({ item, label, whyLabel, compared, onCompare }: { item: CatalogueItem; label: string; whyLabel: string; compared: boolean; onCompare: (i: CatalogueItem) => void }) {
    const price = usePrice();
    const p = priceText(item, price);
    return (
        <article className="relative mt-4 grid gap-5 rounded-[8px] border border-gold-400 bg-gold-50/50 p-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_200px]">
            <span className="absolute -top-2.5 left-4 rounded-[3px] bg-gold-500 px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-ink-900 uppercase">{label}</span>
            <div className="flex gap-4">
                <IconTile name={item.icon} size="lg" />
                <div className="min-w-0">
                    <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-[3px] border border-gold-300 bg-white px-1.5 py-0.5 text-[0.625rem] font-semibold text-gold-800">{item.category_label}</span>
                        <CardBadge label={item.badge} />
                    </div>
                    <h3 className="mt-1.5 text-lg font-bold text-ink-900">{item.title}</h3>
                    <p className="mt-1 text-[0.8125rem] text-ink-600">{item.summary}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[0.75rem] text-ink-600">
                        <Rating value={item.rating} reviews={item.reviews} />
                        <span className="inline-flex items-center gap-1">
                            <Clock className="size-3.5" aria-hidden="true" />
                            {item.delivery ?? 'Delivery after scope'} turnaround
                        </span>
                    </div>
                    {item.ideal_for.length > 0 && (
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.6875rem]">
                            <span className="font-semibold text-ink-700">Ideal for:</span>
                            {item.ideal_for.map((t) => (
                                <span key={t} className="rounded-full border border-parchment-500 bg-white px-2 py-0.5 text-ink-600">
                                    {t}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="border-parchment-400 md:border-l md:pl-5">
                <p className="text-[0.8125rem] font-semibold text-ink-900">{whyLabel}</p>
                <ul className="mt-2 space-y-1.5">
                    {item.why.map((w) => (
                        <li key={w} className="flex items-start gap-2 text-[0.8125rem] text-ink-700">
                            <CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
                            {w}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col justify-center gap-2 border-parchment-400 md:border-l md:pl-5">
                <p className="text-[0.75rem] text-ink-500">{p.label}</p>
                <p className="text-2xl font-bold text-ink-900">{p.value}</p>
                <Link href={`/sprints/${item.slug}`} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                    View Sprint <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <button type="button" onClick={() => onCompare(item)} aria-pressed={compared} className={cn('inline-flex h-10 items-center justify-center gap-1.5 rounded-[4px] border text-sm', compared ? 'border-gold-500 bg-gold-50' : 'border-ink-300 bg-white')}>
                    <Scale className="size-4" aria-hidden="true" />
                    Compare
                </button>
            </div>
        </article>
    );
}

/* ------------------------------------------------------------------ Help bands */

export function HelpBands({ subject = 'Sprint', finderLabel = 'Start Sprint Finder', customLabel = 'Request a Custom Sprint', customBody = 'Tell us what you are trying to achieve and TBCA will structure the right Sprint.' }: { subject?: string; finderLabel?: string; customLabel?: string; customBody?: string }) {
    return (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-4 rounded-[8px] border border-gold-300 bg-gold-50/60 p-5 sm:flex-row sm:items-center">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-gold-600 ring-1 ring-gold-300">
                    <Bot className="size-6" aria-hidden="true" />
                </span>
                <div className="flex-1">
                    <p className="font-semibold text-ink-900">Not sure which {subject} fits your needs?</p>
                    <p className="mt-0.5 text-[0.8125rem] text-ink-600">Answer a few questions and receive a tailored recommendation based on your business stage, objective, urgency and budget.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <Link href="/sprints/recommended" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] bg-gold-500 px-3 text-[0.8125rem] font-semibold text-ink-900">
                        {finderLabel} <span className="rounded-[3px] bg-ink-900 px-1 text-[0.625rem] text-gold-400">AI</span>
                    </Link>
                    <button type="button" onClick={() => openAskQuestion({ subject: `Help choosing a ${subject}`, section: 'sprints' })} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] border border-ink-300 bg-white px-3 text-[0.8125rem] font-medium text-ink-800">
                        <UserRound className="size-4" aria-hidden="true" /> Request Human Assistance
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-4 rounded-[8px] bg-ink-900 p-5 text-parchment-100 sm:flex-row sm:items-center">
                <Rocket className="size-10 shrink-0 text-gold-400" aria-hidden="true" />
                <div className="flex-1">
                    <p className="font-semibold">Can&rsquo;t find what you need?</p>
                    <p className="mt-0.5 text-[0.8125rem] text-parchment-200">{customBody}</p>
                </div>
                <Link href="/sprints/request-a-quote" className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[4px] border border-gold-500 px-4 text-[0.8125rem] font-semibold text-gold-400 hover:bg-gold-500/10">
                    {customLabel} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ Pagination */

export function Pagination({ results, onPage }: { results: Paginated<unknown>; onPage: (page: number) => void }) {
    if (results.last_page <= 1) return null;
    const pages: (number | '…')[] = [];
    for (let i = 1; i <= results.last_page; i++) {
        if (i === 1 || i === results.last_page || Math.abs(i - results.current_page) <= 1) pages.push(i);
        else if (pages[pages.length - 1] !== '…') pages.push('…');
    }
    return (
        <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
            <button type="button" disabled={results.current_page === 1} onClick={() => onPage(results.current_page - 1)} className="h-9 rounded-[4px] border border-parchment-500 bg-white px-3 text-[0.8125rem] disabled:opacity-40">
                Previous
            </button>
            {pages.map((p, i) =>
                p === '…' ? (
                    <span key={`e${i}`} className="px-1 text-ink-400">
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onPage(p)}
                        aria-current={p === results.current_page ? 'page' : undefined}
                        className={cn('h-9 min-w-9 rounded-[4px] border px-2 text-[0.8125rem]', p === results.current_page ? 'border-gold-500 bg-gold-500 font-semibold text-ink-900' : 'border-parchment-500 bg-white')}
                    >
                        {p}
                    </button>
                ),
            )}
            <button type="button" disabled={results.current_page === results.last_page} onClick={() => onPage(results.current_page + 1)} className="h-9 rounded-[4px] border border-parchment-500 bg-white px-3 text-[0.8125rem] disabled:opacity-40">
                Next
            </button>
        </nav>
    );
}

/* ------------------------------------------------------------------ Compare */

/** Compare selection lives in page state; at most three Sprints side by side. */
export function useCompare() {
    const [items, setItems] = useState<CatalogueItem[]>([]);
    const [open, setOpen] = useState(false);
    const toggle = (item: CatalogueItem) =>
        setItems((cur) => (cur.some((c) => c.id === item.id) ? cur.filter((c) => c.id !== item.id) : [...cur, item].slice(-3)));
    const has = (item: CatalogueItem) => items.some((c) => c.id === item.id);
    return { items, toggle, has, open, setOpen, clear: () => setItems([]) };
}

export function CompareModal({ items, open, onClose, onRemove }: { items: CatalogueItem[]; open: boolean; onClose: () => void; onRemove: (i: CatalogueItem) => void }) {
    const price = usePrice();
    const rows: [string, (i: CatalogueItem) => ReactNode][] = [
        ['Category', (i) => i.category_label],
        ['Price', (i) => { const p = priceText(i, price); return `${p.label} ${p.value}`; }],
        ['Delivery', (i) => i.delivery ?? 'Confirmed after scope'],
        ['Rating', (i) => (i.rating ? `${i.rating.toFixed(1)} (${i.reviews} reviews)` : '—')],
        ['Packages', (i) => i.packages.join(', ') || 'Single price'],
        ['Ideal for', (i) => i.ideal_for.join(', ')],
        ['Commercial route', (i) => i.commercial_act],
        ['Key outcomes', (i) => (
            <ul className="space-y-1">
                {i.why.map((w) => (
                    <li key={w}>• {w}</li>
                ))}
            </ul>
        )],
    ];
    return (
        <Modal open={open} onClose={onClose} title={`Compare Sprints (${items.length})`} size="xl">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-[0.8125rem]">
                    <thead>
                        <tr>
                            <th className="w-32" />
                            {items.map((i) => (
                                <th key={i.id} className="p-2 align-top">
                                    <p className="font-semibold text-ink-900">{i.title}</p>
                                    <div className="mt-1 flex gap-3">
                                        <Link href={`/sprints/${i.slug}`} className="text-[0.75rem] font-semibold text-gold-700">
                                            View Sprint
                                        </Link>
                                        <button type="button" onClick={() => onRemove(i)} className="text-[0.75rem] text-ink-400 hover:text-risk-500">
                                            Remove
                                        </button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-parchment-300">
                        {rows.map(([label, fn]) => (
                            <tr key={label}>
                                <th className="p-2 align-top text-[0.75rem] font-semibold text-ink-500">{label}</th>
                                {items.map((i) => (
                                    <td key={i.id} className="p-2 align-top text-ink-800">
                                        {fn(i)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Modal>
    );
}
