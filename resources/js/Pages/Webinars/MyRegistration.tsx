import { Head, Link, router, useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { BtnLink, CalendarButtons, Card, EventHero, FactsStrip, HelpCard, KeyDetails, NoticeCards, RailEvent, RegistrationRequired, WebinarShell, btnClass, splitTitle } from '@/Components/Webinars/kit';
import type { EventFrame } from '@/types/webinars';

interface Props extends EventFrame {
    modes: { key: string; label: string }[];
    roles: string[];
    industries: string[];
    countries: string[];
}

const NEXT: [string, string][] = [
    ['Confirmation Email Sent', 'A confirmation email with your unique webinar access link has been sent to your inbox.'],
    ['Calendar Invite', 'We have also sent a calendar invite. Please add it to your calendar.'],
    ['Reminders', 'You will receive reminder emails and a WhatsApp reminder before the session.'],
    ['Join the Live Webinar', 'Click the join link at the scheduled time. You can choose to attend live with or without appearing in the recording.'],
    ['Access Replay (If Available)', 'The replay will be reviewed and released only after GATE-WB-03 has been completed. You will be notified once it is available.'],
];
const input = 'h-9 w-full rounded-[6px] border border-parchment-500 bg-white px-2.5 text-[0.8125rem]';

export default function MyRegistration({ event, registration, notices, modes, roles, industries, countries }: Props) {
    const [editing, setEditing] = useState(false);
    const [shared, setShared] = useState(false);
    const [lead, gold] = splitTitle(event.title);
    const base = `/webinars/${event.slug}`;
    const form = useForm({
        phone: registration?.phone ?? '',
        country: registration?.country ?? '',
        organisation: registration?.organisation ?? '',
        role: registration?.role ?? '',
        industry: registration?.industry ?? '',
        participation: registration?.participation ?? 'live_recorded',
    });

    return (
        <WebinarShell
            event={event}
            rail={
                <>
                    <RailEvent event={event} />
                    <KeyDetails event={event} />
                    <Card tone="dark" title="Related Resources">
                        <ul className="space-y-2">
                            {([['Add to Calendar', `${base}/calendar.ics`, L.CalendarDays], ['Download Event Brief', `${base}/resources/brief`, L.FileText], ['Explore Related Toolkits', '/tools/toolkits', L.Layers]] as const).map(([t, h, I]) => (
                                <li key={t}>
                                    <a href={h} className="flex items-center gap-3 rounded-[8px] border border-ink-700 px-3 py-2.5 text-[0.8125rem] text-parchment-100 hover:border-gold-500">
                                        <I className="size-5 text-gold-500" aria-hidden="true" /><span className="flex-1">{t}</span><L.ChevronRight className="size-4" aria-hidden="true" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </>
            }
        >
            <Head title="My Registration" />
            <EventHero crumbs={[['Home', '/'], ['Webinars', '/webinars'], [lead.replace(/:$/, ''), base], ['My Registration']]} eyebrow={registration ? 'Registration Confirmed' : 'My Registration'} title={registration ? 'You’re All Set!' : 'My Registration'} lead={registration ? 'Thank you for registering for the webinar. We look forward to having you join us.' : `${lead} ${gold ?? ''}`}>
                <FactsStrip event={event} />
            </EventHero>

            <RegistrationRequired event={event} registration={registration} />

            {registration && (
                <div className="grid gap-4 xl:grid-cols-2">
                    <Card title="What Happens Next?">
                        <ol className="space-y-3">
                            {NEXT.map(([t, b], i) => (
                                <li key={t} className="flex gap-3">
                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-400 text-[0.75rem] font-bold text-ink-900">{i + 1}</span>
                                    <span><span className="block font-serif text-[0.9375rem] font-bold text-ink-900">{t}</span><span className="text-[0.8125rem] text-ink-600">{b}</span></span>
                                </li>
                            ))}
                        </ol>
                    </Card>
                    <div className="space-y-4">
                        <Card title="Your Registration Details" action={<button type="button" onClick={() => setEditing(!editing)} className={btnClass('outline', 'sm')}><L.Pencil className="size-3.5" aria-hidden="true" />{editing ? 'Close' : 'Edit Details'}</button>}>
                            {editing ? (
                                <form className="grid gap-2.5 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); form.patch(`${base}/my-registration`, { preserveScroll: true, onSuccess: () => setEditing(false) }); }}>
                                    <label className="text-[0.75rem] font-semibold">Phone<input className={input} value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} required /></label>
                                    <label className="text-[0.75rem] font-semibold">Country<select className={input} value={form.data.country} onChange={(e) => form.setData('country', e.target.value)}>{countries.map((c) => <option key={c}>{c}</option>)}</select></label>
                                    <label className="text-[0.75rem] font-semibold">Organisation<input className={input} value={form.data.organisation} onChange={(e) => form.setData('organisation', e.target.value)} /></label>
                                    <label className="text-[0.75rem] font-semibold">Role<select className={input} value={form.data.role} onChange={(e) => form.setData('role', e.target.value)}>{roles.map((c) => <option key={c}>{c}</option>)}</select></label>
                                    <label className="text-[0.75rem] font-semibold">Industry<select className={input} value={form.data.industry ?? ''} onChange={(e) => form.setData('industry', e.target.value)}><option value="">Not specified</option>{industries.map((c) => <option key={c}>{c}</option>)}</select></label>
                                    <label className="text-[0.75rem] font-semibold">Participation<select className={input} value={form.data.participation} onChange={(e) => form.setData('participation', e.target.value)}>{modes.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}</select></label>
                                    <div className="flex gap-2 sm:col-span-2">
                                        <button type="submit" disabled={form.processing} className={btnClass('gold', 'sm')}>Save Changes</button>
                                        <button type="button" className={btnClass('danger', 'sm')} onClick={() => window.confirm('Cancel your registration for this webinar?') && router.post(`${base}/my-registration/cancel`)}>Cancel Registration</button>
                                    </div>
                                </form>
                            ) : (
                                <dl className="grid grid-cols-[9rem_1fr] gap-y-1.5 text-[0.8125rem]">
                                    {([['Full Name', registration.name], ['Email Address', registration.email], ['Phone Number', registration.phone], ['Country', registration.country], ['Organisation', registration.organisation || 'Not provided'], ['Role', registration.role], ['Industry', registration.industry ?? 'Not provided'], ['Participation Option', registration.participationLabel], ['Reference', registration.reference]] as const).map(([k, v]) => (
                                        <div key={k} className="contents"><dt className="font-semibold text-ink-800">{k}</dt><dd className="text-ink-600">{v}</dd></div>
                                    ))}
                                </dl>
                            )}
                        </Card>
                        <Card title="Your Webinar Access" action={<span className={cn('rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold', registration.status === 'registered' ? 'bg-verified-50 text-verified-700' : 'bg-attested-50 text-attested-700')}>{registration.status === 'registered' ? 'Active' : 'Awaiting Payment'}</span>}>
                            <BtnLink href={`${base}/live`} size="lg" className="w-full" icon="video">Join Live Webinar</BtnLink>
                            <p className="mt-1.5 text-center text-[0.6875rem] text-ink-500">This link is also in your confirmation email and calendar invite.</p>
                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <a href={`${base}/calendar.ics`} className={btnClass('outline', 'md')}><L.CalendarDays className="size-4" aria-hidden="true" />Add to Calendar</a>
                                <button type="button" onClick={() => { void navigator.clipboard?.writeText(`${window.location.origin}${base}`); setShared(true); }} className={btnClass('outline', 'md')}><L.Share2 className="size-4" aria-hidden="true" />{shared ? 'Link Copied' : 'Share Event'}</button>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <NoticeCards notices={notices} keys={['recording', 'offer']} />
                <HelpCard tone="light" />
            </div>
            <Card title="Calendar Options"><CalendarButtons event={event} /></Card>
            <p className="text-[0.8125rem] text-ink-500">Looking for other events? <Link href="/webinars/my-registrations" className="font-semibold text-gold-700">See all my registrations</Link>.</p>
        </WebinarShell>
    );
}

MyRegistration.layout = null;
