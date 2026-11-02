import { Head, Link } from '@inertiajs/react';
import { Tags } from 'lucide-react';
import { ADMIN_NAV } from '@/Components/Aiim/Nav';
import { Banner, Split, svcHref } from '@/Components/Aiim/ProtoDesk';
import { csvHref } from '@/Components/CountryHub/IntelData';
import { Card, Chip, DataTable, STable, useMoney } from '@/Components/Industries/Kit';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import type { ServerTableData } from '@/types/industries';

type Row = Record<string, string | number | null>;
interface FeeCode { code: string; name: string; category: string; fee_type: string; pricing_model: string; amount_zar: number; rate: number | null; status: string; effective: string | null }
interface Props { book: ServerTableData<Row>; feeCodes: FeeCode[] }

const KEYS = ['Code', 'Service', 'Module', 'Authority', 'Benchmark', 'Bench Basic', 'Bench Std', 'Entry tier', 'Entry price'];

/**
 * AIIM mock 81: Pricing Administration (prototype #pricing-admin): the Batch 4D v3 price book of the
 * 581 embedded services, paged on the server. Entry prices are the app's Sprint prices; the
 * benchmarks are the price book's reference figures.
 */
export default function Pricing({ book, feeCodes }: Props) {
    const money = useMoney();
    const fee = (c: FeeCode) => (c.rate !== null && Number(c.amount_zar) === 0 ? `${c.rate}%` : money(Number(c.amount_zar)));
    return (
        <ConsoleLayout area="AIIM Admin Area" areaIcon={Tags} groups={ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'AIIM', href: '/admin/aiim' }, { label: 'Pricing Administration' }]} title="Pricing Administration"
            description={<><span className="block font-semibold text-gold-700">Page 81 · Batch 4D v3 price book</span>Price authority CC-07: inherited parent-family benchmark, cost-plus at the 60 % target margin, or type-donor parity. HOLD — controlled planning.</>}>
            <Head title="AIIM Pricing Administration" />
            <Split>
                <Banner>Entry prices are the app&apos;s selling prices from its Sprint records. Bench Basic and Bench Std are reference benchmarks from the price book, not selling prices. Codes without an app record show &quot;Not in the app catalogue yet&quot;.</Banner>
                <Card>
                    <DataTable<Row> name="aiim-price-book" server={book} only={['book']} filters={['Module', 'Authority', 'Entry tier']} csvHref={csvHref('/admin/aiim/pricing', book)}
                        cols={KEYS.map((k) => ({
                            k, l: k, num: /^(Bench |Entry price)/.test(k), clip: k === 'Service',
                            r: k === 'Code' ? (r: Row) => <Link href={svcHref(String(r.Code))} className="font-mono font-semibold whitespace-nowrap text-controlled-700 hover:underline">{r.Code}</Link>
                                : /^Bench /.test(k) ? (r: Row) => money(r[k] as number | null)
                                    : k === 'Entry price' ? (r: Row) => (r[k] === null ? <span className="text-ink-400">Not in the app catalogue yet</span> : money(r[k] as number))
                                        : undefined,
                        }))} />
                </Card>
                <Card title="AIIM fee codes">
                    <STable compact head={['Fee code', 'Name', 'Category', 'Fee type', 'Pricing model', 'Amount (ex VAT)', 'Status', 'Effective from']} rows={feeCodes.map((c) => [
                        <span key="c" className="font-mono">{c.code}</span>, c.name, c.category, c.fee_type, c.pricing_model, fee(c), <Chip key="s" t={c.status} tone={c.status === 'active' ? 'ok' : 'grey'} />, c.effective ?? '—',
                    ])} />
                </Card>
            </Split>
        </ConsoleLayout>
    );
}

Pricing.layout = null;
