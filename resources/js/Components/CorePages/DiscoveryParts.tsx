import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays, ChevronLeft, ChevronRight, ExternalLink, FileText, FolderOpen, HelpCircle, LayoutDashboard, Lock, Mail,
    MessageCircle, Phone, Receipt, Settings, ShieldCheck, ShoppingBag,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import ConsoleLayout, { type ConsoleNavGroup } from '@/Layouts/ConsoleLayout';
import PublicLayout from '@/Layouts/PublicLayout';
import type { Crumb } from '@/Components/ui/Breadcrumbs';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Avatar } from '@/Components/CorePages/Kit';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { Manager } from '@/types/core-pages';

const PORTAL_NAV: ConsoleNavGroup[] = [
    {
        title: 'Client Portal',
        items: [
            { label: 'Overview', href: '/portal', icon: LayoutDashboard },
            { label: 'Orders', href: '/basket', icon: ShoppingBag },
            { label: 'Meetings', href: '/discovery-call/meetings', icon: CalendarDays },
            { label: 'Book a Discovery Call', href: '/discovery-call', icon: CalendarDays },
            { label: 'My Downloads', href: '/tools/my-downloads', icon: FolderOpen },
            { label: 'Invoices', href: '/portal', icon: Receipt },
            { label: 'Due Diligence', href: '/due-diligence', icon: ShieldCheck },
            { label: 'Help Desk', href: '/contact', icon: HelpCircle },
            { label: 'Settings', href: '/portal', icon: Settings },
        ],
    },
];

/** Signed-in clients see the portal console; guests get the public layout with the same body. */
export function ClientShell({ title, description, crumbs, actions, children }: { title: string; description?: string; crumbs: Crumb[]; actions?: ReactNode; children: ReactNode }) {
    const { auth } = usePage<SharedProps>().props;

    if (auth.user) {
        return (
            <ConsoleLayout area="Client Portal" areaIcon={LayoutDashboard} groups={PORTAL_NAV} crumbs={crumbs} title={title} description={description} actions={actions}>
                {children}
            </ConsoleLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="container-tbca py-8">
                <Breadcrumbs items={crumbs} />
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-[1.75rem] font-bold tracking-tight text-ink-900 md:text-[2rem]">{title}</h1>
                        {description && <p className="mt-1 max-w-2xl text-[0.875rem] text-ink-500">{description}</p>}
                    </div>
                    {actions}
                </div>
                {children}
            </div>
        </PublicLayout>
    );
}

export function ManagerCard({ manager, status = 'Available for bookings' }: { manager: Manager; status?: string }) {
    return (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="text-[0.875rem] font-bold text-ink-900">Your Relationship Manager</h2>
            <div className="mt-3 flex items-center gap-3">
                <Avatar initials={manager.initials} size="lg" />
                <div>
                    <p className="font-semibold text-ink-900">{manager.name}</p>
                    <p className="text-[0.75rem] text-ink-500">{manager.title}</p>
                    <p className="flex items-center gap-1 text-[0.75rem] text-verified-700"><span className="size-2 rounded-full bg-verified-500" aria-hidden="true" />{status}</p>
                </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.75rem] text-ink-600">
                <a href={`mailto:${manager.email}`} className="inline-flex items-center gap-1 hover:text-gold-700"><Mail className="size-3.5" aria-hidden="true" />{manager.email}</a>
                <a href={`tel:${manager.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1 hover:text-gold-700"><Phone className="size-3.5" aria-hidden="true" />{manager.phone}</a>
            </div>
            <Link href="/about/team" className="mt-2 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-gold-700">View Profile <ExternalLink className="size-3" aria-hidden="true" /></Link>
        </section>
    );
}

export function SummaryPanel({ title = 'Booking Summary', rows }: { title?: string; rows: [string, ReactNode][] }) {
    return (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="flex items-center justify-between text-[0.875rem] font-bold text-ink-900">{title} <Lock className="size-4 text-ink-400" aria-hidden="true" /></h2>
            <dl className="mt-2 divide-y divide-parchment-300 text-[0.8125rem]">
                {rows.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 py-1.5">
                        <dt className="text-ink-500">{k}</dt>
                        <dd className="text-right font-semibold text-ink-900">{v || '—'}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}

export function HelpCards() {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[8px] bg-ink-950 p-4 text-parchment-200">
                <p className="text-[0.8125rem] font-semibold text-parchment-100">Ask a Question <span className="ml-1 text-[0.6875rem] text-verified-500">● Online</span></p>
                <p className="mt-1 text-[0.6875rem]">Our team typically replies in a few minutes.</p>
                <button type="button" onClick={() => openAskQuestion({ subject: 'Discovery Call question', section: 'core' })} className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] bg-gold-500 text-[0.8125rem] font-semibold text-ink-900">
                    <MessageCircle className="size-4" aria-hidden="true" /> Start Chat
                </button>
            </div>
            <div className="rounded-[8px] bg-ink-950 p-4 text-parchment-200">
                <p className="text-[0.8125rem] font-semibold text-parchment-100">WhatsApp Communication</p>
                <p className="mt-1 text-[0.6875rem]">Recent conversations on WhatsApp.</p>
                <a href="https://wa.me/27608011365" target="_blank" rel="noreferrer" className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] bg-verified-500 text-[0.8125rem] font-semibold text-white">
                    Open WhatsApp <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
            </div>
        </div>
    );
}

export const BOOK_STEPS = ['Meeting Details', 'Date & Time', 'Review & Confirm'];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Month calendar + time slots. Taken slots come from GET /bookings/slots. */
export function SlotPicker({
    today,
    date,
    time,
    slots,
    onDate,
    onTime,
    ignoreTime,
}: {
    today: string;
    date: string;
    time: string;
    slots: { morning: string[]; afternoon: string[] };
    onDate: (d: string) => void;
    onTime: (t: string) => void;
    ignoreTime?: { date: string; time: string };
}) {
    const t0 = new Date(`${today}T00:00:00`);
    const start = date ? new Date(`${date}T00:00:00`) : t0;
    const [month, setMonth] = useState(new Date(start.getFullYear(), start.getMonth(), 1));
    const [taken, setTaken] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const max = new Date(t0);
    max.setDate(max.getDate() + 60);

    const pick = (d: string) => {
        onDate(d);
        onTime('');
        setLoading(true);
        fetch(`/bookings/slots?date=${d}`, { headers: { Accept: 'application/json' } })
            .then((r) => r.json())
            .then((j: { taken: string[] }) => setTaken(j.taken.filter((x) => !(ignoreTime && ignoreTime.date === d && ignoreTime.time === x))))
            .catch(() => setTaken([]))
            .finally(() => setLoading(false));
    };

    const first = (month.getDay() + 6) % 7;
    const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
    const bookable = (d: Date) => d > t0 && d <= max && d.getDay() !== 0 && d.getDay() !== 6;

    return (
        <div>
            <div className="flex items-center justify-between">
                <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded p-1 hover:bg-parchment-200" aria-label="Previous month"><ChevronLeft className="size-4" /></button>
                <p className="text-[0.875rem] font-semibold text-ink-900" aria-live="polite">{month.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}</p>
                <button type="button" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded p-1 hover:bg-parchment-200" aria-label="Next month"><ChevronRight className="size-4" /></button>
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[0.6875rem] font-semibold text-ink-500">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((d, i) => {
                    if (!d) return <span key={`e${i}`} />;
                    const key = iso(d);
                    const ok = bookable(d);
                    const sel = key === date;
                    return (
                        <button
                            key={key}
                            type="button"
                            disabled={!ok}
                            onClick={() => pick(key)}
                            aria-pressed={sel}
                            aria-label={d.toDateString()}
                            className={cn(
                                'mx-auto flex size-9 items-center justify-center rounded-full text-[0.8125rem]',
                                sel ? 'bg-gold-500 font-bold text-ink-900' : ok ? 'border border-verified-500/50 text-ink-900 hover:bg-gold-50' : 'text-ink-300',
                            )}
                        >
                            {d.getDate()}
                        </button>
                    );
                })}
            </div>
            <p className="mt-2 flex flex-wrap gap-4 text-[0.6875rem] text-ink-500">
                <span className="inline-flex items-center gap-1"><span className="size-3 rounded-full border border-verified-500" />Available</span>
                <span className="inline-flex items-center gap-1"><span className="size-3 rounded-full bg-gold-500" />Selected</span>
                <span className="inline-flex items-center gap-1"><span className="size-3 rounded-full bg-parchment-300" />Unavailable</span>
            </p>

            <h3 className="mt-4 text-[0.875rem] font-semibold text-ink-900">Available Times</h3>
            <p className="text-[0.6875rem] text-ink-500">{date ? (loading ? 'Checking availability…' : 'Times are shown in SAST; your timezone is noted on the booking.') : 'Select a date to see available times.'}</p>
            {(['morning', 'afternoon'] as const).map((part) => (
                <div key={part} className="mt-2">
                    <p className="text-[0.75rem] font-medium text-ink-600 capitalize">{part}</p>
                    <div className="mt-1 grid grid-cols-3 gap-2">
                        {slots[part].map((s) => {
                            const isTaken = taken.includes(s);
                            return (
                                <button
                                    key={s}
                                    type="button"
                                    disabled={!date || isTaken || loading}
                                    onClick={() => onTime(s)}
                                    aria-pressed={time === s}
                                    className={cn(
                                        'h-9 rounded-[4px] border text-[0.8125rem] font-medium',
                                        time === s ? 'border-ink-900 bg-ink-900 text-gold-400' : isTaken ? 'border-parchment-300 bg-parchment-200 text-ink-300 line-through' : 'border-parchment-500 bg-white text-ink-900 hover:border-gold-500 disabled:opacity-50',
                                    )}
                                >
                                    {s}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function FileChip({ name, size }: { name: string; size: number }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-[4px] border border-parchment-400 bg-parchment-100 px-2.5 py-1.5 text-[0.75rem] text-ink-800">
            <FileText className="size-3.5 text-gold-700" aria-hidden="true" />
            <span className="max-w-[14rem] truncate font-medium">{name}</span>
            <span className="text-ink-400">{(size / 1024 / 1024).toFixed(1)} MB</span>
        </span>
    );
}

