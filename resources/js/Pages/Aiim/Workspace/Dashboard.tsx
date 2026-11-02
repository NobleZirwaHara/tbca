import { Head, Link } from '@inertiajs/react';
import { Briefcase } from 'lucide-react';
import { WORKSPACE_NAV } from '@/Components/Aiim/Nav';
import { QuickLinks, TierPill } from '@/Components/Aiim/ProtoAccount';
import { Card, DataTable, StatusChip, useMoney, type Col } from '@/Components/Industries/Kit';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import type { AiimPageProps } from '@/types/aiim';

interface Top { id: string; name: string; tier: string; place: string }

interface Props extends AiimPageProps {
    kpis: { saved: number; watchlist: number; wallet: number; reports: number };
    top: Top[];
    alerts: { status: string; change: string; instrument: string }[];
    ledgerUrl: string;
}

function Stat({ label, value, href, link }: { label: string; value: string; href: string; link: string }) {
    return (
        <div className="rounded-[6px] border border-parchment-400 bg-white p-4">
            <div className="text-[0.7rem] font-bold tracking-wide text-ink-500 uppercase">{label}</div>
            <div className="mt-1 text-[1.6rem] leading-tight font-bold text-ink-900">{value}</div>
            <Link href={href} className="text-[0.75rem] text-ink-500 underline hover:text-gold-700">{link}</Link>
        </div>
    );
}

/** Mock-up 77: Client Dashboard. */
export default function Dashboard({ kpis, top, alerts, ledgerUrl }: Props) {
    const money = useMoney();
    const cols: Col<Top>[] = [
        { k: 'id', l: 'Opp ID', r: (r) => <Link href={`/aiim/opportunities/${r.id}`} className="font-semibold text-controlled-700 hover:underline">{r.id}</Link> },
        { k: 'name', l: 'Opportunity' },
        { k: 'tier', l: 'Tier', r: (r) => <TierPill tier={r.tier} /> },
        { k: 'place', l: 'Best place' },
    ];
    return (
        <ConsoleLayout
            area="AIIM Workspace"
            areaIcon={Briefcase}
            groups={WORKSPACE_NAV}
            crumbs={[{ label: 'AIIM', href: '/aiim' }, { label: 'My Workspace' }, { label: 'Client Dashboard' }]}
            title="Client Dashboard"
            description="My workspace"
        >
            <Head title="Client Dashboard | AIIM" />
            <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="grid min-w-0 content-start gap-4">
                    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                        <Stat label="Saved" value={String(kpis.saved)} href="/aiim/workspace/saved" link="open" />
                        <Stat label="Watchlist" value={String(kpis.watchlist)} href="/aiim/workspace/watchlist" link="open" />
                        <Stat label="Wallet" value={money(kpis.wallet)} href="/aiim/wallet" link="top up" />
                        <Stat label="Reports" value={String(kpis.reports)} href="/aiim/workspace/reports" link="track" />
                    </div>
                    <Card title="Recommended for you: Top 30 Tier A+">
                        <DataTable name="client-top30" cols={cols} rows={top} size={8} />
                    </Card>
                    <Card title="Latest alerts">
                        <ul className="grid gap-1.5 text-[0.85rem]">
                            {alerts.map((a) => <li key={a.change} className="flex flex-wrap items-center gap-1.5"><StatusChip s={a.status} /><b className="text-ink-900">{a.change}</b><span className="text-ink-600">{a.instrument}</span></li>)}
                        </ul>
                        <Link href="/aiim/workspace/watchlist" className="mt-3 inline-block text-[0.75rem] font-semibold text-gold-700">All changes on your watchlist</Link>
                    </Card>
                </div>
                <QuickLinks items={[['/aiim/country/botswana/map', 'map', 'Map View'], ['/aiim/opportunities', 'gauge', 'Opportunities'], ['/aiim/store', 'brief', 'Premium briefs'], ['/aiim/custom-intelligence', 'search', 'Custom intelligence'], [ledgerUrl, 'cash', 'Ledger'], ['/aiim/workspace/archive', 'lock', 'Archive & deletion']]} />
            </div>
        </ConsoleLayout>
    );
}

Dashboard.layout = null;
