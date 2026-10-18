'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  BarChart3,
  ShieldCheck,
  Activity,
  Copy,
  Check,
  Layers,
  PhoneCall,
  Video,
  Users,
  Info,
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

export default function AgoraReadOnlyManagerPage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeConfig, setActiveConfig] = useState<any>(null);
  const [usageOverview, setUsageOverview] = useState<any>(null);
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [projRes, usageRes] = await Promise.all([
          apiClient.get<any>(API_ENDPOINTS.AGORA.PROJECTS),
          apiClient.get<any>(API_ENDPOINTS.AGORA.USAGE),
        ]);
        if (projRes.success && projRes.data) {
          setProjects(projRes.data.projects || []);
          setActiveConfig(projRes.data.activeConfig || null);
        }
        if (usageRes.success && usageRes.data) {
          setUsageOverview(usageRes.data);
        }
      } catch (err) {
        console.warn('Failed to load Agora telemetry in Admin view', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAppId(text);
    setTimeout(() => setCopiedAppId(null), 2000);
  };

  const activeProject = projects.find((p) => p.isActive);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/15 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Radio className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Agora Telemetry & Status
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Read-Only Audit
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Read-only monitor for active RTC credentials, usage thresholds, and standby configurations.
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Active Primary</span>
          <h3 className="text-lg font-bold text-white truncate">{activeProject?.name || 'Default Project'}</h3>
          <div className="flex items-center gap-2 mt-2 font-mono text-xs text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-1 rounded w-fit">
            <span>{activeProject ? `${activeProject.appId.slice(0, 10)}...${activeProject.appId.slice(-6)}` : '••••••••'}</span>
            <button onClick={() => activeProject && copyToClipboard(activeProject.appId)} className="text-slate-500 hover:text-slate-300">
              {copiedAppId === activeProject?.appId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Month-to-Date Usage</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{(activeProject?.currentMonthUsage?.totalMinutes ?? 0).toLocaleString()}</span>
            <span className="text-xs text-slate-400">/ {(activeProject?.monthlyUsageBudgetMinutes ?? 10000).toLocaleString()} min</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-cyan-500 h-full" style={{ width: `${Math.min(100, activeProject?.currentMonthUsage?.usagePercent ?? 0)}%` }} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Failover Guardrails</span>
          <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 inline-block">
            {activeConfig?.switchingMode || 'Automatic'} Mode
          </span>
          <p className="text-xs text-slate-400 mt-2">
            Configured failover threshold: <strong className="text-white">{activeConfig?.switchingThresholdPercent ?? 85}%</strong>
          </p>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Configured Projects ({projects.length})</h3>
          <span className="text-xs text-slate-400">Source of Truth: YaroAppManagement</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-950/40">
                <th className="py-3 px-4">Priority & Project</th>
                <th className="py-3 px-4">App ID</th>
                <th className="py-3 px-4">Environment</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Usage %</th>
                <th className="py-3 px-4">Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {projects.map((proj) => (
                <tr key={proj._id} className={proj.isActive ? 'bg-cyan-500/5' : ''}>
                  <td className="py-3.5 px-4 font-bold text-white">#{proj.priority} {proj.name}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-300">{proj.appId.slice(0, 10)}...</td>
                  <td className="py-3.5 px-4 text-xs capitalize text-slate-400">{proj.environment}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${proj.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                      {proj.isActive ? 'ACTIVE PRIMARY' : 'STANDBY'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-bold text-white">{proj.currentMonthUsage?.usagePercent ?? 0}%</td>
                  <td className="py-3.5 px-4 text-xs text-emerald-400 font-semibold">{proj.validationStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
