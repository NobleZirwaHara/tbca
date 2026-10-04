import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, ChevronRight, Clock, HelpCircle, Layers, LayoutGrid, List, Search, Store } from 'lucide-react';
import { HeroStats, ShopCrumbs, ShopHero, TrustStrip } from '@/Components/Shop/Bits';
import ShopIcon from '@/Components/Shop/ShopIcon';
import FilterCheckboxes from '@/Components/Shop/FilterCheckboxes';
import { usePrice } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { Aisle as AisleRecord, CountOption, Subcategory } from '@/types/shop';

interface Props {
    aisle: AisleRecord;
    subcategories: Subcategory[];
    filters: { q: string; acts: string[]; delivery: string[]; sort: string; view: string };
    actCounts: CountOption[];
    deliveryCounts: CountOption[];
    stats: { subcategories: number; acts: string; delivery: string };
}

export default function Aisle({ aisle, subcategories, filters, actCounts, deliveryCounts, stats }: Props) {
    const price = usePrice();
    const [q, setQ] = useState(filters.q);
    const go = (patch: Partial<Props['filters']>) => {
        const n = { ...filters, ...patch };
        router.get(
            `/shop/aisle/${aisle.slug}`,
            { q: n.q || undefined, acts: n.acts.length ? n.acts : undefined, delivery: n.delivery.length ? n.delivery : undefined, sort: n.sort !== 'az' ? n.sort : undefined, view: n.view !== 'grid' ? n.view : undefined },
            { preserveScroll: true, preserveState: true },
        );
    };
    const list = filters.view === 'list';

    return (
        <>
            <Head title={aisle.name} />
            <ShopHero
                crumbs={<ShopCrumbs items={[{ label: 'Online Shop', href: '/shop' }, { label: 'A-to-Z Aisles', href: '/shop/a-z' }, { label: aisle.name }]} />}
                title={
                    <span className="flex flex-wrap items-center gap-3">
                        {aisle.name}
                        <span className="rounded-full border border-gold-500 px-2.5 py-0.5 font-sans text-xs font-semibold text-gold-400">{stats.subcategories} Subcategories</span>
                    </span>
                }
                intro={aisle.description}
                aside={
                    <HeroStats
                        stats={[
                            { icon: <Store className="size-6" />, value: aisle.products.toLocaleString('en-ZA'), label: 'Sprints', caption: 'In this category' },
                            { icon: <Layers className="size-6" />, value: stats.acts || '-', label: 'Commercial Acts', caption: 'Available' },
                            { icon: <Clock className="size-6" />, value: stats.delivery, label: 'Typical Delivery', caption: 'Depending on Sprint' },
                            { icon: <BadgeCheck className="size-6" />, value: '100%', label: 'QA Verified', caption: 'Human-reviewed' },
                        ]}
                    />
                }
            />

            <div className="container-tbca py-6">
                <div className="grid gap-6 lg:grid-cols-12">
                    <aside className="lg:col-span-3">
                        <div className="space-y-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-ink-900">Refine Your Browse</h2>
                                <Link href={`/shop/aisle/${aisle.slug}`} className="text-xs font-semibold text-gold-700">Clear All</Link>
                            </div>
                            <FilterCheckboxes title="Commercial Act" options={actCounts} selected={filters.acts} onChange={(acts) => go({ acts })} limit={7} />
                            <FilterCheckboxes title="Delivery Time" options={deliveryCounts} selected={filters.delivery} onChange={(delivery) => go({ delivery })} />
                        </div>
                    </aside>

                    <section className="min-w-0 lg:col-span-9" aria-label="Subcategories">
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                            <form
                                role="search"
                                className="relative w-full sm:w-64"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    go({ q });
                                }}
                            >
                                <label htmlFor="sub-q" className="sr-only">Search subcategories</label>
                                <input id="sub-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search subcategories..." className="h-9 w-full rounded-[4px] border border-parchment-500 bg-white pr-9 pl-3 text-sm" />
                                <button type="submit" aria-label="Search subcategories" className="absolute top-0 right-0 flex size-9 items-center justify-center text-gold-700"><Search className="size-4" /></button>
                            </form>
                            <p className="text-sm font-semibold text-ink-800">Showing {subcategories.length} subcategories</p>
                            <div className="ml-auto flex flex-wrap items-center gap-2">
                                {(['grid', 'list'] as const).map((v) => (
                                    <button key={v} type="button" aria-pressed={filters.view === v} onClick={() => go({ view: v })} className={cn('inline-flex h-9 items-center gap-1.5 rounded-[4px] border px-3 text-xs font-medium', filters.view === v ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-500 bg-white text-ink-700')}>
                                        {v === 'grid' ? <LayoutGrid className="size-4" /> : <List className="size-4" />} {v === 'grid' ? 'Grid View' : 'List View'}
                                    </button>
                                ))}
                                <label className="flex items-center gap-2 text-xs font-medium text-ink-600">
                                    Sort by:
                                    <select value={filters.sort} onChange={(e) => go({ sort: e.target.value })} className="h-9 rounded-[4px] border border-gold-400 bg-white px-2 text-sm">
                                        <option value="az">A to Z</option>
                                        <option value="za">Z to A</option>
                                        <option value="price">Lowest price</option>
                                        <option value="largest">Most Sprints</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        {subcategories.length === 0 ? (
                            <p className="rounded-[8px] border border-dashed border-parchment-500 bg-white p-8 text-center text-sm text-ink-600">No subcategories match these filters.</p>
                        ) : (
                            <ul className={cn('grid gap-3', list ? 'grid-cols-1' : 'sm:grid-cols-2 xl:grid-cols-4')}>
                                {subcategories.map((s) => (
                                    <li key={s.slug}>
                                        <Link href={`/shop/aisle/${aisle.slug}/${s.slug}`} className="flex h-full flex-col rounded-[8px] border border-parchment-400 bg-white p-4 hover:border-gold-400 hover:shadow-card">
                                            <span className="flex items-start gap-3">
                                                <ShopIcon name={s.icon} size="sm" />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-sm font-semibold text-ink-900">{s.name}</span>
                                                    <span className="mt-1 block text-xs text-ink-500">{s.description}</span>
                                                </span>
                                                <ChevronRight className="mt-3 size-4 shrink-0 text-gold-600" aria-hidden="true" />
                                            </span>
                                            <span className="mt-auto flex items-center justify-between gap-2 border-t border-parchment-300 pt-2.5 text-xs">
                                                <span className="text-ink-600">{s.listed ? `${s.listed} listed` : `${s.sprints} Sprints`}</span>
                                                <span className="text-ink-600">{s.from_zar ? <>From <strong className="text-gold-700">{price(s.from_zar)}</strong></> : <strong className="text-ink-700">On request</strong>}</span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <HelpCircle className="size-7 text-gold-700" aria-hidden="true" />
                            <p className="flex-1 text-sm">
                                <span className="font-semibold text-ink-900">Can't find the subcategory you're looking for?</span>
                                <span className="block text-xs text-ink-500">Use our Services Resolver to describe your need and we'll point you to the right solution.</span>
                            </p>
                            <Link href="/shop/resolver" className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-[0.8125rem] font-semibold text-ink-900 hover:bg-gold-50">
                                Use Services Resolver <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
            <TrustStrip />
        </>
    );
}
