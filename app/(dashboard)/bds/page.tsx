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
    Search, RefreshCw, Eye, Loader2, Award, Users, Key, Plus
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

interface BdUser {
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

export default function BdsPage() {
    const { user: currentUser } = useAuth();
    
    const [bds, setBds] = useState<BdUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);

    const fetchBds = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/admin/bds', {
                search,
                status: statusFilter,
                page,
                limit: 20
            });
            if (res.success && res.data) {
                setBds(res.data.bds || res.data.operators || []);
            } else {
                toast.error(res.message || 'Failed to load BDs');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error fetching BD list');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, page]);

    useEffect(() => {
        fetchBds();
    }, [fetchBds]);

    const handleToggleBlock = async (bd: BdUser) => {
        setActionLoading(true);
        try {
            const res = await apiClient.patch(`/api/admin/bds/${bd._id}/toggle-block`);
            if (res.success) {
                toast.success(`BD status updated successfully`);
                fetchBds();
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
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        BD (Business Development) List
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage Business Development officers responsible for onboarding talent and expanding agencies.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/bds/create">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4" /> Create BD
                        </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={fetchBds} className="gap-2">
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
                        <Award className="h-5 w-5 text-blue-400" />
                        Registered BD Officers ({bds.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>BD Officer</TableHead>
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
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                                        <p className="text-sm text-muted-foreground mt-2">Loading BD List...</p>
                                    </TableCell>
                                </TableRow>
                            ) : bds.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        No BD officers found matching filters.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bds.map((bd) => (
                                    <TableRow key={bd._id}>
                                        <TableCell className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                                            {bd.userId || bd.specialCode || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-blue-500/10 flex items-center justify-center font-bold text-blue-500">
                                                    {bd.name ? bd.name.charAt(0).toUpperCase() : 'B'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm">{bd.name}</div>
                                                    <div className="text-xs text-muted-foreground">{bd.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {bd.phoneNumber || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={bd.isBlocked ? "destructive" : "default"} className={!bd.isBlocked ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : ""}>
                                                {bd.isBlocked ? "Suspended" : "Active"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(bd.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleToggleBlock(bd)}
                                                disabled={actionLoading}
                                                className="text-xs"
                                            >
                                                {bd.isBlocked ? "Activate" : "Suspend"}
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
