'use client';
import { useEffect, useState } from 'react';
import { FileDown } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function VerificationReportsPage() {
  const [summary, setSummary] = useState<any>();
  const [trends, setTrends] = useState<any>({ face: [], kyc: [] });
  const [performance, setPerformance] = useState<any[]>([]);
  useEffect(() => {
    Promise.all([
      apiClient.get('/api/v1/admin/verifications/reports/summary'),
      apiClient.get('/api/v1/admin/verifications/reports/trends'),
      apiClient.get('/api/v1/admin/verifications/reports/admin-performance'),
    ]).then(([summaryResult, trendsResult, performanceResult]) => {
      setSummary(summaryResult.data); setTrends(trendsResult.data || { face: [], kyc: [] }); setPerformance((performanceResult.data as any[]) || []);
    }).catch((error: any) => toast.error(error.message || 'Unable to load reports'));
  }, []);
  const count = (type: 'face' | 'kyc', status?: string) => (summary?.[type] || []).filter((row: any) => !status || row._id === status).reduce((total: number, row: any) => total + row.count, 0);
  const dates = Array.from(new Set([...(trends.face || []).map((row: any) => row._id), ...(trends.kyc || []).map((row: any) => row._id)])).sort();
  const chart = dates.map(date => ({ date, face: trends.face.find((row: any) => row._id === date)?.count || 0, kyc: trends.kyc.find((row: any) => row._id === date)?.count || 0 }));
  const download = async (type: 'face' | 'kyc') => {
    try {
      const base = ['localhost', '127.0.0.1'].includes(window.location.hostname) ? (process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || 'http://localhost:3001') : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001');
      const response = await fetch(`${base}/api/v1/admin/verifications/reports/export?type=${type}`, { headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` } });
      if (!response.ok) throw new Error('Export permission denied');
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = `verification-${type}-report.csv`; anchor.click();
      URL.revokeObjectURL(url);
    } catch (error: any) { toast.error(error.message || 'Unable to export report'); }
  };
  const cards = [
    ['Total Face Requests', count('face')], ['Pending Face', count('face', 'PENDING')],
    ['Approved Face', count('face', 'APPROVED')], ['Rejected Face', count('face', 'REJECTED')],
    ['Total KYC Requests', count('kyc')], ['Pending KYC', count('kyc', 'PENDING')],
    ['Approved KYC', count('kyc', 'APPROVED')], ['Rejected KYC', count('kyc', 'REJECTED')],
    ['Submitted Today', summary?.submittedToday || 0],
  ];
  return <div className="space-y-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold">Verification Reports</h1><p className="text-sm text-muted-foreground">Manual review volume and outcomes. Sensitive values are excluded.</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => void download('face')}><FileDown className="mr-2 h-4 w-4" />Face CSV</Button><Button variant="outline" onClick={() => void download('kyc')}><FileDown className="mr-2 h-4 w-4" />KYC CSV</Button></div></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <Card glass key={label}><CardContent className="p-5"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></CardContent></Card>)}</div>
    <Card glass><CardHeader><CardTitle>Daily verification requests</CardTitle></CardHeader><CardContent><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart}><CartesianGrid strokeDasharray="3 3" opacity={0.15} /><XAxis dataKey="date" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="face" fill="#06b6d4" /><Bar dataKey="kyc" fill="#a855f7" /></BarChart></ResponsiveContainer></div></CardContent></Card>
    <Card glass><CardHeader><CardTitle>Admin review performance</CardTitle></CardHeader><CardContent><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-white/10"><th className="p-3">Admin</th><th className="p-3">Role</th><th className="p-3">Reviewed</th><th className="p-3">Approved</th></tr></thead><tbody>{performance.length ? performance.map(row => <tr key={row._id || row.name} className="border-b border-white/5"><td className="p-3 font-semibold">{row.name || 'Deleted admin'}</td><td className="p-3">{row.role || '—'}</td><td className="p-3">{row.reviewed}</td><td className="p-3">{row.approvals}</td></tr>) : <tr><td className="p-6 text-center text-muted-foreground" colSpan={4}>No completed reviews yet.</td></tr>}</tbody></table></div></CardContent></Card>
  </div>;
}
