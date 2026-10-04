import { CheckCircle2, Coins, Handshake, Info, Landmark, ShieldCheck, Users } from 'lucide-react';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { ActTag, zar } from '@/Components/Shop/Bits';
import { cn } from '@/lib/cn';
import type { Order, OrderItem, Totals } from '@/types';

/** Ledger allocation copy by line type (blueprint 9.3 four-ledger composition). */
function ledgerCopy(item: OrderItem) {
    const digital = item.item_type === 'digital-product' || item.item_type === 'report';
    const recurring = item.item_type === 'subscription';
    const quote = item.item_type === 'quote';
    return {
        client: digital ? ['Licensed digital files', 'Exact version & jurisdiction', 'Instant portal access', 'Update notifications'] : recurring ? ['Recurring access', 'Monthly updates', 'Advisor support', 'Cancel anytime'] : quote ? ['Accepted quote scope', 'Agreed deliverables', 'Provider engagement', 'Milestone tracking'] : ['Defined Sprint outcome', 'Bankable deliverables', 'Action plan', 'Portal delivery'],
        provider: quote ? ['Verified provider delivery', 'Professional standards', 'Revision cycles', 'Kick-off support'] : ['Expert analysis', 'Strategic advice', 'Implementation tools', 'Human review'],
        regulatory: ['Legal alignment', 'Tax profile confirmed', 'Risk mitigation', 'Audit readiness'],
        finance: [recurring ? 'Recurring fee (mandate)' : quote ? 'Quoted fee' : 'Fixed fee', 'Cost certainty', 'No hidden charges', 'Tax invoice'],
    };
}

const cards = [
    { key: 'client', title: 'Client Ledger', sub: 'What you receive', icon: Users, tone: 'border-controlled-500/40 bg-controlled-50 text-controlled-700' },
    { key: 'provider', title: 'Provider Ledger', sub: 'TBCA delivers', icon: Handshake, tone: 'border-verified-500/40 bg-verified-50 text-verified-700' },
    { key: 'regulatory', title: 'Regulatory Ledger', sub: 'Compliance & trust', icon: Landmark, tone: 'border-referenced-500/40 bg-referenced-50 text-referenced-700' },
    { key: 'finance', title: 'Finance Ledger', sub: 'Value & pricing', icon: Coins, tone: 'border-attested-500/40 bg-attested-50 text-attested-700' },
] as const;

export default function LedgerReview({ order, totals }: { order: Order; totals: Totals }) {
    const items = order.items ?? [];
    const lead = items[0];
    const copy = lead ? ledgerCopy(lead) : null;
    const act = (lead?.meta?.act as string | undefined) ?? (lead?.item_type === 'digital-product' ? 'A2' : lead?.item_type === 'subscription' ? 'A3' : 'A1');

    // T = TBCA consideration, X = pass-through, S = statutory tax, C = credit (blueprint 9.3).
    const composition = [
        { code: 'T', label: 'TBCA consideration', value: totals.subtotal + totals.platform },
        { code: 'X', label: 'Pass-through (bank)', value: totals.bank },
        { code: 'S', label: 'Tax / statutory (VAT)', value: totals.vat },
        { code: 'C', label: 'Credit / adjustment', value: 0 },
    ];

    return (
        <div className="grid gap-5 lg:grid-cols-12">
            <div className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-4">
                {items.map((item) => (
                    <div key={item.id} className="mb-4 flex gap-3 border-b border-parchment-300 pb-4 last:mb-0 last:border-0 last:pb-0">
                        <ShopIcon name={item.item_type === 'digital-product' ? 'file-text' : item.item_type === 'subscription' ? 'calendar-check' : 'target'} size="md" />
                        <div className="min-w-0">
                            <p className="font-serif text-lg leading-snug font-semibold text-ink-900">{item.name}</p>
                            <div className="mt-1"><ActTag act={act} label={item.variant ?? (act === 'A2' ? 'A2 Digital Product' : act === 'A3' ? 'A3 Subscription' : 'A1 Fixed Sprint')} /></div>
                            <p className="mt-1 text-xs text-ink-500">Code {item.item_code} · Qty {item.quantity}</p>
                        </div>
                    </div>
                ))}
                <dl className="mt-3 space-y-1.5 text-xs text-ink-600">
                    <div><dt className="inline font-semibold text-ink-800">Jurisdiction: </dt><dd className="inline">South Africa</dd></div>
                    <div><dt className="inline font-semibold text-ink-800">Section: </dt><dd className="inline capitalize">{order.section}</dd></div>
                    <div><dt className="inline font-semibold text-ink-800">Currency: </dt><dd className="inline">ZAR (source)</dd></div>
                </dl>
                <div className="mt-4 flex gap-2 rounded-[6px] border border-verified-500/30 bg-verified-50 p-3 text-xs font-medium text-verified-700">
                    <ShieldCheck className="size-4 shrink-0" aria-hidden="true" /> TBCA {act === 'A2' ? 'Digital Product' : act === 'A3' ? 'Subscription' : 'Sprint'} - Fixed Scope, Fixed Price.
                </div>
            </div>

            <div className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-8">
                <h2 className="font-serif text-xl font-semibold text-ink-900">Four-Ledger Allocation</h2>
                {copy && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {cards.map((c) => (
                            <div key={c.key} className={cn('rounded-[8px] border p-3 text-center', c.tone)}>
                                <c.icon className="mx-auto size-7" aria-hidden="true" />
                                <p className="mt-1 font-serif text-base font-semibold">{c.title}</p>
                                <p className="text-xs text-ink-600">{c.sub}</p>
                                <ul className="mt-2 space-y-1 text-left text-xs text-ink-700">
                                    {copy[c.key].map((t) => <li key={t}>✓ {t}</li>)}
                                </ul>
                                <span className="mt-2 inline-block rounded-full bg-white/70 px-3 py-0.5 text-[0.6875rem] font-semibold">Included</span>
                            </div>
                        ))}
                    </div>
                )}
                <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {composition.map((c) => (
                        <div key={c.code} className="rounded-[6px] border border-parchment-400 px-3 py-2">
                            <dt className="text-[0.6875rem] text-ink-500">Ledger {c.code} · {c.label}</dt>
                            <dd className="text-sm font-bold text-ink-900">{zar(c.value)}</dd>
                        </div>
                    ))}
                </dl>
                <div className="mt-4 flex items-start gap-3 rounded-[6px] border border-verified-500/30 bg-verified-50 p-3">
                    <CheckCircle2 className="mt-0.5 size-5 text-verified-500" aria-hidden="true" />
                    <p className="text-sm">
                        <span className="font-semibold text-ink-900">Four-Ledger Ready</span>
                        <span className="block text-xs text-ink-600">Aligned, compliant and value-driven delivery across all TBCA ledgers. T + X + S + C = {zar(totals.total)}.</span>
                    </p>
                </div>
            </div>

            <div className="flex items-start gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4 lg:col-span-12">
                <Info className="mt-0.5 size-5 shrink-0 text-controlled-700" aria-hidden="true" />
                <p className="text-sm text-ink-700">
                    <span className="font-semibold text-controlled-700">Order Confirmation</span>
                    <span className="block text-xs">By placing this order you agree to TBCA's Terms of Service, Sprint Conditions and Delivery Commitments.</span>
                </p>
            </div>
        </div>
    );
}
