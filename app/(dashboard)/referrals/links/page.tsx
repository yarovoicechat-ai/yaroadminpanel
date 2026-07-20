'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Copy, Check, Users, Link2, Share2, Award, Briefcase, Video, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ReferralLinks() {
  const { user } = useAuth();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Base domains (Could be configurable via global settings)
  const hostDomain = 'host.meethichat.live';
  const agencyDomain = 'agency.meethichat.live';
  const adminDomain = 'admin.meethichat.live';
  const operatorDomain = 'operator.meethichat.live';
  const sellerDomain = 'seller.meethichat.live';
  const supportDomain = 'support.meethichat.live';

  const referralCode = user?.meethiId || user?.id?.substring(18).toUpperCase() || 'AGY8X92';

  const links = [
    {
      role: 'Admin',
      desc: 'Recruit sub-administrators directly under your organization.',
      url: `https://${adminDomain}/?referrer=${referralCode}&role=admin`,
      icon: Briefcase,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
    },
    {
      role: 'Host',
      desc: 'Sign up new hosts under your agency hierarchy automatically.',
      url: `https://${hostDomain}/?referrer=${referralCode}&role=host`,
      icon: Video,
      color: 'text-lime-400 border-lime-500/20 bg-lime-500/5'
    },
    {
      role: 'Agency',
      desc: 'Recruit sub-agencies. They inherit you as their parent node.',
      url: `https://${agencyDomain}/?referrer=${referralCode}&role=agency`,
      icon: Briefcase,
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/5'
    },
    {
      role: 'Operator',
      desc: 'Link operators directly to your organization.',
      url: `https://${operatorDomain}/?referrer=${referralCode}&role=operator`,
      icon: Key,
      color: 'text-purple-400 border-purple-500/20 bg-purple-500/5'
    },
    {
      role: 'Coin Seller',
      desc: 'Register subordinate coin sellers.',
      url: `https://${sellerDomain}/?referrer=${referralCode}&role=coinSeller`,
      icon: Award,
      color: 'text-rose-400 border-rose-500/20 bg-rose-500/5'
    }
  ];

  const handleCopy = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    toast.success(`${key} link copied to clipboard.`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Referral Link Generator
          </h2>
          <p className="text-muted-foreground mt-1">Distribute customized links for automatic parent hierarchy linkages</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Referral Status Card */}
        <Card className="glass-card md:col-span-1 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Your Referral Info
            </CardTitle>
            <CardDescription>Use this unique key to distribute links</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-5 bg-slate-950 border border-slate-900 rounded-xl text-center shadow-inner">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Your Referral Code</span>
              <p className="text-2xl font-black text-slate-100 tracking-widest mt-1 select-all">{referralCode}</p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-400">
              <p className="font-bold text-slate-200">Enforced Hierarchy Rules:</p>
              <p className="leading-relaxed">When candidates register using these referral URLs, the system bypasses manual parenting options. Hosts will automatically join your agency, and agencies will link under your employee hierarchy node.</p>
            </div>
          </CardContent>
        </Card>

        {/* Links Grid */}
        <div className="md:col-span-2 space-y-4">
          {links.map(link => {
            const LinkIcon = link.icon;
            return (
              <div
                key={link.role}
                className="p-5 bg-slate-900 border border-slate-850 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 border rounded-xl shrink-0 ${link.color}`}>
                    <LinkIcon size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-200">{link.role} Form URL</h4>
                    <p className="text-xs text-slate-500 leading-normal max-w-md">{link.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={link.url}
                    className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-slate-400 font-mono w-48 sm:w-64 truncate select-all focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopy(link.url, link.role)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 shrink-0"
                    title="Copy URL"
                  >
                    {copiedKey === link.role ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
