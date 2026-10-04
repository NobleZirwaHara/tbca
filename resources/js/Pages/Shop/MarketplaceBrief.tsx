import { useState, type FormEvent } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Bookmark, Info, Lock, Trash2, Upload, X } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import BriefStepOne, { type BriefOptions } from '@/Components/Shop/BriefStepOne';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { FlowSteps, NextSteps, ShopCrumbs, SideCard, TrustStrip } from '@/Components/Shop/Bits';
import { Glance } from '@/Components/Shop/ProductTabs';
import type { ShopCard } from '@/types/shop';

type Data = Record<string, unknown>;
interface Props {
    brief: { reference: string; status: string; step: number; data: Data };
    product: ShopCard | null;
    step: number;
    steps: string[];
    options: BriefOptions & { priorities: string[]; provider_types: string[]; locations: string[] };
}

const str = (d: Data, k: string, f = '') => (typeof d[k] === 'string' || typeof d[k] === 'number' ? String(d[k]) : f);
const back = (step: number) => <ButtonLink href={`/shop/marketplace-brief/${step - 1}`} variant="outline"><ArrowLeft className="size-4" /> Back</ButtonLink>;

function Requirements({ data, options }: { data: Data; options: Props['options'] }) {
    const form = useForm({ scope: str(data, 'scope'), budget: str(data, 'budget', 'ZAR 100,000 - ZAR 250,000'), priority: str(data, 'priority', 'High'), compliance: str(data, 'compliance', 'Yes'), compliance_detail: str(data, 'compliance_detail'), skills: (Array.isArray(data.skills) ? data.skills : []) as string[], tools: str(data, 'tools') });
    const [skill, setSkill] = useState('');
    const e = form.errors as Record<string, string | undefined>;
    const addSkill = () => { if (skill.trim() && !form.data.skills.includes(skill.trim())) form.setData('skills', [...form.data.skills, skill.trim()]); setSkill(''); };
    return (
        <form onSubmit={(ev: FormEvent) => { ev.preventDefault(); form.post('/shop/marketplace-brief/2', { preserveScroll: true }); }} noValidate className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Scope of Work" error={e.scope} required className="md:row-span-3">{(id) => <Textarea id={id} className="min-h-48" value={form.data.scope} placeholder={'• Review current IT infrastructure\n• Vulnerability assessment\n• Risk analysis and prioritisation'} onChange={(x) => form.setData('scope', x.target.value)} />}</Field>
                <Field label="Budget Range (Excl. VAT)" error={e.budget} required>{(id) => <Select id={id} options={options.value_bands} value={form.data.budget} onChange={(x) => form.setData('budget', x.target.value)} />}</Field>
                <Field label="Priority Level" error={e.priority} required>{(id) => <Select id={id} options={options.priorities} value={form.data.priority} onChange={(x) => form.setData('priority', x.target.value)} />}</Field>
                <Field label="Are there any compliance requirements?" error={e.compliance} required>{(id) => <Select id={id} options={['Yes', 'No']} value={form.data.compliance} onChange={(x) => form.setData('compliance', x.target.value)} />}</Field>
                {form.data.compliance === 'Yes' && <Field label="Please specify" error={e.compliance_detail} required>{(id) => <Input id={id} value={form.data.compliance_detail} placeholder="POPIA, ISO 27001, NIST CSF" onChange={(x) => form.setData('compliance_detail', x.target.value)} />}</Field>}
                <div>
                    <label htmlFor="skill" className="text-[0.8125rem] font-medium text-ink-800">Any must-have skills or certifications?</label>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">{form.data.skills.map((s) => <span key={s} className="inline-flex items-center gap-1 rounded bg-verified-50 px-2 py-0.5 text-xs text-verified-700">{s}<button type="button" aria-label={`Remove ${s}`} onClick={() => form.setData('skills', form.data.skills.filter((x) => x !== s))}><X className="size-3" /></button></span>)}</div>
                    <div className="mt-1.5 flex gap-2"><Input id="skill" value={skill} placeholder="Add another skill or certification..." onChange={(x) => setSkill(x.target.value)} onKeyDown={(x) => { if (x.key === 'Enter') { x.preventDefault(); addSkill(); } }} /><Button type="button" variant="outline" size="sm" onClick={addSkill}>Add</Button></div>
                </div>
                <Field label="Any preferred tools or platforms?" error={e.tools}>{(id) => <Input id={id} value={form.data.tools} placeholder="e.g. Microsoft 365, AWS, Palo Alto" onChange={(x) => form.setData('tools', x.target.value)} />}</Field>
            </div>
            <div className="flex justify-between">{back(2)}<Button type="submit" disabled={form.processing}>Continue to Documents <ArrowRight className="size-4" /></Button></div>
        </form>
    );
}

function Documents({ data }: { data: Data }) {
    const form = useForm({ files: [] as File[] });
    const names = Array.isArray(data.documents) ? (data.documents as string[]) : [];
    return (
        <form onSubmit={(ev) => { ev.preventDefault(); form.post('/shop/marketplace-brief/3', { forceFormData: true, preserveScroll: true }); }} className="space-y-4">
            <p className="text-sm text-ink-600">Add any documents that will help providers understand your requirements better.</p>
            <label htmlFor="brief-files" className="flex cursor-pointer flex-col items-center gap-2 rounded-[8px] border-2 border-dashed border-parchment-500 p-8 text-center text-sm text-ink-600 hover:border-gold-500">
                <Upload className="size-8 text-gold-700" aria-hidden="true" /> Upload Document
                <span className="text-xs text-ink-400">Max file size: 50MB each. Accepted formats: PDF, DOCX, XLSX, PPTX, ZIP</span>
                <input id="brief-files" type="file" multiple className="sr-only" accept=".pdf,.docx,.xlsx,.pptx,.zip" onChange={(x) => form.setData('files', Array.from(x.target.files ?? []))} />
            </label>
            {form.data.files.length > 0 && <p className="text-xs text-ink-700">Selected: {form.data.files.map((f) => f.name).join(', ')}</p>}
            {names.length > 0 && <p className="text-xs text-verified-700">Attached: {names.join(', ')}</p>}
            {Object.values(form.errors).length > 0 && <p role="alert" className="text-xs text-risk-500">{Object.values(form.errors)[0]}</p>}
            <div className="flex justify-between">{back(3)}<Button type="submit" disabled={form.processing}>Continue to Provider Preferences <ArrowRight className="size-4" /></Button></div>
        </form>
    );
}

function Preferences({ data, options }: { data: Data; options: Props['options'] }) {
    const form = useForm({ provider_type: str(data, 'provider_type', 'Verified firm'), provider_location: str(data, 'provider_location', 'Anywhere in South Africa'), min_experience: str(data, 'min_experience', '5'), nda_required: data.nda_required !== false, max_proposals: str(data, 'max_proposals', '5'), proposal_deadline: str(data, 'proposal_deadline') });
    const e = form.errors as Record<string, string | undefined>;
    return (
        <form onSubmit={(ev) => { ev.preventDefault(); form.post('/shop/marketplace-brief/4', { preserveScroll: true }); }} noValidate className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Provider type" error={e.provider_type} required>{(id) => <Select id={id} options={options.provider_types} value={form.data.provider_type} onChange={(x) => form.setData('provider_type', x.target.value)} />}</Field>
                <Field label="Provider location" error={e.provider_location} required>{(id) => <Select id={id} options={options.locations} value={form.data.provider_location} onChange={(x) => form.setData('provider_location', x.target.value)} />}</Field>
                <Field label="Minimum years of experience" error={e.min_experience}>{(id) => <Input id={id} type="number" min={0} value={form.data.min_experience} onChange={(x) => form.setData('min_experience', x.target.value)} />}</Field>
                <Field label="Maximum proposals to receive" error={e.max_proposals} required>{(id) => <Input id={id} type="number" min={1} max={10} value={form.data.max_proposals} onChange={(x) => form.setData('max_proposals', x.target.value)} />}</Field>
                <Field label="Proposal deadline" error={e.proposal_deadline}>{(id) => <Input id={id} type="date" value={form.data.proposal_deadline} onChange={(x) => form.setData('proposal_deadline', x.target.value)} />}</Field>
                <div className="flex items-end"><Checkbox checked={form.data.nda_required} onChange={(x) => form.setData('nda_required', x.target.checked)} label="Providers must sign an NDA before viewing documents" /></div>
            </div>
            <div className="flex justify-between">{back(4)}<Button type="submit" disabled={form.processing}>Continue to Review <ArrowRight className="size-4" /></Button></div>
        </form>
    );
}

function Review({ data }: { data: Data }) {
    const form = useForm({ confirm: false });
    const rows: [string, string][] = ['title', 'category', 'sub_category', 'project_type', 'industry', 'country', 'value_band', 'start_date', 'duration', 'delivery_location', 'budget', 'priority', 'compliance_detail', 'provider_type', 'provider_location', 'max_proposals']
        .filter((k) => str(data, k)).map((k) => [k.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()), str(data, k)]);
    return (
        <form onSubmit={(ev) => { ev.preventDefault(); form.post('/shop/marketplace-brief/5'); }} className="space-y-4">
            <Glance rows={rows} />
            <div className="rounded-[6px] bg-parchment-200 p-3 text-xs"><strong className="block">Brief Summary</strong>{str(data, 'summary')}</div>
            <div className="rounded-[6px] bg-parchment-200 p-3 text-xs whitespace-pre-line"><strong className="block">Scope of Work</strong>{str(data, 'scope')}</div>
            <Checkbox checked={form.data.confirm} onChange={(x) => form.setData('confirm', x.target.checked)} label="I understand that submitting this brief does not appoint a provider, create an engagement or authorise payment." />
            {form.errors.confirm && <p role="alert" className="text-xs text-risk-500">{form.errors.confirm}</p>}
            <div className="flex justify-between">{back(5)}<Button type="submit" disabled={form.processing}>Submit Brief <ArrowRight className="size-4" /></Button></div>
        </form>
    );
}

export default function MarketplaceBrief({ brief, product, step, steps, options }: Props) {
    const d = brief.data;
    const titles = ['1. Engagement Overview', '2. Project Requirements', '3. Attach Supporting Documents (Optional)', '4. Provider Preferences', '5. Review & Submit'];

    return (
        <>
            <Head title="Marketplace Brief Submission" />
            <div className="container-tbca py-6">
                <ShopCrumbs tone="light" items={[{ label: 'Online Shop', href: '/shop' }, { label: 'Marketplace', href: '/shop/a-z' }, { label: 'Submit a Brief' }]} />
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="min-w-0 space-y-5 lg:col-span-8">
                        <div className="flex flex-wrap items-center gap-3"><h1 className="font-serif text-[1.875rem] font-semibold text-ink-900">Marketplace Brief Submission</h1><span className="inline-flex items-center gap-1 text-sm font-semibold text-verified-700"><Lock className="size-4" /> Secure Checkout</span></div>
                        <p className="-mt-3 text-sm text-ink-600">Submit your brief to our verified network of providers. We'll match you with the right experts.</p>
                        <FlowSteps current={step} done={brief.step - 1} steps={steps.map((t) => ({ title: t }))} />
                        <SideCard title={titles[step - 1]}>
                            {step === 1 && <BriefStepOne data={d} options={options} product={product?.slug} />}
                            {step === 2 && <Requirements data={d} options={options} />}
                            {step === 3 && <Documents data={d} />}
                            {step === 4 && <Preferences data={d} options={options} />}
                            {step === 5 && <Review data={d} />}
                        </SideCard>
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => router.post('/shop/marketplace-brief/draft', d as never, { preserveScroll: true })}><Bookmark className="size-4" /> Save Draft</Button>
                            <Button type="button" variant="outline" size="sm" className="border-risk-500/50 text-risk-700" onClick={() => window.confirm('Discard this brief?') && router.post('/shop/marketplace-brief/discard')}><Trash2 className="size-4" /> Discard Brief</Button>
                        </div>
                    </div>
                    <aside className="space-y-4 lg:col-span-4">
                        <SideCard title="Brief Summary (Draft)" action={<span className="text-xs text-ink-400">Not Submitted</span>}>
                            <div className="flex gap-3"><ShopIcon name={product?.icon ?? 'handshake'} size="sm" /><div className="text-xs"><p className="font-semibold text-ink-900">{str(d, 'title', product?.name ?? 'New brief')}</p><p>{str(d, 'category')}</p><p className="text-ink-400">Ref {brief.reference}</p></div></div>
                            <dl className="mt-3 space-y-1 text-xs"><div className="flex justify-between"><dt>Marketplace Fee (Excl. VAT)</dt><dd>TBC</dd></div><div className="flex justify-between"><dt>VAT (15%)</dt><dd>TBC</dd></div></dl>
                            <p className="mt-2 flex justify-between border-t border-parchment-300 pt-2 font-semibold">Estimated Total (Incl. VAT)<span className="text-verified-700">TBC</span></p>
                        </SideCard>
                        <div className="rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4 text-xs text-ink-700">
                            <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-ink-900"><Info className="size-4 text-controlled-700" /> How Marketplace Works</p>
                            <ul className="mt-2 space-y-1"><li>We share your brief with verified providers.</li><li>Providers submit proposals and pricing.</li><li>You review and select your preferred provider.</li><li>We facilitate the engagement.</li></ul>
                            <p className="mt-2">Your brief is <strong>confidential</strong> and only shared with relevant, verified providers.</p>
                        </div>
                        <SideCard title="What happens next?"><NextSteps steps={[['Submit Brief', 'Complete and submit your brief.'], ['Provider Matching', "We'll match and notify relevant providers."], ['Proposals Received', 'Providers will submit their proposals.'], ['Review & Select', 'Review proposals and select your provider.']]} /></SideCard>
                    </aside>
                </div>
            </div>
            <TrustStrip items={[{ title: 'Verified Provider Network', body: 'Pre-vetted. Trusted. Proven.' }, { title: 'Secure & Confidential', body: 'Your brief is protected.' }, { title: 'Transparent Process', body: 'Fair matching & proposals.' }, { title: 'No Obligation', body: 'Review proposals with no commitment.' }]} />
        </>
    );
}
