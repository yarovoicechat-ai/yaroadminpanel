'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, RefreshCw, FileSpreadsheet, FileText, Filter,
    CheckCircle2, XCircle, Eye, EyeOff, ChevronDown, ChevronUp,
    UserCheck, Shield, Sparkles, Copy, ZoomIn, ZoomOut,
    RotateCw, Download, X, Calendar, MapPin, Mail, Phone,
    Clock, Award, Briefcase, FileCheck, ArrowUpDown, ChevronLeft,
    ChevronRight, Check, AlertCircle, User, AlertTriangle, ArrowLeftRight, File, HelpCircle, HeadphoneOff, Headphones
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { ApprovalSuccessDialog, ApprovalCredentials } from '@/components/requests/ApprovalSuccessDialog';

// CS Request Status Definition
export type CSStatusType = 'approved' | 'pending' | 'rejected';

export interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    actor: string;
    type: 'submission' | 'operator_review' | 'approval' | 'rejection';
}

export interface CSRequestData {
    id: string;
    srNo: number;
    invitedBy: string;
    name: string;
    profilePhoto?: string;
    meethiChatId: string;
    username: string;
    gender: 'Female' | 'Male' | 'Other';
    age: number;
    dob?: string;
    email: string;
    mobile: string;
    country: string;
    state: string;
    district: string;
    city?: string;
    fullAddress?: string;
    registrationDate: string;
    aadhaarNo?: string;
    panNo?: string;
    aadhaarFront: string;
    aadhaarBack: string;
    panCard: string;
    resumeUrl: string;
    reviewByOperator: {
        status: 'approved' | 'pending' | 'rejected';
        operatorName?: string;
        timestamp?: string;
        remarks?: string;
    };
    reviewBySuperAdmin: {
        status: 'approved' | 'pending' | 'rejected';
        adminName?: string;
        timestamp?: string;
        remarks?: string;
    };
    password: string;
    status: CSStatusType;
    shiftTiming?: string;
    timeline: TimelineEvent[];
}

// Sample SVG Generator for Documents
const createCardSVG = (title: string, idNum: string, color: string, bg: string) => {
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260">
        <rect width="400" height="260" rx="16" fill="${bg}"/>
        <rect x="20" y="20" width="360" height="40" rx="8" fill="${color}" fill-opacity="0.15"/>
        <text x="40" y="46" font-family="sans-serif" font-size="18" font-weight="bold" fill="${color}">${title}</text>
        <circle cx="60" cy="120" r="30" fill="${color}" fill-opacity="0.2"/>
        <rect x="110" y="100" width="230" height="12" rx="6" fill="${color}" fill-opacity="0.2"/>
        <rect x="110" y="122" width="170" height="10" rx="5" fill="${color}" fill-opacity="0.15"/>
        <rect x="110" y="140" width="140" height="10" rx="5" fill="${color}" fill-opacity="0.15"/>
        <rect x="40" y="190" width="320" height="45" rx="8" fill="${color}" fill-opacity="0.1"/>
        <text x="55" y="218" font-family="monospace" font-size="16" font-weight="bold" fill="${color}">${idNum}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;
};

// Initial Mock Dataset for Customer Support Requests
const MOCK_CS_REQUESTS: CSRequestData[] = [
    {
        id: 'CSR-2024-001',
        srNo: 1,
        invitedBy: 'Super Admin Siddharth',
        name: 'Aakash Verma',
        profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        meethiChatId: 'MC-661902',
        username: '@aakash_cs',
        gender: 'Male',
        age: 26,
        dob: '1998-06-15',
        email: 'aakash.verma@meethichat.com',
        mobile: '+91 98111 44556',
        country: 'India',
        state: 'Delhi',
        district: 'New Delhi',
        city: 'New Delhi',
        fullAddress: 'Flat 102, Rohini Sector 7, New Delhi',
        registrationDate: '2024-10-21 09:30:00',
        aadhaarNo: 'XXXX-XXXX-3344',
        panNo: 'AKSVR4455P',
        aadhaarFront: createCardSVG('AADHAAR FRONT CARD', '3344 5566 7788', '#2563EB', '#EFF6FF'),
        aadhaarBack: createCardSVG('AADHAAR BACK CARD', 'Address Verified - Rohini Delhi', '#2563EB', '#EFF6FF'),
        panCard: createCardSVG('PERMANENT ACCOUNT NUMBER', 'AKSVR4455P', '#059669', '#ECFDF5'),
        resumeUrl: createCardSVG('CS EXECUTIVE RESUME / CV', 'Aakash Verma Customer Support Portfolio', '#7C3AED', '#F5F3FF'),
        reviewByOperator: { status: 'approved', operatorName: 'Operator Vikram', timestamp: '2024-10-21 10:15:00', remarks: 'Good communication skills & verified documents.' },
        reviewBySuperAdmin: { status: 'pending' },
        password: 'Pass#CS2024Live',
        status: 'pending',
        shiftTiming: 'Day Shift (09:00 AM - 06:00 PM)',
        timeline: [
            { id: '1', title: 'CS Application Submitted', description: 'Application & Resume submitted online', timestamp: '2024-10-21 09:30:00', actor: 'Applicant', type: 'submission' },
            { id: '2', title: 'Operator Review Completed', description: 'Verified by Operator Vikram', timestamp: '2024-10-21 10:15:00', actor: 'Operator Vikram', type: 'operator_review' }
        ]
    },
    {
        id: 'CSR-2024-002',
        srNo: 2,
        invitedBy: 'Rajesh Malhotra (Owner)',
        name: 'Neha Sharma',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
        meethiChatId: 'MC-551029',
        username: '@neha_support',
        gender: 'Female',
        age: 24,
        dob: '2000-03-24',
        email: 'neha.sharma@meethichat.com',
        mobile: '+91 97222 66778',
        country: 'India',
        state: 'Maharashtra',
        district: 'Mumbai City',
        city: 'Mumbai',
        fullAddress: 'A-201, Andheri East, Mumbai, Maharashtra',
        registrationDate: '2024-10-23 11:00:00',
        aadhaarNo: 'XXXX-XXXX-8822',
        panNo: 'NHSPS8822L',
        aadhaarFront: createCardSVG('AADHAAR FRONT CARD', '8822 9900 1122', '#2563EB', '#EFF6FF'),
        aadhaarBack: createCardSVG('AADHAAR BACK CARD', 'Address Verified - Andheri Mumbai', '#2563EB', '#EFF6FF'),
        panCard: createCardSVG('PERMANENT ACCOUNT NUMBER', 'NHSPS8822L', '#059669', '#ECFDF5'),
        resumeUrl: createCardSVG('CS EXECUTIVE RESUME / CV', 'Neha Sharma Support Experience', '#7C3AED', '#F5F3FF'),
        reviewByOperator: { status: 'approved', operatorName: 'Operator Kavita', timestamp: '2024-10-23 11:45:00', remarks: 'Excellent background check & support experience.' },
        reviewBySuperAdmin: { status: 'approved', adminName: 'Super Admin Team', timestamp: '2024-10-23 14:00:00', remarks: 'CS Executive account activated.' },
        password: 'Pass#NehaCS99',
        status: 'approved',
        shiftTiming: 'Night Shift (06:00 PM - 03:00 AM)',
        timeline: [
            { id: '1', title: 'CS Application Submitted', description: 'Application filed online', timestamp: '2024-10-23 11:00:00', actor: 'Applicant', type: 'submission' },
            { id: '2', title: 'Operator Review Completed', description: 'Verified by Operator Kavita', timestamp: '2024-10-23 11:45:00', actor: 'Operator Kavita', type: 'operator_review' },
            { id: '3', title: 'CS Executive Approved', description: 'Account activated with support desk credentials', timestamp: '2024-10-23 14:00:00', actor: 'Super Admin Team', type: 'approval' }
        ]
    }
];

export default function CustomerSupportRequestsPage() {
    const { user: currentUser } = useAuth();
    const [requests, setRequests] = useState<CSRequestData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [genderFilter, setGenderFilter] = useState<string>('all');
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [stateFilter, setStateFilter] = useState<string>('all');
    const [districtFilter, setDistrictFilter] = useState<string>('all');
    const [filtersExpanded, setFiltersExpanded] = useState(false);

    // Password visibility per row
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

    // Sorting & Pagination
    const [sortColumn, setSortColumn] = useState<keyof CSRequestData>('srNo');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modals
    const [selectedReq, setSelectedReq] = useState<CSRequestData | null>(null);
    const [detailTab, setDetailTab] = useState<'profile' | 'identity' | 'resume' | 'reviews' | 'timeline'>('profile');

    // Lightbox Modal
    const [imageZoom, setImageZoom] = useState<{ isOpen: boolean; url: string; title: string; zoom: number; rotate: number }>({
        isOpen: false,
        url: '',
        title: '',
        zoom: 1,
        rotate: 0
    });

    // Confirmation Modal
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'accept' | 'reject';
        request: CSRequestData | null;
    }>({
        isOpen: false,
        type: 'accept',
        request: null
    });

    // Transfer Modal
    const [transferModal, setTransferModal] = useState<{
        isOpen: boolean;
        request: CSRequestData | null;
    }>({
        isOpen: false,
        request: null
    });
    const [targetRecipient, setTargetRecipient] = useState('Super Admin Team');
    const [transferNote, setTransferNote] = useState('');
    const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

    const [actionRemarks, setActionRemarks] = useState('');
    const [selectedRejectReason, setSelectedRejectReason] = useState('Incomplete KYC Documents');
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

    // Fetch CS Requests Data
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/ems/requests', { requestType: 'Customer Support Request' });
            const items: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.requests) ? res.data.requests : (res?.data?.data ?? []);
            if (res && res.success !== false) {
                const apiData: CSRequestData[] = items.map((item: any, idx: number) => {
                    const d = item.data || {};
                    return {
                        id: item._id || `CSR-${idx + 100}`,
                        srNo: idx + 1,
                        invitedBy: d.invitedBy || item.createdByRole || 'Direct Application',
                        name: d.name || 'CS Applicant',
                        profilePhoto: d.profilePhoto || '',
                        meethiChatId: d.meethiChatId || '',
                        username: d.username ? `@${d.username.replace('@','')}` : '',
                        gender: (d.gender as any) || 'Male',
                        age: d.age || 0,
                        dob: d.dob || '',
                        email: d.email || '',
                        mobile: d.phoneNumber || d.mobile || '',
                        country: d.country || 'India',
                        state: d.state || '',
                        district: d.district || d.city || '',
                        city: d.city || '',
                        fullAddress: d.fullAddress || '',
                        registrationDate: item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN'),
                        aadhaarNo: d.aadhaarNo || '',
                        panNo: d.panNo || '',
                        aadhaarFront: d.adharFront || d.aadhaarFront || '',
                        aadhaarBack: d.adharBack || d.aadhaarBack || '',
                        panCard: d.pan || d.panCard || '',
                        resumeUrl: d.resumeUrl || '',
                        reviewByOperator: d.reviewByOperator || { status: 'pending' },
                        reviewBySuperAdmin: d.reviewBySuperAdmin || { status: item.status === 'approved' ? 'approved' : 'pending' },
                        password: d.password || item.passwordBeforeApproval || '',
                        status: (item.status === 'approved' || item.status === 'active') ? 'approved' : item.status === 'rejected' ? 'rejected' : 'pending',
                        shiftTiming: d.shiftTiming || d.shift || '',
                        timeline: item.timeline || [
                            { id: '1', title: 'CS Application Received', description: 'Application filed online with Resume', timestamp: item.createdAt || new Date().toISOString(), actor: 'System', type: 'submission' }
                        ]
                    };
                });
                setRequests(apiData);
            } else {
                setRequests([]);
            }
        } catch (err) {
            console.error('Failed to load CS requests:', err);
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
        toast.success('CS requests updated with latest data');
    };

    // Filter Logic
    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const q = search.trim().toLowerCase();
            const matchesSearch = !q ||
                req.name.toLowerCase().includes(q) ||
                req.meethiChatId.toLowerCase().includes(q) ||
                req.username.toLowerCase().includes(q) ||
                req.email.toLowerCase().includes(q) ||
                req.mobile.includes(q) ||
                req.state.toLowerCase().includes(q) ||
                req.district.toLowerCase().includes(q);

            const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
            const matchesGender = genderFilter === 'all' || req.gender.toLowerCase() === genderFilter.toLowerCase();
            const matchesCountry = countryFilter === 'all' || req.country.toLowerCase() === countryFilter.toLowerCase();
            const matchesState = stateFilter === 'all' || req.state.toLowerCase() === stateFilter.toLowerCase();
            const matchesDistrict = districtFilter === 'all' || req.district.toLowerCase() === districtFilter.toLowerCase();

            return matchesSearch && matchesStatus && matchesGender && matchesCountry && matchesState && matchesDistrict;
        });
    }, [requests, search, statusFilter, genderFilter, countryFilter, stateFilter, districtFilter]);

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

    // Stats
    const stats = useMemo(() => {
        return {
            total: requests.length,
            approved: requests.filter(r => r.status === 'approved').length,
            pending: requests.filter(r => r.status === 'pending').length,
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
            'SR', 'Invited By', 'CS Name', 'Meethi Chat ID', 'User Name', 'Gender',
            'Age', 'Email', 'Mobile Number', 'Country', 'State', 'District',
            'Registration Date', 'Operator Status', 'Super Admin Status', 'Status'
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
            `"${r.reviewBySuperAdmin.status}"`,
            `"${r.status}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `CS_Requests_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV report exported successfully');
    };

    const handlePrintPDF = () => {
        window.print();
    };

    const handleSort = (col: keyof CSRequestData) => {
        if (sortColumn === col) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(col);
            setSortDirection('asc');
        }
    };

    const togglePasswordVisibility = (id: string) => {
        setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    // Action Handlers
    const handleOpenConfirm = (req: CSRequestData, type: 'accept' | 'reject') => {
        setConfirmModal({ isOpen: true, type, request: req });
        setActionRemarks('');
    };

    const handleOpenTransfer = (req: CSRequestData) => {
        setTransferModal({ isOpen: true, request: req });
        setTargetRecipient('Super Admin Team');
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
                        title: 'CS Application Transferred',
                        description: `Transferred to ${targetRecipient}. Note: ${transferNote || 'No note'}`,
                        timestamp: new Date().toLocaleString(),
                        actor: currentUser?.name || 'Super Admin',
                        type: 'operator_review'
                    };
                    return {
                        ...item,
                        invitedBy: `Transferred to ${targetRecipient}`,
                        timeline: [newTimelineEvent, ...item.timeline]
                    };
                }
                return item;
            }));

            toast.success(`🔀 CS application for ${req.name} transferred to ${targetRecipient}!`);
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
                ? { comments: actionRemarks || 'Approved & Activated CS Executive' }
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
                        const newStatus: CSStatusType = isAccept ? 'approved' : 'rejected';
                        return {
                            ...item,
                            status: newStatus,
                            reviewBySuperAdmin: {
                                status: isAccept ? 'approved' : 'rejected',
                                adminName: currentUser?.name || 'Super Admin',
                                timestamp: new Date().toLocaleString('en-IN'),
                                remarks: actionRemarks
                            },
                            timeline: [{
                                id: String(Date.now()),
                                title: isAccept ? 'CS Executive Approved' : 'CS Application Rejected',
                                description: actionRemarks || (isAccept ? 'Customer support desk credentials activated.' : `Reason: ${selectedRejectReason}`),
                                timestamp: new Date().toLocaleString('en-IN'),
                                actor: currentUser?.name || 'Super Admin',
                                type: isAccept ? 'approval' : 'rejection'
                            }, ...item.timeline]
                        };
                    }
                    return item;
                }));

                if (!isAccept || !response.data?.generatedCredentials) {
                    toast.success(isAccept ? `✅ Customer Support application for ${req.name} APPROVED & ACTIVATED!` : `❌ CS application for ${req.name} REJECTED.`);
                }
                setConfirmModal({ isOpen: false, type: 'accept', request: null });
            } else {
                toast.error(response.message || 'Failed to process action. Please try again.');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error executing action');
        } finally {
            setIsSubmittingAction(false);
        }
    };

    const renderReviewBadge = (review: { status: 'approved' | 'pending' | 'rejected'; operatorName?: string; adminName?: string }) => {
        switch (review.status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50">
                        <XCircle className="w-3 h-3 text-red-600" /> Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50">
                        <Clock className="w-3 h-3 text-amber-600" /> Pending Review
                    </span>
                );
        }
    };

    const renderStatusBadge = (status: CSStatusType) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        🟢 Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/80 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        🔴 Rejected
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        🟡 Pending
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
                        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                            <Headphones className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                Customer Support Request
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 font-medium">
                                    CS Recruitment Verification
                                </span>
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                Used by Owner & Super Admins to review, verify, and approve applications submitted for Customer Support Executive roles.
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
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-600' : 'text-slate-500'}`} />
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
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total CS Requests</p>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.total}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <User className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-emerald-200/60 dark:border-emerald-900/40 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Approved CS</p>
                        <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">{stats.approved}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-amber-200/60 dark:border-amber-900/40 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending Review</p>
                        <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-1">{stats.pending}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-red-200/60 dark:border-red-900/40 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Rejected Requests</p>
                        <p className="text-2xl font-extrabold text-red-700 dark:text-red-400 mt-1">{stats.rejected}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                        <XCircle className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Search & Filters Controls Section */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-cyan-500/5 space-y-4">
                
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search by CS Executive Name, Meethi Chat ID, Username, Email, Mobile Number..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all placeholder:text-slate-400"
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
                                filtersExpanded || statusFilter !== 'all' || genderFilter !== 'all' || countryFilter !== 'all' || stateFilter !== 'all' || districtFilter !== 'all'
                                    ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700'
                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                        >
                            <Filter className="w-4 h-4 text-cyan-600" />
                            <span>Filters</span>
                            {filtersExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {(search || statusFilter !== 'all' || genderFilter !== 'all' || countryFilter !== 'all' || stateFilter !== 'all' || districtFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setStatusFilter('all');
                                    setGenderFilter('all');
                                    setCountryFilter('all');
                                    setStateFilter('all');
                                    setDistrictFilter('all');
                                    setPage(1);
                                }}
                                className="px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all border border-red-200/60 dark:border-red-900/50"
                            >
                                Reset All
                            </button>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {(filtersExpanded || statusFilter !== 'all' || genderFilter !== 'all' || stateFilter !== 'all') && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
                        >
                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="approved">🟢 Approved</option>
                                    <option value="pending">🟡 Pending</option>
                                    <option value="rejected">🔴 Rejected</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Gender</label>
                                <select
                                    value={genderFilter}
                                    onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                                >
                                    <option value="all">All Genders</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Country</label>
                                <select
                                    value={countryFilter}
                                    onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                                >
                                    <option value="all">All Countries</option>
                                    <option value="india">India 🇮🇳</option>
                                    <option value="usa">USA 🇺🇸</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">State</label>
                                <select
                                    value={stateFilter}
                                    onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                                >
                                    <option value="all">All States</option>
                                    <option value="delhi">Delhi</option>
                                    <option value="maharashtra">Maharashtra</option>
                                </select>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Main Data Table Card (22 Columns) */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-cyan-500/5 overflow-hidden">
                <div className="overflow-x-auto max-h-[680px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 z-20 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-200 dark:border-slate-700 select-none">
                            <tr>
                                <th className="p-3.5 whitespace-nowrap text-center">
                                    <button onClick={() => handleSort('srNo')} className="flex items-center gap-1 hover:text-cyan-600 mx-auto">
                                        SR <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                                <th className="p-3.5 whitespace-nowrap">Invited By</th>
                                <th className="p-3.5 whitespace-nowrap">
                                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-cyan-600">
                                        CS Executive Name <ArrowUpDown className="w-3 h-3 text-slate-400" />
                                    </button>
                                </th>
                                <th className="p-3.5 whitespace-nowrap">Meethi Chat ID</th>
                                <th className="p-3.5 whitespace-nowrap">User Name</th>
                                <th className="p-3.5 whitespace-nowrap">Gender</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Age</th>
                                <th className="p-3.5 whitespace-nowrap">Email</th>
                                <th className="p-3.5 whitespace-nowrap">Mobile Number</th>
                                <th className="p-3.5 whitespace-nowrap">Country</th>
                                <th className="p-3.5 whitespace-nowrap">State</th>
                                <th className="p-3.5 whitespace-nowrap">District</th>
                                <th className="p-3.5 whitespace-nowrap">Reg Date & Time</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Aadhaar Front</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Aadhaar Back</th>
                                <th className="p-3.5 whitespace-nowrap text-center">PAN Card</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Resume / CV</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Review By Operator</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Review By Super Admin</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Password</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Action</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Status</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-medium">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="p-4 text-center"><div className="h-4 w-6 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4"><div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" /></td>
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
                                        <td className="p-4 text-center"><div className="h-10 w-14 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" /></td>
                                    </tr>
                                ))
                            ) : paginatedRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={22} className="p-12 text-center">
                                        <div className="max-w-md mx-auto space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 flex items-center justify-center mx-auto border border-cyan-200/60">
                                                <Headphones className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-slate-800 dark:text-white">No CS Requests Found</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    No Customer Support application matches your search query or filter criteria.
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRequests.map((req, idx) => (
                                    <tr key={req.id} className="hover:bg-cyan-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="p-3.5 text-center font-bold text-slate-500 dark:text-slate-400">
                                            #{(page - 1) * pageSize + idx + 1}
                                        </td>

                                        <td className="p-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                                <span>{req.invitedBy}</span>
                                            </div>
                                        </td>

                                        <td className="p-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-2.5">
                                                {req.profilePhoto ? (
                                                    <img src={req.profilePhoto} alt={req.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                                        {req.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 transition-colors">{req.name}</p>
                                                    <span className="text-[10px] text-cyan-600 font-mono font-bold bg-cyan-50 dark:bg-cyan-950 px-1.5 py-0.5 rounded">
                                                        {req.shiftTiming || 'Day Shift'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="p-3.5 whitespace-nowrap">
                                            <button
                                                onClick={() => copyText(req.meethiChatId, 'Meethi Chat ID')}
                                                className="inline-flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-100 dark:hover:bg-cyan-950 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                                            >
                                                <span>{req.meethiChatId}</span>
                                                <Copy className="w-3 h-3 text-slate-400" />
                                            </button>
                                        </td>

                                        <td className="p-3.5 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                                            {req.username}
                                        </td>

                                        <td className="p-3.5 whitespace-nowrap font-medium">
                                            {req.gender}
                                        </td>

                                        <td className="p-3.5 whitespace-nowrap text-center font-bold text-slate-700 dark:text-slate-300">
                                            {req.age} Yrs
                                        </td>

                                        <td className="p-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                            {req.email}
                                        </td>

                                        <td className="p-3.5 whitespace-nowrap font-mono text-slate-600 dark:text-slate-300">
                                            {req.mobile}
                                        </td>

                                        <td className="p-3.5 whitespace-nowrap font-medium">
                                            🇮🇳 {req.country}
                                        </td>

                                        <td className="p-3.5 whitespace-nowrap font-medium">
                                            {req.state}
                                        </td>

                                        <td className="p-3.5 whitespace-nowrap font-medium">
                                            {req.district}
                                        </td>

                                        <td className="p-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                            {req.registrationDate}
                                        </td>

                                         {/* Aadhaar Front */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setImageZoom({ isOpen: true, url: req.aadhaarFront, title: `${req.name} - Aadhaar Front`, zoom: 1, rotate: 0 })}
                                                    className="relative group/img overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs hover:border-cyan-500 transition-all"
                                                >
                                                    <img src={req.aadhaarFront} alt="Aadhaar Front" className="w-12 h-8 object-cover" />
                                                    <div className="absolute inset-0 bg-cyan-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => setImageZoom({ isOpen: true, url: req.aadhaarFront, title: `${req.name} - Aadhaar Front`, zoom: 1, rotate: 0 })}
                                                    className="text-cyan-600 hover:text-cyan-700 font-semibold text-[11px] hover:underline"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </td>

                                        {/* Aadhaar Back */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setImageZoom({ isOpen: true, url: req.aadhaarBack, title: `${req.name} - Aadhaar Back`, zoom: 1, rotate: 0 })}
                                                    className="relative group/img overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs hover:border-cyan-500 transition-all"
                                                >
                                                    <img src={req.aadhaarBack} alt="Aadhaar Back" className="w-12 h-8 object-cover" />
                                                    <div className="absolute inset-0 bg-cyan-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={() => setImageZoom({ isOpen: true, url: req.aadhaarBack, title: `${req.name} - Aadhaar Back`, zoom: 1, rotate: 0 })}
                                                    className="text-cyan-600 hover:text-cyan-700 font-semibold text-[11px] hover:underline"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </td>

                                        {/* PAN Card */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
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
                                                    className="text-cyan-600 hover:text-cyan-700 font-semibold text-[11px] hover:underline"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </td>

                                        {/* Resume / CV Document */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setImageZoom({ isOpen: true, url: req.resumeUrl, title: `${req.name} - Resume / CV Document`, zoom: 1, rotate: 0 })}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-semibold text-[11px] border border-purple-200 dark:border-purple-800/60"
                                                >
                                                    <File className="w-3.5 h-3.5 text-purple-600" />
                                                    <span>View Resume</span>
                                                </button>
                                            </div>
                                        </td>

                                        {/* Review By Operator */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            {renderReviewBadge(req.reviewByOperator)}
                                        </td>

                                        {/* Review By Super Admin */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            {renderReviewBadge(req.reviewBySuperAdmin)}
                                        </td>

                                        {/* Password Masked */}
                                        <td className="p-3.5 text-center whitespace-nowrap font-mono">
                                            <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <span>{visiblePasswords[req.id] ? req.password : '••••••••'}</span>
                                                <button onClick={() => togglePasswordVisibility(req.id)} className="text-slate-400 hover:text-cyan-600">
                                                    {visiblePasswords[req.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </td>

                                        {/* Action Column */}
                                        <td className="p-3.5 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => handleOpenConfirm(req, 'accept')}
                                                    disabled={req.status === 'approved'}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-[11px] transition-all shadow-xs"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Accept</span>
                                                </button>

                                                <button
                                                    onClick={() => handleOpenConfirm(req, 'reject')}
                                                    disabled={req.status === 'rejected'}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-semibold text-[11px] transition-all shadow-xs"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    <span>Reject</span>
                                                </button>

                                                <button
                                                    onClick={() => handleOpenTransfer(req)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] transition-all shadow-xs"
                                                >
                                                    <ArrowLeftRight className="w-3.5 h-3.5" />
                                                    <span>Transfer</span>
                                                </button>

                                                <button
                                                    onClick={() => setSelectedReq(req)}
                                                    className="p-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/50 text-cyan-600 border border-cyan-200 dark:border-cyan-800"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            {renderStatusBadge(req.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer */}
                <div className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <div>
                        Showing <span className="font-bold text-slate-900 dark:text-white">{sortedRequests.length > 0 ? (page - 1) * pageSize + 1 : 0}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(page * pageSize, sortedRequests.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{sortedRequests.length}</span> entries
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* FULL DETAIL DRAWER MODAL */}
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
                                        <img src={selectedReq.profilePhoto} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-cyan-500" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-cyan-600 text-white font-extrabold flex items-center justify-center text-base">
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
                                            ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 font-bold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Personal Profile
                                </button>
                                <button
                                    onClick={() => setDetailTab('identity')}
                                    className={`py-3 px-4 border-b-2 transition-colors ${
                                        detailTab === 'identity'
                                            ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 font-bold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Identity Verification (KYC)
                                </button>
                                <button
                                    onClick={() => setDetailTab('resume')}
                                    className={`py-3 px-4 border-b-2 transition-colors ${
                                        detailTab === 'resume'
                                            ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 font-bold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Resume / CV
                                </button>
                                <button
                                    onClick={() => setDetailTab('reviews')}
                                    className={`py-3 px-4 border-b-2 transition-colors ${
                                        detailTab === 'reviews'
                                            ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 font-bold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Review History
                                </button>
                                <button
                                    onClick={() => setDetailTab('timeline')}
                                    className={`py-3 px-4 border-b-2 transition-colors ${
                                        detailTab === 'timeline'
                                            ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 font-bold'
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
                                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                                            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-cyan-600 dark:text-cyan-400">
                                                CS Executive & Login Credentials
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
                                                    <p className="text-slate-400">Shift Timing</p>
                                                    <p className="font-bold text-cyan-600 dark:text-cyan-400">{selectedReq.shiftTiming || 'Day Shift'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Invited By</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.invitedBy}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Account Password</p>
                                                    <p className="font-mono font-bold text-slate-800 dark:text-slate-100">{visiblePasswords[selectedReq.id] ? selectedReq.password : '••••••••'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                                            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-cyan-600 dark:text-cyan-400">
                                                Contact & Location Info
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                <div>
                                                    <p className="text-slate-400">Email Address</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Mobile Number</p>
                                                    <p className="font-mono font-semibold text-slate-800 dark:text-slate-100">{selectedReq.mobile}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">State / Country</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.state}, {selectedReq.country}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-slate-400">Full Residence Address</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.fullAddress || `${selectedReq.district}, ${selectedReq.state}`}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'identity' && (
                                    <div className="space-y-4 text-xs">
                                        <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-cyan-600">
                                            Identity Verification Documents
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                                                <p className="font-bold text-slate-800 dark:text-slate-200">Aadhaar Front Card</p>
                                                <div onClick={() => setImageZoom({ isOpen: true, url: selectedReq.aadhaarFront, title: `${selectedReq.name} - Aadhaar Front`, zoom: 1, rotate: 0 })} className="cursor-pointer group/img relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    <img src={selectedReq.aadhaarFront} alt="Aadhaar Front" className="h-32 w-full object-cover" />
                                                    <div className="absolute inset-0 bg-cyan-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white font-bold transition-opacity">
                                                        <ZoomIn className="w-5 h-5" /> Zoom
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                                                <p className="font-bold text-slate-800 dark:text-slate-200">Aadhaar Back Card</p>
                                                <div onClick={() => setImageZoom({ isOpen: true, url: selectedReq.aadhaarBack, title: `${selectedReq.name} - Aadhaar Back`, zoom: 1, rotate: 0 })} className="cursor-pointer group/img relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    <img src={selectedReq.aadhaarBack} alt="Aadhaar Back" className="h-32 w-full object-cover" />
                                                    <div className="absolute inset-0 bg-cyan-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white font-bold transition-opacity">
                                                        <ZoomIn className="w-5 h-5" /> Zoom
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                                                <p className="font-bold text-slate-800 dark:text-slate-200">PAN Card</p>
                                                <div onClick={() => setImageZoom({ isOpen: true, url: selectedReq.panCard, title: `${selectedReq.name} - PAN Card`, zoom: 1, rotate: 0 })} className="cursor-pointer group/img relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    <img src={selectedReq.panCard} alt="PAN Card" className="h-32 w-full object-cover" />
                                                    <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white font-bold transition-opacity">
                                                        <ZoomIn className="w-5 h-5" /> Zoom
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'resume' && (
                                    <div className="space-y-4 text-xs">
                                        <div className="bg-purple-50 dark:bg-purple-950/30 p-5 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <File className="w-5 h-5 text-purple-600" />
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Customer Support Resume / CV</h4>
                                                </div>
                                                <a href={selectedReq.resumeUrl} download="cs-resume.png" className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm">
                                                    <Download className="w-4 h-4" /> Download CV Document
                                                </a>
                                            </div>
                                            <div onClick={() => setImageZoom({ isOpen: true, url: selectedReq.resumeUrl, title: `${selectedReq.name} - CS Resume`, zoom: 1, rotate: 0 })} className="cursor-pointer border rounded-xl overflow-hidden group/img relative">
                                                <img src={selectedReq.resumeUrl} alt="CS Resume" className="w-full h-56 object-cover" />
                                                <div className="absolute inset-0 bg-purple-900/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white font-bold transition-opacity">
                                                    <ZoomIn className="w-6 h-6" /> Click to Zoom Document
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'reviews' && (
                                    <div className="space-y-4 text-xs">
                                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200">Operator Review Status</h4>
                                                {renderReviewBadge(selectedReq.reviewByOperator)}
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300">Remarks: {selectedReq.reviewByOperator.remarks || 'Verified documents & background.'}</p>
                                        </div>

                                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200">Super Admin Review Status</h4>
                                                {renderReviewBadge(selectedReq.reviewBySuperAdmin)}
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300">Remarks: {selectedReq.reviewBySuperAdmin.remarks || 'Pending final approval action.'}</p>
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'timeline' && (
                                    <div className="space-y-4 text-xs">
                                        <div className="border-l-2 border-cyan-500 pl-4 space-y-4">
                                            {selectedReq.timeline.map((t) => (
                                                <div key={t.id} className="space-y-1">
                                                    <p className="font-bold text-slate-900 dark:text-white">{t.title}</p>
                                                    <p className="text-slate-500">{t.description}</p>
                                                    <p className="text-[10px] font-mono text-slate-400">{t.timestamp} • By {t.actor}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Drawer Footer Actions */}
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 flex items-center justify-between">
                                <button onClick={() => setSelectedReq(null)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                                    Close Drawer
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { const r = selectedReq; setSelectedReq(null); handleOpenConfirm(r, 'reject'); }}
                                        disabled={selectedReq.status === 'rejected'}
                                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs"
                                    >
                                        Reject CS Executive
                                    </button>
                                    <button
                                        onClick={() => { const r = selectedReq; setSelectedReq(null); handleOpenConfirm(r, 'accept'); }}
                                        disabled={selectedReq.status === 'approved'}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs"
                                    >
                                        Accept & Activate
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* LIGHTBOX MODAL */}
            <AnimatePresence>
                {imageZoom.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
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
                                        title="Close"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Image Container */}
                            <div className="p-8 flex items-center justify-center min-h-[420px] max-h-[75vh] overflow-auto bg-slate-950">
                                <img
                                    src={imageZoom.url}
                                    alt="Document Full View"
                                    style={{
                                        transform: `scale(${imageZoom.zoom}) rotate(${imageZoom.rotate}deg)`,
                                        transition: 'transform 0.2s ease-in-out'
                                    }}
                                    className="max-h-[65vh] object-contain rounded-lg shadow-lg"
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CONFIRMATION MODAL */}
            <AnimatePresence>
                {confirmModal.isOpen && confirmModal.request && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
                        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] p-6 space-y-4">
                            <h3 className="text-base font-bold">{confirmModal.type === 'accept' ? 'Approve CS Executive' : 'Reject CS Application'}</h3>
                            <p className="text-xs text-slate-500">Applicant: {confirmModal.request.name}</p>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setConfirmModal({ isOpen: false, type: 'accept', request: null })} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                                <button onClick={submitAction} className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold">Confirm</button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* TRANSFER MODAL */}
            <AnimatePresence>
                {transferModal.isOpen && transferModal.request && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
                        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[14px] p-6 space-y-4">
                            <h3 className="text-base font-bold">Transfer CS Request</h3>
                            <select value={targetRecipient} onChange={(e) => setTargetRecipient(e.target.value)} className="w-full p-2 border rounded-xl text-xs">
                                <option value="Super Admin Team">Super Admin Team</option>
                                <option value="Rajesh Malhotra (Owner)">Rajesh Malhotra (Owner)</option>
                            </select>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setTransferModal({ isOpen: false, request: null })} className="px-4 py-2 border rounded-xl text-xs font-semibold">Cancel</button>
                                <button onClick={submitTransfer} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">Confirm Transfer</button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Approval Credentials Dialog */}
            <ApprovalSuccessDialog
                isOpen={approvalDialog.isOpen}
                onClose={() => setApprovalDialog({ isOpen: false, credentials: null, applicantName: '' })}
                credentials={approvalDialog.credentials}
                roleName="Customer Support"
                applicantName={approvalDialog.applicantName}
            />
        </div>
    );
}
