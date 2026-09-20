import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import { BoundaryNote, DataTable } from '@/Components/Blocks';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { ButtonLink } from '@/Components/ui/Button';
import { Section, SectionHeading } from '@/Components/ui/Section';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';

interface Sku {
    sku: string;
    name: string;
    family: string;
    checks: string;
    automation: string;
    review_rule: string;
    zar: number | null;
    usd: number | null;
    turnaround: string;
}

interface Props {
    positioning: { trust_line: string; boundary: string; intro: string };
    routes: { page: string; slug: string; route: string; purpose: string; icon: string }[];
    skus: Sku[];
    workflow: { step: number; event: string; action: string }[];
    caseStatuses: { status: string; meaning: string; control: string }[];
    reviewTriggers: { trigger: string; treatment: string }[];
    controls: { control: string; requirement: string }[];
}

export default function DueDiligenceIndex({
    positioning,
    routes,
    skus,
    workflow,
    caseStatuses,
    reviewTriggers,
    controls,
}: Props) {
    const { context } = usePage<SharedProps>().props;

    return (
        <>
            <Head title="Due Diligence" />

            <PageHeader
                eyebrow="Consent-driven checks, monitoring and enterprise screening"
                title="Due Diligence"
                lead={positioning.trust_line}
                intro={positioning.intro}
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Due Diligence' }]}
                aside={{
                    title: 'Professional Boundary',
                    body: positioning.boundary,
                    items: [
                        'Consent recorded before any verification',
                        'Only required fields are collected',
                        'Human review where risk requires it',
                        'Approved final report delivered in the portal',
                    ],
                    icon: 'shield-check',
                }}
            >
                <div className="mt-7 flex flex-wrap gap-3">
                    <ButtonLink href="/due-diligence/start" variant="gold" size="lg" trailingIcon="arrow-right">
                        Start a Due Diligence Case
                    </ButtonLink>
                    <ButtonLink href="/due-diligence/enterprise" variant="outline" size="lg">
                        Request Enterprise Screening
                    </ButtonLink>
                </div>
            </PageHeader>

            {/* ------------------------------------------ Families */}
            <Section tone="parchment">
                <SectionHeading title="Check Families" lead="Choose the subject you need verified." />

                <ul className="mt-8 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-3">
                    {routes.filter((route) => route.slug !== '').map((route) => (
                        <li key={route.route}>
                            <Link
                                href={route.route}
                                className="flex h-full flex-col bg-white p-5 transition-colors hover:bg-parchment-100"
                            >
                                <Icon name={route.icon} className="size-5 text-gold-600" />
                                <h3 className="mt-3 text-[0.875rem] font-semibold tracking-[-0.01em] text-ink-900">
                                    {route.page}
                                </h3>
                                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{route.purpose}</p>
                                <span className="mt-3 inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-gold-700">
                                    Open
                                    <ArrowRight className="size-3" aria-hidden="true" />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </Section>

            {/* ---------------------------------------------- SKUs */}
            <Section tone="white">
                <SectionHeading
                    title="Product Register"
                    lead="Every check is a governed SKU."
                    body="Each SKU maps to one product code, one delivery template, one finance item and one human review rule."
                />

                <div className="mt-8 overflow-hidden rounded-[6px] border border-parchment-400 bg-white">
                    <div className="overflow-x-auto rail-scroll">
                        <table className="w-full min-w-[54rem] border-collapse text-left">
                            <caption className="sr-only">Due Diligence product SKU register</caption>
                            <thead>
                                <tr className="border-b border-parchment-400 bg-parchment-100">
                                    {['SKU', 'Product', 'Core Checks', 'From', 'Turnaround', 'Human Review Rule'].map((column) => (
                                        <th
                                            key={column}
                                            scope="col"
                                            className="px-4 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-500"
                                        >
                                            {column}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {skus.map((sku) => (
                                    <tr key={sku.sku} className="border-b border-parchment-300 last:border-0">
                                        <td className="px-4 py-3.5 align-top">
                                            <span className="rounded-[3px] border border-parchment-400 bg-parchment-100 px-1.5 py-0.5 font-mono text-[0.6875rem] font-semibold text-ink-700">
                                                {sku.sku}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 align-top text-[0.8125rem] font-semibold text-ink-900">
                                            {sku.name}
                                        </td>
                                        <td className="px-4 py-3.5 align-top text-[0.8125rem] leading-relaxed text-ink-600">
                                            {sku.checks}
                                        </td>
                                        <td className="px-4 py-3.5 align-top text-[0.8125rem] font-semibold whitespace-nowrap text-gold-700">
                                            {sku.zar === null
                                                ? 'On application'
                                                : context.currency === 'USD'
                                                  ? `USD ${sku.usd?.toLocaleString()}`
                                                  : `ZAR ${sku.zar.toLocaleString()}`}
                                        </td>
                                        <td className="px-4 py-3.5 align-top text-[0.8125rem] text-ink-600">
                                            {sku.turnaround}
                                        </td>
                                        <td className="px-4 py-3.5 align-top text-[0.8125rem] leading-relaxed text-ink-600">
                                            {sku.review_rule}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Section>

            {/* ------------------------------------------ Workflow */}
            <Section tone="parchment">
                <SectionHeading
                    title="How a Case Runs"
                    lead="Eleven controlled steps from order to delivery."
                />

                <ol className="mt-8 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-3">
                    {workflow.map((step) => (
                        <li key={step.step} className="flex gap-3.5 bg-white p-5">
                            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-gold-400 font-serif text-[0.8125rem] font-semibold text-gold-700">
                                {step.step}
                            </span>
                            <div className="min-w-0">
                                <p className="text-[0.8125rem] font-semibold leading-snug text-ink-900">{step.event}</p>
                                <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-600">{step.action}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </Section>

            {/* ------------------------------------- Case statuses */}
            <Section tone="white">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-7">
                        <SectionHeading title="Case Status Machine" lead="What each status blocks or allows." />
                        <div className="mt-7">
                            <DataTable
                                columns={['Status', 'Meaning', 'System Control']}
                                rows={caseStatuses.map((s) => [s.status, s.meaning, s.control])}
                                caption="Due Diligence case statuses"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <SectionHeading title="When a Human Must Review" lead="Release locks, every time." />
                        <ul className="mt-7 space-y-2">
                            {reviewTriggers.map((trigger) => (
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
                </div>
            </Section>

            {/* ------------------------------------------ Controls */}
            <Section tone="parchment">
                <SectionHeading title="Security and Privacy Controls" lead="Applied to every case." />

                <ul className="mt-8 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2">
                    {controls.map((control) => (
                        <li key={control.control} className={cn('bg-white p-5')}>
                            <h3 className="text-[0.875rem] font-semibold tracking-[-0.01em] text-ink-900">
                                {control.control}
                            </h3>
                            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{control.requirement}</p>
                        </li>
                    ))}
                </ul>

                <div className="mt-10">
                    <BoundaryNote body={positioning.boundary} />
                </div>
            </Section>

            <CtaBand
                title="Start a Due Diligence case"
                body="Choose the product, record consent, complete intake and track the case to portal delivery."
                primary={{ label: 'Start a Case', href: '/due-diligence/start' }}
                secondary={{ label: 'Request Enterprise Screening', href: '/due-diligence/enterprise' }}
            />
        </>
    );
}
