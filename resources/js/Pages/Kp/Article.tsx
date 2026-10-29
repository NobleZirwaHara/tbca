import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useEffect, useState } from 'react';
import { BtnLink } from '@/Components/Webinars/kit';
import { BASE, Box, InsightCard, KpPage, ScopeBadge, VoiceBadge, type KpCard, type KpShared } from '@/Components/Kp/kit';

interface Source {
    n: string;
    html: string;
    url: string | null;
    linked: boolean;
}

interface Props extends KpShared {
    item: KpCard & {
        kicker: string | null;
        byline: string[];
        html: string;
        toc: { id: string; text: string }[];
        sourcesHeading: string;
        sources: Source[];
        notes: string[];
        wordCount: number;
        sourceFile: { folder: string | null; file: string | null; received: string | null };
    };
    related: KpCard[];
    section: { label: string; href: string };
    author: { name: string; role: string };
}

/* Typography for KP's article HTML (headings, paragraphs, lists, tables, pull quotes, links). */
const PROSE = [
    'text-[1rem] leading-[1.75] text-ink-800 [overflow-wrap:anywhere]',
    '[&_h2]:mt-9 [&_h2]:scroll-mt-28 [&_h2]:font-serif [&_h2]:text-[1.375rem] [&_h2]:leading-snug [&_h2]:font-bold [&_h2]:text-ink-900 [&>h2:first-child]:mt-0',
    '[&_h3]:mt-7 [&_h3]:text-[0.8125rem] [&_h3]:font-bold [&_h3]:tracking-wider [&_h3]:text-gold-800 [&_h3]:uppercase',
    '[&_p]:mt-4 [&>p:first-child]:mt-0 [&_strong]:text-ink-900 [&_em]:text-ink-900',
    '[&_a]:font-medium [&_a]:text-gold-800 [&_a]:underline [&_a]:underline-offset-2',
    '[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-1.5',
    '[&_blockquote]:my-7 [&_blockquote]:border-l-4 [&_blockquote]:border-gold-500 [&_blockquote]:bg-gold-50 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:font-serif [&_blockquote]:text-[1.125rem] [&_blockquote]:leading-relaxed [&_blockquote]:text-ink-900 [&_blockquote_p]:mt-0',
    '[&_.kp-table]:my-5 [&_.kp-table]:overflow-x-auto [&_.kp-table]:rounded-[8px] [&_.kp-table]:border [&_.kp-table]:border-parchment-400',
    '[&_table]:w-full [&_table]:min-w-[30rem] [&_table]:text-[0.875rem] [&_th]:bg-parchment-200 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:align-bottom [&_td]:border-t [&_td]:border-parchment-300 [&_td]:px-3 [&_td]:py-2 [&_td]:align-top',
].join(' ');

/* The site header, footer and KP navigation are not printed. */
const PRINT_CSS = '@media print { header.sticky, footer, [data-kp-noprint], body .fixed { display: none !important; } #main { background: #fff; } .kp-print-body { border: 0 !important; padding: 0 !important; } a { color: inherit !important; } }';

/** KP-SCR-006 Article: Kruger Phiri's full text, byline, date, topics, sources and related reading. */
export default function Article({ screen, kpNav, item, related, section, author }: Props) {
    const [copied, setCopied] = useState(false);
    const [url, setUrl] = useState('');
    useEffect(() => setUrl(window.location.href), []);
    const parts = item.title.split('. ');
    const twoLine = parts.length === 2 && item.title.length < 90 && parts[1] !== '';
    const share = (u: string) => encodeURIComponent(u);
    const aiDisclosed = item.notes.some((n) => /AI-assisted/i.test(n));

    const copy = () => {
        void navigator.clipboard?.writeText(url || window.location.href);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2500);
    };
    const nativeShare = () => {
        if (navigator.share) {
            void navigator.share({ title: item.title, text: item.summary, url: url || window.location.href }).catch(() => undefined);
        } else {
            copy();
        }
    };

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={[[section.label, section.href], [item.title]]}
            head={item.title}
            title={
                <span>
                    <Link href={`${BASE}/topics/${item.theme}`} className="mb-2 block w-fit rounded-[4px] border border-gold-500 px-2 py-0.5 font-sans text-[0.6875rem] font-bold tracking-wider text-gold-700 uppercase hover:bg-gold-50">{item.themeLabel}</Link>
                    {twoLine ? <>{parts[0]}.<br /><span className="text-gold-600">{parts[1]}</span></> : item.title}
                </span>
            }
            intro={item.summary ? <span className="font-serif text-[1.125rem] text-ink-700 italic">{item.summary}</span> : undefined}
            rail={
                <>
                    {item.toc.length > 2 && (
                        <Box title="In This Article" icon="list">
                            <ol className="space-y-1.5 text-[0.8125rem]">
                                {item.toc.map((t) => (
                                    <li key={t.id}><a href={`#${t.id}`} className="block leading-snug text-ink-700 hover:text-gold-700">{t.text}</a></li>
                                ))}
                            </ol>
                        </Box>
                    )}
                    <Box title="Share and Print" icon="share">
                        <ul className="space-y-1 text-[0.8125rem]">
                            <li><button type="button" onClick={nativeShare} className="flex items-center gap-2 py-1 hover:text-gold-700"><L.Share2 className="size-4" aria-hidden="true" /> Share this article</button></li>
                            <li><button type="button" onClick={copy} className="flex items-center gap-2 py-1 hover:text-gold-700"><L.Link2 className="size-4" aria-hidden="true" /> {copied ? 'Link copied' : 'Copy link'}</button></li>
                            <li><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${share(url)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-1 hover:text-gold-700"><L.Briefcase className="size-4" aria-hidden="true" /> Share on LinkedIn</a></li>
                            <li><a href={`https://x.com/intent/post?text=${share(item.title)}&url=${share(url)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-1 hover:text-gold-700"><L.AtSign className="size-4" aria-hidden="true" /> Share on X</a></li>
                            <li><a href={`https://wa.me/?text=${share(`${item.title} ${url}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-1 hover:text-gold-700"><L.MessageCircle className="size-4" aria-hidden="true" /> Share on WhatsApp</a></li>
                            <li><a href={`mailto:?subject=${share(item.title)}&body=${share(`${item.summary}\n\n${url}`)}`} className="flex items-center gap-2 py-1 hover:text-gold-700"><L.Mail className="size-4" aria-hidden="true" /> Send by email</a></li>
                            <li><button type="button" onClick={() => window.print()} className="flex items-center gap-2 py-1 hover:text-gold-700"><L.Printer className="size-4" aria-hidden="true" /> Print or save as PDF</button></li>
                        </ul>
                    </Box>
                    <Box title="Use This Article" icon="target" tone="cream">
                        <ul className="space-y-1 text-[0.8125rem]">
                            <li><Link href={`${BASE}/ask?q=${encodeURIComponent(item.title)}`} className="flex items-center gap-2 py-1 hover:text-gold-700"><L.Bot className="size-4" aria-hidden="true" /> Discuss with the KP Knowledge Assistant</Link></li>
                            <li><Link href={`${BASE}/action-pack/${item.slug}`} className="flex items-center gap-2 py-1 hover:text-gold-700"><L.ListChecks className="size-4" aria-hidden="true" /> Open the Insight Action Pack</Link></li>
                        </ul>
                        <div className="mt-3 grid gap-2">
                            <BtnLink href={`${BASE}/book`} icon="arrow-right">Request Advisory Session</BtnLink>
                            <BtnLink href={`${BASE}/tools/scorecards/capital-readiness`} tone="outline">Test Your Readiness (Free Tools)</BtnLink>
                        </div>
                    </Box>
                </>
            }
        >
            <style>{PRINT_CSS}</style>

            <div className="space-y-3 border-y border-parchment-400 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.8125rem] text-ink-600">
                    <span className="inline-flex items-center gap-1.5"><L.PenLine className="size-4 text-gold-700" aria-hidden="true" /> <span>By <span className="font-semibold text-ink-900">{item.author}</span>{item.author === author.name && author.role ? <span className="text-ink-500">{`, ${author.role}`}</span> : null}</span></span>
                    <span className="inline-flex items-center gap-1.5" title={item.dateNote ?? undefined}><L.CalendarDays className="size-4" aria-hidden="true" /> {item.published ? <time dateTime={item.published}>{item.dateLabel}</time> : item.dateLabel}{item.dateNote && <span className="text-ink-500">(proposed date)</span>}</span>
                    <span className="inline-flex items-center gap-1.5"><L.Clock className="size-4" aria-hidden="true" /> {item.readMinutes} min read</span>
                    <span className="inline-flex items-center gap-1.5"><L.FileText className="size-4" aria-hidden="true" /> {item.typeLabel}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5" data-kp-noprint>
                    <VoiceBadge code={item.voice} full />
                    <ScopeBadge code={item.scope} label={item.scopeLabel} />
                    {item.topics.map((t) => (
                        <Link key={t.slug} href={t.href} className="inline-flex items-center gap-1 rounded-full border border-gold-400 bg-white px-2 py-0.5 text-[0.6875rem] font-semibold text-gold-800 hover:bg-gold-50"><L.Tag className="size-3" aria-hidden="true" />{t.label}</Link>
                    ))}
                    {item.countries.map((c) => (
                        <Link key={c.slug} href={c.href} className="inline-flex items-center gap-1 rounded-full border border-controlled-500/30 bg-white px-2 py-0.5 text-[0.6875rem] font-semibold text-controlled-700 hover:bg-controlled-50"><L.MapPin className="size-3" aria-hidden="true" />{c.name}</Link>
                    ))}
                </div>
            </div>

            <article className="kp-print-body rounded-[10px] border border-parchment-400 bg-white p-5 sm:p-8">
                {item.kicker && <p className="mb-4 text-[0.6875rem] font-bold tracking-[0.14em] text-gold-700 uppercase">{item.kicker}</p>}
                <div className={PROSE} dangerouslySetInnerHTML={{ __html: item.html }} />

                {(item.sources.length > 0 || item.notes.length > 0) && (
                    <section aria-labelledby="sources" className="mt-10 border-t border-parchment-400 pt-6">
                        <h2 id="sources" className="font-serif text-[1.25rem] font-bold text-ink-900">{item.sourcesHeading}</h2>
                        {item.sources.length > 0 && (
                            <ol className="mt-3 space-y-2.5 text-[0.8125rem] leading-relaxed text-ink-700 [overflow-wrap:anywhere] [&_a]:text-gold-800 [&_a]:underline">
                                {item.sources.map((s) => (
                                    <li key={s.n} className="flex gap-2">
                                        <span className="shrink-0 font-bold text-ink-900">[{s.n}]</span>
                                        <span>
                                            <span dangerouslySetInnerHTML={{ __html: s.html }} />
                                            {s.url && !s.linked && !s.html.includes('href=') && <> <a href={s.url} target="_blank" rel="noopener noreferrer">Open source</a></>}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        )}
                        {item.notes.length > 0 && (
                            <div className="mt-4 space-y-2 rounded-[8px] bg-parchment-200 p-3 text-[0.75rem] leading-relaxed text-ink-600 [overflow-wrap:anywhere]">
                                {item.notes.map((n, i) => <p key={i} dangerouslySetInnerHTML={{ __html: n }} />)}
                            </div>
                        )}
                    </section>
                )}
                {item.sourceFile.file && (
                    <p className="mt-6 text-[0.6875rem] text-ink-500">Source document: {item.sourceFile.file}{item.sourceFile.received ? `, supplied by Kruger Phiri on ${item.sourceFile.received}` : ''}. {item.wordCount.toLocaleString('en-ZA')} words.</p>
                )}
            </article>

            <ul className="grid gap-3 rounded-[10px] border border-parchment-400 bg-parchment-200 p-4 sm:grid-cols-2 lg:grid-cols-4" data-kp-noprint>
                <li className="text-[0.75rem]"><VoiceBadge code={item.voice} full /><p className="mt-1 text-ink-600">{item.voiceLabel}: declared voice class for this item.</p></li>
                <li className="text-[0.75rem]"><ScopeBadge code={item.scope} /><p className="mt-1 text-ink-600">{item.scopeLabel} scope. Not legal, tax or professional advice for a specific country.</p></li>
                <li className="text-[0.75rem]"><p className="font-bold text-ink-900">Professional Boundary</p><p className="text-ink-600">Review with qualified professionals for your specific circumstances.</p></li>
                <li className="text-[0.75rem]"><p className="font-bold text-ink-900">AI Disclosure</p><p className="text-ink-600">{aiDisclosed ? 'The document discloses AI assistance. See the notes under the sources.' : 'The document does not disclose AI assistance.'}</p></li>
            </ul>

            {related.length > 0 && (
                <section data-kp-noprint>
                    <h2 className="mb-3 font-serif text-[1.25rem] font-bold text-ink-900">Related Articles</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map((r) => <InsightCard key={r.slug} item={r} />)}</div>
                </section>
            )}
        </KpPage>
    );
}
