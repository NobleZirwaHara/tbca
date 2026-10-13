import { Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, FbPage, type FbShared, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';
import type { LearnerTopic } from './FbHome';

interface Props extends KpShared, FbShared {
    courses: { key: string; title: string; lessons: string[] }[];
    topics: LearnerTopic[];
}

const DOES: [string, string][] = [['Images are switched off', 'Generated pictures are hidden to save data.'], ['No animation', 'Motion and transitions are turned off.'], ['Text-first lessons', 'Every lesson works as plain text.'], ['Small downloads', 'Worksheets and teaching packs are plain-text files.']];
const TIPS: [string, string][] = [['Download when you have Wi-Fi', 'Get lesson notes and worksheets when connected.'], ['Use text lessons', 'Text lessons use the least data.'], ['Keep it simple', 'Focus on one lesson at a time.']];

/** KP-SCR-042 Low-Bandwidth Mode. The setting applies to every Future Builders page in this session. */
export default function FbLite({ screen, kpNav, fbNav, lite, courses }: Props) {
    const toggle = () => router.post(`${BASE}/future-builders/lite`, { on: !lite }, { preserveScroll: true });
    return (
        <FbPage
            screen={screen}
            kpNav={kpNav}
            fbNav={fbNav}
            lite={lite}
            crumbs={[['Low-Bandwidth Mode']]}
            title="Low-Bandwidth Mode"
            intro="Learn and grow even with limited internet. This mode helps you save data and load pages faster."
        >
            <section className="flex flex-wrap items-center gap-4 rounded-[12px] border border-parchment-400 bg-white p-5">
                <span className="flex size-14 items-center justify-center rounded-full bg-referenced-50 text-referenced-500">{lite ? <L.Wifi className="size-7" aria-hidden="true" /> : <L.WifiOff className="size-7" aria-hidden="true" />}</span>
                <div className="min-w-0 flex-1">
                    <p className="font-serif text-[1.25rem] font-bold text-ink-900">Low-Bandwidth Mode is <span className={cn('rounded-[4px] px-2 py-0.5 font-sans text-[0.875rem]', lite ? 'bg-verified-50 text-verified-700' : 'bg-parchment-200 text-ink-600')}>{lite ? 'ON' : 'OFF'}</span></p>
                    <p className="text-[0.8125rem] text-ink-600">{lite ? 'You are using the most data-friendly experience.' : 'Turn it on to hide images and animation on Future Builders pages.'}</p>
                </div>
                <button type="button" onClick={toggle} aria-pressed={lite} className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-referenced-500 px-4 font-semibold text-white"><L.Power className="size-4" aria-hidden="true" />{lite ? 'Turn Off' : 'Turn On'}</button>
            </section>
            <div className="grid gap-4 md:grid-cols-2">
                <Box title="What Low-Bandwidth Mode Does"><ul className="space-y-2">{DOES.map(([t, b]) => <li key={t} className="text-[0.8125rem]"><strong className="block text-ink-900">{t}</strong><span className="text-ink-600">{b}</span></li>)}</ul></Box>
                <Box title="Tips for Using Low Data"><ul className="space-y-2">{TIPS.map(([t, b]) => <li key={t} className="text-[0.8125rem]"><strong className="block text-ink-900">{t}</strong><span className="text-ink-600">{b}</span></li>)}</ul></Box>
            </div>
            <Box title="Text Lessons and Downloads" icon="download">
                {courses.map((c) => (
                    <div key={c.key} className="mb-4 last:mb-0">
                        <p className="flex flex-wrap items-center justify-between gap-2 font-bold text-ink-900">{c.title}<a href={`${BASE}/future-builders/educators/packs/${c.key}`} className={btnClass('outline', 'sm')}><L.Download className="size-3.5" />Lesson notes (text file)</a></p>
                        <ol className="mt-1 grid list-decimal gap-x-6 pl-5 text-[0.8125rem] sm:grid-cols-2">{c.lessons.map((l, i) => <li key={l}><Link href={`${BASE}/future-builders/lessons/${c.key}/${i + 1}`} className="text-referenced-500 hover:underline">{l}</Link></li>)}</ol>
                    </div>
                ))}
            </Box>
        </FbPage>
    );
}
