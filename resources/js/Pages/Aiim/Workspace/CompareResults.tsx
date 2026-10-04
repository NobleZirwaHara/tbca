import { Link } from '@inertiajs/react';
import { BarChart3, Bell, Download, FileText, Info, Pencil, ShieldCheck, Trophy } from 'lucide-react';
import ComparisonTable from '@/Components/Aiim/ComparisonTable';
import AiimPage, { DeeperBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, ComparisonData } from '@/types/aiim';

interface Props extends AiimPageProps {
    comparison: ComparisonData & { reference: string; generated: string; saved: boolean };
}

const icons = { trophy: Trophy, 'bar-chart-3': BarChart3, 'shield-check': ShieldCheck, info: Info } as const;

export default function CompareResults({ comparison: c }: Props) {
    return (
        <AiimPage
            title="Comparison Results"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Comparison Builder', href: '/aiim/workspace/compare' }, { label: 'Results' }]}
            subtitle={`Side-by-side comparison of ${c.columns.length} items across ${c.rows.length} key investment metrics.`}
            description={`Generated on ${c.generated} · Set ${c.reference}`}
            actions={
                <div className="flex flex-wrap gap-2">
                    <a href={`/aiim/workspace/compare/${c.reference}/export`} className="inline-flex h-9 items-center gap-1.5 rounded border border-ink-300 px-3 text-sm hover:border-ink-900"><Download className="size-4" />Export Report</a>
                    <ButtonLink href={`/aiim/workspace/compare?set=${c.reference}`} size="sm" icon="layers">Modify Comparison</ButtonLink>
                </div>
            }
            rail={<><SelectionBox /><DeeperBox /></>}
        >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_16rem]">
                <section className="min-w-0 rounded-[8px] border border-parchment-400 bg-white">
                    <ComparisonTable data={c} showOverall />
                    <p className="flex flex-wrap gap-4 border-t border-parchment-300 px-3 py-2 text-[0.6875rem] text-ink-500"><span>★ Top score in this metric</span><span>Scores are indicative decision support based on selected metrics, not a valuation.</span></p>
                </section>
                <div className="space-y-4">
                    <SectionCard title="Summary Insights">
                        <ul className="space-y-3 text-xs">
                            {c.insights.map((i) => {
                                const I = icons[i.icon as keyof typeof icons] ?? Info;
                                return <li key={i.name} className="flex gap-2"><I className="size-4 shrink-0 text-verified-500" /><span><strong className="text-verified-700">{i.name}</strong> {i.text}</span></li>;
                            })}
                        </ul>
                    </SectionCard>
                    <SectionCard title="What Would You Like To Do Next?">
                        <ul className="space-y-2 text-xs">
                            <li><Link href="/aiim/fees/discover" className="flex gap-2 hover:text-gold-700"><FileText className="size-4 text-gold-600" /><span><strong className="block">Create a detailed report</strong>Generate a report in PDF or CSV</span></Link></li>
                            <li><a href={`/aiim/workspace/compare/${c.reference}/export`} className="flex gap-2 hover:text-gold-700"><Download className="size-4 text-gold-600" /><span><strong className="block">Export comparison</strong>Saved to your workspace as {c.reference}</span></a></li>
                            <li><Link href="/aiim/workspace/watchlist" className="flex gap-2 hover:text-gold-700"><Bell className="size-4 text-gold-600" /><span><strong className="block">Set watchlist alert</strong>Get updates on these items</span></Link></li>
                            <li><Link href={`/aiim/workspace/compare?set=${c.reference}`} className="flex gap-2 hover:text-gold-700"><Pencil className="size-4 text-gold-600" /><span><strong className="block">Refine comparison</strong>Add, remove or change items</span></Link></li>
                        </ul>
                    </SectionCard>
                </div>
            </div>
        </AiimPage>
    );
}
