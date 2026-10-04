import { Head } from '@inertiajs/react';
import { CheckCircle2, Info } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { ReferenceChip, StatusPill } from '@/Components/ui/Kit';
import { NextSteps, ShopCrumbs, SideCard, TrustStrip, zar } from '@/Components/Shop/Bits';

interface Props {
    kind: 'brief' | 'proposal' | 'free';
    title: string;
    reference: string;
    heading: string | null;
    statement: string;
    next: [string, string][];
    status: string;
    estimate?: number | null;
    validUntil?: string | null;
    cta?: { label: string; href: string };
}

/** Shared confirmation for request objects (brief, retainer proposal, free entitlement). */
export default function Submitted({ kind, title, reference, heading, statement, next, status, estimate, validUntil, cta }: Props) {
    const crumb = { brief: 'Marketplace Brief', proposal: 'Retainer Proposal', free: 'Free Access' }[kind];
    return (
        <>
            <Head title={title} />
            <div className="container-tbca py-8">
                <ShopCrumbs tone="light" items={[{ label: 'Online Shop', href: '/shop' }, { label: crumb }, { label: title }]} />
                <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[1fr_18rem]">
                    <div className="rounded-[10px] border border-verified-500/40 bg-white p-6">
                        <CheckCircle2 className="size-12 text-verified-500" aria-hidden="true" />
                        <h1 className="mt-3 font-serif text-[1.875rem] font-semibold text-ink-900">{title}</h1>
                        {heading && <p className="mt-1 font-semibold text-ink-800">{heading}</p>}
                        <div className="mt-3 flex flex-wrap items-center gap-2"><ReferenceChip value={reference} /><StatusPill status={status} /></div>
                        {estimate ? <p className="mt-3 text-sm">Indicative monthly fee: <strong className="text-verified-700">{zar(estimate)}</strong> (excl. VAT, subject to capacity review)</p> : null}
                        {validUntil && <p className="mt-3 text-sm">Access valid until <strong>{new Date(validUntil).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>}
                        <p className="mt-4 flex gap-2 rounded-[6px] bg-controlled-50 p-3 text-xs text-controlled-700"><Info className="size-4 shrink-0" aria-hidden="true" />{statement}</p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {cta && <ButtonLink href={cta.href}>{cta.label}</ButtonLink>}
                            <ButtonLink href="/portal" variant={cta ? 'outline' : 'gold'}>Go to Client Portal</ButtonLink>
                            <ButtonLink href="/shop" variant="outline">Back to Online Shop</ButtonLink>
                        </div>
                    </div>
                    <SideCard title="What happens next?"><NextSteps steps={next} /></SideCard>
                </div>
            </div>
            <TrustStrip />
        </>
    );
}
