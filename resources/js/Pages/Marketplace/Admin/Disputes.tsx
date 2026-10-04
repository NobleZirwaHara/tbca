import { Head } from '@inertiajs/react';
import { StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Marketplace/Shells';
import { Card, Donut, MiniBar, Notice, zar } from '@/Components/Marketplace/ui';
import { ActionMenu, FilterSelect, KpiRow, QueryTabs, SmallTag, Table, td } from '@/Components/Marketplace/AdminKit';
import type { MkDispute, RegisterNav } from '@/types/marketplace';

interface Props {
    nav: RegisterNav;
    disputes: (MkDispute & { actions: { key: string; label: string }[] })[];
    counts: Record<string, number>;
    byType: { label: string; value: number }[];
    query: { tab: string; kind: string };
}

const URL = '/admin/marketplace/disputes';

export default function Disputes({ nav, disputes, counts, byType, query }: Props) {
    const maxType = Math.max(...byType.map((b) => b.value), 1);

    return (
        <AdminShell nav={nav} crumbs={[{ label: 'Marketplace', href: '/admin/marketplace' }, { label: 'Billing & Payments' }, { label: 'Dispute and Chargeback Console' }]} title="Dispute and Chargeback Console" description="Monitor, manage and resolve client disputes, provider grievances and appeals, chargebacks and payment disputes.">
            <Head title="Dispute and Chargeback Console" />
            <KpiRow items={[{ label: 'Total Disputes', value: counts.all, caption: 'All time' }, { label: 'Open Disputes', value: counts.open, tone: 'warn', caption: 'Require action' }, { label: 'Escalated', value: counts.escalated, tone: 'bad', caption: 'Escalated to provider / network' }, { label: 'Won', value: counts.won, tone: 'good', caption: 'Resolved – upheld' }, { label: 'Lost', value: counts.lost, caption: 'Not upheld / chargeback upheld' }, { label: 'Closed', value: counts.closed }]} />
            <div className="mt-5 grid gap-5 xl:grid-cols-12">
                <div className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-9">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <QueryTabs url={URL} query={query} tabs={{ all: 'All', open: 'Open', escalated: 'Escalated', won: 'Won', lost: 'Lost', closed: 'Closed' }} counts={counts} />
                        <FilterSelect url={URL} query={query} name="kind" label="Case type" options={['dispute', 'grievance', 'appeal', 'chargeback']} />
                    </div>
                    <div className="mt-4">
                        <Table head={['Dispute ID', 'Engagement ID / Title', 'Provider', 'Type', 'Reason', 'Amount (ZAR)', 'Status', 'Raised On', 'Due Date', 'Actions']} empty={disputes.length === 0}>
                            {disputes.map((d) => (
                                <tr key={d.reference}>
                                    <td className={td}><span className="font-mono text-xs text-controlled-600">{d.reference}</span><SmallTag>{d.kind}</SmallTag></td>
                                    <td className={td}><span className="font-mono text-xs">{d.engagementRef}</span><p className="text-xs">{d.engagementTitle}</p></td>
                                    <td className={td}>{d.providerName}</td><td className={td}>{d.type}</td><td className={td}><span className="text-xs">{d.subject}</span></td>
                                    <td className={td}>{zar(d.amountZar)}</td><td className={td}><StatusPill status={d.status} /></td><td className={td}>{d.raisedOn}</td>
                                    <td className={td}>{d.responseDue}{d.responseDaysLeft !== null && !['closed', 'won', 'lost', 'withdrawn'].includes(d.status) && <span className="block text-xs text-risk-600">{d.responseDaysLeft} days left</span>}</td>
                                    <td className={td}><ActionMenu url={`${URL}/${d.reference}`} actions={d.actions.map((a) => ({ ...a, needsNote: ['decide', 'uphold', 'reject', 'escalate'].includes(a.key) }))} /></td>
                                </tr>
                            ))}
                        </Table>
                    </div>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Dispute Status Overview"><Donut items={[{ label: 'Open', value: counts.open }, { label: 'Escalated', value: counts.escalated }, { label: 'Won', value: counts.won }, { label: 'Lost', value: counts.lost }, { label: 'Closed', value: counts.closed }]} total={counts.all} label="Dispute status" /></Card>
                    <Card title="Dispute Reasons (Top 5)"><ul className="space-y-2 text-xs">{byType.map((b) => <li key={b.label}><div className="flex justify-between"><span>{b.label}</span><span>{b.value}</span></div><MiniBar value={b.value} max={maxType} tone="blue" /></li>)}</ul></Card>
                    <Card title="What You Can Do"><ul className="list-disc space-y-1 pl-4 text-xs text-ink-600"><li>Respond to open disputes within SLA</li><li>Request supporting evidence</li><li>Communicate with provider and client</li><li>Escalate to the platform review team</li></ul></Card>
                </aside>
            </div>
            <Notice tone="info" className="mt-5">Respond to disputes within SLA to avoid automatic escalation and chargebacks. Resolving a client dispute releases any provider payout held for that engagement.</Notice>
        </AdminShell>
    );
}

Disputes.layout = null;
