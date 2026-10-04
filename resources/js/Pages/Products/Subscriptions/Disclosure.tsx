import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CalendarClock, CircleCheck, Headphones, LogOut, PackageCheck, RefreshCw, ShieldCheck, Workflow } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { ButtonLink } from '@/Components/ui/Button';
import { Checkbox } from '@/Components/ui/Form';
import { Tabs } from '@/Components/ui/Kit';
import { CheckList, IconCard, PageTitle, TrustRow } from '@/Components/Products/Shared';
import { Card, ClassChip, PUBLIC_TRUST, fmtDate, zar } from '@/Components/Products/Subscriptions/ui';
import type { SubPlan } from '@/Components/Products/Subscriptions/types';
import { cn } from '@/lib/cn';

const TABS = [
    { key: 'how', label: 'How It Works' },
    { key: 'renewal', label: 'Renewal & Billing' },
    { key: 'cancel', label: 'Cancellation (Easy Exit)' },
    { key: 'keep', label: 'What You Keep' },
    { key: 'pause', label: 'Pause & Reactivate' },
    { key: 'price', label: 'Price Changes' },
    { key: 'terms', label: 'Important Terms' },
];

export default function Disclosure({ plan, acknowledged, nextCharge }: { plan: SubPlan; acknowledged: boolean; nextCharge: string }) {
    const [tab, setTab] = useState('how');
    const form = useForm({ acknowledged: acknowledged, interval: 'monthly' as 'monthly' | 'annual' });
    const minTerm = plan.min_term_months > 1 ? `${plan.min_term_months} months` : '1 month';
    const quote = plan.monthly_zar === null;

    const panels: Record<string, { title: string; icon: typeof Workflow; body: string; items: string[] }[]> = {
        how: [
            { title: 'What You Get', icon: PackageCheck, body: plan.what_recurs ?? plan.description ?? '', items: ['Full system access', 'Updates and new content', 'Expert support during business hours', 'Secure data and audit history'] },
            { title: 'How It Works', icon: Workflow, body: `Your subscription runs for a minimum term. You are billed ${plan.min_term_months > 1 ? 'monthly' : 'per period'} in advance. Access continues while payments are up to date.`, items: ['Billing period: Monthly (annual available)', `Minimum term: ${minTerm}`, 'Billed in advance', 'Access continues while active'] },
            { title: 'Automatic Renewal', icon: RefreshCw, body: 'Your subscription automatically renews at the end of each billing period unless you cancel.', items: ["We'll email before each renewal", 'You can cancel anytime', 'No long-term lock-in beyond minimum term'] },
            { title: 'Easy Cancellation', icon: LogOut, body: 'You can cancel online anytime in just a few clicks.', items: ['No calls', 'No tickets', 'No persuasion', 'Cancel before the next billing date to stop future charges'] },
        ],
        renewal: [
            { title: 'What happens next period', icon: CalendarClock, body: plan.next_period_value ?? '', items: [`Next charge basis: ${zar(plan.monthly_zar)} / month (ex VAT) or ${zar(plan.annual_zar)} / year`, 'A continuation notice is sent 7 days before every charge', 'No charge is taken if TBCA cannot make the next-period promise'] },
            { title: 'Billing', icon: Workflow, body: 'Monthly or annual, always in advance, in ZAR. VAT (15%) is added to the ex-VAT price.', items: [`Annual billing saves ${plan.annual_discount_pct}% against 12 monthly payments`, 'One charge per period — duplicate charges are blocked', 'Receipts and invoices stay in your portal'] },
        ],
        cancel: [
            { title: 'How to stop', icon: LogOut, body: 'Select Cancel → Review effect → Confirm. The same number of actions as subscribing.', items: ['No Sales call', 'No mandatory reason', 'Available 24/7 from My Subscriptions'] },
            { title: 'When it takes effect', icon: CalendarClock, body: 'Cancellation is effective at the end of your current billing period. Access continues until then.', items: ['No charges after the effective date', 'Your recurring mandate is stopped', 'You can withdraw a cancellation before it takes effect'] },
        ],
        keep: [
            { title: 'What you keep after you stop', icon: ShieldCheck, body: 'Cancellation never deletes your historical records or acquired rights.', items: ['Downloaded reports and acquired versions', 'Invoices, receipts and audit history', 'Export pathways before maintained access ends'] },
            { title: 'What ends', icon: LogOut, body: 'Future maintained access stops at the effective date.', items: ['Future versions and updates', 'Live system access', 'Maintenance-tied priority support'] },
        ],
        pause: [
            { title: 'Pause', icon: CalendarClock, body: plan.pause_allowed ? 'Pause for 1, 2 or 3 months (up to 90 days in a 12-month window). No billing during a pause.' : 'This plan cannot be paused.', items: ['Your next billing date moves by the pause length', 'Data, settings and history are kept', 'Resume anytime'] },
            { title: 'Reactivate', icon: RefreshCw, body: 'Come back any time with a fresh, affirmative reactivation at the current plan, price and terms.', items: ['No setup fees', 'Access restored once payment succeeds', 'Your history is preserved'] },
        ],
        price: [
            { title: 'Price changes', icon: Workflow, body: 'We give at least 30 days’ notice of any price change, with an exit right.', items: ['See the old and new price side by side', 'Accept, change plan, pause or cancel penalty-free before the effective date', 'Doing nothing continues at the new price'] },
        ],
        terms: [
            { title: 'Important terms', icon: ShieldCheck, body: plan.details.important ?? 'This is a subscription to a system and service, not a substitute for specific legal, accounting or professional advice.', items: ['Prices exclude VAT (15%)', 'Payment failure never cancels your subscription or deletes data', 'Terms version SU-TERMS-v2.0'] },
        ],
    };

    const submit = () => form.post(`/subscriptions/${plan.slug}/disclosure`, { preserveScroll: true });

    return (
        <>
            <Head title={`How ${plan.name} continues and how to cancel`} />
            <PageTitle
                crumbs={[{ label: 'Subscriptions', href: '/subscriptions' }, { label: 'Plans', href: '/subscriptions/compare' }, { label: plan.name, href: `/subscriptions/${plan.slug}` }, { label: 'Disclosure' }]}
                title="How Your Subscription Continues and How to Cancel"
                lead="We believe in complete transparency. Before you subscribe, it's important you understand how your subscription works, how it renews, and how you can cancel anytime."
                actions={
                    <ButtonLink href={`/subscriptions/${plan.slug}`} variant="outline" size="sm">
                        <ArrowLeft className="size-4" aria-hidden="true" /> Back to Plan
                    </ButtonLink>
                }
            />

            <section className="bg-parchment-200 py-8">
                <div className="container-tbca grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="min-w-0 space-y-5">
                        <Tabs tabs={TABS} value={tab} onChange={setTab} />
                        <div className="grid gap-4 md:grid-cols-2">
                            {panels[tab].map((p) => (
                                <IconCard key={p.title} icon={p.icon} title={p.title} body={p.body}>
                                    <CheckList items={p.items} className="mt-3" />
                                </IconCard>
                            ))}
                        </div>

                        <Card title="Our Cancellation Promise">
                            <p className="text-[0.8125rem] text-ink-700">
                                We make cancellation straightforward and respectful. We do not make you call, wait, or explain why you are leaving. You can cancel directly from your Client Portal in the same number of steps as it took to subscribe.
                            </p>
                            <ol className="mt-4 grid gap-2 sm:grid-cols-3">
                                {['Go to Client Portal', 'Confirm Cancellation', 'Receive Confirmation'].map((s, i) => (
                                    <li key={s} className="flex items-center gap-2 rounded-[6px] border border-referenced-500/30 bg-referenced-50 p-3 text-xs font-semibold text-referenced-700">
                                        <span className="flex size-6 items-center justify-center rounded-full bg-referenced-500 text-white">{i + 1}</span>
                                        {s}
                                    </li>
                                ))}
                            </ol>
                        </Card>

                        <Card title="Before you subscribe">
                            {quote ? (
                                <p className="text-[0.8125rem] text-ink-700">This plan is priced on request. Talk to an advisor for a tailored proposal.</p>
                            ) : (
                                <>
                                    <fieldset>
                                        <legend className="text-[0.8125rem] font-medium text-ink-800">Billing interval</legend>
                                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                            {(['monthly', 'annual'] as const).map((iv) => {
                                                const price = iv === 'monthly' ? plan.monthly_zar : plan.annual_zar;
                                                if (price === null) return null;
                                                return (
                                                    <label key={iv} className={cn('flex cursor-pointer items-center justify-between rounded-[6px] border p-3 text-sm', form.data.interval === iv ? 'border-gold-500 bg-gold-50' : 'border-parchment-400 bg-white')}>
                                                        <span className="flex items-center gap-2">
                                                            <input type="radio" name="interval" checked={form.data.interval === iv} onChange={() => form.setData('interval', iv)} className="accent-gold-600" />
                                                            <span className="font-semibold capitalize">{iv}</span>
                                                            {iv === 'annual' && <span className="text-xs text-verified-700">Save {plan.annual_discount_pct}%</span>}
                                                        </span>
                                                        <span className="font-bold">
                                                            {zar(price)} / {iv === 'monthly' ? 'month' : 'year'}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </fieldset>
                                    <div className="mt-4 rounded-[6px] border border-parchment-400 bg-parchment-100 p-3 text-xs text-ink-700">
                                        Sign-up design actions: 3 · Cancellation design actions: 3. A cancellation reason is optional.
                                    </div>
                                    <Checkbox
                                        className="mt-4"
                                        label="I reviewed how this Subscription continues and how I can stop it."
                                        checked={form.data.acknowledged}
                                        onChange={(e) => form.setData('acknowledged', e.target.checked)}
                                    />
                                    {form.errors.acknowledged && (
                                        <p role="alert" className="mt-1 text-xs font-medium text-risk-500">
                                            {form.errors.acknowledged}
                                        </p>
                                    )}
                                    <button
                                        type="button"
                                        onClick={submit}
                                        disabled={form.processing}
                                        className="mt-4 inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50"
                                    >
                                        Choose This Plan <ArrowRight className="size-4" aria-hidden="true" />
                                    </button>
                                </>
                            )}
                        </Card>
                    </div>

                    <aside className="space-y-4">
                        <Card title="Plan Summary">
                            <p className="font-semibold text-ink-900">{plan.name}</p>
                            <ClassChip code={plan.recurrence_class} label={plan.class_name} className="mt-1" />
                            <p className="mt-1 text-xs text-referenced-700">{plan.product_type}</p>
                            <ul className="mt-3 space-y-1 text-xs text-ink-600">
                                <li>Billed monthly in advance</li>
                                <li>Minimum term: {minTerm}</li>
                            </ul>
                            <p className="mt-3 text-2xl font-bold text-verified-700">
                                {zar(plan.monthly_zar)} <span className="text-sm font-medium text-ink-500">/month</span>
                            </p>
                            <p className="mt-1 inline-flex items-center gap-1 text-xs text-verified-700">
                                <CircleCheck className="size-3.5" aria-hidden="true" /> Next charge: {fmtDate(nextCharge)}
                            </p>
                        </Card>
                        <Card title="Need Help?">
                            <p className="text-xs text-ink-600">Questions about terms or cancellation? Talk to our team.</p>
                            <button type="button" onClick={() => openAskQuestion({ subject: `Question about ${plan.name} terms`, section: 'subscriptions' })} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-700 hover:text-gold-800">
                                <Headphones className="size-4" aria-hidden="true" /> Talk to a Specialist
                            </button>
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
