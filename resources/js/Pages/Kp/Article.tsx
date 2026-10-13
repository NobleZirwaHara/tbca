import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { BtnLink, Ico } from '@/Components/Webinars/kit';
import { BASE, Box, ContentStatus, FreshnessBadge, InsightCard, KpPage, ScopeBadge, VoiceBadge, type KpCard, type KpShared } from '@/Components/Kp/kit';

interface Excerpt {
    key_insight: string;
    sections: [string, string[]][];
    pillars: [string, string, string][];
    closing: string;
    sources: [string, string, string][];
}

interface Props extends KpShared {
    item: KpCard & { excerpt: Excerpt | null; body: string[]; readMinutes: number | null };
    related: KpCard[];
    author: { name: string; role: string };
}

/** KP-SCR-006 Insight Article. Only KP-supplied text renders; the rest is marked pending. */
export default function Article({ screen, kpNav, item, related, author }: Props) {
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const x = item.excerpt;
    const [first, ...rest] = item.title.split('. ');

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={[['Insights', `${BASE}/insights`], [item.title]]}
            head={item.title}
            title={
                <span>
                    <span className="mb-2 block w-fit rounded-[4px] border border-gold-500 px-2 py-0.5 font-sans text-[0.6875rem] font-bold tracking-wider text-gold-700 uppercase">{item.themeLabel}</span>
                    {rest.length ? <>{first}.<br /><span className="text-gold-600">{rest.join('. ')}</span></> : item.title}
                </span>
            }
            intro={item.summary}
            rail={
                <>
                    {x && (
                        <Box title="Evidence & Sources" icon="file-check">
                            <ul className="space-y-2.5">
                                {x.sources.map(([org, t, f]) => (
                                    <li key={t} className="flex items-start gap-2">
                                        <L.Landmark className="mt-0.5 size-4 shrink-0 text-ink-500" aria-hidden="true" />
                                        <span className="flex-1 text-[0.75rem]"><span className="block font-semibold text-ink-900">{org}</span>{t}</span>
                                        <FreshnessBadge state={f} />
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-3 text-[0.6875rem] text-ink-500">Sources as listed in KP's design. Links are added when the full text is supplied.</p>
                        </Box>
                    )}
                    <Box title="Article Actions" icon="settings">
                        <ul className="space-y-1 text-[0.8125rem]">
                            <li><button type="button" onClick={() => window.print()} className="flex items-center gap-2 py-1 hover:text-gold-700"><L.Printer className="size-4" aria-hidden="true" /> Print or save as PDF</button></li>
                            <li><button type="button" onClick={() => setSaved(!saved)} aria-pressed={saved} className="flex items-center gap-2 py-1 hover:text-gold-700">{saved ? <L.BookmarkCheck className="size-4 text-gold-700" /> : <L.Bookmark className="size-4" />} {saved ? 'Saved' : 'Add to Saved Items'}</button></li>
                            <li><button type="button" onClick={() => { void navigator.clipboard?.writeText(window.location.href); setCopied(true); }} className="flex items-center gap-2 py-1 hover:text-gold-700"><L.Share2 className="size-4" aria-hidden="true" /> {copied ? 'Link copied' : 'Share Insight'}</button></li>
                            <li><Link href={`${BASE}/ask?q=${encodeURIComponent(item.title)}`} className="flex items-center gap-2 py-1 hover:text-gold-700"><L.Bot className="size-4" aria-hidden="true" /> Discuss with AI Assistant</Link></li>
                            <li><Link href={`${BASE}/action-pack/${item.slug}`} className="flex items-center gap-2 py-1 hover:text-gold-700"><L.ListChecks className="size-4" aria-hidden="true" /> Open the Insight Action Pack</Link></li>
                        </ul>
                    </Box>
                    <Box title="Take Action" icon="target" tone="cream">
                        <p className="text-[0.8125rem]">Turn insight into action with TBCA advisory and diagnostic support.</p>
                        <div className="mt-3 grid gap-2">
                            <BtnLink href={`${BASE}/book`} icon="arrow-right">Request Advisory Session</BtnLink>
                            <BtnLink href={`${BASE}/tools/scorecards/capital-readiness`} tone="outline">Test Your Readiness (Free Tools)</BtnLink>
                        </div>
                    </Box>
                </>
            }
        >
            <div className="flex flex-wrap items-center gap-2 text-[0.8125rem] text-ink-600">
                <L.User className="size-4" aria-hidden="true" /> <span className="font-semibold text-ink-900">{item.author === author.name ? author.name : item.author}</span>
                <VoiceBadge code={item.voice} full />
                <ScopeBadge code={item.scope} label={item.scopeLabel} />
                <ContentStatus status={item.status} />
                {item.readMinutes && <span>{item.readMinutes} min read</span>}
            </div>

            {x ? (
                <article className="space-y-5 rounded-[10px] border border-parchment-400 bg-white p-5">
                    <div className="flex gap-3 rounded-[10px] border border-gold-300 bg-gold-50 p-4">
                        <L.Lightbulb className="size-6 shrink-0 text-gold-700" aria-hidden="true" />
                        <div><p className="font-bold text-ink-900">Key Insight</p><p className="text-[0.875rem] text-ink-700">{x.key_insight}</p></div>
                    </div>
                    {x.sections.map(([h, paras]) => (
                        <section key={h}>
                            <h2 className="font-serif text-[1.25rem] font-bold text-ink-900">{h}</h2>
                            {paras.map((p) => <p key={p} className="mt-2 text-[0.9375rem] leading-relaxed text-ink-700">{p}</p>)}
                        </section>
                    ))}
                    <section>
                        <h2 className="font-serif text-[1.25rem] font-bold text-ink-900">The Five Pillars of Readiness</h2>
                        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {x.pillars.map(([t, b, i]) => (
                                <li key={t} className="rounded-[10px] border border-parchment-400 p-3">
                                    <span className="flex size-10 items-center justify-center rounded-full bg-ink-900 text-gold-400"><Ico name={i} className="size-5" /></span>
                                    <p className="mt-2 text-[0.8125rem] font-bold text-ink-900">{t}</p>
                                    <p className="text-[0.75rem] text-ink-600">{b}</p>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-3 text-[0.9375rem] text-ink-700">{x.closing}</p>
                    </section>
                    <p className="rounded-[8px] border border-dashed border-gold-400 bg-gold-50 p-3 text-[0.8125rem] text-ink-700">
                        This is the excerpt shown in KP's page design. The full article publishes here with its date when KP supplies the final text.
                    </p>
                </article>
            ) : item.body.length > 0 ? (
                <article className="space-y-3 rounded-[10px] border border-parchment-400 bg-white p-5">{item.body.map((p) => <p key={p} className="text-[0.9375rem] leading-relaxed text-ink-700">{p}</p>)}</article>
            ) : (
                <div className="rounded-[10px] border border-dashed border-parchment-500 bg-white p-6">
                    <p className="font-serif text-[1.125rem] font-bold text-ink-900">Full text not yet published</p>
                    <p className="mt-1 text-[0.875rem] text-ink-600">KP's design lists this {item.typeLabel.toLowerCase()} with the title and summary above. The full text publishes here, with its date and sources, when KP supplies it. Nothing is written on his behalf.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <BtnLink href={`${BASE}/newsletter`} size="sm" tone="outline" icon="mail">Notify me when it publishes</BtnLink>
                        <BtnLink href={`${BASE}/ask?q=${encodeURIComponent(item.title)}`} size="sm" tone="outline" icon="bot">Ask the KP Knowledge Assistant</BtnLink>
                    </div>
                </div>
            )}

            <ul className="grid gap-3 rounded-[10px] border border-parchment-400 bg-parchment-200 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <li className="text-[0.75rem]"><VoiceBadge code={item.voice} full /><p className="mt-1 text-ink-600">{item.voiceLabel}: declared voice class for this item.</p></li>
                <li className="text-[0.75rem]"><ScopeBadge code={item.scope} /><p className="mt-1 text-ink-600">{item.scopeLabel} scope. Not legal, tax or professional advice for a specific country.</p></li>
                <li className="text-[0.75rem]"><p className="font-bold text-ink-900">Professional Boundary</p><p className="text-ink-600">Review with qualified professionals for your specific circumstances.</p></li>
                <li className="text-[0.75rem]"><p className="font-bold text-ink-900">AI Disclosure</p><p className="text-ink-600">{item.voice === 'A' ? 'AI-generated and human reviewed.' : 'Human author. Any AI assistance is disclosed here.'}</p></li>
            </ul>

            {related.length > 0 && (
                <section>
                    <h2 className="mb-3 font-serif text-[1.25rem] font-bold text-ink-900">Related Insights</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map((r) => <InsightCard key={r.slug} item={r} />)}</div>
                </section>
            )}
        </KpPage>
    );
}
