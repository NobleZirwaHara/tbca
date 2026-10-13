import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { BadgeCheck, Boxes, ChevronRight, LayoutGrid, List, Search, Store } from 'lucide-react';
import { HeroStats, ShopCrumbs, ShopHero, TrustStrip } from '@/Components/Shop/Bits';
import ShopIcon from '@/Components/Shop/ShopIcon';
import FilterCheckboxes from '@/Components/Shop/FilterCheckboxes';
import { cn } from '@/lib/cn';
import type { Aisle, CountOption } from '@/types/shop';

interface Props {
    aisles: Aisle[];
    filters: { q: string; buyer: string | null; acts: string[]; sort: string; view: string };
    buyerCounts: CountOption[];
    actCounts: CountOption[];
    totals: { aisles: number; products: number };
}

export default function AtoZ({ aisles, filters, buyerCounts, actCounts, totals }: Props) {
    const [q, setQ] = useState(filters.q);
    const go = (patch: Partial<Props['filters']>) => {
        const next = { ...filters, ...patch };
        router.get(
            '/shop/a-z',
            { q: next.q || undefined, buyer: next.buyer || undefined, acts: next.acts.length ? next.acts : undefined, sort: next.sort !== 'az' ? next.sort : undefined, view: next.view !== 'grid' ? next.view : undefined },
            { preserveScroll: true, preserveState: true },
        );
    };
    const list = filters.view === 'list';

    return (
        <>
            <Head title="A-to-Z Aisle Browser" />
            <ShopHero
                crumbs={<ShopCrumbs items={[{ label: 'Online Shop', href: '/shop' }, { label: 'A-to-Z Aisle Browser' }]} />}
                title="A-to-Z Aisle Browser"
                intro={`Explore our ${totals.aisles} canonical aisles that organise our entire catalogue of ${totals.products.toLocaleString('en-ZA').replace(/\s/g, ',')} governed Sprints, digital products, subscriptions, retainers and professional services.`}
                aside={
                    <HeroStats
                        stats={[
                            { icon: <Boxes className="size-6" />, value: totals.aisles, label: 'Canonical Aisles', caption: 'Standardised categories for fast discovery' },
                            { icon: <Store className="size-6" />, value: totals.products.toLocaleString('en-ZA').replace(/\s/g, ','), label: 'Governed Products', caption: 'Curated from verified sources' },
                            { icon: <BadgeCheck className="size-6" />, value: '100%', label: 'QA Verified', caption: 'Human-reviewed for accuracy & compliance' },
                        ]}
                    />
                }
            />

            <div className="container-tbca py-6">
                <div className="flex flex-wrap items-center gap-3">
                    <form
                        role="search"
                        className="relative w-full sm:w-72"
                        onSubmit={(e) => {
                            e.preventDefault();
                            go({ q });
                        }}
                    >
                        <label htmlFor="aisle-q" className="sr-only">Search aisles by name or keyword</label>
                        <input id="aisle-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search aisles by name or keyword..." className="h-10 w-full rounded-[4px] border border-parchment-500 bg-white pr-10 pl-3 text-sm" />
                        <button type="submit" aria-label="Search aisles" className="absolute top-0 right-0 flex size-10 items-center justify-center text-gold-700"><Search className="size-4" /></button>
                    </form>
                    <div className="flex items-center gap-1" role="group" aria-label="View as">
                        <span className="mr-1 text-xs font-medium text-ink-600">View as:</span>
                        {(['grid', 'list'] as const).map((v) => (
                            <button key={v} type="button" aria-pressed={filters.view === v} onClick={() => go({ view: v })} className={cn('inline-flex h-9 items-center gap-1.5 rounded-[4px] border px-3 text-xs font-medium capitalize', filters.view === v ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-500 bg-white text-ink-700')}>
                                {v === 'grid' ? <LayoutGrid className="size-4" /> : <List className="size-4" />} {v}
                            </button>
                        ))}
                    </div>
                    <label className="ml-auto flex items-center gap-2 text-xs font-medium text-ink-600">
                        Sort by:
                        <select value={filters.sort} onChange={(e) => go({ sort: e.target.value })} className="h-9 rounded-[4px] border border-parchment-500 bg-white px-2 text-sm">
                            <option value="az">A to Z</option>
                            <option value="za">Z to A</option>
                            <option value="largest">Most products</option>
                        </select>
                    </label>
                </div>

                <div className="mt-5 grid gap-6 lg:grid-cols-12">
                    <aside className="lg:col-span-3">
                        <div className="space-y-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-ink-900">Filter Aisles</h2>
                                <Link href="/shop/a-z" className="text-xs font-semibold text-gold-700">Clear All</Link>
                            </div>
                            <fieldset>
                                <legend className="mb-2 text-[0.8125rem] font-semibold text-ink-900">Buyer Type</legend>
                                <ul className="space-y-1.5">
                                    <li>
                                        <label className="flex items-center gap-2 text-[0.8125rem] text-ink-700">
                                            <input type="radio" name="buyer" className="accent-gold-600" checked={!filters.buyer} onChange={() => go({ buyer: null })} />
                                            <span className="flex-1">All Buyer Types</span><span className="text-xs text-ink-400">{totals.aisles}</span>
                                        </label>
                                    </li>
                                    {buyerCounts.map((b) => (
                                        <li key={b.value}>
                                            <label className="flex items-center gap-2 text-[0.8125rem] text-ink-700">
                                                <input type="radio" name="buyer" className="accent-gold-600" checked={filters.buyer === b.value} onChange={() => go({ buyer: b.value })} />
                                                <span className="flex-1">{b.label}</span><span className="text-xs text-ink-400">{b.count}</span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </fieldset>
                            <FilterCheckboxes title="Commercial Act" options={actCounts} selected={filters.acts} onChange={(acts) => go({ acts })} limit={7} />
                        </div>
                    </aside>

                    <section className="min-w-0 lg:col-span-9" aria-labelledby="aisles-h">
                        <h2 id="aisles-h" className="mb-3 font-serif text-xl font-semibold text-ink-900">All Aisles (A-Z) <span className="font-sans text-sm font-normal text-ink-500">· {aisles.length} shown</span></h2>
                        {aisles.length === 0 ? (
                            <p className="rounded-[8px] border border-dashed border-parchment-500 bg-white p-8 text-center text-sm text-ink-600">
                                No aisles match. <Link href="/shop/resolver" className="font-semibold text-gold-700">Try the Services Resolver</Link>.
                            </p>
                        ) : (
                            <ul className={cn('grid gap-3', list ? 'grid-cols-1' : 'sm:grid-cols-2 xl:grid-cols-4')}>
                                {aisles.map((a) => (
                                    <li key={a.slug}>
                                        <Link href={`/shop/aisle/${a.slug}`} className="flex h-full items-start gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 hover:border-gold-400 hover:shadow-card">
                                            <ShopIcon name={a.icon} size="sm" />
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-sm font-semibold text-ink-900">{a.name}</span>
                                                <span className="mt-0.5 block text-xs text-ink-500">{a.description}</span>
                                                <span className="mt-1.5 block text-xs font-semibold text-ink-800">
                                                    {a.products.toLocaleString('en-ZA')} products
                                                </span>
                                            </span>
                                            <ChevronRight className="mt-4 size-4 shrink-0 text-gold-600" aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
            <TrustStrip />
        </>
    );
}
