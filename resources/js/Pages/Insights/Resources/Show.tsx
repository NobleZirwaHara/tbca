import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Bookmark, Calendar, Clock, Compass, Database, Download, FileText, Globe, Info, Lock, RefreshCw, Share2, ShoppingCart, Sparkles } from 'lucide-react';
import { Tabs } from '@/Components/ui/Kit';
import { AccessChip, Box, CheckList, Chip, CurrentnessChip, NeedSomething, Notice, label, zar } from '@/Components/Insights/Shared';
import { ResourceCard, ResourceFrame } from '@/Components/Insights/Resources';
import type { SharedProps } from '@/types';
import type { ResourceCard as RC, ResourceDetail } from '@/types/insights';

interface Props {
    resource: ResourceDetail;
    related: RC[];
}

export default function ResourceShow({ resource: r, related }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const [tab, setTab] = useState('overview');
    const [copied, setCopied] = useState(false);
    const a = r.accessState;
    const b = r.body;
    const isInsight = ['insight', 'commentary', 'viewpoint'].includes(r.type) || r.collection === 'insights';
    const crumbs = isInsight ? [{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'KP Thought Leadership', href: '/resources/insights' }, { label: r.title }] : [{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Resource Library', href: '/resources/library' }, { label: r.title }];

    const save = () => (auth.user ? router.post('/saved', { item_type: 'resource', item_key: r.slug, label: r.title, url: r.url }, { preserveScroll: true }) : router.get('/login'));
    const share = () => { void navigator.clipboard?.writeText(window.location.origin + r.url); setCopied(true); setTimeout(() => setCopied(false), 1500); };

    const primary = () => {
        switch (a.state) {
            case 'open':
            case 'entitled':
                return <a href={`/resources/${r.slug}/download`} className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 py-2.5 text-sm font-bold text-ink-900"><Download className="size-4" /> Download {r.format === 'Web' ? 'PDF' : r.format}</a>;
            case 'gate':
                return <Link href={`/resources/${r.slug}/access`} className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 py-2.5 text-sm font-bold text-ink-900"><Lock className="size-4" /> Get Resource</Link>;
            case 'purchase':
                return <Link href={`/resources/${r.slug}/checkout`} className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 py-2.5 text-sm font-bold text-ink-900"><ShoppingCart className="size-4" /> Buy for {zar(r.priceZar)}</Link>;
            case 'subscribe':
                return <Link href="/resources/account/subscription" className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 py-2.5 text-sm font-bold text-ink-900"><Sparkles className="size-4" /> Subscribe to unlock</Link>;
            case 'login':
                return <Link href="/login" className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 py-2.5 text-sm font-bold text-ink-900"><Lock className="size-4" /> Sign in to continue</Link>;
            default:
                return <p className="rounded bg-parchment-200 p-2 text-center text-xs text-ink-600">{a.reason}</p>;
        }
    };

    const statusRows: [string, React.ReactNode][] = [
        ['Access Level', r.accessLabel], ['Content Status', label(r.currentness)], ['Review Status', r.currentness === 'current' ? 'Current' : label(r.currentness)],
        ['Human Review', label(r.humanReview)], ['AI-Assisted Draft', r.aiAssisted ? 'Yes' : 'No'], ['Source', r.source], ['Version', r.version],
    ];

    return (
        <ResourceFrame title={r.title} crumbs={crumbs}>
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-5">
                    <div className="flex flex-col gap-5 sm:flex-row">
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-2"><Chip tone="dark">{label(r.type)}</Chip><AccessChip label={r.accessLabel} /><CurrentnessChip value={r.currentness} />{r.aiAssisted && <Chip tone="blue">AI-assisted draft</Chip>}{r.humanReview === 'completed' && <Chip tone="green">Human Reviewed</Chip>}</div>
                            <h1 className="mt-3 font-serif text-3xl font-bold text-ink-900 sm:text-[2.25rem]">{r.title}</h1>
                            <p className="mt-2 text-sm text-ink-700">{r.summary}</p>
                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-600">
                                <span className="flex items-center gap-1"><FileText className="size-4" />{r.format}</span>
                                {r.minutes && <span className="flex items-center gap-1"><Clock className="size-4" />{(r.meta?.use_time as string) ?? `${r.minutes} min read`}</span>}
                                {r.pages && <span>{r.pages} pages</span>}
                                <span className="flex items-center gap-1"><Calendar className="size-4" />Reviewed: {r.reviewedAt ?? '—'}</span>
                                <span className="flex items-center gap-1"><RefreshCw className="size-4" />Next review: {r.nextReviewAt ?? '—'}</span>
                                <span className="flex items-center gap-1"><Globe className="size-4" />{r.language}</span>
                                <span className="flex items-center gap-1"><Database className="size-4" />Source basis: {r.sourceBasis ?? r.source}{r.sourceCount ? ` (${r.sourceCount})` : ''}</span>
                            </div>
                        </div>
                        <div className="flex h-44 w-full shrink-0 flex-col justify-between rounded-[6px] bg-gradient-to-br from-ink-900 to-ink-950 p-4 text-parchment-100 shadow-card sm:w-36">
                            <p className="font-serif text-sm leading-tight font-bold text-gold-400 uppercase">{r.title}</p>
                            <Compass className="size-10 self-end text-gold-500/70" />
                            <p className="text-[0.625rem] text-ink-300">TBCA · {r.format}</p>
                        </div>
                    </div>

                    {r.currentness === 'review_due' && <Notice tone="amber" title="Review due">This resource is approaching its scheduled review ({r.nextReviewAt}). It remains available while review is in progress.</Notice>}
                    {a.state === 'blocked' && <Notice tone="red" title="Temporarily withheld">{a.reason}</Notice>}
                    {a.state === 'restricted' && <Notice tone="red" title="Restricted resource">{a.reason} <Link href="/contact" className="underline">Request access</Link></Notice>}

                    <Tabs tabs={[{ key: 'overview', label: 'Overview' }, { key: 'inside', label: isInsight ? 'Full Insight' : "What's Inside" }, { key: 'who', label: "Who It's For" }, { key: 'how', label: 'How to Use' }, { key: 'source', label: 'Source & Currentness' }]} value={tab} onChange={setTab} />

                    {tab === 'overview' && (
                        a.state === 'gate' || (a.state !== 'open' && a.state !== 'entitled' && b.preview) ? (
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <Box title="Why this resource is gated"><p className="text-xs text-ink-600">{b.about}</p></Box>
                                    <Box title="What you will get"><CheckList tone="gold" className="text-xs" items={b.get ?? []} /></Box>
                                </div>
                                {b.preview && (
                                    <Box title="Protected preview">
                                        <p className="-mt-2 mb-3 text-xs text-ink-500">Below is a preview of selected sections. The complete checklist and detailed prompts are provided after completing the value exchange.</p>
                                        <div className="grid gap-3 md:grid-cols-3">
                                            {b.preview.map((p) => (
                                                <div key={p.title} className="relative overflow-hidden rounded border border-parchment-300 p-3">
                                                    <p className="text-xs font-semibold">{p.title}</p>
                                                    <ul className="mt-2 space-y-1 text-[0.6875rem] blur-[3px] select-none" aria-hidden="true">{p.items.map((i) => <li key={i}>☐ {i}</li>)}</ul>
                                                    <Lock className="absolute right-1/2 bottom-4 size-6 translate-x-1/2 text-ink-700" />
                                                </div>
                                            ))}
                                        </div>
                                    </Box>
                                )}
                                <Notice tone="amber" title="How value exchange works">Our free content helps you learn and explore. Controlled resources like this one ensure accuracy, accountability, and ongoing improvements. Complete the value exchange to receive the full, controlled resource you can trust.</Notice>
                            </div>
                        ) : (
                            <Box title={isInsight ? 'Executive Summary' : `About this ${label(r.type).toLowerCase()}`}>
                                <p className="text-sm text-ink-700">{b.about ?? b.sections?.[0]?.text}</p>
                                {b.learn && <><p className="mt-3 text-sm font-semibold">You will learn:</p><CheckList tone="gold" className="mt-2" items={b.learn} /></>}
                                {b.checklist && <><p className="mt-3 text-sm font-semibold">Readiness checklist:</p><CheckList tone="gold" className="mt-2" items={b.checklist} /></>}
                                {r.boundaryNote && <p className="mt-3 rounded bg-gold-50 p-2 text-xs text-gold-800"><strong>Free explains, paid completes:</strong> {r.boundaryNote}{r.linkedProduct && <> Paid route: {r.linkedProduct}.</>}</p>}
                            </Box>
                        )
                    )}
                    {tab === 'inside' && (
                        <Box>
                            {a.canDownload || isInsight ? (
                                (b.sections ?? []).map((s) => <section key={s.heading} className="mb-4"><h2 className="font-serif text-lg font-semibold">{s.heading}</h2><p className="mt-1 text-sm text-ink-700">{s.text}</p></section>)
                            ) : (
                                <p className="flex items-center gap-2 text-sm text-ink-600"><Lock className="size-4" /> Full contents are available after access is granted.</p>
                            )}
                            {(b.get ?? []).length > 0 && <CheckList className="mt-2 text-xs" items={b.get ?? []} />}
                        </Box>
                    )}
                    {tab === 'who' && <Box><CheckList className="text-sm" items={b.who ?? ['Founders and business owners', 'SME managers and finance leads', 'Project sponsors and advisers']} /></Box>}
                    {tab === 'how' && <Box><ol className="list-decimal space-y-1.5 pl-5 text-sm">{(b.how ?? ['Read the overview and complete the prompts', 'Apply it to your own business context', 'Use the free diagnostic to confirm next steps']).map((h) => <li key={h}>{h}</li>)}</ol></Box>}
                    {tab === 'source' && (
                        <Box>
                            <dl className="grid gap-2 text-sm sm:grid-cols-2">{[['Source', r.source], ['Source basis', r.sourceBasis ?? r.source], ['Sources cited', r.sourceCount], ['Content risk class', r.riskClass], ['Last reviewed', r.reviewedAt], ['Next review', r.nextReviewAt], ['Version', r.version], ['AI-assisted', r.aiAssisted ? 'Yes – human approved' : 'No']].map(([k, v]) => <div key={k as string}><dt className="text-xs text-ink-500">{k}</dt><dd className="font-medium">{v ?? '—'}</dd></div>)}</dl>
                            <Link href="/resources/limitations" className="mt-3 inline-block text-xs font-semibold text-gold-700">Limitation, AI and source policy →</Link>
                        </Box>
                    )}

                    <p className="flex gap-2 rounded-[8px] border border-attested-500/30 bg-attested-50 p-3 text-xs text-ink-700"><AlertTriangle className="size-4 shrink-0 text-attested-700" /><span><strong>Important Note.</strong> This resource provides general information only. It does not replace professional advice. Apply what suits your business context and seek expert assistance when needed.</span></p>

                    {related.length > 0 && <section><h2 className="mb-3 font-serif text-lg font-semibold">Related resources</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{related.map((x) => <ResourceCard key={x.id} r={x} compact />)}</div></section>}
                </div>

                <aside className="space-y-4">
                    <Box title="Resource Status">
                        <dl className="space-y-1.5 text-xs">{statusRows.map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="flex items-center gap-1.5 text-ink-600"><span className="size-1.5 rounded-full bg-verified-500" />{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
                        <button type="button" onClick={() => setTab('source')} className="mt-2 text-xs font-semibold text-gold-700">View source details →</button>
                    </Box>
                    <Box title={a.state === 'gate' ? 'Get this resource' : 'Quick Actions'}>
                        <div className="space-y-2">
                            {primary()}
                            <button type="button" onClick={save} className="flex w-full items-center justify-center gap-2 rounded-[4px] border border-ink-300 py-2 text-xs font-semibold"><Bookmark className="size-4" /> {r.saved ? 'Saved — Remove from Library' : 'Save to Library'}</button>
                            <button type="button" onClick={share} className="flex w-full items-center justify-center gap-2 rounded-[4px] border border-ink-300 py-2 text-xs font-semibold"><Share2 className="size-4" /> {copied ? 'Link copied' : 'Share Resource'}</button>
                            <Link href="/resources/free-diagnostic" className="flex w-full items-center justify-center gap-2 rounded-[4px] border border-ink-300 py-2 text-xs font-semibold">Use in Free Diagnostic</Link>
                        </div>
                    </Box>
                    {a.state === 'gate' && (
                        <Box title="What happens next">
                            <ol className="space-y-1.5 text-xs">{['Review the value exchange details', 'Provide only the required information', 'Receive your controlled resource instantly'].map((s, i) => <li key={s} className="flex gap-2"><span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-gold-500 text-[0.625rem]">{i + 1}</span>{s}</li>)}</ol>
                            <p className="mt-2 text-[0.6875rem] text-ink-500">A download link will be provided on completion.</p>
                        </Box>
                    )}
                    {r.access === 'paid' && <Box tone="gold" title="Monetisation gate"><p className="text-xs text-ink-700">One-time purchase unlocks this resource in your Entitlement Library. <Link className="underline" href="/resources/monetisation">How gates work</Link></p></Box>}
                    <NeedSomething />
                    <p className="flex gap-1.5 text-[0.6875rem] text-ink-500"><Info className="size-3.5 shrink-0" /> {r.downloads.toLocaleString()} downloads recorded.</p>
                </aside>
            </div>
        </ResourceFrame>
    );
}
