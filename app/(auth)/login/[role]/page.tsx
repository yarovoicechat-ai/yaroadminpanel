'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
    Crown, ShieldCheck, UserCheck, Briefcase, HelpCircle, ShieldAlert, Lock, User as UserIcon, ArrowRight
} from 'lucide-react';

interface RoleLoginConfig {
    title: string;
    subtitle: string;
    badge: string;
    gradient: string;
    accentBg: string;
    accentBorder: string;
    icon: any;
    defaultRedirect: string;
}

const roleConfigs: Record<string, RoleLoginConfig> = {
    owner: {
        title: 'Executive Owner Portal',
        subtitle: 'Master enterprise login for corporate ownership & high-level platform administration.',
        badge: 'Owner Access Only',
        gradient: 'from-slate-950 via-pink-950 to-purple-950',
        accentBg: 'bg-pink-500/20 text-pink-400',
        accentBorder: 'border-pink-500/30',
        icon: Crown,
        defaultRedirect: '/dashboard',
    },
    'super-admin': {
        title: 'Super Admin Portal',
        subtitle: 'Platform governance, global compliance & system security administration.',
        badge: 'Super Admin Clearance',
        gradient: 'from-slate-950 via-purple-950 to-indigo-950',
        accentBg: 'bg-purple-500/20 text-purple-400',
        accentBorder: 'border-purple-500/30',
        icon: ShieldCheck,
        defaultRedirect: '/super-admins/request',
    },
    admin: {
        title: 'Operations Admin Login',
        subtitle: 'Platform management console for system administrators.',
        badge: 'Admin Console',
        gradient: 'from-slate-950 via-blue-950 to-indigo-950',
        accentBg: 'bg-blue-500/20 text-blue-400',
        accentBorder: 'border-blue-500/30',
        icon: ShieldAlert,
        defaultRedirect: '/admins/request',
    },
    operator: {
        title: 'Regional Operator Hub',
        subtitle: 'Operator login for team leaders, host management & live moderation.',
        badge: 'Operator Workspace',
        gradient: 'from-slate-950 via-teal-950 to-emerald-950',
        accentBg: 'bg-teal-500/20 text-teal-400',
        accentBorder: 'border-teal-500/30',
        icon: UserCheck,
        defaultRedirect: '/operators/request',
    },
    'customer-service': {
        title: 'Customer Support Portal',
        subtitle: 'Customer care specialist portal for ticket resolution & user assistance.',
        badge: 'Customer Support Desk',
        gradient: 'from-slate-950 via-cyan-950 to-sky-950',
        accentBg: 'bg-cyan-500/20 text-cyan-400',
        accentBorder: 'border-cyan-500/30',
        icon: HelpCircle,
        defaultRedirect: '/customer-support/request',
    },
    agency: {
        title: 'Agency Partner Portal',
        subtitle: 'Official agency management dashboard for agency leads & host managers.',
        badge: 'Agency Partner Login',
        gradient: 'from-slate-950 via-amber-950 to-orange-950',
        accentBg: 'bg-amber-500/20 text-amber-400',
        accentBorder: 'border-amber-500/30',
        icon: Briefcase,
        defaultRedirect: '/agencies/request',
    },
};

export default function RoleLoginPage({ params }: { params: Promise<{ role: string }> }) {
    const resolvedParams = use(params);
    const roleKey = resolvedParams.role.toLowerCase();
    const config = roleConfigs[roleKey] || roleConfigs['admin'];

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { login } = useAuth();
    const router = useRouter();

    const RoleIcon = config.icon;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            toast.error('Please enter both username/email and password.');
            return;
        }

        try {
            setSubmitting(true);
            await login(username, password);
            toast.success(`Logged in successfully to ${config.title}`);
            router.push(config.defaultRedirect);
        } catch (error: any) {
            toast.error(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br ${config.gradient} flex items-center justify-center p-4 text-white font-sans`}>
            <div className="max-w-md w-full bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl shadow-2xl space-y-6">

                <div className="text-center space-y-3">
                    <div className={`w-16 h-16 rounded-2xl ${config.accentBg} border ${config.accentBorder} flex items-center justify-center mx-auto shadow-lg`}>
                        <RoleIcon className="w-8 h-8" />
                    </div>
                    <span className={`text-xs uppercase tracking-widest font-bold ${config.accentBg} px-3 py-1 rounded-full border ${config.accentBorder}`}>
                        {config.badge}
                    </span>
                    <h1 className="text-2xl font-black text-white pt-1">
                        {config.title}
                    </h1>
                    <p className="text-xs text-white/70">
                        {config.subtitle}
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Username / Email</label>
                        <div className="relative">
                            <UserIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Enter username or email"
                                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-white/20 to-white/10 hover:bg-white/30 text-white font-black text-sm border border-white/30 shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            <>
                                Access Dashboard <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <a href="/login" className="text-xs text-white/60 hover:text-white transition-colors">
                        ← Select Different Role Login
                    </a>
                </div>

            </div>
        </div>
    );
}
