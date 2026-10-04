import { Link } from '@inertiajs/react';
import { Bot, Clock, Download, FileStack, Plus, ShieldCheck, TriangleAlert } from 'lucide-react';
import { CurrentnessChip, Stat, Status, Table, num } from '@/Components/Insights/Shared';
import { ResourceAdmin } from '@/Components/Insights/Resources';
import type { ResourceCard } from '@/types/insights';

interface Props {
    kpis: { total: number; published: number; review: number; due: number; overdue: number; downloads: number; consents: number; requests: number; aiPending: number };
    queue: (ResourceCard & { recordId: string; publishState: string; owner: string | null; updated: string })[];
}

export default function ResourceAdminOverview({ kpis, queue }: Props) {
    return (
        <ResourceAdmin title="Resources Governance Overview" badge="Controlled Content" description="Editorial workflow, currentness, monetisation boundary, consent and AI governance for TBCA Resources."
            actions={<Link href="/admin/insights/resources/records/create" className="flex items-center gap-1.5 rounded bg-gold-500 px-3 py-2 text-xs font-bold"><Plus className="size-4" /> Create New Record</Link>}>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <Stat label="Total Records" value={kpis.total} icon={<FileStack className="size-5" />} />
                <Stat label="Published" value={kpis.published} tone="green" />
                <Stat label="In Review" value={kpis.review} tone="amber" icon={<Clock className="size-5" />} />
                <Stat label="Overdue" value={kpis.overdue} tone="red" icon={<TriangleAlert className="size-5" />} />
                <Stat label="Downloads" value={num(kpis.downloads)} icon={<Download className="size-5" />} />
                <Stat label="AI outputs pending" value={kpis.aiPending} icon={<Bot className="size-5" />} />
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-ink-600"><ShieldCheck className="size-4" /> {kpis.consents} consent records · {kpis.requests} open privacy requests · {kpis.due} resources due for review.</p>
            <h2 className="mt-5 mb-2 font-semibold">Editorial Queue</h2>
            <Table head={['Record', 'Title', 'Type', 'Workflow', 'Currentness', 'Owner', 'Updated', '']}
                rows={queue.map((r) => [r.recordId, <strong key="t">{r.title}</strong>, r.type, <Status key="w" value={r.publishState} />, <CurrentnessChip key="c" value={r.currentness} />, r.owner, r.updated, <Link key="e" href={`/admin/insights/resources/records/${r.slug}/edit`} className="text-xs font-semibold text-gold-700">Open →</Link>])}
                empty="Editorial queue is empty." />
        </ResourceAdmin>
    );
}
