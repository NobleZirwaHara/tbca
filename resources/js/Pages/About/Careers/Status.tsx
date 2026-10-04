import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Check, CircleCheck, Search } from 'lucide-react';
import { Field, Input } from '@/Components/ui/Form';
import { ReferenceChip, StatusPill } from '@/Components/ui/Kit';
import AboutHero from '@/Components/About/AboutHero';
import { cn } from '@/lib/cn';

interface ApplicationView {
    reference: string;
    status: string;
    role: string;
    role_slug: string;
    name: string;
    submitted_at: string;
    cv_name: string | null;
    history: { at: string; status: string; note: string | null }[];
    just_submitted: boolean;
}

const dt = (iso: string) => new Date(iso).toLocaleString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const happyPath = ['submitted', 'screening', 'interview', 'offer'];

export default function CareerStatus({ application, notFound, query }: { application: ApplicationView | null; notFound: boolean; statuses: string[]; query: { reference: string; email: string } }) {
    const [reference, setReference] = useState(query.reference);
    const [email, setEmail] = useState(query.email);
    const lookup = (e: FormEvent) => {
        e.preventDefault();
        router.get('/careers/application-status', { reference, email });
    };
    const idx = application ? happyPath.indexOf(application.status) : -1;

    return (
        <>
            <Head title="Application Status" />
            <AboutHero
                accent="purple"
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Careers', href: '/careers' }, { label: 'Application Status' }]}
                title="Application Status"
                lead="Track your application with your reference."
                intro="Enter your application reference and the email you applied with. Every hiring decision is made by a person."
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-6 lg:grid-cols-[22rem_1fr]">
                    <form onSubmit={lookup} className="h-fit space-y-4 rounded-[8px] border border-parchment-400 bg-white p-5">
                        <Field label="Application reference" required>{(id) => <Input id={id} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="TBCA-APP-2026-XXXXXX" />}</Field>
                        <Field label="Email address" required>{(id) => <Input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
                        <button type="submit" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-violet-700 text-sm font-semibold text-white hover:bg-violet-800"><Search className="size-4" aria-hidden="true" /> Check Status</button>
                    </form>
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                        {!application && !notFound && <p className="text-sm text-ink-500">Your application status will appear here.</p>}
                        {notFound && <p className="text-sm text-risk-700" role="alert">We couldn&apos;t find an application with that reference and email.</p>}
                        {application && (
                            <>
                                {application.just_submitted && (
                                    <div className="mb-5 rounded-[8px] border border-verified-500/30 bg-verified-50 p-4">
                                        <p className="flex items-center gap-2 font-semibold text-verified-700"><CircleCheck className="size-5" aria-hidden="true" /> Thank you, {application.name.split(' ')[0]} — your application has been submitted.</p>
                                        <p className="mt-1 text-sm text-ink-700">Save your reference. You can return here with it and your email at any time.</p>
                                    </div>
                                )}
                                <div className="flex flex-wrap items-center gap-3">
                                    <ReferenceChip value={application.reference} />
                                    <StatusPill status={application.status} />
                                </div>
                                <h2 className="mt-3 text-lg font-semibold text-ink-900"><Link href={`/careers/${application.role_slug}`} className="hover:text-violet-700">{application.role}</Link></h2>
                                <p className="text-xs text-ink-500">Submitted {dt(application.submitted_at)}{application.cv_name ? ` · CV: ${application.cv_name}` : ''}</p>
                                {idx >= 0 ? (
                                    <ol className="mt-5 grid grid-cols-4 gap-2">
                                        {happyPath.map((s, i) => (
                                            <li key={s} className={cn('rounded-[6px] border p-2 text-center text-xs font-semibold capitalize', i < idx ? 'border-verified-500/30 bg-verified-50 text-verified-700' : i === idx ? 'border-violet-400 bg-violet-50 text-violet-800' : 'border-parchment-400 text-ink-400')}>
                                                {i < idx && <Check className="mx-auto mb-0.5 size-3.5" aria-hidden="true" />}{s}
                                            </li>
                                        ))}
                                    </ol>
                                ) : (
                                    <p className="mt-5 rounded-[6px] bg-parchment-200 p-3 text-sm text-ink-700">This application is <strong>{application.status}</strong>. Thank you for your interest in TBCA.</p>
                                )}
                                <h3 className="mt-6 text-sm font-semibold text-ink-900">History</h3>
                                <ul className="mt-2 space-y-2 border-l-2 border-parchment-400 pl-4">
                                    {application.history.map((h, i) => (
                                        <li key={i} className="text-[0.8125rem]"><span className="font-semibold capitalize text-ink-900">{h.status}</span> <span className="text-xs text-ink-500">· {dt(h.at)}</span>{h.note && <p className="text-ink-600">{h.note}</p>}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
