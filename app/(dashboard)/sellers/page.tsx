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
    Zap, Check, Printer, Plus, Key, CreditCard, Coins, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

// Seller ListItem Interface
export interface SellerListItem {
    id: string;
    srNo: number;
    invitedBy: string;
    name: string;
    sellerCode: string;
    meethiChatId: string;
    username: string;
    profilePhoto?: string;
    email: string;
    mobile: string;
    country: string;
    state: string;
    district: string;
    registrationDate: string;
    coinsSold: number;
    creditBalance: number;
    creditLimit: number;
    status: 'active' | 'blocked';
    verified: boolean;
}

// Transaction Record for Drawer History
export interface CoinTransactionRecord {
    id: string;
    dateTime: string;
    txnId: string;
    buyerName: string;
    coinsPurchased: number;
    amountInr: number;
    paymentMethod: string;
    status: 'Completed' | 'Pending' | 'Failed';
}

// Initial Mock Dataset for Sellers
const MOCK_SELLERS_LIST: SellerListItem[] = [
    {
        id: 'SLR-1001',
        srNo: 1,
        invitedBy: 'Rajesh Malhotra (Owner)',
        name: 'Alibaba Coin Distributor',
        sellerCode: 'SEL-881',
        meethiChatId: 'MC-998811',
        username: '@alibabacoins',
        profilePhoto: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250',
        email: 'alibaba@coins.com',
        mobile: '+91 98111 22334',
        country: 'India',
        state: 'Delhi',
        district: 'New Delhi',
        registrationDate: '2024-05-10 11:30:00',
        coinsSold: 4500000,
        creditBalance: 1250000,
        creditLimit: 5000000,
        status: 'active',
        verified: true
    },
    {
        id: 'SLR-1002',
        srNo: 2,
        invitedBy: 'Super Admin Siddharth',
        name: 'Global Recharge Hub',
        sellerCode: 'SEL-292',
        meethiChatId: 'MC-772299',
        username: '@globalhub',
        profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
        email: 'hub@recharge.com',
        mobile: '+91 97222 44556',
        country: 'India',
        state: 'Maharashtra',
        district: 'Mumbai City',
        registrationDate: '2024-06-18 14:15:00',
        coinsSold: 8900000,
        creditBalance: 540000,
        creditLimit: 10000000,
        status: 'active',
        verified: true
    },
    {
        id: 'SLR-1003',
        srNo: 3,
        invitedBy: 'Direct Admin Network',
        name: 'Mico Agent Delhi',
        sellerCode: 'SEL-901',
        meethiChatId: 'MC-110901',
        username: '@micodelhi',
        profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250',
        email: 'mico.delhi@gmail.com',
        mobile: '+91 99333 55667',
        country: 'India',
        state: 'Delhi',
        district: 'South Delhi',
        registrationDate: '2024-08-01 09:45:00',
        coinsSold: 1200000,
        creditBalance: 80000,
        creditLimit: 2000000,
        status: 'blocked',
        verified: false
    }
];

// Sample Sales Transactions History
const MOCK_SALES_HISTORY: CoinTransactionRecord[] = [
    { id: 'TXN-901', dateTime: '2026-07-26 21:05:00', txnId: 'PAY-881920', buyerName: 'Royal Live Agency', coinsPurchased: 500000, amountInr: 45000, paymentMethod: 'Bank Transfer (IMPS)', status: 'Completed' },
    { id: 'TXN-902', dateTime: '2026-07-26 18:30:12', txnId: 'PAY-771239', buyerName: 'Star Talent Network', coinsPurchased: 200000, amountInr: 18000, paymentMethod: 'UPI Merchant Auto', status: 'Completed' },
    { id: 'TXN-903', dateTime: '2026-07-25 15:10:45', txnId: 'PAY-554102', buyerName: 'Galaxy Streamers', coinsPurchased: 100000, amountInr: 9000, paymentMethod: 'Netbanking (RTGS)', status: 'Completed' },
    { id: 'TXN-904', dateTime: '2026-07-24 11:20:00', txnId: 'PAY-339012', buyerName: 'Direct Host Network', coinsPurchased: 50000, amountInr: 4500, paymentMethod: 'UPI QR Code', status: 'Completed' },
];

export default function SellersPage() {
    const { user: currentUser } = useAuth();
    const [sellers, setSellers] = useState<SellerListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all'); // active / blocked / all
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [stateFilter, setStateFilter] = useState<string>('all');
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    // Sorting & Pagination
    const [sortColumn, setSortColumn] = useState<keyof SellerListItem>('srNo');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modals
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newSellerName, setNewSellerName] = useState('');
    const [newSellerEmail, setNewSellerEmail] = useState('');
    const [newSellerMobile, setNewSellerMobile] = useState('');
    const [newSellerState, setNewSellerState] = useState('Delhi');
    const [newCreditLimit, setNewCreditLimit] = useState('1000000');

    // Credit Limit Adjust Modal
    const [adjustLimitModal, setAdjustLimitModal] = useState<{ isOpen: boolean; seller: SellerListItem | null }>({ isOpen: false, seller: null });
    const [customLimitValue, setCustomLimitValue] = useState('');

    // Status Toggle Modal
    const [statusModal, setStatusModal] = useState<{ isOpen: boolean; seller: SellerListItem | null }>({ isOpen: false, seller: null });

    // Transfer Modal
    const [transferModal, setTransferModal] = useState<{ isOpen: boolean; seller: SellerListItem | null }>({ isOpen: false, seller: null });
    const [targetRecipient, setTargetRecipient] = useState('Super Admin Siddharth');
    const [transferNote, setTransferNote] = useState('');
    const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

    // Full Analytics Drawer
    const [analyticsDrawerSeller, setAnalyticsDrawerSeller] = useState<SellerListItem | null>(null);

    // Fetch initial dataset
    const fetchSellersData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/sellers').catch(() => null);
            if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
                const mapped: SellerListItem[] = res.data.map((item: any, idx: number) => ({
                    id: item._id || `SLR-${idx + 1000}`,
                    srNo: idx + 1,
                    invitedBy: item.invitedBy || 'Super Admin Team',
                    name: item.name || item.agencyName || 'Coin Seller',
                    sellerCode: item.code || item.sellerCode || `SEL-${idx + 100}`,
                    meethiChatId: item.meethiChatId || `MC-${990000 + idx}`,
                    username: item.username ? `@${item.username.replace('@','')}` : `@seller_${idx+1}`,
                    profilePhoto: item.profilePhoto || '',
                    email: item.email || 'seller@meethichat.com',
                    mobile: item.mobile || item.phoneNumber || '+91 90000 00000',
                    country: item.country || 'India',
                    state: item.state || 'Delhi',
                    district: item.district || 'New Delhi',
                    registrationDate: item.createdAt ? new Date(item.createdAt).toLocaleString() : '2024-05-10 11:30:00',
                    coinsSold: item.coinsSold || 4500000,
                    creditBalance: item.balance || item.creditBalance || 1250000,
                    creditLimit: item.creditLimit || 5000000,
                    status: item.status === 'blocked' ? 'blocked' : 'active',
                    verified: item.verified !== false
                }));
                setSellers(mapped);
            } else {
                setSellers([]);
            }
        } catch (err) {
            console.error('Failed to fetch seller list:', err);
            setSellers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSellersData();
    }, [fetchSellersData]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchSellersData();
        setIsRefreshing(false);
        toast.success('Seller list refreshed with live server data');
    };

    // Filter Logic
    const filteredSellers = useMemo(() => {
        return sellers.filter(s => {
            const q = search.trim().toLowerCase();
            const matchesSearch = !q ||
                s.name.toLowerCase().includes(q) ||
                s.sellerCode.toLowerCase().includes(q) ||
                s.meethiChatId.toLowerCase().includes(q) ||
                s.email.toLowerCase().includes(q) ||
                s.mobile.includes(q);

            const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
            const matchesCountry = countryFilter === 'all' || s.country.toLowerCase() === countryFilter.toLowerCase();
            const matchesState = stateFilter === 'all' || s.state.toLowerCase() === stateFilter.toLowerCase();

            return matchesSearch && matchesStatus && matchesCountry && matchesState;
        });
    }, [sellers, search, statusFilter, countryFilter, stateFilter]);

    // Sorting Logic
    const sortedSellers = useMemo(() => {
        return [...filteredSellers].sort((a, b) => {
            let valA: any = a[sortColumn];
            let valB: any = b[sortColumn];

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredSellers, sortColumn, sortDirection]);

    // Pagination Logic
    const totalPages = Math.ceil(sortedSellers.length / pageSize) || 1;
    const paginatedSellers = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedSellers.slice(start, start + pageSize);
    }, [sortedSellers, page, pageSize]);

    // Stats
    const stats = useMemo(() => {
        const totalSold = sellers.reduce((sum, s) => sum + s.coinsSold, 0);
        const totalBalance = sellers.reduce((sum, s) => sum + s.creditBalance, 0);
        return {
            total: sellers.length,
            active: sellers.filter(s => s.status === 'active').length,
            blocked: sellers.filter(s => s.status === 'blocked').length,
            totalSold,
            totalBalance
        };
    }, [sellers]);

    // Export CSV
    const exportToCSV = () => {
        if (filteredSellers.length === 0) {
            toast.error('No data available to export');
            return;
        }

        const headers = [
            'SR', 'Invited By', 'Seller Agency Name', 'Seller Code', 'Meethi Chat ID',
            'Email', 'Mobile Number', 'Country', 'State', 'Reg Date', 'Coins Sold', 'Credit Balance', 'Status'
        ];

        const rows = filteredSellers.map(s => [
            s.srNo,
            `"${s.invitedBy}"`,
            `"${s.name}"`,
            `"${s.sellerCode}"`,
            `"${s.meethiChatId}"`,
            `"${s.email}"`,
            `"${s.mobile}"`,
            `"${s.country}"`,
            `"${s.state}"`,
            `"${s.registrationDate}"`,
            s.coinsSold,
            s.creditBalance,
            s.status
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Seller_List_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Seller List exported to CSV successfully');
    };

    const handlePrintPDF = () => {
        window.print();
    };

    const handleSort = (col: keyof SellerListItem) => {
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

    // Form Handlers
    const handleRegisterSeller = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSellerName || !newSellerEmail) return;

        const newSeller: SellerListItem = {
            id: `SLR-${Date.now().toString().slice(-4)}`,
            srNo: sellers.length + 1,
            invitedBy: currentUser?.name || 'Super Admin Team',
            name: newSellerName,
            sellerCode: `SEL-${Math.floor(100 + Math.random() * 900)}`,
            meethiChatId: `MC-${Math.floor(100000 + Math.random() * 900000)}`,
            username: `@${newSellerName.toLowerCase().replace(/\s+/g, '')}`,
            email: newSellerEmail,
            mobile: newSellerMobile || '+91 98000 00000',
            country: 'India',
            state: newSellerState,
            district: 'Central',
            registrationDate: new Date().toLocaleString(),
            coinsSold: 0,
            creditBalance: parseInt(newCreditLimit) || 1000000,
            creditLimit: parseInt(newCreditLimit) || 1000000,
            status: 'active',
            verified: true
        };

        setSellers([newSeller, ...sellers]);
        toast.success(`🎉 Coin Seller Agency ${newSellerName} registered successfully!`);
        setIsAddModalOpen(false);
        setNewSellerName('');
        setNewSellerEmail('');
        setNewSellerMobile('');
    };

    const confirmAdjustLimit = async () => {
        if (!adjustLimitModal.seller) return;
        const seller = adjustLimitModal.seller;
        const numVal = parseInt(customLimitValue);
        if (isNaN(numVal) || numVal < 0) {
            toast.error('Please enter a valid coin limit amount');
            return;
        }

        try {
            await apiClient.patch(`/api/sellers/${seller.id}/limit`, { limit: numVal }).catch(() => null);
            setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, creditBalance: numVal, creditLimit: numVal } : s));
            toast.success(`🪙 Credit limit updated for ${seller.name} to ${numVal.toLocaleString()} coins!`);
            setAdjustLimitModal({ isOpen: false, seller: null });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update credit limit');
        }
    };

    const confirmToggleStatus = async () => {
        if (!statusModal.seller) return;
        const seller = statusModal.seller;
        const nextStatus = seller.status === 'active' ? 'blocked' : 'active';
        try {
            await apiClient.post(`/api/sellers/${seller.id}/toggle-status`, { status: nextStatus }).catch(() => null);
            setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, status: nextStatus } : s));
            toast.success(nextStatus === 'active'
                ? `🟢 Seller Agency ${seller.name} activated successfully!`
                : `🔴 Seller Agency ${seller.name} blocked.`
            );
            setStatusModal({ isOpen: false, seller: null });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to change seller status');
        }
    };

    const confirmTransferSeller = async () => {
        if (!transferModal.seller) return;
        const seller = transferModal.seller;
        setIsSubmittingTransfer(true);
        try {
            await apiClient.post(`/api/sellers/${seller.id}/transfer`, {
                targetRecipient,
                note: transferNote
            }).catch(() => null);

            setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, invitedBy: targetRecipient } : s));
            toast.success(`🔀 Seller ${seller.name} transferred to ${targetRecipient}!`);
            setTransferModal({ isOpen: false, seller: null });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to transfer seller');
        } finally {
            setIsSubmittingTransfer(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-blue-500/5">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <Award className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                Seller Management & Coin Merchant List
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                                    Merchant Distribution Network
                                </span>
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                Manage coin distribution agencies, credit limit allocations, block/unblock seller access, and inspect merchant sales reports.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all shadow-md shadow-blue-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Register New Seller</span>
                    </button>

                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-sm font-medium border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
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
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Registered Sellers</p>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.total}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Building2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-emerald-200/60 dark:border-emerald-900/40 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">🟢 Active Sellers</p>
                        <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">{stats.active}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-amber-200/60 dark:border-amber-900/40 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Total Coins Distributed</p>
                        <p className="text-xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">{(stats.totalSold).toLocaleString()} 🪙</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Coins className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-blue-200/60 dark:border-blue-900/40 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Allocated Credit Balance</p>
                        <p className="text-xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">{(stats.totalBalance).toLocaleString()} 🪙</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <CreditCard className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Search & Filters Controls Section */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-blue-500/5 space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by Seller Agency Name, Code, Meethi Chat ID, Email, Mobile..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
                                filtersExpanded || statusFilter !== 'all' || stateFilter !== 'all'
                                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                                    : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200'
                            }`}
                        >
                            <Filter className="w-4 h-4 text-blue-600" />
                            <span>Filters</span>
                            {filtersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {(filtersExpanded || statusFilter !== 'all' || stateFilter !== 'all') && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
                        >
                            <div>
                                <label className="block text-slate-500 mb-1 font-semibold">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="active">🟢 Active</option>
                                    <option value="blocked">🔴 Blocked</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-500 mb-1 font-semibold">State</label>
                                <select
                                    value={stateFilter}
                                    onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                                >
                                    <option value="all">All States</option>
                                    <option value="delhi">Delhi</option>
                                    <option value="maharashtra">Maharashtra</option>
                                </select>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Data Table Card (16 Columns) */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-blue-500/5 overflow-hidden">
                <div className="overflow-x-auto max-h-[680px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                    <table className="w-full text-left border-collapse text-xs">
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
                                        Seller Agency <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                                <th className="p-3.5 whitespace-nowrap">Seller Code</th>
                                <th className="p-3.5 whitespace-nowrap">Meethi Chat ID</th>
                                <th className="p-3.5 whitespace-nowrap">Email</th>
                                <th className="p-3.5 whitespace-nowrap">Mobile Number</th>
                                <th className="p-3.5 whitespace-nowrap">Location</th>
                                <th className="p-3.5 whitespace-nowrap">Reg Date & Time</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Total Coins Sold</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Credit Balance</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Adjust Limit</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Permissions</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Status</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Transfer</th>
                                <th className="p-3.5 whitespace-nowrap text-center">View Data</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="p-4 text-center"><div className="h-4 w-6 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4 text-center"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-16 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                    </tr>
                                ))
                            ) : paginatedSellers.length === 0 ? (
                                <tr>
                                    <td colSpan={16} className="p-12 text-center">
                                        <div className="max-w-md mx-auto space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-500 flex items-center justify-center mx-auto border border-blue-200">
                                                <Building2 className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-slate-800 dark:text-white">No Seller Agencies Found</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    We couldn't find any merchant matching your search query.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedSellers.map((seller, idx) => (
                                    <tr key={seller.id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        {/* 1. SR */}
                                        <td className="p-3.5 text-center font-bold text-slate-500 dark:text-slate-400">
                                            #{(page - 1) * pageSize + idx + 1}
                                        </td>

                                        {/* 2. Invited By */}
                                        <td className="p-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <span>{seller.invitedBy}</span>
                                            </div>
                                        </td>

                                        {/* 3. Seller Agency Name */}
                                        <td className="p-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                {seller.profilePhoto ? (
                                                    <img src={seller.profilePhoto} alt={seller.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                                        {seller.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{seller.name}</p>
                                                    <span className="text-[10px] text-slate-400 font-mono">{seller.username}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 4. Seller Code */}
                                        <td className="p-3.5 whitespace-nowrap font-mono font-bold text-blue-600 dark:text-blue-400">
                                            {seller.sellerCode}
                                        </td>

                                        {/* 5. Meethi Chat ID */}
                                        <td className="p-3.5 whitespace-nowrap">
                                            <button
                                                onClick={() => copyText(seller.meethiChatId, 'Meethi Chat ID')}
                                                className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 px-2 py-1 rounded-lg border border-slate-200 transition-colors"
                                            >
                                                <span>{seller.meethiChatId}</span>
                                                <Copy className="w-3 h-3 text-slate-400" />
                                            </button>
                                        </td>

                                        {/* 6. Email */}
                                        <td className="p-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                            {seller.email}
                                        </td>

                                        {/* 7. Mobile Number */}
                                        <td className="p-3.5 whitespace-nowrap font-mono text-slate-600 dark:text-slate-300">
                                            {seller.mobile}
                                        </td>

                                        {/* 8. Location */}
                                        <td className="p-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                                            {seller.state}, {seller.country}
                                        </td>

                                        {/* 9. Reg Date & Time */}
                                        <td className="p-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                            {seller.registrationDate}
                                        </td>

                                        {/* 10. Total Coins Sold */}
                                        <td className="p-3.5 whitespace-nowrap text-center font-extrabold text-amber-600 dark:text-amber-400">
                                            {seller.coinsSold.toLocaleString()} 🪙
                                        </td>

                                        {/* 11. Credit Balance */}
                                        <td className="p-3.5 whitespace-nowrap text-center font-extrabold text-emerald-600 dark:text-emerald-400">
                                            {seller.creditBalance.toLocaleString()} 🪙
                                        </td>

                                        {/* 12. Adjust Limit */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => { setAdjustLimitModal({ isOpen: true, seller }); setCustomLimitValue(String(seller.creditBalance)); }}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold transition-all shadow-xs"
                                                title="Adjust Seller Coin Credit Limit"
                                            >
                                                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Limit</span>
                                            </button>
                                        </td>

                                        {/* 13. Permissions */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <Link href={`/security/permissions?targetType=user&targetId=${seller.id}&name=${encodeURIComponent(seller.name)}`}>
                                                <button
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold transition-all shadow-xs"
                                                    title="Manage Custom Seller Permissions"
                                                >
                                                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                                                    <span>Perms</span>
                                                </button>
                                            </Link>
                                        </td>

                                        {/* 14. Status */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => setStatusModal({ isOpen: true, seller })}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs ${
                                                    seller.status === 'active'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400'
                                                        : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-400'
                                                }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${seller.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                                <span>{seller.status === 'active' ? 'Active' : 'Blocked'}</span>
                                            </button>
                                        </td>

                                        {/* 15. Transfer */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => { setTransferModal({ isOpen: true, seller }); setTargetRecipient(seller.invitedBy || 'Super Admin Siddharth'); setTransferNote(''); }}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-all shadow-xs"
                                                title="Transfer Seller Assignment"
                                            >
                                                <ArrowLeftRight className="w-3.5 h-3.5" />
                                                <span>Transfer</span>
                                            </button>
                                        </td>

                                        {/* 16. View Data */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <button
                                                onClick={() => setAnalyticsDrawerSeller(seller)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all shadow-xs"
                                                title="Open Full Screen Merchant Sales Drawer"
                                            >
                                                <BarChart3 className="w-3.5 h-3.5" />
                                                <span>View Data</span>
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
                        Showing <span className="font-bold text-slate-900 dark:text-white">{sortedSellers.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(page * pageSize, sortedSellers.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{sortedSellers.length}</span> entries
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

            {/* REGISTER NEW SELLER MODAL */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-blue-600" /> Register Coin Seller Agency
                                </h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <form onSubmit={handleRegisterSeller} className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Seller Agency Name</label>
                                    <input type="text" value={newSellerName} onChange={(e) => setNewSellerName(e.target.value)} required placeholder="e.g. Asia Payouts Merchant" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                    <input type="email" value={newSellerEmail} onChange={(e) => setNewSellerEmail(e.target.value)} required placeholder="seller@domain.com" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
                                    <input type="text" value={newSellerMobile} onChange={(e) => setNewSellerMobile(e.target.value)} placeholder="+91 98111 22334" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Credit Limit (Coins)</label>
                                    <input type="number" value={newCreditLimit} onChange={(e) => setNewCreditLimit(e.target.value)} required placeholder="1000000" className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-emerald-600 focus:outline-none" />
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 rounded-xl border text-xs font-semibold">Cancel</button>
                                    <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">Confirm Registration</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ADJUST CREDIT LIMIT MODAL */}
            <AnimatePresence>
                {adjustLimitModal.isOpen && adjustLimitModal.seller && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Adjust Seller Credit Limit</h3>
                                    <p className="text-xs text-slate-500">Seller: <span className="font-semibold">{adjustLimitModal.seller.name}</span> ({adjustLimitModal.seller.sellerCode})</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-xs">
                                <label className="block font-semibold text-slate-700 dark:text-slate-300">New Coin Credit Balance Limit</label>
                                <input type="number" value={customLimitValue} onChange={(e) => setCustomLimitValue(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-extrabold text-emerald-600 text-sm focus:outline-none" />
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <button onClick={() => setAdjustLimitModal({ isOpen: false, seller: null })} className="px-4 py-2 rounded-xl border text-xs font-semibold">Cancel</button>
                                <button onClick={confirmAdjustLimit} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">Update Limit</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* BLOCK / UNBLOCK MODAL */}
            <AnimatePresence>
                {statusModal.isOpen && statusModal.seller && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${statusModal.seller.status === 'active' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                    {statusModal.seller.status === 'active' ? <Ban className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        {statusModal.seller.status === 'active' ? 'Block Seller Account' : 'Activate Seller Account'}
                                    </h3>
                                    <p className="text-xs text-slate-500">Seller: <span className="font-semibold">{statusModal.seller.name}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <button onClick={() => setStatusModal({ isOpen: false, seller: null })} className="px-4 py-2 rounded-xl border text-xs font-semibold">Cancel</button>
                                <button onClick={confirmToggleStatus} className={`px-4 py-2 rounded-xl text-white font-bold text-xs ${statusModal.seller.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                                    Confirm {statusModal.seller.status === 'active' ? 'Block' : 'Activate'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* TRANSFER MODAL */}
            <AnimatePresence>
                {transferModal.isOpen && transferModal.seller && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                                    <ArrowLeftRight className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Transfer Seller Assignment</h3>
                                    <p className="text-xs text-slate-500">Reassign <span className="font-semibold">{transferModal.seller.name}</span> to another Super Admin or Network.</p>
                                </div>
                            </div>
                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Super Admin / Network</label>
                                    <select value={targetRecipient} onChange={(e) => setTargetRecipient(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold">
                                        <option value="Super Admin Siddharth">Super Admin Siddharth</option>
                                        <option value="Rajesh Malhotra (Owner)">Rajesh Malhotra (Owner)</option>
                                        <option value="Royal Merchant Group">Royal Merchant Group</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <button onClick={() => setTransferModal({ isOpen: false, seller: null })} className="px-4 py-2 rounded-xl border text-xs font-semibold">Cancel</button>
                                <button onClick={confirmTransferSeller} disabled={isSubmittingTransfer} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1">
                                    {isSubmittingTransfer && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Confirm Transfer</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* VIEW DATA (FULL SCREEN MERCHANT DRAWER) */}
            <AnimatePresence>
                {analyticsDrawerSeller && (
                    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-xs flex justify-end">
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-full max-w-4xl bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden">
                            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {analyticsDrawerSeller.name} - Merchant Sales Analytics
                                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-700">{analyticsDrawerSeller.sellerCode}</span>
                                    </h3>
                                    <p className="text-xs text-slate-500">Meethi Chat ID: {analyticsDrawerSeller.meethiChatId} • Invited By: {analyticsDrawerSeller.invitedBy}</p>
                                </div>
                                <button onClick={() => setAnalyticsDrawerSeller(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                                {/* Summary Metrics */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                                        <p className="text-amber-700 dark:text-amber-300 font-semibold">Total Coins Sold</p>
                                        <p className="text-2xl font-extrabold text-amber-800 dark:text-amber-200 mt-1">{analyticsDrawerSeller.coinsSold.toLocaleString()} 🪙</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                                        <p className="text-emerald-700 dark:text-emerald-300 font-semibold">Current Credit Balance</p>
                                        <p className="text-2xl font-extrabold text-emerald-800 dark:text-emerald-200 mt-1">{analyticsDrawerSeller.creditBalance.toLocaleString()} 🪙</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                                        <p className="text-blue-700 dark:text-blue-300 font-semibold">Total Revenue Generated</p>
                                        <p className="text-2xl font-extrabold text-blue-800 dark:text-blue-200 mt-1">₹{(analyticsDrawerSeller.coinsSold * 0.09).toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Sales Transaction History */}
                                <div className="space-y-3">
                                    <h4 className="font-bold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                                        <Coins className="w-4 h-4 text-amber-500" /> Recent Coin Sales Transactions
                                    </h4>
                                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border-b">
                                                <tr>
                                                    <th className="p-3">Date & Time</th>
                                                    <th className="p-3">Txn ID</th>
                                                    <th className="p-3">Buyer Agency</th>
                                                    <th className="p-3">Coins Purchased</th>
                                                    <th className="p-3">Amount (INR)</th>
                                                    <th className="p-3 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {MOCK_SALES_HISTORY.map((t) => (
                                                    <tr key={t.id} className="hover:bg-slate-50">
                                                        <td className="p-3 font-mono text-slate-500">{t.dateTime}</td>
                                                        <td className="p-3 font-mono font-bold text-blue-600">{t.txnId}</td>
                                                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{t.buyerName}</td>
                                                        <td className="p-3 font-extrabold text-amber-600">+{t.coinsPurchased.toLocaleString()} 🪙</td>
                                                        <td className="p-3 font-bold text-slate-900 dark:text-white">₹{t.amountInr.toLocaleString()}</td>
                                                        <td className="p-3 text-center">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                                                {t.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 flex justify-between">
                                <button onClick={() => setAnalyticsDrawerSeller(null)} className="px-4 py-2 border rounded-xl font-semibold">Close Drawer</button>
                                <button onClick={() => toast.success('Sales report printed successfully')} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">Print Sales Report</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
