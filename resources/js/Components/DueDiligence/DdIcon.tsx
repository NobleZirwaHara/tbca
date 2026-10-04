import {
    Archive, BadgeCheck, Ban, BarChart3, Bell, Briefcase, Building, Building2, Clock, ClipboardCheck, ClipboardList, Code, Coins,
    Download, Eye, Factory, FileCheck, FileSearch, FileStack, FileText, Flag, Folder, FolderOpen, FolderSearch, Gauge, Gavel, Globe,
    GraduationCap, Grid3x3, Handshake, HardHat, Headphones, IdCard, Landmark, LayoutDashboard, Leaf, Lightbulb, LineChart, ListChecks,
    Lock, MapPin, Monitor, MonitorCog, Network, Newspaper, Package, PieChart, Presentation, Puzzle, Radar, Receipt, RefreshCw, Rocket,
    Scale, ScanFace, ScanSearch, Search, Settings, ShieldAlert, ShieldCheck, SlidersHorizontal, Star, Target, TrendingUp, TriangleAlert,
    Truck, UploadCloud, User, UserCheck, UserCog, UserPlus, Users, UserSearch, Workflow, Zap, Circle,
    type LucideIcon,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
    Archive, BadgeCheck, Ban, BarChart3, Bell, Briefcase, Building, Building2, Clock, ClipboardCheck, ClipboardList, Code, Coins,
    Download, Eye, Factory, FileCheck, FileSearch, FileStack, FileText, Flag, Folder, FolderOpen, FolderSearch, Gauge, Gavel, Globe,
    GraduationCap, Grid3x3, Handshake, HardHat, Headphones, IdCard, Landmark, LayoutDashboard, Leaf, Lightbulb, LineChart, ListChecks,
    Lock, MapPin, Monitor, MonitorCog, Network, Newspaper, Package, PieChart, Presentation, Puzzle, Radar, Receipt, RefreshCw, Rocket,
    Scale, ScanFace, ScanSearch, Search, Settings, ShieldAlert, ShieldCheck, SlidersHorizontal, Star, Target, TrendingUp, TriangleAlert,
    Truck, UploadCloud, User, UserCheck, UserCog, UserPlus, Users, UserSearch, Workflow, Zap,
};

/** Renders a lucide icon from the PascalCase names used in App\Support\DueDiligence registers. */
export default function DdIcon({ name, className = 'size-5' }: { name?: string; className?: string }) {
    const Cmp = (name && icons[name]) || Circle;

    return <Cmp className={className} aria-hidden="true" />;
}
