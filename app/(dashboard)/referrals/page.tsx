'use client';

import React, { useState, useEffect } from 'react';
import {
    Share2, Copy, Check, QrCode, Download, Printer, Search, Filter,
    Users, UserCheck, Clock, XCircle, AlertTriangle, TrendingUp,
    Calendar, CheckCircle, RefreshCw, ChevronRight, ChevronDown, Layers
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

interface ReferralStats {
    totalReferrals: number;
    pendingReferrals: number;
    approvedReferrals: number;
    rejectedReferrals: number;
    expiredReferrals: number;
    todayReferrals: number;
    weeklyReferrals: number;
    monthlyReferrals: number;
    activeUsers: number;
    approvalRate: string;
    rejectionRate: string;
}

interface ReferralItem {
    sr: number;
    id: string;
    name: string;
    email: string;
    role: string;
    referralCode: string;
    status: string;
    appliedDate: string;
    approvedDate: string;
    currentReviewer: string;
    finalApprover: string;
}

interface TreeNode {
    id: string;
    name: string;
    role: string;
    referralCode: string;
    status: string;
    children: TreeNode[];
}

export default function ReferralCenterPage() {
    const [stats, setStats] = useState<ReferralStats>({
        totalReferrals: 0,
        pendingReferrals: 0,
        approvedReferrals: 0,
        rejectedReferrals: 0,
        expiredReferrals: 0,
        todayReferrals: 0,
        weeklyReferrals: 0,
        monthlyReferrals: 0,
        activeUsers: 0,
        approvalRate: '100%',
        rejectionRate: '0%',
    });

    const [referralCode, setReferralCode] = useState<string>('OPR-8XQ4D7');
    const [referralLink, setReferralLink] = useState<string>('https://apply.mithichat.live/operator?ref=OPR-8XQ4D7');
    const [history, setHistory] = useState<ReferralItem[]>([]);
    const [tree, setTree] = useState<TreeNode | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [copiedCode, setCopiedCode] = useState<boolean>(false);
    const [copiedLink, setCopiedLink] = useState<boolean>(false);
    const [showQRModal, setShowQRModal] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'history' | 'tree' | 'analytics'>('history');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    const fetchReferralData = async () => {
        setLoading(true);
        try {
            const dashRes = await apiClient.get<any>('/referrals/dashboard');
            if (dashRes && dashRes.data) {
                setReferralCode(dashRes.data.myReferralCode || 'OPR-8XQ4D7');
                setReferralLink(dashRes.data.myReferralLink || 'https://apply.mithichat.live/operator?ref=OPR-8XQ4D7');
                if (dashRes.data.stats) {
                    setStats(dashRes.data.stats);
                }
            }

            const historyRes = await apiClient.get<any>(`/referrals/history?search=${searchTerm}&status=${statusFilter}&role=${roleFilter}`);
            if (historyRes && historyRes.data && historyRes.data.referrals) {
                setHistory(historyRes.data.referrals);
            }

            const treeRes = await apiClient.get<any>('/referrals/tree');
            if (treeRes && treeRes.data && treeRes.data.tree) {
                setTree(treeRes.data.tree);
            }
        } catch (error) {
            console.error('Failed to load referral data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferralData();
    }, [searchTerm, statusFilter, roleFilter]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(referralCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const handleExportCSV = () => {
        const headers = ['SR', 'Referral Code', 'Invited User', 'Role', 'Status', 'Applied Date'];
        const rows = history.map(h => [h.sr, h.referralCode, h.name, h.role, h.status, new Date(h.appliedDate).toLocaleDateString()]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `referral_report_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderTreeNodes = (node: TreeNode) => {
        return (
            <div key={node.id} className="ml-4 pl-4 border-l border-slate-800 my-2">
                <div className="flex items-center gap-3 p-2 bg-slate-900/60 rounded-lg border border-slate-800/60 w-fit min-w-[280px]">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        {node.role.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-white">{node.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{node.referralCode} | <span className="capitalize text-amber-400">{node.role}</span></div>
                    </div>
                </div>
                {node.children && node.children.length > 0 && (
                    <div className="ml-4">
                        {node.children.map(child => renderTreeNodes(child))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Share2 className="w-7 h-7 text-amber-500" />
                        Enterprise Referral Center V2.1
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Track invitations, monitor referral network hierarchy, and export analytics
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchReferralData}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-2 transition"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-lg text-sm flex items-center gap-2 transition"
                    >
                        <Printer className="w-4 h-4 text-amber-400" />
                        Print Page
                    </button>
                </div>
            </div>

            {/* Top Action Bar: Referral Code & Link Box */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-5 bg-slate-900/80 rounded-xl border border-amber-500/20 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">My Referral Code</span>
                    <div className="flex items-center justify-between gap-3 mt-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="font-mono text-xl font-bold text-white tracking-widest">{referralCode}</span>
                        <button
                            onClick={handleCopyCode}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-md text-xs flex items-center gap-1.5 transition"
                        >
                            {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedCode ? 'Copied!' : 'Copy Code'}
                        </button>
                    </div>
                </div>

                <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 shadow-lg relative overflow-hidden">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">My Permanent Referral Link</span>
                    <div className="flex items-center justify-between gap-3 mt-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                        <span className="font-mono text-xs text-slate-300 truncate max-w-[280px] md:max-w-md">{referralLink}</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopyLink}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-md text-xs flex items-center gap-1.5 transition"
                            >
                                {copiedLink ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                {copiedLink ? 'Copied' : 'Copy'}
                            </button>
                            <button
                                onClick={() => setShowQRModal(true)}
                                className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-300 font-medium rounded-md text-xs flex items-center gap-1.5 transition"
                            >
                                <QrCode className="w-3.5 h-3.5" />
                                QR Code
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                        Total Referrals <Users className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-white mt-2">{stats.totalReferrals}</div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                        Pending <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-2xl font-bold text-amber-400 mt-2">{stats.pendingReferrals}</div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                        Approved <UserCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-400 mt-2">{stats.approvedReferrals}</div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                        Rejected <XCircle className="w-4 h-4 text-rose-400" />
                    </div>
                    <div className="text-2xl font-bold text-rose-400 mt-2">{stats.rejectedReferrals}</div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                        Today's <Calendar className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-bold text-indigo-400 mt-2">{stats.todayReferrals}</div>
                </div>

                <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="text-xs text-slate-400 flex items-center justify-between">
                        Approval Rate <TrendingUp className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="text-2xl font-bold text-teal-400 mt-2">{stats.approvalRate}</div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'history' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                >
                    Referral History
                </button>
                <button
                    onClick={() => setActiveTab('tree')}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${activeTab === 'tree' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                >
                    Network Tree View
                </button>
            </div>

            {/* Tab 1: Referral History Table */}
            {activeTab === 'history' && (
                <div className="space-y-4">
                    {/* Filters & Export */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search Code, Special Code, Name, Email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-3 py-2 focus:outline-none"
                            >
                                <option value="all">All Statuses</option>
                                <option value="Active">Active / Approved</option>
                                <option value="Pending">Pending</option>
                                <option value="Blocked">Blocked</option>
                            </select>

                            <button
                                onClick={handleExportCSV}
                                className="px-3 py-2 bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                                <Download className="w-3.5 h-3.5" /> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-slate-950 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                                <tr>
                                    <th className="p-4">SR</th>
                                    <th className="p-4">Referral Code</th>
                                    <th className="p-4">Invited User</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Applied Date</th>
                                    <th className="p-4 text-right">Approver</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-500">
                                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                                            Loading referral records...
                                        </td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-500">
                                            No referral applications found.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-800/40 transition">
                                            <td className="p-4 font-mono text-xs text-slate-500">{item.sr}</td>
                                            <td className="p-4 font-mono font-bold text-amber-400">{item.referralCode}</td>
                                            <td className="p-4">
                                                <div className="font-semibold text-white">{item.name}</div>
                                                <div className="text-xs text-slate-500">{item.email}</div>
                                            </td>
                                            <td className="p-4 font-medium text-slate-300 capitalize">{item.role}</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.status === 'Active' || item.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : item.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-slate-400">{new Date(item.appliedDate).toLocaleDateString()}</td>
                                            <td className="p-4 text-right text-xs text-slate-400">{item.finalApprover}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Network Tree View */}
            {activeTab === 'tree' && (
                <div className="p-6 bg-slate-900/80 rounded-xl border border-slate-800">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-amber-500" />
                        Referral Network Tree Hierarchy
                    </h3>
                    {tree ? (
                        <div className="overflow-x-auto pb-4">
                            {renderTreeNodes(tree)}
                        </div>
                    ) : (
                        <div className="text-slate-500 text-sm">No referral tree data available.</div>
                    )}
                </div>
            )}

            {/* QR Code Modal Generator */}
            {showQRModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
                        <button
                            onClick={() => setShowQRModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
                        >
                            ✕
                        </button>
                        <h3 className="text-lg font-bold text-white text-center mb-1">Referral QR Code</h3>
                        <p className="text-xs text-slate-400 text-center mb-4">Scan to apply via your referral link</p>

                        <div className="p-4 bg-white rounded-xl flex items-center justify-center shadow-inner mx-auto w-48 h-48">
                            <QrCode className="w-36 h-36 text-slate-950" />
                        </div>

                        <div className="text-center mt-3 font-mono text-xs text-amber-400 font-bold tracking-widest">{referralCode}</div>

                        <div className="grid grid-cols-2 gap-2 mt-6">
                            <button
                                onClick={() => alert('Downloading PNG QR Code...')}
                                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1 transition"
                            >
                                <Download className="w-3.5 h-3.5" /> PNG
                            </button>
                            <button
                                onClick={() => alert('Downloading SVG QR Code...')}
                                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs flex items-center justify-center gap-1 transition"
                            >
                                <Download className="w-3.5 h-3.5" /> SVG
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
