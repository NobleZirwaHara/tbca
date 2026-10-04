import { Head, Link } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import Logo from '@/Components/Logo';
import { zar2 } from '@/Components/Shop/Bits';
import type { Order } from '@/types';

/** Printable tax invoice / receipt ("Download Receipt (PDF)" via the browser's Save as PDF). */
export default function Receipt({ order, invoice }: { order: Order; invoice: string }) {
    const payment = (order.payments ?? []).filter((p) => p.status === 'succeeded').at(-1);
    const b = order.billing ?? {};
    return (
        <>
            <Head title={`Receipt ${order.reference}`} />
            <div className="container-tbca py-6 print:p-0">
                <div className="mb-4 flex justify-between print:hidden">
                    <Link href={`/checkout/${order.reference}/confirmation`} className="text-sm text-gold-800">← Back to confirmation</Link>
                    <button type="button" onClick={() => window.print()} className="inline-flex h-9 items-center gap-2 rounded-[4px] bg-gold-500 px-4 text-sm font-semibold text-ink-900"><Printer className="size-4" /> Print / Save as PDF</button>
                </div>
                <article className="mx-auto max-w-3xl rounded-[8px] border border-parchment-400 bg-white p-8 print:border-0">
                    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-parchment-300 pb-4">
                        <div className="text-ink-900"><Logo /></div>
                        <div className="text-right text-sm">
                            <p className="text-xl font-bold text-ink-900">{order.status === 'paid' ? 'Tax Invoice / Receipt' : 'Pro-forma Invoice'}</p>
                            <p>Invoice {invoice}</p><p className="font-mono">{order.reference}</p>
                            <p>{new Date(order.paid_at ?? order.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </header>
                    <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                        <div><p className="text-xs font-semibold text-ink-500 uppercase">From</p><p>The Business Clinic.Africa (Pty) Ltd</p><p>5th Floor, Blocktrans Building, Blue Gate Road, Lynnwood Ridge, Pretoria, 0081</p><p>VAT registered · FSP No. 51037</p></div>
                        <div><p className="text-xs font-semibold text-ink-500 uppercase">Billed to</p><p>{b.name}</p>{b.company && <p>{b.company}</p>}<p>{b.email}</p>{b.address && <p>{b.address}</p>}{b.country && <p>{b.country}</p>}</div>
                    </div>
                    <table className="mt-6 w-full text-left text-sm">
                        <thead className="border-b border-parchment-300 text-xs text-ink-500"><tr><th className="py-2">Description</th><th>Qty</th><th className="text-right">Unit (excl. VAT)</th><th className="text-right">Line (excl. VAT)</th></tr></thead>
                        <tbody className="divide-y divide-parchment-300">{(order.items ?? []).map((i) => <tr key={i.id}><td className="py-2">{i.name}{i.variant && <span className="block text-xs text-ink-500">{i.variant} · {i.item_code}</span>}</td><td>{i.quantity}</td><td className="text-right">{zar2(i.unit_zar)}</td><td className="text-right">{zar2(i.line_zar)}</td></tr>)}</tbody>
                    </table>
                    <dl className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
                        <div className="flex justify-between"><dt>Subtotal</dt><dd>{zar2(order.subtotal_zar)}</dd></div>
                        <div className="flex justify-between"><dt>VAT (15%)</dt><dd>{zar2(order.vat_zar)}</dd></div>
                        <div className="flex justify-between"><dt>Platform & bank charges</dt><dd>{zar2(order.fees_zar)}</dd></div>
                        <div className="flex justify-between border-t border-parchment-300 pt-2 text-base font-bold"><dt>Total</dt><dd>{zar2(order.total_zar)}</dd></div>
                    </dl>
                    <p className="mt-6 text-xs text-ink-500">{payment ? `Paid by ${payment.method.toUpperCase()} on ${new Date(payment.created_at).toLocaleString('en-ZA')} · Payment ${payment.reference}` : `Status: ${order.status.replace('_', ' ')}`}. All amounts in ZAR.</p>
                </article>
            </div>
        </>
    );
}
