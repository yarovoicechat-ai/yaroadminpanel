'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from 'sonner';
import { UserPlus, ArrowLeft, Coins, Lock, Sparkles, RefreshCw, Copy, Check, CheckCircle2, Key, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { useAuth } from '@/contexts/AuthContext';

export default function AddUserPage() {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('+91');
    const [password, setPassword] = useState('password123');
    const [email, setEmail] = useState('');
    const [gender, setGender] = useState<'male' | 'female'>('male');
    const [role, setRole] = useState('user');
    const [coins, setCoins] = useState('10000');
    const [diamonds, setDiamonds] = useState('1000');
    const [customUserId, setCustomUserId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [createdCredentials, setCreatedCredentials] = useState<{
        userId: number;
        name: string;
        phoneNumber: string;
        password: string;
    } | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleGenerateRandom = () => {
        const firstNames = ['Rahul', 'Pooja', 'Amit', 'Neha', 'Vikas', 'Priya', 'Rohit', 'Sneha', 'Arjun', 'Anjali', 'Karan', 'Riya', 'Aman', 'Simran'];
        const lastNames = ['Sharma', 'Verma', 'Kumar', 'Singh', 'Patel', 'Yadav', 'Gupta', 'Mishra', 'Mehta', 'Joshi', 'Choudhary'];
        const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        const randomDigits = Math.floor(6000000000 + Math.random() * 3999999999);
        const randomPhone = `+91${randomDigits}`;
        const randomGender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';

        setName(randomName);
        setPhone(randomPhone);
        setPassword('password123');
        setGender(randomGender);
        setCoins('10000');
        setDiamonds('1000');
        setCustomUserId('');
        toast.info("Auto-filled random test user details!");
    };

    const handleCopy = (text: string, fieldName: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        toast.success(`Copied ${fieldName} to clipboard!`);
        setTimeout(() => setCopiedField(null), 2500);
    };

    const handleAddUserSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            return toast.error("Name is required");
        }
        const cleanDigits = phone.replace(/\D/g, '');
        if (!phone.trim() || cleanDigits.length < 6) {
            return toast.error("Valid phone number with at least 6 digits is required for mobile app login");
        }
        if (!password.trim() || password.trim().length < 4) {
            return toast.error("Password must be at least 4 characters");
        }

        setLoading(true);
        try {
            const payload: any = {
                name: name.trim(),
                phoneNumber: phone.trim(),
                password: password.trim(),
                gender,
                coins: Number(coins) || 0,
                diamonds: Number(diamonds) || 0,
            };
            if (email.trim()) {
                payload.email = email.trim();
            }
            if (customUserId.trim()) {
                payload.customUserId = parseInt(customUserId.trim());
            }

            const res = await apiClient.post(API_ENDPOINTS.USERS.CREATE_FAKE, payload);

            if (res.success && res.data) {
                const creds = res.data.loginCredentials || {
                    userId: res.data.userId,
                    name: res.data.name,
                    phoneNumber: res.data.phoneNumber,
                    password: password.trim()
                };
                setCreatedCredentials(creds);
                toast.success(`Successfully registered "${name}" (User ID: #${creds.userId})`);
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
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleGenerateRandom}
                    className="border-purple-500/40 text-purple-300 hover:bg-purple-500/20"
                >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> 🎲 Random Auto-fill
                </Button>
            </div>

            {createdCredentials ? (
                <Card className="glass-card border-emerald-500/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="h-6 w-6" /> User Account Ready for Login!
                        </CardTitle>
                        <CardDescription>
                            This user has been saved with full permissions and can immediately log into the Yaro mobile app.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2.5 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">User ID:</span>
                                <span className="font-bold text-slate-100 font-mono">#{createdCredentials.userId}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Display Name:</span>
                                <span className="font-semibold text-slate-100">{createdCredentials.name}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Phone Number:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-amber-300 font-mono">{createdCredentials.phoneNumber}</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        onClick={() => handleCopy(createdCredentials.phoneNumber, 'Phone')}
                                    >
                                        {copiedField === 'Phone' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Password:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-purple-300 font-mono">{createdCredentials.password}</span>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        onClick={() => handleCopy(createdCredentials.password, 'Password')}
                                    >
                                        {copiedField === 'Password' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
                            <Key className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-semibold">How to log in on mobile app:</span>
                                <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-400">
                                    <li>Open Yaro App and navigate to Sign In screen</li>
                                    <li>Phone: <span className="text-slate-200 font-mono">{createdCredentials.phoneNumber}</span></li>
                                    <li>Password: <span className="text-slate-200 font-mono">{createdCredentials.password}</span></li>
                                    <li>Tap Sign In to immediately enter the app</li>
                                </ol>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    const fullCreds = `Phone: ${createdCredentials.phoneNumber}\nPassword: ${createdCredentials.password}\nUser ID: ${createdCredentials.userId}`;
                                    handleCopy(fullCreds, 'Login Details');
                                }}
                            >
                                <Copy className="mr-2 h-4 w-4" /> Copy All Credentials
                            </Button>
                            <Button
                                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white"
                                onClick={() => {
                                    setCreatedCredentials(null);
                                    handleGenerateRandom();
                                }}
                            >
                                <UserPlus className="mr-2 h-4 w-4" /> Create Another User
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Sparkles className="text-purple-400 animate-pulse" />
                            Create User (Phone & Password Login)
                        </CardTitle>
                        <CardDescription>
                            Create an authoritative user profile that can directly log into the mobile app with phone and password.
                        </CardDescription>
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
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={gender === 'male' ? 'default' : 'outline'}
                                            className={gender === 'male' ? 'bg-cyan-600 hover:bg-cyan-500 flex-1' : 'flex-1'}
                                            onClick={() => setGender('male')}
                                        >
                                            👨 Male
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant={gender === 'female' ? 'default' : 'outline'}
                                            className={gender === 'female' ? 'bg-pink-600 hover:bg-pink-500 flex-1' : 'flex-1'}
                                            onClick={() => setGender('female')}
                                        >
                                            👩 Female
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Phone Number (Required for Mobile Login) *</label>
                                <Input
                                    placeholder="e.g. +919876543210"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Login Password *</label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter password (e.g. password123)"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Email Address (Optional)</label>
                                    <Input
                                        type="email"
                                        placeholder="user@example.com (optional)"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Custom User ID (Optional)</label>
                                    <Input
                                        type="number"
                                        placeholder="Auto-generated if blank"
                                        value={customUserId}
                                        onChange={(e) => setCustomUserId(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
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
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Initial Diamonds</label>
                                    <Input
                                        type="number"
                                        value={diamonds}
                                        onChange={(e) => setDiamonds(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full font-bold mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"
                                disabled={loading}
                            >
                                {loading ? 'Creating User...' : 'Create User & Enable Mobile Login'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
