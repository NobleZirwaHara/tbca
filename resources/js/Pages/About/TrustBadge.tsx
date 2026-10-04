import { Head } from '@inertiajs/react';
import { CircleCheck, Download } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import LedgerChip from '@/Components/ui/LedgerChip';
import AboutHero, { InfoCard, NoticeBand } from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import Seal from '@/Components/About/Seal';
import { ClaimInfoButton } from '@/Components/About/ClaimEvidence';
import type { PublicClaim } from '@/types/about';

interface Content {
    means: string[];
    pillars: { title: string; icon: string; body: string; link: { label: string; href: string } }[];
}

const stateText = { V: 'VERIFIED', A: 'TBCA ATTESTED', R: 'REFERENCED', G: 'EVIDENCE-CONTROLLED' } as const;

export default function TrustBadge({ content, claims }: { content: Content; claims: PublicClaim[] }) {
    return (
        <>
            <Head title="Trust Badge" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Trust Badge' }]}
                title="Trust Badge"
                lead="Our Promise. Our Standards. Your Confidence."
                intro="The TBCA Trust Badge is more than a symbol — it is our commitment to earning and maintaining your trust every day through verified standards, ethical innovation and human-led impact."
                aside={
                    <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr]">
                        <Seal className="mx-auto w-44" />
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="font-semibold text-ink-900">What the Trust Badge Means</h2>
                            <ul className="mt-2 space-y-1.5">
                                {content.means.map((m) => (
                                    <li key={m} className="flex items-start gap-2 text-[0.8125rem] text-ink-700">
                                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" /> {m}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                }
            />
            <section className="bg-parchment-100 py-10">
                <div className="container-tbca space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {content.pillars.map((p) => (
                            <InfoCard key={p.title} icon={p.icon} title={p.title} body={p.body} link={p.link} className="text-center" />
                        ))}
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
                        <div className="rounded-[8px] border border-gold-300 bg-white p-5">
                            <h2 className="flex items-center gap-2 font-semibold text-ink-900">
                                <AboutIcon name="award" className="size-5 text-gold-600" /> Our Certifications & Compliance
                            </h2>
                            <p className="mt-1 text-xs text-ink-500">Each item is a governed claim. Evidence class comes from the Claim Register; expired items withdraw automatically.</p>
                            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                {claims.map((c) => (
                                    <li key={c.key} className="flex items-start gap-3">
                                        <AboutIcon name={c.icon} className="mt-0.5 size-7 shrink-0 text-ink-800" />
                                        <div className="min-w-0">
                                            <p className="flex items-center gap-1 text-[0.8125rem] font-semibold text-ink-900">
                                                {c.label} <ClaimInfoButton claim={c} />
                                            </p>
                                            <p className="text-[0.6875rem] text-ink-600">{c.state === 'under_review' ? 'Under review' : c.value}</p>
                                            <p className="text-[0.625rem] font-semibold tracking-wide text-ink-500">{stateText[c.ledger]}</p>
                                            {c.state === 'review_due' && <LedgerChip code={c.ledger} full={false} className="mt-1" />}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <ButtonLink href="/about/certifications" variant="outline" size="sm" className="mt-5" trailingIcon="arrow-right">
                                View Certifications & Verifications
                            </ButtonLink>
                        </div>
                        <div className="rounded-[8px] border border-gold-300 bg-gold-50/50 p-5">
                            <h2 className="font-serif text-lg font-semibold text-gold-800">Display the Trust Badge</h2>
                            <p className="mt-2 text-[0.8125rem] text-ink-600">
                                The badge may be displayed by TBCA-authorised surfaces only. Partners request usage rights through the partner team; unauthorised use is a brand misrepresentation.
                            </p>
                            <ButtonLink href="/about/partner-enquiry" variant="gold" size="sm" className="mt-4 w-full">
                                <Download className="size-4" aria-hidden="true" /> Request Badge Pack
                            </ButtonLink>
                            <p className="mt-2 text-[0.6875rem] text-ink-500">Includes PNG, SVG and brand guidelines once approved.</p>
                        </div>
                    </div>

                    <NoticeBand
                        icon="shield-check"
                        title="We earn your trust through action, not promises."
                        action={
                            <div className="flex flex-wrap gap-2">
                                <ButtonLink href="/about/contact" variant="outline" trailingIcon="arrow-right">Contact Client Care</ButtonLink>
                                <ButtonLink href="/whistleblowing" variant="gold" trailingIcon="arrow-right">Whistleblowing Channel</ButtonLink>
                            </div>
                        }
                    >
                        If we fall short, we want to know. Reach out to our Client Care or use our Whistleblowing channel.
                    </NoticeBand>
                </div>
            </section>
        </>
    );
}
