import { Link, router, usePage } from '@inertiajs/react';
import { Activity, AlertTriangle, ArrowRight, Bookmark, Calendar, CheckCircle2, ClipboardList, Clock, FileSearch, Gauge, Layers, Mail, Scale, ShieldCheck, Users, XCircle } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { AdvisorCard, ContextCard, IndustryFrame, NextSteps, StatusChips } from '@/Components/Insights/Industries';
import { Box, Chip, DarkKpis, DynIcon, Notice, SmallLink, zar } from '@/Components/Insights/Shared';
import type { SharedProps } from '@/types';
import type { IndustryContextValue, IndustryOption, IndustryPage } from '@/types/insights';

interface Props {
    industry: IndustryPage;
    context: IndustryContextValue;
    industries: IndustryOption[];
}

export default function IndustryShow({ industry: ind, context, industries }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const p = ind.profile;
    const below = ind.catalogueState === 'below_threshold';
    const thin = ind.catalogueState === 'thin';
    const regulated = ind.complexityClass === 'C3' || ind.regulatoryState === 'high';
    const regLabel = { low: 'Low', mixed: 'Mixed', high: 'High' }[ind.regulatoryState] ?? ind.regulatoryState;
    const catLabel = below ? 'Below Threshold' : thin ? 'Thin' : 'Deep';
    const diagnosticHref = `/industries/${ind.slug}/diagnostic`;

    const save = () => router.post('/saved', { item_type: 'industry', item_key: ind.slug, label: ind.name, url: `/industries/${ind.slug}` }, { preserveScroll: true });

    const sidebar = (
        <>
            <ContextCard
                title={below ? 'Your Industry Context' : 'Your Context'}
                context={context}
                industries={industries}
                redirect={`/industries/${ind.slug}`}
                rows={[
                    ['Industry Status', below ? 'Below Threshold' : 'Active'],
                    ['Classification', 'To be verified'],
                    ['Complexity Class', ind.complexityLabel],
                    ['Regulatory State', regLabel],
                    ['Human Gate', ind.professionalGate === 'mandatory' ? 'Mandatory' : 'Advisory'],
                    ['Visible Fees', 'T / P / X / S'],
                ]}
            />
            <NextSteps
                title={below ? 'Next Steps' : 'What Can TBCA Do Now?'}
                items={below ? ['Explore diagnostics for your project.', 'View sector intelligence in AIIM.', 'Speak to a TBCA Advisor.', 'Explore other industries.'] : p.can}
                cta={below ? { label: 'See All Industries', href: '/industries' } : { label: 'See Next Steps', href: diagnosticHref }}
            />
            <AdvisorCard title={below ? 'Need Guidance?' : 'Need Expert Advice?'} text={below ? 'Our Advisors help you find the right industry and service path.' : 'Book a discovery call with a TBCA Advisor.'} />
        </>
    );

    return (
        <IndustryFrame title={ind.name} crumbs={[{ label: 'Home', href: '/' }, { label: 'Industries', href: '/industries' }, { label: ind.name }]} sidebar={sidebar}>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                    {!below && <Chip tone="green">Active Industry</Chip>}
                    <h1 className="mt-2 font-serif text-3xl font-bold text-ink-900 sm:text-4xl">{ind.name}</h1>
                    <p className="mt-2 text-[0.9375rem] font-medium text-ink-800">{ind.tagline}</p>
                    <p className="mt-1 text-sm text-ink-600">{below ? 'You are viewing an honest, below-threshold overview.' : ind.intro}</p>
                </div>
                {auth.user && (
                    <button type="button" onClick={save} className="flex items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 py-1.5 text-xs font-semibold">
                        <Bookmark className="size-4" /> Save Industry
                    </button>
                )}
            </div>

            <div className="mt-4">
                <StatusChips
                    items={[
                        { label: 'Industry Mode', value: 'Active', icon: <Activity className="size-4" /> },
                        { label: 'Catalogue State', value: catLabel, icon: <Layers className="size-4" /> },
                        { label: 'Complexity Class', value: ind.complexityLabel, icon: <Gauge className="size-4" /> },
                        { label: 'Regulatory State', value: regLabel, icon: <Scale className="size-4" /> },
                        ...(!below ? [{ label: 'Professional Gate', value: ind.professionalGate === 'mandatory' ? 'Mandatory' : 'Advisory', icon: <ShieldCheck className="size-4" /> }] : []),
                    ]}
                />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
                {below ? (
                    <Link href="/industries" className="rounded-[4px] bg-gold-500 px-4 py-2.5 text-xs font-bold text-ink-900 uppercase">Explore Other Industries →</Link>
                ) : (
                    <a href="#services" className="rounded-[4px] bg-gold-500 px-4 py-2.5 text-xs font-bold text-ink-900 uppercase">{regulated ? 'View Approved Services' : thin ? 'View Available Services' : 'Explore Services for this Industry'} →</a>
                )}
                {below ? (
                    <Link href={`/industries/sector-intelligence/${ind.slug}`} className="rounded-[4px] border border-ink-300 bg-white px-4 py-2.5 text-xs font-bold text-ink-900 uppercase">View Sector Intelligence (AIIM) →</Link>
                ) : (
                    <Link href={diagnosticHref} className="rounded-[4px] bg-ink-900 px-4 py-2.5 text-xs font-bold text-parchment-100 uppercase">View Diagnostic for this Industry →</Link>
                )}
                <button type="button" onClick={() => openAskQuestion({ subject: `${ind.name} – speak to an advisor`, section: 'industries' })} className="flex items-center gap-2 rounded-[4px] border border-ink-300 bg-white px-4 py-2.5 text-xs font-bold text-ink-900 uppercase">
                    <Calendar className="size-4" /> Speak to TBCA Advisor
                </button>
            </div>

            {regulated && !below && (
                <Notice className="mt-4" tone="red" title="Professional gate required" action={<Link href={`/industries/${ind.slug}/partners`} className="rounded-[4px] border border-risk-500/50 bg-white px-3 py-1.5 text-xs font-semibold text-risk-700">View Professional Routes →</Link>}>
                    Most services in {ind.name} require regulated professionals and specialist review. Select your needs to confirm permission pathway.
                </Notice>
            )}

            {below ? (
                <>
                    <Notice className="mt-5" tone="amber" title="Below-Threshold Catalogue" action={<a href="#limits" className="rounded-[4px] border border-attested-500/50 bg-white px-3 py-1.5 text-xs font-semibold">Why this industry is limited →</a>}>
                        We currently have limited approved offerings in this industry. You can still access diagnostics and sector intelligence, or explore other industries with fuller service coverage.
                    </Notice>
                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                        {[
                            ['Approved Services', p.tiles?.approvedServices ?? ind.approvedServices, 'Limited coverage', ClipboardList],
                            ['Diagnostics Available', p.tiles?.diagnostics ?? p.diagnostics.length, 'Industry-aware', Activity],
                            ['AIIM Intelligence', 'Available', 'Sector-level', FileSearch],
                            ['Professional Routes', p.tiles?.professionalRoutes ?? 4, 'Partner categories', Users],
                            ['Typical Lead Time', p.tiles?.leadTime ?? 'Varies', 'Per engagement', Clock],
                            ['Evidence Requirement', p.tiles?.evidence ?? 'Moderate', 'Depends on service', ShieldCheck],
                        ].map(([l, v, c, I]) => {
                            const Icon = I as typeof Users;
                            return (
                                <div key={l as string} className="rounded-[8px] border border-parchment-400 bg-white p-3">
                                    <Icon className="size-5 text-gold-700" />
                                    <p className="mt-1 text-[0.6875rem] text-ink-500">{l as string}</p>
                                    <p className={v === 'Available' ? 'text-lg font-bold text-verified-700' : 'text-lg font-bold text-ink-900'}>{v as string}</p>
                                    <p className="text-[0.6875rem] text-ink-400">{c as string}</p>
                                </div>
                            );
                        })}
                    </div>
                    <div id="limits" className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
                        <Box title="What We Can Currently Do">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {[
                                    ['Industry Diagnostics', 'Assess readiness, strengths, opportunities and gaps.', diagnosticHref],
                                    ['Sector Intelligence (AIIM)', 'Access high-level trends, benchmarks and insights.', `/industries/sector-intelligence/${ind.slug}`],
                                    ['Partner Introduction', 'Connect with qualified partners in this industry.', `/industries/${ind.slug}/partners`],
                                    ['Project Exploration', 'Explore indicative projects and opportunities.', '/aiim'],
                                ].map(([t, s, href]) => (
                                    <Link key={t} href={href} className="rounded-[8px] border border-parchment-400 p-3 hover:border-gold-400">
                                        <p className="text-sm font-semibold text-ink-900">{t}</p>
                                        <p className="mt-1 text-xs text-ink-500">{s}</p>
                                        <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-verified-700"><CheckCircle2 className="size-3.5" /> Available</p>
                                    </Link>
                                ))}
                            </div>
                        </Box>
                        <Box tone="amber" title="What We Cannot Do Yet">
                            <ul className="space-y-1.5 text-xs text-ink-700">
                                {p.cannot.map((c) => <li key={c} className="flex gap-2"><XCircle className="size-4 shrink-0 text-risk-500" />{c}</li>)}
                            </ul>
                            <Link href="/contact?topic=industries" className="mt-3 block rounded-[4px] border border-attested-500/50 bg-white px-3 py-1.5 text-center text-xs font-semibold">See Next Steps →</Link>
                        </Box>
                    </div>
                    <Notice
                        className="mt-4"
                        tone="blue"
                        action={
                            <button type="button" onClick={() => router.post('/forms/industry-update-request', { section: 'industries', subject: `Industry update: ${ind.name}`, industry: ind.slug, redirect: `/industries/${ind.slug}` }, { preserveScroll: true })} className="flex items-center gap-1.5 rounded-[4px] border border-controlled-500/40 bg-white px-3 py-1.5 text-xs font-semibold">
                                <Mail className="size-4" /> Request Industry Update
                            </button>
                        }
                    >
                        More services are being added as our catalogue matures. Request updates or speak to a TBCA Advisor about your specific needs.
                    </Notice>
                </>
            ) : (
                <>
                    <div className="mt-5">
                        <DarkKpis
                            items={[
                                { label: 'Opportunity Score', value: <>{p.kpis.opportunity}<span className="text-xs text-ink-300"> /100</span></>, caption: p.kpis.opportunityLabel, icon: 'leaf', accent: true },
                                { label: 'Active Projects (ZA)', value: p.kpis.projects, caption: 'Fundable', icon: 'package' },
                                { label: 'Investor Mandates', value: p.kpis.mandates, caption: 'Active', icon: 'users' },
                                { label: 'Funding Institutions', value: p.kpis.institutions, caption: 'Lenders / Funds', icon: 'landmark' },
                                { label: 'Data Freshness', value: <span className="text-sm text-verified-500">{p.kpis.freshness}</span>, caption: `Next update: ${p.kpis.nextUpdate}` },
                                { label: 'Confidence Level', value: p.kpis.confidence, caption: 'Source-verified', icon: 'shield-check' },
                            ]}
                        />
                    </div>

                    <div id="services" className="mt-5 grid gap-4 xl:grid-cols-[1.3fr_1fr_1fr]">
                        <Box title={regulated ? 'Approved Service Families' : thin ? 'Available Services' : 'Priority Service Areas'}>
                            <div className={regulated || thin ? 'space-y-2' : 'grid gap-3 sm:grid-cols-2'}>
                                {p.services.map((s) => (
                                    <div key={s.title} className="flex items-start gap-3 rounded-[6px] border border-parchment-300 p-2.5">
                                        <DynIcon name={s.icon} className="size-5 shrink-0 text-gold-700" />
                                        <div className="flex-1">
                                            <p className="text-[0.8125rem] font-semibold text-ink-900">{s.title}</p>
                                            <p className="text-xs text-ink-500">{s.text}</p>
                                        </div>
                                        {s.regulated && <Chip tone="red">Regulated</Chip>}
                                    </div>
                                ))}
                            </div>
                            <a href={ind.sprintsUrl} className="mt-3 block rounded-[4px] border border-ink-300 py-2 text-center text-xs font-bold uppercase">View all services for {ind.name} →</a>
                        </Box>
                        <Box title="Relevant Diagnostics" action={<SmallLink href={diagnosticHref}>View All</SmallLink>}>
                            <ul className="space-y-2">
                                {p.diagnostics.map((d) => (
                                    <li key={d.title} className="flex items-start justify-between gap-2 border-b border-parchment-300 pb-2 last:border-0">
                                        <span>
                                            <Link href={diagnosticHref} className="text-[0.8125rem] font-semibold text-ink-900 hover:text-gold-700">{d.title}</Link>
                                            <span className="block text-xs text-ink-500">{d.text}</span>
                                        </span>
                                        <span className="text-right text-[0.6875rem] whitespace-nowrap text-ink-500">{d.minutes} mins{d.popular && <span className="block font-semibold text-gold-700">Most Popular</span>}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link href={diagnosticHref} className="mt-3 block rounded-[4px] border border-ink-300 py-2 text-center text-xs font-bold uppercase">Start a Diagnostic →</Link>
                        </Box>
                        <Box title="AIIM Sector Intelligence" action={<SmallLink href={`/industries/sector-intelligence/${ind.slug}`}>View All</SmallLink>}>
                            <div className="flex h-28 items-end rounded-[6px] bg-gradient-to-br from-ink-800 via-ink-900 to-gold-800 p-3">
                                <DynIcon name={ind.icon} className="size-10 text-gold-400" />
                            </div>
                            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink-900">{p.brief.title} <Chip tone="gold">Premium</Chip></p>
                            <p className="text-xs text-ink-500">{p.brief.regions}</p>
                            <p className="text-xs text-ink-500">{p.brief.updated} | {p.brief.pages} pages</p>
                            <p className="mt-1 text-xs text-ink-600">{p.brief.summary}</p>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-lg font-bold">{zar(p.brief.price)}</span>
                                <Link href={`/industries/sector-intelligence/${ind.slug}`} className="rounded-[4px] border border-ink-300 px-3 py-1.5 text-xs font-bold uppercase">View Brief →</Link>
                            </div>
                        </Box>
                    </div>

                    <Box className="mt-4" title="Key Opportunities in This Industry" action={<SmallLink href={`/industries/${ind.slug}/country/south-africa`}>View All Opportunities</SmallLink>}>
                        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                            {p.opportunities.map((o) => (
                                <li key={o.title} className="rounded-[6px] border border-parchment-300 p-2.5">
                                    <p className="text-[0.8125rem] font-semibold text-ink-900">{o.title}</p>
                                    <p className="text-xs text-ink-500">{o.text}</p>
                                </li>
                            ))}
                        </ul>
                    </Box>

                    {(ind.skus.length > 0 || ind.sprints.length > 0) && (
                        <Box className="mt-4" title="Recommended Sprints & Services" action={<SmallLink href={ind.sprintsUrl}>Browse matching Sprints</SmallLink>}>
                            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {ind.skus.map((s) => (
                                    <li key={s.slug} className="rounded-[6px] border border-gold-300 bg-gold-50/40 p-3">
                                        <Chip tone={s.saleState === 'sellable' ? 'gold' : 'red'}>{s.saleState === 'sellable' ? 'Industry Service' : 'Not available'}</Chip>
                                        <p className="mt-1 text-sm font-semibold text-ink-900">{s.title}</p>
                                        <p className="text-xs text-ink-500">{s.summary}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-sm font-bold">{s.priceZar ? `From ${zar(s.priceZar)}` : 'Professional route'}</span>
                                            <Link href={`/industries/${ind.slug}/services/${s.slug}`} className="text-xs font-semibold text-gold-700">View <ArrowRight className="inline size-3" /></Link>
                                        </div>
                                    </li>
                                ))}
                                {ind.sprints.map((s) => (
                                    <li key={s.slug} className="rounded-[6px] border border-parchment-300 p-3">
                                        <Chip>Sprint</Chip>
                                        <p className="mt-1 text-sm font-semibold text-ink-900">{s.title}</p>
                                        <p className="line-clamp-2 text-xs text-ink-500">{s.summary}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-sm font-bold">{s.priceZar ? `From ${zar(s.priceZar)}` : 'On request'}</span>
                                            <Link href={`/sprints/${s.slug}`} className="text-xs font-semibold text-gold-700">View Sprint <ArrowRight className="inline size-3" /></Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Box>
                    )}

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <Box title="Regulatory notes">
                            <p className="text-xs text-ink-600">Complexity class {ind.complexityLabel}. {ind.professionalGate === 'mandatory' ? 'A professional gate applies: regulated outputs are delivered only through verified partner routes.' : 'Advisory gate: TBCA delivers directly, with specialist referral where required.'} Mandatory sector add-ons are always shown before you commit.</p>
                            <div className="mt-2 flex flex-wrap gap-3">
                                <SmallLink href={`/industries/${ind.slug}/country/south-africa`}>South Africa regulatory snapshot</SmallLink>
                                <SmallLink href={`/industries/${ind.slug}/benchmarks`}>Benchmark preview</SmallLink>
                            </div>
                        </Box>
                        {p.caseStudy ? (
                            <Box title="Case study">
                                <p className="text-sm font-semibold text-ink-900">{p.caseStudy.title}</p>
                                <p className="mt-1 text-xs text-ink-600">{p.caseStudy.text}</p>
                                <SmallLink className="mt-2" href="/resources/case-studies/growth-turnaround-manufacturing-sector">More case studies</SmallLink>
                            </Box>
                        ) : (
                            <Box title="Partners in this sector">
                                <p className="text-xs text-ink-600">Find verified professional-route partners operating within the four-ledger model.</p>
                                <SmallLink className="mt-2" href={`/industries/${ind.slug}/partners`}>Partner directory</SmallLink>
                            </Box>
                        )}
                    </div>

                    {thin && <Notice className="mt-4" tone="blue">This industry currently has a thin catalogue. More diagnostics and services are being added.</Notice>}
                    {regulated && (
                        <p className="mt-4 flex items-center gap-2 rounded-[6px] border border-risk-500/30 bg-risk-50 p-3 text-xs text-risk-700">
                            <AlertTriangle className="size-4" /> Engagements require regulated professionals. Permission and evidence checks are mandatory.
                        </p>
                    )}
                </>
            )}
        </IndustryFrame>
    );
}
