import { Head, useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Field, Input } from '@/Components/ui/Form';
import { Card, DdHero, Ticks, shortDate } from '@/Components/DueDiligence/Ui';

interface Props {
    token: string;
    request: { recipient: string; role: string; status: string; consent: string | null; expiresAt: string | null };
    purpose: { requester: string | null; subject: string; purpose: string | null; jurisdiction: string; reference: string };
}

/** Secure consent link for the data subject or authorised signatory (no login, no case results shown). */
export default function ConsentLink({ token, request, purpose }: Props) {
    const form = useForm({ decision: 'grant', full_name: request.recipient, confirm: false });
    const pending = ['pending', 'delivered'].includes(request.status);
    const submit = (decision: 'grant' | 'decline') => {
        form.transform((d) => ({ ...d, decision }));
        form.post(`/due-diligence/consent/${token}`, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Secure Consent Request" />
            <DdHero title="Secure Consent Request" subtitle={request.consent ?? 'Consent request'} description={`${purpose.requester ?? 'A TBCA client'} has asked for your consent before any due diligence screening is performed.`} />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid max-w-4xl gap-5 md:grid-cols-2">
                    <Card title="What you are consenting to">
                        <dl className="space-y-1.5 text-[0.8125rem]">
                            {[['Requesting party', purpose.requester], ['Subject', purpose.subject], ['Purpose', purpose.purpose], ['Jurisdiction', purpose.jurisdiction], ['Case reference', purpose.reference], ['Your role', request.role], ['Link expires', shortDate(request.expiresAt)]].map(([k, v]) => <div key={k as string} className="grid grid-cols-2 gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v ?? '—'}</dd></div>)}
                        </dl>
                        <Ticks className="mt-4" items={['Processing is limited to the stated purpose.', 'Only approved, contract-bound partners are used.', 'You may withdraw consent at any time; withdrawal stops further processing.', 'You may request access, correction or erasure where applicable.']} />
                    </Card>
                    <Card title="Your decision">
                        {pending ? (
                            <div className="space-y-3">
                                <Field label="Your full name" error={form.errors.full_name} required>{(id) => <Input id={id} value={form.data.full_name} onChange={(e) => form.setData('full_name', e.target.value)} />}</Field>
                                <Checkbox label="I have read the TBCA Privacy Notice (PN-DD-2026-05) and I consent to the processing described for the stated purpose." checked={form.data.confirm} onChange={(e) => form.setData('confirm', e.target.checked)} />
                                {form.errors.confirm && <p className="text-xs text-risk-500">{form.errors.confirm}</p>}
                                <div className="flex flex-wrap gap-3">
                                    <Button type="button" disabled={form.processing || !form.data.confirm} onClick={() => submit('grant')}>Grant consent</Button>
                                    <Button type="button" variant="outline" disabled={form.processing} onClick={() => submit('decline')}>Decline</Button>
                                </div>
                            </div>
                        ) : (
                            <p className="flex gap-2 text-sm text-ink-700"><ShieldCheck className="size-5 text-verified-500" aria-hidden="true" />This request is {request.status}. No further action is needed.</p>
                        )}
                    </Card>
                </div>
            </section>
        </>
    );
}
