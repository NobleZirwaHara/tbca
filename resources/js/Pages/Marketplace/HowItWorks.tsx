import { Head } from '@inertiajs/react';
import { ArrowLeftRight, ArrowRight, CheckCircle2, Rocket, ShieldCheck, User, Users } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import MkIcon from '@/Components/Marketplace/MkIcon';
import { MkHeader } from '@/Components/Marketplace/ui';
import AfricaMark from '@/Components/AfricaMark';

interface Props {
    content: {
        steps: { icon: string; title: string; body: string }[];
        parties: { title: string; items: string[] }[];
        why: string[];
        tiles: { icon: string; title: string; body: string }[];
    };
}

export default function HowItWorks({ content }: Props) {
    const partyIcons = [<User key="u" className="size-7 text-controlled-500" />, <AfricaMark key="a" className="size-9 text-gold-500" />, <Users key="p" className="size-7 text-verified-500" />];

    return (
        <>
            <Head title="How TBCA Marketplace Works" />
            <MkHeader
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Marketplace', href: '/marketplace' }, { label: 'How Marketplace Works' }]}
                title="How TBCA Marketplace Works"
                lead="A transparent, controlled process that connects you with verified specialists and firms to deliver high-quality results — with TBCA managing the process end-to-end."
                aside={
                    <div className="flex max-w-md gap-3 rounded-[8px] border border-gold-400/60 bg-gold-50 p-4">
                        <ShieldCheck className="size-6 shrink-0 text-gold-600" aria-hidden="true" />
                        <div>
                            <p className="font-semibold text-ink-900">Quality. Integrity. Accountability.</p>
                            <p className="text-sm text-ink-600">TBCA remains your accountable partner from brief to delivery — even when work is executed by verified external specialists.</p>
                        </div>
                    </div>
                }
            />

            <section className="bg-parchment-100 py-10">
                <div className="container-tbca grid gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-9">
                        <h2 className="font-serif text-xl font-bold text-ink-900">The Marketplace Process – From Brief to Delivery</h2>
                        <ol className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
                            {content.steps.map((s, i) => (
                                <li key={s.title} className="relative rounded-[8px] border border-parchment-400 bg-white p-3 pt-6 text-center">
                                    <span className="absolute -top-3 left-1/2 flex size-7 -translate-x-1/2 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-900">{i + 1}</span>
                                    <MkIcon name={s.icon} className="mx-auto size-7 text-gold-600" />
                                    <p className="mt-2 text-sm font-semibold text-ink-900">{s.title}</p>
                                    <p className="mt-1 text-xs text-ink-500">{s.body}</p>
                                </li>
                            ))}
                        </ol>

                        <h2 className="mt-10 font-serif text-xl font-bold text-ink-900">The Three-Party Model</h2>
                        <div className="mt-4 grid items-center gap-4 rounded-[8px] border border-parchment-400 bg-white p-5 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
                            {content.parties.map((p, i) => (
                                <div key={p.title} className="contents">
                                    {i > 0 && <ArrowLeftRight className="mx-auto hidden size-6 text-ink-400 md:block" aria-hidden="true" />}
                                    <div className="flex gap-3">
                                        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-parchment-200">{partyIcons[i]}</span>
                                        <div>
                                            <p className="font-semibold text-ink-900">{p.title}</p>
                                            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-ink-600">
                                                {p.items.map((it) => <li key={it}>{it}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {content.tiles.map((t) => (
                                <div key={t.title} className="flex gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                                    <MkIcon name={t.icon} className="size-7 shrink-0 text-gold-600" />
                                    <div>
                                        <p className="font-semibold text-ink-900">{t.title}</p>
                                        <p className="mt-1 text-xs text-ink-600">{t.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <aside className="lg:col-span-3">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:sticky lg:top-24">
                            <h2 className="font-serif text-lg font-bold text-gold-700">Why Use TBCA Marketplace?</h2>
                            <ul className="mt-3 space-y-2 text-sm text-ink-700">
                                {content.why.map((w) => (
                                    <li key={w} className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-gold-600" aria-hidden="true" />{w}</li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                </div>
            </section>

            <section className="bg-parchment-100 pb-12">
                <div className="container-tbca">
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[8px] border border-gold-400/60 bg-gold-50 p-5">
                        <div className="flex items-center gap-4">
                            <Rocket className="size-9 text-gold-600" aria-hidden="true" />
                            <div>
                                <p className="font-serif text-xl font-bold text-ink-900">Ready to Get Started?</p>
                                <p className="text-sm text-ink-600">Submit your brief now and let us match you with the right specialists.</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <ButtonLink href="/marketplace/brief">Submit Marketplace Brief <ArrowRight className="size-4" aria-hidden="true" /></ButtonLink>
                            <Button variant="outline" type="button" onClick={() => openAskQuestion({ subject: 'How the Marketplace works', section: 'marketplace' })}>Ask a Question</Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
