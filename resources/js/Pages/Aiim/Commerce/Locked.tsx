import { CalendarDays, CheckCircle2, Database, Lock, MapPin, Server, ShieldCheck } from 'lucide-react';
import { Chip } from '@/Components/Aiim/Chips';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { DeeperBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, ProjectItem, Totals } from '@/types/aiim';

interface Props extends AiimPageProps {
    item: ProjectItem;
    price: Totals & { views: number; durationDays: number };
    entitlement: string | null;
    watchedOn: string | null;
}

export function LockedHero({ item, watchedOn }: { item: ProjectItem; watchedOn?: string | null }) {
    return (
        <div className="grid gap-4 md:grid-cols-[14rem_minmax(0,1fr)]">
            <div className="flex aspect-[4/3] items-center justify-center rounded-[8px] bg-gradient-to-br from-controlled-700 via-ink-900 to-ink-950">
                <span className="flex size-16 items-center justify-center rounded-full border-2 border-gold-500 bg-ink-950/60 text-gold-400"><Lock className="size-7" /></span>
            </div>
            <div>
                <Chip tone="gold">Opportunity Intelligence</Chip>
                <h2 className="mt-2 text-xl font-bold">{item.name}</h2>
                <p className="text-sm text-ink-600">{item.summary}</p>
                <ul className="mt-3 space-y-1.5 text-xs text-ink-700">
                    <li className="flex items-center gap-2"><MapPin className="size-3.5 text-gold-600" />{item.location}, South Africa</li>
                    <li className="flex items-center gap-2"><Server className="size-3.5 text-gold-600" />{item.sectorName}</li>
                    {watchedOn && <li className="flex items-center gap-2"><CalendarDays className="size-3.5 text-gold-600" />Added to Watchlist: {watchedOn}</li>}
                    <li className="flex items-center gap-2"><Database className="size-3.5 text-gold-600" />Source: {item.evidence.source}</li>
                    <li className="flex items-center gap-2"><ShieldCheck className="size-3.5 text-gold-600" />Confidence: <Chip tone={item.evidence.tone}>{item.evidence.gradeLabel}</Chip></li>
                </ul>
            </div>
        </div>
    );
}

export default function Locked({ item, price, entitlement, watchedOn }: Props) {
    const p = item.premium;
    return (
        <AiimPage
            title="Locked Premium Object"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Locked Premium Object' }]}
            heading={<>Locked Premium Object <Lock className="size-7" /></>}
            subtitle={entitlement ? 'You hold an active entitlement to this object.' : 'This premium intelligence is locked. Unlock to view full content and downloads.'}
            description={entitlement ? undefined : 'You currently have preview access only.'}
            accent={entitlement ? 'green' : 'gold'}
            rail={<><SelectionBox /><DeeperBox /></>}
        >
            <SectionCard>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                    <LockedHero item={item} watchedOn={watchedOn} />
                    <div className="grid gap-4 border-parchment-300 sm:grid-cols-2 lg:grid-cols-1 lg:border-l lg:pl-6">
                        <div><h3 className="mb-2 text-sm font-semibold">Preview Access</h3><ul className="space-y-1 text-xs">{p?.preview.map((x) => <li key={x} className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-attested-500" />{x}</li>)}</ul></div>
                        <div><h3 className="mb-2 text-sm font-semibold">Locked Content</h3><ul className="space-y-1 text-xs">{p?.locked.map((x) => <li key={x} className="flex gap-1.5"><Lock className="size-3.5 text-attested-500" />{x}</li>)}</ul></div>
                    </div>
                </div>
            </SectionCard>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
                <section className="flex flex-wrap items-center gap-4 rounded-[8px] border border-gold-300 bg-gold-50 p-4">
                    <span className="flex size-14 items-center justify-center rounded-full bg-ink-900 text-gold-400"><Lock className="size-6" /></span>
                    <div className="min-w-[12rem] flex-1">
                        <h3 className="font-semibold">Unlock Complete Intelligence</h3>
                        <p className="text-xs text-ink-600">Get full access to all premium insights, detailed data, and downloadable reports to support your investment decision. {price.views} views over {price.durationDays} days.</p>
                    </div>
                    <div className="text-center"><p className="text-xs text-ink-500">Unlock Price (ZAR)</p><p className="text-2xl font-bold">{zar2(price.total)}</p><p className="text-xs">incl. VAT</p></div>
                </section>
                <div className="space-y-2">
                    {entitlement ? (
                        <ButtonLink href={`/aiim/workspace/entitlements/${entitlement}`} className="w-full">Open Entitlement</ButtonLink>
                    ) : item.evidence.sellable ? (
                        <ButtonLink href={`/aiim/unlock/${item.code}/approve`} className="w-full" icon="lock">Unlock Now</ButtonLink>
                    ) : (
                        <p className="rounded bg-risk-50 p-2 text-xs text-risk-700">Below the sellability confidence threshold — not available for purchase yet.</p>
                    )}
                    <ButtonLink href={`/aiim/unlock/${item.code}/approve`} variant="outline" className="w-full">View Fee Breakdown</ButtonLink>
                    <ButtonLink href={`/aiim/opportunities/${item.slug}`} variant="outline" className="w-full">Back to Preview</ButtonLink>
                </div>
            </div>
            <p className="mt-3 text-xs text-ink-500">By proceeding, you agree to our Terms of Use, Privacy Policy and Refund Policy.</p>
        </AiimPage>
    );
}
