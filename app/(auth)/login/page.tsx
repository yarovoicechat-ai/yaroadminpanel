'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Image from 'next/image';
import {
    Lock, Loader2, Crown, ShieldCheck, ShieldAlert, UserCheck, HelpCircle, Briefcase, Sparkles, Mail, KeyRound, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const rolePortals = [
    { name: 'Owner Portal', href: '/login/owner', role: 'owner', gradient: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400', icon: Crown },
    { name: 'Super Admin', href: '/login/super-admin', role: 'super-admin', gradient: 'from-violet-500/20 to-indigo-500/10 border-violet-500/30 text-violet-400', icon: ShieldCheck },
    { name: 'Admin Console', href: '/login/admin', role: 'admin', gradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400', icon: ShieldAlert },
    { name: 'Operator Hub', href: '/login/operator', role: 'operator', gradient: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400', icon: UserCheck },
    { name: 'Customer Support', href: '/login/customer-service', role: 'customer-service', gradient: 'from-teal-500/20 to-emerald-500/10 border-teal-500/30 text-teal-400', icon: HelpCircle },
    { name: 'Agency Partner', href: '/login/agency', role: 'agency', gradient: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400', icon: Briefcase },
];

export default function LoginPage() {
    const [username, setUsername] = useState('yaroapp@gmail.com');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const [isSigningIn, setIsSigningIn] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSigningIn(true);
        try {
            await login(username, password);
            toast.success('Logged in successfully');
        } catch (err: any) {
            setError(err?.message || 'Invalid credentials');
            setIsSigningIn(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#070a13] p-4 text-white overflow-hidden">
            {/* Ambient Aurora Glow Background - Yaro Pink & Violet */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-[20%] left-[20%] h-[600px] w-[600px] rounded-full bg-pink-500/15 blur-[160px]" />
                <div className="absolute top-[40%] -right-[10%] h-[550px] w-[550px] rounded-full bg-purple-600/15 blur-[150px]" />
                <div className="absolute -bottom-[20%] left-[30%] h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[160px]" />
            </div>

            <div className="relative z-10 w-full max-w-4xl space-y-8 my-8">
                {/* Brand Header */}
                <div className="text-center space-y-3">
                    <div className="flex justify-center mb-1">
                        <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-pink-500/40 bg-slate-950 shadow-[0_0_28px_rgba(236,72,153,0.35)] p-0.5">
                            <Image src="/logo.png" alt="Yaro Logo" width={80} height={80} className="rounded-[14px] object-cover" priority />
                        </div>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 backdrop-blur-md shadow-lg shadow-pink-500/10">
                        <Sparkles className="h-4 w-4 text-pink-400 animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-pink-300">
                            Enterprise Access Portal
                        </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                        YARO Admin Platform
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto">
                        High-throughput administrative operations, real-time moderation, multi-tier RBAC, and financial ledger control.
                    </p>
                </div>

                {/* Role Specific Login Quick Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {rolePortals.map(p => {
                        const Icon = p.icon;
                        return (
                            <Link
                                key={p.role}
                                href={p.href}
                                className={`p-4 rounded-2xl bg-slate-900/60 backdrop-blur-xl border ${p.gradient} hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 text-center flex flex-col items-center justify-center gap-2.5 shadow-xl shadow-black/40 group`}
                            >
                                <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Icon className="w-5 h-5 transition-transform group-hover:rotate-6" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">{p.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Direct Login Card */}
                <Card className="max-w-md mx-auto bg-[#0d1222]/85 border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl overflow-hidden">
                    <CardHeader className="text-center pb-2 pt-6">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-[1px] shadow-lg shadow-indigo-500/25">
                            <div className="flex h-full w-full items-center justify-center rounded-[15px] bg-[#070a13]">
                                <KeyRound className="h-5 w-5 text-cyan-400" />
                            </div>
                        </div>
                        <CardTitle className="text-xl font-bold text-white tracking-tight">
                            Universal Sign In
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-400">
                            Enter your administrative credentials to authenticate
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-2">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Username / Email</span>
                                </label>
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username or email"
                                    disabled={isSigningIn}
                                    required
                                    className="bg-slate-950/70 border-white/10 text-white placeholder-slate-500 text-xs rounded-xl h-11"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Password</span>
                                </label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    disabled={isSigningIn}
                                    required
                                    className="bg-slate-950/70 border-white/10 text-white placeholder-slate-500 text-xs rounded-xl h-11"
                                />
                            </div>

                            {error && (
                                <div className="text-xs text-rose-300 text-center bg-rose-500/15 p-3 rounded-xl border border-rose-500/30">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white font-bold text-xs rounded-xl h-11 shadow-lg shadow-indigo-500/25 transition-all mt-2"
                                disabled={isSigningIn}
                            >
                                {isSigningIn ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Authenticating Session...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Authenticate & Enter Console
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
