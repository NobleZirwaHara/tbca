import { Head, Link, router } from '@inertiajs/react';
import { Check, ChevronRight, Clock, ShieldCheck } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { Chip, statusTone, useMoney, type Tone } from '@/Components/Industries/Kit';
import { cn } from '@/lib/cn';
import { SubNav } from './Shell';

/*
 * Building blocks for the engagement and mandate pages (mock-ups 39 to 70) of the
 * client's "TBCA AIIM Botswana" prototype: the flow() frame with its step bar and dark
 * page head, panels, definition lists, price summaries, embedded-service rails, brief
 * call-outs, timelines and form panels. Prices are the app's Sprint prices (ZAR excl. VAT).
 */

export const ADV = ['Request', 'Discovery', 'Quote', 'Engage', 'Sign', 'Deposit', 'Deliver'];
export const VER = ['Scope', 'Costs', 'Progress', 'Report'];
export const DEAL = ['Package', 'Consent', 'Introduce', 'Hand-off', 'Accept'];

export interface Svc {
    code: string;
    name: string;
    cat: string | null;
    delivery: string | null;
    tier: string | null;
    aai: number | null;
    price: number | null;
}

export interface Rail {
    title: string;
    items: Svc[];
}

export interface Country {
    slug: string;
    name: string;
    iso2: string;
    isBw: boolean;
    pack: string | null;
}

export interface Crumb {
    label: string;
    href?: string;
}

/* ------------------------------------------------------------------ links */

export const eng = (ref: string, path = '') => `/aiim/workspace/engagements/${ref}${path}`;
export const svcHref = (code: string) => `/aiim/services/${code}`;
export const oppHref = (id: string) => `/aiim/opportunities?q=${encodeURIComponent(id)}`;
export const townHref = (slug: string, id: string) => `/aiim/country/${slug}/towns/${encodeURIComponent(id)}`;
export const leadHref = (slug: string, id: string) => `/aiim/country/${slug}/leads/${encodeURIComponent(id)}`;

/** Add a priced embedded service to the site basket (the same Sprint line the Countries tab adds). */
export function addToBasket(s: Svc, context?: string) {
    if (!s.price) return;
    router.post('/basket', { item_type: 'sprint', item_code: s.code, name: s.name, variant: s.tier, unit_zar: s.price, commercial_act: 'purchase', meta: { section: 'aiim', context: context ?? null } }, { preserveScroll: true });
}

/* ------------------------------------------------------------------ buttons */

type BtnV = 'gold' | 'ghost' | 'dark' | 'danger';
const BTN: Record<BtnV, string> = {
    gold: 'border-gold-500 bg-gold-500 text-ink-900 hover:bg-gold-400',
    ghost: 'border-parchment-500 bg-white text-ink-800 hover:border-gold-500',
    dark: 'border-ink-700 bg-ink-900 text-parchment-100 hover:border-gold-500',
    danger: 'border-risk-500 bg-white text-risk-700 hover:bg-risk-50',
};
export function btn(v: BtnV = 'gold', size: 'xs' | 'sm' | 'md' = 'md') {
    return cn('inline-flex items-center justify-center gap-1.5 rounded-full border font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        size === 'xs' ? 'min-h-[26px] px-2.5 text-[0.72rem]' : size === 'sm' ? 'min-h-[32px] px-3.5 text-[0.8rem]' : 'min-h-[40px] px-4.5 text-[0.85rem]', BTN[v]);
}
export function Btn({ href, v = 'gold', size = 'md', children, className }: { href: string; v?: BtnV; size?: 'xs' | 'sm' | 'md'; children: ReactNode; className?: string }) {
    return <Link href={href} className={cn(btn(v, size), className)}>{children}</Link>;
}

/* ------------------------------------------------------------------ frame */

export function StepBar({ list, on }: { list: string[]; on: number }) {
    return (
        <ol className="mb-3.5 flex flex-wrap gap-1 rounded-full border border-parchment-400 bg-white p-1" aria-label="Journey">
            {list.map((s, i) => (
                <li key={s} aria-current={i === on ? 'step' : undefined}
                    className={cn('min-w-[5.5rem] flex-1 rounded-full px-3 py-1.5 text-center text-[0.78rem]', i < on ? 'text-verified-700' : i === on ? 'bg-gold-500 font-semibold text-ink-900' : 'text-ink-500')}>
                    {i < on && <span aria-hidden="true">✓ </span>}{s}
                </li>
            ))}
        </ol>
    );
}

/** The prototype's flow(): breadcrumbs, step bar, dark page head, then main and side columns. */
export function Flow({ title, eyebrow, lead, crumbs = [], steps, right, side, children, foot }: {
    title: string; eyebrow?: ReactNode; lead?: ReactNode; crumbs?: Crumb[]; steps?: { list: string[]; on: number }; right?: ReactNode; side?: ReactNode; children: ReactNode; foot?: ReactNode;
}) {
    const all: Crumb[] = [{ label: 'AIIM', href: '/aiim' }, ...crumbs, { label: title }];
    return (
        <>
            <Head title={`${title} | AIIM`} />
            <SubNav />
            <div className="bg-parchment-100">
                <div className="container-tbca py-6">
                    <nav aria-label="Breadcrumb" className="mb-3">
                        <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-500">
                            {all.map((c, i) => (
                                <li key={`${c.label}-${i}`} className="flex items-center gap-1">
                                    {c.href && i < all.length - 1 ? <Link href={c.href} className="hover:text-gold-700">{c.label}</Link> : <span>{c.label}</span>}
                                    {i < all.length - 1 && <ChevronRight className="size-3" aria-hidden="true" />}
                                </li>
                            ))}
                        </ol>
                    </nav>
                    {steps && <StepBar list={steps.list} on={steps.on} />}
                    <header className="relative overflow-hidden rounded-[14px] bg-ink-950 bg-[radial-gradient(ellipse_at_80%_0%,rgba(201,154,46,0.18),transparent_55%)] px-7 py-7 text-parchment-100">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="grid min-w-0 flex-[1_1_420px] gap-2.5">
                                {eyebrow && <span className="text-[0.72rem] font-bold tracking-[0.14em] text-gold-400 uppercase">{eyebrow}</span>}
                                <h1 className="text-[1.75rem] leading-tight font-bold tracking-tight text-white sm:text-[2.25rem]">{title}</h1>
                                {lead && <p className="max-w-3xl text-[0.95rem] text-ink-200">{lead}</p>}
                            </div>
                            {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
                        </div>
                    </header>
                    <div className={cn('mt-4 grid gap-4', side && 'lg:grid-cols-[minmax(0,1fr)_21rem]')}>
                        <div className="grid min-w-0 content-start gap-4">{children}</div>
                        {side && <aside className="grid content-start gap-4" aria-label="Related">{side}</aside>}
                    </div>
                    {foot}
                </div>
            </div>
        </>
    );
}

/* ------------------------------------------------------------------ blocks */

export function Panel({ title, right, children, className }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={cn('min-w-0 rounded-[12px] border border-parchment-400 bg-white p-5', className)}>
            {(title || right) && (
                <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    {title && <h2 className="text-[1.05rem] font-semibold text-ink-900">{title}</h2>}
                    {right}
                </header>
            )}
            {children}
        </section>
    );
}

export function Dl({ rows }: { rows: [string, ReactNode][] }) {
    const shown = rows.filter(([, v]) => v !== null && v !== undefined && v !== '');
    return (
        <dl className="grid grid-cols-[fit-content(40%)_minmax(0,1fr)] gap-x-6 gap-y-2 text-[0.85rem]">
            {shown.map(([k, v]) => (
                <div key={k} className="contents">
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="min-w-0 break-words text-ink-900">{v}</dd>
                </div>
            ))}
        </dl>
    );
}

/** The prototype's sumBox(): lines, VAT 15 % and total. A null amount shows as not priced. */
export function SumBox({ lines, vat = true, total }: { lines: [ReactNode, number | null][]; vat?: boolean; total?: { label?: string; vatOn?: number } }) {
    const money = useMoney();
    const sub = lines.reduce((s, [, v]) => s + (Number(v) || 0), 0);
    const base = total?.vatOn ?? sub;
    const v15 = Math.round(base * 15) / 100;
    return (
        <div className="text-[0.88rem]">
            {lines.map(([l, v], i) => (
                <div key={i} className="flex justify-between gap-3 border-b border-dashed border-parchment-400 py-2">
                    <span className="min-w-0">{l}</span>
                    <b className="font-mono whitespace-nowrap">{v === null ? <span className="font-sans text-xs font-normal text-ink-500">Not in the app catalogue yet</span> : (v < 0 ? '−' : '') + money(Math.abs(v))}</b>
                </div>
            ))}
            {vat && <div className="flex justify-between gap-3 border-b border-dashed border-parchment-400 py-2"><span>VAT 15 %</span><b className="font-mono">{money(v15)}</b></div>}
            <div className="flex justify-between gap-3 pt-2.5 text-[1.05rem] font-bold"><span>{total?.label ?? 'Total'}</span><b className="font-mono">{money(vat ? sub + v15 : sub)}</b></div>
        </div>
    );
}

export function Price({ s }: { s: Svc }) {
    const money = useMoney();
    if (!s.price) return <span className="text-[0.72rem] text-ink-500">Not in the app catalogue yet</span>;
    return <span className="font-mono text-[0.85rem] font-bold whitespace-nowrap">from {money(s.price)}<span className="block text-right font-sans text-[0.66rem] font-normal text-ink-500">excl. VAT</span></span>;
}

export function SvcRow({ s, context, action }: { s: Svc; context?: string; action?: ReactNode }) {
    return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1.5 rounded-[10px] border border-parchment-400 p-3">
            <div className="min-w-0">
                <Link href={svcHref(s.code)} className="text-[0.85rem] font-semibold text-ink-900 hover:text-gold-700">{s.name}</Link>
                <div className="mt-0.5 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[0.72rem] text-ink-500">
                    <span className="font-mono">{s.code}</span>
                    {s.tier && <span>{s.tier} tier</span>}
                    {s.delivery && <span className="inline-flex items-center gap-1"><Clock className="size-3" aria-hidden="true" />{s.delivery}</span>}
                    {s.aai !== null && <span>AAI {s.aai}%</span>}
                </div>
            </div>
            <div className="text-right"><Price s={s} /></div>
            <div className="col-span-2 flex justify-end">{action ?? (s.price ? <button type="button" className={btn('gold', 'xs')} onClick={() => addToBasket(s, context)}>Add</button> : null)}</div>
        </div>
    );
}

/** The prototype's svcRail(). */
export function SvcRail({ rail, context }: { rail: Rail; context?: string }) {
    if (!rail.items.length) return null;
    return (
        <Panel title={rail.title} right={<Link href="/aiim/services" className={btn('ghost', 'xs')}>All 581</Link>}>
            <div className="grid gap-2">{rail.items.map((s) => <SvcRow key={s.code} s={s} context={context} />)}</div>
        </Panel>
    );
}

/** The prototype's briefCTA(). */
export function BriefCta({ title, sub, s, label = 'Get the Brief', context }: { title: string; sub: string; s: Svc | null; label?: string; context?: string }) {
    const money = useMoney();
    return (
        <div className="grid gap-3 rounded-[12px] border border-gold-300 bg-gold-50 p-4">
            <div className="grid gap-1">
                <span className="text-[0.7rem] font-bold tracking-[0.12em] text-gold-700 uppercase">Brief available</span>
                <b className="text-ink-900">{title}</b>
                <span className="text-[0.8rem] text-ink-600">{sub}{s && (s.price ? <> · from <b className="font-mono">{money(s.price)}</b> excl. VAT{s.delivery ? ` · ${s.delivery}` : ''}</> : ' · Not in the app catalogue yet')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {s?.price ? <button type="button" className={btn('gold', 'sm')} onClick={() => addToBasket(s, context ?? title)}>{label}</button> : s && <Link href={svcHref(s.code)} className={btn('gold', 'sm')}>{label}</Link>}
                <Link href="/aiim/workspace/advisor-request" className={btn('ghost', 'sm')}>Ask an advisor</Link>
            </div>
        </div>
    );
}

export function Banner({ children, tone = 'gold' }: { children: ReactNode; tone?: 'gold' | 'info' }) {
    return (
        <div className={cn('flex gap-2 rounded-[10px] border border-dashed px-3.5 py-3 text-[0.82rem]', tone === 'gold' ? 'border-gold-400 bg-gold-50 text-gold-800' : 'border-controlled-500/40 bg-controlled-50 text-controlled-700')}>
            <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><div className="min-w-0">{children}</div>
        </div>
    );
}

export type TiState = 'done' | 'on' | '';
export function Timeline({ items }: { items: [ReactNode, TiState][] }) {
    return (
        <ol className="relative grid gap-3 border-l-2 border-parchment-400 pl-5">
            {items.map(([t, st], i) => (
                <li key={i} className="relative text-[0.85rem] text-ink-800">
                    <span className={cn('absolute top-0.5 -left-[1.72rem] grid size-4 place-items-center rounded-full border-2', st === 'done' ? 'border-verified-500 bg-verified-500 text-white' : st === 'on' ? 'border-gold-500 bg-gold-500' : 'border-parchment-500 bg-white')} aria-hidden="true">
                        {st === 'done' && <Check className="size-2.5" />}
                    </span>
                    {t}
                </li>
            ))}
        </ol>
    );
}

export function QuickLinks({ links }: { links: [string, string][] }) {
    return (
        <nav className="grid gap-1.5 rounded-[12px] border border-parchment-400 bg-white p-3">
            {links.map(([l, h]) => <Link key={h + l} href={h} className="flex items-center gap-2 rounded-[8px] px-2 py-1.5 text-[0.85rem] font-medium text-ink-800 hover:bg-parchment-100 hover:text-gold-700"><ChevronRight className="size-3.5 text-gold-600" aria-hidden="true" />{l}</Link>)}
        </nav>
    );
}

export function Empty({ children }: { children: ReactNode }) {
    return <div className="grid justify-items-center gap-2 rounded-[12px] border border-dashed border-parchment-500 bg-white px-6 py-10 text-center text-[0.9rem] text-ink-600">{children}</div>;
}

/** Shown where a page reads the country pack and the engagement's country has none loaded yet. */
export function PackLoading({ country, what }: { country: Country | null; what: string }) {
    return (
        <Banner tone="info">
            <b>Country pack loading.</b> {what} {country ? `comes from the ${country.name} country pack, which is not loaded yet.` : 'needs the engagement country, which is not set on this request.'} Botswana (BW-1.0) is the first pack loaded.
        </Banner>
    );
}

export function Pill({ s, tone }: { s: ReactNode; tone?: Tone }) {
    return <Chip t={s} tone={tone ?? statusTone(s)} />;
}

export function TierPill({ t }: { t: unknown }) {
    const s = String(t ?? '');
    if (!s) return <span className="text-ink-400">—</span>;
    const tone: Tone = s.startsWith('A+') ? 'ok' : s.startsWith('A') ? 'gold' : s.startsWith('B') ? 'info' : 'grey';
    return <Chip t={s.length > 16 ? s.slice(0, s.indexOf(' ') > 0 ? s.indexOf(' ') : 16) : s} tone={tone} />;
}

/* ------------------------------------------------------------------ forms */

export const inputCls = 'w-full min-w-0 rounded-[8px] border border-parchment-500 bg-white px-3 py-2 text-[0.88rem] text-ink-900 focus:border-gold-500 focus:outline-none';

export function Fld({ label, children, error, className }: { label: ReactNode; children: ReactNode; error?: string; className?: string }) {
    return (
        <label className={cn('grid min-w-0 gap-1.5 text-[0.82rem] font-semibold text-ink-800', className)}>
            {label}
            {children}
            {error && <span role="alert" className="text-[0.75rem] font-normal text-risk-700">{error}</span>}
        </label>
    );
}

export function Chk({ checked, onChange, children, error }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; error?: string }) {
    return (
        <div className="grid gap-1">
            <label className="flex items-start gap-2 text-[0.85rem] text-ink-800">
                <input type="checkbox" className="mt-0.5 size-4 accent-gold-600" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <span className="min-w-0">{children}</span>
            </label>
            {error && <span role="alert" className="pl-6 text-[0.75rem] text-risk-700">{error}</span>}
        </div>
    );
}

/** The prototype's formPanel(): title, fields, a gold submit button and Back. */
export function FormPanel({ title, children, submit, onSubmit, processing, disabled, back, extra }: {
    title: ReactNode; children: ReactNode; submit: string; onSubmit: (e: FormEvent) => void; processing?: boolean; disabled?: boolean; back?: string; extra?: ReactNode;
}) {
    return (
        <form onSubmit={onSubmit} className="grid min-w-0 gap-3 rounded-[12px] border border-parchment-400 bg-white p-5">
            <h2 className="text-[1.05rem] font-semibold text-ink-900">{title}</h2>
            {children}
            <div className="flex flex-wrap gap-2">
                <button type="submit" className={btn('gold')} disabled={processing || disabled}>{submit}</button>
                {back ? <Link href={back} className={btn('ghost')}>Back</Link> : <button type="button" className={btn('ghost')} onClick={() => window.history.back()}>Back</button>}
                {extra}
            </div>
        </form>
    );
}

/** Simple table for small registers. */
export function Table({ head, rows }: { head: ReactNode[]; rows: ReactNode[][] }) {
    return (
        <div className="max-w-full overflow-x-auto rounded-[10px] border border-parchment-400">
            <table className="w-full border-collapse text-[0.8rem]">
                <thead className="bg-parchment-200 text-left text-[0.7rem] tracking-wide text-ink-600 uppercase">
                    <tr>{head.map((h, i) => <th key={i} className="border-b border-parchment-400 px-3 py-2 font-semibold whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.length ? rows.map((r, i) => (
                        <tr key={i} className="border-b border-parchment-300 last:border-0">{r.map((c, j) => <td key={j} className="px-3 py-2 align-top">{c}</td>)}</tr>
                    )) : <tr><td colSpan={head.length} className="px-3 py-5 text-center text-ink-500">Nothing to show yet.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

/** Ref links to every mandate page of an engagement, for the side column. */
export function mandateLinks(ref: string): [string, string][] {
    return [
        ['Mandate workspace', eng(ref)], ['Verification scope', eng(ref, '/verification/scope')], ['Market and sector deep dive', eng(ref, '/deep-dive')],
        ['Project packaging', eng(ref, '/packaging')], ['Introductions', eng(ref, '/introductions')], ['Due diligence hand-off', eng(ref, '/handoff/dd')],
        ['Delivery acceptance', eng(ref, '/delivery')], ['Transaction ledger', eng(ref, '/ledger')],
    ];
}
