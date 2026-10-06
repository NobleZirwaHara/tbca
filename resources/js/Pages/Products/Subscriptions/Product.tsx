import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Bookmark,
    Calendar,
    CalendarDays,
    CircleDollarSign,
    Clock,
    Columns3,
    FileText,
    Headphones,
    Hourglass,
    Info,
    Lightbulb,
    PauseCircle,
    Percent,
    Receipt,
    RefreshCw,
    Repeat,
    ShieldCheck,
    Tag as TagIcon,
    TrendingUp,
    UserRound,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { CheckList, IconCard, Notice, PageTitle, TrustRow } from '@/Components/Products/Shared';
import { ClassChip, PUBLIC_TRUST, fmtDate } from '@/Components/Products/Subscriptions/ui';
import type { SubPlan } from '@/Components/Products/Subscriptions/types';
import type { SharedProps } from '@/types';

import { usePrice } from '@/lib/money';
function Rows({ rows }: { rows: { icon: LucideIcon; label: string; value: React.ReactNode }[] }) {
    return (
        <dl className="divide-y divide-parchment-300 text-[0.8125rem]">
            {rows.map(({ icon: Icon, label, value }) => (
                <div key={label} className="grid grid-cols-[1.25rem_8rem_1fr] items-start gap-2 py-2">
                    <Icon className="mt-0.5 size-4 text-ink-400" aria-hidden="true" />
                    <dt className="font-medium text-ink-700">{label}</dt>
                    <dd className="text-ink-800">{value}</dd>
                </div>
            ))}
        </dl>
    );
}

export default function Product({ plan, variant, nextCharge, related }: { plan: SubPlan; variant: 'product' | 'maintained'; nextCharge: string; related: SubPlan[] }) {
    const zar = usePrice();
    const { auth } = usePage<SharedProps>().props;
    const maintained = variant === 'maintained';
    const vat = plan.monthly_zar ? Math.round(plan.monthly_zar * 0.15) : null;
    const recurrence = plan.details.recurrence ?? [
        { label: 'What repeats', value: plan.what_recurs ?? '' },
        { label: 'Delivery cadence', value: plan.delivery_cadence ?? '' },
        { label: 'Next-period value', value: plan.next_period_value ?? '' },
    ];
    const minTerm = plan.min_term_months > 1 ? `${plan.min_term_months} months` : '1 month';
    const blocked = plan.sale_blocker;

    const save = () =>
        auth.user ? router.post('/saved', { item_type: 'subscription', item_key: plan.slug, label: plan.name, url: `/subscriptions/${plan.slug}` }, { preserveScroll: true }) : router.visit('/login');

    return (
        <>
            <Head title={plan.name} />
            <PageTitle
                crumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Subscriptions', href: '/subscriptions' },
                    ...(maintained ? [{ label: 'Maintained Content Access' }] : [{ label: 'Plans', href: '/subscriptions/choose-subscription' }, { label: plan.name }]),
                ]}
                title={plan.name}
                chips={
                    <>
                        <span className="rounded-[4px] border border-referenced-500/30 bg-referenced-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-referenced-700">{plan.product_type}</span>
                        <ClassChip code={plan.recurrence_class} label={`Recurrence Class: ${plan.recurrence_class} – ${plan.class_name}`} />
                        {maintained && <span className="rounded-[4px] border border-gold-300 bg-gold-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-gold-800">{plan.tagline}</span>}
                        {plan.popular && <span className="rounded-[4px] border border-gold-300 bg-gold-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-gold-800">Most Popular</span>}
                    </>
                }
                lead={plan.description}
                actions={
                    <>
                        <Link href="/subscriptions/compare" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-ink-300 bg-white px-3 text-xs font-semibold text-ink-800 hover:border-ink-900">
                            <Columns3 className="size-4" /> Compare Plans
                        </Link>
                        {maintained ? (
                            <Link href={`/subscriptions/${plan.slug}/disclosure`} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-gold-500 px-3 text-xs font-semibold text-ink-900 hover:bg-gold-400">
                                Choose Your Plan <ArrowRight className="size-4" />
                            </Link>
                        ) : (
                            <Link href={`/subscriptions/${plan.slug}/disclosure`} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-ink-300 bg-white px-3 text-xs font-semibold text-ink-800 hover:border-ink-900">
                                <FileText className="size-4" /> View Disclosure
                            </Link>
                        )}
                    </>
                }
            />

            <div className="bg-parchment-100 pb-14">
                <div className="container-tbca grid gap-6 pt-6 lg:grid-cols-[1fr_19rem]">
                    <div className="min-w-0 space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <IconCard icon={Repeat} title="What Recurs" body={plan.what_recurs} />
                            <IconCard icon={CalendarDays} title="Why It Recurs" body={plan.why_recurs} />
                            <IconCard icon={Lightbulb} title="Next Period Value" body={plan.next_period_value} />
                            <IconCard icon={UserRound} title="Who It's For" body={plan.who_for} />
                        </div>

                        <div className="grid gap-4 xl:grid-cols-3">
                            <section className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                <h2 className="mb-3 text-[0.9375rem] font-semibold text-ink-900">{maintained ? 'What You Get' : 'Key Entitlements'}</h2>
                                <CheckList items={plan.entitlements.length ? plan.entitlements : plan.features} />
                            </section>
                            <section className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                <h2 className="mb-2 text-[0.9375rem] font-semibold text-ink-900">Recurrence {maintained ? '&' : 'and'} Delivery</h2>
                                <Rows
                                    rows={[
                                        { icon: Repeat, label: 'Recurrence Class', value: `${plan.recurrence_class} – ${plan.class_name}` },
                                        ...recurrence.map((r, i) => ({ icon: [RefreshCw, Clock, TrendingUp, Headphones, Lightbulb][i % 5], label: r.label, value: r.value })),
                                    ]}
                                />
                            </section>
                            <section className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                <h2 className="mb-2 text-[0.9375rem] font-semibold text-ink-900">Commercial {maintained ? '&' : 'and'} Continuation</h2>
                                {maintained ? (
                                    <Rows
                                        rows={[
                                            { icon: Calendar, label: 'Billing period', value: 'Monthly in advance' },
                                            { icon: Hourglass, label: 'Minimum term', value: minTerm },
                                            { icon: XCircle, label: 'Cancellation', value: 'Anytime (end of current period)' },
                                            { icon: PauseCircle, label: 'Pause', value: plan.pause_allowed ? 'Available (min 1 month)' : 'Not available' },
                                            { icon: TagIcon, label: 'Price changes', value: "30 days' notice + exit right" },
                                            { icon: Percent, label: 'Tax', value: 'Prices exclude VAT (15%)' },
                                        ]}
                                    />
                                ) : (
                                    <Rows
                                        rows={[
                                            { icon: TagIcon, label: 'Price (ex VAT)', value: plan.monthly_zar ? `${zar(plan.monthly_zar)} / month` : 'Custom pricing' },
                                            { icon: Percent, label: 'VAT', value: vat ? `${zar(vat)} (15%)` : '15%' },
                                            { icon: CircleDollarSign, label: 'Total (incl. VAT)', value: plan.monthly_zar ? <strong className="text-verified-700">{zar(plan.monthly_zar + (vat ?? 0))} / month</strong> : '—' },
                                            { icon: Receipt, label: 'Billing', value: 'Monthly in advance' },
                                            { icon: CalendarDays, label: 'Next charge', value: fmtDate(nextCharge) },
                                            { icon: XCircle, label: 'Cancellation', value: 'Cancel anytime. Access continues to end of period.' },
                                            { icon: PauseCircle, label: 'Pause', value: plan.pause_allowed ? 'Available (minimum 1 month)' : 'Not available' },
                                        ]}
                                    />
                                )}
                            </section>
                        </div>

                        {maintained ? (
                            <section className="flex flex-wrap items-center gap-6 rounded-[8px] border border-referenced-500/30 bg-referenced-50 p-5">
                                <div className="flex max-w-sm gap-3">
                                    <ShieldCheck className="size-8 shrink-0 text-referenced-700" aria-hidden="true" />
                                    <div>
                                        <p className="font-semibold text-referenced-700">Your Content. Always Current.</p>
                                        <p className="text-xs text-ink-600">We do the work of tracking changes, updating content and keeping you ahead. You focus on applying it in your business.</p>
                                    </div>
                                </div>
                                <dl className="grid flex-1 grid-cols-2 gap-4 text-center sm:grid-cols-4">
                                    {[
                                        ['1,200+', 'Digital Products Under Maintenance'],
                                        ['5R', 'Quality & Review Framework'],
                                        ['100%', 'Version & Update Transparency'],
                                        ['24/7', 'Secure Access to Your Content'],
                                    ].map(([v, l]) => (
                                        <div key={l}>
                                            <dt className="sr-only">{l}</dt>
                                            <dd className="text-2xl font-bold text-referenced-700">{v}</dd>
                                            <dd className="text-[0.6875rem] text-ink-600">{l}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                <Notice tone="purple" icon={ShieldCheck} title="Cancellation Guarantee">
                                    You can cancel online in just a few clicks from your Client Portal. No calls. No ticket. No persuasion. Action-count parity: Sign up (3 steps) = Cancel (3 steps).
                                </Notice>
                                <Notice tone="info" title="Important">
                                    {plan.details.important ?? 'This is a subscription to a system and advisory service, not a substitute for specific legal, accounting or professional advice. Use with professional judgement.'}
                                </Notice>
                            </div>
                        )}

                        {related.length > 0 && (
                            <section className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                <h2 className="text-[0.9375rem] font-semibold text-ink-900">Other plans in this family</h2>
                                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                                    {related.map((r) => (
                                        <li key={r.slug}>
                                            <Link href={`/subscriptions/${r.slug}`} className="flex items-center justify-between gap-3 rounded-[6px] border border-parchment-400 p-3 hover:border-gold-500">
                                                <span>
                                                    <span className="block text-sm font-semibold text-ink-900">{r.name}</span>
                                                    <ClassChip code={r.recurrence_class} label={r.class_name} />
                                                </span>
                                                <span className="text-sm font-bold text-ink-900">{zar(r.monthly_zar)}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:sticky lg:top-24">
                            <p className="text-sm font-semibold text-ink-800">{maintained ? 'Starting From' : 'Subscription Price'}</p>
                            <p className="mt-1 text-3xl font-bold text-verified-700">
                                {zar(plan.monthly_zar)} <span className="text-sm font-normal text-ink-500">/month</span>
                            </p>
                            <p className="text-xs text-ink-500">{maintained ? 'Billed monthly in advance' : 'Billed monthly'}</p>
                            {plan.annual_zar && <p className="mt-1 text-xs text-ink-600">or {zar(plan.annual_zar)} / year (save {plan.annual_discount_pct}%)</p>}
                            <p className="mt-3 flex items-center gap-2 rounded-[6px] border border-verified-500/30 bg-verified-50 px-3 py-2 text-xs font-semibold text-verified-700">
                                <CalendarDays className="size-4" /> Next charge: {fmtDate(nextCharge)}
                            </p>
                            {blocked ? (
                                <p className="mt-4 rounded-[6px] border border-risk-500/30 bg-risk-50 p-3 text-xs text-risk-700">
                                    {blocked === 'SU-FAIL-QUOTE' ? 'Priced on request — talk to an advisor.' : 'This plan is not currently open for new subscriptions.'}
                                </p>
                            ) : (
                                <Link
                                    href={`/subscriptions/${plan.slug}/disclosure`}
                                    className="mt-4 flex h-11 items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400"
                                >
                                    {maintained ? 'View Plans & Pricing' : 'Choose This Plan'} <ArrowRight className="size-4" />
                                </Link>
                            )}
                            <button type="button" onClick={save} className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-[4px] border border-gold-500 text-sm text-ink-900 hover:bg-gold-50">
                                <Bookmark className="size-4" /> Add to Saved Items
                            </button>
                            {!maintained && (
                                <Rows
                                    rows={[
                                        { icon: Hourglass, label: 'Minimum term', value: minTerm },
                                        { icon: Calendar, label: 'Billing period', value: 'Monthly in advance' },
                                        { icon: RefreshCw, label: 'Cancellation', value: 'Cancel anytime (effective end of current period)' },
                                        { icon: PauseCircle, label: 'Pause', value: plan.pause_allowed ? 'Available (minimum 1 month)' : 'Not available' },
                                        { icon: TagIcon, label: 'Price changes', value: "30 days' notice + exit right" },
                                        { icon: Receipt, label: 'Tax', value: 'Prices exclude VAT (15%)' },
                                    ]}
                                />
                            )}
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                                <Headphones className="size-5 text-verified-700" /> {maintained ? 'Need Help Choosing?' : 'Need Help?'}
                            </p>
                            <p className="mt-1 text-xs text-ink-600">
                                {maintained ? 'Our specialists can help you select the right maintained content products for your needs.' : 'Our specialists are here to help you choose the right plan.'}
                            </p>
                            <button
                                type="button"
                                onClick={() => openAskQuestion({ subject: plan.name, section: 'subscriptions' })}
                                className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-verified-500 text-xs font-semibold text-verified-700"
                            >
                                Talk to a Specialist <ArrowRight className="size-3.5" />
                            </button>
                        </div>
                        {maintained && (
                            <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                                    <Info className="size-4 text-referenced-700" /> Important
                                </p>
                                <p className="mt-1 text-xs text-ink-600">{plan.details.important}</p>
                                <Link href={`/subscriptions/${plan.slug}/disclosure`} className="mt-3 flex h-9 items-center justify-center rounded-[4px] border border-gold-500 text-xs font-semibold text-gold-800">
                                    View Terms &amp; Conditions →
                                </Link>
                            </div>
                        )}
                    </aside>
                </div>
                <div className="container-tbca mt-6">
                    <TrustRow items={PUBLIC_TRUST} />
                </div>
            </div>
        </>
    );
}
