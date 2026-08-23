'use client';

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from '@/components/ui/Table';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogDescription,
} from '@/components/ui/Dialog';
import { Gift, Plus, Trash2, Search, PackageOpen, UploadCloud, Loader2, CheckCircle2, FileUp, Sparkles, FolderUp } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

interface GiftItem {
    _id: string;
    name: string;
    icon: string;
    animationUrl?: string;
    mediaType?: 'image' | 'gif' | 'webp' | 'svg' | 'svga';
    cost: number;
    category: string;
    isActive: boolean;
    createdAt: string;
}

const EMPTY_FORM = {
    name: '',
    icon: '',
    animationUrl: '',
    mediaType: 'image' as GiftItem['mediaType'],
    cost: 0,
    category: 'Standard',
};

export default function GiftsPage() {
    const [gifts, setGifts] = useState<GiftItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<GiftItem | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    // Direct Upload & Drag/Drop States
    const [uploadingIcon, setUploadingIcon] = useState(false);
    const [uploadingAnimation, setUploadingAnimation] = useState(false);
    const [isDraggingIcon, setIsDraggingIcon] = useState(false);
    const [isDraggingAnim, setIsDraggingAnim] = useState(false);
    const [iconFileName, setIconFileName] = useState('');
    const [animationFileName, setAnimationFileName] = useState('');

    const iconInputRef = useRef<HTMLInputElement>(null);
    const animationInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchGifts(); }, []);

    const fetchGifts = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(API_ENDPOINTS.GIFTS.LIST);
            if (res.success && res.data) {
                setGifts((res.data as any) || []);
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to load gifts');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File, field: 'icon' | 'animationUrl') => {
        if (!file) return;

        const isAnimation = field === 'animationUrl';
        if (isAnimation) {
            setUploadingAnimation(true);
            setAnimationFileName(file.name);
        } else {
            setUploadingIcon(true);
            setIconFileName(file.name);
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await apiClient.uploadFile('/api/upload/file', formData);
            if (res.success && res.data?.url) {
                const uploadedUrl = res.data.url;
                setForm(prev => {
                    const ext = file.name.toLowerCase().split('.').pop();
                    let autoType = prev.mediaType;
                    if (isAnimation) {
                        if (ext === 'svga') autoType = 'svga';
                        else if (ext === 'gif') autoType = 'gif';
                        else if (ext === 'webp') autoType = 'webp';
                        else if (ext === 'svg') autoType = 'svg';
                    }
                    return {
                        ...prev,
                        [field]: uploadedUrl,
                        mediaType: isAnimation ? autoType : prev.mediaType,
                    };
                });
                toast.success(`${isAnimation ? 'Animation Asset' : 'Gift Icon'} file uploaded successfully!`);
            } else {
                toast.error(res.message || 'File upload failed');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to upload file');
        } finally {
            if (isAnimation) {
                setUploadingAnimation(false);
            } else {
                setUploadingIcon(false);
            }
        }
    };

    const handleAddGift = async () => {
        if (!form.name || !form.icon || !form.cost) {
            toast.error('Gift Name, Icon File and Cost are required');
            return;
        }
        try {
            setSaving(true);
            const res = await apiClient.post(API_ENDPOINTS.GIFTS.CREATE, form);
            if (res.success) {
                toast.success('Gift added successfully');
                setShowAddDialog(false);
                setForm(EMPTY_FORM);
                setIconFileName('');
                setAnimationFileName('');
                fetchGifts();
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to add gift');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (gift: GiftItem) => {
        try {
            await apiClient.patch(API_ENDPOINTS.GIFTS.TOGGLE(gift._id), {
                isActive: !gift.isActive,
            });
            toast.success(`Gift ${!gift.isActive ? 'enabled' : 'disabled'}`);
            fetchGifts();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update gift');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await apiClient.delete(API_ENDPOINTS.GIFTS.DELETE(deleteTarget._id));
            toast.success('Gift deleted');
            setDeleteTarget(null);
            fetchGifts();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete gift');
        }
    };

    const filtered = gifts.filter(g =>
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.category?.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = gifts.filter(g => g.isActive).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-300 to-purple-400 bg-clip-text text-transparent">
                    Gift Management
                </h2>
                <p className="text-slate-400 mt-1">Drag & Drop gift asset files (.png, .svga, .gif), set coin prices and toggle live call gifts.</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card glass className="bg-slate-900/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Gifts</CardTitle>
                        <Gift className="h-4 w-4 text-pink-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-100">{gifts.length}</div>
                    </CardContent>
                </Card>
                <Card glass className="bg-slate-900/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Active</CardTitle>
                        <Gift className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">{activeCount}</div>
                    </CardContent>
                </Card>
                <Card glass className="bg-slate-900/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-400">Inactive</CardTitle>
                        <PackageOpen className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-400">{gifts.length - activeCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card glass>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>All Gifts</CardTitle>
                        <div className="flex items-center gap-3">
                            <div className="relative w-56">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search gifts..."
                                    className="pl-8 bg-slate-800/50 border-slate-700/50"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <Button onClick={() => { setForm(EMPTY_FORM); setIconFileName(''); setAnimationFileName(''); setShowAddDialog(true); }}
                                className="bg-pink-600 hover:bg-pink-500 text-white border-none">
                                <Plus className="mr-2 h-4 w-4" /> Add Gift
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-10 text-slate-500">Loading gifts...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-slate-700/50">
                                    <TableHead>Preview</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Cost (Coins)</TableHead>
                                    <TableHead>Format</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Active</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(gift => (
                                    <TableRow key={gift._id} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <TableCell>
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                                                {gift.icon ? (
                                                    <img
                                                        src={gift.icon}
                                                        alt={gift.name}
                                                        className="w-10 h-10 object-contain"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <Gift className="h-5 w-5 text-slate-500" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-semibold text-slate-100">{gift.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-slate-700/50 text-slate-300">
                                                {gift.category || 'Standard'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-bold text-yellow-400">🪙 {gift.cost}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-cyan-400 border-cyan-500/30 uppercase text-[10px]">
                                                {gift.mediaType || 'image'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={gift.isActive ? 'success' : 'destructive'}>
                                                {gift.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={gift.isActive}
                                                onCheckedChange={() => handleToggle(gift)}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => setDeleteTarget(gift)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filtered.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                                            <Gift className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                            No gifts found. Add your first gift!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add Gift Dialog — HTML5 Drag & Drop File Upload UI */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-extrabold text-pink-400">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            Add New Gift (Drag & Drop File Upload)
                        </DialogTitle>
                        <DialogDescription>
                            Drag & drop gift icon image (.png, .jpg) & full-screen SVGA/GIF animation files directly.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-2">
                        {/* Gift Name */}
                        <div className="space-y-1.5">
                            <Label className="font-bold text-slate-200">Gift Name</Label>
                            <Input placeholder="e.g. Rose, Crown, Sports Car, Magic Wand..."
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                className="bg-slate-900 border-slate-700"
                            />
                        </div>

                        {/* 1. Gift Icon Native Drag & Drop Zone */}
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-200 flex items-center justify-between">
                                <span>1. Drag & Drop Gift Icon File <span className="text-rose-400">*</span></span>
                                <span className="text-xs font-normal text-slate-400">(.PNG, .JPG, .SVG)</span>
                            </Label>

                            <input
                                type="file"
                                ref={iconInputRef}
                                accept="image/*,.svg,.svga"
                                className="hidden"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, 'icon');
                                }}
                            />

                            <div
                                onClick={() => iconInputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDraggingIcon(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDraggingIcon(false);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDraggingIcon(false);
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) handleFileUpload(file, 'icon');
                                }}
                                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                                    isDraggingIcon
                                        ? 'border-pink-400 bg-pink-500/20 scale-[1.02] shadow-xl shadow-pink-500/20'
                                        : form.icon
                                        ? 'border-emerald-500/70 bg-emerald-950/20 hover:bg-emerald-950/30'
                                        : 'border-pink-500/40 bg-slate-900/80 hover:border-pink-500 hover:bg-slate-900'
                                }`}
                            >
                                {uploadingIcon ? (
                                    <div className="flex flex-col items-center py-2">
                                        <Loader2 className="w-8 h-8 text-pink-400 animate-spin mb-2" />
                                        <p className="text-xs font-bold text-slate-300">Uploading Gift Icon File...</p>
                                    </div>
                                ) : form.icon ? (
                                    <div className="flex items-center justify-between gap-3 text-left">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                                <img src={form.icon} alt="preview" className="w-10 h-10 object-contain" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Gift Icon Ready!
                                                </p>
                                                <p className="text-[11px] text-slate-300 font-semibold truncate mt-0.5">{iconFileName || 'Icon File Uploaded'}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" className="text-xs border-slate-700 shrink-0">Choose Other</Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center py-4">
                                        <FolderUp className={`w-10 h-10 mb-2 transition-transform ${isDraggingIcon ? 'scale-125 text-pink-300' : 'text-pink-400 animate-bounce'}`} style={{ animationDuration: '3s' }} />
                                        <p className="text-sm font-extrabold text-slate-100">
                                            {isDraggingIcon ? 'Drop Gift Icon File Here!' : 'Drag & Drop or Click to Choose Icon File'}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-1">Upload PNG or JPG image for live call gift button</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Gift Media Format */}
                        <div className="space-y-1.5">
                            <Label className="font-bold text-slate-200">Gift Animation Format</Label>
                            <select
                                value={form.mediaType}
                                onChange={e => setForm(f => ({
                                    ...f,
                                    mediaType: e.target.value as GiftItem['mediaType'],
                                }))}
                                className="flex h-10 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-pink-500"
                            >
                                <option value="image">Static Image (.png, .jpg)</option>
                                <option value="svga">SVGA Animation (.svga)</option>
                                <option value="gif">Animated GIF (.gif)</option>
                                <option value="webp">Animated WebP (.webp)</option>
                                <option value="svg">SVG Vector (.svg)</option>
                            </select>
                        </div>

                        {/* 2. Animation File Native Drag & Drop Zone */}
                        <div className="space-y-2">
                            <Label className="font-bold text-slate-200 flex items-center justify-between">
                                <span>2. Drag & Drop Animation Asset File</span>
                                <span className="text-xs font-normal text-slate-400">(.SVGA, .GIF, .WEBP)</span>
                            </Label>

                            <input
                                type="file"
                                ref={animationInputRef}
                                accept=".svga,.gif,.webp,image/*"
                                className="hidden"
                                onChange={e => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, 'animationUrl');
                                }}
                            />

                            <div
                                onClick={() => animationInputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDraggingAnim(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDraggingAnim(false);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsDraggingAnim(false);
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) handleFileUpload(file, 'animationUrl');
                                }}
                                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                                    isDraggingAnim
                                        ? 'border-cyan-300 bg-cyan-500/20 scale-[1.02] shadow-xl shadow-cyan-500/20'
                                        : form.animationUrl
                                        ? 'border-cyan-500/70 bg-cyan-950/20 hover:bg-cyan-950/30'
                                        : 'border-cyan-500/40 bg-slate-900/80 hover:border-cyan-400 hover:bg-slate-900'
                                }`}
                            >
                                {uploadingAnimation ? (
                                    <div className="flex flex-col items-center py-2">
                                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
                                        <p className="text-xs font-bold text-slate-300">Uploading Animation File (.svga/.gif)...</p>
                                    </div>
                                ) : form.animationUrl ? (
                                    <div className="flex items-center justify-between gap-3 text-left">
                                        <div>
                                            <p className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                                                <CheckCircle2 className="w-4 h-4" /> Animation Asset Ready!
                                            </p>
                                            <p className="text-[11px] text-slate-300 font-semibold truncate mt-0.5">{animationFileName || 'Animation File Uploaded'}</p>
                                        </div>
                                        <Badge variant="outline" className="text-cyan-400 border-cyan-500/40 uppercase text-[10px]">
                                            {form.mediaType}
                                        </Badge>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center py-4">
                                        <FileUp className={`w-10 h-10 mb-2 transition-transform ${isDraggingAnim ? 'scale-125 text-cyan-300' : 'text-cyan-400'}`} />
                                        <p className="text-sm font-extrabold text-slate-100">
                                            {isDraggingAnim ? 'Drop Animation File Here!' : 'Drag & Drop or Click to Choose Animation File'}
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-1">Upload .svga, .gif, or .webp full-screen animation file</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Price & Category Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="font-bold text-slate-200">Gift Price (Coins)</Label>
                                <Input type="number" min={1} placeholder="e.g. 50"
                                    value={form.cost || ''}
                                    onChange={e => setForm(f => ({ ...f, cost: parseInt(e.target.value) || 0 }))}
                                    className="bg-slate-900 border-slate-700"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-bold text-slate-200">Category</Label>
                                <Input placeholder="Standard, Luxury, Special..."
                                    value={form.category}
                                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                    className="bg-slate-900 border-slate-700"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-3 border-t border-slate-800">
                            <Button variant="outline" className="flex-1 border-slate-700" onClick={() => setShowAddDialog(false)}>
                                Cancel
                            </Button>
                            <Button className="flex-1 bg-pink-600 hover:bg-pink-500 text-white border-none font-bold shadow-lg shadow-pink-600/20"
                                onClick={handleAddGift} disabled={saving || uploadingIcon || uploadingAnimation}>
                                {saving ? 'Adding Gift...' : 'Add Gift'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirm Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Gift</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>&quot;{deleteTarget?.name}&quot;</strong>?
                            This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
