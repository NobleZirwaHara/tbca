/*
 * Botswana map info cards (prototype unitCard, townCard, hotCard, gwCard, mapCountryCard), shared by
 * the Map View side panel and the unit and town profile pages.
 */
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { DoorOpen } from 'lucide-react';
import { Banner, BriefCta, BwFlag, Chip, Dl, HBars, Kpi, P, Panel, Rich, SaveBtn, StatusPill, TagRow, TierPill, type Svc } from '@/Components/Aiim/ProtoExplore';
import { useUsdM } from '@/Components/Industries/Kit';
import { GWCOL, type MGate } from './BwMap';

export interface MixRow { code: string; name: string; color: string; n: number }
export interface HotRow { i: number; name: string; place: string; placeId: string; unit: string; status: string; fact: string; match: string; leads: number }
export interface UnitCardData {
    code: string; name: string; kind: string; wikidata: string; pop: number; popShare: number; envW: number; envE: number; templates: number; tierA: number; places: number; tags: string[];
    ranked: number; hotLeads: number; coverage: number; mix: MixRow[]; hotspots: HotRow[]; brief?: Svc | null;
}
export interface TownCardData {
    id: string; name: string; unit: string; unitName: string; kind: string; pop: number; datasetPop: number; gateway: string; gw: number; gwShort: string | null; km: number;
    ranked: number; rankedA: number; coverage: number; mix: MixRow[]; hotspots: HotRow[]; brief?: Svc | null;
    top: { 'Lead ID': string; Template: string; Opportunity: string; Rank: number; Persona: string; 'Time to revenue': string; Tier: string; 'Lead score': number }[];
}
export interface HotCardData extends HotRow { leadRows: Record<string, string | number>[]; brief: Svc | null }
export interface GwCardData extends MGate { mean: string | null; population: number; towns: { id: string; name: string; km: number }[]; corridors: { id: string; name: string }[]; brief: Svc | null }

const mixBars = (mix: MixRow[], max = 18) => mix.slice(0, max).map((m) => ({ n: m.code, title: m.name, v: m.n, c: m.color, href: P.sector(m.code) }));
const Chips = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap gap-1.5">{children}</div>;
const H2 = ({ children }: { children: ReactNode }) => <h2 className="text-[1.35rem] font-bold text-ink-900">{children}</h2>;
const HotList = ({ list }: { list: HotRow[] }) => (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-1">{list.map((h) => <Link key={h.i} href={P.project(`H${h.i}`)} className="flex items-center justify-between gap-2 rounded-[6px] px-1 py-1.5 text-[0.84rem] hover:bg-parchment-200"><span className="min-w-0 truncate">{h.name}{h.place && <span className="text-ink-500"> · {h.place}</span>}</span><span className="shrink-0"><StatusPill s={h.status} /></span></Link>)}</div>
);

export function UnitCard({ u, compact }: { u: UnitCardData; compact?: boolean }) {
    const usdM = useUsdM();
    return (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3.5">
            <Chips><Chip>L1 · {u.kind}</Chip><Chip className="font-mono">{u.code} · {u.wikidata}</Chip>{u.code === 'CH' && <Rich t="[VERIFY boundary in NW base polygon]" />}</Chips>
            <H2>{u.name}</H2>
            <div className="grid grid-cols-2 gap-2.5">
                <Kpi l="Population" v={u.pop.toLocaleString('en-US')} s={`${u.popShare.toFixed(1)} % of 16 units`} src="Census 2022" />
                <Kpi l="Envelope (weighted)" v={usdM(u.envW)} s={`equal split ${usdM(u.envE)}`} src="COMPUTED · G-5" />
                <Kpi l="Templates" v={u.templates} s={`${u.tierA} Tier A`} src="BW_Units" />
                <Kpi l="Places / leads" v={u.places} s={`${u.ranked.toLocaleString('en-US')} ranked · ${u.hotLeads} hotspot leads`} src="BW_Towns" />
            </div>
            <div><div className="mb-1.5 text-[0.7rem] font-bold tracking-[0.12em] text-ink-500 uppercase">Asset tags</div><TagRow tags={u.tags} /></div>
            <Panel title={<>Coverage by sector <small className="font-normal text-ink-500">{u.coverage.toLocaleString('en-US')} rows</small></>}><HBars items={mixBars(u.mix, compact ? 8 : 18)} cols="grid-cols-[3rem_minmax(0,1fr)_auto]" /></Panel>
            {u.hotspots.length > 0 && <Panel title={<>Hotspots <small className="font-normal text-ink-500">{u.hotspots.length}</small></>}><HotList list={u.hotspots} /></Panel>}
            <BriefCta title={`${u.name} District Profile`} sub={`BW-PB-01 — assets, shocks, ranked templates for ${u.name}`} svc={u.brief} label="Get the Profile" />
            <div className="flex flex-wrap gap-2">
                {compact && <Link href={P.unit(u.code)} className="inline-flex h-8 items-center rounded-full border border-parchment-500 bg-white px-3 text-[0.78rem] font-semibold hover:border-gold-500">Open full profile</Link>}
                <SaveBtn type="aiim-unit" itemKey={`BW-${u.code}`} label={u.name} url={P.unit(u.code)} tone="ghost" />
            </div>
        </div>
    );
}

export function TownCard({ t, compact }: { t: TownCardData; compact?: boolean }) {
    const short = t.name.replace(' (council point)', '');
    return (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3.5">
            <Chips>
                <Chip>L3 · {t.kind}</Chip><Chip href={P.unit(t.unit)}>{t.unitName}</Chip>
                {t.gwShort && <Chip className="border-2" ><span style={{ color: GWCOL[t.gw] }}><DoorOpen className="inline size-3" /></span> {t.gwShort} region</Chip>}
            </Chips>
            <H2>{t.name}</H2>
            <div className="grid grid-cols-2 gap-2.5">
                <Kpi l="Population" v={t.pop.toLocaleString('en-US')} s={t.datasetPop !== t.pop ? `dataset ${t.datasetPop.toLocaleString('en-US')}` : undefined} src="BW_Towns" />
                <Kpi l="Nearest gateway" v={`${t.km} km`} s={t.gwShort ?? ''} src="haversine [COMPUTED]" />
                <Kpi l="Ranked leads" v={t.ranked} s={`${t.rankedA} Tier A`} src="BW_Ranked_Leads" />
                <Kpi l="Coverage rows" v={t.coverage} s="of 10,346" src="BW_Coverage" />
            </div>
            {t.hotspots.length > 0 && <Panel title="Hotspots here"><HotList list={t.hotspots.map((h) => ({ ...h, place: '' }))} /></Panel>}
            {t.top.length > 0 && (
                <Panel title="Best ranked leads">
                    <div className="divide-y divide-parchment-300">
                        {t.top.map((r) => (
                            <Link key={r['Lead ID']} href={P.opp(r.Template)} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-2 hover:bg-parchment-100">
                                <div className="min-w-0"><b className="text-[0.84rem]">{r.Opportunity}</b><div className="flex flex-wrap gap-x-2.5 text-[0.7rem] text-ink-500"><span className="font-mono">{r.Template}</span><span>rank {r.Rank}</span><span>{r.Persona}</span><span>{r['Time to revenue']}</span></div></div>
                                <div className="text-right"><TierPill t={r.Tier} /><div className="font-mono text-[0.7rem]">score {r['Lead score']}</div></div>
                            </Link>
                        ))}
                    </div>
                </Panel>
            )}
            <Panel title="Coverage by sector"><HBars items={mixBars(t.mix)} cols="grid-cols-[3rem_minmax(0,1fr)_auto]" /></Panel>
            <BriefCta title={`${short} Town Profile`} sub="BW-PB-01 town profile with ranked templates" svc={t.brief} label="Get the Profile" />
            <div className="flex flex-wrap gap-2">
                {compact && <Link href={P.town(t.id)} className="inline-flex h-8 items-center rounded-full border border-parchment-500 bg-white px-3 text-[0.78rem] font-semibold hover:border-gold-500">Open town page</Link>}
                <Link href={P.verify} className="inline-flex h-8 items-center rounded-full border border-parchment-500 bg-white px-3 text-[0.78rem] font-semibold hover:border-gold-500">Field verification</Link>
                <SaveBtn type="aiim-town" itemKey={`BW-${t.id}`} label={t.name} url={P.town(t.id)} tone="ghost" />
            </div>
        </div>
    );
}

export function HotCard({ h }: { h: HotCardData }) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3.5">
            <Chips><Chip>L4 · site</Chip><StatusPill s={h.status} /><Chip>match: {h.match}</Chip></Chips>
            <H2>{h.name}</H2>
            <Dl rows={[['Place', <Link key="p" href={P.town(h.placeId)} className="text-controlled-700 underline">{h.place}</Link>], ['Unit', <Link key="u" href={P.unit(h.unit)} className="text-controlled-700 underline">{h.unit}</Link>], ['Evidence', <Rich key="e" t={h.fact} />], ['Leads', String(h.leads)]]} />
            <Panel title={<>Hotspot leads (L5) <small className="font-normal text-ink-500">{h.leadRows.length}</small></>}>
                <div className="divide-y divide-parchment-300">
                    {h.leadRows.map((l) => (
                        <Link key={String(l['Lead ID'])} href={P.lead(String(l['Lead ID']))} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-2 hover:bg-parchment-100">
                            <div className="min-w-0"><b className="text-[0.84rem]">{l.Opportunity}</b><div className="flex flex-wrap gap-x-2.5 text-[0.7rem] text-ink-500"><span className="font-mono">{l['Lead ID']}</span><span>{l.Template}</span><span>due {l.Due}</span></div></div>
                            <div className="text-right"><TierPill t={l.Tier} /><div className="font-mono text-[0.7rem]">score {l['Lead score']}</div></div>
                        </Link>
                    ))}
                </div>
            </Panel>
            {h.leadRows[0] && <Banner>Next action: {h.leadRows[0]['Next action']}</Banner>}
            <BriefCta title="Pre-introduction counterparty verification" sub={`Verify the counterparty before you call ${h.leadRows[0]?.['Institution to call'] ?? ''}`} svc={h.brief} label="Verify first" />
        </div>
    );
}

export function GwCard({ g }: { g: GwCardData }) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3.5">
            <Chips><Chip>Gateway region</Chip></Chips>
            <H2>{g.name}</H2>
            <Dl rows={[
                ['Places nearest', String(g.places)], ['Mean distance', `${g.mean ?? '—'} km (D-2)`], ['Population in catchment', g.population.toLocaleString('en-US')],
                ['Corridors', g.corridors.length ? <span key="c" className="grid">{g.corridors.map((c) => <Link key={c.id} href={P.corridor(c.id)} className="text-controlled-700 underline">{c.name}</Link>)}</span> : '—'],
            ]} />
            <Panel title="Places in this region"><HBars items={g.towns.map((t) => ({ n: t.name, v: t.km, href: P.town(t.id) }))} fmt={(v) => `${v} km`} /></Panel>
            <BriefCta title="Trade Corridor Report" sub="Transit, OSBP, clearance and rail for this gateway" svc={g.brief} />
        </div>
    );
}

export function CountryCard({ summary, gateways, onGateway, brief }: { summary: Record<string, string | number>; gateways: MGate[]; onGateway: (i: number) => void; brief: Svc | null }) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3.5">
            <Chips><Chip>L0 · country</Chip><Chip><BwFlag w={18} h={12} /> Botswana</Chip></Chips>
            <H2>Botswana</H2>
            <Dl rows={[['Population', '2,359,609 (Census 2022)'], ['Units', '16 (10 districts, 6 councils)'], ['Places pinned', '83'], ['Hotspots', '42 named, 42/42 exact matches'], ['Gateways', '6 (no sea port)'], ['Templates', `${Number(summary['Sweep templates']).toLocaleString('en-US')} (${Number(summary['Tier A+']) + Number(summary['Tier A'])} Tier A)`]]} />
            <Panel title="Gateway regions">
                <div className="grid gap-0.5">
                    {gateways.map((g) => (
                        <button key={g.i} type="button" onClick={() => onGateway(g.i)} className="grid grid-cols-[14px_minmax(0,1fr)_40px] items-center gap-2 rounded-[6px] px-1 py-1.5 text-left text-[0.84rem] hover:bg-parchment-200">
                            <i className="block size-2.5 rotate-45" style={{ background: GWCOL[g.i] }} /><span className="truncate">{g.name}</span><span className="text-right font-mono">{g.places}</span>
                        </button>
                    ))}
                </div>
            </Panel>
            <Banner>Places more than 250 km from any gateway: Gweta, Hukuntsi, Lehututu, Maun, Mopipi, Rakops, Shakawe, Tshabong.</Banner>
            <BriefCta title="Botswana Country Investment Brief" sub="One brief for the whole map" svc={brief} />
        </div>
    );
}

