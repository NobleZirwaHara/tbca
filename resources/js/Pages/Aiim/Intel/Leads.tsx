import { Btn, CtaBand, DataMeta, DocTable, Hero, P, PackLoading, Rich, Section } from '@/Components/Aiim/ProtoExplore';
import { BwFrame, CTable, PTable, SvcRail, TabBox, cHref, type IntelBase, type PageT, type RailP, type Row } from '@/Components/Aiim/ProtoSearch';

interface Props extends IntelBase {
    partG?: string[][] | null;
    g1?: string[][] | null;
    g1text?: string[];
    g3?: { label: string; rows: string[][] }[];
    g4?: string[][] | null;
    hotLeads?: Row[];
    ranked?: PageT;
    coverage?: PageT;
    rail?: RailP;
}

/** Leads Centre (prototype #leads): hotspot leads, ranked leads and coverage. */
export default function Leads(p: Props) {
    const { c } = p;
    const crumbs = [{ label: c.name, href: `/aiim/country/${c.slug}` }, { label: 'Leads' }];
    if (!p.bw) {
        return (
            <BwFrame title={`Leads Centre · ${c.name}`} crumbs={crumbs}>
                <Hero eyebrow="Leads Centre" title="Hotspot leads, demand-weighted ranked leads and coverage" lead={`Leads are built from a country pack: evidence hotspots, ranked places and coverage rows. ${c.name} has no pack loaded yet.`} />
                <div className="mt-6">
                    <PackLoading country={c.name} what="Hotspot leads, ranked leads and coverage rows">
                        <Btn href={`/aiim/opportunities?country=${c.slug}`} tone="gold">Opportunities in {c.name}</Btn>
                        <Btn href={cHref('botswana', 'leads')}>See the Botswana leads centre</Btn>
                    </PackLoading>
                </div>
                <CtaBand />
            </BwFrame>
        );
    }
    return (
        <BwFrame title="Leads Centre" crumbs={crumbs} facts={p.facts}>
            <Hero
                eyebrow="Leads Centre"
                title="Hotspot leads, demand-weighted ranked leads and coverage"
                lead="Hotspot leads are signal. Ranked leads are signal-lite. Coverage rows are volume. A listing requires scout confirmation, a P1 point, land-tenure and citizen-rule checks, and a Verified badge."
                right={<Btn href={P.map} tone="gold">See on map</Btn>}
                meta={<DataMeta />}
            />
            <Section title="PART G — counts"><DocTable rows={p.partG} /></Section>
            <Section title="G-1 Concentration test, reported both ways">
                <DocTable rows={p.g1} />
                <div className="mt-3 rounded-[12px] border border-parchment-400 bg-white p-4 text-[0.9rem] leading-relaxed">
                    {(p.g1text ?? []).map((t, i) => <p key={i} className="my-1.5"><Rich t={t} /></p>)}
                </div>
            </Section>
            <Section title="G-3 Top opportunities by persona" sub="Best five for each of six personas.">
                <TabBox tabs={(p.g3 ?? []).map((g) => g.label)}>{(p.g3 ?? []).map((g) => <DocTable key={g.label} rows={g.rows} />)}</TabBox>
            </Section>
            <Section title="G-4 Ranked place leads — top-10 templates"><DocTable rows={p.g4} /></Section>
            <Section title="Hotspot leads — all 126" sub="Next action, institution to call, owner and due date.">
                <CTable rows={p.hotLeads ?? []} name="BW_Hotspot_Leads" filters={['Unit', 'Tier', 'Persona']} size={15} />
            </Section>
            {p.ranked && <Section title="Ranked leads — all 2,137"><PTable t={p.ranked} prop="ranked" name="BW_Ranked_Leads" /></Section>}
            {p.coverage && <Section title="Coverage — all 10,346 rows" sub="Every eligible template × place pair."><PTable t={p.coverage} prop="coverage" name="BW_Coverage" /></Section>}
            <div className="mt-8"><SvcRail rail={p.rail} ctx="Leads centre — Botswana" /></div>
            <CtaBand />
        </BwFrame>
    );
}
