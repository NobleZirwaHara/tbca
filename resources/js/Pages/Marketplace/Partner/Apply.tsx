import { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { CheckCircle2, ClipboardList, FileText, Info, ShieldCheck } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button } from '@/Components/ui/Button';
import { Stepper, StatusPill } from '@/Components/ui/Kit';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Card, CodeChip, InfoRows } from '@/Components/Marketplace/ui';
import { PsBody } from '@/Components/Marketplace/PartnerKit';
import { cn } from '@/lib/cn';
import type { Option } from '@/types/marketplace';

interface Props {
    step: number;
    steps: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
    reference: string;
    documents: { key: string; name: string; desc: string; required: boolean }[];
    agreementDocs: string[];
    guest: boolean;
    options: { entityTypes: Option[]; countries: Option[]; provinces: Option[]; bbbee: Option[]; professions: Option[] };
}

const CODES = ['PS-016', 'PS-016', 'PS-017', 'PS-018', 'PS-018', 'PS-018'];

export default function Apply({ step, steps, data, reference, documents, agreementDocs, guest, options }: Props) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const form = useForm<Record<string, any>>({
        legal_name: '', entity_type: '', year_established: '', trading_name: '', country: 'South Africa', bbbee: '', registration_number: '', vat_number: '', primary_contact: '',
        physical_address: '', postal_address: '', city: '', province: '', code: '', telephone: '', mobile: '', email: '', website: '',
        practitioner_name: '', profession: '', specialisation: '', registration_body: '', professional_registration: '', jurisdictions: ['South Africa'], experience: '',
        documents: {} as Record<string, string>, indemnity_expiry: '', read_documents: false, signatory: '', capacity: '', signature: '', ack_independence: false, ack_conflicts: false, ack_indemnity: false,
        confirm_accuracy: false, consent_verification: false, password: '', password_confirmation: '', ...data,
    });
    const [preview, setPreview] = useState(0);
    const v = (k: string) => (form.data[k] ?? '') as string;
    const err = (k: string) => (form.errors as Record<string, string>)[k];
    const txt = (k: string, l: string, req = false, type = 'text', ph = '') => <Field label={l} required={req} error={err(k)}>{(id) => <Input id={id} type={type} value={v(k)} placeholder={ph} onChange={(e) => form.setData(k, e.target.value)} />}</Field>;
    const sel = (k: string, l: string, o: Option[], req = true) => <Field label={l} required={req} error={err(k)}>{(id) => <Select id={id} value={v(k)} options={o} placeholder="Select" onChange={(e) => form.setData(k, e.target.value)} />}</Field>;
    const docs = form.data.documents as Record<string, string>;
    const jur = form.data.jurisdictions as string[];

    return (
        <>
            <Head title="Partner Application" />
            <PsBody>
                <Breadcrumbs items={[{ label: 'Partner Services', href: '/partner-services' }, { label: 'Partner Network', href: '/partner-services/network' }, { label: 'Partner Application' }]} />
                <div className="grid gap-6 lg:grid-cols-12">
                    <form className="space-y-5 lg:col-span-8" onSubmit={(e) => { e.preventDefault(); form.post(`/partner-services/apply/${step}`, { preserveScroll: true }); }}>
                        <div>
                            <CodeChip code={CODES[step - 1]} />
                            <h1 className="mt-2 font-serif text-3xl font-bold text-ink-900">{step === 3 ? 'Verification & Document Submission' : step >= 4 ? 'Partner Agreement Execution' : 'Partner Application'}</h1>
                            <p className="text-sm text-ink-600">Apply to join the TBCA Partner Network. Provide information about your firm and practitioners. All applications are subject to verification and approval.</p>
                        </div>
                        <div className="overflow-x-auto"><div className="min-w-[620px]"><Stepper steps={steps} current={step} /></div></div>

                        {step === 1 && (
                            <Card title="A. Entity Details">
                                <div className="grid gap-4 md:grid-cols-3">
                                    {txt('legal_name', 'Legal Entity Name', true)}{sel('entity_type', 'Entity Type', options.entityTypes)}{txt('year_established', 'Year Established', true, 'number', 'e.g. 2015')}
                                    {txt('trading_name', 'Trading Name (If different)')}{sel('country', 'Country of Incorporation', options.countries)}{sel('bbbee', 'B-BBEE Status (If applicable)', options.bbbee, false)}
                                    {txt('registration_number', 'Registration / Company Number', true, 'text', 'e.g. 2015/123456/07')}{txt('vat_number', 'VAT Number')}{txt('primary_contact', 'Primary Contact Person', true)}
                                </div>
                                <h3 className="mt-5 mb-3 text-sm font-bold tracking-wide text-gold-700 uppercase">B. Contact Details</h3>
                                <div className="grid gap-4 md:grid-cols-3">
                                    <Field label="Physical Address" required error={err('physical_address')}>{(id) => <Textarea id={id} value={v('physical_address')} onChange={(e) => form.setData('physical_address', e.target.value)} />}</Field>
                                    <Field label="Postal Address (If different)">{(id) => <Textarea id={id} value={v('postal_address')} onChange={(e) => form.setData('postal_address', e.target.value)} />}</Field>
                                    <div className="grid gap-3">{txt('city', 'City', true)}{sel('province', 'Province', options.provinces)}{txt('code', 'Code', true, 'text', 'e.g. 2000')}</div>
                                    {txt('telephone', 'Telephone', true, 'tel', '+27 ')}{txt('mobile', 'Mobile', false, 'tel', '+27 ')}{txt('email', 'Email', true, 'email')}{txt('website', 'Website', false, 'url', 'https://www.example.co.za')}
                                </div>
                            </Card>
                        )}
                        {step === 2 && (
                            <Card title="Practitioner Details">
                                <div className="grid gap-4 md:grid-cols-2">
                                    {txt('practitioner_name', 'Lead Practitioner Full Name', true)}{sel('profession', 'Profession', options.professions)}
                                    {txt('specialisation', 'Specialisation', true, 'text', 'e.g. Environmental Impact Assessment (EIA)')}{txt('registration_body', 'Registration Body', true, 'text', 'e.g. EAPASA, LPC, SAICA')}
                                    {txt('professional_registration', 'Professional Registration Number', true)}{txt('experience', 'Years of Experience', true, 'number')}
                                    <fieldset className="md:col-span-2"><legend className="mb-2 text-[0.8125rem] font-medium">Jurisdictions of practice <span className="text-risk-500">*</span></legend>
                                        <div className="flex flex-wrap gap-2">{options.countries.map((c) => <button key={c.value} type="button" aria-pressed={jur.includes(c.value)} onClick={() => form.setData('jurisdictions', jur.includes(c.value) ? jur.filter((x) => x !== c.value) : [...jur, c.value])} className={cn('rounded-full border px-3 py-1 text-xs', jur.includes(c.value) ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-500')}>{c.label}</button>)}</div>
                                    </fieldset>
                                </div>
                            </Card>
                        )}
                        {step === 3 && (
                            <Card title="A. Required Documents">
                                <p className="mb-3 text-sm text-ink-600">Provide clear, current copies of the documents listed below (enter the file name you will upload to the verification vault).</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[620px] text-[0.8125rem]">
                                        <thead className="bg-parchment-200 text-xs text-ink-600"><tr>{['Document', 'Description', 'Required', 'File', 'Status'].map((h) => <th key={h} scope="col" className="px-2 py-2 text-left">{h}</th>)}</tr></thead>
                                        <tbody className="divide-y divide-parchment-300">
                                            {documents.map((d) => (
                                                <tr key={d.key}>
                                                    <td className="px-2 py-2 font-medium"><FileText className="mr-1 inline size-4" aria-hidden="true" />{d.name}</td><td className="px-2 py-2 text-xs text-ink-600">{d.desc}</td>
                                                    <td className="px-2 py-2"><StatusPill status={d.required ? 'Yes' : 'No'} tone={d.required ? 'good' : 'neutral'} /></td>
                                                    <td className="px-2 py-2"><Input aria-label={`${d.name} file name`} value={docs[d.key] ?? ''} placeholder="file.pdf" onChange={(e) => form.setData('documents', { ...docs, [d.key]: e.target.value })} aria-invalid={!!err(`documents.${d.key}`)} /></td>
                                                    <td className="px-2 py-2"><StatusPill status={docs[d.key] ? 'Uploaded' : 'Not Uploaded'} tone={docs[d.key] ? 'good' : 'neutral'} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {Object.keys(form.errors).some((k) => k.startsWith('documents')) && <p role="alert" className="mt-2 text-xs text-risk-500">All required documents must be provided.</p>}
                                <div className="mt-4 max-w-xs">{txt('indemnity_expiry', 'Professional indemnity expiry date', true, 'date')}</div>
                            </Card>
                        )}
                        {step === 4 && (
                            <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
                                <Card title="A. Partner Agreement Documents">
                                    <ul className="space-y-1">{agreementDocs.map((d, i) => <li key={d}><button type="button" onClick={() => setPreview(i)} className={cn('flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-xs', preview === i ? 'bg-gold-50 ring-1 ring-gold-400' : 'hover:bg-parchment-100')}><span>{String(i + 1).padStart(2, '0')} {d}</span><span className="text-verified-700">Required</span></button></li>)}</ul>
                                </Card>
                                <Card title={`${String(preview + 1).padStart(2, '0')} ${agreementDocs[preview]} (Preview)`}>
                                    <div className="max-h-80 overflow-y-auto rounded border border-parchment-400 bg-white p-5 font-serif text-sm text-ink-800">
                                        <p className="text-center font-bold">TBCA PARTNER SERVICES AGREEMENT</p><p className="text-center">between</p><p className="text-center font-bold">THE BUSINESS CLINIC.AFRICA (PTY) LTD</p><p className="text-center">and</p><p className="text-center font-bold">{(v('legal_name') || 'THE PARTNER').toUpperCase()}</p>
                                        <p className="mt-4 font-bold">1. PURPOSE</p><p>This Agreement sets out the terms under which the Partner may participate in The Business Clinic.Africa™ Partner Services Network.</p>
                                        <p className="mt-3 font-bold">2. KEY PRINCIPLES</p><p>2.1 Professional independence is preserved at all times.</p><p>2.2 Engagements are arranged under A1, A2 or A3, as authorised.</p><p>2.3 Fees are charged in accordance with M1, M2, M3 or M4, as approved.</p><p>2.4 No fee may be requested or accepted, and no professional work may commence, before matter-specific conflict clearance.</p>
                                    </div>
                                    <InfoRows dense className="mt-3" rows={[['Agreement Type', 'TBCA Partner Services Agreement'], ['Effective Date', 'Upon execution'], ['Initial Term', '12 months'], ['Renewal', 'Automatic annual renewal (subject to verification)'], ['Termination', "90 days' written notice"], ['Governing Law', 'Republic of South Africa']]} />
                                    <Checkbox className="mt-3" label="I have read and understood all agreement documents and appendices in full." checked={!!form.data.read_documents} onChange={(e) => form.setData('read_documents', e.target.checked)} />
                                    {err('read_documents') && <p role="alert" className="text-xs text-risk-500">{err('read_documents')}</p>}
                                </Card>
                            </div>
                        )}
                        {step === 5 && (
                            <Card title="Sign & Execute">
                                <div className="grid gap-4 md:grid-cols-3">{txt('signatory', 'Full Name', true)}{txt('capacity', 'Capacity', true, 'text', 'e.g. Director')}{txt('signature', 'Type your signature', true)}</div>
                                <div className="mt-4 space-y-2">
                                    <Checkbox label="Professional independence is confirmed for all practitioners." checked={!!form.data.ack_independence} onChange={(e) => form.setData('ack_independence', e.target.checked)} />
                                    <Checkbox label="Conflicts of interest policy accepted." checked={!!form.data.ack_conflicts} onChange={(e) => form.setData('ack_conflicts', e.target.checked)} />
                                    <Checkbox label="Indemnity insurance requirements accepted." checked={!!form.data.ack_indemnity} onChange={(e) => form.setData('ack_indemnity', e.target.checked)} />
                                    {(err('ack_independence') || err('ack_conflicts') || err('ack_indemnity')) && <p role="alert" className="text-xs text-risk-500">All declarations are required.</p>}
                                </div>
                            </Card>
                        )}
                        {step === 6 && (
                            <Card title="Final Review">
                                <InfoRows rows={[['Application Reference', reference], ['Entity', `${v('legal_name')} (${v('entity_type')})`], ['Registration', v('registration_number')], ['Contact', `${v('primary_contact')} · ${v('email')} · ${v('telephone')}`], ['Lead Practitioner', `${v('practitioner_name')} – ${v('profession')}`], ['Registration', `${v('registration_body')} ${v('professional_registration')}`], ['Jurisdictions', jur.join(', ')], ['Documents', `${Object.values(docs).filter(Boolean).length} provided`], ['Agreement', form.data.signed_at ? `Signed ${form.data.signed_at} by ${v('signatory')}` : 'Signed']]} />
                                {guest && <div className="mt-4 grid gap-4 md:grid-cols-2">{txt('password', 'Create Partner Portal password', true, 'password')}{txt('password_confirmation', 'Confirm password', true, 'password')}</div>}
                                <div className="mt-4 space-y-2">
                                    <Checkbox label="I confirm all information is accurate, current and verifiable." checked={!!form.data.confirm_accuracy} onChange={(e) => form.setData('confirm_accuracy', e.target.checked)} />
                                    <Checkbox label="I consent to registration, indemnity, tax, sanctions and adverse-media verification." checked={!!form.data.consent_verification} onChange={(e) => form.setData('consent_verification', e.target.checked)} />
                                </div>
                            </Card>
                        )}
                        <div className="flex flex-wrap justify-between gap-3">
                            {step > 1 ? <Link href={`/partner-services/apply/${step - 1}`} className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 bg-white px-5 text-sm">← Back: {steps[step - 2]}</Link> : <Link href="/partner-services/network" className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 bg-white px-5 text-sm">← Back to Partner Network</Link>}
                            <div className="flex gap-3">
                                <Button type="button" variant="outline" onClick={() => router.post(`/partner-services/apply/${step}`, { ...form.data, save_exit: 1 })}>Save &amp; Exit</Button>
                                <Button type="submit" disabled={form.processing} trailingIcon="arrow-right">{step === 4 ? 'Proceed to Sign & Execute' : step === 5 ? 'Sign & Execute' : step === 6 ? 'Submit Application' : 'Save & Continue'}</Button>
                            </div>
                        </div>
                    </form>
                    <aside className="space-y-4 lg:col-span-4">
                        <Card tone="blue" title="About the Partner Network">
                            <p className="text-sm text-ink-700">Our Partner Network connects TBCA clients with qualified, independent professionals where a professional boundary applies.</p>
                            <ul className="mt-2 space-y-1 text-sm">{['Professionals remain independent and responsible.', 'Engagements are arranged under A1, A2 or A3.', 'All partners are verified and monitored.', 'We uphold the TBCA Partner Covenant.'].map((x) => <li key={x} className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" />{x}</li>)}</ul>
                        </Card>
                        <Card tone="cream" title="Before You Apply">
                            <p className="flex items-center gap-1.5 text-sm"><ClipboardList className="size-4" aria-hidden="true" />Please ensure you have the following ready:</p>
                            <ul className="mt-1 list-disc pl-5 text-sm text-ink-700"><li>Company registration documents</li><li>Professional registrations and certificates</li><li>Professional indemnity insurance details</li><li>CVs of key practitioners</li><li>Three professional references</li></ul>
                        </Card>
                        <Card tone="green" title="Your Privacy"><p className="flex gap-2 text-sm text-ink-700"><ShieldCheck className="size-4 shrink-0" aria-hidden="true" />All information is confidential and used solely for vetting and onboarding purposes. We do not share your information with third parties.</p></Card>
                        <p className="flex gap-2 text-xs text-ink-500"><Info className="size-4 shrink-0" aria-hidden="true" />Application reference {reference}. Only complete, current and verifiable applications can be approved.</p>
                    </aside>
                </div>
            </PsBody>
        </>
    );
}
