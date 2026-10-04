import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { AdminShell, adminNav } from '@/Components/Marketplace/Shells';
import { Card, zar } from '@/Components/Marketplace/ui';
import { KpiRow, Table, td } from '@/Components/Marketplace/AdminKit';
import { StatusPill } from '@/Components/ui/Kit';
import type { RegisterNav } from '@/types/marketplace';

interface Props {
    nav: RegisterNav;
    kpis: Record<string, number>;
    recentOrders: { reference: string; title: string; total: number; status: string; date: string }[];
}

export default function Hub({ nav, kpis, recentOrders }: Props) {
    const groups = adminNav(nav);

    return (
        <AdminShell
            nav={nav}
            crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Marketplace & Partner Governance' }]}
            title="Marketplace & Partner Governance Hub"
            description="Provider and partner eligibility, brief matching, QA, payouts, disputes and the Partner Services permission plane."
        >
            <Head title="Marketplace Governance Hub" />
            <KpiRow
                items={[
                    { label: 'Marketplace Providers', value: kpis.providers, caption: `${kpis.pendingProviders} awaiting verification`, tone: kpis.pendingProviders ? 'warn' : undefined },
                    { label: 'Partner Firms', value: kpis.partners, caption: `${kpis.pendingPartners} pending approval` },
                    { label: 'Listings', value: kpis.listings, caption: `${kpis.pendingListings} pending moderation` },
                    { label: 'Submitted Briefs', value: kpis.briefs },
                    { label: 'QA Queue', value: kpis.qa, tone: kpis.qa ? 'warn' : 'good' },
                    { label: 'Open Disputes', value: kpis.disputes, tone: kpis.disputes ? 'bad' : 'good' },
                    { label: 'Payout-Ready', value: zar(kpis.payoutReady, 2) },
                    { label: 'Marketplace Orders', value: kpis.orders },
                    { label: 'Paid Order Value', value: zar(kpis.paidOrders), tone: 'gold' },
                ]}
            />

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {groups.map((g) => (
                    <Card key={g.title} title={g.title}>
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {g.items
                                .filter((i) => i.href !== '/admin/marketplace')
                                .map((i) => {
                                    const Icon = i.icon;
                                    return (
                                        <li key={i.href}>
                                            <Link
                                                href={i.href}
                                                className="flex items-center gap-2.5 rounded-[6px] border border-parchment-400 px-3 py-2.5 text-[0.8125rem] font-medium text-ink-800 transition-colors hover:border-gold-500 hover:bg-gold-50"
                                            >
                                                {Icon && <Icon className="size-4 shrink-0 text-gold-600" aria-hidden="true" />}
                                                <span className="flex-1">{i.label}</span>
                                                <ArrowRight className="size-3.5 text-ink-300" aria-hidden="true" />
                                            </Link>
                                        </li>
                                    );
                                })}
                        </ul>
                    </Card>
                ))}
            </div>

            <Card title="Recent Marketplace Orders" className="mt-5">
                <Table head={['Order', 'Title', 'Total', 'Status', 'Date']} empty={recentOrders.length === 0}>
                    {recentOrders.map((o) => (
                        <tr key={o.reference}>
                            <td className={`${td} font-mono text-xs`}>{o.reference}</td>
                            <td className={td}>{o.title}</td>
                            <td className={`${td} font-semibold`}>{zar(o.total)}</td>
                            <td className={td}>
                                <StatusPill status={o.status} />
                            </td>
                            <td className={td}>{o.date}</td>
                        </tr>
                    ))}
                </Table>
            </Card>
        </AdminShell>
    );
}

Hub.layout = null;
