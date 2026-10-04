import type { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Info, Lock, Minus, Plus } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { FlowSteps, NextSteps, ShopCrumbs, SideCard, TrustStrip, zar } from '@/Components/Shop/Bits';
import { Glance } from '@/Components/Shop/ProductTabs';
import { cn } from '@/lib/cn';
import type { Option, ShopCard } from '@/types/shop';

type Data = Record<string, unknown>;
type Opt = Option & { hint?: string };
interface Props {
    proposal: { reference: string; step: number; data: Data };
    product: ShopCard | null;
    estimate: number | null;
    rates: Record<string, number>;
    readiness: Record<string, boolean>;
    step: number;
    steps: string[];
    options: { scopes: string[]; industries: string[]; jurisdictions: string[]; models: Opt[]; communication: string[]; units: string[]; unused: Opt[]; overage: Opt[]; seniority: Opt[]; owner_models: Opt[]; slas: string[]; terms: number[] };
}

const str = (d: Data, k: string) => (d[k] === null || d[k] === undefined ? '' : String(d[k]));
const arr = (d: Data, k: string) => (Array.isArray(d[k]) ? (d[k] as string[]) : []);
const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

function Radios({ name, options, value, onChange }: { name: string; options: Opt[]; value: string; onChange: (v: string) => void }) {
    return (
        <div role="radiogroup" aria-label={name} className="space-y-2">
            {options.map((o) => (
                <label key={o.value} className="flex cursor-pointer items-start gap-2 text-[0.8125rem] text-ink-700">
                    <input type="radio" name={name} className="mt-1 accent-verified-700" checked={value === o.value} onChange={() => onChange(o.value)} />
                    <span>{o.label}{o.hint && <span className="text-ink-400"> ({o.hint})</span>}</span>
                </label>
            ))}
        </div>
    );
}

function Nav({ step, processing, label = 'Save & Continue' }: { step: number; processing: boolean; label?: string }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            {step > 1 ? <ButtonLink href={`/shop/retainer-proposal/${step - 1}`} variant="outline"><ArrowLeft className="size-4" /> Back</ButtonLink> : <span className="flex items-center gap-1.5 text-xs text-ink-500"><Info className="size-4" /> This proposal will include our Capacity & Suitability (C1-C5) assessment in the next step.</span>}
            <button type="submit" disabled={processing} className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-verified-700 px-5 text-sm font-semibold text-white hover:bg-verified-500 disabled:opacity-50">{label} <ArrowRight className="size-4" /></button>
        </div>
    );
}

export default function RetainerProposal({ proposal, product, estimate, rates, readiness, step, steps, options }: Props) {
    const d = proposal.data;
    const form = useForm<Record<string, string | number | boolean | string[]>>({
        scope: arr(d, 'scope'), scope_other: str(d, 'scope_other'), start_date: str(d, 'start_date'), objectives: str(d, 'objectives'), industry: str(d, 'industry'), jurisdiction: str(d, 'jurisdiction'),
        entities: Number(d.entities ?? 1), engagement_model: str(d, 'engagement_model'), communication: arr(d, 'communication'),
        allowance: str(d, 'allowance') || '20', unit: str(d, 'unit'), scope_bounds: str(d, 'scope_bounds'), exclusions: str(d, 'exclusions'), unused: str(d, 'unused') || 'forfeit', overage: str(d, 'overage') || 'billed_at_rate',
        seniority: str(d, 'seniority'), owner_model: str(d, 'owner_model'), preferred_adviser: str(d, 'preferred_adviser'), response_sla: str(d, 'response_sla'), term_months: str(d, 'term_months'),
        accept_estimate: false, budget_note: str(d, 'budget_note'), contact_name: str(d, 'contact_name'), contact_email: str(d, 'contact_email'), contact_phone: str(d, 'contact_phone'), confirm: false,
    });
    const v = form.data;
    const e = form.errors as Record<string, string | undefined>;
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(`/shop/retainer-proposal/${step}`, { preserveScroll: true }); };
    const set = (k: string, val: string | number | boolean | string[]) => form.setData(k, val);
    const live = step === 2 || step === 3 ? Math.max(24500, Math.round((Number(v.allowance) || 0) * (rates[String(v.seniority) || 'senior'] ?? 2225) * (1 + 0.1 * (Number(v.entities) - 1)) / 100) * 100) : estimate;

    return (
        <>
            <Head title="Retainer Proposal Builder" />
            <div className="container-tbca py-6">
                <ShopCrumbs tone="light" items={[{ label: 'Online Shop', href: '/shop' }, { label: 'Retainers', href: '/shop/aisle/retainers-advisory-desks' }, { label: 'Retainer Proposal Builder' }]} />
                <div className="grid gap-6 lg:grid-cols-12">
                    <form onSubmit={submit} noValidate className="min-w-0 space-y-5 lg:col-span-8">
                        <div className="flex flex-wrap items-center gap-3"><h1 className="font-serif text-[1.875rem] font-semibold text-ink-900">Retainer Proposal Builder</h1><span className="inline-flex items-center gap-1 text-sm font-semibold text-verified-700"><Lock className="size-4" /> Secure Checkout</span></div>
                        <p className="-mt-3 text-sm text-ink-600">Build your custom retainer proposal. All proposals are subject to capacity and scope confirmation.</p>
                        <FlowSteps current={step} done={proposal.step - 1} steps={steps.map((t) => ({ title: t }))} />

                        {step === 1 && (
                            <SideCard title="1. Define Your Needs">
                                <p className="-mt-2 mb-4 text-xs text-ink-500">Tell us what you need and we'll structure a retainer that fits.</p>
                                <div className="grid gap-4 lg:grid-cols-3">
                                    <fieldset className="rounded-[6px] border border-parchment-400 p-3">
                                        <legend className="px-1 text-xs font-semibold text-ink-900">Engagement Scope</legend>
                                        <p className="text-[0.6875rem] text-ink-500">Select primary service areas (choose all that apply)</p>
                                        <div className="mt-2 space-y-2">{options.scopes.map((s) => <Checkbox key={s} label={s} checked={arr(v, 'scope').includes(s)} onChange={() => set('scope', toggle(arr(v, 'scope'), s))} />)}</div>
                                        <Input className="mt-2" aria-label="Other scope" placeholder="Describe other needs..." value={String(v.scope_other)} onChange={(x) => set('scope_other', x.target.value)} />
                                        {e.scope && <p className="mt-1 text-xs text-risk-500">{e.scope}</p>}
                                        <Field label="Preferred Start Date" error={e.start_date} className="mt-3">{(id) => <Input id={id} type="date" value={String(v.start_date)} onChange={(x) => set('start_date', x.target.value)} />}</Field>
                                    </fieldset>
                                    <div className="space-y-3">
                                        <Field label="Tell Us More" error={e.objectives} required hint="Briefly describe your key objectives and what success looks like.">{(id) => <Textarea id={id} value={String(v.objectives)} onChange={(x) => set('objectives', x.target.value)} />}</Field>
                                        <Field label="Industry" error={e.industry} required>{(id) => <Select id={id} options={options.industries} value={String(v.industry)} onChange={(x) => set('industry', x.target.value)} />}</Field>
                                        <Field label="Jurisdiction" error={e.jurisdiction} required>{(id) => <Select id={id} options={options.jurisdictions} value={String(v.jurisdiction)} onChange={(x) => set('jurisdiction', x.target.value)} />}</Field>
                                        <div><p className="text-[0.8125rem] font-medium text-ink-800">Operating Entities</p><div className="mt-1 inline-flex items-center rounded border border-parchment-500"><button type="button" aria-label="Fewer entities" onClick={() => set('entities', Math.max(1, Number(v.entities) - 1))} className="p-2"><Minus className="size-4" /></button><span className="w-8 text-center font-semibold">{String(v.entities)}</span><button type="button" aria-label="More entities" onClick={() => set('entities', Math.min(20, Number(v.entities) + 1))} className="p-2"><Plus className="size-4" /></button></div></div>
                                    </div>
                                    <div className="space-y-4">
                                        <fieldset><legend className="text-xs font-semibold text-ink-900">Engagement Model</legend><p className="mb-2 text-[0.6875rem] text-ink-500">How would you like to work with us?</p><Radios name="engagement_model" options={options.models} value={String(v.engagement_model)} onChange={(x) => set('engagement_model', x)} /></fieldset>
                                        <fieldset><legend className="text-xs font-semibold text-ink-900">Communication Preference</legend><div className="mt-2 space-y-2">{options.communication.map((c) => <Checkbox key={c} label={c} checked={arr(v, 'communication').includes(c)} onChange={() => set('communication', toggle(arr(v, 'communication'), c))} />)}</div>{e.communication && <p className="text-xs text-risk-500">{e.communication}</p>}</fieldset>
                                    </div>
                                </div>
                            </SideCard>
                        )}
                        {step === 2 && (
                            <SideCard title="2. Allowance & C1-C5">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field label="C1 Quantified Allowance (per month)" error={e.allowance} required>{(id) => <Input id={id} type="number" min={5} max={160} value={String(v.allowance)} onChange={(x) => set('allowance', x.target.value)} />}</Field>
                                    <Field label="Allowance Unit" error={e.unit} required>{(id) => <Select id={id} options={options.units} value={String(v.unit)} onChange={(x) => set('unit', x.target.value)} />}</Field>
                                    <Field label="C2 Bounded Scope" error={e.scope_bounds} required>{(id) => <Textarea id={id} value={String(v.scope_bounds)} placeholder="What the retainer covers" onChange={(x) => set('scope_bounds', x.target.value)} />}</Field>
                                    <Field label="C2 Exclusions" error={e.exclusions}>{(id) => <Textarea id={id} value={String(v.exclusions)} placeholder="What is out of scope" onChange={(x) => set('exclusions', x.target.value)} />}</Field>
                                    <fieldset><legend className="mb-2 text-xs font-semibold text-ink-900">C4 Unused Treatment</legend><Radios name="unused" options={options.unused} value={String(v.unused)} onChange={(x) => set('unused', x)} /></fieldset>
                                    <fieldset><legend className="mb-2 text-xs font-semibold text-ink-900">C5 Overage Treatment</legend><Radios name="overage" options={options.overage} value={String(v.overage)} onChange={(x) => set('overage', x)} /></fieldset>
                                </div>
                            </SideCard>
                        )}
                        {step === 3 && (
                            <SideCard title="3. Adviser & Capacity">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <fieldset><legend className="mb-2 text-xs font-semibold text-ink-900">Adviser Seniority</legend><Radios name="seniority" options={options.seniority.map((s) => ({ ...s, hint: `${zar(rates[s.value])}/hr` }))} value={String(v.seniority)} onChange={(x) => set('seniority', x)} /></fieldset>
                                    <fieldset><legend className="mb-2 text-xs font-semibold text-ink-900">C3 Reserved Capacity Owner</legend><Radios name="owner_model" options={options.owner_models} value={String(v.owner_model)} onChange={(x) => set('owner_model', x)} /></fieldset>
                                    <Field label="Preferred adviser (optional)" error={e.preferred_adviser}>{(id) => <Input id={id} value={String(v.preferred_adviser)} onChange={(x) => set('preferred_adviser', x.target.value)} />}</Field>
                                    <Field label="Response SLA" error={e.response_sla} required>{(id) => <Select id={id} options={options.slas} value={String(v.response_sla)} onChange={(x) => set('response_sla', x.target.value)} />}</Field>
                                    <Field label="Term (months)" error={e.term_months} required>{(id) => <Select id={id} options={options.terms.map((t) => ({ value: String(t), label: `${t} months` }))} value={String(v.term_months)} onChange={(x) => set('term_months', x.target.value)} />}</Field>
                                </div>
                            </SideCard>
                        )}
                        {step === 4 && (
                            <SideCard title="4. Pricing & Proposal">
                                <Glance rows={[['Allowance (C1)', `${str(d, 'allowance')} ${str(d, 'unit')} / month`], ['Seniority', str(d, 'seniority')], ['Entities', str(d, 'entities')], ['Unused (C4)', str(d, 'unused')], ['Overage (C5)', str(d, 'overage')], ['Term', `${str(d, 'term_months')} months`]]} />
                                <p className="mt-4 rounded-[6px] bg-verified-50 p-3 text-sm">Estimated Monthly Fee (Excl. VAT): <strong className="text-lg text-verified-700">{zar(estimate ?? 0)}</strong><span className="block text-xs text-ink-500">Allowance x seniority rate, +10% per additional entity, never below the R24 500 floor. Final pricing is confirmed after capacity review.</span></p>
                                <Field label="Budget notes (optional)" error={e.budget_note} className="mt-3">{(id) => <Textarea id={id} value={String(v.budget_note)} onChange={(x) => set('budget_note', x.target.value)} />}</Field>
                                <Checkbox className="mt-3" checked={Boolean(v.accept_estimate)} onChange={(x) => set('accept_estimate', x.target.checked)} label="I understand this is an indicative estimate subject to capacity and scope confirmation." />
                                {e.accept_estimate && <p className="text-xs text-risk-500">{e.accept_estimate}</p>}
                            </SideCard>
                        )}
                        {step === 5 && (
                            <SideCard title="5. Review & Submit">
                                <Glance rows={[['Scope', arr(d, 'scope').join(', ')], ['Industry', str(d, 'industry')], ['Jurisdiction', str(d, 'jurisdiction')], ['Engagement model', str(d, 'engagement_model')], ['Allowance', `${str(d, 'allowance')} ${str(d, 'unit')}`], ['Adviser', str(d, 'seniority')], ['SLA', str(d, 'response_sla')], ['Estimate', zar(estimate ?? 0) + ' / month']]} />
                                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                    <Field label="Contact name" error={e.contact_name} required>{(id) => <Input id={id} value={String(v.contact_name)} onChange={(x) => set('contact_name', x.target.value)} />}</Field>
                                    <Field label="Contact email" error={e.contact_email} required>{(id) => <Input id={id} type="email" value={String(v.contact_email)} onChange={(x) => set('contact_email', x.target.value)} />}</Field>
                                    <Field label="Phone" error={e.contact_phone}>{(id) => <Input id={id} value={String(v.contact_phone)} onChange={(x) => set('contact_phone', x.target.value)} />}</Field>
                                </div>
                                <Checkbox className="mt-3" checked={Boolean(v.confirm)} onChange={(x) => set('confirm', x.target.checked)} label="Submitting this request does not start a Retainer and no payment is taken now." />
                                {e.confirm && <p className="text-xs text-risk-500">{e.confirm}</p>}
                            </SideCard>
                        )}
                        <Nav step={step} processing={form.processing} label={step === 5 ? 'Submit for Approval' : 'Save & Continue'} />
                    </form>

                    <aside className="space-y-4 lg:col-span-4">
                        <SideCard title="Proposal Summary (Draft)" action={<span className="text-xs text-ink-400">Not Submitted</span>}>
                            <div className="flex gap-3"><ShopIcon name={product?.icon ?? 'users-round'} size="sm" /><div className="text-xs"><p className="font-semibold text-ink-900">{product?.name ?? 'Custom Retainer Proposal'}</p><p>Licence: RE - Retainer Engagement</p><p className="text-ink-400">Ref {proposal.reference}</p></div></div>
                            <dl className="mt-3 space-y-1 text-xs"><div className="flex justify-between"><dt>Estimated Monthly Fee (Excl. VAT)</dt><dd>{live ? zar(live) : 'TBC'}</dd></div><div className="flex justify-between"><dt>VAT (15%)</dt><dd>{live ? zar(Math.round(live * 0.15)) : 'TBC'}</dd></div></dl>
                            <p className="mt-2 flex justify-between border-t border-parchment-300 pt-2 font-semibold">Estimated Total (Incl. VAT)<span className="text-verified-700">{live ? zar(Math.round(live * 1.15)) : 'TBC'}</span></p>
                        </SideCard>
                        <SideCard title="C1-C5 Readiness">
                            <p className="-mt-2 mb-3 text-xs text-ink-500">Completed in steps 2 and 3.</p>
                            <ul className="grid grid-cols-5 gap-2 text-center">
                                {[['C1', 'Capacity'], ['C2', 'Capability'], ['C3', 'Conflicts'], ['C4', 'Continuity'], ['C5', 'Commercial']].map(([k, l]) => (
                                    <li key={k}><span className={cn('mx-auto flex size-11 items-center justify-center rounded-full border-2 text-sm font-bold', readiness[k] ? 'border-verified-500 bg-verified-50 text-verified-700' : 'border-parchment-500 text-ink-500')}>{k}</span><span className="text-[0.625rem] text-ink-500">{l}</span></li>
                                ))}
                            </ul>
                        </SideCard>
                        <SideCard title="What happens next?"><NextSteps steps={[['Assessment', 'Complete allowance and C1-C5 assessment.'], ['Capacity', "We'll confirm adviser availability and suitability."], ['Proposal', 'Receive your tailored proposal and pricing.'], ['Approval', 'Review and submit for approval.']]} /></SideCard>
                    </aside>
                </div>
            </div>
            <TrustStrip items={[{ title: 'Capacity Matched', body: 'We only propose what we can deliver.' }, { title: 'Transparent Pricing', body: 'No hidden fees. No surprises.' }, { title: 'Governance First', body: 'C1-C5 ensures a strong, compliant fit.' }, { title: 'Human Oversight', body: 'Every proposal is reviewed by our experts.' }]} />
        </>
    );
}

