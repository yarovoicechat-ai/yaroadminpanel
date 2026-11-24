'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Crown, Key, CheckCircle2, XCircle, ArrowLeft, Search, Sparkles, AlertCircle
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function CustomRoomIdCreatorPage() {
  const router = useRouter();

  const [roomId, setRoomId] = useState('');
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{ available: boolean; message: string } | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [ownerUserId, setOwnerUserId] = useState('');
  const [category, setCategory] = useState('Chat 💬');
  const [seatCount, setSeatCount] = useState('8');
  const [about, setAbout] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCheckAvailability = async () => {
    const clean = roomId.trim();
    if (!/^\d{9}$/.test(clean)) {
      setCheckResult({ available: false, message: 'Room ID must contain exactly 9 numeric digits.' });
      return;
    }

    try {
      setChecking(true);
      const res: any = await apiClient.get(`/api/admin/owner/rooms/check-id?roomId=${clean}`);
      if (res?.success && res.data) {
        setCheckResult({
          available: res.data.available,
          message: res.data.available ? `Room ID ${clean} is available!` : (res.data.reason || 'Already in use.'),
        });
      } else {
        setCheckResult({ available: false, message: res?.message || 'Check failed' });
      }
    } catch (err: any) {
      setCheckResult({ available: false, message: err.message || 'Error verifying ID' });
    } finally {
      setChecking(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRoomId = roomId.trim();

    if (!/^\d{9}$/.test(cleanRoomId)) {
      toast.error('Validation Error: Room ID must contain exactly 9 digits.');
      return;
    }

    if (!title.trim()) {
      toast.error('Room title is required.');
      return;
    }

    try {
      setSubmitting(true);
      const res: any = await apiClient.post('/api/admin/owner/rooms/custom', {
        customRoomId: cleanRoomId,
        title: title.trim(),
        ownerUserId: ownerUserId.trim() || undefined,
        category,
        seatCount: Number(seatCount) || 8,
        about: about.trim(),
        coverImage: coverImage.trim(),
      });

      if (res?.success) {
        toast.success(`Custom Room ${cleanRoomId} created successfully!`);
        router.push('/owner/rooms');
      } else {
        toast.error(res?.message || 'Failed to create custom room');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error submitting custom room');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/owner/rooms">
          <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Room IDs
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Assign Custom 9-Digit Room ID
            <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs">
              Owner Exclusive
            </Badge>
          </h1>
          <p className="text-sm text-neutral-400">
            Reserve and allocate prestigious or customized 9-digit Room IDs. Automatic sequence skips reserved custom numbers.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <Card className="bg-neutral-900/60 border-neutral-800">
        <CardHeader className="border-b border-neutral-800">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            Custom Room ID Configuration
          </CardTitle>
          <CardDescription className="text-xs text-neutral-400">
            Must contain exactly 9 numeric digits (e.g. 100008888, 111222333, 999999999).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleCreateRoom} className="space-y-6">
            {/* ID Check Section */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
              <label className="text-sm font-semibold text-white block">
                Target 9-Digit Custom Room ID *
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Input
                    placeholder="Enter 9-digit Room ID (e.g. 100007777)"
                    value={roomId}
                    onChange={(e) => {
                      setRoomId(e.target.value.replace(/\D/g, '').slice(0, 9));
                      setCheckResult(null);
                    }}
                    maxLength={9}
                    className="font-mono text-base tracking-wider bg-neutral-900 border-neutral-700 text-amber-300"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-mono">
                    {roomId.length}/9
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={handleCheckAvailability}
                  disabled={checking || roomId.length !== 9}
                  className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
                >
                  {checking ? 'Checking...' : 'Check Availability'}
                </Button>
              </div>

              {checkResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                    checkResult.available
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-red-500/30 bg-red-500/10 text-red-300'
                  }`}
                >
                  {checkResult.available ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{checkResult.message}</span>
                </div>
              )}
            </div>

            {/* Room Metadata */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 font-medium block mb-1">Room Title *</label>
                <Input
                  placeholder="e.g. Royal VIP Lounge"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">
                    Assign Owner User ID (Optional)
                  </label>
                  <Input
                    placeholder="User ID (e.g. 100001) - Defaults to Owner"
                    value={ownerUserId}
                    onChange={(e) => setOwnerUserId(e.target.value)}
                    className="bg-neutral-950 border-neutral-800 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">Mic Seat Capacity</label>
                  <select
                    value={seatCount}
                    onChange={(e) => setSeatCount(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm text-white"
                  >
                    <option value="4">4 Seats</option>
                    <option value="8">8 Seats (Standard)</option>
                    <option value="10">10 Seats (PK Compatible)</option>
                    <option value="12">12 Seats</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm text-white"
                  >
                    <option value="Chat 💬">Chat 💬</option>
                    <option value="Music 🎵">Music 🎵</option>
                    <option value="Gaming 🎮">Gaming 🎮</option>
                    <option value="VIP Lounge 👑">VIP Lounge 👑</option>
                    <option value="Friendship 🤝">Friendship 🤝</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">Cover Image URL (Optional)</label>
                  <Input
                    placeholder="https://..."
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="bg-neutral-950 border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 font-medium block mb-1">Room Description / About</label>
                <Input
                  placeholder="Official custom room created by Platform Owner"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
              <Link href="/owner/rooms">
                <Button type="button" variant="outline" className="border-neutral-700">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={submitting || roomId.length !== 9 || (checkResult !== null && !checkResult.available)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {submitting ? 'Creating Custom Room...' : 'Confirm & Create Custom Room'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
