/* P16 Country Privacy and Data Residency (prototype pages-profile.js #/c/{ISO}/privacy). */
import type { ReactNode } from 'react';
import { Card, Dl, Kpi, Kpis, Note, STable, StatusChip, TagP, TagR } from '@/Components/Industries/Kit';
import { CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import type { ProfileProps } from '@/Components/CountryHub/Profile';

const PROCESSORS = [['Amazon Web Services (AWS)', 'Hosting, storage, disaster recovery', 'South Africa (Cape Town)', 'Signed', 'Approved'], ['SendGrid (Twilio)', 'Transactional emails', 'EU (Ireland)', 'Signed', 'Approved'], ['QuickBooks Online (Intuit)', 'Invoicing and financial records', 'US', 'Signed', 'Approved'], ['Google Analytics 4', 'Usage analytics (pseudonymised)', 'EU (Germany)', 'Signed', 'Approved']];

export default function Privacy({ base }: ProfileProps) {
    const { c } = base;
    const law: [ReactNode, ReactNode] = c.isBW
        ? [<>Data Protection Act, 2018 <TagR /></>, <>Information and Data Protection Commission <TagR /></>]
        : c.isZA ? ['POPIA (Act 4 of 2013)', 'Information Regulator (IR)'] : [<>Not assessed <TagP /></>, 'Not assessed'];
    return (
        <CountryPage base={base} pageKey="privacy">
            <CountryHead base={base} pageKey="privacy" title="Country Privacy and Data Residency" desc={`Understand how your data is collected, stored, processed and protected for ${c.name}.`} />
            <Kpis>
                <Kpi l="Privacy Regime" v={law[0]} icon="shield" />
                <Kpi l="Regulator" v={law[1]} icon="users" />
                <Kpi l="Primary storage" v="South Africa" s="AWS Africa (Cape Town)" icon="db" />
                <Kpi l="Cross-border transfer" v="Permitted with safeguards" s="SCCs · TIA · encryption" icon="lock" />
            </Kpis>
            <Card title="Privacy Overview" icon="shield">
                <Dl rows={[['Privacy law', law[0]], ['Regulator', law[1]], ['Data Protection Officer', 'Yes'], ['Lawful basis', 'Consent / Contract / Legal obligation'], ['Cross-border transfer', 'Permitted with safeguards'], ['Automated decision making', 'No'], ["Children's data", 'Not knowingly collected'], ['Breach notification', '72 hours to regulator and affected parties'], ['Privacy impact assessment', 'Conducted for high-risk processing']]} />
                {c.isBW && <Note className="mt-2.5"><TagP /> Botswana privacy regime is not covered by the BW-1.0 pack; the law and regulator shown are general reference and must be confirmed (proposed new data gap).</Note>}
            </Card>
            <Card title="Third-Party Processors and Data Recipients" icon="db" sub="TBCA platform processors (mock-up P16)">
                <STable head={['Processor', 'Purpose', 'Location', 'Agreement', 'Status']} rows={PROCESSORS.map((r) => [r[0], r[1], r[2], r[3], <StatusChip key="s" s={r[4]} />])} />
            </Card>
        </CountryPage>
    );
}
