import { router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Hand, Lock, MessageSquare, Radio, ShieldCheck, Video, XCircle } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { ApprovalRow, Charge, ItemRow, OfferRow, PartyRow, RoomHeader } from '@/types/deal-room';
import { roomUrl } from '../RoomShell';
import { ApprovalList, CheckItem, Empty, Gauge, KvList, millions, Stat, zar } from '../Ui';

const STATUSES: Record<string, string[]> = {
    action: ['pending', 'in_progress', 'completed'],
    legal_doc: ['drafting', 'in_review', 'finalised'],
    legal_issue: ['open', 'in_review', 'resolved', 'deferred'],
    handover: ['scheduled', 'in_progress', 'completed'],
    workstream: ['planned', 'in_progress', 'completed'],
    post_close_risk: ['open', 'in_progress', 'resolved'],
};

/** Generic register (actions, legal documents, issues, handover ...) with inline status changes and an add form. */
export function ItemRegister({ room, kind, items, columns, extra, addable = true }: { room: RoomHeader; kind: string; items: ItemRow[]; columns?: string[]; extra?: (i: ItemRow) => React.ReactNode[]; addable?: boolean }) {
    const form = useForm({ kind, title: '', owner: '', due_date: '', severity: '' });
    const set = (i: ItemRow, status: string) => router.patch(roomUrl(room.slug, `items/${i.id}`), { status }, { preserveScroll: true });
    return (
        <div className="space-y-3">
            <SimpleTable
                columns={[...(columns ?? ['Item', 'Owner']), 'Status']}
                empty="Nothing recorded yet."
                rows={items.map((i) => [
                    <span key="t" className="font-medium">{i.title}</span>,
                    ...(extra ? extra(i) : [i.owner ?? '—']),
                    room.manages ? (
                        <select key="s" aria-label={`Status of ${i.title}`} value={i.status} onChange={(e) => set(i, e.target.value)} className="h-7 rounded border border-parchment-500 bg-white px-1 text-xs capitalize">
                            {(STATUSES[kind] ?? [i.status]).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                    ) : <StatusPill key="s" status={i.status} />,
                ])}
            />
            {room.manages && addable && (
                <form onSubmit={(e) => { e.preventDefault(); form.post(roomUrl(room.slug, 'items'), { preserveScroll: true, onSuccess: () => form.reset('title', 'owner', 'due_date') }); }} className="flex flex-wrap items-end gap-2">
                    <label className="min-w-40 flex-1 text-xs">Add item<input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className="mt-0.5 h-8 w-full rounded border border-parchment-500 px-2 text-sm" /></label>
                    <label className="w-32 text-xs">Owner<input value={form.data.owner} onChange={(e) => form.setData('owner', e.target.value)} className="mt-0.5 h-8 w-full rounded border border-parchment-500 px-2 text-sm" /></label>
                    {kind.includes('issue') || kind.includes('risk') ? (
                        <label className="w-28 text-xs">Severity<select value={form.data.severity} onChange={(e) => form.setData('severity', e.target.value)} className="mt-0.5 h-8 w-full rounded border border-parchment-500 bg-white px-1 text-sm"><option value="">—</option><option>Low</option><option>Medium</option><option>High</option></select></label>
                    ) : null}
                    <Button type="submit" size="sm" variant="outline" disabled={!form.data.title}>Add</Button>
                </form>
            )}
        </div>
    );
}

interface NegotiationData {
    state: { buyer?: string; seller?: string; outcome?: string | null; closed_at?: string; summary_at?: string };
    actions: ItemRow[];
    participants: PartyRow[];
    questions: { reviewed: number; open: number; answered: number; escalated: number };
}

export function NegotiationPanel({ room, data }: { room: RoomHeader; data: NegotiationData }) {
    const s = data.state ?? {};
    const act = (action: string) => router.post(roomUrl(room.slug, 'negotiation'), { action }, { preserveScroll: true });
    const teams = [
        ['Buyer Team', data.participants.filter((p) => ['investor', 'lender'].includes(p.role))],
        ['Deal Facilitators', data.participants.filter((p) => ['tbca_advisor', 'advisor'].includes(p.role))],
        ['Seller Team', data.participants.filter((p) => ['owner', 'finance', 'legal'].includes(p.role))],
    ] as const;
    const isBuyer = ['investor', 'lender'].includes(room.role ?? '');
    const isAdmin = usePage<SharedProps>().props.auth.user?.role === 'admin';
    const canClose = s.buyer === 'approved' && s.seller === 'approved';

    return (
        <div className="space-y-5">
            <section className="rounded-[8px] bg-ink-950 p-4 text-parchment-100">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-risk-500"><Radio className="size-4" aria-hidden /> {s.outcome ? 'SESSION CLOSED' : 'LIVE'}</span>
                    <span>Recording · Secure end-to-end</span>
                    <span>{data.participants.length} participants · 3 teams</span>
                    <span className="ml-auto">Outcome: <strong className="text-gold-300">{s.outcome ?? 'Open'}</strong></span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {teams.map(([name, members]) => (
                        <div key={name} className="rounded-[6px] border border-ink-700 p-3">
                            <p className="mb-2 flex items-center justify-between text-xs font-semibold text-gold-300">{name}<span className="text-verified-500">● Live</span></p>
                            <ul className="grid grid-cols-2 gap-2">
                                {members.slice(0, 4).map((m) => (
                                    <li key={m.id} className="flex aspect-video flex-col items-center justify-center rounded bg-gradient-to-br from-ink-800 to-ink-900 text-center text-[0.6875rem]">
                                        <Video className="mb-1 size-4 text-ink-400" aria-hidden />{m.name}<span className="text-ink-400">{m.roleLabel}</span>
                                    </li>
                                ))}
                                {members.length === 0 && <li className="col-span-2 text-xs text-ink-400">No active members</li>}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {room.manages && <Button type="button" size="sm" variant="outline-light" onClick={() => act('summarise')}><MessageSquare className="size-4" aria-hidden /> Summarise Discussion</Button>}
                    <Button type="button" size="sm" variant="outline-light"><Hand className="size-4" aria-hidden /> Raise Hand</Button>
                </div>
            </section>

            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="Q&A Summary (From Deal Room)">
                    <div className="grid grid-cols-2 gap-2"><Stat label="Q&A Items Reviewed" value={data.questions.reviewed} /><Stat label="Open Clarification" value={data.questions.open} tone="warn" /><Stat label="Recently Answered" value={data.questions.answered} tone="good" /><Stat label="Flagged for Review" value={data.questions.escalated} tone="bad" /></div>
                </Panel>
                <Panel title="Action Register" className="lg:col-span-2"><ItemRegister room={room} kind="action" items={data.actions} columns={['Action Item', 'Owner', 'Due Date']} extra={(i) => [i.owner ?? '—', i.due ?? '—']} /></Panel>
            </div>

            <Panel title="Commercial & Stage Control">
                <div className="grid gap-3 sm:grid-cols-3">
                    {[['Buyer Approval Status', s.buyer], ['Seller Approval Status', s.seller], ['Facilitator Closure Status', s.outcome === 'agreed' ? 'closed as agreed' : canClose ? 'ready to close' : 'cannot close yet']].map(([l, v]) => (
                        <div key={l} className="rounded-[6px] border border-parchment-400 p-3 text-xs"><p className="text-ink-500">{l}</p><p className="mt-1 text-sm font-bold capitalize">{v ?? 'awaiting'}</p></div>
                    ))}
                </div>
                <p className="mt-2 text-xs text-ink-500">Fee trigger: success fee on signed close (percentage fee disabled — fixed completion fee applies). Stage lock: live room locked until buyer and seller approvals are received.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    {room.manages && <Button type="button" size="sm" variant="outline" onClick={() => act('request_buyer')}>Request Buyer Approval</Button>}
                    {room.manages && <Button type="button" size="sm" variant="outline" onClick={() => act('request_seller')}>Request Seller Approval</Button>}
                    {(isBuyer || isAdmin) && s.buyer !== 'approved' && <Button type="button" size="sm" variant="ink" onClick={() => act('buyer_approve')}>Record Buyer Sign-off</Button>}
                    {room.role === 'owner' && s.seller !== 'approved' && <Button type="button" size="sm" variant="ink" onClick={() => act('seller_approve')}>Record Seller Sign-off</Button>}
                    {room.manages && <Button type="button" size="sm" disabled={!canClose || s.outcome === 'agreed'} onClick={() => act('close_agreed')}><CheckCircle2 className="size-4" aria-hidden /> Close as Agreed</Button>}
                    {room.manages && <Button type="button" size="sm" variant="outline" onClick={() => act('close_declined')}><XCircle className="size-4" aria-hidden /> Close as Declined</Button>}
                    {room.manages && s.outcome && <Button type="button" size="sm" variant="ghost" onClick={() => act('keep_open')}>Keep Room Open</Button>}
                </div>
            </Panel>
        </div>
    );
}

export function OffersPanel({ room, data }: { room: RoomHeader; data: { offers: OfferRow[] } }) {
    const active = data.offers.find((o) => o.status === 'active') ?? data.offers.find((o) => o.status === 'approved');
    const sponsor = [...data.offers].reverse().find((o) => o.side === 'sponsor' && o.id !== active?.id);
    const investor = [...data.offers].reverse().find((o) => o.side === 'investor' && o.id !== active?.id);
    const form = useForm({ label: 'Counteroffer', valuation: active?.valuation ?? 0, investment: active?.investment ?? 0, equity: active?.equity ?? 0, key_condition: active?.condition ?? '', liquidation: active?.terms.liquidation ?? '', board: active?.terms.board ?? '', exclusivity: active?.terms.exclusivity ?? '' });
    const cols = [sponsor, investor, active].filter(Boolean) as OfferRow[];
    const offerError = usePage<{ errors: Record<string, string> }>().props.errors.offer;

    return (
        <div className="space-y-5">
            <Panel title="1. Offers and Counteroffers">
                <SimpleTable
                    columns={['Version', 'Submitted By', 'Date / Time', 'Valuation (Pre-Money)', 'Investment', 'Equity', 'Key Condition', 'Status', 'Freeze State', '']}
                    rows={data.offers.map((o) => [
                        <span key="v" className="font-semibold">{o.version}<span className="block text-[0.6875rem] font-normal text-ink-400">{o.label}</span></span>,
                        `${o.submittedBy} (${o.side})`, o.at, millions(o.valuation), millions(o.investment), `${o.equity.toFixed(1)}%`, o.condition ?? '—',
                        <StatusPill key="s" status={o.status} />,
                        o.status === 'active' ? 'Editable (Active)' : o.status === 'approved' ? 'Authorised' : <span key="f" className="inline-flex items-center gap-1"><Lock className="size-3" aria-hidden />Frozen (Read-Only)</span>,
                        room.manages && o.status === 'active' ? <button key="a" type="button" onClick={() => router.post(roomUrl(room.slug, `offers/${o.id}/approve`), {}, { preserveScroll: true })} className="rounded border border-verified-500/40 px-2 py-0.5 text-xs text-verified-700">Approve</button> : null,
                    ])}
                />
            </Panel>
            {cols.length > 0 && (
                <Panel title="2. Active Term-Sheet Economics Comparison">
                    <SimpleTable
                        columns={['Term', ...cols.map((o) => `${o.side === 'sponsor' ? 'Sponsor' : 'Investor'} ${o.id === active?.id ? 'Negotiated' : 'Ask'} (${o.version})`)]}
                        rows={[
                            ['Pre-Money Valuation', ...cols.map((o) => millions(o.valuation))],
                            ['Investment Amount', ...cols.map((o) => millions(o.investment))],
                            ['Equity Offered', ...cols.map((o) => `${o.equity.toFixed(1)}%`)],
                            ['Liquidation Preference', ...cols.map((o) => o.terms.liquidation ?? '—')],
                            ['Board Representation', ...cols.map((o) => o.terms.board ?? '—')],
                            ['Exclusivity', ...cols.map((o) => o.terms.exclusivity ?? '—')],
                            ['Conditions', ...cols.map((o) => o.condition ?? '—')],
                        ]}
                    />
                </Panel>
            )}
            <Panel title="Submit a new version (supersedes and freezes the active version)">
                <form onSubmit={(e) => { e.preventDefault(); form.post(roomUrl(room.slug, 'offers'), { preserveScroll: true }); }} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Label" error={form.errors.label}>{(id) => <Input id={id} value={form.data.label} onChange={(e) => form.setData('label', e.target.value)} />}</Field>
                    <Field label="Pre-money valuation (ZAR)" error={form.errors.valuation}>{(id) => <Input id={id} type="number" value={form.data.valuation} onChange={(e) => form.setData('valuation', Number(e.target.value))} />}</Field>
                    <Field label="Investment (ZAR)" error={form.errors.investment}>{(id) => <Input id={id} type="number" value={form.data.investment} onChange={(e) => form.setData('investment', Number(e.target.value))} />}</Field>
                    <Field label="Equity %" error={form.errors.equity}>{(id) => <Input id={id} type="number" step="0.1" value={form.data.equity} onChange={(e) => form.setData('equity', Number(e.target.value))} />}</Field>
                    <Field label="Key condition">{(id) => <Input id={id} value={form.data.key_condition} onChange={(e) => form.setData('key_condition', e.target.value)} />}</Field>
                    <Field label="Liquidation preference">{(id) => <Input id={id} value={form.data.liquidation} onChange={(e) => form.setData('liquidation', e.target.value)} />}</Field>
                    <Field label="Board representation">{(id) => <Input id={id} value={form.data.board} onChange={(e) => form.setData('board', e.target.value)} />}</Field>
                    <Field label="Exclusivity">{(id) => <Input id={id} value={form.data.exclusivity} onChange={(e) => form.setData('exclusivity', e.target.value)} />}</Field>
                    <div className="sm:col-span-2 lg:col-span-4"><Button type="submit" size="sm" disabled={form.processing}>Submit version</Button></div>
                </form>
                {offerError && <p role="alert" className="mt-2 text-xs text-risk-500">{offerError}</p>}
            </Panel>
        </div>
    );
}

export function LegalPanel({ room, data }: { room: RoomHeader; data: { docs: ItemRow[]; issues: ItemRow[] } }) {
    const count = (s: string) => data.docs.filter((d) => d.status === s).length;
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Stat label="Total Documents" value={data.docs.length} /><Stat label="Finalised" value={count('finalised')} tone="good" /><Stat label="In Review" value={count('in_review')} tone="warn" /><Stat label="Drafts" value={count('drafting')} /></div>
            <Panel title="1. Documentation Tracker"><ItemRegister room={room} kind="legal_doc" items={data.docs} columns={['Document', 'Version', 'Owner']} extra={(i) => [String(i.meta.version ?? 'v1.0'), i.owner ?? '—']} /></Panel>
            <Panel title="3. Issue & Comment Register"><ItemRegister room={room} kind="legal_issue" items={data.issues} columns={['Issue / Comment', 'Severity', 'Raised By']} extra={(i) => [<span key="s" className={cn('font-semibold', i.meta.severity === 'High' ? 'text-risk-700' : i.meta.severity === 'Medium' ? 'text-attested-700' : 'text-verified-700')}>{String(i.meta.severity ?? '—')}</span>, i.owner ?? '—']} /></Panel>
        </div>
    );
}

interface Cp { id: number; number: number; condition: string; category: string; owner: string; due: string | null; status: string; evidence: string | null; validated: boolean }

export function ConditionsPanel({ room, data }: { room: RoomHeader; data: { conditions: Cp[]; readiness: number; counts: Record<string, number> } }) {
    const upd = (c: Cp, payload: Record<string, string | number | boolean>) => router.patch(roomUrl(room.slug, `conditions/${c.id}`), payload, { preserveScroll: true });
    const form = useForm({ condition: '', category: 'Regulatory', owner: '', due_date: '' });
    const errors = usePage<{ errors: Record<string, string> }>().props.errors;
    return (
        <div className="space-y-5">
            <Panel title="1. Conditions Precedent Register">
                <SimpleTable
                    columns={['ID', 'Condition', 'Category', 'Owner', 'Due Date', 'Status', 'Evidence', 'Validation']}
                    rows={data.conditions.map((c) => [
                        c.number, <span key="c" className="font-medium">{c.condition}</span>, c.category, c.owner, c.due ?? '—',
                        room.manages ? (
                            <select key="s" aria-label={`Status of ${c.condition}`} value={c.status} onChange={(e) => upd(c, { status: e.target.value })} className="h-7 rounded border border-parchment-500 bg-white px-1 text-xs">
                                {['not_started', 'in_progress', 'at_risk', 'satisfied', 'waived'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                            </select>
                        ) : <StatusPill key="s" status={c.status} />,
                        room.manages ? <input key="e" aria-label={`Evidence for ${c.condition}`} defaultValue={c.evidence ?? ''} onBlur={(e) => e.target.value !== (c.evidence ?? '') && upd(c, { evidence: e.target.value })} className="h-7 w-28 rounded border border-parchment-500 px-1 text-xs" /> : c.evidence ?? '—',
                        room.manages ? <input key="v" type="checkbox" aria-label={`Validated: ${c.condition}`} checked={c.validated} onChange={(e) => upd(c, { validated: e.target.checked })} className="accent-gold-600" /> : c.validated ? 'Validated' : 'Pending',
                    ])}
                />
                {errors.validated && <p role="alert" className="mt-2 text-xs text-risk-500">{errors.validated}</p>}
                {room.manages && (
                    <form onSubmit={(e) => { e.preventDefault(); form.post(roomUrl(room.slug, 'conditions'), { preserveScroll: true, onSuccess: () => form.reset() }); }} className="mt-3 flex flex-wrap items-end gap-2">
                        <label className="min-w-40 flex-1 text-xs">New condition<input value={form.data.condition} onChange={(e) => form.setData('condition', e.target.value)} className="mt-0.5 h-8 w-full rounded border border-parchment-500 px-2 text-sm" /></label>
                        <label className="w-32 text-xs">Category<select value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} className="mt-0.5 h-8 w-full rounded border border-parchment-500 bg-white px-1 text-sm">{['Corporate', 'Regulatory', 'Commercial', 'Financing', 'Tax', 'Legal', 'Investor'].map((c) => <option key={c}>{c}</option>)}</select></label>
                        <label className="w-32 text-xs">Owner<input value={form.data.owner} onChange={(e) => form.setData('owner', e.target.value)} className="mt-0.5 h-8 w-full rounded border border-parchment-500 px-2 text-sm" /></label>
                        <Button type="submit" size="sm" variant="outline" disabled={!form.data.condition || !form.data.owner}>Add CP</Button>
                    </form>
                )}
            </Panel>
            <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="3. Closing Readiness Overview">
                    <div className="flex items-center gap-5">
                        <Gauge value={data.readiness} label="Ready" />
                        <ul className="space-y-1 text-xs"><li>Satisfied: <strong>{data.counts.satisfied}</strong></li><li>In Progress: <strong>{data.counts.in_progress}</strong></li><li>At Risk: <strong>{data.counts.at_risk}</strong></li><li>Not Started: <strong>{data.counts.not_started}</strong></li></ul>
                    </div>
                    <p className="mt-2 text-xs text-ink-500">Target readiness: 100%.</p>
                </Panel>
                <Panel title="4. Evidence Validation Summary">
                    <KvList rows={[['Total CPs', String(data.conditions.length)], ['Validated', `${data.counts.validated} (${data.conditions.length ? Math.round((data.counts.validated / data.conditions.length) * 100) : 0}%)`], ['Pending Validation', String(data.conditions.length - data.counts.validated)]]} />
                    <p className="mt-2 text-xs text-ink-500">All validation activities are logged with an immutable audit trail.</p>
                </Panel>
            </div>
        </div>
    );
}

interface SigningData {
    signatures: ItemRow[];
    pack: ItemRow[];
    funds: Record<string, string | number>;
    completed: boolean;
    completedAt: string | null;
    fee: Charge | null;
}

export function SigningPanel({ room, data }: { room: RoomHeader; data: SigningData }) {
    const funds = useForm({ amount: room.amount || 150000000, escrow: 'Standard Bank Escrow', settlement_reference: '', received_on: new Date().toISOString().slice(0, 10) });
    const signed = data.signatures.filter((s) => s.status === 'signed').length;
    const nextSigner = data.signatures.find((s) => s.status !== 'signed');
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Stat label="Signatures Completed" value={`${signed} / ${data.signatures.length}`} tone={signed === data.signatures.length ? 'good' : 'warn'} /><Stat label="Capital Received" value={data.funds.amount ? millions(Number(data.funds.amount)) : '—'} /><Stat label="Completion" value={data.completedAt ?? 'Pending'} /><Stat label="Percentage Success Fee" value="DISABLED" tone="bad" /></div>
            <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="1. Signing Pack (Locked)">
                    <SimpleTable columns={['Document', 'Version', 'Status', 'Pages', 'Hash (SHA-256)']} rows={data.pack.map((d) => [d.title, String(d.meta.version ?? ''), <StatusPill key="s" status={d.status === 'finalised' ? 'locked' : d.status} />, String(d.meta.pages ?? '—'), d.meta.hash ? `${String(d.meta.hash).slice(0, 6)}…${String(d.meta.hash).slice(-4)}` : '—'])} />
                </Panel>
                <Panel title="2. E-Signature Sequence">
                    <ol className="space-y-2">
                        {data.signatures.map((s, i) => (
                            <li key={s.id} className="flex items-center gap-3 text-[0.8125rem]">
                                <span className="flex size-6 items-center justify-center rounded-full bg-parchment-300 text-xs font-bold">{i + 1}</span>
                                <span className="flex-1"><span className="block font-medium">{s.title}</span><span className="text-xs text-ink-500">{s.owner}{s.meta.signed_at ? ` · ${s.meta.signed_at}` : ''}</span></span>
                                {s.status === 'signed' ? <StatusPill status="signed" /> : s.id === nextSigner?.id ? (
                                    <Button type="button" size="sm" variant="ink" onClick={() => router.patch(roomUrl(room.slug, `items/${s.id}`), { status: 'signed' }, { preserveScroll: true })}>Sign</Button>
                                ) : <StatusPill status="waiting" />}
                            </li>
                        ))}
                    </ol>
                    <p className="mt-2 text-xs text-ink-500">Signing order is enforced; each signature is hashed into the audit trail.</p>
                </Panel>
                <Panel title="3. Funds-Flow Evidence">
                    {data.funds.verified_at ? (
                        <KvList rows={[['Investor Funds Sent', zar(Number(data.funds.amount))], ['Escrow Account', String(data.funds.escrow)], ['Received', String(data.funds.received_on)], ['Settlement Reference', String(data.funds.settlement_reference)], ['TBCA Verification', `Verified ${data.funds.verified_at}`]]} />
                    ) : room.manages ? (
                        <form onSubmit={(e) => { e.preventDefault(); funds.post(roomUrl(room.slug, 'funds-flow'), { preserveScroll: true }); }} className="grid gap-2 sm:grid-cols-2">
                            <Field label="Amount (ZAR)" error={funds.errors.amount}>{(id) => <Input id={id} type="number" value={funds.data.amount} onChange={(e) => funds.setData('amount', Number(e.target.value))} />}</Field>
                            <Field label="Escrow account" error={funds.errors.escrow}>{(id) => <Input id={id} value={funds.data.escrow} onChange={(e) => funds.setData('escrow', e.target.value)} />}</Field>
                            <Field label="Settlement reference" error={funds.errors.settlement_reference}>{(id) => <Input id={id} value={funds.data.settlement_reference} onChange={(e) => funds.setData('settlement_reference', e.target.value)} />}</Field>
                            <Field label="Received on" error={funds.errors.received_on}>{(id) => <Input id={id} type="date" value={funds.data.received_on} onChange={(e) => funds.setData('received_on', e.target.value)} />}</Field>
                            <div className="sm:col-span-2"><Button type="submit" size="sm">Verify funds-flow evidence</Button></div>
                        </form>
                    ) : <Empty>Awaiting funds-flow evidence.</Empty>}
                    <p className="mt-2 rounded bg-risk-50 p-2 text-xs text-risk-700">TBCA verifies funds-flow evidence but does not take custody of transaction proceeds.</p>
                </Panel>
                <Panel title="4. Completion Certificate">
                    {data.completed ? (
                        <div className="rounded border border-verified-500/40 bg-verified-50 p-3 text-xs"><ShieldCheck className="mb-1 size-5 text-verified-700" aria-hidden /><p className="font-semibold">This transaction is complete.</p><KvList rows={[['Completion', data.completedAt ?? ''], ['Transaction ID', room.reference], ['Deal Room State', 'Closed'], ['Closing Reference', room.reference.replace('DR', 'CC')]]} /></div>
                    ) : <Empty>Issued automatically when all signatures, funds-flow evidence and the fixed completion fee are in place.</Empty>}
                </Panel>
            </div>
        </div>
    );
}

export function HandoverPanel({ room, data }: { room: RoomHeader; data: { handover: ItemRow[]; workstreams: ItemRow[]; risks: ItemRow[] } }) {
    const done = data.handover.filter((h) => h.status === 'completed').length;
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4"><Stat label="Handover Completion" value={`${data.handover.length ? Math.round((done / data.handover.length) * 100) : 0}%`} caption={`${done} of ${data.handover.length} items`} /><Stat label="Integration Workstreams" value={data.workstreams.length} /><Stat label="Open Issues" value={data.risks.filter((r) => r.status !== 'resolved').length} tone="warn" /><Stat label="Monitoring Setup" value="6 / 6" caption="options enabled" tone="good" /></div>
            <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="1. Handover Plan"><ItemRegister room={room} kind="handover" items={data.handover} columns={['Item', 'Owner']} /></Panel>
                <Panel title="2. Integration Workstreams"><ItemRegister room={room} kind="workstream" items={data.workstreams} columns={['Workstream', 'Owner', 'Priority']} extra={(i) => [i.owner ?? '—', String(i.meta.priority ?? '—')]} addable={false} /></Panel>
                <Panel title="4. Post-Close Risk & Open Issues" className="lg:col-span-2"><ItemRegister room={room} kind="post_close_risk" items={data.risks} columns={['Issue', 'Severity', 'Owner']} extra={(i) => [String(i.meta.severity ?? '—'), i.owner ?? '—']} /></Panel>
            </div>
        </div>
    );
}

interface ArchiveData {
    archive: { access_until?: string };
    packages: Record<string, { name: string; description: string; months: number; net: number }>;
    renewalCharge: Charge | null;
    approvals: ApprovalRow[];
}

export function ArchivePanel({ room, data }: { room: RoomHeader; data: ArchiveData }) {
    return (
        <Panel title="4. Renewal, Export & Exit Options">
            <SimpleTable columns={['Action', 'Availability', 'Status']} rows={[
                ['Archive Renewal', 'Available', data.renewalCharge ? <StatusPill key="r" status={data.renewalCharge.status} /> : 'Not Requested'],
                ['Post-Close Subscription', 'Available', <a key="s" className="text-controlled-700 underline" href={roomUrl(room.slug, 'commercial/post-close-subscription')}>Manage</a>],
                ['Export Full Archive', 'Available', 'On Demand'],
                ['Request Verified Deletion', <span key="l" className="inline-flex items-center gap-1 text-risk-700"><Lock className="size-3" aria-hidden />Locked</span>, 'Locked until retention, legal hold, payment and named approvals clear'],
            ]} />
            <p className="mt-2 text-xs text-ink-500">Archive access {data.archive?.access_until ? `active until ${data.archive.access_until}` : 'active for the current term'}. <a href={roomUrl(room.slug, 'archive-renewal')} className="font-semibold text-gold-700 underline">Archive renewal options</a></p>
        </Panel>
    );
}

export function RenewalPanel({ room, data }: { room: RoomHeader; data: ArchiveData }) {
    const { auth } = usePage<SharedProps>().props;
    const form = useForm({ package: 'standard_12', confirm: false });
    const c = data.renewalCharge;
    const approved = data.approvals.length > 0 && data.approvals.every((a) => a.status === 'approved');
    return (
        <div className="grid gap-5 lg:grid-cols-3">
            <Panel title="1. Current Archive Coverage">
                <KvList rows={[['Archive Record Status', 'Active'], ['Legal Retention Policy', '7 Years'], ['Archive Access Term', data.archive?.access_until ? `Active until ${data.archive.access_until}` : 'Current term'], ['Monitoring Package', 'Enabled'], ['Export Rights', 'Controlled'], ['Verified Deletion', 'Locked']]} />
            </Panel>
            <Panel title="2. Renewal Package & Term Selection" className="lg:col-span-2">
                <form onSubmit={(e) => { e.preventDefault(); form.post(roomUrl(room.slug, 'renewal'), { preserveScroll: true }); }} className="space-y-2">
                    {Object.entries(data.packages).map(([k, p]) => (
                        <label key={k} className={cn('flex cursor-pointer items-start gap-3 rounded-[6px] border p-3 text-[0.8125rem]', form.data.package === k ? 'border-gold-500 bg-gold-50' : 'border-parchment-400')}>
                            <input type="radio" name="package" className="mt-1 accent-gold-600" checked={form.data.package === k} onChange={() => form.setData('package', k)} />
                            <span className="flex-1"><span className="block font-semibold">{p.name}</span>{p.description}</span>
                            <strong>{zar(p.net)}</strong>
                        </label>
                    ))}
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="accent-gold-600" checked={form.data.confirm} onChange={(e) => form.setData('confirm', e.target.checked)} /> Client confirms archive renewal scope and commercial terms.</label>
                    {form.errors.confirm && <p role="alert" className="text-xs text-risk-500">{form.errors.confirm}</p>}
                    {room.manages && <Button type="submit" size="sm" variant="outline" disabled={form.processing}>Select renewal</Button>}
                </form>
            </Panel>
            <Panel title="3. Commercial Summary">
                {c ? (
                    <>
                        <KvList rows={[['Renewal', c.description], ['Renewal Fee', zar(c.net)], ['VAT (15%)', zar(c.vat)], ['Total Due', zar(c.total)], ['Payment State', <StatusPill key="s" status={c.status} />]]} />
                        {!['paid'].includes(c.status) && room.manages && (
                            <Button type="button" size="sm" className="mt-3 w-full" disabled={!approved} onClick={() => router.post(roomUrl(room.slug, `charges/${c.id}/pay`), { return: roomUrl(room.slug, 'archive-renewal') })}>Approve Renewal & Pay</Button>
                        )}
                        {!approved && <p className="mt-1 text-xs text-ink-500">Approvals must be complete before payment.</p>}
                    </>
                ) : <Empty>Renewal has not been selected yet.</Empty>}
            </Panel>
            <Panel title="5. Approvals & Acceptance" className="lg:col-span-2">
                <ApprovalList slug={room.slug} approvals={data.approvals} isAdmin={auth.user?.role === 'admin'} isOwner={room.role === 'owner'} />
                <ul className="mt-3 grid gap-1 sm:grid-cols-2">{['Monitoring reminders', 'Quarterly review support', 'Renewal audit trail', 'Access restrictions preserved'].map((x) => <CheckItem key={x} done>{x}</CheckItem>)}</ul>
            </Panel>
        </div>
    );
}
