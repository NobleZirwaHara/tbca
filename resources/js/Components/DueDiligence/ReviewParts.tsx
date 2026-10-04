import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { CheckCircle2, Circle, Hourglass } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Textarea } from '@/Components/ui/Form';
import { Modal, Progress, StatusPill } from '@/Components/ui/Kit';
import { Card, shortDate } from './Ui';

export interface RequestRow { id: number; reference: string; type: string; title: string; detail: string | null; reason: string | null; requested_by: string; due_at: string | null; status: string; response: string | null; created_at: string }
export interface TaskRow { id: number; title: string; description: string | null; status: string; progress: number; due_at: string | null }

/** Reviewer / partner / QA information requests with an inline response form. */
export function RequestTable({ caseRef, requests, title = 'Information requests' }: { caseRef: string; requests: RequestRow[]; title?: string }) {
    const [active, setActive] = useState<RequestRow | null>(null);
    const form = useForm<{ response: string; file: File | null }>({ response: '', file: null });
    const open = requests.filter((r) => r.status === 'open').length;

    return (
        <Card title={title} action={<span className="rounded bg-attested-50 px-1.5 text-[0.6875rem] font-semibold text-attested-700">{open} Open</span>}>
            {requests.length === 0 ? <p className="text-xs text-ink-500">No requests.</p> : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-xs">
                        <thead className="text-ink-500"><tr><th className="py-1">Request ID</th><th>Requested information</th><th>Reason</th><th>Requested by</th><th>Due date</th><th>Status</th><th /></tr></thead>
                        <tbody className="divide-y divide-parchment-300">
                            {requests.map((r) => {
                                const overdue = r.status === 'open' && r.due_at && new Date(r.due_at) < new Date();
                                return (
                                    <tr key={r.id}>
                                        <td className="py-2 font-mono">{r.reference}</td>
                                        <td><span className="font-medium">{r.title}</span>{r.detail && <span className="block text-ink-500">{r.detail}</span>}{r.response && <span className="block text-verified-700">Response: {r.response}</span>}</td>
                                        <td>{r.reason ?? '—'}</td>
                                        <td>{r.requested_by}</td>
                                        <td className={overdue ? 'text-risk-600' : ''}>{shortDate(r.due_at, true)}</td>
                                        <td><StatusPill status={r.status} /></td>
                                        <td>{r.status === 'open' && <Button type="button" size="sm" variant="outline" onClick={() => { form.reset(); setActive(r); }}>Provide Evidence</Button>}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal open={active !== null} onClose={() => setActive(null)} title={`${active?.reference ?? ''}: ${active?.title ?? ''}`} footer={<Button type="button" disabled={form.processing} onClick={() => active && form.post(`/due-diligence/cases/${caseRef}/requests/${active.id}/respond`, { preserveScroll: true, forceFormData: true, onSuccess: () => setActive(null) })}>Send response</Button>}>
                <div className="space-y-3">
                    <Field label="Response" error={form.errors.response} required>{(id) => <Textarea id={id} value={form.data.response} onChange={(e) => form.setData('response', e.target.value)} />}</Field>
                    <Field label="Attach file (optional)" error={form.errors.file}>{(id) => <input id={id} type="file" className="text-xs" accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx" onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)} />}</Field>
                </div>
            </Modal>
        </Card>
    );
}

export function Timeline({ title, items }: { title: string; items: { label: string; sub?: string; state: 'done' | 'current' | 'pending'; date?: string | null }[] }) {
    return (
        <Card title={title}>
            <ol className="space-y-3">
                {items.map((i) => (
                    <li key={i.label} className="flex gap-2">
                        {i.state === 'done' ? <CheckCircle2 className="size-5 shrink-0 text-verified-500" aria-hidden="true" /> : i.state === 'current' ? <Hourglass className="size-5 shrink-0 text-gold-600" aria-hidden="true" /> : <Circle className="size-5 shrink-0 text-ink-300" aria-hidden="true" />}
                        <div className="flex-1">
                            <p className="text-[0.8125rem] font-semibold">{i.label}</p>
                            <p className="text-xs text-ink-500">{i.sub ?? (i.state === 'pending' ? 'Pending' : i.state === 'current' ? 'In progress' : 'Completed')}</p>
                        </div>
                        {i.date && <span className="text-[0.6875rem] text-ink-400">{shortDate(i.date, true)}</span>}
                    </li>
                ))}
            </ol>
        </Card>
    );
}

export function TaskTable({ tasks, note }: { tasks: TaskRow[]; note?: string }) {
    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-xs">
                    <thead className="text-ink-500"><tr><th className="py-1">Task</th><th>Description</th><th>Status</th><th>Due date</th><th className="w-32">Progress</th></tr></thead>
                    <tbody className="divide-y divide-parchment-300">
                        {tasks.map((t) => (
                            <tr key={t.id}>
                                <td className="py-2 font-semibold">{t.title}</td><td className="text-ink-600">{t.description}</td>
                                <td><StatusPill status={t.status} /></td><td>{shortDate(t.due_at)}</td>
                                <td><div className="flex items-center gap-2"><Progress value={t.progress} tone={t.progress >= 100 ? 'good' : 'gold'} /><span>{t.progress}%</span></div></td>
                            </tr>
                        ))}
                        {tasks.length === 0 && <tr><td colSpan={5} className="py-3 text-ink-500">Tasks are created when this stage starts.</td></tr>}
                    </tbody>
                </table>
            </div>
            {note && <p className="mt-2 text-[0.6875rem] text-ink-500">{note}</p>}
        </div>
    );
}
