import { router, usePage } from '@inertiajs/react';
import { CreditCard, Lock, LockOpen, ShieldAlert } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Panel, StatusPill } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { Gate, RoomHeader, StageInfo } from '@/types/deal-room';
import { ApprovalList, CheckItem, zar } from './Ui';

/**
 * The stage gate: completion test (manual ticks + live checks), named human
 * approvals, stage fee and the Complete button. Mirrors the blueprint lock
 * rule — the next stage stays locked until everything passes.
 */
export default function GatePanel({ room, stage, gate, compact = false }: { room: RoomHeader; stage: StageInfo; gate: Gate; compact?: boolean }) {
    const { auth, errors } = usePage<SharedProps & { errors: Record<string, string> }>().props;
    const isAdmin = auth.user?.role === 'admin';
    const isOwner = room.role === 'owner';
    const base = `/virtual-deal-room/rooms/${room.slug}/stages/${stage.code}`;
    const done = stage.status === 'completed';
    const locked = stage.status === 'locked';

    const tick = (key: string, value: boolean) => router.post(`${base}/tick`, { key, done: value }, { preserveScroll: true });

    return (
        <Panel
            title={`Stage ${stage.code} Completion Test`}
            action={<StatusPill status={done ? 'completed' : locked ? 'locked' : gate.passed ? 'ready' : 'in_progress'} tone={done ? 'good' : locked ? 'bad' : gate.passed ? 'good' : 'warn'} />}
            className={cn(compact ? '' : 'border-gold-400')}
        >
            {locked ? (
                <div className="flex items-start gap-2 rounded-[6px] bg-parchment-200 p-3 text-xs text-ink-600">
                    <Lock className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <p>{stage.lockRule}</p>
                </div>
            ) : (
                <>
                    <ul className="space-y-1.5">
                        {gate.checks.map((c) =>
                            c.auto || !room.manages || done ? (
                                <CheckItem key={c.key} done={c.done}>
                                    {c.label}
                                    {c.auto && <span className="ml-1 text-[0.625rem] text-ink-400 uppercase">auto</span>}
                                </CheckItem>
                            ) : (
                                <li key={c.key}>
                                    <label className="flex cursor-pointer items-start gap-2 text-[0.8125rem] text-ink-700">
                                        <input type="checkbox" className="mt-0.5 size-4 accent-gold-600" checked={c.done} onChange={(e) => tick(c.key, e.target.checked)} />
                                        <span>{c.label}</span>
                                    </label>
                                </li>
                            ),
                        )}
                        {gate.checks.length === 0 && <li className="text-xs text-ink-400">No checklist items for this stage.</li>}
                    </ul>

                    {gate.approvals.length > 0 && (
                        <div className="mt-4">
                            <p className="mb-1 text-xs font-bold tracking-wide text-ink-900 uppercase">Human Approvals</p>
                            <ApprovalList slug={room.slug} approvals={gate.approvals} isAdmin={isAdmin} isOwner={isOwner} />
                        </div>
                    )}

                    {gate.fee && (
                        <div className="mt-4 rounded-[6px] border border-parchment-400 p-3 text-[0.8125rem]">
                            <p className="flex items-center justify-between gap-2">
                                <span>
                                    <span className="block font-semibold text-ink-900">Stage fee · {gate.fee.code}</span>
                                    <span className="text-xs text-ink-500">{gate.fee.name}</span>
                                </span>
                                <span className="text-right">
                                    <span className="block font-bold">{zar(gate.fee.net)} <span className="text-xs font-normal text-ink-400">excl. VAT</span></span>
                                    <StatusPill status={gate.fee.paid ? 'paid' : gate.fee.charge?.status ?? 'issued'} />
                                </span>
                            </p>
                            {!gate.fee.paid && room.manages && (
                                <Button type="button" size="sm" variant="ink" className="mt-2 w-full" onClick={() => router.post(`${base}/pay`)}>
                                    <CreditCard className="size-4" aria-hidden /> Pay stage fee securely
                                </Button>
                            )}
                        </div>
                    )}

                    {!done && gate.blockers.length > 0 && (
                        <div className="mt-4 rounded-[6px] bg-attested-50 p-3 text-xs text-attested-700">
                            <p className="mb-1 flex items-center gap-1 font-semibold"><ShieldAlert className="size-3.5" aria-hidden /> Outstanding before Stage {stage.next?.code ?? ''} unlocks</p>
                            <ul className="list-disc space-y-0.5 pl-4">
                                {gate.blockers.slice(0, 6).map((b) => (
                                    <li key={b}>{b}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {errors?.stage && <p role="alert" className="mt-3 text-xs font-medium text-risk-500">{errors.stage}</p>}

                    {done ? (
                        <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-verified-700">
                            <LockOpen className="size-4" aria-hidden /> Completed {stage.completedAt}. {stage.next ? `Stage ${stage.next.code} unlocked.` : 'Final stage.'}
                        </p>
                    ) : (
                        room.manages && (
                            <Button type="button" className="mt-4 w-full" disabled={!gate.passed} onClick={() => router.post(`${base}/complete`)}>
                                {gate.passed ? <LockOpen className="size-4" aria-hidden /> : <Lock className="size-4" aria-hidden />}
                                {stage.next ? `Complete & unlock Stage ${stage.next.code}` : 'Complete final stage'}
                            </Button>
                        )
                    )}
                </>
            )}
        </Panel>
    );
}
