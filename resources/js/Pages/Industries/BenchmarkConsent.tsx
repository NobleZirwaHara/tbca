import { router } from '@inertiajs/react';
import { Card, Chip, Cols, Dl, Tile, Ticks } from '@/Components/Industries/Kit';
import { Head1, WorkspacePage } from '@/Components/Industries/Layout';
import type { Engagement, IndustryBase } from '@/types/industries';

interface Props extends IndustryBase { e: Engagement | null; bind: { code: string; name: string }; bcountry: string; cur: string | null }

const LABEL: Record<string, string> = { yes: 'Yes, I consent', no: 'No, I do not consent', later: 'Ask me later' };

export default function BenchmarkConsent(p: Props) {
    const { bind, cur } = p;
    const choose = (choice: string) => router.post('/industries/engage/action', { do: 'consent', ind: bind.code, choice }, { preserveScroll: true });
    return (
        <WorkspacePage base={p} active="benchmark" label="Benchmark Contribution">
            <Head1 eyebrow="Mock-up Page 26" title="Benchmark Contribution Consent" desc="Contribute optional, non-identifiable data to help build independent sector benchmarks. Your decision is separate from your engagement and does not affect any service delivered to you." />
            <Card title="Why we ask" icon="shield">
                <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
                    {[['Independent', 'Benchmarks are built independently of TBCA and commercial interests.'], ['Non-identifiable', 'Your organisation cannot be identified in any publication.'], ['Aggregated only', 'Only combined sector data is analysed and published.']].map(([a, b]) => <div key={a}><b>{a}</b><div className="text-[0.82rem] text-ink-500">{b}</div></div>)}
                </div>
            </Card>
            <Cols>
                <Card title="Examples of data that may be contributed (banded)" icon="chart"><Ticks items={['Revenue / turnover band', 'Cost structure band', 'Production volume band', 'Input costs band', 'Yield / output band', 'Profitability band']} /></Card>
                <Card title="Data we never accept" icon="lock"><ul className="list-disc space-y-1 ps-5 text-[0.82rem]"><li>Names, emails, phone numbers</li><li>Identity numbers or personal data</li><li>Employee- or customer-level data</li><li>Bank account or payment details</li><li>Privileged, legal or confidential documents</li></ul></Card>
            </Cols>
            <Card title="Current benchmark status" icon="gauge">
                <Dl rows={[['Benchmark', `${bind.name} — ${p.bcountry}`], ['State', <Chip t="Collecting" tone="warn" />], ['Independent entities (n)', String(cur === 'yes' ? 1 : 0)], ['Threshold', 'B1 (30–49) → B2 (50–99)'], ['k-anonymity', 'Standard k = 5 · elevated k = 10']]} />
            </Card>
            <Card title="Your consent choice" icon="check" tone="gold">
                <p className="mb-2 text-[0.85rem]">Current selection: <b>{cur ? LABEL[cur] : 'No decision recorded'}</b></p>
                <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 md:grid-cols-3">
                    <Tile on={cur === 'yes'} onClick={() => choose('yes')}><b>Yes, I consent</b><span className="text-[0.8rem]">Contribute approved, non-identifiable, derived data. Withdraw any time.</span></Tile>
                    <Tile on={cur === 'no'} onClick={() => choose('no')}><b>No, I do not consent</b><span className="text-[0.8rem]">This will not affect any service to you.</span></Tile>
                    <Tile on={cur === 'later'} onClick={() => choose('later')}><b>Ask me later</b><span className="text-[0.8rem]">No data is used until you choose.</span></Tile>
                </div>
                <p className="mt-2 text-[0.72rem] text-ink-400">Recorded with timestamp, version and scope.</p>
            </Card>
        </WorkspacePage>
    );
}
