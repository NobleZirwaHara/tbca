import { useForm, usePage } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CircleCheck, Clock, Lock, ShieldCheck, Star, ThumbsUp, UserCheck } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';
import Icon from '@/Components/ui/Icon';
import { cn } from '@/lib/cn';
import { formatZar, usePrice } from '@/lib/money';
import type { SharedProps, SprintPackage } from '@/types';
import type { GenericAttributes, SprintAddon } from '@/types/sprints';
import { IconTile } from './CatalogueCard';
import { Crumbs, NightBackdrop } from './SprintHero';
import type { Totals } from './lib';

export type Pkg = SprintPackage & { description?: string };

/** White section panel with numbered or plain title. */
export function Box({ title, subtitle, children, className, action }: { title?: ReactNode; subtitle?: ReactNode; children: ReactNode; className?: string; action?: ReactNode }) {
    return (
        <section className={cn('rounded-[8px] border border-parchment-400 bg-white p-5', className)}>
            {(title || action) && (
                <header className="mb-3 flex items-start justify-between gap-3">
                    <div>
                        {title && <h2 className="text-base font-bold text-ink-900">{title}</h2>}
                        {subtitle && <p className="mt-0.5 text-[0.8125rem] text-ink-500">{subtitle}</p>}
                    </div>
                    {action}
                </header>
            )}
            {children}
        </section>
    );
}

export function CheckList({ items, className, tone = 'gold' }: { items: string[]; className?: string; tone?: 'gold' | 'light' }) {
    return (
        <ul className={cn('space-y-2', className)}>
            {items.map((i) => (
                <li key={i} className={cn('flex items-start gap-2 text-[0.8125rem]', tone === 'light' ? 'text-parchment-200' : 'text-ink-700')}>
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" />
                    {i}
                </li>
            ))}
        </ul>
    );
}

/** Dark sprint hero: icon tile, title, summary, rating, delivered-by, turnaround, ideal-for chips. */
export function DetailHero({
    crumbs,
    icon,
    title,
    summary,
    rating,
    reviews,
    delivery,
    idealFor,
    chips,
}: {
    crumbs: { label: string; href?: string }[];
    icon: string;
    title: string;
    summary: string | null;
    rating?: number | null;
    reviews?: number;
    delivery?: string | null;
    idealFor?: string[];
    chips?: { label: string; icon: string }[];
}) {
    return (
        <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
            <NightBackdrop />
            <div className="container-tbca relative py-8 md:py-10">
                <Crumbs items={crumbs} />
                <div className="flex flex-col gap-6 md:flex-row md:items-start lg:max-w-[calc(100%-400px)]">
                    <IconTile name={icon} size="xl" />
                    <div className="min-w-0">
                        <h1 className="text-[1.875rem] leading-tight font-bold tracking-[-0.02em] text-white md:text-[2.5rem]">{title}</h1>
                        {summary && <p className="mt-2 max-w-2xl text-[0.9375rem] leading-relaxed text-parchment-200 md:text-base">{summary}</p>}
                        {chips ? (
                            <ul className="mt-4 flex flex-wrap gap-2">
                                {chips.map((c) => (
                                    <li key={c.label} className="inline-flex items-center gap-1.5 rounded-[4px] border border-ink-600 bg-ink-900/70 px-2.5 py-1.5 text-[0.75rem] text-parchment-100">
                                        <Icon name={c.icon} className="size-3.5 text-gold-400" />
                                        {c.label}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8125rem] text-parchment-200">
                                {rating ? (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Star className="size-4 fill-gold-500 text-gold-500" aria-hidden="true" />
                                        <strong className="text-white">{rating.toFixed(1)}</strong> ({reviews ?? 0} reviews)
                                    </span>
                                ) : null}
                                <span className="inline-flex items-center gap-1.5">
                                    <ShieldCheck className="size-4 text-gold-400" aria-hidden="true" /> Delivered by <strong className="text-white">TBCA Experts</strong>
                                </span>
                                {delivery && (
                                    <span className="inline-flex items-center gap-1.5">
                                        <Clock className="size-4 text-gold-400" aria-hidden="true" /> <strong className="text-white">{delivery}</strong> turnaround
                                    </span>
                                )}
                            </div>
                        )}
                        {idealFor && idealFor.length > 0 && (
                            <div className="mt-4 flex flex-wrap items-center gap-2 text-[0.75rem]">
                                <span className="font-semibold text-white">Ideal for:</span>
                                {idealFor.map((t) => (
                                    <span key={t} className="rounded-full border border-ink-600 bg-ink-800 px-3 py-1 text-parchment-100">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

function TrustRow() {
    return (
        <ul className="mt-4 grid grid-cols-3 gap-2 text-[0.6875rem] text-parchment-200">
            <li className="flex items-center gap-1.5">
                <Lock className="size-4 text-parchment-100" aria-hidden="true" /> Secure Payment
            </li>
            <li className="flex items-center gap-1.5">
                <ThumbsUp className="size-4 text-parchment-100" aria-hidden="true" /> Satisfaction Guaranteed
            </li>
            <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-parchment-100" aria-hidden="true" /> Confidential &amp; Secure
            </li>
        </ul>
    );
}

/** "Choose Your Sprint Package" dark card with radio packages, Order Sprint and Book Discovery Call. */
export function PackageChooser({
    packages,
    value,
    onChange,
    onOrder,
    onBook,
    orderLabel = 'Order Sprint',
    recurringLabel,
    quote = false,
}: {
    packages: Pkg[];
    value: string | null;
    onChange: (k: string) => void;
    onOrder: () => void;
    onBook: () => void;
    orderLabel?: string;
    recurringLabel?: string | null;
    quote?: boolean;
}) {
    const price = usePrice();
    return (
        <div className="rounded-[10px] border border-ink-700 bg-ink-900 p-4 text-parchment-100 shadow-raised">
            <p className="mb-3 font-semibold">{quote ? 'Scoped & Priced on Request' : 'Choose Your Sprint Package'}</p>
            {quote ? (
                <p className="text-[0.8125rem] text-parchment-200">This Sprint is tailored to your project. Share your requirements and TBCA will send a transparent, fixed quote within 1 business day.</p>
            ) : (
                <div role="radiogroup" aria-label="Sprint package" className="space-y-2">
                    {packages.map((p) => {
                        const selected = p.key === value;
                        return (
                            <button
                                key={p.key}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => onChange(p.key)}
                                className={cn('relative flex w-full items-start gap-3 rounded-[6px] border p-3 text-left transition-colors', selected ? 'border-gold-500 bg-gold-500/10' : 'border-ink-700 hover:border-ink-500')}
                            >
                                {p.popular && <span className="absolute -top-2 right-2 rounded-[3px] border border-gold-500 bg-ink-900 px-1.5 text-[0.625rem] font-semibold text-gold-400">Best Value</span>}
                                <span className={cn('mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border', selected ? 'border-gold-500' : 'border-ink-400')}>
                                    {selected && <span className="size-2 rounded-full bg-gold-500" />}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold text-white">{p.name}</span>
                                    {p.description && <span className="mt-0.5 block text-[0.75rem] text-parchment-200">{p.description}</span>}
                                </span>
                                <span className="text-right">
                                    <span className={cn('block text-base font-bold', selected ? 'text-gold-400' : 'text-white')}>{p.zar === 0 ? 'Free' : price(p.zar)}</span>
                                    {recurringLabel && <span className="block text-[0.6875rem] text-parchment-300">{recurringLabel}</span>}
                                    {p.delivery && <span className={cn('block text-[0.6875rem]', selected ? 'text-gold-400' : 'text-parchment-300')}>{p.delivery}</span>}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
            <button type="button" onClick={onOrder} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 font-semibold text-ink-900 hover:bg-gold-400">
                {orderLabel} <ArrowRight className="size-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={onBook} className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-[4px] border border-gold-500/70 font-semibold text-parchment-100 hover:bg-gold-500/10">
                <CalendarDays className="size-4" aria-hidden="true" /> Book Discovery Call
            </button>
            <TrustRow />
        </div>
    );
}

/** Dark order summary used on the package-specific steps (inputs, add-ons, risk, support, ask). */
export function OrderSummaryCard({
    pkg,
    features,
    addons,
    totals,
    primaryLabel = 'Continue to Checkout',
    onPrimary,
    primaryDisabled,
    secondaryLabel,
    onSecondary,
    onEdit,
    recurringLabel,
    children,
}: {
    pkg: Pkg | null;
    features: string[];
    addons: SprintAddon[];
    totals: Totals;
    primaryLabel?: string;
    onPrimary: () => void;
    primaryDisabled?: boolean;
    secondaryLabel?: string;
    onSecondary?: () => void;
    onEdit?: () => void;
    recurringLabel?: string | null;
    children?: ReactNode;
}) {
    const zar = (n: number) => `${formatZar(n)}.00`;
    return (
        <div className="rounded-[10px] border border-ink-700 bg-ink-900 p-4 text-parchment-100 shadow-raised">
            <div className="flex items-center justify-between">
                <p className="font-semibold">Your Order Summary</p>
                {onEdit && (
                    <button type="button" onClick={onEdit} className="text-[0.75rem] font-semibold text-parchment-200 hover:text-gold-400">
                        Edit
                    </button>
                )}
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                    <p className="text-[0.8125rem] font-semibold text-white">Sprint Package</p>
                    <p className="text-[0.8125rem] text-parchment-200">{pkg?.name}</p>
                </div>
                <div className="text-right">
                    {pkg?.popular && <span className="rounded-[3px] border border-gold-500 px-1.5 text-[0.625rem] font-semibold text-gold-400">Best Value</span>}
                    <p className="mt-1 font-bold text-white">{formatZar(totals.packageZar)}</p>
                    {recurringLabel && <p className="text-[0.6875rem] text-parchment-300">{recurringLabel}</p>}
                </div>
            </div>
            <CheckList items={features.slice(0, 5)} tone="light" className="mt-3" />
            <dl className="mt-4 space-y-1.5 border-t border-ink-700 pt-3 text-[0.8125rem]">
                <div className="flex justify-between">
                    <dt className="text-parchment-200">Add-ons ({addons.length} selected)</dt>
                    <dd>{zar(totals.addonsZar)}</dd>
                </div>
                {addons.map((a) => (
                    <div key={a.key} className="flex justify-between pl-3 text-[0.75rem] text-parchment-300">
                        <dt>{a.name}</dt>
                        <dd>{formatZar(a.zar)}</dd>
                    </div>
                ))}
                <div className="flex justify-between">
                    <dt className="text-parchment-200">Subtotal</dt>
                    <dd>{zar(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-parchment-200">VAT (15%)</dt>
                    <dd>{zar(totals.vat)}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-parchment-200">Bank Charges</dt>
                    <dd>{zar(totals.bank)}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-parchment-200">Platform Charges</dt>
                    <dd>{zar(totals.platform)}</dd>
                </div>
            </dl>
            <div className="mt-3 flex items-center justify-between border-t border-ink-700 pt-3">
                <span className="font-semibold">Total Due Today</span>
                <span className="text-lg font-bold text-white">{zar(totals.total)}</span>
            </div>
            <button type="button" disabled={primaryDisabled} onClick={onPrimary} className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 font-semibold text-ink-900 hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50">
                <Lock className="size-4" aria-hidden="true" /> {primaryLabel} <ArrowRight className="size-4" aria-hidden="true" />
            </button>
            {secondaryLabel && onSecondary && (
                <button type="button" onClick={onSecondary} className="mt-2 flex h-10 w-full items-center justify-center rounded-[4px] border border-gold-500/60 text-[0.875rem] font-semibold text-parchment-100 hover:bg-gold-500/10">
                    {secondaryLabel}
                </button>
            )}
            {children}
        </div>
    );
}

/** "What Clients Say" strip + "Why Clients Choose TBCA" tiles shown under every tab. */
export function ClientsStrip({ attrs }: { attrs: GenericAttributes }) {
    const data = attrs.reviews_data;
    const why = attrs.why_tbca ?? [
        { title: 'Pan-African Expertise', icon: 'globe' },
        { title: 'Data-Driven Approach', icon: 'bar-chart-3' },
        { title: 'Bankable Deliverables', icon: 'badge-check' },
        { title: 'Proven Track Record', icon: 'trending-up' },
    ];
    const [start, setStart] = useState(0);
    const items = data?.items ?? [];
    const shown = items.length ? [0, 1, 2].map((i) => items[(start + i) % items.length]).slice(0, Math.min(3, items.length)) : [];

    return (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            {data && shown.length > 0 && (
                <div className="grid gap-4 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-[150px_minmax(0,1fr)]">
                    <div>
                        <p className="font-bold text-ink-900">What Clients Say</p>
                        <p className="mt-1 flex items-center gap-1 text-[0.8125rem] text-ink-600">
                            <Star className="size-4 fill-gold-500 text-gold-500" aria-hidden="true" /> {data.average.toFixed(1)}/5 from {data.count} reviews
                        </p>
                        {items.length > 3 && (
                            <div className="mt-3 flex gap-2">
                                <button type="button" aria-label="Previous reviews" onClick={() => setStart((s) => (s - 1 + items.length) % items.length)} className="rounded-full border border-parchment-500 px-2.5 py-1 text-ink-600 hover:border-gold-500">
                                    ←
                                </button>
                                <button type="button" aria-label="Next reviews" onClick={() => setStart((s) => (s + 1) % items.length)} className="rounded-full border border-parchment-500 px-2.5 py-1 text-ink-600 hover:border-gold-500">
                                    →
                                </button>
                            </div>
                        )}
                    </div>
                    <ul className="grid gap-3 sm:grid-cols-3">
                        {shown.map((r) => (
                            <li key={r.name} className="rounded-[6px] border border-parchment-300 p-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-700 text-[0.75rem] font-bold text-ink-900" aria-hidden="true">
                                        {r.name.split(' ').map((n) => n[0]).join('')}
                                    </span>
                                    <div>
                                        <p className="text-[0.8125rem] font-semibold text-ink-900">{r.name}</p>
                                        <p className="text-[0.6875rem] text-ink-500">{r.role}</p>
                                    </div>
                                </div>
                                <p className="mt-1.5 text-gold-500" aria-label={`${r.rating} stars`}>
                                    {'★'.repeat(r.rating)}
                                </p>
                                <p className="mt-1 text-[0.8125rem] text-ink-700">&ldquo;{r.body}&rdquo;</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                <p className="text-center font-bold text-ink-900">{attrs.why_tbca_title ?? 'Why Clients Choose TBCA'}</p>
                <ul className="mt-3 grid grid-cols-4 gap-2 text-center">
                    {why.map((w) => (
                        <li key={w.title} className="flex flex-col items-center gap-1.5 text-[0.6875rem] text-ink-700">
                            <Icon name={w.icon ?? 'badge-check'} className="size-6 text-ink-700" />
                            {w.title}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

const TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00'];

/** Book Discovery Call / Schedule a Call — posts to the shared /bookings endpoint. */
export function BookCallModal({ open, onClose, topic, title = 'Book Discovery Call' }: { open: boolean; onClose: () => void; topic: string; title?: string }) {
    const { auth, url } = usePage<SharedProps>().props;
    const [taken, setTaken] = useState<string[]>([]);
    const form = useForm({
        date: '',
        time: '',
        name: auth.user?.name ?? '',
        email: auth.user?.email ?? '',
        phone: auth.user?.phone ?? '',
        type: 'discovery-call',
        topic,
        channel: 'video',
        duration_minutes: 30,
        redirect: url.path,
    });

    function pickDate(date: string) {
        form.setData((d) => ({ ...d, date, time: '' }));
        if (!date) return;
        fetch(`/bookings/slots?date=${encodeURIComponent(date)}`, { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then((d: { taken: string[] }) => setTaken(d.taken ?? []))
            .catch(() => setTaken([]));
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        form.post('/bookings', { preserveScroll: true, onSuccess: () => { form.reset('date', 'time'); onClose(); } });
    }

    const today = new Date();
    today.setDate(today.getDate() + 1);
    const min = today.toISOString().slice(0, 10);

    return (
        <Modal open={open} onClose={onClose} title={title}>
            <form onSubmit={submit} className="space-y-4">
                <p className="text-[0.8125rem] text-ink-600">Speak with a TBCA expert about <strong>{topic}</strong>. Calls are 30 minutes by video or phone.</p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Date" required error={form.errors.date}>
                        {(id) => <Input id={id} type="date" min={min} value={form.data.date} onChange={(e) => pickDate(e.target.value)} required />}
                    </Field>
                    <Field label="Time (SAST)" required error={form.errors.time}>
                        {(id) => (
                            <Select
                                id={id}
                                value={form.data.time}
                                onChange={(e) => form.setData('time', e.target.value)}
                                placeholder="Select a time"
                                options={TIMES.map((t) => ({ value: t, label: taken.includes(t) ? `${t} (booked)` : t }))}
                                required
                            />
                        )}
                    </Field>
                    <Field label="Your name" required error={form.errors.name}>
                        {(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />}
                    </Field>
                    <Field label="Email" required error={form.errors.email}>
                        {(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} required />}
                    </Field>
                    <Field label="Phone" error={form.errors.phone}>
                        {(id) => <Input id={id} value={form.data.phone ?? ''} onChange={(e) => form.setData('phone', e.target.value)} />}
                    </Field>
                    <Field label="Channel">
                        {(id) => (
                            <Select id={id} value={form.data.channel} onChange={(e) => form.setData('channel', e.target.value)} options={[{ value: 'video', label: 'Video call' }, { value: 'phone', label: 'Phone call' }]} />
                        )}
                    </Field>
                </div>
                {taken.includes(form.data.time) && <p className="text-xs font-medium text-risk-500">That time is already booked. Please choose another.</p>}
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="h-10 rounded-[4px] border border-ink-300 px-4 text-sm">
                        Cancel
                    </button>
                    <button type="submit" disabled={form.processing || taken.includes(form.data.time)} className="h-10 rounded-[4px] bg-gold-500 px-4 text-sm font-semibold text-ink-900 disabled:opacity-50">
                        Confirm booking
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/** Small icon + label chips used on order steps. */
export function MiniStat({ icon, label }: { icon: ReactNode; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-parchment-200">
            {icon}
            {label}
        </span>
    );
}

