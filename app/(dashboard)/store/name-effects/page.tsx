'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

type Effect = { _id: string; name: string; slug: string; description: string; status: string;
  metadata?: { panelOnly?: boolean }; config: { colors: string[]; animationType: string; animationSpeed?: number } };
type Assignment = { _id: string; userId: number; userObjectId?: { name?: string }; config: { styleId?: string };
  expiresAt: string; status: string };

export default function NameEffectsPage() {
  const [effects, setEffects] = useState<Effect[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selected, setSelected] = useState('');
  const [target, setTarget] = useState('');
  const [preview, setPreview] = useState('BULLET');
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [catalog, active] = await Promise.all([
        apiClient.get<{ effects: Effect[] }>('/api/identity/admin/effects'),
        apiClient.get<{ entitlements: Assignment[] }>('/api/identity/admin/entitlements?type=animated_name&status=active&limit=100'),
      ]);
      const presets = (catalog.data?.effects || []).filter(effect => effect.status === 'active' && effect.metadata?.panelOnly);
      setEffects(presets);
      setSelected(value => value || presets[0]?.slug || '');
      setAssignments((active.data?.entitlements || []).filter(item => new Date(item.expiresAt).getTime() > Date.now()));
    } catch (error: any) { toast.error(error.message || 'Could not load name effects'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const apply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !target.trim()) return;
    setBusy(true);
    try {
      const response = await apiClient.post('/api/identity/admin/effects/grant', {
        userIdentifier: target.trim(), effectSlug: selected, durationDays: days,
      });
      toast.success(response.message || 'Name Effect applied');
      await load();
    } catch (error: any) { toast.error(error.message || 'Could not apply effect'); }
    finally { setBusy(false); }
  };
  const remove = async (item: Assignment) => {
    setBusy(true);
    try {
      await apiClient.post('/api/identity/admin/entitlements/' + item._id + '/revoke', { reason: 'Removed from Name Effect panel' });
      toast.success('Name Effect removed');
      await load();
    } catch (error: any) { toast.error(error.message || 'Could not remove effect'); }
    finally { setBusy(false); }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredEffects = effects.filter(effect => {
    const matchesSearch = !searchQuery.trim() ||
      effect.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      effect.config.animationType.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesType = filterType === 'all' || effect.config.animationType === filterType;
    return matchesSearch && matchesType;
  });

  return <div className="space-y-6 pb-12 text-white">
    <div className="flex items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold">Name Effect</h1>
        <p className="mt-1 text-sm text-slate-400">{effects.length || 60} animated name styles. Apply to any account from this panel.</p></div>
      <button onClick={load} disabled={loading || busy} className="rounded-xl border border-slate-700 px-4 py-2 text-sm">Refresh</button>
    </div>
    <form onSubmit={apply} className="grid gap-4 rounded-2xl border border-cyan-500/30 bg-slate-900 p-5 md:grid-cols-4">
      <label className="text-xs text-slate-300">Target user ID / username
        <input required value={target} onChange={event => setTarget(event.target.value)} placeholder="Enter account ID"
          className="mt-2 w-full rounded-lg bg-slate-950 p-3 text-sm text-white" /></label>
      <label className="text-xs text-slate-300">Name Effect
        <select value={selected} onChange={event => setSelected(event.target.value)} className="mt-2 w-full rounded-lg bg-slate-950 p-3 text-sm text-white">
          {effects.map(effect => <option key={effect.slug} value={effect.slug}>{effect.name} ({effect.config.animationType.replace(/_/g, ' ')})</option>)}
        </select></label>
      <label className="text-xs text-slate-300">Validity
        <select value={days} onChange={event => setDays(Number(event.target.value))} className="mt-2 w-full rounded-lg bg-slate-950 p-3 text-sm text-white">
          {[1, 3, 7, 15, 30, 90, 365, 0].map(value => <option key={value} value={value}>{value === 0 ? 'Permanent' : value + ' days'}</option>)}
        </select></label>
      <button type="submit" disabled={busy || loading || !selected} className="self-end rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 disabled:opacity-40">{busy ? 'Saving...' : 'Apply Name Effect'}</button>
    </form>
    
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <label className="flex max-w-xs items-center gap-2 text-xs text-slate-400">
        <span>Preview Text:</span>
        <input value={preview} maxLength={40} onChange={event => setPreview(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white" />
      </label>
      <div className="flex flex-1 max-w-sm items-center gap-2">
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search 60 effects..."
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-white" />
        {searchQuery && <button onClick={() => setSearchQuery('')} className="text-xs text-slate-400 hover:text-white">Clear</button>}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        {['all', 'rainbow', 'shimmer', 'neon', 'gradient_scroll', 'glow_pulse', 'gold_rotate'].map(type => (
          <button key={type} type="button" onClick={() => setFilterType(type)}
            className={'rounded-lg px-2.5 py-1 transition-all ' + (filterType === type ? 'bg-cyan-500 font-bold text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700')}>
            {type === 'all' ? 'All (' + effects.length + ')' : type.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
    </div>

    {loading && <p className="text-sm text-slate-400">Loading effects...</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {filteredEffects.map(effect => <button type="button" key={effect.slug} onClick={() => setSelected(effect.slug)}
        aria-pressed={selected === effect.slug} className={'rounded-2xl border bg-slate-900 p-5 text-left transition-all ' + (selected === effect.slug ? 'border-cyan-400 ring-2 ring-cyan-500/30' : 'border-slate-800 hover:border-slate-700')}>
        <div className="flex min-h-20 items-center justify-center overflow-hidden rounded-lg bg-slate-950">
          <span className={'effect-preview ' + (effect.config.animationType === 'glow_pulse' ? 'effect-pulse' : '')}
            style={{ backgroundImage: 'linear-gradient(90deg,' + effect.config.colors.join(',') + ',' + effect.config.colors[0] + ')', animationDuration: (4.2 / (effect.config.animationSpeed || 1)) + 's' }}>
            {preview || 'BULLET'}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <h2 className="text-sm font-bold truncate">{effect.name}</h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 capitalize">{effect.config.animationType.replace(/_/g, ' ')}</span>
        </div>
        <div className="mt-2 flex gap-1">
          {effect.config.colors.slice(0, 5).map((color, idx) => (
            <span key={idx} className="h-2 w-3 rounded-sm" style={{ backgroundColor: color }} />
          ))}
        </div>
      </button>)}
    </div>
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">
      <h2 className="mb-4 font-bold">Applied Name Effects</h2>
      {!assignments.length && <p className="text-sm text-slate-400">No active assignments.</p>}
      <div className="space-y-3">{assignments.map(item => <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 text-sm">
        <div><p className="font-semibold">{item.userObjectId?.name || 'User'} <span className="text-slate-400">ID: {item.userId}</span></p>
          <p className="mt-1 text-xs text-cyan-300">{effects.find(effect => effect.slug === item.config.styleId)?.name || item.config.styleId}</p></div>
        <span className="text-xs text-slate-400">{new Date(item.expiresAt).getFullYear() >= 9999 ? 'Permanent' : 'Until ' + new Date(item.expiresAt).toLocaleDateString()}</span>
        <button disabled={busy} onClick={() => remove(item)} className="rounded-lg border border-rose-400/40 px-3 py-2 text-xs text-rose-300">Remove</button>
      </div>)}</div>
    </div>
    <style jsx>{`
      .effect-preview { font-size:22px; font-weight:800; background-size:400% 100%; background-clip:text; -webkit-background-clip:text; color:transparent; animation:name-flow 4.2s linear infinite; }
      .effect-pulse { animation-name:name-pulse; }
      @keyframes name-flow { from { background-position:100% 50%; } to { background-position:0% 50%; } }
      @keyframes name-pulse { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
      @media (prefers-reduced-motion: reduce) { .effect-preview { animation:none; } }
    `}</style>
  </div>;
}
