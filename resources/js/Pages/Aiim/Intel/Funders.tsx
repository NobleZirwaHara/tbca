import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { CtaBand, DataMeta, Grid, Hero, P, Section, VBars } from '@/Components/Aiim/ProtoExplore';
import { BareTable, BuyBtn, BwFrame, CountryBar, CTable, SvcRail, type RailP, type Row, type SearchBase, type SvcP } from '@/Components/Aiim/ProtoSearch';
import { N } from '@/Components/Industries/Kit';

interface Props extends SearchBase {
    funders: { code: string; name: string; role: string; facts: number; templates: number; instruments: number }[];
    envelopes: { n: string; v: number }[];
    policy: Row[];
    gaps: Row[];
    raising: SvcP | null;
    rail: RailP;
}

/** P13 — Funder Search, Botswana (prototype #funders). */
export default function Funders({ funders, envelopes, policy, gaps, raising, rail, facts, country, countries }: Props) {
    const chip = 'rounded-full border border-parchment-500 px-2 py-0.5 text-[0.75rem]';
    return (
        <BwFrame title="Funder Search" crumbs={[{ label: 'Botswana', href: P.cockpit }, { label: 'Funders' }]} facts={facts}>
            <CountryBar path="/aiim/funders" country={country} countries={countries} />
            <Hero
                eyebrow="Funder Search"
                title="Development finance, pensions, capital markets, export credit and climate funds"
                lead="Funders are drawn from the institutions register and linked to the facts, templates and policy instruments that cite them."
                right={<BuyBtn s={raising} ctx="Capital raising — Botswana" tone="gold"><L.Landmark className="size-3.5" /> Capital raising support</BuyBtn>}
                meta={<DataMeta />}
            />
            <Grid cols={3} className="mt-4">
                {funders.map((f) => (
                    <Link key={f.code} href={`/aiim/funders/${f.code}`} className="grid content-between gap-2.5 rounded-[12px] border border-parchment-400 bg-white p-4 transition-colors hover:border-gold-500">
                        <div className="flex items-start justify-between gap-2">
                            <div><div className="font-mono text-[0.72rem] text-ink-500">{f.code}</div><h3 className="text-[1.02rem] font-semibold text-ink-900">{f.name}</h3></div>
                            <L.Landmark className="size-5 shrink-0 text-gold-600" aria-hidden="true" />
                        </div>
                        <span className="text-[0.82rem] text-ink-500">{f.role}</span>
                        <div className="flex flex-wrap gap-1.5"><span className={chip}>{f.facts} facts</span><span className={chip}>{f.templates} templates</span><span className={chip}>{f.instruments} instruments</span></div>
                    </Link>
                ))}
            </Grid>
            <Section title="Unit investment envelopes" sub="Where Tier A money is expected to land (lead score × population, US$ m) [COMPUTED].">
                <div className="rounded-[12px] border border-parchment-400 bg-white p-4"><VBars items={envelopes} fmt={(v) => N(v, 1)} /></div>
            </Section>
            <Section title="Policy instruments (B3)" sub="P* can only exceed 1 when one of these is linked."><CTable rows={policy} name="BW_Policy" size={15} /></Section>
            <Section title="Funding gaps and data gaps"><BareTable rows={gaps} /></Section>
            <div className="mt-8"><SvcRail rail={rail} ctx="Funder Search — Botswana" /></div>
            <CtaBand />
        </BwFrame>
    );
}
