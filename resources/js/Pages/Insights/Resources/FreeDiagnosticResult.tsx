import { Link } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Info, MessageCircle } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { ReferenceChip } from '@/Components/ui/Kit';
import { Box } from '@/Components/Insights/Shared';
import { PageTitle, ResourceCard, ResourceFrame } from '@/Components/Insights/Resources';
import type { ResourceCard as RC } from '@/types/insights';

interface Props {
    reference: string;
    answers: { industry: string; situation: string; priorities: string[] };
    route: { title: string; text: string; href: string } | null;
    categories: string[];
    resources: RC[];
}

export default function FreeDiagnosticResult({ reference, answers, route, categories, resources }: Props) {
    return (
        <ResourceFrame title="Your Free Diagnostic Results" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Free Diagnostic', href: '/resources/free-diagnostic' }, { label: 'Results' }]}>
            <PageTitle title="Your Free Diagnostic Recommendations" intro={<>Orientation and triage only — not a paid diagnostic report or professional conclusion. Reference <ReferenceChip value={reference} /></>} />
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-5">
                    {route && (
                        <Box tone="gold" title={`Recommended route: ${route.title}`}>
                            <p className="text-sm">{route.text}</p>
                            <Link href={route.href} className="mt-3 inline-flex items-center gap-1 rounded bg-gold-500 px-4 py-2 text-xs font-bold">Explore matching Sprints <ArrowRight className="size-4" /></Link>
                        </Box>
                    )}
                    <section>
                        <h2 className="mb-3 font-serif text-xl font-semibold">Free resources matched to your priorities</h2>
                        {resources.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{resources.map((r) => <ResourceCard key={r.id} r={r} />)}</div> : <p className="text-sm text-ink-500">No current free resources match yet — speak to an advisor.</p>}
                    </section>
                </div>
                <aside className="space-y-4">
                    <Box title="What we understood">
                        <ul className="space-y-1.5 text-xs"><li>Industry: <strong>{answers.industry}</strong></li><li>Situation: <strong className="capitalize">{answers.situation}</strong></li><li>Focus areas: <strong>{categories.join(', ')}</strong></li></ul>
                    </Box>
                    <Box title="Next steps">
                        <ul className="space-y-2 text-xs">{['Use the matched free resources', 'Run a sector-adapted diagnostic for deeper scoring', 'Request professional support if the work needs completing'].map((t) => <li key={t} className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" />{t}</li>)}</ul>
                        <Link href="/industries/select" className="mt-3 block rounded border border-gold-500 py-1.5 text-center text-xs font-semibold text-gold-800">Sector-adapted diagnostic →</Link>
                        <button type="button" onClick={() => openAskQuestion({ subject: `Free diagnostic ${reference}`, section: 'resources' })} className="mt-2 flex w-full items-center justify-center gap-1 rounded border py-1.5 text-xs"><MessageCircle className="size-4" /> Ask a Question</button>
                    </Box>
                    <p className="flex gap-1.5 text-[0.6875rem] text-ink-500"><Info className="size-3.5 shrink-0" /> Free triage never exposes paid scoring logic or issues regulated conclusions.</p>
                </aside>
            </div>
        </ResourceFrame>
    );
}
