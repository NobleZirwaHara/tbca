import { Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { BtnLink, btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, Empty, KpPage, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Result {
    group: string;
    kind: string;
    title: string;
    summary: string;
    href: string;
    tags: string[];
    meta: string;
}

interface Props extends KpShared {
    q: string;
    types: string[];
    sort: string;
    results: Result[];
    pagination: { page: number; last: number; total: number };
    groups: { label: string; count: number }[];
    popular: string[];
    glance: { total: number; kp: number; categories: number };
}

const GROUP_ICON: Record<string, [typeof L.FileText, string]> = {
    'Insights & Articles': [L.FileText, 'bg-gold-100 text-gold-700'],
    "Founder's Notes": [L.PenLine, 'bg-referenced-50 text-referenced-500'],
    'African Business Clinic': [L.MessageSquare, 'bg-verified-50 text-verified-500'],
    'KP Resources': [L.BookOpen, 'bg-attested-50 text-attested-500'],
    'Tools & Frameworks': [L.Wrench, 'bg-controlled-50 text-controlled-500'],
    Webinars: [L.Video, 'bg-risk-50 text-risk-500'],
    Topics: [L.Layers, 'bg-parchment-200 text-ink-700'],
};

/** KP-SCR-015 Search across insights, notes, resources, tools, topics and webinars. */
export default function Search({ screen, kpNav, q, types, sort, results, pagination, groups, popular, glance }: Props) {
    const [query, setQuery] = useState(q);
    const [picked, setPicked] = useState<string[]>(types);
    const go = (over: Record<string, unknown> = {}) => router.get(`${BASE}/search`, { q: query, types: picked, sort, ...over }, { preserveScroll: true });

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={[['Search']]}
            title="Search"
            subtitle="Find insights, frameworks, tools and more."
            intro="Search across Kruger Phiri's insights, notes, resources and more. Use filters to refine your results."
            left={
                <form className="space-y-3 rounded-[10px] border border-parchment-400 bg-white p-4" onSubmit={(e) => { e.preventDefault(); go({ page: 1 }); }}>
                    <div className="flex items-center justify-between"><h2 className="font-serif font-bold text-ink-900">Filter Results</h2><button type="button" onClick={() => setPicked([])} className="text-[0.75rem] text-gold-700">Clear all</button></div>
                    <fieldset>
                        <legend className="text-[0.75rem] font-bold text-ink-900">Content Type</legend>
                        {groups.map((g) => (
                            <label key={g.label} className="mt-1 flex items-center gap-2 text-[0.8125rem]">
                                <input type="checkbox" className="size-4 accent-gold-600" checked={picked.includes(g.label)} onChange={() => setPicked(picked.includes(g.label) ? picked.filter((x) => x !== g.label) : [...picked, g.label])} />
                                <span className="flex-1">{g.label}</span><span className="text-ink-500">{g.count}</span>
                            </label>
                        ))}
                    </fieldset>
                    <button type="submit" className={cn(btnClass('outline'), 'w-full')}>Apply Filters</button>
                </form>
            }
            rail={
                <>
                    <Box title="Search at a Glance">
                        <dl className="space-y-3">
                            {[[L.FileText, glance.total, 'Total Results'], [L.User, glance.kp, 'KP Articles'], [L.Layers, glance.categories, 'Content Categories']].map(([I, v, l]) => {
                                const Icon = I as typeof L.FileText;
                                return <div key={l as string} className="flex items-center gap-3"><Icon className="size-6 text-ink-500" aria-hidden="true" /><span><dd className="text-lg font-bold text-ink-900">{v as number}</dd><dt className="text-[0.75rem] text-ink-500">{l as string}</dt></span></div>;
                            })}
                        </dl>
                    </Box>
                    <Box title="Popular Searches">
                        <ul className="space-y-1.5">{popular.map((p) => <li key={p}><Link href={`${BASE}/search?q=${encodeURIComponent(p)}`} className="flex items-center gap-2 text-[0.8125rem] hover:text-gold-700"><L.Search className="size-3.5 text-ink-400" aria-hidden="true" />{p}</Link></li>)}</ul>
                    </Box>
                    <Box title="Can't find what you need?" tone="cream">
                        <p className="text-[0.8125rem]">Ask the KP Knowledge Assistant, or ask our team for a recommendation.</p>
                        <BtnLink href={`${BASE}/ask${query ? `?q=${encodeURIComponent(query)}` : ''}`} className="mt-2 w-full" icon="arrow-right">Ask a Question</BtnLink>
                    </Box>
                </>
            }
        >
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); go({ page: 1 }); }} role="search">
                <label className="relative flex-1">
                    <span className="sr-only">Search KP Thought Leadership</span>
                    <L.Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search insights, notes, tools, topics..." className="h-12 w-full rounded-[6px] border border-parchment-500 bg-white pr-10 pl-10 text-[0.9375rem]" />
                    {query && <button type="button" onClick={() => setQuery('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-400"><L.X className="size-4" /><span className="sr-only">Clear</span></button>}
                </label>
                <button type="submit" className={btnClass('gold', 'lg')}>Search</button>
            </form>

            {q === '' ? (
                <Empty>Type a word or phrase above, or pick a popular search.</Empty>
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[0.8125rem]">
                        <p className="text-ink-600">Showing {results.length ? (pagination.page - 1) * 10 + 1 : 0} to {(pagination.page - 1) * 10 + results.length} of {pagination.total} results for <strong className="text-gold-700">"{q}"</strong></p>
                        <label className="flex items-center gap-2">Sort by
                            <select value={sort} onChange={(e) => go({ sort: e.target.value, page: 1 })} className="h-9 rounded-[6px] border border-parchment-500 bg-white px-2"><option value="relevance">Most Relevant</option><option value="title">Title A to Z</option></select>
                        </label>
                    </div>
                    {results.length === 0 ? <Empty>No results. Try fewer words or another spelling.</Empty> : (
                        <ul className="space-y-3">
                            {results.map((r) => {
                                const [Icon, tone] = GROUP_ICON[r.group] ?? [L.FileText, 'bg-parchment-200 text-ink-700'];
                                return (
                                    <li key={r.href + r.title}>
                                        <Link href={r.href} className="flex items-center gap-4 rounded-[10px] border border-parchment-400 bg-white p-4 hover:border-gold-500">
                                            <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-[8px]', tone)}><Icon className="size-6" aria-hidden="true" /></span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-[0.6875rem] font-bold tracking-wider text-gold-700 uppercase">{r.group} | {r.kind}</span>
                                                <span className="block font-serif font-bold text-ink-900">{r.title}</span>
                                                <span className="block text-[0.75rem] text-ink-600">{r.summary}</span>
                                                <span className="mt-1 flex flex-wrap gap-1">{r.tags.map((t) => <span key={t} className="rounded-[4px] bg-parchment-200 px-1.5 py-0.5 text-[0.625rem] text-ink-600">{t}</span>)}</span>
                                            </span>
                                            <span className="hidden shrink-0 text-right text-[0.6875rem] text-ink-500 sm:block">{r.meta}</span>
                                            <L.ChevronRight className="size-5 shrink-0 text-ink-400" aria-hidden="true" />
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    {pagination.last > 1 && (
                        <nav className="flex justify-center gap-1" aria-label="Pagination">
                            {Array.from({ length: pagination.last }, (_, i) => i + 1).map((p) => (
                                <button key={p} type="button" aria-current={p === pagination.page ? 'page' : undefined} onClick={() => go({ page: p })} className={cn('size-9 rounded-[6px] border text-[0.8125rem]', p === pagination.page ? 'border-gold-500 bg-gold-500 font-bold text-ink-900' : 'border-parchment-500 bg-white')}>{p}</button>
                            ))}
                        </nav>
                    )}
                </>
            )}
        </KpPage>
    );
}
