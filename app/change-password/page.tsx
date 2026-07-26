'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, XCircle, Loader2, KeyRound } from 'lucide-react';

const PASSWORD_RULES = [
    { label: 'At least 10 characters', test: (p: string) => p.length >= 10 },
    { label: 'At least 1 uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'At least 1 lowercase letter (a-z)', test: (p: string) => /[a-z]/.test(p) },
    { label: 'At least 1 number (0-9)', test: (p: string) => /\d/.test(p) },
    { label: 'At least 1 special character (!@#$%^&*)', test: (p: string) => /[!@#$%^&*]/.test(p) },
];

export default function ChangePasswordPage() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
        if (!token) router.replace('/login');
    }, [router]);

    const allRulesPassed = PASSWORD_RULES.every(r => r.test(newPassword));
    const passwordsMatch = newPassword && newPassword === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!allRulesPassed) {
            toast.error('New password does not meet the requirements.');
            return;
        }
        if (!passwordsMatch) {
            toast.error('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            const res = await apiClient.post('/api/admin/change-password', { currentPassword, newPassword });
            if (res.success) {
                toast.success('Password changed successfully! Redirecting to dashboard...');
                setTimeout(() => router.push('/dashboard'), 1500);
            } else {
                toast.error(res.message || 'Failed to change password.');
            }
        } catch (err: any) {
            toast.error(err?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 text-white">
            <div className="w-full max-w-md space-y-6">

                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl ring-4 ring-amber-500/20">
                        <KeyRound className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        Set Your Password
                    </h1>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Your account requires a password change before you can access the dashboard.<br />
                        Please create a strong, unique password.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl space-y-5">

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Current Password */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-300">Current (Assigned) Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type={showCurrent ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={e => setCurrentPassword(e.target.value)}
                                    placeholder="Enter the password provided to you"
                                    required
                                    className="w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                                />
                                <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-300">New Password</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    required
                                    className="w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                                />
                                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Password Rules */}
                        {newPassword && (
                            <div className="bg-slate-800/50 rounded-xl p-4 space-y-2 border border-slate-700">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password Requirements</p>
                                {PASSWORD_RULES.map((rule, idx) => {
                                    const passed = rule.test(newPassword);
                                    return (
                                        <div key={idx} className="flex items-center gap-2.5">
                                            {passed
                                                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                                : <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                                            <span className={`text-xs ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{rule.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-300">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your new password"
                                    required
                                    className={`w-full pl-10 pr-10 py-3 bg-slate-800/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all text-sm ${
                                        confirmPassword
                                            ? passwordsMatch ? 'border-emerald-500 focus:ring-emerald-500' : 'border-red-500 focus:ring-red-500'
                                            : 'border-slate-700 focus:ring-amber-500'
                                    }`}
                                />
                                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {confirmPassword && !passwordsMatch && (
                                <p className="text-xs text-red-400">Passwords do not match</p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !allRulesPassed || !passwordsMatch}
                            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Changing Password...</>
                            ) : (
                                <><ShieldCheck className="w-4 h-4" /> Set New Password & Enter Dashboard</>
                            )}
                        </button>

                    </form>

                    <p className="text-center text-xs text-slate-500">
                        For security, your assigned password is one-time use only.
                    </p>
                </div>
            </div>
        </div>
    );
}
