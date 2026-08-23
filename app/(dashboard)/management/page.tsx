'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Crown,
  Share2,
  Gift,
  Download,
  ShieldCheck,
  Ban,
  Layers,
  Users,
  Video,
  DollarSign,
  Activity,
  ArrowUpRight,
  Sparkles,
  Settings,
  ShieldAlert,
  Coins,
  Server
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export default function ManagementDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHosts: 0,
    totalReferrals: 0,
    activeGifts: 0,
    totalBanners: 0,
    systemStatus: 'ONLINE',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagementOverview();
  }, []);

  const fetchManagementOverview = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/admin/dashboard');
      if (res && res.success && res.data) {
        setStats({
          totalUsers: res.data.totalUsers || 0,
          totalHosts: res.data.totalHosts || 0,
          totalReferrals: res.data.totalReferrals || 0,
          activeGifts: res.data.activeGifts || 0,
          totalBanners: res.data.totalBanners || 0,
          systemStatus: 'ONLINE',
        });
      }
    } catch (err) {
      console.warn('Management overview fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-1 sm:p-2">
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-900/60 via-purple-900/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 font-extrabold text-xs tracking-wider uppercase">
              <Crown className="w-3.5 h-3.5 text-amber-400" /> Executive Console
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              App Management Panel
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Central command center for Meethi Chat live video app, referral coin economy, gift asset uploads, security controls, and host settlements.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/app-releases">
              <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs px-4 py-5 rounded-2xl shadow-xl flex items-center gap-2 border-none">
                <Download className="w-4 h-4" /> Download Latest APK (v1.8.5)
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Live System Health Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card glass className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Status</p>
              <p className="text-lg font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE (100%)
              </p>
            </div>
            <Server className="w-7 h-7 text-emerald-400 opacity-80" />
          </CardContent>
        </Card>

        <Card glass className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Referral Reward</p>
              <p className="text-lg font-black text-amber-400 mt-1 flex items-center gap-1">
                🪙 50 Coins Max
              </p>
            </div>
            <Coins className="w-7 h-7 text-amber-400 opacity-80" />
          </CardContent>
        </Card>

        <Card glass className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gift Asset Format</p>
              <p className="text-lg font-black text-cyan-400 mt-1">
                SVGA / GIF / PNG
              </p>
            </div>
            <Gift className="w-7 h-7 text-cyan-400 opacity-80" />
          </CardContent>
        </Card>

        <Card glass className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">App Version</p>
              <p className="text-lg font-black text-pink-400 mt-1">
                v1.8.5 Production
              </p>
            </div>
            <Sparkles className="w-7 h-7 text-pink-400 opacity-80" />
          </CardContent>
        </Card>
      </div>

      {/* Primary Management Operations Grid */}
      <div>
        <h3 className="text-xl font-extrabold text-slate-100 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-pink-400" /> Management Modules
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Gift Management */}
          <Card glass className="bg-slate-900/60 border-slate-800 hover:border-pink-500/50 transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-400">
                  <Gift className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-pink-400 border-pink-500/30 text-[10px] uppercase font-bold">
                  Economy
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-slate-100 mt-3 group-hover:text-pink-300 transition-colors">
                Gifts & Assets Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload gift icon images (.png) & full-screen SVGA/GIF animation files directly. Set coin prices & categories.
              </p>
              <Link href="/gifts" className="block">
                <Button className="w-full bg-slate-800 hover:bg-pink-600 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-between transition-all border-none">
                  <span>Manage Gifts & Upload Files</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 2: Refer & Earn System */}
          <Card glass className="bg-slate-900/60 border-slate-800 hover:border-amber-500/50 transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Share2 className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-[10px] uppercase font-bold">
                  2-Phase System
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-slate-100 mt-3 group-hover:text-amber-300 transition-colors">
                User Refer & Earn System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Audit 2-phase Coin rewards (+25 Coins on signup + +25 Coins on 5 min call). Trigger manual reconciliation & monitor risk levels.
              </p>
              <Link href="/referrals" className="block">
                <Button className="w-full bg-slate-800 hover:bg-amber-600 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-between transition-all border-none">
                  <span>Open Referral Console</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 3: Banners Carousel */}
          <Card glass className="bg-slate-900/60 border-slate-800 hover:border-purple-500/50 transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                  <Layers className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-purple-400 border-purple-500/30 text-[10px] uppercase font-bold">
                  Content
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-slate-100 mt-3 group-hover:text-purple-300 transition-colors">
                Banners & Sliders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Create & schedule home carousel banner sliders, set tap actions (App Screen vs Website URL), and priority ordering.
              </p>
              <Link href="/banners" className="block">
                <Button className="w-full bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-between transition-all border-none">
                  <span>Manage Home Banners</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 4: Device & Account Security */}
          <Card glass className="bg-slate-900/60 border-slate-800 hover:border-rose-500/50 transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
                  <Ban className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-rose-400 border-rose-500/30 text-[10px] uppercase font-bold">
                  Security
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-slate-100 mt-3 group-hover:text-rose-300 transition-colors">
                Device Limits & Bans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Enforce device-level registration limits (Max 2 accounts/device) & ban fraudulent hardware IDs or user accounts instantly.
              </p>
              <Link href="/bans/device" className="block">
                <Button className="w-full bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-between transition-all border-none">
                  <span>Manage Device Bans</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 5: Host & Level Management */}
          <Card glass className="bg-slate-900/60 border-slate-800 hover:border-cyan-500/50 transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <Video className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-cyan-400 border-cyan-500/30 text-[10px] uppercase font-bold">
                  Hosts & Levels
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-slate-100 mt-3 group-hover:text-cyan-300 transition-colors">
                Hosts & Level System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Manage host verification, call rate rules per minute, agency assignments, and host level thresholds.
              </p>
              <Link href="/hosts" className="block">
                <Button className="w-full bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-between transition-all border-none">
                  <span>Manage Hosts & Levels</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Card 6: App Releases (APK) */}
          <Card glass className="bg-slate-900/60 border-slate-800 hover:border-emerald-500/50 transition-all group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Download className="w-6 h-6" />
                </div>
                <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px] uppercase font-bold">
                  Deploy
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-slate-100 mt-3 group-hover:text-emerald-300 transition-colors">
                App Releases (APK / AAB)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload new production Android APK/AAB builds, manage in-app forced update versions, and changelog release notes.
              </p>
              <Link href="/app-releases" className="block">
                <Button className="w-full bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-between transition-all border-none">
                  <span>App Releases Hub</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
