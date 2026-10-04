import { useState } from 'react';
import { router } from '@inertiajs/react';
import { RotateCcw, Search, SlidersHorizontal, Star } from 'lucide-react';
import { Box, NeedSomething, Pager } from '@/Components/Insights/Shared';
import { PageTitle, ResourceCard, ResourceFrame, TrustChips } from '@/Components/Insights/Resources';
import { cn } from '@/lib/cn';
import type { Paged, ResourceCard as RC } from '@/types/insights';

interface Filters { q?: string; category: string[]; type?: string; industry?: string; country?: string; access?: string; currentness?: string; format?: string; sort?: string }
interface Props {
    collection: 'library' | 'guides-reports' | 'templates-tools';
    filters: Filters;
    resources: Paged<RC>;
    categories: { key: string; label: string; count: number }[];
    types: { key: string; label: string; count: number }[];
    formats: string[];
    industries: { value: string; label: string }[];
    total: number;
}

const META = {
    library: { title: 'Resource Library', path: '/resources/library', crumb: 'Resource Library', intro: 'Discover practical resources across strategy, finance, operations and more. Use the filters to find the right guides, templates, tools and reports for your needs.', side: 'Refine by Topic', cta: 'View Resource' },
    'guides-reports': { title: 'Guides & Reports', path: '/resources/guides-reports', crumb: 'Guides & Reports', intro: 'Browse practical guides, market reports, and expert resources across strategy, finance, operations and more. Each resource shows its source basis, review date, and currentness status so you can decide with confidence.', side: 'Browse by Topic', cta: 'View Guide' },
    'templates-tools': { title: 'Templates & Tools', path: '/resources/templates-tools', crumb: 'Templates & Tools', intro: 'Browse practical templates, calculators, checklists, dashboards, and working tools. Every item shows its access level and currentness status before you select.', side: 'Browse by Tool Type', cta: 'View Tool' },
} as const;

export default function Library({ collection, filters, resources, categories, types, formats, industries, total }: Props) {
    const m = META[collection];
    const [f, setF] = useState<Filters>({ ...filters, category: filters.category ?? [] });
    const go = (next: Partial<Filters>) => {
        const merged = { ...f, ...next };
        setF(merged);
        const q = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== '' && v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)));
        router.get(m.path, q as Record<string, string>, { preserveScroll: true, preserveState: true, replace: true });
    };
    const toggleCat = (k: string) => go({ category: f.category.includes(k) ? f.category.filter((c) => c !== k) : [...f.category, k] });
    const clear = () => { setF({ category: [] }); router.get(m.path, {}, { preserveScroll: true }); };
    const sel = 'h-9 w-full rounded border border-parchment-500 bg-white px-2 text-xs';
    const sideFacet = collection === 'templates-tools' ? types : categories;

    return (
        <ResourceFrame title={m.title} crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: m.crumb }]}>
            <PageTitle title={m.title} intro={m.intro}><div className="w-full max-w-2xl"><TrustChips /></div></PageTitle>

            <form onSubmit={(e) => { e.preventDefault(); go({}); }} className="mt-5 grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-4 xl:grid-cols-[2fr_repeat(6,1fr)_auto]">
                <label className="relative md:col-span-2 xl:col-span-1"><span className="sr-only">Search resources</span><Search className="absolute top-2.5 left-2.5 size-4 text-ink-400" /><input value={f.q ?? ''} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search resources by title, keyword or topic..." className="h-9 w-full rounded border border-parchment-500 pr-2 pl-8 text-xs" /></label>
                <label className="text-[0.6875rem] text-ink-600">{collection === 'templates-tools' ? 'Tool Type' : 'Resource Type'}<select value={f.type ?? ''} onChange={(e) => go({ type: e.target.value })} className={sel}><option value="">All Types</option>{types.map((t) => <option key={t.key} value={t.key}>{t.label} ({t.count})</option>)}</select></label>
                <label className="text-[0.6875rem] text-ink-600">Industry<select value={f.industry ?? ''} onChange={(e) => go({ industry: e.target.value })} className={sel}><option value="">All Industries</option>{industries.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}</select></label>
                <label className="text-[0.6875rem] text-ink-600">Country / Region<select value={f.country ?? ''} onChange={(e) => go({ country: e.target.value })} className={sel}><option value="">All Countries</option><option>South Africa</option></select></label>
                <label className="text-[0.6875rem] text-ink-600">Access Level<select value={f.access ?? ''} onChange={(e) => go({ access: e.target.value })} className={sel}><option value="">All Access Levels</option><option value="free">R0 Free</option><option value="gated">R0 Gated</option><option value="reduced">Reduced</option><option value="paid">Paid Access</option><option value="subscription">Subscription</option><option value="restricted">Restricted</option></select></label>
                <label className="text-[0.6875rem] text-ink-600">Currentness<select value={f.currentness ?? ''} onChange={(e) => go({ currentness: e.target.value })} className={sel}><option value="">All Statuses</option><option value="current">Current</option><option value="review_due">Review Due</option><option value="overdue">Overdue</option><option value="restricted">Restricted</option></select></label>
                <label className="text-[0.6875rem] text-ink-600">Format<select value={f.format ?? ''} onChange={(e) => go({ format: e.target.value })} className={sel}><option value="">All Formats</option>{formats.map((x) => <option key={x}>{x}</option>)}</select></label>
                <div className="flex items-end gap-2">
                    <button type="button" onClick={clear} className="flex h-9 items-center gap-1 rounded border border-parchment-500 px-2 text-xs"><RotateCcw className="size-3.5" /> Clear all</button>
                    <button type="submit" className="flex h-9 items-center gap-1 rounded bg-gold-500 px-3 text-xs font-bold"><SlidersHorizontal className="size-3.5" /> Apply Filters</button>
                </div>
            </form>

            <div className="mt-5 grid gap-5 lg:grid-cols-[230px_1fr] xl:grid-cols-[230px_1fr_260px]">
                <Box title={m.side}>
                    <ul className="space-y-1.5">
                        {collection === 'guides-reports' && <li><button type="button" onClick={() => go({ category: [] })} className={cn('flex w-full justify-between rounded px-2 py-1 text-xs', f.category.length === 0 && 'bg-gold-50 font-semibold')}><span>All Guides & Reports</span><span>{total}</span></button></li>}
                        {sideFacet.filter((c) => c.count > 0).map((c) => {
                            const on = collection === 'templates-tools' ? f.type === c.key : f.category.includes(c.key);
                            return (
                                <li key={c.key}>
                                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                                        <input type="checkbox" className="accent-gold-600" checked={on} onChange={() => (collection === 'templates-tools' ? go({ type: on ? '' : c.key }) : toggleCat(c.key))} />
                                        <span className="flex-1">{c.label}</span><span className="rounded bg-parchment-200 px-1.5 text-[0.625rem]">{c.count}</span>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                    {collection === 'templates-tools' && <div className="mt-3 border-t border-parchment-300 pt-3"><p className="mb-1.5 text-xs font-semibold">Topic</p>{categories.filter((c) => c.count > 0).map((c) => <label key={c.key} className="flex items-center gap-2 py-0.5 text-xs"><input type="checkbox" className="accent-gold-600" checked={f.category.includes(c.key)} onChange={() => toggleCat(c.key)} />{c.label}</label>)}</div>}
                    <button type="button" onClick={clear} className="mt-3 w-full rounded border border-gold-400 py-1.5 text-xs font-semibold text-gold-800">Clear All Filters</button>
                </Box>
                <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-xs text-ink-600">{collection === 'guides-reports' && !f.q && f.category.length === 0 ? <><Star className="size-4 text-gold-600" /> <strong>Editor's Picks</strong> · </> : null}Showing {resources.from ?? 0}–{resources.to ?? 0} of {resources.total} results</p>
                        <label className="flex items-center gap-2 text-xs">Sort by:<select value={f.sort ?? 'relevant'} onChange={(e) => go({ sort: e.target.value })} className="h-8 rounded border border-parchment-500 px-2 text-xs"><option value="relevant">Most Relevant</option><option value="newest">Recently Reviewed</option><option value="popular">Most Downloaded</option><option value="title">Title A–Z</option><option value="review">Next Review Date</option></select></label>
                    </div>
                    {resources.data.length === 0 ? (
                        <p className="rounded-[8px] border border-parchment-400 bg-white p-8 text-center text-sm text-ink-500">No resources match these filters. <button type="button" onClick={clear} className="text-gold-700 underline">Clear filters</button></p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">{resources.data.map((r) => <ResourceCard key={r.id} r={r} cta={m.cta} />)}</div>
                    )}
                    <div className="mt-5"><Pager page={resources.currentPage} lastPage={resources.lastPage} query={f as unknown as Record<string, unknown>} path={m.path} /></div>
                </div>
                <div className="space-y-4 lg:col-span-2 xl:col-span-1">
                    <NeedSomething items={collection === 'templates-tools' ? ['Custom Research', 'Tailored Frameworks', 'Industry-Specific Tools', 'Private Data & Insights'] : ['Custom Research', 'Tailored Frameworks', 'Industry-Specific Reports', 'Private Data & Insights']} />
                    {collection === 'templates-tools' && (
                        <div className="rounded-[8px] border border-gold-300 bg-gold-50 p-4"><p className="font-serif font-semibold text-gold-800">FREE EXPLAINS. PAID COMPLETES.</p><p className="mt-1 text-xs text-ink-700">Free tools help you understand, explore and prepare with trusted guidance. Protected paid tools provide full working outputs and controlled implementation assets to help you complete with confidence.</p></div>
                    )}
                </div>
            </div>
        </ResourceFrame>
    );
}
