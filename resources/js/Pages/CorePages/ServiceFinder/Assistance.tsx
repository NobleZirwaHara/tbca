import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Bookmark, Headset, Info, Sparkles } from 'lucide-react';
import type { FormEvent } from 'react';
import { ASSIST_STEPS, FinderHeader } from '@/Components/CorePages/FinderParts';
import { NumberedList } from '@/Components/CorePages/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import type { FinderShared } from '@/types/core-pages';

interface Draft {
    help_with: string; item: string; assistance_type: string; assist_how: string; details: string; urgency: string; preferred_date: string; preferred_time: string; contact_channel: string;
}

interface Props extends FinderShared {
    items: string[];
    options: Record<string, string[]>;
    draft: Draft;
}

export default function Assistance({ items, options, draft, summary }: Props) {
    const form = useForm({ ...draft, intent: 'submit' });
    const d = form.data;
    const err = form.errors as Record<string, string>;
    const send = (intent: 'submit' | 'save') => {
        form.transform((x) => ({ ...x, intent }));
        form.post('/find-the-right-service/request-human-assistance', { preserveScroll: true });
    };
    const submit = (e: FormEvent) => {
        e.preventDefault();
        send('submit');
    };
    const sel = (k: keyof Draft, label: string, opts: string[], required = true) => (
        <Field label={label} required={required} error={err[k]}>{(id) => <Select id={id} options={opts} value={d[k]} onChange={(e) => form.setData(k, e.target.value)} />}</Field>
    );

    return (
        <div className="bg-parchment-200">
            <Head title="Request Human Assistance" />
            <FinderHeader
                title="Request Human Assistance"
                subtitle="Our specialists will review your request and guide you to the right Sprint, tool, template or advisory solution."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: 'Find the Right Service', href: '/find-the-right-service/recommendations' }, { label: 'Human Assistance Request' }]}
                steps={ASSIST_STEPS}
                current={6}
                chips={['Priority review within 1 business day', 'Human experts, not bots', 'Confidential and secure']}
                icon={<Headset className="size-8" aria-hidden="true" />}
                assist
            />
            <form onSubmit={submit} noValidate className="container-tbca grid gap-5 py-8 xl:grid-cols-12">
                <div className="xl:col-span-8">
                    <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                        <h2 className="font-serif text-[1.375rem] font-semibold text-ink-900">Tell us how we can help you</h2>
                        <p className="text-[0.8125rem] text-ink-500">Provide a few details so our specialist can understand your request and connect you with the right expert.</p>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            {sel('help_with', 'I need help with', options.help_with)}
                            {sel('item', 'Please select the Sprint, tool or template you are interested in', items)}
                            {sel('assistance_type', 'What type of assistance do you need?', options.assistance_type)}
                            {sel('assist_how', 'How can we best assist you?', options.assist_how)}
                            <Field label="Describe your request in detail" required error={err.details} hint={`Characters: ${d.details.length} / 2000`}>
                                {(id) => <Textarea id={id} maxLength={2000} value={d.details} onChange={(e) => form.setData('details', e.target.value)} />}
                            </Field>
                            {sel('urgency', 'Urgency level', options.urgency)}
                            <Field label="Preferred date for assistance" error={err.preferred_date}>{(id) => <Input id={id} type="date" value={d.preferred_date} onChange={(e) => form.setData('preferred_date', e.target.value)} />}</Field>
                            {sel('preferred_time', 'Preferred time', options.preferred_time, false)}
                            {sel('contact_channel', 'Preferred contact channel', options.contact_channel)}
                        </div>
                        <p className="mt-4 flex gap-2 rounded-[6px] border border-gold-300 bg-gold-50 p-3 text-[0.75rem] text-ink-700"><Info className="size-4 shrink-0" aria-hidden="true" />Our team will acknowledge your request and match you with the right specialist. You will receive a confirmation and next steps shortly.</p>
                    </section>
                    <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <Link href="/find-the-right-service/recommendations" className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] border border-gold-500 bg-white px-5 text-sm"><ArrowLeft className="size-4" aria-hidden="true" />Back to Recommendations</Link>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button type="button" disabled={form.processing} onClick={() => send('save')} className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] border border-ink-300 bg-white px-5 text-sm"><Bookmark className="size-4" aria-hidden="true" />Save and Continue Later</button>
                            <Link href="/find-the-right-service/recommendations" className="inline-flex h-11 items-center justify-center rounded-[4px] border border-ink-300 bg-white px-5 text-sm">Cancel Request</Link>
                            <button type="submit" disabled={form.processing} className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-gold-500 px-6 text-sm font-semibold text-ink-900">{form.processing ? 'Submitting…' : 'Submit Request'} <ArrowRight className="size-4" aria-hidden="true" /></button>
                        </div>
                    </div>
                </div>
                <aside className="space-y-3 xl:col-span-4">
                    <div className="rounded-[10px] bg-ink-950 p-5 text-parchment-200">
                        <h2 className="font-serif text-[1.1875rem] font-semibold text-gold-400">Your Request Summary</h2>
                        <dl className="mt-3 space-y-2 text-[0.8125rem]">
                            {[['Selected Service Route', summary.need ?? d.help_with], ['Selected Item', d.item], ['Request Type', d.assistance_type.replace('I need ', '')], ['Urgency', d.urgency], ['Preferred Channel', d.contact_channel]].map(([k, v]) => (
                                <div key={k} className="grid grid-cols-[9rem_1fr] gap-2"><dt className="text-ink-300">{k}</dt><dd className="text-gold-300">{v}</dd></div>
                            ))}
                        </dl>
                        <div className="mt-4 rounded-[8px] border border-gold-600/60 p-3">
                            <p className="mb-2 text-[0.8125rem] font-semibold text-gold-400">What happens next?</p>
                            <NumberedList tone="dark" items={['We acknowledge your request.', 'A specialist reviews your needs.', 'We contact you via your preferred channel.', 'You receive expert guidance and next steps.']} />
                        </div>
                    </div>
                    <p className="flex gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 text-[0.75rem]"><Sparkles className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block text-ink-900">AI-Guided | Human-Reviewed Where Required</strong>Complex requests are reviewed by human experts.</span></p>
                </aside>
            </form>
        </div>
    );
}
