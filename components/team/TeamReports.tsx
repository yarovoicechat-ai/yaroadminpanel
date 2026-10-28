'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient, getApiBaseUrl } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';
import {
  Users,
  Phone,
  Video,
  Radio,
  Gem,
  Download,
  UserPlus,
  ChevronRight,
  ArrowLeft,
  Search,
  Calendar,
  Target,
  Sparkles,
  TrendingUp,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  Crown,
  Briefcase,
  Headphones,
  X,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';

type Channel = 'voice' | 'video' | 'room';

type Progress = {
  achieved: number;
  target: number | null;
  pending: number | null;
  enabled?: boolean;
  unassignedHosts?: number;
};

type CallsMetric = {
  achieved: number;
  target: number;
  pending: number;
};

type Member = {
  id: string;
  name: string;
  userId: number;
  role: string;
  earnedBeans: number;
  totalTarget?: number;
  totalPending?: number;
  totalCalls?: CallsMetric;
  targetRevision?: number;
  roomVolume?: Progress;
  hostCount?: number;
  channels: Record<Channel, Progress>;
};

type Breadcrumb = {
  id: string;
  name: string;
  role: string;
  userId?: number;
};

type Report = {
  month: string;
  root: { id: string; name: string; role: string; userId?: number };
  breadcrumbs?: Breadcrumb[];
  counts: Record<string, number>;
  summary: {
    hostCount: number;
    earnedBeans: number;
    totalTarget?: number;
    totalPending?: number;
    totalCalls?: CallsMetric;
    giftVolumeBeans: number;
    roomVolume: Progress;
    channels: Record<Channel, Progress>;
  };
  members: Member[];
  pagination: { page: number; limit: number; total: number };
  basis: string;
};

const ALL_ROLES = ['owner', 'operator', 'superAdmin', 'admin', 'bdLeader', 'bd', 'agency', 'host'] as const;
const CHANNELS: Channel[] = ['voice', 'video', 'room'];

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  owner: { label: 'Platform Owner', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: Crown },
  operator: { label: 'Operator', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: Shield },
  superAdmin: { label: 'Super Admin', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', icon: Shield },
  admin: { label: 'Admin', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: Briefcase },
  bdLeader: { label: 'BD Leader', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', icon: Users },
  bd: { label: 'BD', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', icon: Users },
  agency: { label: 'Agency', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30', icon: Sparkles },
  host: { label: 'Host', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: Video },
};

const CHANNEL_CONFIG: Record<Channel, { label: string; short: string; icon: any; color: string; border: string; bg: string }> = {
  voice: { label: '1-on-1 Voice Calling', short: 'Voice Call', icon: Phone, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  video: { label: '1-on-1 Video Calling', short: 'Video Call', icon: Video, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
  room: { label: 'Voice Party Room', short: 'Party Room', icon: Radio, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
};

const formatNumber = (n: number | null | undefined) => {
  if (n == null) return '0';
  return Number(n).toLocaleString('en-IN');
};

const calcPercent = (achieved: number, target: number | null | undefined) => {
  if (!target || target <= 0) return achieved > 0 ? 100 : 0;
  return Math.min(100, Math.round((achieved / target) * 100));
};

export default function TeamReports() {
  const { user } = useAuth();
  const [month, setMonth] = useState(() => new Date(Date.now() + 330 * 60000).toISOString().slice(0, 7));
  const [rootId, setRootId] = useState('');
  const [trail, setTrail] = useState<string[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Target editing state
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [targetValues, setTargetValues] = useState<Record<Channel, string>>({ voice: '', video: '', room: '' });
  const [enabledChannels, setEnabledChannels] = useState<Channel[]>([]);
  const [reason, setReason] = useState('');
  const [roomVolumeInput, setRoomVolumeInput] = useState('');

  // Invitation state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState('host');
  const [inviteSending, setInviteSending] = useState(false);

  // Multi-format spreadsheet export state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportSuccessModal, setExportSuccessModal] = useState<null | {
    type: 'sheets' | 'xlsx' | 'csv' | 'copy';
    filename?: string;
    csvFilename?: string;
  }>(null);
  const [cachedTsv, setCachedTsv] = useState('');
  const [cachedXlsxUrl, setCachedXlsxUrl] = useState('');
  const [cachedCsvUrl, setCachedCsvUrl] = useState('');

  // Compute allowed invite roles based on current user role
  const canonicalRole = String(user?.role || '').replace(/[-_\s]/g, '').toLowerCase();
  const currentRoleIndex = ALL_ROLES.findIndex(r => r.toLowerCase() === canonicalRole);
  const allowedInviteRoles = currentRoleIndex >= 0 ? ALL_ROLES.slice(currentRoleIndex + 1) : ['host'];

  const load = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const response = await apiClient.get<Report>('/api/team/report', {
        month,
        rootId: rootId || undefined,
        role: roleFilter || undefined,
        page,
        search: search.trim() || undefined,
      });
      if (!response.data) throw new Error('Team report data unavailable');
      setReport(response.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || 'Could not load team hierarchy');
    } finally {
      setBusy(false);
    }
  }, [month, rootId, roleFilter, page, search]);

  useEffect(() => {
    const timer = setTimeout(() => void load(), 200);
    return () => clearTimeout(timer);
  }, [load]);

  const handleMemberClick = (member: Member) => {
    if (member.role !== 'host') {
      setTrail(prev => [...prev, rootId]);
      setRootId(member.id);
      setRoleFilter('');
      setPage(1);
    } else {
      openTargetEditor(member);
    }
  };

  const handleBreadcrumbClick = (id: string) => {
    setRootId(id === report?.breadcrumbs?.[0]?.id ? '' : id);
    setTrail([]);
    setRoleFilter('');
    setPage(1);
  };

  const handleUpLevel = () => {
    if (trail.length > 0) {
      const lastId = trail[trail.length - 1];
      setRootId(lastId);
      setTrail(t => t.slice(0, -1));
      setRoleFilter('');
      setPage(1);
    } else if (rootId) {
      setRootId('');
      setRoleFilter('');
      setPage(1);
    }
  };

  const openTargetEditor = (member: Member) => {
    setEditMember(member);
    setReason('');
    setRoomVolumeInput(String(member.roomVolume?.target ?? ''));
    setEnabledChannels(CHANNELS.filter(c => member.channels[c]?.enabled));
    setTargetValues({
      voice: String(member.channels.voice?.target ?? ''),
      video: String(member.channels.video?.target ?? ''),
      room: String(member.channels.room?.target ?? ''),
    });
  };

  const saveTargets = async () => {
    if (!editMember) return;
    if (enabledChannels.length === 0) {
      toast.error('Please select at least one hosting type (Voice, Video, or Room)');
      return;
    }
    setBusy(true);
    try {
      const payload: Record<string, any> = {
        month,
        channels: enabledChannels,
        revision: editMember.targetRevision || 0,
        reason: reason.trim() || 'Targets set from team dashboard',
      };
      for (const ch of enabledChannels) {
        payload[ch] = targetValues[ch] === '' ? 0 : Number(targetValues[ch]);
      }
      if (enabledChannels.includes('room')) {
        payload.roomVolume = roomVolumeInput === '' ? null : Number(roomVolumeInput);
      }

      await apiClient.put(`/api/team/targets/${editMember.id}`, payload);
      setEditMember(null);
      toast.success(`Separate hosting targets saved for ${editMember.name}`);
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e.message || 'Could not save hosting targets');
    } finally {
      setBusy(false);
    }
  };

  const handleExport = async (format: 'sheets' | 'xlsx' | 'csv' | 'copy') => {
    setBusy(true);
    try {
      const response = await apiClient.post<{
        ticket: string;
        downloadPath: string;
        xlsxDownloadPath: string;
        csvDownloadPath: string;
        tsvDownloadPath: string;
        filename: string;
        csvFilename: string;
        tsv: string;
        csv: string;
        googleSheetsUrl: string;
      }>('/api/team/exports', {
        month,
        rootId: rootId || undefined,
      });

      const data = response.data;
      if (!data?.downloadPath) {
        throw new Error('Invalid export response from server');
      }

      const baseUrl = getApiBaseUrl();
      const xlsxUrl = new URL(data.xlsxDownloadPath || data.downloadPath, baseUrl).href;
      const csvUrl = new URL(data.csvDownloadPath, baseUrl).href;
      setCachedTsv(data.tsv || '');
      setCachedXlsxUrl(xlsxUrl);
      setCachedCsvUrl(csvUrl);

      if (format === 'sheets') {
        if (data.tsv && typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(data.tsv);
        }
        window.open('https://sheets.new', '_blank');
        setExportModalOpen(false);
        setExportSuccessModal({
          type: 'sheets',
          filename: data.filename,
          csvFilename: data.csvFilename,
        });
        toast.success('Google Sheet opened! Table copied to clipboard. Press Ctrl+V in cell A1.');
      } else if (format === 'xlsx') {
        window.location.assign(xlsxUrl);
        setExportModalOpen(false);
        toast.success(`Downloading ${data.filename} (.xlsx)`);
      } else if (format === 'csv') {
        window.location.assign(csvUrl);
        setExportModalOpen(false);
        toast.success(`Downloading ${data.csvFilename || 'targets.csv'}`);
      } else if (format === 'copy') {
        if (data.tsv && typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(data.tsv);
          toast.success('Full Google Sheets table copied to clipboard!');
        }
        setExportModalOpen(false);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e.message || 'Export failed');
    } finally {
      setBusy(false);
    }
  };

  const sendInvitation = async () => {
    const uid = Number(inviteUserId.trim());
    if (!uid || isNaN(uid) || uid <= 0) {
      toast.error('Please enter a valid numeric YARO User ID');
      return;
    }
    setInviteSending(true);
    try {
      const requestKey = `invite_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      await apiClient.post('/api/team/invitations', {
        userId: uid,
        role: inviteRole,
        requestKey,
      });
      setInviteModalOpen(false);
      setInviteUserId('');
      toast.success(`Team invitation sent to YARO ID ${uid}! Delivered to their in-app System Messages.`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e.message || 'Could not send invitation');
    } finally {
      setInviteSending(false);
    }
  };

  const summary = report?.summary;
  const voiceSummary = summary?.channels?.voice;
  const videoSummary = summary?.channels?.video;
  const roomSummary = summary?.channels?.room;
  const totalCallsAchieved = (voiceSummary?.achieved || 0) + (videoSummary?.achieved || 0);
  const totalCallsTarget = (voiceSummary?.target || 0) + (videoSummary?.target || 0);
  const totalCallsPending = (voiceSummary?.pending || 0) + (videoSummary?.pending || 0);
  const overallTarget = summary?.totalTarget ?? ((voiceSummary?.target || 0) + (videoSummary?.target || 0) + (roomSummary?.target || 0));
  const overallPending = summary?.totalPending ?? ((voiceSummary?.pending || 0) + (videoSummary?.pending || 0) + (roomSummary?.pending || 0));
  const overallAchieved = summary?.earnedBeans || 0;
  const overallPercent = calcPercent(overallAchieved, overallTarget);

  return (
    <div className="space-y-6 font-sans text-slate-100 pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 p-6 rounded-3xl border border-indigo-500/20 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                Team & Hosting Targets
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {report?.root.name || 'Enterprise Hierarchy'}
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                Role analytics, independent voice/video/room targets, Beans revenue & recruitment
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={() => setInviteModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30 font-bold text-xs md:text-sm px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>

          <Button
            onClick={() => void handleExport('sheets')}
            disabled={busy}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400/40 font-bold text-xs md:text-sm px-4 py-2 rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02]"
            title="Open directly in Google Sheets (sheets.new)"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-100" />
            <span>Open in Google Sheets</span>
            <ExternalLink className="h-3 w-3 text-emerald-200" />
          </Button>

          <Button
            onClick={() => setExportModalOpen(true)}
            disabled={busy}
            variant="outline"
            className="bg-slate-800/80 hover:bg-slate-700/80 text-emerald-300 border border-emerald-500/30 font-bold text-xs md:text-sm px-4 py-2 rounded-xl flex items-center gap-2"
            title="Choose format: .xlsx, .csv, Google Sheets"
          >
            <Download className="h-4 w-4 text-emerald-400" />
            <span>Export (.xlsx / .csv)</span>
          </Button>

          <Button
            onClick={() => void load()}
            disabled={busy}
            variant="outline"
            className="bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 font-medium text-xs px-3 py-2 rounded-xl"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin text-indigo-400' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Breadcrumb Hierarchy Trail */}
      {report?.breadcrumbs && report.breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 overflow-x-auto scrollbar-none">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <Crown className="h-3.5 w-3.5 text-amber-400" /> Hierarchy:
          </span>
          {report.breadcrumbs.map((crumb, idx) => {
            const isLast = idx === report.breadcrumbs!.length - 1;
            const rCfg = ROLE_CONFIG[crumb.role] || ROLE_CONFIG.host;
            return (
              <div key={crumb.id} className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleBreadcrumbClick(crumb.id)}
                  disabled={isLast}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                    isLast
                      ? `${rCfg.bg} ${rCfg.color} font-bold border ${rCfg.border}`
                      : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{crumb.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({rCfg.label})</span>
                </button>
                {!isLast && <ChevronRight className="h-3.5 w-3.5 text-slate-600" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Filters Bar: Month, Search, Up One Level */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="md:col-span-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
          <Input
            aria-label="Report month"
            type="month"
            value={month}
            onChange={e => {
              setMonth(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950/80 border-slate-700 text-white rounded-xl text-xs"
          />
        </div>

        <div className="md:col-span-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search member name, YARO user ID, or employee code..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950/80 border-slate-700 text-white pl-9 rounded-xl text-xs placeholder:text-slate-500"
          />
        </div>

        <div className="md:col-span-3 flex justify-end gap-2">
          {(trail.length > 0 || rootId) && (
            <Button
              onClick={handleUpLevel}
              variant="outline"
              className="bg-slate-800 hover:bg-slate-700 text-indigo-300 border-indigo-500/30 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Up One Level
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Stat Cards ("total sabhi host ne kitna target kiya hai") */}
      {summary && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Total Production & Targets Overview
              <span className="text-xs font-normal text-slate-400">({report.basis})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. All Hosts Revenue Achieved */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950/50 p-5 rounded-2xl border border-indigo-500/20 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Gem className="h-4 w-4 text-amber-400" />
                  All {summary.hostCount} Hosts Earned
                </span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Total Revenue
                </span>
              </div>
              <div className="text-2xl font-black text-amber-300 tracking-tight">
                {formatNumber(summary.earnedBeans)} <span className="text-sm font-semibold text-amber-400">Beans</span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Room Gift Volume:</span>
                <span className="font-mono text-slate-300">{formatNumber(summary.giftVolumeBeans)} Beans ref</span>
              </div>
            </div>

            {/* 2. Voice Calling Target (1-on-1 Voice) */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/30 p-5 rounded-2xl border border-emerald-500/20 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-emerald-300">
                  <Phone className="h-4 w-4 text-emerald-400" />
                  Voice Calls
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {calcPercent(voiceSummary?.achieved || 0, voiceSummary?.target)}%
                </span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatNumber(voiceSummary?.achieved)} <span className="text-xs text-slate-400">/ {formatNumber(voiceSummary?.target)} Beans</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${calcPercent(voiceSummary?.achieved || 0, voiceSummary?.target)}%` }}
                />
              </div>
              <div className="mt-2.5 text-[11px] flex justify-between text-slate-400">
                <span className="text-rose-400">Pending: {formatNumber(voiceSummary?.pending)} Beans</span>
                <span>{voiceSummary?.unassignedHosts || 0} unassigned</span>
              </div>
            </div>

            {/* 3. Video Calling Target (1-on-1 Video) */}
            <div className="bg-gradient-to-br from-slate-900 to-cyan-950/30 p-5 rounded-2xl border border-cyan-500/20 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-cyan-300">
                  <Video className="h-4 w-4 text-cyan-400" />
                  Video Calls
                </span>
                <span className="text-xs font-bold text-cyan-400">
                  {calcPercent(videoSummary?.achieved || 0, videoSummary?.target)}%
                </span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatNumber(videoSummary?.achieved)} <span className="text-xs text-slate-400">/ {formatNumber(videoSummary?.target)} Beans</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${calcPercent(videoSummary?.achieved || 0, videoSummary?.target)}%` }}
                />
              </div>
              <div className="mt-2.5 text-[11px] flex justify-between text-slate-400">
                <span className="text-rose-400">Pending: {formatNumber(videoSummary?.pending)} Beans</span>
                <span>{videoSummary?.unassignedHosts || 0} unassigned</span>
              </div>
            </div>

            {/* 4. Room Hosting Target (Party Room) */}
            <div className="bg-gradient-to-br from-slate-900 to-purple-950/30 p-5 rounded-2xl border border-purple-500/20 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-purple-300">
                  <Radio className="h-4 w-4 text-purple-400" />
                  Party Rooms
                </span>
                <span className="text-xs font-bold text-purple-400">
                  {calcPercent(roomSummary?.achieved || 0, roomSummary?.target)}%
                </span>
              </div>
              <div className="text-xl font-bold text-white">
                {formatNumber(roomSummary?.achieved)} <span className="text-xs text-slate-400">/ {formatNumber(roomSummary?.target)} Beans</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${calcPercent(roomSummary?.achieved || 0, roomSummary?.target)}%` }}
                />
              </div>
              <div className="mt-2.5 text-[11px] flex justify-between text-slate-400">
                <span className="text-rose-400">Pending: {formatNumber(roomSummary?.pending)} Beans</span>
                <span>{roomSummary?.unassignedHosts || 0} unassigned</span>
              </div>
            </div>
          </div>

          {/* Combined Performance Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <span className="text-slate-400 block">Total 1-on-1 Calls (Voice + Video):</span>
                <span className="font-bold text-white text-sm">
                  {formatNumber(totalCallsAchieved)} Beans achieved · {formatNumber(totalCallsPending)} pending of {formatNumber(totalCallsTarget)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <span className="text-slate-400 block">Overall Hosting Targets (All Channels):</span>
                <span className="font-bold text-amber-300 text-sm">
                  {formatNumber(overallAchieved)} achieved · {formatNumber(overallPending)} pending of {formatNumber(overallTarget)} Beans
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="text-slate-400 block">Room Gift Volume Reference:</span>
                <span className="font-bold text-purple-300 text-sm">
                  {formatNumber(summary.roomVolume?.achieved)} achieved · {formatNumber(summary.roomVolume?.pending)} pending of {formatNumber(summary.roomVolume?.target)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Hierarchy Filter Pills */}
      {report && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              Subordinate Roles Under Current View:
            </span>
            <span>Total Members: {report.pagination.total}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setRoleFilter('');
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                roleFilter === ''
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              All Roles ({report.pagination.total})
            </button>

            {Object.entries(report.counts)
              .filter(([, count]) => count > 0)
              .map(([roleKey, count]) => {
                const rCfg = ROLE_CONFIG[roleKey] || ROLE_CONFIG.host;
                const isSelected = roleFilter === roleKey;
                return (
                  <button
                    key={roleKey}
                    onClick={() => {
                      setRoleFilter(roleKey);
                      setPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                      isSelected
                        ? `${rCfg.bg} ${rCfg.color} border-current shadow-md`
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span>{rCfg.label}</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-[10px] text-slate-300 font-mono">
                      {count}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Member Hierarchy & Host Targets List */}
      <div className="bg-slate-900/70 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">
              {roleFilter ? `${ROLE_CONFIG[roleFilter]?.label || roleFilter} List` : 'Team Members & Hosts'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Page {page} of {Math.ceil((report?.pagination.total || 1) / (report?.pagination.limit || 30))}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="p-4">Member Info</th>
                <th className="p-4">Role Tier</th>
                <th className="p-4">Earned Beans</th>
                <th className="p-4">
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Phone className="h-3.5 w-3.5" /> Voice Call
                  </div>
                  <span className="font-normal text-[10px] text-slate-500">Achieved / Target / Pending</span>
                </th>
                <th className="p-4">
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Video className="h-3.5 w-3.5" /> Video Call
                  </div>
                  <span className="font-normal text-[10px] text-slate-500">Achieved / Target / Pending</span>
                </th>
                <th className="p-4">
                  <div className="flex items-center gap-1 text-purple-400">
                    <Radio className="h-3.5 w-3.5" /> Party Room
                  </div>
                  <span className="font-normal text-[10px] text-slate-500">Achieved / Target / Pending</span>
                </th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {report?.members.map(member => {
                const isHost = member.role === 'host';
                const rCfg = ROLE_CONFIG[member.role] || ROLE_CONFIG.host;
                const vProg = member.channels.voice;
                const vidProg = member.channels.video;
                const rProg = member.channels.room;

                return (
                  <tr key={member.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Member Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-800 to-indigo-900/60 flex items-center justify-center font-bold text-white border border-slate-700 shrink-0">
                          {member.name?.slice(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            {member.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            YARO ID: <span className="text-slate-200 font-semibold">{member.userId}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${rCfg.bg} ${rCfg.color} ${rCfg.border}`}>
                        <rCfg.icon className="h-3 w-3" />
                        {rCfg.label}
                      </span>
                      {!isHost && member.hostCount != null && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          {member.hostCount} hosts under team
                        </div>
                      )}
                    </td>

                    {/* Total Earned Beans */}
                    <td className="p-4">
                      <div className="font-black text-amber-300 text-sm">
                        {formatNumber(member.earnedBeans)}
                      </div>
                      <span className="text-[10px] text-slate-500">Beans</span>
                    </td>

                    {/* Voice Call Target / Achieved / Pending */}
                    <td className="p-4">
                      {vProg?.enabled === false ? (
                        <span className="text-slate-600 font-medium">N/A</span>
                      ) : (
                        <div>
                          <div className="text-slate-200 font-semibold">
                            {formatNumber(vProg?.achieved)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Target: {vProg?.target == null ? 'None' : formatNumber(vProg.target)}
                          </div>
                          {vProg?.pending != null && vProg.pending > 0 ? (
                            <div className="text-[10px] text-rose-400 font-medium">
                              Pending: {formatNumber(vProg.pending)}
                            </div>
                          ) : vProg?.target ? (
                            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Target Complete
                            </div>
                          ) : null}
                        </div>
                      )}
                    </td>

                    {/* Video Call Target / Achieved / Pending */}
                    <td className="p-4">
                      {vidProg?.enabled === false ? (
                        <span className="text-slate-600 font-medium">N/A</span>
                      ) : (
                        <div>
                          <div className="text-slate-200 font-semibold">
                            {formatNumber(vidProg?.achieved)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Target: {vidProg?.target == null ? 'None' : formatNumber(vidProg.target)}
                          </div>
                          {vidProg?.pending != null && vidProg.pending > 0 ? (
                            <div className="text-[10px] text-rose-400 font-medium">
                              Pending: {formatNumber(vidProg.pending)}
                            </div>
                          ) : vidProg?.target ? (
                            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Target Complete
                            </div>
                          ) : null}
                        </div>
                      )}
                    </td>

                    {/* Room Hosting Target / Achieved / Pending */}
                    <td className="p-4">
                      {rProg?.enabled === false ? (
                        <span className="text-slate-600 font-medium">N/A</span>
                      ) : (
                        <div>
                          <div className="text-slate-200 font-semibold">
                            {formatNumber(rProg?.achieved)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Target: {rProg?.target == null ? 'None' : formatNumber(rProg.target)}
                          </div>
                          {rProg?.pending != null && rProg.pending > 0 ? (
                            <div className="text-[10px] text-rose-400 font-medium">
                              Pending: {formatNumber(rProg.pending)}
                            </div>
                          ) : rProg?.target ? (
                            <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Target Complete
                            </div>
                          ) : null}
                        </div>
                      )}
                    </td>

                    {/* Action Button: Drill-Down or Set Target */}
                    <td className="p-4 text-right">
                      {isHost ? (
                        <Button
                          onClick={() => openTargetEditor(member)}
                          variant="outline"
                          className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border-indigo-500/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 ml-auto"
                        >
                          <Target className="h-3.5 w-3.5" />
                          Set Targets
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleMemberClick(member)}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 ml-auto shadow-md shadow-indigo-600/20"
                        >
                          <span>Open Team</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {!report?.members.length && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No team members or hosts found matching this branch and filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {report && report.pagination.total > 0 && (
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Showing {Math.min((page - 1) * report.pagination.limit + 1, report.pagination.total)} to{' '}
              {Math.min(page * report.pagination.limit, report.pagination.total)} of {report.pagination.total} records
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || busy}
                onClick={() => setPage(p => p - 1)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 text-xs rounded-xl"
              >
                Previous
              </Button>
              <span className="text-xs font-bold text-indigo-400 px-2">Page {page}</span>
              <Button
                variant="outline"
                size="sm"
                disabled={page * report.pagination.limit >= report.pagination.total || busy}
                onClick={() => setPage(p => p + 1)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 text-xs rounded-xl"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Target Configuration Modal */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Set Hosting Targets · {editMember.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Month: {month} · YARO ID: {editMember.userId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditMember(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Select only the hosting types this host works on. Voice, video and room hosting targets are independent.
            </p>

            <div className="space-y-4">
              {CHANNELS.map(ch => {
                const isEnabled = enabledChannels.includes(ch);
                const cfg = CHANNEL_CONFIG[ch];
                return (
                  <div
                    key={ch}
                    className={`p-4 rounded-2xl border transition-all ${
                      isEnabled ? `${cfg.bg} ${cfg.border}` : 'bg-slate-950/60 border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={e => {
                            if (e.target.checked) {
                              setEnabledChannels(prev => [...prev, ch]);
                            } else {
                              setEnabledChannels(prev => prev.filter(c => c !== ch));
                            }
                          }}
                          className="h-4 w-4 rounded accent-indigo-600 cursor-pointer"
                        />
                        <span className="font-bold text-sm text-white flex items-center gap-1.5">
                          <cfg.icon className={`h-4 w-4 ${cfg.color}`} />
                          {cfg.label}
                        </span>
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {isEnabled ? 'Target Active' : 'Disabled'}
                      </span>
                    </div>

                    {isEnabled && (
                      <div className="mt-2">
                        <label className="text-[11px] text-slate-400 mb-1 block">
                          Monthly Earned Beans Target:
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="1000"
                          value={targetValues[ch]}
                          onChange={e =>
                            setTargetValues(prev => ({ ...prev, [ch]: e.target.value }))
                          }
                          placeholder="e.g. 500000 Beans"
                          className="bg-slate-900 border-slate-700 text-white font-mono text-sm rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {enabledChannels.includes('room') && (
                <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-1">
                  <label className="text-xs font-semibold text-purple-300 block">
                    Optional Room Gift-Volume Beans Reference Target:
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="1000"
                    value={roomVolumeInput}
                    onChange={e => setRoomVolumeInput(e.target.value)}
                    placeholder="Reporting volume reference in Beans (optional)"
                    className="bg-slate-900 border-slate-700 text-white font-mono text-xs rounded-xl"
                  />
                  <p className="text-[10px] text-slate-500">
                    Reference volume only. Does not count as host wallet withdrawable earnings.
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Reason for Target Assignment / Change:
                </label>
                <Input
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="e.g. Monthly performance review target"
                  className="bg-slate-950/80 border-slate-700 text-white text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={() => setEditMember(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void saveTargets()}
                disabled={busy}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Save Targets
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Team Invitation Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Send In-App Invitation</h3>
                  <p className="text-xs text-slate-400">Delivered directly to user's System Messages</p>
                </div>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Recipient YARO User ID:
              </label>
              <Input
                type="number"
                value={inviteUserId}
                onChange={e => setInviteUserId(e.target.value)}
                placeholder="Enter 5-8 digit YARO User ID"
                className="bg-slate-950 border-slate-700 text-white font-mono text-sm rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                Assign Invitation Role:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {allowedInviteRoles.map(rKey => {
                  const cfg = ROLE_CONFIG[rKey] || ROLE_CONFIG.host;
                  const isSelected = inviteRole === rKey;
                  return (
                    <button
                      key={rKey}
                      type="button"
                      onClick={() => setInviteRole(rKey)}
                      className={`p-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                        isSelected
                          ? `${cfg.bg} ${cfg.color} ${cfg.border} shadow-md`
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <cfg.icon className="h-4 w-4 shrink-0" />
                      <span>{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-200/90 leading-relaxed">
              💡 The user will see this invitation in their mobile app under{' '}
              <span className="font-semibold text-white">System Messages</span>. They can open the
              invitation card, submit their own details, and get approved into your team!
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={() => setInviteModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={() => void sendInvitation()}
                disabled={inviteSending}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-lg shadow-indigo-600/30"
              >
                {inviteSending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Spreadsheet Export Options Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Export Team & Hosting Targets</h3>
                  <p className="text-xs text-slate-400">Choose your preferred spreadsheet format for {month}</p>
                </div>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Direct Google Sheets */}
              <button
                type="button"
                onClick={() => void handleExport('sheets')}
                disabled={busy}
                className="group p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 hover:border-emerald-400/70 text-left transition-all hover:scale-[1.02] shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <ExternalLink className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      1-Click Web
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                    Google Sheets
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Instantly launches a new Google Sheet (<span className="text-emerald-300">sheets.new</span>) with data copied to clipboard.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <span>Open sheets.new</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </button>

              {/* Option 2: Excel / Google Sheets (.xlsx) */}
              <button
                type="button"
                onClick={() => void handleExport('xlsx')}
                disabled={busy}
                className="group p-4 rounded-2xl bg-gradient-to-br from-teal-950/40 via-slate-900 to-slate-950 border border-teal-500/30 hover:border-teal-400/70 text-left transition-all hover:scale-[1.02] shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      <FileSpreadsheet className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      .XLSX
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-teal-300 transition-colors">
                    Excel & Sheets (.xlsx)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Full OpenXML workbook with formatted numeric cells, columns & totals.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-teal-400">
                  <span>Download .xlsx</span>
                  <Download className="h-3 w-3" />
                </div>
              </button>

              {/* Option 3: Universal CSV */}
              <button
                type="button"
                onClick={() => void handleExport('csv')}
                disabled={busy}
                className="group p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/30 hover:border-indigo-400/70 text-left transition-all hover:scale-[1.02] shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <FileText className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      UTF-8 BOM
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                    Universal CSV (.csv)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Standard comma-separated values encoded with UTF-8 BOM for Google Drive import.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-indigo-400">
                  <span>Download .csv</span>
                  <Download className="h-3 w-3" />
                </div>
              </button>

              {/* Option 4: Copy Table */}
              <button
                type="button"
                onClick={() => void handleExport('copy')}
                disabled={busy}
                className="group p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 hover:border-purple-400/70 text-left transition-all hover:scale-[1.02] shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      <Copy className="h-4 w-4" />
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Clipboard
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm group-hover:text-purple-300 transition-colors">
                    Copy Table Data
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Copies tab-delimited text ready to paste directly into any open Google Sheet or Excel.
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-purple-400">
                  <span>Copy table</span>
                  <Copy className="h-3 w-3" />
                </div>
              </button>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                onClick={() => setExportModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 rounded-xl text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Launched Guidance Dialog */}
      {exportSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 animate-pulse">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Google Sheet Launched!</h3>
                  <p className="text-xs text-emerald-400">Table copied to clipboard</p>
                </div>
              </div>
              <button
                onClick={() => setExportSuccessModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs">
              <p className="text-slate-300 font-medium">
                We opened a fresh Google Sheet at <span className="text-emerald-400 font-bold">sheets.new</span> in your browser!
              </p>
              <div className="space-y-2 text-slate-400">
                <div className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    1
                  </span>
                  <span>Switch to the new Google Sheet tab in your browser.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    2
                  </span>
                  <span>Click cell <strong className="text-white">A1</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    3
                  </span>
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono border border-slate-700">Ctrl + V</kbd> (or Cmd + V) to paste.</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-800">
                All 30 columns, separate targets, earned Beans, and summary totals will populate instantly!
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (cachedTsv && typeof navigator !== 'undefined' && navigator.clipboard) {
                    await navigator.clipboard.writeText(cachedTsv);
                    toast.success('Copied table to clipboard again!');
                  }
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 rounded-xl text-xs flex items-center gap-1.5"
              >
                <Copy className="h-3.5 w-3.5 text-indigo-400" />
                Copy Again
              </Button>

              {cachedXlsxUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    window.location.assign(cachedXlsxUrl);
                    toast.success('Downloading .xlsx');
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-teal-300 border-teal-500/30 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5 text-teal-400" />
                  Get .xlsx
                </Button>
              )}

              <Button
                size="sm"
                onClick={() => setExportSuccessModal(null)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs px-4"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
