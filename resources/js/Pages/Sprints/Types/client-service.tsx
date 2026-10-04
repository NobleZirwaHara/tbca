import { Head } from '@inertiajs/react';
import { Ban, ClipboardList, FileCheck, PackagePlus, Scale, Target, Truck, Workflow } from 'lucide-react';
import { Box, CheckList, ComparisonTable, ExtraPanels, IconGrid, ProcessSteps, Prose } from '@/Components/SprintTypes/A/Blocks';
import { itemIcon } from '@/Components/SprintTypes/A/icons';
import PurchaseCard from '@/Components/SprintTypes/A/PurchaseCard';
import { FaqSection, SupportSection } from '@/Components/SprintTypes/A/Sections';
import SprintShell from '@/Components/SprintTypes/A/SprintShell';
import { buildTabs } from '@/Components/SprintTypes/A/tabs';
import { asTypeA, type SprintTypeAPageProps } from '@/types/sprint-types-a';

/** Client Service Sprint product page (CS mockups + the 338-row Client Service register). */
export default function ClientServiceSprint({ sprint, related }: SprintTypeAPageProps) {
    const { attrs, packages } = asTypeA(sprint);
    const completion = attrs.completion?.length ? attrs.completion : (attrs.outcomes ?? []);
    const delivery = (attrs.delivery_support ?? []).map((d) => (typeof d === 'string' ? d : String((d as { label?: string }).label ?? '')));

    const deliverables = (
        <Box
            title={attrs.deliverables_title ?? 'Deliverables Checklist'}
            icon={FileCheck}
            tone="white"
            aside={<span className="text-[0.6875rem] text-ink-500">Standard package shown</span>}
        >
            <CheckList items={attrs.deliverables ?? []} columns={3} />
        </Box>
    );

    const process = (
        <Box title={attrs.process_title ?? '5-Step TBCA Sprint Process'} icon={Workflow} tone="white">
            <ProcessSteps steps={attrs.process ?? []} />
        </Box>
    );

    const inputs = (
        <Box title={attrs.inputs_title ?? 'What We Need From You'} icon={ClipboardList} tone="white">
            <CheckList items={attrs.inputs ?? []} columns={2} />
            {attrs.inputs_note && <p className="mt-2 text-[0.75rem] text-ink-500 italic">{attrs.inputs_note}</p>}
        </Box>
    );

    const deliveryBox = delivery.length > 0 && (
        <Box title="Delivery & Support" icon={Truck} tone="white">
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                {delivery.map((d) => {
                    const Icon = itemIcon(d);
                    return (
                        <li key={d} className="flex flex-col items-center gap-1.5 text-center text-[0.6875rem] leading-tight text-ink-700">
                            <Icon className="size-6 text-ink-700" strokeWidth={1.5} aria-hidden="true" />
                            {d}
                        </li>
                    );
                })}
            </ul>
        </Box>
    );

    const extras = (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.2fr]">
            {(attrs.add_ons?.length ?? 0) > 0 && (
                <Box title="Optional Add-Ons" icon={PackagePlus} tone="white">
                    <CheckList items={attrs.add_ons ?? []} columns={2} />
                </Box>
            )}
            {attrs.exclusions_text && (
                <Box title="Exclusions" icon={Ban} tone="white">
                    <p className="text-[0.75rem] leading-relaxed text-ink-600">{attrs.exclusions_text}</p>
                </Box>
            )}
            {attrs.comparison && (
                <Box title={attrs.comparison.title ?? 'Why TBCA Instead of a Generic Free Output'} icon={Scale} tone="white" className="md:col-span-2 xl:col-span-1">
                    <ComparisonTable data={attrs.comparison} />
                </Box>
            )}
        </div>
    );

    const overview = (
        <div className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-[1.2fr_1.3fr_1fr]">
                <Box title={attrs.overview_title ?? 'Overview'} tone="white">
                    <Prose text={attrs.overview ?? sprint.description} className="text-[0.8125rem]" />
                </Box>
                <Box title={attrs.included_title ?? "What's Included (Standard S1)"} tone="white">
                    <IconGrid items={attrs.included ?? []} className="lg:grid-cols-3 xl:grid-cols-3" />
                </Box>
                <Box title={attrs.completion_title ?? 'Key Completion Points'} icon={Target}>
                    <CheckList items={completion} />
                </Box>
            </div>
            <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
                {deliverables}
                {process}
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
                {inputs}
                {deliveryBox}
            </div>
            {extras}
            {(attrs.feature_band?.length ?? 0) > 0 && (
                <ul className="grid gap-3 rounded-[8px] border border-gold-200/70 bg-gold-50/60 p-4 sm:grid-cols-3 xl:grid-cols-6">
                    {attrs.feature_band!.map((f) => {
                        const Icon = itemIcon(f.title);
                        return (
                            <li key={f.title} className="flex items-start gap-2">
                                <Icon className="mt-0.5 size-6 shrink-0 text-gold-600" strokeWidth={1.5} aria-hidden="true" />
                                <span>
                                    <span className="block text-[0.75rem] font-semibold text-ink-900">{f.title}</span>
                                    {f.body && <span className="block text-[0.6875rem] text-ink-500">{f.body}</span>}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
            <ExtraPanels panels={attrs.extra_panels} />
        </div>
    );

    const tabs = buildTabs(attrs.tabs, ['Overview', "What's Included", 'Process', 'Deliverables', 'Requirements', 'FAQs'], {
        overview,
        included: (
            <div className="space-y-5">
                <Box title={attrs.included_title ?? "What's Included (Standard S1)"} tone="white">
                    <IconGrid items={attrs.included ?? []} />
                </Box>
                {extras}
            </div>
        ),
        process,
        deliverables: (
            <div className="space-y-5">
                {deliverables}
                {deliveryBox}
            </div>
        ),
        requirements: inputs,
        faqs: <FaqSection attrs={attrs} sprint={sprint} />,
        support: <SupportSection attrs={attrs} sprint={sprint} packages={packages} />,
    });

    return (
        <>
            <Head title={`${sprint.title} | Client Service Sprint`} />
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
                        heading={attrs.package_heading ?? 'Choose Your Sprint Package'}
                        primaryLabel={attrs.cta_primary ?? 'Order Sprint'}
                        secondaryLabel={attrs.cta_secondary ?? 'Book Discovery Call'}
                        note={attrs.cta_note ?? 'VAT exclusive | VAT added separately'}
                        trust={attrs.trust_icons ?? []}
                        scopeLink={attrs.scope_link}
                    />
                }
            />
        </>
    );
}
