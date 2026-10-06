import { Head, Link } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { BarList, Donut, TrendLine } from '@/Components/Aiim/Charts';
import { Chip } from '@/Components/Aiim/Chips';
import { ADMIN_NAV } from '@/Components/Aiim/Nav';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { KpiTile, Panel } from '@/Components/ui/Kit';

interface Props {
    data: { kpis: [string, string, string][]; growth: [string, number][]; health: string[]; topSources: [string, number][] };
    counts: Record<string, number>;
    byStage: Record<string, number>;
}

export default function AdminDashboard({ data, counts, byStage }: Props) {
    return (
        <ConsoleLayout area="AIIM Admin Area" areaIcon={ShieldCheck} groups={ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'AIIM' }, { label: 'Administration Dashboard' }]} title="AIIM Administration Dashboard" description="System-wide overview of AIIM platform operations, users, data, performance and compliance." badge={<Chip tone="good">Africa (Active)</Chip>}>
            <Head title="AIIM Administration Dashboard" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{data.kpis.map(([l, v, c]) => <KpiTile key={l} label={l} value={v} caption={c} />)}</div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <Panel title="Live Platform Records">
                    <ul className="space-y-1.5 text-sm">{[['Engagements', counts.engagements, '/admin/aiim/advisor'], ['Awaiting expert review', counts.awaitingReview, '/admin/aiim/advisor'], ['Reports in production', counts.reports, '/admin/aiim/advisor'], ['Approved sources', counts.sources, '/admin/aiim/sources'], ['Active fee codes', counts.feeCodes, '/admin/aiim/pricing']].map(([l, v, h]) => <li key={l as string}><Link href={h as string} className="flex justify-between hover:text-gold-700"><span>{l}</span><strong>{v}</strong></Link></li>)}</ul>
                </Panel>
                <Panel title="Mandates by Stage">{Object.keys(byStage).length ? <Donut data={Object.entries(byStage).map(([label, value]) => ({ label, value }))} /> : <p className="text-sm text-ink-500">No engagements yet.</p>}</Panel>
                <Panel title="User Growth Trend (thousands)"><TrendLine data={data.growth} /></Panel>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <Panel title="System Health"><ul className="grid grid-cols-2 gap-2 text-sm">{data.health.map((h) => <li key={h} className="flex justify-between rounded border border-parchment-300 px-2 py-1"><span>{h}</span><Chip tone="good">Operational</Chip></li>)}</ul></Panel>
                <Panel title="Top Data Sources by Usage (This Month)"><BarList data={data.topSources.map(([label, value]) => ({ label, value, display: value.toLocaleString('en-ZA') }))} max={Math.max(...data.topSources.map((s) => s[1]))} /></Panel>
            </div>
        </ConsoleLayout>
    );
}

AdminDashboard.layout = null;
