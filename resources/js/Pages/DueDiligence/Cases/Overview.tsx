import type { ReactElement } from 'react';
import { Link } from '@inertiajs/react';
import { Activity, Briefcase, CheckCircle2, Circle, Flag, Hourglass, Lock, MinusCircle, ShieldCheck, Timer } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { Card, GoldLink, Ring, rand, shortDate } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { DdCasePageProps, DdCommercial, DdEvent } from '@/types/due-diligence';

interface Props extends DdCasePageProps {
    lifecycle: { stage: number; name: string; state: string; started: string | null; owner: string }[];
    snapshot: Record<string, string | number | null>;
    evidenceStats: { requiredItems: number; completeItems: number; pendingItems: number; documents: number; expectedDocuments: number; percent: number; inReview: number; approved: number };
    events: DdEvent[];
    alerts: { text: string; state: string }[];
    commercial: DdCommercial;
    nextAction: { title: string; body: string; href: string } | null;
}

const STATE_ICON: Record<string, ReactElement> = {
    completed: <CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" />,
    in_progress: <Hourglass className="size-4 text-gold-600" aria-hidden="true" />,
    locked: <Lock className="size-4 text-ink-300" aria-hidden="true" />,
    skipped: <MinusCircle className="size-4 text-ink-300" aria-hidden="true" />,
    not_started: <Circle className="size-4 text-ink-300" aria-hidden="true" />,
};

/** DD-032 Case Overview and Status (internal lifecycle 0-14). */
export default function Overview(props: Props) {
    const { case: c, lifecycle, snapshot, evidenceStats: ev, events, alerts, commercial, nextAction, coordinator } = props;
    const base = `/due-diligence/cases/${c.reference}`;
    const done = lifecycle.filter((l) => l.state === 'completed').length;
    const overdue = c.slaDueAt && new Date(c.slaDueAt) < new Date() && !['delivered', 'monitoring', 'closed'].includes(c.status);

    return (
        <CaseLayout
            page={props}
            active="overview"
            title="Case Overview and Status"
            subtitle="Understand scope, stages, owner, SLA and next action."
            actions={nextAction ? <ButtonLink href={nextAction.href} trailingIcon="arrow-right">Complete Required Action</ButtonLink> : undefined}
            aside={
                <>
                    {nextAction && (
                        <Card title="Required action">
                            <p className="text-[0.8125rem] font-semibold">{nextAction.title}</p>
                            <p className="text-xs text-ink-500">{nextAction.body}</p>
                            <p className="mt-1 text-xs text-risk-600">Due: {shortDate(c.slaDueAt)}</p>
                            <ButtonLink href={nextAction.href} size="sm" className="mt-3 w-full">Complete Required Action</ButtonLink>
                        </Card>
                    )}
                    <Card title="Case manager"><p className="text-sm font-semibold">{coordinator.name}</p><p className="text-xs text-ink-500">{coordinator.role}</p><p className="mt-1 text-xs">{coordinator.email} · {coordinator.phone}</p></Card>
                    <Card title="Fees & payment">
                        <dl className="space-y-1 text-xs">
                            <div className="flex justify-between"><dt className="text-ink-500">Payment State</dt><dd className="font-semibold text-verified-700">Paid</dd></div>
                            <div className="flex justify-between"><dt className="text-ink-500">Fees (ex VAT)</dt><dd>{rand(commercial.subtotal, 2)}</dd></div>
                            <div className="flex justify-between"><dt className="text-ink-500">External Costs*</dt><dd>At cost (approved)</dd></div>
                            <div className="flex justify-between"><dt className="text-ink-500">Entitlement</dt><dd className="font-semibold">{c.chips[5]?.value}</dd></div>
                            <div className="flex justify-between"><dt className="text-ink-500">Order</dt><dd className="font-mono">{commercial.orderReference}</dd></div>
                        </dl>
                    </Card>
                </>
            }
        >
            <Card title="Where you are in the journey (Lifecycle 0–14)">
                <ol className="flex gap-1 overflow-x-auto pb-1">
                    {lifecycle.map((l) => (
                        <li key={l.stage} className="flex min-w-16 flex-1 flex-col items-center text-center">
                            <span className={cn('flex size-8 items-center justify-center rounded-full text-xs font-bold', l.state === 'completed' ? 'bg-verified-500 text-white' : l.state === 'in_progress' ? 'bg-gold-500 text-ink-950' : 'bg-parchment-300 text-ink-500')}>{l.stage}</span>
                            <span className="mt-1 text-[0.625rem] leading-tight text-ink-600">{l.name}</span>
                        </li>
                    ))}
                </ol>
                <p className="mt-2 flex flex-wrap gap-4 text-[0.6875rem] text-ink-500"><span>● Completed</span><span className="text-gold-700">● In Progress</span><span>○ Not Started</span><span>🔒 Locked</span></p>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-[10px] border border-parchment-400 bg-white p-3"><Briefcase className="size-5 text-gold-600" aria-hidden="true" /><p className="mt-1 text-xs text-ink-500">Stage</p><p className="text-sm font-bold">{c.stageLabel}</p><p className="text-xs text-gold-700">Stage {c.stage} of 14</p></div>
                <div className="rounded-[10px] border border-parchment-400 bg-white p-3"><Timer className="size-5 text-gold-600" aria-hidden="true" /><p className="mt-1 text-xs text-ink-500">SLA Status</p><p className={cn('text-sm font-bold', overdue ? 'text-risk-600' : 'text-verified-700')}>{overdue ? 'Overdue' : 'On Track'}</p><p className="text-xs text-ink-500">Due: {shortDate(c.slaDueAt)}</p></div>
                <div className="flex items-center gap-3 rounded-[10px] border border-parchment-400 bg-white p-3"><Ring value={Math.round((done / 15) * 100)} size={64} /><div><p className="text-xs text-ink-500">Overall Progress</p><p className="text-xs">{done} of 15 stages complete</p></div></div>
                <div className="rounded-[10px] border border-parchment-400 bg-white p-3"><Activity className="size-5 text-gold-600" aria-hidden="true" /><p className="mt-1 text-xs text-ink-500">Next Step</p><p className="text-sm font-bold">{nextAction?.title ?? 'No action required'}</p></div>
                <div className="rounded-[10px] border border-parchment-400 bg-white p-3"><ShieldCheck className="size-5 text-gold-600" aria-hidden="true" /><p className="mt-1 text-xs text-ink-500">Risk Indicator</p><p className="text-sm font-bold">{c.chips[7]?.value.startsWith('RK1') ? 'Under human review' : 'No elevated risk'}</p><p className="text-xs text-ink-500">{c.chips[7]?.value}</p></div>
            </div>

            <div className="grid gap-4 xl:grid-cols-12">
                <Card title="Case snapshot" className="xl:col-span-4">
                    <dl className="space-y-1 text-xs">
                        {[['Service Option', c.package], ['Engagement Type', snapshot.engagement], ['Country / Jurisdiction', snapshot.jurisdiction], ['Subject Type', snapshot.subjectType], ['Boards / Directors', snapshot.directors], ['Shareholders / Beneficial Owners', snapshot.owners], ['Mandate Purpose', snapshot.purpose], ['Lawful Basis', snapshot.lawfulBasis], ['Data Residency', snapshot.residency]].map(([k, v]) => <div key={String(k)} className="grid grid-cols-2 gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}
                    </dl>
                </Card>
                <Card title="Stage progress detail" className="xl:col-span-5">
                    <div className="max-h-80 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="text-ink-500"><tr><th className="py-1">Stage</th><th>Name</th><th>Status</th><th>Started</th><th>Owner</th></tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {lifecycle.map((l) => (
                                    <tr key={l.stage} className={l.state === 'in_progress' ? 'bg-gold-50' : undefined}>
                                        <td className="py-1.5">{l.stage}</td><td>{l.name}</td>
                                        <td><span className="inline-flex items-center gap-1">{STATE_ICON[l.state]}{l.state.replace('_', ' ')}</span></td>
                                        <td>{l.started ? shortDate(l.started) : '—'}</td><td>{l.owner}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
                <Card title="Evidence summary" className="xl:col-span-3" action={<GoldLink href={`${base}/evidence`}>Evidence Hub</GoldLink>}>
                    <dl className="space-y-1.5 text-[0.8125rem]">
                        {[['Total Required', ev.requiredItems], ['Complete', ev.completeItems], ['Documents Submitted', ev.documents], ['In Review', ev.inReview], ['Approved', ev.approved]].map(([k, v]) => <div key={k as string} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
                        <div className="flex justify-between"><dt className="text-ink-500">Outstanding</dt><dd className="font-semibold text-risk-600">{ev.pendingItems}</dd></div>
                    </dl>
                </Card>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                <Card title="Recent activity"><ul className="space-y-2">{events.map((e) => <li key={e.code} className="text-xs"><span className="text-ink-400">{shortDate(e.at, true)}</span><br />{e.description} <span className="text-ink-400">({e.actor})</span></li>)}</ul></Card>
                <Card title="Alerts & notifications">
                    {alerts.length === 0 ? <p className="text-xs text-ink-500">No alerts.</p> : <ul className="space-y-2">{alerts.map((a) => <li key={a.text} className="flex gap-2 text-xs"><Flag className="size-4 shrink-0 text-attested-500" aria-hidden="true" /><span className="flex-1">{a.text}</span><span className="text-risk-600">{a.state}</span></li>)}</ul>}
                </Card>
                <Card title="Quick links">
                    <ul className="space-y-1.5 text-[0.8125rem]">
                        {[['Evidence Hub', 'evidence'], ['Consent Centre', 'consent'], ['Checks & Vendor Status', 'checks'], ['Audit Trail', 'consent']].map(([l, k]) => <li key={l}><Link href={`${base}/${k}`} className="flex justify-between hover:text-gold-700"><span>{l}</span><span className="text-gold-700">Open →</span></Link></li>)}
                    </ul>
                </Card>
            </div>
        </CaseLayout>
    );
}
