import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ChevronRight, Quote } from 'lucide-react';
import CtaBand from '@/Components/CtaBand';
import AfricaMark from '@/Components/AfricaMark';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import LedgerChip from '@/Components/ui/LedgerChip';
import { ButtonLink } from '@/Components/ui/Button';
import { Section, SectionHeading } from '@/Components/ui/Section';
import AboutIcon from '@/Components/About/AboutIcon';
import { ClaimInfoButton, ClaimStateChip } from '@/Components/About/ClaimEvidence';
import type { PublicClaim, PublicTestimonial } from '@/types/about';

interface Props {
    identity: { statement: string; purpose: string; mission: string; story_intro: string };
    trustRail: { title: string; body: string; icon: string }[];
    claims: PublicClaim[];
    glance: PublicClaim[];
    trackRecord: PublicClaim[];
    methodology: { number: string; name: string; summary: string; icon: string }[];
    relationships: string[];
    testimonial: PublicTestimonial | null;
    limitations: { title: string; body: string };
    entitySummary: string;
    founder: { slug: string; name: string; post_nominal: string; role: string; summary: string } | null;
    values: { title: string; body: string; icon: string }[];
    differentiators: { title: string; body: string }[];
}

export default function AboutIndex({
    identity,
    trustRail,
    claims,
    glance,
    trackRecord,
    methodology,
    relationships,
    testimonial,
    limitations,
    entitySummary,
    founder,
    values,
    differentiators,
}: Props) {
    return (
        <>
            <Head title="About TBCA" />

            <header className="relative overflow-hidden border-b border-parchment-400 bg-parchment-100">
                <AfricaMark className="pointer-events-none absolute top-6 right-[42%] hidden h-72 w-auto text-gold-500/25 lg:block" strokeWidth={1.5} />

                <div className="container-tbca relative py-10 md:py-14">
                    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                        <div className="lg:col-span-6">
                            <p className="text-[0.6875rem] font-semibold tracking-[0.16em] text-gold-700 uppercase">About TBCA</p>
                            <h1 className="mt-3 font-serif text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.02em] text-ink-900 md:text-[3rem]">
                                Who We Are. <span className="text-gold-700">Why We Exist.</span>
                            </h1>
                            <p className="mt-5 text-[1rem] leading-relaxed font-medium text-ink-800">{identity.statement}</p>
                            <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-ink-600">{identity.purpose}</p>
                        </div>

                        <div className="lg:col-span-6">
                            <Card className="p-6">
                                <h2 className="font-serif text-[1.0625rem] font-semibold text-ink-900">TBCA TRUST RAIL</h2>
                                <p className="mt-0.5 text-[0.8125rem] text-gold-700">Evidence Classes at a Glance</p>
                                <ul className="mt-5 grid gap-px overflow-hidden rounded-[5px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-4">
                                    {trustRail.map((item) => (
                                        <li key={item.title} className="bg-white p-4">
                                            <Icon name={item.icon} className="size-5 text-gold-600" />
                                            <h3 className="mt-2.5 text-[0.8125rem] font-semibold text-ink-900">{item.title}</h3>
                                            <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink-600">{item.body}</p>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-5 flex items-start gap-2.5 border-t border-parchment-300 pt-4 text-[0.75rem] leading-relaxed text-ink-600">
                                    <Icon name="shield-check" className="mt-px size-4 shrink-0 text-gold-600" />
                                    Evidence is independent, controlled, and available on request.
                                </p>
                            </Card>
                        </div>
                    </div>

                    {/* Claim cards — rendered only from published Claim Register records */}
                    <ul className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {claims.map((claim) => (
                            <Card as="li" key={claim.key} className="flex flex-col p-5">
                                <div className="flex items-start gap-4">
                                    <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-gold-400 text-gold-700">
                                        <AboutIcon name={claim.icon} className="size-7" />
                                    </span>
                                    <div className="min-w-0">
                                        <h3 className="font-serif text-[1.0625rem] font-semibold text-ink-900">{claim.label}</h3>
                                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                            <LedgerChip code={claim.ledger} full={false} />
                                            <span className="text-[0.6875rem] text-ink-500">· Ledger {claim.ledger}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-600">{claim.description}</p>
                                {claim.state !== 'current' && <ClaimStateChip claim={claim} className="mt-2 w-fit" />}
                                <div className="mt-auto flex items-center gap-2 pt-4">
                                    {claim.action && (
                                        <Link href={claim.action.href} className="inline-flex flex-1 items-center justify-between rounded-[4px] border border-gold-500 px-3 py-2 text-[0.8125rem] font-semibold text-gold-800 hover:bg-gold-50">
                                            {claim.action.label} <ChevronRight className="size-4" aria-hidden="true" />
                                        </Link>
                                    )}
                                    <ClaimInfoButton claim={claim} className="rounded-[4px] border border-parchment-400 p-2" />
                                </div>
                            </Card>
                        ))}
                        <Card as="li" className="flex flex-col p-5">
                            <div className="flex items-start gap-4">
                                <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-gold-400 text-gold-700">
                                    <AboutIcon name="building" className="size-7" />
                                </span>
                                <h3 className="pt-3 font-serif text-[1.0625rem] font-semibold text-ink-900">Entity Summary</h3>
                            </div>
                            <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-600">{entitySummary}</p>
                            <Link href="/about/our-story" className="mt-auto inline-flex items-center justify-between rounded-[4px] border border-gold-500 px-3 py-2 text-[0.8125rem] font-semibold text-gold-800 hover:bg-gold-50">
                                View Entity Overview <ChevronRight className="size-4" aria-hidden="true" />
                            </Link>
                        </Card>
                    </ul>
                </div>
            </header>

            {/* TBCA at a glance (dark band) — every tile is a published claim */}
            {glance.length > 0 && (
                <section className="bg-ink-950 py-12 text-parchment-100">
                    <div className="container-tbca grid gap-8 lg:grid-cols-12">
                        <div className="lg:col-span-4">
                            <p className="text-[0.75rem] font-semibold tracking-[0.16em] text-gold-400 uppercase">TBCA at a glance</p>
                            <h2 className="mt-3 font-serif text-[1.75rem] leading-tight font-semibold">
                                Evidence-backed scale. <span className="text-gold-400">Human-led delivery.</span>
                            </h2>
                            <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-300">
                                Each figure is bound to a Claim ID and evidence record. Tap the info icon to inspect the basis.
                            </p>
                        </div>
                        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:col-span-8">
                            {glance.map((c) => (
                                <li key={c.key} className="relative rounded-[6px] border border-gold-500/40 p-4">
                                    <ClaimInfoButton claim={c} className="absolute top-2 right-2 text-ink-400 hover:text-gold-300" />
                                    <AboutIcon name={c.icon} className="size-6 text-gold-400" />
                                    <p className="mt-2 text-xl font-bold text-parchment-100">{c.state === 'under_review' ? 'Under review' : c.value}</p>
                                    <p className="text-[0.75rem] text-ink-300">{c.label}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {/* Methodology + relationships + testimonial */}
            <Section tone="white">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-7">
                        <SectionHeading title="Our Canonical Methodology" lead="Five phases. One disciplined path to impact." />
                        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {methodology.map((phase) => (
                                <Card as="li" key={phase.number} className="p-5">
                                    <div className="flex items-center justify-between">
                                        <Icon name={phase.icon} className="size-5 text-gold-600" />
                                        <span className="font-serif text-[0.875rem] font-semibold text-gold-600">{phase.number}</span>
                                    </div>
                                    <h3 className="mt-3.5 text-[0.9375rem] font-semibold text-ink-900">{phase.name}</h3>
                                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{phase.summary}</p>
                                </Card>
                            ))}
                        </ol>
                        <ButtonLink href="/about/methodology" variant="ghost" className="mt-6 px-0" trailingIcon="arrow-right">
                            See the full method
                        </ButtonLink>
                    </div>

                    <div className="space-y-6 lg:col-span-5" id="relationships">
                        <div>
                            <SectionHeading title="Institutional Relationships" lead="Relationship display is permission- and record-governed." />
                            <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-600">
                                We engage with a diverse ecosystem of institutions. Relationships vary by mandate, scope and governance.
                            </p>
                            <ul className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-3">
                                {relationships.map((relationship) => (
                                    <li key={relationship} className="flex flex-col items-center gap-2 bg-white p-3 text-center">
                                        <Icon name="landmark" className="size-5 shrink-0 text-gold-600" />
                                        <span className="text-[0.75rem] font-medium text-ink-900">{relationship}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/about/relationships" className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700 hover:underline">
                                View institutional relationships <ArrowRight className="size-3.5" aria-hidden="true" />
                            </Link>
                        </div>

                        {testimonial && (
                            <figure className="rounded-[8px] border border-parchment-400 bg-parchment-100 p-5">
                                <div className="flex items-start gap-4">
                                    <Quote className="size-8 shrink-0 text-gold-500" aria-hidden="true" />
                                    <blockquote className="font-serif text-[1.0625rem] leading-snug text-ink-900">“{testimonial.quote}”</blockquote>
                                </div>
                                <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-[0.8125rem] font-semibold text-ink-800">{testimonial.name}</span>
                                    <LedgerChip code={testimonial.ledger} full={false} />
                                </figcaption>
                                <p className="mt-2 text-[0.6875rem] text-ink-500">{testimonial.typicality}</p>
                            </figure>
                        )}
                    </div>
                </div>
            </Section>

            {/* Founder, values, what makes TBCA different */}
            <Section tone="parchment">
                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="p-6">
                        <h2 className="font-serif text-[1.25rem] font-semibold text-ink-900">Our Values</h2>
                        <ul className="mt-4 space-y-3">
                            {values.map((v) => (
                                <li key={v.title} className="flex items-start gap-3">
                                    <Icon name={v.icon} className="mt-0.5 size-5 shrink-0 text-gold-600" />
                                    <p className="text-[0.8125rem] text-ink-600">
                                        <span className="font-semibold text-ink-900">{v.title}</span> — {v.body}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card className="p-6">
                        <h2 className="font-serif text-[1.25rem] font-semibold text-ink-900">What Makes TBCA Different</h2>
                        <ul className="mt-4 space-y-3">
                            {differentiators.map((d) => (
                                <li key={d.title} className="flex items-start gap-2.5 text-[0.8125rem] text-ink-600">
                                    <Icon name="circle-check" className="mt-0.5 size-4 shrink-0 text-gold-600" />
                                    <span>
                                        <span className="font-semibold text-ink-900">{d.title}:</span> {d.body}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                    {founder && (
                        <Card className="flex flex-col p-6">
                            <h2 className="font-serif text-[1.25rem] font-semibold text-ink-900">Our Founder</h2>
                            <div className="mt-4 flex items-center gap-4">
                                <span className="inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-800 to-ink-950 font-serif text-xl text-gold-400" aria-hidden="true">
                                    {founder.name.split(' ').map((p) => p[0]).join('')}
                                </span>
                                <div>
                                    <p className="font-semibold text-ink-900">
                                        {founder.name}, {founder.post_nominal}
                                    </p>
                                    <p className="text-[0.8125rem] text-gold-700">{founder.role}</p>
                                </div>
                            </div>
                            <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-600">{founder.summary}</p>
                            <ButtonLink href={`/about/team/${founder.slug}`} variant="outline" size="sm" className="mt-auto w-fit" trailingIcon="arrow-right">
                                View Profile
                            </ButtonLink>
                        </Card>
                    )}
                </div>

                {trackRecord.length > 0 && (
                    <div className="mt-6 rounded-[8px] border border-parchment-400 bg-white p-5">
                        <h2 className="font-serif text-[1.125rem] font-semibold text-ink-900">Our Track Record</h2>
                        <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                            {trackRecord.map((c) => (
                                <li key={c.key} className="flex items-start gap-3">
                                    <AboutIcon name={c.icon} className="mt-1 size-6 shrink-0 text-gold-600" />
                                    <div>
                                        <p className="flex items-center gap-1.5 text-lg font-bold text-ink-900">
                                            {c.state === 'under_review' ? 'Under review' : c.value}
                                            <ClaimInfoButton claim={c} />
                                        </p>
                                        <p className="text-[0.75rem] text-ink-500">{c.label}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    <div className="flex flex-col gap-4 rounded-[8px] border border-parchment-400 bg-white p-6 sm:flex-row sm:items-center">
                        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700">
                            <AboutIcon name="scale" className="size-6" />
                        </span>
                        <div className="flex-1">
                            <h3 className="text-[0.9375rem] font-semibold text-ink-900">{limitations.title}</h3>
                            <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">{limitations.body}</p>
                        </div>
                        <ButtonLink href="/about/professional-boundaries" variant="outline" size="sm" trailingIcon="arrow-right">
                            Read Full Limitations
                        </ButtonLink>
                    </div>
                    <div className="flex flex-col gap-4 rounded-[8px] border border-parchment-400 bg-white p-6 sm:flex-row sm:items-center">
                        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700">
                            <AboutIcon name="shield" className="size-6" />
                        </span>
                        <div className="flex-1">
                            <h3 className="text-[0.9375rem] font-semibold text-ink-900">Governance and Evidence</h3>
                            <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">
                                Our governance framework ensures ethical conduct, data protection, confidentiality and accountable execution across all engagements.
                            </p>
                        </div>
                        <ButtonLink href="/about/governance" variant="gold" size="sm" trailingIcon="arrow-right">
                            View Governance
                        </ButtonLink>
                    </div>
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
