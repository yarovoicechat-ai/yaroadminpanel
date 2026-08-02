'use client';

import { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { Plus, Trash2, ToggleLeft, ToggleRight, Layers, Sliders, Calendar, UploadCloud, Image as ImageIcon, X, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function BannersPage() {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [title, setTitle] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [priority, setPriority] = useState('0');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [useUrlMode, setUseUrlMode] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/admin/banners');
            if (response.success && response.data) {
                setBanners(response.data || []);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch banners');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !imageUrl) {
            toast.error('Title and Image URL are required');
            return;
        }

        try {
            setSubmitting(true);
            const response = await apiClient.post('/api/admin/banners', {
                title,
                imageUrl,
                linkUrl,
                priority,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            });

            if (response.success) {
                toast.success('Banner created successfully');
                setTitle('');
                setImageUrl('');
                setLinkUrl('');
                setPriority('0');
                setStartDate('');
                setEndDate('');
                fetchBanners();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create banner');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (banner: any) => {
        try {
            const response = await apiClient.patch(`/api/admin/banners/${banner._id}`, {
                isActive: !banner.isActive
            });
            if (response.success) {
                toast.success(`Banner successfully ${!banner.isActive ? 'activated' : 'deactivated'}`);
                fetchBanners();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update banner state');
        }
    };

    const handleDeleteBanner = async (bannerId: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;
        try {
            const response = await apiClient.delete(`/api/admin/banners/${bannerId}`);
            if (response.success) {
                toast.success('Banner deleted successfully');
                fetchBanners();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete banner');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Banners Promotion</h2>
                <p className="text-muted-foreground mt-1 font-medium font-sans">Manage home screen carousel slides, priorities, and schedules</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Create Form */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Plus size={20} />
                            Add New Slide
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateBanner} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Banner Title</label>
                                <Input
                                    placeholder="Enter slide title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-300">Banner Image *</label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUseUrlMode(!useUrlMode);
                                            setImageUrl('');
                                        }}
                                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                                    >
                                        {useUrlMode ? <UploadCloud size={12} /> : <LinkIcon size={12} />}
                                        {useUrlMode ? 'Upload File' : 'Paste URL'}
                                    </button>
                                </div>

                                {!useUrlMode ? (
                                    <div className="space-y-2">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (!file.type.startsWith('image/')) {
                                                        toast.error('Please select a valid image file');
                                                        return;
                                                    }
                                                    if (file.size > 10 * 1024 * 1024) {
                                                        toast.error('Image size must be under 10MB');
                                                        return;
                                                    }
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setImageUrl(reader.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="hidden"
                                        />

                                        {imageUrl ? (
                                            <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-800/80 p-2">
                                                <img
                                                    src={imageUrl}
                                                    alt="Preview"
                                                    className="w-full h-32 object-cover rounded-lg border border-slate-700"
                                                />
                                                <div className="mt-2 flex items-center justify-between px-1">
                                                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                                        <CheckCircle2 size={13} /> Image Ready
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setImageUrl('');
                                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                                        }}
                                                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20"
                                                    >
                                                        <X size={13} /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-slate-700 hover:border-primary/60 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-800/40 group flex flex-col items-center justify-center space-y-2"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <UploadCloud size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-200">Click to Upload Banner Image</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP, GIF (Max 10MB)</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Input
                                        placeholder="https://image-host.com/my-banner.jpg"
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        required
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Action Deep Link</label>
                                <Input
                                    placeholder="mithichat://profile/1002"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Priority Weight</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400">Start Date</label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-slate-400">Expiry Date</label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full font-bold" disabled={submitting}>
                                {submitting ? 'Creating...' : 'Upload Banner'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Banner Table List */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Layers size={20} />
                            Banners Carousel List
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold text-slate-300">Preview</TableHead>
                                    <TableHead className="font-bold text-slate-300">Title</TableHead>
                                    <TableHead className="font-bold text-slate-300">Weight</TableHead>
                                    <TableHead className="font-bold text-slate-300">Schedule</TableHead>
                                    <TableHead className="font-bold text-slate-300">Status</TableHead>
                                    <TableHead className="text-right font-bold text-slate-300">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-400">Loading banners...</TableCell>
                                    </TableRow>
                                ) : banners.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-400 font-medium">No banners configured</TableCell>
                                    </TableRow>
                                ) : (
                                    banners.map((banner) => (
                                        <TableRow key={banner._id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <div className="h-10 w-20 rounded bg-slate-800 overflow-hidden border border-slate-700">
                                                    <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-bold text-slate-200">{banner.title}</p>
                                                    {banner.linkUrl && (
                                                        <p className="text-xs text-primary font-mono truncate max-w-xs">{banner.linkUrl}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-semibold text-slate-300">
                                                <div className="flex items-center gap-1.5">
                                                    <Sliders size={14} className="text-muted-foreground" />
                                                    {banner.priority}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs font-semibold text-slate-400">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        <span>From: {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'Immediate'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Calendar size={12} />
                                                        <span>To: {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'Forever'}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={banner.isActive ? "success" : "destructive"}>
                                                    {banner.isActive ? 'Active' : 'Disabled'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleToggleStatus(banner)}
                                                        title={banner.isActive ? "Deactivate banner" : "Activate banner"}
                                                    >
                                                        {banner.isActive ? <ToggleRight size={22} className="text-emerald-500" /> : <ToggleLeft size={22} className="text-muted-foreground" />}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDeleteBanner(banner._id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
