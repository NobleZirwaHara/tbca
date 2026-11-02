import { Link } from '@inertiajs/react';
import { Btn, CtaBand, DataMeta, DocTable, Grid, Hero, P, Rich, Section, StatusPill, TierPill } from '@/Components/Aiim/ProtoExplore';
import { BwFrame, CountryBar, SvcRail, type RailP, type Row, type SearchBase } from '@/Components/Aiim/ProtoSearch';

interface Hot { i: number; Hotspot: string; Place: string; 'Unit code': string; Status: string; leads: number; best: number; aplus: boolean; tierA: boolean }
interface Props extends SearchBase {
    precedents: Row[];
    hotspots: Hot[];
    d4: string[][] | null;
    rail: RailP;
}

const card = 'grid content-between gap-2.5 rounded-[12px] border border-parchment-400 bg-white p-4 transition-colors hover:border-gold-500';

/** P9 — Project Search, Botswana: precedent deals and evidence hotspots (prototype #projects). */
export default function Projects({ precedents, hotspots, d4, rail, facts, country, countries }: Props) {
    return (
        <BwFrame title="Project Search" crumbs={[{ label: 'Botswana', href: P.cockpit }, { label: 'Projects' }]} facts={facts}>
            <CountryBar path="/aiim/projects" country={country} countries={countries} />
            <Hero
                eyebrow="Project Search"
                title="42 named evidence hotspots and 18 precedent deals"
                lead="Hotspots are matched exactly to a pinned place (42/42) and carry status, evidence grade and the institution to call. Precedents show the deals that set the terms in each sector."
                right={<><Btn href={P.map} tone="gold">Hotspots on map</Btn><Btn href={P.custom} tone="dark">Submit a project</Btn></>}
                meta={<DataMeta />}
            />
            <Section title="Precedent deal register (H-3)">
                <Grid cols={3}>
                    {precedents.map((p) => (
                        <Link key={String(p.ID)} href={P.project(String(p.ID))} className={card}>
                            <div className="flex items-center justify-between gap-2"><span className="font-mono text-[0.72rem] text-ink-500">{p.ID} · {p.Date}</span><StatusPill s={p.Status} /></div>
                            <h3 className="text-[1.02rem] leading-snug font-semibold text-ink-900">{p.Deal}</h3>
                            <div className="flex flex-wrap gap-1.5 text-[0.75rem]"><span className="rounded-full border border-parchment-500 px-2 py-0.5">{p.Size}</span><span className="rounded-full border border-parchment-500 px-2 py-0.5">{p.Scope}</span></div>
                            <div className="flex items-center justify-between gap-2 border-t border-parchment-300 pt-2 text-[0.8rem]"><span><Rich t={p.Evidence} /></span><span className="font-semibold text-gold-700">Open →</span></div>
                        </Link>
                    ))}
                </Grid>
            </Section>
            <Section title="Evidence hotspots (D-4)">
                <Grid cols={3}>
                    {hotspots.map((h) => (
                        <Link key={h.i} href={P.project(`H${h.i}`)} className={card}>
                            <div className="flex items-center justify-between gap-2"><span className="font-mono text-[0.72rem] text-ink-500">{h.Place} · {h['Unit code']}</span><StatusPill s={h.Status} /></div>
                            <h4 className="leading-snug font-semibold text-ink-900">{h.Hotspot}</h4>
                            <div className="flex items-center justify-between gap-2 border-t border-parchment-300 pt-2">
                                <span className="font-mono text-[0.75rem] text-ink-600">{h.leads} leads · best {h.best}</span>
                                {h.aplus ? <TierPill t="A+" /> : h.tierA ? <TierPill t="A" /> : null}
                            </div>
                        </Link>
                    ))}
                </Grid>
            </Section>
            <Section title="Hotspots register (D-4, full)"><DocTable rows={d4} /></Section>
            <div className="mt-8"><SvcRail rail={rail} ctx="Project Search — Botswana" /></div>
            <CtaBand />
        </BwFrame>
    );
}
