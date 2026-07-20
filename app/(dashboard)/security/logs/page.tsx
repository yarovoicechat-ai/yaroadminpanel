'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ShieldCheck, Calendar, Globe, User, HelpCircle, FileText, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/ems/audit-logs');
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Security Audit Logs
          </h2>
          <p className="text-muted-foreground mt-1">Review system activity, password resets, workflow overrides, and permissions changes</p>
        </div>
        <button
          onClick={fetchLogs}
          className="text-xs bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          Refresh Logs
        </button>
      </div>

      <Card className="glass-card border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> System Activity Log
          </CardTitle>
          <CardDescription>Chronological ledger of security-relevant modifications</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-xs text-slate-500 py-10 text-center">Loading audit log data...</div>
          ) : logs.length === 0 ? (
            <div className="p-10 border border-dashed border-slate-850 rounded-2xl text-center text-xs text-slate-500 bg-slate-900/10">
              No audit logs captured.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/20">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor (Role)</th>
                    <th className="p-3">Action Type</th>
                    <th className="p-3">Target Details</th>
                    <th className="p-3">Details / Comments</th>
                    <th className="p-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {logs.map((log) => {
                    const actorName = log.adminId?.name || 'System Worker';
                    const actorRole = log.adminId?.role || 'Daemon';
                    
                    let actionBadge = 'bg-slate-800 text-slate-350 border-slate-700';
                    if (log.action.includes('Change') || log.action.includes('Reset') || log.action.includes('Password')) {
                      actionBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    } else if (log.action.includes('Approve')) {
                      actionBadge = 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20';
                    } else if (log.action.includes('Reject')) {
                      actionBadge = 'bg-rose-500/10 text-rose-450 border-rose-500/20';
                    }

                    return (
                      <tr key={log._id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-primary shrink-0" />
                            <div>
                              <p className="font-bold text-slate-200">{actorName}</p>
                              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-500 mt-0.5">{actorRole}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${actionBadge}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[10px]">
                          {log.target || 'None'}
                        </td>
                        <td className="p-3 text-slate-300 leading-normal max-w-sm">
                          {log.details}
                        </td>
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5 shrink-0" />
                            {log.ipAddress}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
