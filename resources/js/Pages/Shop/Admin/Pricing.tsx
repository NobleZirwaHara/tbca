import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowDownCircle, CheckCircle2, Clock, Pencil, RefreshCw, ShieldCheck, TrendingUp, TriangleAlert } from 'lucide-react';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, Card, Donut, FilterBar, fmtDate, fmtZar, Kpi, KpiGrid, pct } from '@/Components/Shop/AdminKit';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Field, Input, Select } from '@/Components/ui/Form';
import { Modal, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import type { Option } from '@/types/shop';

interface Row { slug: string; code: string; name: string; vehicle: string; act: string; sku: string; price: number | null; unit: string | null; vat_rate: number; vat: number | null; incl: number | null; floor: number | null; gap: number | null; compliance: string; tax: string; tax_confirmed: boolean; updated: string | null }
interface Props {
    rows: Row[];
    kpis: { total: number; with_floor: number; compliant: number; at_floor: number; below: number; no_price: number; changed: number; last: string | null };
    tax: Record<string, number>;
    medians: Record<string, number>;
    changes: { total: number; increases: number; decreases: number };
    filters: Record<string, string>;
    options: { vehicles: string[]; acts: Option[] };
}

const TAX: Option[] = [{ value: 'standard', label: 'Standard Rated (15%)' }, { value: 'zero', label: 'Zero Rated (0%)' }, { value: 'exempt', label: 'Exempt' }, { value: 'out_of_scope', label: 'Out of Scope' }];
const COMPLIANCE: Option[] = [{ value: 'compliant', label: 'Compliant' }, { value: 'at_floor', label: 'At Floor' }, { value: 'below_floor', label: 'Below Floor' }, { value: 'no_price', label: 'No Price' }];

function EditPrice({ row, onClose }: { row: Row; onClose: () => void }) {
    const form = useForm({ price_zar: row.price === null ? '' : String(row.price), floor_zar: row.floor === null ? '' : String(row.floor), tax_treatment: row.tax, tax_confirmed: row.tax_confirmed });
    const gap = form.data.price_zar !== '' && form.data.floor_zar !== '' ? Number(form.data.price_zar) - Number(form.data.floor_zar) : null;
    return (
        <Modal
            open
            onClose={onClose}
            title={`Edit price - ${row.name}`}
            footer={
                <Button
                    type="button"
                    size="sm"
                    disabled={form.processing}
                    onClick={() => { form.transform((d) => ({ ...d, price_zar: d.price_zar === '' ? null : Number(d.price_zar), floor_zar: d.floor_zar === '' ? null : Number(d.floor_zar) })); form.patch(`/admin/shop/pricing/${row.slug}`, { preserveScroll: true, onSuccess: onClose }); }}
                >
                    Save Pricing
                </Button>
            }
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Price (Excl. VAT)" error={form.errors.price_zar}>{(id) => <Input id={id} type="number" min={0} value={form.data.price_zar} onChange={(e) => form.setData('price_zar', e.target.value)} />}</Field>
                <Field label="Authority Floor (Excl. VAT)" error={form.errors.floor_zar}>{(id) => <Input id={id} type="number" min={0} value={form.data.floor_zar} onChange={(e) => form.setData('floor_zar', e.target.value)} />}</Field>
                <Field label="Tax treatment" error={form.errors.tax_treatment}>{(id) => <Select id={id} options={TAX} value={form.data.tax_treatment} onChange={(e) => form.setData('tax_treatment', e.target.value)} />}</Field>
                <div className="pt-6"><Checkbox label="Tax profile confirmed" checked={form.data.tax_confirmed} onChange={(e) => form.setData('tax_confirmed', e.target.checked)} /></div>
            </div>
            {gap !== null && <p className={gap < 0 ? 'mt-3 text-xs font-semibold text-risk-700' : 'mt-3 text-xs text-verified-700'}>Floor gap: {fmtZar(gap)} {gap < 0 && '- below floor: the product will be blocked at the next recalculation.'}</p>}
        </Modal>
    );
}

export default function Pricing({ rows, kpis, tax, medians, changes, filters, options }: Props) {
    const [editing, setEditing] = useState<Row | null>(null);
    return (
        <AdminShell
            title="Price, Floor & Tax Console"
            description="Manage prices, enforce authoritative floors and tax/VAT settings across all vehicles and acts."
            actions={<ActionButton href="/admin/shop/pricing/recalculate" tone="primary"><RefreshCw className="size-4" /> Recalculate All Floors</ActionButton>}
        >
            <KpiGrid>
                <Kpi icon={<ShieldCheck className="size-5" />} label="Total Products with Floors" value={kpis.with_floor} caption={pct(kpis.with_floor, kpis.total) + ' of Catalogue'} tone="info" />
                <Kpi icon={<CheckCircle2 className="size-5" />} label="Floor Compliant" value={kpis.compliant} caption={pct(kpis.compliant, kpis.total)} tone="good" />
                <Kpi icon={<ArrowDownCircle className="size-5" />} label="Below Floor" value={kpis.below} caption={pct(kpis.below, kpis.total)} tone="bad" />
                <Kpi icon={<TriangleAlert className="size-5" />} label="No Price Set" value={kpis.no_price} caption={pct(kpis.no_price, kpis.total)} tone="warn" />
                <Kpi icon={<TrendingUp className="size-5" />} label="Price Changed (30 Days)" value={kpis.changed} tone="info" />
                <Kpi icon={<Clock className="size-5" />} label="Last Full Recalculation" value={<span className="text-sm">{fmtDate(kpis.last, true)}</span>} caption="SAST (UTC+2)" />
            </KpiGrid>

            <FilterBar
                path="/admin/shop/pricing"
                filters={filters}
                selects={[
                    { name: 'vehicle', label: 'Vehicle', options: options.vehicles },
                    { name: 'act', label: 'Commercial Act', options: options.acts },
                    { name: 'compliance', label: 'Floor Compliance', options: COMPLIANCE },
                    { name: 'tax', label: 'Tax Treatment', options: TAX },
                ]}
            />

            <div className="grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-9">
                    <SimpleTable
                        columns={['Sprint Code', 'Sprint Name', 'Vehicle', 'Commercial Act', 'SKU', 'Price (Excl. VAT)', 'VAT Rate', 'VAT Amount', 'Price (Incl. VAT)', 'Authority Floor', 'Floor Gap', 'Compliance', 'Tax Treatment', 'Last Updated', '']}
                        rows={rows.map((r) => [
                            <span key="c" className="font-mono text-xs">{r.code}</span>, r.name, r.vehicle, r.act, <span key="s" className="font-mono text-[0.6875rem]">{r.sku}</span>,
                            fmtZar(r.price) + (r.unit ? ` /${r.unit}` : ''), `${Math.round(r.vat_rate * 100)}%`, r.vat === null ? '-' : `ZAR ${r.vat.toFixed(2)}`, r.incl === null ? '-' : `ZAR ${r.incl.toFixed(2)}`,
                            fmtZar(r.floor),
                            <span key="g" className={r.gap !== null && r.gap < 0 ? 'font-semibold text-risk-700' : 'font-semibold text-verified-700'}>{r.gap === null ? '-' : `${r.gap > 0 ? '+' : ''}${fmtZar(r.gap)}`}</span>,
                            <StatusPill key="p" status={r.compliance.replace('_', ' ')} tone={r.compliance === 'compliant' ? 'good' : r.compliance === 'at_floor' ? 'warn' : 'bad'} />,
                            <span key="t" className="text-xs">{TAX.find((t) => t.value === r.tax)?.label}{!r.tax_confirmed && <span className="block text-risk-700">Unconfirmed</span>}</span>,
                            <span key="u" className="text-xs">{fmtDate(r.updated)}</span>,
                            <button key="e" type="button" onClick={() => setEditing(r)} className="inline-flex items-center gap-1 text-xs font-semibold text-controlled-700" aria-label={`Edit price for ${r.name}`}><Pencil className="size-3.5" /> Edit</button>,
                        ])}
                    />
                </div>
                <div className="space-y-4 xl:col-span-3">
                    <Donut title="Price & Floor Overview" segments={[{ label: 'Compliant', value: kpis.compliant - kpis.at_floor }, { label: 'At Floor', value: kpis.at_floor, color: '#d6a32e' }, { label: 'Below Floor', value: kpis.below, color: '#b5372a' }, { label: 'No Price', value: kpis.no_price, color: '#9a9aa5' }]} />
                    <Donut title="Tax Treatment Breakdown" segments={TAX.map((t, i) => ({ label: t.label, value: tax[t.value] ?? 0, color: ['#2f5fa8', '#1f7a4c', '#d6a32e', '#7a4fa3'][i] }))} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card title="Price Change Summary (30 Days)">
                    <dl className="space-y-1.5 text-xs">
                        <div className="flex justify-between"><dt>Total Changes</dt><dd className="font-semibold">{changes.total}</dd></div>
                        <div className="flex justify-between"><dt>Price Increases</dt><dd className="font-semibold">{changes.increases}</dd></div>
                        <div className="flex justify-between"><dt>Price Decreases</dt><dd className="font-semibold">{changes.decreases}</dd></div>
                        <div className="flex justify-between"><dt>No Change</dt><dd className="font-semibold">{Math.max(0, changes.total - changes.increases - changes.decreases)}</dd></div>
                    </dl>
                </Card>
                <Card title="Median Price (Excl. VAT) by Vehicle">
                    <dl className="space-y-1.5 text-xs">
                        {Object.entries(medians).map(([v, m]) => <div key={v} className="flex justify-between"><dt>{v}</dt><dd className="font-semibold">{fmtZar(Math.round(m))}</dd></div>)}
                    </dl>
                </Card>
                <Card title="Floor Coverage">
                    <dl className="space-y-1.5 text-xs">
                        <div className="flex justify-between"><dt>Products with Floor</dt><dd className="font-semibold">{kpis.with_floor} ({pct(kpis.with_floor, kpis.total)})</dd></div>
                        <div className="flex justify-between"><dt>Without Floor (Should be 0)</dt><dd className="font-semibold">{kpis.total - kpis.with_floor}</dd></div>
                        <div className="flex justify-between"><dt>Floor Last Updated</dt><dd className="font-semibold">{fmtDate(kpis.last, true)}</dd></div>
                    </dl>
                </Card>
            </div>
            {editing && <EditPrice key={editing.slug} row={editing} onClose={() => setEditing(null)} />}
        </AdminShell>
    );
}

Pricing.layout = null;
