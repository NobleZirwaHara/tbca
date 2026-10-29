import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, type ReactNode } from 'react';
import AfricaCountryMap, { type AfricaCountryShape } from '@/Components/Map/AfricaCountryMap';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { CountryOption, EngagementBar, Industry, IndustryBase, SprintCardData } from '@/types/industries';
import { A, ActChip, B, Card, CatChip, Chip, CxChip, Dl, Flag, Ic, IICON, Modal, N, Note, RegChip, TagM, useMoney, useToast } from './Kit';

/* ------------------------------------------------------------------ URLs */
export function iHref(ind: { slug: string }, key = 'overview', countrySlug?: string): string {
    if (key === 'overview') return `/industries/${ind.slug}`;
    if (key === 'countries' && countrySlug) return `/industries/${ind.slug}/country/${countrySlug}`;
    return `/industries/${ind.slug}/${key}`;
}
export const sprintHref = (ind: { slug: string }, code: string) => `/industries/${ind.slug}/sprint/${encodeURIComponent(code)}`;
export const tradeHref = (ind: { slug: string }, countrySlug: string, q = '') => `/industries/${ind.slug}/country/${countrySlug}/trade${q}`;

/* ------------------------------------------------------------------ colours */
function lerp(a: string, b: string, t: number) {
    const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
}
export const scoreCol = (s: number) => lerp('#fbf1d6', '#7c4a07', Math.max(0, Math.min(1, (s - 15) / 80)));
export const heatCol = (v: number, max: number) => (!v || !max ? '#faf6ef' : lerp('#fbf1d6', '#7c4a07', Math.pow(v / max, 0.45)));
export const txtCol = (v: number, max: number) => (!v || !max || Math.pow(v / max, 0.45) < 0.55 ? '#23232a' : '#fff');

/* ------------------------------------------------------------------ sub-navigation and tools bar */
const NAV3: [string, string][] = [
    ['Industries Home', '/industries'], ['Industry Selection', '/industries/select'], ['Diagnostics', '/industries/diagnostics'], ['Sector Intelligence', '/industries/sector-intelligence'],
    ['Benchmarks', '/industries/benchmarks'], ['Partners', '/industries/partners'], ['Industry × Country Map', '/industries/heatmap'], ['Client Workspace', '/industries/workspace'],
    ['Admin Console', '/admin/industries'],
];

function activeNav(path: string): string | null {
    if (path.startsWith('/admin/industries')) return '/admin/industries';
    if (path.startsWith('/industries/workspace') || path.startsWith('/industries/engage')) return '/industries/workspace';
    if (path === '/industries/heatmap') return '/industries/heatmap';
    if (path.startsWith('/industries/select')) return '/industries/select';
    if (/\/diagnostics?$/.test(path)) return '/industries/diagnostics';
    if (/\/(intelligence|sector-intelligence)$/.test(path)) return '/industries/sector-intelligence';
    if (/\/benchmarks$/.test(path)) return '/industries/benchmarks';
    if (/\/partners$/.test(path)) return '/industries/partners';
    if (path === '/industries') return '/industries';
    return null;
}

export type Crumb = [string, string?];

export function Shell({ title, crumbs, children, dark }: { title: string; crumbs: Crumb[]; children: ReactNode; dark?: boolean }) {
    const { url } = usePage<SharedProps>().props;
    const on = activeNav(url.path);
    const list: Crumb[] = [['Home', '/'], ...crumbs];
    return (
        <>
            <Head title={title} />
            <nav aria-label="Industries sections" className="border-b border-parchment-400 bg-parchment-100">
                <ul className="container-tbca flex gap-0.5 overflow-x-auto">
                    {NAV3.map(([l, h]) => (
                        <li key={h}>
                            <Link href={h} aria-current={on === h ? 'page' : undefined}
                                className={cn('my-1 flex h-[34px] items-center rounded-[4px] px-2.5 text-[0.78rem] whitespace-nowrap', on === h ? 'bg-gold-100 font-semibold text-ink-900' : 'font-medium text-ink-600 hover:text-ink-900')}>
                                {l}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="border-b border-parchment-400 bg-white">
                <div className="container-tbca flex flex-wrap items-center gap-2 py-2">
                    <nav aria-label="Page map" className="min-w-0 flex-1 basis-full text-[0.78rem] text-ink-400 sm:basis-0">
                        {list.map(([l, h], i) => (
                            <span key={i}>
                                {i === list.length - 1 ? <b aria-current="page" className="text-gold-700">{l}</b> : <><Link href={h ?? '#'} className="hover:text-ink-800">{l}</Link><span className="px-1.5" aria-hidden="true">›</span></>}
                            </span>
                        ))}
                    </nav>
                    <div className="flex gap-1.5">
                        <B sm onClick={() => (window.history.length > 1 ? window.history.back() : router.visit('/industries'))}><Ic n="back" /> Back</B>
                        <B sm onClick={() => router.visit('/industries')}><Ic n="home" /> Home</B>
                        <B sm onClick={() => router.reload()}><Ic n="refresh" /> Refresh</B>
                    </div>
                </div>
            </div>
            <div className={cn(dark ? 'bg-ink-950 text-parchment-200' : 'bg-parchment-200')}>
                <div className="container-tbca py-5">{children}</div>
            </div>
        </>
    );
}

/* ------------------------------------------------------------------ page heading */
export function Head1({ eyebrow, title, desc, act }: { eyebrow?: ReactNode; title: ReactNode; desc?: ReactNode; act?: ReactNode }) {
    return (
        <div className="mb-4 flex flex-wrap items-start gap-4">
            <div className="min-w-0 flex-1 basis-[22rem]">
                {eyebrow && <div className="flex flex-wrap items-center gap-1.5 text-[0.72rem] font-semibold tracking-[0.14em] text-gold-700 uppercase">{eyebrow}</div>}
                <h1 className="mt-1 text-[1.6rem] leading-tight font-bold text-ink-900 sm:text-[1.85rem]">{title}</h1>
                {desc && <p className="mt-1.5 max-w-3xl text-[0.9rem] text-ink-500">{desc}</p>}
            </div>
            {act && <div className="flex flex-wrap gap-2">{act}</div>}
        </div>
    );
}

export function Stack({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('min-w-0 space-y-4', className)}>{children}</div>;
}

export function TrustStrip() {
    const items: [string, string][] = [['Taxonomy', 'Proposed (17 / 56)'], ['Countries', '54 activated'], ['Human Gate', 'Mandatory'], ['Visible Fees', 'T/P/X/S'], ['AIIM', 'Intelligence Layer'], ['Support', 'Always Available'], ['Source & Confidence', 'Evidence Tracked'], ['Industry Activation', 'Evidence Required']];
    return (
        <div className="mt-4 flex flex-wrap gap-2">
            {items.map(([a, b]) => <span key={a} className="inline-flex items-center gap-1.5 rounded-full border border-parchment-400 bg-white px-2.5 py-1 text-[0.72rem] text-ink-600">{a} <b className="text-ink-900">{b}</b></span>)}
        </div>
    );
}

/* ------------------------------------------------------------------ discovery call and WhatsApp */
const SLOTS = ['Tue 27 Oct · 09:00', 'Tue 27 Oct · 14:00', 'Wed 28 Oct · 10:30', 'Thu 29 Oct · 11:00', 'Fri 30 Oct · 09:30', 'Mon 2 Nov · 15:00'];
export function CallButton({ children = 'Book discovery call', v = 'pri', sm = true }: { children?: ReactNode; v?: 'pri' | 'default'; sm?: boolean }) {
    const [open, setOpen] = useState(false);
    const toast = useToast();
    return (
        <>
            <B v={v} sm={sm} onClick={() => setOpen(true)}>{children}</B>
            <Modal title="Book a Discovery Call" open={open} onClose={() => setOpen(false)}>
                <p className="text-[0.85rem]">Choose a 30-minute slot with a TBCA Industry Advisor. Calls are free and recorded to your audit trail only with consent.</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {SLOTS.map((t) => <B key={t} onClick={() => { setOpen(false); toast.show(`Discovery call requested: ${t} SAST. A confirmation will appear in your workspace messages.`); }}>{t}</B>)}
                </div>
                <p className="mt-3 text-[0.72rem] text-ink-400">No booking is sent from this page. To confirm a time, use <Link href="/discovery-call" className="underline">Book a Discovery Call</Link>.</p>
            </Modal>
            {toast.node}
        </>
    );
}
export const WhatsAppButton = ({ sm = true }: { sm?: boolean }) => <A href="https://wa.me/27608011365" sm={sm}>WhatsApp</A>;

/* ------------------------------------------------------------------ IndustryContext panel (prototype ctxPanel) */
export function CtxPanel({ base, extra }: { base: IndustryBase; extra?: ReactNode }) {
    const { ind, ctx } = base;
    const c = ctx.country;
    return (
        <>
            <Card title="Your Industry Context" icon="cog">
                <Dl rows={[
                    ['Primary Industry', <><b>{ind.name}</b> <Link className="text-[0.72rem] text-controlled-700 underline" href="/industries/select">Change</Link></>],
                    ['Sub-Industry', ctx.sub ? <>{ctx.sub.name} <Link className="text-[0.72rem] text-controlled-700 underline" href={`/industries/select?ind=${ind.code}`}>Change</Link></> : <><span className="text-ink-400">Not selected</span> <Link className="text-[0.72rem] text-controlled-700 underline" href={`/industries/select?ind=${ind.code}`}>Select</Link></>],
                    ['Country', <><Flag iso2={c.iso2} /> {c.name} <Link className="text-[0.72rem] text-controlled-700 underline" href={`/industries/select?ind=${ind.code}&step=3`}>Change</Link></>],
                    ['Industry Mode', <Chip t="Active" tone="ok" />],
                    ['Catalogue State', <CatChip cat={ind.cat} />],
                    ['Complexity Class', <CxChip n={ind.cx} name={ind.cxName} />],
                    ['Regulatory State', <RegChip reg={ind.reg} />],
                    ['Human Gate', <span className="text-[0.8rem]">{ind.gate}</span>],
                    ['Visible Fees', <b>T / P / X / S</b>],
                    [<>Opportunity Score <TagM /></>, <><b>{N(ctx.score, 1)}/100</b> · rank {ctx.rank} of 54</>],
                ]} />
                <div className="mt-3 flex flex-wrap gap-1.5">
                    <A sm v="pri" href={iHref(ind, 'services')}>Explore services</A>
                    <A sm v="yellow" href={tradeHref(ind, c.slug)}><Ic n="swap" /> Import and Export</A>
                </div>
            </Card>
            {extra}
            <Card title="Next Steps" icon="check">
                <ol className="list-decimal space-y-0.5 ps-5 text-[0.82rem]">
                    <li>Run the sector-adapted diagnostic.</li><li>Review the limitation statement and mandatory add-ons.</li><li>Pass the gates and approve a quotation.</li><li>Track delivery in your Industry Workspace.</li>
                </ol>
                <div className="mt-3 flex flex-wrap gap-1.5"><A sm href={iHref(ind, 'diagnostic')}>Start diagnostic</A><A sm href={iHref(ind, 'engage')}>Start engagement</A></div>
            </Card>
            <Card title="Need Expert Guidance?" icon="msg">
                <p className="text-[0.82rem]">Speak to a TBCA Advisor for tailored industry advice and professional routing.</p>
                <div className="mt-2 flex flex-wrap gap-1.5"><CallButton /><WhatsAppButton /></div>
            </Card>
        </>
    );
}

/* ------------------------------------------------------------------ industry rail (prototype iRail) */
export const ISECT: [string, [string, string][]][] = [
    ['Industry', [['overview', 'Industry Overview'], ['services', 'Services & Sprints'], ['diagnostic', 'Sector Diagnostic'], ['intelligence', 'Sector Intelligence (AIIM)'], ['benchmarks', 'Benchmarks'], ['partners', 'Partner Directory'], ['countries', 'Industry × 54 Countries'], ['chains', 'Value Chains & Questions'], ['opps', 'Opportunity Register'], ['commodities', 'Products & HS Codes'], ['economics', 'Unit Economics'], ['regulators', 'Regulators & Permits'], ['limits', 'Limitations & Boundaries']]],
    ['Engagement', [['engage', 'Start Engagement (Gates)'], ['verify', 'Verification Requests'], ['reclass', 'Re-Classification Notice']]],
];
export const sectionLabel = (k: string) => ISECT.flatMap((x) => x[1]).find((x) => x[0] === k)?.[1] ?? k;

export function IndustryRail({ base, active }: { base: IndustryBase; active: string }) {
    const { ind, ctx, industries } = base;
    return (
        <aside aria-label="Industry navigation" className="min-w-0 rounded-[6px] border border-parchment-400 bg-white p-2 text-[0.8rem]">
            <div className="flex items-center gap-2 p-1 pb-2">
                <span className="grid grid-cols-[minmax(0,1fr)] size-[30px] shrink-0 place-items-center rounded-[7px] bg-ink-900 text-gold-400"><Ic n={IICON[ind.code] ?? 'layers'} /></span>
                <b className="text-[0.85rem] leading-tight">{ind.name}</b>
            </div>
            {ISECT.map(([g, ps]) => (
                <div key={g}>
                    <h6 className="mx-1.5 mt-3 mb-1 text-[0.72rem] font-semibold tracking-wider text-ink-400 uppercase">{g}</h6>
                    {ps.map(([k, l]) => (
                        <Link key={k} href={iHref(ind, k, k === 'countries' ? ctx.country.slug : undefined)} aria-current={k === active ? 'page' : undefined}
                            className={cn('block rounded-[4px] px-2 py-1.5 leading-tight text-ink-700', k === active ? 'bg-gold-100 font-semibold text-ink-900 shadow-[inset_3px_0_0_var(--color-gold-500)]' : 'hover:bg-parchment-200')}>
                            {l}
                        </Link>
                    ))}
                </div>
            ))}
            <h6 className="mx-1.5 mt-3 mb-1 text-[0.72rem] font-semibold tracking-wider text-ink-400 uppercase">Switch industry</h6>
            <select aria-label="Switch industry" className="h-8 w-full rounded-[4px] border border-parchment-500 bg-white px-1.5 text-[0.78rem]" value={ind.code}
                onChange={(e) => { const x = industries.find((i) => i.code === e.target.value); if (x) router.visit(active === 'overview' ? iHref(x) : iHref(x, active === 'countries' ? 'countries' : active)); }}>
                {industries.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}
            </select>
            <div className="mt-3 rounded-[6px] bg-parchment-200 p-2.5">
                <div className="text-[0.72rem] font-bold text-ink-500">Industry State</div>
                <div className="my-1.5"><ActChip /></div>
                <div className="text-[0.72rem] text-ink-500">All 17 canonical industries are active across all 54 activated countries. Catalogue depth and regulatory controls still apply Sprint by Sprint.</div>
            </div>
        </aside>
    );
}

/* ------------------------------------------------------------------ page frames */
export function IndustryPage({ base, active, label, extraCrumbs = [], right, noRight, children }: {
    base: IndustryBase; active: string; label?: string; extraCrumbs?: Crumb[]; right?: ReactNode; noRight?: boolean; children: ReactNode;
}) {
    const { ind } = base;
    const crumbs: Crumb[] = [['Industries', '/industries'], [ind.name, iHref(ind)]];
    if (active !== 'overview') crumbs.push([label ?? sectionLabel(active), undefined]);
    crumbs.push(...extraCrumbs);
    const title = [...crumbs].slice(1).reverse().map((c) => c[0]).join(' · ');
    return (
        <Shell title={title} crumbs={crumbs}>
            <div className={cn('grid grid-cols-[minmax(0,1fr)] items-start gap-4', noRight ? 'lg:grid-cols-[230px_minmax(0,1fr)]' : 'lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_280px]')}>
                <div className="order-3 lg:order-1 lg:row-span-2"><IndustryRail base={base} active={active} /></div>
                <Stack className="order-1 lg:order-2">{children}<TrustStrip /></Stack>
                {!noRight && <aside className="order-2 min-w-0 space-y-4 lg:order-3 lg:col-start-2 xl:col-start-3 xl:row-start-1">{right ?? <CtxPanel base={base} />}</aside>}
            </div>
        </Shell>
    );
}

export function PlainPage({ title, crumbs, right, children }: { title: string; crumbs: Crumb[]; right?: ReactNode; children: ReactNode }) {
    return (
        <Shell title={title} crumbs={crumbs}>
            {right ? (
                <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <Stack>{children}<TrustStrip /></Stack>
                    <aside className="min-w-0 space-y-4">{right}</aside>
                </div>
            ) : (
                <Stack>{children}<TrustStrip /></Stack>
            )}
        </Shell>
    );
}

/* ------------------------------------------------------------------ engagement bar (prototype engBar) */
export function EngBar({ e }: { e: EngagementBar | null }) {
    if (!e) return null;
    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-[6px] bg-ink-900 px-3 py-2.5 text-[0.76rem] text-parchment-300">
            <span className="inline-flex items-center gap-1"><Ic n="brief" className="text-gold-400" /> Engagement <b className="text-white">{e.ref}</b></span>
            <span>Industry <b className="text-white">{e.industry}</b></span>
            <span>Country <b className="text-white"><Flag iso2={e.iso2} /> {e.country}</b></span>
            <span>Sprint <b className="text-white">{e.sprint}</b> ({e.tier})</span>
            <span>Gates passed <b className="text-white">{e.gates}/9</b></span>
            {e.aborted && <b className="text-[#ff8a80]">ABORTED</b>}
            <A sm href="/industries/workspace" className="ms-auto">Open workspace →</A>
        </div>
    );
}

export const WSNAV: [string, string][] = [['', 'Workspace Overview'], ['ledger', 'Payments & Fee Ledger'], ['partner', 'Partner Route'], ['review', 'Specialist Review'], ['calendar', 'Compliance Calendar'], ['benchmark', 'Benchmark Contribution'], ['abort', 'Abort Ladder'], ['verify', 'Industry Verification'], ['reclass', 'Re-Classification Notices']];

export function WorkspaceRail({ active }: { active: string }) {
    const item = (href: string, l: string, on: boolean) => (
        <Link key={href} href={href} aria-current={on ? 'page' : undefined} className={cn('block rounded-[4px] px-2 py-1.5 leading-tight text-ink-700', on ? 'bg-gold-100 font-semibold text-ink-900 shadow-[inset_3px_0_0_var(--color-gold-500)]' : 'hover:bg-parchment-200')}>{l}</Link>
    );
    return (
        <aside aria-label="Workspace navigation" className="min-w-0 rounded-[6px] border border-parchment-400 bg-white p-2 text-[0.8rem]">
            <h6 className="mx-1.5 mt-1 mb-1 text-[0.72rem] font-semibold tracking-wider text-ink-400 uppercase">Industry Workspace</h6>
            {WSNAV.map(([k, l]) => item(`/industries/workspace${k ? `/${k}` : ''}`, l, k === active))}
            <h6 className="mx-1.5 mt-3 mb-1 text-[0.72rem] font-semibold tracking-wider text-ink-400 uppercase">Engagement path</h6>
            {item('/industries/engage/gates', 'Gate Approval', active === 'gates')}
            {item('/industries/engage/letter', 'Engagement Letter', active === 'letter')}
            {item('/industries/engage/checkout', 'Split Checkout', active === 'checkout')}
        </aside>
    );
}

export function WorkspacePage({ base, active, label, children, right, guestNote }: { base: IndustryBase; active: string; label?: string; children: ReactNode; right?: ReactNode; guestNote?: boolean }) {
    const crumbs: Crumb[] = [['Industries', '/industries'], ['Client Workspace', '/industries/workspace'], ...(label ? [[label] as Crumb] : [])];
    const { auth } = usePage<SharedProps>().props;
    return (
        <Shell title={label ? `${label} · Client Workspace` : 'Client Workspace'} crumbs={crumbs}>
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_280px]">
                <div className="order-3 lg:order-1 lg:row-span-2"><WorkspaceRail active={active} /></div>
                <Stack className="order-1 lg:order-2">
                    <EngBar e={base.engagement} />
                    {guestNote !== false && !auth.user && base.engagement && (
                        <div className="text-[0.75rem] text-ink-500">This engagement is kept in your browser session. <Link href="/login" className="underline">Sign in</Link> to keep your industry workspace on your account.</div>
                    )}
                    {children}
                    <TrustStrip />
                </Stack>
                <aside className="order-2 min-w-0 space-y-4 lg:order-3 lg:col-start-2 xl:col-start-3 xl:row-start-1">{right ?? <CtxPanel base={base} />}</aside>
            </div>
        </Shell>
    );
}

export function NoEngagement({ base, title }: { base: IndustryBase; title?: string }) {
    return (
        <Card title={title ?? 'No active engagement yet'} icon="brief" tone="gold">
            <p className="text-[0.88rem]">Your Industry Workspace opens once you start an engagement. The worked example runs <b>Agriculture & Agro-Industry › Livestock & Animal Production › Botswana</b> (full BW-1.0 pack), but every industry and all 54 countries work the same way.</p>
            <div className="mt-3 flex flex-wrap gap-2">
                <A v="pri" href="/industries/agriculture-agro-industry/engage?sub=AGR2&iso=BWA">Start the worked example</A>
                <A href={iHref(base.ind, 'engage')}>Start for {base.ind.name}</A>
                <A href="/industries/select">Choose another industry</A>
            </div>
        </Card>
    );
}

/* ------------------------------------------------------------------ Sprint cards and shelf */
export function SprintCard({ s, ind }: { s: SprintCardData; ind: { slug: string } }) {
    const money = useMoney();
    return (
        <div className="flex min-w-0 flex-col gap-1.5 rounded-[6px] border border-parchment-400 bg-white p-3">
            <div className="flex items-start justify-between gap-2"><span className="rounded-[3px] bg-parchment-300 px-1.5 py-px text-[0.66rem] font-bold text-ink-600 uppercase">{s.type}</span><CxChip n={s.cx} name={s.cxName} /></div>
            <h4 className="text-[0.88rem] leading-snug font-semibold text-ink-900">{s.name}</h4>
            <div className="font-mono text-[0.7rem] text-ink-400">{s.code} · {s.family}</div>
            <div className="text-[1.05rem] font-bold text-ink-900">
                {s.block ? <span className="text-[0.8rem] font-semibold text-risk-700">{s.block.type} — {s.block.reason}</span>
                    : s.priced ? <>{money(s.ep)} <small className="text-[0.7rem] font-normal text-ink-400">from · {s.entry} · ex VAT</small></>
                        : <span className="text-[0.8rem] font-normal text-ink-400">{s.inApp ? 'Not separately sellable' : 'Not in the app catalogue yet'}</span>}
            </div>
            <div className="flex flex-wrap gap-1">{s.tiers.map((t) => <Chip key={t} t={t} tone="ok" />)}<Chip t="Human reviewed" tone="info" /></div>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                <A sm href={sprintHref(ind, s.code)}>Details</A>
                {!s.block && s.priced ? <A sm v="pri" href={`/industries/${ind.slug}/engage?sprint=${encodeURIComponent(s.code)}`}>Start a Sprint</A> : <A sm href={`/industries/${ind.slug}/partners`}>Partner route</A>}
            </div>
        </div>
    );
}

export function Shelf({ ind, sprints, title }: { ind: Industry; sprints: SprintCardData[]; title?: string }) {
    return (
        <Card title={title ?? 'Embedded Sprints for this industry'} icon="tag" sub="Sector-adapted · prices from the TBCA Sprint catalogue · ex VAT" act={<A sm href={iHref(ind, 'services')}>All {N(ind.stats.approved)} approved →</A>}>
            {sprints.length ? <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-3">{sprints.map((s) => <SprintCard key={s.code} s={s} ind={ind} />)}</div>
                : <p className="text-[0.82rem] text-ink-400">No priced Sprints in this industry's core families yet.</p>}
        </Card>
    );
}

/* ------------------------------------------------------------------ choropleth map */
export function IndMap({ values, countries, fill, tip, href, highlight, dark, label }: {
    values?: Record<string, unknown>; countries: CountryOption[]; fill: (iso3: string) => string | undefined; tip: (iso3: string, name: string) => string;
    href: (c: CountryOption) => string | null; highlight?: string[]; dark?: boolean; label?: string;
}) {
    const by = Object.fromEntries(countries.map((c) => [c.iso3, c]));
    void values;
    return (
        <AfricaCountryMap tone={dark ? 'dark' : 'light'} label={label ?? 'Map of Africa'} highlighted={(highlight ?? []).map((i) => by[i]?.iso2 ?? '')}
            colorFor={(c: AfricaCountryShape) => (by[c.iso3] ? fill(c.iso3) : undefined)}
            hrefFor={(_slug, c) => (by[c.iso3] ? href(by[c.iso3]) : null)}
            tipFor={(c) => (by[c.iso3] ? tip(c.iso3, by[c.iso3].name) : c.name)} />
    );
}

export function Legend({ items }: { items: [string, string][] }) {
    return (
        <span className="inline-flex flex-wrap gap-3 text-[0.72rem] text-ink-500">
            {items.map(([col, l]) => <span key={l} className="inline-flex items-center gap-1"><i className="inline-block size-3 rounded-[2px] border border-parchment-500" style={{ background: col }} />{l}</span>)}
        </span>
    );
}

/** Canonical IndustryContext returned by the Industry Selector component (IN-SCR-011). */
export function contextJson(ind: { code: string; name: string; cxName: string; reg: string; gate: string; cat: string }, sub: { code: string; name: string } | null, c: { iso2: string; iso3: string }) {
    return {
        industryCode: ind.code, industryName: ind.name, subIndustryCode: sub ? sub.code : null, subIndustryName: sub ? sub.name : null, country: c.iso2, countryIso3: c.iso3,
        complexityClass: ind.cxName, regulatoryState: ind.reg, humanGate: ind.gate, catalogueState: ind.cat, industryMode: 'Active', taxonomyVersion: 'IN-TAX 3.1 (proposed, 17 / 56)', visibleFees: 'T/P/X/S',
    };
}

/** Sector Limitation Statement IN-LIM-{code}-001 (prototype limitStatement). */
export function LimitStatement({ ind, sprintName }: { ind: { code: string; name: string; variant: string }; sprintName?: string }) {
    const nm = sprintName ?? `${ind.name} services`;
    const h = 'mt-3 mb-1 text-[0.88rem] font-semibold text-ink-900';
    return (
        <div className="text-[0.82rem]">
            <p className="text-[0.72rem] text-ink-400">Statement ID IN-LIM-{ind.code}-001 · Version 1.0 · Effective 21 Oct 2026</p>
            <h4 className={h}>Scope</h4>
            <ul className="list-disc ps-5"><li>Assesses business systems, processes and documentation readiness for {nm}.</li><li>Benchmarks against sector standards and target-market requirements.</li><li>Identifies risks, gaps and priority actions; provides recommendations and next steps.</li><li>Information only — not a certification, licence or approval.</li></ul>
            <h4 className={h}>Key limitations</h4>
            <ul className="list-disc ps-5"><li>Not legal, tax or investment advice.</li><li>Not regulatory approval — clearance remains the authority's decision.</li><li>Not a substitute for mandatory inspections, lab testing or certifications.</li><li>Relies on information you provide; results are only as accurate as the evidence supplied.</li><li>Market conditions change — reassess before final execution.</li></ul>
            <h4 className={h}>Out of scope</h4>
            <ul className="list-disc ps-5"><li>Acting as customs broker, clearing agent or licence holder.</li><li>Issuing permits, licences or certificates.</li><li>Guaranteeing export success, buyer acceptance, funding or market access.</li>{ind.variant === 'Highly regulated' && <li>Any activity reserved by law for licensed professionals in this industry.</li>}</ul>
            <h4 className={h}>Professional boundaries</h4>
            <p>Where specialist professional services are required (legal opinions, technical certifications, lab testing, valuation, tax structuring), we connect you to verified professionals on the P ledger.</p>
        </div>
    );
}

export const LEDN: Record<string, string> = { T: 'T — TBCA fee', P: 'P — Professional partner', X: 'X — External provider', S: 'S — Statutory / government' };
export const LedChip = ({ l }: { l: string }) => <Chip t={LEDN[l] ?? l} tone={l === 'T' ? 'gold' : l === 'P' ? 'info' : l === 'X' ? 'warn' : 'grey'} />;

/** Gate grid (prototype .gates). */
export function GateGrid({ gates, done, cur, note }: { gates: [string, string, string][]; done: Record<string, string>; cur?: string | null; note?: (k: string) => ReactNode }) {
    return (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,150px),1fr))] gap-2">
            {gates.map(([k, n, st]) => (
                <div key={k} className={cn('rounded-[6px] border p-2.5 text-[0.78rem]', done[k] ? 'border-verified-500/30 bg-verified-50' : k === cur ? 'border-gold-400 bg-gold-100' : 'border-parchment-400 bg-white')}>
                    <b className="block">{k} · {n}</b>
                    {note && <span className="block text-[0.72rem]">{note(k)}</span>}
                    <span className="block text-[0.72rem] text-ink-400">{st}</span>
                </div>
            ))}
        </div>
    );
}

export const dayS = (d?: string | null) => new Date(d ?? Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
export const nowS = (d?: string | null) => new Date(d ?? Date.now()).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

/* ------------------------------------------------------------------ admin console frame (prototype admPage) */
export const ADM: [string, string, number | null][] = [['', 'Overview', null], ['taxonomy', 'Sector Taxonomy Manager', 27], ['classification', 'Sprint Classification Console', 28], ['margin', 'Complexity & Margin Console', 29], ['blocked', 'Blocked-SKU Register', 30], ['regulators', 'Sector Regulator Register', 31], ['misdeclaration', 'Misdeclaration & Verification Queue', 32], ['benchmarks', 'Benchmark Governance', 33], ['pipeline', 'Industry Activation Pipeline', 34], ['whatsapp', 'Sector-Aware WhatsApp Flows', 35]];

export function AdminPage({ active, title, eyebrow, desc, act, match, children }: { active: string; title: string; eyebrow: string; desc: string; act?: ReactNode; match?: { total: number; matched: number; priced: number; unmatched: number }; children: ReactNode }) {
    const item = ([k, l]: [string, string, number | null]) => (
        <Link key={k} href={`/admin/industries${k ? `/${k}` : ''}`} aria-current={k === active ? 'page' : undefined}
            className={cn('block rounded-[4px] px-2 py-1.5 leading-tight text-ink-700', k === active ? 'bg-gold-100 font-semibold text-ink-900 shadow-[inset_3px_0_0_var(--color-gold-500)]' : 'hover:bg-parchment-200')}>{l}</Link>
    );
    const h6 = 'mx-1.5 mt-3 mb-1 text-[0.72rem] font-semibold tracking-wider text-ink-400 uppercase';
    return (
        <Shell title={`${title} · Industries Admin`} crumbs={[['Admin', '/admin'], ['Industries', '/admin/industries'], ...(active ? [[title] as Crumb] : [])]}>
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
                <aside aria-label="Admin navigation" className="order-2 min-w-0 rounded-[6px] border border-parchment-400 bg-white p-2 text-[0.8rem] lg:order-1">
                    <h6 className={h6}>Admin Console</h6>{ADM.slice(0, 1).map(item)}
                    <h6 className={h6}>Industries Governance</h6>{ADM.slice(1, 8).map(item)}
                    <h6 className={h6}>Activation & Performance</h6>{ADM.slice(8).map(item)}
                    <h6 className={h6}>System</h6>
                    <Link href="/admin" className="block rounded-[4px] px-2 py-1.5 text-ink-700 hover:bg-parchment-200">Staff hub</Link>
                    <Link href="/countries" className="block rounded-[4px] px-2 py-1.5 text-ink-700 hover:bg-parchment-200">Countries</Link>
                </aside>
                <Stack className="order-1 lg:order-2">
                    <Head1 eyebrow={`Admin · ${eyebrow}`} title={title} desc={desc} act={act} />
                    <Note><Ic n="lock" className="me-1 inline" /> Admin surfaces read the live Industries tables. Counts are computed from the 7,589-Sprint classification and the registers{match ? `; ${N(match.matched)} of ${N(match.total)} classified Sprint codes match a Sprint record in the TBCA catalogue (${N(match.unmatched)} do not)` : ''}. Controls that change records say so.</Note>
                    {children}
                    <TrustStrip />
                </Stack>
            </div>
        </Shell>
    );
}
