import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { BtnLink, Ico } from '@/Components/Webinars/kit';
import { BASE, Box, FreshnessBadge, KpPage, ScopeBadge, VoiceBadge, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Props extends KpShared {
    component: string;
    voices: { code: string; label: string; body: string }[];
    scopes: { code: string; label: string; body: string }[];
    freshness: { key: string; label: string; body: string }[];
    corrections: { code: string; title: string; status: string; type: string; note: string; date: string; by: string }[];
    others: { key: string; title: string; id: string }[];
}

const INTRO: Record<string, [string, string]> = {
    'voice-badge': ['Voice Badge', 'Every piece of content says whose voice it is.'],
    'synthetic-disclosure': ['Synthetic Disclosure', 'Transparency about how content was created.'],
    'founder-attribution': ['Founder Attribution Block', 'Clear and honest about who created the content and how it can be used.'],
    'evidence-popover': ['Evidence Popover', 'See the source behind the content. Tap the evidence icon to view details.'],
    'professional-limitation': ['Professional Limitation', 'Understand what this content is, and what it is not.'],
    'geographic-scope': ['Geographic Scope Badge', 'Understand where content applies, and where it does not.'],
    freshness: ['Freshness Badge', 'How recently content and its sources were reviewed.'],
    'correction-notice': ['Correction Notice', 'Material corrections are always visible.'],
};

function Grid({ items, tone = 'purple' }: { items: [string, string, string][]; tone?: 'purple' | 'orange' }) {
    return (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {items.map(([i, t, b]) => (
                <li key={t} className="text-center">
                    <span className={cn('mx-auto flex size-12 items-center justify-center rounded-full', tone === 'purple' ? 'bg-referenced-50 text-referenced-500' : 'bg-attested-50 text-attested-500')}><Ico name={i} className="size-6" /></span>
                    <p className="mt-2 text-[0.8125rem] font-bold text-ink-900">{t}</p>
                    <p className="text-[0.75rem] text-ink-600">{b}</p>
                </li>
            ))}
        </ul>
    );
}

function Hero({ icon, title, children, meta }: { icon: string; title: string; children: ReactNode; meta?: [string, string, string][] }) {
    return (
        <section className="rounded-[12px] border border-referenced-500/30 bg-referenced-50/60 p-5">
            <div className="flex flex-wrap gap-5">
                <span className="flex size-24 shrink-0 items-center justify-center rounded-full bg-referenced-500/15 text-referenced-500"><Ico name={icon} className="size-12" /></span>
                <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-[1.375rem] font-bold text-ink-900">{title}</h2>
                    <div className="mt-1 text-[0.875rem] text-ink-700">{children}</div>
                </div>
            </div>
            {meta && <dl className="mt-4 grid gap-3 border-t border-referenced-500/20 pt-4 sm:grid-cols-3">{meta.map(([i, k, v]) => <div key={k} className="flex gap-2"><Ico name={i} className="mt-0.5 size-5 text-referenced-500" /><span><dt className="text-[0.75rem] font-semibold text-ink-900">{k}</dt><dd className="text-[0.75rem] text-ink-600">{v}</dd></span></div>)}</dl>}
        </section>
    );
}

/** KP-SCR-043 to KP-SCR-050: content standards components, each shown with a working example. */
export default function Standard({ screen, kpNav, component, voices, scopes, freshness, corrections, others }: Props) {
    const [title, sub] = INTRO[component];
    const [pop, setPop] = useState(false);

    const body: Record<string, ReactNode> = {
        'voice-badge': (
            <>
                <Hero icon="message-circle" title="Voice Badge">Every insight, note, lesson and AI answer carries one voice class, so you always know who is speaking. Voice S (an expert) is never shown as Voice P, and Voice A (AI) is always labelled.</Hero>
                <Box title="The Six Voices" icon="layers">
                    <ul className="grid gap-3 sm:grid-cols-2">{voices.map((v) => <li key={v.code} className="flex gap-3 rounded-[8px] border border-parchment-400 p-3"><VoiceBadge code={v.code} full /><span className="text-[0.75rem] text-ink-600">{v.body}</span></li>)}</ul>
                </Box>
                <Box title="Future Builders: Earning Your Voice" icon="award" tone="purple">
                    <p className="mb-3 text-[0.8125rem]">Learners can earn a Voice Badge from their educator for speaking up well in class discussions. There are no public leaderboards and no personal data is shown.</p>
                    <Grid items={[['mic', 'Speak Up', 'Share your view on a lesson or challenge.'], ['message-circle', 'Share Ideas', 'Add helpful ideas that help others learn.'], ['thumbs-up', 'Be Respectful', 'Show kindness and respect in every interaction.'], ['award', 'Earn Your Badge', 'Your educator awards the badge in class.']]} />
                </Box>
            </>
        ),
        'synthetic-disclosure': (
            <>
                <Hero icon="bot" title="AI-Generated Content" meta={[['cpu', 'How it is made', 'KP register retrieval (rules-based, no generative model)'], ['shield-check', 'Reviewed by', 'TBCA editorial review before release'], ['calendar-days', 'Shown on', 'Every AI answer and AI-adapted lesson']]}>
                    This label appears on anything created or adapted by AI. It says what was generated, how, and who reviewed it. AI never creates a synthetic Kruger Phiri voice, image or quotation.
                </Hero>
                <Box title="What This Means" icon="info"><Grid items={[['lightbulb', 'Designed to Help You Learn', 'AI helps create explanations, examples and activities.'], ['shield-check', 'Reviewed for Quality', 'Human reviewers check facts, clarity and relevance.'], ['users', "You're in Control", 'Think critically, ask questions and check sources.'], ['user-x', 'No Synthetic Founder', 'No AI voice, face or words are presented as Kruger.']]} /></Box>
                <Box title="Why We Disclose" tone="purple"><p className="text-[0.8125rem]">We believe in honesty, trust and transparency. You have the right to know how content is made so you can learn with confidence.</p></Box>
            </>
        ),
        'founder-attribution': (
            <>
                <Hero icon="pen" title="Content Created by Kruger Phiri" meta={[['file-text', 'Example', "The Real Problem Isn't Capital. It's Readiness."], ['badge-check', 'Voice', 'Founder Voice (F)'], ['scale', 'Copyright', 'The Business Clinic.Africa. All rights reserved.']]}>
                    This block appears only on content Kruger Phiri wrote or approved. AI-assisted content is never signed as his, and AI output never carries his signature.
                </Hero>
                <Box title="How This Content Can Be Used" icon="info"><Grid items={[['book-open', 'For Personal Learning', 'Read and learn from it for personal use.'], ['users', 'For Classrooms', 'Educators may use it in class with attribution.'], ['share', 'Share with Attribution', 'Share it if you credit Kruger Phiri and TBCA.'], ['x', 'No Commercial Use', 'Not for commercial use without written permission.']]} /></Box>
                <Box title="Attribution Required" icon="lock" tone="cream"><p className="text-[0.8125rem]">When you share or reference this content, please acknowledge: <strong>"Content created by Kruger Phiri, Founder of The Business Clinic.Africa."</strong></p></Box>
            </>
        ),
        'evidence-popover': (
            <div className="grid gap-4 lg:grid-cols-2">
                <Box title="Example Content" icon="book-open">
                    <p className="font-serif text-[1.125rem] font-bold text-ink-900">The Real Problem Isn't Capital</p>
                    <p className="mt-2 text-[0.875rem] text-ink-700">
                        Investors, lenders and funders are buying your ability to execute, govern, measure and deliver results under pressure.{' '}
                        <button type="button" aria-expanded={pop} aria-controls="evidence" onClick={() => setPop(!pop)} className="inline-flex size-5 items-center justify-center rounded-full border border-referenced-500 text-referenced-500 align-middle"><L.Info className="size-3" /><span className="sr-only">Show evidence</span></button>
                    </p>
                    <p className="mt-3 text-[0.75rem] text-ink-500">Tap the (i) icon to see the evidence behind the statement.</p>
                </Box>
                {pop ? (
                    <section id="evidence" className="rounded-[12px] border border-parchment-400 bg-white p-4 shadow-lg" role="dialog" aria-label="Evidence">
                        <header className="flex items-center justify-between"><p className="flex items-center gap-2 font-bold text-ink-900"><L.ShieldCheck className="size-5 text-referenced-500" aria-hidden="true" />Evidence</p><button type="button" onClick={() => setPop(false)} aria-label="Close"><L.X className="size-4" /></button></header>
                        <dl className="mt-3 space-y-2 text-[0.8125rem]">
                            <div><dt className="text-[0.75rem] font-semibold text-referenced-500">Claim</dt><dd>Funders assess the ability to execute, govern and deliver.</dd></div>
                            <div><dt className="text-[0.75rem] font-semibold text-referenced-500">Source</dt><dd>World Bank, Enterprise Surveys: Firm Performance Indicators (2023 Update)</dd></div>
                            <div><dt className="text-[0.75rem] font-semibold text-referenced-500">Source type</dt><dd><span className="rounded-full bg-verified-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-verified-700">Institutional dataset</span></dd></div>
                            <div><dt className="text-[0.75rem] font-semibold text-referenced-500">Verification</dt><dd>As listed in KP's design. Link and access date are added when TBCA verifies the source.</dd></div>
                        </dl>
                        <p className="mt-3 flex items-center justify-between border-t border-parchment-300 pt-2 text-[0.75rem]">Was this helpful? <Link href={`${BASE}/corrections#report`} className="font-semibold text-gold-700">Report Issue</Link></p>
                    </section>
                ) : (
                    <Box title="How It Works" icon="info"><p className="text-[0.8125rem]">Click or tap the (i) icon next to a statement to see the claim, the source, its type and when it was last verified.</p></Box>
                )}
            </div>
        ),
        'professional-limitation': (
            <>
                <Hero icon="scale" title="Important Professional Limitation">This content is for educational purposes only and does not constitute professional advice, services or opinions. For your specific situation, please consult a qualified professional.</Hero>
                <Box title="What This Content Is" icon="circle-check"><Grid items={[['graduation-cap', 'Educational', 'Designed to educate and build knowledge.'], ['book-open', 'Informational', 'General information and concepts.'], ['target', 'Practical', 'Tools and ideas to support learning.'], ['users', 'Empowering', 'Helps you think better and decide.']]} /></Box>
                <Box title="What This Content Is Not" icon="triangle-alert" tone="cream"><Grid tone="orange" items={[['briefcase', 'Not Professional Advice', 'Does not replace qualified professionals.'], ['file-text', 'Not Legal Advice', 'Not legal opinions or interpretations of law.'], ['calculator', 'Not Financial Advice', 'Not investment, tax or financial recommendations.'], ['shield', 'Not Guaranteed', 'No guarantee of results or outcomes.']]} /></Box>
            </>
        ),
        'geographic-scope': (
            <>
                <Hero icon="globe" title="Content Geographic Scope">Every item carries a scope code from AFR-G0 (general principle) to AFR-G5 (one transaction). Always confirm that content applies to your country or context.</Hero>
                <Box title="Scope Levels" icon="map"><ul className="grid gap-2 sm:grid-cols-2">{scopes.map((s) => <li key={s.code} className="flex items-center gap-3 rounded-[8px] border border-parchment-400 p-2.5"><ScopeBadge code={s.code} /><span className="text-[0.8125rem]"><strong className="text-ink-900">{s.label}.</strong> {s.body}</span></li>)}</ul></Box>
                <Box title="How to Use This Information" icon="info"><Grid items={[['circle-check', 'Check First', 'Confirm it applies to your country and situation.'], ['scale', 'Consider Local Laws', 'Laws and regulations differ. Verify locally.'], ['message-circle', 'Seek Local Advice', 'When in doubt, consult a local professional.'], ['globe', 'Share Responsibly', 'Share within the same region or with a clear note.']]} /></Box>
            </>
        ),
        freshness: (
            <>
                <Hero icon="clock" title="Freshness Badge">Each item and source shows how recently it was reviewed. Stale high-risk content is never shown as current, and stale sources are excluded from AI answers.</Hero>
                <Box title="Freshness States" icon="clock"><ul className="space-y-2">{freshness.map((f) => <li key={f.key} className="flex items-center gap-3 text-[0.8125rem]"><FreshnessBadge state={f.key} /><span>{f.body}</span></li>)}</ul></Box>
            </>
        ),
        'correction-notice': (
            <>
                <Hero icon="file-check" title="Correction Notice">When content is materially corrected, a notice shows the correction ID, the date, what changed and the current source. The notice stays with the content.</Hero>
                <Box title="Recent Correction Notices" icon="file-check">
                    <ul className="space-y-2">{corrections.map((c) => <li key={c.code} className="rounded-[8px] border-l-4 border-attested-500 bg-attested-50 p-3 text-[0.8125rem]"><p className="font-bold text-ink-900">{c.code}: {c.title}</p><p className="text-ink-700">{c.note}</p><p className="text-[0.6875rem] text-ink-500">{c.type} | {c.status} | {c.date} | {c.by}</p></li>)}</ul>
                    <BtnLink href={`${BASE}/corrections`} size="sm" tone="outline" className="mt-3" icon="arrow-right">Full Correction Timeline</BtnLink>
                </Box>
            </>
        ),
    };

    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            accent="purple"
            crumbs={[['Content Standards', `${BASE}/standards/voice-badge`], [title]]}
            title={title}
            subtitle={sub}
            rail={
                <>
                    <Box title="Content Standards" icon="shield-check">
                        <ul className="space-y-1">{others.map((o) => <li key={o.key}><Link href={`${BASE}/standards/${o.key}`} className={cn('flex justify-between gap-2 rounded-[6px] px-2 py-1.5 text-[0.8125rem]', o.key === component ? 'bg-referenced-50 font-semibold text-referenced-500' : 'hover:bg-parchment-200')}>{o.title}<span className="text-[0.625rem] text-ink-500">{o.id}</span></Link></li>)}</ul>
                    </Box>
                    <Box title="Have a Question?" tone="purple">
                        <p className="text-[0.8125rem]">We're here to help you understand how content is labelled and reviewed.</p>
                        <BtnLink href={`${BASE}/ask`} size="sm" tone="outline" className="mt-2" icon="arrow-right">Ask the AI Assistant</BtnLink>
                    </Box>
                </>
            }
        >
            {body[component]}
        </KpPage>
    );
}
