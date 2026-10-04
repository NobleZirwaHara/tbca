import { Link, usePage } from '@inertiajs/react';
import { BarChart3, CheckCircle2, Info, Lock, ShieldCheck } from 'lucide-react';
import { AdvisorCard, ContextCard, IndustryFrame, NextSteps, StatusChips } from '@/Components/Insights/Industries';
import { Box, Chip, DynIcon, Notice } from '@/Components/Insights/Shared';
import type { SharedProps } from '@/types';
import type { IndustryContextValue, IndustryPage } from '@/types/insights';

interface Props {
    industry: IndustryPage;
    context: IndustryContextValue;
    benchmark: null | {
        name: string; status: string; releaseState: string; level: string; minN: number; minK: number; minDiversity: number; nCurrent: number; kCurrent: number; diversityCurrent: number;
        suppressionRule: string | null; lastReview: string | null; nextReview: string | null;
        bands: { metric: string; low: string; high: string; value?: string; icon?: string }[];
    };
    unlocked: boolean;
    consented: boolean;
    engagement: string | null;
}

export default function IndustryBenchmarks({ industry: ind, context, benchmark: b, unlocked, consented, engagement }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const consentHref = engagement ? `/industries/workspace/${engagement}/benchmark-contribution` : auth.user ? '/industries/workspace' : '/login';
    const released = b?.status === 'eligible';

    return (
        <IndustryFrame
            title={`${ind.name} Benchmark`}
            crumbs={[{ label: 'Home', href: '/' }, { label: 'Industries', href: '/industries' }, { label: ind.name, href: `/industries/${ind.slug}` }, { label: 'Benchmarks' }]}
            sidebar={
                <>
                    <ContextCard title="Your Industry Context" context={context} rows={[['Complexity Class', ind.complexityLabel], ['Visible Fees', 'T / P / X / S']]} />
                    <NextSteps items={['Run a sector-adapted diagnostic.', 'View sector intelligence in AIIM.', 'Check available advisory services.', 'Speak to a TBCA Advisor.']} cta={{ label: 'View Next Steps', href: `/industries/${ind.slug}/diagnostic` }} />
                    <AdvisorCard title="Need Expert Guidance?" text="Speak to a TBCA Advisor for tailored industry and benchmark guidance." />
                </>
            }
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl">
                    <h1 className="flex items-center gap-3 font-serif text-3xl font-bold text-ink-900">{b?.name ?? `${ind.name} Benchmark`} <Chip tone={unlocked ? 'green' : 'gold'}>{unlocked ? 'Released' : 'Preview'}</Chip></h1>
                    <p className="mt-1 text-sm text-ink-700">Benchmark your performance against verified contributor data from {ind.name.toLowerCase()} businesses across South Africa.</p>
                    <p className="text-xs text-ink-500">Some data is hidden to protect contributor privacy. Unlock full benchmarks with valid contribution consent and meeting thresholds.</p>
                </div>
                <StatusChips items={[{ label: 'Industry', value: ind.name }, { label: 'Complexity Class', value: ind.complexityLabel }, { label: 'Benchmark Status', value: released ? 'Released' : 'Not Released' }, { label: 'Data Confidentiality', value: 'Protected' }]} />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_300px]">
                <div className="space-y-4">
                    {!released && (
                        <Notice tone="blue" title="Benchmark Not Yet Released" action={<a href="#method" className="rounded border border-controlled-500/40 bg-white px-3 py-1.5 text-xs font-semibold">How Benchmarks Are Released →</a>}>
                            Full numeric benchmarks are released only when minimum thresholds are met for data volume, diversity and privacy. You can view the benchmark methodology, bands and structure below. Consent to contribute to help unlock full benchmarks.
                        </Notice>
                    )}
                    <Box title="Benchmark Preview (Indicative Bands)" action={<span className="text-xs text-ink-500">Reporting Currency: ZAR</span>}>
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            {(b?.bands ?? []).map((band) => (
                                <div key={band.metric} className="rounded-[8px] border border-parchment-400 p-3">
                                    <p className="flex items-center gap-2 text-xs font-semibold text-ink-800"><DynIcon name={band.icon ?? 'chart'} className="size-5 text-verified-500" />{band.metric}</p>
                                    <p className="mt-2 text-[0.6875rem] text-ink-400">Indicative Range</p>
                                    <p className="text-lg font-bold">{band.low} – {band.high}</p>
                                    <div className="mt-1 flex items-center justify-between text-[0.6875rem]">
                                        <span>{unlocked ? <>Median: <strong>{band.value}</strong></> : 'You: —'}</span>
                                        <Chip tone="gold">Band {ind.complexityClass}</Chip>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div id="method" className="mt-4 grid gap-4 border-t border-parchment-300 pt-4 md:grid-cols-3">
                            <div>
                                <p className="text-sm font-semibold">Data Included in This Benchmark</p>
                                <ul className="mt-2 space-y-1.5 text-xs">{ind.subIndustries.map((s) => <li key={s.code} className="flex gap-1.5"><CheckCircle2 className="size-4 text-verified-500" />{s.name}</li>)}</ul>
                                <p className="mt-2 text-[0.6875rem] text-ink-400">More segments will be added as data grows.</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">Methodology Snapshot</p>
                                <ul className="mt-2 space-y-1.5 text-xs text-ink-700">
                                    <li>Contributor data from reporting period: FY 2025</li>
                                    <li>Minimum contributors per segment (n): <strong>{b?.minN ?? 30}</strong> — current {b?.nCurrent ?? 0}</li>
                                    <li>k-anonymity (k): <strong>{b?.minK ?? 10}</strong> — current {b?.kCurrent ?? 0}</li>
                                    <li>Minimum diversity requirement: <strong>{b?.minDiversity ?? 60}%</strong> — current {b?.diversityCurrent ?? 0}%</li>
                                    <li>Outlier treatment: Winsorised at P5 / P95</li>
                                    <li>Benchmark refresh cadence: Quarterly</li>
                                    <li>Release state: {b?.releaseState ?? 'BM-00 DESIGN'} · Level {b?.level ?? 'B0'}</li>
                                </ul>
                            </div>
                            <div>
                                <p className="text-sm font-semibold">How to Unlock Full Benchmarks</p>
                                <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs text-ink-700">
                                    <li>Review and accept the Benchmark Contribution Terms.</li>
                                    <li>Consent to share your anonymised performance data.</li>
                                    <li>Help us meet n and k thresholds for your segment.</li>
                                    <li>Receive full numeric benchmarks and percentile ranking.</li>
                                </ol>
                            </div>
                        </div>
                        {!unlocked && <p className="mt-4 flex items-center gap-2 rounded-[6px] bg-gold-50 p-2.5 text-xs text-gold-800"><Lock className="size-4" /> Full benchmark values are hidden to protect contributor privacy and commercial sensitivity.</p>}
                    </Box>
                </div>
                <Box tone="dark" title="Unlock Full Benchmarks">
                    <p className="text-xs text-gold-300">Full benchmarks include:</p>
                    <ul className="mt-2 space-y-1 text-xs text-parchment-100">{['Exact numeric values', 'Percentile ranking', 'Peer comparison by size band', 'Historical trend charts', 'Segment drill-downs', 'Downloadable benchmark report'].map((t) => <li key={t}>• {t}</li>)}</ul>
                    {[
                        ['Step 1: Review & Consent', 'Read the Benchmark Contribution Terms before you continue.', 'View Terms', '/resources/data-statement', consented],
                        ['Step 2: Contribute Your Data', 'Share anonymised performance data to support sector benchmarks.', 'Contribute Data', consentHref, consented],
                        ['Step 3: Unlock & Access', 'Get full benchmarks once thresholds are met.', null, null, unlocked],
                    ].map(([t, s, cta, href, done]) => (
                        <div key={t as string} className="mt-4 border-t border-ink-700 pt-3">
                            <p className="flex items-center gap-2 text-xs font-semibold text-gold-400">{t as string} {done ? <CheckCircle2 className="size-4 text-verified-500" /> : null}</p>
                            <p className="text-[0.6875rem] text-ink-300">{s as string}</p>
                            {cta && <Link href={href as string} className="mt-2 inline-block rounded border border-parchment-200 px-3 py-1 text-[0.6875rem] font-bold uppercase">{cta as string} →</Link>}
                        </div>
                    ))}
                    <Link href={consentHref} className="mt-4 flex items-center justify-center gap-2 rounded-[4px] bg-gold-500 px-3 py-2 text-xs font-bold text-ink-900 uppercase">
                        <Lock className="size-4" /> {unlocked ? 'Benchmarks Unlocked' : 'Unlock Benchmarks'} →
                    </Link>
                    <p className="mt-3 flex gap-1.5 text-[0.6875rem] text-ink-300"><ShieldCheck className="size-4 shrink-0" /> We never share your data. Aggregated results only. Privacy protected. You stay anonymous.</p>
                    {consented && !released && <p className="mt-2 flex gap-1.5 text-[0.6875rem] text-gold-300"><Info className="size-4 shrink-0" /> Thanks for contributing. Numbers release automatically once n, k and diversity thresholds pass.</p>}
                    <BarChart3 className="mt-3 hidden" />
                </Box>
            </div>
        </IndustryFrame>
    );
}
