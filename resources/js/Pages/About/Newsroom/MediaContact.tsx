import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { CalendarDays, ChevronRight, Clock, Globe2, Handshake, Mail, MapPin, Megaphone, Phone, User } from 'lucide-react';
import { Field, Input, Textarea } from '@/Components/ui/Form';
import AboutHero from '@/Components/About/AboutHero';

const others = [
    { icon: Megaphone, title: 'Press & Media Relations', body: 'General media enquiries and press requests.', email: 'press@thebusinessclinic.africa' },
    { icon: Handshake, title: 'Partnership Enquiries', body: 'Media enquiries related to partnerships and collaborations.', email: 'partnerships@thebusinessclinic.africa' },
    { icon: CalendarDays, title: 'Event Media Requests', body: 'Media accreditation and event-related enquiries.', email: 'events@thebusinessclinic.africa' },
];

export default function MediaContact() {
    const form = useForm({ name: '', email: '', outlet: '', deadline: '', topic: '', questions: '' });
    const sub = useForm({ email: '', section: 'about', subject: 'Press release subscription' });
    const e = form.errors;
    const submit = (ev: FormEvent) => {
        ev.preventDefault();
        form.post('/newsroom/media-contact', { preserveScroll: true, onSuccess: () => form.reset() });
    };
    const subscribe = (ev: FormEvent) => {
        ev.preventDefault();
        sub.post('/forms/press-subscription', { preserveScroll: true, onSuccess: () => sub.reset('email') });
    };

    return (
        <>
            <Head title="Media Contact" />
            <AboutHero
                accent="purple"
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Newsroom', href: '/newsroom' }, { label: 'Media Contact' }]}
                title="Media Contact"
                lead="We're here to help."
                intro="For all media enquiries, interview requests, press materials or additional information about TBCA, please contact our communications team."
                aside={
                    <div className="flex justify-center">
                        <span className="inline-flex size-36 items-center justify-center rounded-full border border-dashed border-violet-300 bg-violet-50 text-violet-500"><Globe2 className="size-20" strokeWidth={1} aria-hidden="true" /></span>
                    </div>
                }
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <div className="space-y-5">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-violet-800">Primary Media Contact</h2>
                            <div className="mt-4 grid gap-5 md:grid-cols-[auto_1fr_1fr] md:items-center">
                                <span className="inline-flex size-24 items-center justify-center rounded-full bg-violet-50 text-violet-700"><User className="size-12" aria-hidden="true" /></span>
                                <div className="text-[0.875rem]">
                                    <p className="font-serif text-xl font-semibold text-ink-900">Lerato Mokoena</p>
                                    <p className="font-semibold text-violet-700">Head: Communications</p>
                                    <p className="mt-2 flex items-center gap-2"><Phone className="size-4 text-violet-700" aria-hidden="true" /> +27 12 001 0557</p>
                                    <p className="mt-1 flex items-center gap-2"><Mail className="size-4 text-violet-700" aria-hidden="true" /> media@thebusinessclinic.africa</p>
                                    <p className="mt-1 flex items-center gap-2"><MapPin className="size-4 text-violet-700" aria-hidden="true" /> Pretoria, South Africa</p>
                                </div>
                                <div className="text-[0.875rem] text-ink-700 md:border-l md:border-parchment-300 md:pl-5">
                                    Lerato and the communications team are available to respond to media enquiries, provide comment on TBCA news, and facilitate interviews with TBCA leadership.
                                    <a href="mailto:media@thebusinessclinic.africa" className="mt-3 flex w-fit items-center gap-2 rounded-[4px] border border-violet-400 px-4 py-2 text-sm font-semibold text-violet-700">Email Lerato <Mail className="size-4" aria-hidden="true" /></a>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-4 rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-violet-800">Submit a Media Enquiry</h2>
                            <p className="text-xs text-ink-500">You'll receive a reference and the team will route your request to an authorised spokesperson.</p>
                            <div className="grid gap-4 md:grid-cols-3">
                                <Field label="Your name" required error={e.name}>{(id) => <Input id={id} value={form.data.name} onChange={(ev) => form.setData('name', ev.target.value)} />}</Field>
                                <Field label="Email address" required error={e.email}>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(ev) => form.setData('email', ev.target.value)} />}</Field>
                                <Field label="Media outlet" required error={e.outlet}>{(id) => <Input id={id} value={form.data.outlet} onChange={(ev) => form.setData('outlet', ev.target.value)} />}</Field>
                                <Field label="Topic" required error={e.topic} className="md:col-span-2">{(id) => <Input id={id} value={form.data.topic} onChange={(ev) => form.setData('topic', ev.target.value)} />}</Field>
                                <Field label="Deadline" error={e.deadline}>{(id) => <Input id={id} type="date" value={form.data.deadline} onChange={(ev) => form.setData('deadline', ev.target.value)} />}</Field>
                            </div>
                            <Field label="Your questions" required error={e.questions}>{(id) => <Textarea id={id} rows={4} value={form.data.questions} onChange={(ev) => form.setData('questions', ev.target.value)} />}</Field>
                            <div className="flex justify-end"><button type="submit" disabled={form.processing} className="h-10 rounded-[4px] bg-violet-700 px-5 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50">Send Enquiry</button></div>
                        </form>

                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-violet-800">Other Contacts</h2>
                            <ul className="mt-4 grid gap-5 md:grid-cols-3 md:divide-x md:divide-parchment-300">
                                {others.map(({ icon: I, title, body, email }) => (
                                    <li key={title} className="flex gap-3 md:pl-4 first:md:pl-0">
                                        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-700"><I className="size-5" aria-hidden="true" /></span>
                                        <div className="min-w-0 text-[0.8125rem]"><p className="font-semibold text-ink-900">{title}</p><p className="text-ink-600">{body}</p><a href={`mailto:${email}`} className="break-all text-xs font-semibold text-violet-700">{email}</a></div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <form onSubmit={subscribe} className="flex flex-col gap-4 rounded-[8px] border border-violet-200 bg-violet-50/60 p-5 md:flex-row md:items-center">
                            <Mail className="size-9 shrink-0 text-violet-700" aria-hidden="true" />
                            <p className="flex-1 text-[0.8125rem] text-ink-700"><span className="block font-semibold text-violet-800">Stay informed</span>Subscribe to receive TBCA press releases and official statements straight to your inbox.</p>
                            <div className="flex gap-2">
                                <label htmlFor="press-email" className="sr-only">Email</label>
                                <Input id="press-email" type="email" required value={sub.data.email} onChange={(ev) => sub.setData('email', ev.target.value)} placeholder="Enter your email address" />
                                <button type="submit" disabled={sub.processing} className="shrink-0 rounded-[4px] bg-violet-700 px-4 text-sm font-semibold text-white">Subscribe</button>
                            </div>
                        </form>
                    </div>
                    <aside className="space-y-4">
                        <div className="rounded-[8px] border border-violet-200 bg-violet-50/50 p-5">
                            <h2 className="font-semibold text-violet-800">Press Resources</h2>
                            <ul className="mt-3 divide-y divide-violet-200 text-[0.8125rem]">
                                {[['About TBCA', 'Company overview and key facts', '/about'], ['Media Kit', 'Logos, key messages, executive bios', '/about/team'], ['Image Gallery', 'High-resolution images for media use', '/newsroom'], ['Brand Guidelines', 'Our brand identity and usage guidelines', '/about/trust-badge']].map(([t, b, h]) => (
                                    <li key={t}><Link href={h} className="flex items-center justify-between gap-2 py-3"><span><span className="block font-semibold text-ink-900">{t}</span><span className="text-xs text-ink-500">{b}</span></span><ChevronRight className="size-4" aria-hidden="true" /></Link></li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-[8px] border border-attested-500/25 bg-attested-50/50 p-5">
                            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><Clock className="size-5 text-attested-700" aria-hidden="true" /> Response Commitment</h2>
                            <p className="mt-1 text-[0.8125rem] text-ink-700">We aim to respond to all media enquiries within one business day.</p>
                            <p className="mt-3 border-t border-attested-500/20 pt-3 text-[0.8125rem] text-ink-700">For urgent media enquiries outside of business hours, please call:</p>
                            <a href="tel:+27821234567" className="mt-1 flex items-center gap-2 font-semibold text-attested-700"><Phone className="size-4" aria-hidden="true" /> +27 82 123 4567</a>
                        </div>
                        <Link href="/complaints/track" className="block rounded-[8px] border border-parchment-400 bg-white p-4 text-[0.8125rem] text-ink-700 hover:border-violet-300">Already sent an enquiry? <span className="font-semibold text-violet-700">Track it with your reference →</span></Link>
                    </aside>
                </div>
            </section>
        </>
    );
}
