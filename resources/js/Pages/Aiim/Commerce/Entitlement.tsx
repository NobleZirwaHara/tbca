import { Link, router } from '@inertiajs/react';
import { CheckCircle2, ChevronRight, Database, Gauge, Lock, MapPin, Server, ShieldCheck, Unlock } from 'lucide-react';
import { Chip } from '@/Components/Aiim/Chips';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { SectionCard, SelectionBox, DeeperBox } from '@/Components/Aiim/Shell';
import { Button, ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, ProjectItem } from '@/types/aiim';

export interface EntProps {
    reference: string; title: string; objectType: string; objectKey: string; productType: string | null; access: string;
    viewsIncluded: number | null; viewsUsed: number; extraView: number | null; amount: number; method: string | null;
    status: string; expires: string | null; unlocked: string; meta: Record<string, string>; order: string | null;
}

interface Props extends AiimPageProps {
    ent: EntProps;
    item: ProjectItem | null;
    order: { reference: string; total_zar: number } | null;
}

export default function Entitlement({ ent, item }: Props) {
    const active = ent.status === 'active';
    const remaining = ent.viewsIncluded !== null ? Math.max(0, ent.viewsIncluded - ent.viewsUsed) : null;
    const model = item?.premium?.model ?? {};
    return (
        <AiimPage
            title="Entitlement Unlock"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Entitlements', href: '/aiim/workspace/entitlements' }, { label: 'Entitlement Unlock' }]}
            heading={<>Entitlement Unlock <CheckCircle2 className="size-7 text-verified-500" /></>}
            subtitle={active ? 'Your premium intelligence is now unlocked and ready.' : 'This entitlement has expired.'}
            description="Thank you for your purchase. You now have access to the premium object below."
            accent={active ? 'green' : 'gold'}
            rail={<><SelectionBox /><DeeperBox /></>}
        >
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <div className="space-y-4">
                    <SectionCard>
                        <div className="flex flex-wrap gap-6">
                            <div className="flex gap-3"><span className="flex size-14 items-center justify-center rounded-full bg-verified-500 text-white"><Unlock className="size-7" /></span><div><h2 className="text-lg font-semibold text-verified-700">Unlock Successful</h2><p className="text-xs text-ink-600">Your entitlement has been activated. Deep intelligence is now available.</p></div></div>
                            <dl className="grid flex-1 grid-cols-2 gap-3 text-xs sm:grid-cols-3">
                                {[['Entitlement ID', ent.reference], ['Unlocked On', ent.unlocked], ['Payment', ent.order ?? ent.method ?? '—'], ['Access Type', ent.access], ['Views Included', ent.viewsIncluded ? `${ent.viewsIncluded} views` : 'Unlimited'], ['Extra Views Rate', ent.extraView ? `${zar2(ent.extraView)} per view` : '—']].map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
                            </dl>
                        </div>
                    </SectionCard>
                    <SectionCard>
                        <div className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)_minmax(0,1fr)]">
                            <div className="flex aspect-[4/3] items-center justify-center rounded bg-gradient-to-br from-controlled-700 to-ink-950 text-gold-400"><Unlock className="size-10" /></div>
                            <div>
                                <Chip tone="good">Unlocked</Chip>
                                <h3 className="mt-1 font-semibold">{ent.title}</h3>
                                <p className="text-xs text-ink-600">{ent.meta.item ?? ent.productType}</p>
                                {item && <ul className="mt-2 space-y-1 text-xs">
                                    <li className="flex gap-1.5"><MapPin className="size-3.5 text-gold-600" />Location: {item.location}</li>
                                    <li className="flex gap-1.5"><Server className="size-3.5 text-gold-600" />Sector: {item.sectorName}</li>
                                    <li className="flex gap-1.5"><Database className="size-3.5 text-gold-600" />Data Source: {model.dataSource ?? item.evidence.source}</li>
                                    <li className="flex gap-1.5"><Gauge className="size-3.5 text-gold-600" />Model Type: {model.modelType ?? ent.productType}</li>
                                    <li className="flex gap-1.5"><ShieldCheck className="size-3.5 text-gold-600" />Confidence: {model.confidence ?? item.evidence.gradeLabel}</li>
                                </ul>}
                            </div>
                            <div className="rounded bg-verified-50 p-3">
                                <p className="mb-2 text-xs font-semibold">You can now:</p>
                                <ul className="space-y-1 text-xs">{['View full financial model', 'Download detailed report (PDF)', 'Export data (Excel)', 'Access methodology and assumptions', 'Save to your workspace', 'Share within your organisation (if permitted)'].map((t) => <li key={t} className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-verified-500" />{t}</li>)}</ul>
                                <Button type="button" disabled={!active} onClick={() => router.post(`/aiim/workspace/entitlements/${ent.reference}/view`, {}, { preserveScroll: true })} variant="outline" size="sm" className="mt-3 w-full" trailingIcon="arrow-right">Open Full Model</Button>
                            </div>
                        </div>
                    </SectionCard>
                </div>
                <div className="space-y-4">
                    <SectionCard title="Entitlement Summary">
                        <dl className="space-y-1.5 text-sm">
                            {[['Product Type', ent.productType], ['Unlock Type', ent.access], ['Amount Paid', zar2(ent.amount)], ['Payment Method', ent.method], ['Current Status', <Chip key="s" tone={active ? 'good' : 'bad'}>{active ? 'Active' : 'Expired'}</Chip>], ['Expiry Date', ent.expires ?? 'No expiry'], ['Remaining Views', remaining !== null ? `${remaining} of ${ent.viewsIncluded}` : 'Unlimited'], ['Download Limit', 'Unlimited within validity']].map(([k, v]) => <div key={k as string} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
                        </dl>
                    </SectionCard>
                    <SectionCard title="What's Next?">
                        <ul className="space-y-1 text-sm">
                            {[['Explore Related Opportunities', '/aiim/opportunities'], ['Compare in Workspace', '/aiim/workspace/compare'], ['Request Human Advisor Call', '/aiim/workspace/advisor-request']].map(([l, h]) => <li key={h}><Link href={h} className="flex items-center justify-between rounded p-1.5 hover:bg-parchment-200">{l}<ChevronRight className="size-4" /></Link></li>)}
                        </ul>
                    </SectionCard>
                    {!active && <p className="flex items-center gap-1 text-xs text-risk-500"><Lock className="size-3" />Expired — unlock again from the locked object page.</p>}
                </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-between gap-3">
                <ButtonLink href="/aiim/workspace" variant="outline">Back to My Workspace</ButtonLink>
                <ButtonLink href="/aiim/workspace/entitlements" trailingIcon="arrow-right">View My Entitlements</ButtonLink>
            </div>
        </AiimPage>
    );
}
