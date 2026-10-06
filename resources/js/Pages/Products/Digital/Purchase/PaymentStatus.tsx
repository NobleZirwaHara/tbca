import { useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { CircleX, Clock, FileText, Info, Lock, Mail, MessageCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { DarkCard, DpCover, DpStatus, FLOW_TRUST, TrustBand } from '@/Components/Products/Digital/Ui';
import { LabelValues } from '@/Components/Products/Shared';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import type { DpOrder } from '@/Components/Products/Digital/types';

export const zar = (n: number) => `ZAR ${n.toLocaleString('en-ZA', { minimumFractionDigits: 2 }).replace(/\s/g, ',')}`;

export function OrderSummaryCard({ order, paidLabel = 'Amount Paid' }: { order: DpOrder; paidLabel?: string }) {
    const e = order.entitlements[0];
    return (
        <DarkCard title="Order Summary">
            <div className="flex gap-3">
                {e && <DpCover name={e.product.name} type={e.product.type} tone={e.product.tone} size="sm" />}
                <p className="text-sm font-semibold text-ink-900">{order.items[0]?.name}</p>
            </div>
            {e && (
                <LabelValues
                    className="mt-2"
                    rows={[
                        { label: 'Licence', value: e.licenceLabel },
                        { label: 'Version', value: e.version?.display ?? '—' },
                        { label: 'Format', value: e.format },
                        { label: 'Language', value: e.languageLabel },
                        { label: 'Jurisdiction', value: e.jurisdiction },
                    ]}
                />
            )}
            <p className="mt-3 text-[0.6875rem] text-ink-500">Source Price (ZAR)</p>
            <p className="font-serif text-xl font-semibold">{zar(order.subtotal)}</p>
            <LabelValues
                rows={[
                    { label: 'VAT (15%)', value: zar(order.vat) },
                    { label: 'Total (VAT Exclusive)', value: zar(order.subtotal), strong: true },
                    { label: 'Total VAT', value: zar(order.vat) },
                    { label: 'Platform & bank charges', value: zar(order.fees) },
                ]}
            />
            <div className="mt-3 flex items-baseline justify-between border-t border-parchment-300 pt-3">
                <span className="text-sm font-bold text-verified-700">{paidLabel}</span>
                <span className="font-serif text-2xl font-semibold text-verified-700">{zar(order.total)}</span>
            </div>
        </DarkCard>
    );
}

export function NeedHelp() {
    return (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Need Help?</h2>
            <ul className="divide-y divide-parchment-300 text-xs">
                <li>
                    <button type="button" onClick={() => openAskQuestion({ subject: 'Digital Products support', section: 'digital-products' })} className="flex w-full items-center gap-3 py-2 text-left">
                        <MessageCircle className="size-5 text-gold-600" aria-hidden="true" />
                        <span className="flex-1"><strong className="block text-ink-900">Ask a Question</strong>Get assistance from our support team.</span>
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </button>
                </li>
                <li>
                    <a href="https://wa.me/27608011365" className="flex items-center gap-3 py-2" target="_blank" rel="noreferrer">
                        <MessageCircle className="size-5 text-verified-500" aria-hidden="true" />
                        <span className="flex-1"><strong className="block text-ink-900">WhatsApp Support</strong>Chat with us on WhatsApp.</span>
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </a>
                </li>
                <li>
                    <a href="mailto:support@thebusinessclinic.africa" className="flex items-center gap-3 py-2">
                        <Mail className="size-5 text-gold-600" aria-hidden="true" />
                        <span className="flex-1"><strong className="block text-ink-900">Email Support</strong>support@thebusinessclinic.africa</span>
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </a>
                </li>
            </ul>
        </section>
    );
}

export default function PaymentStatus({
    order,
    state,
    lastPayment,
}: {
    order: DpOrder;
    state: 'processing' | 'awaiting' | 'failed';
    lastPayment: { reference: string; method: string; status: string; failure_reason: string | null; created_at: string } | null;
}) {
    // Poll the provider status while the payment is still being verified (external system sync).
    useEffect(() => {
        if (state !== 'processing') return;
        const id = window.setInterval(() => router.reload({ only: ['order', 'state', 'lastPayment'] }), 5000);
        return () => window.clearInterval(id);
    }, [state]);

    const steps = [
        { label: 'Payment Initiated', sub: order.createdAt, done: true },
        { label: 'Verifying', sub: state === 'failed' ? 'Failed' : state === 'processing' ? 'In progress' : 'Pending', done: false, active: state === 'processing' },
        { label: 'Confirming', sub: 'Pending', done: false },
        { label: 'Entitlement Creation', sub: 'Pending', done: false },
    ];

    return (
        <>
            <Head title="Payment Result" />
            <div className="container-tbca space-y-5 py-6">
                <Breadcrumbs items={[{ label: 'Digital Products', href: '/digital-products' }, { label: `Order ${order.reference}` }, { label: 'Payment Result' }]} />
                <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-4">
                        <div>
                            <h1 className="font-serif text-3xl font-semibold text-ink-900">Payment Result</h1>
                            {state === 'failed' ? (
                                <p className="mt-2 text-sm font-semibold text-risk-700">Your payment was not successful. No entitlement has been created.</p>
                            ) : state === 'awaiting' ? (
                                <p className="mt-2 text-sm font-semibold text-ink-900">Your order is created and awaiting payment.</p>
                            ) : (
                                <>
                                    <p className="mt-2 text-sm font-semibold text-ink-900">We are verifying your payment. This usually takes a few seconds.</p>
                                    <p className="text-xs text-ink-600">Do not pay again while your payment status is processing.</p>
                                </>
                            )}
                        </div>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <div className="flex flex-wrap items-center gap-5">
                                {state === 'failed' ? <CircleX className="size-16 text-risk-500" aria-hidden="true" /> : <Clock className="size-16 text-gold-600" aria-hidden="true" />}
                                <div>
                                    <h2 className="text-base font-bold text-ink-900 uppercase">{state === 'failed' ? 'Payment Failed' : state === 'awaiting' ? 'Awaiting Payment' : 'Payment Processing'}</h2>
                                    <p className="text-xs text-ink-600">
                                        {state === 'failed' ? lastPayment?.failure_reason ?? 'The payment provider declined the transaction.' : 'Your payment is being verified with our payment provider.'}
                                    </p>
                                    <p className="mt-2 inline-flex items-center gap-3 rounded-[6px] border border-gold-300 px-3 py-1.5 text-xs font-semibold">
                                        STATUS <DpStatus status={state === 'failed' ? 'failed' : state === 'awaiting' ? 'pending' : 'processing'} />
                                    </p>
                                </div>
                            </div>
                            <ol className="mt-6 grid grid-cols-4 gap-2 text-center">
                                {steps.map((s, i) => (
                                    <li key={s.label} className="relative">
                                        {i > 0 && <span className={cn('absolute top-3 right-1/2 h-0.5 w-full', s.done || s.active ? 'bg-gold-500' : 'bg-parchment-400')} aria-hidden="true" />}
                                        <span className={cn('relative z-10 mx-auto flex size-6 items-center justify-center rounded-full border-2', s.done ? 'border-gold-500 bg-gold-500' : s.active ? 'border-gold-500 bg-white' : 'border-parchment-400 bg-white')} />
                                        <p className="mt-1 text-xs font-semibold text-ink-900">{s.label}</p>
                                        <p className="text-[0.625rem] text-ink-500">{s.sub}</p>
                                    </li>
                                ))}
                            </ol>
                            <p className="mt-5 flex gap-2 rounded-[6px] border border-parchment-400 bg-parchment-100 p-3 text-xs text-ink-700">
                                <Info className="size-4 shrink-0" aria-hidden="true" />
                                {state === 'processing'
                                    ? 'We are confirming your payment. Please wait for this page to update automatically. You will be notified when verification is complete.'
                                    : 'Complete payment to create your entitlement. Payment UNKNOWN or failed never creates download access.'}
                            </p>
                            {state !== 'processing' && (
                                <Link href={order.checkoutUrl} className="mt-4 inline-flex h-10 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900">
                                    <Lock className="size-4" aria-hidden="true" /> {state === 'failed' ? 'Try another payment method' : 'Complete payment'}
                                </Link>
                            )}
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-serif text-lg font-semibold text-ink-900">What happens next?</h2>
                            <div className="mt-3 grid gap-4 md:grid-cols-3">
                                {[
                                    [ShieldCheck, 'If payment is verified', 'Your entitlement will be created and you will be taken to your order confirmation page.'],
                                    [Clock, 'If verification takes longer', 'We will notify you by email and in your Client Portal once your payment status is confirmed.'],
                                    [CircleX, 'If payment fails', 'No entitlement will be created. You will receive instructions for the next steps.'],
                                ].map(([Icon, t, b]) => {
                                    const I = Icon as typeof Clock;
                                    return (
                                        <div key={t as string} className="flex gap-3">
                                            <I className="size-8 shrink-0 text-gold-600" aria-hidden="true" />
                                            <p className="text-xs text-ink-600"><strong className="block text-ink-900">{t as string}</strong>{b as string}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </div>
                    <aside className="space-y-4">
                        <OrderSummaryCard order={order} paidLabel={state === 'failed' ? 'Amount Due' : 'Amount Paid'} />
                        <NeedHelp />
                        <p className="flex gap-2 rounded-[8px] border border-verified-500/30 bg-verified-50 p-3 text-xs text-verified-700">
                            <Lock className="size-4 shrink-0" aria-hidden="true" /> <span><strong className="block">100% Secure Transaction</strong>Your payment is encrypted and protected.</span>
                        </p>
                        <p className="flex items-center gap-1 text-[0.6875rem] text-ink-500"><FileText className="size-3" aria-hidden="true" /> Order {order.reference}</p>
                    </aside>
                </div>
                <TrustBand items={FLOW_TRUST} />
            </div>
        </>
    );
}
