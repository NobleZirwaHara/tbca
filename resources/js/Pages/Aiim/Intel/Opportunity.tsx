import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { CtaBand, Dl, Grid, HBars, Hero, Kpi, P, Panel, Rich, TierPill } from '@/Components/Aiim/ProtoExplore';
import {
    BareTable, BriefCta, BuyBtn, BwFrame, BwMap, CTable, ObjActions, Price, SvcRail,
    type BriefP, type Cell, type MapData, type RailP, type Row, type SearchBase, type SvcP,
} from '@/Components/Aiim/ProtoSearch';

interface Props extends SearchBase {
    id: string;
    kindLabel: string;
    sector: { code: string; name: string; color: string };
    title: string;
    lead: { trigger: string | null; evidence: string | null; factDate: string | null; placement: string | null; model: string | null; i2Trigger: string | null; i2Model: string | null };
    chips: { tier: string | null; band: string | null; persona: string | null; ttr: string | null; citizen: boolean; fx: boolean };
    score: null | { score: number; ra: number; downturn: string; places: number; build: [string, number, number][]; tierPre: string; tier: string; gate: string; fresh: string; robust: string };
    record: [string, Cell][];
    ranked: Row[];
    hotLeads: Row[];
    coverage: Row[];
    map: MapData | null;
    policy: { Code: string; Instrument: string; Templates: number } | null;
    call: [string, string][] | null;
    unlock: SvcP | null;
    brief: BriefP;
    rail: RailP;
}

/** P8 — Opportunity Preview, Botswana template or Issue 2.0 opportunity (prototype #opp.{id}). */
export default function Opportunity(p: Props) {
    const { id, sector, lead, chips, score, map } = p;
    const pill = 'inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-bold';
    const recordCell = (k: string, v: Cell) => (k === 'Sector' ? <Link href={P.sector(String(v))} className="underline decoration-dotted">{sector.name}</Link> : /Tier/.test(k) ? <TierPill t={v} /> : <Rich t={v} />);
    return (
        <BwFrame title={`${id} · Opportunity Preview`} crumbs={[{ label: 'Opportunities', href: P.opps }, { label: sector.name, href: P.sector(sector.code) }, { label: id }]} facts={p.facts}>
            <Hero
                eyebrow={`${id} · ${p.kindLabel} · ${sector.name}`}
                title={p.title}
                lead={<>
                    {lead.trigger && <>{lead.trigger} — evidence <Rich t={lead.evidence} /> ({lead.factDate}). </>}
                    {lead.placement && <>Placement: {lead.placement}. Model: {lead.model}.</>}
                    {lead.i2Trigger && <>{lead.i2Trigger} · {lead.i2Model}</>}
                </>}
                right={<>
                    <BuyBtn s={p.unlock} ctx={`${id} full record`} tone="gold"><L.Lock className="size-3.5" /> Unlock full record</BuyBtn>
                    <ObjActions type="opportunity" itemKey={id} saved={p.saved} />
                </>}
                meta={<>
                    {chips.tier && chips.tier !== '—' && <TierPill t={chips.tier} />}
                    {chips.band && chips.band !== '—' && <span className="rounded-full border border-ink-700 px-2.5 py-1 text-[0.75rem] text-ink-200">{chips.band}</span>}
                    {chips.persona && chips.persona !== '—' && <span className="rounded-full border border-ink-700 px-2.5 py-1 text-[0.75rem] text-ink-200">{chips.persona}</span>}
                    {chips.ttr && chips.ttr !== '—' && <span className="inline-flex items-center gap-1 rounded-full border border-ink-700 px-2.5 py-1 text-[0.75rem] text-ink-200"><L.Clock className="size-3" /> {chips.ttr}</span>}
                    {chips.citizen && <span className={`${pill} bg-gold-500 text-ink-950`}>Citizen-reserved</span>}
                    {chips.fx && <span className={`${pill} bg-verified-700 text-white`}>FX earner</span>}
                </>}
            />
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="grid min-w-0 content-start gap-4">
                    {score && (
                        <>
                            <Grid cols={4}>
                                <Kpi l="Score" v={score.score} s="E + D + P* + (4 − R)" src="BW_Sweep" />
                                <Kpi l="Risk-adjusted" v={score.ra} s="Tier A needs RA ≥ 10" />
                                <Kpi l="Downturn" v={score.downturn} s="H-6 re-tiering" />
                                <Kpi l="Eligible places" v={score.places} s={`${p.ranked.length} ranked · ${p.coverage.length} coverage`} />
                            </Grid>
                            <Panel title="Score build-up">
                                <HBars items={score.build.map(([n, v, max]) => ({ n, v, c: v >= max ? '#2f8a57' : '#d6a32e' }))} max={4} />
                                <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.78rem] text-ink-500">
                                    Tier pre-gate <TierPill t={score.tierPre} /> → published <TierPill t={score.tier} />
                                    {score.gate && <> · gate: {score.gate}</>} · fresh: {score.fresh} · robust: {score.robust}
                                </p>
                            </Panel>
                        </>
                    )}
                    <Panel title="Opportunity record"><Dl rows={p.record.map(([k, v]) => [k, recordCell(k, v)])} /></Panel>
                    {p.ranked.length > 0 && (
                        <Panel title="Ranked places" sub={`${p.ranked.length} · lead score = RA + M + H + F + G`}>
                            {map && <div className="mb-3"><BwMap data={map} highlight={p.ranked.map((r) => String(r['Place ID']))} label={`Ranked places for ${id}`} /></div>}
                            <BareTable rows={p.ranked} keys={['Rank', 'Place', 'Unit', 'Population', 'Nearest gateway', 'Gateway km', 'RA', 'M', 'H', 'F', 'G', 'Lead score', 'Tier']} />
                        </Panel>
                    )}
                    {p.hotLeads.length > 0 && (
                        <Panel title="Hotspot leads using this template" sub={String(p.hotLeads.length)}>
                            <BareTable rows={p.hotLeads} />
                        </Panel>
                    )}
                    {p.coverage.length > 0 && (
                        <Panel title="Coverage rows" sub={String(p.coverage.length)}>
                            <CTable rows={p.coverage} name={`${id}-coverage`} size={10} />
                        </Panel>
                    )}
                </div>
                <div className="grid min-w-0 content-start gap-4">
                    <div className="relative min-h-[220px] overflow-hidden rounded-[12px] border border-parchment-400 bg-white p-5">
                        <div className="select-none blur-[3px]" aria-hidden="true">
                            <h3 className="font-semibold text-ink-900">Full opportunity record (60+ fields)</h3>
                            <p className="mt-1 text-[0.84rem] text-ink-500">Capex range, partners, land tenure, counterparty list, citizen-partner shortlist, risk register and the pre-feasibility outline.</p>
                        </div>
                        <div className="absolute inset-0 grid place-items-center bg-white/60">
                            <div className="grid justify-items-center gap-2 text-center">
                                <L.Lock className="size-6 text-ink-800" aria-hidden="true" />
                                <b className="text-ink-900">Premium object</b>
                                <span className="text-[0.8rem] text-ink-500"><Price s={p.unlock} />{p.unlock?.price !== null && ' or 1 credit'}</span>
                                <BuyBtn s={p.unlock} ctx={`${id} full record`} tone="gold">Unlock</BuyBtn>
                            </div>
                        </div>
                    </div>
                    <BriefCta b={p.brief} />
                    {p.policy && (
                        <Panel title="Policy instrument linked">
                            <b className="font-mono">{p.policy.Code}</b>
                            <p className="mt-1"><Rich t={p.policy.Instrument} /></p>
                            <p className="mt-1 text-[0.75rem] text-ink-500">{p.policy.Templates} templates use it</p>
                        </Panel>
                    )}
                    {p.call && <Panel title="Who to call"><Dl rows={p.call} /></Panel>}
                    <SvcRail rail={p.rail} ctx={id} />
                </div>
            </div>
            <CtaBand />
        </BwFrame>
    );
}

