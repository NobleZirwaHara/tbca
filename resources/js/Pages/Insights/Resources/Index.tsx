import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, BookOpen, Bot, Briefcase, CheckCircle2, ClipboardList, Clock, Compass, Download, Eye, FileText, GraduationCap, Lightbulb, Lock, Megaphone, PlayCircle, Settings, Shield, ShieldCheck, Sparkles, Target, TrendingUp, Users, Wallet, Zap } from 'lucide-react';
import { CurrentnessChip, NeedSomething, TrustStrip, label } from '@/Components/Insights/Shared';
import { PriceLine, ResourceCard } from '@/Components/Insights/Resources';
import type { ResourceCard as RC } from '@/types/insights';

interface Props {
    categories: { key: string; label: string; count: number }[];
    featured: RC[];
    guides: RC[];
    tools: RC[];
    popular: RC[];
    overview: { guides: number; templates: number; caseStudies: number; compliance: number; webinars: number; reports: number };
}

const CAT_META: Record<string, [typeof Target, string]> = {
    'strategy-planning': [Target, 'Business strategy, planning frameworks, growth models and execution guides'],
    'finance-funding': [Wallet, 'Financial models, funding guides, investor decks and capital raising resources'],
    'operations-process': [Settings, 'Process maps, SOPs, KPIs, operational excellence and automation resources'],
    'project-management': [ClipboardList, 'PM toolkits, methodologies, Gantt templates and project control guides'],
    'risk-compliance': [Shield, 'Risk frameworks, policies, compliance checklists and governance resources'],
    'marketing-sales': [Megaphone, 'Marketing playbooks, sales kits, branding guides and customer acquisition'],
    'people-leadership': [Users, 'Leadership development, HR policies, talent tools and culture frameworks'],
    'learning-development': [GraduationCap, 'Courses, eBooks, skill assessments and learning pathways'],
};

export default function ResourcesIndex({ categories, featured, guides, tools, popular, overview }: Props) {
    const sub = useForm({ email: '' });
    const cats = categories.filter((c) => CAT_META[c.key]);

    return (
        <>
            <Head title="Resources" />
            <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_75%_40%,rgba(214,163,46,0.22),transparent_70%)]" aria-hidden="true" />
                <div className="container-tbca relative grid gap-8 py-10 lg:grid-cols-[1fr_320px] lg:py-14">
                    <div>
                        <p className="font-serif text-xl font-semibold tracking-wide text-gold-400">RESOURCES</p>
                        <h1 className="mt-1 font-serif text-3xl leading-tight font-semibold sm:text-[2.6rem]">Resources That Help You Decide.<span className="block text-gold-400">Knowledge That Creates Value.</span></h1>
                        <p className="mt-3 text-lg text-parchment-200">Useful knowledge. Clear sources. Controlled currentness.</p>
                        <p className="mt-2 max-w-xl text-ink-200">Practical guides, templates, tools and insights designed to help you understand issues, build confidence and take the next right step. Curated by experts. Built for impact.</p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/resources/library" className="inline-flex items-center gap-2 rounded-[4px] bg-gold-500 px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-gold-400"><BookOpen className="size-4" /> Browse Resources <ArrowRight className="size-4" /></Link>
                            <Link href="/resources/free-diagnostic" className="inline-flex items-center gap-2 rounded-[4px] border border-ink-600 px-5 py-3 text-sm hover:border-gold-500"><Compass className="size-4" /> Start Free Diagnostic</Link>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="rounded-[8px] border border-gold-700/60 bg-ink-900/80 p-5">
                            <h2 className="font-semibold text-gold-400">Resource Library Overview</h2>
                            <ul className="mt-3 space-y-2 text-sm">
                                {[[overview.guides, 'Guides & Toolkits'], [overview.templates, 'Templates & Frameworks'], [overview.caseStudies, 'Case Studies'], [overview.compliance, 'Policy & Compliance Docs'], [overview.webinars, 'Expert Webinars & Replays'], [overview.reports, 'Research & Market Reports']].map(([n, l]) => (
                                    <li key={l as string} className="flex items-center gap-2"><FileText className="size-4 text-gold-400" /><strong>{n}</strong> {l}</li>
                                ))}
                                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-gold-400" /> Always Updated</li>
                            </ul>
                        </div>
                        <div className="rounded-[8px] border border-gold-700/60 bg-ink-900/80 p-5">
                            <h2 className="font-semibold text-gold-400">Why our resources are trusted</h2>
                            <ul className="mt-3 space-y-2 text-xs">
                                {[[FileText, 'Source shown', 'Always citeable and transparent'], [BadgeCheck, 'Reviewed by experts', 'Human review where required'], [Clock, 'Currentness monitored', 'Regular reviews and updates'], [Eye, 'Access states visible', 'Current, Review Due, Overdue or Restricted'], [Bot, 'AI-assisted, human-approved', 'AI drafting with human oversight']].map(([I, t, s]) => {
                                    const Icon = I as typeof Clock;
                                    return <li key={t as string} className="flex gap-2"><Icon className="size-4 shrink-0 text-gold-400" /><span><strong className="block text-parchment-100">{t as string}</strong><span className="text-ink-300">{s as string}</span></span></li>;
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="container-tbca relative pb-8">
                    <ul className="grid gap-3 rounded-[8px] border border-gold-700/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[[ShieldCheck, 'Content Status', 'Current content prioritised'], [Clock, 'Review Discipline', 'Scheduled reviews and updates'], [Eye, 'Source Transparency', 'Source, dates and version shown'], [Lock, 'Access Clarity', 'Free, reduced or paid clearly shown']].map(([I, t, s]) => {
                            const Icon = I as typeof Clock;
                            return <li key={t as string} className="flex items-center gap-3"><Icon className="size-6 text-gold-400" /><span><strong className="block text-sm">{t as string}</strong><span className="text-xs text-ink-300">{s as string}</span></span></li>;
                        })}
                    </ul>
                </div>
            </section>

            <div className="bg-parchment-100">
                <div className="container-tbca space-y-6 py-8">
                    <div className="grid gap-5 xl:grid-cols-[1.1fr_1.5fr_1fr]">
                        <section className="rounded-[8px] border border-gold-200 bg-white p-4">
                            <div className="flex items-center justify-between"><h2 className="font-serif text-lg font-semibold">Explore by Category</h2><Link href="/resources/library" className="text-xs font-semibold text-gold-700">View all categories →</Link></div>
                            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {cats.map((c) => {
                                    const [Icon, text] = CAT_META[c.key];
                                    return (
                                        <li key={c.key}>
                                            <Link href={`/resources/library?category[]=${c.key}`} className="flex h-full items-start gap-2 rounded-[6px] border border-parchment-300 p-2.5 hover:border-gold-400">
                                                <Icon className="size-5 shrink-0 text-gold-700" />
                                                <span><strong className="block text-xs">{c.label}</strong><span className="line-clamp-2 text-[0.6875rem] text-ink-500">{text}</span><span className="text-[0.6875rem] font-semibold text-gold-700">{c.count} resources →</span></span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                        <section className="rounded-[8px] border border-gold-200 bg-white p-4">
                            <div className="flex items-center justify-between"><h2 className="font-serif text-lg font-semibold">Featured Resources</h2><Link href="/resources/library?sort=popular" className="text-xs font-semibold text-gold-700">View all featured →</Link></div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">{featured.slice(0, 4).map((r) => <ResourceCard key={r.id} r={r} compact />)}</div>
                        </section>
                        <div className="space-y-4">
                            <section className="rounded-[8px] border border-gold-200 bg-white p-4">
                                <div className="flex items-center justify-between"><h2 className="font-serif text-lg font-semibold">Guides & Reports</h2><Link href="/resources/guides-reports" className="text-xs font-semibold text-gold-700">View all →</Link></div>
                                <ul className="mt-2 space-y-2">{guides.map((r) => <li key={r.id} className="flex items-center justify-between gap-2 border-b border-parchment-200 pb-2 last:border-0"><span><Link href={r.url} className="text-xs font-semibold hover:text-gold-700">{r.title}</Link><span className="block text-[0.6875rem] text-ink-500 line-clamp-1">{r.summary}</span></span><CurrentnessChip value={r.currentness} /></li>)}</ul>
                            </section>
                            <section className="rounded-[8px] border border-gold-200 bg-white p-4">
                                <div className="flex items-center justify-between"><h2 className="font-serif text-lg font-semibold">Templates & Tools</h2><Link href="/resources/templates-tools" className="text-xs font-semibold text-gold-700">View all →</Link></div>
                                <ul className="mt-2 space-y-2">{tools.map((r) => <li key={r.id} className="flex items-center justify-between gap-2 border-b border-parchment-200 pb-2 last:border-0"><span><Link href={r.url} className="text-xs font-semibold hover:text-gold-700">{r.title}</Link><span className="block text-[0.6875rem] text-ink-500 line-clamp-1">{r.summary}</span></span><PriceLine r={r} /></li>)}</ul>
                            </section>
                        </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
                        <section className="rounded-[8px] border border-gold-200 bg-white p-4">
                            <h2 className="font-serif text-lg font-semibold">Popular Downloads</h2>
                            <ul className="mt-2 divide-y divide-parchment-200">
                                {popular.map((r) => (
                                    <li key={r.id} className="flex items-center gap-3 py-2 text-sm">
                                        <FileText className="size-4 text-ink-500" />
                                        <Link href={r.url} className="flex-1 hover:text-gold-700">{r.title}</Link>
                                        <span className="text-xs text-ink-500">{r.format}</span>
                                        <span className="w-16 text-right text-xs text-ink-500">{r.fileSize}</span>
                                        <span className="w-20 text-right text-[0.6875rem] text-ink-400">{r.downloads.toLocaleString()} dl</span>
                                        <a href={`/resources/${r.slug}/download`} aria-label={`Download ${r.title}`} className="text-gold-700"><Download className="size-4" /></a>
                                    </li>
                                ))}
                            </ul>
                        </section>
                        <NeedSomething items={['Custom Research', 'Tailored Frameworks', 'Industry-Specific Reports', 'Private Data & Insights']} />
                    </div>

                    <section className="grid gap-4 rounded-[8px] border border-gold-200 bg-white p-4 lg:grid-cols-[1fr_320px]">
                        <div>
                            <div className="flex items-center justify-between"><h2 className="font-serif text-lg font-semibold">How TBCA Decides What Is Free</h2><Link href="/resources/free-vs-paid" className="text-xs font-semibold text-gold-700">Learn more →</Link></div>
                            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {[[Lightbulb, 'Educate & Explain', 'Resources that help you understand issues and make better decisions.'], [Zap, 'Not Execution', 'We do not give away complete working output, or protected frameworks.'], [Sparkles, 'Quality First', 'We keep content accurate, up to date and expert-reviewed.'], [TrendingUp, 'Right Next Step', 'Free content points you to the right diagnostic or engagement when needed.']].map(([I, t, s]) => {
                                    const Icon = I as typeof Zap;
                                    return <li key={t as string} className="flex gap-2"><Icon className="size-5 shrink-0 text-gold-700" /><span><strong className="block text-xs">{t as string}</strong><span className="text-[0.6875rem] text-ink-500">{s as string}</span></span></li>;
                                })}
                            </ul>
                        </div>
                        <form className="rounded-[8px] bg-ink-950 p-4 text-parchment-100" onSubmit={(e) => { e.preventDefault(); sub.post('/resources/subscribe', { preserveScroll: true, onSuccess: () => sub.reset() }); }}>
                            <h3 className="font-semibold text-gold-400">Stay Informed</h3>
                            <p className="text-xs text-ink-300">New guides, tools and webinars — consent-based, unsubscribe any time.</p>
                            <label className="mt-2 block text-xs" htmlFor="sub-email">Email address</label>
                            <input id="sub-email" type="email" required value={sub.data.email} onChange={(e) => sub.setData('email', e.target.value)} placeholder="you@company.co.za" className="mt-1 h-9 w-full rounded border border-ink-600 bg-ink-900 px-2 text-sm text-parchment-100" />
                            {sub.errors.email && <p role="alert" className="mt-1 text-xs text-risk-500">{sub.errors.email}</p>}
                            <button type="submit" disabled={sub.processing} className="mt-2 w-full rounded bg-gold-500 py-2 text-xs font-bold text-ink-900">Subscribe Now</button>
                            <div className="mt-3 flex flex-wrap gap-2 text-[0.6875rem]"><Link href="/resources/webinars" className="flex items-center gap-1 text-gold-300"><PlayCircle className="size-3.5" /> Webinars</Link><Link href="/resources/insights" className="flex items-center gap-1 text-gold-300"><Briefcase className="size-3.5" /> KP Insights</Link><Link href="/resources/faq" className="text-gold-300">FAQ</Link></div>
                        </form>
                    </section>
                    <p className="text-center text-xs text-ink-500">{label('library')}: <Link href="/resources/library" className="text-gold-700">{categories.reduce((a, c) => a + c.count, 0)} published resources</Link> · <Link href="/resources/content-status" className="text-gold-700">Content status</Link> · <Link href="/resources/value-exchange" className="text-gold-700">Value exchange</Link></p>
                </div>
            </div>
            <TrustStrip variant="resources" />
        </>
    );
}
