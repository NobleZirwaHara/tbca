import { Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useMemo, useState } from 'react';
import { btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, Field, Input, KpPage, Limitation, Select, type KpShared } from '@/Components/Kp/kit';
import { usePrice } from '@/lib/money';

interface Inputs { name: string; investment: number; months: number; revenue: number; margin: number; rate: number; probability: number; risk: string }

interface Props extends KpShared {
    defaults: Inputs;
    base: Inputs;
    saved: { code: string; name: string; npv: number; date: string }[];
}

/** Mirrors KpToolsController::investmentCase so the browser and the saved record agree. */
function calc(i: Inputs) {
    const flow = (i.revenue * (i.margin / 100)) / 12 * (i.probability / 100);
    const r = i.rate / 100 / 12;
    const npvAt = (rate: number) => { let v = -i.investment; for (let t = 1; t <= i.months; t++) v += flow / (1 + rate) ** t; return v; };
    let irr: number | null = null;
    if (flow * i.months > i.investment) {
        let lo = 0, hi = 1;
        for (let k = 0; k < 80; k++) { const mid = (lo + hi) / 2; if (npvAt(mid) > 0) lo = mid; else hi = mid; }
        irr = Math.round(((1 + lo) ** 12 - 1) * 1000) / 10;
    }
    const cum: number[] = [];
    let c = -i.investment;
    for (let t = 1; t <= i.months; t++) { c += flow; cum.push(Math.round(c)); }
    return { npv: Math.round(npvAt(r)), roi: Math.round(((flow * i.months - i.investment) / i.investment) * 1000) / 10, payback: flow > 0 ? Math.round((i.investment / flow) * 10) / 10 : null, irr, monthly: Math.round(flow), cum };
}

/** Cumulative cash bars around a zero line (the shared charts assume positive values). */
function CashChart({ labels, values, fmt }: { labels: string[]; values: number[]; fmt: (v: number) => string }) {
    const W = 600, H = 220, P = 8, top = Math.max(0, ...values), bottom = Math.min(0, ...values), span = Math.max(1, top - bottom);
    const y = (v: number) => P + ((top - v) / span) * (H - 2 * P - 18);
    const bw = (W - 2 * P) / Math.max(1, values.length);
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Cumulative cash position by month">
            <line x1={P} x2={W - P} y1={y(0)} y2={y(0)} stroke="#9a9aa5" />
            {values.map((v, i) => (
                <g key={i}>
                    <rect x={P + i * bw + bw * 0.15} width={bw * 0.7} y={Math.min(y(v), y(0))} height={Math.max(1, Math.abs(y(v) - y(0)))} fill={v < 0 ? '#d0473a' : '#2f9e66'} rx="2"><title>{`Month ${labels[i]}: ${fmt(v)}`}</title></rect>
                    <text x={P + i * bw + bw / 2} y={H - 4} textAnchor="middle" fontSize="11" fill="#6b6b78">{labels[i]}</text>
                </g>
            ))}
            <text x={P + 2} y={y(0) - 4} fontSize="11" fill="#6b6b78">0</text>
            <text x={W - P} y={12} textAnchor="end" fontSize="11" fill="#6b6b78">{fmt(top)}</text>
            <text x={W - P} y={y(bottom) + 12 > H - 18 ? y(bottom) - 4 : y(bottom) + 12} textAnchor="end" fontSize="11" fill="#6b6b78">{fmt(bottom)}</text>
        </svg>
    );
}

/** KP-SCR-030 Calculator (investment case). Amounts are entered in ZAR and shown in the visitor's currency. */
export default function Calculator({ screen, kpNav, defaults, base, saved }: Props) {
    const price = usePrice();
    const [i, setI] = useState<Inputs>(defaults);
    const r = useMemo(() => calc(i), [i]);
    const step = Math.max(1, Math.round(i.months / 12));
    const labels = r.cum.map((_, k) => String(k + 1)).filter((_, k) => (k + 1) % step === 0);
    const series = r.cum.filter((_, k) => (k + 1) % step === 0);
    const num = (k: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setI({ ...i, [k]: Number(e.target.value) });
    const verdict = r.npv > 0 ? 'Creates value at your discount rate.' : 'Does not recover its cost of capital within the timeframe.';

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['African Business Clinic', `${BASE}/african-business-clinic`], ['Calculator']]}
            title="Investment Case Calculator"
            badge={<span className="rounded-full border border-referenced-500/40 bg-referenced-50 px-2 py-0.5 font-sans text-[0.75rem] font-semibold text-referenced-500">Beta</span>}
            intro="Model a scenario and estimate its key impacts: net present value, return, payback and internal rate of return."
            actions={<button type="button" onClick={() => router.post(`${BASE}/tools/calculators/investment-case`, { ...i }, { preserveScroll: true })} className={btnClass('gold', 'sm')}><L.Save className="size-3.5" />Save Calculation</button>}
            left={
                <Box title="1. Your Inputs">
                    <div className="space-y-2.5">
                        <Field label="Project / Initiative"><Input value={i.name} maxLength={120} onChange={(e) => setI({ ...i, name: e.target.value })} /></Field>
                        <Field label="Investment Amount (ZAR)" hint={price(i.investment)}><Input type="number" min={1} value={i.investment} onChange={num('investment')} /></Field>
                        <Field label="Investment Timeframe"><Select value={String(i.months)} onChange={num('months')} options={[12, 24, 36, 48, 60].map((m) => ({ value: String(m), label: `${m} months` }))} /></Field>
                        <Field label="Expected Annual Revenue Increase (ZAR)" hint={price(i.revenue)}><Input type="number" min={0} value={i.revenue} onChange={num('revenue')} /></Field>
                        {([['margin', 'Operating Margin (%)', 0, 100], ['rate', 'Discount Rate (%)', 0, 40], ['probability', 'Probability of Success (%)', 0, 100]] as const).map(([k, l, min, max]) => (
                            <label key={k} className="block text-[0.8125rem] font-semibold text-ink-800">{l}
                                <span className="mt-1 flex items-center gap-2"><input type="range" min={min} max={max} value={i[k]} onChange={num(k)} className="flex-1 accent-referenced-500" /><span className="w-10 text-right">{i[k]}%</span></span>
                            </label>
                        ))}
                        <Field label="Implementation Risk Level"><Select value={i.risk} onChange={(e) => setI({ ...i, risk: e.target.value })} options={['Low', 'Medium', 'High']} /></Field>
                        <button type="button" onClick={() => setI(base)} className={btnClass('outline', 'sm')}><L.RotateCcw className="size-3.5" />Reset</button>
                    </div>
                </Box>
            }
            rail={
                <>
                    <Box title="3. Summary">
                        <dl className="space-y-1.5 text-[0.8125rem]">
                            {[['Scenario', i.name], ['NPV', price(r.npv)], ['ROI', `${r.roi}%`], ['Payback', r.payback ? `${r.payback} months` : 'n/a'], ['IRR (annual)', r.irr !== null ? `${r.irr}%` : 'Below zero'], ['Probability of success', `${i.probability}%`], ['Risk level', i.risk]].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-semibold text-ink-900">{v}</dd></div>)}
                        </dl>
                    </Box>
                    <Box title="4. What This Means" tone="purple"><p className="text-[0.8125rem]">{verdict} {i.risk === 'High' ? 'Risk is high: test the probability assumption before committing.' : ''}</p></Box>
                    <Box title="5. Related Tools">
                        <ul className="space-y-1.5 text-[0.8125rem]">{[['Project Fatal-Flaw Explorer', '/project-fatal-flaw'], ['Funder Readiness Interviewer', '/funder-readiness'], ['Decision Sheet', '/decision-sheet'], ['Scorecard', '/tools/scorecards/capital-readiness']].map(([t, h]) => <li key={t}><Link href={`${BASE}${h}`} className="hover:text-gold-700">{t}</Link></li>)}</ul>
                    </Box>
                    {saved.length > 0 && <Box title="Saved Scenarios"><ul className="space-y-1 text-[0.75rem]">{saved.map((s) => <li key={s.code} className="flex justify-between gap-2"><span>{s.name}<span className="block text-ink-500">{s.date}</span></span><strong>{price(s.npv)}</strong></li>)}</ul></Box>}
                </>
            }
        >
            <Box title="2. Results" icon="calculator">
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[['Net Present Value (NPV)', price(r.npv), r.npv > 0 ? 'Positive' : 'Negative'], ['Return on Investment (ROI)', `${r.roi}%`, r.roi > 0 ? 'Positive' : 'Negative'], ['Payback Period', r.payback ? `${r.payback} months` : 'n/a', r.payback && r.payback <= i.months ? 'Within timeframe' : 'Beyond timeframe'], ['Internal Rate of Return', r.irr !== null ? `${r.irr}%` : 'Below zero', r.irr !== null && r.irr > i.rate ? 'Above discount rate' : 'Below discount rate']].map(([l, v, s]) => (
                        <li key={l} className="rounded-[10px] border border-parchment-400 p-3"><p className="text-[0.75rem] text-ink-500">{l}</p><p className="text-xl font-bold text-ink-900">{v}</p><p className="text-[0.6875rem] text-ink-500">{s}</p></li>
                    ))}
                </ul>
                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
                    <div>
                        <p className="mb-1 text-[0.8125rem] font-semibold text-ink-900">Cumulative cash position by month (probability-weighted)</p>
                        <CashChart labels={labels} values={series} fmt={price} />
                    </div>
                    <dl className="space-y-1.5 rounded-[10px] border border-parchment-400 p-3 text-[0.75rem]">
                        <p className="font-bold text-ink-900">Key Assumptions</p>
                        {[['Investment', price(i.investment)], ['Annual revenue increase', price(i.revenue)], ['Operating margin', `${i.margin}%`], ['Expected monthly inflow', price(r.monthly)], ['Discount rate', `${i.rate}%`], ['Probability of success', `${i.probability}%`], ['Timeframe', `${i.months} months`]].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
                    </dl>
                </div>
                <p className="mt-3 text-[0.75rem] text-ink-500">Method: monthly inflow = annual revenue increase x operating margin / 12, weighted by the probability of success, discounted monthly. Estimates only: use professional judgement and further analysis before deciding.</p>
            </Box>
            <Limitation compact />
        </KpPage>
    );
}
