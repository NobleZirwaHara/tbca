import { Link } from '@inertiajs/react';
import { Building2, Calendar, CheckCircle2, MapPin, Quote, Rocket, Star, TrendingUp, Users, Wrench } from 'lucide-react';
import { Box, Chip } from '@/Components/Insights/Shared';
import { ResourceFrame } from '@/Components/Insights/Resources';
import type { ResourceCard as RC, ResourceDetail } from '@/types/insights';

interface CaseMeta { industry: string; companySize: string; location: string; period: string; services: string; quote: string; quoteBy: string; challenge: string; solution: string; results: { value: string; label: string }[]; helped: string[]; outcome: string; testimonial: string }

export default function CaseStudy({ resource: r, related }: { resource: ResourceDetail; related: RC[] }) {
    const m = r.meta as unknown as CaseMeta;
    return (
        <ResourceFrame title={r.title} crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Case Studies', href: '/resources/guides-reports?type=case-study' }, { label: r.title }]}>
            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                <div className="space-y-5">
                    <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
                        <div>
                            <Chip tone="gold">Case Study</Chip>
                            <h1 className="mt-2 font-serif text-3xl font-bold text-ink-900">{r.title}</h1>
                            <p className="mt-2 text-sm text-ink-700">{r.summary}</p>
                            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-5">
                                {[[Building2, 'Industry', m.industry], [Users, 'Company Size', m.companySize], [MapPin, 'Location', m.location], [Calendar, 'Engagement Period', m.period], [Wrench, 'Services Used', m.services]].map(([I, k, v]) => { const Icon = I as typeof Users; return <div key={k as string}><Icon className="size-5 text-ink-500" /><dt className="mt-1 font-semibold">{k as string}</dt><dd className="text-ink-600">{v as string}</dd></div>; })}
                            </dl>
                        </div>
                        <div className="grid grid-cols-2 overflow-hidden rounded-[8px] bg-ink-950 text-parchment-100">
                            <div className="bg-[linear-gradient(135deg,#2a2a33,#121217)] p-4"><TrendingUp className="size-16 text-gold-500/60" /></div>
                            <blockquote className="p-4 text-xs"><Quote className="size-6 text-gold-400" /><p className="mt-2">{m.quote}</p><footer className="mt-3 border-t border-gold-600 pt-2 text-gold-300">— {m.quoteBy}</footer></blockquote>
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Box title="The Challenge"><p className="text-sm text-ink-700">{m.challenge}</p></Box>
                        <Box title="The Solution"><p className="text-sm text-ink-700">{m.solution}</p></Box>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Box title="Key Results Achieved"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{m.results.map((x) => <div key={x.label}><p className="text-2xl font-bold text-verified-700">{x.value}</p><p className="text-[0.6875rem] text-ink-600">{x.label}</p></div>)}</div></Box>
                        <Box title="How We Helped"><ul className="space-y-1.5 text-xs">{m.helped.map((h) => <li key={h} className="flex gap-2"><CheckCircle2 className="size-4 text-verified-500" />{h}</li>)}</ul></Box>
                    </div>
                    <div className="flex flex-col gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4 sm:flex-row sm:items-center">
                        <Rocket className="size-8 text-gold-700" />
                        <div className="flex-1"><p className="font-serif text-lg font-semibold">Ready to Achieve Similar Results?</p><p className="text-xs">Let our AI Agents and Specialists help you solve your business challenges.</p></div>
                        <Link href="/resources/free-diagnostic" className="rounded bg-gold-500 px-4 py-2 text-sm font-bold">Start Your Business Diagnostic →</Link>
                    </div>
                </div>
                <aside className="space-y-4">
                    <Box title="At a Glance"><dl className="space-y-2 text-xs">{[['Industry', m.industry], ['Company Size', m.companySize], ['Location', m.location], ['Engagement', m.period], ['Services', m.services], ['Outcome', m.outcome]].map(([k, v]) => <div key={k} className="grid grid-cols-[6rem_1fr] gap-2"><dt className="text-ink-500">{k}:</dt><dd>{v}</dd></div>)}</dl></Box>
                    <Box title="Client Testimonial"><p className="flex gap-0.5 text-gold-500">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className="size-4 fill-current" />)}</p><p className="mt-2 text-sm italic">“{m.testimonial}”</p><p className="mt-2 text-xs text-ink-500">— {m.quoteBy}</p></Box>
                    <Box title="Explore Next Steps"><p className="text-xs text-ink-600">Explore related guides, tools and services.</p><ul className="mt-2 space-y-1 text-xs">{related.map((x) => <li key={x.id}><Link href={x.url} className="text-gold-700 hover:underline">{x.title}</Link></li>)}</ul><Link href="/resources/library" className="mt-3 block rounded border border-gold-500 py-1.5 text-center text-xs font-semibold text-gold-800">View Related Resources →</Link></Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
