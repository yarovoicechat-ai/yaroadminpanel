'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Award, User, Mail, Phone, Lock, MapPin,
    ArrowLeft, CheckCircle2, ShieldCheck, Copy, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function CreateBdPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [name, setName] = useState('');
    const [meethiChatId, setMeethiChatId] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [gender, setGender] = useState('Female');
    const [age, setAge] = useState('24');
    const [password, setPassword] = useState('BDUser@123');
    const [invitedBy, setInvitedBy] = useState('BD Leader');
    const [state, setState] = useState('Delhi');
    const [country, setCountry] = useState('India');

    const handleCopyPassword = () => {
        navigator.clipboard.writeText(password);
        toast.success('Password copied to clipboard!');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !mobile || !meethiChatId.trim()) {
            toast.error('Please fill all required fields: Name, Email, Mobile, and Yaro User ID');
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post('/api/ems/requests', {
                requestType: 'BD Request',
                data: {
                    name,
                    email,
                    phoneNumber: mobile,
                    gender,
                    age: Number(age),
                    yaroId: meethiChatId.trim(),
                    userId: meethiChatId.trim(),
                    meethiChatId: meethiChatId.trim(),
                    username: username || name.toLowerCase().replace(/\s+/g, '_'),
                    invitedBy,
                    state,
                    country,
                }
            });

            if (response.success || response.data) {
                toast.success(`🎉 BD request for ${name} saved as PENDING! Redirecting to Request Page...`);
                router.push('/bds/request');
            } else {
                toast.error(response.message || 'Failed to submit BD request');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to submit BD request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Page Header */}
            <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-blue-500/5">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        <Award className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            Create New BD (Business Development)
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                                RBAC BD Level
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Register a certified Business Development staff member to recruit agencies, onboard talent, and monitor growth.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-xl space-y-8 max-w-4xl">
                
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <User className="w-4 h-4" /> BD Personal Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Priya Singh"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Yaro User ID (Mandatory) *
                            </label>
                            <input
                                type="text"
                                required
                                value={meethiChatId}
                                onChange={(e) => setMeethiChatId(e.target.value)}
                                placeholder="e.g. 100021"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Username (Optional)
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="e.g. priya_bd"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Gender
                            </label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Age
                            </label>
                            <input
                                type="number"
                                min="18"
                                max="70"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Supervising BD Leader / Admin
                            </label>
                            <input
                                type="text"
                                value={invitedBy}
                                onChange={(e) => setInvitedBy(e.target.value)}
                                placeholder="BD Leader / Admin"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <Mail className="w-4 h-4" /> Contact & Location
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Official Email *
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. priya.bd@yaroapp.in"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Mobile Number *
                            </label>
                            <input
                                type="tel"
                                required
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="+91 9876543210"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                State
                            </label>
                            <input
                                type="text"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                placeholder="e.g. Uttar Pradesh / Maharashtra"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Country
                            </label>
                            <input
                                type="text"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                placeholder="India"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Password Setting */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <Lock className="w-4 h-4" /> Account Credentials
                    </h3>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Initial Portal Password
                        </label>
                        <div className="relative max-w-md">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2.5 pr-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCopyPassword}
                                    className="p-1.5 text-slate-400 hover:text-blue-600"
                                    title="Copy Password"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        {loading ? 'Submitting...' : 'Create BD'}
                    </button>
                </div>
            </form>
        </div>
    );
}
