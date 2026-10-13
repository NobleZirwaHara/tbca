import { Link, router, useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import { Stepper, StatusPill } from '@/Components/ui/Kit';
import { BarChart, Donut, Funnel, HBars, HeatMap, LineChart, type Series } from '@/Components/Webinars/charts';
import { Avatar, Countdown, Ico, RailEvent, Stage, btnClass, toneBg, useMoneyText, type BtnTone } from '@/Components/Webinars/kit';
import type { WebinarEvent } from '@/types/webinars';

/* ========================================================================== */
/* Types (mirror App\Support\Webinars\Board)                                  */
/* ========================================================================== */

export interface Act {
    label: string;
    href: string | null;
    method: 'get' | 'post' | 'patch';
    data: Record<string, unknown>;
    tone: 'primary' | 'secondary' | 'danger';
    confirm: string | null;
    download: boolean;
}

export interface Kpi {
    label: string;
    value: number | string;
    sub: string | null;
    delta: string | null;
    tone: string;
    icon: string;
    money: boolean;
    down: boolean;
}

type Row = Record<string, unknown> & { _href?: string; id?: number };

export type Block =
    | { type: 'panel'; title: string; body: Block[]; span: number; action: Act | null; icon: string | null }
    | { type: 'table'; columns: { key: string; label: string; kind: string }[]; rows: Row[]; search?: string; filters?: { key: string; label: string }[]; pageSize?: number; export?: string; empty?: string; bulk?: { label: string; endpoint: string; data: Record<string, unknown> } }
    | { type: 'line'; labels: string[]; series: Series[]; money?: boolean; pct?: boolean }
    | { type: 'bars'; labels: string[]; series: Series[]; money?: boolean; pct?: boolean; stacked?: boolean }
    | { type: 'hbars'; rows: { label: string; value: number; color?: string; pct?: boolean; money?: boolean }[]; money?: boolean; asPct?: boolean }
    | { type: 'donut'; slices: { label: string; value: number; color?: string; money?: boolean }[]; center: string; sub: string }
    | { type: 'funnel'; steps: { label: string; value: number; sub?: string }[] }
    | { type: 'checklist'; items: { label: string; done: boolean; note?: string }[] }
    | { type: 'steps'; items: { label: string; sub?: string; status: string; date?: string }[] }
    | { type: 'toggles'; items: { key: string; label: string; on: boolean; sub?: string; status?: string }[]; endpoint: string }
    | { type: 'kv'; rows: [string, string][] }
    | { type: 'insights'; items: string[] }
    | { type: 'metrics'; items: { label: string; value: string; icon: string }[]; cols: number }
    | { type: 'text'; body: string; tone: string; title: string | null }
    | { type: 'buttons'; acts: Act[]; stack: boolean }
    | { type: 'form'; endpoint: string; fields: FormField[]; submit: string; hidden: Record<string, unknown>; method: 'post' | 'patch' }
    | { type: 'notes'; endpoint: string; value: string; placeholder: string }
    | { type: 'media'; title: string; lines: string[]; badge: string | null; caption: string | null; thumbs: string[] }
    | { type: 'list'; items: { title: string; sub?: string; initials?: string; pill?: string | null; icon?: string; href?: string; download?: boolean; actions?: Act[] }[] }
    | { type: 'heatmap'; points: { n: number; label: string; x: number; y: number }[] }
    | { type: 'countdown'; target: string; label: string }
    | { type: 'stepper'; steps: string[]; current: number }
    | { type: 'event'; title: string; event: WebinarEvent; status: string };

interface FormField {
    name: string;
    label: string;
    type?: 'text' | 'number' | 'textarea' | 'select';
    options?: { value: string; label: string }[];
    required?: boolean;
    value?: string | number;
}

/* ========================================================================== */
/* Actions                                                                    */
/* ========================================================================== */

const ACT_TONE: Record<Act['tone'], BtnTone> = { primary: 'gold', secondary: 'outline', danger: 'danger' };

export function ActButton({ act, size = 'sm', className }: { act: Act; size?: 'sm' | 'md'; className?: string }) {
    const cls = cn(btnClass(ACT_TONE[act.tone], size), className);
    if (!act.href) return null;
    if (act.method === 'get') {
        return act.download || act.href.includes('/export/') ? (
            <a href={act.href} className={cls}>{act.download && <L.Download className="size-3.5" aria-hidden="true" />}{act.label}</a>
        ) : (
            <Link href={act.href} className={cls}>{act.label}</Link>
        );
    }
    return (
        <button
            type="button"
            className={cls}
            onClick={() => {
                if (act.confirm && !window.confirm(act.confirm)) return;
                router[act.method](act.href as string, act.data as never, { preserveScroll: true });
            }}
        >
            {act.label}
        </button>
    );
}

/* ========================================================================== */
/* KPI row                                                                    */
/* ========================================================================== */

export function KpiRow({ kpis }: { kpis: Kpi[] }) {
    const price = usePrice();
    if (!kpis.length) return null;
    return (
        <div className={cn('grid gap-3 sm:grid-cols-2', kpis.length >= 5 ? 'xl:grid-cols-5' : kpis.length === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3', kpis.length === 6 && '2xl:grid-cols-6')}>
            {kpis.map((k) => {
                const positive = k.delta?.startsWith('+');
                const good = k.down ? !positive : positive;
                return (
                    <div key={k.label} className="flex items-start gap-3 rounded-[10px] border border-parchment-400 bg-white p-4">
                        <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-full', toneBg(k.tone))}><Ico name={k.icon} className="size-5" /></span>
                        <div className="min-w-0">
                            <p className="text-[0.75rem] font-medium text-ink-600">{k.label}</p>
                            <p className="text-[1.5rem] leading-tight font-bold text-ink-900">{k.money && typeof k.value === 'number' ? price(k.value) : typeof k.value === 'number' ? k.value.toLocaleString('en-ZA') : k.value}</p>
                            {(k.delta || k.sub) && (
                                <p className="text-[0.6875rem] text-ink-500">
                                    {k.delta && <span className={cn('mr-1 font-bold', good ? 'text-verified-500' : 'text-risk-500')}>{positive ? '↑' : '↓'} {k.delta.replace(/^[+-]/, '')}</span>}
                                    {k.sub}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ========================================================================== */
/* Block renderer                                                             */
/* ========================================================================== */

const SPAN: Record<number, string> = {
    3: 'lg:col-span-6 2xl:col-span-3', 4: 'lg:col-span-6 2xl:col-span-4', 5: 'lg:col-span-6 2xl:col-span-5', 6: 'lg:col-span-6',
    7: 'lg:col-span-12 2xl:col-span-7', 8: 'lg:col-span-12 2xl:col-span-8', 12: 'lg:col-span-12',
};

export function BlockGrid({ blocks }: { blocks: Block[] }) {
    return (
        <div className="grid gap-4 lg:grid-cols-12">
            {blocks.map((b, i) => (
                <div key={i} className={cn('min-w-0', b.type === 'panel' ? SPAN[b.span] ?? 'lg:col-span-6' : 'lg:col-span-12')}>
                    <BlockView block={b} />
                </div>
            ))}
        </div>
    );
}

export function BlockStack({ blocks }: { blocks: Block[] }) {
    return (
        <div className="space-y-4">
            {blocks.map((b, i) => <BlockView key={i} block={b} />)}
        </div>
    );
}

export function BlockView({ block: b }: { block: Block }) {
    const money = useMoneyText();
    switch (b.type) {
        case 'panel':
            return (
                <section className="h-full rounded-[10px] border border-parchment-400 bg-white p-4">
                    <header className="mb-3 flex items-start justify-between gap-2">
                        <h2 className="flex items-center gap-2 font-serif text-[1.0625rem] leading-tight font-bold text-ink-900">
                            {b.icon && <Ico name={b.icon} className="size-5 text-gold-600" />}
                            {b.title}
                        </h2>
                        {b.action && <ActButton act={b.action} />}
                    </header>
                    <div className="space-y-3">{b.body.map((x, i) => <BlockView key={i} block={x} />)}</div>
                </section>
            );
        case 'table':
            return <DataTable block={b} />;
        case 'line':
            return <LineChart labels={b.labels} series={b.series} money={b.money} pct={b.pct} />;
        case 'bars':
            return <BarChart labels={b.labels} series={b.series} money={b.money} pct={b.pct} stacked={b.stacked} />;
        case 'hbars':
            return <HBars rows={b.rows} money={b.money} asPct={b.asPct} />;
        case 'donut':
            return <Donut slices={b.slices} center={b.center} sub={b.sub} />;
        case 'funnel':
            return <Funnel steps={b.steps} />;
        case 'heatmap':
            return <HeatMap points={b.points} />;
        case 'checklist':
            return (
                <ul className="space-y-1.5">
                    {b.items.map((it) => (
                        <li key={it.label} className="flex items-start gap-2 text-[0.8125rem]">
                            {it.done ? <L.CircleCheck className="mt-0.5 size-4 shrink-0 text-verified-500" aria-label="Done" /> : <L.CircleDashed className="mt-0.5 size-4 shrink-0 text-attested-500" aria-label="Not done" />}
                            <span className="flex-1 text-ink-700">{it.label}</span>
                            {it.note && <span className={cn('shrink-0 text-[0.6875rem] font-semibold', it.done ? 'text-verified-500' : 'text-attested-500')}>{it.note}</span>}
                        </li>
                    ))}
                </ul>
            );
        case 'steps':
            return (
                <ol className="space-y-2.5">
                    {b.items.map((s, i) => (
                        <li key={s.label} className="flex gap-3">
                            <span className={cn('flex size-7 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-bold', s.status === 'completed' ? 'bg-verified-500 text-white' : s.status === 'in_progress' ? 'bg-controlled-500 text-white' : 'bg-parchment-300 text-ink-600')}>
                                {s.status === 'completed' ? <L.Check className="size-4" /> : i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-[0.8125rem] font-semibold text-ink-900">{s.label}</p>
                                {s.sub && <p className="text-[0.75rem] text-ink-500">{s.sub}</p>}
                            </div>
                            <span className="shrink-0 text-[0.6875rem] text-ink-500">{s.date ?? <StatusPill status={s.status} />}</span>
                        </li>
                    ))}
                </ol>
            );
        case 'toggles':
            return <Toggles block={b} />;
        case 'kv':
            return (
                <dl className="divide-y divide-parchment-300 text-[0.8125rem]">
                    {b.rows.map(([k, v]) => (
                        <div key={k} className="grid grid-cols-[minmax(0,10rem)_1fr] gap-3 py-1.5">
                            <dt className="text-ink-500">{k}</dt>
                            <dd className="font-medium break-words text-ink-900">{money(v)}</dd>
                        </div>
                    ))}
                </dl>
            );
        case 'insights':
            return (
                <ol className="space-y-2">
                    {b.items.map((t, i) => (
                        <li key={t} className="flex items-start gap-2.5 text-[0.8125rem] text-ink-700">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-controlled-500 text-[0.6875rem] font-bold text-white">{i + 1}</span>
                            {t}
                        </li>
                    ))}
                </ol>
            );
        case 'metrics':
            return (
                <div className={cn('grid gap-2', b.cols >= 5 ? 'grid-cols-2 sm:grid-cols-5' : b.cols === 4 ? 'grid-cols-2 sm:grid-cols-4' : b.cols === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2')}>
                    {b.items.map((m) => (
                        <div key={m.label} className="rounded-[8px] border border-parchment-400 bg-parchment-100 p-3 text-center">
                            <Ico name={m.icon} className="mx-auto size-5 text-controlled-500" />
                            <p className="mt-1 text-lg leading-tight font-bold text-ink-900">{money(m.value)}</p>
                            <p className="text-[0.6875rem] text-ink-500">{m.label}</p>
                        </div>
                    ))}
                </div>
            );
        case 'text':
            if (b.tone === 'tip') {
                return (
                    <div className="rounded-[10px] border border-gold-300 bg-gold-50 p-4">
                        {b.title && <p className="flex items-center gap-2 font-serif font-bold text-gold-800"><L.Lightbulb className="size-4" aria-hidden="true" />{b.title}</p>}
                        <p className="mt-1 text-[0.8125rem] text-ink-700">{b.body}</p>
                    </div>
                );
            }
            return (
                <div className={cn(b.tone === 'info' && 'rounded-[8px] border border-controlled-500/25 bg-controlled-50 p-3', b.tone === 'letter' && 'rounded-[8px] border border-parchment-400 bg-parchment-100 p-4')}>
                    {b.title && <p className="mb-1 text-[0.8125rem] font-bold text-ink-900">{b.title}</p>}
                    <p className={cn('text-[0.8125rem] whitespace-pre-line', b.tone === 'muted' ? 'text-ink-500' : b.tone === 'strong' ? 'font-semibold text-ink-900' : 'text-ink-700')}>{b.body}</p>
                </div>
            );
        case 'buttons':
            return (
                <div className={cn('gap-2', b.stack ? 'grid' : 'flex flex-wrap')}>
                    {b.acts.map((a) => <ActButton key={a.label} act={a} size={b.stack ? 'md' : 'sm'} className={b.stack ? 'w-full justify-start' : undefined} />)}
                </div>
            );
        case 'form':
            return <BoardForm block={b} />;
        case 'notes':
            return <Notes block={b} />;
        case 'media':
            return <Media block={b} />;
        case 'list':
            return (
                <ul className="divide-y divide-parchment-300">
                    {b.items.map((it, i) => (
                        <li key={it.title + i} className="flex items-center gap-3 py-2">
                            {it.initials ? <Avatar name={it.title} /> : it.icon ? <Ico name={it.icon} className="size-5 text-gold-600" /> : null}
                            <div className="min-w-0 flex-1">
                                {it.href ? (
                                    <a href={it.href} className="block text-[0.8125rem] font-semibold text-ink-900 hover:text-gold-700">{it.title}</a>
                                ) : (
                                    <p className="text-[0.8125rem] font-semibold text-ink-900">{it.title}</p>
                                )}
                                {it.sub && <p className="text-[0.75rem] text-ink-500">{it.sub}</p>}
                            </div>
                            {it.pill && <StatusPill status={it.pill} />}
                            {it.actions?.map((a) => <ActButton key={a.label} act={a} />)}
                        </li>
                    ))}
                </ul>
            );
        case 'countdown':
            return <Countdown target={b.target} light />;
        case 'stepper':
            return <Stepper steps={b.steps} current={b.current} />;
        case 'event':
            return <RailEvent event={b.event} title={b.title} action={<span className="rounded-full bg-gold-500 px-2 py-0.5 text-[0.625rem] font-bold text-ink-900 uppercase">{b.status}</span>} />;
        default:
            return null;
    }
}

/* ========================================================================== */
/* Table                                                                      */
/* ========================================================================== */

function cellText(v: unknown): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'object' && 'name' in (v as object)) return String((v as { name: string }).name);
    return typeof v === 'object' ? '' : String(v);
}

function DataTable({ block: b }: { block: Extract<Block, { type: 'table' }> }) {
    const price = usePrice('n/a');
    const [q, setQ] = useState('');
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<number[]>([]);
    const size = b.pageSize ?? 50;

    const options = useMemo(
        () => Object.fromEntries((b.filters ?? []).map((f) => [f.key, [...new Set(b.rows.map((r) => cellText(r[f.key])).filter(Boolean))].sort()])),
        [b.filters, b.rows],
    );
    const rows = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return b.rows.filter((r) => {
            if (needle && !Object.values(r).some((v) => cellText(v).toLowerCase().includes(needle) || (typeof v === 'object' && v && 'sub' in v && String((v as { sub: string }).sub).toLowerCase().includes(needle)))) return false;
            return Object.entries(filters).every(([k, v]) => !v || cellText(r[k]) === v);
        });
    }, [b.rows, q, filters]);
    const pages = Math.max(1, Math.ceil(rows.length / size));
    const current = Math.min(page, pages);
    const view = rows.slice((current - 1) * size, current * size);
    const hasTools = b.search || (b.filters?.length ?? 0) > 0 || b.export || b.bulk;

    const cell = (kind: string, v: unknown, r: Row, first: boolean): ReactNode => {
        switch (kind) {
            case 'money':
                return <span className="font-semibold whitespace-nowrap text-ink-900">{typeof v === 'number' ? price(v) : String(v ?? '')}</span>;
            case 'pill':
                return v ? <StatusPill status={String(v)} /> : null;
            case 'tag':
                return <span className="rounded-[4px] bg-controlled-50 px-1.5 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap text-controlled-700">{String(v)}</span>;
            case 'initials':
                return <Avatar name={String(v)} className="size-6 text-[0.5625rem]" />;
            case 'bar':
                return (
                    <span className="flex items-center gap-2">
                        <span className="w-9 text-right text-[0.75rem]">{String(v)}%</span>
                        <span className="h-2 w-20 overflow-hidden rounded-full bg-parchment-300"><span className="block h-full rounded-full bg-controlled-500" style={{ width: `${Number(v)}%` }} /></span>
                    </span>
                );
            case 'person': {
                const p = v as { name: string; sub?: string };
                return (
                    <span className="flex items-center gap-2">
                        <Avatar name={p?.name ?? '?'} className="size-7 text-[0.625rem]" />
                        <span className="min-w-0">
                            <span className="block font-semibold whitespace-nowrap text-ink-900">{p?.name}</span>
                            {p?.sub && <span className="block truncate text-[0.6875rem] text-ink-500">{p.sub}</span>}
                        </span>
                    </span>
                );
            }
            case 'actions':
                return <span className="flex flex-wrap justify-end gap-1.5">{((v as Act[]) ?? []).map((a) => <ActButton key={a.label} act={a} />)}</span>;
            case 'strong':
                return r._href && first ? <Link href={r._href} className="font-semibold text-ink-900 underline-offset-2 hover:text-gold-700 hover:underline">{String(v)}</Link> : <span className="font-semibold text-ink-900">{String(v ?? '')}</span>;
            default:
                return r._href && first ? <Link href={r._href} className="hover:text-gold-700 hover:underline">{String(v ?? '')}</Link> : String(v ?? '');
        }
    };

    return (
        <div>
            {hasTools && (
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                    {b.search && (
                        <label className="relative min-w-[12rem] flex-1">
                            <span className="sr-only">Search</span>
                            <L.Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder={b.search} className="h-9 w-full rounded-[6px] border border-parchment-500 bg-white pr-2 pl-8 text-[0.8125rem] focus:border-gold-500 focus:outline-none" />
                        </label>
                    )}
                    {(b.filters ?? []).map((f) => (
                        <label key={f.key}>
                            <span className="sr-only">{f.label}</span>
                            <select value={filters[f.key] ?? ''} onChange={(e) => { setFilters({ ...filters, [f.key]: e.target.value }); setPage(1); }} className="h-9 rounded-[6px] border border-parchment-500 bg-white px-2 text-[0.8125rem]">
                                <option value="">{f.label}</option>
                                {(options[f.key] ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </label>
                    ))}
                    {b.bulk && selected.length > 0 && (
                        <button type="button" className={btnClass('gold', 'sm')} onClick={() => router.post(b.bulk!.endpoint, { ...b.bulk!.data, ids: selected } as never, { preserveScroll: true, onSuccess: () => setSelected([]) })}>
                            {b.bulk.label} ({selected.length})
                        </button>
                    )}
                    {b.export && <a href={b.export} className={btnClass('gold', 'sm')}><L.Download className="size-3.5" aria-hidden="true" /> Export</a>}
                </div>
            )}
            <div className="overflow-x-auto rounded-[8px] border border-parchment-400">
                <table className="w-full text-left text-[0.8125rem]">
                    <thead className="bg-parchment-200 text-[0.75rem] font-semibold text-ink-700">
                        <tr>
                            {b.bulk && <th className="w-8 px-3 py-2"><span className="sr-only">Select</span></th>}
                            {b.columns.map((c) => <th key={c.key} className="px-3 py-2 whitespace-nowrap">{c.label}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-parchment-300 bg-white">
                        {view.length === 0 && (
                            <tr><td colSpan={b.columns.length + (b.bulk ? 1 : 0)} className="px-3 py-6 text-center text-ink-400">{b.empty ?? 'No records match.'}</td></tr>
                        )}
                        {view.map((r, i) => (
                            <tr key={(r.id as number) ?? i} className="hover:bg-parchment-100">
                                {b.bulk && (
                                    <td className="px-3 py-2">
                                        <input type="checkbox" aria-label="Select row" checked={selected.includes(r.id as number)} onChange={(e) => setSelected(e.target.checked ? [...selected, r.id as number] : selected.filter((x) => x !== r.id))} />
                                    </td>
                                )}
                                {b.columns.map((c, ci) => <td key={c.key} className="px-3 py-2 align-middle text-ink-700">{cell(c.kind, r[c.key], r, ci === 0 || (ci === 1 && b.columns[0].key === 'n'))}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {(rows.length > size || b.pageSize) && (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[0.75rem] text-ink-500">
                    <span>Showing {rows.length ? (current - 1) * size + 1 : 0} to {Math.min(current * size, rows.length)} of {rows.length}</span>
                    {pages > 1 && (
                        <span className="flex items-center gap-1">
                            <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)} className="rounded border border-parchment-500 p-1 disabled:opacity-40" aria-label="Previous page"><L.ChevronLeft className="size-4" /></button>
                            <span className="px-2 font-semibold text-ink-900">{current} / {pages}</span>
                            <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)} className="rounded border border-parchment-500 p-1 disabled:opacity-40" aria-label="Next page"><L.ChevronRight className="size-4" /></button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

/* ========================================================================== */
/* Interactive blocks                                                         */
/* ========================================================================== */

function Toggles({ block: b }: { block: Extract<Block, { type: 'toggles' }> }) {
    return (
        <ul className="divide-y divide-parchment-300">
            {b.items.map((t) => (
                <li key={t.key} className="flex items-center justify-between gap-3 py-1.5">
                    <span className="min-w-0">
                        <span className="block text-[0.8125rem] text-ink-800">{t.label}</span>
                        {t.sub && <span className="block text-[0.6875rem] text-ink-500">{t.sub}</span>}
                    </span>
                    <span className="flex items-center gap-2">
                        {t.status && <StatusPill status={t.status} />}
                        <button
                            type="button"
                            role="switch"
                            aria-checked={t.on}
                            aria-label={t.label}
                            onClick={() => router.post(b.endpoint, { key: t.key, on: !t.on }, { preserveScroll: true })}
                            className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', t.on ? 'bg-verified-500' : 'bg-ink-200')}
                        >
                            <span className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', t.on ? 'left-[1.375rem]' : 'left-0.5')} />
                        </button>
                    </span>
                </li>
            ))}
        </ul>
    );
}

function BoardForm({ block: b }: { block: Extract<Block, { type: 'form' }> }) {
    const initial = Object.fromEntries(b.fields.map((f) => [f.name, f.value ?? '']));
    const form = useForm<Record<string, string | number>>({ ...initial, ...(b.hidden as Record<string, string>) });
    const input = 'w-full rounded-[6px] border border-parchment-500 bg-white px-2.5 text-[0.8125rem] focus:border-gold-500 focus:outline-none';
    return (
        <form
            className="space-y-2.5"
            onSubmit={(e) => {
                e.preventDefault();
                form.submit(b.method, b.endpoint, { preserveScroll: true, onSuccess: () => form.reset() });
            }}
        >
            {b.fields.map((f) => {
                const id = `f-${b.endpoint}-${f.name}`.replace(/[^a-z0-9-]/gi, '-');
                const err = form.errors[f.name];
                return (
                    <div key={f.name}>
                        <label htmlFor={id} className="mb-1 block text-[0.75rem] font-semibold text-ink-700">{f.label}{f.required && <span className="text-risk-500"> *</span>}</label>
                        {f.type === 'select' ? (
                            <select id={id} className={cn(input, 'h-9')} value={String(form.data[f.name] ?? '')} onChange={(e) => form.setData(f.name, e.target.value)} required={f.required}>
                                {(f.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        ) : f.type === 'textarea' ? (
                            <textarea id={id} rows={3} className={cn(input, 'py-2')} value={String(form.data[f.name] ?? '')} onChange={(e) => form.setData(f.name, e.target.value)} required={f.required} />
                        ) : (
                            <input id={id} type={f.type ?? 'text'} className={cn(input, 'h-9')} value={String(form.data[f.name] ?? '')} onChange={(e) => form.setData(f.name, e.target.value)} required={f.required} />
                        )}
                        {err && <p className="mt-0.5 text-[0.6875rem] text-risk-500">{err}</p>}
                    </div>
                );
            })}
            <button type="submit" disabled={form.processing} className={btnClass('gold', 'md')}>{b.submit}</button>
        </form>
    );
}

function Notes({ block: b }: { block: Extract<Block, { type: 'notes' }> }) {
    const form = useForm({ body: b.value });
    return (
        <form onSubmit={(e) => { e.preventDefault(); form.post(b.endpoint, { preserveScroll: true }); }}>
            <label className="sr-only" htmlFor="board-notes">Notes</label>
            <textarea id="board-notes" rows={5} maxLength={2000} value={form.data.body} placeholder={b.placeholder} onChange={(e) => form.setData('body', e.target.value)} className="w-full rounded-[6px] border border-parchment-500 bg-parchment-100 p-2.5 text-[0.8125rem] focus:border-gold-500 focus:outline-none" />
            <div className="mt-1.5 flex items-center justify-between text-[0.6875rem] text-ink-400">
                <span>{form.data.body.length}/2000</span>
                <button type="submit" disabled={form.processing} className={btnClass('gold', 'sm')}>Save Notes</button>
            </div>
        </form>
    );
}

function Media({ block: b }: { block: Extract<Block, { type: 'media' }> }) {
    const ev = { speaker: b.caption?.split(' | ')[0] ?? 'Presenter', speakerRole: b.caption?.split(' | ')[1] ?? '' } as WebinarEvent;
    return (
        <div className="@container">
            <div className="grid gap-2 @lg:grid-cols-[1.1fr_1fr]">
                <Stage event={ev} badge={b.badge ? <span className="rounded-[4px] bg-risk-500 px-2 py-0.5 text-[0.6875rem] font-bold text-white">● {b.badge}</span> : null} />
                <div className="flex flex-col justify-center rounded-[10px] bg-ink-950 p-4 text-parchment-100">
                    <p className="font-serif text-[1.0625rem] leading-tight font-bold text-gold-400">{b.title}</p>
                    <ol className="mt-3 space-y-1 text-[0.75rem]">{b.lines.map((l) => <li key={l}>{l}</li>)}</ol>
                    {!b.badge && b.caption && <p className="mt-3 text-[0.6875rem] text-parchment-300">{b.caption}</p>}
                </div>
            </div>
            {b.thumbs.length > 0 && (
                <ul className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                    {b.thumbs.map((t, i) => (
                        <li key={t} className={cn('rounded-[6px] border px-2 py-3 text-center text-[0.6875rem]', i === 1 ? 'border-gold-500 bg-gold-50 font-semibold text-ink-900' : 'border-parchment-400 bg-parchment-100 text-ink-600')}>{t}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
