import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { ChevronRight, Lock, ShieldCheck, Terminal } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Field, Textarea } from '@/Components/ui/Form';
import { Modal, StatusPill } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { Card, Donut, Ticks, evidenceLabel, shortDate } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { DdCasePageProps, DdEvent } from '@/types/due-diligence';
import type { EvidenceItemRow } from './Evidence';

interface Props extends DdCasePageProps {
    items: EvidenceItemRow[];
    stats: { requiredItems: number; completeItems: number; pendingItems: number; issues: number; notProvided: number; documents: number; percent: number };
    requests: { id: number; reference: string; type: string; title: string; status: string; detail: string | null; created_at: string }[];
    lastEvent: DdEvent | null;
}

const PRI: Record<string, string> = { high: 'text-risk-600', medium: 'text-attested-600', low: 'text-gold-700', optional: 'text-ink-400' };

/** DD-036 Missing Information: remedy gaps, propose alternatives or request a G9 scope adjustment. */
export default function Missing(props: Props) {
    const { case: c, items, stats, requests, lastEvent } = props;
    const base = `/due-diligence/cases/${c.reference}`;
    const outstanding = items.filter((i) => !['uploaded', 'approved', 'waived'].includes(i.status));
    const [alt, setAlt] = useState<EvidenceItemRow | null>(null);
    const [scope, setScope] = useState(false);
    const altForm = useForm({ detail: '' });
    const scopeForm = useForm({ detail: '' });

    return (
        <CaseLayout
            page={props}
            active="missing"
            title="Missing Information"
            subtitle="We need additional information to complete this stage."
            description="Please provide the items below or choose an alternative path. This helps us maintain accuracy, compliance and a lawful process."
            bandNote="No new fee applies for ordinary remedy."
            actions={<Button type="button" onClick={() => router.post(`${base}/intake`)} trailingIcon="arrow-right">Complete Required Action</Button>}
            aside={
                <>
                    <Card title="Why this is important"><Ticks items={['Compliant and lawful screening', 'Accurate risk understanding', 'Reliable reporting outcomes', 'Protection for all parties']} /></Card>
                    <Card title="Evidence quality impact">
                        <Donut size={110} center={<span><span className="block text-lg font-bold">{stats.percent}%</span><span className="text-[0.625rem] text-ink-500">Complete</span></span>} segments={[{ label: 'Complete', value: stats.completeItems, color: '#2f9e44' }, { label: 'Pending', value: Math.max(0, stats.pendingItems - stats.notProvided), color: '#d6a32e' }, { label: 'Issue Found', value: stats.issues, color: '#b42318' }, { label: 'Not Provided', value: stats.notProvided, color: '#a8a29e' }]} />
                    </Card>
                </>
            }
        >
            <div className="grid gap-5 xl:grid-cols-12">
                <Card title="Outstanding information" className="xl:col-span-7" action={<span className="rounded bg-risk-50 px-2 py-0.5 text-xs font-semibold text-risk-700">Completeness: {stats.percent}%</span>}>
                    <p className="mb-3 text-xs text-ink-500">These items are required to proceed to screening. {stats.completeItems} of {stats.requiredItems} required items complete.</p>
                    {outstanding.length === 0 ? <p className="rounded bg-verified-50 p-3 text-sm text-verified-700">All items are complete. Submit your intake to move to screening.</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[540px] text-left text-xs">
                                <thead className="text-ink-500"><tr><th className="py-1">Priority</th><th>Information Required</th><th>Why we need this</th><th>Evidence Type</th><th>Status</th><th>Action</th></tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {outstanding.map((i) => {
                                        const [l, cls] = evidenceLabel(i.status, i.required);
                                        return (
                                            <tr key={i.id}>
                                                <td className={cn('py-2 font-semibold capitalize', PRI[i.priority])}>● {i.priority}</td>
                                                <td className="font-medium">{i.label}</td>
                                                <td className="text-ink-600">{i.why}</td>
                                                <td>{i.evidence_type}</td>
                                                <td className={cls}>{l}</td>
                                                <td className="space-x-2 whitespace-nowrap">
                                                    <Link href={`${base}/evidence`} className="rounded border border-parchment-400 px-2 py-0.5 hover:border-gold-500">{i.status === 'partial' ? 'Provide' : 'Upload'}</Link>
                                                    {i.required && i.status !== 'alternative_proposed' && <button type="button" className="text-gold-700 hover:underline" onClick={() => setAlt(i)}>Alternative</button>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <p className="mt-2 text-[0.6875rem] text-ink-500">High: required for compliance and legal reasons · Medium: important for accurate assessment · Low: helpful for context · Optional: not mandatory.</p>
                </Card>
                <div className="space-y-3 xl:col-span-5">
                    <Card title="What you can do">
                        <ul className="space-y-2">
                            {[
                                { t: 'Upload missing information', b: 'Provide the outstanding documents listed.', href: `${base}/evidence` },
                                { t: 'Use an alternative evidence path', b: 'Provide different evidence that meets the requirement.', onClick: () => outstanding[0] && setAlt(outstanding[0]) },
                                { t: 'Request scope adjustment (G9)', b: 'If the information cannot be obtained, request a scope change.', onClick: () => setScope(true) },
                                { t: 'Ask your Case Manager', b: 'Talk to your Case Manager for guidance.', onClick: () => openAskQuestion({ subject: `Missing information ${c.reference}`, section: 'due-diligence' }) },
                            ].map((x) => {
                                const inner = <><span className="flex-1"><span className="block text-[0.8125rem] font-semibold">{x.t}</span><span className="block text-xs text-ink-500">{x.b}</span></span><ChevronRight className="size-4 text-ink-400" aria-hidden="true" /></>;
                                const cls = 'flex w-full items-center gap-2 rounded-[6px] border border-parchment-400 p-3 text-left hover:border-gold-500';
                                return <li key={x.t}>{x.href ? <Link href={x.href} className={cls}>{inner}</Link> : <button type="button" className={cls} onClick={x.onClick}>{inner}</button>}</li>;
                            })}
                        </ul>
                        <p className="mt-3 rounded bg-gold-50 p-2 text-xs text-ink-700"><strong>No fee for ordinary remedy.</strong> There is no charge to resolve missing information. A fee applies only if scope expansion is approved.</p>
                    </Card>
                    {requests.length > 0 && (
                        <Card title="Your requests">
                            <ul className="space-y-2">{requests.map((r) => <li key={r.id} className="flex items-center gap-2 text-xs"><span className="font-mono">{r.reference}</span><span className="flex-1">{r.title}</span><StatusPill status={r.status} /></li>)}</ul>
                        </Card>
                    )}
                </div>
            </div>
            <div className="grid gap-3 rounded-[10px] border border-parchment-400 bg-white p-4 text-xs md:grid-cols-3">
                <p className="flex gap-2"><Lock className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block">Stage lock</strong>We cannot proceed to the next stage until all required items are complete or an approved alternative is provided.</span></p>
                <p className="flex gap-2"><ShieldCheck className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block">Secure and confidential</strong>All information you provide is encrypted, access-controlled and used only for this due diligence case.</span></p>
                <p className="flex gap-2"><Terminal className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block">System event</strong>{lastEvent ? `${lastEvent.code} | ${lastEvent.type} · ${shortDate(lastEvent.at, true)}` : 'No completeness events yet.'}</span></p>
            </div>

            <Modal open={alt !== null} onClose={() => setAlt(null)} title={`Alternative evidence: ${alt?.label ?? ''}`} footer={<Button type="button" disabled={altForm.processing} onClick={() => alt && altForm.post(`${base}/evidence/${alt.id}/alternative`, { preserveScroll: true, onSuccess: () => { setAlt(null); altForm.reset(); } })}>Submit for review</Button>}>
                <Field label="Describe the alternative evidence you can provide" error={altForm.errors.detail} required>{(id) => <Textarea id={id} value={altForm.data.detail} onChange={(e) => altForm.setData('detail', e.target.value)} placeholder="e.g. A signed lease agreement instead of a utility bill" />}</Field>
            </Modal>
            <Modal open={scope} onClose={() => setScope(false)} title="Request scope adjustment (G9)" footer={<Button type="button" disabled={scopeForm.processing} onClick={() => scopeForm.post(`${base}/scope-change`, { preserveScroll: true, onSuccess: () => { setScope(false); scopeForm.reset(); } })}>Request adjustment</Button>}>
                <p className="mb-2 text-xs text-ink-500">Any fee change will be quoted for your approval before work begins.</p>
                <Field label="What cannot be obtained and what change do you propose?" error={scopeForm.errors.detail} required>{(id) => <Textarea id={id} value={scopeForm.data.detail} onChange={(e) => scopeForm.setData('detail', e.target.value)} />}</Field>
            </Modal>
        </CaseLayout>
    );
}
