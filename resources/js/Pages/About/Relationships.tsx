import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import LedgerChip from '@/Components/ui/LedgerChip';
import { ButtonLink } from '@/Components/ui/Button';
import AboutHero, { AsideCard, NoticeBand } from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import InstitutionMark from '@/Components/About/InstitutionMark';
import type { PublicInstitution } from '@/types/about';

const principles = [
    { icon: 'handshake', title: 'Permission-Based', body: 'We work only with institutions that grant formal permission.' },
    { icon: 'clipboard-check', title: 'Defined Purpose', body: 'Each relationship has a clear purpose and scope.' },
    { icon: 'shield-check', title: 'Ongoing Review', body: 'Relationships are reviewed regularly for relevance and compliance.' },
    { icon: 'file-text', title: 'Public Transparency', body: 'We disclose our institutional relationships transparently.' },
];

export default function Relationships({ institutions }: { institutions: PublicInstitution[] }) {
    const [open, setOpen] = useState<PublicInstitution | null>(null);

    return (
        <>
            <Head title="Institutional Relationships" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Institutional Relationships' }]}
                title="Institutional Relationships"
                lead="Trusted Institutions. Approved Relationships. Verified Records."
                intro="We work with reputable institutions across Africa and globally. Each relationship is governed by documented permission, defined purpose and ongoing review. We do not represent any institution."
                aside={
                    <AsideCard
                        icon="shield-check"
                        title="Relationship Governance"
                        body="Every institutional relationship is recorded, reviewed and approved. Access our governance framework."
                        link={{ label: 'View Governance', href: '/about/governance' }}
                    />
                }
            />

            <section className="bg-parchment-100 py-10">
                <div className="container-tbca grid gap-6 lg:grid-cols-[1fr_18rem]">
                    <div>
                        {institutions.length === 0 ? (
                            <p className="rounded-[8px] border border-parchment-400 bg-white p-6 text-sm text-ink-500">No institutional relationships are currently cleared for display.</p>
                        ) : (
                            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {institutions.map((inst) => (
                                    <li key={inst.slug} className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-5">
                                        <div className="flex items-center gap-3">
                                            <InstitutionMark inst={inst} />
                                            <h2 className="text-[0.875rem] leading-snug font-semibold text-ink-900">{inst.name}</h2>
                                        </div>
                                        <LedgerChip code={inst.ledger} full={false} className="mt-3 w-fit" />
                                        <p className="mt-3 text-[0.8125rem] text-ink-600">{inst.description}</p>
                                        <button
                                            type="button"
                                            onClick={() => setOpen(inst)}
                                            className="mt-auto inline-flex items-center gap-1.5 pt-4 text-left text-[0.8125rem] font-semibold text-gold-700 hover:underline"
                                        >
                                            About This Relationship <ArrowRight className="size-3.5" aria-hidden="true" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <NoticeBand className="mt-6">
                            These institutions are not our partners, clients, investors or endorsers by default. Each relationship is recorded and disclosed as{' '}
                            <span className="font-semibold text-referenced-700">REFERENCED</span> unless specific authority is granted to present it differently.
                        </NoticeBand>
                    </div>

                    <aside className="h-fit rounded-[8px] border border-parchment-400 bg-white p-5">
                        <h2 className="font-semibold text-ink-900">How We Work With Institutions</h2>
                        <ul className="mt-4 space-y-4">
                            {principles.map((p) => (
                                <li key={p.title} className="flex items-start gap-3">
                                    <AboutIcon name={p.icon} className="mt-0.5 size-6 shrink-0 text-gold-600" />
                                    <div>
                                        <p className="text-[0.8125rem] font-semibold text-ink-900">{p.title}</p>
                                        <p className="text-[0.75rem] text-ink-600">{p.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <ButtonLink href="/about/governance" variant="outline" size="sm" className="mt-5 w-full" trailingIcon="arrow-right">
                            View Governance Framework
                        </ButtonLink>
                    </aside>
                </div>
            </section>

            {open && (
                <Modal open onClose={() => setOpen(null)} title={open.name}>
                    <div className="flex items-center gap-3">
                        <InstitutionMark inst={open} size="lg" />
                        <LedgerChip code={open.ledger} />
                    </div>
                    <p className="mt-4 text-sm font-medium text-ink-800">{open.description}</p>
                    {open.detail && <p className="mt-2 text-sm text-ink-600">{open.detail}</p>}
                    <p className="mt-4 text-xs text-ink-400">
                        Display of this institution is permission-governed. If the permission is revoked or expires, this card is withdrawn automatically.
                    </p>
                </Modal>
            )}
        </>
    );
}
