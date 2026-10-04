import { Head, Link, router, useForm } from '@inertiajs/react';
import { CheckCircle2, MessageSquareWarning, Save, Scale } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Stepper } from '@/Components/ui/Kit';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import { ProviderShell } from '@/Components/Marketplace/Shells';
import { Card, InfoRows } from '@/Components/Marketplace/ui';
import { cn } from '@/lib/cn';
import type { Option } from '@/types/marketplace';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Props { step: number; data: Record<string, any>; engagements: Option[] }

const TYPES = ['Service Quality', 'Process / Policy', 'Payment / Fees', 'Fairness / Treatment', 'Communication', 'Other'];
const URGENCY = [['low', 'Low - Can wait (5+ business days)', 'bg-verified-500'], ['medium', 'Medium - Standard (2-5 business days)', 'bg-attested-500'], ['high', 'High - Priority (1-2 business days)', 'bg-risk-500'], ['critical', 'Critical - Immediate (within 24 hours)', 'bg-risk-700']];

export default function Grievance({ step, data, engagements }: Props) {
    const form = useForm({ mode: 'grievance', engagement: '', category: '', type: '', urgency: '', subject: '', description: '', evidence: [] as string[], outcome: '', decision_ref: '', confirm: false, ...data });
    const appeal = form.data.mode === 'appeal';
    const submit = (e: React.FormEvent) => { e.preventDefault(); form.post(`/marketplace/provider/grievances/new/${step}`, { preserveScroll: true }); };

    return (
        <ProviderShell crumbs={[{ label: 'My Engagements', href: '/marketplace/provider/dashboard' }, { label: 'Disputes' }, { label: 'File Grievance or Appeal' }]} title="Provider Grievance & Appeal"
            description="Submit a grievance about an engagement or marketplace process, or appeal a decision made by TBCA. We are committed to fair, transparent and timely resolution.">
            <Head title="Provider Grievance & Appeal" />
            <div className="grid gap-5 xl:grid-cols-12">
                <form onSubmit={submit} className="space-y-5 xl:col-span-8">
                    <div role="radiogroup" aria-label="Request type" className="grid gap-px overflow-hidden rounded-[8px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2">
                        {[['grievance', 'File a Grievance', 'Report an issue or concern', MessageSquareWarning], ['appeal', 'Appeal a Decision', 'Challenge a decision or outcome', Scale]].map(([k, t, s, I]) => {
                            const Ic = I as typeof Scale;
                            return <button key={k as string} type="button" role="radio" aria-checked={form.data.mode === k} onClick={() => form.setData('mode', k as string)} className={cn('flex items-center gap-3 p-4 text-left', form.data.mode === k ? 'bg-white' : 'bg-parchment-200')}><Ic className="size-6 text-controlled-600" aria-hidden="true" /><span><span className="block font-semibold text-controlled-700">{t as string}</span><span className="text-xs text-ink-500">{s as string}</span></span></button>;
                        })}
                    </div>
                    <Stepper steps={[appeal ? 'Appeal Details' : 'Grievance Details', 'Supporting Information', 'Review & Confirm', 'Submission', 'Acknowledgement']} current={step} />
                    <Card number={step} title={['', appeal ? 'Appeal Details' : 'Grievance Details', 'Supporting Information', 'Review & Confirm'][step]}>
                        {step === 1 && (
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Engagement / Opportunity" required error={form.errors.engagement}>{(id) => <Select id={id} value={form.data.engagement} options={engagements} placeholder="Select engagement" onChange={(e) => form.setData('engagement', e.target.value)} />}</Field>
                                <Field label="Issue Category" required error={form.errors.category}>{(id) => <Select id={id} value={form.data.category} placeholder="Select issue category" options={['QA outcome', 'Payout / payment hold', 'Rating or tier', 'Assignment fairness', 'Client conduct', 'Platform / process']} onChange={(e) => form.setData('category', e.target.value)} />}</Field>
                                <fieldset className="rounded-[6px] border border-parchment-400 p-3">
                                    <legend className="px-1 text-[0.8125rem] font-medium">{appeal ? 'Appeal' : 'Grievance'} Type <span className="text-risk-500">*</span></legend>
                                    <div className="grid grid-cols-2 gap-1.5">{TYPES.map((t) => <label key={t} className="flex items-center gap-2 text-sm"><input type="radio" name="type" className="accent-controlled-600" checked={form.data.type === t} onChange={() => form.setData('type', t)} />{t}</label>)}</div>
                                    {form.errors.type && <p role="alert" className="text-xs text-risk-500">{form.errors.type}</p>}
                                </fieldset>
                                <fieldset className="rounded-[6px] border border-parchment-400 p-3">
                                    <legend className="px-1 text-[0.8125rem] font-medium">Urgency Level <span className="text-risk-500">*</span></legend>
                                    <div className="space-y-1.5">{URGENCY.map(([k, l, c]) => <label key={k} className="flex items-center gap-2 text-sm"><input type="radio" name="urgency" className="accent-controlled-600" checked={form.data.urgency === k} onChange={() => form.setData('urgency', k)} /><span className={`size-2.5 rounded-full ${c}`} />{l}</label>)}</div>
                                    {form.errors.urgency && <p role="alert" className="text-xs text-risk-500">{form.errors.urgency}</p>}
                                </fieldset>
                                <Field label="Subject" required className="md:col-span-2" hint={`${form.data.subject.length} / 150`} error={form.errors.subject}>{(id) => <Input id={id} maxLength={150} value={form.data.subject} placeholder="Brief summary of your grievance" onChange={(e) => form.setData('subject', e.target.value)} />}</Field>
                                <Field label="Detailed Description" required className="md:col-span-2" hint={`${form.data.description.length} / 2000`} error={form.errors.description}>{(id) => <Textarea id={id} maxLength={2000} value={form.data.description} placeholder="Please provide a clear and detailed description of the issue, including dates, people involved, and the impact on your engagement." onChange={(e) => form.setData('description', e.target.value)} />}</Field>
                            </div>
                        )}
                        {step === 2 && (
                            <div className="grid gap-4">
                                {appeal && <Field label="Decision reference being appealed" error={form.errors.decision_ref}>{(id) => <Input id={id} value={form.data.decision_ref} onChange={(e) => form.setData('decision_ref', e.target.value)} placeholder="e.g. QAR-2026-0198" />}</Field>}
                                <Field label="Supporting evidence (file names, one per line)" hint="PDF, DOCX, XLSX, PNG · 20MB per file">{(id) => <Textarea id={id} value={form.data.evidence.join('\n')} onChange={(e) => form.setData('evidence', e.target.value.split('\n').filter(Boolean))} />}</Field>
                                <Field label="Outcome you are seeking" required error={form.errors.outcome}>{(id) => <Textarea id={id} maxLength={1000} value={form.data.outcome} onChange={(e) => form.setData('outcome', e.target.value)} />}</Field>
                            </div>
                        )}
                        {step === 3 && (
                            <div className="space-y-3">
                                <InfoRows rows={[['Type', `${appeal ? 'Appeal' : 'Grievance'} – ${form.data.type}`], ['Engagement', form.data.engagement], ['Category', form.data.category], ['Urgency', form.data.urgency], ['Subject', form.data.subject], ['Description', form.data.description], ['Evidence', form.data.evidence.join(', ') || 'None'], ['Outcome sought', form.data.outcome]]} />
                                <Checkbox label="I confirm this information is accurate and I understand it will be handled under the Dispute Resolution Policy." checked={form.data.confirm} onChange={(e) => form.setData('confirm', e.target.checked)} />
                                {form.errors.confirm && <p role="alert" className="text-xs text-risk-500">{form.errors.confirm}</p>}
                            </div>
                        )}
                        <div className="mt-5 flex flex-wrap justify-between gap-3">
                            <Button type="button" variant="ghost" onClick={() => router.post(`/marketplace/provider/grievances/new/${step}`, { ...form.data, save_draft: 1 }, { preserveScroll: true })}><Save className="size-4" aria-hidden="true" /> Save as Draft</Button>
                            <div className="flex gap-3">
                                {step > 1 && <Link href={`/marketplace/provider/grievances/new/${step - 1}`} className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 px-4 text-sm">Back</Link>}
                                <Button type="submit" disabled={form.processing} trailingIcon="arrow-right">{step === 1 ? 'Next: Supporting Information' : step === 2 ? 'Next: Review & Confirm' : `Submit ${appeal ? 'Appeal' : 'Grievance'}`}</Button>
                            </div>
                        </div>
                    </Card>
                    <p className="rounded-[6px] border border-controlled-500/30 bg-controlled-50 px-4 py-3 text-xs text-controlled-700">All grievances are handled in accordance with our Dispute Resolution Policy. Your information is kept confidential.</p>
                </form>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="Grievance Process">
                        <ol className="space-y-3 text-sm">{[['Submit Grievance', 'Provide details and supporting information'], ['Acknowledgement', 'We acknowledge within 1 business day'], ['Initial Review', 'Initial assessment within 3 business days'], ['Investigation', 'Full investigation within 10 business days'], ['Resolution', 'Decision and resolution communicated'], ['Closure', 'Case closed with follow-up if required']].map(([t, s]) => <li key={t}><p className="font-semibold text-ink-900">{t}</p><p className="text-xs text-ink-500">{s}</p></li>)}</ol>
                    </Card>
                    <Card title="Your Rights"><ul className="space-y-1.5 text-sm">{['Fair and unbiased review', 'Confidential handling', 'Timely resolution', 'Right to appeal', 'No retaliation'].map((r) => <li key={r} className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" />{r}</li>)}</ul></Card>
                    <Card title="Need Help?"><Button type="button" variant="outline" size="sm" className="w-full" onClick={() => openAskQuestion({ subject: 'Provider grievance', section: 'marketplace' })}>Ask a Question</Button></Card>
                </aside>
            </div>
        </ProviderShell>
    );
}

Grievance.layout = null;
