import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { FileText, Lock, Scale, ShieldCheck } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox, ChoiceCard, Field, Input, Textarea } from '@/Components/ui/Form';
import TechJourney, { type JourneyState } from '@/Components/Advisory/TechJourney';
import { LedgerSubtotals } from '@/Components/Advisory/TechFees';
import { Card, KV, Notice, zar } from '@/Components/Advisory/ui';
import type { LedgerTotals } from '@/types/advisory';

interface Props { journey: JourneyState; totals: LedgerTotals; summary: Record<string, string>; context: Record<string, string> | null; plan: string; ready: boolean; signedIn: boolean; firstGate: [number, string, string, number, number, number] }

const CHECKS = ['Scope of services is clear', 'Fees and payment terms understood', 'Deliverables and timelines acceptable', 'Confidentiality and IP terms reviewed', 'Liability and limitation terms reviewed', 'Governing law and dispute terms noted'];

export default function Letter({ journey, totals, summary, context, plan, ready, signedIn, firstGate }: Props) {
    const form = useForm({ checks: [] as string[], method: 'esign', name: '', authority: false, comments: '' });
    const toggle = (c: string) => form.setData('checks', form.data.checks.includes(c) ? form.data.checks.filter((x) => x !== c) : [...form.data.checks, c]);
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((d) => ({ ...d, checks: d.checks.map(() => '1') }));
        form.post('/technology-solutions/engagement-letter');
    };
    const err = form.errors as Record<string, string>;
    return (
        <>
            <Head title="Engagement Letter Review & Sign" />
            <form onSubmit={submit}>
                <TechJourney step={6} journey={journey} title="Engagement Letter Review & Sign" sub="Review the engagement terms, add comments if needed, and sign to activate your solution." badge={<span className="flex items-center gap-1.5 rounded border border-verified-500 px-2 py-1 text-xs text-verified-700"><ShieldCheck className="size-4" />Secure & Legally Binding</span>}
                    footer={<><p className="text-xs text-ink-500">You can save and return later. The engagement will only be activated after signature and payment of the Gate 1 deposit.</p><Link href="/technology-solutions/checkout" className="text-sm">← Back</Link></>}>
                    {!ready && <Notice tone="warn">Complete <Link href="/technology-solutions/context" className="underline">Context</Link> and <Link href="/technology-solutions/configure" className="underline">Configuration</Link> before signing.</Notice>}
                    <div className="grid gap-4 xl:grid-cols-12">
                        <section className="space-y-4 xl:col-span-7">
                            <Card title={<span className="flex items-center gap-2"><FileText className="size-4" />TBCA Professional Services Engagement Agreement</span>} action={<span className="text-xs text-ink-500">EL-TS v1.2</span>}>
                                <div className="max-h-80 space-y-2 overflow-y-auto rounded border border-parchment-300 bg-parchment-100 p-4 text-xs">
                                    <p className="text-center font-bold">PROFESSIONAL SERVICES ENGAGEMENT AGREEMENT</p>
                                    <p>This Engagement Agreement (&ldquo;Agreement&rdquo;) is made between The Business Clinic.Africa™ (TBCA) (&ldquo;Service Provider&rdquo;) and {context?.legal_name || '[CLIENT NAME]'} (&ldquo;Client&rdquo;).</p>
                                    <p><b>1. Purpose</b> — TBCA will provide the professional services and deliverables described in this Agreement and associated Statement of Work (SOW).</p>
                                    <p><b>2. Scope of Services</b> — The services are defined in the approved Solution Configuration and SOW, which form part of this Agreement.</p>
                                    <p><b>3. Gates</b> — Work proceeds gate by gate (GATE-TS-01 to 08). Each approval covers only the current gate. Every gate has a decline path and the Client may stop after any completed gate owing no future unapproved fees.</p>
                                    <p><b>4. Fees</b> — TBCA fees (Ledger T), external costs (Ledger X) and statutory items (Ledger S) are disclosed and invoiced separately. External costs are passed through at cost; supplier commitment requires cleared Ledger X funding.</p>
                                    <p><b>5. Entitlement</b> — Entitlement activates only after server-side payment verification, never from browser success alone.</p>
                                    <p><b>6. Renewal</b> — There is no silent renewal. Go-live does not enrol recurring support; any support or subscription requires explicit activation and renewal approval.</p>
                                </div>
                                <KV className="mt-3" rows={[['Client', context?.legal_name || '—'], ['Solution', summary.tower], ['Engagement Type', 'Advisory + Implementation'], ['Deployment Model', summary.deployment], ['Region', 'South Africa'], ['Payment plan', plan.replace('_', ' + ')], ['Auto-Renewal', 'No']]} />
                                <p className="mt-3 text-xs font-semibold">Included Schedules</p>
                                <ul className="text-xs text-ink-600">{['Schedule A – Scope of Work (SOW)', 'Schedule B – Fees & Payment Terms', 'Schedule C – Service Level Agreement (SLA)', 'Schedule D – Data Processing Agreement (DPA)', 'Schedule E – Commercial Guardrails'].map((s) => <li key={s}>• {s}</li>)}</ul>
                            </Card>
                        </section>
                        <aside className="space-y-4 xl:col-span-5">
                            <Card title="Review Checklist">
                                <div className="space-y-1.5">{CHECKS.map((c) => <Checkbox key={c} label={c} checked={form.data.checks.includes(c)} onChange={() => toggle(c)} />)}</div>
                                {(err.checks || err['checks.0']) && <p className="mt-1 text-xs text-risk-500">{err.checks ?? 'Confirm every item on the review checklist.'}</p>}
                            </Card>
                            <Card title="Sign">
                                <Field label="Add Comments (Optional)" hint={`${form.data.comments.length}/500`}>{(id) => <Textarea id={id} maxLength={500} value={form.data.comments} onChange={(e) => form.setData('comments', e.target.value)} className="min-h-16" />}</Field>
                                <div className="mt-3 space-y-2" role="radiogroup"><ChoiceCard selected={form.data.method === 'esign'} onSelect={() => form.setData('method', 'esign')} title="eSign (Recommended)" description="Secure, legally binding digital signature" /><ChoiceCard selected={form.data.method === 'manual'} onSelect={() => form.setData('method', 'manual')} title="Manual Signature" description="Download, sign, and upload" /></div>
                                <Field label="Full name of signatory" required className="mt-3" error={err.name}>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                                <Checkbox className="mt-3" label="By signing, I confirm I have the authority to bind the organisation and agree to the terms of this Engagement Agreement." checked={form.data.authority} onChange={(e) => form.setData('authority', e.target.checked)} />
                                {err.authority && <p className="text-xs text-risk-500">{err.authority}</p>}
                                <div className="mt-3 rounded border border-gold-400 bg-gold-50 p-3 text-xs"><p>On signing, <b>Gate 1 — {firstGate[1]}</b> is presented. Amount payable now: <b>{zar(firstGate[3])}</b> (Ledger T, excl. VAT).</p></div>
                                {signedIn ? <Button type="submit" className="mt-3 w-full" disabled={form.processing || !ready} trailingIcon="arrow-right">Review & Sign Engagement Letter</Button> : <Link href="/login" className="mt-3 flex h-11 items-center justify-center gap-2 rounded bg-gold-500 font-semibold"><Lock className="size-4" />Sign in to sign</Link>}
                            </Card>
                            <Card title="Ledger subtotals"><LedgerSubtotals totals={totals} /></Card>
                            <p className="flex items-center gap-1.5 text-xs text-ink-500"><Scale className="size-4" />Need legal support? Talk to a TBCA legal advisor before signing.</p>
                        </aside>
                    </div>
                </TechJourney>
            </form>
        </>
    );
}
