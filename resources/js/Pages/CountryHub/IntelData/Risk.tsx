/* Risk & Outlook (prototype pages-intel.js #/c/{ISO}/risk). */
import { A, Bars, Card, Cols, DataTable, GradeChip, Kpi, Kpis, STable, StatusChip, type BarRow } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage, SprintShelf } from '@/Components/CountryHub/Layout';
import { BwOnly, TierChip, type BwOnlyData } from '@/Components/CountryHub/IntelData';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';

interface Props {
    base: CountryBase;
    bwOnly: BwOnlyData | null;
    shelf: HubShelf;
    downturn?: { ap: string | number | null; down: string | number | null };
    exposed?: BarRow[];
    downgraded?: Row[];
    regChange?: Row[];
    gaps?: Row[];
    political?: Row;
}

export default function Risk({ base, bwOnly, shelf, downturn, exposed = [], downgraded = [], regChange = [], gaps = [], political = {} }: Props) {
    if (bwOnly) return <BwOnly base={base} pageKey="risk" data={bwOnly} shelf={shelf} />;
    const { c } = base;
    return (
        <CountryPage base={base} pageKey="risk">
            <CountryHead base={base} pageKey="risk" title="Risk & Outlook" desc="What could go wrong, how exposed each sector is, what the diamond downturn does to the ranking, and which rules just changed." />
            <Kpis>
                <Kpi l="Sovereign rating" v="BBB- / A-3" s="S&P, negative outlook (BW-MAC-F27)" icon="shield" />
                <Kpi l="Budget deficit 2026/27" v="3.1 % of GDP" s="Revised from 8.9 % (BW-MAC-F14)" icon="cash" />
                <Kpi l="Public debt" v="33 % of GDP" s="Ceiling raised to 60 % (BW-MAC-F15)" icon="chart" />
                <Kpi l="Downturn: A+ base → downturn" v={String(downturn?.ap ?? '')} s={`${downturn?.down ?? ''} templates downgraded`} icon="alert" />
            </Kpis>
            <Card title="Most exposed sectors" icon="alert" sub="Downturn index / base index (H-4)"><Bars rows={exposed} /></Card>
            <Card title="Downgraded in the downturn scenario" icon="chart">
                <DataTable<Row> name="BW_Downturn_downgraded" rows={downgraded} size={10} filters={['Sector']} rowHref={(x) => cHref(c, `opp/${x['Opp ID']}`)} cols={[
                    { k: 'Opp ID', l: 'Opp ID' }, { k: 'Sector', l: 'Sector' }, { k: 'Opportunity', l: 'Opportunity' },
                    { k: 'Tier base', l: 'Base', r: (x) => <TierChip t={x['Tier base']} /> }, { k: 'Tier downturn', l: 'Downturn', r: (x) => <TierChip t={x['Tier downturn']} /> },
                ]} />
            </Card>
            <Card title="Regulatory-change register (I-4)" icon="bell">
                <DataTable<Row> name="BW_RegChange" rows={regChange} size={7} cols={[
                    { k: 'ID', l: 'ID' }, { k: 'Change', l: 'Change' }, { k: 'Instrument', l: 'Instrument' }, { k: 'Evidence', l: 'Evidence' },
                    { k: 'Status', l: 'Status', r: (x) => <StatusChip s={x.Status} /> }, { k: 'Sector', l: 'Sector' }, { k: 'Impact', l: 'Impact' },
                    { k: 'Templates affected', l: 'Templates', num: true }, { k: 'Tier A affected', l: 'Tier A', num: true },
                ]} />
            </Card>
            <Cols>
                <Card title="Open data gaps" icon="lock" act={<A sm href={cHref(c, 'limitations')}>All gaps →</A>}>
                    <STable compact head={['ID', 'Missing data', 'Priority']} rows={gaps.map((r) => [r.ID, r['Missing data'], <StatusChip key="p" s={r.Priority} />])} />
                </Card>
                <Card title="Political change" icon="users">
                    <p className="text-[0.85rem]">{political.Value}</p>
                    <p className="mt-2"><span className="text-[0.72rem] text-ink-400">{political['Fact ID'] ?? ''} · {political.Source ?? ''} · {political.Date ?? ''}</span> <GradeChip g={political.Grade} /></p>
                </Card>
            </Cols>
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}
