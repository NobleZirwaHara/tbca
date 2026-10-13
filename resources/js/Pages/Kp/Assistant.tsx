import { Link, useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { Ico, btnClass } from '@/Components/Webinars/kit';
import { AiDisclosure, BASE, Box, KpPage, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Props extends KpShared {
    prefill: string;
    suggestions: string[];
    recent: { reference: string; question: string; status: string; when: string }[];
    topics: { label: string; href: string; icon: string }[];
    covered: string[];
}

const START: [string, string, string, string][] = [
    ['message-circle', 'Ask a Question', 'Get cited answers to your questions.', '#ask'],
    ['layers', 'Explore Topics', 'Browse key themes and insights.', `${BASE}/topics`],
    ['file-text', 'Find Resources', 'Locate frameworks, tools and guides.', `${BASE}/resources`],
    ['globe', 'Country or Sector Lens', 'Get insights by country or sector.', `${BASE}/africa/kenya`],
];
const TOOLS: [string, string, string, string][] = [
    ['lightbulb', 'Explain It at My Level', 'From age 12 to expert.', `${BASE}/explain`],
    ['scale', 'Boardroom Challenger', 'Stress-test a decision.', `${BASE}/boardroom-challenger`],
    ['users', 'Funder Readiness Interviewer', 'Practise funder questions.', `${BASE}/funder-readiness`],
    ['triangle-alert', 'Project Fatal-Flaw Explorer', 'Find deal-breakers early.', `${BASE}/project-fatal-flaw`],
];
const STATUS: Record<string, string> = { answered: 'Answered', abstained: 'Not enough evidence', routed: 'Routed to a professional', declined: 'Declined' };

/** KP-SCR-018 KP Knowledge Assistant: grounded, cited, abstains without evidence. */
export default function Assistant({ screen, kpNav, prefill, suggestions, recent, topics, covered }: Props) {
    const form = useForm({ question: prefill });
    const ask = (q?: string) => {
        if (q) form.setData('question', q);
        form.transform((d) => ({ question: q ?? d.question }));
        form.post(`${BASE}/ask`);
    };
    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['KP Knowledge Assistant']]}
            title="KP Knowledge Assistant"
            badge={<span className="rounded-full border border-referenced-500/40 bg-referenced-50 px-2 py-0.5 font-sans text-[0.75rem] font-semibold text-referenced-500">Beta</span>}
            subtitle="Your AI assistant for insights, frameworks and trusted knowledge."
            intro="Ask questions. Get answers. Explore ideas. Every answer is drawn from approved content from Kruger Phiri and The Business Clinic.Africa, with sources you can check."
            left={
                <div className="space-y-4">
                    <button type="button" onClick={() => form.setData('question', '')} className={cn(btnClass('gold'), 'w-full')}><L.Plus className="size-4" /> New Conversation</button>
                    <Box title="Recent Questions">
                        {recent.length === 0 ? <p className="text-[0.75rem] text-ink-500">Your questions appear here.</p> : (
                            <ul className="space-y-2">{recent.map((r) => <li key={r.reference}><Link href={`${BASE}/ask/${r.reference}`} className="flex gap-2 text-[0.75rem] hover:text-gold-700"><L.MessageSquare className="mt-0.5 size-3.5 shrink-0 text-ink-500" aria-hidden="true" /><span className="flex-1"><span className="block text-ink-900">{r.question}</span><span className="text-ink-500">{STATUS[r.status] ?? r.status} | {r.when}</span></span></Link></li>)}</ul>
                        )}
                    </Box>
                    <Box title="Try These Suggestions">
                        <ul className="space-y-1.5">{suggestions.map((s) => <li key={s}><button type="button" onClick={() => ask(s)} className="flex gap-2 text-left text-[0.75rem] hover:text-gold-700"><L.ArrowRight className="mt-0.5 size-3.5 shrink-0 text-gold-600" aria-hidden="true" />{s}</button></li>)}</ul>
                    </Box>
                </div>
            }
            rail={
                <>
                    <Box title="Assistant Tools" icon="wrench">
                        <ul className="space-y-2.5">{TOOLS.map(([i, t, b, h]) => <li key={t}><Link href={h} className="flex gap-2.5 hover:text-gold-700"><Ico name={i} className="mt-0.5 size-4 shrink-0 text-referenced-500" /><span><span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span><span className="block text-[0.6875rem] text-ink-500">{b}</span></span></Link></li>)}</ul>
                    </Box>
                    <Box title="About This Assistant" icon="bot" tone="purple">
                        <p className="text-[0.8125rem]">It answers only from approved KP and TBCA content, cites every source and says so when the evidence is not there.</p>
                        <ul className="mt-3 space-y-2 text-[0.75rem]">
                            <li className="flex gap-2"><L.CircleCheck className="size-4 shrink-0 text-referenced-500" aria-hidden="true" /><span><strong className="text-ink-900">Approved sources only.</strong> Stale or restricted content is excluded.</span></li>
                            <li className="flex gap-2"><L.CircleCheck className="size-4 shrink-0 text-referenced-500" aria-hidden="true" /><span><strong className="text-ink-900">Cited answers.</strong> Every answer lists its sources and confidence.</span></li>
                            <li className="flex gap-2"><L.CircleCheck className="size-4 shrink-0 text-referenced-500" aria-hidden="true" /><span><strong className="text-ink-900">Never Kruger.</strong> It explains his published work; it does not speak for him.</span></li>
                        </ul>
                    </Box>
                    <Box title="Need Human Expertise?" tone="cream">
                        <p className="text-[0.8125rem]">For complex or sensitive matters, our team is ready to help.</p>
                        <Link href="/contact?subject=KP%20assistant%20follow-up" className={cn(btnClass('gold'), 'mt-2 w-full')}>Ask a Person</Link>
                    </Box>
                </>
            }
        >
            <section className="rounded-[12px] border border-parchment-400 bg-white p-5" id="ask">
                <div className="flex items-start gap-3">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-referenced-500 text-white"><L.Bot className="size-6" aria-hidden="true" /></span>
                    <div>
                        <h2 className="font-serif text-[1.25rem] font-bold text-ink-900">Hello! I'm the KP Knowledge Assistant.</h2>
                        <p className="text-[0.8125rem] text-ink-600">I can help you find insights, frameworks, tools and resources from Kruger Phiri and The Business Clinic.Africa.</p>
                    </div>
                </div>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {START.map(([i, t, b, h]) => (
                        <li key={t}>{h.startsWith('#') ? <a href={h} className="flex h-full flex-col items-center rounded-[10px] border border-parchment-400 p-3 text-center hover:border-referenced-500"><Ico name={i} className="size-6 text-referenced-500" /><span className="mt-1 text-[0.8125rem] font-semibold text-ink-900">{t}</span><span className="text-[0.6875rem] text-ink-500">{b}</span></a> : <Link href={h} className="flex h-full flex-col items-center rounded-[10px] border border-parchment-400 p-3 text-center hover:border-referenced-500"><Ico name={i} className="size-6 text-referenced-500" /><span className="mt-1 text-[0.8125rem] font-semibold text-ink-900">{t}</span><span className="text-[0.6875rem] text-ink-500">{b}</span></Link>}</li>
                    ))}
                </ul>
                <p className="mt-4 text-[0.75rem] text-ink-500">Topics with approved answers today: {covered.join(' | ')}. Other questions get the closest published material, or a clear "not enough evidence".</p>
                <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(); }}>
                    <label htmlFor="question" className="sr-only">Your question</label>
                    <input id="question" value={form.data.question} onChange={(e) => form.setData('question', e.target.value)} maxLength={300} required minLength={3} placeholder="Ask anything about strategy, execution, governance, risks, frameworks..." className="h-12 min-w-0 flex-1 rounded-[8px] border border-parchment-500 bg-white px-3 text-[0.9375rem] focus:border-referenced-500 focus:outline-none" />
                    <button type="submit" disabled={form.processing} className="inline-flex h-12 items-center gap-2 rounded-[8px] bg-referenced-500 px-5 font-semibold text-white disabled:opacity-50"><L.Send className="size-4" aria-hidden="true" /><span className="hidden sm:inline">Ask</span></button>
                </form>
                {form.errors.question && <p className="mt-1 text-[0.75rem] text-risk-500">{form.errors.question}</p>}
                <AiDisclosure className="mt-3">KP Knowledge Assistant can make mistakes. Always verify critical information against the cited sources. It is not Kruger Phiri speaking.</AiDisclosure>
            </section>
            <Box title="Browse by Topic" icon="layers">
                <ul className="flex flex-wrap gap-2">{topics.map((t) => <li key={t.label}><Link href={t.href} className="inline-flex items-center gap-1.5 rounded-full border border-parchment-500 bg-white px-3 py-1 text-[0.75rem] hover:border-referenced-500"><Ico name={t.icon} className="size-3.5 text-referenced-500" />{t.label}</Link></li>)}</ul>
            </Box>
        </KpPage>
    );
}
