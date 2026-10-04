import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Headphones, Info, MonitorSmartphone, Scale, ShieldCheck, Users } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { PageTitle, TrustRow } from '@/Components/Products/Shared';
import { PUBLIC_TRUST } from '@/Components/Products/Subscriptions/ui';
import { cn } from '@/lib/cn';

const subscriptionFor = [
    'Access to tools, dashboards or systems',
    'Up-to-date content and intelligence',
    'Regular updates, templates or data',
    'Periodic reports or deliverables',
    'Ongoing functionality or monitoring',
    "Value that continues even if you don't use it",
    "Independently justifies next period's payment",
];

const retainerFor = [
    'Dedicated advisory time or support',
    'Specialist expertise on demand',
    'Proactive guidance and judgement',
    'Capacity reserved for you',
    'Priority response and availability',
    'Complex decisions and problem-solving',
    'Human input that drives outcomes',
];

const notSure = ['Quick model selector', 'Compare key differences', 'Speak to a specialist', 'Get a tailored recommendation', 'No obligation', "We'll help you decide"];

const differences = [
    ['What you access', 'Products, systems, content, outputs', 'People, capacity, judgement, readiness'],
    ['Recurrence value', 'Product or content keeps changing', 'People or capacity stay available'],
    ['Measured by', 'Access, usage, deliverables', 'Time, capacity, outputs'],
    ['Best for', 'Scale, consistency, efficiency', 'Complexity, advice, strategic decisions'],
];

function ModelCard({ tone, icon: Icon, title, body, list, cta, href, more, moreHref }: { tone: 'green' | 'purple'; icon: typeof Users; title: string; body: string; list: string[]; cta: string; href: string; more: string; moreHref: string }) {
    const t = tone === 'green' ? { tile: 'bg-verified-700', text: 'text-verified-700', btn: 'bg-verified-700 hover:bg-verified-500' } : { tile: 'bg-referenced-700', text: 'text-referenced-700', btn: 'bg-referenced-700 hover:bg-referenced-500' };
    return (
        <article className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-6">
            <div className="flex items-start gap-4 border-b border-parchment-300 pb-4">
                <span className={cn('flex size-14 shrink-0 items-center justify-center rounded-full text-white', t.tile)}>
                    <Icon className="size-7" aria-hidden="true" />
                </span>
                <div>
                    <h2 className={cn('font-serif text-2xl font-bold', t.text)}>{title}</h2>
                    <p className="mt-1 text-sm text-ink-700">{body}</p>
                </div>
            </div>
            <p className="mt-4 text-sm font-bold text-ink-900">Best for when you need:</p>
            <ul className="mt-2 flex-1 space-y-1.5">
                {list.map((l) => (
                    <li key={l} className="flex gap-2 text-[0.8125rem] text-ink-700">
                        <CheckCircle2 className={cn('mt-0.5 size-4 shrink-0', t.text)} aria-hidden="true" /> {l}
                    </li>
                ))}
            </ul>
            <Link href={href} className={cn('mt-5 flex h-10 items-center justify-center gap-2 rounded-[4px] text-sm font-semibold text-white', t.btn)}>
                {cta} <ArrowRight className="size-4" />
            </Link>
            <Link href={moreHref} className={cn('mt-2 text-center text-xs font-semibold hover:underline', t.text)}>
                {more} →
            </Link>
        </article>
    );
}

export default function ChooseModel() {
    return (
        <>
            <Head title="Subscription or Retainer?" />
            <PageTitle
                crumbs={[{ label: 'Subscriptions', href: '/subscriptions' }, { label: 'Choose Your Model' }]}
                title="Subscription or Retainer?"
                lead={
                    <>
                        <span className="block font-semibold text-gold-700">Choose the model that best matches the value you need.</span>
                        Subscriptions give you recurring access to products, systems, maintained content or periodic outputs. Retainers give you recurring access to people, capacity, judgement or readiness.
                    </>
                }
                aside={
                    <div className="flex max-w-sm gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4">
                        <ShieldCheck className="size-6 shrink-0 text-gold-700" aria-hidden="true" />
                        <div>
                            <p className="text-sm font-bold text-ink-900">Our Commitment</p>
                            <p className="text-xs text-ink-600">We won&rsquo;t steer you to either model. We&rsquo;ll help you choose what is right for your business.</p>
                        </div>
                    </div>
                }
            />

            <div className="bg-parchment-100 pb-14">
                <div className="container-tbca grid gap-6 pt-6 xl:grid-cols-[1fr_20rem]">
                    <div className="grid gap-5 lg:grid-cols-3">
                        <ModelCard
                            tone="green"
                            icon={MonitorSmartphone}
                            title="Subscription"
                            body="Recurring access to a product, system, maintained content or repeating output."
                            list={subscriptionFor}
                            cta="Explore Subscription Plans"
                            href="/subscriptions/compare"
                            more="Learn more about subscriptions"
                            moreHref="/subscriptions"
                        />
                        <article className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-6">
                            <div className="flex items-start gap-4 border-b border-parchment-300 pb-4">
                                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700">
                                    <Scale className="size-7" aria-hidden="true" />
                                </span>
                                <div>
                                    <h2 className="font-serif text-2xl font-bold text-ink-900">Not sure?</h2>
                                    <p className="mt-1 text-sm text-ink-700">Let us help you determine the right model for your needs.</p>
                                </div>
                            </div>
                            <ul className="mt-4 flex-1 space-y-2">
                                {notSure.map((l) => (
                                    <li key={l} className="flex gap-2 text-[0.8125rem] text-ink-700">
                                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" /> {l}
                                    </li>
                                ))}
                            </ul>
                            <button
                                type="button"
                                onClick={() => openAskQuestion({ subject: 'Help me choose: Subscription or Retainer', section: 'subscriptions' })}
                                className="mt-5 flex h-10 items-center justify-center gap-2 rounded-[4px] border border-gold-500 text-sm font-semibold text-gold-800 hover:bg-gold-50"
                            >
                                Help Me Choose <ArrowRight className="size-4" />
                            </button>
                        </article>
                        <ModelCard
                            tone="purple"
                            icon={Users}
                            title="Retainer"
                            body="Recurring access to quantified, bounded people, capacity, judgement or readiness."
                            list={retainerFor}
                            cta="Explore Retainer Services"
                            href="/retainers"
                            more="Learn more about retainers"
                            moreHref="/retainers/compare"
                        />
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="text-sm font-bold text-ink-900">Key Differences at a Glance</h2>
                            <table className="mt-3 w-full text-left text-xs">
                                <thead>
                                    <tr>
                                        <th scope="col" className="sr-only">
                                            Attribute
                                        </th>
                                        <th scope="col" className="pb-2 font-bold text-verified-700">
                                            Subscription
                                        </th>
                                        <th scope="col" className="pb-2 font-bold text-referenced-700">
                                            Retainer
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {differences.map(([k, s, r]) => (
                                        <tr key={k}>
                                            <th scope="row" className="py-2 pr-2 font-medium text-ink-500">
                                                {k}
                                            </th>
                                            <td className="py-2 pr-2 text-ink-800">{s}</td>
                                            <td className="py-2 text-ink-800">{r}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="rounded-[8px] border border-referenced-500/30 bg-referenced-50 p-5">
                            <p className="flex items-center gap-2 text-sm font-bold text-ink-900">
                                <Headphones className="size-5 text-referenced-700" /> Still Unsure?
                            </p>
                            <p className="mt-1 text-xs text-ink-600">Our specialists can help you select the right model for your goals.</p>
                            <button
                                type="button"
                                onClick={() => openAskQuestion({ subject: 'Subscription or Retainer advice', section: 'subscriptions' })}
                                className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-referenced-500 bg-white px-4 text-xs font-semibold text-referenced-700"
                            >
                                Talk to a Specialist <ArrowRight className="size-3.5" />
                            </button>
                        </div>
                        <div className="rounded-[8px] border border-gold-300 bg-gold-50 p-5">
                            <p className="flex items-center gap-2 text-sm font-bold text-gold-800">
                                <Info className="size-4" /> Important
                            </p>
                            <p className="mt-1 text-xs text-ink-700">
                                You can start with a subscription and move to a retainer later (or vice versa) if your needs change. We&rsquo;ll guide you through the transition.
                            </p>
                        </div>
                    </aside>
                </div>
                <div className="container-tbca mt-6">
                    <TrustRow items={PUBLIC_TRUST} />
                </div>
            </div>
        </>
    );
}
