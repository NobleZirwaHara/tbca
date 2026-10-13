import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Bookmark, Bot, CheckCircle2, Headphones, Lock } from 'lucide-react';
import { useMemo } from 'react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Gauge } from '@/Components/DealRoom/Ui';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Panel } from '@/Components/ui/Kit';
import { useT } from '@/lib/i18n';
import { useBandLabel } from '@/lib/moneyBands';
import type { SharedProps } from '@/types';
import type { RaiseBand, TransactionTypeGroup } from '@/types/deal-room';

interface Props {
    /** Grouped transaction types (App\Support\DealRoom\EnquiryOptions). */
    transactionTypes: TransactionTypeGroup[];
    /** Indicative raise bands in whole ZAR; the stored value is the band code. */
    raiseBands: RaiseBand[];
    sectors: string[];
    prefill: { name: string; email: string; phone: string | null; company: string | null } | null;
}

const DRAFT_KEY = 'tbca.vdr.enquiry';
const readDraft = () => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? 'null'); } catch { return null; }
};

/** Drops draft values saved before the transaction types and raise bands changed (8 Oct 2026). */
function cleanDraft(draft: Record<string, unknown> | null, types: string[], bands: string[]) {
    if (!draft) return {};
    const { amount: _legacyAmount, ...rest } = draft;
    void _legacyAmount;
    if (typeof rest.transaction_type === 'string' && !types.includes(rest.transaction_type)) rest.transaction_type = '';
    if (typeof rest.raise_band === 'string' && !bands.includes(rest.raise_band)) rest.raise_band = '';

    return rest;
}

const stepper = [['A', 'Enquiry & Lead Qualification'], ['B', 'Diagnostic & Proposal'], ['C', 'Mandate & Payment Gate'], ['0', 'Create Room'], ['1', 'Sponsor Onboarding'], ['2', 'Data Room Build'], ['3', 'Counterparty Qualification']];

/** Stage A: enquiry form, live preliminary checks preview and fit score; submission creates the room. */
export default function Enquiry({ transactionTypes, raiseBands, sectors, prefill }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const t = useT();
    const bandLabel = useBandLabel();
    const allTypes = useMemo(() => transactionTypes.flatMap((g) => g.options), [transactionTypes]);
    const draft = useMemo(() => cleanDraft(readDraft(), allTypes, raiseBands.map((b) => b.code)), [allTypes, raiseBands]);
    const form = useForm({
        transaction_type: '', objective: '', raise_band: '', target_close_date: '', current_stage: 'Preparation',
        company: prefill?.company ?? '', jurisdiction: 'South Africa', sector: sectors[0], website: '', employees: '51 - 200', revenue: 'R50m - R200m',
        name: prefill?.name ?? '', email: prefill?.email ?? '', phone: prefill?.phone ?? '', role: 'Founder / CEO', room_name: '', authority: false,
        ...(draft ?? {}),
    });
    const d = form.data;
    const amount = raiseBands.find((b) => b.code === d.raise_band)?.indicative_zar ?? 0;
    // Indicative fit (the server recomputes on submit).
    const fit = Math.min(95, 55 + (amount >= 10_000_000 ? 10 : 0) + (d.website ? 5 : 0) + (['R50m - R200m', 'R200m+'].includes(d.revenue) ? 10 : 5) + (d.target_close_date ? 5 : 0) + (d.objective.length > 40 ? 5 : 0));
    const saveDraft = () => { try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d, authority: false })); } catch { /* storage unavailable */ } };
    const submit = () => form.post('/virtual-deal-room/enquiry', { onSuccess: () => { try { window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } } });

    return (
        <>
            <Head title="Enquiry and Lead Qualification — Virtual Deal Room" />
            <section className="bg-ink-950 text-parchment-100">
                <div className="container-tbca grid gap-6 py-8 lg:grid-cols-[1fr_1.3fr]">
                    <div>
                        <p className="text-xs font-bold tracking-wider text-gold-400 uppercase">Virtual Deal Room Access</p>
                        <h1 className="mt-2 font-serif text-3xl font-bold">Enquiry and Lead Qualification</h1>
                        <p className="mt-2 text-sm text-ink-200">Tell us about your transaction. We’ll run preliminary checks, assess fit and guide you to the best next step.</p>
                    </div>
                    <ol className="flex items-start gap-1 overflow-x-auto rounded-[8px] border border-gold-600/60 p-4">
                        {stepper.map(([c, l], i) => (
                            <li key={c} className="flex min-w-[5rem] flex-1 flex-col items-center text-center text-[0.6875rem]">
                                <span className={`flex size-9 items-center justify-center rounded-full border-2 font-bold ${i === 0 ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-ink-500 text-ink-300'}`}>{c}</span>
                                <span className={`mt-1 ${i === 0 ? 'font-semibold text-gold-300' : 'text-ink-300'}`}>{l}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
            <div className="bg-parchment-200 py-6">
                <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="container-tbca grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_20rem]">
                    <div className="space-y-5">
                        <Panel title="1. About Your Transaction">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label={t('Transaction Type')} required error={form.errors.transaction_type}>
                                    {(id) => (
                                        <Select
                                            id={id}
                                            value={d.transaction_type}
                                            onChange={(e) => form.setData('transaction_type', e.target.value)}
                                            placeholder={t('Select a transaction type')}
                                            options={transactionTypes.map((g) => ({ group: t(g.group), options: g.options.map((o) => ({ value: o, label: t(o) })) }))}
                                        />
                                    )}
                                </Field>
                                <Field label="Objective" required error={form.errors.objective} hint={`${d.objective.length} / 250`}>{(id) => <Textarea id={id} maxLength={250} value={d.objective} onChange={(e) => form.setData('objective', e.target.value)} className="min-h-16" placeholder="Raise growth capital to expand our digital lending platform across Africa" />}</Field>
                                <Field label={t('Indicative Raise / Deal Amount')} required error={form.errors.raise_band} hint={t('Bands are set in South African rand and shown in your selected currency.')}>
                                    {(id) => (
                                        <Select
                                            id={id}
                                            value={d.raise_band}
                                            onChange={(e) => form.setData('raise_band', e.target.value)}
                                            placeholder={t('Select a range')}
                                            options={raiseBands.map((b) => ({ value: b.code, label: bandLabel(b) }))}
                                        />
                                    )}
                                </Field>
                                <Field label="Target Close Date" error={form.errors.target_close_date}>{(id) => <Input id={id} type="date" value={d.target_close_date} onChange={(e) => form.setData('target_close_date', e.target.value)} />}</Field>
                                <Field label="Current Stage" error={form.errors.current_stage}>{(id) => <Select id={id} value={d.current_stage} onChange={(e) => form.setData('current_stage', e.target.value)} options={['Preparation', 'Early Interest', 'Active Diligence', 'Negotiation', 'Closing']} />}</Field>
                                <Field label="Company / Organisation Name" required error={form.errors.company}>{(id) => <Input id={id} value={d.company} onChange={(e) => form.setData('company', e.target.value)} />}</Field>
                                <Field label="Jurisdiction of Incorporation" required error={form.errors.jurisdiction}>{(id) => <Select id={id} value={d.jurisdiction} onChange={(e) => form.setData('jurisdiction', e.target.value)} options={['South Africa', 'Kenya', 'Nigeria', 'Ghana', 'Mauritius', 'Egypt', 'Morocco', 'Rwanda', 'Botswana', 'Namibia']} />}</Field>
                                <Field label="Primary Sector" required error={form.errors.sector}>{(id) => <Select id={id} value={d.sector} onChange={(e) => form.setData('sector', e.target.value)} options={sectors} />}</Field>
                                <Field label="Company Website" error={form.errors.website}>{(id) => <Input id={id} type="url" placeholder="https://" value={d.website} onChange={(e) => form.setData('website', e.target.value)} />}</Field>
                                <Field label="Number of Employees">{(id) => <Select id={id} value={d.employees} onChange={(e) => form.setData('employees', e.target.value)} options={['1 - 10', '11 - 50', '51 - 200', '201 - 1000', '1000+']} />}</Field>
                                <Field label="Annual Revenue (ZAR)">{(id) => <Select id={id} value={d.revenue} onChange={(e) => form.setData('revenue', e.target.value)} options={['< R5m', 'R5m - R50m', 'R50m - R200m', 'R200m+']} />}</Field>
                                <Field label="Proposed Deal Room Name" hint="Optional — defaults to company + transaction">{(id) => <Input id={id} value={d.room_name} onChange={(e) => form.setData('room_name', e.target.value)} />}</Field>
                            </div>
                        </Panel>
                        <Panel title="2. Your Details">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Full Name" required error={form.errors.name}>{(id) => <Input id={id} value={d.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                                <Field label="Email" required error={form.errors.email}>{(id) => <Input id={id} type="email" value={d.email} onChange={(e) => form.setData('email', e.target.value)} />}</Field>
                                <Field label="Phone" error={form.errors.phone}>{(id) => <Input id={id} value={d.phone ?? ''} onChange={(e) => form.setData('phone', e.target.value)} />}</Field>
                                <Field label="Role" required>{(id) => <Select id={id} value={d.role} onChange={(e) => form.setData('role', e.target.value)} options={['Founder / CEO', 'CFO / Finance Lead', 'Board Member', 'Investor', 'Advisor', 'Other']} />}</Field>
                            </div>
                            <div className="mt-4 rounded bg-gold-50 p-3">
                                <Checkbox checked={d.authority} onChange={(e) => form.setData('authority', e.target.checked)} label={<>I confirm I have the authority to make this enquiry and share the information provided. By continuing, you agree to our <Link href="/privacy" className="underline">Privacy Policy</Link> and acknowledge our use of AI for preliminary assessment only.</>} />
                                {form.errors.authority && <p role="alert" className="mt-1 text-xs text-risk-500">{form.errors.authority}</p>}
                            </div>
                        </Panel>
                    </div>
                    <div className="space-y-5">
                        <Panel title="3. Preliminary Checks">
                            <ul className="space-y-2 text-[0.8125rem]">
                                {[['Conflict of Interest Check', 'Run on submit'], ['Sanctions & Watchlist Screening', 'Run on submit'], ['Adverse Media Screening', 'Run on submit'], ['Preliminary AML Risk Check', 'Run on submit'], ['Data Privacy Compliance Check', d.authority ? 'Consent given' : 'Consent required']].map(([l, s]) => (
                                    <li key={l} className="flex items-center justify-between gap-2 border-b border-parchment-300 pb-1.5"><span>{l}</span><span className="flex items-center gap-1 text-xs text-ink-500">{s}<CheckCircle2 className="size-4 text-verified-500" aria-hidden /></span></li>
                                ))}
                            </ul>
                        </Panel>
                        <Panel title="4. Qualification Outcome">
                            <div className="flex flex-col items-center">
                                <Gauge value={fit} label={fit >= 80 ? 'Good Fit' : fit >= 60 ? 'Fair Fit' : 'Needs review'} caption="Indicative — confirmed on submission" />
                                <div className="mt-3 w-full rounded border border-gold-400 bg-gold-50 p-3 text-xs"><strong className="block text-sm">Proceed to Diagnostic (Paid)</strong>Get a tailored assessment and scope. The diagnostic fee is billed with the Stage C activation deposit.</div>
                            </div>
                        </Panel>
                    </div>
                    <aside className="space-y-5">
                        <Panel title="AI Intake Assistant">
                            <p className="flex items-start gap-2 text-xs text-ink-700"><Bot className="size-5 shrink-0 text-gold-600" aria-hidden />Michaela · Source-grounded. Once you submit, I’ll run the preliminary checks and recommend the right path: diagnostic, scope, timeline and fee estimate.</p>
                            <div className="mt-2 flex flex-wrap gap-1">{['What is the diagnostic?', 'How long does it take?', 'What does it include?'].map((q) => <button type="button" key={q} onClick={() => openAskQuestion({ subject: q, section: 'Virtual Deal Room' })} className="rounded-full border border-parchment-500 px-2 py-0.5 text-[0.6875rem] hover:border-gold-500">{q}</button>)}</div>
                        </Panel>
                        <Panel title="Next Best Actions">
                            <ul className="space-y-2 text-xs">
                                <li className="flex items-center justify-between gap-2">Book a 15-minute discovery call (optional)<Link href="/discovery-call" className="rounded border border-parchment-500 px-2 py-0.5">Book Call</Link></li>
                                <li className="flex items-center justify-between gap-2">Proceed to Diagnostic & Proposal<span className="rounded bg-gold-500 px-2 py-0.5 font-semibold">Continue</span></li>
                                <li className="flex items-center justify-between gap-2">Save enquiry and continue later<button type="button" onClick={saveDraft} className="rounded border border-parchment-500 px-2 py-0.5">Save Draft</button></li>
                            </ul>
                        </Panel>
                    </aside>
                    <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-gold-400 bg-white p-3 xl:col-span-3">
                        <button type="button" onClick={saveDraft} className="mr-auto inline-flex items-center gap-1.5 text-sm font-medium text-gold-700"><Bookmark className="size-4" aria-hidden /> Save and Continue Later</button>
                        <Button type="button" variant="outline" size="sm" onClick={() => openAskQuestion({ subject: 'Talk to a TBCA transaction advisor', section: 'Virtual Deal Room' })}><Headphones className="size-4" aria-hidden /> Talk to TBCA Advisor</Button>
                        {auth.user ? (
                            <Button type="submit" disabled={form.processing}>Proceed to Diagnostic (Paid) <ArrowRight className="size-4" aria-hidden /></Button>
                        ) : (
                            <Link href="/login" onClick={saveDraft} className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900"><Lock className="size-4" aria-hidden /> Sign in to submit (draft is saved)</Link>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}
