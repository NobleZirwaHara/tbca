import { router } from '@inertiajs/react';
import { CheckCircle2, Clock, CreditCard, Loader2, Lock } from 'lucide-react';
import { useEffect } from 'react';
import { Chip } from '@/Components/Aiim/Chips';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { RailBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Stepper } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';
import { OrderSummary, type OrderProps } from './Checkout';

interface Props extends AiimPageProps {
    order: OrderProps;
    paid: boolean;
    payment: { reference: string; method: string; status: string; last4: string | null; reason: string | null } | null;
    next: { label: string; url: string };
    entitlement: { reference: string; title: string; access: string; views: number | null; expires: string | null } | null;
}

/** P31 Payment Processing (while unpaid) and P32 Payment Confirmation (once paid). */
export default function Payment({ order, paid, payment, next, entitlement }: Props) {
    // Poll the server while the gateway confirms the payment (external system).
    useEffect(() => {
        if (paid) return;
        const t = window.setInterval(() => router.reload({ only: ['order', 'paid', 'payment', 'next', 'entitlement'] }), 5000);
        return () => window.clearInterval(t);
    }, [paid]);

    const method = payment ? (payment.method === 'card' ? `Card ending ${payment.last4 ?? '••••'}` : payment.method.toUpperCase()) : '—';

    return (
        <AiimPage
            title={paid ? 'Payment Confirmation' : 'Payment Processing'}
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Secure Checkout' }, { label: paid ? 'Payment Confirmation' : 'Payment Processing' }]}
            heading={paid ? <>Payment Confirmation <CheckCircle2 className="size-7 text-verified-500" /></> : <>Payment Processing <Loader2 className="size-7 animate-spin text-gold-500" /></>}
            subtitle={paid ? 'Payment successful. Thank you for your purchase.' : 'Your payment is being processed securely.'}
            description={paid ? 'Your premium intelligence is now being unlocked.' : 'Please do not close this page. This may take a few moments.'}
            accent={paid ? 'green' : 'gold'}
            rail={<><SelectionBox /><RailBox title="Important Information"><ul className="space-y-1.5 text-xs text-ink-300"><li>✓ Your payment is secure.</li><li>✓ We never store your card details.</li><li>✓ Entitlements unlock only on verified payment.</li></ul></RailBox></>}
        >
            <SectionCard className="mb-4"><Stepper steps={['Review Order', 'Billing Details', 'Payment', 'Confirmation']} current={paid ? 4 : 3} /></SectionCard>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                {paid ? (
                    <div className="space-y-4">
                        <SectionCard>
                            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                                <div className="flex gap-3"><CheckCircle2 className="size-14 shrink-0 text-verified-500" /><div><h2 className="text-lg font-semibold text-verified-700">Payment Successful</h2><p className="text-xs text-ink-600">Your payment has been completed successfully. A confirmation has been sent to your email.</p></div></div>
                                <dl className="grid grid-cols-2 gap-3 text-xs">
                                    {[['Order ID', order.reference], ['Date & Time', order.date], ['Payment Reference', payment?.reference ?? '—'], ['Amount Paid', `${zar2(order.total)} incl. VAT`], ['Payment Method', method], ['Payer', order.payer ?? '—']].map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
                                </dl>
                            </div>
                        </SectionCard>
                        <div className="grid gap-4 md:grid-cols-2">
                            <SectionCard title="What Happens Next?">
                                <ol className="space-y-2 text-xs">
                                    <li className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" /><span><strong className="block">Payment Received</strong>Your payment has been processed securely.</span></li>
                                    <li className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" /><span><strong className="block">{entitlement ? 'Premium Access Unlocked' : 'Fulfilment Started'}</strong>{entitlement ? `Entitlement ${entitlement.reference} is active.` : 'Your order has been passed to fulfilment.'}</span></li>
                                    <li className="flex gap-2"><Clock className="size-4 text-attested-500" /><span><strong className="block">Available in Your Workspace</strong>You will be notified when everything is ready.</span></li>
                                </ol>
                            </SectionCard>
                            <SectionCard title="Delivery and Access">
                                <Chip tone={entitlement ? 'good' : 'warn'}>{entitlement ? 'Unlocked' : 'Processing'}</Chip>
                                <p className="mt-2 font-semibold">{entitlement?.title ?? order.label ?? order.title}</p>
                                {entitlement && <dl className="mt-2 space-y-1 text-xs"><div className="flex justify-between"><dt>Access Type</dt><dd>{entitlement.access}</dd></div>{entitlement.views && <div className="flex justify-between"><dt>Views Included</dt><dd>{entitlement.views}</dd></div>}{entitlement.expires && <div className="flex justify-between"><dt>Expires</dt><dd>{entitlement.expires}</dd></div>}</dl>}
                                <p className="mt-2 text-xs text-verified-700">You will be notified at {order.email}.</p>
                            </SectionCard>
                        </div>
                    </div>
                ) : (
                    <SectionCard>
                        <p className="text-xs font-bold tracking-wide text-risk-500 uppercase">Secure payment gateway</p>
                        <div className="mt-3 flex flex-wrap items-center gap-6">
                            <span className="flex size-28 items-center justify-center rounded-full border border-gold-300 bg-gold-50"><CreditCard className="size-12 text-ink-900" /><Lock className="-ml-4 mt-8 size-6" /></span>
                            <div>
                                <h2 className="text-xl font-semibold">Processing your payment…</h2>
                                <p className="text-sm text-ink-600">We are securely confirming your payment with our trusted payment partner.</p>
                                <ul className="mt-3 space-y-1.5 text-sm">
                                    <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-gold-600" />Payment details received</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-gold-600" />Validating with your bank</li>
                                    <li className="flex items-center gap-2"><Loader2 className="size-4 animate-spin text-gold-600" />Completing transaction</li>
                                    <li className="flex items-center gap-2 text-ink-400"><Clock className="size-4" />Finalising your access</li>
                                </ul>
                            </div>
                        </div>
                        <p className="mt-4 rounded bg-controlled-50 p-2 text-xs text-controlled-700">{payment?.reason ?? 'This may take up to 30 seconds. You will be redirected automatically once payment is confirmed.'} This page refreshes every few seconds.</p>
                        <ButtonLink href={`/checkout/${order.reference}`} variant="outline" size="sm" className="mt-3">Return to payment options</ButtonLink>
                    </SectionCard>
                )}
                <SectionCard title="Order Summary" action={<span className="font-mono text-xs">{order.reference}</span>}><OrderSummary order={order} /><p className="mt-2 text-xs">Payment Method: <strong>{method}</strong></p></SectionCard>
            </div>
            {paid && (
                <div className="mt-4 flex flex-wrap justify-between gap-3">
                    <ButtonLink href="/aiim/workspace" variant="outline">Back to AIIM Workspace</ButtonLink>
                    <ButtonLink href={next.url} trailingIcon="arrow-right">{next.label}</ButtonLink>
                </div>
            )}
        </AiimPage>
    );
}
