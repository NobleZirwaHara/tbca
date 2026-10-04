import type { FormEvent } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, CalendarDays, CheckCircle2, Download, Headphones, PieChart, Wallet, LogIn, Trash2 } from 'lucide-react';
import { Panel } from '@/Components/ui/Kit';
import { Checkbox, Field, Select, Textarea } from '@/Components/ui/Form';
import { CheckList, LabelValues, Notice } from '@/Components/Products/Shared';
import { openAskQuestion } from '@/Components/AskQuestion';
import type { RetContext } from '@/Components/Products/Retainers/types';
import { AccountShell } from '@/Components/Products/Retainers/Shells';
import { StatTile, fmtDate, hrs, zar } from '@/Components/Products/Retainers/ui';

export default function Cancel(props: RetContext & { final_invoice: number }) {
    const { retainer: r, meter: m } = props;
    const base = `/retainers/account/${r.code}`;
    const ends = m.period?.ends_on ?? null;
    const form = useForm({ reason: '', comments: '', confirm: false });
    const err = form.errors as Record<string, string>;
    const cancellable = ['active', 'paused'].includes(r.status);
    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (!window.confirm(`Cancel ${r.name} at the end of the current period (${fmtDate(ends)})?`)) return;
        form.post(`${base}/cancel`, { preserveScroll: true });
    };

    return (
        <AccountShell ctx={props} title="Cancellation" description="Request to cancel your retainer at the end of the current period. No Sales approval is required.">
            <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1fr_320px]" noValidate>
                <div className="min-w-0 space-y-5">
                    <Notice tone="info" title="Cancellation takes effect at period end">
                        Your retainer will remain active until the end of the current period. You will continue to have access to your adviser and remaining allowance until {fmtDate(ends)}.
                    </Notice>
                    <Panel title="1. Cancellation Summary">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            <StatTile icon={CalendarDays} tone="purple" label="Period Ends" value={fmtDate(ends)} caption={`${m.days_left} days remaining`} />
                            <StatTile icon={PieChart} tone="good" label="Remaining Allowance" value={hrs(m.remaining)} unit="hours" caption={`(${Math.round(100 - m.utilisation)}% of ${hrs(m.denominator)} hours)`} />
                            <StatTile icon={Wallet} tone="gold" label="Estimated Final Invoice" value={zar(props.final_invoice)} caption="Authorised overage, excl. VAT" />
                            <StatTile icon={LogIn} tone="purple" label="Service Access Until" value={fmtDate(ends)} caption="End of period" />
                        </div>
                    </Panel>
                    {cancellable ? (
                        <Panel title="2. Cancellation Details">
                            <p className="-mt-2 mb-3 text-xs text-ink-500">Please tell us why you are cancelling (optional).</p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Reason for Cancellation (optional)">
                                    {(id) => <Select id={id} value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)} placeholder="Select a reason" options={['No ongoing need', 'Budget constraints', 'Moving to per-use', 'Service quality', 'Project completed', 'Other']} />}
                                </Field>
                                <Field label="Additional Comments (optional)" hint={`${form.data.comments.length} / 500`}>
                                    {(id) => <Textarea id={id} maxLength={500} placeholder="Tell us more..." value={form.data.comments} onChange={(e) => form.setData('comments', e.target.value)} />}
                                </Field>
                            </div>
                            <Notice tone="warn" icon={AlertCircle} title="What happens next?" className="mt-4">
                                <ul className="list-disc space-y-1 pl-4">
                                    <li>Your retainer will remain active until {fmtDate(ends)}.</li>
                                    <li>You can continue using your allowance and access your adviser.</li>
                                    <li>Any unused allowance will expire at period end and will not be carried forward.</li>
                                    <li>You will receive your final statement after period end.</li>
                                </ul>
                            </Notice>
                            <Checkbox className="mt-4" label="I understand and confirm that I want to cancel this retainer at the end of the current period." checked={form.data.confirm} onChange={(e) => form.setData('confirm', e.target.checked)} />
                            {(err.confirm || err.reason) && <p role="alert" className="mt-1 text-xs text-risk-500">{err.confirm || err.reason}</p>}
                        </Panel>
                    ) : (
                        <Notice tone={r.status === 'cancelling' ? 'warn' : 'info'} title={`This Retainer is ${r.status.replace('_', ' ')}`}>
                            {r.status === 'cancelling' ? `Cancellation is confirmed for ${fmtDate(r.cancel_effective)}.` : 'Cancellation is available once the Retainer is active.'}
                        </Notice>
                    )}
                </div>

                <div className="space-y-4">
                    <Panel title="3. Your Retainer Summary">
                        <LabelValues
                            rows={[
                                { label: 'Retainer', value: r.name },
                                { label: 'Retainer Code', value: r.code },
                                { label: 'Period', value: `${fmtDate(m.period?.starts_on)} – ${fmtDate(ends)}` },
                                { label: 'Allowance', value: `${hrs(r.allowance_qty)} hours / month` },
                                { label: 'Used to Date', value: `${hrs(m.confirmed)} hours (${Math.round(m.utilisation)}%)` },
                                { label: 'Remaining Allowance', value: `${hrs(m.remaining)} hours` },
                                { label: 'Monthly Fee (excl. VAT)', value: zar(r.monthly_fee_zar) },
                                { label: 'Cancelling At Period End', value: fmtDate(r.cancel_effective ?? ends), strong: true },
                            ]}
                        />
                    </Panel>
                    <Panel title="4. What You Will Retain">
                        <CheckList items={['Access to portal and documents', 'Download itemised usage ledger', 'Past invoices and statements', 'Reports generated to date']} />
                    </Panel>
                    <Panel title="Need to Talk?">
                        <p className="text-xs text-ink-600">Want to discuss alternatives before cancelling? Speak to your Account Manager. This is optional — you can cancel directly.</p>
                        <button type="button" onClick={() => openAskQuestion({ subject: `Alternatives to cancelling ${r.code}`, section: 'retainers' })} className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-referenced-500/50 text-xs font-semibold text-referenced-700"><Headphones className="size-4" aria-hidden="true" />Contact Account Manager</button>
                    </Panel>
                </div>

                <div className="xl:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-parchment-400 pt-4">
                    <Link href={base} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-sm font-semibold text-ink-900"><ArrowLeft className="size-4" aria-hidden="true" />Back to Overview</Link>
                    <div className="flex flex-wrap gap-2">
                        <Link href={`${base}/ledger`} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-referenced-500/50 px-4 text-sm font-semibold text-referenced-700"><Download className="size-4" aria-hidden="true" />Download Usage Summary</Link>
                        {cancellable && (
                            <button type="submit" disabled={form.processing} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-risk-500 bg-white px-6 text-sm font-semibold text-risk-700 hover:bg-risk-50 disabled:opacity-60">
                                <Trash2 className="size-4" aria-hidden="true" /> Confirm Cancellation
                            </button>
                        )}
                        {!cancellable && <span className="inline-flex h-10 items-center gap-2 text-sm text-ink-500"><CheckCircle2 className="size-4" aria-hidden="true" />No action required</span>}
                    </div>
                </div>
            </form>
        </AccountShell>
    );
}

Cancel.layout = null;
