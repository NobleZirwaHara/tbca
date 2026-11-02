/* AIIM-018 Source and Evidence Preview (prototype #evidence): the selected source, then the Botswana evidence base. */
import { Link, router, usePage } from '@inertiajs/react';
import { FileText, X } from 'lucide-react';
import { useEffect } from 'react';
import { FeeButton, ListToggle } from '@/Components/Aiim/Actions';
import {
    Btn, BuyBtn, Chip, CtaBand, DataMeta, Dl, DocTable, DonutBlock, FactCtx, Frame, Freshness, GradePill, Hero, P, PackLoading, Panel, Rich, Section, SheetTable, StatusPill, SvcRail,
    type Block, type Row, type Sheet, type Svc,
} from '@/Components/Aiim/ProtoExplore';
import type { SharedProps } from '@/types';
import type { AiimPageProps, SourceItem } from '@/types/aiim';

interface Evidence {
    grades: Record<'1' | '2' | '3', number>;
    interpretation: Block['rows'] | null;
    facts: Sheet; sources: Sheet; verify: Sheet; validator: Sheet; cpds: Sheet; wx: Sheet;
    pack: Svc | null; rail: Svc[];
}
type FactDetail = { fact: Row; verify: Row | null; conflicts: Row[] } | { missing: string };

interface Props extends AiimPageProps {
    source: SourceItem;
    access: { premium: boolean; entitled: boolean; status: string; level: string; premiumContent: string };
    usedBy: { projects: { slug: string; name: string }[] };
    saved: string[];
    evidence: Evidence | null;
    fact: FactDetail | null;
}

const lnk = 'text-controlled-700 underline decoration-dotted underline-offset-2 hover:text-gold-700';

function setFact(id: string | null) {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('fact', id); else url.searchParams.delete('fact');
    router.get(url.pathname + url.search, {}, { only: ['fact'], preserveState: true, preserveScroll: true, replace: true });
}

function FactDrawer({ d, rail }: { d: FactDetail; rail: Svc[] }) {
    useEffect(() => {
        const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setFact(null); };
        window.addEventListener('keydown', k);
        return () => window.removeEventListener('keydown', k);
    }, []);
    const f = 'fact' in d ? d.fact : null;
    const url = String(f?.URL ?? '');
    return (
        <div className="fixed inset-0 z-[80] flex justify-end bg-ink-950/50" onClick={(e) => { if (e.target === e.currentTarget) setFact(null); }}>
            <aside role="dialog" aria-modal="true" aria-label={f ? String(f['Fact ID']) : 'Fact'} className="h-full w-full max-w-[520px] overflow-y-auto bg-parchment-100 shadow-xl">
                <div className="flex items-center justify-between border-b border-parchment-400 bg-white px-5 py-3">
                    <h3 className="font-mono font-bold text-gold-700">{f ? String(f['Fact ID']) : 'missing' in d ? d.missing : ''}</h3>
                    <button type="button" aria-label="Close" onClick={() => setFact(null)} className="text-ink-500 hover:text-ink-900"><X className="size-5" /></button>
                </div>
                <div className="grid gap-4 p-5">
                    {!f ? <p className="text-ink-500">This reference is cited in the pack but the fact row is not in BW_Facts or BW_Macro.</p> : (
                        <>
                            <div className="flex flex-wrap gap-1.5"><GradePill g={f.Grade} /><Chip>{f['Sector name'] ?? f.Sector}</Chip><Chip>{f.Date}</Chip></div>
                            <h2 className="text-[1.2rem] font-bold text-ink-900">{f.Fact}</h2>
                            <p className="text-[0.95rem]"><Rich t={f.Value} /></p>
                            <Dl rows={[['Source', String(f.Source ?? '')], ['Date', String(f.Date ?? '')], ['URL', url.startsWith('http') ? <a key="u" href={url} target="_blank" rel="noopener" className={`${lnk} break-all`}>{url}</a> : url], ['Grade', `${f.Grade}${Number(f.Grade) === 3 ? ' — official source' : ''}`], ['Freshness', <Freshness key="f" d={f.Date} />]]} />
                            {'verify' in d && d.verify && <Panel title="Independent re-verification (seed 2026)"><Dl rows={[['Finding', <Rich key="f" t={d.verify.Finding} />], ['Result', <StatusPill key="r" s={d.verify.Result} />], ['Action', String(d.verify.Action ?? '')]]} /></Panel>}
                            {'conflicts' in d && d.conflicts.length > 0 && <Panel title="Linked conflicts">{d.conflicts.map((c) => <p key={String(c.ID)} className="text-[0.84rem]"><b className="font-mono">{c.ID}</b> {c.Item}: {c['Value A']} vs {c['Value B']} — <i>{c.Handling}</i></p>)}</Panel>}
                        </>
                    )}
                    <SvcRail items={rail.slice(0, 4)} title="Evidence services" />
                </div>
            </aside>
        </div>
    );
}

export default function Source({ source, access, usedBy, saved, evidence: ev, fact }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const isPack = source.code === 'SRC-TBCA-BW-PACK-1.0';
    const g = ev?.grades ?? { '1': 0, '2': 0, '3': 0 };
    const segs = [{ n: 'Grade 3', v: g['3'], c: '#1f7a4c' }, { n: 'Grade 2', v: g['2'], c: '#c96a12' }, { n: 'Grade 1', v: g['1'], c: '#b23a2c' }];
    const share = Math.round((100 * g['3']) / Math.max(1, g['1'] + g['2'] + g['3']));
    const factFmt = { Date: (v: unknown) => <span className="whitespace-nowrap">{String(v ?? '')} <Freshness d={v} /></span> };

    return (
        <FactCtx.Provider value={(id) => setFact(id)}>
            <Frame title="Source & Evidence" crumbs={[{ label: 'Botswana', href: P.cockpit }, { label: 'Sources & Evidence', href: P.evidence }, ...(isPack ? [] : [{ label: source.name }])]}>
                <Hero eyebrow="Source and Evidence Preview" title="129 graded facts, 90 sources, an 18-fact random re-verification and a 30-check validator"
                    lead="Grade 3 = official source (Statistics Botswana, Bank of Botswana, ministries, Parliament); grade 2 = market data or reputable media; grade 1 = other. Tier A requires a fact no older than 18 months."
                    right={ev?.pack ? <BuyBtn svc={ev.pack} ctx="Botswana country source pack" tone="gold"><FileText className="size-3.5" /> Country source pack</BuyBtn> : undefined}
                    meta={<DataMeta />} />

                <Panel className="mt-4" title={<>Selected source <small className="font-normal text-ink-500">{source.code}</small></>}
                    right={<div className="flex flex-wrap gap-2"><ListToggle list="saved" type="source" itemKey={source.code} saved={saved} /><ListToggle list="watchlist" type="source" itemKey={source.code} saved={saved} /><FeeButton type="source" itemKey={source.code} /></div>}>
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                        <div>
                            <h2 className="text-[1.15rem] font-bold text-ink-900">{source.name}</h2>
                            <p className="mt-1 text-[0.85rem] text-ink-600">{source.provider}{source.coverage ? ` · ${source.coverage}` : ''}</p>
                            {source.profile?.summary && <p className="mt-2 text-[0.85rem] text-ink-700">{String(source.profile.summary)}</p>}
                            {usedBy.projects.length > 0 && <p className="mt-2 text-[0.8rem] text-ink-600">Used by: {usedBy.projects.map((p, i) => <span key={p.slug}>{i > 0 && ', '}<Link href={P.project(p.slug)} className={lnk}>{p.name}</Link></span>)}</p>}
                        </div>
                        <Dl rows={[['Category', source.category], ['Source tier', `${source.tier} · ${source.tierName}`], ['Confidence', `${source.confidence}% · grade ${source.grade.grade}`], ['Verification', source.verification], ['Updated', source.updated ?? '—'], ['Access', `${access.status} · ${access.level}${access.premium ? ` · premium ${access.premiumContent.toLowerCase()}` : ''}`]]} />
                    </div>
                    {!auth.user && <p className="mt-3 text-[0.78rem] text-ink-500">Sign in to save or watch this source.</p>}
                </Panel>

                {!ev ? <div className="mt-4"><PackLoading country="Botswana" what="The graded fact base, sources and validator" /></div> : (
                    <>
                        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                            <Panel title={`Grade mix (${ev.facts.rows.length} sector + ${g['1'] + g['2'] + g['3'] - ev.facts.rows.length} macro)`}><DonutBlock segs={segs} center={`${share}%`} sub="grade 3" /></Panel>
                            <Panel title="Interpretation control"><DocTable rows={ev.interpretation} /></Panel>
                        </div>
                        <Section title={`Sector facts — ${ev.facts.rows.length}`} sub="Click an ID for the evidence drawer."><SheetTable sheet={ev.facts} filters={['Sector name', 'Grade']} fmt={factFmt} /></Section>
                        <Section title={`Sources — ${ev.sources.rows.length}`}>
                            <SheetTable sheet={ev.sources} filters={[]} fmt={{ URL: (v) => <a href={String(v)} target="_blank" rel="noopener" className={`${lnk} break-all`}>{String(v).slice(0, 60)}…</a> }} />
                        </Section>
                        <Section title="Verification log (I-5)" sub="Seeded stratified random sample; re-fetched independently on 9 Oct 2026."><SheetTable sheet={ev.verify} filters={[]} size={25} /></Section>
                        <Section title="CPDS-1.2 validator (K-2) — 30/30 pass"><SheetTable sheet={ev.validator} filters={[]} size={50} /></Section>
                        <Section title="CPDS-1.2 Country-Pack Data Standard (K-6)"><SheetTable sheet={ev.cpds} filters={[]} size={25} /></Section>
                        <Section title="Issue 2.0 worked-example sources"><SheetTable sheet={ev.wx} filters={[]} size={25} /></Section>
                        <SvcRail items={ev.rail} />
                    </>
                )}
                <div className="mt-4"><Btn href="/aiim/methodology">Methodology and grading rules</Btn></div>
                <CtaBand />
            </Frame>
            {fact && <FactDrawer d={fact} rail={ev?.rail ?? []} />}
        </FactCtx.Provider>
    );
}
