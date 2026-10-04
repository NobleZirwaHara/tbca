import { Head } from '@inertiajs/react';
import { Ban, ClipboardList, FileCheck, Layers, ListChecks, Scale, ShieldCheck, Workflow } from 'lucide-react';
import { Box, CheckList, ComparisonTable, ExtraPanels, FactList, ProcessSteps, Prose } from '@/Components/SprintTypes/A/Blocks';
import { itemIcon } from '@/Components/SprintTypes/A/icons';
import PurchaseCard from '@/Components/SprintTypes/A/PurchaseCard';
import { FaqSection, OutcomesBox, RequirementsSection } from '@/Components/SprintTypes/A/Sections';
import SprintShell from '@/Components/SprintTypes/A/SprintShell';
import { buildTabs } from '@/Components/SprintTypes/A/tabs';
import { asTypeA, type SprintTypeAPageProps } from '@/types/sprint-types-a';

/** Checklist Sprint product page (CHK mockups + the 327-row Checklist register). */
export default function ChecklistSprint({ sprint, related }: SprintTypeAPageProps) {
    const { attrs, packages } = asTypeA(sprint);
    const facts = attrs.facts ?? [];

    const factsPanel = facts.length > 0 && (
        <div className="mt-4">
            <FactList
                items={facts}
                footer={
                    (attrs.as_at || attrs.review_cadence) && (
                        <p className="px-1 pt-1 text-[0.75rem] text-ink-500">
                            {attrs.as_at && <span className="block">As at {attrs.as_at}</span>}
                            {attrs.review_cadence && <span className="block">Review cadence: {attrs.review_cadence}</span>}
                        </p>
                    )
                }
            />
        </div>
    );

    const deliverables = (
        <Box
            title={(attrs.deliverables_title ?? 'Checklist Deliverables').replace(/\s*\(Standard package shown\)/i, '')}
            icon={FileCheck}
            aside={<span className="rounded-[3px] bg-gold-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-gold-800">Standard package shown</span>}
        >
            <CheckList items={attrs.deliverables ?? []} />
        </Box>
    );

    const included = (
        <Box title={attrs.included_title ?? "What's Included (Standard)"} icon={ListChecks} tone="white">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                {(attrs.included ?? []).map((item) => {
                    const Icon = itemIcon(item);
                    return (
                        <li key={item} className="flex items-center gap-2 text-[0.75rem] leading-tight text-ink-700">
                            <Icon className="size-7 shrink-0 text-gold-600" strokeWidth={1.5} aria-hidden="true" />
                            {item}
                        </li>
                    );
                })}
            </ul>
        </Box>
    );

    const exclusions = (
        <Box title="Exclusions" icon={Ban} tone="white">
            <CheckList items={attrs.exclusions ?? []} columns={2} tone="muted" />
        </Box>
    );

    const overview = (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                <Box title={attrs.overview_title ?? 'Overview'} tone="white">
                    <Prose text={attrs.overview ?? sprint.description} className="text-[0.8125rem]" />
                </Box>
                <OutcomesBox title={attrs.outcomes_title ?? 'Key Checklist Benefits'} items={attrs.outcomes} />
            </div>

            {included}

            <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
                {deliverables}
                <Box title={attrs.process_title ?? 'Your 6-Step Checklist Process'} icon={Workflow}>
                    <ProcessSteps steps={attrs.process ?? []} />
                </Box>
                <Box title={attrs.inputs_title ?? 'What You May Need'} icon={ClipboardList}>
                    <CheckList items={attrs.inputs ?? []} />
                    {attrs.inputs_note && <p className="mt-2 text-[0.75rem] text-ink-500">{attrs.inputs_note}</p>}
                </Box>
            </div>

            <div className="grid gap-5 xl:grid-cols-[0.9fr_1fr_1.4fr]">
                <Box title="Companion Assets" icon={Layers}>
                    <CheckList items={attrs.companion_assets ?? []} />
                </Box>
                {exclusions}
                {attrs.comparison && (
                    <Box title={attrs.comparison.title ?? 'Why TBCA Instead of a Generic Free Solution'} icon={Scale} tone="white">
                        <ComparisonTable data={attrs.comparison} />
                    </Box>
                )}
            </div>
            <ExtraPanels panels={attrs.extra_panels} />
        </div>
    );

    const tabs = buildTabs(attrs.tabs, ['Overview', "What's Included", 'How It Works', 'Checklist Deliverables', 'Usage & Rights', 'FAQs'], {
        overview,
        included: (
            <div className="space-y-5">
                {included}
                <Box title="Companion Assets" icon={Layers}>
                    <CheckList items={attrs.companion_assets ?? []} columns={2} />
                </Box>
            </div>
        ),
        process: (
            <div className="space-y-5">
                <Box title={attrs.process_title ?? 'Your 6-Step Checklist Process'} icon={Workflow}>
                    <ProcessSteps steps={attrs.process ?? []} />
                </Box>
                <RequirementsSection attrs={{ ...attrs, inputs_title: attrs.inputs_title ?? 'What You May Need' }} />
            </div>
        ),
        deliverables: (
            <div className="space-y-5">
                {deliverables}
                <div className="grid gap-4 md:grid-cols-3">
                    {packages.map((p) => (
                        <Box key={p.key} title={p.name} tone="white">
                            <p className="text-[0.8125rem] text-ink-700">{p.description}</p>
                            {(p.features ?? []).map((f) => (
                                <p key={f} className="mt-2 text-[0.75rem] text-ink-500">
                                    {f}
                                </p>
                            ))}
                        </Box>
                    ))}
                </div>
            </div>
        ),
        rights: (
            <div className="grid gap-5 md:grid-cols-2">
                <Box title="Usage & Rights" icon={ShieldCheck} tone="white">
                    <FactList items={facts} />
                </Box>
                {exclusions}
            </div>
        ),
        requirements: <RequirementsSection attrs={{ ...attrs, inputs_title: attrs.inputs_title ?? 'What You May Need' }} />,
        faqs: <FaqSection attrs={attrs} sprint={sprint} />,
        limitations: exclusions,
    });

    return (
        <>
            <Head title={`${sprint.title} | Checklist Sprint`} />
            <SprintShell
                sprint={sprint}
                attrs={attrs}
                related={related}
                tabs={tabs}
                serifTitle
                wideCard
                card={
                    <>
                        <PurchaseCard
                            sprint={sprint}
                            packages={packages}
                            layout="columns"
                            heading={attrs.package_heading ?? 'Choose Your Checklist Package'}
                            primaryLabel={attrs.cta_primary ?? 'Get Checklist'}
                            secondaryLabel={attrs.cta_secondary ?? 'Ask a Question'}
                            note={attrs.cta_note ?? 'VAT-exclusive | VAT 15% stated separately'}
                            trust={attrs.trust_icons ?? []}
                            scopeLink={attrs.scope_link}
                        />
                        {factsPanel}
                    </>
                }
            />
        </>
    );
}
