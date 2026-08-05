'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
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
import { Coins, Plus, Calendar, Gem, RefreshCw, Check, CheckCircle2, ShieldCheck, AlertCircle, User, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

const DIAMOND_PLANS = [
    { price: '₹59', diamonds: 985, isPopular: false },
    { price: '₹99', diamonds: 1650, isPopular: true },
    { price: '₹199', diamonds: 3325, isPopular: false },
    { price: '₹399', diamonds: 6665, isPopular: false },
    { price: '₹599', diamonds: 10000, isPopular: false },
    { price: '₹999', diamonds: 16700, isPopular: false },
    { price: '₹1,999', diamonds: 33400, isPopular: false },
    { price: '₹4,999', diamonds: 83500, isPopular: false },
    { price: '₹9,999', diamonds: 167000, isPopular: false },
];

export interface VerifiedUser {
    userId: number;
    name: string;
    userName: string;
    meethiId: string;
    image: string;
    coins: number;
    diamonds: number;
    role?: string;
    isBlocked?: boolean;
}

export default function UserRechargePage() {
    const [userId, setUserId] = useState('');
    const [inrAmount, setInrAmount] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

    // Rate: ~16.7 Diamonds per 1 Rupee
    const DIAMONDS_PER_RUPEE = 16.7;

    // Verification states
    const [verifying, setVerifying] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null);
    const [isVerified, setIsVerified] = useState(false);

    const fetchHistory = async () => {
        try {
            setHistoryLoading(true);
            const res = await apiClient.get('/api/admin/recharges/history?limit=50');
            if (res.success && res.data && res.data.history) {
                setLogs(res.data.history);
            }
        } catch (err: any) {
            console.error('Failed to fetch recharge history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleUserIdChange = (val: string) => {
        setUserId(val);
        setIsVerified(false);
        setVerifiedUser(null);
    };

    const handleVerifyUser = async () => {
        if (!userId.trim()) {
            return toast.error("Please enter a User ID first");
        }

        setVerifying(true);
        try {
            const res = await apiClient.get(`/api/admin/users/verify/${userId.trim()}`);
            if (res.success && res.data?.user) {
                setVerifiedUser(res.data.user);
                setIsVerified(true);
                toast.success(`User Verified: ${res.data.user.name}`);
            } else {
                setVerifiedUser(null);
                setIsVerified(false);
                toast.error(res.message || "User not found with this ID");
            }
        } catch (err: any) {
            setVerifiedUser(null);
            setIsVerified(false);
            const errMsg = err?.message || err?.error || "Failed to verify user ID";
            toast.error(errMsg);
        } finally {
            setVerifying(false);
        }
    };

    const handleInrChange = (val: string) => {
        setInrAmount(val);
        setSelectedPlan(null);
        if (!val || isNaN(Number(val))) {
            setAmount('');
            return;
        }
        const numRs = Number(val);
        const calcDiamonds = Math.round(numRs * DIAMONDS_PER_RUPEE);
        setAmount(calcDiamonds.toString());
    };

    const handleDiamondsChange = (val: string) => {
        setAmount(val);
        setSelectedPlan(null);
        if (!val || isNaN(Number(val))) {
            setInrAmount('');
            return;
        }
        const numDiamonds = Number(val);
        const calcRs = Math.round(numDiamonds / DIAMONDS_PER_RUPEE);
        setInrAmount(calcRs.toString());
    };

    const handleSelectPlan = (plan: typeof DIAMOND_PLANS[0], index: number) => {
        setSelectedPlan(index);
        const rawRs = plan.price.replace(/[^\d]/g, '');
        setInrAmount(rawRs);
        setAmount(plan.diamonds.toString());
        toast.info(`Selected ${plan.diamonds.toLocaleString()} 💎 plan (${plan.price})`);
    };

    const handleRecharge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !amount) return;

        if (!isVerified || !verifiedUser) {
            return toast.error("Please click Verify to verify the User ID before recharging!");
        }

        setLoading(true);
        try {
            const res = await apiClient.post('/api/admin/users/add-diamonds', {
                userId: Number(verifiedUser.userId),
                diamonds: Number(amount)
            });
            if (res.success) {
                toast.success(res.message || `Successfully added ${Number(amount).toLocaleString()} diamonds to ${verifiedUser.name}`);
                setUserId('');
                setInrAmount('');
                setAmount('');
                setSelectedPlan(null);
                setIsVerified(false);
                setVerifiedUser(null);
                fetchHistory();
            } else {
                toast.error(res.message || 'Recharge failed');
            }
        } catch (error: any) {
            const errMsg = error?.message || error?.error || (typeof error === 'string' ? error : 'Error communicating with backend');
            console.error('Recharge Error:', errMsg, error);
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        User Diamond Recharge
                    </h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">
                        Credit Diamonds packages directly to verified user profiles
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchHistory} disabled={historyLoading}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${historyLoading ? 'animate-spin' : ''}`} /> Refresh Logs
                </Button>
            </div>

            {/* Diamond Recharge Plans Section */}
            <Card className="glass-card border-cyan-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-cyan-300 text-lg">
                        <Gem className="h-5 w-5 text-cyan-400" />
                        Available Diamond Plans
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                        Click on any plan card below to auto-select the diamond amount for user credit.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
                        {DIAMOND_PLANS.map((plan, idx) => (
                            <div
                                key={plan.price}
                                onClick={() => handleSelectPlan(plan, idx)}
                                className={`cursor-pointer rounded-xl p-3 border flex flex-col items-center justify-between transition-all hover:scale-105 ${
                                    selectedPlan === idx
                                        ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/50'
                                        : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40'
                                }`}
                            >
                                {plan.isPopular && (
                                    <Badge className="bg-cyan-500 text-[9px] text-slate-950 font-bold mb-1 px-1.5 py-0">POPULAR</Badge>
                                )}
                                <span className="text-sm font-bold text-slate-200">{plan.price}</span>
                                <div className="my-1.5 flex items-center gap-1 text-cyan-400 font-extrabold text-base">
                                    <span>💎</span>
                                    <span>{plan.diamonds.toLocaleString()}</span>
                                </div>
                                {selectedPlan === idx && (
                                    <Check className="h-4 w-4 text-cyan-400 mt-1" />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Recharge Form */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Plus size={20} className="text-cyan-400" />
                            Allocate Diamonds
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRecharge} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Target User ID</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Enter User ID or Username"
                                        value={userId}
                                        onChange={(e) => handleUserIdChange(e.target.value)}
                                        required
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleVerifyUser}
                                        disabled={verifying || !userId.trim()}
                                        className={`font-semibold shrink-0 ${
                                            isVerified
                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                                        }`}
                                    >
                                        {verifying ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : isVerified ? (
                                            <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Verified</span>
                                        ) : (
                                            <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Verify</span>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Verified User Details Profile Card */}
                            {verifiedUser && isVerified && (
                                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/50 flex items-center gap-3.5 animate-in fade-in duration-200 shadow-lg">
                                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-emerald-400 bg-slate-800 shrink-0">
                                        {verifiedUser.image ? (
                                            <img src={verifiedUser.image} alt={verifiedUser.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-emerald-950 text-emerald-300 font-bold text-lg">
                                                {verifiedUser.name?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="font-bold text-sm text-slate-100 truncate">{verifiedUser.name}</h4>
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                                            <span className="text-emerald-400 font-semibold">{verifiedUser.userName}</span>
                                            <span>•</span>
                                            <span className="font-mono text-slate-300">ID: #{verifiedUser.userId}</span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-[11px]">
                                            <span className="text-amber-400 font-medium">🪙 {verifiedUser.coins?.toLocaleString()}</span>
                                            <span className="text-cyan-400 font-medium">💎 {verifiedUser.diamonds?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!isVerified && userId.trim() !== '' && (
                                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                                    <span>Click <strong>Verify</strong> to confirm user profile details before recharging.</span>
                                </div>
                            )}

                            {/* Rupee (₹) Amount Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 flex items-center justify-between">
                                    <span>Amount in Rupees (₹ INR)</span>
                                    <span className="text-xs text-cyan-400 font-normal">Auto-Calculator</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="Enter Rupees (e.g. 100)"
                                        value={inrAmount}
                                        onChange={(e) => handleInrChange(e.target.value)}
                                    />
                                    <span className="absolute right-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                                </div>
                            </div>

                            {/* Calculated Diamonds Count Display & Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Calculated Diamonds (💎)</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="e.g. 1670"
                                        value={amount}
                                        onChange={(e) => handleDiamondsChange(e.target.value)}
                                        required
                                    />
                                    <Coins className="absolute right-3 top-3 h-4 w-4 text-cyan-400" />
                                </div>
                            </div>

                            {/* Conversion Info Badge */}
                            {amount && Number(amount) > 0 && (
                                <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs">
                                    <span className="text-slate-300 font-medium">Recharge Total:</span>
                                    <span className="text-cyan-300 font-bold text-sm flex items-center gap-1">
                                        {inrAmount ? `₹${Number(inrAmount).toLocaleString()}` : ''} ➔ 💎 {Number(amount).toLocaleString()} Diamonds
                                    </span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading || !isVerified || !verifiedUser}
                            >
                                {loading ? 'Crediting Diamonds...' : 'Credit Diamonds'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History Logs */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Calendar size={20} className="text-cyan-400 animate-pulse" />
                            Diamond Recharge History Logs
                        </CardTitle>
                        <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                            {logs.length} Transactions
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800">
                                    <TableHead className="font-bold text-slate-300">User ID</TableHead>
                                    <TableHead className="font-bold text-slate-300">User Profile Name</TableHead>
                                    <TableHead className="font-bold text-slate-300">Diamonds Credited</TableHead>
                                    <TableHead className="font-bold text-slate-300">Type</TableHead>
                                    <TableHead className="font-bold text-slate-300">Date Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log, idx) => (
                                    <TableRow key={log._id || idx} className="hover:bg-muted/30 border-slate-800/50">
                                        <TableCell className="font-mono text-xs text-cyan-400 font-bold">{log.userId}</TableCell>
                                        <TableCell className="font-semibold text-slate-200">
                                            {log.user?.name || `User #${log.userId}`}
                                        </TableCell>
                                        <TableCell className="font-bold text-cyan-300">
                                            +{ (log.diamonds || log.amount || 0).toLocaleString() } 💎
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] uppercase border-cyan-500/20 text-cyan-400">
                                                {log.type || 'OFFLINE'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground font-semibold">
                                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : log.date || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {logs.length === 0 && !historyLoading && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                            No recharge transactions recorded yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
