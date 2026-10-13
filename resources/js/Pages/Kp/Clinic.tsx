import { Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { BtnLink, Ico, btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, H2, InsightCard, KpPage, type KpCard, type KpShared, type KpTheme } from '@/Components/Kp/kit';

interface Props extends KpShared {
    q: string;
    hubs: KpTheme[];
    explainers: KpCard[];
    diagnostics: [string, string, string][];
    tools: [string, string][];
}

const STARTS: [string, string, string, string][] = [
    ['target', 'Start with a Problem', 'Find solutions to common business challenges.', `${BASE}/search`],
    ['layers', 'Explore Topics', 'Browse by business function or theme.', `${BASE}/topics`],
    ['wrench', 'Use a Tool', 'Scorecards, calculators and checklists.', `${BASE}/tools/scorecards/capital-readiness`],
    ['clipboard-check', 'Run a Diagnostic', 'Test your business readiness.', `${BASE}/diagnostic-questions`],
    ['lightbulb', 'Get Clarity', 'Understand complex business concepts.', `${BASE}/explain`],
];

/** KP-SCR-008 African Business Clinic: explain, diagnose, decide, act. */
export default function Clinic({ screen, kpNav, q, hubs, explainers, diagnostics, tools }: Props) {
    const [query, setQuery] = useState(q);
    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={[['African Business Clinic']]}
            head="African Business Clinic"
            title={<span>African Business Clinic<br /><span className="text-gold-600">Explain. Diagnose. Decide. Act.</span></span>}
            intro="Plain-language explainers, practical diagnostics and decision tools that help African businesses solve real problems and build better."
            rail={
                <>
                    <Box title="Run a Quick Diagnostic" icon="clipboard-check">
                        <p className="-mt-2 mb-2 text-[0.75rem] text-ink-500">Answer a few questions. Get clarity.</p>
                        <ul className="divide-y divide-parchment-300">
                            {diagnostics.map(([t, s, h]) => (
                                <li key={t}><Link href={h} className="flex items-center gap-2 py-2 hover:text-gold-700"><L.ClipboardCheck className="size-4 text-gold-600" aria-hidden="true" /><span className="flex-1"><span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span><span className="block text-[0.6875rem] text-ink-500">{s}</span></span><L.ChevronRight className="size-4" /></Link></li>
                            ))}
                        </ul>
                        <BtnLink href={`${BASE}/diagnostic-questions`} className="mt-3 w-full" icon="arrow-right">View All Diagnostics</BtnLink>
                    </Box>
                    <Box title="Popular Tools" icon="wrench">
                        <ul className="space-y-1.5">{tools.map(([t, h]) => <li key={t}><Link href={h} className="flex items-center gap-2 text-[0.8125rem] hover:text-gold-700"><L.Wrench className="size-4 text-gold-600" aria-hidden="true" />{t}</Link></li>)}</ul>
                    </Box>
                    <Box title="Need Expert Guidance?" icon="users" tone="cream">
                        <p className="text-[0.8125rem]">Work with TBCA advisers to get personalised support for your business challenges.</p>
                        <BtnLink href={`${BASE}/book`} tone="outline" className="mt-3 w-full">Book an Advisory Session</BtnLink>
                    </Box>
                </>
            }
        >
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem]">
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); router.get(`${BASE}/search`, { q: query }); }}>
                    <label htmlFor="cq" className="sr-only">Search the clinic</label>
                    <input id="cq" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics, problems, explainers, tools..." className="h-11 min-w-0 flex-1 rounded-[6px] border border-parchment-500 bg-white px-3 text-[0.875rem]" />
                    <button type="submit" className={btnClass('gold', 'lg')}>Search</button>
                </form>
                <div className="rounded-[10px] border border-gold-300 bg-white p-3 text-[0.8125rem]">
                    <p className="font-bold text-gold-700">Built for African reality.</p>
                    <p className="text-ink-600">Country-aware. Context-rich. Practical. Actionable. Always evidence-linked.</p>
                </div>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {STARTS.map(([i, t, b, h]) => (
                    <li key={t}><Link href={h} className="flex h-full gap-2.5 rounded-[10px] border border-parchment-400 bg-white p-3 hover:border-gold-500"><Ico name={i} className="mt-0.5 size-5 shrink-0 text-gold-600" /><span><span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span><span className="block text-[0.6875rem] text-ink-500">{b}</span></span></Link></li>
                ))}
            </ul>

            <section>
                <H2 more={['View all topics', `${BASE}/topics`]}>Explore Topic Hubs</H2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {hubs.map((t) => (
                        <li key={t.slug}>
                            <Link href={t.href} className="flex h-full flex-col rounded-[10px] border border-parchment-400 bg-white p-4 hover:border-gold-500">
                                <Ico name={t.icon} className="size-7 text-gold-600" />
                                <span className="mt-2 font-serif font-bold text-ink-900">{t.label}</span>
                                <span className="mt-1 flex-1 text-[0.75rem] text-ink-600">{t.blurb}</span>
                                <span className="mt-2 text-[0.6875rem] text-ink-500">{t.articles} insights | {t.tools} resources</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <H2 more={['All insights', `${BASE}/insights?types[]=explainer`]}>Featured Explainers</H2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{explainers.map((e) => <InsightCard key={e.slug} item={e} />)}</div>
            </section>

            <p className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-gold-200 bg-gold-50 px-4 py-3 text-[0.8125rem] text-ink-700">
                <span className="flex items-center gap-2"><L.ShieldCheck className="size-5 text-gold-700" aria-hidden="true" /><span><strong className="text-ink-900">Evidence-led. Africa-focused. Action-oriented.</strong> All content is evidence-linked and reviewed for African businesses and projects.</span></span>
                <Link href={`${BASE}/standards/evidence-popover`} className="font-semibold text-gold-700">Our Editorial Standards</Link>
            </p>
        </KpPage>
    );
}
