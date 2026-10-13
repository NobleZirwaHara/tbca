import { Link } from '@inertiajs/react';
import { BtnLink, EventCover, StateChip } from '@/Components/Webinars/kit';
import { BASE, Empty, KpPage, type KpShared } from '@/Components/Kp/kit';
import type { WebinarEvent } from '@/types/webinars';

interface Props extends KpShared {
    webinars: WebinarEvent[];
}

/** Webinars and sessions with Kruger Phiri, from the Webinars module. */
export default function Events({ screen, kpNav, webinars }: Props) {
    return (
        <KpPage screen={screen} kpNav={kpNav} crumbs={[['Events']]} title="Events with KP" subtitle="Hear Kruger Phiri live." intro="Webinars and sessions led by Kruger Phiri. Replays publish only after TBCA review.">
            {webinars.length === 0 ? <Empty>No webinars with KP are scheduled right now.</Empty> : (
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
            <BtnLink href={`${BASE}/speaking-media`} tone="outline" icon="mic">Invite Kruger to Speak</BtnLink>
        </KpPage>
    );
}
