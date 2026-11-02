/* Import & Export heat maps 1 to 4 (prototype pages-trade.js #/c/{ISO}/trade/{1-4}?partner=ISO3). */
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { A, B, Card, Cols, Field, Flag, Ic, Kpi, Kpis, N, PillNav, STable, Ticks, fmtM, inputCls, pct, sum, useUsdM } from '@/Components/Industries/Kit';
import { heatCol, txtCol } from '@/Components/Industries/Layout';
import { CountryHead, CountryPage, SprintShelf, Why, cHref, corHref } from '@/Components/CountryHub/Layout';
import { HubAfricaMap, type MapLine } from '@/Components/CountryHub/Maps';
import { HBars, HeatLegend, TradeNote, VIEWS, short, type TC, type TradeAnchors } from '@/Components/CountryHub/TradeIntel';
import type { CountryBase, HubShelf } from '@/types/countryHub';

type Row = TC & { f: number[]; base: number[]; tot: number; share: number };
interface PairRow { g: string; f: number; pa: number; ca: number; r: number; sh: number; pot: number }
interface Props {
    base: CountryBase; view: number; who: 'import' | 'export'; partner: TC | null; groups: string[]; basis: string; anchors: TradeAnchors;
    rows?: Row[]; pair?: PairRow[]; shelf: HubShelf;
}

const flagOf = (iso2: string) => (/^[A-Z]{2}$/i.test(iso2) ? String.fromCodePoint(...[...iso2.toUpperCase()].map((ch) => 127397 + ch.charCodeAt(0))) : '');

export default function View(props: Props) {
    const { base, view: v, who, partner: p, groups, basis, anchors, shelf } = props;
    const { c, countries } = base;
    const V = VIEWS[v];
    const imp = who === 'import';
    const sub = V.s.replace(/\{C\}/g, c.name).replace(/\{P\}/g, p ? p.name : '');
    const defP = c.iso3 === 'ZAF' ? 'BWA' : 'ZAF';

    const selectors = (
        <Card>
            <div className="flex flex-wrap items-end gap-3">
                <Field label="Selected country" className="min-w-[min(100%,220px)]">
                    <select className={inputCls} value={c.iso3} onChange={(e) => { const x = countries.find((k) => k.iso3 === e.target.value); if (x) router.visit(cHref(x, `trade/${v}`, p ? `?partner=${p.iso3}` : '')); }}>
                        {countries.map((x) => <option key={x.iso3} value={x.iso3}>{flagOf(x.iso2)} {x.name}</option>)}
                    </select>
                </Field>
                {p && (
                    <>
                        <Field label="Partner country" className="min-w-[min(100%,220px)]">
                            <select className={inputCls} value={p.iso3} onChange={(e) => router.visit(cHref(c, `trade/${v}`, `?partner=${e.target.value}`))}>
                                {countries.filter((x) => x.iso3 !== c.iso3).map((x) => <option key={x.iso3} value={x.iso3}>{flagOf(x.iso2)} {x.name}</option>)}
                            </select>
                        </Field>
                        <span title="Swap the two countries"><A href={cHref(p, `trade/${v}`, `?partner=${c.iso3}`)}><Ic n="swap" /> Swap</A></span>
                    </>
                )}
                <Field label="Year" className="min-w-[min(100%,160px)]">
                    <select className={inputCls}><option>2025 (modelled baseline)</option></select>
                </Field>
                <div className="ms-auto">
                    <PillNav items={[1, 2, 3, 4].map((k) => ({
                        label: `${k} · ${VIEWS[k].who === 'import' ? 'Imports' : 'Exports'}${VIEWS[k].partner ? ' · partner' : ' · Africa'}`,
                        href: cHref(c, `trade/${k}`, VIEWS[k].partner ? `?partner=${p ? p.iso3 : defP}` : ''), on: k === v,
                    }))} />
                </div>
            </div>
        </Card>
    );

    return (
        <CountryPage base={base} pageKey={`trade/${v}`} noRight extraCrumbs={p ? [[`with ${p.name}`]] : []}>
            <CountryHead base={base} pageKey={`trade/${v}`} title={`Heat Map ${v} · ${V.t}`} desc={sub} />
            {selectors}
            {p && props.pair ? <PairBody {...props} partner={p} pair={props.pair} /> : <AfricaBody {...props} rows={props.rows ?? []} />}
            <TradeNote basis={basis} anchors={anchors} />
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}

/* ---------------------------------------------------------- views 1 and 3: partners × products */
function AfricaBody({ base, view: v, who, groups, rows }: Props & { rows: Row[] }) {
        const { c, countries } = base;
        const imp = who === 'import';
        const usdM = useUsdM();
        const [mode, setMode] = useState<'value' | 'share'>('value');
        const [lim, setLim] = useState(15);
        const tot = sum(rows.map((r) => r.tot));
        const maxP = rows[0]?.tot ?? 0;
        const by = Object.fromEntries(rows.map((r) => [r.iso3, r]));
        const rs = rows.slice(0, lim);
        const val = (r: Row, k: number) => (mode === 'share' ? (r.base[k] ? (100 * r.f[k]) / r.base[k] : 0) : r.f[k]);
        const mx = Math.max(0, ...rs.flatMap((r) => groups.map((_, k) => val(r, k))));
        const next = (iso: string) => cHref(c, `trade/${v + 1}`, `?partner=${iso}`);
        const shareL = imp ? 'Share of partner’s Africa exports' : 'Share of partner’s Africa imports';
        const csv = () => {
            const q = (x: unknown) => { const t = String(x ?? ''); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
            const lines = [['Partner', ...groups, 'Total US$ m', 'Share %'].map(q).join(','), ...rows.map((r) => [r.name, ...r.f.map((x) => x.toFixed(2)), r.tot.toFixed(2), r.share].map(q).join(','))];
            const a = document.createElement('a');
            a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
            a.download = `${c.iso3}_heatmap_${v}.csv`;
            a.click();
        };
        if (!rows.length) return null;
    const lines: MapLine[] = rows.slice(0, 8).map((r) => (imp ? [r.iso3, c.iso3, 1 + (4 * r.tot) / maxP, '#c0392b'] : [c.iso3, r.iso3, 1 + (4 * r.tot) / maxP, '#2563a8']));

        return (
            <>
                <Kpis>
                    <Kpi l={imp ? 'Imports from Africa' : 'Exports to Africa'} v={usdM(tot)} s="53 partners" icon="ship" />
                    <Kpi l={imp ? 'Largest supplier' : 'Largest market'} v={<><Flag iso2={rows[0].iso2} /> {rows[0].name}</>} s={`${pct(rows[0].tot, tot)} % of total`} icon="flame" />
                    <Kpi l="Top-5 concentration" v={`${pct(sum(rows.slice(0, 5).map((r) => r.tot)), tot)} %`} s="Herfindahl-style signal of dependence" icon="layers" />
                    <Kpi l="Partners above US$ 10 m" v={String(rows.filter((r) => r.tot >= 10).length)} s="of 53" icon="users" />
                </Kpis>
                <Card title={`Africa map — ${imp ? 'supplier' : 'market'} intensity`} icon="map" sub="Darker = higher value · lines = top-8 routes · click a country to compare one-to-one">
                    <HubAfricaMap countries={countries} dark={false} highlight={[c.iso3]} label={`Africa map shaded by ${imp ? 'supplier' : 'market'} value for ${c.name}`}
                        fill={(iso) => (iso === c.iso3 ? '#16161b' : heatCol(by[iso]?.tot ?? 0, maxP))}
                        tip={(iso, name) => { const r = by[iso]; return r ? `${name}\n${imp ? 'Supplies ' : 'Buys '}${usdM(r.tot)}\nShare of its Africa ${imp ? 'exports' : 'imports'}: ${r.share} %` : `${c.name} (selected)`; }}
                        href={(x) => (x.iso3 === c.iso3 ? null : next(x.iso3))} lines={lines} />
                </Card>
                <Card title="Heat matrix — partner × product" icon="flame">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[0.78rem]">
                        <label className="font-bold" htmlFor="hm-mode">Cell value</label>
                        <select id="hm-mode" className="h-8 rounded-[4px] border border-parchment-500 bg-white px-1.5" value={mode} onChange={(e) => setMode(e.target.value as 'value' | 'share')}>
                            <option value="value">Value (US$ m)</option>
                            <option value="share">{imp ? 'Share of partner’s Africa exports in that product (%)' : 'Share of partner’s Africa imports in that product (%)'}</option>
                        </select>
                        <label className="font-bold" htmlFor="hm-n">Partners</label>
                        <select id="hm-n" className="h-8 rounded-[4px] border border-parchment-500 bg-white px-1.5" value={lim} onChange={(e) => setLim(Number(e.target.value))}>
                            <option value={15}>Top 15</option><option value={25}>Top 25</option><option value={53}>All 53</option>
                        </select>
                        <B sm onClick={csv}><Ic n="file" /> CSV</B>
                    </div>
                    <div className="max-h-[620px] max-w-full overflow-auto rounded-[6px] border border-parchment-400">
                        <table className="w-full border-collapse text-[0.78rem]">
                            <thead className="sticky top-0 z-[1] bg-parchment-200">
                                <tr>
                                    <th className="px-2 py-1.5 text-left font-semibold">{imp ? `Supplier → ${c.name}` : `${c.name} → Market`}</th>
                                    {groups.map((g) => <th key={g} title={g} className="min-w-[70px] px-2 py-1.5 text-left text-[0.66rem] font-semibold">{short(g)}</th>)}
                                    <th className="px-2 py-1.5 text-right font-semibold">Total</th>
                                    <th className="px-2 py-1.5 text-right font-semibold">{shareL}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rs.map((r) => (
                                    <tr key={r.iso3} className="border-b border-parchment-300">
                                        <td className="px-2 py-1 whitespace-nowrap"><Link href={next(r.iso3)} className="text-controlled-700 hover:underline"><Flag iso2={r.iso2} /> {r.name}</Link></td>
                                        {groups.map((g, k) => {
                                            const x = val(r, k);
                                            const tip = `${r.name} · ${short(g)}\n${imp ? `Exports to ${c.name}` : `${c.name} exports`}: ${usdM(r.f[k])}\n${imp ? `${r.name} exports to Africa` : `${r.name} imports from Africa`}: ${usdM(r.base[k])}\nShare: ${r.base[k] ? N((100 * r.f[k]) / r.base[k], 1) : 0} %`;
                                            return <td key={k} title={tip} className="min-w-[56px] px-1.5 py-1 text-right text-[0.72rem] tabular-nums" style={{ background: heatCol(x, mx), color: txtCol(x, mx) }}>{mode === 'share' ? `${N(x, 1)}%` : fmtM(x)}</td>;
                                        })}
                                        <td className="px-2 py-1 text-right font-bold whitespace-nowrap">{usdM(r.tot)}</td>
                                        <td className="px-2 py-1 text-right whitespace-nowrap">{r.share} %</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <HeatLegend items={[['#fbf1d6', 'Low'], ['#c08a2e', 'Medium'], ['#7c4a07', 'High'], [null, 'Numbers are printed in every cell — colour is never the only signal.']]} />
                </Card>
                <Cols>
                    <Card title={imp ? 'Product mix of imports from Africa' : 'Product mix of exports to Africa'} icon="layers">
                        <HBars rows={groups.map((g, k) => { const x = sum(rows.map((r) => r.f[k])); return { label: short(g), value: x, text: usdM(x), alt: !imp }; })} />
                    </Card>
                    <Card title="Reading this view" icon="book">
                        <p className="text-[0.82rem]">{imp
                            ? `Each row is an African supplier. The last column tells you how important ${c.name} is to that supplier: a high share means ${c.name} is a core market for them; a low share with high value means a large, diversified exporter.`
                            : `Each row is an African market. The last column is ${c.name}'s share of that market's imports from Africa: low share in a big market is headroom.`}</p>
                        <Why>{imp
                            ? 'Import dependence on one supplier is a supply-chain and FX risk; the heat map shows which product lines could be sourced from a second African supplier under AfCFTA.'
                            : 'Exporters win by finding markets where they already sell a little but the market imports a lot — the gap between the two columns is the sales target.'}</Why>
                    </Card>
                </Cols>
            </>
        );
}

/* ---------------------------------------------------------- views 2 and 4: one partner, products × measures */
function PairBody({ base, who, partner: p, pair }: Props & { partner: TC; pair: PairRow[] }) {
    const usdM = useUsdM();
    const { c, countries } = base;
    const imp = who === 'import';
    const fc = sum(pair.map((r) => r.f)), pa = sum(pair.map((r) => r.pa)), rev = sum(pair.map((r) => r.r)), pot = sum(pair.map((r) => r.pot));
    const mx = Math.max(0, ...pair.flatMap((r) => [r.f, r.pa, r.ca, r.pot]));
    const A_ = imp ? `${p.name} → ${c.name}` : `${c.name} → ${p.name}`;
    const colsH = imp
        ? [`${c.name} imports from ${p.name}`, `${p.name} exports to all Africa`, `${c.name} imports from all Africa`, 'Headroom (min of the two − actual)', `Reverse: ${c.name} → ${p.name}`]
        : [`${c.name} exports to ${p.name}`, `${p.name} imports from all Africa`, `${c.name} exports to all Africa`, 'Headroom (min of the two − actual)', `Reverse: ${p.name} → ${c.name}`];
    const [from, to] = imp ? [p.iso3, c.iso3] : [c.iso3, p.iso3];

    return (
        <>
            <Kpis>
                <Kpi l={A_} v={usdM(fc)} s="Modelled pair value" icon="ship" />
                <Kpi l={imp ? `${p.name}’s exports to Africa` : `${p.name}’s imports from Africa`} v={usdM(pa)} icon="globe" />
                <Kpi l={imp ? `${c.name}’s share of ${p.name}’s Africa exports` : `${c.name}’s share of ${p.name}’s Africa imports`} v={`${N((100 * fc) / (pa || 1), 1)} %`} icon="chart" />
                <Kpi l="Headroom (all products)" v={usdM(pot)} s="Upper bound, not a forecast" icon="spark" />
                <Kpi l="Pair balance" v={usdM(imp ? rev - fc : fc - rev)} s={`${c.name} exports − imports with ${p.name}`} icon="swap" />
            </Kpis>
            <Card title={`Pair corridor — ${c.name} ⇄ ${p.name}`} icon="map">
                <HubAfricaMap countries={countries} dark={false} highlight={[c.iso3, p.iso3]} href={null} label={`Africa map showing the ${A_} corridor`}
                    fill={(iso) => (iso === c.iso3 ? '#16161b' : iso === p.iso3 ? '#d6a32e' : '#e9e4d8')}
                    tip={(_iso, name) => name}
                    lines={[imp ? [p.iso3, c.iso3, 5, '#c0392b'] : [c.iso3, p.iso3, 5, '#2563a8']]} />
                <div className="mt-2 flex flex-wrap gap-2">
                    <A href={corHref('detail', from, to)}>Open corridor {from}→{to} →</A>
                    <A href={cHref(c, 'impact', `?with=${p.iso3}`)}>Selection impact →</A>
                </div>
            </Card>
            <Card title="Heat matrix — product × measure" icon="flame">
                <STable compact head={['Product group', ...colsH, 'Share']} rows={pair.map((r) => [
                    <b key="g">{short(r.g)}</b>,
                    ...[r.f, r.pa, r.ca, r.pot, r.r].map((x, i) => (
                        <div key={i} title={`${short(r.g)}\n${colsH[i]}: ${usdM(x)}`} className="rounded-[3px] px-[.45rem] py-[.3rem] text-right tabular-nums" style={{ background: heatCol(x, mx), color: txtCol(x, mx) }}>{fmtM(x)}</div>
                    )),
                    <b key="s">{N(r.sh, 1)} %</b>,
                ])} />
                <HeatLegend items={[[null, `US$ m · darker = larger · Share = ${imp ? `${c.name}’s share of ${p.name}’s Africa exports` : `${c.name}’s share of ${p.name}’s Africa imports`} in that product`]]} />
            </Card>
            <Cols>
                <Card title="Biggest headroom products" icon="spark" sub="Where both sides already trade the product with Africa but not with each other">
                    <HBars rows={[...pair].sort((a, b) => b.pot - a.pot).slice(0, 6).map((r) => ({ label: short(r.g), value: r.pot, text: usdM(r.pot) }))} />
                </Card>
                <Card title="Next steps" icon="check">
                    <Ticks items={[<>Validate headroom with a <b>Trade Partner Scan</b> (catalogue)</>, 'Check corridor evidence and fees (six ledgers)', <>Price an <b>Import/Export Risk Register</b> for the top product</>]} />
                    <Why>A pair view turns a continental statistic into a sales or sourcing plan: one partner, named products, a measurable gap.</Why>
                </Card>
            </Cols>
        </>
    );
}
