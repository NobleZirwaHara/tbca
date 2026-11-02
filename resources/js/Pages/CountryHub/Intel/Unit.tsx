/* Unit profile (prototype pages-intel.js #/c/{ISO}/geo/unit/{CODE}). */
import { Card, Cols, DataTable, Kpi, Kpis, N, STable, useUsdM } from '@/Components/Industries/Kit';
import { BW, CountryHead, CountryPage, cHref } from '@/Components/CountryHub/Layout';
import { HBars, TLink, TierChip, s } from '@/Components/CountryHub/TradeIntel';
import type { CountryBase, Row } from '@/types/countryHub';

interface Props { base: CountryBase; u: Row; covCount: number; bySec: [string, number][]; towns: Row[]; hotspotLeads: Row[]; leads: Row[] }

export default function Unit({ base, u, covCount, bySec, towns, hotspotLeads: hl, leads: rl }: Props) {
    const usdM = useUsdM();
    const code = s(u.Code);
    return (
        <CountryPage base={base} pageKey="geo" extraCrumbs={[[s(u.Unit)]]}>
            <CountryHead base={base} pageKey="geo" title={`${s(u.Unit)} — unit profile`} desc={`${s(u.Kind)} · Wikidata ${s(u.Wikidata)} · ${s(u.Tags)}`} />
            <Kpis>
                <Kpi l="Population (Census 2022)" v={N(u['Population (Census 2022)'])} icon="users" />
                <Kpi l="Places" v={s(u.Places)} icon="pin" />
                <Kpi l="Templates in reach" v={s(u.Templates)} icon="layers" />
                <Kpi l="Tier A leads" v={s(u['Tier A'])} icon="star" />
                <Kpi l="Envelope (weighted)" v={usdM(Number(u['Envelope US$ m (weighted)']))} s="Lead score × population [COMPUTED]" icon="cash" />
                <Kpi l="Coverage rows" v={N(covCount)} s="template × place" icon="db" />
            </Kpis>
            <Cols>
                <Card title="Ranked leads by sector" icon="chart"><HBars rows={bySec.map(([l, n]) => ({ label: l, value: n }))} /></Card>
                <Card title="Places in this unit" icon="pin">
                    <STable compact head={['Place', 'Kind', 'Population', 'Gateway', 'km']}
                        rows={towns.map((t) => [<TLink key="p" href={cHref(BW, `geo/town/${s(t.ID)}`)}>{s(t.Place)}</TLink>, s(t.Kind), N(t['Population used']), s(t['Nearest gateway']), s(t['Gateway km'])])} />
                </Card>
            </Cols>
            {hl.length > 0 && (
                <Card title="Hotspot leads in this unit" icon="flame">
                    <DataTable<Row> name={`hotspot_${code}`} rows={hl} size={8} cols={[
                        { k: 'Lead ID', l: 'Lead ID' }, { k: 'Hotspot', l: 'Hotspot' }, { k: 'Place', l: 'Place' }, { k: 'Opportunity', l: 'Opportunity' },
                        { k: 'Tier', l: 'Tier', r: (x) => <TierChip t={x.Tier} /> }, { k: 'Next action', l: 'Next action' }, { k: 'Institution to call', l: 'Institution to call' }, { k: 'Due', l: 'Due' },
                    ]} />
                </Card>
            )}
            <Card title="Ranked leads in this unit" icon="star">
                <DataTable<Row> name={`leads_${code}`} rows={rl} size={10} filters={['Sector', 'Tier']} cols={[
                    { k: 'Lead ID', l: 'Lead', r: (x) => <span className="font-mono">{s(x['Lead ID'])}</span> }, { k: 'Template', l: 'Template', r: (x) => <TLink href={cHref(BW, `opp/${s(x.Template)}`)}>{s(x.Template)}</TLink> },
                    { k: 'Opportunity', l: 'Opportunity' }, { k: 'Place', l: 'Place' }, { k: 'Lead score', l: 'Score', num: true }, { k: 'Tier', l: 'Tier', r: (x) => <TierChip t={x.Tier} /> },
                    { k: 'Persona', l: 'Persona' }, { k: 'Time to revenue', l: 'Time to revenue' },
                ]} />
            </Card>
        </CountryPage>
    );
}
