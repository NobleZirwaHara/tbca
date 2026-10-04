import { Head, Link, useForm } from '@inertiajs/react';
import { CircleCheck, CircleX, Info, Lock, TriangleAlert } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { StatusPill, Stepper } from '@/Components/ui/Kit';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { PartnerShell } from '@/Components/Marketplace/Shells';
import { Card, CodeChip, InfoRows, Notice } from '@/Components/Marketplace/ui';
import { money } from '@/Components/Marketplace/PartnerKit';
import { cn } from '@/lib/cn';
import type { MkPartnerRequest } from '@/types/marketplace';

interface Props { request: MkPartnerRequest; practitioners: string[]; recent: { reference: string; client: string | null; date: string; result: string }[] }

const RECORDS = ['Clients', 'Adverse Parties', 'Related Entities', 'Directors/Key Individuals', 'Prior Matters', 'Personal Interests'];
const RESULTS = [['clear', 'Clear', 'No conflicts identified.', CircleCheck, 'text-verified-500'], ['clear_with_conditions', 'Clear with Conditions', 'Conditions apply.', TriangleAlert, 'text-attested-500'], ['conflicted', 'Conflicted', 'Cannot act.', CircleX, 'text-risk-500']] as const;

export default function Opportunity({ request: r, practitioners, recent }: Props) {
    const pending = r.stage === 'conflict_pending';
    const form = useForm({ performed_by: practitioners[0] ?? '', method: 'Firm Conflict System', result: '', performed_on: new Date().toISOString().slice(0, 10), records: [...RECORDS], notes: '', attest: false });
    const step = pending ? 2 : ['proposal', 'scope_quote'].includes(r.stage) ? 3 : ['delivery', 'qa_review'].includes(r.stage) ? 5 : 4;

    return (
        <PartnerShell crumbs={[{ label: 'Partner Dashboard', href: '/partner-services/workspace' }, { label: `Opportunity ${r.reference}` }, { label: 'Opportunity & Conflict Check' }]} title={<span className="flex items-center gap-3">Opportunity &amp; Conflict Check <CodeChip code="PS-020" /></span>}
            description="Review the opportunity details and complete the mandatory conflict check before proceeding." actions={<div className="text-right text-xs text-ink-500">Opportunity Reference<p className="font-serif text-xl font-bold text-ink-900">{r.reference}</p></div>}>
            <Head title={`Opportunity ${r.reference}`} />
            <div className="mb-5 max-w-3xl"><Stepper steps={['Opportunity Details', 'Conflict Check', 'Scope & Quote', 'Engagement', 'Delivery']} current={step} /></div>
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-8">
                    <Card title="A. Opportunity Details (Provided by TBCA)">
                        <div className="grid gap-x-6 md:grid-cols-3">
                            <InfoRows dense rows={[['Client', r.clientName], ['Description', r.title], ['Estimated Value', `${money(r.quote.p ?? r.partner?.profile.standard_fee ?? 0)} (P Component)`], ['Requested By', r.meta.requested_by ?? 'TBCA Client Advisor']]} />
                            <InfoRows dense rows={[['Jurisdiction', r.intake.jurisdiction], ['Profession Required', r.resolution.profession ?? r.intake.profession], ['Arrangement', r.arrangement], ['Fee Mechanism', r.feeMechanism], ['Confidentiality Level', 'Confidential – Standard']]} />
                            <InfoRows dense rows={[['Date Received', r.requestedOn], ['Intended Use / Purpose', r.intake.intended_use], ['Scope Summary', r.intake.description], ['Originating Vehicle', r.meta.originating_vehicle ?? '—'], ['Information Pack', 'Minimum Necessary']]} />
                        </div>
                    </Card>
                    {pending ? (
                        <form onSubmit={(e) => { e.preventDefault(); form.post(`/partner-services/workspace/opportunities/${r.reference}/conflict`); }}>
                            <Card title="B. Conflict Check (To be completed by Partner Practitioner/Firm)">
                                <p className="-mt-2 mb-3 text-xs text-ink-500">Please confirm that you have conducted the appropriate conflict check using your firm&apos;s systems and records.</p>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-3">
                                        <Field label="Conflict Check Performed By" required error={form.errors.performed_by}>{(id) => <Select id={id} value={form.data.performed_by} options={practitioners} onChange={(e) => form.setData('performed_by', e.target.value)} />}</Field>
                                        <Field label="Check Performed On" required error={form.errors.performed_on}>{(id) => <Input id={id} type="date" value={form.data.performed_on} onChange={(e) => form.setData('performed_on', e.target.value)} />}</Field>
                                    </div>
                                    <div className="space-y-3">
                                        <Field label="Conflict Check Method" required error={form.errors.method}>{(id) => <Select id={id} value={form.data.method} options={['Firm Conflict System', 'Manual Register Search', 'Third-party Screening Tool']} onChange={(e) => form.setData('method', e.target.value)} />}</Field>
                                        <fieldset><legend className="text-[0.8125rem] font-medium">Records Searched <span className="text-risk-500">*</span></legend><div className="mt-1 grid grid-cols-2 gap-1">{RECORDS.map((rec) => <Checkbox key={rec} label={<span className="text-xs">{rec}</span>} checked={form.data.records.includes(rec)} onChange={() => form.setData('records', form.data.records.includes(rec) ? form.data.records.filter((x) => x !== rec) : [...form.data.records, rec])} />)}</div></fieldset>
                                    </div>
                                    <fieldset>
                                        <legend className="mb-1 text-[0.8125rem] font-medium">Conflict Check Result <span className="text-risk-500">*</span></legend>
                                        <div role="radiogroup" className="grid grid-cols-3 gap-2 md:grid-cols-1 lg:grid-cols-3">{RESULTS.map(([k, t, s, I, c]) => <button key={k} type="button" role="radio" aria-checked={form.data.result === k} onClick={() => form.setData('result', k)} className={cn('rounded-[6px] border p-2 text-center', form.data.result === k ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-parchment-400 bg-white')}><I className={cn('mx-auto size-6', c)} aria-hidden="true" /><span className="block text-xs font-semibold">{t}</span><span className="text-[0.625rem] text-ink-500">{s}</span></button>)}</div>
                                        {form.errors.result && <p role="alert" className="text-xs text-risk-500">{form.errors.result}</p>}
                                    </fieldset>
                                </div>
                                <Field label="Notes / Conditions (if applicable)" className="mt-3" error={form.errors.notes}>{(id) => <Textarea id={id} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} placeholder="Enter any conditions or notes (if applicable)" />}</Field>
                                <Checkbox className="mt-3" label="By confirming, I attest that the conflict check has been performed in accordance with my professional obligations and TBCA Partner Services requirements." checked={form.data.attest} onChange={(e) => form.setData('attest', e.target.checked)} />
                                {form.errors.attest && <p role="alert" className="text-xs text-risk-500">{form.errors.attest}</p>}
                                <div className="mt-4 flex flex-wrap justify-between gap-3">
                                    <Link href="/partner-services/workspace" className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 px-5 text-sm">← Back to Opportunities</Link>
                                    <div className="text-center"><Button type="submit" disabled={form.processing || !form.data.result} trailingIcon="arrow-right">Submit Conflict Result</Button><p className="mt-1 flex items-center justify-center gap-1 text-xs text-ink-500"><Lock className="size-3" aria-hidden="true" />Next: Scope &amp; Quote (Unlocked after clearance)</p></div>
                                </div>
                            </Card>
                        </form>
                    ) : (
                        <Notice tone={r.conflictState.startsWith('CLEAR') ? 'good' : 'info'}>Conflict check submitted: <strong>{r.conflictState.replace(/_/g, ' ')}</strong>{r.meta.conflict?.submitted_at ? ` on ${r.meta.conflict.submitted_at}` : ''}. {r.conflictState.startsWith('CLEAR') && <Link href={`/partner-services/workspace/opportunities/${r.reference}/quote`} className="font-semibold underline">Go to Scope &amp; Quote</Link>}</Notice>
                    )}
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="Opportunity Summary"><InfoRows dense rows={[['Reference', r.reference], ['Client', r.clientName], ['Profession', r.resolution.profession], ['Arrangement', r.arrangement], ['Fee Mechanism', r.feeMechanism], ['Potential P Fee', money(r.quote.p ?? r.partner?.profile.standard_fee ?? 0)]]} /></Card>
                    <Card tone="cream" title="Conflict Check Requirements"><ul className="space-y-1.5 text-sm">{['You must be independent and free from conflicts.', 'Check must cover all relevant entities and relationships.', 'Keep all conflict information confidential.', 'Update TBCA immediately if conflict status changes.'].map((x) => <li key={x} className="flex gap-2"><CircleCheck className="size-4 shrink-0 text-verified-500" aria-hidden="true" />{x}</li>)}</ul></Card>
                    <Card title="Recent Conflict Checks">
                        <table className="w-full text-xs"><thead className="text-ink-500"><tr><th scope="col" className="text-left font-medium">Reference</th><th scope="col" className="text-left font-medium">Client</th><th scope="col" className="text-left font-medium">Result</th></tr></thead><tbody className="divide-y divide-parchment-300">{recent.map((x) => <tr key={x.reference}><td className="py-1.5">{x.reference}</td><td className="py-1.5">{x.client}</td><td className="py-1.5"><StatusPill status={x.result.replace(/_/g, ' ')} tone={x.result === 'conflicted' ? 'bad' : 'good'} /></td></tr>)}</tbody></table>
                    </Card>
                    <p className="flex gap-2 text-xs text-ink-500"><Info className="size-4 shrink-0" aria-hidden="true" />No fee may be requested or accepted, and no professional work may start, before conflict clearance.</p>
                </aside>
            </div>
        </PartnerShell>
    );
}

Opportunity.layout = null;
