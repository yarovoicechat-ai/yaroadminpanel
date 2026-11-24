'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Ban, Search, RefreshCw, AlertCircle, Clock, ShieldAlert,
  CheckCircle2, XCircle, ShieldCheck, UserX, History, ArrowLeft
} from "lucide-react";
import Link from 'next/link';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface BannedUser {
  userId: number;
  name?: string;
  userName?: string;
  role?: string;
  isBanned?: boolean;
  isBlocked?: boolean;
  banType?: 'temporary' | 'permanent' | null;
  banReason?: string;
  adminNote?: string;
  bannedAt?: string;
  bannedUntil?: string | null;
  remainingTime?: string | null;
  bannedByName?: string;
}

export default function BannedUsersListPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<BannedUser[]>([]);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'temporary' | 'permanent' | 'expired' | 'unbanned' | 'all'>('active');
  const [page, setPage] = useState(1);

  // Unban modal/action state
  const [unbanningUser, setUnbanningUser] = useState<BannedUser | null>(null);
  const [unbanReason, setUnbanReason] = useState('Unbanned by administrator via Banned Users Console');
  const [submittingUnban, setSubmittingUnban] = useState(false);

  const fetchBannedUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('status', statusFilter);
      params.append('page', String(page));
      params.append('limit', '20');

      const res: any = await apiClient.get(`/api/admin/bans/users?${params.toString()}`);
      if (res?.success && res.data) {
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch banned users list');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, page]);

  useEffect(() => {
    fetchBannedUsers();
  }, [fetchBannedUsers]);

  const handleConfirmUnban = async () => {
    if (!unbanningUser) return;
    try {
      setSubmittingUnban(true);
      const res: any = await apiClient.post('/api/admin/bans/user/unban', {
        userId: unbanningUser.userId,
        reason: unbanReason,
      });

      if (res?.success) {
        toast.success(`User ${unbanningUser.userId} unbanned successfully`);
        setUnbanningUser(null);
        fetchBannedUsers();
      } else {
        toast.error(res?.message || 'Failed to unban user');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error unbanning user');
    } finally {
      setSubmittingUnban(false);
    }
  };

  const getBanTypeBadge = (user: BannedUser) => {
    if (!user.isBanned) {
      return <Badge className="bg-slate-800 text-slate-400 border border-slate-700">Inactive / Expired</Badge>;
    }
    if (user.banType === 'permanent') {
      return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 font-bold">Permanent Ban</Badge>;
    }
    return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">Temporary Ban</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/bans/id" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Back to Ban Action
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <UserX className="h-6 w-6 text-red-400" />
            Banned Users Directory
          </h1>
          <p className="text-sm text-slate-400">
            Complete list of active, temporary, permanent, and expired user account restrictions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/bans/history">
            <Button variant="outline" size="sm" className="border-slate-800 text-slate-300">
              <History className="h-4 w-4 mr-2" /> Ban History Audit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBannedUsers}
            disabled={loading}
            className="border-slate-800 hover:bg-slate-800 text-slate-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/60 border-slate-800/80">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by User ID, Name, Username, or Reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchBannedUsers(); }}
              className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2"
            >
              <option value="active">Active Bans Only</option>
              <option value="temporary">Temporary Bans</option>
              <option value="permanent">Permanent Bans</option>
              <option value="expired">Expired Bans</option>
              <option value="unbanned">Unbanned Accounts</option>
              <option value="all">All Records</option>
            </select>

            <Button onClick={fetchBannedUsers} className="bg-red-600 hover:bg-red-700 text-white font-semibold">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-slate-900/60 border-slate-800/80">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-950/60">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">User ID</TableHead>
                <TableHead className="text-slate-400">User Name / Details</TableHead>
                <TableHead className="text-slate-400">Ban Type</TableHead>
                <TableHead className="text-slate-400">Ban Reason</TableHead>
                <TableHead className="text-slate-400">Banned At</TableHead>
                <TableHead className="text-slate-400">Remaining / Expiry</TableHead>
                <TableHead className="text-slate-400">Issued By</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-red-400" />
                    Loading banned users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-slate-400">
                    No banned users found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => {
                  return (
                    <TableRow key={u.userId} className="border-slate-800/60 hover:bg-slate-800/30">
                      <TableCell className="font-mono text-xs font-bold text-amber-400">
                        {u.userId}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white text-sm">{u.name || 'Yaro User'}</span>
                          <span className="text-xs text-slate-400">@{u.userName || u.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getBanTypeBadge(u)}
                      </TableCell>
                      <TableCell className="max-w-[200px] text-xs text-slate-300 truncate" title={u.banReason}>
                        {u.banReason || 'Policy Violation'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {u.bannedAt ? new Date(u.bannedAt).toLocaleString() : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-semibold text-amber-300">
                            {u.remainingTime || (u.banType === 'permanent' ? 'Permanent' : '—')}
                          </span>
                          {u.bannedUntil && (
                            <span className="text-[10px] text-slate-500">
                              Until {new Date(u.bannedUntil).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {u.bannedByName || 'Admin'}
                      </TableCell>
                      <TableCell className="text-right">
                        {u.isBanned ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setUnbanningUser(u)}
                            className="bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold"
                          >
                            Unban
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-500">Unbanned</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Unban Confirmation Dialog */}
      {unbanningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
              <ShieldCheck className="h-5 w-5" />
              Confirm Unban Action
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to lift restrictions from user <strong className="text-white">{unbanningUser.name} (ID: {unbanningUser.userId})</strong>?
            </p>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Reason for Unban / Internal Note:</label>
              <Input
                value={unbanReason}
                onChange={(e) => setUnbanReason(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setUnbanningUser(null)} className="text-slate-400">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmUnban}
                disabled={submittingUnban}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
              >
                {submittingUnban ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
                Confirm Unban
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
