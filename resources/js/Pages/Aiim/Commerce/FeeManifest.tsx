import { Link, router } from '@inertiajs/react';
import { Banner, Empty, Flow, FlowSteps, SumBox } from '@/Components/Aiim/ProtoAccount';
import { A, B, Card, useMoney } from '@/Components/Industries/Kit';
import type { AiimPageProps, FeeLine } from '@/types/aiim';

interface Props extends AiimPageProps {
    quote: {
        reference: string; issued: string; validUntil: string; status: string; items: { type: string; key: string; label: string; context?: string }[];
        lines: (FeeLine & { name?: string })[]; subtotal: number; vat: number; total: number; hash: string; order: string | null;
    };
    wallet: number;
}

/** Mock-up 26: Fee Manifest. */
export default function FeeManifest({ quote, wallet }: Props) {
    const money = useMoney();
    const open = quote.status === 'pending';
    const pay = (method: 'checkout' | 'wallet') => router.post(`/aiim/fees/${quote.reference}/checkout`, { method });
    const walletShort = wallet < quote.subtotal;

    return (
        <Flow
            title="Fee Manifest"
            eyebrow="Review before you approve"
            lead="Line items, context, delivery time and VAT."
            crumbs={[{ label: 'Fee Discovery', href: '/aiim/fees/discover' }]}
            steps={<FlowSteps on={1} />}
            side={
                quote.lines.length ? (
                    <>
                        <Card title="Summary"><SumBox lines={quote.lines.map((l) => [l.code, l.amount])} vatAmount={quote.vat} total={quote.total} /></Card>
                        {open ? (
                            <>
                                <B v="pri" block onClick={() => pay('checkout')}>Secure checkout</B>
                                <B block onClick={() => pay('wallet')} disabled={walletShort}>Pay with wallet credits</B>
                                <p className="text-[0.75rem] text-ink-500">Wallet balance {money(wallet)}. Credits are debited the amount before VAT ({money(quote.subtotal)}).{walletShort && <> <Link href="/aiim/wallet" className="font-semibold text-gold-700 underline">Top up</Link></>}</p>
                            </>
                        ) : quote.status === 'paid' ? (
                            <A v="pri" block href={quote.order ? `/aiim/checkout/${quote.order}/success` : '/aiim/workspace/entitlements'}>See what is unlocked</A>
                        ) : (
                            <A v="pri" block href="/aiim/fees/discover">Request a new manifest</A>
                        )}
                        <Banner>Manifest {quote.reference}, issued {quote.issued}, valid until {quote.validUntil}. Version {quote.hash}. Prices are ZAR VAT-exclusive from the TBCA service catalogue.</Banner>
                    </>
                ) : undefined
            }
        >
            {quote.lines.length ? (
                <div className="max-w-full overflow-x-auto rounded-[6px] border border-parchment-400 bg-white">
                    <table className="w-full border-collapse text-[0.8rem]">
                        <thead className="bg-parchment-200 text-left text-[0.7rem] font-bold tracking-wide text-ink-500 uppercase">
                            <tr><th className="px-2.5 py-2">Service</th><th className="px-2.5 py-2">Context</th><th className="px-2.5 py-2">Delivery</th><th className="px-2.5 py-2 text-right">Price</th></tr>
                        </thead>
                        <tbody>
                            {quote.lines.map((l, i) => (
                                <tr key={l.code + i} className="border-t border-parchment-300 align-top">
                                    <td className="px-2.5 py-2"><b className="text-ink-900">{l.name ?? l.label}</b><div className="font-mono text-[0.7rem] text-ink-400">{l.code}</div></td>
                                    <td className="px-2.5 py-2">{l.description}</td>
                                    <td className="px-2.5 py-2">{l.basis}{l.quantity && l.quantity > 1 ? ` × ${l.quantity}` : ''}</td>
                                    <td className="px-2.5 py-2 text-right font-mono font-semibold whitespace-nowrap">{money(l.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <Empty icon="cart">Your manifest is empty. <Link href="/aiim/store" className="text-gold-700 underline">Browse premium briefs</Link>.</Empty>
            )}
            {open && <p className="text-[0.78rem] text-ink-500">This manifest is fixed once issued. To change it, <Link href="/aiim/fees/discover" className="font-semibold text-gold-700 underline">edit your selection</Link> and request a new manifest.</p>}
        </Flow>
    );
}
