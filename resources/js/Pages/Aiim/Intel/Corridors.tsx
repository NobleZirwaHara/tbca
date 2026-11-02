import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { CtaBand, DataMeta, DocTable, Hero, P, Panel, Rich, Section } from '@/Components/Aiim/ProtoExplore';
import { BareTable, BuyBtn, BwFrame, BwMap, CountryBar, SvcRail, type MapCorr, type MapData, type RailP, type Row, type SearchBase, type SvcP } from '@/Components/Aiim/ProtoSearch';

interface Corr extends MapCorr { to: string; policy: string; fact: string }
interface Props extends SearchBase {
    lead: string;
    corridors: Corr[];
    map: MapData;
    d2: string[][] | null;
    d2note: string;
    transport: Row[];
    chains: Row[];
    report: SvcP | null;
    rail: RailP;
}

/** P15 — Trade Corridor Search, Botswana: six border gateways and seven corridors (prototype #corridors). */
export default function Corridors({ lead, corridors, map, d2, d2note, transport, chains, report, rail, facts, country, countries }: Props) {
    return (
        <BwFrame title="Trade Corridor Search" crumbs={[{ label: 'Botswana', href: P.cockpit }, { label: 'Trade Corridors' }]} facts={facts}>
            <CountryBar path="/aiim/corridors" country={country} countries={countries} />
            <Hero
                eyebrow="Trade Corridor Search"
                title="Six border gateways, seven corridors, no sea port"
                lead={<Rich t={lead} />}
                right={<BuyBtn s={report} ctx="Trade Corridor Report — Botswana" tone="gold"><L.Route className="size-3.5" /> Corridor report</BuyBtn>}
                meta={<DataMeta />}
            />
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
                <Panel><BwMap data={map} corridors={corridors} region label="Botswana border gateways and trade corridors" /></Panel>
                <div className="grid content-start gap-3">
                    {corridors.map((c) => (
                        <Link key={c.id} href={P.corridor(c.id)} className="grid gap-1 rounded-[12px] border border-parchment-400 bg-white p-3 transition-colors hover:border-gold-500">
                            <div className="flex items-start justify-between gap-2"><h4 className="leading-snug font-semibold text-ink-900">{c.name}</h4><i className="mt-1 block size-2.5 shrink-0 rotate-45" style={{ background: c.col }} aria-hidden="true" /></div>
                            <span className="text-[0.8rem] text-ink-500">{c.to}</span>
                        </Link>
                    ))}
                </div>
            </div>
            <Section title="Border gateways (D-2)">
                <DocTable rows={d2} />
                {d2note && <p className="mt-2 text-[0.84rem] text-ink-500">{d2note}</p>}
            </Section>
            <Section title="Transport facts"><BareTable rows={transport} /></Section>
            <Section title="Trader chain — transport questions"><BareTable rows={chains} /></Section>
            <div className="mt-8"><SvcRail rail={rail} ctx="Trade corridors — Botswana" /></div>
            <CtaBand />
        </BwFrame>
    );
}
