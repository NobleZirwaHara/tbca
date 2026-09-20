import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import AfricaMap from '@/Components/AfricaMap';
import { DataTable } from '@/Components/Blocks';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { ConfidenceChip } from '@/Components/ui/LedgerChip';
import { ButtonLink } from '@/Components/ui/Button';
import { Section, SectionHeading } from '@/Components/ui/Section';
import { cn } from '@/lib/cn';

interface Props {
    positioning: { title: string; standard: string; intro: string };
    intents: { label: string; body: string; icon: string }[];
    layers: { number: number; name: string; standard: string; icon: string }[];
    countries: { slug: string; name: string; iso: string; region: string; status: string; grade: string; wave: string }[];
    sectors: { slug: string; name: string; icon: string }[];
    interactions: { interaction: string; response: string; guide: string }[];
    confidenceGrades: { grade: string; definition: string; treatment: string }[];
    roles: { role: string; use: string; entitlement: string; control: string }[];
}

export default function AiimIndex({
    positioning,
    intents,
    layers,
    countries,
    sectors,
    interactions,
    confidenceGrades,
    roles,
}: Props) {
    const [intent, setIntent] = useState(intents[0]?.label ?? '');
    const [region, setRegion] = useState<string | null>('southern');

    return (
        <>
            <Head title="AIIM — Africa Investment Intelligence Map" />

            <PageHeader
                eyebrow="Africa trade and investment intelligence"
                title="Africa Investment Intelligence Map"
                lead="An Investor Cockpit. Not a Decorative Map."
                intro={positioning.intro}
                crumbs={[{ label: 'Home', href: '/' }, { label: 'AIIM' }]}
                aside={{
                    title: 'Product Standard',
                    body: positioning.standard,
                    items: ['Source organisation and reference', 'Publication and extraction date', 'Confidence grade and verification status', 'Next review date and permitted use'],
                    icon: 'shield-check',
                    link: { label: 'How we source and verify', href: '/aiim/methodology' },
                }}
            />

            {/* ------------------------------------- Command centre */}
            <section className="bg-ink-950 py-12 md:py-16">
                <div className="container-tbca">
                    <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
                        <div className="lg:col-span-5">
                            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-400">
                                Intent selector
                            </p>
                            <h2 className="mt-3 font-serif text-[1.75rem] leading-tight font-semibold text-parchment-100 md:text-[2rem]">
                                Where would you like to start?
                            </h2>

                            <ul className="mt-6 space-y-2">
                                {intents.map((item) => (
                                    <li key={item.label}>
                                        <button
                                            type="button"
                                            onClick={() => setIntent(item.label)}
                                            className={cn(
                                                'flex w-full items-start gap-3 rounded-[5px] border p-3.5 text-left transition-colors',
                                                intent === item.label
                                                    ? 'border-gold-500 bg-ink-900'
                                                    : 'border-ink-700 hover:border-ink-600 hover:bg-ink-900/60',
                                            )}
                                            aria-pressed={intent === item.label}
                                        >
                                            <Icon
                                                name={item.icon}
                                                className={cn(
                                                    'mt-0.5 size-5 shrink-0',
                                                    intent === item.label ? 'text-gold-400' : 'text-ink-300',
                                                )}
                                            />
                                            <span className="min-w-0">
                                                <span className="block text-[0.875rem] font-semibold text-parchment-100">
                                                    {item.label}
                                                </span>
                                                <span className="mt-0.5 block text-[0.75rem] leading-snug text-ink-300">
                                                    {item.body}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <ButtonLink href="/aiim/compare" variant="gold" trailingIcon="arrow-right">
                                    Explore Africa
                                </ButtonLink>
                                <ButtonLink href="/aiim/store" variant="outline-light">
                                    Buy Premium Brief
                                </ButtonLink>
                            </div>
                        </div>

                        <div className="lg:col-span-7">
                            <div className="relative overflow-hidden rounded-[8px] border border-ink-700 bg-ink-900">
                                <div className="pointer-events-none absolute inset-0 motif-grid opacity-30" aria-hidden="true" />

                                <div className="relative flex items-center justify-between gap-4 border-b border-ink-800 px-5 py-3">
                                    <p className="text-[0.8125rem] font-semibold text-parchment-100">
                                        Map Command Centre
                                    </p>
                                    <p className="text-[0.6875rem] text-ink-400">
                                        Schematic regional view. Verified country packs activate by wave.
                                    </p>
                                </div>

                                <div className="relative grid gap-4 p-5 sm:grid-cols-2">
                                    <div className="mx-auto h-[320px] w-full max-w-[280px]">
                                        <AfricaMap activeRegion={region} onSelect={setRegion} />
                                    </div>

                                    <div>
                                        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gold-400">
                                            Country packs
                                        </p>
                                        <ul className="mt-3 max-h-[280px] space-y-1.5 overflow-y-auto rail-scroll pr-1">
                                            {countries.map((country) => (
                                                <li key={country.slug}>
                                                    <Link
                                                        href={`/aiim/country/${country.slug}`}
                                                        className="flex items-center justify-between gap-3 rounded-[4px] border border-ink-800 px-3 py-2 transition-colors hover:border-gold-600/60"
                                                    >
                                                        <span className="min-w-0">
                                                            <span className="block text-[0.8125rem] font-medium text-parchment-100">
                                                                {country.name}
                                                            </span>
                                                            <span className="block text-[0.6875rem] text-ink-400">
                                                                {country.status}
                                                            </span>
                                                        </span>
                                                        <span className="shrink-0 rounded-[3px] border border-ink-700 px-1.5 py-0.5 text-[0.625rem] font-semibold text-gold-400">
                                                            {country.grade}
                                                        </span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ------------------------------------------- Layers */}
            <Section tone="parchment">
                <SectionHeading
                    title="Eight Intelligence Layers"
                    lead="One data model across all 54 countries."
                    body="Layers activate by entitlement. Every visible record carries source, date, confidence and verification status."
                />

                <ul className="mt-8 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-4">
                    {layers.map((layer) => (
                        <li key={layer.number} className="flex flex-col bg-white p-5">
                            <div className="flex items-center justify-between">
                                <Icon name={layer.icon} className="size-5 text-gold-600" />
                                <span className="font-serif text-[0.875rem] font-semibold text-gold-600">
                                    {String(layer.number).padStart(2, '0')}
                                </span>
                            </div>
                            <h3 className="mt-3.5 text-[0.875rem] font-semibold tracking-[-0.01em] text-ink-900">
                                {layer.name}
                            </h3>
                            <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-600">{layer.standard}</p>
                        </li>
                    ))}
                </ul>
            </Section>

            {/* ------------------------------------------ Sectors */}
            <Section tone="white">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <SectionHeading title="Sector Intelligence" lead="At least 30 sectors per country." />
                    <Link
                        href="/aiim/compare"
                        className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-gold-700 hover:text-gold-800"
                    >
                        Compare across markets
                        <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                </div>

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

            {/* ------------------------------- Interaction and trust */}
            <Section tone="parchment">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-7">
                        <SectionHeading title="Map Interaction Model" lead="What the map does, and what the guide explains." />
                        <div className="mt-7">
                            <DataTable
                                columns={['Interaction', 'Map Response', 'Guide Explanation']}
                                rows={interactions.map((i) => [i.interaction, i.response, i.guide])}
                                caption="AIIM map interaction model"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <SectionHeading title="Confidence Grades" lead="How each record is treated." />
                        <ul className="mt-7 space-y-3">
                            {confidenceGrades.map((grade) => (
                                <Card as="li" key={grade.grade} className="p-4">
                                    <ConfidenceChip grade={grade.grade} />
                                    <p className="mt-2.5 text-[0.8125rem] font-semibold text-ink-900">
                                        {grade.definition}
                                    </p>
                                    <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-600">
                                        {grade.treatment}
                                    </p>
                                </Card>
                            ))}
                        </ul>
                    </div>
                </div>
            </Section>

            {/* -------------------------------------------- Roles */}
            <Section tone="white">
                <SectionHeading title="Roles and Entitlements" lead="What each user may see and do." />
                <div className="mt-8">
                    <DataTable
                        columns={['Role', 'Permitted Use', 'Entitlement', 'Control']}
                        rows={roles.map((r) => [r.role, r.use, r.entitlement, r.control])}
                        caption="AIIM roles and entitlements"
                    />
                </div>
            </Section>

            <CtaBand
                title="Ask TBCA to turn intelligence into a decision."
                body="Buy a premium brief, compare markets, or request an advisory mandate built on verified evidence."
                primary={{ label: 'Buy Premium Brief', href: '/aiim/store' }}
                secondary={{ label: 'Talk to an Advisor', href: '/contact' }}
            />
        </>
    );
}
