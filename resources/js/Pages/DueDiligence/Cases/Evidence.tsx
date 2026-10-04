import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { CheckCircle2, Clock, FileText, ShieldCheck, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Select } from '@/Components/ui/Form';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { Card, Ticks, evidenceLabel, shortDate } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { DdCasePageProps } from '@/types/due-diligence';

export interface EvidenceItemRow {
    id: number; key: string; label: string; description: string; why?: string; evidence_type?: string; required: boolean; priority: string; expected: number; status: string; note?: string | null;
    documents?: { id: number; original_name: string; size: number; status: string; created_at: string }[];
    documents_count?: number;
}
interface Props extends DdCasePageProps {
    items: EvidenceItemRow[];
    stats: { requiredItems: number; completeItems: number; pendingItems: number; issues: number; documents: number; percent: number };
    documents: { id: number; original_name: string; category: string; size: number; status: string; uploaded_by: string; evidence_item_id: number | null; createdAt: string }[];
    blocker: string | null;
    canUpload: boolean;
}

/** DD-035 Evidence Upload. */
export default function Evidence(props: Props) {
    const { case: c, items, stats, documents, blocker, canUpload } = props;
    const base = `/due-diligence/cases/${c.reference}`;
    const [tab, setTab] = useState<'required' | 'uploaded' | 'library'>('required');
    const [drag, setDrag] = useState(false);
    const form = useForm<{ file: File | null; evidence_item_id: string }>({ file: null, evidence_item_id: String(items.find((i) => i.required && !['uploaded', 'approved', 'waived'].includes(i.status))?.id ?? items[0]?.id ?? '') });
    const send = (file: File | null) => {
        if (!file) return;
        form.setData('file', file);
        router.post(`${base}/evidence`, { file, evidence_item_id: form.data.evidence_item_id }, { preserveScroll: true, forceFormData: true, onSuccess: () => form.reset('file') });
    };
    const frozen = ['checks_running', 'review_required', 'partner_review'].includes(c.status);

    return (
        <CaseLayout
            page={props}
            active="evidence"
            title="Evidence Upload"
            subtitle="Upload the required documents to support your due diligence case."
            description="Secure, verified and compliant evidence enables accurate screening, ownership mapping and regulatory alignment."
            roleNote="Upload required evidence and complete this step."
            actions={c.status === 'intake_open' || c.status === 'consent_pending' ? <Button type="button" onClick={() => router.post(`${base}/intake`)} trailingIcon="arrow-right">Complete Required Action</Button> : undefined}
            aside={
                <>
                    <Card title="Upload summary">
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="rounded border border-parchment-400 p-2"><ShieldCheck className="mx-auto size-5 text-verified-500" aria-hidden="true" /><p className="text-xl font-bold">{stats.completeItems}</p><p className="text-[0.6875rem] text-ink-500">Complete</p></div>
                            <div className="rounded border border-parchment-400 p-2"><Clock className="mx-auto size-5 text-attested-500" aria-hidden="true" /><p className="text-xl font-bold">{stats.pendingItems}</p><p className="text-[0.6875rem] text-ink-500">Requires action</p></div>
                        </div>
                    </Card>
                    <Card title="Evidence quality" action={<span className="rounded bg-gold-50 px-1.5 text-[0.6875rem] font-semibold text-gold-800">{stats.percent}% Complete</span>}>
                        <dl className="space-y-1 text-xs">
                            <div className="flex justify-between"><dt>Complete items</dt><dd>{stats.completeItems} / {stats.requiredItems}</dd></div>
                            <div className="flex justify-between"><dt>Pending items</dt><dd>{stats.pendingItems} / {stats.requiredItems}</dd></div>
                            <div className="flex justify-between"><dt>Issues found</dt><dd>{stats.issues}</dd></div>
                            <div className="flex justify-between"><dt>Total documents</dt><dd>{stats.documents}</dd></div>
                        </dl>
                        {blocker && <p className="mt-2 rounded bg-attested-50 p-2 text-[0.6875rem] text-ink-700">{blocker}</p>}
                    </Card>
                </>
            }
        >
            <div role="tablist" className="flex gap-1 border-b border-parchment-400">
                {[['required', 'Required Evidence'], ['uploaded', 'Uploaded Documents'], ['library', 'Document Library']].map(([k, l]) => (
                    <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k as typeof tab)} className={cn('-mb-px border-b-2 px-3 py-2 text-[0.8125rem]', tab === k ? 'border-gold-500 font-semibold text-gold-700' : 'border-transparent text-ink-500')}>{l}</button>
                ))}
            </div>
            {frozen && <p className="rounded-[8px] bg-controlled-50 p-3 text-xs text-ink-700">The evidence baseline is frozen while checks run. New uploads are added as supplements for the reviewer.</p>}

            {tab === 'required' && (
                <div className="grid gap-5 xl:grid-cols-12">
                    <div className="space-y-4 xl:col-span-4">
                        {canUpload && (
                            <div
                                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                                onDragLeave={() => setDrag(false)}
                                onDrop={(e) => { e.preventDefault(); setDrag(false); send(e.dataTransfer.files?.[0] ?? null); }}
                                className={cn('rounded-[10px] border-2 border-dashed bg-white p-5 text-center', drag ? 'border-gold-500 bg-gold-50' : 'border-parchment-500')}
                            >
                                <UploadCloud className="mx-auto size-10 text-ink-500" aria-hidden="true" />
                                <p className="mt-2 text-sm font-semibold">Drag and drop files here</p>
                                <label className="mt-3 block text-left text-xs font-medium" htmlFor="ev-item">Evidence type</label>
                                <Select id="ev-item" value={form.data.evidence_item_id} onChange={(e) => form.setData('evidence_item_id', e.target.value)} options={items.map((i) => ({ value: String(i.id), label: i.label }))} />
                                <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-[4px] bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-gold-400">
                                    Browse Files
                                    <input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png,.docx,.doc,.xlsx,.csv" onChange={(e) => send(e.target.files?.[0] ?? null)} />
                                </label>
                                <p className="mt-2 text-[0.6875rem] text-ink-500">PDF, JPG, PNG, DOCX · Max 25MB per file. Files are stored encrypted and access-controlled.</p>
                                {form.errors.file && <p className="mt-1 text-xs text-risk-500">{form.errors.file}</p>}
                            </div>
                        )}
                        <Card title="Upload tips"><Ticks items={['Ensure documents are clear and legible.', 'Remove unnecessary pages.', 'Use PDF for multi-page documents.', 'Avoid password-protected files.']} /></Card>
                    </div>
                    <Card title="Evidence checklist" className="xl:col-span-8">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[560px] text-left text-xs">
                                <thead className="text-ink-500"><tr><th className="py-1">Evidence Type</th><th>Description</th><th>Status</th><th>Required</th><th>Uploaded</th></tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {items.map((i) => {
                                        const [l, cls] = evidenceLabel(i.status, i.required);
                                        return (
                                            <tr key={i.id}>
                                                <td className="py-2 font-medium"><span className="flex items-center gap-1.5"><FileText className="size-4 text-gold-600" aria-hidden="true" />{i.label}</span></td>
                                                <td className="text-ink-600">{i.description}</td>
                                                <td><span className={cn('rounded px-1.5 py-0.5 font-semibold', cls, l === 'Uploaded' ? 'bg-verified-50' : 'bg-attested-50')}>{l}</span></td>
                                                <td>{i.required ? 'Yes' : 'No'}</td>
                                                <td className={i.documents?.length ? 'text-verified-700' : 'text-risk-600'}>{i.documents?.length ?? 0} of {i.expected}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-3 text-[0.6875rem] text-ink-500">All uploads are secure, encrypted and access-controlled. Only authorised parties can view your documents. No fee applies to upload or update evidence.</p>
                    </Card>
                </div>
            )}

            {tab !== 'required' && (
                <Card title={tab === 'uploaded' ? 'Uploaded Documents' : 'Document Library'}>
                    <ul className="divide-y divide-parchment-300">
                        {documents.filter((d) => tab === 'library' || d.category === 'evidence').map((d) => (
                            <li key={d.id} className="flex flex-wrap items-center gap-2 py-2 text-xs">
                                <CheckCircle2 className={cn('size-4', d.status === 'verified' ? 'text-verified-500' : 'text-ink-300')} aria-hidden="true" />
                                <a href={`${base}/documents/${d.id}`} className="flex-1 font-medium hover:text-gold-700">{d.original_name}</a>
                                <span className="text-ink-500">{items.find((i) => i.id === d.evidence_item_id)?.label ?? d.category}</span>
                                <span className="text-ink-400">{(d.size / 1024).toFixed(0)} KB · {shortDate(d.createdAt)} · {d.uploaded_by}</span>
                                {!frozen && c.status !== 'closed' && <button type="button" aria-label={`Delete ${d.original_name}`} onClick={() => confirm('Remove this document?') && router.delete(`${base}/documents/${d.id}`, { preserveScroll: true })}><Trash2 className="size-4 text-risk-500" /></button>}
                            </li>
                        ))}
                        {documents.length === 0 && <li className="py-3 text-xs text-ink-500">No documents uploaded yet.</li>}
                    </ul>
                </Card>
            )}
        </CaseLayout>
    );
}
