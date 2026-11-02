/* AIIM-002 Investor Cockpit (prototype #cockpit), for all 54 countries. Botswana carries the BW-1.0 pack. */
import { Link, router, usePage } from '@inertiajs/react';
import { Banknote, Bookmark, Briefcase, Flag, Gauge as GaugeIcon, Home, Landmark, Map, MapPin, Percent, Route, Shield, ShieldAlert, Star, Target, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import CountryPicker from '@/Components/Aiim/CountryPicker';
import BwMap, { useMapData, type BwMapRaw } from '@/Components/Aiim/Explorer/BwMap';
import CountryExplorer from '@/Components/Aiim/Explorer/CountryExplorer';
import type { CountryIntel } from '@/Components/Aiim/Explorer/types';
import {
    BriefCta, Btn, BuyBtn, BwFlag, CtaBand, DataMeta, DocTable, DocView, DonutBlock, Dl, FactLink, Frame, Gauge, Grid, HBars, HChip, Hero, Kpi, MoreBtn, P, PackLoading, Panel, Rich, SaveBtn, SecIcon,
    Section, SheetTable, SvcRail, WorkspaceCounts, type Block, type Sheet, type Svc,
} from '@/Components/Aiim/ProtoExplore';
import { useUsdM } from '@/Components/Industries/Kit';
import type { AiimPageProps, CountryIndicator, CountryOption, CountryProfile } from '@/types/aiim';

interface BwCockpit {
    summary: Record<string, string | number>;
    macro: { g3: string; g2: string; g1: string; infl: string };
    topUnits: { code: string; name: string; env: number }[];
    sectors: { code: string; name: string; n: number; a: number }[];
    shock: { avg: number; buckets: Record<string, number> };
    partA: Block[];
    headline: { id: string; fact: string; value: string }[];
    benchmark: Sheet;
    map: BwMapRaw;
    briefs: Svc[];
    rail: Svc[];
}

interface Props extends AiimPageProps {
    country: CountryProfile;
    countries: CountryOption[];
    peers: CountryOption[];
    /** South Africa's province-level model pack. */
    content: { kpis: [string, string, string, string][]; topSectors: string[]; opportunityScore: number; risk: { score: number; label: string; split: [string, number][] } } | null;
    provinces: { slug: string; name: string; score: number }[];
    /** Map explorer payload (all countries; Botswana only on a ?tab= deep link). */
    intel: CountryIntel | null;
    bw: BwCockpit | null;
    benchmark: { metric: string; value: string; bw: string | null }[] | null;
    fees: number;
    initialTab: string;
    initialUnit: string | null;
}

const BUCKET_COL: Record<string, string> = { 'Low (index ≤2)': '#1f7a4c', 'Moderate (3–4)': '#4f8fca', 'Elevated (5–6)': '#c96a12', 'High (≥7)': '#b23a2c' };
const QUICK: [string, LucideIcon, string][] = [
    [P.opps, Target, 'Explore opportunities'], [P.projects, MapPin, 'View projects & hotspots'], [P.investors, Users, 'Find investors'], [P.funders, Landmark, 'Find funders'],
    [P.corridors, Route, 'Trade corridor map'], [P.hs, Briefcase, 'Commodity HS lookup'], [P.risk, Shield, 'Risk & outlook'], [P.workspace, Home, 'Go to my workspace'],
];

function QuickActions({ items }: { items: [string, LucideIcon, string][] }) {
    return (
        <div className="grid gap-2">
            {items.map(([href, I, l]) => <Link key={l} href={href} className="flex items-center gap-2.5 rounded-[8px] border border-parchment-400 px-3 py-2.5 text-[0.85rem] font-semibold text-ink-900 hover:border-gold-500"><I className="size-4 text-ink-600" />{l}</Link>)}
        </div>
    );
}

export default function Cockpit(props: Props) {
    return props.bw ? <BotswanaCockpit {...props} bw={props.bw} /> : <CountryCockpit {...props} />;
}

/* ------------------------------------------------------------------ Botswana (BW-1.0 pack) */
function BotswanaCockpit({ country, countries, bw, intel, initialTab, initialUnit, fees }: Props & { bw: BwCockpit }) {
    const { snapshot } = usePage<Props>().props;
    const usdM = useUsdM();
    const S = bw.summary;
    const map = useMapData(bw.map);
    const [pick, setPick] = useState(false);
    const tiers = [{ n: 'Tier A+', v: Number(S['Tier A+']), c: '#d6a32e' }, { n: 'Tier A', v: Number(S['Tier A']), c: '#1f7a4c' }, { n: 'Tier B', v: Number(S['Tier B']), c: '#4f8fca' }, { n: 'Tier C', v: Number(S['Tier C']), c: '#9a9aa5' }];
    const N = (v: unknown) => Number(v ?? 0).toLocaleString('en-US');

    return (
        <Frame title="Botswana Investor Cockpit" crumbs={[{ label: 'Africa', href: '/aiim' }, { label: 'Southern Africa', href: '/aiim' }, { label: 'Botswana' }]}>
            <Hero
                eyebrow="Botswana · Investor Cockpit"
                title={<><BwFlag w={44} h={29} /> Botswana Investor Cockpit</>}
                lead="Your intelligence dashboard for Botswana: investment signals, 18 sectors, 16 administrative units, 83 pinned places, 6 border gateways, trade flows, risks and opportunities. Phase 1 deep catalogue BW-1.0."
                meta={<DataMeta />}
                right={<>
                    <Btn href={P.map} tone="gold"><Map className="size-3.5" /> Map View</Btn>
                    <BuyBtn svc={bw.briefs[0]} ctx="Botswana Country Investment Brief"><Briefcase className="size-3.5" /> Download Brief</BuyBtn>
                    <SaveBtn type="aiim-cockpit" itemKey="botswana" label="Botswana Cockpit" url={P.cockpit} />
                    <button type="button" className="inline-flex h-8 items-center rounded-full border border-ink-600 bg-ink-800 px-3 text-[0.78rem] font-semibold text-parchment-100 hover:border-gold-500" onClick={() => setPick((v) => !v)} aria-expanded={pick}>Change country</button>
                </>}
            />
            {pick && <div className="mt-3 max-w-md rounded-[12px] bg-ink-950 p-3"><CountryPicker countries={countries} value={country.slug} label="Change country" /></div>}

            <Grid cols={4} className="mt-4">
                <Kpi icon={Target} l="Investment opportunities" v={N(S['Sweep templates'])} s={`templates from US$200,000 · ${S['S-band share %']} % S-band`} src="BW_Summary" />
                <Kpi icon={Star} l="Tier A (incl. A+)" v={N(Number(S['Tier A+']) + Number(S['Tier A']))} s={`${S['Tier A+']} A+ · ${S['Robust Tier A']} robust · freshness-gated`} src="BW_Summary" />
                <Kpi icon={MapPin} l="Hotspot leads" v={N(S['Hotspot leads'])} s="with next action and institution to call" src="BW_Hotspot_Leads" />
                <Kpi icon={Flag} l="Ranked leads" v={N(S['Ranked leads'])} s={`${N(S['Coverage rows'])} coverage rows across 83 places`} src="BW_Ranked_Leads" />
                <Kpi icon={TrendingUp} l="Real GDP growth Q2 2026" v={bw.macro.g3} s={`2025: ${bw.macro.g2} · 2024: ${bw.macro.g1}`} src="BW-MAC-F1–F3 · grade 3" />
                <Kpi icon={ShieldAlert} l="Inflation (Aug 2026)" v={bw.macro.infl} s="target 3–6 % · MoPR 5.5 % (+200 bp)" src="BW-MAC-F6, F8" />
                <Kpi icon={Banknote} l="Pula per US$" v="13.84" s="R1.207 per pula · crawl −2.76 % p.a." src="BW-MAC-F9–F11 · grade 2" />
                <Kpi icon={Shield} l="Sovereign rating" v="BBB-" s="S&P · negative outlook (11 Sep 2026)" src="BW-MAC-F27" />
            </Grid>

            {intel && (
                <Section title="Drill-down explorer" sub="Areas, opportunity records, places, heat map, questions and the country pack as loaded in the app.">
                    <div className="rounded-[16px] bg-ink-950 p-4 text-parchment-100">
                        <CountryExplorer intel={intel} countryName={country.name} activation={country.activation} initialTab={initialTab} initialUnit={initialUnit} hideOverview />
                    </div>
                </Section>
            )}

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <Panel flush className="flex flex-col" title={<>Unit opportunity heatmap <small className="font-normal text-ink-500">weighted envelope · click a unit</small></>} right={<span className="pr-4"><MoreBtn href={P.map}>Open full map →</MoreBtn></span>}>
                    <div className="min-h-[520px] flex-1 overflow-hidden rounded-b-[12px]">
                        <BwMap data={map} metric="envW" fill layers={{ corr: false, roads: false, rail: false, air: false, heat: false, water: false }}
                            onSelect={(s) => { if (s?.type === 'unit') router.visit(P.unit(s.code)); else if (s?.type === 'town') router.visit(P.town(s.id)); else if (s?.type === 'hot') router.visit(P.project(`H${s.i}`)); else if (s?.type === 'gw') router.visit(`${P.map}?sel=gw:${s.i}`); }} />
                    </div>
                </Panel>
                <div className="grid content-start gap-4">
                    <Panel title="Top units by weighted envelope" right={<MoreBtn href={P.units}>All 16</MoreBtn>}>
                        <HBars items={bw.topUnits.map((u) => ({ n: u.name, v: u.env, href: P.unit(u.code) }))} fmt={(v) => usdM(v)} />
                    </Panel>
                    <Panel title="Opportunity tiers">
                        <DonutBlock segs={tiers} center={S['Sweep templates']} sub="templates" />
                        <p className="mt-2 text-[0.78rem] text-ink-500">{S['Tier A pre-gate']} Tier A before the freshness and shock gates; {S['Gated to B (stale)']} gated as stale, {S['Gated to B (RA < 10)']} gated on risk-adjusted score.</p>
                    </Panel>
                </div>
            </div>

            <Grid cols={3} className="mt-4">
                <Panel title={<>Top opportunity sectors <small className="font-normal text-ink-500">by Tier A count</small></>} right={<MoreBtn href={P.sectors}>All 18</MoreBtn>}>
                    <div className="grid gap-1">
                        {bw.sectors.map((s, i) => (
                            <Link key={s.code} href={P.sector(s.code)} className="grid grid-cols-[20px_28px_minmax(0,1fr)_auto] items-center gap-2 rounded-[6px] px-1 py-1.5 text-[0.84rem] hover:bg-parchment-200">
                                <span className="font-mono text-ink-400">{i + 1}</span><SecIcon code={s.code} size={24} /><span className="truncate">{s.name}</span><span className="font-mono text-[0.75rem] text-ink-600">{s.a} A · {s.n}</span>
                            </Link>
                        ))}
                    </div>
                </Panel>
                <Panel title={<>Risk snapshot <small className="font-normal text-ink-500">sector shock index, base case</small></>} right={<MoreBtn href={P.risk}>Risk &amp; Outlook</MoreBtn>}>
                    <div className="grid justify-items-center"><Gauge v={bw.shock.avg} max={12} label={bw.shock.avg.toFixed(1)} sub="avg index / 12" /></div>
                    <HBars items={Object.entries(bw.shock.buckets).map(([k, v]) => ({ n: k, v, c: BUCKET_COL[k] }))} cols="grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto]" />
                    <p className="mt-2 text-[0.78rem] text-ink-500">Highest: Trade, Retail &amp; Citizen Markets (7 → 9 in a diamond downturn). {S['Downturn: downgraded']} templates downgrade in the downturn scenario.</p>
                </Panel>
                <Panel title="Quick actions"><QuickActions items={QUICK} /></Panel>
            </Grid>

            <WorkspaceCounts snapshot={snapshot} fees={fees} />

            <Section title="Why Botswana is different" sub="PART A of the Country Pack — macro picture, seven engines and the binding constraint.">
                <div className="grid gap-4 lg:grid-cols-2">
                    <Panel><DocView blocks={bw.partA} /></Panel>
                    <div className="grid content-start gap-4">
                        <Panel title={<>Headline indicators <small className="font-normal text-ink-500">BW_Macro · grade 3 unless marked</small></>}>
                            <Dl rows={bw.headline.map((h) => [h.fact, <><Rich t={h.value} /> <FactLink id={`BW-${h.id}`} label={h.id} /></>])} />
                        </Panel>
                        <Panel title="Reference data">
                            <Dl rows={[['Capital', 'Gaborone'], ['Currency', 'Botswana pula (BWP)'], ['Region', 'Southern Africa · SACU · SADC (HQ Gaborone)'], ['Population', '2,359,609 (Census 2022)'], ['Units', '10 districts + 6 city/town councils'], ['Border gateways', '6 (no sea port)'], ['Exchange controls', 'None since Feb 1999']]} />
                        </Panel>
                    </div>
                </div>
            </Section>

            <Section title="Eight-country benchmark" sub="A-1: dated comparison across the AIIM packs (values as reported in each pack).">
                <SheetTable sheet={bw.benchmark} size={25} filters={[]} />
            </Section>

            <Grid cols={2} className="mt-5">
                <BriefCta title="Botswana Country Investment Brief" sub="Macro, sectors, units, risks and next actions in one brief" svc={bw.briefs[0]} />
                <BriefCta title="Boardroom Briefing Pack" sub="Board-ready Botswana pack with the diamond-downturn stress view" svc={bw.briefs[1]} />
            </Grid>
            <SvcRail items={bw.rail} title="Country intelligence services" />
            <CtaBand />
        </Frame>
    );
}

/* ------------------------------------------------------------------ any other country: same template, loaded records */
const num = (n: number) => n.toLocaleString('en-ZA', { maximumFractionDigits: 1 });
function show(i: CountryIndicator | undefined): string {
    if (!i || i.value === null) return 'Awaiting data';
    if (i.unit === 'million') return `${num(i.value)} M`;
    if (i.unit === 'USD billion') return `US$ ${num(i.value)} B`;
    if (i.unit === 'USD') return `US$ ${num(i.value)}`;
    if (i.unit === '%') return `${num(i.value)}%`;
    return `${num(i.value)} ${i.unit}`;
}
const src = (i: CountryIndicator | undefined) => (!i ? '' : i.status === 'sourced' ? `Sourced · ${i.source}` : `Placeholder · ${i.source}`);

function CountryCockpit({ country, countries, peers, content, provinces, intel, benchmark, fees, initialTab, initialUnit }: Props) {
    const { snapshot } = usePage<Props>().props;
    const [pick, setPick] = useState(false);
    const ind = country.indicators;
    const act = country.activation;
    const cov = intel?.coverage;
    const units = (intel?.units ?? []).filter((u) => u.level === 1);
    const top = [...units].sort((a, b) => b.projects - a.projects || (b.population ?? 0) - (a.population ?? 0) || a.name.localeCompare(b.name)).slice(0, 9);
    const customHref = `${P.custom}?country=${country.slug}`;
    const secCount: Record<string, number> = {};
    (intel?.opportunities ?? []).forEach((o) => { secCount[o.sectorCode] = (secCount[o.sectorCode] ?? 0) + 1; });
    const secRank = Object.entries(secCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const sa = Boolean(country.hasProvincePack && content);
    const risk = sa ? content!.risk.score : ind.risk_score?.value ?? null;
    const quick: [string, LucideIcon, string][] = [
        [P.opps + `?country=${country.slug}`, Target, 'Explore opportunities'], [P.projects, MapPin, 'View projects'], [P.investors, Users, 'Find investors'], [P.funders, Landmark, 'Find funders'],
        [P.corridors, Route, 'Trade corridor map'], [customHref, Briefcase, `Request ${country.name} intelligence`], [P.risk, Shield, 'Risk & outlook'], [P.workspace, Home, 'Go to my workspace'],
    ];

    return (
        <Frame title={`${country.name} Investor Cockpit`} crumbs={[{ label: 'Africa', href: '/aiim' }, { label: country.regionName, href: '/aiim' }, { label: country.name }]}>
            <Hero
                eyebrow={`${country.name} · Investor Cockpit`}
                title={<><span aria-hidden="true">{country.flag}</span> {country.name} Investor Cockpit</>}
                lead={`Your intelligence dashboard for ${country.name}: headline indicators, areas and towns, project briefs, opportunity records, investor and trader questions, risks and opportunities. One of 54 country cockpits.`}
                meta={<>
                    <HChip dot>Roll-out wave {act.wave ? act.wave.replace('[PROPOSED]', '').trim() : 'not set'}</HChip>
                    <HChip>Country pack: {act.packStatus ?? 'Not started'}{act.packCode ? ` (${act.packCode})` : ''}</HChip>
                    {cov && <HChip>{cov.projects} project briefs · {cov.opportunities} opportunity records · {cov.units} areas</HChip>}
                    <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-dashed border-gold-500/70 bg-gold-500/10 px-2.5 py-1 text-[0.75rem] text-gold-200"><Shield className="size-3.5" /> AI + human-reviewed public intelligence · not financial or legal advice</span>
                </>}
                right={<>
                    <Btn href={`/aiim/country/${country.slug}/map`} tone="gold"><Map className="size-3.5" /> Map View</Btn>
                    <Btn href={sa ? '/aiim/store/SA-IC-2025' : customHref} tone="dark"><Briefcase className="size-3.5" /> {sa ? 'Download Brief' : 'Request Country Brief'}</Btn>
                    <SaveBtn type="aiim-cockpit" itemKey={country.slug} label={`${country.name} Cockpit`} url={`/aiim/country/${country.slug}`} />
                    <button type="button" className="inline-flex h-8 items-center rounded-full border border-ink-600 bg-ink-800 px-3 text-[0.78rem] font-semibold text-parchment-100 hover:border-gold-500" onClick={() => setPick((v) => !v)} aria-expanded={pick}>Change country</button>
                </>}
            />
            {pick && <div className="mt-3 max-w-md rounded-[12px] bg-ink-950 p-3"><CountryPicker countries={countries} value={country.slug} label="Change country" /></div>}

            <Grid cols={4} className="mt-4">
                {sa ? content!.kpis.slice(0, 4).map(([l, v, s]) => <Kpi key={l} icon={Target} l={l} v={v} s={s} src="AIIM South Africa model pack" />) : (
                    <>
                        <Kpi icon={Target} l="Opportunity records" v={cov?.opportunities ?? 0} s={`${cov?.africaTemplates ?? 0} Africa-wide templates`} src="Loaded opportunity register" />
                        <Kpi icon={Star} l="Project briefs" v={cov?.projects ?? 0} s={`${cov?.screened ?? 0} screened`} src="Project screening register" />
                        <Kpi icon={MapPin} l="Areas and towns" v={cov?.units ?? 0} s={`${units.length} first-level areas`} src="Admin-unit hierarchy" />
                        <Kpi icon={Flag} l="Country pack" v={act.packStatus ?? 'Not started'} s={act.packCode ?? 'Pack loading'} src="I2_Country_Activation" />
                    </>
                )}
                <Kpi icon={Users} l={`Population${ind.population?.year ? ` (${ind.population.year})` : ''}`} v={show(ind.population)} s={src(ind.population)} />
                <Kpi icon={TrendingUp} l="GDP (nominal)" v={show(ind.gdp)} s={src(ind.gdp)} />
                <Kpi icon={Percent} l="Real GDP growth" v={show(ind.gdp_growth)} s={src(ind.gdp_growth)} />
                <Kpi icon={GaugeIcon} l="GDP per capita" v={show(ind.gdp_per_capita)} s={src(ind.gdp_per_capita)} />
            </Grid>

            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <Panel flush title={<>{sa ? 'Province' : 'Area'} drill-down map <small className="font-normal text-ink-500">click an area</small></>} right={<span className="pr-4"><MoreBtn href={`/aiim/country/${country.slug}/map`}>Open full map →</MoreBtn></span>}>
                    <div className={intel && intel.coverage.units > 0 ? 'rounded-b-[12px] bg-ink-950 p-3 text-parchment-100' : 'px-4 pb-4'}>
                        {intel && intel.coverage.units > 0
                            ? <CountryExplorer intel={intel} countryName={country.name} activation={act} initialTab={initialTab} initialUnit={initialUnit} hideOverview />
                            : <div><PackLoading country={country.name} what="Areas, towns and the drill-down map"><Btn href={customHref} tone="gold">Request regional intelligence</Btn></PackLoading></div>}
                    </div>
                </Panel>
                <div className="grid content-start gap-4">
                    <Panel title={sa ? 'Top provinces by score' : 'Top areas'} right={<MoreBtn href={`/aiim/country/${country.slug}/provinces`}>All</MoreBtn>}>
                        {sa ? <HBars items={provinces.slice(0, 9).map((p) => ({ n: p.name, v: p.score, href: P.unit(p.slug) }))} max={100} />
                            : top.length ? <HBars items={top.map((u) => ({ n: u.name, v: u.projects || u.population || 0, href: `/aiim/country/${country.slug}?tab=map&unit=${u.slug}` }))} fmt={(v) => v.toLocaleString('en-US')} />
                                : <p className="text-[0.85rem] text-ink-500">No areas loaded yet.</p>}
                        {!sa && top.length > 0 && <p className="mt-2 text-[0.75rem] text-ink-400">Project briefs per area, or population where no brief is loaded.</p>}
                    </Panel>
                    <Panel title="Opportunity tiers">
                        {sa ? <DonutBlock segs={content!.risk.split.map(([n, v], i) => ({ n, v, c: ['#1f7a4c', '#4f8fca', '#c96a12', '#b23a2c'][i] ?? '#9a9aa5' }))} center={`${content!.risk.score}/5`} sub="risk split" />
                            : <PackLoading country={country.name} what="The freshness-gated tier mix of opportunity templates" />}
                    </Panel>
                </div>
            </div>

            <Grid cols={3} className="mt-4">
                <Panel title={<>Top opportunity sectors {!sa && secRank.length > 0 && <small className="font-normal text-ink-500">by opportunity records</small>}</>} right={<MoreBtn href={P.sectors}>All sectors</MoreBtn>}>
                    {sa ? <ol className="grid gap-1.5 text-[0.85rem]">{content!.topSectors.map((s, i) => <li key={s}><span className="mr-2 font-mono text-ink-400">{i + 1}</span>{s}</li>)}</ol>
                        : secRank.length ? <ol className="grid gap-1.5 text-[0.85rem]">{secRank.map(([code, n], i) => <li key={code} className="flex items-center gap-2"><span className="w-4 font-mono text-ink-400">{i + 1}</span><SecIcon code={code} size={22} /><span className="min-w-0 flex-1 truncate">{intel?.sectorCodes.find((s) => s.code === code)?.name ?? code}</span><span className="font-mono text-[0.75rem] text-ink-500">{n}</span></li>)}</ol>
                            : <p className="text-[0.85rem] text-ink-500">Sector ranking loads with the country pack.</p>}
                </Panel>
                <Panel title={<>Risk snapshot <small className="font-normal text-ink-500">{sa ? 'model pack' : 'placeholder indicator'}</small></>} right={<MoreBtn href={P.risk}>Risk &amp; Outlook</MoreBtn>}>
                    {risk !== null ? <div className="grid justify-items-center"><Gauge v={risk} max={5} label={String(risk)} sub="risk score / 5" /><p className="text-[0.78rem] text-ink-500">{sa ? content!.risk.label : 'Placeholder until the country pack is loaded.'}</p></div>
                        : <p className="text-[0.85rem] text-ink-500">Risk scoring loads with the country pack.</p>}
                </Panel>
                <Panel title="Quick actions"><QuickActions items={quick} /></Panel>
            </Grid>

            <WorkspaceCounts snapshot={snapshot} fees={fees} />

            <Section title={`Why ${country.name} is different`} sub="PART A of the country pack — macro picture, engines and the binding constraint.">
                <div className="grid gap-4 lg:grid-cols-2">
                    <PackLoading country={country.name} what="The macro picture and binding constraint"><Btn href={customHref} tone="gold">Commission a country brief</Btn></PackLoading>
                    <div className="grid content-start gap-4">
                        <Panel title="Reference data">
                            <Dl rows={[['Capital', country.capital], ['Currency', `${country.currencyName} (${country.currencyCode})`], ['Region', country.regionName], ['Land area', `${num(country.areaKm2)} km²`]]} />
                        </Panel>
                        {peers.length > 0 && (
                            <Panel title={`More in ${country.regionName}`}>
                                <div className="flex flex-wrap gap-1.5">{peers.map((p) => <Link key={p.slug} href={`/aiim/country/${p.slug}`} className="rounded-full border border-parchment-400 px-2.5 py-0.5 text-[0.78rem] hover:border-gold-500"><span aria-hidden="true">{p.flag}</span> {p.name}</Link>)}</div>
                            </Panel>
                        )}
                    </div>
                </div>
            </Section>

            {benchmark && (
                <Section title="Eight-country benchmark" sub={`A-1: ${country.name} against Botswana, values as reported in each pack.`}>
                    <DocTable rows={[['Metric', country.name, 'Botswana'], ...benchmark.map((b) => [b.metric, b.value, b.bw])]} />
                </Section>
            )}

            <CtaBand text={`Speak to a TBCA Advisor for tailored market entry, verification, partner mapping and deal advisory in ${country.name}.`} />
            <p className="mt-3 text-[0.75rem] text-ink-400"><Bookmark className="inline size-3" /> Indicators marked placeholder are approximate reference figures and are replaced when the country pack is loaded.</p>
        </Frame>
    );
}
