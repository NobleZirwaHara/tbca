import { useState, type FormEvent } from 'react';
import { Link, router } from '@inertiajs/react';
import { BarChart3, Compass, Handshake, Lightbulb, MessageSquare, Search, Target, Trash2, X } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Input, Select } from '@/Components/ui/Form';
import { iconFor } from '@/Components/Shop/ShopIcon';
import { SideCard } from '@/Components/Shop/Bits';
import type { Aisle, Option, SearchResult } from '@/types/shop';

export interface SearchRun {
    query: string;
    tokens: string[];
    mode: 'standard' | 'consolidated' | 'too_many' | 'zero';
    total: number;
    raw_matches: number;
    consolidated: number;
    page: number;
    pages: number;
    results: SearchResult[];
    facets: { acts: Record<string, number>; delivery: Record<string, number>; subcategories: Record<string, { name: string; count: number }>; aisles: Record<string, number> };
    has_filters: boolean;
    elapsed: number;
    suggestions: string[];
    nearest: Aisle[];
    refinements: { slug: string; name: string; count: number }[];
    top: SearchResult[];
}

export interface SearchFilters {
    q: string;
    acts: string[];
    delivery: string[];
    subs: string[];
    category: string | null;
    buyer: string | null;
    sort: string;
    price_min: number | null;
    price_max: number | null;
    view: string;
    dedupe: string | null;
}

export function go(filters: Partial<SearchFilters> & { all?: number; page?: number }) {
    const clean = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)));
    router.get('/search', clean as never, { preserveScroll: true });
}

/** OS-007 Too-Many-Results refinement interface. */
export function TooMany({ search, filters, acts, deliveryBands, aisles, buyers }: { search: SearchRun; filters: SearchFilters; acts: Option[]; deliveryBands: Option[]; aisles: Option[]; buyers: Option[] }) {
    const [f, setF] = useState({ category: filters.category ?? '', sub: '', act: '', delivery: '', buyer: filters.buyer ?? '', price_min: '', price_max: '', sort: filters.sort });
    const subs = Object.entries(search.facets.subcategories).map(([value, s]) => ({ value, label: `${s.name} (${s.count})` }));
    const submit = (e: FormEvent) => {
        e.preventDefault();
        go({
            q: filters.q, category: f.category || null, subs: f.sub ? [f.sub] : [], acts: f.act ? [f.act] : [], delivery: f.delivery ? [f.delivery] : [],
            buyer: f.buyer || null, price_min: f.price_min ? Number(f.price_min) : null, price_max: f.price_max ? Number(f.price_max) : null, sort: f.sort, all: 1,
        });
    };
    const sel = (key: keyof typeof f, label: string, options: Option[]) => (
        <label className="text-xs font-medium text-ink-700">
            {label}
            <Select className="mt-1" placeholder="Any" options={options} value={f[key]} onChange={(e) => setF({ ...f, [key]: e.target.value })} />
        </label>
    );

    return (
        <div className="grid gap-5 lg:grid-cols-12">
            <aside className="space-y-4 lg:col-span-3">
                <SideCard title="Current Search">
                    <p className="flex items-center justify-between rounded-[4px] border border-parchment-500 px-3 py-2 text-sm">{filters.q}<Link href="/search" aria-label="Clear search"><X className="size-4 text-ink-400" /></Link></p>
                    <p className="mt-3 text-xs font-semibold text-ink-800">Applied Filters (0)</p>
                    <p className="text-xs text-ink-400">No filters applied yet</p>
                </SideCard>
                <SideCard title="Quick Narrow">
                    <div className="space-y-2">
                        {search.refinements.map((r) => (
                            <button key={r.slug} type="button" onClick={() => go({ q: filters.q, subs: [r.slug], all: 1 })} className="flex w-full items-center justify-between rounded-[4px] border border-parchment-400 px-3 py-2 text-left text-[0.8125rem] hover:border-gold-500">
                                {r.name}<span className="text-xs text-ink-400">{r.count}</span>
                            </button>
                        ))}
                    </div>
                </SideCard>
            </aside>
            <form onSubmit={submit} className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-6">
                <h2 className="font-semibold text-ink-900">Refine by the following criteria</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {sel('category', 'Category', aisles)}
                    {sel('sub', 'Subcategory', subs)}
                    {sel('act', 'Commercial Act', acts)}
                    {sel('delivery', 'Delivery Time', deliveryBands)}
                    {sel('buyer', 'Buyer Type', buyers)}
                    {sel('sort', 'Sort by', [{ value: 'relevance', label: 'Relevance' }, { value: 'price_asc', label: 'Price: low to high' }, { value: 'price_desc', label: 'Price: high to low' }, { value: 'name', label: 'Name A-Z' }])}
                    <fieldset className="sm:col-span-2 xl:col-span-3">
                        <legend className="text-xs font-medium text-ink-700">Price Band (ZAR)</legend>
                        <div className="mt-1 flex items-center gap-2">
                            <Input aria-label="Minimum price" inputMode="numeric" placeholder="Min" value={f.price_min} onChange={(e) => setF({ ...f, price_min: e.target.value.replace(/\D/g, '') })} />
                            <span>-</span>
                            <Input aria-label="Maximum price" inputMode="numeric" placeholder="Max" value={f.price_max} onChange={(e) => setF({ ...f, price_max: e.target.value.replace(/\D/g, '') })} />
                        </div>
                    </fieldset>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <button type="button" onClick={() => go({ q: filters.q, all: 1 })} className="text-xs font-semibold text-gold-800 underline">Show all {search.total} results</button>
                    <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-6 text-sm font-semibold text-ink-900 hover:bg-gold-400">Update Results →</button>
                </div>
            </form>
            <aside className="space-y-4 lg:col-span-3">
                <SideCard title="Too many results?">
                    <p className="-mt-2 text-xs text-ink-500">Use the filters to narrow your search. The more specific you are, the better we can match your need.</p>
                    <p className="mt-3 text-xs font-semibold text-ink-800">Popular refinements for your search</p>
                    <ul className="mt-1 space-y-1 text-xs">
                        {search.refinements.map((r) => <li key={r.slug}><button type="button" className="text-ink-700 hover:text-gold-700" onClick={() => go({ q: filters.q, subs: [r.slug], all: 1 })}>→ {r.name}</button></li>)}
                    </ul>
                </SideCard>
                <SideCard title="Search Tips">
                    <ul className="space-y-1 text-xs text-ink-600"><li>Use specific terms like "SME export strategy South Africa".</li><li>Add context like industry, country or buyer type.</li><li>Use exact product codes for direct retrieval.</li></ul>
                </SideCard>
                <SideCard title="Still need help?">
                    <p className="-mt-2 text-xs text-ink-600">Use our Services Resolver or speak to a TBCA expert.</p>
                    <Link href={`/shop/resolver?need=${encodeURIComponent(filters.q)}`} className="mt-3 inline-flex h-9 items-center rounded-[4px] border border-gold-500 px-3 text-xs font-semibold text-gold-800">Open Services Resolver →</Link>
                </SideCard>
            </aside>
        </div>
    );
}

/** OS-008 Zero-Result Recovery. */
export function ZeroResult({ search, filters, recent }: { search: SearchRun; filters: SearchFilters; recent: string[] }) {
    const [q, setQ] = useState(filters.q);
    const steps = [
        { icon: Target, title: 'Use Services Resolver', body: "Answer a few guided questions and we'll point you to the best solutions for your need.", cta: 'Start Resolver', href: `/shop/resolver?need=${encodeURIComponent(filters.q)}` },
        { icon: Compass, title: 'Explore Popular Categories', body: 'Browse high-demand categories relevant to your search.', cta: 'Browse Categories', href: '/shop/a-z' },
        { icon: BarChart3, title: 'View Top Solutions', body: 'See the most relevant and popular solutions in this area.', cta: 'View Top Solutions', href: '/search?all=1' },
        { icon: MessageSquare, title: 'Talk to a TBCA Advisor', body: 'Get personalised guidance from our advisory team.', cta: 'Talk to Advisor', href: '' },
    ];

    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-12">
                <aside className="lg:col-span-3">
                    <SideCard title="Refine or Try These">
                        <form onSubmit={(e) => { e.preventDefault(); go({ q }); }}>
                            <label className="text-xs font-semibold text-ink-800" htmlFor="search-again">Search again</label>
                            <div className="relative mt-1"><Search className="absolute top-3 left-2.5 size-4 text-ink-400" aria-hidden="true" /><Input id="search-again" className="pl-8" value={q} onChange={(e) => setQ(e.target.value)} /></div>
                            {search.suggestions.length > 0 && (
                                <>
                                    <p className="mt-3 text-xs font-semibold text-ink-800">Suggestions</p>
                                    <div className="mt-1 flex flex-wrap gap-1.5">
                                        {search.suggestions.map((s) => <button key={s} type="button" onClick={() => go({ q: s })} className="rounded-[4px] border border-parchment-500 px-2 py-1 text-xs hover:border-gold-500">{s}</button>)}
                                    </div>
                                </>
                            )}
                            <button type="submit" className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900"><Search className="size-4" /> Search Again</button>
                        </form>
                    </SideCard>
                </aside>
                <div className="lg:col-span-6">
                    <SideCard title="Recommended Next Steps">
                        <p className="-mt-2 mb-3 text-xs text-ink-500">Choose an option below to reach the right solution.</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {steps.map((s) => (
                                <div key={s.title} className="flex flex-col rounded-[8px] border border-parchment-400 p-4 text-center">
                                    <span className="mx-auto flex size-12 items-center justify-center rounded-[8px] bg-ink-950 text-gold-400"><s.icon className="size-6" aria-hidden="true" /></span>
                                    <p className="mt-2 text-[0.8125rem] font-semibold text-ink-900">{s.title}</p>
                                    <p className="mt-1 flex-1 text-xs text-ink-500">{s.body}</p>
                                    {s.href ? (
                                        <Link href={s.href} className="mt-3 rounded-[4px] border border-gold-500 py-1.5 text-xs font-semibold text-gold-800 hover:bg-gold-50">{s.cta} →</Link>
                                    ) : (
                                        <button type="button" onClick={() => openAskQuestion({ subject: `Search: ${filters.q}`, section: 'shop' })} className="mt-3 rounded-[4px] border border-gold-500 py-1.5 text-xs font-semibold text-gold-800 hover:bg-gold-50">{s.cta} →</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {search.nearest.length > 0 && (
                            <>
                                <p className="mt-4 text-xs font-semibold text-ink-800">Nearest capability families</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {search.nearest.map((a) => {
                                        const I = iconFor(a.icon);
                                        return <Link key={a.slug} href={`/shop/aisle/${a.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-parchment-500 px-3 py-1 text-xs hover:border-gold-500"><I className="size-3.5 text-gold-700" aria-hidden="true" />{a.name}</Link>;
                                    })}
                                </div>
                            </>
                        )}
                    </SideCard>
                </div>
                <aside className="lg:col-span-3">
                    <SideCard title="Recent Searches">
                        <p className="-mt-2 mb-2 text-xs text-ink-500">Pick up where you left off.</p>
                        {recent.length === 0 ? <p className="text-xs text-ink-400">No recent searches.</p> : (
                            <ul className="divide-y divide-parchment-300">
                                {recent.map((r) => <li key={r}><Link href={`/search?q=${encodeURIComponent(r)}`} className="flex justify-between py-2 text-[0.8125rem] hover:text-gold-700">{r}<span aria-hidden="true">›</span></Link></li>)}
                            </ul>
                        )}
                        <button type="button" onClick={() => router.delete('/search/history', { preserveScroll: true })} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[4px] border border-parchment-500 py-2 text-xs font-semibold text-ink-700"><Trash2 className="size-3.5" /> Clear Search History</button>
                    </SideCard>
                </aside>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4">
                <Lightbulb className="size-6 text-gold-700" aria-hidden="true" />
                <p className="flex-1 text-sm text-ink-700"><strong className="block text-ink-900">Still can't find what you're looking for?</strong>Our team can research and create a tailored solution for your specific requirement.</p>
                <Link href="/shop/marketplace-brief" className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 bg-white px-4 text-sm font-semibold text-gold-800"><Handshake className="size-4" /> Request Custom Research →</Link>
            </div>
        </div>
    );
}

