import { router, useForm } from '@inertiajs/react';
import { ArrowRight, Building2, CheckCircle2, CreditCard, Landmark, Lock, LockOpen, ShieldCheck, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Checkbox, ChoiceCard, Field, Input, Textarea } from '@/Components/ui/Form';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import type { Charge, Gate, RoomHeader } from '@/types/deal-room';
import { roomUrl } from '../RoomShell';
import { CheckItem, ChargeTable, Empty, Gauge, KvList, Stat, StatStrip, zar } from '../Ui';

type Range = [number, number];
const range = (r: Range) => `${zar(r[0])} – ${zar(r[1])}`;

export function EstimateScreen({ room, data }: { room: RoomHeader; data: { estimate: { reference: string; expert: Range; platform: Range; external: Range; total: Range; validDays: number }; diagnostic: { readiness: number; complexity: string } } }) {
    const e = data.estimate;
    const cards: [string, Range, string[]][] = [
        ['A. TBCA Expert Fees', e.expert, ['Financial Due Diligence', 'Valuation & Analysis', 'Legal & Transaction Advisory', 'Negotiation Support']],
        ['B. TBCA Platform Fees', e.platform, ['Deal Room & Security', 'AI Agents & RPA', 'Q&A & Reporting', 'Document Management']],
        ['C. External Third-Party Fees', e.external, ['Audit / QoE (External)', 'Legal Counsel', 'Tax Advisory', 'Other Specialists']],
    ];
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-4">
                <Panel title="1. Transaction Snapshot">
                    <KvList rows={[['Deal Type', room.transactionType], ['Estimated Transaction Value', zar(room.amount)], ['Country / Jurisdiction', room.country], ['Sector / Industry', room.sector ?? '—'], ['Complexity Level', data.diagnostic.complexity], ['Readiness', `${data.diagnostic.readiness}%`]]} />
                </Panel>
                <Panel title="2. Preliminary Fee Estimate (Non-Binding Ranges)" className="lg:col-span-3">
                    <div className="grid gap-3 md:grid-cols-3">
                        {cards.map(([t, r, items]) => (
                            <div key={t} className="rounded-[6px] border border-gold-400/60 bg-gold-50/40 p-3">
                                <p className="text-sm font-semibold">{t}</p>
                                <p className="mt-1 text-lg font-bold">{zar(r[0])} –<br />{zar(r[1])}</p>
                                <ul className="mt-2 list-disc pl-4 text-xs text-ink-600">{items.map((i) => <li key={i}>{i}</li>)}</ul>
                                <p className="mt-2 text-[0.6875rem] text-ink-400">Indicative range · Excl. VAT</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 rounded bg-verified-50 p-3 text-sm">Total Estimated Range (All Categories): <strong className="text-lg">{range(e.total)}</strong> <span className="block text-xs text-ink-500">Excludes disbursements, travel, printing, courier and other out-of-pocket costs.</span></p>
                </Panel>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="3. Key Assumptions"><ul className="space-y-1">{['One primary investor process', 'Indicative value band: ZAR 50m – ZAR 250m', 'Standard due diligence scope', `${data.diagnostic.complexity} complexity transaction`, 'Estimate excludes VAT', 'Based on current market benchmarks', `Valid for ${e.validDays} calendar days`].map((a) => <CheckItem key={a} done>{a}</CheckItem>)}</ul></Panel>
                <Panel title="4. Estimate Validity & Next Steps">
                    <KvList rows={[['Estimate ID', e.reference], ['Estimate Type', 'Preliminary (Non-Binding)'], ['Price Basis', 'Market Avg. × 60% (Experts) · Actual Cost + 25% (Third-Party Admin)'], ['Next Step', 'Proceed to Diagnostic, then Formal Quotation']]} />
                    <ButtonLink href={roomUrl(room.slug, 'commercial/formal-quotation')} className="mt-3 w-full">Continue to Formal Quotation <ArrowRight className="size-4" aria-hidden /></ButtonLink>
                </Panel>
                <Panel title="Important Notes & Disclaimers"><ul className="list-disc space-y-1 pl-4 text-xs text-ink-600"><li>This is a preliminary estimate based on the information provided.</li><li>A formal quotation will be issued after the diagnostic and scope confirmation.</li><li>Final fees depend on confirmed scope, transaction complexity, timing and third-party quotes.</li><li>TBCA does not hold client funds or transaction proceeds at any time.</li></ul></Panel>
            </div>
        </div>
    );
}

interface QuoteRow { item: string; basis?: string; net: number; vat: number; total: number }
interface Quote { reference: string; professional: QuoteRow[]; disbursements: QuoteRow[]; professionalTotals: { net: number; vat: number; total: number }; disbursementTotals: { net: number; vat: number; total: number }; grandTotal: number; successFee: number }

export function QuoteScreen({ room, data, commercial }: { room: RoomHeader; data: { quote: Quote }; commercial: Record<string, string | null> }) {
    const q = data.quote;
    const [changes, setChanges] = useState('');
    const decide = (decision: string, note?: string) => router.post(roomUrl(room.slug, 'commercial/quote'), { decision, note }, { preserveScroll: true });
    const accepted = !!commercial.quote_accepted_at;
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. Quotation Summary">
                    <KvList rows={[['Quote Number', q.reference], ['Prepared For', room.company], ['Deal', room.name], ['Transaction Type', room.transactionType], ['Engagement Type', 'Transaction Advisory Mandate'], ['Estimated Transaction Value', zar(room.amount)], ['Pricing Model', 'Success Fee + Retainer + Disbursements'], ['Confidentiality', 'Strict'], ['Status', accepted ? 'Accepted' : commercial.quote_declined_at ? 'Declined' : 'Issued']]} />
                </Panel>
                <Panel title="2. Fees & Disbursements" className="lg:col-span-2">
                    <p className="mb-1 text-xs font-bold uppercase">A. Professional Fees</p>
                    <SimpleTable columns={['Fee Component', 'Basis', 'Amount', 'VAT (15%)', 'Total']} rows={[...q.professional.map((r) => [r.item, r.basis ?? '', zar(r.net), zar(r.vat), zar(r.total)]), [<strong key="a">Total Professional Fees</strong>, '', zar(q.professionalTotals.net), zar(q.professionalTotals.vat), <strong key="b">{zar(q.professionalTotals.total)}</strong>]]} />
                    <p className="mt-3 mb-1 text-xs font-bold uppercase">B. Disbursements (Estimated)</p>
                    <SimpleTable columns={['Item', 'Est. Amount', 'VAT (15%)', 'Total']} rows={[...q.disbursements.map((r) => [r.item, zar(r.net), zar(r.vat), zar(r.total)]), [<strong key="a">Total Disbursements</strong>, zar(q.disbursementTotals.net), zar(q.disbursementTotals.vat), <strong key="b">{zar(q.disbursementTotals.total)}</strong>]]} />
                    <p className="mt-3 flex items-center justify-between rounded border border-parchment-400 p-3"><span className="font-serif text-lg">Grand Total (All-Inclusive)</span><strong className="text-xl">{zar(q.grandTotal)}</strong></p>
                </Panel>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="3. Payment Schedule">
                    <ol className="space-y-2 text-[0.8125rem]">
                        <li><strong>Retainer Fee</strong> — ZAR 300 000 + VAT, payable monthly in advance <StatusPill status="monthly" tone="good" /></li>
                        <li><strong>Disbursements</strong> — at cost + VAT, payable upon invoice <StatusPill status="as incurred" tone="good" /></li>
                        <li><strong>Success Fee</strong> — 2.5% of funds raised + VAT ({zar(q.successFee)}), payable upon financial close, subject to the success-fee legal gate <StatusPill status="upon close" tone="good" /></li>
                    </ol>
                </Panel>
                <Panel title="4. Commercial Terms"><KvList rows={[['Payment Terms', '14 Days from Invoice'], ['Currency', 'ZAR (Primary) / USD (Secondary)'], ['VAT', 'Excluded (Added at 15%)'], ['Governing Law', 'Laws of South Africa'], ['Jurisdiction', 'South African Courts'], ['Acceptance', 'Signed mandate & PO required']]} /></Panel>
                <Panel title="5. Next Steps">
                    {accepted ? (
                        <><p className="text-sm font-semibold text-verified-700">Quotation accepted.</p><ButtonLink href={roomUrl(room.slug, 'commercial/fee-breakdown')} className="mt-3 w-full">Review Fee Breakdown <ArrowRight className="size-4" aria-hidden /></ButtonLink></>
                    ) : (
                        <div className="space-y-2">
                            <Button type="button" className="w-full" onClick={() => decide('accept')}>Accept & Mandate <ArrowRight className="size-4" aria-hidden /></Button>
                            <Field label="Request changes">{(id) => <Textarea id={id} value={changes} onChange={(e) => setChanges(e.target.value)} className="min-h-16" />}</Field>
                            <Button type="button" variant="outline" className="w-full" disabled={!changes} onClick={() => decide('changes', changes)}>Request Changes</Button>
                            <Button type="button" variant="ghost" className="w-full" onClick={() => decide('decline')}>Decline Quotation</Button>
                            {commercial.quote_changes && <p className="text-xs text-ink-500">Changes requested: {commercial.quote_changes}</p>}
                        </div>
                    )}
                </Panel>
            </div>
        </div>
    );
}

interface Fees {
    expert: { workstream: string; market: number; fee: number; saving: number }[];
    platform: { component: string; unit: string; rate: number; qty: string; amount: number; notes: string }[];
    external: { supplier_name: string; supplier: number; transfer: number; approved: number; tax: number; landed: number; margin: number; vat: number; total: number }[];
    totals: { market: number; expert: number; platform: number; external: number; saving: number };
}

export function FeeBreakdownScreen({ room, data, commercial }: { room: RoomHeader; data: { fees: Fees }; commercial: Record<string, string | null> }) {
    const f = data.fees;
    return (
        <div className="space-y-5">
            <Panel title="1. TBCA Expert Fees — benchmarked against verified market averages and applied at 60% (TBCA 60% rule)">
                <SimpleTable columns={['Workstream', 'Benchmark Source', 'Verified Market Average', 'TBCA Fee (60%)', 'Client Saving']} rows={[...f.expert.map((r) => [r.workstream, 'TBCA Benchmark Library', zar(r.market), zar(r.fee), `${r.saving}%`]), [<strong key="t">Total Expert Fees</strong>, '', zar(f.totals.market), <strong key="e">{zar(f.totals.expert)}</strong>, '40%']]} />
            </Panel>
            <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="2. TBCA Platform Fees">
                    <SimpleTable columns={['Platform Component', 'Unit / Measure', 'Unit Rate', 'Quantity / Period', 'Amount']} rows={[...f.platform.map((r) => [<span key="c">{r.component}<span className="block text-[0.6875rem] text-ink-400">{r.notes}</span></span>, r.unit, zar(r.rate), r.qty, zar(r.amount)]), [<strong key="t">Total Platform Fees</strong>, '', '', '', <strong key="p">{zar(f.totals.platform)}</strong>]]} />
                </Panel>
                <Panel title="How Your Fees Are Built">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded border border-parchment-400 p-2"><strong className="block">Expert Fees</strong>Verified Market Average × 60%</div>
                        <div className="rounded border border-parchment-400 p-2"><strong className="block">External Fees</strong>Actual Fully Landed Cost + 25% TBCA Admin Margin (disclosed separately)</div>
                        <div className="rounded border border-parchment-400 p-2"><strong className="block">VAT</strong>Treated separately, as applicable</div>
                    </div>
                    <ul className="mt-3 space-y-1">{['Human finance approval required for all fees', 'External supplier costs may update if quotes change', 'No hidden margins — all fees disclosed upfront', 'Client money control: TBCA does not receive transaction proceeds, escrow balances or investor funds'].map((x) => <CheckItem key={x} done>{x}</CheckItem>)}</ul>
                </Panel>
            </div>
            <Panel title="3. External Third-Party Fees — actual fully landed cost plus a separately disclosed 25% TBCA administration margin">
                <SimpleTable columns={['Supplier / Service', 'Supplier Amount', 'Transfer Cost', 'Approved Disbursement', 'Non-Recoverable Tax', 'Fully Landed Cost', 'TBCA 25% Margin', 'VAT (15%)', 'Total External Charge']} rows={[...f.external.map((r) => [r.supplier_name, zar(r.supplier), zar(r.transfer), zar(r.approved), zar(r.tax), zar(r.landed), zar(r.margin), zar(r.vat), zar(r.total)]), [<strong key="t">Total External Charges</strong>, '', '', '', '', '', '', '', <strong key="x">{zar(f.totals.external)}</strong>]]} />
            </Panel>
            <StatStrip items={[{ label: 'Total Expert Fee', value: zar(f.totals.expert) }, { label: 'Total Platform Fee', value: zar(f.totals.platform) }, { label: 'Total External Charge', value: zar(f.totals.external) }, { label: 'Total Client Saving', value: zar(f.totals.saving), caption: '40% vs market average', tone: 'good' }, { label: 'Benchmark Confidence', value: 'High' }, { label: 'Stage Lock', value: 'Onboarding locked', caption: 'until scope & engagement acceptance' }]} />
            {commercial.fee_ack_at ? (
                <ButtonLink href={roomUrl(room.slug, 'commercial/scope-acceptance')}>Proceed to Scope Acceptance <ArrowRight className="size-4" aria-hidden /></ButtonLink>
            ) : (
                <Button type="button" onClick={() => router.post(roomUrl(room.slug, 'commercial/fee-ack'))}>Acknowledge Fee Breakdown <ArrowRight className="size-4" aria-hidden /></Button>
            )}
        </div>
    );
}

const WORKSTREAMS = [['Transaction Advisory', 'End-to-end fundraising and growth capital raise advisory'], ['Due Diligence', 'Financial, legal, commercial and operational due diligence'], ['Valuation & Strategy', 'Valuation, strategy development and investor positioning'], ['Investor Engagement', 'Investor identification, outreach and relationship management'], ['Documentation', 'Term sheet, information memorandum and legal documentation'], ['Negotiation Support', 'Negotiation strategy and support through to close'], ['Regulatory & Compliance', 'Regulatory filings, legal compliance and governance support'], ['Post-Close Support', 'Handover, integration support and ongoing advisory']];

export function ScopeScreen({ room, data, commercial }: { room: RoomHeader; data: { quote: Quote; fees: Fees['totals'] }; commercial: Record<string, string | null> }) {
    const form = useForm({ signatory: commercial.signatory ?? '', signatory_role: commercial.signatory_role ?? 'CEO & Deal Sponsor', accept: false });
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="1. Scope of Work Summary"><SimpleTable columns={['Workstream', 'Included', 'Summary']} rows={WORKSTREAMS.map(([w, s]) => [w, <span key="i" className="font-semibold text-verified-700">Included</span>, s])} /></Panel>
                <Panel title="2. Deliverables & Outcomes"><SimpleTable columns={['Stage', 'Key Deliverables', 'Target Outcome']} rows={[['Pre-Mandate (A–C)', 'Preliminary estimate, formal quotation, scope acceptance', 'Mandate approval'], ['Mandate & Setup', 'Engagement letter, data room, project plan', 'Project mobilised'], ['Due Diligence', 'Due diligence reports, key findings', 'Risk & opportunity clarity'], ['Offer & Negotiation', 'Term sheet, negotiations, revised terms', 'Heads of terms agreed'], ['Signing & Close', 'Legal docs, signatures, closing checklist', 'Transaction closed'], ['Post-Close', 'Handover pack, integration plan, monitoring', 'Successful transition']]} /></Panel>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="3. Your Commitments"><ul className="space-y-1">{['Timely access to information and key stakeholders', 'Prompt review and feedback on documents', 'Clear decision-making authority and approvals', 'Timely payment of agreed fees and disbursements', 'Compliance with agreed timelines and milestones', 'Confidentiality and data protection compliance'].map((c) => <CheckItem key={c} done>{c}</CheckItem>)}</ul></Panel>
                <Panel title="4. Commercial Summary"><KvList rows={[['Total Expert Fees', zar(data.fees.expert)], ['Total Platform Fees', zar(data.fees.platform)], ['Total External Charges', zar(data.fees.external)], ['Total Disbursements (Estimated)', zar(data.quote.disbursementTotals.net)], ['Grand Total (All-Inclusive)', <strong key="g">{zar(data.quote.grandTotal)}</strong>]]} /></Panel>
                <Panel title="5. Acceptance & Authorisation">
                    {commercial.scope_accepted_at ? (
                        <><p className="text-sm font-semibold text-verified-700">Scope accepted by {commercial.signatory} ({commercial.signatory_role}).</p><ButtonLink href={roomUrl(room.slug, 'commercial/engagement-acceptance')} className="mt-3 w-full">Engagement Acceptance <ArrowRight className="size-4" aria-hidden /></ButtonLink></>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); form.post(roomUrl(room.slug, 'commercial/scope')); }} className="space-y-3">
                            <p className="rounded bg-verified-50 p-2 text-xs">I confirm that I have reviewed and accept the scope of work, deliverables, assumptions and commercial terms as defined.</p>
                            <Field label="Authorised Signatory" required error={form.errors.signatory}>{(id) => <Input id={id} value={form.data.signatory} onChange={(e) => form.setData('signatory', e.target.value)} />}</Field>
                            <Field label="Role" required error={form.errors.signatory_role}>{(id) => <Input id={id} value={form.data.signatory_role} onChange={(e) => form.setData('signatory_role', e.target.value)} />}</Field>
                            <Checkbox label="I accept the scope of work and authorise TBCA to proceed." checked={form.data.accept} onChange={(e) => form.setData('accept', e.target.checked)} />
                            {form.errors.accept && <p role="alert" className="text-xs text-risk-500">{form.errors.accept}</p>}
                            <Button type="submit" className="w-full" disabled={form.processing}>Accept Scope & Authorise Mandate</Button>
                        </form>
                    )}
                </Panel>
            </div>
        </div>
    );
}

export function EngagementScreen({ room, data, commercial }: { room: RoomHeader; data: { quote: Quote; fees: Fees['totals']; deposit: number }; commercial: Record<string, string | null> }) {
    const form = useForm({ accept: false });
    const signed = !!commercial.engagement_signed_at;
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. Parties & Represented Side"><KvList rows={[['Client', room.company], ['Service Provider', 'The Business Clinic.Africa™'], ['Represented Side', 'Sponsor / Company Side'], ['Lead Contact', 'John Dlamini (TBCA)'], ['Sponsor Principal', commercial.signatory ?? '—'], ['Engagement Type', 'Transaction Advisory Mandate'], ['Jurisdiction', room.country], ['Confidentiality', 'Strict']]} /></Panel>
                <Panel title="3. Conflict Clearance, AI Disclosure & Privacy Notice" className="lg:col-span-2">
                    <div className="grid gap-2 sm:grid-cols-3">
                        {[['Conflict Check Cleared', 'No material conflicts identified with client or counterparties.'], ['POPIA / Privacy Notice', 'Client acknowledges POPIA notice and data processing purposes.'], ['Party-Side Designation Confirmed', 'TBCA represents the Sponsor / Company Side.'], ['No Client Money Control', 'TBCA does not hold transaction proceeds, escrow balances or investor funds.'], ['AI Disclosure', 'AI may extract, classify, draft and route but cannot approve legal, tax or valuation conclusions.'], ['Source-Grounded AI / Human Review Required', 'All outputs are source-grounded and human-reviewed.']].map(([t, b]) => (
                            <div key={t} className="rounded border border-parchment-400 p-2 text-xs"><ShieldCheck className="mb-1 size-4 text-verified-700" aria-hidden /><strong className="block">{t}</strong>{b}</div>
                        ))}
                    </div>
                </Panel>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="4. Fee Schedule & Commercial Terms"><KvList rows={[['Total Approved Quote', zar(data.quote.grandTotal)], ['Platform Fees', zar(data.fees.platform)], ['External Charges', zar(data.fees.external)], ['Deposit Required Today', <strong key="d">{zar(data.deposit)}</strong>], ['Payment Terms', 'Deposit before activation'], ['Completion Fee', 'Fixed / Not percentage based'], ['Percentage Success Fee', 'Disabled pending legal gate']]} /></Panel>
                <Panel title="5. Signature Controls & Acceptance">
                    {signed ? (
                        <><p className="text-sm font-semibold text-verified-700">Engagement pack signed. The deposit invoice is active; Stage 0 remains locked until payment is confirmed.</p><ButtonLink href={roomUrl(room.slug, 'commercial/deposit-checkout')} className="mt-3 w-full">Proceed to Deposit Checkout <ArrowRight className="size-4" aria-hidden /></ButtonLink></>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); form.post(roomUrl(room.slug, 'commercial/engagement')); }} className="space-y-3">
                            <SimpleTable columns={['Step', 'Signatory', 'Role', 'Status']} rows={[['1', 'John Dlamini', 'TBCA Deal Advisor', <StatusPill key="1" status="ready" tone="good" />], ['2', commercial.signatory ?? 'Client', 'Client Authorised Signatory', <StatusPill key="2" status="pending" />], ['3', 'Finance Lead', 'Finance Approval', <StatusPill key="3" status="pending" />], ['4', 'Legal Counsel', 'Legal Review', <StatusPill key="4" status="pending" />]]} />
                            <Checkbox label="I confirm that I have reviewed and accept the mandate, disclosures, fees and engagement terms." checked={form.data.accept} onChange={(e) => form.setData('accept', e.target.checked)} />
                            {form.errors.accept && <p role="alert" className="text-xs text-risk-500">{form.errors.accept}</p>}
                            <Button type="submit" className="w-full" disabled={form.processing}>Sign Engagement & Proceed to Deposit Checkout</Button>
                        </form>
                    )}
                </Panel>
            </div>
        </div>
    );
}

export function DepositScreen({ room, data, secure = false }: { room: RoomHeader; data: { charge: Charge | null; quote: string }; secure?: boolean }) {
    const [method, setMethod] = useState('eft');
    const c = data.charge;
    if (!c) return <Empty>The deposit invoice is issued once the engagement pack is signed.</Empty>;
    const pay = () => router.post(roomUrl(room.slug, `charges/${c.id}/pay`), { method });
    return (
        <div className="grid gap-5 lg:grid-cols-3">
            <Panel title="1. Deposit Invoice Summary">
                <KvList rows={[['Invoice ID', c.reference], ['Invoice Date', c.issuedAt], ['Due', c.dueDate ?? 'Immediate'], ['Bill To', room.company], ['Transaction', room.name], ['Charge Type', 'Activation Deposit'], ['Payment Purpose', 'Mandate activation and Stage 0 entitlement'], ['Payment State', <StatusPill key="s" status={c.status} />], ['Quote Linked', data.quote]]} />
                <p className="mt-3 rounded bg-gold-50 p-2 text-xs">This deposit activates onboarding and workspace configuration once cleared funds are reconciled.</p>
            </Panel>
            <Panel title="2. Fee Composition & Charges" className="lg:col-span-2">
                <ChargeTable charge={c} />
                <p className="mt-2 text-xs text-ink-500">The shared checkout adds the R250 platform processing fee and any card bank charge before you authorise. No transaction proceeds are received by TBCA.</p>
            </Panel>
            {secure && (
                <Panel title="3. Gateway Security & Controls">
                    <ul className="space-y-1">{['PCI-DSS Compliant', 'SSL / TLS Encrypted', 'Tokenised Card Data', '3D Secure Challenge', 'Bank-level Encryption', 'Fraud Screening Active', 'POPIA aligned payment handling', 'Source-grounded audit logging'].map((x) => <CheckItem key={x} done>{x}</CheckItem>)}</ul>
                    <p className="mt-2 rounded bg-attested-50 p-2 text-xs">This is a TBCA service payment for advisory and platform fees only. It is not a transaction funds flow.</p>
                </Panel>
            )}
            <Panel title={secure ? '2. Secure Payment' : '3. Payment Method & Next Step'} className={secure ? 'lg:col-span-2' : 'lg:col-span-3'}>
                {c.status === 'paid' ? (
                    <p className="flex items-center gap-2 text-sm font-semibold text-verified-700"><CheckCircle2 className="size-5" aria-hidden /> Paid {c.paidAt}. <a className="underline" href={roomUrl(room.slug, `billing/payment-confirmation?charge=${c.id}`)}>View confirmation</a></p>
                ) : (
                    <>
                        <div role="radiogroup" aria-label="Payment method" className="grid gap-2 sm:grid-cols-3">
                            <ChoiceCard selected={method === 'card'} onSelect={() => setMethod('card')} title="Secure Card Payment" icon={<CreditCard className="size-4" />} />
                            <ChoiceCard selected={method === 'eft'} onSelect={() => setMethod('eft')} title="Instant EFT" description="Recommended" icon={<Zap className="size-4" />} />
                            <ChoiceCard selected={method === 'bank'} onSelect={() => setMethod('bank')} title="Manual Bank Transfer" icon={<Landmark className="size-4" />} />
                        </div>
                        <p className="mt-2 text-xs text-ink-500">You choose the final method on the secure payment page; payer details and VAT number are confirmed there.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {secure ? <Button type="button" onClick={pay}><Lock className="size-4" aria-hidden /> Authorise Secure Payment</Button> : <ButtonLink href={roomUrl(room.slug, `billing/secure-payment?charge=${c.id}`)}>Proceed to Secure Payment <ArrowRight className="size-4" aria-hidden /></ButtonLink>}
                        </div>
                        {c.status === 'failed' && <p className="mt-2 text-xs text-risk-700">Previous attempt failed: {c.failureReason}. <a className="underline" href={roomUrl(room.slug, 'billing/failed-payment')}>Details</a></p>}
                    </>
                )}
            </Panel>
        </div>
    );
}

export function ConfirmationScreen({ room, data, receipt = false }: { room: RoomHeader; data: { charge: Charge | null; payment: { reference: string; method: string; status: string; at: string; order: string } | null }; receipt?: boolean }) {
    const c = data.charge;
    if (!c) return <Empty>No settled payment yet.</Empty>;
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title={receipt ? '1. Invoice & Receipt Summary' : '1. Payment Confirmation Summary'}>
                    <KvList rows={[['Invoice ID', c.reference], ...(receipt ? [['Receipt ID', c.reference.replace('INV', 'RCT')], ['Immutable Document ID', c.reference.replace('INV', 'DOC') + '-IR-001']] as [string, string][] : []), ['Deal', room.name], ['Payer', room.company], ['Amount Paid', zar(c.total)], ['VAT Included', zar(c.vat)], ['Payment Reference', data.payment?.reference ?? '—'], ['Order', data.payment?.order ?? c.order ?? '—'], ['Settlement State', c.paidAt ? 'Settled / Confirmed' : c.status], ['Payment Date', c.paidAt ?? '—'], ['Status', <StatusPill key="s" status={c.status} />]]} />
                </Panel>
                <Panel title={receipt ? '2. Line Items, Tax Codes & Fee Categories' : '2. Paid, Pending and Outstanding Amounts'} className="lg:col-span-2">
                    {receipt ? <ChargeTable charge={c} /> : (
                        <>
                            <div className="grid grid-cols-3 gap-2"><Stat label="Paid Amount" value={zar(c.paidAt ? c.total : 0)} tone="good" /><Stat label="Pending Amount" value={zar(c.status === 'awaiting_payment' ? c.total : 0)} /><Stat label="Outstanding Amount" value={zar(c.paidAt ? 0 : c.total)} /></div>
                            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><Stat label="Net" value={zar(c.net)} /><Stat label="VAT" value={zar(c.vat)} /><Stat label="Refunded" value={zar(c.refunded)} /><Stat label="Total Received" value={zar(c.paidAt ? c.total : 0)} tone="gold" /></div>
                        </>
                    )}
                    <p className="mt-3 rounded bg-verified-50 p-2 text-xs">{c.paidAt ? 'Payment fully allocated and reconciled.' : 'Payment not yet settled.'} TBCA does not hold transaction proceeds, escrow balances or investor funds.</p>
                </Panel>
            </div>
            <Panel title="3. Settlement & Entitlement Status">
                <ul className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
                    <CheckItem done={!!c.paidAt}>Payment authorised</CheckItem><CheckItem done={!!c.paidAt}>Gateway response: success</CheckItem><CheckItem done={!!c.paidAt}>Settlement reconciled</CheckItem><CheckItem done={!!c.paidAt}>Receipt generated</CheckItem>
                    {c.kind === 'deposit' && <><CheckItem done={!!c.paidAt}>Stage 0 entitlement active</CheckItem><CheckItem done={!!c.paidAt}>Deal setup access enabled</CheckItem></>}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                    {c.kind === 'deposit' && <ButtonLink href={roomUrl(room.slug, 'billing/stage-gate-unlock')} size="sm">View Stage-Gate Unlock</ButtonLink>}
                    {!receipt && <ButtonLink href={roomUrl(room.slug, `billing/invoice-and-receipt?charge=${c.id}`)} size="sm" variant="outline">Invoice and Receipt</ButtonLink>}
                    <ButtonLink href={roomUrl(room.slug)} size="sm" variant="outline">Return to Deal</ButtonLink>
                    <Button type="button" size="sm" variant="ghost" onClick={() => window.print()}>Download / Print</Button>
                </div>
            </Panel>
        </div>
    );
}

export function GateUnlockScreen({ room, data }: { room: RoomHeader; data: { deposit: Charge | null; stageC: { status: string; completedAt: string | null }; stage0: string; gate: Gate; refs: Record<string, string> } }) {
    const unlocked = data.stage0 !== 'locked';
    const prereq = [
        ['Signed engagement accepted', 'John Dlamini', data.refs.eng], ['Deposit invoice issued', room.company, data.deposit?.reference ?? '—'], ['Deposit payment authorised', 'Payer Authoriser', data.deposit?.order ?? '—'],
        ['Payment settled and reconciled', 'Finance Approval', data.refs.gate], ['Human review completed', 'John Dlamini', data.refs.rev], ['Commercial entitlement activated', 'System', data.refs.ent],
        ['Audit record created', 'John Dlamini', data.refs.aud], ['Payer identity verified', room.company, data.refs.kyc],
    ];
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. Current Stage & Unlock Outcome">
                    <KvList rows={[['Previous State', 'Locked'], ['Current State', unlocked ? 'Unlocked' : 'Locked'], ['Gate Name', 'Stage 0 Activation Gate'], ['Enabled Stage', 'Stage 0.1 Deal Basics Setup'], ['Triggered By', 'Deposit payment settled and reconciled'], ['Effective Date', data.stageC.completedAt ?? '—'], ['Gate ID', data.refs.gate]]} />
                    <p className={`mt-3 flex items-center gap-2 rounded p-2 text-xs ${unlocked ? 'bg-verified-50 text-verified-700' : 'bg-risk-50 text-risk-700'}`}>{unlocked ? <LockOpen className="size-4" aria-hidden /> : <Lock className="size-4" aria-hidden />}{unlocked ? 'Stage 0 is now unlocked. Commercial, payment, approval and evidence requirements have been satisfied.' : 'Stage 0 remains locked until signed engagement, deposit payment, approvals and evidence are complete.'}</p>
                </Panel>
                <Panel title="2. Mandatory Prerequisites" className="lg:col-span-2">
                    <SimpleTable columns={['Requirement', 'Status', 'Owner', 'Evidence Reference']} rows={prereq.map(([r, o, e]) => [r, <StatusPill key="s" status={unlocked ? 'completed' : 'pending'} />, o, <code key="c" className="text-[0.6875rem]">{e}</code>])} />
                </Panel>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="4. Lock Reason & Release Logic"><p className="text-xs text-ink-600">The next stage remains locked whenever required payment, authority, consent, permission, mandatory evidence or human approval is missing.</p><p className="mt-2 text-sm font-semibold">Release Rule Status: {unlocked ? 'Release condition met' : 'Not met'}</p></Panel>
                <Panel title="5. Newly Enabled Actions">
                    <ul className="grid gap-1 sm:grid-cols-2">{['Open Deal Basics Setup', 'Configure parties and roles', 'Start security setup', 'Enable templates and tools', 'Begin sponsor onboarding preparation', 'Access operational dashboard'].map((a) => <CheckItem key={a} done={unlocked}>{a}</CheckItem>)}</ul>
                    {unlocked && <ButtonLink href={roomUrl(room.slug, 'setup/deal-basics')} className="mt-3"><Building2 className="size-4" aria-hidden /> Open Unlocked Stage</ButtonLink>}
                </Panel>
            </div>
            <div className="flex justify-center"><Gauge value={unlocked ? 100 : 50} label={unlocked ? 'Gate released' : 'Gate pending'} /></div>
        </div>
    );
}
