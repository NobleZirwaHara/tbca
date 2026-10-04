import type { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import { FileText, Headphones, UserRound } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import { Card, DdHero, SampleBanner, TrustIcons } from './Ui';
import type { DdCasePageProps } from '@/types/due-diligence';

const NAV: { key: string; label: string; show?: (p: DdCasePageProps) => boolean }[] = [
    { key: '', label: 'Dashboard' },
    { key: 'overview', label: 'Overview' },
    { key: 'subject', label: 'Subject' },
    { key: 'consent', label: 'Consent' },
    { key: 'evidence', label: 'Evidence' },
    { key: 'missing', label: 'Missing Info' },
    { key: 'checks', label: 'Checks' },
    { key: 'risk', label: 'Risk Flags' },
    { key: 'review', label: 'Review' },
    { key: 'partner-review', label: 'Partner Review', show: (p) => ['partner_review', 'report_draft', 'approved_for_release', 'delivered', 'disputed', 'monitoring', 'closed'].includes(p.case.status) },
    { key: 'report-status', label: 'Report QA' },
    { key: 'report-ready', label: 'Report', show: (p) => p.case.counts.hasFinal },
    { key: 'dispute', label: 'Disputes', show: (p) => p.case.counts.hasFinal },
    { key: 'monitoring-offer', label: 'Monitoring', show: (p) => p.case.counts.hasFinal },
    { key: 'vdr', label: 'VDR' },
    { key: 'close', label: 'Close' },
];

/** Frame for every client case workspace screen (DD-031 to DD-051). */
export default function CaseLayout({
    page,
    active,
    title,
    subtitle,
    description,
    children,
    aside,
    role = 'Client',
    roleNote,
    actions,
    bandNote,
    wide = false,
}: {
    page: DdCasePageProps;
    active: string;
    title: string;
    subtitle: string;
    description?: string;
    children: ReactNode;
    aside?: ReactNode;
    role?: string;
    roleNote?: string;
    actions?: ReactNode;
    bandNote?: ReactNode;
    wide?: boolean;
}) {
    const c = page.case;
    const base = `/due-diligence/cases/${c.reference}`;
    const ask = () => openAskQuestion({ subject: `Case ${c.reference}`, section: 'due-diligence' });

    return (
        <>
            <Head title={`${title} · ${c.reference}`} />
            <DdHero
                crumbs={[{ label: 'Due Diligence', href: '/due-diligence' }, { label: 'My Cases', href: '/due-diligence/cases' }, { label: title }]}
                title={title}
                subtitle={subtitle}
                description={description}
                chips={c.chips}
                journey={page.journey}
                current={c.step}
                completed={c.status === 'closed' ? 7 : c.step - 1}
            />
            <nav aria-label="Case sections" className="border-b border-parchment-400 bg-white">
                <div className="container-tbca flex gap-1 overflow-x-auto">
                    {NAV.filter((n) => !n.show || n.show(page)).map((n) => (
                        <Link
                            key={n.key}
                            href={n.key ? `${base}/${n.key}` : base}
                            aria-current={active === n.key ? 'page' : undefined}
                            className={cn('-mb-px shrink-0 border-b-2 px-3 py-3 text-[0.8125rem] font-medium whitespace-nowrap', active === n.key ? 'border-gold-500 text-gold-700' : 'border-transparent text-ink-500 hover:text-ink-900')}
                        >
                            {n.label}
                            {n.key === 'risk' && c.counts.openFlags > 0 && <span className="ml-1 rounded-full bg-risk-500 px-1.5 text-[0.625rem] text-white">{c.counts.openFlags}</span>}
                            {n.key === 'review' && c.counts.openRequests > 0 && <span className="ml-1 rounded-full bg-attested-500 px-1.5 text-[0.625rem] text-white">{c.counts.openRequests}</span>}
                        </Link>
                    ))}
                </div>
            </nav>

            <section className="bg-parchment-100 py-6">
                <div className="container-tbca space-y-5">
                    <SampleBanner
                        title={<>{c.isSample ? 'Illustrative Sample Case: ' : ''}{c.caseName}</>}
                        note={<>{c.reference} · {c.package} · Status: <strong>{c.statusLabel}</strong>{c.isSample ? ' · ILLUSTRATIVE SAMPLE CASE | SYNTHETIC DATA ONLY' : ''}</>}
                        sample={c.isSample}
                    />
                    <div className={cn('grid gap-5', !wide && 'lg:grid-cols-12')}>
                        <div className={cn('min-w-0 space-y-5', !wide && 'lg:col-span-8 xl:col-span-9')}>{children}</div>
                        {!wide && (
                            <aside className="space-y-4 lg:col-span-4 xl:col-span-3">
                                <Card>
                                    <p className="flex items-center gap-2 text-sm font-semibold"><UserRound className="size-4 text-gold-600" aria-hidden="true" /> Your role: {role}</p>
                                    <p className="mt-1 text-xs text-ink-500">{roleNote ?? 'Complete required actions to keep your case moving.'}</p>
                                </Card>
                                {aside}
                                <Card title="Need help?">
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link href={`${base}/overview`} className="inline-flex items-center justify-center gap-1 rounded border border-parchment-400 px-2 py-2 text-xs hover:border-gold-500"><FileText className="size-3.5" aria-hidden="true" /> View Scope</Link>
                                        <button type="button" onClick={ask} className="inline-flex items-center justify-center gap-1 rounded border border-parchment-400 px-2 py-2 text-xs hover:border-gold-500"><Headphones className="size-3.5" aria-hidden="true" /> Ask Case Manager</button>
                                    </div>
                                    <p className="mt-2 text-[0.6875rem] text-ink-500">{page.coordinator.name} · {page.coordinator.email}</p>
                                </Card>
                            </aside>
                        )}
                    </div>
                </div>
            </section>

            <section className="bg-ink-950 text-parchment-100">
                <div className="container-tbca flex flex-col gap-4 py-5 lg:flex-row lg:items-center">
                    <div className="grid flex-1 gap-4 sm:grid-cols-3">
                        <div><p className="text-xs text-ink-300">Current status</p><p className="text-sm font-semibold"><span className="rounded bg-verified-500/20 px-1.5 text-verified-300">{c.chips[2]?.value.split(' · ')[0]}</span> {c.statusLabel}</p></div>
                        <div><p className="text-xs text-ink-300">Stage progress</p><p className="text-sm font-semibold">{c.status === 'closed' ? 7 : c.step - 1} of 7 complete · <span className="text-gold-400">{page.journey[c.step - 1]?.label}</span></p></div>
                        <div><p className="text-xs text-ink-300">Payment</p><p className="text-sm font-semibold">{c.chips[4]?.value} · {bandNote ?? 'No additional fee applies.'}</p></div>
                    </div>
                    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
                    <TrustIcons dark />
                </div>
            </section>
        </>
    );
}

export function AskButton({ reference, label = 'Ask Case Manager' }: { reference: string; label?: string }) {
    return (
        <Button type="button" variant="outline-light" onClick={() => openAskQuestion({ subject: `Case ${reference}`, section: 'due-diligence' })}>
            {label}
        </Button>
    );
}
