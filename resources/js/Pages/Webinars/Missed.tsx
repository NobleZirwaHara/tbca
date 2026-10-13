import { Head } from '@inertiajs/react';
import * as L from 'lucide-react';
import { BtnLink, Card, EventHero, KeyDetails, ResourceRows, Stage, WebinarShell, splitTitle } from '@/Components/Webinars/kit';
import type { EventFrame } from '@/types/webinars';

interface Props extends EventFrame {
    sequence: [string, string, string][];
}

export default function Missed({ event, registration, sequence }: Props) {
    const [lead, gold] = splitTitle(event.title);
    const base = `/webinars/${event.slug}`;
    const first = registration?.name.split(' ')[0];

    return (
        <WebinarShell
            event={event}
            rail={
                <>
                    <KeyDetails event={event} title="Webinar Details" />
                    <Card title="What We Will Send You" icon="mail">
                        <ol className="space-y-2.5">
                            {sequence.map(([t, b], i) => (
                                <li key={t} className="flex gap-2.5">
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-verified-500 text-[0.6875rem] font-bold text-white">{i + 1}</span>
                                    <span><span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span><span className="text-[0.75rem] text-ink-500">{b}</span></span>
                                </li>
                            ))}
                        </ol>
                        <p className="mt-3 text-[0.6875rem] text-ink-500">You can change these emails in the <a href="/resources/preferences" className="font-semibold text-gold-700">Preference Centre</a>.</p>
                    </Card>
                </>
            }
        >
            <Head title={`We Missed You: ${event.title}`} />
            <EventHero crumbs={[['Home', '/'], ['Webinars', '/webinars'], [lead.replace(/:$/, ''), base], ['Missed the Session']]} eyebrow="Follow-Up" title={first ? `We Missed You, ${first}!` : 'We Missed You!'} gold={gold ? `${lead} ${gold}` : lead} lead="Some things are worth a second chance. Watch the approved replay and access the resources, insights and next steps." />

            <section className="grid gap-4 rounded-[12px] border border-parchment-400 bg-white p-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                <Stage event={event} badge={<span className="rounded bg-ink-950/80 px-2 py-0.5 text-[0.75rem] font-semibold text-gold-400">{event.replayAvailable ? 'Replay available' : event.stateLabel}</span>} />
                <div>
                    <h2 className="font-serif text-[1.375rem] font-bold text-ink-900">{event.replayAvailable ? 'Watch the Full Replay' : 'Replay Under Review'}</h2>
                    <p className="mt-2 text-[0.875rem] text-ink-600">
                        {event.replayAvailable
                            ? 'No problem that you could not join. You can now watch the full replay at your convenience and access the presentation slides, resources and post-webinar offers.'
                            : 'The recording is in TBCA W3 review. A replay is a new publication and is only released after review. We will email your link as soon as it is approved. Meanwhile, the event brief and toolkits are available.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {event.replayAvailable ? <BtnLink href={`${base}/replay/watch`} size="lg" icon="play">Watch the Full Replay</BtnLink> : <BtnLink href={`${base}/replay`} size="lg">Check Replay Status</BtnLink>}
                        <BtnLink href="/webinars?when=upcoming" tone="outline" size="lg">Join the Next Live Session</BtnLink>
                    </div>
                    <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {([[L.FileText, 'Presentation Slides', `${base}/replay`], [L.Wrench, 'Practical Toolkits', '/tools/toolkits'], [L.Lightbulb, 'Key Insights', `${base}/replay`], [L.Tag, 'Post-Webinar Offers', `${base}/offers`]] as const).map(([I, l, h]) => (
                            <li key={l}><a href={h} className="flex flex-col items-center gap-1 rounded-[8px] border border-parchment-400 p-3 text-center text-[0.75rem] font-semibold text-ink-800 hover:border-gold-500"><I className="size-6 text-gold-600" aria-hidden="true" />{l}</a></li>
                        ))}
                    </ul>
                </div>
            </section>

            <Card title="Your Resources" icon="download"><ResourceRows event={event} /></Card>
        </WebinarShell>
    );
}

Missed.layout = null;
