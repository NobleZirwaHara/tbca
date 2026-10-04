import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ChevronRight, Cookie, ShieldCheck, TriangleAlert } from 'lucide-react';
import AboutHero from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import { fmtDate } from '@/Components/About/ClaimEvidence';

interface Content {
    updated: string;
    cards: { key: string; title: string; icon: string; body: string; items: string[] }[];
    ai: string;
}

export default function CandidatePrivacy({ content }: { content: Content }) {
    return (
        <>
            <Head title="Candidate Privacy" />
            <AboutHero
                accent="purple"
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Careers', href: '/careers' }, { label: 'Candidate Privacy' }]}
                title="Candidate Privacy"
                lead="Your privacy. Our responsibility."
                intro={
                    <>
                        At TBCA, we respect your privacy and are committed to protecting your personal information. This notice explains what data we collect, how we use it, and your rights as a candidate.
                        <span className="mt-2 block text-xs text-ink-500">Last updated: {fmtDate(content.updated)}</span>
                    </>
                }
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-6 lg:grid-cols-[1fr_19rem]">
                    <div className="space-y-5">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {content.cards.map((c) => (
                                <article key={c.key} id={c.key} className="scroll-mt-24 rounded-[8px] border border-parchment-400 bg-white p-5">
                                    <h2 className="flex items-start gap-2 font-semibold text-violet-800"><AboutIcon name={c.icon} className="size-6 shrink-0" /> {c.title}</h2>
                                    <p className="mt-3 text-[0.8125rem] font-medium text-ink-800">{c.body}</p>
                                    <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.8125rem] text-ink-700">{c.items.map((i) => <li key={i}>{i}</li>)}</ul>
                                    {c.key === 'rights' && <Link href="/privacy" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-700">Learn more about your rights <ArrowRight className="size-3" aria-hidden="true" /></Link>}
                                </article>
                            ))}
                        </div>
                        <div className="flex gap-3 rounded-[8px] border border-violet-200 bg-violet-50/60 p-5">
                            <AboutIcon name="cpu" className="size-8 shrink-0 text-violet-700" />
                            <p className="text-[0.8125rem] text-ink-700"><span className="block font-semibold text-violet-800">AI in recruitment</span>{content.ai}</p>
                        </div>
                        <div className="flex gap-3 rounded-[8px] border border-violet-200 bg-violet-50/60 p-5">
                            <ShieldCheck className="size-8 shrink-0 text-violet-700" aria-hidden="true" />
                            <p className="text-[0.8125rem] text-ink-700"><span className="block font-semibold text-violet-800">We will never share your personal information</span>with third parties for marketing purposes. Your data will only be shared with trusted service providers who support our recruitment process and are bound by confidentiality obligations.</p>
                        </div>
                    </div>
                    <aside className="space-y-4">
                        <nav aria-label="On this page" className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">On This Page</h2>
                            <ul className="mt-3 divide-y divide-parchment-300 text-[0.8125rem]">
                                {[...content.cards.map((c) => [c.title.replace(/^\d\.\s*/, ''), `#${c.key}`]), ['Cookies & Tracking', '#cookies'], ['Contact Us', '#contact']].map(([l, h]) => (
                                    <li key={h}><a href={h} className="flex items-center justify-between py-2 text-ink-800 hover:text-violet-700">{l}<ChevronRight className="size-4" aria-hidden="true" /></a></li>
                                ))}
                            </ul>
                        </nav>
                        <div id="cookies" className="scroll-mt-24 rounded-[8px] border border-violet-200 bg-violet-50/60 p-5">
                            <h2 className="flex items-center gap-2 font-semibold text-violet-800"><Cookie className="size-5" aria-hidden="true" /> Cookies & Tracking</h2>
                            <p className="mt-1 text-[0.8125rem] text-ink-600">Our careers site may use essential cookies to improve your experience. You can manage your cookie preferences in your browser settings.</p>
                            <Link href="/privacy" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-700">View Cookie Policy <ArrowRight className="size-3" aria-hidden="true" /></Link>
                        </div>
                        <div id="contact" className="scroll-mt-24 rounded-[8px] border border-attested-500/25 bg-attested-50/50 p-5">
                            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><TriangleAlert className="size-5 text-attested-700" aria-hidden="true" /> Questions About Your Privacy?</h2>
                            <p className="mt-1 text-[0.8125rem] text-ink-600">If you have any questions about how we handle your personal information, our Talent Team is here to help.</p>
                            <a href="mailto:careers@thebusinessclinic.africa" className="mt-3 inline-flex rounded-[4px] border border-attested-500 px-3 py-1.5 text-[0.8125rem] font-semibold text-attested-700">Contact Our Talent Team</a>
                        </div>
                        <div className="rounded-[8px] border border-verified-500/25 bg-verified-50/50 p-5">
                            <h2 className="font-semibold text-verified-700">Your Privacy Matters</h2>
                            <p className="mt-1 text-[0.8125rem] text-ink-600">We are committed to transparency, fairness and protecting your personal information.</p>
                            <Link href="/privacy" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-verified-700">Read Our Privacy Policy <ArrowRight className="size-3" aria-hidden="true" /></Link>
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
}
