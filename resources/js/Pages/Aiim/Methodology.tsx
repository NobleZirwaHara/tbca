import { Link } from '@inertiajs/react';
import { Chip, levelTone } from '@/Components/Aiim/Chips';
import AiimPage, { SectionCard } from '@/Components/Aiim/Shell';
import { SimpleTable } from '@/Components/ui/Kit';
import type { AiimPageProps, SourceItem } from '@/types/aiim';

interface Props extends AiimPageProps {
    grades: { grade: string; label: string; range: string; meaning: string }[];
    tiers: { tier: number; name: string; model: string; examples: string }[];
    verification: Record<string, string>;
    threshold: number;
    sources: SourceItem[];
    counts: Record<string, number>;
}

export default function Methodology({ grades, tiers, verification, threshold, sources, counts }: Props) {
    return (
        <AiimPage
            title="Sources, Confidence & Methodology"
            crumbs={[{ label: 'Sources & Evidence' }]}
            subtitle="Every visible insight carries source, date, confidence, verification and next review."
            description={`AIIM currently publishes ${counts.projects} opportunities and projects, ${counts.organisations} investors and funders, ${counts.corridors} corridors and ${counts.briefs} premium briefs for South Africa.`}
            rail={false}
        >
            <div className="grid gap-4 lg:grid-cols-3">
                <SectionCard title="Confidence Grades" className="lg:col-span-2">
                    <SimpleTable columns={['Grade', 'Label', 'Range', 'Meaning']} rows={grades.map((g) => [<strong key="g">{g.grade}</strong>, <Chip key="l" tone={levelTone(g.label)}>{g.label}</Chip>, g.range, g.meaning])} />
                    <p className="mt-3 text-xs text-ink-500">Sellability threshold: premium objects below <strong>{threshold}%</strong> confidence are displayed for orientation only and cannot be sold (coverage warning).</p>
                </SectionCard>
                <SectionCard title="Verification States">
                    <ol className="space-y-1.5 text-sm">{Object.values(verification).map((v, i) => <li key={v}><span className="mr-2 text-gold-600">{i + 1}.</span>{v}</li>)}</ol>
                </SectionCard>
            </div>
            <SectionCard title="Source Tiers" className="mt-4">
                <SimpleTable columns={['Tier', 'Name', 'Confidence Model', 'Examples']} rows={tiers.map((t) => [t.tier, t.name, t.model, t.examples])} />
            </SectionCard>
            <SectionCard title="Approved Source Register" className="mt-4">
                <SimpleTable
                    columns={['Source', 'Provider', 'Tier', 'Coverage', 'Confidence', 'Verification', 'Updated']}
                    rows={sources.map((s) => [<Link key="n" href={`/aiim/sources/${s.code}`} className="text-gold-700 hover:underline">{s.name}</Link>, s.provider, `T${s.tier} ${s.tierName}`, s.coverage, `${s.confidence}% (${s.grade.grade})`, <Chip key="v" tone={levelTone(s.verification)}>{s.verification}</Chip>, s.updated])}
                />
            </SectionCard>
        </AiimPage>
    );
}
