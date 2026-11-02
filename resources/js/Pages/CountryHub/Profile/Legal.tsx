/* P15 Country Legal and Regulatory Boundary (prototype pages-profile.js #/c/{ISO}/legal). */
import { Card, DataTable, Kpi, Kpis, N, Note, STable, StatusChip } from '@/Components/Industries/Kit';
import { CountryHead, CountryPage, NoPack, SprintShelf } from '@/Components/CountryHub/Layout';
import { FactCite, type ProfileProps } from '@/Components/CountryHub/Profile';
import type { Row } from '@/types/countryHub';

interface Props extends ProfileProps { bw: { rules: Row[]; changes: Row[]; policy: Row[]; permits: Row[] } | null }

const ZA_AUTH = [['CIPC', 'Company registration, IP, business records', 'www.cipc.co.za'], ['FSCA', 'Financial services regulation', 'www.fsca.co.za'], ['SARS', 'Tax administration and customs', 'www.sars.gov.za'], ['Information Regulator', 'POPIA enforcement and data protection', 'inforegulator.org.za'], ['Competition Commission', 'Competition regulation and mergers', 'www.compcom.co.za']];

function BwLegal({ bw }: { bw: NonNullable<Props['bw']> }) {
    return (
        <>
            <Kpis>
                <Kpi l="Citizen-empowerment law" v="Economic Inclusion Act 26 of 2021" s="In force 20 Apr 2022" icon="shield" />
                <Kpi l="Reserved service sectors" v="35" s="Citizen-owned only (BW-MAC-F23)" icon="lock" />
                <Kpi l="Regulatory changes tracked" v={N(bw.changes.length)} s="With templates affected" icon="bell" />
                <Kpi l="Policy instruments" v={N(bw.policy.length)} s="Linked to templates" icon="book" />
            </Kpis>
            <Card title="Citizen-empowerment rules (sourced)" icon="users" sub="K-3 Citizen rules · 11 sweep templates are citizen-reserved">
                <STable head={['Rule', 'Detail', 'Evidence']} rows={bw.rules.map((r) => [<b key="i">{String(r.Item ?? '')}</b>, <span key="v" className="text-[0.82rem]">{String(r.Value ?? '')}</span>, <FactCite key="c" r={r} />])} />
            </Card>
            <Card title="Regulatory-change register with impact" icon="bell">
                <DataTable<Row> name="BW_RegChange" rows={bw.changes} size={8} filters={['Sector']} cols={[
                    { k: 'ID', l: 'ID' }, { k: 'Change', l: 'Change' }, { k: 'Instrument', l: 'Instrument' }, { k: 'Evidence', l: 'Evidence' }, { k: 'Status', l: 'Status', r: (x) => <StatusChip s={x.Status} /> },
                    { k: 'Sector', l: 'Sector' }, { k: 'Impact', l: 'Impact' }, { k: 'Templates affected', l: 'Templates', num: true }, { k: 'Tier A affected', l: 'Tier A', num: true },
                ]} />
            </Card>
            <Card title="Policy instruments (P can only exceed 1 when one of these is linked)" icon="book">
                <DataTable<Row> name="BW_Policy" rows={bw.policy} size={8} cols={[{ k: 'Code', l: 'Code' }, { k: 'Instrument', l: 'Instrument', clip: true }, { k: 'Templates', l: 'Templates', num: true }]} />
            </Card>
            <Card title="Permit pathway (18 sectors)" icon="file">
                <DataTable<Row> name="BW_Permits" rows={bw.permits} size={6} cols={[
                    { k: 'Sector', l: 'Sector', v: (x) => String(x.SectorName ?? x.Sector) }, { k: 'Permits', l: 'Permits' }, { k: 'Issuer', l: 'Issuer' }, { k: 'Typical time', l: 'Typical time' },
                ]} />
            </Card>
        </>
    );
}

export default function Legal({ base, bw, shelf }: Props) {
    const { c } = base;
    return (
        <CountryPage base={base} pageKey="legal">
            <CountryHead base={base} pageKey="legal" title="Country Legal and Regulatory Boundary" desc={`Understand jurisdictional limits, licensing requirements, regulatory scope and legal boundaries for commercial engagement in ${c.name}.`} />
            {bw ? <BwLegal bw={bw} /> : c.isZA ? (
                <>
                    <Kpis>
                        <Kpi l="Regulatory Environment" v="Developed" s="Predictable & well established" icon="shield" />
                        <Kpi l="Licensing Requirements" v="Medium" s="Sector specific" icon="file" />
                        <Kpi l="Legal System" v="Common Law" s="Roman-Dutch foundation" icon="book" />
                        <Kpi l="Last Reviewed" v="15 Aug 2026" icon="clock" />
                    </Kpis>
                    <Card title="Key Regulatory Authorities" icon="shield" sub="Mock-up P15 content">
                        <STable head={['Authority', 'Mandate', 'Website']} rows={ZA_AUTH} />
                    </Card>
                </>
            ) : <NoPack c={c} what="Legal & regulatory boundary" pageKey="legal" />}
            <Note><b>Regulatory Boundary Principles.</b> TBCA does not provide reserved legal or regulated professional services. All regulated services are delivered by licensed, independent partners. This information is general in nature and does not constitute legal advice.</Note>
            {shelf && <SprintShelf shelf={shelf} c={c} />}
        </CountryPage>
    );
}
