import { useState, type ReactNode } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { DpFacet } from './types';

export interface DpFilters {
    q: string;
    types: string[];
    audience: string;
    language: string;
    format: string;
    price: string;
    licence: string;
    industry: string;
    function: string;
    sort: string;
}

export interface DpFacets {
    types: DpFacet[];
    audiences: DpFacet[];
    industries: DpFacet[];
    functions: DpFacet[];
    languages: DpFacet[];
    formats: DpFacet[];
    prices: DpFacet[];
    licences: DpFacet[];
}

function Group({ title, open: initial = false, children }: { title: string; open?: boolean; children: ReactNode }) {
    const [open, setOpen] = useState(initial);
    return (
        <div className="border-t border-parchment-300 py-2.5">
            <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between text-[0.8125rem] font-semibold text-ink-900">
                {title}
                <ChevronDown className={cn('size-4 text-gold-600 transition-transform', open && 'rotate-180')} aria-hidden="true" />
            </button>
            {open && <div className="mt-2 space-y-1.5">{children}</div>}
        </div>
    );
}

function Option({ checked, label, count, onChange, type = 'checkbox', name }: { checked: boolean; label: string; count: number; onChange: () => void; type?: 'checkbox' | 'radio'; name?: string }) {
    return (
        <label className="flex cursor-pointer items-center justify-between gap-2 text-xs text-ink-700">
            <span className="flex items-center gap-2">
                <input type={type} name={name} checked={checked} onChange={onChange} className="size-3.5 accent-gold-600" />
                {label}
            </span>
            <span className="text-ink-400">({count})</span>
        </label>
    );
}

/** "Refine Your Search" sidebar — all filters are server-side query params. */
export default function FilterSidebar({
    filters,
    facets,
    apply,
    extended = false,
}: {
    filters: DpFilters;
    facets: DpFacets;
    apply: (patch: Partial<Record<keyof DpFilters, string | string[]>>) => void;
    extended?: boolean;
}) {
    const [q, setQ] = useState(filters.q);
    const single = (key: keyof DpFilters, list: DpFacet[], title: string, open = false) => (
        <Group title={title} open={open || Boolean(filters[key])}>
            {list.map((f) => (
                <Option key={f.key} type="checkbox" checked={filters[key] === f.key} label={f.label} count={f.count} onChange={() => apply({ [key]: filters[key] === f.key ? '' : f.key })} />
            ))}
        </Group>
    );

    return (
        <aside className="rounded-[8px] border border-parchment-400 bg-white p-4" aria-label="Refine your search">
            <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink-900">Refine Your Search</h2>
                <button
                    type="button"
                    onClick={() => {
                        setQ('');
                        apply({ q: '', types: [], audience: '', language: '', format: '', price: '', licence: '', industry: '', function: '' });
                    }}
                    className="text-xs font-semibold text-gold-700 hover:underline"
                >
                    Clear All
                </button>
            </div>
            <form
                role="search"
                onSubmit={(e) => {
                    e.preventDefault();
                    apply({ q });
                }}
                className="relative mb-3"
            >
                <label htmlFor="dp-q" className="sr-only">
                    Search products
                </label>
                <input
                    id="dp-q"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search products..."
                    className="h-9 w-full rounded-[4px] border border-parchment-500 pr-8 pl-2.5 text-[0.8125rem] focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none"
                />
                <button type="submit" className="absolute top-1/2 right-2 -translate-y-1/2 text-gold-700" aria-label="Search">
                    <Search className="size-4" />
                </button>
            </form>
            <Group title="Product Type" open>
                {facets.types.map((t) => (
                    <Option
                        key={t.key}
                        checked={filters.types.includes(t.key)}
                        label={t.label}
                        count={t.count}
                        onChange={() => apply({ types: filters.types.includes(t.key) ? filters.types.filter((x) => x !== t.key) : [...filters.types, t.key] })}
                    />
                ))}
            </Group>
            {single('audience', facets.audiences, 'Audience')}
            {extended && single('industry', facets.industries, 'Industries')}
            {extended && single('function', facets.functions, 'Business Function')}
            {single('licence', facets.licences, 'Licence Class', extended)}
            {single('language', facets.languages.map((l) => ({ ...l, label: `${l.key} ${l.label}` })), 'Language', extended)}
            {single('format', facets.formats, 'File Format')}
            {single('price', facets.prices, 'Price Range (ZAR)')}
            {!extended && single('industry', facets.industries, 'Industries')}
        </aside>
    );
}
