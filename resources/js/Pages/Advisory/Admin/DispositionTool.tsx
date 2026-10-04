import { Head, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Select } from '@/Components/ui/Form';
import { AdminShell } from '@/Components/Advisory/shells';
import { Card, CHART, CheckList, Donut, KV, Notice, Stat, Tracker, zar } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';

interface Analysis { total: number; processed: number; codes: number; avg: number; peak: number; age: number; value: number; categories: { name: string; used: number; pct: number; avg: number; trend: string }[]; indicators: Record<string, string>; subscription: number; retainer: number; recommend: string; savings: number; savings_pct: number }
interface Props { vehicles: { code: string; label: string; client: string }[]; selected: string | null; client: string | null; analysis: Analysis | null; disposition: { to: string; at: string } | null; period: string | null }

export default function DispositionTool({ vehicles, selected, client, analysis: a, disposition, period }: Props) {
    const apply = (to: string) => router.post('/admin/advisory/disposition-tool', { vehicle: selected, to }, { preserveScroll: true });
    const recSub = a?.recommend === 'Subscription';
    return (
        <AdminShell title="Subscription-vs-Retainer Disposition Tool" description="Evaluate engagement patterns and sprint mix to determine the optimal vehicle: Subscription (recurring access) or Retainer (reserved capacity with hourly allocation).">
            <Head title="Subscription vs Retainer Disposition" />
            <div className="rounded-[8px] border border-parchment-400 bg-white p-3"><Tracker items={['Select Engagement', 'Usage Analysis', 'Disposition Engine', 'Recommendation', 'Action'].map((l, i) => ({ label: l, state: disposition ? 'done' : i < 4 ? 'done' : 'current' }))} /></div>
            <div className="mt-3 flex flex-wrap items-end gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                <label className="text-xs">Client / Engagement<Select value={selected ?? ''} onChange={(e) => router.get('/admin/advisory/disposition-tool', { vehicle: e.target.value })} options={vehicles.map((v) => ({ value: v.code, label: `${v.client} — ${v.label}` }))} className="mt-1 w-96" /></label>
                <p className="text-xs text-ink-500">Date range: {period ?? '—'} ({a?.age ?? 0} days)</p>
                <Button size="sm" variant="outline" onClick={() => router.reload()}>Recalculate Analysis</Button>
            </div>
            {a && (
                <div className="mt-4 grid gap-4 xl:grid-cols-12">
                    <div className="space-y-4 xl:col-span-8">
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                            <Stat label="Total Sprints Used" value={a.total} sub={`of ${a.processed} processed`} />
                            <Stat label="Unique Sprint Codes" value={a.codes} sub={`Across ${a.categories.length} categories`} />
                            <Stat label="Avg. Usage / Week" value={a.avg} sub="Sprints per week" />
                            <Stat label="Peak Week Usage" value={a.peak} />
                            <Stat label="Engagement Age" value={`${a.age} days`} />
                        </div>
                        <Card title="Sprint Category Breakdown">
                            <div className="grid gap-4 md:grid-cols-12">
                                <table className="w-full text-xs md:col-span-8"><thead className="text-ink-500"><tr><th className="text-left">Category</th><th>Sprints Used</th><th>% of Total</th><th>Avg / Week</th><th>Trend</th></tr></thead><tbody className="divide-y divide-parchment-300">{a.categories.map((c) => <tr key={c.name}><td className="py-1.5">{c.name}</td><td className="text-center">{c.used}</td><td className="text-center">{c.pct}%</td><td className="text-center">{c.avg}</td><td className={cn('text-center', c.trend === 'Increasing' ? 'text-verified-700' : 'text-ink-500')}>{c.trend}</td></tr>)}</tbody></table>
                                <div className="flex justify-center md:col-span-4"><Donut slices={a.categories.map((c, i) => ({ value: c.used, color: CHART[i % CHART.length] }))} center={a.total} sub="Total Sprints" /></div>
                            </div>
                            <p className="mt-2 text-[0.6875rem] text-ink-500">Based on actual sprint consumption in selected period.</p>
                        </Card>
                        <Card title="Engagement Pattern Indicators"><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{Object.entries(a.indicators).map(([k, v]) => <div key={k} className="rounded border border-parchment-400 p-2 text-center"><p className="text-[0.6875rem] text-ink-500">{k}</p><p className={cn('font-semibold', v === 'High' ? 'text-verified-700' : v === 'Medium' ? 'text-attested-700' : 'text-risk-700')}>{v}</p></div>)}</div></Card>
                    </div>
                    <div className="space-y-4 xl:col-span-4">
                        {[{ name: 'Subscription', primary: recSub, best: 'Ongoing access to tools, data, and periodic analysis', items: ['Scalable access across multiple team members', 'Cost-effective for regular, predictable usage', 'Always-on intelligence and monitoring', 'Lower upfront commitment'], amt: a.subscription, label: 'Estimated Monthly Investment' }, { name: 'Retainer', primary: !recSub, best: 'Reserved advisory hours and custom deliverables', items: ['Dedicated advisory time allocation', 'Custom analysis and strategy development', 'Priority access to expert resources', 'Best for project-driven work'], amt: a.retainer, label: 'Recommended Monthly Retainer' }].map((o) => (
                            <div key={o.name} className={cn('rounded-[8px] border p-4', o.primary ? 'border-verified-500 bg-verified-50' : 'border-attested-500/40 bg-attested-50')}>
                                <p className="text-[0.6875rem] font-bold">{o.primary ? 'PRIMARY RECOMMENDATION' : 'ALTERNATIVE RECOMMENDATION'}</p>
                                <p className="font-serif text-lg font-semibold">{o.name}</p>
                                <p className="text-xs">Best for: {o.best}</p>
                                <CheckList className="mt-2" items={o.items} />
                                <p className="mt-2 text-xs text-ink-500">{o.label}</p><p className="text-xl font-bold">{zar(o.amt)} <span className="text-xs font-normal">(Excl. VAT)</span></p>
                                <Button size="sm" variant={o.primary ? 'gold' : 'outline'} className="mt-2 w-full" onClick={() => apply(o.name)}>Switch to {o.name}</Button>
                            </div>
                        ))}
                        <Card title="Disposition Summary"><KV rows={[['Client', client ?? '—'], ['Engagement Period', `${a.age} days`], ['Total Sprint Value', zar(a.value)], ['Usage Frequency', `${a.avg} / week`], ['Pattern Consistency', a.indicators.Consistency], ['Recommendation', a.recommend], ['Savings with Subscription', zar(a.savings)], ['Savings Percentage', `${a.savings_pct}%`]]} /></Card>
                        {disposition && <Notice tone="info">Switch to {disposition.to} proposed on {disposition.at}. Awaiting client confirmation.</Notice>}
                        <p className="text-[0.6875rem] text-ink-500">Final recommendation should be discussed with your TBCA engagement manager. Margin is not an input to this engine.</p>
                    </div>
                </div>
            )}
        </AdminShell>
    );
}

DispositionTool.layout = null;
