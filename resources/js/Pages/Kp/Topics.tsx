import { Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { BtnLink, Ico } from '@/Components/Webinars/kit';
import { BASE, Box, Empty, InsightCard, KpPage, type KpCard, type KpResource, type KpShared, type KpTheme } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Props extends KpShared {
    q: string;
    topics: KpTheme[];
    all: KpTheme[];
    latest: KpCard[];
    current: (KpTheme & { items: KpCard[]; resources: KpResource[] }) | null;
}

const POPULAR: [string, string][] = [
    ['Execution Excellence', 'strategy-execution'],
    ['Capital Readiness', 'capital-funding'],
    ['Board Effectiveness', 'governance-boards'],
    ['Project Bankability', 'project-development'],
    ["Africa's Growth Agenda", 'markets-growth'],
];

/** KP-SCR-014 Topic Hub (all topics) and a single topic view. */
export default function Topics({ screen, kpNav, q, topics, all, latest, current }: Props) {
    const [query, setQuery] = useState(q);
    const total = all.reduce((n, t) => n + t.articles, 0);
    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={current ? [['Topic Hub', `${BASE}/topics`], [current.label]] : [['Topic Hub']]}
            title={current ? current.label : 'Topic Hub'}
            subtitle={current ? current.blurb : 'Explore ideas. Gain clarity. Take action.'}
            intro={current ? undefined : 'Dive deeper into the topics that shape strategy, execution and impact across Africa. Select a topic to explore insights, frameworks, tools and resources.'}
            left={
                <div className="space-y-4">
                    <Box title="Topic Categories">
                        <ul className="space-y-0.5">
                            <li><Link href={`${BASE}/topics`} className={cn('flex justify-between rounded-[6px] px-2 py-1.5 text-[0.8125rem]', !current ? 'bg-gold-100 font-semibold text-gold-800' : 'hover:bg-parchment-200')}>All Topics<span>{total}</span></Link></li>
                            {all.map((t) => (
                                <li key={t.slug}><Link href={t.href} className={cn('flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-[0.8125rem]', current?.slug === t.slug ? 'bg-gold-100 font-semibold text-gold-800' : 'hover:bg-parchment-200')}><Ico name={t.icon} className="size-4 text-gold-600" /><span className="flex-1">{t.label}</span>{t.articles}</Link></li>
                            ))}
                        </ul>
                    </Box>
                    <Box title="Popular Topics">
                        <ol className="space-y-1.5">{POPULAR.map(([t, s], i) => <li key={t}><Link href={`${BASE}/topics/${s}`} className="flex items-center gap-2 text-[0.8125rem] hover:text-gold-700"><span className="flex size-5 items-center justify-center rounded-full bg-ink-900 text-[0.625rem] font-bold text-parchment-50">{i + 1}</span>{t}</Link></li>)}</ol>
                    </Box>
                </div>
            }
            rail={
                <>
                    <form onSubmit={(e) => { e.preventDefault(); router.get(`${BASE}/topics`, query ? { q: query } : {}); }} className="relative">
                        <label htmlFor="tq" className="sr-only">Search topics</label>
                        <input id="tq" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics..." className="h-10 w-full rounded-[6px] border border-parchment-500 bg-white pr-9 pl-3 text-[0.875rem]" />
                        <button type="submit" className="absolute top-1/2 right-2 -translate-y-1/2 text-ink-500"><L.Search className="size-4" /><span className="sr-only">Search</span></button>
                    </form>
                    <Box title="Featured Topic" tone="cream">
                        <p className="font-serif font-bold text-ink-900">Execution Excellence</p>
                        <p className="mt-1 text-[0.8125rem]">Practical frameworks and insights to help you execute strategy and deliver results.</p>
                        <Link href={`${BASE}/topics/strategy-execution`} className="mt-2 inline-block text-[0.8125rem] font-semibold text-gold-700">Explore Topic</Link>
                    </Box>
                    {latest.length > 0 && (
                        <Box title="Latest in Topic Hub">
                            <ul className="space-y-2">{latest.map((l) => <li key={l.slug}><Link href={l.href} className="flex gap-2 text-[0.8125rem] hover:text-gold-700"><L.FileText className="mt-0.5 size-4 shrink-0 text-ink-500" aria-hidden="true" />{l.title}</Link></li>)}</ul>
                        </Box>
                    )}
                    <Box title="Stay in the Loop">
                        <p className="text-[0.8125rem]">Get the latest insights on your favourite topics.</p>
                        <BtnLink href={`${BASE}/newsletter`} tone="outline" className="mt-2 w-full">Subscribe to KP Insights</BtnLink>
                    </Box>
                </>
            }
        >
            {current ? (
                <>
                    <section>
                        <h2 className="mb-3 font-serif text-[1.25rem] font-bold text-ink-900">Insights on {current.label}</h2>
                        {current.items.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{current.items.map((i) => <InsightCard key={i.slug} item={i} />)}</div> : <Empty>No insights on this topic yet.</Empty>}
                    </section>
                    {current.resources.length > 0 && (
                        <Box title="Tools & Resources" icon="wrench">
                            <ul className="divide-y divide-parchment-300">{current.resources.map((r) => <li key={r.slug} className="flex items-center justify-between gap-2 py-2"><span><span className="block text-[0.8125rem] font-semibold text-ink-900">{r.title}</span><span className="block text-[0.75rem] text-ink-500">{r.body}</span></span><a href={r.href} className="text-[0.75rem] font-semibold text-gold-700">Summary ({r.format})</a></li>)}</ul>
                        </Box>
                    )}
                </>
            ) : (
                <section>
                    <h2 className="mb-3 font-serif text-[1.25rem] font-bold text-ink-900">{q ? `Topics matching "${q}"` : 'Browse All Topics'}</h2>
                    {topics.length === 0 ? <Empty>No topics match your search.</Empty> : (
                        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {topics.map((t) => (
                                <li key={t.slug}>
                                    <Link href={t.href} className="flex h-full flex-col items-center rounded-[10px] border border-parchment-400 bg-white p-4 text-center hover:border-gold-500">
                                        <Ico name={t.icon} className="size-8 text-gold-600" />
                                        <span className="mt-2 font-serif font-bold text-ink-900">{t.label}</span>
                                        <span className="mt-1 flex-1 text-[0.75rem] text-ink-600">{t.blurb}</span>
                                        <span className="mt-3 flex w-full justify-between border-t border-parchment-300 pt-2 text-[0.6875rem] text-ink-500"><span>{t.articles} Insights</span><span>{t.tools} Resources</span></span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-gold-200 bg-gold-50 px-4 py-3">
                <p className="flex items-center gap-2 text-[0.8125rem] text-ink-700"><L.Lightbulb className="size-5 text-gold-700" aria-hidden="true" /><span><strong className="text-ink-900">Can't find what you're looking for?</strong> Suggest a topic or ask a question and our team will point you in the right direction.</span></p>
                <BtnLink href="/contact?subject=KP%20topic%20suggestion" tone="outline" size="sm" icon="arrow-right">Suggest a Topic</BtnLink>
            </div>
        </KpPage>
    );
}
