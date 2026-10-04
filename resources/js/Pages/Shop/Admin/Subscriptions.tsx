import { router } from '@inertiajs/react';
import { Box, CalendarClock, Clock, Info, Play, ShieldCheck, ShieldX, Timer } from 'lucide-react';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, Card, Donut, FilterBar, fmtDate, GateIcon, Kpi, KpiGrid, pct } from '@/Components/Shop/AdminKit';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';

interface Row { slug: string; code: string; name: string; vehicle: string; sku: string; period: string; price_incl: number | null; r: Record<string, string>; overall: string; mandate: string; certified_at: string | null; expires_at: string | null; state: string | null }
interface Props {
    rows: Row[];
    requirements: { key: string; title: string; body: string }[];
    kpis: { total: number; certified: number; pending: number; not_certified: number; expiring: number; last: string | null; mandates: number };
    reasons: { reason: string; count: number }[];
    filters: Record<string, string>;
}

const R = ['r1', 'r2', 'r3', 'r4', 'r5'];

export default function Subscriptions({ rows, requirements, kpis, reasons, filters }: Props) {
    const captured = rows.filter((r) => r.mandate === 'captured').length;
    return (
        <AdminShell
            title="Subscription Recurrence Certification"
            description="Certify that subscriptions have native recurring capability, honest features and compliant delivery before they can be sold."
            actions={<ActionButton href="/admin/shop/subscriptions/audit" tone="primary"><Play className="size-4" /> Run Recurrence Audit</ActionButton>}
        >
            <KpiGrid>
                <Kpi icon={<Box className="size-5" />} label="Subscription-Available Products" value={kpis.total} tone="info" />
                <Kpi icon={<ShieldCheck className="size-5" />} label="Certified (R1-R5 Passed)" value={kpis.certified} caption={pct(kpis.certified, kpis.total)} tone="good" />
                <Kpi icon={<Clock className="size-5" />} label="Pending Certification" value={kpis.pending} caption={pct(kpis.pending, kpis.total)} tone="warn" />
                <Kpi icon={<ShieldX className="size-5" />} label="Not Certified (Blocked)" value={kpis.not_certified} caption={pct(kpis.not_certified, kpis.total)} tone="bad" />
                <Kpi icon={<CalendarClock className="size-5" />} label="Expiring Certifications (30 Days)" value={kpis.expiring} tone="warn" />
                <Kpi icon={<Timer className="size-5" />} label="Last Audit Run" value={<span className="text-sm">{fmtDate(kpis.last, true)}</span>} caption={`${kpis.mandates} active mandates`} />
            </KpiGrid>

            <FilterBar path="/admin/shop/subscriptions" filters={filters} search={false} selects={[{ name: 'status', label: 'Recurrence Status', options: [{ value: 'certified', label: 'Certified' }, { value: 'pending', label: 'Pending' }, { value: 'not_certified', label: 'Not Certified' }, { value: 'expiring', label: 'Expiring' }] }]} />

            <div className="grid gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-9">
                    <Card title="R1-R5 Certification Framework">
                        <SimpleTable columns={['R#', 'Requirement', 'Description']} rows={requirements.map((r) => [<strong key="k">{r.key}</strong>, r.title, <span key="b" className="text-xs">{r.body}</span>])} />
                        <p className="mt-3 flex gap-2 rounded-[6px] border border-controlled-500/30 bg-controlled-50 p-2.5 text-xs text-ink-700"><Info className="size-4 shrink-0 text-controlled-700" /> All five requirements (R1-R5) must be PASSED to enable a product for sale as a subscription.</p>
                    </Card>
                    <Card title="Subscription Recurrence Certification Register">
                        <SimpleTable
                            columns={['Sprint Code', 'Sprint Name', 'SKU', 'Billing Period', 'Price (Incl. VAT)', ...R.map((k) => k.toUpperCase()), 'Overall Status', 'R5 Mandate State', 'Certification Date', 'Expiry Date', 'Actions']}
                            rows={rows.map((r) => [
                                <span key="c" className="font-mono text-xs">{r.code}</span>, r.name, <span key="s" className="font-mono text-[0.6875rem]">{r.sku}</span>, r.period,
                                r.price_incl === null ? '-' : `ZAR ${r.price_incl.toFixed(2)}`,
                                ...R.map((k) => (
                                    <label key={k} className="flex flex-col items-center gap-1">
                                        <GateIcon state={r.r[k]} />
                                        <span className="sr-only">{k.toUpperCase()} status for {r.name}</span>
                                        <select
                                            className="h-6 rounded border border-parchment-500 bg-white text-[0.625rem]"
                                            value={r.r[k]}
                                            onChange={(e) => router.post(`/admin/shop/subscriptions/${r.slug}/requirement`, { key: k, status: e.target.value }, { preserveScroll: true })}
                                        >
                                            <option value="pass">pass</option>
                                            <option value="pending">pending</option>
                                            <option value="fail">fail</option>
                                        </select>
                                    </label>
                                )),
                                <StatusPill key="o" status={r.overall.replace('_', ' ')} tone={r.overall === 'certified' ? 'good' : r.overall === 'not_certified' ? 'bad' : 'warn'} />,
                                <StatusPill key="m" status={r.mandate.replace('_', ' ')} tone={r.mandate === 'captured' ? 'good' : r.mandate === 'pending' ? 'warn' : 'bad'} />,
                                fmtDate(r.certified_at), fmtDate(r.expires_at),
                                <ActionButton key="a" href={`/admin/shop/subscriptions/${r.slug}/certify`} tone="good" disabled={r.overall === 'certified'}>Certify</ActionButton>,
                            ])}
                        />
                    </Card>
                </div>
                <div className="space-y-4 xl:col-span-3">
                    <Donut title="Certification Health" segments={[{ label: 'Certified', value: kpis.certified - kpis.expiring }, { label: 'Pending', value: kpis.pending, color: '#d6a32e' }, { label: 'Not Certified', value: kpis.not_certified, color: '#b5372a' }, { label: 'Expired / Expiring', value: kpis.expiring, color: '#7a4fa3' }]} />
                    <Donut title="R5 Mandate Capture Status" segments={[{ label: 'Captured', value: captured }, { label: 'Not Captured', value: rows.length - captured, color: '#b5372a' }]} />
                    <Card title="Top Reasons for Not Certified">
                        <ul className="space-y-1.5 text-xs">{reasons.map((r) => <li key={r.reason} className="flex justify-between gap-2"><span>{r.reason}</span><span className="font-semibold">{r.count}</span></li>)}</ul>
                    </Card>
                </div>
            </div>
        </AdminShell>
    );
}

Subscriptions.layout = null;
