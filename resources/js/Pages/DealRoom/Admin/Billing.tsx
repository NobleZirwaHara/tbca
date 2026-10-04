import { Head, Link, router } from '@inertiajs/react';
import { FolderLock } from 'lucide-react';
import { DEAL_ROOM_ADMIN_NAV } from '@/Components/DealRoom/AdminNav';
import { zar } from '@/Components/DealRoom/Ui';
import { Select } from '@/Components/ui/Form';
import { KpiTile, Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import type { Charge } from '@/types/deal-room';

interface Props { charges: (Charge & { room: string; slug: string })[]; filters: { status: string; kind: string } }

export default function AdminBilling({ charges, filters }: Props) {
    const filter = (k: string, v: string) => router.get('/admin/deal-room/billing', { ...filters, [k]: v }, { preserveState: true });
    const sum = (pred: (c: Charge) => boolean) => charges.filter(pred).reduce((a, c) => a + c.total, 0);
    return (
        <ConsoleLayout area="Deal Room Control Tower" areaIcon={FolderLock} groups={DEAL_ROOM_ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Virtual Deal Room', href: '/admin/deal-room' }, { label: 'Billing' }]} title="Billing & Invoices" description="Every VDR invoice with its checkout order and reconciliation state.">
            <Head title="Billing — Deal Room" />
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <KpiTile label="Invoices" value={charges.length} /><KpiTile label="Paid" value={zar(sum((c) => c.status === 'paid'))} tone="good" /><KpiTile label="Outstanding" value={zar(sum((c) => ['issued', 'awaiting_payment', 'failed'].includes(c.status)))} tone="warn" /><KpiTile label="Refunded" value={zar(charges.reduce((a, c) => a + c.refunded, 0))} />
            </div>
            <Panel title="Invoices" action={
                <div className="flex gap-2">
                    <Select aria-label="Kind" value={filters.kind} onChange={(e) => filter('kind', e.target.value)} className="h-8 w-40 text-xs" options={[{ value: '', label: 'All kinds' }, 'deposit', 'stage_fee', 'overage', 'plan_upgrade', 'change', 'third_party', 'closing', 'subscription', 'archive_renewal']} />
                    <Select aria-label="Status" value={filters.status} onChange={(e) => filter('status', e.target.value)} className="h-8 w-40 text-xs" options={[{ value: '', label: 'All statuses' }, 'issued', 'awaiting_payment', 'paid', 'failed', 'partially_refunded', 'refunded', 'cancelled']} />
                </div>
            }>
                <SimpleTable columns={['Invoice', 'Room', 'Kind', 'Description', 'Net', 'VAT', 'Total', 'Status', 'Order', 'Paid']} empty="No invoices." rows={charges.map((c) => [
                    <span key="r" className="font-mono text-xs">{c.reference}</span>, <Link key="l" href={`/admin/deal-room/rooms/${c.slug}`} className="text-controlled-700 hover:underline">{c.room}</Link>, c.kind.replace('_', ' '), c.description, zar(c.net), zar(c.vat), zar(c.total), <StatusPill key="s" status={c.status} />, c.order ?? '—', c.paidAt ?? '—',
                ])} />
            </Panel>
        </ConsoleLayout>
    );
}

AdminBilling.layout = null;
