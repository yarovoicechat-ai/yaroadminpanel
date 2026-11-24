'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Crown, MessageSquare, Trash2, AlertTriangle, ShieldCheck,
  Search, RefreshCw, CheckCircle2, XCircle, ArrowRight, EyeOff
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function ChatCleanupPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'single'>('all');

  // Preview States
  const [loadingGlobalPreview, setLoadingGlobalPreview] = useState(false);
  const [globalPreview, setGlobalPreview] = useState<{
    totalActiveConversations: number;
    affectedUsersCount: number;
    totalMessagesInDatabase: number;
  } | null>(null);

  // Clean All Form States
  const [cleanupType, setCleanupType] = useState<'clean_active_list' | 'permanent_delete'>('clean_active_list');
  const [confirmText, setConfirmText] = useState('');
  const [secondConfirmed, setSecondConfirmed] = useState(false);
  const [executingAll, setExecutingAll] = useState(false);

  // Single User Form States
  const [searchUserId, setSearchUserId] = useState('');
  const [searchingUser, setSearchingUser] = useState(false);
  const [singleUserPreview, setSingleUserPreview] = useState<any>(null);
  const [singleCleanupType, setSingleCleanupType] = useState<'clean_active_list' | 'permanent_delete'>('clean_active_list');
  const [singleConfirmChecked, setSingleConfirmChecked] = useState(false);
  const [executingSingle, setExecutingSingle] = useState(false);

  const fetchGlobalPreview = async () => {
    try {
      setLoadingGlobalPreview(true);
      const res: any = await apiClient.get('/api/admin/owner/cleanup/chat/preview?mode=all');
      if (res?.success && res.data) {
        setGlobalPreview(res.data.preview);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch global chat preview');
    } finally {
      setLoadingGlobalPreview(false);
    }
  };

  useEffect(() => {
    fetchGlobalPreview();
  }, []);

  const handleSearchSingleUser = async () => {
    if (!searchUserId.trim()) {
      toast.error('Enter a User ID to search');
      return;
    }
    try {
      setSearchingUser(true);
      setSingleUserPreview(null);
      const res: any = await apiClient.get(`/api/admin/owner/cleanup/chat/preview?mode=single&userId=${searchUserId.trim()}`);
      if (res?.success && res.data) {
        setSingleUserPreview(res.data);
      } else {
        toast.error(res?.message || 'User not found');
      }
    } catch (err: any) {
      toast.error(err.message || 'User not found');
    } finally {
      setSearchingUser(false);
    }
  };

  const handleExecuteAll = async () => {
    const requiredToken = cleanupType === 'permanent_delete' ? 'CONFIRM_PERMANENT_DELETE' : 'CONFIRM_CLEAN_ALL_CHATS';
    if (confirmText.trim() !== requiredToken) {
      toast.error(`Type exactly "${requiredToken}" to confirm.`);
      return;
    }
    if (!secondConfirmed) {
      toast.error('Please check the secondary confirmation checkbox.');
      return;
    }

    try {
      setExecutingAll(true);
      const res: any = await apiClient.post('/api/admin/owner/cleanup/chat/execute', {
        mode: 'all',
        cleanupType,
        confirmationToken: requiredToken,
        secondConfirmation: true,
      });

      if (res?.success) {
        toast.success(res.message || 'Clean All Chats completed successfully!');
        setConfirmText('');
        setSecondConfirmed(false);
        fetchGlobalPreview();
      } else {
        toast.error(res?.message || 'Failed to execute cleanup');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error executing cleanup');
    } finally {
      setExecutingAll(false);
    }
  };

  const handleExecuteSingle = async () => {
    if (!singleUserPreview?.targetUser?._id) return;
    if (!singleConfirmChecked) {
      toast.error('Please check the confirmation box.');
      return;
    }

    try {
      setExecutingSingle(true);
      const res: any = await apiClient.post('/api/admin/owner/cleanup/chat/execute', {
        mode: 'single',
        userId: singleUserPreview.targetUser.userId || singleUserPreview.targetUser._id,
        cleanupType: singleCleanupType,
        confirmationToken: singleCleanupType === 'permanent_delete' ? 'CONFIRM_PERMANENT_DELETE' : undefined,
      });

      if (res?.success) {
        toast.success(res.message || 'User chat cleanup executed successfully!');
        setSingleConfirmChecked(false);
        handleSearchSingleUser();
        fetchGlobalPreview();
      } else {
        toast.error(res?.message || 'Failed to clean user chat');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error executing user chat cleanup');
    } finally {
      setExecutingSingle(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Chat & Conversation Cleanup
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs">
                  Owner Exclusive
                </Badge>
              </h1>
              <p className="text-sm text-neutral-400">
                Safely clear conversation visibility for all users or a specific user. Financial & gift transaction records are 100% preserved.
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={fetchGlobalPreview}
          disabled={loadingGlobalPreview}
          className="border-neutral-700 hover:bg-neutral-800"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loadingGlobalPreview ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 mt-0.5 text-emerald-400 shrink-0" />
        <div>
          <span className="font-semibold text-emerald-200">Financial Integrity Guarantee:</span> Chat cleanup operates exclusively on inbox conversations and messages. It will never touch or modify Coins balances, Beans balances, gifts exchanged, recharge histories, or wallet audit trails.
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          Operation A: Clean All Users' Chat Lists
        </button>
        <button
          onClick={() => setActiveTab('single')}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
            activeTab === 'single'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
          }`}
        >
          Operation B: Clean One User's Chat List
        </button>
      </div>

      {/* TAB A: CLEAN ALL */}
      {activeTab === 'all' && (
        <div className="space-y-6">
          {/* Stats Preview Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-neutral-900/60 border-neutral-800">
              <CardContent className="p-4">
                <div className="text-xs text-neutral-400">Total Active Conversations</div>
                <div className="text-2xl font-bold text-white font-mono mt-1">
                  {globalPreview?.totalActiveConversations ?? '—'}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Currently visible across all inboxes</div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/60 border-neutral-800">
              <CardContent className="p-4">
                <div className="text-xs text-neutral-400">Affected Registered Users</div>
                <div className="text-2xl font-bold text-amber-300 font-mono mt-1">
                  {globalPreview?.affectedUsersCount ?? '—'}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Users with active conversations</div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/60 border-neutral-800">
              <CardContent className="p-4">
                <div className="text-xs text-neutral-400">Total Chat Messages Stored</div>
                <div className="text-2xl font-bold text-blue-300 font-mono mt-1">
                  {globalPreview?.totalMessagesInDatabase ?? '—'}
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Retained safely in archive</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Configuration Card */}
          <Card className="bg-neutral-900/60 border-neutral-800">
            <CardHeader className="border-b border-neutral-800">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-amber-400" />
                Configure Global Chat Cleanup
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Choose the cleanup method and provide double confirmation.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Mode Selection */}
              <div>
                <label className="text-xs text-neutral-400 font-medium block mb-2">Select Operation Mode</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCleanupType('clean_active_list')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      cleanupType === 'clean_active_list'
                        ? 'border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-sm text-emerald-400 mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      Clean Active Chat Lists (Safe / Default)
                    </div>
                    <div className="text-xs text-neutral-400 leading-relaxed">
                      Removes conversation threads from users' active inbox view. Message records and audit trails remain preserved in database.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCleanupType('permanent_delete')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      cleanupType === 'permanent_delete'
                        ? 'border-red-500 bg-red-500/10 text-white ring-1 ring-red-500'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-sm text-red-400 mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      Permanent Deletion (High Risk)
                    </div>
                    <div className="text-xs text-neutral-400 leading-relaxed">
                      Permanently purges conversation documents and text messages from database. Financial records remain protected.
                    </div>
                  </button>
                </div>
              </div>

              {/* Confirmations */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div>
                  <label className="text-xs text-neutral-300 font-medium block mb-1">
                    Primary Confirmation: Type{' '}
                    <span className="text-amber-400 font-mono font-bold">
                      {cleanupType === 'permanent_delete' ? 'CONFIRM_PERMANENT_DELETE' : 'CONFIRM_CLEAN_ALL_CHATS'}
                    </span>
                  </label>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder={`Type ${cleanupType === 'permanent_delete' ? 'CONFIRM_PERMANENT_DELETE' : 'CONFIRM_CLEAN_ALL_CHATS'}`}
                    className="font-mono bg-neutral-900 border-neutral-700 text-white"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="double-confirm"
                    checked={secondConfirmed}
                    onChange={(e) => setSecondConfirmed(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="double-confirm" className="text-xs text-neutral-300 leading-relaxed cursor-pointer">
                    <span className="font-semibold text-white">Secondary Explicit Confirmation:</span> I understand that this operation will clear the active chat lists of all {globalPreview?.affectedUsersCount || 'active'} users across the entire platform.
                  </label>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleExecuteAll}
                  disabled={
                    executingAll ||
                    confirmText.trim() !== (cleanupType === 'permanent_delete' ? 'CONFIRM_PERMANENT_DELETE' : 'CONFIRM_CLEAN_ALL_CHATS') ||
                    !secondConfirmed
                  }
                  className={
                    cleanupType === 'permanent_delete'
                      ? 'bg-red-600 hover:bg-red-700 text-white font-semibold px-6'
                      : 'bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6'
                  }
                >
                  {executingAll ? 'Executing Global Cleanup...' : 'Execute Clean All Chats'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB B: CLEAN ONE USER */}
      {activeTab === 'single' && (
        <div className="space-y-6">
          <Card className="bg-neutral-900/60 border-neutral-800">
            <CardHeader className="border-b border-neutral-800">
              <CardTitle className="text-base text-white">Target User Chat Cleanup</CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Search a specific user by numeric User ID or Name to preview and clear only their chat conversations.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <Input
                    placeholder="Enter User ID (e.g. 100001)..."
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                    className="pl-9 bg-neutral-950 border-neutral-800 text-white"
                  />
                </div>
                <Button
                  onClick={handleSearchSingleUser}
                  disabled={searchingUser || !searchUserId.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                >
                  {searchingUser ? 'Searching...' : 'Preview User Chat'}
                </Button>
              </div>

              {/* Single User Preview Card */}
              {singleUserPreview && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        {singleUserPreview.targetUser?.name}
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs">
                          UID: {singleUserPreview.targetUser?.userId || 'N/A'}
                        </Badge>
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        Phone: {singleUserPreview.targetUser?.phoneNumber || 'N/A'}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
                        <span className="text-neutral-500">Active Chats: </span>
                        <span className="text-amber-400 font-bold">{singleUserPreview.preview?.activeConversations}</span>
                      </div>
                      <div className="bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
                        <span className="text-neutral-500">Total Messages: </span>
                        <span className="text-blue-400 font-bold">{singleUserPreview.preview?.totalMessages}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mode selector */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setSingleCleanupType('clean_active_list')}
                      className={`p-3 rounded-lg border text-left ${
                        singleCleanupType === 'clean_active_list'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                      }`}
                    >
                      <div className="font-semibold mb-0.5">Clean Active Inbox Only (Safe)</div>
                      <div className="text-[11px] opacity-80">Removes threads from this user's view only.</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSingleCleanupType('permanent_delete')}
                      className={`p-3 rounded-lg border text-left ${
                        singleCleanupType === 'permanent_delete'
                          ? 'border-red-500 bg-red-500/10 text-red-300'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-400'
                      }`}
                    >
                      <div className="font-semibold mb-0.5">Delete User Chat Messages</div>
                      <div className="text-[11px] opacity-80">Purges messages for this user permanently.</div>
                    </button>
                  </div>

                  {/* Confirmation checkbox */}
                  <div className="flex items-start gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="single-confirm"
                      checked={singleConfirmChecked}
                      onChange={(e) => setSingleConfirmChecked(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-amber-500"
                    />
                    <label htmlFor="single-confirm" className="text-xs text-neutral-300 cursor-pointer">
                      Confirm cleaning chat for user <span className="text-white font-semibold">{singleUserPreview.targetUser?.name}</span> only. Other users will not be affected.
                    </label>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-neutral-800">
                    <Button
                      onClick={handleExecuteSingle}
                      disabled={executingSingle || !singleConfirmChecked}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
                    >
                      {executingSingle ? 'Cleaning...' : `Clean Chat for ${singleUserPreview.targetUser?.name}`}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
