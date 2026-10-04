import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowRight, CircleCheck, Handshake, Headphones, Lock, Mail, Phone } from 'lucide-react';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Button, ButtonLink } from '@/Components/ui/Button';
import AboutHero from '@/Components/About/AboutHero';
import FileDrop from '@/Components/About/FileDrop';

interface Options {
    organisation_types: string[];
    industries: string[];
    countries: string[];
    sizes: string[];
    contact_methods: string[];
    interests: string[];
}

const blank = {
    organisation: '', organisation_type: '', industry: '', country: '', website: '', size: '',
    name: '', job_title: '', email: '', phone: '', contact_method: '', linkedin: '',
    interest: '', collaboration: '', additional: '', profile: null as File | null,
};

export default function PartnerEnquiry({ options }: { options: Options }) {
    const form = useForm(blank);
    const e = form.errors;
    const text = (k: keyof typeof blank, label: string, req = true, type = 'text', ph = '') => (
        <Field label={label} required={req} error={e[k]}>
            {(id) => <Input id={id} type={type} value={form.data[k] as string} onChange={(ev) => form.setData(k, ev.target.value)} placeholder={ph} />}
        </Field>
    );
    const select = (k: keyof typeof blank, label: string, opts: string[], ph: string) => (
        <Field label={label} required error={e[k]}>
            {(id) => <Select id={id} placeholder={ph} options={opts} value={form.data[k] as string} onChange={(ev) => form.setData(k, ev.target.value)} />}
        </Field>
    );
    const submit = (ev: FormEvent) => {
        ev.preventDefault();
        form.post('/about/partner-enquiry', { forceFormData: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Partner Enquiry" />
            <AboutHero
                accent="purple"
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Partner Enquiry' }]}
                title="Partner Enquiry"
                lead="Let's build impact together."
                intro="TBCA collaborates with organisations and professionals who share our mission to unlock Africa's potential through ethical AI, human expertise and integrated value chains. Tell us about your organisation and how you would like to partner with us."
                aside={
                    <div className="flex items-center justify-center">
                        <span className="inline-flex size-36 items-center justify-center rounded-full border-2 border-dashed border-violet-300 bg-violet-50 text-violet-700">
                            <Handshake className="size-16" aria-hidden="true" />
                        </span>
                    </div>
                }
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <form onSubmit={submit} className="space-y-6 rounded-[8px] border border-parchment-400 bg-white p-5">
                        <fieldset>
                            <legend className="font-semibold text-violet-800">Partner Organisation Information</legend>
                            <div className="mt-3 grid gap-4 md:grid-cols-3">
                                {text('organisation', 'Organisation Name', true, 'text', 'Enter organisation name')}
                                {select('organisation_type', 'Organisation Type', options.organisation_types, 'Select organisation type')}
                                {select('industry', 'Industry / Sector', options.industries, 'Select industry')}
                                {select('country', 'Country / Region', options.countries, 'Select country / region')}
                                {text('website', 'Website', false, 'url', 'https://www.yourwebsite.com')}
                                {select('size', 'Organisation Size', options.sizes, 'Select size')}
                            </div>
                        </fieldset>
                        <fieldset>
                            <legend className="font-semibold text-violet-800">Contact Person</legend>
                            <div className="mt-3 grid gap-4 md:grid-cols-3">
                                {text('name', 'Full Name', true, 'text', 'Enter your full name')}
                                {text('job_title', 'Job Title', true, 'text', 'Enter your job title')}
                                {text('email', 'Email Address', true, 'email', 'Enter your email address')}
                                {text('phone', 'Phone Number', true, 'tel', '+27 ...')}
                                {select('contact_method', 'Preferred Contact Method', options.contact_methods, 'Select preferred method')}
                                {text('linkedin', 'LinkedIn Profile (Optional)', false, 'url', 'https://www.linkedin.com/in/yourprofile')}
                            </div>
                        </fieldset>
                        <fieldset>
                            <legend className="font-semibold text-violet-800">Partnership Interest</legend>
                            <div className="mt-3 grid gap-4 md:grid-cols-3">
                                {select('interest', 'Partnership Interest', options.interests, 'Select partnership type')}
                                <Field label="How can we collaborate?" required error={e.collaboration} className="md:col-span-2">
                                    {(id) => <Textarea id={id} rows={3} value={form.data.collaboration} onChange={(ev) => form.setData('collaboration', ev.target.value)} placeholder="Please describe how you see us working together." />}
                                </Field>
                            </div>
                        </fieldset>
                        <fieldset>
                            <legend className="font-semibold text-violet-800">Additional Information</legend>
                            <div className="mt-3 grid gap-4 md:grid-cols-3">
                                <FileDrop accent="purple" label="Upload Company Profile (Optional)" hint="PDF, DOC, PPT (Max 10MB)" accept=".pdf,.doc,.docx,.ppt,.pptx" file={form.data.profile} onChange={(f) => form.setData('profile', f)} error={e.profile} />
                                <Field label="Any additional information" error={e.additional} className="md:col-span-2">
                                    {(id) => <Textarea id={id} rows={4} value={form.data.additional} onChange={(ev) => form.setData('additional', ev.target.value)} placeholder="Share any other information that will help us understand your enquiry." />}
                                </Field>
                            </div>
                        </fieldset>
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-parchment-300 pt-4">
                            <p className="flex items-center gap-1.5 text-xs text-ink-500"><Lock className="size-3.5" aria-hidden="true" /> We respect your privacy. Your information will only be used to respond to your enquiry.</p>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" onClick={() => form.reset()}>Clear</Button>
                                <button type="submit" disabled={form.processing} className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-violet-700 px-5 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50">
                                    Submit Enquiry <ArrowRight className="size-4" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </form>

                    <aside className="space-y-4">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-violet-800">Why Partner with TBCA?</h2>
                            <ul className="mt-3 space-y-2">
                                {["Access to Africa's most integrated transaction ecosystem", 'Collaborate on high-impact projects across the continent', 'Leverage AI-powered tools and human expertise', 'Shared value creation and sustainable impact'].map((t) => (
                                    <li key={t} className="flex items-start gap-2 text-[0.8125rem] text-ink-700"><CircleCheck className="mt-0.5 size-4 shrink-0 text-violet-600" aria-hidden="true" />{t}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-[8px] border border-attested-500/25 bg-attested-50/50 p-5">
                            <h2 className="font-semibold text-ink-900">What Happens Next?</h2>
                            <ol className="mt-3 space-y-3">
                                {[['We receive your enquiry', 'Our team will review your information.'], ['Initial Consultation', "We'll reach out within 2 business days to schedule a conversation."], ['Explore Partnership', 'Together we\'ll explore alignment and potential opportunities.']].map(([t, b], i) => (
                                    <li key={t} className="flex gap-3 text-[0.8125rem]"><span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-attested-500 text-xs font-bold text-white">{i + 1}</span><span><span className="block font-semibold text-ink-900">{t}</span><span className="text-ink-600">{b}</span></span></li>
                                ))}
                            </ol>
                            <p className="mt-3 text-[0.6875rem] text-ink-500">A partner enquiry is not a partnership. Screening covers capability, conflicts, credentials, data/security and commercial review.</p>
                        </div>
                        <div className="rounded-[8px] border border-verified-500/25 bg-verified-50/50 p-5">
                            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><Headphones className="size-5" aria-hidden="true" /> Need Help?</h2>
                            <p className="mt-1 text-[0.8125rem] text-ink-600">Our Partner Relations Team is here to assist you.</p>
                            <p className="mt-2 flex items-center gap-2 text-[0.8125rem]"><Mail className="size-4" aria-hidden="true" /> partnerships@thebusinessclinic.africa</p>
                            <p className="mt-1 flex items-center gap-2 text-[0.8125rem]"><Phone className="size-4" aria-hidden="true" /> +27 12 001 0557</p>
                            <ButtonLink href="/complaints/track" variant="outline" size="sm" className="mt-3 w-full">Track an Enquiry</ButtonLink>
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
}
