import { Head } from '@inertiajs/react';
import { ButtonLink } from '@/Components/ui/Button';
import AboutHero, { NoticeBand } from '@/Components/About/AboutHero';
import InstitutionMark from '@/Components/About/InstitutionMark';
import type { PublicInstitution } from '@/types/about';

export default function TrustedInstitutions({ institutions }: { institutions: PublicInstitution[] }) {
    return (
        <>
            <Head title="Trusted by Leading Institutions" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Trusted Institutions' }]}
                title="Trusted by Leading Institutions"
                lead="Relationships that strengthen impact across Africa."
                intro="We collaborate with world-class development finance institutions, governments and mission-aligned organisations to deliver lasting results."
            />
            <section className="bg-parchment-100 py-10">
                <div className="container-tbca space-y-6">
                    <div className="rounded-[10px] border border-parchment-400 bg-white p-6">
                        <p className="text-center font-serif text-lg text-ink-900">We are proud to work with</p>
                        {institutions.length === 0 ? (
                            <p className="mt-4 text-center text-sm text-ink-500">No institutional marks are currently cleared for display.</p>
                        ) : (
                            <ul className="mt-6 grid grid-cols-2 divide-parchment-300 sm:grid-cols-4 lg:grid-cols-8 lg:divide-x">
                                {institutions.map((inst) => (
                                    <li key={inst.slug} className="flex flex-col items-center gap-3 px-3 py-4 text-center">
                                        <span className="flex h-14 items-center">
                                            <InstitutionMark inst={inst} size="lg" />
                                        </span>
                                        <span className="text-xs text-ink-600">{inst.name}</span>
                                        <span className="text-[0.6875rem] text-referenced-700">{inst.description}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p className="mt-4 text-center text-[0.6875rem] text-ink-500">
                            Each mark is shown only under a current display permission and a recorded relationship description. Revoked permissions are withdrawn automatically.
                        </p>
                    </div>

                    <NoticeBand
                        icon="handshake"
                        title="Stronger together. Greater impact."
                        action={<ButtonLink href="/about/partner-enquiry" variant="outline" trailingIcon="arrow-right">Partner With TBCA</ButtonLink>}
                    >
                        Our institutional relationships enable better projects, stronger businesses and sustainable development for communities across Africa.
                    </NoticeBand>
                </div>
            </section>
        </>
    );
}
