import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, CheckCircle2, Headphones, Info, MessageCircle, ShieldAlert } from 'lucide-react';
import { PageTitle, Notice } from '@/Components/Products/Shared';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import type { RetServiceFull } from '@/Components/Products/Retainers/types';
import { retIcon } from '@/Components/Products/Retainers/ui';

const TONES: Record<string, string> = {
    info: 'border-controlled-500/40 bg-controlled-50 text-controlled-700',
    gold: 'border-gold-400 bg-gold-50 text-gold-800',
    bad: 'border-risk-500/40 bg-risk-50 text-risk-700',
    neutral: 'border-parchment-500 bg-parchment-100 text-ink-700',
};

export default function Exclusions({ service, version, acknowledged }: { service: RetServiceFull; version: string; acknowledged: boolean }) {
    const form = useForm({ version });
    const { url } = usePage();
    const allowance = new URLSearchParams(url.split('?')[1] ?? '').get('allowance');

    return (
        <>
            <Head title={`Exclusion Register — ${service.name}`} />
            <PageTitle
                crumbs={[{ label: 'Retainers', href: '/retainers' }, { label: service.name, href: `/retainers/${service.slug}` }, { label: 'Exclusions' }]}
                title="Exclusion Register"
                lead="These items are outside the scope of your Retainer."
                aside={<span className="rounded-full bg-parchment-300 px-3 py-1 text-xs font-semibold text-ink-700">Step 2 of 3 · Version {version}</span>}
            />
            <div className="container-tbca grid gap-5 py-8 lg:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                        <Notice tone="info" title="Why exclusions exist">
                            To protect both parties. Exclusions prevent scope creep, misaligned expectations and unplanned cost.
                        </Notice>
                        <Notice tone="gold" icon={ShieldAlert} title="Important">
                            Material changes to exclusions require fresh acknowledgement before any new work proceeds.
                        </Notice>
                    </div>

                    <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                        <table className="w-full min-w-[820px] text-left text-[0.8125rem]">
                            <thead className="bg-parchment-200 text-xs text-ink-600">
                                <tr>
                                    {['Exclusion Category', 'What is excluded', 'Why it is excluded', 'Alternative route', 'Typical next step', ''].map((h) => (
                                        <th key={h} scope="col" className="px-3 py-2.5 font-semibold">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-parchment-300">
                                {service.exclusions.map((e) => {
                                    const Icon = retIcon(e.icon);
                                    return (
                                        <tr key={e.code} className="align-top">
                                            <th scope="row" className="px-3 py-3 font-semibold text-ink-900">
                                                <span className="flex items-start gap-2.5">
                                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-[6px] border border-gold-300 bg-gold-50 text-gold-700">
                                                        <Icon className="size-4" aria-hidden="true" />
                                                    </span>
                                                    <span>
                                                        {e.category}
                                                        <span className="block text-[0.625rem] font-normal text-ink-400">{e.code}</span>
                                                    </span>
                                                </span>
                                            </th>
                                            <td className="px-3 py-3 text-ink-700">{e.excluded}</td>
                                            <td className="px-3 py-3 text-ink-700">{e.why}</td>
                                            <td className="px-3 py-3">
                                                <span className={cn('inline-block rounded-[4px] border px-2 py-0.5 text-xs font-medium whitespace-nowrap', TONES[e.route_tone ?? 'neutral'])}>{e.route}</span>
                                            </td>
                                            <td className="px-3 py-3 text-ink-700">{e.next}</td>
                                            <td className="px-3 py-3 whitespace-nowrap">
                                                {e.href ? (
                                                    <Link href={e.href} className="text-xs font-semibold text-gold-700 hover:underline">
                                                        View Route →
                                                    </Link>
                                                ) : (
                                                    <button type="button" onClick={() => openAskQuestion({ subject: `Exclusion route: ${e.category}`, section: 'retainers' })} className="text-xs font-semibold text-gold-700 hover:underline">
                                                        View Route →
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-3 text-[0.8125rem] text-ink-700">
                        <span className="flex items-center gap-2">
                            <Info className="size-4 text-controlled-700" aria-hidden="true" /> Do you have a question about an exclusion? Speak to a human expert who can clarify scope and next steps.
                        </span>
                        <button type="button" onClick={() => openAskQuestion({ subject: `Exclusions — ${service.name}`, section: 'retainers' })} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-gold-500 bg-white px-3 text-xs font-semibold text-ink-900">
                            <Headphones className="size-4" aria-hidden="true" /> Talk to a Human Expert
                        </button>
                    </div>
                </div>

                <aside className="space-y-4">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-semibold text-ink-900">Your acknowledgement</h2>
                        <Notice tone="gold" className="mt-3">
                            You must review and acknowledge these exclusions before we can prepare your proposal.
                        </Notice>
                        <p className="mt-4 text-xs font-semibold text-ink-800">Acknowledgement status</p>
                        <p className={cn('mt-1 flex items-center gap-2 text-sm font-semibold', acknowledged ? 'text-verified-700' : 'text-attested-700')}>
                            <span className={cn('size-2.5 rounded-full', acknowledged ? 'bg-verified-500' : 'bg-attested-500')} />
                            {acknowledged ? `Acknowledged (version ${version})` : 'Not acknowledged'}
                        </p>
                        <p className="mt-4 text-xs font-semibold text-ink-800">What happens after acknowledgement</p>
                        <ul className="mt-2 space-y-1.5 text-xs text-ink-700">
                            {['You can proceed to proposal.', 'We will price any out-of-scope work separately.', 'Material changes will require fresh acknowledgement.'].map((x) => (
                                <li key={x} className="flex gap-2">
                                    <CheckCircle2 className="size-3.5 shrink-0 text-verified-500" aria-hidden="true" />
                                    {x}
                                </li>
                            ))}
                        </ul>
                        {form.errors.version && <p role="alert" className="mt-2 text-xs text-risk-500">{form.errors.version}</p>}
                        <button
                            type="button"
                            disabled={form.processing}
                            onClick={() => form.post(`/retainers/${service.slug}/exclusions${allowance ? `?allowance=${allowance}` : ''}`)}
                            className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-60"
                        >
                            <CheckCheck className="size-4" aria-hidden="true" /> I Have Reviewed Exclusions
                        </button>
                        <Link href={`/retainers/choose?category=${service.category}&service=${service.slug}`} className="mt-2 flex h-10 items-center justify-center gap-2 rounded-[4px] border border-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-50">
                            <ArrowLeft className="size-4" aria-hidden="true" /> Back: Choose Service
                        </Link>
                    </div>
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-semibold text-ink-900">Need clarity on an item?</h2>
                        <p className="mt-1 text-xs text-ink-600">We are here to help you understand what is excluded and your options.</p>
                        <button type="button" onClick={() => openAskQuestion({ subject: 'Exclusion clarification', section: 'retainers' })} className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-gold-500 px-3 text-xs font-semibold text-ink-900">
                            <MessageCircle className="size-4" aria-hidden="true" /> Ask a Question
                        </button>
                    </div>
                </aside>
            </div>
        </>
    );
}
