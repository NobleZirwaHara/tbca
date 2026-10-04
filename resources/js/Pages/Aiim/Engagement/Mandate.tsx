import { useForm } from '@inertiajs/react';
import { Bot, Check, CheckCircle2, Download, FolderOpen, LayoutDashboard, ListChecks, MessageSquare, Pencil, Receipt, Send, Wallet } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Chip, levelTone } from '@/Components/Aiim/Chips';
import { MandateFrame } from '@/Components/Aiim/EngagementKit';
import { zar2 } from '@/Components/Aiim/format';
import { SectionCard } from '@/Components/Aiim/Shell';
import { Textarea } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { cn } from '@/lib/cn';
import type { AiimPageProps, Engagement } from '@/types/aiim';

const MENU: [string, typeof LayoutDashboard][] = [['Overview', LayoutDashboard], ['Workplan & Milestones', ListChecks], ['Evidence Library', FolderOpen], ['Draft Outputs', Pencil], ['Messages', MessageSquare], ['Change Requests', Receipt], ['Payments', Wallet]];

/** P49 — Custom Intelligence / Mandate workspace. */
export default function Mandate({ engagement: e }: AiimPageProps & { engagement: Engagement }) {
    const [menu, setMenu] = useState('Overview');
    const [msg, setMsg] = useState(false);
    const form = useForm({ message: '' });
    const send = (ev: FormEvent) => { ev.preventDefault(); form.post(`/aiim/workspace/engagements/${e.reference}/message`, { onSuccess: () => { form.reset(); setMsg(false); } }); };
    const wp = e.workplan ?? [];
    const messages = (e.events ?? []).filter((x) => x.action.includes('Message'));
    const r = e.reference;

    return (
        <MandateFrame
            e={e}
            title="Custom Intelligence Workspace"
            description={`Mandate: ${e.title}. Your custom intelligence work is in progress. Track progress, collaborate with your advisor and access deliverables as they are completed.`}
            guidance={e.status === 'paused' ? 'This mandate is paused. Restart it when you are ready — all work is retained.' : 'Your engagement is live and work is underway.'}
            stage={e.stage ?? 'Research & Analysis'}
            footer={
                <>
                    <p className="text-xs text-ink-600">Need to adjust the scope or discuss progress? Contact your advisor or raise a change request.</p>
                    <div className="flex flex-wrap gap-2">
                        <ButtonLink href={`/aiim/workspace/engagements/${r}/change`} size="sm" variant="outline">Request Scope Change</ButtonLink>
                        <Button type="button" size="sm" variant="outline" onClick={() => setMsg(true)}><MessageSquare className="size-4" />Message Advisor</Button>
                        {e.status === 'paused' ? <ButtonLink href={`/aiim/workspace/engagements/${r}/restart`} size="sm">Restart Mandate</ButtonLink> : <ButtonLink href={`/aiim/workspace/engagements/${r}/pause`} size="sm" variant="outline">Pause Mandate</ButtonLink>}
                        {e.status === 'delivered' && <ButtonLink href={`/aiim/workspace/engagements/${r}/delivery`} size="sm">Review Delivery</ButtonLink>}
                    </div>
                </>
            }
        >
            <div className="grid gap-4 lg:grid-cols-[13rem_minmax(0,1fr)_15rem]">
                <nav className="rounded-[8px] bg-ink-950 p-3 text-parchment-100" aria-label="Workspace menu">
                    <p className="mb-2 text-sm font-semibold">Workspace Menu</p>
                    <ul className="space-y-1">{MENU.map(([l, I]) => <li key={l}><button type="button" onClick={() => setMenu(l)} aria-current={menu === l} className={cn('flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs', menu === l ? 'bg-gold-500/20 text-gold-300' : 'hover:bg-ink-800')}><I className="size-4" />{l}{l === 'Messages' && messages.length > 0 && <span className="ml-auto rounded-full bg-referenced-500 px-1.5 text-[0.6rem]">{messages.length}</span>}</button></li>)}</ul>
                </nav>
                <div className="space-y-4">
                    {(menu === 'Overview' || menu === 'Workplan & Milestones') && (
                        <SectionCard title="Work Progress">
                            <ol className="grid gap-2 sm:grid-cols-5">
                                {wp.map((w, i) => (
                                    <li key={w.key} className="text-center text-xs">
                                        <span className={cn('mx-auto flex size-8 items-center justify-center rounded-full border-2 font-bold', w.status === 'completed' ? 'border-verified-500 bg-verified-500 text-white' : w.status === 'in_progress' ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-parchment-500')}>{w.status === 'completed' ? <Check className="size-4" /> : i + 1}</span>
                                        <p className="mt-1 font-semibold">{w.label}</p>
                                        <p className={w.status === 'in_progress' ? 'text-gold-700' : 'text-ink-500'}>{w.status === 'completed' ? 'Completed' : w.status === 'in_progress' ? 'In Progress' : 'Pending'}</p>
                                        <p className="text-ink-400">{w.date}</p>
                                    </li>
                                ))}
                            </ol>
                        </SectionCard>
                    )}
                    {(menu === 'Overview' || menu === 'Draft Outputs' || menu === 'Evidence Library') && (
                        <div className="grid gap-4 md:grid-cols-2">
                            <SectionCard title="Current Activities">
                                <ul className="space-y-1.5 text-xs">{(e.events ?? []).slice(0, 6).map((ev, i) => <li key={i} className="flex justify-between gap-2"><span className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-verified-500" />{ev.action}{ev.note ? ` — ${ev.note}` : ''}</span><span className="shrink-0 text-ink-400">{ev.at}</span></li>)}</ul>
                            </SectionCard>
                            <SectionCard title="Key Deliverables">
                                <ul className="space-y-1.5 text-xs">{(e.deliverables ?? []).map((d) => <li key={d.name} className="flex items-center justify-between gap-2"><span><strong className="block">{d.name}</strong>{d.format}{d.size ? ` · ${d.size}` : ' · Pending'}</span><span className="flex items-center gap-2"><Chip tone={levelTone(d.status)}>{d.status.replace('_', ' ')}</Chip><button type="button" disabled={d.status !== 'completed'} onClick={() => window.print()} aria-label={`Download ${d.name}`} className="disabled:opacity-30"><Download className="size-4" /></button></span></li>)}</ul>
                            </SectionCard>
                        </div>
                    )}
                    {menu === 'Messages' && (
                        <SectionCard title="Messages" action={<Button type="button" size="sm" onClick={() => setMsg(true)}>New Message</Button>}>
                            <ul className="space-y-2 text-xs">{messages.map((m, i) => <li key={i} className="rounded border border-parchment-300 p-2"><p className="text-ink-400">{m.at} · {m.actor}</p><p>{m.note}</p></li>)}{messages.length === 0 && <li className="text-ink-500">No messages yet.</li>}</ul>
                        </SectionCard>
                    )}
                    {menu === 'Change Requests' && <SectionCard title="Change Requests"><p className="text-sm text-ink-600">Scope changes go through the G6 scope-change gate with fee and timeline impact.</p><ButtonLink href={`/aiim/workspace/engagements/${r}/change`} size="sm" className="mt-3">Open Scope Change</ButtonLink></SectionCard>}
                    {menu === 'Payments' && (
                        <SectionCard title="Payments">
                            <dl className="space-y-1 text-sm"><div className="flex justify-between"><dt>Total Fee (incl. VAT)</dt><dd className="font-semibold">{zar2(e.feeTotal)}</dd></div><div className="flex justify-between"><dt>Deposit Paid</dt><dd>{e.depositPaid ? zar2(e.deposit * 1.15) : '—'}</dd></div><div className="flex justify-between"><dt>Balance Due on Delivery</dt><dd>{zar2(e.feeTotal - (e.depositPaid ? e.deposit * 1.15 : 0))}</dd></div></dl>
                            <ButtonLink href={`/aiim/workspace/engagements/${r}/ledger`} size="sm" variant="outline" className="mt-3">Transaction Ledger</ButtonLink>
                        </SectionCard>
                    )}
                </div>
                <aside className="space-y-4">
                    <SectionCard title={<span className="flex items-center gap-1.5"><Bot className="size-4 text-referenced-500" />AIIM Intelligence Assistant</span>} className="bg-referenced-50">
                        <p className="text-xs text-ink-600">Your AI research assistant is working with human experts to deliver your custom intelligence.</p>
                        <ul className="mt-2 space-y-1 text-xs">{['Scanning latest market data', 'Analysing policy and regulatory updates', 'Benchmarking regional opportunities', 'Validating sources and evidence'].map((t) => <li key={t} className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-verified-500" />{t}</li>)}</ul>
                        <p className="mt-2 rounded border border-referenced-500/30 py-1 text-center text-[0.65rem] tracking-wide text-referenced-700">SYNTHETIC DATA ONLY</p>
                    </SectionCard>
                    <SectionCard title="Commercials">
                        <dl className="space-y-1 text-xs"><div className="flex justify-between"><dt>Total Fee (incl. VAT)</dt><dd className="font-semibold">{zar2(e.feeTotal)}</dd></div><div className="flex justify-between"><dt>Deposit Paid ({e.quote?.deposit_percent ?? 50}%)</dt><dd>{e.depositPaid ? '✓' : '—'}</dd></div><div className="flex justify-between"><dt>End date</dt><dd>{e.end ?? '—'}</dd></div></dl>
                    </SectionCard>
                </aside>
            </div>
            <Modal open={msg} onClose={() => setMsg(false)} title={`Message ${e.advisor?.name ?? 'your advisor'}`}>
                <form onSubmit={send} className="space-y-3">
                    <label htmlFor="msg" className="sr-only">Message</label>
                    <Textarea id="msg" value={form.data.message} onChange={(x) => form.setData('message', x.target.value)} maxLength={1000} />
                    {form.errors.message && <p role="alert" className="text-xs text-risk-500">{form.errors.message}</p>}
                    <Button type="submit" disabled={form.processing} className="w-full"><Send className="size-4" />Send Message</Button>
                </form>
            </Modal>
        </MandateFrame>
    );
}
