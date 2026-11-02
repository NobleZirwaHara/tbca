/* P20 Payment Localisation Planner (prototype #/c/{ISO}/paylocal). */
import type { ReactNode } from 'react';
import { Card, Dl, STable, StatusChip, TagP, TagR } from '@/Components/Industries/Kit';
import { cHref } from '@/Components/CountryHub/Layout';
import { MeterCell, Planner } from '@/Components/CountryHub/Journey';
import type { CountryBase, HubShelf } from '@/types/countryHub';

interface Props { base: CountryBase; shelf: HubShelf }

export default function PayLocal({ base, shelf }: Props) {
    const { c } = base;
    const vatText = c.isBW ? '14 %' : c.isZA ? '15 %' : '— ';
    const vat: ReactNode = c.isBW || c.isZA ? vatText : <>{vatText}<TagP /></>;
    const methods: [string, string, ReactNode, number, string, string][] = c.isBW
        ? [['Bank Transfer (EFT)', 'Bank transfer', 'All major banks', 100, 'Ready', 'High'], ['Credit / Debit Cards', 'Card', 'Visa, Mastercard', 90, 'Ready', 'High'], ['Mobile money', 'Wallet', <>Orange Money, MyZaka, Smega <TagR /></>, 60, 'In Progress', 'High'], ['Invoice settlement', 'B2B', 'Approved credit terms', 80, 'Ready', 'Medium'], ['Cross-border (ZAR, USD)', 'Bank / corridor', 'Pair-specific', 40, 'Planned', 'Medium']]
        : [['Credit / Debit Cards', 'Card', 'Visa, Mastercard', 95, 'Ready', 'High'], ['Instant EFT', 'Bank transfer', 'Ozow', 90, 'Ready', 'High'], ['Bank Transfer (EFT)', 'Bank transfer', 'All major banks', 100, 'Ready', 'High'], ['Payflex', 'BNPL', 'Payflex', 50, 'In Progress', 'Medium'], ['SnapScan', 'Wallet', 'SnapScan', 40, 'Planned', 'Low']];
    return (
        <Planner base={base} pageKey="paylocal" title="Payment Localisation Planner" desc={`Plan and track payment methods, currencies, taxes and settlement requirements for ${c.name}.`}
            score={68} progSub="15 / 22 completed" shelf={shelf}
            kpis={[['Currencies Supported', c.isBW ? 'BWP · ZAR · USD' : c.currency, 'Primary first', 'cash'], ['Payment Methods', methods.length, 'Active or planned', 'tag'], ['VAT (standard)', vat, c.isBW ? 'BW-MAC-F18' : '', 'file']]}
            blocks={<>
                <Card title="Payment Methods Overview" icon="cash">
                    <STable head={['Method', 'Type', 'Provider / network', 'Coverage', 'Status', 'Priority']} rows={methods.map((r) => [<b key="m">{r[0]}</b>, r[1], r[2], <MeterCell key="c" p={r[3]} min={100} />, <StatusChip key="s" s={r[4]} />, <StatusChip key="p" s={r[5]} />])} />
                </Card>
                <Card title="Currencies & Tax" icon="tag">
                    <Dl rows={[['Primary currency', c.currency], ['Secondary', c.isBW ? 'ZAR (basket 50 % ZAR) · USD' : 'USD'], ['VAT (standard)', vat], ['VAT number capture', 'Required'], ['Invoice language', c.isBW ? 'EN (TN optional)' : 'EN'], ['FX source', c.isBW ? 'BW_FX 13.84 BWP/US$ (9 Oct 2026)' : '—']]} />
                </Card>
                <Card title="Settlement & Payout Configuration" icon="swap">
                    <Dl rows={[['Settlement currency', c.currency], ['Settlement frequency', 'Daily'], ['Partner payout currency', c.currency], ['Payout frequency', 'Weekly'], ['Minimum payout threshold', `${c.currency} 1,000`], ['Chargeback / refund handling', 'TBCA policy · automated rules']]} />
                </Card>
            </>}
            actions={[
                ['PAY-26-001', c.isBW ? 'Enable mobile-money collection' : 'Enable Payflex in checkout', 'Methods', 'Payments Team', '25 Oct 2026', 'High', 'In Progress'],
                ['PAY-26-002', 'Complete bank-gateway integration', 'Integration', 'Tech Team', '28 Oct 2026', 'High', 'In Progress'],
                ['PAY-26-003', `Configure VAT invoice format (${c.isBW || c.isZA ? vatText : '— Placeholder'})`, 'Tax', 'Finance Team', '30 Oct 2026', 'Medium', 'In Progress'],
                ['PAY-26-004', 'Cross-border ZAR/USD acceptance', 'FX', 'Payments Team', '05 Nov 2026', 'Low', 'Planned'],
                ['PAY-26-005', 'Fraud rules tuning & testing', 'Risk', 'Risk Team', '08 Nov 2026', 'High', 'Not Started'],
            ]}
            summary={[['Total Requirements', 22], ['Completed', 15], ['In Progress', 4], ['Planned', 2], ['Not Started', 1]]}
            acts={[['Manage Payment Methods', cHref(c, 'payments'), 'pri'], ['View Payment & Activation', cHref(c, 'pay')]]}
        />
    );
}
