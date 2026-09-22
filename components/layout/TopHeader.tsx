'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Search, MessageSquare, Share2, CheckSquare, User, LogOut, Settings, Sparkles, Command } from 'lucide-react';
import Link from 'next/link';
import { CommandPalette } from '@/components/enterprise/CommandPalette';

export default function TopHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    toast.info(`Searching for "${searchQuery}"...`);
    router.push(`/users?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Portal link copied to clipboard!');
    }
  };

  const userName = user?.name || 'Administrator';
  const userRole = user?.role || 'owner';
  const userAvatar = (user as any)?.profilePhoto || (user as any)?.avatar;

  return (
    <>
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-[#070a13]/85 px-4 md:px-6 backdrop-blur-2xl">
        {/* Left Section: Brand on Mobile & Global Search */}
        <div className="flex items-center gap-3 md:gap-5 flex-1 max-w-xl">
          <div className="flex items-center gap-2 md:hidden">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-[1px]">
              <div className="h-full w-full rounded-[11px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-violet-400" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="relative flex items-center group">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => setIsCommandOpen(true)}
                placeholder="Search users, IDs, agents... (Ctrl + K)"
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 pl-10 pr-16 py-2 text-xs text-slate-200 placeholder-slate-500 backdrop-blur-md shadow-inner transition-all focus:border-violet-500/50 focus:bg-slate-900/90 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              <button
                type="button"
                onClick={() => setIsCommandOpen(true)}
                className="absolute right-2.5 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-400 hover:text-white"
              >
                <Command className="h-2.5 w-2.5" />
                <span>K</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Section: Actions & User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Chat Notification Icon */}
          <Link
            href="/messages/system"
            className="relative p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all duration-200"
            title="System Messages & Broadcasts"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-1 text-[9px] font-black text-slate-950 shadow-md">
              2
            </span>
          </Link>

          {/* Share Button */}
          <button
            onClick={handleShareLink}
            className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200"
            title="Copy Link to Clipboard"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Tasks Button */}
          <Link
            href="/tasks"
            className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/[0.07] transition-all duration-200"
            title="Task Management"
          >
            <CheckSquare className="w-4 h-4" />
          </Link>

          {/* Divider */}
          <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />

          {/* User Profile Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-xl border border-white/10 bg-white/[0.03] hover:border-violet-500/40 hover:bg-white/[0.06] transition-all focus:outline-none"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 p-[1px] flex items-center justify-center overflow-hidden shrink-0 shadow-md shadow-violet-950/50">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="h-full w-full object-cover rounded-[7px]" />
                ) : (
                  <div className="h-full w-full bg-slate-900 rounded-[7px] flex items-center justify-center font-bold text-xs text-white">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="hidden md:block text-left pr-1">
                <p className="text-xs font-semibold text-white leading-none truncate max-w-[110px]">{userName}</p>
                <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mt-1">{userRole}</p>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-white/10 bg-[#0c101d]/95 backdrop-blur-2xl p-2 shadow-2xl shadow-black/90 z-50 text-xs space-y-1 animate-in fade-in-0 zoom-in-95">
                <div className="px-3 py-2.5 border-b border-white/10 mb-1">
                  <p className="font-bold text-white truncate">{userName}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-semibold text-violet-300 uppercase tracking-wider">{userRole} Active</span>
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <User className="w-4 h-4 text-violet-400" />
                  <span>My Profile</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4 text-cyan-400" />
                  <span>Settings</span>
                </Link>

                <div className="pt-1 mt-1 border-t border-white/10">
                  <button
                    onClick={() => { setIsProfileOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
