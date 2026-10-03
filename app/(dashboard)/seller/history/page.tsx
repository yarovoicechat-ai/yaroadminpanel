'use client';

import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Diamond,
  RefreshCw,
} from 'lucide-react';

export default function SellerHistoryPage() {
  const [search, setSearch] = useState('');

  const logs = [
    {
      _id: 'tx_1',
      date: '2026-10-03 22:45',
      userNumericId: '888888',
      userName: 'King Arthur',
      diamonds: 50000,
      amount: '₹3,000',
      status: 'completed',
    },
    {
      _id: 'tx_2',
      date: '2026-10-03 20:12',
      userNumericId: '100234',
      userName: 'Zara Host',
      diamonds: 16700,
      amount: '₹1,000',
      status: 'completed',
    },
    {
      _id: 'tx_3',
      date: '2026-10-03 18:30',
      userNumericId: '200455',
      userName: 'Rohan Sharma',
      diamonds: 8350,
      amount: '₹500',
      status: 'completed',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white">Recharge Audit History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Log of customer diamond transfers initiated from your seller account.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Numeric ID</th>
                <th className="p-3.5">Diamonds Transferred</th>
                <th className="p-3.5">Invoice Value</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map(l => (
                <tr key={l._id} className="hover:bg-slate-800/30">
                  <td className="p-3.5 text-slate-400">{l.date}</td>
                  <td className="p-3.5 font-semibold text-white">{l.userName}</td>
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">{l.userNumericId}</td>
                  <td className="p-3.5 font-mono text-amber-400 font-bold">{l.diamonds.toLocaleString()} 💎</td>
                  <td className="p-3.5 text-white">{l.amount}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      COMPLETED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
