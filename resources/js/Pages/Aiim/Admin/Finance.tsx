import { Head } from '@inertiajs/react';
import { Receipt } from 'lucide-react';
import { ADMIN_NAV } from '@/Components/Aiim/Nav';
import { ServiceRail, Split, type SvcRail } from '@/Components/Aiim/ProtoDesk';
import { Bars, Card, Kpi, Kpis, N, STable, StatusChip, useMoney } from '@/Components/Industries/Kit';
import ConsoleLayout from '@/Layouts/ConsoleLayout';

interface Order { reference: string; date: string; kind: string; label: string; payer: string; subtotal: number; total: number; status: string }
interface Props {
    saleable: number;
    listed: number;
    median: number | null;
    modules: { n: string; v: number }[];
    automation: { n: string; v: number }[];
    rail: SvcRail;
    ledger: { entries: number; net: number };
    orders: Order[];
}

const KIND: Record<string, string> = { topup: 'Wallet top-up', manifest: 'Premium intelligence', unlock: 'Metered unlock', brief: 'Premium brief', report: 'Report', deposit: 'Mandate deposit', balance: 'Mandate balance', 'scope-change': 'Scope change' };

/** AIIM mock 79: Finance Dashboard (prototype #finance-dash). Prices are the app's Sprint prices; the ledger is the app's AIIM ledger and orders. */
export default function Finance({ saleable, listed, median, modules, automation, rail, ledger, orders }: Props) {
    const money = useMoney();
    return (
        <ConsoleLayout area="AIIM Finance Area" areaIcon={Receipt} groups={ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'AIIM', href: '/admin/aiim' }, { label: 'Finance Dashboard' }]} title="Finance Dashboard" description="Page 79 · Price book and ledger">
            <Head title="AIIM Finance Dashboard" />
            <Split side={<ServiceRail rail={rail} />}>
                <Kpis>
                    <Kpi l="Saleable services" v={N(saleable)} s={saleable < listed ? `${N(listed)} listed; ${N(listed - saleable)} not in the app catalogue yet` : undefined} icon="tag" />
                    <Kpi l="Median entry price" v={money(median)} s="excl. VAT" icon="cash" />
                    <Kpi l="Ledger entries" v={N(ledger.entries)} icon="file" />
                    <Kpi l="Ledger net" v={money(ledger.net)} icon="bank" />
                </Kpis>
                <Card title="Average entry price by module"><Bars rows={modules.map((m) => ({ label: m.n, value: m.v, text: money(m.v) }))} /></Card>
                <Card title="Average automation now vs 36 months (AIIM)"><Bars rows={automation.map((a) => ({ label: a.n, value: a.v, text: `${a.v}%` }))} /></Card>
                <Card title="Recent AIIM transactions">
                    <div id="transactions">
                        {orders.length ? (
                            <STable compact head={['Date', 'Order', 'Type', 'Description', 'Payer', 'Amount (ex VAT)', 'Total', 'Status']} rows={orders.map((o) => [o.date, <span key="r" className="font-mono">{o.reference}</span>, KIND[o.kind] ?? (o.kind || '—'), o.label, o.payer || '—', money(o.subtotal), money(o.total), <StatusChip key="s" s={o.status} />])} />
                        ) : <p className="text-[0.82rem] text-ink-400">No AIIM orders yet.</p>}
                    </div>
                </Card>
            </Split>
        </ConsoleLayout>
    );
}

Finance.layout = null;
