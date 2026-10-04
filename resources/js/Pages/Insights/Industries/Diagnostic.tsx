import { Link, router, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Info, RotateCcw } from 'lucide-react';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { AdvisorCard, ContextCard, IndustryFrame, NextSteps, StatusChips } from '@/Components/Insights/Industries';
import { Box, Chip, Notice, SmallLink } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';
import type { IndustryContextValue, IndustryPage } from '@/types/insights';

type Answers = Record<string, string | number | string[] | undefined>;
interface Score {
    overall: number | null;
    band: string;
    dimensions: { key: string; label: string; score: number | null }[];
    strengths: string[];
    improvements: string[];
    professionalRoute: boolean;
    complete: boolean;
}
interface Props {
    industry: IndustryPage;
    context: IndustryContextValue;
    run: { reference: string; step: number; status: string };
    step: number;
    steps: string[];
    answers: Answers;
    options: Record<'businessTypes' | 'stages' | 'years' | 'revenue' | 'markets' | 'valueChain' | 'employees', string[]>;
    readiness: { key: string; dimension: string; text: string }[];
    compliance: { key: string; text: string }[];
    score: Score;
    baseline: number;
}

function Gauge({ value }: { value: number | null }) {
    const v = value ?? 0;
    const c = 2 * Math.PI * 42;
    return (
        <div className="relative size-32">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e8e1d2" strokeWidth="9" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#2f9e5b" strokeWidth="9" strokeDasharray={`${(v / 100) * c} ${c}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-ink-900">{value ?? '—'}</span>
                <span className="text-[0.625rem] text-ink-500">/100</span>
            </div>
        </div>
    );
}

export default function SectorDiagnostic({ industry: ind, context, run, step, steps, answers, options, readiness, compliance, score, baseline }: Props) {
    const form = useForm<Answers & { step: number }>({ ...answers, step, markets: (answers.markets as string[]) ?? [] });
    const set = (k: string, v: string | number | string[]) => form.setData(k as never, v as never);
    const val = (k: string) => (form.data[k] as string | undefined) ?? '';
    const err = (k: string) => (form.errors as Record<string, string>)[k];
    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.transform((d) => ({ ...d, step }));
        form.post(`/industries/${ind.slug}/diagnostic`, { preserveScroll: true });
    };
    const preview = score.overall ?? baseline;

    return (
        <IndustryFrame
            title={`Sector-Adapted Diagnostic – ${ind.name}`}
            crumbs={[{ label: 'Home', href: '/' }, { label: 'Industries', href: '/industries' }, { label: ind.name, href: `/industries/${ind.slug}` }, { label: 'Diagnostic' }]}
            sidebar={
                <>
                    <ContextCard title="Your Diagnostic Context" context={context} rows={[['Diagnostic Version', 'v1.1'], ['Complexity Class', ind.complexityLabel], ['Estimated Time', '15 - 20 mins'], ['Reference', run.reference]]} />
                    <NextSteps title="What Happens Next?" items={['Complete all 5 diagnostic steps.', 'Receive your full scorecard.', 'Get tailored recommendations.', 'View relevant services and partners.', 'Move forward with TBCA support.']} cta={{ label: 'View Next Steps', href: `/industries/${ind.slug}` }} />
                    <AdvisorCard title="Need Expert Guidance?" text="Speak to a TBCA Advisor for a guided walkthrough of your results." />
                </>
            }
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="flex items-center gap-3 font-serif text-3xl font-bold text-ink-900">Sector-Adapted Diagnostic <Chip tone="green">Active</Chip></h1>
                    <p className="mt-1 font-semibold text-gold-700">AI-guided readiness, risk and routing assessment tailored to {ind.name}.</p>
                    <p className="text-sm text-ink-600">This diagnostic adapts questions, scoring and next steps to your industry, business stage and objectives.</p>
                </div>
                <StatusChips items={[{ label: 'Industry', value: ind.name }, { label: 'Mode', value: 'Active' }, { label: 'Complexity Class', value: ind.complexityLabel }, { label: 'Human', value: ind.professionalGate === 'mandatory' ? 'Mandatory' : 'Advisory' }]} />
            </div>

            <ol className="mt-5 flex flex-wrap gap-2" aria-label="Diagnostic steps">
                {steps.map((s, i) => {
                    const n = i + 1;
                    const reachable = n <= run.step || run.status === 'completed';
                    return (
                        <li key={s} className="flex-1">
                            <button
                                type="button"
                                disabled={!reachable || run.status === 'completed'}
                                onClick={() => router.get(`/industries/${ind.slug}/diagnostic`, { step: n }, { preserveScroll: true })}
                                aria-current={n === step ? 'step' : undefined}
                                className={cn('flex w-full items-center gap-2 border-b-2 py-2 text-left text-xs font-semibold', n === step ? 'border-gold-500 text-gold-800' : n < step ? 'border-verified-500 text-ink-700' : 'border-parchment-400 text-ink-400')}
                            >
                                <span className={cn('flex size-6 items-center justify-center rounded-full text-[0.6875rem]', n === step ? 'bg-gold-500 text-ink-900' : n < step ? 'bg-verified-500 text-white' : 'bg-parchment-300')}>{n}</span>
                                {s}
                            </button>
                        </li>
                    );
                })}
            </ol>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_1fr]">
                {step < 5 ? (
                    <form onSubmit={submit} className="rounded-[8px] border border-parchment-400 bg-white p-5" noValidate>
                        {step === 1 && (
                            <>
                                <h2 className="mb-4 text-lg font-semibold">Step 1: Tell Us About Your Business</h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Business / Project Name" required error={err('business_name')}>{(id) => <Input id={id} value={val('business_name')} onChange={(e) => set('business_name', e.target.value)} placeholder="e.g., GreenFields Fresh Produce (Pty) Ltd" />}</Field>
                                    <Field label="Business Type" required error={err('business_type')}>{(id) => <Select id={id} value={val('business_type')} onChange={(e) => set('business_type', e.target.value)} options={options.businessTypes} placeholder="Select business type" />}</Field>
                                    <Field label="Primary Activity" required error={err('primary_activity')}>{(id) => <Input id={id} value={val('primary_activity')} onChange={(e) => set('primary_activity', e.target.value)} placeholder="e.g., Maize Farming" />}</Field>
                                    <Field label="Stage of Business" required error={err('stage')}>{(id) => <Select id={id} value={val('stage')} onChange={(e) => set('stage', e.target.value)} options={options.stages} placeholder="Select stage" />}</Field>
                                    <Field label="Years in Operation" required error={err('years')}>{(id) => <Select id={id} value={val('years')} onChange={(e) => set('years', e.target.value)} options={options.years} placeholder="Select range" />}</Field>
                                    <Field label="Annual Revenue Range (ZAR)" required error={err('revenue')}>{(id) => <Select id={id} value={val('revenue')} onChange={(e) => set('revenue', e.target.value)} options={options.revenue} placeholder="Select range" />}</Field>
                                    <fieldset className="sm:col-span-2">
                                        <legend className="text-[0.8125rem] font-medium text-ink-800">Target Markets <span className="text-risk-500">*</span></legend>
                                        <div className="mt-1.5 flex flex-wrap gap-3">
                                            {options.markets.map((m) => {
                                                const list = (form.data.markets as string[]) ?? [];
                                                return <Checkbox key={m} label={m} checked={list.includes(m)} onChange={(e) => set('markets', e.target.checked ? [...list, m] : list.filter((x) => x !== m))} />;
                                            })}
                                        </div>
                                        {err('markets') && <p role="alert" className="text-xs text-risk-500">{err('markets')}</p>}
                                    </fieldset>
                                    <Field label="Primary Objective" required error={err('objective')} className="sm:col-span-2">{(id) => <Input id={id} value={val('objective')} onChange={(e) => set('objective', e.target.value)} placeholder="e.g., Expand exports, Raise capital, Improve productivity" />}</Field>
                                    <Field label="Brief Description of Your Business / Project" error={err('description')} className="sm:col-span-2">{(id) => <Textarea id={id} value={val('description')} onChange={(e) => set('description', e.target.value)} placeholder="Provide a short overview of what you do, your model and what you want to achieve..." />}</Field>
                                </div>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <h2 className="mb-4 text-lg font-semibold">Step 2: Industry Context</h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Sub-Industry" required error={err('sub_industry')}>{(id) => <Select id={id} value={val('sub_industry')} onChange={(e) => set('sub_industry', e.target.value)} options={ind.subIndustries.map((s) => ({ value: s.code, label: s.name }))} placeholder="Select sub-industry" />}</Field>
                                    <Field label="Position in the Value Chain" required error={err('value_chain')}>{(id) => <Select id={id} value={val('value_chain')} onChange={(e) => set('value_chain', e.target.value)} options={options.valueChain} placeholder="Select position" />}</Field>
                                    <Field label="Number of Employees" required error={err('employees')}>{(id) => <Select id={id} value={val('employees')} onChange={(e) => set('employees', e.target.value)} options={options.employees} placeholder="Select size" />}</Field>
                                    <Field label="Does your scope involve regulated activities (statutory audit, legal opinion, financial advice, export permits)?" required error={err('regulated_scope')}>{(id) => <Select id={id} value={val('regulated_scope')} onChange={(e) => set('regulated_scope', e.target.value)} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }, { value: 'unsure', label: 'Not sure' }]} placeholder="Select" />}</Field>
                                </div>
                            </>
                        )}
                        {step === 3 && (
                            <>
                                <h2 className="mb-1 text-lg font-semibold">Step 3: Readiness Assessment</h2>
                                <p className="mb-4 text-xs text-ink-500">Rate each statement: 1 = strongly disagree, 5 = strongly agree.</p>
                                <div className="space-y-3">
                                    {readiness.map((q) => (
                                        <fieldset key={q.key} className="rounded-[6px] border border-parchment-300 p-3">
                                            <legend className="px-1 text-[0.8125rem] text-ink-800">{q.text}</legend>
                                            <div className="mt-1 flex gap-2">
                                                {[1, 2, 3, 4, 5].map((n) => (
                                                    <label key={n} className={cn('flex size-9 cursor-pointer items-center justify-center rounded-full border text-sm font-semibold', Number(form.data[q.key]) === n ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-parchment-500')}>
                                                        <input type="radio" className="sr-only" name={q.key} value={n} checked={Number(form.data[q.key]) === n} onChange={() => set(q.key, n)} />
                                                        {n}
                                                    </label>
                                                ))}
                                            </div>
                                            {err(q.key) && <p role="alert" className="text-xs text-risk-500">Please rate this statement.</p>}
                                        </fieldset>
                                    ))}
                                </div>
                            </>
                        )}
                        {step === 4 && (
                            <>
                                <h2 className="mb-4 text-lg font-semibold">Step 4: Risk & Compliance</h2>
                                <div className="space-y-3">
                                    {compliance.map((q) => (
                                        <fieldset key={q.key} className="flex flex-col gap-2 rounded-[6px] border border-parchment-300 p-3 sm:flex-row sm:items-center sm:justify-between">
                                            <legend className="sr-only">{q.text}</legend>
                                            <span className="text-[0.8125rem] text-ink-800" aria-hidden="true">{q.text}</span>
                                            <div className="flex gap-1.5">
                                                {['yes', 'unsure', 'no'].map((o) => (
                                                    <label key={o} className={cn('cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold capitalize', form.data[q.key] === o ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-parchment-500')}>
                                                        <input type="radio" className="sr-only" name={q.key} value={o} checked={form.data[q.key] === o} onChange={() => set(q.key, o)} />
                                                        {o === 'unsure' ? 'Not sure' : o}
                                                    </label>
                                                ))}
                                            </div>
                                            {err(q.key) && <p role="alert" className="text-xs text-risk-500">Required.</p>}
                                        </fieldset>
                                    ))}
                                </div>
                            </>
                        )}
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-parchment-300 pt-4">
                            <p className="flex items-center gap-1.5 text-xs text-ink-500"><Info className="size-4" /> All information is confidential and used only to tailor your diagnostic and recommendations.</p>
                            <div className="flex gap-2">
                                {step > 1 && <Link href={`/industries/${ind.slug}/diagnostic?step=${step - 1}`} preserveScroll className="rounded-[4px] border border-parchment-500 px-4 py-2 text-xs font-bold uppercase">Back</Link>}
                                <button type="submit" disabled={form.processing} className="rounded-[4px] bg-gold-500 px-5 py-2 text-xs font-bold text-ink-900 uppercase">{step === 4 ? 'See Results' : 'Save & Continue'} →</button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                        <h2 className="text-lg font-semibold">Step 5: Results & Next Steps</h2>
                        <p className="text-xs text-ink-500">Reference {run.reference}. Free orientation and triage only — not a certification, regulated opinion or paid diagnostic report.</p>
                        {score.professionalRoute && (
                            <Notice className="mt-4" tone="red" title="Professional route recommended" action={<Link href={`/industries/${ind.slug}/partners`} className="rounded border bg-white px-3 py-1 text-xs font-semibold">Partner directory →</Link>}>
                                Your scope includes regulated or compliance-sensitive work. These elements must be delivered by verified professional partners.
                            </Notice>
                        )}
                        <h3 className="mt-4 text-sm font-semibold">Recommended next steps</h3>
                        <ul className="mt-2 space-y-2 text-[0.8125rem]">
                            {ind.skus.filter((s) => s.saleState === 'sellable').map((s) => (
                                <li key={s.slug}><Link className="font-semibold text-gold-700" href={`/industries/${ind.slug}/services/${s.slug}`}>{s.title}</Link> — {s.summary}</li>
                            ))}
                            {ind.sprints.slice(0, 3).map((s) => (
                                <li key={s.slug}><Link className="font-semibold text-gold-700" href={`/sprints/${s.slug}`}>{s.title}</Link> — Sprint</li>
                            ))}
                            <li><Link className="font-semibold text-gold-700" href={`/industries/${ind.slug}/benchmarks`}>Compare against sector benchmarks</Link></li>
                        </ul>
                        <button type="button" onClick={() => router.post(`/industries/${ind.slug}/diagnostic/restart`)} className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-ink-600"><RotateCcw className="size-4" /> Start a new diagnostic</button>
                    </div>
                )}

                <Box title={step === 5 ? 'Your Scorecard' : 'Diagnostic Preview'}>
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex flex-col items-center text-center">
                            <Gauge value={preview} />
                            <p className="mt-1 text-xs text-ink-500">Readiness Score</p>
                            <p className="font-semibold text-verified-700">{score.overall === null ? 'Sector baseline' : score.band}</p>
                            <p className="mt-1 max-w-[12rem] text-[0.6875rem] text-ink-500">{score.complete ? 'Based on your answers across all five dimensions.' : 'Indicative. Complete the full diagnostic to receive a tailored action plan.'}</p>
                        </div>
                        <div className="flex-1">
                            <p className="mb-2 text-xs font-semibold text-ink-600">Indicative Scores {score.complete ? '' : '(Preview)'}</p>
                            <ul className="space-y-2.5">
                                {score.dimensions.map((d) => (
                                    <li key={d.key} className="grid grid-cols-[8.5rem_1fr_3rem] items-center gap-2 text-xs">
                                        <span>{d.label}</span>
                                        <span className="h-2 overflow-hidden rounded-full bg-parchment-300"><span className="block h-full rounded-full bg-verified-500" style={{ width: `${d.score ?? 0}%` }} /></span>
                                        <span className="text-right font-semibold">{d.score ?? '—'}<span className="text-ink-400">/100</span></span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="mt-4 grid gap-4 border-t border-parchment-300 pt-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-semibold text-verified-700">Top Strengths</p>
                            <ul className="mt-2 space-y-1.5 text-xs">{(score.strengths.length ? score.strengths : ['Complete the readiness step to see strengths']).map((s) => <li key={s} className="flex gap-1.5"><CheckCircle2 className="size-4 shrink-0 text-verified-500" />{s}</li>)}</ul>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-attested-700">Key Areas to Improve</p>
                            <ul className="mt-2 space-y-1.5 text-xs">{(score.improvements.length ? score.improvements : ['No gaps identified yet']).map((s) => <li key={s} className="flex gap-1.5"><AlertTriangle className="size-4 shrink-0 text-attested-500" />{s}</li>)}</ul>
                        </div>
                    </div>
                    {step === 5 && <SmallLink className="mt-3" href={`/industries/${ind.slug}/benchmarks`}>View benchmark preview</SmallLink>}
                </Box>
            </div>
        </IndustryFrame>
    );
}
