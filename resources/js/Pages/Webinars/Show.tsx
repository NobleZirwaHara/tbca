import { Head, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import { BtnLink, CalendarButtons, Card, CheckItem, Countdown, EventHero, FactsStrip, HelpCard, Ico, NoticeCards, PillTabs, SpeakerLine, WebinarShell, btnClass, splitTitle } from '@/Components/Webinars/kit';
import type { EventFrame, WebinarEvent } from '@/types/webinars';

interface Props extends EventFrame {
    countries: string[];
    related: WebinarEvent[];
}

const inputDark = 'h-10 w-full rounded-[6px] border border-ink-700 bg-ink-900 px-3 text-[0.8125rem] text-parchment-50 placeholder:text-ink-300 focus:border-gold-500 focus:outline-none';

export default function Show({ event, registration, notices, countries, related }: Props) {
    const [tab, setTab] = useState('overview');
    const [mode, setMode] = useState<'register' | 'replay'>(event.registrationOpen ? 'register' : 'replay');
    const [quick, setQuick] = useState({ first_name: '', last_name: '', email: '', country: '' });
    const price = usePrice();
    const [lead, gold] = splitTitle(event.title);
    const base = `/webinars/${event.slug}`;

    const start = (e: FormEvent) => {
        e.preventDefault();
        router.get(`${base}/register`, quick);
    };

    const registerCard = (
        <Card tone="dark" title={event.registrationOpen ? 'Live Webinar Starts In' : event.stateLabel}>
            {event.registrationOpen && <Countdown target={event.startsAt} />}
            <div className="mt-4 grid grid-cols-2 gap-1 rounded-[8px] border border-ink-700 p-1" role="tablist">
                <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => setMode('register')} className={cn('rounded-[6px] py-2 text-[0.8125rem] font-semibold', mode === 'register' ? 'bg-gold-500 text-ink-900' : 'text-parchment-200')}>Register to Attend</button>
                <button type="button" role="tab" aria-selected={mode === 'replay'} onClick={() => setMode('replay')} className={cn('rounded-[6px] py-2 text-[0.8125rem] font-semibold', mode === 'replay' ? 'bg-gold-500 text-ink-900' : 'text-parchment-200')}>Watch Replay</button>
            </div>
            {mode === 'register' ? (
                registration ? (
                    <div className="mt-4 space-y-3 text-[0.8125rem]">
                        <p className="flex items-center gap-2 text-verified-500"><L.CircleCheck className="size-4" aria-hidden="true" /> You are registered ({registration.reference}).</p>
                        <BtnLink href={`${base}/pre-event`} className="w-full">Open Pre-Event Access</BtnLink>
                        <BtnLink href={`${base}/my-registration`} tone="ghostDark" className="w-full">View My Registration</BtnLink>
                    </div>
                ) : event.registrationOpen ? (
                    <form onSubmit={start} className="mt-4 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <label className="text-[0.75rem] text-parchment-200">First Name *<input required className={cn(inputDark, 'mt-1')} placeholder="Enter your first name" value={quick.first_name} onChange={(e) => setQuick({ ...quick, first_name: e.target.value })} /></label>
                            <label className="text-[0.75rem] text-parchment-200">Last Name *<input required className={cn(inputDark, 'mt-1')} placeholder="Enter your last name" value={quick.last_name} onChange={(e) => setQuick({ ...quick, last_name: e.target.value })} /></label>
                        </div>
                        <label className="block text-[0.75rem] text-parchment-200">Email Address *<input required type="email" className={cn(inputDark, 'mt-1')} placeholder="Enter your email address" value={quick.email} onChange={(e) => setQuick({ ...quick, email: e.target.value })} /></label>
                        <label className="block text-[0.75rem] text-parchment-200">Country *
                            <select required className={cn(inputDark, 'mt-1')} value={quick.country} onChange={(e) => setQuick({ ...quick, country: e.target.value })}>
                                <option value="">Select your country</option>
                                {countries.map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </label>
                        <button type="submit" className={cn(btnClass('gold', 'lg'), 'w-full')}><L.CalendarCheck className="size-5" aria-hidden="true" /> Register for This Webinar <L.ArrowRight className="size-4" aria-hidden="true" /></button>
                        <p className="text-[0.6875rem] text-parchment-300">Next you choose how to participate and confirm the recording notice and offer disclosure. {event.priceZar ? `Seat price: ${price(event.priceZar)}.` : 'Free to attend.'}</p>
                    </form>
                ) : (
                    <p className="mt-4 text-[0.8125rem] text-parchment-200">Registration is closed for this event. {event.live ? 'The session is live now.' : 'See the replay status.'}</p>
                )
            ) : (
                <div className="mt-4 space-y-3 text-[0.8125rem] text-parchment-200">
                    {event.replayAvailable ? (
                        <>
                            <p>The approved replay is available{event.replayDuration ? ` (${event.replayDuration})` : ''}.</p>
                            <BtnLink href={`${base}/replay/watch`} className="w-full" icon="play">Watch Replay</BtnLink>
                        </>
                    ) : (
                        <p>{event.upcoming ? 'A replay is a new publication. It is published only after TBCA W3 review. Registrants are notified when it is approved.' : `Replay status: ${event.stateLabel}.`}</p>
                    )}
                    <BtnLink href={`${base}/replay`} tone="ghostDark" className="w-full">Replay Library</BtnLink>
                </div>
            )}
            {event.live && <BtnLink href={`${base}/live`} tone="danger" className="mt-3 w-full">Join Live Session</BtnLink>}
        </Card>
    );

    return (
        <WebinarShell
            event={event}
            rail={
                <>
                    {registerCard}
                    <Card tone="dark" title="Add to Your Calendar" icon="calendar-days"><CalendarButtons event={event} dark /></Card>
                    <HelpCard />
                    {related.length > 0 && (
                        <Card title="More Upcoming Webinars">
                            <ul className="space-y-2.5">
                                {related.map((r) => (
                                    <li key={r.slug}><a href={`/webinars/${r.slug}`} className="block text-[0.8125rem] font-semibold text-ink-900 hover:text-gold-700">{r.title}</a><span className="text-[0.6875rem] text-ink-500">{r.dateLong}</span></li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </>
            }
        >
            <Head title={event.title} />
            <EventHero
                crumbs={[['Home', '/'], ['Webinars', '/webinars'], [event.title]]}
                eyebrow={event.live ? 'Live Now' : event.upcoming ? 'Live Webinar' : event.stateLabel}
                eyebrowTone={event.live ? 'live' : 'gold'}
                title={lead}
                gold={gold}
                lead={event.tagline}
            >
                <FactsStrip event={event} />
                <div className="mt-4"><SpeakerLine name={event.speaker} role={event.speakerRole} dark /></div>
            </EventHero>

            <ul className="grid gap-3 rounded-[12px] border border-gold-300 bg-ink-950 p-4 sm:grid-cols-2 xl:grid-cols-4">
                {([['users', 'Live Q&A', 'Ask questions in real time'], ['book-open', 'Practical Tools', 'Templates and checklist'], ['trending-up', 'Real Case Studies', 'African businesses'], ['lightbulb', 'Expert Insights', 'From TBCA and partners']] as const).map(([i, t, b]) => (
                    <li key={t} className="flex items-center gap-3">
                        <span className="flex size-11 items-center justify-center rounded-full border border-gold-600 text-gold-400"><Ico name={i} className="size-5" /></span>
                        <span><span className="block text-[0.875rem] font-semibold text-parchment-50">{t}</span><span className="block text-[0.75rem] text-parchment-300">{b}</span></span>
                    </li>
                ))}
            </ul>

            <NoticeCards notices={notices} keys={['recording', 'offer']} />

            <section className="rounded-[12px] border border-parchment-400 bg-white p-4 sm:p-5">
                <PillTabs
                    dark
                    value={tab}
                    onChange={setTab}
                    tabs={[{ key: 'overview', label: 'Overview' }, { key: 'agenda', label: 'Agenda' }, { key: 'speakers', label: 'Speakers' }, { key: 'who', label: 'Who Should Attend' }, { key: 'tools', label: 'Tools & Takeaways' }, { key: 'faqs', label: 'FAQs' }]}
                />
                <div className="mt-5">
                    {tab === 'overview' && (
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                            <div>
                                <h2 className="font-serif text-[1.5rem] font-bold text-ink-900">About This Webinar</h2>
                                <div className="mt-1 h-0.5 w-12 bg-gold-500" />
                                {event.about.map((p) => <p key={p} className="mt-3 text-[0.9375rem] leading-relaxed text-ink-700">{p}</p>)}
                            </div>
                            <Card tone="cream" title="Key Learning Outcomes">
                                <ul className="space-y-2">{event.outcomes.map((o) => <CheckItem key={o}>{o}</CheckItem>)}</ul>
                            </Card>
                        </div>
                    )}
                    {tab === 'agenda' && (
                        <ol className="divide-y divide-parchment-300">
                            {event.agenda.map(([t, h, b]) => (
                                <li key={t + h} className="grid gap-1 py-3 sm:grid-cols-[5rem_1fr]">
                                    <span className="font-mono text-[0.8125rem] font-bold text-gold-700">{t}</span>
                                    <span><span className="block font-semibold text-ink-900">{h}</span><span className="text-[0.8125rem] text-ink-600">{b}</span></span>
                                </li>
                            ))}
                        </ol>
                    )}
                    {tab === 'speakers' && (
                        <ul className="grid gap-3 sm:grid-cols-2">
                            {event.speakers.map(([n, r]) => (
                                <li key={n} className="rounded-[10px] border border-parchment-400 p-4"><SpeakerLine name={n} role={r} /><p className="mt-2 text-[0.75rem] text-ink-500">Biography and credentials are verified before the event (W1).</p></li>
                            ))}
                        </ul>
                    )}
                    {tab === 'who' && <ul className="grid gap-2 sm:grid-cols-2">{event.whoShouldAttend.map((w) => <CheckItem key={w}>{w}</CheckItem>)}</ul>}
                    {tab === 'tools' && <ul className="grid gap-2 sm:grid-cols-2">{event.takeaways.map((w) => <CheckItem key={w}>{w}</CheckItem>)}</ul>}
                    {tab === 'faqs' && (
                        <div className="divide-y divide-parchment-300">
                            {event.faqs.map(([q, a]) => (
                                <details key={q} className="group py-3">
                                    <summary className="flex cursor-pointer items-center justify-between font-semibold text-ink-900">{q}<L.ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
                                    <p className="mt-2 text-[0.875rem] text-ink-600">{a}</p>
                                </details>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <NoticeCards notices={notices} keys={['boundary']} />
        </WebinarShell>
    );
}

Show.layout = null;
