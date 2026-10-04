import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { FileText, Inbox, Plus, Trash2, Users } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Textarea } from '@/Components/ui/Form';
import { Modal, SimpleTable, StatusPill, Tabs } from '@/Components/ui/Kit';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, Kpi, KpiGrid, fmtDate, fmtZar } from '@/Components/Shop/AdminKit';

interface Line { description: string; quantity: number; unit_zar: number }
interface Request { reference: string; type: string; section: string | null; subject: string | null; name: string | null; email: string | null; status: string; created_at: string | null; payload: Record<string, unknown> | null; quote: string | null }
interface Quote { reference: string; title: string; provider: string | null; version: number; status: string; lines: Line[]; client_note: string | null; valid_until: string | null; totals: { subtotal: number; vat: number; total: number } }
interface Proposal { id: number; reference: string; status: string; estimate: number | null; contact: string | null; email: string | null; scope: string; allowance: string | number | null; submitted_at: string | null }
interface Props { tab: string; requests: Request[]; quotes: Quote[]; proposals: Proposal[]; counts: Record<string, number> }

function LinesEditor({ lines, onChange }: { lines: Line[]; onChange: (l: Line[]) => void }) {
    const set = (i: number, patch: Partial<Line>) => onChange(lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));
    return (
        <div className="space-y-2">
            {lines.map((l, i) => (
                <div key={i} className="grid grid-cols-[1fr_4rem_7rem_auto] gap-2">
                    <Input aria-label="Description" value={l.description} onChange={(e) => set(i, { description: e.target.value })} placeholder="Description" />
                    <Input aria-label="Quantity" type="number" min={1} value={l.quantity} onChange={(e) => set(i, { quantity: Number(e.target.value) })} />
                    <Input aria-label="Unit price (ZAR)" type="number" min={1} value={l.unit_zar} onChange={(e) => set(i, { unit_zar: Number(e.target.value) })} />
                    <button type="button" aria-label="Remove line" onClick={() => onChange(lines.filter((_, j) => j !== i))}><Trash2 className="size-4 text-risk-500" /></button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => onChange([...lines, { description: '', quantity: 1, unit_zar: 1000 }])}><Plus className="size-4" /> Add line</Button>
            <p className="text-right text-xs text-ink-500">Subtotal {fmtZar(lines.reduce((s, l) => s + l.quantity * l.unit_zar, 0))} excl. VAT</p>
        </div>
    );
}

function IssueModal({ request, onClose }: { request: Request; onClose: () => void }) {
    const form = useForm({ provider: 'TBCA Advisory', valid_days: 14, lines: [{ description: request.subject ?? 'Engagement', quantity: 1, unit_zar: 25000 }] as Line[], deliverables: '', note: '' });
    const e = form.errors as Record<string, string | undefined>;
    return (
        <Modal open onClose={onClose} size="lg" title={`Issue quote for ${request.reference}`} footer={<Button type="button" size="sm" disabled={form.processing} onClick={() => form.post(`/admin/shop/quotes/issue/${request.reference}`, { preserveScroll: true, onSuccess: onClose })}>Issue Quote v1</Button>}>
            <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Provider" error={e.provider} required>{(id) => <Input id={id} value={form.data.provider} onChange={(x) => form.setData('provider', x.target.value)} />}</Field>
                    <Field label="Valid for (days)" error={e.valid_days} required>{(id) => <Input id={id} type="number" value={form.data.valid_days} onChange={(x) => form.setData('valid_days', Number(x.target.value))} />}</Field>
                </div>
                <LinesEditor lines={form.data.lines} onChange={(l) => form.setData('lines', l)} />
                {Object.entries(e).filter(([k]) => k.startsWith('lines')).slice(0, 1).map(([k, v]) => <p key={k} className="text-xs text-risk-500">{v}</p>)}
                <Field label="Deliverables (one per line)" error={e.deliverables}>{(id) => <Textarea id={id} value={form.data.deliverables} onChange={(x) => form.setData('deliverables', x.target.value)} />}</Field>
                <Field label="Note to client" error={e.note}>{(id) => <Textarea id={id} value={form.data.note} onChange={(x) => form.setData('note', x.target.value)} />}</Field>
            </div>
        </Modal>
    );
}

function ReissueModal({ quote, onClose }: { quote: Quote; onClose: () => void }) {
    const form = useForm({ lines: quote.lines, valid_days: 14 });
    return (
        <Modal open onClose={onClose} size="lg" title={`Re-issue ${quote.reference} as v${quote.version + 1}`} footer={<Button type="button" size="sm" disabled={form.processing} onClick={() => form.post(`/admin/shop/quotes/${quote.reference}/reissue`, { preserveScroll: true, onSuccess: onClose })}>Re-issue</Button>}>
            {quote.client_note && <p className="mb-3 rounded bg-attested-50 p-2 text-xs text-attested-700">Client note: {quote.client_note}</p>}
            <LinesEditor lines={form.data.lines} onChange={(l) => form.setData('lines', l)} />
        </Modal>
    );
}

function QuotesConsole({ tab: initial, requests, quotes, proposals, counts }: Props) {
    const [tab, setTab] = useState(initial);
    const [issuing, setIssuing] = useState<Request | null>(null);
    const [reissuing, setReissuing] = useState<Quote | null>(null);

    return (
        <AdminShell title="Quotes & Proposals" description="Quote requests, issued versioned quotes and retainer proposal requests (A4/A6 request objects).">
            <KpiGrid cols={4}>
                <Kpi icon={<Inbox className="size-5" />} tone="warn" label="Open requests" value={counts.requests} />
                <Kpi icon={<FileText className="size-5" />} tone="info" label="Quotes awaiting client" value={counts.quotes} />
                <Kpi icon={<Users className="size-5" />} tone="good" label="Retainer proposals in review" value={counts.proposals} />
                <Kpi icon={<FileText className="size-5" />} label="Quotes issued (all)" value={quotes.length} />
            </KpiGrid>
            <Tabs tabs={[{ key: 'requests', label: 'Requests', count: requests.length }, { key: 'quotes', label: 'Issued Quotes', count: quotes.length }, { key: 'proposals', label: 'Retainer Proposals', count: proposals.length }]} value={tab} onChange={(k) => { setTab(k); router.get('/admin/shop/quotes', { tab: k }, { preserveState: true, replace: true, preserveScroll: true }); }} />
            {tab === 'requests' && (
                <SimpleTable columns={['Reference', 'Type', 'Subject', 'Requester', 'Received', 'Status', 'Quote', 'Actions']} rows={requests.map((r) => [
                    <span key="r" className="font-mono text-xs">{r.reference}</span>, r.type.replace('-', ' '), <span key="s">{r.subject}<span className="block text-[0.6875rem] text-ink-400">{String(r.payload?.budget ?? r.payload?.indicative_zar ?? '')}</span></span>,
                    <span key="n">{r.name}<span className="block text-[0.6875rem] text-ink-400">{r.email}</span></span>, fmtDate(r.created_at, true), <StatusPill key="st" status={r.status} />,
                    r.quote ? <Link key="q" href={`/shop/quote/${r.quote}`} className="font-mono text-xs text-controlled-700 underline">{r.quote}</Link> : '-',
                    <div key="a" className="flex flex-wrap gap-1">
                        {r.type === 'quote-request' && !r.quote && r.status !== 'closed' && <button type="button" onClick={() => setIssuing(r)} className="inline-flex h-8 items-center rounded-[4px] border border-verified-700 bg-verified-700 px-2.5 text-xs font-semibold text-white">Issue quote</button>}
                        {r.status === 'received' && <ActionButton href={`/admin/shop/quotes/submissions/${r.reference}/status`} data={{ status: 'in_review' }}>In review</ActionButton>}
                        {r.status !== 'closed' && <ActionButton href={`/admin/shop/quotes/submissions/${r.reference}/status`} data={{ status: 'closed' }} tone="bad">Close</ActionButton>}
                    </div>,
                ])} />
            )}
            {tab === 'quotes' && (
                <SimpleTable columns={['Quote', 'Title', 'Provider', 'Version', 'Valid until', 'Total (incl. VAT)', 'Status', 'Actions']} rows={quotes.map((q) => [
                    <Link key="r" href={`/shop/quote/${q.reference}`} className="font-mono text-xs text-controlled-700 underline">{q.reference}</Link>, q.title, q.provider, `v${q.version}`, fmtDate(q.valid_until), fmtZar(q.totals.total), <StatusPill key="s" status={q.status} />,
                    q.status !== 'accepted' ? <button key="a" type="button" onClick={() => setReissuing(q)} className="rounded-[4px] border border-parchment-500 px-2.5 py-1 text-xs font-semibold">Re-issue</button> : '-',
                ])} />
            )}
            {tab === 'proposals' && (
                <SimpleTable columns={['Reference', 'Contact', 'Scope', 'Allowance', 'Estimate / month', 'Submitted', 'Status', 'Actions']} rows={proposals.map((p) => [
                    <span key="r" className="font-mono text-xs">{p.reference}</span>, <span key="c">{p.contact}<span className="block text-[0.6875rem] text-ink-400">{p.email}</span></span>, <span key="s" className="text-xs">{p.scope}</span>, p.allowance ?? '-', fmtZar(p.estimate), fmtDate(p.submitted_at), <StatusPill key="st" status={p.status} />,
                    <div key="a" className="flex flex-wrap gap-1">
                        {p.status === 'submitted' && <ActionButton href={`/admin/shop/quotes/proposals/${p.reference}/status`} data={{ status: 'capacity_review' }}>Capacity review</ActionButton>}
                        {p.status === 'capacity_review' && <ActionButton href={`/admin/shop/quotes/proposals/${p.reference}/status`} data={{ status: 'proposal_issued' }} tone="good">Issue proposal</ActionButton>}
                        {p.status === 'proposal_issued' && <ActionButton href={`/admin/shop/quotes/proposals/${p.reference}/status`} data={{ status: 'accepted' }} tone="good">Mark accepted</ActionButton>}
                        {['submitted', 'capacity_review', 'proposal_issued'].includes(p.status) && <ActionButton href={`/admin/shop/quotes/proposals/${p.reference}/status`} data={{ status: 'declined' }} tone="bad">Decline</ActionButton>}
                    </div>,
                ])} />
            )}
            {issuing && <IssueModal request={issuing} onClose={() => setIssuing(null)} />}
            {reissuing && <ReissueModal quote={reissuing} onClose={() => setReissuing(null)} />}
        </AdminShell>
    );
}

QuotesConsole.layout = null;
export default QuotesConsole;
