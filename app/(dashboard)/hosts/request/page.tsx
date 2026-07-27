'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, RefreshCw, FileSpreadsheet, FileText, Filter,
    CheckCircle2, XCircle, Eye, EyeOff, ChevronDown, ChevronUp,
    UserCheck, Shield, Sparkles, Copy, ZoomIn, ZoomOut,
    RotateCw, Download, X, Calendar, MapPin, Mail, Phone,
    Clock, Award, Briefcase, FileCheck, ArrowUpDown, ChevronLeft,
    ChevronRight, Check, AlertCircle, HelpCircle, User, AlertTriangle, Play, Pause, Volume2, Mic, Music, ArrowLeftRight
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { ApprovalSuccessDialog, ApprovalCredentials } from '@/components/requests/ApprovalSuccessDialog';

// Types Definition
export type HostStatusType = 'active' | 'inactive';

export interface TimelineEvent {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    actor: string;
    type: 'submission' | 'under_review' | 'approval' | 'deactivation';
}

export interface HostRequestData {
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
    voiceAudioUrl: string;
    voiceDuration: string; // e.g. "0:28"
    voiceWaveform: number[]; // Array of waveform heights
    qualification?: string;
    experience?: string;
    skills?: string[];
    status: HostStatusType;
    timeline: TimelineEvent[];
    hostCode?: string;
    agencyName?: string;
}

// Initial Mock Data for Host Requests
// Helper Audio Player Component with Animated Waveform
function HostAudioPlayer({ audioUrl, duration, waveform, title }: { audioUrl: string; duration: string; waveform: number[]; title?: string }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            // Stop any other currently playing audios on page
            document.querySelectorAll('audio').forEach(a => a.pause());
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => toast.error('Error playing audio sample'));
        }
    };

    const safeAudioUrl = audioUrl?.trim();
    if (!safeAudioUrl) {
        return (
            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400">
                <Mic className="h-3.5 w-3.5" />
                No voice recording
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1.5 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs group/audio">
            <audio
                ref={audioRef}
                src={safeAudioUrl}
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                preload="none"
            />
            
            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    isPlaying
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600 border border-slate-200 dark:border-slate-600'
                }`}
                title={isPlaying ? "Pause Audio" : "Play Voice Recording"}
            >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
            </button>

            {/* Waveform Visualization Bars */}
            <div className="flex items-center gap-0.5 h-5 w-20">
                {waveform.slice(0, 16).map((val, idx) => (
                    <span
                        key={idx}
                        style={{ height: `${isPlaying ? Math.max(20, (val * (0.6 + Math.random() * 0.4))) : val}%` }}
                        className={`w-1 rounded-full transition-all duration-150 ${
                            isPlaying
                                ? 'bg-blue-600 dark:bg-blue-400 animate-pulse'
                                : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                    />
                ))}
            </div>

            {/* Duration Display */}
            <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300">
                {duration}
            </span>

            {/* Download Icon */}
            <a
                href={safeAudioUrl}
                download={`${title || 'host-voice-sample'}.mp3`}
                onClick={(e) => e.stopPropagation()}
                className="p-1 text-slate-400 hover:text-blue-600 transition-colors ml-1"
                title="Download Voice Audio"
            >
                <Download className="w-3.5 h-3.5" />
            </a>
        </div>
    );
}

export default function HostRequestsPage() {
    const { user: currentUser } = useAuth();
    const [requests, setRequests] = useState<HostRequestData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

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
    const [sortColumn, setSortColumn] = useState<keyof HostRequestData>('srNo');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modals & Drawers
    const [selectedReq, setSelectedReq] = useState<HostRequestData | null>(null);
    const [detailTab, setDetailTab] = useState<'profile' | 'identity' | 'voice' | 'registration' | 'timeline'>('profile');
    
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
        request: HostRequestData | null;
    }>({
        isOpen: false,
        type: 'accept',
        request: null
    });

    const [actionRemarks, setActionRemarks] = useState('');
    const [assignedCode, setAssignedCode] = useState('');
    const [selectedRejectReason, setSelectedRejectReason] = useState('Voice Sample Quality');
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

    // Fetch data from backend - no mock fallback
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/ems/requests', { requestType: 'Host Request' });
            const items: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.requests) ? res.data.requests : (res?.data?.data ?? []);
            if (res && res.success !== false) {
                const apiData: HostRequestData[] = items.map((item: any, idx: number) => {
                    const d = item.data || {};
                    return {
                        id: item._id || '',
                        srNo: idx + 1,
                        invitedBy: d.invitedBy || d.agencyName || item.createdByRole || 'Direct Application',
                        name: d.name || 'Host Applicant',
                        profilePhoto: d.profilePhoto || '',
                        meethiChatId: d.meethiChatId || d.mithiChatId || '',
                        username: d.username ? `@${d.username.replace('@','')}` : '',
                        gender: (d.gender as any) || 'Female',
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
                        voiceAudioUrl: d.voiceAudioUrl || d.introAudio || '',
                        voiceDuration: d.voiceDuration || '0:30',
                        voiceWaveform: [30, 50, 70, 90, 60, 40, 80, 95, 75, 45, 85, 65, 90, 50, 35, 75, 85, 60, 40, 25],
                        qualification: d.qualification || '',
                        experience: d.experience || '',
                        skills: d.skills ? (Array.isArray(d.skills) ? d.skills : d.skills.split(',')) : [],
                        status: item.status === 'approved' || item.status === 'active' ? 'active' : 'inactive',
                        hostCode: d.hostCode || d.specialCode || '',
                        agencyName: d.agencyName || d.agencyCode || 'Independent',
                        timeline: item.timeline || [
                            { id: '1', title: 'Host Application Received', description: 'Application & Voice Audition uploaded', timestamp: item.createdAt || new Date().toISOString(), actor: 'System', type: 'submission' }
                        ]
                    };
                });
                setRequests(apiData);
            } else {
                setRequests([]);
            }
        } catch (err) {
            console.error('Failed to load host requests:', err);
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
        toast.success('Host requests updated with latest data');
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
            inactive: requests.filter(r => r.status === 'inactive').length,
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
            'Registration Date', 'Voice Audio Duration', 'Status'
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
            `"${r.voiceDuration}"`,
            `"${r.status}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Host_Requests_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV report exported successfully');
    };

    const handlePrintPDF = () => {
        window.print();
    };

    // Sort Toggle Handler
    const handleSort = (col: keyof HostRequestData) => {
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
        request: HostRequestData | null;
    }>({
        isOpen: false,
        request: null
    });
    const [targetRecipient, setTargetRecipient] = useState('Royal Media Agency');
    const [transferNote, setTransferNote] = useState('');
    const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

    // Action Handlers (Accept / Reject)
    const handleOpenConfirm = (req: HostRequestData, type: 'accept' | 'reject') => {
        setConfirmModal({
            isOpen: true,
            type,
            request: req
        });
        setActionRemarks('');
        setAssignedCode(req.hostCode || `HST-${req.district.slice(0, 3).toUpperCase()}-00${req.srNo}`);
    };

    const handleOpenTransfer = (req: HostRequestData) => {
        setTransferModal({ isOpen: true, request: req });
        setTargetRecipient('Royal Media Agency');
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
                        title: 'Host Transferred',
                        description: `Transferred to ${targetRecipient}. Note: ${transferNote || 'No specific note'}`,
                        timestamp: new Date().toLocaleString(),
                        actor: currentUser?.name || 'Admin / Agency',
                        type: 'under_review'
                    };
                    return {
                        ...item,
                        invitedBy: `Transferred to ${targetRecipient}`,
                        agencyName: targetRecipient,
                        timeline: [newTimelineEvent, ...item.timeline]
                    };
                }
                return item;
            }));

            toast.success(`🔀 Host ${req.name} transferred to ${targetRecipient}!`);
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
                ? { comments: actionRemarks || 'Approved & Activated Host', hostCode: assignedCode }
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
                        const newStatus: HostStatusType = isAccept ? 'active' : 'inactive';
                        return {
                            ...item,
                            status: newStatus,
                            hostCode: isAccept ? (assignedCode || item.hostCode) : item.hostCode,
                            timeline: [{
                                id: String(Date.now()),
                                title: isAccept ? 'Host Activated' : 'Host Request Rejected',
                                description: actionRemarks || (isAccept ? 'Host streamer portal unlocked.' : `Reason: ${selectedRejectReason}`),
                                timestamp: new Date().toLocaleString('en-IN'),
                                actor: currentUser?.name || 'Admin / Agency',
                                type: isAccept ? 'approval' : 'deactivation'
                            }, ...item.timeline]
                        };
                    }
                    return item;
                }));

                if (!isAccept || !response.data?.generatedCredentials) {
                    toast.success(isAccept ? `✅ Host request for ${req.name} APPROVED & ACTIVATED!` : `❌ Host request for ${req.name} REJECTED.`);
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

    // Render Host Status Badges (🟢 Active / 🔴 Inactive)
    const renderStatusBadge = (status: HostStatusType) => {
        switch (status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        🟢 Active
                    </span>
                );
            case 'inactive':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/80 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        🔴 Inactive
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
                            <Mic className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                Host Request
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium">
                                    Admin / Agency Verification Portal
                                </span>
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                Review Host applications, listen to voice auditions, verify identity documents, and activate streamer credentials.
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Host Requests</p>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.total}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <User className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-emerald-200/60 dark:border-emerald-900/40 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">🟢 Active Hosts</p>
                        <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">{stats.active}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-[14px] border border-red-200/60 dark:border-red-900/40 shadow-xs flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">🔴 Inactive / Pending Hosts</p>
                        <p className="text-2xl font-extrabold text-red-700 dark:text-red-400 mt-1">{stats.inactive}</p>
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
                            placeholder="Search by Host Name, Meethi Chat ID, Username, Email, Mobile Number..."
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
                                    <option value="inactive">🔴 Inactive</option>
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
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
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

            {/* Main Data Table Card (Exact 19 Columns) */}
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
                                <th className="p-3.5 whitespace-nowrap text-center">Host Voice</th>
                                <th className="p-3.5 whitespace-nowrap text-center">Action</th>
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
                                        <td className="p-4 text-center"><div className="h-8 w-36 bg-slate-200 dark:bg-slate-800 rounded-xl mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-7 w-20 bg-slate-200 dark:bg-slate-800 rounded mx-auto" /></td>
                                        <td className="p-4 text-center"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto" /></td>
                                    </tr>
                                ))
                            ) : paginatedRequests.length === 0 ? (
                                // Empty State Illustration
                                <tr>
                                    <td colSpan={19} className="p-12 text-center">
                                        <div className="max-w-md mx-auto space-y-4">
                                            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center mx-auto border border-blue-200/60 dark:border-blue-800/60">
                                                <Mic className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-slate-800 dark:text-white">No Host Applications Found</h3>
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
                                                    {req.hostCode && (
                                                        <span className="text-[10px] text-blue-600 font-mono bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                                                            {req.hostCode}
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
                                        </td>

                                        {/* 15. Aadhaar Back Side */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
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
                                        </td>

                                        {/* 16. PAN Card */}
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
                                                    className="text-blue-600 hover:text-blue-700 font-semibold text-[11px] hover:underline"
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </td>

                                        {/* 17. Host Voice Column (Audio Player with Play/Pause, Duration & Download) */}
                                        <td className="p-3.5 text-center whitespace-nowrap">
                                            <HostAudioPlayer
                                                audioUrl={req.voiceAudioUrl}
                                                duration={req.voiceDuration}
                                                waveform={req.voiceWaveform}
                                                title={req.name}
                                            />
                                        </td>

                                        {/* 18. Action Column */}
                                        <td className="p-3.5 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {/* Accept Button */}
                                                <button
                                                    onClick={() => handleOpenConfirm(req, 'accept')}
                                                    disabled={req.status === 'active'}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-[11px] transition-all shadow-xs"
                                                    title="Accept & Activate Host"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Accept</span>
                                                </button>

                                                {/* Reject Button */}
                                                <button
                                                    onClick={() => handleOpenConfirm(req, 'reject')}
                                                    disabled={req.status === 'inactive'}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-semibold text-[11px] transition-all shadow-xs"
                                                    title="Reject Host Request"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    <span>Reject</span>
                                                </button>

                                                {/* Transfer Button */}
                                                <button
                                                    onClick={() => handleOpenTransfer(req)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] transition-all shadow-xs"
                                                    title="Transfer Request to Another Agency / Handler"
                                                >
                                                    <ArrowLeftRight className="w-3.5 h-3.5" />
                                                    <span>Transfer</span>
                                                </button>

                                                {/* View Details Icon Button */}
                                                <button
                                                    onClick={() => setSelectedReq(req)}
                                                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 transition-all"
                                                    title="View Full Host Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>

                                        {/* 19. Status Column */}
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
                                            Meethi Chat ID: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{selectedReq.meethiChatId}</span> • Agency: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedReq.agencyName || 'Independent'}</span>
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
                            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 text-xs font-semibold overflow-x-auto scrollbar-none">
                                <button
                                    onClick={() => setDetailTab('profile')}
                                    className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
                                        detailTab === 'profile'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Personal & Address Details
                                </button>
                                <button
                                    onClick={() => setDetailTab('voice')}
                                    className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                                        detailTab === 'voice'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    <Mic className="w-3.5 h-3.5 text-blue-500" />
                                    Voice Audition & Waveform
                                </button>
                                <button
                                    onClick={() => setDetailTab('identity')}
                                    className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
                                        detailTab === 'identity'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Verification Documents (KYC)
                                </button>
                                <button
                                    onClick={() => setDetailTab('registration')}
                                    className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
                                        detailTab === 'registration'
                                            ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                >
                                    Registration Information
                                </button>
                                <button
                                    onClick={() => setDetailTab('timeline')}
                                    className={`py-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
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
                                                Personal Information
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
                                                    <p className="text-slate-400">Meethi Chat ID</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100 font-mono">{selectedReq.meethiChatId}</p>
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
                                                    <p className="text-slate-400">Full Address</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.fullAddress}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'voice' && (
                                    <div className="space-y-6 text-xs">
                                        {/* Dedicated Audio Audition Suite Card */}
                                        <div className="bg-gradient-to-br from-blue-500/10 via-slate-50 to-indigo-500/10 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 p-6 rounded-2xl border border-blue-200 dark:border-slate-700 space-y-5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
                                                        <Mic className="w-6 h-6 animate-pulse" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-bold text-slate-900 dark:text-white">Host Introduction Voice Recording</h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">High definition voice sample uploaded for audition review</p>
                                                    </div>
                                                </div>

                                                <a
                                                    href={selectedReq.voiceAudioUrl}
                                                    download={`${selectedReq.name}-voice-audition.mp3`}
                                                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>Download Voice Sample</span>
                                                </a>
                                            </div>

                                            {/* Enhanced Audio Waveform Display */}
                                            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Music className="w-4 h-4 text-blue-500" />
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300">Audition Waveform Spectrum</span>
                                                    </div>
                                                    <span className="font-mono font-bold text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 px-2.5 py-1 rounded-md">
                                                        Duration: {selectedReq.voiceDuration}
                                                    </span>
                                                </div>

                                                {/* Visual Waveform Bar Canvas */}
                                                <div className="flex items-end justify-between h-24 px-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 py-3 gap-1">
                                                    {selectedReq.voiceWaveform.concat([50, 75, 40, 85]).map((height, i) => (
                                                        <div
                                                            key={i}
                                                            style={{ height: `${height}%` }}
                                                            className="flex-1 bg-gradient-to-t from-blue-600 to-indigo-400 dark:from-blue-500 dark:to-indigo-300 rounded-full opacity-80 hover:opacity-100 transition-all hover:scale-y-110"
                                                        />
                                                    ))}
                                                </div>

                                                {/* Player Controls inside Drawer */}
                                                <div className="flex items-center justify-center pt-2">
                                                    <HostAudioPlayer
                                                        audioUrl={selectedReq.voiceAudioUrl}
                                                        duration={selectedReq.voiceDuration}
                                                        waveform={selectedReq.voiceWaveform}
                                                        title={selectedReq.name}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'identity' && (
                                    <div className="space-y-6 text-xs">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {/* Aadhaar Front Card */}
                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Aadhaar Front Side</h4>
                                                    <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold">Uploaded</span>
                                                </div>
                                                <div
                                                    onClick={() => setImageZoom({ isOpen: true, url: selectedReq.aadhaarFront, title: `${selectedReq.name} - Aadhaar Front`, zoom: 1, rotate: 0 })}
                                                    className="relative group rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer shadow-xs"
                                                >
                                                    <img src={selectedReq.aadhaarFront} alt="Aadhaar Front" className="w-full h-36 object-cover" />
                                                    <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold gap-1.5">
                                                        <ZoomIn className="w-4 h-4" /> Click to Zoom
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-slate-500">Aadhaar No: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedReq.aadhaarNo}</span></p>
                                            </div>

                                            {/* Aadhaar Back Card */}
                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">Aadhaar Back Side</h4>
                                                    <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold">Uploaded</span>
                                                </div>
                                                <div
                                                    onClick={() => setImageZoom({ isOpen: true, url: selectedReq.aadhaarBack, title: `${selectedReq.name} - Aadhaar Back`, zoom: 1, rotate: 0 })}
                                                    className="relative group rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer shadow-xs"
                                                >
                                                    <img src={selectedReq.aadhaarBack} alt="Aadhaar Back" className="w-full h-36 object-cover" />
                                                    <div className="absolute inset-0 bg-blue-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold gap-1.5">
                                                        <ZoomIn className="w-4 h-4" /> Click to Zoom
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-slate-500">Address Proof Verified</p>
                                            </div>

                                            {/* PAN Card */}
                                            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">PAN Card</h4>
                                                    <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded font-bold">Uploaded</span>
                                                </div>
                                                <div
                                                    onClick={() => setImageZoom({ isOpen: true, url: selectedReq.panCard, title: `${selectedReq.name} - PAN Card`, zoom: 1, rotate: 0 })}
                                                    className="relative group rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 cursor-pointer shadow-xs"
                                                >
                                                    <img src={selectedReq.panCard} alt="PAN Card" className="w-full h-36 object-cover" />
                                                    <div className="absolute inset-0 bg-emerald-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity font-bold gap-1.5">
                                                        <ZoomIn className="w-4 h-4" /> Click to Zoom
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-slate-500">PAN No: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedReq.panNo}</span></p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'registration' && (
                                    <div className="space-y-6 text-xs">
                                        <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                                            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-blue-600 dark:text-blue-400">
                                                Registration Information
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-slate-400">Registration Date & Time</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100 font-mono">{selectedReq.registrationDate}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Invited By / Agency</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.invitedBy}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Assigned Host Code</p>
                                                    <p className="font-semibold text-blue-600 dark:text-blue-400 font-mono">{selectedReq.hostCode || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400">Assigned Agency Network</p>
                                                    <p className="font-semibold text-slate-800 dark:text-slate-100">{selectedReq.agencyName || 'Independent'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'timeline' && (
                                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 text-xs">
                                        {selectedReq.timeline.map((evt) => (
                                            <div key={evt.id} className="relative group">
                                                <div className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 ${
                                                    evt.type === 'approval' ? 'border-emerald-500 bg-emerald-500' :
                                                    evt.type === 'deactivation' ? 'border-red-500 bg-red-500' : 'border-blue-500 bg-blue-500'
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
                                        disabled={selectedReq.status === 'inactive'}
                                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40"
                                    >
                                        Reject Host
                                    </button>
                                    <button
                                        onClick={() => { const r = selectedReq; setSelectedReq(null); handleOpenConfirm(r, 'accept'); }}
                                        disabled={selectedReq.status === 'active'}
                                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-40"
                                    >
                                        Accept Host
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
                                        {confirmModal.type === 'accept' ? 'Approve Host Activation' : 'Reject Host Request'}
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
                                            Assigned Host Code
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
                                            Approval Remarks (Optional)
                                        </label>
                                        <textarea
                                            value={actionRemarks}
                                            onChange={(e) => setActionRemarks(e.target.value)}
                                            placeholder="Enter approval notes or streamer instructions..."
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
                                            <option value="Voice Sample Quality">Low Audio Quality / Unclear Voice Sample</option>
                                            <option value="Document Mismatch">Aadhaar / PAN Document Mismatch</option>
                                            <option value="Unclear Scan">Unclear or Blurry ID Scan</option>
                                            <option value="Ineligible Age">Does Not Meet Minimum Age Requirements</option>
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
                                            placeholder="Explain why this host application is being rejected..."
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
                                    <span>{confirmModal.type === 'accept' ? 'Confirm Activation' : 'Confirm Rejection'}</span>
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
                                        Transfer Host Request
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Reassign Host <span className="font-semibold text-slate-800 dark:text-slate-200">{transferModal.request.name}</span> ({transferModal.request.meethiChatId}) to another Agency Network or Admin.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Target Recipient Agency / Network
                                    </label>
                                    <select
                                        value={targetRecipient}
                                        onChange={(e) => setTargetRecipient(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
                                    >
                                        <option value="Royal Media Agency">Royal Media Agency</option>
                                        <option value="Star Talent Agency">Star Talent Agency</option>
                                        <option value="Apex Live Media">Apex Live Media</option>
                                        <option value="Galaxy Host Management">Galaxy Host Management</option>
                                        <option value="Direct Meethi Host Network">Direct Meethi Host Network</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Transfer Reason / Remarks
                                    </label>
                                    <textarea
                                        value={transferNote}
                                        onChange={(e) => setTransferNote(e.target.value)}
                                        placeholder="Enter reasons for transferring this host to another agency..."
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
                roleName="Host"
                applicantName={approvalDialog.applicantName}
            />
        </div>
    );
}
