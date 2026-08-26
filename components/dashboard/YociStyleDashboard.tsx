'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { User, Clock, Bell, MessageSquare, Search, Settings, Volume2 } from 'lucide-react';

export function YociStyleDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(API_ENDPOINTS.DASHBOARD.STATS).catch(() => ({ success: false, data: null }));
        if (res?.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load Yoci dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const userName = user?.name || 'Shivansh Bajpeyi';
  const roleDisplay = (user?.role as string) === 'agency' ? 'Agency Head' : ((user?.role as string) === 'superAdmin' || (user?.role as string) === 'super-admin') ? 'Super Admin Lead' : 'Team Head';
  const userCode = (user as any)?.employeeCode || (user as any)?.referralCode || (user as any)?.specialCode || (user as any)?.mithiId || '1068';
  const whatsappNumber = (user as any)?.phone || (user as any)?.phoneNumber || '07234816631';

  // Stats calculation fallbacks
  const totalDiamonds = stats?.stats?.totalDiamonds || stats?.referrals?.totalDiamondsGranted || 573;
  const weeklyDiamonds = stats?.stats?.weeklyDiamonds || 243;
  const prevWeekDiamonds = stats?.stats?.prevWeekDiamonds || 0;
  const monthlyDiamonds = stats?.stats?.monthlyDiamonds || 243;
  const prevMonthDiamonds = stats?.stats?.prevMonthDiamonds || 330;
  const totalNewHosts = stats?.stats?.newHostsThisMonth || stats?.activeHosts || 10;
  const totalHosts = stats?.totalHosts || 20;

  return (
    <div className="space-y-6 pb-20 font-sans text-slate-800 dark:text-slate-100 max-w-6xl mx-auto">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm relative">
        <div className="absolute right-4 top-4 flex items-center gap-3 text-slate-400">
          <Clock className="w-4 h-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200" />
          <div className="relative">
            <Bell className="w-4 h-4 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">{userCode}</span>
        </div>

        {/* Profile Avatar */}
        <div className="flex flex-col items-center pt-2">
          <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shadow-inner overflow-hidden">
            {(user as any)?.profilePhoto || (user as any)?.avatar ? (
              <img src={(user as any)?.profilePhoto || (user as any)?.avatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-slate-400" />
            )}
          </div>

          <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-3">
            {userName} {roleDisplay}
          </h2>
        </div>

        {/* User Details Table / List */}
        <div className="mt-4 border-t border-slate-100 dark:border-slate-800/80 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
          <div className="py-2 px-1 text-slate-600 dark:text-slate-300 font-medium">
            : {userName}
          </div>
          <div className="py-2 px-1 text-slate-600 dark:text-slate-300 font-medium">
            Team Leader Code: <span className="font-bold text-slate-800 dark:text-slate-100">{userCode}</span>
          </div>
          <div className="py-2 px-1 text-slate-600 dark:text-slate-300 font-medium">
            Whatsapp Number: <span className="font-bold text-slate-800 dark:text-slate-100">{whatsappNumber}</span>
          </div>
          <div className="py-2 px-1 text-slate-600 dark:text-slate-300 font-medium">
            : {user?.email || userName}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid - 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 1. Total Diamonds Earning */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-md flex items-center justify-between">
          <span className="text-sm font-bold tracking-wide">Total Diamonds Earning</span>
          <span className="text-2xl font-black">{totalDiamonds}</span>
        </div>

        {/* 2. Weekly Diamond Earning */}
        <div className="bg-gradient-to-r from-cyan-400 to-sky-500 rounded-xl p-5 text-white shadow-md flex items-center justify-between">
          <span className="text-sm font-bold tracking-wide">Weekly Diamond Earning</span>
          <span className="text-2xl font-black">{weeklyDiamonds}</span>
        </div>

        {/* 3. Previous Week Diamond Earning */}
        <div className="bg-gradient-to-r from-pink-500 via-fuchsia-600 to-purple-600 rounded-xl p-5 text-white shadow-md flex items-center justify-between">
          <span className="text-sm font-bold tracking-wide">Previous Week Diamond Earning</span>
          <span className="text-2xl font-black">{prevWeekDiamonds}</span>
        </div>

        {/* 4. Monthly Diamond Earning */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-5 text-white shadow-md flex items-center justify-between">
          <span className="text-sm font-bold tracking-wide">Monthly Diamond Earning</span>
          <span className="text-2xl font-black">{monthlyDiamonds}</span>
        </div>

        {/* 5. Previous Month Diamond Earning */}
        <div className="bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 rounded-xl p-5 text-white shadow-md flex items-center justify-between">
          <span className="text-sm font-bold tracking-wide">Previous Month Diamond Earning</span>
          <span className="text-2xl font-black">{prevMonthDiamonds}</span>
        </div>

        {/* 6. Total New Hosts */}
        <div className="bg-gradient-to-r from-rose-500 via-purple-600 to-purple-700 rounded-xl p-5 text-white shadow-md flex items-center justify-between">
          <span className="text-sm font-bold tracking-wide">Total New Hosts</span>
          <span className="text-2xl font-black">{totalNewHosts}</span>
        </div>

        {/* 7. Total Hosts */}
        <div className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 rounded-xl p-5 text-white shadow-md flex items-center justify-between">
          <span className="text-sm font-bold tracking-wide">Total Hosts</span>
          <span className="text-2xl font-black">{totalHosts}</span>
        </div>

      </div>

      {/* Floating Bottom Right Chat / Yoci Support Widget */}
      <div className="fixed bottom-0 right-4 w-72 bg-indigo-600 text-white rounded-t-xl shadow-2xl border border-indigo-400/40 z-50 overflow-hidden font-sans">
        {/* Header Bar */}
        <div className="p-3 bg-indigo-700/80 border-b border-indigo-500/40 flex items-center justify-between text-xs font-bold">
          <span>Yoci Live</span>
          <MessageSquare className="w-4 h-4" />
        </div>

        {/* Contact List */}
        <div className="p-3 space-y-2 text-xs bg-indigo-600/90 max-h-36 overflow-y-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-semibold text-white/95">Ayushi Team Head</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-semibold text-white/95">Deepak kumar Business Developer</span>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="p-2 bg-indigo-800/90 border-t border-indigo-500/40 flex items-center justify-between text-[11px] text-white/80">
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
            <Search className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
          </div>
          <span className="font-medium">Online: 0</span>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
            <Volume2 className="w-3.5 h-3.5 cursor-pointer hover:text-white" />
          </div>
        </div>
      </div>

    </div>
  );
}
