'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, RefreshCw, FileSpreadsheet, FileText, Filter,
    CheckCircle2, XCircle, Eye, EyeOff, ChevronDown, ChevronUp,
    UserCheck, Shield, Sparkles, Copy, ZoomIn, ZoomOut,
    RotateCw, Download, X, Calendar, MapPin, Mail, Phone,
    Clock, Award, Briefcase, FileCheck, ArrowUpDown, ChevronLeft,
    ChevronRight, Check, AlertCircle, HelpCircle, User, AlertTriangle, Lock, Key, ArrowLeftRight, File
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { ApprovalSuccessDialog, ApprovalCredentials } from '@/components/requests/ApprovalSuccessDialog';

// Types Definition
export type StatusType = 'active' | 'pending' | 'ready_for_interview' | 'rejected';

export interface ReviewInfo {
    reviewerName: string;
    reviewDate: string;
    remarks: string;
    status: 'Approved' | 'Pending' | 'Rejected' | 'Ready For Interview' | 'Under Review';
}

export interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    actor: string;
    type: 'submission' | 'operator_review' | 'interview' | 'owner_review' | 'approval' | 'rejection';
}

export interface SuperAdminRequestData {
    id: string;
    srNo: number;
    invitedBy: string;
    name: string;
    profilePhoto?: string;
    meethiChatId: string;
    username: string;
    gender: 'Male' | 'Female' | 'Other';
    age: number;
    dob?: string;
    maritalStatus?: string;
    email: string;
    mobile: string;
    alternateMobile?: string;
    country: string;
    state: string;
    district: string;
    city?: string;
    pincode?: string;
    fullAddress?: string;
    registrationDate: string;
    aadhaarNo?: string;
    panNo?: string;
    aadhaarFront: string;
    aadhaarBack: string;
    panCard: string;
    resumeUrl?: string;
    qualification?: string;
    experience?: string;
    previousCompany?: string;
    skills?: string[];
    reviewByOperator: ReviewInfo;
    reviewByOwner: ReviewInfo;
    password?: string;
    status: StatusType;
    timeline: TimelineEvent[];
    superAdminCode?: string;
    referralCode?: string;
}


export default function SuperAdminRequestsPage() {
    const { user: currentUser } = useAuth();
    const [requests, setRequests] = useState<SuperAdminRequestData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
    
    // Filters State
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [genderFilter, setGenderFilter] = useState<string>('all');
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [stateFilter, setStateFilter] = useState<string>('all');
    const [districtFilter, setDistrictFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    // Sorting & Pagination
    const [sortColumn, setSortColumn] = useState<keyof SuperAdminRequestData>('srNo');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modals & Drawers
    const [selectedReq, setSelectedReq] = useState<SuperAdminRequestData | null>(null);
    const [detailTab, setDetailTab] = useState<'profile' | 'identity' | 'review' | 'timeline'>('profile');
    
    // Image Zoom Modal
    const [imageZoom, setImageZoom] = useState<{ isOpen: boolean; url: string; title: string; zoom: number; rotate: number }>({
        isOpen: false,
        url: '',
        title: '',
        zoom: 1,
        rotate: 0
    });

    // Accept / Reject Confirmation Modal
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'accept' | 'reject';
        request: SuperAdminRequestData | null;
    }>({
        isOpen: false,
        type: 'accept',
        request: null
    });

    const [actionRemarks, setActionRemarks] = useState('');
    const [assignedCode, setAssignedCode] = useState('');
    const [selectedRejectReason, setSelectedRejectReason] = useState('Document Mismatch');
    const [isSubmittingAction, setIsSubmittingAction] = useState(false);
    // Approval Success Dialog
    const [approvalDialog, setApprovalDialog] = useState<{
        isOpen: boolean;
        credentials: ApprovalCredentials | null;
        applicantName: string;
    }>({
        isOpen: false,
        credentials: null,
        applicantName: ''
    });

    // Toggle Password Visibility
    const togglePasswordVisibility = (id: string) => {
        setShowPasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Fetch data from backend - no mock fallback
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/ems/requests', { requestType: 'Super Admin Request' });
            const items: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.requests) ? res.data.requests : (res?.data?.data ?? []);
            if (res && (res.success !== false)) {
                const apiData: SuperAdminRequestData[] = items.map((item: any, idx: number) => {
                    const d = item.data || {};
                    const opRev = item.approvedBy?.find((a: any) => a.role === 'operator') || item.reviewByOperator || {};
                    const ownerRev = item.approvedBy?.find((a: any) => a.role === 'owner') || item.reviewByOwner || {};
                    
                    return {
                        id: item._id || '',
                        srNo: idx + 1,
                        invitedBy: d.invitedBy || item.createdByRole || 'Direct Application',
                        name: d.name || 'Applicant',
                        profilePhoto: d.profilePhoto || '',
                        meethiChatId: d.meethiChatId || d.mithiChatId || '',
                        username: d.username ? `@${d.username.replace('@','')}` : '',
                        gender: (d.gender as any) || 'Male',
                        age: d.age || 0,
                        dob: d.dob || '',
                        maritalStatus: d.maritalStatus || 'Single',
                        email: d.email || '',
                        mobile: d.phoneNumber || d.mobile || '',
                        alternateMobile: d.alternateMobile || '—',
                        country: d.country || 'India',
                        state: d.state || '',
                        district: d.district || d.city || '',
                        city: d.city || '',
                        pincode: d.pincode || '',
                        fullAddress: d.fullAddress || '',
                        registrationDate: item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : '—',
                        aadhaarNo: d.aadhaarNo || '',
                        panNo: d.panNo || '',
                        aadhaarFront: d.adharFront || d.aadhaarFront || '',
                        aadhaarBack: d.adharBack || d.aadhaarBack || '',
                        panCard: d.pan || d.panCard || '',
                        qualification: d.qualification || '',
                        experience: d.experience || '',
                        previousCompany: d.previousCompany || '',
                        skills: d.skills ? (Array.isArray(d.skills) ? d.skills : d.skills.split(',')) : [],
                        reviewByOperator: {
                            reviewerName: opRev.reviewerName || (opRev.userId ? String(opRev.userId) : 'Operator Team'),
                            reviewDate: opRev.date ? new Date(opRev.date).toLocaleString('en-IN') : '—',
                            remarks: opRev.remarks || opRev.comments || 'Awaiting Operator review.',
                            status: opRev.status || 'Pending'
                        },
                        reviewByOwner: {
                            reviewerName: ownerRev.reviewerName || (ownerRev.userId ? String(ownerRev.userId) : 'Owner Team'),
                            reviewDate: ownerRev.date ? new Date(ownerRev.date).toLocaleString('en-IN') : '—',
                            remarks: ownerRev.remarks || ownerRev.comments || 'Awaiting Owner decision.',
                            status: ownerRev.status || (item.status === 'approved' ? 'Approved' : 'Pending')
                        },
                        password: (() => {
                            const explicit = d.password || item.passwordBeforeApproval;
                            if (explicit && explicit.trim() !== '') return explicit;
                            const cleanName = (d.name || 'User').replace(/[^a-zA-Z]/g, '');
                            const prefix = cleanName.length >= 3
                                ? cleanName.slice(0, 3).charAt(0).toUpperCase() + cleanName.slice(1, 3).toLowerCase()
                                : (cleanName.length > 0 ? cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase() : 'Mith');
                            const digits = (d.mobile || d.phoneNumber || d.email || '1234').replace(/\D/g, '');
                            const numPart = digits.length >= 4 ? digits.slice(-4) : '1234';
                            return `${prefix}@${numPart}!1`;
                        })(),
                        status: item.status === 'approved' ? 'active' : item.status === 'rejected' ? 'rejected' : item.status === 'ready_for_interview' ? 'ready_for_interview' : 'pending',
                        superAdminCode: d.superAdminCode || d.specialCode || '',
                        referralCode: d.referralCode || '',
                        timeline: item.timeline || [
                            { id: '1', title: 'Application Received', description: 'Application filed successfully', timestamp: item.createdAt || new Date().toISOString(), actor: 'System', type: 'submission' }
                        ]
                    };
                });
                setRequests(apiData);
            } else {
                setRequests([]);
            }
        } catch (err) {
            console.error('Failed to load super admin requests:', err);
            toast.error('Failed to load requests. Please refresh.');
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchRequests();
        setIsRefreshing(false);
        toast.success('Requests updated with latest data');
    };

    // Filter Logic
    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            // Search Query Filter
            const q = search.trim().toLowerCase();
            const matchesSearch = !q ||
                req.name.toLowerCase().includes(q) ||
                req.meethiChatId.toLowerCase().includes(q) ||
                req.username.toLowerCase().includes(q) ||
                req.email.toLowerCase().includes(q) ||
                req.mobile.includes(q) ||
                req.state.toLowerCase().includes(q) ||
                req.district.toLowerCase().includes(q);

            // Dropdown Filters
            const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
            const matchesGender = genderFilter === 'all' || req.gender.toLowerCase() === genderFilter.toLowerCase();
            const matchesCountry = countryFilter === 'all' || req.country.toLowerCase() === countryFilter.toLowerCase();
            const matchesState = stateFilter === 'all' || req.state.toLowerCase() === stateFilter.toLowerCase();
            const matchesDistrict = districtFilter === 'all' || req.district.toLowerCase() === districtFilter.toLowerCase();

            // Date Filter Presets
            let matchesDate = true;
            if (dateFilter !== 'all') {
                const regDate = new Date(req.registrationDate).getTime();
                const now = Date.now();
                if (dateFilter === 'today') {
                    matchesDate = now - regDate <= 24 * 60 * 60 * 1000;
                } else if (dateFilter === '7days') {
                    matchesDate = now - regDate <= 7 * 24 * 60 * 60 * 1000;
                } else if (dateFilter === '30days') {
                    matchesDate = now - regDate <= 30 * 24 * 60 * 60 * 1000;
                }
            }

            return matchesSearch && matchesStatus && matchesGender && matchesCountry && matchesState && matchesDistrict && matchesDate;
        });
    }, [requests, search, statusFilter, genderFilter, countryFilter, stateFilter, districtFilter, dateFilter]);

    // Sorting Logic
    const sortedRequests = useMemo(() => {
        return [...filteredRequests].sort((a, b) => {
            let valA: any = a[sortColumn];
            let valB: any = b[sortColumn];

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredRequests, sortColumn, sortDirection]);

    // Pagination Logic
    const totalPages = Math.ceil(sortedRequests.length / pageSize) || 1;
    const paginatedRequests = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedRequests.slice(start, start + pageSize);
    }, [sortedRequests, page, pageSize]);

    // Stats Computation
    const stats = useMemo(() => {
        return {
            total: requests.length,
            active: requests.filter(r => r.status === 'active').length,
            pending: requests.filter(r => r.status === 'pending').length,
            readyForInterview: requests.filter(r => r.status === 'ready_for_interview').length,
            rejected: requests.filter(r => r.status === 'rejected').length,
        };
    }, [requests]);

    // Export Handlers
    const exportToCSV = () => {
        if (filteredRequests.length === 0) {
            toast.error('No data available to export');
            return;
        }

        const headers = [
            'SR', 'Invited By', 'Name', 'Meethi Chat ID', 'User Name', 'Gender',
            'Age', 'Email', 'Mobile Number', 'Country', 'State', 'District',
            'Registration Date', 'Operator Review Status', 'Owner Review Status', 'Password', 'Status'
        ];

        const rows = filteredRequests.map(r => [
            r.srNo,
            `"${r.invitedBy}"`,
            `"${r.name}"`,
            `"${r.meethiChatId}"`,
            `"${r.username}"`,
            r.gender,
            r.age,
            `"${r.email}"`,
            `"${r.mobile}"`,
            `"${r.country}"`,
            `"${r.state}"`,
            `"${r.district}"`,
            `"${r.registrationDate}"`,
            `"${r.reviewByOperator.status}"`,
            `"${r.reviewByOwner.status}"`,
            `"${r.password}"`,
            `"${r.status}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Super_Admin_Requests_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV report exported successfully');
    };

    const handlePrintPDF = () => {
        window.print();
    };

    // Sort Toggle Handler
    const handleSort = (col: keyof SuperAdminRequestData) => {
        if (sortColumn === col) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(col);
            setSortDirection('asc');
        }
    };

    // Transfer Modal State
    const [transferModal, setTransferModal] = useState<{
        isOpen: boolean;
        request: SuperAdminRequestData | null;
    }>({
        isOpen: false,
        request: null
    });
    const [targetRecipient, setTargetRecipient] = useState('Vikramaditya Singh (Super Admin)');
    const [transferNote, setTransferNote] = useState('');
    const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

    // Action Handlers (Accept / Reject)
    const handleOpenConfirm = (req: SuperAdminRequestData, type: 'accept' | 'reject') => {
        setConfirmModal({
            isOpen: true,
            type,
            request: req
        });
        setActionRemarks('');
        setAssignedCode(req.superAdminCode || `SA-${req.district.slice(0, 3).toUpperCase()}-00${req.srNo}`);
    };

    const handleOpenTransfer = (req: SuperAdminRequestData) => {
        setTransferModal({ isOpen: true, request: req });
        setTargetRecipient('Vikramaditya Singh (Super Admin)');
        setTransferNote('');
    };

    const submitTransfer = async () => {
        const req = transferModal.request;
        if (!req) return;

        setIsSubmittingTransfer(true);
        try {
            await apiClient.post(`/api/ems/requests/${req.id}/transfer`, {
                targetRecipient,
                note: transferNote
            }).catch(() => null);

            setRequests(prev => prev.map(item => {
                if (item.id === req.id) {
                    const newTimelineEvent: TimelineEvent = {
                        id: String(Date.now()),
                        title: 'Request Transferred',
                        description: `Reassigned to ${targetRecipient}. Note: ${transferNote || 'No specific note'}`,
                        timestamp: new Date().toLocaleString(),
                        actor: currentUser?.name || 'Owner',
                        type: 'interview'
                    };
                    return {
                        ...item,
                        invitedBy: `Transferred to ${targetRecipient}`,
                        timeline: [newTimelineEvent, ...item.timeline]
                    };
                }
                return item;
            }));

            toast.success(`🔀 Request for ${req.name} transferred to ${targetRecipient}!`);
            setTransferModal({ isOpen: false, request: null });
        } catch (err: any) {
            toast.error(err?.message || 'Failed to transfer request');
        } finally {
            setIsSubmittingTransfer(false);
        }
    };

    const submitAction = async () => {
        const req = confirmModal.request;
        if (!req) return;

        const isAccept = confirmModal.type === 'accept';

        if (!isAccept) {
            const rejectMsg = (selectedRejectReason || actionRemarks || '').trim();
            if (rejectMsg.length < 10) {
                toast.error('Rejection reason must be at least 10 characters. Please provide a proper explanation.');
                return;
            }
        }

        setIsSubmittingAction(true);
        try {
            const endpoint = `/api/ems/requests/${req.id}/${isAccept ? 'approve' : 'reject'}`;
            const payload = isAccept
                ? { comments: actionRemarks || 'Approved by Owner', superAdminCode: assignedCode, password: req.password }
                : { reason: (selectedRejectReason || actionRemarks || '').trim(), comments: actionRemarks || `Rejected: ${selectedRejectReason}` };

            const response = await apiClient.post(endpoint, payload);

            if (response.success) {
                if (isAccept && response.data?.generatedCredentials) {
                    setApprovalDialog({
                        isOpen: true,
                        credentials: response.data.generatedCredentials,
                        applicantName: req.name
                    });
                }

                setRequests(prev => prev.map(item => {
                    if (item.id === req.id) {
                        const newStatus: StatusType = isAccept ? 'active' : 'rejected';
                        return {
                            ...item,
                            status: newStatus,
                            superAdminCode: isAccept ? (assignedCode || item.superAdminCode) : item.superAdminCode,
                            reviewByOwner: {
                                reviewerName: currentUser?.name || 'Owner (You)',
                                reviewDate: new Date().toLocaleString('en-IN'),
                                remarks: actionRemarks || (isAccept ? 'Application Approved & Super Admin Role Granted.' : `Rejected: ${selectedRejectReason}`),
                                status: isAccept ? 'Approved' : 'Rejected'
                            },
                            timeline: [{
                                id: String(Date.now()),
                                title: isAccept ? 'Owner Approved' : 'Owner Rejected',
                                description: actionRemarks || (isAccept ? 'Super Admin role granted.' : `Reason: ${selectedRejectReason}`),
                                timestamp: new Date().toLocaleString('en-IN'),
                                actor: currentUser?.name || 'Owner',
                                type: isAccept ? 'approval' : 'rejection'
                            }, ...item.timeline]
                        };
                    }
                    return item;
                }));

                if (!isAccept || !response.data?.generatedCredentials) {
                    toast.success(isAccept ? `✅ Super Admin request for ${req.name} APPROVED!` : `❌ Request for ${req.name} REJECTED.`);
                }
                setConfirmModal({ isOpen: false, type: 'accept', request: null });
            } else {
                toast.error(response.message || 'Failed to process action. Please try again.');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error executing decision action');
        } finally {
            setIsSubmittingAction(false);
        }
    };

    // Helper function to copy text
    const copyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    // Render Status Badge
    const renderStatusBadge = (status: StatusType) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        🟢 Active
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        🟡 Pending
                    </span>
                );
            case 'ready_for_interview':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        🔵 Ready For Interview
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/80 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        🔴 Rejected
                    </span>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-blue-500/5">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                Super Admin Request
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                                    Owner Review Portal
                                </span>
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                Review, verify documents, and approve applications submitted for Meethi Chat Super Admin roles.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-sm font-medium border border-slate-200 dark:border-slate-700 transition-all shadow-xs disabled:opacity-60"
                        title="Refresh Table Data"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                        <span>Refresh</span>
                    </button>

                    <button
                        onClick={exportToCSV}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm font-medium border border-emerald-200/80 dark:border-emerald-800/80 transition-all shadow-xs"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Export Excel</span>
                    </button>

                    <button
                        onClick={handlePrintPDF}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-200/80 dark:border-blue-800/80 transition-all shadow-xs"
                    >
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* Quick Insights Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Requests</p>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.total}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Briefcase className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-amber-200/60 dark:border-amber-900/40 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">🟡 Pending</p>
                        <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">{stats.pending}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-blue-200/60 dark:border-blue-900/40 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">🔵 Interview</p>
                        <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 mt-1">{stats.readyForInterview}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        <UserCheck className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-emerald-200/60 dark:border-emerald-900/40 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">🟢 Active</p>
                        <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">{stats.active}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-red-200/60 dark:border-red-900/40 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
                    <div>
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">🔴 Rejected</p>
                        <p className="text-2xl font-extrabold text-red-700 dark:text-red-400 mt-1">{stats.rejected}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                        <XCircle className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Search & Filters Controls Section */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-blue-500/5 space-y-4">
                
                {/* Search Bar + Collapsible Filter Switch */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by Name, Meethi Chat ID, Username, Email, Mobile..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFiltersExpanded(!filtersExpanded)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                filtersExpanded || statusFilter !== 'all' || genderFilter !== 'all' || countryFilter !== 'all' || stateFilter !== 'all' || districtFilter !== 'all' || dateFilter !== 'all'
                                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            <Filter className="w-4 h-4 text-blue-600" />
                            <span>Filters</span>
                            {filtersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {(search || statusFilter !== 'all' || genderFilter !== 'all' || countryFilter !== 'all' || stateFilter !== 'all' || districtFilter !== 'all' || dateFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setStatusFilter('all');
                                    setGenderFilter('all');
                                    setCountryFilter('all');
                                    setStateFilter('all');
                                    setDistrictFilter('all');
                                    setDateFilter('all');
                                    setPage(1);
                                }}
                                className="px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border border-red-200/60 dark:border-red-900/50"
                            >
                                Reset All
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters Dropdown Controls */}
                <AnimatePresence>
                    {(filtersExpanded || statusFilter !== 'all' || genderFilter !== 'all' || stateFilter !== 'all' || dateFilter !== 'all') && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
                        >
                            {/* Status Filter */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="active">🟢 Active</option>
                                    <option value="pending">🟡 Pending</option>
                                    <option value="ready_for_interview">🔵 Ready For Interview</option>
                                    <option value="rejected">🔴 Rejected</option>
                                </select>
                            </div>

                            {/* Gender Filter */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Gender</label>
                                <select
                                    value={genderFilter}
                                    onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="all">All Genders</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Country Filter */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Country</label>
                                <select
                                    value={countryFilter}
                                    onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="all">All Countries</option>
                                    <option value="india">India 🇮🇳</option>
                                    <option value="usa">USA 🇺🇸</option>
                                    <option value="uae">UAE 🇦🇪</option>
                                </select>
                            </div>

                            {/* State Filter */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">State</label>
                                <select
                                    value={stateFilter}
                                    onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="all">All States</option>
                                    <option value="maharashtra">Maharashtra</option>
                                    <option value="karnataka">Karnataka</option>
                                    <option value="delhi">Delhi</option>
                                    <option value="uttar pradesh">Uttar Pradesh</option>
                                </select>
                            </div>

                            {/* District Filter */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">District</label>
                                <select
                                    value={districtFilter}
                                    onChange={(e) => { setDistrictFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="all">All Districts</option>
                                    <option value="mumbai city">Mumbai</option>
                                    <option value="bengaluru urban">Bengaluru</option>
                                    <option value="new delhi">New Delhi</option>
                                    <option value="pune">Pune</option>
                                    <option value="lucknow">Lucknow</option>
                                </select>
                            </div>

                            {/* Registration Date Filter */}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Registration Date</label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="7days">Last 7 Days</option>
                                    <option value="30days">Last 30 Days</option>
                                </select>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Data Table Card */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-blue-500/5 overflow-hidden">
                <div className="overflow-x-auto max-h-[680px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                    <table className="w-full text-left border-collapse text-xs">
                        {/* Sticky Table Header */}
                        <thead className="sticky top-0 z-20 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700 select-none">
                            <tr>
                                <th className="p-3.5 whitespace-nowrap text-center">
                                    <button onClick={() => handleSort('srNo')} className="flex items-center gap-1 hover:text-blue-600 mx-auto">
                                        SR <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                                <th className="p-3.5 whitespace-nowrap">Invited By</th>
                                <th className="p-3.5 whitespace-nowrap">
                                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-blue-600">
                                        Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                                <th className="p-3.5 whitespace-nowrap">Meethi Chat ID</th>
                                <th className="p-3.5 whitespace-nowrap">User Name</th>
                                <th className="p-3.5 whitespace-nowrap">Gender</th>
                                <th className="p-3.5 whitespace-nowrap text-center">
                                    <button onClick={() => handleSort('age')} className="flex items-center gap-1 hover:text-blue-600 mx-auto">
                                        Age <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                                <th className="p-3.5 whitespace-nowrap">Email</th>
                                <th className="p-3.5 whitespace-nowrap">Mobile Number</th>
                                <th className="p-3.5 whitespace-nowrap">Country</th>
                                <th className="p-3.5 whitespace-nowrap">State</th>
                                <th className="p-3.5 whitespace-nowrap">District</th>
                                <th className="p-3.5 whitespace-nowrap">
                                    <button onClick={() => handleSort('registrationDate')} className="flex items-center gap-1 hover:text-blue-600">
                                        Reg Date & Time <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                                <th className="p-3.5 whitespace-nowrap text-center">Aadhaar Front</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Aadhaar Back</th>
                                <th className="p-3.5 whitespace-nowrap text-center">PAN Card</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Resume / CV</th>
                                <th className="p-3.5 whitespace-nowrap">Review By Operator</th>
                                <th className="p-3.5 whitespace-nowrap">Review By Owner</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Action</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Password</th>
                                <th className="p-3.5 whitespace-nowrap text-center">
                                    <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:text-blue-600 mx-auto">
                                        Status <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                            {loading ? (
                                // Loading Skeleton Rows
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="p-4 text-center"><div className="h-4 w-6 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-8 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4"><div className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4 text-center"><div className="h-10 w-14 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-10 w-14 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-10 w-14 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" /></td>
                                    </tr>
                                ))
                            ) : paginatedRequests.length === 0 ? (
                                // Empty State Illustration
                                <tr>
                                    <td colSpan={21} className="p-12 text-center">
                                        <div className="max-w-md mx-auto space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mx-auto border border-blue-200/60 dark:border-blue-800/60">
                                                <Search className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-slate-800 dark:text-white">No Super Admin Requests Found</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    We couldn't find any applicant matching your search query or selected filter criteria.
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSearch('');
                                                    setStatusFilter('all');
                                                    setGenderFilter('all');
                                                    setCountryFilter('all');
                                                    setStateFilter('all');
                                                    setDistrictFilter('all');
                                                    setDateFilter('all');
                                                }}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20"
                                            >
                                                Clear Filters
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRequests.map((req, idx) => (
                                    <tr
                                        key={req.id}
                                        className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50 transition-colors group"
                                    >
                                        {/* 1. SR */}
                                        <td className="p-3.5 text-center font-bold text-slate-500 dark:text-slate-400">
                                            #{(page - 1) * pageSize + idx + 1}
                                        </td>

                                        {/* 2. Invited By */}
                                        <td className="p-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <span>{req.invitedBy}</span>
                                            </div>
                                        </td>

                                        {/* 3. Name */}
                                        <td className="p-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                {req.profilePhoto ? (
                                                    <img
                                                        src={req.profilePhoto}
                                                        alt={req.name}
                                                        className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                                        {req.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                        {req.name}
                                                    </p>
                                                    {req.superAdminCode && (
                                                        <span className="text-[10px] text-blue-600 font-mono bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                                                            {req.superAdminCode}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* 4. Meethi Chat ID */}
                                        <td className="p-3.5 whitespace-nowrap">
                                            <button
                                                onClick={() => copyText(req.meethiChatId, 'Meethi Chat ID')}
                                                className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-950 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                                                title="Click to copy ID"
                                            >
                                                <span>{req.meethiChatId}</span>
                                                <Copy className="w-3 h-3 text-slate-400" />
                                            </button>
                                        </td>

                                        {/* 5. User Name */}
                                        <td className="p-3.5 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                                            {req.username}
                                        </td>

                                        {/* 6. Gender */}
                                        <td className="p-3.5 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                                req.gender === 'Female'
                                                    ? 'bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-900/50'
                                                    : 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                            }`}>
                                                {req.gender}
                                            </span>
                                        </td>

                                        {/* 7. Age */}
                                        <td className="p-3.5 whitespace-nowrap text-center font-bold text-slate-700 dark:text-slate-300">
                                            {req.age} Yrs
                                        </td>

                                        {/* 8. Email */}
                                        <td className="p-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{req.email}</span>
                                                <button
                                                    onClick={() => copyText(req.email, 'Email')}
                                                    className="text-slate-400 hover:text-blue-600 transition-colors ml-1"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* 9. Mobile Number */}
                                        <td className="p-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-mono">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{req.mobile}</span>
                                                <button
                                                    onClick={() => copyText(req.mobile, 'Mobile Number')}
                                                    className="text-slate-400 hover:text-blue-600 transition-colors ml-1"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* 10. Country */}
                                        <td className="p-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                                            🇮🇳 {req.country}
                                        </td>

                                        {/* 11. State */}
                                        <td className="p-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                                            {req.state}
                                        </td>

                                        {/* 12. District */}
                                        <td className="p-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                                            {req.district}
                                        </td>

                                        {/* 13. Registration Date & Time */}
                                        <td className="p-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                            {req.registrationDate}
                                        </td>

                                        {/* 14. Aadhaar Front Side */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            {req.aadhaarFront ? (
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setImageZoom({ isOpen: true, url: req.aadhaarFront, title: `${req.name} - Aadhaar Front`, zoom: 1, rotate: 0 })}
                                                        className="relative group/img overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs hover:border-blue-500 transition-all"
                                                    >
                                                        <img src={req.aadhaarFront} alt="Aadhaar Front" className="w-12 h-8 object-cover" />
                                                        <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => setImageZoom({ isOpen: true, url: req.aadhaarFront, title: `${req.name} - Aadhaar Front`, zoom: 1, rotate: 0 })}
                                                        className="text-blue-600 hover:text-blue-700 font-semibold text-[11px] hover:underline"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs font-mono">—</span>
                                            )}
                                        </td>

                                        {/* 15. Aadhaar Back Side */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            {req.aadhaarBack ? (
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setImageZoom({ isOpen: true, url: req.aadhaarBack, title: `${req.name} - Aadhaar Back`, zoom: 1, rotate: 0 })}
                                                        className="relative group/img overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs hover:border-blue-500 transition-all"
                                                    >
                                                        <img src={req.aadhaarBack} alt="Aadhaar Back" className="w-12 h-8 object-cover" />
                                                        <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => setImageZoom({ isOpen: true, url: req.aadhaarBack, title: `${req.name} - Aadhaar Back`, zoom: 1, rotate: 0 })}
                                                        className="text-blue-600 hover:text-blue-700 font-semibold text-[11px] hover:underline"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs font-mono">—</span>
                                            )}
                                        </td>

                                        {/* 16. PAN Card */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            {req.panCard ? (
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => setImageZoom({ isOpen: true, url: req.panCard, title: `${req.name} - PAN Card`, zoom: 1, rotate: 0 })}
                                                        className="relative group/img overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs hover:border-emerald-500 transition-all"
                                                    >
                                                        <img src={req.panCard} alt="PAN Card" className="w-12 h-8 object-cover" />
                                                        <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => setImageZoom({ isOpen: true, url: req.panCard, title: `${req.name} - PAN Card`, zoom: 1, rotate: 0 })}
                                                        className="text-blue-600 hover:text-blue-700 font-semibold text-[11px] hover:underline"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-xs font-mono">—</span>
                                            )}
                                        </td>

                                        {/* 17. Review By Operator */}
                                        <td className="p-3.5 whitespace-nowrap">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full ${
                                                        req.reviewByOperator.status === 'Approved' ? 'bg-emerald-500' :
                                                        req.reviewByOperator.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500'
                                                    }`} />
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                        {req.reviewByOperator.reviewerName}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]" title={req.reviewByOperator.remarks}>
                                                    {req.reviewByOperator.remarks}
                                                </p>
                                            </div>
                                        </td>

                                        {/* 18. Review By Owner */}
                                        <td className="p-3.5 whitespace-nowrap">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`w-2 h-2 rounded-full ${
                                                        req.reviewByOwner.status === 'Approved' ? 'bg-emerald-500' :
                                                        req.reviewByOwner.status === 'Rejected' ? 'bg-red-500' : 'bg-blue-500'
                                                    }`} />
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                        {req.reviewByOwner.reviewerName}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]" title={req.reviewByOwner.remarks}>
                                                    {req.reviewByOwner.remarks}
                                                </p>
                                            </div>
                                        </td>

                                        {/* 19. Action Column */}
                                        <td className="p-3.5 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {/* Accept Button */}
                                                <button
                                                    onClick={() => handleOpenConfirm(req, 'accept')}
                                                    disabled={req.status === 'active'}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-[11px] transition-all shadow-xs"
                                                    title="Accept Request & Grant Super Admin Role"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Accept</span>
                                                </button>

                                                {/* Reject Button */}
                                                <button
                                                    onClick={() => handleOpenConfirm(req, 'reject')}
                                                    disabled={req.status === 'rejected'}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-semibold text-[11px] transition-all shadow-xs"
                                                    title="Reject Application"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    <span>Reject</span>
                                                </button>

                                                {/* Transfer Button */}
                                                <button
                                                    onClick={() => handleOpenTransfer(req)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] transition-all shadow-xs"
                                                    title="Transfer Request to Another Recipient"
                                                >
                                                    <ArrowLeftRight className="w-3.5 h-3.5" />
                                                    <span>Transfer</span>
                                                </button>

                                                {/* View Details Icon Button */}
                                                <button
                                                    onClick={() => setSelectedReq(req)}
                                                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 transition-all"
                                                    title="View Full Application Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* 20. Password Column (Before Status) */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <div className="inline-flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <span className="font-mono text-slate-800 dark:text-slate-200 text-xs font-bold min-w-[70px] text-center">
                                                    {showPasswords[req.id] ? req.password : '••••••••'}
                                                </span>
                                                <button
                                                    onClick={() => togglePasswordVisibility(req.id)}
                                                    className="p-0.5 text-slate-400 hover:text-blue-600 transition-colors"
                                                    title={showPasswords[req.id] ? "Hide Password" : "Show Password"}
                                                >
                                                    {showPasswords[req.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                                <button
                                                    onClick={() => copyText(req.password || '', 'Password')}
                                                    className="p-0.5 text-slate-400 hover:text-blue-600 transition-colors"
                                                    title="Copy Password"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* 21. Status Column */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            {renderStatusBadge(req.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer & Pagination */}
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                        <span>Showing</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                            {sortedRequests.length > 0 ? (page - 1) * pageSize + 1 : 0}
                        </span>
                        <span>to</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                            {Math.min(page * pageSize, sortedRequests.length)}
                        </span>
                        <span>of</span>
                        <span className="font-bold text-slate-900 dark:text-white">{sortedRequests.length}</span>
                        <span>entries</span>

                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                            className="ml-2 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                        >
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setPage(p => Math.max(p - 1, 1))}
                            disabled={page === 1}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium disabled:opacity-40 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Previous</span>
                        </button>

                        <div className="flex items-center gap-1 px-2">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                        page === i + 1
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                            disabled={page === totalPages || totalPages === 0}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-medium disabled:opacity-40 transition-all"
                        >
                            <span>Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* VIEW DETAILS MODAL / DRAWER */}
            <AnimatePresence>
                {selectedReq && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
                        <motion.div
                            initial={{ x: '100%', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                            className="w-full max-w-3xl h-full sm:h-[94vh] bg-white dark:bg-slate-900 rounded-none sm:rounded-[14px] border-l sm:border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Drawer Header */}
                            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {selectedReq.profilePhoto ? (
                                        <img src={selectedReq.profilePhoto} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-blue-500" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-base">
                                            {selectedReq.name.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedReq.name}</h2>
                                            {renderStatusBadge(selectedReq.status)}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Meethi Chat ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{selectedReq.meethiChatId}</span> • Registered on {selectedReq.registrationDate}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedReq(null)}
                                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Navigation Tabs inside Drawer */}
                            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 text-xs font-semibold">
                                <button
                                    onClick={() => setDetailTab('profile')}
                                    className={`py-3 px-4 border-b-2 transition-colors ${
                                        detailTab === 'profile'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Personal & Address Details
                                </button>
                                <button
                                    onClick={() => setDetailTab('identity')}
                                    className={`py-3 px-4 border-b-2 transition-colors ${
                                        detailTab === 'identity'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Identity Verification (KYC)
                                </button>
                                <button
                                    onClick={() => setDetailTab('review')}
                                    className={`py-3 px-4 border-b-2 transition-colors ${
                                        detailTab === 'review'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Review History
                                </button>
                                <button
                                    onClick={() => setDetailTab('timeline')}
                                    className={`py-3 px-4 border-b-2 transition-colors ${
                                        detailTab === 'timeline'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Status Timeline
                                </button>
                            </div>

                            {/* Drawer Content View */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {detailTab === 'profile' && (
                                    <div className="space-y-6 text-xs">
                                        {/* Personal Info Box */}
                                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                                            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400">
                                                Personal & Login Credentials
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-slate-400">Full Name</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Username</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.username}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Account Password</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="font-mono font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                            {showPasswords[selectedReq.id] ? (selectedReq.password || 'Pass@1234') : '••••••••'}
                                                        </span>
                                                        <button
                                                            onClick={() => togglePasswordVisibility(selectedReq.id)}
                                                            className="text-slate-400 hover:text-blue-600 transition-colors"
                                                        >
                                                            {showPasswords[selectedReq.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                        </button>
                                                        <button
                                                            onClick={() => copyText(selectedReq.password || 'Pass@1234', 'Password')}
                                                            className="text-slate-400 hover:text-blue-600 transition-colors"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Gender</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.gender}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Age / Date of Birth</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.age} Yrs ({selectedReq.dob || 'N/A'})</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Marital Status</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.maritalStatus || 'Single'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Qualification</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.qualification || 'Graduate'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact & Address Info Box */}
                                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                                            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400">
                                                Contact & Address Details
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-slate-400">Primary Email</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Mobile Number</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.mobile}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Alternate Contact</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.alternateMobile || 'None'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Country</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.country}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">State</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.state}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">District / City</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.district} / {selectedReq.city}</p>
                                                </div>
                                                <div className="col-span-2 sm:col-span-3">
                                                    <p className="text-slate-400">Full Residential Address</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.fullAddress}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Experience & Skills Box */}
                                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                                            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400">
                                                Professional Background
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-slate-400">Experience</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.experience}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Previous Company</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.previousCompany}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-slate-400 mb-1.5">Key Competencies & Skills</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedReq.skills?.map((skill, i) => (
                                                        <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[11px] font-medium">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'identity' && (
                                    <div className="space-y-6 text-xs">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {/* Aadhaar Front Card Card */}
                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Aadhaar Front Side</h4>
                                                    <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold">Uploaded</span>
                                                </div>
                                                {selectedReq.aadhaarFront ? (
                                                    <div
                                                        onClick={() => setImageZoom({ isOpen: true, url: selectedReq.aadhaarFront, title: `${selectedReq.name} - Aadhaar Front`, zoom: 1, rotate: 0 })}
                                                        className="relative group rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer shadow-xs"
                                                    >
                                                        <img src={selectedReq.aadhaarFront} alt="Aadhaar Front" className="w-full h-36 object-cover" />
                                                        <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold gap-1.5">
                                                            <ZoomIn className="w-4 h-4" /> Click to Zoom
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-6 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-center text-xs text-slate-400 font-mono">No Aadhaar Front Image</div>
                                                )}
                                                <p className="text-[11px] text-slate-500">Aadhaar No: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedReq.aadhaarNo}</span></p>
                                            </div>

                                            {/* Aadhaar Back Card */}
                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Aadhaar Back Side</h4>
                                                    <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold">Uploaded</span>
                                                </div>
                                                {selectedReq.aadhaarBack ? (
                                                    <div
                                                        onClick={() => setImageZoom({ isOpen: true, url: selectedReq.aadhaarBack, title: `${selectedReq.name} - Aadhaar Back`, zoom: 1, rotate: 0 })}
                                                        className="relative group rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer shadow-xs"
                                                    >
                                                        <img src={selectedReq.aadhaarBack} alt="Aadhaar Back" className="w-full h-36 object-cover" />
                                                        <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold gap-1.5">
                                                            <ZoomIn className="w-4 h-4" /> Click to Zoom
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-6 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-center text-xs text-slate-400 font-mono">No Aadhaar Back Image</div>
                                                )}
                                                <p className="text-[11px] text-slate-500">Address Proof Verified</p>
                                            </div>

                                            {/* PAN Card */}
                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">PAN Card</h4>
                                                    <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold">Uploaded</span>
                                                </div>
                                                {selectedReq.panCard ? (
                                                    <div
                                                        onClick={() => setImageZoom({ isOpen: true, url: selectedReq.panCard, title: `${selectedReq.name} - PAN Card`, zoom: 1, rotate: 0 })}
                                                        className="relative group rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer shadow-xs"
                                                    >
                                                        <img src={selectedReq.panCard} alt="PAN Card" className="w-full h-36 object-cover" />
                                                        <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold gap-1.5">
                                                            <ZoomIn className="w-4 h-4" /> Click to Zoom
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-6 rounded-lg bg-slate-100 dark:bg-slate-800/60 text-center text-xs text-slate-400 font-mono">No PAN Card Image</div>
                                                )}
                                                <p className="text-[11px] text-slate-500">PAN No: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedReq.panNo}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'review' && (
                                    <div className="space-y-4 text-xs">
                                        {/* Operator Review Card */}
                                        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600">
                                                        <UserCheck className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white">Operator Review</h4>
                                                        <p className="text-[11px] text-slate-400">Reviewer: {selectedReq.reviewByOperator.reviewerName}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                    selectedReq.reviewByOperator.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {selectedReq.reviewByOperator.status}
                                                </span>
                                            </div>
                                            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 italic">
                                                "{selectedReq.reviewByOperator.remarks}"
                                            </div>
                                            <p className="text-[10px] text-slate-400 text-right">Reviewed on: {selectedReq.reviewByOperator.reviewDate}</p>
                                        </div>

                                        {/* Owner Review Card */}
                                        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600">
                                                        <Shield className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white">Owner Review (Final Decision)</h4>
                                                        <p className="text-[11px] text-slate-400">Reviewer: {selectedReq.reviewByOwner.reviewerName}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                                    selectedReq.reviewByOwner.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                                                    selectedReq.reviewByOwner.status === 'Rejected' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {selectedReq.reviewByOwner.status}
                                                </span>
                                            </div>
                                            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 italic">
                                                "{selectedReq.reviewByOwner.remarks}"
                                            </div>
                                            <p className="text-[10px] text-slate-400 text-right">Reviewed on: {selectedReq.reviewByOwner.reviewDate}</p>
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'timeline' && (
                                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 text-xs">
                                        {selectedReq.timeline.map((evt) => (
                                            <div key={evt.id} className="relative group">
                                                <div className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 ${
                                                    evt.type === 'approval' ? 'border-emerald-500 bg-emerald-500' :
                                                    evt.type === 'rejection' ? 'border-red-500 bg-red-500' : 'border-blue-500 bg-blue-500'
                                                }`} />
                                                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <h5 className="font-bold text-slate-900 dark:text-white">{evt.title}</h5>
                                                        <span className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</span>
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-300">{evt.description}</p>
                                                    <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">By: {evt.actor}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Drawer Action Bar */}
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 flex items-center justify-between">
                                <button
                                    onClick={() => setSelectedReq(null)}
                                    className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                                >
                                    Close
                                </button>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { const r = selectedReq; setSelectedReq(null); handleOpenTransfer(r); }}
                                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                                    >
                                        Transfer Request
                                    </button>
                                    <button
                                        onClick={() => { const r = selectedReq; setSelectedReq(null); handleOpenConfirm(r, 'reject'); }}
                                        disabled={selectedReq.status === 'rejected'}
                                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => { const r = selectedReq; setSelectedReq(null); handleOpenConfirm(r, 'accept'); }}
                                        disabled={selectedReq.status === 'active'}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40"
                                    >
                                        Accept Request
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* FULLSCREEN IMAGE LIGHTBOX MODAL WITH ZOOM */}
            <AnimatePresence>
                {imageZoom.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 select-none">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[14px] overflow-hidden shadow-2xl flex flex-col"
                        >
                            {/* Lightbox Toolbar */}
                            <div className="p-4 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-white">
                                <span className="font-bold text-sm">{imageZoom.title}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setImageZoom(prev => ({ ...prev, zoom: Math.min(prev.zoom + 0.25, 3) }))}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                                        title="Zoom In"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setImageZoom(prev => ({ ...prev, zoom: Math.max(prev.zoom - 0.25, 0.5) }))}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                                        title="Zoom Out"
                                    >
                                        <ZoomOut className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setImageZoom(prev => ({ ...prev, rotate: (prev.rotate + 90) % 360 }))}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                                        title="Rotate Image"
                                    >
                                        <RotateCw className="w-4 h-4" />
                                    </button>
                                    <a
                                        href={imageZoom.url}
                                        download="document-preview.png"
                                        className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                        title="Download Document"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                    <button
                                        onClick={() => setImageZoom({ isOpen: false, url: '', title: '', zoom: 1, rotate: 0 })}
                                        className="p-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors ml-2"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Image Container */}
                            <div className="p-8 flex items-center justify-center min-h-[420px] max-h-[75vh] overflow-auto bg-slate-950">
                                {imageZoom.url ? (
                                    <img
                                        src={imageZoom.url}
                                        alt="Document Full View"
                                        style={{
                                            transform: `scale(${imageZoom.zoom}) rotate(${imageZoom.rotate}deg)`,
                                            transition: 'transform 0.2s ease-in-out'
                                        }}
                                        className="max-h-[65vh] object-contain rounded-lg shadow-lg"
                                    />
                                ) : (
                                    <div className="text-slate-400 text-sm">No Document Selected</div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CONFIRMATION DIALOG FOR ACCEPT / REJECT */}
            <AnimatePresence>
                {confirmModal.isOpen && confirmModal.request && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${
                                    confirmModal.type === 'accept'
                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                                        : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                                }`}>
                                    {confirmModal.type === 'accept' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        {confirmModal.type === 'accept' ? 'Approve Super Admin Role' : 'Reject Application'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Applicant: <span className="font-semibold text-slate-800 dark:text-slate-200">{confirmModal.request.name}</span> ({confirmModal.request.meethiChatId})
                                    </p>
                                </div>
                            </div>

                            {confirmModal.type === 'accept' ? (
                                <div className="space-y-3 text-xs">
                                    <div>
                                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                            Assigned Super Admin Code
                                        </label>
                                        <input
                                            type="text"
                                            value={assignedCode}
                                            onChange={(e) => setAssignedCode(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-blue-600 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                            Owner Approval Remarks (Optional)
                                        </label>
                                        <textarea
                                            value={actionRemarks}
                                            onChange={(e) => setActionRemarks(e.target.value)}
                                            placeholder="Enter approval notes or instructions for the applicant..."
                                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none h-20"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 text-xs">
                                    <div>
                                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                            Rejection Reason Category
                                        </label>
                                        <select
                                            value={selectedRejectReason}
                                            onChange={(e) => setSelectedRejectReason(e.target.value)}
                                            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                                        >
                                            <option value="Document Mismatch">Aadhaar / PAN Document Mismatch</option>
                                            <option value="Unclear Scan">Unclear or Blurry ID Scan</option>
                                            <option value="Ineligible Experience">Insufficient Operations Experience</option>
                                            <option value="Policy Violation">Security Policy Violation History</option>
                                            <option value="Other">Other Custom Reason</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                            Detailed Rejection Remarks
                                        </label>
                                        <textarea
                                            value={actionRemarks}
                                            onChange={(e) => setActionRemarks(e.target.value)}
                                            placeholder="Explain why this request is being rejected..."
                                            className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none h-20"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setConfirmModal({ isOpen: false, type: 'accept', request: null })}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitAction}
                                    disabled={isSubmittingAction}
                                    className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                                        confirmModal.type === 'accept'
                                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                                            : 'bg-red-600 hover:bg-red-700 shadow-red-500/20'
                                    }`}
                                >
                                    {isSubmittingAction && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                    <span>{confirmModal.type === 'accept' ? 'Confirm Approval' : 'Confirm Rejection'}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* TRANSFER CONFIRMATION DIALOG */}
            <AnimatePresence>
                {transferModal.isOpen && transferModal.request && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                    <ArrowLeftRight className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Transfer Request
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Reassign <span className="font-semibold text-slate-800 dark:text-slate-200">{transferModal.request.name}</span> ({transferModal.request.meethiChatId}) to another reviewer.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Target Recipient / Handler
                                    </label>
                                    <select
                                        value={targetRecipient}
                                        onChange={(e) => setTargetRecipient(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                                    >
                                        <option value="Rajesh Malhotra (Owner)">Rajesh Malhotra (Owner)</option>
                                        <option value="Vikramaditya Singh (Super Admin)">Vikramaditya Singh (Super Admin)</option>
                                        <option value="Priya Sundaram (Super Admin)">Priya Sundaram (Super Admin)</option>
                                        <option value="Royal Media Agency">Royal Media Agency</option>
                                        <option value="Star Talent Agency">Star Talent Agency</option>
                                        <option value="Operator Team Queue">Operator Team Queue</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Transfer Reason / Remarks
                                    </label>
                                    <textarea
                                        value={transferNote}
                                        onChange={(e) => setTransferNote(e.target.value)}
                                        placeholder="Enter reasons for transfer or special instructions..."
                                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none h-20"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => setTransferModal({ isOpen: false, request: null })}
                                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitTransfer}
                                    disabled={isSubmittingTransfer}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
                                >
                                    {isSubmittingTransfer && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Confirm Transfer</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Approval Credentials Dialog */}
            <ApprovalSuccessDialog
                isOpen={approvalDialog.isOpen}
                onClose={() => setApprovalDialog({ isOpen: false, credentials: null, applicantName: '' })}
                credentials={approvalDialog.credentials}
                roleName="Super Admin"
                applicantName={approvalDialog.applicantName}
            />
        </div>
    );
}
