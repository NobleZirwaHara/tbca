import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import AboutHero from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';

interface Content {
    channels: { icon: string; title: string; value: string; note: string; href: string | null }[];
    offices: { name: string; lines: string[]; phone: string }[];
    subjects: string[];
    strip: { icon: string; title: string; body: string }[];
}

/** Subject → the governed route that owns it (AB-TEB screen 26 routing). */
const routed: Record<string, { label: string; href: string }> = {
    'Media enquiry': { label: 'Media Contact', href: '/newsroom/media-contact' },
    Partnership: { label: 'Partner Enquiry', href: '/about/partner-enquiry' },
    Complaint: { label: 'Complaints', href: '/complaints' },
    'Privacy request': { label: 'Privacy', href: '/privacy' },
    Careers: { label: 'Careers', href: '/careers' },
};

export default function Contact({ content }: { content: Content }) {
    const form = useForm({ name: '', email: '', subject: '', message: '', section: 'about' });
    const route = routed[form.data.subject];

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/forms/contact', { preserveScroll: true, onSuccess: () => form.reset('message', 'subject') });
    };

    return (
        <>
            <Head title="Contact Us" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Contact' }]}
                title="Contact Us"
                lead="We're here to help. Let's build impact together."
                intro="Whether you have a question, want to explore opportunities or need support, our team is ready to assist."
                aside={
                    <div className="flex items-start gap-4 rounded-[8px] border border-gold-300 bg-gold-50/60 p-5">
                        <AboutIcon name="headphones" className="size-10 shrink-0 text-gold-700" />
                        <div>
                            <h2 className="font-semibold text-ink-900">Quick Response</h2>
                            <p className="mt-1 text-[0.8125rem] text-ink-600">We aim to respond within one business day.</p>
                            <Button type="button" size="sm" className="mt-3" onClick={() => openAskQuestion({ subject: 'Contact TBCA', section: 'about' })}>
                                Ask a Question <ArrowRight className="size-4" />
                            </Button>
                        </div>
                    </div>
                }
            />

            <section className="bg-parchment-100 py-10">
                <div className="container-tbca space-y-6">
                    <div className="grid gap-5 lg:grid-cols-3">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">Get in Touch</h2>
                            <p className="text-[0.8125rem] text-ink-500">Choose the best way to reach us.</p>
                            <ul className="mt-4 divide-y divide-parchment-300">
                                {content.channels.map((c) => (
                                    <li key={c.title} className="flex items-start gap-3 py-3">
                                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700">
                                            <AboutIcon name={c.icon} className="size-5" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-[0.8125rem] font-semibold text-ink-900">{c.title}</p>
                                            {c.href ? (
                                                <a href={c.href} className="text-[0.8125rem] break-words text-ink-700 hover:text-gold-700">{c.value}</a>
                                            ) : (
                                                <p className="text-[0.8125rem] text-ink-700">{c.value}</p>
                                            )}
                                        </div>
                                        <span className="hidden text-xs text-ink-500 sm:block">{c.note}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <form onSubmit={submit} className="space-y-4 rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">Send Us a Message</h2>
                            <Field label="Full Name" required error={form.errors.name}>
                                {(id) => <Input id={id} required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Enter your full name" />}
                            </Field>
                            <Field label="Email Address" required error={form.errors.email}>
                                {(id) => <Input id={id} type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} placeholder="Enter your email address" />}
                            </Field>
                            <Field label="Subject" required error={form.errors.subject}>
                                {(id) => <Select id={id} required placeholder="Select a subject" options={content.subjects} value={form.data.subject} onChange={(e) => form.setData('subject', e.target.value)} />}
                            </Field>
                            {route && (
                                <p className="rounded-[6px] bg-gold-50 p-2.5 text-xs text-ink-700">
                                    This subject has a dedicated, tracked route:{' '}
                                    <Link href={route.href} className="font-semibold text-gold-700 underline">{route.label}</Link>. You can still send a general message here.
                                </p>
                            )}
                            {form.data.subject === 'Regulator / formal request' && (
                                <p className="rounded-[6px] bg-controlled-50 p-2.5 text-xs text-ink-700">Formal regulatory requests are preserved and routed to a qualified owner. Please include your authority reference.</p>
                            )}
                            <Field label="Message" required error={form.errors.message}>
                                {(id) => <Textarea id={id} required rows={5} value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} placeholder="Type your message here..." />}
                            </Field>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <p className="flex items-start gap-1.5 text-xs text-ink-500"><Lock className="mt-0.5 size-3.5" aria-hidden="true" /> We respect your privacy. Your information will only be used to respond to your enquiry.</p>
                                <Button type="submit" disabled={form.processing}>Send Message <ArrowRight className="size-4" /></Button>
                            </div>
                        </form>

                        <div className="space-y-5">
                            <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                <h2 className="font-semibold text-ink-900">Our Offices</h2>
                                <ul className="mt-4 space-y-5">
                                    {content.offices.map((o) => (
                                        <li key={o.name} className="flex items-start gap-3">
                                            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700">
                                                <AboutIcon name="building" className="size-5" />
                                            </span>
                                            <div className="text-[0.8125rem] text-ink-700">
                                                <p className="font-semibold text-ink-900">{o.name}</p>
                                                {o.lines.map((l) => <p key={l}>{l}</p>)}
                                                <p className="mt-1">{o.phone}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                <h2 className="font-semibold text-ink-900">Other routes</h2>
                                <ul className="mt-2 space-y-1.5 text-[0.8125rem]">
                                    {[['Media Contact', '/newsroom/media-contact'], ['Partner Enquiry', '/about/partner-enquiry'], ['Complaints', '/complaints'], ['Whistleblowing', '/whistleblowing'], ['Privacy', '/privacy']].map(([l, h]) => (
                                        <li key={h}><Link href={h} className="text-gold-700 hover:underline">{l}</Link></li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <ul className="grid gap-4 rounded-[8px] border border-gold-300 bg-gold-50/40 p-5 sm:grid-cols-2 lg:grid-cols-4">
                        {content.strip.map((s) => (
                            <li key={s.title} className="flex items-start gap-3">
                                <AboutIcon name={s.icon} className="size-8 shrink-0 text-gold-600" />
                                <div>
                                    <p className="text-[0.875rem] font-semibold text-ink-900">{s.title}</p>
                                    <p className="text-[0.8125rem] text-ink-600">{s.body}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    );
}
