/* Opportunity page (prototype pages-intel.js #/c/{ISO}/opp/{ID}). */
import { useState } from 'react';
import { A, B, Card, Cols, DataTable, Dl, Ic, Kpi, Kpis, N, STable, StatusChip, useToast } from '@/Components/Industries/Kit';
import { BW, CountryHead, CountryPage, SprintShelf, cHref, saveCountryState } from '@/Components/CountryHub/Layout';
import { ExtLink, FactCite, TLink, TierChip, s } from '@/Components/CountryHub/TradeIntel';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';

interface Props {
    base: CountryBase; id: string; found: boolean; all?: Row; sectorName?: string; trigger?: string; fact?: Row | null;
    leads?: Row[]; hotspotLeads?: Row[]; saved?: boolean; savedList?: string[]; shelf?: HubShelf;
}

const SKIP = new Set(['Opp ID', 'Sector', 'Opportunity']);

export default function Opp({ base, id, found, all = {}, sectorName = '', trigger = '', fact, leads = [], hotspotLeads: hl = [], savedList = [], shelf }: Props) {
    const { c } = base;
    const toast = useToast();
    const [saved, setSaved] = useState(savedList);
    if (!found) {
        return (
            <CountryPage base={base} pageKey="opps">
                <Card title="Opportunity not found">{id}</Card>
            </CountryPage>
        );
    }
    const save = () => {
        if (!saved.includes(id)) {
            const next = [...saved, id];
            setSaved(next);
            void saveCountryState('saved', next);
        }
        toast.show('Saved to Saved Items');
    };

    return (
        <CountryPage base={base} pageKey="opps" extraCrumbs={[[id]]}>
            <CountryHead base={base} pageKey="opps" title={s(all.Opportunity)} desc={`${id} · ${sectorName} · ${s(all.Band)}`}
                act={<B onClick={save} aria-pressed={saved.includes(id)}><Ic n="star" /> Save</B>} />
            <Kpis>
                <Kpi l="Tier" v={s(all.Tier)} s={`Pre-gate ${s(all['Tier pre-gate']) || '—'}`} icon="star" />
                <Kpi l="Score" v={s(all.Score)} s={`E ${s(all.E)} · D ${s(all.D)} · P* ${s(all['P*'])} · R ${s(all.R)}`} icon="chart" />
                <Kpi l="Risk-adjusted (RA)" v={s(all.RA)} s={`Downturn RA ${s(all['Downturn RA'])}`} icon="shield" />
                <Kpi l="Rank" v={s(all.Rank) || '—'} s="of 321" icon="layers" />
                <Kpi l="Time to revenue" v={s(all['Time to revenue'])} s={s(all.Persona)} icon="clock" />
                <Kpi l="Ranked places" v={leads.length} s={`${hl.length} hotspot leads`} icon="pin" />
            </Kpis>
            <Cols>
                <Card title="Evidence trigger" icon="db">
                    {fact ? (
                        <div className="space-y-2 text-[0.85rem]">
                            <p><b>{s(fact.Fact)}</b></p>
                            <p className="text-[0.8rem]">{s(fact.Value)}</p>
                            <p><FactCite r={fact} /> {fact.URL ? <ExtLink href={fact.URL}>source <Ic n="ext" className="inline size-3.5" /></ExtLink> : null}</p>
                        </div>
                    ) : <p className="text-[0.85rem]">{trigger}</p>}
                </Card>
                <Card title="All attributes (sweep + priority)" icon="file">
                    <Dl rows={Object.entries(all).filter(([k, v]) => !SKIP.has(k) && v !== '' && v !== null && v !== undefined).map(([k, v]) => [k, s(v)])} />
                </Card>
            </Cols>
            <Card title="Where — ranked places for this template" icon="pin" sub="Ranked lead = RA + M + H + F − G; ties by fit then Census 2022 population">
                <DataTable<Row> name={`${id}_leads`} rows={leads} size={10} cols={[
                    { k: 'Rank', l: 'Rank', num: true }, { k: 'Place', l: 'Place', r: (x) => <TLink href={cHref(BW, `geo/town/${s(x['Place ID'])}`)}>{s(x.Place)}</TLink> },
                    { k: 'Unit', l: 'Unit' }, { k: 'Population', l: 'Population', num: true, r: (x) => N(x.Population) }, { k: 'Nearest gateway', l: 'Nearest gateway' },
                    { k: 'Gateway km', l: 'Gateway km', num: true }, { k: 'Lead score', l: 'Lead score', num: true }, { k: 'Tier', l: 'Tier', r: (x) => <TierChip t={x.Tier} /> },
                ]} />
            </Card>
            {hl.length > 0 && (
                <Card title="Hotspot leads — next action and institution to call" icon="flame">
                    <STable head={['Lead', 'Hotspot', 'Place', 'Status', 'Next action', 'Institution to call', 'Owner', 'Due']}
                        rows={hl.map((h) => [s(h['Lead ID']), s(h.Hotspot), s(h.Place), <StatusChip key="s" s={h.Status} />, s(h['Next action']), s(h['Institution to call']), s(h.Owner), s(h.Due)])} />
                </Card>
            )}
            <div className="flex flex-wrap gap-2">
                <A v="pri" href={cHref(BW, 'quote', `?opp=${encodeURIComponent(id)}`)}>Request an opportunity brief →</A>
                <A href={cHref(BW, `sector/${s(all.Sector)}`)}>Sector {s(all.Sector)} →</A>
                <A href={cHref(BW, 'opps')}>All opportunities</A>
            </div>
            {shelf && <SprintShelf shelf={shelf} c={c} />}
            {toast.node}
        </CountryPage>
    );
}
