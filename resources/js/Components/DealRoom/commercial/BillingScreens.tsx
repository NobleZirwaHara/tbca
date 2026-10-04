import { router, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, CreditCard, PauseCircle, PlayCircle, RefreshCw } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { Charge, CommercialRequestRow, RoomHeader, UsageSummary } from '@/types/deal-room';
import { roomUrl } from '../RoomShell';
import { ApprovalList, Bar, ChargeTable, CheckItem, Empty, Gauge, KvList, Stat, StatStrip, zar } from '../Ui';

const payCharge = (slug: string, c: Charge, back: string) => router.post(roomUrl(slug, `charges/${c.id}/pay`), { return: roomUrl(slug, back) });

/** Requests with their named approvals, outcome and any resulting invoice. */
export function RequestList({ room, requests, back, render }: { room: RoomHeader; requests: CommercialRequestRow[]; back: string; render?: (r: CommercialRequestRow) => React.ReactNode }) {
    const { auth } = usePage<SharedProps>().props;
    if (!requests.length) return <Empty>No requests yet.</Empty>;
    return (
        <ul className="space-y-4">
            {requests.map((r) => (
                <li key={r.id} className="rounded-[6px] border border-parchment-400 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <code className="text-xs font-semibold">{r.reference}</code>
                        <StatusPill status={r.status} />
                        <span className="text-xs text-ink-500">by {r.raisedBy} · {r.createdAt}</span>
                        {r.amount > 0 && <strong className="ml-auto text-sm">{zar(r.amount)}</strong>}
                    </div>
                    {render?.(r)}
                    {r.resolution && <p className="mt-2 rounded bg-parchment-200 p-2 text-xs">{r.resolution}</p>}
                    <div className="mt-2"><ApprovalList slug={room.slug} approvals={r.approvals} isAdmin={auth.user?.role === 'admin'} isOwner={room.role === 'owner'} /></div>
                    {r.charge && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 rounded bg-parchment-100 p-2 text-xs">
                            Invoice {r.charge.reference} · {zar(r.charge.total)} · <StatusPill status={r.charge.status} />
                            {!['paid', 'refunded', 'partially_refunded'].includes(r.charge.status) && <Button type="button" size="sm" className="ml-auto" onClick={() => payCharge(room.slug, r.charge!, back)}><CreditCard className="size-4" aria-hidden /> Pay now</Button>}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
}

const usageTone = (s: string) => (s === 'overage_risk' ? 'text-risk-700' : s === 'near_limit' ? 'text-attested-700' : 'text-verified-700');

export function UsageScreen({ room, data }: { room: RoomHeader; data: { usage: UsageSummary } }) {
    const u = data.usage;
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. Current Plan & Entitlement"><KvList rows={[['Plan Name', u.plan], ['Billing Cycle', 'Monthly'], ['Period', u.period], ['Commercial Entitlement', 'Active'], ['Fee Trigger', 'Usage-based services & overages'], ['Payment State', u.outstanding ? 'Balance outstanding' : 'Paid / Current']]} /></Panel>
                <Panel title="4. Forecast Overage" className="lg:col-span-2">
                    <SimpleTable columns={['Category', 'Projected Overage', 'Unit Rate', 'Projected Additional Charge']} empty="No overage projected this period." rows={u.rows.filter((r) => r.charge > 0).map((r) => [r.label, `${r.projectedOverage.toLocaleString()} ${r.unit}s`, `ZAR ${r.rate} per ${r.unit}`, zar(r.charge)])} />
                    <p className="mt-3 flex items-center justify-between rounded bg-risk-50 p-3 text-sm text-risk-700"><span>Total Projected Overage (excl. VAT)</span><strong className="text-lg">{zar(u.projectedOverage)}</strong></p>
                    <p className="mt-2 text-xs text-ink-500">Projected consumption date: {u.projectedDate}. Overage is billed only once the payer pre-authorises the unit price and threshold.</p>
                </Panel>
            </div>
            <Panel title="2. Usage by Category">
                <SimpleTable columns={['Category', 'Included', 'Used', 'Remaining', 'Forecast End-of-Period', 'Unit Rate (if overage)', 'Status']} rows={u.rows.map((r) => [
                    <span key="l" className="font-medium">{r.label}</span>, r.included.toLocaleString(), <span key="u" className="block w-28">{r.used.toLocaleString()} <Bar value={r.pct} /></span>, r.remaining.toLocaleString(), r.forecast.toLocaleString(),
                    r.rate ? `ZAR ${r.rate} per ${r.unit} over` : '—', <span key="s" className={cn('text-xs font-semibold capitalize', usageTone(r.status))}>{r.status.replace('_', ' ')}</span>,
                ])} />
            </Panel>
            <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="Threshold Alerts">
                    {u.alerts.length ? <ul className="space-y-1 text-xs">{u.alerts.map((a, i) => <li key={i} className="flex gap-2"><AlertTriangle className="size-3.5 text-attested-500" aria-hidden />{a.at} — {a.description}</li>)}</ul> : <Empty>No thresholds crossed.</Empty>}
                </Panel>
                <Panel title="5. Payment / Commercial Summary"><KvList rows={[['Spend-to-Date (MTD)', zar(u.spendToDate)], ['Projected Additional Charges', zar(u.projectedOverage)], ['VAT Treatment', 'Excl. VAT'], ['Outstanding Amount', zar(u.outstanding)], ['Stage Lock Status', 'No Lock']]} />
                    <ButtonLink href={roomUrl(room.slug, 'billing/overage-alert')} size="sm" className="mt-3">Adjust Plan / Review Overage <ArrowRight className="size-4" aria-hidden /></ButtonLink>
                </Panel>
            </div>
            {u.projectedOverage > 0 && <p className="rounded bg-risk-50 p-3 text-center text-xs text-risk-700">Projected usage exceeds included allowances. Overages will be charged at published unit rates. Consider adjusting the plan or usage controls to avoid additional costs.</p>}
        </div>
    );
}

export function OverageScreen({ room, data }: { room: RoomHeader; data: { usage: UsageSummary; plans: Record<string, { name: string; monthly: number; adds: Record<string, number> }>; requests: CommercialRequestRow[] } }) {
    const u = data.usage;
    const over = u.rows.filter((r) => r.rate);
    const choose = (option: string) => router.post(roomUrl(room.slug, 'requests/overage'), { option }, { preserveScroll: true });
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="1. Allowance vs Usage Snapshot">
                    <SimpleTable columns={['Category', 'Included', 'Used', 'Remaining / Projected', 'Status']} rows={u.rows.slice(0, 7).map((r) => [r.label, r.included.toLocaleString(), <span key="u" className="block w-24">{r.used.toLocaleString()}<Bar value={r.pct} /></span>, r.rate && r.pct >= 95 ? `Threshold 95% · Projected ${r.forecast.toLocaleString()}` : r.remaining.toLocaleString(), <span key="s" className={cn('text-xs font-semibold capitalize', usageTone(r.status))}>{r.status.replace('_', ' ')}</span>])} />
                </Panel>
                <Panel title="2. Projected Overage Charges">
                    <SimpleTable columns={['Category', 'Included', 'Current', 'Threshold', 'Projected', 'Overage', 'Unit Rate', 'Exact Charge']} rows={over.map((r) => [r.label, r.included.toLocaleString(), r.used.toLocaleString(), '95%', r.forecast.toLocaleString(), <span key="o" className="text-risk-700">{r.projectedOverage.toLocaleString()} {r.unit}s</span>, `ZAR ${r.rate}`, <strong key="c" className="text-risk-700">{zar(r.charge)}</strong>])} />
                    <KvList className="mt-2" rows={[['Total Projected Overage (excl. VAT)', zar(u.projectedOverage)], ['VAT (15%)', zar(u.vat)], ['Total Potential Charge (incl. VAT)', <strong key="t" className="text-risk-700">{zar(u.projectedOverage + u.vat)}</strong>]]} />
                    <p className="mt-2 rounded bg-risk-50 p-2 text-xs text-risk-700">Overage approval required before variable charges are posted.</p>
                </Panel>
            </div>
            <Panel title="4. Upgrade Alternatives">
                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-[6px] border border-parchment-400 p-4"><p className="font-semibold">Approve Overage Only</p><ul className="my-2 space-y-1">{['No plan change', 'Pay exact usage overage', 'Effective immediately'].map((x) => <CheckItem key={x} done>{x}</CheckItem>)}</ul><p className="rounded bg-risk-50 p-2 text-center text-sm font-bold text-risk-700">{zar(u.projectedOverage + u.vat)} incl. VAT</p><Button type="button" variant="outline" size="sm" className="mt-2 w-full" disabled={!u.projectedOverage} onClick={() => choose('overage')}>Approve overage</Button></div>
                    {Object.entries(data.plans).map(([k, p]) => (
                        <div key={k} className={cn('rounded-[6px] border p-4', k === 'growth_plus' ? 'border-verified-500 ring-1 ring-verified-500' : 'border-parchment-400')}>
                            {k === 'growth_plus' && <span className="rounded bg-verified-500 px-2 py-0.5 text-[0.625rem] font-bold text-white">Recommended</span>}
                            <p className="mt-1 font-semibold">Upgrade to {p.name}</p>
                            <ul className="my-2 space-y-1">{Object.entries(p.adds).map(([m, n]) => <CheckItem key={m} done>+{n.toLocaleString()} {m === 'ocr_pages' ? 'OCR pages' : 'AI Q&A requests'}</CheckItem>)}<CheckItem done>Additional monthly fee</CheckItem></ul>
                            <p className="rounded bg-verified-50 p-2 text-center text-sm font-bold text-verified-700">{zar(p.monthly)} excl. VAT</p>
                            <Button type="button" size="sm" className="mt-2 w-full" onClick={() => choose(k)}>Choose {p.name}</Button>
                        </div>
                    ))}
                </div>
            </Panel>
            <Panel title="Overage decisions & approvals"><RequestList room={room} requests={data.requests} back="billing/overage-alert" render={(r) => <p className="mt-1 text-xs text-ink-600">Option: <strong>{r.payload.option === 'overage' ? 'Approve exact overage' : data.plans[r.payload.option]?.name}</strong></p>} /></Panel>
        </div>
    );
}

export function ChangeScreen({ room, data }: { room: RoomHeader; data: { allowances: Record<string, number>; rates: Record<string, { label: string; expert: number; platform: number }>; legalExternal: number; quote: { reference: string; grandTotal: number }; requests: CommercialRequestRow[] } }) {
    const form = useForm<{ reason: string; increments: Record<string, number>; legal_support: boolean; timing_days: number }>({ reason: 'Broader investor process, increased document volume and extended negotiation cycle.', increments: { seats: 2, buyer_groups: 2, storage_gb: 30, ocr_pages: 7000, ai_qa: 1000, meetings: 10, workshops: 2 }, legal_support: true, timing_days: 10 });
    const fee = Object.entries(data.rates).reduce((a, [k, r]) => ({ expert: a.expert + (form.data.increments[k] ?? 0) * r.expert, platform: a.platform + (form.data.increments[k] ?? 0) * r.platform }), { expert: 0, platform: 0 });
    const external = form.data.legal_support ? data.legalExternal : 0;
    const net = Math.round(fee.expert + fee.platform + external);
    const total = net + Math.round(net * 0.15);
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. Current Scope & Baseline Mandate"><KvList rows={[['Baseline Quote Ref', data.quote.reference], ['Baseline Value', zar(data.quote.grandTotal)], ...Object.entries(data.allowances).slice(0, 6).map(([k, v]) => [data.rates[k]?.label ?? k, v.toLocaleString()] as [string, string])]} /></Panel>
                <Panel title="2. Proposed Change Details" className="lg:col-span-2">
                    <form onSubmit={(e) => { e.preventDefault(); form.post(roomUrl(room.slug, 'requests/change'), { preserveScroll: true }); }} className="space-y-3">
                        <SimpleTable columns={['Item', 'Current', 'Increase by', 'Proposed']} rows={Object.entries(data.rates).map(([k, r]) => [r.label, (data.allowances[k] ?? 0).toLocaleString(), <input key={k} type="number" min={0} aria-label={`Increase ${r.label}`} value={form.data.increments[k] ?? 0} onChange={(e) => form.setData('increments', { ...form.data.increments, [k]: Number(e.target.value) })} className="h-7 w-24 rounded border border-parchment-500 px-1 text-xs" />, ((data.allowances[k] ?? 0) + (form.data.increments[k] ?? 0)).toLocaleString()])} />
                        <Checkbox label={`Expanded legal documentation support (marked-up clause review) — external ${zar(data.legalExternal)}`} checked={form.data.legal_support} onChange={(e) => form.setData('legal_support', e.target.checked)} />
                        <Field label="Reason for change" required error={form.errors.reason}>{(id) => <Textarea id={id} value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)} />}</Field>
                        <Field label="Estimated additional duration (business days)">{(id) => <Input id={id} type="number" value={form.data.timing_days} onChange={(e) => form.setData('timing_days', Number(e.target.value))} />}</Field>
                        {form.errors.increments && <p role="alert" className="text-xs text-risk-500">{form.errors.increments}</p>}
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Stat label="A. TBCA Expert Fees" value={zar(fee.expert)} /><Stat label="B. TBCA Platform Fees" value={zar(Math.round(fee.platform))} /><Stat label="C. External Third-Party" value={zar(external)} /><Stat label="Incremental Total (incl. VAT)" value={zar(total)} tone="bad" /></div>
                        <p className="text-xs text-ink-500">Revised total mandate value: <strong>{zar(data.quote.grandTotal + total)}</strong>. If not approved, expanded services and increased allowances remain locked. No change to represented side or confidentiality controls.</p>
                        <Button type="submit" disabled={form.processing}>Submit & Accept Change</Button>
                    </form>
                </Panel>
            </div>
            <Panel title="Change requests, approvals and invoices"><RequestList room={room} requests={data.requests} back="billing/change-request" render={(r) => <p className="mt-1 text-xs text-ink-600">{r.payload.reason} · Incremental {zar(r.payload.fees?.total ?? 0)}</p>} /></Panel>
        </div>
    );
}

export function ThirdPartyScreen({ room, data }: { room: RoomHeader; data: { requests: CommercialRequestRow[] } }) {
    const form = useForm({ provider: 'Deloitte South Africa', service: 'Independent Financial Due Diligence & QoE Review', workstream: 'Financial Analysis / QoE / Validation Support', business_need: 'Independent review to validate QoE adjustments and buyer confidence', scope_window: '7–10 business days', quote_ref: 'DEL-QOE-0508', supplier: 120000, transfer: 1500, disbursement: 2500, tax: 0 });
    const d = form.data;
    const landed = d.supplier + d.transfer + d.disbursement + d.tax;
    const margin = Math.round(landed * 0.25);
    const vat = Math.round((landed + margin) * 0.15);
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. Requested Third-Party Appointment" className="lg:col-span-2">
                    <form onSubmit={(e) => { e.preventDefault(); form.post(roomUrl(room.slug, 'requests/third-party'), { preserveScroll: true }); }} className="grid gap-3 sm:grid-cols-2">
                        {(['provider', 'service', 'workstream', 'business_need', 'scope_window', 'quote_ref'] as const).map((k) => <Field key={k} label={k.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())} error={form.errors[k]}>{(id) => <Input id={id} value={d[k]} onChange={(e) => form.setData(k, e.target.value)} />}</Field>)}
                        {(['supplier', 'transfer', 'disbursement', 'tax'] as const).map((k) => <Field key={k} label={{ supplier: 'Supplier amount (ZAR)', transfer: 'Unavoidable transfer cost', disbursement: 'Approved disbursement', tax: 'Non-recoverable tax' }[k]} error={form.errors[k]}>{(id) => <Input id={id} type="number" min={0} value={d[k]} onChange={(e) => form.setData(k, Number(e.target.value))} />}</Field>)}
                        <div className="sm:col-span-2"><Button type="submit" disabled={form.processing}>Submit for Approval</Button></div>
                    </form>
                </Panel>
                <Panel title="3. Supplier Quote & Landed Cost Breakdown">
                    <KvList rows={[['Supplier Amount', zar(d.supplier)], ['Unavoidable Transfer Cost', zar(d.transfer)], ['Approved Disbursement', zar(d.disbursement)], ['Non-Recoverable Tax', zar(d.tax)], ['Actual Fully Landed Cost', <strong key="l">{zar(landed)}</strong>], ['TBCA 25% Administration Margin', zar(margin)], ['VAT (15%)', zar(vat)], ['Total External Charge', <strong key="t">{zar(landed + margin + vat)}</strong>]]} />
                    <p className="mt-2 text-xs text-ink-500">Prepayment required. Cancellation: 50% if cancelled after acceptance, 100% once work begins. Unused supplier funds are refundable net of committed charges.</p>
                </Panel>
            </div>
            <Panel title="Third-party appointments"><RequestList room={room} requests={data.requests} back="billing/third-party-approval" render={(r) => <p className="mt-1 text-xs text-ink-600">{r.payload.provider} — {r.payload.service} · Conflict: {r.payload.conflict} · Credentials: {r.payload.credentials}</p>} /></Panel>
        </div>
    );
}

interface Statement { reference: string; period: string; opening: number; newCharges: number; payments: number; credits: number; closing: number; lines: Charge[]; unpaid: Charge[]; ageing: Record<string, number>; approved: string | null }

export function StatementScreen({ room, data }: { room: RoomHeader; data: Statement }) {
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. Statement Summary"><KvList rows={[['Statement ID', data.reference], ['Statement Period', data.period], ['Payer', room.company], ['Deal', room.name], ['Billing Basis', 'Monthly retainer + approved disbursements'], ['Status', data.approved ? 'Approved by client' : 'Issued / Review Pending'], ['Payment State', data.closing ? 'Partially paid' : 'Paid']]} /></Panel>
                <Panel title="2. Monthly Activity & Balance" className="lg:col-span-2">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5"><Stat label="Opening Balance" value={zar(data.opening)} /><Stat label="+ New Charges" value={zar(data.newCharges)} /><Stat label="− Payments Received" value={zar(data.payments)} tone="good" /><Stat label="± Credits / Adjustments" value={zar(data.credits)} /><Stat label="= Closing Balance" value={zar(data.closing)} tone={data.closing ? 'bad' : 'good'} /></div>
                    <p className="mt-3 flex justify-between rounded bg-risk-50 p-3 text-sm text-risk-700"><span>Outstanding Balance</span><strong>{zar(data.closing)}</strong></p>
                </Panel>
            </div>
            <Panel title="3. Line Items & Fee Categories (this period)">
                <SimpleTable columns={['Invoice', 'Description', 'Net', 'VAT (15%)', 'Gross', 'Status']} empty="No charges this period." rows={data.lines.map((c) => [c.reference, c.description, zar(c.net), zar(c.vat), zar(c.total), <StatusPill key="s" status={c.status} />])} />
            </Panel>
            <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="4. Payment Allocation & Ageing"><KvList rows={[['Amount Paid', zar(data.payments)], ['Outstanding Current', zar(data.closing)], ['0–30 days', zar(data.ageing['0-30'])], ['31–60 days', zar(data.ageing['31-60'])], ['61+ days', zar(data.ageing['61+'])]]} /></Panel>
                <Panel title="Approve & Settle">
                    <p className="text-xs text-ink-600">Approving the statement records client review and opens a single secure payment for every unpaid invoice ({data.unpaid.length}).</p>
                    <Button type="button" className="mt-3" disabled={!data.closing} onClick={() => router.post(roomUrl(room.slug, 'commercial/statement/pay'))}>Approve Monthly Statement & Proceed to Payment <ArrowRight className="size-4" aria-hidden /></Button>
                    <p className="mt-2 text-xs text-ink-500">This statement relates to advisory and platform services only. TBCA does not hold transaction proceeds.</p>
                </Panel>
            </div>
        </div>
    );
}

interface PaymentInfo { reference: string; method: string; status: string; reason: string | null; amount: number; at: string; order: string; attempts: number }

export function FailedScreen({ room, data, pause = false }: { room: RoomHeader; data: { charge: Charge | null; payment: PaymentInfo | null; paused: boolean; pausedAt: string | null; reason: string | null }; pause?: boolean }) {
    const c = data.charge;
    if (!c) return <Empty>No failed payments on this room. {data.paused ? '' : 'The transaction is active.'}</Empty>;
    const failed = c.status === 'failed';
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title={pause ? '1. Pause Summary' : '1. Payment Failure Summary'}>
                    <KvList rows={[['Invoice ID', c.reference], ['Payment Reference', data.payment?.reference ?? '—'], ['Amount', zar(c.total)], ['VAT', zar(c.vat)], ['Failure Date & Time', data.payment?.at ?? '—'], ['Payment Method', data.payment?.method ?? '—'], ['Failure Reason', c.failureReason ?? '—'], ['Retry Attempts', `${c.failedAttempts} of 3`], ['Status', <StatusPill key="s" status={c.status} />], ...(pause ? [['Paused On', data.pausedAt ?? '—'], ['Paused By', 'System (Automated Monitor)'], ['Stage Lock', data.paused ? 'Active (Stage Locked)' : 'Released']] as [string, string][] : [])]} />
                </Panel>
                <Panel title={pause ? '2. Reason for Pause' : '2. Failure Details & Gateway Response'} className="lg:col-span-2">
                    {failed ? (
                        <>
                            <div className="grid grid-cols-3 gap-2 rounded border border-risk-500/40 bg-risk-50 p-3 text-center text-sm"><span><span className="block text-xs text-ink-500">Gateway Response</span><strong className="text-risk-700">DECLINED</strong></span><span><span className="block text-xs text-ink-500">Response Code</span><strong>51</strong></span><span><span className="block text-xs text-ink-500">Response Message</span><strong className="text-risk-700">{c.failureReason}</strong></span></div>
                            <p className="mt-3 text-xs text-ink-600">No funds were captured. Contact your bank or try an alternative payment method (Instant EFT or manual bank transfer).</p>
                        </>
                    ) : <p className="text-sm font-semibold text-verified-700">This invoice is now {c.status.replace('_', ' ')}. {data.paused ? 'Complete the restart checklist to resume the transaction.' : ''}</p>}
                </Panel>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="3. Recommended Actions">
                    <div className="flex flex-wrap gap-2">
                        {failed && <Button type="button" onClick={() => payCharge(room.slug, c, pause ? 'billing/transaction-restart' : 'billing/payment-confirmation')}><RefreshCw className="size-4" aria-hidden /> Retry Payment</Button>}
                        {failed && <Button type="button" variant="outline" onClick={() => payCharge(room.slug, c, 'billing/payment-confirmation')}>Use Alternative Method</Button>}
                        <Button type="button" variant="ghost" onClick={() => openAskQuestion({ subject: `Payment support ${c.reference}`, section: 'Virtual Deal Room' })}>Contact Support</Button>
                        {data.paused && <ButtonLink href={roomUrl(room.slug, 'billing/transaction-restart')} variant="outline"><PlayCircle className="size-4" aria-hidden /> Restart checklist</ButtonLink>}
                    </div>
                    <p className="mt-2 text-xs text-ink-500">Retrying opens the shared secure payment page. The stage lock remains until payment is successfully completed and reconciled.</p>
                </Panel>
                <Panel title={pause ? '3. Impact of Pause' : '5. Completion Impact'}>
                    <ul className="space-y-1">{(pause ? ['Stage progression locked — no further steps can be completed', 'Document access remains available; no permission changes', 'Approvals remain on hold', 'Timelines may be affected if not resolved promptly'] : ['Stage unlock', 'Deal room access continuation', 'Mandate activation', 'Documents & evidence release', 'Next stage approval']).map((x) => <CheckItem key={x} done={!failed}>{x}</CheckItem>)}</ul>
                </Panel>
            </div>
            {pause && data.paused && <p className="flex items-center justify-center gap-2 text-xs text-ink-500"><PauseCircle className="size-4" aria-hidden /> Transaction will remain paused until payment is successfully completed and reconciled.</p>}
        </div>
    );
}

export function RestartScreen({ room, data }: { room: RoomHeader; data: { paused: boolean; pausedAt: string | null; reason: string | null; charge: Charge | null; requirements: { label: string; done: boolean; detail: string }[]; request: CommercialRequestRow | null; ready: boolean; resumeStage: string } }) {
    const { auth } = usePage<SharedProps>().props;
    const errors = usePage<{ errors: Record<string, string> }>().props.errors;
    const done = data.requirements.filter((r) => r.done).length;
    if (!data.paused) return <Empty>This transaction is not paused. Nothing to restart.</Empty>;
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. Current Transaction Status"><KvList rows={[['Paused On', data.pausedAt ?? '—'], ['Paused By', 'System (Automated Monitor)'], ['Pause Reason', data.reason ?? '—'], ['Current Stage', data.resumeStage], ['Invoice', data.charge?.reference ?? '—'], ['Amount', data.charge ? zar(data.charge.total) : '—'], ['Payment Status', data.charge?.status ?? '—']]} /></Panel>
                <Panel title="2. Restart Requirements Checklist" className="lg:col-span-2">
                    <SimpleTable columns={['Requirement', 'Status', 'Details']} rows={data.requirements.map((r) => [r.label, <StatusPill key="s" status={r.done ? 'completed' : 'required'} tone={r.done ? 'good' : 'bad'} />, r.detail])} />
                    <p className="mt-2 text-xs">{done} of {data.requirements.length} requirements completed</p>
                    <Bar value={(done / data.requirements.length) * 100} tone="good" />
                </Panel>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="3. Approvals Required to Restart">
                    {data.request ? <ApprovalList slug={room.slug} approvals={data.request.approvals} isAdmin={auth.user?.role === 'admin'} isOwner={room.role === 'owner'} /> : <p className="text-xs text-ink-500">Raise a restart request to start the approval workflow.</p>}
                    {data.charge && data.charge.status !== 'paid' && <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => payCharge(room.slug, data.charge!, 'billing/transaction-restart')}>Resolve payment now</Button>}
                </Panel>
                <Panel title="4. Impact of Restart">
                    <ul className="space-y-1">{['Transaction will resume from the current stage', 'No changes to agreed commercial terms', 'Timelines remain unchanged', 'All completed steps and evidence will be retained'].map((x) => <CheckItem key={x} done>{x}</CheckItem>)}</ul>
                    {errors.restart && <p role="alert" className="mt-2 text-xs text-risk-500">{errors.restart}</p>}
                    <Button type="button" className="mt-3" onClick={() => router.post(roomUrl(room.slug, 'restart'))}>{data.request ? 'Restart Transaction' : 'Raise Restart Request'} <ArrowRight className="size-4" aria-hidden /></Button>
                </Panel>
            </div>
        </div>
    );
}

export function RefundScreen({ room, data }: { room: RoomHeader; data: { charge: Charge | null; eligibility: { eligible: boolean; rule: string; refundable: number; nonRefundable?: number; days: number }; requests: CommercialRequestRow[] } }) {
    const e = data.eligibility;
    const form = useForm({ charge_id: data.charge?.id ?? 0, reason: 'Change in deal scope / decision not to proceed', detail: '', amount: e.refundable, method: 'original', notes: '' });
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. Payment & Transaction Summary">{data.charge ? <KvList rows={[['Invoice ID', data.charge.reference], ['Payment Date', data.charge.paidAt ?? '—'], ['Amount Paid', zar(data.charge.total)], ['VAT', zar(data.charge.vat)], ['Already Refunded', zar(data.charge.refunded)], ['Current Stage', room.currentStage.name], ['Payment Status', <StatusPill key="s" status={data.charge.status} />]]} /> : <Empty>No settled payment.</Empty>}</Panel>
                <Panel title="2. Refund Eligibility Check">
                    <p className={cn('rounded p-2 text-sm font-semibold', e.eligible ? 'bg-verified-50 text-verified-700' : 'bg-risk-50 text-risk-700')}>{e.eligible ? 'Eligible for Refund' : 'Not eligible'}</p>
                    <KvList className="mt-2" rows={[['Policy Rule', e.rule], ['Policy Window', 'Within 7 calendar days of payment'], ['Days Elapsed', String(e.days)], ['Refundable Amount', zar(e.refundable)], ['Non-Refundable Amount', zar(e.nonRefundable ?? 0)]]} />
                    <p className="mt-2 text-xs text-ink-500">Refunds exclude VAT, third-party fees, bank charges and services already rendered.</p>
                </Panel>
                <Panel title="5. Refund Policy Summary"><ul className="list-disc space-y-1 pl-4 text-xs"><li>Stage 0: 30% refundable within 7 days</li><li>Stage 1: refunds at discretion of TBCA</li><li>No refunds after Stage 2 activation</li><li>Non-refundable: VAT, fees, disbursements</li><li>Refunds processed within 5 business days</li></ul></Panel>
            </div>
            {e.eligible && data.charge && (
                <Panel title="3. Refund Request Details">
                    <form onSubmit={(ev) => { ev.preventDefault(); form.post(roomUrl(room.slug, 'requests/refund'), { preserveScroll: true }); }} className="grid gap-3 sm:grid-cols-2">
                        <Field label="Reason for Refund" required error={form.errors.reason}>{(id) => <Select id={id} value={form.data.reason} onChange={(ev) => form.setData('reason', ev.target.value)} options={['Change in deal scope / decision not to proceed', 'Duplicate payment', 'Service not commenced', 'Other']} />}</Field>
                        <Field label="Refund Amount Requested (ZAR)" required error={form.errors.amount} hint={`Maximum ${zar(e.refundable)}`}>{(id) => <Input id={id} type="number" max={e.refundable} value={form.data.amount} onChange={(ev) => form.setData('amount', Number(ev.target.value))} />}</Field>
                        <Field label="Detailed Reason" required error={form.errors.detail} className="sm:col-span-2">{(id) => <Textarea id={id} value={form.data.detail} onChange={(ev) => form.setData('detail', ev.target.value)} />}</Field>
                        <Field label="Preferred Refund Method">{(id) => <Select id={id} value={form.data.method} onChange={(ev) => form.setData('method', ev.target.value)} options={[{ value: 'original', label: 'Original Payment Method' }, { value: 'bank_transfer', label: 'Bank Transfer (Manual Refund)' }]} />}</Field>
                        <Field label="Additional Notes (Optional)">{(id) => <Input id={id} value={form.data.notes} onChange={(ev) => form.setData('notes', ev.target.value)} />}</Field>
                        <div className="sm:col-span-2"><Button type="submit" disabled={form.processing}>Submit Refund Request</Button></div>
                    </form>
                </Panel>
            )}
            <Panel title="Refund requests & approvals"><RequestList room={room} requests={data.requests} back="billing/refund-request" render={(r) => <p className="mt-1 text-xs text-ink-600">{r.payload.reason} · {r.payload.method}</p>} /></Panel>
        </div>
    );
}

export function DisputeScreen({ room, data }: { room: RoomHeader; data: { charges: Charge[]; requests: CommercialRequestRow[] } }) {
    const form = useForm({ charge_id: data.charges[0]?.id ?? 0, dispute_type: 'Fee Amount Dispute', reason: '', detail: '', amount: 0 });
    const charge = data.charges.find((c) => c.id === form.data.charge_id);
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="2. Dispute Details" className="lg:col-span-2">
                    {data.charges.length === 0 ? <Empty>No payments in the last 30 days can be disputed.</Empty> : (
                        <form onSubmit={(e) => { e.preventDefault(); form.post(roomUrl(room.slug, 'requests/dispute'), { preserveScroll: true }); }} className="grid gap-3 sm:grid-cols-2">
                            <Field label="Invoice" required>{(id) => <Select id={id} value={String(form.data.charge_id)} onChange={(e) => form.setData('charge_id', Number(e.target.value))} options={data.charges.map((c) => ({ value: String(c.id), label: `${c.reference} — ${zar(c.total)}` }))} />}</Field>
                            <Field label="Dispute Type" required error={form.errors.dispute_type}>{(id) => <Select id={id} value={form.data.dispute_type} onChange={(e) => form.setData('dispute_type', e.target.value)} options={['Fee Amount Dispute', 'Service Not Delivered', 'Duplicate Charge', 'Commercial Terms Dispute']} />}</Field>
                            <Field label="Reason for Dispute" required error={form.errors.reason} className="sm:col-span-2">{(id) => <Input id={id} value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)} placeholder="The platform fee charged exceeds the agreed capped amount in the engagement letter." />}</Field>
                            <Field label="Disputed Amount (ZAR)" required error={form.errors.amount}>{(id) => <Input id={id} type="number" min={1} max={charge?.total} value={form.data.amount} onChange={(e) => form.setData('amount', Number(e.target.value))} />}</Field>
                            <Field label="Detailed Explanation" required error={form.errors.detail} className="sm:col-span-2">{(id) => <Textarea id={id} value={form.data.detail} onChange={(e) => form.setData('detail', e.target.value)} />}</Field>
                            <div className="sm:col-span-2"><Button type="submit" disabled={form.processing}>Submit Dispute for Review</Button></div>
                        </form>
                    )}
                </Panel>
                <Panel title="6. Dispute Policy Summary"><ul className="list-disc space-y-1 pl-4 text-xs"><li>Disputes must be raised within 30 days of payment</li><li>Provide clear reason and supporting evidence</li><li>During review, the disputed amount may be held</li><li>Resolution within 10 business days</li><li>Outcome communicated in writing</li></ul>
                    {charge && <StatStrip items={[{ label: 'Total Paid', value: zar(charge.total) }, { label: 'Disputed', value: zar(form.data.amount), tone: 'bad' }, { label: 'Non-Disputed', value: zar(Math.max(0, charge.total - form.data.amount)), tone: 'good' }]} />}
                </Panel>
            </div>
            <Panel title="4. Review & Resolution Process">
                <RequestList room={room} requests={data.requests} back="billing/fee-dispute" render={(r) => (
                    <div className="mt-1 text-xs text-ink-600">
                        {r.payload.dispute_type}: {r.payload.reason} · on {r.payload.charge}
                        <ol className="mt-2 flex flex-wrap gap-1">{['submitted', 'under_review', 'resolution_proposed', 'resolved'].map((s, i, arr) => <li key={s} className={cn('rounded px-2 py-0.5', arr.indexOf(r.status) >= i || r.status === s ? 'bg-verified-50 text-verified-700' : 'bg-parchment-200')}>{s.replace('_', ' ')}</li>)}</ol>
                        {r.status === 'resolution_proposed' && <Button type="button" size="sm" className="mt-2" onClick={() => router.post(roomUrl(room.slug, `requests/${r.id}/accept-resolution`), {}, { preserveScroll: true })}>Accept resolution {r.payload.credit ? `(credit ${zar(r.payload.credit)})` : ''}</Button>}
                    </div>
                )} />
            </Panel>
        </div>
    );
}

export function ClosingScreen({ room, data }: { room: RoomHeader; data: { charge: Charge | null; lines: { category: string; item: string; net: number }[]; eligible: boolean } }) {
    const c = data.charge;
    const net = data.lines.reduce((a, l) => a + l.net, 0);
    return (
        <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
                {[['Mandate & Diligence Completed', data.eligible], ['Transaction Closed', data.eligible], ['All Deliverables Handed Over', data.eligible], ['Final Invoice Issued', !!c]].map(([l, ok]) => <div key={l as string} className={cn('rounded-[6px] border p-3 text-xs font-semibold', ok ? 'border-verified-500/40 bg-verified-50 text-verified-700' : 'border-parchment-400 bg-white text-ink-500')}>{l as string}</div>)}
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. Invoice Summary"><KvList rows={[['Invoice ID', c?.reference ?? 'Issued on payment'], ['Invoice Type', 'Closing Invoice'], ['Bill To', room.company], ['Purpose', 'Closing invoice — mandate completion'], ['Payment Due', c?.dueDate ?? '14 days'], ['Status', c ? <StatusPill key="s" status={c.status} /> : 'Not issued'], ['Stage Lock', c?.status === 'paid' ? 'Released' : 'Active until paid']]} /></Panel>
                <Panel title="2. Invoice Breakdown (ZAR)" className="lg:col-span-2">
                    {c ? <ChargeTable charge={c} /> : <SimpleTable columns={['Fee Category', 'Description', 'Amount', 'VAT', 'Total']} rows={[...data.lines.map((l) => [l.category, l.item, zar(l.net), zar(Math.round(l.net * 0.15)), zar(Math.round(l.net * 1.15))]), ['', <strong key="t">Total Due</strong>, zar(net), zar(Math.round(net * 0.15)), <strong key="g">{zar(Math.round(net * 1.15))}</strong>]]} />}
                </Panel>
            </div>
            <Panel title="3. Payment Actions">
                {!data.eligible ? <p className="text-sm text-ink-600">The closing invoice is issued after signing, completion and financial close (Stage 13).</p> : c?.status === 'paid' ? <p className="text-sm font-semibold text-verified-700">Paid {c.paidAt}. Mandate fully closed; confirmation and receipt issued.</p> : (
                    <Button type="button" onClick={() => router.post(roomUrl(room.slug, 'commercial/closing'))}><CreditCard className="size-4" aria-hidden /> Pay Now to Close Mandate</Button>
                )}
            </Panel>
        </div>
    );
}

export function SubscriptionScreen({ room, data }: { room: RoomHeader; data: { subscription: { status: string; plan: string; start: string; renews: string; auto_renew: boolean } | null; charge: Charge | null; net: number; eligible: boolean; usage: { users: number; storage: number; queries: number } } }) {
    const s = data.subscription;
    const act = (action: string) => router.post(roomUrl(room.slug, 'commercial/subscription'), { action }, { preserveScroll: true });
    const days = s ? Math.max(0, Math.round((new Date(s.renews).getTime() - Date.now()) / 86400000)) : 0;
    return (
        <div className="space-y-5">
            {s ? <StatStrip items={[{ label: 'Annual Cost', value: zar(Math.round(data.net * 1.15)) }, { label: 'Next Payment Due', value: s.renews }, { label: 'Subscription Status', value: s.status, tone: s.status === 'active' ? 'good' : 'bad' }, { label: 'Days Until Renewal', value: days }, { label: 'Auto-Renew', value: s.auto_renew ? 'Enabled' : 'Disabled' }, { label: 'Support Tier', value: 'Priority' }]} /> : null}
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. Subscription Overview">
                    {s ? <KvList rows={[['Plan', s.plan], ['Status', <StatusPill key="s" status={s.status} />], ['Start Date', s.start], ['Next Renewal Date', s.renews], ['Billing Cycle', 'Annually'], ['Auto-Renew', s.auto_renew ? 'Enabled' : 'Disabled']]} /> : <p className="text-sm text-ink-600">{data.eligible ? 'Activate post-close Enterprise access for archive, monitoring and reporting.' : 'Available after financial close (Stage 13).'}</p>}
                </Panel>
                <Panel title="2. Entitlements & Access"><ul className="space-y-1">{['Full platform access', 'All data rooms and documents', 'AI insights and analytics', 'Audit trail and reporting', 'API access', 'Priority support'].map((x) => <CheckItem key={x} done={!!s && s.status === 'active'}>{x}</CheckItem>)}</ul></Panel>
                <Panel title="4. Billing & Payment"><KvList rows={[['Annual Fee (Excl. VAT)', zar(data.net)], ['VAT (15%)', zar(Math.round(data.net * 0.15))], ['Total (Incl. VAT)', <strong key="t">{zar(Math.round(data.net * 1.15))}</strong>], ['Payment Status', data.charge ? <StatusPill key="p" status={data.charge.status} /> : '—']]} /></Panel>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="3. Usage Summary"><KvList rows={[['Active Users', `${data.usage.users} / 25`], ['Storage Used', `${data.usage.storage} GB / 500 GB`], ['AI Queries', `${data.usage.queries} / Unlimited`]]} /></Panel>
                <Panel title="5. Support & Service"><KvList rows={[['Support Tier', 'Priority'], ['Account Manager', 'TBCA Client Success'], ['Support Hours', '08:00 – 17:00 SAST, Mon – Fri']]} /></Panel>
                <Panel title="9. Account Controls">
                    <div className="flex flex-wrap gap-2">
                        {!s || s.status !== 'active' ? <Button type="button" disabled={!data.eligible} onClick={() => act('start')}>Activate Subscription</Button> : (
                            <>
                                <Button type="button" size="sm" variant="outline" onClick={() => act('auto_renew')}>{s.auto_renew ? 'Disable' : 'Enable'} Auto-Renew</Button>
                                <Button type="button" size="sm" variant="ghost" className="text-risk-700" onClick={() => act('cancel')}>Cancel Subscription</Button>
                            </>
                        )}
                    </div>
                    <p className="mt-2 text-xs text-ink-500">Plan changes apply from the next billing cycle; prorated credits may apply.</p>
                </Panel>
            </div>
            {s && <div className="flex justify-center"><Gauge value={Math.round(((365 - days) / 365) * 100)} label="Term elapsed" /></div>}
        </div>
    );
}
