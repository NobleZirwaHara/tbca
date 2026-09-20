import { Head, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import { ButtonLink } from '@/Components/ui/Button';
import { Section, SectionHeading } from '@/Components/ui/Section';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';

interface Plan {
    name: string;
    zar: number | null;
    usd: number | null;
    cadence: string;
    summary: string;
    features: string[];
    featured: boolean;
}

export default function Subscriptions({ plans }: { plans: Plan[] }) {
    const { context } = usePage<SharedProps>().props;

    const priceFor = (plan: Plan) => {
        if (plan.zar === null) return 'On application';

        return context.currency === 'USD'
            ? `USD ${plan.usd?.toLocaleString()}`
            : `ZAR ${plan.zar.toLocaleString()}`;
    };

    return (
        <>
            <Head title="Subscriptions" />

            <PageHeader
                eyebrow="Sell recurring intelligence, dashboards and support"
                title="Subscriptions"
                lead="Recurring Intelligence and Entitled Access."
                intro="Subscriptions give continuing access to AIIM layers, dashboards, comparison tools, briefs and advisory time. Entitlement is validated on every request, so what you see is always what your plan covers."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Subscriptions' }]}
                aside={{
                    title: 'How Entitlement Works',
                    body: 'Subscription status is validated against your account before entitled data, dashboards or reports are released.',
                    items: [
                        'Validated on every request',
                        'Role and organisation controls',
                        'Renewal and churn visibility',
                        'Data-sharing controls for teams',
                    ],
                    icon: 'key',
                }}
            />

            <Section tone="parchment">
                <SectionHeading title="Choose Your Plan" lead="Monthly. Cancel or change at renewal." />

                <ul className="mt-8 grid gap-5 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <li
                            key={plan.name}
                            className={cn(
                                'flex flex-col rounded-[6px] border bg-white p-6',
                                plan.featured ? 'border-gold-400 shadow-card' : 'border-parchment-400',
                            )}
                        >
                            {plan.featured && (
                                <span className="mb-4 inline-flex w-fit rounded-[3px] bg-gold-500 px-2 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-900">
                                    Most Selected
                                </span>
                            )}

                            <h3 className="font-serif text-[1.375rem] font-semibold tracking-[-0.015em] text-ink-900">
                                {plan.name}
                            </h3>
                            <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-600">{plan.summary}</p>

                            <p className="mt-5 flex items-baseline gap-2">
                                <span className="font-serif text-[1.75rem] font-semibold text-ink-900">
                                    {priceFor(plan)}
                                </span>
                                <span className="text-[0.8125rem] text-ink-500">{plan.cadence}</span>
                            </p>

                            <ul className="mt-5 flex-1 space-y-2.5 border-t border-parchment-300 pt-5">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex gap-2.5 text-[0.8125rem] leading-relaxed text-ink-700">
                                        <Check className="mt-0.5 size-4 shrink-0 text-verified-500" aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <ButtonLink
                                href="/contact"
                                variant={plan.featured ? 'gold' : 'outline'}
                                className="mt-6 w-full"
                                size="lg"
                            >
                                {plan.zar === null ? 'Request Proposal' : 'Choose Plan'}
                            </ButtonLink>
                        </li>
                    ))}
                </ul>
            </Section>

            <CtaBand
                title="Need a team or enterprise arrangement?"
                body="Enterprise entitlement covers team workspaces, bulk data, API access, dashboards and a named account manager."
                primary={{ label: 'Request Proposal', href: '/contact' }}
                secondary={{ label: 'Compare Plans', href: '/subscriptions' }}
            />
        </>
    );
}
