import { Head, Link, useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import { Stepper } from '@/Components/ui/Kit';
import { Card, CheckItem, EventHero, Ico, KeyDetails, RailEvent, WebinarShell, btnClass, splitTitle } from '@/Components/Webinars/kit';
import type { EventFrame } from '@/types/webinars';

interface Props extends EventFrame {
    modes: { key: string; label: string; body: string; icon: string }[];
    roles: string[];
    industries: string[];
    countries: string[];
    prefill: { first_name: string; last_name: string; email: string; phone: string; country: string; organisation: string };
}

const input = 'h-10 w-full rounded-[6px] border border-parchment-500 bg-white px-3 text-[0.8125rem] text-ink-900 placeholder:text-ink-400 focus:border-gold-500 focus:outline-none aria-[invalid=true]:border-risk-500';

function Field({ label, required, error, children, id }: { label: string; required?: boolean; error?: string; children: ReactNode; id: string }) {
    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-[0.8125rem] font-semibold text-ink-800">{label}{required ? <span className="text-risk-500"> *</span> : <span className="font-normal text-ink-500"> (Optional)</span>}</label>
            {children}
            {error && <p id={`${id}-error`} className="mt-1 text-[0.75rem] text-risk-500">{error}</p>}
        </div>
    );
}

function Section({ n, title, sub, children, className }: { n: number | ReactNode; title: string; sub?: string; children: ReactNode; className?: string }) {
    return (
        <section className={cn('rounded-[10px] border border-parchment-400 bg-parchment-100 p-4 sm:p-5', className)}>
            <header className="mb-4 flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gold-500 font-serif text-lg font-bold text-ink-900">{n}</span>
                <div>
                    <h2 className="font-serif text-[1.125rem] font-bold text-ink-900">{title}</h2>
                    {sub && <p className="text-[0.8125rem] text-ink-500">{sub}</p>}
                </div>
            </header>
            {children}
        </section>
    );
}

function Declaration({ checked, onChange, error, children, id }: { checked: boolean; onChange: (v: boolean) => void; error?: string; children: ReactNode; id: string }) {
    return (
        <div>
            <label htmlFor={id} className="flex items-start gap-2.5 text-[0.8125rem] text-ink-700">
                <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-gold-600" aria-invalid={!!error} />
                <span>{children}</span>
            </label>
            {error && <p className="mt-0.5 ml-6 text-[0.75rem] text-risk-500">{error}</p>}
        </div>
    );
}

export default function Register({ event, notices, modes, roles, industries, countries, prefill }: Props) {
    const price = usePrice();
    const form = useForm({
        ...prefill,
        role: '',
        industry: '',
        participation: 'live_recorded',
        accept_privacy: false,
        accept_recording: false,
        accept_confidentiality: false,
        accept_offer: false,
        accept_boundary: false,
        opt_updates: false,
    });
    const d = form.data;
    const e = form.errors as Record<string, string | undefined>;
    const detailsDone = Boolean(d.first_name && d.last_name && d.email && d.phone && d.country && d.role);
    const declDone = d.accept_privacy && d.accept_recording && d.accept_confidentiality && d.accept_offer && d.accept_boundary;
    const step = !detailsDone ? 1 : !d.participation ? 2 : !declDone ? 3 : 4;
    const [lead, gold] = splitTitle(event.title);
    const set = (k: keyof typeof d, v: string | boolean) => form.setData((prev) => ({ ...prev, [k]: v }));

    return (
        <WebinarShell
            event={event}
            rail={
                <>
                    <KeyDetails event={event} title="Event Details" />
                    <RailEvent event={event} title="Your Webinar" />
                    <Card tone="dark" title="What You Will Learn" icon="lightbulb">
                        <ul className="space-y-2 text-parchment-100">{event.outcomes.map((o) => <CheckItem key={o}>{o}</CheckItem>)}</ul>
                    </Card>
                </>
            }
        >
            <Head title={`Register: ${event.title}`} />
            <EventHero crumbs={[['Home', '/'], ['Webinars', '/webinars'], [lead.replace(/:$/, ''), `/webinars/${event.slug}`], ['Register']]} title="Register for This Webinar" gold={gold ? `${lead} ${gold}` : lead} lead={<>Complete your registration to secure your place. All fields marked with <span className="text-risk-500">*</span> are required.{event.priceZar ? ` Seat price ${price(event.priceZar)}, payable at checkout.` : ''}</>} />

            <form
                noValidate
                onSubmit={(ev) => {
                    ev.preventDefault();
                    form.post(`/webinars/${event.slug}/register`, { preserveScroll: true });
                }}
                className="space-y-5 rounded-[12px] border border-parchment-400 bg-white p-4 sm:p-6"
            >
                <Stepper steps={['Your Details', 'Participation Options', 'Consents & Declarations', 'Review & Confirm']} current={step} />
                {Object.keys(form.errors).length > 0 && (
                    <p role="alert" className="rounded-[8px] border border-risk-500/40 bg-risk-50 px-4 py-2 text-[0.8125rem] text-risk-700">Please complete the highlighted fields and declarations below.</p>
                )}

                <div className="grid gap-5 xl:grid-cols-2">
                    <Section n={1} title="1. Your Details" sub="Provide your information to register for the webinar.">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field id="r-first" label="First Name" required error={e.first_name}><input id="r-first" className={input} autoComplete="given-name" placeholder="Enter your first name" value={d.first_name} onChange={(x) => set('first_name', x.target.value)} aria-invalid={!!e.first_name} /></Field>
                            <Field id="r-last" label="Last Name" required error={e.last_name}><input id="r-last" className={input} autoComplete="family-name" placeholder="Enter your last name" value={d.last_name} onChange={(x) => set('last_name', x.target.value)} aria-invalid={!!e.last_name} /></Field>
                            <Field id="r-email" label="Email Address" required error={e.email}><input id="r-email" type="email" className={input} autoComplete="email" placeholder="Enter your email address" value={d.email} onChange={(x) => set('email', x.target.value)} aria-invalid={!!e.email} /></Field>
                            <Field id="r-phone" label="Phone Number" required error={e.phone}><input id="r-phone" type="tel" className={input} autoComplete="tel" placeholder="+27 82 123 4567" value={d.phone} onChange={(x) => set('phone', x.target.value)} aria-invalid={!!e.phone} /></Field>
                            <Field id="r-country" label="Country" required error={e.country}>
                                <select id="r-country" className={input} value={d.country} onChange={(x) => set('country', x.target.value)} aria-invalid={!!e.country}>
                                    <option value="">Select your country</option>
                                    {countries.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </Field>
                            <Field id="r-org" label="Organisation" error={e.organisation}><input id="r-org" className={input} autoComplete="organization" placeholder="Enter your organisation name" value={d.organisation} onChange={(x) => set('organisation', x.target.value)} /></Field>
                            <Field id="r-role" label="Your Role" required error={e.role}>
                                <select id="r-role" className={input} value={d.role} onChange={(x) => set('role', x.target.value)} aria-invalid={!!e.role}>
                                    <option value="">Select your role</option>
                                    {roles.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </Field>
                            <Field id="r-industry" label="Industry" error={e.industry}>
                                <select id="r-industry" className={input} value={d.industry} onChange={(x) => set('industry', x.target.value)}>
                                    <option value="">Select your industry</option>
                                    {industries.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </Field>
                        </div>
                    </Section>

                    <Section n={2} title="2. Participation Options" sub="Choose how you want to participate.">
                        <fieldset className="space-y-2.5">
                            <legend className="sr-only">Participation option</legend>
                            {modes.map((m, i) => (
                                <label key={m.key} className={cn('flex cursor-pointer items-center gap-3 rounded-[10px] border p-3.5 transition-colors', d.participation === m.key ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-parchment-400 bg-white hover:border-gold-400')}>
                                    <input type="radio" name="participation" value={m.key} checked={d.participation === m.key} onChange={() => set('participation', m.key)} className="size-4 accent-gold-600" />
                                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-400 text-ink-900">{m.icon === 'eye-off' ? <L.EyeOff className="size-5" /> : <Ico name={m.icon} className="size-5" />}</span>
                                    <span className="flex-1">
                                        <span className="flex items-center gap-2 font-serif text-[0.9375rem] font-bold text-ink-900">{m.label}{i === 0 && <span className="rounded-full bg-verified-50 px-2 py-0.5 font-sans text-[0.625rem] font-semibold text-verified-700">Recommended</span>}</span>
                                        <span className="block text-[0.75rem] text-ink-600">{m.body}</span>
                                    </span>
                                </label>
                            ))}
                        </fieldset>
                        <div className="mt-3 flex gap-3 rounded-[10px] border border-controlled-500/25 bg-controlled-50 p-3.5">
                            <L.Info className="size-5 shrink-0 text-controlled-500" aria-hidden="true" />
                            <p className="text-[0.75rem] text-ink-700"><strong className="block text-controlled-700">Important</strong>A replay is a new publication. All replays are reviewed and must pass GATE-WB-03 before release. No replay auto-publishes.</p>
                        </div>
                    </Section>
                </div>

                <div className="grid gap-5 xl:grid-cols-3">
                    <Section n={3} title="3. Consents and Declarations" sub="You must confirm the following to complete your registration.">
                        <div className="space-y-2.5">
                            <Declaration id="d-privacy" checked={d.accept_privacy} onChange={(v) => set('accept_privacy', v)} error={e.accept_privacy}>I have read and agree to the <Link href="/policies" className="text-controlled-500 underline">Privacy Policy</Link>. <span className="text-risk-500">*</span></Declaration>
                            <Declaration id="d-recording" checked={d.accept_recording} onChange={(v) => set('accept_recording', v)} error={e.accept_recording}>I understand that this webinar will be recorded and reviewed before any replay is published. <span className="text-risk-500">*</span></Declaration>
                            <Declaration id="d-conf" checked={d.accept_confidentiality} onChange={(v) => set('accept_confidentiality', v)} error={e.accept_confidentiality}>I confirm that I will not share any confidential or third-party information during the live session. <span className="text-risk-500">*</span></Declaration>
                            <hr className="border-parchment-400" />
                            <Declaration id="d-updates" checked={d.opt_updates} onChange={(v) => set('opt_updates', v)}>I would like to receive updates, related events and offers from The Business Clinic.Africa (optional). This is not a condition of registration.</Declaration>
                        </div>
                    </Section>
                    <div className="space-y-5">
                        <Section n={<L.Tag className="size-5" />} title="4. Commercial Offer Disclosure">
                            <p className="text-[0.75rem] text-ink-700">{notices.offer.body}</p>
                            <div className="mt-2"><Declaration id="d-offer" checked={d.accept_offer} onChange={(v) => set('accept_offer', v)} error={e.accept_offer}>I understand that commercial offers may be presented during this webinar. <span className="text-risk-500">*</span></Declaration></div>
                        </Section>
                        <Section n={<L.Scale className="size-5" />} title="Professional Boundary">
                            <p className="text-[0.75rem] text-ink-700">{notices.boundary.body}</p>
                            <div className="mt-2"><Declaration id="d-boundary" checked={d.accept_boundary} onChange={(v) => set('accept_boundary', v)} error={e.accept_boundary}>I understand and accept this professional boundary. <span className="text-risk-500">*</span></Declaration></div>
                        </Section>
                    </div>
                    <Section n={<L.Check className="size-5" />} title="5. Review and Confirm" sub="Click the button below to complete your registration. You will receive a confirmation email with your joining link and calendar invite.">
                        <dl className="mb-4 space-y-1 text-[0.75rem] text-ink-700">
                            <div className="flex justify-between gap-2"><dt>Name</dt><dd className="font-semibold text-ink-900">{[d.first_name, d.last_name].filter(Boolean).join(' ') || 'Not entered'}</dd></div>
                            <div className="flex justify-between gap-2"><dt>Participation</dt><dd className="text-right font-semibold text-ink-900">{modes.find((m) => m.key === d.participation)?.label}</dd></div>
                            <div className="flex justify-between gap-2"><dt>Price</dt><dd className="font-semibold text-ink-900">{event.priceZar ? price(event.priceZar) : 'Free'}</dd></div>
                            <div className="flex justify-between gap-2"><dt>Notice versions</dt><dd className="font-mono text-[0.6875rem]">{notices.recording.version}, {notices.offer.version}</dd></div>
                        </dl>
                        <button type="submit" disabled={form.processing} className={cn(btnClass('gold', 'lg'), 'w-full')}>
                            <L.CalendarCheck className="size-5" aria-hidden="true" /> {event.priceZar ? 'Continue to Payment' : 'Confirm My Registration'} <L.ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                        <p className="mt-3 flex gap-2 text-[0.6875rem] text-ink-500"><L.Lock className="size-4 shrink-0" aria-hidden="true" />{notices.privacy.body}</p>
                    </Section>
                </div>
            </form>
        </WebinarShell>
    );
}

Register.layout = null;
