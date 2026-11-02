/* P11 Country Tax and Statutory Disclosure (prototype pages-profile.js #/c/{ISO}/tax). */
import { Link } from '@inertiajs/react';
import { Card, Kpi, Kpis, Note, STable, StatusChip, TagR, TagS } from '@/Components/Industries/Kit';
import { BW, cHref, CountryHead, CountryPage, NoPack, SprintShelf } from '@/Components/CountryHub/Layout';
import { FactCite, type ProfileProps } from '@/Components/CountryHub/Profile';
import type { Row } from '@/types/countryHub';

interface Props extends ProfileProps { bw: { f18: Row; fiscal: Row[] } | null }

const BW_TYPES = [['Value Added Tax (VAT)', 'Yes', '14 %; narrower zero-rating', 'BW-MAC-F18'], ['Corporate Income Tax (CIT)', 'Yes', '22 % standard; increase proposed', 'BW-MAC-F18 · DG-01'], ['Manufacturing (approved)', 'Yes', '15 %', 'BW-MAC-F18'], ['IFSC approved services', 'Yes', '15 %', 'BW-MAC-F18'], ['Dividend withholding tax', 'Yes', '10 %', 'BW-MAC-F18'], ['Personal income tax surcharge', 'Yes', '+2.5 % above P400,000', 'BW-MAC-F18'], ['Customs (SACU CET)', 'Yes', 'Common external tariff; BURS administers', 'BW_Trader_Chain TQ01'], ['Exchange controls', 'No', 'Abolished February 1999', 'BW-MAC-F19']];
const ZA_TYPES = [['Value Added Tax (VAT)', 'Yes'], ['Corporate Income Tax (CIT)', 'Yes'], ['Pay-As-You-Earn (PAYE)', 'Yes'], ['Skills Development Levy (SDL)', 'Yes'], ['Unemployment Insurance Fund (UIF)', 'Yes'], ['Capital Gains Tax (CGT)', 'Yes'], ['Dividends Tax', 'Yes'], ['Withholding Taxes', 'Yes'], ['Excise Duties', 'Yes'], ['Transfer Duties', 'Yes'], ['Local Taxes', 'Varies by municipality']];

function BwTax({ f18, fiscal }: { f18: Row; fiscal: Row[] }) {
    return (
        <>
            <Kpis>
                <Kpi l="VAT (standard)" v="14 %" s="Narrower zero-rating proposed" icon="tag" />
                <Kpi l="Corporate income tax" v="22 %" s="Increase proposed (23.5 % / 25 %) — DG-01" icon="cash" />
                <Kpi l="Approved manufacturing / IFSC" v="15 %" s="Concessionary rates" icon="spark" />
                <Kpi l="Dividend WHT" v="10 %" icon="file" />
                <Kpi l="SACU receipts 2026/27" v="P26.79 bn" s="Largest single revenue line" icon="db" />
            </Kpis>
            <Card title="Tax Treatment Summary" icon="cash" sub={<TagS s="BW-MAC-F18" />}>
                <p className="text-[0.88rem]">{String(f18.Value ?? '')}</p>
                <p className="mt-1.5 text-[0.82rem]"><FactCite r={f18} /></p>
                <Note className="mt-2.5">The enacted 2026/27 corporate rate is an <b>open data gap (DG-01, High)</b>: unit-economics after-tax returns use 22 % until the Finance Act is read. <Link className="text-controlled-700 hover:underline" href={cHref(BW, 'limitations')}>See absence register →</Link></Note>
            </Card>
            <Card title="Tax Types" icon="file">
                <STable head={['Tax type', 'Applies', 'Rate / note', 'Evidence']} rows={BW_TYPES.map((r) => [<b key="t">{r[0]}</b>, <StatusChip key="a" s={r[1]} />, r[2], <TagS key="e" s={r[3]} />])} />
            </Card>
            <Card title="Fiscal context" icon="chart">
                <STable head={['Item', 'Value', 'Evidence']} rows={fiscal.map((r) => [String(r.Item ?? ''), String(r.Value ?? ''), <FactCite key="c" r={r} />])} />
            </Card>
            <Card title="Source & Authority" icon="shield">
                <ul className="space-y-1 text-[0.85rem]">
                    {[<>Botswana Unified Revenue Service (BURS) <TagR /></>, <>Ministry of Finance — Budget 2026/27 (PwC summary) <TagS s="BW-MAC-F13" /></>, <>Bank of Botswana — monetary &amp; FX statements <TagS s="BW-MAC-F8" /></>, <>IMF PIN 99/105 — exchange controls <TagS s="BW-MAC-F19" /></>].map((x, i) => (
                        <li key={i} className="flex gap-2"><span className="font-bold text-verified-700" aria-hidden="true">✓</span><span>{x}</span></li>
                    ))}
                </ul>
            </Card>
        </>
    );
}

function ZaTax() {
    return (
        <>
            <Kpis>
                <Kpi l="VAT Rate (Standard)" v="15 %" s="Effective 1 Apr 2018" icon="tag" />
                <Kpi l="Corporate Income Tax" v="27 %" s="Standard rate" icon="cash" />
                <Kpi l="Disclosure Status" v="Current" s="All critical items current" icon="check" />
                <Kpi l="Last Reviewed" v="15 Aug 2026" s="Next review: 12 Sep 2026" icon="clock" />
            </Kpis>
            <Card title="Tax Overview" icon="file" sub="Mock-up P11 content">
                <p className="mb-2.5 text-[0.88rem]">South Africa applies a residence-based tax system with a self-assessment basis. Taxes are administered by the South African Revenue Service (SARS).</p>
                <STable compact head={['Tax Type', 'Applies']} rows={ZA_TYPES.map((r) => [r[0], <StatusChip key="a" s={r[1]} />])} />
            </Card>
        </>
    );
}

export default function Tax({ base, bw, shelf }: Props) {
    const { c } = base;
    return (
        <CountryPage base={base} pageKey="tax">
            <CountryHead base={base} pageKey="tax" title="Country Tax and Statutory Disclosure" desc="Understand the applicable tax framework, statutory obligations and compliance considerations for commercial engagement." />
            {bw ? <BwTax f18={bw.f18} fiscal={bw.fiscal} /> : c.isZA ? <ZaTax /> : <NoPack c={c} what="Tax & statutory disclosure" pageKey="tax" />}
            <Note><b>Important Disclaimer.</b> This information is provided for general guidance only and does not constitute tax advice. Consult a qualified tax professional for tailored advice.</Note>
            {shelf && <SprintShelf shelf={shelf} c={c} />}
        </CountryPage>
    );
}
