import { Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { Ico, btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, Empty, FbPage, LearnerSafe, Meter, type FbShared, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';
import type { CourseSummary, LearnerTopic } from './FbHome';

interface Props extends KpShared, FbShared {
    topics: LearnerTopic[];
    filters: { level: string; q: string };
    courses: CourseSummary[];
}

/** KP-SCR-035 Learner Topic Hub. */
export default function FbTopics({ screen, kpNav, fbNav, lite, topics, filters, courses }: Props) {
    const [q, setQ] = useState(filters.q);
    const go = (over: Record<string, string>) => router.get(`${BASE}/future-builders/topics`, Object.fromEntries(Object.entries({ ...filters, q, ...over }).filter(([, v]) => v)), { preserveScroll: true });
    const total = courses.reduce((a, c) => a + c.lessons, 0);
    const done = courses.reduce((a, c) => a + c.done, 0);
    return (
        <FbPage
            screen={screen}
            kpNav={kpNav}
            fbNav={fbNav}
            lite={lite}
            crumbs={[['Learner Topic Hub']]}
            title="Learner Topic Hub"
            intro="Choose a topic to learn, explore activities and build skills for your future."
            rail={
                <>
                    <Box title="Your Progress">
                        <p className="text-2xl font-bold text-ink-900">{total ? Math.round((done / total) * 100) : 0}%</p>
                        <Meter value={total ? (done / total) * 100 : 0} tone="purple" />
                        <p className="mt-1 text-[0.75rem] text-ink-500">{done} of {total} lessons completed in this session</p>
                    </Box>
                    <Box title="Quick Actions">
                        <ul className="space-y-1.5 text-[0.8125rem]">{[['Take a Challenge', '/future-builders/challenge'], ['Download Activity Sheet', '/future-builders/activities/smart-goals'], ['Low-Bandwidth Mode', '/future-builders/lite']].map(([t, h]) => <li key={t}><Link href={`${BASE}${h}`} className="flex items-center justify-between hover:text-referenced-500">{t}<L.ArrowRight className="size-3.5" /></Link></li>)}</ul>
                    </Box>
                </>
            }
        >
            <div className="flex flex-wrap items-center gap-2">
                {[['', 'All Topics'], ['Beginner', 'Beginner'], ['Intermediate', 'Intermediate']].map(([k, l]) => <button key={l} type="button" aria-pressed={filters.level === k} onClick={() => go({ level: k })} className={cn('rounded-full border px-3 py-1 text-[0.8125rem]', filters.level === k ? 'border-referenced-500 bg-referenced-500 text-white' : 'border-parchment-500 bg-white')}>{l}</button>)}
                <form className="ml-auto flex gap-2" onSubmit={(e) => { e.preventDefault(); go({ q }); }}>
                    <label htmlFor="fq" className="sr-only">Search topics</label>
                    <input id="fq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search topics..." className="h-9 rounded-[6px] border border-parchment-500 bg-white px-2 text-[0.8125rem]" />
                    <button type="submit" className={btnClass('outline', 'sm')}>Search</button>
                </form>
            </div>
            {topics.length === 0 ? <Empty>No topics match.</Empty> : (
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {topics.map((t) => {
                        const course = courses.find((c) => c.key === t.course);
                        return (
                            <li key={t.slug} className="flex flex-col rounded-[10px] border border-parchment-400 bg-white p-4">
                                <span className="flex size-11 items-center justify-center rounded-full bg-referenced-50 text-referenced-500"><Ico name={t.icon} className="size-6" /></span>
                                <p className="mt-2 font-serif font-bold text-ink-900">{t.title}</p>
                                <p className="flex-1 text-[0.75rem] text-ink-600">{t.body}</p>
                                {course && <><Meter value={(course.done / course.lessons) * 100} tone="purple" className="mt-3" /><p className="mt-1 text-[0.6875rem] text-ink-500">{course.lessons} lessons | {t.level}</p></>}
                                {t.href ? <Link href={t.href} className={cn(btnClass('outline', 'sm'), 'mt-3')}>Explore Topic</Link> : <p className="mt-3 rounded-[6px] bg-parchment-200 px-2 py-1 text-center text-[0.6875rem] text-ink-600">{t.level}. Lessons coming soon</p>}
                            </li>
                        );
                    })}
                </ul>
            )}
            <LearnerSafe />
        </FbPage>
    );
}
