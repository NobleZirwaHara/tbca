import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import HeroArt from '@/Components/Art/HeroArt';
import CtaBand from '@/Components/CtaBand';
import { DataTable } from '@/Components/Blocks';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { Section, SectionHeading } from '@/Components/ui/Section';

interface Phase {
    number: string;
    name: string;
    summary: string;
    activities: string[];
    output: string;
    icon: string;
}

interface Props {
    methodology: Phase[];
    sequence: string[];
    decisions: { decision: string; position: string }[];
}

export default function Methodology({ methodology, sequence, decisions }: Props) {
    return (
        <>
            <Head title="How TBCA Works" />

            {/* "How TBCA Works" hero over generated constellation artwork */}
            <header className="relative overflow-hidden bg-ink-950 text-parchment-100">
                <HeroArt tone="dark" focus="right" fade="left" seed={11} />
                <div className="container-tbca relative pt-6 pb-12 md:pt-8 md:pb-20">
                    <nav aria-label="Breadcrumb" className="mb-8">
                        <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-ink-300">
                            <li><Link href="/" className="hover:text-parchment-50">Home</Link></li>
                            <li aria-hidden="true">/</li>
                            <li><Link href="/about" className="hover:text-parchment-50">About TBCA</Link></li>
                            <li aria-hidden="true">/</li>
                            <li aria-current="page" className="text-gold-400">Our Methodology</li>
                        </ol>
                    </nav>
                    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                        <div className="lg:col-span-7">
                            <p className="mb-3 text-[0.6875rem] font-semibold tracking-[0.16em] text-gold-400 uppercase">About TBCA</p>
                            <h1 className="font-serif text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.02em] text-parchment-50 md:text-[3.5rem]">How TBCA Works</h1>
                            <p className="mt-3 font-serif text-[1.25rem] leading-snug text-gold-400 md:text-[1.625rem]">Our Canonical Enterprise Methodology</p>
                            <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-200 [text-shadow:0_1px_12px_rgb(0_0_0/0.6)] md:text-[1.0625rem]">
                                We combine intelligent advisory, AI-powered systems, robotic automation and human authority in one disciplined method that turns complexity into clarity, strategy into action and potential into measurable impact.
                            </p>
                            <ol className="mt-7 flex flex-wrap gap-2" aria-label="The five phases">
                                {methodology.map((phase) => (
                                    <li key={phase.number} className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-ink-950/60 px-3 py-1.5 text-[0.75rem] text-parchment-100 backdrop-blur-sm">
                                        <span className="font-serif font-semibold text-gold-400">{phase.number}</span>
                                        {phase.name}
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <aside className="lg:col-span-5">
                            <div className="rounded-[8px] border border-gold-500/40 bg-ink-950/70 p-6 shadow-2xl shadow-black/40 backdrop-blur-md">
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-[5px] border border-gold-500/50 text-gold-400">
                                        <Icon name="shield-check" className="size-[18px]" />
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className="text-[0.9375rem] font-semibold text-parchment-50">Governed. Human-led. Measurable.</h2>
                                        <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-200">
                                            Every engagement is governed by our policies, professional boundaries, evidence-controlled claims and human authority.
                                        </p>
                                    </div>
                                </div>
                                <ul className="mt-4 space-y-2 border-t border-gold-500/25 pt-4">
                                    {['Material decisions made by qualified people', 'AI assists within defined boundaries', 'Auditable approvals and correction protocols', 'Measurable outcomes at every phase gate'].map((item) => (
                                        <li key={item} className="flex gap-2.5 text-[0.8125rem] leading-relaxed text-parchment-200">
                                            <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/about/governance" className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-gold-400 hover:text-gold-300">
                                    View Governance <ArrowRight className="size-3.5" aria-hidden="true" />
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </header>

            <Section tone="parchment">
                <ol className="grid gap-5 lg:grid-cols-5">
                    {methodology.map((phase, index) => (
                        <li key={phase.number} className="relative">
                            <Card className="flex h-full flex-col p-5">
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ink-900 text-gold-400">
                                        <Icon name={phase.icon} className="size-5" />
                                    </span>
                                    <div>
                                        <p className="font-serif text-[0.75rem] font-semibold text-gold-600">
                                            {phase.number}
                                        </p>
                                        <h2 className="text-[1rem] font-semibold tracking-[-0.01em] text-ink-900">
                                            {phase.name}
                                        </h2>
                                    </div>
                                </div>

                                <p className="mt-3.5 text-[0.8125rem] leading-relaxed text-ink-600">{phase.summary}</p>

                                <p className="mt-5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-500">
                                    Typical activities
                                </p>
                                <ul className="mt-2 space-y-1.5">
                                    {phase.activities.map((activity) => (
                                        <li key={activity} className="flex gap-2 text-[0.75rem] leading-relaxed text-ink-700">
                                            <span className="mt-[6px] size-1 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                                            {activity}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto border-t border-parchment-300 pt-4 mt-5">
                                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-gold-700">
                                        Decision / Output
                                    </p>
                                    <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-700">{phase.output}</p>
                                </div>
                            </Card>

                            {index < methodology.length - 1 && (
                                <ArrowRight
                                    className="absolute top-1/2 -right-3.5 hidden size-4 -translate-y-1/2 text-gold-500 lg:block"
                                    aria-hidden="true"
                                />
                            )}
                        </li>
                    ))}
                </ol>
            </Section>

            <Section tone="white">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-7">
                        <SectionHeading
                            title="Project Advisory Sequence"
                            lead="Eight service-level steps."
                            body="A detailed service sequence that supports the enterprise method on project mandates."
                        />

                        <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {sequence.map((step, index) => (
                                <Card as="li" key={step} className="flex items-center gap-2.5 p-3.5">
                                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-gold-400 text-[0.75rem] font-semibold text-gold-700">
                                        {index + 1}
                                    </span>
                                    <span className="text-[0.8125rem] font-semibold text-ink-900">{step}</span>
                                </Card>
                            ))}
                        </ol>
                    </div>

                    <div className="lg:col-span-5">
                        <SectionHeading title="Method Governance" />
                        <ul className="mt-7 space-y-3">
                            {[
                                { title: 'Human Authority', body: 'Material decisions are made by qualified humans with appropriate expertise and accountability.', icon: 'user-check' },
                                { title: 'AI Assistance Boundary', body: 'AI assists with analysis, insight and automation within defined boundaries. It does not make independent approvals.', icon: 'bot' },
                                { title: 'Auditability', body: 'Decisions, approvals and changes are recorded with evidence trails for accountability and improvement.', icon: 'file-check' },
                            ].map((item) => (
                                <Card as="li" key={item.title} className="flex gap-3.5 p-4">
                                    <Icon name={item.icon} className="mt-0.5 size-5 shrink-0 text-gold-600" />
                                    <div className="min-w-0">
                                        <h3 className="text-[0.875rem] font-semibold text-ink-900">{item.title}</h3>
                                        <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">{item.body}</p>
                                    </div>
                                </Card>
                            ))}
                        </ul>
                    </div>
                </div>
            </Section>

            <Section tone="parchment">
                <SectionHeading
                    title="Architecture Decisions"
                    lead="One truth for each kind of record."
                    body="These positions are non-negotiable. They keep client, financial, delivery, document and support records consistent across the platform."
                />
                <div className="mt-8">
                    <DataTable
                        columns={['Decision', 'Required Position']}
                        rows={decisions.map((d) => [d.decision, d.position])}
                        caption="Non-negotiable architecture decisions"
                    />
                </div>
            </Section>

            <CtaBand
                title="One integrated method. Five phases. Eight service-level steps."
                body="Designed to think bigger, move faster and achieve lasting impact across Africa."
                primary={{ label: 'Start Diagnostic', href: '/diagnostics' }}
                secondary={{ label: 'Talk to TBCA', href: '/contact' }}
            />
        </>
    );
}
