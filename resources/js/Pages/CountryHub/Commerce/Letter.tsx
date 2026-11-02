/* P29 Country Engagement Letter Review: review and approve (prototype #/c/{ISO}/letter). */
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { A, B, Card, Check, Cols, Dl, Kpi, Kpis, STable, StatusChip, TagP, useMoney, useToast } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import { CSteps, type JourneySprint, type JourneyState } from '@/Components/CountryHub/Journey';
import type { CountryBase } from '@/types/countryHub';

interface Props { base: CountryBase; j: JourneyState; s: JourneySprint; vat: number; today: string }

export default function Letter({ base, j, s, vat, today }: Props) {
    const { c } = base;
    const money = useMoney();
    const toast = useToast();
    const [ack, setAck] = useState({ boundary: false, fees: false });
    const fee = s.fee ?? 0;
    const v = vat / 100;
    const ref = j.ref ?? '';
    const sections: [string, string][] = [['Parties', 'Compliant'], ['Engagement & Purpose', 'Compliant'], ['Scope of Work', 'Compliant'], ['Deliverables', 'Compliant'], ['Fees & Payment Terms', j.letterOk ? 'Compliant' : 'Needs Review'], ['Expenses & Disbursements', 'Compliant'], ['Client Responsibilities', 'Compliant'], ['TBCA Responsibilities', 'Compliant'], ['Confidentiality', 'Compliant'], ['Limitation of Liability', j.letterOk ? 'Compliant' : 'Needs Review'], ['Indemnity', 'Compliant'], ['Term & Termination', 'Compliant'], ['Governing Law & Jurisdiction', 'Compliant'], ['Schedules & Annexures', 'Compliant']];
    const ok = sections.filter((x) => x[1] === 'Compliant').length;
    const approve = () => {
        if (!ack.boundary || !ack.fees) { toast.show('Please acknowledge the professional boundary and the fee schedule first.'); return; }
        router.post(cHref(c, 'letter'), ack);
    };

    return (
        <CountryPage base={base} pageKey="letter">
            <CountryHead base={base} pageKey="letter" title="Country Engagement Letter Review" desc={`Review and approve the engagement letter for your engagement in ${c.name}.`} />
            <CSteps c={c} active="letter" j={j} />
            <Kpis>
                <Kpi l="Engagement Type" v={s.type ?? '—'} s={`${j.tier} tier`} icon="file" />
                <Kpi l="Client" v={j.org || j.name} s={`Quote ${ref}`} icon="user" />
                <Kpi l="Scope" v={s.name} icon="tag" />
                <Kpi l="Letter Version" v={j.letterOk ? 'v1.0 Approved' : 'v1.0 Draft'} icon="check" />
                <Kpi l="Review Status" v={`${Math.round((100 * ok) / sections.length)} %`} s={j.letterOk ? 'Approved' : 'Awaiting your approval'} icon="shield" />
            </Kpis>
            <Cols n={2}>
                <Card title="Letter Preview" icon="file">
                    <div className="max-h-[520px] space-y-2 overflow-auto rounded-[4px] border border-parchment-400 bg-[#fffefb] p-4 text-[0.85rem]">
                        <p className="text-center font-bold">THE BUSINESS CLINIC.AFRICA™ — COUNTRY ENGAGEMENT LETTER</p>
                        <p className="text-center text-[0.8rem]">Ref: {c.iso2}/EL/2026/{ref.slice(-4)} · Date: {today}</p>
                        <p><b>1. PARTIES.</b> The Business Clinic.Africa (Pty) Ltd ("TBCA") and {j.org || j.name} ("the Client").</p>
                        <p><b>2. ENGAGEMENT.</b> TBCA agrees to provide the services in the Scope of Work for <b>{c.name}</b> in accordance with this Engagement Letter and its Schedules.</p>
                        <p><b>3. SCOPE OF WORK.</b> {s.name} ({s.code}), {j.tier} tier. {j.scope ?? ''}</p>
                        <p><b>4. DELIVERABLES.</b> Deliverable pack with evidence annex drawn from the {c.isBW ? 'BW-1.0 Country Pack and Deep Registers' : 'country evidence manifest'}; human-reviewed before release.</p>
                        <p><b>5. FEES.</b> TBCA fee (Ledger T) {money(fee)} excluding VAT; VAT {vat} % {money(fee * v)}; total {money(fee * (1 + v))}. External, statutory, partner, data and corridor fees (Ledgers X, S, P, D, CT-C) are pass-through and not included unless separately resolved.</p>
                        <p><b>6. PAYMENT TERMS.</b> 100 % on activation (Sprint) or monthly in advance (retainer). Prices in ZAR; display conversions use BW_FX (9 Oct 2026).</p>
                        <p><b>7. PROFESSIONAL BOUNDARY.</b> TBCA does not provide legal, tax or investment advice. Reserved services are routed to licensed partners.</p>
                        <p><b>8. TERM.</b> Starts {j.start}; ends on delivery acceptance or after 12 months for retainers.</p>
                        <p><b>9. GOVERNING LAW.</b> Republic of South Africa <TagP />.</p>
                    </div>
                </Card>
                <Card title="Review Checklist" icon="check">
                    <STable head={['Section', 'Status']} rows={sections.map((x) => [x[0], <StatusChip key="s" s={x[1]} />])} />
                </Card>
            </Cols>
            <Card title="Commercial Summary" icon="cash">
                <Dl rows={[['Engagement type', s.type ?? '—'], ['TBCA fee (ex VAT)', <b key="f">{money(fee)}</b>], [`VAT (${vat} %)`, money(fee * v)], ['Total (incl. VAT)', <b key="t">{money(fee * (1 + v))}</b>], ['Payment terms', 'On activation'], ['Proposed start', j.start], ['Price source', `ECON-R0C catalogue · ${s.code}`]]} />
            </Card>
            <Card title="Approve" icon="shield" tone="gold">
                <div className="space-y-2">
                    <Check checked={ack.boundary} onChange={(x) => setAck({ ...ack, boundary: x })}>I acknowledge the professional boundary of this engagement.</Check>
                    <Check checked={ack.fees} onChange={(x) => setAck({ ...ack, fees: x })}>I have reviewed the fee schedule and pass-through ledgers.</Check>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-2">
                    {j.letterOk ? <A v="pri" href={cHref(c, 'pay')}>Proceed to Payment →</A> : <B v="pri" onClick={approve}>Approve Letter →</B>}
                    <A href={cHref(c, 'quote')}>Request Changes</A>
                    <B onClick={() => toast.show('Shared with your advisor (prototype)')}>Share with Advisor</B>
                </div>
            </Card>
            {toast.node}
        </CountryPage>
    );
}
