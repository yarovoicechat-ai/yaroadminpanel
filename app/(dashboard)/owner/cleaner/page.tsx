'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import {
  Crown,
  Trash2,
  Radio,
  MessageSquare,
  ShieldAlert,
  Hash,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  UserX,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function OwnerCleanerPage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  // Modal states
  const [cleanAllChatsOpen, setCleanAllChatsOpen] = useState(false);
  const [cleanAllRoomsOpen, setCleanAllRoomsOpen] = useState(false);

  // Single user chat cleaner state
  const [singleUserId, setSingleUserId] = useState('');
  const [cleaningUserChat, setCleaningUserChat] = useState(false);

  // Custom Room ID state
  const [customTargetRoomId, setCustomTargetRoomId] = useState('');
  const [newCustomRoomId, setNewCustomRoomId] = useState('');
  const [savingCustomRoomId, setSavingCustomRoomId] = useState(false);

  // General action loading state
  const [actionLoading, setActionLoading] = useState(false);

  const handleCleanAllChats = async () => {
    setActionLoading(true);
    try {
      const res: any = await apiClient.post('/api/admin/chats/clean-all', {});
      if (res?.success) {
        toast.success(res.message || 'All chat messages and conversations cleaned successfully.');
        setCleanAllChatsOpen(false);
      } else {
        toast.error(res?.message || 'Failed to clean chats.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to clean chats');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCleanSingleUserChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleUserId.trim()) {
      return toast.error('Enter a User ID or Meethi ID to clean');
    }
    setCleaningUserChat(true);
    try {
      const res: any = await apiClient.post('/api/admin/chats/clean-user', {
        userId: singleUserId.trim(),
      });
      if (res?.success) {
        toast.success(res.message || `Cleaned chat for user ${singleUserId}`);
        setSingleUserId('');
      } else {
        toast.error(res?.message || 'Failed to clean user chat');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to clean user chat');
    } finally {
      setCleaningUserChat(false);
    }
  };

  const handleCleanAllRooms = async () => {
    setActionLoading(true);
    try {
      const res: any = await apiClient.post('/api/admin/rooms/clean-all', {});
      if (res?.success) {
        toast.success(res.message || 'All rooms cleaned. New rooms will start from 9-digit ID 100000000.');
        setCleanAllRoomsOpen(false);
      } else {
        toast.error(res?.message || 'Failed to clean rooms.');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to clean rooms');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetCustomRoomId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTargetRoomId.trim()) {
      return toast.error('Enter target Room ID');
    }
    if (!newCustomRoomId.trim()) {
      return toast.error('Enter desired Custom Room ID');
    }
    setSavingCustomRoomId(true);
    try {
      const res: any = await apiClient.post('/api/admin/rooms/custom-id', {
        roomId: customTargetRoomId.trim(),
        customRoomId: newCustomRoomId.trim(),
      });
      if (res?.success) {
        toast.success(res.message || `Custom Room ID ${newCustomRoomId} assigned successfully!`);
        setCustomTargetRoomId('');
        setNewCustomRoomId('');
      } else {
        toast.error(res?.message || 'Failed to assign custom room ID');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to assign custom room ID');
    } finally {
      setSavingCustomRoomId(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Access Denied: Owner Exclusive</h1>
        <p className="text-slate-400 max-w-md">
          This panel is restricted exclusively to the Owner role. You do not have permission to clean platform data or manage custom IDs.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Crown className="w-6 h-6" />
          </span>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Owner Platform Control & Data Cleaner
          </h1>
        </div>
        <p className="text-sm text-slate-400">
          Owner-exclusive operations: clean chat lists, wipe rooms to start the 9-digit series at 100000000, and assign custom room IDs without corrupting user data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. All Rooms Cleaner & 9-Digit Series Reset */}
        <Card className="bg-slate-900/70 border-slate-800 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Radio className="w-5 h-5 text-red-400" />
              <span>Clean All Voice Rooms</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs leading-relaxed">
              Deletes all current voice rooms from the platform and flushes active room cache in Redis.
              All new rooms will automatically generate in <strong>9-digit series starting at 100000000</strong> (100000001, 100000002...).
              User accounts and balances remain completely intact.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button
              variant="destructive"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5"
              onClick={() => setCleanAllRoomsOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clean All Rooms & Start 9-Digit Series
            </Button>
          </CardContent>
        </Card>

        {/* 2. Custom Room ID Generator */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Hash className="w-5 h-5 text-indigo-400" />
              <span>Assign Custom Room ID</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Assign a customized, VIP or special vanity ID to any room. Users can join using this custom ID or the room’s 9-digit ID.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetCustomRoomId} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">Current Room ID / Channel *</label>
                <Input
                  placeholder="e.g. 100000000"
                  value={customTargetRoomId}
                  onChange={(e) => setCustomTargetRoomId(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">Desired Custom Room ID *</label>
                <Input
                  placeholder="e.g. 666666, 888888, VIP101"
                  value={newCustomRoomId}
                  onChange={(e) => setNewCustomRoomId(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-sm"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={savingCustomRoomId}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                {savingCustomRoomId ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Assign Custom Room ID
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 3. Clean All Users' Chat List */}
        <Card className="bg-slate-900/70 border-slate-800 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span>Clean All Users' Chats</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs leading-relaxed">
              Wipes all 1v1 and group chat conversations and messages across all users on the platform.
              User accounts, follower links, and gift history will not be affected.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button
              variant="outline"
              className="w-full border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-semibold py-2.5"
              onClick={() => setCleanAllChatsOpen(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clean All Chats Across Platform
            </Button>
          </CardContent>
        </Card>

        {/* 4. Clean Single User's Chat List */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <UserX className="w-5 h-5 text-cyan-400" />
              <span>Clean Single User's Chat List</span>
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Clean and wipe all chat conversations and messages for a specific single user ID.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCleanSingleUserChat} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">User ID or Meethi ID *</label>
                <Input
                  placeholder="e.g. 100021"
                  value={singleUserId}
                  onChange={(e) => setSingleUserId(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-white text-sm"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={cleaningUserChat}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
              >
                {cleaningUserChat ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Clean This User's Chats
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog: Clean All Chats */}
      <Dialog open={cleanAllChatsOpen} onOpenChange={setCleanAllChatsOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400 text-lg">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Confirm: Clean All Platform Chats?
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm pt-2">
              Are you sure you want to delete all chat conversations and messages across the entire app? This cannot be undone. User profiles and coins will remain safe.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setCleanAllChatsOpen(false)}
              className="border-slate-800 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              disabled={actionLoading}
              onClick={handleCleanAllChats}
              className="bg-amber-600 hover:bg-amber-500 text-white"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm Clean All Chats
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog: Clean All Rooms */}
      <Dialog open={cleanAllRoomsOpen} onOpenChange={setCleanAllRoomsOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Confirm: Clean All Voice Rooms?
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-sm pt-2">
              This will remove all current rooms and clear active room memory.
              The next room created by any user will start the <strong>9-digit sequential series at 100000000</strong>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setCleanAllRoomsOpen(false)}
              className="border-slate-800 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              disabled={actionLoading}
              onClick={handleCleanAllRooms}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm Clean All Rooms
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
