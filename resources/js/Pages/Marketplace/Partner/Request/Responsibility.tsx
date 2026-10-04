import { Head, Link, useForm } from '@inertiajs/react';
import { CircleCheck, Download, Info, Lock, MessageSquare, Minus } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, Notice } from '@/Components/Marketplace/ui';
import { PsBody } from '@/Components/Marketplace/PartnerKit';
import PsJourneyHeader from '@/Components/Marketplace/PsJourneyHeader';
import type { MkPartnerRequest } from '@/types/marketplace';

const mark = (v: string) => (v === 'R' ? <CircleCheck className="mx-auto size-5 fill-gold-500 text-white" aria-label="Responsible" /> : <Minus className="mx-auto size-4 text-ink-300" aria-label="Not responsible" />);

export default function Responsibility({ request: r, journey, matrix }: { request: MkPartnerRequest; journey: string[]; matrix: [string, string, string, string, string][] }) {
    const form = useForm({ confirm: r.stage === 'payment' });
    const payment = r.stage === 'payment';

    return (
        <>
            <Head title={`Who Is Responsible for What – ${r.reference}`} />
            <PsBody>
                <PsJourneyHeader request={r} journey={journey} code="PS-013" title="Who Is Responsible for What" crumb="Who Is Responsible for What" step={7}
                    lead={<>Matter-specific responsibility statement for {r.reference}. This clarifies who is responsible for what under this engagement.</>}
                    responsibility={<><p>Review this responsibility statement carefully. It forms part of your engagement instrument.</p><p>By continuing, you confirm that you understand who is responsible for what in this matter.</p></>}
                    refRows={[['Service Category', r.listing?.title ?? r.title], ['Primary Profession', r.resolution.profession], ['Arrangement (A)', r.arrangement], ['Contracting Parties', 'Client ↔ TBCA | Client ↔ Professional']]} />
                {payment && <Notice tone="warn">Payment has not cleared yet{r.orderRef ? ` for order ${r.orderRef}` : ''}. Continue to payment to complete this step — the professional commences only after payment is confirmed.</Notice>}
                <div className="grid gap-5 lg:grid-cols-12">
                    <Card className="lg:col-span-8" title="A. Responsibility Matrix">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-[0.8125rem]">
                                <thead className="bg-parchment-200 text-xs text-ink-600"><tr><th scope="col" className="px-2 py-2 text-left">Activity / Deliverable</th><th scope="col" className="px-2 py-2">TBCA<br /><span className="font-normal">(Non-Professional)</span></th><th scope="col" className="px-2 py-2">Professional<br /><span className="font-normal">({r.partner?.name})</span></th><th scope="col" className="px-2 py-2">Client<br /><span className="font-normal">({r.clientName})</span></th><th scope="col" className="px-2 py-2 text-left">Notes &amp; Limits</th></tr></thead>
                                <tbody className="divide-y divide-parchment-300">{matrix.map(([a, t, p, c, n]) => <tr key={a}><td className="px-2 py-2">{a}</td><td className="px-2 py-2 text-center">{mark(t)}</td><td className="px-2 py-2 text-center">{mark(p)}</td><td className="px-2 py-2 text-center">{mark(c)}</td><td className="px-2 py-2 text-xs text-ink-600">{n}</td></tr>)}</tbody>
                            </table>
                        </div>
                        <p className="mt-3 flex flex-wrap gap-4 text-xs text-ink-500"><span className="flex items-center gap-1"><CircleCheck className="size-4 fill-gold-500 text-white" aria-hidden="true" />Responsible</span><span className="flex items-center gap-1"><Minus className="size-4" aria-hidden="true" />Not Responsible</span><span className="flex items-center gap-1"><Info className="size-4" aria-hidden="true" />Shared where both are marked</span></p>
                    </Card>
                    <div className="space-y-4 lg:col-span-4">
                        <Card title="B. Key Limits & Boundaries"><ul className="list-disc space-y-1 pl-4 text-sm text-ink-700"><li>TBCA does not provide professional advice or opinion.</li><li>Professional remains independent and responsible for professional judgement and conclusions.</li><li>TBCA is not liable for professional advice, findings or outcomes.</li><li>This statement does not limit any rights or obligations under the Engagement Instrument.</li></ul></Card>
                        <Card title="C. Confirmation">
                            <p className="text-sm text-ink-600">By proceeding, you confirm that you have read and understood who is responsible for what in this engagement.</p>
                            <Checkbox className="mt-3" label="I confirm that I have read, understood and accept this Responsibility Statement." checked={form.data.confirm} onChange={(e) => form.setData('confirm', e.target.checked)} />
                            {form.errors.confirm && <p role="alert" className="text-xs text-risk-500">{form.errors.confirm}</p>}
                        </Card>
                        <Card tone="blue"><p className="flex items-center gap-2 font-semibold"><Info className="size-4" aria-hidden="true" />IMPORTANT</p><p className="mt-1 text-sm text-ink-700">This Responsibility Statement is matter-specific and forms part of the Engagement Instrument. If there is any conflict, the Engagement Instrument prevails.</p></Card>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {!payment && <Link href={`/partner-services/requests/${r.reference}/engagement-instrument`} className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 bg-white px-5 text-sm">← Back: Engagement Instrument &amp; Signature</Link>}
                    <Button type="button" variant="outline" onClick={() => window.print()}><Download className="size-4" aria-hidden="true" />Download Responsibility Statement (PDF)</Button>
                    <Button type="button" variant="outline" onClick={() => openAskQuestion({ subject: `Responsibility statement ${r.reference}`, section: 'partner-services' })}><MessageSquare className="size-4" aria-hidden="true" />Request Clarification</Button>
                    <div className="ml-auto text-center">
                        <Button type="button" size="lg" disabled={!form.data.confirm || form.processing} onClick={() => form.post(`/partner-services/requests/${r.reference}/responsibility`)} trailingIcon="arrow-right">{payment ? 'Continue to Payment' : 'I Confirm & Continue'}</Button>
                        <p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink-500"><Lock className="size-3" aria-hidden="true" />Next: Payment</p>
                    </div>
                </div>
            </PsBody>
        </>
    );
}
