'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldAlert, ArrowLeft, Coins, Award, User, Mail, Phone, MapPin, Lock } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';

export default function AddSellerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [name, setName] = useState('');
    const [agencyName, setAgencyName] = useState('');
    const [email, setEmail] = useState('');
    const [mobile, setMobile] = useState('');
    const [gender, setGender] = useState('Male');
    const [country, setCountry] = useState('India');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [credit, setCredit] = useState('1000000');
    const [invitedBy, setInvitedBy] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const [password, setPassword] = useState('');

    const handleAddSellerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !mobile) {
            toast.error('Please fill required fields: Name, Email, Mobile');
            return;
        }

        setLoading(true);
        try {
            const response = await apiClient.post('/api/ems/requests', {
                requestType: 'Seller Request',
                data: {
                    name,
                    agencyName: agencyName || name,
                    email,
                    phoneNumber: mobile,
                    gender,
                    country,
                    state,
                    city,
                    creditBalance: Number(credit),
                    invitedBy: invitedBy || 'System Admin',
                    referralCode,
                    password: password || undefined,
                }
            });

            if (response.success || response.data) {
                toast.success(`🎉 Seller request for "${name}" saved as PENDING! Redirecting to Request Page...`);
                setName(''); setAgencyName(''); setEmail(''); setMobile('');
                setCredit('1000000'); setState(''); setCity('');
                setInvitedBy(''); setReferralCode(''); setPassword('');
                router.push('/sellers/request');
            } else {
                toast.error(response.message || 'Failed to submit Seller request');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to register seller profile');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 placeholder-slate-400";
    const labelClass = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

    return (
        <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">

            {/* Page Header */}
            <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-amber-500/5">
                <div className="flex items-center gap-3">
                    <Link href="/sellers">
                        <button className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ArrowLeft className="w-5 h-5 text-slate-500" />
                        </button>
                    </Link>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Award className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            Add Coin Seller
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-medium">
                                Pending Request
                            </span>
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Register a wholesale Coin Seller distributor. Will appear in Request page for approval.
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAddSellerSubmit} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-8 shadow-xl space-y-8 max-w-4xl">

                {/* Personal Info */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <User className="w-4 h-4" /> Seller Personal Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Full Name *</label>
                            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ramesh Patel" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Agency / Business Name</label>
                            <input type="text" value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="e.g. Asia Payouts Hub" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Gender</label>
                            <select value={gender} onChange={e => setGender(e.target.value)} className={inputClass}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Invited By</label>
                            <input type="text" value={invitedBy} onChange={e => setInvitedBy(e.target.value)} placeholder="e.g. Admin / Owner Name" className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <Mail className="w-4 h-4" /> Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Email Address *</label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seller@domain.com" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Mobile Number *</label>
                            <input type="tel" required value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Country</label>
                            <input type="text" value={country} onChange={e => setCountry(e.target.value)} placeholder="India" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>State</label>
                            <input type="text" value={state} onChange={e => setState(e.target.value)} placeholder="Maharashtra" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>City</label>
                            <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Mumbai" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Referral Code (if any)</label>
                            <input type="text" value={referralCode} onChange={e => setReferralCode(e.target.value)} placeholder="REF-XXXX" className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Coin Seller Config */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <Coins className="w-4 h-4" /> Coin Seller Configuration
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Credit Coins Balance Allocation</label>
                            <div className="relative">
                                <input type="number" value={credit} onChange={e => setCredit(e.target.value)} required className={inputClass} />
                                <Coins className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Set Initial Password (optional)</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to auto-generate" className={`${inputClass} pl-9`} />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">If blank, a secure password will be auto-generated on approval.</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Link href="/sellers">
                        <button type="button" className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                            Cancel
                        </button>
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
                    >
                        <Award className="w-4 h-4" />
                        {loading ? 'Registering Seller...' : 'Register Coin Seller'}
                    </button>
                </div>
            </form>
        </div>
    );
}
