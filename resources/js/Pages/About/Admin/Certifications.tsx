import { router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Award, CircleCheck, Clock, Globe, Plus, RotateCcw, Search, ShieldCheck, TriangleAlert } from 'lucide-react';
import { KpiTile, Modal, Panel, StatusPill } from '@/Components/ui/Kit';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import AdminShell, { Donut, Pager, useFilters, type Paginated } from '@/Components/About/AdminShell';
import { fmtDate } from '@/Components/About/ClaimEvidence';

interface Asset {
    id: number;
    code: string;
    name: string;
    type: string;
    jurisdiction: string;
    registration_no: string | null;
    issuer: string | null;
    status: string;
    state: string;
    valid_from: string | null;
    valid_to: string | null;
    owner: string | null;
    symbol: string;
    days_left: number | null;
    linked_claims: string[];
}
interface Props {
    assets: Paginated<Asset>;
    kpis: Record<'total' | 'active' | 'expiring_soon' | 'expired' | 'paused' | 'jurisdictions', number>;
    renewals: { code: string; name: string; valid_to: string; days: number }[];
    filters: Record<string, string | undefined>;
    options: { jurisdictions: string[]; owners: string[] };
}

const typeLabel: Record<string, string> = { trade_mark: 'Trade Mark', certification: 'Certification', attestation: 'Attestation' };

export default function Certifications({ assets, kpis, renewals, filters, options }: Props) {
    const apply = useFilters('/admin/about/certifications', filters);
    const [q, setQ] = useState(filters.q ?? '');
    const [adding, setAdding] = useState<string | null>(null);
    const [renewing, setRenewing] = useState<Asset | null>(null);
    const add = useForm({ name: '', asset_type: 'trade_mark', jurisdiction: 'South Africa', registration_no: '', issuer: '', symbol: '™', valid_from: '', valid_to: '', owner: 'TBCA Holdings (Pty) Ltd' });
    const renew = useForm({ valid_to: '', registration_no: '' });
    const pct = (n: number) => `${kpis.total ? Math.round((n / kpis.total) * 1000) / 10 : 0}%`;

    const openAdd = (type: string) => {
        add.reset();
        add.setData((d) => ({ ...d, asset_type: type, symbol: type === 'trade_mark' ? '™' : '', owner: type === 'trade_mark' ? 'TBCA Holdings (Pty) Ltd' : 'TBCA Operations' }));
        setAdding(type);
    };
    const submitAdd = (e: FormEvent) => {
        e.preventDefault();
        add.post('/admin/about/certifications', { preserveScroll: true, onSuccess: () => setAdding(null) });
    };
    const submitRenew = (e: FormEvent) => {
        e.preventDefault();
        if (renewing) renew.post(`/admin/about/certifications/${renewing.id}/renew`, { preserveScroll: true, onSuccess: () => setRenewing(null) });
    };
    const setState = (a: Asset, state: string) => router.post(`/admin/about/certifications/${a.id}/state`, { state }, { preserveScroll: true });

    return (
        <AdminShell
            crumb="Certification & Trade Mark Manager"
            title="Certification & Trade Mark Manager"
            lead="Protecting our promise. Managing our marks and certifications."
            description="This console manages TBCA certifications, attestations and trade marks across all jurisdictions. Renewals update the bound claim evidence automatically; ® renders only for current registrations."
            actions={<Button size="sm" onClick={() => openAdd('certification')}><Plus className="size-4" /> Add Asset</Button>}
        >
            <div className="grid gap-5 xl:grid-cols-[1fr_19rem]">
                <div className="min-w-0 space-y-4">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        <KpiTile label="Total Assets" value={kpis.total} caption="Across all categories" icon={<ShieldCheck className="size-4" />} />
                        <KpiTile label="Active / Valid" value={kpis.active} caption={pct(kpis.active)} tone="good" icon={<CircleCheck className="size-4" />} />
                        <KpiTile label="Expiring Soon" value={kpis.expiring_soon} caption={pct(kpis.expiring_soon)} tone="warn" icon={<Clock className="size-4" />} />
                        <KpiTile label="Expired" value={kpis.expired} caption={pct(kpis.expired)} tone="bad" icon={<TriangleAlert className="size-4" />} />
                        <KpiTile label="Jurisdictions" value={kpis.jurisdictions} caption="Countries / systems" icon={<Globe className="size-4" />} />
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); apply({ q, page: undefined }); }} className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-3 xl:grid-cols-[1.4fr_repeat(4,1fr)_auto]">
                        <label className="relative"><span className="sr-only">Search assets</span><Search className="absolute top-3 left-3 size-4 text-ink-400" aria-hidden="true" /><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, asset ID, status, jurisdiction..." className="pl-9" /></label>
                        <Select aria-label="Asset type" placeholder="All types" options={Object.entries(typeLabel).map(([value, label]) => ({ value, label }))} value={filters.type ?? ''} onChange={(e) => apply({ type: e.target.value, page: undefined })} />
                        <Select aria-label="Status" placeholder="All statuses" options={['active', 'expiring_soon', 'expired', 'paused', 'withdrawn'].map((v) => ({ value: v, label: v.replace('_', ' ') }))} value={filters.status ?? ''} onChange={(e) => apply({ status: e.target.value, page: undefined })} />
                        <Select aria-label="Jurisdiction" placeholder="All jurisdictions" options={options.jurisdictions} value={filters.jurisdiction ?? ''} onChange={(e) => apply({ jurisdiction: e.target.value, page: undefined })} />
                        <Select aria-label="Asset owner" placeholder="All owners" options={options.owners} value={filters.owner ?? ''} onChange={(e) => apply({ owner: e.target.value, page: undefined })} />
                        <button type="button" onClick={() => router.get('/admin/about/certifications')} className="inline-flex h-10 items-center justify-center gap-1 rounded-[4px] border border-parchment-500 px-3 text-xs font-semibold"><RotateCcw className="size-3.5" aria-hidden="true" /> Clear</button>
                    </form>
                    <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                        <table className="w-full min-w-[1000px] text-left text-[0.8125rem]">
                            <thead className="bg-parchment-200 text-xs text-ink-600"><tr>{['Asset ID', 'Asset Name', 'Type', 'Jurisdiction', 'Registration / Certificate No.', 'Status', 'Valid From', 'Valid To', 'Owner', 'Actions'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {assets.data.length === 0 && <tr><td colSpan={10} className="py-8 text-center text-ink-400">No assets match these filters.</td></tr>}
                                {assets.data.map((a) => (
                                    <tr key={a.id} className="align-top">
                                        <td className="px-3 py-2.5 font-mono text-xs font-semibold text-gold-700">{a.code}</td>
                                        <td className="px-3 py-2.5 text-ink-900">
                                            {a.name.replace(/[™®]$/, '')}{a.symbol}
                                            {a.linked_claims.length > 0 && <span className="block text-[0.6875rem] text-ink-400">Backs {a.linked_claims.join(', ')}</span>}
                                        </td>
                                        <td className="px-3 py-2.5">{typeLabel[a.type]}</td>
                                        <td className="px-3 py-2.5">{a.jurisdiction}</td>
                                        <td className="px-3 py-2.5 font-mono text-xs">{a.registration_no ?? '—'}</td>
                                        <td className="px-3 py-2.5"><StatusPill status={a.status} tone={a.status === 'expiring_soon' ? 'warn' : undefined} /></td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">{fmtDate(a.valid_from)}</td>
                                        <td className="px-3 py-2.5 whitespace-nowrap">{a.valid_to ? fmtDate(a.valid_to) : 'Perpetual'}</td>
                                        <td className="px-3 py-2.5">{a.owner}</td>
                                        <td className="px-3 py-2.5">
                                            <select aria-label={`Actions for ${a.code}`} value="" onChange={(e) => { const v = e.target.value; if (v === 'renew') { renew.reset(); setRenewing(a); } else if (v) setState(a, v); }} className="h-8 rounded border border-parchment-400 bg-white px-1 text-xs">
                                                <option value="">Action…</option>
                                                <option value="renew">Renew</option>
                                                {a.state !== 'paused' && <option value="paused">Pause</option>}
                                                {a.state !== 'withdrawn' && <option value="withdrawn">Withdraw</option>}
                                                {a.state !== 'active' && <option value="active">Reactivate</option>}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pager page={assets} noun="assets" />
                </div>
                <aside className="space-y-4">
                    <Panel title="Asset Status Overview">
                        <Donut total={kpis.total} segments={[{ label: 'Active / Valid', value: kpis.active, color: '#1f7a4c' }, { label: 'Expiring Soon', value: kpis.expiring_soon, color: '#b0781e' }, { label: 'Expired', value: kpis.expired, color: '#b5372a' }, { label: 'Paused / Inactive', value: kpis.paused, color: '#7a4fa3' }]} />
                    </Panel>
                    <Panel title="Upcoming Renewals">
                        <ul className="space-y-2 text-xs">
                            {renewals.map((r) => <li key={r.code} className="flex justify-between gap-2"><span>{r.name}</span><span className={r.days <= 180 ? 'text-risk-700' : 'text-verified-700'}>{fmtDate(r.valid_to)} ({r.days} days)</span></li>)}
                        </ul>
                        <button type="button" onClick={() => apply({ status: 'expiring_soon', page: undefined })} className="mt-3 text-xs font-semibold text-gold-700">View All Renewals →</button>
                    </Panel>
                    <Panel title="Quick Actions">
                        <ul className="space-y-2 text-[0.8125rem]">
                            <li><button type="button" onClick={() => openAdd('trade_mark')} className="flex items-center gap-2 text-ink-800 hover:text-gold-700"><ShieldCheck className="size-4 text-verified-500" aria-hidden="true" /> Add New Trade Mark</button></li>
                            <li><button type="button" onClick={() => openAdd('certification')} className="flex items-center gap-2 text-ink-800 hover:text-gold-700"><Award className="size-4 text-verified-500" aria-hidden="true" /> Add New Certification</button></li>
                            <li><button type="button" onClick={() => openAdd('attestation')} className="flex items-center gap-2 text-ink-800 hover:text-gold-700"><CircleCheck className="size-4 text-attested-500" aria-hidden="true" /> Add New Attestation</button></li>
                        </ul>
                    </Panel>
                </aside>
            </div>

            <Modal open={!!adding} onClose={() => setAdding(null)} title={`Add ${typeLabel[adding ?? 'trade_mark']}`} size="lg">
                <form onSubmit={submitAdd} className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name" required error={add.errors.name} className="sm:col-span-2">{(id) => <Input id={id} value={add.data.name} onChange={(e) => add.setData('name', e.target.value)} />}</Field>
                    <Field label="Jurisdiction" required error={add.errors.jurisdiction}>{(id) => <Input id={id} value={add.data.jurisdiction} onChange={(e) => add.setData('jurisdiction', e.target.value)} />}</Field>
                    <Field label="Registration / certificate no." error={add.errors.registration_no}>{(id) => <Input id={id} value={add.data.registration_no} onChange={(e) => add.setData('registration_no', e.target.value)} />}</Field>
                    <Field label="Issuer / registry" error={add.errors.issuer}>{(id) => <Input id={id} value={add.data.issuer} onChange={(e) => add.setData('issuer', e.target.value)} />}</Field>
                    {add.data.asset_type === 'trade_mark' && <Field label="Symbol" error={add.errors.symbol}>{(id) => <Select id={id} options={['™', '®']} value={add.data.symbol} onChange={(e) => add.setData('symbol', e.target.value)} />}</Field>}
                    <Field label="Valid from" required error={add.errors.valid_from}>{(id) => <Input id={id} type="date" value={add.data.valid_from} onChange={(e) => add.setData('valid_from', e.target.value)} />}</Field>
                    <Field label="Valid to" error={add.errors.valid_to}>{(id) => <Input id={id} type="date" value={add.data.valid_to} onChange={(e) => add.setData('valid_to', e.target.value)} />}</Field>
                    <Field label="Owner" required error={add.errors.owner}>{(id) => <Input id={id} value={add.data.owner} onChange={(e) => add.setData('owner', e.target.value)} />}</Field>
                    <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={() => setAdding(null)}>Cancel</Button><Button type="submit" disabled={add.processing}>Add to Register</Button></div>
                </form>
            </Modal>
            <Modal open={!!renewing} onClose={() => setRenewing(null)} title={`Renew ${renewing?.code ?? ''} — ${renewing?.name ?? ''}`}>
                <form onSubmit={submitRenew} className="space-y-4">
                    <Field label="New valid-to date" required error={renew.errors.valid_to}>{(id) => <Input id={id} type="date" value={renew.data.valid_to} onChange={(e) => renew.setData('valid_to', e.target.value)} />}</Field>
                    <Field label="New certificate / registration no. (optional)" error={renew.errors.registration_no}>{(id) => <Input id={id} value={renew.data.registration_no} onChange={(e) => renew.setData('registration_no', e.target.value)} />}</Field>
                    <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setRenewing(null)}>Cancel</Button><Button type="submit" disabled={renew.processing}>Renew</Button></div>
                </form>
            </Modal>
        </AdminShell>
    );
}
Certifications.layout = null;
