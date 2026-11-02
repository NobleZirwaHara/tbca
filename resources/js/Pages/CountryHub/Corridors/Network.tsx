/* P40 Corridor Network (prototype pages-corridors.js #/corridors/network). */
import { btnClass, Card, Ic, Kpi, Kpis, N, Note, pct, TagM } from '@/Components/Industries/Kit';
import { heatCol, txtCol } from '@/Components/Industries/Layout';
import { HubAfricaMap, type MapLine } from '@/Components/CountryHub/Maps';
import { CorrPage, PTitle } from '@/Components/CountryHub/Corridors';
import type { CountryOption } from '@/types/countryHub';

interface Cell { n: number; e: number; p: number }
interface Props {
    map: (CountryOption & { pack: string | null })[];
    cnt: Record<string, number>;
    sellable: number;
    total: number;
    lines: MapLine[];
    regions: string[];
    heat: Record<string, Record<string, Cell>>;
}

export default function Network({ map, cnt, sellable, lines, regions, heat }: Props) {
    const hc = cnt['High Confidence'] ?? 0;
    return (
        <CorrPage crumbs={[['Corridor Network']]}>
            <PTitle title="Corridor Network" desc="Corridor truth across all 2,862 directional pairs between the 54 African country objects."
                act={<a className={btnClass()} href="/countries/corridors/network?export=csv"><Ic n="file" /> Export Network Data</a>} />
            <Kpis>
                <Kpi l="Total countries" v={54} icon="globe" />
                <Kpi l="Directional pairs" v="2,862" s="54 × 53" icon="layers" />
                <Kpi l="High confidence" v={hc} s={`${pct(hc, 2862)} %`} icon="check" />
                <Kpi l="Evidence available" v={cnt['Evidence Available'] ?? 0} icon="db" />
                <Kpi l="Limited evidence" v={cnt['Limited Evidence'] ?? 0} icon="alert" />
                <Kpi l="No evidence" v={N(cnt['No Evidence'] ?? 0)} icon="lock" />
                <Kpi l="Sellable" v={N(sellable)} s="Evidence + both endpoints activated" icon="shield" />
            </Kpis>
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                <Card title="Network by confidence" icon="map">
                    <HubAfricaMap countries={map} lines={lines} label="Corridor network by confidence: high confidence and evidence available pairs" />
                </Card>
                <Card title="Evidence Coverage Heatmap — departure × arrival region" icon="flame">
                    <div className="max-w-full overflow-x-auto">
                        <table className="w-full border-collapse text-[0.72rem]">
                            <thead><tr><th className="px-1 py-1 text-left font-semibold text-ink-600">From \ To</th>{regions.map((r) => <th key={r} className="px-1 py-1 text-right font-semibold text-ink-600">{r}</th>)}</tr></thead>
                            <tbody>
                                {regions.map((r1) => (
                                    <tr key={r1}>
                                        <td className="px-1 py-1 font-bold">{r1}</td>
                                        {regions.map((r2) => {
                                            const x = heat[r1]?.[r2] ?? { n: 0, e: 0, p: 0 };
                                            return (
                                                <td key={r2} className="min-w-[56px] border border-white px-1.5 py-1 text-right tabular-nums" style={{ background: heatCol(x.p, 60), color: txtCol(x.p, 60) }} title={`${r1} → ${r2}\n${x.e} of ${x.n} pairs with evidence`}>
                                                    {x.p} %<div className="text-[0.66rem]">{x.e}/{x.n}</div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-2 text-[0.72rem] text-ink-500">Share of pairs with ≥ 1 evidence item <TagM /> — values printed in each cell</div>
                </Card>
            </div>
            <Note>Corridor network data is evidence-based and Resolver-controlled. No commercial availability is implied. All 54 countries are activated; each corridor still needs pair-specific evidence and risk sign-off.</Note>
        </CorrPage>
    );
}
