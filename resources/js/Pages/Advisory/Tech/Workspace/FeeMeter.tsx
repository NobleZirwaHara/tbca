import { Head, Link, router } from '@inertiajs/react';
import { Lock, MessageCircle } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { TechPortal } from '@/Components/Advisory/shells';
import { Card, Gauge, KV, LedgerBadge, Notice, zar, zarRange } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';
import type { TechHeader } from '@/types/advisory';

interface Props {
    engagement: TechHeader;
    ledgers: { T: { paid: number; approved: number; future: number; range: [number, number] }; X: { funded: number; pending: number; future: [number, number]; range: [number, number] }; S: { vat_paid: number; filing: [number, number]; range: [number, number] } };
    gates: { number: number; name: string; status: string; t: number; x: [number, number]; x_funded: boolean }[];
    next: { number: number; name: string; t: number; x: [number, number]; expires: string | null } | null;
    meter: { cap: number; consumed: number; cap_pct: number; warning: number; projected: number };
    events: { date: string; label: string; amount: number; status: string }[];
    fundable: number | null;
}

function GateDots({ gates }: { gates: Props['gates'] }) {
    return <div className="flex gap-1">{gates.map((g) => <span key={g.number} title={`Gate ${g.number}: ${g.status}`} className={cn('inline-flex size-6 items-center justify-center rounded-full text-[0.625rem] font-bold', g.status === 'approved' ? 'bg-verified-500 text-white' : g.status === 'presented' || g.status === 'approved_not_paid' ? 'bg-gold-500' : 'bg-parchment-300 text-ink-500')}>{g.number}</span>)}</div>;
}

export default function FeeMeter({ engagement: e, ledgers, gates, next, meter, events, fundable }: Props) {
    const fund = () => fundable && router.post(`/technology-solutions/workspace/${e.reference}/gates/${fundable}`, { decision: 'fund' });
    return (
        <TechPortal e={e} title="Fee Meter" description="Track your current commercial position across separate ledgers.">
            <Head title="Fee Meter" />
            {next && <Notice tone="warn" className="mb-4"><span className="flex-1">Next Commercial Gate: <b>Gate {next.number} {next.name}</b> — due on or before {next.expires}</span><Link href={`/technology-solutions/workspace/${e.reference}?gate=1`} className="font-semibold underline">View Next Gate →</Link></Notice>}
            <div className="grid gap-4 xl:grid-cols-12">
                <div className="grid gap-4 lg:grid-cols-3 xl:col-span-9">
                    <Card title={<span className="flex items-center gap-2"><LedgerBadge l="T" size="sm" />TBCA Professional Fees</span>} action={<StatusPill status="On Track" tone="good" />}>
                        <GateDots gates={gates} />
                        <KV className="mt-3" rows={[['Paid', zar(ledgers.T.paid)], ['Approved Not Yet Paid', zar(ledgers.T.approved)], ['Future Disclosed (fixed + estimated)', zar(ledgers.T.future)], ['Ledger T range (all gates)', zarRange(ledgers.T.range)], ['Unknown / Quote Pending', 'Change orders only via VAR gate']]} />
                        <p className="mt-2 text-[0.6875rem] text-ink-500">All T fees are governed by the approved Scope, gates and Change Control.</p>
                    </Card>
                    <Card title={<span className="flex items-center gap-2"><LedgerBadge l="X" size="sm" />External Costs / Supplier Funding</span>} action={<StatusPill status={ledgers.X.pending > 0 ? 'Needs Attention' : 'Funded'} tone={ledgers.X.pending > 0 ? 'warn' : 'good'} />}>
                        <GateDots gates={gates.map((g) => ({ ...g, status: g.x[1] === 0 ? 'locked' : g.x_funded ? 'approved' : g.status === 'locked' ? 'locked' : 'presented' }))} />
                        <KV className="mt-3" rows={[['Paid / Funded', zar(ledgers.X.funded)], ['Funding Pending', zar(ledgers.X.pending)], ['Future Disclosed Range', zarRange(ledgers.X.future)], ['Ledger X range (all)', zarRange(ledgers.X.range)]]} />
                        <p className="mt-2 flex items-center gap-1 text-[0.6875rem] text-risk-700"><Lock className="size-3" />No supplier commitment before cleared X funding.</p>
                        {fundable && <Button size="sm" className="mt-2 w-full" onClick={fund}>Fund Ledger X for Gate {fundable}</Button>}
                    </Card>
                    <Card title={<span className="flex items-center gap-2"><LedgerBadge l="S" size="sm" />Statutory / Tax & Compliance</span>} action={<StatusPill status="Compliant" tone="good" />}>
                        <KV rows={[['VAT Treatment', 'Standard Rated (As Per Law)'], ['VAT Paid to Date', zar(ledgers.S.vat_paid)], ['Pending Statutory Filing', zarRange(ledgers.S.filing)], ['Compliance Status', 'Up to date'], ['Regulatory filing', 'Quote-on-Trigger']]} />
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Statutory ledger is treated separately and as prescribed by law.</p>
                    </Card>
                    <Card title="Certainty Legend" className="lg:col-span-1"><ul className="space-y-1 text-xs"><li><b>Fixed</b> — Amount is fixed and confirmed</li><li><b>Estimated</b> — Best estimate based on current information</li><li><b>Metered</b> — Usage-based; depends on consumption</li><li><b>Quote-on-Trigger</b> — Quote when event is triggered</li><li><b>As Per Law</b> — Determined by applicable law</li></ul></Card>
                    <Card title="Recent Fee Events" className="lg:col-span-2">
                        <ul className="divide-y divide-parchment-300 text-xs">{events.map((x, i) => <li key={i} className="flex items-center justify-between gap-2 py-1.5"><span className="text-ink-500">{x.date}</span><span className="flex-1">{x.label}</span><span>{zar(x.amount)}</span><StatusPill status={x.status} /></li>)}{events.length === 0 && <li className="py-2 text-ink-500">No portal payments yet.</li>}</ul>
                    </Card>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    {next && <Card title="Next Commercial Gate"><p className="text-xs">What may become payable at Gate {next.number} {next.name} (by ledger):</p><ul className="mt-2 space-y-1 text-xs"><li className="flex items-center gap-2"><LedgerBadge l="T" size="sm" />{zar(next.t)}</li><li className="flex items-center gap-2"><LedgerBadge l="X" size="sm" />{next.x[1] ? zarRange(next.x) : 'None'}</li><li className="flex items-center gap-2"><LedgerBadge l="S" size="sm" />VAT {zar(Math.round(next.t * 0.15))}</li></ul><p className="mt-2 text-[0.6875rem] text-ink-500">Later gates are not yet approved and amounts may change.</p></Card>}
                    <Card title="Metered Usage — AI Automations">
                        <Gauge value={meter.cap_pct} label={meter.cap_pct >= meter.warning ? 'Warning threshold reached' : 'Within Cap'} />
                        <KV rows={[['Approved Cap', `${meter.cap.toLocaleString()} task-runs`], ['Consumed', `${meter.consumed.toLocaleString()} task-runs`], ['Warning Threshold', `${meter.warning}%`], ['Hard pause', 'At 100% of cap']]} />
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Metered usage may influence future disclosed charges but is not an automatic approval.</p>
                    </Card>
                    <Card title="Need Help?" tone="gold"><p className="text-xs">Raise a billing query or speak to our team.</p><Link href={`/technology-solutions/workspace/${e.reference}/support`} className="mt-2 block text-xs font-semibold underline">Raise Billing Query →</Link><a href="https://wa.me/27120010567" className="mt-1 flex items-center gap-1 text-xs text-verified-700"><MessageCircle className="size-3" />WhatsApp Support</a></Card>
                </aside>
            </div>
        </TechPortal>
    );
}

FeeMeter.layout = null;
