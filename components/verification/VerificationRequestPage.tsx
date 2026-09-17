'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, Eye, KeyRound, Loader2, RefreshCw, Search, ShieldCheck, StickyNote, UserCheck, X, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { getAdminAvatar } from '@/lib/avatar';

type Kind = 'face' | 'kyc';
const statuses = ['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RESUBMISSION_REQUIRED'];
const apiBase = () => typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname) ? (process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || 'http://localhost:3001') : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001');

function PrivateImage({ path, label }: { path?: string; label: string }) {
  const [src, setSrc] = useState<string>();
  useEffect(() => {
    if (!path) return;
    let objectUrl = '';
    fetch(`${apiBase()}${path}`, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` } })
      .then(response => {
        if (!response.ok) throw new Error('Image access denied');
        return response.blob();
      })
      .then(blob => { objectUrl = URL.createObjectURL(blob); setSrc(objectUrl); })
      .catch(() => undefined);
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [path]);
  return <div className="rounded-xl border border-white/10 bg-black/20 p-2">
    <p className="mb-2 text-xs font-semibold text-muted-foreground">{label}</p>
    {src ? <a href={src} target="_blank" rel="noreferrer"><img src={src} alt={label} className="h-52 w-full rounded-lg object-contain" /></a>
      : <div className="flex h-52 items-center justify-center text-xs text-muted-foreground">No image</div>}
  </div>;
}

export default function VerificationRequestPage({ kind }: { kind: Kind }) {
  const { user } = useAuth();
  const role = String(user?.role || '').toLowerCase();
  const canReview = ['owner', 'superadmin', 'admin', 'operator'].includes(role);
  const canDecide = ['owner', 'superadmin', 'admin'].includes(role);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('PENDING');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<any>();
  const [detail, setDetail] = useState<any>();
  const [processing, setProcessing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<any>(`/api/v1/admin/verifications/${kind}`, {
        page, limit: 20, search: search || undefined, status: status === 'ALL' ? undefined : status,
      });
      setItems(response.data?.requests || []);
      setTotalPages(response.data?.totalPages || 1);
    } catch (error: any) { toast.error(error.message || 'Unable to load verification requests'); }
    finally { setLoading(false); }
  }, [kind, page, search, status]);
  useEffect(() => { const timer = setTimeout(() => void load(), 300); return () => clearTimeout(timer); }, [load]);

  const openDetail = async (item: any) => {
    setSelected(item); setDetail(undefined);
    try {
      const response = await apiClient.get<any>(`/api/v1/admin/verifications/${kind}/${item.requestId}`);
      setDetail(response.data);
    } catch (error: any) { toast.error(error.message || 'Unable to load request detail'); }
  };
  const action = async (name: string, body: any = {}) => {
    if (!selected) return;
    try {
      setProcessing(true);
      await apiClient.patch(`/api/v1/admin/verifications/${kind}/${selected.requestId}/${name}`, body);
      toast.success('Verification request updated');
      const response = await apiClient.get<any>(`/api/v1/admin/verifications/${kind}/${selected.requestId}`);
      setDetail(response.data); setSelected(response.data?.request); await load();
    } catch (error: any) { toast.error(error.message || 'Action failed'); }
    finally { setProcessing(false); }
  };
  const reject = () => {
    const reason = window.prompt('Enter a user-visible rejection reason')?.trim();
    if (reason && window.confirm('Reject this verification request?')) void action('reject', { reasonCode: 'OTHER', reason });
  };
  const resubmit = () => {
    const options = kind === 'face' ? ['faceSelfie'] : ['documentFront', 'documentBack', 'documentNumber', 'faceSelfie', 'personalDetails', 'address', 'bankDetails', 'bankProof'];
    const value = window.prompt(`Requested fields (comma separated): ${options.join(', ')}`, options[0])?.trim();
    if (!value) return;
    const fields = value.split(',').map(field => field.trim()).filter(Boolean);
    const instructions = window.prompt('Instructions for the user')?.trim();
    if (instructions) void action('request-resubmission', { fields, instructions });
  };
  const addNote = async () => {
    const note = window.prompt('Internal note (not visible to the user)')?.trim();
    if (!note || !selected) return;
    try {
      setProcessing(true);
      await apiClient.post(`/api/v1/admin/verifications/${kind}/${selected.requestId}/notes`, { note });
      toast.success('Internal note added');
      await openDetail(selected);
    } catch (error: any) { toast.error(error.message || 'Unable to add note'); }
    finally { setProcessing(false); }
  };
  const assignToMe = () => {
    if (user?.id) void action('assign', { adminId: user.id });
  };
  const revealSensitive = async (field: 'document' | 'bank') => {
    if (!selected || !window.confirm(`Reveal the full ${field} number? This access is audited.`)) return;
    try {
      const response = await apiClient.get<any>(`/api/v1/admin/verifications/kyc/${selected.requestId}/sensitive`, { field });
      const value = field === 'document' ? response.data?.documentNumber : response.data?.accountNumber;
      window.alert(`${field === 'document' ? 'Document' : 'Bank account'} number: ${value || 'Not available'}`);
    } catch (error: any) { toast.error(error.message || 'Sensitive data access denied'); }
  };
  const approve = async () => {
    if (!window.confirm('Confirm manual approval? This action is audited.')) return;
    if (kind === 'kyc') {
      await action('section-status', { documentStatus: 'VALID', faceStatus: 'MATCHED_MANUALLY', bankStatus: selected.bankDetails ? 'VERIFIED' : 'NOT_REQUIRED' });
    }
    await action('approve', kind === 'kyc' ? {
      documentStatus: 'VALID', faceStatus: 'MATCHED_MANUALLY', bankStatus: selected.bankDetails ? 'VERIFIED' : 'NOT_REQUIRED',
    } : {});
  };

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-3xl font-bold">{kind === 'face' ? 'Face Verification Requests' : 'KYC Verification Requests'}</h1>
        <p className="text-sm text-muted-foreground">Separate manual review queue with audit history and controlled access.</p></div>
      <Button variant="outline" onClick={() => void load()}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button>
    </div>
    <div className="flex flex-wrap gap-2">{statuses.map(tab => <Button key={tab} size="sm" variant={status === tab ? 'default' : 'outline'} onClick={() => { setStatus(tab); setPage(1); }}>{tab.replaceAll('_', ' ')}</Button>)}</div>
    <Card glass><CardHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-cyan-300" />Manual review queue</CardTitle>
      <div className="relative w-full sm:w-80"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="User ID, name or mobile" className="pl-9" /></div></div></CardHeader>
      <CardContent className="p-0"><Table><TableHeader><TableRow>
        <TableHead>Request</TableHead><TableHead>User</TableHead>{kind === 'kyc' && <TableHead>Document</TableHead>}<TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Submitted</TableHead><TableHead className="text-right">Action</TableHead>
      </TableRow></TableHeader><TableBody>
        {!loading && !items.length ? <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No requests found.</TableCell></TableRow> :
          items.map(item => { const user = item.userId || {}; const rowStatus = item.status || item.overallStatus; return <TableRow key={item.requestId}>
            <TableCell className="font-mono text-xs">{item.requestId}</TableCell>
            <TableCell><div className="flex items-center gap-2"><img src={getAdminAvatar(user)} alt="" className="h-8 w-8 rounded-full object-cover" /><div><p className="font-semibold">{user.name || user.userName || 'User'}</p><p className="text-xs text-muted-foreground">{user.meethiId || user.userId} · {user.phoneNumber || '—'}</p></div></div></TableCell>
            {kind === 'kyc' && <TableCell><p>{item.document?.type?.replaceAll('_', ' ')}</p><p className="font-mono text-xs text-muted-foreground">{item.document?.maskedDocumentNumber}</p></TableCell>}
            <TableCell><Badge variant={rowStatus === 'APPROVED' ? 'success' : rowStatus === 'REJECTED' ? 'destructive' : 'secondary'}>{rowStatus}</Badge></TableCell>
            <TableCell>{item.priority}</TableCell><TableCell className="text-xs">{new Date(item.submittedAt).toLocaleString()}</TableCell>
            <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => void openDetail(item)}><Eye className="mr-1 h-4 w-4" />{canReview ? 'Review' : 'View'}</Button></TableCell>
          </TableRow>; })}
      </TableBody></Table></CardContent></Card>
    <div className="flex justify-end gap-2"><Button variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button><span className="px-3 py-2 text-sm">{page} / {totalPages}</span><Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(value => value + 1)}>Next</Button></div>

    {selected && <div className="fixed inset-0 z-50 flex justify-end bg-black/70" onClick={() => setSelected(undefined)}>
      <div className="h-full w-full max-w-5xl overflow-y-auto border-l border-white/10 bg-slate-950 p-6" onClick={event => event.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between"><div><h2 className="text-2xl font-bold">{selected.requestId}</h2><p className="text-sm text-muted-foreground">Manual comparison and decision</p></div><Button variant="ghost" onClick={() => setSelected(undefined)}><X /></Button></div>
        {!detail ? <Loader2 className="mx-auto mt-20 h-8 w-8 animate-spin text-cyan-300" /> : <>
          <div className="mb-5 grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-3">
            <Info label="User" value={detail.request.userId?.name || detail.request.userId?.userName} /><Info label="Mobile" value={detail.request.userId?.phoneNumber} /><Info label="Role" value={detail.request.userId?.role} />
            <Info label="Status" value={detail.request.status || detail.request.overallStatus} /><Info label="Purpose" value={detail.request.purpose} /><Info label="Version" value={detail.request.submissionVersion} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-2">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Current profile</p>
              <a href={getAdminAvatar(detail.request.userId)} target="_blank" rel="noreferrer"><img src={getAdminAvatar(detail.request.userId)} alt="Current profile" className="h-52 w-full rounded-lg object-contain" /></a>
            </div>
            <PrivateImage label="Live submitted selfie" path={kind === 'face' ? detail.request.faceImageUrl : detail.request.face?.liveSelfieUrl} />
            {kind === 'kyc' && <PrivateImage label="Document front" path={detail.request.document?.frontImageUrl} />}
            {kind === 'kyc' && <PrivateImage label="Document back" path={detail.request.document?.backImageUrl} />}
            {kind === 'kyc' && <PrivateImage label="Bank proof" path={detail.request.bankDetails?.proofImageUrl} />}
          </div>
          {kind === 'kyc' && <div className="mt-5 grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-2">
            <Info label="Document" value={`${detail.request.document?.type} · ${detail.request.document?.maskedDocumentNumber}`} />
            <Info label="Bank account" value={detail.request.bankDetails?.maskedAccountNumber || 'Not required'} />
            <Info label="Document status" value={detail.request.documentStatus} /><Info label="Face status" value={detail.request.faceStatus} />
          </div>}
          {detail.request.rejectionReasonText && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">{detail.request.rejectionReasonText}</div>}
          <div className="mt-6 flex flex-wrap gap-2">
            {canReview && <Button variant="outline" onClick={assignToMe} disabled={processing}><UserCheck className="mr-2 h-4 w-4" />Assign to me</Button>}
            {canReview && <Button variant="outline" onClick={() => void addNote()} disabled={processing}><StickyNote className="mr-2 h-4 w-4" />Add note</Button>}
            {canDecide && kind === 'kyc' && <Button variant="outline" onClick={() => void revealSensitive('document')} disabled={processing}><KeyRound className="mr-2 h-4 w-4" />Reveal document no.</Button>}
            {canDecide && kind === 'kyc' && detail.request.bankDetails && <Button variant="outline" onClick={() => void revealSensitive('bank')} disabled={processing}><KeyRound className="mr-2 h-4 w-4" />Reveal bank no.</Button>}
            {canReview && (detail.request.status || detail.request.overallStatus) === 'PENDING' && <Button onClick={() => void action('start-review')} disabled={processing}>Start review</Button>}
            {canDecide && (detail.request.status || detail.request.overallStatus) === 'UNDER_REVIEW' && <>
              <Button onClick={() => void approve()} disabled={processing} className="bg-emerald-600"><CheckCircle className="mr-2 h-4 w-4" />Approve</Button>
              <Button variant="destructive" onClick={reject} disabled={processing}><XCircle className="mr-2 h-4 w-4" />Reject</Button>
              <Button variant="outline" onClick={resubmit} disabled={processing}>Request resubmission</Button>
            </>}
          </div>
          {detail.request.internalNotes?.length ? <div className="mt-7"><h3 className="mb-3 text-lg font-bold">Internal notes</h3><div className="space-y-2">{detail.request.internalNotes.map((note: any, index: number) => <div key={`${note.createdAt}-${index}`} className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3"><p>{note.note}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</p></div>)}</div></div> : null}
          <div className="mt-7"><h3 className="mb-3 text-lg font-bold">Verification history</h3><div className="space-y-3">{(detail.timeline || []).map((entry: any) =>
            <div key={entry._id} className="rounded-xl border border-white/10 p-3"><div className="flex justify-between"><strong>{entry.action.replaceAll('_', ' ')}</strong><span className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</span></div><p className="text-xs text-muted-foreground">{entry.performedBy?.name || entry.performedByRole}{entry.note ? ` · ${entry.note}` : ''}</p></div>)}</div></div>
        </>}
      </div>
    </div>}
  </div>;
}
function Info({ label, value }: { label: string; value: any }) {
  return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-semibold">{value || '—'}</p></div>;
}
