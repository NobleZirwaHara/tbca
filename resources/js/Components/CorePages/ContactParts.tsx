import { Building2, ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import type { Office, RoleMailbox } from '@/types/core-pages';

export function PhoneLink({ phone }: { phone: string }) {
    return (
        <a href={`tel:${phone.replace(/\s/g, '')}`} className="mt-1 inline-flex items-center gap-1.5 text-parchment-100 hover:text-gold-300">
            <Phone className="size-3.5 text-gold-500" aria-hidden="true" /> {phone}
        </a>
    );
}

/**
 * Head office + 12 country offices. Clicking an office shows it on a keyless
 * Google Maps embed (the iframe only loads after the first click).
 */
export function OfficesSection({ headOffice, offices }: { headOffice: Office; offices: Office[] }) {
    const [selected, setSelected] = useState<Office | null>(null);

    return (
        <section id="offices" className="container-tbca scroll-mt-24 pb-12" aria-labelledby="offices-title">
            <div className="rounded-[10px] border border-gold-700/40 bg-ink-900/60 p-5 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-[0.75rem] font-semibold tracking-[0.16em] text-gold-500 uppercase">Where to find us</p>
                        <h2 id="offices-title" className="mt-1 text-[1.5rem] font-semibold text-parchment-100">Country Offices</h2>
                    </div>
                    <p className="text-[0.8125rem] text-ink-200">Select an office to see it on the map.</p>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <OfficeButton office={headOffice} label="Head Office" active={selected?.slug === headOffice.slug} onSelect={setSelected} />
                        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                            {offices.map((o) => (
                                <li key={o.slug}>
                                    <OfficeButton office={o} active={selected?.slug === o.slug} onSelect={setSelected} />
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-7">
                        {selected ? (
                            <div className="overflow-hidden rounded-[8px] border border-ink-700 bg-ink-950">
                                <iframe
                                    key={selected.slug}
                                    title={`Map of the TBCA office in ${selected.city}, ${selected.country}`}
                                    src={selected.map_embed}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="aspect-[4/3] w-full border-0 lg:aspect-auto lg:h-[26rem]"
                                />
                                <div className="flex flex-wrap items-start justify-between gap-3 p-4 text-[0.8125rem]">
                                    <div>
                                        <p className="font-semibold text-parchment-100">
                                            {selected.kind === 'head' ? 'Head Office' : selected.country} · {selected.city}
                                        </p>
                                        <p className="text-ink-200">{selected.address}</p>
                                        {selected.phone && <PhoneLink phone={selected.phone} />}
                                    </div>
                                    <a href={selected.map_link} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-gold-600 px-3 font-semibold text-gold-300 hover:text-gold-200">
                                        Open in Google Maps <ExternalLink className="size-3.5" aria-hidden="true" />
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 rounded-[8px] border border-dashed border-ink-700 p-6 text-center">
                                <MapPin className="size-8 text-gold-500" aria-hidden="true" />
                                <p className="text-[0.875rem] text-ink-200">Choose the head office or a country office to view its location on Google Maps.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

function OfficeButton({ office, label, active, onSelect }: { office: Office; label?: string; active: boolean; onSelect: (o: Office) => void }) {
    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(office)}
            className={`flex w-full gap-2.5 rounded-[6px] border p-3 text-left transition-colors ${active ? 'border-gold-500 bg-ink-800' : 'border-ink-700 hover:border-gold-700'}`}
        >
            {label ? <Building2 className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" /> : <MapPin className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" />}
            <span className="text-[0.8125rem] leading-snug">
                <span className="block font-semibold text-parchment-100">
                    {label ? `${label} · ` : ''}
                    {office.country}
                </span>
                <span className="block text-ink-200">{office.city}</span>
                {office.phone && <span className="mt-0.5 block text-ink-300">{office.phone}</span>}
            </span>
        </button>
    );
}

/** Public directory of client-facing role mailboxes (from App\Support\Platform\Directory). */
export function LeadsSection({ leads, generalEmail }: { leads: RoleMailbox[]; generalEmail: string }) {
    return (
        <section className="container-tbca pb-12" aria-labelledby="leads-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-[0.75rem] font-semibold tracking-[0.16em] text-gold-500 uppercase">Directory</p>
                    <h2 id="leads-title" className="mt-1 text-[1.5rem] font-semibold text-parchment-100">Contact a Functional Lead</h2>
                </div>
                <p className="max-w-xl text-[0.8125rem] text-ink-200">
                    Role mailboxes are being set up. Until they are live, write to{' '}
                    <a href={`mailto:${generalEmail}`} className="text-gold-300 hover:text-gold-200">{generalEmail}</a> and we will route your message.
                </p>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {leads.map((l) => (
                    <li key={l.email} className="rounded-[8px] border border-gold-700/40 bg-ink-900/60 p-4">
                        <p className="text-[0.875rem] font-semibold text-parchment-100">{l.position}</p>
                        {l.topic && <p className="mt-1 text-[0.8125rem] text-ink-200">{l.topic}</p>}
                        <a href={`mailto:${l.email}`} className="mt-3 inline-flex items-center gap-1.5 text-[0.8125rem] break-all text-gold-300 hover:text-gold-200">
                            <Mail className="size-3.5 shrink-0" aria-hidden="true" /> {l.email}
                        </a>
                        <p className="mt-2 text-[0.6875rem] tracking-wide text-ink-400 uppercase">{l.hc_code} · {l.status}</p>
                    </li>
                ))}
            </ul>
        </section>
    );
}
