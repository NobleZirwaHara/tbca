import { router } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import { A, B, Card, Check, Chip, Cols, Dl, Field, STable, Ticks, inputCls, useMoney } from '@/Components/Industries/Kit';
import { CtxPanel, EngBar, GateGrid, Head1, LedChip, NoEngagement, PlainPage, Shell, nowS } from '@/Components/Industries/Layout';
import { useCurrency } from '@/lib/money';
import type { Country, Engagement, IndustryBase, Totals } from '@/types/industries';

interface Props extends IndustryBase { e: Engagement | null; tt?: Totals; country?: Country; gateList?: [string, string, string][]; cur: string | null }

export default function Gates(p: Props) {
    const { e, tt, country: c } = p;
    const money = useMoney();
    const { currency } = useCurrency();
    const [ticks, setTicks] = useState<Record<string, boolean>>({});
    const [reg, setReg] = useState({ n: e?.reg?.n ?? '', o: e?.reg?.o ?? '', e: e?.reg?.e ?? '', p: 'Portal + email' });
    const [err, setErr] = useState('');
    const crumbs: [string, string?][] = [['Industries', '/industries'], ['Engagement', '/industries/workspace'], ['Gate Approval']];
    if (!e || !tt || !c) return <Shell title="Gate Approval" crumbs={crumbs}><NoEngagement base={p} /></Shell>;

    const pass = (k: string) => {
        if (!ticks[k]) { setErr('Tick the confirmation to continue'); return; }
        if (k === 'G1' && (!reg.n || !reg.e)) { setErr('Name and email are required'); return; }
        setErr('');
        router.post('/industries/engage/action', { do: 'gate', gate: k, ...(k === 'G1' ? { n: reg.n, o: reg.o, e: reg.e } : {}) }, { preserveScroll: true });
    };

    const V: Record<string, [string, string, ReactNode, string, string]> = {
        G0: ['Consent Gate', 'S0 Arrival & Exploration', <><p className="text-[0.85rem]">By continuing, you confirm that you have read and understood how AIIM works, its information limitations and your responsibilities.</p><Ticks className="my-2" items={['AIIM Terms of Use', 'Data Handling & Privacy Policy', 'Information Limitations & Use', 'Transaction & Payment Transparency Principles']} /><p className="text-[0.72rem] text-ink-400">You can stop at any time. No fees apply at this stage.</p></>, 'I have read and accept the above', 'I Consent & Continue'],
        G1: ['Registration Gate', 'S1 Registration & Intent Capture', <><p className="mb-2 text-[0.85rem]">Complete your profile to save intent and access. We use this to personalise and secure your engagement.</p>
            <Cols>
                <Field label="Full name"><input className={inputCls} autoComplete="name" value={reg.n} onChange={(x) => setReg({ ...reg, n: x.target.value })} /></Field>
                <Field label="Organisation"><input className={inputCls} autoComplete="organization" value={reg.o} onChange={(x) => setReg({ ...reg, o: x.target.value })} /></Field>
                <Field label="Work email"><input type="email" className={inputCls} autoComplete="email" value={reg.e} onChange={(x) => setReg({ ...reg, e: x.target.value })} /></Field>
                <Field label="Communication preference"><select className={inputCls} value={reg.p} onChange={(x) => setReg({ ...reg, p: x.target.value })}><option>Portal + email</option><option>WhatsApp notifications</option><option>Portal only</option></select></Field>
            </Cols>
            <p className="mt-2 text-[0.72rem] text-ink-400">Kept on your account when signed in, otherwise in this browser session. You can update or delete it at any time.</p></>, 'I confirm my details are accurate', 'Complete Registration'],
        G2: ['Disclosure Gate', 'S2 Selection & Fee Sweep', <><p className="mb-2 text-[0.85rem]">Review the full cost, scope and limitations before proceeding.</p>
            <STable compact head={['Ledger', 'Item', 'Amount']} rows={[[<LedChip l="T" />, `${e.name} · ${e.tier}`, money(e.price)], ...e.addons.map((a) => [<LedChip l={a.ledger} />, a.name, a.fee ? money(a.fee) : a.ledger === 'S' ? 'Varies' : 'Quote']), [<Chip t="VAT" />, `${c.name} VAT ${c.vat === null ? 'n/a' : `${c.vat} %`} on T`, money(tt.vat)]]} />
            <p className="mt-2 text-[0.72rem] text-ink-400">Includes services, exclusions, data-licensing limitations and potential external disbursements. No charges are made until you approve a specific item or milestone.</p></>, 'I confirm I have reviewed the full disclosure', 'I Understand & Continue'],
        G3: ['Quotation Gate', 'S3 Quotation', <><Dl rows={[['Engagement', e.name], ['Reference', e.ref], ['Total fee (T, ex VAT)', <b>{money(e.price)}</b>], ['VAT', money(tt.vat)], ['Total payable to TBCA', <b>{money(tt.total)}</b>], ['Partner / external / statutory', 'Contracted separately (P/X/S)']]} /><p className="mt-2 text-[0.72rem] text-ink-400">By approving you agree the quotation is accurate and complete, work starts after payment, and the Engagement Letter terms apply.</p></>, 'I approve this quotation', 'Approve & Proceed'],
        G4: ['Payment Gate', 'S4 Payment & Entitlement', <><p className="mb-2 text-[0.85rem]">Final step before entitlement is activated. Payment is completed in Split Checkout.</p><Dl rows={[['Total amount', <b>{money(tt.total)}</b>], ['Currency', currency], ['Paid so far', money(tt.paid)]]} /></>, 'I authorise the payment and agree the payment terms', 'Pay & Activate'],
    };

    return (
        <PlainPage title="Gate Approval" crumbs={crumbs} right={<><CtxPanel base={p} /><Card title="Gate Governance" icon="shield"><Ticks items={['AIIM policy compliant', 'Human gate mandatory', 'Audit trail recorded', 'Zero hidden charges']} /></Card></>}>
            <Head1 eyebrow="IN-SCR-022 · Mock-up Page 22" title="Gate Approval" desc="Five gate variants used across the Industries transaction ecosystem. Every gate action is time-stamped to your audit trail." />
            <EngBar e={p.engagement} />
            <GateGrid gates={p.gateList ?? []} done={e.gates} cur={p.cur} note={(k) => (e.gates[k] ? `Completed ${nowS(e.gates[k])}` : k === p.cur ? 'Action required' : 'Locked')} />
            {err && <p role="alert" className="text-[0.85rem] font-semibold text-risk-700">{err}</p>}
            {(['G0', 'G1', 'G2', 'G3', 'G4'] as const).map((k) => {
                const [n, st, body, ck, btn] = V[k];
                const done = Boolean(e.gates[k]);
                const now = k === p.cur;
                return (
                    <Card key={k} title={`GATE-IN-0${Number(k[1]) + 3}: ${n}`} icon={done ? 'check' : now ? 'shield' : 'lock'} sub={`Stage: ${st}`} tone={now ? 'gold' : undefined}>
                        {done ? <p className="text-[0.85rem]"><Chip t="Completed" tone="ok" /> {nowS(e.gates[k])}</p> : now ? (
                            <>
                                {body}
                                <Check className="mt-3" checked={Boolean(ticks[k])} onChange={(v) => setTicks({ ...ticks, [k]: v })}><b className="text-[0.82rem]">{ck}</b></Check>
                                <div className="mt-3 flex flex-wrap gap-2"><A href="/industries/workspace/abort">Cancel</A><B v="pri" onClick={() => pass(k)}>{btn}</B></div>
                            </>
                        ) : <p className="text-[0.85rem] text-ink-400">Locked until the previous gate passes.</p>}
                    </Card>
                );
            })}
        </PlainPage>
    );
}
