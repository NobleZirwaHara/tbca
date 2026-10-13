import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { BtnLink, Ico } from '@/Components/Webinars/kit';
import { BASE, Box, H2, InsightRow, KpMonogram, KpPage, type KpCard, type KpShared } from '@/Components/Kp/kit';

interface Props extends KpShared {
    pillars: [string, string, string, string, string][];
    latest: KpCard[];
    rules: string[];
    tools: [string, string][];
}

const TRAITS: [string, string, string][] = [
    ['file-check', 'Evidence-Led', 'Every claim is source-linked and review-governed.'],
    ['globe', 'Africa-Focused', 'Pan-African perspective with country-aware detail.'],
    ['zap', 'Action-Oriented', 'From insight to practical decision support.'],
    ['shield-check', 'Independently Reviewed', 'Editorial independence and quality assurance.'],
];

/** KP-SCR-003 Authority Landing. */
export default function Authority({ screen, kpNav, pillars, latest, rules, tools }: Props) {
    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={[['Authority Landing']]}
            head="Authority Landing"
            title={<span>Strategic Thinking. African Context. <span className="text-gold-600">Practical Impact.</span></span>}
            intro="Verified insights, original frameworks and field-tested guidance to help you make better decisions, build stronger businesses and create sustainable impact across Africa."
            actions={
                <>
                    <BtnLink href={`${BASE}/insights`} icon="arrow-right">Explore Insights</BtnLink>
                    <BtnLink href={`${BASE}/ask`} tone="outline" icon="bot">Ask the KP Knowledge Assistant</BtnLink>
                </>
            }
            rail={
                <>
                    <Box title="Authority & Integrity First" icon="shield-check" tone="cream">
                        <ul className="space-y-2">
                            {rules.map((r) => (
                                <li key={r} className="flex items-start gap-2 text-[0.8125rem]"><L.CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden="true" />{r}</li>
                            ))}
                        </ul>
                        <Link href={`${BASE}/standards/voice-badge`} className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700">Our Editorial Standards <L.ArrowRight className="size-3.5" /></Link>
                    </Box>
                    <Box title="Latest Insights" action={<Link href={`${BASE}/insights`} className="text-[0.75rem] font-semibold text-gold-700">View all</Link>}>
                        <ul className="divide-y divide-parchment-300">{latest.map((i) => <InsightRow key={i.slug} item={i} />)}</ul>
                    </Box>
                </>
            }
        >
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_16rem]">
                <ul className="grid gap-3 sm:grid-cols-2">
                    {TRAITS.map(([i, t, b]) => (
                        <li key={t} className="flex gap-2.5 rounded-[10px] border border-parchment-400 bg-white p-3">
                            <Ico name={i} className="mt-0.5 size-5 shrink-0 text-gold-600" />
                            <span>
                                <span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span>
                                <span className="block text-[0.75rem] text-ink-500">{b}</span>
                            </span>
                        </li>
                    ))}
                </ul>
                <div className="flex items-center justify-center rounded-[12px] border border-gold-200 bg-white p-4"><KpMonogram /></div>
            </div>

            <section>
                <H2>Explore Our Core Pillars</H2>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {pillars.map(([t, b, i, cta, href]) => (
                        <li key={t} className="flex flex-col rounded-[10px] border border-parchment-400 bg-white p-4">
                            <Ico name={i} className="size-8 text-gold-600" />
                            <h3 className="mt-3 font-serif text-[1.0625rem] font-bold text-ink-900">{t}</h3>
                            <p className="mt-1 flex-1 text-[0.8125rem] text-ink-600">{b}</p>
                            <Link href={href} className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700">{cta} <L.ArrowRight className="size-3.5" /></Link>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="grid gap-3 lg:grid-cols-[14rem_minmax(0,1fr)_16rem]">
                <div className="rounded-[10px] border border-gold-200 bg-gold-50 p-4">
                    <L.Wrench className="size-6 text-gold-700" aria-hidden="true" />
                    <p className="mt-2 font-serif font-bold text-ink-900">Popular Tools</p>
                    <p className="text-[0.75rem] text-ink-600">Scorecards, calculators and checklists to support better decisions.</p>
                    <Link href={`${BASE}/african-business-clinic`} className="mt-2 inline-block text-[0.75rem] font-semibold text-gold-700">Open Tool Library</Link>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                    {tools.map(([t, h]) => (
                        <li key={t}>
                            <Link href={h} className="flex h-full items-center gap-2.5 rounded-[10px] border border-parchment-400 bg-white p-3 text-[0.8125rem] font-semibold text-ink-900 hover:border-gold-500">
                                <L.ClipboardCheck className="size-5 text-gold-600" aria-hidden="true" /> {t}
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="rounded-[10px] border border-parchment-400 bg-white p-4">
                    <L.Compass className="size-6 text-gold-700" aria-hidden="true" />
                    <p className="mt-2 font-serif font-bold text-ink-900">Not sure where to start?</p>
                    <p className="text-[0.75rem] text-ink-600">Take a quick diagnostic to get recommendations for your business.</p>
                    <Link href={`${BASE}/diagnostic-questions`} className="mt-2 inline-block text-[0.75rem] font-semibold text-gold-700">Take Diagnostic</Link>
                </div>
            </section>
        </KpPage>
    );
}
