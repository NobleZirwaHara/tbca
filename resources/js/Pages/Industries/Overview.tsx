import { Link, router } from '@inertiajs/react';
import { A, ActChip, B, Card, CatChip, Chip, Cols, Flag, Kpi, Kpis, Meter, N, Note, STable, TagM, TagP, Ticks, Tile, TileGrid, fmtM, useMoney, useToast, type Tone } from '@/Components/Industries/Kit';
import { CallButton, IndMap, IndustryPage, Shelf, iHref, scoreCol } from '@/Components/Industries/Layout';
import type { IndustryBase, SprintCardData } from '@/types/industries';

interface Props extends IndustryBase {
    band: [string, Tone];
    families: { fam: string; name: string; w: number; n: number }[];
    diags: SprintCardData[];
    brief: SprintCardData | null;
    counts: { opps: number; bwOpps: number; facts: number };
    keyOpps: [string, string, string][];
    top10: { iso3: string; iso2: string; slug: string; name: string; s: number; e: number; m: number }[];
    map: Record<string, [number, number, number, number]>;
    shelf: SprintCardData[];
    aiimNames: Record<string, string>;
}

export default function Overview(p: Props) {
    const { ind, ctx, countries } = p;
    const c = ctx.country;
    const money = useMoney();
    const toast = useToast();
    const regulated = ind.variant === 'Highly regulated';

    const banner = regulated ? (
        <Card title="Professional gate required" icon="shield" tone="gold">
            <p className="text-[0.88rem]">Most services in {ind.name} require regulated professionals and specialist review. Select your needs to confirm the permission pathway. {N(ind.stats.blocked)} Sprints in this industry's families are <b>restricted or blocked</b> — we show them, explain why, and route you to a licensed partner.</p>
            <div className="mt-3 flex flex-wrap gap-2"><A v="pri" href={iHref(ind, 'partners')}>View professional routes</A><A href={iHref(ind, 'limits')}>Why this industry is controlled</A></div>
        </Card>
    ) : ind.cat === 'Below threshold' ? (
        <Card title="You are viewing an honest, below-threshold overview" icon="alert" tone="gold">
            <p className="text-[0.88rem]">The industry is <b>active</b> in all 54 countries, but we currently have a limited approved catalogue ({N(ind.stats.approved)} approved Sprints, {N(ind.stats.diagnostics)} diagnostics). You can still access diagnostics, sector intelligence and partner introductions — or explore industries with fuller coverage.</p>
            <Cols className="mt-3">
                <div><b>What we can currently do</b><Ticks className="mt-1" items={[<>Industry diagnostics <Chip t="Available" tone="ok" /></>, <>Sector intelligence (AIIM) <Chip t="Available" tone="ok" /></>, <>Partner introduction <Chip t="Available" tone="ok" /></>, <>Project exploration <Chip t="Available" tone="ok" /></>]} /></div>
                <div><b>What we cannot do yet</b><ul className="mt-1 list-disc ps-5 text-[0.82rem]"><li>Full service catalogue not live</li><li>No industry-specific subscriptions</li><li>No benchmark contribution yet</li><li>No regulated outputs released</li></ul></div>
            </Cols>
            <div className="mt-3 flex flex-wrap gap-2"><B onClick={() => toast.show('Industry update requested — we will notify you as the catalogue matures')}>Request industry update</B><A href="/industries/select">Explore other industries</A></div>
        </Card>
    ) : ind.cat === 'Thin' ? (
        <Note>This industry currently has a <b>thin catalogue</b> ({N(ind.stats.approved)} approved Sprints). More diagnostics and services are being added — everything shown is live and priced.</Note>
    ) : null;

    return (
        <IndustryPage base={p} active="overview">
            <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1 basis-[22rem]">
                    <div className="flex flex-wrap gap-1.5"><ActChip /><CatChip cat={ind.cat} />{regulated && <Chip t="Highly regulated" tone="bad" />}</div>
                    <h1 className="mt-2 text-[1.6rem] leading-tight font-bold text-ink-900 sm:text-[1.85rem]">{ind.name}</h1>
                    <p className="mt-1.5 text-[0.9rem] text-ink-500">{ind.desc}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <A v="pri" href={iHref(ind, 'services')}>Explore services for this industry →</A>
                    <A href={iHref(ind, 'diagnostic')}>View diagnostic</A>
                    <CallButton v="default" sm={false}>Speak to TBCA Advisor</CallButton>
                </div>
            </div>
            {banner}
            <Kpis>
                <Kpi l={`Opportunity Score · ${c.name}`} v={<>{N(ctx.score, 1)}<small className="text-[0.7rem] font-normal">/100</small></>} s={<>{p.band[0]} · rank {ctx.rank}/54 <TagM /></>} icon="gauge" />
                <Kpi l="Approved Sprints" v={N(ind.stats.approved)} s={`${N(ind.stats.mapped)} mapped · ${N(ind.stats.sellable)} sellable`} icon="tag" />
                <Kpi l="Diagnostics" v={N(ind.stats.diagnostics)} s="Sector-adapted" icon="check" />
                <Kpi l="Blocked / Restricted" v={N(ind.stats.blocked)} s="Professional boundaries" icon="lock" />
                <Kpi l="Opportunity Templates" v={N(p.counts.opps + p.counts.bwOpps)} s={`I2 register ${p.counts.opps} · BW ${p.counts.bwOpps}`} icon="star" />
                <Kpi l="Graded Facts (BW)" v={N(p.counts.facts)} s={ind.aiim.length ? `AIIM ${ind.aiim.join(', ')}` : 'No AIIM sector mapped'} icon="db" />
            </Kpis>
            <Card title="Priority Service Areas" icon="layers" act={<A sm href={iHref(ind, 'services')}>View all services →</A>}>
                <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                    {p.families.map((f) => (
                        <Tile key={f.fam} href={`${iHref(ind, 'services')}?fam=${f.fam}`} className="min-h-[96px]">
                            <b className="text-[0.88rem]">{f.name}</b>
                            <span className="text-[0.72rem] text-ink-400">{f.w === 3 ? 'Core family' : 'Supporting family'} · {N(f.n)} sellable Sprints</span>
                            <Meter p={f.w * 33} />
                        </Tile>
                    ))}
                </div>
            </Card>
            <Card title="Sub-Industries" icon="tag" sub="Selecting a sub-industry tailors diagnostics, add-ons and routing.">
                <TileGrid>
                    {ind.subs.map((s) => (
                        <Tile key={s.code} on={ctx.sub?.code === s.code} onClick={() => router.get(iHref(ind), { sub: s.code }, { preserveScroll: true })}>
                            <b className="text-[0.88rem]">{s.name}</b>
                            <span className="text-[0.72rem] text-ink-400">{s.desc}</span>
                            <span className="font-mono text-[0.7rem] text-ink-400">{s.code}{s.aiim.length ? ` · AIIM ${s.aiim.join('/')}` : ''}{s.hs.length ? ` · HS groups ${s.hs.length}` : ''}</span>
                        </Tile>
                    ))}
                </TileGrid>
            </Card>
            <Cols>
                <Card title="Relevant Diagnostics" icon="check" act={<A sm href={iHref(ind, 'diagnostic')}>View all</A>}>
                    {p.diags.length ? (
                        <>
                            {p.diags.map((s) => (
                                <div key={s.code} className="flex items-start justify-between gap-3 border-b border-parchment-300 py-2">
                                    <div className="min-w-0"><b className="text-[0.82rem]">{s.name}</b><div className="text-[0.72rem] text-ink-400">{s.code} · {s.cxName}</div></div>
                                    <span className="text-[0.82rem] font-bold whitespace-nowrap">{money(s.ep)}</span>
                                </div>
                            ))}
                            <A v="pri" className="mt-3" href={iHref(ind, 'diagnostic')}>Start a diagnostic</A>
                        </>
                    ) : <p className="text-[0.82rem] text-ink-400">No standalone diagnostic Sprints in the core families yet — the free sector-adapted diagnostic is still available.</p>}
                </Card>
                <Card title="AIIM Sector Intelligence" icon="book">
                    <div className="flex items-center justify-between gap-2"><b>{ind.name} Brief</b><Chip t="Premium" tone="gold" /></div>
                    <p className="my-2 text-[0.82rem]">All 5 AU regions · 54 countries · trends, opportunities, risks, trade flows, investment themes and policy signals. Built from {N(p.counts.facts)} graded Botswana facts, {N(p.counts.opps)} continental opportunity templates and the intra-African trade model.</p>
                    {p.brief && p.brief.priced && <div className="font-bold">{money(p.brief.ep)} <small className="text-[0.72rem] font-normal text-ink-400">· {p.brief.code} {p.brief.name} · ex VAT</small></div>}
                    <A className="mt-2" href={iHref(ind, 'intelligence')}>View brief</A>
                </Card>
            </Cols>
            <Cols>
                <Card title="What Can TBCA Do Now?" icon="check">
                    <Ticks items={['Provide industry-specific diagnostics', 'Share sector intelligence and indicative benchmarks', 'Connect you with qualified partners (P ledger)', 'Support project packaging and investment readiness', `Run ${N(ind.stats.approved)} approved Sprints in ${c.name} and 53 other countries`]} />
                </Card>
                <Card title="What TBCA Will Not Do" icon="shield">
                    <ul className="list-disc space-y-1 ps-5 text-[0.82rem]"><li>Sell or disguise reserved services (audit opinions, legal representation, licensed advice)</li><li>Release regulated outputs without the human gate</li><li>Publish benchmarks below n/k thresholds</li><li>Hide partner, external or statutory fees</li></ul>
                    <A sm className="mt-3" href={iHref(ind, 'limits')}>See limitations & boundaries</A>
                </Card>
            </Cols>
            <Card title="Key Opportunities in This Industry" icon="star" act={<A sm href={iHref(ind, 'opps')}>View all opportunities →</A>}>
                {p.keyOpps.length ? (
                    <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                        {p.keyOpps.map(([a, b, h], i) => <Tile key={i} href={h} className="min-h-[90px]"><b className="text-[0.85rem]">{a}</b><span className="text-[0.72rem] text-ink-400">{b}</span></Tile>)}
                    </div>
                ) : <p className="text-[0.82rem] text-ink-400">Opportunity templates for this industry are drawn from the catalogue and partner network — no AIIM sector template yet <TagP /></p>}
            </Card>
            <Cols>
                <Card title={`${ind.name} across 54 countries`} icon="map">
                    <IndMap countries={countries} fill={(iso) => scoreCol(p.map[iso]?.[0] ?? 0)} highlight={[c.iso3]} label={`${ind.name} opportunity across Africa`}
                        tip={(iso, name) => `${name}\nOpportunity ${N(p.map[iso]?.[0], 1)}/100 · rank ${p.map[iso]?.[3]}\nIntra-African exports US$ ${fmtM(p.map[iso]?.[1] ?? 0)} m · imports US$ ${fmtM(p.map[iso]?.[2] ?? 0)} m`}
                        href={(x) => `/industries/${ind.slug}/country/${x.slug}`} />
                    <p className="mt-2 text-[0.72rem] text-ink-400"><TagM /> Click any country to open the Industry–Country intersection.</p>
                </Card>
                <Card title="Top 10 Countries (modelled)" icon="chart" act={<A sm href={iHref(ind, 'countries')}>All 54 →</A>}>
                    <STable head={['#', 'Country', 'Score', 'Exports US$ m']} rows={p.top10.map((r, i) => [i + 1, <Link href={`/industries/${ind.slug}/country/${r.slug}`} className="text-controlled-700 hover:underline"><Flag iso2={r.iso2} /> {r.name}</Link>, <b>{N(r.s, 1)}</b>, fmtM(r.e)])} />
                </Card>
            </Cols>
            <Shelf ind={ind} sprints={p.shelf} />
            {toast.node}
        </IndustryPage>
    );
}
