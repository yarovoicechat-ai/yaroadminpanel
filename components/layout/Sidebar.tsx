'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard, Menu, X, LogOut, User, Award, Gift, UserX,
    Users, UserCheck, ShieldAlert, Video, Plus, Flag, HelpCircle,
    Ban, AlertOctagon, Calendar, MessageSquare, Bell,
    CheckSquare, FileCheck, DollarSign, Coins, ChevronDown, ChevronRight,
    Crown, Briefcase, Terminal, ShieldCheck, Settings
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';

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
            { name: 'Dashboard', href: '/', icon: LayoutDashboard, category: 'Dashboard' }
        ]
    },
    {
        title: 'Recruitment Portal',
        category: 'Dashboard',
        items: [
            {
                name: 'Recruitment Apps',
                icon: Briefcase,
                category: 'Dashboard',
                submenu: [
                    { name: 'All Applications', href: '/recruitment' },
                    { name: 'Agency Applications', href: '/recruitment/agency' },
                    { name: 'Operator Applications', href: '/recruitment/operator' },
                    { name: 'Admin Applications', href: '/recruitment/admin' },
                    { name: 'Customer Service Apps', href: '/recruitment/customer-service' },
                    { name: 'Super Admin Apps', href: '/recruitment/super-admin' },
                ]
            }
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
                    { name: 'Add User', href: '/users/add' },
                    { name: 'User List', href: '/users' },
                    { name: 'New User', href: '/users/new' }
                ]
            },
            {
                name: 'Operator',
                icon: UserCheck,
                category: 'Users',
                submenu: [
                    { name: 'Operator Requests', href: '/operators/request' },
                    { name: 'Operator List', href: '/operators' }
                ]
            },
            {
                name: 'Super Admin',
                icon: ShieldAlert,
                category: 'Users',
                submenu: [
                    { name: 'Super Admin Requests', href: '/super-admins/request' },
                    { name: 'Super Admin List', href: '/super-admins' }
                ]
            },
            {
                name: 'Seller',
                icon: ShieldAlert,
                category: 'Coin Seller',
                submenu: [
                    { name: 'Add Seller', href: '/sellers/add' },
                    { name: 'Request', href: '/sellers/request' },
                    { name: 'List - Seller', href: '/sellers' }
                ]
            }
        ]
    },
    {
        title: 'Admin Module',
        category: 'Admin',
        items: [
            { name: 'Create Admin', href: '/admins/create', icon: Plus, category: 'Admin' },
            { name: 'Admin Requests', href: '/admins/request', icon: FileCheck, category: 'Admin' },
            { name: 'Admin List', href: '/admins', icon: Users, category: 'Admin' }
        ]
    },
    {
        title: 'Super Admin Module',
        category: 'SuperAdmin',
        items: [
            { name: 'Create Super Admin', href: '/super-admins/create', icon: Plus, category: 'SuperAdmin' },
            { name: 'Super Admin Requests', href: '/super-admins/request', icon: FileCheck, category: 'SuperAdmin' },
            { name: 'Super Admin List', href: '/super-admins', icon: Users, category: 'SuperAdmin' }
        ]
    },


    {
        title: 'Hosts & Performance',
        category: 'Host',
        items: [
            {
                name: 'Hosts',
                icon: Video,
                category: 'Host',
                submenu: [
                    { name: 'Add Host', href: '/hosts/add' },
                    { name: 'Host Request', href: '/hosts/request' },
                    { name: 'Host List', href: '/hosts' }
                ]
            },
            { name: 'Host Management', href: '/host-management', icon: Video, category: 'Host' }
        ]
    },
    {
        title: 'Agencies Office',
        category: 'Agency',
        items: [
            {
                name: 'Agency',
                icon: Briefcase,
                category: 'Agency',
                submenu: [
                    { name: 'Agency List', href: '/agencies' },
                    { name: 'Agency Requests', href: '/agencies/requests' }
                ]
            }
        ]
    },

    {
        title: 'Operations & Support',
        category: 'Reports',
        items: [
            { name: 'Add New', href: '/add-new', icon: Plus, category: 'Reports' },
            { name: 'Reports', href: '/reports', icon: Flag, category: 'Reports' },
            { name: 'Help & Support', href: '/help-support', icon: HelpCircle, category: 'Reports' },
            { name: 'Account Deletions', href: '/deletions', icon: UserX, category: 'Reports' }
        ]
    },
    {
        title: 'Security & Verification',
        category: 'Notifications',
        items: [
            { name: 'ID Ban', href: '/bans/id', icon: Ban, category: 'Notifications' },
            { name: 'Device Ban', href: '/bans/device', icon: AlertOctagon, category: 'Notifications' },
            { name: 'Event', href: '/events', icon: Calendar, category: 'Notifications' },
            { name: 'System Message', href: '/messages/system', icon: MessageSquare, category: 'Notifications' },
            { name: 'Activity', href: '/messages/activity', icon: Bell, category: 'Notifications' },
            { name: 'KYC Verification', href: '/kyc', icon: CheckSquare, category: 'Notifications' },
            { name: 'Requests Approval', href: '/verification/requests', icon: FileCheck, category: 'Notifications' }
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
        title: 'System & Control',
        category: 'Settings',
        items: [
            { name: 'Settings', href: '/settings', icon: Settings, category: 'Settings' },
            { name: 'Workflows', href: '/settings/workflows', category: 'Settings', icon: Calendar },
            { name: 'Permissions Builder', href: '/security/permissions', category: 'Settings', icon: ShieldAlert },
            { name: 'Compare Users', href: '/security/compare', category: 'Settings', icon: Users },
            { name: 'Referral Links', href: '/referrals/links', category: 'Settings', icon: Plus }
        ]
    },
    {
        title: 'Developer Center',
        category: 'Developer',
        items: [
            { name: 'System Logs', href: '/logs', icon: Terminal, category: 'Developer' },
            { name: 'Audit Logs', href: '/security/logs', icon: ShieldCheck, category: 'Developer' }
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

    // Load permitted menus dynamically
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                if (!user) return;
                
                if (user.role === 'owner') {
                    // Owner always has all menus
                    setAllowedMenus(['Dashboard', 'Users', 'Host', 'Agency', 'Coin Seller', 'Finance', 'Reports', 'Notifications', 'Settings', 'Developer', 'Admin', 'SuperAdmin']);
                    return;
                }

                const res = await apiClient.get('/api/ems/my-permissions');
                if (res.success && res.data && res.data.menus) {
                    setAllowedMenus(res.data.menus);
                }
            } catch (err) {
                console.error('Failed to load menu permissions', err);
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

    // Filter layout sections based on loaded permissions
    const filteredSections = sidebarSections.map(section => {
        // Owner bypasses everything. Otherwise check if the category is allowed.
        const isCategoryAllowed = user?.role === 'owner' || allowedMenus.includes(section.category);
        if (!isCategoryAllowed) return null;

        const filteredItems = section.items.filter(item => {
            return user?.role === 'owner' || allowedMenus.includes(item.category);
        });

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
                        Meethi Chat EMS
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
                                                                        {sub.name}
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
