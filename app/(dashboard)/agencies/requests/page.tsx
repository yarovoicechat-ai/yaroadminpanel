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
    CheckCircle2, XCircle, Eye, Download, Loader2, RefreshCw,
    Search, FileText, User, Hash, Building2, Phone, Mail,
    Shield, UserCheck, X, ZoomIn, ChevronLeft, ChevronRight
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface AgencyRequest {
    _id: string;
    userId?: number;
    requestType: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
    appliedDate: string;
    approvedDate?: string;
    rejectedDate?: string;
    createdBy?: any;
    createdByRole?: string;
    workflowSteps?: string[];
    currentStepIndex?: number;
    approvedBy?: Array<{ userId: string; role: string; date: string; comments?: string }>;
    rejectedBy?: { userId: string; role: string; reason: string; date: string };
    data: {
        // Identity
        name?: string;
        agencyName?: string;
        managerName?: string;
        managerPhoto?: string;
        email?: string;
        emailId?: string;
        phone?: string;
        mobileNumber?: string;
        // IDs
        mithichatId?: string;
        specialCode?: string;
        password?: string;
        referralCode?: string;
        agencyId?: string;
        agencyCode?: string;
        userName?: string;
        // Hierarchy
        parentAdmin?: string;
        parentSuperAdmin?: string;
        parentOperator?: string;
        parentOwner?: string;
        invitedBy?: string;
        // Status & Docs
        status?: string;
        resume?: string;
        aadharFront?: string;
        aadharBack?: string;
        panCard?: string;
        // Any extra
        [key: string]: any;
    };
}

const STATUS_BADGE: Record<string, string> = {
    pending:   'bg-amber-500/20 text-amber-300 border-amber-500/40',
    approved:  'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    rejected:  'bg-red-500/20 text-red-300 border-red-500/40',
    cancelled: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
    expired:   'bg-slate-600/20 text-slate-500 border-slate-600/40',
};

// ─── Lightbox ────────────────────────────────────────────────────────────────
function DocViewer({ url, label, onClose }: { url: string; label: string; onClose: () => void }) {
    const isPdf = url?.toLowerCase().includes('.pdf');
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <div className="flex items-center gap-2 text-slate-200 font-semibold">
                        <FileText className="h-4 w-4 text-violet-400" />
                        {label}
                    </div>
                    <div className="flex gap-2">
                        <a href={url} download target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                                <Download className="h-3 w-3" /> Download
                            </Button>
                        </a>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-2 min-h-0">
                    {isPdf ? (
                        <iframe src={url} className="w-full h-full min-h-[60vh] rounded-lg" title={label} />
                    ) : (
                        <img src={url} alt={label} className="w-full h-auto max-h-[70vh] object-contain rounded-lg mx-auto block" />
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Doc Tile ─────────────────────────────────────────────────────────────────
function DocTile({ url, label }: { url?: string; label: string }) {
    const [open, setOpen] = useState(false);
    if (!url) return <span className="text-slate-600 text-xs">—</span>;
    return (
        <>
            <div className="flex items-center gap-1.5">
                <button onClick={() => setOpen(true)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs hover:bg-violet-500/20 transition-all">
                    <ZoomIn className="h-3 w-3" /> Preview
                </button>
                <a href={url} download target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700/50 border border-slate-600/40 text-slate-300 text-xs hover:bg-slate-600/50 transition-all">
                    <Download className="h-3 w-3" /> Download
                </a>
            </div>
            {open && <DocViewer url={url} label={label} onClose={() => setOpen(false)} />}
        </>
    );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function RequestDetailModal({
    req, onClose, onApprove, onReject, loading
}: {
    req: AgencyRequest;
    onClose: () => void;
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
    loading: boolean;
}) {
    const [rejectReason, setRejectReason] = useState('');
    const [showReject, setShowReject] = useState(false);
    const d = req.data;

    const FieldRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number | null }) => (
        value ? (
            <div className="flex items-start gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
                <div className="text-slate-500 mt-0.5 flex-shrink-0">{icon}</div>
                <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{label}</p>
                    <p className="text-sm text-slate-200 font-medium break-all">{value}</p>
                </div>
            </div>
        ) : null
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-5 flex items-center justify-between z-10">
                    <div>
                        <h3 className="text-lg font-bold text-slate-100">Agency Request Details</h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">ID: {req._id}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {/* Status Banner */}
                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold ${STATUS_BADGE[req.status]}`}>
                        {req.status === 'approved' ? <CheckCircle2 className="h-4 w-4" /> :
                         req.status === 'rejected' ? <XCircle className="h-4 w-4" /> :
                         <Shield className="h-4 w-4" />}
                        Status: {req.status.toUpperCase()}
                        <span className="ml-auto text-xs font-normal opacity-70">
                            Applied: {new Date(req.appliedDate).toLocaleDateString('en-IN')}
                        </span>
                    </div>

                    {/* Manager Photo */}
                    {(d.managerPhoto || d.image) && (
                        <div className="flex items-center gap-3">
                            <img src={d.managerPhoto || d.image} alt="Manager"
                                className="h-16 w-16 rounded-full object-cover ring-2 ring-violet-500/40" />
                            <div>
                                <p className="text-xs text-slate-500">Manager Photo</p>
                                <p className="font-semibold text-slate-200">{d.managerName || d.name || '—'}</p>
                            </div>
                        </div>
                    )}

                    {/* Identity Fields */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Identity</p>
                        <FieldRow icon={<User className="h-3.5 w-3.5" />} label="Manager Name" value={d.managerName || d.name} />
                        <FieldRow icon={<Building2 className="h-3.5 w-3.5" />} label="Agency Name" value={d.agencyName} />
                        <FieldRow icon={<Mail className="h-3.5 w-3.5" />} label="Email ID" value={d.emailId || d.email} />
                        <FieldRow icon={<Phone className="h-3.5 w-3.5" />} label="Mobile Number" value={d.mobileNumber || d.phone} />
                        <FieldRow icon={<Hash className="h-3.5 w-3.5" />} label="Mithichat ID" value={d.mithichatId} />
                        <FieldRow icon={<Hash className="h-3.5 w-3.5" />} label="Agency Code / Username" value={d.agencyCode || d.userName} />
                        {d.password && (
                            <div className="flex items-start gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
                                <div className="text-slate-500 mt-0.5 flex-shrink-0"><Shield className="h-3.5 w-3.5" /></div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Password</p>
                                    <p className="text-sm text-yellow-300 font-mono bg-slate-800/50 px-2 py-0.5 rounded break-all">{d.password}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reference Codes */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Reference Codes</p>
                        <FieldRow icon={<Hash className="h-3.5 w-3.5" />} label="Special Code" value={d.specialCode} />
                        <FieldRow icon={<Hash className="h-3.5 w-3.5" />} label="Referral Code" value={d.referralCode} />
                        <FieldRow icon={<Hash className="h-3.5 w-3.5" />} label="Agency ID" value={d.agencyId} />
                        <FieldRow icon={<UserCheck className="h-3.5 w-3.5" />} label="Invited By" value={d.invitedBy} />
                    </div>

                    {/* Hierarchy */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Parent Hierarchy</p>
                        <FieldRow icon={<Shield className="h-3.5 w-3.5" />} label="Parent Admin" value={d.parentAdmin} />
                        <FieldRow icon={<Shield className="h-3.5 w-3.5" />} label="Parent Super Admin" value={d.parentSuperAdmin} />
                        <FieldRow icon={<Shield className="h-3.5 w-3.5" />} label="Parent Operator" value={d.parentOperator} />
                        <FieldRow icon={<Shield className="h-3.5 w-3.5" />} label="Parent Owner" value={d.parentOwner} />
                    </div>

                    {/* Documents */}
                    <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/40 space-y-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Documents</p>
                        {[
                            { url: d.resume, label: 'Resume' },
                            { url: d.aadharFront, label: 'Aadhaar Front' },
                            { url: d.aadharBack, label: 'Aadhaar Back' },
                            { url: d.panCard, label: 'PAN Card' },
                        ].map(doc => (
                            <div key={doc.label} className="flex items-center justify-between">
                                <span className="text-xs text-slate-400 font-medium">{doc.label}</span>
                                <DocTile url={doc.url} label={doc.label} />
                            </div>
                        ))}
                        {!d.resume && !d.aadharFront && !d.aadharBack && !d.panCard && (
                            <p className="text-xs text-slate-600">No documents uploaded</p>
                        )}
                    </div>

                    {/* Approval Actions */}
                    {req.status === 'pending' && (
                        <div className="space-y-3">
                            {showReject ? (
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Reason for rejection (required)..."
                                        value={rejectReason}
                                        onChange={e => setRejectReason(e.target.value)}
                                        className="bg-slate-800 border-red-500/30"
                                    />
                                    <div className="flex gap-2">
                                        <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
                                            onClick={() => { if (!rejectReason.trim()) { toast.error('Enter rejection reason'); return; } onReject(req._id, rejectReason); }}
                                            disabled={loading}>
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                                            Confirm Reject
                                        </Button>
                                        <Button variant="outline" onClick={() => setShowReject(false)}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                        onClick={() => onApprove(req._id)} disabled={loading}>
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                        ✅ Approve
                                    </Button>
                                    <Button className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 gap-2"
                                        onClick={() => setShowReject(true)} disabled={loading}>
                                        <XCircle className="h-4 w-4" /> ❌ Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rejection info */}
                    {req.status === 'rejected' && req.rejectedBy && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-300">
                            <p className="font-semibold">Rejection Reason:</p>
                            <p className="text-xs mt-1 text-red-400">{req.rejectedBy.reason}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AgencyRequestsPage() {
    const [requests, setRequests] = useState<AgencyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [page, setPage] = useState(1);
    const [selectedReq, setSelectedReq] = useState<AgencyRequest | null>(null);
    const limit = 15;

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { requestType: 'Agency Request' };
            if (statusFilter !== 'all') params.status = statusFilter;
            const res = await apiClient.get('/api/ems/requests', params);
            if (res.success && Array.isArray(res.data)) {
                setRequests(res.data);
            } else {
                toast.error(res.message || 'Failed to load requests');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error loading agency requests');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const handleApprove = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await apiClient.post(`/api/ems/requests/${id}/approve`, { comments: 'Approved by admin' });
            if (res.success) {
                toast.success('✅ Agency request approved!');
                setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'approved' } : r));
                setSelectedReq(prev => prev?._id === id ? { ...prev, status: 'approved' } : prev);
            } else {
                toast.error(res.message || 'Approval failed');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error approving request');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (id: string, reason: string) => {
        setActionLoading(true);
        try {
            const res = await apiClient.post(`/api/ems/requests/${id}/reject`, { reason });
            if (res.success) {
                toast.success('Request rejected');
                setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'rejected' } : r));
                setSelectedReq(prev => prev?._id === id ? { ...prev, status: 'rejected' } : prev);
            } else {
                toast.error(res.message || 'Rejection failed');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error rejecting request');
        } finally {
            setActionLoading(false);
        }
    };

    // Filter + paginate
    const filtered = requests.filter(r => {
        const d = r.data;
        const q = search.toLowerCase();
        return !q ||
            (d.agencyName || '').toLowerCase().includes(q) ||
            (d.managerName || d.name || '').toLowerCase().includes(q) ||
            (d.emailId || d.email || '').toLowerCase().includes(q) ||
            (d.mobileNumber || d.phone || '').toLowerCase().includes(q) ||
            (d.mithichatId || '').toLowerCase().includes(q) ||
            (d.specialCode || '').toLowerCase().includes(q) ||
            r._id.toLowerCase().includes(q);
    });

    const totalPages = Math.ceil(filtered.length / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    const counts = { all: requests.length, pending: 0, approved: 0, rejected: 0 };
    requests.forEach(r => { if (r.status in counts) (counts as any)[r.status]++; });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                        Agency Requests
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Review, approve or reject agency applications — with full KYC document preview
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchRequests} className="gap-2">
                    <RefreshCw className="h-4 w-4" /> Refresh
                </Button>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
                    <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize
                            ${statusFilter === s
                                ? s === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                  : s === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                                  : s === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/50'
                                  : 'bg-violet-500/20 text-violet-300 border-violet-500/50'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                            }`}>
                        {s} ({(counts as any)[s]})
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name, email, phone, ID..."
                    value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                    className="pl-9" />
            </div>

            {/* Table */}
            <Card className="glass-card overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-700/50">
                                    <TableHead className="text-slate-300 font-bold w-8">Sr.</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Request ID</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Special Code</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Referral Code</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Agency ID</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Parent Admin</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Parent Super Admin</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Parent Operator</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Parent Owner</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Invited By</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Agency Name</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Manager Photo</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Manager Name</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Mithichat ID</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Password</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Email ID</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Mobile Number</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Agency Code</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Status</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Resume</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Aadhaar Front</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Aadhaar Back</TableHead>
                                    <TableHead className="text-slate-300 font-bold">PAN Card</TableHead>
                                    <TableHead className="text-slate-300 font-bold text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={23} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                                <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
                                                <span>Loading agency requests...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginated.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={23} className="text-center py-20">
                                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                                <Building2 className="h-8 w-8 text-slate-600" />
                                                <span>No agency requests found</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : paginated.map((req, idx) => {
                                    const d = req.data;
                                    return (
                                        <TableRow key={req._id} className="hover:bg-slate-800/40 border-slate-700/30 text-sm">
                                            <TableCell className="text-slate-500 text-xs">{(page - 1) * limit + idx + 1}</TableCell>

                                            {/* Request ID */}
                                            <TableCell>
                                                <span className="font-mono text-xs text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded">
                                                    {req._id.slice(-8)}
                                                </span>
                                            </TableCell>

                                            {/* Special Code */}
                                            <TableCell>
                                                <span className="text-xs font-mono text-slate-300">{d.specialCode || '—'}</span>
                                            </TableCell>

                                            {/* Referral Code */}
                                            <TableCell>
                                                <span className="text-xs font-mono text-blue-300">{d.referralCode || '—'}</span>
                                            </TableCell>

                                            {/* Agency ID */}
                                            <TableCell>
                                                <span className="text-xs font-mono text-slate-400">{d.agencyId || '—'}</span>
                                            </TableCell>

                                            {/* Parent Admin */}
                                            <TableCell className="text-xs text-slate-400">{d.parentAdmin || '—'}</TableCell>

                                            {/* Parent Super Admin */}
                                            <TableCell className="text-xs text-slate-400">{d.parentSuperAdmin || '—'}</TableCell>

                                            {/* Parent Operator */}
                                            <TableCell className="text-xs text-slate-400">{d.parentOperator || '—'}</TableCell>

                                            {/* Parent Owner */}
                                            <TableCell className="text-xs text-slate-400">{d.parentOwner || '—'}</TableCell>

                                            {/* Invited By */}
                                            <TableCell className="text-xs text-slate-400">{d.invitedBy || '—'}</TableCell>

                                            {/* Agency Name */}
                                            <TableCell>
                                                <span className="font-semibold text-slate-200">{d.agencyName || '—'}</span>
                                            </TableCell>

                                            {/* Manager Photo */}
                                            <TableCell>
                                                {(d.managerPhoto || d.image) ? (
                                                    <img src={d.managerPhoto || d.image} alt="Manager"
                                                        className="h-9 w-9 rounded-full object-cover ring-2 ring-violet-500/30" />
                                                ) : (
                                                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                                        {(d.managerName || d.name || 'A').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Manager Name */}
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-slate-200">{d.managerName || d.name || '—'}</p>
                                                </div>
                                            </TableCell>

                                            {/* Mithichat ID */}
                                            <TableCell>
                                                <span className="text-xs font-mono text-amber-300">{d.mithichatId || '—'}</span>
                                            </TableCell>

                                            {/* Password */}
                                            <TableCell className="text-xs text-slate-400">{d.password || '—'}</TableCell>

                                            {/* Email ID */}
                                            <TableCell className="text-xs text-slate-300">{d.emailId || d.email || '—'}</TableCell>

                                            {/* Mobile Number */}
                                            <TableCell className="text-xs text-slate-300">{d.mobileNumber || d.phone || '—'}</TableCell>

                                            {/* Agency Code */}
                                            <TableCell>
                                                <span className="text-xs font-mono text-emerald-300">{d.agencyCode || d.userName || '—'}</span>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_BADGE[req.status]}`}>
                                                    {req.status}
                                                </span>
                                            </TableCell>

                                            {/* Documents */}
                                            <TableCell><DocTile url={d.resume} label="Resume" /></TableCell>
                                            <TableCell><DocTile url={d.aadharFront} label="Aadhaar Front" /></TableCell>
                                            <TableCell><DocTile url={d.aadharBack} label="Aadhaar Back" /></TableCell>
                                            <TableCell><DocTile url={d.panCard} label="PAN Card" /></TableCell>

                                            {/* Actions */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 justify-center">
                                                    <Button size="sm" variant="outline"
                                                        className="h-7 px-2 text-xs gap-1 text-blue-300 border-blue-500/30 hover:bg-blue-500/10"
                                                        onClick={() => setSelectedReq(req)}>
                                                        <Eye className="h-3 w-3" /> View
                                                    </Button>
                                                    {req.status === 'pending' && (
                                                        <>
                                                            <Button size="sm"
                                                                className="h-7 px-2 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                onClick={() => handleApprove(req._id)}
                                                                disabled={actionLoading}>
                                                                <CheckCircle2 className="h-3 w-3" /> ✅
                                                            </Button>
                                                            <Button size="sm"
                                                                className="h-7 px-2 text-xs gap-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30"
                                                                onClick={() => setSelectedReq(req)}
                                                                disabled={actionLoading}>
                                                                <XCircle className="h-3 w-3" /> ❌
                                                            </Button>
                                                        </>
                                                    )}
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
                    <span className="text-sm text-slate-500">Page {page} of {totalPages} — {filtered.length} results</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="gap-1">
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="gap-1">
                            Next <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedReq && (
                <RequestDetailModal
                    req={selectedReq}
                    onClose={() => setSelectedReq(null)}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    loading={actionLoading}
                />
            )}
        </div>
    );
}
