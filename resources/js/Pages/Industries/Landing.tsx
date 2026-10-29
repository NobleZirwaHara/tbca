import { Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { A, Card, CatChip, Chip, CxChip, Dl, Flag, Ic, IICON, Kpi, Kpis, N, STable, TagM, btnClass } from '@/Components/Industries/Kit';
import { CallButton as Call, IndMap, Legend, Shell, iHref, scoreCol } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type Tile = { code: string; slug: string; name: string; subs: number; cat: string; variant: string; approved: number };
interface Props extends IndustryBase {
    all: Tile[];
    total: number;
    blocked: number;
    highlyRegulated: number;
    pick: { code: string; slug: string; name: string };
    map: Record<string, [number, number, number, number]>;
}

const KWI: Record<string, string> = {
    AGR: 'farm|crop|cattle|beef|livestock|maize|agri|poultry|dairy|horticult|fish|forest|food', MIN: 'mine|mining|diamond|copper|gold|mineral|quarry|exploration',
    MFG: 'manufactur|factory|assembl|plant|process|textile|chemical|packag', ENE: 'solar|power|energy|electric|fuel|oil|gas|water|utility|renewable',
    PRC: 'construct|property|real estate|housing|building|contractor', RET: 'retail|shop|store|ecommerce|e-commerce|wholesale|fmcg|consumer',
    TRN: 'logistic|freight|transport|truck|warehouse|courier|cold chain|shipping', ICT: 'software|saas|app|platform|telecom|it services|cyber|data centre|tech',
    FIN: 'bank|insur|fund|lend|loan|invest|fintech|payment|pension|microfinance', PRO: 'consult|account|law|legal|audit|advis|hr ', HLT: 'health|clinic|hospital|pharma|medical|wellness',
    EDU: 'school|college|training|education|skills|university|e-learning', TOU: 'tourism|hotel|lodge|safari|travel|restaurant|hospitality',
    CRE: 'media|film|music|design|creative|advertis|content|sport', INF: 'ppp|infrastructure|epc|engineering|road|bridge|public works',
    GOV: 'government|ministry|municipal|state-owned|soe|agency|public sector', NGO: 'ngo|npo|donor|charity|social enterprise|foundation|development programme',
};

export default function Landing(p: Props) {
    const { ind, ctx, all, countries } = p;
    const c = ctx.country;
    const [text, setText] = useState('');
    const [asked, setAsked] = useState(false);
    const hits = useMemo(() => {
        const t = text.toLowerCase();
        return all.map((x) => ({ x, n: (t.match(new RegExp(KWI[x.code], 'g')) ?? []).length })).filter((h) => h.n).sort((a, b) => b.n - a.n);
    }, [text, all]);
    const map = p.map;

    return (
        <Shell title="Industries" crumbs={[['Industries']]} dark>
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="min-w-0">
                    <div className="text-[0.72rem] font-semibold tracking-[0.14em] text-gold-400 uppercase">Industry changes relevance, cost and what TBCA can safely deliver.</div>
                    <h1 className="mt-2 text-[2rem] leading-[1.1] font-semibold text-white sm:text-[2.6rem]">Find the Right Industry.<br /><span className="text-gold-400">Unlock the Right Opportunities.</span></h1>
                    <p className="mt-3 max-w-[40rem] text-[1.02rem] text-parchment-300">Select your primary industry to see what TBCA can do, what it cannot do, what evidence is required, what specialist support may be needed and what the total cost of success looks like — in any of the 54 activated African countries.</p>
                    <div className="my-4 flex flex-wrap gap-2">
                        <A v="pri" href="/industries/select">Select Industry →</A>
                        <A v="dark" href={iHref(ind, 'intelligence')}><Ic n="book" /> View Sector Intelligence</A>
                        <A v="yellow" href="/industries/heatmap"><Ic n="map" /> Industry × Country Heat Map</A>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {['SELECT', 'VERIFY', 'RESOLVE CONTROLS', 'CURATE', 'FILTER', 'GO'].map((s, i) => (
                            <span key={s} className="contents">{i > 0 && <i className="text-gold-500 not-italic" aria-hidden="true">→</i>}<span className="rounded-[4px] border border-ink-700 bg-ink-900 px-2.5 py-1.5 text-[0.72rem] font-bold tracking-wide text-gold-300">{s}</span></span>
                        ))}
                    </div>
                    <h2 className="mt-6 mb-2.5 text-[1.1rem] font-semibold text-white">Select Your Primary Industry <span className="text-[0.75rem] font-normal text-ink-300">· 17 industries · 56 sub-industries</span></h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,190px),1fr))] gap-2.5">
                        {all.map((x) => (
                            <Link key={x.code} href={iHref(x)} className={`flex min-h-[110px] flex-col gap-1.5 rounded-[6px] border p-3.5 ${x.code === ind.code ? 'border-gold-500 bg-ink-800' : 'border-ink-700 bg-ink-900 hover:border-gold-500'}`}>
                                <span className="grid grid-cols-[minmax(0,1fr)] size-8 place-items-center rounded-[6px] bg-ink-800 text-gold-400"><Ic n={IICON[x.code]} /></span>
                                <b className="text-[0.88rem] leading-snug text-white">{x.name}</b>
                                <span className="text-[0.72rem] text-ink-300">{x.subs} sub-industries · {x.cat}</span>
                            </Link>
                        ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <A v="dark" href="/industries/select?multi=1">I operate in more than one industry</A>
                        <button type="button" className={btnClass('dark')} onClick={() => document.getElementById('gtext')?.focus()}>I'm not sure — help me decide</button>
                    </div>
                </div>
                <div className="min-w-0 space-y-4 text-ink-800">
                    <Card title="Your Selection" icon="check">
                        <Dl rows={[
                            ['Industry', ind.name], ['Sub-Industry', ctx.sub ? ctx.sub.name : <span className="text-ink-400">Not selected</span>], ['Country', <><Flag iso2={c.iso2} /> {c.name}</>],
                            ['Service Family', <span className="text-ink-400">Chosen on the industry page</span>], ['Complexity Class', <CxChip n={ind.cx} name={ind.cxName} />], ['Permission State', <Chip t="Active · gate per Sprint" tone="ok" />],
                        ]} />
                        <A v="pri" block className="mt-3" href={iHref(ind)}>Continue with {ind.name} →</A>
                    </Card>
                    <Card title="Not sure which industry fits?" icon="spark">
                        <form onSubmit={(e) => { e.preventDefault(); setAsked(true); }}>
                            <label className="sr-only" htmlFor="gtext">Describe your business</label>
                            <textarea id="gtext" rows={3} className="w-full rounded-[4px] border border-parchment-500 p-2 text-[0.85rem]" value={text} onChange={(e) => { setText(e.target.value); setAsked(false); }}
                                placeholder="Describe your business, service or project… e.g. 'We export beef from Botswana to the EU'" />
                            <button className={`${btnClass('pri')} mt-1.5`}>Get guidance</button>
                        </form>
                        {asked && (
                            <div className="mt-2 text-[0.82rem]">
                                {!text.trim() ? 'Type a sentence about what you do.' : hits.length ? (
                                    <>Best fit: <span className="inline-flex flex-wrap gap-1.5">{hits.slice(0, 3).map((h, i) => <A key={h.x.code} sm v={i ? 'default' : 'pri'} href={iHref(h.x)}>{h.x.name}</A>)}</span>
                                        <div className="mt-1 text-[0.72rem] text-ink-400">Guidance only — a TBCA analyst verifies the classification before any regulated work (Misdeclaration & Verification Queue).</div></>
                                ) : <>No clear match. <Link href="/industries/select" className="underline">Browse all 17</Link> or book a discovery call — we will classify it with you.</>}
                            </div>
                        )}
                    </Card>
                    <Card title="Next Steps" icon="layers">
                        <ul className="space-y-1 text-[0.82rem]">{['Select an industry to see what TBCA can and cannot do.', 'Understand required evidence, professional supports and controls.', 'View transparent pricing and mandatory sector add-ons.'].map((t) => <li key={t} className="flex gap-2"><span className="font-bold text-verified-700">✓</span>{t}</li>)}</ul>
                        <A block className="mt-3" href={iHref(ind, 'services')}>Explore all opportunities</A>
                    </Card>
                    <Card title="Need Guidance?" icon="msg"><p className="mb-2 text-[0.82rem]">Speak to a TBCA Advisor for tailored industry advice.</p><Call v="pri" sm={false} /></Card>
                </div>
            </div>

            <Kpis className="mt-5">
                <Kpi dark l="Canonical Industries" v="17" s="All active · taxonomy v3.1 proposed" icon="layers" />
                <Kpi dark l="Sub-Industries" v="56" s="Controlled taxonomy — no free text" icon="tag" />
                <Kpi dark l="Activated Countries" v="54" s="Every industry × every country" icon="globe" />
                <Kpi dark l="Sprints Classified" v={N(p.total)} s="Service family + complexity C1–C5" icon="check" />
                <Kpi dark l="Blocked / Restricted" v={N(p.blocked)} s="Reserved or conditioned — never disguised" icon="lock" />
                <Kpi dark l="Highly Regulated" v={String(p.highlyRegulated)} s="Professional gate mandatory" icon="shield" />
            </Kpis>

            <div className="mt-4 grid min-w-0 gap-4 text-ink-800 md:grid-cols-2">
                <Card title={`Where ${p.pick.name} opportunity is strongest`} icon="map">
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                        <label className="text-[0.8rem]">Industry{' '}
                            <select className="h-8 rounded-[4px] border border-parchment-500 bg-white px-1.5 text-[0.78rem]" value={p.pick.code} onChange={(e) => router.get('/industries', { map: e.target.value }, { preserveScroll: true, preserveState: true, only: ['pick', 'map'] })}>
                                {all.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}
                            </select>
                        </label>
                        <Legend items={[[scoreCol(25), 'Emerging'], [scoreCol(55), 'Moderate'], [scoreCol(85), 'High']]} />
                    </div>
                    <IndMap countries={countries} fill={(iso) => scoreCol(map[iso]?.[0] ?? 0)} label={`${p.pick.name} opportunity by country`}
                        tip={(iso, name) => `${name}\n${p.pick.name}\nOpportunity ${N(map[iso]?.[0], 1)}/100 · rank ${map[iso]?.[3]} of 54 (modelled)`}
                        href={(x) => `/industries/${p.pick.slug}/country/${x.slug}`} />
                    <p className="mt-2 text-[0.72rem] text-ink-400"><TagM /> Composite opportunity score — click a country for the Industry–Country intersection page.</p>
                </Card>
                <div className="min-w-0 space-y-4">
                    <Card title="Featured Worked Example" icon="star">
                        <div className="flex items-center gap-3">
                            <span className="grid grid-cols-[minmax(0,1fr)] size-[42px] shrink-0 place-items-center rounded-[9px] bg-gold-500 text-ink-900"><Ic n="leaf" /></span>
                            <div><b className="text-[1.05rem]">Agriculture › Livestock › Botswana</b><div className="text-[0.8rem] text-ink-500">Full BW-1.0 pack: 102 graded facts, 321 opportunity templates, 2,137 ranked leads, 18 permit routes</div></div>
                        </div>
                        <ul className="my-3 space-y-1 text-[0.82rem]">{['Sector-adapted diagnostic → limitation statement → mandatory add-ons', 'Gates G0–G8 → engagement letter → split checkout', 'Workspace: partner route, specialist sign-off, compliance calendar, fee ledger, abort ladder'].map((t) => <li key={t} className="flex gap-2"><span className="font-bold text-verified-700">✓</span>{t}</li>)}</ul>
                        <div className="flex flex-wrap gap-2">
                            <A v="pri" href="/industries/agriculture-agro-industry/country/botswana?sub=AGR2">Open the intersection</A>
                            <A href="/industries/agriculture-agro-industry/engage?sub=AGR2&iso=BWA">Run the journey</A>
                        </div>
                    </Card>
                    <Card title="Industry Catalogue Depth" icon="db" sub="Approved = sellable, published, not blocked, in the industry's core service families">
                        <STable compact head={['Industry', 'Approved', 'State']} rows={all.map((x) => [<Link href={iHref(x)} className="text-controlled-700 hover:underline">{x.name}</Link>, N(x.approved), <CatChip cat={x.cat} />])} />
                    </Card>
                </div>
            </div>

            <Card className="mt-4 text-ink-800" title="Industry Activation Evidence Required" icon="check">
                <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[['shield', 'Human gate', 'C4–C5 Sprints and regulated industries need human approval before release.'], ['scale', 'Professional boundaries', 'Reserved services are never sold — we route you to a registered professional.'], ['cash', 'Visible fees', 'Every engagement separates T (TBCA), P (Partner), X (External) and S (Statutory).'], ['db', 'Evidence first', 'Every figure carries a register, grade or a Modelled / Reference / Placeholder tag.']].map(([i, a, b]) => (
                        <div key={a} className="flex items-start gap-2"><Ic n={i} className="mt-0.5 text-gold-600" /><div><b>{a}</b><div className="text-[0.8rem] text-ink-500">{b}</div></div></div>
                    ))}
                </div>
            </Card>
        </Shell>
    );
}
