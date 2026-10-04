import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CalendarDays, CheckCircle2, Clock, Download, ShieldCheck, TrendingUp, BarChart3, Gauge } from 'lucide-react';
import { Panel, SimpleTable } from '@/Components/ui/Kit';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import type { RetContext, RetDriver } from '@/Components/Products/Retainers/types';
import { AccountShell } from '@/Components/Products/Retainers/Shells';
import { DriverPanel, BandPanel } from '@/Components/Products/Retainers/SizingPanels';
import { sizeAllowance, coverage } from '@/Components/Products/Retainers/sizing';
import { C, Donut, Legend, LineChart, StatTile, fmtDate, hrs } from '@/Components/Products/Retainers/ui';

interface Props extends RetContext {
    history: { label: string; used: number; open: boolean }[];
    distribution: { label: string; hours: number }[];
    comparable: { retainer: string; clients: number; avg_allowance: number; avg_used: number; utilisation: number; overage: number }[];
    drivers: Record<string, RetDriver>;
    saved: { recommended: number; p50: number; confidence: number; saved_at: string; next_review: string } | null;
}

const COLORS = [C.purple, C.blue, C.green, C.amber, C.grey, C.red];

function baseline(drivers: Record<string, RetDriver>): Record<string, string> {
    return Object.fromEntries(Object.entries(drivers).map(([k, d]) => [k, Object.keys(d.options).find((o) => d.options[o] === 0) ?? Object.keys(d.options)[0]]));
}

export default function Sizing(props: Props) {
    const { retainer: r, history, distribution, comparable, drivers, saved } = props;
    const base = `/retainers/account/${r.code}`;
    const [values, setValues] = useState(() => baseline(drivers));
    const [chosen, setChosen] = useState<number | null>(null);
    const [custom, setCustom] = useState('');
    const [busy, setBusy] = useState(false);

    const closed = history.filter((h) => !h.open).map((h) => h.used);
    const uplift = Object.entries(values).reduce((s, [k, o]) => s + (drivers[k]?.options[o] ?? 0), 0);
    const res = sizeAllowance(closed.length ? closed : [r.allowance_qty * 0.7], uplift);
    const allowance = Number(custom) > 0 ? Number(custom) : (chosen ?? res.recommended);
    const cover = Math.round(coverage(allowance, res.p50, Math.max(0.5, res.sd * (1 + uplift / 100))) * 100);
    const avg = closed.length ? closed.reduce((a, b) => a + b, 0) / closed.length : 0;
    const recent = closed.slice(-6);
    const trendUp = recent.length >= 2 && recent[recent.length - 1] > recent[0];
    const totalDist = distribution.reduce((s, d) => s + d.hours, 0);
    const next = new Date();
    next.setMonth(next.getMonth() + 3);

    const save = () => {
        setBusy(true);
        router.post(`${base}/sizing`, { recommended: allowance, p50: res.p50, confidence: cover, drivers: values }, { preserveScroll: true, onFinish: () => setBusy(false) });
    };

    return (
        <AccountShell ctx={props} title="Allowance Sizing Tool" description="Analyse historic usage, forecast future demand and recommend the right allowance size.">
            <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                    <StatTile icon={Clock} tone="purple" label="Recommended Allowance" value={res.recommended} unit="Hours / month" />
                    <StatTile icon={ShieldCheck} tone="purple" label="Confidence Level" value={`${res.confidence}%`} caption={res.confidence >= 80 ? 'High confidence' : 'Moderate confidence'} />
                    <StatTile icon={TrendingUp} tone="good" label="Forecast Monthly Need" value={res.p50} unit="Hours (P50)" />
                    <StatTile icon={BarChart3} tone="gold" label="Forecast Range (P10 – P90)" value={`${res.p10} – ${res.p90}`} unit="Hours / month" />
                    <StatTile icon={AlertTriangle} tone="bad" label="Risk of Overage (Next 6m)" value={`${res.overageRisk}%`} caption={`With ${res.recommended} hours`} />
                    <StatTile icon={Gauge} tone="purple" label="Current Allowance" value={hrs(r.allowance_qty)} unit="Hours / month" />
                </div>

                <div className="grid gap-5 xl:grid-cols-3">
                    <Panel title="Retainer Context">
                        <LabelValues
                            rows={[
                                { label: 'Retainer', value: `${r.name} (${r.code})` },
                                { label: 'Client', value: r.client_name },
                                { label: 'Adviser', value: r.adviser?.name ?? '—' },
                                { label: 'Period for Analysis', value: `Last ${closed.length} closed periods` },
                                { label: 'Historic average', value: `${hrs(avg)} hours / month` },
                            ]}
                        />
                        <Notice tone="purple" className="mt-3">Historic confirmed usage from the selected period is used to forecast future demand. The recommendation is indicative and does not change your allowance.</Notice>
                    </Panel>
                    <DriverPanel drivers={drivers} values={values} onChange={(k, o) => setValues({ ...values, [k]: o })} onReset={() => setValues(baseline(drivers))} />
                    <BandPanel result={res} chosen={allowance} onChoose={(h) => { setChosen(h); setCustom(''); }} custom={custom} onCustom={setCustom} />
                </div>

                <div className="grid gap-5 xl:grid-cols-3">
                    <Panel title="Historic Usage Trend">
                        <LineChart points={history.map((h) => ({ label: h.label, value: Math.round(h.used * 10) / 10 }))} max={Math.max(10, Math.ceil(Math.max(...history.map((h) => h.used), r.allowance_qty) / 10) * 10)} reference={{ value: avg, label: 'Average' }} color={C.purple} labels={false} />
                        <p className="text-center text-[0.6875rem] text-ink-500">● Usage (Hours) · - - Average ({hrs(avg)} hrs)</p>
                    </Panel>
                    <Panel title="Forecast (Next 6 Months)">
                        <ul className="space-y-2 text-xs">
                            {Array.from({ length: 6 }, (_, i) => {
                                const d = new Date();
                                d.setMonth(d.getMonth() + i + 1);
                                const max = Math.max(res.p90, allowance) * 1.1 || 1;
                                return (
                                    <li key={i} className="grid grid-cols-[40px_1fr] items-center gap-2">
                                        <span className="text-ink-500">{d.toLocaleDateString('en-ZA', { month: 'short' })}</span>
                                        <span className="relative h-4 rounded bg-parchment-200">
                                            <span className="absolute inset-y-0 rounded bg-referenced-500/20" style={{ left: `${(res.p10 / max) * 100}%`, right: `${100 - (res.p90 / max) * 100}%` }} />
                                            <span className="absolute inset-y-1 rounded bg-referenced-500/40" style={{ left: `${(res.p20 / max) * 100}%`, right: `${100 - (res.p80 / max) * 100}%` }} />
                                            <span className="absolute inset-y-0 w-0.5 bg-referenced-700" style={{ left: `${(res.p50 / max) * 100}%` }} />
                                            <span className="absolute inset-y-0 w-0.5 border-l-2 border-dashed border-gold-600" style={{ left: `${(allowance / max) * 100}%` }} />
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Light: P10–P90 · Dark: P20–P80 · Line: P50 forecast · Dashed: chosen allowance ({allowance}h covers {cover}% of months)</p>
                    </Panel>
                    <Panel title="Usage Distribution (Closed Periods)">
                        <div className="flex flex-wrap items-center gap-4">
                            <Donut segments={distribution.map((d, i) => ({ value: d.hours, color: COLORS[i % COLORS.length] }))} centre={hrs(totalDist)} sub="Total Hours" size={140} />
                            <div className="min-w-0 flex-1">
                                <Legend items={distribution.map((d, i) => ({ color: COLORS[i % COLORS.length], label: d.label, value: `${totalDist ? Math.round((d.hours / totalDist) * 100) : 0}% (${hrs(d.hours)} h)` }))} />
                            </div>
                        </div>
                    </Panel>
                </div>

                <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
                    <Panel title="Comparable Retainers (Active Book)">
                        <SimpleTable columns={['Retainer', 'Active Clients', 'Avg Allowance (hrs)', 'Avg Used (hrs)', 'Utilisation %', 'With Overage %']} rows={comparable.map((c) => [c.retainer, c.clients, hrs(c.avg_allowance), hrs(c.avg_used), `${c.utilisation}%`, `${c.overage}%`])} />
                    </Panel>
                    <Panel title="Insights & Recommendations">
                        <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                            <ul className="space-y-2 text-xs text-ink-700">
                                {[
                                    trendUp ? 'Usage has trended upward over the last 6 months.' : 'Usage has been stable or declining over the last 6 months.',
                                    uplift > 0 ? 'Selected demand drivers justify a higher allowance.' : uplift < 0 ? 'Selected demand drivers point to lower demand.' : 'Demand drivers are at baseline.',
                                    `A ${allowance}-hour allowance should meet demand in ${cover}% of future months.`,
                                    'Review allowance in 3 months or sooner if scope changes.',
                                ].map((x) => (
                                    <li key={x} className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-verified-500" aria-hidden="true" />{x}</li>
                                ))}
                            </ul>
                            <div className="rounded-[6px] border border-referenced-500/30 bg-referenced-50 p-3 text-xs">
                                <p className="font-semibold text-referenced-700">Next Review Suggestion</p>
                                <p className="mt-2 flex items-center gap-2 text-sm font-bold text-ink-900"><CalendarDays className="size-4" aria-hidden="true" />{fmtDate(saved?.next_review ?? next.toISOString().slice(0, 10))}</p>
                                <p className="text-ink-500">In 3 months</p>
                            </div>
                        </div>
                        {saved && <p className="mt-3 text-xs text-ink-500">Last saved recommendation: {saved.recommended}h ({saved.confidence}% cover) on {fmtDate(saved.saved_at)}.</p>}
                    </Panel>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-parchment-400 pt-4">
                    <Link href={base} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-sm font-semibold text-ink-900"><ArrowLeft className="size-4" aria-hidden="true" />Back to Overview</Link>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-referenced-500/50 px-4 text-sm font-semibold text-referenced-700"><Download className="size-4" aria-hidden="true" />Export Sizing Report</button>
                        <Link href={`${base}/renew`} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-referenced-500/50 px-4 text-sm font-semibold text-referenced-700">Resize via Renewal</Link>
                        <button type="button" disabled={busy} onClick={save} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-referenced-700 px-6 text-sm font-semibold text-white disabled:opacity-60"><CheckCircle2 className="size-4" aria-hidden="true" />Save Allowance Recommendation</button>
                    </div>
                </div>
                <p className="text-right text-[0.6875rem] text-ink-400">Data is secure and audit-tracked.</p>
            </div>
        </AccountShell>
    );
}

Sizing.layout = null;
