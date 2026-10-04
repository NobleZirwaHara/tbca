import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight, Bell, Briefcase, CalendarDays, CircleCheck, Eye, EyeOff, Fingerprint, Folder, FolderLock, Globe, Headset, Info, KeyRound, LayoutDashboard,
    Lock, LockKeyhole, Mail, Monitor, Receipt, ShieldCheck, ShoppingCart, User, UserLock,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { AuthShell, NatashaCard, PanelFacts } from '@/Components/CorePages/AuthShell';
import { openAskQuestion } from '@/Components/AskQuestion';

const modules = [
    [LayoutDashboard, 'Dashboard'], [User, 'My Profile'], [ShoppingCart, 'Orders'], [Folder, 'Documents'], [Briefcase, 'Projects'], [ShieldCheck, 'Due Diligence'],
    [Globe, 'AIIM Workspace'], [FolderLock, 'Virtual Deal Rooms'], [Receipt, 'Invoices'], [Headset, 'Support'], [CalendarDays, 'Bookings'], [Bell, 'Notifications'],
] as const;

const security = ['Encrypted Connection', 'Session Monitoring', 'Named Client Identity', 'Login Audit Active', 'Multi-Factor Authentication', 'POPIA-Aware Processing', 'Role-Based Access', 'Secure Account Recovery', 'Least-Privilege Permissions', 'Device & Risk Checks'];

export default function Login() {
    const form = useForm({ login: '', password: '', remember: false });
    const [show, setShow] = useState(false);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/login', { onFinish: () => form.reset('password') });
    };

    return (
        <AuthShell
            switchLink={{ href: '/register', label: 'New Client Registration' }}
            footerLinks={['Privacy Notice', 'Terms of Use', 'Portal Security', 'Support', 'System Status', 'New Client Registration', 'Account Activation', 'Forgot Password']}
            panel={
                <>
                    <p className="mt-8 text-[1.25rem] leading-snug text-parchment-100">One Secure Identity.<br />One Private Client Workspace.<br />One Connected TBCA Relationship.</p>
                    <ul className="mt-8 space-y-6">
                        {[[Monitor, 'Your Services in One Place.', 'Access all your TBCA services from a single secure portal.'], [Folder, 'Secure Documents and Deliverables.', 'Store, share and manage your documents securely.'], [Briefcase, 'Controlled Project and Case Access.', 'View your projects, cases and Due Diligence workspaces.'], [Headset, 'Direct Support and Client Communication.', 'Raise tickets, chat with our team and get the support you need.']].map(([I, t, b]) => {
                            const Ico = I as typeof Monitor;
                            return <li key={t as string} className="flex gap-3"><Ico className="size-8 shrink-0 text-gold-500" aria-hidden="true" /><span><strong className="block text-parchment-100">{t as string}</strong><span className="text-[0.8125rem]">{b as string}</span></span></li>;
                        })}
                    </ul>
                    <PanelFacts />
                </>
            }
        >
            <Head title="Existing Client Login" />
            <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[1fr_22rem]">
                <section className="rounded-[12px] border border-parchment-300 p-5 shadow-card md:p-8">
                    <div className="text-center">
                        <span className="mx-auto inline-flex size-16 items-center justify-center rounded-full bg-ink-950 text-gold-400 ring-4 ring-gold-300"><UserLock className="size-8" aria-hidden="true" /></span>
                        <h1 className="mt-3 font-serif text-[1.75rem] font-semibold tracking-wide text-ink-900 md:text-[2.125rem]">EXISTING CLIENT LOGIN</h1>
                        <p className="font-serif text-[1.125rem] text-gold-700">Secure Access to Your TBCA Client Portal</p>
                        <p className="mx-auto mt-2 max-w-md text-[0.875rem] text-ink-600">Sign in to view your services, projects, documents, payments, Due Diligence cases and authorised client workspaces.</p>
                    </div>
                    <p className="mx-auto mt-4 flex max-w-md items-center gap-3 rounded-[6px] border border-verified-500/30 bg-verified-50 px-4 py-2.5 text-[0.8125rem] text-ink-700"><Lock className="size-5 shrink-0 text-verified-500" aria-hidden="true" />Your access is based on your verified identity, organisation role and approved portal entitlements.</p>

                    <form onSubmit={submit} noValidate className="mx-auto mt-5 max-w-md space-y-4">
                        <div>
                            <label htmlFor="login" className="text-[0.875rem] font-medium text-ink-800">Email Address or Client ID <span className="text-risk-500">*</span></label>
                            <div className="relative mt-1">
                                <Mail className="absolute top-3 left-3 size-4 text-ink-400" aria-hidden="true" />
                                <input id="login" autoComplete="username" autoFocus value={form.data.login} onChange={(e) => form.setData('login', e.target.value)} placeholder="name@company.co.za" aria-invalid={!!form.errors.login} aria-describedby="login-hint" className="h-11 w-full rounded-[6px] border border-parchment-500 pr-9 pl-9 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none" />
                                <span title="Use your work email or your TBCA Client ID (e.g. TBCA-C-000001)"><Info className="absolute top-3 right-3 size-4 text-ink-400" aria-hidden="true" /></span>
                            </div>
                            <p id="login-hint" className="sr-only">Use your work email or your TBCA Client ID.</p>
                            {form.errors.login && <p role="alert" className="mt-1 text-xs text-risk-500">{form.errors.login}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="text-[0.875rem] font-medium text-ink-800">Password <span className="text-risk-500">*</span></label>
                            <div className="relative mt-1">
                                <Lock className="absolute top-3 left-3 size-4 text-ink-400" aria-hidden="true" />
                                <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} placeholder="Enter your password" aria-invalid={!!form.errors.password} className="h-11 w-full rounded-[6px] border border-parchment-500 pr-10 pl-9 text-sm focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none" />
                                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute top-2.5 right-3 text-ink-600">{show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}</button>
                            </div>
                            {form.errors.password && <p role="alert" className="mt-1 text-xs text-risk-500">{form.errors.password}</p>}
                        </div>
                        <div className="flex items-center justify-between text-[0.8125rem]">
                            <label className="flex items-center gap-2"><input type="checkbox" checked={form.data.remember} onChange={(e) => form.setData('remember', e.target.checked)} className="size-4 accent-gold-600" />Remember this trusted device</label>
                            <button type="button" onClick={() => openAskQuestion({ subject: 'Reset my portal password', section: 'core' })} className="text-controlled-700 hover:underline">Forgot Password?</button>
                        </div>
                        <button type="submit" disabled={form.processing} className="relative inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-gold-600 text-[0.9375rem] font-semibold text-white hover:bg-gold-700 disabled:opacity-60">
                            <LockKeyhole className="size-4" aria-hidden="true" />{form.processing ? 'Signing in…' : 'Sign In Securely'}<ArrowRight className="absolute right-4 size-5" aria-hidden="true" />
                        </button>
                        <p className="flex items-center gap-3 text-[0.75rem] text-ink-400"><span className="h-px flex-1 bg-parchment-400" />OR<span className="h-px flex-1 bg-parchment-400" /></p>
                        <button type="button" onClick={() => openAskQuestion({ subject: 'Enable Approved Enterprise SSO for my organisation', section: 'core' })} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[6px] border border-ink-300 text-sm font-medium"><KeyRound className="size-4" aria-hidden="true" />Continue with Approved Enterprise SSO</button>
                        <button type="button" onClick={() => openAskQuestion({ subject: 'Register a passkey or security key', section: 'core' })} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[6px] border border-ink-300 text-sm font-medium"><Fingerprint className="size-4" aria-hidden="true" />Use Passkey or Security Key</button>
                        <p className="flex items-center justify-center gap-1.5 text-[0.75rem] text-ink-500"><ShieldCheck className="size-4 text-verified-500" aria-hidden="true" />Multi-Factor Authentication may be required after you submit your login details.</p>
                        <p className="text-center text-[0.75rem] text-ink-500">Demo client: amahle@agritechsa.co.za · Password123!</p>
                    </form>

                    <div className="mx-auto mt-6 grid max-w-2xl gap-4 border-t border-parchment-300 pt-5 text-[0.75rem] sm:grid-cols-3">
                        <div><p className="font-semibold text-ink-900">First Time Signing In?</p><Link href="/register" className="text-controlled-700 hover:underline">Activate Your Approved Account</Link><p className="text-ink-500">Complete account activation.</p></div>
                        <div><p className="font-semibold text-ink-900">Forgot Your Password?</p><button type="button" onClick={() => openAskQuestion({ subject: 'Reset my portal password', section: 'core' })} className="text-controlled-700 hover:underline">Reset Password Securely</button><p className="text-ink-500">Recover access to your account.</p></div>
                        <div><p className="font-semibold text-ink-900">Account Locked?</p><Link href="/contact" className="text-controlled-700 hover:underline">Contact Portal Support</Link><p className="text-ink-500">We are here to help.</p></div>
                    </div>
                </section>

                <aside className="space-y-4">
                    <section className="rounded-[12px] border border-parchment-300 p-4">
                        <h2 className="text-[0.9375rem] font-bold text-ink-900">YOUR CLIENT PORTAL</h2>
                        <p className="text-[0.8125rem] text-ink-600">After successful login, access only the modules and services authorised for you.</p>
                        <ul className="mt-3 grid grid-cols-4 gap-2">
                            {modules.map(([I, l]) => <li key={l} className="flex flex-col items-center gap-1 rounded-[6px] border border-parchment-300 p-2 text-center text-[0.625rem] leading-tight text-ink-700"><I className="size-5 text-ink-800" aria-hidden="true" />{l}</li>)}
                        </ul>
                    </section>
                    <section className="rounded-[12px] border border-parchment-300 p-4">
                        <h2 className="text-[0.9375rem] font-bold text-ink-900">SECURITY &amp; PRIVACY</h2>
                        <ul className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1.5">{security.map((s) => <li key={s} className="flex gap-1.5 text-[0.75rem] text-ink-700"><CircleCheck className="size-4 shrink-0 text-verified-500" aria-hidden="true" />{s}</li>)}</ul>
                        <p className="mt-3 flex gap-2 rounded-[6px] bg-controlled-50 p-2.5 text-[0.75rem] text-controlled-700"><Info className="size-4 shrink-0" aria-hidden="true" />TBCA will never ask you to provide your password, OTP, PIN or security key through WhatsApp, email or NATASHA.</p>
                    </section>
                    <NatashaCard chips={['Help Me Sign In', 'Activate My Account', 'Reset My Password', 'Explain MFA', 'My Account Is Locked', 'Contact Portal Support']} />
                </aside>
            </div>
        </AuthShell>
    );
}

Login.layout = null;
