import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { PartyPopper, PenLine, ShieldCheck, UserCheck } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox } from '@/Components/ui/Form';
import { PaWorkspaceNav } from '@/Components/Advisory/shells';
import { Card, CheckList, KV, Notice, PageTitle, zar } from '@/Components/Advisory/ui';
import type { MandateView } from '@/types/advisory';

const ROUTES: Record<string, string> = { 'fixed-scope': 'Stage-Gated | Fixed Scope', 'recurring-advisory': 'Stage-Gated | Recurring Advisory', contingent: 'Stage-Gated | Contingent (authorised only)', 'co-advisory': 'Stage-Gated | Co-Advisory / Partner-Supported' };

export default function MandateLetter({ mandate: m, value, deposit, letterRef }: { mandate: MandateView; value: number; deposit: number; letterRef: string }) {
    const signed = !!m.mandate_signed;
    const form = useForm({ accept: false });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(`/project-advisory/workspace/${m.reference}/mandate-letter`);
    };
    return (
        <div className="container-tbca py-8">
            <Head title="Mandate Letter Preview & E-Sign" />
            <PageTitle crumbs={[{ label: 'Project Advisory', href: '/project-advisory' }, { label: m.reference, href: `/project-advisory/workspace/${m.reference}` }, { label: 'Mandate Letter' }]} title="Mandate Letter Preview & E-Sign" sub="Review your mandate, confirm key terms and sign securely to activate your engagement." actions={<span className="flex items-center gap-2 rounded border border-controlled-500/30 bg-controlled-50 px-3 py-2 text-xs"><ShieldCheck className="size-4" />Secure · Compliant · Legally Robust</span>} />
            <PaWorkspaceNav reference={m.reference} lifecycle={m.lifecycle} />
            {!m.letter_signed && <Notice tone="warn" className="mb-4">Sign the Engagement Letter first. <Link href={`/project-advisory/workspace/${m.reference}/engagement-letter`} className="underline">Open Engagement Letter</Link></Notice>}
            <div className="grid gap-5 lg:grid-cols-12">
                <form onSubmit={submit} className="space-y-4 lg:col-span-5">
                    <Card><div className="flex items-center gap-4"><span className="inline-flex size-16 items-center justify-center rounded-full bg-gold-100"><PartyPopper className="size-8 text-gold-700" /></span><div><p className="font-serif text-xl font-semibold">{signed ? 'Mandate signed' : 'Final Step'}</p><p className="text-sm text-ink-600">{signed ? `Signed ${m.mandate_signed}. ${m.deposit?.status === 'paid' ? 'Deposit verified — your mandate is active.' : 'Complete the deposit payment to activate work.'}` : 'You are one signature away from authorising The Business Clinic.Africa™ to begin work on your mandate.'}</p></div></div></Card>
                    <Card title="Mandate Summary">
                        <KV rows={[['Client', `${m.organisation}`], ['Engagement Type', `Project Advisory (${m.service?.name ?? '—'})`], ['Sector', m.sector], ['Engagement Model', ROUTES[m.route] ?? m.route], ['Scope', m.service?.name ?? '—'], ['Indicative Timeline', m.service?.duration ?? '—'], ['Engagement Value (Ledger T)', zar(value)], ['Deposit now (M1 20% T + PL-01)', zar(deposit)]]} />
                    </Card>
                    <Card title="Key Commitments"><CheckList items={['Transparent fees confirmed in Fee Ledger', 'Milestone-based delivery with client approvals', 'Evidence-controlled experience and access', 'Right to use the Abort / Stop-Now Ladder', 'Confidentiality maintained under signed NDA']} /></Card>
                    {!signed ? (
                        <>
                            <div className="rounded-[8px] border border-gold-300 bg-gold-50 p-4"><Checkbox label="I confirm that I have read, understood and accept the Mandate Letter and agree to sign it electronically." checked={form.data.accept} onChange={(e) => form.setData('accept', e.target.checked)} />{form.errors.accept && <p className="mt-1 text-xs text-risk-500">{form.errors.accept}</p>}</div>
                            <Button type="submit" size="lg" className="w-full" disabled={form.processing || !m.letter_signed}><PenLine className="size-5" />Sign Mandate Letter</Button>
                        </>
                    ) : m.deposit && m.deposit.status !== 'paid' ? (
                        <Link href={`/checkout/${m.deposit.reference}`} className="flex h-12 items-center justify-center rounded bg-gold-500 font-semibold">Pay deposit {zar(m.deposit.total)} →</Link>
                    ) : null}
                    <Button type="button" variant="outline" className="w-full" icon="download" onClick={() => window.print()}>Download PDF</Button>
                    <Link href="/services/mandatory-partner-escalation" className="flex h-11 items-center justify-center gap-2 rounded border border-ink-300 text-sm"><UserCheck className="size-4" />Request Human Review</Link>
                    <p className="text-center text-xs text-ink-500">Need help? Chat with our Engagement Team | Call +27 60 801 1365</p>
                </form>
                <section className="rounded-[10px] bg-ink-800 p-4 lg:col-span-7">
                    <article className="mx-auto max-w-xl bg-white text-xs text-ink-800 shadow">
                        <header className="flex justify-between bg-ink-950 p-4 text-parchment-100"><span className="font-serif text-gold-400">THE BUSINESS CLINIC.AFRICA™</span><span className="text-right">MANDATE LETTER<br /><span className="text-[0.625rem]">Ref: {letterRef}</span></span></header>
                        <div className="space-y-3 p-6">
                            <h2 className="text-center text-sm font-bold">CLIENT ENGAGEMENT MANDATE LETTER</h2>
                            <div className="grid grid-cols-2 gap-4"><p><b>Between</b><br />The Business Clinic.Africa™ (&ldquo;TBCA&rdquo;)</p><p><b>And</b><br />{m.organisation} (&ldquo;Client&rdquo;)</p></div>
                            <p><b>1. Purpose</b><br />This Mandate Letter confirms the Client&rsquo;s formal instruction to TBCA to proceed with the defined engagement under the terms and conditions set out herein, following completion of the stage-gated pre-engagement process on the TBCA WebApp.</p>
                            <p><b>2. Scope of Engagement</b><br />Project Advisory – {m.service?.name ?? 'as per Method Card'} for {m.project}.</p>
                            <p><b>3. Engagement Model</b><br />Stage-Gated | Evidence-Controlled | Transparent Fee Structure</p>
                            <div><b>4. Key Terms</b><table className="mt-1 w-full border border-gold-300 bg-gold-50"><tbody>{[['Commencement Date', 'On verified deposit'], ['Indicative Timeline', m.service?.duration ?? '—'], ['Engagement Value', `ZAR ${value.toLocaleString('en-ZA')} (Ledger T, from Fee Transparency Ledger)`], ['Governance', 'Controlled by TBCA engagement framework and governance protocols']].map(([k, v]) => <tr key={k}><td className="p-1.5 font-semibold">{k}:</td><td className="p-1.5">{v}</td></tr>)}</tbody></table></div>
                            <div><b>5. Client Commitments</b><CheckList className="mt-1" items={['Provide timely access to relevant information and stakeholders.', 'Approve milestones and deliverables as per the agreed Engagement Option.', 'Maintain confidentiality as per signed NDA.']} /></div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="rounded border border-parchment-400 p-3"><p className="font-semibold">For The Business Clinic.Africa™</p><p className="mt-3 font-serif text-lg italic">Kruger Phiri</p><p>Managing Partner</p></div>
                                <div className="rounded border border-parchment-400 p-3"><p className="font-semibold">For {m.organisation}</p>{signed ? <p className="mt-3 font-serif text-lg italic">Signed electronically<br /><span className="text-xs not-italic">{m.mandate_signed}</span></p> : <p className="mt-3 rounded bg-controlled-50 p-2 text-center text-controlled-700">Your Signature Required</p>}</div>
                            </div>
                        </div>
                        <footer className="flex justify-between bg-ink-950 px-4 py-2 text-[0.625rem] text-parchment-100"><span>STRICTLY PRIVATE AND CONFIDENTIAL</span><span>Page 1 of 1</span></footer>
                    </article>
                </section>
            </div>
        </div>
    );
}
