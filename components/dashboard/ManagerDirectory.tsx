'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

export function ManagerDirectory({ region, requests = false }: { region: 'country' | 'state'; requests?: boolean }) {
  const title = region === 'country' ? 'Country Manager' : 'State Manager';
  const role = `${region}-manager`;
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const load = useCallback(async () => {
    setBusy(true); setError('');
    try {
      const res = requests ? await apiClient.get('/api/recruitment/admin/applications', { role, limit: 100 }) : await apiClient.get('/api/admin/employees/list', { targetRole: `${region}Manager` });
      if (res.success === false) throw new Error(res.message);
      const data = res.data || res;
      setItems(requests ? data.applications || [] : Array.isArray(data) ? data : []);
    } catch (e: any) { setError(e.message || 'Unable to load managers'); } finally { setBusy(false); }
  }, [requests, region, role]);
  useEffect(() => { void load(); }, [load]);
  const action = async (item: any, status: string) => {
    setBusy(true);
    try {
      const res = requests ? await apiClient.patch(`/api/recruitment/admin/applications/${item._id}/status`, { status }) : await apiClient.patch(`/api/admin/employees/block/${item._id}`, {});
      if (res.success === false) throw new Error(res.message);
      toast.success(requests ? `Application ${status}` : 'Account status updated'); setSelected(null); await load();
    } catch (e: any) { toast.error(e.message || 'Action failed'); } finally { setBusy(false); }
  };
  const canAct = ['owner', 'operator'].includes(user?.role || '');
  return <div className="space-y-6 p-6"><div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-2xl font-bold">{title} {requests ? 'Requests' : 'Directory'}</h1><div className="flex gap-4"><Link href={`/${region}-managers${requests ? '' : '/request'}`}>{requests ? 'Directory' : 'Requests'}</Link>{canAct && <Link href={`/${region}-managers/create`}>New application</Link>}<button disabled={busy} onClick={load}>Refresh</button></div></div>
    <p className="text-sm text-slate-400">Below Operator. Hiring is restricted to the assigned {region === 'country' ? 'country' : 'country and state'}, including every subordinate recruited through this branch.</p>
    {error && <p role="alert" className="text-red-400">{error}</p>}{busy && <p>Loading...</p>}
    <div className="overflow-auto rounded-xl border border-slate-700"><table className="w-full text-left text-sm"><thead><tr>{['Name', 'Email', 'Country', ...(region === 'state' ? ['State'] : []), 'Status', 'Action'].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead><tbody>{items.map(item => { const person = item.applicant || item; const territory = item.hiringScope || item.roleData?.hiringScope || {}; return <tr key={item._id} className="border-t border-slate-800"><td className="p-4">{person.name}</td><td className="p-4">{person.email}</td><td className="p-4">{territory.country || person.country?.name || person.country || '-'}</td>{region === 'state' && <td className="p-4">{territory.state || item.roleData?.state || '-'}</td>}<td className="p-4">{item.status || (item.isBlocked ? 'Blocked' : 'Active')}</td><td className="p-4"><button onClick={() => setSelected(item)}>View details</button></td></tr>; })}</tbody></table>{!busy && !items.length && <p className="p-6 text-slate-400">No {requests ? 'applications' : 'managers'} found.</p>}</div>
    {selected && <div role="dialog" aria-modal="true" aria-label="Manager details" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"><div className="max-h-[85vh] w-full max-w-2xl space-y-5 overflow-auto rounded-2xl bg-slate-900 p-6 text-white"><button onClick={() => setSelected(null)} className="float-right">Close</button><h2 className="text-xl font-bold">{selected.applicant?.name || selected.name}</h2><p>{selected.applicant?.email || selected.email}</p><p>Hiring territory: {JSON.stringify(selected.hiringScope || selected.roleData?.hiringScope || {})}</p><h3>Documents</h3>{(selected.documents || []).map((doc: any, index: number) => <div key={index}><a className="text-indigo-300 underline" href={typeof doc === 'string' ? doc : doc.url} target="_blank" rel="noopener noreferrer">{doc.name || doc.documentType || `Document ${index + 1}`}</a></div>)}{requests && canAct && !['approved', 'rejected', 'cancelled', 'joined'].includes(selected.status) && <div className="flex gap-4"><button disabled={busy} onClick={() => action(selected, 'approved')}>Approve</button><button disabled={busy} onClick={() => action(selected, 'rejected')}>Reject</button></div>}{!requests && canAct && <button disabled={busy} onClick={() => action(selected, '')}>{selected.isBlocked ? 'Activate' : 'Suspend'}</button>}</div></div>}
  </div>;
}
