import { router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { BtnLink, btnClass } from '@/Components/Webinars/kit';
import { AiDisclosure, BASE, Box, Field, Input, KpPage, Meter, RuleNote, Select, Textarea, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';

interface ChallengeInput {
    decision: string;
    rationale: string;
    options: string;
    amount: number | null;
    horizon: number;
    reversibility: string;
    evidence: string[];
}

interface Result {
    challenges: { area: string; sev: 'high' | 'medium' | 'low'; q: string; why: string }[];
    missing: string[];
    readiness: number;
    verdict: string;
    tone: 'red' | 'orange' | 'green';
    options: string[];
    boardQuestions: string[];
}

interface Props extends KpShared {
    input: ChallengeInput;
    evidenceOptions: { key: string; label: string }[];
    result: Result | null;
}

const SEV = { high: 'bg-risk-50 text-risk-700 border-risk-500/40', medium: 'bg-attested-50 text-attested-700 border-attested-500/40', low: 'bg-parchment-200 text-ink-700 border-parchment-500' };
const VERDICT = { red: 'border-risk-500/40 bg-risk-50', orange: 'border-attested-500/40 bg-attested-50', green: 'border-verified-500/40 bg-verified-50' };

/** KP-SCR-021 Boardroom Challenger. It challenges; it cannot approve investment or board decisions. KP supplied no mockup for this screen. */
export default function Challenger({ screen, kpNav, input, evidenceOptions, result }: Props) {
    const price = usePrice();
    const [f, setF] = useState<ChallengeInput>(input);
    const run = () => router.get(`${BASE}/boardroom-challenger`, { ...f, amount: f.amount ?? '' } as never, { preserveScroll: true });
    const areas = result ? [...new Set(result.challenges.map((c) => c.area))] : [];

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['KP Knowledge Assistant', `${BASE}/ask`], ['Boardroom Challenger']]}
            title="Boardroom Challenger"
            subtitle="Challenge the decision before the board does."
            intro="Describe a decision. The Challenger tests the strategy, numbers, risks, evidence and governance, and lists the questions a good board would ask."
            left={
                <form className="space-y-3 rounded-[10px] border border-parchment-400 bg-white p-4" onSubmit={(e) => { e.preventDefault(); run(); }}>
                    <h2 className="font-serif font-bold text-ink-900">The Decision</h2>
                    <Field label="Decision to be taken"><Textarea rows={3} required maxLength={300} value={f.decision} onChange={(e) => setF({ ...f, decision: e.target.value })} placeholder="e.g. Open a second processing plant in Limpopo" /></Field>
                    <Field label="Rationale (optional)"><Textarea rows={3} maxLength={1000} value={f.rationale} onChange={(e) => setF({ ...f, rationale: e.target.value })} /></Field>
                    <Field label="Options considered" hint="One option per line, including doing nothing."><Textarea rows={3} maxLength={1000} value={f.options} onChange={(e) => setF({ ...f, options: e.target.value })} /></Field>
                    <Field label="Amount at stake (ZAR)" hint={f.amount ? `Shown in your currency: ${price(f.amount)}` : undefined}><Input type="number" min={0} value={f.amount ?? ''} onChange={(e) => setF({ ...f, amount: e.target.value === '' ? null : Number(e.target.value) })} /></Field>
                    <Field label="Review horizon (months)"><Input type="number" min={1} max={240} value={f.horizon} onChange={(e) => setF({ ...f, horizon: Number(e.target.value) || 12 })} /></Field>
                    <Field label="How reversible is it?"><Select value={f.reversibility} onChange={(e) => setF({ ...f, reversibility: e.target.value })} options={[{ value: 'reversible', label: 'Easy to reverse' }, { value: 'costly', label: 'Reversible at a cost' }, { value: 'irreversible', label: 'Hard or impossible to reverse' }]} /></Field>
                    <fieldset>
                        <legend className="text-[0.8125rem] font-semibold text-ink-800">Evidence you already have</legend>
                        {evidenceOptions.map((o) => <label key={o.key} className="mt-1 flex items-center gap-2 text-[0.8125rem]"><input type="checkbox" className="size-4 accent-referenced-500" checked={f.evidence.includes(o.key)} onChange={() => setF({ ...f, evidence: f.evidence.includes(o.key) ? f.evidence.filter((x) => x !== o.key) : [...f.evidence, o.key] })} />{o.label}</label>)}
                    </fieldset>
                    <button type="submit" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[6px] bg-referenced-500 font-semibold text-white">Challenge This Decision <L.ArrowRight className="size-4" /></button>
                </form>
            }
            rail={
                <>
                    <RuleNote icon="scale" title="No autonomous approval">
                        <p>The Challenger cannot approve an investment or a board decision. It prepares questions; directors decide.</p>
                    </RuleNote>
                    <Box title="Related Tools">
                        <ul className="space-y-1.5 text-[0.8125rem]">
                            <li><a href={`${BASE}/decision-sheet`} className="hover:text-gold-700">Decision Sheet</a></li>
                            <li><a href={`${BASE}/tools/checklists/go-no-go`} className="hover:text-gold-700">Decision Checklist</a></li>
                            <li><a href={`${BASE}/project-fatal-flaw`} className="hover:text-gold-700">Project Fatal-Flaw Explorer</a></li>
                            <li><a href={`${BASE}/tools/calculators/investment-case`} className="hover:text-gold-700">Investment Case Calculator</a></li>
                        </ul>
                    </Box>
                    <Box title="Need a Facilitated Board Dialogue?" tone="cream">
                        <p className="text-[0.8125rem]">An Executive Board Dialogue brings an experienced facilitator into the room.</p>
                        <BtnLink href={`${BASE}/book?offer=board-dialogue`} className="mt-2 w-full" icon="arrow-right">Request a Board Dialogue</BtnLink>
                    </Box>
                </>
            }
        >
            {!result ? (
                <section className="rounded-[12px] border border-dashed border-referenced-500/40 bg-white p-8 text-center">
                    <L.Scale className="mx-auto size-10 text-referenced-500" aria-hidden="true" />
                    <p className="mt-3 font-serif text-[1.25rem] font-bold text-ink-900">Describe the decision to begin</p>
                    <p className="mt-1 text-[0.875rem] text-ink-600">The more evidence you list, the fewer challenges you will face. Nothing you type is stored.</p>
                </section>
            ) : (
                <>
                    <div className={cn('grid gap-4 rounded-[12px] border p-5 sm:grid-cols-[minmax(0,1fr)_14rem]', VERDICT[result.tone])}>
                        <div>
                            <p className="text-[0.75rem] font-bold tracking-wider text-ink-600 uppercase">Challenger verdict</p>
                            <p className="font-serif text-[1.5rem] font-bold text-ink-900">{result.verdict}</p>
                            <p className="mt-1 text-[0.875rem] text-ink-700">{input.decision}{input.amount ? ` | ${price(input.amount)} at stake` : ''}</p>
                        </div>
                        <div>
                            <p className="flex justify-between text-[0.8125rem] font-semibold text-ink-900">Evidence readiness <span>{result.readiness}%</span></p>
                            <Meter value={result.readiness} tone={result.readiness >= 70 ? 'green' : result.readiness >= 40 ? 'orange' : 'red'} className="mt-1" />
                            <p className="mt-2 text-[0.75rem] text-ink-600">{result.challenges.filter((c) => c.sev === 'high').length} high-severity challenges</p>
                        </div>
                    </div>

                    {areas.map((area) => (
                        <Box key={area} title={area} icon={{ Strategy: 'target', Numbers: 'calculator', Risks: 'triangle-alert', Evidence: 'file-check', Governance: 'scale' }[area] ?? 'circle-dot'}>
                            <ul className="space-y-2">
                                {result.challenges.filter((c) => c.area === area).map((c) => (
                                    <li key={c.q} className="rounded-[8px] border border-parchment-400 p-3">
                                        <p className="flex items-start gap-2 text-[0.875rem] font-semibold text-ink-900"><span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[0.625rem] font-bold uppercase', SEV[c.sev])}>{c.sev}</span>{c.q}</p>
                                        <p className="mt-1 text-[0.75rem] text-ink-500">{c.why}</p>
                                    </li>
                                ))}
                            </ul>
                        </Box>
                    ))}

                    <div className="grid gap-4 md:grid-cols-2">
                        <Box title="Top Five Board Questions" icon="list-checks" tone="purple">
                            <ol className="list-decimal space-y-1.5 pl-5 text-[0.8125rem]">{result.boardQuestions.map((q) => <li key={q}>{q}</li>)}</ol>
                        </Box>
                        <Box title="Missing Evidence" icon="file-check">
                            {result.missing.length ? <ul className="space-y-1.5 text-[0.8125rem]">{result.missing.map((m) => <li key={m} className="flex gap-2"><L.CircleDashed className="mt-0.5 size-4 shrink-0 text-attested-500" aria-hidden="true" />{m}</li>)}</ul> : <p className="text-[0.8125rem]">All listed evidence types are in place.</p>}
                            {result.options.length > 0 && <p className="mt-3 text-[0.75rem] text-ink-600">Options on the table: {result.options.join('; ')}.</p>}
                        </Box>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => window.print()} className={btnClass('outline', 'sm')}><L.Printer className="size-3.5" />Print challenge pack</button>
                        <BtnLink href={`${BASE}/decision-sheet`} size="sm" icon="arrow-right">Record in a Decision Sheet</BtnLink>
                    </div>
                    <AiDisclosure>Rule-based challenge generated from your inputs (Voice A). It is not advice and it does not approve any decision.</AiDisclosure>
                </>
            )}
        </KpPage>
    );
}
