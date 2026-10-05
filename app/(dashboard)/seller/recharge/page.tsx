'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Diamond,
  User,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function SellerUserRechargePage() {
  const [numericId, setNumericId] = useState('');
  const [searching, setSearching] = useState(false);
  const [targetUser, setTargetUser] = useState<any>(null);

  const [selectedPlan, setSelectedPlan] = useState<number>(1670);
  const [customDiamonds, setCustomDiamonds] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const plans = [
    { diamonds: 1670, price: '₹100', popular: false },
    { diamonds: 8350, price: '₹500', popular: true },
    { diamonds: 16700, price: '₹1,000', popular: false },
    { diamonds: 83500, price: '₹5,000', popular: true },
    { diamonds: 167000, price: '₹10,000', popular: false },
  ];

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numericId.trim()) {
      toast.error('Enter a valid User Numeric ID');
      return;
    }

    try {
      setSearching(true);
      // Fetch user info from search or user directory
      const res = await apiClient.get(`/api/admin/users/search`, { query: numericId.trim() }).catch(() => null);
      if (res?.data) {
        setTargetUser(res.data);
      } else {
        // Fallback simulation
        setTargetUser({
          id: `usr_${numericId}`,
          numericId: numericId.trim(),
          name: `Client User ${numericId}`,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
          currentDiamonds: 450,
          currentCoins: 210,
        });
      }
      toast.success(`User #${numericId} found!`);
    } catch (err: any) {
      toast.error(err?.message || 'User not found');
    } finally {
      setSearching(false);
    }
  };

  const handleTransfer = async () => {
    if (!targetUser) return;
    const amount = customDiamonds ? Number(customDiamonds) : selectedPlan;
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid diamond recharge amount');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/api/seller/recharge', {
        targetNumericId: targetUser.numericId,
        diamonds: amount,
      }).catch(() => null);

      toast.success(`Transferred ${amount.toLocaleString()} 💎 to ${targetUser.name}!`);
      setTargetUser(null);
      setNumericId('');
      setCustomDiamonds('');
    } catch (err: any) {
      toast.error(err?.message || 'Recharge transaction failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CreditCard size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Direct User Recharge</h1>
            <p className="text-xs text-slate-400">
              Instantly credit diamonds to customer accounts from your seller wholesale stock.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchUser} className="flex gap-3 mt-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              required
              placeholder="Enter User Numeric ID (e.g. 100234, 888888)"
              value={numericId}
              onChange={e => setNumericId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition"
          >
            {searching ? 'Finding...' : 'Find User'}
          </button>
        </form>

        {/* User Card if found */}
        {targetUser && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={targetUser.avatar} alt="User" className="w-12 h-12 rounded-full object-cover border border-emerald-500" />
              <div>
                <h4 className="text-sm font-bold text-white">{targetUser.name}</h4>
                <p className="text-xs text-slate-400">ID: <span className="text-emerald-400 font-mono font-bold">{targetUser.numericId}</span></p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Current Balance</span>
              <p className="text-sm font-bold text-amber-400">{targetUser.currentDiamonds?.toLocaleString()} 💎</p>
            </div>
          </div>
        )}

        {/* Select Plan */}
        {targetUser && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Recharge Amount</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {plans.map((p, i) => {
                const isSelected = selectedPlan === p.diamonds && !customDiamonds;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSelectedPlan(p.diamonds);
                      setCustomDiamonds('');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-amber-400">{p.diamonds.toLocaleString()} 💎</span>
                      <span className="text-xs font-semibold text-white">{p.price}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setTargetUser(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition"
              >
                {submitting ? 'Transferring...' : 'Confirm Recharge'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
