import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { ClipboardList, FileCheck, HelpCircle, LifeBuoy, ListChecks, Target, Workflow } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import type { SprintRecord } from '@/types';
import type { SprintTypeAAttributes, SprintTypeAPackage } from '@/types/sprint-types-a';
import { Box, CheckList, Faqs, GovernanceStrip, IconGrid, ProcessSteps } from './Blocks';
import { usePackagePrice } from './PurchaseCard';

/* Reusable tab bodies shared by the Group A templates. */

export function IncludedSection({ attrs }: { attrs: SprintTypeAAttributes }) {
    return (
        <div className="space-y-5">
            <Box title={attrs.included_title ?? "What's Included"} icon={ListChecks} tone="white">
                <IconGrid items={attrs.included ?? []} />
            </Box>
            {(attrs.deliverables?.length ?? 0) > 0 && (
                <Box title={attrs.deliverables_title ?? 'Deliverables Checklist'} icon={FileCheck}>
                    <CheckList items={attrs.deliverables ?? []} columns={2} />
                </Box>
            )}
        </div>
    );
}

export function ProcessSection({ attrs, extra }: { attrs: SprintTypeAAttributes; extra?: ReactNode }) {
    return (
        <div className="space-y-5">
            <Box title={attrs.process_title ?? 'Process'} icon={Workflow}>
                <ProcessSteps steps={attrs.process ?? []} />
            </Box>
            {extra}
        </div>
    );
}

export function RequirementsSection({ attrs }: { attrs: SprintTypeAAttributes }) {
    return (
        <Box title={attrs.inputs_title ?? 'What We Need From You'} icon={ClipboardList}>
            {attrs.inputs_lead && <p className="mb-2 text-[0.8125rem] font-semibold text-ink-800">{attrs.inputs_lead}</p>}
            <CheckList items={attrs.inputs ?? []} columns={2} />
            {attrs.inputs_turnaround && <p className="mt-3 text-[0.8125rem] text-ink-600">{attrs.inputs_turnaround}</p>}
            {attrs.inputs_note && <p className="mt-3 text-[0.75rem] text-ink-500 italic">{attrs.inputs_note}</p>}
        </Box>
    );
}

export function DeliverablesSection({ attrs }: { attrs: SprintTypeAAttributes }) {
    const byScope = attrs.deliverables_by_scope;
    if (byScope && Object.keys(byScope).length) {
        return (
            <Box title={attrs.deliverables_title ?? 'Deliverables by Scope'} icon={FileCheck}>
                <div className="grid gap-5 md:grid-cols-3">
                    {Object.entries(byScope).map(([scope, items]) => (
                        <div key={scope}>
                            <h4 className="mb-2 text-[0.8125rem] font-bold text-ink-900">{scope}</h4>
                            <CheckList items={items} />
                        </div>
                    ))}
                </div>
            </Box>
        );
    }
    return (
        <Box title={attrs.deliverables_title ?? 'Deliverables'} icon={FileCheck}>
            <CheckList items={attrs.deliverables?.length ? attrs.deliverables : (attrs.included ?? [])} columns={2} />
        </Box>
    );
}

export function FaqSection({ attrs, sprint }: { attrs: SprintTypeAAttributes; sprint: SprintRecord }) {
    return (
        <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink-900">
                <HelpCircle className="size-4.5 text-gold-600" aria-hidden="true" />
                Frequently Asked Questions
            </h3>
            <Faqs items={attrs.faqs ?? []} />
            <button
                type="button"
                onClick={() => openAskQuestion({ subject: sprint.title, section: 'sprints' })}
                className="text-[0.8125rem] font-semibold text-gold-700 underline underline-offset-2 hover:text-gold-800"
            >
                Still unsure? Ask TBCA about scope, packages, inputs or delivery.
            </button>
        </div>
    );
}

/** Package-by-package delivery and support summary, plus governance strip. */
export function SupportSection({ attrs, sprint, packages }: { attrs: SprintTypeAAttributes; sprint: SprintRecord; packages: SprintTypeAPackage[] }) {
    const priceOf = usePackagePrice();
    return (
        <div className="space-y-5">
            <Box title="Delivery & Support by Package" icon={LifeBuoy} tone="white">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[480px] text-left text-[0.8125rem]">
                        <thead>
                            <tr className="border-b border-parchment-400 text-ink-500">
                                <th scope="col" className="py-2 pr-4 font-medium">Package</th>
                                <th scope="col" className="py-2 pr-4 font-medium">Price</th>
                                <th scope="col" className="py-2 pr-4 font-medium">Delivery</th>
                                <th scope="col" className="py-2 font-medium">Scope</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.map((p) => (
                                <tr key={p.key} className="border-b border-parchment-300 align-top">
                                    <td className="py-2 pr-4 font-semibold text-ink-900">{p.name}</td>
                                    <td className="py-2 pr-4 whitespace-nowrap text-gold-700">{priceOf(p)}</td>
                                    <td className="py-2 pr-4 text-ink-600">{p.delivery ?? sprint.delivery ?? '—'}</td>
                                    <td className="py-2 text-ink-600">{p.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {(attrs.support_lines?.length ?? 0) > 0 && <CheckList className="mt-3" items={attrs.support_lines ?? []} />}
            </Box>
            <GovernanceStrip items={attrs.governance ?? []} />
            <p className="text-[0.8125rem] text-ink-600">
                Need something outside these packages?{' '}
                <Link href={`/sprints/${sprint.slug}/quote?intent=scope-review`} className="font-semibold text-gold-700 underline underline-offset-2">
                    Request a scope review
                </Link>
                .
            </p>
        </div>
    );
}

export function OutcomesBox({ title, items }: { title?: string | null; items?: string[] }) {
    if (!items?.length) return null;
    return (
        <Box title={title ?? 'Key Outcomes'} icon={Target}>
            <CheckList items={items} />
        </Box>
    );
}
