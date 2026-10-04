import { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { CheckCircle2, ClipboardCheck, CreditCard, FileText, Info, Lock, ShieldCheck, User } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { WorkspaceShell } from '@/Components/Insights/Industries';
import { Box, Chip, Status, Table, zar } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';
import type { WorkspaceBase } from '@/types/insights';

interface Gate { id: number; code: string; name: string; stage: string; status: string; decidedAt: string | null; decidedBy: string | null }
interface Props extends WorkspaceBase {
    gates: Gate[];
    quotation: { engagement: string; reference: string; total: number };
    payment: { total: number; method: string; milestone: string; currency: string };
    letterSigned: boolean;
    history: { at: string; actor: string; action: string; from: string | null; to: string | null; note: string | null }[];
}

/** IN-SCR-022 Gate Approval Modal variants. */
const VARIANTS: Record<string, { id: string; subtitle: string; heading: string; intro: string; list: string[]; note: string; confirm: string; action: string; color: string; icon: typeof User; doc: [string, string] }> = {
    G0: { id: 'GATE-IN-03', subtitle: 'You must consent to continue using AIIM.', heading: 'You are consenting to:', intro: 'By continuing, you confirm that you have read and understood how AIIM works, the information limitations, and your responsibilities.', list: ['AIIM Terms of Use', 'Data Handling & Privacy Policy', 'Information Limitations & Use', 'Transaction & Payment Transparency Principles'], note: 'You can stop at any time. No fees apply at this stage.', confirm: 'I have read and accept the above', action: 'I Consent & Continue', color: 'bg-verified-500', icon: ShieldCheck, doc: ['View Documents', '/resources/limitations'] },
    G1: { id: 'GATE-IN-04', subtitle: 'Complete your profile to save intent and access.', heading: 'You are providing:', intro: 'We use this information to personalise your experience and keep your engagement secure.', list: ['Contact details and organisation', 'Country preferences', 'Industry and sector interests', 'Communications preferences'], note: 'You can update or delete your information at any time.', confirm: 'I confirm my details are accurate', action: 'Complete Registration', color: 'bg-controlled-500', icon: User, doc: ['View Privacy Policy', '/resources/data-statement'] },
    G2: { id: 'GATE-IN-05', subtitle: 'Review the full cost, scope and limitations before proceeding.', heading: 'You are being shown:', intro: '', list: ['Full transparent fee estimate', 'Included services and exclusions', 'Data sources and licensing limitations', 'Potential external disbursements'], note: 'No charges will be made until you approve a specific item or milestone.', confirm: 'I confirm I have reviewed the full disclosure', action: 'I Understand & Continue', color: 'bg-attested-500', icon: FileText, doc: ['View Full Disclosure', '/resources/value-exchange'] },
    G3: { id: 'GATE-IN-06', subtitle: 'Approve the quotation to proceed.', heading: 'By approving you agree that:', intro: '', list: ['This quotation is accurate and complete', 'Work will commence after payment or milestone conditions are met', 'Terms & Conditions apply'], note: '', confirm: 'I approve this quotation', action: 'Approve & Proceed', color: 'bg-purple-600', icon: ClipboardCheck, doc: ['View Quotation Details', ''] },
    G4: { id: 'GATE-IN-07', subtitle: 'Final step before entitlement is activated.', heading: 'Payment Summary', intro: '', list: [], note: '', confirm: 'I authorise the payment and agree to the payment terms', action: 'Pay & Activate', color: 'bg-verified-500', icon: CreditCard, doc: ['View Payment Terms', '/resources/monetisation'] },
};

export default function Gates(props: Props) {
    const { engagement: e, gates, quotation, payment, history } = props;
    const root = `/industries/workspace/${e.reference}`;
    const [open, setOpen] = useState<Gate | null>(null);
    const form = useForm({ acknowledge: false });
    const v = open ? VARIANTS[open.code] : null;

    return (
        <WorkspaceShell
            base={props}
            title="Gate Approval"
            badge={<Chip tone="gold">Gate Governance</Chip>}
            description="These gates enforce compliance, transparency and client protection across all Industries workflows."
            right={
                <>
                    <Box tone="dark" title="Gate Governance">
                        <ul className="space-y-1.5 text-xs">{['AIIM Policy Compliant', 'Human Gate Mandatory', 'Audit Trail Recorded', 'Zero Hidden Charges'].map((t) => <li key={t} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-verified-500" />{t}</li>)}</ul>
                        <Link href="/resources/limitations" className="mt-3 block rounded bg-gold-500 py-1.5 text-center text-xs font-bold text-ink-900">View Gate Policy →</Link>
                    </Box>
                    <Box title="Audit & Traceability">
                        <p className="text-xs text-ink-600">All gate actions are time-stamped and recorded to your secure audit trail.</p>
                        <ul className="mt-2 space-y-1.5 text-[0.6875rem]">{history.length === 0 ? <li className="text-ink-400">No gate actions recorded yet.</li> : history.map((h, i) => <li key={i}><strong>{h.action.replace(/_/g, ' ')}</strong> · {h.at} · {h.actor}</li>)}</ul>
                    </Box>
                </>
            }
        >
            <Table
                head={['Gate', 'Stage', 'Status', 'Decided', 'Action']}
                rows={gates.map((g) => [
                    <strong key="a">{g.code}: {g.name}</strong>,
                    <span key="b" className="text-xs">{g.stage}</span>,
                    <Status key="c" value={g.status} />,
                    <span key="d" className="text-xs">{g.decidedAt ? `${g.decidedAt} · ${g.decidedBy ?? ''}` : '—'}</span>,
                    g.status === 'pending' && VARIANTS[g.code] ? (
                        <button key="e" type="button" onClick={() => { form.reset(); setOpen(g); }} className="rounded bg-gold-500 px-3 py-1 text-xs font-bold">Review gate</button>
                    ) : g.status === 'pending' ? (
                        <span key="e" className="text-xs text-attested-700">Awaiting prior steps</span>
                    ) : (
                        <span key="e" className="flex items-center gap-1 text-xs text-ink-400">{g.status === 'locked' ? <><Lock className="size-3.5" /> Locked</> : <><CheckCircle2 className="size-3.5 text-verified-500" /> Recorded</>}</span>
                    ),
                ])}
            />
            <p className="flex items-center gap-2 rounded-[8px] border border-attested-500/30 bg-attested-50 p-3 text-xs"><Info className="size-4" /> Gates unlock in order. The Payment Gate passes automatically when your split payment succeeds; the Acceptance Gate opens after specialist sign-off.</p>

            <Modal open={!!open && !!v} onClose={() => setOpen(null)} title={`${v?.id ?? ''}: ${open?.name ?? ''}`} size="lg"
                footer={
                    <>
                        <button type="button" onClick={() => setOpen(null)} className="rounded border border-parchment-500 px-4 py-2 text-sm">Cancel</button>
                        <button type="button" disabled={!form.data.acknowledge || form.processing} onClick={() => open && form.post(`${root}/gates/${open.id}`, { preserveScroll: true, onSuccess: () => setOpen(null) })} className={cn('rounded px-4 py-2 text-sm font-semibold text-white disabled:opacity-50', v?.color)}>
                            {v?.action}
                        </button>
                    </>
                }>
                {open && v && (
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3"><v.icon className="size-9 rounded-full bg-parchment-200 p-2 text-ink-700" /><div><p className="text-xs text-ink-500">Stage: {open.stage}</p><p>{v.subtitle}</p></div></div>
                        {v.intro && <p className="text-xs text-ink-600"><strong>What this means: </strong>{v.intro}</p>}
                        {open.code === 'G3' && (
                            <div className="rounded border border-parchment-400 bg-parchment-100 p-3 text-xs"><p className="font-semibold">Quotation Summary</p><div className="mt-1 grid grid-cols-3 gap-2"><span>Engagement<br /><strong>{quotation.engagement}</strong></span><span>Reference<br /><strong>{quotation.reference}</strong></span><span>Total Fee (ZAR)<br /><strong>{zar(quotation.total, 2)}</strong></span></div></div>
                        )}
                        {open.code === 'G4' && (
                            <dl className="rounded border border-verified-500/30 bg-verified-50 p-3 text-xs">{[['Total Amount', zar(payment.total, 2)], ['Payment Method', payment.method], ['Milestone', payment.milestone], ['Currency', payment.currency]].map(([k, val]) => <div key={k} className="flex justify-between"><dt>{k}</dt><dd className="font-semibold">{val}</dd></div>)}</dl>
                        )}
                        {v.list.length > 0 && <><p className="text-xs font-semibold">{v.heading}</p><ul className="space-y-1 text-xs">{v.list.map((l) => <li key={l} className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" />{l}</li>)}</ul></>}
                        {v.note && <p className="rounded bg-attested-50 p-2 text-xs text-attested-700">{v.note}</p>}
                        <div className="flex items-center justify-between gap-2">
                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="accent-gold-600" checked={form.data.acknowledge} onChange={(ev) => form.setData('acknowledge', ev.target.checked)} />{v.confirm}</label>
                            {v.doc[1] ? <Link href={v.doc[1]} className="text-xs text-controlled-700 underline">{v.doc[0]}</Link> : <Link href={`${root}/engagement-letter`} className="text-xs text-controlled-700 underline">{v.doc[0]}</Link>}
                        </div>
                        {form.errors.acknowledge && <p role="alert" className="text-xs text-risk-500">{form.errors.acknowledge}</p>}
                    </div>
                )}
            </Modal>
        </WorkspaceShell>
    );
}
