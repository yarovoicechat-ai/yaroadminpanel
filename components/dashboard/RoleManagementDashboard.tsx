'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BadgeCheck,
  Building2,
  CalendarDays,
  Clock3,
  Gem,
  Headphones,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
  Sparkles,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { CallChart, DistributionChart, EarningsChart, RevenueChart } from './Charts';

type DashboardStats = {
  totalUsers?: number;
  activeUsers?: number;
  activeHosts?: number;
  activeCalls?: number;
  roles?: {
    superAdmin?: number;
    admin?: number;
    agency?: number;
    host?: number;
    customerSupport?: number;
  };
  requests?: { pending?: number; approved?: number; rejected?: number; total?: number };
  registrations?: { today?: number; weekly?: number; monthly?: number };
  hostRegistrations?: { today?: number; weekly?: number; monthly?: number };
  referrals?: { totalReferrals?: number; totalDiamondsGranted?: number };
  stats?: {
    callsToday?: number;
    minutesToday?: number;
    coinsSpentToday?: number;
    uniqueHostsActiveToday?: number;
    hostEarningsToday?: number;
    revenueToday?: number;
  };
};

type ProfileData = {
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  image?: string;
  profilePhoto?: string;
  employeeCode?: string;
  referralCode?: string;
  specialCode?: string;
  meethiId?: string;
  diamonds?: number;
};

type Metric = {
  label: string;
  value: number | string;
  hint: string;
  gradient: string;
  glow: string;
  icon: typeof Users;
};

const numberValue = (value: unknown) => Number(value || 0);
const formatNumber = (value: number) => value.toLocaleString('en-IN', { maximumFractionDigits: 2 });

const roleConfig = {
  superAdmin: {
    title: 'Super Admin',
    codeLabel: 'Super Admin Code',
    scope: 'Admins, agencies, hosts and customer support in your branch',
  },
  admin: {
    title: 'Admin',
    codeLabel: 'Admin Code',
    scope: 'Agencies, hosts and customer support in your team',
  },
  agency: {
    title: 'Agency',
    codeLabel: 'Agency Code',
    scope: 'Hosts registered under your agency network',
  },
  owner: {
    title: 'Platform Owner',
    codeLabel: 'Owner Code',
    scope: 'Complete platform and operational network',
  },
  operator: {
    title: 'Operator',
    codeLabel: 'Operator Code',
    scope: 'Operational network assigned to your account',
  },
} as const;

export function RoleManagementDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [profile, setProfile] = useState<ProfileData>({});
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [earningsData, setEarningsData] = useState<any[]>([]);
  const [callData, setCallData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    const [statsRes, profileRes, revenueRes, earningsRes, callsRes, distributionRes] = await Promise.all([
      apiClient.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS).catch(() => null),
      apiClient.get<ProfileData>(API_ENDPOINTS.ADMIN.PROFILE).catch(() => null),
      apiClient.get<any[]>(API_ENDPOINTS.DASHBOARD.REVENUE_CHART, { days: 7 }).catch(() => null),
      apiClient.get<any[]>(API_ENDPOINTS.DASHBOARD.EARNINGS_CHART, { days: 60 }).catch(() => null),
      apiClient.get<any[]>(API_ENDPOINTS.DASHBOARD.CALL_TRENDS, { days: 7 }).catch(() => null),
      apiClient.get<any[]>(API_ENDPOINTS.DASHBOARD.COIN_DISTRIBUTION).catch(() => null),
    ]);

    if (statsRes?.data) setStats(statsRes.data);
    if (profileRes?.data) setProfile(profileRes.data);
    if (revenueRes?.data) setRevenueData(revenueRes.data);
    if (earningsRes?.data) setEarningsData(earningsRes.data);
    if (callsRes?.data) setCallData(callsRes.data);
    if (distributionRes?.data) setDistributionData(distributionRes.data);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const rawRole = String(user?.role || 'admin');
  const normalizedRole = ['superAdmin', 'super-admin', 'superadmin'].includes(rawRole) ? 'superAdmin' : rawRole;
  const config = roleConfig[normalizedRole as keyof typeof roleConfig] || roleConfig.admin;
  const displayName = profile.name || user?.name || config.title;
  const email = profile.email || user?.email || 'Not provided';
  const phone = profile.whatsappNumber || profile.phoneNumber || profile.phone || 'Not provided';
  const code = profile.employeeCode || profile.referralCode || profile.specialCode || profile.meethiId || user?.employeeCode || user?.referralCode || user?.specialCode || user?.meethiId || 'Not assigned';
  const avatar = profile.image || profile.profilePhoto;
  const initials = displayName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'YA';

  const earnings = useMemo(
    () => [...earningsData].sort((a, b) => String(a.date).localeCompare(String(b.date))),
    [earningsData],
  );
  const sumPeriod = (fromEnd: number, count: number) => earnings
    .slice(Math.max(0, earnings.length - fromEnd), Math.max(0, earnings.length - fromEnd + count))
    .reduce((total, item) => total + numberValue(item.earnings), 0);

  const weeklyEarnings = sumPeriod(7, 7);
  const previousWeekEarnings = sumPeriod(14, 7);
  const monthlyEarnings = sumPeriod(30, 30);
  const previousMonthEarnings = sumPeriod(60, 30);
  const diamondBalance = numberValue(profile.diamonds ?? stats.referrals?.totalDiamondsGranted);

  const metrics = useMemo<Metric[]>(() => {
    const base: Metric[] = [
      { label: 'Diamond Balance', value: formatNumber(diamondBalance), hint: 'Current account balance', gradient: 'from-amber-500/20 to-orange-500/5', glow: 'text-amber-400 border-amber-500/30', icon: Gem },
      { label: 'Weekly Host Earnings', value: formatNumber(weeklyEarnings), hint: 'Latest 7 days', gradient: 'from-cyan-500/20 to-blue-500/5', glow: 'text-cyan-400 border-cyan-500/30', icon: Activity },
      { label: 'Previous Week Earnings', value: formatNumber(previousWeekEarnings), hint: 'Prior 7-day period', gradient: 'from-violet-500/20 to-indigo-500/5', glow: 'text-violet-400 border-violet-500/30', icon: CalendarDays },
      { label: 'Monthly Host Earnings', value: formatNumber(monthlyEarnings), hint: 'Latest 30 days', gradient: 'from-emerald-500/20 to-teal-500/5', glow: 'text-emerald-400 border-emerald-500/30', icon: TrendingUp },
      { label: 'Previous Month Earnings', value: formatNumber(previousMonthEarnings), hint: 'Previous 30 days', gradient: 'from-teal-500/20 to-cyan-500/5', glow: 'text-teal-400 border-teal-500/30', icon: CalendarDays },
      { label: 'New Hosts', value: numberValue(stats.hostRegistrations?.monthly), hint: 'Registered in 30 days', gradient: 'from-pink-500/20 to-rose-500/5', glow: 'text-pink-400 border-pink-500/30', icon: UserRound },
      { label: 'Total Hosts', value: numberValue(stats.roles?.host), hint: 'In your hierarchy', gradient: 'from-sky-500/20 to-indigo-500/5', glow: 'text-sky-400 border-sky-500/30', icon: Users },
    ];

    if (normalizedRole === 'superAdmin' || normalizedRole === 'owner' || normalizedRole === 'operator') {
      base.push(
        { label: 'Total Admins', value: numberValue(stats.roles?.admin), hint: 'In your branch', gradient: 'from-indigo-500/20 to-violet-500/5', glow: 'text-indigo-400 border-indigo-500/30', icon: ShieldCheck },
        { label: 'Total Agencies', value: numberValue(stats.roles?.agency), hint: 'Managed agencies', gradient: 'from-teal-500/20 to-emerald-500/5', glow: 'text-teal-400 border-teal-500/30', icon: Building2 },
        { label: 'Customer Support', value: numberValue(stats.roles?.customerSupport), hint: 'Support team members', gradient: 'from-pink-500/20 to-purple-500/5', glow: 'text-pink-400 border-pink-500/30', icon: Headphones },
      );
    } else if (normalizedRole === 'admin') {
      base.push(
        { label: 'Total Agencies', value: numberValue(stats.roles?.agency), hint: 'In your team', gradient: 'from-indigo-500/20 to-violet-500/5', glow: 'text-indigo-400 border-indigo-500/30', icon: Building2 },
        { label: 'Customer Support', value: numberValue(stats.roles?.customerSupport), hint: 'In your team', gradient: 'from-teal-500/20 to-emerald-500/5', glow: 'text-teal-400 border-teal-500/30', icon: Headphones },
        { label: 'Pending Requests', value: numberValue(stats.requests?.pending), hint: 'Awaiting workflow action', gradient: 'from-amber-500/20 to-rose-500/5', glow: 'text-amber-400 border-amber-500/30', icon: Clock3 },
      );
    } else if (normalizedRole === 'agency') {
      base.push(
        { label: 'Active Hosts', value: numberValue(stats.activeHosts), hint: 'Approved hosts', gradient: 'from-indigo-500/20 to-violet-500/5', glow: 'text-indigo-400 border-indigo-500/30', icon: BadgeCheck },
        { label: 'Hosts Active Today', value: numberValue(stats.stats?.uniqueHostsActiveToday), hint: 'Call activity today', gradient: 'from-teal-500/20 to-emerald-500/5', glow: 'text-teal-400 border-teal-500/30', icon: Activity },
        { label: 'Calls Today', value: numberValue(stats.stats?.callsToday), hint: `${formatNumber(numberValue(stats.stats?.minutesToday))} total minutes`, gradient: 'from-pink-500/20 to-rose-500/5', glow: 'text-pink-400 border-pink-500/30', icon: Phone },
      );
    }

    return base;
  }, [diamondBalance, monthlyEarnings, normalizedRole, previousMonthEarnings, previousWeekEarnings, stats, weeklyEarnings]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
        <div className="h-56 rounded-3xl bg-slate-900/60 border border-white/10" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl bg-slate-900/60 border border-white/10" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 text-slate-100 pb-12">
      {/* Hero Profile Card */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-[#0d1222]/90 to-[#070a13]/95 backdrop-blur-2xl shadow-2xl shadow-black/60">
        <div className="flex flex-col gap-6 border-b border-white/10 p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="relative">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[2px] shadow-2xl shadow-indigo-500/30">
              <div className="h-full w-full rounded-[22px] bg-slate-950 flex items-center justify-center font-black text-2xl text-cyan-300">
                {avatar ? <img src={avatar} alt={displayName} className="h-full w-full object-cover" /> : initials}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-3 border-[#070a13] shadow-md animate-pulse" />
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300 shadow-sm shadow-cyan-500/10">
                <BadgeCheck className="h-3.5 w-3.5" /> {config.title}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live Operational Network
              </span>
            </div>
            <h1 className="text-2xl font-black text-white sm:text-3xl tracking-tight">{displayName}</h1>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-400">{config.scope}</p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            disabled={refreshing}
            title="Refresh dashboard"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 transition-all hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-300 disabled:opacity-50 shadow-md"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Profile Field Strip */}
        <div className="grid grid-cols-1 divide-y divide-white/5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4 bg-black/20">
          <ProfileField icon={UserRound} label="Account Name" value={displayName} />
          <ProfileField icon={ShieldCheck} label={config.codeLabel} value={code} />
          <ProfileField icon={Phone} label="WhatsApp Contact" value={phone} />
          <ProfileField icon={Mail} label="Email Address" value={email} />
        </div>
      </section>

      {/* Performance Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <h2 className="text-xl font-black text-white tracking-tight">Performance Metrics</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Real-time metrics scoped to your administrative clearance.</p>
        </div>
        {lastUpdated && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article
              key={metric.label}
              className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${metric.gradient} bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl shadow-black/40 hover:border-white/20 hover:scale-[1.01] transition-all duration-300`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{metric.label}</p>
                  <p className="mt-2 text-3xl font-black text-white tracking-tight leading-none">{metric.value}</p>
                  <p className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3 text-cyan-400" />
                    <span>{metric.hint}</span>
                  </p>
                </div>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${metric.glow} bg-slate-950/70 shadow-inner`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Quick Summary Pill Bar */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl shadow-xl shadow-black/20">
        <CompactStat label="Active Users" value={stats.activeUsers} glow="text-cyan-400" />
        <CompactStat label="New Registrations" value={stats.registrations?.today} glow="text-emerald-400" />
        <CompactStat label="Approved Requests" value={stats.requests?.approved} glow="text-violet-400" />
        <CompactStat label="Pending Requests" value={stats.requests?.pending} glow="text-amber-400" />
      </section>

      {/* Visual Analytics Charts */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartPanel title="Revenue Trend" subtitle="Net financial volume over the past 7 days">
          <RevenueChart data={revenueData} />
        </ChartPanel>
        <ChartPanel title="Host Earnings Velocity" subtitle="Disbursed earnings recorded across the last 60 days">
          <EarningsChart data={earningsData} />
        </ChartPanel>
        <ChartPanel title="Call Traffic & Duration" subtitle="Live voice call frequency and aggregate minutes">
          <CallChart data={callData} />
        </ChartPanel>
        <ChartPanel title="In-App Currency Distribution" subtitle="Active coin distribution across the hierarchy">
          <DistributionChart data={distributionData} />
        </ChartPanel>
      </section>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3.5 px-6 py-4.5">
      <div className="h-9 w-9 rounded-xl border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="truncate text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function CompactStat({ label, value, glow }: { label: string; value?: number; glow: string }) {
  return (
    <div className="px-3 py-2">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-2xl font-black ${glow} tracking-tight`}>
        {numberValue(value).toLocaleString('en-IN')}
      </p>
    </div>
  );
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-2xl shadow-black/40">
      <div className="mb-5 flex flex-col gap-1">
        <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
      <div className="h-64">{children}</div>
    </article>
  );
}
