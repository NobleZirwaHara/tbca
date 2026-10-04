import { Head, Link } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';
import { ReferenceChip, StatusPill, Stepper } from '@/Components/ui/Kit';
import { ProviderShell } from '@/Components/Marketplace/Shells';
import { Card, InfoRows } from '@/Components/Marketplace/ui';
import type { MkDispute } from '@/types/marketplace';

export default function GrievanceShow({ dispute: d }: { dispute: MkDispute }) {
    const timeline = (d.meta.timeline ?? []) as { at: string; title: string; body: string }[];
    return (
        <ProviderShell crumbs={[{ label: 'Provider Dashboard', href: '/marketplace/provider/dashboard' }, { label: d.reference }]} title={d.kind === 'appeal' ? 'Appeal Submitted' : 'Grievance Submitted'} badge={<StatusPill status={d.status} />}>
            <Head title={d.reference} />
            <Stepper steps={['Details', 'Supporting Information', 'Review & Confirm', 'Submission', 'Acknowledgement']} current={d.status === 'raised' ? 5 : 6} className="mb-5" />
            <div className="grid gap-5 lg:grid-cols-12">
                <Card className="lg:col-span-7" title="Acknowledgement">
                    <p className="flex items-center gap-2 text-verified-700"><CheckCircle2 className="size-5" aria-hidden="true" /> Received. Reference <ReferenceChip value={d.reference} /></p>
                    <p className="mt-2 text-sm text-ink-600">TBCA will acknowledge within 1 business day (by {d.responseDue}). Initial review follows within 3 business days and a full investigation within 10 business days.</p>
                    <InfoRows className="mt-4" rows={[['Engagement', `${d.engagementRef} – ${d.engagementTitle}`], ['Type', d.type], ['Category', d.category], ['Priority', d.priority], ['Subject', d.subject], ['Description', d.description], ['Outcome sought', d.meta.resolution_sought]]} />
                </Card>
                <Card className="lg:col-span-5" title="Case timeline">
                    <ol className="space-y-3 border-l-2 border-parchment-400 pl-3">{timeline.map((t, i) => <li key={i}><p className="text-xs text-ink-400">{t.at}</p><p className="text-sm font-semibold">{t.title}</p><p className="text-xs text-ink-500">{t.body}</p></li>)}</ol>
                    <Link href="/marketplace/provider/dashboard" className="mt-4 block text-sm font-semibold text-gold-700">← Back to dashboard</Link>
                </Card>
            </div>
        </ProviderShell>
    );
}

GrievanceShow.layout = null;
