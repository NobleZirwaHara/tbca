import { router } from '@inertiajs/react';
import { ADV, Banner, Btn, Dl, Flow, Panel, btn, eng } from '@/Components/Aiim/ProtoEngagement';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Props extends AiimPageProps {
    engagement: Engagement;
    booking: { reference: string; when: string; duration: number; with: string; channel: string; status: string; topic: string | null; ics: string; icsEnd: string };
    canChange: boolean;
}

/** Page 43 Discovery Confirmation. */
export default function DiscoveryConfirmed({ engagement: e, booking: b, canChange }: Props) {
    const ics = `data:text/calendar;charset=utf-8,${encodeURIComponent(['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', `UID:${b.reference}@tbca`, `DTSTART:${b.ics}`, `DTEND:${b.icsEnd}`, `SUMMARY:TBCA discovery call ${b.reference}`, `DESCRIPTION:${(b.topic ?? e.title).replace(/\n/g, ' ')}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'))}`;
    const cancel = (reschedule: boolean) => {
        if (!reschedule && !window.confirm('Cancel this discovery session?')) return;
        router.post(eng(e.reference, '/discovery/cancel'), { reschedule: reschedule ? 1 : 0 });
    };
    return (
        <Flow title="Discovery Confirmation" eyebrow="Page 43" steps={{ list: ADV, on: 1 }} crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }]}
            side={<Banner>Booking <span className="font-mono">{b.reference}</span> is confirmed for request <span className="font-mono">{e.reference}</span>. You can change it up to 24 hours before the start.</Banner>}>
            <Panel title="Booked">
                <Dl rows={[
                    ['When', b.when],
                    ['With', b.with],
                    ['Channel', b.channel],
                    ['Duration', `${b.duration} minutes`],
                    ['Prepare', 'Your question, ticket size and preferred units'],
                ]} />
                <div className="mt-4 flex flex-wrap gap-2">
                    <Btn href={eng(e.reference, '/outcome')} size="sm">See outcome view</Btn>
                    <a href={ics} download={`tbca-discovery-${b.reference}.ics`} className={btn('ghost', 'sm')}>Add to calendar</a>
                    <button type="button" className={btn('ghost', 'sm')} disabled={!canChange} onClick={() => cancel(true)}>Reschedule</button>
                    <button type="button" className={btn('danger', 'sm')} disabled={!canChange} onClick={() => cancel(false)}>Cancel session</button>
                </div>
                <p className="mt-2 text-[0.75rem] text-ink-500">The outcome view opens once your advisor records the outcome after the call.</p>
            </Panel>
        </Flow>
    );
}
