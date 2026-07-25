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
    Clock, MessageSquare, ListTodo, Award, FileSpreadsheet
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

interface AdminRequest {
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
    workflowSteps?: string[];
    currentStepIndex?: number;
    approvedBy?: Array<{ userId: string; role: string; date: string; comments?: string }>;
    rejectedBy?: { userId: string; role: string; reason: string; date: string };
    data: {
        profilePhoto?: string;
        name?: string;
        nickName?: string;
        gender?: string;
        dob?: string;
        maritalStatus?: string;
        email?: string;
        phoneNumber?: string;
        alternateMobile?: string;
        country?: string;
        state?: string;
        district?: string;
        city?: string;
        pincode?: string;
        fullAddress?: string;
        qualification?: string;
        experience?: string;
        previousCompany?: string;
        skills?: string;
        parentOwner?: string;
        parentOperator?: string;
        parentSuperAdmin?: string;
        referralCode?: string;
        invitationToken?: string;
        resume?: string;
        adharFront?: string;
        adharBack?: string;
        pan?: string;
        adminCode?: string;
        specialCode?: string;
        mithiChatId?: string;
        meethiChatId?: string;
        userId?: string;
        invitedBy?: string;
        joiningDate?: string;
    };
}

const STATUS_BADGE: Record<string, string> = {
    pending:   'bg-amber-500/20 text-amber-300 border-amber-500/40',
    approved:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    rejected:  'bg-red-500/20 text-red-300 border-red-500/40',
    cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
    expired:   'bg-slate-600/20 text-slate-500 border-slate-600/40',
};

export default function AdminRequestsPage() {
    const { user: currentUser } = useAuth();
    const [requests, setRequests] = useState<AdminRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Filtering states
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [parentFilter, setParentFilter] = useState('');
    const [stateFilter, setStateFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');
    const [page, setPage] = useState(1);
    
    // Detail Modal states
    const [selectedReq, setSelectedReq] = useState<AdminRequest | null>(null);
    const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'address' | 'professional' | 'organization' | 'workflow' | 'audit'>('personal');
    const [comment, setComment] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    
    const limit = 10;

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { requestType: 'Admin Request' };
            if (statusFilter !== 'all') params.status = statusFilter;

            const [emsRes, recruitRes] = await Promise.all([
                apiClient.get('/api/ems/requests', params).catch(() => ({ success: false, data: [] })),
                apiClient.get('/api/recruitment/applications', { role: 'admin', ...(statusFilter !== 'all' ? { status: statusFilter } : {}) }).catch(() => ({ success: false, data: [] }))
            ]);

            let emsList: AdminRequest[] = (emsRes.success && Array.isArray(emsRes.data)) ? emsRes.data : [];
            let recruitList: any[] = (recruitRes.success && Array.isArray(recruitRes.data)) ? recruitRes.data : [];

            const mappedRecruits: AdminRequest[] = recruitList.map(app => {
                const resumeDoc = app.documents?.find((d: any) => d.documentType === 'Resume' || d.name?.toLowerCase().includes('resume'));
                const adharFrontDoc = app.documents?.find((d: any) => d.name?.toLowerCase().includes('front') || d.documentType === 'GovtID');
                const adharBackDoc = app.documents?.find((d: any) => d.name?.toLowerCase().includes('back'));
                const panDoc = app.documents?.find((d: any) => d.name?.toLowerCase().includes('pan') || d.documentType === 'Certificate');

                return {
                    _id: app._id || app.applicationId,
                    requestType: 'Admin Request',
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
                        adminCode: app.roleData?.adminCode || app.referrer?.code || '—',
                        ...app.roleData
                    }
                };
            });

            const combinedMap = new Map<string, AdminRequest>();
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
            toast.error(err?.message || 'Error fetching Admin Requests');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = async (id: string, force = false) => {
        setActionLoading(true);
        try {
            const res = await apiClient.post(`/api/ems/requests/${id}/approve`, { 
                comments: comment || (force ? 'Force Approved by Owner' : 'Approved') 
            });
            if (res.success) {
                toast.success('✅ Request approved successfully');
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
            toast.error('Please specify a rejection reason');
            return;
        }
        setActionLoading(true);
        try {
            const res = await apiClient.post(`/api/ems/requests/${id}/reject`, { 
                reason: rejectionReason 
            });
            if (res.success) {
                toast.success('❌ Request rejected');
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

    // Filter logic
    const filtered = requests.filter(r => {
        const d = r.data;
        const q = search.toLowerCase();
        
        // Text search
        const matchesSearch = !q ||
            (d.name || '').toLowerCase().includes(q) ||
            (d.email || '').toLowerCase().includes(q) ||
            (d.phoneNumber || '').toLowerCase().includes(q) ||
            r._id.toLowerCase().includes(q) ||
            (d.referralCode || '').toLowerCase().includes(q);

        // Filter Dropdowns
        const matchesParent = !parentFilter || 
            (d.parentOwner || '').includes(parentFilter) ||
            (d.parentOperator || '').includes(parentFilter) ||
            (d.parentSuperAdmin || '').includes(parentFilter);

        const matchesState = !stateFilter || (d.state || '').toLowerCase().includes(stateFilter.toLowerCase());
        const matchesCountry = !countryFilter || (d.country || '').toLowerCase().includes(countryFilter.toLowerCase());

        return matchesSearch && matchesParent && matchesState && matchesCountry;
    });

    const totalPages = Math.ceil(filtered.length / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    // Dashboard count statistics
    const counts = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
    };

    const isOwner = currentUser?.role === 'owner';

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                        Admin Requests Panel
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage onboarding workflow, approvals and hierarchy mappings for Admin registrations.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchRequests} className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </div>

            {/* Dashboard summary cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className="glass-card">
                    <CardHeader className="py-3"><CardTitle className="text-xs font-medium text-slate-400">Total Applications</CardTitle></CardHeader>
                    <CardContent className="pb-4"><div className="text-2xl font-black text-slate-100">{counts.total}</div></CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="py-3"><CardTitle className="text-xs font-medium text-slate-400">Pending Approvals</CardTitle></CardHeader>
                    <CardContent className="pb-4"><div className="text-2xl font-black text-amber-400">{counts.pending}</div></CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="py-3"><CardTitle className="text-xs font-medium text-slate-400">Approved Admins</CardTitle></CardHeader>
                    <CardContent className="pb-4"><div className="text-2xl font-black text-emerald-400">{counts.approved}</div></CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="py-3"><CardTitle className="text-xs font-medium text-slate-400">Rejected Applications</CardTitle></CardHeader>
                    <CardContent className="pb-4"><div className="text-2xl font-black text-red-400">{counts.rejected}</div></CardContent>
                </Card>
            </div>

            {/* Filters panel */}
            <Card className="glass-card p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="relative col-span-1 md:col-span-2">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by name, email, mobile, ID..." 
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="pl-9"
                        />
                    </div>
                    <div>
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
                    <div>
                        <Input 
                            placeholder="Filter by Parent ID" 
                            value={parentFilter}
                            onChange={e => { setParentFilter(e.target.value); setPage(1); }}
                        />
                    </div>
                    <div>
                        <Input 
                            placeholder="Filter by State" 
                            value={stateFilter}
                            onChange={e => { setStateFilter(e.target.value); setPage(1); }}
                        />
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
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Admin Photo</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Mithi Chat Id</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Email Id</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Mobile Number</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">State Name</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">District Name</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Resume</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Adhar Front</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Adhar Back</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Pan</TableHead>
                                    <TableHead className="text-slate-300 font-bold whitespace-nowrap">Admin Code</TableHead>
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
                                                <span>Fetching requests...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginated.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={15} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                                <ListTodo className="h-8 w-8 text-slate-600" />
                                                <span>No Admin requests match the filters</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginated.map(req => {
                                    const d = req.data || {};
                                    return (
                                        <TableRow key={req._id} className="hover:bg-slate-800/40 border-slate-700/30 text-xs">
                                            {/* 1. Invited By */}
                                            <TableCell className="text-slate-300 whitespace-nowrap">
                                                {d.invitedBy || d.parentOperator || d.parentSuperAdmin || req.createdByRole || 'System'}
                                            </TableCell>

                                            {/* 2. Name */}
                                            <TableCell className="font-semibold text-slate-200 whitespace-nowrap">{d.name || '—'}</TableCell>

                                            {/* 3. Admin Photo */}
                                            <TableCell>
                                                {d.profilePhoto ? (
                                                    <img src={d.profilePhoto} alt="Admin" className="h-8 w-8 rounded-full object-cover ring-2 ring-violet-500/20" />
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
                                                        <FileText className="h-3.5 w-3.5" /> View Resume
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
                                                        <FileText className="h-3.5 w-3.5" /> View PAN
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-500">—</span>
                                                )}
                                            </TableCell>

                                            {/* 13. Admin Code */}
                                            <TableCell className="font-mono text-slate-300 text-xs whitespace-nowrap">{d.adminCode || d.specialCode || d.referralCode || '—'}</TableCell>

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
                                                        onClick={() => { setSelectedReq(req); setActiveTab('personal'); }}
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Page {page} of {totalPages} — {filtered.length} applications</span>
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

            {/* Detail Modal with Tabs */}
            {selectedReq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-100">Request ID: {selectedReq._id}</h3>
                                <p className="text-xs text-slate-500">Request Type: Admin Request</p>
                            </div>
                            <button onClick={() => setSelectedReq(null)} className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Tabs Bar */}
                        <div className="flex bg-slate-800/40 p-1 gap-1 border-b border-slate-800 overflow-x-auto">
                            {[
                                { id: 'personal', label: 'Personal' },
                                { id: 'contact', label: 'Contact' },
                                { id: 'address', label: 'Address' },
                                { id: 'professional', label: 'Professional' },
                                { id: 'organization', label: 'Hierarchy' },
                                { id: 'workflow', label: 'Workflow' },
                                { id: 'audit', label: 'Audit Logs' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all
                                        ${activeTab === tab.id ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 p-5 overflow-y-auto space-y-4">
                            {activeTab === 'personal' && (
                                <div className="space-y-4">
                                    {selectedReq.data.profilePhoto && (
                                        <div className="flex justify-center">
                                            <img src={selectedReq.data.profilePhoto} alt="Profile" className="h-28 w-28 rounded-full object-cover ring-4 ring-violet-500/25" />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Label className="text-slate-500 text-xs">Full Name</Label><p className="text-slate-200 font-semibold">{selectedReq.data.name || '—'}</p></div>
                                        <div><Label className="text-slate-500 text-xs">Nick Name</Label><p className="text-slate-200 font-semibold">{selectedReq.data.nickName || '—'}</p></div>
                                        <div><Label className="text-slate-500 text-xs">Gender</Label><p className="text-slate-200 capitalize">{selectedReq.data.gender || '—'}</p></div>
                                        <div><Label className="text-slate-500 text-xs">Date of Birth</Label><p className="text-slate-200">{selectedReq.data.dob || '—'}</p></div>
                                        <div><Label className="text-slate-500 text-xs">Marital Status</Label><p className="text-slate-200 capitalize">{selectedReq.data.maritalStatus || '—'}</p></div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label className="text-slate-500 text-xs">Email</Label><p className="text-slate-200 font-semibold">{selectedReq.data.email || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-xs">Mobile Number</Label><p className="text-slate-200 font-semibold">{selectedReq.data.phoneNumber || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-xs">Alternate Mobile</Label><p className="text-slate-200">{selectedReq.data.alternateMobile || '—'}</p></div>
                                </div>
                            )}

                            {activeTab === 'address' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label className="text-slate-500 text-xs">Country</Label><p className="text-slate-200">{selectedReq.data.country || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-xs">State</Label><p className="text-slate-200">{selectedReq.data.state || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-xs">District</Label><p className="text-slate-200">{selectedReq.data.district || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-xs">City / Town</Label><p className="text-slate-200">{selectedReq.data.city || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-xs">Pincode</Label><p className="text-slate-200">{selectedReq.data.pincode || '—'}</p></div>
                                    <div className="col-span-2"><Label className="text-slate-500 text-xs">Full Address</Label><p className="text-slate-200">{selectedReq.data.fullAddress || '—'}</p></div>
                                </div>
                            )}

                            {activeTab === 'professional' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label className="text-slate-500 text-xs">Qualification</Label><p className="text-slate-200">{selectedReq.data.qualification || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-xs">Experience (Years)</Label><p className="text-slate-200">{selectedReq.data.experience || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-xs">Previous Employer</Label><p className="text-slate-200">{selectedReq.data.previousCompany || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-xs">Skills</Label><p className="text-slate-200">{selectedReq.data.skills || '—'}</p></div>
                                </div>
                            )}

                            {activeTab === 'organization' && (
                                <div className="grid grid-cols-2 gap-4 col-span-2">
                                    <div><Label className="text-slate-500 text-xs">Parent Owner ID</Label><p className="text-slate-200 font-mono text-xs">{selectedReq.data.parentOwner || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-xs">Parent Operator ID</Label><p className="text-slate-200 font-mono text-xs">{selectedReq.data.parentOperator || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-xs">Parent Super Admin ID</Label><p className="text-slate-200 font-mono text-xs">{selectedReq.data.parentSuperAdmin || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-xs">Referral Code</Label><p className="text-slate-200">{selectedReq.data.referralCode || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-xs">Invited By</Label><p className="text-slate-200">{selectedReq.data.invitedBy || '—'}</p></div>
                                    <div><Label className="text-slate-500 text-xs">Joining Date</Label><p className="text-slate-200">{selectedReq.data.joiningDate || '—'}</p></div>
                                </div>
                            )}

                            {activeTab === 'workflow' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Label className="text-slate-500 text-xs">Current Step</Label><p className="text-slate-200">Step {selectedReq.currentStepIndex ?? 0}</p></div>
                                        <div>
                                            <Label className="text-slate-500 text-xs">Pending With Role</Label>
                                            <p className="text-yellow-400 font-semibold uppercase">
                                                {selectedReq.workflowSteps && selectedReq.workflowSteps[selectedReq.currentStepIndex ?? 0] || 'Final Approval'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-400 text-xs block">Approval Stamps</Label>
                                        {selectedReq.approvedBy && selectedReq.approvedBy.map((stamp, i) => (
                                            <div key={i} className="bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/30 text-xs flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-slate-200">Role: {stamp.role}</p>
                                                    <p className="text-slate-400 mt-0.5">Comments: {stamp.comments || '—'}</p>
                                                </div>
                                                <span className="text-slate-500">{new Date(stamp.date).toLocaleDateString('en-IN')}</span>
                                            </div>
                                        ))}
                                        {(!selectedReq.approvedBy || selectedReq.approvedBy.length === 0) && (
                                            <p className="text-xs text-slate-600">No approval steps stamp registered yet.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'audit' && (
                                <div className="space-y-2.5 text-xs text-slate-300">
                                    <div className="bg-slate-800/20 p-2.5 rounded border border-slate-800 flex justify-between">
                                        <span>Request initiated in system</span>
                                        <span className="text-slate-500">{new Date(selectedReq.createdAt).toLocaleString()}</span>
                                    </div>
                                    <div className="bg-slate-800/20 p-2.5 rounded border border-slate-800 flex justify-between">
                                        <span>Last modified state</span>
                                        <span className="text-slate-500">{new Date(selectedReq.updatedAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions Footer */}
                        {selectedReq.status === 'pending' && (
                            <div className="p-5 border-t border-slate-800 bg-slate-900/50 space-y-4">
                                {showRejectForm ? (
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Enter rejection reason..."
                                            value={rejectionReason}
                                            onChange={e => setRejectionReason(e.target.value)}
                                            className="bg-slate-950 border-red-500/30 focus:border-red-500"
                                        />
                                        <div className="flex gap-2">
                                            <Button 
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white" 
                                                onClick={() => handleReject(selectedReq._id)}
                                                disabled={actionLoading}
                                            >
                                                Confirm Rejection
                                            </Button>
                                            <Button variant="outline" onClick={() => setShowRejectForm(false)}>Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div>
                                            <Label className="text-xs text-slate-400 mb-1.5 block">Reviewer Comment</Label>
                                            <Input
                                                placeholder="Add verification notes/comments..."
                                                value={comment}
                                                onChange={e => setComment(e.target.value)}
                                                className="bg-slate-950"
                                            />
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            <Button 
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 min-w-[120px] gap-1.5"
                                                onClick={() => handleApprove(selectedReq._id)}
                                                disabled={actionLoading}
                                            >
                                                <CheckCircle2 className="h-4 w-4" /> Approve Step
                                            </Button>
                                            {isOwner && (
                                                <Button 
                                                    className="bg-violet-600 hover:bg-violet-700 text-white flex-1 min-w-[120px] gap-1.5"
                                                    onClick={() => handleApprove(selectedReq._id, true)}
                                                    disabled={actionLoading}
                                                >
                                                    <Award className="h-4 w-4" /> Force Approve
                                                </Button>
                                            )}
                                            <Button 
                                                variant="outline" 
                                                className="border-red-500/30 text-red-400 hover:bg-red-500/10 flex-1 min-w-[120px] gap-1.5"
                                                onClick={() => setShowRejectForm(true)}
                                                disabled={actionLoading}
                                            >
                                                <XCircle className="h-4 w-4" /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
