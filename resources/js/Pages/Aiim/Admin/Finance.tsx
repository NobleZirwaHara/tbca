import { Head } from '@inertiajs/react';
import { Receipt } from 'lucide-react';
import { Donut } from '@/Components/Aiim/Charts';
import { zar2 } from '@/Components/Aiim/format';
import { ADMIN_NAV } from '@/Components/Aiim/Nav';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { KpiTile, Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';

interface Props {
    totals: { revenue: number; vat: number; outstanding: number; count: number; paid: number; failed: number };
    byKind: Record<string, number>;
    orders: { reference: string; date: string; kind: string; label: string; payer: string; subtotal: number; total: number; status: string }[];
}

const KIND: Record<string, string> = { topup: 'Wallet Top-ups', manifest: 'Premium Intelligence', unlock: 'Metered Unlocks', brief: 'Premium Briefs', report: 'Reports', deposit: 'Mandate Deposits', balance: 'Mandate Balances', 'scope-change': 'Scope Changes' };

export default function Finance({ totals, byKind, orders }: Props) {
    const rate = totals.count ? Math.round((totals.paid / totals.count) * 100) : 0;
    return (
        <ConsoleLayout area="AIIM Finance Area" areaIcon={Receipt} groups={ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'AIIM', href: '/admin/aiim' }, { label: 'Finance Dashboard' }]} title="Finance Dashboard" description="Real-time financial overview of AIIM operations, revenue, collections and payouts (live AIIM orders).">
            <Head title="AIIM Finance Dashboard" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <KpiTile label="Total Revenue (ex VAT)" value={zar2(totals.revenue)} />
                <KpiTile label="VAT Collected" value={zar2(totals.vat)} />
                <KpiTile label="Outstanding Receivables" value={zar2(totals.outstanding)} tone="warn" />
                <KpiTile label="Collection Rate" value={`${rate}%`} tone="good" />
                <KpiTile label="Total Transactions" value={totals.count} caption={`Paid ${totals.paid} | Failed ${totals.failed}`} />
                <KpiTile label="External Admin Margin" value="25%" caption="Disclosed on external costs" />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <Panel title="Revenue by Category (ex VAT)">{Object.keys(byKind).length ? <Donut data={Object.entries(byKind).map(([k, v]) => ({ label: KIND[k] ?? k, value: Math.round(v) }))} /> : <p className="text-sm text-ink-500">No paid AIIM orders yet.</p>}</Panel>
                <Panel title="Recent Transactions" className="lg:col-span-2">
                    <div id="transactions">
                        <SimpleTable columns={['Date', 'Order', 'Type', 'Description', 'Payer', 'Amount (ex VAT)', 'Total', 'Status']} rows={orders.map((o) => [o.date, <span key="r" className="font-mono">{o.reference}</span>, KIND[o.kind] ?? o.kind, o.label, o.payer, zar2(o.subtotal), zar2(o.total), <StatusPill key="s" status={o.status} />])} empty="No AIIM orders yet." />
                    </div>
                </Panel>
            </div>
        </ConsoleLayout>
    );
}

Finance.layout = null;
