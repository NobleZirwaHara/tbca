import { Headphones, Info } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import { ReferenceChip } from '@/Components/ui/Kit';
import { SideCard, zar, zar2 } from '@/Components/Shop/Bits';
import type { Order, Totals } from '@/types';

/** Order summary card shared by Payment, Processing and Confirmation. */
export function OrderSummaryCard({ order, totals, title = 'Order Summary', editHref }: { order: Order; totals?: Totals; title?: string; editHref?: string }) {
    const t = totals ?? { subtotal: order.subtotal_zar, vat: order.vat_zar, platform: 0, bank: 0, fees: order.fees_zar, total: order.total_zar };

    return (
        <SideCard title={title} action={editHref ? <a href={editHref} className="text-xs font-semibold text-gold-700 hover:text-gold-800">Edit Order</a> : undefined}>
            <ul className="divide-y divide-parchment-300">
                {(order.items ?? []).map((item) => (
                    <li key={item.id} className="flex justify-between gap-3 py-2 text-[0.8125rem]">
                        <span className="min-w-0">
                            <span className="block font-medium text-ink-900">{item.name}</span>
                            {(item.variant || item.quantity > 1) && (
                                <span className="block text-xs text-ink-500">
                                    {item.variant}
                                    {item.quantity > 1 && ` · Qty ${item.quantity}`}
                                </span>
                            )}
                        </span>
                        <span className="shrink-0 font-semibold text-ink-900">{zar(item.line_zar)}</span>
                    </li>
                ))}
            </ul>
            <dl className="mt-2 space-y-1.5 border-t border-parchment-300 pt-3 text-[0.8125rem]">
                <div className="flex justify-between"><dt className="text-ink-500">Subtotal (Excl. VAT)</dt><dd>{zar(t.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">VAT (15%)</dt><dd>{zar(t.vat)}</dd></div>
                {t.fees > 0 && (
                    <>
                        {t.platform > 0 && <div className="flex justify-between"><dt className="text-ink-500">Platform Charges</dt><dd>{zar(t.platform)}</dd></div>}
                        {t.bank > 0 && <div className="flex justify-between"><dt className="text-ink-500">Bank Charges</dt><dd>{zar(t.bank)}</dd></div>}
                        {t.platform === 0 && t.bank === 0 && <div className="flex justify-between"><dt className="text-ink-500">Fees</dt><dd>{zar(t.fees)}</dd></div>}
                    </>
                )}
            </dl>
            <div className="mt-3 flex items-baseline justify-between border-t border-parchment-300 pt-3">
                <span className="font-semibold text-ink-900">Total (Incl. VAT)</span>
                <span className="text-xl font-bold text-verified-700">{zar(t.total)}</span>
            </div>
        </SideCard>
    );
}

function metaStr(meta: Record<string, unknown> | null | undefined, ...keys: string[]): string | undefined {
    for (const k of keys) {
        const v = meta?.[k];
        if (typeof v === 'string' && v !== '') return v;
        if (typeof v === 'number') return String(v);
    }
    return undefined;
}

/** Dark "Payment Summary" card from the Complete Your Payment design (package, charges, delivery rows). */
export function PaymentSummaryCard({ order, totals }: { order: Order; totals: Totals }) {
    const first = order.items?.[0];
    const meta = { ...(order.meta ?? {}), ...(first?.meta ?? {}) } as Record<string, unknown>;
    const pkg = metaStr(meta, 'package_name', 'package') ?? first?.variant ?? undefined;
    const rows: [string, string][] = [
        ['Delivery', metaStr(meta, 'delivery', 'delivery_time', 'turnaround') ?? 'As per item details'],
        ['Delivery Method', metaStr(meta, 'delivery_method') ?? 'Client Portal'],
        ['Review Type', metaStr(meta, 'review', 'review_type') ?? 'Human Reviewed'],
        ['Currency', 'ZAR (South African Rand)'],
    ];

    return (
        <section className="rounded-[10px] border border-ink-700 bg-ink-950 p-5 text-parchment-100 shadow-raised">
            <h2 className="text-base font-semibold">Payment Summary</h2>
            <div className="mt-3 border-b border-ink-700 pb-3">
                <p className="text-sm font-semibold">{(order.meta?.title as string | undefined) ?? first?.name}</p>
                {pkg && <p className="mt-0.5 text-xs text-parchment-200">{pkg}{(order.items?.length ?? 0) > 1 && ` + ${(order.items?.length ?? 1) - 1} more`}</p>}
                {metaStr(meta, 'description', 'summary') && <p className="mt-1 text-[0.6875rem] text-ink-300">{metaStr(meta, 'description', 'summary')}</p>}
            </div>
            <dl className="mt-3 space-y-1.5 text-[0.8125rem]">
                <div className="flex justify-between"><dt className="text-ink-300">Package Total</dt><dd>{zar(totals.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-300">VAT (15%)</dt><dd>{zar(totals.vat)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-300">Bank Charges</dt><dd>{zar(totals.bank)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-300">Platform Charges</dt><dd>{zar(totals.platform)}</dd></div>
            </dl>
            <p className="mt-3 flex items-baseline justify-between border-y border-ink-700 py-3">
                <span className="font-semibold text-gold-400">Total Due Today</span>
                <span className="text-2xl font-bold text-gold-400">{zar(totals.total)}</span>
            </p>
            <dl className="mt-3 space-y-1.5 text-xs">
                {rows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3"><dt className="text-ink-300">{k}</dt><dd className="text-right">{v}</dd></div>
                ))}
            </dl>
            <p className="mt-3 text-[0.6875rem] text-ink-300">A tax invoice will be issued after successful payment.</p>
        </section>
    );
}

export function AfterPaymentCard() {
    return (
        <SideCard title="What Happens After Payment?">
            <ol className="space-y-3">
                {[
                    ['Payment Confirmation', "We'll confirm your payment instantly."],
                    ['Kickoff Email & Portal Access', "You'll receive access to your client portal."],
                    ['Delivery Begins', 'Our team starts work or your access is activated.'],
                    ['Draft Delivery & Review', 'Receive your outputs for review in the portal.'],
                ].map(([t, b], i) => (
                    <li key={t} className="flex gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-verified-700 text-xs font-bold text-white">{i + 1}</span>
                        <span><span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span><span className="block text-xs text-ink-500">{b}</span></span>
                    </li>
                ))}
            </ol>
        </SideCard>
    );
}

export function OrderReferenceCard({ reference, note = 'You will receive a confirmation email after payment.' }: { reference: string; note?: string }) {
    return (
        <div className="flex gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4">
            <Info className="mt-0.5 size-5 shrink-0 text-controlled-700" aria-hidden="true" />
            <div className="min-w-0">
                <p className="text-[0.8125rem] font-semibold text-ink-900">Order Reference</p>
                <div className="mt-1"><ReferenceChip value={reference} /></div>
                <p className="mt-1.5 text-xs text-ink-500">{note}</p>
            </div>
        </div>
    );
}

export function HelpCard({ body = 'Talk to a TBCA advisor if you need assistance with your payment.' }: { body?: string }) {
    return (
        <SideCard>
            <div className="flex gap-3">
                <Headphones className="mt-0.5 size-5 shrink-0 text-verified-500" aria-hidden="true" />
                <div>
                    <p className="font-semibold text-ink-900">Need Help?</p>
                    <p className="mt-1 text-xs text-ink-500">{body}</p>
                    <button
                        type="button"
                        onClick={() => openAskQuestion({ subject: 'Checkout help', section: 'shop' })}
                        className="mt-3 inline-flex h-9 items-center rounded-[4px] border border-verified-500 px-4 text-[0.8125rem] font-semibold text-verified-700 hover:bg-verified-50"
                    >
                        Talk to TBCA Advisor →
                    </button>
                </div>
            </div>
        </SideCard>
    );
}

export function PortalLink() {
    return (
        <ButtonLink href="/portal" variant="outline" size="sm">
            View Order in Portal
        </ButtonLink>
    );
}

export { zar2 };
