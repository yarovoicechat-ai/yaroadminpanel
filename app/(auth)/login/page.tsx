'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
    Lock, Loader2, Crown, ShieldCheck, ShieldAlert, UserCheck, HelpCircle, Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

const rolePortals = [
    { name: 'Owner Portal', href: '/login/owner', role: 'owner', color: 'from-pink-600 to-purple-600', icon: Crown },
    { name: 'Super Admin', href: '/login/super-admin', role: 'super-admin', color: 'from-purple-600 to-indigo-600', icon: ShieldCheck },
    { name: 'Admin Console', href: '/login/admin', role: 'admin', color: 'from-indigo-600 to-blue-600', icon: ShieldAlert },
    { name: 'Operator Hub', href: '/login/operator', role: 'operator', color: 'from-teal-600 to-emerald-600', icon: UserCheck },
    { name: 'Customer Support', href: '/login/customer-service', role: 'customer-service', color: 'from-cyan-600 to-sky-600', icon: HelpCircle },
    { name: 'Agency Partner', href: '/login/agency', role: 'agency', color: 'from-amber-600 to-orange-600', icon: Briefcase },
];

export default function LoginPage() {
    const [username, setUsername] = useState('');
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
            setError(err.message || 'Invalid credentials');
            setIsSigningIn(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 text-white">
            <div className="w-full max-w-4xl space-y-8">

                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase tracking-wider">
                        MeethiChat Enterprise Admin Platform
                    </h1>
                    <p className="text-slate-400 text-sm">
                        Select your specialized role login portal or enter administrative credentials below.
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
                                className={`p-4 rounded-2xl bg-gradient-to-b ${p.color} hover:scale-105 transition-all text-center flex flex-col items-center justify-center gap-2 shadow-xl border border-white/20 group`}
                            >
                                <Icon className="w-6 h-6 text-white group-hover:animate-bounce" />
                                <span className="text-xs font-bold text-white uppercase tracking-wider">{p.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Direct Login Card */}
                <Card className="max-w-md mx-auto bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-2xl rounded-3xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl text-center font-black text-white uppercase">Direct Universal Sign In</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-300">Username / Email</label>
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username or email"
                                    disabled={isSigningIn}
                                    className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-slate-300">Password</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    disabled={isSigningIn}
                                    className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                                />
                            </div>

                            {error && (
                                <div className="text-xs text-red-400 text-center bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                                    {error}
                                </div>
                            )}

                            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl py-2.5" disabled={isSigningIn}>
                                {isSigningIn ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing In...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Authenticate & Continue
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
