import { Head, Link } from '@inertiajs/react';
import { BookOpen, ChevronRight, CircleCheck, Clock, FileText, Headphones, LayoutDashboard, LifeBuoy, Lock, MessagesSquare, Receipt, ShieldCheck } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { ButtonLink } from '@/Components/ui/Button';
import { LabelValues, Notice, PageTitle, TrustRow } from '@/Components/Products/Shared';
import { Card, ClassChip, PUBLIC_TRUST, fmtDate, zar } from '@/Components/Products/Subscriptions/ui';
import type { SubSubscription } from '@/Components/Products/Subscriptions/types';
import { cn } from '@/lib/cn';

interface Props {
    order: { reference: string; status: string; paid_at: string | null; subtotal_zar: number; vat_zar: number; fees_zar: number; total_zar: number; email: string };
    subscription: SubSubscription;
}

const EXPECT = [
    { icon: LayoutDashboard, title: 'Access to the system', body: 'Immediate access to the system, templates, tools and intelligence library.' },
    { icon: BookOpen, title: 'Updated Intelligence & Templates', body: 'Continuously updated intelligence, templates, checklists and best-practice resources.' },
    { icon: FileText, title: 'Monthly Insights & Compliance Guidance', body: 'Monthly sector insights, regulatory updates and compliance guidance.' },
    { icon: MessagesSquare, title: 'Support from Advisory Specialists', body: 'Access to our specialists for questions and guidance during your subscription.' },
    { icon: ShieldCheck, title: 'Secure Audit & History Access', body: 'Your documents, activity history and communications are securely retained.' },
];

export default function Confirmed({ order, subscription: sub }: Props) {
    const paid = order.status === 'paid';
    const base = `/subscriptions/account/${sub.reference}`;
    const timeline = [
        { title: 'Receipt sent to your inbox', body: `We've emailed your receipt and order details to ${order.email}.`, state: paid ? 'Complete' : 'Upcoming', time: paid && order.paid_at ? new Date(order.paid_at).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }) : '—' },
        { title: 'Portal access provisioned', body: 'Your secure Client Portal access and subscription workspace.', state: paid ? 'Complete' : 'Upcoming', time: '~5 min' },
        { title: 'First-period resources unlocked', body: 'Your resources, templates and intelligence library are available in your workspace.', state: paid ? 'In progress' : 'Upcoming', time: '~5–15 min' },
        { title: 'Next charge reminder', body: `We'll send a reminder before your next charge on ${fmtDate(sub.next_charge_at)}.`, state: 'Upcoming', time: sub.billing_interval === 'annual' ? '~1 year' : '~30 days' },
    ];

    return (
        <>
            <Head title="Subscription Confirmed" />
            <PageTitle
                crumbs={[{ label: 'Subscriptions', href: '/subscriptions' }, { label: 'Checkout' }, { label: 'Confirmation' }]}
                title={paid ? 'Subscription Confirmed' : order.status === 'failed' ? 'Payment Not Completed' : 'Payment Pending'}
                lead={
                    paid
                        ? "Thank you for subscribing. Your subscription is now active and we're preparing your first-period experience."
                        : 'Your subscription is not active yet. It activates automatically as soon as payment is confirmed. No access is granted and no recurring mandate runs before then.'
                }
                actions={paid ? <ButtonLink href={base} variant="outline" size="sm">View Order in Portal</ButtonLink> : <ButtonLink href={`/checkout/${order.reference}`} size="sm">Complete Payment</ButtonLink>}
            />

            <section className="bg-parchment-200 py-8">
                <div className="container-tbca space-y-6">
                    <div className={cn('grid gap-4 rounded-[8px] border bg-white p-5 md:grid-cols-4', paid ? 'border-verified-500/40' : 'border-attested-500/40')}>
                        <div className="flex items-start gap-3">
                            {paid ? <CircleCheck className="size-10 shrink-0 text-verified-600" aria-hidden="true" /> : <Clock className="size-10 shrink-0 text-attested-600" aria-hidden="true" />}
                            <div>
                                <p className="font-semibold text-ink-900">{paid ? "You're all set!" : 'Awaiting payment confirmation'}</p>
                                <p className="text-xs text-ink-600">{paid ? 'Your subscription is confirmed and active. Welcome to The Business Clinic.Africa™.' : 'Refresh this page after completing payment.'}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-ink-500">Order Reference</p>
                            <p className="font-mono text-sm font-bold text-verified-700">{order.reference}</p>
                            <p className="mt-1 text-xs text-ink-500">Confirmed On</p>
                            <p className="text-sm">{order.paid_at ? new Date(order.paid_at).toLocaleString('en-ZA') : '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-ink-500">Payment / Mandate Status</p>
                            <p className={cn('text-sm font-semibold', paid ? 'text-verified-700' : 'text-attested-700')}>{paid ? 'Recurring mandate confirmed' : `Mandate ${sub.mandate?.status ?? 'PENDING'}`}</p>
                            <p className="text-xs text-ink-600">
                                Billed {sub.billing_interval} in advance{sub.mandate?.last4 ? ` via mandate (Card ending ${sub.mandate.last4})` : ''}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-ink-500">Subscription Status</p>
                            <p className={cn('text-sm font-semibold', paid ? 'text-verified-700' : 'text-attested-700')}>{paid ? 'First period active' : sub.display_status.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-ink-600">{paid ? `Your first period runs until ${fmtDate(sub.current_period_end)}.` : 'Activates when payment succeeds.'}</p>
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1fr_340px_300px]">
                        <div className="space-y-5">
                            <Card title="First-Period Expectations">
                                <p className="mb-3 text-xs text-ink-600">Here's what you receive and what to expect during your current billing period.</p>
                                <ul className="grid gap-3 sm:grid-cols-2">
                                    {EXPECT.map(({ icon: Icon, title, body }) => (
                                        <li key={title} className="flex gap-2.5">
                                            <Icon className="mt-0.5 size-5 shrink-0 text-referenced-500" aria-hidden="true" />
                                            <div>
                                                <p className="text-[0.8125rem] font-semibold text-ink-900">{title}</p>
                                                <p className="text-xs text-ink-600">{body}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                {sub.plan.next_period_value && <p className="mt-3 rounded bg-parchment-100 p-2 text-xs text-ink-700">Next-period value: {sub.plan.next_period_value}</p>}
                            </Card>
                            <Card title="What happens next?">
                                <ol className="space-y-3">
                                    {timeline.map((s, i) => (
                                        <li key={s.title} className="flex gap-3">
                                            <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', s.state === 'Complete' ? 'bg-verified-500 text-white' : 'bg-parchment-300 text-ink-700')}>{i + 1}</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[0.8125rem] font-semibold text-ink-900">{s.title}</p>
                                                <p className="text-xs text-ink-600">{s.body}</p>
                                            </div>
                                            <div className="text-right text-[0.6875rem]">
                                                <p className={cn('font-semibold', s.state === 'Complete' ? 'text-verified-700' : s.state === 'In progress' ? 'text-controlled-700' : 'text-ink-500')}>{s.state}</p>
                                                <p className="text-ink-400">{s.time}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </Card>
                        </div>

                        <div className="space-y-5">
                            <Card title="Subscription Summary" action={<Link href={`${base}/change-plan`} className="text-xs font-semibold text-referenced-700">Manage Plan</Link>}>
                                <p className="font-semibold text-ink-900">{sub.plan.name}</p>
                                <ClassChip code={sub.plan.recurrence_class} label={sub.plan.class_name} className="mt-1" />
                                <LabelValues
                                    className="mt-3"
                                    rows={[
                                        { label: 'Billing interval', value: `${sub.billing_interval === 'annual' ? 'Annual' : 'Monthly'} in advance` },
                                        { label: 'Price (ex VAT)', value: zar(sub.price_zar) },
                                        { label: 'VAT (15%)', value: zar(sub.vat_zar) },
                                        { label: 'Total (incl. VAT)', value: `${zar(sub.total_zar)} / ${sub.billing_interval === 'annual' ? 'year' : 'month'}`, strong: true },
                                        { label: 'Minimum term', value: `${sub.min_term_months} month${sub.min_term_months === 1 ? '' : 's'}` },
                                        { label: 'Next charge date', value: fmtDate(sub.next_charge_at) },
                                        { label: 'First payment (incl. fees)', value: zar(order.total_zar) },
                                    ]}
                                />
                                <div className="mt-4 flex flex-col gap-2">
                                    <ButtonLink href={base} size="sm">Go to My Subscription</ButtonLink>
                                    <ButtonLink href={`${base}/export`} variant="outline" size="sm">
                                        <Receipt className="size-4" aria-hidden="true" /> Invoices & Receipts
                                    </ButtonLink>
                                </div>
                            </Card>
                            <Notice tone="good" title="What you keep control of">
                                You can cancel or change your subscription at any time via the Client Portal. If future maintained access is cancelled, all historical invoices, receipts and records remain securely retained in your portal.
                            </Notice>
                        </div>

                        <div className="space-y-5">
                            <Card title="Portal access & first actions">
                                <ul className="divide-y divide-parchment-300">
                                    {[
                                        { label: 'View subscription details', body: 'Review plan, billing and usage.', href: base, icon: LayoutDashboard },
                                        { label: 'Open secure Client Portal', body: 'Access your workspace and tools.', href: '/portal', icon: Lock },
                                        { label: 'See invoices & receipts', body: 'Access billing history and receipts.', href: `${base}/export`, icon: Receipt },
                                    ].map((r) => (
                                        <li key={r.label}>
                                            <Link href={r.href} className="flex items-center gap-2 py-2.5 hover:text-gold-700">
                                                <r.icon className="size-4 text-referenced-500" aria-hidden="true" />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block text-[0.8125rem] font-semibold">{r.label}</span>
                                                    <span className="block text-[0.6875rem] text-ink-500">{r.body}</span>
                                                </span>
                                                <ChevronRight className="size-4 text-ink-400" aria-hidden="true" />
                                            </Link>
                                        </li>
                                    ))}
                                    <li>
                                        <button type="button" onClick={() => openAskQuestion({ subject: `Question about ${sub.plan.name}`, section: 'subscriptions' })} className="flex w-full items-center gap-2 py-2.5 text-left hover:text-gold-700">
                                            <Headphones className="size-4 text-referenced-500" aria-hidden="true" />
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-[0.8125rem] font-semibold">Contact your specialist</span>
                                                <span className="block text-[0.6875rem] text-ink-500">Ask a question or request guidance.</span>
                                            </span>
                                            <ChevronRight className="size-4 text-ink-400" aria-hidden="true" />
                                        </button>
                                    </li>
                                </ul>
                            </Card>
                            <Notice tone="info" icon={LifeBuoy} title="Provisioning">
                                You'll receive an email once access is ready. This usually takes 5–15 minutes.
                            </Notice>
                        </div>
                    </div>
                    <TrustRow items={PUBLIC_TRUST} />
                </div>
            </section>
        </>
    );
}
