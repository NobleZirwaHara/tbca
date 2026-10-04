import { AlertTriangle } from 'lucide-react';
import { CompareButton, FeeButton, ListToggle } from '@/Components/Aiim/Actions';
import { ScoreRing } from '@/Components/Aiim/Charts';
import { Chip, EvidenceStrip } from '@/Components/Aiim/Chips';
import AiimPage, { DeeperBox, RailBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, CorridorItem } from '@/types/aiim';
import { ModeIcons } from './CorridorSearch';

export default function CorridorShow({ corridor: c, saved }: AiimPageProps & { corridor: CorridorItem; saved: string[] }) {
    const stops = c.route.split(/\s[–-]\s/);
    return (
        <AiimPage
            title={c.name}
            crumbs={[{ label: 'Trade Corridors', href: '/aiim/corridors' }, { label: c.name }]}
            subtitle={c.countries}
            description={`${c.agreement} · ${c.type} corridor · Destination: ${c.region}`}
            actions={<ButtonLink href="/aiim/corridors" size="sm" variant="outline">Back to Results</ButtonLink>}
            rail={
                <>
                    <SelectionBox />
                    <RailBox title="Quick Actions">
                        <ListToggle list="watchlist" type="corridor" itemKey={c.slug} saved={saved} variant="row" dark />
                        <ListToggle list="saved" type="corridor" itemKey={c.slug} saved={saved} variant="row" dark />
                        <CompareButton type="corridor" itemKey={c.slug} variant="row" dark label="Compare Corridors" />
                        <FeeButton type="corridor" itemKey={c.slug} variant="row" dark label="Corridor Report Fees" />
                    </RailBox>
                    <DeeperBox text="Unlock detailed corridor reports, infrastructure models, agreement analysis and expert insights." />
                </>
            }
        >
            <div className="grid gap-4 lg:grid-cols-3">
                <SectionCard dark title="Corridor Performance" className="flex flex-col items-center">
                    <ScoreRing value={c.score} size={110} dark />
                    <p className="mt-2 text-sm">Trade volume {c.volume} (2023)</p>
                    <div className="mt-2 text-gold-400"><ModeIcons modes={c.modes} /></div>
                </SectionCard>
                <SectionCard title="Key Route" className="lg:col-span-2">
                    <ol className="flex flex-wrap items-center gap-2 text-sm">
                        {stops.map((s, i) => <li key={s} className="flex items-center gap-2"><span className="rounded-full border border-gold-500 bg-gold-50 px-3 py-1 font-medium">{s}</span>{i < stops.length - 1 && <span className="text-gold-600">→</span>}</li>)}
                    </ol>
                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                        <div><dt className="text-xs text-ink-500">Agreement</dt><dd className="font-semibold">{c.agreement}</dd></div>
                        <div><dt className="text-xs text-ink-500">Top Sectors</dt><dd className="font-semibold">{c.sectors}</dd></div>
                        <div><dt className="text-xs text-ink-500">Infrastructure Quality</dt><dd><Chip tone={c.infrastructure === 'High' ? 'good' : 'warn'}>{c.infrastructure}</Chip></dd></div>
                    </dl>
                </SectionCard>
            </div>
            <SectionCard title="Bottlenecks to Monitor" className="mt-4">
                <ul className="space-y-1.5 text-sm">{(c.profile?.bottlenecks ?? []).map((b: string) => <li key={b} className="flex items-center gap-2"><AlertTriangle className="size-4 text-attested-500" />{b}</li>)}</ul>
            </SectionCard>
            <div className="mt-3"><EvidenceStrip evidence={c.evidence} /></div>
        </AiimPage>
    );
}
