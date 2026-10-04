import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CircleCheck, Clock, Globe, Lock, Mail, MapPin, MessageCircle, Phone, Send, Zap } from 'lucide-react';
import type { FormEvent } from 'react';
import AfricaMark from '@/Components/AfricaMark';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import type { SharedProps } from '@/types';
import type { Office } from '@/types/core-pages';

interface Props {
    offices: Office[];
    serviceAreas: string[];
    hours: { day: string; hours: string }[];
}

const darkInput = 'border-ink-700 bg-ink-900 text-parchment-100 placeholder:text-ink-400';

export default function Contact({ offices, serviceAreas, hours }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const form = useForm({
        name: auth.user?.name ?? '',
        company: auth.user?.company ?? '',
        email: auth.user?.email ?? '',
        phone: auth.user?.phone ?? '',
        service: '',
        message: '',
        subject: 'Contact enquiry',
        section: 'core',
    });
    const news = useForm({ email: '', subject: 'Newsletter subscription', section: 'core' });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.clearErrors();
        const errors: Record<string, string> = {};
        if (!form.data.name.trim()) errors.name = 'Please enter your name.';
        if (!form.data.email.trim()) errors.email = 'Please enter your email address.';
        if (!form.data.service) errors.service = 'Please select a service or area of interest.';
        if (form.data.message.trim().length < 10) errors.message = 'Please tell us a little more (at least 10 characters).';
        if (Object.keys(errors).length) {
            form.setError(errors);
            return;
        }
        form.post('/forms/contact', { preserveScroll: true, onSuccess: () => form.reset('message', 'service') });
    };

    return (
        <div className="bg-ink-950 text-parchment-200">
            <Head title="Contact TBCA" />

            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
                <div className="container-tbca relative grid gap-8 py-12 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <p className="text-[0.75rem] font-semibold tracking-[0.16em] text-gold-500 uppercase">Contact TBCA</p>
                        <h1 className="mt-3 text-[2.5rem] leading-[1.05] font-semibold text-parchment-100 md:text-[3rem]">
                            Let&rsquo;s Build Africa.
                            <br />
                            <span className="text-gold-500">Together.</span>
                        </h1>
                        <span className="mt-5 block h-0.5 w-14 bg-gold-500" aria-hidden="true" />
                        <p className="mt-5 text-[1rem] leading-relaxed text-parchment-200">
                            We are here to help you unlock opportunities, solve complex challenges and create lasting impact. Reach out to our team — we&rsquo;d love to hear from you.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <a href="#message" className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                <Send className="size-4" aria-hidden="true" /> Send an Enquiry
                            </a>
                            <Link href="/discovery-call" className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-gold-600 px-5 text-sm text-parchment-100 hover:text-gold-300">
                                <CalendarDays className="size-4" aria-hidden="true" /> Book a Consultation
                            </Link>
                        </div>
                    </div>

                    <div className="relative hidden items-center justify-center lg:col-span-3 lg:flex" aria-hidden="true">
                        <AfricaMark className="h-80 w-auto text-gold-500/70" strokeWidth={1.25} />
                    </div>

                    <form id="message" onSubmit={submit} noValidate className="rounded-[10px] border border-gold-700/50 bg-ink-900/70 p-5 lg:col-span-3">
                        <h2 className="text-[1.0625rem] font-semibold text-gold-400">Send Us a Message</h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                            <DarkField label="Your Name" required error={form.errors.name}>
                                {(id) => <Input id={id} className={darkInput} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} autoComplete="name" />}
                            </DarkField>
                            <DarkField label="Company / Organisation">
                                {(id) => <Input id={id} className={darkInput} value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} autoComplete="organization" />}
                            </DarkField>
                            <DarkField label="Email Address" required error={form.errors.email}>
                                {(id) => <Input id={id} type="email" className={darkInput} value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} autoComplete="email" />}
                            </DarkField>
                            <DarkField label="Phone Number">
                                {(id) => <Input id={id} type="tel" className={darkInput} value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} autoComplete="tel" />}
                            </DarkField>
                        </div>
                        <DarkField label="Service / Area of Interest" required error={form.errors.service} className="mt-3">
                            {(id) => <Select id={id} className={darkInput} placeholder="Select a Service" options={serviceAreas} value={form.data.service} onChange={(e) => form.setData('service', e.target.value)} />}
                        </DarkField>
                        <DarkField label="Your Message" required error={form.errors.message} className="mt-3">
                            {(id) => <Textarea id={id} className={darkInput} placeholder="Tell us about your needs or enquiry..." value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} />}
                        </DarkField>
                        <button type="submit" disabled={form.processing} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-60">
                            {form.processing ? 'Sending…' : 'Send Message'} <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                    </form>

                    <aside className="lg:col-span-2">
                        <h2 className="text-[1.0625rem] font-semibold text-gold-400">Our Offices</h2>
                        <ul className="mt-3 divide-y divide-ink-800">
                            {offices.map((o) => (
                                <li key={o.title} className="flex gap-2.5 py-3">
                                    <MapPin className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" />
                                    <div className="text-[0.8125rem] leading-snug">
                                        <p className="font-semibold text-parchment-100">{o.title}</p>
                                        {o.lines.map((l) => (
                                            <p key={l} className="text-ink-200">{l}</p>
                                        ))}
                                        <a href={`tel:${o.phone.replace(/\s/g, '')}`} className="mt-1 inline-flex items-center gap-1.5 text-parchment-100 hover:text-gold-300">
                                            <Phone className="size-3.5 text-gold-500" aria-hidden="true" /> {o.phone}
                                        </a>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <Link href="/about" className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-400 hover:text-gold-300">
                            View All Locations <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                    </aside>
                </div>
            </section>

            <section className="container-tbca grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-5">
                <Card title="Get in Touch">
                    <ul className="space-y-3 text-[0.8125rem]">
                        <ContactRow icon={<Mail className="size-5" />} label="Email" value="info@thebusinessclinic.africa" href="mailto:info@thebusinessclinic.africa" />
                        <ContactRow icon={<Phone className="size-5" />} label="Call Us" value="+27 12 001 0567" href="tel:+27120010567" />
                        <ContactRow icon={<MessageCircle className="size-5" />} label="WhatsApp" value="+27 60 891 6365" href="https://wa.me/27608916365" />
                        <ContactRow icon={<Globe className="size-5" />} label="Website" value="www.thebusinessclinic.africa" href="/" />
                    </ul>
                </Card>
                <Card title="We're Here to Help You With">
                    <ul className="space-y-2">
                        {serviceAreas.map((s) => (
                            <li key={s} className="flex gap-2 text-[0.8125rem]">
                                <CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" /> {s}
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card title={<span className="inline-flex items-center gap-2"><Clock className="size-4" aria-hidden="true" /> Office Hours</span>}>
                    <dl className="divide-y divide-ink-800 text-[0.8125rem]">
                        {hours.map((h) => (
                            <div key={h.day} className="flex justify-between gap-3 py-1.5">
                                <dt className="text-parchment-100">{h.day}</dt>
                                <dd className="text-ink-200">{h.hours}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="mt-3 flex gap-2.5 rounded-[6px] border border-gold-600/60 p-3">
                        <Zap className="size-5 shrink-0 text-gold-500" aria-hidden="true" />
                        <div>
                            <p className="text-[0.8125rem] font-semibold text-gold-400">24-Hour Turnaround Promise</p>
                            <p className="text-[0.75rem] text-ink-200">We respond to all enquiries within 24 hours.</p>
                        </div>
                    </div>
                </Card>
                <Card title="Connect With Us">
                    <p className="text-[0.8125rem]">Follow our journey and stay updated.</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                        {['in', 'f', 'yt', 'ig', 'x'].map((s) => (
                            <li key={s}>
                                <span className="inline-flex size-10 items-center justify-center rounded-full border border-ink-600 text-[0.75rem] font-bold text-parchment-100 uppercase" aria-label={`TBCA on ${s}`}>
                                    {s}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 text-[0.8125rem] font-semibold text-gold-400">Join the Conversation</p>
                    <p className="mt-1 flex flex-wrap gap-3 text-[0.75rem] text-gold-300">
                        <span>#TBCAImpact</span>
                        <span>#AIForAfrica</span>
                        <span>#BuildAfrica</span>
                    </p>
                </Card>
                <Card title="Stay Informed">
                    <p className="text-[0.8125rem]">Subscribe to our newsletter for insights, reports, webinars and opportunities.</p>
                    <form
                        className="mt-3 space-y-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            news.post('/forms/newsletter', { preserveScroll: true, onSuccess: () => news.reset('email') });
                        }}
                    >
                        <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                        <Input id="newsletter-email" type="email" required className={darkInput} placeholder="Enter your email address" value={news.data.email} onChange={(e) => news.setData('email', e.target.value)} />
                        {news.errors.email && <p className="text-xs text-risk-500">{news.errors.email}</p>}
                        <button type="submit" disabled={news.processing} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                            Subscribe Now <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                    </form>
                    <p className="mt-3 flex gap-2 text-[0.75rem] text-ink-300">
                        <Lock className="size-4 shrink-0 text-gold-500" aria-hidden="true" /> We respect your privacy. Unsubscribe at any time.
                    </p>
                </Card>
            </section>
        </div>
    );
}

function DarkField(props: Parameters<typeof Field>[0]) {
    return <Field {...props} className={`[&_label]:text-ink-200 ${props.className ?? ''}`} />;
}

function Card({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="rounded-[8px] border border-gold-700/40 bg-ink-900/60 p-5">
            <h2 className="mb-3 text-[1rem] font-semibold text-gold-400">{title}</h2>
            {children}
        </section>
    );
}

function ContactRow({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href: string }) {
    return (
        <li className="flex gap-3">
            <span className="text-gold-500" aria-hidden="true">{icon}</span>
            <span>
                <span className="block font-semibold text-parchment-100">{label}</span>
                <a href={href} className="text-ink-200 hover:text-gold-300">
                    {value}
                </a>
            </span>
        </li>
    );
}
