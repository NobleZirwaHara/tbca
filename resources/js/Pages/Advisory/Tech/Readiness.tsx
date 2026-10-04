import { Head, Link, useForm } from '@inertiajs/react';
import { BadgeCheck, CircleCheck, CircleX } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import TechJourney, { type JourneyState } from '@/Components/Advisory/TechJourney';
import { Card, Gauge } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';

interface Dim { key: string; name: string; questions: string[]; tower: string }
interface Props { journey: JourneyState; dimensions: Dim[]; levels: string[]; answers: Record<string, number>; towerNames: Record<string, string> }

/** Mirrors TechContent::readiness(): 0-4 scale averaged to /100; weakest dimensions drive tower recommendations. */
function compute(dims: Dim[], a: Record<string, number>) {
    let total = 0;
    let count = 0;
    const scores = dims.map((d) => {
        const sum = d.questions.reduce((s, _q, i) => s + (Number(a[`${d.key}_${i}`]) || 0), 0);
        total += sum;
        count += d.questions.length;
        return { ...d, score: Math.round((sum / (d.questions.length * 4)) * 100) };
    });
    const score = count ? Math.round((total / (count * 4)) * 100) : 0;
    const band = score >= 80 ? 'Advanced — ready to optimise and scale.' : score >= 60 ? 'Good foundation, with key gaps to address.' : score >= 40 ? 'Developing — several foundations need attention.' : 'Early stage — start with core systems and data.';
    const asc = [...scores].sort((x, y) => x.score - y.score);
    return { score, band, strengths: [...scores].sort((x, y) => y.score - x.score).slice(0, 3), gaps: asc.slice(0, 3), recommended: asc.slice(0, 3) };
}

export default function Readiness({ journey, dimensions, levels, answers, towerNames }: Props) {
    const form = useForm({ answers, next: 'save' });
    const r = compute(dimensions, form.data.answers);
    const post = (next: 'save' | 'configure') => {
        form.transform((d) => ({ ...d, next }));
        form.post('/technology-solutions/readiness', { preserveScroll: true });
    };
    return (
        <>
            <Head title="Free Technology Readiness Diagnostic" />
            <TechJourney step={3} journey={journey} title="Free Technology Readiness Diagnostic" sub="This free assessment identifies your current technology maturity, highlights gaps, and recommends the right Technology Solution Towers."
                badge={<span className="flex items-center gap-2 rounded border border-verified-500 px-3 py-1.5 text-xs text-verified-700"><BadgeCheck className="size-4" /><span><b>FREE DIAGNOSTIC</b> — 100% Free • No Paid Commitment</span></span>}
                footer={<><Link href="/technology-solutions/towers" className="text-sm">← Back to Towers</Link><div className="flex gap-2"><Button variant="outline" onClick={() => post('save')} disabled={form.processing}>Save Diagnostic</Button><Button onClick={() => post('configure')} disabled={form.processing} trailingIcon="arrow-right">Configure Recommended Solution</Button></div></>}>
                <div className="grid gap-4 xl:grid-cols-12">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-8">
                        <p className="text-xs text-ink-600">Rate your current state for each area. Your answers are confidential and used only to generate your readiness insights.</p>
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full min-w-[620px] text-xs">
                                <thead><tr><th className="text-left" />{levels.map((l) => <th key={l} className="px-1 text-center font-semibold text-ink-600">{l}</th>)}</tr></thead>
                                {dimensions.map((d, di) => (
                                    <tbody key={d.key} className="border-t border-parchment-300">
                                        <tr><th colSpan={6} className="pt-3 text-left text-sm font-semibold"><span className="mr-1.5 inline-flex size-5 items-center justify-center rounded-full bg-gold-500 text-[0.625rem]">{di + 1}</span>{d.name}</th></tr>
                                        {d.questions.map((q, qi) => {
                                            const k = `${d.key}_${qi}`;
                                            return (
                                                <tr key={k}>
                                                    <td className="py-1.5 pr-3 text-ink-700">{q}</td>
                                                    {levels.map((l, li) => (
                                                        <td key={l} className="text-center">
                                                            <label className="inline-flex cursor-pointer p-1"><span className="sr-only">{q}: {l}</span>
                                                                <input type="radio" name={k} checked={Number(form.data.answers[k]) === li} onChange={() => form.setData('answers', { ...form.data.answers, [k]: li })} className="size-4 accent-gold-600" />
                                                            </label>
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                ))}
                            </table>
                        </div>
                        {Object.keys(form.errors).length > 0 && <p className="mt-2 text-xs text-risk-500">Answer every question to generate an accurate result.</p>}
                        <p className="mt-3 text-[0.6875rem] text-ink-500">Your results are calculated instantly. Some recommendations may require human review at later stages.</p>
                    </section>
                    <aside className="xl:col-span-4">
                        <div className="overflow-hidden rounded-[8px] border border-parchment-400 bg-white">
                            <p className="bg-ink-950 px-4 py-2 text-[0.6875rem] font-semibold text-gold-400">RESULT – BASED ON CURRENT ANSWERS</p>
                            <div className="p-4">
                                <p className="text-center text-sm font-semibold">Technology Readiness</p>
                                <Gauge value={r.score} label={r.band} sub="Results are based on your current answers and may change as you update them." />
                                <p className="mt-3 text-xs font-semibold text-verified-700">Strengths</p>
                                <ul className="space-y-1 text-xs">{r.strengths.map((s) => <li key={s.key} className="flex gap-1.5"><CircleCheck className="size-3.5 text-verified-500" />{s.name}: {s.score}% maturity</li>)}</ul>
                                <p className="mt-3 text-xs font-semibold text-risk-700">Gaps</p>
                                <ul className="space-y-1 text-xs">{r.gaps.map((s) => <li key={s.key} className="flex gap-1.5"><CircleX className="size-3.5 text-risk-500" />{s.name}: {s.score}% — key gap to address</li>)}</ul>
                                <p className="mt-3 text-xs font-semibold">Top 3 Recommended Towers</p>
                                <ol className="space-y-1 text-xs">{r.recommended.map((s, i) => <li key={s.key} className="flex items-center justify-between gap-2"><span>{i + 1}. {s.tower} {towerNames[s.tower]}</span><span className={cn('rounded px-1.5 text-[0.625rem]', i < 2 ? 'bg-verified-50 text-verified-700' : 'bg-attested-50 text-attested-700')}>{i < 2 ? 'High Impact' : 'Medium Impact'}</span></li>)}</ol>
                            </div>
                        </div>
                        <Card title="Scoring bands" className="mt-4"><ul className="text-xs text-ink-600"><li>0–39 Early stage</li><li>40–59 Developing</li><li>60–79 Good foundation</li><li>80–100 Advanced</li></ul></Card>
                    </aside>
                </div>
            </TechJourney>
        </>
    );
}
