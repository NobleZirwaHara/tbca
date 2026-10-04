import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Award, Ban, Bell, CalendarClock, CircleDollarSign, Gavel, Newspaper, RefreshCw, ShieldAlert, Building2, Users } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Checkbox } from '@/Components/ui/Form';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { Card, rand, shortDate, usd } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { DdCasePageProps, DdReportMeta } from '@/types/due-diligence';

interface Plan { code: string; name: string; expert: number; platform: number; external: number; total: number; allowance: number; reviews: number; rechecks: number; tone: string; popular?: boolean }
interface Props extends DdCasePageProps {
    plans: Plan[];
    report: DdReportMeta | null;
    subscription: { reference: string; plan_name: string; status: string } | null;
}

/** DD-047 Monitoring Offer (opt-in, paid through the shared checkout). */
export default function MonitoringOffer(props: Props) {
    const { case: c, plans, report, subscription } = props;
    const base = `/due-diligence/cases/${c.reference}`;
    const [plan, setPlan] = useState(plans.find((p) => p.popular)?.code ?? plans[0].code);
    const p = plans.find((x) => x.code === plan) ?? plans[0];
    const vat = Math.round(p.total * 0.15 * 100) / 100;
    const form = useForm({ plan, consent: false });
    const active = subscription?.status === 'active';

    return (
        <CaseLayout
            page={props}
            active="monitoring-offer"
            title="Monitoring Offer"
            subtitle="Stay informed after the report. Monitor changes, alerts and new risks over time."
            description="Monitoring helps you track changes after your due diligence report. We watch for sanctions, adverse media, status changes, filing updates and material risk events. Alerts are signals for review, not final conclusions."
            actions={active ? <ButtonLink href={`${base}/monitoring`} trailingIcon="arrow-right">Open Monitoring Dashboard</ButtonLink> : undefined}
            aside={
                <>
                    <Card title="Case summary">
                        <dl className="space-y-1 text-xs">{[['Client', c.clientName], ['Subject under monitoring', c.subjectName], ['Current report status', report ? `${report.version}` : 'Not yet released'], ['Report date', shortDate(report?.approvedAt, true)]].map(([k, v]) => <div key={k as string} className="grid grid-cols-2 gap-1"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
                    </Card>
                    <Card title="Monthly summary (ex VAT)">
                        <dl className="space-y-1 text-xs">
                            {[['TBCA Expert Fee', p.expert], ['TBCA Platform Fee', p.platform], ['External Third-Party Costs*', p.external]].map(([k, v]) => <div key={k as string} className="flex justify-between"><dt>{k}</dt><dd>{rand(v as number, 2)} <span className="text-ink-400">({usd(v as number)})</span></dd></div>)}
                            <div className="flex justify-between border-t border-parchment-300 pt-1 font-semibold"><dt>Subtotal (ex VAT)</dt><dd>{rand(p.total, 2)}</dd></div>
                            <div className="flex justify-between"><dt>VAT (15%)</dt><dd>{rand(vat, 2)}</dd></div>
                            <div className="flex justify-between rounded bg-verified-50 px-1 py-1 font-bold"><dt>Total (incl. VAT)</dt><dd>{rand(p.total + vat, 2)}</dd></div>
                        </dl>
                        <p className="mt-1 text-[0.6875rem] text-ink-500">Payment handling is added at checkout. Cancel or renew anytime.</p>
                    </Card>
                </>
            }
        >
            {active && <p className="rounded-[8px] border border-verified-500/30 bg-verified-50 p-3 text-sm text-verified-700">Monitoring is active ({subscription?.plan_name}, {subscription?.reference}).</p>}
            <Card title="Why add monitoring?">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[[ShieldAlert, 'Sanctions & watchlist alerts', 'Instant alerts if the subject or related parties appear on new sanctions or watchlists.'], [Newspaper, 'Adverse media alerts', 'AI + human monitoring of adverse media and negative news developments.'], [Building2, 'Company status / filing updates', 'Track company filings, status changes, deregistrations and compliance updates.'], [Users, 'Director & UBO changes', 'Alerts on director, beneficial ownership and key person changes.'], [Gavel, 'Litigation / regulatory developments', 'Tracking of legal actions, regulatory notices and enforcement updates.'], [CalendarClock, 'Periodic review reminders', 'Scheduled reminders to review risk posture and refresh risk information.']].map(([I, t, b]) => {
                        const Icon = I as typeof Bell;
                        return <div key={t as string} className="flex gap-3"><Icon className="size-7 shrink-0 text-gold-600" aria-hidden="true" /><div><p className="text-[0.8125rem] font-semibold">{t as string}</p><p className="text-xs text-ink-500">{b as string}</p></div></div>;
                    })}
                </div>
            </Card>
            <div>
                <h2 className="mb-3 text-base font-bold">Recommended monitoring plans</h2>
                <div className="grid gap-4 md:grid-cols-3" role="radiogroup" aria-label="Monitoring plans">
                    {plans.map((x) => (
                        <button key={x.code} type="button" role="radio" aria-checked={plan === x.code} onClick={() => { setPlan(x.code); form.setData('plan', x.code); }} className={cn('relative rounded-[10px] border-2 bg-white p-4 text-left transition', plan === x.code ? 'border-gold-500 ring-2 ring-gold-500/30' : x.tone === 'risk' ? 'border-risk-500/30' : 'border-parchment-400')}>
                            {x.popular && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded bg-gold-500 px-2 text-[0.625rem] font-bold text-ink-950">MOST POPULAR</span>}
                            <p className={cn('font-semibold', x.tone === 'risk' && 'text-risk-600')}>{x.name} <span className="font-normal text-ink-500">(Monthly)</span></p>
                            <dl className="mt-3 space-y-1 text-xs">
                                {[['TBCA Expert Fee', x.expert], ['TBCA Platform Fee', x.platform], ['External Third-Party Costs*', x.external]].map(([k, v]) => <div key={k as string} className="flex justify-between"><dt>{k}</dt><dd>{rand(v as number)}</dd></div>)}
                                <div className="flex justify-between border-t border-parchment-300 pt-1 font-bold"><dt>Total Estimate (ex VAT)</dt><dd>{rand(x.total)}</dd></div>
                            </dl>
                            <p className="mt-2 text-[0.6875rem] text-ink-500">{x.allowance} alerts / period · {x.reviews} reviewed alerts · {x.rechecks} recheck(s)</p>
                        </button>
                    ))}
                </div>
                <p className="mt-2 text-[0.6875rem] text-ink-500">*External Third-Party Costs include sanctions, media, corporate registry and other data provider costs. Actual amounts may vary by jurisdiction and data sources.</p>
            </div>
            <Card title="How monitoring works">
                <ol className="grid gap-3 sm:grid-cols-4">{['Select plan — choose a plan that matches your risk and monitoring needs', 'Confirm scope & consent — we confirm the monitoring scope and record your consent', 'Monitoring goes live — your case is added to the watchlists', 'Receive alerts in portal — high-priority alerts are escalated'].map((t, n) => <li key={t} className="text-xs"><span className="mr-1 inline-flex size-5 items-center justify-center rounded-full bg-gold-500 font-bold text-ink-950">{n + 1}</span>{t}</li>)}</ol>
                <div className="mt-4 grid gap-3 text-xs sm:grid-cols-5">
                    {[[Award, 'Alerts are reviewed'], [CircleDollarSign, 'No hidden fees'], [RefreshCw, 'Cancel or renew anytime'], [ShieldAlert, 'Data retained per policy'], [Ban, 'Severe alerts may need more work (quoted separately)']].map(([I, t]) => { const Icon = I as typeof Bell; return <p key={t as string} className="flex gap-1.5"><Icon className="size-4 shrink-0 text-gold-600" aria-hidden="true" />{t as string}</p>; })}
                </div>
            </Card>
            {!active && (
                <Card>
                    <form className="flex flex-col gap-3 sm:flex-row sm:items-center" onSubmit={(e) => { e.preventDefault(); form.post(`${base}/monitoring`); }}>
                        <div className="flex-1">
                            <Checkbox label={`I confirm the monitoring scope for ${c.subjectName} and consent to ongoing monitoring under the ${p.name} plan.`} checked={form.data.consent} onChange={(e) => form.setData('consent', e.target.checked)} />
                            {(form.errors.consent || form.errors.plan || (form.errors as Record<string, string>).status) && <p className="mt-1 text-xs text-risk-500">{form.errors.consent ?? form.errors.plan ?? (form.errors as Record<string, string>).status}</p>}
                        </div>
                        <Button type="submit" disabled={!form.data.consent || form.processing || c.status !== 'delivered'} trailingIcon="arrow-right">Start Monitoring</Button>
                    </form>
                    {c.status !== 'delivered' && <p className="mt-2 text-xs text-ink-500">Monitoring can be activated once your report is delivered.</p>}
                </Card>
            )}
        </CaseLayout>
    );
}
