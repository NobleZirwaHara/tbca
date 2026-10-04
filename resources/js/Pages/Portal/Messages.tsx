import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Paperclip, Pin, Plus, Send } from 'lucide-react';
import PortalShell from '@/Components/Portal/PortalShell';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Textarea } from '@/Components/ui/Form';
import { Modal, Panel, StatusPill } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';

interface Props {
    threads: { id: number; title: string; preview: string | null; at: string | null; unread: number; pinned: boolean }[];
    active: {
        id: number;
        title: string;
        reference: string;
        purpose: string | null;
        project: string | null;
        owner: string | null;
        classification: string;
        status: string;
        pinned: boolean;
        participants: string[];
        started: string;
        messages: { id: number; author: string; role: string | null; mine: boolean; kind: string; body: string; attachments: { name: string; size: string; href?: string }[]; at: string }[];
    } | null;
}

/** CP-SCR-070 Secure Messages: conversation list, thread and composer. */
export default function Messages({ threads, active }: Props) {
    const [composeOpen, setComposeOpen] = useState(false);
    const reply = useForm<{ body: string; kind: string; file: File | null }>({ body: '', kind: 'reply', file: null });
    const compose = useForm({ title: '', body: '' });

    return (
        <PortalShell
            title="Secure Messages"
            icon="message-square"
            subtitle="Communicate securely with TBCA. All messages are recorded in our systems and protected."
            crumbs={[{ label: 'Secure Messages' }]}
            actions={
                <Button type="button" size="sm" onClick={() => setComposeOpen(true)}>
                    <Plus className="size-4" aria-hidden="true" /> New Secure Message
                </Button>
            }
        >
            <Head title="Secure Messages" />
            <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)_17rem]">
                <Panel title="Conversations" className="p-3">
                    <ul className="space-y-1">
                        {threads.map((t) => (
                            <li key={t.id}>
                                <Link
                                    href={`/portal/messages?thread=${t.id}`}
                                    preserveScroll
                                    className={cn('block rounded-[6px] p-2.5 text-[0.8125rem] hover:bg-parchment-100', active?.id === t.id && 'bg-gold-50 ring-1 ring-gold-400/60')}
                                >
                                    <div className="flex items-center gap-1.5">
                                        {t.pinned && <Pin className="size-3 text-gold-600" aria-label="Pinned" />}
                                        <span className="flex-1 truncate font-semibold text-ink-900">{t.title}</span>
                                        {t.unread > 0 && <span className="rounded-full bg-controlled-600 px-1.5 text-[0.625rem] font-bold text-white">{t.unread}</span>}
                                    </div>
                                    <p className="line-clamp-2 text-xs text-ink-500">{t.preview}</p>
                                    <p className="text-[0.625rem] text-ink-400">{t.at}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Panel>

                {active ? (
                    <section className="flex min-w-0 flex-col rounded-[8px] border border-parchment-400 bg-white">
                        <header className="border-b border-parchment-300 p-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="font-semibold text-ink-900">{active.title}</h2>
                                {active.pinned && <StatusPill status="Pinned" tone="gold" />}
                            </div>
                            <p className="text-xs text-ink-500">
                                Engagement {active.reference} · {active.purpose}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink-600">
                                <span>Classification: <strong>{active.classification}</strong></span>
                                <span>Channel: <strong>Portal Secure</strong></span>
                                <span>Status: <strong className="capitalize">{active.status}</strong></span>
                            </div>
                        </header>
                        <ol className="flex-1 space-y-4 overflow-y-auto p-4">
                            {active.messages.map((m) => (
                                <li key={m.id} className={cn('flex', m.mine ? 'justify-end' : 'justify-start')}>
                                    <div className={cn('max-w-[85%] rounded-[8px] p-3 text-sm', m.kind === 'note' ? 'border border-dashed border-attested-500 bg-attested-50' : m.mine ? 'bg-gold-50' : 'bg-parchment-100')}>
                                        <p className="mb-1 flex flex-wrap gap-2 text-xs">
                                            <span className="font-semibold text-controlled-700">{m.author}</span>
                                            {m.role && <span className="text-ink-500">({m.role})</span>}
                                            {m.kind === 'note' && <span className="font-semibold text-attested-700">Internal note</span>}
                                            <span className="text-ink-400">{m.at}</span>
                                        </p>
                                        <p className="whitespace-pre-line text-ink-800">{m.body}</p>
                                        {m.attachments.map((a) => (
                                            <p key={a.name} className="mt-2 inline-flex items-center gap-1 rounded border border-parchment-400 bg-white px-2 py-1 text-xs">
                                                <Paperclip className="size-3.5" aria-hidden="true" />
                                                {a.href ? <Link href={a.href}>{a.name}</Link> : a.name} · {a.size}
                                            </p>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ol>
                        <form
                            className="border-t border-parchment-300 p-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                reply.post(`/portal/messages/${active.id}`, { preserveScroll: true, forceFormData: true, onSuccess: () => reply.reset() });
                            }}
                        >
                            <div role="tablist" className="mb-2 flex gap-3 text-xs">
                                {[
                                    ['reply', 'Reply'],
                                    ['note', 'Internal Note'],
                                ].map(([k, l]) => (
                                    <button key={k} type="button" role="tab" aria-selected={reply.data.kind === k} onClick={() => reply.setData('kind', k)} className={cn('border-b-2 pb-1 font-semibold', reply.data.kind === k ? 'border-gold-500 text-gold-800' : 'border-transparent text-ink-500')}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                            <label htmlFor="msg" className="sr-only">
                                Message
                            </label>
                            <textarea id="msg" value={reply.data.body} onChange={(e) => reply.setData('body', e.target.value)} placeholder="Type your secure message…" className="min-h-20 w-full rounded-[4px] border border-parchment-500 p-2.5 text-sm focus:border-gold-500 focus:outline-none" />
                            {reply.errors.body && <p className="text-xs text-risk-600">{reply.errors.body}</p>}
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                <input type="file" aria-label="Attach file" className="text-xs" onChange={(e) => reply.setData('file', e.target.files?.[0] ?? null)} />
                                <Button type="submit" size="sm" disabled={reply.processing}>
                                    <Lock className="size-4" aria-hidden="true" /> Send Securely <Send className="size-4" aria-hidden="true" />
                                </Button>
                            </div>
                            <p className="mt-2 text-[0.6875rem] text-ink-500">Messages are encrypted in transit and at rest.</p>
                        </form>
                    </section>
                ) : (
                    <Panel title="No conversation selected">
                        <p className="text-sm text-ink-500">Start a new secure message to the TBCA team.</p>
                    </Panel>
                )}

                {active && (
                    <aside className="space-y-4 lg:col-span-2 xl:col-span-1">
                        <Panel title="Conversation Details">
                            <dl className="space-y-1.5 text-[0.8125rem]">
                                {[
                                    ['Engagement', active.reference],
                                    ['Project', active.project ?? '—'],
                                    ['Purpose', active.purpose ?? '—'],
                                    ['Owner', active.owner ?? '—'],
                                    ['Participants', String(active.participants.length)],
                                    ['Started On', active.started],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between gap-2">
                                        <dt className="text-ink-500">{k}</dt>
                                        <dd className="text-right font-medium">{v}</dd>
                                    </div>
                                ))}
                            </dl>
                        </Panel>
                        <Panel title="Quick Actions">
                            <ul className="space-y-1.5 text-[0.8125rem] text-controlled-700">
                                <li><Link href="/portal/documents">Attach from Document Library</Link></li>
                                <li><Link href="/portal/meetings">Schedule a Meeting</Link></li>
                                <li><Link href="/portal/tasks">Create Task</Link></li>
                                <li><Link href="/portal/approvals">Request Approval</Link></li>
                            </ul>
                        </Panel>
                    </aside>
                )}
            </div>

            <Modal open={composeOpen} onClose={() => setComposeOpen(false)} title="New Secure Message">
                <form
                    className="space-y-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        compose.post('/portal/messages', { onSuccess: () => setComposeOpen(false) });
                    }}
                >
                    <Field label="Subject" required error={compose.errors.title}>
                        {(id) => <Input id={id} value={compose.data.title} onChange={(e) => compose.setData('title', e.target.value)} />}
                    </Field>
                    <Field label="Message" required error={compose.errors.body}>
                        {(id) => <Textarea id={id} value={compose.data.body} onChange={(e) => compose.setData('body', e.target.value)} />}
                    </Field>
                    <div className="flex justify-end">
                        <Button type="submit" size="sm" disabled={compose.processing}>
                            Send Securely
                        </Button>
                    </div>
                </form>
            </Modal>
        </PortalShell>
    );
}

Messages.layout = null;
