import { Link } from '@inertiajs/react';
import { A, Bars, Card, Chip, Cols, DataTable, Flag, GradeChip, Ic, Kpi, Kpis, N, STable, StatusChip, TagM, TagP, TagS, Tabs, fmtM, useMoney } from '@/Components/Industries/Kit';
import { Head1, IndustryPage, iHref, tradeHref } from '@/Components/Industries/Layout';
import { useCurrency } from '@/lib/money';
import type { Country, IndustryBase, SprintCardData } from '@/types/industries';

type R = Record<string, string | number | null>;
type C = { iso3: string; iso2: string; slug: string; name: string };
interface Props extends IndustryBase {
    tab: string;
    kpi: { avg: number; totE: number; opps: number; facts: number; grade3: number; srcs: number };
    goods: boolean;
    brief: SprintCardData | null;
    ctxIso: Country;
    facts?: R[];
    flows?: { from: C; to: C; v: number }[];
    top5?: string[];
    groups?: string[];
    oppsAll54?: number;
    pri?: number;
    priA?: number;
    regulated?: boolean;
    exporters?: (C & { s: number; e: number; m: number })[];
    importers?: (C & { s: number; e: number; m: number })[];
    subScores?: { label: string; avg: number }[];
    opps?: R[];
    policy?: R[];
    regChange?: R[];
    shocks?: R[];
    sources?: R[];
    basis?: string;
    tradeBasis?: string;
}

const TABS: [string, string][] = [['facts', 'Quick Facts'], ['exec', 'Executive Summary'], ['market', 'Market Overview'], ['opps', 'Opportunity Landscape'], ['policy', 'Policy & Incentives'], ['risks', 'Risks & Red Flags'], ['trade', 'Trade & Corridors'], ['sources', 'Data Sources'], ['method', 'Methodology']];

export default function Intelligence(p: Props) {
    const { ind, tab, kpi } = p;
    const money = useMoney();
    const { currency } = useCurrency();
    const s = (r: R, k: string) => String(r[k] ?? '');

    const body = () => {
        switch (tab) {
            case 'exec':
                return (
                    <div className="space-y-2 text-[0.88rem] leading-relaxed">
                        <p><b>{ind.name}</b> is active in all 54 countries. On the modelled composite, the continental mean opportunity score is <b>{N(kpi.avg, 1)}/100</b>; the strongest markets are {p.top5?.join(', ')}.</p>
                        {p.goods ? <p>Intra-African trade in the industry's HS groups ({p.groups?.join('; ')}) totals about <b>US$ {fmtM(kpi.totE)} m</b> a year in the modelled baseline. The largest flow is {p.flows?.[0] ? `${p.flows[0].from.name} → ${p.flows[0].to.name} (US$ ${fmtM(p.flows[0].v)} m)` : '—'}.</p>
                            : <p>This is a services industry: goods-trade data does not describe it. Opportunity is modelled from economic size, population and regional connectivity, pending services-trade data <TagP />.</p>}
                        <p>{kpi.opps ? <>The continental register holds <b>{kpi.opps}</b> opportunity templates for this industry, {p.oppsAll54} of which apply to all 54 countries.</> : 'No continental opportunity templates are mapped to this industry yet.'} {p.pri ? `In Botswana, ${p.pri} templates are scored and ranked (${p.priA} tier A).` : ''}</p>
                        <p>{p.regulated ? 'Regulation is the binding constraint: most valuable work needs licensed professionals and specialist sign-off.' : 'Most services can be delivered directly by TBCA with standard human review.'}</p>
                    </div>
                );
            case 'market':
                return (
                    <>
                        <Cols>
                            <Card title="Top exporters (intra-African, modelled)" icon="chart"><Bars rows={(p.exporters ?? []).map((r) => ({ label: r.name, value: r.e, text: `US$ ${fmtM(r.e)} m`, href: `/industries/${ind.slug}/country/${r.slug}` }))} /></Card>
                            <Card title="Top importers (intra-African, modelled)" icon="chart"><Bars rows={(p.importers ?? []).map((r) => ({ label: r.name, value: r.m, text: `US$ ${fmtM(r.m)} m`, href: `/industries/${ind.slug}/country/${r.slug}` }))} /></Card>
                        </Cols>
                        <p className="text-[0.72rem] text-ink-400"><TagM /> Gravity-model baseline split by HS group. {p.goods ? '' : 'Services industries show no goods flows.'}</p>
                    </>
                );
            case 'opps':
                return (
                    <>
                        {(p.subScores ?? []).length > 0 && <Card title="Botswana sub-sector scores (BW_Priority)" icon="star"><Bars rows={(p.subScores ?? []).map((r) => ({ label: r.label, value: r.avg, text: `${N(r.avg, 1)} / 12` }))} /></Card>}
                        <Card title="Opportunity templates" icon="star">
                            <DataTable<R> name={`opps-${ind.code}`} rows={p.opps ?? []} size={10} filters={['Sector', 'Country scope']}
                                cols={[{ k: 'Opp ID', l: 'ID' }, { k: 'Sector', l: 'Sector' }, { k: 'Asset/Commodity', l: 'Asset' }, { k: 'Opportunity', l: 'Opportunity', clip: true }, { k: 'Investment model', l: 'Model' }, { k: 'Country scope', l: 'Scope' }]} />
                        </Card>
                    </>
                );
            case 'policy':
                return (
                    <>
                        {(p.policy ?? []).length ? <DataTable<R> name="policy" rows={p.policy ?? []} size={10} cols={[{ k: 'Code', l: 'Code' }, { k: 'Instrument', l: 'Instrument', clip: true }, { k: 'Templates', l: 'Templates affected', clip: true }]} />
                            : <p className="text-[0.82rem] text-ink-400">No Botswana policy instruments are linked to this industry's templates <TagP />.</p>}
                        {(p.regChange ?? []).length > 0 && <Card title="Regulatory change (BW_RegChange)"><STable compact head={['ID', 'Change', 'Status', 'Impact']} rows={(p.regChange ?? []).map((r) => [s(r, 'ID'), s(r, 'Change'), <StatusChip s={r.Status} />, <span className="text-[0.78rem]">{s(r, 'Impact')}</span>])} /></Card>}
                    </>
                );
            case 'risks':
                return (p.shocks ?? []).length ? (
                    <>
                        <STable compact head={['Sector', 'Diamond market', 'SA dependence', 'Fiscal squeeze', 'Water & drought', 'FMD', 'Inflation & rates', 'Index', 'Downturn']}
                            rows={(p.shocks ?? []).map((r) => [s(r, 'Sector name'), s(r, 'Diamond market'), s(r, 'SA dependence (power, imports, rand)'), s(r, 'Fiscal squeeze'), s(r, 'Water & drought'), s(r, 'Livestock disease (FMD)'), s(r, 'Inflation & rates'), <b>{s(r, 'Index')}</b>, s(r, 'Downturn index')])} />
                        <p className="text-[0.82rem]">{(p.shocks ?? []).map((r, i) => <span key={i} className="block"><b>{s(r, 'Sector name')}:</b> {s(r, 'Rationale')}</span>)}</p>
                        <p className="text-[0.72rem] text-ink-400"><TagS s="BW_Shocks" /> Shock exposure (0–3) for the Botswana economy.</p>
                    </>
                ) : <p className="text-[0.85rem]"><TagP /> No sector shock register for this industry yet. Generic red flags: licensing delays, FX convertibility, payment-cycle risk, concentration on one buyer.</p>;
            case 'trade':
                return p.goods ? (
                    <>
                        <Card title="Largest intra-African corridors for this industry" icon="swap">
                            <STable compact head={['From', 'To', 'US$ m']} rows={(p.flows ?? []).map((f) => [<Link className="text-controlled-700 hover:underline" href={tradeHref(ind, f.from.slug)}><Flag iso2={f.from.iso2} /> {f.from.name}</Link>, <><Flag iso2={f.to.iso2} /> {f.to.name}</>, <b>{fmtM(f.v)}</b>])} />
                        </Card>
                        <div className="flex flex-wrap gap-2"><A v="yellow" href={tradeHref(ind, p.ctxIso.slug)}><Ic n="swap" /> Import and Export for {p.ctxIso.name}</A><A href="/aiim/corridors">Corridor network</A></div>
                    </>
                ) : <p className="text-[0.85rem]"><TagP /> Services trade is not in the goods matrix.</p>;
            case 'sources':
                return (p.sources ?? []).length ? (
                    <DataTable<R> name="sources" rows={p.sources ?? []} size={10} cols={[{ k: 'Source', l: 'Source', clip: true }, { k: 'Date', l: 'Date' }, { k: 'Fact IDs', l: 'Facts', clip: true }, { l: 'Grade', r: (r) => <GradeChip g={r.Grade} />, v: (r) => String(r.Grade ?? '') }, { l: 'Link', r: (r) => (r.URL ? <a href={String(r.URL)} target="_blank" rel="noopener" className="text-controlled-700 underline">Open <Ic n="ext" className="inline size-3" /></a> : '—'), v: () => '' }]} />
                ) : <p className="text-[0.82rem] text-ink-400">No sources linked yet <TagP />.</p>;
            case 'method':
                return (
                    <div className="space-y-2 text-[0.88rem] leading-relaxed">
                        <p><b>Opportunity score.</b> {p.basis}</p>
                        <p><b>Graded facts.</b> Grade 3 = official / primary source; 2 = reputable secondary; 1 = indicative. Botswana facts were random-sample verified (BW_VerifyLog).</p>
                        <p><b>Trade.</b> {p.tradeBasis}</p>
                        <p><b>Labels.</b> Sourced = from the Botswana/continental registers; Reference = general knowledge to verify; Modelled = computed in the prototype; Placeholder = awaiting a country pack or live feed.</p>
                    </div>
                );
            default:
                return (
                    <>
                        <Kpis>
                            <Kpi l="Sector Opportunity Score" v={`${N(kpi.avg, 1)}/100`} s={<>54-country mean <TagM /></>} icon="gauge" />
                            <Kpi l="Intra-African Trade" v={`US$ ${fmtM(kpi.totE)} m`} s={p.goods ? 'Industry HS groups · modelled' : 'Services — not in goods matrix'} icon="swap" />
                            <Kpi l="Countries Covered" v="54" s="All activated" icon="globe" />
                            <Kpi l="Investable Templates" v={N(kpi.opps)} s="I2 Opportunity Register" icon="star" />
                            <Kpi l="Graded Facts" v={N(kpi.facts)} s={`BW-1.0 · ${kpi.grade3} grade 3`} icon="db" />
                            <Kpi l="Verified Sources" v={N(kpi.srcs)} s="BW_Sources" icon="file" />
                        </Kpis>
                        {(p.facts ?? []).length > 0 && (
                            <Card title="Graded facts (Botswana)" icon="db">
                                <DataTable<R> name={`facts-${ind.code}`} rows={p.facts ?? []} size={10} cols={[{ k: 'Fact ID', l: 'Fact ID' }, { k: 'Fact', l: 'Fact', clip: true }, { k: 'Value', l: 'Value' }, { k: 'Source', l: 'Source' }, { k: 'Date', l: 'Date' }, { l: 'Grade', r: (r) => <GradeChip g={r.Grade} />, v: (r) => String(r.Grade ?? '') }]} />
                            </Card>
                        )}
                    </>
                );
        }
    };

    return (
        <IndustryPage base={p} active="intelligence">
            <Head1 eyebrow="AIIM Sector Intelligence · Mock-up Page 8" title={`${ind.name} — Sector Intelligence Brief`} desc={`Comprehensive intelligence, trends and opportunity analysis for ${ind.name} across Africa — sourced, graded and updated.`} act={<Chip t="Premium Intelligence" tone="gold" />} />
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-[6px] bg-ink-900 px-3 py-2.5 text-[0.76rem] text-parchment-300">
                <span>Brief version <b className="text-white">v1.1</b></span><span>Last updated <b className="text-white">21 Oct 2026</b></span><span>Source state <b className="text-white">Verified + Modelled</b></span><span>Languages <b className="text-white">EN · TN · AF</b></span><span>Currency view <b className="text-white">{currency}</b></span>
            </div>
            <Tabs items={TABS} active={tab} hrefFor={(k) => `${iHref(ind, 'intelligence')}?tab=${k}`} />
            <div className="space-y-4">{body()}</div>
            <Card title="Unlock Full Intelligence" icon="lock">
                <p className="text-[0.82rem]">Premium intelligence adds full data tables, benchmarks, project details, investor insights and the methodology annex for any of the 54 countries.</p>
                {p.brief && p.brief.priced && (
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <span className="font-bold">{money(p.brief.ep)} <small className="font-normal text-ink-400">{p.brief.code} · {p.brief.name} · ex VAT</small></span>
                        <A v="pri" href={`${iHref(ind, 'engage')}?sprint=${p.brief.code}`}>Commission brief</A>
                    </div>
                )}
            </Card>
        </IndustryPage>
    );
}
