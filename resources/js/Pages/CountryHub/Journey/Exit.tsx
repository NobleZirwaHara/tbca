/* P25 Country Exit and Deregistration (prototype #/c/{ISO}/exit). */
import { Card, Cols, Dl, Kpi, Kpis, STable, StatusChip, TagP, TagR, Ticks } from '@/Components/Industries/Kit';
import { CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import { JSteps, MeterCell } from '@/Components/CountryHub/Journey';
import type { CountryBase } from '@/types/countryHub';

const PHASES: [string, string, number, string][] = [['1. Planning & Approval', 'Plan, approvals and resources', 100, 'Completed'], ['2. Decommissioning', 'Disable new activity, wind-down', 60, 'In Progress'], ['3. Object Closure', 'Close commercial and operational objects', 30, 'In Progress'], ['4. Deregistration', 'Deregister from authorities & platforms', 0, 'Not Started'], ['5. Post-Exit Monitoring', 'Retention, obligations, final review', 0, 'Not Started']];

export default function Exit({ base }: { base: CountryBase }) {
    const { c } = base;
    const B = c.isBW;
    const tasks: [string, string, string][] = [[B ? 'BURS deregistration (VAT, CIT)' : 'SARS deregistration', 'Tax Team', 'In Progress'], [B ? 'CIPA deregistration' : 'CIPC deregistration', 'Legal Team', 'In Progress'], ['Bank account closure', 'Finance Team', 'Not Started'], ['Payment provider deregistration', 'Finance Team', 'Not Started'], ['Permit surrender (sector issuers)', 'Legal Team', 'Not Started'], ['Domain & digital assets closure', 'IT Team', 'Not Started']];
    return (
        <CountryPage base={base} pageKey="exit">
            <CountryHead base={base} pageKey="exit" title="Country Exit and Deregistration" desc={`Safely plan and execute exit from the ${c.name} market, including object closure, data handling and deregistration.`} />
            <JSteps c={c} active="exit" />
            <Kpis>
                <Kpi l="Exit Readiness" v="64 %" s={<>9 / 14 complete <TagP /></>} icon="chart" />
                <Kpi l="Blocking Issues" v={2} s="Require attention" icon="alert" />
                <Kpi l="Target Exit Date" v="30 Jan 2027" icon="clock" />
                <Kpi l="Data retention" v="7 years" s="Tax, legal and regulatory" icon="db" />
            </Kpis>
            <Card title="Exit Phases" icon="layers">
                <STable head={['Phase', 'Description', 'Progress', 'Status']} rows={PHASES.map((p) => [<b key="p">{p[0]}</b>, p[1], <MeterCell key="m" p={p[2]} min={120} />, <StatusChip key="s" s={p[3]} />])} />
            </Card>
            <Card title="Key Deregistration Tasks" icon="file">
                <STable head={['Task', 'Owner', 'Status']} rows={tasks.map((t) => [<span key="t">{t[0]}{B && /BURS|CIPA/.test(t[0]) && <> <TagR /></>}</span>, t[1], <StatusChip key="s" s={t[2]} />])} />
            </Card>
            <Cols n={2}>
                <Card title="Post-Exit Obligations">
                    <Ticks items={['Record retention — 7 years or as required by law', 'Final tax filings and disputes may continue', 'Existing contracts honoured until expiry', 'Monitor regulatory changes affecting obligations', 'Post-exit review 90 days after completion']} />
                </Card>
                <Card title="Data & Records Handling">
                    <Dl rows={[['Retention basis', 'Tax, legal and regulatory'], ['Data disposition', 'Secure deletion'], ['Records storage', 'Cloud archive (encrypted)'], ['Access after exit', 'Restricted (admin only)']]} />
                </Card>
            </Cols>
        </CountryPage>
    );
}
