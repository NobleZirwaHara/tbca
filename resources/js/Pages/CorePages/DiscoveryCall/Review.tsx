import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarCheck, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { BOOK_STEPS, ClientShell, FileChip, HelpCards, ManagerCard, SummaryPanel } from '@/Components/CorePages/DiscoveryParts';
import { JourneySteps, NumberedList } from '@/Components/CorePages/Kit';
import { Checkbox } from '@/Components/ui/Form';
import type { SharedProps } from '@/types';
import type { DiscoveryShared, UploadedFile } from '@/types/core-pages';

interface Props extends DiscoveryShared {
    draft: {
        purpose: string; purpose_title: string; engagement: string; notes: string | null; channel: string; date: string; date_label: string; weekday: string;
        time: string; timezone: string; timezone_label: string; name: string; email: string; phone: string | null; company: string | null; contact_method: string; files: UploadedFile[];
    };
}

const CHECKS = [
    'I have reviewed the meeting purpose and related engagement.',
    'I confirm the selected date, time and timezone are correct.',
    'I understand that a secure meeting link will be sent after confirmation.',
    'I consent to receive booking notifications through approved channels.',
];

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <div className="mb-2 flex items-center justify-between"><h2 className="text-[0.9375rem] font-bold text-ink-900">{title}</h2>{action}</div>
            {children}
        </section>
    );
}

function Rows({ rows }: { rows: [string, React.ReactNode][] }) {
    return (
        <dl className="divide-y divide-parchment-300 text-[0.8125rem]">
            {rows.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-2 sm:grid-cols-[12rem_1fr]">
                    <dt className="font-medium text-ink-500">{k}:</dt>
                    <dd className="text-ink-900">{v || '—'}</dd>
                </div>
            ))}
        </dl>
    );
}

export default function Review({ manager, draft }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const form = useForm({ checks: [false, false, false, false] });
    const all = form.data.checks.every(Boolean);
    const format = draft.channel === 'phone' ? 'Phone Call' : 'Online Video Call';
    const edit = <Link href="/discovery-call" className="text-[0.8125rem] font-semibold text-gold-700">Edit</Link>;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/discovery-call/confirm', { preserveScroll: true });
    };

    return (
        <ClientShell
            title="Review & Confirm Booking"
            description="Please review your Discovery Call details before final confirmation."
            crumbs={[{ label: 'Client Portal', href: auth.user ? '/portal' : '/' }, { label: 'Meetings', href: auth.user ? '/discovery-call/meetings' : undefined }, { label: 'Book a Discovery Call', href: '/discovery-call' }, { label: 'Review & Confirm Booking' }]}
            actions={<Link href="/discovery-call" className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-parchment-500 bg-white px-3 text-[0.8125rem]"><ArrowLeft className="size-4" aria-hidden="true" />Back to Date & Time</Link>}
        >
            <Head title="Review & Confirm Booking" />
            <form onSubmit={submit} className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-8">
                    <JourneySteps steps={BOOK_STEPS} current={3} />
                    <Panel title="Review Your Meeting Details" action={edit}>
                        <Rows
                            rows={[
                                ['Meeting Type', 'Discovery Call'],
                                ['Purpose', draft.purpose_title],
                                ['Related Engagement', draft.engagement],
                                ['Discussion Notes', draft.notes],
                                ['Attached Files', draft.files.length ? <span className="flex flex-wrap gap-2">{draft.files.map((f) => <FileChip key={f.path} name={f.name} size={f.size} />)}</span> : 'None'],
                                ['Meeting Format', format],
                                ['Relationship Manager', `${manager.name}, ${manager.title}`],
                            ]}
                        />
                    </Panel>
                    <Panel title="Date, Time & Notifications" action={<Link href="/discovery-call" className="text-[0.8125rem] font-semibold text-gold-700">Change</Link>}>
                        <Rows
                            rows={[
                                ['Date', `${draft.date_label} (${draft.weekday})`],
                                ['Time', `${draft.time} SAST`],
                                ['Timezone', draft.timezone_label],
                                ['Notification Channels', 'Portal notification, Email confirmation, Calendar invite, WhatsApp (where consented)'],
                                [draft.channel === 'phone' ? 'Call Number' : 'Meeting Link', draft.channel === 'phone' ? draft.phone : 'Secure video meeting link will be issued after confirmation.'],
                            ]}
                        />
                    </Panel>
                    <Panel title="Client Contact for this Booking" action={edit}>
                        <Rows rows={[['Full Name', draft.name], ['Company', draft.company], ['Email', draft.email], ['Phone', draft.phone], ['Preferred Contact Method', draft.contact_method]]} />
                        <p className="mt-2 text-[0.75rem] text-ink-500">To update your contact details, go to <Link href="/discovery-call" className="font-semibold text-gold-700">Profile Settings</Link>.</p>
                    </Panel>
                </div>

                <aside className="space-y-4 xl:col-span-4">
                    <ManagerCard manager={manager} />
                    <SummaryPanel
                        rows={[
                            ['Meeting', 'Discovery Call'], ['Related Engagement', draft.engagement], ['Relationship Manager', manager.name], ['Meeting Format', format],
                            ['Date', draft.date_label], ['Time', draft.time], ['Timezone', draft.timezone_label], ['Attached File', `${draft.files.length} file${draft.files.length === 1 ? '' : 's'}`],
                        ]}
                    />
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-[0.875rem] font-bold text-ink-900">Confirmation Checklist</h2>
                        <div className="mt-2 space-y-2">
                            {CHECKS.map((c, i) => (
                                <Checkbox key={c} label={c} checked={form.data.checks[i]} onChange={(e) => form.setData('checks', form.data.checks.map((v, j) => (j === i ? e.target.checked : v)))} className="text-[0.8125rem]" />
                            ))}
                        </div>
                        {(form.errors.checks || Object.keys(form.errors).some((k) => k.startsWith('checks.'))) && <p role="alert" className="mt-1 text-xs text-risk-500">Please confirm all four checklist items.</p>}
                        {(form.errors as Record<string, string>).time && <p role="alert" className="mt-1 text-xs text-risk-500">{(form.errors as Record<string, string>).time} <Link href="/discovery-call" className="underline">Choose another time</Link></p>}
                        <h3 className="mt-4 text-[0.8125rem] font-bold text-ink-900">What Happens After Confirmation?</h3>
                        <NumberedList className="mt-2" items={['Your booking is saved under Meetings in your Client Portal.', 'A confirmation message and calendar invite are sent.', 'Your Relationship Manager prepares for the Discovery Call.']} />
                        <button type="submit" disabled={!all || form.processing} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 disabled:opacity-50">
                            <CalendarCheck className="size-4" aria-hidden="true" /> {form.processing ? 'Confirming…' : 'Confirm Booking'}
                        </button>
                        <Link href={auth.user ? '/portal' : '/'} className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-[4px] border border-gold-500 text-sm font-semibold text-gold-700">Cancel and Return to Dashboard</Link>
                        <p className="mt-2 text-center text-[0.75rem] text-ink-500">Need to change something? <Link href="/discovery-call" className="font-semibold text-gold-700">Edit booking details.</Link></p>
                        <p className="mt-2 flex items-center justify-center gap-1.5 text-[0.6875rem] text-ink-500"><ShieldCheck className="size-3.5" aria-hidden="true" />Your booking information is handled through the secure TBCA Client Portal.</p>
                    </section>
                    <HelpCards />
                </aside>
            </form>
        </ClientShell>
    );
}

Review.layout = null;
