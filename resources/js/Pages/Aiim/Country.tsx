import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import { DataTable } from '@/Components/Blocks';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { ConfidenceChip } from '@/Components/ui/LedgerChip';
import { Section, SectionHeading } from '@/Components/ui/Section';

interface Props {
    country: { slug: string; name: string; iso: string; region: string; status: string; grade: string; wave: string };
    layers: { number: number; name: string; standard: string; icon: string }[];
    sectors: { slug: string; name: string; icon: string }[];
    metadata: string[];
    sourceTiers: { tier: string; sources: string; use: string }[];
}

export default function AiimCountry({ country, layers, sectors, metadata, sourceTiers }: Props) {
    return (
        <>
            <Head title={`${country.name} — AIIM Country Profile`} />

            <PageHeader
                eyebrow={`${country.region} · ${country.iso}`}
                title={country.name}
                lead="Country Intelligence Profile."
                intro={`Country snapshot, indicators, sectors, risks, projects, agencies and recommended next action. Pack status: ${country.status}.`}
                crumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'AIIM', href: '/aiim' },
                    { label: country.name },
                ]}
                aside={{
                    title: 'Record Status',
                    body: `This country pack is at activation stage "${country.status}" and is scheduled in ${country.wave}.`,
                    items: [
                        `Baseline confidence grade: ${country.grade}`,
                        'At least 150 structured indicators when verified',
                        'At least 30 sectors and 80 fields per sector',
                        'Records below threshold remain unpublished or labelled',
                    ],
                    icon: 'flag',
                    link: { label: 'How we source and verify', href: '/aiim/methodology' },
                }}
            />

            <Section tone="parchment">
                <div className="flex flex-wrap items-center gap-3">
                    <ConfidenceChip grade={country.grade} />
                    <span className="rounded-[3px] border border-parchment-400 bg-white px-2 py-[3px] text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-500">
                        {country.wave}
                    </span>
                    <span className="rounded-[3px] border border-parchment-400 bg-white px-2 py-[3px] text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-500">
                        {country.status}
                    </span>
                </div>

                <div className="mt-8">
                    <SectionHeading title="Intelligence Layers for This Market" />
                    <ul className="mt-6 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-4">
                        {layers.map((layer) => (
                            <li key={layer.number} className="flex flex-col bg-white p-5">
                                <div className="flex items-center justify-between">
                                    <Icon name={layer.icon} className="size-5 text-gold-600" />
                                    <span className="font-serif text-[0.875rem] font-semibold text-gold-600">
                                        {String(layer.number).padStart(2, '0')}
                                    </span>
                                </div>
                                <h3 className="mt-3.5 text-[0.875rem] font-semibold text-ink-900">{layer.name}</h3>
                                <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-600">{layer.standard}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </Section>

            <Section tone="white">
                <SectionHeading title="Sector Coverage" lead={`Sector profiles available for ${country.name}.`} />
                <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {sectors.map((sector) => (
                        <li key={sector.slug}>
                            <Link
                                href={`/aiim/sector/${sector.slug}`}
                                className="flex items-center gap-3 rounded-[5px] border border-parchment-400 bg-white p-3.5 transition-colors hover:border-gold-300 hover:bg-parchment-100"
                            >
                                <Icon name={sector.icon} className="size-5 shrink-0 text-gold-600" />
                                <span className="text-[0.8125rem] font-medium text-ink-900">{sector.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section tone="parchment">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-5">
                        <SectionHeading title="Required Record Metadata" lead="Present on every published record." />
                        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                            {metadata.map((field) => (
                                <Card as="li" key={field} className="px-3.5 py-2.5 text-[0.8125rem] text-ink-700">
                                    {field}
                                </Card>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-7">
                        <SectionHeading title="Source Tiers" lead="Where the evidence comes from." />
                        <div className="mt-6">
                            <DataTable
                                columns={['Tier', 'Source Type', 'Use']}
                                rows={sourceTiers.map((t) => [t.tier, t.sources, t.use])}
                                caption="AIIM data source tiers"
                            />
                        </div>
                    </div>
                </div>
            </Section>

            <CtaBand
                title={`Request a ${country.name} market entry brief`}
                body="A verified country brief covering regulatory route, cost base, partner landscape and entry risk."
                primary={{ label: 'View Reports Store', href: '/aiim/store' }}
                secondary={{ label: 'Compare Countries', href: '/aiim/compare' }}
            />
        </>
    );
}
