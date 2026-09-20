import { Head, usePage } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import SprintCard from '@/Components/SprintCard';
import { BoundaryNote, ClusterGrid, DataTable, FaqList } from '@/Components/Blocks';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { Section, SectionHeading } from '@/Components/ui/Section';
import type { NavTab, RoutePageData, SharedProps, Sprint } from '@/types';

interface Extras {
    agentFamilies?: { family: string; agents: string }[];
    agentTiers?: { tier: number; action: string; rule: string }[];
    dashboards?: { name: string; metrics: string }[];
    sequence?: string[];
    dealRoomStages?: string[];
    waves?: { wave: string; focus: string; gate: string }[];
}

interface RoutePageProps {
    page: RoutePageData;
    tab: NavTab | null;
    related: Sprint[];
    extras: Extras;
}

export default function RoutePage({ page, tab, related, extras }: RoutePageProps) {
    const { context } = usePage<SharedProps>().props;

    return (
        <>
            <Head title={page.title} />

            <PageHeader
                eyebrow={tab?.purpose}
                title={page.title}
                lead={page.lead}
                intro={page.intro}
                crumbs={[{ label: 'Home', href: '/' }, { label: page.title }]}
                aside={page.aside ? { ...page.aside, icon: 'shield-check' } : undefined}
            />

            {page.clusters && page.clusters.length > 0 && (
                <Section tone="parchment">
                    <SectionHeading title="What We Deliver" lead="Service clusters and scope." />
                    <div className="mt-8">
                        <ClusterGrid clusters={page.clusters} />
                    </div>
                </Section>
            )}

            {extras.sequence && (
                <Section tone="white">
                    <SectionHeading
                        title="Project Advisory Sequence"
                        lead="Eight service-level steps."
                        body="A detailed service sequence that supports the canonical enterprise method."
                    />
                    <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {extras.sequence.map((step, index) => (
                            <Card as="li" key={step} className="flex items-center gap-3 p-4">
                                <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-gold-400 text-[0.8125rem] font-semibold text-gold-700">
                                    {index + 1}
                                </span>
                                <span className="text-[0.875rem] font-semibold text-ink-900">{step}</span>
                            </Card>
                        ))}
                    </ol>
                </Section>
            )}

            {extras.dealRoomStages && (
                <Section tone="parchment" id="deal-room">
                    <SectionHeading
                        title="Virtual Deal Room"
                        lead="Controlled transaction workflow."
                        body="A distinct high-security boundary with tenant isolation, NDA gates, document classification, evidence logs and auditable closing evidence."
                    />
                    <ol className="mt-8 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-3">
                        {extras.dealRoomStages.map((stage, index) => (
                            <li key={stage} className="flex gap-3 bg-white p-4">
                                <span className="font-serif text-[0.8125rem] font-semibold text-gold-600">
                                    {String(index).padStart(2, '0')}
                                </span>
                                <span className="text-[0.8125rem] leading-relaxed text-ink-700">{stage}</span>
                            </li>
                        ))}
                    </ol>
                </Section>
            )}

            {extras.agentFamilies && (
                <Section tone="white" id="agents">
                    <SectionHeading
                        title="Agentic AI Council"
                        lead="Specialised agents under explicit authority."
                        body="Agents route, draft, check, recommend and trigger approved workflows. Authority is tiered and every material decision stays with a qualified person."
                    />

                    <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        <DataTable
                            columns={['Agent Family', 'Agents and Functions']}
                            rows={extras.agentFamilies.map((f) => [f.family, f.agents])}
                            caption="Agent families"
                        />

                        <div>
                            <h3 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                Authority Tiers
                            </h3>
                            <ol className="mt-4 space-y-2.5">
                                {extras.agentTiers?.map((tier) => (
                                    <li
                                        key={tier.tier}
                                        className="flex gap-3 rounded-[5px] border border-parchment-400 bg-white p-3.5"
                                    >
                                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-gold-400 text-[0.75rem] font-semibold text-gold-700">
                                            {tier.tier}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-[0.8125rem] font-semibold text-ink-900">{tier.action}</p>
                                            <p className="mt-0.5 text-[0.75rem] leading-relaxed text-ink-600">
                                                {tier.rule}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </Section>
            )}

            {extras.dashboards && (
                <Section tone="parchment" id="rpa">
                    <SectionHeading
                        title="Management Control Tower"
                        lead="Every KPI shows formula, source, owner and refresh time."
                    />
                    <ul className="mt-8 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-3">
                        {extras.dashboards.map((dashboard) => (
                            <li key={dashboard.name} className="bg-white p-5">
                                <h3 className="text-[0.875rem] font-semibold tracking-[-0.01em] text-ink-900">
                                    {dashboard.name}
                                </h3>
                                <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-600">
                                    {dashboard.metrics}
                                </p>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {extras.waves && (
                <Section tone="white">
                    <SectionHeading title="Country Activation Waves" lead="Markets go live when the readiness gate passes." />
                    <div className="mt-8">
                        <DataTable
                            columns={['Wave', 'Focus', 'Exit Gate']}
                            rows={extras.waves.map((w) => [w.wave, w.focus, w.gate])}
                            caption="Implementation waves"
                        />
                    </div>
                </Section>
            )}

            {page.users && page.users.length > 0 && (
                <Section tone={extras.waves ? 'parchment' : 'white'}>
                    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                        <div className="lg:col-span-5">
                            <SectionHeading title="Who This Is For" />
                            <ul className="mt-6 space-y-2.5">
                                {page.users.map((user) => (
                                    <li key={user} className="flex gap-3 text-[0.875rem] leading-relaxed text-ink-700">
                                        <Icon name="circle-check" className="mt-0.5 size-4 shrink-0 text-gold-600" />
                                        {user}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {page.boundary && (
                            <div className="lg:col-span-7">
                                <SectionHeading title="Professional Boundary" />
                                <div className="mt-6">
                                    <BoundaryNote title="Where Professional Authority Applies" body={page.boundary} />
                                </div>
                            </div>
                        )}
                    </div>
                </Section>
            )}

            {related.length > 0 && (
                <Section tone="parchment">
                    <SectionHeading title="Related Sprints" lead="Fixed scope. Fixed price. Human reviewed." />
                    <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {related.map((sprint) => (
                            <li key={sprint.code}>
                                <SprintCard sprint={sprint} currency={context.currency} />
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {page.faq && page.faq.length > 0 && (
                <Section tone="white">
                    <SectionHeading title="Questions and Answers" />
                    <div className="mt-8 max-w-4xl">
                        <FaqList items={page.faq} />
                    </div>
                </Section>
            )}

            {page.cta && (
                <CtaBand
                    title={page.cta.title}
                    body={page.cta.body}
                    primary={page.cta.primary}
                    secondary={page.cta.secondary}
                />
            )}
        </>
    );
}
