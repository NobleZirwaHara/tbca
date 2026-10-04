import { AlarmClock, CheckCircle2, CircleDollarSign, CreditCard, HandCoins, Handshake, Scale, ShieldCheck, TriangleAlert, UserX, Workflow } from 'lucide-react';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { CheckList, LabelValues } from '@/Components/Products/Shared';
import { ConsoleBtn, SubAdminShell, money, post } from '@/Components/Products/Subscriptions/Admin';
import { Card, ClassChip, StatTile, shortDate } from '@/Components/Products/Subscriptions/ui';
import { Donut, Funnel } from '@/Components/Products/Subscriptions/charts';
import type { SubOpRow } from '@/Components/Products/Subscriptions/types';

type Case = SubOpRow & { days_overdue: number };

interface Props {
    cases: Case[];
    platform: { reference: string; client: string | null; plan: string; amount_zar: number; status: string; stage: string; failed_at: string | null; days_overdue: number }[];
    aging: [string, number][];
    funnel: [string, number][];
    closed: number;
    stages: string[];
}

const PATH = '/admin/products/subscriptions/dunning';

export default function Dunning({ cases, platform, aging, funnel, closed, stages }: Props) {
    const open = cases.filter((c) => !['Recovered', 'Churned'].includes(c.status ?? ''));
    const atRisk = cases.filter((c) => c.status === 'At Risk');
    const churned = cases.filter((c) => c.status === 'Churned');
    const recovered = cases.filter((c) => c.status === 'Recovered');
    const sum = (rows: SubOpRow[]) => rows.reduce((s, r) => s + (r.amount_zar ?? 0), 0);

    return (
        <SubAdminShell
            title="Dunning and Involuntary Churn Console"
            description="Monitor payment failures, run dunning workflows, and manage involuntary churn with fairness and compliance."
            strip={[
                { icon: Scale, title: 'Fair & Transparent', body: 'Clear communication at every stage.' },
                { icon: CircleDollarSign, title: 'No Hidden Charges', body: 'No additional dunning or recovery fees.' },
                { icon: Handshake, title: 'Right to Engage', body: 'Contact us to discuss payment options.' },
                { icon: Workflow, title: 'Automated & Consistent', body: 'Rules applied equally to all clients.' },
                { icon: HandCoins, title: 'Recover & Retain', body: 'Our goal is recovery, not cancellation.' },
            ]}
            note="Involuntary churn is only triggered after final notice and expiry of the grace period. Payment failure never cancels a subscription silently and never destroys client data."
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={AlarmClock} tone="red" label="Overdue Invoices" value={open.length + platform.length} caption={money(sum(open) + platform.reduce((s, p) => s + p.amount_zar, 0))} />
                <StatTile icon={CreditCard} tone="orange" label="Payment Failures (Platform)" value={platform.length} caption="Live subscriptions in grace / past due" />
                <StatTile icon={Workflow} tone="purple" label="In Dunning" value={open.length} caption={money(sum(open))} />
                <StatTile icon={TriangleAlert} tone="orange" label="At Risk of Churn" value={atRisk.length} caption={money(sum(atRisk))} />
                <StatTile icon={UserX} tone="red" label="Involuntary Churn" value={churned.length + closed} caption="Closed for non-payment (CH-INV)" />
                <StatTile icon={CheckCircle2} tone="green" label="Recovered" value={recovered.length} caption={money(sum(recovered))} />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
                <Card title="Dunning Aging Buckets (Invoices)">
                    <Donut data={aging} center={String(aging.reduce((s, a) => s + a[1], 0))} caption="Invoices" size={120} />
                </Card>
                <Card title="Dunning Funnel (Active Accounts)">
                    <Funnel data={funnel} />
                </Card>
                <Card title="Dunning Settings Snapshot">
                    <LabelValues
                        rows={[
                            { label: 'Stages', value: stages.join(' → ') },
                            { label: 'Max dunning notices', value: 3 },
                            { label: 'Client timeline', value: 'Day 0 fail · Day 1 reminder · Day 3 retry · Day 7 final · Day 10 access paused' },
                            { label: 'Auto churn', value: 'Only after final notice' },
                            { label: 'Recovery fees', value: 'None' },
                        ]}
                    />
                </Card>
            </div>

            <Card title="Platform subscriptions in payment recovery">
                <SimpleTable
                    columns={['Subscription', 'Client', 'Plan', 'Failed On', 'Days Overdue', 'Amount (ex VAT)', 'Stage', 'Status', 'Actions']}
                    rows={platform.map((p) => [
                        <span className="font-mono text-xs">{p.reference}</span>,
                        p.client ?? '—',
                        p.plan,
                        shortDate(p.failed_at),
                        <span className="font-semibold text-risk-700">{p.days_overdue}</span>,
                        money(p.amount_zar),
                        <StatusPill status={p.stage} tone={p.stage === 'Final Notice Sent' ? 'bad' : 'warn'} />,
                        <StatusPill status={p.status} />,
                        <span className="flex flex-wrap gap-1">
                            {p.stage !== 'Final Notice Sent' && <ConsoleBtn onClick={() => post(`${PATH}/subscription/${p.reference}`, { action: 'notice' })}>Send Next Notice</ConsoleBtn>}
                            <ConsoleBtn tone="gold" onClick={() => post(`${PATH}/subscription/${p.reference}`, { action: 'paid' })}>Mark Paid Outside Portal</ConsoleBtn>
                            {p.stage === 'Final Notice Sent' && <ConsoleBtn tone="danger" onClick={() => post(`${PATH}/subscription/${p.reference}`, { action: 'churn' }, 'Close this subscription for non-payment? History and data are retained.')}>Close (CH-INV)</ConsoleBtn>}
                        </span>,
                    ])}
                    empty="No platform subscriptions are in payment recovery."
                />
            </Card>

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <Card title="Dunning Queue (Oldest First)">
                    <SimpleTable
                        columns={['Account / Client', 'Plan', 'Invoice', 'Due Date', 'Days Overdue', 'Amount (ex VAT)', 'Dunning Stage', 'Last Contact', 'Status', 'Actions']}
                        rows={cases.map((c) => [
                            c.client,
                            <span className="flex items-center gap-1">{c.recurrence_class && <ClassChip code={c.recurrence_class} compact />}{c.plan_name}</span>,
                            <span className="font-mono text-xs">{c.data.invoice}</span>,
                            shortDate(c.due_at),
                            <span className="font-semibold text-risk-700">{c.days_overdue}</span>,
                            money(c.amount_zar),
                            <StatusPill status={c.data.stage} tone={c.data.stage === 'Final Notice Sent' ? 'bad' : 'warn'} />,
                            <span>
                                {shortDate(c.data.last_contact)}
                                <span className="block text-xs text-ink-500">{c.data.channel}</span>
                            </span>,
                            <StatusPill status={c.status ?? ''} tone={c.status === 'Recovered' ? 'good' : c.status === 'Churned' ? 'bad' : c.status === 'At Risk' ? 'warn' : 'info'} />,
                            <span className="flex flex-wrap gap-1">
                                {!['Recovered', 'Churned'].includes(c.status ?? '') && (
                                    <>
                                        {c.data.stage !== 'Final Notice Sent' && <ConsoleBtn onClick={() => post(`${PATH}/${c.id}`, { action: 'notice' })}>Send Notice</ConsoleBtn>}
                                        <ConsoleBtn onClick={() => post(`${PATH}/${c.id}`, { action: 'arrangement' })}>Arrangement</ConsoleBtn>
                                        <ConsoleBtn tone="gold" onClick={() => post(`${PATH}/${c.id}`, { action: 'paid' })}>Mark Paid</ConsoleBtn>
                                        {c.data.stage === 'Final Notice Sent' && <ConsoleBtn tone="danger" onClick={() => post(`${PATH}/${c.id}`, { action: 'churn' }, `Churn ${c.client} involuntarily?`)}>Churn</ConsoleBtn>}
                                    </>
                                )}
                                {c.status === 'Churned' && <ConsoleBtn onClick={() => post(`${PATH}/${c.id}`, { action: 'reactivate' })}>Reactivate</ConsoleBtn>}
                            </span>,
                        ])}
                    />
                </Card>
                <div className="space-y-5">
                    <Card title="Dunning Compliance">
                        <CheckList items={['Fair Treatment Active', 'POPIA Compliant', 'NCR Compliant', 'Audit Trail Enabled', 'Communication Opt-out Respected']} />
                    </Card>
                    <Card title="Involuntary Churn Summary">
                        <LabelValues
                            rows={[
                                { label: 'Churned (queue)', value: churned.length },
                                { label: 'Closed for non-payment (platform)', value: closed },
                                { label: 'MRR lost (queue)', value: money(sum(churned)) },
                                { label: 'Recovered accounts', value: recovered.length },
                            ]}
                        />
                    </Card>
                    <p className="flex items-center gap-1.5 text-xs text-ink-500">
                        <ShieldCheck className="size-4" aria-hidden="true" /> Every action is written to the audit trail.
                    </p>
                </div>
            </div>
        </SubAdminShell>
    );
}

Dunning.layout = null;
