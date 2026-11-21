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
    Boxes,
    ShoppingBag
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
        grants?: any[];
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

// Multi-Grant Cart Item
interface GrantCartItem {
    id: string; // unique key
    asset: AssetOption;
    quota?: OperatorQuota;
    durationDays: number;
    autoEquip: boolean;
}

// Multi-Asset Allocation Batch Item (Owner -> Operator)
interface AllocationBatchItem {
    id: string;
    asset: AssetOption;
    tiers: Array<{ days: number; quantity: number }>;
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

    // User Search State
    const [userQuery, setUserQuery] = useState('');
    const [userLookupResults, setUserLookupResults] = useState<TargetUser[]>([]);
    const [selectedUser, setSelectedUser] = useState<TargetUser | null>(null);
    const [isSearchingUser, setIsSearchingUser] = useState(false);

    // MULTI-GRANT CART (Multi Gift to User)
    const [grantCart, setGrantCart] = useState<GrantCartItem[]>([]);
    const [customMessage, setCustomMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    // History
    const [history, setHistory] = useState<GrantHistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // OWNER MULTI-ASSET ALLOCATION BATCH STATE (Owner -> Operator)
    const [operatorSearchQuery, setOperatorSearchQuery] = useState('');
    const [operatorLookupResults, setOperatorLookupResults] = useState<any[]>([]);
    const [selectedOperator, setSelectedOperator] = useState<any | null>(null);
    const [allocationBatch, setAllocationBatch] = useState<AllocationBatchItem[]>([]);
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

    // Add Asset to Grant Cart (Multi-Gift Support!)
    const handleToggleAssetInGrantCart = (asset: AssetOption, quota?: OperatorQuota) => {
        const existingIdx = grantCart.findIndex(item => item.asset._id === asset._id);
        if (existingIdx >= 0) {
            // Remove from cart
            setGrantCart(prev => prev.filter((_, i) => i !== existingIdx));
            return;
        }

        // Determine default duration
        let defaultDuration = 30;
        if (!isOwner && quota) {
            const validPkgs = quota.availablePackages || quota.packages.filter(p => p.remainingQuantity > 0);
            if (validPkgs.length > 0) defaultDuration = validPkgs[0].days;
        }

        setGrantCart(prev => [
            ...prev,
            {
                id: `${asset._id}-${Date.now()}`,
                asset,
                quota,
                durationDays: defaultDuration,
                autoEquip: true,
            }
        ]);
    };

    // Update duration or autoEquip for a specific cart item
    const handleUpdateCartItem = (id: string, field: 'durationDays' | 'autoEquip', val: any) => {
        setGrantCart(prev => prev.map(item => item.id === id ? { ...item, [field]: val } : item));
    };

    // Remove from Grant Cart
    const handleRemoveCartItem = (id: string) => {
        setGrantCart(prev => prev.filter(item => item.id !== id));
    };

    // Add Asset to Owner Allocation Batch (Multi-Asset Allocation!)
    const handleAddAssetToAllocationBatch = (asset: AssetOption) => {
        if (allocationBatch.some(b => b.asset._id === asset._id)) {
            toast.info(`"${asset.name}" is already in the allocation batch`);
            return;
        }
        setAllocationBatch(prev => [
            ...prev,
            {
                id: `${asset._id}-${Date.now()}`,
                asset,
                tiers: [
                    { days: 30, quantity: 1 },
                    { days: 15, quantity: 2 },
                    { days: 7, quantity: 2 },
                ]
            }
        ]);
    };

    // Remove Asset from Allocation Batch
    const handleRemoveAssetFromAllocationBatch = (batchId: string) => {
        setAllocationBatch(prev => prev.filter(b => b.id !== batchId));
    };

    // Update Tiers for a Batch Item
    const handleAddTierToBatchItem = (batchId: string) => {
        setAllocationBatch(prev => prev.map(b => {
            if (b.id !== batchId) return b;
            return {
                ...b,
                tiers: [...b.tiers, { days: 7, quantity: 1 }]
            };
        }));
    };

    const handleRemoveTierFromBatchItem = (batchId: string, tierIdx: number) => {
        setAllocationBatch(prev => prev.map(b => {
            if (b.id !== batchId) return b;
            return {
                ...b,
                tiers: b.tiers.filter((_, i) => i !== tierIdx)
            };
        }));
    };

    const handleUpdateTierInBatchItem = (batchId: string, tierIdx: number, field: 'days' | 'quantity', val: number) => {
        setAllocationBatch(prev => prev.map(b => {
            if (b.id !== batchId) return b;
            return {
                ...b,
                tiers: b.tiers.map((t, i) => i === tierIdx ? { ...t, [field]: val } : t)
            };
        }));
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

    // Submit Multi-Asset Stock Allocation (Owner -> Operator)
    const handleExecuteAllocation = async () => {
        if (!selectedOperator) {
            toast.error('Please select a target Operator');
            return;
        }
        if (allocationBatch.length === 0) {
            toast.error('Please add at least one asset to the allocation batch');
            return;
        }

        try {
            setAllocating(true);
            const allocationsPayload = allocationBatch.map(item => ({
                assetQuery: item.asset.name || item.asset.uniqueId,
                packages: item.tiers.map(t => ({
                    days: Number(t.days),
                    quantity: Math.max(1, Number(t.quantity))
                }))
            }));

            const payload = {
                operatorId: selectedOperator._id || selectedOperator.userId,
                allocations: allocationsPayload,
                notes: allocationNotes.trim()
            };

            const res = await apiClient.post<any>('/api/admin/asset-quota/allocate', payload);
            if (res.success) {
                toast.success(res.message || 'All selected assets allocated successfully to Operator!');
                setSelectedOperator(null);
                setAllocationBatch([]);
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

    // Execute Multi-Gift Asset Grant (Supports both Owner direct grant and Operator quota grant)
    const handleExecuteGrant = async () => {
        if (!selectedUser && !userQuery.trim()) {
            toast.error('Please specify a target user (User ID, phone or email)');
            return;
        }
        if (grantCart.length === 0) {
            toast.error('Please select at least one gift/asset to grant');
            return;
        }

        try {
            setSubmitting(true);
            const userIdentifier = selectedUser ? String(selectedUser.userId || selectedUser._id) : userQuery.trim();

            const grantsPayload = grantCart.map(item => ({
                assetQuery: item.asset.uniqueId || item.asset.name || item.asset._id,
                durationDays: Number(item.durationDays),
                autoEquip: item.autoEquip,
            }));

            const payload = {
                userQuery: userIdentifier,
                grants: grantsPayload,
                message: customMessage.trim(),
            };

            const res = await apiClient.post<any>('/api/admin/asset-quota/grant', payload);

            if (res.success) {
                toast.success(res.message || 'All gifts granted successfully!');
                setConfirmModalOpen(false);
                setSelectedUser(null);
                setUserQuery('');
                setUserLookupResults([]);
                setGrantCart([]);
                setCustomMessage('');
                fetchHistory();
                fetchQuotas();
                fetchCatalog();
            } else {
                toast.error(res.message || 'Failed to grant assets');
            }
        } catch (err: any) {
            toast.error(err.message || 'Error occurred while granting assets');
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
                                    Asset Allocation & Multi-Gift Granting
                                </h1>
                                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase text-[10px] tracking-wider">
                                    {isOwner ? '👑 Platform Owner Panel' : '⚡ Operator Console'}
                                </Badge>
                            </div>
                            <p className="text-slate-400 text-sm mt-0.5 font-medium">
                                {isOwner
                                    ? 'Allocate multi-gift batches to Operators with custom duration tiers, or directly grant multiple assets to users.'
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
                    <span>Grant Assets to User ({grantCart.length} Selected)</span>
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
                            <span>Allocate Stock to Operators (Owner) {allocationBatch.length > 0 && `(${allocationBatch.length})`}</span>
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

            {/* TAB 1: GRANT ASSET TO USER (Supports Multi-Gift Selection!) */}
            {activeTab === 'grant' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left 7 Columns: Selection Engine */}
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

                        {/* Step 2: Select Assets / Multi-Gifts */}
                        <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg">
                            <CardHeader className="pb-3 border-b border-slate-800/80">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="h-6 w-6 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black text-xs flex items-center justify-center">2</span>
                                        <CardTitle className="text-base font-bold text-slate-100">
                                            {isOwner ? 'Select Gifts / Assets (Multi-Select Allowed)' : 'Select Gifts from My Quota (Multi-Select)'}
                                        </CardTitle>
                                    </div>
                                    <Badge className="bg-purple-500/20 text-purple-300 text-[10px]">
                                        {grantCart.length} Selected in Cart
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {/* Operator View: Available Quota Cards */}
                                {!isOwner && (
                                    <div className="space-y-3">
                                        <p className="text-xs text-slate-400 font-medium">
                                            Click any asset to add / remove from your grant batch:
                                        </p>
                                        {quotas.length === 0 ? (
                                            <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-xl text-center space-y-2">
                                                <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
                                                <p className="text-xs text-slate-300 font-semibold">No Asset Stock Allocated Yet</p>
                                                <p className="text-[11px] text-slate-500">
                                                    You do not have any asset stock allocated by the Owner. Please contact the Platform Owner to allocate frames, badges, entry effects or tags.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
                                                {quotas.map((q) => {
                                                    const matchingAsset = assets.find(a => a.name.toLowerCase() === q.assetName.toLowerCase()) || {
                                                        _id: q._id,
                                                        uniqueId: '',
                                                        name: q.assetName,
                                                        category: q.assetCategory,
                                                        imageUrl: q.imageUrl
                                                    };
                                                    const isInCart = grantCart.some(item => item.asset.name.toLowerCase() === q.assetName.toLowerCase());
                                                    const validPkgs = q.availablePackages || q.packages.filter(p => p.remainingQuantity > 0);

                                                    return (
                                                        <div
                                                            key={q._id}
                                                            onClick={() => handleToggleAssetInGrantCart(matchingAsset as AssetOption, q)}
                                                            className={`p-3 rounded-xl border cursor-pointer transition-all ${isInCart
                                                                ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40'
                                                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'}`}
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                                                                    {isInCart && <Check className="h-3.5 w-3.5 text-purple-400" />}
                                                                    {q.assetName}
                                                                </span>
                                                                <Badge className="bg-purple-500/20 text-purple-300 text-[9px]">
                                                                    {q.assetCategory}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {validPkgs.map((p, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold"
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

                                {/* Owner View: Full Catalog Grid */}
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
                                                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'}`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>

                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                                            <Input
                                                placeholder="Search gifts/assets by name..."
                                                value={assetSearchQuery}
                                                onChange={(e) => setAssetSearchQuery(e.target.value)}
                                                className="pl-9 h-8 text-xs bg-slate-950 border-slate-800 text-slate-200"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
                                            {filteredAssets.map((asset) => {
                                                const isInCart = grantCart.some(item => item.asset._id === asset._id);
                                                return (
                                                    <div
                                                        key={asset._id}
                                                        onClick={() => handleToggleAssetInGrantCart(asset)}
                                                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${isInCart
                                                            ? 'bg-purple-950/50 border-purple-500 ring-2 ring-purple-500/40'
                                                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'}`}
                                                    >
                                                        <div className="flex items-center justify-between gap-1 mb-1">
                                                            <span className="font-bold text-xs text-slate-200 truncate">{asset.name}</span>
                                                            {isInCart && <Check className="h-3.5 w-3.5 text-purple-400 shrink-0" />}
                                                        </div>
                                                        <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 text-[10px] font-mono">
                                                            {asset.category}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Step 3: Configure Multi-Gift Batch Details */}
                        {grantCart.length > 0 && (
                            <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg">
                                <CardHeader className="pb-3 border-b border-slate-800/80">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-6 w-6 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black text-xs flex items-center justify-center">3</span>
                                            <CardTitle className="text-base font-bold text-slate-100">
                                                Selected Gifts to Grant ({grantCart.length})
                                            </CardTitle>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setGrantCart([])}
                                            className="text-slate-500 hover:text-red-400 text-xs h-7"
                                        >
                                            Clear Cart
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    <div className="space-y-2.5 max-h-72 overflow-y-auto p-1">
                                        {grantCart.map((item) => {
                                            const availablePkgs = item.quota
                                                ? (item.quota.availablePackages || item.quota.packages.filter(p => p.remainingQuantity > 0))
                                                : null;

                                            return (
                                                <div key={item.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-xs text-purple-300">{item.asset.name}</span>
                                                            <Badge className="bg-slate-800 text-slate-400 text-[9px]">{item.asset.category}</Badge>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleRemoveCartItem(item.id)}
                                                            className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
                                                        >
                                                            <X size={14} />
                                                        </Button>
                                                    </div>

                                                    {/* Duration selector */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[11px] text-slate-400">Duration:</span>
                                                        {availablePkgs ? (
                                                            // Operator choices restricted to quota
                                                            availablePkgs.map((p, pIdx) => (
                                                                <button
                                                                    key={pIdx}
                                                                    type="button"
                                                                    onClick={() => handleUpdateCartItem(item.id, 'durationDays', p.days)}
                                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${item.durationDays === p.days
                                                                        ? 'bg-purple-600 text-white border-purple-500'
                                                                        : 'bg-slate-900 text-slate-300 border-slate-700'}`}
                                                                >
                                                                    {p.days}d ({p.remainingQuantity} left)
                                                                </button>
                                                            ))
                                                        ) : (
                                                            // Owner presets
                                                            [7, 15, 30, 90, 0].map((d) => (
                                                                <button
                                                                    key={d}
                                                                    type="button"
                                                                    onClick={() => handleUpdateCartItem(item.id, 'durationDays', d)}
                                                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${item.durationDays === d
                                                                        ? 'bg-purple-600 text-white border-purple-500'
                                                                        : 'bg-slate-900 text-slate-300 border-slate-700'}`}
                                                                >
                                                                    {d > 0 ? `${d}d` : 'Permanent'}
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`autoEquip-${item.id}`}
                                                            checked={item.autoEquip}
                                                            onChange={(e) => handleUpdateCartItem(item.id, 'autoEquip', e.target.checked)}
                                                            className="rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                                                        />
                                                        <label htmlFor={`autoEquip-${item.id}`} className="text-[11px] text-slate-400 cursor-pointer">
                                                            Auto-equip on profile
                                                        </label>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Custom Message */}
                                    <div className="space-y-1 pt-2 border-t border-slate-800">
                                        <label className="text-xs text-slate-400 font-medium">Notification Message (Optional):</label>
                                        <Input
                                            placeholder="e.g. Special festive gift combo from management!"
                                            value={customMessage}
                                            onChange={(e) => setCustomMessage(e.target.value)}
                                            className="h-8 text-xs bg-slate-950 border-slate-800 text-slate-200"
                                        />
                                    </div>

                                    {/* Grant Button */}
                                    <Button
                                        onClick={() => setConfirmModalOpen(true)}
                                        disabled={!selectedUser || grantCart.length === 0}
                                        className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold h-11 text-sm shadow-xl shadow-purple-900/20 gap-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>Grant All {grantCart.length} Gifts to User Now</span>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right 5 Columns: Summary & Preview */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg sticky top-6">
                            <CardHeader className="pb-3 border-b border-slate-800/80">
                                <CardTitle className="text-sm font-bold text-slate-200 flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4 text-amber-400" />
                                    <span>Gift Grant Cart Summary</span>
                                </CardTitle>
                                <CardDescription className="text-xs text-slate-400">
                                    Review the gifts ready to be awarded to recipient.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-950 to-purple-950/20 border border-purple-500/30 space-y-3">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                                        <span className="text-xs text-slate-400">Recipient:</span>
                                        <span className="font-bold text-xs text-slate-200">
                                            {selectedUser ? `${selectedUser.name} (${selectedUser.userId})` : 'Not Selected'}
                                        </span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <span className="text-xs text-slate-400">Selected Gifts ({grantCart.length}):</span>
                                        {grantCart.length === 0 ? (
                                            <p className="text-xs text-slate-500 italic">No gifts selected yet. Click gifts from the catalog to add them.</p>
                                        ) : (
                                            <div className="space-y-1">
                                                {grantCart.map((c, i) => (
                                                    <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/60">
                                                        <span className="font-semibold text-purple-300 truncate">{c.asset.name}</span>
                                                        <span className="text-[10px] text-amber-400 font-bold">{c.durationDays > 0 ? `${c.durationDays}d` : 'Permanent'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* TAB 2: OWNER ALLOCATE MULTI-ASSET STOCK TO OPERATORS */}
            {activeTab === 'allocate' && isOwner && (
                <Card className="bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-lg">
                    <CardHeader className="border-b border-slate-800/80 pb-4">
                        <div className="flex items-center gap-2">
                            <Boxes className="h-5 w-5 text-amber-400" />
                            <CardTitle className="text-lg font-bold text-slate-100">
                                Allocate Multi-Gift Stock Quota to Operator
                            </CardTitle>
                        </div>
                        <CardDescription className="text-xs text-slate-400">
                            Allocate multiple assets simultaneously to Operators (e.g. 5x Super Admin Frame with 1x 30d, 2x 15d, 2x 7d + 3x Dragon Ride + 10x Badges in one single batch).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6 max-w-4xl">
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

                        {/* 2. Pick Assets to Add to Allocation Batch */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-200">
                                    2. Pick Assets to Allocate (Click to add to batch)
                                </label>
                                <span className="text-[11px] text-amber-400 font-bold">
                                    {allocationBatch.length} Asset Types in Batch
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                                {assets.map((a) => {
                                    const isAdded = allocationBatch.some(b => b.asset._id === a._id);
                                    return (
                                        <div
                                            key={a._id}
                                            onClick={() => handleAddAssetToAllocationBatch(a)}
                                            className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${isAdded
                                                ? 'bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/30'
                                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-xs text-slate-200 truncate">{a.name}</p>
                                                {isAdded && <Check className="h-3 w-3 text-amber-400" />}
                                            </div>
                                            <p className="text-[10px] text-slate-500">{a.category}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. Configure Tiers for Each Asset in Batch */}
                        {allocationBatch.length > 0 && (
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-200">
                                    3. Configure Tiered Duration Packages for Each Asset
                                </label>

                                <div className="space-y-4">
                                    {allocationBatch.map((batchItem) => (
                                        <div key={batchItem.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-sm text-amber-300">{batchItem.asset.name}</span>
                                                    <Badge className="bg-slate-800 text-slate-300 text-[10px]">{batchItem.asset.category}</Badge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleAddTierToBatchItem(batchItem.id)}
                                                        className="h-6 text-[10px] border-slate-700 text-slate-300 gap-1"
                                                    >
                                                        <Plus size={11} /> Add Tier
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleRemoveAssetFromAllocationBatch(batchItem.id)}
                                                        className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
                                                    >
                                                        <Trash2 size={13} />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Tier Rows */}
                                            <div className="space-y-2">
                                                {batchItem.tiers.map((tier, tIdx) => (
                                                    <div key={tIdx} className="flex items-center gap-3 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                                                        <div className="flex-1">
                                                            <label className="text-[9px] text-slate-400 block">Validity (Days)</label>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                value={tier.days}
                                                                onChange={(e) => handleUpdateTierInBatchItem(batchItem.id, tIdx, 'days', Number(e.target.value))}
                                                                className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-200"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[9px] text-slate-400 block">Quantity (Count)</label>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                value={tier.quantity}
                                                                onChange={(e) => handleUpdateTierInBatchItem(batchItem.id, tIdx, 'quantity', Number(e.target.value))}
                                                                className="h-7 text-xs bg-slate-950 border-slate-700 text-slate-200"
                                                            />
                                                        </div>
                                                        <div className="pt-3">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleRemoveTierFromBatchItem(batchItem.id, tIdx)}
                                                                disabled={batchItem.tiers.length === 1}
                                                                className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
                                                            >
                                                                <Trash2 size={12} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                            disabled={allocating || !selectedOperator || allocationBatch.length === 0}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold h-11 text-sm shadow-xl shadow-amber-900/20 gap-2"
                        >
                            {allocating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Boxes className="h-4 w-4" />}
                            <span>Allocate All {allocationBatch.length} Asset Types to Operator</span>
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
                                        <TableHead className="text-slate-400">Asset(s)</TableHead>
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
                                                {item.newValue?.assetName || (item.newValue?.grants?.map((g: any) => g.assetName).join(', ')) || 'Asset'}
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
                                                    {item.newValue?.durationDays ? `${item.newValue.durationDays} Days` : 'Multi / Configured'}
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
                            <span>Confirm Multi-Gift Grant</span>
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to grant these {grantCart.length} assets to the recipient?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2 text-sm">
                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                            <p className="text-xs text-slate-400">Target Recipient:</p>
                            <p className="font-bold text-slate-100">
                                {selectedUser ? `${selectedUser.name} (User ID: ${selectedUser.userId})` : userQuery}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                            <p className="text-xs text-slate-400">Gifts to Award ({grantCart.length}):</p>
                            <div className="space-y-1">
                                {grantCart.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                                        <span className="text-purple-300 font-semibold">{item.asset.name}</span>
                                        <span className="text-amber-400 font-mono">{item.durationDays > 0 ? `${item.durationDays}d` : 'Permanent'}</span>
                                    </div>
                                ))}
                            </div>
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
                            Confirm & Send {grantCart.length} Gifts
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
