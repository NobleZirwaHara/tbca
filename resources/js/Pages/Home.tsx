import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Play, Quote } from 'lucide-react';
import type { ReactElement } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import AfricaMark from '@/Components/AfricaMark';
import CtaBand from '@/Components/CtaBand';
import SprintCard from '@/Components/SprintCard';
import { FeatureGrid, StatBand, StepFlow, type FeatureItem } from '@/Components/Blocks';
import { ButtonLink } from '@/Components/ui/Button';
import Icon from '@/Components/ui/Icon';
import LedgerChip from '@/Components/ui/LedgerChip';
import { Section, SectionHeading } from '@/Components/ui/Section';
import type { SharedProps, Sprint } from '@/types';

interface HomeProps {
    stats: { value: string; label: string; icon: string }[];
    sprints: Sprint[];
    engines: { name: string; role: string; icon: string; href: string }[];
    howItWorks: { step: number; title: string; body: string }[];
    differentiators: FeatureItem[];
}

const heroChips = [
    { label: 'Pan-African Architecture', icon: 'globe' },
    { label: 'South Africa Market', icon: 'map-pin' },
    { label: 'Data-Driven', icon: 'bar-chart-3' },
    { label: 'Bankable Deliverables', icon: 'badge-check' },
    { label: 'AI & Automation Ready', icon: 'bot' },
    { label: 'Human-Reviewed Outputs', icon: 'user-check' },
];

const entryPoints = [
    { title: 'Client Portal', body: 'Track orders, Sprints, projects, documents, invoices and support.', icon: 'layout-dashboard', href: '/portal' },
    { title: 'Sprint Marketplace', body: 'Explore governed consulting Sprints, digital products and retainers.', icon: 'shopping-bag', href: '/shop' },
    { title: 'AIIM', body: 'Access verified African investment, sector, opportunity and risk intelligence.', icon: 'globe', href: '/aiim' },
    { title: 'AI Agents & Automation', body: 'Automate controlled workflows while preserving human review and reliable controls.', icon: 'bot', href: '/technology-solutions' },
];

export default function Home({ stats, sprints, engines, howItWorks, differentiators }: HomeProps) {
    const { context } = usePage<SharedProps>().props;

    return (
        <>
            <Head title="Africa's AI-Powered Business Growth Platform" />

            {/* ------------------------------------------------ Hero */}
            <section className="relative overflow-hidden bg-ink-950">
                <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0 motif-grid opacity-[0.35]" aria-hidden="true" />

                <div className="container-tbca relative grid gap-10 py-14 lg:grid-cols-12 lg:gap-12 lg:py-20">
                    <div className="lg:col-span-6 xl:col-span-6">
                        <h1 className="text-[2.5rem] leading-[1.02] font-bold tracking-[-0.03em] text-parchment-100 sm:text-[3.25rem] xl:text-[3.75rem]">
                            Africa&rsquo;s AI-Powered
                            <br />
                            Business <span className="text-gold-500">Growth</span> Platform
                        </h1>

                        <p className="mt-5 text-[1.0625rem] font-medium text-parchment-200">
                            Built in Africa. Designed for Africa.
                        </p>

                        <p className="mt-1.5 text-[0.875rem] text-gold-500">
                            Pan-African architecture <span className="opacity-50">|</span> 54-country expansion-ready architecture
                        </p>

                        <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-ink-200">
                            TBCA helps businesses start, grow, automate, fund and scale through expert-led Sprints,
                            digital tools, business intelligence, Due Diligence and project advisory.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <ButtonLink href="/shop" variant="gold" size="lg" trailingIcon="arrow-right">
                                Explore Sprints
                            </ButtonLink>
                            <ButtonLink href="/diagnostics" variant="outline-light" size="lg">
                                Start Business Health Score
                            </ButtonLink>
                            <ButtonLink href="/contact" variant="outline-light" size="lg" icon="calendar-days">
                                Book Discovery Call
                            </ButtonLink>
                        </div>

                        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                            {heroChips.map((chip) => (
                                <li key={chip.label} className="flex items-start gap-2.5">
                                    <Icon name={chip.icon} className="mt-0.5 size-[18px] shrink-0 text-gold-500" />
                                    <span className="text-[0.75rem] leading-snug font-medium text-parchment-200">
                                        {chip.label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-6">
                        <HeroPanel />

                        <ul className="mt-5 grid gap-px overflow-hidden rounded-[6px] border border-ink-700 bg-ink-700 sm:grid-cols-2 xl:grid-cols-4">
                            {entryPoints.map((entry) => (
                                <li key={entry.title}>
                                    <Link
                                        href={entry.href}
                                        className="flex h-full flex-col bg-ink-900 p-4 transition-colors hover:bg-ink-800"
                                    >
                                        <Icon name={entry.icon} className="size-5 text-gold-500" />
                                        <h2 className="mt-3 text-[0.8125rem] font-semibold text-parchment-100">
                                            {entry.title}
                                        </h2>
                                        <p className="mt-1.5 text-[0.6875rem] leading-relaxed text-ink-300">
                                            {entry.body}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <StatBand stats={stats} />

            {/* --------------------------------- Sprints and ecosystem */}
            <Section tone="parchment">
                <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
                    <div className="lg:col-span-8">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <SectionHeading title="Featured Sprints" />
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-gold-700 transition-colors hover:text-gold-800"
                            >
                                View All Sprints
                                <ArrowRight className="size-3.5" aria-hidden="true" />
                            </Link>
                        </div>

                        <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                            {sprints.map((sprint) => (
                                <li key={sprint.code}>
                                    <SprintCard sprint={sprint} currency={context.currency} />
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-4">
                        <SectionHeading title="Our Platform." lead="One Ecosystem." />

                        <ul className="mt-6 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2">
                            {engines.slice(0, 8).map((engine) => (
                                <li key={engine.name}>
                                    <Link
                                        href={engine.href}
                                        className="flex h-full flex-col items-start bg-white p-4 transition-colors hover:bg-parchment-100"
                                    >
                                        <Icon name={engine.icon} className="size-5 text-gold-600" />
                                        <h3 className="mt-2.5 text-[0.8125rem] leading-snug font-semibold text-ink-900">
                                            {engine.name}
                                        </h3>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Section>

            {/* -------------------------------------- How TBCA works */}
            <Section tone="white">
                <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
                    <div className="lg:col-span-7">
                        <SectionHeading title="How TBCA Works" />
                        <div className="mt-8">
                            <StepFlow steps={howItWorks} />
                        </div>
                        <Link
                            href="/about/methodology"
                            className="mt-8 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-gold-700 transition-colors hover:text-gold-800"
                        >
                            Learn More
                            <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="lg:col-span-5">
                        <SectionHeading title="Why Choose TBCA" />
                        <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-7">
                            {differentiators.map((item) => (
                                <li key={item.title}>
                                    <Icon name={item.icon ?? 'circle'} className="size-6 text-gold-600" />
                                    <h3 className="mt-3 text-[0.875rem] font-semibold tracking-[-0.01em] text-ink-900">
                                        {item.title}
                                    </h3>
                                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{item.body}</p>
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/about"
                            className="mt-8 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-gold-700 transition-colors hover:text-gold-800"
                        >
                            Learn More
                            <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </Section>

            {/* ---------------------------------------- Evidence rail */}
            <Section tone="parchment">
                <ul className="grid gap-5 lg:grid-cols-3">
                    <li className="flex flex-col rounded-[6px] border border-parchment-400 bg-white p-6">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-ink-500">
                                Approved Client Testimonial
                            </h3>
                            <LedgerChip code="A" full={false} />
                        </div>
                        <Quote className="mt-5 size-6 text-gold-400" aria-hidden="true" />
                        <blockquote className="mt-3 font-serif text-[1.0625rem] leading-snug text-ink-900">
                            TBCA delivered a bankable business plan that secured our funding within 45 days.
                        </blockquote>
                        <p className="mt-4 text-[0.75rem] text-ink-500">— Approved Client</p>
                        <p className="mt-3 border-t border-parchment-300 pt-3 text-[0.6875rem] leading-relaxed text-ink-400">
                            This is one approved client experience. It is not presented as a guaranteed or typical result.
                        </p>
                    </li>

                    <li className="flex flex-col rounded-[6px] border border-parchment-400 bg-white p-6">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-ink-500">
                                Verified Case Study
                            </h3>
                            <LedgerChip code="V" full={false} />
                        </div>
                        <Quote className="mt-5 size-6 text-gold-400" aria-hidden="true" />
                        <blockquote className="mt-3 font-serif text-[1.0625rem] leading-snug text-ink-900">
                            The market research Sprint gave us clarity, confidence and a winning strategy.
                        </blockquote>
                        <p className="mt-4 text-[0.75rem] text-ink-500">— Verified Case Study</p>
                        <p className="mt-3 border-t border-parchment-300 pt-3 text-[0.6875rem] leading-relaxed text-ink-400">
                            Evidence reviewed and current to the published date. Outcomes vary by business and market.
                        </p>
                    </li>

                    <li className="flex flex-col rounded-[6px] border border-parchment-400 bg-white p-6">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="text-[0.8125rem] font-semibold uppercase tracking-[0.08em] text-ink-500">
                                Institutional Relationships
                            </h3>
                            <LedgerChip code="R" full={false} />
                        </div>
                        <p className="mt-5 text-[0.875rem] leading-relaxed text-ink-600">
                            We engage a diverse ecosystem of institutions. Relationships vary by mandate, scope and
                            governance, and display is permission- and record-governed.
                        </p>
                        <Link
                            href="/about/certifications"
                            className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[0.8125rem] font-semibold text-gold-700 transition-colors hover:text-gold-800"
                        >
                            View Relationships
                            <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                    </li>
                </ul>
            </Section>

            <CtaBand
                title="Ready to Build, Fund, Automate or Scale?"
                body="Start with a diagnostic, choose a Sprint or speak to TBCA about a structured advisory mandate."
                primary={{ label: 'Start Your First Sprint', href: '/shop' }}
                secondary={{ label: 'Talk to TBCA', href: '/contact' }}
            />
        </>
    );
}

/* ----------------------------------------------------------------- */

function HeroPanel() {
    return (
        <div className="relative overflow-hidden rounded-[8px] border border-gold-700/40 bg-gradient-to-br from-ink-900 via-ink-950 to-ink-900">
            <div className="pointer-events-none absolute inset-0 motif-grid opacity-40" aria-hidden="true" />

            <AfricaMark
                className="pointer-events-none absolute -right-8 -bottom-10 h-64 w-auto text-gold-600/25"
                strokeWidth={1.5}
            />

            <div className="relative p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="font-serif text-[1.25rem] leading-snug font-semibold text-parchment-100 md:text-[1.4375rem]">
                            See How TBCA Helps You
                            <br />
                            Build, Fund, Automate and Scale
                        </h2>
                        <p className="mt-2 text-[0.8125rem] font-medium text-gold-500">
                            Watch the 90-second platform explainer.
                        </p>
                    </div>
                    <AfricaMark className="size-9 shrink-0 text-gold-500" showNetwork={false} />
                </div>

                <button
                    type="button"
                    className="group mt-8 flex w-full items-center gap-4 rounded-[6px] border border-ink-700 bg-ink-950/60 p-4 text-left transition-colors hover:border-gold-600/60"
                >
                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-gold-500 text-ink-900 transition-transform duration-200 group-hover:scale-105">
                        <Play className="size-5 translate-x-px fill-current" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                        <span className="block text-[0.875rem] font-semibold text-parchment-100">
                            Platform explainer
                        </span>
                        <span className="mt-0.5 block text-[0.75rem] text-ink-300">1:30 · English and Afrikaans</span>
                    </span>
                </button>

                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink-800 pt-4 text-[0.6875rem] font-medium text-ink-300">
                    <span className="rounded-[3px] border border-ink-700 px-2 py-1">CC</span>
                    <span className="rounded-[3px] border border-gold-600/60 px-2 py-1 text-gold-400">EN</span>
                    <span className="rounded-[3px] border border-ink-700 px-2 py-1">AF</span>
                    <span className="ml-auto inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" aria-hidden="true" />
                        Updated for Wave 1
                    </span>
                </div>
            </div>
        </div>
    );
}

Home.layout = (page: ReactElement) => <PublicLayout headerVariant="dark">{page}</PublicLayout>;
