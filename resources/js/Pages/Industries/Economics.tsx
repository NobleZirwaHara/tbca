import { A, Card, DataTable, N, STable, TagP, TagS } from '@/Components/Industries/Kit';
import { Head1, IndustryPage } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type R = Record<string, string | number | null>;
interface Props extends IndustryBase { ue: R[]; tornado: R[] }

export default function Economics(p: Props) {
    const s = (r: R, k: string) => String(r[k] ?? '');
    return (
        <IndustryPage base={p} active="economics">
            <Head1 eyebrow="Unit Economics" title={`${p.ind.name} — investment cases`} desc="Worked business cases from the Botswana pack: capex, revenue, margin, IRR, payback, debt service and the kill criterion." />
            {p.ue.length ? (
                <Card title="Business cases (BW_UnitEconomics)" icon="cash" sub={<><TagS s="BW_UnitEconomics" /> Pula; display conversions at BW_FX.</>}>
                    <DataTable<R> name="unit-economics" rows={p.ue} size={10}
                        cols={[{ k: 'ID', l: 'ID' }, { k: 'Pack', l: 'Pack', clip: true }, { k: 'Band', l: 'Band' }, { k: 'Capex P m', l: 'Capex P m', num: true }, { k: 'Revenue P m', l: 'Revenue P m', num: true },
                            { l: 'Margin', r: (r) => `${N(100 * Number(r.Margin), 0)} %`, v: (r) => Number(r.Margin) }, { k: 'Payback yrs', l: 'Payback', num: true }, { k: 'Project IRR', l: 'IRR' },
                            { k: 'Equity IRR (50 % debt)', l: 'Equity IRR' }, { k: 'Min DSCR', l: 'DSCR', num: true }, { k: 'Kill criterion', l: 'Kill criterion', clip: true }]} />
                </Card>
            ) : <p className="text-[0.85rem]"><TagP /> No unit-economics pack for this industry yet. Commission one through the Investment Readiness Sprints.</p>}
            {p.tornado.length > 0 && (
                <Card title="Sensitivity (tornado)" icon="chart">
                    <STable compact head={['ID', 'Base IRR', 'Price −20 %', 'Price +20 %', 'Volume −20 %', 'Capex +20 %', 'Biggest driver']} rows={p.tornado.map((r) => [s(r, 'ID'), s(r, 'Base IRR'), s(r, 'Price −20 %'), s(r, 'Price +20 %'), s(r, 'Volume −20 %'), s(r, 'Capex +20 %'), <b>{s(r, 'Biggest driver')}</b>])} />
                </Card>
            )}
            <div><A href="/aiim/country/botswana">Open the Botswana investment case →</A></div>
        </IndustryPage>
    );
}
