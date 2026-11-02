import AiimPage from '@/Components/Aiim/Shell';
import { DocTable, ServiceRail, SheetTable, unitHref, VBars, type Sheet, type SvcRail } from '@/Components/Aiim/ProtoDesk';
import { Bars, Card, N } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

interface Envelope { unit: string; code: string; tierA: number; env: number }
interface Props extends AiimPageProps { envelopes: Envelope[]; plan: Sheet; rules: string[][]; reserved: string[][]; rail: SvcRail }

/** AIIM mock 74: Government & DFI Desk (prototype #gov-dfi). */
export default function Institutional({ envelopes, plan, rules, reserved, rail }: Props) {
    return (
        <AiimPage
            title="Government & DFI Desk"
            crumbs={[{ label: 'Government & DFI Desk' }]}
            subtitle="Page 74 · Investment promotion and DFI pipeline"
            description="For BITC, SEZA, CEDA, NDB, BDC and development partners: where Tier A demand sits and what the 90-day plan delivers."
            notice={false}
            rail={<ServiceRail rail={rail} />}
        >
            <div className="grid gap-4">
                <div className="grid gap-4 lg:grid-cols-2">
                    <Card title="Tier A ranked leads by unit"><VBars label="Tier A ranked leads by unit" items={envelopes.map((e) => ({ n: e.unit, v: e.tierA }))} /></Card>
                    <Card title="Envelopes (US$ m, weighted)"><Bars rows={envelopes.map((e) => ({ label: e.unit, value: e.env, text: N(e.env, 2), href: unitHref(e.code) }))} /></Card>
                </div>
                <Card title="90-day activation plan (K-5)"><SheetTable s={plan} bare /></Card>
                <Card title="Citizen-empowerment rules (K-3)">
                    <div className="grid gap-3"><DocTable rows={rules} /><DocTable rows={reserved} /></div>
                </Card>
            </div>
        </AiimPage>
    );
}
