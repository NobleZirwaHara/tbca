import { useForm } from '@inertiajs/react';
import { Lock, ShieldCheck } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Checkbox, Field, Input } from '@/Components/ui/Form';
import QuoteShell from '@/Components/DueDiligence/QuoteShell';
import { Card, rand, usd } from '@/Components/DueDiligence/Ui';
import type { DdQuotePageProps } from '@/types/due-diligence';

interface Props extends DdQuotePageProps {
    user: { name: string; email: string; phone: string | null; company: string | null };
    methodTotals: Record<string, { subtotal: number; vat: number; fees: number; total: number }>;
    order: { reference: string; status: string } | null;
}

/** DD-027 Secure Checkout: billing and commercial confirmations, then the shared payment page. */
export default function Checkout(props: Props) {
    const { quote, sku, user, methodTotals, order } = props;
    const m = quote.manifest ?? props.price;
    const b = quote.billing ?? {};
    const form = useForm({
        organisation: b.organisation ?? quote.payerName ?? user.company ?? '',
        contact_name: b.contact_name ?? user.name,
        email: b.email ?? user.email,
        phone: b.phone ?? user.phone ?? '',
        address: b.address ?? '',
        vat_number: b.vat_number ?? '',
        po_reference: b.po_reference ?? '',
        pay_authority: false, terms: false, external_variance: false, work_after_payment: false, audit_logging: false, marketing: false,
    });
    const err = form.errors as Record<string, string>;
    const field = (k: 'organisation' | 'contact_name' | 'email' | 'phone' | 'address' | 'vat_number' | 'po_reference', label: string, required = false, cls = '') => (
        <Field label={label} required={required} error={err[k]} className={cls}>{(id) => <Input id={id} value={form.data[k]} onChange={(e) => form.setData(k, e.target.value)} type={k === 'email' ? 'email' : 'text'} />}</Field>
    );
    const confirms: [keyof typeof form.data, string][] = [
        ['pay_authority', 'I confirm I have the authority to pay on behalf of the organisation.'],
        ['terms', 'I accept the TBCA Terms of Service and Privacy Notice.'],
        ['external_variance', 'I understand external third-party costs may vary by jurisdiction and scope.'],
        ['work_after_payment', 'I understand work starts only after successful payment.'],
        ['audit_logging', 'I consent to audit logging and portal delivery of reports and artefacts.'],
        ['marketing', '(Optional) I would like to receive updates about TBCA services and insights.'],
    ];

    return (
        <QuoteShell
            page={props}
            title="Secure Checkout"
            subtitle="Complete payment securely to activate your due diligence case."
            description="Review the final fee summary, confirm billing details and continue to the secure payment page. No screening begins until payment succeeds and all gates are cleared."
            current={2}
            lifecycle="C"
            publicStage="2 Consent & Payment"
            hidePrice
            next="Payment confirms your order and activates the case."
            aside={
                <>
                    <Card title="Order Summary">
                        <dl className="space-y-1 text-[0.8125rem]">
                            <div className="flex justify-between gap-2"><dt className="text-ink-500">Service Selected</dt><dd className="text-right font-medium">{sku.name}</dd></div>
                            <div className="flex justify-between gap-2"><dt className="text-ink-500">Quote Reference</dt><dd className="font-mono text-xs">{quote.reference}</dd></div>
                            {order && <div className="flex justify-between gap-2"><dt className="text-ink-500">Order</dt><dd className="font-mono text-xs">{order.reference} ({order.status.replace('_', ' ')})</dd></div>}
                        </dl>
                        <table className="mt-3 w-full text-xs">
                            <thead className="text-ink-500"><tr><th className="text-left">Fee</th><th className="text-right">VAT excl.</th><th className="text-right">USD</th></tr></thead>
                            <tbody>
                                {[['TBCA Expert Fee', m.expert], ['TBCA Platform Fee', m.platform], ['External Third-Party*', m.external + m.margin], ['Payment Handling (card)', methodTotals.card?.fees ?? m.handling]].map(([k, v]) => (
                                    <tr key={k as string}><td className="py-1">{k}</td><td className="text-right">{rand(v as number, 2)}</td><td className="text-right text-ink-500">{usd(v as number)}</td></tr>
                                ))}
                                <tr className="border-t border-parchment-300"><td className="py-1">VAT (15%)</td><td className="text-right">{rand(m.vat, 2)}</td><td className="text-right text-ink-500">{usd(m.vat)}</td></tr>
                                <tr className="bg-gold-50 font-bold"><td className="py-1.5">Total (card, incl. VAT)</td><td className="text-right">{rand(methodTotals.card?.total ?? m.total, 2)}</td><td className="text-right">{usd(methodTotals.card?.total ?? m.total)}</td></tr>
                                <tr><td className="py-1 text-ink-500">Total (EFT)</td><td className="text-right text-ink-500">{rand(methodTotals.eft?.total ?? m.total, 2)}</td><td /></tr>
                            </tbody>
                        </table>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">*External costs are pass-through costs and may require re-approval if they exceed the stated tolerance. Raw vendor outputs are never displayed in checkout.</p>
                    </Card>
                    {order?.status === 'failed' && <ButtonLink href={`/due-diligence/payment/${order.reference}`} variant="outline" className="w-full">View payment failure & recovery options</ButtonLink>}
                    <Card title="Payment State">
                        <dl className="space-y-1 text-[0.8125rem]">
                            {[['Payment Status', order?.status === 'failed' ? 'Failed — retry safely' : 'Pending'], ['Consent State', 'Complete'], ['Entitlement State', 'Awaiting payment'], ['Review State', 'Pre-screening'], ['Risk State', 'Not assessed']].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}
                        </dl>
                    </Card>
                </>
            }
        >
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); form.post(`/due-diligence/quotes/${quote.reference}/checkout`); }}>
                <Card title="1. Billing Contact & Payer Details">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {field('organisation', 'Organisation (Legal Entity)', true)}
                        {field('contact_name', 'Payer / Contact Name', true)}
                        {field('email', 'Email Address', true)}
                        {field('phone', 'Mobile Number')}
                        {field('vat_number', 'VAT Number')}
                        {field('po_reference', 'PO / Reference (Optional)')}
                        {field('address', 'Billing Address', true, 'sm:col-span-2 lg:col-span-3')}
                    </div>
                    <p className="mt-2 text-xs text-ink-500">Currency: ZAR (VAT currency). USD reference 1 ZAR = {(1 / 18).toFixed(4)} USD.</p>
                </Card>
                <Card title="2. Payment Method">
                    <p className="text-[0.8125rem] text-ink-600">You choose card, EFT or wallet on the secure payment page. The same order ID remains valid if you need to retry — you will never be charged twice.</p>
                    <ul className="mt-3 flex flex-wrap gap-4 text-xs text-ink-700">
                        <li className="flex items-center gap-1"><ShieldCheck className="size-4 text-verified-500" aria-hidden="true" />3D Secure enabled</li>
                        <li className="flex items-center gap-1"><ShieldCheck className="size-4 text-verified-500" aria-hidden="true" />PCI-compliant gateway</li>
                        <li className="flex items-center gap-1"><ShieldCheck className="size-4 text-verified-500" aria-hidden="true" />No card details stored by TBCA</li>
                    </ul>
                </Card>
                <Card title="3. Consent & Commercial Confirmations">
                    <div className="grid gap-3 md:grid-cols-2">
                        {confirms.map(([k, label]) => (
                            <div key={k}>
                                <Checkbox label={label} checked={Boolean(form.data[k])} onChange={(e) => form.setData(k, e.target.checked as never)} />
                                {err[k] && <p className="mt-1 text-xs text-risk-500">{err[k]}</p>}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                        <Button type="submit" size="lg" disabled={form.processing}><Lock className="size-4" aria-hidden="true" /> Pay Securely & Activate Case</Button>
                        <ButtonLink href={`/due-diligence/quotes/${quote.reference}/review`} variant="outline" size="lg">Return to Order Review</ButtonLink>
                    </div>
                    <p className="mt-3 text-[0.6875rem] text-ink-400">System Event: EVT-DD-PAY-INITIATED · Audit Record: consent and checkout session created.</p>
                </Card>
            </form>
        </QuoteShell>
    );
}
