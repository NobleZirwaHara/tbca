import { useState, type FormEvent } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Download, Search } from 'lucide-react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { KpiTile, Panel, SimpleTable, Tag } from '@/Components/ui/Kit';
import { DELIVERABLES_NAV, DeliverablesIcon, Facts, Pager, fmt, pct, type Paginated } from '@/Components/Deliverables/AdminParts';

type Tier = 'basic' | 'standard' | 'premium';

interface Filters {
    q: string;
    tab: string | null;
    family: string | null;
    format: string | null;
    loop: string | null;
    tier: Tier;
    source: 'retained' | 'new' | null;
}

interface Row {
    ref: string;
    tab: string;
    family: string | null;
    name: string;
    format: string;
    formatDetail: string | null;
    loopId: string | null;
    isNew: boolean;
    pages: string | null;
    pageUnit: string | null;
    delivery: string | null;
}

interface Option {
    value: string;
    n: number;
}

interface Props {
    filters: Filters;
    results: Paginated<Row>;
    options: { tabs: Option[]; families: Option[]; formats: Option[]; loops: Option[] };
    stats: { deliverables: number; retained: number; new: number; crosswalk: number; matched: number; safeguards: number; loops: number };
    control: { field: string; value: string }[];
}

const TIER_LABEL: Record<Tier, string> = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };

const selectClass = 'w-full rounded-[4px] border border-parchment-500 bg-white px-2 py-1.5 text-[0.8125rem] text-ink-800';

function query(f: Filters): Record<string, string> {
    const out: Record<string, string> = {};
    (Object.keys(f) as (keyof Filters)[]).forEach((k) => {
        const v = f[k];
        if (v && !(k === 'tier' && v === 'standard')) out[k] = String(v);
    });
    return out;
}

export default function DeliverablesIndex({ filters, results, options, stats, control }: Props) {
    const [q, setQ] = useState(filters.q);

    const apply = (next: Partial<Filters>) => {
        const merged = { ...filters, ...next };
        if (next.tab !== undefined && next.tab !== filters.tab) merged.family = null;
        router.get('/admin/deliverables', query(merged), { preserveState: true, preserveScroll: true, replace: true });
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        apply({ q });
    };

    const exportHref = `/admin/deliverables/export.csv${Object.keys(query(filters)).length ? `?${new URLSearchParams(query(filters)).toString()}` : ''}`;

    return (
        <ConsoleLayout
            area="Registry of Deliverables"
            areaIcon={DeliverablesIcon}
            groups={DELIVERABLES_NAV}
            crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Deliverables' }]}
            title="Registry of Deliverables"
            badge={<Tag tone="neutral">MP-DEL-2.0</Tag>}
            description="Every deliverable the WebApp sells, built from each tab: depth and length per package, the trigger and workflow that start delivery, and the consultancy benchmark."
            actions={
                <a href={exportHref} className="inline-flex items-center gap-2 rounded-[5px] bg-gold-500 px-3.5 py-2 text-[0.8125rem] font-semibold text-ink-900 hover:bg-gold-400">
                    <Download className="size-4" aria-hidden="true" />
                    Export CSV
                </a>
            }
        >
            <Head title="Registry of Deliverables" />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <KpiTile label="Deliverables" value={fmt(stats.deliverables)} />
                <KpiTile label="Issue 1.0 retained" value={fmt(stats.retained)} />
                <KpiTile label="New from Sprint catalogue" value={fmt(stats.new)} />
                <KpiTile label="Crosswalk linked to Sprints" value={pct(stats.matched, stats.crosswalk)} caption={`${fmt(stats.matched)} of ${fmt(stats.crosswalk)} codes`} tone="good" />
                <KpiTile label="Safeguards" value={stats.safeguards} />
                <KpiTile label="Payment-trigger loops" value={stats.loops} />
            </div>

            <Panel title="Search and filter" className="mt-5">
                <form onSubmit={submit} className="flex flex-wrap gap-2">
                    <label className="sr-only" htmlFor="deliverable-search">
                        Search deliverables
                    </label>
                    <input
                        id="deliverable-search"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Ref, name, family, description or Sprint code"
                        className="min-w-0 flex-1 rounded-[4px] border border-parchment-500 px-3 py-1.5 text-[0.8125rem]"
                    />
                    <button type="submit" className="inline-flex items-center gap-1.5 rounded-[4px] bg-ink-900 px-3 py-1.5 text-[0.8125rem] font-semibold text-parchment-50">
                        <Search className="size-4" aria-hidden="true" />
                        Search
                    </button>
                </form>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                    <label className="text-xs text-ink-500">
                        WebApp tab
                        <select className={selectClass} value={filters.tab ?? ''} onChange={(e) => apply({ tab: e.target.value || null })}>
                            <option value="">All tabs</option>
                            {options.tabs.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.value} ({fmt(o.n)})
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs text-ink-500">
                        Sub-tab or family
                        <select className={selectClass} value={filters.family ?? ''} disabled={!filters.tab} onChange={(e) => apply({ family: e.target.value || null })}>
                            <option value="">{filters.tab ? 'All families' : 'Choose a tab first'}</option>
                            {options.families.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.value} ({fmt(o.n)})
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs text-ink-500">
                        Format
                        <select className={selectClass} value={filters.format ?? ''} onChange={(e) => apply({ format: e.target.value || null })}>
                            <option value="">All formats</option>
                            {options.formats.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.value} ({fmt(o.n)})
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs text-ink-500">
                        Payment-trigger loop
                        <select className={selectClass} value={filters.loop ?? ''} onChange={(e) => apply({ loop: e.target.value || null })}>
                            <option value="">All loops</option>
                            {options.loops.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.value} ({fmt(o.n)})
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-xs text-ink-500">
                        Register source
                        <select className={selectClass} value={filters.source ?? ''} onChange={(e) => apply({ source: (e.target.value || null) as Filters['source'] })}>
                            <option value="">Issue 1.0 and new</option>
                            <option value="retained">Issue 1.0 retained</option>
                            <option value="new">New from Sprint catalogue</option>
                        </select>
                    </label>
                    <label className="text-xs text-ink-500">
                        Package tier shown
                        <select className={selectClass} value={filters.tier} onChange={(e) => apply({ tier: e.target.value as Tier })}>
                            {(['basic', 'standard', 'premium'] as Tier[]).map((t) => (
                                <option key={t} value={t}>
                                    {TIER_LABEL[t]}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </Panel>

            <Panel title={`Deliverables (${TIER_LABEL[filters.tier]} package)`} className="mt-5">
                <SimpleTable
                    columns={['Ref', 'Deliverable', 'Tab and family', 'Format', 'Length', 'Delivery', 'Loop']}
                    empty="No deliverables match these filters."
                    rows={results.data.map((r) => [
                        <Link href={`/admin/deliverables/${r.ref}`} className="font-mono text-xs whitespace-nowrap text-gold-700 hover:underline">
                            {r.ref}
                        </Link>,
                        <div className="min-w-48">
                            <Link href={`/admin/deliverables/${r.ref}`} className="font-medium text-ink-900 hover:text-gold-700">
                                {r.name}
                            </Link>
                            {r.isNew ? null : <p className="text-[0.6875rem] text-ink-400">Issue 1.0 deliverable</p>}
                        </div>,
                        <div className="min-w-40 text-xs">
                            <p className="text-ink-800">{r.tab}</p>
                            {r.family && <p className="text-ink-400">{r.family}</p>}
                        </div>,
                        <div className="text-xs whitespace-nowrap">
                            <p>{r.format}</p>
                            {r.formatDetail && r.formatDetail !== r.format && <p className="text-ink-400">{r.formatDetail}</p>}
                        </div>,
                        <span className="text-xs whitespace-nowrap">{r.pages ? `${r.pages} ${r.pageUnit ?? ''}` : ''}</span>,
                        <span className="text-xs whitespace-nowrap">{r.delivery}</span>,
                        <span className="font-mono text-[0.6875rem] whitespace-nowrap">{r.loopId}</span>,
                    ])}
                />
                <Pager page={results} label="deliverables" />
            </Panel>

            {control.length > 0 && (
                <Panel title="Register control" className="mt-5">
                    <Facts rows={control.map((c) => [c.field, c.value])} />
                </Panel>
            )}
        </ConsoleLayout>
    );
}

DeliverablesIndex.layout = null;
