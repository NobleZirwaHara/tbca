import { useState, type ReactNode } from 'react';
import { Modal } from '@/Components/ui/Kit';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, CloudDownload, Receipt, ShieldCheck, ShoppingCart } from 'lucide-react';
import FilterSidebar, { type DpFacets, type DpFilters } from '@/Components/Products/Digital/FilterSidebar';
import { addToCart } from '@/Components/Products/Digital/ProductCard';
import { Chip, DpCover, HERO_TRUST, useQueryNav } from '@/Components/Products/Digital/Ui';
import { openAskQuestion } from '@/Components/AskQuestion';
import { usePrice } from '@/lib/money';
import { SORTS } from './Catalogue';
import type { DpProductCard } from '@/Components/Products/Digital/types';

type Compared = DpProductCard & { licenceClasses: string; languagesLabel: string; compareRows: string[][] };

export default function Browse({
    products,
    total,
    compare,
    facets,
    filters,
}: {
    products: DpProductCard[];
    total: number;
    compare: Compared[];
    facets: DpFacets;
    filters: DpFilters;
}) {
    const price = usePrice();
    const apply = useQueryNav('/digital-products/browse', filters as unknown as Record<string, unknown>);
    const [picked, setPicked] = useState<string[]>(compare.map((c) => c.slug));
    const [why, setWhy] = useState<Compared | null>(null);

    const toggle = (slug: string) => setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : p.length >= 4 ? p : [...p, slug]));
    const runCompare = () => router.get('/digital-products/browse', { ...filters, compare: picked.join(',') } as never, { preserveScroll: true });

    const rows: [string, (c: Compared) => ReactNode][] = [
        ['Short Description', (c) => c.tagline],
        ['Primary Audience', (c) => c.audience],
        ['Licence Class', (c) => c.licenceClasses],
        ['Language', (c) => c.languagesLabel],
        ['File Format', (c) => c.formats.join(', ')],
        ['Jurisdiction', (c) => c.jurisdiction],
        ['Currencies', (c) => c.currencies.join(', ')],
        ['Version', (c) => c.versionLabel],
        ['Verified as at', (c) => c.verifiedAt],
        ['Currentness', () => (
            <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-verified-500" /> Current
            </span>
        )],
        ['Maintenance Included', (c) => c.maintenance],
        ['Updates Included', (c) => c.updates],
        ['Support', (c) => c.support],
        ['Defensibility Score (DSS)', (c) => <Chip tone="good">{c.dss ?? '—'} / 100</Chip>],
        ['Why This, Not Free / AI?', (c) => (
            <button type="button" onClick={() => setWhy(c)} className="text-xs font-semibold text-gold-700 underline">
                View
            </button>
        )],
        ['Source Price (ZAR)', (c) => (
            <span>
                <strong className="text-ink-900">From {price(c.fromPrice)}</strong>
                <span className="block text-[0.6875rem] text-verified-600">or USD Available</span>
            </span>
        )],
    ];

    return (
        <>
            <Head title="Search, Filter & Compare | Digital Products" />
            <section className="bg-ink-950 text-parchment-100">
                <div className="container-tbca flex flex-wrap items-center justify-between gap-6 py-8">
                    <div>
                        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Search, Filter & Compare</h1>
                        <p className="mt-1 text-sm text-ink-200">
                            Find the <span className="text-gold-400">exact</span> Digital Product that fits your need.
                        </p>
                    </div>
                    <ul className="grid grid-cols-3 gap-4 rounded-[8px] border border-ink-700 p-3 sm:grid-cols-5">
                        {HERO_TRUST.map(({ icon: Icon, title }) => (
                            <li key={title} className="flex items-center gap-2 text-[0.6875rem] text-parchment-200">
                                <Icon className="size-5 shrink-0 text-gold-400" aria-hidden="true" /> {title}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <div className="container-tbca grid gap-6 py-8 lg:grid-cols-[240px_1fr]">
                <FilterSidebar filters={filters} facets={facets} apply={apply} extended />

                <div className="min-w-0 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                        <p className="font-semibold text-ink-900">
                            {filters.q ? <>Results for: “{filters.q}”</> : 'All products'} <span className="ml-3 text-xs font-normal text-ink-500">{total} products found</span>
                        </p>
                        <span className="text-xs text-ink-500">○ Compare up to 4 products</span>
                        <button type="button" onClick={runCompare} disabled={picked.length < 2} className="h-9 rounded-[4px] bg-gold-500 px-4 text-[0.8125rem] font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50">
                            Compare Selected ({picked.length})
                        </button>
                        <label className="flex items-center gap-2 text-xs text-ink-600">
                            Sort by:
                            <select value={filters.sort} onChange={(e) => apply({ sort: e.target.value })} className="h-9 rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.8125rem]">
                                {SORTS.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    {compare.length > 0 && (
                        <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                            <table className="w-full min-w-[760px] text-left text-xs">
                                <thead>
                                    <tr className="border-b border-parchment-300 align-top">
                                        <th scope="col" className="w-44 p-3 text-sm font-bold text-ink-900">
                                            Product
                                            <span className="block text-[0.6875rem] font-normal text-ink-500">Select to Compare</span>
                                        </th>
                                        {compare.map((c) => (
                                            <th key={c.slug} scope="col" className="p-3 font-normal">
                                                <div className="flex gap-2">
                                                    <input type="checkbox" aria-label={`Compare ${c.name}`} checked={picked.includes(c.slug)} onChange={() => toggle(c.slug)} className="mt-1 size-4 accent-gold-600" />
                                                    <Link href={`/digital-products/${c.slug}`} className="block w-full">
                                                        <DpCover name={c.name} type={c.typeLabel} tone={c.tone} />
                                                        <span className="mt-1.5 block text-[0.8125rem] font-semibold text-ink-900">{c.name}</span>
                                                    </Link>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-200">
                                    {rows.map(([label, cell]) => (
                                        <tr key={label}>
                                            <th scope="row" className="p-3 font-semibold text-ink-800">
                                                {label}
                                            </th>
                                            {compare.map((c) => (
                                                <td key={c.slug} className="p-3 text-ink-700">
                                                    {cell(c)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    <tr>
                                        <th scope="row" className="p-3 font-semibold text-ink-800">
                                            Actions
                                        </th>
                                        {compare.map((c) => (
                                            <td key={c.slug} className="space-y-2 p-3">
                                                <Link href={`/digital-products/${c.slug}`} className="flex h-8 items-center justify-center gap-1 rounded-[4px] border border-gold-500 text-xs font-semibold text-ink-900 hover:bg-gold-50">
                                                    View Details <ArrowRight className="size-3.5" aria-hidden="true" />
                                                </Link>
                                                <button type="button" onClick={() => addToCart(c)} className="flex h-8 w-full items-center justify-center gap-1 rounded-[4px] border border-gold-500 text-xs font-semibold text-ink-900 hover:bg-gold-50">
                                                    <ShoppingCart className="size-3.5" aria-hidden="true" /> Add to Cart
                                                </button>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div>
                        <h2 className="mb-2 text-sm font-bold text-ink-900">All matching products — tick up to 4 to compare</h2>
                        <ul className="divide-y divide-parchment-300 rounded-[8px] border border-parchment-400 bg-white">
                            {products.map((p) => (
                                <li key={p.slug} className="flex flex-wrap items-center gap-3 p-3">
                                    <input type="checkbox" aria-label={`Select ${p.name} to compare`} checked={picked.includes(p.slug)} onChange={() => toggle(p.slug)} className="size-4 accent-gold-600" />
                                    <DpCover name={p.name} type={p.typeLabel} tone={p.tone} size="sm" />
                                    <div className="min-w-0 flex-1">
                                        <Link href={`/digital-products/${p.slug}`} className="text-[0.8125rem] font-semibold text-ink-900 hover:text-gold-700">
                                            {p.name}
                                        </Link>
                                        <p className="truncate text-xs text-ink-500">{p.tagline}</p>
                                    </div>
                                    <Chip>{p.typeLabel}</Chip>
                                    <Chip>{p.licences.join(', ')}</Chip>
                                    <Chip tone="info">{p.languages.join(' · ')}</Chip>
                                    <Chip>{p.jurisdiction}</Chip>
                                    <Chip>{p.currencies.join(' · ')}</Chip>
                                    <span className="w-28 text-right text-[0.8125rem] font-semibold">From {price(p.fromPrice)}</span>
                                </li>
                            ))}
                            {products.length === 0 && <li className="p-6 text-center text-sm text-ink-500">No products match these filters.</li>}
                        </ul>
                    </div>
                </div>
            </div>

            <section className="container-tbca pb-10">
                <div className="grid gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-[repeat(4,minmax(0,1fr))_1.3fr]">
                    {[
                        { icon: Receipt, title: 'All prices are source (ex VAT)', body: 'VAT will be calculated at checkout' },
                        { icon: CloudDownload, title: 'Instant Access', body: 'Download immediately after verified payment' },
                        { icon: ShieldCheck, title: 'Refund & Download', body: 'Policies apply. Review disclosure before purchase.' },
                        { icon: BadgeCheck, title: 'Secure & Human-Reviewed', body: 'All products are governed, version-controlled and human-reviewed.' },
                    ].map(({ icon: Icon, title, body }) => (
                        <div key={title} className="flex gap-2.5">
                            <Icon className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden="true" />
                            <div>
                                <p className="text-xs font-bold text-ink-900">{title}</p>
                                <p className="text-[0.6875rem] text-ink-500">{body}</p>
                            </div>
                        </div>
                    ))}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-ink-600">
                            <strong className="block text-ink-900">Need help finding the right product?</strong> Our team can guide you to the best fit.
                        </p>
                        <button type="button" onClick={() => openAskQuestion({ subject: 'Help comparing Digital Products', section: 'digital-products' })} className="h-9 rounded-[4px] bg-gold-500 px-3 text-xs font-semibold text-ink-900">
                            Request Guidance →
                        </button>
                    </div>
                </div>
            </section>

            <Modal open={why !== null} onClose={() => setWhy(null)} title={`Why ${why?.name ?? ''}, not a free AI answer?`}>
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr>
                            <th className="bg-parchment-200 p-2">Factor</th>
                            <th className="bg-gold-500 p-2 text-ink-900">This Product</th>
                            <th className="bg-ink-900 p-2 text-parchment-100">Free / AI Answer</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-parchment-300">
                        {(why?.compareRows ?? []).map((r) => (
                            <tr key={r[0]}>
                                <td className="p-2 font-semibold">{r[0]}</td>
                                <td className="p-2">{r[1]}</td>
                                <td className="p-2">{r[2]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Modal>
        </>
    );
}
