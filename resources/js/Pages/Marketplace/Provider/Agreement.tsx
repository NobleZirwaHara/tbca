import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Circle, Download, PenLine } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Stepper } from '@/Components/ui/Kit';
import { Checkbox, Field, Input } from '@/Components/ui/Form';
import { ProviderShell } from '@/Components/Marketplace/Shells';
import { Card, FactStrip, InfoRows, Notice } from '@/Components/Marketplace/ui';
import type { MkProvider } from '@/types/marketplace';

interface Props { provider: MkProvider; terms: { title: string; items: string[] }[]; acks: Record<string, string>; agreementRef: string }

export default function Agreement({ provider: p, terms, acks, agreementRef }: Props) {
    const signed = !!p.agreementSigned;
    const ready = ['agreement_ready', 'verified'].includes(p.status);
    const form = useForm<Record<string, string | boolean>>({ signatory: '', ...Object.fromEntries(Object.keys(acks).map((k) => [`ack_${k}`, false])) });
    const allAck = Object.keys(acks).every((k) => form.data[`ack_${k}`]);
    const step = signed ? 5 : ready ? 3 : 2;

    return (
        <ProviderShell crumbs={[{ label: 'Provider Portal', href: '/marketplace/provider' }, { label: 'Provider Agreement' }]} title="Provider Agreement" description="Review and agree to the controlled terms that govern your participation as an external provider in the TBCA Marketplace.">
            <Head title="Provider Agreement" />
            <div className="mb-5 max-w-2xl"><Stepper steps={['Application', 'Verification', 'Agreement', 'Training', 'Active']} current={step} /></div>
            <FactStrip items={[{ label: 'Gate', value: 'GATE-MP-14' }, { label: 'Agreement Status', value: signed ? `Signed ${p.agreementSigned}` : ready ? 'Ready for Signature' : 'Awaiting Verification' }, { label: 'Provider Status', value: p.statusLabel }, { label: 'Agreement Reference', value: agreementRef }, { label: 'Version', value: 'MP-PA-v2.1' }]} />
            {!ready && !signed && <Notice tone="warn" className="mt-4">The agreement unlocks once TBCA verification is approved. Submission of an application does not create approval.</Notice>}
            <div className="mt-5 grid gap-5 xl:grid-cols-12">
                <Card className="xl:col-span-8" title="Agreement Summary — Key Terms">
                    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                        {terms.map((t, i) => <div key={t.title}><p className="text-sm font-semibold text-ink-900"><span className="text-gold-700">{i + 1}.</span> {t.title}</p><ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-ink-600">{t.items.map((x) => <li key={x}>{x}</li>)}</ul></div>)}
                    </div>
                </Card>
                <div className="space-y-4 xl:col-span-4">
                    <Card title="Provider & Agreement Details"><InfoRows dense rows={[['Provider Name', p.name], ['Provider ID', p.applicationRef ?? p.code], ['Agreement Version', 'MP-PA-v2.1'], ['Effective On', signed ? p.agreementSigned : 'Effective on signature'], ['Governing Territory', 'South Africa Phase 1']]} /></Card>
                    <Card title="Signature Status">
                        <ul className="space-y-2 text-sm">{[['Read Summary', true], ['Review Full Agreement', true], ['Accept Key Terms', signed || allAck], ['Sign Agreement', signed]].map(([k, d]) => <li key={k as string} className="flex items-center gap-2">{d ? <CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" /> : <Circle className="size-4 text-ink-300" aria-hidden="true" />}{k as string}<span className="ml-auto text-xs text-ink-400">{d ? 'Completed' : 'Pending your signature'}</span></li>)}</ul>
                        <Notice tone="warn" className="mt-3">Submission of an application does not create approval. Signature does not guarantee work volume.</Notice>
                    </Card>
                    <Card title="Payment & Commercial Summary"><InfoRows dense rows={[['Payment Trigger', 'Acceptance of deliverables'], ['Payment Timing', 'Net 15 days from acceptance'], ['Withholding State', 'Gross payment (no withholding)'], ['Right to Decline Briefs', 'You may accept or decline'], ['Protected Relationship', '6 months post completion']]} /></Card>
                    <Card title="QA & Conduct Summary"><InfoRows dense rows={[['QA Standard', 'TBCA QA Framework v2.0'], ['Correction R1 / R2', '5 days (R1) / 7 days (R2)'], ['Escalation Route', 'Portal → QA Manager → TBCA'], ['POPIA Awareness', 'You must remain POPIA aware'], ['Stop-Work on Boundary Breach', 'Mandatory escalation']]} /></Card>
                </div>
            </div>
            {!signed && (
                <form className="mt-5 rounded-[8px] border border-parchment-400 bg-white p-5" onSubmit={(e) => { e.preventDefault(); form.post('/marketplace/provider/agreement'); }}>
                    <p className="text-sm font-semibold text-ink-900">Acknowledgement — Please confirm your acceptance of the key terms above</p>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">{Object.entries(acks).map(([k, l]) => <Checkbox key={k} label={l} checked={!!form.data[`ack_${k}`]} disabled={!ready} onChange={(e) => form.setData(`ack_${k}`, e.target.checked)} />)}</div>
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                        <Field label="Authorised signatory (full name)" required error={form.errors.signatory as string | undefined}>{(id) => <Input id={id} value={form.data.signatory as string} disabled={!ready} onChange={(e) => form.setData('signatory', e.target.value)} />}</Field>
                        <Link href="/marketplace/provider" className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 px-4 text-sm">Back to Verification</Link>
                        <Button type="button" variant="outline" onClick={() => window.print()}><Download className="size-4" aria-hidden="true" /> Download Summary</Button>
                        <Button type="submit" disabled={!ready || !allAck || form.processing}><PenLine className="size-4" aria-hidden="true" /> Review and Sign</Button>
                    </div>
                </form>
            )}
        </ProviderShell>
    );
}

Agreement.layout = null;
