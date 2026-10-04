import { Head, Link, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { ReferenceChip } from '@/Components/ui/Kit';
import { Button, ButtonLink } from '@/Components/ui/Button';
import AboutHero from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import FileDrop from '@/Components/About/FileDrop';

interface Props {
    options: { categories: string[]; relationships: string[]; areas: string[]; routes: { label: string; anonymous: boolean }[] };
    draft: Record<string, string | boolean | null> | null;
    issued: { reference: string; token: string } | null;
}

const blank = {
    category: '', relationship: '', subject: '', description: '', people_involved: '', period: '', business_area: '',
    follow_up_route: '', willing_contact: true, anonymous: false, reporter_name: '', reporter_email: '', evidence: null as File | null,
};

export default function Whistleblowing({ options, draft, issued }: Props) {
    const form = useForm({ ...blank, ...(draft ?? {}), evidence: null as File | null } as typeof blank);
    const e = form.errors as Record<string, string | undefined>;
    const route = options.routes.find((r) => r.label === form.data.follow_up_route);
    const anonAllowed = route?.anonymous ?? false;
    const anonymous = form.data.anonymous && anonAllowed;

    const submit = (ev: FormEvent) => {
        ev.preventDefault();
        form.transform((d) => ({ ...d, anonymous: anonymous, willing_contact: d.willing_contact ? 1 : 0 }));
        form.post('/whistleblowing', { forceFormData: true, preserveScroll: true });
    };
    const saveDraft = () => {
        const { evidence: _evidence, ...rest } = form.data;
        void _evidence;
        router.post('/whistleblowing/draft', rest, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Whistleblowing" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Whistleblowing' }]}
                title="Whistleblowing"
                lead="Confidential reporting for serious concerns."
                intro="The Business Clinic.Africa™ (TBCA) provides a restricted and confidential route to report suspected misconduct, ethics breaches, fraud, corruption, conflicts of interest, retaliation, privacy violations, security concerns, or other serious matters. Confidentiality is built into our reporting architecture."
                aside={
                    <div className="space-y-3">
                        <div className="flex items-start gap-3 rounded-[8px] border border-gold-300 bg-gold-50/50 p-4">
                            <ShieldCheck className="size-7 shrink-0 text-gold-700" aria-hidden="true" />
                            <div><h2 className="text-sm font-semibold text-ink-900">Protected Reporting</h2><p className="text-xs text-ink-600">All reports are confidential and encrypted. Access is strictly restricted to authorised case owners and governance personnel on a need-to-know basis.</p></div>
                        </div>
                        <div className="flex items-start gap-3 rounded-[8px] border border-gold-300 bg-gold-50/50 p-4">
                            <AboutIcon name="user-check" className="size-7 shrink-0 text-gold-700" />
                            <div><h2 className="text-sm font-semibold text-ink-900">Independent Case Ownership</h2><p className="text-xs text-ink-600">Reports are routed to independent case owners who conduct impartial reviews and ensure protected handling throughout the process. No person named in a report controls its closure.</p></div>
                        </div>
                    </div>
                }
            />

            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <div className="space-y-5">
                        {issued && (
                            <div className="rounded-[8px] border-2 border-verified-500 bg-verified-50 p-5" role="status">
                                <h2 className="flex items-center gap-2 font-semibold text-verified-700"><KeyRound className="size-5" aria-hidden="true" /> Report submitted securely</h2>
                                <p className="mt-1 text-sm text-ink-700">Save your case reference and secret case token now. The token is shown <strong>only once</strong> and cannot be recovered. Use both to check status and respond to follow-up questions.</p>
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                                    <span>Reference: <ReferenceChip value={issued.reference} /></span>
                                    <span>Case token: <ReferenceChip value={issued.token} /></span>
                                </div>
                                <ButtonLink href="/whistleblowing/follow-up" variant="outline" size="sm" className="mt-3" trailingIcon="arrow-right">Go to Secure Follow-Up</ButtonLink>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5 rounded-[8px] border border-parchment-400 bg-white p-5">
                            <div className="flex items-center gap-2">
                                <Lock className="size-5 text-gold-700" aria-hidden="true" />
                                <div><h2 className="font-semibold text-ink-900">SECURE REPORT FORM</h2><p className="text-xs text-ink-500">All fields marked * are required.</p></div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <Field label="1. Report Category" required error={e.category}>{(id) => <Select id={id} placeholder="Select category" options={options.categories} value={form.data.category} onChange={(ev) => form.setData('category', ev.target.value)} />}</Field>
                                <Field label="2. Your Relationship to TBCA" required error={e.relationship}>{(id) => <Select id={id} placeholder="Select relationship" options={options.relationships} value={form.data.relationship} onChange={(ev) => form.setData('relationship', ev.target.value)} />}</Field>
                                <Field label="3. Subject / Concern Title" required error={e.subject}>{(id) => <Input id={id} value={form.data.subject} onChange={(ev) => form.setData('subject', ev.target.value)} placeholder="Brief title of the concern" />}</Field>
                            </div>
                            <Field label="4. Description of Concern" required error={e.description} hint="Provide as much detail as possible: what happened, who was involved, how it happened, and any known impact.">
                                {(id) => (
                                    <div>
                                        <Textarea id={id} rows={5} maxLength={4000} value={form.data.description} onChange={(ev) => form.setData('description', ev.target.value)} placeholder="Describe the concern in detail..." />
                                        <p className="text-right text-xs text-ink-400">{form.data.description.length}/4000</p>
                                    </div>
                                )}
                            </Field>
                            <div className="grid gap-4 md:grid-cols-3">
                                <Field label="5. People Involved" error={e.people_involved}>{(id) => <Input id={id} value={form.data.people_involved} onChange={(ev) => form.setData('people_involved', ev.target.value)} placeholder="Names, roles or positions (if known)" />}</Field>
                                <Field label="6. Date or Time Period" error={e.period}>{(id) => <Input id={id} value={form.data.period} onChange={(ev) => form.setData('period', ev.target.value)} placeholder="e.g. March – May 2026" />}</Field>
                                <Field label="7. Location / Business Area" error={e.business_area}>{(id) => <Select id={id} placeholder="Select location or business area" options={options.areas} value={form.data.business_area} onChange={(ev) => form.setData('business_area', ev.target.value)} />}</Field>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <FileDrop label="8. Supporting Evidence (Optional)" hint="Max 10MB. Allowed: PDF, DOCX, XLSX, JPG, PNG" accept=".pdf,.docx,.xlsx,.jpg,.jpeg,.png" file={form.data.evidence} onChange={(f) => form.setData('evidence', f)} error={e.evidence} />
                                <Field label="9. Preferred Secure Follow-Up Route" required error={e.follow_up_route} hint="How should we contact you about this report?">
                                    {(id) => <Select id={id} placeholder="Select secure follow-up route" options={options.routes.map((r) => r.label)} value={form.data.follow_up_route} onChange={(ev) => form.setData('follow_up_route', ev.target.value)} />}
                                </Field>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <fieldset>
                                    <legend className="text-[0.8125rem] font-medium text-ink-800">10. Are You Willing to Be Contacted? <span className="text-risk-500">*</span></legend>
                                    <div className="mt-2 space-y-1.5 text-sm text-ink-700">
                                        <label className="flex items-center gap-2"><input type="radio" name="willing" className="accent-gold-600" checked={form.data.willing_contact} onChange={() => form.setData('willing_contact', true)} /> Yes, I am willing to be contacted</label>
                                        <label className="flex items-center gap-2"><input type="radio" name="willing" className="accent-gold-600" checked={!form.data.willing_contact} onChange={() => form.setData('willing_contact', false)} /> No, I prefer not to be contacted</label>
                                    </div>
                                </fieldset>
                                <fieldset>
                                    <legend className="text-[0.8125rem] font-medium text-ink-800">11. Anonymous Reporting</legend>
                                    <Checkbox
                                        className="mt-2"
                                        label="I want to submit this report anonymously."
                                        checked={anonymous}
                                        disabled={!anonAllowed}
                                        onChange={(ev) => form.setData('anonymous', ev.target.checked)}
                                    />
                                    <p className="mt-1 text-xs text-ink-500">Anonymous reporting is only available where the selected channel supports it{route && !anonAllowed ? ' — the selected route does not.' : '.'}</p>
                                    {e.anonymous && <p className="text-xs text-risk-500" role="alert">{e.anonymous}</p>}
                                </fieldset>
                            </div>
                            {!anonymous && (
                                <div className="grid gap-4 rounded-[6px] bg-parchment-100 p-4 md:grid-cols-2">
                                    <Field label="Your name (confidential)" required error={e.reporter_name}>{(id) => <Input id={id} value={form.data.reporter_name} onChange={(ev) => form.setData('reporter_name', ev.target.value)} />}</Field>
                                    <Field label="Your email (confidential)" required error={e.reporter_email}>{(id) => <Input id={id} type="email" value={form.data.reporter_email} onChange={(ev) => form.setData('reporter_email', ev.target.value)} />}</Field>
                                </div>
                            )}
                            <div className="flex flex-col gap-4 rounded-[6px] border border-gold-300 bg-gold-50/50 p-4 md:flex-row md:items-center">
                                <ShieldCheck className="size-7 shrink-0 text-gold-700" aria-hidden="true" />
                                <p className="flex-1 text-xs text-ink-700"><span className="block font-semibold text-ink-900">Privacy & Sensitivity Notice</span>Your report will be handled with strict confidentiality and only shared on a need-to-know basis. Retaliation against anyone who reports in good faith is prohibited. Please do not include personal data of third parties unless necessary to the report. This channel is not tracked by marketing tools and creates no CRM record.</p>
                                <div className="flex shrink-0 gap-2">
                                    <Button type="submit" disabled={form.processing}><Lock className="size-4" /> Submit Secure Report</Button>
                                    <Button type="button" variant="outline" onClick={saveDraft}>Save Draft</Button>
                                </div>
                            </div>
                            <p className="flex items-center gap-1.5 text-xs text-ink-500"><Lock className="size-3.5" aria-hidden="true" /> Secure. Confidential. Protected.</p>
                        </form>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">What Happens Next</h2>
                            <ol className="mt-3 space-y-3 text-[0.8125rem]">
                                {[['Submit Report', 'You submit your concern securely.'], ['Case Review', 'An independent case owner acknowledges and reviews the report.'], ['Protected Assessment', 'Information is assessed and appropriate action pathways are considered.'], ['Secure Follow-Up', 'You may be contacted securely where appropriate, or updates are available via your case token.']].map(([t, b], i) => (
                                    <li key={t}><span className="font-semibold text-ink-900">{i + 1}. {t}</span><span className="block text-ink-600">{b}</span></li>
                                ))}
                            </ol>
                        </div>
                        <div className="rounded-[8px] border border-gold-300 bg-gold-50/50 p-5">
                            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><KeyRound className="size-5 text-gold-700" aria-hidden="true" /> Case Token / Secure Follow-Up</h2>
                            <p className="mt-1 text-[0.8125rem] text-ink-600">Upon submission you receive a unique case token. Use it to securely check status and respond to follow-up requests. Keep it private.</p>
                            <ButtonLink href="/whistleblowing/follow-up" variant="outline" size="sm" className="mt-3 w-full" trailingIcon="arrow-right">Check a Report</ButtonLink>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">Need Support?</h2>
                            <p className="mt-1 text-[0.8125rem] text-ink-600">If you need guidance on what or how to report, contact our Reporting Guidance Channel.</p>
                            <a href="mailto:reporting@thebusinessclinic.africa" className="mt-2 flex items-center gap-2 text-[0.8125rem] font-semibold text-gold-700"><Mail className="size-4" aria-hidden="true" /> reporting@thebusinessclinic.africa</a>
                            <p className="mt-3 text-xs text-ink-500">For service complaints, use <Link href="/complaints" className="underline">Complaints</Link>.</p>
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
}
