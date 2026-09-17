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
  color: string;
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
  const initials = displayName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'MC';

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
      { label: 'Diamond Balance', value: formatNumber(diamondBalance), hint: 'Current account balance', color: 'bg-amber-400 text-slate-950', icon: Gem },
      { label: 'Weekly Host Earnings', value: formatNumber(weeklyEarnings), hint: 'Latest 7 days', color: 'bg-cyan-600 text-white', icon: Activity },
      { label: 'Previous Week Earnings', value: formatNumber(previousWeekEarnings), hint: 'Prior 7-day period', color: 'bg-fuchsia-600 text-white', icon: CalendarDays },
      { label: 'Monthly Host Earnings', value: formatNumber(monthlyEarnings), hint: 'Latest 30 days', color: 'bg-orange-500 text-white', icon: Activity },
      { label: 'Previous Month Earnings', value: formatNumber(previousMonthEarnings), hint: 'Previous 30 days', color: 'bg-emerald-500 text-slate-950', icon: CalendarDays },
      { label: 'New Hosts', value: numberValue(stats.hostRegistrations?.monthly), hint: 'Registered in 30 days', color: 'bg-rose-500 text-white', icon: UserRound },
      { label: 'Total Hosts', value: numberValue(stats.roles?.host), hint: 'In your hierarchy', color: 'bg-sky-600 text-white', icon: Users },
    ];

    if (normalizedRole === 'superAdmin' || normalizedRole === 'owner' || normalizedRole === 'operator') {
      base.push(
        { label: 'Total Admins', value: numberValue(stats.roles?.admin), hint: 'In your branch', color: 'bg-indigo-600 text-white', icon: ShieldCheck },
        { label: 'Total Agencies', value: numberValue(stats.roles?.agency), hint: 'Managed agencies', color: 'bg-teal-500 text-slate-950', icon: Building2 },
        { label: 'Customer Support', value: numberValue(stats.roles?.customerSupport), hint: 'Support team members', color: 'bg-pink-600 text-white', icon: Headphones },
      );
    } else if (normalizedRole === 'admin') {
      base.push(
        { label: 'Total Agencies', value: numberValue(stats.roles?.agency), hint: 'In your team', color: 'bg-indigo-600 text-white', icon: Building2 },
        { label: 'Customer Support', value: numberValue(stats.roles?.customerSupport), hint: 'In your team', color: 'bg-teal-500 text-slate-950', icon: Headphones },
        { label: 'Pending Requests', value: numberValue(stats.requests?.pending), hint: 'Awaiting workflow action', color: 'bg-pink-600 text-white', icon: Clock3 },
      );
    } else if (normalizedRole === 'agency') {
      base.push(
        { label: 'Active Hosts', value: numberValue(stats.activeHosts), hint: 'Approved hosts', color: 'bg-indigo-600 text-white', icon: BadgeCheck },
        { label: 'Hosts Active Today', value: numberValue(stats.stats?.uniqueHostsActiveToday), hint: 'Call activity today', color: 'bg-teal-500 text-slate-950', icon: Activity },
        { label: 'Calls Today', value: numberValue(stats.stats?.callsToday), hint: `${formatNumber(numberValue(stats.stats?.minutesToday))} total minutes`, color: 'bg-pink-600 text-white', icon: Phone },
      );
    }

    return base;
  }, [diamondBalance, monthlyEarnings, normalizedRole, previousMonthEarnings, previousWeekEarnings, stats, weeklyEarnings]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-4 animate-pulse">
        <div className="h-56 rounded-lg bg-slate-900" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-28 rounded-lg bg-slate-900" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-slate-100">
      <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
        <div className="flex flex-col gap-5 border-b border-slate-800 px-5 py-6 sm:flex-row sm:items-center sm:px-7">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-slate-700 bg-slate-800 text-2xl font-black text-cyan-300">
            {avatar ? <img src={avatar} alt={displayName} className="h-full w-full object-cover" /> : initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-300 ring-1 ring-cyan-500/30">
                <BadgeCheck className="h-3.5 w-3.5" /> {config.title}
              </span>
              <span className="text-xs text-slate-500">Live hierarchy dashboard</span>
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{displayName}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">{config.scope}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            disabled={refreshing}
            title="Refresh dashboard"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:border-cyan-500 hover:text-cyan-300 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 divide-y divide-slate-800 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
          <ProfileField icon={UserRound} label="Account Name" value={displayName} />
          <ProfileField icon={ShieldCheck} label={config.codeLabel} value={code} />
          <ProfileField icon={Phone} label="WhatsApp Number" value={phone} />
          <ProfileField icon={Mail} label="Email Address" value={email} />
        </div>
      </section>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">Performance overview</h2>
          <p className="text-xs text-slate-500">Metrics are limited to your assigned hierarchy.</p>
        </div>
        {lastUpdated && <p className="text-[11px] text-slate-500">Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>}
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className={`${metric.color} min-h-28 rounded-lg p-5 shadow-lg`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight">{metric.label}</p>
                  <p className="mt-2 text-3xl font-black leading-none">{metric.value}</p>
                  <p className="mt-2 text-xs font-semibold opacity-75">{metric.hint}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/10">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-2 gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4 sm:grid-cols-4">
        <CompactStat label="Active users" value={stats.activeUsers} />
        <CompactStat label="New registrations" value={stats.registrations?.today} />
        <CompactStat label="Approved requests" value={stats.requests?.approved} />
        <CompactStat label="Pending requests" value={stats.requests?.pending} />
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartPanel title="Revenue trend" subtitle="Last 7 days"><RevenueChart data={revenueData} /></ChartPanel>
        <ChartPanel title="Host earnings" subtitle="Last 60 days"><EarningsChart data={earningsData} /></ChartPanel>
        <ChartPanel title="Call activity" subtitle="Last 7 days"><CallChart data={callData} /></ChartPanel>
        <ChartPanel title="Coin distribution" subtitle="Current hierarchy"><DistributionChart data={distributionData} /></ChartPanel>
      </section>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 px-5 py-4">
      <Icon className="h-4 w-4 shrink-0 text-cyan-400" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase text-slate-500">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-200">{value}</p>
      </div>
    </div>
  );
}

function CompactStat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="px-2 py-1">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{numberValue(value).toLocaleString('en-IN')}</p>
    </div>
  );
}

function ChartPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900 p-5 shadow-lg">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
      <div className="h-64">{children}</div>
    </article>
  );
}
