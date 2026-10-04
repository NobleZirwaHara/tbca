import { Link } from '@inertiajs/react';
import { Activity, Ban, BarChart3, FileCheck2, GitBranch, Layers, MessagesSquare, Scale, ShieldAlert } from 'lucide-react';
import { IndustryAdmin } from '@/Components/Insights/Industries';
import { Stat } from '@/Components/Insights/Shared';

interface Props {
    kpis: { industries: number; subIndustries: number; live: number; unclassified: number; belowFloor: number; blocked: number; regulators: number; queue: number; benchmarksEligible: number; benchmarks: number; flows: number };
}

export default function AdminOverview({ kpis }: Props) {
    const cards = [
        ['Sector Taxonomy Manager', `${kpis.industries} industries · ${kpis.subIndustries} sub-industries`, '/admin/insights/industries/taxonomy', Layers],
        ['Sprint Classification Console', `${kpis.unclassified} awaiting classification`, '/admin/insights/industries/classification', GitBranch],
        ['Complexity & Margin Console', `${kpis.belowFloor} below floor`, '/admin/insights/industries/margin', Scale],
        ['Blocked-SKU Register', `${kpis.blocked} blocked / restricted`, '/admin/insights/industries/blocked', Ban],
        ['Sector Regulator Register', `${kpis.regulators} regulators`, '/admin/insights/industries/regulators', FileCheck2],
        ['Misdeclaration Queue', `${kpis.queue} open cases`, '/admin/insights/industries/misdeclarations', ShieldAlert],
        ['Benchmark Governance', `${kpis.benchmarksEligible} of ${kpis.benchmarks} publishable`, '/admin/insights/industries/benchmarks', BarChart3],
        ['Industry Activation Pipeline', `${kpis.live} industries live (S7–S8)`, '/admin/insights/industries/activation', Activity],
        ['Sector WhatsApp Flow Set', `${kpis.flows} pre-approved flows`, '/admin/insights/industries/whatsapp', MessagesSquare],
    ] as const;

    return (
        <IndustryAdmin title="Industries Governance Overview" badge="Control Tower" description="Canonical taxonomy, classification, pricing controls, regulatory registers and activation for the 17 Industries.">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Stat label="Industries" value={kpis.industries} caption={`${kpis.live} live`} />
                <Stat label="Classification queue" value={kpis.unclassified} tone={kpis.unclassified ? 'amber' : 'green'} />
                <Stat label="Below floor" value={kpis.belowFloor} tone={kpis.belowFloor ? 'red' : 'green'} />
                <Stat label="Misdeclaration cases" value={kpis.queue} tone="amber" />
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {cards.map(([t, s, href, Icon]) => (
                    <li key={href}>
                        <Link href={href} className="flex items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 hover:border-gold-400">
                            <Icon className="size-7 text-gold-700" />
                            <span><strong className="block text-sm">{t}</strong><span className="text-xs text-ink-500">{s}</span></span>
                        </Link>
                    </li>
                ))}
            </ul>
        </IndustryAdmin>
    );
}
