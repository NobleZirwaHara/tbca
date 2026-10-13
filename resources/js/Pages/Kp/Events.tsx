import { Head, Link } from '@inertiajs/react';
import KpFrame, { SectionHeading, type KpShared } from '@/Components/Kp/KpFrame';
import { BtnLink, EventCover, StateChip } from '@/Components/Webinars/kit';
import type { WebinarEvent } from '@/types/webinars';

interface Props extends KpShared {
    webinars: WebinarEvent[];
    sessions: { key: string; title: string; type: string; date: string; time: string; topic: string }[];
}

export default function Events({ sections, webinars, sessions }: Props) {
    return (
        <KpFrame sections={sections} crumbs={[['Home', '/'], ['KP Thought Leadership', '/kp-thought-leadership'], ['Events']]} eyebrow="Events" title="Hear Kruger Phiri Live" lead="Webinars, masterclasses and strategy sessions led by Kruger Phiri. Replays publish only after TBCA review.">
            <Head title="Events | KP Thought Leadership" />
            <section>
                <SectionHeading title="Webinars with KP" more={['All webinars', '/webinars?speaker=Kruger%20Phiri']} />
                {webinars.length === 0 ? <p className="rounded-[10px] border border-parchment-400 bg-white p-6 text-ink-500">No webinars with KP are scheduled right now.</p> : (
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {webinars.map((e) => (
                            <li key={e.slug} className="flex flex-col overflow-hidden rounded-[10px] border border-parchment-400 bg-white">
                                <EventCover event={e} className="aspect-[16/7]" />
                                <div className="flex flex-1 flex-col p-4">
                                    <StateChip event={e} />
                                    <Link href={`/webinars/${e.slug}`} className="mt-2 font-serif text-[1.0625rem] font-bold text-ink-900 hover:text-gold-700">{e.title}</Link>
                                    <p className="text-[0.75rem] text-ink-500">{e.dateLong} | {e.timeRange}</p>
                                    <div className="mt-auto pt-3">
                                        {e.registrationOpen ? <BtnLink href={`/webinars/${e.slug}/register`} size="sm">Register</BtnLink> : e.replayAvailable ? <BtnLink href={`/webinars/${e.slug}/replay/watch`} size="sm">Watch Replay</BtnLink> : <BtnLink href={`/webinars/${e.slug}`} size="sm" tone="outline">View Event</BtnLink>}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
            <section>
                <SectionHeading title="KP Sessions for Clients" sub="Masterclasses and strategy sessions for TBCA clients. Register from your Client Portal." />
                <div className="overflow-x-auto rounded-[10px] border border-parchment-400 bg-white">
                    <table className="w-full text-left text-[0.8125rem]">
                        <thead className="bg-parchment-200 text-ink-700"><tr><th className="px-4 py-2">Session</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Topic</th><th className="px-4 py-2">Date</th><th className="px-4 py-2">Time</th><th className="px-4 py-2"><span className="sr-only">Action</span></th></tr></thead>
                        <tbody className="divide-y divide-parchment-300">
                            {sessions.map((s) => (
                                <tr key={s.key}><td className="px-4 py-2.5 font-semibold text-ink-900">{s.title}</td><td className="px-4 py-2.5">{s.type}</td><td className="px-4 py-2.5">{s.topic}</td><td className="px-4 py-2.5">{s.date}</td><td className="px-4 py-2.5">{s.time}</td><td className="px-4 py-2.5"><Link href="/portal/kp-sessions" className="font-semibold text-gold-700">Register</Link></td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </KpFrame>
    );
}
