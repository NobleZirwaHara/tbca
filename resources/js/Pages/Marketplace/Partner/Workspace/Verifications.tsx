import { Head, router } from '@inertiajs/react';
import { CircleAlert, CircleCheck, Clock, Info, PauseCircle, RefreshCw, TriangleAlert } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { PartnerShell } from '@/Components/Marketplace/Shells';
import { Card, CodeChip, Donut } from '@/Components/Marketplace/ui';
import type { MkProvider } from '@/types/marketplace';

interface Watch { name: string; profession: string; registration: string; jurisdiction: string; valid_until?: string; next_check: string; days_left: number | null; status: string }
interface Props { partner: MkProvider; watchlist: Watch[]; summary: Record<string, number>; events: [string, string, string, string][]; expiry: Record<string, string | number>[] }

const tone = (s: string) => (s.startsWith('Current') ? 'good' : s.startsWith('Expiring') ? 'warn' : s === 'Expired' ? 'bad' : s === 'Pending' ? 'info' : 'neutral');
const action = (s: string) => ({ 'Expiring Soon': 'Upload Update', Expired: 'Update Immediately', Suspended: 'Contact Support', Pending: 'Provide Documents' } as Record<string, string>)[s] ?? '—';
const evIcon = { good: CircleCheck, warn: Clock, bad: CircleAlert, neutral: PauseCircle, info: Info } as Record<string, typeof Info>;

export default function Verifications({ watchlist, summary, events, expiry }: Props) {
    const total = Object.values(summary).reduce((a, b) => a + b, 0);
    const upcoming = watchlist.filter((w) => w.days_left !== null && w.days_left >= 0 && w.days_left <= 30);

    return (
        <PartnerShell crumbs={[{ label: 'Partner Dashboard', href: '/partner-services/workspace' }, { label: 'Re-verification & Lapse Warning' }]} title={<span className="flex items-center gap-3">Re-verification &amp; Lapse Warning <CodeChip code="PS-024" /></span>}
            description="Monitor verification freshness, expiries and suspension events. Maintain a current standing to remain eligible for new opportunities." actions={<Button type="button" variant="outline" size="sm" onClick={() => router.reload()}><RefreshCw className="size-4" aria-hidden="true" />Refresh</Button>}>
            <Head title="Re-verification & Lapse Warning" />
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-8">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                        {[[CircleCheck, 'Current & Valid', summary.current, 'text-verified-500'], [Clock, 'Expiring Soon', summary.expiring, 'text-attested-500'], [TriangleAlert, 'Expired', summary.expired, 'text-risk-500'], [PauseCircle, 'Suspended / On Hold', summary.suspended, 'text-ink-400'], [RefreshCw, 'Pending Re-verification', summary.pending, 'text-controlled-500']].map(([I, k, v, c]) => {
                            const Ic = I as typeof Clock;
                            return <div key={k as string} className="rounded-[8px] border border-parchment-400 bg-white p-4"><Ic className={`size-7 ${c}`} aria-hidden="true" /><p className="mt-1 text-xs text-ink-500">{k as string}</p><p className="text-2xl font-bold">{v as number}</p><p className="text-[0.6875rem] text-ink-400">({total ? (((v as number) / total) * 100).toFixed(1) : 0}%)</p></div>;
                        })}
                    </div>
                    <Card title="Verification Watchlist">
                        <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-xs">
                            <thead className="text-ink-500"><tr>{['Practitioner', 'Profession', 'Registration / Body', 'Jurisdiction', 'Status', 'Valid Until', 'Next Check Due', 'Days Left', 'Action Required'].map((h) => <th key={h} scope="col" className="pb-2 text-left font-medium">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-parchment-300">{watchlist.map((w) => <tr key={w.name}><td className="py-2 font-medium">{w.name}</td><td>{w.profession}</td><td>{w.registration}</td><td>{w.jurisdiction}</td><td><StatusPill status={w.status} tone={tone(w.status)} /></td><td>{w.valid_until ?? '—'}</td><td>{w.next_check}</td><td className={w.days_left !== null && w.days_left < 0 ? 'font-bold text-risk-600' : ''}>{w.days_left ?? '—'}</td><td>{action(w.status) !== '—' ? <button type="button" onClick={() => openAskQuestion({ subject: `Verification update: ${w.name}`, section: 'partner-services' })} className="rounded border border-controlled-500 px-1.5 text-controlled-700">{action(w.status)}</button> : '—'}</td></tr>)}</tbody>
                        </table></div>
                        <p className="mt-2 flex items-center gap-1 text-[0.6875rem] text-ink-400"><Info className="size-3.5" aria-hidden="true" />Days Left = Days until Valid Until date. Negative values indicate expired.</p>
                    </Card>
                    <div className="grid gap-5 md:grid-cols-2">
                        <Card title="Upcoming Re-verifications (Next 30 Days)">
                            <ul className="space-y-2 text-sm">{upcoming.length === 0 && <li className="text-ink-400">None in the next 30 days.</li>}{upcoming.map((w) => <li key={w.name} className="flex items-center justify-between gap-2"><span><span className="block font-semibold">{w.registration.split('/')[0]} Verification</span><span className="text-xs text-ink-500">{w.name}</span></span><StatusPill status={`Due in ${w.days_left} days`} tone="warn" /></li>)}
                                {expiry.map((e) => <li key={String(e.reference)} className="flex items-center justify-between gap-2 text-xs"><span>{String(e.item)} · {String(e.reference)}</span><StatusPill status={String(e.status).replace('_', ' ')} /></li>)}</ul>
                        </Card>
                        <Card title="Recent Verification Events">
                            <ul className="space-y-2.5 text-sm">{events.map(([t, s, at, k]) => { const I = evIcon[k] ?? Info; return <li key={t + at} className="flex gap-2"><I className="size-4 shrink-0 text-ink-500" aria-hidden="true" /><span className="flex-1"><span className="block font-semibold">{t}</span><span className="text-xs text-ink-500">{s}</span></span><span className="text-xs text-ink-400">{at}</span></li>; })}</ul>
                        </Card>
                    </div>
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="Verification Overview"><Donut items={[{ label: 'Current & Valid', value: summary.current }, { label: 'Expiring Soon', value: summary.expiring }, { label: 'Expired', value: summary.expired }, { label: 'Suspended / On Hold', value: summary.suspended }, { label: 'Pending Re-verification', value: summary.pending }]} total={total} label="Verification overview" /></Card>
                    <Card title="Important Reminders"><ul className="space-y-2 text-sm text-ink-700"><li>Keep all registrations, practising certificates and indemnity insurance current.</li><li>Upload updated documents at least 30 days before expiry.</li><li className="text-risk-700">Lapsed or suspended standing will remove you from routing and new opportunities.</li><li>Event-driven re-verification may be triggered by regulatory or status changes.</li></ul></Card>
                    <Card title="Need assistance?"><p className="text-sm text-ink-600">Our Partner Support team can guide you through re-verification.</p><Button type="button" variant="outline" className="mt-3 w-full" onClick={() => openAskQuestion({ subject: 'Partner re-verification', section: 'partner-services' })}>Contact Partner Support</Button></Card>
                </aside>
            </div>
        </PartnerShell>
    );
}

Verifications.layout = null;
