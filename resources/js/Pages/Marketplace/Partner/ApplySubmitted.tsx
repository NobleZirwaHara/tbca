import { Head } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { ReferenceChip, Stepper } from '@/Components/ui/Kit';
import { Card } from '@/Components/Marketplace/ui';
import { PsBody } from '@/Components/Marketplace/PartnerKit';

export default function ApplySubmitted({ reference, name, steps }: { reference: string | null; name: string | null; steps: string[] }) {
    return (
        <>
            <Head title="Partner Application Submitted" />
            <PsBody className="py-12">
                <div className="mx-auto max-w-3xl space-y-6 text-center">
                    <CheckCircle2 className="mx-auto size-14 text-verified-500" aria-hidden="true" />
                    <h1 className="font-serif text-3xl font-bold text-ink-900">Application Submitted for Approval</h1>
                    <p className="text-ink-600">{name ?? 'Your firm'} is now pending verification. Routing stays off until TBCA confirms current registration, indemnity and standing.</p>
                    {reference && <ReferenceChip value={reference} />}
                    <Card className="text-left"><div className="overflow-x-auto"><div className="min-w-[560px]"><Stepper steps={steps} current={7} /></div></div>
                        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink-700"><li>Entity and practitioner verification against official registers.</li><li>Professional body, indemnity and tax compliance checks.</li><li>Sanctions and adverse media screening.</li><li>On approval your firm appears in the Live Partner Register and can receive conflict-check requests.</li></ul>
                    </Card>
                    <div className="flex flex-wrap justify-center gap-3"><ButtonLink href="/partner-services/workspace">Go to Partner Workspace</ButtonLink><ButtonLink href="/partner-services/network" variant="outline">Partner Network</ButtonLink></div>
                </div>
            </PsBody>
        </>
    );
}
