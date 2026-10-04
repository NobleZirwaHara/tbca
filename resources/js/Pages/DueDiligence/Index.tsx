import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ChevronRight, FolderLock, Globe2, Languages, Coins, ShieldCheck, UserCheck } from 'lucide-react';
import { ButtonLink, Button } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import DdIcon from '@/Components/DueDiligence/DdIcon';
import type { DdFamilyCard, DdIconItem, DdJourneyStep } from '@/types/due-diligence';

interface Props {
    families: DdFamilyCard[];
    journey: DdJourneyStep[];
    trust: DdIconItem[];
}

const badges = [
    { title: 'South Africa', body: 'Active Market', icon: Globe2 },
    { title: 'English & Afrikaans', body: 'Languages', icon: Languages },
    { title: 'ZAR (Source)', body: '& USD Currencies', icon: Coins },
    { title: 'Human-Reviewed', body: 'Every Case', icon: UserCheck },
    { title: 'Secure & Compliant', body: 'POPIA Ready', icon: ShieldCheck },
];

/** DD-001 Due Diligence landing page. */
export default function DueDiligenceIndex({ families, journey, trust }: Props) {
    const cards = [
        ...families.filter((f) => f.slug !== 'portal-api'),
        { slug: '__consent', name: 'Consent & Evidence', short: 'Manage consent, upload evidence and track permissions.', selector: '', icon: 'FolderOpen' },
    ];

    return (
        <>
            <Head title="Due Diligence" />

            <section className="relative overflow-hidden bg-ink-950">
                <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0 motif-grid opacity-30" aria-hidden="true" />
                <div className="container-tbca relative grid gap-8 py-10 lg:grid-cols-12 lg:py-14">
                    <div className="lg:col-span-6">
                        <h1 className="font-serif text-[2.25rem] leading-tight font-semibold text-parchment-100 sm:text-[2.9rem]">
                            Due Diligence. Verified. Actionable.
                            <span className="block text-gold-400">Confidence in Every Decision.</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-parchment-200">
                            Comprehensive, consent-led due diligence and screening services for individuals, companies, projects, investors and institutions. Human-reviewed. POPIA-ready. Audit-trail enabled.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <ButtonLink href="/due-diligence/services" size="lg" trailingIcon="arrow-right">
                                Start Due Diligence Case
                            </ButtonLink>
                            <ButtonLink href="/due-diligence/enterprise/request" size="lg" variant="outline-light" icon="landmark">
                                Request Enterprise Screening
                            </ButtonLink>
                        </div>
                    </div>
                    <div className="flex items-center lg:col-span-6">
                        <ul className="grid w-full grid-cols-2 gap-2 rounded-[12px] border border-gold-500/30 bg-ink-900/70 p-3 sm:grid-cols-5">
                            {badges.map(({ title, body, icon: I }) => (
                                <li key={title} className="flex flex-col items-center gap-1 rounded-[8px] p-2 text-center">
                                    <I className="size-6 text-gold-400" aria-hidden="true" />
                                    <span className="text-xs font-semibold text-parchment-100">{title}</span>
                                    <span className="text-[0.6875rem] text-ink-300">{body}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="bg-parchment-100 py-8">
                <div className="container-tbca">
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                        <h2 className="text-xl font-bold text-ink-900">Choose Your Due Diligence Service</h2>
                        <Link href="/due-diligence/services" className="inline-flex items-center gap-1 text-sm font-semibold text-gold-700 hover:text-gold-800">
                            View All Services <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                    </div>
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                        {cards.map((f) => (
                            <li key={f.slug}>
                                <Link
                                    href={f.slug === '__consent' ? '/due-diligence/cases' : `/due-diligence/${f.slug}`}
                                    className="group flex h-full items-start gap-3 rounded-[10px] border border-parchment-400 bg-white p-3 transition hover:border-gold-500 hover:shadow-sm focus-visible:border-gold-500"
                                >
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-[8px] bg-ink-950 text-gold-400">
                                        <DdIcon name={f.icon} className="size-6" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-[0.8125rem] font-bold text-ink-900">{f.name}</span>
                                        <span className="mt-0.5 block text-[0.6875rem] leading-snug text-ink-500">{f.short}</span>
                                    </span>
                                    <ChevronRight className="mt-1 size-4 shrink-0 text-ink-400 group-hover:text-gold-600" aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 rounded-[12px] bg-ink-950 p-5 text-parchment-100">
                        <h2 className="mb-4 text-base font-bold">Our Due Diligence Process</h2>
                        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7">
                            {journey.map((s) => (
                                <li key={s.n} className="flex items-start gap-2">
                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-950">{s.n}</span>
                                    <div>
                                        <p className="flex items-center gap-1.5 text-[0.8125rem] font-semibold">
                                            <DdIcon name={s.icon} className="size-4 text-gold-400" /> {s.short}
                                        </p>
                                        <p className="mt-0.5 text-[0.6875rem] text-ink-300">{s.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <ul className="mt-5 grid gap-4 rounded-[12px] border border-parchment-400 bg-white p-4 sm:grid-cols-2 lg:grid-cols-7">
                        {trust.map((t) => (
                            <li key={t.title} className="flex items-start gap-2">
                                <DdIcon name={t.icon} className="mt-0.5 size-5 shrink-0 text-gold-600" />
                                <div>
                                    <p className="text-[0.8125rem] font-semibold text-ink-900">{t.title}</p>
                                    <p className="text-[0.6875rem] text-ink-500">{t.body}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 flex flex-col gap-4 rounded-[12px] border border-gold-500/40 bg-ink-950 p-5 text-parchment-100 md:flex-row md:items-center">
                        <ShieldCheck className="size-10 shrink-0 text-gold-400" aria-hidden="true" />
                        <div className="flex-1">
                            <p className="text-lg font-semibold">Need Enterprise Screening or a Complex Review?</p>
                            <p className="text-sm text-ink-300">Speak to our specialists for tailored due diligence and screening solutions.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button type="button" onClick={() => openAskQuestion({ subject: 'Enterprise screening or complex review', section: 'due-diligence' })} trailingIcon="arrow-right">
                                Talk to a Specialist
                            </Button>
                            <ButtonLink href="/virtual-deal-room" variant="outline-light">
                                <FolderLock className="size-4" aria-hidden="true" /> Open a Data Room
                            </ButtonLink>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
