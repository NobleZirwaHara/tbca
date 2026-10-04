import { Head, Link, router, useForm } from '@inertiajs/react';
import { CheckCircle2, Download, FileText, Upload } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { Checkbox, Field, Input, Textarea } from '@/Components/ui/Form';
import { ProviderShell } from '@/Components/Marketplace/Shells';
import { Card, InfoRows, Notice, priorityTone, zarCode } from '@/Components/Marketplace/ui';
import { cn } from '@/lib/cn';
import type { MkDeliverable, MkEngagement, MkProvider } from '@/types/marketplace';

interface Props {
    provider: MkProvider;
    engagement: MkEngagement;
    stages: string[];
    deliverables: MkDeliverable[];
    latest: MkDeliverable | null;
    payout: { reference: string; status: string; amount: number; available: string | null } | null;
}

const CHECKLIST = [['1. Scope & Objectives', 'Clear problem statement and objectives', 10], ['2. Background & Context', 'Sufficient context and supporting information', 9], ['3. Deliverables', 'All required deliverables specified', 10], ['4. Methodology', 'Approach and methodology outlined', 9], ['5. Timeline', 'Realistic timeline with milestones', 10], ['6. Budget & Terms', 'Budget range and terms specified', 10], ['7. Risk & Assumptions', 'Risks and assumptions identified', 8], ['8. Client Responsibilities', 'Client responsibilities defined', 8]] as const;

export default function Engagement({ engagement: e, stages, deliverables, latest, payout }: Props) {
    const form = useForm({ file_name: '', notes: '', scope_confirm: false });
    const canSubmit = ['assigned', 'in_progress', 'corrections'].includes(e.stage);
    const qa = latest?.qa ?? {};
    const passed = latest && ['released', 'accepted'].includes(latest.status);
    const corrections = (e.meta.corrections ?? []) as string[][];
    const plan = e.meta.payment_plan ?? {};

    return (
        <ProviderShell crumbs={[{ label: 'My Engagements', href: '/marketplace/provider/dashboard' }, { label: e.reference }, { label: 'QA Outcome, Payment State & Corrections' }]}
            title={e.title} badge={<StatusPill status={e.priority === 'high' ? 'High Priority' : e.stageLabel} tone={priorityTone(e.priority)} />} description={`Engagement ID: ${e.reference} · Client: ${e.clientName}`}
            actions={<span className="rounded border border-parchment-500 bg-white px-3 py-2 text-xs">Stage: {Math.min(e.providerStep, 8)} of 8 – {stages[Math.min(e.providerStep, 8) - 1]}</span>}>
            <Head title={`${e.reference} – Provider`} />
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-9">
                    <div className="grid gap-5 lg:grid-cols-2">
                        <Card title="QA Outcome" action={latest?.submittedAt && <span className="text-xs text-ink-500">Submitted {latest.submittedAt}</span>}>
                            {latest ? (
                                <>
                                    <div className={cn('rounded-[6px] border p-3', passed ? 'border-verified-500/30 bg-verified-50' : latest.status.startsWith('returned') || latest.status === 'rejected' ? 'border-risk-500/30 bg-risk-50' : 'border-attested-500/30 bg-attested-50')}>
                                        <p className="font-bold text-ink-900">QA STANDARD: {passed ? 'PASSED' : latest.status.replace(/_/g, ' ').toUpperCase()}</p>
                                        <p className="text-xs text-ink-600">{passed ? 'The deliverable has met all QA requirements.' : latest.status === 'submitted' || latest.status === 'in_review' ? 'In TBCA QA review. Provider submission is never the client-final release.' : 'Corrections required — see actions below.'}</p>
                                    </div>
                                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs sm:grid-cols-5">
                                        {[['QA Score', `${qa.score ?? '—'} / 100`], ['Mandatory', '12 / 12'], ['Recommended', '7 / 8'], ['Critical', '0'], ['Minor', String(corrections.length)]].map(([k, v]) => <div key={k} className="rounded border border-parchment-300 p-2"><p className="text-ink-500">{k}</p><p className="text-base font-bold">{v}</p></div>)}
                                    </div>
                                    <table className="mt-3 w-full text-xs">
                                        <thead className="text-ink-500"><tr><th scope="col" className="text-left font-medium">Category</th><th scope="col" className="text-left font-medium">Requirement</th><th scope="col" className="text-left font-medium">Status</th><th scope="col" className="text-right font-medium">Score</th></tr></thead>
                                        <tbody className="divide-y divide-parchment-300">{CHECKLIST.map(([c, r, s]) => <tr key={c}><td className="py-1 font-medium">{c}</td><td className="py-1 text-ink-600">{r}</td><td className="py-1">{passed ? <span className="flex items-center gap-1 text-verified-700"><CheckCircle2 className="size-3" aria-hidden="true" />Passed</span> : 'Pending'}</td><td className="py-1 text-right">{passed ? `${s} / 10` : '—'}</td></tr>)}</tbody>
                                    </table>
                                </>
                            ) : <p className="text-sm text-ink-500">No deliverable submitted yet.</p>}
                        </Card>
                        <Card title="Payment State">
                            <p className="text-3xl font-bold text-ink-900">{zarCode(e.providerRateZar)}</p>
                            <p className="text-xs text-ink-500">Your accepted provider rate (Ledger C, excl. VAT)</p>
                            <InfoRows dense className="mt-3" rows={[['Payment Plan', plan.plan ?? 'Paid on QA pass & acceptance'], ['Payment State', <StatusPill key="s" status={e.paymentState} tone="gold" />], ['Payment Method', plan.method ?? 'Bank Transfer'], ['Invoice', plan.invoice ?? '—'], ['Payout', payout ? `${payout.reference} · ${payout.status}` : 'Created when the client accepts'], ['Available From', payout?.available ?? '—']]} />
                            <Link href="/marketplace/provider/statements" className="mt-3 block text-center text-sm font-semibold text-controlled-600">View Payment History</Link>
                        </Card>
                    </div>
                    <Card title="Corrections & Actions">
                        {corrections.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[560px] text-xs">
                                    <thead className="bg-parchment-200 text-ink-600"><tr>{['Issue ID', 'Priority', 'Category', 'Description', 'Action Required', 'Status', 'Due Date'].map((h) => <th key={h} scope="col" className="px-2 py-1.5 text-left">{h}</th>)}</tr></thead>
                                    <tbody className="divide-y divide-parchment-300">{corrections.map((c) => <tr key={c[0]}>{c.map((v, i) => <td key={i} className="px-2 py-1.5">{i === 1 || i === 5 ? <StatusPill status={v} tone="warn" /> : v}</td>)}</tr>)}</tbody>
                                </table>
                            </div>
                        ) : <p className="text-sm text-ink-500">No critical issues found.</p>}
                    </Card>
                    <Card title="Work Submission">
                        {e.stage === 'assigned' && <Notice tone="info" className="mb-3">Confirm kick-off to move the engagement into progress. <Button type="button" size="sm" variant="outline" className="ml-2" onClick={() => router.post(`/marketplace/provider/engagements/${e.reference}/start`)}>Start Work</Button></Notice>}
                        {canSubmit ? (
                            <form className="grid gap-3 md:grid-cols-2" onSubmit={(ev) => { ev.preventDefault(); form.post(`/marketplace/provider/engagements/${e.reference}/submit`, { preserveScroll: true, onSuccess: () => form.reset() }); }}>
                                <Field label="Deliverable file name" required hint="PDF, DOCX, XLSX, PPTX or ZIP" error={form.errors.file_name}>{(id) => <Input id={id} value={form.data.file_name} onChange={(ev) => form.setData('file_name', ev.target.value)} placeholder="Financial_Model_Review_v2.0.pdf" />}</Field>
                                <Field label="Submission notes / evidence summary" required error={form.errors.notes}>{(id) => <Textarea id={id} value={form.data.notes} onChange={(ev) => form.setData('notes', ev.target.value)} maxLength={1500} />}</Field>
                                <div className="md:col-span-2"><Checkbox label="I confirm the work is limited to the approved scope and contains no regulated or reserved professional conclusions." checked={form.data.scope_confirm} onChange={(ev) => form.setData('scope_confirm', ev.target.checked)} />{form.errors.scope_confirm && <p role="alert" className="text-xs text-risk-500">{form.errors.scope_confirm}</p>}</div>
                                <div className="md:col-span-2"><Button type="submit" disabled={form.processing}><Upload className="size-4" aria-hidden="true" /> {e.stage === 'corrections' ? 'Submit Corrections for QA' : 'Proceed to Work Submission'}</Button></div>
                            </form>
                        ) : <p className="text-sm text-ink-500">Work submission is closed in the current stage ({e.stageLabel}).</p>}
                        {deliverables.length > 0 && (
                            <ul className="mt-4 divide-y divide-parchment-300 text-sm">{deliverables.map((d) => <li key={d.reference} className="flex flex-wrap items-center justify-between gap-2 py-2"><span className="flex items-center gap-2"><FileText className="size-4" aria-hidden="true" />{d.fileName} (v{d.version})</span><span className="flex items-center gap-2 text-xs text-ink-500">{d.submittedAt}<StatusPill status={d.status} /></span></li>)}</ul>
                        )}
                    </Card>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Stage Progress" action={<span className="text-xs text-controlled-600">{Math.min(e.providerStep, 8)} of 8</span>}>
                        <ol className="space-y-2">{stages.map((s, i) => { const n = i + 1; const done = n < e.providerStep; const cur = n === e.providerStep; return <li key={s} className="flex items-center gap-2 text-sm"><span className={cn('flex size-6 items-center justify-center rounded-full text-xs font-bold', done ? 'bg-verified-500 text-white' : cur ? 'bg-controlled-600 text-white' : 'bg-parchment-300 text-ink-500')}>{done ? '✓' : n}</span><span className={cur ? 'font-semibold' : ''}>{s}<br /><span className="text-[0.6875rem] text-ink-400">{done ? 'Completed' : cur ? 'Current' : 'Pending'}</span></span></li>; })}</ol>
                    </Card>
                    <Card title="Quick Actions">
                        <div className="space-y-2 text-sm">
                            <button type="button" onClick={() => window.print()} className="flex w-full items-center gap-2 text-left"><Download className="size-4" aria-hidden="true" /> Download QA Report</button>
                            <Link href="/marketplace/provider/grievances/new" className="block">Escalate / Raise Grievance</Link>
                        </div>
                    </Card>
                    <Card title="Important Notes"><ul className="list-disc space-y-1 pl-4 text-xs text-ink-600"><li>QA standard must be met before release to the client.</li><li>All payments are verified before deliverables are released.</li><li>Address all minor issues before submitting final work.</li></ul></Card>
                </aside>
            </div>
        </ProviderShell>
    );
}

Engagement.layout = null;
