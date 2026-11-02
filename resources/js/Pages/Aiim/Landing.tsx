/* AIIM-001 AIIM Landing Page (prototype #home). */
import { Link } from '@inertiajs/react';
import { ArrowRight, Clock, Database, ShieldCheck, Users } from 'lucide-react';
import CountryPicker from '@/Components/Aiim/CountryPicker';
import type { CoverageRow } from '@/Components/Aiim/Explorer/CoverageBoard';
import { BwFlag, Btn, CtaBand, Eyebrow, Frame, Grid, HBars, Kpi, P, Panel, Rich, Section, SvcPrice, type Row, type Svc } from '@/Components/Aiim/ProtoExplore';
import { HubAfricaMap, MapLegend } from '@/Components/CountryHub/Maps';
import type { AiimPageProps, CountryOption } from '@/types/aiim';

type State = 'live' | 'issued' | 'wave1' | 'later';
interface LandingCountry extends CountryOption { iso3: string; state: State; wave: string | null; pack: string | null }

interface Props extends AiimPageProps {
    countries: LandingCountry[];
    rollout: Row[];
    regions: { region: string; n: number; names: string[] }[];
    top30: { id: string; name: string; score: number; color: string }[];
    actions: Svc[];
    summary: { templates: number | null; tierA: number };
    /** All 54 countries with roll-out wave, pack status and loaded record counts. */
    coverage: (CoverageRow & { iso3: string })[];
}

const FILL: Record<State, string> = { live: '#d6a32e', issued: '#6e5520', wave1: '#3a3122', later: '#1c1c24' };
const STATE: Record<State, string> = { live: 'Live cockpit · click to open', issued: 'Pack issued (Wave 0) · click to open its cockpit', wave1: 'Wave 1 [PROPOSED] · click to open its cockpit', later: 'Later wave · click to open its cockpit' };
const ACTIONS: Record<string, string> = { 'AAB-EMB-192': 'Country Profile Report', 'AAB-EMB-141': 'Investment Opportunity Scan', 'AAB-EMB-173': 'Regulatory & Compliance Check', 'AAB-EMB-205': 'Market Entry Advisory', 'AAB-EMB-196': 'Risk & Political Assessment' };
const HOW: [typeof ShieldCheck, string, string][] = [
    [ShieldCheck, 'Verified & human-reviewed', 'Every fact carries a grade (3 official, 2 market, 1 other), a date and a source link.'],
    [Database, 'Local data sources', '90 sources for Botswana alone, from Statistics Botswana to the Bank of Botswana and Parliament.'],
    [Clock, 'Freshness-gated', 'Tier A needs a fact no older than 18 months; stale facts are greyed and gated.'],
    [Users, 'Human + AI', 'Scouts confirm listings; advisors pick up every lead with the institution to call.'],
];

export default function Landing({ countries, rollout, regions, top30, actions, summary, coverage }: Props) {
    const by = Object.fromEntries(countries.map((c) => [c.iso3, c]));
    const cov = Object.fromEntries(coverage.map((c) => [c.iso3, c]));
    const tip = (iso3: string, name: string) => {
        const c = by[iso3];
        const r = cov[iso3];
        const extra = r && (r.projects || r.opportunities || r.units) ? `\n${r.projects} project briefs · ${r.opportunities} opportunity records · ${r.units} areas` : '';
        return `${name}\n${c ? STATE[c.state] : ''}${extra}`;
    };

    return (
        <Frame title="AIIM – Africa Investment Intelligence Map">
            <section className="relative grid items-center gap-6 overflow-hidden rounded-[16px] bg-ink-950 p-6 text-parchment-100 sm:p-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(214,163,46,.2),transparent_55%)]" aria-hidden="true" />
                <div className="relative grid gap-4">
                    <Eyebrow className="text-gold-400">AIIM — Africa Investment Intelligence Map</Eyebrow>
                    <h1 className="text-[2rem] leading-[1.1] font-bold tracking-tight sm:text-[2.75rem]">54 Markets. One Intelligence Platform.</h1>
                    <p className="max-w-xl text-[0.98rem] leading-relaxed text-ink-200">Opportunities, projects, investors, funders, sectors, trade corridors, commodity codes and risk outlook for every African market, built from graded evidence and human review. Botswana is the first country rebuilt to the new standard: click it on the map.</p>
                    <div className="flex flex-wrap gap-2">
                        <Btn href={P.cockpit} tone="gold" sm={false}><BwFlag w={20} h={13} /> Open Botswana Cockpit</Btn>
                        <Btn href={P.map} tone="dark" sm={false}>Explore the map</Btn>
                        <Btn href={P.sitemap} tone="dark" sm={false}>All pages</Btn>
                    </div>
                    <div className="max-w-md">
                        <p className="mb-1.5 text-[0.75rem] font-semibold text-gold-400">Open any of the 54 country cockpits</p>
                        <CountryPicker countries={countries} label="Choose a country cockpit" />
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <Kpi dark l="Countries" v="54" s="covered by the catalogue" />
                        <Kpi dark l="Packs issued" v="8" s="Wave 0 · CPDS-1.2" />
                        <Kpi dark l="Languages" v="7" s="EN · Setswana · FR · PT · AR · SW · ZH" />
                        <Kpi dark l="Currencies" v="5" s="BWP · USD · ZAR · EUR · CNY" />
                    </div>
                </div>
                <div id="explore-africa" className="relative min-h-[420px] scroll-mt-24">
                    <HubAfricaMap countries={countries} fill={(iso3) => FILL[by[iso3]?.state ?? 'later']} tip={tip} href={(c) => `/aiim/country/${c.slug}`} highlight={['BWA']} label="Map of Africa; Botswana highlighted" />
                    <MapLegend dark items={[[FILL.live, 'Botswana — live'], [FILL.issued, 'Pack issued'], [FILL.wave1, 'Wave 1 proposed'], [FILL.later, 'Later waves']]} />
                </div>
            </section>

            <Section title="Rollout to 54 countries" sub="From BW_Rollout and I2_Country_Activation. Botswana is live in this prototype; other issued packs open as their cockpits are built.">
                <Grid cols={4}>
                    {rollout.map((r) => (
                        <Panel key={String(r.Wave)}>
                            <Eyebrow className="text-ink-500"><Rich t={r.Wave} /></Eyebrow>
                            <p className="my-2 text-[0.95rem] text-ink-900">{r.Countries}</p>
                            <p className="text-[0.8rem] text-ink-500">{r.Note}</p>
                        </Panel>
                    ))}
                </Grid>
            </Section>

            <Section title="Explore Africa by region" sub="Country count per AU region in the activation register.">
                <Grid cols={6}>
                    {regions.map((r) => <Kpi key={r.region} l={`${r.region} Africa`} v={r.n} s={`${r.names.join(', ')}…`} />)}
                    <Kpi l="Live cockpit" v="BW" s="Botswana · Southern" />
                </Grid>
            </Section>

            <Section title="Featured country insight" sub="Botswana BW-1.0 headline signals.">
                <Grid cols={3}>
                    <Link href={P.cockpit} className="flex min-w-0 flex-col gap-3 rounded-[12px] border border-parchment-400 bg-white p-5 hover:border-gold-500">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3"><BwFlag w={36} h={24} /><div><h3 className="text-[1.05rem] font-semibold text-ink-900">Botswana</h3><span className="text-[0.8rem] text-ink-500">Southern Africa · Gaborone · Pula (BWP)</span></div></div>
                            <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[0.7rem] font-bold text-gold-800">Live</span>
                        </div>
                        <p className="text-[0.88rem] text-ink-700">Small, diamond-dependent and well-rated economy rebounding on diamonds (+8.7 % y/y in Q2 2026) while non-mining GDP slips; opportunities in import replacement, copper and solar build-outs and citizen partnerships.</p>
                        <div className="mt-auto flex justify-between text-[0.8rem]"><span className="font-mono text-ink-600">{summary.templates ?? 321} templates · {summary.tierA || 86} Tier A</span><span className="font-semibold text-gold-700">Open cockpit →</span></div>
                    </Link>
                    <Panel>
                        <Eyebrow className="text-ink-500">High opportunity</Eyebrow>
                        <h3 className="mt-1 mb-3 text-[1.05rem] font-semibold text-ink-900">Top-30 diversified list</h3>
                        <HBars items={top30.map((r) => ({ n: r.name, v: r.score, c: r.color, href: P.opp(r.id) }))} max={12} />
                        <Btn href={P.leads} className="mt-3">See all 30</Btn>
                    </Panel>
                    <Panel>
                        <Eyebrow className="text-ink-500">Popular actions</Eyebrow>
                        <div className="mt-3 grid gap-2">
                            {actions.map((s) => (
                                <Link key={s.code} href={P.svc(s.code)} className="flex items-center gap-2 rounded-[8px] border border-parchment-400 px-3 py-2.5 text-[0.85rem] font-semibold text-ink-900 hover:border-gold-500">
                                    <ArrowRight className="size-3.5 text-gold-600" />{ACTIONS[s.code] ?? s.name}
                                    <span className="ml-auto font-mono text-[0.75rem] font-normal text-ink-500"><SvcPrice s={s} /></span>
                                </Link>
                            ))}
                        </div>
                    </Panel>
                </Grid>
            </Section>

            <Section title="How AIIM works">
                <Grid cols={4}>
                    {HOW.map(([I, t, p]) => <Panel key={t}><I className="size-6 text-gold-600" /><h3 className="mt-2 mb-1 font-semibold text-ink-900">{t}</h3><p className="text-[0.85rem] text-ink-500">{p}</p></Panel>)}
                </Grid>
            </Section>

            <CtaBand title="Need country-specific insights?" text="Speak to our specialists today, or commission a custom country intelligence request." />
        </Frame>
    );
}
