/*
 * Shared building blocks for the Explore pages rebuilt from the client's "TBCA AIIM Botswana"
 * prototype (landing, cockpit, map view, units, towns, sectors, risk, evidence, unit economics):
 * page frame, dark hero, KPI tiles, panels, charts, pills, evidence-aware rich text, pack text,
 * register tables, embedded-service rails and calls to action. Prototype hash routes map to app
 * URLs through `P`.
 */
import { Head, Link, router, usePage } from '@inertiajs/react';
import * as L from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { createContext, Fragment, useContext, type ReactNode } from 'react';
import { SubNav } from '@/Components/Aiim/Shell';
import { DataTable, N, useMoney, type Col } from '@/Components/Industries/Kit';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';

/* ------------------------------------------------------------------ app URLs for prototype routes */
const BW = '/aiim/country/botswana';
export const EVIDENCE = '/aiim/sources/SRC-TBCA-BW-PACK-1.0';
export const P = {
    home: '/aiim', cockpit: BW, map: `${BW}/map`, mapAt: (focus: string) => `${BW}/map?focus=${encodeURIComponent(focus)}`,
    units: `${BW}/provinces`, unit: (code: string) => `/aiim/province/${code}`, town: (id: string) => `${BW}/towns/${id}`,
    sectors: '/aiim/sectors', sector: (code: string) => `/aiim/sector/${code}`, risk: '/aiim/risk', riskTab: (tab: string) => `/aiim/risk?tab=${tab}`,
    evidence: EVIDENCE, fact: (id: string) => `${EVIDENCE}?fact=${encodeURIComponent(id)}`, economics: `${BW}/economics`,
    opps: '/aiim/opportunities', opp: (id: string) => `/aiim/opportunities/${id}`, projects: '/aiim/projects', project: (id: string) => `/aiim/projects/${id}`,
    investors: '/aiim/investors', funders: '/aiim/funders', corridors: '/aiim/corridors', corridor: (id: string) => `/aiim/corridors/${id}`,
    hs: `${BW}/hs`, hsProduct: (p: string) => `${BW}/hs/${encodeURIComponent(p)}`, leads: `${BW}/leads`, lead: (id: string) => `${BW}/leads/${id}`,
    invinfo: `${BW}/investor-questions`, trdinfo: `${BW}/trader-questions`, pack: `${BW}/pack`, registers: `${BW}/registers`, coverage: `${BW}/coverage`,
    premium: '/aiim/store', brief: (code: string) => `/aiim/store/${code}`, services: '/aiim/services', svc: (code: string) => `/aiim/services/${code}`, sitemap: '/aiim/sitemap',
    advisor: '/aiim/workspace/advisor-request', booking: '/aiim/workspace/advisor-request', custom: '/aiim/custom-intelligence', verify: '/aiim/workspace/advisor-request',
    workspace: '/aiim/workspace', saved: '/aiim/workspace/saved', watchlist: '/aiim/workspace/watchlist', compare: '/aiim/workspace/compare', fees: '/aiim/fees/discover',
};

/* ------------------------------------------------------------------ sectors */
export interface SectorDef { code: string; name: string; color: string; icon: LucideIcon; n: number }
const SEC_LIST: [string, string, string, LucideIcon][] = [
    ['ENR', 'Energy & Power', '#d6a32e', L.Zap], ['OGS', 'Fuels, Strategic Reserves & Coal-bed Methane', '#8a5a2b', L.Fuel], ['MIN', 'Diamonds, Copper & Mining', '#4f8fca', L.Gem],
    ['AGR', 'Livestock, Beef & Horticulture', '#5b8c3a', L.Leaf], ['BLU', 'Fisheries & Aquaculture', '#2a9d9a', L.Fish], ['FOR', 'Forestry & Veld Products', '#2f6b3d', L.TreePine],
    ['MFG', 'Manufacturing, SEZs & Beneficiation', '#7a4fa3', L.Factory], ['WSW', 'Water, Sanitation & Waste', '#2f7fc1', L.Droplet], ['TRN', 'Transport, Corridors & Logistics', '#c96a12', L.Truck],
    ['ICT', 'Digital, Mobile Money & 5G', '#3b5bdb', L.Signal], ['CRE', 'Construction, Roads & Housing', '#8c6d46', L.Construction], ['TOU', 'Tourism (Okavango, Chobe, Kalahari)', '#d9822b', L.Sun],
    ['HLT', 'Health & Pharmaceuticals', '#c0392b', L.Cross], ['EDU', 'Education & Skills', '#6a4c93', L.GraduationCap], ['FIN', 'Finance, Pensions & Fintech', '#1f7a4c', L.Coins],
    ['TRD', 'Trade, Retail & Citizen Markets', '#b5476b', L.ShoppingCart], ['GRN', 'Green Economy & Climate Finance', '#3f9c5a', L.Recycle], ['CSP', 'Creative, Sport & Professional Services', '#9b5de5', L.Star],
];
export const SECTORS: SectorDef[] = SEC_LIST.map(([code, name, color, icon], i) => ({ code, name, color, icon, n: i + 1 }));
export const SEC: Record<string, SectorDef> = Object.fromEntries(SECTORS.map((s) => [s.code, s]));
export const secName = (c: string) => SEC[c]?.name ?? c;

export function SecIcon({ code, size = 34 }: { code: string; size?: number }) {
    const s = SEC[code];
    if (!s) return null;
    const I = s.icon;
    return <span className="inline-grid shrink-0 place-items-center rounded-[8px] text-white" style={{ background: s.color, width: size, height: size }} aria-hidden="true"><I style={{ width: size * 0.5, height: size * 0.5 }} /></span>;
}

export function BwFlag({ w = 36, h = 24, className }: { w?: number; h?: number; className?: string }) {
    return (
        <svg viewBox="0 0 36 24" width={w} height={h} className={cn('inline-block shrink-0 rounded-[2px]', className)} role="img" aria-label="Botswana flag">
            <rect width="36" height="24" fill="#75AADB" /><rect y="9" width="36" height="6" fill="#fff" /><rect y="10" width="36" height="4" fill="#000" />
        </svg>
    );
}

/* ------------------------------------------------------------------ frame */
export interface PCrumb { label: string; href?: string }

/** Page body under the site header and the AIIM sub-navigation: breadcrumbs, then the content. */
export function Frame({ title, crumbs = [], children }: { title: string; crumbs?: PCrumb[]; children: ReactNode }) {
    const all = [{ label: 'AIIM', href: '/aiim' }, ...crumbs];
    return (
        <>
            <Head title={`${title} | AIIM`} />
            <SubNav />
            <div className="bg-parchment-100 text-ink-800">
                <div className="container-tbca py-6">
                    {crumbs.length > 0 && (
                        <nav aria-label="Breadcrumb" className="mb-3">
                            <ol className="flex flex-wrap items-center gap-1 text-[0.8rem] text-ink-500">
                                {all.map((c, i) => (
                                    <li key={`${c.label}-${i}`} className="flex items-center gap-1">
                                        {c.href && i < all.length - 1 ? <Link href={c.href} className="hover:text-gold-700">{c.label}</Link> : <span className="text-ink-800">{c.label}</span>}
                                        {i < all.length - 1 && <span aria-hidden="true">›</span>}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    )}
                    {children}
                </div>
            </div>
        </>
    );
}

export const Eyebrow = ({ children, className }: { children: ReactNode; className?: string }) => (
    <span className={cn('text-[0.72rem] font-bold tracking-[0.14em] text-gold-600 uppercase', className)}>{children}</span>
);

/** Dark page head (prototype pageHead). */
export function Hero({ eyebrow, title, lead, right, meta, className }: { eyebrow: ReactNode; title: ReactNode; lead?: ReactNode; right?: ReactNode; meta?: ReactNode; className?: string }) {
    return (
        <section className={cn('relative overflow-hidden rounded-[16px] bg-ink-950 px-6 py-7 text-parchment-100 sm:px-7', className)}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(214,163,46,.18),transparent_55%)]" aria-hidden="true" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div className="grid min-w-0 flex-[1_1_420px] gap-2.5">
                    <Eyebrow className="text-gold-400">{eyebrow}</Eyebrow>
                    <h1 className="flex flex-wrap items-center gap-3 text-[1.9rem] leading-tight font-bold tracking-tight sm:text-[2.3rem]">{title}</h1>
                    {lead && <div className="max-w-3xl text-[0.95rem] leading-relaxed text-ink-200">{lead}</div>}
                    {meta && <div className="flex flex-wrap items-center gap-2">{meta}</div>}
                </div>
                {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
            </div>
        </section>
    );
}

export const HChip = ({ children, dot }: { children: ReactNode; dot?: boolean }) => (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 px-2.5 py-1 text-[0.75rem] text-ink-200">{dot && <i className="size-1.5 rounded-full bg-verified-500" />}{children}</span>
);

/** Data status chips shown on every Botswana page head (prototype DATAMETA). */
export function DataMeta() {
    return (
        <>
            <HChip dot>Issue BW-1.0 · as of 9 Oct 2026</HChip>
            <HChip>CPDS-1.2 · validator 30/30</HChip>
            <HChip>76 % grade-3 facts</HChip>
            <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-dashed border-gold-500/70 bg-gold-500/10 px-2.5 py-1 text-[0.75rem] text-gold-200"><L.ShieldCheck className="size-3.5" /> AI + human-reviewed public intelligence · not financial or legal advice</span>
        </>
    );
}

/* ------------------------------------------------------------------ buttons */
type BtnTone = 'gold' | 'dark' | 'ghost';
const BTN: Record<BtnTone, string> = {
    gold: 'border-gold-500 bg-gold-500 text-ink-950 hover:bg-gold-400',
    dark: 'border-ink-600 bg-ink-800 text-parchment-100 hover:border-gold-500',
    ghost: 'border-parchment-500 bg-white text-ink-800 hover:border-gold-500',
};
export const btn = (tone: BtnTone = 'ghost', sm = true) => cn('inline-flex items-center justify-center gap-1.5 rounded-full border font-semibold whitespace-nowrap transition-colors disabled:opacity-50', sm ? 'h-8 px-3 text-[0.78rem]' : 'h-10 px-4 text-[0.85rem]', BTN[tone]);

export function Btn({ href, tone = 'ghost', children, sm = true, className }: { href: string; tone?: BtnTone; children: ReactNode; sm?: boolean; className?: string }) {
    if (/^https?:/.test(href)) return <a href={href} target="_blank" rel="noopener" className={cn(btn(tone, sm), className)}>{children}</a>;
    return <Link href={href} className={cn(btn(tone, sm), className)}>{children}</Link>;
}

/** Save a Botswana object to the visitor's saved items (site-wide saved list); guests sign in first. */
export function SaveBtn({ type, itemKey, label, url, tone = 'dark' }: { type: string; itemKey: string; label: string; url: string; tone?: BtnTone }) {
    const { auth } = usePage<SharedProps>().props;
    const go = () => (auth.user ? router.post('/saved', { item_type: type, item_key: itemKey, label, url }, { preserveScroll: true }) : router.visit('/login'));
    return <button type="button" onClick={go} className={btn(tone)}><L.Bookmark className="size-3.5" /> Save</button>;
}

/* ------------------------------------------------------------------ tiles and panels */
export function Kpi({ l, v, s, src, icon: I, dark }: { l: ReactNode; v: ReactNode; s?: ReactNode; src?: ReactNode; icon?: LucideIcon; dark?: boolean }) {
    return (
        <div className={cn('relative min-w-0 rounded-[10px] border px-4 py-3.5', dark ? 'border-ink-700 bg-ink-900/80 text-parchment-100' : 'border-parchment-400 bg-white')}>
            {I && <I className="absolute top-3.5 right-3.5 size-4 text-gold-600" aria-hidden="true" />}
            <div className={cn('text-[0.68rem] font-bold tracking-[0.12em] uppercase', dark ? 'text-ink-300' : 'text-ink-500')}>{l}</div>
            <div className={cn('mt-1 text-[1.6rem] leading-tight font-bold tabular-nums', dark ? 'text-white' : 'text-ink-900')}>{v}</div>
            {s && <div className={cn('mt-1 text-[0.78rem]', dark ? 'text-ink-300' : 'text-ink-600')}>{s}</div>}
            {src && <div className="mt-1 font-mono text-[0.66rem] text-ink-400">{src}</div>}
        </div>
    );
}

export const Grid = ({ cols = 4, children, className }: { cols?: 2 | 3 | 4 | 6; children: ReactNode; className?: string }) => (
    <div className={cn('grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4', { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4', 6: 'sm:grid-cols-3 lg:grid-cols-6' }[cols], className)}>{children}</div>
);

export function Panel({ title, sub, right, children, className, flush, id }: { title?: ReactNode; sub?: ReactNode; right?: ReactNode; children: ReactNode; className?: string; flush?: boolean; id?: string }) {
    return (
        <section id={id} className={cn('min-w-0 rounded-[12px] border border-parchment-400 bg-white', !flush && 'p-4 sm:p-5', className)}>
            {(title || right) && (
                <header className={cn('mb-3 flex flex-wrap items-center justify-between gap-2', flush && 'px-4 pt-4 sm:px-5')}>
                    <h3 className="text-[1.02rem] font-semibold text-ink-900">{title}{sub && <small className="ml-2 text-[0.75rem] font-normal text-ink-500">{sub}</small>}</h3>
                    {right}
                </header>
            )}
            {children}
        </section>
    );
}

export function Section({ title, sub, right, children, id }: { title: ReactNode; sub?: ReactNode; right?: ReactNode; children: ReactNode; id?: string }) {
    return (
        <section id={id} className="mt-8 scroll-mt-24">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-parchment-400 pb-3">
                <div className="min-w-0 max-w-3xl">
                    <h2 className="text-[1.35rem] font-bold text-ink-900">{title}</h2>
                    {sub && <p className="mt-1 text-[0.85rem] text-ink-500">{sub}</p>}
                </div>
                {right}
            </div>
            {children}
        </section>
    );
}

export const MoreBtn = ({ href, children }: { href: string; children: ReactNode }) => <Btn href={href} className="h-7 px-2.5 text-[0.72rem]">{children}</Btn>;

export function Dl({ rows }: { rows: [ReactNode, ReactNode][] }) {
    return (
        <dl className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)] gap-x-4 gap-y-2 text-[0.84rem]">
            {rows.filter((r) => r[1] !== null && r[1] !== '' && r[1] !== undefined).map(([k, v], i) => (
                <Fragment key={i}><dt className="text-ink-500">{k}</dt><dd className="min-w-0 break-words text-ink-800">{v}</dd></Fragment>
            ))}
        </dl>
    );
}

export function Banner({ children, icon: I = L.Bell }: { children: ReactNode; icon?: LucideIcon }) {
    return <div className="flex gap-2 rounded-[10px] border border-dashed border-gold-500/70 bg-gold-50 px-3.5 py-3 text-[0.84rem] text-gold-900"><I className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><div className="min-w-0">{children}</div></div>;
}

export const TagRow = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-wrap gap-1.5">{tags.map((t) => <span key={t} className="rounded-[4px] bg-parchment-200 px-2 py-0.5 font-mono text-[0.7rem] text-ink-600">{t}</span>)}</div>
);

export const Chip = ({ children, className, href }: { children: ReactNode; className?: string; href?: string }) => {
    const cls = cn('inline-flex items-center gap-1 rounded-full border border-parchment-500 bg-white px-2.5 py-0.5 text-[0.75rem] text-ink-700', href && 'hover:border-gold-500', className);
    return href ? <Link href={href} className={cls}>{children}</Link> : <span className={cls}>{children}</span>;
};

/* ------------------------------------------------------------------ pills */
const pill = 'inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-bold whitespace-nowrap';
export function TierPill({ t }: { t: unknown }) {
    const s = String(t ?? '');
    if (!s) return <span className="text-ink-400">—</span>;
    const c = s.startsWith('A+') ? 'bg-gold-500 text-ink-950' : s.startsWith('A') ? 'bg-verified-700 text-white' : s.startsWith('B') ? 'bg-controlled-500 text-white' : 'bg-ink-200 text-ink-700';
    const short = s.length > 16 ? s.slice(0, s.indexOf(' ') > 0 ? s.indexOf(' ') : 16) : s;
    return <span className={cn(pill, c)} title={s}>{short}</span>;
}
export function GradePill({ g }: { g: unknown }) {
    const v = String(g ?? '').trim();
    if (!v) return null;
    const c = v === '3' ? 'bg-verified-50 text-verified-700' : v === '2' ? 'bg-attested-50 text-attested-700' : 'bg-risk-50 text-risk-700';
    return <span className={cn(pill, c)} title="Evidence grade">E{v}</span>;
}
export function StatusPill({ s }: { s: unknown }) {
    const v = String(s ?? '');
    const l = v.toLowerCase();
    let c = 'bg-controlled-50 text-controlled-700';
    if (/pass|signed|operating|complete|held|closed|confirmed|in force|approved|disbursed|done|live|completed/.test(l)) c = 'bg-verified-50 text-verified-700';
    if (/cut|suspend|fail|stale|restrict|routes cut|negative|partly|open|high/.test(l)) c = 'bg-attested-50 text-attested-700';
    if (/not started|pending|planned|proposed|budgeted|under|prepar|studies|commission|design/.test(l)) c = 'bg-controlled-50 text-controlled-700';
    return <span className={cn(pill, c)}>{v}</span>;
}
export function YnPill({ v, yes = 'Yes', ok }: { v: unknown; yes?: string; ok?: boolean }) {
    return String(v ?? '').toLowerCase().startsWith('y') ? <span className={cn(pill, ok ? 'bg-verified-50 text-verified-700' : 'bg-gold-100 text-gold-800')}>{yes}</span> : <span className={cn(pill, 'bg-ink-50 text-ink-500')}>No</span>;
}

/* ------------------------------------------------------------------ rich text: marks and ID links */
/** When set, fact IDs open the evidence drawer in place instead of linking to the evidence page. */
export const FactCtx = createContext<((id: string) => void) | null>(null);

const FACT_SECTORS = 'MAC|ENR|OGS|MIN|AGR|BLU|FOR|MFG|WSW|TRN|ICT|CRE|TOU|HLT|EDU|FIN|TRD|GRN|CSP';
const RICH = new RegExp(String.raw`\[(VERIFY[^\]]*|PROPOSED[^\]]*|COMPUTED[^\]]*|SOURCED[^\]]*)\]|\b(BW-[A-Z]{3}-[SA]\d{2}(?:-O\d{2})?)\b|\b(BW-HL-\d{4})\b|\b(BW-PB-\d{2})\b|\b(UE-\d{2})\b|\b(DG-\d{2})\b|\b((?:BW-)?(?:${FACT_SECTORS})-F\d+)\b`, 'g');
const MARK: Record<string, string> = { verify: 'border-attested-500/50 bg-attested-50 text-attested-700', proposed: 'border-referenced-500/40 bg-referenced-50 text-referenced-700', computed: 'border-controlled-500/40 bg-controlled-50 text-controlled-700', sourced: 'border-verified-500/40 bg-verified-50 text-verified-700' };
const lnk = 'text-controlled-700 underline decoration-dotted underline-offset-2 hover:text-gold-700';

export function FactLink({ id, label }: { id: string; label?: string }) {
    const open = useContext(FactCtx);
    const full = id.startsWith('BW-') ? id : `BW-${id}`;
    if (open) return <button type="button" className={cn(lnk, 'font-mono text-[0.92em]')} onClick={() => open(full)}>{label ?? id}</button>;
    return <Link href={P.fact(full)} className={cn(lnk, 'font-mono text-[0.92em]')}>{label ?? id}</Link>;
}

export function Rich({ t }: { t: unknown }) {
    if (t === null || t === undefined) return null;
    const s = String(t);
    const out: ReactNode[] = [];
    let last = 0;
    let k = 0;
    for (const m of s.matchAll(RICH)) {
        const i = m.index ?? 0;
        if (i > last) out.push(s.slice(last, i));
        const [all, mark, opp, lead, pb, ue, dg, fact] = m;
        if (mark) out.push(<span key={k++} className={cn('mx-0.5 inline-block rounded-[3px] border px-1 text-[0.68rem] font-bold tracking-wide', MARK[mark.split(/[ ,;]/)[0].toLowerCase()] ?? MARK.verify)}>{mark}</span>);
        else if (opp) out.push(<Link key={k++} href={P.opp(opp)} className={lnk}>{opp}</Link>);
        else if (lead) out.push(<Link key={k++} href={P.lead(lead)} className={lnk}>{lead}</Link>);
        else if (pb) out.push(<Link key={k++} href={P.brief(pb)} className={lnk}>{pb}</Link>);
        else if (ue) out.push(<Link key={k++} href={P.economics} className={lnk}>{ue}</Link>);
        else if (dg) out.push(<Link key={k++} href={P.riskTab('gaps')} className={lnk}>{dg}</Link>);
        else if (fact) out.push(<FactLink key={k++} id={fact} />);
        else out.push(all);
        last = i + all.length;
    }
    if (last < s.length) out.push(s.slice(last));
    return <>{out}</>;
}

/* ------------------------------------------------------------------ pack text */
export interface Block { t: 'p' | 'tbl'; s?: string; x?: string; rows?: (string | number | null)[][] }

function Cell({ h, v }: { h: unknown; v: unknown }) {
    const k = String(h ?? '').toLowerCase();
    const s = String(v ?? '');
    if (/^tier|downturn tier|^tier a|tier \(/.test(k) && /^(A|B|C)/.test(s)) return <TierPill t={s} />;
    if ((k === 'grade' || k === 'e') && /^[123]$/.test(s.trim())) return <GradePill g={s} />;
    if (k === 'status' || k === 'result') return <StatusPill s={s} />;
    return <Rich t={s} />;
}

const isNum = (c: unknown) => typeof c === 'number' || (/^[\d,.\-−+ %]+$/.test(String(c ?? '')) && String(c ?? '').length < 14);

export function DocTable({ rows }: { rows: Block['rows'] | null | undefined }) {
    if (!rows || !rows.length) return <p className="text-[0.84rem] text-ink-400">No table.</p>;
    const h = rows[0];
    return (
        <div className="max-w-full overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
            <table className="w-full border-collapse text-[0.78rem]">
                <thead className="bg-parchment-200 text-left"><tr>{h.map((x, i) => <th key={i} className="border-b border-parchment-400 px-2.5 py-2 align-bottom font-semibold text-ink-600">{x}</th>)}</tr></thead>
                <tbody>{rows.slice(1).map((r, i) => <tr key={i} className="border-b border-parchment-300 last:border-0">{r.map((c, j) => <td key={j} className={cn('px-2.5 py-1.5 align-top', isNum(c) && 'text-right whitespace-nowrap tabular-nums')}><Cell h={h[j]} v={c} /></td>)}</tr>)}</tbody>
            </table>
        </div>
    );
}

/** Pack blocks as reading text (prototype renderBlocks). */
export function DocView({ blocks, className }: { blocks: Block[]; className?: string }) {
    const out: ReactNode[] = [];
    let list: ReactNode[] = [];
    const flush = (k: number) => { if (list.length) { out.push(<ul key={`u${k}`} className="my-2 list-disc space-y-1.5 ps-5">{list}</ul>); list = []; } };
    blocks.forEach((b, i) => {
        if (b.t === 'p' && b.s === 'Compact') { list.push(<li key={i}><Rich t={b.x} /></li>); return; }
        flush(i);
        if (b.t === 'tbl') { out.push(<div key={i} className="my-3"><DocTable rows={b.rows} /></div>); return; }
        const x = String(b.x ?? '');
        if (b.s === 'Title') out.push(<h1 key={i} className="text-[1.5rem] font-bold text-ink-900"><Rich t={x} /></h1>);
        else if (b.s === 'Subtitle') out.push(<p key={i} className="text-ink-500"><Rich t={x} /></p>);
        else if (b.s === 'Heading 1') out.push(<h2 key={i} className="mt-4 text-[1.2rem] font-bold text-ink-900"><Rich t={x} /></h2>);
        else if (b.s === 'Heading 2') out.push(<h3 key={i} className="mt-3 text-[1.02rem] font-semibold text-ink-900"><Rich t={x} /></h3>);
        else if (b.s === 'Block Text') out.push(<blockquote key={i} className="my-2 border-l-[3px] border-gold-500 bg-gold-50 px-3 py-2"><Rich t={x} /></blockquote>);
        else {
            const lead = x.length < 90 && /[.:]$/.test(x);
            out.push(<p key={i} className="my-2">{lead ? <b><Rich t={x} /></b> : <Rich t={x} />}</p>);
        }
    });
    flush(blocks.length);
    return <div className={cn('text-[0.9rem] leading-relaxed text-ink-800', className)}>{out}</div>;
}

/* ------------------------------------------------------------------ register tables */
export type Row = Record<string, string | number | null>;
export interface Sheet { name: string; h: string[]; rows: Row[] }
export type CellFmt = (v: unknown, r: Row) => ReactNode;

/** Generic formatter by column name, as the prototype's register tables render them. */
export function autoFmt(k: string): CellFmt | null {
    if (k === 'Tier' || k === 'Downturn tier' || k === 'Tier base' || k === 'Tier downturn' || k === 'Tier pre-gate') return (v) => <TierPill t={v} />;
    if (k === 'Grade') return (v) => <GradePill g={v} />;
    if (k === 'Status' || k === 'Result') return (v) => <StatusPill s={v} />;
    if (k === 'URL') return (v) => (String(v ?? '').startsWith('http') ? <a href={String(v)} target="_blank" rel="noopener" className={lnk}>open</a> : String(v ?? ''));
    if (k === 'Fact ID') return (v) => (v ? <FactLink id={String(v)} /> : null);
    if (k === 'Opp ID' || k === 'Template') return (v) => (v ? <Link href={P.opp(String(v))} className={cn(lnk, 'font-mono')}>{String(v)}</Link> : null);
    return null;
}

/** All columns of a register (prototype sheetTable), filtered, sorted and paged in the browser. */
export function SheetTable({ sheet, rows, filters, size = 15, fmt = {}, cols }: { sheet: Sheet; rows?: Row[]; filters?: string[]; size?: number; fmt?: Record<string, CellFmt>; cols?: string[] }) {
    const data = rows ?? sheet.rows;
    const keys = cols ?? sheet.h;
    const list: Col<Row>[] = keys.map((k) => {
        const f = fmt[k] ?? autoFmt(k);
        return { k, l: k, num: data.length > 0 && data.every((r) => r[k] === null || r[k] === '' || typeof r[k] === 'number'), r: (r: Row) => (f ? f(r[k], r) : <Rich t={r[k]} />) };
    });
    const auto = filters ?? keys.filter((k) => { const u = new Set(data.map((r) => r[k])); return u.size > 1 && u.size <= 24 && data.length > 8; }).slice(0, 4);
    return <DataTable<Row> name={sheet.name} cols={list} rows={data} filters={auto} size={size} compact />;
}

/* ------------------------------------------------------------------ charts */
export interface BarItem { n: string; v: number; c?: string; href?: string; label?: ReactNode; title?: string }

export function HBars({ items, max, fmt = (v: number) => N(v), color = '#d6a32e', cols = 'grid-cols-[minmax(0,11rem)_minmax(0,1fr)_auto]' }: { items: BarItem[]; max?: number; fmt?: (v: number) => ReactNode; color?: string; cols?: string }) {
    const m = max ?? Math.max(...items.map((i) => Number(i.v) || 0), 1);
    return (
        <div className="space-y-1">
            {items.map((i, k) => {
                const body = (
                    <>
                        <span className="truncate text-[0.82rem] text-ink-800" title={i.title ?? i.n}>{i.label ?? i.n}</span>
                        <span className="h-2.5 overflow-hidden rounded-full bg-parchment-300" aria-hidden="true"><i className="block h-full rounded-full" style={{ width: `${(100 * (Number(i.v) || 0)) / m}%`, background: i.c ?? color }} /></span>
                        <span className="text-right font-mono text-[0.78rem] whitespace-nowrap text-ink-700">{fmt(Number(i.v) || 0)}</span>
                    </>
                );
                const cls = cn('grid items-center gap-3 rounded-[6px] px-1 py-1', cols, i.href && 'hover:bg-parchment-200');
                return i.href ? <Link key={k} href={i.href} className={cls}>{body}</Link> : <div key={k} className={cls}>{body}</div>;
            })}
        </div>
    );
}

export interface Seg { n: string; v: number; c: string }
export function DonutSeg({ segs, center, sub, size = 150, th = 22 }: { segs: Seg[]; center: ReactNode; sub?: string; size?: number; th?: number }) {
    const tot = segs.reduce((s, x) => s + x.v, 0) || 1;
    const r = size / 2 - th / 2 - 2;
    const cx = size / 2;
    let a = -Math.PI / 2;
    return (
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={segs.map((s) => `${s.n} ${s.v}`).join(', ')}>
            {segs.map((s, i) => {
                const da = (2 * Math.PI * s.v) / tot;
                if (!s.v) return null;
                const a2 = a + da;
                const d = `M${cx + r * Math.cos(a)},${cx + r * Math.sin(a)} A${r},${r} 0 ${da > Math.PI ? 1 : 0} 1 ${cx + r * Math.cos(a2 - 0.0001)},${cx + r * Math.sin(a2 - 0.0001)}`;
                a = a2;
                return <path key={i} d={d} stroke={s.c} strokeWidth={th} fill="none"><title>{`${s.n}: ${N(s.v)}`}</title></path>;
            })}
            <text x={cx} y={cx - 2} textAnchor="middle" fontSize={20} fontWeight={700} fill="currentColor">{center}</text>
            {sub && <text x={cx} y={cx + 16} textAnchor="middle" fontSize={11} fill="#8a8a96">{sub}</text>}
        </svg>
    );
}
export function SegLegend({ segs }: { segs: Seg[] }) {
    return (
        <div className="grid min-w-[140px] gap-1.5 text-[0.82rem]">
            {segs.map((s) => <div key={s.n} className="flex items-center gap-2"><i className="size-2.5 rounded-[2px]" style={{ background: s.c }} /><span>{s.n}</span><b className="ml-auto font-mono">{N(s.v)}</b></div>)}
        </div>
    );
}
export function DonutBlock({ segs, center, sub, size, th }: { segs: Seg[]; center: ReactNode; sub?: string; size?: number; th?: number }) {
    return <div className="flex flex-wrap items-center gap-4"><DonutSeg segs={segs} center={center} sub={sub} size={size} th={th} /><SegLegend segs={segs} /></div>;
}

const niceMax = (m: number) => { if (m <= 0) return 1; const p = 10 ** Math.floor(Math.log10(m)); const f = m / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; };

/** Vertical bars, negatives allowed (prototype vbars). */
export function VBars({ items, h = 220, fmt = (v: number) => N(v), color = '#d6a32e' }: { items: BarItem[]; h?: number; fmt?: (v: number) => string; color?: string }) {
    const W = Math.max(320, items.length * 44);
    const Pd = { l: 44, r: 10, t: 16, b: 56 };
    const vals = items.map((i) => Number(i.v) || 0);
    const mx = niceMax(Math.max(...vals, 0) || 1);
    const mnr = Math.min(...vals, 0);
    const mn = mnr < 0 ? -niceMax(-mnr) : 0;
    const ih = h - Pd.t - Pd.b;
    const bw = (W - Pd.l - Pd.r) / Math.max(1, items.length);
    const y = (v: number) => Pd.t + (ih * (mx - v)) / (mx - mn);
    return (
        <div className="max-w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${h}`} style={{ minWidth: Math.min(W, 600) }} className="w-full text-[10px]" role="img" aria-label="Bar chart">
                {[0, 1, 2, 3, 4].map((k) => { const v = mn + ((mx - mn) * k) / 4; return <g key={k}><line x1={Pd.l} x2={W - Pd.r} y1={y(v)} y2={y(v)} stroke="#e8e1d2" /><text x={Pd.l - 6} y={y(v) + 4} textAnchor="end" fill="#8a8a96">{fmt(v)}</text></g>; })}
                {mn < 0 && <line x1={Pd.l} x2={W - Pd.r} y1={y(0)} y2={y(0)} stroke="#555" />}
                {items.map((it, i) => {
                    const v = Number(it.v) || 0;
                    const x = Pd.l + i * bw + bw * 0.18;
                    const y0 = y(Math.max(v, 0));
                    const y1 = y(Math.min(v, 0));
                    const lx = x + bw * 0.32;
                    return (
                        <g key={i}>
                            <rect x={x} y={y0} width={bw * 0.64} height={Math.max(0, y1 - y0)} rx={3} fill={it.c ?? color}><title>{`${it.n}: ${fmt(v)}`}</title></rect>
                            <text x={lx} y={v >= 0 ? y0 - 4 : y1 + 12} textAnchor="middle" fill="#3a3a44" fontWeight={600}>{fmt(v)}</text>
                            <text x={lx} y={Pd.t + ih + 14} textAnchor="end" transform={`rotate(-35 ${lx} ${Pd.t + ih + 14})`} fill="#6b6b78">{String(it.n).slice(0, 14)}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

export function Gauge({ v, max, label, sub }: { v: number; max: number; label: string; sub: string }) {
    const a = Math.PI * Math.min(1, v / max);
    const x = 80 - 62 * Math.cos(a);
    const y = 78 - 62 * Math.sin(a);
    return (
        <svg viewBox="0 0 160 96" width={180} role="img" aria-label={`${label} ${sub}`}>
            <path d="M18,78 A62,62 0 0 1 142,78" stroke="#efe7d4" strokeWidth={14} fill="none" strokeLinecap="round" />
            <path d={`M18,78 A62,62 0 0 1 ${x.toFixed(1)},${y.toFixed(1)}`} stroke="#d6a32e" strokeWidth={14} fill="none" strokeLinecap="round" />
            <text x={80} y={70} textAnchor="middle" fontSize={22} fontWeight={700} fill="#16161b">{label}</text>
            <text x={80} y={90} textAnchor="middle" fontSize={10} fill="#6b6b78">{sub}</text>
        </svg>
    );
}

/* ------------------------------------------------------------------ embedded services */
export interface Svc { code: string; name: string; tier: string; delivery: string; aai: number | null; inApp: boolean; from: number | null; entry: string | null }

/** Add an embedded service to the basket at the app's Sprint price. */
export function useAddService() {
    return (s: Svc, ctx?: string) => {
        if (!s.inApp || s.from === null) return;
        router.post('/basket', { item_type: 'aiim-service', item_code: s.code, name: ctx ? `${s.name} (${ctx})` : s.name, variant: s.entry, unit_zar: s.from, commercial_act: 'purchase', meta: { section: 'aiim', country: 'botswana', context: ctx ?? null } }, { preserveScroll: true });
    };
}

export function SvcPrice({ s }: { s: Svc }) {
    const money = useMoney();
    if (!s.inApp || s.from === null) return <span className="text-[0.75rem] font-normal text-ink-400">Not in the app catalogue yet</span>;
    return <>from {money(s.from)}</>;
}

export function SvcRail({ items, title = 'Embedded services on this page' }: { items: Svc[]; title?: string }) {
    const add = useAddService();
    if (!items.length) return null;
    return (
        <Panel title={title} right={<MoreBtn href={P.services}>All 581</MoreBtn>} className="mt-6">
            <div className="divide-y divide-parchment-300">
                {items.map((s) => (
                    <div key={s.code} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-2.5">
                        <div className="min-w-0">
                            <Link href={P.svc(s.code)} className="font-semibold text-ink-900 hover:text-gold-700">{s.name}</Link>
                            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[0.72rem] text-ink-500"><span className="font-mono">{s.code}</span><span>{s.tier} tier</span><span><L.Clock className="inline size-3" /> {s.delivery}</span><span>AAI {s.aai !== null ? `${s.aai}%` : '—'}</span></div>
                        </div>
                        <div className="text-right text-[0.85rem] font-semibold whitespace-nowrap text-ink-900"><SvcPrice s={s} />{s.inApp && s.from !== null && <div className="text-[0.66rem] font-normal text-ink-400">excl. VAT</div>}</div>
                        {s.inApp && s.from !== null ? <button type="button" className={btn('gold')} onClick={() => add(s)}>Add</button> : <Link href={P.svc(s.code)} className={btn('ghost')}>View</Link>}
                    </div>
                ))}
            </div>
        </Panel>
    );
}

/** "Brief available" call to action (prototype briefCTA). */
export function BriefCta({ title, sub, svc, label = 'Get the Brief', className }: { title: string; sub: string; svc: Svc | null | undefined; label?: string; className?: string }) {
    const add = useAddService();
    const ok = svc && svc.inApp && svc.from !== null;
    return (
        <div className={cn('flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-gold-300 bg-gold-50 p-4', className)}>
            <div className="grid min-w-0 flex-[1_1_240px] gap-1">
                <Eyebrow className="inline-flex items-center gap-1"><L.Briefcase className="size-3" /> Brief available</Eyebrow>
                <b className="text-ink-900">{title}</b>
                <span className="text-[0.82rem] text-ink-600">{sub}{svc && <> · <b className="font-mono"><SvcPrice s={svc} /></b>{ok && <> excl. VAT · {svc.delivery}</>}</>}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {ok ? <button type="button" className={btn('gold')} onClick={() => add(svc, title)}><L.Briefcase className="size-3.5" /> {label}</button> : svc ? <Link href={P.svc(svc.code)} className={btn('gold')}>View service</Link> : null}
                <Link href={P.advisor} className={btn('ghost')}>Ask an advisor</Link>
            </div>
        </div>
    );
}

/** Button that adds a brief to the basket (header buttons such as "Download Brief"). */
export function BuyBtn({ svc, ctx, children, tone = 'dark' }: { svc: Svc | null | undefined; ctx: string; children: ReactNode; tone?: BtnTone }) {
    const add = useAddService();
    if (!svc) return null;
    if (!svc.inApp || svc.from === null) return <Link href={P.svc(svc.code)} className={btn(tone)}>{children}</Link>;
    return <button type="button" className={btn(tone)} onClick={() => add(svc, ctx)}>{children}</button>;
}

export function CtaBand({ title = 'Need deeper intelligence or human insight?', text = 'Speak to a TBCA Advisor for tailored market entry, verification, partner mapping and deal advisory in Botswana.' }: { title?: string; text?: string }) {
    return (
        <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[16px] bg-ink-950 px-6 py-6 text-parchment-100">
            <div className="min-w-0 max-w-2xl"><h2 className="text-[1.35rem] font-bold text-white">{title}</h2><p className="mt-1 text-[0.9rem] text-ink-300">{text}</p></div>
            <div className="flex flex-wrap gap-2">
                <Btn href={P.advisor} tone="gold" sm={false}>Speak to an Advisor</Btn>
                <Btn href={P.booking} tone="dark" sm={false}>Book Discovery Call</Btn>
                <Btn href={P.custom} tone="dark" sm={false}>Custom Intelligence</Btn>
            </div>
        </section>
    );
}

/** Honest empty state for a country whose pack is not loaded yet. */
export function PackLoading({ country, what, children }: { country: string; what: string; children?: ReactNode }) {
    return (
        <div className="rounded-[12px] border border-dashed border-parchment-500 bg-white p-6 text-center">
            <L.Hourglass className="mx-auto size-6 text-gold-600" aria-hidden="true" />
            <h3 className="mt-2 text-[1.02rem] font-semibold text-ink-900">{country} country pack loading</h3>
            <p className="mx-auto mt-1 max-w-xl text-[0.85rem] text-ink-500">{what} for {country} will show here once its country pack is issued and loaded. No figures are shown until then.</p>
            {children && <div className="mt-3 flex flex-wrap justify-center gap-2">{children}</div>}
        </div>
    );
}

/* ------------------------------------------------------------------ shock matrix (H-4) */
export const SHOCKS = ['Diamond market', 'SA dependence (power, imports, rand)', 'Fiscal squeeze', 'Water & drought', 'Livestock disease (FMD)', 'Inflation & rates'];

export function ShockHeat({ rows }: { rows: Row[] }) {
    const bg = (v: unknown) => (Number(v) === 2 ? '#b23a2c' : Number(v) === 1 ? '#c96a12' : '#f1ebdf');
    return (
        <div className="max-w-full overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
            <table className="w-full border-collapse text-[0.78rem]">
                <thead className="bg-parchment-200 text-left"><tr><th className="px-2.5 py-2">Sector</th>{SHOCKS.map((s) => <th key={s} className="min-w-[90px] px-2 py-2 font-semibold">{s}</th>)}<th className="px-2 py-2">Index</th><th className="px-2 py-2">Downturn</th><th className="px-2.5 py-2">Rationale (cites facts)</th></tr></thead>
                <tbody>
                    {rows.map((r, i) => r.Sector === 'Basis' ? (
                        <tr key={i} className="border-t border-parchment-300"><td className="px-2.5 py-1.5 font-bold">Basis</td>{SHOCKS.map((s) => <td key={s} className="px-2 py-1.5"><Rich t={r[s]} /></td>)}<td colSpan={3} className="px-2.5 py-1.5 text-ink-400">Shock evidence</td></tr>
                    ) : (
                        <tr key={i} className="border-t border-parchment-300">
                            <td className="px-2.5 py-1.5"><Link href={P.sector(String(r.Sector))} className={lnk}>{r['Sector name']}</Link></td>
                            {SHOCKS.map((s) => <td key={s} className="px-2 py-1.5 text-center font-bold" style={{ background: bg(r[s]), color: Number(r[s]) > 0 ? '#fff' : '#8a8a96' }}>{r[s]}</td>)}
                            <td className="px-2 py-1.5 text-right font-bold">{r.Index}</td><td className="px-2 py-1.5 text-right">{r['Downturn index']}</td><td className="px-2.5 py-1.5"><Rich t={r.Rationale} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ------------------------------------------------------------------ tabs (in-page, prototype tabs()) */
export function PTabs({ tabs, value, onChange }: { tabs: string[]; value: number; onChange: (i: number) => void }) {
    return (
        <div className="flex gap-1 overflow-x-auto border-b border-parchment-400" role="tablist">
            {tabs.map((t, i) => (
                <button key={t} type="button" role="tab" aria-selected={i === value} onClick={() => onChange(i)}
                    className={cn('-mb-px border-b-2 px-3 py-2.5 text-[0.84rem] font-semibold whitespace-nowrap', i === value ? 'border-gold-500 text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-800')}>{t}</button>
            ))}
        </div>
    );
}

/** Freshness of a dated fact against the 18-month rule (prototype freshness, as of Oct 2026). */
export function Freshness({ d }: { d: unknown }) {
    const m = String(d ?? '').match(/(\d{4})-(\d{2})/);
    if (!m) return <span className="text-[0.72rem] text-ink-400">undated</span>;
    const mo = (2026 - Number(m[1])) * 12 + (10 - Number(m[2]));
    return mo <= 18 ? <span className={cn(pill, 'bg-verified-50 text-verified-700')}>{mo} months old · fresh (≤18)</span> : <span className={cn(pill, 'bg-attested-50 text-attested-700')}>{mo} months old · stale (&gt;18)</span>;
}

/** Workspace counters (prototype cockpit KPI row): real counts from the signed-in workspace. */
export function WorkspaceCounts({ snapshot, fees }: { snapshot: { saved: number; watchlist: number; comparisons: number } | null; fees: number }) {
    const items: [string, number | string, string, string][] = [
        ['Saved items', snapshot?.saved ?? '—', 'open', P.saved], ['Watchlist', snapshot?.watchlist ?? '—', 'open', P.watchlist],
        ['Comparisons', snapshot?.comparisons ?? '—', 'build', P.compare], ['Fee manifest', fees, 'review', P.fees],
    ];
    return (
        <Grid cols={4} className="mt-4">
            {items.map(([l, v, a, href]) => <Kpi key={l} l={l} v={v} s={<Link href={href} className="underline">{a}</Link>} />)}
        </Grid>
    );
}
