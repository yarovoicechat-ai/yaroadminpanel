'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard, Menu, X, LogOut, User, Award, Gift, UserX,
    Users, UserCheck, ShieldAlert, Video, Plus, Flag, HelpCircle,
    Ban, AlertOctagon, Calendar, MessageSquare, Bell, Share2,
    CheckSquare, FileCheck, DollarSign, Coins, Gem, ChevronDown, ChevronRight,
    Crown, Briefcase, Terminal, ShieldCheck, Settings, Headphones, Globe,
    FileText, Layers, Radio, Sliders, Image as ImageIcon, Download, Sparkles
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useModerationSocket } from '@/components/providers/ModerationSocketProvider';
import { apiClient } from '@/lib/apiClient';
import { isRouteAllowed } from '@/config/rbacMatrix';

interface SubmenuItem {
    name: string;
    href: string;
}

interface SidebarItem {
    name: string;
    href?: string;
    icon: any;
    submenu?: SubmenuItem[];
    category: string;
}

interface SidebarSection {
    title: string;
    items: SidebarItem[];
    category: string;
}

export const roleConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    owner: { label: 'Owner', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: Crown },
    operator: { label: 'Operator', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: UserCheck },
    superAdmin: { label: 'Super Admin', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', icon: ShieldCheck },
    admin: { label: 'Admin', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: UserCheck },
    agency: { label: 'Agency', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30', icon: Briefcase },
    coinSeller: { label: 'Coin Seller', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: Coins },
    customerSupport: { label: 'Customer Support', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30', icon: HelpCircle },
    host: { label: 'Host', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', icon: Video },
};

const defaultRoleConfig = { label: 'Staff', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/25', icon: User };

const managementSidebarSections: SidebarSection[] = [
    {
        title: 'CORE CONSOLE',
        category: 'Dashboard',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, category: 'Dashboard' },
            { name: 'App Releases (APK)', href: '/app-releases', icon: Download, category: 'Dashboard' },
            { name: 'Screen Security & Code', href: '/screen-security', icon: ShieldCheck, category: 'Dashboard' },
            { name: 'App Settings', href: '/settings', icon: Settings, category: 'Settings' },
            { name: 'System Logs', href: '/logs', icon: Terminal, category: 'Developer' }
        ]
    },
    {
        title: 'REFERRAL MANAGEMENT',
        category: 'Dashboard',
        items: [
            { name: 'User Refer & Earn', href: '/referrals', icon: Share2, category: 'Dashboard' },
            { name: 'Admin & Staff Referrals', href: '/referrals/links', icon: Users, category: 'Dashboard' }
        ]
    },
    {
        title: 'DEVICE & SECURITY CONTROL',
        category: 'Notifications',
        items: [
            { name: 'Device Limits & Bans', href: '/bans/device', icon: AlertOctagon, category: 'Notifications' },
            { name: 'ID & Account Bans', href: '/bans/id', icon: Ban, category: 'Notifications' }
        ]
    },
    {
        title: 'APP CONTENT & ECONOMY',
        category: 'Dashboard',
        items: [
            { name: 'CMS Editor', href: '/cms', icon: FileText, category: 'Dashboard' },
            { name: 'Banners', href: '/banners', icon: Layers, category: 'Dashboard' },
            { name: 'Ads', href: '/ads', icon: Radio, category: 'Dashboard' },
            { name: 'VIP Program', href: '/vip', icon: Crown, category: 'Dashboard' },
            { name: 'Levels', href: '/host-levels', icon: Award, category: 'Dashboard' },
            { name: 'Gifts', href: '/gifts', icon: Gift, category: 'Dashboard' },
            { name: 'Frames', href: '/frames', icon: Sliders, category: 'Dashboard' },
            { name: 'Avatars', href: '/avatars', icon: ImageIcon, category: 'Dashboard' },
            { name: 'Content Moderation', href: '/moderation/violations', icon: ShieldAlert, category: 'Dashboard' }
        ]
    },
    {
        title: 'EVENTS & MESSAGING',
        category: 'Notifications',
        items: [
            { name: 'Events', href: '/events', icon: Calendar, category: 'Notifications' },
            { name: 'System Messages', href: '/messages/system', icon: MessageSquare, category: 'Notifications' },
            { name: 'Activity Messages', href: '/messages/activity', icon: Bell, category: 'Notifications' }
        ]
    }
];

const adminSidebarSections: SidebarSection[] = [
    {
        title: 'Core Console',
        category: 'Dashboard',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, category: 'Dashboard' }
        ]
    },
    {
        title: 'Referral Management',
        category: 'Dashboard',
        items: [
            { name: 'User Refer & Earn', href: '/referrals', icon: Share2, category: 'Dashboard' },
            { name: 'Admin & Staff Referrals', href: '/referrals/links', icon: Users, category: 'Dashboard' }
        ]
    },
    {
        title: 'Users & Roles',
        category: 'Users',
        items: [
            {
                name: 'Users',
                icon: Users,
                category: 'Users',
                submenu: [
                    { name: 'User List', href: '/users' }
                ]
            },
            {
                name: 'Operator',
                icon: UserCheck,
                category: 'Users',
                submenu: [
                    { name: 'Create', href: '/operators/create' },
                    { name: 'Requests', href: '/operators/request' },
                    { name: 'List', href: '/operators' }
                ]
            },
            {
                name: 'Super Admin',
                icon: ShieldAlert,
                category: 'Users',
                submenu: [
                    { name: 'Create', href: '/super-admins/create' },
                    { name: 'Requests', href: '/super-admins/request' },
                    { name: 'List', href: '/super-admins' }
                ]
            },
            {
                name: 'Admin',
                icon: ShieldCheck,
                category: 'Users',
                submenu: [
                    { name: 'Create', href: '/admins/create' },
                    { name: 'Requests', href: '/admins/request' },
                    { name: 'List', href: '/admins' }
                ]
            },
            {
                name: 'Agency',
                icon: Briefcase,
                category: 'Users',
                submenu: [
                    { name: 'Create', href: '/agencies/create' },
                    { name: 'Requests', href: '/agencies/request' },
                    { name: 'List', href: '/agencies' }
                ]
            },
            {
                name: 'Host',
                icon: Video,
                category: 'Users',
                submenu: [
                    { name: 'Create', href: '/hosts/create' },
                    { name: 'Requests', href: '/hosts/request' },
                    { name: 'List', href: '/hosts' }
                ]
            },
            {
                name: 'Avatar Requests',
                href: '/avatar-requests',
                icon: User,
                category: 'Users'
            },
            {
                name: 'Default Bios',
                href: '/bios',
                icon: MessageSquare,
                category: 'Users'
            },
            {
                name: 'Host Management',
                href: '/host-management',
                icon: Video,
                category: 'Users'
            },
            {
                name: 'Seller',
                icon: Coins,
                category: 'Users',
                submenu: [
                    { name: 'Create', href: '/sellers/create' },
                    { name: 'Requests', href: '/sellers/request' },
                    { name: 'List', href: '/sellers' }
                ]
            },
            {
                name: 'Customer Support',
                icon: Headphones,
                category: 'Users',
                submenu: [
                    { name: 'Create', href: '/customer-support/create' },
                    { name: 'Requests', href: '/customer-support/request' },
                    { name: 'List', href: '/customer-support' }
                ]
            }
        ]
    },
    {
        title: 'Operations & Support',
        category: 'Reports',
        items: [
            { name: 'Reports', href: '/reports', icon: Flag, category: 'Reports' },
            { name: 'Help & Support', href: '/help-support', icon: HelpCircle, category: 'Reports' },
            { name: 'Account Deletions', href: '/deletions', icon: UserX, category: 'Reports' }
        ]
    },
    {
        title: 'Security & Verification',
        category: 'Notifications',
        items: [
            { name: 'Chat Violations', href: '/moderation/violations', icon: ShieldAlert, category: 'Notifications' },
            { name: 'ID Ban', href: '/bans/id', icon: Ban, category: 'Notifications' },
            { name: 'Device Limits & Bans', href: '/bans/device', icon: AlertOctagon, category: 'Notifications' },
            { name: 'Event', href: '/events', icon: Calendar, category: 'Notifications' },
            { name: 'System Message', href: '/messages/system', icon: MessageSquare, category: 'Notifications' },
            { name: 'Activity', href: '/messages/activity', icon: Bell, category: 'Notifications' },
            {
                name: 'Verification Management',
                icon: FileCheck,
                category: 'Notifications',
                submenu: [
                    { name: 'Face Verification Requests', href: '/verification/face' },
                    { name: 'KYC Verification Requests', href: '/verification/kyc' },
                    { name: 'Verification Reports', href: '/verification/reports' },
                    { name: 'Verification Settings', href: '/verification/settings' }
                ]
            }
        ]
    },
    {
        title: 'Finance & Recharges',
        category: 'Finance',
        items: [
            { name: 'Withdrawal', href: '/withdrawals', icon: DollarSign, category: 'Finance' },
            {
                name: 'Diamond Recharge',
                icon: Coins,
                category: 'Finance',
                submenu: [
                    { name: 'User', href: '/recharges/user' },
                    { name: 'Seller (Admin)', href: '/recharges/seller' },
                    { name: 'Recharge History', href: '/recharges/history' }
                ]
            },
            {
                name: 'Recharge History',
                href: '/recharges/history',
                icon: FileText,
                category: 'Finance'
            },
            {
                name: 'Seller Portal',
                icon: Gem,
                category: 'Finance',
                submenu: [
                    { name: 'Dashboard', href: '/seller' },
                    { name: 'User Recharge', href: '/seller/recharge' },
                    { name: 'Buy Stock', href: '/seller/stock' },
                    { name: 'Audit Logs', href: '/seller/history' },
                    { name: 'Profit & Ledger', href: '/seller/ledger' }
                ]
            }
        ]
    },
    {
        title: 'Enterprise Management',
        category: 'Users',
        items: [
            { name: 'Organization Chart', href: '/organization/chart', icon: Users, category: 'Users' },
            { name: 'Branches', href: '/organization/branches', icon: Briefcase, category: 'Users' },
            { name: 'Departments', href: '/organization/departments', icon: Users, category: 'Users' },
            { name: 'Teams', href: '/organization/teams', icon: UserCheck, category: 'Users' },
            { name: 'Task Management', href: '/tasks', icon: CheckSquare, category: 'Users' },
            { name: 'Calendar & Events', href: '/events', icon: Calendar, category: 'Users' }
        ]
    },
    {
        title: 'Enterprise V3 Suite',
        category: 'Settings',
        items: [
            { name: 'Settings', href: '/settings', icon: Settings, category: 'Settings' },
            { name: 'Workflows', href: '/settings/workflows', category: 'Settings', icon: Calendar },
            { name: 'Permission Builder', href: '/security/permissions', category: 'Settings', icon: ShieldAlert },
            { name: 'Role Templates', href: '/security/templates', category: 'Settings', icon: ShieldCheck },
            { name: 'Compare Users', href: '/security/compare', category: 'Settings', icon: Users },
            { name: 'Referral Links', href: '/referrals/links', category: 'Settings', icon: Plus }
        ]
    },
    {
        title: 'AI Command Center 4.0',
        category: 'Dashboard',
        items: [
            { name: 'AI Insights & Copilot', href: '/ai/insights', icon: Terminal, category: 'Dashboard' },
            { name: 'AI Automation Hub', href: '/ai/automation', icon: ShieldCheck, category: 'Dashboard' }
        ]
    },
    {
        title: 'Live Analytics & Health',
        category: 'Reports',
        items: [
            { name: 'Live User Map', href: '/analytics/live-map', icon: Globe, category: 'Reports' },
            { name: 'System Health Monitor', href: '/health', icon: Terminal, category: 'Reports' }
        ]
    },
    {
        title: 'Executive Command 5.0',
        category: 'Dashboard',
        items: [
            { name: 'Owner Console', href: '/owner', icon: Crown, category: 'Dashboard' },
            { name: 'Finance & Wallet Ledger', href: '/finance/ledger', icon: DollarSign, category: 'Dashboard' },
            { name: 'Compliance & GDPR', href: '/compliance', icon: ShieldCheck, category: 'Dashboard' }
        ]
    },
    {
        title: 'Developer & System Control',
        category: 'Developer',
        items: [
            { name: 'System Logs', href: '/logs', icon: Terminal, category: 'Developer' },
            { name: 'Audit Logs', href: '/security/logs', icon: ShieldCheck, category: 'Developer' },
            { name: 'API Center', href: '/api-center', icon: Terminal, category: 'Developer' }
        ]
    }
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const { unreadViolationCount } = useModerationSocket();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
    const [allowedMenus, setAllowedMenus] = useState<string[]>([]);
    const [allowedPages, setAllowedPages] = useState<string[]>([]);
    const [permissionsLoaded, setPermissionsLoaded] = useState(false);
    const [verificationCounts, setVerificationCounts] = useState({ face: 0, kyc: 0 });

    useEffect(() => {
        apiClient.get<any>('/api/v1/admin/verifications/reports/summary').then((response) => {
            const face = (response.data?.face || []).find((row: any) => row._id === 'PENDING')?.count || 0;
            const kyc = (response.data?.kyc || []).find((row: any) => row._id === 'PENDING')?.count || 0;
            setVerificationCounts({ face, kyc });
        }).catch(() => undefined);
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) setIsOpen(false);
            else setIsOpen(true);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-expand submenus if active route
    useEffect(() => {
        [...managementSidebarSections, ...adminSidebarSections].forEach(section => {
            section.items.forEach(item => {
                if (item.submenu) {
                    const isSubActive = item.submenu.some(sub => pathname === sub.href || (sub.href !== '/' && pathname.startsWith(sub.href)));
                    if (isSubActive) {
                        setExpandedMenus(prev => ({ ...prev, [item.name]: true }));
                    }
                }
            });
        });
    }, [pathname]);

    // Load permitted menus dynamically
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                if (!user) return;
                if (['owner', 'superAdmin', 'admin', 'agency', 'operator', 'coinSeller', 'customerSupport'].includes(user.role)) {
                    setAllowedMenus(['*']);
                    setAllowedPages(['*']);
                    setPermissionsLoaded(true);
                    return;
                }

                const res = await apiClient.get('/api/ems/my-permissions');
                if (res.success && res.data) {
                    setAllowedMenus(Array.isArray(res.data.menus) ? res.data.menus : []);
                    setAllowedPages(Array.isArray(res.data.pages) ? res.data.pages : []);
                }
            } catch (err) {
                console.error('Failed to load menu permissions', err);
            } finally {
                setPermissionsLoaded(true);
            }
        };

        fetchPermissions();
    }, [user]);

    const toggleMenu = (name: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const hasDynamicRoute = (href: string) => {
        if (!permissionsLoaded || user?.role === 'owner') return true;
        if (allowedPages.length === 0) return true;
        return allowedPages.includes('*') ||
            allowedPages.includes(href) ||
            allowedPages.includes(href.replace(/^\//, ''));
    };

    const hasDynamicMenu = (category: string) => {
        if (!permissionsLoaded || user?.role === 'owner') return true;
        if (allowedPages.length === 0 && allowedMenus.length === 0) return true;
        return allowedMenus.includes('*') || allowedMenus.includes(category);
    };

    const [mounted, setMounted] = useState(false);
    const [isManagementPanel, setIsManagementPanel] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const isMgmt = window.location.hostname.includes('management') ||
                window.location.pathname.startsWith('/management');
            setIsManagementPanel(!!isMgmt);
        }
    }, [pathname]);

    const activeSections = (mounted && isManagementPanel) ? managementSidebarSections : adminSidebarSections;

    const filteredSections = activeSections.map(section => {
        if (!hasDynamicMenu(section.category)) return null;
        if (user?.role === 'admin' && section.title.toUpperCase().includes('REFERRAL')) return null;

        const roleStr = user?.role ? String(user.role).toLowerCase() : '';
        const isRestrictedRole = roleStr === 'admin' || roleStr === 'superadmin' || roleStr === 'super-admin' || roleStr === 'agency';
        if (isRestrictedRole && (section.title.toUpperCase().includes('FINANCE') || section.title.toUpperCase().includes('RECHARGE'))) {
            return null;
        }

        const filteredItems = section.items.map(item => {
            if (item.submenu && item.submenu.length > 0) {
                const validSubmenu = item.submenu.filter(sub =>
                    isRouteAllowed(user?.role || 'user', sub.href) && hasDynamicRoute(sub.href)
                );
                if (validSubmenu.length === 0) return null;
                return {
                    ...item,
                    submenu: validSubmenu
                };
            }
            if (item.href && isRouteAllowed(user?.role || 'user', item.href) && hasDynamicRoute(item.href)) {
                return item;
            }
            return null;
        }).filter(Boolean) as SidebarItem[];

        if (filteredItems.length === 0) return null;

        return {
            ...section,
            items: filteredItems
        };
    }).filter(Boolean) as SidebarSection[];

    const displayedSections = filteredSections;
    const currentRole = user?.role ? (roleConfig[user.role] || defaultRoleConfig) : defaultRoleConfig;
    const RoleIcon = currentRole.icon;

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-slate-900/90 text-white md:hidden hover:bg-slate-800 transition-all shadow-xl border border-white/10 backdrop-blur-xl"
                aria-label="Toggle Sidebar"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-30 bg-black/80 backdrop-blur-md md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-white/10 bg-[#070a13]/95 backdrop-blur-2xl transition-transform duration-300 md:relative md:translate-x-0 shadow-2xl shadow-black/80",
                    !isOpen && isMobile ? "-translate-x-full" : "translate-x-0"
                )}
            >
                {/* Brand Header */}
                <div className="p-5 border-b border-white/10">
                    <div className="flex items-center gap-3.5">
                        <div className="relative">
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/25">
                                <div className="h-full w-full rounded-[14px] bg-[#0c101d] flex items-center justify-center overflow-hidden">
                                    <img
                                        src="/meethi-chat-logo.png"
                                        alt="YARO"
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                    <Sparkles className="h-5 w-5 text-violet-400" />
                                </div>
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#070a13] shadow-sm animate-pulse" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                                    YARO Admin
                                </h1>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-cyan-400/90">
                                    Enterprise Suite
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Sections */}
                <nav className="flex-1 space-y-5 overflow-y-auto px-3.5 py-4 custom-scrollbar">
                    {displayedSections.map((section, idx) => (
                        <div key={idx} className="space-y-1">
                            <h3 className="px-3 text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase">
                                {section.title}
                            </h3>
                            <div className="space-y-1 pt-1">
                                {section.items.map((item) => {
                                    const hasSubmenu = !!item.submenu;
                                    const isExpanded = !!expandedMenus[item.name];
                                    const isActive = item.href ? (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))) : false;

                                    if (hasSubmenu) {
                                        return (
                                            <div key={item.name} className="space-y-0.5">
                                                <button
                                                    onClick={() => toggleMenu(item.name)}
                                                    className={cn(
                                                        "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
                                                        isExpanded
                                                            ? "text-white bg-white/[0.06] shadow-sm"
                                                            : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon size={18} className={cn(isExpanded ? "text-violet-400" : "text-slate-500")} />
                                                        <span>{item.name}</span>
                                                    </div>
                                                    {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-500" />}
                                                </button>

                                                <AnimatePresence initial={false}>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden pl-7 pr-1 space-y-1 pt-1 border-l border-white/5 ml-4"
                                                        >
                                                            {item.submenu?.map((sub) => {
                                                                const isSubActive = pathname === sub.href;
                                                                return (
                                                                    <Link
                                                                        key={sub.href}
                                                                        href={sub.href}
                                                                        onClick={() => {
                                                                            if (window.innerWidth < 768) setIsOpen(false);
                                                                        }}
                                                                        className={cn(
                                                                            "block px-3 py-2 text-xs font-medium rounded-lg transition-all",
                                                                            isSubActive
                                                                                ? "text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                                                                                : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                                                                        )}
                                                                    >
                                                                        <span className="flex items-center justify-between gap-2">
                                                                            <span>{sub.name}</span>
                                                                            {sub.href === '/verification/face' && verificationCounts.face > 0 ? (
                                                                                <span className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold">
                                                                                    {verificationCounts.face}
                                                                                </span>
                                                                            ) : null}
                                                                            {sub.href === '/verification/kyc' && verificationCounts.kyc > 0 ? (
                                                                                <span className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold">
                                                                                    {verificationCounts.kyc}
                                                                                </span>
                                                                            ) : null}
                                                                        </span>
                                                                    </Link>
                                                                );
                                                            })}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href!}
                                            onClick={() => {
                                                if (window.innerWidth < 768) setIsOpen(false);
                                            }}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                                                isActive
                                                    ? "text-white bg-gradient-to-r from-violet-600/25 via-indigo-600/20 to-transparent border-l-2 border-violet-400 shadow-md shadow-violet-900/20"
                                                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                            )}
                                        >
                                            <item.icon size={18} className={cn(isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300 transition-colors")} />
                                            <span className="flex-1">{item.name}</span>
                                            {item.href === '/moderation/violations' && unreadViolationCount > 0 && (
                                                <span className="rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold shadow-sm">
                                                    {unreadViolationCount}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer User Profile & Theme */}
                <div className="p-3.5 mt-auto border-t border-white/10 bg-black/20 space-y-2.5">
                    <div className={cn(
                        "flex items-center justify-between gap-3 rounded-2xl border p-2.5 backdrop-blur-xl transition-all",
                        currentRole.bg,
                        currentRole.border
                    )}>
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className={cn(
                                "h-9 w-9 rounded-xl border flex items-center justify-center text-xs font-bold shrink-0 shadow-inner",
                                currentRole.color,
                                currentRole.border,
                                "bg-slate-900/80"
                            )}>
                                <RoleIcon size={18} />
                            </div>
                            <div className="overflow-hidden">
                                <p className={cn("text-[9px] font-black uppercase tracking-wider", currentRole.color)}>
                                    {currentRole.label}
                                </p>
                                <p className="text-xs font-bold text-white truncate max-w-[100px]">
                                    {user?.name || 'Administrator'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <ThemeToggle />
                            <button
                                onClick={logout}
                                title="Sign Out"
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
