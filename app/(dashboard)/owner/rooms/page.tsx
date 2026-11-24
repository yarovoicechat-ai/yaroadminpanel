'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  Crown, Search, RefreshCw, Hash, Plus, Key, Eye,
  CheckCircle2, XCircle, Sparkles, AlertCircle
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface RoomMeta {
  _id: string;
  channelName: string;
  legacyId?: string | null;
  isCustomId: boolean;
  title: string;
  owner?: {
    _id: string;
    userId: number;
    name: string;
  } | null;
  category?: string;
  seatCount: number;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
}

export default function RoomIdManagementPage() {
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<RoomMeta[]>([]);
  const [total, setTotal] = useState(0);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'custom' | 'auto'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [page, setPage] = useState(1);

  // Details Modal
  const [selectedRoom, setSelectedRoom] = useState<RoomMeta | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', String(page));
      params.append('limit', '20');

      const res: any = await apiClient.get(`/api/admin/owner/rooms?${params.toString()}`);
      if (res?.success && res.data) {
        setRooms(res.data.rooms || []);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, page]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Room ID Management (9-Digit Series)
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs">
                  Owner Exclusive
                </Badge>
              </h1>
              <p className="text-sm text-neutral-400">
                Track sequential 9-digit Room IDs starting from 100000000, audit custom room allocations, and verify legacy mappings.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/owner/rooms/custom">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2">
              <Key className="w-4 h-4" />
              Assign Custom Room ID
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={fetchRooms}
            disabled={loading}
            className="border-neutral-700 hover:bg-neutral-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
              <Hash className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-neutral-400">Starting Room ID</div>
              <div className="text-xl font-bold text-white font-mono">100000000</div>
              <div className="text-[11px] text-neutral-500">Atomic 9-Digit Sequence</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-400">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-neutral-400">Custom Assigned IDs</div>
              <div className="text-xl font-bold text-amber-300">Supported & Audited</div>
              <div className="text-[11px] text-neutral-500">Skipped during auto-sequence</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-neutral-400">Legacy Compatibility</div>
              <div className="text-xl font-bold text-emerald-300">100% Preserved</div>
              <div className="text-[11px] text-neutral-500">Old Room IDs resolve via legacyId</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="bg-neutral-900/60 border-neutral-800">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <Input
              placeholder="Search by 9-digit Room ID, Legacy ID, or Title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-neutral-950 border-neutral-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              {(['all', 'custom', 'auto'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1 text-xs rounded-md ${
                    typeFilter === t ? 'bg-amber-600 text-white font-medium' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {t === 'all' ? 'All IDs' : t === 'custom' ? 'Custom IDs' : 'Auto Generated'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              {(['all', 'active', 'archived'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 text-xs rounded-md ${
                    statusFilter === s ? 'bg-blue-600 text-white font-medium' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {s === 'all' ? 'All Status' : s === 'active' ? 'Active' : 'Archived'}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-neutral-900/60 border-neutral-800">
        <CardHeader className="p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">Registered Room Series</CardTitle>
              <CardDescription className="text-xs text-neutral-400">Total rooms found: {total}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-950/60">
              <TableRow className="border-neutral-800">
                <TableHead className="text-neutral-400 text-xs">9-Digit Room ID</TableHead>
                <TableHead className="text-neutral-400 text-xs">Allocation Type</TableHead>
                <TableHead className="text-neutral-400 text-xs">Room Title</TableHead>
                <TableHead className="text-neutral-400 text-xs">Owner</TableHead>
                <TableHead className="text-neutral-400 text-xs">Seats / Category</TableHead>
                <TableHead className="text-neutral-400 text-xs">Status</TableHead>
                <TableHead className="text-neutral-400 text-xs">Legacy ID</TableHead>
                <TableHead className="text-neutral-400 text-xs text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-neutral-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-neutral-400" />
                    Loading rooms...
                  </TableCell>
                </TableRow>
              ) : rooms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-neutral-500">
                    No rooms found matching filters.
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((r) => (
                  <TableRow key={r._id} className="border-neutral-800 hover:bg-neutral-800/30">
                    <TableCell>
                      <div className="font-mono text-sm font-bold text-amber-400 bg-neutral-950 px-2 py-1 rounded w-fit border border-neutral-800">
                        {r.channelName}
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        {r.channelName.length === 9 ? 'Valid 9-Digit ID' : `${r.channelName.length} Digits (Legacy)`}
                      </span>
                    </TableCell>

                    <TableCell>
                      {r.isCustomId ? (
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs flex items-center gap-1 w-fit">
                          <Sparkles className="w-3 h-3" /> Custom ID
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 text-xs w-fit">
                          Sequential Auto
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-white text-sm">{r.title}</div>
                      <div className="text-[11px] text-neutral-500">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </TableCell>

                    <TableCell>
                      {r.owner ? (
                        <div>
                          <div className="text-xs text-neutral-200">{r.owner.name}</div>
                          <div className="text-[11px] text-neutral-400 font-mono">UID: {r.owner.userId}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-500">Platform Admin</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-neutral-300">
                      <div>{r.seatCount || 8} Mics</div>
                      <div className="text-[11px] text-neutral-500">{r.category || 'General'}</div>
                    </TableCell>

                    <TableCell>
                      {r.isArchived ? (
                        <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-xs">
                          Archived
                        </Badge>
                      ) : r.isActive ? (
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-neutral-400 font-mono">
                      {r.legacyId || '—'}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedRoom(r)}
                        className="h-8 border-neutral-700 hover:bg-neutral-800 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* DETAILS MODAL */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="bg-neutral-900 border-neutral-800 w-full max-w-lg shadow-2xl">
            <CardHeader className="border-b border-neutral-800">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Hash className="w-5 h-5 text-amber-400" />
                Room Details: {selectedRoom.channelName}
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Detailed metadata for this registered room.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-500 block mb-1">Room Title</span>
                  <span className="text-white font-medium text-sm">{selectedRoom.title}</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-500 block mb-1">Allocation Type</span>
                  <span className="text-amber-400 font-medium text-sm">
                    {selectedRoom.isCustomId ? 'Custom Assigned' : 'Sequential 9-Digit Auto'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-500 block mb-1">Owner Name / ID</span>
                  <span className="text-neutral-300 font-medium">
                    {selectedRoom.owner ? `${selectedRoom.owner.name} (UID: ${selectedRoom.owner.userId})` : 'System'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-500 block mb-1">Legacy ID Mapping</span>
                  <span className="text-neutral-300 font-mono">{selectedRoom.legacyId || 'None (Native 9-Digit)'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-neutral-800">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRoom(null)}
                  className="border-neutral-700"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
