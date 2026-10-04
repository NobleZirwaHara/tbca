import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Calculator, CheckCircle2, Download, Equal, Percent, RefreshCw, Search } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Field, Input } from '@/Components/ui/Form';
import { IndustryAdmin, useFilters } from '@/Components/Insights/Industries';
import { Box, Stat, Status, Table, zar } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';

interface Row { id: number; code: string; title: string; industry: string | null; drivers: Record<string, number>; score: number; complexityClass: string; complexityLabel: string; baseCost: number | null; modifier: number | null; adjustedCost: number | null; marginPct: number | null; floorPrice: number | null; guidancePrice: number | null; marginStatus: string; updated: string | null }
interface Props {
    filters: { q?: string; industry?: string; class?: string; status?: string };
    rows: Row[];
    kpis: { total: number; withComplexity: number; below: number; at: number; above: number; avgMargin: number };
    industries: string[];
    drivers: Record<string, { label: string; max: number }>;
    classes: { class: string; label: string; modifier: number | null }[];
    floorMargin: number;
    marginTarget: number;
}

export default function Margin({ filters, rows, kpis, industries, drivers, classes, floorMargin, marginTarget }: Props) {
    const { f, setF, apply } = useFilters({ q: filters.q ?? '', industry: filters.industry ?? '', class: filters.class ?? '', status: filters.status ?? '' }, '/admin/insights/industries/margin');
    const [edit, setEdit] = useState<Row | null>(null);
    const [sel, setSel] = useState<number[]>([]);
    const form = useForm<{ base_cost_zar: number; guidance_price_zar: number; drivers: Record<string, number> }>({ base_cost_zar: 0, guidance_price_zar: 0, drivers: {} });
    const keys = Object.keys(drivers);
    const open = (r: Row) => { form.setData({ base_cost_zar: r.baseCost ?? 0, guidance_price_zar: r.guidancePrice ?? 0, drivers: { ...r.drivers } }); setEdit(r); };
    const preview = keys.reduce((a, k) => a + (Number(form.data.drivers[k]) || 0), 0);
    const pClass = preview <= 3 ? 'C0' : preview <= 7 ? 'C1' : preview <= 11 ? 'C2' : 'C3';

    return (
        <IndustryAdmin
            title="Complexity Modifier & Margin Console"
            badge="Canonical Cost Truth"
            description="Maintain objective complexity drivers, compute cost, apply class modifiers and manage margin, floor and pricing guidance."
            actions={
                <>
                    <a href="/admin/insights/industries/margin-export" className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><Download className="size-4" /> Export Console (CSV)</a>
                    <button type="button" onClick={() => router.post('/admin/insights/industries/margin/apply-floor', { ids: sel.length ? sel : null }, { preserveScroll: true })} className="flex items-center gap-1.5 rounded bg-gold-500 px-3 py-2 text-xs font-bold"><RefreshCw className="size-4" /> {sel.length ? `Lift ${sel.length} Selected to Floor` : 'Recalculate All & Lift Below-Floor'}</button>
                </>
            }
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <Stat label="Total Sprints" value={kpis.total} caption="Costed population" icon={<Calculator className="size-5" />} />
                <Stat label="With Complexity" value={kpis.withComplexity} caption={`${kpis.total ? Math.round((kpis.withComplexity / kpis.total) * 100) : 0}%`} icon={<CheckCircle2 className="size-5" />} />
                <Stat label="Below Floor" value={kpis.below} tone="red" icon={<ArrowDown className="size-5" />} />
                <Stat label="At Floor" value={kpis.at} tone="amber" icon={<Equal className="size-5" />} />
                <Stat label="Above Floor" value={kpis.above} tone="green" icon={<ArrowUp className="size-5" />} />
                <Stat label="Avg. Margin %" value={`${kpis.avgMargin}%`} caption={`Target ${marginTarget}%+`} icon={<Percent className="size-5" />} />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="mt-4 flex flex-wrap items-end gap-2 rounded-[8px] border border-parchment-400 bg-white p-3">
                <label className="relative"><span className="sr-only">Search</span><Search className="absolute top-2.5 left-2 size-4 text-ink-400" /><input value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search by Sprint Code, Title..." className="h-9 w-56 rounded border border-parchment-500 pl-7 text-xs" /></label>
                <select aria-label="Industry" value={f.industry} onChange={(e) => apply({ industry: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Industries</option>{industries.map((i) => <option key={i}>{i}</option>)}</select>
                <select aria-label="Complexity class" value={f.class} onChange={(e) => apply({ class: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Classes</option>{classes.map((c) => <option key={c.class} value={c.class}>{c.class} {c.label}</option>)}</select>
                <select aria-label="Margin status" value={f.status} onChange={(e) => apply({ status: e.target.value })} className="h-9 rounded border border-parchment-500 text-xs"><option value="">All Statuses</option><option value="above_floor">Above Floor</option><option value="at_floor">At Floor</option><option value="below_floor">Below Floor</option><option value="blocked">Blocked (C4)</option></select>
                <button type="submit" className="h-9 rounded bg-ink-900 px-3 text-xs font-semibold text-parchment-100">Apply</button>
            </form>

            <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_260px]">
                <Box title="Complexity & Cost Build-Up">
                    <Table
                        head={[<input key="all" type="checkbox" aria-label="Select all" checked={sel.length === rows.length && rows.length > 0} onChange={(e) => setSel(e.target.checked ? rows.map((r) => r.id) : [])} />, 'Sprint Code', 'Title', 'Industry', 'Class', ...keys, 'Base Cost (A)', 'Modifier (B)', 'Adjusted (A×B)', 'Margin %', 'Floor', 'Guidance', 'Status', '']}
                        rows={rows.map((r) => [
                            <input key="s" type="checkbox" aria-label={`Select ${r.code}`} checked={sel.includes(r.id)} onChange={(e) => setSel(e.target.checked ? [...sel, r.id] : sel.filter((x) => x !== r.id))} />,
                            <strong key="c">{r.code}</strong>, <span key="t" className="text-xs">{r.title}</span>, <span key="i" className="text-xs">{r.industry}</span>,
                            <span key="cl" className="rounded bg-parchment-200 px-1.5 text-[0.6875rem] whitespace-nowrap">{r.complexityLabel}</span>,
                            ...keys.map((k) => <span key={k} className="text-xs">{r.drivers[k] ?? 0}</span>),
                            zar(r.baseCost), r.modifier ? <span key="m" className="text-xs">{r.modifier.toFixed(2)}<span className="block text-ink-400">{r.modifier >= 1 ? '+' : ''}{Math.round((r.modifier - 1) * 100)}%</span></span> : '—',
                            zar(r.adjustedCost), <span key="mg" className={cn('font-semibold', (r.marginPct ?? 0) < floorMargin && 'text-risk-700')}>{r.marginPct ?? '—'}%</span>, zar(r.floorPrice), zar(r.guidancePrice),
                            <Status key="st" value={r.marginStatus} />,
                            <button key="e" type="button" onClick={() => open(r)} className="rounded border px-2 py-0.5 text-xs">Edit</button>,
                        ])}
                    />
                </Box>
                <div className="space-y-4">
                    <Box title="Complexity Driver Guide"><ul className="space-y-1.5 text-xs">{keys.map((k) => <li key={k}><strong>{k}</strong> {drivers[k].label} (0–{drivers[k].max})</li>)}</ul><p className="mt-2 text-[0.6875rem] text-ink-400">Score = sum of drivers (max 20). W must come from delivery evidence.</p></Box>
                    <Box title="Modifier Framework"><ul className="space-y-1 text-xs">{classes.map((c) => <li key={c.class} className="flex justify-between"><span>{c.class} {c.label}</span><strong>{c.modifier ? c.modifier.toFixed(2) : 'BLOCK'}</strong></li>)}</ul></Box>
                    <Box title="Margin & Floor Summary"><dl className="space-y-1 text-xs"><div className="flex justify-between"><dt>Floor margin</dt><dd>{floorMargin}%</dd></div><div className="flex justify-between"><dt>Floor Compliance</dt><dd>{kpis.total ? (((kpis.total - kpis.below) / kpis.total) * 100).toFixed(1) : 100}%</dd></div><div className="flex justify-between"><dt>Margin Target</dt><dd>≥ {marginTarget}%</dd></div><div className="flex justify-between"><dt>Current Avg. Margin</dt><dd>{kpis.avgMargin}%</dd></div></dl></Box>
                </div>
            </div>

            <Modal open={!!edit} onClose={() => setEdit(null)} title={`Update complexity – ${edit?.code ?? ''}`} size="lg"
                footer={<button type="button" disabled={form.processing} onClick={() => edit && form.put(`/admin/insights/industries/margin/${edit.id}`, { preserveScroll: true, onSuccess: () => setEdit(null) })} className="rounded bg-gold-500 px-4 py-2 text-sm font-semibold">Recalculate & Save</button>}>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {keys.map((k) => (
                        <Field key={k} label={`${k} (0–${drivers[k].max})`} error={(form.errors as Record<string, string>)[`drivers.${k}`]}>{(id) => <Input id={id} type="number" min={0} max={drivers[k].max} value={form.data.drivers[k] ?? 0} onChange={(e) => form.setData('drivers', { ...form.data.drivers, [k]: Number(e.target.value) })} />}</Field>
                    ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                    <Field label="Base cost (ZAR)" error={form.errors.base_cost_zar}>{(id) => <Input id={id} type="number" value={form.data.base_cost_zar} onChange={(e) => form.setData('base_cost_zar', Number(e.target.value))} />}</Field>
                    <Field label="Guidance price (ZAR)" error={form.errors.guidance_price_zar}>{(id) => <Input id={id} type="number" value={form.data.guidance_price_zar} onChange={(e) => form.setData('guidance_price_zar', Number(e.target.value))} />}</Field>
                </div>
                <p className="mt-3 rounded bg-parchment-100 p-2 text-xs">Preview: score {preview} → class <strong>{pClass}</strong> · modifier {classes.find((c) => c.class === pClass)?.modifier?.toFixed(2)} · adjusted cost {zar(Math.round(form.data.base_cost_zar * (classes.find((c) => c.class === pClass)?.modifier ?? 1)))}</p>
            </Modal>
        </IndustryAdmin>
    );
}
