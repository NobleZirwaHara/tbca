import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, Clock, Copy, LayoutGrid, List, Search, ShieldCheck, Target } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import ResultRow, { BookmarkButton, PriceLabel, ResultCard } from '@/Components/Shop/ResultRow';
import FilterCheckboxes from '@/Components/Shop/FilterCheckboxes';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { ActTag, Chip, HeroStats, ShopCrumbs, ShopHero, TrustStrip } from '@/Components/Shop/Bits';
import { TooMany, ZeroResult, go, type SearchFilters, type SearchRun } from '@/Components/Shop/SearchModes';
import { cn } from '@/lib/cn';
import type { Option } from '@/types/shop';

interface Props {
    search: SearchRun;
    filters: SearchFilters;
    acts: Option[];
    deliveryBands: Option[];
    aisles: Option[];
    buyers: Option[];
    recent: string[];
}

const SORTS = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
    { value: 'name', label: 'Name A-Z' },
];

function Consolidated({ search }: { search: SearchRun }) {
    const [open, setOpen] = useState<string | null>(null);
    return (
        <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
            <table className="w-full min-w-[720px] text-left text-[0.8125rem]">
                <thead className="bg-parchment-100 text-xs text-ink-500">
                    <tr><th className="px-4 py-2">Consolidated Option</th><th className="px-3 py-2">Source Coverage</th><th className="px-3 py-2">Key Benefit</th><th className="px-3 py-2">Price</th><th className="px-3 py-2"><span className="sr-only">Actions</span></th></tr>
                </thead>
                <tbody className="divide-y divide-parchment-300">
                    {search.results.map((r) => (
                        <tr key={r.key} className="align-top">
                            <td className="px-4 py-3">
                                <div className="flex gap-3">
                                    <ShopIcon name={r.icon} size="sm" />
                                    <div>
                                        <Link href={r.url} className="font-semibold text-ink-900 hover:text-gold-700">{r.name}</Link>
                                        <p className="text-xs text-ink-500">{r.summary}</p>
                                        <div className="mt-1 flex flex-wrap gap-1"><ActTag act={r.act} label={r.act_label} />{r.delivery && <Chip icon={<Clock className="size-3" />}>{r.delivery}</Chip>}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 py-3">
                                <p className="font-semibold">{r.source_records} Sources</p>
                                {r.aliases.length > 0 && (
                                    <button type="button" aria-expanded={open === r.key} onClick={() => setOpen(open === r.key ? null : r.key)} className="text-xs text-gold-800 underline">View Sources</button>
                                )}
                                {open === r.key && <ul className="mt-1 list-disc pl-4 text-xs text-ink-500">{r.aliases.map((a) => <li key={a}>{a}</li>)}</ul>}
                            </td>
                            <td className="px-3 py-3 text-xs text-ink-600">{r.key_benefit}</td>
                            <td className="px-3 py-3"><PriceLabel r={r} /><p className="text-xs text-verified-700">● {r.available ? 'Available' : 'Not purchasable online'}</p></td>
                            <td className="px-3 py-3 whitespace-nowrap"><Link href={r.url} className="mr-2 inline-flex h-8 items-center rounded-[4px] border border-parchment-500 px-3 text-xs font-medium">View Details</Link>{r.source === 'shop' && <BookmarkButton slug={r.slug} label={r.name} url={r.url} />}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function Results({ search, filters, acts, deliveryBands, aisles, buyers, recent }: Props) {
    const q = filters.q;
    const base = { ...filters, all: 1 } as SearchFilters & { all: number };
    const mode = search.mode;
    const title = { standard: 'Search Results', consolidated: 'Near-Duplicate Handling', too_many: 'Refine Your Search', zero: 'Zero-Result Recovery' }[mode];
    const lead = {
        standard: q ? <>Results for <span className="text-gold-400">"{q}"</span></> : 'Browse every governed product',
        consolidated: "We've found equivalent solutions and consolidated them for clarity.",
        too_many: `Your search returned ${search.total} results. Refine below to find the most relevant solutions.`,
        zero: <>We couldn't find exact matches for <span className="text-gold-400">"{q}"</span></>,
    }[mode];
    const subOptions = Object.entries(search.facets.subcategories).map(([value, s]) => ({ value, label: s.name, count: s.count }));
    const actOptions = acts.map((a) => ({ ...a, count: search.facets.acts[a.value] ?? 0 })).filter((a) => a.count > 0 || filters.acts.includes(a.value));
    const deliveryOptions = deliveryBands.map((d) => ({ ...d, count: search.facets.delivery[d.value] ?? 0 }));
    const start = (search.page - 1) * 12 + 1;

    const stats = mode === 'consolidated'
        ? [{ icon: <Copy className="size-5" />, value: search.raw_matches, label: 'Raw Matches', caption: 'Before consolidation' }, { icon: <Target className="size-5" />, value: search.consolidated, label: 'Consolidated Results', caption: 'After near-duplicate handling' }, { icon: <ShieldCheck className="size-5" />, value: '100%', label: 'Human-Reviewed' }, { icon: <Clock className="size-5" />, value: `${search.elapsed} sec`, label: 'Processing Time' }]
        : [{ icon: <Search className="size-5" />, value: search.total, label: 'Results Found', caption: `Across ${Object.keys(search.facets.subcategories).length} subcategories` }, { icon: <CheckCircle2 className="size-5" />, value: '100%', label: 'Human-Reviewed', caption: 'Accuracy & compliance' }, { icon: <Clock className="size-5" />, value: `${search.elapsed} sec`, label: 'Search Time' }, { icon: <Copy className="size-5" />, value: search.raw_matches > search.consolidated ? `${search.raw_matches} → ${search.consolidated}` : 'Clean', label: 'Near-Duplicate Consolidated' }];

    return (
        <>
            <Head title={q ? `${title}: ${q}` : title} />
            <ShopHero crumbs={<ShopCrumbs items={[{ label: 'Online Shop', href: '/shop' }, ...(mode === 'standard' ? [] : [{ label: 'Search Results', href: `/search?q=${encodeURIComponent(q)}&all=1` }]), { label: title }]} />} title={title} lead={lead}
                aside={mode === 'zero' ? (
                    <div className="rounded-[8px] border border-gold-600/60 bg-ink-950/70 p-4 text-sm">
                        <p className="font-semibold">Why no results?</p>
                        <p className="text-xs text-ink-300">No products matched all your search terms. Try broadening your keywords or explore related routes below.</p>
                        <p className="mt-2 text-xs font-semibold text-gold-400">Search tips:</p>
                        <ul className="text-xs text-ink-200"><li>✓ Use simpler terms (e.g. "market entry", "strategy")</li><li>✓ Remove extra filters</li><li>✓ Try Services Resolver for guided discovery</li></ul>
                    </div>
                ) : <HeroStats stats={stats} />}
            >
                <form className="mt-4 flex max-w-xl gap-2" onSubmit={(e) => { e.preventDefault(); const v = new FormData(e.currentTarget).get('q'); go({ q: String(v ?? '') }); }}>
                    <label htmlFor="search-q" className="sr-only">Search the Online Shop</label>
                    <input id="search-q" name="q" defaultValue={q} key={q} placeholder="Search products, Sprints, solutions..." className="h-10 flex-1 rounded-[4px] border border-ink-600 bg-ink-900 px-3 text-sm text-parchment-100 placeholder:text-ink-400" />
                    <button type="submit" className="h-10 rounded-[4px] bg-gold-500 px-4 text-sm font-semibold text-ink-900">Search</button>
                </form>
            </ShopHero>

            <div className="container-tbca py-6">
                {mode === 'zero' && <ZeroResult search={search} filters={filters} recent={recent} />}
                {mode === 'too_many' && <TooMany search={search} filters={filters} acts={acts} deliveryBands={deliveryBands} aisles={aisles} buyers={buyers} />}

                {(mode === 'standard' || mode === 'consolidated') && (
                    <div className="space-y-4">
                        {mode === 'consolidated' && (
                            <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                                <CheckCircle2 className="size-6 text-gold-700" aria-hidden="true" />
                                <p className="flex-1 text-xs text-ink-600"><strong className="block text-sm text-ink-900">Showing the best consolidated options</strong>Multiple source records describe the same or very similar solution. We merge equivalent entries, keep the best information, and show the clearest option.</p>
                                <Link href={`/search?q=${encodeURIComponent(q)}&all=1`} className="rounded-[4px] border border-gold-500 px-3 py-1.5 text-xs font-semibold text-gold-800">Back to standard results</Link>
                            </div>
                        )}
                        <div className="grid gap-5 lg:grid-cols-12">
                            <aside className="space-y-4 lg:col-span-3">
                                <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                                    <div className="flex items-center justify-between"><p className="font-semibold text-ink-900">Refine Your Search</p><Link href={`/search?q=${encodeURIComponent(q)}&all=1`} className="text-xs text-gold-800">Clear All</Link></div>
                                    <label className="mt-3 block text-xs font-semibold text-ink-800">Category
                                        <select className="mt-1 block h-9 w-full rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.8125rem]" value={filters.category ?? ''} onChange={(e) => go({ ...base, category: e.target.value || null, page: 1 })}>
                                            <option value="">All Categories</option>
                                            {aisles.filter((a) => search.facets.aisles[a.value] || a.value === filters.category).map((a) => <option key={a.value} value={a.value}>{a.label} ({search.facets.aisles[a.value] ?? 0})</option>)}
                                        </select>
                                    </label>
                                    <div className="mt-4 space-y-4">
                                        <FilterCheckboxes title="Subcategory" options={subOptions} selected={filters.subs} onChange={(subs) => go({ ...base, subs })} />
                                        <FilterCheckboxes title="Commercial Act" options={actOptions} selected={filters.acts} onChange={(a) => go({ ...base, acts: a })} />
                                        <FilterCheckboxes title="Delivery Time" options={deliveryOptions} selected={filters.delivery} onChange={(d) => go({ ...base, delivery: d })} />
                                    </div>
                                </div>
                                <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs text-ink-600">
                                    <p className="font-semibold text-ink-900">Can't find what you're looking for?</p>
                                    <p className="mt-1">Use our Services Resolver to describe your need and we'll guide you.</p>
                                    <Link href={`/shop/resolver?need=${encodeURIComponent(q)}`} className="mt-2 inline-block font-semibold text-gold-800">Open Services Resolver →</Link>
                                </div>
                            </aside>
                            <div className="min-w-0 space-y-3 lg:col-span-9">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm text-ink-600">Showing {search.total ? start : 0}-{Math.min(start + 11, search.total)} of {search.total} {mode === 'consolidated' ? 'consolidated results' : 'results'}</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {mode === 'standard' && search.raw_matches > search.consolidated && (
                                            <Link href={`/search?q=${encodeURIComponent(q)}&dedupe=consolidated`} className="text-xs font-semibold text-gold-800 underline">View consolidation ({search.raw_matches} → {search.consolidated})</Link>
                                        )}
                                        <label className="text-xs text-ink-600">Sort by{' '}
                                            <select className="h-9 rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.8125rem]" value={filters.sort} onChange={(e) => go({ ...base, sort: e.target.value })}>
                                                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                            </select>
                                        </label>
                                        {mode === 'standard' && (['list', 'grid'] as const).map((v) => (
                                            <button key={v} type="button" aria-pressed={filters.view === v} onClick={() => go({ ...base, view: v })} className={cn('inline-flex h-9 items-center gap-1 rounded-[4px] border px-2.5 text-xs', filters.view === v ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-500 bg-white text-ink-600')}>
                                                {v === 'list' ? <List className="size-4" /> : <LayoutGrid className="size-4" />} {v === 'list' ? 'List View' : 'Grid View'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {mode === 'consolidated' ? <Consolidated search={search} /> : filters.view === 'grid' ? (
                                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{search.results.map((r) => <ResultCard key={r.key} r={r} />)}</div>
                                ) : (
                                    <div className="space-y-3">{search.results.map((r) => <ResultRow key={r.key} r={r} />)}</div>
                                )}
                                {search.pages > 1 && (
                                    <nav className="flex flex-wrap gap-1" aria-label="Pagination">
                                        {Array.from({ length: search.pages }, (_, i) => i + 1).map((p) => (
                                            <button key={p} type="button" aria-current={p === search.page ? 'page' : undefined} onClick={() => go({ ...base, page: p })} className={cn('min-w-8 rounded-[4px] border px-2 py-1 text-xs', p === search.page ? 'border-verified-700 bg-verified-700 text-white' : 'border-parchment-500 bg-white')}>{p}</button>
                                        ))}
                                    </nav>
                                )}
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Link href="/shop/resolver" className="rounded-[8px] bg-ink-950 p-4 text-sm text-parchment-100"><strong className="block">Can't find what you're looking for?</strong><span className="text-xs text-ink-300">Use our Services Resolver to describe your need and we'll guide you.</span></Link>
                                    <button type="button" onClick={() => openAskQuestion({ subject: `Search: ${q}`, section: 'shop' })} className="rounded-[8px] bg-ink-950 p-4 text-left text-sm text-parchment-100"><strong className="block">Prefer to talk to an expert?</strong><span className="text-xs text-ink-300">Speak to a TBCA advisor for personalised guidance. Talk to TBCA →</span></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <TrustStrip />
        </>
    );
}
