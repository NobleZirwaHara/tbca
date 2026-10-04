import { Head, router, useForm } from '@inertiajs/react';
import { Download, Globe, Network, Percent, Plus, RefreshCw, Route, ShoppingCart, Activity, Pencil } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { COUNTRY_ADMIN_NAV, Pager } from '@/Components/CorePages/AdminParts';
import { BarRow, Donut } from '@/Components/CorePages/Kit';
import { Checkbox, Field, Input, Select } from '@/Components/ui/Form';
import { Modal, StatusPill, Tag } from '@/Components/ui/Kit';
import type { Paginated } from '@/types/core-pages';

interface Row {
    code: string; name: string; type: string; region: string; anchors: string[]; bidirectional: boolean; trading_paths: number; state: string; rcs: number;
    sovereign_approval: boolean; risk: string; last_reviewed: string | null; next_review: string | null; transitions: string[]; history: { event: string; at: string; by?: string }[];
}

interface Props {
    corridors: Paginated<Row>;
    kpis: { total: number; paths: number; countries: number; active: number; active_pct: number; avg_rcs: number; sellable: number; sellable_pct: number };
    distribution: Record<string, number>;
    types: Record<string, number>;
    rcsTop: { name: string; rcs: number }[];
    latest: { text: string; at: string }[];
    regions: string[];
    filters: { q: string; type: string; state: string; region: string; risk: string };
    activationRcs: number;
}

const stateColor: Record<string, string> = { active: 'var(--color-verified-500)', pending: 'var(--color-attested-500)', on_hold: 'var(--color-controlled-500)', retired: 'var(--color-risk-500)' };
const actionLabel: Record<string, string> = { active: 'Activate', on_hold: 'Put on hold', retired: 'Retire', pending: 'Reset' };
const riskTone = (r: string) => (r === 'High' ? 'bad' : r === 'Medium' ? 'warn' : 'good') as 'bad' | 'warn' | 'good';

export default function Corridors({ corridors, kpis, distribution, types, rcsTop, latest, regions, filters, activationRcs }: Props) {
    const [q, setQ] = useState(filters.q);
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<Row | null>(null);
    const create = useForm({ name: '', code: 'COR-', type: 'Bilateral', region: 'Southern Africa', anchors: '', trading_paths: 6, rcs: 80, risk: 'Medium', sovereign_approval: false });
    const edit = useForm({ rcs: 0, sovereign_approval: false, risk: 'Medium' });
    const go = (n: Partial<Props['filters']>) => router.get('/admin/core-pages/corridors', { ...filters, ...n }, { preserveState: true, preserveScroll: true, replace: true });
    const search = (e: FormEvent) => {
        e.preventDefault();
        go({ q });
    };
    const move = (c: Row, state: string) => {
        if (state === 'retired' && !window.confirm(`Retire ${c.name}? Retired corridors cannot be reactivated.`)) return;
        router.patch(`/admin/core-pages/corridors/${c.code}/state`, { state }, { preserveScroll: true });
    };
    const openEdit = (c: Row) => {
        edit.setData({ rcs: c.rcs, sovereign_approval: c.sovereign_approval, risk: c.risk });
        setEditing(c);
    };
    const csv = `data:text/csv;charset=utf-8,${encodeURIComponent(['Code,Name,Type,State,RCS,Risk,Trading Paths', ...corridors.data.map((c) => [c.code, c.name, c.type, c.state, c.rcs, c.risk, c.trading_paths].join(','))].join('\n'))}`;

    return (
        <ConsoleLayout
            area="Country Administration"
            areaIcon={Globe}
            groups={COUNTRY_ADMIN_NAV}
            crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Countries' }, { label: 'Corridor Object Manager' }]}
            title="Corridor Object Manager"
            badge={<Tag tone="good">{kpis.active === kpis.total ? 'All Corridors Active' : `${kpis.active} of ${kpis.total} Active`}</Tag>}
            description="Create, maintain and govern sovereign corridors, trading paths and their configuration."
            actions={
                <>
                    <button type="button" onClick={() => router.reload()} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 text-[0.8125rem]"><RefreshCw className="size-4" aria-hidden="true" />Refresh</button>
                    <a href={csv} download="corridors.csv" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 text-[0.8125rem]"><Download className="size-4" aria-hidden="true" />Export Report</a>
                    <button type="button" onClick={() => setCreating(true)} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-ink-900 px-3 text-[0.8125rem] font-semibold text-gold-400"><Plus className="size-4" aria-hidden="true" />Add New Corridor</button>
                </>
            }
        >
            <Head title="Corridor Object Manager" />
            <div className="grid gap-5 2xl:grid-cols-12">
                <div className="space-y-4 2xl:col-span-9">
                    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                        {[[Network, 'Total Corridors', kpis.total, 'Active & configured'], [Route, 'Total Trading Paths', kpis.paths, 'Across all corridors'], [Globe, 'Countries Covered', kpis.countries, 'Unique countries'], [Activity, 'Corridors Active', kpis.active, `${kpis.active_pct}% of total`], [Percent, 'Avg. Resolver Completeness', `${kpis.avg_rcs}%`, 'RCS average'], [ShoppingCart, 'Paths Sellable', kpis.sellable, `${kpis.sellable_pct}% of total`]].map(([I, l, v, s]) => {
                            const Ico = I as typeof Network;
                            return <div key={l as string} className="rounded-[8px] border border-parchment-400 bg-white p-3"><div className="flex items-start justify-between"><p className="text-[0.75rem] font-medium text-ink-600">{l as string}</p><Ico className="size-5 text-controlled-500" aria-hidden="true" /></div><p className="mt-1 text-[1.5rem] font-bold text-ink-900">{v as string}</p><p className="text-[0.6875rem] text-ink-500">{s as string}</p></div>;
                        })}
                    </div>

                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <div className="flex flex-wrap gap-2">
                            <form onSubmit={search} className="min-w-[12rem] flex-1"><label htmlFor="cor-q" className="sr-only">Search corridors</label><input id="cor-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search corridors or countries..." className="h-9 w-full rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem]" /></form>
                            {([['type', 'All Corridor Types', ['Regional', 'Bilateral', 'Inter-Regional']], ['state', 'All Availability States', ['pending', 'active', 'on_hold', 'retired']], ['region', 'All Regions', regions], ['risk', 'All Risk Levels', ['Low', 'Medium', 'High']]] as const).map(([k, l, o]) => (
                                <select key={k} aria-label={l} value={filters[k]} onChange={(e) => go({ [k]: e.target.value })} className="h-9 rounded-[4px] border border-parchment-500 text-[0.8125rem]"><option value="">{l}</option>{o.map((x) => <option key={x} value={x}>{x.replace('_', ' ')}</option>)}</select>
                            ))}
                        </div>
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full min-w-[1080px] text-left text-[0.75rem]">
                                <thead className="text-[0.6875rem] text-ink-500"><tr>{['Corridor Name', 'Corridor Code', 'Type', 'Anchor Countries (Order)', 'Trading Paths', 'Availability State', 'RCS (%)', 'Sovereign Approval', 'Risk Level', 'Last Reviewed', 'Next Review', 'Actions'].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {corridors.data.length === 0 && <tr><td colSpan={12} className="py-6 text-center text-ink-400">No corridors match.</td></tr>}
                                    {corridors.data.map((c) => (
                                        <tr key={c.code}>
                                            <td className="px-2 py-2 font-semibold text-ink-900">{c.name}</td>
                                            <td className="px-2 py-2 font-mono">{c.code}</td>
                                            <td className="px-2 py-2">{c.type}</td>
                                            <td className="px-2 py-2">{c.anchors.join(c.bidirectional ? ' ↔ ' : ' → ')}</td>
                                            <td className="px-2 py-2 text-center">{c.trading_paths}</td>
                                            <td className="px-2 py-2"><StatusPill status={c.state === 'on_hold' ? 'On hold' : c.state} tone={c.state === 'active' ? 'good' : c.state === 'pending' ? 'warn' : c.state === 'on_hold' ? 'info' : 'bad'} /></td>
                                            <td className={c.rcs >= activationRcs ? 'px-2 py-2 font-semibold' : 'px-2 py-2 font-semibold text-risk-500'}>{c.rcs}%</td>
                                            <td className="px-2 py-2">{c.sovereign_approval ? 'Recorded' : <span className="text-risk-500">Missing</span>}</td>
                                            <td className="px-2 py-2"><StatusPill status={c.risk} tone={riskTone(c.risk)} /></td>
                                            <td className="px-2 py-2 whitespace-nowrap">{c.last_reviewed}</td>
                                            <td className="px-2 py-2 whitespace-nowrap">{c.next_review}</td>
                                            <td className="px-2 py-2">
                                                <span className="flex flex-wrap gap-1">
                                                    <button type="button" onClick={() => openEdit(c)} aria-label={`Edit ${c.name}`} className="rounded border border-parchment-400 p-1"><Pencil className="size-3.5" /></button>
                                                    {c.transitions.map((t) => <button key={t} type="button" onClick={() => move(c, t)} className={t === 'retired' ? 'rounded border border-risk-500/40 px-1.5 text-risk-500' : 'rounded border border-parchment-400 px-1.5'}>{actionLabel[t]}</button>)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pager page={corridors} />
                    </section>

                    <div className="grid gap-4 lg:grid-cols-3">
                        <section className="space-y-2 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-[0.875rem] font-bold text-ink-900">Resolver Completeness by Corridor</h2>
                            {rcsTop.map((r) => <BarRow key={r.name} label={r.name} value={r.rcs} suffix="%" color={r.rcs >= activationRcs ? 'bg-verified-500' : 'bg-attested-500'} />)}
                            <p className="text-[0.6875rem] text-ink-500">Activation threshold: {activationRcs}% RCS + sovereign approval.</p>
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-[0.875rem] font-bold text-ink-900">Corridor Types</h2>
                            <div className="mt-2 space-y-2">{Object.entries(types).map(([k, v]) => <BarRow key={k} label={k} value={v} max={Math.max(1, kpis.total)} color="bg-verified-500" />)}</div>
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-[0.875rem] font-bold text-ink-900">Latest Corridor Updates</h2>
                            <ul className="mt-2 space-y-1.5 text-[0.75rem]">{latest.length === 0 ? <li className="text-ink-400">No updates yet.</li> : latest.map((u, i) => <li key={i} className="flex justify-between gap-2"><span>{u.text}</span><span className="shrink-0 text-ink-500">{new Date(u.at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span></li>)}</ul>
                        </section>
                    </div>
                </div>
                <aside className="space-y-4 2xl:col-span-3">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-[0.875rem] font-bold text-ink-900">Corridor State Distribution</h2>
                        <div className="mt-2 flex flex-wrap items-center gap-4">
                            <Donut segments={Object.entries(distribution).map(([k, v]) => ({ value: v, color: stateColor[k], label: k }))} center={kpis.total} sub="Total" />
                            <ul className="space-y-1 text-[0.75rem]">{Object.entries(distribution).map(([k, v]) => <li key={k} className="flex items-center gap-2 capitalize"><span className="size-2.5 rounded-full" style={{ background: stateColor[k] }} />{k.replace('_', ' ')} <strong>{v}</strong></li>)}</ul>
                        </div>
                    </section>
                    <section className="rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4 text-[0.75rem] text-controlled-700">
                        <p className="font-semibold">Information</p>
                        <p>All corridors must have ≥ {activationRcs}% resolver completeness and valid sovereign approvals before activation. Retired corridors are final.</p>
                    </section>
                </aside>
            </div>

            <Modal open={creating} onClose={() => setCreating(false)} title="Add New Corridor" size="lg">
                <form
                    className="grid gap-3 sm:grid-cols-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        create.post('/admin/core-pages/corridors', { preserveScroll: true, onSuccess: () => { setCreating(false); create.reset(); } });
                    }}
                >
                    <Field label="Corridor name" required error={create.errors.name}>{(id) => <Input id={id} value={create.data.name} onChange={(e) => create.setData('name', e.target.value)} />}</Field>
                    <Field label="Corridor code" required error={create.errors.code} hint="e.g. COR-ZAF-KE-01">{(id) => <Input id={id} value={create.data.code} onChange={(e) => create.setData('code', e.target.value.toUpperCase())} />}</Field>
                    <Field label="Type" required>{(id) => <Select id={id} options={['Regional', 'Bilateral', 'Inter-Regional']} value={create.data.type} onChange={(e) => create.setData('type', e.target.value)} />}</Field>
                    <Field label="Region" required error={create.errors.region}>{(id) => <Input id={id} value={create.data.region} onChange={(e) => create.setData('region', e.target.value)} />}</Field>
                    <Field label="Anchor countries (in order)" required error={create.errors.anchors} hint="Separate with commas or →" className="sm:col-span-2">{(id) => <Input id={id} placeholder="South Africa, Kenya" value={create.data.anchors} onChange={(e) => create.setData('anchors', e.target.value)} />}</Field>
                    <Field label="Trading paths" required error={create.errors.trading_paths}>{(id) => <Input id={id} type="number" min={1} value={create.data.trading_paths} onChange={(e) => create.setData('trading_paths', Number(e.target.value))} />}</Field>
                    <Field label="Resolver completeness (%)" required error={create.errors.rcs}>{(id) => <Input id={id} type="number" min={0} max={100} value={create.data.rcs} onChange={(e) => create.setData('rcs', Number(e.target.value))} />}</Field>
                    <Field label="Risk level" required>{(id) => <Select id={id} options={['Low', 'Medium', 'High']} value={create.data.risk} onChange={(e) => create.setData('risk', e.target.value)} />}</Field>
                    <Checkbox className="self-end" label="Sovereign approval recorded" checked={create.data.sovereign_approval} onChange={(e) => create.setData('sovereign_approval', e.target.checked)} />
                    <button type="submit" disabled={create.processing} className="h-10 rounded-[4px] bg-ink-900 text-sm font-semibold text-gold-400 sm:col-span-2">Create corridor (Pending)</button>
                </form>
            </Modal>

            <Modal open={editing !== null} onClose={() => setEditing(null)} title={`Update resolver — ${editing?.name ?? ''}`}>
                <form
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (editing) edit.patch(`/admin/core-pages/corridors/${editing.code}`, { preserveScroll: true, onSuccess: () => setEditing(null) });
                    }}
                >
                    <Field label="Resolver completeness (%)" error={edit.errors.rcs}>{(id) => <Input id={id} type="number" min={0} max={100} value={edit.data.rcs} onChange={(e) => edit.setData('rcs', Number(e.target.value))} />}</Field>
                    <Field label="Risk level">{(id) => <Select id={id} options={['Low', 'Medium', 'High']} value={edit.data.risk} onChange={(e) => edit.setData('risk', e.target.value)} />}</Field>
                    <Checkbox label="Sovereign approval recorded" checked={edit.data.sovereign_approval} onChange={(e) => edit.setData('sovereign_approval', e.target.checked)} />
                    {editing && editing.history.length > 0 && <ul className="max-h-32 overflow-y-auto rounded border border-parchment-300 p-2 text-[0.6875rem] text-ink-500">{editing.history.map((h, i) => <li key={i}>{new Date(h.at).toLocaleString('en-GB')} — {h.event}{h.by ? ` (${h.by})` : ''}</li>)}</ul>}
                    <button type="submit" disabled={edit.processing} className="h-10 w-full rounded-[4px] bg-ink-900 text-sm font-semibold text-gold-400">Save</button>
                </form>
            </Modal>
        </ConsoleLayout>
    );
}

Corridors.layout = null;
