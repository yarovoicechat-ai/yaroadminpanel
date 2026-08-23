'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from 'sonner';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Ban,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  UserCheck,
  UserX,
  MessageSquare,
  Clock,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  Activity,
  Flame,
  Users
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import Image from 'next/image';

interface UserBrief {
  _id: string;
  userId?: number | string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  image?: string;
  role?: string;
  isBlocked?: boolean;
  chatMuteUntil?: string;
  chatMuteReason?: string;
  accountReviewRequired?: boolean;
  lastEscalationAction?: string;
  moderationRiskScore?: number;
  moderationRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface ChatViolationItem {
  _id: string;
  sender?: UserBrief;
  receiver?: UserBrief;
  content: string;
  normalizedContent?: string;
  violationType: 'PHONE_NUMBER' | 'SOCIAL_HANDLE' | 'LINK_URL' | 'NUMBER_WORDS' | 'MESSAGING_APP' | 'CONTACT_SHARING' | 'OBFUSCATED_CONTACT' | 'DIGIT' | 'NUMBER_WORD' | 'ID_SHARING' | 'URL' | 'DOMAIN' | 'EMAIL' | 'SOCIAL_CONTACT';
  reason?: string;
  matchedPattern?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN';
  source?: string;
  actionTaken?: 'NONE' | 'DISMISSED' | 'USER_BLOCKED';
  attemptCount?: number;
  reviewedBy?: UserBrief;
  reviewedAt?: string;
  createdAt: string;
}

interface StatsData {
  total: number;
  pending: number;
  highSeverity: number;
  blockedUsers: number;
}

interface RiskProfileData {
  userId: string;
  user: UserBrief;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  rawScore: number;
  timeDecayApplied: number;
  totalViolations: number;
  violationsLast24h: number;
  violationsLast7d: number;
  violationsLast30d: number;
  mostCommonViolationType: string;
  distinctCategoriesCount: number;
  categoryBreakdown: Record<string, number>;
  lastViolationAt?: string;
  currentChatRestriction: {
    isMuted: boolean;
    chatMuteUntil?: string;
    chatMuteReason?: string;
    chatMuteViolationCount?: number;
  };
  accountReviewStatus: {
    accountReviewRequired: boolean;
    accountReviewReason?: string;
    lastEscalationAction?: string;
    lastEscalatedAt?: string;
  };
  potentiallyRelatedAccountsCount: number;
}

export default function ChatViolationsPage() {
  const [violations, setViolations] = useState<ChatViolationItem[]>([]);
  const [stats, setStats] = useState<StatsData>({ total: 0, pending: 0, highSeverity: 0, blockedUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals & Drawers
  const [selectedViolation, setSelectedViolation] = useState<ChatViolationItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [dismissModalOpen, setDismissModalOpen] = useState(false);
  
  // Risk Profile Modal
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [riskProfile, setRiskProfile] = useState<RiskProfileData | null>(null);
  const [riskProfileLoading, setRiskProfileLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchViolations = useCallback(async (showToast = false) => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '20');
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (typeFilter !== 'ALL') params.append('violationType', typeFilter);
      if (severityFilter !== 'ALL') params.append('severity', severityFilter);

      const res = await apiClient.get<any>(`/api/moderation/violations?${params.toString()}`);

      if (res.success && res.data) {
        setViolations(res.data.violations || []);
        if (res.data.stats) setStats(res.data.stats);
        if (res.data.pagination) setTotalPages(res.data.pagination.totalPages || 1);
        if (showToast) toast.success("Chat violations updated");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load chat violations");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, statusFilter, typeFilter, severityFilter]);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  useEffect(() => {
    const handleNewViolationEvent = (e: any) => {
      console.log('⚡ Real-time violation event received on violations page:', e.detail);
      fetchViolations();
    };

    const handleRiskUpdateEvent = (e: any) => {
      console.log('⚡ Real-time risk update event received:', e.detail);
      const detail = e.detail || {};
      if (detail.levelEscalated) {
        toast.error(`🚨 User Risk Level Escalated!`, {
          description: `User #${detail.user?.userId || detail.userId} risk level increased from ${detail.previousRiskLevel} to ${detail.riskLevel} (Score: ${detail.riskScore}/100)`,
        });
      }
      fetchViolations();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('moderationViolation:new', handleNewViolationEvent);
      window.addEventListener('moderationEscalation:new', handleNewViolationEvent);
      window.addEventListener('moderationRisk:updated', handleRiskUpdateEvent);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('moderationViolation:new', handleNewViolationEvent);
        window.removeEventListener('moderationEscalation:new', handleNewViolationEvent);
        window.removeEventListener('moderationRisk:updated', handleRiskUpdateEvent);
      }
    };
  }, [fetchViolations]);

  const handleOpenRiskProfile = async (userId: string) => {
    setRiskModalOpen(true);
    setRiskProfileLoading(true);
    try {
      const res = await apiClient.get<any>(`/api/moderation/users/${userId}/risk-profile`);
      if (res.success && res.data) {
        setRiskProfile(res.data);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load risk profile");
    } finally {
      setRiskProfileLoading(false);
    }
  };

  const handleRecalculateRisk = async (userId: string) => {
    setActionLoading(true);
    try {
      const res = await apiClient.post<any>(`/api/moderation/users/${userId}/risk-action`, { action: 'RECALCULATE' });
      if (res.success) {
        toast.success("Risk score recalculated!");
        handleOpenRiskProfile(userId);
        fetchViolations();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to recalculate risk");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnmuteUser = async (userId: string) => {
    setActionLoading(true);
    try {
      const res = await apiClient.post<any>(`/api/moderation/users/${userId}/unmute`, {});
      if (res.success) {
        toast.success("User chat unmuted successfully!");
        fetchViolations();
        if (riskModalOpen) handleOpenRiskProfile(userId);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to unmute user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismissReview = async (userId: string) => {
    setActionLoading(true);
    try {
      const res = await apiClient.patch<any>(`/api/moderation/users/${userId}/review-status`, {});
      if (res.success) {
        toast.success("Account review status cleared!");
        fetchViolations();
        if (riskModalOpen) handleOpenRiskProfile(userId);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to clear review status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = async () => {
    if (!selectedViolation) return;
    setActionLoading(true);
    try {
      const res = await apiClient.patch<any>(`/api/moderation/violations/${selectedViolation._id}/dismiss`, {});
      if (res.success) {
        toast.success("Violation report dismissed");
        setDismissModalOpen(false);
        setSelectedViolation(null);
        fetchViolations();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to dismiss violation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!selectedViolation) return;
    setActionLoading(true);
    try {
      const res = await apiClient.post<any>(`/api/moderation/violations/${selectedViolation._id}/block-user`, {});
      if (res.success) {
        toast.success("User blocked & session terminated successfully!");
        setBlockModalOpen(false);
        setSelectedViolation(null);
        fetchViolations();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to block user");
    } finally {
      setActionLoading(false);
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'PHONE_NUMBER':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'LINK_URL':
      case 'URL':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'SOCIAL_HANDLE':
      case 'SOCIAL_CONTACT':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'NUMBER_WORDS':
      case 'NUMBER_WORD':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'OBFUSCATED_CONTACT':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  const getRiskBadgeStyle = (level?: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-purple-600/30 text-purple-300 border-purple-500/50 shadow-purple-500/20';
      case 'HIGH':
        return 'bg-red-500/25 text-red-400 border-red-500/40 shadow-red-500/20';
      case 'MEDIUM':
        return 'bg-amber-500/25 text-amber-300 border-amber-500/40';
      default:
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <ShieldAlert className="h-7 w-7 text-red-500" />
            Chat Violations & Risk Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time chat moderation dashboard & Trust & Safety repeat offender intelligence.
          </p>
        </div>
        <Button
          onClick={() => fetchViolations(true)}
          disabled={refreshing}
          variant="outline"
          className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-xs h-9 gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card bg-slate-900/60 border-slate-800/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Violations</p>
              <p className="text-2xl font-extrabold text-slate-100 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <MessageSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-slate-900/60 border-slate-800/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Pending Review</p>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">{stats.pending}</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-slate-900/60 border-slate-800/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">High Severity</p>
              <p className="text-2xl font-extrabold text-red-400 mt-1">{stats.highSeverity}</p>
            </div>
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card bg-slate-900/60 border-slate-800/80">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Users Blocked</p>
              <p className="text-2xl font-extrabold text-pink-400 mt-1">{stats.blockedUsers}</p>
            </div>
            <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20 text-pink-400">
              <Ban className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="glass-card bg-slate-900/60 border-slate-800/80">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <Input
                placeholder="Search by user name, ID, or text content..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-slate-950/60 border-slate-800 text-xs text-slate-200 h-9"
              />
            </div>

            {/* Violation Type Filter */}
            <div className="w-full md:w-44">
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="w-full h-9 px-3 bg-slate-950/60 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="ALL">All Types</option>
                <option value="PHONE_NUMBER">Phone Numbers</option>
                <option value="OBFUSCATED_CONTACT">Obfuscated / Evasion</option>
                <option value="SOCIAL_HANDLE">Social Handles / @</option>
                <option value="LINK_URL">Web Links / URLs</option>
                <option value="NUMBER_WORDS">Spelled-Out Numbers</option>
                <option value="ID_SHARING">ID Sharing</option>
                <option value="EMAIL">Email Address</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-36">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full h-9 px-3 bg-slate-950/60 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACTION_TAKEN">Action Taken</option>
                <option value="DISMISSED">Dismissed</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div className="w-full md:w-36">
              <select
                value={severityFilter}
                onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
                className="w-full h-9 px-3 bg-slate-950/60 border border-slate-800 rounded-md text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="ALL">All Severity</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="glass-card bg-slate-900/60 border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Attempted Message</th>
                <th className="px-4 py-3">Violation Category</th>
                <th className="px-4 py-3">Risk Level</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Attempts</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-400" />
                    Loading chat violations...
                  </td>
                </tr>
              ) : violations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400/80 mx-auto mb-2" />
                    No chat violation records found.
                  </td>
                </tr>
              ) : (
                violations.map((item) => {
                  const riskLevel = item.sender?.moderationRiskLevel || 'LOW';
                  const riskScore = item.sender?.moderationRiskScore ?? 0;

                  return (
                    <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Sender */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                            {item.sender?.image ? (
                              <Image src={item.sender.image} alt={item.sender.name || 'User'} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                                {item.sender?.name?.charAt(0) || 'U'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                              {item.sender?.name || 'Unknown User'}
                              {item.sender?.isBlocked && (
                                <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded border border-red-500/30">
                                  BLOCKED
                                </span>
                              )}
                              {item.sender?.chatMuteUntil && new Date(item.sender.chatMuteUntil).getTime() > Date.now() && (
                                <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30">
                                  MUTED
                                </span>
                              )}
                              {item.sender?.accountReviewRequired && (
                                <span className="bg-purple-500/20 text-purple-400 text-[10px] px-1.5 py-0.5 rounded border border-purple-500/30">
                                  REVIEW REQ
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-400">ID: {item.sender?.userId || 'N/A'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Recipient */}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-300">{item.receiver?.name || 'User'}</p>
                          <p className="text-[11px] text-slate-400">ID: {item.receiver?.userId || 'N/A'}</p>
                        </div>
                      </td>

                      {/* Attempted Message Container */}
                      <td className="px-4 py-3 max-w-xs">
                        <div className="bg-slate-950/80 border border-red-500/30 rounded-lg p-2 font-mono text-[11px] text-red-300 break-words select-all">
                          {item.content}
                        </div>
                      </td>

                      {/* Violation Category */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-semibold border ${getBadgeStyle(item.violationType)}`}>
                          {item.violationType}
                        </span>
                      </td>

                      {/* Risk Level Badge & Score */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => item.sender?._id && handleOpenRiskProfile(item.sender._id)}
                          className="group text-left"
                          title="Click to view Trust & Safety Risk Profile"
                        >
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border uppercase tracking-wider transition-transform group-hover:scale-105 ${getRiskBadgeStyle(riskLevel)}`}>
                            <Flame className="w-3 h-3" />
                            {riskLevel} ({riskScore})
                          </span>
                        </button>
                      </td>

                      {/* Severity */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(item.severity)}`}>
                          {item.severity}
                        </span>
                      </td>

                      {/* Attempts */}
                      <td className="px-4 py-3 font-semibold text-slate-200">
                        {item.attemptCount || 1}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {item.status === 'ACTION_TAKEN' ? (
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                            BLOCKED
                          </span>
                        ) : item.status === 'DISMISSED' ? (
                          <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-[10px]">
                            DISMISSED
                          </span>
                        ) : (
                          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-semibold">
                            PENDING
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedViolation(item);
                              setDetailsModalOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {item.sender?._id && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenRiskProfile(item.sender!._id)}
                              className="h-7 px-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] gap-1"
                              title="Risk Profile"
                            >
                              <Activity className="h-3 w-3" /> Risk Profile
                            </Button>
                          )}

                          {item.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedViolation(item);
                                  setBlockModalOpen(true);
                                }}
                                className="h-7 px-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] gap-1"
                                title="Block User"
                              >
                                <Ban className="h-3 w-3" /> Block
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedViolation(item);
                                  setDismissModalOpen(true);
                                }}
                                className="h-7 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] gap-1"
                                title="Dismiss Report"
                              >
                                <X className="h-3 w-3" /> Dismiss
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/40 text-xs">
            <p className="text-slate-400">
              Page <span className="font-semibold text-slate-200">{page}</span> of{' '}
              <span className="font-semibold text-slate-200">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 border-slate-800 bg-slate-900 text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 border-slate-800 bg-slate-900 text-slate-300"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Trust & Safety Risk Profile Drawer / Modal */}
      {riskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl space-y-4 p-6 text-xs text-slate-300 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Flame className="h-5 w-5 text-rose-500" />
                Trust & Safety Risk Profile
              </h3>
              <button
                onClick={() => { setRiskModalOpen(false); setRiskProfile(null); }}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {riskProfileLoading || !riskProfile ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-rose-400" />
                Calculating Risk Profile & Repeat Offender Intelligence...
              </div>
            ) : (
              <div className="space-y-4">
                {/* User Header */}
                <div className="flex items-center gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-slate-700 shrink-0 relative">
                    {riskProfile.user.image ? (
                      <Image src={riskProfile.user.image} alt={riskProfile.user.name || 'User'} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-sm">
                        {riskProfile.user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-100 text-sm">{riskProfile.user.name}</p>
                    <p className="text-[11px] text-slate-400">User ID: {riskProfile.user.userId}</p>
                  </div>
                </div>

                {/* Main Risk Gauge Card */}
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Current Risk Score</span>
                    <div className="text-3xl font-black text-slate-100 mt-0.5">
                      {riskProfile.riskScore}<span className="text-sm font-normal text-slate-400">/100</span>
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border uppercase tracking-wider shadow-lg ${getRiskBadgeStyle(riskProfile.riskLevel)}`}>
                      <Shield className="w-4 h-4" />
                      {riskProfile.riskLevel} RISK
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Violations</p>
                    <p className="text-lg font-bold text-slate-100 mt-0.5">{riskProfile.totalViolations}</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Last 24 Hours</p>
                    <p className="text-lg font-bold text-amber-400 mt-0.5">{riskProfile.violationsLast24h}</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Last 7 Days</p>
                    <p className="text-lg font-bold text-rose-400 mt-0.5">{riskProfile.violationsLast7d}</p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Last 30 Days</p>
                    <p className="text-lg font-bold text-purple-400 mt-0.5">{riskProfile.violationsLast30d}</p>
                  </div>
                </div>

                {/* Evasion & Category Intelligence */}
                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-2xl space-y-2">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Bypass & Evasion Intelligence
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Distinct Evasion Methods:</span>{' '}
                      <span className="font-bold text-slate-200">{riskProfile.distinctCategoriesCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Most Common Method:</span>{' '}
                      <span className="font-bold text-amber-300">{riskProfile.mostCommonViolationType}</span>
                    </div>
                  </div>

                  {/* Category breakdown tags */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {Object.entries(riskProfile.categoryBreakdown).map(([cat, cnt]) => (
                      <span key={cat} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-semibold text-slate-300">
                        {cat}: <strong className="text-cyan-400">{cnt}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Potentially Related Accounts Signal */}
                {riskProfile.potentiallyRelatedAccountsCount > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-between text-amber-300 text-xs">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Potentially Related Accounts (Same Environment / IP / Device):</span>
                    </div>
                    <span className="font-extrabold text-amber-200 text-sm px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
                      {riskProfile.potentiallyRelatedAccountsCount}
                    </span>
                  </div>
                )}

                {/* Current Account Restrictions */}
                <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Chat Mute Status</span>
                    {riskProfile.currentChatRestriction.isMuted ? (
                      <span className="text-amber-400 font-bold">
                        Muted until {new Date(riskProfile.currentChatRestriction.chatMuteUntil!).toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Clean / Unrestricted</span>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Account Review Status</span>
                    {riskProfile.accountReviewStatus.accountReviewRequired ? (
                      <span className="text-purple-400 font-bold">Review Required</span>
                    ) : (
                      <span className="text-emerald-400 font-semibold">Cleared</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={actionLoading}
                      onClick={() => handleRecalculateRisk(riskProfile.userId)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700"
                    >
                      Recalculate Risk
                    </Button>
                    {riskProfile.currentChatRestriction.isMuted && (
                      <Button
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => handleUnmuteUser(riskProfile.userId)}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs"
                      >
                        Unmute User
                      </Button>
                    )}
                    {riskProfile.accountReviewStatus.accountReviewRequired && (
                      <Button
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => handleDismissReview(riskProfile.userId)}
                        className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs"
                      >
                        Clear Review Status
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={() => { setRiskModalOpen(false); setRiskProfile(null); }}
                    variant="outline"
                    className="border-slate-700 bg-slate-800 text-slate-200 text-xs"
                  >
                    Close
                  </Button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      {/* Details Drawer / Modal */}
      {detailsModalOpen && selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-400" />
                Violation Record Details
              </h3>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block mb-0.5">Violation ID</span>
                <span className="font-mono text-slate-200">{selectedViolation._id}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-slate-500 block mb-0.5">Sender</span>
                  <p className="font-semibold text-slate-200">{selectedViolation.sender?.name}</p>
                  <p className="text-[11px] text-slate-400">ID: {selectedViolation.sender?.userId}</p>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Recipient</span>
                  <p className="font-semibold text-slate-200">{selectedViolation.receiver?.name}</p>
                  <p className="text-[11px] text-slate-400">ID: {selectedViolation.receiver?.userId}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Attempted Blocked Content</span>
                <div className="bg-slate-950 border border-red-500/40 rounded-xl p-3 font-mono text-xs text-red-300 break-words select-all">
                  {selectedViolation.content}
                </div>
              </div>

              {selectedViolation.reason && (
                <div>
                  <span className="text-slate-500 block mb-0.5">Detection Explanation</span>
                  <p className="text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                    {selectedViolation.reason}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-500 block mb-0.5">Category</span>
                  <span className="font-semibold text-amber-400">{selectedViolation.violationType}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Severity</span>
                  <span className="font-semibold text-red-400">{selectedViolation.severity}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Attempt Count</span>
                  <span className="font-semibold text-slate-200">{selectedViolation.attemptCount || 1}</span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedViolation.sender?._id && (
                    <Button
                      size="sm"
                      onClick={() => {
                        handleOpenRiskProfile(selectedViolation.sender!._id);
                        setDetailsModalOpen(false);
                      }}
                      className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs"
                    >
                      View Risk Profile
                    </Button>
                  )}
                </div>
                <Button
                  onClick={() => setDetailsModalOpen(false)}
                  variant="outline"
                  className="border-slate-700 bg-slate-800 text-slate-200 text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {blockModalOpen && selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                <UserX className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Block this user?</h3>
                <p className="text-xs text-slate-400">Sender: {selectedViolation.sender?.name} (ID: {selectedViolation.sender?.userId})</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              This action will set the user&apos;s account to <span className="text-red-400 font-bold">BLOCKED</span>, invalidate active session tokens, disconnect all active socket connections, and log a permanent administrative block audit.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setBlockModalOpen(false)}
                disabled={actionLoading}
                className="border-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBlockUser}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs gap-1.5"
              >
                {actionLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Block User
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dismiss Confirmation Modal */}
      {dismissModalOpen && selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="p-3 bg-slate-800 rounded-full border border-slate-700">
                <UserCheck className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Dismiss this violation?</h3>
                <p className="text-xs text-slate-400">Mark report as reviewed and dismissed.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDismissModalOpen(false)}
                disabled={actionLoading}
                className="border-slate-700 text-slate-300 text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDismiss}
                disabled={actionLoading}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs gap-1.5"
              >
                {actionLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

