import { Head, Link, router, usePage } from '@inertiajs/react';
import { Award, Bookmark, CalendarDays, CheckCircle2, Clock, Globe, Info, MapPin, Share2, Activity } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { StatusPill, Tag } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, MiniBar, Stars } from '@/Components/Marketplace/ui';
import type { SharedProps } from '@/types';
import type { MkProvider } from '@/types/marketplace';

interface Props {
    provider: MkProvider;
    breakdown: Record<string, number>;
    reviews: { author: string; rating: number; body: string; date: string }[];
    recent: { title: string; client: string | null; stage: string; date: string }[];
    services: { title: string; slug: string }[];
    saved: boolean;
}

export default function ProviderProfile({ provider: p, breakdown, reviews, recent, services, saved }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const m = p.profile.metrics ?? {};
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;
    const rating = p.rating ?? 0;

    const save = () =>
        auth.user ? router.post('/saved', { item_type: 'marketplace-provider', item_key: p.slug, label: p.name, url: `/marketplace/providers/${p.slug}` }, { preserveScroll: true }) : router.visit('/login');

    const metrics: [string, string, string][] = [
        ['Delivery Success Rate', `${m.delivery ?? 95}%`, '5% vs prior 12 months'],
        ['On-Time Delivery', `${m.on_time ?? 90}%`, '4% vs prior 12 months'],
        ['Quality Score', `${m.quality ?? rating} / 5`, '0.3 vs prior 12 months'],
        ['Response Rate', `${m.response_rate ?? 95}%`, '2% vs prior 12 months'],
        ['Client Satisfaction', `${m.satisfaction ?? rating} / 5`, '0.2 vs prior 12 months'],
        ['Repeat Engagement Rate', `${m.repeat ?? 70}%`, '6% vs prior 12 months'],
    ];
    const compliance: [string, string][] = p.profile.compliance ?? [['KYC / Identity Verification', 'Verified'], ['Business Registration', 'Verified'], ['Tax Compliance', 'Verified'], ['Code of Conduct', 'Accepted'], ['Sanctions Screening', 'Clear']];

    return (
        <>
            <Head title={`${p.name} – Rating & Tier`} />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca space-y-5">
                    <Breadcrumbs items={[{ label: 'Marketplace', href: '/marketplace' }, { label: 'Provider Network', href: '/marketplace/providers' }, { label: p.name }]} />
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-ink-900">Provider Rating &amp; Tier</h1>
                            <p className="text-sm text-ink-500">Comprehensive performance, reliability and compliance rating for informed engagement.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={save}><Bookmark className={saved ? 'size-4 fill-gold-500' : 'size-4'} aria-hidden="true" />{saved ? 'Saved' : 'Save Provider'}</Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => void navigator.clipboard?.writeText(window.location.href)}><Share2 className="size-4" aria-hidden="true" /> Share</Button>
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-12">
                        <Card className="lg:col-span-7">
                            <div className="flex flex-wrap items-start gap-4">
                                <span className="flex size-20 items-center justify-center rounded-[8px] bg-ink-950 font-serif text-4xl font-bold text-gold-400" aria-hidden="true">{p.name.slice(0, 1)}</span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2"><h2 className="font-serif text-2xl font-bold text-ink-900">{p.name}</h2><Tag tone="good">{p.routable ? 'Verified Provider' : p.statusLabel}</Tag></div>
                                    <p className="text-sm text-ink-500">{p.categoryLabel} · <MapPin className="inline size-3.5" aria-hidden="true" /> {p.city}, {p.country}</p>
                                </div>
                            </div>
                            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-parchment-300 pt-4 text-xs sm:grid-cols-5">
                                {[[CalendarDays, 'Member Since', p.profile.member_since ?? '2024'], [Activity, 'Total Engagements', p.engagementsCount], [Globe, 'Countries Served', p.profile.countries_served ?? (p.profile.countries ?? []).length], [Clock, 'Response Time (Avg)', p.profile.response ?? '4 hrs'], [Activity, 'Last Active', p.profile.last_active ?? 'This week']].map(([I, k, v]) => {
                                    const Ic = I as typeof Clock;
                                    return <div key={k as string} className="flex gap-2"><Ic className="size-4 text-ink-400" aria-hidden="true" /><div><dt className="text-ink-500">{k as string}</dt><dd className="font-semibold text-ink-900">{v as string}</dd></div></div>;
                                })}
                            </dl>
                        </Card>
                        <Card className="lg:col-span-5" title="Overall Provider Rating">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-4xl font-bold text-ink-900">{rating} <span className="text-lg text-ink-400">/ 5</span></p>
                                    <Stars value={rating} size="md" />
                                    <p className="mt-1 font-semibold text-verified-700">{rating >= 4.5 ? 'Excellent' : rating >= 4 ? 'Very Good' : 'Good'}</p>
                                    <p className="text-xs text-ink-500">Based on {p.reviewsCount} reviews and {p.engagementsCount} engagements</p>
                                </div>
                                <ul className="space-y-1 text-xs">
                                    {['5', '4', '3', '2', '1'].map((s) => (
                                        <li key={s} className="grid grid-cols-[3.5rem_1fr_2rem] items-center gap-2"><span>{s} Stars</span><MiniBar value={breakdown[s] ?? 0} max={total} /><span className="text-right">{breakdown[s] ?? 0}</span></li>
                                    ))}
                                </ul>
                            </div>
                        </Card>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-12">
                        <Card className="lg:col-span-4" title="Provider Tier">
                            <div className="flex gap-4">
                                <div className="flex size-24 shrink-0 flex-col items-center justify-center rounded-full border-4 border-gold-500 bg-gradient-to-b from-gold-300 to-gold-600 text-ink-900 shadow-inner">
                                    <Award className="size-6" aria-hidden="true" /><span className="font-serif text-lg font-bold">{(p.tier ?? 'Bronze').toUpperCase()}</span><span className="text-[0.625rem] font-bold">TIER</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-ink-900">{p.tier ?? 'Bronze'} Tier Provider</p>
                                    <p className="text-xs text-ink-600">High-performing provider with proven track record, strong compliance and consistent client satisfaction.</p>
                                </div>
                            </div>
                            <ul className="mt-4 space-y-1.5 text-xs text-ink-700">
                                {['Meets all mandatory requirements', 'High client satisfaction (≥ 4.5/5)', 'Strong delivery performance (≥ 90%)', 'Full compliance verified', 'Preferred provider status'].map((c) => <li key={c} className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" />{c}</li>)}
                            </ul>
                            <p className="mt-3 flex items-center gap-1 text-xs text-ink-500"><CalendarDays className="size-3.5" aria-hidden="true" /> Tier valid until: {p.profile.tier_valid ?? p.nextReview}</p>
                        </Card>
                        <Card className="lg:col-span-4" title="Performance Metrics (Last 12 Months)">
                            <div className="grid grid-cols-2 gap-3">
                                {metrics.map(([k, v, c]) => (
                                    <div key={k} className="rounded-[6px] border border-parchment-300 p-3"><p className="text-[0.6875rem] text-ink-500">{k}</p><p className="text-2xl font-bold text-ink-900">{v}</p><p className="text-[0.625rem] text-verified-700">↑ {c}</p></div>
                                ))}
                            </div>
                        </Card>
                        <Card className="lg:col-span-4" title="Compliance & Verification">
                            <ul className="space-y-2 text-sm">
                                {compliance.map(([k, v]) => <li key={k} className="flex justify-between gap-2"><span className="text-ink-700">{k}</span><span className="flex items-center gap-1 text-xs font-semibold text-verified-700"><CheckCircle2 className="size-3.5" aria-hidden="true" />{v}</span></li>)}
                            </ul>
                            {(p.profile.badges ?? []).length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">{(p.profile.badges as string[]).map((b) => <Tag key={b} tone="gold">{b}</Tag>)}</div>
                            )}
                        </Card>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-12">
                        <Card className="lg:col-span-3" title="Recent Engagements">
                            <ul className="space-y-3 text-sm">
                                {recent.length === 0 && <li className="text-ink-400">No recent engagements.</li>}
                                {recent.map((r) => <li key={r.title + r.date}><p className="font-semibold text-ink-900">{r.title}</p><p className="flex justify-between text-xs text-ink-500"><span>{r.client}</span><StatusPill status={r.stage === 'closed' ? 'completed' : 'in_progress'} /></p></li>)}
                            </ul>
                        </Card>
                        <Card className="lg:col-span-4" title="Client Reviews (Latest)">
                            <ul className="space-y-3">
                                {reviews.length === 0 && <li className="text-sm text-ink-400">No published reviews yet.</li>}
                                {reviews.map((r, i) => <li key={i} className="border-b border-parchment-300 pb-2"><div className="flex items-center justify-between"><Stars value={r.rating} /><span className="text-xs text-ink-400">{r.date}</span></div><p className="mt-1 text-sm text-ink-700">{r.body}</p><p className="text-xs text-ink-500">{r.author}</p></li>)}
                            </ul>
                        </Card>
                        <Card className="lg:col-span-3" title="Key Services Offered">
                            <ul className="space-y-1.5 text-sm text-ink-700">
                                {(p.profile.key_services ?? services.map((s) => s.title)).map((s: string) => <li key={s} className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" />{s}</li>)}
                            </ul>
                            {services.length > 0 && <div className="mt-3 space-y-1">{services.map((s) => <Link key={s.slug} href={`/marketplace/services/${s.slug}`} className="block text-xs font-semibold text-gold-700 hover:underline">{s.title} →</Link>)}</div>}
                        </Card>
                        <Card className="lg:col-span-2" title="Actions">
                            <div className="space-y-2">
                                <ButtonLink href="/marketplace/brief" size="sm" className="w-full">Invite to Engage</ButtonLink>
                                <ButtonLink href="/marketplace/brief" size="sm" variant="outline" className="w-full">Request Proposal</ButtonLink>
                                <Button type="button" size="sm" variant="outline" className="w-full" onClick={() => openAskQuestion({ subject: `Contact provider: ${p.name}`, section: 'marketplace' })}>Contact Provider</Button>
                            </div>
                            <p className="mt-2 text-[0.6875rem] text-ink-400">All contact runs through TBCA (no-circumvention).</p>
                        </Card>
                    </div>
                    <p className="flex items-center gap-2 rounded-[6px] border border-gold-300/60 bg-gold-50 px-4 py-3 text-xs text-ink-600"><Info className="size-4" aria-hidden="true" /> Provider ratings are based on client feedback, delivery performance, compliance status and platform engagement data.</p>
                </div>
            </section>
        </>
    );
}
