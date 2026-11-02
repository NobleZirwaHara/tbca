import { Link } from '@inertiajs/react';
import AiimPage from '@/Components/Aiim/Shell';
import { ServiceRail, sheetHref, type SvcRail } from '@/Components/Aiim/ProtoDesk';
import { Card, Chip, DataTable, STable } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

interface Endpoint { sheet: string; rows: number; cols: number }
interface ApiKeyRow { name: string; preview: string; created: string; status: string }

const path = (sheet: string) => `GET /v1/bw/${sheet.replace(/^(BW|I2)_/, '').toLowerCase()}`;

/** AIIM mock 73: API & White Label Management (prototype #api). One endpoint per register. */
export default function Developer({ endpoints, rail, keys }: AiimPageProps & { endpoints: Endpoint[]; rail: SvcRail; keys: ApiKeyRow[] }) {
    return (
        <AiimPage
            title="API & White Label Management"
            crumbs={[{ label: 'API & White Label Management' }]}
            subtitle="Page 73 · Endpoints map one-to-one to the CPDS-1.2 registers"
            notice={false}
            rail={<ServiceRail rail={rail} />}
        >
            <div className="grid gap-4">
                <Card title="Endpoints (prototype)">
                    <DataTable<Endpoint> name="aiim-endpoints" size={15} rows={endpoints} cols={[
                        { k: 'sheet', l: 'Endpoint', v: (r) => path(r.sheet), r: (r) => <span className="font-mono">{path(r.sheet)}</span> },
                        { k: 'rows', l: 'Rows', num: true },
                        { k: 'cols', l: 'Fields', num: true },
                        { k: 'sheet', l: 'Register', r: (r) => <Link href={sheetHref(r.sheet)} className="font-semibold text-controlled-700 hover:underline">{r.sheet}</Link> },
                    ]} />
                </Card>
                <Card title="White-label portal">
                    <p className="text-[0.86rem] text-ink-700">Country cockpit, map and sub-sections under your brand, fed by the same registers (AAB-EMB-220).</p>
                </Card>
                {keys.length > 0 && (
                    <Card title="Your API keys">
                        <STable compact head={['Name', 'Key', 'Created', 'Status']} rows={keys.map((k) => [k.name, <span key="k" className="font-mono">{k.preview}</span>, k.created, <Chip key="s" t={k.status} tone={k.status === 'active' ? 'ok' : 'grey'} />])} />
                    </Card>
                )}
            </div>
        </AiimPage>
    );
}
