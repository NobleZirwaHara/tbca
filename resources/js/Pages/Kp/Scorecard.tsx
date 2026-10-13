import { Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { LineChart } from '@/Components/Webinars/charts';
import { btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, ConfidenceRing, KpPage, Limitation, Meter, scoreTone, type KpShared } from '@/Components/Kp/kit';

interface Props extends KpShared {
    card: { title: string; version: string; intro: string; categories: [string, string, number][] };
    scores: number[];
    history: { code: string; version: string; overall: number; date: string }[];
}

const band = (v: number) => (v >= 80 ? 'Excellent' : v >= 70 ? 'Good' : v >= 55 ? 'Fair' : 'Weak');

/** KP-SCR-029 Scorecard (Capital Readiness). Self-assessment, not certification. */
export default function Scorecard({ screen, kpNav, card, scores: initial, history }: Props) {
    const [scores, setScores] = useState<number[]>(initial);
    const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const ranked = card.categories.map((c, i) => ({ label: c[0], v: scores[i] })).sort((a, b) => b.v - a.v);
    const slug = 'capital-readiness';

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['African Business Clinic', `${BASE}/african-business-clinic`], ['Scorecard']]}
            title={card.title}
            badge={<span className="rounded-full border border-referenced-500/40 bg-referenced-50 px-2 py-0.5 font-sans text-[0.75rem] font-semibold text-referenced-500">{card.version}</span>}
            intro={card.intro}
            actions={
                <>
                    <a href={`${BASE}/tools/scorecards/${slug}/export`} className={btnClass('outline', 'sm')}><L.Download className="size-3.5" />Export</a>
                    <button type="button" onClick={() => router.post(`${BASE}/tools/scorecards/${slug}`, { scores }, { preserveScroll: true })} className={btnClass('gold', 'sm')}><L.Save className="size-3.5" />Save Version</button>
                </>
            }
            rail={
                <>
                    <Box title="Score Trend">
                        {history.length >= 2 ? <LineChart labels={[...history].reverse().map((h) => h.version)} series={[{ label: 'Overall', values: [...history].reverse().map((h) => h.overall), color: 'purple', kind: 'line' }]} /> : <p className="text-[0.8125rem] text-ink-500">Save two or more versions to see your trend.</p>}
                        {history.length > 0 && <ul className="mt-2 space-y-1 text-[0.75rem]">{history.slice(0, 5).map((h) => <li key={h.code} className="flex justify-between"><span>{h.version} | {h.date}</span><strong>{h.overall}/100</strong></li>)}</ul>}
                    </Box>
                    <Box title="Top Strengths"><ul className="space-y-1 text-[0.8125rem]">{ranked.slice(0, 3).map((r) => <li key={r.label} className="flex gap-2"><L.CircleCheck className="mt-0.5 size-4 text-verified-500" aria-hidden="true" />{r.label} ({r.v})</li>)}</ul></Box>
                    <Box title="Areas to Improve"><ul className="space-y-1 text-[0.8125rem]">{ranked.slice(-3).reverse().map((r) => <li key={r.label} className="flex gap-2"><L.TriangleAlert className="mt-0.5 size-4 text-attested-500" aria-hidden="true" />{r.label} ({r.v})</li>)}</ul></Box>
                    <Box title="Improve Your Score" tone="purple">
                        <p className="text-[0.8125rem]">Answer the diagnostic questions to see where the evidence is thin.</p>
                        <Link href={`${BASE}/diagnostic-questions?topic=finance-funding`} className="mt-2 inline-block text-[0.8125rem] font-semibold text-gold-700">Go to Diagnostic Questions</Link>
                    </Box>
                </>
            }
        >
            <section className="grid gap-4 rounded-[12px] border border-parchment-400 bg-white p-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
                <ConfidenceRing value={overall} label={band(overall)} size={130} />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[['Highest', ranked[0]], ['Lowest', ranked[ranked.length - 1]]].map(([l, r]) => { const x = r as { label: string; v: number }; return <div key={l as string}><p className="text-[0.75rem] text-ink-500">{l as string}</p><p className="text-xl font-bold text-ink-900">{x.v}/100</p><p className="text-[0.6875rem] text-ink-500">{x.label}</p></div>; })}
                    <div><p className="text-[0.75rem] text-ink-500">Score range</p><p className="text-xl font-bold text-ink-900">{ranked[ranked.length - 1].v} to {ranked[0].v}</p><p className="text-[0.6875rem] text-ink-500">{scores.filter((v) => v < 55).length} areas below 55</p></div>
                </div>
            </section>

            <Box title="Category Breakdown" icon="bar-chart-3">
                <ul className="space-y-3">
                    {card.categories.map(([label, hint], i) => (
                        <li key={label} className="grid gap-2 sm:grid-cols-[14rem_minmax(0,1fr)_4rem] sm:items-center">
                            <label htmlFor={`s${i}`}><span className="block text-[0.8125rem] font-semibold text-ink-900">{label}</span><span className="block text-[0.6875rem] text-ink-500">{hint}</span></label>
                            <div><input id={`s${i}`} type="range" min={0} max={100} step={5} value={scores[i]} onChange={(e) => { const n = [...scores]; n[i] = Number(e.target.value); setScores(n); }} className="w-full accent-referenced-500" /><Meter value={scores[i]} tone={scoreTone(scores[i])} /></div>
                            <span className="text-right text-[0.875rem] font-bold text-ink-900">{scores[i]}<span className="text-ink-500">/100</span></span>
                        </li>
                    ))}
                </ul>
            </Box>
            <p className="rounded-[10px] border border-referenced-500/30 bg-referenced-50 p-3 text-[0.75rem] text-ink-700">The overall score is the simple average of the ten areas. Bands: 80+ Excellent, 70 to 79 Good, 55 to 69 Fair, below 55 Weak.</p>
            <Limitation compact />
        </KpPage>
    );
}
