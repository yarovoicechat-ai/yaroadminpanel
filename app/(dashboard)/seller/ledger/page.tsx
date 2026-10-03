'use client';

import React from 'react';
import {
  Coins,
  TrendingUp,
  FileCheck,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export default function SellerLedgerPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <h1 className="text-xl font-bold text-white">Profit & Margin Ledger</h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed financial ledger showing discount margins, wholesale buy costs, and retail turnover.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Total Inflow (Retail Revenue)</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">₹4,85,000</div>
          <span className="text-[10px] text-slate-500">Gross customer collections</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Total Outflow (Stock Cost)</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">₹4,60,750</div>
          <span className="text-[10px] text-slate-500">Paid for wholesale diamond stock</span>
        </div>
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs text-slate-400">Net Retained Margin</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">₹24,250</div>
          <span className="text-[10px] text-emerald-400 font-semibold">5% pure profit margin</span>
        </div>
      </div>
    </div>
  );
}
