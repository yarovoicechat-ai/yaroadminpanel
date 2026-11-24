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
  Ban, Search, Monitor, ShieldAlert, Smartphone, CheckCircle,
  User, AlertCircle, RefreshCw, Plus, Key, Sliders, Shield, Clock,
  History, Loader2, CheckCircle2, UserX, AlertTriangle
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

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

const DEVICE_REASON_PRESETS = [
  'Multiple fraudulent account creation / Bot farm',
  'Device used for platform harassment / Ban evasion',
  'Suspicious payment / Refund abuse',
  'Emulated environment / Security policy violation',
  'Administrative restriction (General)',
];

export default function DeviceBansPage() {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [totalDevices, setTotalDevices] = useState(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'banned' | 'active'>('all');
  const [page, setPage] = useState(1);

  // User to Device lookup
  const [userLookupInput, setUserLookupInput] = useState('');
  const [lookingUpUser, setLookingUpUser] = useState(false);

  // Ban Device Form State
  const [targetDeviceId, setTargetDeviceId] = useState('');
  const [banType, setBanType] = useState<'temporary' | 'permanent'>('temporary');
  const [duration, setDuration] = useState<string>('24 Hours');
  const [customDateTime, setCustomDateTime] = useState<string>('');
  const [reason, setReason] = useState<string>('Administrative restriction');
  const [adminNote, setAdminNote] = useState<string>('');
  const [submittingBan, setSubmittingBan] = useState(false);

  // Unban Device State
  const [unbanningDevice, setUnbanningDevice] = useState<any | null>(null);
  const [unbanReason, setUnbanReason] = useState<string>('Unbanned by authorized administrator');
  const [submittingUnban, setSubmittingUnban] = useState(false);

  // Device Ban History Modal
  const [historyDeviceId, setHistoryDeviceId] = useState<string | null>(null);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch registered devices
  const fetchDevices = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = `/api/admin/bans/devices?search=${encodeURIComponent(searchQuery)}&status=${statusFilter}&page=${page}&limit=25`;
      const res: any = await apiClient.get(endpoint);
      if (res?.success && Array.isArray(res.data?.devices)) {
        setDevices(res.data.devices);
        setTotalDevices(res.data.total || 0);
      } else {
        setDevices([]);
        setTotalDevices(0);
      }
    } catch (err) {
      console.error('Failed to load devices:', err);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, page]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  // Lookup user's registered hardware device ID
  const handleLookupUserDevice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = userLookupInput.trim();
    if (!q) {
      toast.error('Please enter a User ID');
      return;
    }

    setLookingUpUser(true);
    try {
      const res: any = await apiClient.get(`/api/admin/users/${encodeURIComponent(q)}`);
      const user = res?.data?.user || res?.user;
      if (user) {
        const foundId = user?.device?.currentDeviceId || user?.device?.createdDeviceId || user?.deviceId;
        if (foundId) {
          setTargetDeviceId(foundId);
          toast.success(`Found device for User #${user.userId}: ${foundId}`);
        } else {
          toast.warning(`User #${user.userId} found, but no hardware device ID registered.`);
        }
      } else {
        toast.error('User not found');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'User lookup failed');
    } finally {
      setLookingUpUser(false);
    }
  };

  // Submit Ban Device
  const handleConfirmBanDevice = async () => {
    const cleanId = targetDeviceId.trim();
    if (!cleanId) {
      toast.error('Please enter or select a Device ID');
      return;
    }

    if (duration === 'Custom Date & Time' && !customDateTime) {
      toast.error('Please select an expiration date and time');
      return;
    }

    setSubmittingBan(true);
    try {
      const payload: any = {
        deviceId: cleanId,
        banType: duration === 'Permanent' ? 'permanent' : banType,
        duration,
        customDate: duration === 'Custom Date & Time' ? customDateTime : undefined,
        reason: reason.trim(),
        adminNote: adminNote.trim(),
      };

      const res: any = await apiClient.post('/api/admin/bans/device', payload);
      if (res?.success) {
        toast.success(res.message || `Device ${cleanId} banned successfully`);
        setTargetDeviceId('');
        setAdminNote('');
        fetchDevices();
      } else {
        toast.error(res?.message || 'Failed to ban device');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to ban device');
    } finally {
      setSubmittingBan(false);
    }
  };

  // Submit Unban Device
  const handleConfirmUnbanDevice = async () => {
    if (!unbanningDevice) return;
    setSubmittingUnban(true);
    try {
      const cleanId = unbanningDevice.deviceId;
      const res: any = await apiClient.post('/api/admin/bans/device/unban', {
        deviceId: cleanId,
        reason: unbanReason,
      });

      if (res?.success) {
        toast.success(res.message || `Device ${cleanId} unbanned successfully`);
        setUnbanningDevice(null);
        fetchDevices();
      } else {
        toast.error(res?.message || 'Failed to unban device');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to unban device');
    } finally {
      setSubmittingUnban(false);
    }
  };

  // View Device Ban History
  const handleOpenHistory = async (devId: string) => {
    setHistoryDeviceId(devId);
    setLoadingHistory(true);
    try {
      const res: any = await apiClient.get(`/api/admin/bans/history?targetType=DEVICE&targetId=${encodeURIComponent(devId)}`);
      if (res?.success && Array.isArray(res.data?.history)) {
        setHistoryRecords(res.data.history);
      } else {
        setHistoryRecords([]);
      }
    } catch (err) {
      console.error('Failed to load device history:', err);
      setHistoryRecords([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 p-6 rounded-2xl border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Smartphone className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Device Ban & Hardware Security
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Manage device-level restrictions, view associated user accounts, and enforce temporary or permanent device hardware bans.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDevices}
          disabled={loading}
          className="border-slate-800 text-slate-300 hover:bg-slate-800"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Grid: Device Ban Action Form & Lookup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Ban Device */}
        <Card className="lg:col-span-7 bg-slate-900/60 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-400" />
              <span>Apply Device Hardware Ban</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Banning a device prevents any user from logging in or registering from that installation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Find device via User ID */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <Label className="text-xs text-slate-400">Don&apos;t know the Device ID? Find it by User ID:</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter User ID..."
                  value={userLookupInput}
                  onChange={(e) => setUserLookupInput(e.target.value)}
                  className="bg-slate-900 border-slate-700 text-white font-mono text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleLookupUserDevice}
                  disabled={lookingUpUser || !userLookupInput.trim()}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs"
                >
                  {lookingUpUser ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                  Find Device
                </Button>
              </div>
            </div>

            {/* Target Device ID */}
            <div>
              <Label className="text-xs text-slate-300 font-medium">1. Target Device ID</Label>
              <Input
                placeholder="Enter installation device ID (e.g. 550e8400-e29b-41d4-a716...)"
                value={targetDeviceId}
                onChange={(e) => setTargetDeviceId(e.target.value)}
                className="mt-1.5 bg-slate-950 border-slate-800 text-white font-mono text-sm"
              />
            </div>

            {/* Ban Classification */}
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
                    <span className="font-medium text-sm">Temporary Device Ban</span>
                    <Clock className={`w-4 h-4 ${banType === 'temporary' ? 'text-amber-400' : 'text-slate-500'}`} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Automatic auto-expiration based on server UTC time</p>
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
                    <span className="font-medium text-sm">Permanent Device Ban</span>
                    <ShieldAlert className={`w-4 h-4 ${banType === 'permanent' ? 'text-red-400' : 'text-slate-500'}`} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Indefinite hardware restriction until admin unban</p>
                </button>
              </div>
            </div>

            {/* Duration Presets */}
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

                {duration === 'Custom Date & Time' && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <Label className="text-xs text-slate-400">Custom Expiry Date & Time</Label>
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

            {/* Reason */}
            <div>
              <Label className="text-xs text-slate-300 font-medium">4. Reason for Ban</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
                {DEVICE_REASON_PRESETS.map((r) => (
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
                placeholder="Enter formal device ban reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white text-sm"
              />
            </div>

            {/* Internal Admin Note */}
            <div>
              <Label className="text-xs text-slate-300 font-medium">5. Internal Admin Note (Confidential)</Label>
              <Input
                placeholder="Audit notes, ticket ID, incident reference..."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="mt-1 bg-slate-950 border-slate-800 text-white text-sm"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleConfirmBanDevice}
                disabled={submittingBan || !targetDeviceId.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5"
              >
                {submittingBan ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                Confirm & Ban Device
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Info: Architecture & Scope */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Device vs User ID Ban Scope</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-white">Device Ban Independence</span>
                <p>
                  A device ban restricts that particular installation from accessing YARO, but does NOT permanently ban genuine user accounts if they log in from another authorized device.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-white">Immediate Socket.IO Severing</span>
                <p>
                  All active accounts currently online from the banned device are immediately disconnected via Socket.IO with a structured <code className="text-amber-300">DEVICE_BANNED</code> payload.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-white">Installation Identifier Notes</span>
                <p>
                  Uses secure installation-level tokens stored in app keystore. Does not use restricted hardware serial numbers or MAC addresses.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Registered & Banned Devices Table */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Monitor className="w-5 h-5 text-indigo-400" />
                <span>Registered Devices</span>
                <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 ml-2">
                  {totalDevices} Devices
                </Badge>
              </CardTitle>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex rounded-lg border border-slate-800 bg-slate-950 p-1">
                {(['all', 'banned', 'active'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1 text-xs rounded-md capitalize font-medium transition ${
                      statusFilter === filter
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Search Device or User ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white text-xs w-48"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400">Device ID</TableHead>
                  <TableHead className="text-slate-400">Platform</TableHead>
                  <TableHead className="text-slate-400">Associated Users</TableHead>
                  <TableHead className="text-slate-400">Ban Status</TableHead>
                  <TableHead className="text-slate-400">Expiry / Remaining</TableHead>
                  <TableHead className="text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-400" />
                      Loading devices...
                    </TableCell>
                  </TableRow>
                ) : devices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-500 text-sm">
                      No devices matching the current filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  devices.map((device) => (
                    <TableRow key={device._id || device.deviceId} className="border-slate-800 hover:bg-slate-800/40">
                      <TableCell>
                        <div className="font-mono text-xs text-white max-w-xs truncate" title={device.deviceId}>
                          {device.deviceId}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Last Seen: {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-slate-700 text-slate-300 capitalize text-xs">
                          {device.platform || 'Android'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {Array.isArray(device.associatedUserIds) && device.associatedUserIds.length > 0 ? (
                            device.associatedUserIds.map((uid: number) => (
                              <Badge key={uid} className="bg-slate-800 text-slate-300 text-[10px]">
                                #{uid}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {device.isBanned ? (
                          <div className="space-y-0.5">
                            <Badge className={device.banType === 'permanent' ? 'bg-red-500/20 text-red-300 border-red-500/30 text-xs' : 'bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs'}>
                              {device.banType === 'permanent' ? 'Banned (Permanent)' : 'Banned (Temporary)'}
                            </Badge>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">{device.banReason}</div>
                          </div>
                        ) : (
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {device.isBanned ? (
                          <div className="text-xs text-amber-400 font-medium">
                            {device.remainingTime || 'Permanent'}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenHistory(device.deviceId)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
                          >
                            <History className="w-3.5 h-3.5 mr-1" />
                            History
                          </Button>
                          {device.isBanned ? (
                            <Button
                              size="sm"
                              onClick={() => setUnbanningDevice(device)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Unban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => {
                                setTargetDeviceId(device.deviceId);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="bg-rose-600 hover:bg-rose-500 text-white text-xs"
                            >
                              <Ban className="w-3.5 h-3.5 mr-1" />
                              Ban
                            </Button>
                          )}
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

      {/* Unban Device Dialog */}
      {unbanningDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-emerald-400">
              <span className="p-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-bold text-white text-lg">Confirm Device Unban</h3>
                <p className="text-xs text-slate-400 font-mono truncate max-w-xs">{unbanningDevice.deviceId}</p>
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-300 font-medium">Unban Reason</Label>
              <Input
                value={unbanReason}
                onChange={(e) => setUnbanReason(e.target.value)}
                placeholder="Reason for revoking device ban..."
                className="mt-1.5 bg-slate-950 border-slate-800 text-white text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setUnbanningDevice(null)}
                className="border-slate-800 text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUnbanDevice}
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

      {/* Device Ban History Modal */}
      {historyDeviceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Device Ban History — {historyDeviceId}</h3>
              </div>
              <button
                onClick={() => setHistoryDeviceId(null)}
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
                  No historical ban or unban events recorded for this device.
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
