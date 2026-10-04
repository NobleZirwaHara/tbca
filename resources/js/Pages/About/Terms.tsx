import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowRight, ChevronRight, ChevronUp, FileText, HelpCircle, ShieldCheck } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Button, ButtonLink } from '@/Components/ui/Button';
import AboutHero from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import { fmtDate } from '@/Components/About/ClaimEvidence';
import { cn } from '@/lib/cn';

interface Content {
    version: string;
    updated: string;
    cards: { title: string; icon: string; tone: string; body: string; detail: string }[];
    documents: { name: string; href: string }[];
    history: { date: string; change: string }[];
}

const tones: Record<string, string> = {
    blue: 'bg-controlled-50 text-controlled-700',
    green: 'bg-verified-50 text-verified-700',
    purple: 'bg-referenced-50 text-referenced-700',
    orange: 'bg-attested-50 text-attested-700',
    red: 'bg-risk-50 text-risk-700',
};
const anchors = ['acceptance', 'services', 'responsibilities', 'ip', 'payments', 'refunds', 'liability', 'law'];

export default function Terms({ content }: { content: Content }) {
    const [open, setOpen] = useState<number | null>(null);
    const [history, setHistory] = useState(false);

    return (
        <>
            <Head title="Terms" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Terms' }]}
                title="Terms"
                lead="Clear terms. Fair treatment. Mutual respect."
                intro={
                    <>
                        Welcome to our Terms Centre. These terms govern your use of our website, services, content, apps and platforms. By using TBCA, you agree to these terms. Please read them carefully.
                        <span className="mt-2 block text-xs text-ink-500">Version {content.version} · Last updated {fmtDate(content.updated)}</span>
                    </>
                }
                aside={
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                        <h2 className="flex items-center gap-2 font-semibold text-ink-900"><FileText className="size-5" aria-hidden="true" /> Key Documents</h2>
                        <p className="text-xs text-ink-500">Access our full terms and related policies.</p>
                        <ul className="mt-3 divide-y divide-parchment-300">
                            {content.documents.map((d) => (
                                <li key={d.name}>
                                    <Link href={d.href} className="flex items-center justify-between gap-2 py-2 text-[0.8125rem] text-ink-800 hover:text-gold-700">
                                        {d.name} <ChevronRight className="size-4" aria-hidden="true" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                }
            />
            <section className="bg-parchment-100 py-10">
                <div className="container-tbca grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <div className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {content.cards.map((c, i) => (
                                <article key={c.title} id={anchors[i]} className="flex scroll-mt-24 flex-col rounded-[8px] border border-parchment-400 bg-white p-5">
                                    <div className="flex items-start gap-3">
                                        <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-full', tones[c.tone])}>
                                            <AboutIcon name={c.icon} className="size-5" />
                                        </span>
                                        <h2 className="pt-1.5 text-[0.9375rem] font-semibold text-ink-900">{c.title}</h2>
                                    </div>
                                    <p className="mt-3 text-[0.8125rem] text-ink-600">{c.body}</p>
                                    {open === i && <p className="mt-2 rounded bg-parchment-100 p-2 text-[0.8125rem] text-ink-700">{c.detail}</p>}
                                    <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="mt-auto inline-flex items-center gap-1 pt-4 text-left text-[0.8125rem] font-semibold text-controlled-700 hover:underline">
                                        {open === i ? 'Hide Section' : 'View Section'}
                                        {open === i ? <ChevronUp className="size-3.5" aria-hidden="true" /> : <ArrowRight className="size-3.5" aria-hidden="true" />}
                                    </button>
                                </article>
                            ))}
                        </div>
                        <div className="flex flex-col gap-3 rounded-[8px] border border-controlled-500/25 bg-controlled-50/60 p-4 sm:flex-row sm:items-center">
                            <AboutIcon name="info" className="size-7 shrink-0 text-controlled-700" />
                            <p className="flex-1 text-sm text-ink-700">These Terms may be updated from time to time. Material changes will be communicated.</p>
                            <Button type="button" variant="outline" size="sm" onClick={() => setHistory(true)}>View Change History</Button>
                        </div>
                    </div>
                    <aside className="space-y-4">
                        <div className="rounded-[8px] border border-attested-500/25 bg-attested-50/50 p-5">
                            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><HelpCircle className="size-6 text-attested-700" aria-hidden="true" /> Questions About Our Terms?</h2>
                            <p className="mt-1 text-[0.8125rem] text-ink-600">If anything is unclear, our team is here to help.</p>
                            <ButtonLink href="/about/contact" variant="outline" size="sm" className="mt-3" trailingIcon="arrow-right">Contact Our Legal Team</ButtonLink>
                        </div>
                        <div className="rounded-[8px] border border-verified-500/25 bg-verified-50/50 p-5">
                            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><ShieldCheck className="size-6 text-verified-700" aria-hidden="true" /> Our Commitment</h2>
                            <p className="mt-1 text-[0.8125rem] text-ink-600">We are committed to fairness, transparency and protecting your rights.</p>
                            <Link href="/about/our-story" className="mt-2 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-verified-700">Read Our Values <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
                        </div>
                    </aside>
                </div>
            </section>
            <Modal open={history} onClose={() => setHistory(false)} title="Terms change history">
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
