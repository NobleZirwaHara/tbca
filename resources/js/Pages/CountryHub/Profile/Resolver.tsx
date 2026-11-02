/* P08 Country Context Resolver (prototype pages-profile.js #/c/{ISO}/resolver). */
import { Card, DataTable, Kpi, Kpis, Meter, Note, pct, STable, StatusChip, TagS } from '@/Components/Industries/Kit';
import { CountryHead, CountryPage, SprintShelf } from '@/Components/CountryHub/Layout';
import type { ProfileProps } from '@/Components/CountryHub/Profile';
import type { Row } from '@/types/countryHub';

interface Props extends ProfileProps { validator: Row[] | null; cpds: Row[] | null }

const DOMS: [string, string, number][] = [
    ['Legal & Regulatory', 'Company, commercial, contract and regulatory framework', 22], ['Tax & Statutory', 'Corporate tax, VAT, PAYE, duties, levies and incentives', 18],
    ['Payments & FX', 'Payment rails, methods, liquidity, FX and gateways', 16], ['Identity & KYC', 'Identification, verification, AML and onboarding rules', 14],
    ['Data & Licences', 'Data residency, licences, IP, usage and publication', 12], ['Partner & Professional Boundary', 'Partner routing, professional boundaries, reviews', 14],
    ['Sanctions & Prohibitions', 'Sanctions, export controls, prohibitions and watchlists', 10], ['Corridor & Trade', 'Borders, transit, trade rules and corridor dependencies', 14],
    ['Languages & Localisation', 'Official languages, localisation and content rules', 10],
];

export default function Resolver({ base, validator, cpds, shelf }: Props) {
    const { c } = base;
    const version = `${c.iso2 || ''}-CTX-${c.isBW ? '2026-10-09.v1' : c.isZA ? '2026-08-15.v4' : 'draft'}`;
    return (
        <CountryPage base={base} pageKey="resolver">
            <CountryHead base={base} pageKey="resolver" title="Country Context Resolver" desc="Resolve, verify and store all country-dependent context required for commercial decisions." />
            <Kpis>
                <Kpi l="Resolver Completeness" v={`${c.rcs}%`} s="All required fields complete" icon="check" />
                <Kpi l="Resolver Domains" v="9" s="Each must be 100 %" icon="layers" />
                <Kpi l="Resolver Version" v={version} s="Current active version" icon="file" />
                <Kpi l="Profile Valid To" v={c.isBW ? '09 Jan 2027' : '15 Nov 2026'} icon="clock" />
                <Kpi l="Hard Blocks" v="0" s="No blocking issues" icon="alert" />
            </Kpis>
            <Card title="Resolver Domains & Required Context" icon="shield" sub="RCS = completed required fields ÷ total required fields">
                <STable head={['Domain', 'RCS', 'Required', 'Completed', 'Evidence Status', 'Last Verified']} rows={DOMS.map(([d, s, n]) => {
                    const k = n;
                    return [
                        <div key="d"><b>{d}</b><div className="text-[0.72rem] text-ink-400">{s}</div></div>,
                        <div key="r" className="min-w-[90px]">{pct(k, n)} %<Meter p={pct(k, n)} tone={k === n ? 'ok' : 'warn'} /></div>,
                        n, k, <StatusChip key="e" s={k === n ? 'Current' : 'Missing fields'} />, c.isBW ? '09 Oct 2026' : '15 Aug 2026',
                    ];
                })} />
            </Card>
            {validator && cpds && (
                <>
                    <Card title="CPDS-1.2 Validator — run on BW-1.0 (30/30 pass)" icon="check" sub={<TagS s="BW_Validator" />}>
                        <DataTable<Row> name="BW_Validator" rows={validator} size={10} filters={['Kind']} cols={[
                            { k: 'Kind', l: 'Kind' }, { k: 'Check', l: 'Check' }, { k: 'Result', l: 'Result', r: (x) => <StatusChip s={x.Result} /> }, { k: 'Detail', l: 'Detail' },
                        ]} />
                    </Card>
                    <Card title="Country-Pack Data Standard (CPDS-1.2)" icon="book">
                        <STable compact head={['Table', 'Required fields', 'Rule / QA gate']} rows={cpds.map((r) => [<b key="t">{String(r.Table ?? '')}</b>, String(r['Required fields'] ?? ''), String(r['Rule / QA gate'] ?? '')])} />
                    </Card>
                </>
            )}
            <Note className="border-risk-500 bg-risk-50"><b>No resolution, no price.</b> All required fields must be 100 % complete. Hard blocks 0 for price resolution. Country Resolver governs all commercial actions. No overrides. No manual completion.</Note>
            {shelf && <SprintShelf shelf={shelf} c={c} />}
        </CountryPage>
    );
}
