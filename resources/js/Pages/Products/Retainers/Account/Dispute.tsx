import type { FormEvent } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Bookmark, CheckCircle2, ExternalLink, FileUp, Send, ShieldCheck, Upload } from 'lucide-react';
import { Panel, StatusPill } from '@/Components/ui/Kit';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import { Field, Select, Textarea, Input } from '@/Components/ui/Form';
import { cn } from '@/lib/cn';
import type { RetContext, RetUsage } from '@/Components/Products/Retainers/types';
import { AccountShell } from '@/Components/Products/Retainers/Shells';
import { fmtDateTime, hrs } from '@/Components/Products/Retainers/ui';

interface Props extends RetContext {
    entry: RetUsage;
    disputes: { reference: string; status: string; reason: string; outcome: string; decision_note: string | null; created_at: string; decided_at: string | null }[];
}

const OUTCOMES = [
    { key: 'remove', title: 'Remove this entry', sub: 'Do not count these hours against my allowance.' },
    { key: 'adjust', title: 'Adjust duration', sub: 'I believe the correct duration is different.' },
    { key: 'other', title: 'Other', sub: 'Describe the outcome you are requesting.' },
];

export default function Dispute(props: Props) {
    const { retainer: r, entry: u, disputes } = props;
    const base = `/retainers/account/${r.code}`;
    const latest = disputes[0];
    const open = u.status === 'disputed';
    const form = useForm<{ reason: string; explanation: string; outcome: string; proposed_units: string; files: File[] }>({ reason: '', explanation: '', outcome: 'remove', proposed_units: '', files: [] });
    const err = form.errors as Record<string, string>;
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(`${base}/ledger/${u.id}/dispute`, { forceFormData: true, preserveScroll: true });
    };
    const steps = [
        { t: 'Dispute Submitted', b: 'We have received your dispute.', s: latest ? 'complete' : 'pending' },
        { t: 'Under Review', b: 'Our team is reviewing the entry and evidence.', s: latest ? (latest.status === 'under_review' ? 'in_progress' : 'complete') : 'pending' },
        { t: 'Decision Made', b: 'You will be notified of the decision.', s: latest && latest.status !== 'under_review' ? 'complete' : 'pending' },
        { t: 'Ledger Updated', b: 'If upheld, your allowance will be adjusted.', s: latest && latest.status !== 'under_review' ? 'complete' : 'pending' },
    ];
    const impact = form.data.outcome === 'adjust' && form.data.proposed_units !== '' ? Math.max(0, u.units - Number(form.data.proposed_units)) : u.units;

    return (
        <AccountShell ctx={props} title="Usage Dispute" description="Raise a dispute or query on a usage entry. We will review and respond within the required timeframe." crumb={{ label: 'Itemised Usage Ledger', href: `${base}/ledger` }}>
            <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1fr_340px]" noValidate>
                <div className="min-w-0 space-y-5">
                    <Panel title="Disputed Usage Entry">
                        <div className="grid gap-5 md:grid-cols-[1fr_200px]">
                            <LabelValues
                                rows={[
                                    { label: 'Date & Time', value: fmtDateTime(u.occurred_at) },
                                    { label: 'Service / Activity', value: u.activity },
                                    { label: 'Advisor', value: u.adviser },
                                    { label: 'Duration Recorded', value: `${hrs(u.original_units ?? u.units, 2)} hrs` },
                                    { label: 'Allowance Type', value: u.billing_effect === 'INCLUDED' ? 'Monthly Allowance' : u.billing_effect },
                                    { label: 'Balance After Entry', value: `${hrs(u.balance_after ?? 0, 2)} hrs` },
                                    { label: 'Reference', value: u.reference },
                                    { label: 'Line status', value: <StatusPill status={u.status} /> },
                                ]}
                            />
                            <div className="rounded-[6px] bg-parchment-100 p-4">
                                <p className="text-xs text-ink-500">Hours in Dispute</p>
                                <p className="text-2xl font-bold text-ink-900">{hrs(u.units, 2)} hrs</p>
                                <p className="mt-4 text-xs text-ink-500">Impact if Dispute Upheld</p>
                                <p className="text-2xl font-bold text-verified-700">+{hrs(impact, 2)} hrs</p>
                                <p className="text-xs text-ink-500">Allowance will be restored</p>
                            </div>
                        </div>
                    </Panel>

                    {disputes.length > 0 && (
                        <Notice tone={latest.status === 'upheld' ? 'good' : latest.status === 'rejected' ? 'bad' : 'warn'} title={`Dispute ${latest.reference}: ${latest.status.replace('_', ' ')}`}>
                            Raised {fmtDateTime(latest.created_at)} — {latest.reason}. {latest.decision_note ?? (latest.status === 'under_review' ? 'The disputed hours are isolated from your confirmed balance and cannot trigger overage while under review.' : '')}
                        </Notice>
                    )}

                    {!open && u.status !== 'credited' && (
                        <Panel title="1. Dispute Details">
                            <p className="-mt-2 mb-3 text-xs text-ink-500">Please provide the reason for your dispute.</p>
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-3">
                                    <Field label="Reason for Dispute" required error={err.reason}>
                                        {(id) => <Select id={id} value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)} placeholder="Select reason" options={['Work not requested', 'Duration overstated', 'Out-of-scope work logged', 'TBCA-caused rework', 'Duplicate entry', 'Other']} invalid={!!err.reason} />}
                                    </Field>
                                    <Field label="Detailed Explanation" required error={err.explanation} hint={`${form.data.explanation.length} / 2000`}>
                                        {(id) => <Textarea id={id} maxLength={2000} placeholder="Explain why you believe this entry is incorrect or should be adjusted..." value={form.data.explanation} onChange={(e) => form.setData('explanation', e.target.value)} invalid={!!err.explanation} />}
                                    </Field>
                                    <fieldset>
                                        <legend className="mb-2 text-[0.8125rem] font-medium text-ink-800">
                                            Preferred Outcome <span className="text-risk-500">*</span>
                                        </legend>
                                        <div className="space-y-2" role="radiogroup">
                                            {OUTCOMES.map((o) => (
                                                <label key={o.key} className="flex cursor-pointer items-start gap-2.5 text-xs">
                                                    <input type="radio" name="outcome" value={o.key} checked={form.data.outcome === o.key} onChange={() => form.setData('outcome', o.key)} className="mt-0.5 accent-gold-600" />
                                                    <span>
                                                        <span className="block text-[0.8125rem] font-semibold text-ink-900">{o.title}</span>
                                                        <span className="text-ink-500">{o.sub}</span>
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                    {form.data.outcome === 'adjust' && (
                                        <Field label="Correct duration (hours)" required error={err.proposed_units}>
                                            {(id) => <Input id={id} type="number" step={0.25} min={0} max={u.units} value={form.data.proposed_units} onChange={(e) => form.setData('proposed_units', e.target.value)} />}
                                        </Field>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[0.8125rem] font-medium text-ink-800">Supporting Evidence</p>
                                    <p className="text-xs text-ink-500">Upload any supporting documents, emails or notes.</p>
                                    <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-[6px] border-2 border-dashed border-parchment-500 p-6 text-center text-xs text-ink-600 hover:border-gold-500">
                                        <Upload className="size-8 text-ink-500" aria-hidden="true" />
                                        <span className="mt-2 font-semibold">Drag &amp; drop files here</span>
                                        <span>or</span>
                                        <span className="mt-1 rounded-[4px] border border-controlled-500/40 px-3 py-1 font-semibold text-controlled-700">Choose Files</span>
                                        <input type="file" multiple className="sr-only" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" onChange={(e) => form.setData('files', Array.from(e.target.files ?? []).slice(0, 5))} />
                                    </label>
                                    <p className="mt-1 text-[0.6875rem] text-ink-400">PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (Max 10 MB each). You can upload up to 5 files.</p>
                                    {form.data.files.length > 0 && (
                                        <ul className="mt-2 space-y-1 text-xs text-ink-700">
                                            {form.data.files.map((f) => (
                                                <li key={f.name} className="flex items-center gap-1.5">
                                                    <FileUp className="size-3.5" aria-hidden="true" />
                                                    {f.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {Object.entries(err).filter(([k]) => k.startsWith('files')).map(([k, v]) => <p key={k} className="text-xs text-risk-500">{v}</p>)}
                                    {err.usage && <p className="mt-2 text-xs text-risk-500">{err.usage}</p>}
                                </div>
                            </div>
                        </Panel>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="rounded-[8px] border border-gold-300 bg-gold-50 p-4">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-gold-800">
                            <ShieldCheck className="size-5" aria-hidden="true" /> Our Commitment
                        </h2>
                        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-ink-700">
                            <li>We will review your dispute objectively and fairly.</li>
                            <li>We may contact you for additional information.</li>
                            <li>You will receive a decision within the committed timeframe.</li>
                            <li>All outcomes and adjustments are recorded in your ledger.</li>
                        </ul>
                    </div>
                    <Panel title="2. Review Process">
                        <ol className="space-y-3">
                            {steps.map((s) => (
                                <li key={s.t} className="flex items-start gap-3 text-xs">
                                    <CheckCircle2 className={cn('mt-0.5 size-5 shrink-0', s.s === 'complete' ? 'text-verified-500' : s.s === 'in_progress' ? 'text-controlled-500' : 'text-ink-300')} aria-hidden="true" />
                                    <span className="flex-1">
                                        <span className="block font-semibold text-ink-900">{s.t}</span>
                                        <span className="text-ink-500">{s.b}</span>
                                    </span>
                                    <StatusPill status={s.s} />
                                </li>
                            ))}
                        </ol>
                    </Panel>
                    <Panel title="3. Timeline & Escalation">
                        <LabelValues
                            rows={[
                                { label: 'Expected Response', value: 'Within 3 business days' },
                                { label: 'Final Resolution', value: 'Within 7 business days' },
                                { label: 'Escalation Option', value: 'Request escalation after 7 days' },
                            ]}
                        />
                        <Link href="/contact" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-controlled-700">
                            Escalation Policy <ExternalLink className="size-3" aria-hidden="true" />
                        </Link>
                    </Panel>
                </div>

                <div className="xl:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-parchment-400 pt-4">
                    <Link href={`${base}/ledger`} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-sm font-semibold text-ink-900">
                        <ArrowLeft className="size-4" aria-hidden="true" /> Back to Ledger
                    </Link>
                    {!open && u.status !== 'credited' && (
                        <div className="flex gap-2">
                            <Link href={`${base}/ledger`} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-sm font-semibold text-ink-900">
                                <Bookmark className="size-4" aria-hidden="true" /> Cancel
                            </Link>
                            <button type="submit" disabled={form.processing} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-gold-500 px-6 text-sm font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-60">
                                <Send className="size-4" aria-hidden="true" /> Submit Dispute
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </AccountShell>
    );
}

Dispute.layout = null;
