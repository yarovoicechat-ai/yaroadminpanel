'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Gem, Hash, Pencil, Plus, RefreshCw, ShoppingBag, Trash2, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

type UniqueIdLevel = { _id: string; name: string; status: string; config?: { levelNumber?: number; vipLevel?: number; badgeName?: string; badgeIconUrl?: string; animationType?: string } };
type UniqueIdItem = { _id: string; name: string; category?: string; uniqueId?: string; price: number; isActive: boolean; metadata?: any; priceOptions?: { days: number; diamonds: number }[]; imageUrl?: string; animationUrl?: string };
type EventItem = { _id: string; title: string; status?: string };

const newForm = { name: '', displayId: '', digitCount: 3, levelId: '', location: 'store', progressionType: 'wealth', requiredLevel: 10, eventId: '', price: 2500, activationDays: 30, isActive: true };

export default function UniqueIdsPage() {
  const [items, setItems] = useState<UniqueIdItem[]>([]);
  const [levels, setLevels] = useState<UniqueIdLevel[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState(newForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [idsRes, levelsRes, eventsRes] = await Promise.all([
        apiClient.get<any>('/api/store/admin/unique-ids'),
        apiClient.get<any>('/api/identity/admin/unique-id-levels'),
        apiClient.get<any>('/api/admin/events').catch(() => ({ data: [] })),
      ]);
      setItems((idsRes.data?.items || idsRes.data || []).filter((item: UniqueIdItem) => item.category === 'Unique ID'));
      setLevels(levelsRes.data?.levels || []);
      const eventList = Array.isArray(eventsRes.data) ? eventsRes.data : eventsRes.data?.events || [];
      setEvents(eventList);
      const defaultLevel = (levelsRes.data?.levels || []).find((level: UniqueIdLevel) => level.status === 'active');
      if (defaultLevel) setForm((current) => current.levelId ? current : ({ ...current, levelId: defaultLevel._id }));
    } catch (error: any) {
      toast.error(error?.message || 'Could not load Unique IDs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const chosenLevel = useMemo(() => levels.find((level) => level._id === form.levelId), [levels, form.levelId]);
  const visibleItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => !q || [item.name, item.metadata?.number, item.metadata?.displayId, item.metadata?.location, item.uniqueId].some((value) => String(value || '').toLowerCase().includes(q)));
  }, [items, search]);

  const resetForm = () => { setEditingId(null); setForm({ ...newForm, levelId: levels.find((level) => level.status === 'active')?._id || '' }); };

  const saveItem = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = form.displayId.trim();
    if (!chosenLevel || chosenLevel.status !== 'active') { toast.error('Choose an active Unique ID level'); return; }
    if (!/^\d+$/.test(code) || code.length !== Number(form.digitCount)) { toast.error(`Enter exactly ${form.digitCount} numeric digits`); return; }
    if (form.location === 'event' && !form.eventId) { toast.error('Choose the event that will award this ID'); return; }
    if (form.location === 'level' && (!Number.isInteger(Number(form.requiredLevel)) || Number(form.requiredLevel) < 1)) { toast.error('Set a valid reward level'); return; }
    const metadata = {
      ...(editingId ? items.find((item) => item._id === editingId)?.metadata : {}),
      number: code,
      displayId: code,
      uniqueDisplayId: code,
      digits: Number(form.digitCount),
      digitCount: Number(form.digitCount),
      uniqueIdLevelId: chosenLevel._id,
      levelNumber: Number(chosenLevel.config?.levelNumber || chosenLevel.config?.vipLevel || 1),
      levelName: chosenLevel.name,
      badgeName: chosenLevel.config?.badgeName || 'VIP ID',
      badgeIconUrl: chosenLevel.config?.badgeIconUrl || '',
      badgeAnimationType: chosenLevel.config?.animationType || 'svga',
      location: form.location,
      progressionType: form.location === 'level' ? form.progressionType : undefined,
      requiredLevel: form.location === 'level' ? Number(form.requiredLevel) : undefined,
      eventId: form.location === 'event' ? form.eventId : undefined,
      eventTitle: form.location === 'event' ? events.find((entry) => entry._id === form.eventId)?.title || '' : undefined,
      activationDurationDays: Number(form.activationDays) || 30,
    };
    const imageUrl = chosenLevel.config?.badgeIconUrl || '';
    const payload = {
      name: form.name.trim() || `${code} · ${chosenLevel.name}`,
      category: 'Unique ID',
      audience: form.location === 'event' ? 'event' : 'general',
      price: form.location === 'store' ? Number(form.price) : 0,
      priceOptions: form.location === 'store' ? [
        { days: 3, diamonds: Math.round(Number(form.price) * 0.15) },
        { days: 7, diamonds: Math.round(Number(form.price) * 0.3) },
        { days: 15, diamonds: Math.round(Number(form.price) * 0.55) },
        { days: 30, diamonds: Number(form.price) },
      ] : [],
      validity: `${form.activationDays} Days`,
      badgeText: chosenLevel.config?.badgeName || 'VIP ID',
      previewColor: '#EAB308',
      bgColors: ['#78350F', '#B45309', '#D97706'],
      imageUrl,
      animationUrl: imageUrl,
      desc: `Unique ID ${code} · Level ${metadata.levelNumber} ${chosenLevel.name}`,
      isActive: form.isActive,
      metadata,
    };
    setLoading(true);
    try {
      if (editingId) await apiClient.put(`/api/store/items/${editingId}`, payload);
      else await apiClient.post('/api/store/items', payload);
      toast.success(editingId ? 'Unique ID updated' : 'Unique ID created');
      resetForm();
      await loadData();
    } catch (error: any) {
      toast.error(error?.message || 'Could not save Unique ID');
    } finally {
      setLoading(false);
    }
  };

  const editItem = (item: UniqueIdItem) => {
    const metadata = item.metadata || {};
    setEditingId(item._id);
    setForm({
      name: item.name || '',
      displayId: String(metadata.uniqueDisplayId || metadata.displayId || metadata.number || ''),
      digitCount: Number(metadata.digitCount || metadata.digits || String(metadata.number || '').length || 3),
      levelId: String(metadata.uniqueIdLevelId || ''),
      location: metadata.location || 'store',
      progressionType: metadata.progressionType || 'wealth',
      requiredLevel: Number(metadata.requiredLevel || 10),
      eventId: String(metadata.eventId || ''),
      price: Number(item.price || 0),
      activationDays: Number(metadata.activationDurationDays || 30),
      isActive: item.isActive !== false,
    });
  };

  const deleteItem = async (item: UniqueIdItem) => {
    if (!confirm(`Delete Unique ID ${item.metadata?.number || item.name}?`)) return;
    try {
      await apiClient.delete(`/api/store/items/${item._id}`);
      toast.success('Unique ID deleted');
      await loadData();
    } catch (error: any) { toast.error(error?.message || 'Could not delete Unique ID'); }
  };

  const assetUrl = chosenLevel?.config?.badgeIconUrl || '';
  const previewIsImage = assetUrl && !/\.svga(?:\?.*)?$/i.test(assetUrl);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="flex items-center gap-3 text-2xl font-bold"><Hash className="h-7 w-7 text-amber-400" />Unique IDs</h1><p className="mt-1 text-sm text-muted-foreground">Create the ID number, choose its badge level, then make it available in Store, a Level reward, or an Event.</p></div><Button variant="outline" onClick={() => void loadData()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh</Button></div>

      <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <Card className="h-fit"><CardHeader><CardTitle>{editingId ? 'Edit Unique ID' : 'Create Unique ID'}</CardTitle></CardHeader><CardContent>
          <form onSubmit={saveItem} className="space-y-4">
            <label className="block space-y-1 text-xs text-muted-foreground">ID name<Input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Lucky 111" maxLength={70} /></label>
            <div className="grid grid-cols-2 gap-3"><label className="space-y-1 text-xs text-muted-foreground">Number of digits<Input type="number" min={3} max={12} value={form.digitCount} onChange={(e) => setForm((current) => { const digitCount = Math.max(3, Math.min(12, Number(e.target.value) || 3)); return { ...current, digitCount, displayId: current.displayId.slice(0, digitCount) }; })} required /></label><label className="space-y-1 text-xs text-muted-foreground">Unique ID number<Input value={form.displayId} inputMode="numeric" onChange={(e) => setForm((current) => ({ ...current, displayId: e.target.value.replace(/\D/g, '').slice(0, current.digitCount) }))} placeholder={'1'.repeat(Math.min(form.digitCount || 3, 6))} maxLength={12} required /></label></div>
            <label className="block space-y-1 text-xs text-muted-foreground">Unique ID level<select value={form.levelId} onChange={(e) => setForm((current) => ({ ...current, levelId: e.target.value }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required><option value="">Choose level</option>{levels.filter((level) => level.status === 'active').map((level) => <option key={level._id} value={level._id}>Level {level.config?.levelNumber || level.config?.vipLevel} · {level.name}</option>)}</select></label>
            {chosenLevel && <div className="rounded-xl border border-amber-400/20 bg-gradient-to-r from-amber-500/10 to-slate-900 p-3"><div className="flex items-center gap-3">{previewIsImage ? <img src={assetUrl} alt="Selected level badge" className="h-12 w-12 object-contain" /> : <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full border-2 border-amber-300 bg-amber-700"><Gem className="h-6 w-6 text-white" /></div>}<div className="min-w-0"><div className="font-semibold">Level {chosenLevel.config?.levelNumber || chosenLevel.config?.vipLevel} · {chosenLevel.name}</div><div className="text-xs text-muted-foreground">{chosenLevel.config?.badgeName || 'VIP ID'} badge preview</div></div></div><div className="mt-3 truncate rounded-lg bg-slate-950/60 px-3 py-2 text-center font-mono text-xl font-black tracking-[0.25em] text-amber-300">{form.displayId || '0'.repeat(Math.min(form.digitCount || 3, 6))}</div></div>}
            <label className="block space-y-1 text-xs text-muted-foreground">Where is this ID available?<select value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="store">Store purchase</option><option value="level">Level reward</option><option value="event">Event reward</option></select></label>
            {form.location === 'store' && <label className="block space-y-1 text-xs text-muted-foreground">30-day price (diamonds)<Input type="number" min={0} value={form.price} onChange={(e) => setForm((current) => ({ ...current, price: Number(e.target.value) }))} required /></label>}
            {form.location === 'level' && <div className="grid grid-cols-2 gap-3"><label className="space-y-1 text-xs text-muted-foreground">Level path<select value={form.progressionType} onChange={(e) => setForm((current) => ({ ...current, progressionType: e.target.value }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="wealth">Wealth</option><option value="charm">Charm</option></select></label><label className="space-y-1 text-xs text-muted-foreground">Unlock at level<Input type="number" min={1} max={150} value={form.requiredLevel} onChange={(e) => setForm((current) => ({ ...current, requiredLevel: Number(e.target.value) }))} required /></label></div>}
            {form.location === 'event' && <label className="block space-y-1 text-xs text-muted-foreground">Event<select value={form.eventId} onChange={(e) => setForm((current) => ({ ...current, eventId: e.target.value }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" required><option value="">Select event</option>{events.map((event) => <option key={event._id} value={event._id}>{event.title} {event.status ? `(${event.status})` : ''}</option>)}</select></label>}
            <label className="block space-y-1 text-xs text-muted-foreground">ID validity after user activates it (days)<select value={form.activationDays} onChange={(e) => setForm((current) => ({ ...current, activationDays: Number(e.target.value) }))} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">{[3, 7, 15, 30].map((days) => <option key={days} value={days}>{days} days</option>)}</select></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm((current) => ({ ...current, isActive: e.target.checked }))} />Active</label>
            <div className="flex gap-2"><Button className="flex-1" disabled={loading || !levels.some((level) => level.status === 'active')}><Plus className="mr-2 h-4 w-4" />{editingId ? 'Save Unique ID' : 'Create Unique ID'}</Button>{editingId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}</div>
          </form>
        </CardContent></Card>

        <Card><CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle>Unique ID Catalog</CardTitle><p className="mt-1 text-xs text-muted-foreground">Store IDs can be purchased and kept in My Items until activated. Level rewards are claimable in the level screen; event IDs are reserved for that event.</p></div><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ID, level, location" className="sm:max-w-xs" /></CardHeader><CardContent className="space-y-3">
          {visibleItems.length === 0 ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No Unique IDs created yet.</div> : visibleItems.map((item) => {
            const metadata = item.metadata || {};
            const location = metadata.location || 'store';
            const locationLabel = location === 'level' ? `${metadata.progressionType || 'wealth'} level ${metadata.requiredLevel || ''}` : location === 'event' ? metadata.eventTitle || 'Event' : 'Store';
            return <div key={item._id} className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 font-mono font-black text-amber-300">{metadata.digitCount || metadata.digits || String(metadata.number || '').length}D</div>
              <div className="min-w-0 flex-1"><div className="font-semibold">{metadata.number || metadata.uniqueDisplayId || item.name}</div><div className="truncate text-xs text-muted-foreground">{item.name} · Level {metadata.levelNumber || '?'} {metadata.levelName || ''}</div></div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">{location === 'store' ? <ShoppingBag className="h-4 w-4" /> : location === 'level' ? <Trophy className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}{locationLabel}</div>
              {location === 'store' && <Badge variant="outline"><Gem className="mr-1 h-3 w-3" />{item.price.toLocaleString()}</Badge>}
              <Badge variant={item.isActive ? 'success' : 'secondary'}>{item.isActive ? 'Active' : 'Hidden'}</Badge>
              <Button variant="outline" size="sm" onClick={() => editItem(item)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="destructive" size="sm" onClick={() => void deleteItem(item)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>;
          })}
        </CardContent></Card>
      </div>
    </div>
  );
}
