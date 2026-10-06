import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BarChart3, Check, ClipboardList, Headphones, LayoutDashboard, RefreshCw, Rocket, ShieldCheck, Target, UserCheck, UserRound, Users } from 'lucide-react';
import { ProductsHero } from '@/Components/Products/Shared';
import { ButtonLink } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import { usePrice } from '@/lib/money';
import type { RetService } from '@/Components/Products/Retainers/types';
import { retIcon } from '@/Components/Products/Retainers/ui';

const HERO_FEATURES = [
    { icon: UserRound, label: 'Dedicated Account Manager' },
    { icon: Target, label: 'Monthly Strategy & Execution' },
    { icon: UserCheck, label: 'Human-Reviewed Outputs' },
    { icon: LayoutDashboard, label: 'Dashboards & KPIs' },
    { icon: Headphones, label: 'Priority Support & Response' },
];

const INCLUDED = ['Named Account Owner', 'Human-Reviewed Outputs', 'Monthly Dashboard Access', 'Priority Support Channels', 'Secure Client Portal', 'POPIA-Compliant', 'Audit Trail & Reporting', 'Pricing in 5 Currencies'];

const BENEFITS = [
    { icon: ClipboardList, title: 'Service Level Agreements', body: 'Defined response & delivery times.' },
    { icon: BarChart3, title: 'Monthly Reporting', body: 'Performance, KPIs & insights.' },
    { icon: RefreshCw, title: 'Renewal & Review', body: 'Quarterly scope & value review.' },
    { icon: Rocket, title: 'Scalable Engagements', body: 'Increase or adjust as you grow.' },
    { icon: ShieldCheck, title: 'Trusted & Secure', body: 'Bank-grade security & POPIA-ready.' },
];

export default function Landing({ desks }: { desks: RetService[] }) {
    const price = usePrice();

    return (
        <>
            <Head title="Retainers That Deliver Continuous Value" />

            <ProductsHero
                title="Retainers That Deliver"
                goldLine="Continuous Value."
                lead="Ongoing advisory, managed services and expert support designed to help you execute, grow and scale. Human-reviewed. Performance-driven. Results-focused."
                actions={
                    <>
                        <ButtonLink href="/retainers/choose" trailingIcon="arrow-right">
                            Request Proposal
                        </ButtonLink>
                        <ButtonLink href="/retainers/compare" variant="outline-light" icon="shield">
                            View Service Levels
                        </ButtonLink>
                    </>
                }
                aside={
                    <div className="relative hidden h-full min-h-[260px] overflow-hidden rounded-[10px] border border-ink-700 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 lg:block" aria-hidden="true">
                        <div className="absolute inset-0 motif-grid opacity-40" />
                        <div className="absolute top-8 right-8 grid grid-cols-3 gap-2">
                            {[44, 62, 38, 70, 52, 80].map((h, i) => (
                                <span key={i} className="w-4 rounded-sm bg-gold-500/70" style={{ height: h }} />
                            ))}
                        </div>
                        <div className="absolute bottom-8 left-8 flex -space-x-3">
                            {['JM', 'SN', 'TD', 'PK'].map((n) => (
                                <span key={n} className="flex size-12 items-center justify-center rounded-full border-2 border-ink-900 bg-gold-500/20 text-sm font-bold text-gold-300">
                                    {n}
                                </span>
                            ))}
                        </div>
                        <p className="absolute bottom-10 left-44 text-xs text-ink-300">Named advisers · reserved capacity</p>
                    </div>
                }
            >
                <ul className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border border-ink-700 bg-ink-700 sm:grid-cols-5">
                    {HERO_FEATURES.map(({ icon: Icon, label }) => (
                        <li key={label} className="flex flex-col items-center gap-2 bg-ink-900/90 px-2 py-3 text-center text-[0.6875rem] font-medium text-parchment-200">
                            <Icon className="size-5 text-gold-400" aria-hidden="true" />
                            {label}
                        </li>
                    ))}
                </ul>
            </ProductsHero>

            <section className="bg-ink-950 pb-12 text-parchment-100">
                <div className="container-tbca">
                    <h2 className="font-serif text-xl font-semibold">Choose Your Retainer Desk</h2>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                        {desks.map((d) => {
                            const Icon = retIcon(d.icon);
                            const href = d.custom_pricing ? '/retainers/choose' : `/retainers/${d.slug}`;
                            return (
                                <article key={d.slug} className="flex flex-col rounded-[8px] border border-gold-700/50 bg-ink-900 p-4">
                                    <div className="flex items-start gap-2.5">
                                        <Icon className="mt-0.5 size-6 shrink-0 text-gold-400" aria-hidden="true" />
                                        <div>
                                            <h3 className="text-sm font-semibold">{d.name.replace(' Retainer', '').replace('Executive Advisory', 'Executive Advisory Desk')}</h3>
                                            <p className="mt-1 text-[0.6875rem] leading-snug text-ink-300">{d.summary}</p>
                                        </div>
                                    </div>
                                    {d.custom_pricing ? (
                                        <div className="mt-4">
                                            <p className="text-base font-semibold text-gold-400">Custom Pricing</p>
                                            <p className="text-[0.6875rem] text-ink-400">Based on scope</p>
                                        </div>
                                    ) : (
                                        <div className="mt-4 flex items-end justify-between gap-2">
                                            <div>
                                                <p className="text-[0.6875rem] text-ink-400">From</p>
                                                <p className="text-lg font-bold text-gold-400">
                                                    {price(d.price_zar)}
                                                    <span className="text-[0.625rem] font-normal text-ink-300"> /month</span>
                                                </p>
                                            </div>
                                            {d.price_usd && (
                                                <div className="text-right text-[0.625rem] text-verified-500">
                                                    USD Available
                                                    <p className="text-xs font-semibold">${d.price_usd.toLocaleString()} /month</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <ul className="mt-3 flex-1 space-y-1.5">
                                        {d.checklist.map((c) => (
                                            <li key={c} className="flex gap-1.5 text-[0.6875rem] text-ink-200">
                                                <Check className="mt-0.5 size-3 shrink-0 text-gold-400" aria-hidden="true" />
                                                {c}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href={d.custom_pricing ? '/retainers/choose' : `/retainers/${d.slug}/exclusions`} className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] bg-gold-500 text-[0.8125rem] font-semibold text-ink-900 hover:bg-gold-400">
                                        Request Proposal <ArrowRight className="size-3.5" aria-hidden="true" />
                                    </Link>
                                    <Link href={href} className="mt-2 text-center text-[0.6875rem] font-medium text-gold-400 hover:text-gold-300">
                                        View Service Level →
                                    </Link>
                                </article>
                            );
                        })}
                        <aside className="rounded-[8px] border border-gold-600 bg-ink-900 p-4">
                            <h3 className="text-sm font-semibold text-gold-400">What&apos;s Included in Every Retainer</h3>
                            <ul className="mt-3 space-y-2">
                                {INCLUDED.map((c) => (
                                    <li key={c} className="flex gap-1.5 text-[0.6875rem] text-ink-200">
                                        <Check className="mt-0.5 size-3 shrink-0 text-gold-400" aria-hidden="true" />
                                        {c}
                                    </li>
                                ))}
                            </ul>
                        </aside>
                    </div>

                    <ul className="mt-8 grid gap-px overflow-hidden rounded-[8px] border border-ink-700 bg-ink-700 sm:grid-cols-2 lg:grid-cols-5">
                        {BENEFITS.map(({ icon: Icon, title, body }) => (
                            <li key={title} className="flex items-start gap-3 bg-ink-900 p-4">
                                <Icon className="mt-0.5 size-6 shrink-0 text-gold-400" aria-hidden="true" />
                                <div>
                                    <p className="text-[0.8125rem] font-semibold">{title}</p>
                                    <p className="text-xs text-ink-300">{body}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="relative mt-8 overflow-hidden rounded-[10px] border border-gold-700/60 bg-ink-900 p-6 md:p-8">
                        <div className="pointer-events-none absolute inset-0 motif-glow opacity-60" aria-hidden="true" />
                        <div className="relative flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-4">
                                <Users className="size-10 shrink-0 text-gold-400" aria-hidden="true" />
                                <div>
                                    <p className="font-serif text-xl font-semibold md:text-2xl">Build Long-Term Success with the Right Advisory Partner.</p>
                                    <p className="mt-1 text-sm text-ink-300">Speak to our team to design a retainer that fits your goals and drives measurable results.</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <ButtonLink href="/retainers/choose" trailingIcon="arrow-right">
                                    Request a Retainer Proposal
                                </ButtonLink>
                                <button type="button" onClick={() => openAskQuestion({ subject: 'Retainer enquiry', section: 'retainers' })} className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-ink-600 px-5 text-sm text-parchment-100 hover:border-gold-500 hover:text-gold-300">
                                    <Headphones className="size-4" aria-hidden="true" /> Talk to TBCA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
