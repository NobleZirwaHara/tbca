import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Archive, CheckCircle2, Clock, Info, Lock, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { Card, rand, shortDate } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { DdCasePageProps, DdCommercial, DdReportMeta } from '@/types/due-diligence';

interface Props extends DdCasePageProps {
    report: DdReportMeta | null;
    commercial: DdCommercial;
    subscription: { plan_name: string; status: string; subjects: number; included_reviews: number; alertsReviewed: number; endsAt: string | null } | null;
    closure: { action: string | null; status: string | null; approvals: Record<string, boolean> | null; legalHold: boolean; closedAt: string | null };
    outputs: { report: boolean; monitoring: boolean; evidence: number; certificate: boolean; outstanding: number };
}

const OPTIONS = [
    { key: 'archive', title: 'Archive Case', body: 'Move the case to secure archive. Access remains available for download and reference.', code: 'DD-ARC-S14-012', fee: 'Board provisional', effect: 'Case archived per schedule', icon: Archive, tone: 'border-gold-400' },
    { key: 'renew', title: 'Renew / Reactivate', body: 'Extend monitoring or reactivate the case. New fees may apply. Requires fresh consent where applicable.', code: 'DD-REN-S14-013', fee: 'Quoted package', effect: 'Reactivation or renewal enabled', icon: RefreshCw, tone: 'border-verified-500/50' },
    { key: 'delete', title: 'Delete Case', body: 'Permanently delete eligible data in accordance with the retention schedule and legal requirements.', code: 'DD-PLT-S14-037', fee: 'No fee (ordinary deletion)', effect: 'Data deleted and certificate issued', icon: Trash2, tone: 'border-risk-500/40' },
    { key: 'legal_hold', title: 'Place Legal Hold', body: 'Suspend deletion and preserve all data due to legal request, dispute or regulatory requirement.', code: 'DD-PLT-S14-038', fee: 'Actual cost where applicable', effect: 'Data preserved under legal hold', icon: Lock, tone: 'border-controlled-500/40' },
];

/** DD-051 Case Closure, Retention, Renewal and Deletion. */
export default function Close(props: Props) {
    const { case: c, report, commercial, subscription, closure, outputs } = props;
    const base = `/due-diligence/cases/${c.reference}`;
    const [choice, setChoice] = useState<string>('archive');
    const form = useForm({ action: 'archive' });
    const approvals = closure.approvals ?? {};
    const submit = () => {
        if (choice === 'delete' && !confirm('Request permanent deletion? Dual approval is required and the action cannot be undone.')) return;
        form.transform(() => ({ action: choice }));
        form.post(`${base}/close`, { preserveScroll: true });
    };

    return (
        <CaseLayout
            page={props}
            active="close"
            wide
            role="Account Owner"
            title="Case Closure, Retention, Renewal and Deletion"
            subtitle="Choose how to close or continue your case."
            description="Retention and deletion follow the approved record class, purpose, law, dispute and legal hold. Closing paid access does not remove complaint, privacy or correction rights."
            bandNote="Fees use the four-category disclosure standard."
            actions={<Button type="button" disabled={form.processing || c.status === 'closed' && choice !== 'renew' && choice !== 'legal_hold'} onClick={submit} trailingIcon="arrow-right">Confirm Selected Action</Button>}
        >
            {closure.action && (
                <p className="rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-3 text-sm">
                    Closure action: <strong className="capitalize">{closure.action.replace('_', ' ')}</strong> — {closure.status === 'pending_approval' ? 'awaiting dual approval' : 'completed'}{closure.closedAt ? ` · closed ${shortDate(closure.closedAt, true)}` : ''}{closure.legalHold ? ' · LEGAL HOLD ACTIVE' : ''}.
                </p>
            )}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <Card title="Case summary">
                    <dl className="space-y-1 text-xs">{[['Case ID', c.reference], ['Subject', c.subjectName], ['Report', report?.version ?? '—'], ['Report date', shortDate(report?.approvedAt)], ['Status', c.statusLabel]].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
                    <ButtonLink href={base} size="sm" variant="outline" className="mt-3 w-full">View Case Dashboard</ButtonLink>
                </Card>
                <Card title="Delivered outputs">
                    <ul className="space-y-1 text-xs">
                        {[['Final Due Diligence Report', outputs.report], ['Monitoring Summary', outputs.monitoring], [`Key Evidence Pack (${outputs.evidence} files)`, outputs.evidence > 0], ['Release Certificate', outputs.certificate], [outputs.outstanding ? `${outputs.outstanding} Outstanding Requests` : 'No Outstanding Requests', outputs.outstanding === 0]].map(([l, ok]) => <li key={l as string} className="flex gap-2">{ok ? <CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" /> : <Clock className="size-4 text-attested-500" aria-hidden="true" />}{l as string}</li>)}
                    </ul>
                    {report && <a href={`${base}/report/download`} className="mt-3 block rounded border border-parchment-400 py-1.5 text-center text-xs font-medium hover:border-gold-500">Download Final Report</a>}
                </Card>
                <Card title="Financial final statement">
                    <dl className="space-y-1 text-xs">
                        <div className="flex justify-between"><dt>Total fees charged (ex VAT)</dt><dd>{rand(commercial.subtotal, 2)}</dd></div>
                        <div className="flex justify-between"><dt>VAT (15%)</dt><dd>{rand(commercial.vat, 2)}</dd></div>
                        <div className="flex justify-between"><dt>Total paid</dt><dd>{rand(commercial.total, 2)}</dd></div>
                        <div className="flex justify-between text-verified-700"><dt>Credits / refunds</dt><dd>- {rand(commercial.credits, 2)}</dd></div>
                        <div className="flex justify-between rounded bg-verified-50 px-1 py-1 font-bold"><dt>Balance due</dt><dd>{rand(0, 2)}</dd></div>
                    </dl>
                </Card>
                <Card title="Monitoring status">
                    {subscription ? <dl className="space-y-1 text-xs">{[['Plan', subscription.plan_name], ['Status', subscription.status], ['Subjects monitored', subscription.subjects], ['Alerts reviewed', subscription.alertsReviewed], ['Included human reviews', `${subscription.included_reviews} / period`], ['Subscription end', shortDate(subscription.endsAt)]].map(([k, v]) => <div key={k as string} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="capitalize">{v}</dd></div>)}</dl> : <p className="text-xs text-ink-500">No monitoring plan.</p>}
                    <ButtonLink href={`${base}/monitoring-offer`} size="sm" variant="outline" className="mt-3 w-full">Manage Monitoring</ButtonLink>
                </Card>
                <Card title="Retention & record class">
                    <dl className="space-y-1 text-xs">{[['Record class', 'RC-B (Standard)'], ['Retention schedule', 'Standard Schedule'], ['Minimum retention', 'As per schedule*'], ['Legal hold', closure.legalHold ? 'Active' : 'None']].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd>{v}</dd></div>)}</dl>
                    <p className="mt-2 flex gap-1.5 rounded bg-parchment-100 p-2 text-[0.6875rem] text-ink-600"><Info className="size-3.5 shrink-0" aria-hidden="true" />Retention periods depend on law, purpose, dispute and legal hold. No fixed period is promised until approved.</p>
                </Card>
            </div>
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="xl:col-span-9">
                    <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                        <div><h2 className="text-base font-bold">Choose your next action</h2><p className="text-xs text-ink-500">Select the appropriate option for this case. Some actions require approvals.</p></div>
                        <p className="text-xs text-ink-500">Dual approval (Privacy Lead + Finance Controller) is required for deletion.</p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="radiogroup" aria-label="Closure options">
                        {OPTIONS.map((o) => (
                            <button key={o.key} type="button" role="radio" aria-checked={choice === o.key} onClick={() => setChoice(o.key)} className={cn('rounded-[10px] border-2 bg-white p-4 text-left', choice === o.key ? 'border-gold-500 ring-2 ring-gold-500/30' : o.tone)}>
                                <p className="flex items-center gap-2 font-semibold"><o.icon className="size-6 text-gold-600" aria-hidden="true" />{o.title}</p>
                                <p className="mt-1 text-xs text-ink-500">{o.body}</p>
                                <dl className="mt-3 space-y-0.5 text-[0.6875rem]"><div className="flex justify-between"><dt>Fee code</dt><dd className="font-mono">{o.code}</dd></div><div className="flex justify-between"><dt>Fee</dt><dd>{o.fee}</dd></div><div className="flex justify-between"><dt>Effect</dt><dd className="text-right">{o.effect}</dd></div></dl>
                            </button>
                        ))}
                    </div>
                    {(form.errors as Record<string, string>).action && <p className="mt-2 text-xs text-risk-500">{(form.errors as Record<string, string>).action}</p>}
                </div>
                <div className="space-y-4 xl:col-span-3">
                    <Card title="Approvals & completion">
                        <ul className="space-y-1.5 text-xs">
                            {[['Privacy Lead', approvals.privacy_lead], ['Finance Controller', approvals.finance_controller], ['Report Approver', Boolean(report)]].map(([l, ok]) => <li key={l as string} className="flex justify-between"><span>{l as string}</span><span className={ok ? 'text-verified-700' : 'text-attested-700'}>{ok ? 'Approved' : closure.action === 'delete' ? 'Pending' : 'Not required'}</span></li>)}
                        </ul>
                    </Card>
                    <Card title="Completion certificate">
                        <p className="text-xs text-ink-500">{closure.status === 'completed' ? `Certificate issued for ${closure.action?.replace('_', ' ')} on ${shortDate(closure.closedAt ?? c.updatedAt)}.` : 'Case closure certificate will be issued after the chosen action is completed.'}</p>
                        <p className="mt-2 flex items-center gap-1 text-[0.6875rem] text-verified-700"><ShieldCheck className="size-3.5" aria-hidden="true" />Your complaint, privacy and correction rights continue.</p>
                    </Card>
                </div>
            </div>
        </CaseLayout>
    );
}
