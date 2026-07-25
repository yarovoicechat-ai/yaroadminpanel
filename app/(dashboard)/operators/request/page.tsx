'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/Table";
import {
    CheckCircle2, XCircle, Eye, Download, Loader2, RefreshCw,
    Search, FileText, User, Hash, Shield, UserCheck, X, ZoomIn,
    ChevronLeft, ChevronRight, Mail, Phone, Calendar, Layers,
    Clock, MessageSquare, ListTodo, Award
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

interface OperatorRequest {
    _id: string;
    userId?: number;
    requestType: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
    appliedDate: string;
    createdAt: string;
    updatedAt: string;
    passwordBeforeApproval?: string;
    createdBy?: any;
    createdByRole?: string;
    data: {
        profilePhoto?: string;
        name?: string;
        email?: string;
        phoneNumber?: string;
        alternateMobile?: string;
        country?: string;
        state?: string;
        district?: string;
        resume?: string;
        adharFront?: string;
        adharBack?: string;
        pan?: string;
        operatorCode?: string;
        specialCode?: string;
        referralCode?: string;
        invitedBy?: string;
        mithiChatId?: string;
        meethiChatId?: string;
        userId?: string;
    };
}

const STATUS_BADGE: Record<string, string> = {
    pending:   'bg-amber-500/20 text-amber-300 border-amber-500/40',
    approved:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    rejected:  'bg-red-500/20 text-red-300 border-red-500/40',
    cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
    expired:   'bg-slate-600/20 text-slate-500 border-slate-600/40',
};

export default function OperatorRequestsPage() {
    const { user: currentUser } = useAuth();
    const [requests, setRequests] = useState<OperatorRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Filtering states
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    
    // Detail Modal states
    const [selectedReq, setSelectedReq] = useState<OperatorRequest | null>(null);
    const [comment, setComment] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    
    const limit = 10;

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { requestType: 'Operator Request' };
            if (statusFilter !== 'all') params.status = statusFilter;

            const [emsRes, recruitRes] = await Promise.all([
                apiClient.get('/api/ems/requests', params).catch(() => ({ success: false, data: [] })),
                apiClient.get('/api/recruitment/applications', { role: 'operator', ...(statusFilter !== 'all' ? { status: statusFilter } : {}) }).catch(() => ({ success: false, data: [] }))
            ]);

            let emsList: OperatorRequest[] = (emsRes.success && Array.isArray(emsRes.data)) ? emsRes.data : [];
            let recruitList: any[] = (recruitRes.success && Array.isArray(recruitRes.data)) ? recruitRes.data : [];

            // Normalize recruitment applications into OperatorRequest schema
            const mappedRecruits: OperatorRequest[] = recruitList.map(app => {
                const resumeDoc = app.documents?.find((d: any) => d.documentType === 'Resume' || d.name?.toLowerCase().includes('resume'));
                const adharFrontDoc = app.documents?.find((d: any) => d.name?.toLowerCase().includes('front') || d.documentType === 'GovtID');
                const adharBackDoc = app.documents?.find((d: any) => d.name?.toLowerCase().includes('back'));
                const panDoc = app.documents?.find((d: any) => d.name?.toLowerCase().includes('pan') || d.documentType === 'Certificate');

                return {
                    _id: app._id || app.applicationId,
                    requestType: 'Operator Request',
                    status: app.status === 'under_review' ? 'pending' : (app.status || 'pending'),
                    appliedDate: app.createdAt,
                    createdAt: app.createdAt,
                    updatedAt: app.updatedAt,
                    passwordBeforeApproval: '••••••••',
                    createdByRole: 'public',
                    data: {
                        name: app.applicant?.name || app.roleData?.fullName || '—',
                        email: app.applicant?.email || app.roleData?.email || '—',
                        phoneNumber: app.applicant?.phone || app.roleData?.mobileNo || '—',
                        gender: app.applicant?.gender || '—',
                        state: app.applicant?.state || app.roleData?.state || '—',
                        district: app.applicant?.district || app.roleData?.district || '—',
                        city: app.applicant?.city || '—',
                        country: app.applicant?.country || 'India',
                        invitedBy: app.referrer?.referrerName || app.referrer?.code || 'Direct Portal',
                        mithiChatId: app.applicationId,
                        meethiChatId: app.applicationId,
                        resume: resumeDoc?.url || '',
                        adharFront: adharFrontDoc?.url || '',
                        adharBack: adharBackDoc?.url || '',
                        pan: panDoc?.url || '',
                        operatorCode: app.roleData?.operatorCode || app.referrer?.code || '—',
                        ...app.roleData
                    }
                };
            });

            // Deduplicate requests by email / mithiChatId
            const combinedMap = new Map<string, OperatorRequest>();
            emsList.forEach(item => {
                const key = (item.data?.email || item._id).toLowerCase();
                combinedMap.set(key, item);
            });
            mappedRecruits.forEach(item => {
                const key = (item.data?.email || item._id).toLowerCase();
                if (!combinedMap.has(key)) {
                    combinedMap.set(key, item);
                }
            });

            setRequests(Array.from(combinedMap.values()));
        } catch (err: any) {
            toast.error(err?.message || 'Error fetching Operator Requests');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await apiClient.post(`/api/ems/requests/${id}/approve`, { 
                comments: comment || 'Approved Operator Request'
            });
            if (res.success) {
                toast.success('✅ Operator request approved successfully');
                fetchRequests();
                setSelectedReq(null);
                setComment('');
            } else {
                toast.error(res.message || 'Failed to approve');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error processing approval');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        if (!rejectionReason.trim()) {
            toast.error('Rejection reason is required');
            return;
        }
        setActionLoading(true);
        try {
            const res = await apiClient.post(`/api/ems/requests/${id}/reject`, { 
                reason: rejectionReason 
            });
            if (res.success) {
                toast.success('❌ Operator request rejected');
                fetchRequests();
                setSelectedReq(null);
                setRejectionReason('');
                setShowRejectForm(false);
            } else {
                toast.error(res.message || 'Failed to reject');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error processing rejection');
        } finally {
            setActionLoading(false);
        }
    };

    const filtered = requests.filter(r => {
        const d = r.data || {};
        const q = search.toLowerCase();
        return !q ||
            (d.name || '').toLowerCase().includes(q) ||
            (d.email || '').toLowerCase().includes(q) ||
            (d.phoneNumber || '').toLowerCase().includes(q) ||
            r._id.toLowerCase().includes(q);
    });

    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                        Operator Request
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Review, approve and manage registration applications for Operators.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchRequests} className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </div>

            {/* Filters */}
            <Card className="glass-card p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name, email, mobile..." 
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
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card className="glass-card overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-700/50 text-xs">
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Invited By</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Name</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Operator Photo</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Mithi Chat Id</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Email Id</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Mobile Number</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">State Name</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">District Name</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Resume</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Adhar Front</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Adhar Back</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Pan</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Operator Code</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Password</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={15} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                                <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                                                <span>Loading requests...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginated.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={15} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                                <ListTodo className="h-8 w-8 text-slate-600" />
                                                <span>No operator requests found</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginated.map(req => {
                                    const d = req.data || {};
                                    return (
                                        <TableRow key={req._id} className="hover:bg-slate-800/40 border-slate-700/30 text-xs">
                                            {/* 1. Invited By */}
                                            <TableCell className="text-slate-300 whitespace-nowrap">
                                                {d.invitedBy || req.createdByRole || 'System'}
                                            </TableCell>

                                            {/* 2. Name */}
                                            <TableCell className="font-semibold text-slate-200 whitespace-nowrap">{d.name || '—'}</TableCell>

                                            {/* 3. Operator Photo */}
                                            <TableCell>
                                                {d.profilePhoto ? (
                                                    <img src={d.profilePhoto} alt="Operator" className="h-8 w-8 rounded-full object-cover ring-2 ring-violet-500/20" />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* 4. Meethi Chat Id */}
                                            <TableCell className="font-mono text-violet-300 whitespace-nowrap">{d.mithiChatId || d.meethiChatId || req.userId || d.userId || '—'}</TableCell>

                                            {/* 5. Email Id */}
                                            <TableCell className="text-slate-300 whitespace-nowrap">{d.email || '—'}</TableCell>

                                            {/* 6. Mobile Number */}
                                            <TableCell className="text-slate-300 whitespace-nowrap">{d.phoneNumber || d.alternateMobile || '—'}</TableCell>

                                            {/* 7. State Name */}
                                            <TableCell className="text-slate-300 whitespace-nowrap">{d.state || '—'}</TableCell>

                                            {/* 8. District Name */}
                                            <TableCell className="text-slate-300 whitespace-nowrap">{d.district || '—'}</TableCell>

                                            {/* 9. Resume */}
                                            <TableCell className="whitespace-nowrap">
                                                {d.resume ? (
                                                    <a href={d.resume} target="_blank" rel="noreferrer" className="text-xs text-violet-400 hover:underline flex items-center gap-1">
                                                        View Resume
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-500">—</span>
                                                )}
                                            </TableCell>

                                            {/* 10. Adhar Front */}
                                            <TableCell className="whitespace-nowrap">
                                                {d.adharFront ? (
                                                    <a href={d.adharFront} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                                                        <Eye className="h-3.5 w-3.5" /> Adhar Front
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-500">—</span>
                                                )}
                                            </TableCell>

                                            {/* 11. Adhar Back */}
                                            <TableCell className="whitespace-nowrap">
                                                {d.adharBack ? (
                                                    <a href={d.adharBack} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                                                        <Eye className="h-3.5 w-3.5" /> Adhar Back
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-500">—</span>
                                                )}
                                            </TableCell>

                                            {/* 12. Pan */}
                                            <TableCell className="whitespace-nowrap">
                                                {d.pan ? (
                                                    <a href={d.pan} target="_blank" rel="noreferrer" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                                                        View PAN
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-500">—</span>
                                                )}
                                            </TableCell>

                                            {/* 13. Operator Code */}
                                            <TableCell className="font-mono text-slate-300 text-xs whitespace-nowrap">{d.operatorCode || d.specialCode || d.referralCode || '—'}</TableCell>

                                            {/* 14. Password */}
                                            <TableCell className="font-mono text-slate-400 text-xs whitespace-nowrap">{req.passwordBeforeApproval || '••••••••'}</TableCell>

                                            {/* 15. Action */}
                                            <TableCell className="text-center whitespace-nowrap">
                                                <div className="flex gap-1.5 justify-center">
                                                    {req.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleApprove(req._id)}
                                                                disabled={actionLoading}
                                                                className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                onClick={() => { setSelectedReq(req); setShowRejectForm(true); }}
                                                                disabled={actionLoading}
                                                                className="h-7 px-2 text-xs"
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => setSelectedReq(req)}
                                                        className="h-7 px-2 text-xs border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" /> Details
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
