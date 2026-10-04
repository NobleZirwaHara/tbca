import { Link } from '@inertiajs/react';
import { Chip } from '@/Components/Aiim/Chips';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { DeeperBox, SelectionBox } from '@/Components/Aiim/Shell';
import { SimpleTable } from '@/Components/ui/Kit';
import type { AiimPageProps } from '@/types/aiim';
import type { EntProps } from './Entitlement';

export default function Entitlements({ items }: AiimPageProps & { items: EntProps[] }) {
    return (
        <AiimPage title="My Entitlements" crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Entitlements' }]} subtitle="Paid access to premium objects, briefs and intelligence." rail={<><SelectionBox /><DeeperBox /></>}>
            <SimpleTable
                columns={['Entitlement', 'Object', 'Product', 'Access', 'Views', 'Amount', 'Status', 'Expires']}
                rows={items.map((e) => [
                    <Link key="r" href={`/aiim/workspace/entitlements/${e.reference}`} className="font-mono text-gold-700 hover:underline">{e.reference}</Link>,
                    e.title, e.productType, e.access, e.viewsIncluded ? `${e.viewsUsed}/${e.viewsIncluded}` : '—', zar2(e.amount),
                    <Chip key="s" tone={e.status === 'active' ? 'good' : 'bad'}>{e.status}</Chip>, e.expires ?? '—',
                ])}
                empty="No entitlements yet. Unlock a premium object or buy a brief to get started."
            />
        </AiimPage>
    );
}
