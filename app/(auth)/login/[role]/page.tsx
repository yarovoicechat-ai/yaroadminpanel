'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
    Crown, ShieldCheck, UserCheck, Briefcase, HelpCircle, ShieldAlert, Lock, User as UserIcon, ArrowRight, ArrowLeft, Loader2
} from 'lucide-react';
import Link from 'next/link';

interface RoleLoginConfig {
    title: string;
    subtitle: string;
    badge: string;
    glowColor: string;
    accentBg: string;
    accentBorder: string;
    accentText: string;
    buttonGradient: string;
    icon: any;
    defaultRedirect: string;
}

const roleConfigs: Record<string, RoleLoginConfig> = {
    owner: {
        title: 'Executive Owner Portal',
        subtitle: 'Master enterprise login for corporate ownership & high-level platform administration.',
        badge: 'Owner Access Only',
        glowColor: 'bg-amber-500/15',
        accentBg: 'bg-amber-500/15',
        accentBorder: 'border-amber-500/40',
        accentText: 'text-amber-400',
        buttonGradient: 'from-amber-500 to-orange-600',
        icon: Crown,
        defaultRedirect: '/dashboard',
    },
    'super-admin': {
        title: 'Super Admin Portal',
        subtitle: 'Platform governance, global compliance & system security administration.',
        badge: 'Super Admin Clearance',
        glowColor: 'bg-violet-500/15',
        accentBg: 'bg-violet-500/15',
        accentBorder: 'border-violet-500/40',
        accentText: 'text-violet-400',
        buttonGradient: 'from-violet-600 to-indigo-600',
        icon: ShieldCheck,
        defaultRedirect: '/super-admins/request',
    },
    admin: {
        title: 'Operations Admin Login',
        subtitle: 'Platform management console for system administrators.',
        badge: 'Admin Console',
        glowColor: 'bg-emerald-500/15',
        accentBg: 'bg-emerald-500/15',
        accentBorder: 'border-emerald-500/40',
        accentText: 'text-emerald-400',
        buttonGradient: 'from-emerald-600 to-teal-600',
        icon: ShieldAlert,
        defaultRedirect: '/admins/request',
    },
    operator: {
        title: 'Regional Operator Hub',
        subtitle: 'Operator login for team leaders, host management & live moderation.',
        badge: 'Operator Workspace',
        glowColor: 'bg-cyan-500/15',
        accentBg: 'bg-cyan-500/15',
        accentBorder: 'border-cyan-500/40',
        accentText: 'text-cyan-400',
        buttonGradient: 'from-cyan-600 to-blue-600',
        icon: UserCheck,
        defaultRedirect: '/operators/request',
    },
    'customer-service': {
        title: 'Customer Support Portal',
        subtitle: 'Customer care specialist portal for ticket resolution & user assistance.',
        badge: 'Customer Support Desk',
        glowColor: 'bg-teal-500/15',
        accentBg: 'bg-teal-500/15',
        accentBorder: 'border-teal-500/40',
        accentText: 'text-teal-400',
        buttonGradient: 'from-teal-600 to-cyan-600',
        icon: HelpCircle,
        defaultRedirect: '/customer-support/request',
    },
    agency: {
        title: 'Agency Partner Portal',
        subtitle: 'Official agency management dashboard for agency leads & host managers.',
        badge: 'Agency Partner Login',
        glowColor: 'bg-pink-500/15',
        accentBg: 'bg-pink-500/15',
        accentBorder: 'border-pink-500/40',
        accentText: 'text-pink-400',
        buttonGradient: 'from-pink-600 to-rose-600',
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
        <div className="relative min-h-screen bg-[#070a13] flex items-center justify-center p-4 text-white overflow-hidden">
            {/* Ambient Dynamic Background Glow */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className={`absolute -top-[20%] left-[20%] h-[600px] w-[600px] rounded-full ${config.glowColor} blur-[160px]`} />
                <div className="absolute -bottom-[20%] right-[20%] h-[500px] w-[500px] rounded-full bg-slate-800/20 blur-[150px]" />
            </div>

            <div className="relative z-10 max-w-md w-full bg-[#0d1222]/85 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl shadow-black/80 space-y-6">
                <div className="text-center space-y-3">
                    <div className={`w-16 h-16 rounded-2xl ${config.accentBg} border ${config.accentBorder} flex items-center justify-center mx-auto shadow-xl`}>
                        <RoleIcon className={`w-8 h-8 ${config.accentText}`} />
                    </div>
                    <span className={`inline-block text-[10px] uppercase tracking-widest font-bold ${config.accentBg} ${config.accentText} px-3 py-1 rounded-full border ${config.accentBorder}`}>
                        {config.badge}
                    </span>
                    <h1 className="text-2xl font-black text-white pt-1 tracking-tight">
                        {config.title}
                    </h1>
                    <p className="text-xs text-slate-400">
                        {config.subtitle}
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Username / Email</label>
                        <div className="relative">
                            <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Enter username or email"
                                required
                                disabled={submitting}
                                className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/60 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••••••"
                                required
                                disabled={submitting}
                                className="w-full bg-slate-950/70 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/60 transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-3 rounded-xl bg-gradient-to-r ${config.buttonGradient} hover:brightness-110 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Authenticating Session...
                            </>
                        ) : (
                            <>
                                Access Dashboard <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center pt-2 border-t border-white/10">
                    <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Select Different Role Portal</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
