'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Briefcase, User, Mail, Phone, Lock, MapPin,
    ArrowLeft, CheckCircle2, Building2, ShieldCheck, Image, Calendar, X
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function CreateAgencyPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [agencyName, setAgencyName] = useState('');
    const [agencyLogo, setAgencyLogo] = useState('');
    const [uploadingLogo, setUploadingLogo] = useState(false);

    const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file (PNG, JPG, WEBP)');
            return;
        }

        setUploadingLogo(true);
        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64Url = event.target?.result as string;
                setAgencyLogo(base64Url);

                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('folder', 'Agencies/Logos');
                    const res = await apiClient.uploadFile('/api/upload', formData);
                    if (res.success && res.data?.url) {
                        setAgencyLogo(res.data.url);
                    }
                } catch {
                    // Keep base64 if server upload endpoint fails
                }
            };
            reader.readAsDataURL(file);
            toast.success('Agency logo image selected!');
        } catch (err: any) {
            toast.error('Failed to process image file');
        } finally {
            setUploadingLogo(false);
        }
    };
    const [ownerName, setOwnerName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('female');
    const [agencyCode, setAgencyCode] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [invitedBy, setInvitedBy] = useState('System Admin');
    const [commissionRate, setCommissionRate] = useState('15%');
    const [state, setState] = useState('Maharashtra');
    const [country, setCountry] = useState('India');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!agencyName || !ownerName || !email || !mobile) {
            toast.error('Please fill all required fields: Agency Name, Owner Name, Email, Mobile');
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post('/api/ems/requests', {
                requestType: 'Agency Request',
                data: {
                    name: ownerName,
                    agencyName,
                    agencyLogo,
                    age: age ? Number(age) : undefined,
                    gender,
                    email,
                    phoneNumber: mobile,
                    agencyCode: agencyCode || `AGY_${Math.floor(1000 + Math.random() * 9000)}`,
                    invitedBy,
                    commissionRate,
                    state,
                    country,
                    password,
                }
            });

            if (response.success || response.data) {
                toast.success(`🎉 Agency request for "${agencyName}" saved as PENDING! Redirecting to Request Page...`);
                router.push('/agencies/request');
            } else {
                toast.error(response.message || 'Failed to submit Agency request');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Failed to submit Agency request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Page Header */}
            <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-amber-500/5">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Briefcase className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            Create New Host Agency
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-medium">
                                Direct Agency Registration
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Register a certified Host Management Agency to recruit & manage Hosts.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-xl space-y-8 max-w-4xl">
                
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-amber-600 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <Building2 className="w-4 h-4" /> Agency & Owner Information
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Agency Name *
                            </label>
                            <div className="relative">
                                <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={agencyName}
                                    onChange={(e) => setAgencyName(e.target.value)}
                                    placeholder="e.g. Royal Talent Management Agency"
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Agency Logo (Upload Image)
                            </label>
                            <div className="flex items-center gap-3">
                                {agencyLogo ? (
                                    <div className="relative w-12 h-12 rounded-xl border border-amber-500/40 overflow-hidden shrink-0 bg-slate-800 shadow-md">
                                        <img src={agencyLogo} alt="Logo" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setAgencyLogo('')}
                                            className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                            title="Remove image"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 shrink-0">
                                        <Image className="w-5 h-5" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-all">
                                        <Image className="w-4 h-4 text-amber-500" />
                                        <span>{uploadingLogo ? 'Processing...' : agencyLogo ? 'Change Image' : 'Select Logo Image'}</span>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf,.pdf,.doc,.docx"
                                            className="hidden"
                                            onChange={handleLogoFileChange}
                                        />
                                    </label>
                                    <p className="text-[11px] text-slate-400 mt-1">Select PNG, JPG, WEBP image file</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Agency Owner Name *
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={ownerName}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    placeholder="e.g. Rajesh Kumar"
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Owner Age
                            </label>
                            <div className="relative">
                                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="number"
                                    min="18"
                                    max="100"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    placeholder="e.g. 28"
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Owner Gender
                            </label>
                            <select
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Agency Code (Optional)
                            </label>
                            <input
                                type="text"
                                value={agencyCode}
                                onChange={(e) => setAgencyCode(e.target.value)}
                                placeholder="Auto-generated if left empty e.g. AGY_9901"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Default Commission Rate
                            </label>
                            <select
                                value={commissionRate}
                                onChange={(e) => setCommissionRate(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="10%">10% Standard Commission</option>
                                <option value="15%">15% Prime Commission</option>
                                <option value="20%">20% VIP Partner Commission</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-amber-600 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <Lock className="w-4 h-4" /> Contact & Login Credentials
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Official Email Address *
                            </label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="agency@meethichat.com"
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Mobile Number *
                            </label>
                            <div className="relative">
                                <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="tel"
                                    required
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="+91 98765 43210"
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Portal Password *
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Set secure password"
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Invited / Assigned By
                            </label>
                            <input
                                type="text"
                                value={invitedBy}
                                onChange={(e) => setInvitedBy(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{loading ? 'Creating Agency...' : 'Create Agency Account'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
