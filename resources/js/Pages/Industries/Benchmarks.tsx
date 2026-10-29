import { useState } from 'react';
import { A, Card, Chip, Cols, Dl, Ic, N, TagM, TagP, TagS, Ticks, saveStateSoon } from '@/Components/Industries/Kit';
import { Head1, IndustryPage } from '@/Components/Industries/Layout';
import { useCurrency } from '@/lib/money';
import type { IndustryBase } from '@/types/industries';

type Ue = { id: string; margin: unknown; irr: unknown; pay: unknown; capex: unknown };
interface Props extends IndustryBase { ue: Ue[]; mine: Record<string, string>; consent: string | null }

export default function Benchmarks(p: Props) {
    const { ind, ctx, ue } = p;
    const { currency } = useCurrency();
    const [mine, setMine] = useState<Record<string, string>>({ ...(p.mine ?? {}) });
    const rng = (pick: (r: Ue) => unknown, f: (x: number) => number = (x) => x): [number, number] | null => {
        const v = ue.map((r) => parseFloat(String(pick(r) ?? '').replace('%', ''))).filter((x) => !Number.isNaN(x)).map(f);
        return v.length ? [Math.min(...v), Math.max(...v)] : null;
    };
    const bands: [string, [number, number] | null, string, string][] = [
        ['Operating margin (%)', rng((r) => r.margin, (x) => x * 100), '%', 'margin'], ['Project IRR (%)', rng((r) => r.irr), '%', 'irr'],
        ['Payback (years)', rng((r) => r.pay), ' yrs', 'pay'], ['Capex (US$ m)', rng((r) => r.capex), '', 'capex'],
    ];
    const verdict = (b: [number, number] | null, raw: string) => {
        const v = parseFloat(raw);
        if (!b || Number.isNaN(v)) return null;
        return v < b[0] ? <Chip t="Below band" tone="bad" /> : v > b[1] ? <Chip t="Above band" tone="ok" /> : <Chip t="Within band" tone="info" />;
    };

    return (
        <IndustryPage base={p} active="benchmarks">
            <Head1 eyebrow="Benchmarks · Mock-up Page 7" title={`${ind.name} Sector Benchmark Preview`} desc="Benchmark your performance against verified contributor data. Some data is hidden to protect contributor privacy. Full benchmarks unlock only when contribution thresholds are met." />
            <Card title="Benchmark Not Yet Released" icon="lock" tone="gold">
                <p className="text-[0.88rem]">Full numeric benchmarks are released only when minimum thresholds are met for data volume (n ≥ 20 contributors), diversity (k ≥ 5, no client &gt; 20 %) and privacy. Current contributors for {ind.name} · {ctx.country.name}: <b>{p.consent === 'yes' ? 1 : 0}</b> <Chip t="Collecting" tone="warn" /></p>
            </Card>
            <Card title="Benchmark Preview (Indicative Bands)" icon="chart">
                {ue.length ? (
                    <>
                        <Cols>
                            {bands.map(([l, r, u, k]) => (
                                <div key={k} className="flex items-start gap-2.5 rounded-[6px] border border-parchment-400 bg-white p-3">
                                    <span className="grid grid-cols-[minmax(0,1fr)] size-7 shrink-0 place-items-center rounded-[6px] bg-gold-50 text-gold-700"><Ic n="chart" /></span>
                                    <div className="min-w-0">
                                        <div className="text-[0.72rem] font-semibold text-ink-400">{l}</div>
                                        <div className="text-[1.15rem] font-bold">{r ? `${N(r[0], 1)}${u} – ${N(r[1], 1)}${u}` : '—'}</div>
                                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.75rem] text-ink-500">Your value:
                                            <input type="number" step="any" aria-label={`Your ${l}`} className="h-7 w-[90px] rounded-[4px] border border-parchment-500 px-1.5" value={mine[k] ?? ''}
                                                onChange={(e) => { const n = { ...mine, [k]: e.target.value }; setMine(n); saveStateSoon(`bm-${ind.code}`, n); }} />
                                            {verdict(r, mine[k] ?? '')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Cols>
                        <p className="mt-2 text-[0.72rem] text-ink-400"><TagM /> Indicative bands from {ue.length} BW-1.0 unit-economics packs ({ue.map((r) => r.id).join(', ')}) — modelled business cases, not contributor data. <TagS s="BW_UnitEconomics" /></p>
                    </>
                ) : <p className="text-[0.85rem]"><TagP /> No unit-economics packs exist yet for this industry's AIIM sectors. Bands appear once contributor data or a country pack provides them.</p>}
            </Card>
            <Cols>
                <Card title="Methodology Snapshot" icon="book">
                    <Dl rows={[['Reporting period', 'FY2025 contributor data'], ['Minimum contributors (n)', '20 per segment'], ['Minimum diversity (k)', '5 · no single contributor > 20 %'], ['Outlier treatment', 'Winsorised at P5 / P95'], ['Refresh cadence', 'Quarterly'], ['Reporting currency', currency]]} />
                </Card>
                <Card title="How to Unlock Full Benchmarks" icon="check">
                    <ol className="list-decimal space-y-0.5 ps-5 text-[0.82rem]"><li>Review and accept the Benchmark Contribution Terms.</li><li>Consent to share anonymised, banded performance data.</li><li>Help meet n and k thresholds for your segment.</li><li>Receive full numeric benchmarks and percentile ranking.</li></ol>
                    <div className="mt-3 flex flex-wrap gap-2"><A v="pri" href="/industries/workspace/benchmark">{p.consent ? 'Change consent' : 'Review & consent'}</A><A href="/admin/industries/benchmarks">How benchmarks are released</A></div>
                    <p className="mt-2 text-[0.72rem] text-ink-400">We never share your data. Aggregated results only.</p>
                </Card>
            </Cols>
            <Card title="Data included in this benchmark" icon="users">
                <Ticks items={ind.subs.map((s) => s.name)} />
                <p className="mt-2 text-[0.72rem] text-ink-400">Full benchmarks include exact values, percentile ranking, peer comparison by size band, trend charts and segment drill-downs.</p>
            </Card>
        </IndustryPage>
    );
}
