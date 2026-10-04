import { Head, router, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Check, Search } from 'lucide-react';
import { Field, Input } from '@/Components/ui/Form';
import { ReferenceChip, StatusPill } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import AboutHero from '@/Components/About/AboutHero';
import { cn } from '@/lib/cn';

interface CaseRecord {
    reference: string;
    type: 'complaint' | 'media' | 'partner';
    status: string;
    subject: string | null;
    category: string | null;
    submitted_at: string;
    history: { at: string; status: string; note: string | null }[];
    pipeline: string[];
}

const typeLabel = { complaint: 'Complaint', media: 'Media enquiry', partner: 'Partner enquiry' };
const dt = (iso: string) => new Date(iso).toLocaleString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function Track({ record, searched, query }: { record: CaseRecord | null; searched: boolean; query: { reference: string; email: string } }) {
    const [reference, setReference] = useState(query.reference);
    const [email, setEmail] = useState(query.email);
    const flash = usePage<{ flash?: { reference?: string | null } }>().props.flash;
    const lookup = (e: FormEvent) => {
        e.preventDefault();
        router.get('/complaints/track', { reference, email }, { preserveState: true });
    };
    const idx = record ? record.pipeline.indexOf(record.status) : -1;

    return (
        <>
            <Head title="Track a Case" />
            <AboutHero
                accent="purple"
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Complaints', href: '/complaints' }, { label: 'Track' }]}
                title="Track Your Case"
                lead="Complaints, media and partner enquiries."
                intro="Enter the reference you received and the email address you used. We never show case details without both."
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-6 lg:grid-cols-[22rem_1fr]">
                    <form onSubmit={lookup} className="h-fit space-y-4 rounded-[8px] border border-parchment-400 bg-white p-5">
                        <Field label="Case reference" required>{(id) => <Input id={id} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="TBCA-CMP-2026-XXXXXX" />}</Field>
                        <Field label="Email address" required>{(id) => <Input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />}</Field>
                        <Button type="submit" className="w-full"><Search className="size-4" /> Check Status</Button>
                    </form>
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                        {!record && !searched && <p className="text-sm text-ink-500">Your case status will appear here.</p>}
                        {!record && searched && <p className="text-sm text-risk-700" role="alert">We couldn&apos;t find a case matching that reference and email.</p>}
                        {record && (
                            <>
                                {flash?.reference === record.reference && (
                                    <p className="mb-4 rounded-[6px] bg-verified-50 p-3 text-sm text-verified-700">Submitted successfully. Keep your reference to track progress.</p>
                                )}
                                <div className="flex flex-wrap items-center gap-3">
                                    <ReferenceChip value={record.reference} />
                                    <StatusPill status={record.status} />
                                    <span className="text-xs text-ink-500">{typeLabel[record.type]} · submitted {dt(record.submitted_at)}</span>
                                </div>
                                <h2 className="mt-3 font-semibold text-ink-900">{record.subject}</h2>
                                <ol className="mt-5 flex flex-wrap gap-2">
                                    {record.pipeline.map((s, i) => (
                                        <li key={s} className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium capitalize', i < idx ? 'border-verified-500/30 bg-verified-50 text-verified-700' : i === idx ? 'border-violet-400 bg-violet-50 text-violet-800' : 'border-parchment-400 text-ink-400')}>
                                            {i < idx && <Check className="size-3" aria-hidden="true" />}
                                            {s.replace(/_/g, ' ')}
                                        </li>
                                    ))}
                                </ol>
                                <h3 className="mt-6 text-sm font-semibold text-ink-900">Timeline</h3>
                                <ul className="mt-2 space-y-3 border-l-2 border-parchment-400 pl-4">
                                    {record.history.map((h, i) => (
                                        <li key={i} className="text-[0.8125rem]">
                                            <p className="font-semibold text-ink-900 capitalize">{h.status.replace(/_/g, ' ')}</p>
                                            <p className="text-xs text-ink-500">{dt(h.at)}</p>
                                            {h.note && <p className="text-ink-600">{h.note}</p>}
                                        </li>
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
