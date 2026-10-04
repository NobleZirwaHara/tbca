import { useForm } from '@inertiajs/react';
import { CalendarDays, Clock } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Avatar, HumanLed, Journey } from '@/Components/Aiim/EngagementKit';
import AiimPage, { SectionCard, SelectionBox, RailBox } from '@/Components/Aiim/Shell';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Stepper } from '@/Components/ui/Kit';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { cn } from '@/lib/cn';
import type { Advisor, AiimPageProps, Engagement } from '@/types/aiim';

interface Props extends AiimPageProps {
    engagement: Engagement;
    advisors: Advisor[];
    user: { name: string; email: string; phone: string | null; company: string | null };
}

const TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
const PURPOSES = ['Explore investment opportunities', 'Market entry planning', 'Project packaging & funding', 'Verification & due diligence scoping', 'Custom intelligence scoping'];
const AREAS = ['Project due diligence support', 'Partner & investor introductions', 'Regulatory & policy', 'Financial modelling'];

/** Next 14 weekdays from tomorrow (sessions are booked at least 24 hours ahead). */
function weekdays(): string[] {
    const out: string[] = [];
    const d = new Date();
    while (out.length < 14) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() !== 0 && d.getDay() !== 6) out.push(d.toISOString().slice(0, 10));
    }
    return out;
}

export default function Discovery({ engagement: e, advisors, user }: Props) {
    const days = weekdays();
    const [taken, setTaken] = useState<string[]>([]);
    const req = e.request ?? {};
    const form = useForm({
        type: 'aiim-discovery', topic: req.purpose ?? PURPOSES[0], date: '', time: '', duration_minutes: 60, channel: 'video',
        name: user.name, email: user.email, phone: user.phone ?? '', company: user.company ?? '', heard: 'AIIM Platform',
        meta: { engagement: e.reference, advisor: advisors[0]?.slug ?? '', focus: (e.sectorNames ?? [])[0] ?? 'Renewable Energy', additional: [] as string[], background: req.summary ?? req.background ?? '' },
        redirect: `/aiim/workspace/engagements/${e.reference}/booked?booking={reference}`,
    });
    const pickDate = (date: string) => {
        form.setData((d) => ({ ...d, date, time: '' }));
        void fetch(`/bookings/slots?date=${date}`, { headers: { Accept: 'application/json' } }).then((r) => r.json()).then((j: { taken: string[] }) => setTaken(j.taken)).catch(() => setTaken([]));
    };
    const meta = (k: string, v: unknown) => form.setData('meta', { ...form.data.meta, [k]: v });
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post('/bookings'); };
    const step = !form.data.date ? 3 : !form.data.time ? 3 : 4;
    const err = form.errors as Record<string, string>;

    return (
        <AiimPage
            title="Discovery Booking"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Advisor Services' }, { label: 'Discovery Booking' }]}
            heading={<>Discovery Booking <CalendarDays className="size-7 text-referenced-500" /></>}
            subtitle="Schedule a discovery session with a TBCA advisor."
            description={`A 30–60 minute session to understand your goals and explore how we can help. Request ${e.reference}: ${e.title}.`}
            accent="purple"
            notice={<HumanLed text="Sessions are with experienced TBCA advisors. No AI-only advice." />}
            rail={<><SelectionBox /><RailBox title="Need Help?"><p className="text-xs text-ink-300">Our team is here to help you book your discovery session.</p></RailBox></>}
        >
            <Journey e={e} />
            <SectionCard className="mb-4"><Stepper steps={['Session Details', 'Select Advisor', 'Choose Date & Time', 'Your Details', 'Review & Confirm']} current={step} /></SectionCard>
            <form onSubmit={submit} noValidate>
                <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
                    <SectionCard number={1} title="Session Details">
                        <div className="space-y-3">
                            <Field label="Purpose of the session" required>{(id) => <Select id={id} value={form.data.topic} onChange={(x) => form.setData('topic', x.target.value)} options={PURPOSES} />}</Field>
                            <Field label="Primary focus area" required>{(id) => <Input id={id} value={form.data.meta.focus} onChange={(x) => meta('focus', x.target.value)} />}</Field>
                            <fieldset><legend className="mb-1 text-[0.8125rem] font-medium">Additional areas of interest (optional)</legend>{AREAS.map((a) => <label key={a} className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-gold-600" checked={form.data.meta.additional.includes(a)} onChange={() => meta('additional', form.data.meta.additional.includes(a) ? form.data.meta.additional.filter((x) => x !== a) : [...form.data.meta.additional, a])} />{a}</label>)}</fieldset>
                            <Field label="Brief background (optional)" hint={`${form.data.meta.background.length}/2000 characters`}>{(id) => <Textarea id={id} maxLength={2000} value={form.data.meta.background} onChange={(x) => meta('background', x.target.value)} />}</Field>
                        </div>
                    </SectionCard>
                    <SectionCard number={2} title="Select Advisor">
                        <p className="mb-2 text-xs text-ink-500">Choose an advisor with the right expertise.</p>
                        <div role="radiogroup" className="space-y-2">
                            {advisors.map((a) => (
                                <button key={a.slug} type="button" role="radio" aria-checked={form.data.meta.advisor === a.slug} onClick={() => meta('advisor', a.slug)} className={cn('flex w-full items-center gap-3 rounded border p-2 text-left', form.data.meta.advisor === a.slug ? 'border-referenced-500 bg-referenced-50' : 'border-parchment-400')}>
                                    <Avatar name={a.name} size="sm" />
                                    <span className="text-xs"><strong className="block text-sm">{a.name}</strong><span className="text-referenced-700">{a.title}</span><span className="block text-ink-500">{a.years} years advisory experience</span></span>
                                </button>
                            ))}
                        </div>
                    </SectionCard>
                    <SectionCard number={3} title="Choose Date & Time">
                        <p className="mb-2 text-xs text-ink-500">All times shown in SAST (GMT+2).</p>
                        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7 lg:grid-cols-4">
                            {days.map((d) => {
                                const dt = new Date(`${d}T00:00:00`);
                                return <button key={d} type="button" onClick={() => pickDate(d)} aria-pressed={form.data.date === d} className={cn('rounded border px-1 py-1.5 text-center text-[0.65rem]', form.data.date === d ? 'border-referenced-500 bg-referenced-500 text-white' : 'border-parchment-400 hover:border-referenced-500')}>{dt.toLocaleDateString('en-ZA', { weekday: 'short' })}<span className="block text-sm font-bold">{dt.getDate()}</span>{dt.toLocaleDateString('en-ZA', { month: 'short' })}</button>;
                            })}
                        </div>
                        {err.date && <p role="alert" className="mt-1 text-xs text-risk-500">{err.date}</p>}
                        {form.data.date && (
                            <>
                                <p className="mt-3 mb-1 text-xs font-semibold">Available times for {new Date(`${form.data.date}T00:00:00`).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <div className="grid grid-cols-4 gap-1.5">{TIMES.map((t) => <button key={t} type="button" disabled={taken.includes(t)} onClick={() => form.setData('time', t)} aria-pressed={form.data.time === t} className={cn('rounded border py-1 text-xs disabled:line-through disabled:opacity-40', form.data.time === t ? 'border-referenced-500 bg-referenced-500 text-white' : 'border-parchment-400')}>{t}</button>)}</div>
                            </>
                        )}
                        {err.time && <p role="alert" className="mt-1 text-xs text-risk-500">{err.time}</p>}
                        <p className="mt-2 flex items-center gap-1 text-xs text-ink-500"><Clock className="size-3.5" />Session duration: 60 minutes · Microsoft Teams</p>
                    </SectionCard>
                    <SectionCard number={4} title="Your Details">
                        <div className="space-y-3">
                            <Field label="Full name" error={err.name} required>{(id) => <Input id={id} value={form.data.name} onChange={(x) => form.setData('name', x.target.value)} />}</Field>
                            <Field label="Email" error={err.email} required>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(x) => form.setData('email', x.target.value)} />}</Field>
                            <Field label="Phone number" error={err.phone} required>{(id) => <Input id={id} type="tel" value={form.data.phone} onChange={(x) => form.setData('phone', x.target.value)} />}</Field>
                            <Field label="Company / Organisation (optional)">{(id) => <Input id={id} value={form.data.company} onChange={(x) => form.setData('company', x.target.value)} />}</Field>
                            <Field label="How did you hear about us? (optional)">{(id) => <Select id={id} value={form.data.heard} onChange={(x) => form.setData('heard', x.target.value)} options={['AIIM Platform', 'Referral', 'LinkedIn', 'Event']} />}</Field>
                        </div>
                    </SectionCard>
                </div>
                <div className="mt-4 flex flex-wrap justify-between gap-3">
                    <ButtonLink href="/aiim/workspace" variant="outline">Cancel</ButtonLink>
                    <Button type="submit" disabled={form.processing || !form.data.date || !form.data.time} className="!border-referenced-500 !bg-referenced-500 !text-white" trailingIcon="arrow-right">Confirm Booking</Button>
                </div>
            </form>
        </AiimPage>
    );
}
