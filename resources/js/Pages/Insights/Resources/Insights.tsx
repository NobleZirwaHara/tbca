import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Calendar, CheckCircle2, Clock, Compass, Database, FileSearch, MessageCircle, Search, Tag, Users } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Box, Chip, CurrentnessChip, label } from '@/Components/Insights/Shared';
import { ResourceFrame } from '@/Components/Insights/Resources';
import type { ResourceBody, ResourceCard } from '@/types/insights';

interface Props {
    filters: { q?: string; topic?: string; type?: string; currentness?: string; sort?: string };
    featured: (ResourceCard & { body: ResourceBody }) | null;
    insights: ResourceCard[];
    topics: { value: string; label: string }[];
}

export default function Insights({ filters, featured, insights, topics }: Props) {
    const [f, setF] = useState(filters);
    const go = (next: Partial<typeof f>) => { const m = { ...f, ...next }; setF(m); router.get('/resources/insights', Object.fromEntries(Object.entries(m).filter(([, v]) => v)) as Record<string, string>, { preserveScroll: true, preserveState: true, replace: true }); };
    const sel = 'h-9 w-full rounded border border-parchment-500 bg-white px-2 text-xs';

    return (
        <ResourceFrame title="KP Thought Leadership" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'KP Thought Leadership' }]}>
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-5">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-ink-900">KP Thought Leadership</h1>
                        <p className="mt-1 text-sm font-semibold text-ink-800">Authority insights, decision notes and practical business commentary designed to help founders, executives and project sponsors make better choices.</p>
                        <p className="mt-1 text-xs text-ink-600">Our thought leadership library is source-aware, currentness-monitored, and human-reviewed where required. It is intended to guide your thinking, not replace tailored professional advice for your specific situation.</p>
                    </div>
                    {featured && (
                        <article className="grid overflow-hidden rounded-[8px] border border-parchment-400 bg-white md:grid-cols-[260px_1fr]">
                            <div className="flex min-h-44 items-end bg-[radial-gradient(80%_80%_at_70%_30%,rgba(214,163,46,0.35),#121217)] p-4"><span className="font-serif text-sm text-gold-300">Founder readiness</span></div>
                            <div className="p-5">
                                <div className="flex flex-wrap items-center gap-2"><Chip tone="gold">Featured</Chip><CurrentnessChip value={featured.currentness} />{featured.humanReview === 'completed' && <Chip tone="green">Human Reviewed</Chip>}{featured.aiAssisted && <span className="text-[0.6875rem] text-ink-500">AI-assisted draft</span>}</div>
                                <h2 className="mt-2 font-serif text-2xl font-semibold">{featured.title}</h2>
                                <p className="mt-2 text-sm text-ink-600">{featured.summary}</p>
                                <div className="mt-3 flex flex-wrap gap-4 text-[0.6875rem] text-ink-500"><span className="flex items-center gap-1"><Clock className="size-3.5" />{featured.minutes} min read</span><span className="flex items-center gap-1"><Calendar className="size-3.5" />Reviewed: {featured.reviewedAt}</span><span className="flex items-center gap-1"><Database className="size-3.5" />Source basis: {featured.sourceCount}</span><span className="flex items-center gap-1"><Tag className="size-3.5" />Category: {featured.categoryLabel}</span></div>
                                <div className="mt-4 flex gap-2"><Link href={featured.url} className="rounded bg-gold-500 px-4 py-2 text-xs font-bold">Read Insight →</Link><Link href="/resources/free-diagnostic" className="rounded border border-gold-500 px-4 py-2 text-xs font-semibold">Start Diagnostic →</Link></div>
                            </div>
                        </article>
                    )}
                    <form onSubmit={(e) => { e.preventDefault(); go({}); }} className="grid gap-2 rounded-[8px] border border-parchment-400 bg-white p-3 sm:grid-cols-3 xl:grid-cols-[repeat(4,1fr)_1.4fr_auto]">
                        <label className="text-[0.6875rem]">Topic<select value={f.topic ?? ''} onChange={(e) => go({ topic: e.target.value })} className={sel}><option value="">All Topics</option>{topics.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></label>
                        <label className="text-[0.6875rem]">Format<select value={f.type ?? ''} onChange={(e) => go({ type: e.target.value })} className={sel}><option value="">All Formats</option>{['insight', 'commentary', 'viewpoint', 'guide'].map((t) => <option key={t} value={t}>{label(t)}</option>)}</select></label>
                        <label className="text-[0.6875rem]">Currentness<select value={f.currentness ?? ''} onChange={(e) => go({ currentness: e.target.value })} className={sel}><option value="">All Statuses</option><option value="current">Current</option><option value="review_due">Review Due</option></select></label>
                        <label className="text-[0.6875rem]">Sort By<select value={f.sort ?? 'recent'} onChange={(e) => go({ sort: e.target.value })} className={sel}><option value="recent">Most Recent</option><option value="title">Title</option></select></label>
                        <label className="relative self-end"><span className="sr-only">Search insights</span><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input value={f.q ?? ''} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search insights..." className="h-9 w-full rounded border border-parchment-500 pl-7 text-xs" /></label>
                        <button type="submit" className="h-9 self-end rounded bg-gold-500 px-3 text-xs font-bold">Apply Filters</button>
                    </form>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {insights.map((r) => (
                            <article key={r.id} className="flex flex-col rounded-[8px] border border-gold-200 bg-white p-4">
                                <div className="flex gap-2"><Chip tone="gold">{label(r.type)}</Chip><CurrentnessChip value={r.currentness} /></div>
                                <h3 className="mt-2 font-serif text-lg leading-snug font-semibold"><Link href={r.url} className="hover:text-gold-700">{r.title}</Link></h3>
                                <p className="mt-1 text-xs text-ink-600">{r.summary}</p>
                                <p className="mt-2 flex flex-wrap gap-3 text-[0.6875rem] text-ink-500"><span>{r.minutes} min read</span><span>{r.currentness === 'review_due' ? `Review due: ${r.nextReviewAt}` : `Reviewed: ${r.reviewedAt}`}</span><span>Source basis: {r.sourceCount}</span></p>
                                <Link href={r.url} className="mt-auto block rounded border border-gold-400 py-1.5 text-center text-xs font-semibold text-gold-800" style={{ marginTop: '0.75rem' }}>Read Insight →</Link>
                            </article>
                        ))}
                        {insights.length === 0 && <p className="text-sm text-ink-500">No insights match these filters.</p>}
                    </div>
                    <div className="grid gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4 sm:grid-cols-2 xl:grid-cols-5">
                        <div><p className="font-serif text-lg font-semibold">From Insight to Action</p><p className="text-xs">Practical next steps to turn thinking into measurable progress.</p></div>
                        {[[FileSearch, 'Understand the Issue', 'Explore insights and frameworks that clarify the real problem.', 'Explore Insights', '/resources/insights'], [Compass, 'Explore Resources', 'Dive deeper into guides, templates and tools built for action.', 'Browse Resources', '/resources/library'], [CheckCircle2, 'Start a Diagnostic', 'Run a quick diagnostic to benchmark readiness and priorities.', 'Start Diagnostic', '/resources/free-diagnostic'], [Users, 'Request Tailored Support', 'Engage our experts for tailored advice and practical guidance.', 'Ask a Question', '']].map(([I, t, s, c, h]) => { const Icon = I as typeof Users; return <div key={t as string} className="text-xs"><Icon className="size-6 text-gold-700" /><strong className="mt-1 block text-sm">{t as string}</strong>{s as string}{h ? <Link href={h as string} className="mt-1 block font-semibold text-gold-800">{c as string} →</Link> : <button type="button" onClick={() => openAskQuestion({ subject: 'Tailored support request', section: 'resources' })} className="mt-1 block font-semibold text-gold-800">{c as string} →</button>}</div>; })}
                    </div>
                </div>
                <aside className="space-y-4">
                    <Box title="Choose Your Next Step">
                        <Link href="/resources/free-diagnostic" className="block rounded bg-gold-500 py-2 text-center text-xs font-bold">Start Free Diagnostic →</Link>
                        <Link href="/resources/library" className="mt-2 block rounded border border-gold-400 py-2 text-center text-xs font-semibold">Browse Resources →</Link>
                        <button type="button" onClick={() => openAskQuestion({ subject: 'Question for KP', section: 'resources' })} className="mt-2 flex w-full items-center justify-center gap-1 rounded border border-gold-400 py-2 text-xs font-semibold"><MessageCircle className="size-4" /> Ask a Question →</button>
                        <ul className="mt-4 space-y-1.5 text-xs">{['Source shown', 'Review date visible', 'Currentness monitored', 'Human review where required'].map((t) => <li key={t} className="flex gap-1.5"><CheckCircle2 className="size-4 text-verified-500" />{t}</li>)}</ul>
                    </Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
