import { Head, Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { cn } from '@/lib/cn';
import { BtnLink, Card, EventHero, StateChip, WebinarShell } from '@/Components/Webinars/kit';
import type { WebinarEvent, WebinarRegistrationInfo } from '@/types/webinars';

interface Props {
    tab: 'registrations' | 'certificates' | 'notes';
    registrations: { registration: WebinarRegistrationInfo; event: WebinarEvent }[];
    notes: { event: string | null; slug: string | null; body: string; updated: string }[];
    signedIn: boolean;
}

export default function MyRegistrations({ tab, registrations, notes, signedIn }: Props) {
    const certs = registrations.filter((r) => r.registration.certificate === 'issued');
    return (
        <WebinarShell>
            <Head title="My Webinar Registrations" />
            <EventHero crumbs={[['Home', '/'], ['Webinars', '/webinars'], ['My Registrations']]} eyebrow="My Webinars" title="My Registrations, Certificates and Notes" lead={signedIn ? 'Everything you have registered for, the certificates you have earned and the notes you have saved.' : 'Registrations made in this browser are shown below. Sign in to see every registration linked to your email address.'}>
                {!signedIn && <BtnLink href="/login">Sign In</BtnLink>}
            </EventHero>

            <div className="flex gap-1 rounded-[8px] border border-parchment-400 bg-parchment-200 p-1" role="tablist">
                {([['registrations', `Registrations (${registrations.length})`], ['certificates', `Certificates (${certs.length})`], ['notes', `My Notes (${notes.length})`]] as const).map(([k, l]) => (
                    <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => router.get('/webinars/my-registrations', k === 'registrations' ? {} : { tab: k }, { preserveScroll: true, replace: true })} className={cn('rounded-[6px] px-3.5 py-2 text-[0.8125rem] font-semibold', tab === k ? 'bg-gold-500 text-ink-900' : 'text-ink-600')}>{l}</button>
                ))}
            </div>

            {tab === 'registrations' && (
                registrations.length === 0 ? (
                    <Card><p className="text-[0.875rem] text-ink-600">No registrations yet. <Link href="/webinars?when=upcoming" className="font-semibold text-gold-700">Find an upcoming webinar</Link>.</p></Card>
                ) : (
                    <ul className="space-y-3">
                        {registrations.map(({ registration: r, event: e }) => (
                            <li key={r.id} className="flex flex-wrap items-center gap-4 rounded-[10px] border border-parchment-400 bg-white p-4">
                                <div className="w-14 text-center"><p className="text-[0.6875rem] font-bold text-ink-500">{e.month}</p><p className="text-2xl font-bold text-ink-900">{e.day}</p></div>
                                <div className="min-w-0 flex-1">
                                    <Link href={`/webinars/${e.slug}`} className="font-serif text-[1.0625rem] font-bold text-ink-900 hover:text-gold-700">{e.title}</Link>
                                    <p className="text-[0.75rem] text-ink-500">{e.timeRange} | {r.reference} | {r.participationLabel}</p>
                                </div>
                                <StateChip event={e} />
                                <div className="flex flex-wrap gap-2">
                                    {e.live && <BtnLink href={`/webinars/${e.slug}/live`} tone="danger" size="sm">Join Live</BtnLink>}
                                    {e.upcoming && <BtnLink href={`/webinars/${e.slug}/pre-event`} size="sm">Pre-Event Access</BtnLink>}
                                    {e.replayAvailable && <BtnLink href={`/webinars/${e.slug}/replay/watch`} size="sm">Watch Replay</BtnLink>}
                                    <BtnLink href={`/webinars/${e.slug}/my-registration`} tone="outline" size="sm">Details</BtnLink>
                                </div>
                            </li>
                        ))}
                    </ul>
                )
            )}

            {tab === 'certificates' && (
                certs.length === 0 ? (
                    <Card><p className="text-[0.875rem] text-ink-600">No certificates yet. Certificates are issued after CPD eligible events, or after completing a replay quiz and feedback.</p></Card>
                ) : (
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {certs.map(({ registration: r, event: e }) => (
                            <li key={r.id} className="flex items-center gap-3 rounded-[10px] border border-gold-300 bg-gold-50 p-4">
                                <L.Award className="size-9 text-gold-600" aria-hidden="true" />
                                <div className="min-w-0 flex-1"><p className="font-semibold text-ink-900">{e.title}</p><p className="text-[0.75rem] text-ink-500">{e.dateLong} | {r.reference}</p></div>
                                <a href={`/webinars/${e.slug}/certificate`} className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700"><L.Download className="size-4" aria-hidden="true" />Download</a>
                            </li>
                        ))}
                    </ul>
                )
            )}

            {tab === 'notes' && (
                notes.length === 0 ? (
                    <Card><p className="text-[0.875rem] text-ink-600">No notes yet. Add notes while you watch a replay.</p></Card>
                ) : (
                    <ul className="space-y-3">
                        {notes.map((n) => (
                            <li key={`${n.slug}-${n.updated}`} className="rounded-[10px] border border-parchment-400 bg-white p-4">
                                <div className="flex items-center justify-between gap-2"><Link href={`/webinars/${n.slug}/replay/watch`} className="font-semibold text-ink-900 hover:text-gold-700">{n.event}</Link><span className="text-[0.6875rem] text-ink-500">{n.updated}</span></div>
                                <p className="mt-1 text-[0.8125rem] whitespace-pre-line text-ink-700">{n.body}</p>
                            </li>
                        ))}
                    </ul>
                )
            )}
        </WebinarShell>
    );
}

MyRegistrations.layout = null;
