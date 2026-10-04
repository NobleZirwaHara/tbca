import { Head, router } from '@inertiajs/react';
import { Landmark, Play } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Marketplace/Shells';
import { Card, Donut, LineChart, Notice, zar } from '@/Components/Marketplace/ui';
import { ActionMenu, KpiRow, QueryTabs, SmallTag, Table, td } from '@/Components/Marketplace/AdminKit';
import type { RegisterNav } from '@/types/marketplace';

interface Payout { id: number; reference: string; provider: string; tier: string | null; engagement: string | null; title: string | null; earnings: number; fee: number; vat: number; amount: number; method: string; account: string | null; status: string; available: string | null; paid: string | null }
interface Props { nav: RegisterNav; payouts: Payout[]; counts: Record<string, number>; totals: Record<string, number>; tab: string }

const URL = '/admin/marketplace/finance';
const acts: Record<string, { key: string; label: string; danger?: boolean }[]> = {
    ready: [{ key: 'pay', label: 'Pay Now' }, { key: 'schedule', label: 'Schedule' }, { key: 'hold', label: 'Place on Hold', danger: true }],
    scheduled: [{ key: 'pay', label: 'Pay Now' }, { key: 'hold', label: 'Place on Hold', danger: true }, { key: 'fail', label: 'Mark Failed', danger: true }],
    in_transit: [{ key: 'pay', label: 'Confirm Paid' }, { key: 'fail', label: 'Mark Failed', danger: true }],
    held: [{ key: 'release', label: 'Release Hold' }],
    failed: [{ key: 'release', label: 'Retry (back to Ready)' }],
};
const FLOAT = [['8 Aug', 1.84], ['9 Aug', 2.05], ['10 Aug', 1.98], ['11 Aug', 2.12], ['12 Aug', 1.95], ['13 Aug', 2.2], ['14 Aug', 2.19]].map(([label, v]) => ({ label: label as string, value: (v as number) * 1e6 }));

export default function Payouts({ nav, payouts, counts, totals, tab }: Props) {
    return (
        <AdminShell nav={nav} crumbs={[{ label: 'Marketplace', href: '/admin/marketplace' }, { label: 'Payouts & Earnings' }, { label: 'Payout and Float Console' }]} title="Payout and Float Console" description="Monitor provider earnings, platform float, payout scheduling and settlement status."
            actions={<Button type="button" disabled={!counts.ready} onClick={() => router.post(`${URL}/run`, {}, { preserveScroll: true })}><Play className="size-4" aria-hidden="true" />Initiate Payout Run</Button>}>
            <Head title="Payout and Float Console" />
            <KpiRow items={[{ label: 'Total Payable (Cleared)', value: zar(totals.payable, 2), caption: 'Ready for payout' }, { label: 'Float Balance (Platform Held)', value: zar(totals.float, 2), caption: 'Available float' }, { label: 'Scheduled', value: zar(totals.scheduled, 2), caption: `${counts.scheduled} payouts` }, { label: 'In Transit', value: zar(totals.transit, 2), caption: `${counts.in_transit} payouts` }, { label: 'Paid', value: zar(totals.paid, 2), tone: 'good', caption: `${counts.paid} payouts` }, { label: 'Failed / Held', value: zar(totals.held, 2), tone: 'bad', caption: `${counts.held + counts.failed} payouts` }]} />
            <div className="mt-5 grid gap-5 xl:grid-cols-12">
                <div className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-9">
                    <QueryTabs url={URL} query={{ tab }} tabs={{ ready: 'Payout Queue', scheduled: 'Scheduled', in_transit: 'In Transit', paid: 'Paid', held: 'Held', failed: 'Failed', all: 'All Payouts' }} counts={counts} />
                    <div className="mt-4">
                        <Table head={['Provider', 'Engagement ID / Title', 'Earnings (Net)', 'Platform Fee', 'VAT', 'Payout Amount', 'Payment Method', 'Payout Status', 'Available From', 'Actions']} empty={payouts.length === 0}>
                            {payouts.map((p) => (
                                <tr key={p.id}>
                                    <td className={td}><span className="font-semibold text-ink-900">{p.provider}</span>{p.tier && <SmallTag>{p.tier} Tier</SmallTag>}</td>
                                    <td className={td}><span className="font-mono text-xs text-controlled-600">{p.engagement}</span><p className="text-xs">{p.title}</p></td>
                                    <td className={td}>{zar(p.earnings, 2)}</td><td className={td}>{zar(p.fee, 2)}</td><td className={td}>{zar(p.vat, 2)}</td><td className={td}><strong>{zar(p.amount, 2)}</strong></td>
                                    <td className={td}><span className="flex items-center gap-1 text-xs"><Landmark className="size-3.5" aria-hidden="true" />{p.method}</span><span className="text-xs text-ink-500">{p.account}</span></td>
                                    <td className={td}><StatusPill status={p.status} /></td><td className={td}>{p.paid ?? p.available}</td>
                                    <td className={td}><ActionMenu url={`${URL}/${p.id}`} actions={acts[p.status] ?? []} /></td>
                                </tr>
                            ))}
                        </Table>
                    </div>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Float Movement (Last 7 Days)"><LineChart points={FLOAT} format={(n) => zar(n)} /></Card>
                    <Card title="Payout Status Mix"><Donut items={['ready', 'scheduled', 'in_transit', 'paid', 'held', 'failed'].map((s) => ({ label: s.replace('_', ' '), value: counts[s] ?? 0 }))} total={counts.all} label="Payout status mix" /></Card>
                    <Card title="Upcoming Payout Runs"><ul className="space-y-1.5 text-xs"><li className="flex justify-between"><span>Standard Run – daily 09:00</span><span>{counts.ready} ready</span></li><li className="flex justify-between"><span>Weekly Run – Friday 09:00</span><span>{counts.scheduled} scheduled</span></li></ul></Card>
                </aside>
            </div>
            <Notice tone="info" className="mt-5">Payouts are processed in accordance with marketplace SLAs and provider verification status. All payouts are subject to QA clearance and dispute windows; disputed engagements cannot be released.</Notice>
        </AdminShell>
    );
}

Payouts.layout = null;
