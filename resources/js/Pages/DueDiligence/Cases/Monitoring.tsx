import { router } from '@inertiajs/react';
import { Bell, ClipboardCheck, FileText, Gauge, Users } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Progress, StatusPill } from '@/Components/ui/Kit';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { Card, Donut, RISK_COLORS, rand, shortDate } from '@/Components/DueDiligence/Ui';
import type { DdCasePageProps, DdReportMeta } from '@/types/due-diligence';

interface Props extends DdCasePageProps {
    subscription: { reference: string; plan_code: string; plan_name: string; billing_cycle: string; recurring_zar: number; status: string; subjects: number; alert_allowance: number; included_reviews: number; included_rechecks: number; startedAt: string | null; nextRenewalAt: string | null };
    alerts: { reference: string; subject: string; alert_type: string; source: string; risk_level: string; status: string; reviewer: string | null; disposition: string | null; detectedAt: string | null }[];
    report: DdReportMeta | null;
}

/** DD-048 Monitoring Dashboard and Alerts. All alerts are reviewed before any client-facing disposition. */
export default function Monitoring(props: Props) {
    const { case: c, subscription: s, alerts, report } = props;
    const base = `/due-diligence/cases/${c.reference}`;
    const recent = alerts.filter((a) => a.detectedAt && Date.now() - new Date(a.detectedAt).getTime() < 30 * 864e5);
    const byRisk = ['critical', 'high', 'medium', 'low'].map((l) => ({ label: l[0].toUpperCase() + l.slice(1), value: recent.filter((a) => a.risk_level === l).length, color: RISK_COLORS[l] }));
    const reviewed = alerts.filter((a) => a.status === 'reviewed').length;
    const awaiting = alerts.filter((a) => ['pending_review', 'under_review'].includes(a.status)).length;
    const used = alerts.length;
    const active = s.status === 'active';

    return (
        <CaseLayout
            page={props}
            active="monitoring-offer"
            wide
            role="Account Owner"
            title="Monitoring Dashboard and Alerts"
            subtitle="Real-time monitoring and alerts for your active subjects."
            description="All alerts are reviewed before any client-facing disposition."
            bandNote="Monitoring alerts are included in your subscription."
            actions={
                <>
                    <ButtonLink href="/due-diligence/enterprise/dashboard" variant="outline-light">Upload Subject Batch</ButtonLink>
                    {active && <Button type="button" variant="outline-light" onClick={() => confirm('Cancel monitoring? No further recurring charges will be raised.') && router.post(`${base}/monitoring/cancel`)}>Cancel / Manage Subjects</Button>}
                </>
            }
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Card><p className="text-xs text-ink-500">Monitoring overview</p><p className="text-sm">Plan: <strong className="text-verified-700">{s.plan_name}</strong></p><p className="text-xs">Subscription ID: <span className="font-mono">{s.reference}</span></p><StatusPill status={s.status} className="mt-1" /></Card>
                <Card><p className="text-xs text-ink-500">Subjects under monitoring</p><p className="flex items-center gap-2 text-2xl font-bold"><Users className="size-6 text-gold-600" aria-hidden="true" />{s.subjects}</p><p className="text-xs text-ink-500">Active subjects</p></Card>
                <Card><p className="text-xs text-ink-500">Alerts (last 30 days)</p><p className="text-2xl font-bold">{recent.length}</p><p className="text-xs text-ink-500">Total alerts</p></Card>
                <Card><p className="text-xs text-ink-500">Alerts reviewed</p><p className="flex items-center gap-2 text-2xl font-bold"><ClipboardCheck className="size-6 text-verified-500" aria-hidden="true" />{reviewed}</p><p className="text-xs text-ink-500">Awaiting review {awaiting}</p></Card>
                <Card><p className="text-xs text-ink-500">Report status</p><p className="text-sm font-semibold text-verified-700">{report?.version ?? '—'}</p><p className="text-xs text-ink-500">Last updated {shortDate(report?.approvedAt)}</p><a href={`${base}/report`} className="text-xs font-semibold text-gold-700">View report →</a></Card>
                <Card><p className="text-xs text-ink-500">Subscription usage</p><p className="text-2xl font-bold">{used} / {s.alert_allowance}</p><Progress value={(used / Math.max(1, s.alert_allowance)) * 100} className="mt-1" /><p className="mt-1 text-xs text-ink-500">Renews {shortDate(s.nextRenewalAt)}</p></Card>
            </div>
            <div className="grid gap-5 xl:grid-cols-12">
                <Card title="Recent alerts" className="xl:col-span-7">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] text-left text-xs">
                            <thead className="text-ink-500"><tr><th className="py-1">Alert ID</th><th>Subject</th><th>Alert type</th><th>Source</th><th>Detected on</th><th>Risk level</th><th>Status / reviewer</th></tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {alerts.map((a) => (
                                    <tr key={a.reference}>
                                        <td className="py-2 font-mono">{a.reference}</td><td>{a.subject}</td><td>{a.alert_type}</td><td>{a.source}</td><td>{shortDate(a.detectedAt)}</td>
                                        <td><span className="rounded px-1.5 py-0.5 font-semibold text-white capitalize" style={{ background: RISK_COLORS[a.risk_level] }}>{a.risk_level}</span></td>
                                        <td><StatusPill status={a.status.replace('_', ' ')} />{a.reviewer && <span className="block text-ink-500">{a.reviewer}</span>}</td>
                                    </tr>
                                ))}
                                {alerts.length === 0 && <tr><td colSpan={7} className="py-3 text-ink-500">No alerts yet. Alerts appear here after human review triage.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-[0.6875rem] text-ink-500">Showing {alerts.length} alert(s). Alerts are signals for review, not conclusions.</p>
                </Card>
                <Card title="Alerts by risk (last 30 days)" className="xl:col-span-2">
                    <Donut size={110} center={<span><span className="block text-xl font-bold">{recent.length}</span><span className="text-[0.625rem]">Total</span></span>} segments={byRisk} />
                    <p className="mt-3 flex items-center gap-2 text-xs"><Gauge className="size-4 text-gold-600" aria-hidden="true" />Goal: review in &lt; 2 business days</p>
                </Card>
                <div className="space-y-4 xl:col-span-3">
                    <Card title="Subscription details">
                        <dl className="space-y-1 text-xs">{[['Plan', s.plan_name], ['Fee code', s.plan_code], ['Recurring fee (ex VAT)', rand(s.recurring_zar, 2)], ['Billing cycle', s.billing_cycle], ['Next renewal', shortDate(s.nextRenewalAt)], ['Payment status', s.status]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="font-medium capitalize">{v}</dd></div>)}</dl>
                    </Card>
                    <Card title="Usage & allowance">
                        <dl className="space-y-1 text-xs">{[['Alert allowance', `${s.alert_allowance} / period`], ['Used this period', `${used}`], ['Remaining', `${Math.max(0, s.alert_allowance - used)}`], ['Included human reviews', `${s.included_reviews}`], ['Included rechecks', `${s.included_rechecks}`], ['Overage rate', 'R 840 ex VAT per reviewed alert']].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd>{v}</dd></div>)}</dl>
                    </Card>
                </div>
            </div>
            <div className="grid gap-3 rounded-[10px] border border-parchment-400 bg-white p-4 text-xs md:grid-cols-4">
                {[[Bell, 'Real-time monitoring', 'We scan multiple authoritative sources for relevant changes.'], [Users, 'Human review included', 'All alerts are reviewed by qualified professionals before you are notified.'], [FileText, 'No auto-charges', 'Alerts included in your plan. No charges per alert within allowance.'], [Gauge, 'Need more capacity?', 'Upgrade your plan or purchase additional allowance.']].map(([I, t, b]) => { const Icon = I as typeof Bell; return <p key={t as string} className="flex gap-2"><Icon className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block">{t as string}</strong>{b as string}</span></p>; })}
            </div>
        </CaseLayout>
    );
}
