import { CtaBand, Grid, HBars, Hero, Kpi, P, Panel, Section } from '@/Components/Aiim/ProtoExplore';
import { BuyBtn, BwFrame, CTable, ObjActions, type Row, type SearchBase, type SvcP } from '@/Components/Aiim/ProtoSearch';

interface Props extends SearchBase {
    code: string;
    name: string;
    kpi: { templates: number; tierA: number; ranked: number; citizen: number };
    units: { n: string; v: number }[];
    sectors: { code: string; name: string; color: string; v: number }[];
    templates: Row[];
    matching: SvcP | null;
}

/** P12 — Investor Preview: one investor persona (prototype #investor.{code}). */
export default function Investor({ code, name, kpi, units, sectors, templates, matching, saved, facts }: Props) {
    return (
        <BwFrame title={`${name} · Investor Preview`} crumbs={[{ label: 'Investors', href: P.investors }, { label: name }]} facts={facts}>
            <Hero
                eyebrow={`Investor preview · persona ${code}`}
                title={name}
                lead={`${kpi.templates} templates and ${kpi.ranked} ranked leads match this persona.`}
                right={<><BuyBtn s={matching} ctx={`Investor matching — ${name}`} tone="gold">Match me</BuyBtn><ObjActions type="investor" itemKey={code} saved={saved} /></>}
            />
            <Grid cols={4} className="mt-4">
                <Kpi l="Templates" v={kpi.templates} /><Kpi l="Tier A" v={kpi.tierA} /><Kpi l="Ranked leads" v={kpi.ranked} /><Kpi l="Citizen-reserved" v={kpi.citizen} />
            </Grid>
            <Grid cols={2} className="mt-4">
                <Panel title="Where the leads are"><HBars items={units} /></Panel>
                <Panel title="Sector mix"><HBars items={sectors.map((s) => ({ n: s.name, v: s.v, c: s.color, href: P.sector(s.code) }))} cols="grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto]" /></Panel>
            </Grid>
            <Section title="Templates for this persona"><CTable rows={templates} name={`persona-${code}`} filters={['Tier']} size={15} /></Section>
            <CtaBand />
        </BwFrame>
    );
}
