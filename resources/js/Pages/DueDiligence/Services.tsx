import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ChevronRight, LayoutGrid, ShieldCheck } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import DdIcon from '@/Components/DueDiligence/DdIcon';
import { DdHero } from '@/Components/DueDiligence/Ui';
import type { DdFamilyCard, DdIconItem, DdJourneyStep } from '@/types/due-diligence';

interface Props {
    families: DdFamilyCard[];
    journey: DdJourneyStep[];
    trust: DdIconItem[];
}

/** DD-002 Due Diligence Service Selector. */
export default function Services({ families, journey, trust }: Props) {
    const ask = () => openAskQuestion({ subject: 'Help choosing a due diligence service', section: 'due-diligence' });

    return (
        <>
            <Head title="Due Diligence Service Selector" />
            <DdHero
                crumbs={[{ label: 'Due Diligence', href: '/due-diligence' }, { label: 'Service Selector' }]}
                title="Due Diligence Service Selector"
                subtitle="Select the Right Service. Start with Confidence."
                description="Choose the due diligence service that matches your needs. Each service includes a clear process, pricing, timelines and deliverables."
                journey={journey}
                current={1}
            />

            <section className="bg-parchment-100 py-8">
                <div className="container-tbca">
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                        <div>
                            <h2 className="text-xl font-bold text-ink-900">Explore Our Due Diligence Services</h2>
                            <p className="text-sm text-ink-500">Click a service card to view details, pricing and how it works.</p>
                        </div>
                        <p className="text-sm text-ink-600">
                            Need help choosing?{' '}
                            <button type="button" onClick={ask} className="inline-flex items-center gap-1 font-semibold text-gold-700 hover:text-gold-800">
                                Talk to a Specialist <ArrowRight className="size-4" aria-hidden="true" />
                            </button>
                        </p>
                    </div>

                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                        {families.map((f) => (
                            <li key={f.slug}>
                                <Link href={`/due-diligence/${f.slug}`} className="group flex h-full items-center gap-3 rounded-[10px] border border-parchment-400 bg-white p-4 transition hover:border-gold-500 hover:shadow-sm">
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-[8px] bg-ink-950 text-gold-400">
                                        <DdIcon name={f.icon} className="size-6" />
                                    </span>
                                    <span className="flex-1">
                                        <span className="block text-sm font-bold text-ink-900">{f.name}</span>
                                        <span className="block text-xs text-ink-500">{f.selector}</span>
                                    </span>
                                    <ChevronRight className="size-5 text-ink-400 group-hover:text-gold-600" aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link href="/due-diligence/pricing" className="group flex h-full items-center gap-3 rounded-[10px] border border-parchment-400 bg-white p-4 transition hover:border-gold-500">
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-[8px] bg-ink-950 text-gold-400">
                                    <LayoutGrid className="size-6" aria-hidden="true" />
                                </span>
                                <span className="flex-1">
                                    <span className="block text-sm font-bold text-ink-900">View All Services</span>
                                    <span className="block text-xs text-ink-500">Compare packages, prices and specialist solutions.</span>
                                </span>
                                <ChevronRight className="size-5 text-ink-400" aria-hidden="true" />
                            </Link>
                        </li>
                    </ul>

                    <ul className="mt-6 grid gap-4 rounded-[12px] border border-parchment-400 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
                        {trust.map((t) => (
                            <li key={t.title} className="flex items-start gap-2.5">
                                <DdIcon name={t.icon} className="mt-0.5 size-6 shrink-0 text-gold-600" />
                                <div>
                                    <p className="text-[0.8125rem] font-semibold text-ink-900">{t.title}</p>
                                    <p className="text-[0.6875rem] text-ink-500">{t.body}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="bg-ink-950">
                <div className="container-tbca flex flex-col gap-4 py-6 text-parchment-100 md:flex-row md:items-center">
                    <ShieldCheck className="size-10 text-gold-400" aria-hidden="true" />
                    <div className="flex-1">
                        <p className="text-lg font-semibold">Not sure which service you need?</p>
                        <p className="text-sm text-ink-300">Take our quick assessment or speak to a specialist for a tailored recommendation.</p>
                    </div>
                    <ButtonLink href="/due-diligence/pricing" trailingIcon="arrow-right">Take Quick Assessment</ButtonLink>
                    <Button type="button" variant="outline-light" onClick={ask}>Talk to a Specialist</Button>
                </div>
            </section>
        </>
    );
}
