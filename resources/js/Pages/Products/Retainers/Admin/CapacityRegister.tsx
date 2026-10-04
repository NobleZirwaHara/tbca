import { useState, type FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, CalendarDays, CheckCircle2, Circle, Download, Hourglass, Plus, Warehouse } from 'lucide-react';
import { Modal, Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { Field, Input, Select } from '@/Components/ui/Form';
import { ActionButton, CheckList, Notice } from '@/Components/Products/Shared';
import type { RetRetainer } from '@/Components/Products/Retainers/types';
import { AdminShell } from '@/Components/Products/Retainers/Shells';
import { C, Donut, Legend, MiniSelect, StatTile, applyFilters, fmtDate, hrs } from '@/Components/Products/Retainers/ui';

interface Props {
    retainer: RetRetainer;
    options: { value: string; label: string }[];
    kpis: { allowance: number; total: number; confirmed: number; tentative: number; available: number; over: number; days_left: number };
    commitments: { id: number; reference: string; type: string; description: string; owner: string; hours: number; status: string; committed_on: string; starts_on: string; ends_on: string }[];
    filters: { status: string; type: string; owner: string; q: string };
    owners: string[];
    pools: { id: number; code: string; name: string; skill: string; seniority: string; productive: number; active: number; reserved: number; cross_vehicle: number; rollover: number; protective: number; review: number; headroom: number; stale: boolean; effective: string | null }[];
    proposals: { id: number; reference: string; organisation: string; service: string; units: number; status: string; hold_reason: string | null; reserved_units: number; expires: string | null }[];
}

const PATH = '/admin/products/retainers/capacity-register';

export default function CapacityRegister({ retainer: r, options, kpis: k, commitments, filters, owners, pools, proposals }: Props) {
    const [open, setOpen] = useState(false);
    const [pool, setPool] = useState<Props['pools'][number] | null>(null);
    const form = useForm({ retainer: r.code, type: 'Deliverable', description: '', owner: owners[0] ?? '', starts_on: '', ends_on: '', hours: '', status: 'tentative' });
    const poolForm = useForm({ productive_units: '', cross_vehicle_units: '', protective_reserve: '', review_reserve: '' });
    const err = form.errors as Record<string, string>;
    const pct = (v: number) => (k.allowance ? Math.round((v / k.allowance) * 100) : 0);
    const set = (key: string, v: string) => applyFilters(PATH, { retainer: r.code, ...filters, [key]: v });
    const add = (e: FormEvent) => {
        e.preventDefault();
        form.post(`${PATH}/commitments`, { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset('description', 'hours'); } });
    };

    return (
        <AdminShell title="Capacity Commitment Register" description="View and manage all capacity commitments for this retainer, and the exact-pool hard headroom that caps every new sale." selector={{ value: r.code, options, path: PATH }}>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={CalendarDays} tone="purple" label="Total Commitment (Current Period)" value={hrs(k.total)} unit="hours" caption={`${pct(k.total)}% of allowance`} />
                <StatTile icon={CheckCircle2} tone="good" label="Committed & Confirmed" value={hrs(k.confirmed)} unit="hours" caption={`${pct(k.confirmed)}% of allowance`} />
                <StatTile icon={Circle} tone="gold" label="Tentative / On Hold" value={hrs(k.tentative)} unit="hours" caption={`${pct(k.tentative)}% of allowance`} />
                <StatTile icon={Hourglass} tone="purple" label="Available (Uncommitted)" value={hrs(k.available)} unit="hours" caption={`${pct(k.available)}% of allowance`} />
                <StatTile icon={AlertTriangle} tone="bad" label="Over-committed" value={hrs(k.over)} unit="hours" caption={`${pct(k.over)}%`} />
                <StatTile icon={CalendarDays} tone="purple" label="Current Period" value={<span className="text-sm">{fmtDate(r.period?.starts_on)} – {fmtDate(r.period?.ends_on)}</span>} caption={`${k.days_left} days remaining`} />
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                <MiniSelect label="Status" value={filters.status} onChange={(v) => set('status', v)} options={[{ value: '', label: 'All Statuses' }, ...['confirmed', 'tentative', 'on_hold', 'released'].map((s) => ({ value: s, label: s.replace('_', ' ') }))]} />
                <MiniSelect label="Type" value={filters.type} onChange={(v) => set('type', v)} options={[{ value: '', label: 'All Types' }, ...['Deliverable', 'Milestone', 'Meeting', 'Event'].map((s) => ({ value: s, label: s }))]} />
                <MiniSelect label="Owner / Adviser" value={filters.owner} onChange={(v) => set('owner', v)} options={[{ value: '', label: 'All Owners' }, ...owners.map((s) => ({ value: s, label: s }))]} />
                <label className="flex flex-col gap-1 text-[0.6875rem] font-medium text-ink-500">Search<input defaultValue={filters.q} onKeyDown={(e) => e.key === 'Enter' && set('q', (e.target as HTMLInputElement).value)} placeholder="Search commitments..." className="h-9 rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem]" /></label>
                <button type="button" onClick={() => setOpen(true)} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-referenced-700 px-4 text-sm font-semibold text-white"><Plus className="size-4" aria-hidden="true" />New Commitment</button>
            </div>

            <Panel title="Commitment Register" className="mt-4">
                <SimpleTable
                    columns={['ID', 'Type', 'Description / Deliverable', 'Owner / Adviser', 'Committed Date', 'Start Date', 'End Date', 'Hours Committed', 'Status', 'Impact on Capacity', 'Actions']}
                    rows={commitments.map((c) => [
                        <span key="i" className="font-mono text-xs text-referenced-700">{c.reference}</span>, c.type, c.description, c.owner, fmtDate(c.committed_on), fmtDate(c.starts_on), fmtDate(c.ends_on), hrs(c.hours), <StatusPill key="s" status={c.status} tone={c.status === 'tentative' ? 'warn' : undefined} />,
                        <span key="m" className="text-verified-700">+{hrs(c.hours)} h ({pct(c.hours)}%)</span>,
                        <span key="a" className="flex flex-wrap gap-1">
                            {c.status !== 'confirmed' && c.status !== 'released' && <ActionButton href={`${PATH}/commitments/${c.id}/status`} data={{ status: 'confirmed' }} tone="gold">Confirm</ActionButton>}
                            {c.status === 'tentative' && <ActionButton href={`${PATH}/commitments/${c.id}/status`} data={{ status: 'on_hold' }}>Hold</ActionButton>}
                            {c.status !== 'released' && <ActionButton href={`${PATH}/commitments/${c.id}/status`} data={{ status: 'released' }} tone="danger">Release</ActionButton>}
                        </span>,
                    ])}
                    empty="No commitments match these filters."
                />
            </Panel>

            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <Panel title="Capacity Impact Summary">
                    <div className="flex flex-wrap items-center gap-4">
                        <Donut segments={[{ value: k.confirmed, color: C.green }, { value: k.tentative, color: C.amber }, { value: k.available, color: C.purple }, { value: k.over, color: C.red }]} centre={hrs(k.allowance)} sub="hours Allowance" size={140} />
                        <div className="min-w-0 flex-1"><Legend items={[{ color: C.green, label: 'Committed & Confirmed', value: `${hrs(k.confirmed)} h (${pct(k.confirmed)}%)` }, { color: C.amber, label: 'Tentative / On Hold', value: `${hrs(k.tentative)} h (${pct(k.tentative)}%)` }, { color: C.purple, label: 'Available (Uncommitted)', value: `${hrs(k.available)} h (${pct(k.available)}%)` }, { color: C.red, label: 'Over-committed', value: `${hrs(k.over)} h` }]} /></div>
                    </div>
                </Panel>
                <Panel title="Commitment Rules">
                    <CheckList items={['Commitments cannot exceed available allowance.', 'Confirmed commitments block time in the calendar.', 'Tentative commitments can be released if needed.', 'No commercial override of the capacity ceiling exists.']} />
                </Panel>
                <Notice tone="info" title="About Commitments">Commitments reserve time against the allowance. Confirmed commitments reduce available capacity. Tentative commitments can be adjusted or released. Use the workbench to test scenario impact.</Notice>
            </div>

            <Panel title={<span className="inline-flex items-center gap-2"><Warehouse className="size-4" aria-hidden="true" />Exact-Pool Hard Headroom (sales ceiling)</span>} className="mt-5">
                <p className="-mt-2 mb-3 text-xs text-ink-500">HARD HEADROOM = productive − active − reserved proposals − cross-vehicle − rollover − protective − review. Unknown or stale data blocks new sales.</p>
                <SimpleTable
                    columns={['Pool', 'Skill / Seniority', 'Productive', 'Active', 'Reserved', 'Cross-vehicle', 'Rollover', 'Reserves', 'Headroom', 'Data', '']}
                    rows={pools.map((p) => [
                        <span key="n"><span className="block font-semibold">{p.name}</span><span className="text-[0.6875rem] text-ink-400">{p.code}</span></span>, <span key="s" className="text-xs">{p.skill}<br />{p.seniority}</span>, hrs(p.productive), hrs(p.active), hrs(p.reserved), hrs(p.cross_vehicle), hrs(p.rollover), hrs(p.protective + p.review),
                        <span key="h" className={p.headroom <= 0 ? 'font-bold text-risk-700' : 'font-bold text-verified-700'}>{hrs(p.headroom)} h</span>,
                        <StatusPill key="d" status={p.stale ? 'stale' : 'current'} tone={p.stale ? 'bad' : 'good'} />,
                        <button key="e" type="button" onClick={() => { setPool(p); poolForm.setData({ productive_units: String(p.productive), cross_vehicle_units: String(p.cross_vehicle), protective_reserve: String(p.protective), review_reserve: String(p.review) }); }} className="text-xs font-semibold text-referenced-700">Re-measure</button>,
                    ])}
                />
            </Panel>

            <Panel title="Proposal Capacity Holds (GATE-RE-03)" className="mt-5">
                <SimpleTable
                    columns={['Proposal', 'Client', 'Service', 'Units', 'Status', 'Reserved', 'Hold expires', '']}
                    rows={proposals.map((p) => [<span key="r" className="font-mono text-xs">{p.reference}</span>, p.organisation, p.service, `${hrs(p.units)} h`, <StatusPill key="s" status={p.hold_reason ? `${p.status}: ${p.hold_reason}` : p.status} />, `${hrs(p.reserved_units)} h`, fmtDate(p.expires), p.status === 'hold' && p.hold_reason === 'CAPACITY_HOLD' ? <ActionButton key="a" href={`${PATH}/proposals/${p.id}/reserve`} tone="gold">Reserve Capacity</ActionButton> : '—'])}
                    empty="No open proposals."
                />
            </Panel>

            <div className="mt-5 flex justify-end"><button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-referenced-500/50 px-4 text-sm font-semibold text-referenced-700"><Download className="size-4" aria-hidden="true" />Export Register</button></div>

            <Modal open={open} onClose={() => setOpen(false)} title="New Commitment" footer={<><button type="button" onClick={() => setOpen(false)} className="h-9 rounded border border-parchment-500 px-4 text-sm">Cancel</button><button type="submit" form="commit-form" disabled={form.processing} className="h-9 rounded bg-referenced-700 px-4 text-sm font-semibold text-white">Add</button></>}>
                <form id="commit-form" onSubmit={add} className="grid gap-3 sm:grid-cols-2" noValidate>
                    <Field label="Type">{(id) => <Select id={id} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} options={['Deliverable', 'Milestone', 'Meeting', 'Event']} />}</Field>
                    <Field label="Status">{(id) => <Select id={id} value={form.data.status} onChange={(e) => form.setData('status', e.target.value)} options={[{ value: 'tentative', label: 'Tentative' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'on_hold', label: 'On Hold' }]} />}</Field>
                    <Field label="Description / Deliverable" required error={err.description} className="sm:col-span-2">{(id) => <Input id={id} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />}</Field>
                    <Field label="Owner / Adviser" required error={err.owner}>{(id) => <Input id={id} value={form.data.owner} onChange={(e) => form.setData('owner', e.target.value)} />}</Field>
                    <Field label="Hours" required error={err.hours}>{(id) => <Input id={id} type="number" step={0.25} value={form.data.hours} onChange={(e) => form.setData('hours', e.target.value)} />}</Field>
                    <Field label="Start Date" required error={err.starts_on}>{(id) => <Input id={id} type="date" value={form.data.starts_on} onChange={(e) => form.setData('starts_on', e.target.value)} />}</Field>
                    <Field label="End Date" required error={err.ends_on}>{(id) => <Input id={id} type="date" value={form.data.ends_on} onChange={(e) => form.setData('ends_on', e.target.value)} />}</Field>
                </form>
            </Modal>

            <Modal open={pool !== null} onClose={() => setPool(null)} title={`Re-measure ${pool?.name ?? ''}`} footer={<><button type="button" onClick={() => setPool(null)} className="h-9 rounded border border-parchment-500 px-4 text-sm">Cancel</button><button type="button" disabled={poolForm.processing} onClick={() => pool && poolForm.post(`${PATH}/pools/${pool.id}`, { preserveScroll: true, onSuccess: () => setPool(null) })} className="h-9 rounded bg-referenced-700 px-4 text-sm font-semibold text-white">Save measurement</button></>}>
                <div className="grid gap-3 sm:grid-cols-2">
                    {(['productive_units', 'cross_vehicle_units', 'protective_reserve', 'review_reserve'] as const).map((f) => (
                        <Field key={f} label={f.replace(/_/g, ' ')} error={(poolForm.errors as Record<string, string>)[f]}>{(id) => <Input id={id} type="number" value={poolForm.data[f]} onChange={(e) => poolForm.setData(f, e.target.value)} />}</Field>
                    ))}
                </div>
            </Modal>
        </AdminShell>
    );
}

CapacityRegister.layout = null;
