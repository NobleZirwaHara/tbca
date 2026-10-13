import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { StatusPill } from '@/Components/ui/Kit';
import { BtnLink, Ico } from '@/Components/Webinars/kit';
import { BASE, Box, KpPage, useOfferPrice, type KpShared, type Offer } from '@/Components/Kp/kit';

interface Props extends KpShared {
    offers: Offer[];
    modes: [string, string, string][];
    availability: { week: string; status: string }[];
}

const BEFORE = ['Be clear on the problem or decision.', 'Share relevant context and evidence.', 'Understand this is advisory, not execution.', 'Engagement is subject to availability and mutual fit.'];
const EXPECT = ['Honest assessment and clarity.', 'Evidence-based advice.', 'Practical, executable recommendations.', 'Confidentiality and professional boundaries.', 'No guarantees, only our best judgement.'];
const STEPS: [string, string, string][] = [
    ['file-text', 'Submit Request', 'Complete a short brief about your challenge and context.'],
    ['calendar-days', 'Availability Check', 'We review fit, scope and current Founder availability.'],
    ['message-circle', 'Initial Conversation', 'A brief call to align on needs, outcomes and engagement type.'],
    ['circle-check', 'Engagement Confirmed', 'Scope, delivery mode, terms and fee confirmed. Work begins.'],
];

/** KP-SCR-009 Work With Kruger. Fees are indicative and confirmed before booking (blueprint 18.5). */
export default function Work({ screen, kpNav, offers, modes, availability }: Props) {
    const fee = useOfferPrice();
    const open = availability.filter((a) => a.status === 'Available').length;
    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={[['Work With Kruger']]}
            title="Work With Kruger"
            subtitle="Strategic advice. Practical execution. Measurable impact."
            intro="Five ways to engage with Kruger Phiri, depending on your challenge, urgency and the level of involvement you need."
            actions={
                <div className="flex items-center gap-3 rounded-[10px] border border-parchment-400 bg-white p-3">
                    <L.CalendarDays className="size-7 text-gold-600" aria-hidden="true" />
                    <div className="text-[0.8125rem]"><p className="font-bold text-ink-900">Current Availability</p><p className="text-ink-600">{open > 0 ? `Limited advisory slots in ${open} of the next ${availability.length} weeks.` : 'Waitlist only for the coming weeks.'}</p></div>
                </div>
            }
            rail={
                <>
                    <Box title="Before You Engage" icon="list-checks">
                        <ul className="space-y-1.5 text-[0.8125rem]">{BEFORE.map((b) => <li key={b} className="flex gap-2"><L.Link className="mt-0.5 size-3.5 shrink-0 text-ink-500" aria-hidden="true" />{b}</li>)}</ul>
                    </Box>
                    <Box title="What You Can Expect" icon="shield-check">
                        <ul className="space-y-1.5 text-[0.8125rem]">{EXPECT.map((b) => <li key={b} className="flex gap-2"><L.CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />{b}</li>)}</ul>
                    </Box>
                    <Box title="Founder Availability" icon="calendar-check">
                        <ul className="space-y-1.5 text-[0.8125rem]">{availability.map((a) => <li key={a.week} className="flex items-center justify-between gap-2">{a.week.replace(' Founder hours', '')}<StatusPill status={a.status} /></li>)}</ul>
                    </Box>
                    <Box title="Ready to Start?" tone="cream">
                        <p className="text-[0.8125rem]">Tell us about your challenge and we'll respond within 2 business days.</p>
                        <BtnLink href={`${BASE}/book`} className="mt-3 w-full" icon="arrow-right">Request a Session</BtnLink>
                    </Box>
                </>
            }
        >
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {offers.map((o, i) => (
                    <li key={o.key} className="flex flex-col rounded-[10px] border border-parchment-400 bg-white p-4">
                        <span className="flex size-6 items-center justify-center rounded-full bg-ink-900 text-[0.6875rem] font-bold text-parchment-50">{i + 1}</span>
                        <Ico name={o.icon} className="mx-auto mt-2 size-9 text-gold-600" />
                        <h2 className="mt-3 font-serif text-[1.0625rem] leading-snug font-bold text-ink-900">{o.title}</h2>
                        <p className="mt-1 text-[0.75rem] text-ink-600">{o.body}</p>
                        <ul className="mt-3 flex-1 space-y-1 text-[0.75rem]">{o.features.map((f) => <li key={f} className="flex gap-1.5"><L.CircleCheck className="mt-0.5 size-3.5 shrink-0 text-gold-600" aria-hidden="true" />{f}</li>)}</ul>
                        <p className="mt-3 rounded-[6px] bg-parchment-200 px-2 py-1.5 text-center text-[0.75rem] font-semibold text-ink-900">{fee(o)}</p>
                        <BtnLink href={`${BASE}/book?offer=${o.key}`} size="sm" className="mt-2 w-full" icon="arrow-right">{o.cta}</BtnLink>
                    </li>
                ))}
            </ul>
            <p className="text-[0.75rem] text-ink-500">Fees are indicative and still to be approved. Your fee, scope and delivery mode are confirmed in writing before anything is booked or paid.</p>

            <section>
                <h2 className="mb-3 font-serif text-[1.25rem] font-bold text-ink-900">How It Works</h2>
                <ol className="grid gap-3 rounded-[10px] border border-parchment-400 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
                    {STEPS.map(([i, t, b], n) => (
                        <li key={t} className="flex gap-3">
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[0.6875rem] font-bold text-parchment-50">{n + 1}</span>
                            <span><span className="flex items-center gap-2 text-[0.8125rem] font-bold text-ink-900"><Ico name={i} className="size-4 text-gold-600" />{t}</span><span className="block text-[0.75rem] text-ink-600">{b}</span></span>
                        </li>
                    ))}
                </ol>
            </section>

            <Box title="Who Delivers Your Session" icon="users">
                <p className="mb-3 text-[0.8125rem]">Every engagement states its delivery mode before you pay, so you always know whether Kruger personally attends.</p>
                <ul className="grid gap-3 sm:grid-cols-2">
                    {modes.map(([k, t, b]) => <li key={k} className="rounded-[8px] border border-parchment-400 p-3 text-[0.8125rem]"><p className="font-bold text-ink-900"><span className="mr-2 rounded-[4px] bg-ink-900 px-1.5 py-0.5 text-[0.6875rem] text-gold-400">{k}</span>{t}</p><p className="mt-1 text-ink-600">{b}</p></li>)}
                </ul>
            </Box>

            <p className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-attested-500/30 bg-attested-50 px-4 py-3 text-[0.8125rem] text-ink-700">
                <span className="flex items-center gap-2"><L.ShieldAlert className="size-5 shrink-0 text-attested-500" aria-hidden="true" /><span><strong>Important:</strong> Kruger Phiri is not a product. Engagements are knowledge work that requires judgement, context and capacity. Availability is limited and not guaranteed.</span></span>
                <Link href={`${BASE}/free-and-paid`} className="font-semibold text-gold-700">Read the Engagement Principles</Link>
            </p>
        </KpPage>
    );
}
