import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Button } from '@/Components/ui/Button';
import { Textarea } from '@/Components/ui/Form';
import { Progress, SimpleTable } from '@/Components/ui/Kit';
import { TechPortal } from '@/Components/Advisory/shells';
import { Card, Donut, KV, Notice, Stat, StatusDot } from '@/Components/Advisory/ui';
import type { TechHeader } from '@/types/advisory';

interface Tower { tower: string; total: number; passed: number; failed: number; blocked: number }
interface Uat { cycle?: string; build?: string; environment?: string; start?: string; end?: string; execution?: string; towers?: Tower[]; defects_open?: number; critical_open?: number; signoff?: boolean; accepted_at?: string; testers?: [string, string][]; activity?: { title: string; detail: string; at: string; by: string }[] }
interface Props { engagement: TechHeader; uat: Uat; totals: { total: number; passed: number; failed: number; blocked: number; not: number }; checks: [string, boolean][]; canAccept: boolean }

export default function UatPage({ engagement: e, uat, totals, checks, canAccept }: Props) {
    const defect = useForm({ action: 'defect', detail: '' });
    const pct = totals.total ? Math.round((totals.passed / totals.total) * 100) : 0;
    const act = (action: string) => router.post(`/technology-solutions/workspace/${e.reference}/uat`, { action }, { preserveScroll: true });
    const raise = (ev: FormEvent) => { ev.preventDefault(); defect.post(`/technology-solutions/workspace/${e.reference}/uat`, { preserveScroll: true, onSuccess: () => defect.reset('detail') }); };
    return (
        <TechPortal e={e} title="UAT & Acceptance" description="Validate your solution meets requirements before final acceptance.">
            <Head title="UAT & Acceptance" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-7">
                <div className="col-span-2 flex items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 lg:col-span-1"><Donut size={64} slices={[{ value: totals.passed, color: '#2f855a' }, { value: totals.total - totals.passed, color: '#ebe0cd' }]} center={`${pct}%`} /><p className="text-xs">Overall UAT Progress<br /><span className="text-ink-500">{totals.passed} of {totals.total} passed</span></p></div>
                <Stat label="Test Cases" value={totals.total} />
                <Stat label="Passed" value={totals.passed} tone="good" />
                <Stat label="Failed" value={totals.failed} tone="bad" />
                <Stat label="Blocked" value={totals.blocked} tone="warn" />
                <Stat label="Not Executed" value={totals.not} />
                <Stat label="UAT End Date" value={uat.end ?? '—'} />
            </div>
            {uat.accepted_at ? <Notice tone="good" className="mt-4">UAT accepted on {uat.accepted_at}.</Notice> : totals.total > 0 ? <Notice tone="good" className="mt-4">UAT is in progress. Please review test results and resolve any issues before requesting acceptance.</Notice> : <Notice tone="info" className="mt-4">UAT has not started yet. Test cases are released at the Testing / UAT gate.</Notice>}
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-8">
                    <Card title="UAT Test Case Summary by Area">
                        <SimpleTable columns={['Area', 'Total', 'Passed', 'Failed', 'Blocked', 'Not Executed', 'Progress']} rows={[...(uat.towers ?? []).map((t) => { const p = t.total ? Math.round((t.passed / t.total) * 100) : 0; return [t.tower, t.total, t.passed, t.failed, t.blocked, t.total - t.passed - t.failed - t.blocked, <span className="flex items-center gap-1.5"><Progress value={p} tone="good" />{p}%</span>]; }), [<b>Total</b>, totals.total, totals.passed, totals.failed, totals.blocked, totals.not, `${pct}%`]]} />
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Progress = Passed ÷ Total test cases.</p>
                    </Card>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card title="Recent UAT Activity"><ul className="space-y-1.5 text-xs">{(uat.activity ?? []).map((a, i) => <li key={i}><b>{a.title}</b> — {a.detail}<br /><span className="text-ink-500">{a.at} · {a.by}</span></li>)}</ul></Card>
                        <Card title="Raise a Defect">
                            <form onSubmit={raise} className="space-y-2"><label className="block text-xs">Describe the issue<Textarea value={defect.data.detail} onChange={(x) => defect.setData('detail', x.target.value)} className="mt-1 min-h-16" /></label><Button type="submit" size="sm" variant="outline" disabled={defect.processing}>Log defect</Button></form>
                            <p className="mt-2 text-xs">Open defects: <b>{uat.defects_open ?? 0}</b> (critical {uat.critical_open ?? 0})</p>
                            <p className="mt-2 text-xs font-semibold">Assigned UAT Testers</p>
                            <ul className="text-xs text-ink-600">{(uat.testers ?? []).map(([n, r]) => <li key={n}>{n} ({r})</li>)}</ul>
                        </Card>
                    </div>
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="UAT Summary"><KV rows={[['Environment', uat.environment ?? 'UAT Environment'], ['UAT Start Date', uat.start ?? '—'], ['UAT End Date', uat.end ?? '—'], ['Test Cycle', uat.cycle ?? '—'], ['Build Version', uat.build ?? '—'], ['Test Execution', uat.execution ?? 'Manual & Automated']]} /></Card>
                    <Card title="Acceptance Readiness">
                        <ul className="space-y-1.5 text-xs">{checks.map(([l, ok], i) => <li key={l} className="flex items-center gap-1.5"><StatusDot state={ok ? 'ok' : i === 4 ? 'warn' : 'bad'} />{i === 4 ? (ok ? 'Business sign-off recorded' : 'Business sign-off pending') : l}</li>)}</ul>
                        {!uat.signoff && <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => act('signoff')}>Record business sign-off</Button>}
                        <Button className="mt-2 w-full" disabled={!canAccept || !uat.signoff || !!uat.accepted_at} onClick={() => act('accept')} trailingIcon="arrow-right">Request Acceptance</Button>
                        <p className="mt-1 text-[0.6875rem] text-ink-500">Acceptance requires every readiness check to pass (no failed cases, no open critical defects, benchmarks, security scan, sign-off).</p>
                        <Button size="sm" variant="ghost" className="mt-1 w-full" onClick={() => window.print()}>Download UAT Report (PDF)</Button>
                    </Card>
                </aside>
            </div>
        </TechPortal>
    );
}

UatPage.layout = null;
