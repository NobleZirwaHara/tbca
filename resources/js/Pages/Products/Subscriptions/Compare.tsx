import type { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Box,
    CalendarClock,
    CalendarDays,
    Check,
    Gauge,
    Headphones,
    Info,
    KeyRound,
    MousePointerClick,
    RefreshCw,
    Repeat,
    ShieldCheck,
    Tag as TagIcon,
    Users,
    XCircle,
    type LucideIcon,
} from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { PageTitle, TrustRow } from '@/Components/Products/Shared';
import { ClassChip, PLAN_ICON, rand } from '@/Components/Products/Subscriptions/ui';
import type { SubPlan } from '@/Components/Products/Subscriptions/types';
import { cn } from '@/lib/cn';

interface ClassInfo {
    code: string;
    name: string;
    long: string;
    body: string;
}

export default function Compare({ plans, classes }: { plans: SubPlan[]; classes: ClassInfo[] }) {
    const rows: { label: string; icon: LucideIcon; cell: (p: SubPlan) => ReactNode }[] = [
        { label: 'Recurrence Class', icon: Repeat, cell: (p) => <ClassChip code={p.recurrence_class} label={p.class_name} /> },
        { label: 'What Repeats', icon: RefreshCw, cell: (p) => p.what_recurs },
        { label: 'Recurring Value', icon: Gauge, cell: (p) => p.next_period_value },
        { label: 'Price (ZAR)', icon: TagIcon, cell: (p) => (p.monthly_zar ? <strong className="text-ink-900">{rand(p.monthly_zar)} / month</strong> : 'Custom pricing') },
        { label: 'Billing Interval', icon: CalendarDays, cell: (p) => (p.monthly_zar ? 'Monthly (annual option −15%)' : 'Monthly (or contract term)') },
        { label: 'Key Entitlements (Includes)', icon: KeyRound, cell: (p) => p.entitlements.join(', ') },
        { label: 'Delivery / Refresh Cadence', icon: CalendarClock, cell: (p) => p.delivery_cadence },
        { label: 'Cancellation Route', icon: XCircle, cell: (p) => p.cancellation_route },
    ];

    return (
        <>
            <Head title="Compare Subscription Plans" />
            <PageTitle
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Subscriptions', href: '/subscriptions' }, { label: 'Compare Plans' }]}
                title="Compare Subscription Plans"
                lead="Compare genuine recurring value, recurrence class, entitlements, billing cadence, and cancellation terms before you choose a plan."
                aside={
                    <div className="max-w-xs text-right">
                        <span className="inline-flex rounded-[4px] border border-gold-400 bg-gold-50 px-2.5 py-1 text-[0.6875rem] font-bold tracking-wide text-gold-800 uppercase">Sample data — illustrative</span>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">All content on this page is illustrative and not a binding offer. Prices are sample pricing in ZAR and exclude VAT unless stated.</p>
                    </div>
                }
            />

            <div className="bg-parchment-100 pb-14">
                <div className="container-tbca space-y-6 pt-6">
                    <section className="grid gap-4 rounded-[8px] border border-gold-300 bg-gold-50/60 p-5 md:grid-cols-[16rem_1fr]">
                        <div>
                            <h2 className="text-[0.9375rem] font-bold text-ink-900">The TBCA Recurrence Classes (R1–R5)</h2>
                            <p className="mt-1.5 text-xs leading-relaxed text-ink-600">
                                A subscription is recurring access to a governed thing, system, maintained content, or defined repeating output — not merely repeating billing.
                            </p>
                        </div>
                        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            {classes.map((c) => {
                                const Icon = PLAN_ICON[c.code] ?? Box;
                                return (
                                    <li key={c.code} className="flex gap-3">
                                        <Icon className="size-8 shrink-0 text-gold-600" aria-hidden="true" />
                                        <div>
                                            <p className="text-sm font-bold text-ink-900">
                                                {c.code} {c.name}
                                            </p>
                                            <p className="mt-0.5 text-xs text-ink-600">{c.body}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    <div className="grid gap-6 xl:grid-cols-[1fr_17rem]">
                        <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                            <table className="w-full min-w-[56rem] text-left text-xs">
                                <caption className="sr-only">Subscription plan comparison by recurrence class</caption>
                                <thead>
                                    <tr className="border-b border-parchment-300">
                                        <th className="w-44 p-3" scope="col">
                                            <span className="sr-only">Attribute</span>
                                        </th>
                                        {plans.map((p) => (
                                            <th key={p.slug} scope="col" className={cn('p-3 text-center align-top', p.popular && 'bg-gold-50')}>
                                                {p.popular && <span className="mb-1 inline-block rounded-full bg-gold-200 px-2 text-[0.625rem] font-bold text-gold-900 uppercase">Most popular</span>}
                                                <p className="font-serif text-base font-bold text-ink-900">{p.name}</p>
                                                <p className="mt-0.5 font-normal text-ink-500">{p.details.matrix_blurb ?? p.tagline}</p>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {rows.map((r) => (
                                        <tr key={r.label}>
                                            <th scope="row" className="p-3 font-semibold text-ink-800">
                                                <span className="flex items-center gap-2">
                                                    <r.icon className="size-4 text-ink-500" aria-hidden="true" /> {r.label}
                                                </span>
                                            </th>
                                            {plans.map((p) => (
                                                <td key={p.slug} className={cn('p-3 text-center text-ink-700', p.popular && 'bg-gold-50/50')}>
                                                    {r.cell(p)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    <tr>
                                        <th scope="row" className="p-3 font-semibold text-ink-800">
                                            <span className="flex items-center gap-2">
                                                <MousePointerClick className="size-4 text-ink-500" aria-hidden="true" /> Primary Action
                                            </span>
                                        </th>
                                        {plans.map((p) => (
                                            <td key={p.slug} className={cn('p-3 text-center', p.popular && 'bg-gold-50/50')}>
                                                {p.monthly_zar ? (
                                                    <Link
                                                        href={`/subscriptions/${p.slug}/disclosure`}
                                                        className={cn(
                                                            'inline-flex h-9 items-center gap-1.5 rounded-[4px] border px-3 text-xs font-semibold whitespace-nowrap',
                                                            p.popular ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-gold-500 text-ink-900 hover:bg-gold-50',
                                                        )}
                                                    >
                                                        Choose {p.name} <ArrowRight className="size-3.5" />
                                                    </Link>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => openAskQuestion({ subject: `${p.name} subscription`, section: 'subscriptions' })}
                                                        className={cn(
                                                            'inline-flex h-9 items-center gap-1.5 rounded-[4px] border px-3 text-xs font-semibold whitespace-nowrap',
                                                            p.tier === 'enterprise' ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-gold-500 text-ink-900',
                                                        )}
                                                    >
                                                        {p.tier === 'enterprise' ? 'Talk to an Advisor' : 'Request Custom Plan'} <ArrowRight className="size-3.5" />
                                                    </button>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                            <p className="border-t border-parchment-300 p-3 text-[0.6875rem] text-ink-500">
                                Before you choose:{' '}
                                <Link href="/subscriptions/business-rescue-advisory-sprint/disclosure" className="font-semibold text-referenced-700 hover:underline">
                                    See how cancellation works
                                </Link>
                            </p>
                        </div>

                        <aside className="space-y-4">
                            <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                <h2 className="text-sm font-bold text-ink-900">Subscription vs. Retainer</h2>
                                <p className="mt-1 text-xs text-ink-500">Not sure which model fits your needs? Here&rsquo;s the difference.</p>
                                <div className="mt-3 space-y-3">
                                    <div className="flex gap-3">
                                        <Box className="size-8 shrink-0 rounded-[6px] bg-verified-50 p-1.5 text-verified-700" aria-hidden="true" />
                                        <div>
                                            <p className="text-xs font-bold text-ink-900">Subscription</p>
                                            <p className="text-xs text-ink-600">Recurring access to a product, system, maintained content or repeating output.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Users className="size-8 shrink-0 rounded-[6px] bg-gold-50 p-1.5 text-gold-700" aria-hidden="true" />
                                        <div>
                                            <p className="text-xs font-bold text-ink-900">Retainer</p>
                                            <p className="text-xs text-ink-600">Recurring access to quantified, bounded, reserved people, capacity, judgement or readiness.</p>
                                        </div>
                                    </div>
                                </div>
                                <Link href="/subscriptions/choose-model" className="mt-4 flex h-9 items-center justify-center gap-1.5 rounded-[4px] border border-gold-500 text-xs font-semibold text-ink-900 hover:bg-gold-50">
                                    Compare Subscription or Retainer <ArrowRight className="size-3.5" />
                                </Link>
                            </div>
                            <div className="rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-5">
                                <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
                                    <Info className="size-4 text-controlled-700" /> Commercial Truths
                                </h2>
                                <ul className="mt-3 space-y-2">
                                    {[
                                        'All prices are illustrative sample pricing in ZAR.',
                                        'Billing period is shown for every plan.',
                                        'Cancel anytime (unless contractual) — no hidden cancellation.',
                                        'Entitlements, cadences and terms are described upfront.',
                                        'This is not a live offer, guarantee, or performance promise.',
                                    ].map((t) => (
                                        <li key={t} className="flex gap-2 text-xs text-ink-700">
                                            <Check className="mt-0.5 size-3.5 shrink-0 text-verified-700" /> {t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </aside>
                    </div>

                    <TrustRow
                        items={[
                            { icon: XCircle, title: 'No hidden cancellation', body: 'Cancel anytime in Portal (most plans)' },
                            { icon: TagIcon, title: 'Transparent pricing', body: 'Illustrative prices in ZAR' },
                            { icon: ShieldCheck, title: 'Clear entitlements', body: "What's included is stated upfront" },
                            { icon: Users, title: 'You are in control', body: 'Change or cancel via your Portal' },
                            { icon: Headphones, title: 'Need guidance?', body: 'Talk to a TBCA Advisor' },
                        ]}
                    />
                </div>
            </div>
        </>
    );
}
