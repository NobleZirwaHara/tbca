import { Link, router } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Info, Scale, ShieldCheck, Users } from 'lucide-react';
import { AdvisorCard, ContextCard, IndustryFrame, NextSteps, StatusChips } from '@/Components/Insights/Industries';
import { Box, Chip, DynIcon } from '@/Components/Insights/Shared';
import type { IndustryContextValue, IndustryPage } from '@/types/insights';

interface Props {
    industry: IndustryPage;
    context: IndustryContextValue;
    categories: { name: string; count: number; text: string; icon: string }[];
}

export default function IndustryPartners({ industry: ind, context, categories }: Props) {
    const request = (category: string) =>
        router.post('/forms/partner-introduction', { section: 'industries', subject: `${ind.name} – ${category} partner introduction`, industry: ind.slug, category, redirect: `/industries/${ind.slug}/partners` }, { preserveScroll: true });

    return (
        <IndustryFrame
            title={`${ind.name} – Partner Directory`}
            crumbs={[{ label: 'Home', href: '/' }, { label: 'Industries', href: '/industries' }, { label: ind.name, href: `/industries/${ind.slug}` }, { label: 'Partners' }]}
            sidebar={
                <>
                    <ContextCard title="Your Sector Context" context={context} rows={[['Complexity Class', ind.complexityLabel], ['Regulatory State', ind.regulatoryState], ['Human Gate', ind.professionalGate === 'mandatory' ? 'Mandatory' : 'Advisory'], ['Visible Fees', 'T / P / X / S']]} />
                    <NextSteps title="What to Consider" items={["Confirm the partner's scope and limits.", 'Review their experience in your sub-sector.', 'Verify regulatory registrations.', 'Agree on fees, terms and deliverables.', 'All engagements are contracted with the partner.']} cta={{ label: 'Partner Engagement Guide', href: '/resources/limitations' }} />
                    <AdvisorCard title="Need Help Choosing?" text="Speak to a TBCA Advisor for guidance on the best professional route for your needs." label="Book Advisor Call" />
                </>
            }
        >
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl">
                    <h1 className="flex flex-wrap items-center gap-3 font-serif text-3xl font-bold text-ink-900">{ind.name} – Partner Directory <Chip tone="gold">{context.countryName}</Chip></h1>
                    <p className="mt-1 text-sm text-ink-700">Find the right professional-route partner(s) for your {ind.name} needs.</p>
                    <p className="text-xs text-ink-500">All partners listed below operate within the TBCA four-ledger model. Engagements are contracted between you and the professional firm.</p>
                </div>
                <StatusChips items={[{ label: 'Industry', value: ind.name }, { label: 'Country', value: context.countryName }, { label: 'Complexity Class', value: ind.complexityLabel }, { label: 'Regulatory State', value: ind.regulatoryState }]} />
            </div>

            <Box className="mt-5" title="How Professional Routes Work on TBCA">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {[
                        [Users, 'You engage the professional', 'You select and contract directly with an independent professional firm.'],
                        [Scale, 'Four-ledger transparency', 'Fees are transparently separated: T (TBCA), P (Partner), X (External), S (Statutory).'],
                        [ShieldCheck, 'Scope & boundaries', 'Scope, limitations and professional boundaries are clearly defined.'],
                        [BadgeCheck, 'Quality & compliance', 'Partners are verified and quality-monitored for your protection.'],
                    ].map(([I, t, s]) => {
                        const Icon = I as typeof Users;
                        return <div key={t as string} className="flex gap-2"><Icon className="size-6 shrink-0 text-ink-700" /><span><strong className="block text-[0.8125rem]">{t as string}</strong><span className="text-xs text-ink-500">{s as string}</span></span></div>;
                    })}
                    <div className="text-xs text-ink-600">Learn more about <Link href="/resources/limitations" className="font-semibold text-controlled-700">Professional Routes →</Link></div>
                </div>
            </Box>

            <h2 className="mt-6 text-lg font-semibold text-ink-900">Partner Categories in This Sector</h2>
            <p className="text-xs text-ink-500">Select a category to request an introduction to verified partners and their service capabilities.</p>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {categories.map((c) => (
                    <li key={c.name} className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><DynIcon name={c.icon} className="size-5 text-ink-600" />{c.name}</p>
                        <p className="mt-1 text-xs text-ink-700">{c.count} Partners</p>
                        <p className="text-xs text-ink-500">{c.text}</p>
                        <button type="button" onClick={() => request(c.name)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-controlled-700">View Partners <ArrowRight className="size-3" /></button>
                    </li>
                ))}
            </ul>

            <div className="mt-5 flex flex-col gap-3 rounded-[8px] border border-attested-500/30 bg-attested-50 p-4 sm:flex-row sm:items-center">
                <Info className="size-5 text-attested-700" />
                <p className="flex-1 text-[0.8125rem]">Not sure which partner category you need? Start with a sector-adapted diagnostic to get tailored recommendations.</p>
                <Link href={`/industries/${ind.slug}/diagnostic`} className="rounded-[4px] bg-gold-500 px-4 py-2 text-xs font-bold uppercase">Run Sector Diagnostic →</Link>
            </div>
        </IndustryFrame>
    );
}
