import { router } from '@inertiajs/react';
import { Check, CircleCheck, CircleDashed, CircleX, Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import { formatZar } from '@/lib/money';
import type { ApprovalRow, AuditEntry, Block, Charge } from '@/types/deal-room';
import { displayCurrency, displayMoney, displayRates } from '@/lib/money';
import { compactMoney } from '@/lib/moneyBands';

export const zar = (n: number) => displayCurrency() !== 'ZAR' ? displayMoney(n) : `ZAR ${Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' ')}`;
export const rands = (n: number) => displayMoney(n);
export const millions = (n: number) => displayCurrency() !== 'ZAR' ? compactMoney(n, displayCurrency(), displayRates()) : `ZAR ${(n / 1_000_000).toFixed(1)}m`;

/** Circular score gauge (0-100). */
export function Gauge({ value, label, caption, size = 112, tone }: { value: number; label?: string; caption?: string; size?: number; tone?: 'good' | 'warn' | 'bad' }) {
    const t = tone ?? (value >= 80 ? 'good' : value >= 60 ? 'warn' : 'bad');
    const color = { good: 'var(--color-verified-500)', warn: 'var(--color-gold-500)', bad: 'var(--color-risk-500)' }[t];
    const r = 42;
    const c = 2 * Math.PI * r;
    return (
        <figure className="flex flex-col items-center" style={{ width: size }}>
            <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={`${label ?? 'Score'} ${value}%`}>
                <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-parchment-300)" strokeWidth="10" />
                <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={`${(Math.max(0, Math.min(100, value)) / 100) * c} ${c}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
                <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="fill-ink-900 text-[22px] font-bold">{`${value}%`}</text>
            </svg>
            {(label || caption) && (
                <figcaption className="mt-1 text-center text-xs">
                    {label && <span className="block font-semibold text-ink-800">{label}</span>}
                    {caption && <span className="text-ink-500">{caption}</span>}
                </figcaption>
            )}
        </figure>
    );
}

export function Stat({ label, value, caption, tone = 'neutral' }: { label: ReactNode; value: ReactNode; caption?: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'gold' }) {
    return (
        <div className="rounded-[6px] border border-parchment-400 bg-white px-3 py-2.5 text-center">
            <p className={cn('text-lg font-bold', { neutral: 'text-ink-900', good: 'text-verified-700', warn: 'text-attested-700', bad: 'text-risk-700', gold: 'text-gold-700' }[tone])}>{value}</p>
            <p className="text-[0.6875rem] font-medium text-ink-500">{label}</p>
            {caption && <p className="text-[0.6875rem] text-ink-400">{caption}</p>}
        </div>
    );
}

export function StatStrip({ items }: { items: { label: ReactNode; value: ReactNode; caption?: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'gold' }[] }) {
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {items.map((i, k) => (
                <Stat key={k} {...i} />
            ))}
        </div>
    );
}

export function KvList({ rows, className }: { rows: [ReactNode, ReactNode][]; className?: string }) {
    return (
        <dl className={cn('divide-y divide-parchment-300 text-[0.8125rem]', className)}>
            {rows.map(([k, v], i) => (
                <div key={i} className="grid grid-cols-[minmax(0,10rem)_1fr] gap-3 py-1.5">
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="font-medium text-ink-900">{v}</dd>
                </div>
            ))}
        </dl>
    );
}

export function CheckItem({ done, children, pending }: { done: boolean; children: ReactNode; pending?: boolean }) {
    return (
        <li className="flex items-start gap-2 text-[0.8125rem] text-ink-700">
            {done ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-verified-500" aria-label="Done" /> : pending ? <Clock className="mt-0.5 size-4 shrink-0 text-attested-500" aria-label="Pending" /> : <CircleDashed className="mt-0.5 size-4 shrink-0 text-ink-300" aria-label="Not done" />}
            <span>{children}</span>
        </li>
    );
}

export function Bar({ value, tone }: { value: number; tone?: 'good' | 'warn' | 'bad' | 'gold' }) {
    const t = tone ?? (value >= 95 ? 'bad' : value >= 80 ? 'warn' : 'good');
    return (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-parchment-300" aria-hidden>
            <div className={cn('h-full rounded-full', { good: 'bg-verified-500', warn: 'bg-attested-500', bad: 'bg-risk-500', gold: 'bg-gold-500' }[t])} style={{ width: `${Math.min(100, value)}%` }} />
        </div>
    );
}

/** Named approvals with approve / reject buttons when the viewer may record them. */
export function ApprovalList({ slug, approvals, isAdmin, isOwner }: { slug: string; approvals: ApprovalRow[]; isAdmin: boolean; isOwner: boolean }) {
    if (!approvals.length) return <p className="text-xs text-ink-400">No named approvals required.</p>;
    const decide = (id: number, decision: 'approved' | 'rejected') => router.post(`/virtual-deal-room/rooms/${slug}/approvals/${id}`, { decision }, { preserveScroll: true });
    return (
        <ul className="divide-y divide-parchment-300">
            {approvals.map((a) => {
                const canDecide = a.status === 'pending' && (isAdmin || (isOwner && a.clientSide));
                return (
                    <li key={a.id} className="flex flex-wrap items-center gap-2 py-2 text-[0.8125rem]">
                        <span className="min-w-0 flex-1">
                            <span className="block font-medium text-ink-900">{a.approver}</span>
                            <span className="text-xs text-ink-500">{a.role}{a.decidedAt ? ` · ${a.decidedBy} · ${a.decidedAt}` : ''}</span>
                        </span>
                        <StatusPill status={a.status} />
                        {canDecide && (
                            <span className="flex gap-1">
                                <button type="button" onClick={() => decide(a.id, 'approved')} className="rounded border border-verified-500/40 px-2 py-0.5 text-xs font-semibold text-verified-700 hover:bg-verified-50">
                                    Approve
                                </button>
                                <button type="button" onClick={() => decide(a.id, 'rejected')} className="rounded border border-risk-500/40 px-2 py-0.5 text-xs font-semibold text-risk-700 hover:bg-risk-50">
                                    Reject
                                </button>
                            </span>
                        )}
                        {a.status === 'pending' && !canDecide && <span className="text-[0.6875rem] text-ink-400">{a.clientSide ? 'Client approval' : 'TBCA records this'}</span>}
                    </li>
                );
            })}
        </ul>
    );
}

export function ChargeTable({ charge }: { charge: Charge }) {
    return (
        <SimpleTable
            columns={['Fee Category', 'Line Item', 'Net', 'VAT (15%)', 'Total']}
            rows={[
                ...charge.lines.map((l) => [l.category, l.item, zar(l.net), zar(l.vat), zar(l.net + l.vat)]),
                [<strong key="t">Totals</strong>, '', <strong key="n">{zar(charge.net)}</strong>, <strong key="v">{zar(charge.vat)}</strong>, <strong key="g">{zar(charge.total)}</strong>],
            ]}
        />
    );
}

export function AuditPanel({ audit, title = 'Evidence & Audit Trail' }: { audit: AuditEntry[]; title?: string }) {
    return (
        <Panel title={title}>
            {audit.length === 0 ? (
                <p className="text-xs text-ink-400">No events yet.</p>
            ) : (
                <ol className="space-y-2">
                    {audit.map((e) => (
                        <li key={e.id} className="flex gap-2 text-xs">
                            <Check className="mt-0.5 size-3.5 shrink-0 text-verified-500" aria-hidden />
                            <span className="min-w-0 flex-1 text-ink-700">
                                {e.description}
                                <span className="block text-[0.6875rem] text-ink-400">
                                    {e.at} · {e.actor} · <code>{e.event}</code>
                                </span>
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </Panel>
    );
}

export function AiNote({ title = 'Michaela | AI Deal Assistant', children }: { title?: string; children: ReactNode }) {
    return (
        <aside className="rounded-[8px] border border-gold-400/60 bg-gold-50 p-4 text-[0.8125rem] text-ink-700">
            <p className="mb-1 text-xs font-bold tracking-wide text-gold-800 uppercase">{title}</p>
            {children}
            <p className="mt-2 text-[0.6875rem] text-ink-500">Source-grounded. AI cannot approve fees, legal conclusions or stage releases — human approval is required.</p>
        </aside>
    );
}

const toneFor = (v: string) => {
    const s = v.toLowerCase();
    if (/^(high|escalated|removed|locked)$/.test(s)) return 'text-risk-700 font-semibold';
    if (/^(medium|pending|in review|in progress|modified|under discussion)$/.test(s)) return 'text-attested-700 font-semibold';
    if (/^(low|verified|mapped|ready|agreed|active|completed|archived|issued|added|approved)$/.test(s)) return 'text-verified-700 font-semibold';
    return '';
};

/** Renders analysis blocks supplied by the PHP stage content register. */
export function BlockGrid({ blocks }: { blocks: Block[] }) {
    if (!blocks.length) return null;
    return (
        <div className="grid gap-5 lg:grid-cols-2">
            {blocks.map((b, i) => (
                <Panel key={i} title={b.title} className={cn(b.span === 2 && 'lg:col-span-2')}>
                    {b.type === 'table' && (
                        <SimpleTable columns={b.columns} rows={b.rows.map((r) => r.map((c, j) => <span key={j} className={toneFor(c)}>{c}</span>))} />
                    )}
                    {b.type === 'kv' && <KvList rows={b.rows.map(([k, v]) => [k, <span key={k} className={toneFor(v)}>{v}</span>])} />}
                    {b.type === 'list' && (
                        <ul className="space-y-1.5">
                            {b.items.map((it) => (
                                <CheckItem key={it} done>
                                    {it}
                                </CheckItem>
                            ))}
                        </ul>
                    )}
                    {b.type === 'metrics' && (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {b.items.map((m) => (
                                <Stat key={m.label} label={m.label} value={m.value} caption={m.caption} />
                            ))}
                        </div>
                    )}
                    {b.type === 'bars' && (
                        <ul className="space-y-2.5">
                            {b.items.map((m) => (
                                <li key={m.label} className="text-xs">
                                    <span className="flex justify-between text-ink-700">
                                        <span>{m.label}</span>
                                        <strong>{m.display}</strong>
                                    </span>
                                    <Bar value={m.value} tone="gold" />
                                </li>
                            ))}
                        </ul>
                    )}
                    {b.note && <p className="mt-3 text-xs text-ink-500">{b.note}</p>}
                </Panel>
            ))}
        </div>
    );
}

export function Empty({ children }: { children: ReactNode }) {
    return <p className="rounded-[6px] border border-dashed border-parchment-500 p-4 text-center text-xs text-ink-400">{children}</p>;
}

export function ResultIcon({ ok }: { ok: boolean }) {
    return ok ? <CircleCheck className="size-4 text-verified-500" aria-label="Yes" /> : <CircleX className="size-4 text-risk-500" aria-label="No" />;
}
