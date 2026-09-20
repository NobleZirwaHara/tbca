import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import Card from '@/Components/ui/Card';
import { ConfidenceChip } from '@/Components/ui/LedgerChip';
import { Section, SectionHeading } from '@/Components/ui/Section';

interface Props {
    sector: { slug: string; name: string; icon: string };
    countries: { slug: string; name: string; region: string; status: string; grade: string }[];
    metadata: string[];
}

export default function AiimSector({ sector, countries, metadata }: Props) {
    return (
        <>
            <Head title={`${sector.name} — AIIM Sector Profile`} />

            <PageHeader
                eyebrow="Cross-country sector comparison"
                title={sector.name}
                lead="Sector Intelligence Profile."
                intro="Demand, constraints, players and structured opportunities compared across markets using consistent metrics. Every field carries source, date and confidence."
                crumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'AIIM', href: '/aiim' },
                    { label: sector.name },
                ]}
                aside={{
                    title: 'Sector Data Standard',
                    body: 'At least 30 sectors per country and at least 80 fields per sector, each carrying provenance.',
                    items: ['Demand and market structure', 'Constraints and bottlenecks', 'Players and relationships', 'Opportunity pipeline and next action'],
                    icon: sector.icon,
                    link: { label: 'How we source and verify', href: '/aiim/methodology' },
                }}
            />

            <Section tone="parchment">
                <SectionHeading title="Country Coverage" lead={`${sector.name} across activated and scheduled markets.`} />

                <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {countries.map((country) => (
                        <Card as="li" key={country.slug} hover className="p-5">
                            <Link href={`/aiim/country/${country.slug}`} className="block">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                            {country.name}
                                        </h3>
                                        <p className="mt-0.5 text-[0.75rem] text-ink-500">{country.region}</p>
                                    </div>
                                    <ConfidenceChip grade={country.grade} />
                                </div>
                                <p className="mt-3 border-t border-parchment-300 pt-3 text-[0.8125rem] text-ink-600">
                                    {country.status}
                                </p>
                            </Link>
                        </Card>
                    ))}
                </ul>
            </Section>

            <Section tone="white">
                <SectionHeading title="Required Record Metadata" lead="Present on every published sector record." />
                <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {metadata.map((field) => (
                        <Card as="li" key={field} className="px-3.5 py-2.5 text-[0.8125rem] text-ink-700">
                            {field}
                        </Card>
                    ))}
                </ul>
            </Section>

            <CtaBand
                title={`Request a ${sector.name} opportunity assessment`}
                body="One sector compared across up to five countries with demand, constraints, players and a ranked opportunity set."
                primary={{ label: 'View Reports Store', href: '/aiim/store' }}
                secondary={{ label: 'Talk to an Advisor', href: '/contact' }}
            />
        </>
    );
}
