import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CircleCheck, Clock, Globe, Lock, Mail, MessageCircle, Phone, Send, Zap } from 'lucide-react';
import type { FormEvent } from 'react';
import AfricaMark from '@/Components/AfricaMark';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { useT } from '@/lib/i18n';
import type { SharedProps } from '@/types';
import type { Office, RoleMailbox } from '@/types/core-pages';
import { LeadsSection, OfficeCard, OfficesSection } from '@/Components/CorePages/ContactParts';

interface Props {
    headOffice: Office;
    /** Country offices shown under the head office (Offices::FEATURED). */
    featuredOffices: Office[];
    offices: Office[];
    leads: RoleMailbox[];
    generalEmail: string;
    serviceAreas: string[];
    hours: { day: string; hours: string }[];
}

const darkInput = 'border-ink-700 bg-ink-900 text-parchment-100 placeholder:text-ink-400';

export default function Contact({ headOffice, featuredOffices = [], offices, leads, generalEmail, serviceAreas, hours }: Props) {
    const { auth, contact } = usePage<SharedProps>().props;
    const t = useT();
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
    const otherOffices = offices.length - featuredOffices.length;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.clearErrors();
        const errors: Record<string, string> = {};
        if (!form.data.name.trim()) errors.name = t('Please enter your name.');
        if (!form.data.email.trim()) errors.email = t('Please enter your email address.');
        if (!form.data.service) errors.service = t('Please select a service or area of interest.');
        if (form.data.message.trim().length < 10) errors.message = t('Please tell us a little more (at least 10 characters).');
        if (Object.keys(errors).length) {
            form.setError(errors);
            return;
        }
        form.post('/forms/contact', { preserveScroll: true, onSuccess: () => form.reset('message', 'service') });
    };

    return (
        <div className="bg-ink-950 text-parchment-200">
            <Head title={t('Contact TBCA')} />

            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
                <div className="container-tbca relative grid gap-8 py-12 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                        <p className="text-[0.75rem] font-semibold tracking-[0.16em] text-gold-500 uppercase">{t('Contact TBCA')}</p>
                        <h1 className="mt-3 text-[2.5rem] leading-[1.05] font-semibold text-parchment-100 md:text-[3rem]">
                            {t('Let’s Build Africa.')}
                            <br />
                            <span className="text-gold-500">{t('Together.')}</span>
                        </h1>
                        <span className="mt-5 block h-0.5 w-14 bg-gold-500" aria-hidden="true" />
                        <p className="mt-5 text-[1rem] leading-relaxed text-parchment-200">
                            {t('We are here to help you unlock opportunities, solve complex challenges and create lasting impact. Reach out to our team. We would love to hear from you.')}
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <a href="#message" className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                <Send className="size-4" aria-hidden="true" /> {t('Send an Enquiry')}
                            </a>
                            <Link href="/discovery-call" className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-gold-600 px-5 text-sm text-parchment-100 hover:text-gold-300">
                                <CalendarDays className="size-4" aria-hidden="true" /> {t('Book a Consultation')}
                            </Link>
                        </div>
                    </div>

                    <div className="relative hidden items-center justify-center lg:col-span-3 lg:flex" aria-hidden="true">
                        <AfricaMark className="h-80 w-auto text-gold-500/70" strokeWidth={1.25} />
                    </div>

                    <form id="message" onSubmit={submit} noValidate className="rounded-[10px] border border-gold-700/50 bg-ink-900/70 p-5 lg:col-span-3">
                        <h2 className="text-[1.0625rem] font-semibold text-gold-400">{t('Send Us a Message')}</h2>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                            <DarkField label={t('Your Name')} required error={form.errors.name}>
                                {(id) => <Input id={id} className={darkInput} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} autoComplete="name" />}
                            </DarkField>
                            <DarkField label={t('Company / Organisation')}>
                                {(id) => <Input id={id} className={darkInput} value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} autoComplete="organization" />}
                            </DarkField>
                            <DarkField label={t('Email Address')} required error={form.errors.email}>
                                {(id) => <Input id={id} type="email" dir="ltr" className={darkInput} value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} autoComplete="email" />}
                            </DarkField>
                            <DarkField label={t('Phone Number')}>
                                {(id) => <Input id={id} type="tel" dir="ltr" className={darkInput} value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} autoComplete="tel" />}
                            </DarkField>
                        </div>
                        <DarkField label={t('Service / Area of Interest')} required error={form.errors.service} className="mt-3">
                            {(id) => (
                                <Select
                                    id={id}
                                    className={darkInput}
                                    placeholder={t('Select a Service')}
                                    options={serviceAreas.map((s) => ({ value: s, label: t(s) }))}
                                    value={form.data.service}
                                    onChange={(e) => form.setData('service', e.target.value)}
                                />
                            )}
                        </DarkField>
                        <DarkField label={t('Your Message')} required error={form.errors.message} className="mt-3">
                            {(id) => <Textarea id={id} className={darkInput} placeholder={t('Tell us about your needs or enquiry...')} value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} />}
                        </DarkField>
                        <button type="submit" disabled={form.processing} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-60">
                            {form.processing ? t('Sending...') : t('Send Message')} <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                    </form>

                    <aside className="lg:col-span-2" aria-labelledby="our-offices">
                        <h2 id="our-offices" className="text-[1.0625rem] font-semibold text-gold-400">{t('Our Offices')}</h2>
                        <div className="mt-1">
                            <OfficeCard office={headOffice} label={t('Head Office')} />
                            {featuredOffices.map((office) => (
                                <OfficeCard key={office.slug} office={office} label={t('Country Office')} />
                            ))}
                        </div>
                        <Link
                            href="/contact/offices"
                            className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-400 hover:text-gold-300"
                        >
                            {t('View all other Country Offices')} <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                        {otherOffices > 0 && (
                            <p className="mt-1 text-[0.75rem] text-ink-300">{t(':count more country offices across Africa.', { count: otherOffices })}</p>
                        )}
                    </aside>
                </div>
            </section>

            <OfficesSection headOffice={headOffice} offices={offices} />

            <LeadsSection leads={leads} generalEmail={generalEmail} />

            <section className="container-tbca grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-5">
                <Card title={t('Get in Touch')}>
                    <ul className="space-y-3 text-[0.8125rem]">
                        <ContactRow icon={<Mail className="size-5" />} label={t('Email')} value={contact.email} href={`mailto:${contact.email}`} />
                        <ContactRow icon={<Phone className="size-5" />} label={t('Call Us')} value={contact.phone} href={`tel:${contact.phone.replace(/\s/g, '')}`} ltr />
                        <ContactRow icon={<MessageCircle className="size-5" />} label="WhatsApp" value={contact.whatsapp} href={contact.whatsapp_url} ltr />
                        <ContactRow icon={<Globe className="size-5" />} label={t('Website')} value="www.thebusinessclinic.africa" href="/" />
                    </ul>
                </Card>
                <Card title={t('We\'re Here to Help You With')}>
                    <ul className="space-y-2">
                        {serviceAreas.map((s) => (
                            <li key={s} className="flex gap-2 text-[0.8125rem]">
                                <CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" /> {t(s)}
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card title={<span className="inline-flex items-center gap-2"><Clock className="size-4" aria-hidden="true" /> {t('Office Hours')}</span>}>
                    <dl className="divide-y divide-ink-800 text-[0.8125rem]">
                        {hours.map((h) => (
                            <div key={h.day} className="flex justify-between gap-3 py-1.5">
                                <dt className="text-parchment-100">{t(h.day)}</dt>
                                <dd className="text-ink-200" dir={/\d/.test(h.hours) ? 'ltr' : undefined}>{t(h.hours)}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="mt-3 flex gap-2.5 rounded-[6px] border border-gold-600/60 p-3">
                        <Zap className="size-5 shrink-0 text-gold-500" aria-hidden="true" />
                        <div>
                            <p className="text-[0.8125rem] font-semibold text-gold-400">{t('24-Hour Turnaround Promise')}</p>
                            <p className="text-[0.75rem] text-ink-200">{t('We respond to all enquiries within 24 hours.')}</p>
                        </div>
                    </div>
                </Card>
                <Card title={t('Connect With Us')}>
                    <p className="text-[0.8125rem]">{t('Follow our journey and stay updated.')}</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                        {['in', 'f', 'yt', 'ig', 'x'].map((s) => (
                            <li key={s}>
                                <span className="inline-flex size-10 items-center justify-center rounded-full border border-ink-600 text-[0.75rem] font-bold text-parchment-100 uppercase" aria-label={t('TBCA on :network', { network: s })}>
                                    {s}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 text-[0.8125rem] font-semibold text-gold-400">{t('Join the Conversation')}</p>
                    <p className="mt-1 flex flex-wrap gap-3 text-[0.75rem] text-gold-300" dir="ltr">
                        <span>#TBCAImpact</span>
                        <span>#AIForAfrica</span>
                        <span>#BuildAfrica</span>
                    </p>
                </Card>
                <Card title={t('Stay Informed')}>
                    <p className="text-[0.8125rem]">{t('Subscribe to our newsletter for insights, reports, webinars and opportunities.')}</p>
                    <form
                        className="mt-3 space-y-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            news.post('/forms/newsletter', { preserveScroll: true, onSuccess: () => news.reset('email') });
                        }}
                    >
                        <label htmlFor="newsletter-email" className="sr-only">{t('Email Address')}</label>
                        <Input id="newsletter-email" type="email" dir="ltr" required className={darkInput} placeholder={t('Enter your email address')} value={news.data.email} onChange={(e) => news.setData('email', e.target.value)} />
                        {news.errors.email && <p className="text-xs text-risk-500">{news.errors.email}</p>}
                        <button type="submit" disabled={news.processing} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                            {t('Subscribe Now')} <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                    </form>
                    <p className="mt-3 flex gap-2 text-[0.75rem] text-ink-300">
                        <Lock className="size-4 shrink-0 text-gold-500" aria-hidden="true" /> {t('We respect your privacy. Unsubscribe at any time.')}
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

function ContactRow({ icon, label, value, href, ltr = false }: { icon: React.ReactNode; label: string; value: string; href: string; ltr?: boolean }) {
    return (
        <li className="flex gap-3">
            <span className="text-gold-500" aria-hidden="true">{icon}</span>
            <span>
                <span className="block font-semibold text-parchment-100">{label}</span>
                <a href={href} className="text-ink-200 hover:text-gold-300" dir={ltr ? 'ltr' : undefined}>
                    {value}
                </a>
            </span>
        </li>
    );
}
