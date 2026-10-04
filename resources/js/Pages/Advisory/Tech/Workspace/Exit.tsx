import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/Button';
import { Input } from '@/Components/ui/Form';
import { StatusPill } from '@/Components/ui/Kit';
import { TechPortal } from '@/Components/Advisory/shells';
import { Card, CheckList, Donut, KV, Notice, Stat, zar } from '@/Components/Advisory/ui';
import type { TechHeader } from '@/types/advisory';

interface Plan { date: string; reason: string; status: string; closed_at: string | null; steps: [string, string, string, string, string][] }
interface Props { engagement: TechHeader; plan: Plan; balance: number; documents: number; readiness: { complete: number; progress: number; pending: number; pct: number }; readonlyUntil: string; subscription: { auto_renew?: boolean; period_end?: string | null } }

export default function Exit({ engagement: e, plan, balance, documents, readiness, readonlyUntil, subscription }: Props) {
    const [date, setDate] = useState(plan.date);
    const act = (data: Record<string, string | number>) => router.post(`/technology-solutions/workspace/${e.reference}/exit`, data, { preserveScroll: true });
    const outstanding = plan.steps.slice(0, 5).filter((s) => s[3] !== 'completed').length;
    return (
        <TechPortal e={e} title="Exit & Handover" description="Plan your exit, export your data, and complete a professional handover.">
            <Head title="Exit & Handover" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Stat label="Data Export Ready" value="Yes" sub="All data available for export" tone="good" />
                <Stat label="Documents for Handover" value={documents} sub="Ready to download" />
                <Stat label="Outstanding Actions" value={outstanding} sub="Require your attention" tone={outstanding ? 'warn' : 'good'} />
                <Stat label="Outstanding Balance" value={zar(balance)} tone={balance > 0 ? 'bad' : 'good'} />
                <Stat label="Handover Status" value={plan.status} />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-8">
                    <Card title="Exit Plan">
                        <table className="w-full text-xs"><thead className="text-ink-500"><tr><th className="text-left">Step</th><th className="text-left">Owner</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody className="divide-y divide-parchment-300">{plan.steps.map(([t, owner, due, status, action], i) => <tr key={t}><td className="py-2">{i + 1}. {t}</td><td>{owner}</td><td className="text-center">{due}</td><td className="text-center"><StatusPill status={status} /></td><td className="text-center">{status === 'completed' ? '—' : i === 5 ? <Button size="sm" variant="outline" className="border-risk-500 text-risk-700" disabled={outstanding > 0 || balance > 0} onClick={() => confirm('Close this engagement? You keep read-only access during the retention window.') && act({ action: 'close' })}>Close</Button> : <Button size="sm" variant="outline" onClick={() => { if (i === 1 || i === 2) window.print(); act({ action: 'step', index: i }); }}>{action}</Button>}</td></tr>)}</tbody></table>
                        <Notice tone="good" className="mt-3">Plan ahead to ensure a smooth transition. You will continue to have read-only access until {readonlyUntil}.</Notice>
                        {balance > 0 && <Notice tone="bad" className="mt-2">Outstanding amounts ({zar(balance)}) must be settled before step 5 and closure.</Notice>}
                    </Card>
                    <Card title="Exit Details">
                        <KV rows={[['Planned Exit Date', <span className="flex items-center gap-2"><label className="sr-only" htmlFor="exit-date">Exit date</label><Input id="exit-date" type="date" value={date} onChange={(x) => setDate(x.target.value)} className="h-8 w-40" /><Button size="sm" variant="outline" onClick={() => act({ action: 'date', date })}>Change</Button></span>], ['Reason for Exit', plan.reason], ['Data Retention (Post Exit)', '90 days'], ['Read-Only Access Until', readonlyUntil], ['Auto-Renewal', subscription.auto_renew ? <span className="flex items-center gap-2">Enabled <Button size="sm" variant="outline" onClick={() => act({ action: 'auto_renew' })}>Disable</Button></span> : 'Disabled'], ['Final Statement Date', plan.date]]} />
                        <p className="mt-3 text-xs font-semibold">What happens after exit?</p>
                        <CheckList items={['Your data will be available for export.', 'You will have read-only access for 90 days.', 'After 90 days, your data will be securely archived.', 'Vendor renewals are stopped unless you approve them.', 'You can re-activate your engagement anytime.']} />
                    </Card>
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="Handover Readiness">
                        <div className="flex items-center gap-3"><Donut size={96} slices={[{ value: readiness.complete, color: '#2f855a' }, { value: readiness.progress, color: '#d6a32e' }, { value: readiness.pending, color: '#ebe0cd' }]} center={`${readiness.pct}%`} sub="Complete" /><KV rows={[['Complete', readiness.complete], ['In Progress', readiness.progress], ['Pending', readiness.pending]]} /></div>
                    </Card>
                    <Card title="Quick Actions"><div className="grid gap-2"><Button size="sm" variant="outline" onClick={() => window.print()}>Export All Data</Button><Button size="sm" variant="outline" onClick={() => router.visit(`/technology-solutions/workspace/${e.reference}/documents`)}>Download All Documents</Button><Button size="sm" variant="outline" onClick={() => router.visit(`/technology-solutions/workspace/${e.reference}/statement`)}>View Final Statement</Button></div></Card>
                    {plan.closed_at && <Notice tone="info">Engagement closed on {plan.closed_at}. Read-only until {readonlyUntil}.</Notice>}
                </aside>
            </div>
        </TechPortal>
    );
}

Exit.layout = null;
