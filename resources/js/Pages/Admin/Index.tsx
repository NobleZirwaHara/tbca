import { Head, Link } from '@inertiajs/react';
import { CalendarDays, ClipboardList, LayoutDashboard, Receipt, ShieldCheck, Users, Wallet } from 'lucide-react';
import ConsoleLayout, { type ConsoleNavGroup } from '@/Layouts/ConsoleLayout';
import { KpiTile, Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { formatZar } from '@/lib/money';

interface Props {
    stats: {
        clients: number;
        orders: number;
        paidRevenue: number;
        awaitingPayment: number;
        openSubmissions: number;
        upcomingBookings: number;
    };
    recentOrders: { reference: string; section: string; status: string; total_zar: number; created_at: string }[];
    recentSubmissions: { reference: string; type: string; section: string | null; name: string | null; status: string; created_at: string }[];
    consoles: { section: string; items: { href: string; label: string }[] }[];
}

const date = (iso: string) => new Date(iso).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });

export default function AdminIndex({ stats, recentOrders, recentSubmissions, consoles }: Props) {
    const groups: ConsoleNavGroup[] = [
        { title: 'Platform', items: [{ label: 'Admin Hub', href: '/admin', icon: LayoutDashboard }] },
        ...consoles.map((c) => ({
            title: c.section,
            items: c.items.slice(0, 1).map((i) => ({ label: `${c.section} Console`, href: i.href, icon: ShieldCheck })),
        })),
    ];

    return (
        <ConsoleLayout
            area="TBCA Admin Hub"
            areaIcon={ShieldCheck}
            groups={groups}
            crumbs={[{ label: 'Admin' }]}
            title="Platform Control Tower"
            description="Live platform activity and every section console in one place."
        >
            <Head title="Admin Hub" />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <KpiTile label="Clients" value={stats.clients} icon={<Users className="size-4" />} />
                <KpiTile label="Orders" value={stats.orders} icon={<Receipt className="size-4" />} />
                <KpiTile label="Paid revenue" value={formatZar(stats.paidRevenue)} tone="good" icon={<Wallet className="size-4" />} />
                <KpiTile label="Awaiting payment" value={stats.awaitingPayment} tone="warn" />
                <KpiTile label="Open enquiries" value={stats.openSubmissions} icon={<ClipboardList className="size-4" />} />
                <KpiTile label="Upcoming bookings" value={stats.upcomingBookings} icon={<CalendarDays className="size-4" />} />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <Panel title="Recent orders">
                    <SimpleTable
                        columns={['Reference', 'Section', 'Status', 'Total', 'Date']}
                        rows={recentOrders.map((o) => [
                            <span className="font-mono text-xs">{o.reference}</span>,
                            o.section,
                            <StatusPill status={o.status} />,
                            formatZar(o.total_zar),
                            date(o.created_at),
                        ])}
                    />
                </Panel>
                <Panel title="Recent enquiries & submissions">
                    <SimpleTable
                        columns={['Reference', 'Type', 'From', 'Status', 'Date']}
                        rows={recentSubmissions.map((s) => [
                            <span className="font-mono text-xs">{s.reference}</span>,
                            s.type.replace(/-/g, ' '),
                            s.name ?? '—',
                            <StatusPill status={s.status} />,
                            date(s.created_at),
                        ])}
                    />
                </Panel>
            </div>

            <Panel title="Section consoles" className="mt-5">
                {consoles.length === 0 ? (
                    <p className="text-sm text-ink-400">No section consoles are registered yet.</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {consoles.map((c) => (
                            <div key={c.section} className="rounded-[6px] border border-parchment-400 p-4">
                                <h3 className="text-sm font-semibold text-ink-900">{c.section}</h3>
                                <ul className="mt-2 space-y-1">
                                    {c.items.map((i) => (
                                        <li key={i.href}>
                                            <Link href={i.href} className="text-[0.8125rem] text-gold-700 hover:underline">
                                                {i.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </Panel>
        </ConsoleLayout>
    );
}

AdminIndex.layout = null;
