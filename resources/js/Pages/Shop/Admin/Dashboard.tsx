import { Link } from '@inertiajs/react';
import { Ban, CheckCircle2, ClipboardList, Package, Receipt, Rocket, ShoppingCart, TriangleAlert } from 'lucide-react';
import AdminShell from '@/Components/Shop/AdminShell';
import { BarList, Card, Donut, fmtDate, Kpi, KpiGrid } from '@/Components/Shop/AdminKit';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';

interface Props {
    kpis: { products: number; passed: number; warning: number; blocked: number; purchasable: number; orders_paid: number; quotes_open: number; release: string };
    byAct: { act: string; count: number; blocked: number }[];
    byState: { state: string; label: string; count: number }[];
    recent: { actor: string; action: string; subject: string; summary: string; created_at: string }[];
}

export default function Dashboard({ kpis, byAct, byState, recent }: Props) {
    return (
        <AdminShell title="Gate Metrics Dashboard" description="Live governance health across the Online Shop catalogue, commerce queues and release state." badge="Governance">
            <KpiGrid cols={4}>
                <Kpi icon={<Package className="size-5" />} label="Product Masters" value={kpis.products} caption={`${kpis.purchasable} purchasable now`} />
                <Kpi icon={<CheckCircle2 className="size-5" />} label="Passed Gate" value={kpis.passed} tone="good" />
                <Kpi icon={<TriangleAlert className="size-5" />} label="Warnings (Review)" value={kpis.warning} tone="warn" />
                <Kpi icon={<Ban className="size-5" />} label="Blocked by Gate" value={kpis.blocked} tone="bad" />
                <Kpi icon={<ShoppingCart className="size-5" />} label="Paid Orders" value={kpis.orders_paid} tone="info" />
                <Kpi icon={<Receipt className="size-5" />} label="Open Quote Requests" value={kpis.quotes_open} tone="warn" />
                <Kpi icon={<Rocket className="size-5" />} label="Release Status" value={<span className="capitalize">{kpis.release}</span>} tone={kpis.release === 'authorised' ? 'good' : 'warn'} />
                <Kpi icon={<ClipboardList className="size-5" />} label="Audit Events (recent)" value={recent.length} />
            </KpiGrid>

            <div className="grid gap-4 lg:grid-cols-3">
                <Donut title="Gate Health Overview" segments={[{ label: 'Passed', value: kpis.passed }, { label: 'Warnings', value: kpis.warning, color: '#d6a32e' }, { label: 'Blocked', value: kpis.blocked, color: '#b5372a' }]} />
                <Card title="Products by Commercial Act">
                    <BarList rows={byAct.map((a) => ({ label: `${a.act} (${a.blocked} blocked)`, value: a.count }))} />
                </Card>
                <Card title="Listing-State Distribution">
                    <BarList rows={byState.map((s) => ({ label: `${s.state} ${s.label}`, value: s.count }))} />
                </Card>
            </div>

            <Card title="Recent Governance Activity" action={<Link href="/admin/shop/audit" className="text-xs font-semibold text-verified-700">View Audit Trail →</Link>}>
                <SimpleTable
                    columns={['When', 'Actor', 'Action', 'Subject', 'Summary']}
                    rows={recent.map((e) => [fmtDate(e.created_at, true), e.actor, <StatusPill key="a" status={e.action} tone="info" />, <span key="s" className="font-mono text-xs">{e.subject}</span>, e.summary])}
                />
            </Card>
        </AdminShell>
    );
}

Dashboard.layout = null;
