import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { ActChip, B, Bars, Card, Cols, CxChip, Dl, Donut, Field, Flag, RegChip, STable, Steps, TagS, inputCls, saveStateSoon } from '@/Components/Industries/Kit';
import { CtxPanel, Head1, IndustryPage, SprintCard, iHref } from '@/Components/Industries/Layout';
import { useCurrency } from '@/lib/money';
import type { IndustryBase, SprintCardData } from '@/types/industries';

type St = { step: number; prof: Record<string, string>; ans: Record<string, number | boolean> };
interface Props extends IndustryBase {
    state: St;
    step: number | null;
    chains: { chain: string; q: string; info: string }[];
    checks: [string, string][];
    candidates: SprintCardData[];
    aiimNames: Record<string, string>;
}

const DDIM: [string, string, string][] = [['ma', 'Market Access', 'XMG'], ['op', 'Operational Readiness', 'OQ'], ['fi', 'Financial Strength', 'FV'], ['co', 'Compliance & Risk', 'LC'], ['es', 'Sustainability & ESG', 'S']];
const STEPS = ['Business Profile', 'Industry Context', 'Readiness Assessment', 'Risk & Compliance', 'Results & Next Steps'];
const OPTS = ['No', 'Partly', 'Mostly', 'Yes', 'Fully'];

function questions(nm: string): Record<string, string[]> {
    return {
        ma: [`We know our target buyers for ${nm} and what they pay`, 'We hold the certifications our target markets demand', 'We have a route to market across at least one border'],
        op: ['Our processes are documented and repeatable', 'We measure output, losses and quality monthly', 'Our supply of key inputs is secured for 12 months'],
        fi: ['We have 24 months of reliable financial records', 'We can fund working capital for a larger order', 'We have a bankable plan for our next investment'],
        co: [`We hold every licence and permit ${nm} requires`, 'Our tax and statutory filings are up to date', 'We have reviewed sector-specific regulation in the past year'],
        es: ['We track environmental impacts (water, energy, waste)', 'We meet labour and community standards', 'We can evidence our ESG claims to investors'],
    };
}

export default function Diagnostic(p: Props) {
    const { ind, ctx } = p;
    const c = ctx.country;
    const { currency } = useCurrency();
    const key = `diag-${ind.code}`;
    const [st, setSt] = useState<St>(() => ({ step: p.step ?? p.state.step ?? 0, prof: { ...(p.state.prof ?? {}) }, ans: { ...(p.state.ans ?? {}) } }));
    const Q = questions(ctx.sub?.name ?? ind.name);
    const update = (n: St) => { setSt(n); saveStateSoon(key, n); };

    const sc = useMemo(() => {
        const r: Record<string, number | null> = {};
        DDIM.forEach(([k]) => {
            const v = Q[k].map((_, i) => st.ans[k + i]).filter((x): x is number => typeof x === 'number');
            r[k] = v.length ? Math.round((100 * v.reduce((a, b) => a + b, 0)) / (v.length * 4)) : null;
        });
        const vs = Object.values(r).filter((v): v is number => v !== null);
        return { ...r, all: vs.length ? Math.round(vs.reduce((a, b) => a + b, 0) / vs.length) : null };
    }, [st.ans, Q]);
    const bar = (k: string) => (sc as Record<string, number | null>)[k];
    const barRows = DDIM.map(([k, l]) => ({ label: l, value: bar(k) ?? 0, text: bar(k) === null ? '—' : `${bar(k)}/100` }));

    const body = () => {
        if (st.step === 0) {
            const sel = (k: string, opts: string[]) => <select className={inputCls} value={st.prof[k] ?? ''} onChange={(e) => update({ ...st, prof: { ...st.prof, [k]: e.target.value } })}>{opts.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
            const inp = (k: string, ph: string) => <input className={inputCls} value={st.prof[k] ?? ''} placeholder={ph} onChange={(e) => update({ ...st, prof: { ...st.prof, [k]: e.target.value } })} />;
            return (
                <>
                    <Cols>
                        <Field label="Business / Project Name">{inp('name', 'e.g. Kgalagadi Beef Exporters (Pty) Ltd')}</Field>
                        <Field label="Primary Activity">{inp('activity', 'e.g. Feedlot and abattoir')}</Field>
                        <Field label="Years in Operation">{sel('years', ['', '0–1', '1–3', '3–5', '5–10', '10+'])}</Field>
                        <Field label="Business Type">{sel('type', ['', 'Sole trader', 'Private company', 'Cooperative', 'Public company', 'SOE', 'NGO'])}</Field>
                        <Field label="Stage of Business">{sel('stage', ['', 'Idea', 'Start-up', 'Growth', 'Mature', 'Turnaround'])}</Field>
                        <Field label={`Annual Revenue Range (${currency})`}>{sel('rev', ['', '< 1 m', '1–5 m', '5–20 m', '20–100 m', '> 100 m'])}</Field>
                        <Field label="Target Markets">{inp('markets', 'e.g. SACU, EU, Middle East')}</Field>
                        <Field label="Primary Objective">{inp('obj', 'e.g. Expand exports, raise capital')}</Field>
                    </Cols>
                    <Field label="Brief description" className="mt-3"><textarea rows={3} className="w-full rounded-[4px] border border-parchment-500 p-2 text-[0.85rem] font-normal" placeholder="Provide a short overview of what you do, your model and what you want to achieve…" value={st.prof.desc ?? ''} onChange={(e) => update({ ...st, prof: { ...st.prof, desc: e.target.value } })} /></Field>
                    <p className="mt-2 text-[0.72rem] text-ink-400">All information is confidential (POPIA / Botswana DPA aligned). It is kept on your account when you are signed in, otherwise in this browser session.</p>
                </>
            );
        }
        if (st.step === 1) {
            return (
                <>
                    <Dl rows={[['Industry', ind.name], ['Sub-Industry', ctx.sub ? ctx.sub.name : <a className="underline" href={`/industries/select?ind=${ind.code}`}>Select a sub-industry</a>], ['Country', <><Flag iso2={c.iso2} /> {c.name}</>], ['Complexity Class', <CxChip n={ind.cx} name={ind.cxName} />], ['Regulatory State', <RegChip reg={ind.reg} />], ['AIIM sectors used', ind.aiim.map((k) => p.aiimNames[k]).join(', ') || '—']]} />
                    {p.chains.length > 0 && (
                        <>
                            <h4 className="mt-4 mb-2 font-semibold">Questions investors and traders ask in this sector <TagS s="BW_Chains" /></h4>
                            <STable compact head={['Chain', 'Question', 'Information types']} rows={p.chains.map((r) => [r.chain, r.q, <span className="text-[0.78rem]">{r.info}</span>])} />
                        </>
                    )}
                </>
            );
        }
        if (st.step === 2) {
            return DDIM.map(([k, l]) => (
                <div key={k}>
                    <h4 className="mt-3 mb-1 font-semibold">{l}</h4>
                    {Q[k].map((qq, i) => (
                        <div key={i} className="flex flex-wrap items-center justify-between gap-2 border-b border-parchment-300 py-1.5">
                            <span className="min-w-[220px] flex-1 text-[0.82rem]">{qq}</span>
                            <span className="flex flex-wrap gap-2" role="radiogroup" aria-label={qq}>
                                {OPTS.map((o, v) => (
                                    <label key={o} className="inline-flex items-center gap-1 text-[0.75rem]">
                                        <input type="radio" name={k + i} checked={st.ans[k + i] === v} onChange={() => update({ ...st, ans: { ...st.ans, [k + i]: v } })} />{o}
                                    </label>
                                ))}
                            </span>
                        </div>
                    ))}
                </div>
            ));
        }
        if (st.step === 3) {
            return (
                <>
                    <p className="mb-2 text-[0.85rem]">Confirm what applies to you in {c.name}. Each "No" becomes a priority action and may trigger a mandatory add-on.</p>
                    {p.checks.map(([a, b], i) => (
                        <label key={i} className="flex items-start gap-2 border-b border-parchment-300 py-1.5">
                            <input type="checkbox" className="mt-1" checked={Boolean(st.ans[`rc${i}`])} onChange={(e) => update({ ...st, ans: { ...st.ans, [`rc${i}`]: e.target.checked } })} />
                            <span className="text-[0.82rem]"><b>{a}</b><br /><span className="text-ink-400">{b}</span></span>
                        </label>
                    ))}
                </>
            );
        }
        if (sc.all === null) return <p>Answer the readiness questions first.</p>;
        const weak = DDIM.filter(([k]) => bar(k) !== null).sort((a, b) => (bar(a[0]) ?? 0) - (bar(b[0]) ?? 0));
        const recs = weak.slice(0, 2).flatMap(([, , fams]) => p.candidates.filter((s) => fams.includes(s.fam)).slice(0, 2)).slice(0, 4);
        return (
            <>
                <div className="flex flex-wrap items-center gap-6">
                    <Donut p={sc.all} label="Readiness" />
                    <div><h3 className="text-[1.1rem] font-semibold">{sc.all >= 70 ? 'Moderate-High' : sc.all >= 50 ? 'Moderate' : 'Developing'} readiness</h3><p className="text-[0.85rem]">You show {sc.all >= 60 ? 'good' : 'emerging'} potential. Your weakest dimension is <b>{weak[0][1]}</b>.</p></div>
                </div>
                <div className="mt-3"><Bars rows={DDIM.map(([k, l]) => ({ label: l, value: bar(k) ?? 0, text: `${bar(k) ?? '—'}/100`, tone: (bar(k) ?? 0) < 50 ? 'bad' : (bar(k) ?? 0) < 70 ? 'warn' : '' }))} /></div>
                <Cols className="mt-3">
                    <div><b>Top strengths</b><ul className="mt-1 text-[0.82rem]">{weak.slice(-2).reverse().map(([k, l]) => <li key={k}>✓ {l} ({bar(k)}/100)</li>)}</ul></div>
                    <div><b>Key areas to improve</b><ul className="mt-1 list-disc ps-5 text-[0.82rem]">{weak.slice(0, 2).map(([k, l]) => <li key={k}>{l} ({bar(k)}/100)</li>)}</ul></div>
                </Cols>
                <h4 className="mt-4 mb-2 font-semibold">Recommended Sprints</h4>
                {recs.length ? <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-3">{recs.map((s) => <SprintCard key={s.code} s={s} ind={ind} />)}</div> : <p className="text-[0.82rem] text-ink-400">No matching Sprints.</p>}
            </>
        );
    };

    const next = () => {
        if (st.step === 4) { router.visit(iHref(ind, 'engage')); return; }
        update({ ...st, step: st.step + 1 });
        window.scrollTo(0, 0);
    };

    return (
        <IndustryPage base={p} active="diagnostic" right={<>
            <Card title="Diagnostic Preview" icon="gauge" sub="Indicative scores · v1.1 · 15–20 min">
                {sc.all !== null ? <Donut p={sc.all} label="Preview" size={96} /> : <p className="mb-2 text-[0.82rem] text-ink-400">Scores appear as you answer.</p>}
                <div className="mt-2"><Bars rows={barRows} /></div>
            </Card>
            <CtxPanel base={p} />
        </>}>
            <Head1 eyebrow={<><ActChip /> Mock-up Page 6</>} title="Sector-Adapted Diagnostic" desc={`AI-guided readiness, risk and routing assessment tailored to ${ind.name}. Questions, scoring and next steps adapt to your industry, business stage and objectives.`} />
            <Steps items={STEPS.map((s, i) => ({ label: s, step: `Step ${i + 1}`, state: i === st.step ? 'on' : i < st.step ? 'done' : '', onClick: () => update({ ...st, step: i }) }))} />
            <Card>{body()}</Card>
            <div className="flex flex-wrap gap-2">
                <B onClick={() => st.step > 0 && update({ ...st, step: st.step - 1 })}>← Back</B>
                <B onClick={() => update({ step: 0, prof: {}, ans: {} })}>Reset</B>
                <B v="pri" className="ms-auto" onClick={next}>{st.step === 4 ? 'Start engagement →' : 'Save & Continue →'}</B>
            </div>
        </IndustryPage>
    );
}
