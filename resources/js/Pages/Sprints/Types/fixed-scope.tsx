import { Head, Link } from '@inertiajs/react';
import { Ban, Brain, ClipboardList, Link2, ListChecks } from 'lucide-react';
import { ArrowItem, Box, CheckList, ExtraPanels, IconGrid, ProcessSteps, Prose } from '@/Components/SprintTypes/A/Blocks';
import PurchaseCard from '@/Components/SprintTypes/A/PurchaseCard';
import { DeliverablesSection, FaqSection, IncludedSection, OutcomesBox, RequirementsSection } from '@/Components/SprintTypes/A/Sections';
import SprintShell from '@/Components/SprintTypes/A/SprintShell';
import { buildTabs } from '@/Components/SprintTypes/A/tabs';
import { asTypeA, type SprintTypeAPageProps } from '@/types/sprint-types-a';

function slugify(s: string) {
    return s
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/** Fixed Scope Service product page (TBCA-F/G/M/W fixed-scope sprints and the 468-row manifest). */
export default function FixedScopeSprint({ sprint, related }: SprintTypeAPageProps) {
    const { attrs, packages } = asTypeA(sprint);
    const relatedTitles = attrs.related ?? [];
    const relatedBySlug = new Map(related.map((r) => [r.title.toLowerCase(), r.slug]));

    const relatedList = relatedTitles.length > 0 && (
        <div>
            <h3 className="mb-2 text-[0.875rem] font-semibold text-ink-900">{attrs.related_title ?? 'Related Sprints'}</h3>
            <ul className="space-y-1.5">
                {relatedTitles.map((t) => (
                    <li key={t}>
                        <Link href={`/sprints/${relatedBySlug.get(t.toLowerCase()) ?? slugify(t)}`} className="block hover:text-gold-700">
                            <ArrowItem>{t}</ArrowItem>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );

    const deliverablesByScope =
        attrs.deliverables_by_scope && Object.keys(attrs.deliverables_by_scope).length
            ? attrs
            : { ...attrs, deliverables_by_scope: Object.fromEntries(packages.map((p) => [p.name, [p.description ?? '', ...(p.features ?? [])].filter(Boolean)])) };

    const limitations = [...(attrs.limitations ?? []), ...(attrs.exclusions ?? [])];

    const overview = (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <div className="space-y-4">
                    <section>
                        <h2 className="mb-1.5 text-[1rem] font-semibold text-ink-900">{attrs.overview_title ?? 'Overview'}</h2>
                        <Prose text={attrs.overview ?? sprint.description} />
                    </section>
                    <section>
                        <h2 className="mb-2 text-[1rem] font-semibold text-ink-900">{attrs.included_title ?? "What's Included (Standard)"}</h2>
                        <IconGrid items={attrs.included ?? []} className="lg:grid-cols-5" />
                    </section>
                </div>
                <OutcomesBox title={attrs.outcomes_title} items={attrs.outcomes} />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr_1fr]">
                <Box title={attrs.process_title ?? 'Your Sprint Journey'} tone="white">
                    <ProcessSteps steps={attrs.process ?? []} icons />
                    {(attrs.simple_terms?.length ?? 0) > 0 && (
                        <div className="mt-5">
                            <h3 className="mb-2 text-[0.875rem] font-semibold text-ink-900">{attrs.simple_terms_title ?? 'In Simple Terms'}</h3>
                            <ol className="grid gap-2 sm:grid-cols-5">
                                {attrs.simple_terms!.map((t, i) => (
                                    <li key={t} className="flex items-start gap-2 text-[0.75rem] font-semibold text-ink-800">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold-500 text-[0.6875rem] font-bold text-ink-900">{i + 1}</span>
                                        {t}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </Box>
                <Box title={attrs.inputs_title ?? 'What We Need From You'} tone="white">
                    {attrs.inputs_lead && <p className="mb-2 text-[0.75rem] font-semibold text-ink-800">{attrs.inputs_lead}</p>}
                    <CheckList items={attrs.inputs ?? []} />
                    {attrs.inputs_turnaround && <p className="mt-3 text-[0.75rem] text-ink-600">{attrs.inputs_turnaround}</p>}
                </Box>
                <Box title={attrs.why_title ?? 'Why This, Not a Free AI Answer?'} icon={Brain} tone="white">
                    <Prose text={attrs.why_text} className="text-[0.8125rem]" />
                    {relatedList && <div className="mt-4">{relatedList}</div>}
                </Box>
            </div>

            <ExtraPanels panels={attrs.extra_panels} />
        </div>
    );

    const tabs = buildTabs(attrs.tabs, ['Overview', "What's Included", 'Process', 'Deliverables', 'Inputs', 'FAQs', 'Limitations'], {
        overview,
        included: <IncludedSection attrs={attrs} />,
        process: (
            <Box title={attrs.process_title ?? 'Your Sprint Journey'} icon={ListChecks} tone="white">
                <ProcessSteps steps={attrs.process ?? []} icons />
                {(attrs.simple_terms?.length ?? 0) > 0 && <CheckList className="mt-5" items={attrs.simple_terms ?? []} columns={2} />}
            </Box>
        ),
        deliverables: <DeliverablesSection attrs={deliverablesByScope} />,
        requirements: <RequirementsSection attrs={{ ...attrs, inputs_title: attrs.inputs_title ?? 'What We Need From You' }} />,
        faqs: <FaqSection attrs={attrs} sprint={sprint} />,
        limitations: (
            <Box title="Limitations & Exclusions" icon={Ban} tone="white">
                <CheckList
                    items={
                        limitations.length
                            ? limitations
                            : ['Government fees, vendor fees and third-party licence costs', 'Regulated professional opinion unless expressly included', 'Guaranteed funding, sales or procurement outcomes', 'Work outside the selected package scope']
                    }
                    tone="muted"
                />
                <p className="mt-3 text-[0.75rem] text-ink-500">Prices exclude VAT (15%, stated separately). Turnaround starts after complete intake.</p>
            </Box>
        ),
        support: (
            <Box title="Support Route" icon={Link2} tone="white">
                <CheckList items={attrs.support_lines?.length ? attrs.support_lines : ['Support follows the package support class (S0 / S1 / S2).', 'Corrections are handled through the controlled version route.']} />
            </Box>
        ),
        rights: (
            <Box title="Usage & Rights" icon={ClipboardList} tone="white">
                <CheckList items={(attrs.facts ?? []).map((f) => `${f.label}: ${f.value}`)} columns={2} />
            </Box>
        ),
    });

    return (
        <>
            <Head title={`${sprint.title} | Fixed Scope Service`} />
            <SprintShell
                sprint={sprint}
                attrs={attrs}
                related={related}
                tabs={tabs}
                card={
                    <PurchaseCard
                        sprint={sprint}
                        packages={packages}
                        heading={attrs.package_heading ?? 'Choose Your Package'}
                        primaryLabel={attrs.cta_primary ?? 'Start This Sprint'}
                        secondaryLabel={attrs.cta_secondary ?? 'Compare Packages'}
                        note={attrs.cta_note ?? 'Prices exclude VAT • ZAR • Fixed Scope Service'}
                        trust={attrs.trust_icons ?? []}
                        scopeLink={attrs.scope_link}
                    />
                }
            />
        </>
    );
}
