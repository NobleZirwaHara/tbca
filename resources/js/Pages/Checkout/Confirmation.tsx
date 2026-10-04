import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Download, Hourglass, Info, KeyRound, Landmark, Mail, ShieldCheck, Users, Gem, Handshake } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { NextSteps, ShopCrumbs, SideCard, TrustStrip, zar } from '@/Components/Shop/Bits';
import { HelpCard, OrderReferenceCard, OrderSummaryCard } from '@/Components/Shop/CheckoutParts';
import type { Order, SharedProps } from '@/types';

const LEDGERS = [
    { name: 'QBO - Client Ledger', body: 'Client revenue recognition', icon: Landmark },
    { name: 'Trust Ledger', body: 'Compliance and risk controls', icon: Handshake },
    { name: 'Client Ledger', body: 'Engagement and SLA tracking', icon: Users },
    { name: 'Practice Ledger', body: 'Resource cost and margin', icon: Gem },
];

function when(iso?: string | null): string {
    return iso ? new Date(iso).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-';
}

export default function Confirmation({ order }: { order: Order }) {
    const { auth } = usePage<SharedProps>().props;
    const paid = order.status === 'paid';
    const payment = (order.payments ?? []).filter((p) => p.status === 'succeeded').at(-1) ?? (order.payments ?? []).at(-1);
    const email = order.billing?.email ?? auth.user?.email ?? 'your email address';
    const returnUrl = typeof order.meta?.return_url === 'string' ? order.meta.return_url : null;
    const bank = Math.max(0, order.fees_zar - (order.subtotal_zar > 0 ? 250 : 0));

    if (!paid) {
        return (
            <>
                <Head title="Order Not Yet Confirmed" />
                <div className="container-tbca py-10">
                    <div className="mx-auto max-w-2xl rounded-[10px] border border-attested-500/40 bg-white p-8 text-center">
                        <AlertTriangle className="mx-auto size-10 text-attested-500" aria-hidden="true" />
                        <h1 className="mt-3 font-serif text-2xl font-semibold text-ink-900">Payment not yet confirmed</h1>
                        <p className="mt-2 text-sm text-ink-600">
                            Order <span className="font-mono">{order.reference}</span> is <StatusPill status={order.status} />. Entitlements are only activated after payment is verified.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            <ButtonLink href={`/checkout/${order.reference}`}>Complete Payment</ButtonLink>
                            <ButtonLink href="/basket" variant="outline">Back to Basket</ButtonLink>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Order Confirmed" />

            <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
                <div className="pointer-events-none absolute inset-0 motif-glow opacity-60" aria-hidden="true" />
                <div className="container-tbca relative py-7">
                    <ShopCrumbs items={[{ label: 'Online Shop', href: '/shop' }, { label: 'Checkout' }, { label: 'Order Confirmation' }]} />
                    <div className="flex flex-wrap items-center gap-5">
                        <ShieldCheck className="size-16 shrink-0 text-verified-500" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                            <h1 className="font-serif text-[1.75rem] font-semibold md:text-[2.25rem]">Order Confirmed!</h1>
                            <p className="mt-1 max-w-2xl text-sm text-ink-200">Thank you! Your payment has been received. Your purchase has been confirmed and is being prepared.</p>
                            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-parchment-200">
                                <li className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" /> Payment Received</li>
                                <li className="inline-flex items-center gap-1.5"><Hourglass className="size-4 text-gold-400" aria-hidden="true" /> Ledger Posting</li>
                                <li className="inline-flex items-center gap-1.5"><Mail className="size-4 text-gold-400" aria-hidden="true" /> Next Steps Sent</li>
                            </ul>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <ButtonLink href={`/shop/receipt/${order.reference}`} variant="outline-light" size="sm"><Download className="size-4" /> Download Receipt (PDF)</ButtonLink>
                            <ButtonLink href="/portal" variant="outline-light" size="sm">View Order in Portal</ButtonLink>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container-tbca py-6 md:py-8">
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="min-w-0 space-y-5 lg:col-span-8">
                        <div className="grid gap-5 rounded-[10px] border border-verified-500/40 bg-verified-50/60 p-5 md:grid-cols-3">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="size-12 shrink-0 text-verified-700" aria-hidden="true" />
                                <div>
                                    <p className="font-semibold text-ink-900">Your order has been successfully received.</p>
                                    <p className="mt-1 text-xs text-ink-600">We'll send you an email confirmation shortly with your order details.</p>
                                </div>
                            </div>
                            <dl className="space-y-1.5 text-sm md:border-l md:border-verified-500/30 md:pl-5">
                                <dt className="text-xs text-ink-500">Order Reference</dt>
                                <dd className="font-mono text-lg font-bold text-verified-700">{order.reference}</dd>
                                <dt className="text-xs text-ink-500">Order Date</dt>
                                <dd>{when(order.paid_at ?? order.created_at)}</dd>
                                <dt className="text-xs text-ink-500">Payment Status</dt>
                                <dd><StatusPill status="paid" /></dd>
                            </dl>
                            <div className="md:border-l md:border-verified-500/30 md:pl-5">
                                <p className="text-xs text-ink-500">Accounting Status</p>
                                <p className="text-lg font-semibold text-verified-700">Accounting Pending</p>
                                <p className="mt-1 text-xs text-ink-600">Your payment has been received and is awaiting posting to our ledgers. Access is activated once posting completes, typically within 1 business day.</p>
                            </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <SideCard title="What you purchased">
                                <ul className="divide-y divide-parchment-300">
                                    {(order.items ?? []).map((item) => (
                                        <li key={item.id} className="flex gap-3 py-3 first:pt-0">
                                            <ShopIcon name={item.item_type === 'digital-product' ? 'file-text' : item.item_type === 'subscription' ? 'calendar-check' : 'target'} size="sm" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[0.8125rem] font-semibold text-ink-900">{item.name}</p>
                                                <p className="text-xs text-ink-500">{[item.variant, `Qty ${item.quantity}`, item.item_code].filter(Boolean).join(' · ')}</p>
                                            </div>
                                            <span className="text-[0.8125rem] font-semibold">{zar(item.line_zar)}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-3 flex items-start gap-2 text-xs text-ink-500"><KeyRound className="size-4 shrink-0" aria-hidden="true" /> Access will be provided once posting is complete.</p>
                                <ButtonLink href={`/shop/entitlements/${order.reference}`} size="sm" className="mt-3 w-full">Activate My Access</ButtonLink>
                            </SideCard>

                            <SideCard title="Ledger Posting Status (Four-Ledger Model)">
                                <ul className="space-y-2">
                                    {LEDGERS.map((l) => (
                                        <li key={l.name} className="flex items-center gap-3 rounded-[6px] border border-parchment-400 p-2.5">
                                            <l.icon className="size-5 text-gold-700" aria-hidden="true" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[0.8125rem] font-semibold text-ink-900">{l.name}</p>
                                                <p className="text-[0.6875rem] text-ink-500">{l.body}</p>
                                            </div>
                                            <span className="text-right text-xs"><span className="block font-semibold text-attested-700">Pending</span><span className="text-ink-400">Posting in progress</span></span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-2 text-[0.6875rem] text-ink-400">We maintain complete transparency across all four ledgers.</p>
                            </SideCard>
                        </div>

                        <SideCard title="Amount Paid">
                            <dl className="grid gap-x-8 gap-y-1.5 text-[0.8125rem] sm:grid-cols-2">
                                <div className="flex justify-between"><dt className="text-ink-500">Package Total</dt><dd>{zar(order.subtotal_zar)}</dd></div>
                                <div className="flex justify-between"><dt className="text-ink-500">VAT (15%)</dt><dd>{zar(order.vat_zar)}</dd></div>
                                <div className="flex justify-between"><dt className="text-ink-500">Bank Charges</dt><dd>{zar(bank)}</dd></div>
                                <div className="flex justify-between"><dt className="text-ink-500">Platform Charges</dt><dd>{zar(order.fees_zar - bank)}</dd></div>
                            </dl>
                            <p className="mt-3 flex items-baseline justify-between border-t border-parchment-300 pt-3">
                                <span className="font-semibold">Total Paid</span>
                                <span className="text-xl font-bold text-gold-700">{zar(order.total_zar)}</span>
                            </p>
                            {payment && <p className="mt-1 text-xs text-ink-500">Payment {payment.reference} · {payment.method.toUpperCase()} · completed successfully</p>}
                        </SideCard>

                        <div className="flex gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4 text-sm text-ink-700">
                            <Info className="mt-0.5 size-5 shrink-0 text-controlled-700" aria-hidden="true" />
                            <p>A confirmation email with your receipt and order details has been sent to <strong>{email}</strong>. Please check your inbox and spam folder.</p>
                        </div>

                        {returnUrl && (
                            <p className="text-sm">
                                <Link href={returnUrl} className="font-semibold text-gold-700 hover:text-gold-800">Continue to your next step →</Link>
                            </p>
                        )}
                    </div>

                    <aside className="space-y-4 lg:col-span-4">
                        <OrderSummaryCard order={order} />
                        <SideCard title="What happens next?">
                            <NextSteps
                                steps={[
                                    ['Receipt emailed', "We'll email your receipt and order details."],
                                    ['Preparing access', "We're preparing your access and delivery."],
                                    ['Ledger posting', 'Your payment is being posted to our ledgers.'],
                                    ['Access & delivery', "You'll receive access and delivery details shortly."],
                                ]}
                            />
                        </SideCard>
                        <OrderReferenceCard reference={order.reference} note="Keep this number for your records." />
                        <HelpCard body="Our advisors are here to help if you have any questions." />
                    </aside>
                </div>
            </div>
            <TrustStrip />
        </>
    );
}
