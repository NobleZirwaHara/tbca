/*
 * Countries tab layout (prototype layout.js): page registry, URLs, left country rail, Country Control
 * Panel, page heading with country switcher, the "pack loading" panel and Sprint cards and shelves.
 * Building blocks (Card, Kpi, Chip, DataTable and so on) come from Components/Industries/Kit.
 */
import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { A, Card, Chip, Dl, Flag, Ic, Meter, Note, Ticks, TagP, TagR, useMoney } from '@/Components/Industries/Kit';
import { Shell, Stack, type Crumb } from '@/Components/Industries/Layout';
import { cn } from '@/lib/cn';
import type { CountryBase, CountryOption, HubCountry, HubShelf, HubSprint } from '@/types/countryHub';

/* ------------------------------------------------------------------ page registry (prototype PAGES) */
export interface PageDef { k: string; l: string; g: string; m: string }

export const PAGES: PageDef[] = ([
    ['profile', 'Country Profile', 'Country Profile & Planning', 'P03'], ['evidence', 'Evidence Panel', 'Country Profile & Planning', 'P04'], ['availability', 'Availability Detail', 'Country Profile & Planning', 'P05'],
    ['catalogue', 'Service Catalogue', 'Country Profile & Planning', 'P06'], ['resolver', 'Context Resolver', 'Country Profile & Planning', 'P08'], ['impact', 'Selection Impact', 'Country Profile & Planning', 'P09'],
    ['tax', 'Tax & Statutory', 'Country Profile & Planning', 'P11'], ['payments', 'Payment Methods', 'Country Profile & Planning', 'P12'], ['language', 'Language & Localisation', 'Country Profile & Planning', 'P13'],
    ['partners', 'Partners & Professional Boundary', 'Country Profile & Planning', 'P14'], ['legal', 'Legal & Regulatory', 'Country Profile & Planning', 'P15'], ['privacy', 'Privacy & Data Residency', 'Country Profile & Planning', 'P16'],
    ['limitations', 'Limitations & Absence', 'Country Profile & Planning', 'P10'], ['history', 'Change History', 'Country Profile & Planning', 'P56'],
    ['trade', 'Import & Export Hub', 'Import & Export', 'NEW'], ['trade/1', '1 · Imports vs Africa exports', 'Import & Export', 'NEW'], ['trade/2', '2 · Imports vs one partner', 'Import & Export', 'NEW'], ['trade/3', '3 · Exports vs Africa imports', 'Import & Export', 'NEW'], ['trade/4', '4 · Exports vs one partner', 'Import & Export', 'NEW'],
    ['economy', 'Economy & Macro', 'Intelligence (AIIM)', 'NEW'], ['sectors', '18 Sectors', 'Intelligence (AIIM)', 'NEW'], ['opps', 'Opportunities', 'Intelligence (AIIM)', 'NEW'], ['geo', 'Geography & Places', 'Intelligence (AIIM)', 'NEW'],
    ['leads', 'Ranked Leads', 'Intelligence (AIIM)', 'NEW'], ['invest', 'Investment Case', 'Intelligence (AIIM)', 'NEW'], ['risk', 'Risk & Outlook', 'Intelligence (AIIM)', 'NEW'], ['products', 'Products & HS Codes', 'Intelligence (AIIM)', 'NEW'],
    ['infotypes', 'Investor & Trader Questions', 'Intelligence (AIIM)', 'NEW'], ['continental', 'Continental Model', 'Intelligence (AIIM)', 'NEW'], ['onestop', 'One-Stop Shop & Premium', 'Intelligence (AIIM)', 'NEW'],
    ['pack', 'Country Pack Reader', 'Intelligence (AIIM)', 'NEW'], ['dataroom', 'Data Room (62 sheets)', 'Intelligence (AIIM)', 'NEW'],
    ['readiness', 'Market Entry Readiness', 'Market Entry Journey', 'P17'], ['landing', 'Country Landing Plan', 'Market Entry Journey', 'P18'], ['localisation', 'Localisation Planner', 'Market Entry Journey', 'P19'],
    ['paylocal', 'Payment Localisation Planner', 'Market Entry Journey', 'P20'], ['langpack', 'Language Pack Builder', 'Market Entry Journey', 'P21'], ['compliance', 'Compliance Planner', 'Market Entry Journey', 'P22'],
    ['launch', 'Launch Readiness', 'Market Entry Journey', 'P23'], ['audit', 'Evidence Audit', 'Market Entry Journey', 'P24'], ['diaspora', 'Diaspora & Inbound Capital', 'Market Entry Journey', 'P26'], ['exit', 'Exit & Deregistration', 'Market Entry Journey', 'P25'],
    ['quote', 'Quote Request', 'Commercial Journey', 'P27'], ['waitlist', 'Waitlist & Unmet Demand', 'Commercial Journey', 'P28'], ['letter', 'Engagement Letter Review', 'Commercial Journey', 'P29'],
    ['pay', 'Payment & Activation', 'Commercial Journey', 'P30'], ['workspace', 'Client Workspace', 'Commercial Journey', 'P31'], ['deliverables', 'Deliverables & Evidence', 'Commercial Journey', 'P32'],
    ['change', 'Change & Re-resolution', 'Commercial Journey', 'P33'], ['closure', 'Closure & Next Route', 'Commercial Journey', 'P34'],
    ['corridors', 'Country Corridors', 'Corridors & Ledgers', 'P35'], ['gov', 'Governance & Admin', 'Governance', 'P49–84'],
] as [string, string, string, string][]).map(([k, l, g, m]) => ({ k, l, g, m }));

export const PBY: Record<string, PageDef> = Object.fromEntries(PAGES.map((p) => [p.k, p]));
export const pageLabel = (k: string) => PBY[k]?.l ?? k;

/* ------------------------------------------------------------------ URLs */
/** URL of a country page: prototype #/c/{ISO}/{key} → /countries/{slug}/{key}; profile is /countries/{slug}. */
export function cHref(c: { slug: string }, key = 'profile', q = ''): string {
    if (key === 'corridors') return `/countries/corridors?from=${(c as { iso3?: string }).iso3 ?? ''}`;
    return (key === 'profile' ? `/countries/${c.slug}` : `/countries/${c.slug}/${key}`) + q;
}
/** Corridor pages: prototype #/corridors/{view}/{A}/{B}. */
export const corHref = (view: string, a: string, b: string) => `/countries/corridors/${view}/${a}/${b}`;
export const BW = { slug: 'botswana', iso3: 'BWA' };

/* ------------------------------------------------------------------ visitor state (prototype localStorage) */
/** Persist a small piece of Countries visitor state (account when signed in, else session); keys must match CountryState::WRITABLE. */
export function saveCountryState(key: string, value: unknown): Promise<unknown> {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
    return fetch('/countries/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': token, 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
        body: JSON.stringify({ key, value }),
    }).catch(() => undefined);
}

/* ------------------------------------------------------------------ chips */
export const StateChip = ({ c }: { c: Pick<HubCountry, 'iso3'> }) => (
    <span className="inline-flex flex-wrap gap-1"><Chip t="Activated" tone="ok" />{c.iso3 === 'BWA' && <Chip t="Full pack BW-1.0" tone="gold" />}</span>
);
export function Why({ children }: { children: ReactNode }) {
    return <div className="mt-3 rounded-[6px] border-l-[3px] border-gold-500 bg-gold-50 px-3 py-2 text-[0.8rem] text-ink-700"><b>Why this matters · </b>{children}</div>;
}

/* ------------------------------------------------------------------ left rail (prototype leftRail) */
export function CountryRail({ c, active }: { c: HubCountry; active: string }) {
    const groups = PAGES.reduce<Record<string, PageDef[]>>((m, p) => ((m[p.g] ||= []).push(p), m), {});
    return (
        <aside aria-label="Country navigation" className="min-w-0 rounded-[6px] border border-parchment-400 bg-white p-2 text-[0.8rem]">
            {Object.entries(groups).map(([g, ps]) => (
                <div key={g}>
                    <h6 className="mx-1.5 mt-3 mb-1 text-[0.72rem] font-semibold tracking-wider text-ink-400 uppercase first:mt-1">{g}</h6>
                    {ps.map((p) => (
                        <Link key={p.k} href={cHref(c, p.k)} aria-current={p.k === active ? 'page' : undefined}
                            className={cn('flex items-baseline justify-between gap-2 rounded-[4px] px-2 py-1.5 leading-tight text-ink-700', p.k === active ? 'bg-gold-100 font-semibold text-ink-900 shadow-[inset_3px_0_0_var(--color-gold-500)]' : 'hover:bg-parchment-200')}>
                            <span>{p.l}</span>{p.m !== 'NEW' && <span className="text-[0.66rem] text-ink-400">{p.m}</span>}
                        </Link>
                    ))}
                </div>
            ))}
            <div className="mt-3 rounded-[6px] bg-parchment-200 p-2.5">
                <div className="text-[0.72rem] font-bold text-ink-500">Country State</div>
                <div className="my-1.5"><StateChip c={c} /></div>
                <div className="text-[0.72rem] text-ink-500">Commercial objects with valid resolver and permission scope. Service-by-service permission applies.</div>
                <div className="my-2 border-t border-parchment-400" />
                <div className="text-[0.72rem]"><b>All 54 African countries activated</b><br /><span className="text-ink-400">Pan-African activation · 21 Oct 2026</span></div>
            </div>
        </aside>
    );
}

/* ------------------------------------------------------------------ Country Control Panel (prototype controlPanel) */
export function ControlPanel({ c }: { c: HubCountry }) {
    return (
        <>
            <Card title="Country Control Panel" icon="shield">
                <div className="mb-2.5 flex items-center gap-2.5">
                    <Flag iso2={c.iso2} className="text-[2rem]" />
                    <div><b className="text-[1.05rem]">{c.name}</b><div className="text-[0.72rem] text-ink-400">{c.sub}</div></div>
                </div>
                <Dl rows={[
                    ['Country State', <StateChip key="s" c={c} />], ['Activation Scope', 'Full (pan-African)'], ['Evidence Status', <span key="e" className="text-[0.8rem]">{c.evidence}</span>],
                    ['Resolver Completeness', `${c.rcs}%`], ['Last Update', c.updated], ['Commercial Availability', <span key="a" className="text-[0.8rem] text-gold-700">Service-by-service permission applies</span>],
                ]} />
                <div className="mt-2"><Meter p={c.rcs} tone={c.rcs >= 100 ? 'ok' : c.rcs > 30 ? 'warn' : 'bad'} /></div>
            </Card>
            <Card title="Actions">
                <div className="grid gap-1.5">
                    <A v="pri" block href={cHref(c, 'catalogue')}>Explore Services <Ic n="ext" /></A>
                    <A v="yellow" block href={cHref(c, 'trade')}>Import and Export <Ic n="swap" /></A>
                    <A block href={cHref(c, 'evidence')}>View Evidence Panel <Ic n="file" /></A>
                    <A block href={cHref(c, 'gov/activation')}>View Activation Ledger <Ic n="layers" /></A>
                    <A block href={cHref(c, 'quote')}>Ask a Question <Ic n="msg" /></A>
                </div>
            </Card>
            <Note><b>All 54 countries are activated.</b><br />Prices resolve service by service. No Resolution, No Price still applies to each Sprint.</Note>
        </>
    );
}

/* ------------------------------------------------------------------ country switcher and heading (prototype countryHead) */
export function CountrySelect({ c, countries, pageKey, className }: { c: HubCountry; countries: CountryOption[]; pageKey: string; className?: string }) {
    return (
        <label className={cn('block', className)}>
            <span className="sr-only">Switch country</span>
            <select value={c.iso3} onChange={(e) => { const x = countries.find((o) => o.iso3 === e.target.value); if (x) router.visit(cHref(x, pageKey.includes('/') && !pageKey.startsWith('trade/') && !pageKey.startsWith('gov/') ? pageKey.split('/')[0] : pageKey)); }}
                className="h-9 w-full rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.82rem]">
                {countries.map((x) => <option key={x.iso3} value={x.iso3}>{x.name}{x.iso3 === 'BWA' ? ' · full pack' : ''}</option>)}
            </select>
        </label>
    );
}

export function CountryHead({ base, pageKey, title, desc, act }: { base: CountryBase; pageKey: string; title: ReactNode; desc?: ReactNode; act?: ReactNode }) {
    const { c, countries } = base;
    const p = PBY[pageKey];
    return (
        <>
            <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1 basis-[22rem]">
                    <div className="text-[0.72rem] font-semibold tracking-[0.14em] text-gold-700 uppercase">{p ? p.g : 'Countries'}{p && p.m !== 'NEW' ? ` · Mock-up ${p.m}` : ''}</div>
                    <h1 className="mt-1 text-[1.6rem] leading-tight font-bold text-ink-900 sm:text-[1.85rem]">{title}</h1>
                    {desc && <p className="mt-1.5 max-w-3xl text-[0.9rem] text-ink-500">{desc}</p>}
                </div>
                <div className="flex flex-wrap gap-2">{act}<A href={cHref(c)}><Ic n="back" /> Back to Country Profile</A></div>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-[6px] border border-parchment-400 bg-white p-3">
                <Flag iso2={c.iso2} className="text-[2.2rem]" />
                <div className="min-w-0 flex-1"><h2 className="text-[1.15rem] font-bold text-ink-900">{c.name}</h2><div className="text-[0.78rem] text-ink-400">{c.sub}</div></div>
                <StateChip c={c} />
                <CountrySelect c={c} countries={countries} pageKey={pageKey} className="w-full sm:w-64" />
            </div>
        </>
    );
}

/* ------------------------------------------------------------------ page frame (prototype countryPage) */
export function countryCrumbs(c: HubCountry, pageKey: string, extra: Crumb[] = []): Crumb[] {
    const list: Crumb[] = [['Countries', '/countries'], [c.name, cHref(c)]];
    if (pageKey.startsWith('trade/')) list.push(['Import & Export', cHref(c, 'trade')]);
    if (pageKey === 'profile' && !extra.length) list.push(['Country Profile', cHref(c)], ['Overview']);
    else if (pageKey !== 'profile') list.push([pageLabel(pageKey), cHref(c, pageKey)]);
    list.push(...extra);
    return list;
}

/**
 * Country page: left rail, main column and the Country Control Panel (or `right`). `pageKey` is the
 * prototype page key (PAGES); `rail` selects a different rail entry when a sub-page belongs to one.
 */
export function CountryPage({ base, pageKey, rail, extraCrumbs = [], right, noRight, children }: {
    base: CountryBase; pageKey: string; rail?: string; extraCrumbs?: Crumb[]; right?: ReactNode; noRight?: boolean; children: ReactNode;
}) {
    const { c } = base;
    const crumbs = countryCrumbs(c, pageKey, extraCrumbs);
    const title = [...crumbs].slice(1).reverse().map((x) => x[0]).join(' · ');
    return (
        <Shell title={title} crumbs={crumbs} home="/countries">
            <div className={cn('grid grid-cols-[minmax(0,1fr)] items-start gap-4', noRight ? 'lg:grid-cols-[230px_minmax(0,1fr)]' : 'lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_280px]')}>
                <div className="order-3 lg:order-1 lg:row-span-2"><CountryRail c={c} active={rail ?? pageKey} /></div>
                <Stack className="order-1 lg:order-2">{children}</Stack>
                {!noRight && <aside className="order-2 min-w-0 space-y-4 lg:order-3 lg:col-start-2 xl:col-start-3 xl:row-start-1">{right ?? <ControlPanel c={c} />}</aside>}
            </div>
        </Shell>
    );
}

/** Page without a country rail (landing, explorer, corridors). */
export function HubPage({ title, crumbs, dark, children }: { title: string; crumbs: Crumb[]; dark?: boolean; children: ReactNode }) {
    return (
        <Shell title={title} crumbs={crumbs} home="/countries" dark={dark}>
            <Stack>{children}</Stack>
        </Shell>
    );
}

/* ------------------------------------------------------------------ placeholder panel (prototype noPack) */
export function NoPack({ c, what, pageKey }: { c: HubCountry; what: string; pageKey: string }) {
    return (
        <Card title={`${what} — detailed ${c.name} pack loading`} icon="globe" tone="gold">
            <div className="flex flex-wrap gap-4">
                <div className="min-w-[240px] flex-1 text-[0.85rem]">
                    <p><Chip t="Activated" tone="ok" /> <b>{c.name}</b> is activated and open for business: Sprints are priced, quotes, payment and the client workspace all work. The deep intelligence registers for this section use the same template as Botswana and are populated as the {c.name} country pack is loaded <TagP />{c.pack ? ` (pack ${c.pack} issued)` : ''}.</p>
                    <Ticks className="mt-2" items={['Country resolver complete — services priced', 'Commercial journey enabled (quote → pay → workspace)', 'Import & Export heat maps live']} />
                </div>
                <div className="min-w-[240px] flex-1">
                    <Dl rows={[
                        ['AU region', c.region], ['Activation', '21 Oct 2026'], ['Pack status', c.pack ?? `Scheduled (wave ${c.wave ?? '—'})`],
                        [<>Capital <TagR /></>, c.capital ?? '—'], [<>Currency <TagR /></>, c.currency ?? '—'], [<>VAT (standard) <TagR /></>, c.vat === null ? 'No VAT (sales tax)' : `${c.vat} %`], [<>Languages <TagR /></>, c.languages ?? '—'],
                    ]} />
                </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
                <A v="pri" href={cHref(c, 'catalogue')}>Explore {c.name} Sprints</A>
                <A href={cHref(BW, pageKey)}>See the full Botswana example →</A>
                <A v="yellow" href={cHref(c, 'trade')}>Import and Export</A>
            </div>
        </Card>
    );
}

/* ------------------------------------------------------------------ Sprints (prototype sprintCard, sprintShelf) */
export function HubSprintCard({ s, c }: { s: HubSprint; c: { slug: string } }) {
    const money = useMoney();
    const code = encodeURIComponent(s.code);
    return (
        <div className="flex min-w-0 flex-col gap-1.5 rounded-[6px] border border-parchment-400 bg-white p-3">
            <div className="flex items-start justify-between gap-2"><span className="rounded-[3px] bg-parchment-300 px-1.5 py-px text-[0.66rem] font-bold text-ink-600 uppercase">{s.type}</span>{s.pop === 'EMBEDDED' && <Chip t="Embedded" tone="gold" />}</div>
            <h4 className="text-[0.88rem] leading-snug font-semibold text-ink-900">{s.name}</h4>
            <div className="font-mono text-[0.7rem] text-ink-400">{s.code} · {s.topicLabel}</div>
            <div className="text-[1.05rem] font-bold text-ink-900">
                {s.priced ? <>{money(s.ep)} <small className="text-[0.7rem] font-normal text-ink-400">from · {s.entry} · ex VAT</small></>
                    : <span className="text-[0.8rem] font-normal text-ink-400">Embedded component — not sold standalone</span>}
            </div>
            <div className="flex flex-wrap gap-1">{s.tiers.map((t) => <Chip key={t} t={t} tone="ok" />)}<Chip t="Human reviewed" tone="info" /></div>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                <A sm href={cHref(c, `service/${code}`)}>Details</A>
                {s.priced ? <A sm v="pri" href={cHref(c, 'quote', `?sprint=${code}`)}>Start a Sprint</A> : <A sm href={cHref(c, 'waitlist', `?sprint=${code}`)}>Join waitlist</A>}
            </div>
        </div>
    );
}

export function SprintGrid({ items, c }: { items: HubSprint[]; c: { slug: string } }) {
    return <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-3">{items.map((s) => <HubSprintCard key={s.code} s={s} c={c} />)}</div>;
}

export function SprintShelf({ shelf, c }: { shelf: HubShelf; c: { slug: string } }) {
    return (
        <Card title={shelf.title} icon="tag" sub="Fixed scope · catalogue prices (ECON-R0C, 7,589 Sprints) · ex VAT"
            act={<A sm href={cHref(c, 'catalogue', `?topic=${shelf.topics[0] ?? ''}`)}>All {shelf.total.toLocaleString('en-US')} →</A>}>
            {shelf.items.length ? <SprintGrid items={shelf.items} c={c} /> : <p className="text-[0.82rem] text-ink-400">No priced Sprints for this topic yet.</p>}
        </Card>
    );
}
