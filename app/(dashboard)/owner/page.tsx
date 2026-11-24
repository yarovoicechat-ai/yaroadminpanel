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
  Crown, Search, RefreshCw, ShieldCheck, ShieldAlert, UserCheck,
  Award, Briefcase, Video, Headphones, Coins, Globe, Users, ArrowRight, CheckCircle2
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface OwnerUser {
  userId: number;
  name?: string;
  userName?: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  coins?: number;
  diamonds?: number;
  isBanned?: boolean;
  createdAt: string;
}

const ROLES_LIST = [
  { value: 'owner', label: 'Owner (Full Platform Access)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { value: 'superAdmin', label: 'Super Admin', color: 'text-violet-400 bg-violet-500/10 border-violet-500/30' },
  { value: 'admin', label: 'Admin', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { value: 'countryManager', label: 'Country Manager', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { value: 'stateManager', label: 'State Manager', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  { value: 'bdLeader', label: 'BD Leader', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  { value: 'bd', label: 'BD (Business Developer)', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { value: 'agency', label: 'Agency', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  { value: 'operator', label: 'Operator', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  { value: 'host', label: 'Host (Broadcaster)', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  { value: 'customerSupport', label: 'Customer Support', color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  { value: 'coinSeller', label: 'Coin Seller / Merchant', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  { value: 'user', label: 'Regular App User', color: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
];

export default function OwnerConsolePage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<OwnerUser[]>([]);
  const [total, setTotal] = useState(0);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Change Role Modal
  const [targetUser, setTargetUser] = useState<OwnerUser | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState('admin');
  const [changeReason, setChangeReason] = useState('Updated via Owner Console');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (roleFilter !== 'all') params.append('role', roleFilter);
      params.append('page', String(page));
      params.append('limit', '25');

      const res: any = await apiClient.get(`/api/admin/owner/users?${params.toString()}`);
      if (res?.success && res.data) {
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load users for Owner Console');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenRoleModal = (user: OwnerUser) => {
    setTargetUser(user);
    setSelectedNewRole(user.role || 'user');
    setChangeReason(`Role update for user ${user.userId}`);
  };

  const handleExecuteRoleChange = async () => {
    if (!targetUser) return;
    try {
      setSubmitting(true);
      const res: any = await apiClient.post('/api/admin/owner/change-role', {
        userId: targetUser.userId,
        newRole: selectedNewRole,
        reason: changeReason,
      });

      if (res?.success) {
        toast.success(`User ${targetUser.userId} panel/role changed to ${selectedNewRole} successfully`);
        setTargetUser(null);
        fetchUsers();
      } else {
        toast.error(res?.message || 'Failed to change role');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error changing user role');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = (roleName: string) => {
    const found = ROLES_LIST.find(r => r.value.toLowerCase() === (roleName || '').toLowerCase());
    const label = found ? found.label.split(' ')[0] : roleName;
    const style = found ? found.color : 'text-slate-400 bg-slate-800 border-slate-700';
    return (
      <Badge className={`border font-semibold text-xs px-2 py-0.5 ${style}`}>
        {roleName === 'owner' ? <Crown className="h-3 w-3 mr-1 inline" /> : null}
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-400" />
            Owner Console — Staff & Panel Access Changer
          </h1>
          <p className="text-sm text-slate-400">
            Platform Owner control center to switch and reassign any user or staff member to any administration panel.
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

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/60 border-slate-800/80">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by User ID, Name, Username, Phone, or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchUsers(); }}
              className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={roleFilter}
              onChange={(e: any) => setRoleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2"
            >
              <option value="all">All Roles & Panels</option>
              {ROLES_LIST.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <Button onClick={fetchUsers} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
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
                <TableHead className="text-slate-400">User Details</TableHead>
                <TableHead className="text-slate-400">Current Role / Panel</TableHead>
                <TableHead className="text-slate-400">Contact</TableHead>
                <TableHead className="text-slate-400">Joined</TableHead>
                <TableHead className="text-slate-400 text-right">Owner Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-400" />
                    Loading accounts...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                    No accounts found matching your search.
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
                        {getRoleBadge(u.role)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {u.phoneNumber || u.email || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleOpenRoleModal(u)}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold"
                        >
                          Change Role / Panel
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

      {/* Role Change Modal */}
      {targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-lg border-b border-slate-800 pb-3">
              <Crown className="h-5 w-5" />
              Change Panel / Reassign Role
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
              <div><span className="text-slate-400">Account:</span> <span className="font-bold text-white">{targetUser.name} (ID: {targetUser.userId})</span></div>
              <div><span className="text-slate-400">Current Role:</span> <span className="text-amber-400 font-semibold">{targetUser.role}</span></div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select New Role / Panel:</label>
              <select
                value={selectedNewRole}
                onChange={(e) => setSelectedNewRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg p-2.5 text-sm"
              >
                {ROLES_LIST.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-400">Admin Note / Reason:</label>
              <Input
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setTargetUser(null)} className="text-slate-400">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteRoleChange}
                disabled={submitting}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                {submitting ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : null}
                Confirm Change
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
