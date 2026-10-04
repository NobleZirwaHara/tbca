import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { CheckCircle2, Clock, FileText, Flag, Scale, Search, XCircle } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Field, Textarea } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { Card, rand, shortDate } from '@/Components/DueDiligence/Ui';
import type { DdCasePageProps, DdEvent, DdReportMeta } from '@/types/due-diligence';

interface Props extends DdCasePageProps {
    dispute: { reference: string; report_section: string; finding: string; finding_ref: string | null; description: string; remedy: string; status: string; outcome: string | null; reason: string | null; actions: string[] | null; reviewer: string | null; approved_by: string | null; refund_zar: number; new_version: string | null; createdAt: string; decidedAt: string | null; documents: { id: number; original_name: string }[] };
    timeline: DdEvent[];
    report: DdReportMeta | null;
}

const OUTCOME: Record<string, [string, string]> = {
    corrected: ['Finding Corrected', 'The challenged finding has been corrected. Our review confirmed that the original result contained an error on TBCA\'s side. The report has been updated and a corrected version is now available.'],
    clarified: ['Clarification Added', 'A clarification note has been added to the report and the report has been re-issued.'],
    upheld: ['Finding Upheld', 'Our independent review confirmed the original finding against source evidence. The report is unchanged. You may escalate an appeal.'],
    recheck_quoted: ['Recheck Requires New Scope', 'New evidence requires expanded scope. A recheck quote will be issued for your approval before any work begins (G9).'],
};

/** DD-046 Correction or Recheck Outcome. */
export default function DisputeOutcome(props: Props) {
    const { case: c, dispute: d, timeline, report } = props;
    const base = `/due-diligence/cases/${c.reference}`;
    const decided = d.status === 'decided';
    const [appeal, setAppeal] = useState(false);
    const form = useForm({ reason: '' });
    const [title, body] = d.outcome ? OUTCOME[d.outcome] : ['Under review', 'Your dispute has been received and an independent reviewer is assessing your challenge and evidence. Downstream use of the report is locked until the outcome is delivered.'];
    const vat = Math.round(d.refund_zar * 0.15);
    const stepsDone = { opened: true, review: d.status !== 'received', assessed: decided || d.status === 'appealed', decision: decided, delivered: decided };

    return (
        <CaseLayout
            page={props}
            active="dispute"
            title="Correction or Recheck Outcome"
            subtitle={decided ? 'The dispute has been reviewed and a decision has been reached.' : 'Your dispute is being reviewed.'}
            description="Below is the outcome, reasoning and any corrective action taken. You can continue to view the updated report or proceed as advised."
            roleNote="You are viewing the dispute outcome and next steps."
            bandNote={d.outcome === 'corrected' ? 'TBCA error correction is at no cost.' : 'No fee for dispute review.'}
            aside={
                <>
                    <Card title="Financial outcome">
                        <dl className="space-y-1 text-xs">
                            <div className="flex justify-between"><dt>Outcome type</dt><dd className="rounded bg-verified-50 px-1.5 text-verified-700">{d.refund_zar > 0 ? 'Refund Approved' : 'No charge'}</dd></div>
                            <div className="flex justify-between"><dt>Reason</dt><dd>{d.outcome === 'corrected' ? 'TBCA error – no charge' : d.outcome ?? 'Pending'}</dd></div>
                            <div className="flex justify-between"><dt>Refund amount</dt><dd>{rand(d.refund_zar - vat, 2)}</dd></div>
                            <div className="flex justify-between"><dt>VAT (15%)</dt><dd>{rand(vat, 2)}</dd></div>
                            <div className="flex justify-between rounded bg-gold-50 px-1 py-1 text-sm font-bold"><dt>Total refund approved</dt><dd>{rand(d.refund_zar, 2)}</dd></div>
                        </dl>
                    </Card>
                    <Card title="Next steps">
                        <ButtonLink href={`${base}/report`} size="sm" className="w-full">View {d.new_version ? 'Corrected ' : ''}Report</ButtonLink>
                        <ButtonLink href={`${base}/report-ready`} size="sm" variant="outline" className="mt-2 w-full">Return to Report</ButtonLink>
                    </Card>
                    {decided && (
                        <Card title="Appeal option">
                            <p className="text-xs text-ink-500">If you are not satisfied with this outcome, you may escalate.</p>
                            <Button type="button" size="sm" variant="outline" className="mt-2 w-full" onClick={() => setAppeal(true)}><Scale className="size-4" aria-hidden="true" /> Escalate Appeal</Button>
                        </Card>
                    )}
                </>
            }
        >
            <div className="grid gap-5 xl:grid-cols-12">
                <Card title="Outcome summary" className="xl:col-span-4">
                    <p className="flex items-center gap-2 text-lg font-bold text-verified-700">{decided ? <CheckCircle2 className="size-8" aria-hidden="true" /> : <Clock className="size-8 text-attested-500" aria-hidden="true" />}{title}</p>
                    <p className="mt-2 text-xs text-ink-600">{body}</p>
                    {d.outcome === 'corrected' && <p className="mt-3 rounded bg-verified-50 p-2 text-xs text-verified-700">TBCA error correction applied at no charge. No fee applies for correcting our own error.</p>}
                    {d.new_version && (
                        <div className="mt-3 text-xs"><p className="font-semibold">Effective report version</p><p className="text-verified-700">{d.new_version}</p><p className="text-ink-500">Effective date: {shortDate(d.decidedAt, true)}</p></div>
                    )}
                </Card>
                <Card title="Decision & reasoning" className="xl:col-span-4">
                    <dl className="space-y-1.5 text-xs">
                        {[['Challenged item', `${d.report_section} · ${d.finding}`], ['Your description', d.description], ['Decision', d.outcome ? d.outcome.replace('_', ' ') : 'Pending'], ['Reason', d.reason ?? '—'], ['Reviewer', d.reviewer ?? '—'], ['Approved by', d.approved_by ?? '—'], ['Decision date', shortDate(d.decidedAt, true)], ['Reference', d.reference]].map(([k, v]) => <div key={k} className="grid grid-cols-3 gap-2"><dt className="text-ink-500">{k}</dt><dd className="col-span-2 capitalize-first">{v}</dd></div>)}
                    </dl>
                    {decided && <p className="mt-3 flex gap-2 rounded bg-verified-50 p-2 text-xs"><CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" />Independent review completed and approved.</p>}
                </Card>
                <Card title="Evidence considered" className="xl:col-span-4">
                    <ul className="space-y-1.5 text-xs">
                        <li className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" />Original screening logs</li>
                        <li className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" />Source confirmation (Company Register)</li>
                        {d.documents.map((doc) => <li key={doc.id} className="flex gap-2"><FileText className="size-4 text-gold-600" aria-hidden="true" /><a href={`${base}/documents/${doc.id}`} className="hover:underline">{doc.original_name}</a></li>)}
                    </ul>
                    {d.actions && (<><p className="mt-3 mb-1 text-xs font-semibold">Actions taken</p><ul className="space-y-1 text-xs">{d.actions.map((a) => <li key={a} className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" />{a}</li>)}</ul></>)}
                </Card>
            </div>
            <Card title="Dispute timeline">
                <ol className="grid gap-3 sm:grid-cols-5">
                    {[[Flag, 'Dispute opened', stepsDone.opened, d.createdAt], [Search, 'Under review', stepsDone.review, null], [FileText, 'Information assessed', stepsDone.assessed, null], [Scale, 'Decision made', stepsDone.decision, d.decidedAt], [CheckCircle2, 'Outcome delivered', stepsDone.delivered, d.decidedAt]].map(([I, l, done, at]) => {
                        const Icon = I as typeof Flag;
                        return <li key={l as string} className="flex flex-col items-center text-center text-xs"><span className={`flex size-10 items-center justify-center rounded-full border-2 ${done ? 'border-gold-500 text-gold-600' : 'border-parchment-400 text-ink-300'}`}><Icon className="size-5" aria-hidden="true" /></span><span className="mt-1 font-semibold">{l as string}</span><span className="text-ink-400">{at ? shortDate(at as string, true) : done ? 'Done' : 'Pending'}</span></li>;
                    })}
                </ol>
                {timeline.length > 0 && <ul className="mt-4 space-y-1 border-t border-parchment-300 pt-3 text-xs">{timeline.map((e) => <li key={e.code}><span className="text-ink-400">{shortDate(e.at, true)}</span> — {e.description}</li>)}</ul>}
            </Card>
            {report && <p className="text-xs text-ink-500">Current report: {report.title} {report.version}.</p>}
            <Modal open={appeal} onClose={() => setAppeal(false)} title="Escalate appeal" footer={<Button type="button" disabled={form.processing} onClick={() => form.post(`${base}/disputes/${d.reference}/appeal`, { preserveScroll: true, onSuccess: () => setAppeal(false) })}>Escalate</Button>}>
                <Field label="Why are you not satisfied with the outcome?" error={form.errors.reason} required>{(id) => <Textarea id={id} value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)} />}</Field>
            </Modal>
        </CaseLayout>
    );
}
