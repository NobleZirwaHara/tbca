import { Head, Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ClipboardCheck, FileSearch, Info, Lock, ShieldCheck, Users } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { CheckList, Notice, PageTitle } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import type { SharedProps } from '@/types';

interface Props {
    prefill: Record<string, string>;
    options: { sectors: string[]; stages: string[]; bands: string[]; studies: string[]; decisions: string[]; timelines: string[]; routes: Record<string, string>; countries: string[] };
    p03: number;
}

/** Mirrors MandateWorkflow::signals() so the panel updates as the client types. */
function signals(d: Record<string, string>) {
    const stage = ['Feasibility', 'Structuring', 'Funding Readiness', 'Implementation'].includes(d.project_stage) ? 'High' : d.project_stage ? 'Medium' : 'Low';
    const evidence = ['Feasibility study completed', 'Full investor pack'].includes(d.existing_studies) ? 'High' : d.existing_studies === 'Pre-feasibility or concept note' ? 'Medium' : 'Low';
    const funding = ['Fully Funded', 'Part-Funded'].includes(d.funding_status) ? 'High' : d.funding_status === 'Seeking' ? 'Medium' : 'Low';
    const attention = evidence === 'Low' || d.capital === 'Over R1bn' || d.country !== 'South Africa' ? 'High' : 'Medium';
    return { 'Stage Clarity': stage, 'Evidence Status': evidence, 'Funding Clarity': funding, 'Reviewer Attention': attention };
}
const sigTone = (v: string, inverse = false) => ((v === 'High') !== inverse ? 'bg-verified-50 text-verified-700' : v === 'Medium' ? 'bg-attested-50 text-attested-700' : 'bg-risk-50 text-risk-700');

export default function Discovery({ prefill, options, p03 }: Props) {
    const price = usePrice();
    const { flash } = usePage<SharedProps>().props;
    const form = useForm({ entry: 'intake', organisation: prefill.organisation, contact: prefill.contact, email: prefill.email, country: prefill.country, sector: prefill.sector, project_stage: prefill.project_stage, project_name: prefill.project_name, description: '', capital: prefill.capital, existing_studies: '', funding_status: '', decision: '', timeline: '', route: prefill.route });
    const e = form.errors as Record<string, string>;
    const go = (entry: 'intake' | 'discovery') => (ev?: FormEvent) => {
        ev?.preventDefault();
        form.transform((d) => ({ ...d, entry }));
        form.post('/project-advisory/discovery', { preserveScroll: true });
    };
    const sig = signals(form.data);
    return (
        <div className="container-tbca py-8">
            <Head title="Discovery Request & Qualification" />
            <div className="grid gap-5 lg:grid-cols-12">
                <div className="lg:col-span-9">
                    <PageTitle crumbs={[{ label: 'Project Advisory', href: '/project-advisory' }, { label: 'Discovery Request' }]} title="Discovery Request & Qualification" sub={<><p className="font-semibold text-gold-700">Choose the right entry route for your project. Free routing or paid structured discovery.</p><p>Start with our free Project Intake to confirm eligibility and likely routing. If your project requires deeper qualification, select the paid Structured Discovery & Diagnostic for human-reviewed insight, an initial evidence map and a clear Method Card before any fees are confirmed.</p></>} />
                    {flash.reference && <Notice tone={flash.error ? 'bad' : 'good'} className="mb-4">Reference <b className="font-mono">{flash.reference}</b> recorded. {flash.success ?? flash.error}</Notice>}
                    <div className="grid gap-4 md:grid-cols-2">
                        <section className="rounded-[8px] border border-gold-300 bg-white p-5">
                            <h2 className="font-serif text-lg font-semibold">P01 Project Intake & Eligibility Screen</h2>
                            <p className="mt-1 text-3xl font-bold">R0 <span className="rounded bg-verified-50 px-2 text-sm text-verified-700">Free</span></p>
                            <p className="text-sm font-semibold">Routing and eligibility only</p>
                            <CheckList className="mt-2" items={['Captures basic project context', 'Checks fit with our ecosystems', 'Suggests likely next route and options', 'No professional work product delivered']} />
                            <Button className="mt-4 w-full" onClick={() => go('intake')()} disabled={form.processing} trailingIcon="arrow-right">Submit Project Intake</Button>
                        </section>
                        <section className="rounded-[8px] border border-gold-300 bg-white p-5">
                            <h2 className="font-serif text-lg font-semibold">P03 Structured Discovery & Diagnostic</h2>
                            <p className="mt-1 text-3xl font-bold text-gold-700">{price(p03)} <span className="rounded bg-gold-100 px-2 text-sm text-gold-800">Paid professional work</span></p>
                            <p className="text-sm font-semibold">Includes structured discovery, diagnostic, initial evidence map and Method Card</p>
                            <CheckList className="mt-2" items={['Deeper qualification of viability and readiness', 'Human-reviewed discovery by specialists', 'Initial evidence mapping and risk insights', 'Structured next-stage recommendation']} />
                            <Button className="mt-4 w-full" onClick={() => go('discovery')()} disabled={form.processing} trailingIcon="arrow-right">Purchase Structured Discovery</Button>
                        </section>
                    </div>
                    <form onSubmit={go('intake')} className="mt-5 rounded-[8px] border border-parchment-400 bg-white p-5">
                        <h2 className="font-semibold">Project Qualification Details</h2>
                        <div className="mt-3 grid gap-3 md:grid-cols-4">
                            <Field label="1. Organisation" required error={e.organisation}>{(id) => <Input id={id} value={form.data.organisation} onChange={(x) => form.setData('organisation', x.target.value)} placeholder="Enter organisation name" />}</Field>
                            <Field label="2. Sponsor / Primary Contact" required error={e.contact}>{(id) => <Input id={id} value={form.data.contact} onChange={(x) => form.setData('contact', x.target.value)} placeholder="Name and title" />}</Field>
                            <Field label="Contact email" required error={e.email}>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(x) => form.setData('email', x.target.value)} />}</Field>
                            <Field label="Project name" error={e.project_name}>{(id) => <Input id={id} value={form.data.project_name} onChange={(x) => form.setData('project_name', x.target.value)} />}</Field>
                            <Field label="3. Country" required error={e.country}>{(id) => <Select id={id} value={form.data.country} onChange={(x) => form.setData('country', x.target.value)} options={options.countries} />}</Field>
                            <Field label="4. Sector" required error={e.sector}>{(id) => <Select id={id} value={form.data.sector} onChange={(x) => form.setData('sector', x.target.value)} placeholder="Select sector" options={options.sectors} />}</Field>
                            <Field label="5. Project Stage" required error={e.project_stage}>{(id) => <Select id={id} value={form.data.project_stage} onChange={(x) => form.setData('project_stage', x.target.value)} placeholder="Select stage" options={options.stages} />}</Field>
                            <Field label="7. Capital Requirement (ZAR)" required error={e.capital}>{(id) => <Select id={id} value={form.data.capital} onChange={(x) => form.setData('capital', x.target.value)} placeholder="Select range" options={options.bands} />}</Field>
                            <Field label="6. Project Description" className="md:col-span-2" error={e.description}>{(id) => <Textarea id={id} value={form.data.description} onChange={(x) => form.setData('description', x.target.value)} placeholder="Briefly describe the project, objectives and context" className="min-h-16" />}</Field>
                            <Field label="8. Existing Studies / Documents">{(id) => <Select id={id} value={form.data.existing_studies} onChange={(x) => form.setData('existing_studies', x.target.value)} placeholder="Select applicable" options={options.studies} />}</Field>
                            <Field label="11. Timeline" required error={e.timeline}>{(id) => <Select id={id} value={form.data.timeline} onChange={(x) => form.setData('timeline', x.target.value)} placeholder="Select timeline" options={options.timelines} />}</Field>
                            <fieldset className="md:col-span-2">
                                <legend className="text-[0.8125rem] font-medium">9. Funding Status <span className="text-risk-500">*</span></legend>
                                <div className="mt-1 flex flex-wrap gap-3 text-sm">
                                    {['Not Started', 'Seeking', 'Part-Funded', 'Fully Funded'].map((f) => <label key={f} className="flex items-center gap-1.5"><input type="radio" name="funding" checked={form.data.funding_status === f} onChange={() => form.setData('funding_status', f)} className="accent-gold-600" />{f}</label>)}
                                </div>
                                {e.funding_status && <p className="text-xs text-risk-500">{e.funding_status}</p>}
                            </fieldset>
                            <Field label="10. Key Decision Required" required error={e.decision}>{(id) => <Select id={id} value={form.data.decision} onChange={(x) => form.setData('decision', x.target.value)} placeholder="Select key decision" options={options.decisions} />}</Field>
                            <Field label="12. Preferred Engagement Route" required error={e.route}>{(id) => <Select id={id} value={form.data.route} onChange={(x) => form.setData('route', x.target.value)} options={Object.entries(options.routes).map(([value, label]) => ({ value, label }))} />}</Field>
                        </div>
                    </form>
                    <div className="mt-4 grid gap-3 rounded-[8px] border border-gold-300 bg-white p-4 sm:grid-cols-4">
                        {[[ShieldCheck, 'You approve before we charge', 'No fees are charged without your written approval.'], [FileSearch, 'Method before money', 'We show you the method, scope and pricing before we begin.'], [Users, 'Human review where required', 'Specialists review complex work and provide accountable decisions.'], [ClipboardCheck, 'Published pricing', 'Clear, published pricing in ZAR with no hidden fees.']].map(([I, t, b]) => {
                            const Icon = I as typeof ShieldCheck;
                            return <div key={t as string} className="flex gap-2"><Icon className="size-6 shrink-0 text-gold-600" /><p className="text-xs"><b className="block">{t as string}</b>{b as string}</p></div>;
                        })}
                    </div>
                    <p className="mt-3 flex items-center gap-2 rounded bg-controlled-50 px-3 py-2 text-xs text-controlled-700"><Info className="size-4" />Free intake (P01) is for routing and eligibility only. Paid diagnostic (P03) includes professional work product: structured discovery, initial evidence map and Method Card.</p>
                </div>
                <aside className="space-y-4 lg:col-span-3">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4"><h2 className="font-serif text-lg">What Happens Next</h2>
                        <ol className="mt-2 space-y-2 text-xs">{[['Receive & Acknowledge', 'We confirm receipt and assign a reviewer.'], ['Review & Qualification', 'We assess context, clarity and evidentiary gaps.'], ['Recommend Next Route', 'We propose the best next step and engagement.'], ['You Approve & Proceed', 'You approve scope and pricing before we start.']].map(([t, b], i) => <li key={t} className="flex gap-2"><span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-gold-500 text-[0.625rem]">{i + 1}</span><span><b>{t}</b><br />{b}</span></li>)}</ol>
                    </div>
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs"><h2 className="font-serif text-lg">Confidentiality & Privacy Controls</h2>
                        <p className="mt-2 flex gap-2"><Lock className="size-4 text-gold-600" /><span><b>Secure Handling</b><br />Enterprise-grade security for all submissions.</span></p>
                        <p className="mt-2 flex gap-2"><ShieldCheck className="size-4 text-gold-600" /><span><b>POPIA-Aware Controls</b><br />We collect only what we need and protect it.</span></p>
                        <p className="mt-2 flex gap-2"><Users className="size-4 text-gold-600" /><span><b>Need-to-Know Requests</b><br />Sensitive evidence is requested only when needed.</span></p>
                    </div>
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4"><h2 className="font-serif text-lg">Qualification Signals</h2><p className="text-[0.6875rem] text-ink-500">Updates live as you complete the form.</p>
                        <dl className="mt-2 space-y-1.5 text-xs">{Object.entries(sig).map(([k, v]) => <div key={k} className="flex justify-between"><dt>{k}</dt><dd className={cn('rounded px-2 font-semibold', sigTone(v, k === 'Reviewer Attention'))}>{v}</dd></div>)}</dl>
                    </div>
                    <Link href="/project-advisory/workspace" className="block text-center text-xs font-semibold text-gold-700 underline">Go to my advisory workspace</Link>
                </aside>
            </div>
        </div>
    );
}
