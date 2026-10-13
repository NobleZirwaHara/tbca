import { useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { Ico, btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, FbPage, Field, Input, LearnerSafe, Select, Textarea, type FbShared, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Props extends KpShared, FbShared {
    steps: { title: string; body: string; icon: string }[];
    ageBands: string[];
    examples: string[];
}

const FIELDS: ['problem' | 'who' | 'ideas' | 'solution' | 'step', string][] = [['problem', 'What problem did you spot?'], ['who', 'Who is affected, and why is it a problem?'], ['ideas', 'What ideas did you think of?'], ['solution', 'Which idea did you choose, and how does it help?'], ['step', 'What is your first small step?']];

/** KP-SCR-038 Local Problem Challenge. Submissions are reviewed before anything is shared. */
export default function FbChallenge({ screen, kpNav, fbNav, lite, steps, ageBands, examples }: Props) {
    const [at, setAt] = useState(0);
    const form = useForm({ first_name: '', age_band: '13-15', guardian_email: '', problem: '', who: '', ideas: '', solution: '', step: '' });
    const filled = FIELDS.filter(([k]) => form.data[k].trim().length > 0).length;
    return (
        <FbPage
            screen={screen}
            kpNav={kpNav}
            fbNav={fbNav}
            lite={lite}
            crumbs={[['Local Problem Challenge']]}
            title="Local Problem Challenge"
            intro="Spot a real problem in your community and design a simple solution. Ages 8 to 18. About 30 to 45 minutes."
            actions={<a href={`${BASE}/future-builders/activities/smart-goals/download`} className={btnClass('outline', 'sm')}><L.Download className="size-3.5" />Download Activity Sheet</a>}
            rail={
                <>
                    <Box title="Your Challenge Progress">
                        <p className="text-2xl font-bold text-ink-900">{filled} of 5</p>
                        <p className="text-[0.75rem] text-ink-500">steps written</p>
                        <ol className="mt-2 space-y-1 text-[0.8125rem]">{steps.map((s, i) => <li key={s.title} className="flex gap-2">{form.data[FIELDS[i][0]].trim() ? <L.CircleCheck className="size-4 text-verified-500" aria-label="Done" /> : <L.Circle className="size-4 text-ink-300" aria-hidden="true" />}{s.title}</li>)}</ol>
                    </Box>
                    <Box title="Examples to Inspire You" tone="purple"><ul className="list-disc space-y-1 pl-4 text-[0.8125rem]">{examples.map((e) => <li key={e}>{e}</li>)}</ul></Box>
                </>
            }
        >
            <Box title="The Challenge Steps" icon="map">
                <ol className="grid gap-3 sm:grid-cols-5">
                    {steps.map((s, i) => (
                        <li key={s.title}><button type="button" aria-current={at === i ? 'step' : undefined} onClick={() => setAt(i)} className={cn('flex h-full w-full flex-col items-center rounded-[10px] border p-3 text-center', at === i ? 'border-referenced-500 bg-referenced-50' : 'border-parchment-400 bg-white')}>
                            <span className="flex size-7 items-center justify-center rounded-full bg-referenced-500 text-[0.75rem] font-bold text-white">{i + 1}</span>
                            <Ico name={s.icon} className="mt-2 size-6 text-referenced-500" />
                            <span className="mt-1 text-[0.8125rem] font-bold text-ink-900">{s.title}</span>
                            <span className="text-[0.6875rem] text-ink-600">{s.body}</span>
                        </button></li>
                    ))}
                </ol>
                <p className="mt-3 flex gap-2 rounded-[8px] bg-gold-50 p-2 text-[0.75rem] text-ink-700"><L.Lightbulb className="size-4 shrink-0 text-gold-700" aria-hidden="true" />Tip: the best ideas come from real problems. Start small, think big!</p>
            </Box>

            <Box title="Write Your Challenge" icon="pen">
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); form.post(`${BASE}/future-builders/challenge`, { preserveScroll: true, onSuccess: () => form.reset() }); }}>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="First name only" error={form.errors.first_name} hint="Please do not add your surname."><Input required maxLength={40} value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)} /></Field>
                        <Field label="Age group" error={form.errors.age_band}><Select value={form.data.age_band} onChange={(e) => form.setData('age_band', e.target.value)} options={ageBands.map((a) => ({ value: a, label: `${a} years` }))} /></Field>
                        {form.data.age_band === '8-12' && <Field label="Parent or guardian email" error={form.errors.guardian_email} hint="Needed for learners aged 8 to 12."><Input type="email" required value={form.data.guardian_email} onChange={(e) => form.setData('guardian_email', e.target.value)} /></Field>}
                    </div>
                    {FIELDS.map(([k, l], i) => (
                        <Field key={k} label={`${i + 1}. ${l}`} error={form.errors[k]}><Textarea rows={2} required maxLength={k === 'step' ? 300 : 600} value={form.data[k]} onFocus={() => setAt(i)} onChange={(e) => form.setData(k, e.target.value)} /></Field>
                    ))}
                    <button type="submit" disabled={form.processing} className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-referenced-500 px-4 font-semibold text-white">Submit My Challenge <L.Send className="size-4" /></button>
                </form>
            </Box>
            <LearnerSafe />
        </FbPage>
    );
}
