import type { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, ArrowRight, CreditCard, Info, Lock, ShieldCheck } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { Checkbox, Field, Input, Select } from '@/Components/ui/Form';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { FlowSteps, NextSteps, ShopCrumbs, SideCard, TrustStrip, zar2 } from '@/Components/Shop/Bits';
import type { Plan, ProductDetail } from '@/types/shop';

interface Props {
    product: ProductDetail;
    plan: Plan;
    amounts: { excl: number; vat: number; incl: number };
    nextBilling: string;
    previewReference: string;
    consents: Record<string, string>;
    defaults: { account_holder: string | null; email: string | null; start_date: string };
}

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });

export default function Mandate({ product, plan, amounts, nextBilling, previewReference, consents, defaults }: Props) {
    const form = useForm({
        product: product.slug, plan: plan.key, account_holder: defaults.account_holder ?? '', email: defaults.email ?? '', start_date: defaults.start_date, method: 'card',
        consents: Object.fromEntries(Object.keys(consents).map((k) => [k, false])) as Record<string, boolean>, accept_terms: false,
    });
    const e = form.errors as Record<string, string | undefined>;
    const consentError = Object.entries(e).find(([k]) => k.startsWith('consents'))?.[1];
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post('/shop/mandate'); };
    const unit = product.price_unit ?? 'month';

    return (
        <>
            <Head title="Subscription Mandate Capture" />
            <div className="container-tbca py-6">
                <ShopCrumbs tone="light" items={[{ label: 'Online Shop', href: '/shop' }, { label: 'Checkout' }, { label: 'Order Review', href: product.url }, { label: 'Subscription Mandate Capture' }]} />
                <div className="grid gap-6 lg:grid-cols-12">
                    <form onSubmit={submit} noValidate className="min-w-0 space-y-5 lg:col-span-8">
                        <div className="flex flex-wrap items-center gap-3"><h1 className="font-serif text-[1.875rem] font-semibold text-ink-900">Subscription Mandate Capture</h1><span className="inline-flex items-center gap-1 text-sm font-semibold text-verified-700"><Lock className="size-4" /> Secure Checkout</span></div>
                        <p className="-mt-3 text-sm text-ink-600">To activate your subscription, we require your explicit mandate to process recurring payments in accordance with the Payment Services Act 2019 (RSA).</p>
                        <FlowSteps current={2} done={1} steps={[{ title: 'Order Review', sub: 'Completed' }, { title: 'Mandate Capture', sub: 'In Progress' }, { title: 'Payment Method', sub: 'Next' }, { title: 'Confirm & Pay', sub: 'Next' }, { title: 'Activation', sub: 'Final Step' }]} />

                        <SideCard title="1. Subscription Summary">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="flex gap-3"><ShopIcon name={product.icon} size="md" /><div><p className="font-semibold text-ink-900">{product.name}</p><p className="text-xs font-semibold">{plan.name}</p><p className="mt-1 text-xs text-ink-500">{product.tagline}</p></div></div>
                                <dl className="space-y-1 text-xs"><dt className="text-ink-500">Billing Interval</dt><dd className="font-semibold">{unit === 'week' ? 'Weekly' : 'Monthly'}</dd><dt className="text-ink-500">Billing Day</dt><dd className="font-semibold">{new Date(form.data.start_date).getDate() || 1} of each {unit}</dd><dt className="text-ink-500">Next Billing Date</dt><dd className="font-semibold">{fmt(nextBilling)}</dd></dl>
                                <dl className="space-y-1 text-right text-xs"><dd className="text-lg font-bold text-verified-700">{zar2(amounts.excl)} / {unit}</dd><dt className="text-ink-500">Excl. VAT</dt><dd>VAT (15%) {zar2(amounts.vat)}</dd><dd className="text-base font-bold text-verified-700">Total {zar2(amounts.incl)} / {unit}</dd></dl>
                            </div>
                        </SideCard>

                        <SideCard title="2. Mandate Details">
                            <div className="grid gap-5 md:grid-cols-3">
                                <div className="space-y-3">
                                    <Field label="Mandate Type">{(id) => <Select id={id} disabled options={['Recurring Subscription Mandate']} value="Recurring Subscription Mandate" />}</Field>
                                    <Field label="Mandate Reference (Auto-generated)">{(id) => <Input id={id} readOnly value={previewReference} />}</Field>
                                    <Field label="Account Holder Name" error={e.account_holder} required>{(id) => <Input id={id} value={form.data.account_holder} onChange={(x) => form.setData('account_holder', x.target.value)} />}</Field>
                                    <Field label="Account Holder Email" hint="Mandate confirmations will be sent here" error={e.email} required>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(x) => form.setData('email', x.target.value)} />}</Field>
                                </div>
                                <div className="space-y-3 text-xs text-ink-700">
                                    <p className="font-semibold text-ink-900">I (the account holder) hereby authorise:</p>
                                    <p className="rounded-[6px] border border-verified-500/30 bg-verified-50 p-3"><strong className="block text-verified-700">The Business Clinic.Africa (Pty) Ltd</strong>FSP No. 51037 | NCRCP No. NCRCP 1387</p>
                                    <p>to debit my account on a recurring basis for the subscription amount indicated, in accordance with the Payment Services Act 2019.</p>
                                    <Field label="Start Date" error={e.start_date} required>{(id) => <Input id={id} type="date" value={form.data.start_date} onChange={(x) => form.setData('start_date', x.target.value)} />}</Field>
                                    <p>Mandate Status <span className="ml-1 rounded bg-verified-50 px-2 py-0.5 font-semibold text-verified-700">New Mandate</span></p>
                                </div>
                                <fieldset className="space-y-2">
                                    <legend className="mb-2 text-xs font-semibold text-ink-900">I understand and agree that:</legend>
                                    {Object.entries(consents).map(([k, label]) => <Checkbox key={k} label={<span className="text-xs">{label}</span>} checked={form.data.consents[k]} onChange={(x) => form.setData('consents', { ...form.data.consents, [k]: x.target.checked })} />)}
                                    {consentError && <p role="alert" className="text-xs text-risk-500">{consentError}</p>}
                                </fieldset>
                            </div>
                        </SideCard>

                        <SideCard title="3. Payment Method for Recurring Payments">
                            <p className="mb-3 flex gap-2 rounded-[6px] bg-controlled-50 p-2 text-xs text-controlled-700"><Info className="size-4 shrink-0" aria-hidden="true" /> The payment method you select will be used for all future subscription renewals until you update it.</p>
                            <div className="flex items-center gap-3 rounded-[8px] border border-controlled-500 bg-controlled-50/50 p-4">
                                <input type="radio" checked readOnly aria-label="Card (Visa / Mastercard)" className="accent-controlled-700" />
                                <CreditCard className="size-5" aria-hidden="true" />
                                <p className="flex-1 text-sm"><strong>Card (Visa / Mastercard)</strong> <span className="rounded bg-verified-50 px-1.5 text-[0.625rem] font-semibold text-verified-700">Recommended</span><span className="block text-xs text-ink-500">Secure recurring payments via card. We will request a mandate token from your bank on the next step.</span></p>
                                <span className="text-xs font-bold">VISA · Mastercard</span>
                            </div>
                            <Checkbox className="mt-4" checked={form.data.accept_terms} onChange={(x) => form.setData('accept_terms', x.target.checked)} label="I confirm I have read and agree to the Subscription Terms, Mandate Terms and Privacy Policy." />
                            {e.accept_terms && <p role="alert" className="mt-1 text-xs text-risk-500">{e.accept_terms}</p>}
                        </SideCard>

                        <div className="flex flex-wrap justify-between gap-3">
                            <ButtonLink href={product.url} variant="outline"><ArrowLeft className="size-4" /> Back to Order Review</ButtonLink>
                            <button type="submit" disabled={form.processing} className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-verified-700 px-6 text-sm font-semibold text-white disabled:opacity-50">Continue to Payment Method <ArrowRight className="size-4" /></button>
                        </div>
                    </form>

                    <aside className="space-y-4 lg:col-span-4">
                        <SideCard title="Order Summary">
                            <div className="flex gap-3"><ShopIcon name={product.icon} size="sm" /><div className="flex-1 text-xs"><p className="font-semibold text-ink-900">{product.name}</p><p>{plan.name}</p>{plan.licence && <p className="text-ink-500">Licence: {plan.licence}</p>}</div><span className="text-sm font-semibold">{zar2(amounts.excl)}</span></div>
                            <p className="mt-2 flex justify-between text-xs"><span>VAT (15%)</span><span>{zar2(amounts.vat)}</span></p>
                            <p className="mt-2 flex justify-between border-t border-parchment-300 pt-2 font-semibold">Total (Incl. VAT)<span className="text-verified-700">{zar2(amounts.incl)} / {unit}</span></p>
                        </SideCard>
                        <div className="flex gap-3 rounded-[8px] border border-attested-500/40 bg-attested-50 p-4 text-xs text-ink-700"><AlertTriangle className="size-5 shrink-0 text-attested-700" aria-hidden="true" /><p><strong className="block text-[0.8125rem] text-ink-900">Recurring Charge Notice</strong>You will be charged {zar2(amounts.incl)} (incl. VAT) each {unit} starting {fmt(form.data.start_date || nextBilling)}. The first period is paid now at checkout. You will receive an email notification before each charge.</p></div>
                        <div className="flex gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4 text-xs text-ink-700"><ShieldCheck className="size-5 shrink-0 text-controlled-700" aria-hidden="true" /><p><strong className="block text-[0.8125rem] text-ink-900">Mandate Compliance</strong>We comply with the Payment Services Act 2019 (RSA). Your mandate is encrypted and securely stored. You can manage or cancel this mandate from your Client Portal at any time.</p></div>
                        <SideCard title="What happens next?"><NextSteps steps={[['Mandate Capture', 'You are authorising recurring payments.'], ['Payment Method', 'Select or confirm your payment method.'], ['Confirm & Pay', 'Review and make your first payment.'], ['Activation', 'Your subscription will be activated.']]} /></SideCard>
                    </aside>
                </div>
            </div>
            <TrustStrip items={[{ title: 'Secure Payments', body: 'Bank-grade security' }, { title: 'Transparent Pricing', body: 'No hidden fees' }, { title: 'POPIA Compliant', body: 'Your data is protected' }, { title: 'Trusted by Businesses Across Africa', body: 'Proven. Ethical. Independent.' }]} />
        </>
    );
}
