import { Head } from '@inertiajs/react';
import { Headphones, Mail, MessageCircle, Phone, TriangleAlert } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import AboutHero from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import Seal from '@/Components/About/Seal';
import { LimitationCompactNotice } from '@/Components/About/Notices';

export default function LimitationNotice({ columns }: { columns: { title: string; icon: string; lines: string[] }[] }) {
    return (
        <>
            <Head title="Professional Limitation Notice" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Professional Limitation Notice' }]}
                title="Professional Limitation Notice"
                lead="Clarity about what we do — and what we do not do."
                intro="Our services are designed to inform better decisions, not to replace professional judgment. Please read this notice carefully."
                aside={<Seal top="INTEGRITY · TRANSPARENCY" bottom="OUR COMMITMENT" variant="shield" className="mx-auto w-44 lg:mr-0 lg:ml-auto" />}
            />
            <section className="bg-parchment-100 py-10">
                <div className="container-tbca space-y-5">
                    <div className="grid divide-parchment-300 rounded-[8px] border border-parchment-400 bg-white md:grid-cols-2 xl:grid-cols-4 xl:divide-x">
                        {columns.map((c) => (
                            <article key={c.title} className="flex items-start gap-3 p-5">
                                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-gold-300 bg-gold-50 text-gold-700">
                                    <AboutIcon name={c.icon} className="size-5" />
                                </span>
                                <div>
                                    <h2 className="font-semibold text-ink-900">{c.title}</h2>
                                    {c.lines.map((l) => (
                                        <p key={l} className="mt-1 text-[0.8125rem] text-ink-600">{l}</p>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 rounded-[8px] border border-gold-300 bg-gold-50/50 p-5 md:flex-row md:items-center">
                        <TriangleAlert className="size-9 shrink-0 text-gold-700" aria-hidden="true" />
                        <p className="flex-1 text-sm text-ink-700">
                            <span className="font-semibold text-ink-900">Important:</span> Outcomes depend on many factors outside our control, including market conditions, regulatory decisions, third-party performance and execution by you. Past performance or references do not guarantee future results.
                        </p>
                        <ButtonLink href="/terms" variant="outline" trailingIcon="arrow-right">View Full Terms & Disclaimers</ButtonLink>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-semibold tracking-wide text-ink-500 uppercase">Compact variant (used on service pages)</p>
                        <LimitationCompactNotice />
                    </div>

                    <div className="flex flex-col gap-4 rounded-[8px] border border-verified-500/30 bg-verified-50/60 p-5 lg:flex-row lg:items-center">
                        <Headphones className="size-9 shrink-0 text-verified-700" aria-hidden="true" />
                        <div className="flex-1">
                            <p className="font-semibold text-ink-900">Questions about this notice?</p>
                            <p className="text-sm text-ink-600">Our Client Care team is here to help.</p>
                        </div>
                        <a href="tel:+27608011365" className="flex items-center gap-2 text-sm text-ink-800"><Phone className="size-4" aria-hidden="true" /> +27 60 801 1365</a>
                        <a href="mailto:Consult@thebusinessclinic.africa" className="flex items-center gap-2 text-sm text-ink-800"><Mail className="size-4" aria-hidden="true" /> Consult@thebusinessclinic.africa</a>
                        <a href="https://wa.me/27608011365" className="flex items-center gap-2 text-sm text-ink-800"><MessageCircle className="size-4" aria-hidden="true" /> WhatsApp / Talk to us</a>
                        <ButtonLink href="/about/contact" variant="outline" trailingIcon="arrow-right">Contact Client Care</ButtonLink>
                    </div>
                </div>
            </section>
        </>
    );
}
