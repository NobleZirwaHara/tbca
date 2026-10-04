import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight, ChevronRight, CircleCheck, CircleX, ShieldCheck } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import AboutHero, { AsideCard, NoticeBand } from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import { cn } from '@/lib/cn';

interface Content {
    nav: { key: string; label: string; icon: string }[];
    do: string[];
    dont: string[];
    protect: { icon: string; text: string }[];
    sections: Record<string, { title: string; body: string }>;
    matrix: { area: string; may: string; qualified: string }[];
}

export default function Boundaries({ content }: { content: Content }) {
    const [active, setActive] = useState('overview');
    const section = content.sections[active];

    const doCard = (
        <article className={cn('rounded-[8px] border bg-white p-5', active === 'do' ? 'border-verified-500' : 'border-parchment-400')}>
            <h2 className="flex items-center gap-2 text-[1rem] font-semibold text-ink-900">
                <CircleCheck className="size-6 text-verified-500" aria-hidden="true" /> What We Do
            </h2>
            <p className="mt-2 text-[0.8125rem] text-ink-600">We provide strategic advisory and project support including:</p>
            <ul className="mt-3 space-y-2">
                {content.do.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-[0.8125rem] text-ink-700">
                        <span className="text-verified-500" aria-hidden="true">✓</span> {d}
                    </li>
                ))}
            </ul>
            <Link href="/services" className="mt-4 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-verified-700 hover:underline">
                View Full Scope of Services <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
        </article>
    );

    const dontCard = (
        <article className={cn('rounded-[8px] border bg-white p-5', active === 'dont' ? 'border-risk-500' : 'border-parchment-400')}>
            <h2 className="flex items-center gap-2 text-[1rem] font-semibold text-ink-900">
                <CircleX className="size-6 text-risk-500" aria-hidden="true" /> What We Do Not Do
            </h2>
            <p className="mt-2 text-[0.8125rem] text-ink-600">We do not provide services that require a licence or registration under law, including:</p>
            <ul className="mt-3 space-y-2">
                {content.dont.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-[0.8125rem] text-ink-700">
                        <span className="text-risk-500" aria-hidden="true">✕</span> {d}
                    </li>
                ))}
            </ul>
            <button type="button" onClick={() => setActive('escalation')} className="mt-4 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-risk-700 hover:underline">
                View Full Exclusions <ArrowRight className="size-3.5" aria-hidden="true" />
            </button>
        </article>
    );

    return (
        <>
            <Head title="Professional Boundaries" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Professional Boundaries' }]}
                title="Professional Boundaries"
                lead="Independent Advice. Clear Boundaries. Ethical Practice."
                intro="We provide strategic advisory and project support within clearly defined professional boundaries. We do not provide legal, tax, audit or regulated financial services."
                aside={
                    <AsideCard
                        icon="shield-check"
                        title="Why Boundaries Matter"
                        body="Clear boundaries protect our clients, our team and the integrity of every engagement. They ensure we deliver value without stepping outside our professional remit."
                        link={{ label: 'View Our Governance Framework', href: '/about/governance' }}
                    />
                }
            />

            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-5 lg:grid-cols-[15rem_1fr]">
                    <nav aria-label="Boundaries sections" className="h-fit overflow-hidden rounded-[8px] border border-parchment-400 bg-white">
                        {content.nav.map((n) => (
                            <button
                                key={n.key}
                                type="button"
                                onClick={() => setActive(n.key)}
                                aria-current={active === n.key ? 'true' : undefined}
                                className={cn(
                                    'flex w-full items-center gap-3 border-b border-parchment-300 px-4 py-3 text-left text-[0.8125rem] font-medium last:border-0',
                                    active === n.key ? 'bg-ink-900 text-parchment-100' : 'text-ink-700 hover:bg-parchment-100',
                                )}
                            >
                                <AboutIcon name={n.icon} className="size-4.5 shrink-0" />
                                <span className="flex-1">{n.label}</span>
                                <ChevronRight className="size-4" aria-hidden="true" />
                            </button>
                        ))}
                    </nav>

                    <div className="space-y-5">
                        {section && (
                            <article className="rounded-[8px] border border-gold-300 bg-white p-5">
                                <h2 className="font-serif text-[1.25rem] font-semibold text-ink-900">{section.title}</h2>
                                <p className="mt-2 text-sm leading-relaxed text-ink-700">{section.body}</p>
                                {active === 'escalation' && (
                                    <div className="mt-4 overflow-x-auto">
                                        <table className="w-full min-w-[640px] text-left text-[0.8125rem]">
                                            <thead className="bg-parchment-200 text-xs text-ink-600">
                                                <tr>
                                                    <th className="px-3 py-2">Area</th>
                                                    <th className="px-3 py-2">TBCA may support</th>
                                                    <th className="px-3 py-2">Qualified professional required</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-parchment-300">
                                                {content.matrix.map((m) => (
                                                    <tr key={m.area}>
                                                        <td className="px-3 py-2 font-semibold text-ink-900">{m.area}</td>
                                                        <td className="px-3 py-2 text-ink-700">{m.may}</td>
                                                        <td className="px-3 py-2 text-ink-700">{m.qualified}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </article>
                        )}

                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                            {doCard}
                            {dontCard}
                            <article className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                <h2 className="flex items-center gap-2 text-[1rem] font-semibold text-ink-900">
                                    <ShieldCheck className="size-6 text-controlled-500" aria-hidden="true" /> How We Protect You
                                </h2>
                                <ul className="mt-4 space-y-3">
                                    {content.protect.map((p) => (
                                        <li key={p.text} className="flex items-start gap-3 text-[0.8125rem] text-ink-700">
                                            <AboutIcon name={p.icon} className="mt-0.5 size-5 shrink-0 text-controlled-500" />
                                            {p.text}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/about/trust-badge" className="mt-4 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-controlled-700 hover:underline">
                                    View Our Ethical Commitments <ArrowRight className="size-3.5" aria-hidden="true" />
                                </Link>
                            </article>
                            <article className="space-y-5 rounded-[8px] border border-parchment-400 bg-white p-5">
                                <div>
                                    <h2 className="text-[1rem] font-semibold text-ink-900">Need Specialist Services?</h2>
                                    <p className="mt-2 text-[0.8125rem] text-ink-600">Where services fall outside our remit, we will refer you to trusted, qualified professionals within our network.</p>
                                    <ButtonLink href="/about/partner-enquiry" variant="outline" size="sm" className="mt-3 w-full" trailingIcon="arrow-right">
                                        View Our Partner Network
                                    </ButtonLink>
                                </div>
                                <div className="border-t border-parchment-300 pt-5">
                                    <h2 className="text-[1rem] font-semibold text-ink-900">Report a Concern</h2>
                                    <p className="mt-2 text-[0.8125rem] text-ink-600">If you believe we have crossed a boundary, please let us know. All concerns are treated seriously and confidentially.</p>
                                    <ButtonLink href="/complaints" variant="outline" size="sm" className="mt-3 w-full" trailingIcon="arrow-right">
                                        Submit a Concern
                                    </ButtonLink>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>

                <div className="container-tbca mt-6">
                    <NoticeBand
                        tone="blue"
                        action={
                            <ButtonLink href="/about/governance" variant="outline" trailingIcon="arrow-right">
                                View Governance Framework
                            </ButtonLink>
                        }
                    >
                        Our boundaries are enforced through policy, training and oversight. Breaches are escalated, corrected and, where necessary, reported.
                    </NoticeBand>
                </div>
            </section>
        </>
    );
}
