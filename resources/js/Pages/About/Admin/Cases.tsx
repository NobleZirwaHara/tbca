import { Link, router, useForm } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import { Panel, StatusPill } from '@/Components/ui/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import AdminShell from '@/Components/About/AdminShell';
import { cn } from '@/lib/cn';

interface CaseRow {
    id: number;
    reference: string;
    name: string;
    email: string;
    organisation: string | null;
    category: string | null;
    subject: string | null;
    message: string | null;
    status: string;
    attachment: string | null;
    details: Record<string, string | null>;
    history: { at: string; status: string; note: string | null }[];
    submitted_at: string;
}
interface Report {
    id: number;
    reference: string;
    category: string;
    subject: string;
    description: string;
    status: string;
    anonymous: boolean;
    relationship: string;
    route: string;
    evidence: string | null;
    reporter: string | null;
    messages: { at: string; from: string; body: string }[];
    submitted_at: string;
}
interface Props {
    type: 'complaint' | 'media' | 'partner' | 'whistleblowing';
    counts: Record<string, number>;
    cases?: CaseRow[];
    reports?: Report[];
    statuses: string[];
}

const tabs = [
    { key: 'complaint', label: 'Complaints' },
    { key: 'media', label: 'Media enquiries' },
    { key: 'partner', label: 'Partner enquiries' },
    { key: 'whistleblowing', label: 'Whistleblowing (restricted)' },
];
const dt = (iso: string) => new Date(iso).toLocaleString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

function CaseCard({ c, statuses }: { c: CaseRow; statuses: string[] }) {
    const form = useForm({ status: c.status, note: '' });
    return (
        <li className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xs font-semibold text-gold-700">{c.reference}</p>
                <StatusPill status={c.status} />
            </div>
            <p className="mt-1 font-semibold text-ink-900">{c.subject}</p>
            <p className="text-xs text-ink-500">{c.name} · {c.email}{c.organisation ? ` · ${c.organisation}` : ''} · {dt(c.submitted_at)}</p>
            {c.message && <p className="mt-2 text-[0.8125rem] text-ink-700">{c.message}</p>}
            <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
                {Object.entries(c.details).filter(([, v]) => v).map(([k, v]) => <div key={k}><dt className="inline capitalize">{k.replace(/_/g, ' ')}:</dt> <dd className="inline text-ink-700">{v}</dd></div>)}
                {c.attachment && <div>Attachment: <span className="text-ink-700">{c.attachment}</span></div>}
            </dl>
            <form onSubmit={(e) => { e.preventDefault(); form.post(`/admin/about/cases/${c.reference}/status`, { preserveScroll: true, onSuccess: () => form.setData('note', '') }); }} className="mt-3 grid gap-2 sm:grid-cols-[10rem_1fr_auto]">
                <Select aria-label="Status" options={statuses} value={form.data.status} onChange={(e) => form.setData('status', e.target.value)} className="h-9 text-xs" />
                <Input aria-label="Note" value={form.data.note} onChange={(e) => form.setData('note', e.target.value)} placeholder="Note shown on the tracking page (optional)" className="h-9 text-xs" />
                <Button type="submit" size="sm" disabled={form.processing}>Update</Button>
            </form>
            {form.errors.status && <p className="mt-1 text-xs text-risk-500">{form.errors.status}</p>}
            <details className="mt-2 text-xs"><summary className="cursor-pointer text-ink-600">History ({c.history.length})</summary>
                <ul className="mt-1 space-y-1 pl-3">{c.history.map((h, i) => <li key={i}><span className="font-semibold capitalize">{h.status}</span> · {dt(h.at)}{h.note && ` — ${h.note}`}</li>)}</ul>
            </details>
        </li>
    );
}

function ReportCard({ r, statuses }: { r: Report; statuses: string[] }) {
    const form = useForm({ status: r.status, message: '' });
    return (
        <li className="rounded-[8px] border border-ink-700 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 font-mono text-xs font-semibold text-ink-800"><Lock className="size-3.5" aria-hidden="true" /> {r.reference}</p>
                <StatusPill status={r.status} />
            </div>
            <p className="mt-1 font-semibold text-ink-900">{r.subject}</p>
            <p className="text-xs text-ink-500">{r.category} · {r.relationship} · {r.anonymous ? 'Anonymous' : `Confidential: ${r.reporter}`} · route: {r.route} · {dt(r.submitted_at)}</p>
            <p className="mt-2 text-[0.8125rem] text-ink-700">{r.description}</p>
            {r.evidence && <p className="mt-1 text-xs text-ink-500">Evidence: {r.evidence}</p>}
            {r.messages.length > 0 && (
                <ul className="mt-2 space-y-1">{r.messages.map((m, i) => <li key={i} className={cn('rounded p-2 text-xs', m.from === 'case_owner' ? 'bg-gold-50' : 'bg-parchment-200')}><span className="font-semibold">{m.from === 'case_owner' ? 'Case owner' : 'Reporter'}</span> · {dt(m.at)}<br />{m.body}</li>)}</ul>
            )}
            <form onSubmit={(e) => { e.preventDefault(); form.post(`/admin/about/whistleblowing/${r.id}`, { preserveScroll: true, onSuccess: () => form.setData('message', '') }); }} className="mt-3 grid gap-2">
                <Field label="Status">{(id) => <Select id={id} options={statuses} value={form.data.status} onChange={(e) => form.setData('status', e.target.value)} className="h-9 text-xs" />}</Field>
                <Field label="Secure message to reporter (visible via case token)">{(id) => <Textarea id={id} rows={2} value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} />}</Field>
                <div><Button type="submit" size="sm" disabled={form.processing}>Save</Button></div>
            </form>
        </li>
    );
}

export default function Cases({ type, counts, cases = [], reports = [], statuses }: Props) {
    return (
        <AdminShell crumb="Cases & Whistleblowing" title="Non-Client Cases" lead="Complaints, media, partners and protected reports." description="Each case keeps a reference and status history visible to the submitter. Whistleblowing reports are isolated from CRM and only visible to authorised case owners.">
            <nav className="flex flex-wrap gap-2" aria-label="Case types">
                {tabs.map((t) => (
                    <Link key={t.key} href={`/admin/about/cases?type=${t.key}`} preserveScroll className={cn('rounded-full border px-3 py-1.5 text-[0.8125rem] font-medium', type === t.key ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-400 bg-white text-ink-700')}>
                        {t.label} <span className="ml-1 rounded-full bg-parchment-300 px-1.5 text-xs">{counts[t.key] ?? 0}</span>
                    </Link>
                ))}
            </nav>
            <Panel title={tabs.find((t) => t.key === type)?.label} className="mt-4">
                {type === 'whistleblowing' ? (
                    reports.length === 0 ? <p className="text-sm text-ink-400">No reports.</p> : <ul className="grid gap-4 xl:grid-cols-2">{reports.map((r) => <ReportCard key={r.id} r={r} statuses={statuses} />)}</ul>
                ) : cases.length === 0 ? <p className="text-sm text-ink-400">No cases yet.</p> : <ul className="grid gap-4 xl:grid-cols-2">{cases.map((c) => <CaseCard key={c.id} c={c} statuses={statuses} />)}</ul>}
            </Panel>
            <p className="mt-3 text-xs text-ink-500">Need to rebuild the page state? <button type="button" className="underline" onClick={() => router.reload()}>Refresh</button></p>
        </AdminShell>
    );
}
Cases.layout = null;
