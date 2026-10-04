import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Check, HelpCircle, Info, Plus, Search } from 'lucide-react';
import { Stepper } from '@/Components/ui/Kit';
import { AdvisorCard, IndustryFrame, NextSteps } from '@/Components/Insights/Industries';
import { Box, DynIcon } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';
import type { IndustryContextValue, IndustryOption } from '@/types/insights';

interface Props {
    industries: IndustryOption[];
    context: IndustryContextValue;
    selected: string | null;
}

export default function IndustrySelect({ industries, context, selected }: Props) {
    const [industry, setIndustry] = useState<string | null>(selected);
    const [sub, setSub] = useState<string | null>(context.industrySlug === selected ? context.subIndustryCode : null);
    const [q, setQ] = useState('');
    const [showAll, setShowAll] = useState(true);

    const current = industries.find((i) => i.slug === industry) ?? null;
    const currentSub = current?.subIndustries.find((s) => s.code === sub) ?? null;
    const step = !current ? 1 : !currentSub ? 2 : 3;
    const list = industries.filter((i) => (i.name + ' ' + (i.blurb ?? '')).toLowerCase().includes(q.toLowerCase())).slice(0, showAll ? undefined : 8);

    const pickIndustry = (slug: string) => {
        setIndustry(slug);
        setSub(null);
    };
    const submit = () => {
        if (!current) return;
        router.post('/industries/context', { industry: current.slug, sub_industry: sub, country: context.country ?? 'ZA', redirect: `/industries/${current.slug}` });
    };

    return (
        <IndustryFrame
            title="Select Your Industry"
            crumbs={[{ label: 'Home', href: '/' }, { label: 'Industries', href: '/industries' }, { label: 'Select Your Industry' }]}
            sidebar={
                <>
                    <Box tone="dark" title="Your Selection" action={<button type="button" onClick={() => { setIndustry(null); setSub(null); }} className="text-xs text-parchment-100 underline">Clear all</button>}>
                        <p className="text-[0.6875rem] text-ink-300">Primary Industry</p>
                        <div className="mt-1 flex items-center justify-between rounded-[6px] border border-ink-700 p-2.5 text-xs">
                            <span className="flex items-center gap-2">{current && <DynIcon name={current.icon} className="size-4 text-gold-400" />}{current?.name ?? 'Not selected'}</span>
                            {current && <button type="button" onClick={() => setIndustry(null)} className="text-gold-400">Change</button>}
                        </div>
                        <p className="mt-3 text-[0.6875rem] text-ink-300">Sub-Industry</p>
                        <div className="mt-1 flex items-center justify-between rounded-[6px] border border-ink-700 p-2.5 text-xs">
                            <span>{currentSub?.name ?? 'Not selected'}</span>
                            {currentSub && <button type="button" onClick={() => setSub(null)} className="text-gold-400">Change</button>}
                        </div>
                        <h3 className="mt-4 text-[0.8125rem] font-semibold text-gold-400">Selection Context</h3>
                        <dl className="mt-2 space-y-1.5 text-xs">
                            {[['Country', context.countryName], ['Phase', 'Phase 1'], ['Industry Status', current ? (current.catalogueState === 'below_threshold' ? 'Below Threshold' : 'Proposed') : 'Proposed'], ['Classification', 'To be verified'], ['Complexity', current?.complexityLabel ?? 'To be determined'], ['Human Gate', current?.professionalGate === 'mandatory' ? 'Mandatory' : 'Advisory'], ['Visible Fees', 'T / P / X / S']].map(([k, v]) => (
                                <div key={k} className="flex justify-between"><dt className="text-ink-300">{k}</dt><dd>{v}</dd></div>
                            ))}
                        </dl>
                    </Box>
                    <NextSteps items={['Verify your business details and evidence.', 'Resolve regulatory controls and mandatory add-ons.', 'Access relevant diagnostics and sector intelligence.']} cta={current ? { label: 'See Next Steps', href: `/industries/${current.slug}` } : undefined} />
                    <AdvisorCard title="Need Help Choosing?" text="Speak to a TBCA Advisor for guided industry classification." />
                </>
            }
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-ink-900">Select Your Industry</h1>
                    <p className="mt-1 font-semibold text-gold-700">Choose your primary industry and refine to a sub-industry for accurate guidance.</p>
                    <p className="mt-1 text-sm text-ink-600">The more accurately you describe your business, the more relevant our diagnostics, products, partners and pricing will be.</p>
                </div>
                <Stepper className="max-w-md" steps={['Select Industry', 'Refine Sub-Industry', 'Verify & Continue']} current={step} />
            </div>

            <section className="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-ink-900">Step 1: Choose Your Primary Industry</h2>
                    <div className="flex flex-wrap items-center gap-3">
                        <label className="flex items-center gap-2 text-xs text-ink-700">
                            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="accent-gold-600" /> Show all {industries.length} industries
                        </label>
                        <label className="relative">
                            <span className="sr-only">Search industries</span>
                            <Search className="absolute top-2.5 left-2.5 size-4 text-ink-400" />
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search industries..." className="h-9 w-56 rounded-[4px] border border-parchment-500 bg-white pr-2 pl-8 text-sm" />
                        </label>
                        <button type="button" onClick={() => setQ('')} className="rounded-[4px] border border-parchment-500 bg-white px-3 py-1.5 text-xs">Clear</button>
                    </div>
                </div>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" role="radiogroup" aria-label="Primary industry">
                    {list.map((i) => {
                        const on = i.slug === industry;
                        return (
                            <li key={i.slug}>
                                <button type="button" role="radio" aria-checked={on} onClick={() => pickIndustry(i.slug)} className={cn('relative flex h-full w-full items-start gap-3 rounded-[8px] border bg-white p-3.5 text-left transition-colors', on ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-parchment-400 hover:border-gold-300')}>
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[0.6875rem] font-bold text-gold-400">{i.number}</span>
                                    <DynIcon name={i.icon} className="size-7 shrink-0 text-gold-700" />
                                    <span>
                                        <span className="block text-sm font-semibold text-ink-900">{i.name}</span>
                                        <span className="mt-0.5 block text-xs text-ink-500">{i.blurb}</span>
                                    </span>
                                    {on && <Check className="absolute top-2 right-2 size-5 rounded-full bg-gold-500 p-0.5 text-white" />}
                                </button>
                            </li>
                        );
                    })}
                    <li className="flex flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-parchment-500 bg-white p-4 text-center">
                        <HelpCircle className="size-6 text-ink-400" />
                        <p className="text-sm font-semibold">Not listed?</p>
                        <p className="text-xs text-ink-500">If your industry is not listed here, we can help you classify it correctly.</p>
                        <Link href="/contact?topic=industry-classification" className="rounded-[4px] border border-ink-300 px-3 py-1 text-xs font-bold uppercase">I'm not sure</Link>
                    </li>
                </ul>
            </section>

            {current && (
                <section className="mt-6">
                    <h2 className="text-lg font-semibold text-ink-900">Step 2: Refine to a Sub-Industry <span className="ml-1 rounded-full bg-gold-100 px-2 py-0.5 text-xs text-gold-800">for {current.name}</span></h2>
                    <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="radiogroup" aria-label="Sub-industry">
                        {current.subIndustries.map((s) => {
                            const on = s.code === sub;
                            return (
                                <li key={s.code}>
                                    <button type="button" role="radio" aria-checked={on} onClick={() => setSub(s.code)} className={cn('relative h-full w-full rounded-[8px] border bg-white p-3 text-left', on ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-parchment-400 hover:border-gold-300')}>
                                        <span className="block text-sm font-semibold text-ink-900">{s.name}</span>
                                        <span className="mt-0.5 block text-xs text-ink-500">{s.description}</span>
                                        {on && <Check className="absolute top-2 right-2 size-5 rounded-full bg-gold-500 p-0.5 text-white" />}
                                    </button>
                                </li>
                            );
                        })}
                        <li>
                            <Link href="/contact?topic=industry-classification" className="flex h-full flex-col rounded-[8px] border border-dashed border-parchment-500 bg-white p-3 text-left">
                                <span className="flex items-center gap-1 text-sm font-semibold"><Plus className="size-4" /> Other / Specify</span>
                                <span className="text-xs text-ink-500">Describe your specific sub-industry.</span>
                            </Link>
                        </li>
                    </ul>
                </section>
            )}

            <section className="mt-6">
                <h2 className="text-lg font-semibold text-ink-900">Step 3: Continue</h2>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <p className="flex flex-1 items-center gap-2 rounded-[6px] border border-gold-200 bg-gold-50 p-3 text-xs text-gold-800">
                        <Info className="size-4 shrink-0" /> Your selection determines: relevant diagnostics, regulatory checks, mandatory add-ons, pricing and specialist routing.
                    </p>
                    <button type="button" disabled={!current} onClick={submit} className="rounded-[4px] bg-gold-500 px-6 py-3 text-sm font-bold text-ink-900 uppercase disabled:opacity-50">
                        Verify & Continue →
                    </button>
                </div>
            </section>
        </IndustryFrame>
    );
}
