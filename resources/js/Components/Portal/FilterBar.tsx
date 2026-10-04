import { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { Tabs } from '@/Components/ui/Kit';
import type { RegisterProps } from '@/types/portal';

/** Tabs + search + select filters, all applied server-side through query parameters. */
export function FilterBar({ tabs, tab, filters, search, query }: Pick<RegisterProps, 'tabs' | 'tab' | 'filters' | 'search' | 'query'>) {
    const { url } = usePage<{ url: { path: string } }>().props;
    const [q, setQ] = useState(query?.q ?? '');
    const apply = (next: Record<string, string>) => {
        const params = { ...(query ?? {}), ...next };
        delete (params as Record<string, string>).page;
        Object.keys(params).forEach((k) => (params[k] === '' || params[k] === 'all') && delete params[k]);
        router.get(url.path, params, { preserveScroll: true, preserveState: true, replace: true });
    };

    if (!tabs?.length && !filters?.length && search === undefined) return null;

    return (
        <div className="mb-4 space-y-3">
            {tabs && tabs.length > 0 && <Tabs tabs={tabs} value={tab ?? tabs[0].key} onChange={(key) => apply({ tab: key })} />}
            {(search !== undefined && search !== null) || (filters && filters.length > 0) ? (
                <div className="flex flex-wrap items-end gap-2 rounded-[8px] border border-parchment-400 bg-white p-3">
                    {search !== undefined && search !== null && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                apply({ q });
                            }}
                            className="relative min-w-52 flex-1"
                            role="search"
                        >
                            <label htmlFor="portal-search" className="sr-only">
                                Search
                            </label>
                            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-ink-400" aria-hidden="true" />
                            <input
                                id="portal-search"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder={search || 'Search…'}
                                className="h-9 w-full rounded-[4px] border border-parchment-500 bg-white pr-3 pl-8 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none"
                            />
                        </form>
                    )}
                    {filters?.map((f) => (
                        <div key={f.name} className="min-w-36">
                            <label htmlFor={`f-${f.name}`} className="mb-0.5 block text-[0.6875rem] font-semibold text-ink-500">
                                {f.label}
                            </label>
                            <select
                                id={`f-${f.name}`}
                                value={query?.[f.name] ?? ''}
                                onChange={(e) => apply({ [f.name]: e.target.value })}
                                className="h-9 w-full rounded-[4px] border border-parchment-500 bg-white px-2 text-sm focus:border-gold-500 focus:outline-none"
                            >
                                <option value="">All</option>
                                {f.options.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                    {Object.keys(query ?? {}).some((k) => k !== 'tab' && k !== 'page') && (
                        <button
                            type="button"
                            onClick={() => {
                                setQ('');
                                router.get(url.path, query?.tab ? { tab: query.tab } : {}, { preserveScroll: true });
                            }}
                            className="h-9 px-2 text-xs font-semibold text-controlled-700 hover:underline"
                        >
                            Reset
                        </button>
                    )}
                </div>
            ) : null}
        </div>
    );
}
