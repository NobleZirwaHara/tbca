import { Head, Link } from '@inertiajs/react';
import { BadgeCheck, CalendarDays, CheckCircle2, ChevronRight, Hourglass, Info, Mail, Package, ShieldCheck, UserRound } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { ShopCrumbs, SideCard, TrustStrip, zar } from '@/Components/Shop/Bits';
import { HelpCard, OrderReferenceCard, OrderSummaryCard } from '@/Components/Shop/CheckoutParts';
import type { Order } from '@/types';

interface Ent { reference: string; name: string; item_code: string; type: string; authority: string; status: string; starts_at: string | null; ends_at: string | null; variant: string | null }
interface Props { order: Order; status: string; entitlements: Ent[]; postings: { ledger: string; amount_zar: number; qbo_reference: string; status: string }[]; activatedAt: string | null }

const fmt = (iso?: string | null, time = false) => (iso ? new Date(iso).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', ...(time ? { hour: '2-digit', minute: '2-digit', second: '2-digit' } : {}) }) : '-');
const LEDGER: Record<string, string> = { T: 'T - TBCA consideration', X: 'X - Pass-through', S: 'S - Tax / statutory', C: 'C - Credit / adjustment' };

export default function Entitlements({ order, status, entitlements, postings, activatedAt }: Props) {
    const complete = status === 'matched';

    return (
        <>
            <Head title="Entitlement Activation" />
            <div className="container-tbca py-6">
                <ShopCrumbs tone="light" items={[{ label: 'Online Shop', href: '/shop' }, { label: 'Order Confirmation', href: `/checkout/${order.reference}/confirmation` }, { label: 'Entitlement Activation' }]} />
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="min-w-0 space-y-5 lg:col-span-8">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <h1 className="flex items-center gap-2 font-serif text-[1.875rem] font-semibold text-ink-900"><CheckCircle2 className="size-7 text-verified-700" aria-hidden="true" /> Entitlement Activation</h1>
                                <p className="text-sm text-ink-600">Your access and entitlements are being activated.</p>
                            </div>
                            <div className="flex gap-2"><ButtonLink href={`/checkout/${order.reference}/confirmation`} variant="outline" size="sm">View Order</ButtonLink><Link href="/portal" className="inline-flex h-9 items-center rounded-[4px] bg-verified-700 px-4 text-sm font-semibold text-white">Go to Client Portal</Link></div>
                        </div>

                        <div className="grid gap-5 rounded-[10px] border border-verified-500/40 bg-verified-50/60 p-5 md:grid-cols-3">
                            <div className="flex items-center gap-3">{complete ? <CheckCircle2 className="size-12 shrink-0 text-verified-700" /> : <Hourglass className="size-12 shrink-0 text-attested-700" />}<p className="font-semibold text-ink-900">{complete ? 'All entitlements activated successfully!' : 'Activation in progress'}<span className="block text-xs font-normal text-ink-600">{complete ? 'Your access is now ready.' : 'Ledger posting or entitlement issue is pending.'}</span></p></div>
                            <dl className="text-sm md:border-l md:border-verified-500/30 md:pl-5"><dt className="text-xs text-ink-500">Order Reference</dt><dd className="font-mono text-lg font-bold text-verified-700">{order.reference}</dd><dt className="mt-1 text-xs text-ink-500">Activated On</dt><dd>{fmt(activatedAt, true)}</dd></dl>
                            <div className="md:border-l md:border-verified-500/30 md:pl-5"><p className="text-xs text-ink-500">Activation Status</p><p className="text-lg font-semibold text-verified-700">{complete ? 'Complete' : 'Pending'}</p><p className="text-xs text-ink-600">{complete ? 'All purchased entitlements are now active and ready to use.' : 'We will notify you once access is ready.'}</p></div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-[1fr_16rem]">
                            <SideCard title="Your Activated Entitlements">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[480px] text-left text-[0.8125rem]">
                                        <thead className="text-xs text-ink-500"><tr><th className="py-1.5">Entitlement</th><th>Access / Delivery</th><th>Status</th><th><span className="sr-only">Open</span></th></tr></thead>
                                        <tbody className="divide-y divide-parchment-300">
                                            {entitlements.map((e) => (
                                                <tr key={e.reference}>
                                                    <td className="py-3"><p className="flex items-center gap-2 font-semibold text-ink-900"><Package className="size-4 text-referenced-500" />{e.name}</p><p className="text-xs text-ink-500">{e.type}{e.variant && ` · ${e.variant}`}</p><p className="font-mono text-[0.6875rem] text-ink-400">{e.reference}</p></td>
                                                    <td className="text-xs">Access via Client Portal<br /><span className="text-ink-500">{fmt(e.starts_at)}{e.ends_at && ` - ${fmt(e.ends_at)}`} · {e.authority.replace(/_/g, ' ')}</span></td>
                                                    <td><StatusPill status={e.status} /></td>
                                                    <td><Link href="/portal" aria-label={`Open ${e.name} in portal`}><ChevronRight className="size-4 text-ink-400" /></Link></td>
                                                </tr>
                                            ))}
                                            <tr><td className="py-3"><p className="flex items-center gap-2 font-semibold"><UserRound className="size-4 text-controlled-500" />Named Account Manager</p><p className="text-xs text-ink-500">TBCA Advisory Team</p></td><td className="text-xs">You will be contacted within 1 business day to introduce your advisory team.</td><td><StatusPill status={complete ? 'active' : 'pending'} /></td><td /></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </SideCard>
                            <SideCard title="What happens next?">
                                <ul className="space-y-3 text-xs">
                                    {[[Mail, 'Welcome Email', 'You will receive a welcome email with login and access details.'], [UserRound, 'Advisory Introduction', 'Your account manager will contact you to schedule an introduction.'], [Package, 'Access & Delivery', 'You can now access your dashboard and services.'], [BadgeCheck, 'Ongoing Support', 'We are here to support you throughout.']].map(([I, t, b]) => { const Icon = I as typeof Mail; return <li key={String(t)} className="flex gap-2"><Icon className="size-4 shrink-0 text-controlled-700" /><span><strong className="block text-ink-900">{String(t)}</strong>{String(b)}</span></li>; })}
                                </ul>
                            </SideCard>
                        </div>

                        <SideCard title="Ledger Postings (QuickBooks Online Plus)">
                            {postings.length === 0 ? <p className="text-sm text-ink-500">Posting pending.</p> : (
                                <ul className="grid gap-2 sm:grid-cols-2">{postings.map((p) => <li key={p.ledger} className="flex justify-between rounded-[6px] border border-parchment-400 p-2.5 text-xs"><span>{LEDGER[p.ledger] ?? p.ledger}<span className="block font-mono text-ink-400">{p.qbo_reference}</span></span><span className="text-right font-semibold">{zar(p.amount_zar)}<span className="block font-normal text-verified-700">{p.status}</span></span></li>)}</ul>
                            )}
                        </SideCard>
                        <div className="flex gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4 text-xs text-ink-700"><ShieldCheck className="size-5 shrink-0 text-gold-700" /><p><strong className="block text-sm text-ink-900">Secure & Trusted</strong>Your data and transactions are protected with bank-grade security and PCI DSS compliant encryption.</p></div>
                    </div>
                    <aside className="space-y-4 lg:col-span-4">
                        <OrderSummaryCard order={order} />
                        <div className="flex gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4 text-xs"><Info className="size-5 shrink-0 text-controlled-700" /><div><p className="text-[0.8125rem] font-semibold text-ink-900">Access Information</p><p>You can access your products and services in your Client Portal.</p><Link href="/portal" className="mt-2 inline-flex h-8 items-center rounded-[4px] border border-controlled-500 px-3 font-semibold text-controlled-700">Go to Client Portal →</Link></div></div>
                        <HelpCard body="Our advisors are here to help if you have any questions." />
                        <OrderReferenceCard reference={order.reference} note="Keep this number for your records." />
                        <p className="flex items-center gap-1 text-xs text-ink-400"><CalendarDays className="size-3.5" /> Order placed {fmt(order.created_at, true)}</p>
                    </aside>
                </div>
            </div>
            <TrustStrip />
        </>
    );
}
