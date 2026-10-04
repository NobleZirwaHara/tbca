import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Award, CalendarDays, Download, FileDown, ListChecks, Mail, MessageCircle, Rocket, Shield, TriangleAlert } from 'lucide-react';
import { HealthHeader, stepLabels } from '@/Components/CorePages/HealthParts';
import { DarkCard, NumberedList, ProgressRing } from '@/Components/CorePages/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import Icon from '@/Components/ui/Icon';
import { cn } from '@/lib/cn';
import type { HealthResult, HealthStep } from '@/types/core-pages';

interface Props {
    assessment: { reference: string; business_name: string | null; submitted_at: string; email: string | null };
    result: HealthResult;
    dimensions: Record<string, string>;
    weights: Record<string, number>;
    steps: HealthStep[];
}

const icons: Record<string, string> = { growth: 'trending-up', finance: 'bar-chart-3', sales: 'radio', operations: 'settings', people: 'users' };
const barTone = (v: number) => (v >= 75 ? 'bg-verified-500' : v >= 60 ? 'bg-gold-500' : 'bg-risk-500');

export default function Results({ assessment, result, dimensions, weights, steps }: Props) {
    const ref = assessment.reference;
    const tone = result.overall >= 70 ? 'gold' : result.overall >= 50 ? 'gold' : 'bad';

    return (
        <div className="bg-parchment-200">
            <Head title="Business Health Score Results" />
            <div className="container-tbca grid gap-6 py-8 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-9">
                    <HealthHeader
                        crumbs={[{ label: 'Home', href: '/' }, { label: 'Business Health Score', href: '/business-health-score' }, { label: 'Results' }]}
                        title="Business Health Score Results"
                        subtitle="Here is your initial Business Health Score."
                        intro="We have analysed your responses across five weighted business dimensions and prepared your overall score, functional breakdown, priority actions and recommended next step."
                        steps={[...stepLabels(steps), 'Results']}
                        current={9}
                        progress={100}
                        stepLabel="Step 8 of 8"
                    />

                    <section className="relative overflow-hidden rounded-[12px] bg-ink-950 p-6 text-parchment-100">
                        <div className="pointer-events-none absolute inset-0 motif-grid opacity-25" aria-hidden="true" />
                        <div className="relative flex flex-col items-center gap-6 md:flex-row">
                            <ProgressRing value={result.overall} size={150} stroke={14} label={<span className="text-[2.75rem]">{result.overall}</span>} sub="/ 100" tone={tone} track="dark" />
                            <div className="flex-1">
                                <h2 className="text-[1.375rem] leading-snug font-bold text-gold-400 md:text-[1.625rem]">{result.band.title}</h2>
                                <p className="mt-2 max-w-2xl text-[0.9375rem] text-parchment-200">{result.band.body}</p>
                                <p className="mt-2 text-[0.75rem] text-ink-300">{assessment.business_name} · Reference {ref} · {assessment.submitted_at}</p>
                            </div>
                            <Award className="hidden size-20 text-gold-500 md:block" aria-hidden="true" />
                        </div>
                    </section>

                    <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                        <h2 className="flex items-center gap-2 text-[1rem] font-bold text-ink-900"><ListChecks className="size-4 text-gold-600" aria-hidden="true" />Functional Score Breakdown</h2>
                        <ul className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                            {Object.entries(dimensions).map(([k, label]) => {
                                const v = result.dimensions[k];
                                return (
                                    <li key={k} className="rounded-[8px] border border-parchment-400 p-3">
                                        <p className="flex items-center gap-2 text-[0.75rem] font-semibold text-ink-700"><Icon name={icons[k]} className="size-5 text-gold-600" />{label}</p>
                                        <p className="mt-2 text-[1.5rem] font-bold text-ink-900">{v}<span className="text-[0.75rem] font-medium text-ink-400"> /100</span></p>
                                        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-parchment-300"><div className={cn('h-full rounded-full', barTone(v))} style={{ width: `${v}%` }} /></div>
                                        <p className="mt-1 text-[0.625rem] text-ink-400">Weight {Math.round(weights[k] * 100)}%</p>
                                    </li>
                                );
                            })}
                            <li className="rounded-[8px] border border-gold-400 bg-gold-50 p-3">
                                <p className="flex items-center gap-2 text-[0.75rem] font-semibold text-ink-700"><Award className="size-5 text-gold-600" aria-hidden="true" />Overall Health Score</p>
                                <p className="mt-2 text-[1.5rem] font-bold text-gold-700">{result.overall}<span className="text-[0.75rem] font-medium text-ink-400"> /100</span></p>
                                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-parchment-300"><div className="h-full rounded-full bg-gold-500" style={{ width: `${result.overall}%` }} /></div>
                                <p className="mt-1 text-[0.625rem] text-ink-400">Weighted average</p>
                            </li>
                        </ul>
                    </section>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                            <h2 className="flex items-center gap-2 text-[0.9375rem] font-bold text-ink-900"><TriangleAlert className="size-4 text-gold-600" aria-hidden="true" />Your Most Important Gaps</h2>
                            {result.gaps.length === 0 ? (
                                <p className="mt-3 text-[0.8125rem] text-ink-500">No significant gaps identified. Focus on scaling with control.</p>
                            ) : (
                                <ul className="mt-3 space-y-3">
                                    {result.gaps.map((g) => (
                                        <li key={g.title} className="flex gap-3">
                                            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700"><Icon name={icons[g.section]} className="size-4" /></span>
                                            <span className="text-[0.8125rem]"><span className="block font-medium text-ink-900">{g.title}</span><span className="text-[0.6875rem] text-ink-500">{g.dimension}</span></span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                        <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                            <h2 className="flex items-center gap-2 text-[0.9375rem] font-bold text-ink-900"><CalendarDays className="size-4 text-gold-600" aria-hidden="true" />Your 30-Day Priority Action Plan</h2>
                            <NumberedList className="mt-3" items={result.actions} />
                        </section>
                        <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                            <h2 className="flex items-center gap-2 text-[0.9375rem] font-bold text-ink-900"><Rocket className="size-4 text-gold-600" aria-hidden="true" />Recommended TBCA Next Step</h2>
                            <div className="mt-3 rounded-[8px] bg-ink-950 p-4 text-parchment-200">
                                <p className="text-[1rem] font-bold text-gold-400">{result.recommendation.name}</p>
                                <p className="mt-1 text-[0.75rem]">{result.recommendation.body}</p>
                                <ul className="mt-3 grid grid-cols-2 gap-1.5">
                                    {result.recommendation.chips.map((c) => <li key={c} className="rounded-[4px] border border-ink-700 px-2 py-1 text-center text-[0.625rem]">{c}</li>)}
                                </ul>
                            </div>
                            {result.also.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-[0.75rem] font-semibold text-ink-600">Also recommended</p>
                                    <ul className="mt-1 space-y-1">
                                        {result.also.map((s) => <li key={s.slug}><Link href={s.href} className="text-[0.8125rem] text-gold-700 hover:underline">{s.name}</Link></li>)}
                                    </ul>
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <Link href="/" className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] border border-ink-300 bg-white px-5 text-sm"><ArrowLeft className="size-4" aria-hidden="true" />Back to Home</Link>
                        <a href={`/business-health-score/results/${ref}/download`} className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] border border-gold-500 bg-white px-5 text-sm font-semibold text-gold-700">Download My Summary <Download className="size-4" aria-hidden="true" /></a>
                        <Link href="/discovery-call" className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900"><CalendarDays className="size-4" aria-hidden="true" />Book My Discovery Call</Link>
                        <Link href={result.recommendation.href} className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] border border-gold-500 bg-white px-5 text-sm font-semibold text-gold-700">Explore Recommended Sprint <ArrowRight className="size-4" aria-hidden="true" /></Link>
                    </div>
                </div>

                <aside className="xl:col-span-3">
                    <DarkCard title="What Happens Next?">
                        <ul className="space-y-4">
                            {[[FileDown, 'Download or email your summary', 'Save your results and key insights for future reference.'], [ListChecks, 'Review your 30-day action plan', 'Focus on the priority actions that will create the biggest impact.'], [CalendarDays, 'Book a discovery call with TBCA', 'Speak with an advisor to discuss your score and opportunities.'], [Rocket, 'Start your recommended Sprint when ready', 'Turn insights into a practical growth plan and measurable results.']].map(([I, t, b]) => {
                                const Ico = I as typeof Rocket;
                                return <li key={t as string} className="flex gap-3"><Ico className="size-6 shrink-0 text-gold-500" aria-hidden="true" /><span><span className="block text-[0.8125rem] font-semibold text-parchment-100">{t as string}</span><span className="block text-[0.75rem]">{b as string}</span></span></li>;
                            })}
                        </ul>
                        <div className="mt-5 rounded-[8px] border border-gold-600/60 p-4">
                            <p className="text-[0.875rem] font-semibold text-gold-400">Send My Results</p>
                            <button type="button" onClick={() => router.post(`/business-health-score/results/${ref}/send`, { channel: 'email' }, { preserveScroll: true })} className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[4px] border border-parchment-200/40 text-[0.8125rem] text-parchment-100 hover:border-gold-500"><Mail className="size-4" aria-hidden="true" />Email Me My Summary</button>
                            <button type="button" onClick={() => router.post(`/business-health-score/results/${ref}/send`, { channel: 'whatsapp' }, { preserveScroll: true })} className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[4px] border border-parchment-200/40 text-[0.8125rem] text-parchment-100 hover:border-verified-500"><MessageCircle className="size-4" aria-hidden="true" />Send to WhatsApp</button>
                        </div>
                        <p className="mt-4 flex gap-2 text-[0.75rem]"><Shield className="size-4 shrink-0 text-gold-500" aria-hidden="true" />Your answers remain confidential and are used only in line with your consent selections.</p>
                        <div className="mt-4 rounded-[8px] border border-gold-600/60 p-4">
                            <p className="text-[0.875rem] font-semibold text-gold-400">Need help interpreting your score?</p>
                            <button type="button" onClick={() => openAskQuestion({ subject: `Interpreting Business Health Score ${ref}`, section: 'core' })} className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[4px] border border-gold-500 text-[0.8125rem] text-gold-300"><MessageCircle className="size-4" aria-hidden="true" />Chat with NATASHA</button>
                        </div>
                    </DarkCard>
                </aside>
            </div>
        </div>
    );
}
