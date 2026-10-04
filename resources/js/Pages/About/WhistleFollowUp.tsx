import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Check, KeyRound, Lock, LogOut } from 'lucide-react';
import { Field, Input, Textarea } from '@/Components/ui/Form';
import { StatusPill } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import AboutHero from '@/Components/About/AboutHero';
import { cn } from '@/lib/cn';

interface Report {
    reference: string;
    status: string;
    category: string;
    subject: string;
    anonymous: boolean;
    submitted_at: string;
    messages: { at: string; from: 'reporter' | 'case_owner'; body: string }[];
    pipeline: string[];
}

const dt = (iso: string) => new Date(iso).toLocaleString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function WhistleFollowUp({ report }: { report: Report | null }) {
    const access = useForm({ reference: '', token: '' });
    const reply = useForm({ body: '' });

    const unlock = (e: FormEvent) => {
        e.preventDefault();
        access.post('/whistleblowing/follow-up', { onSuccess: () => access.reset('token') });
    };
    const send = (e: FormEvent) => {
        e.preventDefault();
        reply.post('/whistleblowing/case/reply', { preserveScroll: true, onSuccess: () => reply.reset() });
    };
    const idx = report ? report.pipeline.indexOf(report.status) : -1;

    return (
        <>
            <Head title="Secure Follow-Up" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Whistleblowing', href: '/whistleblowing' }, { label: 'Secure Follow-Up' }]}
                title="Secure Follow-Up"
                lead="Check status and respond with your case token."
                intro="Your case token is never stored in readable form. If you have lost it, submit a new report referencing the original reference."
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca">
                    {!report ? (
                        <form onSubmit={unlock} className="mx-auto max-w-md space-y-4 rounded-[8px] border border-parchment-400 bg-white p-6">
                            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><KeyRound className="size-5 text-gold-700" aria-hidden="true" /> Access your report</h2>
                            <Field label="Case reference" required error={access.errors.reference}>{(id) => <Input id={id} value={access.data.reference} onChange={(e) => access.setData('reference', e.target.value)} placeholder="WB-2026-XXXXXX" autoComplete="off" />}</Field>
                            <Field label="Secret case token" required error={access.errors.token}>{(id) => <Input id={id} type="password" value={access.data.token} onChange={(e) => access.setData('token', e.target.value)} placeholder="XXXX-XXXX-XXXX-XXXX" autoComplete="off" />}</Field>
                            <Button type="submit" className="w-full" disabled={access.processing}><Lock className="size-4" /> Open Secure Case</Button>
                        </form>
                    ) : (
                        <div className="mx-auto max-w-3xl space-y-5 rounded-[8px] border border-parchment-400 bg-white p-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="font-mono text-sm text-ink-800">{report.reference}</p>
                                    <h2 className="font-semibold text-ink-900">{report.subject}</h2>
                                    <p className="text-xs text-ink-500">{report.category} · submitted {dt(report.submitted_at)} · {report.anonymous ? 'Anonymous' : 'Confidential'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StatusPill status={report.status} />
                                    <Button type="button" variant="outline" size="sm" onClick={() => router.post('/whistleblowing/case/leave')}><LogOut className="size-4" /> Lock</Button>
                                </div>
                            </div>
                            <ol className="flex flex-wrap gap-2">
                                {report.pipeline.map((s, i) => (
                                    <li key={s} className={cn('flex items-center gap-1 rounded-full border px-3 py-1 text-xs capitalize', i < idx ? 'border-verified-500/30 bg-verified-50 text-verified-700' : i === idx ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-400 text-ink-400')}>
                                        {i < idx && <Check className="size-3" aria-hidden="true" />}{s.replace(/_/g, ' ')}
                                    </li>
                                ))}
                            </ol>
                            <div>
                                <h3 className="text-sm font-semibold text-ink-900">Secure messages</h3>
                                {report.messages.length === 0 ? <p className="mt-2 text-sm text-ink-500">No messages yet. The case owner will post updates here.</p> : (
                                    <ul className="mt-2 space-y-2">
                                        {report.messages.map((m, i) => (
                                            <li key={i} className={cn('rounded-[6px] p-3 text-sm', m.from === 'case_owner' ? 'bg-gold-50 text-ink-800' : 'ml-8 bg-parchment-200 text-ink-800')}>
                                                <p className="text-xs font-semibold text-ink-500">{m.from === 'case_owner' ? 'Case owner' : 'You'} · {dt(m.at)}</p>
                                                {m.body}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            {report.status !== 'closed' && (
                                <form onSubmit={send} className="space-y-2">
                                    <Field label="Reply securely" error={reply.errors.body}>{(id) => <Textarea id={id} rows={3} value={reply.data.body} onChange={(e) => reply.setData('body', e.target.value)} />}</Field>
                                    <Button type="submit" disabled={reply.processing}>Send Reply</Button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
