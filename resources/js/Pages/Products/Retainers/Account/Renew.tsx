import type { FormEvent } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, CalendarDays, CheckCircle2, Clock, Download, Headphones, PieChart, Wallet } from 'lucide-react';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { Input } from '@/Components/ui/Form';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import type { RetContext } from '@/Components/Products/Retainers/types';
import { AccountShell } from '@/Components/Products/Retainers/Shells';
import { StatTile, fmtDate, hrs, zar } from '@/Components/Products/Retainers/ui';

interface Props extends RetContext {
    forecast: number;
    estimated_overage: number;
    holds: string[];
    history: { label: string; allowance: number; fee: number; status: string }[];
    resize_options: { hours: number; fee: number }[];
}

export default function Renew(props: Props) {
    const { retainer: r, meter: m, holds, history, resize_options } = props;
    const base = `/retainers/account/${r.code}`;
    const next = m.period?.next_reset ?? '';
    const form = useForm({ choice: r.renewal?.choice ?? 'renew', allowance: String(resize_options.find((o) => o.hours > r.allowance_qty)?.hours ?? r.allowance_qty), pause_from: next, resume_from: '' });
    const err = form.errors as Record<string, string>;
    const resizeFee = resize_options.find((o) => String(o.hours) === form.data.allowance)?.fee ?? r.monthly_fee_zar;
    const preview = form.data.choice === 'resize' ? { a: Number(form.data.allowance), f: resizeFee } : { a: r.allowance_qty, f: r.monthly_fee_zar };
    const editable = r.status === 'active';
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(`${base}/renew`, { preserveScroll: true });
    };
    const card = (key: string, title: string, body: string, children: React.ReactNode) => (
        <label className={cn('flex cursor-pointer flex-col rounded-[8px] border p-4', form.data.choice === key ? 'border-referenced-500 bg-referenced-50/50 ring-1 ring-referenced-500' : 'border-parchment-400 bg-white')}>
            <span className="flex items-center gap-2">
                <input type="radio" name="choice" value={key} checked={form.data.choice === key} onChange={() => form.setData('choice', key)} disabled={!editable} className="accent-referenced-700" />
                <span className="text-sm font-semibold text-ink-900">{title}</span>
            </span>
            <span className="mt-1 text-xs text-ink-500">{body}</span>
            <span className="mt-3 space-y-2 text-xs">{children}</span>
        </label>
    );

    return (
        <AccountShell ctx={props} title="Renewal and Resize" description="Review your retainer performance and choose to renew, resize or pause at the end of the current period.">
            <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1fr_320px]" noValidate>
                <div className="min-w-0 space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <StatTile icon={CalendarDays} tone="purple" label="Current Period End" value={fmtDate(m.period?.ends_on)} caption={`${m.days_left} days remaining`} />
                        <StatTile icon={PieChart} tone="good" label="Utilisation" value={`${Math.round(m.utilisation)}%`} caption={`${hrs(m.confirmed)} of ${hrs(m.denominator)} hours used`} />
                        <StatTile icon={Clock} tone="gold" label="Forecast to Period End" value={hrs(props.forecast)} unit="hours" caption={props.forecast <= m.denominator ? 'On track' : 'Above allowance'} />
                        <StatTile icon={Wallet} tone="purple" label="Estimated Overage" value={hrs(props.estimated_overage)} unit="hours" caption={props.estimated_overage > 0 ? 'Needs prior approval' : 'No overage expected'} />
                    </div>

                    {holds.length > 0 && (
                        <Notice tone="bad" icon={AlertTriangle} title="Renewal on hold (GATE-RE-12)">
                            <ul className="list-disc pl-4">{holds.map((h) => <li key={h}>{h}</li>)}</ul>
                        </Notice>
                    )}
                    {r.renewal && (
                        <Notice tone="good" title={`Your selection: ${r.renewal.choice}`}>
                            Effective {fmtDate(r.renewal.effective)} · {hrs(r.renewal.allowance)} hours / month · {zar(r.renewal.fee)} excl. VAT. You can change it until the period closes.
                        </Notice>
                    )}

                    <Panel title="1. Choose Your Path">
                        <p className="-mt-2 mb-3 text-xs text-ink-500">Select how you would like to proceed at the end of the current period.</p>
                        <div className="grid gap-3 lg:grid-cols-3" role="radiogroup">
                            {card('renew', 'Renew', 'Renew this retainer with the same scope and allowance.', (
                                <LabelValues rows={[{ label: 'New Period Start', value: fmtDate(next) }, { label: 'Allowance', value: `${hrs(r.allowance_qty)} hours / month` }, { label: 'Monthly Fee (excl. VAT)', value: zar(r.monthly_fee_zar) }]} />
                            ))}
                            {card('resize', 'Resize', 'Adjust the allowance and/or fee to better fit your needs.', (
                                <>
                                    <span className="block text-ink-600">New Allowance</span>
                                    <select aria-label="New allowance" value={form.data.allowance} onChange={(e) => form.setData('allowance', e.target.value)} disabled={!editable} className="h-9 w-full rounded-[4px] border border-parchment-500 bg-white px-2">
                                        {resize_options.map((o) => <option key={o.hours} value={o.hours}>{o.hours.toFixed(1)} hours / month</option>)}
                                    </select>
                                    <span className="block text-ink-600">Monthly Fee (excl. VAT)</span>
                                    <span className="block text-sm font-bold text-ink-900">{zar(resizeFee)}</span>
                                    <Link href={`${base}/sizing`} className="font-semibold text-referenced-700">View sizing tool</Link>
                                </>
                            ))}
                            {card('pause', 'Pause', 'Temporarily pause this retainer. No standing availability.', (
                                <>
                                    <span className="block text-ink-600">Pause From</span>
                                    <Input type="date" aria-label="Pause from" value={form.data.pause_from} onChange={(e) => form.setData('pause_from', e.target.value)} disabled={!editable} />
                                    <span className="block text-ink-600">Resume From (optional)</span>
                                    <Input type="date" aria-label="Resume from" value={form.data.resume_from} onChange={(e) => form.setData('resume_from', e.target.value)} disabled={!editable} />
                                    <span className="block text-ink-500">Standing availability and benefits will pause.</span>
                                </>
                            ))}
                        </div>
                        {Object.values(err).map((e) => <p key={e} role="alert" className="mt-2 text-xs text-risk-500">{e}</p>)}
                    </Panel>

                    <Panel title="2. Next Period Preview (If you renew or resize)">
                        <dl className="grid gap-4 text-xs sm:grid-cols-4">
                            <div><dt className="text-ink-500">Allowance</dt><dd className="text-lg font-bold">{hrs(preview.a)} <span className="text-xs font-normal">hours / month</span></dd></div>
                            <div><dt className="text-ink-500">Estimated Monthly Fee</dt><dd className="text-lg font-bold">{zar(preview.f)}</dd><dd className="text-ink-400">excl. VAT</dd></div>
                            <div><dt className="text-ink-500">Included Services</dt><dd>All services in current scope</dd><dd><Link href={`/retainers/${r.service_slug}`} className="font-semibold text-referenced-700">View scope</Link></dd></div>
                            <div><dt className="text-ink-500">Notice Period</dt><dd className="text-lg font-bold">{r.notice_days} days</dd><dd className="text-ink-400">Before period end</dd></div>
                        </dl>
                        <Notice tone="info" className="mt-3">Once confirmed, a new period will be created at period close, and your allowance, pricing and terms will apply from the start date. Each new period re-tests price floor and capacity.</Notice>
                    </Panel>
                </div>

                <div className="space-y-4">
                    <Panel title="3. Current Retainer Summary">
                        <LabelValues
                            rows={[
                                { label: 'Retainer', value: r.name },
                                { label: 'Retainer Code', value: r.code },
                                { label: 'Period', value: `${fmtDate(m.period?.starts_on)} – ${fmtDate(m.period?.ends_on)}` },
                                { label: 'Allowance', value: `${hrs(r.allowance_qty)} hours / month` },
                                { label: 'Used to Date', value: `${hrs(m.confirmed)} hours (${Math.round(m.utilisation)}%)` },
                                { label: 'Forecast to End', value: `${hrs(props.forecast)} hours` },
                                { label: 'Estimated Overage', value: `${hrs(props.estimated_overage)} hours` },
                                { label: 'Monthly Fee (excl. VAT)', value: zar(r.monthly_fee_zar) },
                                { label: 'Next Period Start (if renewed)', value: fmtDate(next), strong: true },
                            ]}
                        />
                    </Panel>
                    <Panel title="4. Renewal History">
                        <SimpleTable columns={['Period', 'Allowance', 'Monthly Fee', 'Status']} rows={history.map((h) => [h.label, `${hrs(h.allowance)} h`, zar(h.fee), <StatusPill key="s" status={h.status} />])} />
                    </Panel>
                    <Panel title="Need help deciding?">
                        <p className="text-xs text-ink-600">Speak to your Account Manager to discuss your options.</p>
                        <button type="button" onClick={() => openAskQuestion({ subject: `Renewal options — ${r.code}`, section: 'retainers' })} className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-referenced-500/50 text-xs font-semibold text-referenced-700"><Headphones className="size-4" aria-hidden="true" />Contact Account Manager</button>
                    </Panel>
                </div>

                <div className="xl:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-parchment-400 pt-4">
                    <Link href={`${base}/statement`} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-sm font-semibold text-ink-900"><ArrowLeft className="size-4" aria-hidden="true" />Back to Period Statement</Link>
                    <div className="flex gap-2">
                        <Link href={`${base}/utilisation`} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-referenced-500/50 px-4 text-sm font-semibold text-referenced-700"><Download className="size-4" aria-hidden="true" />Performance Report</Link>
                        <button type="submit" disabled={form.processing || !editable} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-referenced-700 px-6 text-sm font-semibold text-white disabled:opacity-50"><CheckCircle2 className="size-4" aria-hidden="true" />Confirm Selection</button>
                    </div>
                </div>
            </form>
        </AccountShell>
    );
}

Renew.layout = null;
