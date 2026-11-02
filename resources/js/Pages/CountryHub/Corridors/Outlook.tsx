/* P48 12-Month Ledger Outlook (prototype pages-corridors.js #/corridors/outlook/A/B). */
import { Card, Kpi, Kpis, pct, STable, sum, TagM, useMoney } from '@/Components/Industries/Kit';
import { CorridorHead, CorrPage, Legend, LEDG, pairCrumb, type Pair, type Totals } from '@/Components/CountryHub/Corridors';

interface Props { cr: Pair; tot: Totals }

const MONTHS = ['Nov 2026', 'Dec 2026', 'Jan 2027', 'Feb 2027', 'Mar 2027', 'Apr 2027', 'May 2027', 'Jun 2027', 'Jul 2027', 'Aug 2027', 'Sep 2027', 'Oct 2027'];
const PROF = [0.16, 0.14, 0.1, 0.08, 0.08, 0.07, 0.07, 0.07, 0.06, 0.06, 0.06, 0.05];
const COLS = ['#d6a32e', '#9a6d19', '#2563a8', '#1f8a4c', '#6b6b78', '#c0392b'];

export default function Outlook({ cr, tot }: Props) {
    const money = useMoney();
    const all = sum(Object.values(tot));
    const W = 720, H = 240, bw = 44;
    const mx = Math.max(...PROF) * all || 1;
    return (
        <CorrPage crumbs={[pairCrumb(cr), ['12-Month Ledger Outlook']]}>
            <CorridorHead cr={cr} view="outlook" title="12-Month Ledger Outlook — All Ledgers" sub="Forward-looking view of estimated fees by ledger over the next 12 months (model basis)." />
            <Kpis>
                {LEDG.map(([l]) => <Kpi key={l} l={`${l} · 12-month`} v={money(tot[l])} s={`${pct(tot[l], all)} % of total`} icon="cash" />)}
                <Kpi l="Total (all ledgers)" v={money(all)} s="Nov 2026 – Oct 2027" icon="layers" />
            </Kpis>
            <Card title="Monthly Outlook by Ledger (model basis)" icon="chart" sub={<><TagM /> front-loaded activation profile</>}>
                <svg viewBox={`0 0 ${W} ${H + 40}`} width="100%" role="img" aria-label={`Stacked monthly outlook by ledger, ${MONTHS[0]} to ${MONTHS[11]}`}>
                    {MONTHS.map((mo, i) => {
                        let y = H;
                        const x = 40 + i * 56;
                        return (
                            <g key={mo}>
                                {LEDG.map(([l], k) => {
                                    const v = tot[l] * PROF[i];
                                    const h = (v / mx) * (H - 20);
                                    y -= h;
                                    return <rect key={l} x={x} y={y} width={bw} height={h} fill={COLS[k]}><title>{`${mo} · ${l}: ${money(v)}`}</title></rect>;
                                })}
                                <text x={x + bw / 2} y={H + 14} textAnchor="middle" fontSize="9" fill="#4a4a56">{mo.replace(' 20', ' ')}</text>
                                <text x={x + bw / 2} y={H - ((PROF[i] * all) / mx) * (H - 20) - 4} textAnchor="middle" fontSize="8.5" fill="#16161b">{money(all * PROF[i]).replace(/^[^\d-]+/, '').replace(/[^\d]+$/, '')}</text>
                            </g>
                        );
                    })}
                    <line x1={36} x2={W} y1={H} y2={H} stroke="#9a9aa5" />
                </svg>
                <Legend items={LEDG.map(([l, n], k): [string, string] => [COLS[k], `${l} · ${n}`])} extra={<span>· totals printed above each bar</span>} />
            </Card>
            <Card title="12-Month Cumulative by Ledger" icon="tag">
                <STable head={['Ledger', '12-month total', '% of total']} rows={[
                    ...LEDG.map(([l, n]) => [<span key="l"><b>{l}</b> · {n}</span>, money(tot[l]), `${pct(tot[l], all)} %`]),
                    [<b key="t">Total</b>, <b key="v">{money(all)}</b>, '100 %'],
                ]} />
            </Card>
        </CorrPage>
    );
}
