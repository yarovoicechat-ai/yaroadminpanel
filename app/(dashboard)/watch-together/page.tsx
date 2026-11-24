'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { getAdminAvatar } from '@/lib/avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Crown, Search, Video, CheckCircle, XCircle, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';

interface WatchUser {
  _id: string;
  userId: number | string;
  meethiId?: string;
  name: string;
  avatar?: string;
  image?: string;
  vipLevel?: number;
  svipLevel?: number;
  role?: string;
  canWatchTogether?: boolean;
  hasVideoAccess?: boolean;
  videoAccessGrantedBy?: string;
  videoAccessGrantedByName?: string;
  videoAccessGrantedAt?: string;
}

export default function WatchTogetherPage() {
  const { user } = useAuth();
  const roleLower = String(user?.role || '').toLowerCase();
  const isAuthorized = roleLower === 'owner' || roleLower === 'superadmin' || roleLower === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<WatchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchUsers = useCallback(async (query: string = '') => {
    setLoading(true);
    try {
      const endpoint = query
        ? `/api/admin/watch-together/users?q=${encodeURIComponent(query)}`
        : '/api/admin/watch-together/users';
      const res: any = await apiClient.get(endpoint);
      if (res?.success && Array.isArray(res.data)) {
        setUsers(res.data);
      } else if (Array.isArray(res)) {
        setUsers(res);
      } else {
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch watch together users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
    }
  }, [isAuthorized, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery.trim());
  };

  const handleToggle = async (targetUser: WatchUser) => {
    const targetUid = String(targetUser.userId || targetUser._id);
    const nextState = !(targetUser.hasVideoAccess || targetUser.canWatchTogether);
    setTogglingId(targetUid);
    setStatusMessage(null);

    try {
      const res: any = await apiClient.post('/api/admin/watch-together/toggle', {
        userId: targetUid,
        hasVideoAccess: nextState,
        canWatchTogether: nextState,
        videoAccess: nextState,
      });

      if (res?.success) {
        setUsers((prev) =>
          prev.map((u) =>
            String(u.userId) === targetUid || String(u._id) === targetUid
              ? {
                  ...u,
                  hasVideoAccess: nextState,
                  canWatchTogether: nextState,
                  videoAccessGrantedByName: nextState ? (user?.name || (user as any)?.userId || (user as any)?.id || 'Admin') : undefined,
                  videoAccessGrantedAt: nextState ? new Date().toISOString() : undefined,
                }
              : u
          )
        );
        setStatusMessage(`Video Access ${nextState ? 'Turned ON for' : 'Turned OFF for'} ${targetUser.name || targetUid}`);
      } else {
        setStatusMessage(res?.message || 'Failed to update access');
      }
    } catch (err: any) {
      setStatusMessage(err?.response?.data?.message || err?.message || 'Failed to update access');
    } finally {
      setTogglingId(null);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Access Denied: Admin Exclusive</h1>
        <p className="text-slate-400 max-w-md">
          This panel is restricted to authorized administrators. You do not have permission to view or manage Video Access privileges.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Video className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              User Video Access Control
              <Crown className="w-5 h-5 text-amber-400" />
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            User-wise Video Access permission management. Only users with Video Access turned ON here can see the Video option in Room Mode and initiate/control playback.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search user by Name, User ID, or Meethi ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Search
            </Button>
            {searchQuery && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  fetchUsers('');
                }}
                className="border-slate-800 text-slate-300 hover:bg-slate-800"
              >
                Clear
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <span>Users & Access Control</span>
            <Badge variant="outline" className="border-indigo-500/30 text-indigo-400">
              {users.length} Found
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="text-slate-400">User</TableHead>
                  <TableHead className="text-slate-400">ID / Meethi ID</TableHead>
                  <TableHead className="text-slate-400">VIP / SVIP</TableHead>
                  <TableHead className="text-slate-400">Role</TableHead>
                  <TableHead className="text-slate-400">Video Access Status</TableHead>
                  <TableHead className="text-right text-slate-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                      No users found. Use the search bar above to look up any user by name or ID.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((target) => {
                    const isGranted = Boolean(target.hasVideoAccess || target.canWatchTogether);
                    const isToggling = togglingId === String(target.userId || target._id);

                    return (
                      <TableRow key={target._id || target.userId} className="border-slate-800 hover:bg-slate-800/40">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={getAdminAvatar(target.avatar || target.image)}
                              alt={target.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-700 bg-slate-800"
                            />
                            <div>
                              <div className="font-semibold text-white">{target.name || 'Unnamed'}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-mono text-slate-300">{target.userId}</div>
                          {target.meethiId && target.meethiId !== String(target.userId) && (
                            <div className="text-xs text-slate-500 font-mono">Meethi: {target.meethiId}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {Number(target.vipLevel || 0) > 0 && (
                              <Badge className="bg-slate-800 text-slate-300">
                                VIP {target.vipLevel}
                              </Badge>
                            )}
                            {Number(target.svipLevel || 0) > 0 && (
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                SVIP {target.svipLevel}
                              </Badge>
                            )}
                            {!target.vipLevel && !target.svipLevel && (
                              <span className="text-xs text-slate-500">Regular</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-slate-700 text-slate-400 capitalize">
                            {target.role || 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {isGranted ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <span>Enabled (ON)</span>
                              </div>
                              {(target.videoAccessGrantedByName || target.videoAccessGrantedAt) && (
                                <div className="text-[11px] text-slate-400">
                                  {target.videoAccessGrantedByName && `By: ${target.videoAccessGrantedByName}`}
                                  {target.videoAccessGrantedAt && ` • ${new Date(target.videoAccessGrantedAt).toLocaleString()}`}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                              <XCircle className="w-4 h-4 text-slate-500" />
                              <span>Disabled (OFF)</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            disabled={isToggling}
                            onClick={() => handleToggle(target)}
                            className={
                              isGranted
                                ? 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }
                          >
                            {isToggling ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                            ) : null}
                            {isGranted ? 'Turn OFF' : 'Turn ON'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
