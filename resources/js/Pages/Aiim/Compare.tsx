import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { X } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import Card from '@/Components/ui/Card';
import { ConfidenceChip } from '@/Components/ui/LedgerChip';
import { Section, SectionHeading } from '@/Components/ui/Section';
import { cn } from '@/lib/cn';

interface Country {
    slug: string;
    name: string;
    iso: string;
    region: string;
    status: string;
    grade: string;
    wave: string;
}

const METRICS = [
    { key: 'region', label: 'Region' },
    { key: 'status', label: 'Pack status' },
    { key: 'grade', label: 'Baseline confidence' },
    { key: 'wave', label: 'Activation wave' },
];

export default function AiimCompare({ countries }: { countries: Country[]; sectors: unknown[]; confidenceGrades: unknown[] }) {
    const [selected, setSelected] = useState<string[]>(['south-africa', 'botswana', 'kenya']);

    const toggle = (slug: string) => {
        setSelected((current) =>
            current.includes(slug)
                ? current.filter((item) => item !== slug)
                : current.length >= 5
                  ? current
                  : [...current, slug],
        );
    };

    const chosen = countries.filter((country) => selected.includes(country.slug));

    return (
        <>
            <Head title="Compare — AIIM" />

            <PageHeader
                eyebrow="Compare countries, sectors, projects and opportunities"
                title="Compare"
                lead="Consistent Metrics. Stated Ranking Logic."
                intro="Select up to five markets and compare them on the same metrics. The comparison states its ranking logic rather than presenting a score without explanation."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'AIIM', href: '/aiim' }, { label: 'Compare' }]}
                aside={{
                    title: 'Comparison Rules',
                    body: 'Comparisons only use fields present for every selected market at the same confidence threshold.',
                    items: [
                        'Maximum five markets per comparison',
                        'Only fields common to all selections',
                        'Confidence shown per market',
                        'Ranking logic stated, never implied',
                    ],
                    icon: 'scale',
                }}
            />

            <Section tone="parchment">
                <SectionHeading title="Select Markets" lead={`${selected.length} of 5 selected.`} />

                <ul className="mt-6 flex flex-wrap gap-2">
                    {countries.map((country) => {
                        const active = selected.includes(country.slug);

                        return (
                            <li key={country.slug}>
                                <button
                                    type="button"
                                    onClick={() => toggle(country.slug)}
                                    className={cn(
                                        'inline-flex h-9 items-center gap-2 rounded-[4px] border px-3.5 text-[0.8125rem] font-medium transition-colors',
                                        active
                                            ? 'border-gold-500 bg-gold-500 text-ink-900'
                                            : 'border-parchment-400 bg-white text-ink-600 hover:border-gold-300 hover:text-ink-900',
                                    )}
                                    aria-pressed={active}
                                >
                                    {country.name}
                                    {active && <X className="size-3.5" aria-hidden="true" />}
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {chosen.length > 0 ? (
                    <div className="mt-8 overflow-hidden rounded-[6px] border border-parchment-400 bg-white">
                        <div className="overflow-x-auto rail-scroll">
                            <table className="w-full min-w-[42rem] border-collapse text-left">
                                <caption className="sr-only">Market comparison</caption>
                                <thead>
                                    <tr className="border-b border-parchment-400 bg-parchment-100">
                                        <th
                                            scope="col"
                                            className="px-5 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-500"
                                        >
                                            Metric
                                        </th>
                                        {chosen.map((country) => (
                                            <th
                                                key={country.slug}
                                                scope="col"
                                                className="px-5 py-3 text-[0.8125rem] font-semibold text-ink-900"
                                            >
                                                {country.name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {METRICS.map((metric) => (
                                        <tr key={metric.key} className="border-b border-parchment-300 last:border-0">
                                            <th
                                                scope="row"
                                                className="px-5 py-3.5 text-left text-[0.8125rem] font-semibold text-ink-900"
                                            >
                                                {metric.label}
                                            </th>
                                            {chosen.map((country) => (
                                                <td key={country.slug} className="px-5 py-3.5 text-[0.8125rem] text-ink-600">
                                                    {metric.key === 'grade' ? (
                                                        <ConfidenceChip grade={country.grade} />
                                                    ) : (
                                                        (country as unknown as Record<string, string>)[metric.key]
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <p className="border-t border-parchment-300 bg-parchment-100 px-5 py-3 text-[0.75rem] leading-relaxed text-ink-500">
                            Ranking logic: markets are ordered by pack activation status, then baseline confidence grade.
                            Indicator-level comparison unlocks when each selected market holds a verified pack.
                        </p>
                    </div>
                ) : (
                    <Card className="mt-8 p-8 text-center">
                        <p className="text-[0.875rem] text-ink-600">
                            Select at least one market to build a comparison.
                        </p>
                    </Card>
                )}
            </Section>

            <CtaBand
                title="Need the comparison as a report?"
                body="The Country Comparison Report covers up to five markets with heat map, risk matrix and stated ranking logic."
                primary={{ label: 'View Reports Store', href: '/aiim/store' }}
                secondary={{ label: 'Book Strategy Call', href: '/contact' }}
            />
        </>
    );
}
