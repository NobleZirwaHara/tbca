import { Head, Link } from '@inertiajs/react';
import { FolderLock } from 'lucide-react';
import { DEAL_ROOM_ADMIN_NAV } from '@/Components/DealRoom/AdminNav';
import { ApprovalList, AuditPanel, Bar, CheckItem, zar } from '@/Components/DealRoom/Ui';
import { ButtonLink } from '@/Components/ui/Button';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import type { AuditEntry, Charge, CommercialRequestRow, Gate, StepperStage, UsageSummary } from '@/types/deal-room';
import { DisputeActions } from './Requests';

interface Props {
    room: { slug: string; reference: string; name: string; company: string; owner: string | null; stage: string; stageName: string; status: string; documents: number; parties: number; updated: string; transactionType: string | null; transactionGroup: string | null; raiseBand: string | null };
    stages: (StepperStage & { gate: Gate | null })[];
    charges: Charge[];
    requests: CommercialRequestRow[];
    audit: AuditEntry[];
    usage: UsageSummary;
}

export default function AdminRoom({ room, stages, charges, requests, audit, usage }: Props) {
    const open = stages.filter((s) => s.gate);
    return (
        <ConsoleLayout area="Deal Room Control Tower" areaIcon={FolderLock} groups={DEAL_ROOM_ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Virtual Deal Room', href: '/admin/deal-room' }, { label: room.reference }]}
            title={room.name} badge={<StatusPill status={room.status} />} description={`${room.company} · owner ${room.owner ?? '—'} · Stage ${room.stage} ${room.stageName}${room.transactionType ? ` · ${room.transactionType}` : ''}${room.raiseBand ? ` · ${room.raiseBand}` : ''}`}
            actions={<ButtonLink href={`/virtual-deal-room/rooms/${room.slug}`} size="sm" variant="outline">Open room as TBCA</ButtonLink>}>
            <Head title={`${room.reference} — Control Tower`} />
            <Panel title="Stage Machine">
                <ol className="flex flex-wrap gap-1">
                    {stages.map((s) => <li key={s.code} title={s.name} className={`rounded px-2 py-1 text-[0.6875rem] font-semibold ${s.status === 'completed' ? 'bg-verified-50 text-verified-700' : s.status === 'unlocked' ? 'bg-gold-100 text-gold-800' : 'bg-parchment-300 text-ink-400'}`}>{s.code} {s.short}</li>)}
                </ol>
            </Panel>
            {open.map((s) => (
                <Panel key={s.code} title={`Open gate — Stage ${s.code}: ${s.name}`} className="mt-5">
                    <div className="grid gap-4 md:grid-cols-3">
                        <ul className="space-y-1">{s.gate!.checks.map((c) => <CheckItem key={c.key} done={c.done}>{c.label}</CheckItem>)}</ul>
                        <ApprovalList slug={room.slug} approvals={s.gate!.approvals} isAdmin isOwner={false} />
                        <div className="text-xs">{s.gate!.fee ? <>Stage fee {s.gate!.fee.code}: {zar(s.gate!.fee.net)} — <StatusPill status={s.gate!.fee.paid ? 'paid' : 'unpaid'} /></> : 'No stage fee.'}<p className="mt-2 font-semibold">{s.gate!.passed ? 'Gate passes.' : `${s.gate!.blockers.length} blocker(s).`}</p></div>
                    </div>
                </Panel>
            ))}
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <Panel title="Invoices"><SimpleTable columns={['Invoice', 'Kind', 'Total', 'Status', 'Order']} empty="No invoices." rows={charges.map((c) => [c.reference, c.kind.replace('_', ' '), zar(c.total), <StatusPill key="s" status={c.status} />, c.order ?? '—'])} /></Panel>
                <Panel title="Usage (this period)"><ul className="space-y-2">{usage.rows.map((u) => <li key={u.key} className="text-xs"><span className="flex justify-between"><span>{u.label}</span><span>{u.used.toLocaleString()} / {u.included.toLocaleString()} · forecast {u.forecast.toLocaleString()}</span></span><Bar value={u.pct} /></li>)}</ul><p className="mt-2 text-xs">Projected overage: <strong>{zar(usage.projectedOverage)}</strong></p></Panel>
            </div>
            <Panel title="Commercial Requests" className="mt-5">
                {requests.length === 0 ? <p className="text-xs text-ink-400">No requests.</p> : (
                    <ul className="space-y-3">
                        {requests.map((r) => (
                            <li key={r.id} className="rounded border border-parchment-400 p-3">
                                <p className="flex flex-wrap items-center gap-2 text-xs"><code className="font-semibold">{r.reference}</code><span className="capitalize">{r.type.replace('_', ' ')}</span><StatusPill status={r.status} /><span className="ml-auto font-semibold">{zar(r.amount)}</span></p>
                                <ApprovalList slug={room.slug} approvals={r.approvals} isAdmin isOwner={false} />
                                {r.type === 'dispute' && <DisputeActions r={r} />}
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>
            <div className="mt-5"><AuditPanel audit={audit} /></div>
            <p className="mt-4 text-xs"><Link href="/admin/deal-room" className="text-gold-700 underline">Back to Control Tower</Link></p>
        </ConsoleLayout>
    );
}

AdminRoom.layout = null;
