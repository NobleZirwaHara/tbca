import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Award, CalendarDays, PlayCircle, Search, SlidersHorizontal } from 'lucide-react';
import { Tabs } from '@/Components/ui/Kit';
import { Box, Chip, Pager } from '@/Components/Insights/Shared';
import { PageTitle, ResourceFrame, WebinarArt } from '@/Components/Insights/Resources';
import type { SimplePagination, WebinarCard } from '@/types/insights';

interface Props {
    filters: { q?: string; tab?: string; topic?: string; speaker?: string; cpd?: string; sort?: string };
    webinars: WebinarCard[];
    pagination: SimplePagination;
    counts: { upcoming: number; onDemand: number };
    topics: Record<string, number>;
    speakers: string[];
}

export default function Webinars({ filters, webinars, pagination, counts, topics, speakers }: Props) {
    const [f, setF] = useState(filters);
    const go = (next: Partial<typeof f>) => { const m = { ...f, ...next }; setF(m); router.get('/resources/webinars', Object.fromEntries(Object.entries(m).filter(([, v]) => v)) as Record<string, string>, { preserveScroll: true, preserveState: true, replace: true }); };

    return (
        <ResourceFrame title="Webinars" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Webinars' }]}>
            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <div className="space-y-4">
                    <PageTitle title="Webinars Index" intro="Live and on-demand webinars designed to give you practical insights, frameworks and tools to grow your business." />
                    <ul className="grid gap-3 sm:grid-cols-3">{[[CalendarDays, 'Expert-led Sessions', 'Practical insights from experienced professionals.'], [PlayCircle, 'On-Demand Access', 'Watch anytime, at your pace.'], [Award, 'CPD Eligible', 'Where applicable, CPD certificates available.']].map(([I, t, s]) => { const Icon = I as typeof Award; return <li key={t as string} className="flex gap-2"><Icon className="size-7 text-gold-700" /><span className="text-xs"><strong className="block text-sm">{t as string}</strong>{s as string}</span></li>; })}</ul>
                    <Tabs tabs={[{ key: 'all', label: 'All Webinars' }, { key: 'upcoming', label: 'Upcoming Live', count: counts.upcoming }, { key: 'on-demand', label: 'On-Demand Replays', count: counts.onDemand }]} value={f.tab ?? 'all'} onChange={(t) => go({ tab: t === 'all' ? '' : t, })} />
                    <form onSubmit={(e) => { e.preventDefault(); go({}); }} className="flex flex-wrap items-center justify-between gap-2">
                        <label className="relative min-w-60 flex-1"><span className="sr-only">Search webinars</span><Search className="absolute top-2.5 left-2.5 size-4 text-ink-400" /><input value={f.q ?? ''} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search webinars by title, topic or speaker..." className="h-9 w-full rounded border border-parchment-500 bg-white pl-8 text-sm" /></label>
                        <label className="flex items-center gap-2 text-xs">Sort by:<select value={f.sort ?? 'recent'} onChange={(e) => go({ sort: e.target.value })} className="h-9 rounded border border-parchment-500 bg-white text-xs"><option value="recent">Most Recent</option><option value="title">Title</option></select></label>
                    </form>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {webinars.map((w) => (
                            <article key={w.id} className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-2.5">
                                <WebinarArt w={w} className="h-40" />
                                <div className="flex flex-1 flex-col p-1.5">
                                    <h2 className="mt-2 text-sm font-semibold">{w.title}</h2>
                                    <p className="mt-1 text-xs text-ink-600">{w.summary}</p>
                                    <p className="mt-2 text-xs text-ink-500">Speaker: {w.speaker}</p>
                                    <div className="mt-1 flex flex-wrap gap-1"><Chip tone="gold">{w.topic}</Chip>{w.cpd && <Chip tone="green">CPD</Chip>}</div>
                                    <Link href={w.upcoming ? `/resources/webinars/${w.slug}/register` : `/resources/webinars/${w.slug}/replay`} className="mt-auto block rounded border border-gold-400 py-1.5 text-center text-xs font-semibold text-gold-800" style={{ marginTop: '0.75rem' }}>{w.upcoming ? 'View Details & Register' : 'Watch Replay'}</Link>
                                </div>
                            </article>
                        ))}
                        {webinars.length === 0 && <p className="text-sm text-ink-500">No webinars match these filters.</p>}
                    </div>
                    <Pager page={pagination.page} lastPage={pagination.lastPage} query={f} path="/resources/webinars" />
                </div>
                <Box title={<span className="font-serif text-lg">Refine Results</span>}>
                    <p className="text-xs font-semibold">Format</p>
                    <label className="mt-1 flex items-center gap-2 text-xs"><input type="checkbox" className="accent-gold-600" checked={f.tab === 'upcoming'} onChange={(e) => go({ tab: e.target.checked ? 'upcoming' : '' })} />Upcoming Live ({counts.upcoming})</label>
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="accent-gold-600" checked={f.tab === 'on-demand'} onChange={(e) => go({ tab: e.target.checked ? 'on-demand' : '' })} />On-Demand Replays ({counts.onDemand})</label>
                    <p className="mt-3 text-xs font-semibold">Topic</p>
                    {Object.entries(topics).map(([t, c]) => <label key={t} className="flex items-center gap-2 text-xs"><input type="checkbox" className="accent-gold-600" checked={f.topic === t} onChange={(e) => go({ topic: e.target.checked ? t : '' })} />{t} ({c})</label>)}
                    <label className="mt-3 block text-xs font-semibold">Speaker<select value={f.speaker ?? ''} onChange={(e) => go({ speaker: e.target.value })} className="mt-1 h-9 w-full rounded border border-parchment-500 text-xs font-normal"><option value="">All Speakers</option>{speakers.map((s) => <option key={s}>{s}</option>)}</select></label>
                    <p className="mt-3 text-xs font-semibold">CPD Eligible</p>
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="accent-gold-600" checked={!!f.cpd} onChange={(e) => go({ cpd: e.target.checked ? '1' : '' })} />CPD Eligible Only</label>
                    <button type="button" onClick={() => go({})} className="mt-4 flex w-full items-center justify-center gap-1.5 rounded bg-gold-500 py-2 text-xs font-bold"><SlidersHorizontal className="size-4" /> Apply Filters</button>
                    <button type="button" onClick={() => { setF({}); router.get('/resources/webinars'); }} className="mt-2 w-full rounded border border-parchment-500 py-2 text-xs">Clear Filters</button>
                </Box>
            </div>
        </ResourceFrame>
    );
}
