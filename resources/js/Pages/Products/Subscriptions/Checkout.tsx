import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import { Checkbox } from '@/Components/ui/Form';
import { Stepper } from '@/Components/ui/Kit';
import { LabelValues, Notice, PageTitle, TrustRow } from '@/Components/Products/Shared';
import { Card, ClassChip, PUBLIC_TRUST, fmtDate, zar } from '@/Components/Products/Subscriptions/ui';
import type { SubPlan } from '@/Components/Products/Subscriptions/types';
import type { SharedProps } from '@/types';
import { cn } from '@/lib/cn';

interface Totals {
    subtotal: number;
    vat: number;
    platform: number;
    bank: number;
    fees: number;
    total: number;
}

interface Props {
    plan: SubPlan;
    blocker: string | null;
    interval: 'monthly' | 'annual';
    fees: { monthly: Totals | null; annual: Totals | null };
    firstPeriodEnd: { monthly: string; annual: string };
}

const BLOCKERS: Record<string, string> = {
    'SU-FAIL-QUOTE': 'This plan is priced on request. Please talk to an advisor.',
    BLOCKED_BELOW_FLOOR: 'This plan is not currently available for new subscriptions.',
    CAPACITY_HOLD: 'New subscriptions in this class are paused while review capacity is restored.',
    RECURRENCE_REVIEW_REQUIRED: 'This plan is under recurrence review and cannot be sold yet.',
};

export default function Checkout({ plan, blocker, interval, fees, firstPeriodEnd }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const form = useForm({ interval, mandate_consent: false, terms: false });
    const t = fees[form.data.interval];
    const price = form.data.interval === 'annual' ? plan.annual_zar : plan.monthly_zar;
    const period = form.data.interval === 'annual' ? 'year' : 'month';
    const errors = form.errors as Record<string, string>;

    return (
        <>
            <Head title={`Checkout: ${plan.name}`} />
            <PageTitle
                crumbs={[{ label: 'Subscriptions', href: '/subscriptions' }, { label: plan.name, href: `/subscriptions/${plan.slug}` }, { label: 'Checkout' }]}
                title="Checkout and Recurring Mandate Consent"
                lead="Confirm your plan, the recurring amount and the payment authority. Nothing is charged until you complete payment."
                aside={<div className="w-72"><Stepper steps={['Select plan', 'Review disclosure', 'Confirm & pay']} current={3} /></div>}
            />

            <section className="bg-parchment-200 py-8">
                <div className="container-tbca grid gap-6 lg:grid-cols-[1fr_340px]">
                    <div className="min-w-0 space-y-5">
                        {blocker && <Notice tone="bad" title="This plan cannot be purchased right now">{BLOCKERS[blocker] ?? blocker}</Notice>}

                        <Card title="1. Billing interval">
                            <div className="grid gap-2 sm:grid-cols-2">
                                {(['monthly', 'annual'] as const).map((iv) => {
                                    const p = iv === 'annual' ? plan.annual_zar : plan.monthly_zar;
                                    return (
                                        <label key={iv} className={cn('flex items-center justify-between rounded-[6px] border p-3 text-sm', p === null ? 'cursor-not-allowed opacity-50' : 'cursor-pointer', form.data.interval === iv ? 'border-gold-500 bg-gold-50' : 'border-parchment-400 bg-white')}>
                                            <span className="flex items-center gap-2">
                                                <input type="radio" name="interval" disabled={p === null} checked={form.data.interval === iv} onChange={() => form.setData('interval', iv)} className="accent-gold-600" />
                                                <span className="font-semibold capitalize">{iv}</span>
                                                {iv === 'annual' && p !== null && <span className="text-xs text-verified-700">Save {plan.annual_discount_pct}%</span>}
                                            </span>
                                            <span className="font-bold">{p === null ? 'Not available' : `${zar(p)} / ${iv === 'annual' ? 'year' : 'month'}`}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.interval && <p role="alert" className="mt-1 text-xs text-risk-500">{errors.interval}</p>}
                            <p className="mt-2 text-xs text-ink-500">
                                First period: today – {fmtDate(firstPeriodEnd[form.data.interval])}. Next charge {fmtDate(firstPeriodEnd[form.data.interval])} + 1 day, after a continuation notice.
                            </p>
                        </Card>

                        <Card title="2. Recurring payment authority">
                            <div className="rounded-[6px] border border-parchment-400 bg-parchment-100 p-3 text-[0.8125rem] text-ink-800">
                                I authorise The Business Clinic.Africa to charge <strong>{zar(price)}</strong> (ex VAT) every <strong>{period}</strong> for <strong>{plan.name}</strong> until I cancel. I can cancel from My Subscriptions at any time; cancellation takes effect at the end of the current period.
                            </div>
                            <p className="mt-2 text-[0.6875rem] text-ink-500">Consent version SU-MANDATE-v1.0 · captured with your account {auth.user?.email} and a timestamp.</p>
                            <Checkbox className="mt-3" label="I authorise this recurring charge (a one-off payment never silently becomes a recurring mandate)." checked={form.data.mandate_consent} onChange={(e) => form.setData('mandate_consent', e.target.checked)} />
                            {errors.mandate_consent && <p role="alert" className="mt-1 text-xs text-risk-500">{errors.mandate_consent}</p>}
                            <Checkbox className="mt-2" label="I accept the subscription terms (SU-TERMS-v2.0), including renewal, pause and price-change rules." checked={form.data.terms} onChange={(e) => form.setData('terms', e.target.checked)} />
                            {errors.terms && <p role="alert" className="mt-1 text-xs text-risk-500">{errors.terms}</p>}
                            {errors.plan && <p role="alert" className="mt-2 text-xs text-risk-500">{errors.plan}</p>}
                        </Card>

                        <Notice tone="purple" title="How to stop">
                            Select Cancel → Review effect → Confirm. No Sales call. A reason is optional. <Link href={`/subscriptions/${plan.slug}/disclosure`} className="font-semibold underline">Review the disclosure</Link>
                        </Notice>
                    </div>

                    <aside className="space-y-4">
                        <Card title="Order Summary">
                            <p className="font-semibold text-ink-900">{plan.name}</p>
                            <ClassChip code={plan.recurrence_class} label={plan.class_name} className="mt-1" />
                            {t ? (
                                <LabelValues
                                    className="mt-3"
                                    rows={[
                                        { label: `Price (ex VAT) / ${period}`, value: zar(t.subtotal) },
                                        { label: 'VAT (15%)', value: zar(t.vat) },
                                        { label: 'Platform fee', value: zar(t.platform) },
                                        { label: 'Card bank charge (1%)', value: zar(t.bank) },
                                        { label: 'First payment today', value: zar(t.total), strong: true },
                                    ]}
                                />
                            ) : (
                                <p className="mt-3 text-sm text-ink-600">Custom pricing</p>
                            )}
                            <p className="mt-2 text-[0.6875rem] text-ink-500">Recurring charges are {zar(price)} + VAT per {period}. Fees are re-priced for the method you choose on the payment page.</p>
                            <button
                                type="button"
                                disabled={!!blocker || form.processing || price === null}
                                onClick={() => form.post(`/subscriptions/checkout/${plan.slug}`)}
                                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Lock className="size-4" aria-hidden="true" /> Confirm Subscription & Pay <ArrowRight className="size-4" aria-hidden="true" />
                            </button>
                            <p className="mt-2 flex items-center gap-1 text-[0.6875rem] text-ink-500">
                                <ShieldCheck className="size-3.5" aria-hidden="true" /> Secure payment · card, EFT or wallet
                            </p>
                        </Card>
                    </aside>
                </div>
                <div className="container-tbca mt-8">
                    <TrustRow items={PUBLIC_TRUST} />
                </div>
            </section>
        </>
    );
}
