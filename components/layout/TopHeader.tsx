'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Search, MessageSquare, Share2, CheckSquare, User, LogOut, Settings, ChevronDown, Menu } from 'lucide-react';
import Link from 'next/link';

export default function TopHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

  const userName = user?.name || 'Shivansh Bajpeyi';
  const userRole = user?.role || 'admin';
  const userAvatar = (user as any)?.profilePhoto || (user as any)?.avatar;

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Left Section: Menu & Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        <form onSubmit={handleSearchSubmit} className="relative max-w-md w-full">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-slate-800/80 border border-slate-700/60 text-slate-200 placeholder-slate-500 rounded-xl pl-3.5 pr-9 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            <button type="submit" className="absolute right-2.5 text-slate-400 hover:text-white transition-colors">
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Right Section: Actions & User Avatar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Chat Notification Icon */}
        <Link
          href="/messages/system"
          className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-emerald-600/20 text-emerald-400 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/40 transition-all group"
          title="System Chat & Notifications"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[9px] font-black text-slate-950 flex items-center justify-center border-2 border-slate-900">
            2
          </span>
        </Link>

        {/* Share Button */}
        <button
          onClick={handleShareLink}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
          title="Share Portal Link"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Tasks Button */}
        <Link
          href="/tasks"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
          title="Task Management"
        >
          <CheckSquare className="w-4 h-4" />
        </Link>

        {/* User Profile Avatar Dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-full bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 transition-all focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-slate-300" />
              )}
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="font-bold text-white truncate">{userName}</p>
                <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mt-0.5">{userRole}</p>
              </div>

              <Link
                href="/profile"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-indigo-400" />
                <span>Settings</span>
              </Link>

              <button
                onClick={() => { setIsProfileOpen(false); logout(); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
