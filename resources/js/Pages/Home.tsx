import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, CircleCheck, Clock, Play, Quote, UserCheck } from 'lucide-react';
import { useState, type ReactElement } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import AfricaMark from '@/Components/AfricaMark';
import CtaBand from '@/Components/CtaBand';
import { ButtonLink } from '@/Components/ui/Button';
import Icon from '@/Components/ui/Icon';
import LedgerChip from '@/Components/ui/LedgerChip';
import { usePrice } from '@/lib/money';

interface FeaturedSprint {
    slug: string;
    name: string;
    summary: string;
    zar: number;
    turnaround: string;
    icon: string;
}

interface HomeProps {
    stats: { value: string; label: string; icon: string }[];
    sprints: FeaturedSprint[];
    howItWorks: { step: number; title: string; body: string }[];
    differentiators: { title: string; body: string; icon?: string }[];
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
    { title: 'Client Portal', body: 'Track orders, Sprints, projects, documents, invoices, Due Diligence cases and support.', icon: 'layout-dashboard', href: '/portal' },
    { title: 'Sprint Marketplace', body: 'Explore governed consulting Sprints, digital products, subscriptions and retainers.', icon: 'shopping-bag', href: '/shop' },
    { title: 'AIIM', body: 'Access verified South African investment, sector data, opportunity and risk intelligence.', icon: 'bar-chart-3', href: '/aiim' },
    { title: 'AI Agents & Automation', body: 'Automate controlled workflows while preserving human review and reliable controls.', icon: 'bot', href: '/technology-solutions' },
];

const ecosystem = [
    { name: 'AIIM', icon: 'bar-chart-3', href: '/aiim' },
    { name: 'Client Portal', icon: 'user', href: '/portal' },
    { name: 'Online Shop', icon: 'shopping-bag', href: '/shop' },
    { name: 'AI Agents & Automation', icon: 'bot', href: '/technology-solutions' },
    { name: 'Due Diligence', icon: 'shield-check', href: '/due-diligence' },
    { name: 'Virtual Deal Room', icon: 'folder-lock', href: '/virtual-deal-room' },
    { name: 'Project Advisory', icon: 'users', href: '/project-advisory' },
    { name: 'Data Bank & RAG', icon: 'database', href: '/resources' },
];

const partners = [
    { name: 'SEDA', full: 'Small Enterprise Development Agency', note: 'Approved Partner' },
    { name: 'Enterprise Development Network', full: 'SME support and incubation partners', note: 'Approved Partner' },
    { name: 'Funding & DFI Network', full: 'Development finance and funding partners', note: 'Relationship varies by mandate' },
];

const ecosystemNames = ['Standard Bank', 'absa', 'FNB', 'Nedbank', 'MTN', 'Sage', 'aws'];

export default function Home({ stats, sprints, howItWorks, differentiators }: HomeProps) {
    const price = usePrice();
    const [partner, setPartner] = useState(0);
    const current = partners[partner];

    return (
        <>
            <Head title="Africa's AI-Powered Business Growth Platform" />

            {/* ------------------------------------------------ Hero */}
            <section className="relative overflow-hidden bg-ink-950">
                <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0 motif-grid opacity-[0.35]" aria-hidden="true" />

                <div className="container-tbca relative grid gap-10 py-12 lg:grid-cols-12 lg:gap-12 lg:py-16">
                    <div className="lg:col-span-6">
                        <h1 className="text-[2.375rem] leading-[1.04] font-bold tracking-[-0.03em] text-parchment-100 sm:text-[3.25rem] xl:text-[3.6rem]">
                            Africa&rsquo;s AI-Powered
                            <br />
                            Business <span className="text-gold-500">Growth</span> Platform
                        </h1>
                        <p className="mt-4 text-[1.0625rem] font-semibold text-parchment-100">Built in Africa. Designed for Africa.</p>
                        <p className="mt-1 text-[0.875rem] font-medium text-gold-500">
                            Pan-African architecture <span className="opacity-50">|</span> 54-country expansion-ready architecture
                        </p>
                        <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-ink-200">
                            TBCA helps businesses start, grow, automate, fund and scale through expert-led Sprints, digital tools, business intelligence, Due Diligence and project advisory.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <ButtonLink href="/shop" variant="gold" size="lg" trailingIcon="arrow-right">
                                Explore Sprints
                            </ButtonLink>
                            <ButtonLink href="/business-health-score" variant="outline-light" size="lg">
                                Start Business Health Score
                            </ButtonLink>
                            <ButtonLink href="/discovery-call" variant="outline-light" size="lg" icon="calendar-days">
                                Book Discovery Call
                            </ButtonLink>
                        </div>

                        <ul className="mt-9 grid grid-cols-3 gap-x-4 gap-y-5 sm:grid-cols-6">
                            {heroChips.map((chip) => (
                                <li key={chip.label} className="flex flex-col items-center gap-2 text-center">
                                    <Icon name={chip.icon} className="size-6 text-gold-500" />
                                    <span className="text-[0.6875rem] leading-snug font-medium text-parchment-200">{chip.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-6">
                        <HeroVideo />

                        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {entryPoints.map((entry) => (
                                <li key={entry.title}>
                                    <Link href={entry.href} className="flex h-full flex-col rounded-[6px] border border-gold-700/40 bg-ink-900/80 p-3.5 transition-colors hover:border-gold-500">
                                        <span className="flex items-center gap-2">
                                            <Icon name={entry.icon} className="size-5 text-gold-500" />
                                            <span className="text-[0.8125rem] font-semibold text-parchment-100">{entry.title}</span>
                                        </span>
                                        <span className="mt-1.5 text-[0.6875rem] leading-relaxed text-ink-300">{entry.body}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Stat band */}
                <div className="container-tbca relative pb-8">
                    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border border-gold-600/60 bg-gold-700/30 md:grid-cols-3 xl:grid-cols-6">
                        {stats.map((s) => (
                            <li key={s.label} className="flex items-center gap-3 bg-ink-950 px-4 py-4">
                                <Icon name={s.icon} className="size-8 shrink-0 text-gold-500" />
                                <span>
                                    <span className="block text-[1.0625rem] leading-tight font-bold text-gold-400">{s.value}</span>
                                    <span className="block text-[0.6875rem] leading-snug text-parchment-200">{s.label}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* --------------------------------- Featured Sprints + ecosystem */}
            <section className="bg-parchment-200 py-10">
                <div className="container-tbca grid gap-8 xl:grid-cols-12">
                    <div className="xl:col-span-8">
                        <div className="flex items-end justify-between gap-4">
                            <h2 className="text-[1.0625rem] font-bold text-ink-900">Featured Sprints</h2>
                            <Link href="/shop" className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700 hover:text-gold-800">
                                View All Sprints <ArrowRight className="size-3.5" aria-hidden="true" />
                            </Link>
                        </div>
                        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {sprints.map((s) => (
                                <li key={s.slug}>
                                    <Link
                                        href={`/sprints/${s.slug}`}
                                        className="group flex h-full flex-col rounded-[8px] border border-parchment-400 bg-white p-4 transition-all hover:border-gold-400 hover:shadow-card"
                                    >
                                        <span className="flex items-start gap-3">
                                            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[6px] bg-ink-900 text-gold-400">
                                                <Icon name={s.icon} className="size-5" />
                                            </span>
                                            <span className="text-[0.875rem] leading-snug font-bold text-ink-900">{s.name}</span>
                                        </span>
                                        <span className="mt-2.5 text-[0.75rem] leading-relaxed text-ink-500">{s.summary}</span>
                                        <span className="mt-auto flex items-center justify-between gap-2 pt-3 text-[0.75rem]">
                                            <span className="text-ink-500">
                                                From <strong className="text-[0.875rem] text-ink-900">{price(s.zar)}</strong>
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-verified-500">
                                                <CircleCheck className="size-3.5" aria-hidden="true" /> USD Available
                                            </span>
                                        </span>
                                        <span className="mt-2 flex items-center justify-between gap-2 border-t border-parchment-300 pt-2 text-[0.6875rem] text-ink-500">
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="size-3.5" aria-hidden="true" /> {s.turnaround}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <UserCheck className="size-3.5" aria-hidden="true" /> Human Reviewed
                                            </span>
                                            <ArrowRight className="size-4 text-ink-900 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="xl:col-span-4">
                        <h2 className="text-[1.0625rem] font-bold text-ink-900">Our Platform. One Ecosystem.</h2>
                        <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                            {ecosystem.map((e) => (
                                <li key={e.name}>
                                    <Link href={e.href} className="flex h-full flex-col items-center justify-center gap-2 rounded-[6px] border border-parchment-400 bg-white px-2 py-3.5 text-center transition-colors hover:border-gold-400">
                                        <Icon name={e.icon} className="size-6 text-gold-600" />
                                        <span className="text-[0.6875rem] leading-tight font-semibold text-ink-800">{e.name}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* --------------------------------- How / Why / Evidence */}
            <section className="bg-parchment-200 pb-12">
                <div className="container-tbca grid gap-5 xl:grid-cols-12">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-5 xl:col-span-4">
                        <h2 className="text-[0.9375rem] font-bold text-ink-900">How TBCA Works</h2>
                        <ol className="mt-5 grid grid-cols-5 gap-2">
                            {howItWorks.map((s, i) => (
                                <li key={s.step} className="relative flex flex-col items-center text-center">
                                    {i > 0 && <span className="absolute top-4 right-1/2 h-px w-full border-t border-dashed border-gold-400" aria-hidden="true" />}
                                    <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-ink-900">{s.step}</span>
                                    <span className="mt-2 text-[0.75rem] font-bold text-ink-900">{s.title}</span>
                                    <span className="mt-1 text-[0.625rem] leading-snug text-ink-500">{s.body}</span>
                                </li>
                            ))}
                        </ol>
                        <Link href="/about/methodology" className="mt-5 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-gold-700 hover:text-gold-800">
                            Learn More <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="rounded-[8px] border border-parchment-400 bg-white p-5 xl:col-span-3">
                        <h2 className="text-[0.9375rem] font-bold text-ink-900">Why Choose TBCA</h2>
                        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-2">
                            {differentiators.map((d) => (
                                <li key={d.title} className="text-center">
                                    <Icon name={d.icon ?? 'circle'} className="mx-auto size-7 text-gold-600" />
                                    <h3 className="mt-2 text-[0.75rem] font-bold text-ink-900">{d.title}</h3>
                                    <p className="mt-1 text-[0.6875rem] leading-snug text-ink-500">{d.body}</p>
                                </li>
                            ))}
                        </ul>
                        <Link href="/about" className="mt-5 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-gold-700 hover:text-gold-800">
                            Learn More <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="rounded-[8px] border border-parchment-400 bg-white p-5 xl:col-span-5">
                        <div className="grid gap-5 sm:grid-cols-3">
                            <figure>
                                <div className="flex items-center justify-between gap-2">
                                    <figcaption className="text-[0.75rem] font-bold text-ink-900">Approved Client Testimonial</figcaption>
                                    <LedgerChip code="A" full={false} />
                                </div>
                                <Quote className="mt-3 size-5 text-gold-400" aria-hidden="true" />
                                <blockquote className="mt-1 text-[0.8125rem] leading-snug text-ink-800">
                                    &ldquo;TBCA delivered a bankable business plan that secured our funding within 45 days.&rdquo;
                                </blockquote>
                                <p className="mt-2 text-[0.6875rem] text-ink-500">— Approved Client</p>
                            </figure>
                            <figure>
                                <div className="flex items-center justify-between gap-2">
                                    <figcaption className="text-[0.75rem] font-bold text-ink-900">Verified Case Study</figcaption>
                                    <LedgerChip code="V" full={false} />
                                </div>
                                <Quote className="mt-3 size-5 text-gold-400" aria-hidden="true" />
                                <blockquote className="mt-1 text-[0.8125rem] leading-snug text-ink-800">
                                    &ldquo;The market research Sprint gave us clarity, confidence and a winning strategy.&rdquo;
                                </blockquote>
                                <p className="mt-2 text-[0.6875rem] text-ink-500">— Verified Case Study</p>
                            </figure>
                            <div>
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-[0.75rem] font-bold text-ink-900">Approved Institutional Partner</h3>
                                    <LedgerChip code="R" full={false} />
                                </div>
                                <div className="mt-3 flex items-center gap-2">
                                    <button type="button" onClick={() => setPartner((partner + partners.length - 1) % partners.length)} className="rounded-full border border-parchment-500 p-1 text-ink-600 hover:border-gold-500" aria-label="Previous partner">
                                        <ChevronLeft className="size-3.5" />
                                    </button>
                                    <div className="min-w-0 flex-1 text-center" aria-live="polite">
                                        <p className="font-serif text-[1.125rem] leading-tight font-bold text-ink-900">{current.name}</p>
                                        <p className="text-[0.625rem] leading-snug text-ink-500 uppercase">{current.full}</p>
                                        <p className="mt-1 text-[0.625rem] text-gold-700">— {current.note}</p>
                                    </div>
                                    <button type="button" onClick={() => setPartner((partner + 1) % partners.length)} className="rounded-full border border-parchment-500 p-1 text-ink-600 hover:border-gold-500" aria-label="Next partner">
                                        <ChevronRight className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <ul className="mt-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-parchment-300 pt-4" aria-label="Ecosystem institutions">
                            {ecosystemNames.map((n) => (
                                <li key={n} className="text-[0.8125rem] font-bold tracking-tight text-ink-400">
                                    {n}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-2 text-[0.625rem] leading-relaxed text-ink-400">
                            Institutional relationships vary by mandate, scope and governance. Display is permission- and record-governed.
                        </p>
                    </div>
                </div>
            </section>

            <CtaBand
                title="Ready to Build, Fund, Automate or Scale?"
                body="Start with a diagnostic, choose a Sprint or speak to TBCA about a structured advisory mandate."
                primary={{ label: 'Start Your First Sprint', href: '/shop' }}
                secondary={{ label: 'Talk to TBCA', href: '/contact' }}
            />
        </>
    );
}

function HeroVideo() {
    const [playing, setPlaying] = useState(false);
    const [lang, setLang] = useState<'EN' | 'AF'>('EN');
    const [captions, setCaptions] = useState(true);

    return (
        <div className="relative overflow-hidden rounded-[10px] border-2 border-gold-600/70 bg-gradient-to-br from-ink-900 via-ink-950 to-ink-800">
            <div className="pointer-events-none absolute inset-0 motif-grid opacity-40" aria-hidden="true" />
            <AfricaMark className="pointer-events-none absolute top-6 right-6 h-48 w-auto text-gold-600/30" strokeWidth={1.5} />

            <div className="relative p-5 md:p-6">
                <h2 className="font-serif text-[1.25rem] leading-snug font-bold text-parchment-100 md:text-[1.5rem]">
                    See How TBCA Helps You
                    <br />
                    Build, Fund, Automate and Scale
                </h2>
                <p className="mt-1 text-[0.8125rem] font-semibold text-gold-500">Watch the 90-second platform explainer.</p>

                <div className="flex h-36 items-center justify-center md:h-40">
                    <button
                        type="button"
                        onClick={() => setPlaying(!playing)}
                        aria-pressed={playing}
                        aria-label={playing ? 'Pause platform explainer' : 'Play platform explainer'}
                        className="inline-flex size-16 items-center justify-center rounded-full border-4 border-gold-300/60 bg-gold-500 text-ink-900 shadow-raised transition-transform hover:scale-105"
                    >
                        {playing ? <span className="flex gap-1.5"><span className="h-6 w-1.5 bg-ink-900" /><span className="h-6 w-1.5 bg-ink-900" /></span> : <Play className="size-7 translate-x-0.5 fill-current" aria-hidden="true" />}
                    </button>
                </div>

                {captions && playing && (
                    <p className="mb-2 rounded bg-ink-950/80 px-3 py-1.5 text-center text-[0.75rem] text-parchment-100" aria-live="polite">
                        {lang === 'EN' ? 'TBCA brings Sprints, intelligence and AI automation into one governed platform.' : 'TBCA bring Sprints, intelligensie en KI-outomatisering saam in een beheerde platform.'}
                    </p>
                )}

                <div className="flex items-center gap-3 text-[0.75rem] text-parchment-200">
                    <Play className="size-3.5 fill-current" aria-hidden="true" />
                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-ink-700">
                        <span className={playing ? 'block h-full w-1/3 bg-gold-500' : 'block h-full w-0 bg-gold-500'} />
                    </span>
                    <span>{playing ? '0:30' : '1:30'} / 1:30</span>
                    <button type="button" onClick={() => setCaptions(!captions)} aria-pressed={captions} className={`rounded-[3px] border px-1.5 py-0.5 text-[0.625rem] ${captions ? 'border-gold-500 text-gold-400' : 'border-ink-600'}`}>
                        CC
                    </button>
                    {(['EN', 'AF'] as const).map((l) => (
                        <button key={l} type="button" onClick={() => setLang(l)} aria-pressed={lang === l} className={`rounded-[3px] border px-1.5 py-0.5 text-[0.625rem] ${lang === l ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-ink-600'}`}>
                            {l}
                        </button>
                    ))}
                    <span className="hidden items-center gap-1 sm:inline-flex">
                        <CalendarDays className="size-3.5" aria-hidden="true" /> Wave 1
                    </span>
                </div>
            </div>
        </div>
    );
}

Home.layout = (page: ReactElement) => <PublicLayout headerVariant="dark">{page}</PublicLayout>;
