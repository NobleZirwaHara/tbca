import type { FormEvent } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Award, BadgeCheck, Bookmark, Building2, CalendarDays, Clock, FileText, GraduationCap, Info, Send, ShieldCheck, Star, Wallet, Box } from 'lucide-react';
import { Panel, StatusPill } from '@/Components/ui/Kit';
import { Textarea } from '@/Components/ui/Form';
import { Notice } from '@/Components/Products/Shared';
import type { RetAdviser, RetContext } from '@/Components/Products/Retainers/types';
import { AccountShell } from '@/Components/Products/Retainers/Shells';
import { fmtDate } from '@/Components/Products/Retainers/ui';

interface Sub {
    id: number;
    reference: string;
    current_adviser: RetAdviser;
    proposed_adviser: RetAdviser;
    type: string;
    reason: string;
    reason_detail: string | null;
    risk: string;
    status: string;
    client_response: string | null;
    client_note: string | null;
    effective_from: string;
    notice_sent_at: string | null;
}

function Person({ label, a, sub }: { label: string; a: RetAdviser; sub: string }) {
    const initials = a.name.split(' ').map((p) => p[0]).join('').slice(0, 2);
    return (
        <div className="flex-1 rounded-[8px] border border-parchment-400 bg-white p-4">
            <p className="text-xs font-semibold text-ink-500">{label}</p>
            <div className="mt-2 flex items-center gap-3">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 text-lg font-bold text-gold-300" aria-hidden="true">{initials}</span>
                <div className="text-xs">
                    <p className="text-sm font-semibold text-ink-900">{a.name}</p>
                    <p className="text-ink-500">{a.title}</p>
                    <p className="mt-1 text-ink-600">{sub}</p>
                </div>
            </div>
        </div>
    );
}

export default function Substitution(props: Props) {
    const { retainer: r, substitution: s } = props;
    const base = `/retainers/account/${r.code}`;
    const form = useForm({ substitution: s?.id ?? 0, response: '', note: '' });
    const err = form.errors as Record<string, string>;
    const awaiting = s && ['awaiting_approval', 'discuss'].includes(s.status);
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(`${base}/substitution`, { preserveScroll: true });
    };
    const p = s?.proposed_adviser;

    return (
        <AccountShell ctx={props} title="Substitution Notice" description="We are proposing a change to the Named Advisor or key team member for your retainer. Please review the details below.">
            {!s ? (
                <Notice tone="good" title="No substitution notices">Your named adviser and team are unchanged.</Notice>
            ) : (
                <form onSubmit={submit} className="grid gap-5 xl:grid-cols-[1fr_320px]" noValidate>
                    <div className="min-w-0 space-y-5">
                        <Notice tone="purple" title="You have the right to accept or object to this substitution.">
                            If you object, we will work with you to agree on an alternative. Your service will continue without interruption. {r.owner_model === 'Named Adviser' && 'Because a named adviser was material to your purchase, no permanent change is made — and renewal is held — until you decide.'}
                        </Notice>
                        <Panel title={<span className="inline-flex items-center gap-2">1. Substitution Summary <StatusPill status={s.status} /></span>}>
                            <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
                                <Person label="Current Adviser" a={s.current_adviser} sub={`Since: ${fmtDate(s.current_adviser.since)}`} />
                                <ArrowRight className="mx-auto size-6 shrink-0 text-referenced-700 md:mx-0" aria-hidden="true" />
                                <Person label="Proposed Adviser" a={s.proposed_adviser} sub={`Effective From: ${fmtDate(s.effective_from)}`} />
                            </div>
                            <div className="mt-3 rounded-[6px] bg-referenced-50 p-3 text-xs">
                                <p className="font-semibold text-referenced-700">Reason for Substitution ({s.type} · {s.reason})</p>
                                <p className="mt-1 text-ink-700">{s.reason_detail}</p>
                            </div>
                        </Panel>
                        <Panel title="2. Impact on Your Retainer">
                            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
                                {[
                                    [ShieldCheck, 'Service Continuity', 'No interruption to your retainer. All commitments continue.'],
                                    [Box, 'Scope', 'No change to agreed scope or deliverables.'],
                                    [Clock, 'Allowance', 'No change to allowance or utilisation.'],
                                    [Wallet, 'Rate / Fees', 'No change to your agreed rate.'],
                                    [CalendarDays, 'Effective Date', `${fmtDate(s.effective_from)} (or agreed alternative)`],
                                ].map(([Icon, t, b]) => {
                                    const I = Icon as typeof ShieldCheck;
                                    return (
                                        <div key={t as string} className="text-xs">
                                            <p className="flex items-center gap-1.5 font-semibold text-ink-900"><I className="size-4 text-verified-500" aria-hidden="true" />{t as string}</p>
                                            <p className="mt-1 text-ink-600">{b as string}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </Panel>
                        {p && (
                            <Panel title="3. About the Proposed Adviser">
                                <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
                                    {[
                                        [Award, 'Experience', p.experience],
                                        [GraduationCap, 'Qualifications', p.qualifications],
                                        [Star, 'Relevant Expertise', p.expertise],
                                        [Building2, 'Recent Clients', p.clients],
                                        [Clock, 'Availability', p.availability],
                                    ].map(([Icon, t, b]) => {
                                        const I = Icon as typeof Award;
                                        return (
                                            <div key={t as string} className="text-xs">
                                                <p className="flex items-center gap-1.5 font-semibold text-ink-900"><I className="size-4 text-referenced-500" aria-hidden="true" />{t as string}</p>
                                                <p className="mt-1 text-ink-600">{(b as string | undefined) ?? 'Shared on request.'}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Panel>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Panel title="4. Your Options">
                            {awaiting ? (
                                <fieldset>
                                    <legend className="mb-2 text-xs text-ink-500">Please select one of the options below.</legend>
                                    {[
                                        ['accept', 'Accept Substitution', 'I accept the proposed substitution and authorise the change.'],
                                        ['object', 'Object to Substitution', 'I would like to object and request an alternative adviser.'],
                                        ['discuss', 'Discuss Further', 'I would like to discuss this change before making a decision.'],
                                    ].map(([k, t, b]) => (
                                        <label key={k} className="mb-3 flex cursor-pointer items-start gap-2 text-xs">
                                            <input type="radio" name="response" value={k} checked={form.data.response === k} onChange={() => form.setData('response', k)} className="mt-0.5 accent-referenced-700" />
                                            <span><span className="block text-[0.8125rem] font-semibold text-referenced-700">{t}</span><span className="text-ink-600">{b}</span></span>
                                        </label>
                                    ))}
                                    {(err.response || err.substitution) && <p role="alert" className="text-xs text-risk-500">{err.response || err.substitution}</p>}
                                </fieldset>
                            ) : (
                                <p className="text-xs text-ink-600">Your response: <span className="font-semibold capitalize">{s.client_response ?? '—'}</span>{s.client_note ? ` — “${s.client_note}”` : ''}</p>
                            )}
                        </Panel>
                        <Panel title="5. Supporting Documents">
                            <p className="-mt-2 mb-2 text-xs text-ink-500">Review the proposed adviser&apos;s profile and CV (optional).</p>
                            {['Profile', 'CV'].map((d) => (
                                <button key={d} type="button" onClick={() => window.print()} className="mb-2 flex w-full items-center gap-2 rounded-[6px] border border-parchment-400 p-2 text-left text-xs hover:border-referenced-500">
                                    <FileText className="size-4 text-referenced-500" aria-hidden="true" />
                                    <span className="flex-1 font-semibold">{s.proposed_adviser.name} – {d}</span>
                                    <span className="text-ink-400">PDF</span>
                                </button>
                            ))}
                        </Panel>
                        {awaiting && (
                            <Panel title="6. Notes (Optional)">
                                <label htmlFor="sub-note" className="sr-only">Notes</label>
                                <Textarea id="sub-note" maxLength={300} placeholder="Type your note here..." value={form.data.note} onChange={(e) => form.setData('note', e.target.value)} />
                                <p className="mt-1 text-right text-[0.6875rem] text-ink-400">{form.data.note.length} / 300</p>
                            </Panel>
                        )}
                    </div>

                    <div className="xl:col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-parchment-400 pt-4">
                        <Link href={base} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-sm font-semibold text-ink-900"><ArrowLeft className="size-4" aria-hidden="true" />Back to Overview</Link>
                        {awaiting && (
                            <div className="flex gap-2">
                                <Link href={base} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-sm font-semibold text-ink-900"><Bookmark className="size-4" aria-hidden="true" />Save for Later</Link>
                                <button type="submit" disabled={form.processing || !form.data.response} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-referenced-700 px-6 text-sm font-semibold text-white disabled:opacity-50"><Send className="size-4" aria-hidden="true" />Submit Response</button>
                            </div>
                        )}
                    </div>
                    <p className="xl:col-span-2 flex items-center justify-end gap-1 text-[0.6875rem] text-ink-400"><Info className="size-3" aria-hidden="true" />Your response is secure and will be logged. <BadgeCheck className="size-3" aria-hidden="true" /></p>
                </form>
            )}
        </AccountShell>
    );
}

interface Props extends RetContext {
    substitution: Sub | null;
}

Substitution.layout = null;
