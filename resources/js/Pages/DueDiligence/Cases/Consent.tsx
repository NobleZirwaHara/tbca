import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock, Copy, Link2, MinusCircle, Send, Upload, XCircle } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { Card, Ring, shortDate } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { DdCasePageProps, DdEvent } from '@/types/due-diligence';

interface ConsentRow { id: number; type: string; label: string; requirement: string; status: string; given_by: string | null; method: string | null; received_at: string | null; valid_until: string | null }
interface Props extends DdCasePageProps {
    consents: ConsentRow[];
    percent: number;
    documents: { id: number; original_name: string; status: string; createdAt: string }[];
    requests: { id: number; recipient_name: string; recipient_role: string; recipient_email: string | null; channel: string; status: string; reminders: number; sentAt: string; expiresAt: string | null; link: string; consentLabel: string | null }[];
    audit: DdEvent[];
    purpose: Record<string, string | null>;
}

const SELF_ACK = ['cross_border', 'report_delivery', 'monitoring', 'lawful_purpose'];

function statusView(r: ConsentRow) {
    const expiring = r.status === 'received' && r.valid_until && new Date(r.valid_until).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 30;
    if (r.status === 'received') return expiring ? [<AlertTriangle key="i" className="size-4 text-attested-500" />, 'Expires Soon', 'text-attested-700'] : [<CheckCircle2 key="i" className="size-4 text-verified-500" />, 'Received', 'text-verified-700'];
    if (r.status === 'not_required') return [<MinusCircle key="i" className="size-4 text-ink-300" />, 'Not Required', 'text-ink-400'];
    if (r.status === 'optional') return [<MinusCircle key="i" className="size-4 text-controlled-500" />, 'Optional', 'text-controlled-600'];
    if (r.status === 'withdrawn') return [<XCircle key="i" className="size-4 text-risk-500" />, 'Withdrawn', 'text-risk-600'];
    return [<Clock key="i" className="size-4 text-attested-500" />, 'Pending', 'text-attested-700'];
}

/** DD-034 Consent Centre. Screening cannot proceed until mandatory consents are received (G3). */
export default function Consent(props: Props) {
    const { case: c, consents, percent, documents, requests, audit, purpose } = props;
    const base = `/due-diligence/cases/${c.reference}`;
    const [ack, setAck] = useState<ConsentRow | null>(null);
    const [link, setLink] = useState<string | null>(null);
    const requestable = consents.filter((x) => ['subject', 'authorised_request'].includes(x.type) && x.requirement === 'required' && x.status !== 'received');
    const send = useForm({ consent_id: String(requestable[0]?.id ?? ''), recipient_name: '', recipient_role: 'Company Secretary', recipient_email: '', channel: 'Email' });
    const upload = useForm<{ file: File | null; category: string }>({ file: null, category: 'consent' });
    const ackForm = useForm({ confirm: true });
    const open = c.status !== 'closed';

    return (
        <CaseLayout
            page={props}
            active="consent"
            title="Consent Centre"
            subtitle="Lawful purpose. Privacy by design. Consent-led checks."
            description="We do not screen until required consents and purpose confirmations are complete."
            roleNote="You must complete all required consents before screening can proceed."
            bandNote="Fee code: zero-fee consent gate."
            actions={
                c.status === 'consent_pending' ? (
                    <Button type="button" disabled={!c.consentsComplete} onClick={() => router.post(`${base}/consent-gate`)} trailingIcon="arrow-right">Complete Consent Gate</Button>
                ) : undefined
            }
            aside={
                <Card title="Consent readiness" action={<span className="rounded bg-gold-50 px-1.5 text-[0.6875rem] font-semibold text-gold-800">{percent}% Complete</span>}>
                    <ul className="space-y-1.5">
                        {consents.map((r) => {
                            const [icon, label, cls] = statusView(r);
                            return <li key={r.id} className="flex items-center gap-2 text-xs">{icon}<span className="flex-1">{r.label}</span><span className={cls as string}>{label}</span></li>;
                        })}
                    </ul>
                    {!c.consentsComplete && <p className="mt-2 rounded bg-attested-50 p-2 text-[0.6875rem] text-ink-700">Mandatory consents are pending. Screening is locked.</p>}
                </Card>
            }
        >
            <div className="grid gap-5 xl:grid-cols-12">
                <Card title="Overall Consent Status" className="xl:col-span-7">
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="flex flex-col items-center"><Ring value={percent} size={100} /><p className="mt-1 max-w-36 text-center text-[0.6875rem] text-ink-500">{consents.filter((x) => x.requirement === 'required' && x.status === 'received').length} of {consents.filter((x) => x.requirement === 'required').length} required consents received</p></div>
                        <div className="flex-1 overflow-x-auto">
                            <table className="w-full min-w-[460px] text-left text-xs">
                                <thead className="text-ink-500"><tr><th className="py-1">Consent Type</th><th>Status</th><th>Received</th><th>Valid Until</th><th>Required</th><th /></tr></thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {consents.map((r) => {
                                        const [icon, label, cls] = statusView(r);
                                        return (
                                            <tr key={r.id}>
                                                <td className="py-2 font-medium">{r.label}</td>
                                                <td><span className={cn('inline-flex items-center gap-1', cls as string)}>{icon}{label}</span></td>
                                                <td>{shortDate(r.received_at)}</td>
                                                <td>{shortDate(r.valid_until)}</td>
                                                <td className="capitalize">{r.requirement.replace('_', ' ')}</td>
                                                <td className="text-right">
                                                    {open && SELF_ACK.includes(r.type) && r.status !== 'received' && r.requirement !== 'not_required' && <button type="button" className="font-semibold text-gold-700 hover:underline" onClick={() => setAck(r)}>Acknowledge</button>}
                                                    {open && r.status === 'received' && <button type="button" className="text-risk-600 hover:underline" onClick={() => { if (confirm(`Withdraw ${r.label}? Processing that relies on it will stop.`)) router.post(`${base}/consents/${r.id}/withdraw`, {}, { preserveScroll: true }); }}>Withdraw</button>}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
                <Card title="Consent Documents" className="xl:col-span-5">
                    <ul className="divide-y divide-parchment-300 text-xs">
                        {documents.length === 0 && <li className="py-2 text-ink-500">No consent documents uploaded yet.</li>}
                        {documents.map((d) => <li key={d.id} className="flex items-center gap-2 py-2"><a href={`${base}/documents/${d.id}`} className="flex-1 font-medium hover:text-gold-700">{d.original_name}</a><span className={d.status === 'verified' ? 'text-verified-700' : 'text-attested-700'}>{d.status === 'verified' ? 'Verified' : 'Pending Review'}</span><span className="text-ink-400">{shortDate(d.createdAt)}</span></li>)}
                    </ul>
                    {open && (
                        <form className="mt-3 flex flex-wrap items-center gap-2" onSubmit={(e) => { e.preventDefault(); upload.post(`${base}/evidence`, { preserveScroll: true, forceFormData: true, onSuccess: () => upload.reset('file') }); }}>
                            <label className="sr-only" htmlFor="consent-file">Consent document</label>
                            <input id="consent-file" type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" className="min-w-0 flex-1 text-xs" onChange={(e) => upload.setData('file', e.target.files?.[0] ?? null)} />
                            <Button type="submit" size="sm" variant="outline" disabled={!upload.data.file || upload.processing}><Upload className="size-4" aria-hidden="true" /> Upload Document</Button>
                            {upload.errors.file && <p className="w-full text-xs text-risk-500">{upload.errors.file}</p>}
                        </form>
                    )}
                    <p className="mt-2 text-[0.6875rem] text-ink-500">Signed consent and board authorisation letters are verified by TBCA before the consent is marked received.</p>
                </Card>
            </div>

            <div className="grid gap-5 xl:grid-cols-12">
                <Card title="Subject & Purpose" className="xl:col-span-5">
                    <dl className="space-y-1.5 text-xs">
                        {[['Subject / Entity', purpose.subject], ['Requesting Party', purpose.requester], ['Purpose of Check', purpose.purpose], ['Jurisdiction', purpose.jurisdiction], ['Lawful Basis', purpose.lawfulBasis], ['Authority Basis', purpose.authorityBasis], ['Scope Requested', purpose.scope]].map(([k, v]) => <div key={k as string} className="grid grid-cols-3 gap-2"><dt className="text-ink-500">{k}</dt><dd className="col-span-2 font-medium">{v ?? '—'}</dd></div>)}
                    </dl>
                    <p className="mt-3 rounded bg-attested-50 p-2 text-[0.6875rem] text-ink-700">We process personal information in accordance with POPIA and our Privacy Notice. You may withdraw consent at any time; withdrawing consent may limit or stop our ability to provide the requested services.</p>
                </Card>
                <Card title="Requests & Reminders" className="xl:col-span-7">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[520px] text-left text-xs">
                            <thead className="text-ink-500"><tr><th className="py-1">Recipient / Role</th><th>Consent</th><th>Sent</th><th>Channel</th><th>Status</th><th>Reminders</th><th>Expires</th><th /></tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {requests.length === 0 && <tr><td colSpan={8} className="py-3 text-ink-500">No consent requests sent yet.</td></tr>}
                                {requests.map((r) => (
                                    <tr key={r.id}>
                                        <td className="py-2"><span className="font-medium">{r.recipient_name}</span><br /><span className="text-ink-500">{r.recipient_role}</span></td>
                                        <td>{r.consentLabel}</td><td>{shortDate(r.sentAt)}</td><td>{r.channel}</td>
                                        <td className={r.status === 'completed' ? 'text-verified-700' : r.status === 'declined' ? 'text-risk-600' : 'text-attested-700'}>{r.status}</td>
                                        <td>{r.reminders}</td><td>{shortDate(r.expiresAt)}</td>
                                        <td className="space-x-2 text-right whitespace-nowrap">
                                            {['pending', 'delivered'].includes(r.status) && <button type="button" className="text-gold-700 hover:underline" onClick={() => router.post(`${base}/consent-requests/${r.id}/remind`, {}, { preserveScroll: true })}>Resend</button>}
                                            {['pending', 'delivered'].includes(r.status) && <button type="button" className="text-gold-700 hover:underline" onClick={() => setLink(r.link)}>Secure link</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {open && requestable.length > 0 && (
                        <form className="mt-4 grid gap-3 rounded-[8px] border border-parchment-400 p-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); send.post(`${base}/consent-requests`, { preserveScroll: true, onSuccess: () => send.reset('recipient_name', 'recipient_email') }); }}>
                            <Field label="Consent required" error={send.errors.consent_id}>{(id) => <Select id={id} value={send.data.consent_id} onChange={(e) => send.setData('consent_id', e.target.value)} options={requestable.map((x) => ({ value: String(x.id), label: x.label }))} />}</Field>
                            <Field label="Recipient role" error={send.errors.recipient_role}>{(id) => <Select id={id} value={send.data.recipient_role} onChange={(e) => send.setData('recipient_role', e.target.value)} options={['Company Secretary', 'Authorised Director', 'Data Subject', 'Compliance Contact']} />}</Field>
                            <Field label="Recipient name" error={send.errors.recipient_name} required>{(id) => <Input id={id} value={send.data.recipient_name} onChange={(e) => send.setData('recipient_name', e.target.value)} />}</Field>
                            <Field label="Recipient email" error={send.errors.recipient_email} required>{(id) => <Input id={id} type="email" value={send.data.recipient_email} onChange={(e) => send.setData('recipient_email', e.target.value)} />}</Field>
                            <Field label="Channel">{(id) => <Select id={id} value={send.data.channel} onChange={(e) => send.setData('channel', e.target.value)} options={['Email', 'WhatsApp']} />}</Field>
                            <div className="flex items-end"><Button type="submit" size="sm" disabled={send.processing}><Send className="size-4" aria-hidden="true" /> Send Consent Request</Button></div>
                        </form>
                    )}
                </Card>
            </div>

            <Card title="Audit Trail">
                <ol className="space-y-2">
                    {audit.map((e) => (
                        <li key={e.code} className="grid gap-2 text-xs sm:grid-cols-[10rem_1fr_7rem]">
                            <span className="text-ink-400">{shortDate(e.at, true)}</span>
                            <span>{e.description} <span className="text-ink-400">— {e.actor}</span></span>
                            <span className="font-mono text-ink-500">{e.code}</span>
                        </li>
                    ))}
                </ol>
            </Card>

            <Modal open={ack !== null} onClose={() => setAck(null)} title={ack?.label ?? ''} footer={<><Button type="button" variant="ghost" onClick={() => setAck(null)}>Cancel</Button><Button type="button" disabled={ackForm.processing} onClick={() => ack && ackForm.post(`${base}/consents/${ack.id}/acknowledge`, { preserveScroll: true, onSuccess: () => setAck(null) })}>I acknowledge</Button></>}>
                <p className="text-sm text-ink-700">
                    {ack?.type === 'cross_border' && 'I acknowledge that information may be transferred outside South Africa only with appropriate safeguards and for the stated purpose.'}
                    {ack?.type === 'report_delivery' && 'I acknowledge that the report will be delivered only through the secure TBCA portal, and that notifications will never contain sensitive results.'}
                    {ack?.type === 'monitoring' && 'I consent to ongoing monitoring of the subject for the stated purpose, subject to an active monitoring plan.'}
                    {ack?.type === 'lawful_purpose' && 'I re-confirm the lawful purpose recorded for this case.'}
                </p>
            </Modal>
            <Modal open={link !== null} onClose={() => setLink(null)} title="Secure consent link">
                <p className="mb-2 text-xs text-ink-500">Share this link only with the named recipient. It shows the purpose and requester, never case results.</p>
                <div className="flex items-center gap-2 rounded border border-parchment-400 bg-parchment-100 p-2 text-xs break-all"><Link2 className="size-4 shrink-0" aria-hidden="true" />{link}</div>
                <Button type="button" size="sm" className="mt-3" onClick={() => link && navigator.clipboard?.writeText(link)}><Copy className="size-4" aria-hidden="true" /> Copy link</Button>
            </Modal>
        </CaseLayout>
    );
}
