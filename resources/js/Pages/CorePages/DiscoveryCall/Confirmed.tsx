import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, CircleCheck, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BOOK_STEPS, ClientShell, FileChip, HelpCards, ManagerCard, SummaryPanel } from '@/Components/CorePages/DiscoveryParts';
import { JourneySteps, NumberedList } from '@/Components/CorePages/Kit';
import { Modal, StatusPill } from '@/Components/ui/Kit';
import { Textarea } from '@/Components/ui/Form';
import type { SharedProps } from '@/types';
import type { DiscoveryShared, Meeting } from '@/types/core-pages';

interface Props extends DiscoveryShared {
    booking: Meeting;
    canManage: boolean;
}

export default function Confirmed({ booking, canManage }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const [copied, setCopied] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [reason, setReason] = useState('');
    const cancelled = booking.status === 'cancelled';

    const start = new Date(`${booking.date}T${booking.time}:00+02:00`);
    const end = new Date(start.getTime() + 30 * 60000);
    const g = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const details = `Booking ${booking.reference}. ${booking.meeting_link ?? 'Your Relationship Manager will call you.'}`;
    const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`TBCA ${booking.title}`)}&dates=${g(start)}/${g(end)}&details=${encodeURIComponent(details)}`;
    const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(`TBCA ${booking.title}`)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent(details)}`;
    const ics = `/discovery-call/meetings/${booking.reference}/calendar.ics`;

    const rows: [string, React.ReactNode][] = [
        ['Booking ID', booking.reference], ['Meeting', booking.title], ['Purpose', booking.purpose], ['Related Engagement', booking.engagement], ['Date', booking.date_label],
        ['Time', booking.time], ['Timezone', booking.timezone], ['Meeting Format', booking.format], ['Relationship Manager', booking.manager.name], ['Status', <StatusPill key="s" status={booking.status} />],
    ];

    return (
        <ClientShell
            title={cancelled ? 'Booking Cancelled' : 'Booking Confirmed'}
            description={cancelled ? 'This meeting has been cancelled and the time slot released.' : 'Your Discovery Call has been successfully scheduled. A confirmation has been sent through your approved notification channels.'}
            crumbs={[{ label: 'Client Portal', href: auth.user ? '/portal' : '/' }, { label: 'Meetings', href: auth.user ? '/discovery-call/meetings' : undefined }, { label: 'Book a Discovery Call', href: '/discovery-call' }, { label: 'Booking Confirmed' }]}
            actions={auth.user ? <Link href="/discovery-call/meetings" className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-parchment-500 bg-white px-3 text-[0.8125rem]"><ArrowLeft className="size-4" aria-hidden="true" />Back to Meetings</Link> : undefined}
        >
            <Head title="Booking Confirmed" />
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-8">
                    <JourneySteps steps={BOOK_STEPS} current={4} />
                    {!cancelled && (
                        <div className="flex items-center gap-4 rounded-[8px] border border-verified-500/40 bg-verified-50 p-4">
                            <CircleCheck className="size-10 shrink-0 fill-verified-500 text-white" aria-hidden="true" />
                            <div>
                                <p className="text-[1.0625rem] font-bold text-ink-900">Your {booking.title} is {booking.status === 'rescheduled' ? 'Rescheduled' : 'Confirmed'}</p>
                                <p className="text-[0.8125rem] text-ink-600">We look forward to speaking with you.</p>
                            </div>
                        </div>
                    )}
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <dl className="grid gap-x-6 text-[0.8125rem] sm:grid-cols-2">
                            {rows.map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-3 border-b border-parchment-300 py-2">
                                    <dt className="text-ink-500">{k}:</dt>
                                    <dd className="text-right font-medium text-ink-900">{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-[0.9375rem] font-bold text-ink-900">Meeting Access & Files</h2>
                        <div className="mt-3 grid gap-3 text-[0.8125rem] sm:grid-cols-[10rem_1fr]">
                            <span className="text-ink-500">{booking.channel === 'phone' ? 'Call Number:' : 'Secure Meeting Link:'}</span>
                            {booking.meeting_link ? (
                                <span className="flex items-center justify-between gap-2 rounded-[4px] border border-parchment-400 bg-parchment-100 px-3 py-2">
                                    <span className="truncate">{booking.meeting_link}</span>
                                    <button type="button" onClick={() => { void navigator.clipboard?.writeText(booking.meeting_link ?? ''); setCopied(true); }} className="inline-flex shrink-0 items-center gap-1 text-[0.75rem] font-semibold">
                                        <Copy className="size-3.5" aria-hidden="true" />{copied ? 'Copied' : 'Copy Link'}
                                    </button>
                                </span>
                            ) : (
                                <span>{booking.phone ?? 'Your Relationship Manager will call you.'}</span>
                            )}
                            <span className="text-ink-500">Attached File:</span>
                            <span className="flex flex-wrap gap-2">{booking.files.length ? booking.files.map((f) => <FileChip key={f.path} name={f.name} size={f.size} />) : 'None'}</span>
                        </div>
                        <p className="mt-3 text-[0.75rem] text-ink-500">Please join the meeting 5 minutes before the scheduled time.</p>
                    </section>
                    <div className="grid gap-4 md:grid-cols-2">
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="mb-3 text-[0.9375rem] font-bold text-ink-900">What Happens Next?</h2>
                            <NumberedList items={['Your booking is now listed under Meetings in your Client Portal.', 'A confirmation email and calendar invite have been sent.', 'WhatsApp confirmation will be sent where consented.', 'Your Relationship Manager will prepare for your Discovery Call.']} />
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="mb-2 text-[0.9375rem] font-bold text-ink-900">Client Contact for this Booking</h2>
                            <dl className="space-y-1.5 text-[0.8125rem]">
                                {[['Full Name', booking.name], ['Company', booking.company], ['Email', booking.email], ['Phone', booking.phone], ['Preferred Contact Method', booking.contact_method]].map(([k, v]) => (
                                    <div key={k} className="grid grid-cols-[10rem_1fr] gap-2"><dt className="text-ink-500">{k}:</dt><dd className="text-ink-900">{v || '—'}</dd></div>
                                ))}
                            </dl>
                        </section>
                    </div>
                </div>

                <aside className="space-y-4 xl:col-span-4">
                    <ManagerCard manager={booking.manager} status={cancelled ? 'Booking cancelled' : 'Booking confirmed'} />
                    <SummaryPanel title="Confirmed Booking Summary" rows={rows.slice(1).concat([['Booking ID', booking.reference]])} />
                    {!cancelled && (
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-[0.875rem] font-bold text-ink-900">Add to Your Calendar</h2>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-[0.75rem] font-semibold">
                                <a href={google} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-1 rounded-[4px] border border-parchment-500 hover:border-gold-500"><CalendarDays className="size-3.5" aria-hidden="true" />Google</a>
                                <a href={outlook} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-1 rounded-[4px] border border-parchment-500 hover:border-gold-500"><CalendarDays className="size-3.5" aria-hidden="true" />Outlook</a>
                                <a href={ics} className="flex h-10 items-center justify-center gap-1 rounded-[4px] border border-parchment-500 hover:border-gold-500"><CalendarDays className="size-3.5" aria-hidden="true" />Apple</a>
                            </div>
                        </section>
                    )}
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-[0.875rem] font-bold text-ink-900">Manage Booking</h2>
                        {auth.user ? (
                            <Link href="/discovery-call/meetings" className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900"><CalendarDays className="size-4" aria-hidden="true" />View My Meetings</Link>
                        ) : (
                            <Link href="/login" className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900">Sign in to manage meetings</Link>
                        )}
                        {canManage && booking.can_change && (
                            <>
                                <Link href={`/discovery-call/meetings/${booking.reference}/reschedule`} className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-[4px] border border-gold-500 text-sm font-semibold text-gold-700">Reschedule Booking</Link>
                                <button type="button" onClick={() => setCancelOpen(true)} className="mt-2 inline-flex h-10 w-full items-center justify-center gap-1.5 text-sm font-semibold text-risk-500"><Trash2 className="size-4" aria-hidden="true" />Cancel Booking</button>
                            </>
                        )}
                        <p className="mt-2 text-[0.75rem] text-ink-500">Need to make changes? You can reschedule or cancel up to 24 hours before the meeting, subject to portal rules.</p>
                    </section>
                    <HelpCards />
                </aside>
            </div>

            <Modal
                open={cancelOpen}
                onClose={() => setCancelOpen(false)}
                title="Cancel this booking?"
                footer={
                    <>
                        <button type="button" onClick={() => setCancelOpen(false)} className="h-9 rounded-[4px] border border-parchment-500 px-3 text-sm">Keep booking</button>
                        <button type="button" onClick={() => router.post(`/discovery-call/meetings/${booking.reference}/cancel`, { reason })} className="h-9 rounded-[4px] bg-risk-500 px-3 text-sm font-semibold text-white">Cancel booking</button>
                    </>
                }
            >
                <label htmlFor="cancel-reason" className="text-sm text-ink-700">Reason (optional)</label>
                <Textarea id="cancel-reason" value={reason} onChange={(e) => setReason(e.target.value)} />
            </Modal>
        </ClientShell>
    );
}

Confirmed.layout = null;
