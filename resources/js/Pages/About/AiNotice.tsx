import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Info, ShieldAlert, FileText } from 'lucide-react';
import { StatusPill } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import AboutHero from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import Seal from '@/Components/About/Seal';
import { AiCompactNotice } from '@/Components/About/Notices';

interface Notice {
    banner: string;
    rows: { icon: string; label: string; value: string; chip: string | null; tone: 'neutral' | 'warn' | 'good' | null }[];
    rules: { icon: string; title: string; body: string }[];
    guidance: { icon: string; title: string; body: string }[];
}

export default function AiNotice({ notice }: { notice: Notice }) {
    return (
        <>
            <Head title="AI Disclosure Notice" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'AI Disclosure Notice' }]}
                title="AI Disclosure Notice"
                lead="Clear disclosure whenever AI assists. Human judgment remains responsible."
                aside={<Seal top="HUMAN RESPONSIBILITY" bottom="TBCA GOVERNANCE" variant="shield" className="mx-auto w-40 lg:ml-auto lg:mr-0" />}
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-5 lg:grid-cols-[1fr_20rem]">
                    <div className="space-y-5">
                        <article className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="flex items-center gap-2 font-serif text-[1.25rem] font-semibold text-ink-900">
                                <FileText className="size-6 text-gold-600" aria-hidden="true" /> Standard Disclosure
                            </h2>
                            <p className="mt-3 flex items-start gap-3 rounded-[6px] border border-gold-400 bg-gold-50/60 p-3 text-sm font-semibold text-ink-900">
                                <AboutIcon name="shield-check" className="size-6 shrink-0 text-gold-600" />
                                {notice.banner}
                            </p>
                            <dl className="mt-3 divide-y divide-parchment-300 rounded-[6px] border border-parchment-400">
                                {notice.rows.map((r) => (
                                    <div key={r.label} className="grid gap-2 px-3 py-2.5 text-[0.8125rem] sm:grid-cols-[14rem_1fr_auto] sm:items-center">
                                        <dt className="flex items-center gap-2 font-semibold text-ink-900">
                                            <AboutIcon name={r.icon} className="size-4 text-gold-600" /> {r.label}
                                        </dt>
                                        <dd className="text-ink-700">{r.value}</dd>
                                        <dd>{r.chip && <StatusPill status={r.chip} tone={r.tone ?? 'neutral'} className="normal-case" />}</dd>
                                    </div>
                                ))}
                            </dl>
                        </article>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-[8px] border border-gold-300 bg-white p-4">
                                <p className="mb-2 text-sm font-semibold text-ink-900">1. Compact Banner Notice</p>
                                <AiCompactNotice />
                            </div>
                            <div className="rounded-[8px] border border-gold-300 bg-white p-4">
                                <p className="mb-2 text-sm font-semibold text-ink-900">2. Inline Article Disclosure</p>
                                <div className="flex items-start gap-2 rounded-[6px] border border-parchment-400 p-3 text-[0.75rem] text-ink-700">
                                    <FileText className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
                                    <span>
                                        This content includes AI-assisted organisation and analysis. Human review is required before any decisions or publication.{' '}
                                        <Link href="/about/ai-disclosure" className="font-semibold text-gold-700">View Disclosure</Link>
                                    </span>
                                </div>
                            </div>
                            <div className="rounded-[8px] border border-risk-500/40 bg-white p-4">
                                <p className="mb-2 text-sm font-semibold text-ink-900">3. High-Risk Sidebar Disclosure</p>
                                <div className="flex items-start gap-2 rounded-[6px] border border-risk-500/40 bg-risk-50 p-3 text-[0.75rem] text-ink-700">
                                    <ShieldAlert className="mt-0.5 size-4 shrink-0 text-risk-500" aria-hidden="true" />
                                    <span>
                                        <span className="block font-semibold text-risk-700">High-Risk Content</span>
                                        AI assistance provided. Qualified review is mandatory before release.{' '}
                                        <Link href="/about/professional-boundaries" className="font-semibold text-risk-700">See Requirements</Link>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <article className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">Component Rules (Disclosure Governance)</h2>
                            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                {notice.rules.map((r) => (
                                    <li key={r.title} className="flex items-start gap-2.5">
                                        <AboutIcon name={r.icon} className="mt-0.5 size-6 shrink-0 text-gold-600" />
                                        <div>
                                            <p className="text-[0.8125rem] font-semibold text-ink-900">{r.title}</p>
                                            <p className="text-[0.75rem] text-ink-600">{r.body}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <ButtonLink href="/about/professional-boundaries" variant="outline" size="sm" className="mt-4" trailingIcon="arrow-right">
                                See Professional Boundaries
                            </ButtonLink>
                        </article>
                    </div>

                    <aside className="h-fit rounded-[8px] border border-parchment-400 bg-white p-5">
                        <h2 className="font-semibold text-ink-900">Governance Guidance</h2>
                        <ul className="mt-4 space-y-4">
                            {notice.guidance.map((g) => (
                                <li key={g.title} className="flex items-start gap-3">
                                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-gold-300 text-gold-600">
                                        <AboutIcon name={g.icon} className="size-4.5" />
                                    </span>
                                    <div>
                                        <p className="text-[0.8125rem] font-semibold text-ink-900">{g.title}</p>
                                        <p className="text-[0.75rem] text-ink-600">{g.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <Link href="/about/governance" className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] border border-gold-500 px-3 py-2 text-sm font-semibold text-gold-700 hover:bg-gold-50">
                            View Governance Principles <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                    </aside>
                </div>
            </section>
        </>
    );
}
