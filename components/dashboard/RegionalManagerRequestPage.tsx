'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, RefreshCw, FileSpreadsheet, FileText, Filter,
    CheckCircle2, XCircle, Eye, EyeOff, ChevronDown, ChevronUp,
    UserCheck, Shield, Sparkles, Copy, ZoomIn, ZoomOut,
    RotateCw, Download, X, Calendar, MapPin, Mail, Phone,
    Clock, Award, Briefcase, FileCheck, ArrowUpDown, ChevronLeft,
    ChevronRight, Check, AlertCircle, HelpCircle, User, AlertTriangle, Lock, Key, Crown, File, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { extractRequestRecords, fetchRequestRecords } from '@/lib/requestRecords';
import { useAuth } from '@/contexts/AuthContext';
import { ApprovalSuccessDialog, ApprovalCredentials } from '@/components/requests/ApprovalSuccessDialog';
import { DeleteRequestButton } from '@/components/requests/DeleteRequestButton';
import TeamReports from '@/components/team/TeamReports';
import DocumentPreview from '@/components/requests/DocumentPreview';
import { requestDocumentUrl } from '@/lib/documentFiles';
import Link from 'next/link';

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
    type: 'submission' | 'owner_review' | 'interview' | 'approval' | 'rejection';
}

export interface ManagerRequestData {
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
    reviewByOwner: ReviewInfo;
    password?: string;
    status: StatusType;
    timeline: TimelineEvent[];
    managerCode?: string;
    referralCode?: string;
    rawItem?: any;
    accountDoc?: any;
}

interface RegionalManagerRequestPageProps {
    region: 'country' | 'state';
}

export default function RegionalManagerRequestPage({ region }: RegionalManagerRequestPageProps) {
    const isCountry = region === 'country';
    const roleTitle = isCountry ? 'Country Manager' : 'State Manager';
    const roleSlug = isCountry ? 'country-manager' : 'state-manager';
    const requestType = isCountry ? 'Country Manager Request' : 'State Manager Request';
    const codePrefix = isCountry ? 'CM' : 'SM';
    const targetEmployeeRole = isCountry ? 'countryManager' : 'stateManager';

    const { user: currentUser } = useAuth();
    const [requests, setRequests] = useState<ManagerRequestData[]>([]);
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
    const [sortColumn, setSortColumn] = useState<keyof ManagerRequestData>('srNo');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modals & Drawers
    const [selectedReq, setSelectedReq] = useState<ManagerRequestData | null>(null);
    const [detailTab, setDetailTab] = useState<'profile' | 'identity' | 'credentials' | 'review' | 'timeline' | 'team'>('profile');

    // Image Zoom Modal
    const [imageZoom, setImageZoom] = useState<{ isOpen: boolean; url: string; title: string; zoom: number; rotate: number }>({
        isOpen: false,
        url: '',
        title: '',
        zoom: 1,
        rotate: 0,
    });

    // Accept / Reject Confirmation Modal
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: 'accept' | 'reject';
        request: ManagerRequestData | null;
    }>({
        isOpen: false,
        type: 'accept',
        request: null,
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
        applicantName: '',
    });

    const togglePasswordVisibility = (id: string) => {
        setShowPasswords((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const [emsRes, appRes, accountsRes] = await Promise.allSettled([
                fetchRequestRecords(apiClient.get.bind(apiClient), '/api/ems/requests', { requestType }),
                fetchRequestRecords(apiClient.get.bind(apiClient), '/api/recruitment/admin/applications', { role: roleSlug }),
                fetchRequestRecords(apiClient.get.bind(apiClient), '/api/admin/employees/list', { targetRole: targetEmployeeRole }),
            ]);

            if (emsRes.status === 'rejected' && appRes.status === 'rejected') {
                throw emsRes.reason;
            }

            const emsItems = extractRequestRecords(emsRes);
            const appItems = extractRequestRecords(appRes);
            const employeeAccounts = extractRequestRecords(accountsRes);

            const emsMap = new Map<string, any>();
            if (Array.isArray(emsItems)) {
                emsItems.forEach((item) => {
                    const email = (item?.data?.email || item?.email || '').toLowerCase().trim();
                    if (email) emsMap.set(email, item);
                    if (item._id) emsMap.set(String(item._id), item);
                });
            }

            const mergedList: ManagerRequestData[] = [];
            const seenKeys = new Set<string>();

            // 1. Process EMS items first
            if (Array.isArray(emsItems)) {
                emsItems.forEach((item: any, idx: number) => {
                const d = item.data || {};
                const email = (d.email || item.email || '').toLowerCase().trim();
                const key = email || String(item._id);
                if (seenKeys.has(key)) return;
                seenKeys.add(key);

                const ownerRev = item.approvedBy?.find((a: any) => a.role === 'owner') || item.reviewByOwner || {};
                const account = employeeAccounts.find((acc) => (acc.email || '').toLowerCase() === email);

                mergedList.push({
                    id: String(item._id || ''),
                    srNo: idx + 1,
                    invitedBy: d.invitedBy || item.createdByRole || 'Direct Application',
                    name: d.name || 'Applicant',
                    profilePhoto: d.profilePhoto || '',
                    meethiChatId: d.meethiChatId || d.mithiChatId || `MC-${100000 + idx}`,
                    username: typeof d.username === 'string' ? `@${d.username.replace('@', '')}` : `@${roleSlug}_${idx + 1}`,
                    gender: (d.gender as any) || 'Male',
                    age: d.age || 28,
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
                    aadhaarFront: requestDocumentUrl(item, 'front'),
                    aadhaarBack: requestDocumentUrl(item, 'back'),
                    panCard: requestDocumentUrl(item, 'pan'),
                    resumeUrl: requestDocumentUrl(item, 'resume'),
                    qualification: d.qualification || '',
                    experience: d.experience || '',
                    previousCompany: d.previousCompany || '',
                    skills: d.skills ? (Array.isArray(d.skills) ? d.skills : typeof d.skills === 'string' ? d.skills.split(',') : []) : [],
                    reviewByOwner: {
                        reviewerName: ownerRev.reviewerName || (ownerRev.userId ? String(ownerRev.userId) : 'Owner Team'),
                        reviewDate: ownerRev.date ? new Date(ownerRev.date).toLocaleString('en-IN') : '—',
                        remarks: ownerRev.remarks || ownerRev.comments || 'Awaiting Owner decision.',
                        status: ownerRev.status || (item.status === 'approved' ? 'Approved' : 'Pending'),
                    },
                    password: d.password || item.passwordBeforeApproval || (account ? '••••••••' : ''),
                    status: item.status === 'approved' ? 'active' : item.status === 'rejected' ? 'rejected' : item.status === 'ready_for_interview' ? 'ready_for_interview' : 'pending',
                    managerCode: d.managerCode || d.specialCode || account?.specialCode || account?.employeeCode || '',
                    referralCode: d.referralCode || '',
                    timeline: item.timeline || [
                        { id: '1', title: `${roleTitle} Application Received`, description: 'Application filed successfully', timestamp: item.createdAt || new Date().toISOString(), actor: 'System', type: 'submission' },
                    ],
                    rawItem: item,
                    accountDoc: account,
                });
            });
        }

            // 2. Add any recruitment application items not already in EMS
            if (Array.isArray(appItems)) {
                appItems.forEach((app: any) => {
                const applicant = app.applicant || {};
                const email = (applicant.email || '').toLowerCase().trim();
                const key = email || String(app._id);
                if (seenKeys.has(key)) return;
                seenKeys.add(key);

                const docs = app.documents || app.roleData?.documents || [];
                const adharFront = docs.find((d: any) => d.name?.toLowerCase().includes('front') || d.documentType === 'GovtID')?.url || '';
                const adharBack = docs.find((d: any) => d.name?.toLowerCase().includes('back'))?.url || '';
                const panCard = docs.find((d: any) => d.name?.toLowerCase().includes('pan') || d.documentType === 'Certificate')?.url || '';
                const resumeDoc = docs.find((d: any) => d.documentType === 'Resume' || d.name?.toLowerCase().includes('resume'))?.url || '';
                const account = employeeAccounts.find((acc) => (acc.email || '').toLowerCase() === email);

                mergedList.push({
                    id: String(app._id || ''),
                    srNo: mergedList.length + 1,
                    invitedBy: app.referrer?.referrerName || 'Direct Application',
                    name: applicant.name || 'Applicant',
                    profilePhoto: applicant.avatar || applicant.image || '',
                    meethiChatId: applicant.yaroId || applicant.userId || `MC-${100000 + mergedList.length}`,
                    username: `@${roleSlug}_${mergedList.length + 1}`,
                    gender: applicant.gender || 'Male',
                    age: applicant.age || 28,
                    dob: applicant.dob || '',
                    maritalStatus: applicant.maritalStatus || 'Single',
                    email: applicant.email || '',
                    mobile: applicant.phone || '',
                    alternateMobile: applicant.alternateMobile || '—',
                    country: typeof applicant.country === 'string' ? applicant.country : applicant.country?.name || 'India',
                    state: app.roleData?.state || applicant.state || '',
                    district: applicant.city || applicant.district || '',
                    city: applicant.city || '',
                    pincode: applicant.pincode || '',
                    fullAddress: applicant.address || '',
                    registrationDate: app.createdAt ? new Date(app.createdAt).toLocaleString('en-IN') : '—',
                    aadhaarNo: app.roleData?.aadhaarNo || app.roleData?.aadhaarNumber || applicant.aadhaarNo || applicant.aadhaar || app.aadhaarNo || app.data?.aadhaarNo || '',
                    panNo: app.roleData?.panNo || app.roleData?.panNumber || applicant.panNo || applicant.pan || app.panNo || app.data?.panNo || '',
                    aadhaarFront: requestDocumentUrl(app, 'front') || adharFront,
                    aadhaarBack: requestDocumentUrl(app, 'back') || adharBack,
                    panCard: requestDocumentUrl(app, 'pan') || panCard,
                    resumeUrl: requestDocumentUrl(app, 'resume') || resumeDoc,
                    qualification: app.roleData?.qualification || '',
                    experience: app.roleData?.experience || '',
                    previousCompany: app.roleData?.previousCompany || '',
                    skills: app.roleData?.skills || [],
                    reviewByOwner: {
                        reviewerName: (app.reviewNotes?.[0]?.authorName) || 'Owner Team',
                        reviewDate: app.reviewNotes?.[0]?.timestamp ? new Date(app.reviewNotes[0].timestamp).toLocaleString('en-IN') : '—',
                        remarks: app.reviewNotes?.[0]?.text || 'Application submitted',
                        status: app.status === 'approved' ? 'Approved' : 'Pending',
                    },
                    password: app.generatedCredentials?.password || app.password || (account ? '••••••••' : ''),
                    status: app.status === 'approved' ? 'active' : app.status === 'rejected' ? 'rejected' : 'pending',
                    managerCode: account?.specialCode || account?.employeeCode || '',
                    referralCode: app.referralCode || '',
                    timeline: [
                        { id: '1', title: `${roleTitle} Application Filed`, description: 'Application received via portal', timestamp: app.createdAt || new Date().toISOString(), actor: 'Applicant', type: 'submission' },
                    ],
                    rawItem: app,
                    accountDoc: account,
                });
            });
        }

        setRequests(mergedList);
        } catch (err: any) {
            console.error(`Failed to load ${roleTitle} requests:`, err);
            toast.error(err?.message || `Failed to load ${roleTitle} requests`);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    }, [requestType, roleSlug, roleTitle, targetEmployeeRole]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchRequests();
        setIsRefreshing(false);
        toast.success(`${roleTitle} requests refreshed`);
    };

    // Filter Logic
    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
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

            let matchesDate = true;
            if (dateFilter !== 'all') {
                const regDate = new Date(req.registrationDate).getTime();
                const now = Date.now();
                if (dateFilter === 'today') matchesDate = now - regDate <= 24 * 60 * 60 * 1000;
                else if (dateFilter === '7days') matchesDate = now - regDate <= 7 * 24 * 60 * 60 * 1000;
                else if (dateFilter === '30days') matchesDate = now - regDate <= 30 * 24 * 60 * 60 * 1000;
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

    // Pagination
    const totalPages = Math.ceil(sortedRequests.length / pageSize) || 1;
    const paginatedRequests = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedRequests.slice(start, start + pageSize);
    }, [sortedRequests, page, pageSize]);

    // Stats
    const stats = useMemo(() => ({
        total: requests.length,
        active: requests.filter((r) => r.status === 'active').length,
        pending: requests.filter((r) => r.status === 'pending').length,
        readyForInterview: requests.filter((r) => r.status === 'ready_for_interview').length,
        rejected: requests.filter((r) => r.status === 'rejected').length,
    }), [requests]);

    // Export Handlers
    const exportToCSV = () => {
        if (filteredRequests.length === 0) {
            toast.error('No data available to export');
            return;
        }

        const headers = [
            'SR', 'Invited By', 'Name', 'Meethi Chat ID', 'User Name', 'Gender',
            'Age', 'Email', 'Mobile Number', 'Country', 'State', 'District',
            'Registration Date', 'Review Status', 'Password', 'Status'
        ];

        const rows = filteredRequests.map((r) => [
            r.srNo,
            `"${r.invitedBy}"`,
            `"${r.name}"`,
            `"${r.meethiChatId}"`,
            `"${r.username}"`,
            r.gender,
            r.age,
            r.email,
            r.mobile,
            `"${r.country}"`,
            `"${r.state}"`,
            `"${r.district}"`,
            `"${r.registrationDate}"`,
            `"${r.reviewByOwner.status}"`,
            `"${r.password || ''}"`,
            r.status,
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `${roleSlug}-requests-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV report exported successfully');
    };

    const handleSort = (col: keyof ManagerRequestData) => {
        if (sortColumn === col) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(col);
            setSortDirection('asc');
        }
    };

    // Actions
    const handleOpenConfirm = (req: ManagerRequestData, type: 'accept' | 'reject') => {
        setConfirmModal({
            isOpen: true,
            type,
            request: req,
        });
        setActionRemarks('');
        setAssignedCode(req.managerCode || `${codePrefix}-${(req.state || req.district || 'GEN').slice(0, 3).toUpperCase()}-00${req.srNo}`);
    };

    const submitAction = async () => {
        const req = confirmModal.request;
        if (!req) return;
        const isAccept = confirmModal.type === 'accept';

        if (!isAccept) {
            const rejectMsg = (selectedRejectReason || actionRemarks || '').trim();
            if (rejectMsg.length < 10) {
                toast.error('Rejection reason must be at least 10 characters.');
                return;
            }
        }

        setIsSubmittingAction(true);
        try {
            let response: any = null;
            // 1. Try EMS endpoint first if request was filed via EMS
            if (req.rawItem && req.rawItem.requestType) {
                const endpoint = `/api/ems/requests/${req.id}/${isAccept ? 'approve' : 'reject'}`;
                const payload = isAccept
                    ? { comments: actionRemarks || 'Approved by Admin', specialCode: assignedCode }
                    : { reason: (selectedRejectReason || actionRemarks || '').trim(), comments: actionRemarks || `Rejected: ${selectedRejectReason}` };
                response = await apiClient.post(endpoint, payload);
            } else {
                // 2. Otherwise patch recruitment application status
                const endpoint = `/api/recruitment/admin/applications/${req.id}/status`;
                response = await apiClient.patch(endpoint, {
                    status: isAccept ? 'approved' : 'rejected',
                    note: actionRemarks || (isAccept ? 'Approved by Admin' : `Rejected: ${selectedRejectReason}`),
                    specialCode: assignedCode,
                });
            }

            if (response && response.success !== false) {
                const credentials = response.data?.generatedCredentials || response.generatedCredentials || null;
                if (isAccept && credentials) {
                    setApprovalDialog({
                        isOpen: true,
                        credentials,
                        applicantName: req.name,
                    });
                }

                setRequests((prev) =>
                    prev.map((item) => {
                        if (item.id === req.id) {
                            return {
                                ...item,
                                status: isAccept ? 'active' : 'rejected',
                                managerCode: isAccept ? (assignedCode || item.managerCode) : item.managerCode,
                                reviewByOwner: {
                                    reviewerName: currentUser?.name || 'Admin',
                                    reviewDate: new Date().toLocaleString('en-IN'),
                                    remarks: actionRemarks || (isAccept ? `${roleTitle} Application Approved & Role Granted.` : `Rejected: ${selectedRejectReason}`),
                                    status: isAccept ? 'Approved' : 'Rejected',
                                },
                            };
                        }
                        return item;
                    })
                );

                toast.success(isAccept ? `${roleTitle} application approved and account created!` : `${roleTitle} application rejected`);
                setConfirmModal({ isOpen: false, type: 'accept', request: null });
                await fetchRequests();
            } else {
                toast.error(response?.message || 'Failed to update request');
            }
        } catch (err: any) {
            console.error('Action failed:', err);
            toast.error(err?.message || 'Action failed. Please try again.');
        } finally {
            setIsSubmittingAction(false);
        }
    };

    const copyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    const copyCredentials = (req: ManagerRequestData) => {
        const text = `${roleTitle} Credentials\nEmail: ${req.email}\nPassword: ${req.password || 'Pass@1234'}\nCode: ${req.managerCode || 'N/A'}`;
        navigator.clipboard.writeText(text);
        toast.success(`${roleTitle} credentials copied to clipboard!`);
    };

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
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                {roleTitle} Request
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                                    Review Portal
                                </span>
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                Review profiles, passwords, identity documents, and approve {roleTitle} applications before activation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                        href={`/${region}-managers`}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 text-sm font-medium border border-cyan-200/80 dark:border-cyan-800/80 transition-all shadow-xs"
                    >
                        <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        <span>Manager Directory</span>
                    </Link>

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
                </div>
            </div>

            {/* Quick Insights Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div onClick={() => setStatusFilter('all')} className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-blue-500/10 border-blue-500/40 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Requests</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
                </div>
                <div onClick={() => setStatusFilter('pending')} className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'pending' ? 'bg-amber-500/10 border-amber-500/40 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">🟡 Pending</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.pending}</p>
                </div>
                <div onClick={() => setStatusFilter('active')} className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'active' ? 'bg-emerald-500/10 border-emerald-500/40 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">🟢 Active</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.active}</p>
                </div>
                <div onClick={() => setStatusFilter('ready_for_interview')} className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'ready_for_interview' ? 'bg-blue-500/10 border-blue-500/40 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">🔵 Interview</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.readyForInterview}</p>
                </div>
                <div onClick={() => setStatusFilter('rejected')} className={`p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'rejected' ? 'bg-red-500/10 border-red-500/40 shadow-sm' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">🔴 Rejected</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.rejected}</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by name, Meethi ID, email, mobile, territory..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 focus:outline-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="ready_for_interview">Ready For Interview</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <button
                            onClick={() => setFiltersExpanded(!filtersExpanded)}
                            className={`p-2.5 rounded-xl border text-sm flex items-center gap-1.5 transition-all ${filtersExpanded ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 border-blue-300 dark:border-blue-700' : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/80'}`}
                        >
                            <Filter className="w-4 h-4" />
                            <span className="hidden sm:inline">More Filters</span>
                        </button>
                    </div>
                </div>

                {filtersExpanded && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">Gender</label>
                            <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <option value="all">All</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">Date</label>
                            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="7days">Last 7 Days</option>
                                <option value="30days">Last 30 Days</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">State / Province</label>
                            <input type="text" placeholder="Filter by State..." value={stateFilter === 'all' ? '' : stateFilter} onChange={(e) => setStateFilter(e.target.value || 'all')} className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 block mb-1">District / City</label>
                            <input type="text" placeholder="Filter by District..." value={districtFilter === 'all' ? '' : districtFilter} onChange={(e) => setDistrictFilter(e.target.value || 'all')} className="w-full text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
                        </div>
                    </div>
                )}
            </div>

            {/* Main Requests Table */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-md shadow-blue-500/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th onClick={() => handleSort('srNo')} className="py-4 px-4 cursor-pointer hover:text-blue-500">
                                    <div className="flex items-center gap-1.5"><span>SR</span><ArrowUpDown className="w-3.5 h-3.5" /></div>
                                </th>
                                <th className="py-4 px-4">Applicant</th>
                                <th className="py-4 px-4">Contact Info</th>
                                <th className="py-4 px-4">Territory</th>
                                <th className="py-4 px-4">Documents</th>
                                <th className="py-4 px-4">Password</th>
                                <th className="py-4 px-4">Status</th>
                                <th className="py-4 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                                        Loading {roleTitle} requests...
                                    </td>
                                </tr>
                            ) : paginatedRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-slate-400">
                                        <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
                                        No matching {roleTitle} requests found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="py-4 px-4 font-mono text-xs text-slate-400">#{req.srNo}</td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-300 dark:border-slate-700">
                                                    {req.profilePhoto ? (
                                                        <img src={req.profilePhoto} alt={req.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-5 h-5 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{req.name}</p>
                                                    <p className="text-xs text-slate-500 font-mono">{req.meethiChatId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="text-xs font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                {req.email}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                {req.mobile}
                                            </p>
                                        </td>
                                        <td className="py-4 px-4 text-xs">
                                            <p className="font-medium text-slate-900 dark:text-white">{req.country}</p>
                                            <p className="text-slate-500">{[req.state, req.district].filter(Boolean).join(', ') || '—'}</p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <button
                                                onClick={() => { setSelectedReq(req); setDetailTab('identity'); }}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800"
                                            >
                                                <FileCheck className="w-3.5 h-3.5" />
                                                View Docs
                                            </button>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                    {showPasswords[req.id] ? (req.password || 'Pass@1234') : '••••••••'}
                                                </span>
                                                <button
                                                    onClick={() => togglePasswordVisibility(req.id)}
                                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600"
                                                    title={showPasswords[req.id] ? 'Hide Password' : 'Show Password'}
                                                >
                                                    {showPasswords[req.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                                <button
                                                    onClick={() => copyText(req.password || 'Pass@1234', 'Password')}
                                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600"
                                                    title="Copy Password"
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">{renderStatusBadge(req.status)}</td>
                                        <td className="py-4 px-4 text-right">
                                            <div className="inline-flex items-center gap-1.5">
                                                <button
                                                    onClick={() => { setSelectedReq(req); setDetailTab('profile'); }}
                                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
                                                >
                                                    Details
                                                </button>
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleOpenConfirm(req, 'accept')}
                                                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenConfirm(req, 'reject')}
                                                            className="px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <DeleteRequestButton
                                                    requestId={req.id}
                                                    onDeleted={() => {
                                                        setRequests((prev) => prev.filter((r) => r.id !== req.id));
                                                        toast.success('Request deleted');
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <p>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, sortedRequests.length)} of {sortedRequests.length} entries</p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Request Detail Modal / Drawer */}
            {selectedReq && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3" role="dialog" aria-modal="true">
                    <div className="max-h-[92vh] w-full max-w-5xl overflow-auto rounded-2xl border border-slate-700 bg-slate-950 p-6 text-white space-y-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-widest text-cyan-400 font-bold">{roleTitle} Application</p>
                                <h2 className="text-2xl font-bold mt-1 text-white">{selectedReq.name}</h2>
                                <p className="text-sm text-slate-400 font-mono">{selectedReq.meethiChatId} • {selectedReq.email}</p>
                            </div>
                            <button onClick={() => setSelectedReq(null)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
                            {(['profile', 'identity', 'credentials', 'review', 'timeline', 'team'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setDetailTab(tab)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${detailTab === tab ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:bg-slate-800/60'}`}
                                >
                                    {tab === 'identity' ? 'Identity & Documents' : tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab 1: Profile */}
                        {detailTab === 'profile' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                {[
                                    ['Full Name', selectedReq.name],
                                    ['Meethi Chat ID', selectedReq.meethiChatId],
                                    ['Email Address', selectedReq.email],
                                    ['Mobile Number', selectedReq.mobile],
                                    ['Alternate Mobile', selectedReq.alternateMobile || '—'],
                                    ['Gender', selectedReq.gender],
                                    ['Age', selectedReq.age],
                                    ['Date of Birth', selectedReq.dob || '—'],
                                    ['Country', selectedReq.country],
                                    ['State / Province', selectedReq.state || '—'],
                                    ['District / City', selectedReq.district || '—'],
                                    ['Full Address', selectedReq.fullAddress || '—'],
                                    ['Invited By', selectedReq.invitedBy],
                                    ['Registration Date', selectedReq.registrationDate],
                                ].map(([label, val]) => (
                                    <div key={String(label)} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60">
                                        <p className="text-xs text-slate-500 uppercase">{label}</p>
                                        <p className="font-medium text-slate-200 mt-0.5">{String(val || '—')}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tab 2: Identity & Documents */}
                        {detailTab === 'identity' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60">
                                        <p className="text-xs text-slate-500 uppercase">Aadhaar Number</p>
                                        <p className="font-mono font-medium text-slate-200 mt-1">{selectedReq.aadhaarNo || '—'}</p>
                                    </div>
                                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60">
                                        <p className="text-xs text-slate-500 uppercase">PAN Number</p>
                                        <p className="font-mono font-medium text-slate-200 mt-1">{selectedReq.panNo || '—'}</p>
                                    </div>
                                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60">
                                        <p className="text-xs text-slate-500 uppercase">Resume / CV</p>
                                        {selectedReq.resumeUrl ? (
                                            <DocumentPreview url={selectedReq.resumeUrl} title="Resume" className="mt-2" />
                                        ) : (
                                            <p className="text-slate-400 text-xs mt-1">Not Uploaded</p>
                                        )}
                                    </div>
                                </div>

                                {/* Document Images Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { title: 'Aadhaar Card Front', url: selectedReq.aadhaarFront || requestDocumentUrl(selectedReq.rawItem, 'front') },
                                        { title: 'Aadhaar Card Back', url: selectedReq.aadhaarBack || requestDocumentUrl(selectedReq.rawItem, 'back') },
                                        { title: 'PAN Card', url: selectedReq.panCard || requestDocumentUrl(selectedReq.rawItem, 'pan') },
                                        { title: 'Selfie with ID', url: requestDocumentUrl(selectedReq.rawItem, 'selfie') },
                                    ].map((doc, idx) => (
                                        <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-center">
                                            <p className="text-xs font-semibold text-slate-400 mb-2">{doc.title}</p>
                                            {doc.url ? (
                                                <div className="relative group cursor-pointer" onClick={() => setImageZoom({ isOpen: true, url: doc.url, title: doc.title, zoom: 1, rotate: 0 })}>
                                                    <DocumentPreview url={doc.url} title={doc.title} className="w-full min-h-44 rounded-lg bg-black/40 border border-slate-700" />
                                                    <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                                        <ZoomIn className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-44 flex items-center justify-center bg-slate-950/60 rounded-lg text-xs text-slate-500 border border-dashed border-slate-800">
                                                    No document image provided
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tab 3: Credentials */}
                        {detailTab === 'credentials' && (
                            <div className="max-w-xl space-y-4">
                                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase font-semibold">Login Email</label>
                                        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-700 mt-1">
                                            <span className="font-mono text-sm">{selectedReq.email}</span>
                                            <button onClick={() => copyText(selectedReq.email, 'Email')} className="text-cyan-400 hover:text-cyan-300">
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase font-semibold">Password</label>
                                        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-700 mt-1">
                                            <span className="font-mono text-sm">
                                                {showPasswords[selectedReq.id] ? (selectedReq.password || 'Pass@1234') : '••••••••••••'}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => togglePasswordVisibility(selectedReq.id)} className="text-slate-400 hover:text-white">
                                                    {showPasswords[selectedReq.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button onClick={() => copyText(selectedReq.password || 'Pass@1234', 'Password')} className="text-cyan-400 hover:text-cyan-300">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedReq.managerCode && (
                                        <div>
                                            <label className="text-xs text-slate-400 uppercase font-semibold">Employee / Special Code</label>
                                            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-700 mt-1">
                                                <span className="font-mono text-sm text-emerald-400">{selectedReq.managerCode}</span>
                                                <button onClick={() => copyText(selectedReq.managerCode || '', 'Code')} className="text-cyan-400 hover:text-cyan-300">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => copyCredentials(selectedReq)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold shadow-xs"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy Complete Credentials
                                </button>
                            </div>
                        )}

                        {/* Tab 4: Review */}
                        {detailTab === 'review' && (
                            <div className="space-y-4">
                                <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                                    <p className="text-xs text-slate-400 uppercase font-semibold">Review By Owner / Super Admin</p>
                                    <div className="mt-2 text-sm text-slate-200">
                                        <p><strong>Reviewer:</strong> {selectedReq.reviewByOwner.reviewerName}</p>
                                        <p><strong>Date:</strong> {selectedReq.reviewByOwner.reviewDate}</p>
                                        <p><strong>Status:</strong> {selectedReq.reviewByOwner.status}</p>
                                        <p className="mt-2 text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">{selectedReq.reviewByOwner.remarks}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab 5: Timeline */}
                        {detailTab === 'timeline' && (
                            <div className="space-y-3">
                                {selectedReq.timeline.map((event, idx) => (
                                    <div key={idx} className="flex items-start gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-1.5" />
                                        <div>
                                            <p className="font-semibold text-white text-sm">{event.title}</p>
                                            <p className="text-xs text-slate-400">{event.description}</p>
                                            <p className="text-xs text-slate-500 font-mono mt-1">{new Date(event.timestamp).toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Tab 6: Team */}
                        {detailTab === 'team' && (
                            selectedReq.accountDoc?._id ? (
                                <TeamReports key={selectedReq.accountDoc._id} initialRootId={String(selectedReq.accountDoc._id)} />
                            ) : (
                                <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-xl border border-slate-800">
                                    <Users className="w-10 h-10 mx-auto text-slate-500 mb-2 opacity-50" />
                                    <p>The manager team hierarchy is available once the manager account is approved and active.</p>
                                </div>
                            )
                        )}

                        {/* Modal Footer Actions */}
                        {selectedReq.status === 'pending' && (
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    onClick={() => handleOpenConfirm(selectedReq, 'reject')}
                                    className="px-5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-sm font-semibold"
                                >
                                    Reject Application
                                </button>
                                <button
                                    onClick={() => handleOpenConfirm(selectedReq, 'accept')}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-xs"
                                >
                                    <Check className="w-4 h-4" />
                                    Accept & Create Account
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Accept / Reject Confirmation Modal */}
            {confirmModal.isOpen && confirmModal.request && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                    <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-2xl">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${confirmModal.type === 'accept' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {confirmModal.type === 'accept' ? <CheckCircle2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">
                                    {confirmModal.type === 'accept' ? `Accept ${roleTitle} Request` : `Reject ${roleTitle} Request`}
                                </h3>
                                <p className="text-xs text-slate-400">Applicant: {confirmModal.request.name}</p>
                            </div>
                        </div>

                        {confirmModal.type === 'accept' ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-semibold">Assign Employee Code</label>
                                    <input
                                        type="text"
                                        value={assignedCode}
                                        onChange={(e) => setAssignedCode(e.target.value)}
                                        className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        placeholder="e.g. CM-DEL-001"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-semibold">Approval Remarks (Optional)</label>
                                    <textarea
                                        value={actionRemarks}
                                        onChange={(e) => setActionRemarks(e.target.value)}
                                        rows={3}
                                        className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        placeholder="Add any internal approval remarks..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-semibold">Select Rejection Reason</label>
                                    <select
                                        value={selectedRejectReason}
                                        onChange={(e) => setSelectedRejectReason(e.target.value)}
                                        className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 focus:outline-none"
                                    >
                                        <option value="Document Mismatch">Document Mismatch</option>
                                        <option value="Invalid Identification Details">Invalid Identification Details</option>
                                        <option value="Territory Already Assigned">Territory Already Assigned</option>
                                        <option value="Failed Background Verification">Failed Background Verification</option>
                                        <option value="Custom Reason">Custom Reason</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-semibold">Detailed Reason (Min 10 chars)</label>
                                    <textarea
                                        value={actionRemarks}
                                        onChange={(e) => setActionRemarks(e.target.value)}
                                        rows={3}
                                        className="w-full mt-1 px-3.5 py-2 text-sm rounded-xl bg-slate-950 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                        placeholder="Explain the reason for rejecting this application..."
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                            <button
                                disabled={isSubmittingAction}
                                onClick={() => setConfirmModal({ isOpen: false, type: 'accept', request: null })}
                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-medium text-slate-300"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isSubmittingAction}
                                onClick={submitAction}
                                className={`px-5 py-2 rounded-xl text-sm font-semibold shadow-xs ${confirmModal.type === 'accept' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                            >
                                {isSubmittingAction ? 'Processing...' : confirmModal.type === 'accept' ? 'Confirm Approval' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Image Zoom Modal */}
            {imageZoom.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                    <div className="relative max-w-4xl w-full flex flex-col items-center">
                        <div className="w-full flex items-center justify-between text-white mb-3">
                            <h4 className="font-semibold text-sm">{imageZoom.title}</h4>
                            <div className="flex items-center gap-3">
                                <button onClick={() => setImageZoom((prev) => ({ ...prev, zoom: Math.min(prev.zoom + 0.25, 3) }))} className="p-1.5 hover:bg-white/20 rounded">
                                    <ZoomIn className="w-5 h-5" />
                                </button>
                                <button onClick={() => setImageZoom((prev) => ({ ...prev, zoom: Math.max(prev.zoom - 0.25, 0.5) }))} className="p-1.5 hover:bg-white/20 rounded">
                                    <ZoomOut className="w-5 h-5" />
                                </button>
                                <button onClick={() => setImageZoom((prev) => ({ ...prev, rotate: (prev.rotate + 90) % 360 }))} className="p-1.5 hover:bg-white/20 rounded">
                                    <RotateCw className="w-5 h-5" />
                                </button>
                                <button onClick={() => setImageZoom({ isOpen: false, url: '', title: '', zoom: 1, rotate: 0 })} className="p-1.5 hover:bg-white/20 rounded">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-hidden max-h-[80vh] flex items-center justify-center">
                            <DocumentPreview
                                url={imageZoom.url}
                                title={imageZoom.title}
                                style={{ transform: `scale(${imageZoom.zoom}) rotate(${imageZoom.rotate}deg)`, transition: 'transform 0.2s ease' }}
                                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Approval Credentials Dialog */}
            <ApprovalSuccessDialog
                isOpen={approvalDialog.isOpen}
                onClose={() => setApprovalDialog({ isOpen: false, credentials: null, applicantName: '' })}
                credentials={approvalDialog.credentials}
                roleName={roleTitle}
                applicantName={approvalDialog.applicantName}
            />
        </div>
    );
}

