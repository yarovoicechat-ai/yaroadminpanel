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
import { ArrowLeft, Save, ShieldCheck, User as UserIcon, Coins, Award, Globe, Calendar, Ban, CheckCircle, Info, Mail, Phone, Lock, Edit3 } from 'lucide-react';
import type { User } from '@/types/models';

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
    const [role, setRole] = useState<'owner' | 'superAdmin' | 'admin' | 'coinSeller' | 'host' | 'user'>('user');
    const [countryName, setCountryName] = useState('');
    const [countryCode, setCountryCode] = useState('');
    const [isBlocked, setIsBlocked] = useState(false);
    const [userName, setUserNameState] = useState('');

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
    }, [id]);

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
                }
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
                    {user.image ? (
                        <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        user.name?.charAt(0) || 'U'
                    )}
                </div>
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                        <Badge variant="secondary" className="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 capitalize font-bold text-xs">{user.role}</Badge>
                        <Badge variant={!isBlocked ? 'success' : 'destructive'} className="font-bold text-xs">
                            {!isBlocked ? 'Active' : 'Suspended'}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Left Panel: Profile Info Display (Matches Screenshot) */}
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
                                    <span className="text-slate-400 font-semibold">Mongo ObjectId :-</span>
                                    <span className="text-slate-300 font-mono text-xs select-all bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{user._id}</span>
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
                                    <span className="text-fuchsia-400 font-mono">110.227.235.4</span>
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
                                <span>Lives in {countryName || 'India'} ({countryCode || 'IN'})</span>
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

                                    {/* Password Reset */}
                                    <div className="grid gap-1.5 sm:col-span-2">
                                        <label htmlFor="edit-password" className="text-xs font-semibold text-slate-400">Change Password (Leave blank to keep current)</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                            <Input id="edit-password" type="password" placeholder="Enter new strong password" value={password} onChange={e => setPassword(e.target.value)} className="pl-9 bg-slate-950 border-slate-800 text-slate-200" />
                                        </div>
                                    </div>

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
        </div>
    );
}
