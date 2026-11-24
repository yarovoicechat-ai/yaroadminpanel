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
  History, Search, RefreshCw, ShieldAlert, ArrowLeft,
  Calendar, Clock, User, Smartphone
} from "lucide-react";
import Link from 'next/link';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface BanHistoryRecord {
  _id: string;
  targetType: 'USER' | 'DEVICE';
  targetId: string;
  action: string;
  banType?: string;
  duration?: string;
  reason?: string;
  adminNote?: string;
  adminName?: string;
  bannedAt?: string;
  bannedUntil?: string;
  createdAt: string;
}

export default function BanHistoryPage() {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<BanHistoryRecord[]>([]);
  const [total, setTotal] = useState(0);

  // Filters
  const [targetIdQuery, setTargetIdQuery] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState<'ALL' | 'USER' | 'DEVICE'>('ALL');
  const [page, setPage] = useState(1);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (targetIdQuery.trim()) params.append('targetId', targetIdQuery.trim());
      if (targetTypeFilter !== 'ALL') params.append('targetType', targetTypeFilter);
      params.append('page', String(page));
      params.append('limit', '25');

      const res: any = await apiClient.get(`/api/admin/bans/history?${params.toString()}`);
      if (res?.success && res.data) {
        setRecords(res.data.history || []);
        setTotal(res.data.total || 0);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch ban history');
    } finally {
      setLoading(false);
    }
  }, [targetIdQuery, targetTypeFilter, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'PERMANENT_BAN':
        return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 font-bold">PERMANENT BAN</Badge>;
      case 'TEMPORARY_BAN':
      case 'BAN':
        return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">TEMPORARY BAN</Badge>;
      case 'UNBAN':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">UNBAN RESTORED</Badge>;
      case 'AUTO_EXPIRE':
        return <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">AUTO EXPIRED</Badge>;
      default:
        return <Badge className="bg-slate-800 text-slate-400 border border-slate-700">{action}</Badge>;
    }
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
            <History className="h-6 w-6 text-indigo-400" />
            Security & Ban Audit Trail
          </h1>
          <p className="text-sm text-slate-400">
            Immutable server-side audit logs of every User ID and Device ban, unban, and auto-expiration action.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHistory}
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
              placeholder="Filter by User ID or Device ID..."
              value={targetIdQuery}
              onChange={(e) => setTargetIdQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchHistory(); }}
              className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={targetTypeFilter}
              onChange={(e: any) => setTargetTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2"
            >
              <option value="ALL">All Targets (User & Device)</option>
              <option value="USER">User IDs Only</option>
              <option value="DEVICE">Device IDs Only</option>
            </select>

            <Button onClick={fetchHistory} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              Filter Logs
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
                <TableHead className="text-slate-400">Target Type</TableHead>
                <TableHead className="text-slate-400">Target Identifier</TableHead>
                <TableHead className="text-slate-400">Action Executed</TableHead>
                <TableHead className="text-slate-400">Duration</TableHead>
                <TableHead className="text-slate-400">Reason / Notes</TableHead>
                <TableHead className="text-slate-400">Executed By</TableHead>
                <TableHead className="text-slate-400 text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    Loading audit trail...
                  </TableCell>
                </TableRow>
              ) : records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                    No ban audit records found.
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r) => {
                  return (
                    <TableRow key={r._id} className="border-slate-800/60 hover:bg-slate-800/30">
                      <TableCell>
                        {r.targetType === 'USER' ? (
                          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <User className="h-3 w-3 mr-1" /> USER ID
                          </Badge>
                        ) : (
                          <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Smartphone className="h-3 w-3 mr-1" /> DEVICE ID
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-200">
                        {r.targetId}
                      </TableCell>
                      <TableCell>
                        {getActionBadge(r.action)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {r.duration || '—'}
                      </TableCell>
                      <TableCell className="max-w-[250px] text-xs text-slate-300">
                        <span className="font-medium text-white">{r.reason || 'Policy Enforcement'}</span>
                        {r.adminNote ? (
                          <span className="block text-[11px] text-slate-400 italic">Note: {r.adminNote}</span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {r.adminName || 'System'}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-400 font-mono">
                        {new Date(r.createdAt).toLocaleString()}
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
