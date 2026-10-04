import { Head } from '@inertiajs/react';
import { Bot, ClipboardList, FileCheck, LifeBuoy, ShieldCheck, Workflow } from 'lucide-react';
import { Box, CheckList, ExtraPanels, IconGrid, ProcessSteps, Prose } from '@/Components/SprintTypes/A/Blocks';
import { itemIcon } from '@/Components/SprintTypes/A/icons';
import PurchaseCard from '@/Components/SprintTypes/A/PurchaseCard';
import { DeliverablesSection, FaqSection, IncludedSection, OutcomesBox, RequirementsSection, SupportSection } from '@/Components/SprintTypes/A/Sections';
import SprintShell from '@/Components/SprintTypes/A/SprintShell';
import { buildTabs } from '@/Components/SprintTypes/A/tabs';
import { asTypeA, type SprintTypeAPageProps } from '@/types/sprint-types-a';

/** Partner-Delivered (quote-route) sprint product page (PDS-PG-001 … PDS-PG-020). */
export default function PartnerDeliveredSprint({ sprint, related }: SprintTypeAPageProps) {
    const { attrs, packages } = asTypeA(sprint);
    const controls = attrs.controls ?? [];

    const controlsBox = (
        <Box title={attrs.controls_title ?? 'Engagement Controls'} icon={ShieldCheck} tone="white">
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {controls.map((c) => {
                    const Icon = itemIcon(c);
                    return (
                        <li key={c} className="flex flex-col items-center gap-1.5 rounded-[6px] border border-parchment-400 bg-parchment-100 px-2 py-3 text-center text-[0.6875rem] leading-tight text-ink-700">
                            <Icon className="size-6 text-gold-600" strokeWidth={1.5} aria-hidden="true" />
                            {c}
                        </li>
                    );
                })}
            </ul>
        </Box>
    );

    const notes = (
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr_0.9fr]">
            {attrs.ai_note && (
                <Box tone="white">
                    <p className="flex items-start gap-3 text-[0.8125rem] text-ink-700">
                        <Bot className="size-8 shrink-0 text-gold-600" strokeWidth={1.5} aria-hidden="true" />
                        {attrs.ai_note}
                    </p>
                </Box>
            )}
            {attrs.scope_notes && (
                <Box title={attrs.scope_notes_title ?? 'Scope Notes / Not Included'} tone="white">
                    <p className="text-[0.75rem] leading-relaxed text-ink-600">{attrs.scope_notes}</p>
                </Box>
            )}
            {(attrs.support_lines?.length ?? 0) > 0 && (
                <Box title={attrs.support_title ?? 'Support / Review'} icon={LifeBuoy} tone="white">
                    <ul className="space-y-1 text-[0.75rem] text-ink-600">
                        {attrs.support_lines!.map((l) => (
                            <li key={l}>{l}</li>
                        ))}
                    </ul>
                </Box>
            )}
        </div>
    );

    const overview = (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <section className="space-y-2 text-[0.875rem] leading-relaxed text-ink-700">
                    <h2 className="text-[1rem] font-semibold text-ink-900">{attrs.overview_title ?? 'Overview'}</h2>
                    {attrs.client_problem && (
                        <p>
                            <strong className="text-ink-900">Client problem:</strong> {attrs.client_problem}
                        </p>
                    )}
                    {attrs.short_description && (
                        <p>
                            <strong className="text-ink-900">Short description:</strong> {attrs.short_description}
                        </p>
                    )}
                    {attrs.long_description && (
                        <p>
                            <strong className="text-ink-900">Long description:</strong> {attrs.long_description}
                        </p>
                    )}
                    {!attrs.client_problem && <Prose text={attrs.overview ?? sprint.description} />}
                </section>
                <OutcomesBox title={attrs.outcomes_title} items={attrs.outcomes} />
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <Box title={attrs.included_title ?? "What's Included"}>
                    <IconGrid items={attrs.included ?? []} />
                </Box>
                <Box title={attrs.inputs_title ?? 'Client Inputs'} icon={ClipboardList} tone="white">
                    <CheckList items={attrs.inputs ?? []} columns={2} />
                </Box>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
                <DeliverablesSection attrs={attrs} />
                <Box title={attrs.process_title ?? '5-Step Partner Delivery Process'} icon={Workflow} tone="white">
                    <ProcessSteps steps={attrs.process ?? []} />
                </Box>
            </div>

            {controls.length > 0 && controlsBox}
            {notes}
            <ExtraPanels panels={attrs.extra_panels} />
        </div>
    );

    const tabs = buildTabs(attrs.tabs, ['Overview', "What's Included", 'Process', 'Inputs', 'Deliverables', 'Controls'], {
        overview,
        included: <IncludedSection attrs={attrs} />,
        process: (
            <Box title={attrs.process_title ?? '5-Step Partner Delivery Process'} icon={Workflow} tone="white">
                <ProcessSteps steps={attrs.process ?? []} />
            </Box>
        ),
        requirements: <RequirementsSection attrs={{ ...attrs, inputs_title: attrs.inputs_title ?? 'Client Inputs' }} />,
        deliverables: <DeliverablesSection attrs={attrs} />,
        controls: (
            <div className="space-y-5">
                {controlsBox}
                {notes}
            </div>
        ),
        faqs: <FaqSection attrs={attrs} sprint={sprint} />,
        support: <SupportSection attrs={attrs} sprint={sprint} packages={packages} />,
        limitations: (
            <Box title={attrs.scope_notes_title ?? 'Scope Notes / Not Included'} icon={FileCheck} tone="white">
                <Prose text={attrs.scope_notes} />
            </Box>
        ),
    });

    return (
        <>
            <Head title={`${sprint.title} | Partner-Delivered Sprint`} />
            <SprintShell
                sprint={sprint}
                attrs={attrs}
                related={related}
                tabs={tabs}
                serifTitle
                card={
                    <PurchaseCard
                        sprint={sprint}
                        packages={packages}
                        heading={attrs.package_heading ?? 'Choose Your Sprint Scope'}
                        quote
                        primaryLabel={attrs.cta_primary ?? 'Request Final Quote'}
                        secondaryLabel={attrs.cta_secondary ?? 'Book Discovery Call'}
                        note={attrs.cta_note ?? 'VAT-exclusive; VAT 15% stated separately.'}
                        trust={attrs.trust_icons ?? ['Human Review', 'Partner Review', 'Scope Confirmed Before Final Quote']}
                        scopeLink={attrs.scope_link}
                    />
                }
            />
        </>
    );
}
