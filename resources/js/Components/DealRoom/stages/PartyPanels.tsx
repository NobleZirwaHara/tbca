import { router, useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Panel, SimpleTable, StatusPill, Tabs } from '@/Components/ui/Kit';
import type { FolderRow, PartyRow, RoomHeader } from '@/types/deal-room';
import { roomUrl } from '../RoomShell';
import { CheckItem, Gauge, KvList, Stat } from '../Ui';

interface CounterpartyData {
    parties: PartyRow[];
    internal: PartyRow[];
    counts: Record<string, number>;
    roles: Record<string, string>;
    matrix: Record<string, Record<string, string>>;
    message: string;
}

const externalRoles = ['investor', 'lender', 'advisor', 'auditor', 'valuer', 'government'];

function AddCounterparty({ slug, roles }: { slug: string; roles: Record<string, string> }) {
    const form = useForm({ name: '', email: '', organisation: '', role: 'investor', jurisdiction: 'South Africa', group_name: '', access_level: 'view_only' });
    return (
        <form onSubmit={(e) => { e.preventDefault(); form.post(roomUrl(slug, 'parties'), { preserveScroll: true, onSuccess: () => form.reset() }); }} className="grid gap-3 sm:grid-cols-2">
            <Field label="Contact name" error={form.errors.name} required>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
            <Field label="Email" error={form.errors.email} required>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />}</Field>
            <Field label="Organisation" error={form.errors.organisation} required>{(id) => <Input id={id} value={form.data.organisation} onChange={(e) => form.setData('organisation', e.target.value)} />}</Field>
            <Field label="Role" error={form.errors.role}>{(id) => <Select id={id} value={form.data.role} onChange={(e) => form.setData('role', e.target.value)} options={Object.entries(roles).filter(([k]) => externalRoles.includes(k)).map(([value, label]) => ({ value, label }))} />}</Field>
            <Field label="Jurisdiction" error={form.errors.jurisdiction}>{(id) => <Input id={id} value={form.data.jurisdiction} onChange={(e) => form.setData('jurisdiction', e.target.value)} />}</Field>
            <Field label="Access level" error={form.errors.access_level}>{(id) => <Select id={id} value={form.data.access_level} onChange={(e) => form.setData('access_level', e.target.value)} options={[{ value: 'full', label: 'Full Access' }, { value: 'qa_only', label: 'Q&A Only' }, { value: 'view_only', label: 'View Only' }]} />}</Field>
            <div className="sm:col-span-2"><Button type="submit" size="sm" disabled={form.processing}>Add & screen counterparty</Button></div>
        </form>
    );
}

export function CounterpartyPanel({ room, data }: { room: RoomHeader; data: CounterpartyData }) {
    const [tab, setTab] = useState('all');
    const rows = data.parties.filter((p) => tab === 'all' || p.role === tab);
    const invite = (ids?: number[]) => router.post(roomUrl(room.slug, 'parties/invite'), { ids }, { preserveScroll: true });
    const qualified = data.parties.filter((p) => (p.score ?? 0) >= 60).length;
    const c = data.counts;

    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. Counterparty Screening">
                    <ul className="space-y-1.5">
                        {['AML / KYC Screening', 'Sanctions & PEP Check', 'Adverse Media Screening', 'Jurisdiction & Regulatory Check', 'Financial Stability Assessment', 'Reputation & Track Record'].map((s) => <CheckItem key={s} done={data.parties.length > 0}>{s} — {data.parties.length ? 'Completed' : 'Awaiting nominations'}</CheckItem>)}
                    </ul>
                    <p className="mt-3 rounded bg-verified-50 p-2 text-xs text-verified-700">{qualified} counterparties cleared for invitation.</p>
                </Panel>
                <Panel title="3. Invitation Management" className="lg:col-span-2">
                    <div className="grid grid-cols-5 gap-2">
                        <Stat label="Invited" value={c.invited} /><Stat label="Accepted" value={c.accepted} tone="good" /><Stat label="Pending" value={c.pending} tone="warn" /><Stat label="Declined" value={c.declined} /><Stat label="Expired" value={c.expired} />
                    </div>
                    <KvList className="mt-3" rows={[['Invitation Mode', 'Controlled (Admin Approval)'], ['Access Level Template', 'Investor Standard'], ['NDAs Required', 'Yes — NDA gate before data room entry'], ['Invitation Expiry', '14 days'], ['Auto Reminder', 'On']]} />
                </Panel>
            </div>
            <Panel title={`2. Qualified Counterparties (${data.parties.length})`} action={room.manages && c.pending > 0 ? <Button type="button" size="sm" onClick={() => invite()}><Send className="size-4" aria-hidden /> Invite all qualified ({c.pending})</Button> : undefined}>
                <Tabs value={tab} onChange={setTab} className="mb-3" tabs={[{ key: 'all', label: 'All', count: data.parties.length }, { key: 'investor', label: 'Investors', count: data.parties.filter((p) => p.role === 'investor').length }, { key: 'lender', label: 'Lenders', count: data.parties.filter((p) => p.role === 'lender').length }, { key: 'advisor', label: 'Advisors', count: data.parties.filter((p) => p.role === 'advisor').length }]} />
                <SimpleTable
                    columns={['Counterparty', 'Type', 'Jurisdiction', 'Qualification Score', 'Status', 'Action']}
                    empty="No counterparties nominated yet."
                    rows={rows.map((p) => [
                        <span key="n"><span className="font-medium">{p.organisation}</span><span className="block text-[0.6875rem] text-ink-400">{p.name} · {p.email}</span></span>,
                        p.roleLabel, p.jurisdiction ?? '—',
                        p.score !== null ? <span key="s" className={p.score >= 60 ? 'font-semibold text-verified-700' : 'font-semibold text-risk-700'}>{p.score}%</span> : '—',
                        <StatusPill key="st" status={p.status} />,
                        room.manages && p.status === 'qualified' ? <button key="i" type="button" onClick={() => invite([p.id])} className="rounded border border-controlled-500/40 px-2 py-0.5 text-xs text-controlled-700">Invite</button> : p.expires && p.status === 'invited' ? `Expires ${p.expires}` : '—',
                    ])}
                />
            </Panel>
            <div className="grid gap-5 lg:grid-cols-3">
                {room.manages && <Panel title="Nominate a counterparty" className="lg:col-span-2"><AddCounterparty slug={room.slug} roles={data.roles} /></Panel>}
                <Panel title="Qualification Summary">
                    <div className="flex items-center gap-4">
                        <Gauge value={data.parties.length ? Math.round((qualified / data.parties.length) * 100) : 0} label={`${qualified} Qualified`} />
                        <ul className="space-y-1 text-xs">
                            <li>High Quality (90%+): <strong>{c.high}</strong></li><li>Good Quality (75–89%): <strong>{c.good}</strong></li><li>Fair Quality (60–74%): <strong>{c.fair}</strong></li><li>Below Threshold: <strong>{c.below}</strong></li>
                        </ul>
                    </div>
                </Panel>
            </div>
        </div>
    );
}

export function InvitationsPanel({ room, data }: { room: RoomHeader; data: CounterpartyData }) {
    const ready = data.parties.filter((p) => p.status === 'qualified');
    const [subject, setSubject] = useState(`Invitation to ${room.name} Deal Room`);
    const [expiry, setExpiry] = useState('14');
    const byRole = (r: string) => data.parties.filter((p) => p.role === r).length;
    const total = Math.max(1, data.parties.length);
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat label="Invitations Ready" value={ready.length} tone="gold" /><Stat label="Total Counterparties" value={data.parties.length} /><Stat label="Sent" value={data.counts.invited + data.counts.accepted} tone="good" /><Stat label="Accepted" value={data.counts.accepted} tone="good" />
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. Invitation Coverage">
                    <ul className="space-y-1.5 text-[0.8125rem]">
                        {[['Investors', 'investor'], ['Lenders', 'lender'], ['Advisors', 'advisor']].map(([l, r]) => <li key={r} className="flex justify-between"><span>{l}</span><span>{byRole(r)} ({((byRole(r) / total) * 100).toFixed(1)}%)</span></li>)}
                    </ul>
                </Panel>
                <Panel title="2. Invitation List" className="lg:col-span-2">
                    <SimpleTable columns={['Counterparty', 'Type', 'Access Level', 'Mode', 'Status']} empty="All qualified counterparties have been invited." rows={data.parties.map((p) => [p.organisation, p.roleLabel, p.accessLevel.replace('_', ' '), 'Email', <StatusPill key="s" status={p.status === 'qualified' ? 'ready' : p.status} />])} />
                </Panel>
            </div>
            <Panel title="3. Invitation Message & Access">
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-3">
                        <Field label="Email subject">{(id) => <Input id={id} value={subject} onChange={(e) => setSubject(e.target.value)} />}</Field>
                        <Field label="Invitation expiry">{(id) => <Select id={id} value={expiry} onChange={(e) => setExpiry(e.target.value)} options={[{ value: '7', label: '7 days' }, { value: '14', label: '14 days' }, { value: '30', label: '30 days' }]} />}</Field>
                        <p className="text-xs text-ink-500">Invitations expire automatically if not accepted. Invitees must sign in with the invited email, accept the NDA and pass MFA.</p>
                    </div>
                    <Field label="Message preview">{(id) => <Textarea id={id} readOnly value={data.message} className="min-h-48 text-xs" />}</Field>
                </div>
                {room.manages && (
                    <Button type="button" className="mt-4" disabled={ready.length === 0} onClick={() => router.post(roomUrl(room.slug, 'parties/invite'), { subject, expiry_days: Number(expiry) }, { preserveScroll: true })}>
                        <Send className="size-4" aria-hidden /> Send All Invitations ({ready.length})
                    </Button>
                )}
            </Panel>
        </div>
    );
}

interface AccessData {
    participants: PartyRow[];
    activity: { views: number; downloads: number; denied: number; total: number };
    log: { action: string; watermark: string | null; at: string; document: string | null }[];
    security: Record<string, string | number | boolean>;
    compliance: { activeUsers: number; roles: number; mfa: number; nda: number; expired: number };
    folders: FolderRow[];
}

export function AccessPanel({ room, data }: { room: RoomHeader; data: AccessData }) {
    const [tab, setTab] = useState('all');
    const update = (id: number, payload: Record<string, string | number | boolean>) => router.patch(roomUrl(room.slug, `parties/${id}`), payload, { preserveScroll: true });
    const release = (f: FolderRow, released: boolean) => router.patch(roomUrl(room.slug, `folders/${f.id}`), { released, roles: [] }, { preserveScroll: true });
    const rows = data.participants.filter((p) => tab === 'all' || (tab === 'internal' ? p.internal : !p.internal));
    const s = data.security;
    const compliance = data.participants.length ? Math.round((data.compliance.mfa / data.participants.length) * 100) : 100;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat label="Active Users" value={data.compliance.activeUsers} /><Stat label="Roles Configured" value={data.compliance.roles} /><Stat label="NDAs Accepted" value={data.compliance.nda} tone="good" /><Stat label="Access Compliance" value={`${compliance}%`} tone="good" />
            </div>
            <Panel title="2. Participant Access Matrix">
                <Tabs value={tab} onChange={setTab} className="mb-3" tabs={[{ key: 'all', label: 'All', count: data.participants.length }, { key: 'external', label: 'External' }, { key: 'internal', label: 'Internal' }]} />
                <SimpleTable
                    columns={['Participant', 'Role', 'Access Level', 'Doc. Access', 'MFA', 'NDA', 'Status', 'Last Access', '']}
                    rows={rows.map((p) => [
                        <span key="n"><span className="font-medium">{p.organisation}</span><span className="block text-[0.6875rem] text-ink-400">{p.name}</span></span>,
                        p.roleLabel,
                        room.manages && p.role !== 'owner' ? (
                            <select key="a" aria-label={`Access level for ${p.name}`} value={p.accessLevel} onChange={(e) => update(p.id, { access_level: e.target.value })} className="h-7 rounded border border-parchment-500 bg-white px-1 text-xs">
                                <option value="full">Full Access</option><option value="qa_only">Q&A Only</option><option value="view_only">View Only</option>
                            </select>
                        ) : p.accessLevel.replace('_', ' '),
                        p.docAccess ?? '—',
                        room.manages && p.role !== 'owner' ? <input key="m" type="checkbox" aria-label={`MFA for ${p.name}`} checked={p.mfa} onChange={(e) => update(p.id, { mfa: e.target.checked })} className="accent-gold-600" /> : p.mfa ? 'On' : 'Off',
                        p.nda ?? '—',
                        <StatusPill key="s" status={p.status} />,
                        p.lastAccess ?? '—',
                        room.manages && p.role !== 'owner' && p.status !== 'revoked' ? <button key="r" type="button" onClick={() => update(p.id, { status: 'revoked' })} className="text-xs text-risk-700 hover:underline">Revoke</button> : null,
                    ])}
                />
            </Panel>
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="Staged Disclosure — Folder Release">
                    <ul className="space-y-1.5">
                        {data.folders.map((f) => (
                            <li key={f.id} className="flex items-center justify-between gap-2 text-[0.8125rem]">
                                <span>{f.name}</span>
                                {room.manages ? (
                                    <button type="button" onClick={() => release(f, !f.released)} className={`rounded px-2 py-0.5 text-xs font-semibold ${f.released ? 'bg-verified-50 text-verified-700' : 'bg-parchment-300 text-ink-600'}`}>{f.released ? 'Released' : 'Withheld'}</button>
                                ) : <StatusPill status={f.released ? 'released' : 'withheld'} />}
                            </li>
                        ))}
                    </ul>
                </Panel>
                <Panel title="3. Disclosure Controls">
                    <KvList rows={[['Watermark Documents', s.watermark ? 'Dynamic (User + Date)' : 'Off'], ['Download Restriction', s.download_restricted ? 'View Only' : 'Allowed'], ['Print Restriction', String(s.print ?? 'Restricted')], ['Copy & Paste Restriction', String(s.copy_paste ?? 'Enabled')], ['PDF Expiry', `${s.pdf_expiry_days ?? 30} days`], ['View Session Timeout', `${s.session_timeout} mins`]]} />
                </Panel>
                <Panel title="Disclosure Activity (Last 7 Days)">
                    <div className="grid grid-cols-3 gap-2"><Stat label="Viewed" value={data.activity.views} /><Stat label="Downloaded" value={data.activity.downloads} /><Stat label="Denied" value={data.activity.denied} tone={data.activity.denied ? 'bad' : 'neutral'} /></div>
                    <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-[0.6875rem] text-ink-600">
                        {data.log.map((l, i) => <li key={i}>{l.at} · <strong>{l.action}</strong> {l.document ?? ''} {l.watermark ? `· ${l.watermark}` : ''}</li>)}
                    </ul>
                </Panel>
            </div>
        </div>
    );
}
