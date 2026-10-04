import { Link } from '@inertiajs/react';
import { GitBranch } from 'lucide-react';
import AdminShell from '@/Components/Shop/AdminShell';
import { FilterBar, fmtZar, Kpi, KpiGrid } from '@/Components/Shop/AdminKit';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';

interface Row { product: string; slug: string; act: string; state: string | null; code: string; name: string; axis: string; detail: string; zar: number | null }

export default function Variants({ rows, axes, filters }: { rows: Row[]; axes: Record<string, number>; filters: { axis: string | null } }) {
    return (
        <AdminShell title="Variant & SKU Console" description="Every variant axis (SKU, tier, licence, plan, commitment) across all Product Masters.">
            <KpiGrid cols={5}>
                {Object.entries(axes).map(([axis, count]) => (
                    <Kpi key={axis} icon={<GitBranch className="size-5" />} label={axis} value={count} tone="info" />
                ))}
            </KpiGrid>
            <FilterBar path="/admin/shop/variants" filters={filters} search={false} selects={[{ name: 'axis', label: 'Variant axis', options: Object.keys(axes) }]} />
            <SimpleTable
                columns={['Variant Code', 'Variant', 'Axis', 'Detail', 'Price (Excl. VAT)', 'Product Master', 'Act', 'Listing State']}
                rows={rows.map((r) => [
                    <span key="c" className="font-mono text-xs">{r.code}</span>,
                    r.name,
                    r.axis,
                    <span key="d" className="text-xs">{r.detail}</span>,
                    fmtZar(r.zar),
                    <Link key="p" href={`/admin/shop/product-master?product=${r.slug}`} className="hover:text-gold-700">{r.product}</Link>,
                    r.act,
                    <StatusPill key="s" status={r.state ?? '-'} tone={r.state === 'LS-05' || r.state === 'LS-06' ? 'bad' : 'good'} />,
                ])}
            />
        </AdminShell>
    );
}

Variants.layout = null;
