import { router } from '@inertiajs/react';
import { Banknote, Clock, Download, FileText, MessageSquare, RefreshCw } from 'lucide-react';
import { Tabs } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { WorkspaceShell } from '@/Components/Insights/Industries';
import { Box, Chip, Pager, Stat, Status, Table, zar } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';
import type { Paged, WorkspaceBase } from '@/types/insights';

interface Entry { id: number; date: string; time: string; type: string; description: string; detail: string | null; amount: number; status: string; method: string | null }
interface Props extends WorkspaceBase {
    totals: { committed: number; charges: number; payments: number; disbursements: number; outstanding: number; paidPct: number };
    tab: string;
    types: string[];
    perPage: number;
    tabCounts: { all: number; charges: number; payments: number; disbursements: number };
    entries: Paged<Entry>;
    engagements: { reference: string; title: string }[];
}

const TYPES = ['charge', 'payment', 'disbursement', 'refund', 'adjustment'];
const TYPE_TONE: Record<string, string> = { charge: 'bg-controlled-50 text-controlled-700', payment: 'bg-verified-50 text-verified-700', disbursement: 'bg-purple-50 text-purple-700', refund: 'bg-risk-50 text-risk-700', adjustment: 'bg-parchment-200 text-ink-600' };

export default function Ledger(props: Props) {
    const { engagement: e, totals, tab, types, perPage, tabCounts, entries, engagements } = props;
    const root = `/industries/workspace/${e.reference}`;
    const go = (q: Record<string, unknown>) => router.get(`${root}/ledger`, { tab, types, per_page: perPage, ...q } as unknown as Record<string, string>, { preserveScroll: true, preserveState: true });
    const toggle = (t: string) => go({ types: types.includes(t) ? types.filter((x) => x !== t) : [...types, t], page: 1 });

    return (
        <WorkspaceShell
            base={props}
            title="Fee Transparency Ledger"
            badge={<Chip tone="green">AIIM Verified</Chip>}
            description="A real-time record of all fees, payments, commitments, and disbursements for complete transparency."
            actions={<a href={`${root}/ledger-export`} className="flex items-center gap-1.5 rounded border border-gold-500 px-3 py-2 text-xs font-semibold text-gold-800"><Download className="size-4" /> Export Ledger</a>}
            right={
                <>
                    <Box title="Ledger Summary">
                        <dl className="space-y-2 text-xs">
                            <div className="flex justify-between"><dt>Total Charges</dt><dd className="font-semibold">{zar(totals.charges, 2)}</dd></div>
                            <div className="flex justify-between"><dt>Total Payments</dt><dd className="font-semibold text-verified-700">{zar(totals.payments, 2)}</dd></div>
                            <div className="flex justify-between"><dt>Total Disbursements</dt><dd className="font-semibold text-purple-700">{zar(totals.disbursements, 2)}</dd></div>
                            <div className="flex justify-between rounded bg-gold-50 p-1"><dt>Outstanding Balance</dt><dd className="font-bold text-gold-800">{zar(totals.outstanding, 2)}</dd></div>
                        </dl>
                        {totals.outstanding > 0 && <a href={`${root}/split-checkout`} className="mt-3 block rounded border border-gold-500 py-1.5 text-center text-xs font-semibold text-gold-800">Pay outstanding invoice</a>}
                    </Box>
                    <Box title="Engagement Filter">
                        <label className="sr-only" htmlFor="eng">Engagement</label>
                        <select id="eng" value={e.reference} onChange={(ev) => router.get(`/industries/workspace/${ev.target.value}/ledger`)} className="h-9 w-full rounded border border-parchment-500 px-2 text-xs">
                            {engagements.map((x) => <option key={x.reference} value={x.reference}>{x.reference} – {x.title}</option>)}
                        </select>
                    </Box>
                    <Box title="Transaction Types">
                        <ul className="space-y-1.5 text-xs">{TYPES.map((t) => <li key={t}><label className="flex items-center gap-2 capitalize"><input type="checkbox" className="accent-gold-600" checked={types.includes(t)} onChange={() => toggle(t)} />{t}s</label></li>)}</ul>
                        <button type="button" onClick={() => go({ types: TYPES, page: 1 })} className="mt-2 text-xs text-controlled-700 underline">Reset</button>
                    </Box>
                    <Box title="Need Clarification?"><p className="text-xs text-ink-600">Questions about a transaction or our fee structure?</p><button type="button" onClick={() => openAskQuestion({ subject: `Ledger question – ${e.reference}`, section: 'industries' })} className="mt-2 flex items-center gap-1.5 rounded border border-gold-500 px-3 py-1.5 text-xs font-semibold text-gold-800"><MessageSquare className="size-4" /> Ask a Question</button></Box>
                </>
            }
        >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Stat label="Total Committed" value={zar(totals.committed, 2)} caption="Across this engagement" icon={<FileText className="size-5" />} />
                <Stat label="Total Paid" value={zar(totals.payments, 2)} caption={`${totals.paidPct}% of committed`} icon={<Banknote className="size-5" />} tone="green" />
                <Stat label="Outstanding" value={zar(totals.outstanding, 2)} caption={`${(100 - totals.paidPct).toFixed(1)}% remaining`} icon={<Clock className="size-5" />} tone="gold" />
                <Stat label="Total Disbursed" value={zar(totals.disbursements, 2)} caption="On behalf of client" icon={<RefreshCw className="size-5" />} />
            </div>
            <Tabs tabs={[{ key: 'all', label: 'All Transactions', count: tabCounts.all }, { key: 'charges', label: 'Charges', count: tabCounts.charges }, { key: 'payments', label: 'Payments', count: tabCounts.payments }, { key: 'disbursements', label: 'Disbursements', count: tabCounts.disbursements }]} value={tab} onChange={(t) => go({ tab: t, page: 1 })} />
            <Table
                head={['Date', 'Type', 'Description', 'Engagement / Reference', 'Amount (ZAR)', 'Status', 'Payment Method']}
                rows={entries.data.map((r) => [
                    <span key="a">{r.date}<span className="block text-xs text-ink-400">{r.time}</span></span>,
                    <span key="b" className={cn('rounded px-1.5 py-0.5 text-[0.625rem] font-bold uppercase', TYPE_TONE[r.type])}>{r.type}</span>,
                    <span key="c"><strong className="block">{r.description}</strong><span className="text-xs text-ink-500">{r.detail}</span></span>,
                    <span key="d" className="text-xs">{e.reference}<span className="block text-ink-400">{e.country} – {e.subIndustry}</span></span>,
                    <span key="e" className={cn('font-semibold', r.type === 'payment' && 'text-verified-700')}>{zar(r.amount, 2)}</span>,
                    <Status key="f" value={r.status} />,
                    <span key="g" className="text-xs">{r.method ?? '—'}</span>,
                ])}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500">
                <span>Showing {entries.from ?? 0} to {entries.to ?? 0} of {entries.total} transactions</span>
                <Pager page={entries.currentPage} lastPage={entries.lastPage} query={{ tab, types, per_page: perPage }} />
                <label className="flex items-center gap-1">Per page
                    <select value={perPage} onChange={(ev) => go({ per_page: Number(ev.target.value), page: 1 })} className="h-8 rounded border border-parchment-500 px-1">{[5, 10, 25].map((n) => <option key={n} value={n}>{n}</option>)}</select>
                </label>
            </div>
            <p className="rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-3 text-xs text-controlled-700"><strong>Full Transparency.</strong> Every charge, payment, and disbursement is recorded and auditable. No hidden fees. No surprises. Estimated add-ons (Ledger P / X / S) appear as adjustments until confirmed.</p>
        </WorkspaceShell>
    );
}
