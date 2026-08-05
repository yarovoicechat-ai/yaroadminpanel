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
import { Gem, Plus, RefreshCw, Calendar, Check, CheckCircle2, ShieldCheck, AlertCircle, Loader2, Tag, ShoppingBag, Clock, XCircle } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

// Base User Rate: 16.7 Diamonds / ₹1 INR (₹100 = 1,670 💎)
// Seller Discount Rule: ₹95 for ₹100 worth of Diamonds (5% Discount)
const USER_DIAMONDS_PER_RUPEE = 16.7;
const SELLER_DISCOUNT_FACTOR = 0.95; // Seller pays ₹95 per ₹100 worth of Diamonds
const SELLER_DIAMONDS_PER_RUPEE = USER_DIAMONDS_PER_RUPEE / SELLER_DISCOUNT_FACTOR; // ~17.579 💎 per ₹1

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

export interface VerifiedSeller {
    sellerCode: string;
    name: string;
    username: string;
    userId: number;
    image?: string;
    coinsSold?: number;
    creditLimit?: number;
}

export default function SellerRechargePage() {
    const [sellerCode, setSellerCode] = useState('');
    const [inrAmount, setInrAmount] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

    // Verification states
    const [verifying, setVerifying] = useState(false);
    const [verifiedSeller, setVerifiedSeller] = useState<VerifiedSeller | null>(null);
    const [isVerified, setIsVerified] = useState(false);

    // Stock requests state
    const [stockRequests, setStockRequests] = useState<any[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const [logs, setLogs] = useState<any[]>([]);

    const fetchHistory = async () => {
        try {
            setHistoryLoading(true);
            const res = await apiClient.get('/api/admin/recharges/history?type=seller&limit=50');
            if (res.success && res.data && res.data.history && res.data.history.length > 0) {
                setLogs(res.data.history);
            }
        } catch (err: any) {
            console.error('Failed to fetch seller recharge history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchStockRequests = async () => {
        try {
            setRequestsLoading(true);
            const res = await apiClient.get('/api/admin/sellers/stock-requests');
            if (res.success && res.data && res.data.requests) {
                setStockRequests(res.data.requests);
            }
        } catch (err: any) {
            console.error('Failed to fetch seller stock requests:', err);
        } finally {
            setRequestsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
        fetchStockRequests();
    }, []);

    const handleSellerCodeChange = (val: string) => {
        setSellerCode(val);
        setIsVerified(false);
        setVerifiedSeller(null);
    };

    const handleVerifySeller = async () => {
        if (!sellerCode.trim()) {
            return toast.error("Please enter a Seller Code or ID first");
        }

        setVerifying(true);
        try {
            const res = await apiClient.get(`/api/admin/sellers/verify/${encodeURIComponent(sellerCode.trim())}`);
            if (res.success && res.data?.seller) {
                setVerifiedSeller(res.data.seller);
                setIsVerified(true);
                toast.success(`Seller Verified: ${res.data.seller.name}`);
            } else {
                setVerifiedSeller(null);
                setIsVerified(false);
                toast.error(res.message || "Seller account not found");
            }
        } catch (err: any) {
            setVerifiedSeller(null);
            setIsVerified(false);
            const errMsg = err?.message || err?.error || "Failed to verify seller";
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
        toast.info(`Selected ${plan.diamonds.toLocaleString()} 💎 plan (${plan.price}) - ${plan.worth}`);
    };

    const handleRecharge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sellerCode || !amount || loading) return;

        if (!isVerified || !verifiedSeller) {
            return toast.error("Please click Verify to verify the Seller Code before recharging!");
        }

        const numDiamonds = Number(amount);
        if (isNaN(numDiamonds) || numDiamonds <= 0) {
            return toast.error("Please enter a valid diamond amount");
        }

        setLoading(true);
        try {
            const res = await apiClient.post('/api/admin/sellers/add-diamonds', {
                sellerId: verifiedSeller.userId,
                sellerCode: sellerCode.trim(),
                diamonds: numDiamonds,
                payableAmount: inrAmount ? Number(inrAmount) : undefined
            });

            if (res.success) {
                toast.success(res.message || `Successfully credited 💎 ${numDiamonds.toLocaleString()} to Seller ${verifiedSeller.name}`);
                setSellerCode('');
                setInrAmount('');
                setAmount('');
                setSelectedPlan(null);
                setIsVerified(false);
                setVerifiedSeller(null);
                fetchHistory();
            } else {
                toast.error(res.message || 'Failed to add diamonds to seller');
            }
        } catch (error: any) {
            const errMsg = error?.message || error?.error || (typeof error === 'string' ? error : 'Error processing recharge');
            console.error('Seller Recharge Error:', errMsg, error);
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveStockRequest = async (id: string) => {
        setProcessingId(id);
        try {
            const res = await apiClient.post(`/api/admin/sellers/stock-requests/${id}/approve`, {});
            if (res.success) {
                toast.success(res.message || "Stock request approved and diamonds credited to seller!");
                fetchStockRequests();
                fetchHistory();
            } else {
                toast.error(res.message || "Failed to approve stock request");
            }
        } catch (err: any) {
            toast.error(err?.message || "Error approving stock request");
        } finally {
            setProcessingId(null);
        }
    };

    const handleRejectStockRequest = async (id: string) => {
        setProcessingId(id);
        try {
            const res = await apiClient.post(`/api/admin/sellers/stock-requests/${id}/reject`, { reason: 'UTR payment could not be verified by Admin' });
            if (res.success) {
                toast.success("Stock request rejected");
                fetchStockRequests();
            } else {
                toast.error(res.message || "Failed to reject stock request");
            }
        } catch (err: any) {
            toast.error(err?.message || "Error rejecting stock request");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                        Seller Diamond Management & Stock Approvals
                    </h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">
                        Credit discounted Diamond packages & approve Buy Stock requests from authorized sellers
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => { fetchHistory(); fetchStockRequests(); }}>
                        <RefreshCw className={`h-4 w-4 mr-1 ${historyLoading || requestsLoading ? 'animate-spin' : ''}`} /> Refresh All
                    </Button>
                </div>
            </div>

            {/* Special Seller Discount Rate Info Bar */}
            <div className="p-3.5 rounded-xl bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 text-cyan-300">
                    <Tag className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-sm">Seller Special Discount Rate:</span>
                    <span className="text-slate-300">Seller pays <strong>₹95</strong> for <strong>1,670 💎</strong> (User pays <strong>₹100</strong> for <strong>1,670 💎</strong>)</span>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold shrink-0">
                    5% Seller Bonus Rate
                </Badge>
            </div>

            {/* Pending Seller Stock Requests Approval Table */}
            <Card className="glass-card border-blue-500/30">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-blue-300 text-lg">
                            <ShoppingBag className="h-5 w-5 text-blue-400" />
                            Pending Seller Stock Purchase Requests (Buy Stock)
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs mt-0.5">
                            Sellers who submitted Buy Stock requests with UTR payment proof for Admin approval
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 font-bold">
                        {stockRequests.filter(r => r.status === 'PENDING').length} Pending
                    </Badge>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800">
                                <TableHead className="font-bold text-slate-300">Req ID / Seller</TableHead>
                                <TableHead className="font-bold text-slate-300">Diamonds Requested</TableHead>
                                <TableHead className="font-bold text-slate-300">Amount Payable (₹)</TableHead>
                                <TableHead className="font-bold text-slate-300">UTR / Ref No.</TableHead>
                                <TableHead className="font-bold text-slate-300">Status</TableHead>
                                <TableHead className="font-bold text-slate-300">Submitted Date</TableHead>
                                <TableHead className="font-bold text-slate-300 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stockRequests.map((req) => (
                                <TableRow key={req._id || req.requestId} className="hover:bg-slate-800/40 border-slate-800/50">
                                    <TableCell className="font-mono text-xs">
                                        <div className="font-bold text-blue-400">{req.requestId}</div>
                                        <div className="text-slate-300">{req.sellerName || `Seller #${req.sellerId}`}</div>
                                    </TableCell>
                                    <TableCell className="font-extrabold text-cyan-300">
                                        +💎 {(req.diamonds || 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-100">
                                        ₹{(req.payableAmount || 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-emerald-400 font-bold">
                                        {req.utrNumber || '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] uppercase font-bold ${
                                                req.status === 'APPROVED'
                                                    ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                                                    : req.status === 'REJECTED'
                                                    ? 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                                                    : 'border-amber-500/30 text-amber-400 bg-amber-500/10 animate-pulse'
                                            }`}
                                        >
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {req.createdAt ? new Date(req.createdAt).toLocaleString() : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {req.status === 'PENDING' ? (
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    disabled={processingId === req._id}
                                                    onClick={() => handleApproveStockRequest(req._id)}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-7 text-xs px-2.5"
                                                >
                                                    {processingId === req._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-1" />}
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={processingId === req._id}
                                                    onClick={() => handleRejectStockRequest(req._id)}
                                                    className="border-rose-500/40 text-rose-400 hover:bg-rose-500/10 h-7 text-xs px-2"
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-500 font-medium">Processed</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {stockRequests.length === 0 && !requestsLoading && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-6 text-slate-500 text-xs">
                                        No pending stock purchase requests.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Seller Diamond Recharge Plans Section */}
            <Card className="glass-card border-cyan-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-cyan-300 text-lg">
                        <Gem className="h-5 w-5 text-cyan-400" />
                        Direct Seller Credit Plans (5% Discounted)
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                        Click on any discounted package card below to auto-select diamond amount for direct seller credit.
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
                            Direct Seller Stock Credit
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleRecharge} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Seller Code / ID</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. SEL881"
                                        value={sellerCode}
                                        onChange={(e) => handleSellerCodeChange(e.target.value)}
                                        required
                                        className="uppercase flex-1"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleVerifySeller}
                                        disabled={verifying || !sellerCode.trim()}
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

                            {/* Verified Seller Details Card */}
                            {verifiedSeller && isVerified && (
                                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/50 flex items-center gap-3.5 animate-in fade-in duration-200 shadow-lg">
                                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-emerald-400 bg-slate-800 shrink-0 flex items-center justify-center text-emerald-300 font-bold text-lg">
                                        {verifiedSeller.image ? (
                                            <img src={verifiedSeller.image} alt={verifiedSeller.name} className="h-full w-full object-cover" />
                                        ) : (
                                            verifiedSeller.name?.[0]?.toUpperCase() || 'S'
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="font-bold text-sm text-slate-100 truncate">{verifiedSeller.name}</h4>
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                                            <span className="text-emerald-400 font-semibold">{verifiedSeller.username}</span>
                                            <span>•</span>
                                            <span className="font-mono text-slate-300">ID: #{verifiedSeller.userId}</span>
                                        </div>
                                    </div>
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
                                className="w-full font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading || !isVerified || !verifiedSeller}
                            >
                                {loading ? 'Crediting Diamonds...' : 'Credit Seller Diamonds'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* History Logs */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Calendar size={20} className="text-cyan-400 animate-pulse" />
                            Recent Sellers Diamond Recharge Audit Logs
                        </CardTitle>
                        <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                            {logs.length} Transactions
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800">
                                    <TableHead className="font-bold text-slate-300">Seller Code</TableHead>
                                    <TableHead className="font-bold text-slate-300">Agency Name</TableHead>
                                    <TableHead className="font-bold text-slate-300">Diamonds Credited</TableHead>
                                    <TableHead className="font-bold text-slate-300">Date Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id || log._id} className="hover:bg-muted/30 border-slate-800/50">
                                        <TableCell className="font-mono text-xs text-cyan-400 font-bold">{log.sellerCode}</TableCell>
                                        <TableCell className="font-semibold text-slate-200">{log.name}</TableCell>
                                        <TableCell className="font-bold text-cyan-300">+{ (log.amount || log.diamonds || 0).toLocaleString() } 💎</TableCell>
                                        <TableCell className="text-xs text-muted-foreground font-semibold">
                                            {log.date || (log.createdAt ? new Date(log.createdAt).toLocaleString() : '-')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
