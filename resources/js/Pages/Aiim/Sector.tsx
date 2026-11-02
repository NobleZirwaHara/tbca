/* AIIM-006 Sector profile (prototype #sector.ICT). Botswana sectors by code (/aiim/sector/ICT); app sector slugs keep the South Africa view. */
import { Link, router } from '@inertiajs/react';
import { Briefcase } from 'lucide-react';
import { useState } from 'react';
import BwMap, { useMapData, type BwMapRaw } from '@/Components/Aiim/Explorer/BwMap';
import LegacySector, { type Props as SaProps } from '@/Components/Aiim/Explorer/LegacySector';
import {
    BriefCta, Btn, BuyBtn, CtaBand, DataMeta, Dl, DocTable, DocView, DonutBlock, Eyebrow, FactLink, Frame, GradePill, Grid, Hero, Kpi, P, Panel, PTabs, Rich, SaveBtn, SEC, SecIcon,
    SheetTable, SvcRail, YnPill, type Block, type Row, type Sheet, type Svc,
} from '@/Components/Aiim/ProtoExplore';
import type { AiimPageProps } from '@/types/aiim';

interface BwProps extends AiimPageProps {
    mode: 'bw';
    code: string; n: number; scenarios: string[];
    sweep: Sheet; facts: Row[]; chains: Row[]; mapstack: Row[];
    levelTable: Block['rows'] | null; infoTable: Block['rows'] | null; rulesTable: Block['rows'] | null;
    anchors: Row[]; gapTemplates: Row[]; shock: Row | null; permit: Row | null; products: Row[]; assets: Row[];
    wx: { facts: Sheet; chains: Sheet; mapstack: Sheet; opps: Sheet };
    economics: { id: string; pack: string; irr: string }[];
    regchange: Sheet; worked: Block[]; premium: Row[];
    map: BwMapRaw; heat: Record<string, number>; townCount: Record<string, number>;
    brief: Svc | null; rail: Svc[];
}
type Props = BwProps | (SaProps & { mode: 'sa' });

export default function Sector(props: Props) {
    return props.mode === 'bw' ? <BotswanaSector {...props} /> : <LegacySector {...props} />;
}

const SWEEP_COLS = ['Opp ID', 'Opportunity', 'Band', 'Score', 'RA', 'Tier', 'Downturn tier', 'Citizen-reserved', 'FX earner', 'Persona', 'Time to revenue', 'Evidence'];

function ChainList({ list }: { list: Row[] }) {
    return (
        <Grid cols={2}>
            {list.map((c) => (
                <div key={String(c['#'])} className="grid gap-1.5 rounded-[10px] border border-parchment-400 bg-white p-3">
                    <div className="flex flex-wrap items-center gap-2"><span className="rounded-[4px] bg-ink-900 px-1.5 py-0.5 font-mono text-[0.7rem] text-gold-300">{c['#']}</span><span className="min-w-0 flex-1 text-[0.86rem] font-semibold text-ink-900">{c.Question}</span><span className="rounded-full bg-controlled-50 px-2 py-0.5 text-[0.68rem] font-bold text-controlled-700">{c['Map behaviour']}</span></div>
                    <div className="text-[0.82rem]"><Rich t={c['Information types']} /></div>
                    <div className="text-[0.75rem] text-ink-500">Evidence <Rich t={c.Evidence} /> · {c['Institution/role']}</div>
                </div>
            ))}
        </Grid>
    );
}

function BotswanaSector(p: BwProps) {
    const s = SEC[p.code];
    const [tab, setTab] = useState(0);
    const data = useMapData(p.map);
    const sw = p.sweep.rows;
    const tierN = (t: string) => sw.filter((o) => (t === 'A' ? String(o.Tier).startsWith('A') && !String(o.Tier).startsWith('A+') : String(o.Tier).startsWith(t))).length;
    const tiers = ['A+', 'A', 'B', 'C'].map((t, i) => ({ n: `Tier ${t}`, v: tierN(t), c: ['#d6a32e', '#1f7a4c', '#4f8fca', '#9a9aa5'][i] }));
    const inv = p.chains.filter((c) => c.Chain === 'Investor');
    const trd = p.chains.filter((c) => c.Chain === 'Trader');
    const sh = p.shock ?? {};
    const tabs = ['Overview', 'Investor chain', 'Trader chain', 'Map stack', `Sweep (${sw.length})`, 'Products & assets', 'Shocks, rules & permits', 'Issue 2.0 carry-over', 'Full worked example'];

    const panels = [
        <div key="o" className="grid gap-4 lg:grid-cols-2">
            <Panel title={<>Graded fact base <small className="font-normal text-ink-500">{p.facts.length}</small></>}>
                <div className="divide-y divide-parchment-300">
                    {p.facts.map((f) => (
                        <div key={String(f['Fact ID'])} className="py-2">
                            <div className="flex flex-wrap items-center gap-1.5"><FactLink id={String(f['Fact ID'])} /><GradePill g={f.Grade} /><span className="text-[0.72rem] text-ink-500">{f.Date}</span></div>
                            <b className="text-[0.84rem]">{f.Fact}</b>
                            <div className="text-[0.82rem]"><Rich t={f.Value} /></div>
                        </div>
                    ))}
                </div>
            </Panel>
            <div className="grid content-start gap-4">
                <Panel title="Tier mix"><DonutBlock segs={tiers} center={sw.length} sub="templates" size={130} th={18} /></Panel>
                <Panel title={<>Anchor opportunities <small className="font-normal text-ink-500">{p.anchors.length}</small></>}>
                    <div className="grid gap-1">
                        {p.anchors.map((a) => (
                            <Link key={String(a['Opp ID'])} href={P.opp(String(a['Opp ID']))} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[6px] px-1 py-1.5 hover:bg-parchment-200">
                                <span className="min-w-0 text-[0.84rem]"><span className="font-mono text-ink-500">{a['Opp ID']}</span> {a.Opportunity}<br /><span className="text-[0.72rem] text-ink-500">{a.Placement} · {a.Model}</span></span>
                                <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[0.7rem] font-bold text-gold-800">{String(a.Band).split(' ')[0]}</span>
                            </Link>
                        ))}
                    </div>
                </Panel>
                {p.economics.length > 0 && (
                    <Panel title="Unit economics packs">
                        {p.economics.map((u) => <Link key={u.id} href={P.economics} className="flex justify-between gap-2 rounded-[6px] px-1 py-1.5 text-[0.84rem] hover:bg-parchment-200"><span>{u.id} · {u.pack}</span><b className="font-mono">IRR {u.irr}</b></Link>)}
                    </Panel>
                )}
            </div>
        </div>,
        <ChainList key="i" list={inv} />,
        <ChainList key="t" list={trd} />,
        <div key="m" className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
                <Panel title={<>Map stack <small className="font-normal text-ink-500">{p.mapstack.length} layers</small></>}><DocTable rows={[['Layer', 'Levels', 'Geometry', 'Illumination'], ...p.mapstack.map((m) => [m.Layer, m.Levels, m.Geometry, m.Illumination])]} /></Panel>
                <Panel title="What shows at each level"><DocTable rows={p.levelTable} /></Panel>
            </div>
            <Panel title="Additional information types"><DocTable rows={p.infoTable} /></Panel>
        </div>,
        <SheetTable key="s" sheet={p.sweep} cols={SWEEP_COLS} size={25} filters={['Tier', 'Persona']} fmt={{ 'Citizen-reserved': (v) => <YnPill v={v} yes="Reserved" />, 'FX earner': (v) => <YnPill v={v} yes="FX" ok /> }} />,
        <div key="p" className="grid gap-4">
            <Panel title={<>Botswana products in scope <small className="font-normal text-ink-500">English / Setswana [VERIFY]</small></>}>
                {p.products.length ? (
                    <Grid cols={3}>
                        {p.products.map((x) => (
                            <Link key={String(x.Product)} href={P.hsProduct(String(x.Product))} className="rounded-[10px] border border-parchment-400 p-3 hover:border-gold-500">
                                <div className="font-mono text-[0.7rem] text-ink-500">HS {x['HS 2022']} · {x.Group}</div>
                                <h4 className="font-semibold text-ink-900">{x.Product}</h4>
                                <span className="text-[0.75rem] text-ink-500">{x['Setswana [VERIFY]']} · {x.Note}</span>
                            </Link>
                        ))}
                    </Grid>
                ) : <p className="text-[0.85rem] text-ink-500">No sector-specific products; see the Issue 2.0 commodity list.</p>}
            </Panel>
            <Panel title={<>Issue 2.0 asset types carried over <small className="font-normal text-ink-500">{p.assets.length}</small></>}>
                <div className="flex flex-wrap gap-1.5">{p.assets.map((a) => <span key={String(a['Asset ID'])} className="rounded-[4px] bg-parchment-200 px-2 py-0.5 text-[0.75rem]">{a['Asset ID']} {a['Asset type']}</span>)}</div>
            </Panel>
        </div>,
        <div key="k" className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Shock profile"><Dl rows={Object.entries(sh).filter(([k]) => !['Sector', 'Sector name'].includes(k)).map(([k, v]) => [k, <Rich key={k} t={v} />])} /></Panel>
                <Panel title="Permit pathway (K-4)"><Dl rows={[['Permits', String(p.permit?.Permits ?? '')], ['Issuer', String(p.permit?.Issuer ?? '')], ['Typical time', <Rich key="t" t={p.permit?.['Typical time']} />]]} /></Panel>
            </div>
            <Panel title="Shock rationale, diamond downturn, citizen rules, permits and regulatory changes"><DocTable rows={p.rulesTable} /></Panel>
            {p.regchange.rows.length > 0 && <Panel title="Regulatory changes affecting this sector"><SheetTable sheet={p.regchange} filters={[]} /></Panel>}
        </div>,
        <div key="w" className="grid gap-4">
            <Panel title={<>Issue 2.0 worked-example facts (SA model) <small className="font-normal text-ink-500">{p.wx.facts.rows.length}</small></>}><SheetTable sheet={p.wx.facts} filters={[]} /></Panel>
            <Panel title={<>Issue 2.0 chains <small className="font-normal text-ink-500">{p.wx.chains.rows.length}</small></>}><SheetTable sheet={p.wx.chains} size={10} filters={['Chain']} /></Panel>
            <Panel title="Issue 2.0 map stack"><SheetTable sheet={p.wx.mapstack} filters={[]} /></Panel>
            <Panel title="Issue 2.0 worked-example opportunities"><SheetTable sheet={p.wx.opps} filters={[]} /></Panel>
            <Panel title={<>Issue 2.0 gap templates for Botswana <small className="font-normal text-ink-500">{p.gapTemplates.length}</small></>}>
                <SheetTable sheet={{ name: `bw-${p.code}-gap-templates`, h: ['Opp ID', 'Opportunity', 'Evidence trigger', 'Placement', 'Model', 'Band', 'Verification owner'], rows: p.gapTemplates }} size={10} filters={[]} />
            </Panel>
        </div>,
        <Panel key="f"><DocView blocks={p.worked} /></Panel>,
    ];

    return (
        <Frame title={s.name} crumbs={[{ label: 'Botswana', href: P.cockpit }, { label: 'Sectors', href: P.sectors }, { label: s.name }]}>
            <Hero
                eyebrow={`E${p.n} · ${p.code} · Sector worked example`}
                title={<><SecIcon code={p.code} size={42} /> {s.name}</>}
                lead={<div className="grid gap-1">{p.scenarios.map((x, i) => <span key={i}><Rich t={x} /></span>)}</div>}
                right={<>
                    <BuyBtn svc={p.brief} ctx={`${s.name} — Sector Brief (BW-PB-03)`} tone="gold"><Briefcase className="size-3.5" /> Sector Brief</BuyBtn>
                    <Btn href={P.mapAt(p.code)} tone="dark">Light the map</Btn>
                    <SaveBtn type="aiim-sector" itemKey={`BW-${p.code}`} label={s.name} url={P.sector(p.code)} />
                </>}
                meta={<DataMeta />}
            />
            <Grid cols={6} className="mt-4">
                <Kpi l="Templates" v={sw.length} s="freshness-gated sweep" />
                <Kpi l="Tier A / A+" v={`${tiers[0].v + tiers[1].v} / ${tiers[0].v}`} />
                <Kpi l="Graded facts" v={p.facts.length} s={`${p.facts.filter((f) => Number(f.Grade) === 3).length} grade 3`} />
                <Kpi l="Shock index" v={`${sh.Index ?? '—'} → ${sh['Downturn index'] ?? '—'}`} s="base → diamond downturn" />
                <Kpi l="Citizen-reserved" v={sw.filter((o) => String(o['Citizen-reserved']).startsWith('Y')).length} s="templates" />
                <Kpi l="FX earners" v={sw.filter((o) => String(o['FX earner']).startsWith('Y')).length} s="templates" />
            </Grid>
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="min-w-0">
                    <PTabs tabs={tabs} value={tab} onChange={setTab} />
                    <div className="pt-4" role="tabpanel">{panels[tab]}</div>
                </div>
                <div className="grid min-w-0 content-start gap-4">
                    <Panel flush>
                        <div className="overflow-hidden rounded-t-[12px]">
                            <BwMap data={data} height={560} f={{ sector: p.code, tier: '', persona: '', citizen: false }} heat={p.heat} townCount={p.townCount}
                                layers={{ heat: true, corr: false, roads: false, rail: false, air: false, gw: false, labels: true }}
                                onSelect={(x) => { if (x?.type === 'town') router.visit(P.town(x.id)); else if (x?.type === 'unit') router.visit(P.unit(x.code)); }} />
                        </div>
                        <p className="px-4 py-2.5 text-[0.75rem] text-ink-500">Coverage glow for {p.code} across 83 places. Click a town.</p>
                    </Panel>
                    <BriefCta title={`${s.name} Sector Brief`} sub="BW-PB-03: market, gaps, reserved activities and permits" svc={p.brief} />
                    {p.premium.map((b) => (
                        <div key={String(b.Code)} className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-gold-300 bg-gold-50 p-4">
                            <div className="grid min-w-0 flex-[1_1_200px] gap-1"><Eyebrow>{b.Code}</Eyebrow><b className="text-ink-900">{b.Product}</b><span className="text-[0.8rem] text-ink-600">{b['For whom']} · {b.Contents}</span></div>
                            <Btn href={P.brief(String(b.Code))} tone="gold">View brief</Btn>
                        </div>
                    ))}
                    <SvcRail items={p.rail} title="Sector services" />
                </div>
            </div>
            <CtaBand />
        </Frame>
    );
}
