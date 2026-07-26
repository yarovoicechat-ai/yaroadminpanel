'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Headphones, Plus, User, Mail, Phone, Lock, MapPin,
    ShieldCheck, ArrowLeft, Upload, Clock, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function AddCustomerSupportPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState('');
    const [meethiChatId, setMeethiChatId] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [gender, setGender] = useState('Female');
    const [age, setAge] = useState('24');
    const [password, setPassword] = useState('');
    const [shiftTiming, setShiftTiming] = useState('Day Shift (09:00 AM - 06:00 PM)');
    const [supportLevel, setSupportLevel] = useState('1');
    const [state, setState] = useState('Delhi');
    const [country, setCountry] = useState('India');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !mobile) {
            toast.error('Please fill all required fields: Name, Email, Mobile');
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post('/api/ems/requests', {
                requestType: 'Support Request',
                data: {
                    name,
                    email,
                    phoneNumber: mobile,
                    gender,
                    age: Number(age),
                    meethiChatId: meethiChatId || `MC_CS_${Math.floor(10000 + Math.random() * 90000)}`,
                    username: username || name.toLowerCase().replace(/\s+/g, '_'),
                    shiftTiming,
                    supportLevel: Number(supportLevel),
                    state,
                    country,
                    password,
                }
            });

            if (response.success || response.data) {
                toast.success(`🎉 Customer Support request for ${name} saved as PENDING! Redirecting to Request Page...`);
                router.push('/customer-support/request');
            } else {
                toast.error(response.message || 'Failed to submit Customer Support request');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to submit Customer Support request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Page Header */}
            <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-cyan-500/5">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        <Headphones className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            Add New Customer Support Executive
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 font-medium">
                                Direct CS Registration
                            </span>
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Register a new Customer Support team member directly with access credentials and support level allocation.
                        </p>
                    </div>
                </div>
            </div>

            {/* Registration Form Card */}
            <div className="max-w-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 p-8 shadow-xl shadow-cyan-500/5">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Aakash Verma" className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">Meethi Chat ID</label>
                            <input type="text" value={meethiChatId} onChange={(e) => setMeethiChatId(e.target.value)} placeholder="MC-661902" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none font-mono" />
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="cs@meethichat.com" className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 98111 44556" className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30 font-mono" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">Gender</label>
                            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none">
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">Password *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500/30" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">Shift Timing</label>
                            <select value={shiftTiming} onChange={(e) => setShiftTiming(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none">
                                <option value="Day Shift (09:00 AM - 06:00 PM)">Day Shift (09:00 AM - 06:00 PM)</option>
                                <option value="Evening Shift (02:00 PM - 11:00 PM)">Evening Shift (02:00 PM - 11:00 PM)</option>
                                <option value="Night Shift (06:00 PM - 03:00 AM)">Night Shift (06:00 PM - 03:00 AM)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 mb-1">Initial Support Level</label>
                            <select value={supportLevel} onChange={(e) => setSupportLevel(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <option key={i + 1} value={i + 1}>Level {i + 1}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-xl border text-xs font-bold">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20 disabled:opacity-50">
                            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                            <span>Register CS Executive</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
