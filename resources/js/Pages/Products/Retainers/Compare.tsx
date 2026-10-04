import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Check, Layers, Lightbulb, Lock, MessageCircle, ShieldCheck, ShoppingCart, UserCheck, Users, Scale as ScaleIcon, BadgeCheck, HelpCircle, ListChecks, Flag } from 'lucide-react';
import { PageTitle, TrustRow } from '@/Components/Products/Shared';
import { ButtonLink } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import { retIcon } from '@/Components/Products/Retainers/ui';

interface Row {
    icon: string;
    label: string;
    retainer: string;
    subscription: string;
    per_use: string;
}

const DECIDE = [
    { q: 'Need guaranteed access and a dedicated team?', a: 'Retainer', href: '/retainers/choose' },
    { q: 'Need ongoing access to a defined service platform?', a: 'Subscription', href: '/subscriptions' },
    { q: 'Need flexibility with no ongoing commitment?', a: 'Per-Use', href: '/digital-products' },
];

const COLS = [
    { key: 'retainer', icon: Users, title: 'RETAINER', sub: 'Reserved Capacity. Measurable Value.' },
    { key: 'subscription', icon: Layers, title: 'SUBSCRIPTION', sub: 'Ongoing Access. Platform or Service.' },
    { key: 'per_use', icon: ShoppingCart, title: 'PER-USE', sub: 'Flexibility. Pay Only for What You Use.' },
] as const;

export default function Compare({ rows }: { rows: Row[] }) {
    return (
        <>
            <Head title="Retainer vs Subscription vs Per-Use" />
            <PageTitle
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Retainers', href: '/retainers' }, { label: 'Compare Your Options' }]}
                title={
                    <>
                        Retainer vs Subscription vs Per-Use
                        <span className="mt-1 block text-[1.375rem] text-gold-600 md:text-[1.75rem]">Choose the Right Model for Your Needs.</span>
                    </>
                }
                lead="Each engagement model is designed for different needs. Compare the key differences to choose the option that delivers the best value and outcomes for your organisation."
                aside={
                    <div className="w-full max-w-md rounded-[8px] border border-gold-300 bg-white p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                            <Lightbulb className="size-4 text-gold-600" aria-hidden="true" /> How to Decide
                        </p>
                        <ul className="mt-3 space-y-2 text-[0.8125rem]">
                            {DECIDE.map((d) => (
                                <li key={d.a} className="flex items-start justify-between gap-3">
                                    <span className="flex gap-2 text-ink-700">
                                        <Check className="mt-0.5 size-3.5 shrink-0 text-verified-500" aria-hidden="true" />
                                        {d.q}
                                    </span>
                                    <Link href={d.href} className="shrink-0 font-semibold text-gold-700 hover:underline">
                                        → {d.a}
                                    </Link>
                                </li>
                            ))}
                            <li className="flex items-center gap-2 text-ink-700">
                                <Check className="size-3.5 text-verified-500" aria-hidden="true" /> Still unsure?
                                <button type="button" onClick={() => openAskQuestion({ subject: 'Which engagement model fits?', section: 'retainers' })} className="inline-flex items-center gap-1 font-semibold text-gold-700 hover:underline">
                                    <MessageCircle className="size-3.5" aria-hidden="true" /> Talk to our team for guidance.
                                </button>
                            </li>
                        </ul>
                    </div>
                }
            />

            <div className="container-tbca grid gap-6 py-8 lg:grid-cols-[1fr_260px]">
                <div className="min-w-0">
                    <div className="overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
                        <table className="w-full min-w-[760px] text-left text-[0.8125rem]">
                            <thead>
                                <tr>
                                    <th className="w-44 p-3" />
                                    {COLS.map(({ key, icon: Icon, title, sub }) => (
                                        <th key={key} scope="col" className="border-l border-parchment-300 bg-gold-50 p-3">
                                            <span className="flex items-center gap-2.5">
                                                <Icon className="size-6 text-ink-800" aria-hidden="true" />
                                                <span>
                                                    <span className="block text-base font-bold text-ink-900">{title}</span>
                                                    <span className="block text-xs font-medium text-ink-600">{sub}</span>
                                                </span>
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-parchment-300">
                                {rows.map((r) => {
                                    const Icon = retIcon(r.icon);
                                    return (
                                        <tr key={r.label}>
                                            <th scope="row" className="p-3 font-semibold text-ink-900">
                                                <span className="flex items-center gap-2">
                                                    <Icon className="size-4 text-gold-600" aria-hidden="true" />
                                                    {r.label}
                                                </span>
                                            </th>
                                            <td className="border-l border-parchment-300 p-3 text-ink-700">{r.retainer}</td>
                                            <td className="border-l border-parchment-300 p-3 text-ink-700">{r.subscription}</td>
                                            <td className="border-l border-parchment-300 p-3 text-ink-700">{r.per_use}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-5 grid items-center gap-4 md:grid-cols-3">
                        <div className="flex items-start gap-3 rounded-[8px] border border-gold-300 bg-white p-4">
                            <Lightbulb className="size-6 shrink-0 text-gold-600" aria-hidden="true" />
                            <div>
                                <p className="text-sm font-semibold text-ink-900">Need a Custom Solution?</p>
                                <p className="text-xs text-ink-600">We can design a tailored engagement that fits your specific needs.</p>
                            </div>
                        </div>
                        <ButtonLink href="/retainers/allowance-sizing" size="lg" trailingIcon="arrow-right" className="w-full">
                            Compare My Need
                        </ButtonLink>
                        <Link href="/retainers" className="flex items-start gap-3 rounded-[8px] border border-gold-300 bg-white p-4 hover:border-gold-500">
                            <ScaleIcon className="size-6 shrink-0 text-gold-600" aria-hidden="true" />
                            <div>
                                <p className="flex items-center gap-1 text-sm font-semibold text-ink-900">
                                    Explore Retainers <ArrowRight className="size-3.5" aria-hidden="true" />
                                </p>
                                <p className="text-xs text-ink-600">View all retainer options and typical outcomes.</p>
                            </div>
                        </Link>
                    </div>
                </div>

                <aside className="space-y-4">
                    <div className="rounded-[8px] border border-gold-300 bg-white p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                            <ShieldCheck className="size-5 text-gold-600" aria-hidden="true" /> All Models Include
                        </p>
                        <ul className="mt-3 space-y-2 text-[0.8125rem] text-ink-700">
                            {['Human-reviewed delivery', 'Ethical AI where applicable', 'Clear governance & audit', 'Transparent pricing', 'Secure client portal access'].map((x) => (
                                <li key={x} className="flex gap-2">
                                    <Check className="mt-0.5 size-3.5 shrink-0 text-verified-500" aria-hidden="true" />
                                    {x}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-[8px] border border-gold-300 bg-white p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                            <HelpCircle className="size-5 text-gold-600" aria-hidden="true" /> Not Sure Which?
                        </p>
                        <p className="mt-2 text-[0.8125rem] text-ink-600">We will help you assess your needs and recommend the right model.</p>
                        <button type="button" onClick={() => openAskQuestion({ subject: 'Help me choose an engagement model', section: 'retainers' })} className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-gold-500 text-[0.8125rem] font-semibold text-gold-700 hover:bg-gold-50">
                            Talk to TBCA <ArrowRight className="size-3.5" aria-hidden="true" />
                        </button>
                    </div>
                </aside>
            </div>

            <div className="container-tbca space-y-4 pb-10">
                <TrustRow
                    items={[
                        { icon: Lock, title: 'Secure & Confidential', body: 'Your information is protected with enterprise-grade security.' },
                        { icon: UserCheck, title: 'Human Review', body: 'Every proposal is reviewed by senior experts.' },
                        { icon: BadgeCheck, title: 'Verified Information', body: 'All content is evidence based and bias-free.' },
                        { icon: MessageCircle, title: 'WhatsApp Support', body: 'Real humans. Real answers. We are here to help.' },
                        { icon: HelpCircle, title: 'Ask a Question', body: 'Get clarity before you commit. We are here to help.' },
                    ]}
                />
                <TrustRow
                    tone="dark"
                    items={[
                        { icon: ShieldCheck, title: 'No margin steering', body: 'We recommend by fit, not margin.' },
                        { icon: Users, title: 'Professional boundaries', body: 'We route to the right expertise.' },
                        { icon: ListChecks, title: 'Transparent pricing', body: 'Always see the full breakdown.' },
                        { icon: Lock, title: 'Your choice', body: 'You decide what fits you best.' },
                        { icon: Flag, title: 'Phase 1 – South Africa', body: 'ZAR Source Pricing' },
                        { icon: ShieldCheck, title: 'Secure & Private', body: 'Your data is protected.' },
                    ]}
                />
            </div>
        </>
    );
}
