import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Building2, CreditCard } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { StatusPill, Tabs } from '@/Components/ui/Kit';
import { ServicesPortal } from '@/Components/Advisory/shells';
import { zarCents } from '@/Components/Advisory/ui';
import type { VehicleRow } from '@/types/advisory';

interface Fee { code: string; desc: string; type: string; basis: string; qty: number; unit: number; status: string; amount: number | null; vat: number }
interface Props { vehicle: VehicleRow; fees: Fee[]; totals: { subtotal: number; vat: number; discounts: number; total: number }; pendingOrder: string | null }

const TABS: [string, string][] = [['all', 'All Fees'], ['Subscription', 'Subscription Fees'], ['Usage', 'Usage Fees'], ['One-off', 'One-off Fees'], ['Disbursement', 'Disbursements'], ['Adjustment', 'Adjustments']];
const tone: Record<string, string> = { Subscription: 'bg-verified-50 text-verified-700', Usage: 'bg-controlled-50 text-controlled-700', 'One-off': 'bg-referenced-50 text-referenced-700', Disbursement: 'bg-attested-50 text-attested-700', Adjustment: 'bg-parchment-300 text-ink-700', Tax: 'bg-parchment-300 text-ink-700' };

export default function FeePanel({ vehicle, fees, totals, pendingOrder }: Props) {
    const [tab, setTab] = useState('all');
    const [inactive, setInactive] = useState(true);
    const taxVat = fees.reduce((s, f) => s + (f.type === 'Tax' ? 0 : f.status === 'Paid' ? 0 : f.vat), 0);
    const rows = fees.filter((f) => (tab === 'all' || f.type === tab) && (inactive || f.status !== 'Paid'));
    return (
        <ServicesPortal title="Vehicle Fee Panel" description="Detailed fee breakdown, applicable charges, and payment summary for this vehicle.">
            <Head title="Vehicle Fee Panel" />
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-9">
                    <section className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                        <div>
                            <p className="font-mono text-xs text-ink-500">{vehicle.engagement}</p>
                            <p className="font-semibold">{vehicle.name} <StatusPill status={vehicle.status} /></p>
                            <p className="text-xs text-ink-500">{vehicle.type} Vehicle · {vehicle.code}</p>
                        </div>
                        <dl className="grid grid-cols-3 gap-6 text-xs">
                            <div><dt className="text-ink-500">Start Date</dt><dd className="font-semibold">{vehicle.start}</dd></div>
                            <div><dt className="text-ink-500">Next Due Date</dt><dd className="font-semibold">{vehicle.next_due ?? '—'}</dd></div>
                            <div><dt className="text-ink-500">Billing Cycle</dt><dd className="font-semibold">{vehicle.billing ?? '—'}</dd></div>
                        </dl>
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                            <h2 className="text-sm font-semibold">Fee Breakdown</h2>
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={inactive} onChange={(e) => setInactive(e.target.checked)} className="accent-gold-600" />Show paid / inactive fees</label>
                        </div>
                        <Tabs tabs={TABS.map(([k, l]) => ({ key: k, label: l, count: k === 'all' ? fees.length : fees.filter((f) => f.type === k).length }))} value={tab} onChange={setTab} />
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-[0.8125rem]">
                                <thead className="bg-parchment-200 text-xs text-ink-600"><tr>{['Fee Code', 'Fee Description', 'Type', 'Billing Basis', 'Qty / Period', 'Unit Price (ZAR)', 'Amount (ZAR)', 'VAT', 'Status'].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {rows.map((f) => (
                                        <tr key={f.code}>
                                            <td className="px-2 py-2 font-mono text-xs">{f.code}</td>
                                            <td className="px-2 py-2">{f.desc}</td>
                                            <td className="px-2 py-2"><span className={`rounded px-1.5 text-xs ${tone[f.type]}`}>{f.type}</span></td>
                                            <td className="px-2 py-2 text-xs">{f.basis}</td>
                                            <td className="px-2 py-2 text-right">{f.type === 'Tax' ? '—' : f.qty}</td>
                                            <td className="px-2 py-2 text-right">{f.type === 'Tax' ? '—' : f.unit.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-2 py-2 text-right">{f.type === 'Tax' ? taxVat.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) : f.amount?.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-2 py-2 text-right">{f.type === 'Tax' ? taxVat.toLocaleString('en-ZA', { minimumFractionDigits: 2 }) : f.vat.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-2 py-2"><StatusPill status={f.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="mt-2 text-xs text-ink-500">Showing {rows.length} of {fees.length} fees. Disbursements are pass-through at cost (no VAT, no markup).</p>
                        {fees.length === 0 && <p className="py-4 text-sm text-ink-500">No fee schedule has been published for this vehicle yet.</p>}
                    </section>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-sm">
                        <h2 className="font-semibold">Fee Summary</h2>
                        <dl className="mt-2 space-y-1.5">
                            <div className="flex justify-between"><dt>Subtotal (Excl. VAT)</dt><dd>{zarCents(totals.subtotal)}</dd></div>
                            <div className="flex justify-between"><dt>VAT (15%)</dt><dd>{zarCents(totals.vat)}</dd></div>
                            <div className="flex justify-between"><dt>Discounts (incl. VAT)</dt><dd className="text-risk-700">{zarCents(totals.discounts)}</dd></div>
                            <div className="flex justify-between border-t border-parchment-300 pt-2 text-base font-bold"><dt>Total Due</dt><dd>{zarCents(totals.total)}</dd></div>
                            <div className="flex justify-between text-xs"><dt>Next Payment Due</dt><dd className="text-attested-700">{vehicle.next_due ?? '—'}</dd></div>
                        </dl>
                    </section>
                    <section className="space-y-2 rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-semibold">Payment Actions</h2>
                        <Button className="w-full" icon="banknote" disabled={totals.total <= 0} onClick={() => router.post(`/services/vehicles/${vehicle.code}/pay`)}>Make a Payment</Button>
                        {pendingOrder && <p className="text-xs text-attested-700">Payment {pendingOrder} is awaiting completion.</p>}
                        <Button variant="outline" className="w-full" icon="download" onClick={() => window.print()}>Download Invoice (PDF)</Button>
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                        <h2 className="text-sm font-semibold">Payment Methods</h2>
                        <p className="mt-2 flex items-center gap-2"><CreditCard className="size-4" />Card, EFT or wallet at secure checkout</p>
                        <p className="mt-1 flex items-center gap-2"><Building2 className="size-4" />Bank Transfer (EFT) — use the order reference</p>
                    </section>
                </aside>
            </div>
        </ServicesPortal>
    );
}

FeePanel.layout = null;
