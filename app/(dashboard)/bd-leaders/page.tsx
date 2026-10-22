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
    Search, RefreshCw, Eye, Loader2, Shield, Users, Key, Plus
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

interface BdLeaderUser {
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
}

export default function BdLeadersPage() {
    const { user: currentUser } = useAuth();
    
    const [bdLeaders, setBdLeaders] = useState<BdLeaderUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);

    const fetchBdLeaders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/admin/bd-leaders', {
                search,
                status: statusFilter,
                page,
                limit: 20
            });
            if (res.success && res.data) {
                setBdLeaders(res.data.bdLeaders || res.data.operators || []);
            } else {
                toast.error(res.message || 'Failed to load BD Leaders');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error fetching BD Leaders list');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, page]);

    useEffect(() => {
        fetchBdLeaders();
    }, [fetchBdLeaders]);

    const handleToggleBlock = async (leader: BdLeaderUser) => {
        setActionLoading(true);
        try {
            const res = await apiClient.patch(`/api/admin/bd-leaders/${leader._id}/toggle-block`);
            if (res.success) {
                toast.success(`BD Leader status updated successfully`);
                fetchBdLeaders();
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
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        BD Leader List
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage registered BD Leaders (Sub-Admin Level), oversee BD performance and agency onboarding.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/bd-leaders/create">
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="h-4 w-4" /> Create BD Leader
                        </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={fetchBdLeaders} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="glass-card p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by name, email, mobile or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="suspended">Suspended Only</option>
                    </select>
                </div>
            </Card>

            {/* Table */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-400" />
                        Registered BD Leaders ({bdLeaders.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>BD Leader</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-500" />
                                        <p className="text-sm text-muted-foreground mt-2">Loading BD Leaders...</p>
                                    </TableCell>
                                </TableRow>
                            ) : bdLeaders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        No BD Leaders found matching filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bdLeaders.map((leader) => (
                                    <TableRow key={leader._id}>
                                        <TableCell className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                                            {leader.userId || leader.specialCode || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-500">
                                                    {leader.name ? leader.name.charAt(0).toUpperCase() : 'B'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm">{leader.name}</div>
                                                    <div className="text-xs text-muted-foreground">{leader.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {leader.phoneNumber || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={leader.isBlocked ? "destructive" : "default"} className={!leader.isBlocked ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : ""}>
                                                {leader.isBlocked ? "Suspended" : "Active"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(leader.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggleBlock(leader)}
                                                disabled={actionLoading}
                                                className="text-xs"
                                            >
                                                {leader.isBlocked ? "Activate" : "Suspend"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
