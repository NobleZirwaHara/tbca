import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, XCircle } from 'lucide-react';
import { Stepper } from '@/Components/ui/Kit';
import { CheckList, LabelValues, Notice } from '@/Components/Products/Shared';
import { AccountShell, HelpCard, PurpleButton } from '@/Components/Products/Subscriptions/Account';
import { Card, RecordHeader, SubStatus, fmtDate, zar } from '@/Components/Products/Subscriptions/ui';
import type { SubSubscription } from '@/Components/Products/Subscriptions/types';
import { cn } from '@/lib/cn';

const STEPS = ['Review Your Subscription', 'Reason for Cancelling', "What You'll Keep", 'Confirm Cancellation', 'Cancellation Confirmed'];
const REASONS = ['No longer needed', 'Too expensive', 'Low usage / Not using', 'Switched provider', 'Missing expected value', 'Service / Support issue', 'Other'];

export default function Cancel({ subscription: sub, wizard }: { subscription: SubSubscription; wizard: { step: number; reason: string | null; actions: number } }) {
    const [reason, setReason] = useState(wizard.reason ?? '');
    const step = wizard.step;
    const accessUntil = sub.current_period_end;
    const pastDue = ['IN_GRACE', 'PAST_DUE'].includes(sub.status);
    const post = (action: string, extra: Record<string, string> = {}) => router.post(`/subscriptions/account/${sub.reference}/cancel`, { action, ...extra }, { preserveScroll: true });
    const keep = [`Access until ${fmtDate(accessUntil)}`, 'Downloaded reports and exports', 'Saved templates and custom content', 'Account history and past invoices', 'Data you have created'];

    return (
        <AccountShell sub={sub} title="Cancel Your Subscription" crumb="Cancel Subscription">
            <RecordHeader icon={XCircle} title="Cancel Your Subscription" sub={sub} lead="We're sorry to see you go. You can cancel anytime with no penalties." />

            <Card className="mb-5">
                <Stepper steps={STEPS} current={step} />
            </Card>

            {pastDue && (
                <Notice tone="warn" className="mb-4" title="Important">
                    Your billing is past due. You can still cancel; settling the overdue amount avoids further notices. <Link href={`/subscriptions/account/${sub.reference}/billing-recovery`} className="font-semibold underline">Settle Now</Link>
                </Notice>
            )}

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <Card title={`${step}. ${STEPS[step - 1]}`}>
                    {step === 1 && (
                        <>
                            <div className="rounded-[6px] border border-parchment-400 p-4">
                                <p className="font-semibold text-ink-900">
                                    {sub.plan.recurrence_class} {sub.plan.class_name} · {sub.plan.name}
                                </p>
                                <p className="text-xs text-ink-500">{sub.plan.tagline}</p>
                                <LabelValues
                                    className="mt-3"
                                    rows={[
                                        { label: 'Price (ex VAT)', value: `${zar(sub.price_zar)} / ${sub.billing_interval === 'annual' ? 'year' : 'month'}` },
                                        { label: 'Billing period', value: `${sub.billing_interval === 'annual' ? 'Annual' : 'Monthly'} in advance` },
                                        { label: 'Payment method', value: sub.mandate?.last4 ? `•••• ${sub.mandate.last4}` : 'On file' },
                                        { label: 'Next charge date', value: fmtDate(sub.next_charge_at) },
                                        { label: 'Status', value: <SubStatus status={sub.display_status} /> },
                                    ]}
                                />
                            </div>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                                <Notice tone="purple">Cancellation is effective at the end of your current billing period. You will continue to have full access until {fmtDate(accessUntil)}.</Notice>
                                <Notice tone="purple" title="Action-count parity">Cancelling takes the same number of actions as subscribing: Select Cancel → Review effect → Confirm.</Notice>
                            </div>
                        </>
                    )}
                    {step === 2 && (
                        <fieldset>
                            <legend className="text-[0.8125rem] text-ink-700">Telling us why is optional. It helps us improve, and never blocks your cancellation.</legend>
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {REASONS.map((r) => (
                                    <label key={r} className={cn('flex cursor-pointer items-center gap-2 rounded-[6px] border p-3 text-sm', reason === r ? 'border-referenced-500 bg-referenced-50' : 'border-parchment-400')}>
                                        <input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} className="accent-referenced-500" />
                                        {r}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    )}
                    {step === 3 && (
                        <>
                            <CheckList items={keep} />
                            <p className="mt-3 text-xs text-ink-600">
                                Future maintained access ends on {fmtDate(accessUntil)}. You can export your records before then. <Link href={`/subscriptions/account/${sub.reference}/export`} className="font-semibold text-referenced-700">Data Export Options →</Link>
                            </p>
                        </>
                    )}
                    {step === 4 && (
                        <>
                            <LabelValues
                                rows={[
                                    { label: 'Subscription', value: sub.plan.name },
                                    { label: 'Effective date', value: `${fmtDate(accessUntil)} (end of current period)` },
                                    { label: 'Further charges', value: 'None after the effective date' },
                                    { label: 'Recurring mandate', value: 'Stopped' },
                                    { label: 'Reason', value: wizard.reason || 'Not provided' },
                                ]}
                            />
                            <Notice tone="info" className="mt-3">You can withdraw this cancellation before {fmtDate(accessUntil)}.</Notice>
                        </>
                    )}

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-parchment-300 pt-4">
                        {step === 1 ? (
                            <PurpleButton tone="outline" onClick={() => router.visit(`/subscriptions/account/${sub.reference}`)}>Keep My Subscription</PurpleButton>
                        ) : (
                            <PurpleButton tone="outline" onClick={() => post('back')}>
                                <ArrowLeft className="size-4" aria-hidden="true" /> Back
                            </PurpleButton>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {step < 3 && <PurpleButton tone="outline" onClick={() => post('confirm_page', reason ? { reason } : {})}>Skip to Confirm</PurpleButton>}
                            {step < 4 && (
                                <PurpleButton onClick={() => post('next', step === 2 && reason ? { reason } : {})}>
                                    {step === 1 ? 'Continue to Reason' : step === 2 ? 'Continue' : 'Review & Confirm'} <ArrowRight className="size-4" aria-hidden="true" />
                                </PurpleButton>
                            )}
                            {step === 4 && (
                                <PurpleButton tone="danger" onClick={() => post('confirm')}>
                                    Confirm Cancellation
                                </PurpleButton>
                            )}
                        </div>
                    </div>
                </Card>

                <div className="space-y-4">
                    <Card title="Your Cancellation Progress">
                        <p className="text-2xl font-bold text-referenced-700">
                            {step} of 5
                        </p>
                        <p className="text-xs text-ink-600">You are here: {STEPS[step - 1]}</p>
                    </Card>
                    <Card title="What You'll Keep">
                        <CheckList items={keep} />
                    </Card>
                    <HelpCard sub={sub} />
                    <p className="rounded-[8px] border border-parchment-400 bg-white p-3 text-xs text-ink-600">Your data is safe with us. We never delete your data because you cancel.</p>
                </div>
            </div>
        </AccountShell>
    );
}

Cancel.layout = null;
