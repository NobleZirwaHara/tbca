import { Link, router, usePage } from '@inertiajs/react';
import { Download, FileSearch, Lock, Plus, Scale, ShieldCheck, Sparkles, X } from 'lucide-react';
import AiimIcon from '@/Components/Aiim/AiimIcon';
import { FeeSummary } from '@/Components/Aiim/FeeTable';
import AiimPage, { DeeperBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Button, ButtonLink } from '@/Components/ui/Button';
import type { SharedProps } from '@/types';
import type { AiimPageProps, Card, Totals } from '@/types/aiim';

interface Props extends AiimPageProps {
    items: (Card & { typeLabel: string })[];
    estimate: Totals;
}

export default function FeeDiscovery({ items, estimate, selection }: Props) {
    const authed = Boolean(usePage<SharedProps>().props.auth.user);
    const first = items[0];
    return (
        <AiimPage
            title="Fee Discovery"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Fee Discovery' }]}
            subtitle="Discover transparent fees for the intelligence and outputs you need."
            description="Review fees before you commit. No payment required at this stage."
            rail={<><SelectionBox /><DeeperBox title="Why Upgrade to Premium?" text="Unlock deeper intelligence, advanced analytics, detailed reports and expert support for smarter decisions." /></>}
        >
            <SectionCard title="Your Selections" className="mb-4">
                <dl className="grid gap-3 text-sm sm:grid-cols-5">
                    {[['Country', selection.country], ['Province', selection.province ?? '—'], ['Sector', selection.sector ?? '—'], ['Object Type', first?.typeLabel ?? '—'], ['Item', first?.name ?? '—']].map(([k, v]) => <div key={k}><dt className="text-xs text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
                </dl>
            </SectionCard>
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
                <section className="rounded-[8px] border border-parchment-400 bg-white">
                    <header className="flex items-center justify-between rounded-t-[8px] bg-ink-950 px-4 py-2.5 text-parchment-100">
                        <h2 className="text-sm font-semibold">Selected Items for Pricing</h2>
                        {items.length > 0 && <button type="button" onClick={() => router.post('/aiim/fees/clear')} className="text-xs text-gold-400 underline">Clear All</button>}
                    </header>
                    <ul className="divide-y divide-parchment-300">
                        {items.map((i) => (
                            <li key={`${i.type}-${i.key}`} className="flex items-center gap-3 p-3 text-xs">
                                <span className="flex size-12 shrink-0 items-center justify-center rounded bg-ink-900 text-gold-500"><AiimIcon name={i.icon} /></span>
                                <div className="min-w-0 flex-1"><Link href={i.url} className="text-sm font-semibold hover:text-gold-700">{i.name}</Link><p className="truncate text-ink-500">{i.summary}</p></div>
                                <div className="hidden sm:block"><p className="text-ink-500">Item Type</p><p className="font-semibold">{i.typeLabel}</p></div>
                                <div className="hidden sm:block"><p className="text-ink-500">Access</p><p className="flex items-center gap-1 font-semibold"><Lock className="size-3" />Premium Intelligence</p></div>
                                <button type="button" aria-label={`Remove ${i.name}`} onClick={() => router.delete('/aiim/fees/items', { data: { type: i.type, key: i.key }, preserveScroll: true })} className="text-ink-400 hover:text-risk-500"><X className="size-4" /></button>
                            </li>
                        ))}
                        <li className="p-3">
                            <Link href="/aiim/workspace/saved" className="flex items-center gap-3 rounded border border-dashed border-parchment-500 p-3 text-xs hover:border-gold-500">
                                <Plus className="size-5 text-gold-600" /><span><strong className="block">Add More Items</strong>Search from saved items, search or browse</span>
                            </Link>
                        </li>
                    </ul>
                    <div className="flex flex-wrap gap-3 p-3">
                        {authed ? (
                            <Button type="button" disabled={!items.length} onClick={() => router.post('/aiim/fees/manifest')} trailingIcon="arrow-right">Proceed to Fee Manifest</Button>
                        ) : (
                            <ButtonLink href="/aiim/register" trailingIcon="arrow-right">Register (free) to get a Fee Manifest</ButtonLink>
                        )}
                        <ButtonLink href="/aiim/opportunities" variant="outline" trailingIcon="arrow-right">Continue Exploring</ButtonLink>
                    </div>
                </section>
                <SectionCard title="Estimated Fee Summary" action={<span className="rounded border border-parchment-400 px-2 text-xs">Currency: ZAR</span>}>
                    <FeeSummary {...estimate} />
                    <p className="mt-3 rounded bg-parchment-200 p-2 text-xs text-ink-600">This is an estimate based on your selections. Final fees may vary after scope confirmation.</p>
                    <p className="mt-3 flex items-center gap-2 text-xs text-ink-600"><ShieldCheck className="size-4 text-gold-600" />Transparent. Fair. No surprises. You review. You decide. You pay securely.</p>
                </SectionCard>
                <SectionCard title="What You Get">
                    <ul className="space-y-3 text-xs">
                        {[[Sparkles, 'Premium Intelligence Access', 'Deep insights, analysis and data for each selected item.'], [Scale, 'Comparison Report', 'Side-by-side comparison across key investment metrics.'], [Download, 'Export Options', 'Export results to PDF or CSV for offline use.'], [FileSearch, 'Source & Evidence', 'Cited sources with confidence ratings and last updated date.'], [ShieldCheck, 'Secure & Compliant', 'POPIA compliant platform with bank-grade security.']].map(([I, t, d]) => {
                            const Icon = I as typeof Scale;
                            return <li key={t as string} className="flex gap-2"><Icon className="size-4 shrink-0 text-gold-600" /><span><strong className="block">{t as string}</strong>{d as string}</span></li>;
                        })}
                    </ul>
                    <div className="mt-4 rounded bg-gold-50 p-3 text-xs"><p className="font-semibold">Need something custom?</p><p>Request a custom report or dataset.</p><Link href="/aiim/custom-intelligence" className="mt-1 inline-block font-semibold text-gold-700">Speak to an Advisor →</Link></div>
                </SectionCard>
            </div>
        </AiimPage>
    );
}
