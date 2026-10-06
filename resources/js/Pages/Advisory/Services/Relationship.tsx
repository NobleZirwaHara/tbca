import { Head, Link } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { ServicesPortal } from '@/Components/Advisory/shells';
import { CHART, Donut, KV, Stat, zar } from '@/Components/Advisory/ui';
import type { VehicleRow } from '@/types/advisory';

interface Props {
    client: string;
    vehicles: VehicleRow[];
    since: string | null;
    upcoming: VehicleRow[];
    counts: { total: number; active: number; on_hold: number; completed: number; cancelled: number };
    activity: { reference: string; type: string; status: string; to_vehicle: string | null; created_at: string }[];
}

export default function Relationship({ client, vehicles, since, upcoming, counts, activity }: Props) {
    const outstanding = vehicles.reduce((s, v) => s + v.outstanding, 0);
    const invoiced = vehicles.reduce((s, v) => s + v.invoiced, 0);
    const paid = vehicles.reduce((s, v) => s + v.paid, 0);
    const avgHealth = Math.round(vehicles.reduce((s, v) => s + (v.health ?? 0), 0) / Math.max(1, vehicles.length));
    const health = avgHealth >= 85 ? 'Excellent' : avgHealth >= 70 ? 'Good' : 'Needs attention';
    return (
        <ServicesPortal title="Cross-Vehicle Relationship Dashboard" description={`One relationship. Every vehicle. Complete visibility. · ${client}`}>
            <Head title="Relationship Dashboard" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                <Stat label="Active Vehicles" value={counts.active} sub="Across all categories" icon="briefcase" />
                <Stat label="Total Outstanding" value={zar(outstanding)} sub="Across all vehicles" tone="bad" />
                <Stat label="Upcoming Due (30 days)" value={zar(upcoming.reduce((s, v) => s + v.outstanding, 0))} sub={`${upcoming.length} items`} tone="warn" />
                <Stat label="Total Invoiced (YTD)" value={zar(invoiced)} sub="Including VAT" />
                <Stat label="Relationship Since" value={since ?? '—'} />
                <Stat label="Relationship Health" value={health} sub={`Average health ${avgHealth}%`} tone={avgHealth >= 85 ? 'good' : 'warn'} />
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-12">
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-8">
                    <h2 className="mb-3 text-sm font-semibold">Your Active Vehicles</h2>
                    <SimpleTable
                        columns={['Vehicle / Engagement', 'Type', 'Status', 'Start', 'Next Due', 'Outstanding', 'Health', 'Action']}
                        rows={vehicles.map((v) => [
                            <span><b className="block">{v.name}</b><span className="text-xs text-ink-500">{v.label}</span></span>,
                            v.type, <StatusPill status={v.status} />, v.start, v.next_due ?? '—',
                            <span className={v.outstanding ? 'text-risk-700' : ''}>{zar(v.outstanding)}</span>,
                            <span className="text-xs">{(v.health ?? 0) >= 85 ? 'Excellent' : (v.health ?? 0) >= 70 ? 'Good' : 'Watch'}<span className="ml-1 inline-block h-1.5 w-10 rounded bg-parchment-300 align-middle"><span className="block h-full rounded bg-verified-500" style={{ width: `${v.health ?? 0}%` }} /></span></span>,
                            <Link href={`/services/vehicles/${v.code}/fees`} className="rounded border border-parchment-500 px-2 py-1 text-xs">View details</Link>,
                        ])}
                    />
                </section>
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-4">
                    <h2 className="text-sm font-semibold">Outstanding by Vehicle</h2>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                        <Donut slices={vehicles.map((v, i) => ({ value: v.outstanding, color: CHART[i % CHART.length] }))} center={zar(outstanding)} sub="Total" />
                        <ul className="space-y-1 text-xs">
                            {vehicles.map((v, i) => (
                                <li key={v.code} className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: CHART[i % CHART.length] }} />{v.name}: {zar(v.outstanding)} ({outstanding ? Math.round((v.outstanding / outstanding) * 100) : 0}%)</li>
                            ))}
                        </ul>
                    </div>
                    <h3 className="mt-5 text-sm font-semibold">Upcoming Due (Next 30 Days)</h3>
                    <ul className="mt-2 space-y-1 text-xs">
                        {upcoming.map((v) => <li key={v.code} className="flex justify-between gap-2"><span>{v.name}</span><span>{v.next_due}</span><span className="text-risk-700">{zar(v.outstanding)}</span></li>)}
                        {upcoming.length === 0 && <li className="text-ink-500">Nothing due in the next 30 days.</li>}
                    </ul>
                </section>
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-3">
                    <h2 className="text-sm font-semibold">Relationship Overview</h2>
                    <KV rows={[['Total Vehicles', counts.total], ['Active', counts.active], ['On Hold', counts.on_hold], ['Completed', counts.completed], ['Cancelled', counts.cancelled]]} />
                </section>
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-3">
                    <h2 className="text-sm font-semibold">Financial Summary (YTD)</h2>
                    <KV rows={[['Total Invoiced (Incl. VAT)', zar(invoiced)], ['Total Paid (Incl. VAT)', zar(paid)], ['Total Outstanding', <span className="text-risk-700">{zar(outstanding)}</span>], ['Credit Balance', 'R0']]} />
                </section>
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-3">
                    <h2 className="text-sm font-semibold">Recent Activity</h2>
                    <ul className="mt-2 space-y-1.5 text-xs">
                        {activity.map((a) => <li key={a.reference} className="flex gap-1.5"><CircleCheck className="size-3.5 text-verified-500" />{a.type} {a.to_vehicle ? `→ ${a.to_vehicle}` : ''} <StatusPill status={a.status} /></li>)}
                        <li className="flex gap-1.5"><CircleCheck className="size-3.5 text-verified-500" />Payment received – Retainer: Tax & Advisory</li>
                        <li className="flex gap-1.5"><CircleCheck className="size-3.5 text-verified-500" />Sprint milestone completed – Operational Efficiency</li>
                    </ul>
                </section>
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-3">
                    <h2 className="text-sm font-semibold">Your Account Team</h2>
                    <ul className="mt-2 space-y-2 text-xs">
                        {[['Lerato M.', 'Relationship Manager'], ['Johan S.', 'Project Lead'], ['Nomsa K.', 'Client Support']].map(([n, r]) => (
                            <li key={n} className="flex items-center justify-between gap-2"><span><b className="block">{n}</b>{r}</span><a href="https://wa.me/27608011365" className="rounded border border-parchment-500 px-2 py-1">Send Message</a></li>
                        ))}
                    </ul>
                </section>
            </div>
        </ServicesPortal>
    );
}

Relationship.layout = null;
