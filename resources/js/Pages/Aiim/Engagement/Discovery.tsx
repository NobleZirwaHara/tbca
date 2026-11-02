import { router } from '@inertiajs/react';
import { useState } from 'react';
import { ADV, Flow, Panel, SvcRail, btn, type Rail } from '@/Components/Aiim/ProtoEngagement';
import { cn } from '@/lib/cn';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Props extends AiimPageProps {
    engagement: Engagement;
    days: { date: string; label: string; slots: { time: string; taken: boolean }[] }[];
    advisor: string | null;
    user: { name: string; email: string; phone: string | null; company: string | null };
    rail: Rail;
}

const CHANNEL: Record<string, string> = { 'Video call': 'video', WhatsApp: 'video', Phone: 'phone', 'In person (Gaborone)': 'in-person' };

/** Page 42 Booking Discovery: pick a slot and the 30-minute call is booked through the shared booking service. */
export default function Discovery({ engagement: e, days, advisor, user, rail }: Props) {
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const req = e.request ?? {};
    const book = (date: string, time: string) => {
        setBusy(`${date} ${time}`);
        setError(null);
        router.post('/bookings', {
            type: 'aiim-discovery', topic: String(req.purpose ?? e.title).slice(0, 190), date, time, duration_minutes: 30, channel: CHANNEL[req.channel as string] ?? 'video',
            name: user.name, email: user.email, phone: user.phone ?? '', company: user.company ?? '',
            meta: { engagement: e.reference, advisor: advisor ?? '', focus: (e.sectorNames ?? [])[0] ?? null, additional: [], background: req.detail ?? req.summary ?? '' },
            redirect: `/aiim/workspace/engagements/${e.reference}/booked?booking={reference}`,
        }, { preserveScroll: true, onError: (errs) => setError(Object.values(errs)[0] ?? 'That slot could not be booked.'), onFinish: () => setBusy(null) });
    };
    return (
        <Flow title="Booking Discovery" eyebrow="Page 42 · 30-minute discovery call (CAT, UTC+2)" steps={{ list: ADV, on: 1 }} crumbs={[{ label: 'Advisor Request', href: '/aiim/workspace/advisor-request' }]} side={<SvcRail rail={rail} context="Discovery booking" />}>
            <Panel title="Pick a slot">
                <p className="mb-3 text-[0.82rem] text-ink-600">Request <span className="font-mono">{e.reference}</span>: {e.title}</p>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5">
                    {days.map((d) => (
                        <div key={d.date}>
                            <b className="text-[0.88rem]">{d.label}</b>
                            {d.slots.map((s) => (
                                <button key={s.time} type="button" disabled={s.taken || !!busy} onClick={() => book(d.date, s.time)}
                                    className={cn(btn('ghost', 'sm'), 'mt-1.5 w-full', busy === `${d.date} ${s.time}` && 'border-gold-500 bg-gold-50')}
                                    aria-label={`${d.label} ${s.time}${s.taken ? ' (booked)' : ''}`}>
                                    {s.taken ? <span className="line-through">{s.time}</span> : s.time}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
                {error && <p role="alert" className="mt-3 text-[0.82rem] text-risk-700">{error}</p>}
                <p className="mt-3 text-[0.75rem] text-ink-500">Times are Central Africa Time (UTC+2). Struck-through slots are already booked.</p>
            </Panel>
        </Flow>
    );
}
