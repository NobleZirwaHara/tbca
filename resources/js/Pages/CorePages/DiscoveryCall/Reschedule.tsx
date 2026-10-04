import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEvent } from 'react';
import { ClientShell, ManagerCard, SlotPicker, SummaryPanel } from '@/Components/CorePages/DiscoveryParts';
import { Note } from '@/Components/CorePages/Kit';
import { Field, Textarea } from '@/Components/ui/Form';
import type { DiscoveryShared, Meeting } from '@/types/core-pages';

interface Props extends DiscoveryShared {
    booking: Meeting;
    today: string;
}

export default function Reschedule({ booking, slots, today }: Props) {
    const form = useForm({ date: '', time: '', reason: '' });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.patch(`/discovery-call/meetings/${booking.reference}/reschedule`, { preserveScroll: true });
    };

    return (
        <ClientShell
            title="Reschedule Booking"
            description="Choose a new date and time. Changes are allowed up to 24 hours before the meeting."
            crumbs={[{ label: 'Client Portal', href: '/portal' }, { label: 'Meetings', href: '/discovery-call/meetings' }, { label: 'Reschedule' }]}
            actions={<Link href="/discovery-call/meetings" className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-parchment-500 bg-white px-3 text-[0.8125rem]"><ArrowLeft className="size-4" aria-hidden="true" />Back to Meetings</Link>}
        >
            <Head title="Reschedule Booking" />
            <form onSubmit={submit} className="grid gap-5 xl:grid-cols-12">
                <section className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-7">
                    <Note tone="info" className="mb-4">Currently scheduled for <strong>{booking.date_label} at {booking.time}</strong> ({booking.timezone}).</Note>
                    <SlotPicker today={today} date={form.data.date} time={form.data.time} slots={slots} onDate={(d) => form.setData('date', d)} onTime={(t) => form.setData('time', t)} ignoreTime={{ date: booking.date, time: booking.time }} />
                    {(form.errors.date || form.errors.time) && <p role="alert" className="mt-2 text-xs text-risk-500">{form.errors.date ?? form.errors.time}</p>}
                    <Field label="Reason for rescheduling (optional)" className="mt-4">{(id) => <Textarea id={id} maxLength={300} value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)} />}</Field>
                    <button type="submit" disabled={!form.data.date || !form.data.time || form.processing} className="mt-4 inline-flex h-11 items-center justify-center rounded-[4px] bg-gold-500 px-6 text-sm font-semibold text-ink-900 disabled:opacity-50">
                        {form.processing ? 'Saving…' : 'Confirm New Time'}
                    </button>
                </section>
                <aside className="space-y-4 xl:col-span-5">
                    <ManagerCard manager={booking.manager} />
                    <SummaryPanel rows={[['Booking ID', booking.reference], ['Meeting', booking.title], ['Related Engagement', booking.engagement], ['Current Date', booking.date_label], ['Current Time', booking.time], ['New Date', form.data.date], ['New Time', form.data.time]]} />
                </aside>
            </form>
        </ClientShell>
    );
}

Reschedule.layout = null;
