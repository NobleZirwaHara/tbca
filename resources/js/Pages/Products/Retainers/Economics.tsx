import { Head, useForm } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Headphones, Info, Pause, Scale, ShieldCheck, TrendingDown, Users, X, XCircle, CircleCheck, Clock, BookOpen } from 'lucide-react';
import { PageTitle, Notice } from '@/Components/Products/Shared';
import { Stepper } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import type { RetServiceFull } from '@/Components/Products/Retainers/types';

const CHOICES = [
    { icon: CircleCheck, title: 'Continue', sub: 'Maintain current Retainer.', suits: 'Pipeline is active and you expect near-term usage.', effect: 'Access continues at current terms.' },
    { icon: TrendingDown, title: 'Right-size Down', sub: 'Reduce allowance or capacity.', suits: 'Your need is lower and expected to remain lower.', effect: 'Lower fixed commitment. Terms adjusted.' },
    { icon: Pause, title: 'Pause', sub: 'Temporarily pause the Retainer (where permitted).', suits: 'Short-term pause in activity.', effect: 'Reduced or paused commitment. Reactivation terms apply.' },
    { icon: XCircle, title: 'Cancel', sub: 'Cancel the Retainer.', suits: 'No ongoing need for retained capacity.', effect: 'Retainer ends at period end (agreement terms apply).' },
];

export default function Economics({ service, version, acknowledged }: { service: RetServiceFull; version: string; acknowledged: boolean }) {
    const form = useForm({ version });

    return (
        <>
            <Head title={`Utilisation Economics — ${service.name}`} />
            <PageTitle
                crumbs={[{ label: 'Retainers', href: '/retainers' }, { label: service.name, href: `/retainers/${service.slug}` }, { label: 'Utilisation Economics' }]}
                title="Utilisation Economics Disclosure"
                lead="Understand how utilisation works, why it matters, and the choices available to you."
                aside={<Stepper className="w-72" steps={['Exclusions', 'Economics', 'Proposal']} current={2} />}
            />
            <div className="container-tbca grid gap-5 py-8 lg:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-5">
                    <Notice tone="info" title="This disclosure ensures you have the information you need before requesting a proposal.">
                        We believe in transparent economics. Lower utilisation can improve TBCA economics and reduce the realised value for you. Disclosure version {version}.
                    </Notice>

                    <div className="grid gap-4 md:grid-cols-3">
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-[0.8125rem] text-ink-700">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900"><Users className="size-5 text-gold-600" aria-hidden="true" />1. What You Are Buying</h2>
                            <p className="mt-2">This Retainer gives you recurring access to a defined human adviser or team for a set allowance of capacity ({service.allowance_qty} hours / month).</p>
                            <p className="mt-2 font-semibold text-ink-900">It is not unlimited consulting.</p>
                            <p className="mt-1">Access is subject to scope, exclusions, service level and this utilisation covenant.</p>
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-[0.8125rem] text-ink-700">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900"><Clock className="size-5 text-gold-600" aria-hidden="true" />2. What Happens If You Use Less</h2>
                            <p className="mt-2">Unused allowance at period end is treated according to the Unused Allowance Rule in your Retainer: <span className="font-semibold">{service.unused_label}</span> rolls into the next period only.</p>
                            <p className="mt-2">For many Retainers, unused allowance is <span className="font-semibold">forfeited or partially rolled forward. It is not refunded.</span></p>
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-[0.8125rem] text-ink-700">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900"><Scale className="size-5 text-gold-600" aria-hidden="true" />3. Why TBCA Monitors Use</h2>
                            <p className="mt-2">Lower use can reduce delivery cost for TBCA while fixed capacity remains reserved.</p>
                            <p className="mt-2">This can improve TBCA economics while reducing the realised value for you.</p>
                        </section>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
                        <section>
                            <h2 className="text-sm font-semibold text-ink-900">4. Your Choices If Use Is Lower Than Expected</h2>
                            <p className="text-xs text-ink-500">You are in control. No sales negotiation is required.</p>
                            <div className="mt-3 grid overflow-hidden rounded-[8px] border border-parchment-400 bg-white sm:grid-cols-2 lg:grid-cols-4">
                                {CHOICES.map(({ icon: Icon, title, sub, suits, effect }) => (
                                    <div key={title} className="border-b border-parchment-300 p-3 text-xs sm:border-r">
                                        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><Icon className="size-5 text-gold-600" aria-hidden="true" />{title}</p>
                                        <p className="mt-1 text-ink-500">{sub}</p>
                                        <p className="mt-3 font-semibold text-ink-800">When this suits you</p>
                                        <p className="text-ink-600">{suits}</p>
                                        <p className="mt-3 font-semibold text-ink-800">Commercial effect</p>
                                        <p className="text-ink-600">{effect}</p>
                                    </div>
                                ))}
                            </div>
                            <Notice tone="gold" icon={ShieldCheck} className="mt-3">All choices are equally available. No option is recommended or favoured by TBCA.</Notice>
                        </section>
                        <section>
                            <h2 className="text-sm font-semibold text-ink-900">5. Per-Use Alternative (Where Available)</h2>
                            <p className="text-xs text-ink-500">Compare before you commit.</p>
                            <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-[8px] border border-parchment-400 bg-parchment-400">
                                <div className="bg-white p-3 text-xs text-ink-400">
                                    <p className="text-sm font-semibold text-ink-500">Certified Pay-Per-Use</p>
                                    <p>(Where available)</p>
                                    <p className="mt-2">Use capacity only when needed. Rates are higher per unit. No reserved capacity.</p>
                                </div>
                                <div className="bg-white p-3 text-xs text-ink-600">
                                    <X className="mb-1 size-6 rounded-full border border-ink-300 p-1 text-ink-500" aria-hidden="true" />
                                    <p className="text-sm font-semibold text-ink-900">No Comparable Per-Use Offer</p>
                                    <p className="mt-1">No directly comparable per-use offer is currently certified for this service.</p>
                                </div>
                            </div>
                            <Notice tone="info" className="mt-3">A directly comparable per-use offer is shown only where certified and available.</Notice>
                        </section>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-[8px] border border-parchment-400 bg-white px-4 py-3 text-xs">
                        <span className="flex items-center gap-2 font-semibold text-ink-900"><BookOpen className="size-4 text-gold-600" aria-hidden="true" />Helpful resources</span>
                        <a href={`/retainers/${service.slug}`} className="text-gold-700 hover:underline">How utilisation works →</a>
                        <a href="#unused" className="text-gold-700 hover:underline">Unused allowance rules: {service.unused_label}, one period →</a>
                        <a href="#overage" className="text-gold-700 hover:underline">Overage approval rules: prior approval at R{service.overage_rate_zar.toLocaleString()}/h →</a>
                        <a href="/retainers/compare" className="text-gold-700 hover:underline">Service level terms →</a>
                    </div>
                </div>

                <aside className="space-y-4">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-semibold text-ink-900">Summary</h2>
                        <ul className="mt-3 space-y-2.5 text-xs text-ink-700">
                            {['You control your utilisation.', 'Lower use can reduce your realised value.', 'You have equal-weight choices.', 'No charges beyond allowance without your approval.', 'Full transparency before you commit.'].map((x) => (
                                <li key={x} className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-gold-600" aria-hidden="true" />{x}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-semibold text-ink-900">Ready to continue?</h2>
                        <p className="mt-1 text-xs text-ink-600">You can proceed to proposal after reviewing this information.</p>
                        {acknowledged && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-verified-700"><Info className="size-3.5" aria-hidden="true" />Already acknowledged (v{version})</p>}
                        <button type="button" disabled={form.processing} onClick={() => form.post(`/retainers/${service.slug}/utilisation-economics`)} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-60">
                            Continue to Proposal <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => openAskQuestion({ subject: `Utilisation economics — ${service.name}`, section: 'retainers' })} className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-[4px] border border-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-50">
                            <Headphones className="size-4" aria-hidden="true" /> Talk to a Human Expert
                        </button>
                    </div>
                </aside>
            </div>
        </>
    );
}
