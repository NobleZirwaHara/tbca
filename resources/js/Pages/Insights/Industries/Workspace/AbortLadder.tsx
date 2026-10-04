import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Download, Info, ShieldCheck } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Checkbox, Field, Textarea } from '@/Components/ui/Form';
import { WorkspaceShell } from '@/Components/Insights/Industries';
import { Box, Chip, Table, zar } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';
import type { WorkspaceBase } from '@/types/insights';

interface Rung { stage: string; point: string; when: string; keep: string; forfeit: string; fees: string; action: string; available: boolean; passed: boolean }
interface Props extends WorkspaceBase {
    ladder: Rung[];
    summary: { points: number; paid: number; forfeiture: number; nonRefundable: number };
    status: string;
}

export default function AbortLadder(props: Props) {
    const { engagement: e, ladder, summary, status } = props;
    const root = `/industries/workspace/${e.reference}`;
    const [rung, setRung] = useState<Rung | null>(null);
    const form = useForm({ confirm: false, reason: '' });

    return (
        <WorkspaceShell
            base={props}
            title="Abort Ladder"
            badge={<Chip tone={status === 'active' ? 'red' : 'grey'}>{status === 'active' ? 'Action Required' : 'Engagement ' + status}</Chip>}
            description="You can exit at any stage. This ladder shows when you can abort, what you keep, what you forfeit, and any fees that apply."
            actions={<a href={`${root}/abort-policy`} className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><Download className="size-4" /> Download Abort Policy (PDF)</a>}
            right={
                <>
                    <Box title="Key Principles">
                        <ul className="space-y-2.5 text-xs">{[['You are always in control.', 'Abort rights are built into every stage.'], ['Transparency first.', 'Fees, forfeiture, and rights are disclosed upfront.'], ['No surprises.', "All abort rules follow TBCA's Fair Engagement Policy."], ['Evidence based.', 'Abort rules are tied to work completed, not time only.']].map(([t, s]) => <li key={t} className="flex gap-2"><ShieldCheck className="size-4 shrink-0 text-gold-600" /><span><strong className="block">{t}</strong>{s}</span></li>)}</ul>
                    </Box>
                    <Box title="Abort Summary (This Engagement)">
                        <dl className="space-y-1.5 text-xs">
                            <div className="flex justify-between"><dt>Abort Points Available</dt><dd className="font-semibold text-verified-700">{summary.points}</dd></div>
                            <div className="flex justify-between"><dt>Fees Already Paid</dt><dd className="font-semibold text-verified-700">{zar(summary.paid, 2)}</dd></div>
                            <div className="flex justify-between"><dt>Potential Forfeiture</dt><dd className="font-semibold">{zar(summary.forfeiture, 2)}</dd></div>
                            <div className="flex justify-between"><dt>Non-Refundable Fees</dt><dd className="font-semibold text-gold-800">{zar(summary.nonRefundable, 2)}</dd></div>
                        </dl>
                    </Box>
                </>
            }
        >
            <Box title="The Abort Ladder">
                <Table
                    head={['Stage', 'Abort Point', 'When You Can Abort', 'What You Keep', 'What You Forfeit', 'Fees That Apply', 'Action']}
                    rows={ladder.map((r) => [
                        <span key="a" className={cn('rounded px-1.5 py-0.5 text-xs font-bold', r.passed ? 'bg-parchment-300 text-ink-500' : r.available ? 'bg-gold-500 text-ink-900' : 'bg-controlled-50 text-controlled-700')}>{r.stage}</span>,
                        <strong key="b" className="text-xs">{r.point}</strong>,
                        <span key="c" className="text-xs">{r.when}</span>,
                        <span key="d" className="text-xs">{r.keep}</span>,
                        <span key="e" className="text-xs">{r.forfeit}</span>,
                        <span key="f" className="text-xs">{r.fees}</span>,
                        r.available ? (
                            <button key="g" type="button" onClick={() => setRung(r)} className="rounded border border-risk-500/50 px-2 py-1 text-xs font-semibold whitespace-nowrap text-risk-700">{r.action}</button>
                        ) : (
                            <span key="g" className="text-xs text-ink-400">{r.passed ? 'Passed' : 'Not yet'}</span>
                        ),
                    ])}
                />
            </Box>
            <p className="flex items-center gap-2 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-3 text-xs text-controlled-700"><Info className="size-4" /> You can always stop and start again. Aborting does not affect your ability to return later.</p>
            <p className="rounded-[8px] border border-attested-500/30 bg-attested-50 p-3 text-xs"><strong>Important:</strong> Review the full Abort Policy for detailed terms, deadlines, and fee schedules.</p>

            <Modal open={!!rung} onClose={() => setRung(null)} title={`${rung?.action ?? ''} at ${rung?.stage ?? ''}`}
                footer={<><button type="button" onClick={() => setRung(null)} className="rounded border border-parchment-500 px-4 py-2 text-sm">Keep engagement</button><button type="button" disabled={form.processing} onClick={() => form.post(`${root}/abort`, { onSuccess: () => setRung(null) })} className="rounded bg-risk-500 px-4 py-2 text-sm font-semibold text-white">Confirm abort</button></>}>
                {rung && (
                    <div className="space-y-3 text-sm">
                        <p><strong>You keep:</strong> {rung.keep}</p>
                        <p><strong>You forfeit:</strong> {rung.forfeit}</p>
                        <p><strong>Fees:</strong> {rung.fees}</p>
                        <Field label="Reason (optional)" error={form.errors.reason}>{(id) => <Textarea id={id} value={form.data.reason} onChange={(ev) => form.setData('reason', ev.target.value)} />}</Field>
                        <Checkbox label="I understand what I keep and forfeit at this stage." checked={form.data.confirm} onChange={(ev) => form.setData('confirm', ev.target.checked)} />
                        {form.errors.confirm && <p role="alert" className="text-xs text-risk-500">{form.errors.confirm}</p>}
                    </div>
                )}
            </Modal>
        </WorkspaceShell>
    );
}
