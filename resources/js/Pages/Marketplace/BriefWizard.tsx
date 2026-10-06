import { Head, Link, router, useForm } from '@inertiajs/react';
import { CheckCircle2, ClipboardList, FileText, Save, Scale, ShieldCheck, Target, Users, Wallet } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, InfoRows, Notice, zarCode } from '@/Components/Marketplace/ui';
import { cn } from '@/lib/cn';
import type { Option } from '@/types/marketplace';

interface Props {
    step: number;
    steps: string[];
    reference: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
    options: {
        categories: Option[]; skills: string[]; budgets: Option[]; deadlines: Option[]; industries: Option[]; countries: Option[]; intendedUse: Option[];
        urgency: Option[]; complexity: Option[]; stages: Option[]; dataClass: Option[]; vdr: Option[]; sources: Option[]; profiles: Option[];
    };
    estimate: { a: number; b: number; c: number; floor_status: string } | null;
}

const subs = ['What you need', 'Your objectives', 'Deliverables & constraints', 'Investment & schedule', 'Confirm & submit'];
const icons = [FileText, Users, Scale, Wallet, ShieldCheck];

export default function BriefWizard({ step, steps, reference, data, options, estimate }: Props) {
    const form = useForm<Record<string, any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
{
        title: '', description: '', industry: '', country: '', intended_use: '', source: '', category: '', profile: '', urgency: '', budget: '', delivery_date: '',
        data_class: '', vdr: '', constraints: '', files: [] as string[], outcome: '', stage: '', background: '', stakeholders: '', scope: '', deliverables: '',
        skills: [] as string[], complexity: '', exclusions: '', deadline: '', procurement: '', authority: '', confirm_not_atp: false, confirm_accuracy: false,
        ...data,
    });
    const v = (k: string) => (form.data[k] as string) ?? '';
    const err = (k: string) => form.errors[k as keyof typeof form.errors];
    const set = (k: string) => (e: { target: { value: string } }) => form.setData(k, e.target.value);
    const opt = (list: Option[], val: string) => list.find((o) => o.value === val)?.label ?? val;
    const sel = (k: string, label: string, list: Option[], req = true) => (
        <Field label={label} required={req} error={err(k)}>{(id) => <Select id={id} value={v(k)} options={list} placeholder="Select" onChange={set(k)} />}</Field>
    );
    const submit = (e: React.FormEvent) => { e.preventDefault(); form.post(`/marketplace/brief/${step}`, { preserveScroll: true }); };
    const saveDraft = () => router.post(`/marketplace/brief/${step}`, { ...form.data, save_draft: 1 }, { preserveScroll: true });
    const skills = (form.data.skills as string[]) ?? [];

    return (
        <>
            <Head title="Submit Your Marketplace Brief" />
            <section className="bg-white py-8">
                <div className="container-tbca">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Marketplace', href: '/marketplace' }, { label: 'Submit Marketplace Brief' }]} />
                    <div className="grid gap-6 lg:grid-cols-12">
                        <div className="lg:col-span-9">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="max-w-2xl">
                                    <h1 className="font-serif text-3xl font-bold text-ink-900 md:text-4xl">Submit Your Marketplace Brief</h1>
                                    <p className="mt-2 text-ink-600">Tell us what you need, your goals, timeline and budget. We'll review your brief and match you with the right specialists.</p>
                                    {data.package_label && (
                                        <p className="mt-3 rounded-[6px] border border-gold-300/60 bg-gold-50 px-3 py-2 text-sm text-ink-800">
                                            Based on <Link href={`/marketplace/services/${data.service}?package=${data.package}`} className="font-semibold text-controlled-600 underline">{data.service_title}</Link>
                                            {' '}– <strong>{data.package_label} Package</strong> ({zarCode(data.package_price_zar)}{data.package_delivery ? ` · ${data.package_delivery}` : ''})
                                        </p>
                                    )}
                                </div>
                                <div className="rounded-[8px] border border-gold-300/60 bg-parchment-100 px-4 py-3 text-xs">
                                    <p><span className="text-ink-500">Brief ID:</span> <strong>{reference ?? '(Auto-generated)'}</strong></p>
                                    <p><span className="text-ink-500">Status:</span> <strong>Draft</strong></p>
                                </div>
                            </div>
                            <ol className="mt-6 grid grid-cols-5 gap-2">
                                {steps.map((s, i) => {
                                    const I = icons[i];
                                    const n = i + 1;
                                    return (
                                        <li key={s} className={cn('border-t-2 pt-2', n <= step ? 'border-gold-500' : 'border-parchment-400')}>
                                            {n < step ? (
                                                <Link href={`/marketplace/brief/${n}`} className="flex items-start gap-2"><CheckCircle2 className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span className="hidden text-xs font-semibold text-ink-900 md:block">{s}</span></Link>
                                            ) : (
                                                <div className="flex items-start gap-2" aria-current={n === step ? 'step' : undefined}>
                                                    <I className={cn('size-5 shrink-0', n === step ? 'text-gold-600' : 'text-ink-300')} aria-hidden="true" />
                                                    <span className="hidden md:block"><span className={cn('block text-xs font-semibold', n === step ? 'text-ink-900' : 'text-ink-400')}>{n}. {s}</span><span className="text-[0.6875rem] text-ink-400">{subs[i]}</span></span>
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>

                            <form onSubmit={submit} className="mt-6 rounded-[8px] border border-parchment-400 p-5">
                                <h2 className="mb-4 text-sm font-bold tracking-wide text-gold-700 uppercase">{step}. {steps[step - 1]}</h2>
                                {step === 1 && (
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-4">
                                            <Field label="Business Need / Title" required hint={`${v('title').length} / 120`} error={err('title')}>{(id) => <Input id={id} maxLength={120} value={v('title')} onChange={set('title')} placeholder="e.g., Market entry strategy for solar EPC in Kenya" />}</Field>
                                            <Field label="Describe Your Need in Detail" required hint={`${v('description').length} / 1000`} error={err('description')}>{(id) => <Textarea id={id} maxLength={1000} value={v('description')} onChange={set('description')} placeholder="Provide a clear description of the work you require, challenges you face and outcomes you expect..." />}</Field>
                                            {sel('industry', 'Preferred Industry / Sector', options.industries)}
                                            {sel('country', 'Country / Countries of Interest', options.countries)}
                                            {sel('intended_use', 'Intended Use of the Work', options.intendedUse)}
                                            {sel('source', 'How Did You Hear About Us?', options.sources, false)}
                                        </div>
                                        <div className="space-y-4">
                                            {sel('category', 'Type of Work / Service Category', options.categories)}
                                            {sel('profile', 'Preferred Specialist Profile', options.profiles, false)}
                                            {sel('urgency', 'Urgency / Priority', options.urgency)}
                                            {sel('budget', 'Budget Range (ZAR)', options.budgets)}
                                            <Field label="Files (Optional)" hint="List document names (PDF, DOCX, XLSX, PPTX, ZIP · max 20MB each). Files are uploaded to the controlled workspace after scoping.">
                                                {(id) => <Textarea id={id} value={((form.data.files as string[]) ?? []).join('\n')} onChange={(e) => form.setData('files', e.target.value.split('\n').filter(Boolean))} placeholder="Financial_Model_v3.xlsx" />}
                                            </Field>
                                        </div>
                                        <div className="space-y-4">
                                            <Field label="Desired Timeline / Delivery Date" required error={err('delivery_date')}>{(id) => <Input id={id} type="date" value={v('delivery_date')} onChange={set('delivery_date')} />}</Field>
                                            {sel('data_class', 'Data Classification', options.dataClass)}
                                            {sel('vdr', 'VDR Requirement', options.vdr)}
                                            <Field label="Are There Any Known Constraints?" hint={`${v('constraints').length} / 500`} error={err('constraints')}>{(id) => <Textarea id={id} maxLength={500} value={v('constraints')} onChange={set('constraints')} placeholder="Regulatory, technical, budget, access or other constraints..." />}</Field>
                                        </div>
                                    </div>
                                )}
                                {step === 2 && (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Desired Outcome / Objective" required className="md:col-span-2" error={err('outcome')}>{(id) => <Textarea id={id} maxLength={600} value={v('outcome')} onChange={set('outcome')} placeholder="What decision or result should this work enable?" />}</Field>
                                        {sel('stage', 'Business Stage', options.stages)}
                                        <Field label="Key Stakeholders" error={err('stakeholders')}>{(id) => <Input id={id} value={v('stakeholders')} onChange={set('stakeholders')} placeholder="e.g. Board, lender, investment committee" />}</Field>
                                        <Field label="Background & Context" className="md:col-span-2" error={err('background')}>{(id) => <Textarea id={id} maxLength={1000} value={v('background')} onChange={set('background')} />}</Field>
                                    </div>
                                )}
                                {step === 3 && (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Field label="Scope of Work" required hint="One item per line" error={err('scope')}>{(id) => <Textarea id={id} rows={6} value={v('scope')} onChange={set('scope')} placeholder={'Market and commercial assessment\nFinancial model review'} />}</Field>
                                        <Field label="Expected Deliverables" required hint="One per line" error={err('deliverables')}>{(id) => <Textarea id={id} rows={6} value={v('deliverables')} onChange={set('deliverables')} placeholder={'Commercial feasibility memo\nExecutive briefing PDF'} />}</Field>
                                        <fieldset className="md:col-span-2">
                                            <legend className="mb-2 text-[0.8125rem] font-medium text-ink-800">Required Skills <span className="text-risk-500">*</span></legend>
                                            <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
                                                {options.skills.map((s) => <Checkbox key={s} label={s} checked={skills.includes(s)} onChange={() => form.setData('skills', skills.includes(s) ? skills.filter((x) => x !== s) : [...skills, s])} />)}
                                            </div>
                                            {err('skills') && <p role="alert" className="mt-1 text-xs text-risk-500">{err('skills')}</p>}
                                        </fieldset>
                                        {sel('complexity', 'Project Complexity', options.complexity)}
                                        <Field label="Known Exclusions" error={err('exclusions')}>{(id) => <Input id={id} value={v('exclusions')} onChange={set('exclusions')} placeholder="e.g. No legal opinion" />}</Field>
                                    </div>
                                )}
                                {step === 4 && (
                                    <div className="grid gap-4 md:grid-cols-3">
                                        {sel('deadline', 'Deadline Window', options.deadlines)}
                                        <Field label="Procurement Requirement" required error={err('procurement')}>{(id) => <Select id={id} value={v('procurement')} onChange={set('procurement')} placeholder="Select" options={['Subcontracting permitted with disclosure only', 'Named subcontractor approval required', 'Prior written approval required', 'No procurement restriction']} />}</Field>
                                        <Field label="Budget Authority" required error={err('authority')}>{(id) => <Input id={id} value={v('authority')} onChange={set('authority')} placeholder="e.g. Managing Director" />}</Field>
                                        {estimate && (
                                            <div className="md:col-span-3">
                                                <Notice tone="gold">
                                                    <p className="font-semibold">Indicative separated ledgers for this category</p>
                                                    <p>Ledger A {zarCode(estimate.a)} · Ledger B {zarCode(estimate.b)} · Ledger C {zarCode(estimate.c)} (capped estimate). Final envelope is issued after TBCA review — no blended total.</p>
                                                </Notice>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {step === 5 && (
                                    <div className="space-y-4">
                                        <InfoRows rows={[
                                            ['Business Need', v('title')], ['Category', opt(options.categories, v('category'))], ['Industry / Country', `${v('industry')} · ${v('country')}`],
                                            ['Intended Use', v('intended_use')], ['Urgency', opt(options.urgency, v('urgency'))], ['Budget', opt(options.budgets, v('budget'))], ['Delivery Date', v('delivery_date')],
                                            ['Data Class / VDR', `${opt(options.dataClass, v('data_class'))} · ${opt(options.vdr, v('vdr'))}`], ['Outcome', v('outcome')], ['Skills', skills.join(', ')],
                                            ['Complexity / Deadline', `${opt(options.complexity, v('complexity'))} · ${opt(options.deadlines, v('deadline'))}`], ['Procurement', v('procurement')],
                                        ]} />
                                        <Checkbox label="I understand that submitting this brief is not an Authority to Proceed and no payment is taken now." checked={!!form.data.confirm_not_atp} onChange={(e) => form.setData('confirm_not_atp', e.target.checked)} />
                                        {err('confirm_not_atp') && <p role="alert" className="text-xs text-risk-500">{err('confirm_not_atp')}</p>}
                                        <Checkbox label="I confirm the brief is accurate and I have authority to request this work." checked={!!form.data.confirm_accuracy} onChange={(e) => form.setData('confirm_accuracy', e.target.checked)} />
                                        {err('confirm_accuracy') && <p role="alert" className="text-xs text-risk-500">{err('confirm_accuracy')}</p>}
                                    </div>
                                )}
                                <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-parchment-300 pt-4">
                                    {step > 1 && <Link href={`/marketplace/brief/${step - 1}`} className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 px-5 text-sm">Back</Link>}
                                    <Button type="button" variant="outline" onClick={saveDraft}><Save className="size-4" aria-hidden="true" /> Save Draft</Button>
                                    <Button type="submit" disabled={form.processing} trailingIcon="arrow-right">{step === 5 ? 'Submit Brief' : 'Next Step'}</Button>
                                </div>
                            </form>
                        </div>
                        <aside className="space-y-4 lg:col-span-3">
                            <Card title="About This Brief">
                                <p className="mb-2 text-sm text-ink-600">Your brief helps us:</p>
                                <ul className="space-y-1.5 text-sm text-ink-700">{['Understand your needs clearly', 'Match you with the right specialists', 'Provide accurate scope & pricing', 'Deliver results on time and on budget'].map((x) => <li key={x} className="flex gap-2"><CheckCircle2 className="size-4 text-gold-600" aria-hidden="true" />{x}</li>)}</ul>
                            </Card>
                            <Card title="Important Notice">
                                <p className="text-sm text-ink-600">Submitting this brief is not an Authority to Proceed. You will review and approve scope, fees, and specialists before any work begins.</p>
                                <p className="mt-2 text-sm text-ink-600">All fees are disclosed separately:</p>
                                <ul className="mt-1 space-y-1 text-sm">{[['A', 'TBCA Professional Fees'], ['B', 'Platform & Administration Fees'], ['C', 'Third-Party / External Costs']].map(([l, t]) => <li key={l} className="flex gap-2"><span className="flex size-5 items-center justify-center rounded bg-gold-100 text-xs font-bold text-gold-800">{l}</span>{t}</li>)}</ul>
                            </Card>
                            <Card title="Need Help?">
                                <p className="text-sm text-ink-600">Our team is here to assist you.</p>
                                <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={() => openAskQuestion({ subject: 'Marketplace brief', section: 'marketplace' })}><ClipboardList className="size-4" aria-hidden="true" /> Ask a Question</Button>
                                <Link href="/marketplace/my" className="mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-gold-700"><Target className="size-3.5" aria-hidden="true" /> My saved drafts</Link>
                            </Card>
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}
