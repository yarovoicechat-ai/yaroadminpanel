'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from 'sonner';
import { UserPlus, ArrowLeft, Coins, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { useAuth } from '@/contexts/AuthContext';

export default function AddUserPage() {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('male');
    const [role, setRole] = useState('user');
    const [coins, setCoins] = useState('100');
    const [loading, setLoading] = useState(false);

    const handleAddUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) {
            return toast.error("Name and Email are required");
        }
        if (currentUser?.role === 'operator' && role === 'operator') {
            return toast.error('Operators cannot create another Operator account.');
        }
        setLoading(true);
        try {
            const autoPassword = password || 'YaroApp@12345';
            const payload = {
                name,
                email,
                password: autoPassword,
                phoneNumber: phone || undefined,
                targetRole: role,
                gender,
                coins: Number(coins) || 100
            };

            const res = await apiClient.post(API_ENDPOINTS.ADMIN.CREATE_EMPLOYEE, payload);

            if (res.success) {
                toast.success(`Successfully registered "${name}" as ${role}`);
                setName('');
                setEmail('');
                setPassword('');
                setPhone('');
                setCoins('100');
                router.push('/users');
            } else {
                toast.error(res.message || "Failed to register account");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to register user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/users">
                        <Button variant="outline" size="sm" className="font-bold">
                            <ArrowLeft size={16} className="mr-1" /> Back
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Add New User</h2>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <UserPlus className="text-primary animate-pulse" />
                        Create User Account
                    </CardTitle>
                    <CardDescription>Manually provision a user profile in the database.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddUserSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Display Name *</label>
                                <Input
                                    placeholder="e.g. Rahul Sharma"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Gender</label>
                                <select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Email Address *</label>
                            <Input
                                type="email"
                                placeholder="rahul@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Password (Default: YaroApp@12345)</label>
                            <div className="relative">
                                <Input
                                    type="password"
                                    placeholder="Enter password or leave blank for default"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Phone Number (Optional)</label>
                            <Input
                                placeholder="e.g. +91 99999 88888"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">System Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2"
                                >
                                    <option value="user">Standard User</option>
                                    <option value="host">Host</option>
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    To create Staff/Employee accounts, go to <Link href="/employees" className="text-dosti-400 underline">Employees</Link>.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Initial Coins</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        value={coins}
                                        onChange={(e) => setCoins(e.target.value)}
                                        required
                                    />
                                    <Coins className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full font-bold mt-2" disabled={loading}>
                            {loading ? 'Registering...' : 'Register User Profile'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
