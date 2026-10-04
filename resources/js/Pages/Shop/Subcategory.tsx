import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { ShopCrumbs, ShopHero, TrustStrip } from '@/Components/Shop/Bits';
import ResultRow from '@/Components/Shop/ResultRow';
import FilterCheckboxes from '@/Components/Shop/FilterCheckboxes';
import type { Aisle, CountOption, SearchResult, Subcategory as SubRecord } from '@/types/shop';

interface Props {
    aisle: Aisle;
    subcategory: SubRecord;
    results: SearchResult[];
    total: number;
    filters: { acts: string[]; delivery: string[]; sort: string };
    actCounts: CountOption[];
    deliveryCounts: CountOption[];
}

export default function Subcategory({ aisle, subcategory, results, total, filters, actCounts, deliveryCounts }: Props) {
    const path = `/shop/aisle/${aisle.slug}/${subcategory.slug}`;
    const go = (patch: Partial<Props['filters']>) => {
        const n = { ...filters, ...patch };
        router.get(path, { acts: n.acts.length ? n.acts : undefined, delivery: n.delivery.length ? n.delivery : undefined, sort: n.sort !== 'relevance' ? n.sort : undefined }, { preserveScroll: true, preserveState: true });
    };

    return (
        <>
            <Head title={`${subcategory.name} | ${aisle.name}`} />
            <ShopHero
                crumbs={<ShopCrumbs items={[{ label: 'Online Shop', href: '/shop' }, { label: 'A-to-Z Aisles', href: '/shop/a-z' }, { label: aisle.name, href: `/shop/aisle/${aisle.slug}` }, { label: subcategory.name }]} />}
                title={subcategory.name}
                lead={aisle.name}
                intro={subcategory.description}
            />
            <div className="container-tbca py-6">
                <div className="grid gap-6 lg:grid-cols-12">
                    <aside className="lg:col-span-3">
                        <div className="space-y-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold text-ink-900">Refine</h2>
                                <Link href={path} className="text-xs font-semibold text-gold-700">Clear All</Link>
                            </div>
                            <FilterCheckboxes title="Commercial Act" options={actCounts.filter((a) => a.count > 0)} selected={filters.acts} onChange={(acts) => go({ acts })} />
                            <FilterCheckboxes title="Delivery Time" options={deliveryCounts} selected={filters.delivery} onChange={(delivery) => go({ delivery })} />
                        </div>
                    </aside>
                    <section className="min-w-0 space-y-3 lg:col-span-9" aria-label="Products">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-ink-800">Showing {total} governed {total === 1 ? 'product' : 'products'}</p>
                            <label className="flex items-center gap-2 text-xs font-medium text-ink-600">
                                Sort by:
                                <select value={filters.sort} onChange={(e) => go({ sort: e.target.value })} className="h-9 rounded-[4px] border border-parchment-500 bg-white px-2 text-sm">
                                    <option value="relevance">Relevance</option>
                                    <option value="price_asc">Price: low to high</option>
                                    <option value="price_desc">Price: high to low</option>
                                    <option value="name">Name</option>
                                </select>
                            </label>
                        </div>
                        {results.length === 0 ? (
                            <div className="rounded-[8px] border border-dashed border-parchment-500 bg-white p-8 text-center text-sm text-ink-600">
                                No governed products are currently listed in this subcategory. {subcategory.sprints} source Sprints are being migrated through the listing gate.
                                <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    <Link href="/shop/resolver" className="font-semibold text-gold-700">Use Services Resolver</Link>
                                    <span aria-hidden="true">·</span>
                                    <Link href={`/search?q=${encodeURIComponent(subcategory.name)}`} className="font-semibold text-gold-700">Search the catalogue</Link>
                                </div>
                            </div>
                        ) : (
                            <ul className="space-y-3">{results.map((r) => <li key={r.key}><ResultRow r={r} /></li>)}</ul>
                        )}
                        <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <HelpCircle className="size-7 text-gold-700" aria-hidden="true" />
                            <p className="flex-1 text-sm text-ink-700">Not the right fit? Describe your need and we'll point you to the right solution.</p>
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
