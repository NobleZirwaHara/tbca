import { Head, router } from '@inertiajs/react';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Advisory/shells';
import { Card, zar } from '@/Components/Advisory/ui';

interface Proposal { id: number; reference: string; kind: string; status: string; name: string | null; email: string | null; company: string | null; payload: Record<string, string>; created_at: string }
interface Change { id: number; reference: string; type: string; status: string; from_vehicle: string | null; to_vehicle: string | null; credit_zar: number; payable_now_zar: number; vehicle: { code: string; name: string } | null; created_at: string }

export default function Proposals({ proposals, changes }: { proposals: Proposal[]; changes: Change[] }) {
    return (
        <AdminShell title="Proposals & Vehicle Changes" description="Proposal requests, partner escalations and client vehicle transitions awaiting TBCA action.">
            <Head title="Proposals & Changes" />
            <Card title={`Proposal requests & escalations (${proposals.length})`}>
                <SimpleTable columns={['Reference', 'Kind', 'Name', 'Company', 'Need / reason', 'Received', 'Status']}
                    rows={proposals.map((p) => [<span className="font-mono text-xs">{p.reference}</span>, p.kind, <span>{p.name}<br /><span className="text-xs text-ink-500">{p.email}</span></span>, p.company, <span className="text-xs">{p.payload.family ?? p.payload.recommendation ?? ''} {p.payload.context ? `— ${p.payload.context.slice(0, 80)}` : ''}</span>, new Date(p.created_at).toLocaleDateString('en-ZA'),
                        <select aria-label={`Status for ${p.reference}`} value={p.status} onChange={(e) => router.post(`/admin/advisory/proposals/${p.id}`, { status: e.target.value }, { preserveScroll: true })} className="rounded border border-parchment-500 text-xs">{['submitted', 'in_review', 'proposal_sent', 'closed'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>])} empty="No proposal requests yet." />
            </Card>
            <Card title={`Vehicle changes (${changes.length})`} className="mt-4">
                <SimpleTable columns={['Reference', 'Type', 'Vehicle', 'From → To', 'Credit', 'Payable now', 'Status', 'Requested']}
                    rows={changes.map((c) => [<span className="font-mono text-xs">{c.reference}</span>, c.type, c.vehicle ? `${c.vehicle.code} ${c.vehicle.name}` : '—', `${c.from_vehicle ?? '—'} → ${c.to_vehicle ?? '—'}`, zar(c.credit_zar), zar(c.payable_now_zar), <StatusPill status={c.status} />, new Date(c.created_at).toLocaleDateString('en-ZA')])} empty="No vehicle change requests yet." />
            </Card>
        </AdminShell>
    );
}

Proposals.layout = null;
