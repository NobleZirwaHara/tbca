import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { BtnLink, Ico, btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, Empty, InsightCard, InsightRow, KpPage, Select, apply, type Filters, type KpCard, type KpShared, type KpTheme } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Props extends KpShared {
    items: KpCard[];
    pagination: { shown: number; total: number; page: number; more: boolean };
    filters: Filters;
    scopes: { code: string; label: string }[];
    typeOptions: { key: string; label: string }[];
    voices: { code: string; label: string; body: string }[];
    typeCounts: { key: string; label: string; count: number }[];
    stats: { total: number; current: number; reviewDue: number; stale: number; excerpt: number };
    themes: KpTheme[];
}

/** KP-SCR-005 Insights Home. */
export default function Insights({ screen, kpNav, items, pagination, filters, scopes, typeCounts, voices, stats, themes }: Props) {
    const [f, setF] = useState<Filters>(filters);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const toggle = (k: 'types' | 'freshness', v: string) => setF({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] });
    const go = (next: Filters = f, page?: number) => apply(`${BASE}/insights`, { ...next, page });

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={[['Insights']]}
            title="KP Insights"
            subtitle="Verified thinking. African context. Practical impact."
            intro="Explore original frameworks, explainers, case perspectives, interviews and field notes to help you decide, build and lead with confidence."
            actions={
                <>
                    <BtnLink href={`${BASE}/ask`} tone="outline" icon="bot">Ask the KP Knowledge Assistant</BtnLink>
                    <BtnLink href={`${BASE}/speaking-media#enquiry`} icon="arrow-right">Contribute an Insight</BtnLink>
                </>
            }
            left={
                <form className="space-y-4 rounded-[10px] border border-parchment-400 bg-white p-4" onSubmit={(e) => { e.preventDefault(); go(); }}>
                    <div className="flex items-center justify-between">
                        <h2 className="font-serif font-bold text-ink-900">Filter Insights</h2>
                        <button type="button" className="text-[0.75rem] text-gold-700" onClick={() => { const empty = { q: '', types: [], theme: '', voice: '', region: '', freshness: [], sort: 'recent' }; setF(empty); go(empty); }}>Clear all</button>
                    </div>
                    <fieldset>
                        <legend className="text-[0.75rem] font-bold text-ink-900">Type</legend>
                        {typeCounts.map((t) => (
                            <label key={t.key} className="mt-1 flex items-center gap-2 text-[0.8125rem]">
                                <input type="checkbox" className="size-4 accent-gold-600" checked={f.types.includes(t.key)} onChange={() => toggle('types', t.key)} />
                                {t.label} ({t.count})
                            </label>
                        ))}
                    </fieldset>
                    <label className="block text-[0.75rem] font-bold text-ink-900">Theme
                        <Select value={f.theme} onChange={(e) => setF({ ...f, theme: e.target.value })} placeholder="All Themes" options={themes.map((t) => ({ value: t.slug, label: t.label }))} />
                    </label>
                    <label className="block text-[0.75rem] font-bold text-ink-900">Voice
                        <Select value={f.voice} onChange={(e) => setF({ ...f, voice: e.target.value })} placeholder="All Voices" options={voices.map((v) => ({ value: v.code, label: `${v.label} (${v.code})` }))} />
                    </label>
                    <label className="block text-[0.75rem] font-bold text-ink-900">Region
                        <Select value={f.region} onChange={(e) => setF({ ...f, region: e.target.value })} placeholder="All Regions" options={scopes.map((s) => ({ value: s.code, label: `${s.label} (${s.code})` }))} />
                    </label>
                    <fieldset>
                        <legend className="text-[0.75rem] font-bold text-ink-900">Freshness</legend>
                        {[['current', 'Current (0 to 90 days)'], ['review-due', 'Review Due (91 to 180 days)'], ['stale', 'Stale (180+ days)']].map(([k, l]) => (
                            <label key={k} className="mt-1 flex items-center gap-2 text-[0.8125rem]">
                                <input type="checkbox" className="size-4 accent-gold-600" checked={f.freshness.includes(k)} onChange={() => toggle('freshness', k)} />{l}
                            </label>
                        ))}
                    </fieldset>
                    <button type="submit" className={cn(btnClass('outline'), 'w-full')}>Apply Filters</button>
                </form>
            }
            rail={
                <>
                    <Box title="Voices in This Section" action={<Link href={`${BASE}/standards/voice-badge`} className="text-[0.75rem] font-semibold text-gold-700">Learn more</Link>}>
                        <ul className="space-y-2.5">
                            {voices.map((v) => (
                                <li key={v.code} className="flex gap-2.5">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-gold-500 font-bold text-gold-700">{v.code}</span>
                                    <span><span className="block text-[0.8125rem] font-semibold text-ink-900">{v.label}</span><span className="block text-[0.6875rem] text-ink-500">{v.body}</span></span>
                                </li>
                            ))}
                        </ul>
                    </Box>
                    <Box title="Top Themes" action={<Link href={`${BASE}/topics`} className="text-[0.75rem] font-semibold text-gold-700">View all</Link>}>
                        <ul className="space-y-1.5">
                            {[...themes].sort((a, b) => b.articles - a.articles).map((t) => (
                                <li key={t.slug}><Link href={t.href} className="flex items-center gap-2 text-[0.8125rem] hover:text-gold-700"><Ico name={t.icon} className="size-4 text-gold-600" /><span className="flex-1">{t.label}</span><span className="text-ink-500">({t.articles})</span></Link></li>
                            ))}
                        </ul>
                    </Box>
                </>
            }
        >
            <div className="flex flex-wrap items-center gap-3">
                <form className="relative min-w-[14rem] flex-1" onSubmit={(e) => { e.preventDefault(); go(); }}>
                    <label htmlFor="q" className="sr-only">Find insights</label>
                    <L.Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                    <input id="q" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search insights by keyword, topic, author..." className="h-10 w-full rounded-[6px] border border-parchment-500 bg-white pr-3 pl-9 text-[0.875rem]" />
                </form>
                <label className="flex items-center gap-2 text-[0.8125rem] text-ink-600">Sort by
                    <select value={f.sort} onChange={(e) => { const n = { ...f, sort: e.target.value }; setF(n); go(n); }} className="h-10 rounded-[6px] border border-parchment-500 bg-white px-2 text-[0.8125rem]">
                        <option value="recent">Most Recent</option>
                        <option value="title">Title A to Z</option>
                    </select>
                </label>
                <div className="flex rounded-[6px] border border-parchment-500 bg-white" role="group" aria-label="View">
                    <button type="button" aria-pressed={view === 'grid'} onClick={() => setView('grid')} className={cn('p-2', view === 'grid' && 'bg-gold-100 text-gold-800')}><L.LayoutGrid className="size-4" /><span className="sr-only">Grid view</span></button>
                    <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')} className={cn('p-2', view === 'list' && 'bg-gold-100 text-gold-800')}><L.List className="size-4" /><span className="sr-only">List view</span></button>
                </div>
            </div>

            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-parchment-400 bg-parchment-400 sm:grid-cols-5">
                {[['Total Insights', stats.total, 'All registered insights'], ['Current', stats.current, '0 to 90 days'], ['Review Due', stats.reviewDue, '91 to 180 days'], ['Stale', stats.stale, '180+ days'], ['Full Text', stats.excerpt, 'Published in full']].map(([l, v, s]) => (
                    <div key={l as string} className="bg-white p-3">
                        <dt className="text-[0.6875rem] text-ink-500">{l}</dt>
                        <dd className="text-xl font-bold text-ink-900">{v}</dd>
                        <dd className="text-[0.6875rem] text-ink-500">{s}</dd>
                    </div>
                ))}
            </dl>

            {items.length === 0 ? (
                <Empty>No insights match these filters.</Empty>
            ) : view === 'grid' ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((i) => <InsightCard key={i.slug} item={i} />)}</div>
            ) : (
                <ul className="divide-y divide-parchment-300 rounded-[10px] border border-parchment-400 bg-white px-4">{items.map((i) => <InsightRow key={i.slug} item={i} />)}</ul>
            )}

            <div className="flex flex-col items-center gap-2">
                <p className="text-[0.75rem] text-ink-500">Showing {pagination.shown} of {pagination.total} insights.</p>
                {pagination.more && <button type="button" className={btnClass('outline')} onClick={() => go(f, pagination.page + 1)}>Load More Insights</button>}
            </div>
        </KpPage>
    );
}
