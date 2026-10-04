import { Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { Stepper } from '@/Components/ui/Kit';
import { Checkbox } from '@/Components/ui/Form';
import { Box, Chip, Notice } from '@/Components/Insights/Shared';
import { ResourceFrame } from '@/Components/Insights/Resources';
import { usePrice } from '@/lib/money';
import type { ResourceBody, ResourceCard } from '@/types/insights';

interface Props {
    resource: ResourceCard & { meta: { highlights?: string[] } | null; body: ResourceBody };
    blocked: string | null;
    vatRate: number;
}

export default function Checkout({ resource: r, blocked, vatRate }: Props) {
    const price = usePrice();
    const form = useForm({ accept: false });
    const subtotal = r.priceZar ?? 0;
    const vat = Math.round(subtotal * vatRate) / 100;
    const highlights = r.meta?.highlights ?? r.body.get ?? r.body.learn ?? [];

    return (
        <ResourceFrame title={`Checkout – ${r.title}`} crumbs={[{ label: 'Home', href: '/' }, { label: 'Paid Resource', href: r.url }, { label: 'Checkout' }]}>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div><h1 className="flex items-center gap-2 font-serif text-3xl font-bold text-ink-900"><Lock className="size-7 text-gold-600" /> Paid Resource Checkout</h1><p className="text-sm text-ink-600">Secure your download with flexible payment options.</p></div>
                <Stepper className="max-w-md" steps={['Resource Selected', 'Checkout', 'Payment', 'Confirm']} current={2} />
            </div>
            {blocked && <Notice className="mt-4" tone="red">{blocked}</Notice>}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
                <div className="space-y-4">
                    <Box>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="flex h-40 w-full shrink-0 flex-col justify-end rounded bg-gradient-to-br from-ink-900 to-ink-950 p-3 font-serif text-sm font-bold text-gold-400 uppercase sm:w-32">{r.title}</div>
                            <div className="flex-1">
                                <h2 className="font-serif text-xl font-semibold">{r.title}</h2>
                                <p className="mt-1 text-sm text-ink-600">{r.summary}</p>
                                <ul className="mt-3 space-y-1 text-sm">{highlights.map((h) => <li key={h} className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" />{h}</li>)}</ul>
                            </div>
                            <div className="text-right"><p className="text-2xl font-bold">{price(subtotal)}</p>{r.listPriceZar && <p className="text-xs text-ink-400 line-through">{price(r.listPriceZar)}</p>}<Chip tone="green" className="mt-2">Digital Download</Chip></div>
                        </div>
                    </Box>
                    <Box title="Licence & payment">
                        <p className="text-sm text-ink-600">You will complete payment by card, EFT or wallet on our secure payment page. On success the resource is added to your Entitlement Library and the download unlocks immediately.</p>
                        <Checkbox className="mt-3" label="I accept the TBCA Standard Licence (single organisation, no resale) and understand this is general information, not professional advice." checked={form.data.accept} onChange={(e) => form.setData('accept', e.target.checked)} />
                        {form.errors.accept && <p role="alert" className="mt-1 text-xs text-risk-500">{form.errors.accept}</p>}
                    </Box>
                    <Link href={r.url} className="inline-block text-sm font-semibold text-controlled-700">← Back to Resources</Link>
                </div>
                <aside className="space-y-4">
                    <Box title="Order Summary">
                        <dl className="space-y-2 text-sm">
                            <div className="flex justify-between gap-2"><dt>{r.title}</dt><dd>{price(subtotal)}</dd></div>
                            <div className="flex justify-between"><dt>VAT ({vatRate}%)</dt><dd>{price(vat)}</dd></div>
                            <div className="flex justify-between border-t border-parchment-300 pt-2 font-bold"><dt>Total (before platform fees)</dt><dd>{price(subtotal + vat)}</dd></div>
                        </dl>
                        <p className="mt-1 text-[0.6875rem] text-ink-500">Platform and payment-method fees are shown transparently on the payment page.</p>
                        <button type="button" disabled={form.processing || !!blocked} onClick={() => form.post(`/resources/${r.slug}/checkout`)} className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-gold-500 py-3 text-sm font-bold disabled:opacity-50"><Lock className="size-4" /> Pay Securely</button>
                        <p className="mt-2 flex items-center justify-center gap-1 text-xs text-ink-500"><ShieldCheck className="size-4" /> Secure SSL Encrypted Payment</p>
                    </Box>
                    <Box tone="blue"><ul className="space-y-1.5 text-sm">{['100% Secure & Encrypted', 'Instant Access After Payment', 'TBCA Trusted Platform'].map((t) => <li key={t} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-verified-500" />{t}</li>)}</ul></Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
