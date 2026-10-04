import { Link } from '@inertiajs/react';
import { BookOpen, Briefcase, CalendarCheck, CheckCircle2, Compass, Eye, FileText, Lock, MessageCircle, ShieldCheck, Users } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Box, Chip, zar } from '@/Components/Insights/Shared';
import { ResourceFrame } from '@/Components/Insights/Resources';
import type { ResourceCard } from '@/types/insights';

interface Props {
    free: ResourceCard | null;
    paid: { slug: string; title: string; summary: string | null; price_zar: number | null } | null;
}

export default function FreeVsPaid({ free, paid }: Props) {
    return (
        <ResourceFrame title="Free vs Paid" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Free vs Paid Comparison' }]}>
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-5">
                    <div>
                        <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">FREE EXPLAINS. PAID COMPLETES.</h1>
                        <p className="mt-1 font-serif text-lg text-gold-700">A clear boundary, shown before you choose.</p>
                        <p className="mt-2 max-w-2xl text-sm text-ink-600">Our resources are designed to meet you where you are. Free resources help you understand the issue, assess the situation and prepare with confidence. Paid products and sprints <strong>complete the applied work</strong> with expert execution, accountable delivery and usable outputs.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Box className="border-verified-500/40" title={<span className="flex items-center gap-2"><BookOpen className="size-6 rounded-full bg-verified-500 p-1 text-white" />FREE RESOURCE <Chip tone="green">R0 Free</Chip></span>}>
                            <ul className="grid grid-cols-2 gap-1.5 text-xs">{['Understand the issue', 'Criteria and questions', 'Evidence to gather', 'Bounded examples', 'When to seek help', 'Current version shown', 'Source and review details visible'].map((t) => <li key={t} className="flex gap-1.5"><CheckCircle2 className="size-4 text-verified-500" />{t}</li>)}</ul>
                            {free && (
                                <div className="mt-4 rounded border border-parchment-300 p-3 text-xs">
                                    <Chip tone="green">Free</Chip>
                                    <p className="mt-1 font-semibold">{free.title}</p><p className="text-ink-500">{free.summary}</p>
                                    <p className="mt-1 text-ink-400">Reviewed {free.reviewedAt} · Source: {free.source}</p>
                                </div>
                            )}
                            <Link href={free?.url ?? '/resources/library?access=free'} className="mt-4 flex items-center justify-center gap-2 rounded border border-verified-500 py-2 text-sm font-semibold text-verified-700"><BookOpen className="size-4" /> Use Free Resource →</Link>
                        </Box>
                        <Box className="border-gold-400" title={<span className="flex items-center gap-2"><Briefcase className="size-6 rounded-full bg-gold-500 p-1 text-white" />PAID PRODUCT / SPRINT <Chip tone="gold">Paid Access</Chip></span>}>
                            <ul className="grid grid-cols-2 gap-1.5 text-xs">{['Complete the working output', 'Apply it to the defined job', 'Complete reusable artefact', 'Maintained / current version', 'Human or professional review where included', 'Controlled delivery and accountability'].map((t) => <li key={t} className="flex gap-1.5"><CheckCircle2 className="size-4 text-gold-600" />{t}</li>)}</ul>
                            {paid && (
                                <div className="mt-4 rounded border border-parchment-300 p-3 text-xs">
                                    <Chip tone="gold">Paid</Chip>
                                    <p className="mt-1 font-semibold">{paid.title}</p><p className="line-clamp-2 text-ink-500">{paid.summary}</p>
                                    <p className="mt-1 font-semibold">{paid.price_zar ? `From ${zar(paid.price_zar)}` : 'Price on selection'}</p>
                                </div>
                            )}
                            <Link href={paid ? `/sprints/${paid.slug}` : '/sprints'} className="mt-4 flex items-center justify-center gap-2 rounded bg-gold-500 py-2 text-sm font-bold"><Briefcase className="size-4" /> View Paid Product →</Link>
                        </Box>
                    </div>
                    <Box>
                        <div className="grid items-center gap-4 md:grid-cols-[auto_1fr_1fr]">
                            <h2 className="flex items-center gap-2 font-serif text-xl font-semibold"><ShieldCheck className="size-7 text-gold-600" />Application Boundary</h2>
                            <p className="text-xs"><strong className="block text-verified-700">FREE CONTENT HELPS YOU LEARN, ASSESS AND PREPARE</strong>Build understanding, evaluate options and get ready with clear criteria and next steps.</p>
                            <p className="text-xs"><strong className="block text-gold-700">PAID ROUTES COMPLETE IMPLEMENTATION</strong>We deliver applied work, customised outputs or controlled execution with accountability.</p>
                        </div>
                    </Box>
                    <ul className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 sm:grid-cols-4">
                        {[[FileText, 'Source Shown', 'Every resource shows where it comes from.'], [CalendarCheck, 'Review Date Visible', 'You can see when it was last reviewed.'], [Lock, 'Access State Visible', 'Free or Paid access is always clear.'], [Users, 'Human Review Where Required', 'Expert review applied where indicated.']].map(([I, t, s]) => { const Icon = I as typeof Eye; return <li key={t as string} className="flex gap-2"><Icon className="size-5 text-gold-700" /><span className="text-xs"><strong className="block">{t as string}</strong>{s as string}</span></li>; })}
                    </ul>
                </div>
                <aside className="space-y-4">
                    <Box title="Not sure which route fits?">
                        <p className="text-xs text-ink-600">We will help you choose the right path for your goal, timeline and resources.</p>
                        <Link href="/resources/free-diagnostic" className="mt-3 flex items-center justify-center gap-2 rounded bg-gold-500 py-2 text-sm font-bold"><Compass className="size-4" /> Start Free Diagnostic</Link>
                        <button type="button" onClick={() => openAskQuestion({ subject: 'Free or paid route advice', section: 'resources' })} className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-gold-400 py-2 text-sm"><MessageCircle className="size-4" /> Request Advice</button>
                    </Box>
                    <Box title="How to choose">
                        <ol className="space-y-3 text-xs">{[['Use free if you need orientation', 'Learn the issue, key questions and what to check first.'], ['Choose paid if you need the output completed', 'Get expert execution, customised outputs and accountable delivery.'], ['Start a diagnostic if unsure', 'Answer a few questions and we recommend the best route.']].map(([t, s], i) => <li key={t} className="flex gap-2"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold-500 font-bold">{i + 1}</span><span><strong className="block">{t}</strong>{s}</span></li>)}</ol>
                    </Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
