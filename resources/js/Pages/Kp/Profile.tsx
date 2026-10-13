import { Head } from '@inertiajs/react';
import * as L from 'lucide-react';
import KpFrame, { type KpShared } from '@/Components/Kp/KpFrame';
import { BtnLink, Ico } from '@/Components/Webinars/kit';

interface Props extends KpShared {
    author: { name: string; post_nominal: string; role: string; summary: string; bio: string[]; highlights: string[]; expertise: string[]; qualifications: string[]; languages: string[]; location: string; reviewed: string; state: string };
    numbers: { value: string; label: string; icon: string }[];
}

export default function Profile({ sections, author, numbers }: Props) {
    return (
        <KpFrame
            sections={sections}
            crumbs={[['Home', '/'], ['KP Thought Leadership', '/kp-thought-leadership'], ['About Kruger Phiri']]}
            eyebrow="Author Profile"
            title={`${author.name}, ${author.post_nominal}`}
            gold={author.role}
            lead={author.summary}
            actions={<><BtnLink href="/kp-thought-leadership/book" icon="calendar-days">Book KP</BtnLink><BtnLink href="/kp-thought-leadership/articles" tone="ghostDark" icon="file-text">Read the Articles</BtnLink></>}
            aside={
                <div className="rounded-[12px] border border-gold-600/60 bg-ink-950/80 p-5 text-[0.8125rem] text-parchment-200">
                    <p className="flex items-center gap-2 font-semibold text-verified-50"><L.BadgeCheck className="size-5 text-gold-400" aria-hidden="true" />Profile state: {author.state}</p>
                    <p className="mt-1">Reviewed {author.reviewed}</p>
                    <p className="mt-3 flex items-center gap-2"><L.MapPin className="size-4 text-gold-400" aria-hidden="true" />{author.location}</p>
                    <p className="mt-1 flex items-center gap-2"><L.Languages className="size-4 text-gold-400" aria-hidden="true" />{author.languages.join(', ')}</p>
                </div>
            }
        >
            <Head title="About Kruger Phiri | KP Thought Leadership" />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                <section className="rounded-[12px] border border-parchment-400 bg-white p-6">
                    <h2 className="font-serif text-[1.5rem] font-bold text-ink-900">Biography</h2>
                    {author.bio.map((p) => <p key={p.slice(0, 30)} className="mt-3 text-[0.9375rem] leading-relaxed text-ink-700">{p}</p>)}
                    <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                        {author.highlights.map((h) => <li key={h} className="flex items-center gap-2 rounded-[8px] bg-gold-50 px-3 py-2 text-[0.8125rem] font-semibold text-ink-800"><L.Star className="size-4 text-gold-600" aria-hidden="true" />{h}</li>)}
                    </ul>
                </section>
                <div className="space-y-4">
                    <section className="rounded-[12px] border border-parchment-400 bg-white p-5">
                        <h2 className="font-serif text-[1.25rem] font-bold text-ink-900">Areas of Expertise</h2>
                        <ul className="mt-2 space-y-1.5">{author.expertise.map((e) => <li key={e} className="flex gap-2 text-[0.8125rem] text-ink-700"><L.CircleCheck className="size-4 shrink-0 text-gold-600" aria-hidden="true" />{e}</li>)}</ul>
                    </section>
                    <section className="rounded-[12px] border border-parchment-400 bg-white p-5">
                        <h2 className="font-serif text-[1.25rem] font-bold text-ink-900">Qualifications</h2>
                        <ul className="mt-2 space-y-1.5">{author.qualifications.map((e) => <li key={e} className="flex gap-2 text-[0.8125rem] text-ink-700"><L.GraduationCap className="size-4 shrink-0 text-gold-600" aria-hidden="true" />{e}</li>)}</ul>
                    </section>
                </div>
            </div>
            <ul className="grid gap-3 rounded-[12px] bg-ink-950 p-5 sm:grid-cols-3 lg:grid-cols-5">
                {numbers.map((n) => <li key={n.label} className="flex items-center gap-3"><Ico name={n.icon} className="size-7 text-gold-500" /><span><span className="block font-serif text-2xl font-bold text-parchment-50">{n.value}</span><span className="text-[0.75rem] text-parchment-300">{n.label}</span></span></li>)}
            </ul>
            <p className="text-[0.75rem] text-ink-500">Profile details come from the verified TBCA leadership record. See the full record in <a href="/about/team/kruger-phiri" className="font-semibold text-gold-700">Our Team</a>.</p>
        </KpFrame>
    );
}
