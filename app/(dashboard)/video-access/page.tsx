'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Video, Search, RefreshCw, ShieldCheck, ShieldAlert, User,
  CheckCircle2, XCircle, AlertTriangle, Clock, History
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface VideoUser {
  userId: number;
  name?: string;
  userName?: string;
  email?: string;
  role?: string;
  hasVideoAccess?: boolean;
  canWatchTogether?: boolean;
  videoAccessGrantedByName?: string;
  videoAccessGrantedAt?: string;
  createdAt: string;
}

export default function VideoAccessManagementPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<VideoUser[]>([]);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [page, setPage] = useState(1);

  // Toggling state
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', String(page));
      params.append('limit', '20');

      const res: any = await apiClient.get(`/api/admin/video-access/users?${params.toString()}`);
      if (res?.success && res.data) {
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch video access users');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggle = async (user: VideoUser) => {
    const nextState = !user.hasVideoAccess && !user.canWatchTogether;
    try {
      setTogglingUserId(user.userId);
      const res: any = await apiClient.post('/api/admin/video-access/toggle', {
        userId: user.userId,
        hasVideoAccess: nextState,
      });

      if (res?.success) {
        toast.success(`Video access ${nextState ? 'ENABLED' : 'DISABLED'} for user ${user.userId}`);
        setUsers(prev => prev.map(u => u.userId === user.userId ? {
          ...u,
          hasVideoAccess: nextState,
          canWatchTogether: nextState,
          videoAccessGrantedByName: nextState ? (res.data?.videoAccessGrantedByName || 'Admin') : undefined,
          videoAccessGrantedAt: nextState ? new Date().toISOString() : undefined,
        } : u));
      } else {
        toast.error(res?.message || 'Failed to update video access');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating video permission');
    } finally {
      setTogglingUserId(null);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Video className="h-6 w-6 text-purple-400" />
            Video Access Permission Management
          </h1>
          <p className="text-sm text-slate-400">
            Strict user-wise Video & Music playback permission. Unauthorized users cannot view, search, or start room video.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="border-slate-800 hover:bg-slate-800 text-slate-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Info Callout */}
      <div className="bg-purple-950/20 border border-purple-800/40 rounded-xl p-4 flex items-start gap-3 text-xs text-purple-200">
        <ShieldCheck className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Strict Backend & Socket Enforcement:</span> Room Video Mode visibility and controls are restricted to accounts explicitly enabled below. Room Owner/Host status does NOT automatically grant video privileges. Revocation is instantaneous via Socket.IO events.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/60 border-slate-800/80">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by User ID, Name, Username, or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchUsers(); }}
              className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2"
            >
              <option value="all">All Users</option>
              <option value="enabled">Video Access Granted</option>
              <option value="disabled">Video Access Denied</option>
            </select>

            <Button onClick={fetchUsers} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-900/60 border-slate-800/80">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-950/60">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">User ID</TableHead>
                <TableHead className="text-slate-400">User Info</TableHead>
                <TableHead className="text-slate-400">Current Role</TableHead>
                <TableHead className="text-slate-400">Video Permission</TableHead>
                <TableHead className="text-slate-400">Granted By</TableHead>
                <TableHead className="text-slate-400">Timestamp</TableHead>
                <TableHead className="text-slate-400 text-right">Toggle Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-purple-400" />
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => {
                  const hasAccess = Boolean(u.hasVideoAccess || u.canWatchTogether);
                  return (
                    <TableRow key={u.userId} className="border-slate-800/60 hover:bg-slate-800/30">
                      <TableCell className="font-mono text-xs font-bold text-amber-400">
                        {u.userId}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white text-sm">{u.name || 'Yaro User'}</span>
                          <span className="text-xs text-slate-400">@{u.userName || u.userId}</span>
                          {u.email && <span className="text-[11px] text-slate-500">{u.email}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                          {u.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {hasAccess ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-800 text-slate-400 border border-slate-700">
                            <XCircle className="h-3 w-3 mr-1 text-slate-500" />
                            Disabled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {hasAccess ? (u.videoAccessGrantedByName || 'Admin') : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {hasAccess && u.videoAccessGrantedAt ? new Date(u.videoAccessGrantedAt).toLocaleString() : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant={hasAccess ? "destructive" : "default"}
                          size="sm"
                          disabled={togglingUserId === u.userId}
                          onClick={() => handleToggle(u)}
                          className={hasAccess ? "bg-red-600/80 hover:bg-red-600 text-xs" : "bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold"}
                        >
                          {togglingUserId === u.userId ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : hasAccess ? (
                            "Revoke Access"
                          ) : (
                            "Grant Video Access"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
