import { Link, router } from '@inertiajs/react';
import { Bell, Download, Eye, LayoutGrid, List, Scale, Search, X } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Paginated } from '@/types/aiim';
import { RailLink } from './Actions';
import { DeeperBox, RailBox, SelectionBox } from './Shell';

export type Filters = Record<string, string | string[]>;

/** Apply filters as query params (server-side search). Empty values are dropped. */
export function applyFilters(path: string, filters: Filters) {
    const query: Record<string, string | string[]> = {};
    Object.entries(filters).forEach(([k, v]) => {
        if ((Array.isArray(v) && v.length) || (!Array.isArray(v) && v !== '' && !(k === 'sort' && v === 'score') && !(k === 'view' && v === 'list'))) query[k] = v;
    });
    router.get(path, query, { preserveScroll: true, preserveState: true });
}

/** Dark chip bar summarising active filters, each removable. */
export function FilterBar({ path, filters, labels }: { path: string; filters: Filters; labels: { key: string; label: string; display?: (v: string) => string }[] }) {
    const clear = () => applyFilters(path, { sort: filters.sort ?? 'score', view: filters.view ?? 'list' });
    return (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[8px] bg-ink-950 p-3">
            {labels.map(({ key, label, display }) => {
                const v = filters[key];
                const value = Array.isArray(v) ? (v.length ? v.join(', ') : 'All') : v ? (display ? display(v) : v) : 'All';
                const active = Array.isArray(v) ? v.length > 0 : Boolean(v);
                return (
                    <span key={key} className="flex min-w-[8rem] items-center justify-between gap-2 rounded border border-ink-700 px-2.5 py-1.5 text-xs">
                        <span><span className="block text-[0.65rem] text-ink-400">{label}</span><span className="text-parchment-100">{value}</span></span>
                        {active && (
                            <button type="button" aria-label={`Clear ${label}`} onClick={() => applyFilters(path, { ...filters, [key]: Array.isArray(v) ? [] : '' })} className="text-gold-400 hover:text-gold-300">
                                <X className="size-3.5" />
                            </button>
                        )}
                    </span>
                );
            })}
            <button type="button" onClick={clear} className="ml-auto text-xs font-semibold text-gold-400 hover:underline">Clear All</button>
        </div>
    );
}

/** Left "Refine Your Search" panel. Holds local draft state; Apply submits the query. */
export function RefinePanel({ path, filters, children, placeholder }: { path: string; filters: Filters; children: (draft: Filters, set: (k: string, v: string | string[]) => void) => ReactNode; placeholder: string }) {
    const [draft, setDraft] = useState<Filters>(filters);
    const set = (k: string, v: string | string[]) => setDraft((d) => ({ ...d, [k]: v }));
    const submit = (e: FormEvent) => {
        e.preventDefault();
        applyFilters(path, { ...draft, page: '' });
    };
    return (
        <form onSubmit={submit} className="space-y-4 rounded-[8px] bg-ink-950 p-4 text-parchment-100" aria-label="Refine your search">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Refine Your Search</h2>
                <button type="button" onClick={() => applyFilters(path, {})} className="text-xs text-gold-400 underline">Reset Filters</button>
            </div>
            <label className="block text-xs">
                <span className="text-ink-300">Search Keywords</span>
                <span className="mt-1 flex items-center rounded border border-ink-600 bg-ink-900 px-2">
                    <input value={draft.q as string} onChange={(e) => set('q', e.target.value)} placeholder={placeholder} className="h-9 flex-1 bg-transparent text-sm outline-none" />
                    <Search className="size-4 text-ink-400" />
                </span>
            </label>
            {children(draft, set)}
            <button type="submit" className="h-10 w-full rounded bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400">Apply Filters</button>
        </form>
    );
}

export function DarkSelect({ label, value, onChange, options, all = 'All' }: { label: string; value: string; onChange: (v: string) => void; options: (string | [string, string])[]; all?: string }) {
    return (
        <label className="block text-xs">
            <span className="text-ink-300">{label}</span>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-9 w-full rounded border border-ink-600 bg-ink-900 px-2 text-sm text-parchment-100">
                <option value="">{all}</option>
                {options.map((o) => {
                    const [v, l] = Array.isArray(o) ? o : [o, o];
                    return <option key={v} value={v}>{l}</option>;
                })}
            </select>
        </label>
    );
}

export function CheckGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
    const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
    return (
        <fieldset className="text-xs">
            <legend className="mb-1 text-ink-300">{label}</legend>
            <label className="flex items-center gap-2 py-0.5"><input type="checkbox" checked={value.length === 0} onChange={() => onChange([])} className="accent-gold-500" />All Types</label>
            {options.map((o) => (
                <label key={o} className="flex items-center gap-2 py-0.5"><input type="checkbox" checked={value.includes(o)} onChange={() => toggle(o)} className="accent-gold-500" />{o}</label>
            ))}
        </fieldset>
    );
}

export function ResultsHeader({ path, filters, total, noun, sorts }: { path: string; filters: Filters; total: number; noun: string; sorts: [string, string][] }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-parchment-100">{total} {noun} Found</h2>
            <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-ink-300">Sort
                    <select value={filters.sort as string} onChange={(e) => applyFilters(path, { ...filters, sort: e.target.value })} className="h-8 rounded border border-ink-600 bg-ink-900 px-2 text-xs text-parchment-100">
                        {sorts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                </label>
                {(['grid', 'list'] as const).map((v) => (
                    <button key={v} type="button" aria-pressed={filters.view === v} onClick={() => applyFilters(path, { ...filters, view: v })} className={cn('flex h-8 items-center gap-1 rounded px-2 text-xs', filters.view === v ? 'bg-gold-500 text-ink-900' : 'border border-ink-600 text-ink-200')}>
                        {v === 'grid' ? <LayoutGrid className="size-3.5" /> : <List className="size-3.5" />}{v === 'grid' ? 'Grid' : 'List'}
                    </button>
                ))}
            </div>
        </div>
    );
}

export function Pagination<T>({ page, noun }: { page: Paginated<T>; noun: string }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-800 px-4 py-3 text-xs text-ink-300">
            <span>Showing {page.from ?? 0} to {page.to ?? 0} of {page.total} {noun}</span>
            <nav className="flex gap-1" aria-label="Pagination">
                {page.links.map((l, i) => (
                    l.url ? (
                        <Link key={i} href={l.url} preserveScroll className={cn('min-w-8 rounded px-2 py-1 text-center', l.active ? 'bg-gold-500 text-ink-900' : 'border border-ink-700 hover:border-gold-500')} dangerouslySetInnerHTML={{ __html: l.label }} />
                    ) : (
                        <span key={i} className="min-w-8 rounded border border-ink-800 px-2 py-1 text-center opacity-40" dangerouslySetInnerHTML={{ __html: l.label }} />
                    )
                ))}
            </nav>
        </div>
    );
}

export function SearchRail({ compareLabel, exportHref }: { compareLabel: string; exportHref?: string }) {
    return (
        <>
            <SelectionBox />
            <RailBox title="Quick Actions">
                <RailLink href="/aiim/workspace/alerts" icon={<Bell className="size-4" />} label="Save Current Search" sub="Get alerts for new matches" />
                <RailLink href={exportHref ?? '/aiim/fees/discover'} icon={<Download className="size-4" />} label="Export Results" sub="CSV / PDF" />
                <RailLink href="/aiim/workspace/compare" icon={<Scale className="size-4" />} label={compareLabel} sub="Add up to 4 items" />
                <RailLink href="/aiim/workspace/watchlist" icon={<Eye className="size-4" />} label="Create Watchlist" sub="Track items of interest" />
            </RailBox>
            <DeeperBox />
        </>
    );
}
