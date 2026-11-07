'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, ShieldCheck, User as UserIcon, Coins, Award, Globe, Calendar, Ban, CheckCircle, Info, Mail, Phone, Lock, Edit3, Trash2, Sparkles, RefreshCw, CheckSquare, Square, AlertTriangle, Layers, Image as ImageIcon } from 'lucide-react';
import type { User } from '@/types/models';
import { getAdminAvatar } from '@/lib/avatar';

export default function UserDetailPage() {
    const { user: currentUser } = useAuth();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Assets & Cosmetics Management States
    const [userAssets, setUserAssets] = useState<{
        storeInventory: any[];
        equippedCosmetics: Record<string, string | null>;
        officialIdActive: boolean;
    } | null>(null);
    const [loadingAssets, setLoadingAssets] = useState(false);
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
    const [clearingCosmetics, setClearingCosmetics] = useState(false);
    const [removingAssets, setRemovingAssets] = useState(false);

    // Edit form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
    const [age, setAge] = useState<number>(18);
    const [coins, setCoins] = useState<number>(0);
    const [diamonds, setDiamonds] = useState<number>(0);
    const [role, setRole] = useState<User['role']>('user');
    const [countryName, setCountryName] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [isBlocked, setIsBlocked] = useState(false);
    const [userName, setUserNameState] = useState('');
    const [isProfileVerified, setIsProfileVerified] = useState(false);
    const [verifiedTitle, setVerifiedTitle] = useState('');

    useEffect(() => {
        if (!id) return;
        const fetchUserDetails = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(API_ENDPOINTS.USERS.GET(id));
                if (response.success && response.data && response.data.user) {
                    const u = response.data.user as User;
                    setUser(u);
                    setName(u.name || '');
                    setEmail(u.email || '');
                    setPhoneNumber(u.phoneNumber || '');
                    setBio(u.bio || '');
                    setGender(u.gender || 'male');
                    setAge(u.age || 18);
                    setCoins(u.coins || 0);
                    setDiamonds((u as any).diamonds || 0);
                    setRole(u.role || 'user');
                    setCountryName(u.country?.name || '');
                    setCountryCode(u.country?.code || '');
                    setIsBlocked(u.isBlocked || false);
                    setUserNameState(u.userName || '');
                    setIsProfileVerified(Boolean((u as any).isProfileVerified));
                    setVerifiedTitle((u as any).verifiedTitle || '');
                } else {
                    toast.error("User not found");
                }
            } catch (err: any) {
                toast.error(err.message || "Failed to load user details");
            } finally {
                setLoading(false);
            }
        };
        fetchUserDetails();
        fetchUserAssets();
    }, [id]);

    const fetchUserAssets = async () => {
        if (!id) return;
        try {
            setLoadingAssets(true);
            const res = await apiClient.get<any>(`/api/store/admin/user/${id}/assets`);
            if (res.success && res.data) {
                setUserAssets(res.data);
            }
        } catch (err: any) {
            console.warn('Failed to load user assets:', err);
        } finally {
            setLoadingAssets(false);
        }
    };

    const handleClearCosmetics = async () => {
        if (!confirm('Are you sure you want to remove ALL equipped frames, entries, tags, chat bubbles, mic waves, and custom ID from this user?')) return;
        try {
            setClearingCosmetics(true);
            const res = await apiClient.post<any>(`/api/store/admin/user/${id}/clear-cosmetics`, {});
            if (res.success) {
                toast.success('All equipped cosmetics (Frame, Entry, Tag, ID) cleared successfully!');
                fetchUserAssets();
            } else {
                toast.error(res.message || 'Failed to clear cosmetics');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to clear cosmetics');
        } finally {
            setClearingCosmetics(false);
        }
    };

    const handleRemoveSelectedAssets = async () => {
        if (!selectedAssetIds.length) return;
        if (!confirm(`Are you sure you want to remove ${selectedAssetIds.length} selected asset(s) from this user\'s inventory?`)) return;
        try {
            setRemovingAssets(true);
            const res = await apiClient.post<any>(`/api/store/admin/user/${id}/remove-assets`, {
                inventoryItemIds: selectedAssetIds,
            });
            if (res.success) {
                toast.success(`${selectedAssetIds.length} asset(s) removed successfully!`);
                setSelectedAssetIds([]);
                fetchUserAssets();
            } else {
                toast.error(res.message || 'Failed to remove assets');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to remove assets');
        } finally {
            setRemovingAssets(false);
        }
    };

    const handleRemoveAllAssets = async () => {
        if (!confirm('CAUTION: Are you sure you want to completely remove ALL assets and empty this user\'s inventory? This action cannot be undone.')) return;
        try {
            setRemovingAssets(true);
            const res = await apiClient.post<any>(`/api/store/admin/user/${id}/remove-assets`, {
                removeAll: true,
            });
            if (res.success) {
                toast.success('All inventory assets and cosmetics have been removed!');
                setSelectedAssetIds([]);
                fetchUserAssets();
            } else {
                toast.error(res.message || 'Failed to remove all assets');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to remove all assets');
        } finally {
            setRemovingAssets(false);
        }
    };

    const handleToggleSelectAll = () => {
        const inventory = userAssets?.storeInventory || [];
        if (selectedAssetIds.length === inventory.length) {
            setSelectedAssetIds([]);
        } else {
            setSelectedAssetIds(inventory.map((item: any) => String(item._id || item.itemId)));
        }
    };

    const handleToggleAsset = (itemId: string) => {
        setSelectedAssetIds(prev =>
            prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            
            const payload = {
                name,
                email: email || undefined,
                phoneNumber: phoneNumber || undefined,
                bio,
                gender,
                age: Number(age),
                coins: Number(coins),
                diamonds: Number(diamonds),
                role,
                userName: userName || undefined,
                password: password ? password : undefined,
                country: {
                    name: countryName,
                    code: countryCode
                },
                isProfileVerified,
                verifiedTitle: isProfileVerified ? verifiedTitle.trim() : ''
            };

            const response = await apiClient.patch(API_ENDPOINTS.USERS.UPDATE(id), payload);
            if (response.success) {
                toast.success("User profile updated successfully");
                
                // Handle suspended/active switch if modified
                if (isBlocked !== user?.isBlocked) {
                    const endpoint = isBlocked 
                        ? API_ENDPOINTS.USERS.BLOCK(id)
                        : API_ENDPOINTS.USERS.UNBLOCK(id);
                    await apiClient.patch(endpoint);
                    toast.success(isBlocked ? "User suspended" : "User activated");
                }
                
                router.push('/users');
            } else {
                toast.error(response.message || "Failed to update profile");
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred while saving");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-400">Loading user details...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-10">
                <h3 className="text-xl font-semibold text-slate-300">User Not Found</h3>
                <Button className="mt-4" onClick={() => router.push('/users')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 bg-[#0f0e15] min-h-screen p-4 sm:p-6 rounded-xl">
            {/* Top Navigation */}
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => router.push('/users')} className="h-9 w-9 bg-slate-900/60 border-slate-800 hover:bg-slate-800">
                    <ArrowLeft className="h-4 w-4 text-slate-300" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">User Profile Card</h2>
                    <p className="text-xs text-slate-400">Detailed account metadata and administrative parameters.</p>
                </div>
            </div>

            {/* Profile Cover Header */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-violet-900/40 via-fuchsia-900/30 to-[#0f0e15] border border-slate-800/80 p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-slate-900 border-2 border-fuchsia-500/50 flex items-center justify-center text-3xl font-bold text-slate-300 overflow-hidden shadow-2xl">
                    <img src={getAdminAvatar(user)} alt={user.name} className="h-full w-full object-cover" />
                </div>
                <div className="text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
                        {isProfileVerified && <CheckCircle className="h-5 w-5 fill-blue-500 text-blue-500" aria-label="Verified profile" />}
                        {isProfileVerified && verifiedTitle && <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/30">{verifiedTitle}</Badge>}
                    </div>
                    <p className="text-sm font-mono text-cyan-400 font-bold mt-1">ID: #{user.userId}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                        <Badge variant="secondary" className="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 capitalize font-bold text-xs">{user.role}</Badge>
                        <Badge variant={!isBlocked ? 'success' : 'destructive'} className="font-bold text-xs">
                            {!isBlocked ? 'Active' : 'Suspended'}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Left Panel: Profile Info Display */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-slate-800 bg-[#161520] shadow-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold text-slate-200">About</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm font-sans font-medium text-slate-300">
                            {/* Bio */}
                            <div className="pb-1">
                                <span className="text-fuchsia-400 font-bold">Bio : </span>
                                <span>{bio || 'No bio description provided.'}</span>
                            </div>

                            {/* Global Unique Identity System Badges */}
                            <div className="space-y-3 pt-2 border-t border-slate-800/60">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold">10-Digit User ID :-</span>
                                    <span className="text-cyan-400 font-bold font-mono text-sm bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-500/30">#{user.userId}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold">Mongo ObjectId :-</span>
                                    <span className="text-slate-400 font-mono text-xs select-all bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{user._id}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold">Employee Code :-</span>
                                    <span className="text-emerald-400 font-bold font-mono">{(user as any).employeeCode || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold">Role Code :-</span>
                                    <span className="text-purple-400 font-bold font-mono">{(user as any).specialCode || (user as any).employeeCode || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold">Meethi Chat ID :-</span>
                                    <span className="text-fuchsia-400 font-bold font-mono">{(user as any).meethiId || `MC${user.userId}` || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold">Username :-</span>
                                    <span className="text-fuchsia-400 font-bold">{userName || user.userId}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold">Diamond :-</span>
                                    <span className="text-slate-200 font-bold flex items-center gap-1.5">
                                        💎 {diamonds.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold">Coin :-</span>
                                    <span className="text-slate-200 font-bold flex items-center gap-1.5">
                                        🪙 {coins.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold">Gender :-</span>
                                    <span className="text-fuchsia-400 capitalize">{gender}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold">Age :-</span>
                                    <span className="text-fuchsia-400 font-bold">{age}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold">Login Type :-</span>
                                    <span className="text-slate-200 capitalize">{user.authType}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold">isVIP :-</span>
                                    <span className="text-slate-200">{user.level && user.level > 1 ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold">Ip :-</span>
                                    <span className="text-fuchsia-400 font-mono">{(user as any).ipAddress || (user as any).lastIp || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-semibold">Last login:-</span>
                                    <span className="text-fuchsia-400 font-semibold text-xs">
                                        {new Date(user.updatedAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Info Card */}
                    <Card className="border-slate-800 bg-[#161520] shadow-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-bold text-slate-200">Contact Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm font-sans font-medium text-slate-300">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-fuchsia-400" />
                                <span>{email || 'No email registered'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-fuchsia-400" />
                                <span>{phoneNumber || 'No phone registered'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-fuchsia-400" />
                                <span>Lives in {countryName || 'Unknown'}{countryCode ? ` (${countryCode})` : ''}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Admin Settings / Profile Editor Form */}
                <div className="lg:col-span-3">
                    <Card className="border-slate-800 bg-[#161520] shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-slate-200">Edit Profile Parameters</CardTitle>
                            <CardDescription className="text-slate-400">Modify user settings including security configurations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {/* Name */}
                                    <div className="grid gap-1.5">
                                        <label htmlFor="edit-name" className="text-xs font-semibold text-slate-400">Display Name</label>
                                        <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} required className="bg-slate-950 border-slate-800 text-slate-200" />
                                    </div>
                                    
                                    {/* Username */}
                                    <div className="grid gap-1.5">
                                        <label htmlFor="edit-username" className="text-xs font-semibold text-slate-400">Username</label>
                                        <Input id="edit-username" value={userName} onChange={e => setUserNameState(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-200" />
                                    </div>

                                    {/* Email */}
                                    <div className="grid gap-1.5">
                                        <label htmlFor="edit-email" className="text-xs font-semibold text-slate-400">Email Address</label>
                                        <Input id="edit-email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-200" />
                                    </div>

                                    {/* Phone Number */}
                                    <div className="grid gap-1.5">
                                        <label htmlFor="edit-phone" className="text-xs font-semibold text-slate-400">Mobile/Phone Number</label>
                                        <Input id="edit-phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-200" />
                                    </div>

                                    {/* Password Reset (Hidden for Admin/SuperAdmin/Agency) */}
                                    {!['admin', 'superAdmin', 'super-admin', 'agency'].includes(currentUser?.role || '') && (
                                        <div className="grid gap-1.5 sm:col-span-2">
                                            <label htmlFor="edit-password" className="text-xs font-semibold text-slate-400">Change Password (Leave blank to keep current)</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                                <Input id="edit-password" type="password" placeholder="Enter new strong password" value={password} onChange={e => setPassword(e.target.value)} className="pl-9 bg-slate-950 border-slate-800 text-slate-200" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Gender */}
                                    <div className="grid gap-1.5">
                                        <label htmlFor="edit-gender" className="text-xs font-semibold text-slate-400">Gender</label>
                                        <select
                                            id="edit-gender"
                                            className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-ring"
                                            value={gender}
                                            onChange={e => setGender(e.target.value as any)}
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* Age */}
                                    <div className="grid gap-1.5">
                                        <label htmlFor="edit-age" className="text-xs font-semibold text-slate-400">Age</label>
                                        <Input id="edit-age" type="number" value={age} onChange={e => setAge(Number(e.target.value))} min={1} max={120} className="bg-slate-950 border-slate-800 text-slate-200" />
                                    </div>

                                    {/* Role */}
                                    <div className="grid gap-1.5">
                                        <label htmlFor="edit-role" className="text-xs font-semibold text-slate-400">System Role</label>
                                        <select
                                            id="edit-role"
                                            className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-ring"
                                            value={role}
                                            onChange={e => setRole(e.target.value as any)}
                                        >
                                            <option value="user">User</option>
                                            <option value="host">Host</option>
                                            <option value="agency">Agency</option>
                                            <option value="admin">Admin</option>
                                            <option value="superAdmin">Super Admin</option>
                                            <option value="owner">Owner</option>
                                        </select>
                                    </div>

                                    {/* Country Name */}
                                    <div className="grid gap-1.5">
                                        <label htmlFor="edit-country-name" className="text-xs font-semibold text-slate-400">Country Name</label>
                                        <Input id="edit-country-name" value={countryName} onChange={e => setCountryName(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-200" />
                                    </div>

                                    {/* Country Code */}
                                    <div className="grid gap-1.5">
                                        <label htmlFor="edit-country-code" className="text-xs font-semibold text-slate-400">Country Code</label>
                                        <Input id="edit-country-code" value={countryCode} onChange={e => setCountryCode(e.target.value)} className="bg-slate-950 border-slate-800 text-slate-200" />
                                    </div>

                                    {/* Coins */}
                                    <div className="grid gap-1.5">
                                        <label htmlFor="edit-coins" className="text-xs font-semibold text-slate-400">Coins Balance (Coin)</label>
                                        <Input id="edit-coins" type="number" value={coins} onChange={e => setCoins(Number(e.target.value))} className="bg-slate-950 border-slate-800 text-slate-200" />
                                    </div>

                                    {/* Diamonds */}
                                    <div className="grid gap-1.5">
                                        <label htmlFor="edit-diamonds" className="text-xs font-semibold text-slate-400">Diamonds Balance</label>
                                        <Input id="edit-diamonds" type="number" value={diamonds} onChange={e => setDiamonds(Number(e.target.value))} className="bg-slate-950 border-slate-800 text-slate-200" />
                                    </div>
                                </div>

                                {/* Bio */}
                                <div className="grid gap-1.5">
                                    <label htmlFor="edit-bio" className="text-xs font-semibold text-slate-400">Bio Profile Description</label>
                                    <textarea
                                        id="edit-bio"
                                        rows={3}
                                        className="flex w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-ring"
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        placeholder="Add bio context..."
                                    />
                                </div>

                                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <input
                                            id="edit-profile-verified"
                                            type="checkbox"
                                            checked={isProfileVerified}
                                            onChange={e => setIsProfileVerified(e.target.checked)}
                                            className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-blue-500"
                                        />
                                        <div>
                                            <label htmlFor="edit-profile-verified" className="text-sm font-semibold text-slate-200">Verified profile</label>
                                            <p className="text-xs text-slate-400">Show a blue tick beside this user’s name in their profile.</p>
                                        </div>
                                    </div>
                                    <div className="grid gap-1.5">
                                        <label htmlFor="edit-verified-title" className="text-xs font-semibold text-slate-400">Verified title / post name</label>
                                        <Input
                                            id="edit-verified-title"
                                            value={verifiedTitle}
                                            onChange={e => setVerifiedTitle(e.target.value.slice(0, 60))}
                                            placeholder="e.g. Official Host"
                                            maxLength={60}
                                            disabled={!isProfileVerified}
                                            className="bg-slate-950 border-slate-800 text-slate-200"
                                        />
                                    </div>
                                </div>

                                {/* Suspend Switch */}
                                <div className="flex items-center gap-3 py-2 border-t border-slate-800/40">
                                    <input
                                        id="edit-suspend"
                                        type="checkbox"
                                        checked={isBlocked}
                                        onChange={e => setIsBlocked(e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-fuchsia-600 focus:ring-fuchsia-500"
                                    />
                                    <label htmlFor="edit-suspend" className="text-sm font-semibold text-slate-300">Suspend/Deactivate Account</label>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end gap-3 pt-2 border-t border-slate-800/40">
                                    <Button type="button" variant="outline" onClick={() => router.push('/users')} className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300">Cancel</Button>
                                    <Button type="submit" disabled={saving} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold">
                                        <Save className="mr-2 h-4 w-4" />
                                        {saving ? 'Saving changes...' : 'Save changes'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* User Cosmetics & Inventory Asset Management */}
            <Card className="border-slate-800 bg-[#161520] shadow-xl mt-6">
                <CardHeader className="border-b border-slate-800/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-fuchsia-400 uppercase tracking-wider mb-1">
                            <Sparkles className="w-4 h-4" /> Asset & Cosmetics Control Center
                        </div>
                        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                            Equipped Cosmetics & Inventory Assets
                            <Badge className="bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30">
                                {userAssets?.storeInventory?.length || 0} Assets
                            </Badge>
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs">
                            View active equipped items (frames, entries, tags, ID), clear cosmetics, or select and delete inventory assets.
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={fetchUserAssets}
                            disabled={loadingAssets}
                            className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 text-xs"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingAssets ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>

                        <Button
                            type="button"
                            onClick={handleClearCosmetics}
                            disabled={clearingCosmetics}
                            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
                        >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            {clearingCosmetics ? 'Clearing...' : 'Clear All Equipped Cosmetics (Frame, Entry, Tag, ID)'}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Currently Equipped Summary */}
                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                            Currently Equipped Status
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                                <span className="text-slate-400 block text-[11px] mb-1">Equipped Frame</span>
                                <span className="font-bold text-white truncate block">
                                    {userAssets?.equippedCosmetics?.equippedFrame || <span className="text-slate-500 font-normal">None</span>}
                                </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                                <span className="text-slate-400 block text-[11px] mb-1">Equipped Entry</span>
                                <span className="font-bold text-white truncate block">
                                    {userAssets?.equippedCosmetics?.equippedEntry || <span className="text-slate-500 font-normal">None</span>}
                                </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                                <span className="text-slate-400 block text-[11px] mb-1">Equipped Tag</span>
                                <span className="font-bold text-white truncate block">
                                    {userAssets?.equippedCosmetics?.equippedTag || <span className="text-slate-500 font-normal">None</span>}
                                </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                                <span className="text-slate-400 block text-[11px] mb-1">Equipped Bubble</span>
                                <span className="font-bold text-white truncate block">
                                    {userAssets?.equippedCosmetics?.equippedChatBubble || <span className="text-slate-500 font-normal">None</span>}
                                </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                                <span className="text-slate-400 block text-[11px] mb-1">Equipped Mic Wave</span>
                                <span className="font-bold text-white truncate block">
                                    {userAssets?.equippedCosmetics?.equippedMicWave || <span className="text-slate-500 font-normal">None</span>}
                                </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                                <span className="text-slate-400 block text-[11px] mb-1">Vanity Custom ID</span>
                                <span className="font-bold text-cyan-400 font-mono truncate block">
                                    {userAssets?.equippedCosmetics?.equippedCustomId || <span className="text-slate-500 font-normal">None</span>}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Batch Selection Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleToggleSelectAll}
                                className="bg-slate-900 border-slate-800 text-xs text-slate-300 hover:text-white"
                            >
                                {userAssets?.storeInventory?.length && selectedAssetIds.length === userAssets.storeInventory.length ? (
                                    <><CheckSquare className="w-3.5 h-3.5 mr-1.5 text-fuchsia-400" /> Deselect All</>
                                ) : (
                                    <><Square className="w-3.5 h-3.5 mr-1.5" /> Select All ({userAssets?.storeInventory?.length || 0})</>
                                )}
                            </Button>
                            {selectedAssetIds.length > 0 && (
                                <span className="text-xs text-fuchsia-400 font-bold">
                                    {selectedAssetIds.length} item(s) selected
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                onClick={handleRemoveSelectedAssets}
                                disabled={selectedAssetIds.length === 0 || removingAssets}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                {removingAssets ? 'Removing...' : `Remove Selected (${selectedAssetIds.length})`}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleRemoveAllAssets}
                                disabled={!userAssets?.storeInventory?.length || removingAssets}
                                className="bg-red-950/40 border-red-800/60 text-red-300 hover:bg-red-900/50 text-xs font-bold"
                            >
                                <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-red-400" />
                                Remove All Assets
                            </Button>
                        </div>
                    </div>

                    {/* Inventory Items List */}
                    {loadingAssets ? (
                        <div className="py-12 text-center text-slate-400 text-xs">
                            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-fuchsia-400" />
                            Loading user inventory assets...
                        </div>
                    ) : !userAssets?.storeInventory?.length ? (
                        <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                            No store inventory assets found for this user.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {userAssets.storeInventory.map((item: any, idx: number) => {
                                const itemKey = String(item._id || item.itemId || idx);
                                const isSelected = selectedAssetIds.includes(itemKey);
                                const isExpired = item.expiresAt && new Date(item.expiresAt).getTime() < Date.now();

                                return (
                                    <div
                                        key={itemKey}
                                        onClick={() => handleToggleAsset(itemKey)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                                            isSelected
                                                ? 'bg-fuchsia-950/40 border-fuchsia-500 shadow-lg shadow-fuchsia-950/30'
                                                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="mt-0.5">
                                            {isSelected ? (
                                                <CheckSquare className="w-4 h-4 text-fuchsia-400" />
                                            ) : (
                                                <Square className="w-4 h-4 text-slate-600" />
                                            )}
                                        </div>

                                        <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                                            {item.imageUrl || item.animationUrl ? (
                                                <img
                                                    src={item.imageUrl || item.animationUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <ImageIcon className="w-4 h-4 text-slate-600" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-white text-xs truncate">
                                                {item.name}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-medium">
                                                    {item.category || 'Asset'}
                                                </span>
                                                {isExpired && (
                                                    <span className="text-[10px] bg-red-950/80 text-red-400 px-1.5 py-0.5 rounded">
                                                        Expired
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-1 truncate">
                                                {item.expiresAt ? `Expires: ${new Date(item.expiresAt).toLocaleDateString()}` : 'Permanent'}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm(`Remove "${item.name}" from user inventory?`)) {
                                                    apiClient.post(`/api/store/admin/user/${id}/remove-assets`, {
                                                        inventoryItemIds: [itemKey],
                                                    }).then(() => {
                                                        toast.success(`Removed "${item.name}"`);
                                                        fetchUserAssets();
                                                    });
                                                }
                                            }}
                                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
                                            title="Delete asset"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
