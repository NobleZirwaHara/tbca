import { useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useMemo, useState } from 'react';
import { BtnLink, Ico, btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, Field, Input, KpPage, Textarea, useOfferPrice, type KpShared, type Offer } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Props extends KpShared {
    offers: Offer[];
    slots: string[];
    preset: string;
    minDate: string;
    reference: string | null;
}

const ABOUT: [string, string, string][] = [
    ['shield-check', 'Confidential & Private', 'All sessions are strictly confidential.'],
    ['user', 'Tailored to You', 'Each session is shaped around your context and goals.'],
    ['circle-check', 'Action-Oriented', 'You leave with clarity and next steps you can use.'],
    ['calendar-days', 'Reschedule Flexibly', 'Need to reschedule? We will work with you.'],
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function iso(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** KP-SCR-010 Book Kruger: a session request, not a booking (blueprint 18.5). */
export default function Book({ screen, kpNav, offers, slots, preset, minDate, reference }: Props) {
    const fee = useOfferPrice();
    const form = useForm({ offer: preset, date: '', slot: '', challenge: '', name: '', email: '', organisation: '', phone: '', founder_preference: 'best-fit' });
    const [month, setMonth] = useState(() => { const d = new Date(`${minDate}T00:00:00`); return new Date(d.getFullYear(), d.getMonth(), 1); });
    const cells = useMemo(() => {
        const first = (month.getDay() + 6) % 7;
        const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
        return [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
    }, [month]);
    const offer = offers.find((o) => o.key === form.data.offer);

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={[['Work With Kruger', `${BASE}/work-with-kruger`], ['Book Kruger']]}
            title="Book Kruger Phiri"
            subtitle="Focused time. Real clarity. Practical next steps."
            intro="Request a session with Kruger Phiri for strategic advice, honest perspectives and actionable guidance on your most important business or project challenge."
            rail={
                <>
                    <Box title="About Your Session">
                        <ul className="space-y-3">{ABOUT.map(([i, t, b]) => <li key={t} className="flex gap-2.5"><Ico name={i} className="mt-0.5 size-5 shrink-0 text-ink-700" /><span><span className="block text-[0.8125rem] font-bold text-ink-900">{t}</span><span className="block text-[0.75rem] text-ink-600">{b}</span></span></li>)}</ul>
                    </Box>
                    <Box title="What You'll Receive">
                        <ul className="space-y-1.5 text-[0.8125rem]">{['Dedicated time with the confirmed lead', 'Honest assessment and clarity', 'Practical recommendations', 'Summary of key insights', 'Optional follow-up resources'].map((t) => <li key={t} className="flex gap-2"><L.CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />{t}</li>)}</ul>
                    </Box>
                    <Box title="Need Help Choosing?" tone="cream">
                        <p className="text-[0.8125rem]">Not sure which session is right for you? Let us help you decide.</p>
                        <BtnLink href="/contact?subject=KP%20discovery%20call" tone="outline" className="mt-2 w-full" icon="arrow-right">Book a Discovery Call</BtnLink>
                    </Box>
                </>
            }
        >
            {reference && (
                <div className="flex gap-3 rounded-[10px] border border-verified-500/40 bg-verified-50 p-4 text-[0.875rem] text-ink-700">
                    <L.CircleCheck className="size-6 shrink-0 text-verified-500" aria-hidden="true" />
                    <p><strong className="text-ink-900">Request {reference} received.</strong> This is a request, not a booking. TBCA checks Founder capacity, confirms the delivery mode (K1 to K4) and the fee with you in writing before anything is booked or paid.</p>
                </div>
            )}

            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); form.post(`${BASE}/book`, { preserveScroll: true, onSuccess: () => form.reset('challenge', 'date', 'slot') }); }}>
                <fieldset>
                    <legend className="mb-2 font-serif text-[1.125rem] font-bold text-ink-900">1. Choose a Session</legend>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        {offers.map((o) => (
                            <label key={o.key} className={cn('relative flex cursor-pointer flex-col rounded-[10px] border bg-white p-3 text-center', form.data.offer === o.key ? 'border-gold-500 bg-gold-50 ring-2 ring-gold-500/30' : 'border-parchment-400')}>
                                <input type="radio" name="offer" value={o.key} checked={form.data.offer === o.key} onChange={() => form.setData('offer', o.key)} className="absolute top-2 left-2 accent-gold-600" />
                                <Ico name={o.icon} className="mx-auto size-8 text-gold-600" />
                                <span className="mt-2 text-[0.8125rem] font-bold text-ink-900">{o.title}</span>
                                <span className="mt-1 flex-1 text-[0.6875rem] text-ink-600">{o.body}</span>
                                <span className="mt-2 text-[0.6875rem] text-ink-500"><L.Clock className="mr-1 inline size-3" aria-hidden="true" />{o.duration}</span>
                                <span className="mt-1 text-[0.8125rem] font-bold text-ink-900">{fee(o)}</span>
                            </label>
                        ))}
                    </div>
                    {form.errors.offer && <p className="mt-1 text-[0.75rem] text-risk-500">{form.errors.offer}</p>}
                </fieldset>

                <div className="grid gap-4 lg:grid-cols-[17rem_12rem_minmax(0,1fr)]">
                    <fieldset className="rounded-[10px] border border-parchment-400 bg-white p-3">
                        <legend className="px-1 text-[0.875rem] font-bold text-ink-900">2. Select a Preferred Date</legend>
                        <div className="flex items-center justify-between">
                            <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month"><L.ChevronLeft className="size-4" /></button>
                            <span className="text-[0.8125rem] font-semibold">{month.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}</span>
                            <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month"><L.ChevronRight className="size-4" /></button>
                        </div>
                        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[0.6875rem]">
                            {DAYS.map((d) => <span key={d} className="font-semibold text-ink-500">{d}</span>)}
                            {cells.map((d, i) => {
                                if (!d) return <span key={`e${i}`} />;
                                const v = iso(d);
                                const disabled = v < minDate || d.getDay() === 0;
                                return <button key={v} type="button" disabled={disabled} aria-pressed={form.data.date === v} onClick={() => form.setData('date', v)} className={cn('h-7 rounded-[4px]', form.data.date === v ? 'bg-gold-500 font-bold text-ink-900' : disabled ? 'text-ink-300' : 'hover:bg-gold-100')}>{d.getDate()}</button>;
                            })}
                        </div>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">All times in Africa/Johannesburg (SAST). Earliest date {minDate}.</p>
                        {form.errors.date && <p className="text-[0.75rem] text-risk-500">{form.errors.date}</p>}
                    </fieldset>
                    <fieldset className="rounded-[10px] border border-parchment-400 bg-white p-3">
                        <legend className="px-1 text-[0.875rem] font-bold text-ink-900">3. Select a Time</legend>
                        <div className="grid gap-2">{slots.map((s) => <button key={s} type="button" aria-pressed={form.data.slot === s} onClick={() => form.setData('slot', s)} className={cn('h-9 rounded-[6px] border text-[0.8125rem]', form.data.slot === s ? 'border-gold-500 bg-gold-50 font-bold' : 'border-parchment-500')}>{s}</button>)}</div>
                        {form.errors.slot && <p className="mt-1 text-[0.75rem] text-risk-500">{form.errors.slot}</p>}
                    </fieldset>
                    <div className="space-y-3 rounded-[10px] border border-parchment-400 bg-white p-3">
                        <p className="text-[0.875rem] font-bold text-ink-900">4. Tell Us About Your Challenge</p>
                        <Field label="Your challenge, decision or objective" error={form.errors.challenge} hint={`${500 - form.data.challenge.length} characters remaining (minimum 20)`}>
                            <Textarea maxLength={500} required value={form.data.challenge} onChange={(e) => form.setData('challenge', e.target.value)} placeholder="Briefly describe your challenge, decision or objective..." />
                        </Field>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Full name" error={form.errors.name}><Input required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></Field>
                            <Field label="Email" error={form.errors.email}><Input type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} /></Field>
                            <Field label="Organisation (optional)"><Input value={form.data.organisation} onChange={(e) => form.setData('organisation', e.target.value)} /></Field>
                            <Field label="Phone (optional)"><Input value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} /></Field>
                        </div>
                        <fieldset className="text-[0.8125rem]">
                            <legend className="font-semibold text-ink-800">Who should lead?</legend>
                            <label className="mt-1 flex items-center gap-2"><input type="radio" className="accent-gold-600" checked={form.data.founder_preference === 'founder'} onChange={() => form.setData('founder_preference', 'founder')} />Kruger personally, and I accept a waitlist if he is not available</label>
                            <label className="mt-1 flex items-center gap-2"><input type="radio" className="accent-gold-600" checked={form.data.founder_preference === 'best-fit'} onChange={() => form.setData('founder_preference', 'best-fit')} />The best-fit lead (Kruger or a named TBCA professional), disclosed before payment</label>
                        </fieldset>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-parchment-400 bg-parchment-200 p-3">
                    <p className="flex items-center gap-2 text-[0.75rem] text-ink-600"><L.Info className="size-4" aria-hidden="true" />Nothing is charged now. {offer ? `${offer.title}: ${fee(offer)}, indicative.` : ''} Payment details follow only after TBCA confirms availability and fee.</p>
                    <button type="submit" disabled={form.processing} className={btnClass('gold', 'lg')}>Submit Request <L.ArrowRight className="size-4" /></button>
                </div>
            </form>
        </KpPage>
    );
}
