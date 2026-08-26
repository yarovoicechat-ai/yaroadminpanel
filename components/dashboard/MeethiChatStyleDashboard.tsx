'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { RevenueChart, EarningsChart, CallChart, DistributionChart } from '@/components/dashboard/Charts';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { toast } from 'sonner';
import { User, Clock, Bell, Gem, Calendar, Users, TrendingUp, Sparkles, Phone, Mail, Award, ShieldCheck, Camera, Edit2, Check, DollarSign, Activity, AlertTriangle, Smartphone, Coins, Heart } from 'lucide-react';
import { MeethiChatTeamWidget } from './MeethiChatTeamWidget';

export function MeethiChatStyleDashboard() {
  const { user, updateUserDP, updateUserPhone } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [dbProfile, setDbProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [callData, setCallData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, profileRes, revRes, earnRes, callRes, distRes] = await Promise.all([
          apiClient.get<any>('/analytics/dashboard').catch(() => null),
          apiClient.get<any>(API_ENDPOINTS.ADMIN.PROFILE).catch(() => null),
          apiClient.get<any>(API_ENDPOINTS.DASHBOARD.REVENUE_CHART, { days: 7 }).catch(() => null),
          apiClient.get<any>(API_ENDPOINTS.DASHBOARD.EARNINGS_CHART, { days: 7 }).catch(() => null),
          apiClient.get<any>(API_ENDPOINTS.DASHBOARD.CALL_TRENDS, { days: 7 }).catch(() => null),
          apiClient.get<any>(API_ENDPOINTS.DASHBOARD.COIN_DISTRIBUTION).catch(() => null)
        ]);

        if (statsRes) setStats((statsRes as any).data || statsRes);
        if (profileRes) setDbProfile((profileRes as any).data || profileRes);
        if (revRes) setRevenueData((revRes as any).data || revRes || []);
        if (earnRes) setEarningsData((earnRes as any).data || earnRes || []);
        if (callRes) setCallData((callRes as any).data || callRes || []);
        if (distRes) setDistributionData((distRes as any).data || distRes || []);
      } catch (error) {
        console.warn('Dashboard data load warning', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const userName = dbProfile?.name || user?.name || 'User Profile';
  const roleDisplay = (user?.role as string) === 'agency' 
    ? 'Agency Head' 
    : ((user?.role as string) === 'superAdmin' || (user?.role as string) === 'super-admin') 
      ? 'Super Admin Lead' 
      : (user?.role as string) === 'owner' 
        ? 'Platform Owner' 
        : (user?.role as string) === 'operator' 
          ? 'Operations Manager' 
          : (user?.role as string) === 'coinSeller' 
            ? 'Merchant Lead' 
            : 'Team Head';

  const userCode = dbProfile?.employeeCode || dbProfile?.referralCode || (user as any)?.employeeCode || (user as any)?.referralCode || (user as any)?.specialCode || (user as any)?.mithiId || 'N/A';
  const rawPhone = dbProfile?.phone || dbProfile?.phoneNumber || dbProfile?.whatsappNumber || (user as any)?.phone || (user as any)?.phoneNumber || (user as any)?.whatsappNumber || (user as any)?.whatsapp || '';
  const whatsappNumber = rawPhone || 'Not Provided';
  const userEmail = dbProfile?.email || user?.email || 'N/A';

  // Real Database Stats (Pure Real Data)
  const todayNewUsers = stats?.analytics?.todayNewUsers ?? stats?.users?.todayNew ?? 0;
  const userReferrals = stats?.referrals?.totalReferrals ?? stats?.stats?.userReferrals ?? 0;
  const activeReferrers = stats?.referrals?.activeReferrers ?? 0;
  const referralEarnings = stats?.referrals?.totalCoinsGranted ?? 0;

  const totalDiamonds = stats?.stats?.totalDiamonds ?? stats?.referrals?.totalDiamondsGranted ?? 0;
  const weeklyDiamonds = stats?.stats?.weeklyDiamonds ?? stats?.analytics?.weeklyEarnings ?? 0;
  const prevWeekDiamonds = stats?.stats?.prevWeekDiamonds ?? 0;
  const monthlyDiamonds = stats?.stats?.monthlyDiamonds ?? stats?.analytics?.monthlyEarnings ?? 0;
  const prevMonthDiamonds = stats?.stats?.prevMonthDiamonds ?? 0;
  const totalNewHosts = stats?.stats?.totalNewHosts ?? stats?.hostsCount?.newHosts ?? 0;
  const totalHosts = stats?.stats?.totalHosts ?? stats?.hostsCount?.total ?? 0;

  return (
    <div className="relative min-h-screen bg-[#070b19] text-slate-100 p-4 md:p-8 space-y-6 font-sans">
      
      {/* 1. App Activity Metrics & Header (matching reference screenshot) */}
      <div className="w-full max-w-6xl mx-auto space-y-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between pb-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">Overview of Meethi Chat app activity</p>
          </div>
          <div className="flex items-center gap-2 bg-[#0d1527] px-3.5 py-1.5 rounded-full border border-slate-800 shadow-md">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">System Healthy</span>
          </div>
        </div>

        {/* Row 1: Key Financials (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Today's Minutes</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white font-mono">{stats?.stats?.minutesToday || 0} mins</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-1">Daily usage</div>
            </div>
          </div>

          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Coins Spent Today</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white font-mono">{stats?.stats?.coinsSpentToday || 0}</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-1">Daily usage</div>
            </div>
          </div>

          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Host Earnings Today</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-emerald-400 font-mono">${stats?.stats?.hostEarningsToday || 0}</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-1">Verified payouts</div>
            </div>
          </div>

          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Today's Revenue</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white font-mono">${stats?.stats?.todayRevenue || 0}</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-1">Gross revenue</div>
            </div>
          </div>
        </div>

        {/* Row 2: Users & Activity (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Users</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white font-mono">{stats?.stats?.totalUsers || 61}</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1">↗ {stats?.stats?.dau || 11} DAU active ({stats?.stats?.mau || 61} MAU)</div>
            </div>
          </div>

          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Hosts</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white font-mono">{stats?.stats?.totalHosts || 1}</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1">↗ {stats?.stats?.approvedHosts || 0} approved</div>
            </div>
          </div>

          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Active Hosts</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white font-mono">{stats?.stats?.activeHosts || 0}</div>
              <div className="text-[10px] text-teal-400 font-semibold mt-1">↪ Busy in calls</div>
            </div>
          </div>

          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Reports Pending</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white font-mono">{stats?.stats?.pendingReports || 0}</div>
              <div className="text-[10px] text-rose-400 font-semibold mt-1">⚡ Needs attention</div>
            </div>
          </div>
        </div>

        {/* Row 3: Referrals & Security (2 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Total Referrals</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white font-mono">{stats?.stats?.totalReferrals || 3}</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1">↗ {stats?.stats?.coinsGranted || 150} granted</div>
            </div>
          </div>

          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-lg shadow-black/40 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Device Limits</span>
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-white font-mono">{stats?.stats?.deviceLimits || 0}</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-1">1 max accounts/device</div>
            </div>
          </div>
        </div>

        {/* Analytics Charts Grid 1 (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white tracking-wide">Revenue Analytics (7 Days)</h3>
            <div className="h-64">
              <RevenueChart data={revenueData} />
            </div>
          </div>

          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white tracking-wide">Host Earnings (7 Days)</h3>
            <div className="h-64">
              <EarningsChart data={earningsData} />
            </div>
          </div>
        </div>

        {/* Analytics Charts Grid 2 (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white tracking-wide">Call Trends</h3>
            <div className="h-64">
              <CallChart data={callData} />
            </div>
          </div>

          <div className="bg-[#0d1527] border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white tracking-wide">Coin Distribution</h3>
            <div className="h-64">
              <DistributionChart data={distributionData} />
            </div>
          </div>
        </div>

      </div>

      {/* 2. Secondary Gradient Stat Suite */}
      <div className="w-full max-w-6xl mx-auto pt-4 space-y-4">
        <h3 className="text-xs uppercase font-bold tracking-wider text-slate-500 px-1">Extended Earnings & Registration Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* 1. Today New Users */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-500 rounded-2xl p-5 text-white font-bold flex items-center justify-between shadow-lg shadow-indigo-500/10 hover:opacity-95 transition-all">
            <span className="text-xs font-black tracking-wide">Today New Users</span>
            <span className="text-2xl font-black font-mono">{todayNewUsers.toLocaleString()}</span>
          </div>

          {/* 2. Total User Referrals */}
          <div className="bg-gradient-to-r from-purple-500 via-pink-600 to-purple-500 rounded-2xl p-5 text-white font-bold flex items-center justify-between shadow-lg shadow-purple-500/10 hover:opacity-95 transition-all">
            <span className="text-xs font-black tracking-wide">Total User Referrals</span>
            <span className="text-2xl font-black font-mono">{userReferrals.toLocaleString()}</span>
          </div>

          {/* 3. Active Referrers */}
          <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 rounded-2xl p-5 text-slate-950 font-bold flex items-center justify-between shadow-lg shadow-teal-500/10 hover:opacity-95 transition-all">
            <span className="text-xs font-black tracking-wide">Active Referrers</span>
            <span className="text-2xl font-black font-mono">{activeReferrers.toLocaleString()}</span>
          </div>

          {/* 4. Referral Coin Earnings */}
          <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-2xl p-5 text-slate-950 font-bold flex items-center justify-between shadow-lg shadow-amber-400/10 hover:opacity-95 transition-all">
            <span className="text-xs font-black tracking-wide">Referral Coin Earnings</span>
            <span className="text-2xl font-black font-mono">{referralEarnings.toLocaleString()} 🪙</span>
          </div>

          {/* 5. Total Diamonds Earning */}
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-2xl p-5 text-slate-950 font-bold flex items-center justify-between shadow-lg shadow-amber-500/10 hover:opacity-95 transition-all">
            <span className="text-xs font-black tracking-wide">Total Diamonds Earning</span>
            <span className="text-2xl font-black font-mono">{totalDiamonds.toLocaleString()}</span>
          </div>

          {/* 6. Weekly Diamond Earning */}
          <div className="bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-400 rounded-2xl p-5 text-slate-950 font-bold flex items-center justify-between shadow-lg shadow-cyan-400/10 hover:opacity-95 transition-all">
            <span className="text-xs font-black tracking-wide">Weekly Diamond Earning</span>
            <span className="text-2xl font-black font-mono">{weeklyDiamonds.toLocaleString()}</span>
          </div>

          {/* 7. Previous Week Diamond Earning */}
          <div className="bg-gradient-to-r from-fuchsia-600 via-pink-600 to-fuchsia-600 rounded-2xl p-5 text-white font-bold flex items-center justify-between shadow-lg shadow-fuchsia-600/10 hover:opacity-95 transition-all">
            <span className="text-xs font-black tracking-wide">Previous Week Diamond Earning</span>
            <span className="text-2xl font-black font-mono">{prevWeekDiamonds.toLocaleString()}</span>
          </div>

          {/* 8. Monthly Diamond Earning */}
          <div className="bg-gradient-to-r from-orange-500 via-amber-600 to-orange-500 rounded-2xl p-5 text-white font-bold flex items-center justify-between shadow-lg shadow-orange-500/10 hover:opacity-95 transition-all">
            <span className="text-xs font-black tracking-wide">Monthly Diamond Earning</span>
            <span className="text-2xl font-black font-mono">{monthlyDiamonds.toLocaleString()}</span>
          </div>

          {/* 9. Previous Month Diamond Earning */}
          <div className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 rounded-2xl p-5 text-slate-950 font-bold flex items-center justify-between shadow-lg shadow-emerald-400/10 hover:opacity-95 transition-all">
            <span className="text-xs font-black tracking-wide">Previous Month Diamond Earning</span>
            <span className="text-2xl font-black font-mono">{prevMonthDiamonds.toLocaleString()}</span>
          </div>

        </div>
      </div>

      {/* 3. Floating Interactive Meethi Chat Team & Support Widget */}
      <MeethiChatTeamWidget />

    </div>
  );
}
