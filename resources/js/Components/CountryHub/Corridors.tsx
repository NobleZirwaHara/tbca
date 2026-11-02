/*
 * Corridors & Ledgers frame (prototype pages-corridors.js corrPage, corrHead and CHIP): page frame with
 * Countries › Corridors breadcrumbs, the corridor heading with both endpoints and the view pills.
 */
import type { ReactNode } from 'react';
import { Chip, Flag, PillNav, type Tone } from '@/Components/Industries/Kit';
import type { Crumb } from '@/Components/Industries/Layout';
import { HubPage } from '@/Components/CountryHub/Layout';
import { convertZar, useCurrency } from '@/lib/money';

export interface Endpoint { iso3: string; iso2: string; slug: string; name: string; state: string; region: string }
export interface Pair {
    a: string; b: string; st: string; items: number; conf: number; type: string; days: string; shared: string[]; id: string;
    A: Endpoint; B: Endpoint; sellable: boolean;
}
export type Totals = Record<string, number>;
export type Ledg = [string, string, string, number];

/** Six ledgers: code, name, what it covers, share (prototype LEDG). */
export const LEDG: Ledg[] = [
    ['T', 'TBCA Fees', 'TBCA professional fees', 0.175], ['X', 'External Fees', 'Crossing, liquidity, banking, couriers', 0.391],
    ['S', 'Statutory Fees', 'Government filings, permits, duties', 0.051], ['P', 'Partner Fees', 'Licensed partner review (legal, tax, audit)', 0.22],
    ['D', 'Data & Licence Fees', 'Evidence and data licences', 0.087], ['CT-C', 'Corridor Fees', 'Corridor activation and transit', 0.076],
];

export const corUrl = (view: string, a: string, b: string) => `/countries/corridors/${view}/${a}/${b}`;

const STONE: Record<string, Tone> = { 'High Confidence': 'ok', 'Evidence Available': 'info', 'Limited Evidence': 'warn' };
/** Evidence state chip (prototype CHIP). */
export const CorrChip = ({ s }: { s: string }) => <Chip t={s} tone={STONE[s] ?? 'grey'} />;

/** Money with two decimals in the display currency (prototype money(v, { d: 2 })). */
export function useMoney2() {
    const { currency, rates } = useCurrency();
    return (zar: number | null | undefined) => {
        if (zar === null || zar === undefined || Number.isNaN(Number(zar))) return '—';
        const v = convertZar(Number(zar), currency, rates);
        const f = (loc: string) => v.toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (currency === 'ZAR') return `R${f('en-ZA').replace(/[  ]/g, ' ')}`;
        if (currency === 'USD') return `$${f('en-US')}`;
        if (currency === 'EUR') return `€${f('en-IE')}`;
        if (currency === 'CNY') return `¥${f('zh-CN')}`;
        if (currency === 'XOF') return `${f('fr-FR').replace(/[  ]/g, ' ')} CFA`;
        return `${currency} ${f('en-US')}`;
    };
}

/** Page title block (prototype .ptitle). */
export function PTitle({ eyebrow, title, desc, act }: { eyebrow?: ReactNode; title: ReactNode; desc?: ReactNode; act?: ReactNode }) {
    return (
        <div className="flex flex-wrap items-start gap-4">
            <div className="min-w-0 flex-1 basis-[22rem]">
                {eyebrow && <div className="text-[0.72rem] font-semibold tracking-[0.14em] text-gold-700 uppercase">{eyebrow}</div>}
                <h1 className="mt-1 text-[1.6rem] leading-tight font-bold text-ink-900 sm:text-[1.85rem]">{title}</h1>
                {desc && <p className="mt-1.5 max-w-[60rem] text-[0.9rem] text-ink-500">{desc}</p>}
            </div>
            {act && <div className="ml-auto flex flex-wrap items-center gap-2">{act}</div>}
        </div>
    );
}

const VIEWS: [string, string][] = [
    ['detail', 'Corridor Detail'], ['compare', 'Endpoint Comparison'], ['evidence', 'Pair Evidence'], ['ledger/T', 'Ledger T'], ['ledger/X', 'X'], ['ledger/S', 'S'],
    ['ledger/P', 'P'], ['ledger/D', 'D'], ['ledger/CT-C', 'CT-C'], ['fees', 'Fee Schedule Comparison'], ['outlook', '12-Month Outlook'],
];

/** Corridor heading (prototype corrHead): title, both endpoints, evidence chips and the view pills. */
export function CorridorHead({ cr, view, title, sub, back }: { cr: Pair; view: string; title: ReactNode; sub: ReactNode; back?: ReactNode }) {
    return (
        <>
            <PTitle eyebrow="Countries › Corridors" title={title} desc={sub} act={back} />
            <div className="flex flex-wrap items-center gap-4 rounded-[6px] border border-parchment-400 bg-white p-4">
                <Flag iso2={cr.A.iso2} className="text-[2rem]" />
                <div><b>{cr.A.name}</b><div className="text-[0.72rem] text-ink-400">Departure · {cr.A.state}</div></div>
                <span className="text-[1.6rem] text-gold-600" aria-hidden="true">→</span>
                <Flag iso2={cr.B.iso2} className="text-[2rem]" />
                <div><b>{cr.B.name}</b><div className="text-[0.72rem] text-ink-400">Arrival · {cr.B.state}</div></div>
                <div className="ml-auto flex flex-wrap gap-1.5">
                    <CorrChip s={cr.st} />
                    <Chip t={`${cr.items} evidence items`} tone="info" />
                    <Chip t={`Confidence ${cr.conf} %`} tone={cr.conf >= 80 ? 'ok' : cr.conf >= 50 ? 'warn' : 'grey'} />
                    {cr.sellable ? <Chip t="Sellable — both endpoints activated" tone="ok" /> : <Chip t="Pair evidence required before sale" tone="warn" />}
                </div>
            </div>
            <PillNav items={VIEWS.map(([k, l]) => ({ label: l, href: corUrl(k, cr.a, cr.b), on: k === view }))} />
        </>
    );
}

/** Crumb for the pair, linked to its detail page unless this is the detail page. */
export const pairCrumb = (cr: Pair, link = true): Crumb => [`${cr.A.name} → ${cr.B.name}`, link ? corUrl('detail', cr.a, cr.b) : undefined];

/** Corridor page frame (prototype corrPage): Countries › Corridors › … */
export function CorrPage({ crumbs, children }: { crumbs: Crumb[]; children: ReactNode }) {
    const list: Crumb[] = [['Countries', '/countries'], ['Corridors', '/countries/corridors'], ...crumbs];
    const title = [...list].slice(1).reverse().map((x) => x[0]).join(' · ');
    return <HubPage title={title} crumbs={list}>{children}</HubPage>;
}

/** Legend row with colour swatches. */
export function Legend({ items, extra }: { items: [string, ReactNode][]; extra?: ReactNode }) {
    return (
        <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[0.72rem] text-ink-500">
            {items.map(([col, l], i) => <span key={i} className="inline-flex items-center gap-1"><i className="inline-block size-3 rounded-[2px]" style={{ background: col }} />{l}</span>)}
            {extra}
        </div>
    );
}
