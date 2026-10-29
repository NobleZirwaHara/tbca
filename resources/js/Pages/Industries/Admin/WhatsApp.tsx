import { A, Card, Cols, Kpi, Kpis, STable, StatusChip, Ticks } from '@/Components/Industries/Kit';
import { AdminPage } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

interface Props extends IndustryBase { match: { total: number; matched: number; priced: number; unmatched: number }; flow: string; ref: string; due: string }

const WAF: [string, string, string, string, string, string[]][] = [
    ['WA-IN-001', 'Welcome & How We Help', 'Welcome / orientation', 'S0', 'Informational', ['Hi 👋 I am NIKIWE from TBCA.', 'I can help you pick an industry, start a diagnostic or reach an advisor. Reply 1, 2 or 3.']],
    ['WA-IN-002', 'Industry Selection Support', 'Selection guidance', 'S0–S1', 'Informational', ['Tell me in one line what your business does.', 'Thanks — that looks like {industry}. Open the selector to confirm: {link}']],
    ['WA-IN-003', 'Control Resolution Reminder', 'Action reminder', 'S2–S3', 'Reminder', ['Reminder: 2 controls are open for {ref}.', 'Resolve them in your portal before quotation: {link}']],
    ['WA-IN-004', 'Engagement Setup Next Steps', 'Guidance', 'S3–S4', 'Informational', ['Your quotation {ref} is ready to approve in the portal.']],
    ['WA-IN-005', 'Compliance & Monitoring Alerts', 'Regulatory / compliance', 'S5–S8', 'Reminder', ['{obligation} is due on {date}. Details in your compliance calendar.']],
    ['WA-IN-006', 'Professional Route Guidance', 'Routing guidance', 'Regulated only', 'Informational', ['This part needs a licensed professional. We will introduce a partner — no advice is given on WhatsApp.']],
    ['WA-IN-007', 'Risk / Data Quality Alert', 'Risk notification', 'S1–S8', 'Alert', ['A re-classification notice is waiting for you: {link}']],
    ['WA-IN-008', 'Human Support Escalation', 'Support', 'All', 'Support', ['Connecting you to a TBCA advisor. Expected response: under 15 minutes in office hours.']],
    ['WA-IN-009', 'Benchmark Contribution Invite', 'Opt-in invitation', 'S5', 'Support', ['Would you like to help build anonymous sector benchmarks? It is optional. Decide in the portal: {link}']],
    ['WA-IN-010', 'General Help & FAQs', 'General support', 'All', 'Informational', ['Ask me about industries, countries, prices or your engagement status.']],
];

export default function WhatsApp(p: Props) {
    const f = WAF.find((x) => x[0] === p.flow) ?? WAF[0];
    const fill = (s: string) => s.replace('{industry}', p.ind.name).replace('{ref}', p.ref).replace('{link}', 'portal link').replace('{obligation}', 'VAT return').replace('{date}', p.due);
    return (
        <AdminPage active="whatsapp" title="Sector-Aware WhatsApp Flow Set" eyebrow="Support & notifications only · Page 35" desc="Pre-approved WhatsApp flows tailored to each industry and lifecycle stage — support, reminders and guidance only." match={p.match}>
            <Kpis>
                <Kpi l="Flows" v="10" s="WA-IN-001 to 010" icon="msg" />
                <Kpi l="Industries covered" v="17" s="100 %" icon="layers" />
                <Kpi l="Lifecycle stages" v="9" s="S0–S8" icon="clock" />
                <Kpi l="Active" v="10" s="100 %" icon="check" />
            </Kpis>
            <Cols>
                <Card title="Flow set" icon="msg">
                    <STable compact head={['Flow', 'Name', 'Intent', 'Stages', 'Type', '']} rows={WAF.map((r) => [<span className="font-mono text-[0.72rem]">{r[0]}</span>, <b className="text-[0.8rem]">{r[1]}</b>, r[2], r[3], <StatusChip s={r[4] === 'Alert' ? 'Alert' : 'Active'} />, <A sm href={`/admin/industries/whatsapp?flow=${r[0]}`}>Preview</A>])} />
                </Card>
                <Card title={`Preview · ${f[0]} ${f[1]}`} icon="msg">
                    <div className="flex max-h-[340px] flex-col gap-1.5 overflow-auto rounded-[6px] bg-[#e9e3d8] p-3">
                        {f[5].map((t, i) => <p key={i} className="m-0 max-w-[85%] rounded-[8px] bg-white px-2.5 py-1.5 text-[0.78rem]">{fill(t)}</p>)}
                        <p className="m-0 max-w-[85%] self-end rounded-[8px] bg-[#d9fdd3] px-2.5 py-1.5 text-[0.78rem]">OK, thanks</p>
                    </div>
                    <p className="mt-2 text-[0.72rem] text-ink-400">Variables filled from your current context ({p.ind.name}).</p>
                </Card>
            </Cols>
            <Card title="Messaging guardrails" icon="shield"><Ticks items={['No advice or opinions', 'No gated output or documents released', 'Escalate to the portal for outputs', 'Respect opt-in and consent rules', 'Log all conversations and outcomes']} /></Card>
        </AdminPage>
    );
}
