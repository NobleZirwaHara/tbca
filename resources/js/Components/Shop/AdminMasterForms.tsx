import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';
import type { Option } from '@/types/shop';

export function NewMasterModal({ open, onClose, options }: { open: boolean; onClose: () => void; options: { acts: Option[]; vehicles: string[]; aisles: Option[] } }) {
    const form = useForm({ name: '', act: 'A1', vehicle: 'Services', aisle: options.aisles[0]?.value ?? '', price_zar: '', tagline: '' });
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="New Product Master"
            footer={<Button type="button" size="sm" disabled={form.processing} onClick={() => form.post('/admin/shop/product-master', { onSuccess: onClose })}>Create Draft Master</Button>}
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Canonical name" error={form.errors.name} required className="sm:col-span-2">
                    {(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}
                </Field>
                <Field label="Commercial act" error={form.errors.act} required>
                    {(id) => <Select id={id} options={options.acts} value={form.data.act} onChange={(e) => form.setData('act', e.target.value)} />}
                </Field>
                <Field label="Vehicle" error={form.errors.vehicle} required>
                    {(id) => <Select id={id} options={options.vehicles} value={form.data.vehicle} onChange={(e) => form.setData('vehicle', e.target.value)} />}
                </Field>
                <Field label="Aisle" error={form.errors.aisle} required>
                    {(id) => <Select id={id} options={options.aisles} value={form.data.aisle} onChange={(e) => form.setData('aisle', e.target.value)} />}
                </Field>
                <Field label="Price (ZAR, excl. VAT)" error={form.errors.price_zar}>
                    {(id) => <Input id={id} type="number" min={0} value={form.data.price_zar} onChange={(e) => form.setData('price_zar', e.target.value)} />}
                </Field>
                <Field label="Tagline" error={form.errors.tagline} className="sm:col-span-2">
                    {(id) => <Input id={id} value={form.data.tagline} onChange={(e) => form.setData('tagline', e.target.value)} />}
                </Field>
            </div>
            <p className="mt-3 text-xs text-ink-500">New masters start as drafts with Creation QA pending; the listing gate keeps them out of the shop until every gate passes.</p>
        </Modal>
    );
}

export function EditMasterModal({ open, onClose, product }: { open: boolean; onClose: () => void; product: { slug: string; name: string; tagline: string | null; delivery: string | null; output_format: string | null; status: string } }) {
    const form = useForm({ name: product.name, tagline: product.tagline ?? '', delivery: product.delivery ?? '', output_format: product.output_format ?? '', status: product.status });
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Edit Product Master"
            footer={<Button type="button" size="sm" disabled={form.processing} onClick={() => form.patch(`/admin/shop/product-master/${product.slug}`, { onSuccess: onClose, preserveScroll: true })}>Save Changes</Button>}
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name" error={form.errors.name} required className="sm:col-span-2">
                    {(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}
                </Field>
                <Field label="Tagline" error={form.errors.tagline} className="sm:col-span-2">
                    {(id) => <Input id={id} value={form.data.tagline} onChange={(e) => form.setData('tagline', e.target.value)} />}
                </Field>
                <Field label="Delivery window" error={form.errors.delivery}>
                    {(id) => <Input id={id} value={form.data.delivery} onChange={(e) => form.setData('delivery', e.target.value)} />}
                </Field>
                <Field label="Output format" error={form.errors.output_format}>
                    {(id) => <Input id={id} value={form.data.output_format} onChange={(e) => form.setData('output_format', e.target.value)} />}
                </Field>
                <Field label="Status" error={form.errors.status}>
                    {(id) => <Select id={id} options={['active', 'draft', 'archived']} value={form.data.status} onChange={(e) => form.setData('status', e.target.value)} />}
                </Field>
            </div>
        </Modal>
    );
}

export function NewVariantModal({ open, onClose, slug }: { open: boolean; onClose: () => void; slug: string }) {
    const form = useForm({ name: '', tier: 'Standard', licence: 'L2 Standard', format: 'Online', language: 'English', jurisdiction: 'South Africa', buyer: 'General' });
    const fields: [keyof typeof form.data, string][] = [['name', 'Variant name'], ['tier', 'Tier'], ['licence', 'Licence'], ['format', 'Format'], ['language', 'Language'], ['jurisdiction', 'Jurisdiction'], ['buyer', 'Buyer context']];
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="New Variant"
            footer={<Button type="button" size="sm" disabled={form.processing} onClick={() => form.post(`/admin/shop/product-master/${slug}/variants`, { onSuccess: () => { form.reset(); onClose(); }, preserveScroll: true })}>Create Variant</Button>}
        >
            <div className="grid gap-3 sm:grid-cols-2">
                {fields.map(([k, label]) => (
                    <Field key={k} label={label} error={form.errors[k]} required>
                        {(id) => <Input id={id} value={form.data[k]} onChange={(e) => form.setData(k, e.target.value)} />}
                    </Field>
                ))}
            </div>
        </Modal>
    );
}
