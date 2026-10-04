import { Link, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Button } from '@/Components/ui/Button';
import { Field, Select, Textarea } from '@/Components/ui/Form';
import { StatusPill } from '@/Components/ui/Kit';
import { KV, zar } from '@/Components/Advisory/ui';
import type { SharedProps } from '@/types';
import type { VehicleRow } from '@/types/advisory';

export interface Target { key: string; label: string; type: string; value: number; monthly: boolean }
export interface ChangeRow { reference: string; type: string; status: string; to_vehicle: string | null; payable_now_zar: number; credit_zar: number; created_at: string }

/** Shared vehicle change form (transition, upgrade, recurrence, downgrade, switch, exit) with live credit preview. */
export default function ChangeForm({
    type,
    vehicles,
    targets,
    allowedTargets,
    defaultVehicleType,
    submitLabel,
    changes,
    types,
}: {
    type: string;
    vehicles: VehicleRow[];
    targets: Target[];
    allowedTargets?: string[];
    defaultVehicleType?: string;
    submitLabel: string;
    changes: ChangeRow[];
    types?: { key: string; label: string }[];
}) {
    const { auth } = usePage<SharedProps>().props;
    const start = vehicles.find((v) => v.type === defaultVehicleType && v.status === 'active') ?? vehicles[0];
    const opts = targets.filter((t) => !allowedTargets || allowedTargets.includes(t.key));
    const form = useForm({ type, vehicle: start?.code ?? '', target: opts[0]?.key ?? '', notes: '' });

    if (!auth.user) {
        return (
            <div className="rounded-[8px] border border-gold-300 bg-gold-50 p-4 text-sm">
                <p className="font-semibold text-ink-900">Sign in to see your vehicles</p>
                <p className="text-xs text-ink-600">We calculate credits and amounts from your actual engagements.</p>
                <Link href="/login" className="mt-2 inline-block text-xs font-semibold text-gold-700 underline">Sign in</Link>
            </div>
        );
    }
    if (!vehicles.length) return <p className="text-sm text-ink-500">You have no active vehicles yet.</p>;

    const v = vehicles.find((x) => x.code === form.data.vehicle) ?? vehicles[0];
    const t = targets.find((x) => x.key === form.data.target);
    const delivered = Math.round((v.invoiced * v.progress) / 100);
    const credit = ['transition', 'upgrade'].includes(form.data.type) ? v.paid : ['downgrade', 'switch', 'exit'].includes(form.data.type) ? Math.max(0, v.paid - delivered) : 0;
    const payable = ['transition', 'upgrade'].includes(form.data.type) && t ? Math.round(Math.max(0, t.value - credit) * 0.5) : 0;
    const needsTarget = form.data.type !== 'exit' && form.data.type !== 'downgrade' ? true : form.data.type === 'downgrade';

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/services/vehicle-changes', { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            {types && (
                <Field label="What would you like to do?">{(id) => <Select id={id} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} options={types.map((x) => ({ value: x.key, label: x.label }))} />}</Field>
            )}
            <Field label="Current vehicle" error={form.errors.vehicle}>{(id) => <Select id={id} value={form.data.vehicle} onChange={(e) => form.setData('vehicle', e.target.value)} options={vehicles.map((x) => ({ value: x.code, label: `${x.name} (${x.type})` }))} />}</Field>
            {needsTarget && form.data.type !== 'exit' && (
                <Field label="Move to" error={form.errors.target}>{(id) => <Select id={id} value={form.data.target} onChange={(e) => form.setData('target', e.target.value)} options={opts.map((x) => ({ value: x.key, label: `${x.label} — ${zar(x.value)}${x.monthly ? ' / month' : ''}` }))} />}</Field>
            )}
            <Field label="Notes (optional)">{(id) => <Textarea id={id} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} className="min-h-16" />}</Field>
            <KV
                rows={[
                    ['Investment to date', zar(v.paid)],
                    ['Value delivered (progress ' + v.progress + '%)', zar(delivered)],
                    [['transition', 'upgrade'].includes(form.data.type) ? 'Credit carried forward' : 'Pro-rata credit', <span className="text-verified-700">- {zar(credit)}</span>],
                    ...(t && ['transition', 'upgrade', 'recurrence', 'switch'].includes(form.data.type) ? ([['New vehicle value', `${zar(t.value)}${t.monthly ? ' / month' : ''}`]] as [string, string][]) : []),
                    ['Payable now', <b>{payable > 0 ? `${zar(payable)} (50% upfront, excl. VAT)` : 'R0 — terms confirmed by TBCA'}</b>],
                ]}
            />
            <Button type="submit" disabled={form.processing} className="w-full" trailingIcon="arrow-right">{submitLabel}</Button>
            {changes.length > 0 && (
                <div className="border-t border-parchment-300 pt-3">
                    <p className="text-xs font-semibold text-ink-700">Your recent requests</p>
                    <ul className="mt-1 space-y-1 text-xs">
                        {changes.map((c) => (
                            <li key={c.reference} className="flex items-center justify-between gap-2"><span className="font-mono">{c.reference}</span><span>{c.to_vehicle ?? c.type}</span><StatusPill status={c.status} /></li>
                        ))}
                    </ul>
                </div>
            )}
        </form>
    );
}
