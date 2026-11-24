'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Crown, History, RefreshCw, ArrowLeft, ShieldCheck, MessageSquare, Radio
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface CleanupLog {
  _id: string;
  action: string;
  target: string;
  details: string;
  ipAddress: string;
  performedBy?: {
    _id: string;
    name: string;
    userId: number;
  } | null;
  metadata?: any;
  createdAt: string;
}

export default function CleanupHistoryPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<CleanupLog[]>([]);
  const [total, setTotal] = useState(0);

  const [typeFilter, setTypeFilter] = useState<'all' | 'chat' | 'room'>('all');
  const [page, setPage] = useState(1);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      params.append('page', String(page));
      params.append('limit', '25');

      const res: any = await apiClient.get(`/api/admin/owner/cleanup/history?${params.toString()}`);
      if (res?.success && res.data) {
        setLogs(res.data.logs || []);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load cleanup history');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Data Cleanup Audit Trail & History
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs">
                  Owner Exclusive
                </Badge>
              </h1>
              <p className="text-sm text-neutral-400">
                Audited timeline of all bulk and single Chat and Room cleanup operations performed by Platform Owners.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/owner/cleanup/chat">
            <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
              <MessageSquare className="w-4 h-4 mr-1 text-amber-400" /> Chat Cleanup
            </Button>
          </Link>
          <Link href="/owner/cleanup/room">
            <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
              <Radio className="w-4 h-4 mr-1 text-blue-400" /> Room Cleanup
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={fetchHistory}
            disabled={loading}
            className="border-neutral-700 hover:bg-neutral-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-neutral-950 p-1 rounded-lg border border-neutral-800 w-fit">
        {(['all', 'chat', 'room'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
              typeFilter === t ? 'bg-amber-600 text-white shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t === 'all' ? 'All Cleanup Actions' : t === 'chat' ? 'Chat Cleanup Only' : 'Room Cleanup Only'}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="bg-neutral-900/60 border-neutral-800">
        <CardHeader className="p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-white">Cleanup Audit Log Records</CardTitle>
            <CardDescription className="text-xs text-neutral-400">Total operations recorded: {total}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-950/60">
              <TableRow className="border-neutral-800">
                <TableHead className="text-neutral-400 text-xs">Action Type</TableHead>
                <TableHead className="text-neutral-400 text-xs">Scope / Target</TableHead>
                <TableHead className="text-neutral-400 text-xs">Details & Affected Records</TableHead>
                <TableHead className="text-neutral-400 text-xs">Performed By</TableHead>
                <TableHead className="text-neutral-400 text-xs">IP Address</TableHead>
                <TableHead className="text-neutral-400 text-xs text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-neutral-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-neutral-400" />
                    Loading audit trail...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-neutral-500">
                    No cleanup operations recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id} className="border-neutral-800 hover:bg-neutral-800/30">
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          log.action.includes('ROOM')
                            ? 'border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs'
                            : 'border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs'
                        }
                      >
                        {log.action}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono text-xs text-white">
                      {log.target}
                    </TableCell>

                    <TableCell className="text-xs text-neutral-300 max-w-md">
                      <div>{log.details}</div>
                      {log.metadata?.operationId && (
                        <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                          ID: {log.metadata.operationId}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs">
                      {log.performedBy ? (
                        <div>
                          <div className="text-white font-medium">{log.performedBy.name}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">UID: {log.performedBy.userId}</div>
                        </div>
                      ) : (
                        <span className="text-neutral-500">Platform Owner</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-neutral-400 font-mono">
                      {log.ipAddress || '127.0.0.1'}
                    </TableCell>

                    <TableCell className="text-xs text-neutral-400 text-right font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
