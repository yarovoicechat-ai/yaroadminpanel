'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Check, X, ShieldAlert, ArrowRightLeft, Search, PlusCircle, MinusCircle } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

export default function PermissionCompare() {
  const [user1Search, setUser1Search] = useState('');
  const [user2Search, setUser2Search] = useState('');

  const [user1, setUser1] = useState<any>(null);
  const [user2, setUser2] = useState<any>(null);

  const [compareData, setCompareData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearchUser = async (id: string, slot: 1 | 2) => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/user/${id}`);
      if (res.success && res.data) {
        if (slot === 1) setUser1(res.data);
        else setUser2(res.data);
        toast.success(`Loaded Slot ${slot}: ${res.data.name}`);
      } else {
        toast.error('User not found.');
      }
    } catch (err) {
      toast.error('Error finding user');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!user1 || !user2) {
      toast.error('Please load both users to perform a comparison.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.get(`/api/ems/compare?user1Id=${user1._id}&user2Id=${user2._id}`);
      if (res.success && res.data) {
        setCompareData(res.data);
        toast.success('Permissions compared successfully');
      } else {
        toast.error('Failed to load comparison.');
      }
    } catch (err) {
      toast.error('Error comparing permissions');
    } finally {
      setLoading(false);
    }
  };

  const clearSlots = () => {
    setUser1(null);
    setUser2(null);
    setCompareData(null);
    setUser1Search('');
    setUser2Search('');
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Permissions Comparison
          </h2>
          <p className="text-muted-foreground mt-1">Compare dynamic nodes and access policies between two users</p>
        </div>
        {(user1 || user2) && (
          <button
            onClick={clearSlots}
            className="text-xs bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Clear slots
          </button>
        )}
      </div>

      {/* Select Users Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Slot 1 */}
        <Card className="glass-card border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-400 uppercase">User Slot 1</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter User UID or MongoDB ID"
                value={user1Search}
                onChange={(e) => setUser1Search(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => handleSearchUser(user1Search, 1)}
                className="bg-primary hover:bg-primary/95 text-xs px-4 py-2 rounded-lg font-bold text-white transition-all flex items-center gap-1.5 shrink-0"
              >
                <Search className="h-3.5 w-3.5" /> Find
              </button>
            </div>

            {user1 ? (
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-100">{user1.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{user1.email || 'No email'}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-primary">
                    {user1.role}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/50">
                  ID: {user1._id}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No user loaded for Slot 1
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Slot 2 */}
        <Card className="glass-card border-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-400 uppercase">User Slot 2</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter User UID or MongoDB ID"
                value={user2Search}
                onChange={(e) => setUser2Search(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => handleSearchUser(user2Search, 2)}
                className="bg-primary hover:bg-primary/95 text-xs px-4 py-2 rounded-lg font-bold text-white transition-all flex items-center gap-1.5 shrink-0"
              >
                <Search className="h-3.5 w-3.5" /> Find
              </button>
            </div>

            {user2 ? (
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-100">{user2.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{user2.email || 'No email'}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-primary">
                    {user2.role}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/50">
                  ID: {user2._id}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No user loaded for Slot 2
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {user1 && user2 && (
        <div className="flex justify-center">
          <button
            onClick={handleCompare}
            disabled={loading}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all shadow-lg"
          >
            <ArrowRightLeft className="h-4 w-4" /> Compare Permissions
          </button>
        </div>
      )}

      {/* Compare Results Display */}
      {compareData && (
        <Card className="glass-card border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" /> Comparison Report
            </CardTitle>
            <CardDescription>Differences in dynamic parameters between {user1.name} and {user2.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Menus and Widgets Diffs */}
              <DiffBlock
                title="Sidebar Menus"
                added={compareData.menus.added}
                removed={compareData.menus.removed}
                user1Name={user1.name}
                user2Name={user2.name}
              />
              <DiffBlock
                title="Dashboard Widgets"
                added={compareData.dashboardWidgets.added}
                removed={compareData.dashboardWidgets.removed}
                user1Name={user1.name}
                user2Name={user2.name}
              />
              <DiffBlock
                title="Allowed Action Buttons"
                added={compareData.buttons.added}
                removed={compareData.buttons.removed}
                user1Name={user1.name}
                user2Name={user2.name}
              />
              <DiffBlock
                title="API Access Actions"
                added={compareData.actions.added}
                removed={compareData.actions.removed}
                user1Name={user1.name}
                user2Name={user2.name}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DiffBlock({
  title, added, removed, user1Name, user2Name
}: {
  title: string;
  added: string[];
  removed: string[];
  user1Name: string;
  user2Name: string;
}) {
  const hasDiffs = (added && added.length > 0) || (removed && removed.length > 0);

  return (
    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4 shadow-inner">
      <h4 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">{title}</h4>
      {hasDiffs ? (
        <div className="space-y-3">
          {added && added.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                <PlusCircle className="h-3.5 w-3.5" /> Unique to {user1Name}
              </p>
              <div className="flex flex-wrap gap-1">
                {added.map(item => (
                  <span key={item} className="text-xs px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {removed && removed.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-rose-450 font-bold uppercase flex items-center gap-1">
                <MinusCircle className="h-3.5 w-3.5 text-rose-500" /> Unique to {user2Name}
              </p>
              <div className="flex flex-wrap gap-1">
                {removed.map(item => (
                  <span key={item} className="text-xs px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-slate-500 py-3 text-center">
          Identical access parameters
        </div>
      )}
    </div>
  );
}
