import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { BookOpen, CheckCircle2, ChevronDown, Eye, FileText, Search, Sparkles, Users } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Box, Chip } from '@/Components/Insights/Shared';
import { PageTitle, ResourceFrame } from '@/Components/Insights/Resources';
import { cn } from '@/lib/cn';

interface Props {
    filters: { q: string | null; topic: string | null };
    geo: { question: string; answer: string; steps: string[] } | null;
    related: { type: string; title: string; summary: string; url: string }[];
    faqs: { id: number; question: string; answer: string; topic: string }[];
    topics: string[];
}

export default function Faq({ filters, geo, related, faqs, topics }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [open, setOpen] = useState<number | null>(faqs[0]?.id ?? null);
    const go = (next: Record<string, string>) => router.get('/resources/faq', Object.fromEntries(Object.entries({ q, topic: filters.topic ?? '', ...next }).filter(([, v]) => v)), { preserveScroll: true, preserveState: true });

    return (
        <ResourceFrame title="Frequently Asked Questions" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'FAQ + GEO Answer Block' }]}>
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-5">
                    <PageTitle title="Frequently Asked Questions" intro="Direct answers. Clear sources. Controlled currentness." />
                    <form onSubmit={(e) => { e.preventDefault(); go({}); }} className="flex flex-wrap gap-2">
                        <label className="relative min-w-60 flex-1"><span className="sr-only">Search questions</span><Search className="absolute top-2.5 right-2.5 size-4 text-ink-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions..." className="h-9 w-full rounded border border-parchment-500 bg-white px-3 text-sm" /></label>
                        <select aria-label="Topic" value={filters.topic ?? ''} onChange={(e) => go({ topic: e.target.value })} className="h-9 rounded border border-parchment-500 bg-white text-xs"><option value="">All Topics</option>{topics.map((t) => <option key={t}>{t}</option>)}</select>
                        <span className="flex h-9 items-center rounded border border-parchment-500 bg-white px-3 text-xs">Current</span>
                    </form>
                    {geo && (
                        <section className="rounded-[8px] border border-gold-400 bg-gold-50/40 p-5">
                            <p className="flex items-center gap-1.5 text-[0.6875rem] font-bold tracking-wide text-gold-700 uppercase"><Sparkles className="size-4" /> GEO Answer</p>
                            <div className="mt-2 grid gap-4 lg:grid-cols-[1fr_260px]">
                                <div>
                                    <h2 className="font-serif text-xl font-semibold">{geo.question}</h2>
                                    <p className="mt-2 text-sm text-ink-700">{geo.answer}</p>
                                    <ul className="mt-3 space-y-1.5 text-sm">{geo.steps.map((s) => <li key={s} className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-gold-600" />{s}</li>)}</ul>
                                    <div className="mt-4 flex gap-3"><Link href={related[0]?.url ?? '/resources/library'} className="rounded bg-gold-500 px-4 py-2 text-xs font-bold">Explore Resource →</Link><button type="button" onClick={() => openAskQuestion({ subject: geo.question, section: 'resources' })} className="text-xs font-semibold">Ask a Question →</button></div>
                                </div>
                                <div className="rounded border border-parchment-400 bg-white p-3 text-xs"><p className="font-semibold">What this answer does not do</p><p className="mt-2 text-ink-600">This is general information, not tailored professional advice.</p><p className="mt-2 text-ink-600">Complete working outputs, templates, and implementation support are available in controlled paid resources and services.</p></div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-4 border-t border-gold-200 pt-3 text-xs text-ink-600"><span className="flex items-center gap-1"><FileText className="size-4" />Source shown</span><span className="flex items-center gap-1"><CheckCircle2 className="size-4" />Review status: Current</span><span className="flex items-center gap-1"><Users className="size-4" />Human review where required</span><span className="flex items-center gap-1"><Sparkles className="size-4" />AI-assisted draft</span></div>
                        </section>
                    )}
                    {related.length > 0 && (
                        <section>
                            <div className="flex items-center justify-between"><h2 className="font-serif text-lg font-semibold">Related Resources</h2><Link href="/resources/library?category[]=due-diligence" className="text-xs font-semibold text-gold-700">View all resources →</Link></div>
                            <div className="mt-2 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{related.map((r) => <div key={r.title} className="rounded-[8px] border border-parchment-400 bg-white p-3"><Chip tone="gold">{r.type}</Chip><p className="mt-1 text-sm font-semibold">{r.title}</p><p className="text-xs text-ink-500">{r.summary}</p><Link href={r.url} className="mt-2 inline-block rounded border border-gold-400 px-3 py-1 text-xs font-semibold">Explore Resource →</Link></div>)}</div>
                        </section>
                    )}
                    <section>
                        <h2 className="font-serif text-lg font-semibold">Frequently Asked Questions</h2>
                        <ul className="mt-2 grid gap-2 md:grid-cols-2">
                            {faqs.map((f) => (
                                <li key={f.id} className="rounded-[8px] border border-parchment-400 bg-white">
                                    <button type="button" aria-expanded={open === f.id} onClick={() => setOpen(open === f.id ? null : f.id)} className="flex w-full items-center justify-between gap-2 p-3 text-left text-sm font-semibold">{f.question}<ChevronDown className={cn('size-4 shrink-0 transition-transform', open === f.id && 'rotate-180')} /></button>
                                    {open === f.id && <p className="px-3 pb-3 text-xs text-ink-600">{f.answer}</p>}
                                </li>
                            ))}
                            {faqs.length === 0 && <li className="text-sm text-ink-500">No questions match your search.</li>}
                        </ul>
                    </section>
                </div>
                <aside className="space-y-4">
                    <Box title="Answer Quality"><ul className="space-y-1.5 text-xs">{['Source visible', 'Review visible', 'Currentness monitored', 'Human review where required'].map((t) => <li key={t} className="flex gap-1.5"><CheckCircle2 className="size-4 text-verified-500" />{t}</li>)}</ul><Link href="/resources/content-status" className="mt-2 inline-block text-xs font-semibold text-gold-700">Learn more about our standards →</Link></Box>
                    <Box title="Need tailored help?"><p className="text-xs">Get expert guidance tailored to your context.</p><Link href="/resources/free-diagnostic" className="mt-2 block rounded bg-gold-500 py-2 text-center text-xs font-bold">Start Free Diagnostic →</Link><button type="button" onClick={() => openAskQuestion({ subject: 'FAQ follow-up', section: 'resources' })} className="mt-2 w-full rounded border border-gold-400 py-2 text-xs font-semibold">Ask a Question →</button></Box>
                    <Box title="From answer to action"><ol className="space-y-2 text-xs">{[[BookOpen, 'Explore Resource', 'Use guides, templates and tools.'], [Eye, 'Start Diagnostic', 'Assess your situation and priorities.'], [Users, 'Request Tailored Support', 'Engage experts to drive execution.']].map(([I, t, s], i) => { const Icon = I as typeof Eye; return <li key={t as string} className="flex gap-2"><span className="flex size-5 items-center justify-center rounded-full border border-gold-500 text-[0.625rem]">{i + 1}</span><Icon className="size-4 text-gold-700" /><span><strong className="block">{t as string}</strong>{s as string}</span></li>; })}</ol></Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
