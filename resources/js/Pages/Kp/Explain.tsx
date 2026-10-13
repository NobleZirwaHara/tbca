import { Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { Ico } from '@/Components/Webinars/kit';
import { AiDisclosure, BASE, Box, KpPage, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Props extends KpShared {
    level: string;
    topic: string;
    question: string;
    topics: { key: string; label: string }[];
    levels: { key: string; label: string; body: string; icon: string }[];
    points: { title: string; icon: string; line: string; example: string | null }[];
    intro: string;
    close: string;
    sources: { title: string; href: string }[];
}

/** KP-SCR-020 Explain It at My Level. Adaptations keep the source voice and cite the same sources. */
export default function Explain({ screen, kpNav, level, topic, question, topics, levels, points, intro, close, sources }: Props) {
    const [pick, setPick] = useState(level);
    const current = levels.find((l) => l.key === level);
    const go = (over: Record<string, string>) => router.get(`${BASE}/explain`, { topic, level: pick, ...over }, { preserveScroll: true });
    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['KP Knowledge Assistant', `${BASE}/ask`], ['Explain It at My Level']]}
            title="Explain It at My Level"
            badge={<span className="rounded-full border border-referenced-500/40 bg-referenced-50 px-2 py-0.5 font-sans text-[0.75rem] font-semibold text-referenced-500">Beta</span>}
            subtitle="Complex ideas. Plain language. Just for you."
            intro="We explain the concept in a way that fits your chosen level."
            left={
                <div className="space-y-4">
                    <Box title="Your Topic" tone="cream">
                        <label htmlFor="topic" className="sr-only">Topic</label>
                        <select id="topic" value={topic} onChange={(e) => go({ topic: e.target.value })} className="h-10 w-full rounded-[6px] border border-parchment-500 bg-white px-2 text-[0.8125rem]">{topics.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}</select>
                    </Box>
                    <Box title="Choose Your Level">
                        <fieldset>
                            <legend className="sr-only">Level</legend>
                            {levels.map((l) => (
                                <label key={l.key} className={cn('flex cursor-pointer items-center gap-2.5 rounded-[8px] p-2', pick === l.key && 'bg-referenced-50')}>
                                    <input type="radio" name="level" className="accent-referenced-500" checked={pick === l.key} onChange={() => setPick(l.key)} />
                                    <Ico name={l.icon} className="size-5 text-ink-600" />
                                    <span><span className="block text-[0.8125rem] font-semibold text-ink-900">{l.label}</span><span className="block text-[0.6875rem] text-ink-500">{l.body}</span></span>
                                </label>
                            ))}
                        </fieldset>
                        <button type="button" onClick={() => go({ level: pick })} className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-referenced-500 font-semibold text-white">Explain It <L.ArrowRight className="size-4" /></button>
                    </Box>
                </div>
            }
            rail={
                <>
                    <Box title="About This Feature" tone="purple">
                        <p className="text-[0.8125rem]">The assistant explains approved business concepts at the level you choose.</p>
                        <ul className="mt-2 space-y-1.5 text-[0.75rem]">
                            <li className="flex gap-2"><L.Bot className="size-4 shrink-0 text-referenced-500" aria-hidden="true" />AI-adapted from approved content</li>
                            <li className="flex gap-2"><L.Users className="size-4 shrink-0 text-referenced-500" aria-hidden="true" />Age and role appropriate</li>
                            <li className="flex gap-2"><L.FileCheck className="size-4 shrink-0 text-referenced-500" aria-hidden="true" />Same sources at every level</li>
                        </ul>
                    </Box>
                    <Box title="Sources">
                        <ul className="space-y-1.5">{sources.map((s) => <li key={s.href}><Link href={s.href} className="text-[0.8125rem] text-gold-700 hover:underline">{s.title}</Link></li>)}</ul>
                    </Box>
                    <Box title="Still confused?" tone="cream">
                        <p className="text-[0.8125rem]">Ask a follow-up question or try a different level.</p>
                        <Link href={`${BASE}/ask?q=${encodeURIComponent(question)}`} className="mt-2 inline-block text-[0.8125rem] font-semibold text-gold-700">Ask a Question</Link>
                    </Box>
                </>
            }
        >
            <section className="rounded-[12px] border border-parchment-400 bg-white p-5">
                <header className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-full bg-referenced-500 text-white"><L.Sparkles className="size-5" aria-hidden="true" /></span>
                    <div>
                        <h2 className="font-serif text-[1.125rem] font-bold text-ink-900">Explained for: <span className="text-referenced-500">{current?.label}</span></h2>
                        <p className="text-[0.8125rem] text-ink-600">{question} {intro}</p>
                    </div>
                </header>
                <ol className="mt-4 divide-y divide-parchment-300 rounded-[10px] border border-parchment-400">
                    {points.map((p, i) => (
                        <li key={p.title} className="flex items-start gap-3 p-3">
                            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-referenced-500 text-[0.75rem] font-bold text-white">{i + 1}</span>
                            <Ico name={p.icon} className="mt-0.5 size-6 shrink-0 text-referenced-500" />
                            <span><span className="block text-[0.875rem] font-bold text-ink-900">{p.title}</span><span className="block text-[0.8125rem] text-ink-700">{p.line}</span>{p.example && <span className="block text-[0.75rem] text-ink-500">Example: {p.example}</span>}</span>
                        </li>
                    ))}
                </ol>
                <p className="mt-3 flex gap-2 rounded-[10px] border border-referenced-500/30 bg-referenced-50 p-3 text-[0.8125rem] text-ink-700"><L.Star className="size-4 shrink-0 text-referenced-500" aria-hidden="true" />{close}</p>
                <AiDisclosure className="mt-4" />
            </section>
        </KpPage>
    );
}
