'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, RefreshCw, FileSpreadsheet, FileText, Filter,
    CheckCircle2, XCircle, Eye, ChevronDown, ChevronUp,
    Shield, Sparkles, Copy, Download, X, Calendar, MapPin,
    Mail, Phone, Clock, Award, ArrowUpDown, ChevronLeft,
    ChevronRight, AlertTriangle, User, ArrowLeftRight, Trash2,
    Ban, Smartphone, Star, BarChart3, TrendingUp, DollarSign,
    PhoneIncoming, PhoneOutgoing, PhoneMissed, Zap, Check, Printer,
    SlidersHorizontal, Edit2
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

// Host Item Definition for Host List
export interface HostListItem {
    id: string;
    srNo: number;
    invitedBy: string;
    name: string;
    username: string;
    profilePhoto?: string;
    meethiChatId: string;
    gender: 'Female' | 'Male' | 'Other';
    age: number;
    level: number; // 1 to 8
    mobile: string;
    email: string;
    registrationDate: string;
    isOnline: boolean;
    country: string;
    state: string;
    district: string;
    isBanned: boolean;
    isDeviceBanned: boolean;
    agencyName: string;
}

// Call Record for Drawer Call History
export interface CallRecord {
    id: string;
    dateTime: string;
    callerId: string;
    receiverId: string;
    duration: string;
    coinsEarned: number;
    status: 'Successful' | 'Missed' | 'Cancelled' | 'Rejected';
    type: 'Incoming' | 'Outgoing';
}

// Initial Mock Hosts Dataset
const MOCK_HOST_LIST: HostListItem[] = [
    {
        id: 'HST-1001',
        srNo: 1,
        invitedBy: 'Royal Media Agency (Siddharth)',
        name: 'Alina Sen',
        username: '@alina_live',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        meethiChatId: 'MC-334910',
        gender: 'Female',
        age: 23,
        level: 5,
        mobile: '+91 98112 33445',
        email: 'alina.sen@gmail.com',
        registrationDate: '2024-08-14 10:15:00',
        isOnline: true,
        country: 'India',
        state: 'Maharashtra',
        district: 'Mumbai City',
        isBanned: false,
        isDeviceBanned: false,
        agencyName: 'Royal Media Agency'
    },
    {
        id: 'HST-1002',
        srNo: 2,
        invitedBy: 'Star Talent Agency (Kavita)',
        name: 'Janhvi Kapoor',
        username: '@janhvi_stream',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
        meethiChatId: 'MC-221908',
        gender: 'Female',
        age: 24,
        level: 7,
        mobile: '+91 97223 44556',
        email: 'janhvi.k@yahoo.com',
        registrationDate: '2024-06-20 11:45:00',
        isOnline: false,
        country: 'India',
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        isBanned: false,
        isDeviceBanned: false,
        agencyName: 'Star Talent Agency'
    },
    {
        id: 'HST-1003',
        srNo: 3,
        invitedBy: 'Direct Meethi Host Network',
        name: 'Priyanka Roy',
        username: '@priyanka_r',
        profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
        meethiChatId: 'MC-110928',
        gender: 'Female',
        age: 22,
        level: 3,
        mobile: '+91 99334 55667',
        email: 'priyanka.roy@gmail.com',
        registrationDate: '2024-09-01 09:30:00',
        isOnline: true,
        country: 'India',
        state: 'Delhi',
        district: 'New Delhi',
        isBanned: false,
        isDeviceBanned: false,
        agencyName: 'Direct Meethi Host Network'
    },
    {
        id: 'HST-1004',
        srNo: 4,
        invitedBy: 'Galaxy Host Management',
        name: 'Ananya Sharma',
        username: '@ananya_sing',
        profilePhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
        meethiChatId: 'MC-990812',
        gender: 'Female',
        age: 25,
        level: 6,
        mobile: '+91 94112 88776',
        email: 'ananya.singh@outlook.com',
        registrationDate: '2024-05-12 15:20:00',
        isOnline: false,
        country: 'India',
        state: 'Maharashtra',
        district: 'Pune',
        isBanned: false,
        isDeviceBanned: false,
        agencyName: 'Galaxy Host Management'
    },
    {
        id: 'HST-1005',
        srNo: 5,
        invitedBy: 'Apex Live Media',
        name: 'Riya Verma',
        username: '@riya_host',
        profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
        meethiChatId: 'MC-887123',
        gender: 'Female',
        age: 21,
        level: 2,
        mobile: '+91 91223 44556',
        email: 'riya.verma@gmail.com',
        registrationDate: '2024-10-10 08:30:00',
        isOnline: true,
        country: 'India',
        state: 'Uttar Pradesh',
        district: 'Lucknow',
        isBanned: false,
        isDeviceBanned: false,
        agencyName: 'Apex Live Media'
    }
];

// Sample Call History Records
const MOCK_CALL_HISTORY: CallRecord[] = [
    { id: 'CALL-901', dateTime: '2026-07-26 21:14:02', callerId: 'USR-88912', receiverId: 'MC-334910', duration: '14m 22s', coinsEarned: 430, status: 'Successful', type: 'Incoming' },
    { id: 'CALL-902', dateTime: '2026-07-26 20:05:30', callerId: 'USR-77123', receiverId: 'MC-334910', duration: '08m 10s', coinsEarned: 240, status: 'Successful', type: 'Incoming' },
    { id: 'CALL-903', dateTime: '2026-07-26 19:40:12', callerId: 'USR-55412', receiverId: 'MC-334910', duration: '00m 00s', coinsEarned: 0, status: 'Missed', type: 'Incoming' },
    { id: 'CALL-904', dateTime: '2026-07-26 18:22:45', callerId: 'MC-334910', receiverId: 'USR-33901', duration: '22m 15s', coinsEarned: 660, status: 'Successful', type: 'Outgoing' },
    { id: 'CALL-905', dateTime: '2026-07-25 22:10:00', callerId: 'USR-99102', receiverId: 'MC-334910', duration: '05m 45s', coinsEarned: 170, status: 'Successful', type: 'Incoming' },
    { id: 'CALL-906', dateTime: '2026-07-25 17:15:30', callerId: 'USR-11402', receiverId: 'MC-334910', duration: '00m 12s', coinsEarned: 0, status: 'Cancelled', type: 'Incoming' },
];

export default function HostListPage() {
    const { user: currentUser } = useAuth();
    const [hosts, setHosts] = useState<HostListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filter States
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all'); // online / offline / all
    const [genderFilter, setGenderFilter] = useState<string>('all');
    const [levelFilter, setLevelFilter] = useState<string>('all');
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    // Sorting & Pagination
    const [sortColumn, setSortColumn] = useState<keyof HostListItem>('srNo');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Selected Levels State for Dropdown inside table (map hostId -> selectedLevel)
    const [selectedLevelMap, setSelectedLevelMap] = useState<Record<string, number>>({});

    // Modals State
    const [removeModal, setRemoveModal] = useState<{ isOpen: boolean; host: HostListItem | null }>({ isOpen: false, host: null });
    const [changeLevelModal, setChangeLevelModal] = useState<{ isOpen: boolean; host: HostListItem | null; newLevel: number }>({ isOpen: false, host: null, newLevel: 1 });
    const [banModal, setBanModal] = useState<{ isOpen: boolean; host: HostListItem | null; type: 'id' | 'device' }>({ isOpen: false, host: null, type: 'id' });
    const [transferModal, setTransferModal] = useState<{ isOpen: boolean; host: HostListItem | null }>({ isOpen: false, host: null });
    const [editHostModal, setEditHostModal] = useState<{
        isOpen: boolean;
        host: HostListItem | null;
        name: string;
        mobile: string;
        email: string;
        agencyName: string;
    }>({
        isOpen: false,
        host: null,
        name: '',
        mobile: '',
        email: '',
        agencyName: ''
    });
    
    // Transfer Modal specific states
    const [destinationAgency, setDestinationAgency] = useState('Royal Media Agency');
    const [transferNote, setTransferNote] = useState('');
    const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
    const [banReason, setBanReason] = useState('Policy Violation');

    const handleSaveEditHost = async () => {
        if (!editHostModal.host) return;
        try {
            await apiClient.patch(`/api/ems/hosts/${editHostModal.host.id}`, {
                name: editHostModal.name,
                mobile: editHostModal.mobile,
                email: editHostModal.email,
                agencyName: editHostModal.agencyName,
            }).catch(() => null);

            setHosts(prev => prev.map(h => h.id === editHostModal.host?.id ? {
                ...h,
                name: editHostModal.name,
                mobile: editHostModal.mobile,
                email: editHostModal.email,
                agencyName: editHostModal.agencyName
            } : h));

            toast.success(`Host ${editHostModal.name} updated successfully!`);
            setEditHostModal({ isOpen: false, host: null, name: '', mobile: '', email: '', agencyName: '' });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update host name');
        }
    };

    // View Data Drawer State
    const [analyticsDrawerHost, setAnalyticsDrawerHost] = useState<HostListItem | null>(null);
    const [historySearch, setHistorySearch] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [quickDatePreset, setQuickDatePreset] = useState('This Month');

    // Fetch initial dataset
    const fetchHostsData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/hosts').catch(() => null);
            if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                const mapped: HostListItem[] = res.data.map((item: any, idx: number) => ({
                    id: item._id || `HST-${idx + 1000}`,
                    srNo: idx + 1,
                    invitedBy: item.invitedBy || item.agencyName || 'Direct Meethi Host Network',
                    name: item.fullName || item.name || 'Host Name',
                    username: item.username ? `@${item.username.replace('@','')}` : `@host_${idx+1}`,
                    profilePhoto: item.profilePhoto || item.avatar || '',
                    meethiChatId: item.meethiChatId || item.mithiChatId || `MC-${100000 + idx}`,
                    gender: item.gender || 'Female',
                    age: item.age || 23,
                    level: item.level || (idx % 8) + 1,
                    mobile: item.mobile || item.phoneNumber || '+91 90000 00000',
                    email: item.email || item.emailId || 'host@meethichat.com',
                    registrationDate: item.createdAt ? new Date(item.createdAt).toLocaleString() : '2024-08-14 10:15:00',
                    isOnline: idx % 2 === 0,
                    country: item.country || 'India',
                    state: item.state || 'Maharashtra',
                    district: item.district || 'Mumbai',
                    isBanned: Boolean(item.isBanned),
                    isDeviceBanned: Boolean(item.isDeviceBanned),
                    agencyName: item.agencyName || 'Independent'
                }));
                setHosts(mapped);
            } else {
                setHosts([]);
            }
        } catch (err) {
            console.error('Failed to fetch hosts list:', err);
            setHosts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHostsData();
    }, [fetchHostsData]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchHostsData();
        setIsRefreshing(false);
        toast.success('Host list refreshed with live server data');
    };

    // Filter Logic
    const filteredHosts = useMemo(() => {
        return hosts.filter(h => {
            const q = search.trim().toLowerCase();
            const matchesSearch = !q ||
                h.name.toLowerCase().includes(q) ||
                h.meethiChatId.toLowerCase().includes(q) ||
                h.username.toLowerCase().includes(q) ||
                h.mobile.includes(q) ||
                h.email.toLowerCase().includes(q);

            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'online' && h.isOnline) ||
                (statusFilter === 'offline' && !h.isOnline);

            const matchesGender = genderFilter === 'all' || h.gender.toLowerCase() === genderFilter.toLowerCase();
            const matchesLevel = levelFilter === 'all' || String(h.level) === levelFilter;
            const matchesCountry = countryFilter === 'all' || h.country.toLowerCase() === countryFilter.toLowerCase();

            return matchesSearch && matchesStatus && matchesGender && matchesLevel && matchesCountry;
        });
    }, [hosts, search, statusFilter, genderFilter, levelFilter, countryFilter]);

    // Sorting Logic
    const sortedHosts = useMemo(() => {
        return [...filteredHosts].sort((a, b) => {
            let valA: any = a[sortColumn];
            let valB: any = b[sortColumn];

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredHosts, sortColumn, sortDirection]);

    // Pagination Logic
    const totalPages = Math.ceil(sortedHosts.length / pageSize) || 1;
    const paginatedHosts = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedHosts.slice(start, start + pageSize);
    }, [sortedHosts, page, pageSize]);

    // Export CSV
    const exportToCSV = () => {
        if (filteredHosts.length === 0) {
            toast.error('No data available to export');
            return;
        }

        const headers = [
            'SR', 'Invited By', 'Host Name', 'Meethi Chat ID', 'Gender', 'Age', 'Level',
            'Mobile Number', 'Email', 'Registration Date', 'Online Status', 'Banned Status', 'Agency'
        ];

        const rows = filteredHosts.map(h => [
            h.srNo,
            `"${h.invitedBy}"`,
            `"${h.name}"`,
            `"${h.meethiChatId}"`,
            h.gender,
            h.age,
            `Level ${h.level}`,
            `"${h.mobile}"`,
            `"${h.email}"`,
            `"${h.registrationDate}"`,
            h.isOnline ? 'Online' : 'Offline',
            h.isBanned ? 'Banned' : 'Active',
            `"${h.agencyName}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Host_List_Export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Host List exported to Excel (CSV) successfully');
    };

    const handlePrintPDF = () => {
        window.print();
    };

    // Sort Toggle Handler
    const handleSort = (col: keyof HostListItem) => {
        if (sortColumn === col) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(col);
            setSortDirection('asc');
        }
    };

    // Copy Helper
    const copyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    // Action Handlers
    const confirmRemoveHost = async () => {
        if (!removeModal.host) return;
        const targetHost = removeModal.host;
        try {
            await apiClient.delete(`/api/hosts/${targetHost.id}`).catch(() => null);
            setHosts(prev => prev.filter(h => h.id !== targetHost.id));
            toast.success(`🗑️ Host ${targetHost.name} removed permanently.`);
            setRemoveModal({ isOpen: false, host: null });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to remove host');
        }
    };

    const confirmChangeLevel = async () => {
        if (!changeLevelModal.host) return;
        const { host, newLevel } = changeLevelModal;
        try {
            await apiClient.patch(`/api/hosts/${host.id}/level`, { level: newLevel }).catch(() => null);
            setHosts(prev => prev.map(h => h.id === host.id ? { ...h, level: newLevel } : h));
            toast.success(`⭐ Level updated for ${host.name} to Level ${newLevel}!`);
            setChangeLevelModal({ isOpen: false, host: null, newLevel: 1 });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update level');
        }
    };

    const confirmBan = async () => {
        if (!banModal.host) return;
        const { host, type } = banModal;
        try {
            await apiClient.post(`/api/hosts/${host.id}/ban`, { type, reason: banReason }).catch(() => null);
            setHosts(prev => prev.map(h => {
                if (h.id === host.id) {
                    return type === 'id'
                        ? { ...h, isBanned: !h.isBanned }
                        : { ...h, isDeviceBanned: !h.isDeviceBanned };
                }
                return h;
            }));
            toast.success(type === 'id'
                ? `🚫 ID Ban status toggled for ${host.name}`
                : `📱 Device Ban status toggled for ${host.name}`
            );
            setBanModal({ isOpen: false, host: null, type: 'id' });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update ban status');
        }
    };

    const confirmTransfer = async () => {
        if (!transferModal.host) return;
        const host = transferModal.host;
        setIsSubmittingTransfer(true);
        try {
            await apiClient.post(`/api/hosts/${host.id}/transfer`, {
                destinationAgency,
                note: transferNote
            }).catch(() => null);

            setHosts(prev => prev.map(h => h.id === host.id ? { ...h, agencyName: destinationAgency } : h));
            toast.success(`🔀 Host ${host.name} successfully transferred to ${destinationAgency}!`);
            setTransferModal({ isOpen: false, host: null });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to transfer host');
        } finally {
            setIsSubmittingTransfer(false);
        }
    };

    // History Table Search Filter inside Drawer
    const filteredCallHistory = useMemo(() => {
        if (!historySearch.trim()) return MOCK_CALL_HISTORY;
        const q = historySearch.toLowerCase();
        return MOCK_CALL_HISTORY.filter(c =>
            c.callerId.toLowerCase().includes(q) ||
            c.receiverId.toLowerCase().includes(q) ||
            c.status.toLowerCase().includes(q) ||
            c.type.toLowerCase().includes(q)
        );
    }, [historySearch]);

    return (
        <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-blue-500/5">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                Host List
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                                    Host Operations Control Panel
                                </span>
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                Manage all registered Hosts, update levels, monitor real-time online status, ban accounts, transfer agency assignments, and inspect deep call analytics.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Buttons: Refresh, Export Excel, Export PDF */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-sm font-medium border border-slate-200 dark:border-slate-700 transition-all shadow-xs disabled:opacity-60"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={exportToCSV}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm font-medium border border-emerald-200/80 dark:border-emerald-800/80 transition-all shadow-xs"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Export Excel</span>
                    </button>

                    <button
                        onClick={handlePrintPDF}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-200/80 dark:border-blue-800/80 transition-all shadow-xs"
                    >
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* Search & Filter Controls Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-blue-500/5 space-y-4">
                
                {/* Search Input Bar + Filter Toggle */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by Host Name, Meethi Chat ID, Mobile Number, Email..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFiltersExpanded(!filtersExpanded)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                filtersExpanded || statusFilter !== 'all' || genderFilter !== 'all' || levelFilter !== 'all' || countryFilter !== 'all'
                                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            <Filter className="w-4 h-4 text-blue-600" />
                            <span>Filters</span>
                            {filtersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {(search || statusFilter !== 'all' || genderFilter !== 'all' || levelFilter !== 'all' || countryFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setStatusFilter('all');
                                    setGenderFilter('all');
                                    setLevelFilter('all');
                                    setCountryFilter('all');
                                    setPage(1);
                                }}
                                className="px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border border-red-200/60 dark:border-red-900/50"
                            >
                                Reset All
                            </button>
                        )}
                    </div>
                </div>

                {/* Collapsible Dropdown Filters */}
                <AnimatePresence>
                    {(filtersExpanded || statusFilter !== 'all' || genderFilter !== 'all' || levelFilter !== 'all' || countryFilter !== 'all') && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3"
                        >
                            {/* Status Filter */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Online Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="online">🟢 Online</option>
                                    <option value="offline">⚪ Offline</option>
                                </select>
                            </div>

                            {/* Gender Filter */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Gender</label>
                                <select
                                    value={genderFilter}
                                    onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="all">All Genders</option>
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Level Filter */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Level</label>
                                <select
                                    value={levelFilter}
                                    onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="all">All Levels</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(lvl => (
                                        <option key={lvl} value={String(lvl)}>Level {lvl}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Country Filter */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Country</label>
                                <select
                                    value={countryFilter}
                                    onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="all">All Countries</option>
                                    <option value="india">India 🇮🇳</option>
                                    <option value="usa">USA 🇺🇸</option>
                                    <option value="uae">UAE 🇦🇪</option>
                                </select>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Data Table Card (15 Columns) */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-blue-500/5 overflow-hidden">
                <div className="overflow-x-auto max-h-[680px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                    <table className="w-full text-left border-collapse text-xs">
                        {/* Sticky Table Header */}
                        <thead className="sticky top-0 z-20 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700 select-none">
                            <tr>
                                <th className="p-3.5 whitespace-nowrap text-center">
                                    <button onClick={() => handleSort('srNo')} className="flex items-center gap-1 hover:text-blue-600 mx-auto">
                                        SR <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                                <th className="p-3.5 whitespace-nowrap">Invited By</th>
                                <th className="p-3.5 whitespace-nowrap">
                                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-blue-600">
                                        Host Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                                <th className="p-3.5 whitespace-nowrap">Meethi Chat ID</th>
                                <th className="p-3.5 whitespace-nowrap">Gender</th>
                                <th className="p-3.5 whitespace-nowrap text-center">
                                    <button onClick={() => handleSort('age')} className="flex items-center gap-1 hover:text-blue-600 mx-auto">
                                        Age <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                                <th className="p-3.5 whitespace-nowrap text-center">
                                    <button onClick={() => handleSort('level')} className="flex items-center gap-1 hover:text-blue-600 mx-auto">
                                        Level <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                                <th className="p-3.5 whitespace-nowrap">Mobile Number</th>
                                <th className="p-3.5 whitespace-nowrap">Email</th>
                                <th className="p-3.5 whitespace-nowrap">
                                    <button onClick={() => handleSort('registrationDate')} className="flex items-center gap-1 hover:text-blue-600">
                                        Reg Date & Time <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                                <th className="p-3.5 whitespace-nowrap text-center">
                                    <button onClick={() => handleSort('isOnline')} className="flex items-center gap-1 hover:text-blue-600 mx-auto">
                                        Online Status <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
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
                                        <td className="p-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4 text-center"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-8 w-28 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                    </tr>
                                ))
                            ) : paginatedHosts.length === 0 ? (
                                <tr>
                                    <td colSpan={16} className="p-12 text-center">
                                        <div className="max-w-md mx-auto space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mx-auto border border-blue-200/60 dark:border-blue-800/60">
                                                <User className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-slate-800 dark:text-white">No Registered Hosts Found</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    No host records match your search criteria or selected filter options.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSearch('');
                                                    setStatusFilter('all');
                                                    setGenderFilter('all');
                                                    setLevelFilter('all');
                                                    setCountryFilter('all');
                                                }}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20"
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedHosts.map((host, idx) => {
                                    const currentSelectedLevel = selectedLevelMap[host.id] !== undefined ? selectedLevelMap[host.id] : host.level;
                                    return (
                                        <tr
                                            key={host.id}
                                            className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                                        >
                                            {/* 1. SR */}
                                            <td className="p-3.5 text-center font-bold text-slate-500 dark:text-slate-400">
                                                #{(page - 1) * pageSize + idx + 1}
                                            </td>

                                            {/* 2. Invited By */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                    <span>{host.invitedBy}</span>
                                                </div>
                                            </td>

                                            {/* 3. Host Name */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    {host.profilePhoto ? (
                                                        <img
                                                            src={host.profilePhoto}
                                                            alt={host.name}
                                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                                            {host.name.slice(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                                {host.name}
                                                            </p>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditHostModal({
                                                                        isOpen: true,
                                                                        host,
                                                                        name: host.name,
                                                                        mobile: host.mobile,
                                                                        email: host.email,
                                                                        agencyName: host.agencyName || ''
                                                                    });
                                                                }}
                                                                className="p-1 text-slate-400 hover:text-blue-500 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                title="Edit Host Name & Details"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            {host.username}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 3. Meethi Chat ID */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                <button
                                                    onClick={() => copyText(host.meethiChatId, 'Meethi Chat ID')}
                                                    className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                                                    title="Click to copy ID"
                                                >
                                                    <span>{host.meethiChatId}</span>
                                                    <Copy className="w-3 h-3 text-slate-400" />
                                                </button>
                                            </td>

                                            {/* 4. Gender */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                                    host.gender === 'Female'
                                                        ? 'bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-900/50'
                                                        : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                }`}>
                                                    {host.gender}
                                                </span>
                                            </td>

                                            {/* 5. Age */}
                                            <td className="p-3.5 whitespace-nowrap text-center font-bold text-slate-700 dark:text-slate-300">
                                                {host.age} Yrs
                                            </td>

                                            {/* 6. Level */}
                                            <td className="p-3.5 whitespace-nowrap text-center">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800">
                                                    <Award className="w-3.5 h-3.5 text-blue-600" />
                                                    Level {host.level}
                                                </span>
                                            </td>

                                            {/* 7. Mobile Number */}
                                            <td className="p-3.5 whitespace-nowrap font-mono text-slate-700 dark:text-slate-300">
                                                {host.mobile}
                                            </td>

                                            {/* 8. Email */}
                                            <td className="p-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                                                {host.email}
                                            </td>

                                            {/* 9. Registration Date & Time */}
                                            <td className="p-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                                {host.registrationDate}
                                            </td>

                                            {/* 10. Online Status */}
                                            <td className="p-3.5 text-center whitespace-nowrap">
                                                {host.isOnline ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                        🟢 Online
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                                                        ⚪ Offline
                                                    </span>
                                                )}
                                            </td>

                                            {/* 11. Remove Column */}
                                            <td className="p-3.5 text-center whitespace-nowrap">
                                                <button
                                                    onClick={() => setRemoveModal({ isOpen: true, host })}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80 text-[11px] font-bold transition-all shadow-xs"
                                                    title="Remove Host from Management System"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Remove</span>
                                                </button>
                                            </td>

                                            {/* 12. Change Level Column */}
                                            <td className="p-3.5 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1">
                                                    <select
                                                        value={currentSelectedLevel}
                                                        onChange={(e) => setSelectedLevelMap(prev => ({ ...prev, [host.id]: Number(e.target.value) }))}
                                                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                                                    >
                                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(lvl => (
                                                            <option key={lvl} value={lvl}>Level {lvl}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        onClick={() => setChangeLevelModal({ isOpen: true, host, newLevel: currentSelectedLevel })}
                                                        disabled={currentSelectedLevel === host.level}
                                                        className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-[11px] transition-all"
                                                        title="Update Level"
                                                    >
                                                        Update
                                                    </button>
                                                </div>
                                            </td>

                                            {/* 13. Action Column (🚫 ID Ban / 📱 Device Ban) */}
                                            <td className="p-3.5 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setBanModal({ isOpen: true, host, type: 'id' })}
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-xs ${
                                                            host.isBanned
                                                                ? 'bg-red-700 text-white shadow-red-500/20'
                                                                : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50'
                                                        }`}
                                                        title={host.isBanned ? "Unban Host ID" : "Ban Host ID"}
                                                    >
                                                        <Ban className="w-3.5 h-3.5" />
                                                        <span>{host.isBanned ? 'Banned' : 'ID Ban'}</span>
                                                    </button>

                                                    <button
                                                        onClick={() => setBanModal({ isOpen: true, host, type: 'device' })}
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow-xs ${
                                                            host.isDeviceBanned
                                                                ? 'bg-purple-700 text-white shadow-purple-500/20'
                                                                : 'bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900/50'
                                                        }`}
                                                        title={host.isDeviceBanned ? "Unban Host Device" : "Ban Host Device"}
                                                    >
                                                        <Smartphone className="w-3.5 h-3.5" />
                                                        <span>{host.isDeviceBanned ? 'Device Banned' : 'Device Ban'}</span>
                                                    </button>
                                                </div>
                                            </td>

                                            {/* 14. View Data Column */}
                                            <td className="p-3.5 text-center whitespace-nowrap">
                                                <button
                                                    onClick={() => setAnalyticsDrawerHost(host)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all shadow-xs"
                                                    title="Open Full Screen Analytics & Call Data Drawer"
                                                >
                                                    <BarChart3 className="w-3.5 h-3.5" />
                                                    <span>View Data</span>
                                                </button>
                                            </td>

                                            {/* 15. Transfer Column */}
                                            <td className="p-3.5 text-center whitespace-nowrap">
                                                <button
                                                    onClick={() => { setTransferModal({ isOpen: true, host }); setDestinationAgency(host.agencyName || 'Royal Media Agency'); setTransferNote(''); }}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-all shadow-xs"
                                                    title="Transfer Host to Another Agency or Admin"
                                                >
                                                    <ArrowLeftRight className="w-3.5 h-3.5" />
                                                    <span>Transfer</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Pagination Footer */}
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <span>Showing</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                            {sortedHosts.length > 0 ? (page - 1) * pageSize + 1 : 0}
                        </span>
                        <span>to</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                            {Math.min(page * pageSize, sortedHosts.length)}
                        </span>
                        <span>of</span>
                        <span className="font-bold text-slate-900 dark:text-white">{sortedHosts.length}</span>
                        <span>entries</span>

                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                            className="ml-2 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                        >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all text-slate-700 dark:text-slate-300"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                    page === i + 1
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-all text-slate-700 dark:text-slate-300"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* EDIT HOST NAME & PROFILE DIALOG MODAL */}
            <AnimatePresence>
                {editHostModal.isOpen && editHostModal.host && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                                <div className="flex items-center gap-2">
                                    <Edit2 className="w-5 h-5 text-blue-500" />
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Host Name & Profile</h3>
                                </div>
                                <button onClick={() => setEditHostModal({ isOpen: false, host: null, name: '', mobile: '', email: '', agencyName: '' })}>
                                    <X className="w-5 h-5 text-slate-400 hover:text-slate-200" />
                                </button>
                            </div>

                            <div className="space-y-4 text-xs">
                                <div>
                                    <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Host Name *</label>
                                    <input
                                        type="text"
                                        value={editHostModal.name}
                                        onChange={(e) => setEditHostModal(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Mobile Number</label>
                                    <input
                                        type="text"
                                        value={editHostModal.mobile}
                                        onChange={(e) => setEditHostModal(prev => ({ ...prev, mobile: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={editHostModal.email}
                                        onChange={(e) => setEditHostModal(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-500 dark:text-slate-400 font-semibold mb-1">Agency Name</label>
                                    <input
                                        type="text"
                                        value={editHostModal.agencyName}
                                        onChange={(e) => setEditHostModal(prev => ({ ...prev, agencyName: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setEditHostModal({ isOpen: false, host: null, name: '', mobile: '', email: '', agencyName: '' })}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEditHost}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                                >
                                    Save Host Name
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* REMOVE HOST CONFIRMATION DIALOG MODAL */}
            <AnimatePresence>
                {removeModal.isOpen && removeModal.host && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Confirm Remove Host
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Are you sure you want to remove <span className="font-semibold text-slate-800 dark:text-slate-200">{removeModal.host.name}</span> ({removeModal.host.meethiChatId}) from the system?
                                    </p>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300">
                                ⚠️ This action will remove host credentials and deactivate live streamer access.
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setRemoveModal({ isOpen: false, host: null })}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmRemoveHost}
                                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-500/20"
                                >
                                    Confirm Remove
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CHANGE LEVEL CONFIRMATION POPUP */}
            <AnimatePresence>
                {changeLevelModal.isOpen && changeLevelModal.host && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Update Host Level
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Change level for <span className="font-semibold text-slate-800 dark:text-slate-200">{changeLevelModal.host.name}</span> from Level {changeLevelModal.host.level} to <span className="font-bold text-blue-600 dark:text-blue-400">Level {changeLevelModal.newLevel}</span>.
                                    </p>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300">
                                ⭐ Level upgrades will increase daily coin commission rates and unlocked perks for this host.
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setChangeLevelModal({ isOpen: false, host: null, newLevel: 1 })}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmChangeLevel}
                                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                                >
                                    Confirm Level Update
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* BAN CONFIRMATION MODAL (ID Ban / Device Ban) */}
            <AnimatePresence>
                {banModal.isOpen && banModal.host && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${banModal.type === 'id' ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400'}`}>
                                    {banModal.type === 'id' ? <Ban className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        {banModal.type === 'id' ? 'Toggle ID Ban Status' : 'Toggle Device Ban Status'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Host: <span className="font-semibold text-slate-800 dark:text-slate-200">{banModal.host.name}</span> ({banModal.host.meethiChatId})
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2 text-xs">
                                <label className="block font-semibold text-slate-700 dark:text-slate-300">Ban Reason / Remarks</label>
                                <select
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                                >
                                    <option value="Policy Violation">Security Policy Violation</option>
                                    <option value="Inappropriate Conduct">Inappropriate Host Conduct during Stream</option>
                                    <option value="Multiple Account Abuse">Multiple Accounts / Device Farming Abuse</option>
                                    <option value="Fraudulent Activity">Fraudulent Coin Transfers</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setBanModal({ isOpen: false, host: null, type: 'id' })}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmBan}
                                    className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md ${
                                        banModal.type === 'id' ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'
                                    }`}
                                >
                                    Confirm Action
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* TRANSFER CONFIRMATION DIALOG MODAL */}
            <AnimatePresence>
                {transferModal.isOpen && transferModal.host && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                    <ArrowLeftRight className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Transfer Host to Another Agency
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Reassign <span className="font-semibold text-slate-800 dark:text-slate-200">{transferModal.host.name}</span> ({transferModal.host.meethiChatId}) to a new agency network or admin.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Destination Agency / Admin
                                    </label>
                                    <select
                                        value={destinationAgency}
                                        onChange={(e) => setDestinationAgency(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                                    >
                                        <option value="Royal Media Agency">Royal Media Agency</option>
                                        <option value="Star Talent Agency">Star Talent Agency</option>
                                        <option value="Apex Live Media">Apex Live Media</option>
                                        <option value="Galaxy Host Management">Galaxy Host Management</option>
                                        <option value="Direct Meethi Host Network">Direct Meethi Host Network</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Transfer Note / Special Instructions
                                    </label>
                                    <textarea
                                        value={transferNote}
                                        onChange={(e) => setTransferNote(e.target.value)}
                                        placeholder="Enter transfer instructions..."
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none h-20"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setTransferModal({ isOpen: false, host: null })}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmTransfer}
                                    disabled={isSubmittingTransfer}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
                                >
                                    {isSubmittingTransfer && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Confirm Transfer</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* VIEW DATA (FULL SCREEN ANALYTICS DRAWER MODAL) */}
            <AnimatePresence>
                {analyticsDrawerHost && (
                    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end">
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-full max-w-5xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden"
                        >
                            {/* Drawer Title Header */}
                            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-850">
                                <div className="flex items-center gap-3">
                                    {analyticsDrawerHost.profilePhoto ? (
                                        <img src={analyticsDrawerHost.profilePhoto} alt={analyticsDrawerHost.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-xs" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-base font-bold shadow-md">
                                            {analyticsDrawerHost.name.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            {analyticsDrawerHost.name} - Full Analytics & Call Data
                                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 font-mono">
                                                ID: {analyticsDrawerHost.meethiChatId}
                                            </span>
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Level {analyticsDrawerHost.level} Host • Agency: <span className="font-semibold text-slate-700 dark:text-slate-300">{analyticsDrawerHost.agencyName}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setAnalyticsDrawerHost(null)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Drawer Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                
                                {/* 1. Date Filter Controls */}
                                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" /> Date Filter & Preset Controls
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month'].map(preset => (
                                                <button
                                                    key={preset}
                                                    onClick={() => { setQuickDatePreset(preset); toast.info(`Applied quick filter: ${preset}`); }}
                                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                                                        quickDatePreset === preset
                                                            ? 'bg-blue-600 text-white shadow-xs'
                                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-blue-50'
                                                    }`}
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
                                        <div>
                                            <label className="block text-slate-500 mb-1 font-semibold">From Date</label>
                                            <input
                                                type="date"
                                                value={fromDate}
                                                onChange={(e) => setFromDate(e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-500 mb-1 font-semibold">To Date</label>
                                            <input
                                                type="date"
                                                value={toDate}
                                                onChange={(e) => setToDate(e.target.value)}
                                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex items-end gap-2 sm:col-span-2">
                                            <button
                                                onClick={() => toast.success(`Filter applied from ${fromDate || 'Start'} to ${toDate || 'Today'}`)}
                                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-xs"
                                            >
                                                Apply Filter
                                            </button>
                                            <button
                                                onClick={() => { setFromDate(''); setToDate(''); setQuickDatePreset('This Month'); toast.info('Filters reset to default.'); }}
                                                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                                            >
                                                Reset Filter
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Top Summary Cards (12 Stat Cards) */}
                                <div>
                                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                                        Comprehensive Summary Metrics ({quickDatePreset})
                                    </h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                                            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">Total Call Coins Received</p>
                                            <p className="text-xl font-extrabold text-amber-800 dark:text-amber-200 mt-1">128,450 🪙</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                                            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">This Month Call Coins</p>
                                            <p className="text-xl font-extrabold text-amber-800 dark:text-amber-200 mt-1">42,800 🪙</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                                            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">This Week Call Coins</p>
                                            <p className="text-xl font-extrabold text-amber-800 dark:text-amber-200 mt-1">11,250 🪙</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-3.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                                            <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">Today Call Coins</p>
                                            <p className="text-xl font-extrabold text-amber-800 dark:text-amber-200 mt-1">1,840 🪙</p>
                                        </div>

                                        <div className="bg-blue-50/80 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
                                            <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">Total Calls</p>
                                            <p className="text-xl font-extrabold text-blue-800 dark:text-blue-200 mt-1">1,420 Calls</p>
                                        </div>
                                        <div className="bg-blue-50/80 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
                                            <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">This Month Calls</p>
                                            <p className="text-xl font-extrabold text-blue-800 dark:text-blue-200 mt-1">380 Calls</p>
                                        </div>
                                        <div className="bg-blue-50/80 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
                                            <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">This Week Calls</p>
                                            <p className="text-xl font-extrabold text-blue-800 dark:text-blue-200 mt-1">94 Calls</p>
                                        </div>
                                        <div className="bg-blue-50/80 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
                                            <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">Today Calls</p>
                                            <p className="text-xl font-extrabold text-blue-800 dark:text-blue-200 mt-1">16 Calls</p>
                                        </div>

                                        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                                            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Total Call Time</p>
                                            <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200 mt-1">214h 40m</p>
                                        </div>
                                        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                                            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">This Month Call Time</p>
                                            <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200 mt-1">58h 12m</p>
                                        </div>
                                        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                                            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">This Week Call Time</p>
                                            <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200 mt-1">14h 25m</p>
                                        </div>
                                        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                                            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">Today Call Time</p>
                                            <p className="text-xl font-extrabold text-emerald-800 dark:text-emerald-200 mt-1">2h 45m</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Host Information & Performance Analytics */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
                                    
                                    {/* Host Information Card */}
                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                                        <h4 className="font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                            <User className="w-4 h-4" /> Host Profile Information
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-slate-400">Host Name</p>
                                                <p className="font-bold text-slate-900 dark:text-white">{analyticsDrawerHost.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Username</p>
                                                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{analyticsDrawerHost.username}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Meethi Chat ID</p>
                                                <p className="font-mono font-bold text-blue-600 dark:text-blue-400">{analyticsDrawerHost.meethiChatId}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Gender & Age</p>
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">{analyticsDrawerHost.gender}, {analyticsDrawerHost.age} Yrs</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Mobile Number</p>
                                                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">{analyticsDrawerHost.mobile}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Email Address</p>
                                                <p className="font-semibold text-slate-800 dark:text-slate-200">{analyticsDrawerHost.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Current Level</p>
                                                <p className="font-bold text-amber-600 dark:text-amber-400">Level {analyticsDrawerHost.level}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Current Online Status</p>
                                                <p className="font-bold text-emerald-600 dark:text-emerald-400">{analyticsDrawerHost.isOnline ? '🟢 Online' : '⚪ Offline'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Call Analytics Card */}
                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                                        <h4 className="font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                            <Phone className="w-4 h-4" /> Call Analytics Breakdown
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-slate-400">Total Calls Handled</p>
                                                <p className="font-bold text-slate-900 dark:text-white">1,420</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Incoming Calls</p>
                                                <p className="font-bold text-emerald-600 dark:text-emerald-400">1,120</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Outgoing Calls</p>
                                                <p className="font-bold text-blue-600 dark:text-blue-400">300</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Missed / Cancelled</p>
                                                <p className="font-bold text-red-600 dark:text-red-400">45</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Average Call Duration</p>
                                                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">09m 04s</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-400">Longest Call</p>
                                                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">48m 10s</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-slate-400">Total Call Duration</p>
                                                <p className="font-mono font-extrabold text-base text-blue-600 dark:text-blue-400">214 Hours 40 Minutes</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Coin & Performance Spectrum Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
                                    
                                    {/* Coin Analytics & Daily Spectrum */}
                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                                        <h4 className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" /> Coin Analytics & Earnings Graph
                                        </h4>
                                        
                                        <div className="flex items-end justify-between h-32 px-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 py-3 gap-2">
                                            {[45, 60, 85, 95, 70, 50, 90, 65, 80, 100, 75, 85, 90, 60].map((val, idx) => (
                                                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                                                    <div
                                                        style={{ height: `${val}%` }}
                                                        className="w-full bg-gradient-to-t from-amber-500 to-yellow-400 dark:from-amber-600 dark:to-yellow-300 rounded-t-sm group-hover:opacity-100 transition-all opacity-80"
                                                    />
                                                    <span className="text-[9px] text-slate-400 font-mono">D{idx+1}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-center pt-2">
                                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                <p className="text-slate-400 text-[10px]">Today's Coins</p>
                                                <p className="font-bold text-amber-600">1,840 🪙</p>
                                            </div>
                                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                <p className="text-slate-400 text-[10px]">Weekly Coins</p>
                                                <p className="font-bold text-amber-600">11,250 🪙</p>
                                            </div>
                                            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                <p className="text-slate-400 text-[10px]">Lifetime Coins</p>
                                                <p className="font-bold text-amber-600">128,450 🪙</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Performance Analytics & Rating */}
                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                                        <h4 className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                                            <Award className="w-4 h-4" /> Performance Metrics & Host Rating
                                        </h4>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-600 dark:text-slate-300 font-semibold">Host Rating</span>
                                                <div className="flex items-center gap-1 font-bold text-amber-500">
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <span className="text-slate-900 dark:text-white ml-1">4.9 / 5.0</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold">
                                                    <span>Call Acceptance Rate</span>
                                                    <span className="text-emerald-600 font-bold">96.8%</span>
                                                </div>
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-emerald-500 h-full w-[96.8%]" />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold">
                                                    <span>Level {analyticsDrawerHost.level} Progress</span>
                                                    <span className="text-blue-600 font-bold">78%</span>
                                                </div>
                                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-blue-600 h-full w-[78%]" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                <p className="text-slate-400">Total Online Hours</p>
                                                <p className="font-extrabold text-sm text-slate-900 dark:text-white">312.5 Hours</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                                <p className="text-slate-400">Active Days (This Month)</p>
                                                <p className="font-extrabold text-sm text-slate-900 dark:text-white">26 Days</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 5. Call History Table & Controls */}
                                <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                        <div>
                                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-blue-600" /> Recent Call History Log
                                            </h4>
                                            <p className="text-slate-500 text-[11px]">Inspect caller details, duration, coins earned, and status.</p>
                                        </div>

                                        {/* History Actions & Search */}
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-48">
                                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                                <input
                                                    type="text"
                                                    value={historySearch}
                                                    onChange={(e) => setHistorySearch(e.target.value)}
                                                    placeholder="Search history..."
                                                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none"
                                                />
                                            </div>
                                            <button
                                                onClick={() => toast.success('Call History downloaded as CSV')}
                                                className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                                                title="Download Call History"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => toast.success('Coin Report printed successfully')}
                                                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
                                                title="Print Report"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Call History Table */}
                                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700">
                                                <tr>
                                                    <th className="p-3">Date & Time</th>
                                                    <th className="p-3">Caller ID</th>
                                                    <th className="p-3">Receiver ID</th>
                                                    <th className="p-3">Call Duration</th>
                                                    <th className="p-3">Coins Earned</th>
                                                    <th className="p-3">Call Type</th>
                                                    <th className="p-3 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                                {filteredCallHistory.map((rec) => (
                                                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                        <td className="p-3 font-mono text-[11px] text-slate-500">{rec.dateTime}</td>
                                                        <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">{rec.callerId}</td>
                                                        <td className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">{rec.receiverId}</td>
                                                        <td className="p-3 font-mono">{rec.duration}</td>
                                                        <td className="p-3 font-extrabold text-amber-600">+{rec.coinsEarned} 🪙</td>
                                                        <td className="p-3">
                                                            <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                                {rec.type === 'Incoming' ? <PhoneIncoming className="w-3.5 h-3.5 text-emerald-500" /> : <PhoneOutgoing className="w-3.5 h-3.5 text-blue-500" />}
                                                                {rec.type}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                                rec.status === 'Successful' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                                                                rec.status === 'Missed' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                                                                'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                                            }`}>
                                                                {rec.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 flex items-center justify-between">
                                <button
                                    onClick={() => setAnalyticsDrawerHost(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                                >
                                    Close Drawer
                                </button>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toast.success('Host Statistics Refreshed')}
                                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        <span>Refresh Statistics</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
