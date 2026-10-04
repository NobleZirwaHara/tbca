import { Coins, Eye, Filter, Gauge, Target, Users } from 'lucide-react';
import { Bars, Box, Donut, Legend, PALETTE, Stat, Status, Table, label, num, zar } from '@/Components/Insights/Shared';
import { ResourceAdmin } from '@/Components/Insights/Resources';

interface Props {
    kpis: { views: number; users: number; conversions: number; roi: number; revenue: number; influence: number; paidOrders: number };
    rows: { title: string; slug: string; type: string; views: number; users: number; conversions: number; rate: number; revenue: number; roi: number; downloads: number }[];
    byType: { label: string; value: number; pct: number }[];
    channels: { label: string; value: number }[];
}

export default function Roi({ kpis, rows, byType, channels }: Props) {
    const chTotal = channels.reduce((a, c) => a + c.value, 0);
    return (
        <ResourceAdmin title="Attribution & Content ROI Dashboard" description="Measure the performance, influence and return on investment of your content resources. Attribution data is consolidated across all channels and engagement points.">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <Stat label="Total Content Views" value={num(kpis.views)} icon={<Eye className="size-5" />} />
                <Stat label="Unique Users" value={num(kpis.users)} icon={<Users className="size-5" />} />
                <Stat label="Conversions" value={num(kpis.conversions)} icon={<Filter className="size-5" />} />
                <Stat label="Content ROI (Est.)" value={`${kpis.roi}x`} icon={<Gauge className="size-5" />} tone="green" />
                <Stat label="Revenue Attributed" value={zar(kpis.revenue)} icon={<Coins className="size-5" />} tone="gold" />
                <Stat label="Avg. Content Influence" value={`${kpis.influence}%`} caption={`${kpis.paidOrders} paid resource orders`} icon={<Target className="size-5" />} />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <Box title="Conversions by Channel"><div className="flex items-center gap-4"><Donut label={num(chTotal)} sub="Total" size={110} segments={channels.map((c, i) => ({ value: c.value, color: PALETTE[i] }))} /><Legend items={channels.map((c, i) => ({ label: c.label, value: `${num(c.value)} (${((c.value / chTotal) * 100).toFixed(1)}%)`, color: PALETTE[i] }))} /></div></Box>
                <Box title="Revenue Attributed by Content Type"><Bars items={byType.map((b) => ({ label: b.label, value: b.value }))} format={(v) => zar(v)} /></Box>
                <Box title="Top Performing Content (by ROI)"><ol className="space-y-2 text-xs">{rows.slice(0, 5).map((r, i) => <li key={r.slug} className="flex items-center justify-between gap-2"><span>{i + 1}. {r.title}</span><span className="rounded bg-verified-50 px-1.5 font-semibold text-verified-700">ROI {r.roi}x</span></li>)}</ol></Box>
            </div>
            <Box className="mt-4" title="Content Performance Table">
                <Table head={['Content Title', 'Type', 'Views', 'Users', 'Conversions', 'Conversion Rate', 'Revenue Attributed', 'ROI (Est.)', 'Status']}
                    rows={rows.map((r) => [<strong key="t">{r.title}</strong>, label(r.type), num(r.views), num(r.users), num(r.conversions), `${r.rate}%`, zar(r.revenue), `${r.roi}x`, <Status key="s" value={r.roi >= 6 ? 'high' : r.roi >= 3 ? 'medium' : 'low'} />])} />
                <p className="mt-2 text-[0.6875rem] text-ink-500">Revenue combines modelled attribution with paid resource orders recorded at checkout. ROI = attributed revenue ÷ estimated content cost.</p>
            </Box>
        </ResourceAdmin>
    );
}
