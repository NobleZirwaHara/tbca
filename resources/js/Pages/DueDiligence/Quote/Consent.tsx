import { router, useForm } from '@inertiajs/react';
import { Bookmark, Headphones, Shield, Target, Users } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Field, Select } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import QuoteShell from '@/Components/DueDiligence/QuoteShell';
import { Card, Ticks, shortDate } from '@/Components/DueDiligence/Ui';
import type { DdQuotePageProps } from '@/types/due-diligence';

interface Props extends DdQuotePageProps {
    user: { name: string };
}

/** DD-025 Consent, Privacy and Purpose Gate (G2/G3). No vendor transmission happens before this is recorded. */
export default function Consent(props: Props) {
    const { quote, user } = props;
    const done = quote.consentedAt !== null;
    const form = useForm({
        lawful_purpose: done, authority: done, privacy_read: done, processing_consent: done, notice_route: done, subject_rights: done,
        authority_basis: String((quote.consent?.authority_basis as string | undefined) ?? 'Board mandate'),
    });
    const payer = quote.payerName ?? 'your organisation';
    const err = form.errors as Record<string, string>;
    const box = (key: keyof typeof form.data, label: string, sub: string) => (
        <div>
            <Checkbox label={<><span className="font-medium text-ink-900">{label}</span><span className="block text-xs text-ink-500">{sub}</span></>} checked={Boolean(form.data[key])} onChange={(e) => form.setData(key, e.target.checked as never)} />
            {err[key] && <p className="mt-1 text-xs text-risk-500">{err[key]}</p>}
        </div>
    );
    const Side = ({ rows }: { rows: [string, string][] }) => (
        <dl className="space-y-1.5 rounded-[8px] bg-parchment-100 p-3 text-xs">
            {rows.map(([k, v]) => <div key={k} className="grid grid-cols-2 gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-medium text-ink-900">{v}</dd></div>)}
        </dl>
    );

    return (
        <QuoteShell
            page={props}
            title="Consent, Privacy and Purpose Gate"
            subtitle="Purpose, authority and privacy before any check."
            description="Your informed consent is required before we engage trusted partners or perform any screening. You remain in control and can withdraw consent at any time."
            current={2}
            lifecycle="C/1"
            publicStage="2 Consent & Payment"
            hidePrice
            next="Once you accept purpose and consent, we will move to the engagement review."
            aside={
                <>
                    <Card title="What this means for you">
                        <Ticks items={['No checks run until consent is recorded.', 'You can withdraw consent at any time.', 'Withdrawal stops future processing.', 'We will keep only what is necessary for audit and compliance.', 'You remain responsible for informing subjects of notices.']} />
                    </Card>
                    <Card title="Your privacy at a glance">
                        <Side rows={[['Data Minimisation', 'Only what is necessary'], ['Trusted Partners', 'Pre-approved, contract-bound'], ['Cross-Border Transfers', 'Only with safeguards'], ['Retention', '12 months active + 12 months archive'], ['Security', 'Encrypted, role-based access']]} />
                    </Card>
                    <button type="button" onClick={() => openAskQuestion({ subject: 'Privacy question', section: 'due-diligence' })} className="flex w-full items-center gap-2 rounded-[8px] border border-parchment-400 bg-white p-3 text-left text-xs hover:border-gold-500">
                        <Headphones className="size-5 text-gold-600" aria-hidden="true" /><span><strong className="block text-ink-900">Need help or have questions?</strong>Talk to a Privacy Specialist for clear guidance.</span>
                    </button>
                    <Button type="button" size="lg" className="w-full" trailingIcon="arrow-right" disabled={form.processing} onClick={() => form.post(`/due-diligence/quotes/${quote.reference}/consent`, { preserveScroll: true })}>Accept Purpose & Consent</Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => router.post(`/due-diligence/quotes/${quote.reference}/consent`, { save_exit: 1 })}><Bookmark className="size-4" aria-hidden="true" /> Save and Exit</Button>
                </>
            }
        >
            {done && <p className="rounded-[8px] border border-verified-500/30 bg-verified-50 p-3 text-sm text-verified-700">Consent recorded on {shortDate(quote.consentedAt, true)}. You may re-confirm to continue.</p>}
            <Card title={<span className="flex items-center gap-2"><Target className="size-5 text-gold-600" aria-hidden="true" />1. Purpose and Authority</span>}>
                <div className="grid gap-4 md:grid-cols-5">
                    <div className="space-y-3 md:col-span-3">
                        <p className="text-xs text-ink-500">We may only proceed for a lawful purpose and with the correct authority.</p>
                        {box('lawful_purpose', 'I confirm I have a lawful purpose for this due diligence.', `Purpose: ${String(quote.inputs.purpose ?? '')} for ${payer}.`)}
                        {box('authority', `I confirm I am authorised to request this service on behalf of ${payer}.`, `Authorised by: ${user.name}, Client.`)}
                        <Field label="Authority basis" error={err.authority_basis}>{(id) => <Select id={id} value={form.data.authority_basis} onChange={(e) => form.setData('authority_basis', e.target.value)} options={['Board mandate', 'Delegated authority', 'Owner / sole proprietor', 'Power of attorney']} />}</Field>
                    </div>
                    <div className="md:col-span-2"><Side rows={[['Purpose Type', String(quote.inputs.purpose ?? '')], ['Authority Basis', form.data.authority_basis], ['Jurisdiction', String(quote.inputs.jurisdiction ?? 'South Africa')], ['Case Reference (internal)', quote.reference]]} /></div>
                </div>
            </Card>
            <Card title={<span className="flex items-center gap-2"><Shield className="size-5 text-gold-600" aria-hidden="true" />2. Privacy Notice</span>}>
                <div className="grid gap-4 md:grid-cols-5">
                    <div className="space-y-3 md:col-span-3">
                        <p className="text-xs text-ink-500">We explain how we collect, use, share and protect personal and business information.</p>
                        {box('privacy_read', 'I have read and understood the TBCA Privacy Notice.', 'Notice Version: PN-DD-2026-05')}
                        {box('processing_consent', 'I consent to the lawful processing of the information we collect for the stated purpose.', 'Processing includes collection, use, sharing with trusted partners and retention as described.')}
                    </div>
                    <div className="md:col-span-2"><Side rows={[['Notice Type', 'Privacy Notice'], ['Applies To', payer], ['Data Controller', 'The Business Clinic.Africa'], ['Data Protection Officer', 'dpo@thebusinessclinic.africa']]} /></div>
                </div>
            </Card>
            <Card title={<span className="flex items-center gap-2"><Users className="size-5 text-gold-600" aria-hidden="true" />3. Subject Notice / Consent Route</span>}>
                <div className="grid gap-4 md:grid-cols-5">
                    <div className="space-y-3 md:col-span-3">
                        <p className="text-xs text-ink-500">You choose how notices are delivered to data subjects and when consent is obtained.</p>
                        {box('notice_route', 'I confirm the selected subject notice route is appropriate.', 'Route: Electronic notice via email and secure portal.')}
                        {box('subject_rights', 'I understand subjects may exercise their rights and I will facilitate this.', 'Rights include access, correction, objection and erasure where applicable.')}
                    </div>
                    <div className="md:col-span-2"><Side rows={[['Notice Method', 'Email + Secure Portal'], ['Consent Mechanism', 'Opt-in by subjects where required'], ['Record of Consent', 'Captured and auditable'], ['Withdrawal Impact', 'Stops further processing']]} /></div>
                </div>
            </Card>
        </QuoteShell>
    );
}
