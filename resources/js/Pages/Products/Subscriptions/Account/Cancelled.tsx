import { router } from '@inertiajs/react';
import { Bookmark, CalendarDays, CircleCheck, Download, Headphones, History, RefreshCw, Search, ShieldCheck, UserRound } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { ButtonLink } from '@/Components/ui/Button';
import { IconCard, LabelValues, Notice } from '@/Components/Products/Shared';
import { AccountShell, OptionRows, PurpleButton } from '@/Components/Products/Subscriptions/Account';
import { Card, RecordHeader, SubStatus, fmtDate } from '@/Components/Products/Subscriptions/ui';
import type { SubSubscription } from '@/Components/Products/Subscriptions/types';

export default function Cancelled({ subscription: sub }: { subscription: SubSubscription }) {
    const base = `/subscriptions/account/${sub.reference}`;
    const until = sub.access_until;
    const pending = sub.status === 'CANCELLED_PENDING';
    const nonPayment = sub.status === 'CLOSED_NONPAYMENT';

    return (
        <AccountShell sub={sub} title="Cancellation Confirmed" crumb="Cancellation Confirmed">
            <RecordHeader icon={CircleCheck} tone="green" title={nonPayment ? 'Subscription Closed' : 'Cancellation Confirmed'} sub={sub} lead={nonPayment ? 'This subscription was closed for non-payment. Your history and data are retained and you can reactivate.' : 'Your subscription has been cancelled. Thank you for being part of TBCA.'} />

            <Notice tone="good" className="mb-5" title="Your cancellation is confirmed.">
                Cancellation effective date: {fmtDate(sub.cancel_effective_at ?? until)} (end of current billing period). {pending ? `You will continue to have full access until ${fmtDate(until)}.` : 'Maintained access has ended.'}{' '}
                <ButtonLink href="/subscriptions/account" variant="outline" size="sm" className="mt-2">Go to My Subscriptions</ButtonLink>
            </Notice>

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-5">
                    <Card title="What You Keep — you retain everything you've created and downloaded">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <IconCard icon={CalendarDays} title={`Access Until ${fmtDate(until)}`} body="You can continue to access all plan features until the end of your current billing period." />
                            <IconCard icon={Bookmark} title="Saved Items" body="Saved templates, checklists and custom content will remain in your account." />
                            <IconCard icon={Download} title="Downloaded Content" body="All reports, documents and exports you have downloaded are yours to keep." />
                            <IconCard icon={History} title="Account History" body="Your past invoices, payments and activity history will remain available." />
                            <IconCard icon={UserRound} title="Personal Data" body="Your account history, data and settings are retained in accordance with our Privacy Policy." />
                            <IconCard icon={ShieldCheck} title="Data Rights" body="You can request a data export at any time." />
                        </div>
                    </Card>
                    <Card title="Next Steps (Optional) — we're here anytime if you need us again">
                        <OptionRows
                            items={[
                                ...(pending
                                    ? [{ icon: RefreshCw, title: 'Changed your mind?', body: 'Withdraw this cancellation and keep your plan.', onClick: () => router.post(`${base}/cancel/withdraw`) }]
                                    : [{ icon: RefreshCw, title: 'Reactivate Anytime', body: 'Come back and reactivate your subscription whenever you are ready.', href: `${base}/reactivate` }]),
                                { icon: Search, title: 'Explore Other Options', body: 'A different plan, retainer or once-off sprint.', href: '/subscriptions/choose-model' },
                                { icon: Headphones, title: 'Talk to a Specialist', body: 'Find the best solution for your current needs.', onClick: () => openAskQuestion({ subject: `After cancelling ${sub.plan.name}`, section: 'subscriptions' }) },
                            ]}
                        />
                    </Card>
                    <Notice tone="info" title="A note about billing">No further payments will be taken after {fmtDate(until)}. Your recurring mandate has been stopped.</Notice>
                </div>

                <div className="space-y-4">
                    <Card title="Summary">
                        <LabelValues
                            rows={[
                                { label: 'Plan', value: `${sub.plan.recurrence_class} ${sub.plan.class_name}` },
                                { label: 'Status', value: <SubStatus status={sub.status === 'CANCELLED_PENDING' ? 'CANCELLED_PENDING' : 'CANCELLED'} /> },
                                { label: 'Cancelled on', value: fmtDate(sub.cancel_requested_at) },
                                { label: 'Effective date', value: fmtDate(sub.cancel_effective_at ?? until) },
                                { label: 'Reason', value: sub.cancel_reason || 'Not provided' },
                            ]}
                        />
                    </Card>
                    <Card title="Need Your Data?">
                        <p className="text-xs text-ink-600">Download or export your data before {fmtDate(until)} for your records.</p>
                        <div className="mt-3">
                            <PurpleButton onClick={() => router.visit(`${base}/export`)}>Export Data Now</PurpleButton>
                        </div>
                    </Card>
                </div>
            </div>
        </AccountShell>
    );
}

Cancelled.layout = null;
