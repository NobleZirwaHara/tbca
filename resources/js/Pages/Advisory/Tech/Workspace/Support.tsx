import { Head, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { SimpleTable, StatusPill, Tabs } from '@/Components/ui/Kit';
import { TechPortal } from '@/Components/Advisory/shells';
import { Card, Stat, zar } from '@/Components/Advisory/ui';
import type { TechHeader } from '@/types/advisory';

interface Ticket { reference: string; subject: string; category: string; priority: string; status: string; related_to: string | null; amount_zar: number | null; assigned_to: string; created_at: string; updated_at: string }
interface Props { engagement: TechHeader; tickets: Ticket[]; disputes: Ticket[]; kpis: { open: number; progress: number; awaiting: number; resolved: number }; invoices: string[] }

const d = (s: string) => new Date(s).toLocaleString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function Support({ engagement: e, tickets, disputes, kpis, invoices }: Props) {
    const [tab, setTab] = useState('tickets');
    const form = useForm({ kind: 'ticket', subject: '', category: 'Billing Query', priority: 'Medium', related_to: invoices[0] ?? '', amount: '', details: '' });
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(`/technology-solutions/workspace/${e.reference}/tickets`, { preserveScroll: true, onSuccess: () => form.reset('subject', 'details', 'amount') }); };
    const dispute = form.data.kind === 'dispute';
    return (
        <TechPortal e={e} title="Support & Disputes" description="Get help, raise issues, or submit disputes related to your engagement.">
            <Head title="Support & Disputes" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Stat label="Open Tickets" value={kpis.open} sub="Requiring attention" />
                <Stat label="In Progress" value={kpis.progress} sub="Being worked on" />
                <Stat label="Awaiting Your Response" value={kpis.awaiting} sub="Action required" tone={kpis.awaiting ? 'warn' : 'neutral'} />
                <Stat label="Resolved" value={kpis.resolved} sub="Successfully resolved" tone="good" />
                <Stat label="Dispute SLA" value="5 business days" />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-8">
                    <Tabs tabs={[{ key: 'tickets', label: 'Support Tickets', count: tickets.length }, { key: 'disputes', label: 'Disputes', count: disputes.length }, { key: 'new', label: 'Raise a Ticket / Dispute' }]} value={tab} onChange={setTab} />
                    <div className="mt-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                        {tab === 'tickets' && <SimpleTable columns={['Ticket ID', 'Subject', 'Category', 'Priority', 'Status', 'Raised On', 'Updated', 'Assigned To']} rows={tickets.map((t) => [<span className="font-mono">{t.reference}</span>, t.subject, t.category, <StatusPill status={t.priority} />, <StatusPill status={t.status} />, d(t.created_at), d(t.updated_at), t.assigned_to])} empty="No tickets yet." />}
                        {tab === 'disputes' && <SimpleTable columns={['Dispute ID', 'Related To', 'Reason', 'Amount', 'Status', 'Raised On', 'Updated']} rows={disputes.map((t) => [<span className="font-mono">{t.reference}</span>, t.related_to, t.subject, zar(t.amount_zar ?? 0), <StatusPill status={t.status} />, d(t.created_at), d(t.updated_at)])} empty="No disputes raised." />}
                        {tab === 'new' && (
                            <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
                                <Field label="Type">{(id) => <Select id={id} value={form.data.kind} onChange={(x) => form.setData('kind', x.target.value)} options={[{ value: 'ticket', label: 'Support ticket' }, { value: 'dispute', label: 'Dispute a charge or invoice' }]} />}</Field>
                                <Field label="Subject" required error={form.errors.subject}>{(id) => <Input id={id} value={form.data.subject} onChange={(x) => form.setData('subject', x.target.value)} />}</Field>
                                {dispute ? (
                                    <>
                                        <Field label="Related invoice" required error={form.errors.related_to}>{(id) => <Select id={id} value={form.data.related_to} onChange={(x) => form.setData('related_to', x.target.value)} placeholder="Select invoice" options={invoices.map((i) => ({ value: `Invoice ${i}`, label: i }))} />}</Field>
                                        <Field label="Disputed amount (ZAR)" required error={form.errors.amount}>{(id) => <Input id={id} type="number" min={1} value={form.data.amount} onChange={(x) => form.setData('amount', x.target.value)} />}</Field>
                                    </>
                                ) : (
                                    <>
                                        <Field label="Category" error={form.errors.category}>{(id) => <Select id={id} value={form.data.category} onChange={(x) => form.setData('category', x.target.value)} options={['Billing Query', 'Technical Support', 'Account Management']} />}</Field>
                                        <Field label="Priority" error={form.errors.priority}>{(id) => <Select id={id} value={form.data.priority} onChange={(x) => form.setData('priority', x.target.value)} options={['Low', 'Medium', 'High']} />}</Field>
                                    </>
                                )}
                                <Field label="Details" required error={form.errors.details} className="sm:col-span-2">{(id) => <Textarea id={id} value={form.data.details} onChange={(x) => form.setData('details', x.target.value)} />}</Field>
                                <Button type="submit" disabled={form.processing} className="sm:col-span-2">{dispute ? 'Raise Dispute' : 'Raise Support Ticket'}</Button>
                                {dispute && <p className="text-xs text-ink-500 sm:col-span-2">Refunds and credits are linked to the original transaction. An approved-but-unstarted gate can be fully reversed where no cost was incurred.</p>}
                            </form>
                        )}
                    </div>
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="Contact Support">
                        <ul className="space-y-2 text-xs"><li className="flex gap-2"><MessageCircle className="size-4 text-verified-500" /><span><b>WhatsApp Support</b><br />+27 60 801 1365 (Mon – Fri: 08:00 – 17:00)</span></li><li className="flex gap-2"><Mail className="size-4 text-controlled-500" /><span><b>Email Support</b><br />support@thebusinessclinic.africa (within 4 business hours)</span></li><li className="flex gap-2"><Phone className="size-4 text-gold-600" /><span><b>Call Support</b><br />+27 60 801 1365</span></li></ul>
                    </Card>
                    <Card title="Quick Actions"><div className="grid gap-2"><Button size="sm" variant="outline" onClick={() => { form.setData('kind', 'ticket'); setTab('new'); }}>Raise a Support Ticket</Button><Button size="sm" variant="outline" onClick={() => { form.setData('kind', 'dispute'); setTab('new'); }}>Raise a Dispute</Button><Button size="sm" variant="ghost" onClick={() => window.print()}>Download Engagement Summary</Button></div></Card>
                    <Card title="Service Commitment" tone="gold"><p className="text-xs">We aim to resolve all issues fairly, quickly and transparently.</p></Card>
                </aside>
            </div>
        </TechPortal>
    );
}

Support.layout = null;
