import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight, ChevronUp, Download } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import AboutHero, { AsideCard } from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import { fmtDate } from '@/Components/About/ClaimEvidence';
import { cn } from '@/lib/cn';

interface Content {
    updated: string;
    cards: { title: string; icon: string; tone: string; body: string; detail: string[]; link?: string }[];
    glance: { icon: string; text: string }[];
    history: { date: string; change: string }[];
}

const toneClasses: Record<string, string> = {
    blue: 'bg-controlled-50 text-controlled-700',
    green: 'bg-verified-50 text-verified-700',
    purple: 'bg-referenced-50 text-referenced-700',
    orange: 'bg-attested-50 text-attested-700',
    red: 'bg-risk-50 text-risk-700',
};

export default function Privacy({ content }: { content: Content }) {
    const [open, setOpen] = useState<string | null>(null);
    const [history, setHistory] = useState(false);

    return (
        <>
            <Head title="Privacy" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Privacy' }]}
                title="Privacy"
                lead="Your data. Your trust. Our responsibility."
                intro="We are committed to protecting your personal information and respecting your privacy. This page explains what data we collect, why we collect it, how we use it, and the rights you have over your data."
                aside={
                    <AsideCard
                        icon="lock"
                        title="Our Privacy Commitment"
                        body="We handle your information with care, transparency and in full compliance with POPIA and global privacy standards."
                        link={{ label: 'Read Our Commitment', href: '/about/certifications#popia' }}
                    />
                }
            />
            <section className="bg-parchment-100 py-10">
                <div className="container-tbca grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <div className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {content.cards.map((c) => {
                                const isOpen = open === c.title;
                                return (
                                    <article key={c.title} className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-5">
                                        <div className="flex items-start gap-3">
                                            <span className={cn('inline-flex size-11 shrink-0 items-center justify-center rounded-full', toneClasses[c.tone])}>
                                                <AboutIcon name={c.icon} className="size-5" />
                                            </span>
                                            <h2 className="pt-2 font-semibold text-ink-900">{c.title}</h2>
                                        </div>
                                        <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-600">{c.body}</p>
                                        {isOpen && (
                                            <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.8125rem] text-ink-700">
                                                {c.detail.map((d) => <li key={d}>{d}</li>)}
                                            </ul>
                                        )}
                                        <button
                                            type="button"
                                            aria-expanded={isOpen}
                                            onClick={() => setOpen(isOpen ? null : c.title)}
                                            className="mt-auto inline-flex items-center gap-1 pt-4 text-left text-[0.8125rem] font-semibold text-controlled-700 hover:underline"
                                        >
                                            {isOpen ? 'Hide Details' : (c.link ?? 'View Details')}
                                            {isOpen ? <ChevronUp className="size-3.5" aria-hidden="true" /> : <ArrowRight className="size-3.5" aria-hidden="true" />}
                                        </button>
                                    </article>
                                );
                            })}
                        </div>
                        <div className="flex flex-col gap-3 rounded-[8px] border border-controlled-500/25 bg-controlled-50/60 p-5 md:flex-row md:items-center">
                            <AboutIcon name="info" className="size-9 shrink-0 text-controlled-700" />
                            <div className="flex-1 text-sm text-ink-700">
                                <p className="font-semibold text-ink-900">Changes to This Policy</p>
                                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes and update the “Last updated” date below.
                            </div>
                            <Button type="button" variant="outline" onClick={() => setHistory(true)}>View Change History</Button>
                        </div>
                        <p className="text-xs text-ink-500">Last updated: {fmtDate(content.updated)}</p>
                    </div>

                    <aside className="h-fit rounded-[8px] border border-parchment-400 bg-white p-5">
                        <h2 className="font-semibold text-ink-900">Privacy at a Glance</h2>
                        <ul className="mt-4 divide-y divide-parchment-300">
                            {content.glance.map((g) => (
                                <li key={g.text} className="flex items-start gap-3 py-3 text-[0.8125rem] text-ink-700">
                                    <AboutIcon name={g.icon} className="size-5 shrink-0 text-ink-700" /> {g.text}
                                </li>
                            ))}
                        </ul>
                        <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => window.print()}>
                            <Download className="size-4" aria-hidden="true" /> Download Full Privacy Policy
                        </Button>
                        <p className="mt-3 text-xs text-ink-500">
                            Candidates: see our <a href="/candidate-privacy" className="text-gold-700 underline">Candidate Privacy notice</a>. To withdraw a testimonial consent, contact <a href="mailto:privacy@thebusinessclinic.africa" className="text-gold-700 underline">privacy@thebusinessclinic.africa</a>.
                        </p>
                    </aside>
                </div>
            </section>

            <Modal open={history} onClose={() => setHistory(false)} title="Privacy Policy change history">
                <ol className="space-y-3">
                    {content.history.map((h) => (
                        <li key={h.date} className="text-sm">
                            <p className="font-semibold text-ink-900">{fmtDate(h.date)}</p>
                            <p className="text-ink-600">{h.change}</p>
                        </li>
                    ))}
                </ol>
            </Modal>
        </>
    );
}
