import { useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, FileCheck, Lock, ShieldCheck, UserCheck, XCircle } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Checkbox } from '@/Components/ui/Form';
import QuoteShell from '@/Components/DueDiligence/QuoteShell';
import { Card, rand } from '@/Components/DueDiligence/Ui';
import type { DdQuotePageProps } from '@/types/due-diligence';

interface Props extends DdQuotePageProps {
    included: string[];
    notIncluded: string[];
}

/** DD-026 Engagement or Order Review. */
export default function Review(props: Props) {
    const { quote, sku, notIncluded } = props;
    const m = quote.manifest ?? props.price;
    const form = useForm({ accept_terms: quote.engagedAt !== null });
    const tolerance = rand(quote.externalTolerance);
    const Rows = ({ rows }: { rows: [string, string][] }) => (
        <dl className="divide-y divide-parchment-300 text-[0.8125rem]">{rows.map(([k, v]) => <div key={k} className="grid grid-cols-2 gap-3 py-1.5"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
    );

    return (
        <QuoteShell
            page={props}
            title="Engagement or Order Review"
            subtitle="Confirm your engagement terms, scope, fees and conditions before we proceed."
            description="Review all details carefully. By accepting below, you authorise TBCA to commence the agreed due diligence services in accordance with the scope, terms and conditions."
            current={2}
            lifecycle="C"
            publicStage="2 Consent & Payment"
            hidePrice
            next="After acceptance, you will be redirected to secure checkout to complete payment."
            aside={
                <>
                    <Card title="2. Fee Manifest (ex VAT)">
                        <Rows rows={[['TBCA Expert Fee', rand(m.expert, 2)], ['TBCA Platform Fee', rand(m.platform, 2)], ['External Third-Party Costs*', rand(m.external + m.margin, 2)], ['Payment Handling Fee', rand(m.handling, 2)], ['VAT (15%)', rand(m.vat, 2)], ['Estimated Total (incl. VAT)', rand(m.total, 2)]]} />
                        <p className="mt-2 text-[0.6875rem] text-ink-500">* External costs are not yet charged. You will approve actual landed cost before payment.</p>
                    </Card>
                    <div className="flex gap-2 rounded-[8px] border border-attested-500/30 bg-attested-50 p-3 text-xs text-ink-700"><AlertCircle className="size-4 shrink-0 text-attested-600" aria-hidden="true" />We will not start any screening until payment is successful and all gates are cleared.</div>
                    <Button type="button" size="lg" className="w-full" disabled={!form.data.accept_terms || form.processing} onClick={() => form.post(`/due-diligence/quotes/${quote.reference}/review`)}><Lock className="size-4" aria-hidden="true" /> Proceed to Secure Checkout</Button>
                    <ButtonLink href={`/due-diligence/quotes/${quote.reference}/manifest`} variant="outline" className="w-full">Return to Quote</ButtonLink>
                </>
            }
        >
            <div className="grid gap-4 xl:grid-cols-2">
                <Card title="1. Scope and Deliverables">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="mb-2 text-xs font-semibold">Included in this engagement</p>
                            <ul className="space-y-1">{[sku.name, ...sku.included.split(/,\s*(?![^()]*\))/).map((x) => x.replace(/\.$/, '').replace(/^and /, '')), 'Secure portal access and evidence log'].map((t) => <li key={t} className="flex gap-1.5 text-xs"><CheckCircle2 className="size-3.5 shrink-0 text-verified-500" aria-hidden="true" />{t}</li>)}</ul>
                        </div>
                        <div>
                            <p className="mb-2 text-xs font-semibold">Exclusions (not included)</p>
                            <ul className="space-y-1">{notIncluded.slice(0, 5).map((t) => <li key={t} className="flex gap-1.5 text-xs"><XCircle className="size-3.5 shrink-0 text-risk-500" aria-hidden="true" />{t}</li>)}</ul>
                        </div>
                    </div>
                    <div className="mt-4">
                        <p className="mb-1 text-xs font-semibold">SLA and Timelines</p>
                        <Rows rows={[['Estimated Turnaround', m.turnaround], ['Report Delivery', 'Secure portal (PDF)'], ['Access Period', '90 days from delivery'], ['Re-run Policy', 'New quote if scope changes'], ['Data Retention', '12 months (then purged)']]} />
                    </div>
                </Card>
                <div className="space-y-4">
                    <Card title="3. Payer and Payment">
                        <Rows rows={[['Payer', quote.payerName ?? '—'], ['Cost Responsibility', 'Payer at time of order'], ['Payment Terms', '100% upfront before screening'], ['Currency', 'ZAR (ex VAT) | FX Ref: USD 18.00'], ['Payment Methods', 'Card, EFT, Wallet via Secure Checkout']]} />
                    </Card>
                    <Card title="4. Cancellation, Refund and External-Cost Rules">
                        <Rows rows={[['Cancellation Window', 'Before screening starts'], ['Cancellation Fee', '10% of TBCA Expert Fee'], ['Refund Rule', 'Pro-rata for work not yet performed'], ['External Costs', 'Not yet charged. Requires your approval'], ['External Cost Tolerance', `Up to ${tolerance} without re-approval`], ['Re-Approval Trigger', 'If any external item exceeds tolerance'], ['Change of Scope', 'New quote required']]} />
                    </Card>
                    <Card title="5. Legal and Acceptance">
                        <Rows rows={[['Terms & Conditions', 'v2.7'], ['Privacy Notice', 'v2.5'], ['Data Processing Addendum', 'v2.3'], ['Governing Law', 'Republic of South Africa'], ['Dispute Resolution', 'Arbitration – Cape Town']]} />
                        <div className="mt-3">
                            <Checkbox label="I confirm I have read and agree to the Terms, Privacy Notice and DPA." checked={form.data.accept_terms} onChange={(e) => form.setData('accept_terms', e.target.checked)} />
                            {form.errors.accept_terms && <p className="mt-1 text-xs text-risk-500">{form.errors.accept_terms}</p>}
                        </div>
                    </Card>
                </div>
            </div>
            <Card title="By accepting, you confirm:">
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[[UserCheck, 'You are authorised to act for the payer and on behalf of the organisation.'], [ShieldCheck, 'The purpose and consent have been recorded and remain valid for this engagement.'], [FileCheck, 'All information provided is true, complete and not misleading.'], [CheckCircle2, 'You accept the scope, fees, terms, cancellation and refund rules.']].map(([I, t]) => {
                        const Icon = I as typeof UserCheck;
                        return <li key={t as string} className="flex gap-2 text-xs text-ink-700"><Icon className="size-5 shrink-0 text-gold-600" aria-hidden="true" />{t as string}</li>;
                    })}
                </ul>
            </Card>
        </QuoteShell>
    );
}
