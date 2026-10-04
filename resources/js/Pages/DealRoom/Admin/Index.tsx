import { Head, Link, router } from '@inertiajs/react';
import { FolderLock } from 'lucide-react';
import { useState } from 'react';
import { DEAL_ROOM_ADMIN_NAV } from '@/Components/DealRoom/AdminNav';
import { ApprovalList, zar } from '@/Components/DealRoom/Ui';
import { Input, Select } from '@/Components/ui/Form';
import { KpiTile, Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import type { ApprovalRow } from '@/types/deal-room';

interface RoomRow { slug: string; reference: string; name: string; company: string; owner: string | null; stage: string; stageName: string; status: string; documents: number; parties: number; updated: string }
interface Props {
    rooms: RoomRow[];
    approvals: (ApprovalRow & { subject: string; room: string; slug: string })[];
    kpis: { rooms: number; active: number; paused: number; requests: number; collected: number; outstanding: number };
    stageDistribution: { code: string; short: string; count: number }[];
    filters: { status: string; q: string };
}

/** Deal Room Control Tower: every room, stage distribution and TBCA-side approvals awaiting a decision. */
export default function AdminIndex({ rooms, approvals, kpis, stageDistribution, filters }: Props) {
    const [q, setQ] = useState(filters.q);
    const max = Math.max(1, ...stageDistribution.map((s) => s.count));
    return (
        <ConsoleLayout area="Deal Room Control Tower" areaIcon={FolderLock} groups={DEAL_ROOM_ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Virtual Deal Room' }]} title="Virtual Deal Room — Control Tower" description="Rooms, stage gates, TBCA approvals and commercial exposure.">
            <Head title="Deal Room Control Tower" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <KpiTile label="Rooms" value={kpis.rooms} /><KpiTile label="Active" value={kpis.active} tone="good" /><KpiTile label="Paused" value={kpis.paused} tone={kpis.paused ? 'bad' : 'neutral'} />
                <KpiTile label="Open Requests" value={kpis.requests} tone="warn" /><KpiTile label="Collected" value={zar(kpis.collected)} tone="gold" /><KpiTile label="Outstanding" value={zar(kpis.outstanding)} tone="warn" />
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <Panel title="Stage Distribution" className="xl:col-span-2">
                    <div className="flex h-36 items-end gap-1" role="img" aria-label="Rooms by current stage">
                        {stageDistribution.map((s) => (
                            <div key={s.code} className="flex flex-1 flex-col items-center gap-1" title={`${s.short}: ${s.count}`}>
                                <span className="text-[0.625rem] font-semibold">{s.count || ''}</span>
                                <div className="w-full rounded-t bg-gold-500" style={{ height: `${(s.count / max) * 100}px`, minHeight: s.count ? 4 : 1, opacity: s.count ? 1 : 0.2 }} />
                                <span className="text-[0.625rem] text-ink-500">{s.code}</span>
                            </div>
                        ))}
                    </div>
                </Panel>
                <Panel title={`TBCA Approvals Awaiting Decision (${approvals.length})`}>
                    {approvals.length === 0 ? <p className="text-xs text-ink-400">Nothing waiting.</p> : (
                        <ul className="max-h-80 space-y-3 overflow-y-auto">
                            {approvals.map((a) => (
                                <li key={a.id} className="rounded border border-parchment-400 p-2">
                                    <p className="text-xs"><Link href={`/admin/deal-room/rooms/${a.slug}`} className="font-semibold hover:underline">{a.room}</Link> · <code>{a.subject}</code></p>
                                    <ApprovalList slug={a.slug} approvals={[a]} isAdmin isOwner={false} />
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>
            <Panel title="Rooms" className="mt-5" action={
                <form onSubmit={(e) => { e.preventDefault(); router.get('/admin/deal-room', { q, status: filters.status }, { preserveState: true }); }} className="flex gap-2">
                    <Input aria-label="Search rooms" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, reference, company" className="h-8 w-56 text-xs" />
                    <Select aria-label="Status filter" value={filters.status} onChange={(e) => router.get('/admin/deal-room', { q, status: e.target.value }, { preserveState: true })} options={[{ value: '', label: 'All statuses' }, 'active', 'paused', 'closed', 'archived']} className="h-8 w-36 text-xs" />
                </form>
            }>
                <SimpleTable columns={['Reference', 'Room', 'Owner', 'Stage', 'Status', 'Docs', 'Parties', 'Updated']} empty="No rooms match." rows={rooms.map((r) => [
                    <Link key="r" href={`/admin/deal-room/rooms/${r.slug}`} className="font-mono text-xs text-controlled-700 hover:underline">{r.reference}</Link>,
                    <span key="n"><span className="font-medium">{r.name}</span><span className="block text-[0.6875rem] text-ink-400">{r.company}</span></span>,
                    r.owner ?? '—', `${r.stage} · ${r.stageName}`, <StatusPill key="s" status={r.status} />, r.documents, r.parties, r.updated,
                ])} />
            </Panel>
        </ConsoleLayout>
    );
}

AdminIndex.layout = null;
