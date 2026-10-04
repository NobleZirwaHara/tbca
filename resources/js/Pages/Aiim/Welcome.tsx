import { CheckCircle2, Download, HelpCircle, Search, Sparkles, Star, TrendingUp } from 'lucide-react';
import AiimPage, { SectionCard, SelectionBox, DeeperBox } from '@/Components/Aiim/Shell';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    account: Record<string, string>;
}

export default function Welcome({ account, snapshot }: Props) {
    const rows: [string, string][] = [['Full Name', account.name], ['Email Address', account.email], ['Country', account.country], ['Province', account.province], ['Sector Focus', account.sector], ['Account Type', account.type], ['Registration Date', account.registered], ['Account ID', account.accountId]];
    const summary: [string, string | number][] = [
        ['Account Status', 'Active'], ['Access Level', 'Standard (Free)'], ['Free Access', 'Included'], ['Saved Items', snapshot?.saved ?? 0], ['Comparison Items', snapshot?.comparisons ?? 0],
        ['Reports Generated', snapshot?.reports ?? 0], ['Advisor', 'Not Assigned'], ['Verification Status', account.verification], ['Entitlement Status', 'Active'], ['Introduced By', account.introducedBy], ['Payment Status', 'No Payments'],
    ];
    return (
        <AiimPage
            title="Registration Confirmation"
            crumbs={[{ label: 'Registration' }, { label: 'Registration Confirmation' }]}
            heading={<>Registration Confirmation <CheckCircle2 className="size-7 text-verified-500" /></>}
            subtitle="Welcome to AIIM – Africa Investment Intelligence Map."
            description="Your account has been created successfully."
            rail={<><SelectionBox /><DeeperBox title="Why Upgrade to Premium?" text="Unlock premium reports, expert analysis, due diligence data and advanced export options." /></>}
        >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <SectionCard>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <div className="flex gap-3">
                                <CheckCircle2 className="size-12 shrink-0 text-verified-500" />
                                <div><h2 className="font-semibold">Your AIIM account is ready.</h2><p className="text-xs text-ink-600">You now have access to curated, human-reviewed intelligence on opportunities, projects, investors, funders and more.</p></div>
                            </div>
                            <dl className="mt-4 space-y-1.5 text-sm">{rows.map(([k, v]) => <div key={k} className="grid grid-cols-2 gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
                            <p className="mt-3 text-xs text-ink-400">Keep your login details secure. Do not share your account or password.</p>
                        </div>
                        <div>
                            <h3 className="mb-3 font-semibold">What You Can Do Now</h3>
                            <ul className="space-y-3 text-xs">
                                {[[Search, 'Explore AIIM', 'Search opportunities, projects, investors, funders and trade corridors.'], [Star, 'Save & Compare', 'Save items to your workspace and compare key metrics.'], [Download, 'Export Results', 'Export search results and reports in CSV or PDF.'], [TrendingUp, 'Upgrade Anytime', 'Unlock premium reports, advanced analytics and expert support.'], [HelpCircle, 'Get Help', 'Speak to our team or request a call back.']].map(([I, t, d]) => {
                                    const Icon = I as typeof Search;
                                    return <li key={t as string} className="flex gap-2"><Icon className="size-4 shrink-0 text-risk-500" /><span><strong className="block">{t as string}</strong>{d as string}</span></li>;
                                })}
                            </ul>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <ButtonLink href="/aiim/workspace" size="lg" trailingIcon="arrow-right">Go to AIIM Dashboard</ButtonLink>
                        <ButtonLink href="/aiim/opportunities" size="lg" variant="outline" trailingIcon="arrow-right">Explore Opportunities</ButtonLink>
                    </div>
                </SectionCard>
                <div className="space-y-4">
                    <SectionCard dark title="Your Account Summary">
                        <dl className="space-y-1.5 text-xs">{summary.map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-400">{k}</dt><dd className={k === 'Verification Status' ? 'text-gold-400' : 'font-medium'}>{v}</dd></div>)}</dl>
                    </SectionCard>
                    <SectionCard title="Need Expert Assistance?">
                        <p className="text-xs text-ink-600">Our team can help you get the most out of AIIM.</p>
                        <ButtonLink href="/aiim/workspace/advisor-request" size="sm" variant="outline" className="mt-3"><Sparkles className="size-4" />Speak to an Advisor</ButtonLink>
                    </SectionCard>
                </div>
            </div>
        </AiimPage>
    );
}
