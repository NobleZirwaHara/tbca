import { Link } from '@inertiajs/react';
import { ArrowRight, Briefcase, FileDown, Repeat } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ProductsAdminLayout } from '@/Components/Products/Layouts';
import { KpiTile, Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { formatZar } from '@/lib/money';
import { digitalAdminNav } from '@/Components/Products/nav/digital';
import { subscriptionsAdminNav } from '@/Components/Products/nav/subscriptions';
import { retainersAdminNav } from '@/Components/Products/nav/retainers';

interface FamilyStats {
    section: string;
    orders: number;
    paid: number;
    revenue_zar: number;
}

interface Props {
    families: Record<string, FamilyStats>;
    recentOrders: { reference: string; section: string; status: string; total_zar: number; created_at: string }[];
}

const FAMILIES: { key: string; label: string; icon: LucideIcon; nav: typeof digitalAdminNav; publicHref: string }[] = [
    { key: 'digital-products', label: 'Digital Products', icon: FileDown, nav: digitalAdminNav, publicHref: '/digital-products' },
    { key: 'subscriptions', label: 'Subscriptions', icon: Repeat, nav: subscriptionsAdminNav, publicHref: '/subscriptions' },
    { key: 'retainers', label: 'Retainers', icon: Briefcase, nav: retainersAdminNav, publicHref: '/retainers' },
];

export default function Hub({ families, recentOrders }: Props) {
    const totalRevenue = Object.values(families).reduce((s, f) => s + f.revenue_zar, 0);
    const totalOrders = Object.values(families).reduce((s, f) => s + f.orders, 0);

    return (
        <ProductsAdminLayout title="Products Governance Hub" description="Digital Products, Subscriptions and Retainers: catalogue health, recurring book and retained capacity in one place.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiTile label="Orders (all families)" value={totalOrders} />
                <KpiTile label="Paid revenue (incl. VAT & fees)" value={formatZar(totalRevenue)} tone="gold" />
                {FAMILIES.slice(0, 2).map((f) => (
                    <KpiTile key={f.key} label={`${f.label} paid orders`} value={families[f.key]?.paid ?? 0} />
                ))}
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
                {FAMILIES.map(({ key, label, icon: Icon, nav, publicHref }) => (
                    <Panel
                        key={key}
                        title={
                            <span className="inline-flex items-center gap-2">
                                <Icon className="size-4 text-gold-600" aria-hidden="true" />
                                {label}
                            </span>
                        }
                        action={
                            <Link href={publicHref} className="text-xs font-semibold text-gold-700 hover:text-gold-800">
                                Public page
                            </Link>
                        }
                    >
                        <p className="text-xs text-ink-500">
                            {families[key]?.orders ?? 0} orders · {families[key]?.paid ?? 0} paid · {formatZar(families[key]?.revenue_zar ?? 0)}
                        </p>
                        <ul className="mt-3 divide-y divide-parchment-300">
                            {nav.items.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className="flex items-center justify-between gap-2 py-2 text-[0.8125rem] text-ink-700 hover:text-gold-700">
                                        {item.label}
                                        <ArrowRight className="size-3.5" aria-hidden="true" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                ))}
            </div>

            <Panel title="Recent product orders" className="mt-6">
                <SimpleTable
                    columns={['Reference', 'Family', 'Status', 'Total', 'Created']}
                    rows={recentOrders.map((o) => [
                        <span className="font-mono text-xs">{o.reference}</span>,
                        o.section,
                        <StatusPill status={o.status} />,
                        formatZar(o.total_zar),
                        new Date(o.created_at).toLocaleDateString('en-ZA'),
                    ])}
                    empty="No Digital Product, Subscription or Retainer orders yet."
                />
            </Panel>
        </ProductsAdminLayout>
    );
}

Hub.layout = null;
