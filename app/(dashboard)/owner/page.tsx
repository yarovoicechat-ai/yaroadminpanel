'use client';

import React from 'react';
import {
  Crown,
  ShieldCheck,
  TrendingUp,
  Users,
  Server,
  Activity,
  DollarSign,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function OwnerConsolePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/30 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 p-3 shadow-lg">
            <Crown size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Owner Executive Console</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                SUPREME ACCESS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Complete platform sovereign control, financial reserves, compliance, and core microservice governance.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Platform Gross Turnover</span>
          <div className="text-2xl font-black text-amber-400 mt-1">₹42,80,000</div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">+18.5% this quarter</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Registered Users</span>
          <div className="text-2xl font-black text-white mt-1">128,450</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Active on iOS & Android</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Live Voice Rooms</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">1,420</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Running concurrently</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">System Health</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">99.98%</div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-1 block">Operational</span>
        </div>
      </div>
    </div>
  );
}
