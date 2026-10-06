import { Head, Link, router, useForm } from '@inertiajs/react';
import { Paperclip, Send } from 'lucide-react';
import PortalShell from '@/Components/Portal/PortalShell';
import { Button } from '@/Components/ui/Button';
import { Panel, StatusPill } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';

interface Msg {
    id: number;
    author: string;
    role: string | null;
    staff: boolean;
    kind: string;
    body: string;
    attachments: { name: string; size: string; href?: string }[];
    at: string;
}

interface Props {
    ticket: {
        reference: string;
        subject: string;
        status: string;
        priority: string;
        category: string;
        area: string | null;
        submitted: string;
        updated: string;
        team: string;
        assignee: string | null;
        sla: { due: string | null; in: string | null; breached: boolean } | null;
        escalation: { level: string; who: string; target: string };
        canEscalate: boolean;
        channel: string;
        project: string | null;
        source: string;
        requester: string;
        organisation: string;
        messages: Msg[];
        closed: boolean;
    };
}

/** CP-SCR-073 Support Ticket Detail: threaded conversation, SLA, escalation and closure. */
export default function Ticket({ ticket: t }: Props) {
    const form = useForm<{ body: string; file: File | null }>({ body: '', file: null });

    const meta: [string, React.ReactNode][] = [
        ['Ticket ID', <span className="font-mono">{t.reference}</span>],
        ['Status', <StatusPill status={t.status} />],
        ['Priority', <StatusPill status={t.priority} />],
        ['Category', t.category],
        ['Submitted On', t.submitted],
        ['Last Updated', t.updated],
        ['Assigned Team', t.team],
        ['SLA / Next Response', t.sla ? <span className={cn('font-semibold', t.sla.breached ? 'text-risk-600' : 'text-attested-600')}>{t.sla.breached ? 'Breached' : t.sla.in}</span> : '—'],
    ];

    return (
        <PortalShell
            title="Support Ticket Detail"
            icon="life-buoy"
            code={t.reference}
            subtitle="Track progress, share information and see the full support history for this case."
            crumbs={[{ label: 'Support Tickets', href: '/portal/support' }, { label: t.reference }]}
            actions={
                <Link href="/portal/support" className="rounded-[4px] border border-parchment-500 bg-white px-3 py-1.5 text-[0.8125rem] hover:border-gold-500">
                    Back to Tickets
                </Link>
            }
        >
            <Head title={`Ticket ${t.reference}`} />
            <div className="mb-5 grid grid-cols-2 gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 text-[0.8125rem] sm:grid-cols-4 lg:grid-cols-8">
                {meta.map(([k, v]) => (
                    <div key={k}>
                        <p className="text-[0.6875rem] text-ink-500">{k}</p>
                        <div className="mt-0.5 font-medium text-ink-900">{v}</div>
                    </div>
                ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="min-w-0 space-y-5">
                    <Panel title="Conversation & Updates">
                        <h2 className="mb-3 text-base font-semibold text-ink-900">{t.subject}</h2>
                        <ol className="space-y-4">
                            {t.messages.map((m) => (
                                <li key={m.id} className={cn('flex gap-3', m.kind === 'system' && 'opacity-80')}>
                                    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold', m.staff ? 'bg-ink-900 text-gold-300' : 'bg-gold-100 text-gold-800')} aria-hidden="true">
                                        {m.author.split(/\s+/).map((p) => p[0]).slice(0, 2).join('')}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="flex flex-wrap items-center gap-2 text-[0.8125rem]">
                                            <span className="font-semibold text-ink-900">{m.author}</span>
                                            {m.role && <span className="rounded-full bg-parchment-300 px-2 py-0.5 text-[0.625rem]">{m.role}</span>}
                                            <span className="ml-auto text-xs text-ink-400">{m.at}</span>
                                        </p>
                                        <p className={cn('mt-1 text-sm whitespace-pre-line', m.kind === 'system' ? 'text-ink-500 italic' : 'text-ink-700')}>{m.body}</p>
                                        {m.attachments.map((a) => (
                                            <p key={a.name} className="mt-1 inline-flex items-center gap-1 text-xs text-controlled-700">
                                                <Paperclip className="size-3.5" aria-hidden="true" />
                                                {a.href ? <Link href={a.href}>{a.name}</Link> : a.name} ({a.size})
                                            </p>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </Panel>

                    <Panel title={t.closed ? 'Reopen with an Update' : 'Add an Update / Reply'}>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.post(`/portal/support/${t.reference}/reply`, { preserveScroll: true, forceFormData: true, onSuccess: () => form.reset() });
                            }}
                            className="space-y-3"
                        >
                            <label htmlFor="reply" className="sr-only">
                                Your message
                            </label>
                            <textarea
                                id="reply"
                                value={form.data.body}
                                onChange={(e) => form.setData('body', e.target.value)}
                                placeholder="Type your message here…"
                                className="min-h-24 w-full rounded-[4px] border border-parchment-500 p-3 text-sm focus:border-gold-500 focus:outline-none"
                            />
                            {form.errors.body && <p className="text-xs text-risk-600">{form.errors.body}</p>}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-ink-600">
                                    <Paperclip className="size-4" aria-hidden="true" />
                                    <input type="file" className="text-xs" onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)} />
                                </label>
                                <Button type="submit" size="sm" disabled={form.processing}>
                                    <Send className="size-4" aria-hidden="true" /> Send Update
                                </Button>
                            </div>
                            <p className="text-[0.6875rem] text-ink-500">Max file size 50 MB. Allowed types: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG. All communications are securely recorded and visible to the assigned support team.</p>
                        </form>
                    </Panel>
                </div>

                <aside className="space-y-4">
                    <Panel title="Ticket Overview">
                        <dl className="space-y-1.5 text-[0.8125rem]">
                            {[
                                ['Requester', t.requester],
                                ['Organisation', t.organisation],
                                ['Affected Area', t.area ?? '—'],
                                ['Related Project', t.project ?? '—'],
                                ['Escalation Level', `${t.escalation.level} – ${t.escalation.who}`],
                                ['Preferred Contact Channel', t.channel],
                                ['Source', t.source],
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-2">
                                    <dt className="text-ink-500">{k}</dt>
                                    <dd className="text-right font-medium text-ink-900">{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </Panel>
                    <Panel title="Quick Actions">
                        <div className="space-y-2">
                            {t.canEscalate && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => {
                                        const reason = window.prompt('Why are you escalating this ticket?');
                                        if (reason !== null) router.post(`/portal/support/${t.reference}/escalate`, { reason }, { preserveScroll: true });
                                    }}
                                >
                                    Escalate Ticket (target {t.escalation.target})
                                </Button>
                            )}
                            <Link href="/portal/meetings" className="block rounded-[4px] border border-parchment-500 px-3 py-2 text-center text-[0.8125rem] hover:border-gold-500">
                                Schedule Support Call
                            </Link>
                            <Link href="/portal/help" className="block rounded-[4px] border border-parchment-500 px-3 py-2 text-center text-[0.8125rem] hover:border-gold-500">
                                View Knowledge Base
                            </Link>
                            {!t.closed && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full !border-risk-500/40 !text-risk-700"
                                    onClick={() => window.confirm('Close this ticket?') && router.post(`/portal/support/${t.reference}/close`, {}, { preserveScroll: true })}
                                >
                                    Close Ticket Request
                                </Button>
                            )}
                        </div>
                    </Panel>
                    <Panel title="Ask KAREN">
                        <p className="text-xs text-ink-600">Your AI assistant can explain this ticket and suggest next steps.</p>
                        <Link href="/portal/natasha" className="mt-2 block rounded-[4px] bg-ink-900 px-3 py-2 text-center text-[0.8125rem] text-parchment-100 hover:bg-ink-800">
                            Chat with KAREN
                        </Link>
                    </Panel>
                </aside>
            </div>
        </PortalShell>
    );
}

Ticket.layout = null;
