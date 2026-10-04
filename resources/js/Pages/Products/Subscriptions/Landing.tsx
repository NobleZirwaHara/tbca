import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Bell,
    Bot,
    CalendarCheck,
    Check,
    Columns3,
    Crown,
    Globe2,
    Headphones,
    Landmark,
    LayoutDashboard,
    Lock,
    MessageCircle,
    RefreshCw,
    ScrollText,
    ShieldCheck,
    Sparkles,
    TrendingUp,
    UserCheck,
    XCircle,
    Zap,
} from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { ProductsHero } from '@/Components/Products/Shared';
import { ClassChip, rand } from '@/Components/Products/Subscriptions/ui';
import type { SubPlan } from '@/Components/Products/Subscriptions/types';
import { cn } from '@/lib/cn';

const included = [
    { icon: LayoutDashboard, title: 'Access to Dashboards', body: 'Real-time insights and KPIs' },
    { icon: UserCheck, title: 'Human Review', body: 'Expert-validated outputs' },
    { icon: Lock, title: 'Secure Client Portal', body: 'Documents, reports & history' },
    { icon: MessageCircle, title: 'WhatsApp Support', body: 'Business hours assistance' },
    { icon: BadgeCheck, title: 'Verified Information', body: 'Trusted sources & data' },
    { icon: Bot, title: 'AI Agents & Automation', body: 'Assisting your execution' },
    { icon: RefreshCw, title: 'Regular Updates', body: 'Continuous intelligence' },
    { icon: XCircle, title: 'Cancel Anytime', body: 'No long-term lock-in' },
];

const heroFacts = [
    { icon: Globe2, title: 'South Africa Active Market', body: 'Phase 1 Focus' },
    { icon: ScrollText, title: 'English & Afrikaans', body: 'Supported Languages' },
    { icon: Landmark, title: 'ZAR (Source) & USD', body: 'Supported Currencies' },
    { icon: UserCheck, title: 'Human-Reviewed Outputs', body: 'Every Subscription' },
    { icon: ShieldCheck, title: 'Secure + POPIA Ready', body: 'Bank-Grade Protection' },
];

const trust = [
    { icon: CalendarCheck, title: 'Transparent Billing', body: 'Monthly or annual options' },
    { icon: TrendingUp, title: 'Upgrade or Downgrade', body: 'Change anytime' },
    { icon: Lock, title: 'Secure Payments', body: 'ZAR or USD settlement' },
    { icon: ScrollText, title: 'Audit Trail', body: 'Full usage history' },
    { icon: ShieldCheck, title: 'POPIA Compliant', body: 'Privacy by design' },
    { icon: Landmark, title: 'Bank-Grade Security', body: 'ISO 27001 Certified' },
];

export default function Landing({ plans }: { plans: SubPlan[] }) {
    const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly');

    return (
        <>
            <Head title="Subscriptions" />

            <ProductsHero
                title="Subscriptions That Power"
                goldLine="Your Decisions Every Day."
                lead="Continuous intelligence, dashboards, monitoring and expert support delivered through secure, human-reviewed systems."
                actions={
                    <>
                        <a href="#plans" className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                            Choose Your Plan <ArrowRight className="size-4" />
                        </a>
                        <Link href="/subscriptions/compare" className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-ink-600 px-5 text-sm text-parchment-100 hover:border-gold-500">
                            <Columns3 className="size-4" /> Compare Plans
                        </Link>
                    </>
                }
                aside={
                    <div className="space-y-4">
                        <ul className="space-y-3 rounded-[8px] border border-gold-600/40 bg-ink-900/80 p-5">
                            {heroFacts.map(({ icon: Icon, title, body }) => (
                                <li key={title} className="flex items-center gap-3">
                                    <Icon className="size-5 text-gold-400" aria-hidden="true" />
                                    <div>
                                        <p className="text-sm font-semibold text-parchment-100">{title}</p>
                                        <p className="text-xs text-gold-400">{body}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="rounded-[8px] border border-gold-600/40 bg-ink-900/80 p-5">
                            <p className="flex items-center gap-2 text-sm font-semibold text-parchment-100">
                                <RefreshCw className="size-4 text-gold-400" /> What Is a Subscription?
                            </p>
                            <p className="mt-2 text-xs leading-relaxed text-ink-200">
                                A subscription gives you recurring access to valuable systems, data, updates and expert insights that continuously deliver fresh value every period.
                            </p>
                            <ul className="mt-3 space-y-1.5 text-xs text-ink-100">
                                {['Recurring value every period', 'Clear entitlements and cadence', 'Fair pricing and cancel-anytime'].map((t) => (
                                    <li key={t} className="flex gap-2">
                                        <Check className="size-3.5 text-gold-400" /> {t}
                                    </li>
                                ))}
                                <li className="flex gap-2">
                                    <Check className="size-3.5 text-gold-400" />
                                    <Link href="/subscriptions/choose-model" className="underline-offset-2 hover:underline">
                                        Choose Subscription or Retainer
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                }
            >
                <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-200">
                    {[
                        [Zap, 'Real-time intelligence'],
                        [UserCheck, 'Human-reviewed insights'],
                        [Lock, 'Secure client portal'],
                        [XCircle, 'Cancel anytime'],
                        [ScrollText, 'Transparent billing'],
                    ].map(([Icon, label]) => {
                        const I = Icon as typeof Zap;
                        return (
                            <li key={label as string} className="flex items-center gap-1.5">
                                <I className="size-4 text-gold-400" aria-hidden="true" /> {label as string}
                            </li>
                        );
                    })}
                </ul>
            </ProductsHero>

            <section id="plans" className="bg-ink-950 pb-14 text-parchment-100">
                <div className="container-tbca">
                    <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink-800 pt-10">
                        <div>
                            <h2 className="font-serif text-2xl font-semibold md:text-[1.75rem]">Choose the Plan That Fits Your Growth Ambition</h2>
                            <p className="mt-1 text-xs text-ink-300">
                                All prices excl. VAT. Billing in ZAR. <Link href="/subscriptions/business-rescue-advisory-sprint/disclosure" className="text-gold-400 hover:underline">View full terms</Link> ·{' '}
                                <Link href="/subscriptions/compare" className="text-gold-400 hover:underline">How pricing works</Link>
                            </p>
                        </div>
                        <div role="radiogroup" aria-label="Billing interval" className="inline-flex rounded-full border border-ink-700 bg-ink-900 p-1 text-xs">
                            {(['monthly', 'annual'] as const).map((k) => (
                                <button
                                    key={k}
                                    type="button"
                                    role="radio"
                                    aria-checked={interval === k}
                                    onClick={() => setInterval(k)}
                                    className={cn('rounded-full px-4 py-1.5 font-semibold capitalize', interval === k ? 'bg-gold-500 text-ink-900' : 'text-ink-200 hover:text-parchment-100')}
                                >
                                    {k === 'annual' ? 'Annual (save 15%)' : 'Monthly'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-5 xl:grid-cols-[15rem_1fr_15rem]">
                        <aside className="rounded-[8px] border border-gold-600/40 bg-ink-900 p-5">
                            <h3 className="text-sm font-semibold">All Plans Include</h3>
                            <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                                {included.map(({ icon: Icon, title, body }) => (
                                    <li key={title} className="flex items-start gap-3">
                                        <Icon className="mt-0.5 size-5 shrink-0 text-gold-400" aria-hidden="true" />
                                        <div>
                                            <p className="text-[0.8125rem] font-semibold">{title}</p>
                                            <p className="text-[0.6875rem] text-ink-300">{body}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </aside>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
                            {plans.map((p) => (
                                <PlanCard key={p.slug} plan={p} interval={interval} />
                            ))}
                        </div>

                        <aside className="space-y-4">
                            <div className="rounded-[8px] border border-gold-600/40 bg-ink-900 p-5">
                                <h3 className="text-sm font-semibold">Plan Comparison</h3>
                                <p className="mt-2 text-xs text-ink-300">Compare features, access and support across all plans.</p>
                                <Link href="/subscriptions/compare" className="mt-4 inline-flex h-9 items-center gap-2 rounded-[4px] bg-gold-500 px-4 text-xs font-semibold text-ink-900 hover:bg-gold-400">
                                    <Columns3 className="size-4" /> Compare Plans
                                </Link>
                            </div>
                            <div className="rounded-[8px] border border-gold-600/40 bg-ink-900 p-5">
                                <h3 className="text-sm font-semibold">Why Subscribe?</h3>
                                <ul className="mt-3 space-y-2 text-xs text-ink-200">
                                    {[
                                        [Sparkles, 'Stay ahead with current intelligence'],
                                        [ShieldCheck, 'Reduce risk with expert validation'],
                                        [Zap, 'Make faster, better decisions'],
                                        [Globe2, 'Access anytime, anywhere'],
                                    ].map(([Icon, t]) => {
                                        const I = Icon as typeof Zap;
                                        return (
                                            <li key={t as string} className="flex gap-2">
                                                <I className="size-4 text-gold-400" aria-hidden="true" /> {t as string}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                            <div className="rounded-[8px] border border-gold-600/40 bg-ink-900 p-5">
                                <h3 className="text-sm font-semibold">Need a Custom Plan?</h3>
                                <p className="mt-2 text-xs text-ink-300">Enterprise organisations can request a tailored subscription package.</p>
                                <button
                                    type="button"
                                    onClick={() => openAskQuestion({ subject: 'Request a custom subscription plan', section: 'subscriptions' })}
                                    className="mt-4 inline-flex h-9 items-center rounded-[4px] border border-gold-500 px-4 text-xs font-semibold text-gold-300 hover:bg-gold-500/10"
                                >
                                    Request Custom Plan
                                </button>
                            </div>
                            <div className="rounded-[8px] border border-gold-600/40 bg-ink-900 p-5">
                                <h3 className="text-sm font-semibold">Need Help Choosing?</h3>
                                <p className="mt-2 text-xs text-ink-300">Our specialists can help you select the right plan for your goals.</p>
                                <button
                                    type="button"
                                    onClick={() => openAskQuestion({ subject: 'Help me choose a subscription plan', section: 'subscriptions' })}
                                    className="mt-3 inline-flex h-9 items-center gap-2 rounded-[4px] bg-gold-500 px-4 text-xs font-semibold text-ink-900 hover:bg-gold-400"
                                >
                                    <Headphones className="size-4" /> Talk to a Specialist
                                </button>
                                <p className="mt-2 text-[0.6875rem] text-ink-400">
                                    or{' '}
                                    <Link href="/subscriptions/choose-subscription" className="text-gold-400 hover:underline">
                                        Browse all subscriptions →
                                    </Link>
                                </p>
                            </div>
                        </aside>
                    </div>

                    <ul className="mt-8 grid gap-px overflow-hidden rounded-[8px] border border-ink-700 bg-ink-700 sm:grid-cols-3 lg:grid-cols-6">
                        {trust.map(({ icon: Icon, title, body }) => (
                            <li key={title} className="flex items-center gap-3 bg-ink-900 p-4">
                                <Icon className="size-5 shrink-0 text-gold-400" aria-hidden="true" />
                                <div>
                                    <p className="text-[0.8125rem] font-semibold">{title}</p>
                                    <p className="text-[0.6875rem] text-ink-300">{body}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="relative mt-8 overflow-hidden rounded-[8px] border border-gold-600/40 bg-ink-900 px-6 py-8">
                        <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
                        <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
                            <div className="flex items-center gap-4">
                                <Crown className="size-10 shrink-0 text-gold-400" aria-hidden="true" />
                                <div>
                                    <h2 className="font-serif text-xl font-semibold md:text-2xl">Intelligence Today. Advantage Tomorrow.</h2>
                                    <p className="mt-1 text-sm text-ink-200">Stay ahead with continuous insights, expert guidance and human-reviewed intelligence.</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <a href="#plans" className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-6 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                    Choose Your Plan <ArrowRight className="size-4" />
                                </a>
                                <button
                                    type="button"
                                    onClick={() => openAskQuestion({ subject: 'Subscriptions enquiry', section: 'subscriptions' })}
                                    className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-ink-500 px-6 text-sm text-parchment-100 hover:border-gold-500"
                                >
                                    <Headphones className="size-4" /> Talk to TBCA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

function PlanCard({ plan, interval }: { plan: SubPlan; interval: 'monthly' | 'annual' }) {
    const custom = plan.monthly_zar === null;
    const price = interval === 'annual' && plan.annual_zar ? plan.annual_zar : plan.monthly_zar;
    const usd = plan.usd_monthly ? (interval === 'annual' ? Math.round((plan.usd_monthly * 12 * (100 - plan.annual_discount_pct)) / 100) : plan.usd_monthly) : null;

    return (
        <article className={cn('relative flex flex-col rounded-[8px] border bg-ink-900 p-5', plan.popular ? 'border-gold-500 ring-1 ring-gold-500' : 'border-gold-600/40')}>
            {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-3 py-0.5 text-[0.625rem] font-bold tracking-wide text-ink-900 uppercase">Most Popular</span>
            )}
            <div className="flex items-start justify-between gap-2">
                <h3 className="text-lg font-semibold text-parchment-100">{plan.name}</h3>
                <ClassChip code={plan.recurrence_class} compact />
            </div>
            <p className="text-xs font-semibold text-gold-400">{plan.tagline}</p>
            <p className="mt-2 min-h-[3rem] text-xs leading-relaxed text-ink-200">{plan.description}</p>

            <div className="mt-3 flex items-end justify-between gap-2 rounded-[6px] border border-ink-700 bg-ink-950 px-3 py-2.5">
                {custom ? (
                    <div>
                        <p className="text-xl font-bold text-parchment-100">Custom</p>
                        <p className="text-[0.6875rem] text-ink-400">Tailored pricing</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-[0.625rem] text-ink-400">From</p>
                        <p className="text-xl font-bold text-gold-400">
                            {rand(price)}
                            <span className="text-xs font-normal text-ink-300">/{interval === 'annual' ? 'year' : 'month'}</span>
                        </p>
                        <p className="text-[0.625rem] text-ink-400">{interval === 'annual' ? `Billed annually · save ${plan.annual_discount_pct}%` : 'Billed monthly'}</p>
                    </div>
                )}
                <div className="text-right">
                    <p className="text-[0.625rem] text-verified-500">USD Available</p>
                    <p className="text-sm font-semibold text-verified-500">{usd ? `$${usd}` : 'Custom'}</p>
                </div>
            </div>

            <p className="mt-3 text-[0.6875rem] text-ink-300">
                <span className="font-semibold text-parchment-100">What repeats:</span> {plan.what_recurs}
            </p>

            <ul className="mt-3 flex-1 space-y-1.5">
                {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-xs text-ink-100">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-gold-400" aria-hidden="true" /> {f}
                    </li>
                ))}
            </ul>

            {custom ? (
                <button
                    type="button"
                    onClick={() => openAskQuestion({ subject: `${plan.name} subscription`, section: 'subscriptions' })}
                    className="mt-4 h-10 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400"
                >
                    {plan.tier === 'custom' ? 'Request Custom Plan' : 'Talk to an Advisor'}
                </button>
            ) : (
                <Link
                    href={`/subscriptions/${plan.slug}/disclosure?interval=${interval}`}
                    className="mt-4 flex h-10 items-center justify-center rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400"
                >
                    Choose {plan.name}
                </Link>
            )}
            <Link href={`/subscriptions/${plan.slug}`} className="mt-2 text-center text-xs font-semibold text-parchment-100 hover:text-gold-300">
                View Full Details →
            </Link>
            <p className="mt-1 flex items-center justify-center gap-1 text-[0.625rem] text-ink-400">
                <Bell className="size-3" aria-hidden="true" /> {plan.cancellation_route}
            </p>
        </article>
    );
}
