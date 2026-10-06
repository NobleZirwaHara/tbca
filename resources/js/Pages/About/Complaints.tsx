import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowRight, Check, ChevronRight, Clock, FileText, Headphones, Lock, Mail, MessagesSquare, Phone } from 'lucide-react';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Button, ButtonLink } from '@/Components/ui/Button';
import AboutHero from '@/Components/About/AboutHero';
import FileDrop from '@/Components/About/FileDrop';

const steps = [
    ['We Acknowledge', 'We will confirm receipt of your complaint within 2 business days.'],
    ['We Investigate', 'We will investigate your complaint and may contact you for more information.'],
    ['We Respond', 'We will provide you with an outcome or proposed resolution within 10 business days.'],
    ['We Resolve', 'We will work with you to resolve the matter fairly and satisfactorily.'],
];

export default function Complaints({ options }: { options: { categories: string[]; relationships: string[] } }) {
    const form = useForm({ relationship: '', category: '', name: '', email: '', phone: '', reference: '', description: '', outcome: '', attachment: null as File | null });
    const e = form.errors;
    const submit = (ev: FormEvent) => {
        ev.preventDefault();
        form.post('/complaints', { forceFormData: true, preserveScroll: true });
    };

    return (
        <>
            <Head title="Complaints" />
            <AboutHero
                accent="purple"
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Complaints' }]}
                title="Complaints"
                lead="We listen. We act. We improve."
                intro={<>We are committed to providing a professional, fair and transparent experience for all our clients, partners and stakeholders. If something didn&apos;t go as expected, please let us know so we can <strong>put it right</strong>.</>}
                aside={
                    <div className="flex items-center justify-center">
                        <span className="inline-flex size-36 items-center justify-center rounded-full border-2 border-dashed border-violet-300 bg-violet-50 text-violet-700">
                            <MessagesSquare className="size-16" aria-hidden="true" />
                        </span>
                    </div>
                }
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-6 xl:grid-cols-[1fr_20rem_20rem]">
                    <form onSubmit={submit} className="space-y-4 rounded-[8px] border border-parchment-400 bg-white p-5">
                        <div>
                            <h2 className="font-semibold text-violet-800">1. Submit a Complaint</h2>
                            <p className="text-xs text-ink-500">Please provide as much detail as possible so we can investigate effectively.</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Your Relationship with TBCA" required error={e.relationship}>
                                {(id) => <Select id={id} placeholder="Select relationship" options={options.relationships} value={form.data.relationship} onChange={(ev) => form.setData('relationship', ev.target.value)} />}
                            </Field>
                            <Field label="Complaint Category" required error={e.category}>
                                {(id) => <Select id={id} placeholder="Select category" options={options.categories} value={form.data.category} onChange={(ev) => form.setData('category', ev.target.value)} />}
                            </Field>
                            <Field label="Full Name" required error={e.name}>
                                {(id) => <Input id={id} value={form.data.name} onChange={(ev) => form.setData('name', ev.target.value)} placeholder="Enter your full name" />}
                            </Field>
                            <Field label="Email Address" required error={e.email}>
                                {(id) => <Input id={id} type="email" value={form.data.email} onChange={(ev) => form.setData('email', ev.target.value)} placeholder="Enter your email address" />}
                            </Field>
                            <Field label="Phone Number" error={e.phone}>
                                {(id) => <Input id={id} type="tel" value={form.data.phone} onChange={(ev) => form.setData('phone', ev.target.value)} placeholder="+27 ..." />}
                            </Field>
                            <Field label="Reference / Project / Engagement (Optional)" error={e.reference}>
                                {(id) => <Input id={id} value={form.data.reference} onChange={(ev) => form.setData('reference', ev.target.value)} placeholder="Enter reference or project name" />}
                            </Field>
                        </div>
                        <Field label="Please describe your complaint" required error={e.description}>
                            {(id) => <Textarea id={id} rows={4} value={form.data.description} onChange={(ev) => form.setData('description', ev.target.value)} placeholder="Provide details of your complaint, including dates, people involved and what happened." />}
                        </Field>
                        <Field label="What outcome are you seeking?" error={e.outcome}>
                            {(id) => <Textarea id={id} rows={2} value={form.data.outcome} onChange={(ev) => form.setData('outcome', ev.target.value)} placeholder="What resolution would you like us to achieve?" />}
                        </Field>
                        <FileDrop accent="purple" label="Supporting Documents (Optional)" hint="PDF, DOC, JPG, PNG (Max 10MB)" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" file={form.data.attachment} onChange={(f) => form.setData('attachment', f)} error={e.attachment} />
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="flex items-center gap-1.5 text-xs text-ink-500"><Lock className="size-3.5" aria-hidden="true" /> We respect your privacy. Your information will only be used to resolve your complaint.</p>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => form.reset()}>Clear</Button>
                                <button type="submit" disabled={form.processing} className="inline-flex h-9 items-center gap-2 rounded-[4px] bg-violet-700 px-4 text-[0.8125rem] font-semibold text-white hover:bg-violet-800 disabled:opacity-50">
                                    Submit Complaint <ArrowRight className="size-4" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </form>

                    <div className="rounded-[8px] border border-violet-200 bg-violet-50/40 p-5">
                        <h2 className="font-semibold text-violet-800">2. Our Complaint Process</h2>
                        <p className="text-xs text-ink-500">We follow a fair and transparent process to resolve your complaint.</p>
                        <ol className="mt-4 space-y-4">
                            {steps.map(([t, b], i) => (
                                <li key={t} className="flex gap-3 border-b border-violet-200 pb-4 last:border-0">
                                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-violet-700 text-xs font-bold text-white">{i + 1}</span>
                                    <span className="text-[0.8125rem]"><span className="block font-semibold text-ink-900">{t}</span><span className="text-ink-600">{b}</span></span>
                                </li>
                            ))}
                        </ol>
                        <Link href="/terms" className="mt-2 flex items-center justify-center gap-2 rounded-[4px] border border-violet-400 px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100">
                            <FileText className="size-4" aria-hidden="true" /> View Complaints Policy
                        </Link>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-[8px] border border-controlled-500/25 bg-controlled-50/50 p-4">
                            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><Headphones className="size-5" aria-hidden="true" /> Prefer to Talk?</h2>
                            <p className="mt-1 text-xs text-ink-600">You can contact our Client Care team directly.</p>
                            <p className="mt-2 flex items-center gap-2 text-[0.8125rem]"><Phone className="size-4" aria-hidden="true" /> +27 60 801 1365</p>
                            <p className="mt-1 flex items-center gap-2 text-[0.8125rem]"><Mail className="size-4" aria-hidden="true" /> care@thebusinessclinic.africa</p>
                            <p className="mt-1 flex items-center gap-2 text-[0.8125rem]"><Clock className="size-4" aria-hidden="true" /> Mon – Fri: 08:00 – 17:00 (SAST)</p>
                            <ButtonLink href="/about/contact" variant="outline" size="sm" className="mt-3 w-full" trailingIcon="arrow-right">Contact Client Care</ButtonLink>
                        </div>
                        <div className="rounded-[8px] border border-attested-500/25 bg-attested-50/50 p-4">
                            <h2 className="font-semibold text-ink-900">What Happens Next?</h2>
                            <ul className="mt-2 space-y-1.5 text-[0.8125rem] text-ink-700">
                                {["You'll receive a case reference immediately.", "Track progress any time with your reference and email.", "We'll do our best to resolve the matter quickly and fairly."].map((t) => (
                                    <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-attested-700" aria-hidden="true" />{t}</li>
                                ))}
                            </ul>
                            <ButtonLink href="/complaints/track" variant="outline" size="sm" className="mt-3 w-full" trailingIcon="arrow-right">Track a Complaint</ButtonLink>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="font-semibold text-violet-800">Related Resources</h2>
                            <ul className="mt-2 divide-y divide-parchment-300 text-[0.8125rem]">
                                {[['Complaints Policy', '/terms#refunds'], ['Client Rights & Responsibilities', '/about/professional-boundaries'], ['Service Standards', '/about/governance'], ['Whistleblowing (serious concerns)', '/whistleblowing']].map(([l, h]) => (
                                    <li key={l}><Link href={h} className="flex items-center justify-between py-2 text-ink-800 hover:text-violet-700">{l}<ChevronRight className="size-4" aria-hidden="true" /></Link></li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
}
