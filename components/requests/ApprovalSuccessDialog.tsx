'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Copy, Eye, EyeOff, X, Key, Mail, Shield } from 'lucide-react';
import { toast } from 'sonner';

export interface ApprovalCredentials {
    email: string;
    password: string;
    specialCode?: string;
}

interface ApprovalSuccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    credentials: ApprovalCredentials | null;
    roleName: string;
    applicantName: string;
}

export function ApprovalSuccessDialog({
    isOpen,
    onClose,
    credentials,
    roleName,
    applicantName,
}: ApprovalSuccessDialogProps) {
    const [showPassword, setShowPassword] = useState(false);

    const copyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const copyAll = () => {
        if (!credentials) return;
        const text = `${roleName} Account Credentials\nName: ${applicantName}\nEmail: ${credentials.email}\nPassword: ${credentials.password}${credentials.specialCode ? `\nEmployee Code: ${credentials.specialCode}` : ''}`;
        navigator.clipboard.writeText(text);
        toast.success('All credentials copied!');
    };

    if (!isOpen || !credentials) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-emerald-200/60 dark:border-emerald-800/60 p-8 max-w-md w-full"
                >
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 ring-4 ring-emerald-200 dark:ring-emerald-500/20">
                            <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            ✅ {roleName} Approved!
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Account created for <span className="font-semibold text-slate-700 dark:text-slate-200">{applicantName}</span>
                        </p>
                    </div>

                    {/* Credentials */}
                    <div className="space-y-3 mb-6">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <Key className="w-3.5 h-3.5" />
                            Generated Login Credentials
                        </p>

                        {/* Email */}
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-200 dark:border-slate-700">
                            <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                                <p className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-100 truncate">{credentials.email}</p>
                            </div>
                            <button
                                onClick={() => copyText(credentials.email, 'Email')}
                                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                                title="Copy Email"
                            >
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                        </div>

                        {/* Password */}
                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl px-4 py-3 border border-emerald-200 dark:border-emerald-700/40">
                            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">Password (One-Time Display)</p>
                                <p className="text-sm font-mono font-bold text-emerald-800 dark:text-emerald-200 truncate">
                                    {showPassword ? credentials.password : '•'.repeat(Math.min(credentials.password.length, 16))}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800/30 transition-colors"
                                    title={showPassword ? 'Hide' : 'Show'}
                                >
                                    {showPassword ? <EyeOff className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                                </button>
                                <button
                                    onClick={() => copyText(credentials.password, 'Password')}
                                    className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800/30 transition-colors"
                                    title="Copy Password"
                                >
                                    <Copy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                </button>
                            </div>
                        </div>

                        {/* Special Code */}
                        {credentials.specialCode && (
                            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl px-4 py-3 border border-blue-200 dark:border-blue-700/40">
                                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-blue-600 dark:text-blue-400">Employee Code</p>
                                    <p className="text-sm font-mono font-bold text-blue-800 dark:text-blue-200 truncate">{credentials.specialCode}</p>
                                </div>
                                <button
                                    onClick={() => copyText(credentials.specialCode!, 'Employee Code')}
                                    className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors shrink-0"
                                    title="Copy Code"
                                >
                                    <Copy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                </button>
                            </div>
                        )}

                        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-700/40">
                            ⚠️ Save this password now. It will not be shown again after closing this dialog.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={copyAll}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
                        >
                            <Copy className="w-4 h-4" />
                            Copy All
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-bold text-white transition-colors shadow-md shadow-emerald-500/20"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Done
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
