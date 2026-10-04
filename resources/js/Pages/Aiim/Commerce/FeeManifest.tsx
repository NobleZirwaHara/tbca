import { Link, useForm } from '@inertiajs/react';
import { Info } from 'lucide-react';
import type { FormEvent } from 'react';
import { StatusPill, ReferenceChip } from '@/Components/ui/Kit';
import { Checkbox } from '@/Components/ui/Form';
import { FeeManifestTable, FeeSummary } from '@/Components/Aiim/FeeTable';
import AiimPage, { DeeperBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Button, ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, FeeLine } from '@/types/aiim';

interface Props extends AiimPageProps {
    quote: { reference: string; issued: string; validUntil: string; daysLeft: number; status: string; items: { type: string; key: string; label: string }[]; lines: FeeLine[]; subtotal: number; vat: number; total: number; hash: string; order: string | null };
}

export default function FeeManifest({ quote }: Props) {
    const form = useForm({ accept: false });
    const submit = (e: FormEvent) => { e.preventDefault(); form.post(`/aiim/fees/${quote.reference}/checkout`); };
    const open = quote.status === 'pending';
    return (
        <AiimPage
            title="Fee Manifest"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Fee Discovery', href: '/aiim/fees/discover' }, { label: 'Fee Manifest' }]}
            subtitle="Transparent, itemised fees for your selected intelligence and outputs."
            description="Review the full fee breakdown before you pay."
            rail={<><SelectionBox /><DeeperBox /></>}
        >
            <section className="mb-4 grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 text-xs sm:grid-cols-3 lg:grid-cols-7">
                <div className="lg:col-span-2"><p className="text-ink-500">Quote ID</p><ReferenceChip value={quote.reference} /></div>
                <div><p className="text-ink-500">Date Issued</p><p className="font-semibold">{quote.issued}</p></div>
                <div><p className="text-ink-500">Valid Until</p><p className="font-semibold text-gold-700">{quote.validUntil} ({quote.daysLeft} days)</p></div>
                <div><p className="text-ink-500">Scope</p><p className="font-semibold">{quote.items.length} items selected</p></div>
                <div><p className="text-ink-500">Payment Trigger</p><p className="font-semibold">On payment</p></div>
                <div><p className="text-ink-500">Payment Status</p><StatusPill status={quote.status} /></div>
            </section>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
                <section className="min-w-0 rounded-[8px] border border-parchment-400 bg-white">
                    <h2 className="border-b border-parchment-400 px-4 py-2.5 text-sm font-semibold">Fee Breakdown by Category</h2>
                    <FeeManifestTable lines={quote.lines} subtotal={quote.subtotal} vat={quote.vat} total={quote.total} />
                    <p className="flex items-center gap-1.5 px-4 py-2 text-xs text-ink-500"><Info className="size-3.5" />All fees are shown in ZAR. VAT is calculated at 15%. Version hash {quote.hash}. The shared checkout adds the disclosed platform and bank charges before payment.</p>
                    <div className="border-t border-parchment-300 px-4 py-3 text-xs">
                        <p className="mb-1 font-semibold">Items in scope</p>
                        <ul className="list-disc pl-5">{quote.items.map((i) => <li key={i.key}>{i.label} <span className="text-ink-400">({i.type})</span></li>)}</ul>
                    </div>
                </section>
                <div className="space-y-4">
                    <SectionCard dark title="Payment Summary"><div className="rounded bg-white p-2 text-ink-900"><FeeSummary lines={[]} subtotal={quote.subtotal} vat={quote.vat} total={quote.total} /></div></SectionCard>
                    <SectionCard title="What Happens Next?">
                        <ol className="space-y-2 text-xs">{[['Proceed to Secure Checkout', 'Complete payment securely online.'], ['Instant Confirmation', 'Receive your order confirmation.'], ['Entitlement Unlock', 'Access your purchased intelligence and outputs.']].map(([t, d], i) => <li key={t} className="flex gap-2"><span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-ink-900 text-[0.65rem] font-bold">{i + 1}</span><span><strong className="block">{t}</strong>{d}</span></li>)}</ol>
                    </SectionCard>
                    {open ? (
                        <form onSubmit={submit} className="space-y-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h3 className="text-sm font-semibold">Terms & Conditions</h3>
                            <Checkbox checked={form.data.accept} onChange={(e) => form.setData('accept', e.target.checked)} label={<>I accept the <Link href="/legal/terms" className="text-gold-700 underline">Terms of Use</Link>, <Link href="/legal/privacy" className="text-gold-700 underline">Privacy Policy</Link> and <Link href="/legal/refunds" className="text-gold-700 underline">Refund Policy</Link>.</>} />
                            {form.errors.accept && <p role="alert" className="text-xs text-risk-500">{form.errors.accept}</p>}
                            <Button type="submit" disabled={form.processing} className="w-full" trailingIcon="arrow-right">Proceed to Secure Checkout</Button>
                        </form>
                    ) : (
                        <SectionCard><p className="text-sm">{quote.status === 'paid' ? 'This quote has been paid.' : 'This quote has expired. Request a new manifest from Fee Discovery.'}</p></SectionCard>
                    )}
                </div>
            </div>
            <ButtonLink href="/aiim/fees/discover" variant="outline" className="mt-4">Back to Fee Discovery</ButtonLink>
        </AiimPage>
    );
}
