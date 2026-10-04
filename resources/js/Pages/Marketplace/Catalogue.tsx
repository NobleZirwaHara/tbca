import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Repeat, Search, SlidersHorizontal, Star } from 'lucide-react';
import { Input, Select } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import { MkHeader } from '@/Components/Marketplace/ui';
import { usePrice } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { MkListing } from '@/types/marketplace';

interface Props {
    listings: MkListing[];
    filters: { q?: string; category?: string; type?: string; sort?: string; max?: string };
    categories: { value: string; label: string; count: number }[];
}

export default function Catalogue({ listings, filters, categories }: Props) {
    const price = usePrice();
    const [q, setQ] = useState(filters.q ?? '');
    const apply = (patch: Partial<Props['filters']>) => {
        const next = Object.fromEntries(Object.entries({ ...filters, q, ...patch }).filter(([, v]) => v));
        router.get('/marketplace/services', next, { preserveScroll: true, preserveState: true, replace: true });
    };

    return (
        <>
            <Head title="Marketplace Services" />
            <MkHeader
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Marketplace', href: '/marketplace' }, { label: 'Services' }]}
                eyebrow="TBCA Marketplace"
                title="Browse Marketplace Services"
                lead="Fixed-scope and recurring services delivered by verified providers under TBCA QA. Need something bespoke? Submit a brief and we will scope it for you."
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-6 lg:grid-cols-12">
                    <aside className="lg:col-span-3">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900"><SlidersHorizontal className="size-4" aria-hidden="true" /> Categories</h2>
                            <ul className="mt-3 space-y-1">
                                <li>
                                    <button type="button" onClick={() => apply({ category: undefined })} className={cn('w-full rounded px-2 py-1.5 text-left text-sm', !filters.category ? 'bg-gold-50 font-semibold text-gold-800' : 'text-ink-700 hover:bg-parchment-100')}>
                                        All categories
                                    </button>
                                </li>
                                {categories.map((c) => (
                                    <li key={c.value}>
                                        <button type="button" onClick={() => apply({ category: c.value })} className={cn('flex w-full justify-between rounded px-2 py-1.5 text-left text-sm', filters.category === c.value ? 'bg-gold-50 font-semibold text-gold-800' : 'text-ink-700 hover:bg-parchment-100')}>
                                            {c.label} <span className="text-xs text-ink-400">{c.count}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <h2 className="mt-5 text-sm font-bold text-ink-900">Engagement type</h2>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {[['', 'All'], ['fixed', 'Fixed scope'], ['recurring', 'Recurring']].map(([v, l]) => (
                                    <button key={v} type="button" aria-pressed={(filters.type ?? '') === v} onClick={() => apply({ type: v || undefined })}
                                        className={cn('rounded-full border px-3 py-1 text-xs', (filters.type ?? '') === v ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-500 text-ink-600')}>{l}</button>
                                ))}
                            </div>
                            <label className="mt-5 block text-sm font-bold text-ink-900">
                                Maximum price
                                <Select className="mt-2" value={filters.max ?? ''} onChange={(e) => apply({ max: e.target.value || undefined })} placeholder="Any price"
                                    options={[{ value: '10000', label: 'Up to R10 000' }, { value: '20000', label: 'Up to R20 000' }, { value: '35000', label: 'Up to R35 000' }, { value: '50000', label: 'Up to R50 000' }]} />
                            </label>
                        </div>
                    </aside>
                    <div className="lg:col-span-9">
                        <div className="flex flex-wrap items-center gap-3">
                            <form role="search" className="relative min-w-0 flex-1" onSubmit={(e) => { e.preventDefault(); apply({}); }}>
                                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                                <Input aria-label="Search services" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services, e.g. valuation, market entry…" className="pl-9" />
                            </form>
                            <Button type="button" variant="ink" size="sm" onClick={() => apply({})}>Search</Button>
                            <Select aria-label="Sort" className="w-48" value={filters.sort ?? 'popular'} onChange={(e) => apply({ sort: e.target.value })}
                                options={[{ value: 'popular', label: 'Sort: Popularity' }, { value: 'rating', label: 'Sort: Rating' }, { value: 'price_asc', label: 'Price: Low to High' }, { value: 'price_desc', label: 'Price: High to Low' }, { value: 'newest', label: 'Newest' }]} />
                        </div>
                        <p className="mt-3 text-sm text-ink-500">{listings.length} service{listings.length === 1 ? '' : 's'} found</p>
                        {listings.length === 0 ? (
                            <div className="mt-4 rounded-[8px] border border-dashed border-parchment-500 bg-white p-10 text-center">
                                <p className="font-semibold text-ink-900">No services match your filters.</p>
                                <p className="mt-1 text-sm text-ink-500">Try a different search, or submit a brief and TBCA will scope the work.</p>
                                <Link href="/marketplace/brief" className="mt-3 inline-block text-sm font-semibold text-gold-700">Submit a Marketplace Brief →</Link>
                            </div>
                        ) : (
                            <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {listings.map((l) => (
                                    <li key={l.slug}>
                                        <Link href={`/marketplace/services/${l.slug}`} className="flex h-full flex-col overflow-hidden rounded-[8px] border border-parchment-400 bg-white transition-colors hover:border-gold-400">
                                            <div className="relative h-28 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950">
                                                <div className="absolute inset-0 motif-grid opacity-30" aria-hidden="true" />
                                                {l.badge && <span className="absolute top-3 left-3 rounded-[3px] bg-gold-500 px-2 py-0.5 text-[0.625rem] font-bold tracking-wide text-ink-900 uppercase">{l.badge}</span>}
                                                {l.kind === 'recurring' && <Repeat className="absolute right-3 bottom-3 size-5 text-gold-400" aria-label="Recurring service" />}
                                            </div>
                                            <div className="flex flex-1 flex-col p-4">
                                                <span className="text-[0.6875rem] font-semibold tracking-wide text-gold-700 uppercase">{l.categoryLabel}</span>
                                                <span className="mt-1 font-semibold text-ink-900">{l.title}</span>
                                                <span className="mt-1 line-clamp-3 flex-1 text-xs text-ink-500">{l.summary}</span>
                                                <span className="mt-2 text-xs text-ink-500">{l.provider?.name}</span>
                                                <span className="mt-3 flex items-center justify-between">
                                                    <span className="font-bold text-ink-900">{price(l.priceZar ?? 0)}<span className="text-xs font-normal text-ink-500">{l.period ? ' / month' : ''}</span></span>
                                                    <span className="flex items-center gap-1 text-xs text-ink-600"><Star className="size-3.5 fill-gold-500 text-gold-500" aria-hidden="true" /> {l.rating ?? '—'} ({l.reviewsCount})</span>
                                                </span>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
