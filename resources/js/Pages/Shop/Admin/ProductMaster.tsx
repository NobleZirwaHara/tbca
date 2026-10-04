import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Archive, Ban, Boxes, Clock, Copy, Download, FileText, GitBranch, Layers, Pencil, Plus, Upload } from 'lucide-react';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, Card, Donut, fmtDate, GateIcon, Kpi, KpiGrid } from '@/Components/Shop/AdminKit';
import { EditMasterModal, NewMasterModal, NewVariantModal } from '@/Components/Shop/AdminMasterForms';
import { Progress, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import type { Option } from '@/types/shop';

interface Governance { owner: string; steward: string; qa: string; scan: string; claims: string; certificate: string; rights: string; split: string; batches: string; first_seen: string | null }
interface MasterProduct {
    slug: string; code: string; name: string; tagline: string | null; summary: string | null; delivery: string | null; output_format: string | null; status: string; version: string;
    vehicle: string; vehicle_code: string; act: string; act_label: string; source_records: number; sprint_code: string | null; aisle: string | null; subcategory: string;
    listing_state: string | null; listing_label: string; updated_at: string | null; created_at: string | null; governance: Governance;
    variants: Record<string, string | number>[]; other_variants: { code: string; name: string; zar: number | null }[];
}
interface Props {
    masters: Option[];
    product: MasterProduct;
    changes: { actor: string; action: string; subject: string; summary: string; version: string | null; created_at: string }[];
    kpis: { masters: number; sources: number; variants: number; skus: number; draft: number; blocked: number };
    utilisation: { active: number; draft: number; archived: number };
    quality: { completeness: number; accuracy: number; consistency: number; timeliness: number };
    options: { acts: Option[]; vehicles: string[]; aisles: Option[] };
}

export default function ProductMaster({ masters, product, changes, kpis, utilisation, quality, options }: Props) {
    const [modal, setModal] = useState<'new' | 'edit' | 'variant' | null>(null);
    const g = product.governance;
    const qualityAvg = Math.round((quality.completeness + quality.accuracy + quality.consistency + quality.timeliness) / 4);

    return (
        <AdminShell
            title="Product Master / Variant Console"
            description="Create, maintain and govern Product Masters, Variants and their relationships."
            actions={
                <>
                    <button type="button" onClick={() => setModal('new')} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-controlled-500 bg-white px-3 text-xs font-semibold text-controlled-700"><Plus className="size-4" /> New Product Master</button>
                    <Link href="/admin/shop/variants" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 text-xs font-semibold"><Upload className="size-4" /> Import / Migrate</Link>
                    <a href="/admin/shop/variants" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 text-xs font-semibold"><Download className="size-4" /> Export</a>
                </>
            }
        >
            <KpiGrid>
                <Kpi icon={<Boxes className="size-5" />} label="Product Masters" value={kpis.masters} caption={`${kpis.sources} Source Records`} tone="good" />
                <Kpi icon={<Layers className="size-5" />} label="Variants" value={kpis.variants} caption={`${(kpis.variants / Math.max(1, kpis.masters)).toFixed(2)} per Master (avg)`} tone="good" />
                <Kpi icon={<GitBranch className="size-5" />} label="SKUs" value={kpis.skus} caption="Active" tone="good" />
                <Kpi icon={<FileText className="size-5" />} label="Unpublished Changes" value={kpis.draft} caption="Draft · Requires Review" tone="info" />
                <Kpi icon={<Ban className="size-5" />} label="Blocked / Non Purchasable" value={kpis.blocked} caption="Missing critical data or gate fail" tone="bad" />
                <Kpi icon={<Clock className="size-5" />} label="Last Data Refresh" value={<span className="text-sm">{fmtDate(product.updated_at, true)}</span>} caption="SAST (UTC+2)" />
            </KpiGrid>

            <label className="block max-w-xl text-xs font-medium text-ink-600">
                Product Master
                <select className="mt-1 block h-10 w-full rounded-[4px] border border-parchment-500 bg-white px-2 text-sm" value={product.slug} onChange={(e) => router.get('/admin/shop/product-master', { product: e.target.value }, { preserveScroll: true })}>
                    {masters.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
            </label>

            <div className="grid gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-9">
                    <Card title="1. Product Master Details">
                        <div className="grid gap-4 lg:grid-cols-3">
                            <div className="space-y-1.5 text-xs">
                                <div className="flex flex-wrap items-center gap-2"><p className="text-base font-semibold text-ink-900">{product.name}</p><StatusPill status={product.status} /></div>
                                <p className="font-mono text-ink-500">{product.code}</p>
                                {[
                                    ['Canonical Slug', product.slug], ['Aisle', product.aisle], ['Sub-Category', product.subcategory], ['Vehicle', `${product.vehicle} (${product.vehicle_code})`],
                                    ['Commercial Act', product.act_label], ['Listing State', `${product.listing_state ?? '-'} ${product.listing_label}`], ['Split Justification', g.split],
                                ].map(([k, v]) => <p key={k}><span className="font-semibold text-ink-800">{k}:</span> {v ?? '-'}</p>)}
                            </div>
                            <div className="space-y-1.5 text-xs">
                                <p className="font-semibold text-ink-900">Description</p>
                                <p className="text-ink-600">{product.tagline ?? product.summary}</p>
                                <p className="pt-2 font-semibold text-ink-900">Source Lineage</p>
                                <p>Source Records: {product.source_records}</p>
                                <p>Primary Sprint Code: {product.sprint_code ?? '-'}</p>
                                <p>Source Batches: {g.batches}</p>
                                <p>First Seen: {fmtDate(g.first_seen)}</p>
                                <p>Last Updated: {fmtDate(product.updated_at, true)}</p>
                            </div>
                            <div className="space-y-1.5 text-xs">
                                <p className="font-semibold text-ink-900">Governance & Status</p>
                                <p>Owner: {g.owner}</p>
                                <p>Steward: {g.steward}</p>
                                {([['Creation QA', g.qa], ['Artefact Scan', g.scan], ['Claim Verification', g.claims], ['Rights Status', g.rights]] as const).map(([k, v]) => (
                                    <p key={k} className="flex items-center gap-2">{k}: <GateIcon state={v} /> {v === 'pass' ? 'Passed' : v}</p>
                                ))}
                                <p>Release Certificate: {g.certificate}</p>
                                <p>ProductVersion: {product.version}</p>
                                <p>Maintenance: Current</p>
                            </div>
                        </div>
                    </Card>

                    <Card title={`2. Product Variants (${product.variants.length + product.other_variants.length})`} action={<button type="button" onClick={() => setModal('variant')} className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-controlled-500 px-2.5 text-xs font-semibold text-controlled-700"><Plus className="size-3.5" /> New Variant</button>}>
                        <SimpleTable
                            columns={['Variant Code', 'Variant Name', 'Tier', 'Licence', 'Format', 'Language', 'Jurisdiction', 'Buyer Context', 'Active SKUs', 'Listing State', 'Status']}
                            rows={product.variants.map((v) => [v.code, v.name, v.tier, v.licence, v.format, v.language, v.jurisdiction, v.buyer, v.skus, <StatusPill key="s" status={String(v.state)} />, <StatusPill key="t" status={String(v.status)} />])}
                            empty="No SKU variants yet - add one."
                        />
                        {product.other_variants.length > 0 && (
                            <div className="mt-3">
                                <p className="mb-1 text-xs font-semibold text-ink-700">Commercial variant axes (tiers / licences / plans)</p>
                                <SimpleTable columns={['Key', 'Name', 'Price (Excl. VAT)']} rows={product.other_variants.map((v) => [v.code, v.name, v.zar !== null ? `ZAR ${v.zar.toLocaleString('en-ZA')}` : '-'])} />
                            </div>
                        )}
                    </Card>

                    <Card title="3. Recent Product Master Changes">
                        <SimpleTable
                            columns={['Changed On', 'Changed By', 'Master / Variant', 'Change Type', 'Summary', 'ProductVersion']}
                            rows={changes.map((c) => [fmtDate(c.created_at, true), c.actor, c.subject, <span key="t" className="capitalize">{c.action}</span>, c.summary, c.version ?? '-'])}
                            empty="No recorded changes."
                        />
                    </Card>
                </div>

                <div className="space-y-4 xl:col-span-3">
                    <Card title="Actions">
                        <div className="flex flex-col items-start gap-2">
                            <button type="button" onClick={() => setModal('edit')} className="inline-flex items-center gap-1.5 text-xs font-semibold text-controlled-700"><Pencil className="size-3.5" /> Edit Product Master</button>
                            <ActionButton href={`/admin/shop/product-master/${product.slug}/duplicate`}><Copy className="size-3.5" /> Duplicate Master</ActionButton>
                            <Link href="/admin/shop/routes" className="text-xs font-semibold text-controlled-700">View Lineage Map</Link>
                            <button type="button" onClick={() => setModal('variant')} className="text-xs font-semibold text-controlled-700">Manage Variants</button>
                            <Link href="/admin/shop/variants" className="text-xs font-semibold text-controlled-700">Manage SKUs</Link>
                            <Link href={`/admin/shop/audit?q=${product.code}`} className="text-xs font-semibold text-controlled-700">Change History</Link>
                            <ActionButton href={`/admin/shop/product-master/${product.slug}/archive`} tone="bad" confirm={product.status === 'archived' ? 'Restore this master?' : 'Archive this master? It will no longer be listed.'}>
                                <Archive className="size-3.5" /> {product.status === 'archived' ? 'Restore Master' : 'Archive Master'}
                            </ActionButton>
                        </div>
                    </Card>
                    <Card title="Quick Links">
                        <ul className="space-y-1.5 text-xs font-semibold text-controlled-700">
                            <li><Link href="/admin/shop/pricing">Pricing & Floor Console</Link></li>
                            <li><Link href="/admin/shop/listing-gate">Vehicle Resolver Details</Link></li>
                            <li><Link href="/admin/shop/licences">Licence & IP Details</Link></li>
                            <li><Link href="/admin/shop/versions">Creation QA Details</Link></li>
                            <li><Link href="/admin/shop/audit">Audit Trail</Link></li>
                        </ul>
                    </Card>
                    <Donut title="Master Utilisation" segments={[{ label: 'Active', value: utilisation.active, color: '#7a4fa3' }, { label: 'Draft', value: utilisation.draft, color: '#2f5fa8' }, { label: 'Archived', value: utilisation.archived, color: '#9a9aa5' }]} caption="Total Masters" />
                    <Card title="Data Quality Score">
                        <p className="text-2xl font-bold text-verified-700">{qualityAvg}%</p>
                        <p className="mb-2 text-xs text-ink-500">{qualityAvg >= 90 ? 'High Quality' : 'Needs attention'}</p>
                        {(['completeness', 'accuracy', 'consistency', 'timeliness'] as const).map((k) => (
                            <div key={k} className="mb-1.5 text-xs">
                                <div className="flex justify-between capitalize"><span>{k}</span><span className="font-semibold">{quality[k]}%</span></div>
                                <Progress value={quality[k]} tone="good" className="h-1.5" />
                            </div>
                        ))}
                    </Card>
                </div>
            </div>

            <NewMasterModal open={modal === 'new'} onClose={() => setModal(null)} options={options} />
            {modal === 'edit' && <EditMasterModal key={product.slug} open onClose={() => setModal(null)} product={product} />}
            <NewVariantModal open={modal === 'variant'} onClose={() => setModal(null)} slug={product.slug} />
        </AdminShell>
    );
}

ProductMaster.layout = null;
