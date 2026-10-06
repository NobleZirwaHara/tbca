import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { StatusPill } from '@/Components/ui/Kit';
import { formatZar } from '@/lib/money';

interface Props {
    invoice: {
        number: string;
        reference: string;
        date: string;
        due: string;
        status: string;
        title: string;
        billing: { name: string; company: string; email: string; vat: string | null; address: string | null };
        lines: { name: string; code: string; qty: number; unit: number; total: number }[];
        subtotal: number;
        vat: number;
        fees: number;
        total: number;
        payments: { reference: string; method: string; amount: number; status: string; date: string }[];
        payable: boolean;
    };
}

/** Printable tax invoice generated from an order (CP-SCR-028). Invoices are always shown in ZAR. */
export default function Invoice({ invoice: i }: Props) {
    return (
        <div className="min-h-screen bg-parchment-200 px-4 py-6 print:bg-white print:p-0">
            <Head title={`Invoice ${i.number}`} />
            <div className="mx-auto mb-4 flex max-w-3xl flex-wrap items-center justify-between gap-2 print:hidden">
                <Link href="/portal/invoices" className="inline-flex items-center gap-1.5 text-sm font-semibold text-controlled-700 hover:underline">
                    <ArrowLeft className="size-4" aria-hidden="true" /> Back to Invoices & Payments
                </Link>
                <div className="flex gap-2">
                    {i.payable && (
                        <Link href={`/checkout/${i.reference}`} className="rounded-[4px] bg-gold-500 px-3 py-2 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                            Pay Now
                        </Link>
                    )}
                    <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-[4px] border border-ink-300 bg-white px-3 py-2 text-sm font-medium">
                        <Printer className="size-4" aria-hidden="true" /> Print / Save as PDF
                    </button>
                </div>
            </div>

            <article className="mx-auto max-w-3xl rounded-[8px] border border-parchment-400 bg-white p-6 shadow-sm sm:p-10 print:border-0 print:shadow-none">
                <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-gold-500 pb-5">
                    <div>
                        <p className="font-serif text-xl font-bold text-ink-900">The Business Clinic.Africa™</p>
                        <p className="text-xs text-ink-500">5th Floor, Blocktrax Building, Blue Gate Road, Lynnwood Ridge, Pretoria, 0081</p>
                        <p className="text-xs text-ink-500">Consult@thebusinessclinic.africa · +27 60 801 1365</p>
                    </div>
                    <div className="text-right">
                        <h1 className="font-serif text-2xl font-bold text-ink-900">TAX INVOICE</h1>
                        <p className="font-mono text-sm">{i.number}</p>
                        <div className="mt-1">
                            <StatusPill status={i.status} />
                        </div>
                    </div>
                </header>

                <section className="grid gap-4 py-5 text-sm sm:grid-cols-2">
                    <div>
                        <p className="text-xs font-bold tracking-wide text-ink-500 uppercase">Bill To</p>
                        <p className="font-semibold text-ink-900">{i.billing.company}</p>
                        <p>{i.billing.name}</p>
                        <p>{i.billing.email}</p>
                        {i.billing.address && <p>{i.billing.address}</p>}
                        {i.billing.vat && <p>VAT No. {i.billing.vat}</p>}
                    </div>
                    <dl className="grid grid-cols-2 gap-1 sm:text-right">
                        <dt className="text-ink-500">Invoice date</dt>
                        <dd>{i.date}</dd>
                        <dt className="text-ink-500">Due date</dt>
                        <dd>{i.due}</dd>
                        <dt className="text-ink-500">Order reference</dt>
                        <dd className="font-mono text-xs">{i.reference}</dd>
                    </dl>
                </section>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b border-parchment-400 text-left text-xs text-ink-500">
                            <tr>
                                <th className="py-2">Description</th>
                                <th className="py-2 text-right">Qty</th>
                                <th className="py-2 text-right">Unit (ZAR)</th>
                                <th className="py-2 text-right">Amount (ZAR)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-parchment-300">
                            {i.lines.map((l) => (
                                <tr key={l.code}>
                                    <td className="py-2">
                                        {l.name}
                                        <span className="block font-mono text-[0.6875rem] text-ink-400">{l.code}</span>
                                    </td>
                                    <td className="py-2 text-right">{l.qty}</td>
                                    <td className="py-2 text-right">{formatZar(l.unit)}</td>
                                    <td className="py-2 text-right">{formatZar(l.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <dl className="ml-auto mt-4 grid max-w-xs grid-cols-2 gap-1 text-sm">
                    <dt className="text-ink-500">Subtotal</dt>
                    <dd className="text-right">{formatZar(i.subtotal)}</dd>
                    <dt className="text-ink-500">VAT (15%)</dt>
                    <dd className="text-right">{formatZar(i.vat)}</dd>
                    <dt className="text-ink-500">Platform & bank fees</dt>
                    <dd className="text-right">{formatZar(i.fees)}</dd>
                    <dt className="border-t border-ink-900 pt-1 font-bold">Total due</dt>
                    <dd className="border-t border-ink-900 pt-1 text-right font-bold">{formatZar(i.total)}</dd>
                </dl>

                {i.payments.length > 0 && (
                    <section className="mt-6">
                        <p className="text-xs font-bold tracking-wide text-ink-500 uppercase">Payments</p>
                        <ul className="mt-1 text-sm">
                            {i.payments.map((p) => (
                                <li key={p.reference} className="flex justify-between border-b border-parchment-300 py-1">
                                    <span>
                                        {p.date} · {p.method} · <span className="font-mono text-xs">{p.reference}</span>
                                    </span>
                                    <span>
                                        {formatZar(p.amount)} <StatusPill status={p.status} />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <footer className="mt-8 border-t border-parchment-400 pt-4 text-xs text-ink-500">
                    <p>Banking details: The Business Clinic.Africa (Pty) Ltd · FNB · Account 62345678901 · Branch 250655 · Reference {i.number}</p>
                    <p className="mt-1">Amounts are in South African Rand. This invoice is generated from the authoritative order record; no second journal is kept in the Client Portal.</p>
                </footer>
            </article>
        </div>
    );
}

Invoice.layout = null;
