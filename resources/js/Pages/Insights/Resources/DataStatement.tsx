import { Link } from '@inertiajs/react';
import { Check, Database, FolderOpen, Info, Lock, ShieldCheck } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Box } from '@/Components/Insights/Shared';
import { PageTitle, ResourceFrame } from '@/Components/Insights/Resources';

const BLOCKS: [string, typeof Database, string | null, string[], string | null][] = [
    ['1. Where Our Data Comes From', Database, null, ['Publicly available sources (government, multilateral institutions, regulators, open data portals)', 'Licensed third-party data providers', 'Partner and contributor submissions', 'User-provided information (where you choose to share it)', 'Automated data collection tools (where permitted by law and terms)'], null],
    ['2. How We Use Data', ShieldCheck, null, ['To create and maintain high-quality guides, tools and resources', 'To personalise your experience and recommendations', 'To improve our products, services and user support', 'To analyse trends and measure platform performance', 'To comply with legal and regulatory obligations'], 'We never sell your personal data.'],
    ['3. Data Quality and Accuracy', ShieldCheck, 'We use a multi-step review process to ensure our data is accurate, current and relevant:', ['Source verification', 'Quality checks and validation', 'Human oversight and expert review', 'Regular updates and refresh cycles'], null],
    ['4. Data Protection', Lock, 'We implement industry-standard safeguards to protect data confidentiality, integrity and availability:', ['Encryption in transit and at rest', 'Role-based access controls', 'Secure infrastructure and monitoring', 'Regular security assessments'], null],
];

export default function DataStatement() {
    return (
        <ResourceFrame title="Data Statement" crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Data Statement' }]}>
            <PageTitle title="Data Statement" intro="At TBCA, we are committed to using data responsibly, transparently and ethically to deliver accurate, decision-useful resources and insights. This statement explains where our data comes from, how we use it, how we protect it, and what rights you have." />
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div className="grid gap-4 md:grid-cols-2">
                    {BLOCKS.map(([t, I, intro, items, note]) => (
                        <Box key={t} title={<span className="flex items-center gap-2 font-serif text-lg"><I className="size-6 text-gold-700" />{t}</span>}>
                            {intro && <p className="mb-2 text-xs text-ink-600">{intro}</p>}
                            <ul className="space-y-1.5 text-xs">{items.map((i) => <li key={i} className="flex gap-2"><Check className="size-3.5 shrink-0 text-verified-500" />{i}</li>)}</ul>
                            {note && <p className="mt-3 text-xs font-semibold">{note}</p>}
                        </Box>
                    ))}
                </div>
                <aside className="space-y-4">
                    <Box tone="blue" title={<span className="flex items-center gap-2"><Info className="size-5" />Transparency is our standard</span>}>
                        <p className="text-xs">You have the right to know how we collect, use and share data. If you have any questions, we are here to help.</p>
                        <button type="button" onClick={() => openAskQuestion({ subject: 'Data question for the Data Team', section: 'resources' })} className="mt-2 text-xs font-semibold text-controlled-700">Contact Our Data Team →</button>
                    </Box>
                    <Box title={<span className="flex items-center gap-2"><Lock className="size-5" />Your Data Rights</span>}>
                        <p className="text-xs">You have the right to:</p>
                        <ul className="mt-2 space-y-1.5 text-xs">{['Access the data we hold about you', 'Request correction or update', 'Request deletion (where no legal obligation applies)', 'Object to or restrict certain processing', 'Withdraw consent at any time'].map((t) => <li key={t} className="flex gap-2"><Check className="size-3.5 text-verified-500" />{t}</li>)}</ul>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold"><Link href="/resources/preferences" className="text-verified-700">Preference Centre →</Link><Link href="/resources/withdrawal" className="text-verified-700">Withdraw / erase →</Link></div>
                    </Box>
                    <Box tone="amber" title={<span className="flex items-center gap-2"><FolderOpen className="size-5" />Questions?</span>}><p className="text-xs">If you have questions about our data practices or this statement, please contact:</p><a href="mailto:data@thebusinessclinic.africa" className="mt-1 block text-sm font-semibold text-gold-800">data@thebusinessclinic.africa</a></Box>
                </aside>
            </div>
        </ResourceFrame>
    );
}
