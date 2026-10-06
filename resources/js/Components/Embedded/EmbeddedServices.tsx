import { Link } from '@inertiajs/react';
import { ArrowRight, Clock, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import CoverArt from '@/Components/Art/CoverArt';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';

export interface EmbeddedService {
    code: string;
    slug: string;
    title: string;
    category: string | null;
    host: string | null;
    group: string | null;
    price_zar: number | null;
    delivery: string | null;
    quote: boolean;
    href: string;
}

/** Payload from App\Support\Platform\EmbeddedServices::forModule(). */
export interface EmbeddedSection {
    module: string;
    label: string;
    total: number;
    href: string;
    items: EmbeddedService[];
}

const PAGE = 8;

/**
 * "Embedded Services" section for a host module page (Virtual Deal Room, Project Advisory,
 * Countries, Industries, Resources, KP Thought Leadership, Webinars ...). Shows a search and
 * group filter when there are many, a few cards at a time, and "View all" to the full list.
 */
export default function EmbeddedServices({
    section,
    title = 'Embedded Services',
    intro,
    tone = 'light',
    pageSize = PAGE,
    showViewAll = true,
    contained = true,
    className,
}: {
    section: EmbeddedSection | null | undefined;
    title?: string;
    intro?: string;
    tone?: 'light' | 'dark';
    pageSize?: number;
    showViewAll?: boolean;
    /** false inside a shell that already provides the page container. */
    contained?: boolean;
    className?: string;
}) {
    const price = usePrice('Quote on request');
    const [q, setQ] = useState('');
    const [group, setGroup] = useState('');
    const [shown, setShown] = useState(pageSize);

    const items = section?.items ?? [];
    const groups = useMemo(() => Array.from(new Set(items.map((i) => i.group).filter((g): g is string => !!g))).sort(), [items]);
    const filtered = useMemo(() => {
        const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);

        return items.filter((i) => (!group || i.group === group) && tokens.every((t) => `${i.title} ${i.host ?? ''} ${i.group ?? ''} ${i.code}`.toLowerCase().includes(t)));
    }, [items, q, group]);

    if (!section || items.length === 0) return null;

    const dark = tone === 'dark';
    const many = items.length > pageSize;
    const visible = filtered.slice(0, shown);

    return (
        <section aria-labelledby={`embedded-${section.module}`} className={cn(contained ? 'container-tbca py-10' : 'py-2', className)}>
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className={cn('text-[0.75rem] font-semibold tracking-widest uppercase', dark ? 'text-gold-400' : 'text-gold-700')}>{section.label}</p>
                    <h2 id={`embedded-${section.module}`} className={cn('mt-1 text-2xl font-semibold', dark ? 'text-parchment-100' : 'text-ink-900')}>
                        {title}
                    </h2>
                    <p className={cn('mt-1 max-w-2xl text-[0.875rem]', dark ? 'text-parchment-300' : 'text-ink-600')}>
                        {intro ?? `${section.total} fixed-price services that run inside ${section.label}. Prices are in your selected currency, excluding VAT.`}
                    </p>
                </div>
                {showViewAll && section.total > 0 && (
                    <Link href={section.href} className={cn('inline-flex items-center gap-1.5 text-sm font-semibold', dark ? 'text-gold-400 hover:text-gold-300' : 'text-gold-700 hover:text-gold-600')}>
                        View all {section.total} <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                )}
            </div>

            {many && (
                <div className="mt-5 flex flex-wrap gap-3">
                    <label className="relative min-w-[220px] flex-1">
                        <span className="sr-only">Search embedded services</span>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                        <input
                            type="search"
                            value={q}
                            onChange={(e) => {
                                setQ(e.target.value);
                                setShown(pageSize);
                            }}
                            placeholder="Search embedded services"
                            className={cn(
                                'h-10 w-full rounded-[4px] border pr-3 pl-9 text-sm',
                                dark ? 'border-ink-700 bg-ink-900 text-parchment-100 placeholder:text-ink-400' : 'border-parchment-400 bg-white text-ink-900',
                            )}
                        />
                    </label>
                    {groups.length > 1 && (
                        <label>
                            <span className="sr-only">Filter by area</span>
                            <select
                                value={group}
                                onChange={(e) => {
                                    setGroup(e.target.value);
                                    setShown(pageSize);
                                }}
                                className={cn('h-10 rounded-[4px] border px-3 text-sm', dark ? 'border-ink-700 bg-ink-900 text-parchment-100' : 'border-parchment-400 bg-white text-ink-900')}
                            >
                                <option value="">All areas</option>
                                {groups.map((g) => (
                                    <option key={g} value={g}>
                                        {g}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                </div>
            )}

            {visible.length === 0 ? (
                <p className={cn('mt-6 text-sm', dark ? 'text-parchment-300' : 'text-ink-600')}>No embedded services match your search.</p>
            ) : (
                <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {visible.map((s) => (
                        <li key={s.code}>
                            <Link
                                href={s.href}
                                className={cn(
                                    'group flex h-full flex-col overflow-hidden rounded-[8px] border transition',
                                    dark ? 'border-ink-700 bg-ink-900 hover:border-gold-600' : 'border-parchment-400 bg-white hover:border-gold-500',
                                )}
                            >
                                <CoverArt seed={s.slug} category={s.category} label={s.title} className="aspect-[16/9]" />
                                <div className="flex flex-1 flex-col p-4">
                                    {s.group && <p className={cn('text-[0.6875rem] font-semibold tracking-wide uppercase', dark ? 'text-gold-400' : 'text-gold-700')}>{s.group}</p>}
                                    <h3 className={cn('mt-1 line-clamp-2 text-[0.9375rem] font-semibold', dark ? 'text-parchment-100' : 'text-ink-900')}>{s.title}</h3>
                                    <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                                        <p className={cn('text-[0.8125rem]', dark ? 'text-parchment-300' : 'text-ink-600')}>
                                            {s.quote ? (
                                                <span className="font-semibold">Quote on request</span>
                                            ) : (
                                                <>
                                                    Basic <span className={cn('font-bold', dark ? 'text-parchment-100' : 'text-ink-900')}>{price(s.price_zar)}</span>
                                                </>
                                            )}
                                        </p>
                                        <ArrowRight className={cn('size-4 shrink-0 transition group-hover:translate-x-0.5', dark ? 'text-gold-400' : 'text-gold-700')} aria-hidden="true" />
                                    </div>
                                    {s.delivery && (
                                        <p className={cn('mt-1 inline-flex items-center gap-1 text-[0.75rem]', dark ? 'text-ink-300' : 'text-ink-500')}>
                                            <Clock className="size-3.5" aria-hidden="true" /> {s.delivery}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            {(filtered.length > shown || (showViewAll && section.total > items.length)) && (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {filtered.length > shown && (
                        <button
                            type="button"
                            onClick={() => setShown((n) => n + pageSize)}
                            className={cn('inline-flex h-10 items-center rounded-[4px] border px-5 text-sm font-semibold', dark ? 'border-gold-600 text-parchment-100 hover:text-gold-300' : 'border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-parchment-100')}
                        >
                            Show more ({filtered.length - shown} more)
                        </button>
                    )}
                    {showViewAll && section.total > items.length && (
                        <Link href={section.href} className="inline-flex h-10 items-center gap-1.5 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                            View all {section.total} embedded services <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                    )}
                </div>
            )}
        </section>
    );
}
