'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Ban, Search, User, Trash2, Calendar, ShieldAlert, ShieldCheck,
  RefreshCw, AlertCircle, Clock, Shield, UserX, Loader2, ArrowRight,
  CheckCircle2, History, AlertTriangle, FileText, CheckCircle, XCircle
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { getAdminAvatar } from '@/lib/avatar';

const DURATION_PRESETS = [
  '1 Hour',
  '6 Hours',
  '12 Hours',
  '24 Hours',
  '3 Days',
  '7 Days',
  '15 Days',
  '30 Days',
  '90 Days',
  'Custom Date & Time',
  'Permanent',
];

const REASON_PRESETS = [
  'Abusive behavior / Harassment in voice room',
  'Inappropriate content / Violation of community guidelines',
  'Financial fraud / Recharge anomaly',
  'Spamming / Bot activity',
  'Impersonation of official staff',
  'Policy violation (General)',
];

export default function IdBansPage() {
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);

  // Search & lookup state
  const [userIdInput, setUserIdInput] = useState('');
  const [verifyingUser, setVerifyingUser] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<any | null>(null);

  // Ban Form State
  const [banType, setBanType] = useState<'temporary' | 'permanent'>('temporary');
  const [duration, setDuration] = useState<string>('24 Hours');
  const [customDateTime, setCustomDateTime] = useState<string>('');
  const [reason, setReason] = useState<string>('Violation of community guidelines');
  const [adminNote, setAdminNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Unban confirmation state
  const [unbanningUser, setUnbanningUser] = useState<any | null>(null);
  const [unbanReason, setUnbanReason] = useState<string>('Unbanned by authorized administrator');
  const [submittingUnban, setSubmittingUnban] = useState(false);

  // Ban History Modal State
  const [historyTargetId, setHistoryTargetId] = useState<string | null>(null);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Table filter state
  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [tableUsers, setTableUsers] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  // Load dashboard & banned users
  const fetchDashboardAndUsers = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, usersRes]: any = await Promise.all([
        apiClient.get('/api/admin/bans/dashboard').catch(() => null),
        apiClient.get('/api/admin/users?limit=50&status=suspended').catch(() => null),
      ]);

      if (dashRes?.success) {
        setDashboard(dashRes.data);
      }

      if (usersRes?.success && Array.isArray(usersRes.data?.users)) {
        setTableUsers(usersRes.data.users);
      } else if (usersRes?.data && Array.isArray(usersRes.data)) {
        setTableUsers(usersRes.data);
      }
    } catch (err) {
      console.error('Failed to load ban dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardAndUsers();
  }, [fetchDashboardAndUsers]);

  // Lookup user by User ID
  const handleLookupUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = userIdInput.trim();
    if (!q) {
      toast.error('Please enter a User ID');
      return;
    }

    setVerifyingUser(true);
    setVerifiedUser(null);
    try {
      const res: any = await apiClient.get(`/api/admin/users/${encodeURIComponent(q)}`);
      if (res?.success && res.data?.user) {
        setVerifiedUser(res.data.user);
        toast.success(`User verified: ${res.data.user.name || res.data.user.userId}`);
      } else if (res?.user) {
        setVerifiedUser(res.user);
        toast.success(`User verified: ${res.user.name || res.user.userId}`);
      } else {
        toast.error('User not found');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'User not found');
    } finally {
      setVerifyingUser(false);
    }
  };

  // Submit Ban Action
  const handleConfirmBan = async () => {
    const targetUid = verifiedUser?.userId || userIdInput.trim();
    if (!targetUid) {
      toast.error('Please select or verify a User ID first');
      return;
    }

    if (!reason.trim()) {
      toast.error('Reason for ban is required');
      return;
    }

    if (duration === 'Custom Date & Time' && !customDateTime) {
      toast.error('Please pick a custom expiration date and time');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        userId: targetUid,
        banType: duration === 'Permanent' ? 'permanent' : banType,
        duration,
        customDate: duration === 'Custom Date & Time' ? customDateTime : undefined,
        reason: reason.trim(),
        adminNote: adminNote.trim(),
      };

      const res: any = await apiClient.post('/api/admin/bans/user', payload);
      if (res?.success) {
        toast.success(res.message || `User #${targetUid} has been banned`);
        setVerifiedUser(null);
        setUserIdInput('');
        setAdminNote('');
        fetchDashboardAndUsers();
      } else {
        toast.error(res?.message || 'Failed to ban user');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to ban user');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Unban Action
  const handleConfirmUnban = async () => {
    if (!unbanningUser) return;
    setSubmittingUnban(true);
    try {
      const targetUid = unbanningUser.userId || unbanningUser._id;
      const res: any = await apiClient.post('/api/admin/bans/user/unban', {
        userId: targetUid,
        reason: unbanReason,
      });

      if (res?.success) {
        toast.success(res.message || `User #${targetUid} unbanned successfully`);
        setUnbanningUser(null);
        fetchDashboardAndUsers();
      } else {
        toast.error(res?.message || 'Failed to unban user');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to unban user');
    } finally {
      setSubmittingUnban(false);
    }
  };

  // View Ban History
  const handleOpenHistory = async (userId: string | number) => {
    setHistoryTargetId(String(userId));
    setLoadingHistory(true);
    try {
      const res: any = await apiClient.get(`/api/admin/bans/history?targetType=USER&targetId=${encodeURIComponent(String(userId))}`);
      if (res?.success && Array.isArray(res.data?.history)) {
        setHistoryRecords(res.data.history);
      } else {
        setHistoryRecords([]);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
      setHistoryRecords([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-rose-950/30 to-slate-900 p-6 rounded-2xl border border-rose-500/20">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Ban className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              User ID Ban & Penalty Management
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Enforce temporary and permanent User ID bans with automatic expiry, real-time Socket.IO session revocation, and full audit logs.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDashboardAndUsers}
          disabled={loading}
          className="border-slate-800 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Banned Users</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {dashboard?.users?.totalBanned ?? 0}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Temporary Bans</p>
                <h3 className="text-2xl font-bold text-amber-400 mt-1">
                  {dashboard?.users?.temporary ?? 0}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Permanent Bans</p>
                <h3 className="text-2xl font-bold text-red-500 mt-1">
                  {dashboard?.users?.permanent ?? 0}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                <UserX className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Banned Devices</p>
                <h3 className="text-2xl font-bold text-indigo-400 mt-1">
                  {dashboard?.devices?.totalBanned ?? 0}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Ban Action Form & User Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Ban User */}
        <Card className="lg:col-span-7 bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>Apply User ID Ban</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Search target user by ID, select duration & reason, and submit. The user will be immediately logged out and blocked on all devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: User ID Lookup */}
            <div>
              <Label className="text-xs text-slate-300 font-medium">1. Target User ID / Meethi ID</Label>
              <div className="flex gap-2 mt-1.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Enter 6-9 digit User ID..."
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    className="pl-9 bg-slate-950 border-slate-800 text-white font-mono"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleLookupUser}
                  disabled={verifyingUser || !userIdInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  {verifyingUser ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                  Verify User
                </Button>
              </div>
            </div>

            {/* Verified User Preview Card */}
            {verifiedUser && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={getAdminAvatar(verifiedUser.image || verifiedUser.avatar)}
                    alt={verifiedUser.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-700 bg-slate-800"
                  />
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span>{verifiedUser.name || 'Unnamed'}</span>
                      <Badge className="bg-slate-800 text-slate-300 text-[10px]">
                        ID: {verifiedUser.userId}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Role: <span className="capitalize text-slate-300">{verifiedUser.role || 'user'}</span> •
                      Status: <span className={verifiedUser.isBanned || verifiedUser.isBlocked ? 'text-rose-400' : 'text-emerald-400'}>
                        {verifiedUser.isBanned || verifiedUser.isBlocked ? 'Currently Banned' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenHistory(verifiedUser.userId)}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                >
                  <History className="w-3.5 h-3.5 mr-1" />
                  History
                </Button>
              </div>
            )}

            {/* Step 2: Ban Type Selection */}
            <div>
              <Label className="text-xs text-slate-300 font-medium">2. Ban Classification</Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setBanType('temporary');
                    if (duration === 'Permanent') setDuration('24 Hours');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    banType === 'temporary'
                      ? 'border-amber-500/50 bg-amber-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Temporary Ban</span>
                    <Clock className={`w-4 h-4 ${banType === 'temporary' ? 'text-amber-400' : 'text-slate-500'}`} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Automatic auto-expiration based on server time</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBanType('permanent');
                    setDuration('Permanent');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    banType === 'permanent'
                      ? 'border-red-500/50 bg-red-500/10 text-white'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">Permanent Ban</span>
                    <UserX className={`w-4 h-4 ${banType === 'permanent' ? 'text-red-400' : 'text-slate-500'}`} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Indefinite restriction until manual unban</p>
                </button>
              </div>
            </div>

            {/* Step 3: Duration Presets */}
            {banType === 'temporary' && (
              <div>
                <Label className="text-xs text-slate-300 font-medium">3. Ban Duration</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1.5">
                  {DURATION_PRESETS.filter((d) => d !== 'Permanent').map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`px-3 py-2 text-xs rounded-lg border font-medium transition-all ${
                        duration === d
                          ? 'border-amber-500/50 bg-amber-500/20 text-amber-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>

                {/* Custom Date & Time Picker */}
                {duration === 'Custom Date & Time' && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <Label className="text-xs text-slate-400">Custom Expiry Date & Time (UTC/Local)</Label>
                    <Input
                      type="datetime-local"
                      value={customDateTime}
                      onChange={(e) => setCustomDateTime(e.target.value)}
                      className="mt-1 bg-slate-900 border-slate-700 text-white text-xs"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Reason */}
            <div>
              <Label className="text-xs text-slate-300 font-medium">4. Reason for Ban (Visible to User)</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                {REASON_PRESETS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                  >
                    {r.length > 30 ? `${r.slice(0, 30)}...` : r}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Enter formal ban reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white text-sm"
              />
            </div>

            {/* Step 5: Internal Admin Note */}
            <div>
              <Label className="text-xs text-slate-300 font-medium">5. Internal Admin Note (Confidential, Never Shown to User)</Label>
              <Input
                placeholder="Audit notes, ticket ID, incident reference..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="mt-1 bg-slate-950 border-slate-800 text-white text-sm"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleConfirmBan}
                disabled={submitting || (!verifiedUser && !userIdInput.trim())}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-2.5"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                Confirm and Apply {banType === 'permanent' ? 'Permanent' : duration} Ban
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Info: Live Ban Enforcement Guide & Quick Audit */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Security Enforcement Rules</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-time Active Session Revocation</span>
                </div>
                <p>
                  Applying a ban immediately invalidates the user&apos;s access tokens, refresh tokens, and forcefully terminates all active Socket.IO connections.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Server-Time Expiry Verification</span>
                </div>
                <p>
                  Temporary bans rely strictly on server UTC time. When the duration elapses, the user is unbanned automatically on their next request without admin intervention.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tamper-Proof Audit Logging</span>
                </div>
                <p>
                  Every action (temporary ban, permanent ban, unban, auto-expire) is permanently cataloged in the audit history.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Currently Suspended / Banned Users Table */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-400" />
                <span>Currently Suspended & Banned Users</span>
                <Badge variant="outline" className="border-rose-500/30 text-rose-400 ml-2">
                  {tableUsers.length} Users
                </Badge>
              </CardTitle>
            </div>
            <div className="w-full sm:w-64">
              <Input
                placeholder="Filter by Name or ID..."
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">User</TableHead>
                  <TableHead className="text-slate-400">User ID</TableHead>
                  <TableHead className="text-slate-400">Ban Classification</TableHead>
                  <TableHead className="text-slate-400">Reason</TableHead>
                  <TableHead className="text-slate-400">Banned At / Until</TableHead>
                  <TableHead className="text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-rose-400" />
                      Loading banned users...
                    </TableCell>
                  </TableRow>
                ) : tableUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-500 text-sm">
                      No suspended or banned users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tableUsers
                    .filter((u) => {
                      if (!searchTableQuery) return true;
                      const q = searchTableQuery.toLowerCase();
                      return String(u.userId).includes(q) || String(u.name || '').toLowerCase().includes(q);
                    })
                    .map((target) => (
                      <TableRow key={target._id || target.userId} className="border-slate-800 hover:bg-slate-800/40">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={getAdminAvatar(target.image || target.avatar)}
                              alt={target.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800"
                            />
                            <div>
                              <div className="font-medium text-white text-sm">{target.name || 'Unnamed'}</div>
                              <div className="text-xs text-slate-500">{target.email || 'No email'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm text-slate-300 font-semibold">{target.userId}</span>
                        </TableCell>
                        <TableCell>
                          {target.banType === 'permanent' || (!target.bannedUntil && target.isBanned) ? (
                            <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                              Permanent
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                              Temporary
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-300 max-w-xs truncate block">
                            {target.banReason || 'Administrative penalty'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-slate-400 space-y-0.5">
                            <div>From: {target.bannedAt ? new Date(target.bannedAt).toLocaleString() : 'N/A'}</div>
                            {target.bannedUntil && (
                              <div className="text-amber-400 font-medium">
                                Until: {new Date(target.bannedUntil).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenHistory(target.userId)}
                              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                            >
                              <History className="w-3.5 h-3.5 mr-1" />
                              History
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => setUnbanningUser(target)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Unban
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Unban Confirmation Dialog */}
      {unbanningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-400">
              <span className="p-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-bold text-white text-lg">Confirm Account Unban</h3>
                <p className="text-xs text-slate-400">Restore access for User #{unbanningUser.userId}</p>
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-300 font-medium">Unban Reason</Label>
              <Input
                value={unbanReason}
                onChange={(e) => setUnbanReason(e.target.value)}
                placeholder="Reason for revoking ban..."
                className="mt-1.5 bg-slate-950 border-slate-800 text-white text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setUnbanningUser(null)}
                className="border-slate-800 text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUnban}
                disabled={submittingUnban}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {submittingUnban ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
                Confirm Unban
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ban History Audit Modal */}
      {historyTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Ban History Audit Log — User #{historyTargetId}</h3>
              </div>
              <button
                onClick={() => setHistoryTargetId(null)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1">
              {loadingHistory ? (
                <div className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                  Loading audit trail...
                </div>
              ) : historyRecords.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No historical ban or unban events recorded for this user.
                </div>
              ) : (
                historyRecords.map((item, idx) => (
                  <div key={item._id || idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            item.action === 'PERMANENT_BAN'
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : item.action === 'TEMPORARY_BAN'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : item.action === 'UNBAN'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                          }
                        >
                          {item.action}
                        </Badge>
                        {item.duration && (
                          <span className="text-slate-400 font-medium">({item.duration})</span>
                        )}
                      </div>
                      <span className="text-slate-500 font-mono">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                      </span>
                    </div>
                    <div className="text-slate-300">
                      Reason: <span className="text-slate-200">{item.reason || 'None specified'}</span>
                    </div>
                    {item.adminName && (
                      <div className="text-slate-400">
                        Admin: <span className="text-slate-300">{item.adminName}</span>
                      </div>
                    )}
                    {item.bannedUntil && (
                      <div className="text-amber-400/90">
                        Expires: {new Date(item.bannedUntil).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
