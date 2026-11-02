import * as L from 'lucide-react';
import { CtaBand, Grid, HBars, Hero, Kpi, P, Panel, Rich, Section } from '@/Components/Aiim/ProtoExplore';
import { BuyBtn, BwFrame, BwMap, CTable, ObjActions, SvcRail, type MapCorr, type MapData, type RailP, type Row, type SearchBase, type SvcP } from '@/Components/Aiim/ProtoSearch';
import { N } from '@/Components/Industries/Kit';

interface Corr extends MapCorr { to: string; policy: string; fact: string }
interface Props extends SearchBase {
    corridor: Corr;
    gateway: { i: number; short: string; name: string };
    catchment: { ID: string; Place: string; km: number; pop: number }[];
    population: number;
    policy: { Code: string; Instrument: string } | null;
    fact: { id: string; value: string } | null;
    templates: Row[];
    map: MapData;
    report: SvcP | null;
    clearance: SvcP | null;
    rail: RailP;
}

/** P16 — Trade Corridor Detail (prototype #corridor.{id}). */
export default function Corridor({ corridor: c, gateway: g, catchment, population, policy, fact, templates, map, report, clearance, rail, saved, facts }: Props) {
    return (
        <BwFrame title={`${c.name} · Trade Corridor`} crumbs={[{ label: 'Trade Corridors', href: P.corridors }, { label: c.name }]} facts={facts}>
            <Hero
                eyebrow={`Trade corridor · ${g.short} gateway`}
                title={c.name}
                lead={`${c.to}. Alignment is schematic; distances to the gateway are straight-line [COMPUTED].`}
                right={<>
                    <BuyBtn s={report} ctx={`${c.name} corridor report`} tone="gold"><L.Route className="size-3.5" /> Corridor report</BuyBtn>
                    <BuyBtn s={clearance} ctx={`${g.short} border clearance data`}>Border clearance data</BuyBtn>
                    <ObjActions type="corridor" itemKey={c.id} saved={saved} />
                </>}
            />
            <Grid cols={4} className="mt-4">
                <Kpi l="Gateway" v={g.short} s={g.name} />
                <Kpi l="Places in catchment" v={catchment.length} />
                <Kpi l="Population served" v={N(population)} />
                <Kpi l="Linked instrument" v={policy?.Code ?? '—'} s={policy ? <Rich t={policy.Instrument} /> : undefined} />
            </Grid>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
                <Panel><BwMap data={map} corridors={[c]} selectedGw={g.i} label={`${c.name} and the ${g.short} gateway`} /></Panel>
                <Panel title="Catchment places"><HBars items={catchment.map((t) => ({ n: t.Place, v: t.km, href: P.town(t.ID) }))} fmt={(v) => `${N(v)} km`} /></Panel>
            </div>
            {fact && <Section title="Evidence"><p className="text-[0.9rem]"><Rich t={fact.id} /> — <Rich t={fact.value} /></p></Section>}
            <Section title="Corridor and border templates" sub="Transport sector plus templates tagged CORRIDOR or BORDER."><CTable rows={templates} name={`corridor-${c.id}`} size={10} /></Section>
            <div className="mt-8"><SvcRail rail={rail} ctx={c.name} /></div>
            <CtaBand />
        </BwFrame>
    );
}
