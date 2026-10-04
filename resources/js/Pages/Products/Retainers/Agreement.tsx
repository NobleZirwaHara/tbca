import type { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Bookmark, Building2, FileText, Info, Lock, UserRound } from 'lucide-react';
import { PageTitle, LabelValues } from '@/Components/Products/Shared';
import { Stepper } from '@/Components/ui/Kit';
import { Checkbox, Field, Input, Select } from '@/Components/ui/Form';
import type { RetProposal } from '@/Components/Products/Retainers/types';
import { fmtDate, zar } from '@/Components/Products/Retainers/ui';

export default function Agreement({ proposal: p, signer }: { proposal: RetProposal; signer: { name: string; email: string } }) {
    const s = p.service;
    const form = useForm({ name: signer.name, position: String(p.request.role ?? ''), email: signer.email, signature: '', agree: false, authority: false });
    const err = form.errors as Record<string, string>;
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(`/retainers/agreement/${p.reference}/sign`);
    };

    return (
        <>
            <Head title={`Agreement ${p.agreement_ref}`} />
            <PageTitle
                crumbs={[{ label: 'Retainers', href: '/retainers' }, { label: s.name, href: `/retainers/${s.slug}` }, { label: `Proposal ${p.reference}`, href: `/retainers/proposal/${p.reference}` }, { label: 'Agreement Execution' }]}
                title="Agreement Execution"
                lead="Review and sign your Retainer Agreement to activate your Retainer."
                aside={<Stepper className="w-72" steps={['Request', 'Review proposal', 'Sign']} current={3} />}
            />
            <form onSubmit={submit} className="container-tbca space-y-5 py-8" noValidate>
                <div className="flex flex-wrap items-center gap-x-10 gap-y-2 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4">
                    <div className="flex flex-1 items-start gap-3">
                        <Info className="size-5 shrink-0 text-controlled-700" aria-hidden="true" />
                        <p className="text-sm text-ink-800"><span className="block font-semibold">You are signing a legally binding Retainer Agreement.</span><span className="text-xs text-ink-600">Please review all documents carefully before signing. Capacity is re-validated at signature.</span></p>
                    </div>
                    <div className="text-xs"><p className="text-ink-500">Proposal ID</p><p className="font-semibold">{p.reference}</p></div>
                    <div className="text-xs"><p className="text-ink-500">Agreement ID</p><p className="font-semibold">{p.agreement_ref}</p></div>
                </div>

                <div className="grid gap-5 lg:grid-cols-[280px_1fr_300px]">
                    <div className="space-y-4">
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-sm font-semibold text-ink-900">1. Agreement Parties</h2>
                            <p className="text-xs text-ink-500">Please confirm the parties to this agreement.</p>
                            <div className="mt-3 flex gap-3 border-b border-parchment-300 pb-3 text-xs text-ink-700">
                                <Building2 className="size-8 shrink-0 rounded-full bg-gold-50 p-1.5 text-gold-700" aria-hidden="true" />
                                <p><span className="block font-semibold text-ink-900">TBCA (Service Provider)</span>The Business Clinic.Africa™ (Pty) Ltd<br />5th Floor, Blocktrans Building, Blue Gate Road, Lynnwood Ridge, Pretoria, 0081, South Africa<br />Reg No: 2022/123456/07<br />VAT No: 4860291234</p>
                            </div>
                            <div className="mt-3 flex gap-3 text-xs text-ink-700">
                                <UserRound className="size-8 shrink-0 rounded-full bg-parchment-200 p-1.5 text-ink-600" aria-hidden="true" />
                                <p><span className="block font-semibold text-ink-900">Client (You)</span>{p.organisation}<br />{String(p.request.country ?? 'South Africa')}<br />{String(p.request.email ?? '')}</p>
                            </div>
                        </section>
                        <section className="space-y-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-sm font-semibold text-ink-900">2. Signing Authority</h2>
                            <Checkbox label={<span className="text-xs">I confirm that I have authority to sign this agreement.</span>} checked={form.data.authority} onChange={(e) => form.setData('authority', e.target.checked)} />
                            {err.authority && <p role="alert" className="text-xs text-risk-500">{err.authority}</p>}
                            <Field label="Full Name" required error={err.name}>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                            <Field label="Position" required error={err.position}>{(id) => <Select id={id} value={form.data.position} onChange={(e) => form.setData('position', e.target.value)} placeholder="Select position" options={['Chief Executive Officer', 'Chief Financial Officer', 'Director', 'Head of Strategy', 'Procurement Lead', 'Other']} />}</Field>
                            <Field label="Email for agreement copy" required error={err.email}>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />}</Field>
                        </section>
                    </div>

                    <section className="min-w-0 rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-semibold text-ink-900">3. Review &amp; Sign Agreement</h2>
                        <p className="text-xs text-ink-500">Please review the Retainer Agreement and Service Level Agreement.</p>
                        <div className="mt-3 flex items-center gap-2 rounded-t-[6px] border border-parchment-400 px-3 py-2 text-xs">
                            <FileText className="size-5 text-risk-500" aria-hidden="true" />
                            <span><span className="block font-semibold text-ink-900">TBCA_Retainer_Agreement_{s.name.replace(/\W+/g, '_')}.pdf</span><span className="text-ink-400">Version {p.version}.0 • Updated {fmtDate(p.issued_at)}</span></span>
                        </div>
                        <div className="max-h-[420px] overflow-y-auto border-x border-b border-parchment-400 bg-ink-800 p-4">
                            <article className="mx-auto max-w-xl bg-white p-6 text-[0.8125rem] leading-relaxed text-ink-800 shadow">
                                <p className="text-center text-xs font-bold tracking-wide">THE BUSINESS CLINIC.AFRICA™</p>
                                <h3 className="mt-2 text-center font-serif text-2xl font-bold">RETAINER AGREEMENT</h3>
                                <p className="text-center font-serif text-ink-500 uppercase">{s.name}</p>
                                <table className="mx-auto mt-4 w-full max-w-sm border border-parchment-400 text-xs">
                                    <tbody className="divide-y divide-parchment-300">
                                        {[['Agreement ID', p.agreement_ref], ['Proposal ID', `${p.reference} (v${p.version})`], ['Start Date', fmtDate(p.start_date)], ['Minimum Term', `${s.min_term_months} Months`], ['Billing Cycle', 'Monthly in advance'], ['Governing Law', 'Republic of South Africa']].map(([k, v]) => (
                                            <tr key={k}><td className="px-2 py-1 text-ink-500">{k}:</td><td className="px-2 py-1 font-medium">{v}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="mt-4">This Retainer Agreement (the “Agreement”) is entered into between <strong>The Business Clinic.Africa™ (Pty) Ltd</strong> (“TBCA”) and the Client identified herein (“Client”) for the provision of retained advisory services under the <strong>{s.name}</strong> (“Retainer”).</p>
                                <p className="mt-3"><strong>2. Nature of the Retainer.</strong> The Client purchases reserved access to defined human capacity for the service period. The Retainer is not unlimited consulting.</p>
                                <p className="mt-3"><strong>3. Allowance.</strong> {p.allowance_qty} hours per month, measured in 15-minute increments. {s.unit_definition}</p>
                                <p className="mt-3"><strong>5. Exclusions.</strong> The Client confirms the exclusion register was shown before acceptance: {s.exclusions.map((e) => e.category).join('; ')}.</p>
                                <p className="mt-3"><strong>6. Capacity model.</strong> {p.owner_model}. Seniority: {s.owner?.seniority}.</p>
                                <p className="mt-3"><strong>8. Fees.</strong> {zar(p.monthly_fee_zar)} per month excl. VAT, billed monthly in advance.</p>
                                <p className="mt-3"><strong>10. Unused allowance.</strong> Up to {p.rollover_cap_pct}% rolls into the immediately following period only. Carried hours are not carried again.</p>
                                <p className="mt-3"><strong>12. Overage.</strong> No chargeable overage begins before the Client approves exact scope, units, rate ({zar(p.overage_rate_zar)}/hour) and maximum charge.</p>
                                <p className="mt-3"><strong>13. Utilisation Covenant.</strong> When the approved under-use profile is met, Continue, Right-size, Pause and Cancel are presented neutrally.</p>
                                <p className="mt-3"><strong>15. Substitution.</strong> Material named-adviser changes receive notice, a continuity handover and the Client&apos;s decision.</p>
                                <p className="mt-3"><strong>18. Pause and cancellation.</strong> The Client may use the digital route without negotiating with Sales. Notice period: {s.notice_days} days; cancellation takes effect at period end.</p>
                            </article>
                        </div>
                        <Checkbox className="mt-3 rounded-[6px] border border-parchment-400 p-3" label="I have read, understood and agree to the Retainer Agreement, Service Level Agreement and all Schedules." checked={form.data.agree} onChange={(e) => form.setData('agree', e.target.checked)} />
                        {err.agree && <p role="alert" className="mt-1 text-xs text-risk-500">{err.agree}</p>}
                        {err.proposal && <p role="alert" className="mt-1 text-xs text-risk-500">{err.proposal}</p>}
                    </section>

                    <div className="space-y-4">
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-sm font-semibold text-ink-900">4. Agreement Summary</h2>
                            <LabelValues
                                className="mt-2"
                                rows={[
                                    { label: 'Retainer', value: s.name },
                                    { label: 'Allowance', value: `${p.allowance_qty} Hours / month` },
                                    { label: 'Service Level', value: `${s.response_window} response` },
                                    { label: 'Minimum Term', value: `${s.min_term_months} Months` },
                                    { label: 'Monthly Fee (excl. VAT)', value: zar(p.monthly_fee_zar) },
                                    { label: 'VAT (15%)', value: zar(p.vat_zar) },
                                    { label: 'Monthly Fee (incl. VAT)', value: zar(p.fee_incl_vat), strong: true },
                                    { label: 'Overage Rate', value: `${zar(p.overage_rate_zar)} / hour` },
                                    { label: 'Unused Allowance Rollover', value: `Up to ${p.rollover_cap_pct}%` },
                                    { label: 'Notice Period', value: `${s.notice_days} Days` },
                                ]}
                            />
                            <div className="mt-2 flex items-center justify-between rounded-[4px] bg-gold-50 px-3 py-2 text-sm font-bold"><span>First Payment (incl. VAT)</span><span>{zar(p.fee_incl_vat)}</span></div>
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-sm font-semibold text-ink-900">5. Digital Signature</h2>
                            <p className="text-xs text-ink-500">Type your full name to sign this agreement.</p>
                            <label htmlFor="sig" className="sr-only">Signature</label>
                            <input id="sig" value={form.data.signature} onChange={(e) => form.setData('signature', e.target.value)} placeholder="Type your signature" className="mt-3 h-20 w-full rounded-[6px] border border-parchment-500 px-3 font-serif text-3xl text-ink-900 italic focus:border-gold-500 focus:outline-none" />
                            <div className="mt-1 flex justify-between text-xs">
                                <span className="text-risk-500">{err.signature}</span>
                                <button type="button" onClick={() => form.setData('signature', '')} className="font-semibold text-gold-700">Clear</button>
                            </div>
                            <p className="mt-2 flex items-center gap-1 text-[0.6875rem] text-ink-500"><Lock className="size-3" aria-hidden="true" />Your signature is secure and legally binding.</p>
                        </section>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-parchment-400 pt-4">
                    <Link href={`/retainers/proposal/${p.reference}`} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-sm font-semibold text-ink-900"><ArrowLeft className="size-4" aria-hidden="true" />Back: Proposal Review</Link>
                    <div className="flex flex-wrap gap-2">
                        <Link href="/retainers/account" className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-sm font-semibold text-ink-900"><Bookmark className="size-4" aria-hidden="true" />Save for Later</Link>
                        <button type="submit" disabled={form.processing} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-60">Sign Agreement &amp; Activate Retainer <ArrowRight className="size-4" aria-hidden="true" /></button>
                    </div>
                </div>
                <p className="flex items-center justify-end gap-1 text-[0.6875rem] text-ink-400"><Lock className="size-3" aria-hidden="true" />Secure e-signature with audit trail · first payment follows at checkout</p>
            </form>
        </>
    );
}
