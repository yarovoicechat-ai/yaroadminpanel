'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import {
    Coins, Calendar, Gem, RefreshCw, Search, ArrowUpRight,
    Globe, UserCheck, ShieldCheck, CheckCircle2, XCircle, Clock,
    Filter, CreditCard, Sparkles, User, AlertCircle
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export interface RechargeItem {
    _id: string;
    userId: number;
    sellerId?: number;
    type: 'offline' | 'online';
    coins?: number;
    diamonds: number;
    amount: number;
    date: string;
    createdAt?: string;
    transactionId?: string;
    orderId?: string;
    productId?: string;
    status?: string;
    user: {
        userId?: number;
        name?: string;
        email?: string;
        phoneNumber?: string;
        meethiId?: string;
        image?: string;
    };
    rechargedBy: {
        name?: string;
        role?: string;
        specialCode?: string;
        email?: string;
    };
}

export default function RechargeHistoryPage() {
    const [activeTab, setActiveTab] = useState<'all' | 'offline' | 'online'>('offline');
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<RechargeItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const [stats, setStats] = useState({
        offline: { totalAmount: 0, totalDiamonds: 0, count: 0 },
        online: { totalAmount: 0, totalDiamonds: 0, count: 0 }
    });

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams: Record<string, any> = {
                page,
                limit: 20,
                type: activeTab === 'all' ? undefined : activeTab,
            };
            if (searchTerm.trim()) queryParams.search = searchTerm.trim();
            if (statusFilter !== 'all') queryParams.status = statusFilter;

            const res = await apiClient.get('/api/admin/recharges/history', queryParams);

            if (res && res.success !== false) {
                const data = res.data || res;
                setHistory(data.history || []);
                setTotalPages(data.totalPages || 1);
                setTotalRecords(data.totalRecords || 0);

                if (data.stats) {
                    setStats(data.stats);
                }
            } else {
                toast.error(res?.message || 'Failed to fetch recharge history.');
            }
        } catch (err: any) {
            console.error('Error fetching recharge history:', err);
            toast.error(err.message || 'Error loading recharge history');
        } finally {
            setLoading(false);
        }
    }, [activeTab, page, searchTerm, statusFilter]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Handle tab change
    const handleTabChange = (tab: 'all' | 'offline' | 'online') => {
        setActiveTab(tab);
        setPage(1);
    };

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen text-slate-100">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-5">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-purple-400 to-cyan-400">
                        <Coins className="w-8 h-8 text-amber-400 animate-pulse" />
                        Recharge Records & History
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Comprehensive log of Offline (Staff/Admin/Seller) & Online (Automated Gateway) Diamond Recharges
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => fetchHistory()}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        className="border-slate-700 bg-slate-800/50 hover:bg-slate-700 text-slate-200 gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </Button>
                </div>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Offline Recharges Card */}
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UserCheck className="w-24 h-24 text-amber-400" />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                            Offline Recharges (ऑफलाइन)
                        </span>
                        <UserCheck className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="mt-2 space-y-1">
                        <div className="text-3xl font-extrabold text-white">
                            ₹{stats.offline.totalAmount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
                            <span className="text-amber-300 font-bold flex items-center gap-1">
                                <Gem className="w-3.5 h-3.5" />
                                {stats.offline.totalDiamonds.toLocaleString('en-IN')} 💎
                            </span>
                            <span>•</span>
                            <span>{stats.offline.count} Total Transactions</span>
                        </div>
                    </div>
                </div>

                {/* Online Recharges Card */}
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Globe className="w-24 h-24 text-cyan-400" />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-md border border-cyan-400/20">
                            Online Recharges (ऑनलाइन)
                        </span>
                        <Globe className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="mt-2 space-y-1">
                        <div className="text-3xl font-extrabold text-white">
                            ₹{stats.online.totalAmount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
                            <span className="text-cyan-300 font-bold flex items-center gap-1">
                                <Gem className="w-3.5 h-3.5" />
                                {stats.online.totalDiamonds.toLocaleString('en-IN')} 💎
                            </span>
                            <span>•</span>
                            <span>{stats.online.count} Total Gateway Orders</span>
                        </div>
                    </div>
                </div>

                {/* Combined Total Platform Revenue */}
                <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-24 h-24 text-purple-400" />
                    </div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-400/10 px-2.5 py-1 rounded-md border border-purple-400/20">
                            Total Platform Volume
                        </span>
                        <CreditCard className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="mt-2 space-y-1">
                        <div className="text-3xl font-extrabold text-white">
                            ₹{(stats.offline.totalAmount + stats.online.totalAmount).toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
                            <span className="text-purple-300 font-bold flex items-center gap-1">
                                <Gem className="w-3.5 h-3.5" />
                                {(stats.offline.totalDiamonds + stats.online.totalDiamonds).toLocaleString('en-IN')} Total 💎
                            </span>
                            <span>•</span>
                            <span>{stats.offline.count + stats.online.count} Transactions</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter & Controls Bar */}
            <Card className="bg-slate-900/80 border-slate-800/80">
                <CardContent className="p-4 space-y-4">
                    {/* Navigation Tabs */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                            <button
                                onClick={() => handleTabChange('offline')}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${
                                    activeTab === 'offline'
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-md'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <UserCheck className="w-4 h-4" />
                                Offline Recharges (ऑफलाइन)
                                <Badge className="ml-1.5 bg-amber-500/20 text-amber-300 border-amber-500/30">
                                    {stats.offline.count}
                                </Badge>
                            </button>

                            <button
                                onClick={() => handleTabChange('online')}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${
                                    activeTab === 'online'
                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-md'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Globe className="w-4 h-4" />
                                Online Recharges (ऑनलाइन)
                                <Badge className="ml-1.5 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                                    {stats.online.count}
                                </Badge>
                            </button>

                            <button
                                onClick={() => handleTabChange('all')}
                                className={`px-4 py-2 text-sm font-semibold rounded-md transition-all flex items-center gap-2 ${
                                    activeTab === 'all'
                                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-md'
                                        : 'text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Filter className="w-4 h-4" />
                                All Transactions
                            </button>
                        </div>

                        {/* Total Matching Badge */}
                        <div className="text-xs text-slate-400 font-medium">
                            Showing <span className="text-white font-bold">{history.length}</span> of <span className="text-white font-bold">{totalRecords}</span> entries
                        </div>
                    </div>

                    {/* Search & Status Filters */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                            <Input
                                placeholder="Search by User ID, Name, Staff/Seller ID, Email or Order ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-slate-950/80 border-slate-800 text-slate-200 placeholder:text-slate-500 h-10"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-950/80 border border-slate-800 text-slate-300 rounded-md h-10 px-3 text-sm focus:outline-none focus:border-purple-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                            <option value="REFUNDED">Refunded</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Main Transactions Table */}
            <Card className="bg-slate-900/90 border-slate-800/90 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-950/80 border-b border-slate-800">
                            <TableRow className="border-slate-800 hover:bg-transparent">
                                <TableHead className="text-slate-400 font-semibold py-4">Date & Time</TableHead>
                                <TableHead className="text-slate-400 font-semibold">Type</TableHead>
                                {activeTab !== 'online' && (
                                    <TableHead className="text-slate-400 font-semibold">Recharged By (किसने किया)</TableHead>
                                )}
                                <TableHead className="text-slate-400 font-semibold">Target User (किसको दिया)</TableHead>
                                <TableHead className="text-slate-400 font-semibold text-right">Amount (₹)</TableHead>
                                <TableHead className="text-slate-400 font-semibold text-right">Diamonds Credited</TableHead>
                                <TableHead className="text-slate-400 font-semibold">Ref / Order ID</TableHead>
                                <TableHead className="text-slate-400 font-semibold text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
                                            <span>Loading recharge records...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <AlertCircle className="w-8 h-8 text-slate-600" />
                                            <span className="font-semibold text-slate-400">No recharge history records found.</span>
                                            <span className="text-xs">Try adjusting your filters or search terms.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((item) => {
                                    const isOffline = item.type === 'offline';
                                    const formattedDate = new Date(item.date || item.createdAt || Date.now()).toLocaleString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                    });

                                    return (
                                        <TableRow key={item._id} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                                            {/* Date & Time */}
                                            <TableCell className="font-medium text-slate-300 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                    {formattedDate}
                                                </div>
                                            </TableCell>

                                            {/* Type Badge */}
                                            <TableCell>
                                                {isOffline ? (
                                                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1 font-semibold text-xs">
                                                        <UserCheck className="w-3 h-3" />
                                                        Offline
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 gap-1 font-semibold text-xs">
                                                        <Globe className="w-3 h-3" />
                                                        Online
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Recharged By (Offline) */}
                                            {activeTab !== 'online' && (
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400">
                                                            {item.rechargedBy?.name?.charAt(0).toUpperCase() || 'A'}
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-semibold text-slate-200">
                                                                {item.rechargedBy?.name || 'Staff Admin'}
                                                            </div>
                                                            <div className="text-[10px] text-slate-500 capitalize">
                                                                {item.rechargedBy?.role || 'Staff'} {item.sellerId ? `(#${item.sellerId})` : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            )}

                                            {/* Target User */}
                                            <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                    {item.user?.image ? (
                                                        <img
                                                            src={item.user.image}
                                                            alt={item.user.name}
                                                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                                            {item.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-xs font-semibold text-slate-200">
                                                            {item.user?.name || `User #${item.userId}`}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                                                            <span>ID: <strong className="text-purple-300">{item.user?.userId || item.userId}</strong></span>
                                                            {item.user?.meethiId && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span className="text-cyan-300">@{item.user.meethiId}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Amount ₹ */}
                                            <TableCell className="text-right">
                                                <span className="font-extrabold text-emerald-400 text-sm">
                                                    ₹{(item.amount || 0).toLocaleString('en-IN')}
                                                </span>
                                            </TableCell>

                                            {/* Diamonds Credited */}
                                            <TableCell className="text-right">
                                                <div className="inline-flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20 text-amber-300 font-extrabold text-sm">
                                                    <Gem className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                                    {(item.diamonds || item.coins || 0).toLocaleString('en-IN')}
                                                </div>
                                            </TableCell>

                                            {/* Ref / Order ID */}
                                            <TableCell>
                                                <div className="font-mono text-[11px] text-slate-400 max-w-[180px] truncate" title={item.transactionId || item.orderId || item.productId || 'N/A'}>
                                                    {item.orderId || item.transactionId || item.productId || 'REG-MANUAL'}
                                                </div>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="text-center">
                                                {item.status === 'COMPLETED' || item.status === 'active' || !item.status ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1 text-[11px]">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Success
                                                    </Badge>
                                                ) : item.status === 'REFUNDED' ? (
                                                    <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 gap-1 text-[11px]">
                                                        <XCircle className="w-3 h-3" />
                                                        Refunded
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1 text-[11px]">
                                                        <Clock className="w-3 h-3" />
                                                        {item.status}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-400">
                    <div>
                        Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page <= 1}
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages}
                            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                            className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
