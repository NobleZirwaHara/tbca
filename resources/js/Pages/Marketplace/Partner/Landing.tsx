import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Check, Headphones, Scale, ShieldCheck, TriangleAlert, Sparkles } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import { PIcon, TRUST_CHIPS } from '@/Components/Marketplace/PartnerKit';

interface Props {
    disciplines: { key: string; icon: string; title: string; body: string }[];
    content: {
        confidence: string[];
        how: { title: string; body: string }[];
        safeguards: string[];
        needs: { icon: string; title: string; body: string }[];
        deliverables: { title: string; body: string }[];
        boundaries: string[];
    };
}

const dark = 'rounded-[8px] border border-ink-700 bg-ink-900/80 p-5';

export default function Landing({ disciplines, content }: Props) {
    return (
        <div className="bg-ink-950 text-parchment-100">
            <Head title="Partner Services" />

            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
                <div className="container-tbca relative grid gap-8 py-12 lg:grid-cols-12 lg:py-16">
                    <div className="lg:col-span-5">
                        <h1 className="font-serif text-4xl font-bold md:text-5xl">Partner Services.</h1>
                        <p className="mt-2 text-xl font-semibold text-gold-400 md:text-2xl">Specialist Expertise. Regulated Integrity.</p>
                        <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-200">
                            Access vetted, qualified and independent professional firms across legal, audit, tax, ESG, engineering, environmental, financial and compliance disciplines.
                            Human-reviewed engagements with clear boundaries.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <ButtonLink href="/partner-services/choose-service" trailingIcon="arrow-right">Request Partner Review</ButtonLink>
                            <ButtonLink href="/partner-services/professional-limitation-notice" variant="outline-light" icon="eye">View Boundaries</ButtonLink>
                        </div>
                    </div>
                    <div className="flex items-center justify-center lg:col-span-3">
                        <div className="flex size-44 items-center justify-center rounded-[40%_40%_50%_50%] border-2 border-gold-500/70 shadow-[0_0_60px_rgba(214,163,46,0.35)]">
                            <Scale className="size-20 text-gold-400" aria-hidden="true" />
                        </div>
                    </div>
                    <aside className={`${dark} lg:col-span-4`}>
                        <h2 className="text-sm font-semibold text-parchment-100">Engage with Confidence</h2>
                        <ul className="mt-3 space-y-2 text-[0.8125rem] text-ink-200">
                            {content.confidence.map((c) => (
                                <li key={c} className="flex items-center gap-2"><ShieldCheck className="size-4 text-gold-400" aria-hidden="true" />{c}</li>
                            ))}
                        </ul>
                    </aside>
                </div>
                <div className="container-tbca relative pb-8">
                    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                        {TRUST_CHIPS.map((c) => (
                            <li key={c} className="rounded-[6px] border border-ink-700 bg-ink-900 px-3 py-2 text-center text-[0.6875rem] text-ink-200">{c}</li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="container-tbca pb-10">
                <h2 className="mb-4 text-lg font-semibold">Our Partner Service Disciplines</h2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
                    {disciplines.map((d) => (
                        <li key={d.key} className={`${dark} flex flex-col !p-4`}>
                            <PIcon name={d.icon} className="text-gold-400" />
                            <h3 className="mt-2 text-[0.8125rem] font-semibold">{d.title}</h3>
                            <p className="mt-1 flex-1 text-[0.6875rem] leading-relaxed text-ink-300">{d.body}</p>
                            <Link href={`/partner-services/choose-service?category=${d.key}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-400 hover:text-gold-300">
                                Explore <ArrowRight className="size-3" aria-hidden="true" /><span className="sr-only"> {d.title}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="container-tbca grid gap-4 pb-12 md:grid-cols-2 xl:grid-cols-5">
                <div className={dark}>
                    <h2 className="mb-3 text-sm font-semibold">How It Works</h2>
                    <ol className="space-y-3">
                        {content.how.map((h, i) => (
                            <li key={h.title} className="flex gap-3">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-900">{i + 1}</span>
                                <div><p className="text-[0.8125rem] font-semibold">{h.title}</p><p className="text-[0.6875rem] text-ink-300">{h.body}</p></div>
                            </li>
                        ))}
                    </ol>
                </div>
                <div className={dark}>
                    <h2 className="mb-3 text-sm font-semibold">Engagement Safeguards</h2>
                    <ul className="space-y-2 text-[0.8125rem] text-ink-200">
                        {content.safeguards.map((s) => <li key={s} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden="true" />{s}</li>)}
                    </ul>
                    <p className="mt-4 flex gap-2 rounded-[6px] border border-gold-500/40 p-3 text-xs text-gold-300"><Sparkles className="size-4 shrink-0" aria-hidden="true" />AI supports research and analysis. Final output always human-reviewed.</p>
                </div>
                <div className={dark}>
                    <h2 className="mb-3 text-sm font-semibold">What We Need From You</h2>
                    <ul className="space-y-3">
                        {content.needs.map((n) => (
                            <li key={n.title} className="flex gap-2.5"><PIcon name={n.icon} className="size-4 shrink-0 text-gold-400" /><div><p className="text-[0.8125rem] font-semibold">{n.title}</p><p className="text-[0.6875rem] text-ink-300">{n.body}</p></div></li>
                        ))}
                    </ul>
                    <ButtonLink href="/partner-services/request" variant="outline-light" size="sm" className="mt-4 w-full">Start Request</ButtonLink>
                </div>
                <div className={dark}>
                    <h2 className="mb-3 text-sm font-semibold">Typical Deliverables</h2>
                    <ul className="space-y-3">
                        {content.deliverables.map((d) => (
                            <li key={d.title} className="flex gap-2.5"><PIcon name="file-text" className="size-4 shrink-0 text-gold-400" /><div><p className="text-[0.8125rem] font-semibold">{d.title}</p><p className="text-[0.6875rem] text-ink-300">{d.body}</p></div></li>
                        ))}
                    </ul>
                </div>
                <div className={dark}>
                    <h2 className="mb-3 text-sm font-semibold">Important Boundaries</h2>
                    <ul className="space-y-2 text-[0.8125rem] text-ink-200">
                        {content.boundaries.map((b) => <li key={b} className="flex gap-2"><TriangleAlert className="mt-0.5 size-4 shrink-0 text-gold-400" aria-hidden="true" />{b}</li>)}
                    </ul>
                    <ButtonLink href="/partner-services/professional-limitation-notice" variant="outline-light" size="sm" className="mt-4 w-full">View All Boundaries</ButtonLink>
                </div>
            </section>

            <section className="container-tbca pb-14">
                <div className="flex flex-col items-center justify-between gap-5 rounded-[10px] border border-gold-500/50 bg-ink-900 p-6 text-center md:flex-row md:text-left">
                    <div>
                        <h2 className="text-xl font-semibold">Need a specialist review or independent expert input?</h2>
                        <p className="mt-1 text-sm text-ink-300">Submit your request and we&rsquo;ll connect you with the right partner for a human-reviewed solution.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        <ButtonLink href="/partner-services/choose-service" trailingIcon="arrow-right">Request Partner Review</ButtonLink>
                        <button type="button" onClick={() => openAskQuestion({ subject: 'Talk to a Partner Services specialist', section: 'Partner Services' })} className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-ink-600 px-5 text-sm text-parchment-100 hover:border-gold-500">
                            <Headphones className="size-4" aria-hidden="true" /> Talk to a Specialist
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
