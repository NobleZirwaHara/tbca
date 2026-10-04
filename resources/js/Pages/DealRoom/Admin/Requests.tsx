import { Head, Link, router, useForm } from '@inertiajs/react';
import { FolderLock } from 'lucide-react';
import { DEAL_ROOM_ADMIN_NAV } from '@/Components/DealRoom/AdminNav';
import { ApprovalList, zar } from '@/Components/DealRoom/Ui';
import { Button } from '@/Components/ui/Button';
import { Select } from '@/Components/ui/Form';
import { Panel, StatusPill } from '@/Components/ui/Kit';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import type { CommercialRequestRow } from '@/types/deal-room';

/** Dispute workflow controls: start review, propose a resolution with credit, or reject. */
export function DisputeActions({ r }: { r: CommercialRequestRow }) {
    const form = useForm({ action: 'propose', resolution: '', credit: 0 });
    if (!['submitted', 'under_review'].includes(r.status)) return null;
    const url = `/admin/deal-room/requests/${r.id}/review`;
    return (
        <div className="mt-2 space-y-2 rounded bg-parchment-100 p-2 text-xs">
            <p>{r.payload.dispute_type}: {r.payload.reason}</p>
            {r.status === 'submitted' && <Button type="button" size="sm" variant="outline" onClick={() => router.post(url, { action: 'start_review' }, { preserveScroll: true })}>Start review</Button>}
            <form onSubmit={(e) => { e.preventDefault(); form.post(url, { preserveScroll: true }); }} className="flex flex-wrap items-end gap-2">
                <label className="min-w-48 flex-1">Resolution<input value={form.data.resolution} onChange={(e) => form.setData('resolution', e.target.value)} className="mt-0.5 h-8 w-full rounded border border-parchment-500 px-2" /></label>
                <label className="w-28">Credit (ZAR)<input type="number" min={0} max={r.amount} value={form.data.credit} onChange={(e) => form.setData('credit', Number(e.target.value))} className="mt-0.5 h-8 w-full rounded border border-parchment-500 px-2" /></label>
                <Button type="submit" size="sm" disabled={!form.data.resolution}>Propose resolution</Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => router.post(url, { action: 'reject', resolution: form.data.resolution || 'Dispute not upheld after review.' }, { preserveScroll: true })}>Reject</Button>
            </form>
            {form.errors.resolution && <p className="text-risk-500">{form.errors.resolution}</p>}
        </div>
    );
}

interface Props { requests: (CommercialRequestRow & { room: string; slug: string })[]; filters: { type: string; status: string } }

export default function AdminRequests({ requests, filters }: Props) {
    const filter = (k: string, v: string) => router.get('/admin/deal-room/requests', { ...filters, [k]: v }, { preserveState: true });
    return (
        <ConsoleLayout area="Deal Room Control Tower" areaIcon={FolderLock} groups={DEAL_ROOM_ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Virtual Deal Room', href: '/admin/deal-room' }, { label: 'Requests' }]} title="Commercial Requests" description="Change requests, third-party appointments, overages, refunds, fee disputes and restarts.">
            <Head title="Commercial Requests — Deal Room" />
            <div className="mb-4 flex flex-wrap gap-2">
                <Select aria-label="Type" value={filters.type} onChange={(e) => filter('type', e.target.value)} className="h-9 w-48" options={[{ value: '', label: 'All types' }, { value: 'change', label: 'Change requests' }, { value: 'third_party', label: 'Third-party' }, { value: 'overage', label: 'Overage' }, { value: 'refund', label: 'Refunds' }, { value: 'dispute', label: 'Disputes' }, { value: 'restart', label: 'Restarts' }]} />
                <Select aria-label="Status" value={filters.status} onChange={(e) => filter('status', e.target.value)} className="h-9 w-48" options={[{ value: '', label: 'All statuses' }, 'submitted', 'under_review', 'resolution_proposed', 'approved', 'resolved', 'rejected']} />
            </div>
            {requests.length === 0 ? <Panel><p className="text-sm text-ink-400">No requests match.</p></Panel> : (
                <div className="space-y-3">
                    {requests.map((r) => (
                        <Panel key={r.id}>
                            <p className="flex flex-wrap items-center gap-2 text-sm"><code className="font-semibold">{r.reference}</code><span className="capitalize">{r.type.replace('_', ' ')}</span><StatusPill status={r.status} /><Link href={`/admin/deal-room/rooms/${r.slug}`} className="text-xs text-controlled-700 hover:underline">{r.room}</Link><span className="ml-auto font-semibold">{zar(r.amount)}</span></p>
                            <p className="mt-1 text-xs text-ink-500">Raised by {r.raisedBy} · {r.createdAt}{r.charge ? ` · Invoice ${r.charge.reference} (${r.charge.status})` : ''}</p>
                            <ApprovalList slug={r.slug} approvals={r.approvals} isAdmin isOwner={false} />
                            {r.type === 'dispute' && <DisputeActions r={r} />}
                            {r.resolution && <p className="mt-2 rounded bg-parchment-200 p-2 text-xs">{r.resolution}</p>}
                        </Panel>
                    ))}
                </div>
            )}
        </ConsoleLayout>
    );
}

AdminRequests.layout = null;
