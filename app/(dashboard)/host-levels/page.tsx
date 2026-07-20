'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/Table";
import {
    Award, Plus, Trash2, Edit2, Check, X, Loader2,
    RefreshCw, Coins, PhoneCall, Clock, TrendingUp
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface HostLevelConfig {
    _id: string;
    level: number;
    name: string;
    minCalls: number;
    minMinutes: number;
    coinPerMinute: number;
}

const LEVEL_PALETTE: Record<number, { bg: string; text: string; border: string; glow: string }> = {
    1: { bg: 'bg-slate-500/20',   text: 'text-slate-300',   border: 'border-slate-500/40',   glow: 'shadow-slate-500/20'   },
    2: { bg: 'bg-blue-500/20',    text: 'text-blue-300',    border: 'border-blue-500/40',     glow: 'shadow-blue-500/20'    },
    3: { bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40',  glow: 'shadow-emerald-500/20' },
    4: { bg: 'bg-violet-500/20',  text: 'text-violet-300',  border: 'border-violet-500/40',   glow: 'shadow-violet-500/20'  },
    5: { bg: 'bg-amber-500/20',   text: 'text-amber-300',   border: 'border-amber-500/40',    glow: 'shadow-amber-500/20'   },
    6: { bg: 'bg-pink-500/20',    text: 'text-pink-300',    border: 'border-pink-500/40',     glow: 'shadow-pink-500/20'    },
    7: { bg: 'bg-rose-500/20',    text: 'text-rose-300',    border: 'border-rose-500/40',     glow: 'shadow-rose-500/20'    },
    8: { bg: 'bg-orange-500/20',  text: 'text-orange-300',  border: 'border-orange-500/40',   glow: 'shadow-orange-500/20'  },
};
const getLvl = (n: number) => LEVEL_PALETTE[n] || LEVEL_PALETTE[1];

const emptyForm = { level: '', name: '', minCalls: '', minMinutes: '', coinPerMinute: '' };

export default function HostLevelsPage() {
    const [levels, setLevels] = useState<HostLevelConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Inline edit state
    const [editId, setEditId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<HostLevelConfig>>({});

    // New level form
    const [showAdd, setShowAdd] = useState(false);
    const [addForm, setAddForm] = useState<typeof emptyForm>({ ...emptyForm });

    const fetchLevels = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/admin/host-levels');
            if (res.success && res.data) {
                setLevels(res.data);
            } else {
                toast.error(res.message || 'Failed to load level configs');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error loading levels');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLevels(); }, [fetchLevels]);

    const startEdit = (lvl: HostLevelConfig) => {
        setEditId(lvl._id);
        setEditForm({ name: lvl.name, minCalls: lvl.minCalls, minMinutes: lvl.minMinutes, coinPerMinute: lvl.coinPerMinute });
    };

    const cancelEdit = () => { setEditId(null); setEditForm({}); };

    const saveEdit = async (lvl: HostLevelConfig) => {
        setSaving(true);
        try {
            const res = await apiClient.patch(`/api/admin/host-levels/${lvl._id}`, {
                name: editForm.name,
                minCalls: Number(editForm.minCalls),
                minMinutes: Number(editForm.minMinutes),
                coinPerMinute: Number(editForm.coinPerMinute),
            });
            if (res.success) {
                toast.success(`✅ Level ${lvl.level} updated`);
                setLevels(prev => prev.map(l => l._id === lvl._id ? { ...l, ...editForm } as HostLevelConfig : l));
                cancelEdit();
            } else {
                toast.error(res.message || 'Save failed');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error saving');
        } finally {
            setSaving(false);
        }
    };

    const deleteLevel = async (lvl: HostLevelConfig) => {
        if (!confirm(`Delete Level ${lvl.level} — ${lvl.name}?`)) return;
        try {
            const res = await apiClient.delete(`/api/admin/host-levels/${lvl._id}`);
            if (res.success) {
                toast.success(`Level ${lvl.level} deleted`);
                setLevels(prev => prev.filter(l => l._id !== lvl._id));
            } else {
                toast.error(res.message || 'Delete failed');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error deleting');
        }
    };

    const addLevel = async () => {
        if (!addForm.level || !addForm.name || addForm.coinPerMinute === '') {
            toast.error('Level number, name and Coin/Min are required');
            return;
        }
        setSaving(true);
        try {
            const res = await apiClient.post('/api/admin/host-levels', {
                level: Number(addForm.level),
                name: addForm.name,
                minCalls: Number(addForm.minCalls || 0),
                minMinutes: Number(addForm.minMinutes || 0),
                coinPerMinute: Number(addForm.coinPerMinute),
            });
            if (res.success) {
                toast.success(`✅ Level ${addForm.level} created`);
                setAddForm({ ...emptyForm });
                setShowAdd(false);
                fetchLevels();
            } else {
                toast.error(res.message || 'Create failed');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error creating level');
        } finally {
            setSaving(false);
        }
    };

    const totalCoins = levels.reduce((s, l) => s + l.coinPerMinute, 0);
    const maxCoins = levels.length ? Math.max(...levels.map(l => l.coinPerMinute)) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        Host Level Configuration
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Set <strong className="text-amber-300">Coin per Minute</strong> earning for each host level — higher level hosts earn more per minute.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={fetchLevels} className="gap-2">
                        <RefreshCw className="h-4 w-4" /> Refresh
                    </Button>
                    <Button size="sm" onClick={() => setShowAdd(true)} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                        <Plus className="h-4 w-4" /> Add Level
                    </Button>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">Total Levels</CardTitle>
                        <Award className="h-4 w-4 text-amber-400" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-slate-100">{levels.length}</div></CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">Max Coin/Min</CardTitle>
                        <Coins className="h-4 w-4 text-yellow-400" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-black text-yellow-300">🪙 {maxCoins}</div></CardContent>
                </Card>
                <Card className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs font-bold text-slate-400">Level Billing</CardTitle>
                        <TrendingUp className="h-4 w-4 text-violet-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-slate-400">Based on <span className="text-violet-300 font-bold">HostLevel.coinPerMinute</span></div>
                        <div className="text-xs text-slate-500 mt-0.5">Applied live during every call</div>
                    </CardContent>
                </Card>
            </div>

            {/* How it works */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-slate-300 space-y-1">
                <p className="font-semibold text-amber-300">⚡ How Level-Based Billing Works</p>
                <ul className="text-slate-400 space-y-0.5 text-xs">
                    <li>• When a call ends, the system reads the <strong className="text-slate-300">host's current level</strong> from their profile</li>
                    <li>• It looks up the matching <strong className="text-slate-300">coinPerMinute</strong> from this table</li>
                    <li>• The host earns: <code className="bg-slate-800 px-1 rounded">coinPerMinute × (callDuration in minutes)</code></li>
                    <li>• The user always pays the global call rate — the host's level only affects <strong className="text-amber-300">how much the host receives</strong></li>
                </ul>
            </div>

            {/* Add Level Form */}
            {showAdd && (
                <Card className="glass-card border-amber-500/30">
                    <CardHeader>
                        <CardTitle className="text-base text-amber-300 flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add New Level
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Level No.*</label>
                                <Input type="number" placeholder="e.g. 9"
                                    value={addForm.level}
                                    onChange={e => setAddForm(f => ({ ...f, level: e.target.value }))}
                                    className="h-9" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs text-slate-400 mb-1 block">Level Name*</label>
                                <Input placeholder="e.g. Diamond Star"
                                    value={addForm.name}
                                    onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                                    className="h-9" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">🪙 Coin/Min*</label>
                                <Input type="number" placeholder="e.g. 45"
                                    value={addForm.coinPerMinute}
                                    onChange={e => setAddForm(f => ({ ...f, coinPerMinute: e.target.value }))}
                                    className="h-9 border-amber-500/40 focus:border-amber-500" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">Min Calls</label>
                                <Input type="number" placeholder="0"
                                    value={addForm.minCalls}
                                    onChange={e => setAddForm(f => ({ ...f, minCalls: e.target.value }))}
                                    className="h-9" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white gap-2" onClick={addLevel} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                Create Level
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setAddForm({ ...emptyForm }); }}>
                                <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Levels Table */}
            <Card className="glass-card overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-700/50">
                                    <TableHead className="text-slate-300 font-bold">Level</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Name</TableHead>
                                    <TableHead className="text-slate-300 font-bold">
                                        <div className="flex items-center gap-1">
                                            <Coins className="h-3.5 w-3.5 text-yellow-400" />
                                            Coin / Min
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-300 font-bold">
                                        <div className="flex items-center gap-1">
                                            <PhoneCall className="h-3.5 w-3.5 text-violet-400" />
                                            Min Calls
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-300 font-bold">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5 text-blue-400" />
                                            Min Minutes
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-slate-300 font-bold">Earning Preview</TableHead>
                                    <TableHead className="text-slate-300 font-bold text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-16">
                                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                                <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
                                                <span>Loading level configurations...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : levels.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-16">
                                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                                <Award className="h-8 w-8 text-slate-600" />
                                                <p>No levels configured yet.</p>
                                                <Button size="sm" onClick={() => setShowAdd(true)} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                                                    <Plus className="h-4 w-4" /> Add First Level
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : levels.map(lvl => {
                                    const isEditing = editId === lvl._id;
                                    const ls = getLvl(lvl.level);
                                    // Preview: 10 minute call earning
                                    const preview10 = Math.round((isEditing ? Number(editForm.coinPerMinute) || 0 : lvl.coinPerMinute) * 10);

                                    return (
                                        <TableRow key={lvl._id} className={`border-slate-700/30 ${isEditing ? 'bg-amber-500/5' : 'hover:bg-slate-800/40'}`}>
                                            {/* Level Badge */}
                                            <TableCell>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border ${ls.bg} ${ls.text} ${ls.border}`}>
                                                    <Award className="h-3.5 w-3.5" /> {lvl.level}
                                                </span>
                                            </TableCell>

                                            {/* Name */}
                                            <TableCell>
                                                {isEditing ? (
                                                    <Input
                                                        value={editForm.name || ''}
                                                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                                        className="h-8 w-36 text-sm"
                                                    />
                                                ) : (
                                                    <span className="font-semibold text-slate-200">{lvl.name}</span>
                                                )}
                                            </TableCell>

                                            {/* Coin/Min — the key field */}
                                            <TableCell>
                                                {isEditing ? (
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            value={editForm.coinPerMinute ?? ''}
                                                            onChange={e => setEditForm(f => ({ ...f, coinPerMinute: Number(e.target.value) }))}
                                                            className="h-8 w-24 text-sm border-amber-500/50 focus:border-amber-500"
                                                        />
                                                        <span className="text-xs text-amber-300">🪙/min</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xl font-black text-yellow-300">🪙 {lvl.coinPerMinute}</span>
                                                        <span className="text-xs text-slate-500">/min</span>
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Min Calls */}
                                            <TableCell>
                                                {isEditing ? (
                                                    <Input
                                                        type="number"
                                                        value={editForm.minCalls ?? ''}
                                                        onChange={e => setEditForm(f => ({ ...f, minCalls: Number(e.target.value) }))}
                                                        className="h-8 w-24 text-sm"
                                                    />
                                                ) : (
                                                    <span className="text-slate-300">{lvl.minCalls.toLocaleString()}</span>
                                                )}
                                            </TableCell>

                                            {/* Min Minutes */}
                                            <TableCell>
                                                {isEditing ? (
                                                    <Input
                                                        type="number"
                                                        value={editForm.minMinutes ?? ''}
                                                        onChange={e => setEditForm(f => ({ ...f, minMinutes: Number(e.target.value) }))}
                                                        className="h-8 w-24 text-sm"
                                                    />
                                                ) : (
                                                    <span className="text-slate-300">{lvl.minMinutes.toLocaleString()} min</span>
                                                )}
                                            </TableCell>

                                            {/* 10-min Preview */}
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <div className="text-xs text-slate-500">10 min call →</div>
                                                    <div className="font-bold text-yellow-300">🪙 {preview10} coins</div>
                                                </div>
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-center">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button size="sm" className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                                            onClick={() => saveEdit(lvl)} disabled={saving}>
                                                            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                                            Save
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="h-7 px-2 gap-1" onClick={cancelEdit}>
                                                            <X className="h-3 w-3" /> Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button size="sm" variant="outline"
                                                            className="h-7 w-7 p-0 text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                                                            onClick={() => startEdit(lvl)}>
                                                            <Edit2 className="h-3 w-3" />
                                                        </Button>
                                                        <Button size="sm" variant="outline"
                                                            className="h-7 w-7 p-0 text-red-400 border-red-500/30 hover:bg-red-500/10"
                                                            onClick={() => deleteLevel(lvl)}>
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
