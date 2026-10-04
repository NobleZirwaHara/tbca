import type { FormEvent } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, Bookmark, CheckCircle2, History, Info, Users } from 'lucide-react';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import { openAskQuestion } from '@/Components/AskQuestion';
import type { RetContext } from '@/Components/Products/Retainers/types';
import { AccountShell } from '@/Components/Products/Retainers/Shells';
import { fmtDate, fmtDateTime, hrs, zar } from '@/Components/Products/Retainers/ui';

interface OverageRec {
    id: number;
    reference: string;
    scope: string;
    lines: { date: string; description: string; role: string; hours: number }[];
    units: number;
    rate_zar: number;
    max_charge_zar: number;
    status: string;
    authorised_units: number | null;
    authorised_limit_zar: number | null;
    authorised_by: string | null;
    notes: string | null;
    expires_at: string | null;
    authorised_at: string | null;
}

interface Props extends RetContext {
    overage: OverageRec | null;
    history: { label: string | null; units: number | null; amount: number | null; status: string }[];
    signatories: string[];
}

export default function Overage(props: Props) {
    const { retainer: r, meter: m, overage: o, history, signatories } = props;
    const base = `/retainers/account/${r.code}`;
    const form = useForm({ overage: o?.id ?? 0, decision: 'authorise', authorised_by: signatories[0] ?? '', limit: o ? String(o.max_charge_zar) : '', notes: '' });
    const err = form.errors as Record<string, string>;
    const amount = o ? Math.round(o.units * o.rate_zar) : 0;
    const vat = Math.round(amount * 0.15);
    const open = o?.status === 'requested';
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(`${base}/overage`, { preserveScroll: true });
    };

    return (
        <AccountShell ctx={props} title="Overage Authorisation" description="Review and authorise additional work beyond your included allowance — before it begins.">
            {!o ? (
                <Notice tone="good" title="No overage requests">
                    Your work stays within your included allowance. If additional capacity is ever needed, you will see the exact scope, units, rate and maximum charge here for your prior approval.
                </Notice>
            ) : (
                <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1fr_320px]" noValidate>
                    <div className="min-w-0 space-y-5">
                        {open ? (
                            <Notice tone="warn" icon={AlertTriangle} title={m.state === 'EXHAUSTED' ? 'Allowance Exhausted' : 'Additional capacity requested'}>
                                {m.state === 'EXHAUSTED' ? 'You have used your included allowance for this period. ' : ''}No chargeable work beyond your allowance will begin unless you approve the exact additional scope, units and maximum charge below. This authority expires {fmtDateTime(o.expires_at)}.
                            </Notice>
                        ) : (
                            <Notice tone={o.status === 'declined' || o.status === 'expired' ? 'bad' : 'good'} title={`Request ${o.reference}: ${o.status.replace('_', ' ')}`}>
                                {o.status === 'authorised' && `Authorised by ${o.authorised_by} on ${fmtDateTime(o.authorised_at)} for up to ${hrs(o.authorised_units ?? 0, 2)} hours / ${zar(o.authorised_limit_zar ?? 0)} incl. VAT.`}
                                {o.status === 'declined' && 'You declined this request. Work stops at your allowance boundary.'}
                                {o.status === 'expired' && 'This authority expired. The work lock has been reinstated.'}
                                {o.status === 'cap_reached' && 'The authorised hours have been fully used. The work lock is reinstated.'}
                            </Notice>
                        )}

                        <Panel title="Retainer Summary">
                            <dl className="grid gap-3 text-xs sm:grid-cols-4">
                                {[
                                    ['Retainer', r.name],
                                    ['Retainer Code', r.code],
                                    ['Period', m.period ? `${fmtDate(m.period.starts_on)} – ${fmtDate(m.period.ends_on)}` : '—'],
                                    ['Billing Cycle', 'Monthly in advance'],
                                    ['Included Allowance', `${hrs(m.denominator)} Hours / Month`],
                                    ['Allowance Used', `${hrs(m.confirmed)}h (${Math.round(m.utilisation)}%)`],
                                    ['Requested Overage', `${hrs(o.units)} Hours`],
                                    ['Overage Rate', `${zar(o.rate_zar)} / Hour`],
                                ].map(([k, v]) => (
                                    <div key={k}>
                                        <dt className="text-ink-500">{k}</dt>
                                        <dd className="font-semibold text-ink-900">{v}</dd>
                                    </div>
                                ))}
                            </dl>
                        </Panel>

                        <Panel title="Overage Details">
                            <p className="-mt-2 mb-3 text-xs text-ink-500">Scope: {o.scope}</p>
                            <SimpleTable
                                columns={['Date', 'Description', 'Professional / Role', 'Hours', 'Rate (Excl. VAT)', 'Amount (Excl. VAT)']}
                                rows={[
                                    ...o.lines.map((l) => [fmtDate(l.date), l.description, l.role, hrs(l.hours), zar(o.rate_zar), zar(l.hours * o.rate_zar)]),
                                    [<strong key="t">Total Overage Hours</strong>, '', '', <strong key="h">{hrs(o.units)}</strong>, <strong key="l">Total Amount (Excl. VAT)</strong>, <strong key="a">{zar(amount)}</strong>],
                                ]}
                            />
                            <Notice tone="info" className="mt-3">All overage hours are billed in 15-minute increments. VAT will be added at the applicable rate. Work dated before your authorisation can never be billed.</Notice>
                        </Panel>

                        {open && (
                            <Panel title="Authorisation">
                                <div className="grid gap-4 lg:grid-cols-3">
                                    <fieldset className="rounded-[6px] border border-referenced-500/40 p-3">
                                        <legend className="px-1 text-[0.8125rem] font-medium text-ink-800">Authorisation Decision <span className="text-risk-500">*</span></legend>
                                        {[
                                            ['authorise', 'Authorise this overage', 'I confirm and authorise billing for the overage listed above.'],
                                            ['limit', 'Authorise up to a limit', 'Set a maximum amount or hours to authorise.'],
                                            ['decline', 'Do not authorise', 'Decline this overage. (Usage dispute process available.)'],
                                        ].map(([k, t, b]) => (
                                            <label key={k} className="mt-2 flex cursor-pointer items-start gap-2 text-xs">
                                                <input type="radio" name="decision" value={k} checked={form.data.decision === k} onChange={() => form.setData('decision', k)} className="mt-0.5 accent-referenced-700" />
                                                <span><span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span><span className="text-ink-500">{b}</span></span>
                                            </label>
                                        ))}
                                    </fieldset>
                                    <div className="space-y-3">
                                        <Field label="Authorised By" required error={err.authorised_by}>
                                            {(id) => <Select id={id} value={form.data.authorised_by} onChange={(e) => form.setData('authorised_by', e.target.value)} options={signatories} />}
                                        </Field>
                                        {form.data.decision === 'limit' && (
                                            <Field label="Authorised Limit (incl. VAT)" error={err.limit} hint="Maximum amount you are willing to authorise (incl. VAT).">
                                                {(id) => <Input id={id} type="number" min={1} max={o.max_charge_zar} value={form.data.limit} onChange={(e) => form.setData('limit', e.target.value)} />}
                                            </Field>
                                        )}
                                    </div>
                                    <Field label="Authorisation Notes (Optional)" hint={`${form.data.notes.length} / 500`}>
                                        {(id) => <Textarea id={id} maxLength={500} placeholder="Add any notes or conditions for this authorisation..." value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />}
                                    </Field>
                                </div>
                                {err.decision && <p role="alert" className="mt-2 text-xs text-risk-500">{err.decision}</p>}
                                <Notice tone="purple" className="mt-3">By authorising, you confirm the additional work is necessary and in line with the agreed objectives. Authority covers only this scope, these units and this maximum charge.</Notice>
                            </Panel>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Panel title="Overage Summary">
                            <LabelValues
                                rows={[
                                    { label: 'Excess Hours', value: `${hrs(o.units)} Hours` },
                                    { label: 'Overage Rate (Excl. VAT)', value: `${zar(o.rate_zar)} / Hour` },
                                    { label: 'Amount (Excl. VAT)', value: zar(amount) },
                                    { label: 'VAT (15%)', value: zar(vat) },
                                    { label: 'Total (Incl. VAT) — maximum charge', value: zar(o.max_charge_zar), strong: true },
                                ]}
                            />
                        </Panel>
                        <Panel title="What Happens Next?">
                            <ol className="space-y-2 text-xs text-ink-700">
                                {['Your authorisation will be recorded.', 'The overage amount will be included in your next invoice.', 'You will receive an updated usage statement.', 'For recurring overages, consider a scope or allowance adjustment.'].map((x, i) => (
                                    <li key={x} className="flex gap-2"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-referenced-50 text-[0.625rem] font-bold text-referenced-700">{i + 1}</span>{x}</li>
                                ))}
                            </ol>
                        </Panel>
                        <Panel title={<span className="inline-flex items-center gap-2"><History className="size-4" aria-hidden="true" />Recent Overage History</span>}>
                            {history.length === 0 && <p className="text-xs text-ink-400">No previous overages.</p>}
                            <ul className="space-y-2 text-xs">
                                {history.map((h, i) => (
                                    <li key={i} className="flex items-center justify-between gap-2">
                                        <span>{h.label}</span>
                                        <StatusPill status="authorised" tone="good" />
                                        <span>{hrs(h.units ?? 0)} Hours</span>
                                        <span className="font-semibold">{zar(h.amount ?? 0)}</span>
                                    </li>
                                ))}
                            </ul>
                        </Panel>
                        <Panel title="Need Guidance?">
                            <p className="text-xs text-ink-600">Speak to your Named Advisor to discuss this overage.</p>
                            <button type="button" onClick={() => openAskQuestion({ subject: `Overage ${o.reference}`, section: 'retainers' })} className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-referenced-500/50 px-3 text-xs font-semibold text-referenced-700"><Users className="size-4" aria-hidden="true" />Contact Advisor</button>
                        </Panel>
                    </div>

                    <div className="xl:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-parchment-400 pt-4">
                        <Link href={`${base}/utilisation`} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-sm font-semibold text-ink-900"><ArrowLeft className="size-4" aria-hidden="true" />Back to Utilisation Review</Link>
                        {open && (
                            <div className="flex gap-2">
                                <Link href={base} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-referenced-500/50 px-4 text-sm font-semibold text-referenced-700"><Bookmark className="size-4" aria-hidden="true" />Save &amp; Review Later</Link>
                                <button type="submit" disabled={form.processing} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-referenced-700 px-6 text-sm font-semibold text-white disabled:opacity-60"><CheckCircle2 className="size-4" aria-hidden="true" />{form.data.decision === 'decline' ? 'Record Decline' : 'Authorise Overage & Proceed'}</button>
                            </div>
                        )}
                    </div>
                    <p className="xl:col-span-2 flex items-center justify-end gap-1 text-[0.6875rem] text-ink-400"><Info className="size-3" aria-hidden="true" />Your authorisation is secure and will be recorded in your agreement.</p>
                </form>
            )}
        </AccountShell>
    );
}

Overage.layout = null;
