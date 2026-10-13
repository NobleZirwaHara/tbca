import { Head, Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { CalendarButtons, Card, CheckItem, EventCover, FactsStrip, HelpCard, WebinarShell, btnClass, splitTitle } from '@/Components/Webinars/kit';
import HeroArt from '@/Components/Art/HeroArt';
import type { EventFrame } from '@/types/webinars';

const NEXT: [string, string, string][] = [
    ['mail', 'Confirmation Email', 'Sent to your inbox with joining details.'],
    ['bell', 'Reminder Notifications', 'You will receive reminders before the event.'],
    ['play', 'Join the Live Session', 'Use your personalised link to join on the day.'],
    ['video', 'Access the Replay', 'The replay will be available after review and approval.'],
    ['award', 'Get Your Certificate', 'Complete the session to receive your CPD certificate.'],
];

export default function Confirmed({ event, registration, notices }: EventFrame) {
    const [calOpen, setCalOpen] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [lead, gold] = splitTitle(event.title);
    const base = `/webinars/${event.slug}`;
    const copy = (text: string, key: string) => {
        void navigator.clipboard?.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 1500);
    };
    const joinOpen = Date.now() >= new Date(event.startsAt).getTime() - 15 * 60 * 1000;

    return (
        <WebinarShell
            event={event}
            rail={
                <Card tone="dark" title="What Happens Next?">
                    <ol className="relative space-y-5">
                        {NEXT.map(([icon, t, b], i) => (
                            <li key={t} className="relative flex gap-3">
                                {i < NEXT.length - 1 && <span className="absolute top-11 left-[1.3rem] h-5 border-l border-dashed border-gold-600" aria-hidden="true" />}
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-500 text-ink-900">{icon === 'mail' ? <L.Mail className="size-5" /> : icon === 'bell' ? <L.Bell className="size-5" /> : icon === 'play' ? <L.CirclePlay className="size-5" /> : icon === 'video' ? <L.MonitorPlay className="size-5" /> : <L.Award className="size-5" />}</span>
                                <span><span className="block text-[0.875rem] font-semibold text-parchment-50">{t}</span><span className="block text-[0.75rem] text-parchment-300">{b}</span></span>
                            </li>
                        ))}
                    </ol>
                </Card>
            }
        >
            <Head title="Registration Confirmed" />
            <section className="relative overflow-hidden rounded-[12px] bg-ink-950 p-6 text-parchment-100 sm:p-8">
                <HeroArt className="absolute inset-0 h-full w-full" />
                <div className="relative">
                    <nav aria-label="Breadcrumb" className="text-[0.75rem] text-parchment-300"><Link href="/webinars">Webinars</Link> / <Link href={base}>{lead.replace(/:$/, '')}</Link> / Registration Confirmation</nav>
                    <div className="mt-4 flex flex-wrap items-center gap-5">
                        <span className="flex size-20 items-center justify-center rounded-full bg-gold-500 ring-8 ring-gold-500/25"><L.Check className="size-10 text-ink-900" strokeWidth={3} aria-hidden="true" /></span>
                        <div>
                            <h1 className="font-serif text-[2rem] font-bold text-parchment-50 sm:text-[2.75rem]">Registration <span className="text-gold-400">Confirmed</span></h1>
                            <p className="text-[1.0625rem] font-semibold">You are successfully registered for the webinar.</p>
                            <p className="text-[0.875rem] text-parchment-200">A confirmation email with your joining details has been sent to {registration?.email ?? 'your inbox'}.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="rounded-[12px] border border-parchment-400 bg-white p-4 sm:p-5">
                <div className="grid gap-5 md:grid-cols-[18rem_minmax(0,1fr)]">
                    <EventCover event={event} className="aspect-[16/10] rounded-[10px]" />
                    <div>
                        <h2 className="font-serif text-[1.625rem] leading-tight font-bold text-ink-900">{lead}{gold && <><br />{gold}</>}</h2>
                        <p className="mt-1 text-[0.9375rem] text-ink-600">{event.tagline}</p>
                        <FactsStrip event={event} dark={false} className="mt-3" />
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-verified-500/30 bg-verified-50 p-4">
                    <div className="flex items-center gap-3">
                        <span className="flex size-11 items-center justify-center rounded-full bg-verified-700 text-white"><L.Check className="size-6" aria-hidden="true" /></span>
                        <div>
                            <p className="font-serif text-[1.125rem] font-bold text-ink-900">Your Spot Is Confirmed!</p>
                            <p className="text-[0.8125rem] text-ink-700">{registration?.status === 'pending_payment' ? 'Your seat is held until payment is complete.' : 'We look forward to seeing you at the webinar. Please keep this page for reference.'}</p>
                        </div>
                    </div>
                    {registration && (
                        <div>
                            <p className="text-[0.75rem] font-semibold text-ink-700">Registration ID</p>
                            <button type="button" onClick={() => copy(registration.reference, 'ref')} className="mt-1 inline-flex items-center gap-3 rounded-[6px] bg-gold-100 px-3 py-2 font-mono text-[0.9375rem] font-bold text-ink-900">
                                {registration.reference} {copied === 'ref' ? <L.Check className="size-4 text-verified-500" /> : <L.Copy className="size-4" aria-label="Copy reference" />}
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="relative">
                        <button type="button" aria-expanded={calOpen} onClick={() => setCalOpen(!calOpen)} className="flex h-full w-full items-center gap-3 rounded-[10px] border border-gold-500 bg-white p-4 text-left">
                            <L.CalendarDays className="size-6 text-ink-900" aria-hidden="true" />
                            <span className="flex-1 font-semibold text-ink-900">Add to Calendar</span>
                            <L.ChevronDown className="size-4" aria-hidden="true" />
                        </button>
                        {calOpen && <div className="absolute z-10 mt-1 w-full rounded-[10px] border border-parchment-400 bg-white p-2 shadow-raised"><CalendarButtons event={event} /></div>}
                    </div>
                    <Link href={joinOpen ? `${base}/live` : `${base}/pre-event`} className="flex items-center gap-3 rounded-[10px] bg-gold-500 p-4 text-ink-900 hover:bg-gold-400">
                        <L.Video className="size-6" aria-hidden="true" />
                        <span><span className="block font-semibold">Join Webinar</span><span className="block text-[0.75rem]">{joinOpen ? 'Access link is active now' : 'Access link will be active 15 minutes before start'}</span></span>
                    </Link>
                    <Link href={`${base}/my-registration`} className="flex items-center gap-3 rounded-[10px] border border-gold-500 bg-white p-4 hover:bg-gold-50">
                        <L.FileText className="size-6 text-ink-900" aria-hidden="true" />
                        <span><span className="block font-semibold text-ink-900">View My Registration</span><span className="block text-[0.75rem] text-ink-500">See and update your details</span></span>
                    </Link>
                    <button type="button" onClick={() => copy(`${window.location.origin}${base}`, 'share')} className="flex items-center gap-3 rounded-[10px] border border-gold-500 bg-white p-4 text-left hover:bg-gold-50">
                        <L.UserPlus className="size-6 text-ink-900" aria-hidden="true" />
                        <span><span className="block font-semibold text-ink-900">Invite a Colleague</span><span className="block text-[0.75rem] text-ink-500">{copied === 'share' ? 'Event link copied' : 'Share this event'}</span></span>
                    </button>
                </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card title="Your Participation Choice" icon="video">
                    {registration ? (
                        <div className="flex gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-400 text-ink-900"><L.Video className="size-5" aria-hidden="true" /></span>
                            <div>
                                <p className="flex flex-wrap items-center gap-2 font-semibold text-ink-900">{registration.participationLabel}<span className="rounded-full bg-verified-50 px-2 py-0.5 text-[0.625rem] font-semibold text-verified-700">Confirmed</span></p>
                                <p className="text-[0.8125rem] text-ink-600">{registration.participationBody}</p>
                            </div>
                        </div>
                    ) : <p className="text-[0.8125rem] text-ink-500">No registration found in this browser.</p>}
                </Card>
                <Card title="Important Information" icon="lightbulb">
                    <ul className="space-y-1.5">
                        <CheckItem>The webinar will be recorded.</CheckItem>
                        <CheckItem>No replay will be published without completing the TBCA review and approval process.</CheckItem>
                        <CheckItem>Any commercial offers will be clearly identified during the session.</CheckItem>
                        <CheckItem>To change your participation option, open My Registration or contact our support team before the event.</CheckItem>
                    </ul>
                    <p className="mt-2 font-mono text-[0.6875rem] text-ink-400">Notices accepted: {notices.recording.version}, {notices.offer.version}, {notices.boundary.version}</p>
                </Card>
                <div className="space-y-3">
                    <HelpCard tone="light" />
                    <Card title="Frequently Asked Questions" icon="help">
                        <p className="text-[0.8125rem] text-ink-600">Find answers to common webinar questions.</p>
                        <Link href={base} className={cn('mt-2 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700')}>View FAQs <L.ArrowRight className="size-4" aria-hidden="true" /></Link>
                    </Card>
                </div>
            </div>
            <p className="text-center text-[0.75rem] text-ink-500"><a className={btnClass('outline', 'sm')} href="/webinars">Browse more webinars</a></p>
        </WebinarShell>
    );
}

Confirmed.layout = null;
