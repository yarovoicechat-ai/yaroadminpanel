'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Search, RefreshCw, CheckCircle2, XCircle, Shield,
    User, Mail, Phone, Calendar, MapPin, Eye, Plus,
    Briefcase, FileText, ExternalLink, X, Award
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
import { DeleteRequestButton } from '@/components/requests/DeleteRequestButton';

export default function BdLeaderRequestsPage() {
    const { user: currentUser } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/ems/requests', { requestType: 'BD Leader Request' });
            const items = Array.isArray(res)
                ? res
                : Array.isArray(res?.data)
                    ? res.data
                    : Array.isArray(res?.data?.data)
                        ? res.data.data
                        : Array.isArray(res?.data?.requests)
                            ? res.data.requests
                            : [];
            setRequests(items);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to load BD Leader requests');
            setRequests([]);
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
                ? { comments: 'Approved by Admin / Owner' }
                : { reason: 'Application rejected by Admin', comments: 'Application rejected' };
            const res = await apiClient.post(endpoint, payload);
            if (res.success || res.data) {
                toast.success(isApprove ? '✅ BD Leader application approved!' : '❌ BD Leader application rejected.');
                if (selectedCandidate && (selectedCandidate._id === id || selectedCandidate.id === id)) {
                    setSelectedCandidate(null);
                }
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

    const formatDate = (val?: any) => {
        if (!val) return '—';
        try {
            const dt = new Date(val);
            return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-IN');
        } catch {
            return '—';
        }
    };

    const safeRequests = Array.isArray(requests) ? requests : [];
    const filteredRequests = safeRequests.filter((r) => {
        if (!r || typeof r !== 'object') return false;
        const d = r.data || {};
        const query = (search || '').toLowerCase().trim();
        const name = String(d.name || d.fullName || '').toLowerCase();
        const email = String(d.email || '').toLowerCase();
        const phone = String(d.phoneNumber || d.mobile || '');
        const meethiId = String(d.meethiChatId || d.mithiChatId || d.applicationId || '').toLowerCase();

        const matchesSearch = !query ||
            name.includes(query) ||
            email.includes(query) ||
            phone.includes(query) ||
            meethiId.includes(query);

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
                        Review, verify credentials, and approve candidates applying for Business Development Leader roles.
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
                                    const reqId = req._id || req.id || '';
                                    const isPending = String(req.status || 'pending').toLowerCase() === 'pending';
                                    const isApproved = String(req.status || '').toLowerCase() === 'approved';
                                    const initialChar = String(d.name || 'B').trim().charAt(0).toUpperCase() || 'B';

                                    return (
                                        <TableRow key={reqId || String(Math.random())}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-500">
                                                        {initialChar}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-sm">{String(d.name || 'Applicant')}</div>
                                                        <div className="text-xs text-muted-foreground">Gender: {String(d.gender || '—')} • Age: {String(d.age || '—')}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs font-semibold">{String(d.email || '—')}</div>
                                                <div className="text-xs text-muted-foreground">{String(d.phoneNumber || d.mobile || '—')}</div>
                                                <div className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                                                    ID: {String(d.meethiChatId || d.mithiChatId || d.applicationId || '—')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {d.state ? `${String(d.state)}, ` : ''}{String(d.country || 'India')}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={isApproved ? "default" : isPending ? "outline" : "destructive"}
                                                    className={isApproved ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" : isPending ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : ""}
                                                >
                                                    {String(req.status || 'Pending')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatDate(req.createdAt || req.registrationDate)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-xs h-8 px-2.5"
                                                        onClick={() => setSelectedCandidate(req)}
                                                    >
                                                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                                                    </Button>

                                                    {isPending && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5"
                                                                disabled={actionLoadingId === reqId}
                                                                onClick={() => handleAction(reqId, true)}
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-rose-500 hover:bg-rose-500/10 text-xs h-8 px-2.5"
                                                                disabled={actionLoadingId === reqId}
                                                                onClick={() => handleAction(reqId, false)}
                                                            >
                                                                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                                                            </Button>
                                                        </>
                                                    )}

                                                    <DeleteRequestButton
                                                        requestId={reqId}
                                                        applicantName={d.name || 'BD Leader Applicant'}
                                                        onDeleted={fetchRequests}
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Candidate Detail Modal */}
            {selectedCandidate && (() => {
                const candData = selectedCandidate.data || {};
                const candId = selectedCandidate._id || selectedCandidate.id || '';
                const isPending = String(selectedCandidate.status || 'pending').toLowerCase() === 'pending';
                const isApproved = String(selectedCandidate.status || '').toLowerCase() === 'approved';

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in-0">
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
                            {/* Modal Header */}
                            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-lg">
                                        {String(candData.name || 'B').trim().charAt(0).toUpperCase() || 'B'}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold flex items-center gap-2">
                                            {candData.name || 'Applicant Details'}
                                            <Badge
                                                variant={isApproved ? "default" : isPending ? "outline" : "destructive"}
                                                className={isApproved ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs" : isPending ? "bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs" : "text-xs"}
                                            >
                                                {selectedCandidate.status || 'Pending'}
                                            </Badge>
                                        </h3>
                                        <p className="text-xs text-slate-400">Application ID: {candData.meethiChatId || candData.applicationId || candId}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedCandidate(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 overflow-y-auto space-y-5 text-sm">
                                {/* Profile & Contacts */}
                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2.5">
                                        Personal & Contact Information
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                                        <div><span className="text-slate-400 text-xs">Full Name:</span> <div className="font-medium">{candData.name || '—'}</div></div>
                                        <div><span className="text-slate-400 text-xs">Email:</span> <div className="font-medium">{candData.email || '—'}</div></div>
                                        <div><span className="text-slate-400 text-xs">Phone Number:</span> <div className="font-medium">{candData.phoneNumber || candData.mobile || '—'}</div></div>
                                        <div><span className="text-slate-400 text-xs">WhatsApp / Alt:</span> <div className="font-medium">{candData.whatsappNo || candData.alternateMobile || '—'}</div></div>
                                        <div><span className="text-slate-400 text-xs">Gender:</span> <div className="font-medium">{candData.gender || '—'}</div></div>
                                        <div><span className="text-slate-400 text-xs">Age:</span> <div className="font-medium">{candData.age || '—'}</div></div>
                                        <div><span className="text-slate-400 text-xs">Location:</span> <div className="font-medium">{candData.city ? `${candData.city}, ` : ''}{candData.state ? `${candData.state}, ` : ''}{candData.country || 'India'}</div></div>
                                        <div><span className="text-slate-400 text-xs">Full Address:</span> <div className="font-medium">{candData.address || candData.fullAddress || '—'}</div></div>
                                    </div>
                                </div>

                                {/* Leadership & BD Experience */}
                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2.5">
                                        Leadership & Business Development Track Record
                                    </h4>
                                    <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div><span className="text-slate-400 text-xs">Total BD Experience:</span> <div className="font-medium">{candData.bdExperience || candData.experience || '—'}</div></div>
                                            <div><span className="text-slate-400 text-xs">Previous Company / Platform:</span> <div className="font-medium">{candData.previousCompany || '—'}</div></div>
                                            <div><span className="text-slate-400 text-xs">Expected Monthly Onboardings:</span> <div className="font-medium">{candData.monthlyTarget || candData.targetCreators || '—'}</div></div>
                                            <div><span className="text-slate-400 text-xs">Network / Agency Connections:</span> <div className="font-medium">{candData.networkSize || candData.existingAgencies || '—'}</div></div>
                                        </div>
                                        {candData.growthStrategy && (
                                            <div>
                                                <span className="text-slate-400 text-xs">Growth & Expansion Strategy:</span>
                                                <div className="text-xs mt-1 text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                                                    {candData.growthStrategy}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Documents & Attachments */}
                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2.5">
                                        Verification & Documents
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-xs">
                                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                                            <span>Aadhaar Card</span>
                                            {candData.aadhaarUrl || candData.adharFront || candData.aadhaarFront ? (
                                                <a href={candData.aadhaarUrl || candData.adharFront || candData.aadhaarFront} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1">
                                                    View <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : <span className="text-slate-500">—</span>}
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                                            <span>PAN Card</span>
                                            {candData.panUrl || candData.panCard || candData.pan ? (
                                                <a href={candData.panUrl || candData.panCard || candData.pan} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1">
                                                    View <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : <span className="text-slate-500">—</span>}
                                        </div>
                                        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                                            <span>Resume / Portfolio</span>
                                            {candData.resumeUrl || candData.portfolioUrl ? (
                                                <a href={candData.resumeUrl || candData.portfolioUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1">
                                                    View <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : <span className="text-slate-500">—</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
                                <Button variant="outline" size="sm" onClick={() => setSelectedCandidate(null)}>
                                    Close
                                </Button>
                                {isPending && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-rose-500 hover:bg-rose-500/10 text-xs"
                                            disabled={actionLoadingId === candId}
                                            onClick={() => handleAction(candId, false)}
                                        >
                                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject Application
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="default"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                                            disabled={actionLoadingId === candId}
                                            onClick={() => handleAction(candId, true)}
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve & Activate
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
