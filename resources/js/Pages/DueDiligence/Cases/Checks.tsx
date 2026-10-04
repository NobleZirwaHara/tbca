import type { ReactElement } from 'react';
import { CheckCircle2, Circle, Clock, FileStack, Hourglass, Lightbulb, Lock, PauseCircle, RefreshCcw, UserCheck } from 'lucide-react';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { Card, Donut, rand, shortDate } from '@/Components/DueDiligence/Ui';
import { Progress } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { DdCasePageProps, DdEvent } from '@/types/due-diligence';

interface CheckRow { id: number; category: string; detail: string | null; vendor: string; vendor_detail: string | null; status: string; total: number; done: number; hold_reason: string | null; external_approved_zar: number; external_used_zar: number; updatedAt: string }
interface Props extends DdCasePageProps {
    checks: CheckRow[];
    feed: DdEvent[];
    coverage: { documents: number; subjects: number; jurisdictions: number };
}

const STATUS: Record<string, [string, string, ReactElement]> = {
    complete: ['Complete', 'bg-verified-50 text-verified-700', <CheckCircle2 key="c" className="size-3.5" />],
    in_progress: ['In Progress', 'bg-attested-50 text-attested-700', <Hourglass key="c" className="size-3.5" />],
    pending: ['Pending', 'bg-parchment-200 text-ink-600', <Clock key="c" className="size-3.5" />],
    on_hold: ['On Hold', 'bg-controlled-50 text-controlled-700', <PauseCircle key="c" className="size-3.5" />],
    not_started: ['Not Started', 'bg-parchment-200 text-ink-500', <Circle key="c" className="size-3.5" />],
};

/** DD-037 Checks and Vendor Status. Raw vendor output is never shown to the client. */
export default function Checks(props: Props) {
    const { case: c, checks, feed, coverage } = props;
    const count = (s: string) => checks.filter((x) => x.status === s).length;
    const pct = checks.length ? Math.round((checks.reduce((s, x) => s + x.done / Math.max(1, x.total), 0) / checks.length) * 100) : 0;
    const approved = checks.reduce((s, x) => s + x.external_approved_zar, 0);
    const used = checks.reduce((s, x) => s + x.external_used_zar, 0);
    const locked = ['consent_pending', 'intake_open'].includes(c.status);

    return (
        <CaseLayout
            page={props}
            active="checks"
            title="Checks and Vendor Status"
            subtitle="Track the progress of all due diligence checks and vendor activities."
            description="All results are restricted to authorised reviewers. Raw vendor output is not displayed."
            roleNote="Monitor check progress and respond to actions."
            bandNote="No additional fee for monitoring check progress."
            aside={
                <>
                    <Card title="Overall progress">
                        <Donut size={110} center={<span><span className="block text-lg font-bold">{pct}%</span><span className="text-[0.625rem] text-ink-500">Complete</span></span>} segments={[{ label: 'Complete', value: count('complete'), color: '#2f9e44' }, { label: 'In Progress', value: count('in_progress'), color: '#d6a32e' }, { label: 'Pending', value: count('pending'), color: '#4c6ef5' }, { label: 'On Hold', value: count('on_hold'), color: '#748ffc' }, { label: 'Not Started', value: count('not_started'), color: '#c9c2b4' }]} />
                    </Card>
                    <Card title="Evidence coverage">
                        <div className="grid grid-cols-3 gap-2 text-center">{[['Documents', coverage.documents], ['Subjects', coverage.subjects], ['Jurisdictions', coverage.jurisdictions]].map(([k, v]) => <div key={k} className="rounded border border-parchment-400 p-2"><p className="text-[0.625rem] text-ink-500">{k}</p><p className="text-base font-bold">{v}%</p></div>)}</div>
                    </Card>
                    <Card title="External costs (approved / used)">
                        <table className="w-full text-xs"><tbody>
                            {checks.filter((x) => x.external_approved_zar > 0).map((x) => <tr key={x.id}><td className="py-0.5">{x.category}</td><td className="text-right">{rand(x.external_approved_zar)}</td><td className="text-right">{rand(x.external_used_zar)}</td></tr>)}
                            <tr className="border-t border-parchment-300 font-bold"><td className="py-1">Total (ex VAT)</td><td className="text-right">{rand(approved)}</td><td className="text-right">{rand(used)}</td></tr>
                        </tbody></table>
                        <p className="mt-1 text-[0.6875rem] text-ink-500">No hidden reruns: costs above your approved tolerance need your re-approval.</p>
                    </Card>
                </>
            }
        >
            {locked && <p className="flex gap-2 rounded-[8px] border border-attested-500/30 bg-attested-50 p-3 text-xs"><Lock className="size-4 text-attested-600" aria-hidden="true" />Checks are locked until consent and intake are complete (G3/G6). No vendor run happens before then.</p>}
            <div className="grid gap-5 xl:grid-cols-12">
                <Card title="Check categories" className="xl:col-span-8">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-left text-xs">
                            <thead className="text-ink-500"><tr><th className="py-1">Check Category</th><th>Source / Vendor</th><th>Status</th><th>Coverage</th><th className="w-28">Progress</th><th>Last Updated</th></tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {checks.map((x) => {
                                    const [label, cls, icon] = STATUS[x.status] ?? STATUS.pending;
                                    const p = Math.round((x.done / Math.max(1, x.total)) * 100);
                                    return (
                                        <tr key={x.id}>
                                            <td className="py-2"><span className="font-semibold">{x.category}</span><br /><span className="text-ink-500">{x.detail}</span></td>
                                            <td>{x.vendor}<br /><span className="text-ink-500">{x.vendor_detail}</span></td>
                                            <td><span className={cn('inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-semibold', cls)}>{icon}{label}</span>{x.hold_reason && <span className="block text-[0.625rem] text-controlled-700">{x.hold_reason}</span>}</td>
                                            <td>{p}%<br /><span className="text-ink-500">{x.done} of {x.total}</span></td>
                                            <td><Progress value={p} tone={x.status === 'complete' ? 'good' : 'gold'} /></td>
                                            <td>{x.status === 'not_started' ? '—' : shortDate(x.updatedAt, true)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
                <Card title="Vendor activity feed" className="xl:col-span-4">
                    {feed.length === 0 ? <p className="text-xs text-ink-500">No vendor activity yet.</p> : (
                        <ol className="space-y-3">{feed.map((e) => <li key={e.code} className="flex gap-2 text-xs"><RefreshCcw className="size-4 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block text-ink-900">{e.description}</strong><span className="text-ink-500">{e.actor} · {shortDate(e.at, true)}</span></span></li>)}</ol>
                    )}
                </Card>
            </div>
            <div className="grid gap-3 rounded-[10px] border border-parchment-400 bg-white p-4 text-xs md:grid-cols-3">
                <p className="flex gap-2"><Lightbulb className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block">What this means</strong>Checks are being run with approved vendors. Results are reviewed before inclusion in the report.</span></p>
                <p className="flex gap-2"><UserCheck className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block">No hidden reruns</strong>Reruns only occur with your approval and within the approved plan.</span></p>
                <p className="flex gap-2"><FileStack className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block">Results are protected</strong>Raw vendor output is restricted to authorised reviewers only.</span></p>
            </div>
        </CaseLayout>
    );
}
