import { Head, Link, usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import { BoundaryNote, DataTable } from '@/Components/Blocks';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { ButtonLink } from '@/Components/ui/Button';
import LedgerChip from '@/Components/ui/LedgerChip';
import { Section, SectionHeading } from '@/Components/ui/Section';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';

interface Sku {
    sku: string;
    name: string;
    checks: string;
    automation: string;
    review_rule: string;
    zar: number | null;
    usd: number | null;
    turnaround: string;
}

interface Props {
    route: { page: string; slug: string; route: string; purpose: string; icon: string };
    positioning: { trust_line: string; boundary: string; intro: string };
    skus: Sku[];
    allRoutes: { page: string; slug: string; route: string; icon: string }[];
    workflow: { step: number; event: string; action: string }[];
    reviewTriggers: { trigger: string; treatment: string }[];
    controls: { control: string; requirement: string }[];
    reportTemplates: { type: string; sections: string }[];
}

export default function DueDiligenceFamily({
    route,
    positioning,
    skus,
    allRoutes,
    workflow,
    reviewTriggers,
    controls,
    reportTemplates,
}: Props) {
    const { context } = usePage<SharedProps>().props;

    return (
        <>
            <Head title={`${route.page} — Due Diligence`} />

            <PageHeader
                eyebrow="Due Diligence"
                title={route.page}
                lead={positioning.trust_line}
                intro={route.purpose}
                crumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Due Diligence', href: '/due-diligence' },
                    { label: route.page },
                ]}
                aside={{
                    title: 'Before Any Check Runs',
                    body: 'Verification may not start without recorded consent and a permitted purpose. Only fields required for the selected product are collected.',
                    items: [
                        'Consent and purpose recorded',
                        'Data minimisation applied',
                        'Payment or approved credit confirmed',
                        'Release locked until review passes where required',
                    ],
                    icon: 'lock',
                }}
            >
                <div className="mt-7 flex flex-wrap gap-3">
                    <ButtonLink href="/due-diligence/start" variant="gold" size="lg" trailingIcon="arrow-right">
                        Start This Check
                    </ButtonLink>
                    <ButtonLink href="/contact" variant="outline" size="lg">
                        Ask a Question
                    </ButtonLink>
                </div>
            </PageHeader>

            {skus.length > 0 && (
                <Section tone="parchment">
                    <SectionHeading title="Products in This Family" lead="Fixed scope. Stated review rule." />

                    <ul className="mt-8 grid gap-5 lg:grid-cols-2">
                        {skus.map((sku) => (
                            <Card as="li" key={sku.sku} hover className="flex flex-col p-6">
                                <div className="flex items-start justify-between gap-3">
                                    <span className="rounded-[3px] border border-parchment-400 bg-parchment-100 px-1.5 py-0.5 font-mono text-[0.6875rem] font-semibold text-ink-700">
                                        {sku.sku}
                                    </span>
                                    <LedgerChip code={sku.review_rule.startsWith('Always') ? 'V' : 'G'} full={false} />
                                </div>

                                <h3 className="mt-4 font-serif text-[1.1875rem] leading-snug font-semibold tracking-[-0.01em] text-ink-900">
                                    {sku.name}
                                </h3>
                                <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-600">{sku.checks}</p>

                                <dl className="mt-5 space-y-2 border-t border-parchment-300 pt-4 text-[0.8125rem]">
                                    <div className="flex gap-2">
                                        <dt className="font-semibold text-ink-900">Turnaround:</dt>
                                        <dd className="text-ink-600">{sku.turnaround}</dd>
                                    </div>
                                    <div className="flex gap-2">
                                        <dt className="font-semibold text-ink-900">Automation level:</dt>
                                        <dd className="text-ink-600">{sku.automation}</dd>
                                    </div>
                                    <div className="flex gap-2">
                                        <dt className="font-semibold text-ink-900">Human review:</dt>
                                        <dd className="text-ink-600">{sku.review_rule}</dd>
                                    </div>
                                </dl>

                                <div className="mt-5 flex items-center justify-between gap-3 border-t border-parchment-300 pt-4">
                                    <span className="text-[0.9375rem] font-semibold text-gold-700">
                                        {sku.zar === null
                                            ? 'On application'
                                            : `From ${context.currency === 'USD' ? `USD ${sku.usd?.toLocaleString()}` : `ZAR ${sku.zar.toLocaleString()}`}`}
                                    </span>
                                    <ButtonLink href="/due-diligence/start" variant="outline" size="sm">
                                        Start Case
                                    </ButtonLink>
                                </div>
                            </Card>
                        ))}
                    </ul>
                </Section>
            )}

            <Section tone="white">
                <SectionHeading title="How This Case Runs" lead="From order to portal delivery." />
                <ol className="mt-8 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-3">
                    {workflow.map((step) => (
                        <li key={step.step} className="flex gap-3.5 bg-white p-5">
                            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-gold-400 font-serif text-[0.8125rem] font-semibold text-gold-700">
                                {step.step}
                            </span>
                            <div className="min-w-0">
                                <p className="text-[0.8125rem] leading-snug font-semibold text-ink-900">{step.event}</p>
                                <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-600">{step.action}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </Section>

            <Section tone="parchment">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-6">
                        <SectionHeading title="Review Triggers" lead="What locks release on this family." />
                        <ul className="mt-7 space-y-2">
                            {reviewTriggers.slice(0, 8).map((trigger) => (
                                <Card as="li" key={trigger.trigger} className="flex gap-3 p-3.5">
                                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-risk-500" aria-hidden="true" />
                                    <div className="min-w-0">
                                        <p className="text-[0.8125rem] font-semibold text-ink-900">{trigger.trigger}</p>
                                        <p className="mt-0.5 text-[0.75rem] leading-relaxed text-ink-600">
                                            {trigger.treatment}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-6">
                        <SectionHeading title="Report Contents" lead="Minimum sections on delivery." />
                        <div className="mt-7">
                            <DataTable
                                columns={['Report Type', 'Minimum Sections']}
                                rows={reportTemplates.slice(0, 5).map((r) => [r.type, r.sections])}
                                caption="Report templates"
                            />
                        </div>
                    </div>
                </div>
            </Section>

            <Section tone="white">
                <SectionHeading title="Controls Applied" />
                <ul className="mt-7 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-3">
                    {controls.map((control) => (
                        <li key={control.control} className="bg-white p-5">
                            <h3 className="text-[0.875rem] font-semibold text-ink-900">{control.control}</h3>
                            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{control.requirement}</p>
                        </li>
                    ))}
                </ul>

                <div className="mt-10">
                    <BoundaryNote body={positioning.boundary} />
                </div>
            </Section>

            <Section tone="parchment">
                <SectionHeading title="Other Check Families" />
                <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {allRoutes
                        .filter((item) => item.slug !== '' && item.slug !== route.slug)
                        .map((item) => (
                            <li key={item.route}>
                                <Link
                                    href={item.route}
                                    className={cn(
                                        'flex items-center gap-3 rounded-[5px] border border-parchment-400 bg-white p-3.5',
                                        'transition-colors hover:border-gold-300 hover:bg-parchment-100',
                                    )}
                                >
                                    <Icon name={item.icon} className="size-5 shrink-0 text-gold-600" />
                                    <span className="text-[0.8125rem] font-medium text-ink-900">{item.page}</span>
                                </Link>
                            </li>
                        ))}
                </ul>
            </Section>

            <CtaBand
                title={`Start a ${route.page.toLowerCase()} case`}
                body="Record consent, complete intake and track the case through to approved portal delivery."
                primary={{ label: 'Start a Case', href: '/due-diligence/start' }}
                secondary={{ label: 'Talk to TBCA', href: '/contact' }}
            />
        </>
    );
}
