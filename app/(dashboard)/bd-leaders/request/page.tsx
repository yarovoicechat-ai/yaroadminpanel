'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Search, RefreshCw, CheckCircle2, XCircle, Shield,
    User, Mail, Phone, Calendar, MapPin, Eye, Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/Table";

export default function BdLeaderRequestsPage() {
    const { user: currentUser } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/ems/requests', { requestType: 'BD Leader Request' });
            const items = Array.isArray(res) ? res : (res?.data?.requests || res?.data || []);
            setRequests(items);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to load BD Leader requests');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (id: string, isApprove: boolean) => {
        setActionLoadingId(id);
        try {
            const endpoint = `/api/ems/requests/${id}/${isApprove ? 'approve' : 'reject'}`;
            const payload = isApprove
                ? { comments: 'Approved by Admin' }
                : { reason: 'Application rejected by Admin', comments: 'Application rejected' };
            const res = await apiClient.post(endpoint, payload);
            if (res.success || res.data) {
                toast.success(isApprove ? '✅ BD Leader application approved!' : '❌ BD Leader application rejected.');
                fetchRequests();
            } else {
                toast.error(res.message || 'Action failed');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error processing request');
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredRequests = requests.filter((r) => {
        const d = r.data || {};
        const query = search.toLowerCase();
        const matchesSearch = !search ||
            (d.name && d.name.toLowerCase().includes(query)) ||
            (d.email && d.email.toLowerCase().includes(query)) ||
            (d.phoneNumber && d.phoneNumber.includes(query)) ||
            (d.meethiChatId && d.meethiChatId.toLowerCase().includes(query));

        const status = String(r.status || 'pending').toLowerCase();
        const matchesStatus = statusFilter === 'all' || status === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        BD Leader Requests
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Review and approve candidates applying for Business Development Leader roles.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/bd-leaders/create">
                        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                            <Plus className="h-4 w-4" /> New BD Leader
                        </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={fetchRequests} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="glass-card p-4 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by candidate name, email, phone or ID..."
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
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </Card>

            {/* Requests Table */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-400" />
                        BD Leader Applications ({filteredRequests.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Contact & ID</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        Loading applications...
                                    </TableCell>
                                </TableRow>
                            ) : filteredRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        No BD Leader requests found matching criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRequests.map((req) => {
                                    const d = req.data || {};
                                    const isPending = String(req.status || 'pending').toLowerCase() === 'pending';
                                    const isApproved = String(req.status || '').toLowerCase() === 'approved';
                                    return (
                                        <TableRow key={req._id || req.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-500">
                                                        {d.name ? d.name.charAt(0).toUpperCase() : 'B'}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-sm">{d.name || 'Applicant'}</div>
                                                        <div className="text-xs text-muted-foreground">Gender: {d.gender || '—'} • Age: {d.age || '—'}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs font-semibold">{d.email || '—'}</div>
                                                <div className="text-xs text-muted-foreground">{d.phoneNumber || d.mobile || '—'}</div>
                                                <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                                                    ID: {d.meethiChatId || '—'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {d.state ? `${d.state}, ` : ''}{d.country || 'India'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={isApproved ? "default" : isPending ? "outline" : "destructive"}
                                                    className={isApproved ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : isPending ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : ""}
                                                >
                                                    {req.status || 'Pending'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(req.createdAt || req.registrationDate || Date.now()).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {isPending ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                                            disabled={actionLoadingId === req._id}
                                                            onClick={() => handleAction(req._id || req.id, true)}
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-rose-500 hover:bg-rose-500/10 text-xs"
                                                            disabled={actionLoadingId === req._id}
                                                            onClick={() => handleAction(req._id || req.id, false)}
                                                        >
                                                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Completed</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
