'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/Table";
import {
    Shield, Search, RefreshCw, Eye, Trash2, Ban, CheckCircle, Lock,
    Key, DollarSign, Wallet, Layers, ChevronLeft, ChevronRight,
    Users, Briefcase, Mail, Phone, MapPin, X, Clock, HelpCircle,
    UserCheck, TrendingUp, AlertTriangle, UserX, Award, ShieldAlert,
    Loader2, User
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

interface AdminUser {
    _id: string;
    userId: number;
    name: string;
    email: string;
    phoneNumber?: string;
    image?: string;
    gender?: string;
    isBlocked: boolean;
    isDeleted: boolean;
    isActive: boolean;
    isOnline: boolean;
    lastOnline?: string;
    specialCode?: string;
    referralCode?: string;
    coins: number;
    diamonds: number;
    createdAt: string;
    country?: { name?: string; code?: string; flag?: string };
    state?: string;
    district?: string;
    parentOperator?: string;
    parentSuperAdmin?: string;
    wallet?: number;
    revenue?: number;
    commission?: number;
    loginHistory?: Array<{ date: string; device: string; browser: string; ip: string }>;
}

export default function AdminsPage() {
    const { user: currentUser } = useAuth();
    
    // State lists
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0, totalCoins: 0, totalDiamonds: 0 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Filters & Pagination
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Details drawer & nested tabs
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
    const [detailTab, setDetailTab] = useState<'overview' | 'organization' | 'statistics' | 'login' | 'audit'>('overview');
    
    // Reset password dialog state
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState('');

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/admin/admins', {
                search,
                status: statusFilter,
                page,
                limit: 15
            });
            if (res.success && res.data) {
                setAdmins(res.data.admins || []);
                setStats(res.data.stats || { total: 0, active: 0, suspended: 0, totalCoins: 0, totalDiamonds: 0 });
                setTotalPages(res.data.totalPages || 1);
            } else {
                toast.error(res.message || 'Failed to load Admins');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error fetching Admins list');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, page]);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    const handleToggleBlock = async (admin: AdminUser) => {
        setActionLoading(true);
        try {
            const res = await apiClient.patch(`/api/admin/admins/${admin._id}/toggle-block`);
            if (res.success) {
                toast.success(`Admin status updated successfully`);
                fetchAdmins();
                if (selectedAdmin?._id === admin._id) {
                    setSelectedAdmin(prev => prev ? { ...prev, isBlocked: !prev.isBlocked } : null);
                }
            } else {
                toast.error(res.message || 'Failed to update status');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error updating block status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteAdmin = async (admin: AdminUser) => {
        if (!confirm(`⚠️ Are you sure you want to delete Admin ${admin.name}? This will mark their profile as deleted.`)) return;
        setActionLoading(true);
        try {
            const res = await apiClient.delete(`/api/admin/admins/${admin._id}`);
            if (res.success) {
                toast.success('Admin deleted successfully');
                fetchAdmins();
                setSelectedAdmin(null);
            } else {
                toast.error(res.message || 'Failed to delete admin');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error deleting admin');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetPassword = async (admin: AdminUser) => {
        setActionLoading(true);
        try {
            const res = await apiClient.post(`/api/admin/admins/${admin._id}/reset-password`);
            if (res.success && res.data?.newPassword) {
                setGeneratedPassword(res.data.newPassword);
                setShowResetDialog(true);
            } else {
                toast.error(res.message || 'Failed to reset password');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error resetting password');
        } finally {
            setActionLoading(false);
        }
    };

    const isOwner = currentUser?.role === 'owner';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                        Admin List
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        View, manage, suspend, activate or delete registered admin accounts.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchAdmins} className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </div>

            {/* Dashboard Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="glass-card">
                    <CardHeader className="py-3"><CardTitle className="text-xs font-medium text-slate-400">Total Admins</CardTitle></CardHeader>
                    <CardContent className="pb-4"><div className="text-2xl font-black text-slate-100">{stats.total}</div></CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="py-3"><CardTitle className="text-xs font-medium text-slate-400">Active Admins</CardTitle></CardHeader>
                    <CardContent className="pb-4"><div className="text-2xl font-black text-emerald-400">{stats.active}</div></CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="py-3"><CardTitle className="text-xs font-medium text-slate-400">Suspended Admins</CardTitle></CardHeader>
                    <CardContent className="pb-4"><div className="text-2xl font-black text-red-400">{stats.suspended}</div></CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="py-3"><CardTitle className="text-xs font-medium text-slate-400">Total Wallet Coins</CardTitle></CardHeader>
                    <CardContent className="pb-4"><div className="text-2xl font-black text-amber-400">🪙 {stats.totalCoins.toLocaleString()}</div></CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="glass-card p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, email, mobile, UID..." 
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="pl-9"
                    />
                </div>
                <div className="w-full md:w-48">
                    <select 
                        className="w-full h-10 px-3 bg-slate-900 border border-slate-700/50 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="all">All Admins</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </Card>

            {/* Table */}
            <Card className="glass-card overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-700/50 text-xs">
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Admin Name</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">Active Agencies</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">New Agencies</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">Active Host</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">New Host</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Date Added</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">Action</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">Data (View Recruited Agencies)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                                <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                                                <span>Loading registered admins...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : admins.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                                <Users className="h-8 w-8 text-slate-600" />
                                                <span>No admins found</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : admins.map(admin => (
                                    <TableRow key={admin._id} className="hover:bg-slate-800/40 border-slate-700/30 text-xs">
                                        {/* 1. Admin Name */}
                                        <TableCell className="font-semibold text-slate-200 flex items-center gap-2 whitespace-nowrap">
                                            {admin.image ? (
                                                <img src={admin.image} alt="Profile" className="h-7 w-7 rounded-full object-cover ring-2 ring-violet-500/20" />
                                            ) : (
                                                <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                                                    <User className="h-4 w-4" />
                                                </div>
                                            )}
                                            <span>{admin.name}</span>
                                        </TableCell>

                                        {/* 2. Active Agencies */}
                                        <TableCell className="text-center font-semibold text-emerald-400 whitespace-nowrap">
                                            {(admin as any).activeAgenciesCount ?? 0}
                                        </TableCell>

                                        {/* 3. New Agencies */}
                                        <TableCell className="text-center font-semibold text-cyan-400 whitespace-nowrap">
                                            {(admin as any).newAgenciesCount ?? 0}
                                        </TableCell>

                                        {/* 4. Active Host */}
                                        <TableCell className="text-center font-semibold text-violet-400 whitespace-nowrap">
                                            {(admin as any).activeHostsCount ?? 0}
                                        </TableCell>

                                        {/* 5. New Host */}
                                        <TableCell className="text-center font-semibold text-pink-400 whitespace-nowrap">
                                            {(admin as any).newHostsCount ?? 0}
                                        </TableCell>

                                        {/* 6. Date Added */}
                                        <TableCell className="text-slate-400 whitespace-nowrap">
                                            {new Date(admin.createdAt).toLocaleDateString('en-IN')}
                                        </TableCell>

                                        {/* 7. Action */}
                                        <TableCell className="text-center whitespace-nowrap">
                                            <div className="flex gap-1.5 justify-center">
                                                <Link href={`/security/permissions?targetType=user&targetId=${admin._id}&name=${encodeURIComponent(admin.name)}`}>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        className="h-7 px-2 text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 gap-1"
                                                    >
                                                        <Key className="h-3 w-3" /> Permission
                                                    </Button>
                                                </Link>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => setSelectedAdmin(admin)}
                                                    className="h-7 px-2 text-xs border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                                                >
                                                    <Eye className="h-3.5 w-3.5" /> View
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleToggleBlock(admin)}
                                                    disabled={actionLoading}
                                                    className={`h-7 px-2 text-xs ${admin.isBlocked ? 'border-emerald-500/30 text-emerald-300' : 'border-amber-500/30 text-amber-300'}`}
                                                >
                                                    {admin.isBlocked ? 'Activate' : 'Block'}
                                                </Button>
                                            </div>
                                        </TableCell>

                                        {/* 8. Data (View Recruited Agencies) */}
                                        <TableCell className="text-center whitespace-nowrap">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => setSelectedAdmin(admin)}
                                                className="h-7 px-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                                            >
                                                View Recruited Agencies ({((admin as any).recruitedAgencies || []).length})
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                            Next <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Reset Password Success Dialog */}
            {showResetDialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl space-y-4">
                        <div className="flex items-center gap-2 text-yellow-400 font-bold text-base">
                            <Key className="h-5 w-5" />
                            Password Reset Success
                        </div>
                        <p className="text-sm text-slate-300">
                            The temporary password for this administrator account has been successfully reset.
                        </p>
                        <div className="p-3 bg-slate-950 border border-slate-800 rounded font-mono text-center text-lg text-emerald-400 font-bold select-all">
                            {generatedPassword}
                        </div>
                        <p className="text-[10px] text-slate-500">
                            Provide this generated credential securely to the system administrator. Re-login is required using the new password.
                        </p>
                        <Button className="w-full bg-violet-600 hover:bg-violet-700" onClick={() => setShowResetDialog(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            )}

            {/* Details Modal with Tabs */}
            {selectedAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {selectedAdmin.image ? (
                                    <img src={selectedAdmin.image} alt="Profile" className="h-12 w-12 rounded-full object-cover ring-2 ring-violet-500/30" />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-slate-850 flex items-center justify-center text-slate-400">
                                        <User className="h-6 w-6" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-bold text-slate-100">{selectedAdmin.name}</h3>
                                    <p className="text-xs text-slate-500">User ID: {selectedAdmin.userId} • {selectedAdmin.specialCode}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedAdmin(null)} className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Tabs Bar */}
                        <div className="flex bg-slate-800/40 p-1 gap-1 border-b border-slate-800 overflow-x-auto">
                            {[
                                { id: 'overview', label: 'Overview' },
                                { id: 'organization', label: 'Organization' },
                                { id: 'statistics', label: 'Statistics' },
                                { id: 'login', label: 'Login History' },
                                { id: 'audit', label: 'Audit Logs' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setDetailTab(tab.id as any)}
                                    className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                                        ${detailTab === tab.id ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Modal Tab Contents */}
                        <div className="flex-1 p-5 overflow-y-auto space-y-4">
                            {detailTab === 'overview' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Label className="text-slate-500 text-xs">Full Name</Label><p className="text-slate-200 font-semibold">{selectedAdmin.name}</p></div>
                                        <div><Label className="text-slate-500 text-xs">Email ID</Label><p className="text-slate-200 font-semibold">{selectedAdmin.email}</p></div>
                                        <div><Label className="text-slate-500 text-xs">Mobile Number</Label><p className="text-slate-200 font-semibold">{selectedAdmin.phoneNumber || '—'}</p></div>
                                        <div><Label className="text-slate-500 text-xs">Gender</Label><p className="text-slate-200 capitalize">{selectedAdmin.gender || '—'}</p></div>
                                    </div>
                                    <div className="bg-slate-800/25 p-3 rounded-lg border border-slate-800 space-y-2">
                                        <p className="text-xs text-slate-400 font-semibold uppercase">Address</p>
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div><span className="text-slate-500">Country:</span> <span className="text-slate-300">{selectedAdmin.country?.name || '—'}</span></div>
                                            <div><span className="text-slate-500">State:</span> <span className="text-slate-300">{selectedAdmin.state || '—'}</span></div>
                                            <div><span className="text-slate-500">District:</span> <span className="text-slate-300">{selectedAdmin.district || '—'}</span></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {detailTab === 'organization' && (
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div><Label className="text-slate-500 text-[10px]">Parent Operator ID</Label><p className="text-slate-200 font-mono mt-0.5">{selectedAdmin.parentOperator || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-[10px]">Parent Super Admin ID</Label><p className="text-slate-200 font-mono mt-0.5">{selectedAdmin.parentSuperAdmin || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-[10px]">Referral Code</Label><p className="text-slate-200 font-mono mt-0.5">{selectedAdmin.referralCode || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-[10px]">Joined Date</Label><p className="text-slate-200 mt-0.5">{new Date(selectedAdmin.createdAt).toLocaleDateString()}</p></div>
                                </div>
                            )}

                            {detailTab === 'statistics' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-800/30 border border-slate-800 rounded-lg">
                                        <Label className="text-slate-500 text-xs">Wallet Coins</Label>
                                        <p className="text-xl font-bold text-yellow-400 mt-1">🪙 {selectedAdmin.coins.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-slate-800/30 border border-slate-800 rounded-lg">
                                        <Label className="text-slate-500 text-xs">Wallet Diamonds</Label>
                                        <p className="text-xl font-bold text-pink-400 mt-1">💎 {selectedAdmin.diamonds.toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 bg-slate-800/30 border border-slate-800 rounded-lg">
                                        <Label className="text-slate-500 text-xs">Assigned Agencies</Label>
                                        <p className="text-xl font-bold text-violet-400 mt-1">0</p>
                                    </div>
                                    <div className="p-3 bg-slate-800/30 border border-slate-800 rounded-lg">
                                        <Label className="text-slate-500 text-xs">Revenue Contribution</Label>
                                        <p className="text-xl font-bold text-emerald-400 mt-1">$0.00</p>
                                    </div>
                                </div>
                            )}

                            {detailTab === 'login' && (
                                <div className="space-y-2">
                                    {selectedAdmin.loginHistory && selectedAdmin.loginHistory.map((hist, i) => (
                                        <div key={i} className="p-2.5 bg-slate-850 border border-slate-800 rounded text-xs flex justify-between">
                                            <div>
                                                <p className="text-slate-200 font-semibold">{hist.device} • {hist.browser}</p>
                                                <p className="text-slate-500 mt-0.5">IP: {hist.ip}</p>
                                            </div>
                                            <span className="text-slate-500">{new Date(hist.date).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {(!selectedAdmin.loginHistory || selectedAdmin.loginHistory.length === 0) && (
                                        <div className="text-center py-6 text-slate-500 text-xs">No recent login events recorded.</div>
                                    )}
                                </div>
                            )}

                            {detailTab === 'audit' && (
                                <div className="space-y-2.5 text-xs text-slate-400">
                                    <div className="p-2.5 bg-slate-800/20 border border-slate-800/40 rounded flex justify-between">
                                        <span>Account created and initialized</span>
                                        <span className="text-slate-500">{new Date(selectedAdmin.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions Footer */}
                        <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex flex-wrap gap-2.5">
                            <Button 
                                variant={selectedAdmin.isBlocked ? 'default' : 'outline'}
                                className={selectedAdmin.isBlocked 
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white flex-1 min-w-[120px]' 
                                    : 'border-red-500/30 text-red-400 hover:bg-red-500/10 flex-1 min-w-[120px]'}
                                onClick={() => handleToggleBlock(selectedAdmin)}
                                disabled={actionLoading}
                            >
                                <Ban className="h-4 w-4 mr-1.5" />
                                {selectedAdmin.isBlocked ? 'Activate' : 'Suspend'}
                            </Button>
                            <Button 
                                variant="outline" 
                                className="border-slate-700 text-slate-300 hover:bg-slate-800 flex-1 min-w-[120px]"
                                onClick={() => handleResetPassword(selectedAdmin)}
                                disabled={actionLoading}
                            >
                                <Key className="h-4 w-4 mr-1.5" /> Reset Pass
                            </Button>
                            {isOwner && (
                                <Button 
                                    className="bg-red-600 hover:bg-red-700 text-white flex-1 min-w-[120px]"
                                    onClick={() => handleDeleteAdmin(selectedAdmin)}
                                    disabled={actionLoading}
                                >
                                    <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
