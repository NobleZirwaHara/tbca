import { useState, type ReactNode } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import { DD_ADMIN_NAV } from '@/Components/DueDiligence/AdminNav';
import { rand, shortDate } from '@/Components/DueDiligence/Ui';
import type { DdCaseHeader, DdCommercial, DdEvent } from '@/types/due-diligence';

type Row = Record<string, unknown> & { id: number };
interface Props {
    case: DdCaseHeader & { reviewer: string | null; reviewerRole: string | null; reviewDecision: string | null; riskRating: string | null; reviewMandatory: boolean; partner: Record<string, string> | null; closure: { action: string | null; status: string | null; approvals: Record<string, boolean> | null; legalHold: boolean }; client: { name: string; email: string; company: string | null } | null };
    allowed: { value: string; label: string; blocker: string | null }[];
    consents: Row[]; evidence: (Row & { documents: Row[] })[]; documents: Row[]; checks: Row[]; findings: Row[]; requests: Row[]; tasks: Row[]; reports: Row[]; disputes: Row[];
    subscriptions: (Row & { alerts: Row[] })[];
    events: DdEvent[];
    commercial: DdCommercial;
}

type Field = { name: string; label: string; type?: 'text' | 'number' | 'select' | 'textarea'; options?: string[]; value?: string | number };

/** Small server-validated action form used throughout the console. */
function ActionForm({ url, fields, submit, inline = false }: { url: string; fields: Field[]; submit: string; inline?: boolean }) {
    const [data, setData] = useState<Record<string, string | number>>(Object.fromEntries(fields.map((f) => [f.name, f.value ?? (f.options ? f.options[0] : '')])));
    const [busy, setBusy] = useState(false);
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const ctl = 'w-full rounded border border-parchment-500 bg-white px-2 py-1.5 text-xs focus:border-gold-500 focus:outline-none';
    return (
        <form className={inline ? 'flex flex-wrap items-end gap-2' : 'grid gap-2'} onSubmit={(e) => { e.preventDefault(); setBusy(true); router.post(url, data, { preserveScroll: true, onFinish: () => setBusy(false) }); }}>
            {fields.map((f) => (
                <label key={f.name} className={inline ? 'min-w-28 flex-1 text-[0.6875rem]' : 'text-[0.6875rem]'}>
                    <span className="mb-0.5 block font-medium text-ink-600">{f.label}</span>
                    {f.type === 'select' ? (
                        <select className={ctl} value={String(data[f.name])} onChange={(e) => setData({ ...data, [f.name]: e.target.value })}>{f.options?.map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}</select>
                    ) : f.type === 'textarea' ? (
                        <textarea className={ctl} rows={2} value={String(data[f.name])} onChange={(e) => setData({ ...data, [f.name]: e.target.value })} />
                    ) : (
                        <input className={ctl} type={f.type ?? 'text'} value={String(data[f.name])} onChange={(e) => setData({ ...data, [f.name]: e.target.value })} />
                    )}
                    {errors?.[f.name] && <span className="text-risk-600">{errors[f.name]}</span>}
                </label>
            ))}
            <Button type="submit" size="sm" disabled={busy}>{submit}</Button>
        </form>
    );
}

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
    return <Panel title={title} className={className}>{children}</Panel>;
}

/** Staff case console: transitions, checks, flags, review, partner, QA, disputes, consents and evidence. */
export default function AdminCase(props: Props) {
    const { case: c, allowed, consents, evidence, documents, checks, findings, requests, tasks, reports, disputes, subscriptions, events, commercial } = props;
    const base = `/admin/due-diligence/cases/${c.reference}`;
    const { errors } = usePage<{ errors: Record<string, string> }>().props;
    const s = (v: unknown) => (v === null || v === undefined ? '' : String(v));

    return (
        <ConsoleLayout
            area="Due Diligence Control Tower"
            areaIcon={ShieldCheck}
            groups={DD_ADMIN_NAV}
            crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Due Diligence', href: '/admin/due-diligence' }, { label: 'Cases', href: '/admin/due-diligence/cases' }, { label: c.reference }]}
            title={c.reference}
            badge={<StatusPill status={c.statusLabel} />}
            description={`${c.caseName} · ${c.package} · client ${c.client?.name ?? ''} (${c.client?.email ?? ''})`}
            actions={<Link href={`/due-diligence/cases/${c.reference}`} className="text-xs font-semibold text-gold-700">Open client view →</Link>}
        >
            <Head title={`Admin ${c.reference}`} />
            <div className="mb-4 flex flex-wrap gap-2">{c.chips.map((ch) => <span key={ch.label} className="rounded border border-parchment-400 bg-white px-2 py-0.5 text-[0.6875rem]"><span className="text-ink-500">{ch.label}:</span> {ch.value}</span>)}</div>

            <div className="grid gap-4 xl:grid-cols-3">
                <Section title="Status transition (server-validated)">
                    {errors?.status && <p className="mb-2 rounded bg-risk-50 p-2 text-xs text-risk-700">{errors.status}</p>}
                    {allowed.length === 0 ? <p className="text-xs text-ink-500">No staff transitions from {c.statusLabel}. Client or system actions drive the next step.</p> : (
                        <ul className="space-y-2">
                            {allowed.map((a) => (
                                <li key={a.value} className="flex items-center gap-2 text-xs">
                                    <Button type="button" size="sm" variant={a.blocker ? 'outline' : 'gold'} onClick={() => router.post(`${base}/transition`, { to: a.value }, { preserveScroll: true })}>→ {a.label}</Button>
                                    {a.blocker && <span className="text-attested-700">Guard: {a.blocker}</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </Section>
                <Section title="Reviewer assignment & decision">
                    <ActionForm url={`${base}/review`} submit="Save review" fields={[{ name: 'reviewer_name', label: 'Reviewer', value: c.reviewer ?? 'Thandiwe Dlamini' }, { name: 'reviewer_role', label: 'Role', value: c.reviewerRole ?? 'DD Analyst' }, { name: 'risk_rating', label: 'Risk rating', type: 'select', options: ['low', 'medium', 'high'], value: c.riskRating ?? 'low' }, { name: 'review_decision', label: 'Reviewer decision', type: 'textarea', value: c.reviewDecision ?? '' }]} />
                </Section>
                <Section title="Refer to qualified partner (RL4)">
                    {c.partner ? <p className="mb-2 text-xs">Current: <strong>{c.partner.name}</strong> — {c.partner.scope}</p> : null}
                    <ActionForm url={`${base}/partner`} submit="Refer & move to partner review" fields={[{ name: 'name', label: 'Partner firm', value: 'Mbatha Legal Partners (fictional)' }, { name: 'type', label: 'Review type', value: 'Legal & Regulatory' }, { name: 'scope', label: 'Scope', value: 'Legal status, litigation, regulatory actions' }, { name: 'lead', label: 'Lead reviewer', value: 'Adv. Sipho Mbatha' }, { name: 'contact', label: 'Contact email', value: 'partner@example.org' }]} />
                </Section>
            </div>

            <Section title="Checks & vendor runs" className="mt-4">
                <SimpleTable columns={['Category', 'Vendor', 'Status', 'Done', 'External approved / used', 'Update']} rows={checks.map((k) => [s(k.category), s(k.vendor), <StatusPill key="s" status={s(k.status)} />, `${s(k.done)} / ${s(k.total)}`, `${rand(Number(k.external_approved_zar))} / ${rand(Number(k.external_used_zar))}`,
                    <ActionForm key="f" inline url={`${base}/checks/${k.id}`} submit="Save" fields={[{ name: 'status', label: 'Status', type: 'select', options: ['not_started', 'pending', 'in_progress', 'on_hold', 'complete'], value: s(k.status) }, { name: 'done', label: 'Done', type: 'number', value: Number(k.done) }, { name: 'external_used_zar', label: 'Used R', type: 'number', value: Number(k.external_used_zar) }, { name: 'hold_reason', label: 'Hold reason', value: s(k.hold_reason) }]} />])} />
            </Section>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <Section title="Risk flags (findings)">
                    <SimpleTable columns={['Ref', 'Flag', 'Severity', 'Status', 'Client response', 'Disposition']} rows={findings.map((f) => [s(f.report_ref ?? f.reference), s(f.flag_type), s(f.severity), <StatusPill key="s" status={s(f.status)} />, s(f.client_response) || '—',
                        <ActionForm key="d" url={`${base}/findings/${f.id}`} submit="Record" fields={[{ name: 'status', label: 'Disposition', type: 'select', options: ['reviewing', 'cleared', 'confirmed'], value: s(f.status) === 'open' ? 'reviewing' : s(f.status) }, { name: 'disposition', label: 'Note', type: 'textarea', value: s(f.disposition) }]} />])} empty="No flags." />
                    <p className="mt-3 mb-1 text-xs font-semibold">Raise a flag (locks release, G7)</p>
                    <ActionForm url={`${base}/findings`} submit="Raise flag" fields={[{ name: 'check_category', label: 'Check category', value: 'Director & UBO Checks' }, { name: 'flag_type', label: 'Flag type', value: 'Adverse Media Mentions' }, { name: 'source', label: 'Source', value: 'Open Source Media Screening' }, { name: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high', 'critical'], value: 'medium' }, { name: 'summary', label: 'Client-safe summary', type: 'textarea', value: 'A potential match was identified that may be relevant to the subject.' }]} />
                </Section>
                <Section title="Requests (information, partner, clarification, G9, alternatives)">
                    <SimpleTable columns={['Ref', 'Type', 'Title', 'Status', 'Response', 'Resolve']} rows={requests.map((r) => [s(r.reference), s(r.type), s(r.title), <StatusPill key="s" status={s(r.status)} />, s(r.response) || '—',
                        ['open', 'responded'].includes(s(r.status)) ? <ActionForm key="x" inline url={`${base}/requests/${r.id}`} submit="Apply" fields={[{ name: 'decision', label: 'Decision', type: 'select', options: ['approved', 'declined', 'closed'] }]} /> : '—'])} empty="No requests." />
                    <p className="mt-3 mb-1 text-xs font-semibold">Raise a request</p>
                    <ActionForm url={`${base}/requests`} submit="Send to client" fields={[{ name: 'type', label: 'Type', type: 'select', options: ['information', 'partner', 'clarification'] }, { name: 'title', label: 'Title', value: 'Updated shareholder register' }, { name: 'detail', label: 'Detail', value: 'Include all direct and indirect shareholders' }, { name: 'reason', label: 'Reason', value: 'To verify ownership structure' }, { name: 'requested_by', label: 'Requested by', value: c.reviewer ?? 'QA Desk' }, { name: 'due_days', label: 'Due (business days)', type: 'number', value: 2 }]} />
                </Section>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <Section title="Partner & QA tasks">
                    <SimpleTable columns={['Kind', 'Task', 'Status', 'Progress']} rows={tasks.map((t) => [s(t.kind), s(t.title), <StatusPill key="s" status={s(t.status)} />, <ActionForm key="p" inline url={`${base}/tasks/${t.id}`} submit="Set" fields={[{ name: 'progress', label: '%', type: 'number', value: Number(t.progress) }]} />])} empty="Tasks appear when partner review or report drafting starts." />
                    <p className="mt-3 text-xs">Reports: {reports.map((r) => `${s(r.version)} (${s(r.status)})`).join(' · ') || 'none yet'}</p>
                </Section>
                <Section title="Disputes">
                    <SimpleTable columns={['Ref', 'Item', 'Status', 'Outcome', 'Decide']} rows={disputes.map((d) => [s(d.reference), `${s(d.report_section)}: ${s(d.finding)}`, <StatusPill key="s" status={s(d.status)} />, s(d.outcome) || '—',
                        s(d.status) !== 'decided' ? <ActionForm key="x" url={`${base}/disputes/${d.id}`} submit="Decide" fields={[{ name: 'outcome', label: 'Outcome', type: 'select', options: ['corrected', 'upheld', 'clarified', 'recheck_quoted'] }, { name: 'reason', label: 'Reason', type: 'textarea', value: 'Source data mismatch due to incorrect entity identifier used during screening.' }, { name: 'reviewer', label: 'Reviewer', value: 'Thandiwe Dlamini (Senior Reviewer)' }, { name: 'approved_by', label: 'Approved by', value: 'Sipho Mbatha (Report Approver)' }, { name: 'refund_zar', label: 'Refund (R incl. VAT)', type: 'number', value: 0 }]} /> : shortDate(s(d.decided_at))])} empty="No disputes." />
                </Section>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <Section title="Consents">
                    <SimpleTable columns={['Consent', 'Requirement', 'Status', 'Given by', 'Verify']} rows={consents.map((k) => [s(k.label), s(k.requirement), <StatusPill key="s" status={s(k.status)} />, s(k.given_by) || '—',
                        s(k.requirement) !== 'not_required' ? <ActionForm key="x" inline url={`${base}/consents/${k.id}`} submit="Set" fields={[{ name: 'status', label: 'Status', type: 'select', options: ['received', 'pending', 'expired'], value: s(k.status) === 'received' ? 'received' : 'received' }]} /> : '—'])} />
                </Section>
                <Section title="Evidence register">
                    <SimpleTable columns={['Item', 'Status', 'Docs', 'Review']} rows={evidence.map((e) => [s(e.label), <StatusPill key="s" status={s(e.status)} />, e.documents.length, <ActionForm key="x" inline url={`${base}/evidence/${e.id}`} submit="Set" fields={[{ name: 'status', label: 'Decision', type: 'select', options: ['approved', 'rejected', 'waived'] }]} />])} />
                    <p className="mt-2 text-[0.6875rem] text-ink-500">{documents.length} document(s) stored under storage/app/private/dd/.</p>
                </Section>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <Section title="Monitoring">
                    {subscriptions.length === 0 ? <p className="text-xs text-ink-500">No subscription.</p> : subscriptions.map((sub) => (
                        <div key={sub.id} className="mb-3">
                            <p className="text-xs font-semibold">{s(sub.reference)} · {s(sub.plan_name)} · <StatusPill status={s(sub.status)} /></p>
                            <SimpleTable columns={['Alert', 'Type', 'Risk', 'Status', 'Review']} rows={sub.alerts.map((a) => [s(a.reference), s(a.alert_type), s(a.risk_level), <StatusPill key="s" status={s(a.status)} />, <ActionForm key="x" inline url={`/admin/due-diligence/alerts/${a.id}`} submit="Set" fields={[{ name: 'status', label: 'Status', type: 'select', options: ['under_review', 'reviewed', 'escalated'] }]} />])} />
                            {s(sub.status) === 'active' && <div className="mt-2"><ActionForm inline url={`/admin/due-diligence/subscriptions/${s(sub.reference)}/alerts`} submit="Raise alert" fields={[{ name: 'alert_type', label: 'Type', value: 'Adverse media mention' }, { name: 'source', label: 'Source', value: 'News Feed' }, { name: 'risk_level', label: 'Risk', type: 'select', options: ['critical', 'high', 'medium', 'low'], value: 'medium' }]} /></div>}
                        </div>
                    ))}
                </Section>
                <Section title="Commercial & closure">
                    <p className="text-xs">Paid {rand(commercial.total, 2)} (order {commercial.orderReference}) · credits {rand(commercial.credits, 2)}</p>
                    <p className="mt-2 text-xs">Closure: {c.closure.action ?? 'none'} {c.closure.status ? `(${c.closure.status})` : ''} {c.closure.legalHold ? '· LEGAL HOLD' : ''}</p>
                    {c.closure.status === 'pending_approval' && (
                        <div className="mt-2 flex gap-2">
                            {!c.closure.approvals?.privacy_lead && <Button size="sm" variant="outline" onClick={() => router.post(`${base}/closure`, { role: 'privacy_lead' }, { preserveScroll: true })}>Privacy Lead approve</Button>}
                            {!c.closure.approvals?.finance_controller && <Button size="sm" variant="outline" onClick={() => router.post(`${base}/closure`, { role: 'finance_controller' }, { preserveScroll: true })}>Finance Controller approve</Button>}
                        </div>
                    )}
                </Section>
            </div>

            <Section title="Immutable timeline" className="mt-4">
                <SimpleTable columns={['Event', 'Type', 'Description', 'Actor', 'When']} rows={events.map((e) => [<span key="c" className="font-mono">{e.code}</span>, e.type, e.description, `${e.actor} (${e.role})`, shortDate(e.at, true)])} />
            </Section>
        </ConsoleLayout>
    );
}

AdminCase.layout = null;
