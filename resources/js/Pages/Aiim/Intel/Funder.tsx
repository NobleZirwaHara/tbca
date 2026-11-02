import { Btn, CtaBand, Grid, Hero, Kpi, P, Section } from '@/Components/Aiim/ProtoExplore';
import { BareTable, BuyBtn, BwFrame, CTable, ObjActions, type Row, type SearchBase, type SvcP } from '@/Components/Aiim/ProtoSearch';

interface Props extends SearchBase {
    code: string;
    name: string;
    role: string;
    institutions: Row[];
    factRows: Row[];
    templates: Row[];
    instruments: Row[];
    engagement: SvcP | null;
}

/** P14 — Funder Preview (prototype #funder.{code}). */
export default function Funder({ code, name, role, institutions, factRows, templates, instruments, engagement, saved, facts }: Props) {
    return (
        <BwFrame title={`${name} · Funder Preview`} crumbs={[{ label: 'Funders', href: P.funders }, { label: name }]} facts={facts}>
            <Hero
                eyebrow={`Funder preview · ${code}`}
                title={name}
                lead={role}
                right={<>
                    <BuyBtn s={engagement} ctx={`${name} engagement`} tone="gold">Engagement support</BuyBtn>
                    <Btn href={P.advisor} tone="dark">Request introduction</Btn>
                    <ObjActions type="funder" itemKey={code} saved={saved} />
                </>}
            />
            <Grid cols={3} className="mt-4">
                <Kpi l="Facts citing" v={factRows.length} /><Kpi l="Templates routed here" v={templates.length} /><Kpi l="Policy instruments" v={instruments.length} />
            </Grid>
            {institutions.length > 0 && <Section title="Institution roles"><BareTable rows={institutions} keys={['Role', 'Botswana institution']} labels={{ 'Botswana institution': 'Institution' }} /></Section>}
            {factRows.length > 0 && <Section title="Facts"><BareTable rows={factRows} /></Section>}
            {templates.length > 0 && <Section title="Templates that name this funder"><CTable rows={templates} name={`funder-${code}`} size={10} /></Section>}
            {instruments.length > 0 && <Section title="Instruments"><BareTable rows={instruments} /></Section>}
            <CtaBand />
        </BwFrame>
    );
}
