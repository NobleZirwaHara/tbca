import { useForm } from '@inertiajs/react';
import { BadgeCheck } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Field, Input, Select } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import QuoteShell from '@/Components/DueDiligence/QuoteShell';
import { Card, ReferenceStrip, rand, shortDate } from '@/Components/DueDiligence/Ui';
import type { DdFeeLine, DdQuotePageProps } from '@/types/due-diligence';

const CATS: { key: DdFeeLine['category'] | 'tax'; title: string }[] = [
    { key: 'expert', title: 'TBCA Expert Fee' },
    { key: 'platform', title: 'TBCA Platform Fee' },
    { key: 'external', title: 'External Third Party (Actual Costs)' },
    { key: 'tax', title: 'Tax / Payment / Admin' },
];

/** DD-024 Scope, Quotation and Fee Manifest (G4 acceptance). */
export default function Manifest(props: Props) {
    const { quote, price } = props;
    const accepted = quote.acceptedAt !== null;
    const m = accepted && quote.manifest ? quote.manifest : price;
    const form = useForm({
        external_tolerance: String(quote.externalTolerance ?? 25000),
        payer_name: quote.payerName ?? '',
        accepted_by: quote.acceptedBy ?? 'Authorised Signatory',
        confirm: false,
    });
    const vatOf = (n: number) => Math.round(n * 0.15 * 100) / 100;
    const taxLines = [
        { no: m.lines.length + 1, item: 'VAT (15%)', code: 'DD-VAT-15', description: 'Value Added Tax at 15%', trigger: 'On acceptance', price: 0, vatAmount: m.vat, total: m.vat, status: 'Calculated', refund: 'N/A', recognition: 'On acceptance' },
        { no: m.lines.length + 2, item: 'Payment Handling Fee', code: 'DD-PAY-HAND', description: 'Secure payment processing (platform + bank charge)', trigger: 'On payment', price: m.handling, vatAmount: 0, total: m.handling, status: 'Board-Provisional', refund: 'No refund after payment', recognition: 'Payment' },
    ];

    return (
        <QuoteShell
            page={props}
            title="Your Itemised Due Diligence Fee Manifest"
            subtitle="Every charge has a code, trigger, payer, refund rule and recognition point."
            description="Review the exact scope, fees, estimates and terms before you accept."
            current={1}
            lifecycle="B/C"
            publicStage="1 Product or Proposal"
            hidePrice
            next="Accept this quote to proceed to consent and onboarding."
            aside={
                <>
                    <Card title="Approval & Acceptance">
                        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); form.post(`/due-diligence/quotes/${quote.reference}/manifest`, { preserveScroll: true }); }}>
                            <Field label="External Cost Tolerance" hint="External costs above this need your re-approval (G4)." error={form.errors.external_tolerance}>
                                {(id) => <Select id={id} value={form.data.external_tolerance} onChange={(e) => form.setData('external_tolerance', e.target.value)} options={[{ value: '10000', label: `Up to ${rand(10000)} without re-approval` }, { value: '25000', label: `Up to ${rand(25000)} without re-approval` }, { value: '50000', label: `Up to ${rand(50000)} without re-approval` }]} />}
                            </Field>
                            <Field label="Payer Confirmation" error={form.errors.payer_name} required>{(id) => <Input id={id} value={form.data.payer_name} onChange={(e) => form.setData('payer_name', e.target.value)} />}</Field>
                            <Field label="Acceptance by" error={form.errors.accepted_by}>{(id) => <Select id={id} value={form.data.accepted_by} onChange={(e) => form.setData('accepted_by', e.target.value)} options={['Authorised Signatory', 'Account Owner', 'Procurement Officer']} />}</Field>
                            <Checkbox label="I confirm the scope, fees and terms are understood and accepted." checked={form.data.confirm} onChange={(e) => form.setData('confirm', e.target.checked)} />
                            {form.errors.confirm && <p className="text-xs text-risk-500">{form.errors.confirm}</p>}
                            <Button type="submit" className="w-full" trailingIcon="arrow-right" disabled={form.processing}>{accepted ? 'Re-confirm & Continue' : 'Continue / Accept Scope'}</Button>
                        </form>
                    </Card>
                    <Card title="Price Summary (ex VAT)">
                        <dl className="space-y-1 text-[0.8125rem]">
                            {[['TBCA Expert Fee', m.expert], ['TBCA Platform Fee', m.platform], ['External Third Party (Est.)', m.external + m.margin], ['Payment Handling Fee', m.handling]].map(([k, v]) => <div key={k as string} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd>{rand(v as number, 2)}</dd></div>)}
                            <div className="flex justify-between border-t border-parchment-300 pt-1 font-bold"><dt>Subtotal (ex VAT)</dt><dd>{rand(m.subtotal + m.handling, 2)}</dd></div>
                            <div className="flex justify-between"><dt className="text-ink-500">VAT (15%)</dt><dd>{rand(m.vat, 2)}</dd></div>
                            <div className="flex justify-between rounded bg-gold-50 px-2 py-1 font-bold"><dt>Estimated Total (incl. VAT)</dt><dd>{rand(m.total, 2)}</dd></div>
                        </dl>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">* External costs are not yet charged. You will approve actual landed cost before payment.</p>
                        <p className="mt-1 flex items-center gap-1 text-[0.6875rem] text-verified-700"><BadgeCheck className="size-3.5" aria-hidden="true" />No hidden fees. Full transparency guaranteed.</p>
                    </Card>
                    <Button type="button" variant="outline" className="w-full" onClick={() => openAskQuestion({ subject: `Quote ${quote.reference}`, section: 'due-diligence' })}>Request Human Assistance</Button>
                </>
            }
        >
            <ReferenceStrip
                items={[
                    ['Quote ID', quote.reference],
                    ['Quote Date', shortDate(quote.acceptedAt ?? quote.createdAt)],
                    ['Valid Until', quote.validUntil ? `${shortDate(quote.validUntil)} (30 days)` : '30 days from acceptance'],
                    ['Price Version', quote.priceVersion ?? 'Issued on acceptance'],
                    ['Scope Hash', quote.scopeHash ?? 'Issued on acceptance'],
                    ['Quote Status', accepted ? 'Accepted' : 'Board-Provisional'],
                    ['Currency', 'ZAR (ex VAT) · FX Ref: USD 18.00'],
                    ['Payer', quote.payerName ?? '—'],
                ]}
            />
            <div className="overflow-x-auto rounded-[10px] border border-parchment-400 bg-white">
                <table className="w-full min-w-[980px] text-left text-xs">
                    <thead className="bg-ink-950 text-parchment-100">
                        <tr>{['#', 'Fee Category / Item', 'Fee Code', 'Description', 'Trigger', 'Payer', 'Price (ex VAT)', 'VAT', 'Total (incl. VAT)', 'Status', 'Refund Rule', 'Recognition Point'].map((h) => <th key={h} className="px-2 py-2 font-semibold">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        {CATS.map((cat, ci) => {
                            const lines = cat.key === 'tax' ? taxLines : m.lines.filter((l) => l.category === cat.key);
                            if (!lines.length) return null;
                            const sub = cat.key === 'tax' ? m.handling : lines.reduce((s, l) => s + l.price, 0);
                            const subTotal = cat.key === 'tax' ? m.vat + m.handling : lines.reduce((s, l) => s + l.price + vatOf(l.price), 0);
                            return [
                                <tr key={cat.key} className="bg-parchment-200"><td colSpan={12} className="px-2 py-1.5 text-[0.8125rem] font-bold text-ink-900">{cat.title}</td></tr>,
                                ...lines.map((l, li) => {
                                    const isTax = 'vatAmount' in l;
                                    const vat = isTax ? (l as (typeof taxLines)[number]).vatAmount : vatOf(l.price);
                                    return (
                                        <tr key={l.code + li} className="border-t border-parchment-300">
                                            <td className="px-2 py-2">{ci + 1}.{li + 1}</td>
                                            <td className="px-2 py-2 font-medium">{l.item}</td>
                                            <td className="px-2 py-2 font-mono">{l.code}</td>
                                            <td className="px-2 py-2 text-ink-600">{l.description}</td>
                                            <td className="px-2 py-2">{l.trigger}</td>
                                            <td className="px-2 py-2">Client</td>
                                            <td className="px-2 py-2 whitespace-nowrap">{l.price ? rand(l.price, 2) : '—'}</td>
                                            <td className="px-2 py-2">{isTax ? (l.item.startsWith('VAT') ? '15%' : '—') : '15%'}</td>
                                            <td className="px-2 py-2 whitespace-nowrap">{rand(isTax ? (l as (typeof taxLines)[number]).total : l.price + vat, 2)}</td>
                                            <td className="px-2 py-2"><span className={l.status === 'Estimate' ? 'rounded bg-controlled-50 px-1.5 py-0.5 text-controlled-700' : 'rounded bg-verified-50 px-1.5 py-0.5 text-verified-700'}>{l.status}</span></td>
                                            <td className="px-2 py-2">{l.refund}</td>
                                            <td className="px-2 py-2">{l.recognition}</td>
                                        </tr>
                                    );
                                }),
                                <tr key={cat.key + '-sub'} className="border-t border-parchment-300 font-semibold"><td colSpan={6} className="px-2 py-1.5 text-right">{cat.title.split(' (')[0]} Subtotal{cat.key === 'external' ? ' (Est.)' : ''}</td><td className="px-2 py-1.5">{rand(sub, 2)}</td><td /><td className="px-2 py-1.5">{rand(subTotal, 2)}</td><td colSpan={3} /></tr>,
                            ];
                        })}
                        <tr className="border-t-2 border-gold-400 bg-gold-50 text-[0.8125rem] font-bold"><td colSpan={6} className="px-2 py-2">TOTAL</td><td className="px-2 py-2">{rand(m.subtotal + m.handling, 2)}</td><td className="px-2 py-2">{rand(m.vat, 2)}</td><td className="px-2 py-2">{rand(m.total, 2)}</td><td colSpan={3} /></tr>
                    </tbody>
                </table>
            </div>
            <p className="text-[0.6875rem] text-ink-500">Four persistent fee categories are never combined: TBCA Expert, TBCA Platform, External Third Party and Tax/Payment. Changing scope after acceptance withdraws the acceptance and requires a fresh one (G9).</p>
        </QuoteShell>
    );
}

type Props = DdQuotePageProps;
