import { Head, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { TechPortal } from '@/Components/Advisory/shells';
import { Card, CheckList, KV, Notice, Stat, zar } from '@/Components/Advisory/ui';
import type { TechHeader } from '@/types/advisory';

interface Sub { plan: string; id: string; status: string; annual_fee: number; auto_renew: boolean; period_start: string | null; period_end: string | null; seats: number; card?: string; last_invoice?: string; pending_order?: string }

export default function Subscription({ engagement: e, subscription: s, usage }: { engagement: TechHeader; subscription: Sub; usage: { allowance: number; used: number; remaining: number } }) {
    const act = (action: string) => router.post(`/technology-solutions/workspace/${e.reference}/subscription`, { action }, { preserveScroll: true });
    const active = s.status === 'Active';
    const days = s.period_end ? Math.max(0, Math.round((new Date(s.period_end).getTime() - Date.now()) / 86400000)) : null;
    return (
        <TechPortal e={e} title="Subscription & Renewal" description="Manage your subscription, renewal, and engagement continuity.">
            <Head title="Subscription & Renewal" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                <Stat label="Current Plan" value={s.plan} sub="Annual Subscription" />
                <Stat label="Status" value={s.status} tone={active ? 'good' : 'warn'} />
                <Stat label="Current Period" value={s.period_start ? `${s.period_start} – ${s.period_end}` : '—'} />
                <Stat label="Next Renewal Date" value={s.period_end ?? '—'} sub={days !== null ? `In ${days} days` : ''} />
                <Stat label="Subscription ID" value={<span className="text-sm">{s.id}</span>} />
                <Stat label="Auto-Renewal" value={s.auto_renew ? 'Enabled' : 'Disabled'} sub={<button type="button" className="underline" onClick={() => act('auto_renew')}>Manage</button>} />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-8">
                    <Card title="Subscription Details"><KV rows={[['Plan Name', s.plan], ['Billing Frequency', 'Annual'], ['Annual Fee (Incl. VAT)', zar(s.annual_fee)], ['Payment Method', s.card ? `Card ****${s.card}` : 'Selected at checkout'], ['Auto-Renewal', s.auto_renew ? 'Enabled (still requires your S13-RENEW approval)' : 'Disabled'], ['Seats / Users', `${s.seats} Users`], ['Included Allowance', '100 units (Metered Services)'], ['Additional Benefits', 'Priority Support, 2 Free Discovery Calls']]} /></Card>
                    <Card title="Renewal & Billing">
                        <KV rows={[['Renewal Amount (Incl. VAT)', zar(s.annual_fee)], ['Early Renewal', active ? `Renew now with 5% discount → ${zar(Math.round(s.annual_fee * 0.95))}` : '—'], ['Renewal Reminder', '30 days before renewal'], ['Invoice Schedule', 'Annual, in advance'], ['Last Invoice', s.last_invoice ?? '—']]} />
                        {s.pending_order && <Notice tone="warn" className="mt-3">Renewal payment {s.pending_order} is awaiting completion.</Notice>}
                        <div className="mt-3 flex flex-wrap gap-2">{active ? <Button onClick={() => act('renew')}>Renew Now</Button> : s.status !== 'Cancelled' && <Button onClick={() => act(s.status === 'Paused' ? 'resume' : 'activate')}>{s.status === 'Paused' ? 'Resume Subscription' : 'Activate Subscription (S13-ACTIVATE)'}</Button>}</div>
                        <Notice tone={active ? 'good' : 'info'} className="mt-3">{active ? 'Your subscription is up to date. You have full access to all included features.' : 'There is no silent renewal — every recurring term needs your explicit approval.'}</Notice>
                    </Card>
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="Usage Summary"><KV rows={[['Included Allowance', `${usage.allowance} units`], ['Used to Date', `${usage.used} units (${usage.used}%)`], ['Remaining', `${usage.remaining} units`]]} /></Card>
                    <Card title="Plan Features"><CheckList items={['Access to all solution towers', 'Priority email & chat support', '2 Free discovery calls per year', 'Document templates library', 'Metered service allowance', 'Engagement history & reports', 'Early renewal discount (5%)']} /></Card>
                    <Card title="Need to Make Changes?">
                        <p className="text-xs text-ink-500">Upgrade, downgrade, pause or cancel your subscription.</p>
                        <div className="mt-2 grid gap-2">
                            <Button size="sm" variant="outline" onClick={() => router.visit('/services/downgrade-exit')}>Change Plan</Button>
                            {active && <Button size="sm" variant="outline" onClick={() => act('pause')}>Pause Subscription</Button>}
                            {s.status !== 'Cancelled' && <Button size="sm" variant="outline" className="border-risk-500 text-risk-700" onClick={() => confirm('Cancel this subscription at the end of the current period?') && act('cancel')}>Cancel Subscription</Button>}
                        </div>
                        <p className="mt-2 text-xs">Status: <StatusPill status={s.status} /></p>
                    </Card>
                </aside>
            </div>
        </TechPortal>
    );
}

Subscription.layout = null;
