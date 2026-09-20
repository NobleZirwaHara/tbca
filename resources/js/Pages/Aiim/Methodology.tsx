import { Head } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import { BoundaryNote, DataTable } from '@/Components/Blocks';
import Card from '@/Components/ui/Card';
import { ConfidenceChip } from '@/Components/ui/LedgerChip';
import { Section, SectionHeading } from '@/Components/ui/Section';

interface Props {
    sourceTiers: { tier: string; sources: string; use: string }[];
    confidenceGrades: { grade: string; definition: string; treatment: string }[];
    curationStages: { stage: string; treatment: string }[];
    metadata: string[];
    routes: { page: string; route: string; purpose: string }[];
}

export default function AiimMethodology({ sourceTiers, confidenceGrades, curationStages, metadata, routes }: Props) {
    return (
        <>
            <Head title="How AIIM Sources and Verifies" />

            <PageHeader
                eyebrow="Data, provenance and confidence"
                title="How AIIM Sources and Verifies"
                lead="Every Insight Carries Its Evidence."
                intro="AIIM records are ingested, validated, verified, enriched, reviewed, published, monitored and retired under a controlled lifecycle. Records below the approved confidence threshold stay unpublished or are clearly labelled and routed to human verification."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'AIIM', href: '/aiim' }, { label: 'Methodology' }]}
                aside={{
                    title: 'Non-Negotiable Standard',
                    body: 'Every visible insight carries source, date, confidence, update frequency and verification status.',
                    items: metadata.slice(0, 4),
                    icon: 'shield-check',
                }}
            />

            <Section tone="parchment">
                <SectionHeading title="Source Tiers" lead="Where the evidence comes from." />
                <div className="mt-7">
                    <DataTable
                        columns={['Tier', 'Source Type', 'Use']}
                        rows={sourceTiers.map((t) => [t.tier, t.sources, t.use])}
                        caption="AIIM data source tiers"
                    />
                </div>
            </Section>

            <Section tone="white">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-5">
                        <SectionHeading title="Confidence Grades" lead="How a record is treated on the platform." />
                        <ul className="mt-7 space-y-3">
                            {confidenceGrades.map((grade) => (
                                <Card as="li" key={grade.grade} className="p-4">
                                    <ConfidenceChip grade={grade.grade} />
                                    <p className="mt-2.5 text-[0.8125rem] font-semibold text-ink-900">{grade.definition}</p>
                                    <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-600">{grade.treatment}</p>
                                </Card>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-7">
                        <SectionHeading title="Curation Lifecycle" lead="Eight controlled stages." />
                        <ol className="mt-7 space-y-2.5">
                            {curationStages.map((stage, index) => (
                                <Card as="li" key={stage.stage} className="flex gap-3.5 p-4">
                                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-gold-400 text-[0.8125rem] font-semibold text-gold-700">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[0.875rem] font-semibold text-ink-900">{stage.stage}</p>
                                        <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-600">
                                            {stage.treatment}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </ol>
                    </div>
                </div>
            </Section>

            <Section tone="parchment">
                <SectionHeading title="Required Record Metadata" lead="Present on every published AIIM record." />
                <ul className="mt-7 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {metadata.map((field) => (
                        <Card as="li" key={field} className="px-3.5 py-2.5 text-[0.8125rem] text-ink-700">
                            {field}
                        </Card>
                    ))}
                </ul>

                <div className="mt-10">
                    <BoundaryNote body="AIIM supports decision preparation. It does not constitute legal, tax, investment or regulated professional advice. Findings should be verified against primary sources before a transaction commitment." />
                </div>
            </Section>

            <Section tone="white">
                <SectionHeading title="AIIM Page Architecture" lead="Canonical routes." />
                <div className="mt-7">
                    <DataTable
                        columns={['Page', 'Route', 'Purpose']}
                        rows={routes.map((r) => [r.page, r.route, r.purpose])}
                        caption="AIIM routes"
                    />
                </div>
            </Section>

            <CtaBand
                title="Questions about a source or a record?"
                body="Every record has an owner. Ask us and we will show the source, date, confidence and review history."
                primary={{ label: 'Ask a Question', href: '/contact' }}
                secondary={{ label: 'Explore AIIM', href: '/aiim' }}
            />
        </>
    );
}
