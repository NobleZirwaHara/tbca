/* Economy & Macro (prototype pages-intel.js #/c/{ISO}/economy). */
import { A, Card, Cols, DataTable, GradeChip, Kpi, Kpis, STable, TagS } from '@/Components/Industries/Kit';
import { BW, CountryHead, CountryPage, NoPack, SprintShelf, cHref } from '@/Components/CountryHub/Layout';
import { BenchCard, DocBlocks, ExtLink, s, slug, type DocBlock } from '@/Components/CountryHub/TradeIntel';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';

interface Props {
    base: CountryBase; bw: boolean; bench?: [string, string][] | null;
    macro?: Row[]; fxScen?: Row[]; benchmark?: Row[]; freshness?: Row[]; doc?: DocBlock[]; shelf?: HubShelf;
}

const GDP: [string, number][] = [['2024', -2.8], ['2025', -0.7], ['Q1 2026', 3.5], ['Q2 2026', 8.7], ['2026f', 3.1]];
const KPI_IDS = ['BW-MAC-F3', 'BW-MAC-F6', 'BW-MAC-F8', 'BW-MAC-F9', 'BW-MAC-F12', 'BW-MAC-F15', 'BW-MAC-F16', 'BW-MAC-F27'];

function GdpChart() {
    const x0 = 40, w = 60, zero = 120, sc = 9;
    return (
        <svg viewBox="0 0 420 200" width="100%" role="img" aria-label="Bar chart of Botswana real GDP growth: 2024 −2.8 %, 2025 −0.7 %, Q1 2026 +3.5 %, Q2 2026 +8.7 %, 2026 forecast +3.1 %">
            <line x1="30" x2="410" y1={zero} y2={zero} stroke="#9a9aa5" />
            {GDP.map((d, i) => {
                const h = Math.abs(d[1]) * sc;
                const y = d[1] >= 0 ? zero - h : zero;
                return (
                    <g key={d[0]}>
                        <rect x={x0 + i * 75} y={y} width={w} height={h} fill={d[1] >= 0 ? '#d6a32e' : '#c0392b'} rx="2" />
                        <text x={x0 + i * 75 + w / 2} y={d[1] >= 0 ? y - 5 : y + h + 13} textAnchor="middle" fontSize="12" fontWeight="700" fill="#16161b">{d[1] > 0 ? '+' : ''}{d[1]}%</text>
                        <text x={x0 + i * 75 + w / 2} y="195" textAnchor="middle" fontSize="11" fill="#4a4a56">{d[0]}</text>
                    </g>
                );
            })}
        </svg>
    );
}

export default function Economy({ base, bw, bench, macro = [], fxScen: fx = [], benchmark = [], freshness = [], doc = [], shelf }: Props) {
    const { c } = base;
    if (!bw) {
        return (
            <CountryPage base={base} pageKey="economy">
                <CountryHead base={base} pageKey="economy" title="Economy & Macro" desc="Growth, prices, money, the budget and the external position." />
                {bench && <BenchCard c={c} rows={bench} />}
                <NoPack c={c} what="Macro fact base" pageKey="economy" />
            </CountryPage>
        );
    }
    const m = (id: string) => macro.find((r) => r['Fact ID'] === id) ?? {};
    const benchCols = benchmark[0] ? Object.keys(benchmark[0]) : [];

    return (
        <CountryPage base={base} pageKey="economy">
            <CountryHead base={base} pageKey="economy" title="Economy & Macro"
                desc="A small, diamond-dependent, well-rated economy hit by a diamond slump, now tightening and opening to citizen-led diversification (Part A)." />
            <Kpis>
                {KPI_IDS.map((id) => { const r = m(id); return <Kpi key={id} l={s(r.Item)} v={s(r.Value).split(/[;(]/)[0]} s={`${id} · ${s(r.Date)}`} icon="chart" />; })}
            </Kpis>
            <Cols>
                <Card title="Real GDP growth — the diamond cycle" icon="chart">
                    <GdpChart />
                    <div className="text-[0.7rem] text-ink-400">BW-MAC-F1, F2, F3, F4 · 2026f = Ministry of Finance projection</div>
                </Card>
                <Card title="Pula scenarios (H-2)" icon="cash">
                    <STable compact head={['Scenario', 'P per US$', 'R per P', 'vs today', 'US$ per P1 m']}
                        rows={fx.map((r) => [s(r.Scenario), <b key="p">{s(r['Pula per US$'])}</b>, s(r['Rand per pula']), s(r['vs today']), s(r['US$ per P1 m'])])} />
                </Card>
            </Cols>
            <Card title="Macro fact base (27 facts)" icon="db" sub={<TagS s="BW_Macro" />}>
                <DataTable<Row> name="BW_Macro" rows={macro} size={10} cols={[
                    { k: 'Fact ID', l: 'ID', r: (x) => <span className="font-mono">{s(x['Fact ID'])}</span> }, { k: 'Item', l: 'Item' }, { k: 'Value', l: 'Value', clip: true },
                    { k: 'Source', l: 'Source', clip: true }, { k: 'Date', l: 'Date' }, { k: 'Grade', l: 'Grade', r: (x) => <GradeChip g={x.Grade} /> }, { k: 'URL', l: '', r: (x) => <ExtLink href={x.URL} /> },
                ]} />
            </Card>
            <Card title="Dated cross-country benchmark (eight AIIM packs)" icon="globe" sub="A-1 · click a country in the selector above to open its page">
                <div className="max-w-full overflow-x-auto rounded-[6px] border border-parchment-400">
                    <table className="w-full border-collapse text-[0.78rem]">
                        <thead className="bg-parchment-200 text-left"><tr>{benchCols.map((h) => <th key={h} className="border-b border-parchment-400 px-2.5 py-2 font-semibold whitespace-nowrap text-ink-600">{h}</th>)}</tr></thead>
                        <tbody>
                            {benchmark.map((r, i) => (
                                <tr key={i} className="border-b border-parchment-300 last:border-0">
                                    {benchCols.map((k) => <td key={k} className={k === 'Botswana' ? 'bg-gold-50 px-2.5 py-1.5 align-top font-bold' : 'px-2.5 py-1.5 align-top'}>{s(r[k])}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <Card title="Freshness rules (I-3) — how stale data is shown" icon="clock">
                <STable compact head={['Data class', 'Refresh', 'Display rule']} rows={freshness.map((r) => [s(r['Data class']), s(r.Refresh), s(r['Display rule'])])} />
            </Card>
            <Card title="From the Country Pack — A-2 Macro fact base (text)" icon="book">
                <DocBlocks blocks={doc} />
                <A sm className="mt-2" href={`${cHref(BW, 'pack')}#h-${slug('A-2 Macro fact base')}`}>Read Part A in full →</A>
            </Card>
            {shelf && <SprintShelf shelf={shelf} c={c} />}
        </CountryPage>
    );
}
