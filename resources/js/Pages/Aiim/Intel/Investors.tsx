import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { CtaBand, DataMeta, Grid, HBars, Hero, P, SecIcon, Section } from '@/Components/Aiim/ProtoExplore';
import { BareTable, BuyBtn, BwFrame, CountryBar, SvcRail, type RailP, type Row, type SearchBase, type SvcP } from '@/Components/Aiim/ProtoSearch';

interface Persona { code: string; name: string; templates: number; tierA: number; bars: { code: string; name: string; color: string; v: number }[] }
interface Props extends SearchBase {
    personas: Persona[];
    strategic: { name: string; note: string; precedent: string; sector: string; sectorName: string }[];
    finFacts: Row[];
    matching: SvcP | null;
    rail: RailP;
}

/** P11 — Investor Search, Botswana: six personas, strategic investors and capital pools (prototype #investors). */
export default function Investors({ personas, strategic, finFacts, matching, rail, facts, country, countries }: Props) {
    return (
        <BwFrame title="Investor Search" crumbs={[{ label: 'Botswana', href: P.cockpit }, { label: 'Investors' }]} facts={facts}>
            <CountryBar path="/aiim/investors" country={country} countries={countries} />
            <Hero
                eyebrow="Investor Search"
                title="Six investor personas, strategic investors and domestic capital pools"
                lead="Every one of the 321 templates is tagged to the persona most likely to invest. Strategic investors and capital pools come from the precedent register, the institutions list and the finance facts."
                right={<BuyBtn s={matching} ctx="Investor matching — Botswana" tone="gold"><L.Users className="size-3.5" /> Run investor matching</BuyBtn>}
                meta={<DataMeta />}
            />
            <Grid cols={3} className="mt-4">
                {personas.map((p) => (
                    <Link key={p.code} href={`/aiim/investors/${p.code}`} className="grid content-between gap-3 rounded-[12px] border border-parchment-400 bg-white p-4 transition-colors hover:border-gold-500">
                        <div className="flex items-start justify-between gap-2">
                            <div><div className="font-mono text-[0.72rem] text-ink-500">{p.code}</div><h3 className="text-[1.02rem] font-semibold text-ink-900">{p.name}</h3></div>
                            <span className="rounded-full bg-verified-700 px-2 py-0.5 text-[0.7rem] font-bold whitespace-nowrap text-white">{p.tierA} Tier A</span>
                        </div>
                        <HBars items={p.bars.map((b) => ({ n: b.code, v: b.v, c: b.color }))} cols="grid-cols-[3rem_minmax(0,1fr)_auto]" />
                        <div className="flex items-center justify-between border-t border-parchment-300 pt-2 text-[0.8rem]"><span className="font-mono">{p.templates} templates</span><span className="font-semibold text-gold-700">Investor preview →</span></div>
                    </Link>
                ))}
            </Grid>
            <Section title="Strategic investors named in the evidence">
                <Grid cols={3}>
                    {strategic.map((s) => (
                        <div key={s.name} className="grid content-between gap-2.5 rounded-[12px] border border-parchment-400 bg-white p-4">
                            <div className="flex items-start justify-between gap-2"><h3 className="text-[1.02rem] font-semibold text-ink-900">{s.name}</h3><SecIcon code={s.sector} size={28} /></div>
                            <p className="text-[0.86rem] text-ink-700">{s.note}</p>
                            <div className="flex items-center justify-between border-t border-parchment-300 pt-2 text-[0.8rem]">
                                {s.precedent ? <Link href={P.project(s.precedent)} className="underline decoration-dotted">{s.precedent}</Link> : <span className="text-ink-400">BW_Institutions</span>}
                                <Link href={P.sector(s.sector)} className="font-semibold text-gold-700">{s.sectorName} →</Link>
                            </div>
                        </div>
                    ))}
                </Grid>
            </Section>
            <Section title="Capital pools and investor facts" sub="Finance sector facts (BW-FIN)."><BareTable rows={finFacts} /></Section>
            <div className="mt-8"><SvcRail rail={rail} ctx="Investor Search — Botswana" /></div>
            <CtaBand />
        </BwFrame>
    );
}
