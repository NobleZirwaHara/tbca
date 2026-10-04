import { Link } from '@inertiajs/react';
import { ArrowRight, BarChart3, CreditCard, FileStack, FolderLock, MessagesSquare, Receipt, ShieldCheck, Users } from 'lucide-react';
import RoomShell, { roomUrl, stageHref } from '@/Components/DealRoom/RoomShell';
import { AuditPanel, Bar, Stat, zar } from '@/Components/DealRoom/Ui';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { Charge, Gate, RoomPageProps, UsageRow } from '@/types/deal-room';

interface Props extends RoomPageProps {
    gate: Gate;
    charges: Charge[];
    usage: UsageRow[];
    counts: { documents: number; parties: number; questions: number; approvals: number };
}

/** Room home: where the deal stands, what is blocking the next stage, and quick links. */
export default function Dashboard({ room, audit, gate, charges, usage, counts }: Props) {
    const current = room.stepper.find((s) => s.code === room.currentStage.code)!;
    const done = room.stepper.filter((s) => s.status === 'completed').length;
    const links = [
        { label: 'Data Room', href: 'data-room', icon: FolderLock, show: true },
        { label: 'Q&A', href: 'ai-qa-assistant', icon: MessagesSquare, show: room.stepper.find((s) => s.code === '5')?.status !== 'locked' },
        { label: 'Usage Dashboard', href: 'billing/usage-dashboard', icon: BarChart3, show: room.manages },
        { label: 'Monthly Statement', href: 'commercial/monthly-statement', icon: Receipt, show: room.manages },
        { label: 'Change Request', href: 'billing/change-request', icon: FileStack, show: room.manages },
        { label: 'Third-Party Approval', href: 'billing/third-party-approval', icon: ShieldCheck, show: room.manages },
        { label: 'Refund Request', href: 'billing/refund-request', icon: CreditCard, show: room.manages },
        { label: 'Fee Dispute', href: 'billing/fee-dispute', icon: CreditCard, show: room.manages },
        { label: 'Participants & Access', href: 'controlled-access-and-disclosure', icon: Users, show: room.manages && room.stepper.find((s) => s.code === '4')?.status !== 'locked' },
    ].filter((l) => l.show);

    return (
        <RoomShell room={room} title={room.name} eyebrow="Room Dashboard" description={`${room.transactionType} · ${room.company} · ${room.reference}`} badge={<StatusPill status={room.status} />} activeStage={room.currentStage.code}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <Stat label="Stages Complete" value={`${done} / ${room.stepper.length}`} tone="gold" />
                <Stat label="Documents" value={counts.documents} />
                <Stat label="Active Parties" value={counts.parties} />
                <Stat label="Open Questions" value={counts.questions} tone={counts.questions ? 'warn' : 'neutral'} />
                <Stat label="Pending Approvals" value={counts.approvals} tone={counts.approvals ? 'warn' : 'good'} />
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title={`Current Stage ${current.code}: ${current.name}`} className="lg:col-span-2" action={<Link href={stageHref(room.slug, current)} className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline">Open stage <ArrowRight className="size-3.5" aria-hidden /></Link>}>
                    <p className="text-xs text-ink-500">Completion test</p>
                    <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {gate.checks.map((c) => <li key={c.key} className={cn('rounded border px-2 py-1.5 text-xs', c.done ? 'border-verified-500/30 bg-verified-50 text-verified-700' : 'border-parchment-400 text-ink-600')}>{c.done ? '✓ ' : '○ '}{c.label}</li>)}
                        {gate.approvals.map((a) => <li key={a.id} className={cn('rounded border px-2 py-1.5 text-xs', a.status === 'approved' ? 'border-verified-500/30 bg-verified-50 text-verified-700' : 'border-parchment-400 text-ink-600')}>{a.status === 'approved' ? '✓ ' : '○ '}Approval: {a.role}</li>)}
                        {gate.fee && <li className={cn('rounded border px-2 py-1.5 text-xs', gate.fee.paid ? 'border-verified-500/30 bg-verified-50 text-verified-700' : 'border-parchment-400 text-ink-600')}>{gate.fee.paid ? '✓ ' : '○ '}Stage fee {gate.fee.code}</li>}
                    </ul>
                    <p className={cn('mt-3 text-xs font-semibold', gate.passed ? 'text-verified-700' : 'text-attested-700')}>{gate.passed ? 'Gate passes — the stage can be completed.' : `${gate.blockers.length} item(s) outstanding before the next stage unlocks.`}</p>
                </Panel>
                <Panel title="Quick Links">
                    <ul className="grid grid-cols-2 gap-2">
                        {links.map(({ label, href, icon: I }) => (
                            <li key={href}><Link href={roomUrl(room.slug, href)} className="flex items-center gap-2 rounded-[6px] border border-parchment-400 p-2 text-xs hover:border-gold-500"><I className="size-4 text-gold-600" aria-hidden />{label}</Link></li>
                        ))}
                    </ul>
                </Panel>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
                {room.manages && (
                    <Panel title="Recent Invoices" className="lg:col-span-2">
                        <SimpleTable columns={['Invoice', 'Description', 'Total', 'Status']} empty="No invoices yet." rows={charges.map((c) => [c.reference, c.description, zar(c.total), <StatusPill key={c.id} status={c.status} />])} />
                    </Panel>
                )}
                {room.manages && (
                    <Panel title="Usage This Period">
                        <ul className="space-y-2">
                            {usage.map((u) => <li key={u.key} className="text-xs"><span className="flex justify-between"><span>{u.label}</span><span>{u.used.toLocaleString()} / {u.included.toLocaleString()}</span></span><Bar value={u.pct} /></li>)}
                        </ul>
                    </Panel>
                )}
                <div className={room.manages ? 'lg:col-span-3' : 'lg:col-span-3'}><AuditPanel audit={audit} /></div>
            </div>
        </RoomShell>
    );
}
