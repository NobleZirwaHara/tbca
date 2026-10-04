import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bookmark, BookmarkCheck, CircleCheck, Grid2x2, List, Search, TriangleAlert } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { DISCLAIMER, NeedHelpChoosing, NeedMoreBand, ProductThumb, ToolsHero, ToolsTrustStrip } from '@/Components/CorePages/ToolsParts';
import { usePrice } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { ToolProduct } from '@/types/core-pages';

interface Filters {
    type?: string | null; need?: string; audience?: string; language?: string[] | string; format?: string[] | string; price?: string; instant?: string; search?: string; sort?: string; view: string;
}

interface Props {
    type: string | null;
    products: ToolProduct[];
    filters: Filters;
    types: Record<string, string>;
    needs: string[];
    audiences: string[];
    saved: string[];
}

const FORMATS = ['PDF', 'Word', 'Excel', 'PowerPoint', 'Interactive Tool', 'ZIP'];
const arr = (v: string[] | string | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

export default function Catalogue({ type, products, filters, types, needs, audiences, saved }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const price = usePrice();
    const [search, setSearch] = useState(filters.search ?? '');
    const base = type ? `/tools/${type}` : '/tools';
    const isCalc = type === 'calculators';

    const apply = (next: Partial<Filters>) => {
        const merged: Record<string, unknown> = { ...filters, ...next };
        delete merged.type;
        Object.keys(merged).forEach((k) => (merged[k] === '' || merged[k] === undefined || (Array.isArray(merged[k]) && (merged[k] as unknown[]).length === 0)) && delete merged[k]);
        router.get(base, merged as Record<string, string>, { preserveState: true, preserveScroll: true, replace: true });
    };
    const toggleIn = (key: 'language' | 'format', v: string) => {
        const cur = arr(filters[key]);
        apply({ [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] });
    };
    const doSearch = (e: FormEvent) => {
        e.preventDefault();
        apply({ search });
    };
    const save = (p: ToolProduct) => router.post('/saved', { item_type: 'tool', item_key: p.slug, label: p.title, url: `/tools/${p.type}/${p.slug}` }, { preserveScroll: true });

    return (
        <>
            <Head title={isCalc ? 'Business Calculators' : 'Tools, Templates & Calculators'} />
            <ToolsHero
                title={isCalc ? 'Business Calculators' : type ? `${types[type]}s` : 'Tools, Templates & Calculators'}
                lead={isCalc ? 'Practical decision tools for modelling, forecasting and financial planning.' : 'Practical Business Resources. Ready to Use. Human Reviewed.'}
                body={isCalc ? 'Ready-to-use calculators for business owners, finance teams and advisors. Model with confidence. Decide with clarity. Grow with control.' : 'Access expert-built templates, toolkits, checklists and calculators that help you plan, model, assess and execute with greater confidence.'}
                aside={
                    <div className="hidden grid-cols-3 gap-3 lg:grid" aria-hidden="true">
                        {['13-Week Cash Flow Forecast', 'Break-Even Calculator', 'Funding Readiness Checklist', 'Financial Model', 'Business Plan Template', 'Toolkit'].map((t, i) => (
                            <ProductThumb key={t} title={t} type={i % 2 ? 'Calculator' : 'Template'} className={i === 4 ? 'scale-105' : ''} />
                        ))}
                    </div>
                }
            >
                <div className="mt-5 flex flex-wrap gap-2">
                    <Link href="/tools" className="inline-flex h-10 items-center rounded-[4px] bg-gold-500 px-4 text-[0.8125rem] font-semibold text-ink-900">Tools, Templates &amp; Calculators</Link>
                    <Link href="/tools/interactive-tools" className="inline-flex h-10 items-center rounded-[4px] border border-gold-600 px-4 text-[0.8125rem] text-parchment-100">Dashboards</Link>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <a href="#catalogue" className="inline-flex h-10 items-center rounded-[4px] bg-gold-500 px-4 text-[0.8125rem] font-semibold text-ink-900">Browse Products →</a>
                    <Link href="/shop" className="inline-flex h-10 items-center rounded-[4px] border border-parchment-200/40 px-4 text-[0.8125rem] text-parchment-100">View Related Sprints</Link>
                    <Link href="/digital-products" className="text-[0.8125rem] text-parchment-200 underline">How Digital Products Work</Link>
                </div>
            </ToolsHero>
            <ToolsTrustStrip />

            <div id="catalogue" className="bg-parchment-200">
                <div className="container-tbca grid gap-5 py-8 lg:grid-cols-12">
                    <aside className="rounded-[8px] border border-parchment-400 bg-white p-4 lg:col-span-3 xl:col-span-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[0.9375rem] font-bold text-ink-900">Refine Your Search</h2>
                            <Link href={base} className="text-[0.75rem] text-gold-700 underline">Clear All</Link>
                        </div>
                        <form onSubmit={doSearch} className="relative mt-3">
                            <label htmlFor="tool-search" className="sr-only">Search products</label>
                            <input id="tool-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="h-9 w-full rounded-[4px] border border-parchment-500 pr-8 pl-2 text-[0.8125rem]" />
                            <button type="submit" className="absolute top-2 right-2" aria-label="Search"><Search className="size-4 text-ink-400" /></button>
                        </form>
                        <FilterGroup title="Product Type">
                            {Object.entries(types).map(([k, l]) => (
                                <Link key={k} href={type === k ? '/tools' : `/tools/${k}`} className="flex items-center gap-2 py-0.5 text-[0.8125rem]">
                                    <span className={cn('flex size-3.5 items-center justify-center rounded-[2px] border', type === k ? 'border-gold-600 bg-gold-500' : 'border-ink-300')}>{type === k && <CircleCheck className="size-2.5" aria-hidden="true" />}</span>
                                    {l}s
                                </Link>
                            ))}
                        </FilterGroup>
                        <FilterGroup title="Business Need">
                            <select aria-label="Business need" value={filters.need ?? ''} onChange={(e) => apply({ need: e.target.value })} className="h-9 w-full rounded-[4px] border border-parchment-500 text-[0.8125rem]">
                                <option value="">All needs</option>
                                {needs.map((n) => <option key={n}>{n}</option>)}
                            </select>
                        </FilterGroup>
                        <FilterGroup title="Audience">
                            <select aria-label="Audience" value={filters.audience ?? ''} onChange={(e) => apply({ audience: e.target.value })} className="h-9 w-full rounded-[4px] border border-parchment-500 text-[0.8125rem]">
                                <option value="">All audiences</option>
                                {audiences.map((n) => <option key={n}>{n}</option>)}
                            </select>
                        </FilterGroup>
                        <FilterGroup title="Language">
                            {[['EN', 'English'], ['AF', 'Afrikaans']].map(([k, l]) => <CheckRow key={k} label={l} checked={arr(filters.language).includes(k)} onChange={() => toggleIn('language', k)} />)}
                        </FilterGroup>
                        <FilterGroup title="File Format">
                            {FORMATS.map((f) => <CheckRow key={f} label={f} checked={arr(filters.format).includes(f)} onChange={() => toggleIn('format', f)} />)}
                        </FilterGroup>
                        <FilterGroup title="Price Range">
                            <select aria-label="Price range" value={filters.price ?? ''} onChange={(e) => apply({ price: e.target.value })} className="h-9 w-full rounded-[4px] border border-parchment-500 text-[0.8125rem]">
                                <option value="">Any price</option>
                                <option value="under-1000">Under R1 000</option>
                                <option value="1000-2500">R1 000 – R2 500</option>
                                <option value="2500-5000">R2 500 – R5 000</option>
                                <option value="over-5000">Over R5 000</option>
                            </select>
                        </FilterGroup>
                        <FilterGroup title="Instant Download">
                            <CheckRow label="Instant download only" checked={Boolean(filters.instant)} onChange={() => apply({ instant: filters.instant ? '' : '1' })} />
                        </FilterGroup>
                    </aside>

                    <div className="lg:col-span-9 xl:col-span-8">
                        <h2 className="text-[1.25rem] font-bold text-ink-900">{isCalc ? 'Explore Calculators' : 'Explore Tools, Templates & Calculators'}</h2>
                        <p className="text-[0.8125rem] text-ink-500">{isCalc ? 'Practical calculators to model, forecast and plan with confidence.' : 'Find practical resources by product type, business need, audience, language and format.'}</p>
                        <div role="tablist" aria-label="Product types" className="mt-3 flex gap-1.5 overflow-x-auto">
                            <Link href="/tools" role="tab" aria-selected={!type} className={cn('shrink-0 rounded-[4px] border px-3 py-1.5 text-[0.75rem]', !type ? 'border-ink-900 bg-ink-900 text-gold-400' : 'border-parchment-400 bg-white')}>All Products</Link>
                            {Object.entries(types).map(([k, l]) => (
                                <Link key={k} href={`/tools/${k}`} role="tab" aria-selected={type === k} className={cn('shrink-0 rounded-[4px] border px-3 py-1.5 text-[0.75rem]', type === k ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-parchment-400 bg-white')}>{l}s</Link>
                            ))}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.8125rem]">
                            <span className="font-semibold text-ink-900">{type ? `${products.length} ${types[type]}s` : 'Recommended Products'} <span className="font-normal text-ink-500">({products.length} results)</span></span>
                            <span className="flex items-center gap-2">
                                View:
                                <button type="button" onClick={() => apply({ view: 'grid' })} aria-pressed={filters.view === 'grid'} className={cn('inline-flex items-center gap-1', filters.view === 'grid' && 'font-semibold text-gold-700')}><Grid2x2 className="size-4" aria-hidden="true" />Grid</button>
                                <button type="button" onClick={() => apply({ view: 'list' })} aria-pressed={filters.view === 'list'} className={cn('inline-flex items-center gap-1', filters.view === 'list' && 'font-semibold text-gold-700')}><List className="size-4" aria-hidden="true" />List</button>
                                <label htmlFor="tool-sort" className="sr-only">Sort</label>
                                <select id="tool-sort" value={filters.sort ?? 'relevant'} onChange={(e) => apply({ sort: e.target.value })} className="h-8 rounded-[4px] border border-parchment-500 text-[0.75rem]">
                                    <option value="relevant">Most Relevant</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="title">Name A–Z</option>
                                </select>
                                {auth.user && <Link href="/tools/my-downloads" className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-parchment-500 px-2 text-[0.75rem]"><Bookmark className="size-3.5" aria-hidden="true" />My Downloads</Link>}
                            </span>
                        </div>

                        {products.length === 0 ? (
                            <p className="mt-10 text-center text-sm text-ink-500">No products match these filters. <Link href={base} className="font-semibold text-gold-700">Clear filters</Link></p>
                        ) : (
                            <ul className={cn('mt-4 grid gap-3', filters.view === 'list' ? 'grid-cols-1' : 'sm:grid-cols-2 xl:grid-cols-4')}>
                                {products.map((p) => {
                                    const href = `/tools/${p.type}/${p.slug}`;
                                    const isSaved = saved.includes(p.slug);
                                    return (
                                        <li key={p.slug} className={cn('flex rounded-[8px] border border-parchment-400 bg-white p-3', filters.view === 'list' ? 'flex-row gap-4' : 'flex-col')}>
                                            <div className={cn('flex gap-3', filters.view === 'list' && 'flex-1')}>
                                                <ProductThumb title={p.title} type={types[p.type]} className="w-24 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-1">
                                                        <span className="text-[0.625rem] font-bold tracking-wide text-gold-700 uppercase">{types[p.type]}</span>
                                                        {auth.user ? (
                                                            <button type="button" onClick={() => save(p)} aria-label={isSaved ? `Remove ${p.title} from saved` : `Save ${p.title}`}>{isSaved ? <BookmarkCheck className="size-4 text-gold-600" /> : <Bookmark className="size-4 text-ink-400" />}</button>
                                                        ) : (
                                                            <Link href="/login" aria-label="Sign in to save"><Bookmark className="size-4 text-ink-400" /></Link>
                                                        )}
                                                    </div>
                                                    <Link href={href} className="block text-[0.8125rem] leading-snug font-bold text-ink-900 hover:text-gold-700">{p.title}</Link>
                                                    <p className="mt-1 line-clamp-2 text-[0.6875rem] text-ink-500">{p.body}</p>
                                                    <p className="mt-1 text-[0.625rem] text-ink-500">For: {p.audience}</p>
                                                    <p className="text-[0.625rem] text-ink-500">{p.languages.join(', ')} | {p.formats.join(', ')}</p>
                                                </div>
                                            </div>
                                            <div className={cn(filters.view === 'list' ? 'w-56 shrink-0' : 'mt-auto pt-2')}>
                                                <p className="flex flex-wrap gap-2 text-[0.625rem] text-ink-500"><span className="inline-flex items-center gap-0.5"><CircleCheck className="size-3 text-verified-500" aria-hidden="true" />Human-reviewed</span><span className="inline-flex items-center gap-0.5"><CircleCheck className="size-3 text-verified-500" aria-hidden="true" />Version-controlled</span></p>
                                                <p className="mt-1 text-[0.875rem] font-bold text-ink-900">{price(p.zar)}</p>
                                                <div className="mt-2 grid grid-cols-3 gap-1.5 text-[0.6875rem]">
                                                    <Link href={href} className="col-span-1 inline-flex h-8 items-center justify-center rounded-[4px] bg-gold-500 font-semibold text-ink-900">View</Link>
                                                    <Link href={`${href}#preview`} className="inline-flex h-8 items-center justify-center rounded-[4px] border border-parchment-500">Preview</Link>
                                                    <Link href={`${href}/checkout`} className="inline-flex h-8 items-center justify-center rounded-[4px] border border-parchment-500">Buy</Link>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    <div className="lg:col-span-12 xl:col-span-2">
                        <NeedHelpChoosing />
                    </div>
                    <p className="flex gap-2 rounded-[6px] border border-parchment-400 bg-white p-3 text-[0.75rem] text-ink-600 lg:col-span-12"><TriangleAlert className="size-4 shrink-0 text-gold-600" aria-hidden="true" />{DISCLAIMER}</p>
                </div>
            </div>
            <NeedMoreBand />
        </>
    );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <fieldset className="mt-4 border-t border-parchment-300 pt-3">
            <legend className="mb-1.5 text-[0.75rem] font-bold text-ink-900">{title}</legend>
            {children}
        </fieldset>
    );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
    return (
        <label className="flex cursor-pointer items-center gap-2 py-0.5 text-[0.8125rem]">
            <input type="checkbox" checked={checked} onChange={onChange} className="size-3.5 accent-gold-600" />
            {label}
        </label>
    );
}
