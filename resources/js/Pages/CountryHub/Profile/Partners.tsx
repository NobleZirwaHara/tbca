/* P14 Country Partner and Professional Boundary (prototype pages-profile.js #/c/{ISO}/partners). */
import { Card, Chip, Cols, DataTable, Note, STable, TagR, TagS, type Tone } from '@/Components/Industries/Kit';
import { CountryHead, CountryPage, NoPack, SprintShelf } from '@/Components/CountryHub/Layout';
import type { ProfileProps } from '@/Components/CountryHub/Profile';
import type { Row } from '@/types/countryHub';

interface Props extends ProfileProps { institutions: Row[] | null; permits: Row[] | null }

const ROUTES: [string, string, string, Tone][] = [
    ['Advisory Services (TBCA)', 'Business advisory, information and documentation support.', 'Permitted', 'ok'],
    ['Partner-Delivered Services', 'Provided by verified independent partners under mandate.', 'Route via Partner', 'info'],
    ['Reserved / Regulated Services', 'Legally reserved for licensed professionals.', 'Not Provided by TBCA', 'bad'],
    ['Referral / Introductions', 'Introductions only. No advice or execution by TBCA.', 'Permitted with Rules', 'warn'],
];

export default function Partners({ base, institutions, permits, shelf }: Props) {
    const { c } = base;
    const bw = c.isBW;
    const reserved = [
        ['Legal Services', 'Litigation, legal opinions, conveyancing', bw ? 'Law Society of Botswana ' : 'Legal Practice Council (LPC)', 'Route to Independent Attorney'],
        ['Audit & Assurance', 'Statutory audits, reviews', bw ? 'BICA / BAOA ' : 'IRBA', 'Route to Registered Auditor'],
        ['Tax Compliance (Practising)', 'Tax return submission, tax opinions', bw ? 'BURS ' : 'SARS / SAICA', 'Route to Tax Practitioner'],
        ['Financial Advisory (Regulated)', 'Investment advice, underwriting', bw ? 'NBFIRA / Bank of Botswana ' : 'FSCA', 'Route to Licensed Provider'],
        ['Company Secretarial (Statutory)', 'Company secretarial officer services', bw ? 'CIPA ' : 'CIPC', 'Route to Accredited Provider'],
    ];
    return (
        <CountryPage base={base} pageKey="partners">
            <CountryHead base={base} pageKey="partners" title="Country Partner and Professional Boundary" desc={`Confirm partner ecosystem, professional boundaries and regulated service routing for ${c.name}.`} />
            <Cols n={4}>
                {ROUTES.map(([t, s, st, tone]) => (
                    <Card key={t} title={t}><p className="mb-2 text-[0.82rem]">{s}</p><Chip t={st} tone={tone} /></Card>
                ))}
            </Cols>
            <Card title="Reserved / Regulated Services — TBCA Does Not Provide" icon="shield">
                <STable head={['Service category', 'Examples', 'Regulatory authority', 'Routing requirement', 'Status']} rows={reserved.map((r) => [
                    <b key="c">{r[0]}</b>, r[1], <span key="a">{r[2]}{bw && <TagR />}</span>, r[3], <Chip key="s" t="Not Provided" tone="bad" />,
                ])} />
            </Card>
            {institutions && permits ? (
                <>
                    <Card title="Institution directory — who to call (50 roles)" icon="users" sub={<TagS s="BW_Institutions" />}>
                        <DataTable<Row> name="BW_Institutions" rows={institutions} size={10} cols={[{ k: 'Role', l: 'Role' }, { k: 'Botswana institution', l: 'Botswana institution' }]} />
                    </Card>
                    <Card title="Permit issuers by sector" icon="file">
                        <DataTable<Row> name="BW_Permits" rows={permits} size={6} cols={[
                            { k: 'Sector', l: 'Sector', v: (x) => String(x.SectorName ?? x.Sector) }, { k: 'Permits', l: 'Permits' }, { k: 'Issuer', l: 'Issuer' }, { k: 'Typical time', l: 'Typical time' },
                        ]} />
                    </Card>
                </>
            ) : !c.isZA ? <NoPack c={c} what="Partner directory" pageKey="partners" /> : null}
            <Note><b>Important.</b> Using a non-compliant route for regulated services may create legal or professional consequences. Obtain independent legal or regulatory advice where required.</Note>
            {shelf && <SprintShelf shelf={shelf} c={c} />}
        </CountryPage>
    );
}
