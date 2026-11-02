/* P49 to P84 Governance & Admin pages (prototype pages-gov.js #/c/{ISO}/gov/{key}). */
import { Link } from '@inertiajs/react';
import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
    A, B, Bars, btnClass, Card, Chip, Cols, DataTable, Dl, Field, Flag, GradeChip, Ic, inputCls, Kpi, Kpis, Meter, N, Note, STable, StatusChip, TagM, TagP, TagR, TagS, Ticks,
    useMoney, useToast, type Col,
} from '@/Components/Industries/Kit';
import { cHref, NoPack, StateChip } from '@/Components/CountryHub/Layout';
import { HubAfricaMap } from '@/Components/CountryHub/Maps';
import { CorrChip, corUrl, LEDG, type Pair, type Totals } from '@/Components/CountryHub/Corridors';
import { GBY, GovPage, govHref } from '@/Components/CountryHub/Gov';
import type { CountryBase, CountryOption, HubCountry, Row } from '@/types/countryHub';
import type { ServerTableData } from '@/types/industries';

interface CRow {
    iso3: string; iso2: string; slug: string; name: string; region: string; state: string; wave: string | null; packStatus: string | null; pack: string | null; rcs: number;
    capital: string | null; currency: string | null; languages: string | null; recs: string | null; pop: number | null; gdp: number | null; priority: string;
}
interface Block { t: string; s?: string; x?: string; rows?: string[][] }
interface PairRow { from: string; to: string; st: string; items: number; conf: number; type: string }
interface ResRow { a: string; b: string; to: string; st: string; conf: number; days: string }
interface Answers { priority: string; opps: string; exposed: string; gaps: string; contradictions: string; older: string; noEvidence: string; corridors: string; cost: Totals }
interface GovData {
    rows?: Row[] | CRow[] | ResRow[] | [string, number][];
    fresh?: Row[]; years?: [string, number][]; blocks?: Block[]; gaps?: Row[]; closed?: Row[]; edition?: Row[]; verify?: Row[]; validator?: Row[]; inst?: Row[];
    cnt?: Record<string, number>; packs?: number; nopack?: number; conflicts?: number; regchange?: number; sellable?: number; map?: (CountryOption & { pack: string | null; rcs: number })[];
    table?: ServerTableData<PairRow>; pair?: Pair; tot?: Totals; answers?: Answers;
}
interface Props { base: CountryBase; k: string; data: GovData | null }

const s = (v: unknown) => String(v ?? '');
const col = (k: string, l = k, o: Partial<Col<Row>> = {}): Col<Row> => ({ k, l, ...o });
const statusCol = (k: string) => col(k, k, { r: (x) => <StatusChip s={x[k]} /> });

function Blocks({ bl }: { bl: Block[] }) {
    return (
        <div className="space-y-2 text-[0.85rem]">
            {bl.map((b, i) => {
                if (b.t === 'tbl') { const r = b.rows ?? []; return r.length ? <STable key={i} compact head={r[0]} rows={r.slice(1)} /> : null; }
                if (b.s === 'Title') return <h1 key={i} className="text-[1.6rem] font-bold">{b.x}</h1>;
                if (b.s === 'Subtitle') return <p key={i} className="text-ink-400">{b.x}</p>;
                if (b.s === 'Heading 1') return <h2 key={i} className="text-[1.2rem] font-bold text-ink-900">{b.x}</h2>;
                if (b.s === 'Heading 2') return <h3 key={i} className="text-[1rem] font-semibold text-ink-900">{b.x}</h3>;
                if (b.s === 'Block Text') return <Note key={i}>{b.x}</Note>;
                return <p key={i}>{b.x}</p>;
            })}
        </div>
    );
}

const PROMPTS: Record<string, [string, string[]]> = {
    analyst: ['Country Analyst Agent', ['Which countries have the highest activation priority?', 'What are Botswana’s top opportunities?', 'Which Botswana sectors are most exposed to the diamond downturn?', 'What data gaps block Botswana pricing?']],
    corragent: ['Corridor Agent', ['Which corridors from Botswana have evidence?', 'How many pairs have no evidence?', 'What does activating Botswana → South Africa cost (model basis)?']],
    absenceagent: ['Honest Absence Agent', ['What does TBCA not know about Botswana?', 'Which contradictions are open?', 'Which facts are older than 36 months?']],
};

/** Register-backed agent (prototype agent()): canned questions and a free-text box, answers from the loaded registers. */
function Agent({ name, prompts, ans }: { name: string; prompts: string[]; ans: Answers }) {
    const money = useMoney();
    const [log, setLog] = useState<[string, string][]>([]);
    const [q, setQ] = useState('');
    const box = useRef<HTMLDivElement>(null);
    const answer = (text: string) => {
        const l = text.toLowerCase();
        if (/priority/.test(l)) return ans.priority;
        if (/opportunit/.test(l)) return ans.opps;
        if (/exposed|downturn/.test(l)) return ans.exposed;
        if (/gap|not know|block/.test(l)) return ans.gaps;
        if (/contradiction/.test(l)) return ans.contradictions;
        if (/older|36/.test(l)) return ans.older;
        if (/no evidence/.test(l)) return ans.noEvidence;
        if (/cost/.test(l)) return `Model-basis six-ledger estimate for BWA → ZAF: ${LEDG.map(([x]) => `${x} ${money(ans.cost[x])}`).join(' · ')}. Ledgers are never combined into a price.`;
        if (/corridor/.test(l)) return ans.corridors;
        return 'I answer from the verified registers only. Try one of the suggested questions.';
    };
    const ask = (text: string) => {
        setLog((x) => [...x, [text, answer(text)]]);
        window.setTimeout(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, 0);
    };
    const submit = (e: FormEvent) => { e.preventDefault(); if (q.trim()) { ask(q.trim()); setQ(''); } };
    return (
        <Card title={<>{name} <Chip t="Online" tone="ok" /></>} icon="spark">
            <p className="text-[0.82rem]">Hello Admin, I&apos;m your {name}. I answer from the loaded registers and say so when data is absent. AI insights must be reviewed by a human.</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
                {prompts.map((p) => <button key={p} type="button" onClick={() => ask(p)} className="rounded-full border border-parchment-400 bg-white px-2.5 py-1 text-left text-[0.74rem] text-ink-600 hover:border-gold-400">{p}</button>)}
            </div>
            <div ref={box} className="mt-2.5 max-h-[360px] overflow-auto" aria-live="polite">
                {log.map(([qq, a], i) => (
                    <div key={i}>
                        <div className="my-1.5 rounded-r-[4px] border-l-[3px] border-controlled-500 bg-controlled-50 px-3 py-2 text-[0.82rem]"><b>You:</b> {qq}</div>
                        <Note className="my-1.5"><b>{name}:</b> {a}</Note>
                    </div>
                ))}
            </div>
            <form onSubmit={submit} className="mt-2.5 flex gap-2">
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask the agent…" aria-label="Ask the agent" className={inputCls} />
                <button className={btnClass('pri')} type="submit">Ask</button>
            </form>
        </Card>
    );
}

export default function Page({ base, k, data }: Props) {
    const { c } = base;
    const isB = c.isBW;
    const money = useMoney();
    const toast = useToast();
    const [signed, setSigned] = useState(false);
    const d = data ?? {};
    const rows = (d.rows ?? []) as Row[];
    const crows = (d.rows ?? []) as CRow[];
    const np = (what: string) => <NoPack c={c} what={what} pageKey="gov" />;
    const ctryName = (x: CRow) => <span className="whitespace-nowrap"><Flag iso2={x.iso2} /> {x.name}</span>;

    const pages: Record<string, () => ReactNode> = {
        activation: () => (
            <>
                <Card title="Activation Ledger — 54 country objects" icon="layers" sub={<TagS s="I2_Country_Activation" />}>
                    <DataTable<CRow> name="activation_ledger" rows={crows} filters={['region', 'state', 'wave']} cols={[
                        { k: 'name', l: 'Country', r: (x) => <span className="whitespace-nowrap"><Flag iso2={x.iso2} /> <Link className="text-controlled-700 hover:underline" href={cHref(x)}>{x.name}</Link></span> },
                        { k: 'region', l: 'region' }, { k: 'state', l: 'State', r: (x) => <StateChip c={x} /> }, { k: 'wave', l: 'Wave [PROPOSED]' }, { k: 'packStatus', l: 'Pack status' },
                        { k: 'pack', l: 'Pack' }, { k: 'rcs', l: 'RCS %', num: true }, { k: 'gate', l: 'Readiness gate', v: () => 'Passed', r: () => <StatusChip s="Passed" /> },
                    ]} />
                </Card>
                <Card title={`${c.name} — activation detail`} icon="file">
                    <Dl rows={[['State', <StateChip key="s" c={c} />], ['Wave', s(c.wave)], ['Pack', c.pack || '—'], ['RCS', `${c.rcs} %`], ['Data validator', isB ? '30 / 30 pass (CPDS-1.2)' : '—'], ['Commercial permission', 'Service-by-service'], ['Board authorisation', `Approved ${base.actDate}`]]} />
                </Card>
            </>
        ),
        manifest: () => (isB ? (
            <Card title="Evidence manifest — 90 sources" icon="db">
                <DataTable name="BW_Sources" rows={rows} filters={['Grade']} cols={[col('Source', 'Source', { clip: true }), col('Date'), col('Fact IDs', 'Fact IDs', { clip: true }), col('Grade', 'Grade', { r: (x) => <GradeChip g={x.Grade} /> }),
                    col('URL', 'URL', { r: (x) => <a href={s(x.URL)} target="_blank" rel="noopener" aria-label={`Open source: ${s(x.Source)}`} className="text-controlled-700"><Ic n="ext" /></a> })]} />
            </Card>
        ) : np('Evidence manifest')),
        freshness: () => (isB ? (
            <>
                <Card title="Freshness rules"><STable head={['Data class', 'Refresh', 'Display rule']} rows={(d.fresh ?? []).map((r) => [s(r['Data class']), s(r.Refresh), s(r['Display rule'])])} /></Card>
                <Card title="Fact dates by year" icon="clock"><Bars rows={(d.years ?? []).map(([y, n]) => ({ label: y, value: n }))} /></Card>
            </>
        ) : np('Source & freshness register')),
        contradictions: () => (isB ? (
            <Card title="Contradiction register (20)" icon="alert">
                <DataTable name="BW_Conflicts" rows={rows} cols={[col('ID'), col('Item'), col('Value A', 'Value A', { clip: true }), col('Value B', 'Value B', { clip: true }), col('Source'), col('Handling')]} />
            </Card>
        ) : np('Contradiction register')),
        licence: () => (isB ? <Card title="Data licences (Annex 3 of the Country Pack)" icon="lock"><Blocks bl={d.blocks ?? []} /></Card> : np('Data licence status')),
        absence: () => (isB ? (
            <>
                <Card title="Open gaps" icon="alert">
                    <DataTable name="BW_DataGaps" rows={d.gaps ?? []} cols={[col('ID'), col('Missing data'), col('Needed for'), col('Holder'), statusCol('Priority'), col('How to close'), col('Days')]} />
                </Card>
                <Card title="Closed gaps"><STable head={['ID', 'Gap', 'How closed', 'Status']} rows={(d.closed ?? []).map((r) => [s(r.ID), s(r.Gap), s(r['How closed']), <StatusChip key="s" s={r.Status} />])} /></Card>
            </>
        ) : np('Absence register')),
        changes: () => (isB ? (
            <>
                <Card title="Edition log"><STable head={['Edition', 'What it added', 'Binding constraint']} rows={(d.edition ?? []).map((r) => [s(r.Edition), s(r['What it added']), s(r['Binding constraint'])])} /></Card>
                <Card title="Verification log"><DataTable name="BW_VerifyLog" rows={d.verify ?? []} cols={[col('Fact'), col('Sector'), col('Finding', 'Finding', { clip: true }), statusCol('Result'), col('Action')]} /></Card>
            </>
        ) : np('Change history')),
        sovereign: () => (
            <>
                <Kpis>
                    <Kpi l="Activation state" v={c.state} icon="shield" />
                    <Kpi l="Permission state" v="Resolved" icon="check" />
                    <Kpi l="Confidence level" v={isB ? 'High (76 % G3)' : c.isZA ? 'High (92 %)' : '—'} icon="chart" />
                    <Kpi l="Resolver" v="TBCA" icon="users" />
                </Kpis>
                <Card title="Sovereign Workspace" icon="shield">
                    <Cols n={4}>
                        {[['Start Engagement', 'Initiate a new sovereign engagement with TBCA.', 'intake'], ['Upload Evidence', 'Submit evidence and source documents for review.', 'sovreview'], ['Conflict Check', 'Run conflict check across partners and engagements.', 'conflict'], ['Independence Declaration', 'Submit or renew your independence statement.', 'independence']].map(([t, dd, kk]) => (
                            <Link key={kk} href={govHref(c, kk)} className="block rounded-[6px] border border-parchment-400 bg-white p-4 hover:border-gold-400"><b className="text-ink-900">{t}</b><div className="text-[0.8rem] text-ink-400">{dd}</div></Link>
                        ))}
                    </Cols>
                </Card>
                <Card title="Activation progress" icon="chart">
                    <Bars rows={[{ label: 'Resolver completeness', value: c.rcs, text: `${c.rcs} %` }, { label: 'Evidence current', value: isB ? 76 : c.isZA ? 100 : 0 }, { label: 'Permissions resolved', value: 100 }, { label: 'Commercial availability', value: c.isZA ? 100 : isB ? 60 : 0 }]} />
                </Card>
            </>
        ),
        intake: () => (
            <>
                <Card title="Sovereign engagement intake" icon="file">
                    <div className="grid gap-3 md:grid-cols-2">
                        <Field label="Sovereign entity"><input className={inputCls} placeholder="e.g. Ministry / agency" /></Field>
                        <Field label="Mandate type"><select className={inputCls}><option>Country activation support</option><option>Evidence assurance</option><option>Investment promotion brief</option><option>Corridor readiness</option></select></Field>
                        <Field label="Focal person"><input className={inputCls} /></Field>
                        <Field label="Official email"><input type="email" className={inputCls} /></Field>
                    </div>
                    <Field label="Objectives" className="mt-2"><textarea rows={3} className={`${inputCls} h-auto py-1.5`} /></Field>
                    <B v="pri" className="mt-2.5" onClick={() => toast.show('Sovereign intake is handled by TBCA staff. Contact us to start one.')}>Submit intake →</B>
                </Card>
                {isB && <Card title="Institutions TBCA would engage (BW_Institutions)"><DataTable name="BW_Institutions" size={8} rows={d.inst ?? []} cols={[col('Role'), col('Botswana institution')]} /></Card>}
            </>
        ),
        conflict: () => (
            <>
                <Card title="Conflict disclosure"><STable head={['Check', 'Result']} rows={[['Partner conflicts (30 days)', 'Cleared'], ['Prior engagements with counterparties', 'None declared'], ['Commercial interest in outcome', 'None'], ['Gifts & hospitality register', 'Nil return']].map((r) => [r[0], <StatusChip key="s" s={r[1]} />])} /></Card>
                <Note><TagP /> Operational conflict data appears once a sovereign engagement is opened.</Note>
            </>
        ),
        independence: () => (
            <Card title="Independence statement" icon="shield">
                <p className="text-[0.88rem]">TBCA confirms its evidence-led independence for engagements in {c.name}: no fee depends on a finding; evidence grades are never upgraded on request; contradictions are published, not resolved in a client&apos;s favour; reserved professional services are routed to licensed partners.</p>
                <label className="mt-2 flex items-start gap-2 text-[0.85rem]"><input type="checkbox" className="mt-0.5 size-4 accent-gold-600" checked={signed} onChange={(e) => setSigned(e.target.checked)} /> I confirm and sign this statement for the current year.</label>
            </Card>
        ),
        sovreview: () => (isB ? (
            <>
                <Card title="Sovereign evidence review — verification sample" icon="check"><DataTable name="BW_VerifyLog" rows={d.verify ?? []} cols={[col('Fact'), col('Sector'), col('Finding', 'Finding', { clip: true }), statusCol('Result'), col('Action')]} /></Card>
                <Card title="Validator"><DataTable name="BW_Validator" size={10} rows={d.validator ?? []} cols={[col('Kind'), col('Check'), statusCol('Result'), col('Detail')]} /></Card>
            </>
        ) : np('Sovereign evidence review')),
        panel: () => (isB ? (
            <Card title="Partner & review panel — institutions and permit issuers"><DataTable name="BW_Permits" rows={rows} cols={[col('Sector'), col('Permits'), col('Issuer'), col('Typical time')]} /></Card>
        ) : np('Partner & review panel')),
        release: () => (
            <Card title="Deliverable release gate" icon="check">
                <STable head={['Gate', 'Status']} rows={[['Evidence annex attached', 'Complete'], ['Contradictions disclosed', 'Complete'], ['Human SME review', 'Complete'], ['Independence statement signed', 'Pending'], ['Client acceptance', 'Pending']].map((r) => [r[0], <StatusChip key="s" s={r[1]} />])} />
            </Card>
        ),
        sovclose: () => (
            <Card title="Sovereign engagement closure">
                <Ticks items={['Deliverables released and accepted', 'Evidence archived for 7 years', 'Lessons logged to the edition change log', 'Next activation wave proposed']} />
                <A className="mt-2" href={cHref(c, 'closure')}>Commercial closure page →</A>
            </Card>
        ),
        tower: () => (
            <>
                <Kpis>
                    <Kpi l="Total countries" v={54} s="100 % of target" icon="globe" />
                    <Kpi l="Activated" v={d.cnt?.Activated ?? 0} icon="check" />
                    <Kpi l="Packs issued" v={d.packs ?? 0} s="Botswana fully loaded" icon="book" />
                    <Kpi l="Shell" v={0} s="None" icon="layers" />
                    <Kpi l="Degraded / Suspended / Restricted" v={0} icon="alert" />
                    <Kpi l="Sellable corridors" v={N(d.sellable ?? 0)} s="of 2,862" icon="swap" />
                </Kpis>
                <Cols n={2}>
                    <Card title="Activation & Availability Overview" icon="map">
                        <HubAfricaMap countries={d.map ?? []} dark={false} label="Africa map coloured by country availability state"
                            tip={(iso, name) => { const x = d.map?.find((m) => m.iso3 === iso); return `${name}\nActivated · RCS ${x?.rcs ?? 100}%\n${x?.region ?? ''} Africa${x?.pack ? ` · pack ${x.pack}` : ''}`; }} />
                    </Card>
                    <Card title="Alerts & Exceptions" icon="bell">
                        <STable head={['Alert', 'Count']} rows={[['Evidence updates pending (BW gaps open)', d.gaps ?? 0], ['Contradictions labelled', d.conflicts ?? 0], ['Regulatory changes tracked', d.regchange ?? 0], ['Activated countries awaiting full pack', d.nopack ?? 0]].map((r) => [r[0] as string, <b key="b">{String(r[1])}</b>])} />
                        <div className="my-3 border-t border-parchment-300" />
                        <div className="grid gap-1.5">{['objects', 'states', 'rcs', 'workbench', 'corrresolver', 'bias'].map((kk) => <A key={kk} block href={govHref(c, kk)}>{GBY[kk].n} →</A>)}</div>
                    </Card>
                </Cols>
            </>
        ),
        objects: () => (
            <Card title="Country objects (54)" icon="db" sub={<><TagR /> attributes; state &amp; wave <TagS s="I2_Country_Activation" /></>}>
                <DataTable<CRow> name="country_objects" rows={crows} filters={['region', 'state', 'currency']} cols={[
                    { k: 'iso3', l: 'ISO3' }, { k: 'name', l: 'Country', r: ctryName }, { k: 'region', l: 'region' }, { k: 'capital', l: 'capital' }, { k: 'currency', l: 'currency' },
                    { k: 'languages', l: 'Languages', clip: true }, { k: 'recs', l: 'RECs', clip: true }, { k: 'pop', l: 'Pop (m)', num: true }, { k: 'gdp', l: 'GDP US$ bn', num: true },
                    { k: 'state', l: 'State', r: (x) => <StateChip c={x} /> },
                ]} />
            </Card>
        ),
        rcs: () => (
            <Card title="Resolver completeness by country" icon="check" sub={<>Shell RCS <TagM /></>}>
                <DataTable<CRow> name="rcs_console" rows={crows} sort={2} dir={-1} cols={[
                    { k: 'name', l: 'Country', r: (x) => <span className="whitespace-nowrap"><Flag iso2={x.iso2} /> <Link className="text-controlled-700 hover:underline" href={cHref(x, 'resolver')}>{x.name}</Link></span> },
                    { k: 'region', l: 'region' },
                    { k: 'rcs', l: 'RCS', num: true, v: (x) => x.rcs, r: (x) => <div className="flex min-w-[120px] items-center gap-2"><Meter p={x.rcs} tone={x.rcs >= 100 ? 'ok' : 'warn'} /><span className="text-[0.7rem]">{x.rcs}%</span></div> },
                    { k: 'hb', l: 'Hard blocks', v: () => 0 }, { k: 'state', l: 'State', r: (x) => <StateChip c={x} /> },
                ]} />
            </Card>
        ),
        states: () => (
            <>
                <Card title="Availability states & allowed transitions">
                    <STable head={['From', 'To', 'Gate']} rows={[['Shell', 'Activated', `Completed for all 54 countries on ${base.actDate}`], ['Activated', 'Activated + full pack', 'CPDS-1.2 validator 30/30 (Botswana done)'], ['Activated', 'Degraded', 'Evidence stale or partner capacity below threshold'], ['Activated', 'Suspended', 'Sanctions, legal or payment-rail failure'], ['Any', 'Restricted', 'Prohibition or regulator instruction']]} />
                </Card>
                <Card title="Current states" icon="chart"><Bars rows={Object.entries(d.cnt ?? {}).map(([st, n]) => ({ label: st, value: n }))} /></Card>
            </>
        ),
        taxadmin: () => (
            <Card title="Tax & statutory rules register" icon="file">
                <STable head={['Country', 'VAT', 'CIT', 'Source']} rows={[['Botswana', '14 %', '22 % (increase proposed)', 'BW-MAC-F18'], ['South Africa', '15 %', '27 %', 'Mock-up P11'], ['Other 52', '—', '—', <TagP key="p" />]]} />
            </Card>
        ),
        payadmin: () => (
            <Card title="Payment & liquidity — rails by country" icon="cash">
                <STable head={['Country', 'Base currency', 'FX regime', 'Rails', 'Liquidity']} rows={[
                    ['Botswana', 'BWP', 'Crawling peg 50 % ZAR / 50 % SDR (BW-MAC-F11)', <span key="r">EFT, card, mobile money <TagR /></span>, 'Reserves US$4.16 bn (BW-MAC-F12)'],
                    ['South Africa', 'ZAR', 'Free float', 'EFT, Instant EFT, card, BNPL', 'Deep'], ['Other 52', '—', '—', <TagP key="p" />, '—'],
                ]} />
            </Card>
        ),
        partneradmin: () => (isB ? (
            <Card title="Partner capacity — institutions by role"><DataTable name="BW_Institutions" rows={d.inst ?? []} cols={[col('Role'), col('Botswana institution')]} /></Card>
        ) : np('Partner capacity')),
        bias: () => (
            <>
                <Card title="Unmet demand & bias console" icon="users">
                    <p className="mb-2 text-[0.82rem]">Demand signals are bias-corrected: the pack refuses rotation-manufactured diversity and reports concentration both ways (46 % vs 19 %).</p>
                    <Bars rows={(d.rows as [string, number][] | undefined ?? []).map(([t, n]) => ({ label: t, value: n, text: `${n} non-viable` }))} />
                </Card>
                <div><A href={cHref(c, 'waitlist')}>Waitlist &amp; unmet demand →</A></div>
            </>
        ),
        workbench: () => (
            <Card title="Activation investment workbench — priority by wave" icon="cash" sub={<><TagM /> priority = state, pack and proposed wave</>}>
                <DataTable<CRow> name="activation_workbench" rows={crows} filters={['region', 'wave']} cols={[
                    { k: 'name', l: 'Country', r: ctryName }, { k: 'region', l: 'region' }, { k: 'wave', l: 'wave' },
                    { k: 'pr', l: 'Activation priority', v: (x) => x.priority, r: (x) => <StatusChip s={x.priority} /> },
                    { k: 'gdp', l: 'GDP US$ bn ', num: true }, { k: 'pop', l: 'Pop (m)', num: true }, { k: 'pack', l: 'Pack' },
                ]} />
            </Card>
        ),
        corrobj: () => (
            <Card title="Corridor objects (2,862)" icon="swap">
                {d.table && <DataTable<PairRow> name="corridor_objects" server={d.table} filters={['st', 'type']} cols={[
                    { k: 'from', l: 'From' }, { k: 'to', l: 'To' }, { k: 'st', l: 'Status', r: (x) => <CorrChip s={x.st} /> }, { k: 'items', l: 'Items', num: true }, { k: 'conf', l: 'Confidence', num: true }, { k: 'type', l: 'Type' },
                ]} />}
            </Card>
        ),
        corrresolver: () => (
            <Card title={`Corridor pair resolver console — from ${c.name}`} icon="check">
                <DataTable<ResRow> name={`pair_resolver_${c.iso3}`} rows={(d.rows ?? []) as ResRow[]} sort={2} dir={-1} cols={[
                    { k: 'b', l: 'To', v: (x) => x.to, r: (x) => <Link className="text-controlled-700 hover:underline" href={corUrl('detail', x.a, x.b)}>{x.to}</Link> },
                    { k: 'st', l: 'Status', r: (x) => <CorrChip s={x.st} /> }, { k: 'conf', l: 'Confidence', num: true }, { k: 'days', l: 'Time to activate' },
                ]} />
            </Card>
        ),
        correcon: () => {
            const p = d.pair as Pair, t = d.tot ?? {};
            return (
                <Card title={`Corridor economics — ${p.A.name} → ${p.B.name}`} icon="cash">
                    <Bars rows={LEDG.map(([l, n]) => ({ label: `${l} · ${n}`, value: t[l], text: money(t[l]) }))} />
                    <A className="mt-3" href={corUrl('fees', p.a, p.b)}>Fee schedule comparison →</A>
                </Card>
            );
        },
        l9intake: () => (
            <>
                <Card title="Layer 9 observation intake" icon="pin">
                    <p className="mb-2 text-[0.82rem]">Field observations (scouts, partners, clients) enter as Layer 9 — never promoted to evidence until reviewed for source and anonymity.</p>
                    <div className="grid gap-3 md:grid-cols-2">
                        <Field label="Observation"><textarea rows={3} className={`${inputCls} h-auto py-1.5`} /></Field>
                        <Field label="Place"><select className={inputCls}><option>Gaborone</option><option>Francistown</option><option>Kasane</option></select></Field>
                    </div>
                    <B v="pri" className="mt-2" onClick={() => toast.show('Observations are logged by TBCA staff in the admin console.')}>Log observation</B>
                </Card>
                {isB && <Note>Botswana&apos;s 90-day plan pilots scouts on the Ghanzi–Khoemacau copper belt and Kasane–Kazungula (BW_Plan90).</Note>}
            </>
        ),
        l9review: () => (
            <Card title="Promotion & anonymity review" icon="shield">
                <STable head={['Check', 'Rule']} rows={[['Source named or attestable', 'Required for grade ≥ 2'], ['Personal data removed', 'Mandatory'], ['Contradiction with existing fact', 'Logged, both values shown'], ['Promotion', 'Two-person rule']]} />
            </Card>
        ),
        retraction: () => (
            <Card title="Evidence retraction & cascade" icon="alert">
                <p className="mb-2 text-[0.82rem]">If a fact is retracted, every template, lead and page that cites it is re-scored. Example cascade for <b>BW-TRD-F4</b> (horticulture import restriction):</p>
                {isB && <STable head={['Affected', 'Count']} rows={[['Templates citing the fact', '27 (R-02 templates affected)'], ['Tier A templates', '7'], ['Pages', 'Legal, Risk, Sector AGR, Compliance planner']]} />}
            </Card>
        ),
        uat: () => (
            <>
                <Kpis>
                    <Kpi l="Releases (all)" v={27} icon="layers" />
                    <Kpi l="In UAT" v={3} icon="clock" />
                    <Kpi l="Validator (data)" v="30 / 30" s="BW-1.0" icon="check" />
                    <Kpi l="Route smoke tests" v="All pass" s="This prototype" icon="shield" />
                </Kpis>
                <Card title="Release pipeline" icon="file">
                    <STable head={['Release', 'Version', 'Env', 'Readiness', 'Status']} rows={[['CT-R-027', 'CT-TEB v2.0.1', 'Production', '96 %', 'In Progress'], ['CT-R-026', 'CT-TEB v2.0.1 RC2', 'UAT', '80 %', 'In UAT'], ['CT-PROTO-COUNTRIES', 'MP-COUNTRIES-1.0 prototype', 'Prototype', '100 % routes', 'Released']].map((r) => [r[0], r[1], r[2], r[3], <StatusChip key="s" s={r[4]} />])} />
                </Card>
            </>
        ),
    };
    for (const key of Object.keys(PROMPTS)) {
        const [name, prompts] = PROMPTS[key];
        pages[key] = () => (d.answers ? <Agent name={name} prompts={prompts} ans={d.answers} /> : null);
    }

    const body = pages[k] ? pages[k]() : <Card title="Not found">{k}</Card>;
    return (
        <GovPage c={c as HubCountry} k={k}>
            {body}
            {toast.node}
        </GovPage>
    );
}
