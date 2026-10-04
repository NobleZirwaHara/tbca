import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Info, Paperclip, ShieldCheck, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { BOOK_STEPS, ClientShell, FileChip, HelpCards, ManagerCard, SlotPicker, SummaryPanel } from '@/Components/CorePages/DiscoveryParts';
import { JourneySteps, NumberedList, OptionCard } from '@/Components/CorePages/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import type { SharedProps } from '@/types';
import type { DiscoveryShared, UploadedFile } from '@/types/core-pages';

interface Props extends DiscoveryShared {
    draft: {
        purpose: string; engagement: string; notes: string; channel: string; date: string; time: string; timezone: string;
        name: string; email: string; phone: string; company: string; contact_method: string; files: UploadedFile[];
    };
    today: string;
}

export default function Book({ purposes, engagements, timezones, slots, manager, draft, today }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const form = useForm({
        ...draft,
        files: [] as File[],
        keep_files: draft.files.map((f) => f.path),
    });
    const kept = draft.files.filter((f) => form.data.keep_files.includes(f.path));
    const total = kept.length + form.data.files.length;
    const ready = Boolean(form.data.purpose && form.data.date && form.data.time && form.data.name && form.data.email);
    const purposeTitle = purposes.find((p) => p.key === form.data.purpose)?.title;
    const tz = timezones.find((t) => t.key === form.data.timezone);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/discovery-call', { forceFormData: true, preserveScroll: true });
    };

    return (
        <ClientShell
            title="Book a Discovery Call"
            description="Schedule a confidential conversation with your TBCA Relationship Manager. Choose what you would like to discuss, then select an available date and time."
            crumbs={[{ label: 'Client Portal', href: auth.user ? '/portal' : '/' }, { label: 'Meetings', href: auth.user ? '/discovery-call/meetings' : undefined }, { label: 'Book a Discovery Call' }]}
            actions={auth.user ? <Link href="/portal" className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-parchment-500 bg-white px-3 text-[0.8125rem]"><ArrowLeft className="size-4" aria-hidden="true" />Back to Dashboard</Link> : undefined}
        >
            <Head title="Book a Discovery Call" />
            <form onSubmit={submit} noValidate className="grid gap-5 xl:grid-cols-12">
                <div className="xl:col-span-8">
                    <JourneySteps steps={BOOK_STEPS} current={form.data.date && form.data.time ? 2 : 1} className="mb-5" />
                    <div className="grid gap-5 lg:grid-cols-12">
                        <section className="space-y-4 rounded-[8px] border border-parchment-400 bg-white p-4 lg:col-span-7">
                            <div>
                                <h2 className="text-[0.9375rem] font-bold text-ink-900">What would you like to discuss?</h2>
                                <p className="text-[0.75rem] text-ink-500">Select the reason for your Discovery Call so that your Relationship Manager can prepare.</p>
                                <div role="radiogroup" aria-label="Discussion purpose" className="mt-3 grid gap-2.5 sm:grid-cols-2">
                                    {purposes.map((p) => (
                                        <OptionCard key={p.key} selected={form.data.purpose === p.key} onSelect={() => form.setData('purpose', p.key)} title={p.title} body={p.body} icon={p.icon} />
                                    ))}
                                </div>
                                {form.errors.purpose && <p className="mt-1 text-xs text-risk-500">{form.errors.purpose}</p>}
                            </div>
                            <Field label="Related Sprint, Project or Case" error={form.errors.engagement}>
                                {(id) => <Select id={id} options={engagements} value={form.data.engagement} onChange={(e) => form.setData('engagement', e.target.value)} />}
                            </Field>
                            <Field label="What would you like us to prepare for?" error={form.errors.notes} hint={`${form.data.notes.length} / 500`}>
                                {(id) => <Textarea id={id} maxLength={500} placeholder="Briefly describe the questions, decisions or challenges you would like to discuss." value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />}
                            </Field>
                            <div>
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-[4px] border border-parchment-500 px-3 py-1.5 text-[0.8125rem] hover:border-gold-500">
                                    <Paperclip className="size-4" aria-hidden="true" /> Add files
                                    <input
                                        type="file"
                                        multiple
                                        className="sr-only"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                                        onChange={(e) => form.setData('files', [...form.data.files, ...Array.from(e.target.files ?? [])].slice(0, Math.max(0, 3 - kept.length)))}
                                    />
                                </label>
                                <span className="ml-2 text-[0.6875rem] text-ink-400">Up to 3 files, 10 MB each</span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {kept.map((f) => (
                                        <span key={f.path} className="inline-flex items-center gap-1">
                                            <FileChip name={f.name} size={f.size} />
                                            <button type="button" aria-label={`Remove ${f.name}`} onClick={() => form.setData('keep_files', form.data.keep_files.filter((p) => p !== f.path))}><X className="size-3.5" /></button>
                                        </span>
                                    ))}
                                    {form.data.files.map((f, i) => (
                                        <span key={`${f.name}${i}`} className="inline-flex items-center gap-1">
                                            <FileChip name={f.name} size={f.size} />
                                            <button type="button" aria-label={`Remove ${f.name}`} onClick={() => form.setData('files', form.data.files.filter((_, j) => j !== i))}><X className="size-3.5" /></button>
                                        </span>
                                    ))}
                                </div>
                                {Object.entries(form.errors).filter(([k]) => k.startsWith('files')).map(([k, v]) => <p key={k} className="text-xs text-risk-500">{v}</p>)}
                                <p className="mt-2 flex items-center gap-1.5 text-[0.6875rem] text-ink-500"><Info className="size-3.5" aria-hidden="true" />Do not include passwords, banking credentials or highly sensitive personal information.</p>
                            </div>
                            <div>
                                <h3 className="text-[0.875rem] font-semibold text-ink-900">Meeting Format</h3>
                                <div role="radiogroup" aria-label="Meeting format" className="mt-2 grid gap-2.5 sm:grid-cols-2">
                                    <OptionCard selected={form.data.channel === 'video'} onSelect={() => form.setData('channel', 'video')} title="Online Video Call" body="A secure meeting link will be issued after confirmation." icon="play" />
                                    <OptionCard selected={form.data.channel === 'phone'} onSelect={() => form.setData('channel', 'phone')} title="Phone Call" body="Your Relationship Manager will call the confirmed number." icon="phone" />
                                </div>
                            </div>
                            <fieldset className="grid gap-3 border-t border-parchment-300 pt-4 sm:grid-cols-2">
                                <legend className="mb-2 text-[0.875rem] font-semibold text-ink-900">Client Contact for this Booking</legend>
                                <Field label="Full Name" required error={form.errors.name}>{(id) => <Input id={id} autoComplete="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                                <Field label="Company">{(id) => <Input id={id} autoComplete="organization" value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} />}</Field>
                                <Field label="Email" required error={form.errors.email}>{(id) => <Input id={id} type="email" autoComplete="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />}</Field>
                                <Field label="Phone" required={form.data.channel === 'phone'} error={form.errors.phone}>{(id) => <Input id={id} type="tel" autoComplete="tel" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />}</Field>
                                <Field label="Preferred Contact Method">{(id) => <Select id={id} options={['Email', 'Phone', 'WhatsApp']} value={form.data.contact_method} onChange={(e) => form.setData('contact_method', e.target.value)} />}</Field>
                            </fieldset>
                        </section>

                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4 lg:col-span-5">
                            <h2 className="mb-2 text-[0.9375rem] font-bold text-ink-900">Select a Date</h2>
                            <SlotPicker today={today} date={form.data.date} time={form.data.time} slots={slots} onDate={(d) => form.setData('date', d)} onTime={(t) => form.setData('time', t)} />
                            {(form.errors.date || form.errors.time) && <p role="alert" className="mt-2 text-xs text-risk-500">{form.errors.date ?? form.errors.time}</p>}
                            <Field label="Your Timezone" className="mt-4">
                                {(id) => <Select id={id} options={timezones.map((t) => ({ value: t.key, label: t.label }))} value={form.data.timezone} onChange={(e) => form.setData('timezone', e.target.value)} />}
                            </Field>
                            {form.data.time && tz && tz.offset !== 0 && (
                                <p className="mt-1 text-[0.75rem] text-ink-500">
                                    {form.data.time} SAST is {String(Number(form.data.time.slice(0, 2)) + tz.offset).padStart(2, '0')}:00 in {tz.key}.
                                </p>
                            )}
                        </section>
                    </div>
                </div>

                <aside className="space-y-4 xl:col-span-4">
                    <ManagerCard manager={manager} />
                    <SummaryPanel
                        rows={[
                            ['Meeting', 'Discovery Call'],
                            ['Purpose', purposeTitle],
                            ['Related Engagement', form.data.engagement],
                            ['Relationship Manager', manager.name],
                            ['Meeting Format', form.data.channel === 'phone' ? 'Phone Call' : 'Online Video Call'],
                            ['Date', form.data.date ? new Date(`${form.data.date}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''],
                            ['Time', form.data.time],
                            ['Timezone', tz?.label],
                        ]}
                    />
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="mb-3 text-[0.875rem] font-bold text-ink-900">What Happens Next?</h2>
                        <NumberedList items={['Review and confirm your selected date and time.', 'Your booking will appear under Meetings in your Client Portal.', 'You will receive a confirmation and meeting instructions through approved notification channels (where consented).']} />
                        <Button type="submit" className="mt-4 w-full" disabled={!ready || form.processing}>
                            {form.processing ? 'Saving…' : 'Review & Confirm Booking'}
                        </Button>
                        <Link href={auth.user ? '/portal' : '/'} className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-[4px] border border-gold-500 text-sm font-semibold text-gold-700">Cancel and Return to Dashboard</Link>
                        <p className="mt-3 flex items-center justify-center gap-1.5 text-[0.6875rem] text-ink-500"><ShieldCheck className="size-3.5" aria-hidden="true" />Your booking information is handled through the secure TBCA Client Portal.</p>
                        {total > 0 && <p className="mt-1 text-center text-[0.6875rem] text-ink-400">{total} file{total === 1 ? '' : 's'} attached</p>}
                    </section>
                    <HelpCards />
                </aside>
            </form>
        </ClientShell>
    );
}

Book.layout = null;
