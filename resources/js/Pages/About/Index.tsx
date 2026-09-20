import { Head } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import AfricaMark from '@/Components/AfricaMark';
import { BoundaryNote } from '@/Components/Blocks';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import LedgerChip from '@/Components/ui/LedgerChip';
import { ButtonLink } from '@/Components/ui/Button';
import { Section, SectionHeading } from '@/Components/ui/Section';
import type { LedgerCode } from '@/types';

interface Certification {
    name: string;
    subtitle: string;
    class: LedgerCode;
    icon: string;
    rows: { label: string; value: string }[];
    action: { label: string; href: string };
}

interface Props {
    identity: { statement: string; purpose: string; mission: string; story_intro: string };
    trustRail: { title: string; body: string; icon: string }[];
    certifications: Certification[];
    methodology: { number: string; name: string; summary: string; icon: string }[];
    relationships: string[];
    limitations: { title: string; body: string };
    entitySummary: string;
}

export default function AboutIndex({
    identity,
    trustRail,
    certifications,
    methodology,
    relationships,
    limitations,
    entitySummary,
}: Props) {
    return (
        <>
            <Head title="About TBCA" />

            <header className="relative overflow-hidden border-b border-parchment-400 bg-parchment-100">
                <AfricaMark
                    className="pointer-events-none absolute top-6 right-[8%] hidden h-72 w-auto text-gold-500/25 lg:block"
                    strokeWidth={1.5}
                />

                <div className="container-tbca relative py-12 md:py-16">
                    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                        <div className="lg:col-span-6">
                            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-700">
                                About TBCA
                            </p>

                            <h1 className="mt-3 font-serif text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.02em] text-ink-900 md:text-[3rem]">
                                Who We Are. <span className="text-gold-700">Why We Exist.</span>
                            </h1>

                            <p className="mt-5 text-[1rem] leading-relaxed font-medium text-ink-800">
                                {identity.statement}
                            </p>

                            <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-ink-600">
                                {identity.purpose}
                            </p>
                        </div>

                        <div className="lg:col-span-6">
                            <Card className="p-6">
                                <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                    TBCA Trust Rail
                                </h2>
                                <p className="mt-1 text-[0.8125rem] text-ink-500">Evidence classes at a glance.</p>

                                <ul className="mt-5 grid gap-px overflow-hidden rounded-[5px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-4">
                                    {trustRail.map((item) => (
                                        <li key={item.title} className="bg-white p-4">
                                            <Icon name={item.icon} className="size-5 text-gold-600" />
                                            <h3 className="mt-2.5 text-[0.8125rem] font-semibold text-ink-900">
                                                {item.title}
                                            </h3>
                                            <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink-600">
                                                {item.body}
                                            </p>
                                        </li>
                                    ))}
                                </ul>

                                <p className="mt-5 flex items-start gap-2.5 border-t border-parchment-300 pt-4 text-[0.75rem] leading-relaxed text-ink-600">
                                    <Icon name="shield-check" className="mt-px size-4 shrink-0 text-gold-600" />
                                    Evidence is independent, controlled and available on request.
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            </header>

            {/* ---------------------------------- Certifications */}
            <Section tone="parchment">
                <SectionHeading title="Evidence-Backed Trust" lead="Transparent. Current. Verifiable." />

                <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {certifications.map((certification) => (
                        <Card as="li" key={certification.name} hover className="flex flex-col p-6">
                            <div className="flex items-start justify-between gap-3">
                                <Icon name={certification.icon} className="size-7 text-gold-600" strokeWidth={1.4} />
                                <LedgerChip code={certification.class} full={false} />
                            </div>

                            <h3 className="mt-4 font-serif text-[1.0625rem] leading-snug font-semibold text-ink-900">
                                {certification.name}
                            </h3>
                            <p className="mt-1 text-[0.8125rem] text-ink-500">{certification.subtitle}</p>

                            <dl className="mt-4 space-y-1.5 border-t border-parchment-300 pt-4 text-[0.75rem] leading-relaxed">
                                {certification.rows.slice(0, 3).map((row) => (
                                    <div key={row.label}>
                                        <dt className="inline font-semibold text-ink-900">{row.label}: </dt>
                                        <dd className="inline text-ink-600">{row.value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </Card>
                    ))}
                </ul>

                <div className="mt-6">
                    <ButtonLink href="/about/certifications" variant="outline" trailingIcon="arrow-right">
                        View All Certifications and Verifications
                    </ButtonLink>
                </div>
            </Section>

            {/* ------------------------------------- Methodology */}
            <Section tone="white">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-7">
                        <SectionHeading title="Our Canonical Methodology" lead="Five phases. One disciplined path to impact." />

                        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {methodology.map((phase) => (
                                <Card as="li" key={phase.number} className="p-5">
                                    <div className="flex items-center justify-between">
                                        <Icon name={phase.icon} className="size-5 text-gold-600" />
                                        <span className="font-serif text-[0.875rem] font-semibold text-gold-600">
                                            {phase.number}
                                        </span>
                                    </div>
                                    <h3 className="mt-3.5 text-[0.9375rem] font-semibold text-ink-900">{phase.name}</h3>
                                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">
                                        {phase.summary}
                                    </p>
                                </Card>
                            ))}
                        </ol>

                        <ButtonLink href="/about/methodology" variant="ghost" className="mt-6 px-0" trailingIcon="arrow-right">
                            See the full method
                        </ButtonLink>
                    </div>

                    <div className="lg:col-span-5" id="relationships">
                        <SectionHeading title="Institutional Relationships" lead="Permission- and record-governed." />

                        <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-600">
                            We engage a diverse ecosystem of institutions. Relationships vary by mandate, scope and
                            governance, and are displayed only where permission records allow it.
                        </p>

                        <ul className="mt-6 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2">
                            {relationships.map((relationship) => (
                                <li key={relationship} className="flex items-center gap-2.5 bg-white p-4">
                                    <Icon name="landmark" className="size-5 shrink-0 text-gold-600" />
                                    <span className="text-[0.8125rem] font-medium text-ink-900">{relationship}</span>
                                </li>
                            ))}
                        </ul>

                        <Card className="mt-6 p-5">
                            <h3 className="text-[0.875rem] font-semibold text-ink-900">Entity Summary</h3>
                            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{entitySummary}</p>
                        </Card>
                    </div>
                </div>
            </Section>

            {/* -------------------------------------- Boundaries */}
            <Section tone="parchment">
                <div className="grid gap-5 lg:grid-cols-2">
                    <BoundaryNote title={limitations.title} body={limitations.body} />

                    <Card className="flex flex-col p-6">
                        <Icon name="shield-check" className="size-7 text-gold-600" strokeWidth={1.4} />
                        <h3 className="mt-4 text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                            Governance and Evidence
                        </h3>
                        <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-600">
                            Our governance framework covers ethical conduct, data protection, confidentiality and
                            accountable execution across every engagement.
                        </p>
                        <ButtonLink href="/about/governance" variant="gold" size="sm" className="mt-5 w-fit" trailingIcon="arrow-right">
                            View Governance
                        </ButtonLink>
                    </Card>
                </div>
            </Section>

            <CtaBand
                title="Ready to build with clarity, confidence and control?"
                body={identity.mission}
                primary={{ label: 'Meet TBCA', href: '/about/team' }}
                secondary={{ label: 'View Governance', href: '/about/governance' }}
            />
        </>
    );
}
