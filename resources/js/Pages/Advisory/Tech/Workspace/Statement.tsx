import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { Input, Select } from '@/Components/ui/Form';
import { StatusPill } from '@/Components/ui/Kit';
import { TechPortal } from '@/Components/Advisory/shells';
import { Card, KV, Stat, zar } from '@/Components/Advisory/ui';
import type { TechHeader } from '@/types/advisory';

interface Row { date: string; type: string; ref: string; desc: string; excl: number; vat: number; incl: number; status: string; balance: number }
interface St { rows: Row[]; invoiced: number; paid: number; balance: number; aging: Record<string, number>; overdue: number }

export default function Statement({ engagement: e, statement: s, filters, contract, contract_excl }: { engagement: TechHeader; statement: St; filters: Record<string, string>; contract: number; contract_excl: number }) {
    const go = (patch: Record<string, string>) => router.get(`/technology-solutions/workspace/${e.reference}/statement`, { ...filters, ...patch }, { preserveScroll: true, preserveState: true });
    return (
        <TechPortal e={e} title="Statement of Account" description="View all transactions, payments, invoices and balances for your engagement.">
            <Head title="Statement of Account" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Stat label="Contract Value — Ledger T (Incl. VAT)" value={zar(contract)} sub={`Excl. VAT ${zar(contract_excl)}`} />
                <Stat label="Total Invoiced (Incl. VAT)" value={zar(s.invoiced)} />
                <Stat label="Total Paid (Incl. VAT)" value={zar(s.paid)} tone="good" />
                <Stat label="Outstanding Balance" value={zar(s.balance)} tone="warn" />
                <Stat label="Overdue Amount" value={zar(s.overdue)} tone={s.overdue ? 'bad' : 'good'} />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-9">
                    <div className="mb-3 flex flex-wrap items-end gap-2">
                        <label className="text-xs">From<Input type="date" value={filters.from ?? ''} onChange={(x) => go({ from: x.target.value })} className="mt-1 w-40" /></label>
                        <label className="text-xs">To<Input type="date" value={filters.to ?? ''} onChange={(x) => go({ to: x.target.value })} className="mt-1 w-40" /></label>
                        <Select aria-label="Type" value={filters.type ?? ''} onChange={(x) => go({ type: x.target.value })} placeholder="All Types" options={['Invoice', 'Payment', 'Adjustment', 'Credit']} className="w-36" />
                        <Select aria-label="Status" value={filters.status ?? ''} onChange={(x) => go({ status: x.target.value })} placeholder="All Statuses" options={['Paid', 'Partially Paid', 'Open', 'Overdue', 'Applied']} className="w-36" />
                        <Button size="sm" variant="ghost" onClick={() => router.get(`/technology-solutions/workspace/${e.reference}/statement`)}>Clear Filters</Button>
                        <Button size="sm" variant="outline" icon="download" onClick={() => window.print()} className="ml-auto">Download Statement (PDF)</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-xs">
                            <thead className="bg-parchment-200 text-ink-600"><tr>{['Date', 'Type', 'Reference', 'Description', 'Amount (Excl. VAT)', 'VAT', 'Amount (Incl. VAT)', 'Status', 'Balance'].map((h) => <th key={h} className="px-2 py-2 text-left">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-parchment-300">{s.rows.map((r, i) => <tr key={i}><td className="px-2 py-1.5">{r.date}</td><td className="px-2">{r.type}</td><td className="px-2 font-mono">{r.ref}</td><td className="px-2">{r.desc}</td><td className="px-2 text-right">{zar(r.excl)}</td><td className="px-2 text-right">{zar(r.vat)}</td><td className="px-2 text-right">{zar(r.incl)}</td><td className="px-2"><StatusPill status={r.status} /></td><td className="px-2 text-right font-semibold">{zar(r.balance)}</td></tr>)}</tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-xs text-ink-500">Showing {s.rows.length} transactions. VAT = 15% of the excl. amount; balance is a running total. Ledger X pass-through costs are invoiced by suppliers and are not on this statement.</p>
                </section>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Account Summary"><KV rows={[['Opening Balance', 'R0'], ['Total Invoiced', zar(s.invoiced)], ['Total Paid', `-${zar(s.paid)}`], ['Closing Balance', <b>{zar(s.balance)}</b>]]} /></Card>
                    <Card title="Aging Summary (Incl. VAT)"><KV rows={[['Current (0–30 days)', zar(s.aging['0-30'])], ['31–60 days', zar(s.aging['31-60'])], ['61–90 days', zar(s.aging['61-90'])], ['90+ days', <span className={s.aging['90+'] ? 'text-risk-700' : ''}>{zar(s.aging['90+'])}</span>]]} /></Card>
                    <Card title="Quick Actions"><ul className="space-y-1 text-xs"><li><Link href={`/technology-solutions/workspace/${e.reference}/support`} className="underline">Request Payment Plan</Link></li><li><Link href={`/technology-solutions/workspace/${e.reference}/support`} className="underline">Raise Billing Query</Link></li><li><Link href={`/technology-solutions/workspace/${e.reference}/payments`} className="underline">View Invoice History</Link></li></ul><p className="mt-2 text-[0.6875rem] text-ink-500">Payment terms: 30 days from invoice date.</p></Card>
                </aside>
            </div>
        </TechPortal>
    );
}

Statement.layout = null;
