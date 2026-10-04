import { Head, Link } from '@inertiajs/react';
import { BadgeCheck, CalendarDays, ChevronRight, CircleCheck, CreditCard, Download, FileText, HelpCircle, Library, Lock, Receipt, RefreshCw, ShieldCheck, TriangleAlert, Wallet } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { DpCover, FLOW_TRUST, Meta, TrustBand } from '@/Components/Products/Digital/Ui';
import { openAskQuestion } from '@/Components/AskQuestion';
import { zar } from './PaymentStatus';
import type { DpOrder } from '@/Components/Products/Digital/types';

export default function Confirmed({ order, payment, email }: { order: DpOrder; payment: { method: string; date: string }; email: string }) {
    const first = order.entitlements[0];

    return (
        <>
            <Head title="Purchase Confirmed" />
            <div className="container-tbca space-y-5 py-6">
                <Breadcrumbs items={[{ label: 'Digital Products', href: '/digital-products' }, { label: `Order ${order.reference}` }, { label: 'Purchase Confirmed' }]} />
                <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <CircleCheck className="size-14 shrink-0 text-verified-500" aria-hidden="true" />
                            <div>
                                <h1 className="font-serif text-3xl font-semibold text-ink-900">Purchase Confirmed!</h1>
                                <p className="text-sm text-ink-700">Thank you. Your payment has been verified and your entitlement is now active.</p>
                            </div>
                        </div>
                        <p className="flex gap-3 rounded-[8px] border border-verified-500/30 bg-verified-50 p-3 text-xs text-verified-800">
                            <Lock className="size-5 shrink-0" aria-hidden="true" />
                            <span><strong className="block">Your digital product is ready</strong>You can download your product now from your library or the download section below.</span>
                        </p>
                        <div className="grid grid-cols-2 gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 sm:grid-cols-5">
                            <Meta icon={Receipt} label="Order Reference" value={order.reference} />
                            <Meta icon={BadgeCheck} label="Payment Status" value={<span className="text-verified-600">Paid</span>} />
                            <Meta icon={CalendarDays} label="Payment Date" value={payment.date} />
                            <Meta icon={Wallet} label="Amount Paid" value={<>{zar(order.total)}<span className="block text-[0.6875rem] text-ink-500">(VAT inclusive)</span></>} />
                            <Meta icon={CreditCard} label="Payment Method" value={payment.method} />
                        </div>

                        {order.entitlements.map((e) => (
                            <section key={e.reference} className="rounded-[8px] border border-parchment-400 bg-white p-4">
                                <h2 className="mb-3 font-serif text-lg font-semibold text-ink-900">What You Have Acquired</h2>
                                <div className="grid gap-4 md:grid-cols-[160px_1fr]">
                                    <DpCover name={e.product.name} type={e.product.type} tone={e.product.tone} />
                                    <div>
                                        <p className="text-base font-semibold text-ink-900">{e.product.name}</p>
                                        <p className="text-xs text-ink-600">{e.product.tagline}</p>
                                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                            <Meta icon={ShieldCheck} label="Licence" value={e.licenceLabel} />
                                            <Meta label="Language" value={e.languageLabel} />
                                            <Meta label="Maintenance" value={e.maintenanceStatus === 'active' ? 'Yes' : 'No'} />
                                            <Meta label="Version" value={e.version?.display ?? '—'} />
                                            <Meta label="Jurisdiction" value={e.jurisdiction} />
                                            <Meta label="Updates Included" value={e.updatesIncluded} />
                                            <Meta label="Format" value={e.format} />
                                            <Meta label="Verified as at" value={e.version?.verifiedAt ?? '—'} />
                                            <Meta label="Support" value={e.product.support} />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 grid gap-3 rounded-[6px] border border-gold-200 bg-gold-50 p-3 text-xs sm:grid-cols-3">
                                    <p><span className="font-semibold text-ink-500">Entitlement ID</span><span className="block font-semibold text-gold-700">{e.reference}</span>Use this ID when contacting support.</p>
                                    <p><span className="font-semibold text-ink-500">Access Type</span><span className="block font-semibold text-ink-900">Instant Access</span>Available immediately after payment.</p>
                                    <p><span className="font-semibold text-ink-500">Download access until</span><span className="block font-semibold text-ink-900">{e.accessExpires}</span>We will notify you of updates.</p>
                                </div>
                                <Link href={`/digital-products/library/${e.reference}`} className="mt-3 inline-flex h-10 items-center gap-2 rounded-[4px] bg-gold-500 px-4 text-sm font-semibold text-ink-900">
                                    <Download className="size-4" aria-hidden="true" /> Download Your Product
                                </Link>
                            </section>
                        ))}

                        <section className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <p className="flex gap-3 text-xs text-ink-600">
                                <FileText className="size-6 text-gold-600" aria-hidden="true" />
                                <span><strong className="block text-sm text-ink-900">Order Summary</strong>A detailed receipt has been emailed to <strong>{email}</strong></span>
                            </p>
                            <a href={`/digital-products/order/${order.reference}/receipt`} className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-gold-500 px-3 text-xs font-semibold">
                                <Download className="size-4" aria-hidden="true" /> Download Receipt (PDF)
                            </a>
                        </section>
                    </div>

                    <aside className="space-y-4">
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Your Next Steps</h2>
                            <ul className="divide-y divide-parchment-300 text-xs">
                                {[
                                    { icon: Download, t: 'Download Your Product', b: 'Get the files you are licensed to use.', href: first ? `/digital-products/library/${first.reference}` : '/digital-products/library' },
                                    { icon: Library, t: 'Go to My Library', b: 'View all your digital products and versions.', href: '/digital-products/library' },
                                    { icon: RefreshCw, t: 'Check for Updates', b: 'See if a newer version is available.', href: first ? `/digital-products/library/${first.reference}/updates` : '/digital-products/library' },
                                ].map(({ icon: Icon, t, b, href }) => (
                                    <li key={t}>
                                        <Link href={href} className="flex items-center gap-3 py-2.5">
                                            <Icon className="size-5 text-gold-600" aria-hidden="true" />
                                            <span className="flex-1"><strong className="block text-ink-900">{t}</strong>{b}</span>
                                            <ChevronRight className="size-4" aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <button type="button" onClick={() => openAskQuestion({ subject: `Support for ${order.reference}`, section: 'digital-products' })} className="flex w-full items-center gap-3 py-2.5 text-left">
                                        <HelpCircle className="size-5 text-gold-600" aria-hidden="true" />
                                        <span className="flex-1"><strong className="block text-ink-900">Need Human Support?</strong>Ask a question or request advisory help.</span>
                                        <ChevronRight className="size-4" aria-hidden="true" />
                                    </button>
                                </li>
                            </ul>
                        </section>
                        {first && (
                            <section className="rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4 text-xs text-ink-700">
                                <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900"><ShieldCheck className="size-5 text-controlled-700" aria-hidden="true" />Version Covenant</h2>
                                <p className="mt-1">You are licensed to use {first.version?.display} as at {first.version?.verifiedAt}.</p>
                                <p className="mt-1">
                                    Check the <Link href={`/digital-products/library/${first.reference}/version-status`} className="font-semibold underline">Version Status</Link> page regularly to ensure you are working with the current controlled version.
                                </p>
                            </section>
                        )}
                        <section className="rounded-[8px] border border-gold-300 bg-gold-50 p-4 text-xs text-ink-700">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900"><TriangleAlert className="size-5 text-gold-700" aria-hidden="true" />Important Reminders</h2>
                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                <li>Keep your licence terms and this confirmation for your records.</li>
                                <li>You may not share, resell or distribute beyond your licensed rights.</li>
                                <li>Refunds are subject to our Refund & Download Policy.</li>
                            </ul>
                            <Link href="/digital-products/library/refund-and-issue" className="mt-2 inline-block font-semibold text-gold-700 underline">View Refund & Download Policy →</Link>
                        </section>
                    </aside>
                </div>
                <TrustBand items={FLOW_TRUST} />
            </div>
        </>
    );
}
