import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Check, TrendingUp } from 'lucide-react';
import { SimpleTable, Tabs } from '@/Components/ui/Kit';
import { CheckList, LabelValues, Notice } from '@/Components/Products/Shared';
import { AccountShell, HelpCard, PurpleButton } from '@/Components/Products/Subscriptions/Account';
import { Card, ClassChip, RecordHeader, fmtDate, zar } from '@/Components/Products/Subscriptions/ui';
import type { SubPlan, SubSubscription } from '@/Components/Products/Subscriptions/types';
import { cn } from '@/lib/cn';

interface Quote {
    direction: 'upgrade' | 'downgrade' | 'same';
    new_price_zar: number;
    difference_zar: number;
    prorated_zar: number;
    remaining_days: number;
    effective: string;
}

type Option = SubPlan & { quote: Quote | null };

interface Props {
    subscription: SubSubscription;
    options: Option[];
    history: { event_type: string; payload: Record<string, unknown> | null; created_at: string }[];
    selected: string | null;
}

export default function ChangePlan({ subscription: sub, options, history, selected }: Props) {
    const others = options.filter((o) => o.quote);
    const [tab, setTab] = useState('compare');
    const [to, setTo] = useState(selected && others.some((o) => o.slug === selected) ? selected : (others.find((o) => o.quote?.direction === 'upgrade') ?? others[0])?.slug ?? '');
    const target = others.find((o) => o.slug === to);
    const q = target?.quote;
    const active = sub.status === 'ACTIVE';
    const period = sub.billing_interval === 'annual' ? 'year' : 'month';

    const apply = () => {
        if (!target || !q) return;
        const msg = q.direction === 'upgrade' ? `Upgrade to ${target.name} now? A prorated ${zar(q.prorated_zar)} is added to your next invoice.` : `Schedule a downgrade to ${target.name} from ${fmtDate(q.effective)}?`;
        if (window.confirm(msg)) router.post(`/subscriptions/account/${sub.reference}/change-plan`, { plan: target.slug });
    };

    return (
        <AccountShell sub={sub} title="Upgrade or Downgrade Your Plan" crumb="Change Plan">
            <RecordHeader icon={TrendingUp} title="Upgrade or Downgrade Your Plan" sub={sub} lead="Choose the plan that best matches your current needs. Changes are seamless." />

            {!active && <Notice tone="warn" className="mb-4" title="Plan changes need an active subscription">Resume, settle or reactivate your subscription first.</Notice>}

            <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[{ key: 'compare', label: 'Compare Plans' }, { key: 'history', label: 'Plan History' }, { key: 'rules', label: 'Change Rules' }]} />

            <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
                <div className="min-w-0 space-y-5">
                    {tab === 'compare' && (
                        <>
                            <Notice tone="info" title="Changing your plan is easy">Upgrades take effect immediately with a prorated charge for the rest of this period. Downgrades take effect from your next billing date.</Notice>
                            <div className="grid gap-4 md:grid-cols-3">
                                {options.map((o) => {
                                    const current = !o.quote;
                                    const up = o.quote?.direction === 'upgrade';
                                    return (
                                        <div key={o.slug} className={cn('flex flex-col rounded-[8px] border bg-white p-4', current ? 'border-referenced-500' : to === o.slug ? 'border-gold-500 ring-1 ring-gold-500' : 'border-parchment-400')}>
                                            <span className={cn('mb-2 w-fit rounded px-2 py-0.5 text-[0.625rem] font-bold uppercase', current ? 'bg-referenced-50 text-referenced-700' : up ? 'bg-verified-50 text-verified-700' : 'bg-attested-50 text-attested-700')}>
                                                {current ? 'Current plan' : up ? 'Upgrade' : 'Downsize option'}
                                            </span>
                                            <p className="font-serif text-lg font-semibold text-ink-900">{o.name}</p>
                                            <ClassChip code={o.recurrence_class} label={o.class_name} className="mt-1 w-fit" />
                                            <p className="mt-1 text-xs text-ink-600">{o.tagline}</p>
                                            <p className="mt-3 text-xl font-bold text-ink-900">
                                                {zar(sub.billing_interval === 'annual' ? o.annual_zar : o.monthly_zar)} <span className="text-xs font-medium text-ink-500">/ {period} ex VAT</span>
                                            </p>
                                            <CheckList items={o.features.slice(0, 6)} className="mt-3 flex-1" />
                                            {current ? (
                                                <span className="mt-4 inline-flex h-10 items-center justify-center gap-1 rounded-[4px] border border-referenced-500/40 text-sm font-semibold text-referenced-700">
                                                    Your current plan <Check className="size-4" aria-hidden="true" />
                                                </span>
                                            ) : (
                                                <button type="button" onClick={() => setTo(o.slug)} disabled={!active} className={cn('mt-4 h-10 rounded-[4px] border text-sm font-semibold disabled:opacity-50', up ? 'border-verified-500 bg-verified-500 text-white' : 'border-attested-500 bg-white text-attested-700')}>
                                                    {up ? 'Upgrade to' : 'Downgrade to'} {o.recurrence_class}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                    {tab === 'history' && (
                        <Card title="Plan History">
                            <SimpleTable
                                columns={['Date', 'Change', 'Detail']}
                                rows={history.map((h) => [new Date(h.created_at).toLocaleDateString('en-ZA'), h.event_type.replace(/_/g, ' '), h.payload ? Object.entries(h.payload).map(([k, v]) => `${k}: ${String(v)}`).join(' · ') : '—'])}
                                empty="No plan changes yet."
                            />
                        </Card>
                    )}
                    {tab === 'rules' && (
                        <Card title="Change Rules">
                            <CheckList
                                items={[
                                    'Upgrades: immediate access; prorated charge = price difference × remaining days ÷ period days, added to your next invoice.',
                                    'Downgrades: take effect from your next billing date; you keep current features until then.',
                                    'Changes stay within the same plan family and must be currently available.',
                                    'No setup fees or hidden charges.',
                                    'Cancel anytime. No penalties.',
                                ]}
                            />
                        </Card>
                    )}
                </div>

                <div className="space-y-4">
                    <Card title="Your Plan Change Impact">
                        {target && q ? (
                            <>
                                <LabelValues
                                    rows={[
                                        { label: 'From', value: `${sub.plan.name} · ${zar(sub.price_zar)} / ${period}` },
                                        {
                                            label: 'To',
                                            value: (
                                                <select value={to} onChange={(e) => setTo(e.target.value)} className="h-8 max-w-[11rem] rounded border border-parchment-500 bg-white px-1 text-xs" aria-label="Plan to change to">
                                                    {others.map((o) => (
                                                        <option key={o.slug} value={o.slug}>
                                                            {o.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ),
                                        },
                                        { label: 'Price difference', value: <span className={q.difference_zar >= 0 ? 'text-verified-700' : 'text-attested-700'}>{`${q.difference_zar >= 0 ? '+' : '−'}${zar(Math.abs(q.difference_zar))} / ${period}`}</span> },
                                        { label: `Prorated amount (${q.remaining_days} days left)`, value: zar(q.prorated_zar), strong: true },
                                        { label: 'Effective', value: q.effective === 'immediate' ? 'Immediately' : fmtDate(q.effective) },
                                        { label: 'Next billing date', value: fmtDate(sub.next_charge_at) },
                                    ]}
                                />
                                <Notice tone={q.direction === 'upgrade' ? 'good' : 'warn'} className="mt-3" title={q.direction === 'upgrade' ? 'Upgrade takes effect immediately' : 'Downgrade takes effect next billing date'}>
                                    {q.direction === 'upgrade' ? `You'll have access to ${target.name} features right away.` : `You keep ${sub.plan.name} until ${fmtDate(q.effective)}.`}
                                </Notice>
                                <div className="mt-3">
                                    <PurpleButton onClick={apply} disabled={!active}>
                                        Confirm {q.direction === 'upgrade' ? 'Upgrade' : 'Downgrade'}
                                    </PurpleButton>
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-ink-500">No other plans are available in this family.</p>
                        )}
                    </Card>
                    <HelpCard sub={sub} title="Need Help Deciding?" />
                </div>
            </div>
        </AccountShell>
    );
}

ChangePlan.layout = null;
