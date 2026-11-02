import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { Btn, CtaBand, DataMeta, Grid, Hero, Kpi, P, SecIcon, Section, TierPill } from '@/Components/Aiim/ProtoExplore';
import { BwFrame, CountryBar, PTable, SvcRail, type PageT, type RailP, type Row, type SearchBase } from '@/Components/Aiim/ProtoSearch';
import { N } from '@/Components/Industries/Kit';

interface Props extends SearchBase {
    kpi: [string, number | string | null][];
    top30: Row[];
    priority: PageT;
    register: PageT;
    issue2: PageT;
    rail: RailP;
}

/** P7 — Opportunity Search, Botswana (prototype #opps). */
export default function Opportunities({ kpi, top30, priority, register, issue2, rail, facts, country, countries }: Props) {
    return (
        <BwFrame title="Opportunity Search" crumbs={[{ label: 'Botswana', href: P.cockpit }, { label: 'Opportunities' }]} facts={facts}>
            <CountryBar path="/aiim/opportunities" country={country} countries={countries} />
            <Hero
                eyebrow="Opportunity Search"
                title="321 freshness-gated templates, 72 anchors and 217 Issue 2.0 gap templates"
                lead="Score = E + D + P* + (4 − R). Tier A needs E = 3, a fact no older than 18 months and a risk-adjusted score of at least 10. Every template carries a citizen-reserved flag, an FX-earner flag, a persona and a time to revenue."
                right={<><Btn href={P.compare} tone="gold"><L.LayoutGrid className="size-3.5" /> Compare</Btn><Btn href={P.leads} tone="dark">Leads centre</Btn></>}
                meta={<DataMeta />}
            />
            <Grid cols={6} className="mt-4">{kpi.map(([l, v]) => <Kpi key={l} l={l} v={N(v)} />)}</Grid>

            <Section title="Top 30, diversified (G-2)" sub="At most three per sector; eleven sectors represented.">
                <Grid cols={3}>
                    {top30.map((r) => (
                        <Link key={String(r['Opp ID'])} href={P.opp(String(r['Opp ID']))} className="grid content-between gap-3 rounded-[12px] border border-parchment-400 bg-white p-4 transition-colors hover:border-gold-500">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <SecIcon code={String(r.Sector)} size={30} />
                                    <div className="min-w-0">
                                        <div className="font-mono text-[0.7rem] text-ink-500">#{r.Rank} · {r['Opp ID']}</div>
                                        <h4 className="leading-snug font-semibold text-ink-900">{r.Opportunity}</h4>
                                    </div>
                                </div>
                                <TierPill t={r.Tier} />
                            </div>
                            <div className="flex flex-wrap gap-1.5 text-[0.75rem]">
                                <span className="rounded-full border border-parchment-500 px-2 py-0.5">{r.Band}</span>
                                <span className="rounded-full border border-parchment-500 px-2 py-0.5">{r.Persona}</span>
                                <span className="inline-flex items-center gap-1 rounded-full border border-parchment-500 px-2 py-0.5"><L.Clock className="size-3" /> {r['Time to revenue']}</span>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-parchment-300 pt-2.5">
                                <span className="text-[0.75rem] text-ink-500">Best place: <b className="text-ink-800">{r['Best place']}</b></span>
                                <span className="font-mono text-[0.82rem] text-ink-800">Score {r.Score} · RA {r.RA}</span>
                            </div>
                        </Link>
                    ))}
                </Grid>
            </Section>

            <Section title="Priority list — all 321 templates" sub="BW_Priority with every scoring column. Click an Opp ID for the opportunity record.">
                <PTable t={priority} prop="priority" name="BW_Priority" />
            </Section>
            <Section title="Opportunity register — 610 rows" sub="Sweep, anchors and Issue 2.0 gap templates (BW_Opportunities).">
                <PTable t={register} prop="register" name="BW_Opportunities" />
            </Section>
            <Section title="Issue 2.0 continental opportunity register — 744 rows" sub="Carried over in full (I2_Opportunity_Register).">
                <PTable t={issue2} prop="issue2" name="I2_Opportunity_Register" />
            </Section>
            <div className="mt-8"><SvcRail rail={rail} ctx="Opportunity Search — Botswana" /></div>
            <CtaBand />
        </BwFrame>
    );
}
