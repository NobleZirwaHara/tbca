import { Link } from '@inertiajs/react';
import { Chip, levelTone } from '@/Components/Aiim/Chips';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { DeeperBox, SelectionBox } from '@/Components/Aiim/Shell';
import { Progress, SimpleTable } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, Engagement } from '@/types/aiim';

export default function EngagementIndex({ engagements }: AiimPageProps & { engagements: Engagement[] }) {
    return (
        <AiimPage
            title="My Mandates"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Mandates' }]}
            subtitle="Custom intelligence, advisory and verification engagements."
            actions={<div className="flex gap-2"><ButtonLink href="/aiim/custom-intelligence" size="sm">New Custom Intelligence Request</ButtonLink><ButtonLink href="/aiim/workspace/advisor-request" size="sm" variant="outline">New Advisor Request</ButtonLink></div>}
            rail={<><SelectionBox /><DeeperBox /></>}
        >
            <SimpleTable
                columns={['Reference', 'Title', 'Type', 'Status', 'Progress', 'Fee (ex VAT)', 'Next Step']}
                rows={engagements.map((e) => [
                    <span key="r" className="font-mono">{e.mandate ?? e.reference}</span>, e.title, e.type === 'advisory' ? 'Advisory' : 'Custom Intelligence',
                    <Chip key="s" tone={levelTone(e.statusLabel)}>{e.statusLabel}</Chip>, <Progress key="p" value={e.progress} className="w-24" />, e.fee ? zar2(e.fee) : 'Quote on review',
                    e.next ? <Link key="n" href={e.next.url} className="font-semibold text-gold-700 hover:underline">{e.next.label} →</Link> : '—',
                ])}
                empty="No mandates yet."
            />
        </AiimPage>
    );
}
