import { Link } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock, Coins, Receipt, RotateCcw } from 'lucide-react';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, FilterBar, Kpi, KpiGrid, Pager, fmtDate, fmtZar } from '@/Components/Shop/AdminKit';
import type { Paginated } from '@/types/shop';

interface Row { reference: string; section: string; status: string; customer: string; email: string | null; date: string | null; total: number; items: string; qbo: string | null; entitlement: string | null; match: string }
interface Props { orders: Paginated<Row>; kpis: Record<string, number>; sections: string[]; filters: Record<string, string> }

function OrdersConsole({ orders, kpis, sections, filters }: Props) {
    return (
        <AdminShell title="Orders & Accounting" description="Every checkout order across all sections, with payment status, QBO posting and entitlement match.">
            <KpiGrid>
                <Kpi icon={<CheckCircle2 className="size-5" />} tone="good" label="Paid Orders" value={kpis.paid} caption={fmtZar(kpis.paid_value)} />
                <Kpi icon={<Clock className="size-5" />} tone="warn" label="Awaiting Payment" value={kpis.awaiting} />
                <Kpi icon={<AlertTriangle className="size-5" />} tone="bad" label="Failed" value={kpis.failed} />
                <Kpi icon={<RotateCcw className="size-5" />} tone="info" label="Refunded" value={kpis.refunded} />
                <Kpi icon={<Coins className="size-5" />} label="VAT Collected" value={fmtZar(kpis.vat)} />
                <Kpi icon={<Receipt className="size-5" />} label="Orders (filtered)" value={orders.total} />
            </KpiGrid>
            <FilterBar path="/admin/shop/orders" filters={filters} selects={[
                { name: 'status', label: 'Status', options: ['awaiting_payment', 'paid', 'failed', 'refunded', 'cancelled'].map((s) => ({ value: s, label: s.replace('_', ' ') })) },
                { name: 'section', label: 'Section', options: sections },
            ]} />
            <SimpleTable
                columns={['Order', 'Customer', 'Section', 'Items', 'Date', 'Total', 'Status', 'QBO', 'Entitlement', 'Match', 'Actions']}
                rows={orders.data.map((o) => [
                    <Link key="r" href={`/checkout/${o.reference}/confirmation`} className="font-mono text-xs text-controlled-700 hover:underline">{o.reference}</Link>,
                    <span key="c">{o.customer}<span className="block text-[0.6875rem] text-ink-400">{o.email}</span></span>,
                    o.section,
                    <span key="i" className="line-clamp-2 max-w-48 text-xs">{o.items}</span>,
                    fmtDate(o.date, true),
                    fmtZar(o.total),
                    <StatusPill key="s" status={o.status} />,
                    o.qbo ?? '-',
                    o.entitlement ? <span key="e" className="font-mono text-[0.6875rem]">{o.entitlement}</span> : '-',
                    <StatusPill key="m" status={o.match} tone={o.match === 'matched' ? 'good' : o.match === 'pending' ? 'warn' : o.match === 'mismatch' ? 'bad' : 'neutral'} />,
                    <div key="a" className="flex gap-1">
                        {(o.status === 'paid' || o.status === 'refunded') && <ActionButton href={`/admin/shop/reconciliation/${o.reference}`}>Reconcile</ActionButton>}
                        {o.status === 'paid' && <ActionButton href={`/admin/shop/orders/${o.reference}/refund`} tone="bad" confirm={`Refund ${o.reference}? Entitlements will be revoked.`}>Refund</ActionButton>}
                    </div>,
                ])}
                empty="No orders match these filters."
            />
            <Pager links={orders.links} />
        </AdminShell>
    );
}

OrdersConsole.layout = null;
export default OrdersConsole;
