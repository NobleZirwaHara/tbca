import type { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CheckCircle2, Info, Pencil, ShieldCheck, Upload } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { ReferenceChip } from '@/Components/ui/Kit';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { ActTag, FlowSteps, NextSteps, ShopCrumbs, SideCard, TrustStrip } from '@/Components/Shop/Bits';
import { Glance } from '@/Components/Shop/ProductTabs';
import type { ProductDetail } from '@/types/shop';

type Data = Record<string, string | number | string[] | null | undefined>;

interface Props {
    product: ProductDetail;
    step: number;
    steps: string[];
    data: Data;
    options: Record<string, string[]>;
    reference: string | null;
}

const SUBS = ['Tell us what you need', 'Scope & key information', 'Confirm and send', "We'll be in touch"];
const s = (d: Data, k: string) => (d[k] === null || d[k] === undefined ? '' : String(d[k]));

function StepOne({ product, data, options }: Props) {
    const form = useForm({
        title: s(data, 'title'), engagement_type: s(data, 'engagement_type'), help: s(data, 'help'), client_type: s(data, 'client_type'), scope: s(data, 'scope'),
        industry: s(data, 'industry') || 'Financial Services', country: s(data, 'country'), budget: s(data, 'budget') || 'ZAR 250,000 - ZAR 500,000',
        start_date: s(data, 'start_date'), timeline: s(data, 'timeline'), files: [] as File[],
    });
    const e = form.errors as Record<string, string | undefined>;
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(`/shop/quote-request/${product.slug}/1`, { forceFormData: true, preserveScroll: true }); };
    const names = Array.isArray(data.file_names) ? (data.file_names as string[]) : [];

    return (
        <form onSubmit={submit} noValidate className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Engagement Title" error={e.title} required>{(id) => <Input id={id} value={form.data.title} onChange={(x) => form.setData('title', x.target.value)} />}</Field>
                <Field label="Engagement Type" error={e.engagement_type} required>{(id) => <Select id={id} options={options.engagement_types} value={form.data.engagement_type} onChange={(x) => form.setData('engagement_type', x.target.value)} />}</Field>
                <Field label="What do you need help with?" error={e.help} required hint={`${form.data.help.length} / 2000 characters`}>{(id) => <Textarea id={id} maxLength={2000} value={form.data.help} onChange={(x) => form.setData('help', x.target.value)} />}</Field>
                <div className="space-y-4">
                    <Field label="Client Type" error={e.client_type} required>{(id) => <Select id={id} options={options.client_types} value={form.data.client_type} onChange={(x) => form.setData('client_type', x.target.value)} />}</Field>
                    <Field label="Estimated Scope" error={e.scope}>{(id) => <Select id={id} options={options.scopes} value={form.data.scope} onChange={(x) => form.setData('scope', x.target.value)} />}</Field>
                </div>
                <Field label="Industry" error={e.industry} required>{(id) => <Select id={id} options={options.industries} value={form.data.industry} onChange={(x) => form.setData('industry', x.target.value)} />}</Field>
                <Field label="Country / Region" error={e.country} required>{(id) => <Select id={id} options={options.countries} value={form.data.country} onChange={(x) => form.setData('country', x.target.value)} />}</Field>
                <Field label="Budget Indication (Excl. VAT)" error={e.budget}>{(id) => <Select id={id} options={options.budgets} value={form.data.budget} onChange={(x) => form.setData('budget', x.target.value)} />}</Field>
                <Field label="Preferred Start Date" error={e.start_date}>{(id) => <Input id={id} type="date" value={form.data.start_date} onChange={(x) => form.setData('start_date', x.target.value)} />}</Field>
                <Field label="Expected Timeline" error={e.timeline}>{(id) => <Select id={id} options={options.timelines} value={form.data.timeline} onChange={(x) => form.setData('timeline', x.target.value)} />}</Field>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-[6px] border border-parchment-400 p-3">
                <Upload className="size-5 text-ink-500" aria-hidden="true" />
                <label htmlFor="qr-files" className="flex-1 text-xs text-ink-600"><strong className="block text-[0.8125rem] text-ink-900">Upload Supporting Documents (Optional)</strong>Company profile, financials, prior reports, scope notes, etc.{names.length > 0 && <span className="block text-verified-700">Uploaded: {names.join(', ')}</span>}</label>
                <input id="qr-files" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip" className="text-xs" onChange={(x) => form.setData('files', Array.from(x.target.files ?? []))} />
                {(e.files || e['files.0']) && <p className="w-full text-xs text-risk-500">{e.files ?? e['files.0']}</p>}
            </div>
            <div className="flex justify-end"><Button type="submit" disabled={form.processing}>Save & Continue <ArrowRight className="size-4" /></Button></div>
        </form>
    );
}

function StepTwo({ product, data }: Props) {
    const form = useForm({
        deliverables: s(data, 'deliverables'), entities: s(data, 'entities') || '1', data_room: s(data, 'data_room') || 'no', deadline: s(data, 'deadline'),
        contact_name: s(data, 'contact_name'), contact_email: s(data, 'contact_email'), contact_phone: s(data, 'contact_phone'), company: s(data, 'company'),
    });
    const e = form.errors as Record<string, string | undefined>;
    return (
        <form onSubmit={(ev) => { ev.preventDefault(); form.post(`/shop/quote-request/${product.slug}/2`, { preserveScroll: true }); }} noValidate className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Key deliverables and scope" error={e.deliverables} required className="md:col-span-2">{(id) => <Textarea id={id} value={form.data.deliverables} placeholder="e.g. Historical tax compliance review (3 years), risk register, structuring recommendations" onChange={(x) => form.setData('deliverables', x.target.value)} />}</Field>
                <Field label="Number of entities in scope" error={e.entities} required>{(id) => <Input id={id} type="number" min={1} value={form.data.entities} onChange={(x) => form.setData('entities', x.target.value)} />}</Field>
                <Field label="Is a data room available?" error={e.data_room} required>{(id) => <Select id={id} options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} value={form.data.data_room} onChange={(x) => form.setData('data_room', x.target.value)} />}</Field>
                <Field label="Hard deadline (if any)" error={e.deadline}>{(id) => <Input id={id} type="date" value={form.data.deadline} onChange={(x) => form.setData('deadline', x.target.value)} />}</Field>
                <Field label="Company" error={e.company}>{(id) => <Input id={id} value={form.data.company} onChange={(x) => form.setData('company', x.target.value)} />}</Field>
                <Field label="Contact name" error={e.contact_name} required>{(id) => <Input id={id} value={form.data.contact_name} onChange={(x) => form.setData('contact_name', x.target.value)} />}</Field>
                <Field label="Contact email" error={e.contact_email} required>{(id) => <Input id={id} type="email" value={form.data.contact_email} onChange={(x) => form.setData('contact_email', x.target.value)} />}</Field>
                <Field label="Contact phone" error={e.contact_phone}>{(id) => <Input id={id} value={form.data.contact_phone} onChange={(x) => form.setData('contact_phone', x.target.value)} />}</Field>
            </div>
            <div className="flex justify-between"><ButtonLink href={`/shop/quote-request/${product.slug}/1`} variant="outline"><ArrowLeft className="size-4" /> Back</ButtonLink><Button type="submit" disabled={form.processing}>Save & Continue <ArrowRight className="size-4" /></Button></div>
        </form>
    );
}

function StepThree({ product, data }: Props) {
    const form = useForm({ confirm: false });
    const rows: [string, string][] = [['Engagement Title', s(data, 'title')], ['Engagement Type', s(data, 'engagement_type')], ['Client Type', s(data, 'client_type')], ['Estimated Scope', s(data, 'scope')], ['Industry', s(data, 'industry')], ['Country / Region', s(data, 'country')], ['Budget Indication', s(data, 'budget')], ['Preferred Start', s(data, 'start_date') || 'Flexible'], ['Expected Timeline', s(data, 'timeline')], ['Entities in scope', s(data, 'entities')], ['Data room', s(data, 'data_room')], ['Contact', `${s(data, 'contact_name')} (${s(data, 'contact_email')})`]];
    return (
        <form onSubmit={(ev) => { ev.preventDefault(); form.post(`/shop/quote-request/${product.slug}/3`); }} className="space-y-4">
            <Glance rows={rows} />
            <div className="rounded-[6px] bg-parchment-200 p-3 text-xs text-ink-700"><strong className="block text-ink-900">What you need help with</strong>{s(data, 'help')}</div>
            <div className="rounded-[6px] bg-parchment-200 p-3 text-xs text-ink-700"><strong className="block text-ink-900">Deliverables & scope</strong>{s(data, 'deliverables')}</div>
            <Checkbox checked={form.data.confirm} onChange={(x) => form.setData('confirm', x.target.checked)} label="I confirm this is a quote request, not a purchase, and that the information provided is accurate." />
            {form.errors.confirm && <p role="alert" className="text-xs text-risk-500">{form.errors.confirm}</p>}
            <div className="flex justify-between"><ButtonLink href={`/shop/quote-request/${product.slug}/2`} variant="outline"><ArrowLeft className="size-4" /> Edit details</ButtonLink><Button type="submit" disabled={form.processing}>Submit Quote Request <ArrowRight className="size-4" /></Button></div>
        </form>
    );
}

export default function QuoteRequest(props: Props) {
    const { product, step, steps, data, reference } = props;
    const titles = ['1. Tell us about your requirements', '2. Engagement details', '3. Review & submit', 'Quote request received'];

    return (
        <>
            <Head title={`Request a Quote: ${product.name}`} />
            <div className="container-tbca py-6">
                <ShopCrumbs tone="light" items={[{ label: 'Online Shop', href: '/shop' }, { label: 'Marketplace', href: '/shop/a-z' }, { label: 'Quote Request' }, { label: product.name }]} />
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="min-w-0 space-y-5 lg:col-span-8">
                        <div className="flex flex-wrap gap-5">
                            <ShopIcon name={product.icon} size="lg" />
                            <div className="min-w-0 flex-1">
                                <ActTag act="A6" label="A6 Quote Request" />
                                <h1 className="mt-1 font-serif text-[1.875rem] font-semibold text-ink-900 md:text-[2.25rem]">Request a Quote</h1>
                                <p className="font-semibold text-ink-800">{product.name}</p>
                                <p className="mt-1 text-sm text-ink-600">{product.tagline}</p>
                            </div>
                        </div>
                        <FlowSteps current={step} steps={steps.map((t, i) => ({ title: t, sub: SUBS[i] }))} />
                        <SideCard title={titles[step - 1]}>
                            {step === 1 && <StepOne {...props} />}
                            {step === 2 && <StepTwo {...props} />}
                            {step === 3 && <StepThree {...props} />}
                            {step === 4 && (
                                <div className="text-center">
                                    <CheckCircle2 className="mx-auto size-12 text-verified-500" aria-hidden="true" />
                                    <p className="mt-2 font-semibold text-ink-900">Thank you. Your quote request has been submitted.</p>
                                    <div className="mt-2"><ReferenceChip value={reference ?? ''} /></div>
                                    <p className="mt-2 text-sm text-ink-600">A senior TBCA advisor will review your requirements within 1 business day. You'll receive a versioned quote you can review, accept or request changes to.</p>
                                    <div className="mt-4 flex flex-wrap justify-center gap-2"><ButtonLink href="/portal">Go to Client Portal</ButtonLink><ButtonLink href="/shop" variant="outline">Back to Online Shop</ButtonLink></div>
                                </div>
                            )}
                        </SideCard>
                    </div>
                    <aside className="space-y-4 lg:col-span-4">
                        <SideCard title="Engagement Summary" action={step > 1 && step < 4 ? <Link href={`/shop/quote-request/${product.slug}/1`} className="inline-flex items-center gap-1 text-xs text-gold-800"><Pencil className="size-3" /> Edit</Link> : undefined}>
                            <Glance rows={[['Service', product.name], ['Engagement Type', s(data, 'engagement_type')], ['Client Type', s(data, 'client_type')], ['Country / Region', s(data, 'country')], ['Estimated Timeline', s(data, 'timeline')], ['Budget Indication', s(data, 'budget') || 'Not specified']]} />
                        </SideCard>
                        <div className="flex gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4 text-xs text-ink-700"><Info className="size-5 shrink-0 text-controlled-700" aria-hidden="true" /><p><strong className="block text-[0.8125rem] text-ink-900">This is a quote request, not a purchase.</strong>We will review your information and provide a formal proposal with fees, deliverables and timelines.</p></div>
                        <SideCard title="What happens next?">
                            <NextSteps steps={[['Review', 'We review your requirements within 1 business day.'], ['Clarify', 'A senior TBCA advisor may contact you for clarity.'], ['Proposal', "You'll receive a detailed proposal and fee estimate."], ['Decide', 'You review and decide how to proceed.']]} />
                        </SideCard>
                        <div className="flex gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4 text-xs text-ink-700"><ShieldCheck className="size-6 shrink-0 text-gold-700" aria-hidden="true" /><p><strong className="block text-[0.8125rem] text-ink-900">Governed. Independent. Trusted.</strong>All engagements are governed by TBCA's professional standards, conflict checks and confidentiality protocols.</p></div>
                        <SideCard><p className="font-semibold text-ink-900">Need help with your request?</p><button type="button" onClick={() => openAskQuestion({ subject: `Quote: ${product.name}`, section: 'shop' })} className="mt-2 rounded-[4px] border border-gold-500 px-3 py-1.5 text-xs font-semibold text-gold-800">Talk to a TBCA Advisor →</button></SideCard>
                    </aside>
                </div>
            </div>
            <TrustStrip />
        </>
    );
}
