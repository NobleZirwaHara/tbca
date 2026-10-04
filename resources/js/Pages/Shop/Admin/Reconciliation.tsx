import { AlertTriangle, CheckCircle2, Clock, DollarSign, RefreshCw, RotateCcw } from 'lucide-react';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, BarList, Card, Donut, FilterBar, Kpi, KpiGrid, fmtDate, fmtZar, pct } from '@/Components/Shop/AdminKit';

interface Row { reference: string; customer: string; date: string | null; total: number; status: string; qbo: string | null; entitlement: string | null; entitlement_type: string | null; entitlement_status: string | null; match: string }
interface Props { rows: Row[]; kpis: Record<string, number | string | null>; ledgers: Record<string, number>; exceptions: { reason: string; count: number }[]; filters: Record<string, string> }

const LEDGER_NAMES: Record<string, string> = { T: 'T - TBCA consideration', X: 'X - Pass-through', S: 'S - Tax / statutory', C: 'C - Credit / refunds' };

function ReconciliationConsole({ rows, kpis, ledgers, exceptions, filters }: Props) {
    const n = (k: string) => Number(kpis[k] ?? 0);
    return (
        <AdminShell title="QBO and Entitlement Reconciliation" badge="Finance Integrity"
            description="Reconcile paid orders in QuickBooks Online Plus with entitlements issued in the Entitlement Service. Every monetary settlement must have a matching entitlement or approved exception."
            actions={<>
                <ActionButton href="/admin/shop/reconciliation/run" tone="primary"><RefreshCw className="size-3.5" /> Run Reconciliation</ActionButton>
                <a href="#exceptions" className="inline-flex h-8 items-center rounded-[4px] border border-parchment-500 px-2.5 text-xs font-semibold">Exceptions</a>
            </>}>
            <p className="text-xs text-ink-500">Last reconciliation run: {fmtDate(kpis.last_run as string | null, true)} · Auto-run: Daily 06:00</p>
            <KpiGrid cols={5}>
                <Kpi icon={<DollarSign className="size-5" />} label="Total Paid Orders (QBO)" value={n('paid')} caption={fmtZar(n('paid_value'))} />
                <Kpi icon={<CheckCircle2 className="size-5" />} tone="good" label="Matched with Entitlement" value={`${n('matched')} (${pct(n('matched'), n('paid'))})`} caption={fmtZar(n('matched_value'))} />
                <Kpi icon={<Clock className="size-5" />} tone="warn" label="Pending Entitlement" value={n('pending')} />
                <Kpi icon={<AlertTriangle className="size-5" />} tone="bad" label="Mismatch / Exception" value={n('mismatch')} />
                <Kpi icon={<RotateCcw className="size-5" />} tone="info" label="Refunds (QBO)" value={n('refunds')} caption={fmtZar(n('refund_value'))} />
            </KpiGrid>
            <FilterBar path="/admin/shop/reconciliation" filters={filters} selects={[{ name: 'match', label: 'Match Status', options: ['matched', 'pending', 'mismatch'] }]} />
            <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
                <Card title={<span>Reconciliation Overview {n('pending') + n('mismatch') === 0 && <span className="ml-2 rounded bg-verified-50 px-2 py-0.5 text-[0.6875rem] text-verified-700">All Systems Balanced</span>}</span>}>
                    <SimpleTable columns={['Order ID (Shop)', 'QBO Invoice', 'Customer', 'Order Date', 'Amount (ZAR)', 'QBO Status', 'Entitlement ID', 'Entitlement Type', 'Entitlement Status', 'Match Status', 'Actions']} rows={rows.map((r) => [
                        <span key="o" className="font-mono text-xs">{r.reference}</span>,
                        r.qbo ? <span key="q" className={r.status === 'refunded' ? 'text-risk-700' : 'text-controlled-700'}>{r.status === 'refunded' ? r.qbo.replace('INV', 'CR') + ' (Refund)' : r.qbo}</span> : '-',
                        r.customer, fmtDate(r.date, true), r.status === 'refunded' ? <span key="t" className="text-risk-700">({fmtZar(r.total)})</span> : fmtZar(r.total),
                        <StatusPill key="s" status={r.status} />, r.entitlement ? <span key="e" className="font-mono text-[0.6875rem]">{r.entitlement}</span> : '-', r.entitlement_type ?? '-',
                        r.entitlement_status ? <StatusPill key="es" status={r.entitlement_status === 'active' ? 'issued' : r.entitlement_status} /> : <StatusPill key="es" status="pending" />,
                        <StatusPill key="m" status={r.match} tone={r.match === 'matched' ? 'good' : r.match === 'pending' ? 'warn' : 'bad'} />,
                        <ActionButton key="a" href={`/admin/shop/reconciliation/${r.reference}`}>Reconcile</ActionButton>,
                    ])} empty="No paid orders yet." />
                </Card>
                <div className="space-y-4">
                    <Donut title="Reconciliation Summary (This Period)" centre={n('paid')} caption="Total Orders" segments={[{ label: 'Matched', value: n('matched') }, { label: 'Pending', value: n('pending') }, { label: 'Mismatch / Exception', value: n('mismatch'), color: '#b5372a' }]} />
                    <Card title="Value Reconciliation (Four Ledgers)"><BarList format={fmtZar} rows={Object.entries(LEDGER_NAMES).map(([k, label]) => ({ label, value: ledgers[k] ?? 0 }))} /></Card>
                    <div id="exceptions"><Card title="Top Exception Reasons">{exceptions.length ? <ul className="space-y-1.5 text-xs">{exceptions.map((x) => <li key={x.reason} className="flex justify-between"><span className="flex gap-1.5"><AlertTriangle className="size-3.5 text-risk-500" />{x.reason}</span><strong>{x.count}</strong></li>)}</ul> : <p className="text-xs text-ink-500">No exceptions. Every settlement has a matching entitlement.</p>}</Card></div>
                    <Card title="Controls & Integrity"><ul className="space-y-1 text-xs">{['Daily Auto Reconciliation', 'Idempotent Posting (hash key)', 'Entitlement Blocking (Unreconciled)', 'Audit Trail', 'Exception Workflow'].map((c) => <li key={c} className="flex justify-between"><span>✓ {c}</span><span className="text-verified-700">Enabled</span></li>)}</ul></Card>
                </div>
            </div>
        </AdminShell>
    );
}

ReconciliationConsole.layout = null;
export default ReconciliationConsole;
