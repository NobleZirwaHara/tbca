import { router } from '@inertiajs/react';
import { A, Bars, Card, Chip, Cols, DataTable, Flag, GradeChip, Ic, Kpi, Kpis, N, Note, STable, SrcTag, StatusChip, TagM, TagP, TagR, TagS, Tabs, fmtM, useUsdM, type Tone } from '@/Components/Industries/Kit';
import { IndustryPage, Shelf, iHref, tradeHref } from '@/Components/Industries/Layout';
import type { Country, IndustryBase, Regulator, SprintCardData } from '@/types/industries';

type R = Record<string, string | number | null>;
type P = { iso3: string; iso2: string; slug: string; name: string; imp: number; exp: number };
type Sub = { code: string; name: string; desc: string; aiim: string[]; hs: number[]; avg: number | null; n: number; a: number; tpl: number };
interface Props extends IndustryBase {
    country: Country;
    tab: string;
    tabs: string[];
    bw: boolean;
    za: boolean;
    band: [string, Tone];
    sc: { s: number; e: number; m: number };
    rank: number;
    goods: boolean;
    groups: string[];
    kpi: { templates: number; tierA: number; facts: number };
    topI: P[];
    topE: P[];
    subRows: Sub[];
    coppsCount: number;
    facts?: R[];
    regs?: Regulator[];
    partnerRoutes?: number;
    pri?: R[];
    zopps?: R[];
    regChange?: R[];
    policy?: R[];
    shocks?: R[];
    downturn?: R[];
    families?: { fam: string; name: string; n: number }[];
    shelf?: SprintCardData[];
    land?: { total: number; units: { unit: string; n: number; places: string[] }[] };
    sources?: R[];
    basis?: string;
}

const LABELS: Record<string, string> = { overview: 'Overview', subs: 'Sub-Sectors', market: 'Market Overview', reg: 'Regulatory Landscape', incent: 'Incentives & Support', risks: 'Risks & Red Flags', tbca: 'TBCA Relevance & Coverage', land: 'Where to Land', sources: 'Data Sources' };

function subPri(r: Sub): [string, Tone] {
    return r.avg !== null ? (r.avg >= 10.5 ? ['High Priority', 'ok'] : r.avg >= 9.5 ? ['Medium Priority', 'info'] : ['Emerging', 'warn']) : r.tpl ? ['Template-led', 'info'] : ['To be assessed', 'grey'];
}

export default function Intersection(p: Props) {
    const { ind, country: c, tab, bw, za } = p;
    const usdM = useUsdM();
    const s = (r: R, k: string) => String(r[k] ?? '');
    const here = (t: string) => `/industries/${ind.slug}/country/${c.slug}${t === 'overview' ? '' : `?tab=${t}`}`;
    const csub = za ? 'Activated · Phase 1 market since 15 Aug 2026 · pan-African activation 21 Oct 2026' : bw ? 'Activated · full country pack BW-1.0 (09 Oct 2026) loaded' : `Activated · pan-African activation 21 Oct 2026 · ${c.region} Africa`;
    const factsRow = (f: R) => (
        <div key={s(f, 'Fact ID')} className="border-b border-parchment-300 py-1.5">
            <div className="text-[0.82rem]"><b>{s(f, 'Value')}</b> — {s(f, 'Fact')}</div>
            <div className="text-[0.72rem] text-ink-400">{s(f, 'Fact ID')} · {s(f, 'Source')} · {s(f, 'Date')} {f.Grade ? <GradeChip g={f.Grade} /> : <Chip t="SA model" tone="info" />}</div>
        </div>
    );

    const body = () => {
        switch (tab) {
            case 'subs':
                return (
                    <>
                        <STable head={['Sub-industry', 'AIIM sectors', 'HS groups', 'BW templates', 'Tier A', 'Continental templates', 'Priority']} rows={p.subRows.map((r) => {
                            const [l, t] = subPri(r);
                            return [<><b>{r.name}</b><div className="text-[0.72rem] text-ink-400">{r.desc}</div></>, <span className="text-[0.75rem]">{r.aiim.map((x) => <span key={x} className="block">{x}</span>)}{!r.aiim.length && '—'}</span>,
                                <span className="text-[0.75rem]">{r.hs.length ? r.hs.map((g) => <span key={g} className="block">{p.groups[g]}</span>) : 'Services'}</span>, bw ? r.n : '—', bw ? r.a : '—', r.tpl, <Chip t={l} tone={t} />];
                        })} />
                        {(p.pri ?? []).length > 0 ? (
                            <Card title="Ranked templates (BW_Priority)" icon="star">
                                <DataTable<R> name={`bw-priority-${ind.code}`} rows={p.pri ?? []} size={10} filters={['Sector', 'Tier', 'Band']}
                                    cols={[{ k: 'Rank', l: '#', num: true }, { k: 'Opp ID', l: 'ID' }, { k: 'Sector', l: 'Sector' }, { k: 'Opportunity', l: 'Opportunity', clip: true }, { k: 'Band', l: 'Band' }, { k: 'Score', l: 'Score', num: true }, { k: 'Tier', l: 'Tier' }, { k: 'Persona', l: 'Persona' }, { k: 'Institution to call', l: 'Call', clip: true }]} />
                            </Card>
                        ) : (p.zopps ?? []).length > 0 ? (
                            <Card title="South Africa worked-example opportunities (I2_WX)" icon="star">
                                <DataTable<R> name="za-opps" rows={p.zopps ?? []} size={10} cols={[{ k: 'Opp ID', l: 'ID' }, { k: 'Sector name', l: 'Sector' }, { k: 'Opportunity', l: 'Opportunity', clip: true }, { k: 'Map placement', l: 'Placement', clip: true }, { k: 'Investment model', l: 'Model' }]} />
                            </Card>
                        ) : null}
                    </>
                );
            case 'market':
                return (
                    <>
                        {(p.facts ?? []).length > 0 && (
                            <Card title="Graded facts" icon="db">
                                <DataTable<R> name="facts" rows={p.facts ?? []} size={10} cols={[{ k: 'Fact ID', l: 'ID' }, { k: 'Fact', l: 'Fact', clip: true }, { k: 'Value', l: 'Value' }, { k: 'Source', l: 'Source', clip: true }, { k: 'Date', l: 'Date' }, { l: 'Grade', r: (r) => (r.Grade ? <GradeChip g={r.Grade} /> : <Chip t="SA model" tone="info" />), v: (r) => String(r.Grade ?? '') }]} />
                            </Card>
                        )}
                        {p.goods ? (
                            <>
                                <Cols>
                                    <Card title={`Top suppliers to ${c.name}`} icon="chart" sub="Industry HS groups · modelled"><Bars rows={p.topI.map((r) => ({ label: r.name, value: r.imp, text: `US$ ${fmtM(r.imp)} m` }))} /></Card>
                                    <Card title={`Top buyers from ${c.name}`} icon="chart" sub="Industry HS groups · modelled"><Bars rows={p.topE.map((r) => ({ label: r.name, value: r.exp, text: `US$ ${fmtM(r.exp)} m` }))} /></Card>
                                </Cols>
                                <div><A v="yellow" href={tradeHref(ind, c.slug)}><Ic n="swap" /> Open Import & Export heat maps</A></div>
                            </>
                        ) : <p className="text-[0.85rem]"><TagP /> Services industry — goods trade does not apply.</p>}
                    </>
                );
            case 'reg':
                return (
                    <>
                        <DataTable<Regulator> name={`regulators-${c.iso3}`} rows={p.regs ?? []} size={12} cols={[{ k: 'name', l: 'Body / role', clip: true }, { k: 'type', l: 'Type' }, { k: 'what', l: 'Permits / scope', clip: true }, { k: 'time', l: 'Typical time' }, { l: 'Source', r: (r) => <SrcTag src={r.src} />, v: (r) => r.src }]} />
                        {bw && (
                            <Card title="Regulatory change in force or pending" icon="alert">
                                <STable compact head={['ID', 'Change', 'Instrument', 'Status', 'Impact']} rows={(p.regChange ?? []).map((r) => [s(r, 'ID'), s(r, 'Change'), s(r, 'Instrument'), <StatusChip s={r.Status} />, <span className="text-[0.78rem]">{s(r, 'Impact')}</span>])} />
                            </Card>
                        )}
                    </>
                );
            case 'incent':
                return bw ? (
                    <>
                        <DataTable<R> name="bw-policy" rows={p.policy ?? []} size={10} cols={[{ k: 'Code', l: 'Code' }, { k: 'Instrument', l: 'Instrument', clip: true }, { k: 'Templates', l: 'Templates', clip: true }]} />
                        <p className="text-[0.72rem] text-ink-400"><TagS s="BW_Policy" /> Instruments linked to this industry's ranked templates.</p>
                    </>
                ) : (
                    <ul className="space-y-1 text-[0.85rem]">
                        <li>✓ AfCFTA preferential tariffs on qualifying originating goods <TagR /></li>
                        <li>✓ {c.recs || 'REC'} regional instruments <TagR /></li>
                        <li>✓ National investment incentives — named schemes load with the {c.name} pack <TagP /></li>
                        <li>✓ Development finance: DFI and blended-finance windows matched in the Investment Readiness Sprint</li>
                    </ul>
                );
            case 'risks':
                return (
                    <>
                        {(p.shocks ?? []).length > 0 && <STable compact head={['Sector', 'Index', 'Downturn index', 'Rationale']} rows={(p.shocks ?? []).map((r) => [s(r, 'Sector name'), <b>{s(r, 'Index')}</b>, s(r, 'Downturn index'), <span className="text-[0.78rem]">{s(r, 'Rationale')}</span>])} />}
                        {bw ? (
                            <Card title="Downturn stress-test (BW_Downturn)" icon="alert">
                                <DataTable<R> name="downturn" rows={p.downturn ?? []} size={8} cols={[{ k: 'Opp ID', l: 'ID' }, { k: 'Opportunity', l: 'Opportunity', clip: true }, { k: 'Tier base', l: 'Tier base' }, { k: 'Tier downturn', l: 'Tier downturn' }]} />
                            </Card>
                        ) : (
                            <>
                                <ul className="list-disc space-y-1 ps-5 text-[0.85rem]"><li>Licensing timelines and regulator discretion</li><li>FX convertibility and repatriation</li><li>Payment-cycle and counterparty risk</li><li>Logistics and border delays{p.goods ? ` on ${p.topI[0]?.name ?? 'main'} corridor` : ''}</li></ul>
                                <p className="text-[0.72rem] text-ink-400"><TagR /> Generic red flags until the {c.name} shock register loads <TagP />.</p>
                            </>
                        )}
                    </>
                );
            case 'tbca':
                return (
                    <>
                        <Card title="Approved Sprints by service family" icon="layers"><Bars rows={(p.families ?? []).map((f) => ({ label: f.name, value: f.n, href: `${iHref(ind, 'services')}?fam=${f.fam}` }))} /></Card>
                        <Shelf ind={ind} sprints={p.shelf ?? []} title={`Start in ${c.name}`} />
                    </>
                );
            case 'land':
                return p.land ? (
                    <Card title="Where to land — ranked leads for this industry" icon="pin" sub={`${N(p.land.total)} of 2,137 BW_Ranked_Leads are in this industry's AIIM sectors`}>
                        <STable compact head={['District / unit', 'Ranked leads', 'Top places']} rows={p.land.units.map((u) => [u.unit, <b>{u.n}</b>, <span className="text-[0.78rem]">{u.places.join(', ')}</span>])} />
                        <A className="mt-3" href="/aiim/country/botswana">Open the full Botswana landing plan →</A>
                    </Card>
                ) : null;
            case 'sources':
                return (
                    <>
                        {bw && <DataTable<R> name="sources" rows={p.sources ?? []} size={10} cols={[{ k: 'Source', l: 'Source', clip: true }, { k: 'Date', l: 'Date' }, { k: 'Fact IDs', l: 'Facts', clip: true }, { l: 'Grade', r: (r) => <GradeChip g={r.Grade} />, v: (r) => String(r.Grade ?? '') }]} />}
                        <ul className="list-disc space-y-1 ps-5 text-[0.82rem]"><li>Botswana Country Pack BW-1.0 and Deep Registers (62 sheets)</li><li>Continental model I2 registers (Opportunity, Asset, Commodity HS, worked examples)</li><li>{p.basis}</li><li>ECON-R0C catalogue (7,589 Sprints)</li></ul>
                    </>
                );
            default:
                return (
                    <>
                        {!bw && !za && (
                            <Note>{c.name} is activated for {ind.name}: services are priced and the engagement journey works. Country-specific graded facts load with the {c.name} pack ({c.pack || 'scheduled'}) <TagP />; this page uses the continental registers and the trade model meanwhile. <a className="underline" href={`/industries/${ind.slug}/country/botswana`}>See the full Botswana example →</a></Note>
                        )}
                        <Cols>
                            <Card title={`Priority Sub-Sectors in ${c.name}`} icon="layers" act={<A sm href={here('subs')}>All sub-sectors →</A>}>
                                {p.subRows.map((r) => {
                                    const [l, t] = subPri(r);
                                    return (
                                        <div key={r.code} className="flex items-start justify-between gap-2 border-b border-parchment-300 py-2">
                                            <div className="min-w-0"><b className="text-[0.82rem]">{r.name}</b><div className="text-[0.72rem] text-ink-400">{r.desc}{r.n ? ` · ${r.n} BW templates, ${r.a} tier A` : r.tpl ? ` · ${r.tpl} continental templates` : ''}</div></div>
                                            <Chip t={l} tone={t} />
                                        </div>
                                    );
                                })}
                            </Card>
                            <Card title={`Market Highlights (${c.name})`} icon="chart">
                                {(p.facts ?? []).length ? (p.facts ?? []).map(factsRow) : (
                                    <ul className="space-y-1.5 text-[0.82rem]">
                                        {p.goods && <><li>✓ Intra-African {ind.name.toLowerCase()} exports ≈ US$ {fmtM(p.sc.e)} m; imports ≈ US$ {fmtM(p.sc.m)} m <TagM /></li>
                                            <li>✓ Top supplier: {p.topI[0]?.name ?? '—'} · top buyer: {p.topE[0]?.name ?? '—'} <TagM /></li></>}
                                        <li>✓ Population {N(c.pop, 1)} m · GDP US$ {N(c.gdp)} bn <TagR /></li>
                                        <li>✓ RECs: {c.recs || '—'} · VAT {c.vat === null ? 'n/a' : `${c.vat} %`} <TagR /></li>
                                        <li>✓ {p.coppsCount} continental opportunity templates apply where evidenced</li>
                                    </ul>
                                )}
                            </Card>
                        </Cols>
                        <Cols>
                            <Card title="Regulatory & Policy Snapshot" icon="scale" act={<A sm href={here('reg')}>View regulatory landscape →</A>}>
                                <STable compact head={['Body / role', 'Scope', 'Status']} rows={(p.regs ?? []).map((r) => [<b className="text-[0.78rem]">{r.name}</b>, <span className="text-[0.78rem]">{r.what}{r.time !== '—' ? ` · ${r.time}` : ''}</span>,
                                    r.src === 'Placeholder' ? <Chip t="To verify" tone="warn" /> : r.src === 'Reference' ? <Chip t="Reference" tone="info" /> : <Chip t="Sourced" tone="ok" />])} />
                            </Card>
                            <Card title={`TBCA in ${c.name}`} icon="shield">
                                <p className="mb-2 text-[0.82rem]">TBCA provides sector-adapted diagnostics, intelligence and professional-route advisory for {ind.name} in {c.name}.</p>
                                <Kpis>
                                    <Kpi l="Curated Services" v={N(ind.stats.approved)} s="Approved" icon="tag" />
                                    <Kpi l="Sector Diagnostics" v={N(ind.stats.diagnostics)} icon="check" />
                                    <Kpi l="Partner Routes" v={N(p.partnerRoutes)} s="Partner-delivered Sprints" icon="users" />
                                </Kpis>
                                <div className="mt-3 flex flex-wrap gap-2"><A v="pri" href={iHref(ind, 'services')}>Explore services →</A><A href={`${iHref(ind, 'engage')}?iso=${c.iso3}`}>Start engagement</A></div>
                                <p className="mt-2 text-[0.72rem] text-ink-400">Some services may require regulatory permissions or professional partner engagements before delivery.</p>
                            </Card>
                        </Cols>
                    </>
                );
        }
    };

    return (
        <IndustryPage base={p} active="countries" label={c.name} extraCrumbs={tab !== 'overview' ? [[LABELS[tab]]] : []}>
            <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1 basis-[22rem]">
                    <div className="text-[0.72rem] font-semibold tracking-[0.14em] text-gold-700 uppercase">Industry–Country Intersection · Mock-up Page 9</div>
                    <h1 className="mt-1 text-[1.6rem] leading-tight font-bold text-ink-900 sm:text-[1.85rem]"><Flag iso2={c.iso2} /> {c.name} · {ind.name}</h1>
                    <p className="mt-1.5 text-[0.9rem] text-ink-500">How {ind.name} operates in {c.name} today: market scale, priority sub-sectors, regulatory context, incentives and TBCA service coverage.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <A v="yellow" href={tradeHref(ind, c.slug)} className="min-h-[42px]"><Ic n="swap" /> Import and Export</A>
                    <A href={`/countries/${c.iso2.toLowerCase()}`}>{c.name} country profile</A>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-[6px] border border-parchment-400 bg-white p-3.5">
                <Flag iso2={c.iso2} className="text-[2rem]" />
                <div className="min-w-0 flex-1"><h2 className="text-[1.1rem] font-semibold">{c.name}</h2><div className="text-[0.8rem] text-ink-400">{csub}</div></div>
                <Chip t="Activated" tone="ok" />{bw && <Chip t="Full pack BW-1.0" tone="gold" />}<Chip t="Intersection: Active" tone="ok" />
                <select aria-label="Switch country" className="h-9 rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.8rem]" value={c.iso3} onChange={(e) => { const x = p.countries.find((k) => k.iso3 === e.target.value); if (x) router.visit(`/industries/${ind.slug}/country/${x.slug}`); }}>
                    {p.countries.map((x) => <option key={x.iso3} value={x.iso3}>{x.name}</option>)}
                </select>
            </div>
            <Kpis>
                <Kpi l="Opportunity Score" v={`${N(p.sc.s, 1)}/100`} s={<>{p.band[0]} · rank {p.rank}/54 <TagM /></>} icon="gauge" />
                <Kpi l="Industry Exports (intra-Africa)" v={p.goods ? usdM(p.sc.e) : 'Services'} s={p.goods ? 'Modelled · industry HS groups' : 'Not in goods matrix'} icon="ship" />
                <Kpi l="Industry Imports (intra-Africa)" v={p.goods ? usdM(p.sc.m) : '—'} s={p.goods ? 'Modelled' : ''} icon="ship" />
                <Kpi l={bw ? 'Ranked Templates' : 'Templates'} v={N(p.kpi.templates)} s={bw ? `${p.kpi.tierA} tier A` : za ? 'SA worked example' : 'Continental register'} icon="star" />
                <Kpi l="Graded Facts" v={N(p.kpi.facts)} s={bw ? 'BW-1.0' : za ? 'SA model (I2_WX)' : 'Pack pending'} icon="db" />
                <Kpi l="TBCA Coverage" v={N(ind.stats.approved)} s={`${N(ind.stats.diagnostics)} diagnostics`} icon="check" />
            </Kpis>
            <Tabs items={p.tabs.map((t) => [t, LABELS[t]] as [string, string])} active={tab} hrefFor={here} />
            <div className="space-y-4">{body()}</div>
        </IndustryPage>
    );
}
