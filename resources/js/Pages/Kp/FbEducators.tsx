import { useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, FbPage, Field, Input, Select, type FbShared, type KpShared } from '@/Components/Kp/kit';
import type { CourseSummary } from './FbHome';

interface Props extends KpShared, FbShared {
    courses: CourseSummary[];
    packs: { key: string; title: string; body: string; href: string }[];
    roles: string[];
}

const TOOLS: [string, string, string][] = [
    ['users', 'Class Groups', 'Create classes with codes. Learners join without email or surname.'],
    ['bar-chart-3', 'Progress Reports', 'Aggregate class progress by lesson. No individual rankings.'],
    ['clipboard-check', 'Assignments', 'Set lessons and the Local Problem Challenge with due dates.'],
    ['award', 'Badges', 'Award Voice and Challenge badges in class.'],
];

/** KP-SCR-040 Educator Portal. Class tools switch on after the educator is verified. */
export default function FbEducators({ screen, kpNav, fbNav, lite, courses, packs, roles }: Props) {
    const form = useForm({ name: '', school: '', email: '', role: roles[0], learners: '' });
    return (
        <FbPage
            screen={screen}
            kpNav={kpNav}
            fbNav={fbNav}
            lite={lite}
            crumbs={[['Educator Portal']]}
            title="Educator Portal"
            intro="Teaching packs, class tools and progress reports for schools and youth programmes. Free for verified educators."
            rail={
                <>
                    <Box title="How Access Works" icon="shield-check">
                        <ol className="list-decimal space-y-1 pl-4 text-[0.8125rem]"><li>Request access with your school details.</li><li>The safety team verifies you (usually within 3 working days).</li><li>Class tools switch on for your account.</li></ol>
                    </Box>
                    <Box title="Need Help?" tone="purple"><p className="text-[0.8125rem]">Visit the Help Centre or contact support.</p><a href="/contact?subject=Future%20Builders%20educator" className="mt-2 inline-block text-[0.8125rem] font-semibold text-referenced-500">Contact Support</a></Box>
                </>
            }
        >
            <ul className="grid gap-3 sm:grid-cols-3">
                <li className="rounded-[10px] border border-parchment-400 bg-white p-4"><L.BookOpen className="size-6 text-referenced-500" aria-hidden="true" /><p className="mt-1 text-2xl font-bold text-ink-900">{courses.reduce((a, c) => a + c.lessons, 0)}</p><p className="text-[0.75rem] text-ink-500">Lessons ready to teach</p></li>
                <li className="rounded-[10px] border border-parchment-400 bg-white p-4"><L.Download className="size-6 text-referenced-500" aria-hidden="true" /><p className="mt-1 text-2xl font-bold text-ink-900">{packs.length}</p><p className="text-[0.75rem] text-ink-500">Teaching packs</p></li>
                <li className="rounded-[10px] border border-parchment-400 bg-white p-4"><L.ShieldCheck className="size-6 text-referenced-500" aria-hidden="true" /><p className="mt-1 text-2xl font-bold text-ink-900">0</p><p className="text-[0.75rem] text-ink-500">Learner personal details we need</p></li>
            </ul>

            <Box title="Teaching Packs" icon="download">
                <ul className="divide-y divide-parchment-300">{packs.map((p) => <li key={p.key} className="flex flex-wrap items-center justify-between gap-2 py-2"><span><span className="block text-[0.875rem] font-semibold text-ink-900">{p.title}</span><span className="block text-[0.75rem] text-ink-500">{p.body}</span></span><a href={p.href} className={btnClass('outline', 'sm')}><L.Download className="size-3.5" />Download</a></li>)}</ul>
            </Box>

            <Box title="Class Tools (after verification)" icon="lock">
                <ul className="grid gap-3 sm:grid-cols-2">{TOOLS.map(([i, t, b]) => <li key={t} className="flex gap-2.5 rounded-[8px] border border-parchment-400 p-3 opacity-80"><L.Lock className="mt-0.5 size-4 shrink-0 text-ink-400" aria-hidden="true" /><span><span className="block text-[0.8125rem] font-semibold text-ink-900">{t}</span><span className="block text-[0.75rem] text-ink-600">{b}</span><span className="sr-only">{i}</span></span></li>)}</ul>
            </Box>

            <Box title="Request Educator Access" icon="graduation-cap">
                <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); form.post(`${BASE}/future-builders/educators`, { preserveScroll: true, onSuccess: () => form.reset() }); }}>
                    <Field label="Your name" error={form.errors.name}><Input required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></Field>
                    <Field label="School or programme" error={form.errors.school}><Input required value={form.data.school} onChange={(e) => form.setData('school', e.target.value)} /></Field>
                    <Field label="Work email" error={form.errors.email}><Input type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} /></Field>
                    <Field label="Role" error={form.errors.role}><Select value={form.data.role} onChange={(e) => form.setData('role', e.target.value)} options={roles} /></Field>
                    <Field label="Approximate number of learners (optional)" error={form.errors.learners}><Input type="number" min={1} value={form.data.learners} onChange={(e) => form.setData('learners', e.target.value)} /></Field>
                    <div className="flex items-end"><button type="submit" disabled={form.processing} className="inline-flex h-10 items-center gap-2 rounded-[6px] bg-referenced-500 px-4 font-semibold text-white">Request Access</button></div>
                </form>
            </Box>
        </FbPage>
    );
}
