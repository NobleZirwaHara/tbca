import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { CalendarClock, CircleCheck, Download, FileText, Filter, Grid2x2, KeyRound, List, RefreshCw, Search, Wallet, MoreVertical } from 'lucide-react';
import LibraryShell, { HelpPanel, Reminders } from '@/Components/Products/Digital/LibraryShell';
import { DpCover, DpStatus, FilterSelect, Pager, useQueryNav } from '@/Components/Products/Digital/Ui';
import { Notice } from '@/Components/Products/Shared';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import type { DpEntitlement, DpFacet, DpPagination } from '@/Components/Products/Digital/types';

interface Filters {
    tab: string;
    q: string;
    types: string[];
    licence: string;
    format: string;
    sort: string;
}

const TABS = [
    { key: 'all', label: 'All Products' },
    { key: 'active', label: 'Active' },
    { key: 'updates', label: 'Updates Available' },
    { key: 'expiring', label: 'Expiring Soon' },
    { key: 'archived', label: 'Archived' },
    { key: 'withdrawn', label: 'Withdrawn' },
];

export default function LibraryIndex({
    items,
    pagination,
    kpis,
    typeCounts,
    filters,
    pending,
}: {
    items: DpEntitlement[];
    pagination: DpPagination;
    kpis: { active: number; updates: number; expiring: number; spent: number };
    typeCounts: DpFacet[];
    filters: Filters;
    pending: { reference: string; name: string; order: string }[];
}) {
    const price = usePrice();
    const nav = useQueryNav('/digital-products/library', filters as unknown as Record<string, unknown>);
    const [q, setQ] = useState(filters.q);
    const [grid, setGrid] = useState(false);
    const [showFilters, setShowFilters] = useState(true);

    return (
        <LibraryShell title="My Digital Products Library" description="Access, manage and download your purchased digital products.">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                    { icon: KeyRound, label: 'Active Entitlements', value: kpis.active, link: 'View all', tab: 'active' },
                    { icon: RefreshCw, label: 'Updates Available', value: kpis.updates, link: 'View updates', tab: 'updates' },
                    { icon: CalendarClock, label: 'Expiring Soon', value: kpis.expiring, link: 'View expiring', tab: 'expiring' },
                    { icon: Wallet, label: 'Total Spent (ZAR)', value: price(kpis.spent), link: 'View orders', tab: 'all' },
                ].map(({ icon: Icon, label, value, link, tab }) => (
                    <div key={label} className="flex gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                        <Icon className="size-6 shrink-0 text-gold-600" aria-hidden="true" />
                        <div>
                            <p className="text-xs text-ink-500">{label}</p>
                            <p className="text-xl font-bold text-ink-900">{value}</p>
                            <button type="button" onClick={() => nav({ tab })} className="text-[0.6875rem] font-semibold text-gold-700 underline">
                                {link}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {pending.length > 0 && (
                <Notice tone="warn" title="Awaiting payment verification">
                    {pending.map((p) => (
                        <span key={p.reference} className="block">
                            {p.name} — order {p.order}. No entitlement or download access is created until payment is verified.{' '}
                            <Link href={`/digital-products/order/${p.order}/payment-status`} className="font-semibold underline">Check status</Link>
                        </span>
                    ))}
                </Notice>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-parchment-400">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            type="button"
                            role="tab"
                            aria-selected={filters.tab === t.key}
                            onClick={() => nav({ tab: t.key })}
                            className={cn('-mb-px shrink-0 border-b-2 px-3 py-2 text-[0.8125rem] font-medium', filters.tab === t.key ? 'border-gold-500 text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-900')}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            nav({ q });
                        }}
                        className="relative"
                    >
                        <label htmlFor="lib-q" className="sr-only">Search my library</label>
                        <input id="lib-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search my library..." className="h-9 w-48 rounded-[4px] border border-parchment-500 bg-white pr-8 pl-2.5 text-[0.8125rem]" />
                        <button type="submit" aria-label="Search" className="absolute top-1/2 right-2 -translate-y-1/2 text-gold-700"><Search className="size-4" /></button>
                    </form>
                    <button type="button" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 text-xs font-semibold">
                        <Filter className="size-4" aria-hidden="true" /> Filters
                    </button>
                    <label className="flex items-center gap-1.5 text-xs text-ink-600">
                        Sort by:
                        <select value={filters.sort} onChange={(e) => nav({ sort: e.target.value })} className="h-9 rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.8125rem]">
                            <option value="recent">Recently Purchased</option>
                            <option value="name">Name (A–Z)</option>
                        </select>
                    </label>
                    <div className="flex overflow-hidden rounded-[4px] border border-parchment-500">
                        <button type="button" aria-label="Grid view" aria-pressed={grid} onClick={() => setGrid(true)} className={cn('p-2', grid ? 'bg-ink-900 text-gold-300' : 'bg-white')}><Grid2x2 className="size-4" /></button>
                        <button type="button" aria-label="List view" aria-pressed={!grid} onClick={() => setGrid(false)} className={cn('p-2', !grid ? 'bg-ink-900 text-gold-300' : 'bg-white')}><List className="size-4" /></button>
                    </div>
                </div>
            </div>

            <div className={cn('grid gap-4', showFilters ? 'xl:grid-cols-[210px_1fr_250px]' : 'xl:grid-cols-[1fr_250px]')}>
                {showFilters && (
                    <aside className="space-y-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                        <div className="flex justify-between">
                            <p className="text-xs font-bold text-ink-900 uppercase">Refine your library</p>
                            <button type="button" onClick={() => nav({ q: '', types: [], licence: '', format: '' })} className="text-xs font-semibold text-gold-700">Clear All</button>
                        </div>
                        <fieldset>
                            <legend className="mb-1.5 text-xs font-semibold text-ink-800">Product Type</legend>
                            {typeCounts.filter((t) => t.count > 0 || ['report', 'template', 'toolkit', 'calculator', 'dashboard'].includes(t.key)).map((t) => (
                                <label key={t.key} className="flex items-center justify-between py-0.5 text-xs text-ink-700">
                                    <span className="flex items-center gap-2">
                                        <input type="checkbox" className="accent-gold-600" checked={filters.types.includes(t.key)} onChange={() => nav({ types: filters.types.includes(t.key) ? filters.types.filter((x) => x !== t.key) : [...filters.types, t.key] })} />
                                        {t.label}
                                    </span>
                                    <span className="rounded bg-parchment-200 px-1 text-ink-500">{t.count}</span>
                                </label>
                            ))}
                        </fieldset>
                        <FilterSelect label="Licence Class" value={filters.licence} onChange={(v) => nav({ licence: v })} options={['L1', 'L2', 'L3', 'L4'].map((l) => ({ value: l, label: l }))} />
                        <FilterSelect label="Format" value={filters.format} onChange={(v) => nav({ format: v })} options={['PDF', 'DOCX', 'XLSX', 'PPTX'].map((f) => ({ value: f, label: f }))} />
                    </aside>
                )}

                <div className="min-w-0">
                    {grid ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((e) => (
                                <div key={e.reference} className="rounded-[8px] border border-parchment-400 bg-white p-3">
                                    <DpCover name={e.product.name} type={e.product.type} tone={e.product.tone} />
                                    <p className="mt-2 text-sm font-semibold">{e.product.name}</p>
                                    <p className="text-[0.6875rem] text-ink-500">{e.product.sku} · {e.licenceLabel}</p>
                                    <div className="mt-2 flex items-center justify-between">
                                        <Status e={e} />
                                        <Link href={`/digital-products/library/${e.reference}`} className="text-xs font-semibold text-gold-700 underline">View Details</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                            <table className="w-full min-w-[820px] text-left text-xs">
                                <thead className="bg-parchment-200 text-[0.6875rem] font-bold text-ink-600 uppercase">
                                    <tr>
                                        <th className="p-2.5">Product</th>
                                        <th className="p-2.5">Details</th>
                                        <th className="p-2.5">Entitlement</th>
                                        <th className="p-2.5">Access</th>
                                        <th className="p-2.5"><span className="sr-only">Actions</span></th>
                                        <th className="p-2.5"><span className="sr-only">Status</span></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {items.map((e) => (
                                        <tr key={e.reference} className="align-top">
                                            <td className="p-2.5">
                                                <div className="flex gap-2.5">
                                                    <DpCover name={e.product.name} type={e.product.type} tone={e.product.tone} size="sm" />
                                                    <div>
                                                        <p className="max-w-44 font-semibold text-ink-900">{e.product.name}</p>
                                                        <p className="text-[0.6875rem] text-ink-500">{e.product.sku}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="space-y-0.5 p-2.5 text-ink-700">
                                                <p className="capitalize">{e.product.type}</p>
                                                <p>{e.version?.display}</p>
                                                <p>{e.languageLabel}</p>
                                                <p className="flex items-center gap-1"><FileText className="size-3" aria-hidden="true" />{e.format}</p>
                                            </td>
                                            <td className="space-y-0.5 p-2.5 text-ink-700">
                                                <p>{e.licenceLabel}</p>
                                                <p>{e.jurisdiction}</p>
                                                <p>Purchased: {e.purchasedAt}</p>
                                                <p>Order: {e.orderReference}</p>
                                            </td>
                                            <td className="p-2.5 text-ink-700">
                                                {e.lastDownload ? (
                                                    <>
                                                        <p className="flex items-center gap-1 font-semibold text-verified-700"><CircleCheck className="size-3.5" aria-hidden="true" /> Downloaded</p>
                                                        <p>{e.lastDownload}</p>
                                                        <p>{e.size}</p>
                                                    </>
                                                ) : (
                                                    <p className="text-attested-700">Available – not yet downloaded</p>
                                                )}
                                            </td>
                                            <td className="space-y-1.5 p-2.5">
                                                {['active', 'legacy'].includes(e.status) ? (
                                                    <a href={`/digital-products/library/${e.reference}/download`} className="flex h-8 items-center justify-center gap-1.5 rounded-[4px] border border-gold-500 px-2 font-semibold whitespace-nowrap">
                                                        <Download className="size-3.5" aria-hidden="true" /> {e.lastDownload ? 'Download Again' : 'Download'}
                                                    </a>
                                                ) : (
                                                    <span className="block text-center text-[0.6875rem] text-ink-400">Download unavailable</span>
                                                )}
                                                <Link href={`/digital-products/library/${e.reference}`} className="flex h-8 items-center justify-center rounded-[4px] border border-gold-500 px-2 font-semibold">View Details</Link>
                                            </td>
                                            <td className="p-2.5">
                                                <div className="flex items-start gap-1">
                                                    <Status e={e} />
                                                    <details className="relative">
                                                        <summary className="cursor-pointer list-none rounded p-0.5 hover:bg-parchment-200" aria-label="More actions"><MoreVertical className="size-4" /></summary>
                                                        <div className="absolute right-0 z-10 mt-1 w-44 rounded-[6px] border border-parchment-400 bg-white p-1 shadow-raised">
                                                            {[
                                                                ['Updates & Corrections', 'updates'],
                                                                ['Version Status', 'version-status'],
                                                                ['Upgrade Licence', 'upgrade'],
                                                                ['Maintained Access', 'maintained-access'],
                                                            ].map(([l, p]) => (
                                                                <Link key={p} href={`/digital-products/library/${e.reference}/${p}`} className="block rounded px-2 py-1.5 hover:bg-parchment-100">{l}</Link>
                                                            ))}
                                                            <Link href={`/digital-products/library/refund-and-issue?entitlement=${e.reference}`} className="block rounded px-2 py-1.5 hover:bg-parchment-100">Refund / Report Issue</Link>
                                                        </div>
                                                    </details>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-ink-500">
                                                No products in this view. <Link href="/digital-products" className="font-semibold text-gold-700 underline">Browse Digital Products</Link>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pager pagination={pagination} label="products" />
                </div>

                <aside className="space-y-4">
                    <HelpPanel />
                    <Reminders />
                </aside>
            </div>
        </LibraryShell>
    );
}

function Status({ e }: { e: DpEntitlement }) {
    if (e.updateAvailable && e.status === 'active') {
        return (
            <span className="flex flex-col items-center">
                <DpStatus status="Update Available" className="border-gold-400 bg-gold-50 text-gold-800" />
                <Link href={`/digital-products/library/${e.reference}/updates`} className="mt-0.5 text-[0.625rem] text-gold-700 underline">{e.currentVersion?.label} available</Link>
            </span>
        );
    }
    return <DpStatus status={e.status === 'active' ? 'current' : e.status} />;
}
LibraryIndex.layout = null;
