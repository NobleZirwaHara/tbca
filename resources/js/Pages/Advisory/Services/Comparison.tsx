import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { CheckCircle2, CircleX, Info, MessageSquare } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { Modal } from '@/Components/ui/Kit';
import ComparisonTable from '@/Components/Advisory/Comparison';
import { DarkHero, TrustBand } from '@/Components/Advisory/ui';
import type { ResolverResult } from '@/types/advisory';

interface Opt { key: string; title?: string; label?: string }
interface Props {
    reference: string | null;
    illustrative: boolean;
    answers: Record<string, string>;
    result: ResolverResult;
    needs: Opt[];
    outcomes: Opt[];
    sizes: Opt[];
    timings: Opt[];
}

export default function Comparison({ reference, illustrative, answers, result, needs, outcomes, sizes, timings }: Props) {
    const [detail, setDetail] = useState<string | null>(null);
    const label = (list: Opt[], k?: string) => list.find((x) => x.key === k)?.title ?? list.find((x) => x.key === k)?.label ?? k ?? '—';
    const viable = result.rows.filter((r) => r.viable);
    const excluded = result.rows.filter((r) => !r.viable);
    const rec = result.rows.find((r) => r.key === result.recommended);
    const open = result.rows.find((r) => r.key === detail);

    return (
        <>
            <Head title="Choice Comparison" />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'Vehicle Resolver', href: '/services/resolver/1' }, { label: 'Choice Comparison' }]}
                title="Choice Comparison"
                tagline="Different ways to solve your need. Same goal. Transparent comparison."
                intro="We show every viable option so you can choose what fits your context, timing and budget."
                box={{
                    title: 'Your need',
                    items: [
                        answers.description || label(needs, answers.need),
                        `Outcome you want: ${label(outcomes, answers.outcome)}`,
                        `Context: ${label(sizes, answers.size)}, ${answers.industry ?? '—'}`,
                        `Timing: ${label(timings, answers.timing)}`,
                    ],
                    footer: reference ? <p className="text-xs text-ink-300">Recommendation reference <span className="font-mono text-gold-300">{reference}</span></p> : illustrative ? <p className="text-xs text-ink-300">Illustrative example — <Link href="/services/resolver/1" className="text-gold-400 underline">run the resolver</Link> for your own result.</p> : null,
                }}
            />
            <div className="container-tbca grid gap-6 py-8 lg:grid-cols-12">
                <div className="lg:col-span-9">
                    <h2 className="mb-3 text-center text-sm font-semibold text-ink-900">Available ways to work with TBCA ({result.viable_count} viable)</h2>
                    <ComparisonTable
                        rows={[['use', 'Typical use case'], ['get', 'What you get'], ['who', 'Who delivers'], ['commitment', 'Commitment'], ['price', 'Indicative price (ZAR)'], ['exit', 'Exit / Flexibility'], ['best', 'Best for']]}
                        cols={result.rows.map((r) => ({
                            key: r.key, name: r.name, tag: r.tag, icon: r.icon, href: r.href, fit: r.viable ? r.fit : 'Not suitable', recommended: r.key === result.recommended,
                            excluded: r.excluded, values: { use: r.use, get: r.get, who: r.who, commitment: r.commitment, price: `${r.price} ${r.price_note}`, exit: r.exit, best: r.best },
                        }))}
                    />
                    <p className="mt-3 flex items-start gap-2 text-xs text-ink-500"><Info className="mt-0.5 size-3.5 shrink-0" />Prices are source pricing in ZAR. Display pricing may show ZAR and USD. All prices are indicative and exclude external costs. You will see the full breakdown before you pay.</p>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <section className="rounded-[8px] border border-verified-500/30 bg-white p-4">
                            <h3 className="text-sm font-semibold text-ink-900">Why these options fit</h3>
                            <ul className="mt-2 space-y-2">
                                {viable.map((r) => (
                                    <li key={r.key} className="flex gap-2 text-xs text-ink-700">
                                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-verified-500" />
                                        <span><b>{r.name}</b> ({r.fit}, score {r.score}) — {r.reasons.join(' ')}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                        <section className="rounded-[8px] border border-risk-500/30 bg-white p-4">
                            <h3 className="text-sm font-semibold text-ink-900">Options that are not suitable</h3>
                            {excluded.length === 0 && <p className="mt-2 text-xs text-ink-500">Every way of working is viable for your need.</p>}
                            <ul className="mt-2 space-y-2">
                                {excluded.map((r) => (
                                    <li key={r.key} className="flex gap-2 text-xs text-ink-700">
                                        <CircleX className="mt-0.5 size-4 shrink-0 text-risk-500" />
                                        <span><b>{r.name}</b> — {r.excluded.join(' ')}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    </div>
                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <button type="button" onClick={() => setDetail(result.recommended)} className="h-11 rounded border border-gold-500 px-5 text-sm font-medium">View full price breakdown</button>
                        {rec && <ButtonLink href={rec.href} trailingIcon="arrow-right">Next: See Details</ButtonLink>}
                    </div>
                </div>
                <aside className="space-y-4 lg:col-span-3">
                    <div className="rounded-[8px] bg-ink-950 p-5 text-parchment-100">
                        <h2 className="text-sm font-semibold text-gold-400">What you can do next</h2>
                        <ul className="mt-3 space-y-2 text-sm">
                            <li><button type="button" className="hover:text-gold-300" onClick={() => setDetail(result.recommended)}>View detailed option</button></li>
                            <li><Link href="/services/ways-to-work-with-tbca" className="hover:text-gold-300">Compare options side-by-side</Link></li>
                            <li><Link href="/services/capability/strategy" className="hover:text-gold-300">See what others choose</Link></li>
                            <li><Link href="/services/proposal-request" className="hover:text-gold-300">Talk to a human expert</Link></li>
                        </ul>
                    </div>
                    <div className="rounded-[8px] border border-gold-500 bg-ink-950 p-5 text-parchment-100">
                        <h2 className="text-sm font-semibold text-gold-400">Need help deciding?</h2>
                        <p className="mt-1 text-xs text-ink-300">A human expert can help you choose the best way to work with TBCA.</p>
                        <Link href="/services/proposal-request" className="mt-3 inline-flex items-center gap-1.5 rounded border border-gold-500 px-3 py-1.5 text-xs font-semibold text-gold-300"><MessageSquare className="size-3.5" />Talk to a Human</Link>
                    </div>
                    <div className="rounded-[8px] bg-ink-950 p-5 text-parchment-100">
                        <h2 className="text-sm font-semibold text-gold-400">Why we compare</h2>
                        <p className="mt-1 text-xs text-ink-300">Same capability can be delivered in different ways. We show all viable options with equal visibility. Margin is never a ranking input.</p>
                    </div>
                </aside>
            </div>
            <TrustBand items={[['No margin steering', 'We recommend by fit, not margin.'], ['Professional boundaries', 'We route to the right expertise.'], ['Transparent pricing', 'Always see the full breakdown.'], ['Your choice', 'You decide what fits you best.'], ['Phase 1 – South Africa', 'ZAR Source Pricing'], ['Secure & Private', 'Your data is protected.']]} />
            <Modal open={open !== undefined} onClose={() => setDetail(null)} title={open ? `${open.name} — price breakdown` : ''} footer={open && <ButtonLink href={open.href}>Continue with {open.name}</ButtonLink>}>
                {open && (
                    <div className="space-y-2 text-sm text-ink-700">
                        <p><b>Indicative price:</b> {open.price} {open.price_note}</p>
                        <p><b>What you get:</b> {open.get}</p>
                        <p><b>Commitment:</b> {open.commitment} · <b>Exit:</b> {open.exit}</p>
                        <p className="text-xs text-ink-500">VAT at 15% applies to TBCA fees. Platform fee (R250) and bank charges are shown at checkout. External provider and statutory costs are separate and never blended.</p>
                    </div>
                )}
            </Modal>
        </>
    );
}
