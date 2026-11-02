/* Investment Case (prototype pages-intel.js #/c/{ISO}/invest). */
import { Link } from '@inertiajs/react';
import { Card, Cols, DataTable, STable, StatusChip } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage, SprintShelf } from '@/Components/CountryHub/Layout';
import { BwOnly, DocBlocks, type BwOnlyData, type DocBlock } from '@/Components/CountryHub/IntelData';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';

interface Props {
    base: CountryBase;
    bwOnly: BwOnlyData | null;
    shelf: HubShelf;
    ue?: Row[];
    tornado?: Row[];
    precedents?: Row[];
    scenarios?: Row[];
    method?: DocBlock[];
}

const p = (s: unknown) => { const v = parseFloat(String(s ?? '').replace(/[^\d.-]/g, '')); return Number.isNaN(v) ? null : v; };
const COLS = ['#d6a32e', '#9a6d19', '#4a4a56'];

/** Tornado bars: IRR shift from base on price, volume and capex (prototype torSvg). */
function Tornado({ t }: { t: Row }) {
    const base = p(t['Base IRR']);
    const lo = [t['Price −20 %'], t['Volume −20 %'], t['Capex +20 %']].map(p);
    const hi = [t['Price +20 %'], t['Volume +20 %'], t['Capex −20 %']].map(p);
    const s = (v: number | null) => 150 + (v === null ? 0 : Math.max(-150, Math.min(150, v * 1.3)));
    const b = base ?? 0;
    return (
        <svg viewBox="0 0 300 64" width="100%" role="img" aria-label={`Tornado for ${t.ID}: base IRR ${t['Base IRR']}`}>
            {['Price', 'Volume', 'Capex'].map((n, i) => {
                const a = lo[i] ?? -40, z = hi[i] ?? b;
                const x1 = s(Math.min(a, z) - b), x2 = s(Math.max(a, z) - b);
                const x = Math.max(40, x1);
                return (
                    <g key={n}>
                        <text x="0" y={14 + i * 20} fontSize="9" fill="#4a4a56">{n}</text>
                        <rect x={x} y={5 + i * 20} width={Math.max(2, x2 - x)} height="12" fill={COLS[i]} rx="2" />
                    </g>
                );
            })}
            <line x1="150" x2="150" y1="0" y2="64" stroke="#16161b" strokeDasharray="2 2" />
        </svg>
    );
}

export default function Invest({ base, bwOnly, shelf, ue = [], tornado = [], precedents = [], scenarios = [], method = [] }: Props) {
    if (bwOnly) return <BwOnly base={base} pageKey="invest" data={bwOnly} shelf={shelf} />;
    const { c } = base;
    return (
        <CountryPage base={base} pageKey="invest">
            <CountryHead base={base} pageKey="invest" title="Investment Case" desc="Invest-in-a-Box: 14 S/M-band packs with after-tax returns, a tornado on price, volume and capex, pula scenarios and a precedent deal register." />
            <Card title="Unit economics (H-1b) — pula m, tax 22 % baseline (DG-01)" icon="cash" sub="Assumptions are [PROPOSED]; numbers [COMPUTED] — as labelled in the pack">
                <DataTable<Row> name="BW_UnitEconomics" rows={ue} size={14} cols={[
                    { k: 'ID', l: 'ID' }, { k: 'Pack', l: 'Pack' },
                    { k: 'Sector', l: 'Sector', r: (x) => <Link href={cHref(c, `sector/${x.Sector}`)} className="text-controlled-700 hover:underline">{x.Sector}</Link> },
                    { k: 'Band', l: 'Band' }, { k: 'Revenue driver', l: 'Revenue driver' }, { k: 'Anchor', l: 'Anchor', clip: true }, { k: 'Assumptions', l: 'Assumptions', clip: true },
                    { k: 'Capex P m', l: 'Capex', num: true }, { k: 'Revenue P m', l: 'Revenue', num: true }, { k: 'Margin', l: 'Margin', num: true }, { k: 'Pre-tax P m', l: 'Pre-tax', num: true },
                    { k: 'After-tax P m', l: 'After-tax', num: true }, { k: 'Payback yrs', l: 'Payback', num: true }, { k: 'Project IRR', l: 'IRR', r: (x) => <b>{x['Project IRR']}</b> },
                ]} />
            </Card>
            <Card title="Tornado — project IRR at ±20 % on each driver (H-1c)" icon="chart" sub="Bars show IRR shift from base (centre line); printed values are exact">
                <Cols n={3}>
                    {tornado.map((t) => (
                        <div key={String(t.ID)} className="min-w-0 rounded-[6px] border border-parchment-400 bg-white p-3">
                            <div className="flex items-start justify-between gap-2">
                                <b className="text-[0.8rem]">{t.ID} · {t.Pack}</b>
                                <span className="shrink-0 rounded-full border border-gold-200 bg-gold-100 px-2 py-0.5 text-[0.72rem] font-semibold text-gold-800">Base {t['Base IRR']}</span>
                            </div>
                            <Tornado t={t} />
                            <div className="text-[0.72rem] text-ink-400">
                                Price {t['Price −20 %']} → {t['Price +20 %']} · Volume {t['Volume −20 %']} → {t['Volume +20 %']} · Capex {t['Capex +20 %']} → {t['Capex −20 %']} · biggest driver: <b>{t['Biggest driver']}</b>
                            </div>
                        </div>
                    ))}
                </Cols>
            </Card>
            <Cols>
                <Card title="Precedent deal register (H-3)" icon="file">
                    <DataTable<Row> name="BW_Precedents" rows={precedents} size={9} cols={[
                        { k: 'ID', l: 'ID' }, { k: 'Deal', l: 'Deal' }, { k: 'Size', l: 'Size' }, { k: 'Date', l: 'Date' }, { k: 'Scope', l: 'Scope' }, { k: 'Evidence', l: 'Evidence' },
                        { k: 'Status', l: 'Status', r: (x) => <StatusChip s={x.Status} /> },
                    ]} />
                </Card>
                <Card title="Pula scenarios (H-2)" icon="swap">
                    <STable compact head={['Scenario', 'P per US$', 'vs today', 'US$ per P1 m']} rows={scenarios.map((r) => [r.Scenario, r['Pula per US$'], r['vs today'], r['US$ per P1 m']])} />
                </Card>
            </Cols>
            <Card title="Method (H-1a)" icon="book"><DocBlocks blocks={method} /></Card>
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}
