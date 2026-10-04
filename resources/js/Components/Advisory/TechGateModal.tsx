import { useForm } from '@inertiajs/react';
import { Lock } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';
import { LedgerBadge, Notice, zar, zarRange } from '@/Components/Advisory/ui';
import type { TechHeader } from '@/types/advisory';

export interface TechGate { number: number; name: string; assent: string; status: string; t: number; x: [number, number]; x_funded: boolean; vat: number; fingerprint: string | null; expires: string | null; order: string | null; order_status: string | null }

/** Current-gate approval (GATE-TS-0n). Ledgers are shown separately; only "amount payable now" is a single figure. */
export default function TechGateModal({ open, onClose, gate, e }: { open: boolean; onClose: () => void; gate: TechGate; e: TechHeader }) {
    const form = useForm({ decision: 'approve', confirm: false });
    const send = (decision: 'approve' | 'decline' | 'review' | 'fund') => {
        form.transform((d) => ({ ...d, decision }));
        form.post(`/technology-solutions/workspace/${e.reference}/gates/${gate.number}`, { preserveScroll: true });
    };
    const awaitingPay = gate.status === 'approved_not_paid';
    return (
        <Modal open={open} onClose={onClose} size="xl" title={`Approve Gate ${gate.number}: ${gate.name}`}
            footer={<div className="flex flex-wrap gap-2"><Button variant="outline" className="border-risk-500 text-risk-700" onClick={() => send('decline')} disabled={form.processing || awaitingPay}>Decline / Stop Here</Button><Button variant="outline" onClick={() => send('review')} disabled={form.processing || awaitingPay}>Ask for Review</Button><Button onClick={() => send('approve')} disabled={(!form.data.confirm && !awaitingPay) || form.processing}>{awaitingPay ? 'Complete payment' : 'Approve This Gate'} ›</Button></div>}>
            <div className="space-y-4 text-sm">
                <span className="inline-block rounded bg-attested-50 px-2 text-xs font-semibold text-attested-700">{awaitingPay ? 'Approved — payment pending' : 'Ready for Client Approval'}</span>
                <dl className="grid grid-cols-2 gap-2 rounded border border-parchment-400 p-3 text-xs sm:grid-cols-4"><div><dt className="text-ink-500">Engagement Reference</dt><dd className="font-mono">{e.reference}</dd></div><div><dt className="text-ink-500">Client</dt><dd>{e.organisation}</dd></div><div><dt className="text-ink-500">Solution</dt><dd>{e.tower}</dd></div><div><dt className="text-ink-500">Current Stage</dt><dd>{e.stage_name}</dd></div></dl>
                <div className="rounded border border-gold-300 bg-gold-50 p-3 text-xs"><p className="font-semibold">What You Are Approving Now</p><p>This approval covers only the current gate. It does not approve future gates or any undisclosed variations.</p><p className="mt-1">Scope Fingerprint: <span className="font-mono">{gate.fingerprint}</span></p><p className="mt-1 italic">&ldquo;{gate.assent}&rdquo;</p></div>
                <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded border border-parchment-400 p-3 text-xs"><p className="flex items-center gap-2 font-semibold"><LedgerBadge l="T" size="sm" />TBCA Professional Fees</p><p className="mt-1">Recipient: TBCA · Certainty: Fixed</p><p className="mt-2 text-ink-500">Amount Payable Now</p><p className="text-xl font-bold">{zar(gate.t)}</p><p className="text-[0.6875rem] text-ink-500">excl. VAT · Current gate</p></div>
                    <div className="rounded border border-parchment-400 p-3 text-xs"><p className="flex items-center gap-2 font-semibold"><LedgerBadge l="X" size="sm" />External Costs / Supplier Funding</p><p className="mt-1">Recipient: External Providers · Certainty: Estimated</p><p className="mt-2 text-ink-500">Estimated Amount Range</p><p className="text-lg font-bold">{gate.x[1] ? zarRange(gate.x) : 'None at this gate'}</p>{gate.x[1] > 0 && (gate.x_funded ? <p className="text-verified-700">Funding cleared</p> : <p className="flex items-center gap-1 text-risk-700"><Lock className="size-3" />No supplier commitment before cleared X funding.</p>)}{gate.x[1] > 0 && !gate.x_funded && <Button size="sm" variant="outline" className="mt-2" onClick={() => send('fund')}>Fund Ledger X</Button>}</div>
                    <div className="rounded border border-parchment-400 p-3 text-xs"><p className="flex items-center gap-2 font-semibold"><LedgerBadge l="S" size="sm" />Statutory / Tax Treatment</p><p className="mt-1">Recipient: SARS / Statutory Authorities · As Per Law</p><p className="mt-2">VAT 15% applies where taxable: {zar(gate.vat)} on this gate&rsquo;s TBCA fee. No blended tax total.</p></div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded border border-parchment-400 p-3 text-xs"><p className="font-semibold">Certainty and Unknowns</p><ul className="mt-1 space-y-0.5"><li><b>Fixed</b> — Amount is fixed for this gate.</li><li><b>Estimated</b> — Best estimate; may vary within range.</li><li><b>Quote Pending</b> — Supplier quote not yet confirmed.</li><li><b>As Per Law</b> — Determined by statute.</li></ul></div>
                    <div className="rounded border border-parchment-400 p-3 text-xs"><p className="font-semibold">Important Commercial Rules</p><ul className="mt-1 list-disc space-y-0.5 pl-4"><li>This approval applies only to the current gate.</li><li>Future gates require separate approval.</li><li>No undisclosed changes are authorised.</li><li>Supplier commitment requires cleared Ledger X funding.</li><li>Entitlement does not activate from browser success alone.</li></ul></div>
                </div>
                <Notice tone="bad"><span><b>Decline / Stop Here</b> — If you decline this gate, work pauses at the current boundary. No future gate charges are approved. Existing earned or incurred amounts remain governed by the Engagement Letter.</span></Notice>
                {!awaitingPay && <Checkbox label="I confirm that I have reviewed the scope, current-gate fees, external cost treatment, statutory treatment, and authority to approve this gate on behalf of the client." checked={form.data.confirm} onChange={(ev) => form.setData('confirm', ev.target.checked)} />}
                {Object.values(form.errors).map((x) => <p key={x} className="text-xs text-risk-600">{x}</p>)}
                <p className="text-[0.6875rem] text-ink-500">Gate version v1 · Fee Schedule FS-{e.tower_code} v1.2 · Engagement Letter EL-{e.tower_code} v1.2 · Authority Verified · Expires {gate.expires}</p>
            </div>
        </Modal>
    );
}
