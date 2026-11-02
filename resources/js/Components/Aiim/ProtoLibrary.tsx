/*
 * Building blocks for the Library and Premium store pages rebuilt from the client's
 * "TBCA AIIM Botswana" prototype: the page frame under the AIIM sub-navigation, the dark page
 * hero, sections and panels, embedded-service rails priced from the app's Sprint records, the
 * fee summary, the country-pack text renderer with live IDs and a small Markdown renderer.
 */
import { Head, Link, router } from '@inertiajs/react';
import { ChevronRight, Clock, Lock, ShieldCheck } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { SubNav, Ribbon } from '@/Components/Aiim/Shell';
import { useMoney } from '@/Components/Industries/Kit';
import { cn } from '@/lib/cn';

/* ------------------------------------------------------------------ types */
export type SvcStatus = 'priced' | 'unpriced' | 'missing' | 'internal';
export interface SvcCard { code: string; name: string; et: string; db: string; a0: number | null; from: number | null; entry: string; ep: number | null; status: SvcStatus; internal: boolean }
export interface LibCountry { slug: string; name: string; iso2: string; flag: string; isBW: boolean; packStatus: string | null; packCode: string | null; hasProvincePack: boolean }
export interface PackBlock { t: 'p' | 'tbl'; s?: string; x?: string; rows?: (string | number | null)[][] }
export interface Crumb { label: string; href?: string }

/* ------------------------------------------------------------------ frame */
/** Content frame under the AIIM sub-navigation (no right rail; the prototype pages have none). */
export function ProtoFrame({ title, crumbs, children }: { title: string; crumbs: Crumb[]; children: ReactNode }) {
    return (
        <>
            <Head title={`${title} | AIIM`} />
            <SubNav />
            <div className="bg-parchment-100">
                <div className="container-tbca min-w-0 py-6">
                    <nav aria-label="Breadcrumb" className="mb-3">
                        <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-400">
                            {[{ label: 'AIIM', href: '/aiim' }, ...crumbs].map((c, i, all) => (
                                <li key={`${c.label}-${i}`} className="flex items-center gap-1">
                                    {c.href && i < all.length - 1 ? <Link href={c.href} className="hover:text-gold-700">{c.label}</Link> : <span className={i === all.length - 1 ? 'text-ink-600' : ''}>{c.label}</span>}
                                    {i < all.length - 1 && <ChevronRight className="size-3" aria-hidden="true" />}
                                </li>
                            ))}
                        </ol>
                    </nav>
                    {children}
                </div>
            </div>
            <Ribbon />
        </>
    );
}

/** Dark page hero (prototype pageHead). */
export function Hero({ eyebrow, title, lead, actions, meta }: { eyebrow?: ReactNode; title: ReactNode; lead?: ReactNode; actions?: ReactNode; meta?: ReactNode }) {
    return (
        <header className="relative overflow-hidden rounded-[14px] bg-ink-950 bg-[radial-gradient(ellipse_at_80%_0%,rgba(212,160,23,.18),transparent_55%)] px-5 py-6 text-parchment-100 sm:px-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="grid min-w-0 flex-[1_1_26rem] gap-2.5">
                    {eyebrow && <span className="text-[0.7rem] font-bold tracking-[0.14em] text-gold-400 uppercase">{eyebrow}</span>}
                    <h1 className="text-[1.6rem] leading-tight font-bold tracking-tight text-white sm:text-[2.1rem]">{title}</h1>
                    {lead && <p className="max-w-3xl text-[0.9rem] leading-relaxed text-ink-200">{lead}</p>}
                    {meta && <div className="flex flex-wrap gap-2">{meta}</div>}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
            </div>
        </header>
    );
}

export function HeroChip({ children, dot }: { children: ReactNode; dot?: boolean }) {
    return <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 px-2.5 py-1 text-[0.72rem] text-ink-200">{dot && <i className="size-1.5 rounded-full bg-verified-500" aria-hidden="true" />}{children}</span>;
}

/** Issue chips shown under Botswana page heroes (prototype DATAMETA). */
export function DataMeta() {
    return (
        <>
            <HeroChip dot>Issue BW-1.0 · as of 9 Oct 2026</HeroChip>
            <HeroChip>CPDS-1.2 · validator 30/30</HeroChip>
            <HeroChip>76 % grade-3 facts</HeroChip>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-gold-600 px-2.5 py-1 text-[0.72rem] text-gold-300"><ShieldCheck className="size-3" />AI + human-reviewed public intelligence · not financial or legal advice</span>
        </>
    );
}

type BtnTone = 'gold' | 'dark' | 'ghost';
const BTN: Record<BtnTone, string> = {
    gold: 'border-gold-500 bg-gold-500 text-ink-950 hover:bg-gold-400',
    dark: 'border-ink-700 bg-ink-900 text-parchment-100 hover:border-gold-500',
    ghost: 'border-parchment-500 bg-white text-ink-800 hover:border-gold-500',
};
export function pill(tone: BtnTone = 'gold', size: 'xs' | 'sm' | 'md' = 'sm') {
    return cn('inline-flex items-center justify-center gap-1.5 rounded-full border font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        size === 'xs' ? 'px-2.5 py-0.5 text-[0.72rem]' : size === 'sm' ? 'px-3 py-1.5 text-[0.78rem]' : 'px-4 py-2 text-[0.85rem]', BTN[tone]);
}
export function PillLink({ href, tone, size, children, className }: { href: string; tone?: BtnTone; size?: 'xs' | 'sm' | 'md'; children: ReactNode; className?: string }) {
    return <Link href={href} className={cn(pill(tone, size), className)}>{children}</Link>;
}

export function Section({ title, sub, right, children, className }: { title: ReactNode; sub?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={cn('mt-7 min-w-0', className)}>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-parchment-400 pb-2">
                <div className="min-w-0">
                    <h2 className="text-[1.2rem] font-bold text-ink-900">{title}</h2>
                    {sub && <p className="text-[0.8rem] text-ink-500">{sub}</p>}
                </div>
                {right}
            </div>
            {children}
        </section>
    );
}

export function Panel({ title, right, children, className }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={cn('min-w-0 rounded-[12px] border border-parchment-400 bg-white p-4 sm:p-5', className)}>
            {(title || right) && (
                <header className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-[1rem] font-bold text-ink-900">{title}</h3>
                    {right}
                </header>
            )}
            {children}
        </section>
    );
}

export function Kpi({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
    return (
        <div className="min-w-0 rounded-[12px] border border-parchment-400 bg-white p-4">
            <div className="text-[0.72rem] font-semibold text-ink-500">{label}</div>
            <div className="mt-1 font-mono text-[1.4rem] leading-tight font-bold text-ink-900">{value}</div>
            {sub && <div className="mt-0.5 text-[0.72rem] text-ink-400">{sub}</div>}
        </div>
    );
}

/** Closing call to action (prototype ctaBand). */
export function CtaBand({ title = 'Need deeper intelligence or human insight?', text = 'Speak to a TBCA Advisor for tailored market entry, verification, partner mapping and deal advisory in Botswana.', children }: { title?: string; text?: string; children?: ReactNode }) {
    return (
        <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[14px] bg-ink-950 px-6 py-5">
            <div className="min-w-0">
                <h2 className="text-[1.2rem] font-bold text-white">{title}</h2>
                <p className="text-[0.85rem] text-ink-300">{text}</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {children ?? (
                    <>
                        <PillLink href="/aiim/workspace/advisor-request" size="md">Speak to an Advisor</PillLink>
                        <PillLink href="/aiim/workspace/advisor-request" tone="dark" size="md">Book Discovery Call</PillLink>
                        <PillLink href="/aiim/custom-intelligence" tone="dark" size="md">Custom Intelligence</PillLink>
                    </>
                )}
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ services */
export const STATUS_TEXT: Record<Exclude<SvcStatus, 'priced'>, string> = {
    missing: 'Not in the app catalogue yet',
    unpriced: 'Not priced in the app yet',
    internal: 'Internal operation',
};

/** Entry price of a service from the app's Sprint records, or why there is none. */
export function SvcPrice({ s, prefix }: { s: { from: number | null; status: SvcStatus }; prefix?: string }) {
    const money = useMoney();
    if (s.status === 'priced' && s.from !== null) return <span className="font-mono font-bold whitespace-nowrap">{prefix}{money(s.from)}</span>;
    return <span className="text-[0.72rem] font-normal text-ink-400">{STATUS_TEXT[s.status === 'priced' ? 'unpriced' : s.status]}</span>;
}

/** Add a service Sprint to the basket at a tier price from the app (prototype data-buy). */
export function addService(s: { code: string; name: string }, tier: string, zar: number, ctx?: string) {
    router.post('/basket', { item_type: 'sprint', item_code: s.code, name: ctx ? `${s.name} (${ctx})` : s.name, variant: tier, unit_zar: Math.round(zar), commercial_act: 'purchase', meta: { section: 'aiim' } }, { preserveScroll: true });
}

export function AddButton({ s, label = 'Add', size = 'xs', ctx, className, tone = 'gold' }: { s: SvcCard; label?: ReactNode; size?: 'xs' | 'sm' | 'md'; ctx?: string; className?: string; tone?: BtnTone }) {
    if (s.internal || s.status !== 'priced' || s.from === null) return null;
    return <button type="button" className={cn(pill(tone, size), className)} onClick={() => addService(s, s.entry, s.from ?? 0, ctx)}>{label}</button>;
}

/** Embedded services on a page (prototype svcRail). */
export function SvcRail({ title = 'Embedded services on this page', items }: { title?: string; items: SvcCard[] }) {
    if (!items.length) return null;
    return (
        <Panel title={title} right={<PillLink href="/aiim/services" tone="ghost" size="xs">All 581</PillLink>}>
            <ul className="grid gap-2.5">
                {items.map((s) => (
                    <li key={s.code} className="rounded-[10px] border border-parchment-400 p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <Link href={`/aiim/services/${s.code}`} className="text-[0.84rem] font-semibold text-ink-900 hover:text-gold-700">{s.name}</Link>
                                <div className="mt-0.5 flex flex-wrap gap-x-2 text-[0.7rem] text-ink-500"><span className="font-mono">{s.code}</span><span>{s.et} tier</span></div>
                                <div className="flex flex-wrap gap-x-2 text-[0.7rem] text-ink-500"><span className="inline-flex items-center gap-1"><Clock className="size-3" />{s.db}</span><span>AAI {s.a0 ?? '—'}%</span></div>
                            </div>
                            <div className="text-right text-[0.84rem]"><SvcPrice s={s} prefix="from " />{s.status === 'priced' && <div className="font-mono text-[0.66rem] text-ink-400">excl. VAT</div>}</div>
                        </div>
                        <div className="mt-2 flex justify-end"><AddButton s={s} /></div>
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

/** Line items with VAT 15 % and total (prototype sumBox). */
export function SumBox({ lines, vat = true }: { lines: { label: string; amount: number }[]; vat?: boolean }) {
    const money = useMoney();
    const sub = lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);
    return (
        <div className="grid text-[0.84rem]">
            {lines.map((l, i) => <div key={i} className="flex justify-between gap-3 border-b border-dashed border-parchment-400 py-2"><span>{l.label}</span><b className="font-mono">{money(l.amount)}</b></div>)}
            {vat && <div className="flex justify-between gap-3 border-b border-dashed border-parchment-400 py-2"><span>VAT 15 %</span><b className="font-mono">{money(sub * 0.15)}</b></div>}
            <div className="flex justify-between gap-3 pt-2.5 text-[1.05rem] font-bold"><span>Total</span><span className="font-mono">{money(vat ? sub * 1.15 : sub)}</span></div>
        </div>
    );
}

/* ------------------------------------------------------------------ rich text */
const OPP = /\bBW-(?:[A-Z]{3})-[SA]\d{2}(?:-O\d{2})?\b/;
const RICH = new RegExp([
    String.raw`\[(?:VERIFY|PROPOSED|COMPUTED|SOURCED)[^\]]*\]`,
    OPP.source,
    String.raw`\bBW-HL-\d{4}\b`,
    String.raw`\bBW-PB-\d{2}\b`,
    String.raw`\bUE-\d{2}\b`,
    String.raw`\bDG-\d{2}\b`,
    String.raw`\b(?:BW-)?(?:MAC|ENR|OGS|MIN|AGR|BLU|FOR|MFG|WSW|TRN|ICT|CRE|TOU|HLT|EDU|FIN|TRD|GRN|CSP)-F\d+\b`,
].join('|'), 'g');
const MARK: Record<string, string> = { verify: 'bg-attested-50 text-attested-700', proposed: 'bg-referenced-50 text-referenced-700', computed: 'bg-controlled-50 text-controlled-700', sourced: 'bg-verified-50 text-verified-700' };

function richLink(tok: string): string | null {
    const bw = '/aiim/country/botswana';
    if (OPP.test(tok)) return `/aiim/opportunities/${tok}`;
    if (/^BW-HL-/.test(tok)) return `${bw}/leads/${tok}`;
    if (/^BW-PB-/.test(tok)) return `/aiim/store/${tok}`;
    if (/^UE-/.test(tok)) return `${bw}/economics`;
    if (/^DG-/.test(tok)) return '/aiim/risk';
    const id = tok.startsWith('BW-') ? tok : `BW-${tok}`;
    return `${bw}/registers/${id.includes('-MAC-') ? 'BW_Macro' : 'BW_Facts'}?q=${encodeURIComponent(id)}`;
}

/** Pack text with evidence markers and live IDs (prototype rich()). */
export function Rich({ text }: { text: unknown }) {
    const s = String(text ?? '');
    const out: ReactNode[] = [];
    let last = 0;
    for (const m of s.matchAll(RICH)) {
        const tok = m[0];
        const at = m.index ?? 0;
        if (at > last) out.push(s.slice(last, at));
        if (tok.startsWith('[')) {
            const inner = tok.slice(1, -1);
            const k = inner.split(/[ ,;]/)[0].toLowerCase();
            out.push(<span key={at} className={cn('rounded-[3px] px-1 text-[0.72rem] font-semibold', MARK[k] ?? MARK.verify)}>{inner}</span>);
        } else {
            const href = richLink(tok);
            out.push(href ? <Link key={at} href={href} className="font-mono text-[0.92em] text-controlled-700 hover:underline">{tok}</Link> : tok);
        }
        last = at + tok.length;
    }
    if (last < s.length) out.push(s.slice(last));
    return <>{out.map((x, i) => <Fragment key={i}>{x}</Fragment>)}</>;
}

/** Table from pack rows: first row is the header (prototype docTableHTML). */
export function RowsTable({ rows, className }: { rows: (string | number | null)[][]; className?: string }) {
    if (!rows.length) return <p className="text-[0.82rem] text-ink-400">No table.</p>;
    const [h, ...body] = rows;
    return (
        <div className={cn('max-w-full overflow-x-auto rounded-[10px] border border-parchment-400', className)}>
            <table className="w-full border-collapse text-[0.78rem]">
                <thead className="bg-parchment-200 text-left"><tr>{h.map((x, i) => <th key={i} className="border-b border-parchment-400 px-2.5 py-2 align-bottom font-semibold text-ink-600">{String(x ?? '')}</th>)}</tr></thead>
                <tbody>
                    {body.map((r, i) => (
                        <tr key={i} className="border-b border-parchment-300 last:border-0">
                            {r.map((c, j) => { const v = String(c ?? ''); return <td key={j} className={cn('px-2.5 py-1.5 align-top', /^[\d,.\-−+ %]+$/.test(v) && v.length < 14 && 'text-right whitespace-nowrap')}><Rich text={v} /></td>; })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/** Pack blocks in reading style (prototype renderBlocks); headings get ids d0, d1... when `ids` is set. */
export function PackBlocks({ blocks, ids }: { blocks: PackBlock[]; ids?: boolean }) {
    const out: ReactNode[] = [];
    let list: ReactNode[] = [];
    let h = 0;
    const flush = (k: number) => { if (list.length) { out.push(<ul key={`ul${k}`} className="my-2 list-disc space-y-1 ps-5 text-[0.86rem] text-ink-700">{list}</ul>); list = []; } };
    blocks.forEach((b, i) => {
        if (b.t === 'p' && b.s === 'Compact') { list.push(<li key={i}><Rich text={b.x} /></li>); return; }
        flush(i);
        if (b.t === 'tbl') { out.push(<RowsTable key={i} rows={b.rows ?? []} className="my-3" />); return; }
        const s = b.s ?? '';
        const x = String(b.x ?? '');
        const isHead = s === 'Title' || /^Heading/.test(s);
        const id = ids && isHead ? `d${h++}` : undefined;
        if (s === 'Title') out.push(<h1 key={i} id={id} className="scroll-mt-24 text-[1.6rem] font-bold text-ink-900"><Rich text={x} /></h1>);
        else if (s === 'Subtitle') out.push(<p key={i} className="my-1.5 text-[0.86rem] text-ink-500"><Rich text={x} /></p>);
        else if (s === 'Heading 1') out.push(<h2 key={i} id={id} className="mt-7 mb-2 scroll-mt-24 border-t-2 border-gold-200 pt-3 text-[1.25rem] font-bold text-ink-900"><Rich text={x} /></h2>);
        else if (/^Heading/.test(s)) out.push(<h3 key={i} id={id} className="mt-4 mb-1.5 scroll-mt-24 text-[1.02rem] font-semibold text-gold-800"><Rich text={x} /></h3>);
        else if (s === 'Block Text') out.push(<blockquote key={i} className="my-2 rounded-r-[6px] border-l-[3px] border-gold-500 bg-gold-50 px-3 py-2.5 text-[0.84rem] text-ink-700"><Rich text={x} /></blockquote>);
        else {
            const lead = x.length < 90 && /[.:]$/.test(x);
            out.push(<p key={i} className="my-1.5 text-[0.86rem] leading-relaxed text-ink-700">{lead ? <b><Rich text={x} /></b> : <Rich text={x} />}</p>);
        }
    });
    flush(blocks.length);
    return <div className="min-w-0">{out}</div>;
}

/* ------------------------------------------------------------------ Markdown (prototype md()) */
function inline(t: string): ReactNode[] {
    const out: ReactNode[] = [];
    const re = /\*\*(.+?)\*\*|`(.+?)`/g;
    let last = 0;
    for (const m of t.matchAll(re)) {
        const at = m.index ?? 0;
        if (at > last) out.push(t.slice(last, at));
        out.push(m[1] !== undefined ? <b key={at}>{m[1]}</b> : <code key={at} className="rounded bg-parchment-200 px-1 font-mono text-[0.85em] break-all">{m[2]}</code>);
        last = at + m[0].length;
    }
    if (last < t.length) out.push(t.slice(last));
    return out;
}

export function Markdown({ src }: { src: string }) {
    const lines = src.split('\n');
    const out: ReactNode[] = [];
    let i = 0;
    while (i < lines.length) {
        const l = lines[i];
        if (/^\|/.test(l)) {
            const rows: string[][] = [];
            while (i < lines.length && /^\|/.test(lines[i])) {
                const cells = lines[i].split('|').slice(1, -1).map((c) => c.trim());
                if (!cells.every((c) => /^-+$/.test(c))) rows.push(cells);
                i++;
            }
            const [h, ...body] = rows;
            out.push(
                <div key={`t${i}`} className="my-3 max-w-full overflow-x-auto rounded-[10px] border border-parchment-400">
                    <table className="w-full border-collapse text-[0.8rem]">
                        <thead className="bg-parchment-200 text-left"><tr>{h.map((c, j) => <th key={j} className="border-b border-parchment-400 px-2.5 py-2 font-semibold">{inline(c)}</th>)}</tr></thead>
                        <tbody>{body.map((r, k) => <tr key={k} className="border-b border-parchment-300 last:border-0">{r.map((c, j) => <td key={j} className="px-2.5 py-1.5 align-top">{inline(c)}</td>)}</tr>)}</tbody>
                    </table>
                </div>,
            );
            continue;
        }
        if (/^- /.test(l)) {
            const items: string[] = [];
            while (i < lines.length && /^- /.test(lines[i])) items.push(lines[i++].slice(2));
            out.push(<ul key={`u${i}`} className="my-2 list-disc space-y-1 ps-5 text-[0.86rem]">{items.map((x, j) => <li key={j}>{inline(x)}</li>)}</ul>);
            continue;
        }
        if (/^### /.test(l)) out.push(<h3 key={i} className="mt-4 mb-1.5 text-[1.02rem] font-semibold text-gold-800">{inline(l.slice(4))}</h3>);
        else if (/^## /.test(l)) out.push(<h2 key={i} className="mt-6 mb-2 text-[1.2rem] font-bold text-ink-900">{inline(l.slice(3))}</h2>);
        else if (/^# /.test(l)) out.push(<h1 key={i} className="text-[1.5rem] font-bold text-ink-900">{inline(l.slice(2))}</h1>);
        else if (/^---/.test(l)) out.push(<hr key={i} className="my-5 border-parchment-400" />);
        else if (l.trim()) out.push(<p key={i} className="my-2 text-[0.86rem] leading-relaxed text-ink-700">{inline(l)}</p>);
        i++;
    }
    return <div className="min-w-0">{out}</div>;
}

/* ------------------------------------------------------------------ countries without a pack */
/** "Country pack loading" state for countries without a loaded pack. Shows the app's own pack status; no figures. */
export function PackLoading({ country, what }: { country: LibCountry; what: string }) {
    return (
        <Panel className="mt-4">
            <div className="flex flex-wrap items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-50 text-gold-700"><Lock className="size-5" /></span>
                <div className="min-w-0 flex-1">
                    <h2 className="text-[1.05rem] font-bold text-ink-900">Country pack loading: {country.name}</h2>
                    <p className="mt-1 text-[0.86rem] text-ink-600">
                        The {what} for {country.name} opens when its country pack is loaded. Pack status: <b>{country.packStatus ?? 'Not started'}</b>{country.packCode ? <> ({country.packCode})</> : null}.
                        {country.hasProvincePack ? ' The province-level model pack already drives this country\'s cockpit and province pages.' : ''}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <PillLink href={`/aiim/country/${country.slug}`} tone="dark">{country.name} cockpit</PillLink>
                        <PillLink href="/aiim/country/botswana/pack" tone="ghost">See the Botswana pack (BW-1.0)</PillLink>
                        <PillLink href="/aiim/custom-intelligence" tone="ghost">Request custom intelligence</PillLink>
                    </div>
                </div>
            </div>
        </Panel>
    );
}

export const N = (x: number | null | undefined) => (x === null || x === undefined ? '—' : x.toLocaleString('en-US'));
