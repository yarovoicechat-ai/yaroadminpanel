'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileCheck, Check, X, ShieldAlert, User, ShieldCheck, Mail, Phone, Calendar, Key, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function RequestCenter() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  
  // Modal / Detail States
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalComments, setApprovalComments] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/ems/requests?status=${statusFilter}`);
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      setProcessing(true);

      // If Owner updated the password, save it first
      if (user?.role === 'owner' && customPassword) {
        const passRes = await apiClient.patch(`/api/ems/requests/${selectedRequest._id}/password`, {
          password: customPassword
        });
        if (!passRes.success) {
          toast.error('Failed to update password before approval');
          setProcessing(false);
          return;
        }
      }

      const res = await apiClient.post(`/api/ems/requests/${selectedRequest._id}/approve`, {
        comments: approvalComments
      });

      if (res.success) {
        toast.success(res.message || 'Approved successfully.');
        setSelectedRequest(null);
        setApprovalComments('');
        setCustomPassword('');
        fetchRequests();
      } else {
        toast.error(res.message || 'Approval failed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error approving request.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason) {
      toast.error('Rejection reason is required.');
      return;
    }
    try {
      setProcessing(true);
      const res = await apiClient.post(`/api/ems/requests/${selectedRequest._id}/reject`, {
        reason: rejectionReason
      });

      if (res.success) {
        toast.success('Request rejected successfully.');
        setSelectedRequest(null);
        setRejectionReason('');
        fetchRequests();
      } else {
        toast.error('Rejection failed.');
      }
    } catch (err) {
      toast.error('Error rejecting request.');
    } finally {
      setProcessing(false);
    }
  };

  const selectRequest = (req: any) => {
    setSelectedRequest(req);
    setCustomPassword(req.passwordBeforeApproval || '');
    setApprovalComments('');
    setRejectionReason('');
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            EMS Request Center
          </h2>
          <p className="text-muted-foreground mt-1">Review staff applications, KYC approvals, and withdrawal requests</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl w-fit">
        {['pending', 'approved', 'rejected', 'cancelled', 'expired'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors capitalize ${
              statusFilter === status ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Requests List */}
        <div className="md:col-span-2 space-y-3">
          {loading ? (
            <div className="text-xs text-slate-500 py-10 text-center">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-10 border border-dashed border-slate-800 rounded-2xl text-center text-xs text-slate-500 bg-slate-900/10">
              No requests found in this queue.
            </div>
          ) : (
            requests.map(req => (
              <div
                key={req._id}
                onClick={() => selectRequest(req)}
                className={`p-4 bg-slate-900 border rounded-xl cursor-pointer hover:border-primary/45 transition-all flex justify-between items-center ${
                  selectedRequest?._id === req._id ? 'border-primary/50 bg-slate-900/60 shadow-lg' : 'border-slate-850'
                }`}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200 truncate">{req.data.name || 'Unnamed Application'}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary shrink-0">
                      {req.requestType}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3 shrink-0" /> {req.data.email || 'No Email'}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3 shrink-0" /> {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  {req.status === 'pending' && (
                    <div className="text-[10px] bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded text-amber-500 font-bold uppercase">
                      Stage {req.currentStepIndex + 1}/{req.workflowSteps.length || 1}
                    </div>
                  )}
                  {req.status === 'approved' && (
                    <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Approved
                    </span>
                  )}
                  {req.status === 'rejected' && (
                    <span className="text-rose-400 text-xs font-bold flex items-center gap-1">
                      <X className="h-3.5 w-3.5" /> Rejected
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Request Detail & Approvals */}
        <div className="md:col-span-1">
          {selectedRequest ? (
            <Card className="glass-card border-slate-800 sticky top-4">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-400 uppercase">Application Details</CardTitle>
                <CardDescription>Review credentials and sign workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Details list */}
                <div className="space-y-3 bg-slate-950 p-4 border border-slate-900 rounded-xl shadow-inner text-xs">
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-500">Applicant:</span>
                    <span className="font-bold text-slate-200">{selectedRequest.data.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-bold text-slate-200 truncate max-w-[150px]">{selectedRequest.data.email}</span>
                  </div>
                  {selectedRequest.data.phoneNumber && (
                    <div className="flex justify-between border-b border-slate-850 pb-2">
                      <span className="text-slate-500">Phone:</span>
                      <span className="font-bold text-slate-200">{selectedRequest.data.phoneNumber}</span>
                    </div>
                  )}
                  {selectedRequest.data.referralCode && (
                    <div className="flex justify-between border-b border-slate-850 pb-2">
                      <span className="text-slate-500">Referral Code:</span>
                      <span className="font-bold text-primary">{selectedRequest.data.referralCode}</span>
                    </div>
                  )}
                  {selectedRequest.data.documents && selectedRequest.data.documents.length > 0 && !['admin', 'superAdmin', 'super-admin', 'agency'].includes(user?.role || '') && (
                    <div className="space-y-1 pt-1">
                      <span className="text-slate-500">Documents Attached:</span>
                      <div className="flex flex-col gap-1 max-h-20 overflow-y-auto mt-1">
                        {selectedRequest.data.documents.map((doc: string, idx: number) => (
                          <a
                            key={idx}
                            href={doc}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline truncate"
                          >
                            View Attachment {idx + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Password Configuration (For Owner Only, Hidden for Admin/SuperAdmin/Agency) */}
                {selectedRequest.status === 'pending' && !['admin', 'superAdmin', 'super-admin', 'agency'].includes(user?.role || '') && (
                  <div className="space-y-3 border-t border-slate-850 pt-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-primary" /> Generated Credentials
                    </h4>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-semibold">Auto-Generated Password</label>
                      <input
                        type="text"
                        value={customPassword}
                        onChange={(e) => setCustomPassword(e.target.value)}
                        disabled={user?.role !== 'owner'}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-primary disabled:opacity-60"
                      />
                      {user?.role !== 'owner' && (
                        <p className="text-[9px] text-slate-500 leading-normal">Only the Owner role can modify this password before final sign-off.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Stages log */}
                <div className="space-y-3 border-t border-slate-850 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Workflow Stages</h4>
                  <div className="space-y-2">
                    {selectedRequest.workflowSteps.map((roleStep: string, i: number) => {
                      const isCurrent = selectedRequest.status === 'pending' && selectedRequest.currentStepIndex === i;
                      const isApproved = selectedRequest.currentStepIndex > i || selectedRequest.status === 'approved';
                      
                      return (
                        <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/50 border border-slate-900">
                          <span className="capitalize font-semibold text-slate-300">
                            {roleStep} approval
                          </span>
                          <span>
                            {isApproved ? (
                              <span className="text-emerald-400 font-bold">✓ Approved</span>
                            ) : isCurrent ? (
                              <span className="text-amber-500 font-bold animate-pulse">● Pending</span>
                            ) : (
                              <span className="text-slate-600 font-semibold">Scheduled</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Operations Section */}
                {selectedRequest.status === 'pending' && (
                  <div className="space-y-4 border-t border-slate-850 pt-4">
                    {/* Check if user can approve this stage */}
                    {user?.role === 'owner' || user?.role === selectedRequest.workflowSteps[selectedRequest.currentStepIndex] ? (
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Approval Comments</label>
                          <textarea
                            rows={2}
                            placeholder="Add approval comments..."
                            value={approvalComments}
                            onChange={(e) => setApprovalComments(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-primary resize-none"
                          />
                        </div>
                        <button
                          onClick={handleApprove}
                          disabled={processing}
                          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs transition-colors shadow-lg"
                        >
                          <Check className="h-4 w-4" /> Approve Stage
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg text-rose-400 text-xs flex gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <div>
                          <p className="font-bold">Access Denied</p>
                          <p className="mt-0.5 text-[10px] leading-normal">
                            This step requires '{selectedRequest.workflowSteps[selectedRequest.currentStepIndex]}' approvals. Your current role is '{user?.role}'.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Rejection input */}
                    <div className="border-t border-slate-850 pt-4 space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-500 font-bold uppercase">Rejection Reason</label>
                        <textarea
                          rows={2}
                          placeholder="Why is this application rejected? (Required)"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-primary resize-none"
                        />
                      </div>
                      <button
                        onClick={handleReject}
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 bg-rose-900/20 border border-rose-950 text-rose-400 hover:bg-rose-900 hover:text-white font-bold py-2 rounded-lg text-xs transition-colors"
                      >
                        <X className="h-4 w-4" /> Reject Request
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              Select an application from the list to review and sign approvals.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
