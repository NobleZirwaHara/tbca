import * as L from 'lucide-react';
import { useState } from 'react';
import { btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, FbPage, LearnerSafe, type FbShared, type KpShared } from '@/Components/Kp/kit';

interface Props extends KpShared, FbShared {
    slug: string;
}

const ROWS: [string, string, string, string][] = [
    ['S', 'Specific', 'What exactly do you want to achieve?', 'bg-referenced-500'],
    ['M', 'Measurable', 'How will you know when you have achieved it?', 'bg-verified-500'],
    ['A', 'Achievable', 'Is your goal realistic and possible?', 'bg-attested-500'],
    ['R', 'Relevant', 'Why is this goal important to you?', 'bg-controlled-500'],
    ['T', 'Time-bound', 'When will you achieve your goal?', 'bg-risk-500'],
];
const HOW: [string, string][] = [['Print', 'Click the download button and print this worksheet, or fill it in on screen.'], ['Think', 'Take your time to think about your goal.'], ['Write', 'Fill in each section honestly and clearly.'], ['Review', 'Check that your goal is SMART and strong.'], ['Act', 'Take action today and start your journey!']];

/** KP-SCR-039 Printable Activity: SMART Goals worksheet. */
export default function FbActivity({ screen, kpNav, fbNav, lite, slug }: Props) {
    const [vals, setVals] = useState<string[]>(['', '', '', '', '', '']);
    const set = (i: number, v: string) => { const n = [...vals]; n[i] = v; setVals(n); };
    return (
        <FbPage
            screen={screen}
            kpNav={kpNav}
            fbNav={fbNav}
            lite={lite}
            crumbs={[['Printable Activity']]}
            title="Printable Activity"
            intro="Download and print this activity to learn, practise and grow."
            actions={
                <>
                    <button type="button" onClick={() => window.print()} className={btnClass('outline', 'sm')}><L.Printer className="size-3.5" />Print</button>
                    <a href={`${BASE}/future-builders/activities/${slug}/download`} className={btnClass('outline', 'sm')}><L.Download className="size-3.5" />Download</a>
                </>
            }
            rail={
                <>
                    <Box title="Activity Details"><dl className="space-y-1 text-[0.8125rem]">{[['Topic', 'Leadership & You'], ['Level', 'Beginner'], ['Time', '15 to 20 minutes'], ['Best for', 'Ages 13+'], ['Format', 'Printable worksheet']].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl></Box>
                    <Box title="What You'll Improve"><ul className="space-y-1 text-[0.8125rem]">{['Goal setting skills', 'Planning and focus', 'Personal growth mindset', 'Taking action with confidence'].map((t) => <li key={t} className="flex gap-2"><L.CircleCheck className="mt-0.5 size-4 text-verified-500" aria-hidden="true" />{t}</li>)}</ul></Box>
                    <Box title="Printing Tips" tone="purple"><p className="text-[0.8125rem]">Use A4 paper for the best results. You can print in black and white to save ink.</p></Box>
                </>
            }
        >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem]">
                <section className="rounded-[12px] border border-parchment-400 bg-white p-5" aria-label="SMART Goals Worksheet">
                    <h2 className="font-serif text-[1.5rem] font-bold text-referenced-500">SMART Goals Worksheet</h2>
                    <p className="text-[0.8125rem] text-ink-600">Set a goal for yourself and break it down into SMART steps.</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-[0.8125rem]"><label>Name: <input className="w-2/3 border-b border-ink-400 bg-transparent" aria-label="Name" /></label><label>Date: <input className="w-2/3 border-b border-ink-400 bg-transparent" aria-label="Date" /></label></div>
                    <ul className="mt-4 divide-y divide-parchment-300 rounded-[8px] border border-parchment-400">
                        {ROWS.map(([l, t, q, c], i) => (
                            <li key={l} className="grid gap-2 p-3 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center">
                                <span className="flex items-center gap-2"><span className={`flex size-8 items-center justify-center rounded-full font-bold text-white ${c}`}>{l}</span><span><span className="block text-[0.8125rem] font-bold text-ink-900">{t}</span><span className="block text-[0.6875rem] text-ink-500">{q}</span></span></span>
                                <textarea aria-label={t} rows={2} value={vals[i]} onChange={(e) => set(i, e.target.value)} className="w-full rounded-[6px] border border-parchment-400 p-2 text-[0.8125rem]" />
                            </li>
                        ))}
                    </ul>
                    <label className="mt-4 block rounded-[8px] border border-referenced-500/30 bg-referenced-50 p-3"><span className="text-[0.8125rem] font-bold text-referenced-500">My Goal Statement</span><span className="block text-[0.6875rem] text-ink-500">Write your complete SMART goal in one sentence.</span><textarea rows={2} value={vals[5]} onChange={(e) => set(5, e.target.value)} className="mt-1 w-full rounded-[6px] border border-parchment-400 bg-white p-2 text-[0.8125rem]" /></label>
                    <p className="mt-4 flex justify-between text-[0.6875rem] text-ink-500"><span>Future Builders. Learn. Build. Grow.</span><span>The Business Clinic.Africa</span></p>
                </section>
                <Box title="How to Use"><ol className="space-y-2">{HOW.map(([t, b], i) => <li key={t} className="text-[0.75rem]"><span className="font-bold text-referenced-500">{i + 1}. {t}</span><span className="block text-ink-600">{b}</span></li>)}</ol><blockquote className="mt-3 rounded-[8px] bg-referenced-50 p-2 text-[0.75rem] text-ink-700">"A goal without a plan is just a wish."<footer className="text-ink-500">Attributed to Antoine de Saint-Exupery</footer></blockquote></Box>
            </div>
            <p className="text-[0.75rem] text-ink-500">What you type stays on this screen. Nothing is sent or saved.</p>
            <LearnerSafe />
        </FbPage>
    );
}
