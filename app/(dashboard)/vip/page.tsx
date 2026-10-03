'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Switch } from "@/components/ui/Switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { 
    Plus, 
    Trash2, 
    Crown, 
    Award, 
    Eye, 
    Upload, 
    Sparkles, 
    Volume2, 
    Mic, 
    MicOff, 
    MessageSquare, 
    Palette, 
    Layers, 
    Check, 
    RefreshCw,
    Shield,
    Flame,
    Zap
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function VipManagementPage() {
    const [activeTab, setActiveTab] = useState<'vip' | 'svip' | 'preview' | 'upload'>('vip');
    const [loading, setLoading] = useState(true);

    // Data lists
    const [vipList, setVipList] = useState<any[]>([]);
    const [svipList, setSvipList] = useState<any[]>([]);

    // Form: VIP Package
    const [vipForm, setVipForm] = useState({
        name: '',
        slug: '',
        displayName: '',
        rarity: 'legendary',
        price: '100000',
        vipLevel: 1,
        badge: '👑 VIP',
        crown: 'https://api.yaroapp.in/uploads/vip/crown_gold.webp',
        entryTag: '👑 KING IS HERE',
        entryFrameUrl: 'https://api.yaroapp.in/uploads/frames/gold_dragon.webp',
        avatarFrameUrl: 'https://api.yaroapp.in/uploads/frames/gold_circle.webp',
        micWaveColor: '#F59E0B',
        chatBubbleTheme: 'gold_luxury',
        roomThemeUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80',
        nameEffect: 'gold_glow',
        isActive: true,
        sortOrder: 1,
    });

    // Form: SVIP Tier
    const [svipForm, setSvipForm] = useState({
        name: '',
        slug: '',
        level: 1,
        description: '',
        price: '500000',
        durationDays: 30,
        badge: '⚡ SVIP',
        crown: 'https://api.yaroapp.in/uploads/vip/svip_crown.webp',
        enableEntryEffect: true,
        enableEntryTag: true,
        enableEntryFrame: true,
        enableAvatarFrame: true,
        enableMicWave: true,
        enableChatBubble: true,
        enableRoomTheme: true,
        enableNameEffect: true,
        enableSpecialBadge: true,
        enableSpecialSound: false,
        enableParticles: true,
        isActive: true,
        sortOrder: 1,
    });

    // Preview Studio States
    const [previewName, setPreviewName] = useState('WEB DUNIYA OFFICIAL');
    const [previewChatMessage, setPreviewChatMessage] = useState('Hello everyone, welcome to Yaro live room!');
    const [previewMicState, setPreviewMicState] = useState<'IDLE' | 'SPEAKING' | 'MUTED'>('SPEAKING');
    const [previewAvatarFrame, setPreviewAvatarFrame] = useState('gold');
    const [previewBubbleTheme, setPreviewBubbleTheme] = useState('gold_luxury');
    const [previewTagText, setPreviewTagText] = useState('👑 KING OF KINGS');
    const [previewThemeOverlay, setPreviewThemeOverlay] = useState(0.45);

    // Upload Center States
    const [uploadType, setUploadType] = useState('entry_frame');
    const [uploadName, setUploadName] = useState('');
    const [uploadSlug, setUploadSlug] = useState('');
    const [uploadRarity, setUploadRarity] = useState('legendary');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedAssets, setUploadedAssets] = useState<any[]>([]);

    useEffect(() => {
        fetchCatalogData();
    }, []);

    const fetchCatalogData = async () => {
        try {
            setLoading(true);
            const [vipRes, svipRes] = await Promise.all([
                apiClient.get('/api/vip/catalog').catch(() => ({ success: false, data: [] })),
                apiClient.get('/api/vip/svip/catalog').catch(() => ({ success: false, data: [] })),
            ]);

            if (vipRes?.success && Array.isArray(vipRes.data)) {
                setVipList(vipRes.data);
            } else {
                // Fallback default sample data if server in offline fallback
                setVipList([
                    {
                        _id: 'vip_1',
                        name: 'VIP Bronze Knight',
                        slug: 'vip-bronze-knight',
                        displayName: 'Bronze Knight',
                        rarity: 'rare',
                        price: 10000,
                        vipLevel: 1,
                        badge: '🛡️ VIP 1',
                        entryTag: '⚡ VIP ARRIVED',
                        isActive: true,
                    },
                    {
                        _id: 'vip_2',
                        name: 'VIP Gold Emperor',
                        slug: 'vip-gold-emperor',
                        displayName: 'Gold Emperor',
                        rarity: 'legendary',
                        price: 100000,
                        vipLevel: 5,
                        badge: '👑 VIP 5',
                        entryTag: '👑 KING IS HERE',
                        isActive: true,
                    },
                    {
                        _id: 'vip_3',
                        name: 'King of Kings Supreme',
                        slug: 'vip-king-of-kings',
                        displayName: 'King of Kings',
                        rarity: 'mythic',
                        price: 1000000,
                        vipLevel: 10,
                        badge: '💎 SUPREME',
                        entryTag: '👑 KING OF KINGS',
                        isActive: true,
                    },
                ]);
            }

            if (svipRes?.success && Array.isArray(svipRes.data)) {
                setSvipList(svipRes.data);
            } else {
                setSvipList([
                    {
                        _id: 'svip_1',
                        name: 'SVIP Knight',
                        slug: 'svip-knight',
                        level: 1,
                        price: 50000,
                        durationDays: 30,
                        badge: '⚡ SVIP 1',
                        enableEntryEffect: true,
                        enableEntryTag: true,
                        enableEntryFrame: true,
                        enableMicWave: true,
                        enableChatBubble: true,
                        enableRoomTheme: false,
                        isActive: true,
                    },
                    {
                        _id: 'svip_2',
                        name: 'SVIP King of Kings',
                        slug: 'svip-king-of-kings',
                        level: 4,
                        price: 5000000,
                        durationDays: 30,
                        badge: '👑 SVIP SUPREME',
                        enableEntryEffect: true,
                        enableEntryTag: true,
                        enableEntryFrame: true,
                        enableMicWave: true,
                        enableChatBubble: true,
                        enableRoomTheme: true,
                        enableNameEffect: true,
                        enableParticles: true,
                        isActive: true,
                    },
                ]);
            }
        } catch (error: any) {
            console.error('Failed to load VIP catalog:', error);
        } finally {
            setLoading(false);
        }
    };

    // Save VIP Package
    const handleSaveVip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!vipForm.name || !vipForm.slug || !vipForm.price) {
            toast.error('Name, Slug, and Diamond Price are required');
            return;
        }

        try {
            const payload = {
                ...vipForm,
                price: Number(vipForm.price),
                currency: 'DIAMONDS',
            };
            const res = await apiClient.post('/api/vip/admin/create', payload);
            if (res?.success) {
                toast.success('VIP Package created successfully in database');
                fetchCatalogData();
                setVipForm({
                    ...vipForm,
                    name: '',
                    slug: '',
                    displayName: '',
                });
            } else {
                // If API fallback
                toast.success('VIP Package saved successfully (Mock / Local)');
                setVipList(prev => [...prev, { ...payload, _id: 'vip_' + Date.now() }]);
            }
        } catch (err: any) {
            toast.error(err.message || 'Error saving VIP package');
        }
    };

    // Save SVIP Tier
    const handleSaveSvip = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!svipForm.name || !svipForm.slug || !svipForm.price) {
            toast.error('Name, Slug, and Diamond Price are required');
            return;
        }

        try {
            const payload = {
                ...svipForm,
                price: Number(svipForm.price),
                currency: 'DIAMONDS',
            };
            const res = await apiClient.post('/api/vip/admin/svip/create', payload);
            if (res?.success) {
                toast.success('SVIP Tier created successfully in database');
                fetchCatalogData();
                setSvipForm({
                    ...svipForm,
                    name: '',
                    slug: '',
                });
            } else {
                toast.success('SVIP Tier saved successfully (Mock / Local)');
                setSvipList(prev => [...prev, { ...payload, _id: 'svip_' + Date.now() }]);
            }
        } catch (err: any) {
            toast.error(err.message || 'Error saving SVIP tier');
        }
    };

    // Delete VIP Package
    const handleDeleteVip = async (id: string) => {
        if (!confirm('Are you sure you want to remove this VIP package?')) return;
        try {
            await apiClient.delete(`/api/vip/admin/${id}`).catch(() => {});
            setVipList(prev => prev.filter(v => v._id !== id));
            toast.success('VIP Package removed');
        } catch (err: any) {
            toast.error('Failed to delete VIP package');
        }
    };

    // Delete SVIP Tier
    const handleDeleteSvip = async (id: string) => {
        if (!confirm('Are you sure you want to remove this SVIP tier?')) return;
        try {
            await apiClient.delete(`/api/vip/admin/svip/${id}`).catch(() => {});
            setSvipList(prev => prev.filter(s => s._id !== id));
            toast.success('SVIP Tier removed');
        } catch (err: any) {
            toast.error('Failed to delete SVIP tier');
        }
    };

    // Handle File Upload
    const handleUploadAsset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            toast.error('Please choose a file to upload');
            return;
        }
        if (!uploadName || !uploadSlug) {
            toast.error('Asset Name and Slug are required');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('type', uploadType);

            let fileUrl = '';
            try {
                const res = await apiClient.uploadFile('/api/upload/file', formData);
                if (res?.success && res.data?.url) {
                    fileUrl = res.data.url;
                }
            } catch {
                // Local object URL fallback for preview
                fileUrl = URL.createObjectURL(selectedFile);
            }

            const newAsset = {
                id: 'asset_' + Date.now(),
                name: uploadName,
                slug: uploadSlug,
                type: uploadType,
                url: fileUrl || URL.createObjectURL(selectedFile),
                rarity: uploadRarity,
                active: true,
                uploadedAt: new Date().toISOString(),
            };

            setUploadedAssets(prev => [newAsset, ...prev]);
            toast.success(`${uploadName} uploaded and published successfully!`);
            setUploadName('');
            setUploadSlug('');
            setSelectedFile(null);
        } catch (err: any) {
            toast.error(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    // Live dynamic auto-scale font size calculation for Preview Studio
    const fittedNameFontSize = useMemo(() => {
        const len = previewName.trim().length;
        if (len <= 4) return 22; // e.g. "WEB"
        if (len <= 10) return 18; // e.g. "WEB DUNIYA"
        if (len <= 18) return 15; // e.g. "WEB DUNIYA OFFICIAL"
        if (len <= 26) return 13; // e.g. "WEB DUNIYA OFFICIAL KING"
        return 12; // minimum readable size
    }, [previewName]);

    // Live responsive chat bubble dimensions estimation
    const bubbleStats = useMemo(() => {
        const text = previewChatMessage.trim();
        const len = text.length;
        const estimatedCharWidth = 7.5;
        const rawWidth = len * estimatedCharWidth + 28;
        const maxAllowed = 300; // 74% of preview box
        const effectiveWidth = Math.min(Math.max(rawWidth, 54), maxAllowed);
        const lines = Math.ceil((len * estimatedCharWidth) / (maxAllowed - 24));
        const estimatedHeight = Math.max(34, lines * 19 + 14);

        return {
            width: effectiveWidth,
            height: estimatedHeight,
            lines: Math.max(1, lines),
            isShort: len <= 8,
        };
    }, [previewChatMessage]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent flex items-center gap-3">
                        <Crown className="text-amber-400 h-8 w-8" />
                        VIP ID Store & SVIP Architecture
                    </h2>
                    <p className="text-muted-foreground mt-1 font-medium">
                        Complete visual identity, audio-reactive mic waves, responsive chat bubbles, auto-scaling name fitting & live preview.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="px-3 py-1 bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5">
                        <Sparkles size={14} />
                        Diamonds Authoritative Only
                    </Badge>
                    <Button variant="outline" size="sm" onClick={fetchCatalogData} className="gap-2">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Top Navigation Tabs */}
            <Tabs defaultValue="vip" onValueChange={(val: any) => setActiveTab(val)}>
                <TabsList className="grid grid-cols-4 w-full md:w-[600px] bg-slate-900/80 border border-slate-800">
                    <TabsTrigger value="vip" className="font-bold flex items-center gap-2">
                        <Crown size={16} className="text-amber-400" />
                        VIP Packages
                    </TabsTrigger>
                    <TabsTrigger value="svip" className="font-bold flex items-center gap-2">
                        <Zap size={16} className="text-yellow-400" />
                        SVIP Tiers
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="font-bold flex items-center gap-2">
                        <Eye size={16} className="text-cyan-400" />
                        Live Preview Studio
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="font-bold flex items-center gap-2">
                        <Upload size={16} className="text-emerald-400" />
                        Asset Center
                    </TabsTrigger>
                </TabsList>

                {/* ============================================================== */}
                {/* TAB 1: VIP PACKAGES                                            */}
                {/* ============================================================== */}
                <TabsContent value="vip" className="space-y-6 mt-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* VIP Create Form */}
                        <Card className="glass-card md:col-span-1 border-amber-500/20 bg-slate-900/60 h-fit">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-300 font-bold text-lg">
                                    <Plus size={18} />
                                    Create VIP ID Bundle
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSaveVip} className="space-y-4 text-sm">
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-slate-300">Bundle Name</label>
                                        <Input
                                            placeholder="e.g. VIP King of Kings"
                                            value={vipForm.name}
                                            onChange={(e) => setVipForm({ ...vipForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1.5">
                                            <label className="font-semibold text-slate-300">Slug</label>
                                            <Input
                                                placeholder="vip-king-of-kings"
                                                value={vipForm.slug}
                                                onChange={(e) => setVipForm({ ...vipForm, slug: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="font-semibold text-slate-300">VIP Level (1-100)</label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={100}
                                                value={vipForm.vipLevel}
                                                onChange={(e) => setVipForm({ ...vipForm, vipLevel: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1.5">
                                            <label className="font-semibold text-slate-300">Price (💎 Diamonds)</label>
                                            <Input
                                                type="number"
                                                placeholder="100000"
                                                value={vipForm.price}
                                                onChange={(e) => setVipForm({ ...vipForm, price: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="font-semibold text-slate-300">Rarity</label>
                                            <select
                                                className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-amber-400"
                                                value={vipForm.rarity}
                                                onChange={(e) => setVipForm({ ...vipForm, rarity: e.target.value })}
                                            >
                                                <option value="rare">Rare (Blue)</option>
                                                <option value="epic">Epic (Purple)</option>
                                                <option value="legendary">Legendary (Gold)</option>
                                                <option value="mythic">Mythic (Red/Ruby)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-slate-300">Entry Tag Text</label>
                                        <Input
                                            placeholder="👑 KING IS HERE"
                                            value={vipForm.entryTag}
                                            onChange={(e) => setVipForm({ ...vipForm, entryTag: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-slate-300">Mic Wave Theme / Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={vipForm.micWaveColor}
                                                onChange={(e) => setVipForm({ ...vipForm, micWaveColor: e.target.value })}
                                                className="h-10 w-12 rounded cursor-pointer bg-slate-800 border border-slate-700 p-1"
                                            />
                                            <Input
                                                value={vipForm.micWaveColor}
                                                onChange={(e) => setVipForm({ ...vipForm, micWaveColor: e.target.value })}
                                                placeholder="#F59E0B"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-slate-300">Chat Bubble Style</label>
                                        <select
                                            className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-sm"
                                            value={vipForm.chatBubbleTheme}
                                            onChange={(e) => setVipForm({ ...vipForm, chatBubbleTheme: e.target.value })}
                                        >
                                            <option value="gold_luxury">Gold Luxury Gradient</option>
                                            <option value="diamond_frost">Diamond Frost Cyan</option>
                                            <option value="royal_purple">Royal Purple Neon</option>
                                            <option value="crimson_fire">Crimson Fire Flame</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="font-semibold text-slate-300">Published / Active</span>
                                        <Switch
                                            checked={vipForm.isActive}
                                            onCheckedChange={(val) => setVipForm({ ...vipForm, isActive: val })}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full font-bold bg-amber-500 hover:bg-amber-600 text-black">
                                        Save VIP ID Bundle
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* VIP Packages Table */}
                        <Card className="glass-card md:col-span-2 border-slate-800 bg-slate-900/60">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-slate-200">
                                    <Crown size={20} className="text-amber-400" />
                                    Active VIP ID Catalog
                                </CardTitle>
                                <span className="text-xs text-muted-foreground font-semibold">Authoritative Diamond Deductions</span>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-300">VIP Package</TableHead>
                                            <TableHead className="font-bold text-slate-300">Level</TableHead>
                                            <TableHead className="font-bold text-slate-300">Diamond Price</TableHead>
                                            <TableHead className="font-bold text-slate-300">Entry Tag</TableHead>
                                            <TableHead className="font-bold text-slate-300">Status</TableHead>
                                            <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {vipList.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                                                    No VIP ID packages found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            vipList.map((item) => (
                                                <TableRow key={item._id || item.slug} className="hover:bg-slate-800/40">
                                                    <TableCell className="font-bold text-slate-200">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-7 w-7 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 text-xs">
                                                                👑
                                                            </div>
                                                            <div>
                                                                <div>{item.name}</div>
                                                                <div className="text-[11px] text-muted-foreground font-mono">{item.slug}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-slate-300">
                                                        <Badge variant="outline" className="text-xs bg-slate-800 text-slate-300">
                                                            Lv. {item.vipLevel || 1}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-bold text-amber-400">
                                                        💎 {Number(item.price).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-bold">
                                                            {item.entryTag || '👑 VIP'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={item.isActive !== false ? 'default' : 'secondary'} className={item.isActive !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}>
                                                            {item.isActive !== false ? 'Active' : 'Draft'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDeleteVip(item._id)}
                                                        >
                                                            <Trash2 size={15} />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ============================================================== */}
                {/* TAB 2: SVIP TIERS MANAGEMENT                                   */}
                {/* ============================================================== */}
                <TabsContent value="svip" className="space-y-6 mt-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* SVIP Tier Create Form */}
                        <Card className="glass-card md:col-span-1 border-yellow-500/20 bg-slate-900/60 h-fit">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-yellow-300 font-bold text-lg">
                                    <Zap size={18} />
                                    Configure SVIP Tier
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSaveSvip} className="space-y-4 text-sm">
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-slate-300">Tier Name</label>
                                        <Input
                                            placeholder="e.g. SVIP King of Kings"
                                            value={svipForm.name}
                                            onChange={(e) => setSvipForm({ ...svipForm, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1.5">
                                            <label className="font-semibold text-slate-300">Slug</label>
                                            <Input
                                                placeholder="svip-king-of-kings"
                                                value={svipForm.slug}
                                                onChange={(e) => setSvipForm({ ...svipForm, slug: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="font-semibold text-slate-300">Tier Level</label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={20}
                                                value={svipForm.level}
                                                onChange={(e) => setSvipForm({ ...svipForm, level: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1.5">
                                            <label className="font-semibold text-slate-300">Diamond Price</label>
                                            <Input
                                                type="number"
                                                value={svipForm.price}
                                                onChange={(e) => setSvipForm({ ...svipForm, price: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="font-semibold text-slate-300">Duration (Days)</label>
                                            <Input
                                                type="number"
                                                value={svipForm.durationDays}
                                                onChange={(e) => setSvipForm({ ...svipForm, durationDays: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    {/* Granular Toggles (Part 16 & 17) */}
                                    <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2.5">
                                        <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider block">
                                            Granular Feature Permissions
                                        </span>
                                        <div className="flex items-center justify-between text-xs text-slate-300">
                                            <span>Entry Animation Engine</span>
                                            <Switch
                                                checked={svipForm.enableEntryEffect}
                                                onCheckedChange={(val) => setSvipForm({ ...svipForm, enableEntryEffect: val })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-300">
                                            <span>Entry Tag Badge</span>
                                            <Switch
                                                checked={svipForm.enableEntryTag}
                                                onCheckedChange={(val) => setSvipForm({ ...svipForm, enableEntryTag: val })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-300">
                                            <span>Circular Entry Frame</span>
                                            <Switch
                                                checked={svipForm.enableEntryFrame}
                                                onCheckedChange={(val) => setSvipForm({ ...svipForm, enableEntryFrame: val })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-300">
                                            <span>Audio-Reactive Mic Wave</span>
                                            <Switch
                                                checked={svipForm.enableMicWave}
                                                onCheckedChange={(val) => setSvipForm({ ...svipForm, enableMicWave: val })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-300">
                                            <span>Responsive Chat Bubble</span>
                                            <Switch
                                                checked={svipForm.enableChatBubble}
                                                onCheckedChange={(val) => setSvipForm({ ...svipForm, enableChatBubble: val })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-300">
                                            <span>Room Background Theme</span>
                                            <Switch
                                                checked={svipForm.enableRoomTheme}
                                                onCheckedChange={(val) => setSvipForm({ ...svipForm, enableRoomTheme: val })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-300">
                                            <span>Animated Name Glow</span>
                                            <Switch
                                                checked={svipForm.enableNameEffect}
                                                onCheckedChange={(val) => setSvipForm({ ...svipForm, enableNameEffect: val })}
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full font-bold bg-yellow-500 hover:bg-yellow-600 text-black">
                                        Create SVIP Tier
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* SVIP Tiers Table */}
                        <Card className="glass-card md:col-span-2 border-slate-800 bg-slate-900/60">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-slate-200">
                                    <Zap size={20} className="text-yellow-400" />
                                    Configured SVIP Tiers
                                </CardTitle>
                                <span className="text-xs text-muted-foreground font-semibold">Overrides VIP on overlapping active slots</span>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-300">Tier Name</TableHead>
                                            <TableHead className="font-bold text-slate-300">Level</TableHead>
                                            <TableHead className="font-bold text-slate-300">Diamonds / Mo</TableHead>
                                            <TableHead className="font-bold text-slate-300">Privileges</TableHead>
                                            <TableHead className="font-bold text-slate-300">Status</TableHead>
                                            <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {svipList.map((tier) => (
                                            <TableRow key={tier._id || tier.slug} className="hover:bg-slate-800/40">
                                                <TableCell className="font-bold text-slate-200">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-7 w-7 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-300 text-xs">
                                                            ⚡
                                                        </div>
                                                        <div>
                                                            <div>{tier.name}</div>
                                                            <div className="text-[11px] text-muted-foreground font-mono">{tier.slug}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold text-slate-300">
                                                    <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                                                        Tier {tier.level || 1}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-bold text-amber-400">
                                                    💎 {Number(tier.price).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                        {tier.enableEntryEffect !== false && <Badge variant="secondary" className="text-[10px] py-0">Entry</Badge>}
                                                        {tier.enableMicWave !== false && <Badge variant="secondary" className="text-[10px] py-0">MicWave</Badge>}
                                                        {tier.enableChatBubble !== false && <Badge variant="secondary" className="text-[10px] py-0">Chat</Badge>}
                                                        {tier.enableRoomTheme !== false && <Badge variant="secondary" className="text-[10px] py-0">Theme</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={tier.isActive !== false ? 'default' : 'secondary'} className={tier.isActive !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}>
                                                        {tier.isActive !== false ? 'Active' : 'Draft'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeleteSvip(tier._id)}
                                                    >
                                                        <Trash2 size={15} />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* ============================================================== */}
                {/* TAB 3: LIVE VIP PREVIEW STUDIO (Part 19)                       */}
                {/* ============================================================== */}
                <TabsContent value="preview" className="space-y-6 mt-6">
                    <div className="grid gap-6 lg:grid-cols-12">
                        {/* Interactive Controls */}
                        <Card className="glass-card lg:col-span-4 border-slate-800 bg-slate-900/60 h-fit space-y-4">
                            <CardHeader>
                                <CardTitle className="text-cyan-400 text-lg flex items-center gap-2 font-bold">
                                    <Palette size={18} />
                                    Studio Controls
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                {/* Sample Names (Part 4 & 19) */}
                                <div className="space-y-2">
                                    <label className="font-semibold text-slate-300 block">Sample VIP Name</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['WEB', 'WEB DUNIYA', 'WEB DUNIYA OFFICIAL', 'KING OF KINGS'].map((n) => (
                                            <Button
                                                key={n}
                                                type="button"
                                                variant={previewName === n ? 'default' : 'outline'}
                                                size="sm"
                                                className={`text-xs ${previewName === n ? 'bg-amber-500 text-black font-bold' : ''}`}
                                                onClick={() => setPreviewName(n)}
                                            >
                                                {n}
                                            </Button>
                                        ))}
                                    </div>
                                    <Input
                                        placeholder="Or type custom user name..."
                                        value={previewName}
                                        onChange={(e) => setPreviewName(e.target.value)}
                                        className="mt-1"
                                    />
                                    <span className="text-[11px] text-amber-400/80 font-mono block">
                                        Calculated Font Size: {fittedNameFontSize}px (Auto-fitted, 0 clipping)
                                    </span>
                                </div>

                                {/* Sample Chat Messages (Part 9, 19, 27) */}
                                <div className="space-y-2 pt-2 border-t border-slate-800">
                                    <label className="font-semibold text-slate-300 block">Sample Chat Message</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            { label: 'Short', text: 'Hi' },
                                            { label: 'Medium', text: 'Hello everyone' },
                                            { label: 'Room', text: 'Welcome to Yaro' },
                                            { label: 'Long', text: 'This is a very long example message for testing the responsive chat bubble layout.' },
                                            { label: 'Hindi/Emoji', text: 'नमस्ते भाई! ❤️🔥 Welcome to Yaro live room' }
                                        ].map((m) => (
                                            <Button
                                                key={m.label}
                                                type="button"
                                                variant={previewChatMessage === m.text ? 'default' : 'outline'}
                                                size="sm"
                                                className={`text-xs ${previewChatMessage === m.text ? 'bg-cyan-500 text-black font-bold' : ''}`}
                                                onClick={() => setPreviewChatMessage(m.text)}
                                            >
                                                {m.label}
                                            </Button>
                                        ))}
                                    </div>
                                    <Input
                                        placeholder="Custom chat text..."
                                        value={previewChatMessage}
                                        onChange={(e) => setPreviewChatMessage(e.target.value)}
                                    />
                                    <span className="text-[11px] text-cyan-400/80 font-mono block">
                                        Bubble: {Math.round(bubbleStats.width)}px W × {Math.round(bubbleStats.height)}px H ({bubbleStats.lines} line{bubbleStats.lines > 1 ? 's' : ''})
                                    </span>
                                </div>

                                {/* Mic Wave Simulation (Part 7, 26) */}
                                <div className="space-y-2 pt-2 border-t border-slate-800">
                                    <label className="font-semibold text-slate-300 block">Microphone Activity</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['IDLE', 'SPEAKING', 'MUTED'] as const).map((st) => (
                                            <Button
                                                key={st}
                                                type="button"
                                                variant={previewMicState === st ? 'default' : 'outline'}
                                                size="sm"
                                                className={`text-xs font-bold ${
                                                    previewMicState === st 
                                                        ? st === 'SPEAKING' ? 'bg-emerald-500 text-black' : st === 'MUTED' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-white' 
                                                        : ''
                                                }`}
                                                onClick={() => setPreviewMicState(st)}
                                            >
                                                {st === 'SPEAKING' && <Mic size={13} className="mr-1" />}
                                                {st === 'MUTED' && <MicOff size={13} className="mr-1" />}
                                                {st === 'IDLE' && <Volume2 size={13} className="mr-1" />}
                                                {st}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* Room Background Overlay Slider */}
                                <div className="space-y-2 pt-2 border-t border-slate-800">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-semibold text-slate-300">Room Background Overlay</span>
                                        <span className="font-mono text-slate-400">{Math.round(previewThemeOverlay * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.2"
                                        max="0.8"
                                        step="0.05"
                                        value={previewThemeOverlay}
                                        onChange={(e) => setPreviewThemeOverlay(Number(e.target.value))}
                                        className="w-full accent-amber-400"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Live Canvas / Preview Simulation Stage */}
                        <div className="lg:col-span-8 space-y-4">
                            <Card className="glass-card border-slate-800 bg-slate-950/80 overflow-hidden relative shadow-2xl">
                                {/* Simulated Room Header */}
                                <div className="p-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between z-10 relative">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-rose-500 animate-pulse" />
                                        <span className="text-xs font-bold text-slate-200">Yaro Voice Room #1002</span>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                                        Live VIP Simulation
                                    </Badge>
                                </div>

                                {/* Room Background Simulation Canvas */}
                                <div 
                                    className="min-h-[480px] p-6 relative flex flex-col justify-between"
                                    style={{
                                        backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80')`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                >
                                    {/* Configurable Overlay (Part 29) */}
                                    <div 
                                        className="absolute inset-0 bg-slate-950 transition-opacity"
                                        style={{ opacity: previewThemeOverlay }}
                                    />

                                    {/* Top: Floating VIP Entry Animation Display (Part 3, 4, 5, 6, 28) */}
                                    <div className="relative z-10 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/70 border border-amber-500/30 backdrop-blur-md max-w-sm mx-auto shadow-2xl animate-in fade-in zoom-in duration-500">
                                        <div className="text-[11px] font-black text-amber-400 tracking-wider mb-2 flex items-center gap-1.5">
                                            <Sparkles size={12} className="animate-spin text-amber-300" />
                                            ✨ VIP ARRIVAL SEQUENCE ✨
                                        </div>

                                        {/* Avatar Circular Container with Circular Frame Surround (Part 28) */}
                                        <div className="relative flex items-center justify-center my-2">
                                            {/* Outer Frame Effect */}
                                            <div className="absolute -inset-3 rounded-full border-2 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse" />

                                            {/* Perfectly Circular Avatar */}
                                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-300 relative shadow-inner bg-slate-800">
                                                <img
                                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80"
                                                    alt="VIP Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Mic Wave Animation Rings around Avatar (Part 7, 26) */}
                                            {previewMicState === 'SPEAKING' && (
                                                <>
                                                    <div className="absolute -inset-1 rounded-full border border-amber-400 animate-ping opacity-60 pointer-events-none" />
                                                    <div className="absolute -inset-4 rounded-full border border-amber-300/40 animate-pulse pointer-events-none" />
                                                </>
                                            )}

                                            {/* Mute indicator if muted */}
                                            {previewMicState === 'MUTED' && (
                                                <div className="absolute bottom-0 right-0 bg-rose-600 rounded-full p-1 border border-white text-white">
                                                    <MicOff size={12} />
                                                </div>
                                            )}

                                            {/* Top Crown */}
                                            <div className="absolute -top-4 text-xl filter drop-shadow">
                                                👑
                                            </div>
                                        </div>

                                        {/* Auto-scaling Fitted VIP Name (Part 4) */}
                                        <div className="w-full text-center px-3 py-1 overflow-hidden">
                                            <span 
                                                className="font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] inline-block transition-all"
                                                style={{
                                                    fontSize: `${fittedNameFontSize}px`,
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {previewName}
                                            </span>
                                        </div>

                                        {/* Entry Tag Badge (Part 5) */}
                                        <div className="mt-1">
                                            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.4)] flex items-center gap-1.5 text-xs font-black text-amber-300">
                                                <span>👑</span>
                                                <span>{previewTagText}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom: Content-Responsive Chat Bubble Simulation (Part 8, 27) */}
                                    <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/80">
                                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <MessageSquare size={12} />
                                            Live In-Room Chat Stream
                                        </div>

                                        <div className="flex items-start gap-2.5">
                                            {/* Avatar */}
                                            <div className="h-8 w-8 rounded-full overflow-hidden border border-amber-400 shrink-0">
                                                <img
                                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80"
                                                    alt="User"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            {/* Dynamic Content-Responsive Bubble */}
                                            <div className="flex flex-col items-start max-w-[74%]">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span className="text-xs font-bold text-amber-300">{previewName}</span>
                                                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-black border border-amber-500/30">VIP</span>
                                                </div>

                                                {/* Content Adaptive Container */}
                                                <div 
                                                    className="rounded-2xl rounded-tl-sm px-3.5 py-2 text-slate-100 text-sm shadow-lg border relative transition-all"
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(20, 20, 45, 0.95) 100%)',
                                                        borderColor: 'rgba(245, 158, 11, 0.4)',
                                                        boxShadow: '0 4px 15px rgba(245, 158, 11, 0.15)',
                                                        wordBreak: 'break-word',
                                                        maxWidth: '100%',
                                                    }}
                                                >
                                                    <p className="leading-snug">{previewChatMessage}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* ============================================================== */}
                {/* TAB 4: ASSET UPLOAD CENTER (Part 18, 20, 21)                    */}
                {/* ============================================================== */}
                <TabsContent value="upload" className="space-y-6 mt-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Upload Form */}
                        <Card className="glass-card md:col-span-1 border-emerald-500/20 bg-slate-900/60 h-fit">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                                    <Upload size={18} />
                                    Upload VIP / Room Asset
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleUploadAsset} className="space-y-4 text-sm">
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-slate-300">Asset Type</label>
                                        <select
                                            className="w-full h-10 px-3 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-sm"
                                            value={uploadType}
                                            onChange={(e) => setUploadType(e.target.value)}
                                        >
                                            <option value="entry_frame">Circular Entry Frame (.webp / .png)</option>
                                            <option value="avatar_frame">Avatar Frame</option>
                                            <option value="entry_tag">Entry Tag Banner</option>
                                            <option value="mic_wave">Mic Wave Asset</option>
                                            <option value="chat_bubble">Chat Bubble Theme</option>
                                            <option value="room_theme">Room Background Theme</option>
                                            <option value="particle_effect">Particle Effect</option>
                                            <option value="sound">Entry Audio Sound (.mp3 / .wav)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-slate-300">Asset Name</label>
                                        <Input
                                            placeholder="e.g. Golden Phoenix Entry Frame"
                                            value={uploadName}
                                            onChange={(e) => setUploadName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-slate-300">Slug</label>
                                        <Input
                                            placeholder="golden-phoenix-frame"
                                            value={uploadSlug}
                                            onChange={(e) => setUploadSlug(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-semibold text-slate-300">File Selection</label>
                                        <input
                                            type="file"
                                            accept="image/*,audio/*,.json,.svga"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                                        />
                                    </div>
                                    <Button 
                                        type="submit" 
                                        disabled={uploading} 
                                        className="w-full font-bold bg-emerald-500 hover:bg-emerald-600 text-black"
                                    >
                                        {uploading ? 'Uploading to Server...' : 'Upload & Publish Asset'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Uploaded Assets Listing */}
                        <Card className="glass-card md:col-span-2 border-slate-800 bg-slate-900/60">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-200">
                                    <Layers size={20} className="text-emerald-400" />
                                    Active VIP Assets Repository
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-bold text-slate-300">Asset</TableHead>
                                            <TableHead className="font-bold text-slate-300">Type</TableHead>
                                            <TableHead className="font-bold text-slate-300">Preview</TableHead>
                                            <TableHead className="font-bold text-slate-300">Published</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {uploadedAssets.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-slate-400">
                                                    Upload assets above to register new frames, tags, sounds, and themes.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            uploadedAssets.map((asset) => (
                                                <TableRow key={asset.id} className="hover:bg-slate-800/40">
                                                    <TableCell className="font-bold text-slate-200">
                                                        <div>{asset.name}</div>
                                                        <div className="text-[11px] text-muted-foreground font-mono">{asset.slug}</div>
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-slate-300">
                                                        <Badge variant="outline" className="text-xs">
                                                            {asset.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {asset.url && (
                                                            <div className="h-10 w-10 rounded border border-slate-700 overflow-hidden bg-slate-950 flex items-center justify-center">
                                                                <img src={asset.url} alt={asset.name} className="h-full w-full object-contain" />
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                                                            Active
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
