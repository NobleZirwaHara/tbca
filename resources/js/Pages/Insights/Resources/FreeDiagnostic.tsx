import { useForm } from '@inertiajs/react';
import { Banknote, ClipboardList, FolderKanban, Gift, Info, Landmark, Lock, Rocket, ShieldCheck, TrendingUp } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Field, Select } from '@/Components/ui/Form';
import { Box, NeedSomething } from '@/Components/Insights/Shared';
import { PageTitle, ResourceFrame } from '@/Components/Insights/Resources';
import { cn } from '@/lib/cn';

const SITUATIONS = [
    ['starting', 'Starting or Validating', 'I am exploring an idea or validating opportunity.', Rocket],
    ['growing', 'Running & Growing', 'I have a business and want to improve performance.', TrendingUp],
    ['cashflow', 'Cash Flow Pressure', 'I have sales but cash flow is a challenge.', Banknote],
    ['funding', 'Seeking Funding', 'I am preparing to approach funders or investors.', Landmark],
    ['project', 'Project Development', 'I am preparing a project for financing.', FolderKanban],
] as const;
const PRIORITIES = [['sales', 'Improve Sales'], ['cashflow', 'Manage Cash Flow'], ['funding', 'Access Funding'], ['efficiency', 'Operational Efficiency'], ['planning', 'Business Planning'], ['market_entry', 'Market Entry'], ['project', 'Project Preparation'], ['legal', 'Legal & Compliance'], ['digital', 'Digital & Technology'], ['skills', 'Skills & Capacity'], ['other', 'Other (specify)']];

export default function FreeDiagnostic({ industries }: { industries: string[] }) {
    const form = useForm<{ role: string; business_type: string; industry: string; country: string; province: string; stage: string; situation: string; priorities: string[] }>({ role: '', business_type: '', industry: '', country: 'South Africa', province: '', stage: '', situation: '', priorities: [] });
    const err = form.errors as Record<string, string>;
    const toggle = (p: string) => {
        const has = form.data.priorities.includes(p);
        if (!has && form.data.priorities.length >= 3) return;
        form.setData('priorities', has ? form.data.priorities.filter((x) => x !== p) : [...form.data.priorities, p]);
    };

    return (
        <ResourceFrame title="Free Business Diagnostic" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Free Diagnostic Entry' }]}>
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                <div>
                    <PageTitle title="Start Your Free Business Diagnostic" intro="Answer a few quick questions so we can understand your situation and recommend the most relevant free resources and next steps." />
                    <p className="mt-2 flex items-center gap-2 text-xs text-ink-600"><Info className="size-4 text-gold-600" /> This is a no-obligation R0 diagnostic. Your information is used only to provide relevant guidance.</p>
                    <form onSubmit={(e) => { e.preventDefault(); form.post('/resources/free-diagnostic'); }} className="mt-5 space-y-6 rounded-[8px] border border-parchment-400 bg-white p-5" noValidate>
                        <section>
                            <h2 className="font-serif text-lg font-semibold">1. About Your Business or Project</h2>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                <Field label="I am a:" required error={err.role}>{(id) => <Select id={id} value={form.data.role} onChange={(e) => form.setData('role', e.target.value)} options={['Founder / Owner', 'Executive / Manager', 'Project Sponsor', 'Investor / Funder', 'Adviser / Consultant', 'Public Sector Official', 'Student / Researcher']} placeholder="Select your role" />}</Field>
                                <Field label="Business / Project Type:" required error={err.business_type}>{(id) => <Select id={id} value={form.data.business_type} onChange={(e) => form.setData('business_type', e.target.value)} options={['Startup', 'SME', 'Corporate', 'NGO / NPO', 'Public Project', 'Infrastructure Project']} placeholder="Select type" />}</Field>
                                <Field label="Industry / Sector:" required error={err.industry}>{(id) => <Select id={id} value={form.data.industry} onChange={(e) => form.setData('industry', e.target.value)} options={industries} placeholder="Select industry" />}</Field>
                                <Field label="Country / Region:" required error={err.country}>{(id) => <Select id={id} value={form.data.country} onChange={(e) => form.setData('country', e.target.value)} options={['South Africa', 'Rest of SADC', 'East Africa', 'West Africa', 'North Africa', 'Outside Africa']} />}</Field>
                                <Field label="Province / State:" error={err.province}>{(id) => <Select id={id} value={form.data.province} onChange={(e) => form.setData('province', e.target.value)} options={['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Limpopo', 'Mpumalanga', 'North West', 'Free State', 'Northern Cape']} placeholder="Select province (optional)" />}</Field>
                                <Field label="Years in Operation / Stage:" required error={err.stage}>{(id) => <Select id={id} value={form.data.stage} onChange={(e) => form.setData('stage', e.target.value)} options={['Idea stage', 'Less than 1 year', '1-3 years', '3-10 years', '10+ years']} placeholder="Select stage" />}</Field>
                            </div>
                        </section>
                        <section>
                            <h2 className="font-serif text-lg font-semibold">2. What Best Describes Your Current Situation?</h2>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-5" role="radiogroup" aria-label="Current situation">
                                {SITUATIONS.map(([k, t, s, I]) => (
                                    <button key={k} type="button" role="radio" aria-checked={form.data.situation === k} onClick={() => form.setData('situation', k)} className={cn('rounded-[8px] border p-3 text-left', form.data.situation === k ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-parchment-400 hover:border-gold-300')}>
                                        <I className="size-6 text-gold-700" /><span className="mt-1 block font-serif text-sm font-semibold">{t}</span><span className="text-[0.6875rem] text-ink-500">{s}</span>
                                    </button>
                                ))}
                            </div>
                            {err.situation && <p role="alert" className="mt-1 text-xs text-risk-500">{err.situation}</p>}
                        </section>
                        <section>
                            <h2 className="font-serif text-lg font-semibold">3. What Are Your Top Priorities? <span className="font-sans text-xs font-normal">(Select up to 3)</span></h2>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {PRIORITIES.map(([k, l]) => <label key={k} className={cn('flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1 text-xs', form.data.priorities.includes(k) ? 'border-gold-500 bg-gold-50' : 'border-parchment-400')}><input type="checkbox" className="accent-gold-600" checked={form.data.priorities.includes(k)} onChange={() => toggle(k)} />{l}</label>)}
                            </div>
                            {(err.priorities ?? err['priorities.0']) && <p role="alert" className="mt-1 text-xs text-risk-500">{err.priorities ?? err['priorities.0']}</p>}
                        </section>
                        <div className="flex items-center gap-4">
                            <button type="submit" disabled={form.processing} className="rounded bg-gold-500 px-5 py-2.5 text-sm font-bold">Get My Free Diagnostic →</button>
                            <span className="flex items-center gap-1 text-xs text-ink-500"><Lock className="size-3.5" /> Secure. Private. No spam.</span>
                        </div>
                    </form>
                </div>
                <aside className="space-y-4">
                    <Box title={<span className="flex items-center gap-2"><ClipboardList className="size-5 text-gold-700" />How It Works</span>}><ol className="list-decimal space-y-1.5 pl-4 text-xs"><li>You answer a few questions (2–3 mins)</li><li>We match your needs to relevant resources</li><li>You receive instant recommendations</li><li>You can then explore or request professional support</li></ol></Box>
                    <Box title={<span className="flex items-center gap-2"><Gift className="size-5 text-gold-700" />What You'll Receive</span>}><ul className="space-y-1 text-xs">{['Personalised resource recommendations', 'Links to relevant free guides and tools', 'Next-step suggestions', 'Option to start a deeper diagnostic'].map((t) => <li key={t}>✓ {t}</li>)}</ul></Box>
                    <Box title={<span className="flex items-center gap-2"><ShieldCheck className="size-5 text-gold-700" />We Value Your Privacy</span>}><p className="text-xs">Your information is never sold. Used only to provide relevant guidance. See our <Link href="/resources/data-statement" className="text-gold-700 underline">Privacy Policy</Link> for full details.</p></Box>
                    <NeedSomething />
                </aside>
            </div>
        </ResourceFrame>
    );
}
