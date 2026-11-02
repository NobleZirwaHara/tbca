/* P03 Country Profile (prototype pages-profile.js #/c/{ISO}/profile). */
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { A, B, Card, Chip, Cols, Dl, Flag, Ic, Kpi, Kpis, N, Note, STable, StatusChip, TagP, TagR, TagS, Tabs, useToast } from '@/Components/Industries/Kit';
import { BW, cHref, CountryPage, CountrySelect, NoPack, saveCountryState, SprintShelf, StateChip } from '@/Components/CountryHub/Layout';
import { BenchCard, type ProfileProps } from '@/Components/CountryHub/Profile';
import type { HubShelf, Row } from '@/types/countryHub';

interface Props extends ProfileProps {
    tab: string;
    summary: { facts: number | string | null; g3: number | string | null; macro: number | string | null; verified: number | string | null; validator: number | string | null } | null;
    updates: Row[];
    live: boolean;
    bench: [string, string][] | null;
    /** The visitor's Saved Items (ISO3 codes and other saved IDs). */
    saved: string[];
    shelf: HubShelf;
}

const TABS: [string, string][] = [['overview', 'Overview'], ['availability', 'Availability'], ['evidence', 'Evidence'], ['services', 'Services'], ['payments', 'Payments'], ['compliance', 'Compliance']];
const TABPAGE: Record<string, string> = { overview: 'profile', availability: 'availability', evidence: 'evidence', services: 'catalogue', payments: 'payments', compliance: 'legal' };

export default function Profile({ base, summary, updates, live, bench, saved, shelf }: Props) {
    const { c, countries, actDate } = base;
    const bw = c.isBW, za = c.isZA;
    const toast = useToast();
    const [list, setList] = useState<string[]>(saved);

    const strip: [string, string, string][] = bw
        ? [['Real GDP Q2 2026', '+8.7 % y/y', 'BW-MAC-F3'], ['Inflation Aug 2026', '9.3 %', 'BW-MAC-F6'], ['Policy rate (MoPR)', '5.5 %', 'BW-MAC-F8'], ['Pula per US$', '13.84', 'BW-MAC-F9'], ['Sovereign rating', 'BBB- (neg)', 'BW-MAC-F27'], ['Unemployment', '21.0 %', 'BW-MAC-F16'], ['Population (Census 2022)', '2,359,609', 'BW-MAC-F17'], ['Diamonds share of exports', '72.6 %', 'BW-TRD-F2']]
        : za
            ? [['Inflation (latest)', '4.4 %', 'BW_Benchmark'], ['Policy rate', '7.25 %', 'BW_Benchmark'], ['Growth 2025', '1.1 %', 'BW_Benchmark'], ['Unemployment', '33.6 %', 'BW_Benchmark'], ['VAT', '15 %', 'Mock P11'], ['Corporate tax', '27 %', 'Mock P11']]
            : [['Capital', c.capital ?? '', 'Reference'], ['Currency', c.currency ?? '', 'Reference'], ['Population (m, 2024)', N(c.pop, 1), 'Reference'], ['GDP (US$ bn, 2024)', N(c.gdp), 'Reference'], ['Landlocked', c.landlocked ? 'Yes' : 'No', 'Reference'], ['RECs', c.recs || '—', 'Reference']];

    const access: [string, string, boolean][] = [['Country Profile (this page)', 'profile', true], ['Market Intelligence Hub (18 sectors)', 'sectors', bw], ['Opportunity Scan (321 templates)', 'opps', bw], ['Regulatory & Compliance Check', 'legal', live], ['Partner & Network Connection', 'partners', live], ['Risk & Political Assessment', 'risk', bw], ['Import & Export Heat Maps', 'trade', true], ['Where to land (16 units · 83 towns)', 'landing', bw]];

    /* Prototype data-save: add the country to the visitor's Saved Items (CountryState "saved"). */
    const save = () => {
        if (!list.includes(c.iso3)) {
            const next = [...list, c.iso3];
            setList(next);
            void saveCountryState('saved', next);
        }
        toast.show('Saved to Saved Items');
    };

    return (
        <CountryPage base={base} pageKey="profile">
            <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1 basis-[18rem]">
                    <div className="text-[0.72rem] font-semibold tracking-[0.14em] text-gold-700 uppercase">Country Profile &amp; Planning · Mock-up P03</div>
                    <h1 className="mt-1 text-[1.6rem] leading-tight font-bold text-ink-900 sm:text-[1.85rem]">Country Profile</h1>
                </div>
                <div className="flex flex-wrap gap-2">
                    <A v="yellow" href={cHref(c, 'trade')} className="min-h-[42px] text-[0.95rem]"><Ic n="swap" /> Import and Export</A>
                    <B onClick={save} aria-pressed={list.includes(c.iso3)}><Ic n="star" /> Save</B>
                </div>
            </div>

            <div className="flex flex-wrap items-start gap-4 rounded-[6px] border border-parchment-400 bg-white p-4">
                <Flag iso2={c.iso2} className="text-[3.2rem]" />
                <div className="min-w-[220px] flex-1">
                    <h2 className="text-[1.3rem] font-bold text-ink-900">{c.name}</h2>
                    <div className="text-[0.82rem] text-ink-400">{c.sub}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <StateChip c={c} />
                        {live ? <><Chip t="Evidence Current" tone="ok" /><Chip t="Resolver Complete" tone="ok" /></> : <><Chip t="Evidence not assessed" /><Chip t="Resolver incomplete" tone="warn" /></>}
                        <Chip t="Service-by-service permission applies" tone="gold" />
                    </div>
                    <p className="mt-2 text-[0.85rem] text-ink-600">
                        {za ? 'South Africa was the Phase 1 market and is now one of 54 activated African countries. Commercial availability is service-by-service under Country Resolver permission.'
                            : bw ? 'Botswana is the end-to-end journey country for this prototype: every page below is filled from the BW-1.0 Country Pack and the 62-sheet Deep Registers.'
                                : 'Activated with priced Sprints and the full commercial journey; deep intelligence registers appear as the country pack loads — see Botswana for the complete example.'}
                    </p>
                </div>
                <CountrySelect c={c} countries={countries} pageKey="profile" className="w-full sm:w-64" />
            </div>

            <Kpis>
                <Kpi l="Country State" v={c.state} icon="shield" />
                <Kpi l="Region" v={`${c.region} Africa`} icon="globe" />
                <Kpi l="Resolver Completeness" v={`${c.rcs}%`} icon="check" />
                <Kpi l="Hard Blocks" v={live ? '0' : '—'} icon="alert" />
                <Kpi l="Last Reviewed" v={bw ? '09 Oct 2026' : actDate} icon="clock" />
                <Kpi l="Commercial Actions" v="Controlled by Resolver" icon="lock" />
            </Kpis>

            <Card>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3">
                    {strip.map(([l, v, s]) => (
                        <div key={l} className="min-w-0 p-1">
                            <div className="text-[0.72rem] font-semibold text-ink-400">{l}</div>
                            <div className="text-[1.05rem] leading-tight font-bold text-ink-900">{v}</div>
                            <div className="mt-0.5">{s === 'Reference' ? <TagR /> : <TagS s={s} />}</div>
                        </div>
                    ))}
                </div>
            </Card>

            <Tabs items={TABS} active="overview" hrefFor={(k) => cHref(c, TABPAGE[k])} />

            <Cols n={3}>
                <Card title="Controlled Availability" icon="shield">
                    <p className="mb-2 text-[0.82rem]">Country object is Activated. Service access depends on resolver state and service-by-service permission.{bw ? ' Full country pack BW-1.0 loaded.' : ''}</p>
                    <STable compact head={['Area', 'State']} rows={[
                        ['Advisory Services', live ? <Chip t="Resolver complete" tone="ok" /> : <Chip t="Resolver required" tone="warn" />],
                        ['Reports & Analysis', live ? <Chip t="Available" tone="ok" /> : <Chip t="Resolver required" tone="warn" />],
                        ['Market Intelligence', bw ? <Chip t="Full pack" tone="ok" /> : <Chip t="Controlled access" />],
                    ]} />
                    <p className="mt-2 text-[0.72rem] text-ink-400">Commercial availability is service-by-service and subject to Country Resolver permission.</p>
                </Card>
                <Card title="What You Can Access" icon="check">
                    <ul className="space-y-1 text-[0.85rem]">
                        {access.map(([l, k, ok]) => (
                            <li key={k} className={ok ? 'flex gap-2' : 'flex gap-2 opacity-55'}>
                                <span className="font-bold text-verified-700" aria-hidden="true">✓</span>
                                <span><Link href={cHref(c, k)} className="text-controlled-700 hover:underline">{l}</Link>{!ok && <> <Ic n="lock" className="inline size-3" /></>}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card title="Evidence & Source Quality" icon="db">
                    {bw && summary ? (
                        <Dl rows={[
                            ['Sector facts', <>{summary.facts} <Chip t={`Grade 3: ${summary.g3} %`} tone="ok" /></>], ['Macro facts', summary.macro], ['Verified sources', '90'],
                            ['Random-sample verification', `${summary.verified} facts (≈14 %)`], ['Contradictions handled', '20 (BW_Conflicts)'], ['Validator', `${summary.validator} pass`], ['Review type', <Chip key="r" t="Human-reviewed" tone="ok" />],
                        ]} />
                    ) : za ? (
                        <Dl rows={[['Local data sources', '100+'], ['Freshness', <Chip key="f" t="Current" tone="ok" />], ['Confidence treatment', 'High'], ['Review type', <Chip key="r" t="Human-Reviewed" tone="ok" />], ['Contradiction handling', 'Reconciled'], ['Licence status', <Chip key="l" t="Verified" tone="ok" />]]} />
                    ) : (
                        <p className="text-[0.82rem]"><TagP /> No evidence pack loaded.</p>
                    )}
                </Card>
            </Cols>

            <Cols n={2}>
                <Card title="Professional & Regulatory Boundary" icon="alert">
                    <p className="mb-2 text-[0.82rem]">Regulated, licensed, or partner-routed work is controlled separately and may require specific permits, approvals, or professional engagement.</p>
                    <Note>This profile is discovery only, not authorisation.</Note>
                </Card>
                <Card title="Payments & Commercial Guardrails" icon="cash">
                    <ul className="space-y-1 text-[0.85rem]">{['No price without resolution', 'No unsupported FX conversion', 'Tax treatment resolution required', 'Gateway depends on context'].map((x) => <li key={x} className="flex gap-2"><span className="font-bold text-verified-700" aria-hidden="true">✓</span>{x}</li>)}</ul>
                    <Note className="mt-2 border-risk-500 bg-risk-50"><b>No Resolution, No Price.</b> No overrides. No implied access.</Note>
                </Card>
            </Cols>

            {bw && (
                <Card title="Recent Verified Updates" icon="bell" act={<A sm href={cHref(BW, 'history')}>Change history →</A>}>
                    <STable compact head={['ID', 'Change', 'Instrument', 'Status', 'Impact']} rows={updates.map((r) => [String(r.ID ?? ''), String(r.Change ?? ''), <span key="i" className="text-[0.82rem]">{String(r.Instrument ?? '')}</span>, <StatusChip key="s" s={r.Status} />, String(r.Impact ?? '')])} />
                </Card>
            )}
            {bw && (
                <Card title="Why Botswana is different" icon="book" tone="gold">
                    <p className="text-[0.88rem]">A small, diamond-dependent, well-rated economy hit by a diamond slump, now tightening and opening to citizen-led diversification. Diamonds are about a third of revenue and three-quarters of FX receipts (BW-MAC-F25); GDP fell −2.8 % in 2024 and −0.7 % in 2025 before a +8.7 % rebound in Q2 2026 as diamond mining recovered (BW-MAC-F1–F3).</p>
                    <Cols n={3} className="mt-3">
                        {[['Binding constraint', 'Diamonds + SA dependence + citizen rules', 'BW_Benchmark'], ['Tier A after freshness gate', '26 % (A+ 28 · A 58)', 'BW_Summary'], ['SACU receipts 2026/27', 'P26.79 bn — largest revenue line', 'BW-TRD-F3']].map(([a, b, s]) => (
                            <div key={a} className="rounded-[6px] border border-parchment-400 bg-white p-3">
                                <div className="text-[0.72rem] font-semibold text-ink-400">{a}</div>
                                <div className="text-[1rem] leading-tight font-bold text-ink-900">{b}</div>
                                <div className="text-[0.72rem] text-ink-400">{s}</div>
                            </div>
                        ))}
                    </Cols>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <A href={cHref(BW, 'economy')}>Economy &amp; Macro →</A>
                        <A href={cHref(BW, 'opps')}>Top 30 opportunities →</A>
                        <A href={cHref(BW, 'pack')}>Read the full Country Pack →</A>
                    </div>
                </Card>
            )}
            {!live && <><NoPack c={c} what="Country intelligence" pageKey="profile" /><BenchCard name={c.name} rows={bench} /></>}

            <SprintShelf shelf={shelf} c={c} />
            {toast.node}
        </CountryPage>
    );
}
