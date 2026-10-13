import { Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { BtnLink, btnClass } from '@/Components/Webinars/kit';
import { AiDisclosure, BASE, Box, ConfidenceRing, FbPage, LearnerSafe, type FbShared, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Props extends KpShared, FbShared {
    course: { key: string; title: string; level: string; minutes: number; outcomes: string[]; activity: string; lessons: string[] };
    n: number;
    lesson: { title: string; definition: string; learn: string[]; examples: string[]; takeaway: string; think: string };
    done: number[];
}

/** KP-SCR-036 Business Basics Lesson and KP-SCR-037 AI Literacy Lesson. */
export default function Lesson({ screen, kpNav, fbNav, lite, course, n, lesson, done }: Props) {
    const base = `${BASE}/future-builders/lessons/${course.key}`;
    const isDone = done.includes(n);
    const pct = Math.round((done.length / course.lessons.length) * 100);
    const ai = course.key === 'ai-literacy';
    return (
        <FbPage
            screen={screen}
            kpNav={kpNav}
            fbNav={fbNav}
            lite={lite}
            crumbs={[[course.title, base + '/1'], [`Lesson ${n}`]]}
            head={`${course.title}: ${lesson.title}`}
            title={`${course.title}: ${lesson.title}`}
            intro={`Lesson ${n} of ${course.lessons.length} | ${course.level} | Estimated time: ${course.minutes} minutes`}
            actions={<a href={`${BASE}/future-builders/educators/packs/${course.key}`} className={btnClass('outline', 'sm')}><L.Download className="size-3.5" />Download Lesson Notes</a>}
            left={
                <nav aria-label={`${course.title} lessons`} className="rounded-[10px] border border-parchment-400 bg-white p-3">
                    <p className="font-serif font-bold text-ink-900">{course.title}</p>
                    <p className="text-[0.6875rem] text-ink-500">{done.length} of {course.lessons.length} complete</p>
                    <ol className="mt-2 space-y-0.5">
                        {course.lessons.map((t, i) => (
                            <li key={t}>
                                <Link href={`${base}/${i + 1}`} aria-current={i + 1 === n ? 'page' : undefined} className={cn('flex items-center gap-2 rounded-[6px] px-2 py-1.5 text-[0.75rem]', i + 1 === n ? 'bg-referenced-50 font-semibold text-referenced-500' : 'hover:bg-parchment-200')}>
                                    <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold', done.includes(i + 1) ? 'bg-verified-500 text-white' : 'bg-parchment-300 text-ink-700')}>{done.includes(i + 1) ? <L.Check className="size-3" /> : i + 1}</span>
                                    {t}
                                </Link>
                            </li>
                        ))}
                    </ol>
                    <Link href={`${BASE}/future-builders/topics`} className="mt-3 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-referenced-500"><L.ArrowLeft className="size-3" />Back to Topic Hub</Link>
                </nav>
            }
            rail={
                <>
                    <Box title="Lesson Progress"><ConfidenceRing value={pct} label={`${done.length} of ${course.lessons.length} lessons`} size={90} /></Box>
                    <Box title="What You'll Learn"><ul className="space-y-1 text-[0.8125rem]">{course.outcomes.map((o) => <li key={o} className="flex gap-2"><L.CircleCheck className="mt-0.5 size-4 shrink-0 text-referenced-500" aria-hidden="true" />{o}</li>)}</ul></Box>
                    <Box title="Activity" tone="purple"><p className="text-[0.8125rem]">{course.activity}</p><BtnLink href={`${BASE}/future-builders/activities/smart-goals`} size="sm" tone="outline" className="mt-2">Printable Activities</BtnLink></Box>
                </>
            }
        >
            <article className="rounded-[12px] border border-parchment-400 bg-white p-5">
                <h2 className="font-serif text-[1.25rem] font-bold text-referenced-500">{n}. {lesson.title}</h2>
                <p className="mt-3 flex gap-3 rounded-[10px] border border-verified-500/30 bg-verified-50 p-4 text-[0.9375rem] font-semibold text-ink-900"><L.Lightbulb className="size-6 shrink-0 text-verified-500" aria-hidden="true" />{lesson.definition}</p>
                <h3 className="mt-4 flex items-center gap-2 font-bold text-ink-900"><L.BookOpen className="size-4 text-referenced-500" aria-hidden="true" />Learn</h3>
                {lesson.learn.map((p) => <p key={p} className="mt-1 text-[0.875rem] text-ink-700">{p}</p>)}
                {lesson.examples.length > 0 && (
                    <>
                        <h3 className="mt-3 font-bold text-ink-900">Examples</h3>
                        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[0.875rem] text-ink-700">{lesson.examples.map((e) => <li key={e}>{e}</li>)}</ul>
                    </>
                )}
                <p className="mt-4 flex gap-3 rounded-[10px] border border-referenced-500/30 bg-referenced-50 p-3 text-[0.875rem]"><L.Star className="size-5 shrink-0 text-referenced-500" aria-hidden="true" /><span><strong className="block text-referenced-500">Key Takeaway</strong>{lesson.takeaway}</span></p>
                <p className="mt-3 flex gap-3 rounded-[10px] border border-gold-300 bg-gold-50 p-3 text-[0.875rem]"><L.CircleHelp className="size-5 shrink-0 text-gold-700" aria-hidden="true" /><span><strong className="block text-gold-800">Think About It</strong>{lesson.think}</span></p>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-parchment-300 pt-4">
                    {n > 1 ? <Link href={`${base}/${n - 1}`} className={btnClass('outline', 'sm')}><L.ArrowLeft className="size-3.5" />Previous Lesson</Link> : <span />}
                    <span className="text-[0.75rem] text-ink-500">{n} of {course.lessons.length} lessons</span>
                    <button type="button" onClick={() => router.post(`${base}/${n}/complete`, {}, { preserveScroll: false })} className="inline-flex h-9 items-center gap-2 rounded-[6px] bg-referenced-500 px-4 text-[0.8125rem] font-semibold text-white">{isDone ? (n < course.lessons.length ? 'Next Lesson' : 'Completed') : n < course.lessons.length ? 'Complete & Next Lesson' : 'Complete Course'}<L.ArrowRight className="size-4" /></button>
                </div>
            </article>
            {ai ? <AiDisclosure>Lesson 1 text comes from KP's Future Builders design. Later lessons are TBCA educational content (Editorial Voice E), reviewed for learners. No generative AI is used on this page.</AiDisclosure> : <p className="text-[0.75rem] text-ink-500">Lesson 1 text comes from KP's Future Builders design. Later lessons are TBCA educational content (Editorial Voice E), reviewed for learners.</p>}
            <LearnerSafe />
        </FbPage>
    );
}
