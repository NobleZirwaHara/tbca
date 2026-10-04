import { Head } from '@inertiajs/react';
import { ButtonLink } from '@/Components/ui/Button';
import AboutHero, { AsideCard, NoticeBand } from '@/Components/About/AboutHero';
import { TrustClaimCard } from '@/Components/About/ClaimEvidence';
import type { PublicClaim } from '@/types/about';

const statusLabel = { V: 'Verified', A: 'TBCA Attested', R: 'Referenced', G: 'Evidence-controlled' } as const;

export default function Certifications({ claims, disclosure }: { claims: PublicClaim[]; disclosure: string }) {
    return (
        <>
            <Head title="Certifications & Verifications" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Certifications & Verifications' }]}
                title="Certifications & Verifications"
                lead="Evidence-Backed Trust. Transparent. Current. Verifiable."
                intro="Our certifications, attestations and registrations reflect our commitment to global standards, African values and accountable delivery."
                aside={
                    <AsideCard
                        icon="shield-check"
                        title="Evidence Classes"
                        body="Every trust item is classified by evidence class. We show how each claim is verified, attested or referenced."
                        link={{ label: 'Learn more about Evidence Classes', href: '/about/trust-badge' }}
                    />
                }
            />

            <section className="bg-parchment-100 py-10">
                <div className="container-tbca">
                    {claims.length === 0 ? (
                        <p className="rounded-[8px] border border-parchment-400 bg-white p-6 text-sm text-ink-500">
                            No certification or verification claims are currently published. Items reappear once their evidence is re-verified.
                        </p>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {claims.map((claim) => {
                                const ev = claim.evidence[0];
                                return (
                                    <TrustClaimCard
                                        key={claim.key}
                                        claim={claim}
                                        rows={[
                                            ...(ev ? [{ label: 'Evidence', value: ev.title }, { label: 'Issuer', value: ev.issuer }] : []),
                                            ...(ev?.reference_no ? [{ label: 'Reference', value: ev.reference_no }] : []),
                                            { label: 'Status', value: statusLabel[claim.ledger] },
                                        ]}
                                    />
                                );
                            })}
                        </div>
                    )}

                    <NoticeBand
                        className="mt-8"
                        title="Important Disclosure"
                        action={
                            <ButtonLink href="/about/governance" variant="gold" trailingIcon="arrow-right">
                                More on Our Governance
                            </ButtonLink>
                        }
                    >
                        {disclosure} Expired evidence withdraws a claim automatically — it is never shown as current.
                    </NoticeBand>
                </div>
            </section>
        </>
    );
}
