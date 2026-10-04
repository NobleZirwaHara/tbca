import { useForm } from '@inertiajs/react';
import { CalendarClock, Lock, ShieldCheck, TriangleAlert } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Textarea } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';
import { LedgerBadge, StatusDot, zar } from '@/Components/Advisory/ui';
import type { MandateView } from '@/types/advisory';

export interface PaGateDetail {
    code: string;
    name: string;
    binds: string;
    expires: string | null;
    checks: { label: string; ok: boolean; result: string; state: 'cleared' | 'blocking' | 'unresolved' }[];
    blocking: number;
    unresolved: number;
    fingerprint: string;
    method_card: string;
    ledgers: { ledger: string; name: string; recipient: string; amount: number; basis: string }[];
    evidence: { item: string; status: string }[];
}

/** Gate approval modal: approval is server-authorised and disabled while any check is blocking or unresolved. */
export default function PaGateModal({ open, onClose, gate, mandate }: { open: boolean; onClose: () => void; gate: PaGateDetail; mandate: MandateView }) {
    const form = useForm({ decision: 'approve', confirm: false, note: '' });
    const blocked = gate.blocking + gate.unresolved > 0;
    const send = (decision: 'approve' | 'decline' | 'change') => {
        form.transform((d) => ({ ...d, decision }));
        form.post(`/project-advisory/workspace/${mandate.reference}/gates/${gate.code}`, { preserveScroll: true, onSuccess: () => onClose() });
    };
    return (
        <Modal open={open} onClose={onClose} size="xl" title={`Approve ${gate.name}`}
            footer={
                <div className="flex w-full flex-wrap items-center justify-between gap-2">
                    <p className="flex items-center gap-1.5 text-xs text-ink-500"><TriangleAlert className="size-3.5" />Approval does not verify payment. Payment verification and approval are separate controls.</p>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => send('change')} disabled={form.processing}>Request Change</Button>
                        <Button variant="outline" onClick={() => send('decline')} disabled={form.processing}>Decline</Button>
                        <Button onClick={() => send('approve')} disabled={blocked || !form.data.confirm || form.processing}>{blocked && <Lock className="size-4" />}Approve Gate</Button>
                    </div>
                </div>
            }>
            <div className="space-y-4 text-sm">
                <div className="grid gap-3 rounded border border-gold-300 bg-gold-50 p-3 sm:grid-cols-4">
                    <div><p className="text-xs text-ink-500">Gate ID</p><p className="font-serif text-2xl font-bold text-gold-700">{gate.code}</p></div>
                    <div><p className="text-xs text-ink-500">Stage</p><p className="font-semibold">{gate.name}</p><p className="text-[0.6875rem] text-ink-500">Binds: {gate.binds}</p></div>
                    <div><p className="text-xs text-ink-500">Status</p><p className="font-semibold text-attested-700">Pending Approval</p></div>
                    <div><p className="text-xs text-ink-500">Gate Expires</p><p className="flex items-center gap-1 font-semibold text-risk-700"><CalendarClock className="size-4" />{gate.expires ?? '—'}</p></div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded border border-parchment-400 p-3 text-xs"><p className="font-semibold">Current Commercial Fingerprint</p><p className="mt-1 font-mono break-all">{gate.fingerprint}</p><p className="mt-1">Project: {mandate.project} · Route: {mandate.route.replace('-', ' ')} · Currency ZAR</p></div>
                    <div className="rounded border border-parchment-400 p-3 text-xs"><p className="font-semibold">Method Card Summary</p><p className="mt-1">Method Card {gate.method_card} · Approval basis TBCA Methodology · Lead {mandate.lead ?? '—'} · Reviewer {mandate.reviewer ?? '—'}</p></div>
                </div>
                <div className="grid gap-2 sm:grid-cols-5">
                    {gate.ledgers.map((l) => (
                        <div key={l.ledger} className="rounded border border-parchment-400 p-2 text-[0.6875rem]">
                            <p className="flex items-center gap-1.5 font-semibold"><LedgerBadge l={l.ledger} size="sm" />{l.name}</p>
                            <p className="mt-1">Recipient: {l.recipient}</p>
                            <p>Amount at this gate: <b>{l.ledger === 'C' ? 'Conditional only' : zar(l.amount)}</b></p>
                            <p className="text-ink-500">Basis: {l.basis}</p>
                        </div>
                    ))}
                </div>
                <p className="text-[0.6875rem] text-ink-500">All amounts exclusive of VAT unless stated otherwise. Each ledger is approved on its own — no combined total.</p>
                <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded border border-parchment-400 p-3">
                        <p className="text-sm font-semibold">Pre-Approval Checks</p>
                        <ul className="mt-2 space-y-1 text-xs">
                            {gate.checks.map((c) => <li key={c.label} className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5"><StatusDot state={c.ok ? 'ok' : c.state === 'blocking' ? 'bad' : 'warn'} />{c.label}</span><span className={c.ok ? 'text-verified-700' : 'text-risk-700'}>{c.result}</span></li>)}
                        </ul>
                    </div>
                    <div className="space-y-3">
                        <div className="rounded border border-attested-500/40 bg-attested-50 p-3 text-xs text-attested-700"><b>Payment verification and approval are separate controls.</b> Approval does not verify payment. This Gate cannot be approved while any Blocking or Unresolved checks exist.</div>
                        <div className="rounded border border-parchment-400 p-3 text-xs">
                            <p className="flex items-center gap-1.5 font-semibold"><ShieldCheck className="size-4 text-verified-500" />Server-Authorised Approval Logic</p>
                            <p className="mt-1">Approval is recorded server-side with an immutable audit trail. All mandatory checks must be cleared to enable approval.</p>
                            <p className="mt-1">Current Check State: <b className={blocked ? 'text-risk-700' : 'text-verified-700'}>{gate.blocking} Blocking, {gate.unresolved} Unresolved</b></p>
                            <p>Approval Outcome: {blocked ? 'Approval currently disabled' : 'Approval available'}</p>
                        </div>
                        {gate.evidence.filter((e) => !['Submitted', 'Accepted'].includes(e.status)).length > 0 && <p className="text-xs text-risk-700">Outstanding evidence: {gate.evidence.filter((e) => !['Submitted', 'Accepted'].includes(e.status)).map((e) => e.item).join(', ')}</p>}
                    </div>
                </div>
                <Checkbox label="I confirm I have reviewed the scope, fees by ledger, external commitments and my authority to approve this gate only." checked={form.data.confirm} onChange={(e) => form.setData('confirm', e.target.checked)} />
                <label className="block text-xs">Note for change request / decline (optional)<Textarea value={form.data.note} onChange={(e) => form.setData('note', e.target.value)} className="mt-1 min-h-14" /></label>
                {Object.values(form.errors).map((e) => <p key={e} className="text-xs text-risk-600" role="alert">{e}</p>)}
            </div>
        </Modal>
    );
}
