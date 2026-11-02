/* P30 Country Payment and Activation: six ledgers, VAT, simulated payment (prototype #/c/{ISO}/pay). No card or bank details are collected. */
import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { A, B, Card, Check, Chip, Cols, Dl, Ic, Note, STable, useToast } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import { CSteps, useMoney2, type JourneySprint, type JourneyState } from '@/Components/CountryHub/Journey';
import { useCurrency } from '@/lib/money';
import type { CountryBase } from '@/types/countryHub';

interface Props { base: CountryBase; j: JourneyState; s: JourneySprint; vat: number; methods: string[] }

const PM: [string, string][] = [['Credit / Debit Card', 'Hosted, PCI DSS card form'], ['Instant EFT', 'Pay from your bank — recommended'], ['Bank Transfer (EFT)', 'Use your bank’s EFT / wire'], ['Enterprise credit / invoice', 'Approved credit terms']];
const PV = ['Payment received · captured successfully', 'Verification PV-1 · passed', 'Activation · workspace access enabled', 'Welcome & next steps · kick-off scheduled'];

export default function Pay({ base, j, s, vat }: Props) {
    const { c } = base;
    const money = useMoney2();
    const { currency } = useCurrency();
    const toast = useToast();
    const fee = s.fee ?? 0;
    const v = vat / 100;
    const [method, setMethod] = useState('Instant EFT');
    const [cons, setCons] = useState({ collect: false, terms: false, verification: false });
    const [shown, setShown] = useState(0);
    const timer = useRef<number | undefined>(undefined);
    useEffect(() => () => window.clearTimeout(timer.current), []);

    const ledg: [string, string, number][] = [['T', 'TBCA Fee (Platform access, delivery & human review)', fee], ['X', 'External fees (crossing / liquidity)', 0], ['S', 'Statutory fees (filings, permits)', 0], ['P', 'Partner fees (professional review)', 0], ['D', 'Data & evidence access', 0], ['CT-C', 'Corridor fees', 0]];
    const total = fee * (1 + v);

    const payNow = () => {
        if (!j.letterOk) { toast.show('Approve the Engagement Letter first.'); router.visit(cHref(c, 'letter')); return; }
        if (!cons.collect || !cons.terms || !cons.verification) { toast.show('Please confirm all three authorisations.'); return; }
        let i = 0;
        const tick = () => {
            i += 1;
            setShown(i);
            if (i < PV.length) timer.current = window.setTimeout(tick, 650);
            else timer.current = window.setTimeout(() => router.post(cHref(c, 'pay'), { method, ...cons }), 600);
        };
        tick();
    };

    return (
        <CountryPage base={base} pageKey="pay">
            <CountryHead base={base} pageKey="pay" title="Country Payment and Activation" desc="Complete your payment to activate your engagement and access your client workspace." />
            <CSteps c={c} active="pay" j={j} />
            <Cols n={2}>
                <Card title="1. Payment Summary" icon="file">
                    <Dl rows={[
                        ['Engagement', `${c.name} · ${s.name}`], ['Tier', j.tier],
                        ['Engagement Letter', j.letterOk ? <Chip key="l" t={`${j.elRef} Accepted`} tone="ok" /> : <Chip key="l" t="Not yet approved" tone="warn" />],
                        ['Billing entity', j.org || j.name], ['Payment verification', 'PV-1 required'],
                        ['Activation', j.paid ? <Chip key="a" t="Active" tone="ok" /> : <Chip key="a" t="Pending payment" tone="warn" />],
                    ]} />
                </Card>
                <Card title={`Fee Summary (${currency}) — six-ledger separation`} icon="cash">
                    <STable head={['Ledger', 'Fee class', 'Amount']} rows={ledg.map((l) => [<b key="l">{l[0]}</b>, l[1], l[2] ? money(l[2]) : <span key="a" className="text-ink-400">{money(0)} · not applicable / pass-through</span>])} />
                    <Dl className="mt-3" rows={[['Subtotal (ex VAT)', money(fee)], [`VAT (${vat} %)`, money(fee * v)], [<b key="t">Total amount</b>, <b key="v" className="text-[1.1rem]">{money(total)}</b>]]} />
                    <Note className="mt-2"><b>No TBCA custody.</b> TBCA does not hold client funds. Payments are processed by verified providers.</Note>
                </Card>
            </Cols>
            <Card title="2. Choose Payment Method" icon="cash">
                <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {PM.map(([l, d]) => (
                        <label key={l} className={`cursor-pointer rounded-[6px] border bg-white p-3 ${method === l ? 'border-gold-500 shadow-[0_0_0_2px_var(--color-gold-100)]' : 'border-parchment-400'}`}>
                            <input type="radio" name="pm" value={l} checked={method === l} onChange={() => setMethod(l)} className="accent-gold-600" /> <b className="text-[0.85rem]">{l}</b>
                            <div className="text-[0.72rem] text-ink-400">{d}</div>
                        </label>
                    ))}
                </div>
                <Note className="mt-2.5">Prototype: no card or bank details are collected on this page — the chosen provider's hosted form opens at this point in production.</Note>
            </Card>
            <Card title="3. Consent & Authorisation" icon="shield">
                <div className="space-y-2">
                    <Check checked={cons.collect} onChange={(x) => setCons({ ...cons, collect: x })}>I authorise TBCA to collect {money(total)} (incl. VAT) for this engagement.</Check>
                    <Check checked={cons.terms} onChange={(x) => setCons({ ...cons, terms: x })}>I accept the Engagement Letter, Schedules, Terms &amp; Conditions and Privacy Policy.</Check>
                    <Check checked={cons.verification} onChange={(x) => setCons({ ...cons, verification: x })}>I understand activation is subject to payment verification (PV-1).</Check>
                </div>
            </Card>
            <Card title="4. Review & Activate" icon="check" tone="gold">
                <div className="flex flex-wrap items-center gap-3">
                    <div><div className="text-[0.82rem] text-ink-400">Total amount (incl. VAT)</div><div className="text-[1.5rem] font-bold">{money(total)}</div></div>
                    <div className="grow" />
                    {j.paid ? <A v="pri" href={cHref(c, 'workspace')}>Go to Client Workspace →</A> : <B v="pri" className="min-h-[44px]" disabled={shown > 0} onClick={payNow}>Pay Now &amp; Activate Engagement</B>}
                    <B onClick={() => toast.show('Saved — pay later from your workspace')}>Save &amp; Pay Later</B>
                </div>
                <ul className="mt-3 space-y-1 text-[0.85rem]" aria-live="polite">
                    {(j.paid ? ['Payment received', 'Verification PV-1 passed', 'Activation complete'] : PV.slice(0, shown)).map((x) => <li key={x} className="flex items-center gap-2"><Ic n="check" className="text-verified-700" /> {x}</li>)}
                </ul>
                <Note className="mt-2.5"><b>Activation Guarantee.</b> If we cannot verify your payment, no services are activated and no fees are retained.</Note>
            </Card>
            {toast.node}
        </CountryPage>
    );
}
