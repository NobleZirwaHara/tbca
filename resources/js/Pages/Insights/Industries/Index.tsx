import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, BarChart3, CheckCircle2, Filter, Globe, HelpCircle, Layers, MousePointerClick, Search, ShieldCheck, Sparkles, Star, Target, Users, Zap } from 'lucide-react';
import AfricaCountryMap from '@/Components/Map/AfricaCountryMap';
import { IndustriesSubNav, NextSteps, AdvisorCard } from '@/Components/Insights/Industries';
import { DynIcon, TrustStrip } from '@/Components/Insights/Shared';
import EmbeddedServices, { type EmbeddedSection } from '@/Components/Embedded/EmbeddedServices';
import type { IndustryCard, IndustryContextValue } from '@/types/insights';

interface Props {
    industries: IndustryCard[];
    context: IndustryContextValue;
    glance: { industries: number; specialists: string; projects: string; capital: string; humanReviewed: string };
    embedded?: EmbeddedSection;
}

export default function IndustriesIndex({ industries, context, glance, embedded }: Props) {
    const guidance = useForm({ q: '' });

    return (
        <>
            <Head title="Industries" />
            <IndustriesSubNav />

            {/* Hero (Front-end Industries page) */}
            <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
                <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 items-center justify-center opacity-40 lg:flex" aria-hidden="true">
                    <AfricaCountryMap decorative className="w-[min(560px,90%)]" />
                </div>
                <div className="container-tbca relative grid gap-8 py-10 lg:grid-cols-[1fr_320px] lg:py-14">
                    <div>
                        <h1 className="font-serif text-3xl leading-tight font-semibold sm:text-[2.6rem]">
                            Industries We Understand.
                            <span className="block text-gold-400">Solutions That Deliver Impact.</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-ink-200">
                            Deep industry expertise. Proven methodologies. Practical solutions. We help organisations across sectors overcome challenges, unlock opportunities and achieve sustainable growth.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/industries/select" className="inline-flex items-center gap-2 rounded-[4px] bg-gold-500 px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                Explore All Industries <ArrowRight className="size-4" />
                            </Link>
                            <Link href="/industries/sector-intelligence" className="inline-flex items-center gap-2 rounded-[4px] border border-ink-600 px-5 py-3 text-sm text-parchment-100 hover:border-gold-500">
                                <BarChart3 className="size-4" /> Industry Insights Hub
                            </Link>
                        </div>
                    </div>
                    <div className="rounded-[8px] border border-gold-700/60 bg-ink-900/80 p-5">
                        <h2 className="text-lg font-semibold text-gold-400">Industries at a Glance</h2>
                        <dl className="mt-3 space-y-3">
                            {[
                                [glance.industries, 'Key Industries', Layers], [glance.specialists, 'Industry Specialists', Users], [glance.projects, 'Successful Projects', Target],
                                [glance.capital, 'Capital Facilitated', Zap], [glance.humanReviewed, 'Human-Reviewed Insights', BadgeCheck],
                            ].map(([v, l, Icon]) => {
                                const I = Icon as typeof Users;
                                return (
                                    <div key={l as string} className="flex items-center gap-3">
                                        <I className="size-5 text-gold-400" aria-hidden="true" />
                                        <div><dt className="sr-only">{l as string}</dt><dd className="text-lg leading-tight font-bold">{v as string}</dd><p className="text-xs text-ink-300">{l as string}</p></div>
                                    </div>
                                );
                            })}
                        </dl>
                    </div>
                </div>
            </section>

            {/* Landing body (IN-SCR-001) */}
            <div className="bg-parchment-100">
                <div className="container-tbca grid gap-6 py-8 lg:grid-cols-[1fr_300px]">
                    <div className="min-w-0 space-y-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="max-w-2xl">
                                <h2 className="font-serif text-2xl font-semibold text-ink-900 sm:text-3xl">Find the Right Industry. Unlock the Right Opportunities.</h2>
                                <p className="mt-1 font-semibold text-gold-700">Industry changes relevance, cost and what TBCA can safely deliver.</p>
                                <p className="mt-2 text-sm text-ink-600">Select your primary industry to see what TBCA can do, what it cannot do, what evidence is required, what specialist supports may be needed and what the total cost of success looks like.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link href="/industries/select" className="inline-flex items-center gap-2 rounded-[4px] bg-gold-500 px-5 py-2.5 text-sm font-bold text-ink-900 uppercase">Select Industry <ArrowRight className="size-4" /></Link>
                            <Link href="/industries/sector-intelligence" className="inline-flex items-center gap-2 rounded-[4px] border border-ink-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 uppercase">View Sector Intelligence <ArrowRight className="size-4" /></Link>
                            <a href="https://wa.me/27608011365" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[4px] border border-verified-500/50 bg-white px-5 py-2.5 text-sm font-semibold text-verified-700">WhatsApp Support</a>
                        </div>

                        <div className="rounded-[8px] border border-gold-300 bg-gold-50/60 p-4">
                            <form
                                className="flex flex-col gap-3 sm:flex-row sm:items-center"
                                onSubmit={(e) => { e.preventDefault(); guidance.post('/industries/guidance', { preserveScroll: true }); }}
                            >
                                <span className="text-sm font-semibold text-ink-800">Not sure which industry fits?</span>
                                <label className="relative flex-1">
                                    <span className="sr-only">Describe your business</span>
                                    <Search className="absolute top-3 left-3 size-4 text-ink-400" />
                                    <input value={guidance.data.q} onChange={(e) => guidance.setData('q', e.target.value)} placeholder="Describe your business, service or project to get guidance..." className="h-10 w-full rounded-[4px] border border-parchment-500 bg-white pr-3 pl-9 text-sm focus:border-gold-500 focus:outline-none" />
                                </label>
                                <button type="submit" disabled={guidance.processing} className="rounded-[4px] bg-ink-900 px-5 py-2.5 text-sm font-bold text-parchment-100 uppercase">Get Guidance →</button>
                            </form>
                            {guidance.errors.q && <p role="alert" className="mt-1 text-xs text-risk-500">{guidance.errors.q}</p>}
                            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gold-200 pt-3 text-xs font-bold text-ink-800 uppercase">
                                <span className="font-normal normal-case text-ink-600">Our Proven Method</span>
                                {[['Select', MousePointerClick], ['Verify', ShieldCheck], ['Resolve Controls', CheckCircle2], ['Curate', Star], ['Filter', Filter], ['Go', ArrowRight]].map(([l, I], i) => {
                                    const Icon = I as typeof Star;
                                    return <span key={l as string} className="flex items-center gap-1.5">{i > 0 && <span className="text-ink-300">→</span>}<Icon className="size-4 text-gold-700" />{l as string}</span>;
                                })}
                                <span className="ml-auto font-normal normal-case">Safe. Honest. Evidence-First.</span>
                            </div>
                        </div>

                        <div>
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-ink-900">Select Your Primary Industry <span className="rounded-full bg-gold-100 px-2 py-0.5 text-xs text-gold-800">{industries.length} Industries</span></h2>
                            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {industries.map((i) => (
                                    <li key={i.slug}>
                                        <Link href={`/industries/${i.slug}`} className="group flex h-full items-start gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 transition-colors hover:border-gold-400">
                                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[0.6875rem] font-bold text-gold-400">{i.number}</span>
                                            <DynIcon name={i.icon} className="size-7 shrink-0 text-gold-700" />
                                            <span className="min-w-0">
                                                <span className="block text-sm font-semibold text-ink-900">{i.name}</span>
                                                <span className="mt-0.5 block text-xs text-ink-500">{i.blurb}</span>
                                                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-700">
                                                    {i.catalogueState === 'below_threshold' ? 'Honest overview' : 'Explore Solutions'} <ArrowRight className="size-3" />
                                                </span>
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <Link href="/industries/select" className="flex h-full items-center gap-3 rounded-[8px] border border-dashed border-gold-400 bg-gold-50 p-4 text-sm font-bold text-gold-800 uppercase"><Layers className="size-6" /> I operate in more than one industry</Link>
                                </li>
                                <li>
                                    <Link href="/contact?topic=industry-classification" className="flex h-full items-center gap-3 rounded-[8px] border border-dashed border-gold-400 bg-gold-50 p-4 text-sm font-bold text-gold-800 uppercase"><HelpCircle className="size-6" /> I'm not sure — help me decide</Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-[8px] border border-gold-700/50 bg-ink-950 p-5 text-parchment-100">
                            <h2 className="text-[0.9375rem] font-semibold text-gold-400">Your Selection</h2>
                            <dl className="mt-3 space-y-2 text-xs">
                                {[
                                    ['Industry', context.industryName ?? 'Not selected'], ['Sub-Industry', context.subIndustryName ?? 'Not selected'],
                                    ['Service Family', 'Not selected'], ['Complexity Class', context.industryName ? industries.find((i) => i.slug === context.industrySlug)?.complexityLabel : 'Not determined'],
                                    ['Permission State', context.industryName ? 'To be verified' : 'Not determined'],
                                ].map(([k, v]) => (
                                    <div key={k as string} className="flex justify-between gap-2"><dt className="text-ink-300">{k}</dt><dd className="text-right">{v}</dd></div>
                                ))}
                            </dl>
                            {context.industrySlug && (
                                <button type="button" onClick={() => router.delete('/industries/context')} className="mt-3 text-xs text-gold-400 underline">Clear selection</button>
                            )}
                        </div>
                        <NextSteps
                            items={['Select an Industry to see what TBCA can do and what it cannot do.', 'Understand required evidence, professional supports and controls.', 'View transparent pricing and mandatory sector add-ons.']}
                            cta={{ label: 'Explore All Opportunities', href: context.industrySlug ? `/industries/${context.industrySlug}` : '/industries/select' }}
                        />
                        <AdvisorCard />
                    </aside>
                </div>

                <div className="container-tbca pb-8">
                    <ul className="grid gap-3 rounded-[8px] border border-gold-300 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
                        {[
                            ['Industry Specialists', 'Deep expertise in your sector', Users], ['Proven Methodologies', 'Frameworks that deliver results', Sparkles],
                            ['Data-Driven Insights', 'Evidence-based recommendations', BarChart3], ['Global Best Practice', 'Local context. Global standards.', Globe],
                            ['Measurable Impact', 'Outcomes that matter', Target],
                        ].map(([t, s, I]) => {
                            const Icon = I as typeof Users;
                            return <li key={t as string} className="flex items-start gap-2"><Icon className="mt-0.5 size-5 text-gold-700" /><span><span className="block text-xs font-semibold text-ink-900">{t as string}</span><span className="text-[0.6875rem] text-ink-500">{s as string}</span></span></li>;
                        })}
                        <li className="flex flex-col gap-2">
                            <span className="text-xs text-ink-700"><strong>Need industry-specific guidance?</strong> Let's discuss your unique challenges.</span>
                            <Link href="/contact?topic=industries" className="rounded-[4px] bg-gold-500 px-3 py-1.5 text-center text-xs font-semibold text-ink-900">Talk to a Specialist →</Link>
                        </li>
                    </ul>
                </div>
            </div>
            <EmbeddedServices section={embedded} intro="Fixed-price sector intelligence services: sector profiles, regulatory and incentive frameworks, competitive landscapes, gap calculators and rankings." />
            <TrustStrip variant="industries" />
        </>
    );
}
