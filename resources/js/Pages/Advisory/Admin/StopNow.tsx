import { Head } from '@inertiajs/react';
import { AdminShell } from '@/Components/Advisory/shells';
import StopLadder, { type StopRuleRow } from '@/Components/Advisory/StopLadder';

export default function StopNow({ rules, blocks }: { rules: StopRuleRow[]; blocks: { code: string; message: string; mandate: string }[] }) {
    return (
        <AdminShell title="Abort / Stop-Now Ladder" description="Hard-stop rules that must trigger an immediate halt. Evaluated at every step and before every paid or gated action.">
            <Head title="Stop-Now Ladder" />
            <StopLadder rules={rules} blocks={blocks} admin />
        </AdminShell>
    );
}

StopNow.layout = null;
