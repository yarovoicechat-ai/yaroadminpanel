'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Check, X, RefreshCw, UserCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import Image from 'next/image';

interface AvatarRequestItem {
  _id: string;
  hostId: number;
  currentAvatar: string;
  requestedAvatar: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  createdAt: string;
  hostUserObjId?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    userId?: number;
  };
}

export function AvatarRequestsWidget() {
  const [requests, setRequests] = useState<AvatarRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<any>('/api/v1/avatar-requests?status=pending');
      const data = (res as any)?.data?.requests || (res as any)?.data || (res as any)?.requests || [];
      setRequests(data);
    } catch (error: any) {
      toast.error('Failed to load avatar verification requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const handleApprove = async (id: string) => {
    try {
      const res = await apiClient.put(`/api/v1/avatar-requests/${id}/approve`, {});
      toast.success(res.message || 'Avatar request approved successfully');
      await loadRequests();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve avatar request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await apiClient.put(`/api/v1/avatar-requests/${id}/reject`, { reason: rejectReason });
      toast.success(res.message || 'Avatar request rejected');
      setRejectingId(null);
      setRejectReason('');
      await loadRequests();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject avatar request');
    }
  };

  return (
    <Card className="border border-purple-500/20 bg-slate-900/60 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-100">
          <UserCheck className="h-5 w-5 text-purple-400" />
          Pending Host Avatar Requests
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
            {requests.length} Pending
          </Badge>
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => void loadRequests()}>
          <RefreshCw className="h-4 w-4 text-slate-400" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-6 text-center text-sm text-slate-400">Loading avatar requests...</div>
        ) : requests.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-400">No pending host avatar verification requests.</div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 gap-4"
              >
                {/* Host Info */}
                <div className="space-y-1">
                  <p className="font-semibold text-slate-200">
                    {req.hostUserObjId?.name || `Host #${req.hostId}`}
                  </p>
                  <p className="text-xs text-slate-400">Host ID: <code className="text-pink-400">{req.hostId}</code></p>
                  <p className="text-[11px] text-slate-500">{new Date(req.createdAt).toLocaleString()}</p>
                </div>

                {/* Avatar Previews */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 mb-1">Current</p>
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-600 bg-slate-700">
                      {req.currentAvatar ? (
                        <Image src={req.currentAvatar} alt="Current" fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">None</div>
                      )}
                    </div>
                  </div>

                  <span className="text-slate-500 font-bold text-xs">→</span>

                  <div className="text-center">
                    <p className="text-[10px] text-purple-400 font-semibold mb-1">Requested</p>
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500 bg-slate-700 shadow-md shadow-purple-500/20">
                      <Image src={req.requestedAvatar} alt="Requested" fill className="object-cover" unoptimized />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {rejectingId === req._id ? (
                    <div className="flex flex-col gap-1.5 w-full">
                      <Input
                        placeholder="Rejection reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="text-xs h-7"
                      />
                      <div className="flex gap-1.5">
                        <Button size="sm" variant="destructive" className="h-7 text-xs px-2" onClick={() => void handleReject(req._id)}>
                          Confirm Reject
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => setRejectingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8"
                        onClick={() => void handleApprove(req._id)}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs h-8"
                        onClick={() => { setRejectingId(req._id); setRejectReason(''); }}
                      >
                        <X className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
