import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ArrowRight, ChevronRight, Download, Mail, Phone, User } from 'lucide-react';
import { Input } from '@/Components/ui/Form';
import AboutHero from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import { fmtDate } from '@/Components/About/ClaimEvidence';
import { cn } from '@/lib/cn';
import type { NewsCard } from '@/types/about';

interface Props {
    featured: NewsCard | null;
    news: NewsCard[];
    announcements: NewsCard[];
    categories: { key: string; label: string; count: number }[];
    total: number;
    category: string | null;
}

const thumbs = ['from-ink-800 to-gold-700', 'from-controlled-700 to-ink-900', 'from-gold-600 to-ink-800', 'from-referenced-700 to-ink-900'];

export default function Newsroom({ featured, news, announcements, categories, total, category }: Props) {
    const sub = useForm({ email: '', section: 'about', subject: 'Newsroom updates' });
    const subscribe = (e: FormEvent) => {
        e.preventDefault();
        sub.post('/forms/newsroom-subscription', { preserveScroll: true, onSuccess: () => sub.reset('email') });
    };

    return (
        <>
            <Head title="Newsroom" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Newsroom' }]}
                title="Newsroom"
                lead="Stay informed. Stay inspired. Stay ahead with TBCA."
                intro="Welcome to the official newsroom of The Business Clinic.Africa™ (TBCA). Here you'll find our latest announcements, media releases, thought leadership insights, and stories about the impact we're making across Africa."
                aside={
                    <form onSubmit={subscribe} className="rounded-[8px] border border-gold-300 bg-gold-50/50 p-5">
                        <h2 className="flex items-center gap-2 font-semibold text-ink-900"><Mail className="size-5 text-gold-700" aria-hidden="true" /> Get Newsroom Updates</h2>
                        <p className="mt-1 text-[0.8125rem] text-ink-600">Get the latest news, announcements and insights straight to your inbox.</p>
                        <div className="mt-3 flex gap-2">
                            <label htmlFor="news-email" className="sr-only">Email address</label>
                            <Input id="news-email" type="email" required value={sub.data.email} onChange={(e) => sub.setData('email', e.target.value)} placeholder="Enter your email address" />
                            <button type="submit" disabled={sub.processing} className="shrink-0 rounded-[4px] bg-gold-600 px-4 text-sm font-semibold text-white hover:bg-gold-700">Subscribe</button>
                        </div>
                        <p className="mt-2 text-xs text-ink-500">We respect your privacy. Unsubscribe anytime.</p>
                    </form>
                }
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-6 lg:grid-cols-[1fr_19rem]">
                    <div className="space-y-5">
                        {category && (
                            <p className="text-sm text-ink-700">
                                Showing <strong>{categories.find((c) => c.key === category)?.label}</strong> · <Link href="/newsroom" className="text-gold-700 underline">Show all news</Link>
                            </p>
                        )}
                        <div className={cn('grid gap-5', featured && 'xl:grid-cols-2')}>
                            {featured && (
                                <Link href={`/newsroom/${featured.slug}`} className="group relative flex min-h-80 flex-col justify-end overflow-hidden rounded-[10px] bg-gradient-to-br from-ink-950 via-ink-900 to-gold-800 p-6 text-parchment-100">
                                    <div className="absolute inset-0 motif-grid opacity-30" aria-hidden="true" />
                                    <span className="absolute top-5 left-5 rounded border border-gold-500 px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-gold-400">FEATURED</span>
                                    <div className="relative">
                                        <p className="text-xs text-ink-300">{fmtDate(featured.published_at)} • <span className="text-gold-400">{featured.category_label}</span></p>
                                        <h2 className="mt-2 font-serif text-[1.625rem] leading-tight font-semibold">{featured.title}</h2>
                                        {featured.subtitle && <p className="mt-2 text-sm text-ink-200">{featured.subtitle}</p>}
                                        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-400 group-hover:underline">Read Full Story <ArrowRight className="size-4" aria-hidden="true" /></span>
                                    </div>
                                </Link>
                            )}
                            <div className="rounded-[10px] border border-parchment-400 bg-white p-5">
                                <h2 className="font-semibold text-ink-900">{category ? 'Results' : 'Latest News'}</h2>
                                {news.length === 0 ? <p className="mt-4 text-sm text-ink-500">No published items in this category yet.</p> : (
                                    <ul className="mt-3 divide-y divide-parchment-300">
                                        {news.map((n, i) => (
                                            <li key={n.slug}>
                                                <Link href={`/newsroom/${n.slug}`} className="group flex gap-4 py-3">
                                                    <span className={cn('inline-flex size-16 shrink-0 items-center justify-center rounded-[6px] bg-gradient-to-br text-gold-300', thumbs[i % thumbs.length])}>
                                                        <AboutIcon name={n.icon} className="size-7" />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-xs text-ink-500">{fmtDate(n.published_at)} • {n.category_label}</span>
                                                        <span className="block text-[0.875rem] font-semibold text-ink-900 group-hover:text-gold-700">{n.title}</span>
                                                        {n.subtitle && <span className="block text-xs text-ink-600">{n.subtitle}</span>}
                                                    </span>
                                                    <ArrowRight className="size-4 shrink-0 self-center text-gold-600" aria-hidden="true" />
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        {announcements.length > 0 && (
                            <div className="rounded-[10px] border border-parchment-400 bg-white p-5">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold text-ink-900">Recent Announcements</h2>
                                    <Link href="/newsroom?category=announcement" className="text-xs font-semibold text-gold-700">View All →</Link>
                                </div>
                                <ul className="mt-3 divide-y divide-parchment-300">
                                    {announcements.map((a) => (
                                        <li key={a.slug}>
                                            <Link href={`/newsroom/${a.slug}`} className="flex items-center gap-4 py-3 text-[0.8125rem] hover:text-gold-700">
                                                <AboutIcon name={a.icon} className="size-5 shrink-0 text-controlled-700" />
                                                <span className="w-24 shrink-0 text-ink-500">{fmtDate(a.published_at)}</span>
                                                <span className="flex-1 font-medium text-ink-900">{a.title}</span>
                                                <ChevronRight className="size-4" aria-hidden="true" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <aside className="space-y-4">
                        <nav aria-label="News categories" className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">News Categories</h2>
                            <ul className="mt-3 space-y-1 text-[0.8125rem]">
                                <li><Link href="/newsroom" className={cn('flex justify-between rounded px-2 py-1.5', !category ? 'bg-gold-50 font-semibold text-gold-800' : 'text-ink-700 hover:bg-parchment-100')}>All News <span>{total}</span></Link></li>
                                {categories.map((c) => (
                                    <li key={c.key}><Link href={`/newsroom?category=${c.key}`} className={cn('flex justify-between rounded px-2 py-1.5', category === c.key ? 'bg-gold-50 font-semibold text-gold-800' : 'text-ink-700 hover:bg-parchment-100')}>{c.label === 'Thought Leadership' ? c.label : `${c.label}s`} <span className="text-ink-400">{c.count}</span></Link></li>
                                ))}
                            </ul>
                        </nav>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">Press Resources</h2>
                            <ul className="mt-3 space-y-3 text-[0.8125rem]">
                                {[['Media Kit', 'Logos, factsheet, key messages and more'], ['Image Gallery', 'High-resolution images for media use'], ['Brand Guidelines', 'Our brand identity and usage guidelines']].map(([t, b]) => (
                                    <li key={t}><Link href="/newsroom/media-contact" className="flex items-start justify-between gap-2"><span><span className="block font-semibold text-ink-900">{t}</span><span className="text-xs text-ink-500">{b}</span></span><Download className="size-4 text-controlled-700" aria-hidden="true" /></Link></li>
                                ))}
                            </ul>
                            <p className="mt-3 text-[0.6875rem] text-ink-500">Resources are issued on request by the communications team.</p>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">Media Contacts</h2>
                            <p className="mt-2 flex items-center gap-2 text-[0.8125rem]"><User className="size-4 text-controlled-700" aria-hidden="true" /> media@thebusinessclinic.africa</p>
                            <p className="mt-1 flex items-center gap-2 text-[0.8125rem]"><Phone className="size-4 text-controlled-700" aria-hidden="true" /> +27 12 001 0557</p>
                            <Link href="/newsroom/media-contact" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-700">View All Contacts <ArrowRight className="size-3" aria-hidden="true" /></Link>
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
}
