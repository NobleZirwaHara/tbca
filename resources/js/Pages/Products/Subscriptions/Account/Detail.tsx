import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { CalendarClock, CalendarDays, Repeat, ShieldCheck, Sparkles } from 'lucide-react';
import { Tabs, SimpleTable } from '@/Components/ui/Kit';
import { CheckList, IconCard, Notice } from '@/Components/Products/Shared';
import { AccountShell, HelpCard, PurpleButton, SummaryCard } from '@/Components/Products/Subscriptions/Account';
import { Card, PLAN_ICON, RecordHeader, TextLink, fmtDate, zar } from '@/Components/Products/Subscriptions/ui';
import type { SubEventRow, SubSubscription } from '@/Components/Products/Subscriptions/types';

export default function Detail({ subscription: sub, events }: { subscription: SubSubscription; events: SubEventRow[] }) {
    const [tab, setTab] = useState('overview');
    const base = `/subscriptions/account/${sub.reference}`;
    const u = sub.usage;
    const Icon = PLAN_ICON[sub.plan.recurrence_class] ?? Repeat;

    const actions = (
        <div className="flex flex-wrap gap-2">
            {sub.status === 'ACTIVE' && sub.plan.pause_allowed && <PurpleButton tone="outline" onClick={() => router.visit(`${base}/pause`)}>Pause</PurpleButton>}
            {sub.status === 'PAUSED' && <PurpleButton onClick={() => router.post(`${base}/resume`)}>Resume Now</PurpleButton>}
            {sub.status === 'CANCELLED_PENDING' && <PurpleButton onClick={() => router.post(`${base}/cancel/withdraw`)}>Withdraw Cancellation</PurpleButton>}
            {sub.status === 'ACTIVE' && <PurpleButton tone="outline" onClick={() => router.visit(`${base}/change-plan`)}>Change Plan</PurpleButton>}
        </div>
    );

    return (
        <AccountShell sub={sub} title={sub.plan.name} actions={actions}>
            <RecordHeader icon={Icon} title={sub.plan.name} sub={sub} lead={sub.plan.description} aside={<div className="text-right text-xs text-ink-600">Started: {fmtDate(sub.started_at)}<br />Ref {sub.reference}</div>} />

            {sub.pending_plan && <Notice tone="info" className="mb-4" title="Scheduled plan change">Your plan changes to {sub.pending_plan.name} on {fmtDate(sub.next_charge_at)}.</Notice>}
            {sub.status === 'CANCELLED_PENDING' && <Notice tone="warn" className="mb-4" title="Cancellation scheduled">Access continues until {fmtDate(sub.cancel_effective_at)}. No further charges.</Notice>}
            {sub.status === 'PAUSED' && <Notice tone="info" className="mb-4" title="Paused">No charges during the pause. Your subscription resumes on {fmtDate(sub.pause_until)}.</Notice>}

            <Tabs
                className="mb-4"
                value={tab}
                onChange={setTab}
                tabs={[
                    { key: 'overview', label: 'Overview' },
                    { key: 'entitlements', label: 'What You Get' },
                    { key: 'usage', label: 'Usage & Access' },
                    { key: 'billing', label: 'Billing & Payments' },
                    { key: 'activity', label: 'Activity' },
                ]}
            />

            <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
                <div className="min-w-0 space-y-5">
                    {tab === 'overview' && (
                        <>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <IconCard icon={Repeat} title="What Recurs" body={sub.plan.what_recurs} />
                                <IconCard icon={Sparkles} title="What You Get Next" body={sub.plan.next_period_value} />
                                <IconCard icon={CalendarClock} title="Delivery Cadence" body={sub.plan.delivery_cadence} />
                                <IconCard icon={CalendarDays} title="Review Date" body={`Next review on ${fmtDate(sub.next_review_at)}`} />
                            </div>
                            <div className="grid gap-5 lg:grid-cols-3">
                                <Card title="Access & Entitlements">
                                    <CheckList items={sub.plan.entitlements.slice(0, 8)} />
                                    <button type="button" onClick={() => setTab('entitlements')} className="mt-2 text-xs font-semibold text-referenced-700">View All Entitlements →</button>
                                </Card>
                                <Card title="Subscription Timeline">
                                    <ol className="space-y-3 text-xs">
                                        <li><p className="font-semibold">{fmtDate(sub.started_at)} · Subscription started</p><p className="text-ink-500">Your subscription is active and in good standing.</p></li>
                                        <li><p className="font-semibold">{fmtDate(sub.next_charge_at)} · Next charge date</p><p className="text-ink-500">{zar(sub.total_zar)} will be charged automatically after a continuation notice.</p></li>
                                        <li><p className="font-semibold">Ongoing · Access & updates</p><p className="text-ink-500">You continue to receive updates, intelligence and support.</p></li>
                                        <li><p className="font-semibold">{fmtDate(sub.next_review_at)} · Next review date</p><p className="text-ink-500">We will review your subscription with you.</p></li>
                                    </ol>
                                </Card>
                                <Card title="Usage Summary">
                                    <dl className="space-y-1.5 text-xs">
                                        {[
                                            ['Logins', u.logins],
                                            ['Content accessed', u.content],
                                            ['Reports generated', u.reports],
                                            ['Documents exported', u.exports],
                                            ['Support interactions', u.support],
                                        ].map(([k, v]) => (
                                            <div key={k as string} className="flex justify-between"><dt className="text-ink-600">{k}</dt><dd className="font-semibold">{v ?? 0}</dd></div>
                                        ))}
                                    </dl>
                                    <TextLink href={`${base}/engagement`} className="mt-2">View Usage & Access Details</TextLink>
                                </Card>
                            </div>
                            <Notice tone="good" icon={ShieldCheck} title="Your subscription is protected">
                                Your recurring access continues as long as payments are successful. We'll notify you before any changes. A failed payment never cancels your subscription or deletes your data.
                            </Notice>
                        </>
                    )}
                    {tab === 'entitlements' && (
                        <Card title="Key Entitlements">
                            <CheckList items={sub.plan.entitlements} />
                        </Card>
                    )}
                    {tab === 'usage' && (
                        <Card title="Usage & Access">
                            <p className="text-sm text-ink-700">Engagement score {u.score ?? 0}% · confidence {u.confidence ?? 'HIGH'} · {u.days_inactive ?? 0} days since last qualifying activity.</p>
                            <TextLink href={`${base}/engagement`} className="mt-2">Open the Engagement & Usage panel</TextLink>
                        </Card>
                    )}
                    {tab === 'billing' && (
                        <Card title="Billing & Payments">
                            <SimpleTable
                                columns={['Item', 'Amount (ex VAT)']}
                                rows={[
                                    ['Recurring charge', zar(sub.price_zar)],
                                    ['VAT (15%)', zar(sub.vat_zar)],
                                    ...(sub.meta.pending_charges ?? []).map((c) => [c.label, zar(c.amount_zar)]),
                                ]}
                            />
                            <p className="mt-2 text-xs text-ink-500">Mandate {sub.mandate?.reference ?? ''} · {sub.mandate?.status ?? '—'} · consent {sub.mandate?.consent_version ?? '—'}</p>
                            <TextLink href={`${base}/export`} className="mt-2">Download invoices & receipts</TextLink>
                        </Card>
                    )}
                    {tab === 'activity' && (
                        <Card title="Activity (audit trail)">
                            <SimpleTable
                                columns={['When', 'Event', 'From', 'To']}
                                rows={events.map((e) => [new Date(e.created_at).toLocaleString('en-ZA'), e.event_type.replace(/_/g, ' '), e.previous_state ?? '—', e.new_state ?? '—'])}
                                empty="No activity yet."
                            />
                        </Card>
                    )}
                </div>

                <div className="space-y-4">
                    <SummaryCard sub={sub} title="Subscription Summary" extra={[{ label: 'VAT (15%)', value: zar(sub.vat_zar) }, { label: 'Total (incl. VAT)', value: zar(sub.total_zar), strong: true }]}>
                        <Link href={`${base}/billing-recovery`} className="mt-3 inline-flex text-xs font-semibold text-referenced-700">Update Payment Method</Link>
                    </SummaryCard>
                    {['ACTIVE', 'PAUSED', 'IN_GRACE', 'PAST_DUE'].includes(sub.status) && (
                        <Card title="Easy Cancellation" className="border-referenced-500/30 bg-referenced-50">
                            <p className="text-xs text-ink-700">Cancel online anytime in just a few clicks.</p>
                            <Link href={`${base}/cancel`} className="mt-2 inline-flex text-sm font-semibold text-referenced-700">Cancel Subscription →</Link>
                        </Card>
                    )}
                    <Card title="Quick Actions">
                        <ul className="space-y-1.5 text-[0.8125rem]">
                            <li><Link href={`${base}/billing-recovery`} className="text-ink-800 hover:text-gold-700">Update payment method</Link></li>
                            <li><Link href={`${base}/export`} className="text-ink-800 hover:text-gold-700">Download latest invoice</Link></li>
                            <li><Link href={`${base}/renewal`} className="text-ink-800 hover:text-gold-700">View renewal notice</Link></li>
                            <li><Link href={`${base}/engagement`} className="text-ink-800 hover:text-gold-700">View engagement</Link></li>
                        </ul>
                    </Card>
                    <HelpCard sub={sub} />
                </div>
            </div>
        </AccountShell>
    );
}

Detail.layout = null;
