import { Link, useForm } from '@inertiajs/react';
import { Calendar, CalendarDays, Check, Clock, Lock, Shield, Trophy, User } from 'lucide-react';
import { Checkbox, Field, Input, Select } from '@/Components/ui/Form';
import { Box, Chip, DynIcon, Notice } from '@/Components/Insights/Shared';
import { PageTitle, ResourceFrame } from '@/Components/Insights/Resources';
import type { WebinarCard } from '@/types/insights';

interface Props {
    webinar: WebinarCard;
    prefill: { name: string; email: string; company: string; jobTitle: string; phone: string };
    registered: string | null;
}

export default function WebinarRegister({ webinar: w, prefill, registered }: Props) {
    const form = useForm({ name: prefill.name, email: prefill.email, job_title: prefill.jobTitle, company: prefill.company, country: 'South Africa', phone: prefill.phone, opt_resources: true, opt_offers: false });

    return (
        <ResourceFrame title={`Register – ${w.title}`} crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Webinars', href: '/resources/webinars' }, { label: 'Webinar Registration' }]}>
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                    <PageTitle title="Register for Webinar" intro="Secure your spot for this live or on-demand session. You will receive a confirmation email with access details and calendar invite." />
                    <Box>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex size-28 shrink-0 items-center justify-center rounded bg-ink-950"><DynIcon name={w.icon} className="size-14 text-gold-400" /></div>
                            <div className="flex-1">
                                <h2 className="font-serif text-xl font-semibold">{w.title}</h2><p className="text-sm text-ink-600">{w.tagline}</p>
                                <div className="mt-3 flex flex-wrap gap-5 text-xs"><span className="flex items-center gap-1.5"><Calendar className="size-4" /><span><strong className="block">{w.date}</strong>{w.weekday}</span></span><span className="flex items-center gap-1.5"><Clock className="size-4" /><span><strong className="block">{w.time}</strong>({w.durationMinutes} min)</span></span><span className="flex items-center gap-1.5"><User className="size-4" /><span><strong className="block">{w.speaker}</strong>{w.speakerRole}</span></span><Chip>{w.topic}</Chip></div>
                            </div>
                        </div>
                    </Box>
                    {!w.upcoming && <Notice tone="blue" action={<Link href={`/resources/webinars/${w.slug}/replay`} className="rounded border bg-white px-3 py-1 text-xs font-semibold">Go to replay</Link>}>This session has taken place. Registering gives you access to the on-demand replay.</Notice>}
                    {registered ? (
                        <Notice tone="green" title={`You're registered (${registered})`} action={<Link href={`/resources/webinars/${w.slug}/replay`} className="rounded border bg-white px-3 py-1 text-xs font-semibold">Replay access</Link>}>A confirmation email and calendar invite have been sent.</Notice>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); form.post(`/resources/webinars/${w.slug}/register`, { preserveScroll: true }); }} className="rounded-[8px] border border-parchment-400 bg-white p-5" noValidate>
                            <h2 className="font-serif text-lg font-semibold">Your Details</h2>
                            <p className="text-xs text-ink-500">All fields marked <span className="text-risk-500">*</span> are required.</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                <Field label="Full Name" required error={form.errors.name}>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Enter your full name" />}</Field>
                                <Field label="Work Email" required error={form.errors.email}>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} placeholder="you@company.co.za" />}</Field>
                                <Field label="Job Title" required error={form.errors.job_title}>{(id) => <Input id={id} value={form.data.job_title} onChange={(e) => form.setData('job_title', e.target.value)} placeholder="Your job title" />}</Field>
                                <Field label="Company / Organisation" required error={form.errors.company}>{(id) => <Input id={id} value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} placeholder="Your company or organisation" />}</Field>
                                <Field label="Country" required error={form.errors.country}>{(id) => <Select id={id} value={form.data.country} onChange={(e) => form.setData('country', e.target.value)} options={['South Africa', 'Botswana', 'Namibia', 'Zimbabwe', 'Kenya', 'Nigeria', 'Ghana', 'Egypt', 'Other']} />}</Field>
                                <Field label="Phone Number" error={form.errors.phone}>{(id) => <Input id={id} value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} placeholder="071 123 4567" />}</Field>
                            </div>
                            <p className="mt-4 text-xs font-semibold">I would like to receive:</p>
                            <Checkbox className="mt-1" label="TBCA Resources & Insights (guides, tools, webinars and updates)" checked={form.data.opt_resources} onChange={(e) => form.setData('opt_resources', e.target.checked)} />
                            <Checkbox className="mt-1" label="Updates about products, services and offers from TBCA" checked={form.data.opt_offers} onChange={(e) => form.setData('opt_offers', e.target.checked)} />
                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <p className="flex flex-1 gap-1.5 text-[0.6875rem] text-ink-500"><Lock className="size-4 shrink-0" />We respect your privacy. You can update your preferences or unsubscribe at any time. By registering, you agree to our <Link href="/resources/data-statement" className="text-gold-700 underline">Privacy Policy</Link>.</p>
                                <button type="submit" disabled={form.processing} className="rounded bg-gold-500 px-8 py-2.5 text-sm font-bold">Confirm Registration</button>
                            </div>
                        </form>
                    )}
                </div>
                <aside className="space-y-4">
                    <Box title={<span className="flex items-center gap-2 font-serif text-lg"><CalendarDays className="size-5" />Event Summary</span>}>
                        <dl className="space-y-1.5 text-xs">{[['Webinar', w.title], ['Date', `${w.date} (${w.weekday})`], ['Time', `${w.time} (${w.durationMinutes} min)`], ['Format', w.upcoming ? 'Live Online' : 'On-Demand Replay'], ['Access', 'Join from your desktop, tablet or phone'], ['Includes', 'Live session, Q&A, and resource pack']].map(([k, v]) => <div key={k} className="grid grid-cols-[5rem_1fr] gap-2"><dt className="text-ink-500">{k}:</dt><dd className="font-medium">{v}</dd></div>)}</dl>
                    </Box>
                    <Box title={<span className="flex items-center gap-2 font-serif text-lg"><Trophy className="size-5" />What You'll Gain</span>}><ul className="space-y-1 text-xs">{w.gains.map((g) => <li key={g} className="flex gap-1.5"><Check className="size-3.5" />{g}</li>)}</ul></Box>
                    <Box title={<span className="flex items-center gap-2 font-serif text-lg"><Shield className="size-5" />Your Privacy Matters</span>}><p className="text-xs">We only use your information to manage your registration, deliver the webinar and share relevant resources. We will never sell your information.</p></Box>
                    <Box title="Already Registered?"><p className="text-xs">You will receive a confirmation email shortly. Can't find it? Check your spam folder.</p><button type="button" onClick={() => form.post(`/resources/webinars/${w.slug}/register`, { preserveScroll: true })} className="mt-2 text-xs font-semibold text-gold-700">Resend Confirmation Email →</button></Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
