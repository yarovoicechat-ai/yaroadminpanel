'use client';

import React, { useState, useEffect } from 'react';
import {
  Gem,
  Coins,
  TrendingUp,
  Users,
  CreditCard,
  ShoppingBag,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    stockDiamonds: 450000,
    totalSalesToday: 38500,
    activeCustomers: 124,
    monthlyProfit: 19450,
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-slate-900 border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 p-3">
            <Gem size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Seller Agency Portal</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                VERIFIED COIN SELLER
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Direct wholesale diamond distribution, user account recharges, and margin management.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/seller/stock"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition"
          >
            <ShoppingBag size={15} />
            Buy Diamond Stock
          </Link>
          <Link
            href="/seller/recharge"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition"
          >
            <CreditCard size={15} />
            Recharge User
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Stock Balance</span>
            <Gem size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400">
            {stats.stockDiamonds.toLocaleString()} 💎
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Available wholesale stock</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Today's Sales</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-400">
            ₹{stats.totalSalesToday.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-1">+14.2% vs yesterday</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Clients</span>
            <Users size={16} className="text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white">
            {stats.activeCustomers}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Users recharged this month</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Net Profit (Margin)</span>
            <Coins size={16} className="text-violet-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-violet-400">
            ₹{stats.monthlyProfit.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">5% - 8% wholesale margin</div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            title: 'User Recharge',
            desc: 'Search user by numeric ID & credit diamonds instantly from your stock.',
            href: '/seller/recharge',
            icon: CreditCard,
            color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          },
          {
            title: 'Buy Stock',
            desc: 'Purchase bulk diamonds at 5% discount rate via UPI or bank transfer.',
            href: '/seller/stock',
            icon: ShoppingBag,
            color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          },
          {
            title: 'Recharge Audit Logs',
            desc: 'View comprehensive history of all transactions and customer transfers.',
            href: '/seller/history',
            icon: FileText,
            color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
          },
          {
            title: 'Profit & Ledger',
            desc: 'Examine ledger, commissions, daily sales turnover, and tax receipts.',
            href: '/seller/ledger',
            icon: Coins,
            color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
          },
        ].map((c, i) => {
          const CIcon = c.icon;
          return (
            <Link
              key={i}
              href={c.href}
              className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group"
            >
              <div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color} mb-3 border`}>
                  <CIcon size={20} />
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.desc}</p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400">
                <span>Open module</span>
                <ArrowUpRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
