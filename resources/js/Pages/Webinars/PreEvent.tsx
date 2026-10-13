import { Head, Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { BtnLink, Card, Countdown, EventHero, FactsStrip, HelpCard, KeyDetails, RailEvent, RegistrationRequired, WebinarShell, btnClass, splitTitle } from '@/Components/Webinars/kit';
import type { EventFrame } from '@/types/webinars';

interface Props extends EventFrame {
    checklist: [string, string, boolean, [string, string] | null][];
}

const ICONS = [L.Mail, L.CalendarDays, L.FileText, L.MonitorPlay, L.Globe];

export default function PreEvent({ event, registration, checklist }: Props) {
    const [lead, gold] = splitTitle(event.title);
    const base = `/webinars/${event.slug}`;
    const started = event.live || !event.upcoming;

    return (
        <WebinarShell
            event={event}
            rail={
                <>
                    <RailEvent event={event} action={<Link href={`${base}/my-registration`} className="inline-flex items-center gap-1 text-[0.75rem] font-semibold text-gold-400"><L.Pencil className="size-3.5" aria-hidden="true" />Edit Registration</Link>} />
                    <KeyDetails event={event} title="Event Details" />
                    <HelpCard />
                </>
            }
        >
            <Head title={`Pre-Event Access: ${event.title}`} />
            <EventHero crumbs={[['Home', '/'], ['Webinars', '/webinars'], [lead.replace(/:$/, ''), base], ['Pre-Event Access']]} eyebrow="Your Webinar" title={lead} gold={gold} lead={registration ? 'You’re registered. Get ready for the webinar.' : 'Get ready for the webinar.'}>
                <FactsStrip event={event} />
            </EventHero>

            <RegistrationRequired event={event} registration={registration} />

            <section className="rounded-[12px] border border-parchment-400 bg-white p-4 sm:p-5">
                <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_26rem]">
                    <div className="flex items-center gap-4">
                        <span className="flex size-14 items-center justify-center rounded-full bg-gold-500 text-ink-900"><L.Clock className="size-7" aria-hidden="true" /></span>
                        <div>
                            <h2 className="font-serif text-[1.5rem] font-bold text-ink-900">{event.live ? 'The Webinar Is Live Now' : started ? 'This Session Has Ended' : 'Live Webinar Starts In'}</h2>
                            <p className="text-[0.875rem] text-ink-600">{event.live ? 'Join the live room now.' : started ? 'See the post-event page for resources and replay status.' : registration ? 'Your seat is confirmed. The session will start soon.' : 'Register to reserve your seat.'}</p>
                        </div>
                    </div>
                    {!started && <Countdown target={event.startsAt} light />}
                    {event.live && <BtnLink href={`${base}/live`} tone="danger" size="lg">Join Live Now</BtnLink>}
                    {started && !event.live && <BtnLink href={`${base}/thank-you`} size="lg">Open Post-Event Page</BtnLink>}
                </div>

                <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                    <div className="rounded-[10px] border border-parchment-400 bg-parchment-100 p-4">
                        <h2 className="font-serif text-[1.25rem] font-bold text-ink-900">Pre-Event Checklist</h2>
                        <p className="text-[0.8125rem] text-ink-500">Complete these steps to get the best experience.</p>
                        <ol className="mt-3 space-y-3">
                            {checklist.map(([t, b, done, action], i) => {
                                const I = ICONS[i] ?? L.Circle;
                                return (
                                    <li key={t} className="flex items-start gap-3">
                                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-400 text-[0.75rem] font-bold text-ink-900">{i + 1}</span>
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-parchment-300"><I className="size-5 text-ink-800" aria-hidden="true" /></span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[0.875rem] font-semibold text-ink-900">{t}</span>
                                            <span className="block text-[0.75rem] text-ink-600">{b}</span>
                                        </span>
                                        {done ? (
                                            <span className="shrink-0 rounded-full bg-verified-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-verified-700">Completed ✓</span>
                                        ) : action ? (
                                            <BtnLink href={action[1]} tone="outline" size="sm" className="shrink-0" external={action[1].startsWith('http')}>{action[0]}</BtnLink>
                                        ) : null}
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                    <div className="space-y-4">
                        <div className="rounded-[10px] border border-parchment-400 bg-parchment-100 p-4">
                            <h2 className="font-serif text-[1.25rem] font-bold text-ink-900">Join the Live Webinar</h2>
                            <p className="text-[0.8125rem] text-ink-500">Use your personal access link at the scheduled time.</p>
                            <BtnLink href={`${base}/live`} size="lg" className="mt-3 w-full" icon="video">Join Live Webinar</BtnLink>
                            <p className="mt-3 flex gap-2 rounded-[8px] bg-controlled-50 p-3 text-[0.75rem] text-ink-700"><L.Info className="size-5 shrink-0 text-controlled-500" aria-hidden="true" />This link is also in your confirmation email. Do not share this link with others.</p>
                        </div>
                        <Card title="Pre-Event Resources" className="bg-parchment-100">
                            <p className="-mt-2 mb-3 text-[0.8125rem] text-ink-500">Everything you need before the webinar.</p>
                            <ul className="space-y-2.5">
                                {([['PDF', 'Event Brief', 'Agenda, speaker profile and key topics.', `${base}/resources/brief`, 'Download', 'bg-risk-500'], ['DOC', 'Preparation Guide', 'Step by step guide to get the most value.', `${base}/resources/guide`, 'Download', 'bg-controlled-500'], ['XLS', 'Recommended Toolkits', 'Templates and checklists related to this webinar.', '/tools/toolkits', 'View Toolkits', 'bg-verified-500']] as const).map(([type, t, b, h, cta, bg]) => (
                                    <li key={t} className="flex items-center gap-3">
                                        <span className={`flex size-9 shrink-0 items-center justify-center rounded-[6px] text-[0.5625rem] font-bold text-white ${bg}`}>{type}</span>
                                        <span className="min-w-0 flex-1"><span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span><span className="block text-[0.6875rem] text-ink-500">{b}</span></span>
                                        {h.startsWith('/tools') ? <Link href={h} className={btnClass('outline', 'sm')}>{cta}</Link> : <a href={h} className={btnClass('outline', 'sm')}>{cta}</a>}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>
            </section>
        </WebinarShell>
    );
}

PreEvent.layout = null;
