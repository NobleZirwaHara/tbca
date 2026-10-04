import { Head, Link, router } from '@inertiajs/react';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { Select } from '@/Components/ui/Form';
import { ProviderShell } from '@/Components/Marketplace/Shells';
import { Card, InfoRows, LineChart, zarCode } from '@/Components/Marketplace/ui';
import type { MkProvider, Option } from '@/types/marketplace';

interface Props {
    provider: MkProvider;
    period: string;
    periodLabel: string;
    periods: Option[];
    totals: { billed: number; fee: number; gross: number; adjustments: number; net: number; vat: number };
    breakdown: { category: string; billed: number; fee: number; earnings: number; vat: number; net: number }[];
    adjustments: { date: string; type: string; description: string | null; amount: number; status: string }[];
    invoices: string[];
    trend: { label: string; value: number }[];
    payout: { reference: string; status: string; date: string | null; method: string; account: string | null } | null;
}

export default function Statement({ provider, period, periodLabel, periods, totals, breakdown, adjustments, invoices, trend, payout }: Props) {
    const sum = (k: 'billed' | 'fee' | 'earnings' | 'vat' | 'net') => breakdown.reduce((a, b) => a + b[k], 0);
    const z = (n: number) => zarCode(n, n % 1 ? 2 : 0);

    return (
        <ProviderShell crumbs={[{ label: 'Provider Dashboard', href: '/marketplace/provider/dashboard' }, { label: 'Earnings & Payout Statement' }]} title="Earnings & Payout Statement" description={`${provider.name} · Statement period ${periodLabel}`}
            actions={<><Button type="button" variant="outline" size="sm" onClick={() => window.print()}><Download className="size-4" aria-hidden="true" /> Download Statement</Button><Button type="button" variant="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" aria-hidden="true" /> Print</Button></>}>
            <Head title="Earnings & Payout Statement" />
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-9">
                    <Card>
                        <div className="flex flex-wrap gap-4">
                            <label className="text-xs font-medium text-ink-500">Statement Period<Select className="mt-1 w-56" value={period} options={periods} onChange={(e) => router.get('/marketplace/provider/statements', { period: e.target.value }, { preserveScroll: true })} /></label>
                            <div className="text-xs text-ink-500">Provider<p className="mt-2 text-sm font-semibold text-ink-900">{provider.name}</p></div>
                            <div className="text-xs text-ink-500">Currency<p className="mt-2 text-sm font-semibold text-ink-900">ZAR</p></div>
                        </div>
                    </Card>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
                        {[['Total Billed (Excl. VAT)', z(totals.billed), 'For this period'], ['Platform Fees', z(totals.fee), '10% of billed'], ['Provider Gross Earnings', z(totals.gross), 'After platform fees'], ['Adjustments', z(totals.adjustments), 'Chargebacks & refunds'], ['Net Payable', z(totals.net), 'Before payout'], ['Payout Status', payout ? payout.status.replace('_', ' ') : 'Not scheduled', payout?.date ?? '']].map(([k, v, c]) => (
                            <div key={k} className="rounded-[8px] border border-parchment-400 bg-white p-3"><p className="text-xs text-ink-500">{k}</p><p className="mt-1 text-lg font-bold text-ink-900 capitalize">{v}</p><p className="text-[0.6875rem] text-ink-400">{c}</p></div>
                        ))}
                    </div>
                    <Card title="Earnings Breakdown">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px] text-[0.8125rem]">
                                <thead className="bg-parchment-200 text-xs text-ink-600"><tr>{['Service Category', 'Billed Amount (Excl. VAT)', 'Platform Fee (10%)', 'Your Earnings', 'VAT (15%)', 'Net After VAT'].map((h) => <th key={h} scope="col" className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {breakdown.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-ink-400">No billing in this period.</td></tr>}
                                    {breakdown.map((b) => <tr key={b.category}><td className="px-3 py-2">{b.category}</td><td className="px-3 py-2">{z(b.billed)}</td><td className="px-3 py-2">{z(b.fee)}</td><td className="px-3 py-2">{z(b.earnings)}</td><td className="px-3 py-2">{z(b.vat)}</td><td className="px-3 py-2">{z(b.net)}</td></tr>)}
                                    {breakdown.length > 0 && <tr className="bg-parchment-100 font-bold"><td className="px-3 py-2">Total</td><td className="px-3 py-2">{z(sum('billed'))}</td><td className="px-3 py-2">{z(sum('fee'))}</td><td className="px-3 py-2">{z(sum('earnings'))}</td><td className="px-3 py-2">{z(sum('vat'))}</td><td className="px-3 py-2">{z(sum('net'))}</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                    <div className="grid gap-5 lg:grid-cols-2">
                        <Card title="Adjustments & Deductions">
                            <table className="w-full text-xs">
                                <thead className="text-ink-500"><tr>{['Date', 'Type', 'Description', 'Amount', 'Status'].map((h) => <th key={h} scope="col" className="pb-2 text-left font-medium">{h}</th>)}</tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {adjustments.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-ink-400">No adjustments.</td></tr>}
                                    {adjustments.map((a, i) => <tr key={i}><td className="py-2">{a.date}</td><td className="py-2">{a.type}</td><td className="py-2">{a.description}</td><td className="py-2 text-risk-600">{z(a.amount)}</td><td className="py-2"><StatusPill status={a.status} /></td></tr>)}
                                    <tr className="font-bold"><td className="py-2" colSpan={3}>Total Adjustments</td><td className="py-2">{z(totals.adjustments)}</td><td /></tr>
                                </tbody>
                            </table>
                        </Card>
                        <Card title="Invoice Summary">
                            <InfoRows dense rows={[['Total Invoices', invoices.join(', ') || '—'], ['Invoice Total (Excl. VAT)', z(totals.billed)], ['Total VAT (15%)', z(totals.billed * 0.15)], ['Total Invoiced (Incl. VAT)', z(totals.billed * 1.15)], ['Outstanding Amount', 'ZAR 0']]} />
                        </Card>
                    </div>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Payout Summary">
                        <InfoRows dense rows={[['Net Payable (Excl. VAT)', z(totals.net)], ['VAT (15%)', z(totals.vat)], ['Total Payout Amount', <span key="t" className="font-bold text-verified-700">{z(totals.net + totals.vat)}</span>], ['Payout Method', payout?.method ?? 'Bank Transfer'], ['Bank Details', payout?.account ?? provider.profile.bank ?? '—'], ['Scheduled Payout Date', payout?.date ?? '—'], ['Reference', payout?.reference ?? '—']]} />
                    </Card>
                    <Card title="Earnings Trend (Last 6 Months)"><LineChart points={trend} format={(n) => zarCode(n)} /></Card>
                    <Card title="Quick Actions">
                        <ul className="space-y-2 text-sm"><li><button type="button" onClick={() => window.print()}>Download Detailed Statement</button></li><li><Link href="/marketplace/provider/dashboard">View Payout History</Link></li><li><Link href="/marketplace/provider/grievances/new?mode=grievance">Raise a Query / Dispute</Link></li></ul>
                    </Card>
                </aside>
            </div>
        </ProviderShell>
    );
}

Statement.layout = null;
