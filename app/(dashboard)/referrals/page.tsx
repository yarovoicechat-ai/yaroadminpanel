'use client';

import React, { useState, useEffect } from 'react';
import {
    Share2, Search, Users, Gift, Calendar, RefreshCw, Trophy,
    Eye, DollarSign, X, CheckCircle, UserCheck, Smartphone, Wrench, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

interface TopReferrer {
    _id?: string;
    userId: number;
    name: string;
    email?: string;
    phoneNumber?: string;
    meethiId?: string;
    role: string;
    image?: string;
    referralCode?: string;
    totalJoinedCount?: number;
    totalEarnings?: number;
    totalReferrals: number;
    diamonds?: number;
}

interface ReferralLog {
    _id: string;
    referrer: {
        userId: number;
        name: string;
        email?: string;
        referralCode?: string;
        meethiId?: string;
    };
    referee: {
        userId: number;
        name: string;
        email?: string;
        phoneNumber?: string;
        meethiId?: string;
        createdAt?: string;
    };
    referralCode: string;
    referrerReward: number;
    refereeReward: number;
    status: string;
    claimedAt: string;
}

export default function ReferralAnalyticsPage() {
    const [loading, setLoading] = useState<boolean>(true);
    const [reconciling, setReconciling] = useState<boolean>(false);
    const [totalReferrals, setTotalReferrals] = useState<number>(0);
    const [totalDiamondsGranted, setTotalDiamondsGranted] = useState<number>(0);
    const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
    const [referralLogs, setReferralLogs] = useState<ReferralLog[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Modal state for viewing who joined under a specific referrer
    const [selectedReferrer, setSelectedReferrer] = useState<TopReferrer | null>(null);
    const [loadingReferees, setLoadingReferees] = useState<boolean>(false);
    const [joinedRefereesList, setJoinedRefereesList] = useState<any[]>([]);

    const fetchReferralData = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get<any>('/api/admin/referrals/admin-stats');
            if (res && res.success && res.data) {
                setTotalReferrals(res.data.totalReferrals || 0);
                setTotalDiamondsGranted(res.data.totalDiamondsGranted || 0);
                setTopReferrers(res.data.topReferrers || []);
                setReferralLogs(res.data.referralLogs || []);
            }
        } catch (error) {
            console.error('Failed to load admin referral analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRunReconciliation = async () => {
        setReconciling(true);
        try {
            const res = await apiClient.post<any>('/api/admin/referrals/reconcile', {});
            if (res && res.success) {
                const { recordsScanned, recordsRecovered, duplicateAttemptsBlocked, financialDriftRepaired } = res.data || {};
                toast.success(`Reconciliation finished! Scanned: ${recordsScanned || 0}, Recovered: ${recordsRecovered || 0}, Repaired Drift: ${financialDriftRepaired || 0}`);
                fetchReferralData();
            } else {
                toast.error(res?.message || 'Reconciliation failed');
            }
        } catch (err: any) {
            toast.error(err.message || 'Error executing reconciliation');
        } finally {
            setReconciling(false);
        }
    };

    useEffect(() => {
        fetchReferralData();
    }, []);

    // Fetch list of all referees who joined under a specific referrer
    const handleOpenRefereesModal = async (referrer: TopReferrer) => {
        setSelectedReferrer(referrer);
        setLoadingReferees(true);
        setJoinedRefereesList([]);

        try {
            const refId = referrer._id || referrer.userId;
            const res = await apiClient.get<any>(`/api/admin/referrals/user/${refId}`);
            if (res && res.success && res.data) {
                setJoinedRefereesList(res.data.referees || []);
            } else {
                toast.error('Failed to load joined users');
            }
        } catch (err: any) {
            console.error('Fetch joined referees error:', err);
            toast.error(err.message || 'Error loading joined users');
        } finally {
            setLoadingReferees(false);
        }
    };

    const filteredReferrers = topReferrers.filter(ref => {
        const term = searchTerm.toLowerCase();
        return (
            (ref.name || '').toLowerCase().includes(term) ||
            (ref.referralCode || '').toLowerCase().includes(term) ||
            (ref.meethiId || '').toLowerCase().includes(term) ||
            String(ref.userId || '').includes(term)
        );
    });

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Share2 className="w-7 h-7 text-amber-500" />
                        User Refer & Earn Performance & Risk Audit
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Track who referred whom, total successful joined users, financial settlement IDs, and risk scores.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRunReconciliation}
                        disabled={reconciling}
                        className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold rounded-lg text-sm flex items-center gap-2 transition disabled:opacity-50"
                    >
                        <Wrench className={`w-4 h-4 ${reconciling ? 'animate-spin' : ''}`} />
                        {reconciling ? 'Reconciling...' : 'Run Crash Recovery'}
                    </button>
                    <button
                        onClick={fetchReferralData}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-2 transition"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-between uppercase font-semibold">
                        Total Successful Referral Joins <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-3xl font-bold text-white mt-2">{totalReferrals} Users Joined</div>
                </div>

                <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-between uppercase font-semibold">
                        Total Coins Rewarded <Gift className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-3xl font-bold text-amber-400 mt-2">{totalDiamondsGranted || (totalReferrals * 25)} Coins</div>
                </div>

                <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-between uppercase font-semibold">
                        Max Reward Per Referral <Trophy className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-bold text-emerald-400 mt-2">50 Coins (2-Step)</div>
                </div>
            </div>

            {/* Main Referrers Performance Table */}
            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        Referrer Performance & 2-Step Coins Breakdown
                    </h3>
                    <div className="relative max-w-sm w-full">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by User ID, Name, Code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                            <tr>
                                <th className="p-3">Referrer User</th>
                                <th className="p-3">Referral Code</th>
                                <th className="p-3 text-center">Joined Users</th>
                                <th className="p-3 text-right">Referral Coins Earned</th>
                                <th className="p-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        Loading referrer performance data...
                                    </td>
                                </tr>
                            ) : filteredReferrers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        No referrer records match your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredReferrers.map((user, idx) => (
                                    <tr key={user._id || user.userId || idx} className="hover:bg-slate-800/40 transition">
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                                                    {user.name?.[0]?.toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white flex items-center gap-2">
                                                        <span>{user.name || 'User'}</span>
                                                        <span className="text-xs text-amber-400 font-mono">#{idx + 1}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-mono">User ID: #{user.userId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-mono font-bold text-cyan-400">{user.referralCode || `MC${user.userId}`}</div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                <UserCheck className="w-3.5 h-3.5 mr-1" />
                                                {user.totalJoinedCount ?? user.totalReferrals} Users Joined
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="font-extrabold text-amber-400 text-base">
                                                +{user.totalEarnings ?? (user.totalReferrals * 25)} Coins
                                            </div>
                                            <div className="text-[11px] text-slate-400">Step 1 (+25) + Step 2 (+25)</div>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button
                                                onClick={() => handleOpenRefereesModal(user)}
                                                className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 font-bold text-xs rounded-lg flex items-center gap-1 ml-auto transition"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> View Joined Users
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Joined Users under Selected Referrer with 2-Step & Audit Details */}
            {selectedReferrer && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-cyan-400" />
                                    Users Joined under {selectedReferrer.name} (User #{selectedReferrer.userId})
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                                    Referral Code: <span className="text-amber-400 font-bold">{selectedReferrer.referralCode}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedReferrer(null)}
                                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 overflow-y-auto flex-1 space-y-4">
                            {loadingReferees ? (
                                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
                                    <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                                    <span>Loading joined user list...</span>
                                </div>
                            ) : joinedRefereesList.length === 0 ? (
                                <div className="py-12 text-center text-slate-500">
                                    No joined referees recorded for this referral code yet.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                                        Total Joined Users ({joinedRefereesList.length})
                                    </div>
                                    <div className="rounded-lg border border-slate-800 overflow-hidden">
                                        <table className="w-full text-left text-sm text-slate-300">
                                            <thead className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                                                <tr>
                                                    <th className="p-2.5">Joined Referee User</th>
                                                    <th className="p-2.5">Risk & Review Status</th>
                                                    <th className="p-2.5">Step 1 (Reg)</th>
                                                    <th className="p-2.5">Call Progress</th>
                                                    <th className="p-2.5">Step 2 Status</th>
                                                    <th className="p-2.5 text-right">Coins Granted</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/60 text-xs">
                                                {joinedRefereesList.map((item: any, i: number) => {
                                                    const callSec = item.totalCallSeconds || 0;
                                                    const callMin = Math.floor(callSec / 60);
                                                    const callSecRem = callSec % 60;
                                                    const formattedTime = `${callMin}:${callSecRem < 10 ? '0' : ''}${callSecRem}`;
                                                    const isStep2Done = Boolean(item.step2Claimed) || item.step2RewardStatus === 'COMPLETED';
                                                    const riskLevel = item.riskLevel || 'LOW';

                                                    return (
                                                        <tr key={item.referralId || i} className="hover:bg-slate-800/40">
                                                            <td className="p-2.5">
                                                                <div className="font-bold text-white text-xs">{item.referee?.name || 'User'}</div>
                                                                <div className="text-[11px] text-slate-400 font-mono">ID: #{item.referee?.userId}</div>
                                                            </td>
                                                            <td className="p-2.5">
                                                                {riskLevel === 'HIGH' ? (
                                                                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[10px] flex items-center gap-1 w-fit">
                                                                        <ShieldAlert className="w-3 h-3 text-rose-400" /> HIGH RISK
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[10px] flex items-center gap-1 w-fit">
                                                                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> PASSED
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-2.5">
                                                                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                                                                    ✅ +25 Coins
                                                                </span>
                                                            </td>
                                                            <td className="p-2.5 font-mono text-slate-200">
                                                                {formattedTime} / 5:00
                                                            </td>
                                                            <td className="p-2.5">
                                                                {isStep2Done ? (
                                                                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                                                                        ✅ COMPLETED (+25)
                                                                    </span>
                                                                ) : item.step2RewardStatus === 'PROCESSING' ? (
                                                                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] animate-pulse">
                                                                        ⏳ PROCESSING
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px]">
                                                                        🔒 PENDING (300s req)
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-2.5 text-right font-extrabold text-amber-400 text-xs">
                                                                +{isStep2Done ? 50 : 25} Coins
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
                            <button
                                onClick={() => setSelectedReferrer(null)}
                                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
