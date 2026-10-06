import { Head, Link } from '@inertiajs/react';
import { Bell, Bookmark, Briefcase, FileText, Mail, MessageCircle, Phone, Scale, Users } from 'lucide-react';
import { Donut } from '@/Components/Aiim/Charts';
import { Chip, levelTone } from '@/Components/Aiim/Chips';
import { WORKSPACE_NAV } from '@/Components/Aiim/Nav';
import { zar2 } from '@/Components/Aiim/format';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { KpiTile, Panel, Progress, SimpleTable } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    kpis: Record<string, number>;
    portfolio: { label: string; value: number }[];
    activity: { action: string; note: string | null; at: string }[];
    mandates: { reference: string; mandate: string | null; title: string; stage: string; status: string; rawStatus: string; progress: number; end: string | null; next: { label: string; url: string } | null }[];
    payment: { value: number; paid: number; balance: number; wallet: number };
    savedRecent: { type: string; name: string; category: string; saved: string; url: string }[];
    watchlists: { label: string; count: number }[];
    advisor: { name: string; title: string; email: string; phone: string } | null;
    lastLogin: string;
}

export default function Dashboard({ kpis, portfolio, activity, mandates, payment, savedRecent, watchlists, advisor, lastLogin }: Props) {
    const paidPct = payment.value ? Math.round((payment.paid / payment.value) * 100) : 0;
    return (
        <ConsoleLayout
            area="AIIM Workspace"
            areaIcon={Briefcase}
            groups={WORKSPACE_NAV}
            crumbs={[{ label: 'AIIM', href: '/aiim' }, { label: 'My Workspace' }, { label: 'Client Dashboard' }]}
            title="Client Dashboard"
            description={`Welcome back. Here's your AIIM workspace overview. Last login ${lastLogin}.`}
            badge={<Chip tone="good">Africa Market (Active)</Chip>}
        >
            <Head title="Client Dashboard | AIIM" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <KpiTile label="Active Mandates" value={kpis.mandates} caption="In progress" icon={<Briefcase className="size-4" />} />
                <KpiTile label="Saved Items" value={kpis.saved} caption="Opportunities, projects & investors" icon={<Bookmark className="size-4" />} />
                <KpiTile label="Comparisons" value={kpis.comparisons} caption="Comparison sets" icon={<Scale className="size-4" />} />
                <KpiTile label="Reports Generated" value={kpis.reports} caption="Paid reports" icon={<FileText className="size-4" />} />
                <KpiTile label="Introductions" value={kpis.introductions} caption="In progress" icon={<Users className="size-4" />} />
                <KpiTile label="Alerts & Updates" value={kpis.alerts} caption="Unread alerts" tone="bad" icon={<Bell className="size-4" />} />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <Panel title="Portfolio Snapshot">{portfolio.length ? <Donut data={portfolio} centre={String(kpis.saved)} sub="Total Items" /> : <p className="text-sm text-ink-500">Save items to build your portfolio.</p>}<Link href="/aiim/workspace/saved" className="mt-3 inline-block text-xs font-semibold text-gold-700">View Full Portfolio →</Link></Panel>
                <Panel title="Recent Activity">
                    <ul className="space-y-2 text-xs">{activity.map((a, i) => <li key={i} className="flex justify-between gap-2"><span><strong className="block text-ink-900">{a.action}</strong>{a.note}</span><span className="shrink-0 text-ink-400">{a.at}</span></li>)}{activity.length === 0 && <li className="text-ink-500">No activity yet.</li>}</ul>
                </Panel>
                <Panel title="My Mandates Overview">
                    <ul className="space-y-2 text-xs">
                        {mandates.map((m) => (
                            <li key={m.reference} className="rounded border border-parchment-300 p-2">
                                <div className="flex justify-between gap-2"><span className="font-semibold text-ink-900">{m.title}</span><Chip tone={levelTone(m.status)}>{m.status}</Chip></div>
                                <p className="text-ink-500">{m.mandate ?? m.reference} · {m.stage}{m.end ? ` · ends ${m.end}` : ''}</p>
                                {m.progress > 0 && <Progress value={m.progress} className="mt-1" />}
                                {m.next && <Link href={m.next.url} className="mt-1 inline-block font-semibold text-gold-700">{m.next.label} →</Link>}
                            </li>
                        ))}
                        {mandates.length === 0 && <li className="text-ink-500">No mandates yet. <Link href="/aiim/custom-intelligence" className="text-gold-700 underline">Request custom intelligence</Link>.</li>}
                    </ul>
                </Panel>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <Panel title="AIIM Usage This Month">
                    <ul className="space-y-3 text-xs">
                        {[['Saved items', kpis.saved, 100], ['Comparison sets', kpis.comparisons, 50], ['Reports', kpis.reports, 50]].map(([l, v, max]) => <li key={l as string}><div className="flex justify-between"><span>{l}</span><span>{v} of {max}</span></div><Progress value={((v as number) / (max as number)) * 100} /></li>)}
                    </ul>
                </Panel>
                <Panel title="Subscription & Entitlements">
                    <p className="text-sm">Current Plan <strong className="text-referenced-700">Standard (Free)</strong></p>
                    <ul className="mt-2 space-y-1 text-xs text-ink-600"><li>✓ Public layers & previews</li><li>✓ Save, compare (4 items) & alerts</li><li>✓ Pay-per-view premium unlocks</li></ul>
                    <Link href="/aiim/workspace/entitlements" className="mt-3 inline-block text-xs font-semibold text-gold-700">Manage Entitlements →</Link>
                </Panel>
                <Panel title="Payment Summary">
                    <p className="text-xs text-ink-500">Engagement value (ex VAT)</p>
                    <p className="text-2xl font-bold text-referenced-700">{zar2(payment.value)}</p>
                    <dl className="mt-2 space-y-1 text-xs">
                        <div className="flex justify-between"><dt>Paid to Date ({paidPct}%)</dt><dd className="font-semibold">{zar2(payment.paid)}</dd></div>
                        <div className="flex justify-between"><dt>Balance Due</dt><dd className="font-semibold">{zar2(payment.balance)}</dd></div>
                        <div className="flex justify-between"><dt>Wallet credits</dt><dd className="font-semibold">{zar2(payment.wallet)}</dd></div>
                    </dl>
                    <div className="mt-3 flex gap-2"><ButtonLink href="/aiim/wallet" size="sm">Wallet</ButtonLink><ButtonLink href="/aiim/workspace/engagements" size="sm" variant="outline">Transaction Ledger</ButtonLink></div>
                </Panel>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <Panel title="Saved Recently" className="lg:col-span-2">
                    <SimpleTable columns={['Type', 'Name', 'Category', 'Saved On']} rows={savedRecent.map((s) => [s.type, <Link key="n" href={s.url} className="text-gold-700 hover:underline">{s.name}</Link>, s.category, s.saved])} empty="Nothing saved yet." />
                </Panel>
                <div className="space-y-4">
                    <Panel title="Watchlists Snapshot"><ul className="space-y-1 text-sm">{watchlists.map((w) => <li key={w.label} className="flex justify-between"><span>{w.label}</span><span className="text-ink-500">{w.count} items</span></li>)}</ul></Panel>
                    {advisor && (
                        <Panel title="Need Human Assistance?">
                            <p className="font-semibold">{advisor.name}</p>
                            <p className="text-xs text-referenced-700">{advisor.title}</p>
                            <div className="mt-2 flex gap-3 text-gold-700"><a href={`mailto:${advisor.email}`} aria-label="Email advisor"><Mail className="size-4" /></a><a href={`tel:${advisor.phone}`} aria-label="Call advisor"><Phone className="size-4" /></a><Link href="/aiim/workspace/advisor-request" aria-label="Message"><MessageCircle className="size-4" /></Link></div>
                            <ButtonLink href="/aiim/workspace/advisor-request" size="sm" variant="outline" className="mt-3">Book a Call</ButtonLink>
                        </Panel>
                    )}
                </div>
            </div>
        </ConsoleLayout>
    );
}

Dashboard.layout = null;
