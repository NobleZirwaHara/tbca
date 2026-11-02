import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { Banner, Btn, CtaBand, Dl, Hero, P, Panel, Rich, StatusPill, TierPill } from '@/Components/Aiim/ProtoExplore';
import {
    BareTable, BriefCta, BuyBtn, BwFrame, BwMap, CTable, ObjActions, SvcRail, type BriefP, type Cell, type MapData, type RailP, type Row, type SearchBase, type SvcP,
} from '@/Components/Aiim/ProtoSearch';
import type { Fact } from '@/Components/Aiim/ProtoSearch';
import { GradePill } from '@/Components/Aiim/ProtoExplore';

interface HotspotRec { i: number; Hotspot: string; Place: string; 'Unit code': string; Fact: string; Status: string; 'Place ID': string; Match: string; best: number }
interface Props extends SearchBase {
    kind: 'hotspot' | 'precedent';
    id: string;
    hotspot?: HotspotRec;
    leads?: Row[];
    leadCols?: string[];
    map?: MapData;
    precedent?: Row;
    sector?: { code: string; name: string };
    fact?: Fact | null;
    templates?: Row[];
    brief: BriefP;
    rail?: RailP;
    advisory?: SvcP | null;
}

/** P10 — Project Overview: an evidence hotspot (H{n}) or a precedent deal (P-nn) (prototype #project.{id}). */
export default function Project(p: Props) {
    if (p.kind === 'hotspot' && p.hotspot) return <Hotspot {...p} h={p.hotspot} />;
    const d = p.precedent as Row;
    const sec = p.sector as { code: string; name: string };
    return (
        <BwFrame title={`${String(d.Deal)} · Project Overview`} crumbs={[{ label: 'Projects', href: P.projects }, { label: String(d.Deal) }]} facts={p.facts}>
            <Hero
                eyebrow={`Project overview · precedent ${p.id}`}
                title={String(d.Deal)}
                lead={`${d.Size} · ${d.Scope} · ${d.Date}`}
                right={<>
                    <Btn href={P.sector(sec.code)} tone="gold">Sector {sec.code}</Btn>
                    <BuyBtn s={p.advisory} ctx={String(d.Deal)}>Transaction advisory</BuyBtn>
                    <ObjActions type="project" itemKey={p.id} saved={p.saved} />
                </>}
                meta={<StatusPill s={d.Status} />}
            />
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="grid min-w-0 content-start gap-4">
                    <Panel title="Deal record"><Dl rows={Object.entries(d).map(([k, v]) => [k, k === 'Status' ? <StatusPill s={v} /> : <Rich t={v} />])} /></Panel>
                    {p.fact && (
                        <Panel title={`Evidence ${String(d.Evidence)}`}>
                            <b className="text-ink-900">{p.fact.Fact}</b>
                            <p className="mt-1"><Rich t={p.fact.Value} /></p>
                            <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.75rem] text-ink-500">{p.fact.Source} · {p.fact.Date} · grade <GradePill g={p.fact.Grade} /></p>
                        </Panel>
                    )}
                    <Panel title="Templates in this sector"><CTable rows={p.templates ?? []} name={`${p.id}-templates`} size={8} /></Panel>
                </div>
                <div className="grid min-w-0 content-start gap-4">
                    <BriefCta b={p.brief} />
                    <SvcRail rail={p.rail} ctx={String(d.Deal)} />
                </div>
            </div>
            <CtaBand />
        </BwFrame>
    );
}

function Hotspot(p: Props & { h: HotspotRec }) {
    const { h } = p;
    const leads = p.leads ?? [];
    return (
        <BwFrame title={`${h.Hotspot} · Project Overview`} crumbs={[{ label: 'Projects', href: P.projects }, { label: h.Hotspot }]} facts={p.facts}>
            <Hero
                eyebrow="Project overview · evidence hotspot · L4"
                title={h.Hotspot}
                lead={<>{h.Place} ({h['Unit code']}) · {h.Status} · evidence <Rich t={h.Fact} /></>}
                right={<>
                    <Btn href={P.advisor} tone="gold">Request introduction</Btn>
                    <Btn href={P.town(h['Place ID'])} tone="dark">Town page</Btn>
                    <ObjActions type="project" itemKey={p.id} saved={p.saved} />
                </>}
            />
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
                <div className="grid min-w-0 content-start gap-4">
                    {p.map && <Panel><BwMap data={p.map} selectedHot={h.i} label={`${h.Hotspot} on the map of Botswana`} /></Panel>}
                    <Panel title="Hotspot leads"><BareTable rows={leads} keys={p.leadCols} /></Panel>
                </div>
                <Panel className="grid content-start gap-3.5">
                    <div className="flex flex-wrap gap-1.5"><span className="rounded-full border border-parchment-500 px-2 py-0.5 text-[0.75rem]">L4 · site</span><StatusPill s={h.Status} /><span className="rounded-full border border-parchment-500 px-2 py-0.5 text-[0.75rem]">match: {h.Match}</span></div>
                    <h2 className="text-[1.2rem] font-bold text-ink-900">{h.Hotspot}</h2>
                    <Dl rows={[
                        ['Place', <Link href={P.town(h['Place ID'])} className="underline decoration-dotted">{h.Place}</Link>],
                        ['Unit', <Link href={P.unit(h['Unit code'])} className="underline decoration-dotted">{h['Unit code']}</Link>],
                        ['Evidence', <Rich t={h.Fact} />], ['Leads', String(leads.length)],
                    ]} />
                    <Panel title={`Hotspot leads (L5) · ${leads.length}`}>
                        <div className="grid gap-2">
                            {leads.map((l) => (
                                <Link key={String(l['Lead ID'])} href={P.lead(String(l['Lead ID']))} className="flex items-start justify-between gap-3 rounded-[8px] border border-parchment-400 p-2.5 hover:border-gold-500">
                                    <div className="min-w-0">
                                        <b className="text-[0.84rem] text-ink-900">{l.Opportunity as Cell}</b>
                                        <div className="mt-0.5 flex flex-wrap gap-x-2 font-mono text-[0.68rem] text-ink-500"><span>{l['Lead ID'] as Cell}</span><span>{l.Template as Cell}</span><span>due {l.Due as Cell}</span></div>
                                    </div>
                                    <div className="grid justify-items-end gap-1"><TierPill t={l.Tier} /><span className="font-mono text-[0.68rem]">score {l['Lead score'] as Cell}</span></div>
                                </Link>
                            ))}
                        </div>
                    </Panel>
                    {leads[0] && <Banner icon={L.Bell}>Next action: {String(leads[0]['Next action'])}</Banner>}
                    <BriefCta b={p.brief} />
                </Panel>
            </div>
            <CtaBand />
        </BwFrame>
    );
}
