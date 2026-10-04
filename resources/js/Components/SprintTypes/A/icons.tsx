import {
    Archive, Award, Banknote, BookOpen, Bot, Brain, Briefcase, Building2, Calculator, Calendar, ChartColumn, ChartLine,
    CircleCheck, ClipboardCheck, ClipboardList, Cloud, Coins, Cpu, Database, FileCheck, FileSearch, FileSpreadsheet,
    FileText, FolderCog, FolderOpen, Funnel, Gauge, Gavel, Globe, GraduationCap, Handshake, HardHat, Headphones,
    HeartHandshake, IdCard, Landmark, Layers, LayoutDashboard, Leaf, LifeBuoy, Lightbulb, ListChecks, Lock, Mail, Map,
    Megaphone, MessageSquare, Monitor, MonitorCog, Network, Newspaper, Package, Palette, PenTool, Phone, PieChart,
    PiggyBank, Plane, Presentation, Receipt, Rocket, Route, Scale, ScrollText, Search, Server, Settings, ShieldCheck,
    ShoppingCart, Smartphone, Sparkles, Sprout, Store, Factory, Target, TrendingUp, Truck, UserCheck, UserCog, Users,
    Video, Wallet, Workflow, Wrench, Zap, type LucideIcon,
} from 'lucide-react';

/** Hero icon names allowed in sprint.attributes.icon (kept explicit so the bundle stays tree-shaken). */
export const HERO_ICONS: Record<string, LucideIcon> = {
    Monitor, LayoutDashboard, Users, UserCheck, Workflow, Bot, Megaphone, Database, FileText, FileCheck, ClipboardCheck,
    ClipboardList, ListChecks, ShieldCheck, Scale, Briefcase, Building2, Landmark, Calculator, Receipt, Wallet, PiggyBank,
    TrendingUp, ChartLine, ChartColumn, PieChart, Target, Rocket, Globe, Map, Mail, MessageSquare, Phone, Presentation,
    GraduationCap, BookOpen, Lightbulb, Brain, Cpu, Cloud, FolderOpen, FolderCog, Settings, Wrench, Search, Handshake, Award,
    Leaf, HeartHandshake, Package, ShoppingCart, Truck, Calendar, Layers, Network, Lock, Zap, Sparkles, PenTool, Palette,
    Video, Newspaper, Store, Factory, HardHat, Gavel, FileSpreadsheet, Funnel, IdCard, Gauge, Server, Smartphone, Coins,
    Banknote, ScrollText, Archive, FileSearch, UserCog, MonitorCog, Headphones, LifeBuoy, Route, Plane, Sprout,
};

export function heroIcon(name: string | null | undefined): LucideIcon {
    return (name && HERO_ICONS[name]) || ClipboardCheck;
}

/** Keyword → icon table for list items ("What's Included", process steps, trust chips). */
const KEYWORDS: [RegExp, LucideIcon][] = [
    [/role|user|team|people|staff|persona|customer|client profile|attend/i, Users],
    [/permission|secur|access|login|lock|privacy|consent|rights|licen/i, Lock],
    [/dashboard|report|analytic|insight|kpi|metric|performance/i, ChartColumn],
    [/data|record|register|source|database|field/i, Database],
    [/workflow|automat|integrat|process|pipeline|flow/i, Workflow],
    [/navigat|menu|map|route|journey|channel/i, Route],
    [/test|qa|validat|verif|review|check|audit|quality/i, ShieldCheck],
    [/guide|training|learn|onboard|workshop|course|handover|knowledge/i, BookOpen],
    [/support|help|update|maintain/i, LifeBuoy],
    [/payment|checkout|price|cost|fee|vat|budget|cash|finance|invoice|account|tax/i, Wallet],
    [/plan|strategy|roadmap|scope|intake|discovery|assess/i, Target],
    [/campaign|marketing|ad |ads|social|content|copy|email|message|outreach|brand/i, Megaphone],
    [/forecast|growth|trend|scenario|model/i, TrendingUp],
    [/document|pack|file|template|checklist|deliverable|output|pdf|brief/i, FileText],
    [/setup|set up|configur|environment|setting/i, Settings],
    [/delivery|portal|launch|go-live|handoff/i, Rocket],
    [/time|day|calendar|schedule|cadence|deadline/i, Calendar],
    [/language|country|global|en \+ af/i, Globe],
    [/risk|govern|compliance|legal|control/i, Scale],
    [/idea|opportunit|innovation|prioriti/i, Lightbulb],
    [/ai|bot|agent/i, Bot],
    [/call|phone|contact/i, Phone],
];

export function itemIcon(text: string): LucideIcon {
    for (const [re, icon] of KEYWORDS) {
        if (re.test(text)) return icon;
    }
    return CircleCheck;
}
