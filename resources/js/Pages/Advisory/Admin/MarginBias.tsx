import { Head, router } from '@inertiajs/react';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Advisory/shells';
import { Card, Donut, KV, Stat } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';

interface Alert { id: number; engagement: string; client: string; vehicle_ref: string; recommended: string; alternative: string; score: number; reason: string; owner: string; flagged_on: string; status: string }
interface Props {
    kpis: { total: number; avg: number; high: number; medium: number; low: number; clean: number; positive: number };
    byCategory: Record<string, number>;
    high: Alert[];
    summary: { negative: [string, number]; positive: [string, number]; biasedOwner: string; cleanOwner: [string, number] };
    drivers: Record<string, { count: number; impact: number }>;
}

const BUCKETS: [keyof Props['kpis'], string, string][] = [['high', 'High Bias (< -0.40)', '#c53030'], ['medium', 'Medium Bias (-0.40 to -0.10)', '#c05621'], ['low', 'Low Bias (-0.10 to +0.10)', '#d6a32e'], ['clean', 'Clean (+0.10 to +0.40)', '#2f855a'], ['positive', 'Positive Bias (> +0.40)', '#7b5ea7']];

export default function MarginBias({ kpis, byCategory, high, summary, drivers }: Props) {
    const pct = (n: number) => (kpis.total ? Math.round((n / kpis.total) * 1000) / 10 : 0);
    const max = Math.max(1, ...Object.values(byCategory).map((v) => Math.abs(v)));
    return (
        <AdminShell title="Margin-Bias Monitoring Dashboard" description="Detect and monitor margin bias across recommendations, vehicle selection, pricing, and engagement outcomes.">
            <Head title="Margin-Bias Monitoring" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                <Stat label="Total Analysed Engagements" value={kpis.total} />
                <Stat label="High Bias Alerts" value={kpis.high} sub={`${pct(kpis.high)}% of total`} tone="bad" />
                <Stat label="Medium Bias Alerts" value={kpis.medium} sub={`${pct(kpis.medium)}% of total`} tone="warn" />
                <Stat label="Low Bias Alerts" value={kpis.low} sub={`${pct(kpis.low)}% of total`} />
                <Stat label="Clean / Positive" value={kpis.clean + kpis.positive} sub={`${pct(kpis.clean + kpis.positive)}% of total`} tone="good" />
                <Stat label="Avg. Margin Bias Score" value={kpis.avg.toFixed(2)} sub="Target: 0.00" tone={kpis.avg < -0.1 ? 'bad' : 'neutral'} />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-9">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card title="Margin Bias Score Distribution"><div className="flex items-center gap-4"><Donut slices={BUCKETS.map(([k, , c]) => ({ value: kpis[k] as number, color: c }))} center={kpis.total} sub="Total" /><ul className="space-y-1 text-xs">{BUCKETS.map(([k, l, c]) => <li key={k} className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm" style={{ background: c }} />{l}: {kpis[k]} ({pct(kpis[k] as number)}%)</li>)}</ul></div><p className="mt-2 text-[0.6875rem] text-ink-500">Bias score scale: -1.00 (strong negative / margin steering) to +1.00 (strong positive).</p></Card>
                        <Card title="Bias by Vehicle Category"><ul className="space-y-2 text-xs">{Object.entries(byCategory).map(([k, v]) => <li key={k} className="grid grid-cols-12 items-center gap-2"><span className="col-span-4">{k}</span><span className="relative col-span-6 h-3 rounded bg-parchment-200"><span className={cn('absolute top-0 h-3 rounded', v < 0 ? 'right-1/2 bg-risk-500' : 'left-1/2 bg-verified-500')} style={{ width: `${(Math.abs(v) / max) * 50}%` }} /><span className="absolute left-1/2 top-0 h-3 w-px bg-ink-400" /></span><span className={cn('col-span-2 text-right font-semibold', v < 0 ? 'text-risk-700' : 'text-verified-700')}>{v.toFixed(2)}</span></li>)}</ul></Card>
                    </div>
                    <Card title="Recent High-Bias Engagements">
                        <SimpleTable columns={['Engagement', 'Client', 'Vehicle / Sprint', 'Recommended', 'Alternative', 'Bias Score', 'Reason', 'Owner', 'Date', 'Action Status']}
                            rows={high.map((a) => [<span className="font-mono text-xs text-controlled-700">{a.engagement}</span>, a.client, a.vehicle_ref, a.recommended, a.alternative, <span className="font-semibold text-risk-700">{a.score.toFixed(2)}</span>, a.reason, a.owner, new Date(a.flagged_on).toLocaleDateString('en-ZA'),
                                <select aria-label={`Status for ${a.engagement}`} value={a.status} onChange={(e) => router.post(`/admin/advisory/margin-bias/${a.id}`, { status: e.target.value }, { preserveScroll: true })} className="rounded border border-parchment-500 text-xs">{['open', 'under_review', 'resolved'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>])} />
                    </Card>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Bias Summary"><KV rows={[['Highest Negative Bias', `${summary.negative[0]} ${summary.negative[1]?.toFixed(2)}`], ['Highest Positive Bias', `${summary.positive[0]} +${summary.positive[1]?.toFixed(2)}`], ['Most Biased Owner', summary.biasedOwner], ['Most Clean Owner', `${summary.cleanOwner[0]} ${summary.cleanOwner[1]?.toFixed(2)}`]]} /></Card>
                    <Card title="Top Bias Drivers"><ul className="space-y-1.5 text-xs">{Object.entries(drivers).map(([k, v]) => <li key={k} className="flex justify-between gap-2"><span>{k} ({v.count})</span><span className="font-semibold text-risk-700">{v.impact.toFixed(2)}</span></li>)}</ul><p className="mt-2 text-[0.6875rem] text-ink-500">Client fit and mandatory professional boundaries win over TBCA margin.</p></Card>
                    <Card title="Status"><p className="text-xs">Open high-bias alerts: <b>{high.filter((h) => h.status !== 'resolved').length}</b></p><StatusPill status={high.some((h) => h.status === 'open') ? 'open' : 'resolved'} /></Card>
                </aside>
            </div>
        </AdminShell>
    );
}

MarginBias.layout = null;
