import { Link } from '@inertiajs/react';
import { Activity, AlarmClock, Ban, Banknote, Layers, Repeat } from 'lucide-react';
import { SimpleTable } from '@/Components/ui/Kit';
import { SubAdminShell } from '@/Components/Products/Subscriptions/Admin';
import { Card, ClassChip, StatTile, SubStatus, rand, shortDate } from '@/Components/Products/Subscriptions/ui';
import { Donut } from '@/Components/Products/Subscriptions/charts';
import { subscriptionsAdminNav } from '@/Components/Products/nav/subscriptions';

interface Props {
    kpis: { live: number; mrr: number; plans: number; below_floor: number; dunning: number; disuse: number };
    byStatus: Record<string, number>;
    subscriptions: { reference: string; client: string | null; plan: string; class: string; status: string; price_zar: number; interval: string; next_charge_at: string | null }[];
    events: { event_type: string; actor_role: string | null; previous_state: string | null; new_state: string | null; created_at: string; subscription_id: number | null }[];
}

export default function Console({ kpis, byStatus, subscriptions, events }: Props) {
    return (
        <SubAdminShell title="Subscriptions Console" description="Certified recurring book, lifecycle states and governance queues. Recurring economics are modelled only from certified active contracts.">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={Repeat} tone="green" label="Live Subscriptions" value={kpis.live} caption="Certified active book" />
                <StatTile icon={Banknote} tone="gold" label="MRR (ex VAT)" value={rand(kpis.mrr)} caption="Annual normalised ÷ 12" />
                <StatTile icon={Layers} tone="purple" label="Live Plans" value={kpis.plans} />
                <StatTile icon={Ban} tone="red" label="Below-Floor Plans" value={kpis.below_floor} caption="Sales & renewals blocked" />
                <StatTile icon={AlarmClock} tone="orange" label="In Dunning" value={kpis.dunning} caption="Never auto-cancelled" />
                <StatTile icon={Activity} tone="blue" label="Disuse Flagged" value={kpis.disuse} caption="Disclosed to clients" />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
                <Card title="Recent subscriptions">
                    <SimpleTable
                        columns={['Reference', 'Client', 'Plan', 'Class', 'Status', 'Price', 'Next Charge']}
                        rows={subscriptions.map((s) => [
                            <span className="font-mono text-xs">{s.reference}</span>,
                            s.client ?? '—',
                            s.plan,
                            <ClassChip code={s.class} compact />,
                            <SubStatus status={s.status} />,
                            `${rand(s.price_zar)} / ${s.interval === 'annual' ? 'yr' : 'mo'}`,
                            shortDate(s.next_charge_at),
                        ])}
                        empty="No subscriptions yet."
                    />
                </Card>
                <div className="space-y-5">
                    <Card title="Lifecycle states">
                        <Donut data={Object.entries(byStatus)} center={String(Object.values(byStatus).reduce((a, b) => a + b, 0))} caption="Subscriptions" size={130} />
                    </Card>
                    <Card title="Governance consoles">
                        <ul className="divide-y divide-parchment-300 text-[0.8125rem]">
                            {subscriptionsAdminNav.items.slice(1).map((i) => (
                                <li key={i.href}>
                                    <Link href={i.href} className="block py-1.5 text-ink-800 hover:text-gold-700">
                                        {i.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>

            <Card title="Audit trail (latest events)">
                <SimpleTable
                    columns={['When', 'Event', 'Actor', 'From', 'To']}
                    rows={events.map((e) => [new Date(e.created_at).toLocaleString('en-ZA'), e.event_type.replace(/_/g, ' '), e.actor_role ?? 'client', e.previous_state ?? '—', e.new_state ?? '—'])}
                    empty="No events recorded."
                />
            </Card>
        </SubAdminShell>
    );
}

Console.layout = null;
