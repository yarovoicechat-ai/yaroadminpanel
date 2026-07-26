'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/Table";
import {
    Search, RefreshCw, Eye, Loader2, User, Users, Key
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

interface OperatorUser {
    _id: string;
    userId: number;
    name: string;
    email: string;
    phoneNumber?: string;
    image?: string;
    isBlocked: boolean;
    isDeleted: boolean;
    createdAt: string;
    specialCode?: string;
    activeSuperAdminsCount?: number;
    newSuperAdminsCount?: number;
    activeAdminsCount?: number;
    newAdminsCount?: number;
    activeAgenciesCount?: number;
    newAgenciesCount?: number;
    activeHostsCount?: number;
    newHostsCount?: number;
    recruitedSuperAdmins?: any[];
    recruitedAdmins?: any[];
    recruitedAgencies?: any[];
}

export default function OperatorsPage() {
    const { user: currentUser } = useAuth();
    
    const [operators, setOperators] = useState<OperatorUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    
    const [selectedOperator, setSelectedOperator] = useState<OperatorUser | null>(null);

    const fetchOperators = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/admin/operators', {
                search,
                status: statusFilter,
                page,
                limit: 20
            });
            if (res.success && res.data) {
                setOperators(res.data.operators || []);
            } else {
                toast.error(res.message || 'Failed to load Operators');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error fetching Operators list');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, page]);

    useEffect(() => {
        fetchOperators();
    }, [fetchOperators]);

    const handleToggleBlock = async (opr: OperatorUser) => {
        setActionLoading(true);
        try {
            const res = await apiClient.patch(`/api/admin/operators/${opr._id}/toggle-block`);
            if (res.success) {
                toast.success(`Operator status updated successfully`);
                fetchOperators();
            } else {
                toast.error(res.message || 'Failed to update status');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error updating status');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                        Operator List
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage registered operator accounts, hierarchy performance and recruited members.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchOperators} className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card className="glass-card p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by operator name, email, mobile..." 
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
                        <option value="all">All Operators</option>
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
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Operator Name</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">Active Super Admin</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">New Super Admin</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">Active Admin</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">New Admin</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">Active Agencies</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">New Agencies</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">Active Host</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">New Host</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Date Added</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">Action</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">Data (View Recruited Agencies)</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">Data (View Recruited Admin)</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">Data (View Recruited Super Admin)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={14} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                                <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                                                <span>Loading operators...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : operators.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={14} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                                <Users className="h-8 w-8 text-slate-600" />
                                                <span>No operators found</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : operators.map(opr => (
                                    <TableRow key={opr._id} className="hover:bg-slate-800/40 border-slate-700/30 text-xs">
                                        {/* 1. Operator Name */}
                                        <TableCell className="font-semibold text-slate-200 flex items-center gap-2 whitespace-nowrap">
                                            {opr.image ? (
                                                <img src={opr.image} alt="Profile" className="h-7 w-7 rounded-full object-cover ring-2 ring-violet-500/20" />
                                            ) : (
                                                <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                                                    <User className="h-4 w-4" />
                                                </div>
                                            )}
                                            <span>{opr.name}</span>
                                        </TableCell>

                                        {/* 2. Active Super Admin */}
                                        <TableCell className="text-center font-semibold text-purple-400 whitespace-nowrap">
                                            {opr.activeSuperAdminsCount ?? 0}
                                        </TableCell>

                                        {/* 3. New Super Admin */}
                                        <TableCell className="text-center font-semibold text-pink-400 whitespace-nowrap">
                                            {opr.newSuperAdminsCount ?? 0}
                                        </TableCell>

                                        {/* 4. Active Admin */}
                                        <TableCell className="text-center font-semibold text-emerald-400 whitespace-nowrap">
                                            {opr.activeAdminsCount ?? 0}
                                        </TableCell>

                                        {/* 5. New Admin */}
                                        <TableCell className="text-center font-semibold text-cyan-400 whitespace-nowrap">
                                            {opr.newAdminsCount ?? 0}
                                        </TableCell>

                                        {/* 6. Active Agencies */}
                                        <TableCell className="text-center font-semibold text-violet-400 whitespace-nowrap">
                                            {opr.activeAgenciesCount ?? 0}
                                        </TableCell>

                                        {/* 7. New Agencies */}
                                        <TableCell className="text-center font-semibold text-blue-400 whitespace-nowrap">
                                            {opr.newAgenciesCount ?? 0}
                                        </TableCell>

                                        {/* 8. Active Host */}
                                        <TableCell className="text-center font-semibold text-indigo-400 whitespace-nowrap">
                                            {opr.activeHostsCount ?? 0}
                                        </TableCell>

                                        {/* 9. New Host */}
                                        <TableCell className="text-center font-semibold text-amber-400 whitespace-nowrap">
                                            {opr.newHostsCount ?? 0}
                                        </TableCell>

                                        {/* 10. Date Added */}
                                        <TableCell className="text-slate-400 whitespace-nowrap">
                                            {new Date(opr.createdAt).toLocaleDateString('en-IN')}
                                        </TableCell>

                                        {/* 11. Action */}
                                        <TableCell className="text-center whitespace-nowrap">
                                            <div className="flex gap-1.5 justify-center">
                                                <Link href={`/security/permissions?targetType=user&targetId=${opr._id}&name=${encodeURIComponent(opr.name)}`}>
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
                                                    onClick={() => setSelectedOperator(opr)}
                                                    className="h-7 px-2 text-xs border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                                                >
                                                    <Eye className="h-3.5 w-3.5" /> View
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleToggleBlock(opr)}
                                                    disabled={actionLoading}
                                                    className={`h-7 px-2 text-xs ${opr.isBlocked ? 'border-emerald-500/30 text-emerald-300' : 'border-amber-500/30 text-amber-300'}`}
                                                >
                                                    {opr.isBlocked ? 'Activate' : 'Block'}
                                                </Button>
                                            </div>
                                        </TableCell>

                                         {/* 12. Data (View Recruited Agencies) */}
                                        <TableCell className="text-center whitespace-nowrap">
                                            <Link href={`/recruited-members?parentId=${opr._id}&parentName=${encodeURIComponent(opr.name)}&targetRole=agency`}>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="h-7 px-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                                                >
                                                    View Recruited Agencies ({(opr.recruitedAgencies || []).length})
                                                </Button>
                                            </Link>
                                        </TableCell>

                                        {/* 13. Data (View Recruited Admin) */}
                                        <TableCell className="text-center whitespace-nowrap">
                                            <Link href={`/recruited-members?parentId=${opr._id}&parentName=${encodeURIComponent(opr.name)}&targetRole=admin`}>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="h-7 px-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                                                >
                                                    View Recruited Admin ({(opr.recruitedAdmins || []).length})
                                                </Button>
                                            </Link>
                                        </TableCell>

                                        {/* 14. Data (View Recruited Super Admin) */}
                                        <TableCell className="text-center whitespace-nowrap">
                                            <Link href={`/recruited-members?parentId=${opr._id}&parentName=${encodeURIComponent(opr.name)}&targetRole=superAdmin`}>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="h-7 px-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                                                >
                                                    View Recruited Super Admin ({(opr.recruitedSuperAdmins || []).length})
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
