'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import {
    Sparkles,
    Search,
    User,
    Gift,
    Clock,
    Send,
    CheckCircle2,
    AlertCircle,
    Trash2,
    Crown,
    Flame,
    Shield,
    Tag,
    Image as ImageIcon,
    MessageSquare,
    Eye,
    Briefcase,
    Check,
    RefreshCw,
    X,
    ExternalLink,
    Layers,
    Plus,
    Boxes
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface AssetOption {
    _id: string;
    id?: string;
    uniqueId: string;
    name: string;
    category: string;
    number?: string;
    audience?: string;
    isStaffOnly?: boolean;
    imageUrl?: string;
    animationUrl?: string;
    price?: number;
    badgeText?: string;
    previewColor?: string;
}

interface TargetUser {
    _id: string;
    userId: number;
    name: string;
    phoneNumber?: string;
    email?: string;
    image?: string;
    role: string;
    diamonds?: number;
    coins?: number;
    isBlocked?: boolean;
    status?: string;
}

interface GrantHistoryItem {
    _id: string;
    adminId?: {
        name?: string;
        email?: string;
        userId?: number;
    };
    action: string;
    target: string;
    details: string;
    newValue?: {
        assetId?: string;
        uniqueId?: string;
        assetName?: string;
        category?: string;
        userId?: string;
        userNumericId?: number;
        userName?: string;
        durationDays?: number;
        expiresAt?: string;
        remainingQuantity?: number;
        message?: string;
    };
    createdAt: string;
}

interface DurationPackage {
    days: number;
    allocatedQuantity: number;
    remainingQuantity: number;
}

interface OperatorQuota {
    _id: string;
    operatorId: {
        _id?: string;
        userId?: number;
        name?: string;
        email?: string;
        role?: string;
    } | string;
    operatorName: string;
    assetName: string;
    assetCategory: string;
    imageUrl?: string;
    packages: DurationPackage[];
    availablePackages?: DurationPackage[];
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

const CATEGORY_TABS = [
    { label: 'All Assets', value: 'All' },
    { label: 'Frames 🖼️', value: 'Frames' },
    { label: 'Entry Effects 🚗', value: 'Entry' },
    { label: 'Tags & Badges 🏷️', value: 'Badge' },
    { label: 'VIP / SVIP 👑', value: 'VIP' },
    { label: 'King of Kings ⚔️', value: 'King of Kings' },
    { label: 'Chat Bubbles 💬', value: 'Chat Bubble' },
    { label: 'Themes 🎨', value: 'Theme' },
    { label: 'Staff / Employee 👔', value: 'Employee' },
];

const DURATION_PRESETS = [
    { label: '1 Day', days: 1 },
    { label: '3 Days', days: 3 },
    { label: '7 Days', days: 7 },
    { label: '15 Days', days: 15 },
    { label: '30 Days', days: 30 },
    { label: '90 Days', days: 90 },
    { label: '365 Days (1 Yr)', days: 365 },
    { label: 'Permanent ∞', days: 0 },
];

export default function AssetDistributionPage() {
    // Current User Role
    const [currentRole, setCurrentRole] = useState<string>('owner');
    const isOwner = currentRole === 'owner';
    const isOperator = ['operator', 'superAdmin', 'super-admin'].includes(currentRole);

    // Active Navigation Sub-Tab
    const [activeTab, setActiveTab] = useState<'grant' | 'allocate' | 'quotas' | 'history'>('grant');

    // Catalog & Quota State
    const [assets, setAssets] = useState<AssetOption[]>([]);
    const [loadingAssets, setLoadingAssets] = useState(true);
    const [selectedCategoryTab, setSelectedCategoryTab] = useState('All');
    const [assetSearchQuery, setAssetSearchQuery] = useState('');

    // Quotas State (For Owner & Operator)
    const [quotas, setQuotas] = useState<OperatorQuota[]>([]);
    const [loadingQuotas, setLoadingQuotas] = useState(false);

    // Selected Asset for Granting
    const [selectedAsset, setSelectedAsset] = useState<AssetOption | null>(null);
    const [selectedQuota, setSelectedQuota] = useState<OperatorQuota | null>(null);
    const [directUniqueIdInput, setDirectUniqueIdInput] = useState('');

    // User Search State
    const [userQuery, setUserQuery] = useState('');
    const [userLookupResults, setUserLookupResults] = useState<TargetUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<TargetUser | null>(null);
    const [isSearchingUser, setIsSearchingUser] = useState(false);

    // Grant Form Config
    const [durationDays, setDurationDays] = useState<number>(30);
    const [customDaysInput, setCustomDaysInput] = useState('30');
    const [customMessage, setCustomMessage] = useState('');
    const [autoEquip, setAutoEquip] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // History & Modals
    const [history, setHistory] = useState<GrantHistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    // Owner Allocation Modal / Form State
    const [operatorSearchQuery, setOperatorSearchQuery] = useState('');
    const [operatorLookupResults, setOperatorLookupResults] = useState<any[]>([]);
    const [selectedOperator, setSelectedOperator] = useState<any | null>(null);
    const [selectedAssetForAllocation, setSelectedAssetForAllocation] = useState<AssetOption | null>(null);
    const [allocationTiers, setAllocationTiers] = useState<Array<{ days: number; quantity: number }>>([
        { days: 30, quantity: 1 },
        { days: 15, quantity: 2 },
        { days: 7, quantity: 2 }
    ]);
    const [allocationNotes, setAllocationNotes] = useState('');
    const [allocating, setAllocating] = useState(false);

    // Detect user role on mount
    useEffect(() => {
        try {
            const rawUser = localStorage.getItem('admin_user');
            if (rawUser) {
                const parsed = JSON.parse(rawUser);
                if (parsed.role) {
                    setCurrentRole(parsed.role.toLowerCase());
                }
            }
        } catch {
            // fallback
        }
    }, []);

    // Fetch Assets Catalog
    const fetchCatalog = useCallback(async () => {
        try {
            setLoadingAssets(true);
            const res = await apiClient.get<any>('/api/store/asset-catalog');
            if (res.success && res.data) {
                setAssets(res.data.assets || []);
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to load assets catalog');
        } finally {
            setLoadingAssets(false);
        }
    }, []);

    // Fetch Quotas (available stock for operator, all quotas for owner)
    const fetchQuotas = useCallback(async () => {
        try {
            setLoadingQuotas(true);
            const url = isOwner ? '/api/admin/asset-quota' : '/api/admin/asset-quota/available';
            const res = await apiClient.get<any>(url);
            if (res.success && res.data) {
                setQuotas(res.data || []);
            }
        } catch (err: any) {
            console.warn('Quota fetch notice:', err.message);
        } finally {
            setLoadingQuotas(false);
        }
    }, [isOwner]);

    // Fetch Grant History
    const fetchHistory = useCallback(async () => {
        try {
            setLoadingHistory(true);
            const res = await apiClient.get<any>('/api/store/grant-history');
            if (res.success && res.data) {
                setHistory(res.data.history || []);
            }
        } catch (err: any) {
            console.warn('Grant history load notice:', err.message);
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        fetchCatalog();
        fetchQuotas();
        fetchHistory();
    }, [fetchCatalog, fetchQuotas, fetchHistory]);

    // Lookup User by ID / Phone / Name
    const handleSearchUser = async (val: string) => {
        setUserQuery(val);
        if (!val.trim()) {
            setUserLookupResults([]);
            return;
        }
        try {
            setIsSearchingUser(true);
            const res = await apiClient.get<any>(`/api/store/user-lookup?query=${encodeURIComponent(val.trim())}`);
            if (res.success && res.data) {
                setUserLookupResults(res.data.users || []);
            }
        } catch {
            setUserLookupResults([]);
        } finally {
            setIsSearchingUser(false);
        }
    };

    // Lookup Operators (for Owner)
    const handleSearchOperators = async (val: string) => {
        setOperatorSearchQuery(val);
        if (!val.trim()) {
            setOperatorLookupResults([]);
            return;
        }
        try {
            const res = await apiClient.get<any>(`/api/store/user-lookup?query=${encodeURIComponent(val.trim())}`);
            if (res.success && res.data) {
                // Filter users with operator or admin roles
                const ops = (res.data.users || []).filter((u: any) =>
                    ['operator', 'superadmin', 'super-admin', 'admin'].includes(String(u.role).toLowerCase())
                );
                setOperatorLookupResults(ops);
            }
        } catch {
            setOperatorLookupResults([]);
        }
    };

    // Select Target User
    const handleSelectUser = (user: TargetUser) => {
        setSelectedUser(user);
        setUserQuery(String(user.userId || user._id));
        setUserLookupResults([]);
    };

    // Select Asset from Catalog
    const handleSelectAsset = (asset: AssetOption) => {
        setSelectedAsset(asset);
        setDirectUniqueIdInput(asset.uniqueId || '');
        setSelectedQuota(null);

        // If Operator has quota for this asset, match it
        if (!isOwner) {
            const matched = quotas.find(q =>
                q.assetName.toLowerCase() === asset.name.toLowerCase()
            );
            if (matched) {
                setSelectedQuota(matched);
                const firstAvailable = (matched.availablePackages || matched.packages || []).find(p => p.remainingQuantity > 0);
                if (firstAvailable) {
                    setDurationDays(firstAvailable.days);
                    setCustomDaysInput(String(firstAvailable.days));
                }
            }
        }
    };

    // Select Asset from Operator Quota
    const handleSelectQuota = (quota: OperatorQuota) => {
        setSelectedQuota(quota);
        const matchingAsset = assets.find(a => a.name.toLowerCase() === quota.assetName.toLowerCase());
        if (matchingAsset) {
            setSelectedAsset(matchingAsset);
            setDirectUniqueIdInput(matchingAsset.uniqueId || '');
        } else {
            setSelectedAsset({
                _id: quota._id,
                uniqueId: '',
                name: quota.assetName,
                category: quota.assetCategory,
                imageUrl: quota.imageUrl
            });
        }

        const validPackages = quota.availablePackages || quota.packages.filter(p => p.remainingQuantity > 0);
        if (validPackages.length > 0) {
            setDurationDays(validPackages[0].days);
            setCustomDaysInput(String(validPackages[0].days));
        }
    };

    // Filter Assets by Category & Search Query
    const filteredAssets = useMemo(() => {
        return assets.filter((asset) => {
            const matchesCat =
                selectedCategoryTab === 'All'
                    ? true
                    : selectedCategoryTab === 'Employee'
                        ? asset.isStaffOnly || asset.audience === 'employee'
                        : asset.category.toLowerCase().includes(selectedCategoryTab.toLowerCase());

            if (!matchesCat) return false;

            if (assetSearchQuery.trim()) {
                const q = assetSearchQuery.trim().toLowerCase();
                const matchesName = asset.name?.toLowerCase().includes(q);
                const matchesUnique = asset.uniqueId?.toLowerCase().includes(q);
                return matchesName || matchesUnique;
            }

            return true;
        });
    }, [assets, selectedCategoryTab, assetSearchQuery]);

    // Handle Preset Duration Click
    const handleDurationPreset = (days: number) => {
        setDurationDays(days);
        setCustomDaysInput(String(days));
    };

    // Add Tier row for Owner Allocation
    const handleAddTier = () => {
        setAllocationTiers(prev => [...prev, { days: 7, quantity: 1 }]);
    };

    // Remove Tier row
    const handleRemoveTier = (idx: number) => {
        setAllocationTiers(prev => prev.filter((_, i) => i !== idx));
    };

    // Update Tier row
    const handleUpdateTier = (idx: number, field: 'days' | 'quantity', val: number) => {
        setAllocationTiers(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
    };

    // Submit Stock Allocation (Owner -> Operator)
    const handleExecuteAllocation = async () => {
        if (!selectedOperator) {
            toast.error('Please select a target Operator');
            return;
        }
        if (!selectedAssetForAllocation) {
            toast.error('Please select an Asset to allocate');
            return;
        }
        if (allocationTiers.length === 0) {
            toast.error('Please add at least one duration package tier');
            return;
        }

        try {
            setAllocating(true);
            const payload = {
                operatorId: selectedOperator._id || selectedOperator.userId,
                assetQuery: selectedAssetForAllocation.name || selectedAssetForAllocation.uniqueId,
                packages: allocationTiers.map(t => ({
                    days: Number(t.days),
                    quantity: Math.max(1, Number(t.quantity))
                })),
                notes: allocationNotes.trim()
            };

            const res = await apiClient.post<any>('/api/admin/asset-quota/allocate', payload);
            if (res.success) {
                toast.success(res.message || 'Asset stock allocated successfully to Operator!');
                setSelectedOperator(null);
                setSelectedAssetForAllocation(null);
                setAllocationNotes('');
                fetchQuotas();
                setActiveTab('quotas');
            } else {
                toast.error(res.message || 'Allocation failed');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to allocate asset stock');
        } finally {
            setAllocating(false);
        }
    };

    // Delete Quota (Owner)
    const handleDeleteQuota = async (quotaId: string) => {
        if (!confirm('Are you sure you want to delete this operator asset quota?')) return;
        try {
            const res = await apiClient.delete<any>(`/api/admin/asset-quota/${quotaId}`);
            if (res.success) {
                toast.success('Quota removed successfully');
                fetchQuotas();
            } else {
                toast.error(res.message || 'Failed to remove quota');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to remove quota');
        }
    };

    // Execute Asset Grant (Supports both Owner direct grant and Operator quota grant)
    const handleExecuteGrant = async () => {
        if (!selectedUser && !userQuery.trim()) {
            toast.error('Please specify a target user (User ID, phone or email)');
            return;
        }
        if (!selectedAsset && !directUniqueIdInput.trim()) {
            toast.error('Please select an asset or enter a Unique Asset ID');
            return;
        }

        try {
            setSubmitting(true);
            const userIdentifier = selectedUser ? String(selectedUser.userId || selectedUser._id) : userQuery.trim();
            const assetIdentifier = selectedAsset ? (selectedAsset.uniqueId || selectedAsset.name || selectedAsset._id) : directUniqueIdInput.trim();

            const payload = {
                userQuery: userIdentifier,
                assetQuery: assetIdentifier,
                durationDays: Number(durationDays),
                message: customMessage.trim(),
                autoEquip,
            };

            // Use quota grant endpoint (works for both Operator and Owner)
            const res = await apiClient.post<any>('/api/admin/asset-quota/grant', payload);

            if (res.success) {
                toast.success(res.message || 'Asset granted successfully!');
                setConfirmModalOpen(false);
                setSelectedUser(null);
                setUserQuery('');
                setUserLookupResults([]);
                setSelectedAsset(null);
                setSelectedQuota(null);
                setDirectUniqueIdInput('');
                setCustomMessage('');
                fetchHistory();
                fetchQuotas();
                fetchCatalog();
            } else {
                toast.error(res.message || 'Failed to grant asset');
            }
        } catch (err: any) {
            toast.error(err.message || 'Error occurred while granting asset');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2.5 bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-amber-500/20 border border-purple-500/30 rounded-xl text-purple-400">
                            <Sparkles className="h-6 w-6 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                                    Asset Allocation & Granting
                                </h1>
                                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase text-[10px] tracking-wider">
                                    {isOwner ? '👑 Platform Owner Panel' : '⚡ Operator Console'}
                                </Badge>
                            </div>
                            <p className="text-slate-400 text-sm mt-0.5 font-medium">
                                {isOwner
                                    ? 'Allocate asset stock quotas to Operators with custom duration tiers, or directly grant assets to users.'
                                    : 'Grant exclusive Frames, Entry Effects, Badges and Tags to users using your allocated stock inventory.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { fetchCatalog(); fetchQuotas(); fetchHistory(); }}
                        className="flex items-center gap-2 border-slate-700 bg-slate-800/60 text-slate-300 hover:bg-slate-800"
                    >
                        <RefreshCw size={14} className={loadingAssets ? 'animate-spin' : ''} />
                        Refresh Data
                    </Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
                <Button
                    size="sm"
                    variant={activeTab === 'grant' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('grant')}
                    className={`gap-1.5 text-xs font-semibold ${activeTab === 'grant' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <Gift className="h-4 w-4" />
                    <span>Grant Asset to User</span>
                </Button>

                {isOwner && (
                    <>
                        <Button
                            size="sm"
                            variant={activeTab === 'allocate' ? 'default' : 'ghost'}
                            onClick={() => setActiveTab('allocate')}
                            className={`gap-1.5 text-xs font-semibold ${activeTab === 'allocate' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <Boxes className="h-4 w-4" />
                            <span>Allocate Stock to Operators (Owner)</span>
                        </Button>

                        <Button
                            size="sm"
                            variant={activeTab === 'quotas' ? 'default' : 'ghost'}
                            onClick={() => setActiveTab('quotas')}
                            className={`gap-1.5 text-xs font-semibold ${activeTab === 'quotas' ? 'bg-sky-600 hover:bg-sky-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <Layers className="h-4 w-4" />
                            <span>Operator Stock Ledger</span>
                        </Button>
                    </>
                )}

                <Button
                    size="sm"
                    variant={activeTab === 'history' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('history')}
                    className={`gap-1.5 text-xs font-semibold ${activeTab === 'history' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <Clock className="h-4 w-4" />
                    <span>Grant History & Logs</span>
                </Button>
            </div>

            {/* TAB 1: GRANT ASSET TO USER */}
            {activeTab === 'grant' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 7 Columns: Grant Action Engine */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Step 1: Target User Search */}
                        <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg">
                            <CardHeader className="pb-3 border-b border-slate-800/80">
                                <div className="flex items-center gap-2">
                                    <span className="h-6 w-6 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black text-xs flex items-center justify-center">1</span>
                                    <CardTitle className="text-base font-bold text-slate-100">Select Target User (Recipient)</CardTitle>
                                </div>
                                <CardDescription className="text-xs text-slate-400">
                                    Enter user numeric ID (e.g. 1000000086), Meethi ID, phone number or name.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search by User Numeric ID, Phone or Name..."
                                        value={userQuery}
                                        onChange={(e) => handleSearchUser(e.target.value)}
                                        className="pl-10 bg-slate-950/70 border-slate-700 text-slate-100 placeholder:text-slate-500"
                                    />
                                    {isSearchingUser && (
                                        <div className="absolute right-3.5 top-3.5">
                                            <RefreshCw size={14} className="animate-spin text-purple-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Search Dropdown Results */}
                                {userLookupResults.length > 0 && !selectedUser && (
                                    <div className="border border-slate-800 rounded-xl bg-slate-950 p-2 max-h-56 overflow-y-auto space-y-1.5 shadow-2xl">
                                        {userLookupResults.map((u) => (
                                            <div
                                                key={u._id}
                                                onClick={() => handleSelectUser(u)}
                                                className="p-2.5 rounded-lg hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors border border-transparent hover:border-purple-500/30"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center text-xs border border-purple-500/40">
                                                        {u.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                                                            {u.name}
                                                            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                                                                ID: {u.userId}
                                                            </span>
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            {u.phoneNumber || u.email || 'No contact'} • Role: <span className="capitalize text-purple-400 font-medium">{u.role}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-7 text-xs text-purple-400">
                                                    Select
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Selected User Card */}
                                {selectedUser && (
                                    <div className="p-3 bg-purple-950/30 border border-purple-500/40 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                                                {selectedUser.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-black text-sm text-purple-200 flex items-center gap-2">
                                                    {selectedUser.name}
                                                    <Badge className="bg-purple-500/20 text-purple-300 text-[10px]">
                                                        ID: {selectedUser.userId}
                                                    </Badge>
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {selectedUser.phoneNumber || selectedUser.email || 'N/A'} • Role: {selectedUser.role}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => { setSelectedUser(null); setUserQuery(''); }}
                                            className="text-slate-400 hover:text-red-400 h-8 w-8 p-0"
                                        >
                                            <X size={16} />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step 2: Select Asset */}
                        <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg">
                            <CardHeader className="pb-3 border-b border-slate-800/80">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="h-6 w-6 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black text-xs flex items-center justify-center">2</span>
                                        <CardTitle className="text-base font-bold text-slate-100">
                                            {isOwner ? 'Select Asset from Catalog' : 'Select Asset from My Quota'}
                                        </CardTitle>
                                    </div>
                                    {!isOwner && (
                                        <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                                            Allocated by Owner
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {/* Operator View: Available Quota Cards */}
                                {!isOwner && (
                                    <div className="space-y-3">
                                        <p className="text-xs text-slate-400 font-medium">
                                            Your Available Stock Quotas (click to select):
                                        </p>
                                        {quotas.length === 0 ? (
                                            <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-xl text-center space-y-2">
                                                <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
                                                <p className="text-xs text-slate-300 font-semibold">No Asset Stock Allocated Yet</p>
                                                <p className="text-[11px] text-slate-500">
                                                    You do not have any asset stock allocated by the Owner. Please contact the Platform Owner to allocate frames, badges, entry effects or tags to your inventory.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
                                                {quotas.map((q) => {
                                                    const isSelected = selectedQuota?._id === q._id;
                                                    const validPkgs = q.availablePackages || q.packages.filter(p => p.remainingQuantity > 0);

                                                    return (
                                                        <div
                                                            key={q._id}
                                                            onClick={() => handleSelectQuota(q)}
                                                            className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                                ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30'
                                                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'}`}
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="font-bold text-xs text-slate-100">{q.assetName}</span>
                                                                <Badge className="bg-purple-500/20 text-purple-300 text-[9px]">
                                                                    {q.assetCategory}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                                {validPkgs.map((p, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-mono font-bold"
                                                                    >
                                                                        {p.days}d: {p.remainingQuantity} left
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Owner View: Full Asset Catalog Grid */}
                                {isOwner && (
                                    <>
                                        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-800">
                                            {CATEGORY_TABS.map((cat) => (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    onClick={() => setSelectedCategoryTab(cat.value)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedCategoryTab === cat.value
                                                        ? 'bg-purple-600 text-white shadow-md'
                                                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                                                        }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                                            <Input
                                                placeholder="Search assets by name or unique ID..."
                                                value={assetSearchQuery}
                                                onChange={(e) => setAssetSearchQuery(e.target.value)}
                                                className="pl-9 h-8 text-xs bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
                                            {filteredAssets.map((asset) => {
                                                const isSelected = selectedAsset?._id === asset._id;
                                                return (
                                                    <div
                                                        key={asset._id}
                                                        onClick={() => handleSelectAsset(asset)}
                                                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${isSelected
                                                            ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/30'
                                                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between gap-1 mb-1.5">
                                                            <span className="font-bold text-xs text-slate-200 truncate">{asset.name}</span>
                                                            {isSelected && <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                                            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">
                                                                {asset.category}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}

                                {/* Selected Asset Summary */}
                                {selectedAsset && (
                                    <div className="p-3 bg-purple-950/30 border border-purple-500/40 rounded-xl flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-sm text-purple-200 flex items-center gap-2">
                                                {selectedAsset.name}
                                                <Badge className="bg-purple-500/20 text-purple-300 text-[10px]">
                                                    {selectedAsset.category}
                                                </Badge>
                                            </p>
                                            {selectedQuota && (
                                                <p className="text-xs text-emerald-400 font-medium mt-1">
                                                    Stock available from Operator Quota
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => { setSelectedAsset(null); setSelectedQuota(null); }}
                                            className="text-slate-400 hover:text-red-400 h-7 w-7 p-0"
                                        >
                                            <X size={15} />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step 3: Duration & Execution */}
                        <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg">
                            <CardHeader className="pb-3 border-b border-slate-800/80">
                                <div className="flex items-center gap-2">
                                    <span className="h-6 w-6 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black text-xs flex items-center justify-center">3</span>
                                    <CardTitle className="text-base font-bold text-slate-100">Validity Duration & Grant</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {/* If Operator with Quota: Show available duration pills */}
                                {!isOwner && selectedQuota ? (
                                    <div className="space-y-2">
                                        <p className="text-xs text-slate-400 font-medium">Select Duration from Your Allocated Stock:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(selectedQuota.availablePackages || selectedQuota.packages.filter(p => p.remainingQuantity > 0)).map((p, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => { setDurationDays(p.days); setCustomDaysInput(String(p.days)); }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${durationDays === p.days
                                                        ? 'bg-purple-600 text-white border-purple-500 ring-2 ring-purple-500/30'
                                                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'}`}
                                                >
                                                    {p.days} Days ({p.remainingQuantity} in stock)
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    /* Owner: Presets */
                                    <div className="space-y-2">
                                        <p className="text-xs text-slate-400 font-medium">Duration Presets:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {DURATION_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.days}
                                                    type="button"
                                                    onClick={() => handleDurationPreset(preset.days)}
                                                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${durationDays === preset.days
                                                        ? 'bg-purple-600 text-white border-purple-500 ring-2 ring-purple-500/30'
                                                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'}`}
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Auto-Equip Option */}
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="autoEquip"
                                        checked={autoEquip}
                                        onChange={(e) => setAutoEquip(e.target.checked)}
                                        className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                                    />
                                    <label htmlFor="autoEquip" className="text-xs text-slate-300 font-medium cursor-pointer">
                                        Automatically equip this asset on the user&apos;s active profile immediately
                                    </label>
                                </div>

                                {/* Custom Message */}
                                <div className="space-y-1">
                                    <label className="text-xs text-slate-400 font-medium">Custom In-App Notification Message (Optional):</label>
                                    <Input
                                        placeholder="e.g. Special reward from management for outstanding hosting!"
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        className="h-8 text-xs bg-slate-950 border-slate-800 text-slate-200"
                                    />
                                </div>

                                {/* Grant Trigger Button */}
                                <Button
                                    onClick={() => setConfirmModalOpen(true)}
                                    disabled={!selectedUser || (!selectedAsset && !directUniqueIdInput)}
                                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold h-11 text-sm shadow-xl shadow-purple-900/20 gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    <span>Grant Asset to User Now</span>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right 5 Columns: Live Preview Card */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg sticky top-6">
                            <CardHeader className="pb-3 border-b border-slate-800/80">
                                <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-amber-400" />
                                    <span>Live In-App Message Preview</span>
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-400">
                                    How the push notification will appear in the user&apos;s app inbox.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950 to-purple-950/20 border border-purple-500/30 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-lg">
                                            🎁
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-200">
                                                {selectedAsset?.name || 'Exclusive Reward'} Received!
                                            </p>
                                            <p className="text-[10px] text-slate-400">Official System Message • Just Now</p>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                                        {customMessage.trim() || `Congratulations! You have received ${selectedAsset?.name || 'an exclusive asset'} (${durationDays > 0 ? `${durationDays} Days` : 'Permanent Lifetime'}) from ${isOwner ? 'Platform Owner' : 'Operator'}. Tap View to equip in My Items.`}
                                    </p>

                                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500 font-mono">Status: Ready to deliver</span>
                                        <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">
                                            {durationDays > 0 ? `${durationDays} Days Validity` : 'Permanent'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* TAB 2: OWNER ALLOCATE STOCK TO OPERATORS */}
            {activeTab === 'allocate' && isOwner && (
                <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg">
                    <CardHeader className="border-b border-slate-800/80 pb-4">
                        <div className="flex items-center gap-2">
                            <Boxes className="h-5 w-5 text-amber-400" />
                            <CardTitle className="text-lg font-bold text-slate-100">
                                Allocate Asset Stock Quota to Operator
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-slate-400">
                            Distribute stock of Frames, Entry Effects, Badges, or Tags to Operators broken down by duration buckets (e.g. 5x Super Admin Frame: 1 for 30 days, 2 for 15 days, 2 for 7 days).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6 max-w-3xl">
                        {/* 1. Select Operator */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-200">1. Select Target Operator</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search Operator by Name, Numeric ID, or Phone..."
                                    value={operatorSearchQuery}
                                    onChange={(e) => handleSearchOperators(e.target.value)}
                                    className="pl-9 bg-slate-950 border-slate-800 text-slate-200 text-xs"
                                />
                            </div>

                            {/* Operator Results */}
                            {operatorLookupResults.length > 0 && !selectedOperator && (
                                <div className="border border-slate-800 rounded-xl bg-slate-950 p-2 max-h-48 overflow-y-auto space-y-1 shadow-2xl">
                                    {operatorLookupResults.map((op) => (
                                        <div
                                            key={op._id}
                                            onClick={() => { setSelectedOperator(op); setOperatorSearchQuery(op.name); setOperatorLookupResults([]); }}
                                            className="p-2 rounded-lg hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-200">{op.name}</span>
                                                <Badge className="bg-purple-500/20 text-purple-300 text-[10px]">
                                                    ID: {op.userId} • {op.role}
                                                </Badge>
                                            </div>
                                            <Button size="sm" variant="ghost" className="h-6 text-[10px] text-purple-400">
                                                Select
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedOperator && (
                                <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-xs text-amber-200 flex items-center gap-2">
                                            Operator: {selectedOperator.name}
                                            <Badge className="bg-amber-500/20 text-amber-300 text-[10px]">
                                                ID: {selectedOperator.userId}
                                            </Badge>
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => { setSelectedOperator(null); setOperatorSearchQuery(''); }}
                                        className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                                    >
                                        <X size={14} />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* 2. Select Asset */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-200">2. Select Asset to Allocate</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
                                {assets.map((a) => {
                                    const isSel = selectedAssetForAllocation?._id === a._id;
                                    return (
                                        <div
                                            key={a._id}
                                            onClick={() => setSelectedAssetForAllocation(a)}
                                            className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${isSel
                                                ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/30'
                                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'}`}
                                        >
                                            <p className="font-bold text-xs text-slate-200 truncate">{a.name}</p>
                                            <p className="text-[10px] text-slate-500">{a.category}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            {selectedAssetForAllocation && (
                                <div className="p-2.5 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-center justify-between">
                                    <span className="text-xs font-bold text-amber-200">
                                        Selected: {selectedAssetForAllocation.name} ({selectedAssetForAllocation.category})
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setSelectedAssetForAllocation(null)}
                                        className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                                    >
                                        <X size={14} />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* 3. Tiered Duration Packages */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-200">
                                    3. Configure Tiered Duration Packages
                                </label>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAddTier}
                                    className="h-7 text-xs border-slate-700 text-slate-300 gap-1"
                                >
                                    <Plus size={13} /> Add Tier
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {allocationTiers.map((tier, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-slate-400 block mb-1">Validity (Days)</label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={tier.days}
                                                onChange={(e) => handleUpdateTier(idx, 'days', Number(e.target.value))}
                                                className="h-8 text-xs bg-slate-900 border-slate-700 text-slate-200"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] text-slate-400 block mb-1">Quantity (Stock count)</label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={tier.quantity}
                                                onChange={(e) => handleUpdateTier(idx, 'quantity', Number(e.target.value))}
                                                className="h-8 text-xs bg-slate-900 border-slate-700 text-slate-200"
                                            />
                                        </div>
                                        <div className="pt-4">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleRemoveTier(idx)}
                                                disabled={allocationTiers.length === 1}
                                                className="h-8 w-8 p-0 text-slate-500 hover:text-red-400"
                                            >
                                                <Trash2 size={15} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-[11px] text-slate-500">
                                Total stock to allocate: <span className="font-bold text-amber-300">
                                    {allocationTiers.reduce((acc, t) => acc + (Number(t.quantity) || 0), 0)} items
                                </span>
                            </p>
                        </div>

                        {/* Notes */}
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-200">Notes / Reason (Optional)</label>
                            <Input
                                placeholder="e.g. Monthly promotional budget for Operator events"
                                value={allocationNotes}
                                onChange={(e) => setAllocationNotes(e.target.value)}
                                className="h-8 text-xs bg-slate-950 border-slate-800 text-slate-200"
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            onClick={handleExecuteAllocation}
                            disabled={allocating || !selectedOperator || !selectedAssetForAllocation}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-11 text-sm shadow-xl shadow-amber-900/20 gap-2"
                        >
                            {allocating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Boxes className="h-4 w-4" />}
                            <span>Allocate Stock to Operator</span>
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* TAB 3: OWNER OPERATOR STOCK LEDGER */}
            {activeTab === 'quotas' && isOwner && (
                <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg">
                    <CardHeader className="border-b border-slate-800/80 pb-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-bold text-slate-100">Operator Stock Quotas Ledger</CardTitle>
                            <CardDescription className="text-xs text-slate-400">
                                Overview of all stock allocated to operators with remaining balances.
                            </CardDescription>
                        </div>
                        <Button size="sm" variant="outline" onClick={fetchQuotas} className="h-8 text-xs border-slate-700">
                            <RefreshCw size={13} className={loadingQuotas ? 'animate-spin' : ''} />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loadingQuotas ? (
                            <div className="py-12 text-center text-xs text-slate-500">Loading quotas...</div>
                        ) : quotas.length === 0 ? (
                            <div className="py-12 text-center text-xs text-slate-500">No operator quotas recorded yet</div>
                        ) : (
                            <Table className="text-xs">
                                <TableHeader className="bg-slate-950/60">
                                    <TableRow className="border-slate-800">
                                        <TableHead className="text-slate-400">Operator</TableHead>
                                        <TableHead className="text-slate-400">Asset Name</TableHead>
                                        <TableHead className="text-slate-400">Category</TableHead>
                                        <TableHead className="text-slate-400">Duration Packages (Allocated / Remaining)</TableHead>
                                        <TableHead className="text-slate-400 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-slate-800/60 text-slate-300">
                                    {quotas.map((q) => {
                                        const opName = typeof q.operatorId === 'object' ? (q.operatorId?.name || q.operatorName) : q.operatorName;
                                        return (
                                            <TableRow key={q._id} className="hover:bg-slate-800/40">
                                                <TableCell className="font-bold text-slate-200">
                                                    {opName}
                                                </TableCell>
                                                <TableCell className="font-semibold text-purple-300">
                                                    {q.assetName}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-slate-800 text-slate-300 text-[10px]">
                                                        {q.assetCategory}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {q.packages.map((pkg, i) => (
                                                            <span
                                                                key={i}
                                                                className={`px-2 py-0.5 rounded text-[10px] font-mono border ${pkg.remainingQuantity > 0
                                                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                                    : 'bg-red-500/20 text-red-300 border-red-500/30'}`}
                                                            >
                                                                {pkg.days}d: {pkg.remainingQuantity}/{pkg.allocatedQuantity} left
                                                            </span>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteQuota(q._id)}
                                                        className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                        title="Revoke Quota"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* TAB 4: DISTRIBUTION HISTORY */}
            {activeTab === 'history' && (
                <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg">
                    <CardHeader className="border-b border-slate-800/80 pb-4 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base font-bold text-slate-100">Reward Distribution Audit Log</CardTitle>
                            <CardDescription className="text-xs text-slate-400">
                                Complete timeline of all assets granted to users across the platform.
                            </CardDescription>
                        </div>
                        <Button size="sm" variant="outline" onClick={fetchHistory} className="h-8 text-xs border-slate-700">
                            <RefreshCw size={13} className={loadingHistory ? 'animate-spin' : ''} />
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loadingHistory ? (
                            <div className="py-12 text-center text-xs text-slate-500">Loading audit log...</div>
                        ) : history.length === 0 ? (
                            <div className="py-12 text-center text-xs text-slate-500">No grant records found</div>
                        ) : (
                            <Table className="text-xs">
                                <TableHeader className="bg-slate-950/60">
                                    <TableRow className="border-slate-800">
                                        <TableHead className="text-slate-400">Date & Time</TableHead>
                                        <TableHead className="text-slate-400">Asset</TableHead>
                                        <TableHead className="text-slate-400">Recipient</TableHead>
                                        <TableHead className="text-slate-400">Validity</TableHead>
                                        <TableHead className="text-slate-400">Granted By</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-slate-800/60 text-slate-300">
                                    {history.map((item) => (
                                        <TableRow key={item._id} className="hover:bg-slate-800/40">
                                            <TableCell className="text-slate-400 whitespace-nowrap">
                                                {new Date(item.createdAt).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="font-bold text-purple-300">
                                                {item.newValue?.assetName || 'Asset'}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-slate-200">
                                                    {item.newValue?.userName || item.target}
                                                </span>
                                                <span className="text-[10px] text-slate-500 ml-1.5 font-mono">
                                                    (ID: {item.newValue?.userNumericId || 'N/A'})
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px]">
                                                    {item.newValue?.durationDays ? `${item.newValue.durationDays} Days` : 'Permanent'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-400">
                                                {item.adminId?.name || 'Administrator'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Confirmation Dialog Before Grant */}
            <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-100">
                            <Sparkles className="h-5 w-5 text-amber-400" />
                            <span>Confirm Asset Grant</span>
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to grant this asset? The validity timer will start immediately and a system message will be delivered to the user.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2 text-sm">
                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                            <p className="text-xs text-slate-400">Target Recipient:</p>
                            <p className="font-bold text-slate-100">
                                {selectedUser ? `${selectedUser.name} (User ID: ${selectedUser.userId})` : userQuery}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                            <p className="text-xs text-slate-400">Asset to Grant:</p>
                            <p className="font-bold text-purple-300">
                                {selectedAsset ? `${selectedAsset.name} (Category: ${selectedAsset.category})` : `Asset ID: ${directUniqueIdInput}`}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                            <p className="text-xs text-slate-400">Validity & Auto-Equip:</p>
                            <p className="font-bold text-amber-400">
                                {durationDays > 0 ? `${durationDays} Days` : 'Permanent Lifetime'} • {autoEquip ? 'Auto-Equip Enabled' : 'Leave in Inventory'}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setConfirmModalOpen(false)} disabled={submitting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleExecuteGrant}
                            disabled={submitting}
                            className="bg-purple-600 hover:bg-purple-700 font-bold flex items-center gap-2"
                        >
                            {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                            Confirm & Send Grant
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
