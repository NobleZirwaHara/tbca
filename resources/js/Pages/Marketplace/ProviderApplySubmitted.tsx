import { Head } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { ReferenceChip, Stepper } from '@/Components/ui/Kit';
import { Card } from '@/Components/Marketplace/ui';

export default function ProviderApplySubmitted({ reference, name }: { reference: string | null; name: string | null }) {
    return (
        <>
            <Head title="Application Submitted" />
            <section className="bg-parchment-100 py-12">
                <div className="container-tbca max-w-3xl space-y-6">
                    <div className="text-center">
                        <CheckCircle2 className="mx-auto size-14 text-verified-500" aria-hidden="true" />
                        <h1 className="mt-3 font-serif text-3xl font-bold text-ink-900">Application Submitted</h1>
                        <p className="mt-2 text-ink-600">{name ? `${name}'s` : 'Your'} application is now with the TBCA Vetting Team.</p>
                        {reference && <div className="mt-3"><ReferenceChip value={reference} /></div>}
                    </div>
                    <Card title="What happens next">
                        <Stepper steps={['Application', 'Verification', 'Agreement', 'Training', 'Active']} current={2} />
                        <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-ink-700">
                            <li>Initial screen, document review, reference check and risk assessment (target decision within 21 days).</li>
                            <li>We may request additional evidence through your provider portal.</li>
                            <li>On approval you will review and sign the Provider Agreement (MP-PA-v2.1).</li>
                            <li>Signature does not guarantee work volume. Opportunities open once your status is Active.</li>
                        </ul>
                    </Card>
                    <div className="flex flex-wrap justify-center gap-3">
                        <ButtonLink href="/marketplace/provider">Go to Provider Portal</ButtonLink>
                        <ButtonLink href="/marketplace" variant="outline">Back to Marketplace</ButtonLink>
                    </div>
                </div>
            </section>
        </>
    );
}
