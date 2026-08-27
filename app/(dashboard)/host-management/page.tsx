'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/Table";
import {
    Video, Search, ShieldCheck, Users, Gem,
    ChevronLeft, ChevronRight, X, Loader2, RefreshCw,
    TrendingUp, Award, AlertTriangle, CheckCircle2, XCircle, Phone, Gift
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { ImageZoomModal } from '@/components/ui/ImageZoomModal';
import { getAdminAvatar } from '@/lib/avatar';

interface HostUser {
    _id: string;
    userId: number;
    name: string;
    image?: string;
    phoneNumber?: string;
    email?: string;
    gender?: string;
    level?: number;
    coins?: number;
    diamonds?: number;
    isBlocked?: boolean;
    isOnline?: boolean;
    isActive?: boolean;
    faceVerificationStatus?: string;
    kycVerificationStatus?: string;
    country?: { name?: string; code?: string };
    language?: string[];
    agencyId?: string;
    agencyName?: string | null;
    callCoinsReceived?: number;
    giftCoinsReceived?: number;
    totalCoinsReceived?: number;
    callDiamondsEarned?: number;
    giftDiamondsEarned?: number;
    totalDiamondsEarned?: number;
    createdAt?: string;
}

const LEVEL_PALETTE: Record<number, { bg: string; text: string; border: string }> = {
    1: { bg: 'bg-slate-500/20',   text: 'text-slate-300',   border: 'border-slate-500/40'  },
    2: { bg: 'bg-blue-500/20',    text: 'text-blue-300',    border: 'border-blue-500/40'   },
    3: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40'},
    4: { bg: 'bg-violet-500/20',  text: 'text-violet-300',  border: 'border-violet-500/40' },
    5: { bg: 'bg-amber-500/20',   text: 'text-amber-300',   border: 'border-amber-500/40'  },
    6: { bg: 'bg-pink-500/20',    text: 'text-pink-300',    border: 'border-pink-500/40'   },
    7: { bg: 'bg-rose-500/20',    text: 'text-rose-300',    border: 'border-rose-500/40'   },
    8: { bg: 'bg-orange-500/20',  text: 'text-orange-300',  border: 'border-orange-500/40' },
};

const getLvlStyle = (lvl: number) => LEVEL_PALETTE[lvl] || LEVEL_PALETTE[1];

export default function HostManagementPage() {
    const [hosts, setHosts] = useState<HostUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [maxLevel, setMaxLevel] = useState(8);
    const limit = 20;

    // Level modal
    const [levelHost, setLevelHost] = useState<HostUser | null>(null);
    const [newLevel, setNewLevel] = useState<number>(1);
    const [levelLoading, setLevelLoading] = useState(false);
    const [previewData, setPreviewData] = useState<{ url: string; title: string } | null>(null);

    const fetchHosts = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { page, limit };
            if (search) params.search = search;
            const res = await apiClient.get('/api/admin/hosts/users', params);
            if (res.success && res.data) {
                setHosts(res.data.data || []);
                setTotal(res.data.total || 0);
                if (res.data.maxLevel) setMaxLevel(res.data.maxLevel);
            } else {
                toast.error(res.message || 'Failed to load hosts');
                setHosts([]);
            }
        } catch (err: any) {
            toast.error('Failed to load hosts: ' + (err?.message || 'Unknown'));
            setHosts([]);
        } finally {
            setLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchHosts(); }, [fetchHosts]);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const toggleVerification = async (host: HostUser, type: 'face' | 'kyc', targetStatus: string) => {
        try {
            const payload = type === 'face'
                ? { faceVerificationStatus: targetStatus }
                : { kycVerificationStatus: targetStatus };

            const res = await apiClient.patch(`/api/user/${host.userId}`, payload);
            if (res.success) {
                const label = type === 'face' ? 'Face Verification' : 'KYC Verification';
                const statusText = targetStatus === 'APPROVED' ? 'Active' : 'Inactive';
                toast.success(`✅ ${label} set to ${statusText} for ${host.name}`);
                setHosts(prev => prev.map(h => h.userId === host.userId ? {
                    ...h,
                    ...(type === 'face' ? { faceVerificationStatus: targetStatus } : { kycVerificationStatus: targetStatus })
                } : h));
            } else {
                toast.error(res.message || 'Failed to update verification status');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error updating verification');
        }
    };

    const openLevel = (host: HostUser) => {
        setLevelHost(host);
        setNewLevel(host.level || 1);
    };

    const saveLevel = async () => {
        if (!levelHost) return;
        setLevelLoading(true);
        try {
            const res = await apiClient.patch(`/api/user/${levelHost.userId}`, { level: newLevel });
            if (res.success) {
                toast.success(`✅ Level ${newLevel} saved for ${levelHost.name}`);
                setHosts(prev => prev.map(h => h.userId === levelHost.userId ? { ...h, level: newLevel } : h));
                setLevelHost(null);
            } else {
                toast.error(res.message || 'Failed to update level');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error');
        } finally {
            setLevelLoading(false);
        }
    };

    const totalPages = Math.ceil(total / limit);
    const activeCount = hosts.filter(h => !h.isBlocked && h.isActive).length;
    const totalDiamonds = hosts.reduce((s, h) => s + (h.totalDiamondsEarned || 0), 0);
    const totalCoins = hosts.reduce((s, h) => s + (h.totalCoinsReceived || 0), 0);

    // Build level options dynamically up to maxLevel
    const levelOptions = Array.from({ length: maxLevel }, (_, i) => i + 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                        Host Management
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        All hosts — agency, levels (1–{maxLevel}), coins received, diamonds earned
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchHosts} className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">Total Hosts</CardTitle>
                        <Users className="h-4 w-4 text-violet-400" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-slate-100">{total}</div></CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">Active (page)</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-emerald-400">{activeCount}</div></CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">Coins Received (page)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-yellow-300">{totalCoins.toLocaleString()}</div></CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">Diamonds Earned (page)</CardTitle>
                        <Gem className="h-4 w-4 text-pink-400" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-pink-400">{totalDiamonds.toLocaleString()}</div></CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, phone, email..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <span className="text-sm text-muted-foreground">{loading ? 'Loading...' : `${total} total hosts`}</span>
            </div>

            {/* Table */}
            <Card className="glass-card overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-700/50">
                                    <TableHead className="text-slate-300 font-bold w-10">Sr.</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Agency</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Photo</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Host Name</TableHead>
                                    <TableHead className="text-slate-300 font-bold">UID</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Gender</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Reg Date</TableHead>
                                    {/* Coin Receiving */}
                                    <TableHead className="text-slate-300 font-bold">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-yellow-300">🪙 Call Coins</span>
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-300 font-bold">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-pink-300">🎁 Gift Coins</span>
                                        </div>
                                    </TableHead>
                                    {/* Diamond Earning */}
                                    <TableHead className="text-slate-300 font-bold">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-blue-300">💎 Call Diamonds</span>
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-300 font-bold">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-violet-300">💎 Gift Diamonds</span>
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-300 font-bold">Level</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Online</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Status</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Face Verification</TableHead>
                                    <TableHead className="text-slate-300 font-bold">KYC Verification</TableHead>
                                    <TableHead className="text-slate-300 font-bold text-center">Change Level</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={17} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                                <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                                                <span>Loading hosts...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : hosts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={17} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                                <AlertTriangle className="h-8 w-8 text-amber-400" />
                                                <span>No hosts found{search ? ` for "${search}"` : ''}</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : hosts.map((host, index) => {
                                    const lvl = host.level || 1;
                                    const ls = getLvlStyle(lvl);
                                    return (
                                        <TableRow key={host._id} className="hover:bg-slate-800/40 border-slate-700/30">
                                            {/* Sr. */}
                                            <TableCell className="text-slate-500 font-mono text-xs">
                                                {(page - 1) * limit + index + 1}
                                            </TableCell>

                                            {/* Agency */}
                                            <TableCell>
                                                {host.agencyName ? (
                                                    <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-medium">
                                                        {host.agencyName}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-600">—</span>
                                                )}
                                            </TableCell>

                                            {/* Photo */}
                                            <TableCell>
                                                <div className="relative w-10 h-10">
                                                    <img src={getAdminAvatar(host, 'female')} alt={host.name}
                                                        className="h-10 w-10 rounded-full object-cover ring-2 ring-violet-500/30 cursor-pointer hover:scale-110 transition-all"
                                                        title="Click to view & zoom photo"
                                                        onClick={() => setPreviewData({ url: getAdminAvatar(host, 'female'), title: `Host Photo - ${host.name} (#${host.userId})` })} />
                                                    {host.isOnline && (
                                                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Name */}
                                            <TableCell>
                                                <div>
                                                    <p className="font-semibold text-slate-200 text-sm">{host.name}</p>
                                                    <p className="text-xs text-slate-500">{host.phoneNumber || host.email || '—'}</p>
                                                </div>
                                            </TableCell>

                                            {/* UID */}
                                            <TableCell>
                                                <span className="font-mono text-xs text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded">
                                                    #{host.userId}
                                                </span>
                                            </TableCell>

                                            {/* Gender */}
                                            <TableCell>
                                                <Badge variant={host.gender === 'female' ? 'default' : 'secondary'} className="text-xs capitalize">
                                                    {host.gender || '—'}
                                                </Badge>
                                            </TableCell>

                                            {/* Reg Date */}
                                            <TableCell className="text-xs text-slate-400 whitespace-nowrap">
                                                {host.createdAt ? new Date(host.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                            </TableCell>

                                            {/* Call Coins Received */}
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3 text-yellow-400" />
                                                    <span className="text-sm font-semibold text-yellow-300">{(host.callCoinsReceived || 0).toLocaleString()}</span>
                                                </div>
                                            </TableCell>

                                            {/* Gift Coins Received */}
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Gift className="h-3 w-3 text-pink-400" />
                                                    <span className="text-sm font-semibold text-pink-300">{(host.giftCoinsReceived || 0).toLocaleString()}</span>
                                                </div>
                                            </TableCell>

                                            {/* Call Diamonds */}
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3 text-blue-400" />
                                                    <Gem className="h-3 w-3 text-blue-400" />
                                                    <span className="text-sm font-semibold text-blue-300">{(host.callDiamondsEarned || 0).toLocaleString()}</span>
                                                </div>
                                            </TableCell>

                                            {/* Gift Diamonds */}
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Gift className="h-3 w-3 text-violet-400" />
                                                    <Gem className="h-3 w-3 text-violet-400" />
                                                    <span className="text-sm font-semibold text-violet-300">{(host.giftDiamondsEarned || 0).toLocaleString()}</span>
                                                </div>
                                            </TableCell>

                                            {/* Level */}
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${ls.bg} ${ls.text} ${ls.border}`}>
                                                    <Award className="h-3 w-3" /> Lv.{lvl}
                                                </span>
                                            </TableCell>

                                            {/* Online */}
                                            <TableCell className="text-center">
                                                {host.isOnline
                                                    ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                                                    : <XCircle className="h-4 w-4 text-slate-600 mx-auto" />}
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                {host.isBlocked
                                                    ? <Badge variant="destructive" className="text-xs">Blocked</Badge>
                                                    : host.isActive
                                                        ? <Badge variant="success" className="text-xs">Active</Badge>
                                                        : <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                                            </TableCell>

                                            {/* Face Verification */}
                                            <TableCell>
                                                <button
                                                    onClick={() => toggleVerification(host, 'face', host.faceVerificationStatus === 'APPROVED' ? 'NOT_SUBMITTED' : 'APPROVED')}
                                                    className="transition-transform active:scale-95 text-left"
                                                    title="Click to toggle Face Verification Active/Inactive"
                                                >
                                                    {host.faceVerificationStatus === 'APPROVED' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all shadow-sm">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200 transition-all">
                                                            <XCircle className="h-3.5 w-3.5 text-slate-500" /> Inactive
                                                        </span>
                                                    )}
                                                </button>
                                            </TableCell>

                                            {/* KYC Verification */}
                                            <TableCell>
                                                <button
                                                    onClick={() => toggleVerification(host, 'kyc', host.kycVerificationStatus === 'APPROVED' ? 'NOT_SUBMITTED' : 'APPROVED')}
                                                    className="transition-transform active:scale-95 text-left"
                                                    title="Click to toggle KYC Verification Active/Inactive"
                                                >
                                                    {host.kycVerificationStatus === 'APPROVED' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all shadow-sm">
                                                            <CheckCircle2 className="h-3.5 w-3.5" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800/80 text-slate-400 border border-slate-700 hover:border-slate-500 hover:text-slate-200 transition-all">
                                                            <XCircle className="h-3.5 w-3.5 text-slate-500" /> Inactive
                                                        </span>
                                                    )}
                                                </button>
                                            </TableCell>

                                            {/* Change Level */}
                                            <TableCell className="text-center">
                                                <Button size="sm" variant="outline"
                                                    className="h-7 px-3 text-xs gap-1.5 text-violet-300 border-violet-500/30 hover:bg-violet-500/10"
                                                    onClick={() => openLevel(host)}>
                                                    <TrendingUp className="h-3 w-3" /> Change
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Page {page} of {totalPages} — {total} hosts</span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="gap-1">
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </Button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                            return (
                                <Button key={p} variant={p === page ? 'default' : 'outline'} size="sm"
                                    className="h-8 w-8 p-0" onClick={() => setPage(p)}>{p}</Button>
                            );
                        })}
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="gap-1">
                            Next <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Level Change Modal */}
            {levelHost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-100">Change Host Level</h3>
                                <p className="text-sm text-slate-400 mt-0.5">{levelHost.name} · #{levelHost.userId}</p>
                            </div>
                            <button onClick={() => setLevelHost(null)}
                                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Host Card */}
                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            {levelHost.image ? (
                                <img src={levelHost.image} alt={levelHost.name}
                                    className="h-12 w-12 rounded-full object-cover ring-2 ring-violet-500/30" />
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                    {levelHost.name?.charAt(0)?.toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="font-semibold text-slate-200">{levelHost.name}</p>
                                <p className="text-sm text-slate-400">
                                    Current: <span className={`font-bold ${getLvlStyle(levelHost.level || 1).text}`}>Lv.{levelHost.level || 1}</span>
                                    {' → '}
                                    New: <span className={`font-bold ${getLvlStyle(newLevel).text}`}>Lv.{newLevel}</span>
                                </p>
                            </div>
                        </div>

                        {/* Dynamic level grid — all levels up to maxLevel */}
                        <div>
                            <label className="text-sm font-semibold text-slate-300 mb-2 block">
                                Select Level <span className="text-slate-500 font-normal">(1 – {maxLevel})</span>
                            </label>
                            <div className="grid grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                                {levelOptions.map(lvl => {
                                    const ls = getLvlStyle(lvl);
                                    const active = newLevel === lvl;
                                    return (
                                        <button key={lvl} onClick={() => setNewLevel(lvl)}
                                            className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-2 font-bold text-sm transition-all
                                                ${active ? `${ls.bg} ${ls.text} ${ls.border} scale-105 shadow-lg` : 'border-slate-700 bg-slate-800/40 text-slate-500 hover:border-slate-500'}`}>
                                            <Award className="h-4 w-4 mb-0.5" />
                                            {lvl}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setLevelHost(null)}>Cancel</Button>
                            <Button
                                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                                onClick={saveLevel}
                                disabled={levelLoading || newLevel === (levelHost.level || 1)}
                            >
                                {levelLoading
                                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</>
                                    : <><Video className="h-4 w-4 mr-2" />Save Lv.{newLevel}</>}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Zoom Preview Modal */}
            {previewData && (
                <ImageZoomModal
                    imageUrl={previewData.url}
                    title={previewData.title}
                    onClose={() => setPreviewData(null)}
                />
            )}
        </div>
    );
}
