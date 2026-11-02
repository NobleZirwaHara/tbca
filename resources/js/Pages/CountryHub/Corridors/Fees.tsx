/* P47 Fee Schedule Comparison (prototype pages-corridors.js #/corridors/fees/A/B). */
import { Bars, Card, Kpi, Kpis, pct, STable, sum, TagM, useMoney } from '@/Components/Industries/Kit';
import { CorridorHead, CorrPage, LEDG, pairCrumb, type Pair, type Totals } from '@/Components/CountryHub/Corridors';

interface Props { cr: Pair; tot: Totals }

const CATS: [string, number][] = [['Business Setup', 0.23], ['Tax & Compliance', 0.25], ['Banking & Finance', 0.14], ['Employment & HR', 0.08], ['Trade & Customs', 0.06], ['Other Categories', 0.24]];

export default function Fees({ cr, tot }: Props) {
    const money = useMoney();
    const all = sum(Object.values(tot));
    return (
        <CorrPage crumbs={[pairCrumb(cr), ['Fee Schedule Comparison']]}>
            <CorridorHead cr={cr} view="fees" title="Fee Schedule Comparison" sub="Compare all six ledgers across Sprint categories for this pair. Model-basis estimates — the ledgers are never combined into a price." />
            <Kpis>
                {LEDG.map(([l, n]) => <Kpi key={l} l={`${l} · ${n}`} v={money(tot[l])} s={`${pct(tot[l], all)} % of total`} icon="cash" />)}
                <Kpi l="Total (all ledgers)" v={money(all)} s={<>Model basis <TagM /></>} icon="layers" />
            </Kpis>
            <Card title="Fee Summary by Ledger × Sprint category" icon="tag" sub={<>Ledger T from catalogue; others and category split <TagM /></>}>
                <STable head={['Category', ...LEDG.map((l) => l[0]), 'Total']} rows={[
                    ...CATS.map(([k, w]) => [<b key="k">{k}</b>, ...LEDG.map(([l]) => money(tot[l] * w)), <b key="t">{money(all * w)}</b>]),
                    [<b key="k">Total</b>, ...LEDG.map(([l]) => <b key={l}>{money(tot[l])}</b>), <b key="t">{money(all)}</b>],
                ]} />
            </Card>
            <Card title="Ledger shares" icon="chart">
                <Bars rows={LEDG.map(([l, n]) => ({ label: `${l} · ${n}`, value: tot[l], text: `${pct(tot[l], all)} %` }))} />
            </Card>
        </CorrPage>
    );
}
