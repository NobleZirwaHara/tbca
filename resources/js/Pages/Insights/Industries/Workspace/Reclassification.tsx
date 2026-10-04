import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Check, FileText, HelpCircle, Printer, Search, ShieldAlert, TrendingUp, Users } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Field, Textarea } from '@/Components/ui/Form';
import { WorkspaceShell } from '@/Components/Insights/Industries';
import { Box, Chip, SmallLink } from '@/Components/Insights/Shared';
import type { WorkspaceBase } from '@/types/insights';

type Cls = { risk: string; category: string; score: number; confidence: string; date: string };
interface Props extends WorkspaceBase {
    notice: null | { id: number; noticeId: string; issuedAt: string; effectiveOn: string; previous: Cls; next: Cls; delta: number; reasons: string[]; evidence: { title: string; source: string }[]; status: string; acknowledgedAt: string | null; clarification: string | null };
    evidenceCount: number;
}

export default function Reclassification(props: Props) {
    const { engagement: e, notice: n, evidenceCount } = props;
    const root = `/industries/workspace/${e.reference}`;
    const [ask, setAsk] = useState(false);
    const form = useForm({ action: 'clarify', clarification: '' });

    if (!n) {
        return <WorkspaceShell base={props} title="Re-Classification Notice"><Box><p className="text-sm text-ink-600">There are no re-classification notices for this engagement.</p></Box></WorkspaceShell>;
    }
    const acknowledge = () => router.post(`${root}/reclassification/${n.id}`, { action: 'acknowledge' }, { preserveScroll: true });

    return (
        <WorkspaceShell
            base={props}
            title="Re-Classification Notice"
            badge={<Chip tone={n.status === 'acknowledged' ? 'green' : 'amber'}>{n.status === 'acknowledged' ? 'Acknowledged' : n.status === 'clarification_requested' ? 'Clarification Requested' : 'Action Required'}</Chip>}
            description="We have reviewed new evidence and updated the classification for this industry. Please review the changes and confirm your acknowledgement."
            actions={<a href={`${root}/reclassification/${n.id}/print`} className="flex items-center gap-1.5 rounded border border-gold-500 px-3 py-2 text-xs font-semibold text-gold-800"><Printer className="size-4" /> Print Notice</a>}
            right={
                <>
                    <Box title="Impact of Re-Classification">
                        <ul className="space-y-3 text-xs">
                            {[[ShieldAlert, 'Risk Exposure', `Risk score ${n.delta >= 0 ? 'increased' : 'decreased'} by ${Math.abs(n.delta)} points.`], [Search, 'Due Diligence', 'Enhanced due diligence is now required.'], [Users, 'Partner Matching', 'Partner recommendations may change.'], [TrendingUp, 'Financing Access', 'Financing terms and options may be affected.']].map(([I, t, s]) => {
                                const Icon = I as typeof Users;
                                return <li key={t as string} className="flex gap-2"><Icon className="size-5 text-risk-500" /><span><strong className="block">{t as string}</strong>{s as string}</span></li>;
                            })}
                        </ul>
                    </Box>
                    <Box title="What Happens Next?">
                        <ol className="space-y-2 text-xs">
                            <li><strong>{n.effectiveOn}</strong><span className="block">New classification becomes effective.</span></li>
                            <li><strong>Up to 7 days</strong><span className="block">Update your strategies and assessments.</span></li>
                            <li><strong>Ongoing</strong><span className="block">We will continue to monitor and provide updates.</span></li>
                        </ol>
                    </Box>
                </>
            }
        >
            <Box>
                <div className="flex gap-4">
                    <FileText className="size-12 shrink-0 rounded-full bg-controlled-500 p-2.5 text-white" />
                    <div>
                        <h2 className="text-lg font-semibold">Industry Classification Updated</h2>
                        <p className="text-sm text-ink-600">Based on new evidence and revised methodology, the classification for <strong>{e.industry} &gt; {e.subIndustry} ({e.country})</strong> has been updated.</p>
                        <p className="mt-1 text-xs text-ink-500">Notice ID: {n.noticeId} | Issued: {n.issuedAt} | Effective: <strong>{n.effectiveOn}</strong></p>
                    </div>
                </div>
                <h3 className="mt-5 font-semibold">Classification Change Summary</h3>
                <div className="mt-2 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
                    {[['Previous Classification', n.previous, 'amber'], null, ['New Classification', n.next, 'red']].map((c, i) =>
                        c === null ? (
                            <ArrowRight key={i} className="mx-auto size-8 rounded-full border p-1.5 text-ink-500" />
                        ) : (
                            <div key={i} className={`rounded-[8px] border p-3 text-sm ${c[2] === 'red' ? 'border-risk-500/30 bg-risk-50' : 'border-attested-500/30 bg-attested-50'}`}>
                                <p className="flex items-center gap-2 font-semibold">{c[0] as string} <Chip tone={c[2] as 'amber' | 'red'}>{(c[1] as Cls).risk}</Chip></p>
                                <p>Category: {(c[1] as Cls).category}</p>
                                <p>Risk Score: {(c[1] as Cls).score} / 100 {i === 2 && <span className="font-semibold text-risk-700">({n.delta >= 0 ? '+' : ''}{n.delta})</span>}</p>
                                <p>Confidence Level: {(c[1] as Cls).confidence}</p>
                                <p>{i === 2 ? 'Effective From' : 'Last Updated'}: {(c[1] as Cls).date}</p>
                            </div>
                        ),
                    )}
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                        <h3 className="font-semibold">Reason for Re-Classification</h3>
                        <p className="text-xs text-ink-600">The classification has been updated due to changes in market conditions, policy environment, and sector performance indicators.</p>
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">{n.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
                    </div>
                    <div>
                        <h3 className="font-semibold">Key Evidence Considered</h3>
                        <ul className="mt-2 space-y-2 text-xs">{n.evidence.map((ev) => <li key={ev.title} className="flex gap-2"><FileText className="size-4 text-controlled-700" /><span><strong className="block">{ev.title}</strong>{ev.source}</span></li>)}</ul>
                        <SmallLink className="mt-2" href={`${root}/verification?tab=resolved`}>{`View all evidence (${evidenceCount})`}</SmallLink>
                    </div>
                </div>
            </Box>

            {n.status === 'acknowledged' ? (
                <p className="flex items-center gap-2 rounded-[8px] border border-verified-500/30 bg-verified-50 p-4 text-sm text-verified-700"><Check className="size-5" /> You acknowledged this notice on {n.acknowledgedAt}.</p>
            ) : (
                <div className="flex flex-col gap-3 rounded-[8px] border border-attested-500/30 bg-attested-50 p-4 sm:flex-row sm:items-center">
                    <AlertTriangle className="size-6 text-attested-700" />
                    <div className="flex-1 text-sm"><strong>Acknowledgement Required</strong><p className="text-xs">Please confirm that you have reviewed and understood the updated classification and its implications.</p>{n.clarification && <p className="mt-1 text-xs text-ink-500">Clarification requested: “{n.clarification}”</p>}</div>
                    <button type="button" onClick={acknowledge} className="flex items-center gap-1.5 rounded bg-gold-500 px-4 py-2 text-xs font-bold"><Check className="size-4" /> Acknowledge Notice</button>
                    <button type="button" onClick={() => setAsk(true)} className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-4 py-2 text-xs font-semibold"><HelpCircle className="size-4" /> Request Clarification</button>
                </div>
            )}
            <p className="rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-3 text-xs text-controlled-700"><strong>Transparency Commitment.</strong> All re-classifications are evidence-based and follow TBCA's methodology to ensure accuracy, fairness, and trust.</p>

            <Modal open={ask} onClose={() => setAsk(false)} title="Request Clarification"
                footer={<button type="button" onClick={() => form.post(`${root}/reclassification/${n.id}`, { preserveScroll: true, onSuccess: () => setAsk(false) })} className="rounded bg-gold-500 px-4 py-2 text-sm font-semibold">Send Request</button>}>
                <Field label="What would you like clarified?" required error={form.errors.clarification}>{(id) => <Textarea id={id} value={form.data.clarification} onChange={(ev) => form.setData('clarification', ev.target.value)} />}</Field>
            </Modal>
        </WorkspaceShell>
    );
}
