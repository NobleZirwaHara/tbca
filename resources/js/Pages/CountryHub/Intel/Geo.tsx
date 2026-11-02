/* Geography & Places (prototype pages-intel.js #/c/{ISO}/geo?metric=). */
import { Card, Cols, DataTable, Kpi, Kpis, N, PillNav, STable, StatusChip } from '@/Components/Industries/Kit';
import { BW, CountryHead, CountryPage, SprintShelf, cHref } from '@/Components/CountryHub/Layout';
import { BotswanaMap, type BwGeo, type BwMetric } from '@/Components/CountryHub/Maps';
import { TLink, s } from '@/Components/CountryHub/TradeIntel';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';

interface Props { base: CountryBase; metric: BwMetric; geo: BwGeo; units: Row[]; towns: Row[]; gateways: Row[]; hotspots: Row[]; shelf: HubShelf }

const unitHref = (code: string) => cHref(BW, `geo/unit/${code}`);
const townHref = (id: string) => cHref(BW, `geo/town/${id}`);

export default function Geo({ base, metric, geo, units, towns, gateways, hotspots, shelf }: Props) {
    return (
        <CountryPage base={base} pageKey="geo">
            <CountryHead base={base} pageKey="geo" title="Geography & Places"
                desc="16 first-level units with Census 2022 populations, 83 pinned towns and council points, 6 border gateways (Botswana has no sea port) and 42 named evidence hotspots." />
            <Kpis>
                <Kpi l="Units" v="16" s="10 districts · 6 city/town councils" icon="map" />
                <Kpi l="Population (16 units)" v="2,350,961" s="Census 2022" icon="users" />
                <Kpi l="Pinned places" v="83" s="Towns and council points" icon="pin" />
                <Kpi l="Border gateways" v="6" s="Landlocked — no sea port" icon="swap" />
                <Kpi l="Evidence hotspots" v="42" s="42/42 exact place matches" icon="flame" />
            </Kpis>
            <Card title="Botswana map" icon="map" sub="Click a district for its unit profile, a town for its place profile">
                <div className="mb-2.5">
                    <PillNav items={([['pop', 'Population'], ['env', 'Investment envelope'], ['tierA', 'Tier A leads']] as [BwMetric, string][]).map(([k, l]) => ({ label: l, href: cHref(BW, 'geo', `?metric=${k}`), on: k === metric }))} />
                </div>
                <BotswanaMap geo={geo} units={units} towns={towns} gateways={gateways} hotspots={hotspots} metric={metric} unitHref={unitHref} townHref={townHref} />
            </Card>
            <Card title="16 administrative units" icon="layers">
                <DataTable<Row> name="BW_Units" rows={units} size={16} rowHref={(x) => unitHref(s(x.Code))} cols={[
                    { k: 'Code', l: 'Code', r: (x) => <TLink href={unitHref(s(x.Code))}>{s(x.Code)}</TLink> }, { k: 'Unit', l: 'Unit', r: (x) => <TLink href={unitHref(s(x.Code))}>{s(x.Unit)}</TLink> },
                    { k: 'Kind', l: 'Kind' }, { k: 'Population (Census 2022)', l: 'Population', num: true, r: (x) => N(x['Population (Census 2022)']) }, { k: 'Tags', l: 'Tags', clip: true },
                    { k: 'Places', l: 'Places', num: true }, { k: 'Templates', l: 'Templates', num: true }, { k: 'Tier A', l: 'Tier A', num: true },
                    { k: 'Envelope US$ m (weighted)', l: 'Envelope (weighted) US$ m', num: true }, { k: 'Envelope US$ m (equal)', l: 'Envelope (equal)', num: true },
                ]} />
            </Card>
            <Cols>
                <Card title="Border gateways" icon="swap">
                    <STable compact head={['Gateway (proxy)', 'Lat', 'Lon', 'Places nearest']} rows={gateways.map((g) => [s(g['Gateway (proxy)']), s(g.Lat), s(g.Lon), <b key="n">{s(g['Places nearest'])}</b>])} />
                </Card>
                <Card title="Evidence hotspots (42)" icon="flame">
                    <DataTable<Row> name="BW_Hotspots" rows={hotspots} size={7} cols={[
                        { k: 'Hotspot', l: 'Hotspot' }, { k: 'Place', l: 'Place' }, { k: 'Unit code', l: 'Unit code' }, { k: 'Fact', l: 'Fact' },
                        { k: 'Status', l: 'Status', r: (x) => <StatusChip s={x.Status} /> }, { k: 'Match', l: 'Match' },
                    ]} />
                </Card>
            </Cols>
            <Card title="All 83 places" icon="pin">
                <DataTable<Row> name="BW_Towns" rows={towns} size={10} filters={['Unit', 'Kind']} rowHref={(x) => townHref(s(x.ID))} cols={[
                    { k: 'Place', l: 'Place', r: (x) => <TLink href={townHref(s(x.ID))}>{s(x.Place)}</TLink> }, { k: 'Unit', l: 'Unit' }, { k: 'Kind', l: 'Kind' },
                    { k: 'Population used', l: 'Population', num: true, r: (x) => N(x['Population used']) }, { k: 'Nearest gateway', l: 'Nearest gateway' },
                    { k: 'Gateway km', l: 'Gateway km', num: true }, { k: 'M', l: 'M', num: true },
                ]} />
            </Card>
            <SprintShelf shelf={shelf} c={base.c} />
        </CountryPage>
    );
}
