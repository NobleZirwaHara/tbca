import { Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import { BtnLink, Ico } from '@/Components/Webinars/kit';
import { BASE, Box, FbPage, LearnerSafe, Meter, type FbShared, type KpShared } from '@/Components/Kp/kit';

export interface LearnerTopic { slug: string; title: string; body: string; icon: string; level: string; course: string | null; href: string | null }
export interface CourseSummary { key: string; title: string; level: string; minutes: number; lessons: number; done: number; href: string; outcomes: string[] }

interface Props extends KpShared, FbShared {
    topics: LearnerTopic[];
    courses: CourseSummary[];
    spark: [string, string];
    challengeSteps: { title: string; body: string; icon: string }[];
}

/** KP-SCR-034 Future Builders Home. Free, learner-safe, no commercial calls to action. */
export default function FbHome({ screen, kpNav, fbNav, lite, topics, courses, spark, challengeSteps }: Props) {
    const done = courses.reduce((a, c) => a + c.done, 0);
    return (
        <FbPage
            screen={screen}
            kpNav={kpNav}
            fbNav={fbNav}
            lite={lite}
            crumbs={[['Home']]}
            head="Future Builders"
            title="Future Builders"
            intro="Learn. Explore. Build your future. Age-appropriate lessons, activities and challenges to help you grow your skills and confidence."
            rail={
                <>
                    <Box title="Daily Spark" icon="sparkles" tone="purple">
                        <blockquote className="rounded-[8px] bg-white p-3 text-[0.875rem] text-ink-800">"{spark[0]}"<footer className="mt-1 text-[0.75rem] text-ink-500">{spark[1]}</footer></blockquote>
                    </Box>
                    <Box title="Your Learning">
                        <ul className="grid grid-cols-2 gap-2 text-center">
                            <li className="rounded-[8px] border border-parchment-400 p-2"><L.BookOpen className="mx-auto size-5 text-referenced-500" aria-hidden="true" /><p className="text-xl font-bold text-ink-900">{done}</p><p className="text-[0.6875rem] text-ink-500">Lessons completed</p></li>
                            <li className="rounded-[8px] border border-parchment-400 p-2"><L.Layers className="mx-auto size-5 text-referenced-500" aria-hidden="true" /><p className="text-xl font-bold text-ink-900">{courses.length}</p><p className="text-[0.6875rem] text-ink-500">Courses open</p></li>
                        </ul>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Progress is kept in this browser session only. No account or personal details needed.</p>
                    </Box>
                    <Box title="Quick Links">
                        <ul className="space-y-1.5 text-[0.8125rem]">{[['Explore Topics', '/future-builders/topics'], ['Take a Challenge', '/future-builders/challenge'], ['Printable Activities', '/future-builders/activities/smart-goals'], ['Parent & Educator Zone', '/future-builders/educators']].map(([t, h]) => <li key={t}><Link href={`${BASE}${h}`} className="flex items-center justify-between hover:text-referenced-500">{t}<L.ArrowRight className="size-3.5" /></Link></li>)}</ul>
                    </Box>
                </>
            }
        >
            <section className="flex flex-wrap items-center gap-5 rounded-[12px] border border-referenced-500/30 bg-referenced-50 p-5">
                {!lite && <span className="kp-art flex size-24 items-center justify-center rounded-full bg-white text-referenced-500"><L.Rocket className="size-12" aria-hidden="true" /></span>}
                <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-[1.5rem] font-bold text-ink-900">Welcome, Future Builder!</h2>
                    <p className="text-[0.875rem] text-ink-700">You're on a journey to discover new ideas, build skills and make a positive impact. Let's learn something awesome today!</p>
                </div>
                <BtnLink href={`${BASE}/future-builders/lessons/business-basics/1`} icon="arrow-right">Start Learning</BtnLink>
            </section>

            <section>
                <h2 className="mb-3 font-serif text-[1.25rem] font-bold text-ink-900">Continue Your Journey</h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                    {courses.map((c) => (
                        <li key={c.key} className="rounded-[10px] border border-parchment-400 bg-white p-4">
                            <p className="font-serif text-[1.0625rem] font-bold text-ink-900">{c.title}</p>
                            <p className="text-[0.75rem] text-ink-500">{c.lessons} lessons | {c.level} | about {c.minutes} minutes each</p>
                            <Meter value={(c.done / c.lessons) * 100} tone="purple" className="mt-3" />
                            <p className="mt-1 text-[0.6875rem] text-ink-500">{Math.round((c.done / c.lessons) * 100)}% complete</p>
                            <BtnLink href={c.href} size="sm" tone="outline" className="mt-2">{c.done ? 'Continue' : 'Start'}</BtnLink>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <div className="mb-3 flex items-end justify-between"><h2 className="font-serif text-[1.25rem] font-bold text-ink-900">Explore by Topic</h2><Link href={`${BASE}/future-builders/topics`} className="text-[0.8125rem] font-semibold text-referenced-500">View all topics</Link></div>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">{topics.map((t) => <li key={t.slug}><Link href={t.href ?? `${BASE}/future-builders/topics`} className="flex h-full flex-col items-center rounded-[10px] border border-parchment-400 bg-white p-3 text-center hover:border-referenced-500"><span className="flex size-12 items-center justify-center rounded-full bg-referenced-50 text-referenced-500"><Ico name={t.icon} className="size-6" /></span><span className="mt-2 text-[0.8125rem] font-semibold text-ink-900">{t.title}</span></Link></li>)}</ul>
            </section>

            <Box title="Local Problem Challenge" icon="lightbulb" tone="purple">
                <ol className="grid gap-2 sm:grid-cols-5">{challengeSteps.map((s, i) => <li key={s.title} className="text-[0.75rem]"><span className="font-bold text-referenced-500">{i + 1}. {s.title}</span><span className="block text-ink-600">{s.body}</span></li>)}</ol>
                <BtnLink href={`${BASE}/future-builders/challenge`} size="sm" className="mt-3" icon="arrow-right">Take the Challenge</BtnLink>
            </Box>
            <LearnerSafe />
        </FbPage>
    );
}
