/* P18 Country Landing Plan: where to land (prototype #/c/{ISO}/landing). */
import { Link, router } from '@inertiajs/react';
import { Bars, Card, Cols, Field, N, Note, STable, inputCls, useUsdM } from '@/Components/Industries/Kit';
import { BW, cHref, CountryHead, CountryPage, NoPack, SprintShelf } from '@/Components/CountryHub/Layout';
import { BotswanaMap, type BwGeo } from '@/Components/CountryHub/Maps';
import { JSteps } from '@/Components/CountryHub/Journey';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';

interface Place { place: string; id: string; unit: string; n: number; a: number; bestTemplate: string; bestOpp: string; gw: string; km: number | string; pop: number }
interface Props {
    base: CountryBase;
    pack: boolean;
    sector?: string;
    persona?: string;
    sectors?: Record<string, string>;
    personas?: string[];
    count?: number;
    top?: Place | null;
    places?: Place[];
    envelopes?: { unit: string; v: number }[];
    map?: { geo: BwGeo; units: Row[]; towns: Row[]; gateways: Row[]; hotspots: Row[] };
    shelf?: HubShelf;
}

const DESC = 'Pick your sector and persona: the plan ranks every place by Tier A leads, shows the nearest border gateway and the investment envelope of the unit.';

export default function Landing({ base, pack, sector = 'ALL', persona = 'ALL', sectors = {}, personas = [], count = 0, top, places = [], envelopes = [], map, shelf }: Props) {
    const { c } = base;
    const usdM = useUsdM();
    if (!pack || !map || !shelf) {
        return (
            <CountryPage base={base} pageKey="landing">
                <CountryHead base={base} pageKey="landing" title="Country Landing Plan" desc="Where to land: place, gateway and envelope." />
                <JSteps c={c} active="landing" />
                <NoPack c={c} what="Landing plan" pageKey="landing" />
            </CountryPage>
        );
    }
    const go = (s: string, p: string) => router.get(cHref(c, 'landing'), { sector: s, persona: p }, { preserveScroll: true });

    return (
        <CountryPage base={base} pageKey="landing">
            <CountryHead base={base} pageKey="landing" title="Country Landing Plan" desc={DESC} />
            <JSteps c={c} active="landing" />
            <Card>
                <div className="flex flex-wrap items-end gap-3">
                    <Field label="Sector">
                        <select className={inputCls} value={sector} onChange={(e) => go(e.target.value, persona)}>
                            <option value="ALL">All sectors</option>
                            {Object.entries(sectors).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
                        </select>
                    </Field>
                    <Field label="Persona">
                        <select className={inputCls} value={persona} onChange={(e) => go(sector, e.target.value)}>
                            <option value="ALL">All personas</option>
                            {personas.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </Field>
                    <div className="grow" />
                    {top && <Note><b>Recommended landing place:</b> {top.place} ({top.unit}) — {top.a} Tier A of {top.n} leads · gateway {top.gw} ({top.km} km)</Note>}
                </div>
            </Card>
            <Cols n={2}>
                <Card title="Where the leads are" icon="map">
                    <BotswanaMap geo={map.geo} units={map.units} towns={map.towns} gateways={map.gateways} hotspots={map.hotspots} metric="tierA"
                        unitHref={(code) => cHref(BW, `geo/unit/${code}`)} townHref={(id) => cHref(BW, `geo/town/${id}`)} label="Map of Botswana: districts shaded by Tier A leads, with towns and border gateways" />
                </Card>
                <Card title="Ranked landing places" icon="pin" sub={`${N(count)} ranked leads match`}>
                    <STable compact head={['Place', 'Unit', 'Leads', 'Tier A', 'Best template', 'Gateway (km)']} rows={places.map((p) => [
                        <Link key="p" href={cHref(BW, `geo/town/${p.id}`)} className="text-controlled-700 hover:underline">{p.place}</Link>, p.unit, p.n, <b key="a">{p.a}</b>,
                        <Link key="o" href={cHref(BW, `opp/${p.bestTemplate}`)} className="text-[0.8rem] text-controlled-700 hover:underline">{p.bestOpp}</Link>, `${p.gw} (${p.km})`,
                    ])} />
                </Card>
            </Cols>
            <Card title="Unit envelopes — capital that could land where" icon="cash" sub="Weighted by lead score × population [COMPUTED, indicative]">
                <Bars rows={envelopes.map((e) => ({ label: e.unit, value: e.v, text: usdM(e.v) }))} />
            </Card>
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}
