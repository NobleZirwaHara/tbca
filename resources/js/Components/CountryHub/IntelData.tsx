/*
 * Helpers for the second half of the Intelligence (AIIM) pages (prototype pages-intel.js helpers):
 * the bwOnly page for countries without a pack, tier chips, the country pack block renderer and
 * the CSV link for server-paged register tables.
 */
import type { ReactNode } from 'react';
import { Chip, STable } from '@/Components/Industries/Kit';
import { CountryHead, CountryPage, NoPack, SprintShelf } from '@/Components/CountryHub/Layout';
import { cn } from '@/lib/cn';
import type { CountryBase, HubShelf } from '@/types/countryHub';
import type { ServerTableData } from '@/types/industries';

export interface BwOnlyData { title: string; desc: string }

/** Countries without a pack: heading, the pack-loading panel and an intelligence shelf (prototype bwOnly). */
export function BwOnly({ base, pageKey, data, shelf }: { base: CountryBase; pageKey: string; data: BwOnlyData; shelf: HubShelf }) {
    return (
        <CountryPage base={base} pageKey={pageKey}>
            <CountryHead base={base} pageKey={pageKey} title={data.title} desc={data.desc} />
            <NoPack c={base.c} what={data.title} pageKey={pageKey} />
            <SprintShelf shelf={shelf} c={base.c} />
        </CountryPage>
    );
}

/** Tier chip (prototype tierChip). */
export function TierChip({ t }: { t: unknown }) {
    const s = String(t ?? '');
    if (s === 'A+' || s === 'A') return <Chip t={s} tone="ok" />;
    if (s === 'B') return <Chip t="B" tone="info" />;
    if (s === 'C') return <Chip t="C" tone="grey" />;
    return <Chip t={s || '—'} tone="grey" />;
}

export const slug = (s: unknown) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** One block of the BW-1.0 Word pack. */
export interface DocBlock { t: 'p' | 'tbl'; s?: string; x?: string; rows?: (string | number | null)[][] }

/** Plain text of a block (for the pack search). */
export const blockText = (b: DocBlock) => (b.t === 'tbl' ? (b.rows ?? []).map((r) => r.join(' ')).join(' ') : String(b.x ?? ''));

/** One block in the pack's reading style (prototype renderBlocks). */
export function DocBlockView({ b, hidden }: { b: DocBlock; hidden?: boolean }): ReactNode {
    const cls = hidden ? 'hidden' : undefined;
    if (b.t === 'tbl') {
        const r = b.rows ?? [];
        if (!r.length) return null;
        return <div className={cn('my-2.5', cls)}><STable compact head={r[0].map((x) => String(x ?? ''))} rows={r.slice(1).map((row) => row.map((x) => String(x ?? '')))} /></div>;
    }
    const s = b.s ?? '';
    const x = String(b.x ?? '');
    if (s === 'Title') return <h1 className={cn('text-[1.6rem] font-bold text-ink-900', cls)}>{x}</h1>;
    if (s === 'Subtitle') return <p className={cn('my-1.5 text-[0.86rem] leading-relaxed text-ink-400', cls)}>{x}</p>;
    if (s === 'Heading 1') return <h2 id={`h-${slug(x)}`} className={cn('mt-6 mb-2 scroll-mt-24 border-t-2 border-gold-200 pt-3 text-[1.25rem] font-bold text-ink-900', cls)}>{x}</h2>;
    if (s === 'Heading 2') return <h3 id={`h-${slug(x)}`} className={cn('mt-4 mb-1.5 scroll-mt-24 text-[1.02rem] font-semibold text-gold-800', cls)}>{x}</h3>;
    if (s === 'Block Text') return <div className={cn('my-2 rounded-r-[4px] border-l-[3px] border-gold-500 bg-gold-50 px-3 py-2.5 text-[0.82rem] text-ink-600', cls)}>{x}</div>;
    return <p className={cn('my-1.5 text-[0.86rem] leading-relaxed text-ink-700', cls)}>{x}</p>;
}

export function DocBlocks({ blocks }: { blocks: DocBlock[] }) {
    return <div className="min-w-0">{blocks.map((b, i) => <DocBlockView key={i} b={b} />)}</div>;
}

/** CSV download link for a server-paged register table: the same search, filters and sort, every row. */
export function csvHref(path: string, t: ServerTableData<unknown>, extra: Record<string, string> = {}) {
    const qs = new URLSearchParams({ ...extra, csv: '1' });
    if (t.q) qs.set('q', t.q);
    Object.entries(t.f).forEach(([k, v]) => qs.set(`f[${k}]`, v));
    if (t.sort !== null) { qs.set('sort', String(t.sort)); qs.set('dir', String(t.dir)); }
    return `${path}?${qs.toString()}`;
}

/** Register cell: links for URLs (prototype Data Room renderer). */
export function cellNode(v: unknown): ReactNode {
    const s = String(v ?? '');
    return /^https?:/.test(s) ? <a href={s} target="_blank" rel="noopener" className="text-controlled-700 hover:underline">{s.slice(0, 40)}…</a> : s;
}
