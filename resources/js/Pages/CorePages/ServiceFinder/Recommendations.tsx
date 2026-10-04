import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, CircleCheck, ClipboardCheck, Globe, HelpCircle, Tag } from 'lucide-react';
import { FINDER_STEPS, FinderHeader, FinderSidebar } from '@/Components/CorePages/FinderParts';
import { openAskQuestion } from '@/Components/AskQuestion';
import Icon from '@/Components/ui/Icon';
import { usePrice } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { FinderShared, Offering } from '@/types/core-pages';

interface Props extends FinderShared {
    step: number;
    recommendations: { best: Offering[]; also: Offering[]; basis: { need: string | null; stage: string | null; industry: string | null; budget: string | null; formats: string[]; challenge: string | null } };
    saved: string[];
}

export default function Recommendations(props: Props) {
    const { recommendations: r, saved } = props;
    const { auth } = usePage<SharedProps>().props;
    const price = usePrice();

    const secondary = (o: Offering) => {
        const cls = 'inline-flex h-9 w-full items-center justify-center rounded-[4px] border border-ink-300 bg-white text-[0.8125rem] font-medium hover:border-gold-500';
        if (o.secondary === 'Book Consultation') return <Link href="/discovery-call" className={cls}>Book Consultation</Link>;
        if (o.secondary === 'Add to Saved Items') {
            if (!auth.user) return <Link href="/login" className={cls}>Sign in to Save</Link>;
            const isSaved = saved.includes(o.key);
            return (
                <button type="button" className={cls} onClick={() => router.post('/saved', { item_type: 'service', item_key: o.key, label: o.name, url: o.href }, { preserveScroll: true })}>
                    {isSaved ? 'Saved ✓' : 'Add to Saved Items'}
                </button>
            );
        }
        return <button type="button" className={cls} onClick={() => openAskQuestion({ subject: `Question about ${o.name}`, section: 'core' })}>Ask a Question</button>;
    };

    return (
        <div className="bg-parchment-200">
            <Head title="Your Recommended TBCA Services" />
            <FinderHeader
                title="Your Recommended TBCA Services"
                subtitle="Based on your answers, we have matched the most suitable Sprints, tools and templates for your needs."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: 'Find the Right Service' }]}
                steps={FINDER_STEPS}
                current={5}
                icon={<ClipboardCheck className="size-8" aria-hidden="true" />}
            />
            <div className="container-tbca grid gap-5 py-8 xl:grid-cols-12">
                <div className="xl:col-span-8">
                    <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                        <h2 className="font-serif text-[1.375rem] font-semibold text-ink-900">Your best-fit options</h2>
                        <p className="mt-1 text-[0.8125rem] text-ink-500">
                            These recommendations are based on your selected need, your {r.basis.stage?.toLowerCase()} stage, your {r.basis.industry?.toLowerCase()} industry, your focus on {r.basis.challenge?.toLowerCase()} and your preferred budget range of {r.basis.budget}.
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[6px] bg-gold-50 p-2 text-[0.75rem]">
                            <span className="font-semibold text-ink-900">We have recommended:</span>
                            {[r.basis.need, r.basis.stage, r.basis.industry, r.basis.budget ? `Budget: ${r.basis.budget}` : null].filter(Boolean).map((c) => (
                                <span key={c} className="inline-flex items-center gap-1 rounded-[4px] border border-gold-300 bg-white px-2 py-1"><Tag className="size-3 text-gold-600" aria-hidden="true" />{c}</span>
                            ))}
                        </div>

                        {r.best.length === 0 ? (
                            <p className="mt-6 text-center text-sm text-ink-500">No offering matches your chosen route only. <Link href="/find-the-right-service/timing-budget" className="font-semibold text-gold-700">Allow alternatives</Link> or request human assistance.</p>
                        ) : (
                            <ul className="mt-4 space-y-3">
                                {r.best.map((o, i) => (
                                    <li key={o.key} className={cn('grid gap-4 rounded-[8px] border p-4 md:grid-cols-[auto_1fr_auto_12rem]', i === 0 ? 'border-gold-400 bg-gold-50/40' : 'border-parchment-400')}>
                                        <span className="inline-flex size-14 items-center justify-center rounded-[8px] border border-gold-300 bg-white text-gold-600"><Icon name={o.icon} className="size-7" /></span>
                                        <div>
                                            <h3 className="text-[1rem] font-bold text-ink-900">{o.name}</h3>
                                            <p className="text-[0.75rem] font-semibold text-gold-700">{o.kind}</p>
                                            <p className="mt-1 text-[0.8125rem] text-ink-600">{o.body}</p>
                                            <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                                                {o.bullets.map((b) => <li key={b} className="flex items-center gap-1 text-[0.6875rem] text-ink-500"><CircleCheck className="size-3 text-gold-600" aria-hidden="true" />{b}</li>)}
                                            </ul>
                                        </div>
                                        <div className="text-[0.75rem] text-ink-600 md:border-l md:border-parchment-300 md:pl-4">
                                            <span className="mb-1 inline-block rounded-[4px] border border-verified-500/40 bg-verified-50 px-2 py-0.5 font-semibold text-verified-700">{i === 0 ? 'Best Match · ' : ''}{o.match}% Match</span>
                                            <p>From</p>
                                            <p className="text-[1.25rem] font-bold text-ink-900">{o.zar > 0 ? price(o.zar) : 'Quote'}</p>
                                            <p><strong>Delivery:</strong> {o.delivery}</p>
                                            <p><strong>Includes:</strong> {o.includes}</p>
                                        </div>
                                        <div className="flex flex-col justify-center gap-2">
                                            <Link href={o.href} className="inline-flex h-9 w-full items-center justify-center rounded-[4px] bg-gold-500 text-[0.8125rem] font-semibold text-ink-900">{o.primary}</Link>
                                            {secondary(o)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {r.also.length > 0 && (
                            <>
                                <h3 className="mt-5 text-[0.875rem] font-bold text-ink-900">You may also consider</h3>
                                <ul className="mt-2 grid gap-3 md:grid-cols-2">
                                    {r.also.map((o) => (
                                        <li key={o.key} className="flex items-center gap-3 rounded-[8px] border border-parchment-400 p-3">
                                            <Icon name={o.icon} className="size-6 text-gold-600" />
                                            <span className="flex-1 text-[0.8125rem] font-semibold text-ink-900">{o.name} <span className="ml-1 rounded-[3px] bg-parchment-300 px-1.5 text-[0.625rem] font-medium text-ink-600">{o.kind}</span></span>
                                            <span className="text-[0.875rem] font-bold">{o.zar > 0 ? price(o.zar) : 'Quote'}</span>
                                            <Link href={o.href} className="inline-flex h-8 items-center rounded-[4px] border border-ink-300 px-3 text-[0.75rem]">View</Link>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </section>

                    <div className="mt-4 flex flex-col gap-3 rounded-[10px] bg-ink-950 p-4 text-parchment-200 lg:flex-row lg:items-center">
                        <HelpCircle className="hidden size-8 text-gold-500 lg:block" aria-hidden="true" />
                        <div className="flex-1">
                            <p className="font-semibold text-gold-400">Not the right fit?</p>
                            <p className="text-[0.75rem]">No problem. Refine your answers and we will re-run matching via WhatsApp or by a quick call.</p>
                        </div>
                        <Link href="/find-the-right-service/timing-budget" className="inline-flex h-10 items-center justify-center rounded-[4px] border border-parchment-200/40 px-4 text-[0.8125rem] text-parchment-100">Back to Timing &amp; Budget</Link>
                        <Link href="/find-the-right-service/your-need" className="inline-flex h-10 items-center justify-center rounded-[4px] border border-parchment-200/40 px-4 text-[0.8125rem] text-parchment-100">Refine Answers</Link>
                        <Link href={`/find-the-right-service/request-human-assistance${r.best[0] ? `?item=${encodeURIComponent(r.best[0].name)}` : ''}`} className="inline-flex h-10 items-center justify-center gap-1 rounded-[4px] bg-gold-500 px-4 text-[0.8125rem] font-semibold text-ink-900">Request Human Assistance <ArrowRight className="size-4" aria-hidden="true" /></Link>
                    </div>
                    <p className="mt-2 text-[0.6875rem] text-ink-500">By continuing, you allow TBCA to use your answers to recommend suitable services and next steps. Your responses do not constitute professional advice.</p>
                </div>
                <div className="space-y-4 xl:col-span-4">
                    <FinderSidebar shared={props} currentLabel="Recommendations" next={['Review the recommended options.', 'Open a Sprint, tool or template detail page.', 'Save options or request advice.', 'Proceed to order when ready.']} />
                    <Link href="/find-the-right-service/countries" className="flex items-center gap-3 rounded-[10px] border border-parchment-400 bg-white p-4 hover:border-gold-400">
                        <Globe className="size-7 text-gold-600" aria-hidden="true" />
                        <span className="flex-1 text-[0.8125rem]"><strong className="block text-ink-900">Expanding into another country?</strong>Check country resolver state, legal boundary and corridor evidence.</span>
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
