/* Import & Export hub (prototype pages-trade.js #/c/{ISO}/trade). */
import { Link } from '@inertiajs/react';
import { A, Card, Cols, Flag, Kpi, Kpis, Ticks, pct, sum, useUsdM } from '@/Components/Industries/Kit';
import { heatCol } from '@/Components/Industries/Layout';
import { BW, CountryHead, CountryPage, SprintShelf, cHref } from '@/Components/CountryHub/Layout';
import { HubAfricaMap } from '@/Components/CountryHub/Maps';
import { HBars, HeatLegend, TradeNote, VIEWS, short, type TC, type TradeAnchors } from '@/Components/CountryHub/TradeIntel';
import type { CountryBase, HubShelf } from '@/types/countryHub';

type P = TC & { imp: number; exp: number };
interface Props { base: CountryBase; groups: string[]; basis: string; anchors: TradeAnchors; E: number[]; M: number[]; partners: P[]; shelf: HubShelf }

export default function Hub({ base, groups, basis, anchors, E, M, partners, shelf }: Props) {
    const { c } = base;
    const usdM = useUsdM();
    const topI = [...partners].sort((a, b) => b.imp - a.imp).slice(0, 8);
    const topE = [...partners].sort((a, b) => b.exp - a.exp).slice(0, 8);
    const maxI = Math.max(...partners.map((x) => x.imp));
    const by = Object.fromEntries(partners.map((p) => [p.iso3, p]));
    const defP = c.iso3 === 'ZAF' ? 'BWA' : 'ZAF';
    const sE = sum(E), sM = sum(M);
    const pairHref = (v: number, iso: string) => cHref(c, `trade/${v}`, `?partner=${iso}`);

    return (
        <CountryPage base={base} pageKey="trade">
            <CountryHead base={base} pageKey="trade" title="Import & Export Heat Maps"
                desc={`Four lenses on ${c.name}'s trade with the rest of Africa — choose one, pick a partner, and see where value flows and where it does not yet.`} />
            <Kpis>
                <Kpi l="Imports from Africa" v={usdM(sM)} s="All 53 partners · 10 HS groups" icon="ship" />
                <Kpi l="Exports to Africa" v={usdM(sE)} icon="ship" />
                <Kpi l="Intra-African balance" v={usdM(sE - sM)} s={sE >= sM ? 'Surplus' : 'Deficit'} icon="swap" />
                {topI[0] && <Kpi l="Top supplier" v={<><Flag iso2={topI[0].iso2} /> {topI[0].name}</>} s={`${pct(topI[0].imp, sM)} % of imports from Africa`} icon="flame" />}
                {topE[0] && <Kpi l="Top market" v={<><Flag iso2={topE[0].iso2} /> {topE[0].name}</>} s={`${pct(topE[0].exp, sE)} % of exports to Africa`} icon="flame" />}
            </Kpis>
            <Cols>
                {[1, 2, 3, 4].map((v) => (
                    <Link key={v} href={cHref(c, `trade/${v}`, VIEWS[v].partner ? `?partner=${defP}` : '')} className="block rounded-[6px] border border-parchment-400 bg-white p-4 shadow-[0_1px_2px_rgba(8,8,11,.06)] hover:border-gold-400">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-[4px] border border-[#e6b800] bg-[#ffd21f] px-2.5 py-1 text-[0.75rem] font-bold text-[#111] shadow-[0_2px_0_#c79c00]">Heat Map {v}</span>
                            <b className="text-ink-900">{VIEWS[v].t}</b>
                        </div>
                        <p className="mt-1.5 text-[0.8rem] text-ink-400">{VIEWS[v].s.replace(/\{C\}/g, c.name).replace(/\{P\}/g, 'a chosen partner')}</p>
                    </Link>
                ))}
            </Cols>
            <Card title={`Where ${c.name}'s African imports come from`} icon="map">
                <HubAfricaMap countries={base.countries} dark={false} highlight={[c.iso3]} label={`Africa map shaded by ${c.name}'s import value from each partner`}
                    fill={(iso) => (iso === c.iso3 ? '#16161b' : heatCol(by[iso]?.imp ?? 0, maxI))}
                    tip={(iso, name) => (iso === c.iso3 ? `${c.name} (selected)` : `${name}\n${c.name} imports: ${usdM(by[iso]?.imp ?? 0)}\n${c.name} exports: ${usdM(by[iso]?.exp ?? 0)}`)}
                    href={(x) => (x.iso3 === c.iso3 ? null : pairHref(2, x.iso3))}
                    lines={topI.slice(0, 6).map((p) => [p.iso3, c.iso3, 1 + (4 * p.imp) / maxI, '#c0392b'])} />
                <HeatLegend items={[['#fbf1d6', 'low'], ['#c08a2e', 'medium'], ['#7c4a07', 'high import value'], ['#c0392b', 'top-6 supply routes'], [null, '· click a partner to open Heat Map 2']]} />
            </Card>
            <Cols>
                <Card title={`Top suppliers to ${c.name}`} icon="ship"><HBars rows={topI.map((p) => ({ label: p.name, value: p.imp, text: usdM(p.imp), href: pairHref(2, p.iso3) }))} /></Card>
                <Card title={`Top African markets for ${c.name}`} icon="ship"><HBars rows={topE.map((p) => ({ label: p.name, value: p.exp, text: usdM(p.exp), alt: true, href: pairHref(4, p.iso3) }))} /></Card>
            </Cols>
            <Cols>
                <Card title="Import mix from Africa" icon="layers"><HBars rows={groups.map((g, k) => ({ label: short(g), value: M[k], text: usdM(M[k]) }))} /></Card>
                <Card title="Export mix to Africa" icon="layers"><HBars rows={groups.map((g, k) => ({ label: short(g), value: E[k], text: usdM(E[k]), alt: true }))} /></Card>
            </Cols>
            {c.isBW && (
                <Card title="What the Botswana evidence says about trade" icon="db" tone="gold">
                    <Ticks items={[
                        'Exports P74,259.0 m; imports (CIF) P86,676.3 m; deficit P12,417.3 m in 2025 — BW-TRD-F1',
                        'Diamonds ≈72.6 % of exports; Dec 2025 destinations UAE 31.0 %, India 17.9 %, China 12.1 %, SA 10.2 %; imports from SA 61.3 % — BW-TRD-F2',
                        'SACU receipts P26.79 bn in 2026/27 — BW-TRD-F3 · AfCFTA ratified Feb 2023 — BW-TRD-F5 · AGOA to 31 Dec 2026 — BW-TRD-F6',
                        'Horticulture import restrictions reinstated 8 Dec 2025 — BW-TRD-F4',
                    ]} />
                    <div className="mt-3 flex flex-wrap gap-2">
                        <A href={cHref(BW, 'products')}>Product & HS register →</A>
                        <A href={cHref(BW, 'sector/TRD')}>Trade sector page →</A>
                    </div>
                </Card>
            )}
            <TradeNote basis={basis} anchors={anchors} />
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}
