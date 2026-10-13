import { useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { Ico } from '@/Components/Webinars/kit';
import { BASE, Box, FbPage, Field, Input, Textarea, type FbShared, type KpShared } from '@/Components/Kp/kit';
import type { CourseSummary } from './FbHome';

interface Props extends KpShared, FbShared {
    courses: CourseSummary[];
}

const PROMISES: [string, string, string][] = [
    ['shield-check', 'No adverts or sales', 'Learners never see offers, prices or calls to buy.'],
    ['user-x', 'No personal details', 'We ask for a first name only. No surnames, phone numbers or photos.'],
    ['users', 'Human review', 'Every learner submission is reviewed before anything is shared.'],
    ['bot', 'AI with care', 'AI helpers run in a learner-safe mode and are labelled.'],
];
const RESOURCES: [string, string, string][] = [
    ['book-open', 'Guardian Guide', 'How Future Builders works and what your learner sees.'],
    ['message-circle', 'Conversation Starters', 'Use the "Think About It" question at the end of each lesson.'],
    ['shield', 'Safety & Wellbeing', 'Talk about online safety and never sharing private details.'],
    ['graduation-cap', 'Learning Support', 'Lessons take about 10 minutes. Little and often works best.'],
];

/** KP-SCR-041 Guardian Page. */
export default function FbGuardians({ screen, kpNav, fbNav, lite, courses }: Props) {
    const form = useForm({ name: '', email: '', question: '' });
    return (
        <FbPage
            screen={screen}
            kpNav={kpNav}
            fbNav={fbNav}
            lite={lite}
            crumbs={[['Guardian Page']]}
            title="Guardian Page"
            intro="Support and guide your learner's journey. What Future Builders teaches, how we keep learners safe and how to reach us."
            rail={
                <>
                    <Box title="Guardian Controls" icon="settings">
                        <ul className="space-y-1.5 text-[0.8125rem]">
                            <li className="flex gap-2"><L.Wifi className="mt-0.5 size-4 text-referenced-500" aria-hidden="true" /><a href={`${BASE}/future-builders/lite`} className="hover:text-referenced-500">Low-bandwidth mode</a></li>
                            <li className="flex gap-2"><L.Mail className="mt-0.5 size-4 text-referenced-500" aria-hidden="true" />Challenge updates go to the guardian email for ages 8 to 12</li>
                            <li className="flex gap-2"><L.Trash2 className="mt-0.5 size-4 text-referenced-500" aria-hidden="true" /><a href="/contact?subject=Future%20Builders%20data%20removal" className="hover:text-referenced-500">Ask us to remove a submission</a></li>
                        </ul>
                    </Box>
                    <Box title="Need Help?" tone="purple"><p className="text-[0.8125rem]">Get support or speak to our safety team.</p><a href="/contact?subject=Future%20Builders%20guardian" className="mt-2 inline-block text-[0.8125rem] font-semibold text-referenced-500">Contact Support</a></Box>
                </>
            }
        >
            <Box title="Our Promises to Families" icon="shield-check">
                <ul className="grid gap-3 sm:grid-cols-2">{PROMISES.map(([i, t, b]) => <li key={t} className="flex gap-2.5 rounded-[8px] border border-parchment-400 p-3"><Ico name={i} className="mt-0.5 size-5 shrink-0 text-referenced-500" /><span><span className="block text-[0.8125rem] font-bold text-ink-900">{t}</span><span className="block text-[0.75rem] text-ink-600">{b}</span></span></li>)}</ul>
            </Box>
            <Box title="What Your Learner Studies" icon="book-open">
                <ul className="grid gap-3 sm:grid-cols-2">{courses.map((c) => <li key={c.key} className="rounded-[8px] border border-parchment-400 p-3"><p className="font-serif font-bold text-ink-900">{c.title}</p><p className="text-[0.75rem] text-ink-500">{c.lessons} lessons | {c.level}</p><ul className="mt-1 list-disc pl-4 text-[0.75rem] text-ink-700">{c.outcomes.map((o) => <li key={o}>{o}</li>)}</ul></li>)}</ul>
            </Box>
            <Box title="Resources for Guardians" icon="heart-handshake">
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{RESOURCES.map(([i, t, b]) => <li key={t} className="rounded-[8px] border border-parchment-400 p-3"><Ico name={i} className="size-5 text-referenced-500" /><p className="mt-1 text-[0.8125rem] font-bold text-ink-900">{t}</p><p className="text-[0.75rem] text-ink-600">{b}</p></li>)}</ul>
            </Box>
            <Box title="Ask the Safety Team" icon="message-circle">
                <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); form.post(`${BASE}/future-builders/guardians`, { preserveScroll: true, onSuccess: () => form.reset() }); }}>
                    <Field label="Your name" error={form.errors.name}><Input required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></Field>
                    <Field label="Email" error={form.errors.email}><Input type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} /></Field>
                    <Field label="Your question" error={form.errors.question} className="sm:col-span-2"><Textarea required minLength={10} maxLength={1000} value={form.data.question} onChange={(e) => form.setData('question', e.target.value)} /></Field>
                    <div><button type="submit" disabled={form.processing} className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-referenced-500 px-4 font-semibold text-white">Send Question</button></div>
                </form>
            </Box>
        </FbPage>
    );
}
