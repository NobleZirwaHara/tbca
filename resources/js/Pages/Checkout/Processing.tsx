import { Head, Link, router, usePoll } from '@inertiajs/react';
import { CheckCircle2, Info, Loader2, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { NextSteps, ShopCrumbs, SideCard, TrustStrip, zar } from '@/Components/Shop/Bits';
import { HelpCard, OrderReferenceCard, OrderSummaryCard } from '@/Components/Shop/CheckoutParts';
import { cn } from '@/lib/cn';
import type { Order, Payment } from '@/types';

function stamp(iso?: string): string {
    return iso ? new Date(iso).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
}

export default function Processing({ order, payment }: { order: Order; payment: Payment | null }) {
    // Re-check every 5 seconds; the server redirects to the confirmation once the order is paid.
    usePoll(5000, { only: ['order', 'payment'] });

    const eft = payment?.method === 'eft';
    const steps = [
        { title: 'Payment Initiated', body: 'Your payment request has been received.', state: 'done' },
        { title: eft ? 'Awaiting EFT Transfer' : 'Authorising Payment', body: eft ? `Use reference ${order.reference} when you pay.` : (payment?.failure_reason ?? 'Communicating with your bank...'), state: 'done' },
        { title: eft ? 'Reconciling Payment' : 'Processing Payment', body: eft ? 'We match your EFT to this order (1-2 business days).' : 'Please wait while we process your payment.', state: 'active' },
        { title: 'Payment Confirmation', body: 'Finalising your order and sending confirmation.', state: 'todo' },
    ];

    return (
        <>
            <Head title="Payment Processing" />
            <div className="container-tbca py-6 md:py-8">
                <ShopCrumbs tone="light" items={[{ label: 'Online Shop', href: '/shop' }, { label: 'Checkout', href: `/checkout/${order.reference}` }, { label: 'Payment Processing' }]} />
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-serif text-2xl font-semibold text-ink-900 md:text-3xl">Payment Processing</h1>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-verified-700"><Lock className="size-4" aria-hidden="true" /> Secure Transaction</span>
                </div>
                <p className="mt-1 text-sm text-ink-500">Please do not close this window or press the back button.</p>

                <div className="mt-6 grid gap-6 lg:grid-cols-12">
                    <div className="space-y-5 lg:col-span-8">
                        <SideCard>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="text-center md:text-left" aria-live="polite">
                                    <h2 className="text-lg font-semibold text-ink-900">Your payment is being processed...</h2>
                                    <p className="text-sm text-ink-500">This may take a few moments. This page refreshes automatically.</p>
                                    <Loader2 className="mx-auto mt-8 size-14 animate-spin text-controlled-500" aria-hidden="true" />
                                    <p className="mt-4 text-center font-semibold text-controlled-700">{eft ? 'Awaiting Bank Transfer' : 'Processing Payment'}</p>
                                    <p className="text-center text-xs text-ink-500">
                                        {payment ? `${zar(payment.amount_zar)} via ${payment.method.toUpperCase()} · ${payment.reference}` : 'Please wait while we securely process your payment.'}
                                    </p>
                                </div>
                                <ol className="divide-y divide-parchment-300 rounded-[8px] border border-parchment-400">
                                    {steps.map((s, i) => (
                                        <li key={s.title} className={cn('flex items-start gap-3 p-3', s.state === 'active' && 'bg-controlled-50/60')}>
                                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold text-ink-600">{i + 1}</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[0.8125rem] font-semibold text-ink-900">{s.title}</p>
                                                <p className="text-xs text-ink-500">{s.body}</p>
                                                {s.state !== 'todo' && <p className="text-[0.6875rem] text-ink-400">{stamp(payment?.created_at)}</p>}
                                            </div>
                                            {s.state === 'done' && <CheckCircle2 className="size-5 text-verified-500" aria-label="Complete" />}
                                            {s.state === 'active' && <Loader2 className="size-5 animate-spin text-controlled-500" aria-label="In progress" />}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </SideCard>

                        <div className="flex flex-wrap gap-3">
                            <Button type="button" variant="outline" onClick={() => router.reload()}>
                                <RefreshCw className="size-4" /> Check status
                            </Button>
                            <ButtonLink href={`/checkout/${order.reference}`} variant="ghost">Try another payment method</ButtonLink>
                        </div>

                        <div className="flex gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-3 text-xs text-ink-700">
                            <Info className="size-4 shrink-0 text-controlled-700" aria-hidden="true" /> You will receive an email confirmation once your payment is successfully processed.
                        </div>
                        <div className="flex gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4 text-xs text-ink-700">
                            <ShieldCheck className="size-5 shrink-0 text-gold-700" aria-hidden="true" />
                            <span><span className="block text-sm font-semibold text-ink-900">Secure & Encrypted</span>All transactions are encrypted and PCI DSS compliant. Your payment details are never stored on our servers.</span>
                        </div>
                    </div>

                    <aside className="space-y-4 lg:col-span-4">
                        <OrderSummaryCard order={order} />
                        <OrderReferenceCard reference={order.reference} note="You will receive a confirmation email shortly." />
                        <SideCard title="What happens next?">
                            <NextSteps steps={[['Order Confirmation', "We'll email your receipt and order details."], ['Order Processing', "We'll prepare your access and delivery."], ['Access & Delivery', "You'll receive access and delivery details."]]} />
                        </SideCard>
                        <HelpCard body="If you have any questions, our advisors are here to help." />
                        <p className="text-center text-xs text-ink-400">
                            <Link href="/portal" className="hover:text-ink-700">Go to Client Portal</Link>
                        </p>
                    </aside>
                </div>
            </div>
            <TrustStrip />
        </>
    );
}
