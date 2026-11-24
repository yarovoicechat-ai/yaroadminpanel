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
  Swords, Search, RefreshCw, Trophy, Users, AlertCircle, Clock,
  CheckCircle2, XCircle, Flame, Gift, Check, ShieldAlert, Eye, X
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface RoomPKSession {
  _id: string;
  roomIds: string[];
  status: 'invited' | 'active' | 'finished' | 'declined' | 'cancelled' | 'expired';
  pkMode: 'vote' | 'personal' | 'team' | 'room';
  durationSeconds: number;
  scores: number[];
  votes?: number[];
  participantA?: any;
  participantB?: any;
  teamA?: any[];
  teamB?: any[];
  winnerSide?: number | null;
  winnerRoomId?: string | null;
  draw?: boolean;
  startedAt?: string;
  endsAt?: string;
  finishedAt?: string;
  createdAt: string;
  selectedGift?: any;
  jackpotEnabled?: boolean;
}

export default function RoomPKManagementPage() {
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);
  const [sessions, setSessions] = useState<RoomPKSession[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'vote' | 'personal' | 'team'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [page, setPage] = useState(1);

  // Detail Modal
  const [selectedSession, setSelectedSession] = useState<RoomPKSession | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res: any = await apiClient.get('/api/admin/room-pk/dashboard');
      if (res?.success) {
        setDashboard(res.data);
      }
    } catch (_) {}
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (modeFilter !== 'all') params.append('pkMode', modeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', String(page));
      params.append('limit', '20');

      const res: any = await apiClient.get(`/api/admin/room-pk/sessions?${params.toString()}`);
      if (res?.success && res.data) {
        setSessions(res.data.sessions || []);
        setTotalSessions(res.data.total || 0);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load Room PK sessions');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, modeFilter, statusFilter, page]);

  useEffect(() => {
    fetchDashboard();
    fetchSessions();
  }, [fetchDashboard, fetchSessions]);

  const handleCancelSession = async (session: RoomPKSession) => {
    if (!confirm(`Are you sure you want to force cancel this PK session (${session._id})?`)) return;

    try {
      setCancellingId(session._id);
      const res: any = await apiClient.post(`/api/admin/room-pk/sessions/${session._id}/cancel`, {
        reason: 'Force cancelled by Administrator via Admin Panel',
      });

      if (res?.success) {
        toast.success('Room PK session cancelled successfully');
        fetchSessions();
        fetchDashboard();
        if (selectedSession?._id === session._id) {
          setSelectedSession(null);
        }
      } else {
        toast.error(res?.message || 'Failed to cancel session');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error cancelling session');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">⚔️ Live Battle</Badge>;
      case 'finished':
      case 'completed':
        return <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">🏆 Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20">❌ Cancelled</Badge>;
      case 'declined':
        return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">Declined</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-400 border border-slate-500/20">{status}</Badge>;
    }
  };

  const getModeBadge = (mode: string) => {
    switch (mode) {
      case 'vote':
        return <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20">🗳️ Vote PK</Badge>;
      case 'personal':
        return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">👤 Personal Gift PK</Badge>;
      case 'team':
        return <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">👥 Team Gift PK</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-400 border border-slate-500/20">{mode}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Swords className="h-6 w-6 text-amber-400" />
            Room PK Management
          </h1>
          <p className="text-sm text-slate-400">
            Monitor, inspect, and manage voice room battles (Vote PK, Personal Gift PK, and Team Gift PK)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { fetchDashboard(); fetchSessions(); }}
            disabled={loading}
            className="border-slate-800 hover:bg-slate-800 text-slate-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800/80">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-400">Active Live Battles</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-400">
              {dashboard?.activePKs ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-emerald-500/80">Currently in progress across rooms</span>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-400">Completed Battles</CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-400">
              {dashboard?.finishedPKs ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-blue-500/80">Successfully completed</span>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-400">Mode Distribution</CardDescription>
            <CardTitle className="text-sm font-semibold text-white flex gap-2">
              <span className="text-purple-400">{dashboard?.modes?.vote ?? 0} Vote</span> •
              <span className="text-amber-400">{dashboard?.modes?.personal ?? 0} Personal</span> •
              <span className="text-indigo-400">{dashboard?.modes?.team ?? 0} Team</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-slate-400">All-time battle mode breakdown</span>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/80">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs text-slate-400">Total Recorded PKs</CardDescription>
            <CardTitle className="text-2xl font-bold text-white">
              {dashboard?.totalPKs ?? 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-slate-400">Lifetime room battle sessions</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900/60 border-slate-800/80">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by Room ID, PK ID, or participant name/ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchSessions(); }}
              className="pl-9 bg-slate-950 border-slate-800 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Mode Filter */}
            <select
              value={modeFilter}
              onChange={(e: any) => setModeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2"
            >
              <option value="all">All Modes</option>
              <option value="vote">Vote PK</option>
              <option value="personal">Personal Gift PK</option>
              <option value="team">Team Gift PK</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded-lg px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Live Battles</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled / Declined</option>
            </select>

            <Button onClick={() => fetchSessions()} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PK Sessions Table */}
      <Card className="bg-slate-900/60 border-slate-800/80">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-950/60">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Battle ID / Mode</TableHead>
                <TableHead className="text-slate-400">Room(s)</TableHead>
                <TableHead className="text-slate-400">Sides / Participants</TableHead>
                <TableHead className="text-slate-400">Scores / Votes</TableHead>
                <TableHead className="text-slate-400">Duration</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-amber-400" />
                    Loading Room PK sessions...
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                    No Room PK sessions found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => {
                  const isLive = session.status === 'active';
                  const scoreA = session.scores?.[0] ?? 0;
                  const scoreB = session.scores?.[1] ?? 0;
                  const voteA = session.votes?.[0] ?? 0;
                  const voteB = session.votes?.[1] ?? 0;

                  return (
                    <TableRow key={session._id} className="border-slate-800/60 hover:bg-slate-800/30">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-slate-300">
                            {session._id.slice(-8)}
                          </span>
                          <div className="mt-1">{getModeBadge(session.pkMode)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs text-slate-300">
                          <span>Room: {session.roomIds?.[0] || 'N/A'}</span>
                          {session.roomIds?.[1] && (
                            <span className="text-slate-500">vs Room: {session.roomIds[1]}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {session.pkMode === 'personal' ? (
                          <div className="text-xs">
                            <span className="text-amber-400 font-semibold">{session.participantA?.name || 'Player 1'}</span>
                            <span className="text-slate-500 mx-1">vs</span>
                            <span className="text-blue-400 font-semibold">{session.participantB?.name || 'Player 2'}</span>
                          </div>
                        ) : session.pkMode === 'team' ? (
                          <div className="text-xs">
                            <span className="text-amber-400 font-semibold">Team Yellow ({(session.teamA || []).length})</span>
                            <span className="text-slate-500 mx-1">vs</span>
                            <span className="text-blue-400 font-semibold">Team Blue ({(session.teamB || []).length})</span>
                          </div>
                        ) : (
                          <div className="text-xs text-purple-400 font-semibold">
                            Red vs Blue (Vote)
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {session.pkMode === 'vote' ? (
                          <div className="font-mono text-xs">
                            <span className="text-red-400 font-bold">{voteA}</span>
                            <span className="text-slate-600 mx-1.5">:</span>
                            <span className="text-blue-400 font-bold">{voteB}</span>
                            <span className="text-slate-500 text-[10px] ml-1">votes</span>
                          </div>
                        ) : (
                          <div className="font-mono text-xs">
                            <span className="text-amber-400 font-bold">{Number(scoreA).toLocaleString()}</span>
                            <span className="text-slate-600 mx-1.5">:</span>
                            <span className="text-blue-400 font-bold">{Number(scoreB).toLocaleString()}</span>
                            <span className="text-slate-500 text-[10px] ml-1">pts</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {Math.round(session.durationSeconds / 60)} min
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(session.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSession(session)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
                            title="Inspect PK Session Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isLive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelSession(session)}
                              disabled={cancellingId === session._id}
                              className="h-8 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40"
                              title="Force Cancel Live PK Battle"
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* PK Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Swords className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">PK Battle Details</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSession(null)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Battle ID:</span>
                <p className="font-mono text-slate-200">{selectedSession._id}</p>
              </div>
              <div>
                <span className="text-slate-400">Mode:</span>
                <p className="font-semibold text-white">{selectedSession.pkMode.toUpperCase()}</p>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <p>{getStatusBadge(selectedSession.status)}</p>
              </div>
              <div>
                <span className="text-slate-400">Duration:</span>
                <p className="text-slate-200">{Math.round(selectedSession.durationSeconds / 60)} minutes ({selectedSession.durationSeconds}s)</p>
              </div>
              <div>
                <span className="text-slate-400">Created:</span>
                <p className="text-slate-200">{new Date(selectedSession.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-400">Finished:</span>
                <p className="text-slate-200">{selectedSession.finishedAt ? new Date(selectedSession.finishedAt).toLocaleString() : 'In Progress / Not Finished'}</p>
              </div>
            </div>

            {/* Score / Results Card */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-around items-center text-center">
              <div>
                <span className="text-xs text-amber-400 font-bold block">SIDE A</span>
                <span className="text-xl font-mono font-extrabold text-white">
                  {selectedSession.pkMode === 'vote' ? (selectedSession.votes?.[0] ?? 0) : Number(selectedSession.scores?.[0] ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="text-slate-600 font-bold text-lg">VS</div>
              <div>
                <span className="text-xs text-blue-400 font-bold block">SIDE B</span>
                <span className="text-xl font-mono font-extrabold text-white">
                  {selectedSession.pkMode === 'vote' ? (selectedSession.votes?.[1] ?? 0) : Number(selectedSession.scores?.[1] ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            {selectedSession.status === 'active' && (
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => handleCancelSession(selectedSession)}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  Force Cancel PK Battle
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
