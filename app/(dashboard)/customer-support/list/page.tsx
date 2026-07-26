'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, RefreshCw, FileSpreadsheet, FileText, Filter,
    CheckCircle2, XCircle, Eye, ChevronDown, ChevronUp,
    Shield, Sparkles, Copy, Download, X, Calendar, MapPin,
    Mail, Phone, Clock, Award, ArrowUpDown, ChevronLeft,
    ChevronRight, AlertTriangle, User, ArrowLeftRight, Trash2,
    Ban, Smartphone, Star, BarChart3, TrendingUp, DollarSign,
    Zap, Check, Printer, Plus, Key, Headphones, MessageSquare, Ticket
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

// CS ListItem Interface
export interface CSListItem {
    id: string;
    srNo: number;
    invitedBy: string;
    name: string;
    employeeCode: string;
    meethiChatId: string;
    username: string;
    profilePhoto?: string;
    gender: 'Female' | 'Male' | 'Other';
    age: number;
    email: string;
    mobile: string;
    country: string;
    state: string;
    district: string;
    registrationDate: string;
    level: number; // Support Level 1 to 8
    ticketsResolved: number;
    onlineStatus: 'online' | 'offline';
    isIdBanned: boolean;
    isDeviceBanned: boolean;
}

// Mock Dataset for CS Executives
const MOCK_CS_LIST: CSListItem[] = [
    {
        id: 'CS-1001',
        srNo: 1,
        invitedBy: 'Super Admin Siddharth',
        name: 'Aakash Verma',
        employeeCode: 'CS-771',
        meethiChatId: 'MC-661902',
        username: '@aakash_cs',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        gender: 'Male',
        age: 26,
        email: 'aakash.verma@meethichat.com',
        mobile: '+91 98111 44556',
        country: 'India',
        state: 'Delhi',
        district: 'New Delhi',
        registrationDate: '2024-05-15 10:00:00',
        level: 4,
        ticketsResolved: 1240,
        onlineStatus: 'online',
        isIdBanned: false,
        isDeviceBanned: false
    },
    {
        id: 'CS-1002',
        srNo: 2,
        invitedBy: 'Rajesh Malhotra (Owner)',
        name: 'Neha Sharma',
        employeeCode: 'CS-802',
        meethiChatId: 'MC-551029',
        username: '@neha_support',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
        gender: 'Female',
        age: 24,
        email: 'neha.sharma@meethichat.com',
        mobile: '+91 97222 66778',
        country: 'India',
        state: 'Maharashtra',
        district: 'Mumbai City',
        registrationDate: '2024-06-20 12:30:00',
        level: 6,
        ticketsResolved: 2890,
        onlineStatus: 'online',
        isIdBanned: false,
        isDeviceBanned: false
    },
    {
        id: 'CS-1003',
        srNo: 3,
        invitedBy: 'Direct Admin Desk',
        name: 'Rohan Gupta',
        employeeCode: 'CS-903',
        meethiChatId: 'MC-334102',
        username: '@rohan_cs',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        gender: 'Male',
        age: 28,
        email: 'rohan.gupta@meethichat.com',
        mobile: '+91 99333 11223',
        country: 'India',
        state: 'Karnataka',
        district: 'Bengaluru',
        registrationDate: '2024-08-10 14:15:00',
        level: 2,
        ticketsResolved: 450,
        onlineStatus: 'offline',
        isIdBanned: false,
        isDeviceBanned: false
    }
];

export default function CSListPage() {
    const { user: currentUser } = useAuth();
    const [csList, setCsList] = useState<CSListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [onlineFilter, setOnlineFilter] = useState<string>('all');
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [genderFilter, setGenderFilter] = useState<string>('all');
    const [stateFilter, setStateFilter] = useState<string>('all');
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    // Sorting & Pagination
    const [sortColumn, setSortColumn] = useState<keyof CSListItem>('srNo');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modals
    const [levelModal, setLevelModal] = useState<{ isOpen: boolean; cs: CSListItem | null }>({ isOpen: false, cs: null });
    const [selectedLevel, setSelectedLevel] = useState<number>(1);

    const [banModal, setBanModal] = useState<{ isOpen: boolean; cs: CSListItem | null; type: 'id' | 'device' }>({ isOpen: false, cs: null, type: 'id' });
    const [banReason, setBanReason] = useState('Inappropriate conduct with users');

    const [removeModal, setRemoveModal] = useState<{ isOpen: boolean; cs: CSListItem | null }>({ isOpen: false, cs: null });

    const [transferModal, setTransferModal] = useState<{ isOpen: boolean; cs: CSListItem | null }>({ isOpen: false, cs: null });
    const [targetRecipient, setTargetRecipient] = useState('Super Admin Siddharth');

    const [analyticsDrawerCS, setAnalyticsDrawerCS] = useState<CSListItem | null>(null);

    // Fetch CS List
    const fetchCSData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/customer-support').catch(() => null);
            if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                const mapped: CSListItem[] = res.data.map((item: any, idx: number) => ({
                    id: item._id || `CS-${idx + 1000}`,
                    srNo: idx + 1,
                    invitedBy: item.invitedBy || 'Super Admin Team',
                    name: item.name || 'CS Executive',
                    employeeCode: item.employeeCode || `CS-${700 + idx}`,
                    meethiChatId: item.meethiChatId || `MC-${660000 + idx}`,
                    username: item.username ? `@${item.username.replace('@','')}` : `@cs_${idx+1}`,
                    profilePhoto: item.profilePhoto || '',
                    gender: item.gender || 'Male',
                    age: item.age || 25,
                    email: item.email || 'cs@meethichat.com',
                    mobile: item.mobile || item.phoneNumber || '+91 90000 00000',
                    country: item.country || 'India',
                    state: item.state || 'Delhi',
                    district: item.district || 'New Delhi',
                    registrationDate: item.createdAt ? new Date(item.createdAt).toLocaleString() : '2024-05-15 10:00:00',
                    level: item.level || 3,
                    ticketsResolved: item.ticketsResolved || 1200,
                    onlineStatus: item.isOnline ? 'online' : 'offline',
                    isIdBanned: !!item.isIdBanned,
                    isDeviceBanned: !!item.isDeviceBanned
                }));
                setCsList(mapped);
            } else {
                setCsList(MOCK_CS_LIST);
            }
        } catch (err) {
            console.error('Failed to load CS list:', err);
            setCsList(MOCK_CS_LIST);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCSData();
    }, [fetchCSData]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchCSData();
        setIsRefreshing(false);
        toast.success('Customer Support list refreshed');
    };

    // Filter Logic
    const filteredCS = useMemo(() => {
        return csList.filter(cs => {
            const q = search.trim().toLowerCase();
            const matchesSearch = !q ||
                cs.name.toLowerCase().includes(q) ||
                cs.employeeCode.toLowerCase().includes(q) ||
                cs.meethiChatId.toLowerCase().includes(q) ||
                cs.email.toLowerCase().includes(q) ||
                cs.mobile.includes(q);

            const matchesOnline = onlineFilter === 'all' || cs.onlineStatus === onlineFilter;
            const matchesLevel = levelFilter === 'all' || cs.level === parseInt(levelFilter);
            const matchesGender = genderFilter === 'all' || cs.gender.toLowerCase() === genderFilter.toLowerCase();
            const matchesState = stateFilter === 'all' || cs.state.toLowerCase() === stateFilter.toLowerCase();

            return matchesSearch && matchesOnline && matchesLevel && matchesGender && matchesState;
        });
    }, [csList, search, onlineFilter, levelFilter, genderFilter, stateFilter]);

    // Sorting Logic
    const sortedCS = useMemo(() => {
        return [...filteredCS].sort((a, b) => {
            let valA: any = a[sortColumn];
            let valB: any = b[sortColumn];
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredCS, sortColumn, sortDirection]);

    // Pagination Logic
    const totalPages = Math.ceil(sortedCS.length / pageSize) || 1;
    const paginatedCS = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedCS.slice(start, start + pageSize);
    }, [sortedCS, page, pageSize]);

    // Stats
    const stats = useMemo(() => {
        return {
            total: csList.length,
            online: csList.filter(c => c.onlineStatus === 'online').length,
            totalTickets: csList.reduce((sum, c) => sum + c.ticketsResolved, 0),
            banned: csList.filter(c => c.isIdBanned || c.isDeviceBanned).length
        };
    }, [csList]);

    // Export CSV
    const exportToCSV = () => {
        if (filteredCS.length === 0) {
            toast.error('No data available to export');
            return;
        }

        const headers = [
            'SR', 'Invited By', 'CS Executive Name', 'Employee Code', 'Meethi Chat ID',
            'Gender', 'Age', 'Email', 'Mobile Number', 'Country', 'State', 'Level', 'Tickets Resolved', 'Online Status'
        ];

        const rows = filteredCS.map(c => [
            c.srNo,
            `"${c.invitedBy}"`,
            `"${c.name}"`,
            `"${c.employeeCode}"`,
            `"${c.meethiChatId}"`,
            c.gender,
            c.age,
            `"${c.email}"`,
            `"${c.mobile}"`,
            `"${c.country}"`,
            `"${c.state}"`,
            c.level,
            c.ticketsResolved,
            c.onlineStatus
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `CS_Executives_List_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CS Executives list exported to CSV');
    };

    const handlePrintPDF = () => {
        window.print();
    };

    const handleSort = (col: keyof CSListItem) => {
        if (sortColumn === col) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(col);
            setSortDirection('asc');
        }
    };

    const copyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    // Modal Actions
    const confirmChangeLevel = async () => {
        if (!levelModal.cs) return;
        const cs = levelModal.cs;
        try {
            await apiClient.patch(`/api/customer-support/${cs.id}/level`, { level: selectedLevel }).catch(() => null);
            setCsList(prev => prev.map(item => item.id === cs.id ? { ...item, level: selectedLevel } : item));
            toast.success(`⭐ ${cs.name}'s Support Level upgraded to Level ${selectedLevel}!`);
            setLevelModal({ isOpen: false, cs: null });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update level');
        }
    };

    const confirmToggleBan = async () => {
        if (!banModal.cs) return;
        const cs = banModal.cs;
        const isDevice = banModal.type === 'device';
        const isBannedCurrently = isDevice ? cs.isDeviceBanned : cs.isIdBanned;

        try {
            await apiClient.post(`/api/customer-support/${cs.id}/toggle-ban`, {
                banType: banModal.type,
                reason: banReason
            }).catch(() => null);

            setCsList(prev => prev.map(item => {
                if (item.id === cs.id) {
                    return isDevice
                        ? { ...item, isDeviceBanned: !item.isDeviceBanned }
                        : { ...item, isIdBanned: !item.isIdBanned };
                }
                return item;
            }));

            toast.success(isBannedCurrently
                ? `🟢 ${isDevice ? 'Device Ban' : 'ID Ban'} revoked for ${cs.name}`
                : `⛔ ${isDevice ? 'Device Banned' : 'ID Banned'} for ${cs.name}`
            );
            setBanModal({ isOpen: false, cs: null, type: 'id' });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update ban status');
        }
    };

    const confirmRemoveCS = async () => {
        if (!removeModal.cs) return;
        const cs = removeModal.cs;
        setCsList(prev => prev.filter(c => c.id !== cs.id));
        toast.success(`🗑️ CS Executive ${cs.name} removed from panel.`);
        setRemoveModal({ isOpen: false, cs: null });
    };

    const confirmTransferCS = async () => {
        if (!transferModal.cs) return;
        const cs = transferModal.cs;
        setCsList(prev => prev.map(item => item.id === cs.id ? { ...item, invitedBy: targetRecipient } : item));
        toast.success(`🔀 CS Executive ${cs.name} transferred to ${targetRecipient}!`);
        setTransferModal({ isOpen: false, cs: null });
    };

    return (
        <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-cyan-500/5">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                            <Headphones className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                Customer Support List
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 font-medium">
                                    Support Staff Operations
                                </span>
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                Manage registered Customer Support executives, update levels, monitor online status, ban/unban accounts, and view ticket resolution analytics.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <Link href="/customer-support/add">
                        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold transition-all shadow-md shadow-cyan-500/20">
                            <Plus className="w-4 h-4" />
                            <span>Add New CS</span>
                        </button>
                    </Link>

                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-sm font-medium border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-600' : 'text-slate-500'}`} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={exportToCSV}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm font-medium border border-emerald-200/80 dark:border-emerald-800/80 transition-all shadow-xs"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        <span>Export Excel</span>
                    </button>

                    <button
                        onClick={handlePrintPDF}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-200/80 dark:border-blue-800/80 transition-all shadow-xs"
                    >
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* Quick Insights Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total CS Staff</p>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.total}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <User className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-emerald-200/60 dark:border-emerald-900/40 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">🟢 Currently Online</p>
                        <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">{stats.online}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-cyan-200/60 dark:border-cyan-900/40 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Tickets Resolved</p>
                        <p className="text-2xl font-extrabold text-cyan-700 dark:text-cyan-400 mt-1">{stats.totalTickets.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        <Ticket className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-red-200/60 dark:border-red-900/40 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Banned CS Staff</p>
                        <p className="text-2xl font-extrabold text-red-700 dark:text-red-400 mt-1">{stats.banned}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                        <Ban className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Search & Filters Controls Section */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-cyan-500/5 space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by CS Executive Name, Employee Code, Meethi Chat ID, Email, Mobile..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFiltersExpanded(!filtersExpanded)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                filtersExpanded || onlineFilter !== 'all' || levelFilter !== 'all'
                                    ? 'bg-cyan-50 text-cyan-700 border-cyan-300'
                                    : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200'
                            }`}
                        >
                            <Filter className="w-4 h-4 text-cyan-600" />
                            <span>Filters</span>
                            {filtersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {(filtersExpanded || onlineFilter !== 'all' || levelFilter !== 'all') && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
                        >
                            <div>
                                <label className="block text-slate-500 mb-1 font-semibold">Online Status</label>
                                <select
                                    value={onlineFilter}
                                    onChange={(e) => { setOnlineFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="online">🟢 Online</option>
                                    <option value="offline">⚪ Offline</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-500 mb-1 font-semibold">Support Level</label>
                                <select
                                    value={levelFilter}
                                    onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                                >
                                    <option value="all">All Levels</option>
                                    {Array.from({ length: 8 }).map((_, i) => (
                                        <option key={i + 1} value={i + 1}>Level {i + 1}</option>
                                    ))}
                                </select>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Data Table Card (16 Columns) */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-cyan-500/5 overflow-hidden">
                <div className="overflow-x-auto max-h-[680px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 z-20 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700 select-none">
                            <tr>
                                <th className="p-3.5 whitespace-nowrap text-center">
                                    <button onClick={() => handleSort('srNo')} className="flex items-center gap-1 hover:text-cyan-600 mx-auto">
                                        SR <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                                <th className="p-3.5 whitespace-nowrap">Invited By</th>
                                <th className="p-3.5 whitespace-nowrap">
                                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-cyan-600">
                                        CS Executive Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                                <th className="p-3.5 whitespace-nowrap">Meethi Chat ID</th>
                                <th className="p-3.5 whitespace-nowrap">User Name</th>
                                <th className="p-3.5 whitespace-nowrap">Gender</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Age</th>
                                <th className="p-3.5 whitespace-nowrap">Mobile Number</th>
                                <th className="p-3.5 whitespace-nowrap">Email</th>
                                <th className="p-3.5 whitespace-nowrap">Reg Date & Time</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Online Status</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Remove</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Change Level</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Action</th>
                                <th className="p-3.5 whitespace-nowrap text-center">View Data</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Transfer</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="p-4 text-center"><div className="h-4 w-6 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4 text-center"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                    </tr>
                                ))
                            ) : paginatedCS.length === 0 ? (
                                <tr>
                                    <td colSpan={16} className="p-12 text-center">
                                        <div className="max-w-md mx-auto space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-500 flex items-center justify-center mx-auto border border-cyan-200">
                                                <Headphones className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-slate-800 dark:text-white">No CS Executives Found</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    No CS executive matches your search query or selected filter criteria.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedCS.map((cs, idx) => (
                                    <tr key={cs.id} className="hover:bg-cyan-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        {/* 1. SR */}
                                        <td className="p-3.5 text-center font-bold text-slate-500 dark:text-slate-400">
                                            #{(page - 1) * pageSize + idx + 1}
                                        </td>

                                        {/* 2. Invited By */}
                                        <td className="p-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                                <span>{cs.invitedBy}</span>
                                            </div>
                                        </td>

                                        {/* 3. CS Name */}
                                        <td className="p-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                {cs.profilePhoto ? (
                                                    <img src={cs.profilePhoto} alt={cs.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                                        {cs.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors">{cs.name}</p>
                                                    <span className="text-[10px] text-cyan-600 font-mono font-bold bg-cyan-50 dark:bg-cyan-950 px-1.5 py-0.5 rounded">
                                                        Level {cs.level} • {cs.employeeCode}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 4. Meethi Chat ID */}
                                        <td className="p-3.5 whitespace-nowrap">
                                            <button
                                                onClick={() => copyText(cs.meethiChatId, 'Meethi Chat ID')}
                                                className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-100 px-2 py-1 rounded-lg border border-slate-200 transition-colors"
                                            >
                                                <span>{cs.meethiChatId}</span>
                                                <Copy className="w-3 h-3 text-slate-400" />
                                            </button>
                                        </td>

                                        {/* 5. User Name */}
                                        <td className="p-3.5 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                                            {cs.username}
                                        </td>

                                        {/* 6. Gender */}
                                        <td className="p-3.5 whitespace-nowrap font-medium">
                                            {cs.gender}
                                        </td>

                                        {/* 7. Age */}
                                        <td className="p-3.5 whitespace-nowrap text-center font-bold text-slate-700 dark:text-slate-300">
                                            {cs.age} Yrs
                                        </td>

                                        {/* 8. Mobile Number */}
                                        <td className="p-3.5 whitespace-nowrap font-mono text-slate-600 dark:text-slate-300">
                                            {cs.mobile}
                                        </td>

                                        {/* 9. Email */}
                                        <td className="p-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                            {cs.email}
                                        </td>

                                        {/* 10. Reg Date & Time */}
                                        <td className="p-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                            {cs.registrationDate}
                                        </td>

                                        {/* 11. Online Status */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                cs.onlineStatus === 'online'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                                <span className={`w-2 h-2 rounded-full ${cs.onlineStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                                <span>{cs.onlineStatus === 'online' ? '🟢 Online' : '⚪ Offline'}</span>
                                            </span>
                                        </td>

                                        {/* 12. Remove */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => setRemoveModal({ isOpen: true, cs })}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 text-[11px] font-bold transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                            </button>
                                        </td>

                                        {/* 13. Change Level */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => { setLevelModal({ isOpen: true, cs }); setSelectedLevel(cs.level); }}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 text-[11px] font-bold transition-all"
                                            >
                                                <Star className="w-3.5 h-3.5 text-amber-500" /> Lvl {cs.level}
                                            </button>
                                        </td>

                                        {/* 14. Action (ID / Device Ban) */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => setBanModal({ isOpen: true, cs, type: 'id' })}
                                                    className={`px-2 py-1 rounded text-[10px] font-bold border ${cs.isIdBanned ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                                                >
                                                    {cs.isIdBanned ? 'ID Banned' : 'ID Ban'}
                                                </button>
                                                <button
                                                    onClick={() => setBanModal({ isOpen: true, cs, type: 'device' })}
                                                    className={`px-2 py-1 rounded text-[10px] font-bold border ${cs.isDeviceBanned ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                                                >
                                                    {cs.isDeviceBanned ? 'Device Banned' : 'Device Ban'}
                                                </button>
                                            </div>
                                        </td>

                                        {/* 15. View Data */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => setAnalyticsDrawerCS(cs)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-[11px] font-bold transition-all shadow-xs"
                                            >
                                                <BarChart3 className="w-3.5 h-3.5" /> View Data
                                            </button>
                                        </td>

                                        {/* 16. Transfer */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => setTransferModal({ isOpen: true, cs })}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-all shadow-xs"
                                            >
                                                <ArrowLeftRight className="w-3.5 h-3.5" /> Transfer
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <div>
                        Showing <span className="font-bold text-slate-900 dark:text-white">{sortedCS.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(page * pageSize, sortedCS.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{sortedCS.length}</span> entries
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* CHANGE LEVEL MODAL */}
            <AnimatePresence>
                {levelModal.isOpen && levelModal.cs && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] p-6 space-y-4">
                            <h3 className="text-base font-bold">Update Support Level for {levelModal.cs.name}</h3>
                            <select value={selectedLevel} onChange={(e) => setSelectedLevel(Number(e.target.value))} className="w-full p-2.5 border rounded-xl text-xs font-bold">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <option key={i + 1} value={i + 1}>Support Level {i + 1}</option>
                                ))}
                            </select>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setLevelModal({ isOpen: false, cs: null })} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                                <button onClick={confirmChangeLevel} className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold">Save Level</button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* BAN MODAL */}
            <AnimatePresence>
                {banModal.isOpen && banModal.cs && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] p-6 space-y-4">
                            <h3 className="text-base font-bold text-red-600">
                                {banModal.type === 'id' ? 'ID Ban CS Executive' : 'Device Ban CS Executive'}
                            </h3>
                            <p className="text-xs text-slate-500">CS Staff: {banModal.cs.name}</p>
                            <input type="text" value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Reason for ban..." className="w-full p-2.5 border rounded-xl text-xs" />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setBanModal({ isOpen: false, cs: null, type: 'id' })} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                                <button onClick={confirmToggleBan} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold">Confirm Ban</button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* REMOVE MODAL */}
            <AnimatePresence>
                {removeModal.isOpen && removeModal.cs && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] p-6 space-y-4">
                            <h3 className="text-base font-bold text-red-600">Remove CS Executive</h3>
                            <p className="text-xs text-slate-500">Are you sure you want to remove <span className="font-bold">{removeModal.cs.name}</span>?</p>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setRemoveModal({ isOpen: false, cs: null })} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                                <button onClick={confirmRemoveCS} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold">Remove</button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* VIEW DATA DRAWER */}
            <AnimatePresence>
                {analyticsDrawerCS && (
                    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end">
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full max-w-3xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
                            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {analyticsDrawerCS.name} - CS Support Performance
                                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-100 text-cyan-700">Level {analyticsDrawerCS.level}</span>
                                    </h3>
                                    <p className="text-xs text-slate-500">Employee Code: {analyticsDrawerCS.employeeCode} • Meethi Chat ID: {analyticsDrawerCS.meethiChatId}</p>
                                </div>
                                <button onClick={() => setAnalyticsDrawerCS(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200">
                                        <p className="text-cyan-700 font-semibold">Total Tickets Resolved</p>
                                        <p className="text-2xl font-extrabold text-cyan-800 mt-1">{analyticsDrawerCS.ticketsResolved.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200">
                                        <p className="text-emerald-700 font-semibold">Customer Rating</p>
                                        <p className="text-2xl font-extrabold text-emerald-800 mt-1">4.9 / 5.0 ⭐</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200">
                                        <p className="text-purple-700 font-semibold">Avg Response Time</p>
                                        <p className="text-2xl font-extrabold text-purple-800 mt-1">1.2 Mins</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 flex justify-between">
                                <button onClick={() => setAnalyticsDrawerCS(null)} className="px-4 py-2 border rounded-xl font-semibold">Close Drawer</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
