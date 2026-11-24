'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Crown, Radio, Trash2, AlertTriangle, ShieldCheck,
  Search, RefreshCw, CheckCircle2, XCircle, Swords, Video, Users
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function RoomCleanupPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'single'>('all');

  // Preview States
  const [loadingGlobalPreview, setLoadingGlobalPreview] = useState(false);
  const [globalPreview, setGlobalPreview] = useState<{
    totalActiveRooms: number;
    onlineRoomsCount: number;
    offlineRoomsCount: number;
    activePkRoomsCount: number;
    activeWatchRoomsCount: number;
  } | null>(null);

  // Clean All Form States
  const [confirmText, setConfirmText] = useState('');
  const [secondConfirmed, setSecondConfirmed] = useState(false);
  const [executingAll, setExecutingAll] = useState(false);
  const [postCleanupReport, setPostCleanupReport] = useState<any>(null);

  // Single Room Form States
  const [searchRoomId, setSearchRoomId] = useState('');
  const [searchingRoom, setSearchingRoom] = useState(false);
  const [singleRoomPreview, setSingleRoomPreview] = useState<any>(null);
  const [singleConfirmChecked, setSingleConfirmChecked] = useState(false);
  const [executingSingle, setExecutingSingle] = useState(false);

  const fetchGlobalPreview = async () => {
    try {
      setLoadingGlobalPreview(true);
      const res: any = await apiClient.get('/api/admin/owner/cleanup/room/preview?mode=all');
      if (res?.success && res.data) {
        setGlobalPreview(res.data.preview);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch global room preview');
    } finally {
      setLoadingGlobalPreview(false);
    }
  };

  useEffect(() => {
    fetchGlobalPreview();
  }, []);

  const handleSearchSingleRoom = async () => {
    if (!searchRoomId.trim()) {
      toast.error('Enter a 9-digit Room ID or Legacy ID to search');
      return;
    }
    try {
      setSearchingRoom(true);
      setSingleRoomPreview(null);
      const res: any = await apiClient.get(`/api/admin/owner/cleanup/room/preview?mode=single&roomId=${searchRoomId.trim()}`);
      if (res?.success && res.data) {
        setSingleRoomPreview(res.data);
      } else {
        toast.error(res?.message || 'Room not found');
      }
    } catch (err: any) {
      toast.error(err.message || 'Room not found');
    } finally {
      setSearchingRoom(false);
    }
  };

  const handleExecuteAll = async () => {
    if (confirmText.trim() !== 'CONFIRM_CLEAN_ALL_ROOMS') {
      toast.error('Type exactly "CONFIRM_CLEAN_ALL_ROOMS" to confirm.');
      return;
    }
    if (!secondConfirmed) {
      toast.error('Please check the secondary confirmation checkbox.');
      return;
    }

    try {
      setExecutingAll(true);
      setPostCleanupReport(null);
      const res: any = await apiClient.post('/api/admin/owner/cleanup/room/execute', {
        mode: 'all',
        confirmationToken: 'CONFIRM_CLEAN_ALL_ROOMS',
        secondConfirmation: true,
      });

      if (res?.success) {
        toast.success(res.message || 'Clean All Rooms completed successfully!');
        setPostCleanupReport(res.data);
        setConfirmText('');
        setSecondConfirmed(false);
        fetchGlobalPreview();
      } else {
        toast.error(res?.message || 'Failed to execute room cleanup');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error executing room cleanup');
    } finally {
      setExecutingAll(false);
    }
  };

  const handleExecuteSingle = async () => {
    if (!singleRoomPreview?.targetRoom?.channelName) return;
    if (!singleConfirmChecked) {
      toast.error('Please check the confirmation box.');
      return;
    }

    try {
      setExecutingSingle(true);
      const res: any = await apiClient.post('/api/admin/owner/cleanup/room/execute', {
        mode: 'single',
        roomId: singleRoomPreview.targetRoom.channelName,
      });

      if (res?.success) {
        toast.success(res.message || 'Room cleaned and archived successfully!');
        setSingleConfirmChecked(false);
        handleSearchSingleRoom();
        fetchGlobalPreview();
      } else {
        toast.error(res?.message || 'Failed to clean room');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error executing single room cleanup');
    } finally {
      setExecutingSingle(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Room & Active Session Cleanup
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs">
                  Owner Exclusive
                </Badge>
              </h1>
              <p className="text-sm text-neutral-400">
                Safely end active room sessions, disconnect occupants, and clear operational state. Historical PK records and gift transactions remain 100% intact.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={fetchGlobalPreview}
          disabled={loadingGlobalPreview}
          className="border-neutral-700 hover:bg-neutral-800"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loadingGlobalPreview ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" />
        <div>
          <span className="font-semibold text-emerald-200">Historical Data Preservation:</span> Room cleanup archives operational active state and safely terminates live sessions. It never deletes room documents from the database, never alters user accounts or User IDs, and preserves all historical Room PK results and gift transactions.
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          Operation A: Clean All Active Rooms
        </button>
        <button
          onClick={() => setActiveTab('single')}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
            activeTab === 'single'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          Operation B: Clean One Room
        </button>
      </div>

      {/* TAB A: CLEAN ALL */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Stats Preview Card */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="bg-neutral-900/60 border-neutral-800">
              <CardContent className="p-4">
                <div className="text-xs text-neutral-400">Total Active Rooms</div>
                <div className="text-2xl font-bold text-white font-mono mt-1">
                  {globalPreview?.totalActiveRooms ?? '—'}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Listed in app</div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/60 border-neutral-800">
              <CardContent className="p-4">
                <div className="text-xs text-neutral-400">Online Occupied</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                  {globalPreview?.onlineRoomsCount ?? '—'}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">With active presence</div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/60 border-neutral-800">
              <CardContent className="p-4">
                <div className="text-xs text-neutral-400">Offline Rooms</div>
                <div className="text-2xl font-bold text-neutral-400 font-mono mt-1">
                  {globalPreview?.offlineRoomsCount ?? '—'}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Inactive / idle</div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/60 border-neutral-800">
              <CardContent className="p-4">
                <div className="text-xs text-neutral-400">Active PK Battles</div>
                <div className="text-2xl font-bold text-purple-400 font-mono mt-1 flex items-center gap-1.5">
                  <Swords className="w-4 h-4" />
                  {globalPreview?.activePkRoomsCount ?? '—'}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Ongoing PK sessions</div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/60 border-neutral-800">
              <CardContent className="p-4">
                <div className="text-xs text-neutral-400">Active Video Sessions</div>
                <div className="text-2xl font-bold text-blue-400 font-mono mt-1 flex items-center gap-1.5">
                  <Video className="w-4 h-4" />
                  {globalPreview?.activeWatchRoomsCount ?? '—'}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Watch Together active</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Card */}
          <Card className="bg-neutral-900/60 border-neutral-800">
            <CardHeader className="border-b border-neutral-800">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-amber-400" />
                Execute Global Room Cleanup
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Ends all active voice room sessions safely, cancels pending/active PKs, flushes Redis caches, and marks rooms archived in database.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Confirmations */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div>
                  <label className="text-xs text-neutral-300 font-medium block mb-1">
                    Primary Confirmation: Type{' '}
                    <span className="text-amber-400 font-mono font-bold">CONFIRM_CLEAN_ALL_ROOMS</span>
                  </label>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type CONFIRM_CLEAN_ALL_ROOMS"
                    className="font-mono bg-neutral-900 border-neutral-700 text-white"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="double-confirm-room"
                    checked={secondConfirmed}
                    onChange={(e) => setSecondConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="double-confirm-room" className="text-xs text-neutral-300 leading-relaxed cursor-pointer">
                    <span className="font-semibold text-white">Secondary Explicit Confirmation:</span> I confirm that all {globalPreview?.totalActiveRooms || 'active'} active voice rooms will have their sessions ended safely, occupants disconnected gracefully, and active room listings cleared.
                  </label>
                </div>
              </div>

              {postCleanupReport && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Cleanup Successfully Completed
                  </div>
                  <div>Archived Rooms Count: <span className="font-mono font-bold text-white">{postCleanupReport.archivedRoomsCount}</span></div>
                  <div>Remaining Active Rooms: <span className="font-mono font-bold text-emerald-400">{postCleanupReport.remainingActiveRooms} (Clean Verified)</span></div>
                  <div>Operation Tracking ID: <span className="font-mono text-neutral-400">{postCleanupReport.operationId}</span></div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleExecuteAll}
                  disabled={
                    executingAll ||
                    confirmText.trim() !== 'CONFIRM_CLEAN_ALL_ROOMS' ||
                    !secondConfirmed
                  }
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6"
                >
                  {executingAll ? 'Ending Sessions & Cleaning...' : 'Execute Clean All Rooms'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB B: CLEAN ONE ROOM */}
      {activeTab === 'single' && (
        <div className="space-y-6">
          <Card className="bg-neutral-900/60 border-neutral-800">
            <CardHeader className="border-b border-neutral-800">
              <CardTitle className="text-base text-white">Target Single Room Cleanup</CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Search an exact 9-digit Room ID or legacy Room ID to preview its members, MIC seats, and active PK/video sessions before safe cleanup.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <Input
                    placeholder="Enter 9-digit Room ID (e.g. 100000001) or Legacy ID..."
                    value={searchRoomId}
                    onChange={(e) => setSearchRoomId(e.target.value)}
                    className="pl-9 bg-neutral-950 border-neutral-800 text-white font-mono"
                  />
                </div>
                <Button
                  onClick={handleSearchSingleRoom}
                  disabled={searchingRoom || !searchRoomId.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                >
                  {searchingRoom ? 'Searching...' : 'Preview Room State'}
                </Button>
              </div>

              {/* Single Room Preview Card */}
              {singleRoomPreview && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        {singleRoomPreview.targetRoom?.title}
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs font-mono">
                          ID: {singleRoomPreview.targetRoom?.channelName}
                        </Badge>
                        {singleRoomPreview.targetRoom?.isCustomId && (
                          <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10 text-[10px]">
                            Custom ID
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        Owner: {singleRoomPreview.targetRoom?.owner?.name || 'Platform'} (UID: {singleRoomPreview.targetRoom?.owner?.userId || 'N/A'})
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      {singleRoomPreview.targetRoom?.hasActivePK && (
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400 bg-purple-500/10">
                          Active PK Battle
                        </Badge>
                      )}
                      {singleRoomPreview.targetRoom?.hasActiveWatchSession && (
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10">
                          Active Video
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={singleRoomPreview.targetRoom?.isActive ? 'border-emerald-500/30 text-emerald-400' : 'border-neutral-700 text-neutral-400'}
                      >
                        {singleRoomPreview.targetRoom?.isActive ? 'Operational Active' : 'Archived / Inactive'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                    <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                      <span className="text-neutral-500 block mb-0.5">Mic Capacity</span>
                      <span className="text-white font-bold">{singleRoomPreview.targetRoom?.seatCount} Seats</span>
                    </div>
                    <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                      <span className="text-neutral-500 block mb-0.5">Live Occupants</span>
                      <span className="text-amber-400 font-bold">{singleRoomPreview.targetRoom?.onlineOccupantsCount || 0}</span>
                    </div>
                    <div className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800">
                      <span className="text-neutral-500 block mb-0.5">Legacy ID</span>
                      <span className="text-neutral-400">{singleRoomPreview.targetRoom?.legacyId || 'None'}</span>
                    </div>
                  </div>

                  {/* Confirmation checkbox */}
                  <div className="flex items-start gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="single-room-confirm"
                      checked={singleConfirmChecked}
                      onChange={(e) => setSingleConfirmChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-amber-500"
                    />
                    <label htmlFor="single-room-confirm" className="text-xs text-neutral-300 cursor-pointer">
                      Confirm ending active session and archiving room <span className="text-white font-semibold font-mono">{singleRoomPreview.targetRoom?.channelName}</span> safely. Other rooms will remain untouched.
                    </label>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-neutral-800">
                    <Button
                      onClick={handleExecuteSingle}
                      disabled={executingSingle || !singleConfirmChecked}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
                    >
                      {executingSingle ? 'Cleaning...' : `Clean & Archive Room ${singleRoomPreview.targetRoom?.channelName}`}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
