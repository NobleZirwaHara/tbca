import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CalendarCheck, CalendarClock, CalendarDays, CheckCircle2, Eye, FileText, List, PlusCircle, RefreshCw, Search, Trash2, Video } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ClientShell, HelpCards, ManagerCard } from '@/Components/CorePages/DiscoveryParts';
import { Avatar } from '@/Components/CorePages/Kit';
import { Modal, StatusPill } from '@/Components/ui/Kit';
import { Textarea } from '@/Components/ui/Form';
import { cn } from '@/lib/cn';
import type { Manager, Meeting } from '@/types/core-pages';

interface Props {
    upcoming: Meeting[];
    past: Meeting[];
    next: Meeting | null;
    snapshot: { upcoming: number; completed_month: number; rescheduled: number; pending: number };
    filters: { q: string; status: string; view: string };
    manager: Manager;
}

export default function Meetings({ upcoming, past, next, snapshot, filters, manager }: Props) {
    const [q, setQ] = useState(filters.q);
    const [cancelling, setCancelling] = useState<Meeting | null>(null);
    const [reason, setReason] = useState('');
    const [summary, setSummary] = useState<Meeting | null>(null);
    const apply = (n: Partial<Props['filters']>) => router.get('/discovery-call/meetings', { ...filters, ...n }, { preserveState: true, preserveScroll: true, replace: true });
    const search = (e: FormEvent) => {
        e.preventDefault();
        apply({ q });
    };

    const byDate = upcoming.reduce<Record<string, Meeting[]>>((acc, m) => ({ ...acc, [m.date_label]: [...(acc[m.date_label] ?? []), m] }), {});

    return (
        <ClientShell
            title="My Meetings"
            description="View, manage and track all your scheduled TBCA meetings."
            crumbs={[{ label: 'Client Portal', href: '/portal' }, { label: 'Meetings' }, { label: 'My Meetings' }]}
            actions={<Link href="/portal" className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-parchment-500 bg-white px-3 text-[0.8125rem]"><ArrowLeft className="size-4" aria-hidden="true" />Back to Dashboard</Link>}
        >
            <Head title="My Meetings" />
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-9">
                    <div className="flex flex-wrap items-center gap-2 rounded-[8px] border border-parchment-400 bg-white p-3">
                        <form onSubmit={search} className="relative min-w-[12rem] flex-1">
                            <label htmlFor="meeting-search" className="sr-only">Search meetings or topics</label>
                            <Search className="absolute top-2.5 left-2.5 size-4 text-ink-400" aria-hidden="true" />
                            <input id="meeting-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search meetings or topics..." className="h-9 w-full rounded-[4px] border border-parchment-500 pr-2 pl-8 text-[0.8125rem]" />
                        </form>
                        <label htmlFor="status-filter" className="sr-only">Status</label>
                        <select id="status-filter" value={filters.status} onChange={(e) => apply({ status: e.target.value })} className="h-9 rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem]">
                            <option value="">All Status</option>
                            {['confirmed', 'upcoming', 'pending', 'rescheduled', 'cancelled', 'completed'].map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
                        <div className="flex rounded-[4px] border border-parchment-500">
                            <button type="button" onClick={() => apply({ view: 'list' })} aria-pressed={filters.view === 'list'} className={cn('inline-flex h-9 items-center gap-1 px-3 text-[0.8125rem]', filters.view === 'list' && 'bg-gold-50 font-semibold text-gold-800')}><List className="size-4" aria-hidden="true" />List View</button>
                            <button type="button" onClick={() => apply({ view: 'calendar' })} aria-pressed={filters.view === 'calendar'} className={cn('inline-flex h-9 items-center gap-1 px-3 text-[0.8125rem]', filters.view === 'calendar' && 'bg-gold-50 font-semibold text-gold-800')}><CalendarDays className="size-4" aria-hidden="true" />Calendar View</button>
                        </div>
                        <Link href="/discovery-call" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] bg-gold-500 px-3 text-[0.8125rem] font-semibold text-ink-900"><PlusCircle className="size-4" aria-hidden="true" />Book New Meeting</Link>
                    </div>

                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[0.9375rem] font-bold text-ink-900">Upcoming Meetings</h2>
                            <span className="text-[0.75rem] font-semibold text-verified-700">{upcoming.length} Upcoming</span>
                        </div>
                        {filters.view === 'calendar' ? (
                            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {Object.entries(byDate).map(([d, ms]) => (
                                    <div key={d} className="rounded-[6px] border border-parchment-400 p-3">
                                        <p className="text-[0.8125rem] font-bold text-ink-900">{d}</p>
                                        <ul className="mt-2 space-y-1.5">
                                            {ms.map((m) => (
                                                <li key={m.reference} className="flex items-center justify-between gap-2 text-[0.75rem]">
                                                    <Link href={`/discovery-call/confirmed/${m.reference}`} className="font-medium hover:text-gold-700">{m.time} · {m.title}</Link>
                                                    <StatusPill status={m.status} />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                                {upcoming.length === 0 && <p className="text-sm text-ink-400">No upcoming meetings.</p>}
                            </div>
                        ) : (
                            <div className="mt-3 overflow-x-auto">
                                <table className="w-full min-w-[900px] text-left text-[0.8125rem]">
                                    <thead className="text-[0.6875rem] font-semibold text-ink-500 uppercase">
                                        <tr>{['Meeting', 'Related Engagement', 'Relationship Manager', 'Date', 'Time', 'Timezone', 'Format', 'Status', 'Actions'].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr>
                                    </thead>
                                    <tbody className="divide-y divide-parchment-300">
                                        {upcoming.length === 0 && <tr><td colSpan={9} className="py-6 text-center text-ink-400">No upcoming meetings. <Link href="/discovery-call" className="font-semibold text-gold-700">Book a Discovery Call</Link></td></tr>}
                                        {upcoming.map((m) => (
                                            <tr key={m.reference} className={cn(m.is_new && 'bg-verified-50')}>
                                                <td className="px-2 py-2.5">
                                                    {m.is_new && <span className="mr-1 rounded-[3px] border border-verified-500/40 px-1 text-[0.625rem] text-verified-700">New</span>}
                                                    <span className="font-semibold text-ink-900">{m.title}</span>
                                                    <span className="block text-[0.6875rem] text-ink-500">{m.subtitle}</span>
                                                </td>
                                                <td className="px-2 py-2.5">{m.engagement}</td>
                                                <td className="px-2 py-2.5"><span className="flex items-center gap-2"><Avatar initials={m.manager.initials} size="sm" /><span><span className="block font-medium">{m.manager.name}</span><span className="block text-[0.6875rem] text-ink-500">{m.manager.title}</span></span></span></td>
                                                <td className="px-2 py-2.5 whitespace-nowrap">{m.date_label}<span className="block text-[0.6875rem] text-ink-500">{m.weekday}</span></td>
                                                <td className="px-2 py-2.5">{m.time}</td>
                                                <td className="px-2 py-2.5 text-[0.75rem]">{m.timezone}</td>
                                                <td className="px-2 py-2.5 text-[0.75rem]"><span className="inline-flex items-center gap-1"><Video className="size-3.5" aria-hidden="true" />{m.format}</span></td>
                                                <td className="px-2 py-2.5"><StatusPill status={m.status} /></td>
                                                <td className="px-2 py-2.5">
                                                    <span className="flex gap-2 text-[0.6875rem]">
                                                        <Link href={`/discovery-call/confirmed/${m.reference}`} className="flex flex-col items-center hover:text-gold-700"><Eye className="size-4" aria-hidden="true" />View</Link>
                                                        {m.meeting_link && <a href={m.meeting_link} target="_blank" rel="noreferrer" className="flex flex-col items-center hover:text-gold-700"><Video className="size-4" aria-hidden="true" />Join</a>}
                                                        {m.can_change && (
                                                            <>
                                                                <Link href={`/discovery-call/meetings/${m.reference}/reschedule`} className="flex flex-col items-center hover:text-gold-700"><CalendarClock className="size-4" aria-hidden="true" />Reschedule</Link>
                                                                <button type="button" onClick={() => setCancelling(m)} className="flex flex-col items-center text-risk-500"><Trash2 className="size-4" aria-hidden="true" />Cancel</button>
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[0.9375rem] font-bold text-ink-900">Past Meetings</h2>
                            <span className="text-[0.75rem] font-semibold text-verified-700">{past.length} Completed</span>
                        </div>
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-[0.8125rem]">
                                <thead className="text-[0.6875rem] font-semibold text-ink-500 uppercase">
                                    <tr>{['Meeting', 'Related Engagement', 'Relationship Manager', 'Date', 'Time', 'Format', 'Outcome', 'Actions'].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {past.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-ink-400">No past meetings yet.</td></tr>}
                                    {past.map((m) => (
                                        <tr key={m.reference}>
                                            <td className="px-2 py-2.5"><span className="font-semibold text-ink-900">{m.title}</span><span className="block text-[0.6875rem] text-ink-500">{m.subtitle}</span></td>
                                            <td className="px-2 py-2.5">{m.engagement}</td>
                                            <td className="px-2 py-2.5"><span className="flex items-center gap-2"><Avatar initials={m.manager.initials} size="sm" />{m.manager.name}</span></td>
                                            <td className="px-2 py-2.5 whitespace-nowrap">{m.date_label}<span className="block text-[0.6875rem] text-ink-500">{m.weekday}</span></td>
                                            <td className="px-2 py-2.5">{m.time}</td>
                                            <td className="px-2 py-2.5 text-[0.75rem]">{m.format}</td>
                                            <td className="px-2 py-2.5"><StatusPill status={m.outcome ?? 'completed'} /></td>
                                            <td className="px-2 py-2.5"><button type="button" onClick={() => setSummary(m)} className="inline-flex items-center gap-1 text-[0.75rem] hover:text-gold-700"><FileText className="size-3.5" aria-hidden="true" />View Summary</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <aside className="space-y-4 xl:col-span-3">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-[0.875rem] font-bold text-ink-900">Meeting Snapshot</h2>
                        <ul className="mt-2 divide-y divide-parchment-300 text-[0.8125rem]">
                            {[[CalendarCheck, 'Upcoming Meetings', snapshot.upcoming, 'upcoming'], [CheckCircle2, 'Completed This Month', snapshot.completed_month, 'completed'], [RefreshCw, 'Rescheduled', snapshot.rescheduled, 'rescheduled'], [CalendarClock, 'Pending Confirmations', snapshot.pending, 'pending']].map(([I, l, v, s]) => {
                                const Ico = I as typeof CalendarCheck;
                                return (
                                    <li key={l as string}>
                                        <button type="button" onClick={() => apply({ status: s === 'upcoming' ? '' : (s as string) })} className="flex w-full items-center justify-between py-2 hover:text-gold-700">
                                            <span className="inline-flex items-center gap-2"><Ico className="size-4 text-gold-600" aria-hidden="true" />{l as string}</span>
                                            <strong>{v as number}</strong>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                        <button type="button" onClick={() => apply({ view: 'calendar' })} className="mt-2 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-gold-700">View Full Calendar <ArrowRight className="size-3.5" aria-hidden="true" /></button>
                    </section>
                    <ManagerCard manager={manager} status="Online" />
                    {next && (
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-[0.875rem] font-bold text-ink-900">Next Meeting</h2>
                            <div className="mt-3 flex gap-3">
                                <div className="flex w-14 shrink-0 flex-col items-center rounded-[6px] border border-parchment-400 py-1.5">
                                    <span className="text-[0.625rem] font-semibold uppercase">{new Date(`${next.date}T00:00:00`).toLocaleString('en-GB', { month: 'short' })}</span>
                                    <span className="text-xl font-bold">{new Date(`${next.date}T00:00:00`).getDate()}</span>
                                </div>
                                <div className="text-[0.75rem]">
                                    <p className="text-[0.875rem] font-semibold text-ink-900">{next.title}</p>
                                    <p className="text-ink-500">{next.subtitle}</p>
                                    <p>{next.weekday.slice(0, 3)}, {next.date_label} • {next.time}</p>
                                    <p>{next.format}</p>
                                </div>
                            </div>
                            <Link href={`/discovery-call/confirmed/${next.reference}`} className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-[4px] border border-gold-500 text-[0.8125rem] font-semibold text-gold-700">View Details</Link>
                        </section>
                    )}
                    <HelpCards />
                </aside>
            </div>

            <Modal
                open={cancelling !== null}
                onClose={() => setCancelling(null)}
                title={`Cancel ${cancelling?.title ?? 'meeting'}?`}
                footer={
                    <>
                        <button type="button" onClick={() => setCancelling(null)} className="h-9 rounded-[4px] border border-parchment-500 px-3 text-sm">Keep meeting</button>
                        <button type="button" onClick={() => cancelling && router.post(`/discovery-call/meetings/${cancelling.reference}/cancel`, { reason }, { onSuccess: () => setCancelling(null) })} className="h-9 rounded-[4px] bg-risk-500 px-3 text-sm font-semibold text-white">Cancel meeting</button>
                    </>
                }
            >
                <p className="mb-2 text-sm text-ink-600">{cancelling?.date_label} at {cancelling?.time}. The slot will be released for other clients.</p>
                <label htmlFor="cancel-why" className="text-sm text-ink-700">Reason (optional)</label>
                <Textarea id="cancel-why" value={reason} onChange={(e) => setReason(e.target.value)} />
            </Modal>

            <Modal open={summary !== null} onClose={() => setSummary(null)} title={`${summary?.title ?? ''} — Summary`}>
                <p className="text-sm text-ink-500">{summary?.date_label} · {summary?.manager.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">{summary?.summary ?? 'Meeting completed. Notes and agreed actions have been shared in your Client Portal documents.'}</p>
            </Modal>
        </ClientShell>
    );
}

Meetings.layout = null;
