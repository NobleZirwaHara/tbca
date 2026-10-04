import { Head, router } from '@inertiajs/react';
import { Tags } from 'lucide-react';
import { useState } from 'react';
import { Chip } from '@/Components/Aiim/Chips';
import { zar2 } from '@/Components/Aiim/format';
import { ADMIN_NAV } from '@/Components/Aiim/Nav';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { KpiTile, Panel } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';

interface Code { code: string; name: string; description: string | null; category: string; fee_type: string; pricing_model: string; amount_zar: number; rate: number | null; basis: string | null; components: Record<string, number> | null; trigger: string | null; refund_policy: string | null; status: string; effective: string | null }

interface Props { codes: Code[]; categories: string[]; filters: { q: string; category: string } }

export default function Pricing({ codes, categories, filters }: Props) {
    const [sel, setSel] = useState<Code | null>(codes[0] ?? null);
    const [q, setQ] = useState(filters.q);
    const go = (next: Partial<Props['filters']>) => router.get('/admin/aiim/pricing', { ...filters, q, ...next }, { preserveState: true, preserveScroll: true });
    const amount = (c: Code) => (c.rate !== null && c.amount_zar === 0 ? `${c.rate}%` : zar2(c.amount_zar));
    return (
        <ConsoleLayout area="AIIM Admin Area" areaIcon={Tags} groups={ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'AIIM', href: '/admin/aiim' }, { label: 'Pricing Administration' }]} title="Pricing Administration" description="Manage the AIIM pricing catalogue, fee codes, pricing components and commercial rules. All AIIM prices are computed from these codes." badge={<Chip tone="good">Pricing Version v2025.05.12 · Active</Chip>}>
            <Head title="AIIM Pricing Administration" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <KpiTile label="Active Fee Codes" value={codes.filter((c) => c.status === 'active').length} />
                <KpiTile label="Categories" value={categories.length} />
                <KpiTile label="VAT Rate" value="15%" />
                <KpiTile label="External Admin Margin" value="25%" />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <Panel title="Fee Catalogue" action={<div className="flex gap-2"><input aria-label="Search fee codes" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go({ q })} placeholder="Search fee codes…" className="h-8 rounded border border-parchment-500 px-2 text-xs" /><select aria-label="Category" value={filters.category} onChange={(e) => go({ category: e.target.value })} className="h-8 rounded border border-parchment-500 px-2 text-xs"><option value="">All Categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>}>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[52rem] text-xs">
                            <thead className="bg-parchment-200 text-ink-600"><tr>{['Fee Code', 'Fee Name / Description', 'Category', 'Fee Type', 'Pricing Model', 'Amount (ex VAT)', 'VAT', 'Total (incl VAT)', 'Status', 'Effective From'].map((h) => <th key={h} className="px-2 py-2 text-left">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {codes.map((c) => (
                                    <tr key={c.code} onClick={() => setSel(c)} className={cn('cursor-pointer hover:bg-parchment-100', sel?.code === c.code && 'bg-gold-50')}>
                                        <td className="px-2 py-1.5"><Chip tone="purple">{c.code}</Chip></td>
                                        <td className="px-2"><strong className="block">{c.name}</strong><span className="text-ink-500">{c.description}</span></td>
                                        <td className="px-2">{c.category}</td><td className="px-2">{c.fee_type}</td><td className="px-2">{c.pricing_model}</td>
                                        <td className="px-2 text-right">{amount(c)}</td><td className="px-2">15%</td>
                                        <td className="px-2 text-right">{c.rate !== null && c.amount_zar === 0 ? `${((c.rate ?? 0) * 1.15).toFixed(2)}%` : zar2(c.amount_zar * 1.15)}</td>
                                        <td className="px-2"><Chip tone={c.status === 'active' ? 'good' : 'dark'}>{c.status}</Chip></td><td className="px-2">{c.effective}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Panel>
                {sel && (
                    <Panel title="Fee Breakdown Preview" action={<Chip tone="good">{sel.code}</Chip>}>
                        <p className="font-semibold">{sel.name}</p>
                        <p className="text-xs text-ink-500">{sel.fee_type} · {sel.basis ?? sel.pricing_model}</p>
                        <p className="mt-1 text-xl font-bold">{amount(sel)} <span className="text-xs font-normal">ex VAT</span></p>
                        {sel.components && Object.keys(sel.components).length > 0 && <><p className="mt-3 text-xs font-semibold">Pricing Components</p><dl className="space-y-1 text-xs">{Object.entries(sel.components).map(([k, v]) => <div key={k} className="flex justify-between"><dt>{k}</dt><dd>{zar2(v)}</dd></div>)}</dl></>}
                        <dl className="mt-3 space-y-1 border-t border-parchment-300 pt-2 text-xs"><div className="flex justify-between"><dt>Subtotal (ex VAT)</dt><dd>{zar2(sel.amount_zar)}</dd></div><div className="flex justify-between"><dt>VAT (15%)</dt><dd>{zar2(sel.amount_zar * 0.15)}</dd></div><div className="flex justify-between rounded bg-gold-50 px-1 font-bold"><dt>Total (inc VAT)</dt><dd>{zar2(sel.amount_zar * 1.15)}</dd></div></dl>
                        <dl className="mt-3 space-y-1 text-xs">{[['Fee Category', sel.category], ['Fee Trigger', sel.trigger ?? '—'], ['Payer', 'Client'], ['Refund Policy', sel.refund_policy ?? '—']].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right">{v}</dd></div>)}</dl>
                        <p className="mt-3 text-[0.65rem] text-ink-400">Editing fee codes (with pricing version and dual approval) is being connected.</p>
                    </Panel>
                )}
            </div>
        </ConsoleLayout>
    );
}

Pricing.layout = null;
