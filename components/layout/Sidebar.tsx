'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard, Menu, X, LogOut, User, Award, Gift, UserX,
    Users, UserCheck, ShieldAlert, Video, Plus, Flag, HelpCircle,
    Ban, AlertOctagon, Calendar, MessageSquare, Bell, Share2,
    CheckSquare, FileCheck, DollarSign, Coins, ChevronDown, ChevronRight,
    Crown, Briefcase, Terminal, ShieldCheck, Settings, Headphones, Globe,
    FileText, Layers, Radio, Sliders, Image as ImageIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
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
    category: string; // Used to filter dynamically
}

interface SidebarSection {
    title: string;
    items: SidebarItem[];
    category: string;
}

// Dynamic role configurations
export const roleConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
    owner: { label: 'Owner', color: 'text-pink-400 dark:text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/25', icon: Crown },
    operator: { label: 'Operator', color: 'text-blue-400 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/25', icon: UserCheck },
    superAdmin: { label: 'Super Admin', color: 'text-purple-400 dark:text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/25', icon: ShieldCheck },
    admin: { label: 'Admin', color: 'text-emerald-400 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', icon: UserCheck },
    agency: { label: 'Agency', color: 'text-amber-400 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25', icon: Briefcase },
    coinSeller: { label: 'Coin Seller', color: 'text-rose-400 dark:text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/25', icon: Coins },
    customerSupport: { label: 'Customer Support', color: 'text-cyan-400 dark:text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/25', icon: HelpCircle },
    host: { label: 'Host', color: 'text-lime-400 dark:text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/25', icon: Video },
};

const defaultRoleConfig = { label: 'Staff', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/25', icon: User };

const sidebarSections: SidebarSection[] = [
    {
        title: 'Core Console',
        category: 'Dashboard',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, category: 'Dashboard' },
            { name: 'App Settings', href: '/settings', icon: Settings, category: 'Settings' },
            { name: 'System Logs', href: '/logs', icon: Terminal, category: 'Developer' }
        ]
    },
    {
        title: 'App Content & Economy',
        category: 'Dashboard',
        items: [
            { name: 'CMS Editor', href: '/cms', icon: FileText, category: 'Dashboard' },
            { name: 'Banners', href: '/banners', icon: Layers, category: 'Dashboard' },
            { name: 'Ads', href: '/ads', icon: Radio, category: 'Dashboard' },
            { name: 'Referrals', href: '/referrals/links', icon: Share2, category: 'Dashboard' },
            { name: 'VIP Program', href: '/vip', icon: Crown, category: 'Dashboard' },
            { name: 'Levels', href: '/host-levels', icon: Award, category: 'Dashboard' },
            { name: 'Gifts', href: '/gifts', icon: Gift, category: 'Dashboard' },
            { name: 'Frames', href: '/frames', icon: Sliders, category: 'Dashboard' },
            { name: 'Avatars', href: '/avatars', icon: ImageIcon, category: 'Dashboard' },
            { name: 'Content Moderation', href: '/moderation/violations', icon: ShieldAlert, category: 'Dashboard' }
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
            { name: 'Device Ban', href: '/bans/device', icon: AlertOctagon, category: 'Notifications' },
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
                    { name: 'Seller', href: '/recharges/seller' }
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
        sidebarSections.forEach(section => {
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
                if (!user) {
                    return;
                }
                if (['owner', 'superAdmin', 'admin', 'operator'].includes(user.role)) {
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

    // Filter layout sections strictly based on ROLE_PERMISSION_MATRIX
    const hasDynamicRoute = (href: string) => {
        if (!permissionsLoaded || user?.role === 'owner') return true;
        return allowedPages.includes('*') ||
            allowedPages.includes(href) ||
            allowedPages.includes(href.replace(/^\//, ''));
    };

    const hasDynamicMenu = (category: string) => {
        if (!permissionsLoaded || user?.role === 'owner') return true;
        if (allowedPages.length > 0) return true;
        return allowedMenus.includes('*') || allowedMenus.includes(category);
    };

    const filteredSections = sidebarSections.map(section => {
        if (!hasDynamicMenu(section.category)) return null;
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

    const currentRole = user?.role ? (roleConfig[user.role] || defaultRoleConfig) : defaultRoleConfig;
    const RoleIcon = currentRole.icon;

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-slate-100 md:hidden hover:bg-slate-700 transition-colors shadow-lg border border-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                aria-label="Toggle Sidebar"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && isMobile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 glass-panel flex flex-col pt-20 md:pt-8 transition-transform duration-300 md:translate-x-0 md:relative h-screen bg-slate-900 border-r border-slate-800",
                    !isOpen && isMobile ? "-translate-x-full" : "translate-x-0"
                )}
            >
                <div className="px-6 mb-6 mt-4 md:mt-0 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Mithi Chat EMS
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-4 overflow-y-auto pb-6">
                    {filteredSections.map((section, idx) => (
                        <div key={idx} className="space-y-1">
                            <h3 className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                {section.title}
                            </h3>
                            <div className="space-y-0.5">
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
                                                        "w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 text-sm font-semibold"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon size={18} className="text-slate-500" />
                                                        <span>{item.name}</span>
                                                    </div>
                                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                </button>

                                                <AnimatePresence initial={false}>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden pl-9 space-y-0.5"
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
                                                                            "block px-4 py-2 text-xs font-semibold rounded-lg transition-colors",
                                                                            isSubActive
                                                                                ? "text-primary bg-primary/10 border border-primary/20"
                                                                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                                                                        )}
                                                                    >
                                                                        <span className="flex items-center justify-between gap-2">
                                                                            <span>{sub.name}</span>
                                                                            {sub.href === '/verification/face' && verificationCounts.face > 0 ? <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] text-white">{verificationCounts.face}</span> : null}
                                                                            {sub.href === '/verification/kyc' && verificationCounts.kyc > 0 ? <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] text-white">{verificationCounts.kyc}</span> : null}
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
                                                "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group text-sm font-semibold",
                                                isActive
                                                    ? "text-primary bg-primary/10 border border-primary/20"
                                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                                            )}
                                        >
                                            <item.icon size={18} className={cn(isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-400")} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-4 mt-auto border-t border-slate-800 space-y-4">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors group text-sm font-semibold"
                    >
                        <LogOut size={18} className="text-slate-500 group-hover:text-rose-400" />
                        <span>Sign Out</span>
                    </button>

                    <div className={cn("rounded-xl p-3 border flex items-center gap-3 justify-between shadow-inner transition-colors", currentRole.bg, currentRole.border)}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={cn("h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0", currentRole.color, currentRole.border, "bg-slate-900/50")}>
                                <RoleIcon size={16} />
                            </div>
                            <div className="overflow-hidden">
                                <p className={cn("text-[9px] font-bold uppercase tracking-wider opacity-80", currentRole.color)}>
                                    {currentRole.label}
                                </p>
                                <p className="text-xs font-bold text-slate-200 truncate w-24">{user?.name || 'Admin'}</p>
                            </div>
                        </div>
                        <ThemeToggle />
                    </div>
                </div>
            </aside>
        </>
    );
}
