import { Head } from '@inertiajs/react';
import StopLadder, { type StopRuleRow } from '@/Components/Advisory/StopLadder';
import { PageTitle } from '@/Components/Advisory/ui';

export default function StopNow({ rules }: { rules: StopRuleRow[]; activeBlocks: number }) {
    return (
        <div className="container-tbca py-8">
            <Head title="Abort / Stop-Now Ladder" />
            <PageTitle crumbs={[{ label: 'Project Advisory', href: '/project-advisory' }, { label: 'Abort / Stop-Now Ladder' }]} title="Abort / Stop-Now Ladder" sub="Hard-stop rules that must trigger an immediate halt to the setup journey or progression. No work, booking, payment or engagement may continue while any Stop-Now rule is active." />
            <StopLadder rules={rules} blocks={[]} />
        </div>
    );
}
