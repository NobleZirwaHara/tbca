import { router } from '@inertiajs/react';
import { useState } from 'react';
import { A, B, Card, Check, Chip, Dl, Note, STable, Ticks, useMoney } from '@/Components/Industries/Kit';
import { Head1, NoEngagement, WorkspacePage, dayS, nowS } from '@/Components/Industries/Layout';
import { useCurrency } from '@/lib/money';
import type { Country, Engagement, IndustryBase, Totals } from '@/types/industries';

interface Props extends IndustryBase { e: Engagement | null; tt?: Totals; country?: Country; subName?: string | null }

export default function Letter(p: Props) {
    const { e, tt, country: c, ind } = p;
    const money = useMoney();
    const { currency } = useCurrency();
    const [ok, setOk] = useState(false);
    const [err, setErr] = useState('');
    const [copied, setCopied] = useState(false);
    if (!e || !tt || !c) return <WorkspacePage base={p} active="letter" label="Engagement Letter Preview"><NoEngagement base={p} /></WorkspacePage>;
    const issue = e.gates.G3 ?? e.created;
    const H = 'mt-3 mb-1 font-bold';

    return (
        <WorkspacePage base={p} active="letter" label="Engagement Letter Preview" right={<>
            <Card title="Engagement Summary" icon="file"><Dl rows={[['Reference', e.ref], ['Issue date', dayS(issue)], ['Total fee', `${money(e.price)} ex VAT`], ['Payment terms', '100 % upfront'], ['Validity', '30 days']]} /></Card>
            <Card title="Related Documents" icon="book"><Ticks items={['Scope of Work (Schedule 1)', 'Fee Schedule (Schedule 2)', 'Terms & Conditions', 'Limitation Statement']} /></Card>
        </>}>
            <Head1 eyebrow="Mock-up Page 19" title="Engagement Letter Preview" desc="Review the engagement letter terms and confirm your agreement to proceed."
                act={<B onClick={() => { const t = document.getElementById('letter')?.innerText ?? ''; void navigator.clipboard?.writeText(t).then(() => setCopied(true)); }}>{copied ? 'Letter text copied' : 'Copy letter text'}</B>} />
            <div id="letter" className="max-h-[640px] overflow-auto rounded-[6px] border border-parchment-400 bg-white px-5 py-5 font-[Georgia,'Times_New_Roman',serif] text-[0.86rem] leading-relaxed sm:px-7">
                <div className="flex flex-wrap justify-between gap-2 font-sans"><b>The Business Clinic.Africa™</b><span className="font-mono text-[0.72rem]">{e.ref}</span></div>
                <h3 className="my-2.5 font-sans text-[1.05rem] font-bold">ENGAGEMENT LETTER</h3>
                <p>This Engagement Letter ("Letter") is made on {dayS(issue)} between <b>The Business Clinic.Africa</b> ("TBCA"), 5th Floor, Blocktrans Building, Blue Gum Road, Lynnwood Ridge, Pretoria, and <b>{e.reg?.o || e.reg?.n || '[Client name]'}</b> ("Client").</p>
                <div className="my-3 font-sans"><STable compact head={['Engagement', 'Industry', 'Sub-industry', 'Country', 'Total fee (T, ex VAT)']} rows={[[e.name, ind.name, p.subName ?? '—', c.name, money(e.price)]]} /></div>
                <h4 className={H}>1. Purpose</h4><p>TBCA will provide the services described in this Letter in connection with the Africa Investment Intelligence Map (AIIM) sector-adapted diagnostic and advisory engagement ("Engagement").</p>
                <h4 className={H}>2. Scope of work</h4><p>As set out in Schedule 1. Key deliverables: country & industry scoping (2 days); evidence pack (6 days); sector analysis (9 days); draft report (13 days); specialist sign-off and final report (17 days from payment).</p>
                <h4 className={H}>3. Fees and payment terms</h4><p>Fees are set out in Schedule 2, stated in ZAR (display {currency}) and exclusive of VAT. T (TBCA) fee {money(e.price)} plus VAT {money(tt.vat)}; payable 100 % upfront. Partner (P), external (X) and statutory (S) fees are contracted and disclosed separately; mandatory add-ons: {e.addons.map((a) => `${a.name} (${a.ledger})`).join(', ')}.</p>
                <h4 className={H}>4. Terms & conditions</h4><p>TBCA performs the services with reasonable skill, care and diligence. The Client may abort at the points listed in the Abort Ladder; milestone fees are non-refundable once the milestone is accepted.</p>
                <h4 className={H}>5. Disclaimers & limitations</h4><p>Sector Limitation Statement IN-LIM-{ind.code}-001 applies. TBCA gives no legal, tax, regulatory or investment opinion; reserved work is delivered by independent professionals.</p>
                <h4 className={H}>6. Acceptance</h4><p>Valid 30 days from issue. Accepted electronically by the Client through the TBCA portal; the acceptance is time-stamped to the audit trail.</p>
            </div>
            {e.letter ? (
                <>
                    <Note><Chip t="Accepted" tone="ok" /> {nowS(e.letter)}</Note>
                    <A v="pri" href="/industries/engage/checkout">Go to checkout →</A>
                </>
            ) : (
                <>
                    <Check checked={ok} onChange={setOk}><b className="text-[0.82rem]">I have read, understood and agree to the terms of this Engagement Letter.</b></Check>
                    {err && <p role="alert" className="text-[0.85rem] font-semibold text-risk-700">{err}</p>}
                    <div className="flex flex-wrap gap-2">
                        <A href="/industries/engage/gates">← Back to gates</A>
                        <B v="pri" onClick={() => (ok ? router.post('/industries/engage/action', { do: 'letter' }) : setErr('Confirm you have read the letter'))}>Accept & send for signature</B>
                    </div>
                </>
            )}
        </WorkspacePage>
    );
}
