import { useState, type FormEvent } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Building2, CreditCard, Landmark, Lock, ShieldCheck, Wallet } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox, ChoiceCard, Field, Input, Select } from '@/Components/ui/Form';
import LedgerReview from '@/Components/Shop/LedgerReview';
import { AcceptedPayments, PaymentMethodList, type PaymentRegister } from '@/Components/PaymentOptions';
import { FlowSteps, ShopCrumbs, SideCard, TrustStrip, zar } from '@/Components/Shop/Bits';
import { AfterPaymentCard, HelpCard, OrderReferenceCard, OrderSummaryCard, PaymentSummaryCard } from '@/Components/Shop/CheckoutParts';
import type { Order, Payment as PaymentRecord, SharedProps, Totals } from '@/types';

type Method = 'card' | 'eft' | 'wallet';

interface Props {
    order: Order;
    feeOptions: Record<Method, Totals>;
    lastPayment: PaymentRecord | null;
    paymentOptions: PaymentRegister;
    /** The 54 African countries (canonical register) plus "Other". */
    countries?: string[];
}

const METHODS: { key: Method; title: string; body: string; icon: typeof CreditCard; speed: string; badge?: string }[] = [
    { key: 'card', title: 'Card (Visa / Mastercard)', body: 'Pay securely using your Visa or Mastercard. Instant confirmation.', icon: CreditCard, speed: 'Instant', badge: 'Recommended' },
    { key: 'eft', title: 'EFT / Bank Transfer', body: 'Make a direct payment from your bank account. Reference will be provided.', icon: Landmark, speed: '1-2 Business Days' },
    { key: 'wallet', title: 'Wallet / Secure Platform Payment', body: 'Pay using your TBCA Wallet balance or secure platform payment.', icon: Wallet, speed: 'Instant' },
];

function formatCard(value: string): string {
    return value.replace(/\D/g, '').slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
    const d = value.replace(/\D/g, '').slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
}

export default function Payment({ order, feeOptions, lastPayment, paymentOptions, countries = ['South Africa', 'Other'] }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const user = auth.user;
    const billing = order.billing ?? {};
    const failed = lastPayment?.status === 'failed';
    const pending = lastPayment?.status === 'pending';
    const [stage, setStage] = useState<'review' | 'pay'>(failed || pending ? 'pay' : 'review');

    const form = useForm({
        method: (lastPayment?.method ?? 'card') as Method,
        card_name: billing.name ?? user?.name ?? '',
        card_number: '',
        expiry: '',
        cvv: '',
        billing_name: billing.name ?? user?.name ?? '',
        billing_email: billing.email ?? user?.email ?? '',
        billing_phone: billing.phone ?? user?.phone ?? '',
        billing_company: billing.company ?? user?.company ?? '',
        billing_address: billing.address ?? '',
        billing_country: billing.country ?? 'South Africa',
        accept_terms: false,
    });

    const totals = feeOptions[form.data.method];
    const errors = form.errors as Record<string, string | undefined>;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(`/checkout/${order.reference}/pay`, { preserveScroll: true });
    };

    const title = (order.meta?.title as string | undefined) ?? (order.items?.[0]?.name ?? 'your order');

    return (
        <>
            <Head title={stage === 'review' ? 'Four-Ledger Order Review' : 'Complete Your Payment'} />

            <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
                <div className="pointer-events-none absolute inset-0 motif-glow opacity-60" aria-hidden="true" />
                <div className="container-tbca relative py-7">
                    <ShopCrumbs items={[{ label: 'Online Shop', href: '/shop' }, { label: 'Basket', href: '/basket' }, { label: stage === 'review' ? 'Four-Ledger Order Review' : 'Payment Method Selection' }]} />
                    <div className="flex flex-wrap items-center gap-5">
                        <span className="hidden size-16 items-center justify-center rounded-[10px] border-2 border-gold-500 text-gold-400 sm:flex" aria-hidden="true">
                            <CreditCard className="size-8" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <h1 className="font-serif text-[1.75rem] font-semibold md:text-[2.25rem]">{stage === 'review' ? 'Four-Ledger Order Review' : 'Complete Your Payment'}</h1>
                            <p className="mt-1 text-sm text-ink-200">
                                {stage === 'review' ? "Confirm your order and allocation across TBCA's four-ledger ecosystem." : `Secure your order and confirm payment for ${title}.`}
                            </p>
                            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-parchment-200">
                                <li className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-gold-400" aria-hidden="true" /> {user ? 'Existing Customer' : 'Guest Checkout'}</li>
                                <li className="inline-flex items-center gap-1.5"><Lock className="size-4 text-gold-400" aria-hidden="true" /> Secure Payment</li>
                                <li className="inline-flex items-center gap-1.5"><Building2 className="size-4 text-gold-400" aria-hidden="true" /> Human Reviewed</li>
                            </ul>
                        </div>
                        <div className="w-full max-w-md lg:w-80">
                            <FlowSteps
                                current={stage === 'review' ? 3 : 4}
                                done={stage === 'review' ? 2 : 3}
                                steps={[{ title: 'Selection' }, { title: 'Licence & Use' }, { title: 'Order Review' }, { title: 'Payment' }]}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="container-tbca py-6 md:py-8">
                {(failed || pending) && (
                    <div role="alert" className="mb-5 flex gap-3 rounded-[8px] border border-risk-500/40 bg-risk-50 p-4 text-sm text-risk-700">
                        <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                        <div>
                            <p className="font-semibold">{failed ? 'Your last payment attempt was not successful.' : 'Your last payment is still pending.'}</p>
                            <p className="text-xs">
                                {lastPayment?.failure_reason ?? (pending ? 'You can wait for confirmation or try another method.' : 'Please try another card or payment method.')} No charge was completed for this order.
                            </p>
                        </div>
                    </div>
                )}

                {stage === 'review' ? (
                    <div className="grid gap-6 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <LedgerReview order={order} totals={totals} />
                        </div>
                        <aside className="space-y-4 lg:col-span-4">
                            <OrderSummaryCard order={order} totals={totals} editHref="/basket" />
                            <Button type="button" size="lg" className="w-full" onClick={() => setStage('pay')}>
                                <Lock className="size-4" /> Place Secure Order
                            </Button>
                            <SideCard title="Why Buy with TBCA?">
                                <ul className="space-y-1.5 text-[0.8125rem] text-ink-700">
                                    {['Transparent pricing', 'Secure, trusted execution', 'Evidence-backed delivery', 'Human expertise + AI efficiency'].map((t) => (
                                        <li key={t}>✓ {t}</li>
                                    ))}
                                </ul>
                            </SideCard>
                        </aside>
                    </div>
                ) : (
                    <form onSubmit={submit} noValidate className="grid gap-6 lg:grid-cols-12">
                        <div className="min-w-0 space-y-5 lg:col-span-8">
                            <div className="grid gap-5 xl:grid-cols-2">
                                <SideCard title="1. Choose Payment Method">
                                    <div role="radiogroup" aria-label="Payment method" className="space-y-2">
                                        {METHODS.map((m) => {
                                            const fee = feeOptions[m.key];
                                            return (
                                                <ChoiceCard
                                                    key={m.key}
                                                    selected={form.data.method === m.key}
                                                    onSelect={() => form.setData('method', m.key)}
                                                    icon={<m.icon className="size-5" />}
                                                    title={
                                                        <span className="flex flex-wrap items-center gap-1.5">
                                                            {m.title}
                                                            {m.badge && <span className="rounded-full bg-verified-50 px-1.5 text-[0.625rem] font-semibold text-verified-700">{m.badge}</span>}
                                                        </span>
                                                    }
                                                    description={`${m.body} ${m.speed}.`}
                                                    aside={<span className="text-[0.6875rem] font-medium text-ink-500">{fee.bank > 0 ? `+ ${zar(fee.bank)} bank` : 'No additional fee'}</span>}
                                                />
                                            );
                                        })}
                                    </div>
                                    {errors.method && <p className="mt-2 text-xs text-risk-500">{errors.method}</p>}
                                    <details className="mt-3 rounded-[6px] border border-parchment-400 p-3 text-[0.8125rem]">
                                        <summary className="cursor-pointer font-semibold text-ink-800">More payment options coming soon</summary>
                                        <p className="mt-2 text-xs text-ink-500">{paymentOptions.note}</p>
                                        <PaymentMethodList register={paymentOptions} className="mt-2 sm:grid-cols-1" />
                                    </details>
                                </SideCard>

                                <SideCard title={form.data.method === 'card' ? '2. Card Details' : form.data.method === 'eft' ? '2. EFT Instructions' : '2. Wallet Payment'}>
                                    {form.data.method === 'card' && (
                                        <div className="space-y-3">
                                            <Field label="Name on card" error={errors.card_name} required>
                                                {(id) => <Input id={id} autoComplete="cc-name" value={form.data.card_name} invalid={!!errors.card_name} onChange={(e) => form.setData('card_name', e.target.value)} />}
                                            </Field>
                                            <Field label="Card number" error={errors.card_number} required hint="Test cards: ending 0002 declines, 0119 goes to pending.">
                                                {(id) => <Input id={id} inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={form.data.card_number} invalid={!!errors.card_number} onChange={(e) => form.setData('card_number', formatCard(e.target.value))} />}
                                            </Field>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Field label="Expiry date" error={errors.expiry} required>
                                                    {(id) => <Input id={id} inputMode="numeric" autoComplete="cc-exp" placeholder="MM / YY" value={form.data.expiry} invalid={!!errors.expiry} onChange={(e) => form.setData('expiry', formatExpiry(e.target.value))} />}
                                                </Field>
                                                <Field label="CVV" error={errors.cvv} required>
                                                    {(id) => <Input id={id} inputMode="numeric" autoComplete="cc-csc" placeholder="123" value={form.data.cvv} invalid={!!errors.cvv} onChange={(e) => form.setData('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))} />}
                                                </Field>
                                            </div>
                                        </div>
                                    )}
                                    {form.data.method === 'eft' && (
                                        <div className="space-y-3 text-sm text-ink-700">
                                            <p>Pay by EFT using the bank details below. Use your order reference as the payment reference so we can match your payment.</p>
                                            <dl className="divide-y divide-parchment-300 rounded-[6px] border border-parchment-400 text-[0.8125rem]">
                                                {[
                                                    ['Account name', 'The Business Clinic.Africa (Pty) Ltd'],
                                                    ['Bank', 'Standard Bank'],
                                                    ['Account number', '012 345 678 9'],
                                                    ['Branch code', '051001'],
                                                    ['Reference', order.reference],
                                                    ['Amount', zar(feeOptions.eft.total)],
                                                ].map(([k, v]) => (
                                                    <div key={k} className="flex justify-between gap-3 px-3 py-2">
                                                        <dt className="text-ink-500">{k}</dt>
                                                        <dd className={k === 'Reference' ? 'font-mono font-semibold text-ink-900' : 'font-semibold text-ink-900'}>{v}</dd>
                                                    </div>
                                                ))}
                                            </dl>
                                            <p className="text-xs text-ink-500">EFT payments clear in 1-2 business days. Your order stays pending until the payment is reconciled.</p>
                                        </div>
                                    )}
                                    {form.data.method === 'wallet' && (
                                        <p className="text-sm text-ink-700">Your TBCA Wallet will be debited {zar(feeOptions.wallet.total)} on confirmation. No card details are needed.</p>
                                    )}
                                </SideCard>
                            </div>

                            <SideCard
                                title="3. Billing Contact"
                                action={user ? <span className="rounded-full bg-verified-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-verified-700">Existing Customer</span> : undefined}
                            >
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Full name" error={errors.billing_name} required>
                                        {(id) => <Input id={id} autoComplete="name" value={form.data.billing_name} invalid={!!errors.billing_name} onChange={(e) => form.setData('billing_name', e.target.value)} />}
                                    </Field>
                                    <Field label="Billing email" error={errors.billing_email} required>
                                        {(id) => <Input id={id} type="email" autoComplete="email" value={form.data.billing_email} invalid={!!errors.billing_email} onChange={(e) => form.setData('billing_email', e.target.value)} />}
                                    </Field>
                                    <Field label="Mobile number" error={errors.billing_phone}>
                                        {(id) => <Input id={id} type="tel" autoComplete="tel" value={form.data.billing_phone} onChange={(e) => form.setData('billing_phone', e.target.value)} />}
                                    </Field>
                                    <Field label="Company" error={errors.billing_company}>
                                        {(id) => <Input id={id} autoComplete="organization" value={form.data.billing_company} onChange={(e) => form.setData('billing_company', e.target.value)} />}
                                    </Field>
                                    <Field label="Billing address" error={errors.billing_address}>
                                        {(id) => <Input id={id} autoComplete="street-address" value={form.data.billing_address} onChange={(e) => form.setData('billing_address', e.target.value)} />}
                                    </Field>
                                    <Field label="Country" error={errors.billing_country}>
                                        {(id) => <Select id={id} options={countries} value={form.data.billing_country} onChange={(e) => form.setData('billing_country', e.target.value)} />}
                                    </Field>
                                </div>
                                <div className="mt-4">
                                    <Checkbox
                                        checked={form.data.accept_terms}
                                        onChange={(e) => form.setData('accept_terms', e.target.checked)}
                                        label={<>I agree to the <a href="/terms" className="text-gold-700 underline">Terms of Service</a> and <a href="/policies/refund-and-cancellation" className="text-gold-700 underline">Refund Policy</a>.</>}
                                    />
                                    {errors.accept_terms && <p role="alert" className="mt-1 text-xs font-medium text-risk-500">{errors.accept_terms}</p>}
                                </div>
                            </SideCard>

                            <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4">
                                <ShieldCheck className="size-6 text-gold-700" aria-hidden="true" />
                                <p className="flex-1 text-xs text-ink-700">
                                    <span className="block text-sm font-semibold text-ink-900">Secure & Trusted</span>
                                    PCI-aligned secure checkout with 256-bit encryption. Your card details are never stored on our servers.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <Button type="button" variant="outline" onClick={() => setStage('review')}>
                                    <ArrowLeft className="size-4" /> Back to Order Review
                                </Button>
                                <Button type="submit" size="lg" disabled={form.processing} className="min-w-56">
                                    <Lock className="size-4" /> {form.processing ? 'Processing...' : form.data.method === 'eft' ? `Confirm EFT of ${zar(totals.total)}` : `Pay Now ${zar(totals.total)}`}
                                </Button>
                            </div>
                        </div>

                        <aside className="space-y-4 lg:col-span-4">
                            <PaymentSummaryCard order={order} totals={totals} />
                            <SideCard title="We Accept">
                                <AcceptedPayments register={paymentOptions} />
                            </SideCard>
                            <OrderReferenceCard reference={order.reference} />
                            <AfterPaymentCard />
                            <HelpCard />
                        </aside>
                    </form>
                )}
            </div>
            <TrustStrip />
        </>
    );
}
