'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { toast } from 'sonner';
import { User, Clock, Bell, Gem, Calendar, Users, TrendingUp, Sparkles, Phone, Mail, Award, ShieldCheck, Camera, Edit2, Check } from 'lucide-react';
import { MeethiChatTeamWidget } from './MeethiChatTeamWidget';

export function MeethiChatStyleDashboard() {
  const { user, updateUserDP, updateUserPhone } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [dbProfile, setDbProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, profileRes] = await Promise.all([
          apiClient.get<any>('/analytics/dashboard').catch(() => null),
          apiClient.get<any>(API_ENDPOINTS.ADMIN.PROFILE).catch(() => null)
        ]);
        if (statsRes) setStats((statsRes as any).data || statsRes);
        if (profileRes) setDbProfile((profileRes as any).data || profileRes);
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
    <div className="relative min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6 font-sans">
      
      {/* 1. Header Profile & Team Info Card */}
      <div className="w-full max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 md:p-8 relative">
        <div className="absolute top-4 right-4 flex items-center gap-3 text-slate-400 dark:text-slate-500 text-xs font-mono">
          <button className="hover:text-slate-200 transition-colors p-1" title="Clock History">
            <Clock className="w-4 h-4" />
          </button>
          <button className="hover:text-slate-200 transition-colors p-1 relative" title="Notifications">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500" />
          </button>
          <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full text-[11px]">
            EMP-{userCode}
          </span>
        </div>

        {/* Profile Avatar with DP Change Button */}
        <div className="flex flex-col items-center pt-2">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shadow-inner overflow-hidden">
              {(user as any)?.profilePhoto || (user as any)?.avatar ? (
                <img src={(user as any)?.profilePhoto || (user as any)?.avatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>
            <label htmlFor="dashboard-dp-upload" className="absolute inset-0 bg-slate-950/70 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-5 h-5 mb-0.5 text-pink-400" />
              <span className="text-[9px] font-bold">Edit DP</span>
            </label>
            <input
              id="dashboard-dp-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const result = reader.result as string;
                    updateUserDP(result);
                    toast.success("Profile DP updated successfully!");
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>

          <h2 className="text-xl font-bold mt-4 text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{userName}</span>
            <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{roleDisplay}</span>
          </h2>
        </div>

        {/* Info Grid */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 max-w-xl mx-auto space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
            <span className="font-semibold text-slate-500">Name:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{userName}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
            <span className="font-semibold text-slate-500">Team Leader Code:</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{userCode}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/50">
            <span className="font-semibold text-slate-500">Whatsapp Number:</span>
            {isEditingPhone ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Enter phone/WhatsApp"
                  className="bg-slate-900 border border-indigo-500/50 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none w-40"
                  autoFocus
                />
                <button
                  onClick={() => {
                    if (phoneInput.trim()) {
                      updateUserPhone(phoneInput.trim());
                      toast.success('WhatsApp number updated!');
                    }
                    setIsEditingPhone(false);
                  }}
                  className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
                  title="Save Number"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{whatsappNumber}</span>
                <button
                  onClick={() => {
                    setPhoneInput(whatsappNumber !== '07234816631' ? whatsappNumber : '');
                    setIsEditingPhone(true);
                  }}
                  className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                  title="Edit WhatsApp Number"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="font-semibold text-slate-500">Official Email:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{userEmail}</span>
          </div>
        </div>
      </div>

      {/* 2. Vibrant Gradient Stat Boxes */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* 1. Today New Users */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-500 rounded-2xl p-5 text-white font-bold flex items-center justify-between shadow-lg shadow-indigo-500/10 hover:opacity-95 transition-all">
          <span className="text-sm font-black tracking-wide">Today New Users</span>
          <span className="text-3xl font-black font-mono">{todayNewUsers.toLocaleString()}</span>
        </div>

        {/* 2. Total User Referrals */}
        <div className="bg-gradient-to-r from-purple-500 via-pink-600 to-purple-500 rounded-2xl p-5 text-white font-bold flex items-center justify-between shadow-lg shadow-purple-500/10 hover:opacity-95 transition-all">
          <span className="text-sm font-black tracking-wide">Total User Referrals</span>
          <span className="text-3xl font-black font-mono">{userReferrals.toLocaleString()}</span>
        </div>

        {/* 3. Active Referrers */}
        <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500 rounded-2xl p-5 text-slate-950 font-bold flex items-center justify-between shadow-lg shadow-teal-500/10 hover:opacity-95 transition-all">
          <span className="text-sm font-black tracking-wide">Active Referrers</span>
          <span className="text-3xl font-black font-mono">{activeReferrers.toLocaleString()}</span>
        </div>

        {/* 4. Referral Coin Earnings */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-400 rounded-2xl p-5 text-slate-950 font-bold flex items-center justify-between shadow-lg shadow-amber-400/10 hover:opacity-95 transition-all">
          <span className="text-sm font-black tracking-wide">Referral Coin Earnings</span>
          <span className="text-3xl font-black font-mono">{referralEarnings.toLocaleString()} 🪙</span>
        </div>

        {/* 5. Total Diamonds Earning */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-2xl p-5 text-slate-950 font-bold flex items-center justify-between shadow-lg shadow-amber-500/10 hover:opacity-95 transition-all">
          <span className="text-sm font-black tracking-wide">Total Diamonds Earning</span>
          <span className="text-3xl font-black font-mono">{totalDiamonds.toLocaleString()}</span>
        </div>

        {/* 6. Weekly Diamond Earning */}
        <div className="bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-400 rounded-2xl p-5 text-slate-950 font-bold flex items-center justify-between shadow-lg shadow-cyan-400/10 hover:opacity-95 transition-all">
          <span className="text-sm font-black tracking-wide">Weekly Diamond Earning</span>
          <span className="text-3xl font-black font-mono">{weeklyDiamonds.toLocaleString()}</span>
        </div>

        {/* 7. Previous Week Diamond Earning */}
        <div className="bg-gradient-to-r from-fuchsia-600 via-pink-600 to-fuchsia-600 rounded-2xl p-5 text-white font-bold flex items-center justify-between shadow-lg shadow-fuchsia-600/10 hover:opacity-95 transition-all">
          <span className="text-sm font-black tracking-wide">Previous Week Diamond Earning</span>
          <span className="text-3xl font-black font-mono">{prevWeekDiamonds.toLocaleString()}</span>
        </div>

        {/* 8. Monthly Diamond Earning */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-600 to-orange-500 rounded-2xl p-5 text-white font-bold flex items-center justify-between shadow-lg shadow-orange-500/10 hover:opacity-95 transition-all">
          <span className="text-sm font-black tracking-wide">Monthly Diamond Earning</span>
          <span className="text-3xl font-black font-mono">{monthlyDiamonds.toLocaleString()}</span>
        </div>

        {/* 9. Previous Month Diamond Earning */}
        <div className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 rounded-2xl p-5 text-slate-950 font-bold flex items-center justify-between shadow-lg shadow-emerald-400/10 hover:opacity-95 transition-all">
          <span className="text-sm font-black tracking-wide">Previous Month Diamond Earning</span>
          <span className="text-3xl font-black font-mono">{prevMonthDiamonds.toLocaleString()}</span>
        </div>

        {/* 10. Total New Hosts */}
        <div className="bg-gradient-to-r from-rose-500 via-purple-600 to-rose-500 rounded-2xl p-5 text-white font-bold flex items-center justify-between shadow-lg shadow-rose-500/10 hover:opacity-95 transition-all">
          <span className="text-sm font-black tracking-wide">Total New Hosts</span>
          <span className="text-3xl font-black font-mono">{totalNewHosts.toLocaleString()}</span>
        </div>

        {/* 11. Total Hosts */}
        <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 rounded-2xl p-5 text-white font-bold flex items-center justify-between shadow-lg shadow-blue-500/10 hover:opacity-95 transition-all sm:col-span-2">
          <span className="text-sm font-black tracking-wide">Total Hosts</span>
          <span className="text-3xl font-black font-mono">{totalHosts.toLocaleString()}</span>
        </div>

      </div>

      {/* 3. Floating Interactive Meethi Chat Team & Support Widget */}
      <MeethiChatTeamWidget />

    </div>
  );
}
