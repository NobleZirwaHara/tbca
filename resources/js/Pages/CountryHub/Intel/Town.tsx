/* Place profile (prototype pages-intel.js #/c/{ISO}/geo/town/{ID}). */
import { Card, DataTable, Kpi, Kpis, N } from '@/Components/Industries/Kit';
import { BW, CountryHead, CountryPage, cHref } from '@/Components/CountryHub/Layout';
import { TLink, TierChip, s } from '@/Components/CountryHub/TradeIntel';
import type { CountryBase, Row } from '@/types/countryHub';

interface Props { base: CountryBase; t: Row; leads: Row[]; coverage: Row[]; hotspots: string[] }

const tpl = (x: Row) => <TLink href={cHref(BW, `opp/${s(x.Template)}`)}>{s(x.Template)}</TLink>;

export default function Town({ base, t, leads: rl, coverage: cov, hotspots: hs }: Props) {
    const id = s(t.ID);
    return (
        <CountryPage base={base} pageKey="geo" extraCrumbs={[[s(t.Place) || id]]}>
            <CountryHead base={base} pageKey="geo" title={`${s(t.Place)} — place profile`} desc={`${s(t.Kind)} in ${s(t.Unit)} · ${s(t.Lat)}, ${s(t.Lon)}`} />
            <Kpis>
                <Kpi l="Population" v={N(t['Population used'])} s="Census 2022 / dataset" icon="users" />
                <Kpi l="Nearest gateway" v={s(t['Nearest gateway']) || '—'} s={t['Gateway km'] !== null && t['Gateway km'] !== undefined ? `${s(t['Gateway km'])} km` : ''} icon="swap" />
                <Kpi l="Ranked leads here" v={rl.length} icon="star" />
                <Kpi l="Coverage rows" v={cov.length} s="Templates scored at this place" icon="db" />
                <Kpi l="Hotspots" v={hs.length} s={hs.join(', ').slice(0, 60)} icon="flame" />
            </Kpis>
            <Card title="Ranked leads at this place" icon="star">
                <DataTable<Row> name={`leads_${id}`} rows={rl} size={10} cols={[
                    { k: 'Template', l: 'Template', r: tpl }, { k: 'Opportunity', l: 'Opportunity' }, { k: 'Sector', l: 'Sector' },
                    { k: 'Rank', l: 'Rank in template', num: true }, { k: 'Lead score', l: 'Score', num: true }, { k: 'Tier', l: 'Tier', r: (x) => <TierChip t={x.Tier} /> },
                ]} />
            </Card>
            <Card title="Coverage — every template scored here" icon="db">
                <DataTable<Row> name={`coverage_${id}`} rows={cov} size={10} filters={['Sector', 'Tier']} cols={[
                    { k: 'Template', l: 'Template', r: tpl }, { k: 'Opportunity', l: 'Opportunity' }, { k: 'Sector', l: 'Sector' }, { k: 'Band', l: 'Band' },
                    { k: 'Lead score', l: 'Score', num: true }, { k: 'Tier', l: 'Tier', r: (x) => <TierChip t={x.Tier} /> },
                ]} />
            </Card>
        </CountryPage>
    );
}
