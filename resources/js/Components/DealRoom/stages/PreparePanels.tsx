import { Link, useForm } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Copy, FileUp, PartyPopper, ShieldCheck, Sparkles, Upload, UserPlus, Users } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { Charge, Gate, RoomHeader } from '@/types/deal-room';
import { roomUrl } from '../RoomShell';
import { CheckItem, Gauge, KvList, Stat, zar } from '../Ui';

interface DiagnosticData {
    progress: {
        answered: number;
        total: number;
        readiness: number;
        band: string;
        complexity: string;
        sections: { key: string; title: string; answered: number; total: number; score: number | null }[];
        risks: { label: string; level: string }[];
    };
    sections: Record<string, { title: string; risk: string; questions: Record<string, string> }>;
    answers: Record<string, Record<string, string>>;
    options: Record<string, string>;
    proposal: { package: string; model: string; duration: string; experts: string; external: string; investment: [number, number] };
    pathway: string[];
    evidence: { documents: number; benchmarks: number; comparables: number; reports: number };
}

const levelTone = (l: string) => (l === 'Low' ? 'text-verified-700' : l === 'Medium' ? 'text-attested-700' : l === 'High' ? 'text-risk-700' : 'text-ink-400');

/** Stage B: questionnaire (server-scored), readiness, risk profile, pathway and commercial proposal. */
export function DiagnosticPanel({ room, data }: { room: RoomHeader; data: DiagnosticData }) {
    const form = useForm<{ answers: Record<string, Record<string, string>> }>({ answers: data.answers ?? {} });
    const p = data.progress;
    const set = (s: string, q: string, v: string) => form.setData('answers', { ...form.data.answers, [s]: { ...(form.data.answers[s] ?? {}), [q]: v } });

    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="1. Diagnostic Questionnaire" action={<span className="rounded-full bg-verified-50 px-2 py-0.5 text-xs font-semibold text-verified-700">{p.answered} / {p.total} Completed</span>}>
                    <div className="mb-3 h-2 overflow-hidden rounded-full bg-parchment-300"><div className="h-full bg-verified-500" style={{ width: `${(p.answered / p.total) * 100}%` }} /></div>
                    <ul className="space-y-1.5 text-[0.8125rem]">
                        {p.sections.map((s) => (
                            <li key={s.key} className="flex items-center justify-between">
                                <span>{s.title}</span>
                                <span className="font-semibold text-ink-600">{s.answered} / {s.total}</span>
                            </li>
                        ))}
                    </ul>
                </Panel>
                <Panel title="2. Readiness Score">
                    <div className="flex items-center gap-4">
                        <Gauge value={p.readiness} label={p.band} />
                        <ul className="space-y-1 text-xs text-ink-600">
                            <li>80 – 100% Excellent</li><li>60 – 79% Good</li><li>40 – 59% Fair</li><li>0 – 39% Low</li>
                        </ul>
                    </div>
                    <p className="mt-3 rounded bg-gold-50 p-2 text-xs text-ink-700">{p.readiness >= 60 ? 'Good readiness. Address the identified gaps to improve execution speed and outcomes.' : 'Readiness gaps detected. Complete outstanding questions and upload missing evidence.'}</p>
                </Panel>
                <Panel title="3. Complexity & Risk Profile">
                    <p className="mb-2 text-xs text-ink-500">Complexity Level: <strong className="text-gold-700">{p.complexity}</strong></p>
                    <ul className="space-y-1.5 text-[0.8125rem]">
                        {p.risks.map((r) => (
                            <li key={r.label} className="flex justify-between"><span>{r.label}</span><span className={cn('font-semibold', levelTone(r.level))}>{r.level}</span></li>
                        ))}
                    </ul>
                </Panel>
            </div>

            <Panel title="Diagnostic Questionnaire — answers">
                <form onSubmit={(e) => { e.preventDefault(); form.post(roomUrl(room.slug, 'diagnostic'), { preserveScroll: true }); }} className="space-y-5">
                    {Object.entries(data.sections).map(([sk, s]) => (
                        <fieldset key={sk} className="rounded-[6px] border border-parchment-400 p-3">
                            <legend className="px-1 text-xs font-bold text-ink-900 uppercase">{s.title}</legend>
                            <div className="grid gap-3 md:grid-cols-2">
                                {Object.entries(s.questions).map(([qk, label]) => (
                                    <label key={qk} className="block text-[0.8125rem] text-ink-700">
                                        <span className="mb-1 block">{label}</span>
                                        <select disabled={!room.manages} value={form.data.answers[sk]?.[qk] ?? ''} onChange={(e) => set(sk, qk, e.target.value)} className="h-9 w-full rounded-[4px] border border-parchment-500 bg-white px-2 text-sm focus:border-gold-500 focus:outline-none">
                                            <option value="">Select…</option>
                                            {Object.entries(data.options).sort((a, b) => Number(b[0]) - Number(a[0])).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                        </select>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    ))}
                    {room.manages && <Button type="submit" disabled={form.processing}>Save diagnostic & recalculate</Button>}
                </form>
            </Panel>

            <div className="grid gap-5 lg:grid-cols-2">
                <Panel title="4. Probable Transaction Pathway">
                    <ol className="flex flex-wrap items-center gap-2 text-xs">
                        {data.pathway.map((s, i) => (
                            <li key={s} className="flex items-center gap-2">
                                <span className={cn('rounded-[4px] border px-2 py-1', i === 0 ? 'border-gold-500 bg-gold-50 font-semibold' : 'border-parchment-400')}>{s}</span>
                                {i < data.pathway.length - 1 && <ArrowRight className="size-3 text-gold-600" aria-hidden />}
                            </li>
                        ))}
                    </ol>
                </Panel>
                <Panel title="5. Commercial Proposal Summary">
                    <KvList rows={[
                        ['Proposed Package', data.proposal.package],
                        ['Engagement Model', data.proposal.model],
                        ['Estimated Duration', data.proposal.duration],
                        ['TBCA Experts Required', data.proposal.experts],
                        ['External Experts', data.proposal.external],
                        ['Indicative Investment', `${zar(data.proposal.investment[0])} – ${zar(data.proposal.investment[1])} (excl. VAT & disbursements)`],
                    ]} />
                    <div className="mt-3 grid grid-cols-4 gap-2">
                        <Stat label="Documents Analysed" value={data.evidence.documents} />
                        <Stat label="Benchmarks" value={data.evidence.benchmarks} />
                        <Stat label="Comparables" value={data.evidence.comparables} />
                        <Stat label="Market Reports" value={data.evidence.reports} />
                    </div>
                </Panel>
            </div>
        </div>
    );
}

interface MandateData {
    commercial: Record<string, string | null>;
    deposit: Charge | null;
    pack: { label: string; done: boolean }[];
    signatures: { name: string; authority: string; status: string }[];
}

/** Stage C: conflict, mandate, deposit and Stage 0 lock tiles, linked to the commercial journey. */
export function MandatePanel({ room, data, gate }: { room: RoomHeader; data: MandateData; gate: Gate }) {
    const c = data.commercial ?? {};
    const steps = [
        { label: 'Preliminary Estimate', href: 'commercial/preliminary-estimate', done: true },
        { label: 'Formal Quotation', href: 'commercial/formal-quotation', done: !!c.quote_accepted_at },
        { label: 'Fee Breakdown', href: 'commercial/fee-breakdown', done: !!c.fee_ack_at },
        { label: 'Scope Acceptance', href: 'commercial/scope-acceptance', done: !!c.scope_accepted_at },
        { label: 'Engagement Acceptance', href: 'commercial/engagement-acceptance', done: !!c.engagement_signed_at },
        { label: 'Deposit Checkout', href: 'commercial/deposit-checkout', done: !!c.deposit_paid_at },
    ];
    const nextStep = steps.find((s) => !s.done);
    const tiles = [
        ['Conflict', 'Clear', true],
        ['Mandate', c.engagement_signed_at ? 'Signed' : 'Pending', !!c.engagement_signed_at],
        ['Deposit', c.deposit_paid_at ? 'Cleared' : 'Unpaid', !!c.deposit_paid_at],
        ['Stage 0', gate.passed || c.deposit_paid_at ? 'Unlocked' : 'Locked', !!c.deposit_paid_at],
    ] as const;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {tiles.map(([label, value, ok], i) => (
                    <div key={label} className="flex items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                        <span className={cn('flex size-10 items-center justify-center rounded-full border-2 text-sm font-bold', ok ? 'border-verified-500 text-verified-700' : 'border-gold-500 text-gold-700')}>{i + 1}</span>
                        <span><span className="block text-xs text-ink-500">{label}</span><span className="text-lg font-bold text-ink-900">{value}</span></span>
                    </div>
                ))}
            </div>
            <Panel title="Commercial journey (Pre-Mandate A–C)">
                <ol className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    {steps.map((s, i) => (
                        <li key={s.label}>
                            <Link href={roomUrl(room.slug, s.href)} className={cn('block rounded-[6px] border p-3 text-xs hover:border-gold-500', s.done ? 'border-verified-500/40 bg-verified-50' : s === nextStep ? 'border-gold-500 bg-gold-50' : 'border-parchment-400 bg-white')}>
                                <span className="block text-[0.625rem] text-ink-400">VDR-0{29 + i}</span>
                                <span className="font-semibold text-ink-900">{s.label}</span>
                                <span className="mt-1 block"><StatusPill status={s.done ? 'completed' : s === nextStep ? 'due' : 'pending'} /></span>
                            </Link>
                        </li>
                    ))}
                </ol>
                {nextStep && <ButtonLink href={roomUrl(room.slug, nextStep.href)} size="sm" className="mt-3">Continue: {nextStep.label}</ButtonLink>}
            </Panel>
            <div className="grid gap-5 lg:grid-cols-3">
                <Panel title="Mandate and Engagement Pack">
                    <ul className="space-y-1.5">{data.pack.map((p) => <CheckItem key={p.label} done={p.done}>{p.label}</CheckItem>)}</ul>
                </Panel>
                <Panel title="Deposit and Activation Invoice" className="lg:col-span-2">
                    {data.deposit ? (
                        <>
                            <SimpleTable columns={['Category', 'Item', 'Amount']} rows={[...data.deposit.lines.map((l) => [l.category, l.item, zar(l.net)]), ['VAT', '15%', zar(data.deposit.vat)], [<strong key="t">Total Due</strong>, data.deposit.reference, <strong key="a">{zar(data.deposit.total)}</strong>]]} />
                            <p className="mt-2 text-xs">Status: <StatusPill status={data.deposit.status} /> {data.deposit.paidAt && <>· Deposit cleared {data.deposit.paidAt} · Entitlement: Stage 0</>}</p>
                        </>
                    ) : (
                        <p className="text-xs text-ink-500">The deposit invoice activates once the engagement pack is signed.</p>
                    )}
                </Panel>
            </div>
            <Panel title="Signature Controls">
                <SimpleTable columns={['Signatory', 'Authority', 'Status']} rows={data.signatures.map((s) => [s.name, s.authority, <StatusPill key={s.name} status={s.status} />])} />
            </Panel>
        </div>
    );
}

export function CreatedPanel({ room, data }: { room: RoomHeader; data: { roomUrl: string; invitationMode: string; mfa: boolean; createdAt: string | null; template: string } }) {
    const actions = [
        { title: 'Invite Participants', body: 'Send secure invitations to your team and external parties', href: 'counterparty-qualification', icon: UserPlus },
        { title: 'Upload Documents', body: 'Start populating your data room with documents', href: 'data-room-build', icon: Upload },
        { title: 'Configure Permissions', body: 'Review and adjust access roles and permissions', href: 'setup/parties-and-roles', icon: ShieldCheck },
        { title: 'Go to Deal Room', body: 'Enter your deal room and begin collaborating', href: '', icon: ArrowRight },
    ];
    return (
        <div className="grid gap-5 lg:grid-cols-3">
            <Panel className="lg:col-span-2">
                <div className="flex flex-wrap items-center gap-5">
                    <span className="flex size-24 items-center justify-center rounded-full bg-verified-50 text-verified-700"><PartyPopper className="size-12" aria-hidden /></span>
                    <div className="flex-1">
                        <h2 className="font-serif text-xl font-bold">Your Deal Room is Live!</h2>
                        <p className="mt-1 text-sm text-ink-600">{room.name} is now active and ready for collaboration. You can invite participants, upload documents and begin your transaction journey.</p>
                    </div>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[['Secure by Design', 'Enterprise-grade security and compliance enabled', ShieldCheck], ['AI-Powered', 'Source-grounded AI and automation are active', Sparkles], ['Audit-Ready', 'Full audit trail and activity logging enabled', BadgeCheck]].map(([t, b, I]) => {
                        const Ico = I as typeof ShieldCheck;
                        return (
                            <div key={t as string} className="rounded-[6px] bg-verified-50 p-3 text-xs">
                                <Ico className="mb-1 size-5 text-verified-700" aria-hidden />
                                <p className="font-semibold text-ink-900">{t as string}</p>
                                <p className="text-ink-600">{b as string}</p>
                            </div>
                        );
                    })}
                </div>
            </Panel>
            <Panel title="Room Access Details">
                <KvList rows={[
                    ['Room URL', <span key="u" className="inline-flex items-center gap-1 break-all text-controlled-700">{data.roomUrl}<button type="button" aria-label="Copy room URL" onClick={() => navigator.clipboard?.writeText(data.roomUrl)}><Copy className="size-3.5" /></button></span>],
                    ['Template', data.template],
                    ['Invitation Mode', data.invitationMode],
                    ['MFA', data.mfa ? 'Enabled' : 'Disabled'],
                ]} />
            </Panel>
            <Panel title="What You Can Do Now" className="lg:col-span-3">
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {actions.map(({ title, body, href, icon: I }) => (
                        <li key={title}>
                            <Link href={roomUrl(room.slug, href)} className="flex h-full items-start gap-2 rounded-[6px] border border-parchment-400 p-3 hover:border-gold-500">
                                <I className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden />
                                <span className="text-xs"><span className="block font-semibold text-ink-900">{title}</span>{body}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </Panel>
        </div>
    );
}

/** Stage 1: the three onboarding groups are the stage's completion-test ticks. */
export function OnboardingPanel({ gate }: { gate: Gate }) {
    const groups: [string, string[], typeof Users][] = [
        ['1. Sponsor Identity Verification', ['Primary contact', 'Company verification', 'Identity documents', 'Proof of authority'], BadgeCheck],
        ['2. Set Up Secure Access', ['Two-factor', 'Secure password', 'Security questions', 'Device registered'], ShieldCheck],
    ];
    const done = gate.checks.filter((c) => c.done).length;
    const pct = gate.checks.length ? Math.round((done / gate.checks.length) * 100) : 0;
    return (
        <div className="grid gap-5 lg:grid-cols-3">
            {groups.map(([title, keys, I]) => (
                <Panel key={title} title={title}>
                    <ul className="space-y-2">
                        {gate.checks.filter((c) => keys.some((k) => c.label.startsWith(k))).map((c) => (
                            <li key={c.key} className="flex items-center justify-between gap-2 text-[0.8125rem]">
                                <span className="flex items-center gap-2"><I className="size-4 text-gold-600" aria-hidden />{c.label}</span>
                                <StatusPill status={c.done ? 'verified' : 'pending'} />
                            </li>
                        ))}
                    </ul>
                </Panel>
            ))}
            <Panel title="Onboarding Progress">
                <div className="flex items-center gap-4">
                    <Gauge value={pct} label="Complete" />
                    <ul className="space-y-1 text-xs">
                        <CheckItem done={pct >= 50}>Identity verification</CheckItem>
                        <CheckItem done={pct === 100}>Access setup</CheckItem>
                        <CheckItem done={pct === 100}>Privileges activated</CheckItem>
                    </ul>
                </div>
                <p className="mt-3 flex items-center gap-1 text-xs text-ink-500"><FileUp className="size-3.5" aria-hidden /> Upload ID and proof of authority in the data room (03. Legal & Corporate), then tick each item in the completion test.</p>
            </Panel>
            <Panel title="3. Sponsor Privileges" className="lg:col-span-3">
                <ul className="grid gap-2 sm:grid-cols-4">
                    {['Full Control — manage deal room settings and permissions', 'Invite & Manage Users — internal and external', 'Upload & Manage Documents', 'View Activity & Reports — access logs and audit trails'].map((p) => <CheckItem key={p} done={pct === 100}>{p}</CheckItem>)}
                </ul>
            </Panel>
        </div>
    );
}
