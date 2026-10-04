import { Head, Link, router, useForm } from '@inertiajs/react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button } from '@/Components/ui/Button';
import { Progress } from '@/Components/ui/Kit';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, InfoRows } from '@/Components/Marketplace/ui';
import { cn } from '@/lib/cn';
import type { Option } from '@/types/marketplace';

interface Props {
    step: number;
    steps: [string, string][];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: Record<string, any>;
    options: { countries: Option[]; businessTypes: Option[]; years: Option[]; headcount: Option[]; services: Option[]; established: Option[] };
    guest: boolean;
}

export default function ProviderApply({ step, steps, data, options, guest }: Props) {
    const form = useForm<Record<string, any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
{
        registered_name: '', trading_name: '', registration_number: '', country: 'South Africa', year_established: '', business_type: '', vat_number: '',
        contact_name: '', designation: '', email: '', phone: '', linkedin: '', description: '', services: [] as string[], years_operating: '', professionals: '',
        portfolio: '', countries: [] as string[], certifications: [] as string[], additional: '', confirm_accuracy: false, consent_vetting: false, password: '', password_confirmation: '',
        ...data,
    });
    const v = (k: string) => (form.data[k] as string) ?? '';
    const arr = (k: string) => (form.data[k] as string[]) ?? [];
    const err = (k: string) => form.errors[k as keyof typeof form.errors];
    const toggle = (k: string, val: string) => form.setData(k, arr(k).includes(val) ? arr(k).filter((x) => x !== val) : [...arr(k), val]);
    const submit = (e: React.FormEvent) => { e.preventDefault(); form.post(`/marketplace/providers/apply/${step}`); };
    const text = (k: string, label: string, req = false, type = 'text', ph = '') => (
        <Field label={label} required={req} error={err(k)}>{(id) => <Input id={id} type={type} value={v(k)} placeholder={ph} onChange={(e) => form.setData(k, e.target.value)} />}</Field>
    );
    const select = (k: string, label: string, opts: Option[], req = true) => (
        <Field label={label} required={req} error={err(k)}>{(id) => <Select id={id} value={v(k)} options={opts} placeholder="Select" onChange={(e) => form.setData(k, e.target.value)} />}</Field>
    );
    const chips = (k: string, opts: Option[]) => (
        <div className="flex flex-wrap gap-2">
            {opts.map((o) => (
                <button key={o.value} type="button" aria-pressed={arr(k).includes(o.value)} onClick={() => toggle(k, o.value)}
                    className={cn('rounded-full border px-3 py-1 text-xs', arr(k).includes(o.value) ? 'border-gold-500 bg-gold-50 font-semibold text-gold-800' : 'border-parchment-500 text-ink-600')}>{o.label}</button>
            ))}
        </div>
    );
    const label = (list: Option[], val: string) => list.find((o) => o.value === val)?.label ?? val;

    return (
        <>
            <Head title="Provider Application" />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca">
                    <Breadcrumbs items={[{ label: 'Marketplace', href: '/marketplace' }, { label: 'Provider Network', href: '/marketplace/providers' }, { label: 'Become a Provider' }, { label: 'Application' }]} />
                    <div className="grid gap-6 lg:grid-cols-12">
                        <form onSubmit={submit} className="space-y-5 lg:col-span-8">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h1 className="font-serif text-3xl font-bold text-ink-900">Provider Application</h1>
                                    <p className="text-sm text-ink-500">Join the TBCA Marketplace and grow your business with trusted clients across Africa.</p>
                                </div>
                                <div className="flex max-w-xs gap-2 rounded-[8px] border border-gold-400/60 bg-gold-50 p-3 text-xs text-ink-600">
                                    <ShieldCheck className="size-5 shrink-0 text-gold-600" aria-hidden="true" />
                                    <p><strong className="text-ink-900">Our Commitment.</strong> A fair, transparent and quality-driven onboarding process. All applications are reviewed for quality, capability and compliance.</p>
                                </div>
                            </div>
                            <Card number={step} title={steps[step - 1][0]}>
                                {step === 1 && (
                                    <div className="grid gap-4 md:grid-cols-3">
                                        {text('registered_name', 'Registered Business Name', true)}
                                        {text('trading_name', 'Trading Name (If different)')}
                                        {text('registration_number', 'Business Registration Number', true)}
                                        {select('country', 'Country of Registration', options.countries)}
                                        {select('year_established', 'Year Established', options.established)}
                                        {select('business_type', 'Business Type', options.businessTypes)}
                                        {text('vat_number', 'VAT Number (If applicable)')}
                                    </div>
                                )}
                                {step === 2 && (
                                    <div className="grid gap-4 md:grid-cols-3">
                                        {text('contact_name', 'Full Name', true)}
                                        {text('designation', 'Designation', true)}
                                        {text('email', 'Email Address', true, 'email')}
                                        {text('phone', 'Phone Number', true, 'tel', '+27 ')}
                                        {text('linkedin', 'LinkedIn Profile (Optional)', false, 'url', 'https://www.linkedin.com/in/yourprofile')}
                                    </div>
                                )}
                                {step === 3 && (
                                    <div className="grid gap-4">
                                        <Field label="Short Business Description" required hint={`${v('description').length} / 500 · Describe your business, services and value proposition`} error={err('description')}>
                                            {(id) => <Textarea id={id} maxLength={500} value={v('description')} onChange={(e) => form.setData('description', e.target.value)} placeholder="Tell us about your business..." />}
                                        </Field>
                                        <fieldset><legend className="mb-2 text-[0.8125rem] font-medium text-ink-800">Core Services Offered <span className="text-risk-500">*</span></legend>{chips('services', options.services)}{err('services') && <p role="alert" className="mt-1 text-xs text-risk-500">{err('services')}</p>}</fieldset>
                                    </div>
                                )}
                                {step === 4 && (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {select('years_operating', 'Years in Operation', options.years)}
                                        {select('professionals', 'Number of Full-time Professionals', options.headcount)}
                                        <Field label="Track record / portfolio highlights" className="md:col-span-2" error={err('portfolio')}>{(id) => <Textarea id={id} maxLength={500} value={v('portfolio')} onChange={(e) => form.setData('portfolio', e.target.value)} />}</Field>
                                    </div>
                                )}
                                {step === 5 && (
                                    <fieldset><legend className="mb-2 text-[0.8125rem] font-medium text-ink-800">Primary Countries of Operation <span className="text-risk-500">*</span></legend>{chips('countries', options.countries)}{err('countries') && <p role="alert" className="mt-1 text-xs text-risk-500">{err('countries')}</p>}</fieldset>
                                )}
                                {step === 6 && (
                                    <div className="grid gap-4">
                                        <Field label="Certifications & Memberships (Optional)" hint="Enter certificate / membership document names, one per line (PDF, JPG, PNG). Files are requested during vetting.">
                                            {(id) => <Textarea id={id} value={arr('certifications').join('\n')} onChange={(e) => form.setData('certifications', e.target.value.split('\n').filter(Boolean))} placeholder="e.g. CFA_Charter.pdf" />}
                                        </Field>
                                        <Field label="Additional Information (Optional)" hint={`${v('additional').length} / 500`}>{(id) => <Textarea id={id} maxLength={500} value={v('additional')} onChange={(e) => form.setData('additional', e.target.value)} placeholder="Share additional information..." />}</Field>
                                    </div>
                                )}
                                {step === 7 && (
                                    <div className="space-y-4">
                                        <InfoRows rows={[
                                            ['Registered Business', v('registered_name')], ['Registration Number', v('registration_number')], ['Country', v('country')], ['Business Type', v('business_type')],
                                            ['Contact', `${v('contact_name')} (${v('designation')})`], ['Email / Phone', `${v('email')} · ${v('phone')}`],
                                            ['Core Services', arr('services').map((s) => label(options.services, s)).join(', ')], ['Experience', `${v('years_operating')} · ${v('professionals')} professionals`],
                                            ['Countries', arr('countries').join(', ')], ['Certifications', arr('certifications').join(', ') || 'None listed'],
                                        ]} />
                                        {guest && (
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {text('password', 'Create provider portal password', true, 'password')}
                                                {text('password_confirmation', 'Confirm password', true, 'password')}
                                            </div>
                                        )}
                                        <Checkbox label="I confirm the information provided is accurate and complete." checked={!!form.data.confirm_accuracy} onChange={(e) => form.setData('confirm_accuracy', e.target.checked)} />
                                        {err('confirm_accuracy') && <p role="alert" className="text-xs text-risk-500">{err('confirm_accuracy')}</p>}
                                        <Checkbox label="I consent to TBCA vetting: ID, credentials, tax, references and sanctions screening." checked={!!form.data.consent_vetting} onChange={(e) => form.setData('consent_vetting', e.target.checked)} />
                                        {err('consent_vetting') && <p role="alert" className="text-xs text-risk-500">{err('consent_vetting')}</p>}
                                        <p className="text-xs text-ink-500">Submission of an application does not create approval. Approved providers sign the Provider Agreement before receiving work.</p>
                                    </div>
                                )}
                            </Card>
                            <div className="flex flex-wrap justify-between gap-3">
                                <Button type="button" variant="outline" onClick={() => router.post(`/marketplace/providers/apply/${step}`, { ...form.data, save_exit: 1 })}>Save and Exit</Button>
                                <div className="flex gap-3">
                                    {step > 1 && <Link href={`/marketplace/providers/apply/${step - 1}`} className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 px-5 text-sm">Previous</Link>}
                                    <Button type="submit" disabled={form.processing} trailingIcon="arrow-right">{step === 7 ? 'Submit Application' : 'Save and Continue'}</Button>
                                </div>
                            </div>
                        </form>
                        <aside className="space-y-4 lg:col-span-4">
                            <Card title="Application Progress" action={<span className="text-xs text-controlled-600">Step {step} of 7</span>}>
                                <Progress value={(step / 7) * 100} />
                                <p className="mt-1 text-right text-xs text-ink-500">{Math.round((step / 7) * 100)}% Complete</p>
                                <ol className="mt-3 space-y-3">
                                    {steps.map(([t, s], i) => (
                                        <li key={t} className="flex gap-3">
                                            <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', i + 1 < step ? 'bg-verified-500 text-white' : i + 1 === step ? 'bg-controlled-600 text-white' : 'bg-parchment-300 text-ink-500')}>{i + 1 < step ? '✓' : i + 1}</span>
                                            <span><span className="block text-sm font-semibold text-ink-900">{t}</span><span className="text-xs text-ink-500">{s}</span></span>
                                        </li>
                                    ))}
                                </ol>
                            </Card>
                            <Card title="Why Partner with TBCA?">
                                <ul className="space-y-1.5 text-sm text-ink-700">
                                    {['Access to high-quality clients and projects', 'Transparent process and fair opportunities', 'Timely payments and secure platform', 'Grow your reputation and visibility', "Be part of Africa's growth ecosystem"].map((x) => <li key={x} className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" />{x}</li>)}
                                </ul>
                            </Card>
                            <Card title="Need Help?">
                                <p className="text-sm text-ink-600">Our provider success team is here to help.</p>
                                <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={() => openAskQuestion({ subject: 'Provider application', section: 'marketplace' })}>Ask a Question</Button>
                            </Card>
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}
