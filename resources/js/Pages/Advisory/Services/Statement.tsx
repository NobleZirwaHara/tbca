import { Head, Link } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { ServicesPortal } from '@/Components/Advisory/shells';
import { KV, Stat, zar } from '@/Components/Advisory/ui';
import type { VehicleRow } from '@/types/advisory';

interface Props {
    vehicles: VehicleRow[];
    totals: { count: number; invoiced: number; paid: number; outstanding: number; overdue: number; upcoming: number; upcoming_count: number };
    orders: { reference: string; status: string; total_zar: number; created_at: string }[];
}

const typeTone: Record<string, string> = { Mandate: 'bg-referenced-50 text-referenced-700', Sprint: 'bg-controlled-50 text-controlled-700', Subscription: 'bg-verified-50 text-verified-700', Product: 'bg-attested-50 text-attested-700', Retainer: 'bg-gold-100 text-gold-800' };

export default function Statement({ vehicles, totals, orders }: Props) {
    const firstDue = vehicles.find((v) => v.outstanding > 0);
    return (
        <ServicesPortal title="Multi-Vehicle Statement of Account" description="One view. Every vehicle. Total clarity. Your consolidated statement across all active engagements, subscriptions and products.">
            <Head title="Multi-Vehicle Statement" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Stat label="Total vehicles" value={totals.count} sub="Active engagements" icon="briefcase" />
                <Stat label="Total invoiced (incl. VAT)" value={zar(totals.invoiced)} sub="All time" icon="receipt" />
                <Stat label="Total paid (incl. VAT)" value={zar(totals.paid)} sub="All time" tone="good" />
                <Stat label="Outstanding balance" value={zar(totals.outstanding)} sub="Due" tone="bad" />
                <Stat label="Upcoming due (next 30 days)" value={zar(totals.upcoming)} sub={`${totals.upcoming_count} items`} tone="warn" />
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-12">
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-9">
                    <h2 className="mb-3 text-sm font-semibold">Your vehicles</h2>
                    <SimpleTable
                        columns={['Vehicle / Engagement', 'Type', 'Status', 'Start date', 'Total invoiced', 'Paid', 'Outstanding', 'Next due', 'Action']}
                        rows={vehicles.map((v) => [
                            <span><b className="block text-ink-900">{v.name}</b><span className="text-xs text-ink-500">{v.label}</span></span>,
                            <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${typeTone[v.type] ?? ''}`}>{v.type}</span>,
                            <StatusPill status={v.status} />,
                            v.start,
                            zar(v.invoiced),
                            zar(v.paid),
                            <span className={v.outstanding > 0 ? 'font-semibold text-risk-700' : 'text-verified-700'}>{zar(v.outstanding)}</span>,
                            v.next_due ?? '—',
                            <Link href={`/services/vehicles/${v.code}/fees`} className="rounded border border-parchment-500 px-2 py-1 text-xs hover:border-gold-500">View details</Link>,
                        ])}
                    />
                    <div className="mt-3 flex flex-wrap justify-between gap-2">
                        <Button variant="outline" size="sm" icon="download" onClick={() => window.print()}>Download full statement (PDF)</Button>
                        <Link href="/services/relationship" className="text-xs font-semibold text-controlled-700">View relationship dashboard →</Link>
                    </div>
                    {orders.length > 0 && (
                        <div className="mt-5">
                            <h3 className="mb-2 text-sm font-semibold">Statement history (payments via portal)</h3>
                            <SimpleTable columns={['Order', 'Date', 'Total', 'Status']} rows={orders.map((o) => [<Link href={`/checkout/${o.reference}`} className="font-mono text-xs underline">{o.reference}</Link>, new Date(o.created_at).toLocaleDateString('en-ZA'), zar(o.total_zar), <StatusPill status={o.status} />])} />
                        </div>
                    )}
                </section>
                <aside className="space-y-4 xl:col-span-3">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-semibold">Balance summary</h2>
                        <KV rows={[['Outstanding balance', <span className="text-risk-700">{zar(totals.outstanding)}</span>], ['Overdue (past due)', <span className="text-risk-700">{zar(totals.overdue)}</span>], ['Not yet due', zar(totals.outstanding - totals.overdue)], ['Credit balance', <span className="text-verified-700">R0</span>]]} />
                    </div>
                    <div className="space-y-2 rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-semibold">Payment quick actions</h2>
                        {firstDue ? <ButtonLink href={`/services/vehicles/${firstDue.code}/fees`} className="w-full" icon="banknote">Make a Payment</ButtonLink> : <p className="text-xs text-ink-500">Nothing is currently due.</p>}
                        <ButtonLink href="/services/proposal-request" variant="outline" className="w-full">Payment Plans</ButtonLink>
                        <ButtonLink href="/services/proposal-request" variant="outline" className="w-full">Talk to a Human</ButtonLink>
                    </div>
                    <div className="rounded-[8px] bg-controlled-50 p-4 text-sm">
                        <p className="font-semibold">Need help understanding your statement?</p>
                        <a href="https://wa.me/27120010567" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-controlled-700"><MessageCircle className="size-3.5" />WhatsApp / Talk to us</a>
                    </div>
                </aside>
            </div>
        </ServicesPortal>
    );
}

Statement.layout = null;
