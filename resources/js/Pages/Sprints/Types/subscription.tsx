import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BadgeCheck,
    Banknote,
    CalendarClock,
    CalendarDays,
    CircleCheck,
    Clock3,
    FileText,
    Gift,
    Headset,
    Info,
    Lightbulb,
    Lock,
    Pause,
    RefreshCw,
    Repeat,
    Scale,
    ShieldCheck,
    Tag,
    Trophy,
    User,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/Components/ui/Kit';
import { AskButton, Crumbs, RelatedSprints, attrsOf, list, orderHref, pairs, useSaveSprint } from '@/Components/SprintTypes/B/common';
import { cn } from '@/lib/cn';
import type { SprintRecord } from '@/types';
import type { SubscriptionAttributes } from '@/types/sprint-types-b';

const recurrenceIcons = [Repeat, RefreshCw, CalendarDays, Wrench, User, CalendarClock, Clock3];
const commercialIcons = [Banknote, Scale, Banknote, CalendarDays, CalendarClock, RefreshCw, Pause, Tag, FileText];
const sideIcons = [Clock3, CalendarDays, RefreshCw, Pause, Tag, FileText];
const trustIcons = [ShieldCheck, BadgeCheck, Banknote, Lock, Trophy];

const pillTone = ['bg-referenced-50 text-referenced-700', 'bg-gold-100 text-gold-800', 'bg-attested-50 text-attested-700', 'bg-parchment-300 text-ink-800'];

export default function SubscriptionSprint({ sprint, related }: { sprint: SprintRecord; related: SprintRecord[] }) {
    const a = attrsOf<SubscriptionAttributes>(sprint);
    const { save, busy } = useSaveSprint(sprint);
    const [modal, setModal] = useState<null | 'compare' | 'disclosure'>(null);
    const plans = sprint.packages ?? [];
    const [plan, setPlan] = useState(plans.find((p) => p.popular)?.key ?? plans[0]?.key ?? 'standard');
    const cards = a.cards ?? { what_recurs: '', why_recurs: '', next_period: '', who_for: '' };

    const valueCards = [
        { title: 'What Recurs', text: cards.what_recurs, icon: RefreshCw, tone: 'text-referenced-500' },
        { title: 'Why It Recurs', text: cards.why_recurs, icon: Gift, tone: 'text-verified-500' },
        { title: 'Next Period Value', text: cards.next_period, icon: Lightbulb, tone: 'text-controlled-500' },
        { title: "Who It's For", text: cards.who_for, icon: User, tone: 'text-attested-500' },
    ];

    const commercial = pairs(a.commercial);
    const side = pairs(a.side_terms);
    const pills = list(a.pills);

    return (
        <div className="bg-parchment-50">
            <div className="container-tbca py-6">
                <Crumbs home items={[{ label: 'Subscriptions', href: '/subscriptions' }, { label: 'Plans', href: '/subscriptions' }, { label: sprint.title }]} />

                <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
                    <div className="min-w-0 space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <h1 className="font-serif text-3xl leading-tight font-bold text-ink-900 sm:text-4xl">{sprint.title}</h1>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setModal('compare')} className="inline-flex h-9 items-center gap-2 rounded-[5px] border border-parchment-500 bg-white px-3 text-[0.8125rem] font-medium hover:border-gold-500">
                                    <Scale className="size-4" aria-hidden="true" /> Compare Plans
                                </button>
                                <button type="button" onClick={() => setModal('disclosure')} className="inline-flex h-9 items-center gap-2 rounded-[5px] border border-parchment-500 bg-white px-3 text-[0.8125rem] font-medium hover:border-gold-500">
                                    <FileText className="size-4" aria-hidden="true" /> View Disclosure
                                </button>
                            </div>
                        </div>
                        <ul className="flex flex-wrap items-center gap-2 text-xs">
                            {pills.map((p, i) => {
                                const isClass = p.startsWith('Recurrence Class:');
                                return (
                                    <li key={p} className={cn('rounded px-2 py-1 font-medium', isClass && pills.length > 3 ? 'bg-transparent text-ink-700' : pillTone[i % pillTone.length])}>
                                        {isClass && pills.length > 3 ? (
                                            <>Recurrence Class: <span className="font-semibold text-verified-700">{p.replace('Recurrence Class:', '').trim()}</span></>
                                        ) : (
                                            p
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                        <p className="max-w-4xl text-[0.875rem] leading-relaxed text-ink-700">{a.intro ?? sprint.summary}</p>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {valueCards.map((c) => (
                                <div key={c.title} className="flex gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                                    <c.icon className={cn('size-6 shrink-0', c.tone)} aria-hidden="true" />
                                    <div>
                                        <h2 className="text-sm font-bold text-ink-900">{c.title}</h2>
                                        <p className="mt-1 text-xs leading-relaxed text-ink-600">{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid gap-3 xl:grid-cols-3">
                            <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                                <h2 className="mb-3 text-[0.9375rem] font-bold text-ink-900">{a.entitlements_title ?? 'Key Entitlements'}</h2>
                                <ul className="space-y-1.5 text-xs text-ink-700">
                                    {list(a.entitlements).map((e) => (
                                        <li key={e} className="flex gap-2"><CircleCheck className="size-3.5 shrink-0 text-verified-500" aria-hidden="true" />{e}</li>
                                    ))}
                                </ul>
                                {a.we_need && (
                                    <>
                                        <h3 className="mt-3 text-sm font-bold text-ink-900">What We Need From You</h3>
                                        <p className="mt-1 text-[0.6875rem] leading-relaxed text-ink-600">{a.we_need}</p>
                                    </>
                                )}
                            </section>
                            <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                                <h2 className="mb-3 text-[0.9375rem] font-bold text-ink-900">Recurrence and Delivery</h2>
                                <dl className="space-y-2.5 text-xs">
                                    {pairs(a.recurrence).map(([k, v], i) => {
                                        const Icon = recurrenceIcons[i % recurrenceIcons.length];
                                        return (
                                            <div key={k} className="grid grid-cols-[1rem_minmax(0,0.9fr)_minmax(0,1.1fr)] gap-2">
                                                <Icon className="size-3.5 text-ink-500" aria-hidden="true" />
                                                <dt className="font-semibold text-ink-800">{k}</dt>
                                                <dd className="text-ink-600">{v}</dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                            </section>
                            <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                                <h2 className="mb-3 text-[0.9375rem] font-bold text-ink-900">Commercial &amp; Continuation</h2>
                                <dl className="divide-y divide-parchment-300 text-xs">
                                    {commercial.map(([k, v], i) => {
                                        const Icon = commercialIcons[i % commercialIcons.length];
                                        const strong = k.startsWith('Total') || (k.startsWith('Price (ex') && !!a.draft);
                                        return (
                                            <div key={k} className="grid grid-cols-[1rem_minmax(0,0.9fr)_minmax(0,1.1fr)] gap-2 py-1.5">
                                                <Icon className="size-3.5 text-ink-500" aria-hidden="true" />
                                                <dt className="font-semibold text-ink-800">{k}</dt>
                                                <dd className={cn(strong ? 'text-sm font-bold text-verified-700' : 'text-ink-600')}>{v}</dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                            </section>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div className="flex gap-3 rounded-[8px] border border-referenced-500/20 bg-referenced-50 p-4">
                                <ShieldCheck className="size-6 shrink-0 text-referenced-500" aria-hidden="true" />
                                <div>
                                    <h2 className="text-sm font-bold text-ink-900">{a.cancellation_title ?? 'Cancellation'}</h2>
                                    <p className="mt-1 text-xs text-ink-700">{a.cancellation}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 rounded-[8px] border border-controlled-500/20 bg-controlled-50 p-4">
                                <Info className="size-6 shrink-0 text-controlled-500" aria-hidden="true" />
                                <div>
                                    <h2 className="text-sm font-bold text-ink-900">Important</h2>
                                    <p className="mt-1 text-xs text-ink-700">{a.important}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <aside className="space-y-4">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4 lg:sticky lg:top-[calc(var(--tbca-header-h)+1rem)]">
                            <p className="text-sm font-semibold text-ink-800">Subscription Price</p>
                            <p className="mt-1 text-3xl font-bold text-verified-700">
                                {a.price_display}
                                {a.per && <span className="ml-1 text-sm font-semibold">{a.per}</span>}
                            </p>
                            <p className="text-xs text-ink-600">{a.billing_note}</p>
                            {a.draft ? (
                                <p className="mt-3 flex gap-2 rounded-[6px] border border-attested-500/30 bg-attested-50 p-2.5 text-[0.6875rem] text-attested-700">
                                    <Info className="size-4 shrink-0" aria-hidden="true" />
                                    Draft subscription mock-up. Activation subject to controlled recurring-value and commercial validation.
                                </p>
                            ) : (
                                a.next_charge && (
                                    <p className="mt-3 flex items-center gap-2 rounded-[6px] border border-verified-500/30 bg-verified-50 p-2 text-xs font-medium text-verified-700">
                                        <CalendarDays className="size-4" aria-hidden="true" /> {a.next_charge}
                                    </p>
                                )
                            )}
                            {plans.length > 1 && (
                                <fieldset className="mt-3 space-y-1.5">
                                    <legend className="mb-1 text-xs font-semibold text-ink-700">Plan</legend>
                                    {plans.map((p) => (
                                        <label key={p.key} className={cn('flex cursor-pointer items-center justify-between rounded-[6px] border px-2.5 py-1.5 text-xs', plan === p.key ? 'border-gold-500 bg-gold-50' : 'border-parchment-400')}>
                                            <span className="flex items-center gap-2">
                                                <input type="radio" name="plan" value={p.key} checked={plan === p.key} onChange={() => setPlan(p.key)} className="accent-gold-600" />
                                                {p.name}
                                            </span>
                                            <span className="font-semibold">R{p.zar.toLocaleString('en-ZA')}</span>
                                        </label>
                                    ))}
                                </fieldset>
                            )}
                            {a.draft ? (
                                <button type="button" onClick={() => setModal('disclosure')} className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-gold-600 text-sm font-semibold text-white hover:bg-gold-700">
                                    {a.cta ?? 'View Plan Details'}
                                </button>
                            ) : (
                                <Link href={orderHref(sprint, plan)} className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-gold-600 text-sm font-semibold text-white hover:bg-gold-700">
                                    {a.cta ?? 'Choose This Plan'} <ArrowRight className="size-4" aria-hidden="true" />
                                </Link>
                            )}
                            <button type="button" onClick={save} disabled={busy} className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[5px] border border-gold-500 text-[0.8125rem] font-medium text-ink-900 hover:bg-gold-50 disabled:opacity-60">
                                <BookmarkIcon /> Add to Saved Items
                            </button>
                            <dl className="mt-4 space-y-2 text-xs">
                                {side.map(([k, v], i) => {
                                    const Icon = sideIcons[i % sideIcons.length];
                                    return (
                                        <div key={k} className="grid grid-cols-[1rem_minmax(0,0.9fr)_minmax(0,1.1fr)] gap-2">
                                            <Icon className="size-3.5 text-ink-500" aria-hidden="true" />
                                            <dt className="font-semibold text-ink-800">{k}</dt>
                                            <dd className="text-ink-600">{v}</dd>
                                        </div>
                                    );
                                })}
                            </dl>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-parchment-100 p-4">
                            <div className="flex gap-3">
                                <Headset className="size-7 shrink-0 text-verified-500" aria-hidden="true" />
                                <div>
                                    <h2 className="text-sm font-bold text-ink-900">Need Help?</h2>
                                    <p className="mt-1 text-xs text-ink-600">Our specialists can help you assess whether this subscription fits your requirements.</p>
                                </div>
                            </div>
                            <AskButton sprint={sprint} label="Talk to a Specialist →" className="mt-3 w-full border-verified-500 text-verified-700" />
                        </div>
                    </aside>
                </div>

                <div className="mt-6 grid gap-4 border-y border-parchment-400 py-4 sm:grid-cols-2 lg:grid-cols-5">
                    {pairs(a.trust).map(([t, s], i) => {
                        const Icon = trustIcons[i % trustIcons.length];
                        return (
                            <div key={t} className="flex items-start gap-3">
                                <Icon className="size-6 shrink-0 text-verified-500" aria-hidden="true" />
                                <div className="text-xs"><p className="font-semibold text-ink-900">{t}</p><p className="text-ink-500">{s}</p></div>
                            </div>
                        );
                    })}
                </div>

                <RelatedSprints related={related} title="Related Subscriptions" className="mt-8" />
            </div>

            <Modal open={modal === 'disclosure'} onClose={() => setModal(null)} title="Subscription Disclosure" size="lg">
                <div className="space-y-3 text-[0.8125rem] text-ink-700">
                    <p>{a.intro}</p>
                    <dl className="divide-y divide-parchment-300">
                        {[...pairs(a.recurrence), ...commercial].map(([k, v]) => (
                            <div key={k} className="grid grid-cols-2 gap-3 py-1.5"><dt className="font-semibold">{k}</dt><dd>{v}</dd></div>
                        ))}
                    </dl>
                    <p><strong>{a.cancellation_title ?? 'Cancellation'}:</strong> {a.cancellation}</p>
                    <p><strong>Important:</strong> {a.important}</p>
                </div>
            </Modal>
            <Modal open={modal === 'compare'} onClose={() => setModal(null)} title="Compare Plans" size="lg">
                {plans.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[0.8125rem]">
                            <thead className="bg-parchment-200 text-xs">
                                <tr><th className="px-3 py-2">Plan</th><th className="px-3 py-2">Price (ex VAT)</th><th className="px-3 py-2">Includes</th><th className="px-3 py-2" /></tr>
                            </thead>
                            <tbody className="divide-y divide-parchment-300">
                                {plans.map((p) => (
                                    <tr key={p.key}>
                                        <td className="px-3 py-2 font-semibold">{p.name}</td>
                                        <td className="px-3 py-2">R{p.zar.toLocaleString('en-ZA')}{a.per}</td>
                                        <td className="px-3 py-2 text-xs text-ink-600">{(p.features ?? []).join(' · ')}</td>
                                        <td className="px-3 py-2">
                                            <button type="button" onClick={() => { setPlan(p.key); setModal(null); }} className="text-xs font-semibold text-gold-700 hover:underline">Select</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-ink-600">Plan tiers are confirmed once recurring-value certification completes.</p>
                )}
            </Modal>
        </div>
    );
}

function BookmarkIcon() {
    return (
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
    );
}

