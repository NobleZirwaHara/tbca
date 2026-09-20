import { Head, usePage } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import Card from '@/Components/ui/Card';
import { ButtonLink } from '@/Components/ui/Button';
import { ConfidenceChip } from '@/Components/ui/LedgerChip';
import { Section, SectionHeading } from '@/Components/ui/Section';
import { BoundaryNote } from '@/Components/Blocks';
import type { SharedProps } from '@/types';

interface Report {
    name: string;
    scope: string;
    zar: number;
    usd: number;
    grade: string;
    summary: string;
}

export default function AiimStore({ reports }: { reports: Report[] }) {
    const { context } = usePage<SharedProps>().props;

    return (
        <>
            <Head title="Reports Store — AIIM" />

            <PageHeader
                eyebrow="Premium country, sector, trade, opportunity and risk briefs"
                title="Premium Intelligence Store"
                lead="Evidence You Can Put in Front of a Board."
                intro="Premium briefs are compiled from verified AIIM records, reviewed before release and delivered through your portal with full source metadata attached."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'AIIM', href: '/aiim' }, { label: 'Reports Store' }]}
                aside={{
                    title: 'Release Control',
                    body: 'Premium, high-impact or low-confidence records require maker-checker approval before publication.',
                    items: [
                        'Maker-checker review before release',
                        'Source, date and confidence on every finding',
                        'Version and audit event on publication',
                        'Portal delivery with limitation notice',
                    ],
                    icon: 'lock',
                    link: { label: 'How we source and verify', href: '/aiim/methodology' },
                }}
            />

            <Section tone="parchment">
                <SectionHeading title="Available Briefs" lead="Priced in ZAR and USD." />

                <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {reports.map((report) => (
                        <Card as="li" key={report.name} hover className="flex flex-col p-6">
                            <ConfidenceChip grade={report.grade} className="w-fit" />

                            <h3 className="mt-4 font-serif text-[1.1875rem] leading-snug font-semibold tracking-[-0.01em] text-ink-900">
                                {report.name}
                            </h3>
                            <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-600">{report.summary}</p>

                            <p className="mt-4 text-[0.75rem] text-ink-500">
                                <span className="font-semibold text-ink-700">Scope: </span>
                                {report.scope}
                            </p>

                            <div className="mt-5 flex items-center justify-between gap-3 border-t border-parchment-300 pt-4">
                                <span className="text-[0.9375rem] font-semibold text-gold-700">
                                    {context.currency === 'USD'
                                        ? `USD ${report.usd.toLocaleString()}`
                                        : `ZAR ${report.zar.toLocaleString()}`}
                                </span>
                                <ButtonLink href="/contact" variant="outline" size="sm">
                                    Buy Brief
                                </ButtonLink>
                            </div>
                        </Card>
                    ))}
                </ul>

                <div className="mt-10">
                    <BoundaryNote body="Premium briefs support decision preparation. They do not constitute legal, tax, investment or regulated professional advice, and findings should be verified against primary sources before a transaction commitment." />
                </div>
            </Section>

            <CtaBand
                title="Need something wider than a standard brief?"
                body="Enterprise entitlement covers bulk data, API access, custom research scopes and a named account manager."
                primary={{ label: 'Request Proposal', href: '/contact' }}
                secondary={{ label: 'View Subscriptions', href: '/subscriptions' }}
            />
        </>
    );
}
