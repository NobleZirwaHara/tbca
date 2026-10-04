import { useForm } from '@inertiajs/react';
import { CheckCircle2, ClipboardList, FileSearch, ShieldCheck, Users } from 'lucide-react';
import type { FormEvent } from 'react';
import { HumanLed } from '@/Components/Aiim/EngagementKit';
import AiimPage, { RailBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Checkbox, ChoiceCard, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Stepper } from '@/Components/ui/Kit';
import { Button, ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

type Req = Record<string, any>;

interface Props extends AiimPageProps {
    type: 'custom-intelligence' | 'advisory';
    engagement: { reference: string; status: string; step: number; request: Req } | null;
    step: number;
    options: {
        categories: string[]; areas: string[]; depths: { value: string; label: string; description: string; time: string }[];
        provinces: { slug: string; name: string }[]; sectors: { slug: string; name: string }[];
        seniority: string[]; timelines: string[]; engagementTypes: string[]; formats: string[];
    };
}

const CI_STEPS = ['Request Details', 'Scope & Focus', 'Context & Background', 'Delivery Preferences', 'Review & Submit'];
const AD_STEPS = ['Request Details', 'Advisor Preferences', 'Context & Background', 'Scope of Engagement', 'Review & Submit'];
const OUTPUTS = ['Written report (PDF)', 'Data tables / dataset', 'Maps & visuals', 'Stakeholder list', 'Advisory call'];
const EXPERTISE = ['Energy & Infrastructure', 'Investment Strategy', 'Project Finance', 'Public Policy', 'Market Entry', 'Due Diligence'];

function Multi({ label, options, value, onChange, error }: { label: string; options: { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void; error?: string }) {
    return (
        <fieldset>
            <legend className="mb-1 text-[0.8125rem] font-medium text-ink-800">{label}</legend>
            <div className="grid gap-1.5 sm:grid-cols-2">{options.map((o) => <Checkbox key={o.value} checked={value.includes(o.value)} onChange={() => onChange(value.includes(o.value) ? value.filter((x) => x !== o.value) : [...value, o.value])} label={o.label} />)}</div>
            {error && <p role="alert" className="mt-1 text-xs text-risk-500">{error}</p>}
        </fieldset>
    );
}

export default function RequestWizard({ type, engagement, step, options }: Props) {
    const ci = type === 'custom-intelligence';
    const r: Req = engagement?.request ?? {};
    const form = useForm<Req>({
        type, step, ref: engagement?.reference ?? '', draft: false,
        title: r.title ?? '', detail: r.detail ?? '', category: r.category ?? '', subcategory: r.subcategory ?? '', provinces: r.provinces ?? [], sectors: r.sectors ?? [], depth: r.depth ?? 'standard',
        questions: r.questions ?? '', outputs: r.outputs ?? [], background: r.background ?? '', decision: r.decision ?? '', format: r.format ?? '', required_by: r.required_by ?? '', channel: r.channel ?? 'Workspace + email',
        areas: r.areas ?? [], other: r.other ?? '', summary: r.summary ?? '', expertise: r.expertise ?? [], seniority: r.seniority ?? '', engagement_type: r.engagement_type ?? '', timeline: r.timeline ?? '', start_date: r.start_date ?? '', terms: false,
    });
    const d = form.data;
    const set = (k: string, v: unknown) => form.setData(k, v);
    const submit = (draft: boolean) => (e?: FormEvent) => { e?.preventDefault(); form.transform((x) => ({ ...x, draft })); form.post('/aiim/workspace/engagements/request'); };
    const base = ci ? '/aiim/custom-intelligence' : '/aiim/workspace/advisor-request';
    const sectorOpts = options.sectors.map((s) => ({ value: s.slug, label: s.name }));
    const provOpts = options.provinces.map((s) => ({ value: s.slug, label: s.name }));
    const names = (slugs: string[], list: { slug: string; name: string }[]) => slugs.map((s) => list.find((x) => x.slug === s)?.name ?? s).join(', ') || '—';
    const e = form.errors as Record<string, string>;

    const review: [string, string][] = ci
        ? [['Request Title', d.title], ['Intelligence Category', `${d.category}${d.subcategory ? ` — ${d.subcategory}` : ''}`], ['Geographic Focus', 'South Africa'], ['Province Focus', names(d.provinces, options.provinces)], ['Sectors', names(d.sectors, options.sectors)], ['Intelligence Depth', options.depths.find((x) => x.value === d.depth)?.label ?? d.depth], ['Key Questions', d.questions], ['Expected Outputs', (d.outputs as string[]).join(', ')], ['Delivery Preference', d.format], ['Required By', d.required_by || 'To be confirmed after expert review'], ['Customer Notes / Background', d.background]]
        : [['Advisory Areas', (d.areas as string[]).join(', ')], ['Summary', d.summary], ['Advisor Expertise', (d.expertise as string[]).join(', ')], ['Industries', names(d.sectors, options.sectors)], ['Seniority', d.seniority || 'Any'], ['Background', d.background], ['Provinces', names(d.provinces, options.provinces)], ['Engagement Type', d.engagement_type], ['Estimated Timeline', d.timeline], ['Preferred Start Date', d.start_date || '—']];

    return (
        <AiimPage
            title={ci ? (step === 5 ? 'Custom Request Review' : 'Custom Intelligence Request') : 'Advisor Request'}
            crumbs={ci ? [{ label: 'Custom Intelligence' }, { label: step === 5 ? 'Custom Request Review' : 'Custom Intelligence Request' }] : [{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Advisor Services' }, { label: 'Advisor Request' }]}
            heading={<>{ci ? (step === 5 ? 'Custom Request Review' : 'Custom Intelligence Request') : 'Advisor Request'} {ci ? <FileSearch className="size-7 text-referenced-500" /> : <Users className="size-7 text-referenced-500" />}</>}
            subtitle={ci ? (step === 5 ? 'Review your custom intelligence request before submission.' : 'Request tailored intelligence for your investment decision.') : 'Connect with a trusted TBCA expert for strategic advisory and deal support.'}
            description={ci ? 'Our AIIM experts, AI agents and trusted data partners will research and deliver custom insights based on your exact requirements.' : 'Submit your request and our team will match you with the right expert.'}
            accent="purple"
            notice={ci ? <HumanLed title="Human-reviewed & verified" text="All custom intelligence is reviewed by TBCA experts. Delivery timelines and fees are confirmed after review." /> : <HumanLed />}
            rail={
                <>
                    <SelectionBox />
                    <RailBox title="What happens next?">
                        <ol className="space-y-1.5 text-xs text-ink-200">{['Submit your request', 'TBCA expert review (within 1 business day)', 'Discovery / clarification call', 'Detailed scope and formal quotation', 'Delivery after acceptance and deposit'].map((t, i) => <li key={t} className="flex gap-2"><CheckCircle2 className="size-3.5 text-referenced-500" />{i + 1}. {t}</li>)}</ol>
                    </RailBox>
                </>
            }
        >
            <SectionCard className="mb-4"><Stepper steps={ci ? CI_STEPS : AD_STEPS} current={step} /></SectionCard>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem]">
                <form onSubmit={submit(false)} noValidate className="space-y-4">
                    {ci && step === 1 && (
                        <div className="grid gap-4 lg:grid-cols-2">
                            <SectionCard number={1} title="What do you need intelligence on?">
                                <div className="space-y-3">
                                    <Field label="Request Title" error={e.title} required>{(id) => <Input id={id} value={d.title} onChange={(x) => set('title', x.target.value)} placeholder="e.g. Renewable energy opportunities in the Eastern Cape" />}</Field>
                                    <Field label="Detailed Request" error={e.detail} hint={`${d.detail.length}/2000 characters`} required>{(id) => <Textarea id={id} rows={6} maxLength={2000} value={d.detail} onChange={(x) => set('detail', x.target.value)} placeholder="Provide a clear description of the intelligence you require, including key questions you need answered…" />}</Field>
                                </div>
                            </SectionCard>
                            <div className="space-y-4">
                                <SectionCard number={2} title="Intelligence Category">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Field label="Primary category" error={e.category} required>{(id) => <Select id={id} value={d.category} onChange={(x) => set('category', x.target.value)} options={options.categories} placeholder="Choose a category" />}</Field>
                                        <Field label="Sub-category (optional)">{(id) => <Input id={id} value={d.subcategory} onChange={(x) => set('subcategory', x.target.value)} />}</Field>
                                    </div>
                                </SectionCard>
                                <SectionCard number={3} title="Geographic Focus">
                                    <p className="mb-2 text-xs">Country: <strong>South Africa</strong> <span className="text-ink-500">(the only active Phase 1 country)</span></p>
                                    <Multi label="Provinces (select one or more)" options={provOpts} value={d.provinces} onChange={(v) => set('provinces', v)} error={e.provinces} />
                                </SectionCard>
                                <SectionCard number={4} title="Sector Focus"><Multi label="Select one or more sectors" options={sectorOpts} value={d.sectors} onChange={(v) => set('sectors', v)} error={e.sectors} /></SectionCard>
                                <SectionCard number={5} title="Intelligence Depth">
                                    <div role="radiogroup" className="space-y-2">{options.depths.map((o) => <ChoiceCard key={o.value} selected={d.depth === o.value} onSelect={() => set('depth', o.value)} title={o.label} description={`${o.description} · ${o.time}`} />)}</div>
                                </SectionCard>
                            </div>
                        </div>
                    )}
                    {ci && step === 2 && (
                        <SectionCard title="Scope & Focus">
                            <div className="space-y-3">
                                <Field label="Key questions to answer" error={e.questions} required>{(id) => <Textarea id={id} value={d.questions} onChange={(x) => set('questions', x.target.value)} />}</Field>
                                <Multi label="Expected outputs" options={OUTPUTS.map((o) => ({ value: o, label: o }))} value={d.outputs} onChange={(v) => set('outputs', v)} error={e.outputs} />
                            </div>
                        </SectionCard>
                    )}
                    {step === 3 && (
                        <SectionCard title="Context & Background">
                            <div className="space-y-3">
                                <Field label="Background" error={e.background} hint="What are you exploring and why?" required>{(id) => <Textarea id={id} rows={6} value={d.background} onChange={(x) => set('background', x.target.value)} />}</Field>
                                {ci ? <Field label="Decision this intelligence supports" error={e.decision} required>{(id) => <Input id={id} value={d.decision} onChange={(x) => set('decision', x.target.value)} placeholder="e.g. Investment committee screening" />}</Field>
                                    : <Multi label="Geographic experience required (provinces)" options={provOpts} value={d.provinces} onChange={(v) => set('provinces', v)} />}
                            </div>
                        </SectionCard>
                    )}
                    {ci && step === 4 && (
                        <SectionCard title="Delivery Preferences">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <Field label="Output format" error={e.format} required>{(id) => <Select id={id} value={d.format} onChange={(x) => set('format', x.target.value)} options={options.formats} placeholder="Select format" />}</Field>
                                <Field label="Required by (optional)" error={e.required_by}>{(id) => <Input id={id} type="date" value={d.required_by} onChange={(x) => set('required_by', x.target.value)} />}</Field>
                                <Field label="Delivery channel" error={e.channel} required>{(id) => <Select id={id} value={d.channel} onChange={(x) => set('channel', x.target.value)} options={['Workspace + email', 'Workspace only', 'Advisor presentation']} />}</Field>
                            </div>
                        </SectionCard>
                    )}
                    {!ci && step === 1 && (
                        <div className="grid gap-4 lg:grid-cols-2">
                            <SectionCard title="What type of advisory support do you need?">
                                <Multi label="Select one or more areas" options={options.areas.map((a) => ({ value: a, label: a }))} value={d.areas} onChange={(v) => set('areas', v)} error={e.areas} />
                                {(d.areas as string[]).includes('Other (please specify)') && <Field label="Please specify" error={e.other} className="mt-2">{(id) => <Input id={id} value={d.other} onChange={(x) => set('other', x.target.value)} />}</Field>}
                            </SectionCard>
                            <SectionCard title="Tell us about your request"><Field label="Brief summary of your objectives and key questions" error={e.summary} hint={`${d.summary.length}/2000`} required>{(id) => <Textarea id={id} rows={7} maxLength={2000} value={d.summary} onChange={(x) => set('summary', x.target.value)} placeholder="Describe your goals, challenges and what you would like to achieve…" />}</Field></SectionCard>
                        </div>
                    )}
                    {!ci && step === 2 && (
                        <SectionCard title="Preferred Advisor Profile">
                            <div className="space-y-3">
                                <Multi label="Advisor expertise (select all that apply)" options={EXPERTISE.map((x) => ({ value: x, label: x }))} value={d.expertise} onChange={(v) => set('expertise', v)} error={e.expertise} />
                                <Multi label="Industry experience" options={sectorOpts} value={d.sectors} onChange={(v) => set('sectors', v)} error={e.sectors} />
                                <Field label="Preferred advisor seniority">{(id) => <Select id={id} value={d.seniority} onChange={(x) => set('seniority', x.target.value)} options={options.seniority} placeholder="Select seniority level" />}</Field>
                            </div>
                        </SectionCard>
                    )}
                    {!ci && step === 4 && (
                        <SectionCard title="Engagement Preferences">
                            <div className="grid gap-3 sm:grid-cols-3">
                                <Field label="Preferred engagement type" error={e.engagement_type} required>{(id) => <Select id={id} value={d.engagement_type} onChange={(x) => set('engagement_type', x.target.value)} options={options.engagementTypes} placeholder="Select type" />}</Field>
                                <Field label="Estimated timeline" error={e.timeline} required>{(id) => <Select id={id} value={d.timeline} onChange={(x) => set('timeline', x.target.value)} options={options.timelines} placeholder="Select timeline" />}</Field>
                                <Field label="Preferred start date" error={e.start_date}>{(id) => <Input id={id} type="date" value={d.start_date} onChange={(x) => set('start_date', x.target.value)} />}</Field>
                            </div>
                        </SectionCard>
                    )}
                    {step === 5 && (
                        <>
                            <SectionCard title="Request Summary"><dl className="space-y-1.5 text-sm">{review.map(([k, v]) => <div key={k} className="grid gap-2 sm:grid-cols-[12rem_1fr]"><dt className="text-ink-500">{k}</dt><dd className="whitespace-pre-line">{v || '—'}</dd></div>)}</dl></SectionCard>
                            <SectionCard title="Scope, Deliverables and Review Notes">
                                <dl className="space-y-2 text-xs">{[['Expected Outputs', 'Comprehensive PDF report with data-backed insights, maps, tables, and key recommendations.'], ['Data-Source Treatment', 'AI synthesis using verified public sources; proprietary or restricted data only if authorised.'], ['Analyst Review', 'Human expert review by the TBCA Advisory Team before delivery.'], ['Assumptions', 'Information is based on current public availability and may change; subject to clarification.']].map(([k, v]) => <div key={k} className="grid gap-2 sm:grid-cols-[10rem_1fr]"><dt className="font-semibold">{k}</dt><dd className="text-ink-600">{v}</dd></div>)}</dl>
                                <p className="mt-3 rounded border border-referenced-500/30 bg-referenced-50 p-2 text-xs text-referenced-700"><strong>Verification Note:</strong> AI output is support material only and does not constitute a final professional conclusion. Final insights are subject to human expert review and client clarification.</p>
                                <Checkbox className="mt-3" checked={d.terms} onChange={(x) => set('terms', x.target.checked)} label="I confirm the information is accurate and understand no fees are charged before quotation approval." />
                                {e.terms && <p role="alert" className="text-xs text-risk-500">{e.terms}</p>}
                            </SectionCard>
                        </>
                    )}
                    <div className="flex flex-wrap justify-between gap-3">
                        {step > 1 ? <ButtonLink href={`${base}?ref=${engagement?.reference ?? ''}&step=${step - 1}`} variant="outline">{step === 5 ? 'Back to Edit' : 'Back'}</ButtonLink> : <ButtonLink href="/aiim/workspace" variant="outline">Cancel</ButtonLink>}
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={submit(true)} disabled={form.processing}>Save Draft</Button>
                            <Button type="submit" disabled={form.processing} className="!bg-referenced-500 !border-referenced-500 !text-white" trailingIcon="arrow-right">{step === 5 ? 'Submit Request' : step === 1 && !ci ? 'Continue to Advisor Preferences' : 'Save & Continue'}</Button>
                        </div>
                    </div>
                </form>
                <div className="space-y-4">
                    <SectionCard title="Your Request Summary">
                        <dl className="space-y-1.5 text-xs">{[['Request Type', ci ? 'Custom Intelligence' : 'Advisor Request'], ['Geographic Focus', 'South Africa'], ['Sectors', d.sectors.length ? `${d.sectors.length} selected` : 'Not selected'], [ci ? 'Depth' : 'Engagement Type', ci ? d.depth : d.engagement_type || 'Not selected'], ['Estimated Delivery', 'To be confirmed']].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium capitalize">{v}</dd></div>)}</dl>
                        <p className="mt-3 text-xs text-ink-500">Estimated Investment</p>
                        <p className="text-xl font-bold text-referenced-700">Quote on Review</p>
                        <p className="text-xs text-ink-400">(Excl. VAT)</p>
                    </SectionCard>
                    {step === 5 && (
                        <SectionCard title="Commercial Review">
                            <p className="mb-2 text-xs font-semibold text-referenced-700">Board-provisional / quote-required</p>
                            <dl className="space-y-1 text-xs">{[['TBCA Expert', 'Quote Required'], ['TBCA Platform', 'Quote Required'], ['External Supplier Cost', 'If Required'], ['TBCA External Administration', 'If Applicable'], ['VAT', 'Applicable at invoicing']].map(([k, v]) => <div key={k} className="flex justify-between"><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
                            <p className="mt-2 flex gap-1 text-xs text-ink-500"><ShieldCheck className="size-3.5 shrink-0" />No fees are charged before approval. Pricing is provisional and subject to scope confirmation.</p>
                        </SectionCard>
                    )}
                    <p className="flex items-center gap-1 text-xs text-ink-400"><ClipboardList className="size-3.5" />{engagement ? `Draft ${engagement.reference}` : 'Not saved yet'}</p>
                </div>
            </div>
        </AiimPage>
    );
}
