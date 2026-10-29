import { A, Card, Dl, Ic } from '@/Components/Industries/Kit';
import { CallButton, Head1, IndustryPage, iHref } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

interface Props extends IndustryBase { res: { code: string; name: string; reason: string; msg: string; ref: string; alt: string } }

export default function Blocked(p: Props) {
    const { ind, res } = p;
    const code = res.code.replace(/\D/g, '').slice(-3) || '042';
    return (
        <IndustryPage base={p} active="limits" label={res.name}>
            <Head1 eyebrow="Blocked SKU Explanation · Mock-up Page 12" title={res.name} desc={`Requested service · SKU ${res.code}`} />
            <div className="rounded-[6px] border-2 border-risk-500 bg-risk-50 p-4">
                <h3 className="flex items-center gap-2 font-semibold text-risk-700"><Ic n="lock" /> Service Not Available · Code IN-BLOCK-{code}</h3>
                <p className="my-2 text-[0.88rem]"><b>This service is not available for your selected industry context.</b> We cannot accept this request under our professional boundaries and risk policy.</p>
                <Dl rows={[['Why', res.reason], ['Explanation', res.msg], ['Applicable rules & references', <span className="text-[0.78rem]">{res.ref}<br />TBCA Boundary & Risk Policy v1.0 · Four-ledger model — P (Professional) ledger boundary</span>]]} />
            </div>
            <Card title="What You Can Do Instead" icon="check">
                <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 md:grid-cols-3">
                    <div className="flex flex-col gap-1.5 rounded-[6px] border border-parchment-400 bg-white p-3"><b>1. Use our Partner Route</b><span className="text-[0.82rem]">We connect you with a {res.alt} for a formal engagement.</span><A sm className="mt-auto self-start" href={iHref(ind, 'partners')}>Find partners →</A></div>
                    <div className="flex flex-col gap-1.5 rounded-[6px] border border-parchment-400 bg-white p-3"><b>2. Get a Readiness Diagnostic</b><span className="text-[0.82rem]">Get ready for the professional engagement with our sector diagnostic.</span><A sm className="mt-auto self-start" href={iHref(ind, 'diagnostic')}>View diagnostic →</A></div>
                    <div className="flex flex-col gap-1.5 rounded-[6px] border border-parchment-400 bg-white p-3"><b>3. Speak to a TBCA Advisor</b><span className="text-[0.82rem]">Discuss the best professional route for your context.</span><span className="mt-auto"><CallButton v="default">Book advisor call →</CallButton></span></div>
                </div>
                <p className="mt-3 text-[0.82rem]"><b>Transparency is our commitment.</b> We will never offer or disguise a reserved service.</p>
            </Card>
        </IndustryPage>
    );
}
