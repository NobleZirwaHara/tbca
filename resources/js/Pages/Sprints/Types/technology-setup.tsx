import { Head } from '@inertiajs/react';
import { Award, Cog, FileCheck, ListChecks, Settings, Users, Workflow } from 'lucide-react';
import { Box, CheckList, ExtraPanels, GovernanceStrip, IconGrid, ProcessSteps, Prose } from '@/Components/SprintTypes/A/Blocks';
import PurchaseCard from '@/Components/SprintTypes/A/PurchaseCard';
import { DeliverablesSection, FaqSection, IncludedSection, OutcomesBox, ProcessSection, RequirementsSection, SupportSection } from '@/Components/SprintTypes/A/Sections';
import SprintShell from '@/Components/SprintTypes/A/SprintShell';
import { buildTabs } from '@/Components/SprintTypes/A/tabs';
import HeroVisual from '@/Components/SprintTypes/A/HeroVisual';
import { asTypeA, type SprintTypeAPageProps } from '@/types/sprint-types-a';

/** Technology Setup Sprint product page (TIS-PG-001 … TIS-PG-100). */
export default function TechnologySetupSprint({ sprint, related }: SprintTypeAPageProps) {
    const { attrs, packages } = asTypeA(sprint);

    const whoFor = attrs.who_for ?? [];
    const why = attrs.why ?? [];

    const overview = (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
                <div className="space-y-5">
                    <section>
                        <h2 className="mb-2 flex items-center gap-2 text-[1.0625rem] font-semibold text-ink-900">
                            <Cog className="size-4.5 text-ink-700" aria-hidden="true" />
                            {attrs.overview_title ?? 'Overview'}
                        </h2>
                        <Prose text={attrs.overview ?? sprint.description} />
                    </section>
                    <section>
                        <h2 className="mb-3 flex items-center gap-2 text-[1.0625rem] font-semibold text-ink-900">
                            <ListChecks className="size-4.5 text-ink-700" aria-hidden="true" />
                            {attrs.included_title ?? "What's Included"}
                        </h2>
                        <IconGrid items={attrs.included ?? []} />
                    </section>
                </div>
                <OutcomesBox title={attrs.outcomes_title} items={attrs.outcomes} />
            </div>

            <div className={whoFor.length ? 'grid gap-5 xl:grid-cols-[1.3fr_1fr_0.8fr]' : 'grid gap-5 xl:grid-cols-[1.3fr_1fr]'}>
                <Box title={attrs.deliverables_title ?? 'Deliverables Checklist'} icon={FileCheck}>
                    <CheckList items={attrs.deliverables ?? []} columns={(attrs.deliverables?.length ?? 0) > 6 ? 2 : 1} />
                </Box>
                <Box title={attrs.process_title ?? 'Technology Setup Process'} icon={Workflow}>
                    <ProcessSteps steps={attrs.process ?? []} />
                </Box>
                {whoFor.length > 0 && (
                    <Box title={attrs.who_for_title ?? "Who It's For"} icon={Users}>
                        <CheckList items={whoFor} />
                    </Box>
                )}
            </div>

            {(why.length > 0 || attrs.tools_used || attrs.delivery_mode || (attrs.aligns_with?.length ?? 0) > 0) && (
                <div className="grid gap-5 md:grid-cols-2">
                    {why.length > 0 && (
                        <Box title={attrs.why_title ?? 'Why Choose TBCA?'} icon={Award} tone="white">
                            <CheckList items={why} />
                        </Box>
                    )}
                    {(attrs.tools_used || attrs.delivery_mode || (attrs.aligns_with?.length ?? 0) > 0) && (
                        <Box title="Tools & Delivery" icon={Settings} tone="white">
                            <dl className="space-y-2 text-[0.8125rem]">
                                {attrs.tools_used && (
                                    <div>
                                        <dt className="font-semibold text-ink-900">Tools Used</dt>
                                        <dd className="text-ink-600">{attrs.tools_used}</dd>
                                    </div>
                                )}
                                {attrs.delivery_mode && (
                                    <div>
                                        <dt className="font-semibold text-ink-900">Delivery Mode</dt>
                                        <dd className="text-ink-600">{attrs.delivery_mode}</dd>
                                    </div>
                                )}
                                {(attrs.aligns_with?.length ?? 0) > 0 && (
                                    <div>
                                        <dt className="font-semibold text-ink-900">Aligns With</dt>
                                        <dd className="text-ink-600">{attrs.aligns_with!.join(' · ')}</dd>
                                    </div>
                                )}
                            </dl>
                        </Box>
                    )}
                </div>
            )}

            <ExtraPanels panels={attrs.extra_panels} />
            <GovernanceStrip items={attrs.governance ?? []} />
        </div>
    );

    const tabs = buildTabs(attrs.tabs, ['Overview', "What's Included", 'Process', 'Requirements', 'FAQs', 'Support'], {
        overview,
        included: <IncludedSection attrs={attrs} />,
        process: (
            <ProcessSection
                attrs={attrs}
                extra={
                    whoFor.length > 0 && (
                        <Box title={attrs.who_for_title ?? "Who It's For"} icon={Users} tone="white">
                            <CheckList items={whoFor} columns={2} />
                        </Box>
                    )
                }
            />
        ),
        deliverables: <DeliverablesSection attrs={attrs} />,
        requirements: <RequirementsSection attrs={attrs} />,
        faqs: <FaqSection attrs={attrs} sprint={sprint} />,
        support: <SupportSection attrs={attrs} sprint={sprint} packages={packages} />,
        assets: (
            <div className="space-y-5">
                {attrs.visual && <HeroVisual visual={attrs.visual} />}
                <DeliverablesSection attrs={attrs} />
            </div>
        ),
    });

    return (
        <>
            <Head title={`${sprint.title} | Technology Setup Sprint`} />
            <SprintShell
                sprint={sprint}
                attrs={attrs}
                related={related}
                tabs={tabs}
                card={
                    <PurchaseCard
                        sprint={sprint}
                        packages={packages}
                        heading={attrs.package_heading ?? 'Choose Your Sprint Package'}
                        quote={sprint.commercial_act === 'quote'}
                        primaryLabel={attrs.cta_primary ?? 'Start Sprint'}
                        secondaryLabel={attrs.cta_secondary ?? 'Book Discovery Call'}
                        note={attrs.cta_note}
                        trust={attrs.trust_icons ?? ['Secure Payment', 'Scope Controlled', 'Vendor Disclosed', 'VAT Exclusive']}
                        scopeLink={attrs.scope_link ?? 'Need a different scope? Request Scope Review'}
                        preview={{ title: attrs.deliverables_title ?? 'Deliverables', items: [...(attrs.deliverables ?? []), ...(attrs.included ?? [])] }}
                    />
                }
            />
        </>
    );
}
