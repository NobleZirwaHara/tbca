import { router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { BtnLink, btnClass } from '@/Components/Webinars/kit';
import { AiDisclosure, BASE, Box, ConfidenceRing, KpPage, Meter, Select, type KpShared } from '@/Components/Kp/kit';

interface Props extends KpShared {
    questions: { n: number; category: string; question: string; tip: string }[];
    answers: Record<string, string>;
    summary: { category: string; total: number; answered: number; strong: number }[];
    saved: string | null;
    profile: { goal?: string; industry?: string; stage?: string };
    industries: string[];
}

const GOALS = ['Seed Funding (R500k to R5m)', 'Growth Funding (R5m to R25m)', 'Expansion Funding (R25m+)', 'Grant Funding', 'Debt Facility'];
const STAGES = ['Idea / Concept', 'Early Stage (Pre-Revenue)', 'Early Revenue', 'Growth', 'Established'];

/** KP-SCR-022 Funder Readiness Interviewer. Practice only: it never promises funding. */
export default function Funder({ screen, kpNav, questions, answers: saved, summary, saved: savedAt, profile: p, industries }: Props) {
    const [answers, setAnswers] = useState<Record<string, string>>(saved);
    const [profile, setProfile] = useState({ goal: p.goal ?? GOALS[0], industry: p.industry ?? industries[0], stage: p.stage ?? STAGES[1] });
    const firstOpen = questions.find((q) => !saved[String(q.n)])?.n ?? 1;
    const [n, setN] = useState(firstOpen);
    const q = questions[n - 1];
    const done = questions.filter((x) => (answers[String(x.n)] ?? '').trim() !== '').length;
    const pct = Math.round((done / questions.length) * 100);
    const save = (next?: number) => router.post(`${BASE}/funder-readiness`, { answers, profile }, { preserveScroll: true, preserveState: true, onSuccess: () => next && setN(next) });

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['KP Knowledge Assistant', `${BASE}/ask`], ['Funder Readiness Interviewer']]}
            title="Funder Readiness Interviewer"
            badge={<span className="rounded-full border border-referenced-500/40 bg-referenced-50 px-2 py-0.5 font-sans text-[0.75rem] font-semibold text-referenced-500">Beta</span>}
            subtitle="Prepare for funding. Answer with clarity. Build investor confidence."
            intro="The interviewer walks you through the questions funders ask in due diligence, so you can strengthen your pitch and documentation."
            left={
                <div className="space-y-4">
                    <Box title="Your Funding Goal">
                        <div className="space-y-2 text-[0.75rem]">
                            <label className="block font-semibold">Goal<Select value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value })} options={GOALS} /></label>
                            <label className="block font-semibold">Industry<Select value={profile.industry} onChange={(e) => setProfile({ ...profile, industry: e.target.value })} options={industries} /></label>
                            <label className="block font-semibold">Stage<Select value={profile.stage} onChange={(e) => setProfile({ ...profile, stage: e.target.value })} options={STAGES} /></label>
                        </div>
                    </Box>
                    <Box title="Interview Progress">
                        <div className="flex items-center gap-3"><ConfidenceRing value={pct} label="" size={80} /><p className="text-[0.8125rem]"><strong className="text-lg text-ink-900">{done} of {questions.length}</strong><br />questions answered</p></div>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Estimated time: 20 to 30 minutes. {savedAt ? `Last saved ${savedAt}.` : 'Not saved yet.'}</p>
                    </Box>
                </div>
            }
            rail={
                <>
                    <Box title="What This Interview Covers">
                        <ul className="space-y-2">{summary.map((s) => <li key={s.category}><p className="flex justify-between text-[0.75rem]"><span className="font-semibold text-ink-900">{s.category}</span><span className="text-ink-500">{s.answered}/{s.total}</span></p><Meter value={(s.answered / s.total) * 100} tone="purple" className="mt-1" /></li>)}</ul>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Saved answers of 80 characters or more count as strong: {summary.reduce((a, s) => a + s.strong, 0)}.</p>
                    </Box>
                    <Box title="Why This Matters">
                        <p className="text-[0.8125rem]">Strong answers build funder confidence. Weak answers raise red flags. Be clear. Be credible. Be fundable.</p>
                    </Box>
                    <Box title="Need human expertise?" tone="cream">
                        <p className="text-[0.8125rem]">Work through your answers with a TBCA adviser in a Depth Diagnostic session.</p>
                        <BtnLink href={`${BASE}/book?offer=depth-diagnostic`} className="mt-2 w-full" icon="arrow-right">Request a Session</BtnLink>
                    </Box>
                </>
            }
        >
            <section className="rounded-[12px] border border-parchment-400 bg-white p-5">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-full bg-referenced-500 text-white"><L.Bot className="size-5" aria-hidden="true" /></span><div><p className="font-serif font-bold text-ink-900">AI Interviewer</p><p className="text-[0.75rem] text-ink-500">I'll ask the questions funders care about. Be honest and specific.</p></div></div>
                    <span className="rounded-[6px] bg-referenced-50 px-3 py-1 text-[0.8125rem] font-semibold text-referenced-500">Question {n} of {questions.length}</span>
                </header>
                <p className="mt-5 text-[0.8125rem] font-semibold text-referenced-500">Category: {q.category}</p>
                <h2 className="mt-1 font-serif text-[1.25rem] font-bold text-ink-900">{q.question}</h2>
                <label htmlFor="answer" className="sr-only">Your answer</label>
                <textarea id="answer" rows={6} maxLength={2000} value={answers[String(n)] ?? ''} onChange={(e) => setAnswers({ ...answers, [String(n)]: e.target.value })} placeholder="Type your answer here..." className="mt-3 w-full rounded-[8px] border border-parchment-500 p-3 text-[0.875rem] focus:border-referenced-500 focus:outline-none" />
                <p className="flex justify-between text-[0.6875rem] text-ink-500"><span>Tip: {q.tip}</span><span>{(answers[String(n)] ?? '').length}/2000</span></p>
                <div className="mt-4 flex flex-wrap justify-between gap-2">
                    <button type="button" onClick={() => save()} className={btnClass('outline')}><L.Bookmark className="size-4" />Save Draft</button>
                    <button type="button" onClick={() => save(Math.min(questions.length, n + 1))} className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-referenced-500 px-4 font-semibold text-white">Save & Next <L.ArrowRight className="size-4" /></button>
                </div>
                <div className="mt-4 flex justify-between border-t border-parchment-300 pt-3 text-[0.8125rem]">
                    <button type="button" disabled={n === 1} onClick={() => setN(n - 1)} className="inline-flex items-center gap-1 disabled:opacity-40"><L.ArrowLeft className="size-4" />Previous Question</button>
                    <button type="button" disabled={n === questions.length} onClick={() => setN(n + 1)} className="inline-flex items-center gap-1 disabled:opacity-40">Next Question<L.ArrowRight className="size-4" /></button>
                </div>
            </section>
            <nav aria-label="All questions" className="flex flex-wrap gap-1.5">
                {questions.map((x) => <button key={x.n} type="button" aria-current={x.n === n ? 'step' : undefined} onClick={() => setN(x.n)} className={`size-8 rounded-full border text-[0.75rem] font-semibold ${x.n === n ? 'border-referenced-500 bg-referenced-500 text-white' : (answers[String(x.n)] ?? '').trim() ? 'border-verified-500 bg-verified-50 text-verified-700' : 'border-parchment-500 bg-white'}`}>{x.n}</button>)}
            </nav>
            <AiDisclosure>Practice interview built from common funder due-diligence questions (Voice A). It does not assess your business or promise funding.</AiDisclosure>
        </KpPage>
    );
}
