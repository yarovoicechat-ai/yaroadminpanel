'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  ShieldAlert,
  Video,
  Building2,
  Coins,
  DollarSign,
  Settings,
  HelpCircle,
  FileCheck,
  Terminal,
  Crown,
  Command,
  ArrowRight
} from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

interface SearchOption {
  title: string;
  category: string;
  href: string;
  icon: any;
  keywords?: string;
}

const commandOptions: SearchOption[] = [
  { title: 'User Management Directory', category: 'Users', href: '/users', icon: Users, keywords: 'user list account' },
  { title: 'Add New User', category: 'Users', href: '/users/add', icon: Users, keywords: 'create user new' },
  { title: 'Host Management Directory', category: 'Hierarchy', href: '/hosts', icon: Video, keywords: 'host live caller' },
  { title: 'Host Onboarding Requests', category: 'Hierarchy', href: '/hosts/request', icon: FileCheck, keywords: 'host approve pending' },
  { title: 'Agency Network', category: 'Hierarchy', href: '/agencies', icon: Building2, keywords: 'agency partner leader' },
  { title: 'Seller Portal', category: 'Hierarchy', href: '/seller', icon: Coins, keywords: 'coin seller stock agent' },
  { title: 'Operator Management', category: 'Hierarchy', href: '/operators', icon: Users, keywords: 'operator team staff' },
  { title: 'Finance Command Center', category: 'Finance', href: '/finance/command', icon: DollarSign, keywords: 'finance ledger reconciliation balance wallet adjustment' },
  { title: 'Withdrawal Approvals', category: 'Finance', href: '/withdrawals', icon: DollarSign, keywords: 'withdrawal payout bank payment' },
  { title: 'Diamond Recharges', category: 'Finance', href: '/recharges/user', icon: Coins, keywords: 'recharge diamonds coins ledger' },
  { title: 'Live Voice & Video Operations', category: 'Live Ops', href: '/live/calls', icon: Video, keywords: 'call live stream agora rtc channel active' },
  { title: 'Live Club & Voice Rooms', category: 'Live Ops', href: '/live/rooms', icon: Video, keywords: 'room voice club group speaker stage' },
  { title: 'Moderation Violations Queue', category: 'Trust & Safety', href: '/moderation/violations', icon: ShieldAlert, keywords: 'moderation ban report chat' },
  { title: 'User Reports Desk', category: 'Trust & Safety', href: '/reports', icon: ShieldAlert, keywords: 'complaint report flag' },
  { title: 'Device Limits & Bans', category: 'Trust & Safety', href: '/bans/device', icon: ShieldAlert, keywords: 'ban device hardware' },
  { title: 'ID & Account Bans', category: 'Trust & Safety', href: '/bans/id', icon: ShieldAlert, keywords: 'ban user account id' },
  { title: 'Help & Customer Support', category: 'Support', href: '/help-support', icon: HelpCircle, keywords: 'ticket help customer support' },
  { title: 'System Health Monitor', category: 'System', href: '/health', icon: Terminal, keywords: 'server health ping latency' },
  { title: 'Immutable Audit Center', category: 'Security', href: '/security/audit-center', icon: ShieldAlert, keywords: 'audit ledger actor provenance tamper proof' },
  { title: 'Security & Audit Logs', category: 'Security', href: '/security/logs', icon: ShieldAlert, keywords: 'audit log security actor' },
  { title: 'Platform Settings', category: 'System', href: '/settings', icon: Settings, keywords: 'settings config parameters' },
  { title: 'Executive Owner Console', category: 'Executive', href: '/owner', icon: Crown, keywords: 'owner master executive' },
];

export function CommandPalette({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const filtered = query.trim() === ''
    ? commandOptions.slice(0, 8)
    : commandOptions.filter(item => {
        const text = `${item.title} ${item.category} ${item.keywords || ''}`.toLowerCase();
        return text.includes(query.toLowerCase());
      });

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex].href);
      }
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md animate-in fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[20%] z-50 w-full max-w-xl translate-x-[-50%]",
            "rounded-3xl border border-white/10 bg-[#0d1222]/95 p-3 shadow-2xl shadow-black/90",
            "backdrop-blur-2xl duration-200 animate-in fade-in-0 zoom-in-95"
          )}
        >
          {/* Search Header */}
          <div className="flex items-center gap-3 px-3 py-2 border-b border-white/10">
            <Search className="h-4 w-4 text-cyan-400 shrink-0" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search modules..."
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-400">
              <Command className="h-2.5 w-2.5" />
              <span>ESC</span>
            </div>
          </div>

          {/* Results List */}
          <div className="mt-2 max-h-80 overflow-y-auto custom-scrollbar space-y-1 p-1">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">No matching commands or destinations found.</p>
            ) : (
              filtered.map((item, idx) => {
                const Icon = item.icon;
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={item.href + item.title}
                    onClick={() => handleSelect(item.href)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all",
                      isSelected
                        ? "bg-cyan-500/15 border border-cyan-500/30 text-white"
                        : "text-slate-300 hover:bg-white/[0.04] border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-1.5 rounded-lg border", isSelected ? "border-cyan-500/30 bg-cyan-500/20 text-cyan-300" : "border-white/10 bg-white/[0.03] text-slate-400")}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.category}</p>
                      </div>
                    </div>
                    <ArrowRight className={cn("h-3.5 w-3.5 transition-transform", isSelected ? "text-cyan-400 translate-x-0.5" : "text-slate-600")} />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Guide */}
          <div className="mt-2 border-t border-white/10 pt-2 px-3 flex items-center justify-between text-[10px] text-slate-500">
            <span>Use ↑↓ to navigate</span>
            <span>Press Enter to select</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
