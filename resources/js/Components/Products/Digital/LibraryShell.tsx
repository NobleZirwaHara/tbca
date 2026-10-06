import type { ReactNode } from 'react';
import { ArrowUpCircle, CalendarClock, ChevronRight, Download, Mail, MessageCircle, RefreshCw, Rocket, ShieldCheck, Undo2, KeyRound, TriangleAlert, Lightbulb } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ProductsWorkspaceLayout } from '@/Components/Products/Layouts';
import type { Crumb } from '@/Components/ui/Breadcrumbs';
import { openAskQuestion } from '@/Components/AskQuestion';
import { DpCover, ErrorList, FLOW_TRUST, Meta, TrustBand } from './Ui';
import type { DpEntitlement } from './types';

/** Workspace frame for one entitlement (Screens 11–17) with record-level nav. */
export default function LibraryShell({
    entitlement,
    title,
    description,
    crumb,
    actions,
    children,
}: {
    entitlement?: DpEntitlement;
    title: string;
    description?: ReactNode;
    crumb?: string;
    actions?: ReactNode;
    children: ReactNode;
}) {
    const base = entitlement ? `/digital-products/library/${entitlement.reference}` : '';
    const crumbs: Crumb[] = [
        { label: 'Digital Products', href: '/digital-products' },
        { label: 'My Library', href: '/digital-products/library' },
        ...(entitlement && crumb ? [{ label: entitlement.product.name, href: base }] : []),
        { label: crumb ?? title },
    ];

    return (
        <ProductsWorkspaceLayout
            title={title}
            description={description}
            actions={actions}
            crumbs={crumbs}
            context={
                entitlement
                    ? {
                          title: entitlement.product.name,
                          items: [
                              { label: 'Entitlement & Download', href: base, icon: Download },
                              { label: 'Updates & Corrections', href: `${base}/updates`, icon: RefreshCw },
                              { label: 'Version Status', href: `${base}/version-status`, icon: CalendarClock },
                              { label: 'Licence / Update Upgrade', href: `${base}/upgrade`, icon: ArrowUpCircle },
                              { label: 'Maintained Access', href: `${base}/maintained-access`, icon: ShieldCheck },
                              { label: 'Sprint / Advisory', href: `${base}/next-steps`, icon: Rocket },
                              { label: 'Refund / Issue', href: `/digital-products/library/refund-and-issue?entitlement=${entitlement.reference}`, icon: Undo2 },
                          ],
                      }
                    : undefined
            }
        >
            <ErrorList />
            <div className="space-y-5">
                {children}
                <TrustBand items={FLOW_TRUST} />
            </div>
        </ProductsWorkspaceLayout>
    );
}

/** "Your current entitlement" card used on Screens 13, 14, 16, 17. */
export function EntitlementSummary({ e, extra, title = 'Your Current Entitlement' }: { e: DpEntitlement; extra?: { label: string; value: ReactNode }[]; title?: string }) {
    return (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="mb-3 text-xs font-bold tracking-wide text-ink-900 uppercase">{title}</h2>
            <div className="flex flex-wrap gap-4">
                <DpCover name={e.product.name} type={e.product.type} tone={e.product.tone} className="w-36" />
                <div className="min-w-0 flex-1">
                    <p className="font-serif text-lg font-semibold text-ink-900">{e.product.name}</p>
                    <p className="text-xs text-ink-600">{e.product.tagline}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        <Meta icon={KeyRound} label="Version" value={e.version?.display ?? '—'} />
                        <Meta label="Licence" value={e.licenceLabel} />
                        <Meta label="Language" value={e.languageLabel} />
                        <Meta label="Format" value={e.format} />
                        <Meta label="Jurisdiction" value={e.jurisdiction} />
                    </div>
                </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 rounded-[6px] border border-gold-200 bg-gold-50/60 p-3 sm:grid-cols-5">
                {(extra ?? [
                    { label: 'Purchased', value: e.purchasedAt },
                    { label: 'Order Reference', value: e.orderReference },
                    { label: 'Maintenance', value: e.maintenanceStatus === 'active' ? `Active until ${e.maintenanceUntil}` : <span className="font-semibold text-risk-600 underline">Not Active</span> },
                    { label: 'Updates Included', value: e.updatesIncluded },
                    { label: 'Support', value: e.product.support },
                ]).map((m) => (
                    <div key={m.label}>
                        <dt className="text-[0.6875rem] font-semibold text-ink-500">{m.label}</dt>
                        <dd className="text-xs font-medium text-ink-900">{m.value ?? '—'}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}

export function HelpPanel() {
    return (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Need Help?</h2>
            <ul className="divide-y divide-parchment-300 text-xs">
                <li>
                    <button type="button" onClick={() => openAskQuestion({ subject: 'Digital Products support', section: 'digital-products' })} className="flex w-full items-center gap-3 py-2 text-left">
                        <MessageCircle className="size-5 text-gold-600" aria-hidden="true" />
                        <span className="flex-1"><strong className="block text-ink-900">Ask a Question</strong>Talk to our support team</span>
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </button>
                </li>
                <li>
                    <a href="https://wa.me/27608011365" target="_blank" rel="noreferrer" className="flex items-center gap-3 py-2">
                        <MessageCircle className="size-5 text-verified-500" aria-hidden="true" />
                        <span className="flex-1"><strong className="block text-ink-900">WhatsApp Support</strong>Chat with us on WhatsApp</span>
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </a>
                </li>
                <li>
                    <a href="mailto:support@thebusinessclinic.africa" className="flex items-center gap-3 py-2">
                        <Mail className="size-5 text-gold-600" aria-hidden="true" />
                        <span className="flex-1"><strong className="block text-ink-900">Email Support</strong>support@thebusinessclinic.africa</span>
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </a>
                </li>
            </ul>
        </section>
    );
}

export function Reminders() {
    return (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Important Reminders</h2>
            <ul className="space-y-2.5 text-xs">
                {[
                    [ShieldCheck, 'Keep your licence terms', 'Review your entitlement and permitted uses.'],
                    [TriangleAlert, 'No redistribution', 'Respect your licence. Sharing beyond scope is prohibited.'],
                    [Lightbulb, 'Check for updates', 'Stay current for accuracy, compliance and support.'],
                ].map(([Icon, t, b]) => {
                    const I = Icon as typeof ShieldCheck;
                    return (
                        <li key={t as string} className="flex gap-2">
                            <I className="size-4 shrink-0 text-gold-600" aria-hidden="true" />
                            <span><strong className="block text-ink-900">{t as string}</strong><span className="text-ink-500">{b as string}</span></span>
                        </li>
                    );
                })}
            </ul>
            <Link href="/digital-products/library/refund-and-issue" className="mt-3 inline-block text-xs font-semibold text-gold-700 underline">
                View Refund & Download Policy →
            </Link>
        </section>
    );
}
