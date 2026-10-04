import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { BadgeCheck, FileSignature, FileText, Lock, PenLine, ShieldCheck, Unlock, UserCheck } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Field, Input } from '@/Components/ui/Form';
import { PaWorkspaceNav } from '@/Components/Advisory/shells';
import { Card, CheckList, KV, Notice, PageTitle } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';
import type { MandateView } from '@/types/advisory';

export default function Nda({ mandate: m, clauses, fingerprint }: { mandate: MandateView; clauses: [string, string][]; fingerprint: string }) {
    const signed = !!m.nda_signed;
    const form = useForm({ name: '', role: '', authority: false, esign: false });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(`/project-advisory/workspace/${m.reference}/nda`, { preserveScroll: true });
    };
    const vault = ['Sponsor Brief', 'Financial Inputs', 'Site Rights Pack', 'Preliminary Technical Memo'];
    return (
        <div className="container-tbca py-8">
            <Head title="NDA Gate" />
            <PageTitle crumbs={[{ label: 'Project Advisory', href: '/project-advisory' }, { label: m.reference, href: `/project-advisory/workspace/${m.reference}` }, { label: 'NDA Gate' }]} title="Confidentiality Before Evidence Access." sub={<><p className="font-semibold text-gold-700">Review the non-disclosure agreement before protected project evidence is opened.</p><p>This gate protects sponsor information, working papers, preliminary financial material, technical evidence, and other controlled documents before any confidential exchange begins.</p></>} />
            <PaWorkspaceNav reference={m.reference} />
            {signed && <Notice tone="good" className="mb-4"><BadgeCheck className="size-4" />NDA v2.0 signed on {m.nda_signed}. Protected evidence is unlocked.</Notice>}
            <form onSubmit={submit} className="grid gap-4 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-4">
                    <Card title="Project Summary">
                        <KV rows={[['Project Name', m.project], ['Parties', <span>The Business Clinic.Africa<br />{m.organisation}</span>], ['Authority Status', signed ? <span className="text-verified-700">Signatory confirmed</span> : <span className="text-attested-700">Signatory confirmation required</span>], ['Confidentiality Purpose', 'Pre-feasibility, structuring and investor-readiness review'], ['Effective Date', signed ? m.nda_signed : 'To take effect on signature'], ['Version', 'NDA v2.0'], ['Document Fingerprint', <span className="font-mono">{fingerprint}</span>]]} />
                    </Card>
                    <Card title="Secure Workflow — How This Gate Works">
                        <ol className="grid grid-cols-4 gap-2 text-center text-[0.6875rem]">
                            {[[FileText, 'Review NDA', 'Read and understand the agreement.'], [UserCheck, 'Confirm Authority', 'Confirm you can sign on behalf of the party.'], [PenLine, 'Sign Securely', 'Apply your e-signature to proceed.'], [Unlock, 'Unlock Protected Evidence', 'Access is granted after completion.']].map(([I, t, b], i) => {
                                const Icon = I as typeof FileText;
                                return <li key={t as string}><span className={cn('mx-auto inline-flex size-10 items-center justify-center rounded-full border-2', signed || i === 0 ? 'border-gold-500 text-gold-700' : 'border-parchment-500 text-ink-400')}><Icon className="size-4" /></span><p className="mt-1 font-semibold">{t as string}</p><p className="text-ink-500">{b as string}</p></li>;
                            })}
                        </ol>
                    </Card>
                    <Notice tone={signed ? 'good' : 'warn'}>{signed ? <Unlock className="size-4" /> : <Lock className="size-4" />}<span><b>Protected Evidence Status</b><br />{signed ? 'Unlocked for permitted use.' : 'Locked until NDA gate is completed where required.'}</span></Notice>
                </div>
                <div className="lg:col-span-4">
                    <Card title={<span className="flex items-center gap-2"><FileSignature className="size-4" />Mutual Non-Disclosure Agreement</span>} action={<span className="rounded border border-parchment-500 px-1.5 text-[0.6875rem]">NDA v2.0</span>}>
                        <ol className="max-h-[440px] space-y-3 overflow-y-auto rounded border border-parchment-300 p-3 text-xs">
                            {clauses.map(([t, b], i) => <li key={t}><b>{i + 1}. {t}</b><p className="text-ink-600">{b}</p></li>)}
                        </ol>
                        {!signed && (
                            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <Field label="Full Name" required error={form.errors.name}>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g., John M. Dlamini" />}</Field>
                                <Field label="Role / Title" required error={form.errors.role}>{(id) => <Input id={id} value={form.data.role} onChange={(e) => form.setData('role', e.target.value)} placeholder="e.g., Chief Financial Officer" />}</Field>
                                <div className="sm:col-span-2 space-y-1.5">
                                    <Checkbox label="I confirm I have authority to sign for the disclosing or receiving party as applicable." checked={form.data.authority} onChange={(e) => form.setData('authority', e.target.checked)} />
                                    {form.errors.authority && <p className="text-xs text-risk-500">{form.errors.authority}</p>}
                                    <Checkbox label="I agree to use electronic signature for this controlled document." checked={form.data.esign} onChange={(e) => form.setData('esign', e.target.checked)} />
                                    {form.errors.esign && <p className="text-xs text-risk-500">{form.errors.esign}</p>}
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
                <div className="space-y-4 lg:col-span-4">
                    <Card title="Information Categories Covered"><CheckList tone="gold" className="grid gap-x-3 sm:grid-cols-2" items={['Sponsor information', 'Preliminary financial model', 'Technical and feasibility evidence', 'Site, rights and permissions material', 'Investor and counterparty discussions', 'Internal working papers', 'Draft deliverables and method documents']} /></Card>
                    <Card title="Access Boundaries">
                        <KV rows={[['Permitted Use', 'Evaluation and advisory preparation only'], ['Disclosure Restrictions', 'Need-to-know basis only'], ['Third-Party Access', 'Only as permitted in the NDA'], ['External Adviser Treatment', 'Controlled and recorded where allowed'], ['Data Export', signed ? 'Permitted per NDA' : <span className="text-risk-700">Blocked until gate completion</span>], ['Evidence Pack Access', signed ? <span className="text-verified-700">Unlocked</span> : <span className="text-risk-700">Locked</span>]]} />
                    </Card>
                    <Card title="Protected Evidence Vault">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{vault.map((v) => <div key={v} className="rounded border border-parchment-400 p-2 text-center text-[0.6875rem]"><p className="font-semibold">{v}</p><div className={cn('my-2 flex h-12 items-center justify-center rounded', signed ? 'bg-verified-50' : 'bg-parchment-300 blur-[0.5px]')}>{signed ? <Unlock className="size-5 text-verified-700" /> : <Lock className="size-5 text-gold-700" />}</div>{signed ? 'Unlocked' : 'Locked'}</div>)}</div>
                    </Card>
                </div>
                <div className="flex flex-col items-start justify-between gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4 sm:flex-row sm:items-center lg:col-span-12">
                    <p className="flex items-center gap-2 text-sm"><ShieldCheck className="size-6 text-gold-700" /><span><b>You review before you share.</b><br /><span className="text-xs">Protected evidence remains sealed until this gate is complete.</span></span></p>
                    <div className="flex flex-wrap gap-2">
                        {!signed && <Button type="submit" disabled={form.processing} trailingIcon="arrow-right"><Lock className="size-4" />Review and Sign NDA</Button>}
                        <Link href={`/project-advisory/workspace/${m.reference}`} className="inline-flex h-11 items-center rounded border border-ink-300 px-4 text-sm">Decline and Return</Link>
                        <Button type="button" variant="outline" icon="download" onClick={() => window.print()}>Download Draft</Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
