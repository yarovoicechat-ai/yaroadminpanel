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
import { Coins, Plus, Calendar, Gem, RefreshCw, Check } from "lucide-react";
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

export default function UserRechargePage() {
    const [userId, setUserId] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [logs, setLogs] = useState<any[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<number | null>(null);

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

    const handleSelectPlan = (plan: typeof DIAMOND_PLANS[0], index: number) => {
        setSelectedPlan(index);
        setAmount(plan.diamonds.toString());
        toast.info(`Selected ${plan.diamonds.toLocaleString()} 💎 plan (${plan.price})`);
    };

    const handleRecharge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId || !amount) return;

        setLoading(true);
        try {
            const res = await apiClient.post('/api/admin/users/add-diamonds', {
                userId: Number(userId),
                diamonds: Number(amount)
            });
            if (res.success) {
                toast.success(res.message || `Successfully added ${Number(amount).toLocaleString()} diamonds`);
                setUserId('');
                setAmount('');
                setSelectedPlan(null);
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
                        Credit Diamonds packages directly to user profiles & manage active rate plans
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
                                <Input
                                    type="number"
                                    placeholder="e.g. 10002"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Diamonds Amount</label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        placeholder="e.g. 985"
                                        value={amount}
                                        onChange={(e) => {
                                            setAmount(e.target.value);
                                            setSelectedPlan(null);
                                        }}
                                        required
                                    />
                                    <Coins className="absolute right-3 top-3 h-4 w-4 text-cyan-400" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white" disabled={loading}>
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
