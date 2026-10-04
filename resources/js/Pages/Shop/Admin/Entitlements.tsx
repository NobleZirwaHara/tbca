import { Key, ShieldOff, ShieldCheck, Clock } from 'lucide-react';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, FilterBar, Kpi, KpiGrid, fmtDate } from '@/Components/Shop/AdminKit';

interface Row { id: number; reference: string; name: string; item_code: string; type: string; authority: string; status: string; email: string | null; order: string | null; starts_at: string | null; ends_at: string | null }

function EntitlementsConsole({ rows, counts, filters }: { rows: Row[]; counts: Record<string, number>; filters: Record<string, string> }) {
    return (
        <AdminShell title="Entitlements Console" description="Entitlements issued by the Entitlement Service. Authority must be VERIFIED_PAYMENT, APPROVED_CONTRACT, APPROVED_CREDIT or APPROVED_FREE_BASIS.">
            <KpiGrid cols={4}>
                <Kpi icon={<ShieldCheck className="size-5" />} tone="good" label="Active" value={counts.active ?? 0} />
                <Kpi icon={<Clock className="size-5" />} tone="warn" label="Pending" value={counts.pending ?? 0} />
                <Kpi icon={<ShieldOff className="size-5" />} tone="bad" label="Revoked" value={counts.revoked ?? 0} />
                <Kpi icon={<Key className="size-5" />} label="Total" value={Object.values(counts).reduce((a, b) => a + b, 0)} />
            </KpiGrid>
            <FilterBar path="/admin/shop/entitlements" filters={filters} search={false} selects={[
                { name: 'status', label: 'Status', options: ['active', 'pending', 'revoked', 'expired'] },
                { name: 'authority', label: 'Authority', options: ['VERIFIED_PAYMENT', 'APPROVED_CONTRACT', 'APPROVED_CREDIT', 'APPROVED_FREE_BASIS'] },
            ]} />
            <SimpleTable columns={['Entitlement', 'Product', 'Type', 'Authority', 'Holder', 'Order', 'Valid', 'Status', 'Actions']} rows={rows.map((r) => [
                <span key="r" className="font-mono text-xs">{r.reference}</span>,
                <span key="n">{r.name}<span className="block text-[0.6875rem] text-ink-400">{r.item_code}</span></span>,
                r.type, <span key="a" className="text-xs">{r.authority.replace(/_/g, ' ')}</span>, r.email ?? '-', r.order ?? '-',
                <span key="v" className="text-xs">{fmtDate(r.starts_at)} - {r.ends_at ? fmtDate(r.ends_at) : 'open'}</span>,
                <StatusPill key="s" status={r.status} />,
                r.status === 'active'
                    ? <ActionButton key="x" href={`/admin/shop/entitlements/${r.id}/status`} data={{ status: 'revoked' }} tone="bad" confirm="Revoke this entitlement?">Revoke</ActionButton>
                    : <ActionButton key="x" href={`/admin/shop/entitlements/${r.id}/status`} data={{ status: 'active' }} tone="good">Reinstate</ActionButton>,
            ])} empty="No entitlements issued yet." />
        </AdminShell>
    );
}

EntitlementsConsole.layout = null;
export default EntitlementsConsole;
