/* P05 Country Availability Detail (prototype pages-profile.js #/c/{ISO}/availability). */
import { Link } from '@inertiajs/react';
import { A, Card, Chip, Cols, DataTable, Kpi, Kpis, N, Note, STable, StatusChip, sum, TagM, TagS } from '@/Components/Industries/Kit';
import { BW, cHref, CountryHead, CountryPage, SprintShelf } from '@/Components/CountryHub/Layout';
import { VerifyText, type ProfileProps } from '@/Components/CountryHub/Profile';
import type { Row } from '@/types/countryHub';

export interface TopicCount { k: string; l: string; a: number; r: number; u: number; min: number | null }
interface Props extends ProfileProps { cats: TopicCount[]; permits: Row[] | null }

const PRINCIPLES = ['Resolver-First, Fail-Closed', 'No Resolution, No Price', 'Service-by-Service Permission', 'Evidence-Backed Access', 'Six-Ledger Fee Separation', 'No Override of Sanctions'];

export default function Availability({ base, cats, permits, shelf }: Props) {
    const { c, actDate } = base;
    const A_ = sum(cats.map((x) => x.a)), R_ = sum(cats.map((x) => x.r)), U = sum(cats.map((x) => x.u)), T = A_ + R_ + U;
    return (
        <CountryPage base={base} pageKey="availability">
            <CountryHead base={base} pageKey="availability" title="Country Availability Detail"
                desc="Detailed view of commercial availability across services and capabilities. Service access depends on resolver state and service-by-service Country Resolver permission." />
            <Kpis>
                <Kpi l="Resolver Completeness" v={`${c.rcs}%`} s="All critical fields complete" icon="check" />
                <Kpi l="Country State" v={c.state} icon="shield" />
                <Kpi l="Services Available" v={N(A_)} s={`of ${N(T)} country Sprints`} icon="tag" />
                <Kpi l="Services Restricted" v={N(R_)} s="Embedded / service-by-service" icon="lock" />
                <Kpi l="Services Unavailable" v={N(U)} s="Not viable standalone (reclassify)" icon="alert" />
                <Kpi l="Last Reviewed" v={c.isBW ? '09 Oct 2026' : actDate} s="Next review: monthly" icon="clock" />
            </Kpis>
            <Card title="Service Availability by Category" icon="layers" sub={<>Counts are the catalogue Sprints mapped to this country tab (ECON-R0C) <TagM /></>}>
                <STable head={['Category', 'Available', 'Restricted', 'Unavailable', 'Availability State', 'Resolver Dependency', '']} rows={cats.map((x) => [
                    <b key="l">{x.l}</b>, <b key="a" className="text-verified-700">{x.a}</b>, x.r, x.u,
                    <StatusChip key="s" s={x.k === 'trade' || x.k === 'investment' ? 'Quote-Only' : 'Active'} />, <Chip key="d" t="Complete" tone="ok" />,
                    <A key="v" sm href={cHref(c, 'catalogue', `?topic=${x.k}`)}>View Services</A>,
                ])} />
            </Card>
            <Cols n={2}>
                <Card title="Availability by Construction Principle" icon="shield">
                    <STable compact head={['Principle', 'State']} rows={PRINCIPLES.map((p) => [p, <StatusChip key="s" s="Compliant" />])} />
                    <Note className="mt-2.5"><b>Sovereign Independence.</b> All construction principles are in full compliance. No commercial override permitted.</Note>
                </Card>
                <Card title="Commercial Availability Rule" icon="lock">
                    <ul className="space-y-1.5 text-[0.85rem]">
                        {[
                            ['Service-by-Service Access', 'each service requires explicit permission. No implied or blanket access.'],
                            ['Price Suppression', 'all pricing suppressed until service permission and price resolution.'],
                            ['Tax & Statutory Treatment', 'shown only when resolver fields are resolved.'],
                            ['Payment Methods', 'available subject to liquidity, permission and licence.'],
                            ['Evidence Currentness', c.isBW ? 'current as of 09 Oct 2026.' : 'current as of 15 Aug 2026.'],
                        ].map(([b, t]) => <li key={b} className="flex gap-2"><span className="font-bold text-verified-700" aria-hidden="true">✓</span><span><b>{b}</b> — {t}</span></li>)}
                    </ul>
                </Card>
            </Cols>
            {permits && (
                <Card title="Sector permit pathways that gate availability (18 sectors)" icon="file" sub={<TagS s="BW_Permits" />}>
                    <DataTable<Row> name="BW_Permits" rows={permits} size={9} cols={[
                        { k: 'Sector', l: 'Sector', v: (x) => String(x.SectorName ?? x.Sector), r: (x) => <Link href={cHref(BW, `sector/${x.Sector}`)} className="text-controlled-700 hover:underline">{String(x.SectorName ?? x.Sector)}</Link> },
                        { k: 'Permits', l: 'Permits' }, { k: 'Issuer', l: 'Issuer' }, { k: 'Typical time', l: 'Typical time', r: (x) => <VerifyText t={x['Typical time']} /> },
                    ]} />
                </Card>
            )}
            {shelf && <SprintShelf shelf={shelf} c={c} />}
        </CountryPage>
    );
}
