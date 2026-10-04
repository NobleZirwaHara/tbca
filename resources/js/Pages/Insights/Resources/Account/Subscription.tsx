import { Link, router } from '@inertiajs/react';
import { BookOpen, ChevronRight, Diamond, Download, FileText, LayoutTemplate, Pause, Play, Receipt, RefreshCw, Settings, Sparkles, XCircle } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Box, Chip, Status, label } from '@/Components/Insights/Shared';
import { AccountNav, PageTitle, ResourceFrame } from '@/Components/Insights/Resources';
import { usePrice } from '@/lib/money';

interface Props {
    subscription: null | { id: number; plan: string; status: string; cycle: string; amountZar: number; startedAt: string; nextBilling: string | null; usage: { downloads: number; downloadsLimit: number; templates: number; templatesLimit: number; reports: number; reportsLimit: number }; periodStart: string; periodEnd: string };
    planZar: number;
    included: string[];
    invoices: { reference: string; status: string; total: number; date: string }[];
}

export default function Subscription({ subscription: s, planZar, included, invoices }: Props) {
    const price = usePrice();
    const manage = (action: string) => {
        if (action === 'cancel' && !window.confirm('Cancel your Premium Resources subscription?')) return;
        router.post(`/resources/account/subscription/${action}`, {}, { preserveScroll: true });
    };
    const usage = s ? [['Downloads', s.usage.downloads, s.usage.downloadsLimit, FileText, 'bg-controlled-500'], ['Templates Used', s.usage.templates, s.usage.templatesLimit, LayoutTemplate, 'bg-verified-500'], ['Reports Generated', s.usage.reports, s.usage.reportsLimit, BookOpen, 'bg-purple-500']] as const : [];

    return (
        <ResourceFrame title="Subscription Management" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Subscription Management' }]}>
            <AccountNav active="subscription" />
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-4">
                    <PageTitle title="Subscription Management" intro="View and manage your active subscriptions, billing details, usage, and preferences." />
                    {!s || s.status === 'cancelled' || s.status === 'awaiting_payment' ? (
                        <Box title="Premium Resources Plan">
                            <p className="text-sm text-ink-600">Access premium guides, templates, tools and exclusive insights for {price(planZar)} / month.</p>
                            {s?.status === 'awaiting_payment' && <p className="mt-2 text-xs text-attested-700">A subscription order is awaiting payment.</p>}
                            {s?.status === 'cancelled' && <p className="mt-2 text-xs text-ink-500">Your previous subscription was cancelled.</p>}
                            <button type="button" onClick={() => router.post('/resources/account/subscription')} className="mt-3 flex items-center gap-2 rounded bg-gold-500 px-4 py-2 text-sm font-bold"><Sparkles className="size-4" /> Subscribe – {price(planZar)}/month</button>
                        </Box>
                    ) : (
                        <>
                            <Box title={<span className="font-serif text-lg">Current Subscription</span>}>
                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <div className="flex size-24 shrink-0 flex-col items-center justify-center rounded bg-gradient-to-br from-purple-700 to-purple-900 text-center text-[0.625rem] font-bold text-white"><Diamond className="mb-1 size-7" />PREMIUM<br />RESOURCES</div>
                                    <div className="flex-1">
                                        <p className="flex items-center gap-2 font-serif text-xl font-semibold">{s.plan} <Status value={s.status} /></p>
                                        <p className="text-xs text-ink-600">Access premium guides, templates, tools and exclusive insights.</p>
                                        <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">{[['Plan', 'Premium Resources'], ['Billing Cycle', s.cycle], ['Next Billing Date', s.nextBilling ?? '—'], ['Amount', `${price(s.amountZar)} / month`]].map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>
                                    </div>
                                </div>
                                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                    <Link href="/resources/free-vs-paid" className="flex items-center justify-center gap-1.5 rounded bg-gold-500 py-2 text-sm font-bold"><RefreshCw className="size-4" /> Change Plan</Link>
                                    {s.status === 'active' ? <button type="button" onClick={() => manage('pause')} className="flex items-center justify-center gap-1.5 rounded border border-parchment-500 py-2 text-sm"><Pause className="size-4" /> Pause Subscription</button> : <button type="button" onClick={() => manage('resume')} className="flex items-center justify-center gap-1.5 rounded border border-parchment-500 py-2 text-sm"><Play className="size-4" /> Resume Subscription</button>}
                                    <button type="button" onClick={() => manage('cancel')} className="flex items-center justify-center gap-1.5 rounded border border-parchment-500 py-2 text-sm"><XCircle className="size-4" /> Cancel Subscription</button>
                                </div>
                            </Box>
                            <Box title={<span className="font-serif text-lg">Your Usage This Period <span className="font-sans text-xs font-normal">({s.periodStart} – {s.periodEnd})</span></span>}>
                                <div className="grid gap-4 sm:grid-cols-3">{usage.map(([l, v, m, I, c]) => <div key={l} className="flex gap-3"><I className="size-10 rounded bg-parchment-200 p-2 text-ink-600" /><div className="flex-1"><p className="text-xs text-ink-500">{l}</p><p className="text-lg font-bold">{v} / {m}</p><div className="h-1.5 rounded-full bg-parchment-300"><div className={`h-full rounded-full ${c}`} style={{ width: `${Math.min(100, (v / m) * 100)}%` }} /></div></div></div>)}</div>
                                <Link href="/resources/account/library" className="mt-3 inline-block text-xs font-semibold text-controlled-700">View Full Usage Analytics →</Link>
                            </Box>
                        </>
                    )}
                    <Box title="What's Included"><ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">{included.map((i) => <li key={i}>✓ {i}</li>)}</ul></Box>
                </div>
                <aside className="space-y-4">
                    <Box title={<span className="font-serif text-lg">Billing Overview</span>}>
                        <dl className="space-y-2 text-xs">{[['Status', s ? <Status key="s" value={s.status} /> : 'No subscription'], ['Member Since', s?.startedAt ?? '—'], ['Next Billing Date', s?.nextBilling ?? '—'], ['Next Amount', s && s.status === 'active' ? price(s.amountZar) : '—'], ['Payment Method', 'Card on file at checkout']].map(([k, v]) => <div key={k as string} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd>{v}</dd></div>)}</dl>
                    </Box>
                    <Box title={<span className="font-serif text-lg">Quick Actions</span>}>
                        <ul className="divide-y divide-parchment-200 text-sm">
                            <li className="py-2"><details><summary className="flex cursor-pointer items-center gap-2"><Receipt className="size-4" />View Invoices</summary><ul className="mt-2 space-y-1 text-xs">{invoices.length === 0 ? <li className="text-ink-400">No invoices yet.</li> : invoices.map((i) => <li key={i.reference} className="flex justify-between"><span>{i.reference} · {i.date}</span><span>{price(i.total)} <Status value={i.status} /></span></li>)}</ul></details></li>
                            <li className="py-2"><Link href="/portal" className="flex items-center gap-2"><Settings className="size-4" />Manage Billing Details<ChevronRight className="ml-auto size-4" /></Link></li>
                            <li className="py-2"><Link href="/resources/account/library" className="flex items-center gap-2"><Download className="size-4" />Usage & Entitlements<ChevronRight className="ml-auto size-4" /></Link></li>
                            <li className="py-2"><button type="button" onClick={() => openAskQuestion({ subject: 'Subscription support', section: 'resources' })} className="flex w-full items-center gap-2">{label('contact_support')}<ChevronRight className="ml-auto size-4" /></button></li>
                        </ul>
                        <Chip className="mt-2" tone="purple">Premium Resources</Chip>
                    </Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
