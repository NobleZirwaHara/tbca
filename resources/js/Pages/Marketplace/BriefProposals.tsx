import { Head, Link, router } from '@inertiajs/react';
import { Award, BadgeCheck, Star, TriangleAlert } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button } from '@/Components/ui/Button';
import { StatusPill, Tag } from '@/Components/ui/Kit';
import { Card, Notice, zarCode } from '@/Components/Marketplace/ui';
import { BriefJourney } from '@/Components/Marketplace/Brief';
import type { MkBrief, MkProvider } from '@/types/marketplace';

interface Props {
    brief: MkBrief;
    proposals: { id: number; rate: number; days: number; match: number; note: string | null; status: string; provider: MkProvider; withinCap: boolean }[];
    matches: { provider: MkProvider; score: number; cost: number; days: number; available: string }[];
}

export default function BriefProposals({ brief, proposals, matches }: Props) {
    const cap = brief.scope.ledgers?.c ?? 0;
    const capState = brief.scope.ledgers?.c_state;
    const open = ['scope_accepted', 'awaiting_buyer_confirmation'].includes(brief.status);
    const best = proposals.length ? Math.min(...proposals.map((p) => p.rate)) : 0;

    return (
        <>
            <Head title={`Compare Proposals – ${brief.reference}`} />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca space-y-5">
                    <Breadcrumbs items={[{ label: 'Marketplace', href: '/marketplace' }, { label: brief.reference, href: `/marketplace/briefs/${brief.reference}/review` }, { label: 'Provider Proposals' }]} />
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-ink-900">Compare Provider Proposals</h1>
                            <p className="text-sm text-ink-500">{brief.title} · Ledger C cap {zarCode(cap)} ({capState === 'actual' ? 'actual' : 'capped estimate'})</p>
                        </div>
                        <BriefJourney current={1} className="w-full max-w-xl" />
                    </div>
                    <Notice tone="info">Proposals are from verified, active providers only. Selecting a provider whose rate exceeds the Ledger C cap re-issues the price version for your re-confirmation. Ledgers A and B do not change.</Notice>

                    <Card title={`Proposals received (${proposals.length})`}>
                        {proposals.length === 0 ? (
                            <p className="text-sm text-ink-500">No provider proposals yet. You can let TBCA assign one of the matched providers below at the capped rate.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[720px] text-[0.8125rem]">
                                    <thead className="bg-parchment-200 text-xs text-ink-600"><tr>{['Provider', 'Match', 'Rate (Ledger C)', 'Delivery', 'Rating', 'Notes', 'Status', ''].map((h) => <th key={h} scope="col" className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
                                    <tbody className="divide-y divide-parchment-300">
                                        {proposals.map((p) => (
                                            <tr key={p.id} className={p.status === 'awarded' ? 'bg-verified-50' : ''}>
                                                <td className="px-3 py-3"><Link href={`/marketplace/providers/${p.provider.slug}`} className="font-semibold text-ink-900 hover:underline">{p.provider.name}</Link><p className="text-xs text-ink-500">{p.provider.tier ? `${p.provider.tier} Tier` : ''}</p></td>
                                                <td className="px-3 py-3 font-bold text-verified-700">{p.match}%</td>
                                                <td className="px-3 py-3">
                                                    <span className="font-semibold">{zarCode(p.rate)}</span>
                                                    {p.rate === best && proposals.length > 1 && <Tag tone="good" className="ml-1">Lowest</Tag>}
                                                    {!p.withinCap && <p className="flex items-center gap-1 text-[0.6875rem] text-attested-700"><TriangleAlert className="size-3" aria-hidden="true" />Above cap – re-pricing</p>}
                                                </td>
                                                <td className="px-3 py-3">{p.days} days</td>
                                                <td className="px-3 py-3"><span className="flex items-center gap-1"><Star className="size-3.5 fill-gold-500 text-gold-500" aria-hidden="true" />{p.provider.rating}</span></td>
                                                <td className="max-w-xs px-3 py-3 text-xs text-ink-600">{p.note}</td>
                                                <td className="px-3 py-3"><StatusPill status={p.status} /></td>
                                                <td className="px-3 py-3 text-right">
                                                    {open && p.status !== 'awarded' && <Button size="sm" type="button" onClick={() => router.post(`/marketplace/briefs/${brief.reference}/proposals/${p.id}/award`)}><Award className="size-4" aria-hidden="true" /> Select</Button>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>

                    <Card title="TBCA-matched providers">
                        <ul className="grid gap-3 md:grid-cols-3">
                            {matches.map((m) => (
                                <li key={m.provider.slug} className="rounded-[6px] border border-parchment-300 p-4">
                                    <div className="flex items-center justify-between"><p className="font-semibold text-ink-900">{m.provider.name}</p><span className="text-sm font-bold text-verified-700">{m.score}%</span></div>
                                    <p className="mt-1 flex items-center gap-1 text-xs text-ink-500"><BadgeCheck className="size-3.5 text-verified-500" aria-hidden="true" /> Vetted · {m.available} · ~{m.days} days</p>
                                    <p className="mt-1 text-xs text-ink-500">Standard rate {zarCode(Math.min(m.cost, cap || m.cost))}</p>
                                    {open && <Button size="sm" variant="outline" type="button" className="mt-3 w-full" onClick={() => router.post(`/marketplace/briefs/${brief.reference}/assign-match`, { provider: m.provider.slug })}>Let TBCA assign</Button>}
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Link href={`/marketplace/briefs/${brief.reference}/review`} className="inline-block text-sm font-semibold text-gold-700">← Back to Scope & Price</Link>
                </div>
            </section>
        </>
    );
}
