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
import { Gem, Plus, RefreshCw, Calendar, Check, CheckCircle2, ShieldCheck, AlertCircle, Loader2, Tag, Printer } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

// Base User Rate: 16.7 Diamonds / ₹1 INR (₹100 = 1,670 💎)
// Seller Discount Rule: ₹95 for ₹100 worth of Diamonds (5% Discount)
const USER_DIAMONDS_PER_RUPEE = 16.7;
const SELLER_DISCOUNT_FACTOR = 0.95;
const SELLER_DIAMONDS_PER_RUPEE = USER_DIAMONDS_PER_RUPEE / SELLER_DISCOUNT_FACTOR;

const SELLER_DIAMOND_PLANS = [
    { price: '₹95', diamonds: 1670, worth: '₹100 User Value', isPopular: false },
    { price: '₹475', diamonds: 8350, worth: '₹500 User Value', isPopular: false },
    { price: '₹950', diamonds: 16700, worth: '₹1,000 User Value', isPopular: true },
    { price: '₹1,895', diamonds: 33325, worth: '₹2,000 User Value', isPopular: false },
    { price: '₹4,750', diamonds: 83500, worth: '₹5,000 User Value', isPopular: true },
    { price: '₹9,500', diamonds: 167000, worth: '₹10,000 User Value', isPopular: false },
    { price: '₹23,750', diamonds: 417500, worth: '₹25,000 User Value', isPopular: false },
    { price: '₹47,500', diamonds: 835000, worth: '₹50,000 User Value', isPopular: false },
    { price: '₹95,000', diamonds: 1670000, worth: '₹1,00,000 User Value', isPopular: false },
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
    status?: string;
}

export default function SellerUserRechargePage() {
    const [userId, setUserId] = useState('');
    const [inrAmount, setInrAmount] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

    // Verification states
    const [verifying, setVerifying] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState<VerifiedUser | null>(null);
    const [isVerified, setIsVerified] = useState(false);

    // Receipt Modal state
    const [lastReceipt, setLastReceipt] = useState<any | null>(null);
    const [logs, setLogs] = useState<any[]>([]);

    const fetchHistory = async () => {
        try {
            setHistoryLoading(true);
            const res = await apiClient.get('/api/seller/history?type=USER_RECHARGE&limit=20');
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
            const res = await apiClient.get(`/api/seller/users/${encodeURIComponent(userId.trim())}`);
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
        const calcDiamonds = Math.round(numRs * SELLER_DIAMONDS_PER_RUPEE);
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
        const calcRs = Math.round((numDiamonds * SELLER_DISCOUNT_FACTOR) / USER_DIAMONDS_PER_RUPEE);
        setInrAmount(calcRs.toString());
    };

    const handleSelectPlan = (plan: typeof SELLER_DIAMOND_PLANS[0], index: number) => {
        setSelectedPlan(index);
        const rawRs = plan.price.replace(/[^\d]/g, '');
        setInrAmount(rawRs);
        setAmount(plan.diamonds.toString());
        toast.info(`Selected ${plan.diamonds.toLocaleString()} 💎 plan (${plan.price})`);
    };

    const handleRecharge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !amount || loading) return;

        if (!isVerified || !verifiedUser) {
            return toast.error("Please click Verify to verify the User ID before crediting!");
        }

        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return toast.error("Please enter a valid diamond amount");
        }

        // Generate unique Client Idempotency Key
        const idempotencyKey = `IK_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        setLoading(true);
        try {
            const res = await apiClient.post('/api/seller/recharge', {
                userId: verifiedUser.userId,
                diamonds: numAmount,
                idempotencyKey
            });

            if (res.success && res.data?.receipt) {
                const receipt = res.data.receipt;
                setLastReceipt(receipt);
                toast.success(res.message || `Successfully credited ${numAmount.toLocaleString()} 💎 to ${verifiedUser.name}`);

                // Reset form
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
            const errMsg = error?.message || error?.error || (typeof error === 'string' ? error : 'Error processing recharge');
            console.error('Seller Recharge Error:', errMsg, error);
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                        User Recharge Console
                    </h2>
                    <p className="text-muted-foreground mt-1 font-medium text-sm">
                        Credit Diamond packages to user profiles at your special ₹95 Seller Rate
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchHistory} disabled={historyLoading}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${historyLoading ? 'animate-spin' : ''}`} /> Refresh History
                </Button>
            </div>

            {/* Special Seller Rate Info Bar */}
            <div className="p-3.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 text-cyan-300">
                    <Tag className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-sm">Seller Special Discount Rate:</span>
                    <span className="text-slate-300">Seller pays <strong>₹95</strong> for <strong>1,670 💎</strong> (User pays <strong>₹100</strong> for <strong>1,670 💎</strong>)</span>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold shrink-0">
                    5% Seller Bonus Rate
                </Badge>
            </div>

            {/* Seller Diamond Recharge Plans Section */}
            <Card className="glass-card border-cyan-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-cyan-300 text-lg">
                        <Gem className="h-5 w-5 text-cyan-400" />
                        Available Seller Diamond Plans (5% Discounted)
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                        Click on any package card below to auto-select diamond amount for user credit.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
                        {SELLER_DIAMOND_PLANS.map((plan, idx) => (
                            <div
                                key={plan.price}
                                onClick={() => handleSelectPlan(plan, idx)}
                                className={`cursor-pointer rounded-xl p-3 border flex flex-col items-center justify-between transition-all hover:scale-105 ${
                                    selectedPlan === idx
                                        ? 'bg-cyan-950/70 border-cyan-400 ring-2 ring-cyan-400/50'
                                        : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40'
                                }`}
                            >
                                {plan.isPopular && (
                                    <Badge className="bg-cyan-500 text-[9px] text-slate-950 font-bold mb-1 px-1.5 py-0">BEST VALUE</Badge>
                                )}
                                <span className="text-sm font-bold text-slate-100">{plan.price}</span>
                                <div className="my-1 flex items-center gap-1 text-cyan-400 font-extrabold text-xs">
                                    <span>💎</span>
                                    <span>{plan.diamonds.toLocaleString()}</span>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-medium">{plan.worth}</span>
                                {selectedPlan === idx && (
                                    <Check className="h-4 w-4 text-cyan-400 mt-1" />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Recharge form */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Plus size={20} className="text-cyan-400" />
                            Credit Diamonds to User
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRecharge} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Target User ID</label>
                                <div className="flex gap-2">
                                    <Input
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
                                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-emerald-400 bg-slate-800 shrink-0 flex items-center justify-center text-emerald-300 font-bold text-lg">
                                        {verifiedUser.image ? (
                                            <img src={verifiedUser.image} alt={verifiedUser.name} className="h-full w-full object-cover" />
                                        ) : (
                                            verifiedUser.name?.[0]?.toUpperCase() || 'U'
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
                                    </div>
                                </div>
                            )}

                            {!isVerified && userId.trim() !== '' && (
                                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                                    <span>Click <strong>Verify</strong> to verify user details before crediting.</span>
                                </div>
                            )}

                            {/* Rupee (₹) Amount Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 flex items-center justify-between">
                                    <span>Amount in Rupees (₹ INR)</span>
                                    <span className="text-xs text-cyan-400 font-normal">Auto-Calculator (₹95 Rate)</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="Enter Rupees (e.g. 95)"
                                        value={inrAmount}
                                        onChange={(e) => handleInrChange(e.target.value)}
                                    />
                                    <span className="absolute right-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                                </div>
                            </div>

                            {/* Calculated Diamonds Count Input */}
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
                                    <Gem className="absolute right-3 top-3 h-4 w-4 text-cyan-400" />
                                </div>
                            </div>

                            {/* Conversion Info Badge */}
                            {amount && Number(amount) > 0 && (
                                <div className="p-3 rounded-lg bg-cyan-950/50 border border-cyan-500/30 flex flex-col gap-1 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-300 font-medium">Recharge Total:</span>
                                        <span className="text-cyan-300 font-bold text-sm flex items-center gap-1">
                                            {inrAmount ? `₹${Number(inrAmount).toLocaleString()}` : ''} ➔ 💎 {Number(amount).toLocaleString()} Diamonds
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-emerald-400 font-semibold text-right">
                                        Seller Savings: Pays ₹95 rate for ₹100 User Diamond value
                                    </span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                disabled={loading || !isVerified || !verifiedUser}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Processing Transaction...
                                    </>
                                ) : (
                                    'Credit Diamonds Now'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History Logs & Recent Receipt Preview */}
                <div className="md:col-span-2 space-y-4">
                    {/* Last Receipt Notification Card if available */}
                    {lastReceipt && (
                        <Card className="glass-card border-emerald-500/50 bg-emerald-950/20 animate-in fade-in duration-300">
                            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-400">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-100">Transaction Completed #{lastReceipt.txId}</h4>
                                        <p className="text-xs text-emerald-300">
                                            Credited <strong>{lastReceipt.diamonds?.toLocaleString()} 💎</strong> to User #{lastReceipt.userId} (Cost: ₹{lastReceipt.sellerCost})
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => toast.info(`Digital Receipt Ref #${lastReceipt.txId}`)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shrink-0"
                                >
                                    <Printer className="h-3.5 w-3.5 mr-1.5" /> Digital Receipt
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Audit Logs */}
                    <Card className="glass-card">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-slate-200">
                                <Calendar size={20} className="text-cyan-400 animate-pulse" />
                                User Recharge History Logs
                            </CardTitle>
                            <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                                {logs.length} Transactions
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800">
                                        <TableHead className="font-bold text-slate-300">Tx ID / Target User</TableHead>
                                        <TableHead className="font-bold text-slate-300">Diamonds Credited</TableHead>
                                        <TableHead className="font-bold text-slate-300">Cost (₹)</TableHead>
                                        <TableHead className="font-bold text-slate-300">Customer Amt (₹)</TableHead>
                                        <TableHead className="font-bold text-slate-300">Date Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map((log, idx) => (
                                        <TableRow key={log.transactionId || log.id || idx} className="hover:bg-muted/30 border-slate-800/50">
                                            <TableCell className="font-mono text-xs text-cyan-400 font-bold">
                                                {log.transactionId || log.id} <span className="text-slate-400">(User #{log.userId})</span>
                                            </TableCell>
                                            <TableCell className="font-bold text-cyan-300">
                                                +{ (log.diamonds || 0).toLocaleString() } 💎
                                            </TableCell>
                                            <TableCell className="font-bold text-slate-200">
                                                ₹{ (log.sellerCost || log.inr || 0).toLocaleString() }
                                            </TableCell>
                                            <TableCell className="font-bold text-emerald-400">
                                                ₹{ (log.customerAmount || 0).toLocaleString() }
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
        </div>
    );
}
