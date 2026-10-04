import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CircleCheck, Download, FileSearch, Mail, Search, ShieldCheck, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { BookCallModal, Box, CheckList, ClientsStrip, type Pkg } from '@/Components/Sprints/DetailParts';
import { Crumbs, NightBackdrop } from '@/Components/Sprints/SprintHero';
import { formatZar } from '@/lib/money';
import type { Order, Payment, SprintRecord } from '@/types';
import type { GenericAttributes, SprintAddon } from '@/types/sprints';

interface Props {
    sprint: SprintRecord;
    order: Order & { currency?: string };
    package: Pkg | null;
    addons: SprintAddon[];
    payment: Payment | null;
}

/** Payment Successful — only reachable for a paid order owned by the visitor (checked server-side). */
export default function Success({ sprint, order, package: pkg, addons, payment }: Props) {
    const a = (sprint.attributes ?? {}) as GenericAttributes;
    const [booking, setBooking] = useState(false);
    const meta = (order.meta ?? {}) as { recurring?: { note?: string }; delivery?: string; commercial_act?: string };
    const free = order.total_zar === 0;
    const paidAt = order.paid_at ? new Date(order.paid_at) : new Date();
    const invoice = `INV-${order.reference.split('-').slice(-2).join('-')}`;
    const billing = (order.billing ?? {}) as { name?: string; email?: string };
    const included = pkg?.features?.length ? pkg.features : (a.checklist ?? a.outcomes ?? []);

    return (
        <>
            <Head title={`Payment Successful – ${sprint.title}`} />
            <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
                <NightBackdrop />
                <div className="container-tbca relative py-8 md:py-10">
                    <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'Sprints', href: '/sprints' }, { label: sprint.title, href: `/sprints/${sprint.slug}` }, { label: 'Confirmation' }]} />
                    <div className="flex flex-col gap-6 md:flex-row md:items-center lg:max-w-[calc(100%-400px)]">
                        <ShieldCheck className="size-24 shrink-0 text-verified-500" strokeWidth={1.4} aria-hidden="true" />
                        <div>
                            <h1 className="text-3xl font-bold text-white md:text-[2.5rem]">{free ? 'Sprint Confirmed' : 'Payment Successful'}</h1>
                            <p className="mt-2 max-w-2xl text-parchment-200">
                                Thank you! {free ? 'Your free access to the' : 'Your payment for the'} {sprint.title} – {pkg?.name} package has been received. Your sprint order is now confirmed and activated.
                            </p>
                            <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[0.8125rem]">
                                {['Payment Received', 'Sprint Activated', 'Next Steps Sent'].map((t) => (
                                    <li key={t} className="flex items-center gap-1.5">
                                        <CircleCheck className="size-4 text-verified-500" aria-hidden="true" /> {t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <div className="bg-parchment-100">
                <div className="container-tbca grid gap-6 pb-10 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <aside className="space-y-4 pt-6 lg:-mt-48 lg:pt-0">
                        <div className="rounded-[10px] border border-ink-700 bg-ink-900 p-5 text-parchment-100 shadow-raised">
                            <p className="font-semibold">Package Recap: {pkg?.name}</p>
                            {pkg?.description && <p className="mt-1 text-[0.8125rem] text-parchment-200">{pkg.description}</p>}
                            <p className="mt-3 font-semibold text-gold-400">What&rsquo;s Included</p>
                            <CheckList items={[...included, ...addons.map((x) => `Add-on: ${x.name}`), 'Human Reviewed by Experts']} tone="light" className="mt-2" />
                        </div>
                        <Box title="Receipt & Invoice">
                            <p className="text-[0.8125rem] text-ink-600">
                                A tax invoice and payment receipt have been emailed to <strong>{billing.email ?? 'your email'}</strong> and are also available in your Client Portal.
                            </p>
                            <p className="mt-3 flex items-center gap-2 rounded-[6px] border border-verified-500/30 bg-verified-50 p-3 text-[0.8125rem] text-verified-700">
                                <CircleCheck className="size-5" aria-hidden="true" />
                                <span>
                                    Invoice #{invoice}
                                    <br />
                                    Status: Paid
                                </span>
                            </p>
                        </Box>
                    </aside>

                    <div className="order-first min-w-0 space-y-5 pt-6">
                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                            <Box title="Confirmation Summary">
                                <dl className="grid gap-x-6 gap-y-2 text-[0.8125rem] sm:grid-cols-2">
                                    {[
                                        ['Order Number', order.reference],
                                        ['Package', pkg?.name ?? '—'],
                                        ['Payment Reference', payment?.reference ?? (free ? 'Not required' : '—')],
                                        ['Delivery Time', pkg?.delivery ?? meta.delivery ?? sprint.delivery ?? 'After scope'],
                                        ['Date & Time', `${paidAt.toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })} SAST`],
                                        ['Review Type', 'Human Reviewed'],
                                        ['Client Name', billing.name ?? '—'],
                                        ['Delivery Method', 'Client Portal'],
                                        ['Currency', order.currency ?? 'ZAR'],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between gap-3">
                                            <dt className="text-ink-500">{k}</dt>
                                            <dd className="text-right font-medium text-ink-900">{v}</dd>
                                        </div>
                                    ))}
                                </dl>
                                {meta.recurring?.note && <p className="mt-3 rounded-[6px] bg-gold-50 p-2.5 text-[0.75rem] text-ink-700">{meta.recurring.note}</p>}
                            </Box>
                            <Box title="Amount Paid">
                                <dl className="space-y-1.5 text-[0.8125rem]">
                                    {(order.items ?? []).map((i) => (
                                        <div key={i.id} className="flex justify-between gap-3">
                                            <dt className="text-ink-600">{i.item_type === 'sprint' ? 'Package Total' : i.name}</dt>
                                            <dd>{formatZar(i.line_zar)}</dd>
                                        </div>
                                    ))}
                                    <div className="flex justify-between">
                                        <dt className="text-ink-600">VAT (15%)</dt>
                                        <dd>{formatZar(order.vat_zar)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-ink-600">Fees (bank & platform)</dt>
                                        <dd>{formatZar(order.fees_zar)}</dd>
                                    </div>
                                </dl>
                                <p className="mt-3 flex justify-between border-t border-parchment-300 pt-3 text-lg font-bold text-gold-700">
                                    <span>Total Paid</span>
                                    <span>{formatZar(order.total_zar)}</span>
                                </p>
                                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-verified-50 px-2.5 py-1 text-[0.75rem] text-verified-700">
                                    <CircleCheck className="size-3.5" aria-hidden="true" /> Payment completed successfully
                                </p>
                            </Box>
                        </div>

                        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                            <Box title="What Happens Next">
                                <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                                    {[
                                        [CircleCheck, 'Payment Confirmed', 'Your payment has been received successfully.'],
                                        [Mail, 'Kickoff Email Sent', "You'll receive a kickoff email with next steps."],
                                        [Search, 'Research & Analysis Begins', 'Our team starts in-depth research & analysis.'],
                                        [FileSearch, 'Draft Delivered for Review', "You'll receive the first draft in your client portal."],
                                        [UploadCloud, 'Final Delivery in Client Portal', 'Finalised outputs delivered in your portal.'],
                                    ].map(([IconC, t, b], i) => {
                                        const I = IconC as typeof Mail;
                                        return (
                                            <li key={t as string} className="text-center">
                                                <span className="mx-auto flex size-7 items-center justify-center rounded-full bg-gold-600 text-[0.75rem] font-bold text-white">{i + 1}</span>
                                                <I className={i === 0 ? 'mx-auto mt-2 size-7 text-verified-500' : 'mx-auto mt-2 size-7 text-ink-700'} aria-hidden="true" />
                                                <p className="mt-1 text-[0.75rem] font-semibold text-ink-900">{t as string}</p>
                                                <p className="text-[0.6875rem] text-ink-500">{b as string}</p>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </Box>
                            <Box title="Your Next Steps">
                                <Link href="/portal" className="flex h-11 items-center justify-center gap-2 rounded-[4px] bg-gold-600 font-semibold text-white hover:bg-gold-700">
                                    Go to Client Portal <ArrowRight className="size-4" aria-hidden="true" />
                                </Link>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <button type="button" onClick={() => window.print()} className="flex h-10 items-center justify-center gap-1.5 rounded-[4px] border border-ink-300 text-[0.8125rem] font-semibold">
                                        <Download className="size-4" aria-hidden="true" /> Download Receipt
                                    </button>
                                    <button type="button" onClick={() => setBooking(true)} className="flex h-10 items-center justify-center gap-1.5 rounded-[4px] border border-ink-300 text-[0.8125rem] font-semibold">
                                        <CalendarDays className="size-4" aria-hidden="true" /> Book Kickoff Call
                                    </button>
                                </div>
                                <button type="button" onClick={() => openAskQuestion({ subject: `${order.reference}: ${sprint.title}`, section: 'sprints' })} className="mt-3 w-full text-center text-[0.875rem] font-semibold text-gold-700">
                                    Ask Another Question →
                                </button>
                            </Box>
                        </div>

                        <ClientsStrip attrs={a} />
                    </div>
                </div>
            </div>
            <BookCallModal open={booking} onClose={() => setBooking(false)} topic={`Kickoff: ${sprint.title} (${order.reference})`} title="Book Kickoff Call" />
        </>
    );
}
