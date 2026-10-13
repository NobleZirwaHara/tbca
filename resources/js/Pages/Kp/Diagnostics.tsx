import { Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { BtnLink, btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, ConfidenceRing, KpPage, Meter, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

type Option = { label: string; hint: string; weak: boolean };

interface Props extends KpShared {
    topic: string;
    topics: { key: string; label: string; count: number; done: boolean }[];
    label: string;
    questions: [string, Option[]][];
    answers: string[];
    result: { weak: { question: string; answer: string }[]; saved: string } | null;
}

const NEXT: Record<string, [string, string]> = {
    'strategy-growth': ['Decision Sheet', `${BASE}/decision-sheet`],
    'finance-funding': ['Capital Readiness Scorecard', `${BASE}/tools/scorecards/capital-readiness`],
    'project-readiness': ['Project Fatal-Flaw Explorer', `${BASE}/project-fatal-flaw`],
    'legal-governance': ['Boardroom Challenger', `${BASE}/boardroom-challenger`],
};

/** KP-SCR-028 Diagnostic Questions. */
export default function Diagnostics({ screen, kpNav, topic, topics, label, questions, answers: saved, result }: Props) {
    const [answers, setAnswers] = useState<string[]>(saved.length ? saved : []);
    const [i, setI] = useState(0);
    const q = questions[i];
    const totalDone = topics.filter((t) => t.done).length;
    const submit = () => router.post(`${BASE}/diagnostic-questions`, { topic, answers }, { preserveScroll: true });
    const next = NEXT[topic] ?? ['Capital Readiness Scorecard', `${BASE}/tools/scorecards/capital-readiness`];

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['KP Knowledge Assistant', `${BASE}/ask`], ['Diagnostic Questions']]}
            title="Diagnostic Questions"
            badge={<span className="rounded-full border border-referenced-500/40 bg-referenced-50 px-2 py-0.5 font-sans text-[0.75rem] font-semibold text-referenced-500">Beta</span>}
            intro="Answer a few targeted questions to get better, more relevant insights."
            left={
                <div className="space-y-4">
                    <Box title="Topics">
                        <p className="-mt-2 mb-2 text-[0.75rem] text-ink-500">Select a topic to get started.</p>
                        <ul className="space-y-0.5">{topics.map((t) => <li key={t.key}><Link href={`${BASE}/diagnostic-questions?topic=${t.key}`} preserveScroll className={cn('flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-[0.8125rem]', t.key === topic ? 'bg-referenced-50 font-semibold text-referenced-500' : 'hover:bg-parchment-200')}>{t.done ? <L.CircleCheck className="size-4 text-verified-500" aria-label="Completed" /> : <L.Circle className="size-4 text-ink-300" aria-hidden="true" />}<span className="flex-1">{t.label}</span><span className="text-[0.6875rem] text-ink-500">{t.count}</span></Link></li>)}</ul>
                    </Box>
                    <Box title="Your Progress">
                        <ConfidenceRing value={Math.round((totalDone / topics.length) * 100)} label={`${totalDone} of ${topics.length} topics`} size={88} />
                    </Box>
                </div>
            }
            rail={
                <>
                    <Box title="Why These Questions?" tone="purple">
                        <p className="text-[0.8125rem]">Your answers help KP tools point you to the right insights, frameworks and next steps.</p>
                        <ul className="mt-2 space-y-1 text-[0.75rem]">{['Targeted recommendations', 'Relevant frameworks', 'Better risk identification', 'Actionable next steps'].map((t) => <li key={t} className="flex gap-2"><L.Check className="size-4 text-verified-500" aria-hidden="true" />{t}</li>)}</ul>
                    </Box>
                    <Box title="Tips for Best Results">
                        <ul className="list-disc space-y-1 pl-4 text-[0.75rem]"><li>Be honest and specific.</li><li>Use real data where possible.</li><li>You can update answers any time.</li></ul>
                    </Box>
                </>
            }
        >
            {result && (
                <Box title={`Your ${label} Results`} icon="clipboard-check" tone="cream">
                    <p className="text-[0.75rem] text-ink-500">Saved {result.saved}.</p>
                    {result.weak.length === 0 ? <p className="mt-2 text-[0.875rem]">No weak spots flagged in this topic. Keep the evidence up to date.</p> : (
                        <>
                            <p className="mt-2 text-[0.875rem] font-semibold text-ink-900">Areas to strengthen first:</p>
                            <ul className="mt-1 space-y-1.5">{result.weak.map((w) => <li key={w.question} className="flex gap-2 text-[0.8125rem]"><L.TriangleAlert className="mt-0.5 size-4 shrink-0 text-attested-500" aria-hidden="true" /><span><strong>{w.answer}.</strong> {w.question}</span></li>)}</ul>
                        </>
                    )}
                    <BtnLink href={next[1]} size="sm" className="mt-3" icon="arrow-right">Next: {next[0]}</BtnLink>
                </Box>
            )}

            <section className="rounded-[12px] border border-parchment-400 bg-white p-5">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="flex items-center gap-2 font-serif text-[1.125rem] font-bold text-ink-900"><L.CircleHelp className="size-5 text-referenced-500" aria-hidden="true" />{label}</h2>
                    <div className="w-48"><p className="text-right text-[0.75rem] text-ink-500">Question {i + 1} of {questions.length}</p><Meter value={((i + 1) / questions.length) * 100} tone="purple" className="mt-1" /></div>
                </header>
                <fieldset className="mt-4">
                    <legend className="text-[1rem] font-bold text-ink-900">{q[0]}</legend>
                    <p className="text-[0.75rem] text-ink-500">Select the option that best describes your situation.</p>
                    <div className="mt-3 space-y-2">
                        {q[1].map((o) => (
                            <label key={o.label} className={cn('flex cursor-pointer items-center gap-3 rounded-[8px] border p-3', answers[i] === o.label ? 'border-referenced-500 bg-referenced-50' : 'border-parchment-400 hover:border-referenced-500')}>
                                <input type="radio" name={`q${i}`} className="accent-referenced-500" checked={answers[i] === o.label} onChange={() => { const n = [...answers]; n[i] = o.label; setAnswers(n); }} />
                                <span><span className="block text-[0.875rem] font-semibold text-ink-900">{o.label}</span><span className="block text-[0.75rem] text-ink-500">{o.hint}</span></span>
                            </label>
                        ))}
                    </div>
                </fieldset>
                <div className="mt-4 flex justify-between">
                    <button type="button" disabled={i === 0} onClick={() => setI(i - 1)} className={btnClass('outline')}>Back</button>
                    {i < questions.length - 1 ? (
                        <button type="button" disabled={!answers[i]} onClick={() => setI(i + 1)} className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-referenced-500 px-4 font-semibold text-white disabled:opacity-50">Next Question <L.ArrowRight className="size-4" /></button>
                    ) : (
                        <button type="button" disabled={questions.some((_, k) => !answers[k])} onClick={submit} className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-referenced-500 px-4 font-semibold text-white disabled:opacity-50">Save & See Results <L.ArrowRight className="size-4" /></button>
                    )}
                </div>
                <p className="mt-4 flex gap-2 rounded-[8px] bg-gold-50 p-2 text-[0.75rem] text-ink-700"><L.Lock className="size-4 shrink-0 text-gold-700" aria-hidden="true" />Your answers are private to your session or account and only shape the recommendations you see.</p>
            </section>
        </KpPage>
    );
}
