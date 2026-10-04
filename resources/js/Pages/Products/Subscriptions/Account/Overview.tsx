import { Link, router } from '@inertiajs/react';
import { AlertTriangle, CalendarClock, CircleCheck, Download, Receipt, Repeat, Scale } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { ProductsWorkspaceLayout } from '@/Components/Products/Layouts';
import { SimpleTable } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import { Card, ClassChip, CLASS_NAMES, StatTile, SubStatus, TextLink, shortDate, rand } from '@/Components/Products/Subscriptions/ui';
import type { SubSubscription } from '@/Components/Products/Subscriptions/types';
import { cn } from '@/lib/cn';

interface Props {
    subscriptions: SubSubscription[];
    filter: string;
    counts: Record<string, number>;
    kpis: { active: number; total: number; upcoming_zar: number; upcoming_count: number; deliveries: number; attention: number };
    attention: { type: string; title: string; code: string | null; plan: string; body: string; href: string; cta: string }[];
}

const FILTERS = [
    ['all', 'All Subscriptions'],
    ['active', 'Active'],
    ['needs_action', 'Needs Action'],
    ['paused', 'Paused'],
    ['cancelled', 'Cancelled / Reactivatable'],
];

function action(s: SubSubscription) {
    const base = `/subscriptions/account/${s.reference}`;
    switch (s.display_status) {
        case 'PRICE_CHANGE_PENDING':
            return { label: 'Review Change', href: `${base}/price-change`, tone: 'border-attested-500 text-attested-700' };
        case 'DISUSE_FLAGGED':
            return { label: 'View Options', href: `${base}/disuse`, tone: 'border-risk-500/50 text-risk-700' };
        case 'IN_GRACE':
        case 'PAST_DUE':
            return { label: 'Settle Now', href: `${base}/billing-recovery`, tone: 'border-risk-500/50 text-risk-700' };
        case 'REACTIVATABLE':
        case 'PAUSED':
            return { label: s.display_status === 'PAUSED' ? 'Resume' : 'Reactivate', href: s.display_status === 'PAUSED' ? base : `${base}/reactivate`, tone: 'border-controlled-500 text-controlled-700' };
        default:
            return { label: 'Manage', href: base, tone: 'border-parchment-500 text-ink-800' };
    }
}

export default function Overview({ subscriptions, filter, counts, kpis, attention }: Props) {
    return (
        <ProductsWorkspaceLayout
            title="My Subscriptions Overview"
            description="Review all your active and inactive subscriptions, next charges, next-period value, delivery timing and lifecycle actions."
            crumbs={[{ label: 'Client Portal', href: '/portal' }, { label: 'Subscriptions' }]}
            actions={<ButtonLink href="/subscriptions/compare" variant="outline" size="sm">Compare Plans</ButtonLink>}
        >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatTile icon={CircleCheck} tone="green" label="Active Subscriptions" value={kpis.active} caption={`of ${kpis.total} total`} />
                <StatTile icon={Receipt} tone="orange" label="Upcoming Charges (This Month)" value={rand(kpis.upcoming_zar)} caption={`${kpis.upcoming_count} charges scheduled`} />
                <StatTile icon={CalendarClock} tone="purple" label="Next Deliveries / Refreshes" value={kpis.deliveries} caption="Across all subscriptions" />
                <StatTile icon={AlertTriangle} tone="red" label="Items Needing Attention" value={kpis.attention} caption="Require your review" />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[220px_1fr_300px]">
                <div className="space-y-4">
                    <Card title="Filter Subscriptions">
                        <ul className="space-y-1">
                            {FILTERS.map(([k, label]) => (
                                <li key={k}>
                                    <button
                                        type="button"
                                        onClick={() => router.get('/subscriptions/account', k === 'all' ? {} : { filter: k }, { preserveScroll: true })}
                                        className={cn('flex w-full items-center justify-between rounded-[4px] px-2 py-1.5 text-left text-[0.8125rem]', filter === k ? 'bg-gold-50 font-semibold text-gold-800' : 'text-ink-700 hover:bg-parchment-100')}
                                        aria-pressed={filter === k}
                                    >
                                        {label}
                                        <span className="text-xs text-ink-500">{counts[k] ?? 0}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card title="Recurrence Class Key">
                        <ul className="space-y-1.5 text-xs">
                            {['R1', 'R2', 'R3', 'R4', 'R5'].map((c) => (
                                <li key={c} className="flex items-center gap-2">
                                    <ClassChip code={c} compact />
                                    {CLASS_NAMES[c]}
                                </li>
                            ))}
                        </ul>
                        <TextLink href="/subscriptions/compare" className="mt-2">Learn more about recurrence classes</TextLink>
                    </Card>
                </div>

                <Card title={`Your Subscriptions (${subscriptions.length})`}>
                    <SimpleTable
                        columns={['Subscription', 'Recurrence Class', 'Status', 'What Repeats / Next-Period Value', 'Next Charge', 'Next Delivery / Refresh', 'Action']}
                        rows={subscriptions.map((s) => {
                            const a = action(s);
                            return [
                                <Link href={`/subscriptions/account/${s.reference}`} className="font-semibold text-ink-900 hover:text-gold-700">
                                    {s.plan.name}
                                    <span className="block text-xs font-normal text-ink-500">{s.plan.tagline}</span>
                                </Link>,
                                <ClassChip code={s.plan.recurrence_class} label={s.plan.class_name} />,
                                <SubStatus status={s.display_status} />,
                                <span className="block max-w-[14rem] text-xs">{s.plan.next_period_value ?? s.plan.what_recurs}</span>,
                                s.status === 'ACTIVE' || s.status === 'IN_GRACE' ? (
                                    <span>
                                        {shortDate(s.next_charge_at)}
                                        <span className="block text-xs text-ink-500">{rand(s.price_zar)} ZAR</span>
                                    </span>
                                ) : (
                                    <span className="text-ink-500">— {s.status === 'PAUSED' ? 'Paused' : s.status === 'CANCELLED_PENDING' ? `Ends ${shortDate(s.cancel_effective_at)}` : ''}</span>
                                ),
                                s.status === 'PAUSED' ? `Access paused until ${shortDate(s.pause_until)}` : s.plan.delivery_cadence ?? 'Continuous',
                                <Link href={a.href} className={cn('inline-flex h-8 items-center rounded-[4px] border bg-white px-3 text-xs font-semibold', a.tone)}>
                                    {a.label}
                                </Link>,
                            ];
                        })}
                        empty={
                            <span>
                                No subscriptions in this view. <Link href="/subscriptions" className="font-semibold text-gold-700">Browse plans</Link>
                            </span>
                        }
                    />
                    <p className="mt-3 text-xs text-ink-500">
                        Need help understanding your subscriptions?{' '}
                        <button type="button" className="font-semibold text-referenced-700" onClick={() => openAskQuestion({ subject: 'My subscriptions', section: 'subscriptions' })}>
                            Talk to a Specialist →
                        </button>
                    </p>
                </Card>

                <div className="space-y-4">
                    <Card title="What Needs Your Attention">
                        <ul className="space-y-3">
                            {attention.map((a, i) => (
                                <li key={i} className="rounded-[6px] border border-parchment-400 p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-1">
                                        <p className="text-[0.8125rem] font-semibold text-ink-900">{a.title}</p>
                                        {a.code && <SubStatus status={a.code === 'PAYMENT_OVERDUE' ? 'PAST_DUE' : a.code} raw />}
                                    </div>
                                    <p className="text-xs font-medium text-ink-700">{a.plan}</p>
                                    <p className="text-xs text-ink-500">{a.body}</p>
                                    <TextLink href={a.href} className="mt-1">{a.cta}</TextLink>
                                </li>
                            ))}
                            {attention.length === 0 && <li className="text-xs text-ink-500">Nothing needs your attention right now.</li>}
                        </ul>
                    </Card>
                    <Card title="Quick Actions">
                        <div className="grid grid-cols-2 gap-2">
                            <ButtonLink href="/subscriptions/compare" variant="outline" size="sm"><Scale className="size-4" aria-hidden="true" />Compare</ButtonLink>
                            <ButtonLink href="/subscriptions" variant="outline" size="sm"><Repeat className="size-4" aria-hidden="true" />Plans</ButtonLink>
                            {subscriptions[0] && <ButtonLink href={`/subscriptions/account/${subscriptions[0].reference}/export`} variant="outline" size="sm"><Download className="size-4" aria-hidden="true" />Export</ButtonLink>}
                            <ButtonLink href="/portal" variant="outline" size="sm"><Receipt className="size-4" aria-hidden="true" />Invoices</ButtonLink>
                        </div>
                    </Card>
                </div>
            </div>
        </ProductsWorkspaceLayout>
    );
}

Overview.layout = null;
