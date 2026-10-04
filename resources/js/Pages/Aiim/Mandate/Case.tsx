import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { ScoreRing } from '@/Components/Aiim/Charts';
import { Chip, levelTone } from '@/Components/Aiim/Chips';
import { MandateFrame } from '@/Components/Aiim/EngagementKit';
import { zar2 } from '@/Components/Aiim/format';
import { SectionCard } from '@/Components/Aiim/Shell';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import type { AiimPageProps, Engagement } from '@/types/aiim';

type Kind = 'change' | 'refund' | 'dispute' | 'pause' | 'restart' | 'cancel';

interface Props extends AiimPageProps {
    engagement: Engagement;
    kind: Kind;
    case: { reference: string; status: string; payload: Record<string, any>; amount: number | null; created: string } | null;
    scopeChange: Record<string, any> | null;
    settlement: { paidEx: number; paidIncl: number; earnedPct: number; earned: number; committed: number; refundableEx: number };
}

const META: Record<Kind, { title: string; description: string; guidance: string; tabs: string[]; action: string }> = {
    change: { title: 'Scope Change Approval', description: 'Review and approve the proposed changes to the mandate scope, deliverables, timeline or fees.', guidance: 'Carefully review the proposed changes and their impact on fees and timelines before approving. All changes require client consent.', tabs: ['Change Overview', 'Scope Changes', 'Impact Assessment', 'Fee Impact', 'Timeline Impact', 'Approvals', 'Activity Log'], action: 'Approve Change' },
    refund: { title: 'Refund Request', description: 'Request a refund for eligible services, subscriptions or deliverables. Our team will review your request and respond within the stated turnaround time.', guidance: 'Refunds are assessed using our Refund Policy and earned/unearned calculation. Provide clear reasons and evidence to support your request.', tabs: ['Refund Details', 'Eligible Items', 'Calculation', 'Attachments', 'Refund Policy', 'Activity Log'], action: 'Submit Refund Request' },
    dispute: { title: 'Dispute Case', description: 'Raise a dispute regarding a service, deliverable, timeline, fee or any other aspect of this mandate. Our team will investigate and resolve fairly.', guidance: 'Provide clear details and supporting evidence. This helps us resolve your dispute faster and fairly.', tabs: ['Case Overview', 'Details & Issues', 'Evidence', 'Communication', 'Resolution', 'Activity Log'], action: 'Submit Dispute' },
    pause: { title: 'Pause Mandate', description: 'Temporarily pause this mandate. Your work in progress will be safely retained. You can restart the mandate when you are ready.', guidance: 'Pausing helps protect your cashflow while keeping your work secure. Earned work remains recorded.', tabs: ['Pause Overview', 'Work In Progress', 'Financial Impact', 'Pause Settings', 'Resume Details', 'Activity Log'], action: 'Confirm Pause Mandate' },
    restart: { title: 'Restart Mandate', description: 'Resume a paused mandate. Confirm your restart preferences and we will reactivate the mandate and continue from where we paused.', guidance: 'Restarting will reactivate your mandate, reassign tasks and extend timelines based on the new plan.', tabs: ['Restart Overview', 'Progress Before Pause', 'Restart Options', 'Timeline & Impact', 'Fee Impact', 'Resume Details', 'Activity Log'], action: 'Confirm Restart Mandate' },
    cancel: { title: 'Cancellation', description: 'Cancel this mandate. Provide a reason and review the financial settlement. We will close the mandate and provide a final statement.', guidance: 'Cancellation closes this mandate. You may be entitled to a refund for unearned work in line with our terms.', tabs: ['Cancellation Overview', 'Reason & Details', 'Financial Settlement', 'Work Completed', 'Documents', 'Activity Log'], action: 'Confirm Cancellation' },
};

export default function Case({ engagement: e, kind, case: c, scopeChange: sc, settlement: s }: Props) {
    const m = META[kind];
    const [tab, setTab] = useState(m.tabs[0]);
    const vat = (x: number) => Math.round(x * 15) / 100;
    const summary: [string, string][] = [['Mandate ID', e.mandate ?? e.reference], ['Started On', e.start ?? '—'], ['Current Stage', e.stage ?? '—'], ['Progress', `${e.progress}%`], ['Status', e.statusLabel], ['Advisor', e.advisor?.name ?? '—'], ['Original End Date', e.originalEnd ?? '—'], ['Est. Completion', e.end ?? '—']];

    return (
        <MandateFrame
            e={e}
            title={m.title}
            description={m.description}
            guidance={m.guidance}
            stage={kind === 'change' ? 'Scope Change Approval' : e.stage ?? '—'}
            tabs={m.tabs}
            tab={tab}
            onTab={setTab}
            footer={<><p className="text-xs text-ink-500">{kind === 'cancel' ? 'By confirming cancellation, you agree to our Cancellation & Refund Policy and the finality of this action.' : 'Your submission is recorded against this mandate with an audit trail.'}</p><div className="flex gap-2"><Button type="button" size="sm" variant="outline" disabled>Save for Later</Button><Button type="button" size="sm" disabled className={kind === 'cancel' ? '!border-risk-500 !bg-risk-500 !text-white' : ''}>{m.action}</Button></div></>}
        >
            <div className="grid gap-4 xl:grid-cols-[15rem_minmax(0,1fr)_17rem]">
                <SectionCard title={kind === 'change' ? 'Change Summary' : kind === 'dispute' ? 'Case Summary' : kind === 'refund' ? 'Refund Request' : 'Mandate Summary'}>
                    {c && <p className="mb-2 text-xs">Reference <strong className="text-referenced-700">{c.reference}</strong> · <Chip tone={levelTone(c.status.replace(/_/g, ' '))}>{c.status.replace(/_/g, ' ')}</Chip></p>}
                    {kind === 'change' && sc ? (
                        <dl className="space-y-1 text-xs">{[['Requested By', sc.requestedBy], ['Change Type', sc.changeType], ['Reason', sc.reason], ['Gate', sc.gate]].map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
                    ) : (
                        <dl className="space-y-1 text-xs">{summary.map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
                    )}
                    {['pause', 'cancel', 'restart'].includes(kind) && <p className="mt-3 flex gap-1.5 rounded bg-attested-50 p-2 text-[0.65rem] text-attested-700"><TriangleAlert className="size-3.5 shrink-0" />{kind === 'cancel' ? 'Cancellation is final and cannot be undone.' : 'All completed work and data remain secure and available.'}</p>}
                </SectionCard>

                <div className="space-y-4">
                    {kind === 'change' && sc && (
                        <>
                            <SectionCard title="Proposed Changes Summary">
                                <table className="w-full text-xs"><thead className="text-ink-500"><tr><th className="text-left">Category</th><th className="text-left">Current Scope</th><th className="text-left">Proposed Change</th><th className="text-left">Rationale</th></tr></thead><tbody className="divide-y divide-parchment-300">{(sc.changes as string[][]).map(([a, b, cc, d]) => <tr key={a}><td className="py-1.5 font-medium">{a}</td><td>{b}</td><td>{cc}</td><td className="text-ink-600">{d}</td></tr>)}</tbody></table>
                            </SectionCard>
                            <SectionCard title="Impact Assessment"><ul className="grid gap-2 text-xs sm:grid-cols-3">{(sc.impact as string[][]).map(([t, l, d]) => <li key={t} className="rounded border border-parchment-300 p-2"><strong className="block">{t}</strong><Chip tone={l === 'Positive' ? 'good' : 'warn'}>{l}</Chip><p className="mt-1 text-ink-600">{d}</p></li>)}</ul></SectionCard>
                        </>
                    )}
                    {(kind === 'refund' || kind === 'dispute' || kind === 'pause' || kind === 'restart' || kind === 'cancel') && (
                        <SectionCard title={{ refund: 'Refund Request Information', dispute: 'Dispute Description', pause: 'Pause Request', restart: 'Restart Preferences', cancel: 'Cancellation Reason', change: '' }[kind]}>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {kind === 'refund' && <><Field label="Refund Type">{(id) => <Select id={id} options={['Partially Unused Service', 'Undelivered Output', 'Duplicate Payment']} />}</Field><Field label="Related To">{(id) => <Select id={id} options={['Due Diligence Handoff', 'Verification', 'Deep Dive']} />}</Field></>}
                                {kind === 'dispute' && <><Field label="Dispute Type">{(id) => <Select id={id} options={['Delay in Delivery', 'Quality of Deliverable', 'Fee / Invoice', 'Other']} />}</Field><Field label="Related To">{(id) => <Select id={id} options={['Deliverable / Timeline', 'Fees', 'Advisor conduct']} />}</Field></>}
                                {kind === 'pause' && <><Field label="Reason for Pausing" required>{(id) => <Select id={id} options={['Cashflow Management', 'Internal Board Review', 'Awaiting Third-Party Input', 'Other']} />}</Field><Field label="Expected Pause Duration" required>{(id) => <Select id={id} options={['14 Days', '30 Days', '60 Days', '90 Days']} defaultValue="30 Days" />}</Field></>}
                                {kind === 'restart' && <><Field label="Restart From">{(id) => <Select id={id} options={[`Continue from where we paused (${e.progress}%)`, 'Restart current stage']} />}</Field><Field label="Team Availability">{(id) => <Select id={id} options={['Standard (next 3 business days)', 'Priority (next business day)']} />}</Field></>}
                                {kind === 'cancel' && <Field label="Reason for Cancellation" required className="sm:col-span-2">{(id) => <Select id={id} options={['Change in Business Priorities', 'Budget Constraints', 'Project Abandoned', 'Dissatisfied with Service']} />}</Field>}
                                <Field label="Details" className="sm:col-span-2" hint="Max 1000 characters">{(id) => <Textarea id={id} maxLength={1000} />}</Field>
                                {kind === 'refund' && <Field label="Preferred Refund Method">{(id) => <Input id={id} defaultValue="Original Payment Method (Card)" />}</Field>}
                            </div>
                            {kind === 'dispute' && <p className="mt-3 text-xs text-ink-500">We aim to resolve all disputes within 10 business days. Guidelines: provide facts and evidence; we acknowledge within 1 business day.</p>}
                        </SectionCard>
                    )}
                </div>

                <div className="space-y-4">
                    {kind === 'change' && sc && (
                        <>
                            <SectionCard title="Change Readiness"><div className="flex justify-center"><ScoreRing value={sc.readiness} size={100} /></div></SectionCard>
                            <SectionCard title="Fee Impact (ex. VAT)"><dl className="space-y-1 text-xs"><div className="flex justify-between"><dt>Current Engagement Value</dt><dd>{zar2(e.fee)}</dd></div><div className="flex justify-between text-verified-700"><dt>Additional Fees</dt><dd>{zar2(sc.additionalFee)}</dd></div><div className="flex justify-between font-semibold"><dt>Revised Value</dt><dd>{zar2(e.fee + sc.additionalFee)}</dd></div><div className="flex justify-between"><dt>VAT (15%) on change</dt><dd>{zar2(vat(sc.additionalFee))}</dd></div></dl></SectionCard>
                            <SectionCard title="Timeline Impact"><p className="text-xs">+{sc.additionalDays} business days to the current plan.</p></SectionCard>
                        </>
                    )}
                    {(kind === 'refund' || kind === 'cancel') && (
                        <SectionCard title={kind === 'refund' ? 'Refund Calculation Summary' : 'Financial Settlement (ex. VAT)'}>
                            <dl className="space-y-1 text-xs">
                                <div className="flex justify-between"><dt>Total Amount Paid (ex. VAT)</dt><dd>{zar2(s.paidEx)}</dd></div>
                                <div className="flex justify-between"><dt>Earned to Date ({s.earnedPct}%)</dt><dd>{zar2(s.earned)}</dd></div>
                                <div className="flex justify-between"><dt>Committed Supplier Costs</dt><dd>{zar2(s.committed)}</dd></div>
                                <div className="flex justify-between border-t border-parchment-300 pt-1 font-semibold"><dt>Refundable (ex. VAT)</dt><dd>{zar2(s.refundableEx)}</dd></div>
                                <div className="flex justify-between"><dt>VAT (15%)</dt><dd>{zar2(vat(s.refundableEx))}</dd></div>
                                <div className="flex justify-between rounded bg-verified-50 px-1 py-1 font-bold text-verified-700"><dt>Total Refund (incl. VAT)</dt><dd>{zar2(s.refundableEx + vat(s.refundableEx))}</dd></div>
                            </dl>
                            <p className="mt-2 flex gap-1 text-[0.65rem] text-ink-500"><Info className="size-3.5 shrink-0" />Earned work and committed supplier costs are retained (Cancellation & Refund Policy). Final amounts may vary based on supplier recoveries.</p>
                        </SectionCard>
                    )}
                    {(kind === 'pause' || kind === 'restart') && (
                        <SectionCard title="Financial Impact (ex. VAT)">
                            <dl className="space-y-1 text-xs"><div className="flex justify-between"><dt>Total Engagement Value</dt><dd>{zar2(e.fee)}</dd></div><div className="flex justify-between"><dt>Earned to Date ({s.earnedPct}%)</dt><dd className="text-verified-700">{zar2(s.earned)}</dd></div><div className="flex justify-between font-semibold"><dt>Balance Due</dt><dd>{zar2(e.fee - (e.depositPaid ? e.deposit : 0))}</dd></div></dl>
                            <p className="mt-2 text-[0.65rem] text-ink-500">{kind === 'pause' ? 'Earned work is retained. No refund is due when pausing a mandate. Timelines extend by the days paused.' : 'New end date = original end date + days paused.'}</p>
                        </SectionCard>
                    )}
                    {kind === 'dispute' && (
                        <SectionCard title="Dispute Progress"><ol className="space-y-1.5 text-xs">{['Dispute Raised', 'Under Review', 'Investigation', 'Resolution', 'Closed'].map((t, i) => <li key={t} className="flex items-center gap-2">{i === 0 && c ? <CheckCircle2 className="size-4 text-verified-500" /> : <span className="flex size-4 items-center justify-center rounded-full border text-[0.6rem]">{i + 1}</span>}{t}</li>)}</ol></SectionCard>
                    )}
                </div>
            </div>
        </MandateFrame>
    );
}
