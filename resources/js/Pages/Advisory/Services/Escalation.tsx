import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { CalendarCheck, CircleCheck, FileText, Handshake, MessageCircle, Phone, Search, ShieldCheck, Target, User } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input } from '@/Components/ui/Form';
import { DarkHero, KV, TrustBand } from '@/Components/Advisory/ui';

interface Props {
    reference: string | null;
    reasons: { title: string; body: string }[];
}

export default function Escalation({ reference, reasons }: Props) {
    const form = useForm({ name: '', email: '', phone: '', company: '', recommendation: reference ?? '', preferred_time: '' });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/services/mandatory-partner-escalation', { preserveScroll: true, onSuccess: () => form.reset('name', 'email', 'phone', 'company', 'preferred_time') });
    };
    const steps = [
        [User, 'Partner assigned', 'We match you with the right partner specialist.'],
        [CalendarCheck, 'Intro call', 'Expect contact within 1 business day.'],
        [Target, 'Deep-dive review', 'Your partner reviews goals, context and options.'],
        [FileText, 'Tailored proposal', 'You receive a customised recommendation.'],
        [Handshake, 'Decision & proceed', 'You choose the best path forward with confidence.'],
    ] as const;
    return (
        <>
            <Head title="Mandatory Partner Escalation" />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'Ways to Work with TBCA', href: '/services/ways-to-work-with-tbca' }, { label: 'Mandatory Partner Escalation' }]}
                title="Mandatory Partner Escalation"
                tagline="Your situation needs a partner. We escalate — at no extra cost to you."
                intro="Based on the information provided, this engagement requires partner-level involvement to ensure the right solution, quality and accountability. We'll connect you with the right partner specialist."
                chips={[{ label: 'Market', sub: 'Africa (Active)' }, { label: 'Languages', sub: '7 Languages' }, { label: 'No extra cost', sub: 'Escalation included' }, { label: 'Partner review', sub: 'Mandatory' }, { label: 'We act in your best', sub: 'interests, always' }]}
                box={{ title: 'Why partner escalation?', items: ['Complexity or risk requires partner oversight.', 'Greater impact and better outcomes.', 'Specialist insight and accountability.', 'Aligned with our quality and governance standards.', 'No extra charge. It’s part of our commitment.'] }}
            />
            <div className="container-tbca grid gap-5 py-8 lg:grid-cols-12">
                <section className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-4">
                    <h2 className="font-semibold text-ink-900">Why we&rsquo;re escalating your engagement</h2>
                    <p className="text-xs text-ink-500">We&rsquo;ve identified one or more factors that require partner-level involvement.</p>
                    <ul className="mt-3 space-y-3">
                        {reasons.map((r) => (
                            <li key={r.title} className="flex gap-2.5">
                                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-gold-600" />
                                <span><span className="block text-sm font-semibold text-ink-900">{r.title}</span><span className="block text-xs text-ink-600">{r.body}</span></span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 rounded bg-gold-50 p-3 text-xs text-ink-700"><b>Escalation is at no extra cost to you.</b> It&rsquo;s included in our commitment to get this right.</p>
                </section>
                <section className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-5">
                    <h2 className="font-semibold text-ink-900">What happens next?</h2>
                    <p className="text-xs text-ink-500">A partner will personally take ownership of your engagement.</p>
                    <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {steps.map(([I, t, b], i) => (
                            <li key={t} className="text-center">
                                <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full border-2 border-gold-400 text-gold-700"><I className="size-5" /></span>
                                <p className="mt-1 text-xs font-semibold text-ink-900">{i + 1}. {t}</p>
                                <p className="text-[0.6875rem] text-ink-500">{b}</p>
                            </li>
                        ))}
                    </ol>
                    <form onSubmit={submit} className="mt-6 grid gap-3 rounded-[6px] bg-parchment-200 p-4 sm:grid-cols-2">
                        <h3 className="text-sm font-semibold text-ink-900 sm:col-span-2">Request a call from a partner</h3>
                        <Field label="Full name" required error={form.errors.name}>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                        <Field label="Work email" required error={form.errors.email}>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />}</Field>
                        <Field label="Phone" required error={form.errors.phone}>{(id) => <Input id={id} value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} placeholder="+27" />}</Field>
                        <Field label="Company">{(id) => <Input id={id} value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} />}</Field>
                        <Field label="Preferred call time" className="sm:col-span-2">{(id) => <Input id={id} value={form.data.preferred_time} onChange={(e) => form.setData('preferred_time', e.target.value)} placeholder="e.g. Weekday mornings" />}</Field>
                        <Button type="submit" disabled={form.processing} icon="phone" className="sm:col-span-2">Request a Call from a Partner</Button>
                    </form>
                </section>
                <aside className="space-y-4 lg:col-span-3">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                        <h2 className="font-semibold text-ink-900">Your escalation summary</h2>
                        <KV rows={[['Escalation reason', reasons.length > 1 ? 'Multiple factors identified' : reasons[0]?.title], ['Recommended next step', 'Partner review and proposal'], ['Estimated response time', 'Within 1 business day'], ['Cost of escalation', 'No extra cost'], ['Your information', 'Secure and confidential'], ['Reference', reference ?? '—']]} />
                    </div>
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-5 text-sm">
                        <p className="font-semibold text-ink-900">Continue via WhatsApp</p>
                        <p className="text-xs text-ink-500">Chat with our team and we&rsquo;ll escalate you.</p>
                        <a href="https://wa.me/27608011365" className="mt-2 flex h-10 items-center justify-center gap-2 rounded border border-verified-500 text-sm font-semibold text-verified-700"><MessageCircle className="size-4" />Chat on WhatsApp</a>
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500"><Phone className="size-3.5" />+27 60 801 1365</p>
                    </div>
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-5 text-xs text-ink-600">
                        <p className="font-semibold text-ink-900">What you can expect</p>
                        <ul className="mt-2 space-y-1">
                            {[['Senior partner', 'Direct involvement'], ['Clear options', 'No obligation'], ['Transparent pricing', 'Fair and upfront'], ['Best outcome', 'Always our priority']].map(([a, b]) => (
                                <li key={a} className="flex gap-1.5"><CircleCheck className="size-3.5 text-verified-500" /><b>{a}</b> — {b}</li>
                            ))}
                        </ul>
                        <p className="mt-2 flex items-center gap-1"><Search className="size-3" />Partners are drawn from the TBCA Partner Services network.</p>
                    </div>
                </aside>
            </div>
            <TrustBand items={[['We recommend by fit, not margin', 'Your success is our priority.'], ['Human review mandatory', 'Real experts. Real accountability.'], ['Secure & private', 'Your information is protected.'], ['Africa (Active)', 'ZAR source pricing.'], ['Partner network', 'Legal, audit, tax, ESG'], ['No extra cost', 'Escalation included']]} />
        </>
    );
}
