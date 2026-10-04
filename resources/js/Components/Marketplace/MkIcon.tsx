import {
    Activity, BadgeCheck, BarChart3, Briefcase, Calculator, CalendarDays, CircleDollarSign, ClipboardCheck, Clock, Code, CreditCard, FileCheck, FileText, Files,
    Folder, Globe, Handshake, Headphones, Leaf, Lock, MapPin, PackageCheck, PenLine, PieChart, RefreshCw, Scale, Search, Settings, ShieldCheck, Sprout, Star, Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** Icon registry for icon names referenced by App\Support\Marketplace\Content. */
const map: Record<string, LucideIcon> = {
    activity: Activity, 'badge-check': BadgeCheck, 'bar-chart-3': BarChart3, briefcase: Briefcase, calculator: Calculator, 'calendar-days': CalendarDays,
    'circle-dollar-sign': CircleDollarSign, 'clipboard-check': ClipboardCheck, clock: Clock, code: Code, 'credit-card': CreditCard, 'file-check': FileCheck,
    'file-text': FileText, files: Files, folder: Folder, globe: Globe, handshake: Handshake, headphones: Headphones, leaf: Leaf, lock: Lock, 'map-pin': MapPin,
    'package-check': PackageCheck, 'pen-line': PenLine, 'pie-chart': PieChart, 'refresh-cw': RefreshCw, scale: Scale, search: Search, settings: Settings,
    'shield-check': ShieldCheck, sprout: Sprout, star: Star, users: Users,
};

export default function MkIcon({ name, className }: { name: string; className?: string }) {
    const C = map[name] ?? BadgeCheck;
    return <C className={className} aria-hidden="true" />;
}
