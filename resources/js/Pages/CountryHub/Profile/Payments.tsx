/* P12 Country Payment Methods (prototype pages-profile.js #/c/{ISO}/payments). */
import { Card, Cols, DataTable, GradeChip, Kpi, Kpis, Note, STable, StatusChip, TagR, TagS, Ticks } from '@/Components/Industries/Kit';
import { CountryHead, CountryPage, SprintShelf } from '@/Components/CountryHub/Layout';
import { FactCite, type ProfileProps } from '@/Components/CountryHub/Profile';
import type { Row } from '@/types/countryHub';

interface Props extends ProfileProps { bw: { f11: Row; f12: Row; f19: Row; fx: Row[]; ict: Row[] } | null }

export default function Payments({ base, bw, shelf }: Props) {
    const { c } = base;
    const methods = [
        ['Bank Transfer / EFT', 'Local payments, supplier settlement, invoicing', 'Available', 'Resolver data complete', 'T+1 to T+2'],
        ['Invoice Settlement', 'B2B invoicing, milestone and project billing', 'Available', 'Depends on resolver and credit context', 'Agreed terms'],
        ['Card Payment', 'Online payments, one-off purchases', 'Active-Limited', 'Gateway and risk conditions apply', 'Near real-time'],
        ['Mobile money', 'Consumer & SME collections', c.isBW ? 'Conditional' : 'Active-Limited', 'Provider licence and KYC tier', 'Real-time'],
        ['Recurring Collection', 'Subscriptions, mandates, recurring billing', 'Conditional', 'Mandate, resolver and customer consent', 'Per cycle'],
        ['Foreign Currency Inbound', 'Inbound payments in foreign currency', 'Conditional', 'FX handling and licence checks', 'T+1 to T+3'],
        ['Cross-Border Settlement', 'Inter-country funds movement', 'Quote-Only', 'Pair-specific corridor and compliance checks', 'Varies by pair'],
        ['Cash', 'Cash payments and collections', 'Not Permitted', 'Policy and compliance restriction', 'Not applicable'],
    ];
    return (
        <CountryPage base={base} pageKey="payments">
            <CountryHead base={base} pageKey="payments" title="Country Payment Methods" desc="Understand the payment methods, settlement conditions and resolver-controlled payment rules for commercial engagement." />
            <Kpis>
                <Kpi l="Payment Framework" v="Resolver-Governed" icon="shield" />
                <Kpi l="Resolver Status" v="Complete" icon="check" />
                <Kpi l="Base Currency" v={c.currency ?? ''} s={c.isBW ? 'Pula — crawling peg' : undefined} icon="cash" />
                <Kpi l="Cross-Border Settlement" v="Pair-specific" s="Permission required" icon="swap" />
            </Kpis>
            <Card title="Payment Method Availability" icon="cash" sub={c.isBW ? <>Method list <TagR /> — provider confirmation is an open item</> : undefined}>
                <STable head={['Method', 'Use case', 'Availability', 'Resolver dependency', 'Settlement']} rows={methods.map((r) => [<b key="m">{r[0]}</b>, r[1], <StatusChip key="a" s={r[2]} />, <span key="d" className="text-[0.82rem]">{r[3]}</span>, r[4]])} />
            </Card>
            {bw && (
                <>
                    <Card title="FX & Currency — pula regime and scenarios" icon="chart" sub={<TagS s="BW_FX · BW-MAC-F9–F12, F19" />}>
                        <p className="mb-2.5 text-[0.88rem]">{String(bw.f11.Value ?? '')} <FactCite r={bw.f11} /></p>
                        <STable compact head={['Scenario', 'Pula per US$', 'Rand per pula', 'vs today', 'US$ per P1 m']} rows={bw.fx.map((r) => [String(r.Scenario ?? ''), <b key="p">{String(r['Pula per US$'] ?? '')}</b>, String(r['Rand per pula'] ?? ''), String(r['vs today'] ?? ''), String(r['US$ per P1 m'] ?? '')])} />
                        <p className="mt-2 text-[0.82rem]">{String(bw.f12.Item ?? '')}: {String(bw.f12.Value ?? '')}. {String(bw.f19.Item ?? '')}: {String(bw.f19.Value ?? '')}.</p>
                    </Card>
                    <Card title="Digital money & finance evidence (ICT + FIN sectors)" icon="db">
                        <DataTable<Row> name="BW_ICT_FIN_facts" rows={bw.ict} size={6} cols={[
                            { k: 'Fact ID', l: 'Fact ID' }, { k: 'Fact', l: 'Fact' }, { k: 'Value', l: 'Value', clip: true }, { k: 'Date', l: 'Date' }, { k: 'Grade', l: 'Grade', r: (x) => <GradeChip g={x.Grade} /> },
                        ]} />
                    </Card>
                </>
            )}
            <Cols n={2}>
                <Card title="Payment Principles">
                    <Ticks items={['No resolution, no price', 'No unsupported FX conversion', 'Gateway depends on context', 'Liquidity and licence checks apply', 'Commercial availability is service-by-service', 'Sanctions and prohibitions cannot be overridden']} />
                </Card>
                <Card title="Settlement Notes">
                    <ul className="list-disc space-y-1 ps-5 text-[0.82rem]">
                        <li>Local methods may be available when resolver fields are complete</li>
                        <li>Cross-border settlement is pair-specific</li>
                        <li>Payment terms follow service context and commercial permission</li>
                        <li>Audit trail required for all material transactions</li>
                    </ul>
                    <Note className="mt-2.5"><b>Commercial Guardrail.</b> Payment readiness does not itself create price authority.</Note>
                </Card>
            </Cols>
            {shelf && <SprintShelf shelf={shelf} c={c} />}
        </CountryPage>
    );
}
