import type { FormEvent } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Bookmark, CalendarRange, Clock, Info, ListPlus, MoreHorizontal, Send, Upload, UserRound, Users } from 'lucide-react';
import { Panel, SimpleTable, StatusPill, Stepper } from '@/Components/ui/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Notice } from '@/Components/Products/Shared';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import type { RetContext, RetExclusion } from '@/Components/Products/Retainers/types';
import { AccountShell } from '@/Components/Products/Retainers/Shells';
import { fmtDate, hrs, zar } from '@/Components/Products/Retainers/ui';

interface Props extends RetContext {
    changes: { reference: string; summary: string; change_type: string; status: string; stage: number; impact_hours: number; impact_zar: number; created_at: string }[];
    exclusions: RetExclusion[];
}

const TYPES = [
    { key: 'Add / Remove Inclusions', icon: ListPlus, sub: 'Change what is included in scope' },
    { key: 'Adjust Allowance', icon: Clock, sub: 'Increase or decrease hours' },
    { key: 'Adjust Cadence', icon: CalendarRange, sub: 'Change delivery frequency' },
    { key: 'Change Named Advisor', icon: UserRound, sub: 'Change advisor or team' },
    { key: 'Other', icon: MoreHorizontal, sub: 'Other scope related change' },
];

export default function ScopeChange(props: Props) {
    const { retainer: r, meter: m, changes } = props;
    const base = `/retainers/account/${r.code}`;
    const form = useForm({ change_type: 'Add / Remove Inclusions', summary: '', description: '', effective_from: '', reason: '' });
    const err = form.errors as Record<string, string>;
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(`${base}/scope-change`, { preserveScroll: true, onSuccess: () => form.reset() });
    };

    return (
        <AccountShell ctx={props} title="Scope Change" description="Request a change to the scope, inclusions or cadence of your retainer. All changes are subject to availability, capacity and agreement terms.">
            <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1fr_320px]" noValidate>
                <div className="min-w-0 space-y-5">
                    <Panel>
                        <Stepper steps={['Change Request', 'Impact Assessment', 'Proposed Adjustment', 'Review & Approve', 'Implement']} current={1} />
                    </Panel>
                    <Panel title="1. Current Retainer Summary">
                        <dl className="grid gap-x-6 gap-y-2 text-xs sm:grid-cols-3">
                            {[
                                ['Retainer', r.name],
                                ['Period', m.period ? `${fmtDate(m.period.starts_on)} – ${fmtDate(m.period.ends_on)}` : '—'],
                                ['Owner Model', r.owner_model],
                                ['Retainer Code', r.code],
                                ['Allowance', `${hrs(r.allowance_qty)} Hours / Month`],
                                ['Named Advisor', r.adviser?.name ?? '—'],
                                ['Term', `${r.min_term_months} Months (Monthly Billing)`],
                                ['Remaining (This Month)', `${hrs(m.remaining)} Hours (${Math.round(100 - m.utilisation)}%)`],
                                ['Billing Cycle', 'Monthly in advance'],
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-2 border-b border-parchment-300 py-1">
                                    <dt className="text-ink-500">{k}</dt>
                                    <dd className="text-right font-semibold text-ink-900">{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </Panel>
                    <Panel title="2. Change Type">
                        <p className="-mt-2 mb-3 text-xs text-ink-500">Select the type of change you are requesting:</p>
                        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5" role="radiogroup">
                            {TYPES.map(({ key, icon: Icon, sub }) => (
                                <button key={key} type="button" role="radio" aria-checked={form.data.change_type === key} onClick={() => form.setData('change_type', key)} className={cn('rounded-[6px] border p-3 text-center', form.data.change_type === key ? 'border-referenced-500 bg-referenced-50 ring-1 ring-referenced-500' : 'border-parchment-400 hover:border-referenced-500/50')}>
                                    <Icon className="mx-auto size-6 text-ink-700" aria-hidden="true" />
                                    <span className="mt-1 block text-[0.8125rem] font-semibold text-ink-900">{key}</span>
                                    <span className="text-[0.6875rem] text-ink-500">{sub}</span>
                                </button>
                            ))}
                        </div>
                    </Panel>
                    <Panel title="3. Change Request Details">
                        <p className="-mt-2 mb-3 text-xs text-ink-500">Please describe the change you are requesting and why.</p>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                                <Field label="Change Summary" required error={err.summary} hint={`${form.data.summary.length} / 200`}>
                                    {(id) => <Textarea id={id} maxLength={200} rows={3} placeholder="Provide a short summary of the change you would like to make..." value={form.data.summary} onChange={(e) => form.setData('summary', e.target.value)} invalid={!!err.summary} />}
                                </Field>
                                <Field label="Detailed Description" required error={err.description} hint={`${form.data.description.length} / 2000`}>
                                    {(id) => <Textarea id={id} maxLength={2000} placeholder="Explain the change in detail, including what is being added, removed or adjusted and the reason..." value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} invalid={!!err.description} />}
                                </Field>
                            </div>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Effective From" required error={err.effective_from}>
                                        {(id) => <Input id={id} type="date" value={form.data.effective_from} onChange={(e) => form.setData('effective_from', e.target.value)} invalid={!!err.effective_from} />}
                                    </Field>
                                    <Field label="Reason for Change" required error={err.reason}>
                                        {(id) => <Select id={id} value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)} placeholder="Select reason" options={['New business priority', 'Change in demand', 'Regulatory change', 'Team change', 'Other']} invalid={!!err.reason} />}
                                    </Field>
                                </div>
                                <div>
                                    <p className="text-[0.8125rem] font-medium text-ink-800">Supporting Documents (Optional)</p>
                                    <div className="mt-1 flex flex-col items-center rounded-[6px] border-2 border-dashed border-parchment-500 p-5 text-center text-xs text-ink-500">
                                        <Upload className="size-6" aria-hidden="true" />
                                        <span className="mt-1">Share documents with your Named Advisor after submission.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Panel>
                    {changes.length > 0 && (
                        <Panel title="Your Change Requests">
                            <SimpleTable
                                columns={['Reference', 'Summary', 'Type', 'Stage', 'Impact', 'Status']}
                                rows={changes.map((c) => [<span key="r" className="font-mono text-xs">{c.reference}</span>, c.summary, c.change_type, `${c.stage} / 5`, c.impact_hours ? `${hrs(c.impact_hours)}h · ${zar(c.impact_zar)}` : '—', <StatusPill key="s" status={c.status} />])}
                            />
                        </Panel>
                    )}
                </div>

                <div className="space-y-4">
                    <div className="rounded-[8px] border border-referenced-500/30 bg-referenced-50 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-referenced-700"><Info className="size-4" aria-hidden="true" />Need Guidance?</p>
                        <p className="mt-1 text-xs text-ink-600">Speak to your Named Advisor to discuss the impact of this change.</p>
                        <button type="button" onClick={() => openAskQuestion({ subject: `Scope change guidance — ${r.code}`, section: 'retainers' })} className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-referenced-500/50 bg-white px-3 text-xs font-semibold text-referenced-700"><Users className="size-4" aria-hidden="true" />Contact Advisor</button>
                    </div>
                    <Panel title="What Happens Next?">
                        <ol className="space-y-2.5 text-xs">
                            {[['We review your request', 'We assess the impact on scope, allowance, capacity and pricing.'], ['We propose an adjustment', 'You will receive a revised proposal (if applicable).'], ['You review & approve', 'You accept, request changes or decline.'], ['We implement the change', 'Once accepted, we update your retainer.']].map(([t, b], i) => (
                                <li key={t} className="flex gap-2"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-referenced-700 text-[0.625rem] font-bold text-white">{i + 1}</span><span><span className="block font-semibold text-ink-900">{t}</span><span className="text-ink-500">{b}</span></span></li>
                            ))}
                        </ol>
                    </Panel>
                    <Panel title="Potential Impact (Indicative)">
                        <p className="-mt-2 mb-2 text-xs text-ink-500">Actual impact will be confirmed during assessment.</p>
                        <ul className="space-y-1.5 text-xs">
                            {['Allowance Impact', 'Pricing Impact', 'Billing Impact', 'Capacity Impact', 'Implementation Time'].map((x) => (
                                <li key={x} className="flex justify-between text-ink-600"><span>{x}</span><span>—</span></li>
                            ))}
                        </ul>
                        <p className="mt-2 text-[0.6875rem] text-ink-400">Subject to assessment and approval. Your existing allowance is not reduced merely because you submitted the request.</p>
                    </Panel>
                    <Notice tone="purple" title="Important Reminders">
                        <ul className="list-disc space-y-1 pl-4 text-xs">
                            <li>All scope changes are subject to capacity and availability.</li>
                            <li>Some changes may affect pricing and billing.</li>
                            <li>Changes take effect from the agreed effective date.</li>
                            <li>See your Retainer Agreement for full terms.</li>
                        </ul>
                    </Notice>
                </div>

                <div className="xl:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-parchment-400 pt-4">
                    <Link href={base} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-sm font-semibold text-ink-900"><ArrowLeft className="size-4" aria-hidden="true" />Back to Overview</Link>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => form.reset()} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-referenced-500/50 px-4 text-sm font-semibold text-referenced-700"><Bookmark className="size-4" aria-hidden="true" />Clear</button>
                        <button type="submit" disabled={form.processing} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-referenced-700 px-6 text-sm font-semibold text-white disabled:opacity-60"><Send className="size-4" aria-hidden="true" />Submit Change Request</button>
                    </div>
                </div>
            </form>
        </AccountShell>
    );
}

ScopeChange.layout = null;
