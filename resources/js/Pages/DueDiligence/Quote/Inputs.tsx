import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, ChevronDown, Info, Trash2, Upload } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import QuoteShell from '@/Components/DueDiligence/QuoteShell';
import { Card, Ring } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { DdOptions, DdQuotePageProps } from '@/types/due-diligence';

interface Props extends DdQuotePageProps {
    options: DdOptions;
    evidence: { key: string; label: string; description: string; required?: boolean }[];
    documents: { id: number; original_name: string; category: string; size: number }[];
    progress: { sections: { key: string; label: string; done: number; total: number; unit: string }[]; complete: number; percent: number };
}

/** DD-018 Inputs Required. */
export default function Inputs(props: Props) {
    const { quote, options, evidence, documents, progress } = props;
    const i = quote.inputs;
    const [open, setOpen] = useState('subject');
    const form = useForm({
        subject_type: String(i.subject_type ?? ''), subject_name: String(i.subject_name ?? ''), jurisdiction: String(i.jurisdiction ?? ''),
        purpose: String(i.purpose ?? ''), expected_use: String(i.expected_use ?? ''), related_parties: String(i.related_parties ?? ''),
        registration_number: String(i.registration_number ?? ''), entity_type: String(i.entity_type ?? ''), incorporation_date: String(i.incorporation_date ?? ''),
        industry: String(i.industry ?? ''), ownership_structure: String(i.ownership_structure ?? ''), ubo_count: String(i.ubo_count ?? ''),
        accurate: Boolean(i.accurate), permitted_purpose: Boolean(i.permitted_purpose), privacy_notice: Boolean(i.privacy_notice), continue: false,
    });
    const upload = useForm<{ file: File | null; evidence_key: string }>({ file: null, evidence_key: evidence[0]?.key ?? '' });
    const url = `/due-diligence/quotes/${quote.reference}/inputs`;
    const save = (cont: boolean) => {
        form.transform((d) => ({ ...d, continue: cont }));
        form.post(url, { preserveScroll: true });
    };
    const err = form.errors as Record<string, string>;
    const sectionHasError = (keys: string[]) => keys.some((k) => err[k]);

    const sections = [
        { key: 'subject', title: '1. Subject Information', lead: 'Tell us about the subject of this due diligence.', keys: ['subject_type', 'subject_name', 'jurisdiction', 'purpose', 'expected_use'] },
        { key: 'entity', title: `2. ${quote.inputs.subject_type === 'individual' ? 'Identity & Background' : 'Entity & Ownership Details'}`, lead: 'Provide company structure and ownership information.', keys: ['registration_number', 'entity_type', 'incorporation_date', 'industry'] },
        { key: 'documents', title: '3. Document Uploads', lead: 'Upload the required documents listed for this service (optional now — you can also upload after activation).', keys: [] },
        { key: 'declarations', title: '4. Declarations & Consents', lead: 'Review and accept the declarations and consent.', keys: ['accurate', 'permitted_purpose', 'privacy_notice'] },
    ];
    const prog = (k: string) => progress.sections.find((s) => s.key === k);

    return (
        <QuoteShell
            page={props}
            title="Inputs Required"
            subtitle="Provide what we need to deliver accurate, compliant results."
            description="Upload documents and confirm details so our experts and trusted partners can complete your due diligence efficiently."
            current={2}
            publicStage="2 Consent & Payment"
            next="Review your inputs, see the process and what you will receive in the report."
            aside={
                <>
                    <Button type="button" size="lg" className="w-full" trailingIcon="arrow-right" disabled={form.processing} onClick={() => save(true)}>Continue / Accept Scope</Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => openAskQuestion({ subject: `Help with inputs for ${quote.reference}`, section: 'due-diligence' })}>Request Human Assistance</Button>
                </>
            }
        >
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-4">
                    <Card title="Your progress">
                        <div className="flex items-center gap-4">
                            <Ring value={progress.percent} size={84} />
                            <p className="text-sm text-ink-700">{progress.complete} of 4 sections completed</p>
                        </div>
                        <ul className="mt-4 space-y-2">
                            {progress.sections.map((s, n) => (
                                <li key={s.key}>
                                    <button type="button" onClick={() => setOpen(s.key)} className={cn('flex w-full items-start gap-2 rounded-[6px] border p-2.5 text-left', open === s.key ? 'border-gold-500 bg-gold-50' : 'border-parchment-400 bg-white')}>
                                        {s.done >= s.total ? <CheckCircle2 className="mt-0.5 size-4 text-verified-500" aria-hidden="true" /> : <AlertCircle className="mt-0.5 size-4 text-attested-500" aria-hidden="true" />}
                                        <span>
                                            <span className="block text-[0.8125rem] font-semibold text-ink-900">{n + 1}. {s.label}</span>
                                            <span className="block text-xs text-ink-500">{s.done} of {s.total} {s.unit}</span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Button type="button" variant="outline" className="w-full" disabled={form.processing} onClick={() => save(false)}>Save progress</Button>
                </div>

                <div className="space-y-3 xl:col-span-8">
                    {sections.map((s) => {
                        const p = prog(s.key);
                        const isOpen = open === s.key || sectionHasError(s.keys);
                        return (
                            <section key={s.key} className="rounded-[10px] border border-parchment-400 bg-white">
                                <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? '' : s.key)} className="flex w-full items-center gap-3 p-4 text-left">
                                    <span className="flex-1">
                                        <span className="block text-[0.9375rem] font-bold text-ink-900">{s.title}</span>
                                        <span className="block text-xs text-ink-500">{s.lead}</span>
                                    </span>
                                    {p && <span className="rounded bg-parchment-200 px-2 py-0.5 text-xs">{p.done} of {p.total}</span>}
                                    <ChevronDown className={cn('size-4 transition', isOpen && 'rotate-180')} aria-hidden="true" />
                                </button>
                                {isOpen && (
                                    <div className="border-t border-parchment-300 p-4">
                                        {s.key === 'subject' && (
                                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                <Field label="Subject Type" required error={err.subject_type}>{(id) => <Select id={id} value={form.data.subject_type} options={options.subjectTypes} placeholder="Select" onChange={(e) => form.setData('subject_type', e.target.value)} />}</Field>
                                                <Field label="Subject Name" required error={err.subject_name}>{(id) => <Input id={id} value={form.data.subject_name} onChange={(e) => form.setData('subject_name', e.target.value)} />}</Field>
                                                <Field label="Jurisdiction of Incorporation" required error={err.jurisdiction}>{(id) => <Select id={id} value={form.data.jurisdiction} options={options.jurisdictions} placeholder="Select" onChange={(e) => form.setData('jurisdiction', e.target.value)} />}</Field>
                                                <Field label="Purpose of Due Diligence" required error={err.purpose}>{(id) => <Select id={id} value={form.data.purpose} options={options.purposes} placeholder="Select" onChange={(e) => form.setData('purpose', e.target.value)} />}</Field>
                                                <Field label="Expected Use of Report" required error={err.expected_use}>{(id) => <Select id={id} value={form.data.expected_use} options={options.uses} placeholder="Select" onChange={(e) => form.setData('expected_use', e.target.value)} />}</Field>
                                                <Field label="Number of Related Parties" error={err.related_parties} hint="Parties beyond the package allowance are priced per party.">{(id) => <Input id={id} type="number" min={0} value={form.data.related_parties} onChange={(e) => form.setData('related_parties', e.target.value)} />}</Field>
                                            </div>
                                        )}
                                        {s.key === 'entity' && (
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <Field label={form.data.subject_type === 'individual' ? 'ID / Passport Number' : 'Registration Number'} error={err.registration_number}>{(id) => <Input id={id} value={form.data.registration_number} onChange={(e) => form.setData('registration_number', e.target.value)} />}</Field>
                                                <Field label="Entity Type" error={err.entity_type}>{(id) => <Select id={id} value={form.data.entity_type} options={options.entityTypes} placeholder="Select" onChange={(e) => form.setData('entity_type', e.target.value)} />}</Field>
                                                <Field label={form.data.subject_type === 'individual' ? 'Date of Birth' : 'Incorporation Date'} error={err.incorporation_date}>{(id) => <Input id={id} type="date" value={form.data.incorporation_date} onChange={(e) => form.setData('incorporation_date', e.target.value)} />}</Field>
                                                <Field label="Industry Sector" error={err.industry}>{(id) => <Select id={id} value={form.data.industry} options={options.industries} placeholder="Select" onChange={(e) => form.setData('industry', e.target.value)} />}</Field>
                                                <Field label="Number of Beneficial Owners" error={err.ubo_count}>{(id) => <Input id={id} type="number" min={0} value={form.data.ubo_count} onChange={(e) => form.setData('ubo_count', e.target.value)} />}</Field>
                                                <Field label="Ownership Structure" error={err.ownership_structure} className="sm:col-span-2">{(id) => <Textarea id={id} value={form.data.ownership_structure} onChange={(e) => form.setData('ownership_structure', e.target.value)} placeholder="e.g. 100% owned by Amari Infrastructure Holdings (Pty) Ltd" />}</Field>
                                            </div>
                                        )}
                                        {s.key === 'documents' && (
                                            <div className="space-y-3">
                                                <form
                                                    className="flex flex-wrap items-end gap-3"
                                                    onSubmit={(e) => { e.preventDefault(); upload.post(`/due-diligence/quotes/${quote.reference}/documents`, { preserveScroll: true, forceFormData: true, onSuccess: () => upload.reset('file') }); }}
                                                >
                                                    <Field label="Document type" error={upload.errors.evidence_key} className="min-w-48 flex-1">{(id) => <Select id={id} value={upload.data.evidence_key} options={evidence.map((e) => ({ value: e.key, label: e.label }))} onChange={(e) => upload.setData('evidence_key', e.target.value)} />}</Field>
                                                    <Field label="File (PDF, JPG, PNG, DOCX, max 25MB)" error={upload.errors.file} className="min-w-48 flex-1">{(id) => <input id={id} type="file" className="block w-full text-sm" accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx,.csv" onChange={(e) => upload.setData('file', e.target.files?.[0] ?? null)} />}</Field>
                                                    <Button type="submit" size="sm" icon="download" disabled={!upload.data.file || upload.processing}><Upload className="size-4" aria-hidden="true" /> Upload</Button>
                                                </form>
                                                <ul className="divide-y divide-parchment-300 rounded-[8px] border border-parchment-400">
                                                    {evidence.map((e) => {
                                                        const docs = documents.filter((d) => d.category === `intake:${e.key}`);
                                                        return (
                                                            <li key={e.key} className="flex flex-wrap items-center gap-2 px-3 py-2 text-[0.8125rem]">
                                                                {docs.length ? <CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" /> : <span className="size-4 rounded-full border border-parchment-500" aria-hidden="true" />}
                                                                <span className="flex-1 font-medium">{e.label} <span className="text-xs font-normal text-ink-500">— {e.description}</span></span>
                                                                {docs.map((d) => (
                                                                    <span key={d.id} className="inline-flex items-center gap-1 rounded bg-parchment-200 px-2 py-0.5 text-xs">
                                                                        {d.original_name}
                                                                        <button type="button" aria-label={`Remove ${d.original_name}`} onClick={() => router.delete(`/due-diligence/quotes/${quote.reference}/documents/${d.id}`, { preserveScroll: true })}><Trash2 className="size-3 text-risk-500" /></button>
                                                                    </span>
                                                                ))}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                        {s.key === 'declarations' && (
                                            <div className="space-y-3">
                                                <Checkbox label="I confirm the information supplied is accurate." checked={form.data.accurate} onChange={(e) => form.setData('accurate', e.target.checked)} />
                                                {err.accurate && <p className="text-xs text-risk-500">{err.accurate}</p>}
                                                <Checkbox label="I confirm the check is being requested for a permitted purpose." checked={form.data.permitted_purpose} onChange={(e) => form.setData('permitted_purpose', e.target.checked)} />
                                                {err.permitted_purpose && <p className="text-xs text-risk-500">{err.permitted_purpose}</p>}
                                                <Checkbox label="I have read the privacy notice and accept the service limitations." checked={form.data.privacy_notice} onChange={(e) => form.setData('privacy_notice', e.target.checked)} />
                                                {err.privacy_notice && <p className="text-xs text-risk-500">{err.privacy_notice}</p>}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </section>
                        );
                    })}
                    <div className="flex items-start gap-3 rounded-[10px] border border-controlled-500/30 bg-controlled-50 p-4">
                        <Info className="mt-0.5 size-5 text-controlled-600" aria-hidden="true" />
                        <div>
                            <p className="text-sm font-semibold text-ink-900">Why we need this information</p>
                            <p className="text-xs text-ink-600">Complete and accurate information helps us run the right checks, meet compliance obligations, and deliver reliable reports on time.</p>
                        </div>
                    </div>
                </div>
            </div>
        </QuoteShell>
    );
}
