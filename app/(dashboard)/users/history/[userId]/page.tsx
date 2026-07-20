'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { ArrowLeft, Coins, Clock, CreditCard, PhoneCall, Gift, Search, ArrowRight } from 'lucide-react';
import type { User } from '@/types/models';

type CoinTransaction = {
    type: string;
    coinsSpent: number;
    coins: number;
    createdAt: string;
    meta?: {
        hostName?: string;
        callDuration?: number;
        giftName?: string;
    };
};

type RechargeRecord = {
    _id: string;
    userId: number;
    amount: number;
    coinsDeducted: number;
    coinsAdded?: number;
    status: 'pending' | 'completed' | 'failed' | 'success';
    paymentId?: string;
    transactionId?: string;
    createdAt: string;
};

type CallRecord = {
    id: string;
    callerName: string;
    hostName: string;
    type: string;
    voice: number;
    gift: number;
    hostEarning: number;
    duration: string | null;
    date: string;
};

export default function UserHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;

    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'coins' | 'recharges' | 'calls'>('coins');
    const [loading, setLoading] = useState(true);

    // History data states
    const [coinHistory, setCoinHistory] = useState<CoinTransaction[]>([]);
    const [rechargeHistory, setRechargeHistory] = useState<RechargeRecord[]>([]);
    const [callHistory, setCallHistory] = useState<CallRecord[]>([]);

    useEffect(() => {
        if (!userId) return;

        const loadData = async () => {
            try {
                setLoading(true);
                // 1. Fetch user details to get display name
                const userRes = await apiClient.get(`/api/user/${userId}`);
                if (userRes.success && userRes.data && userRes.data.user) {
                    setUser(userRes.data.user);
                } else {
                    toast.error("User not found");
                }

                // 2. Fetch Coin history
                const coinRes = await apiClient.get(`/api/user/coin-history?targetUserId=${userId}&limit=100`);
                if (coinRes.success && coinRes.data && coinRes.data.history) {
                    setCoinHistory(coinRes.data.history);
                }

                // 3. Fetch Recharge history
                const rechargeRes = await apiClient.get(`/api/user/recharge-history?targetUserId=${userId}&limit=100`);
                if (rechargeRes.success && rechargeRes.data && rechargeRes.data.history) {
                    setRechargeHistory(rechargeRes.data.history);
                }

                // 4. Fetch Call history
                const callRes = await apiClient.get(`/api/admin/calls/history?targetUserId=${userId}&limit=100`);
                if (callRes.success && callRes.data && callRes.data.calls) {
                    setCallHistory(callRes.data.calls);
                }

            } catch (err: any) {
                toast.error(err.message || "An error occurred while loading transaction histories");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-400">Loading user history ledger...</div>
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
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => router.push('/users')} className="h-9 w-9 bg-slate-900 border-slate-800 hover:bg-slate-800">
                        <ArrowLeft className="h-4 w-4 text-slate-300" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100">User History Ledger</h2>
                        <p className="text-xs text-slate-400">Viewing call, coin usage, and recharge ledger for <span className="text-fuchsia-400 font-bold">{user.name}</span> (UID: #{user.userId})</p>
                    </div>
                </div>
            </div>

            {/* Profile Info Summary Card */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <Card className="bg-[#161520] border-slate-800">
                    <CardContent className="pt-4 pb-4">
                        <div className="text-xs text-slate-400 font-semibold">Coins Balance</div>
                        <div className="text-xl font-bold text-yellow-400 mt-1">🪙 {user.coins?.toLocaleString() || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#161520] border-slate-800">
                    <CardContent className="pt-4 pb-4">
                        <div className="text-xs text-slate-400 font-semibold">Diamonds Balance</div>
                        <div className="text-xl font-bold text-sky-400 mt-1">💎 {user.diamonds?.toLocaleString() || 0}</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#161520] border-slate-800">
                    <CardContent className="pt-4 pb-4">
                        <div className="text-xs text-slate-400 font-semibold">Total Recharges</div>
                        <div className="text-xl font-bold text-emerald-400 mt-1">💳 {rechargeHistory.length} records</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#161520] border-slate-800">
                    <CardContent className="pt-4 pb-4">
                        <div className="text-xs text-slate-400 font-semibold">Calls Logged</div>
                        <div className="text-xl font-bold text-violet-400 mt-1">📞 {callHistory.length} calls</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs Selector Navigation */}
            <div className="flex border-b border-slate-800/80 gap-6">
                <button
                    onClick={() => setActiveTab('coins')}
                    className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'coins' ? 'text-fuchsia-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        <span>Coin Transactions</span>
                    </div>
                    {activeTab === 'coins' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-fuchsia-500 rounded" />}
                </button>
                <button
                    onClick={() => setActiveTab('recharges')}
                    className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'recharges' ? 'text-fuchsia-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Recharges</span>
                    </div>
                    {activeTab === 'recharges' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-fuchsia-500 rounded" />}
                </button>
                <button
                    onClick={() => setActiveTab('calls')}
                    className={`pb-3 font-semibold text-sm transition-colors relative ${activeTab === 'calls' ? 'text-fuchsia-400' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    <div className="flex items-center gap-2">
                        <PhoneCall className="h-4 w-4" />
                        <span>Calls & Gifts</span>
                    </div>
                    {activeTab === 'calls' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-fuchsia-500 rounded" />}
                </button>
            </div>

            {/* Ledger Tab Content Panels */}
            <div className="space-y-4">
                {activeTab === 'coins' && (
                    <Card className="bg-[#161520] border-slate-800 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-base text-slate-200">Coin Receiving Ledger</CardTitle>
                            <CardDescription className="text-slate-400">Detailed coin receiving entries — amounts received by host via calls and gifts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800 hover:bg-transparent">
                                        <TableHead>Date</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>🪙 Coin Receiving</TableHead>
                                        <TableHead>Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {coinHistory.map((tx, idx) => (
                                        <TableRow key={idx} className="border-slate-800/50 hover:bg-slate-900/20 text-slate-300">
                                            <TableCell className="text-xs">{new Date(tx.createdAt).toLocaleString()}</TableCell>
                                            <TableCell className="capitalize">
                                                <Badge variant="secondary" className="bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20 text-xs">
                                                    {tx.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-yellow-400">🪙 {(tx.coinsSpent || tx.coins || 0).toLocaleString()}</TableCell>
                                            <TableCell className="text-xs text-slate-400 max-w-xs truncate">
                                                {tx.meta?.hostName && `To: ${tx.meta.hostName}`}
                                                {tx.meta?.callDuration && ` (${Math.floor(tx.meta.callDuration)}s duration)`}
                                                {tx.meta?.giftName && `Gift: ${tx.meta.giftName}`}
                                                {!tx.meta && '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {coinHistory.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-slate-500">No coin transactions found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'recharges' && (
                    <Card className="bg-[#161520] border-slate-800 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-base text-slate-200">Recharges & Coins Purchases</CardTitle>
                            <CardDescription className="text-slate-400">Ledger entries for coin balance additions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800 hover:bg-transparent">
                                        <TableHead>Date</TableHead>
                                        <TableHead>Price Amount</TableHead>
                                        <TableHead>Coins Added</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Transaction / Payment ID</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rechargeHistory.map((rec) => (
                                        <TableRow key={rec._id} className="border-slate-800/50 hover:bg-slate-900/20 text-slate-300">
                                            <TableCell className="text-xs">{new Date(rec.createdAt).toLocaleString()}</TableCell>
                                            <TableCell className="font-semibold text-emerald-400">${rec.amount || 0}</TableCell>
                                            <TableCell className="font-bold text-yellow-400">🪙 {rec.coinsAdded || rec.coinsDeducted || 0}</TableCell>
                                            <TableCell>
                                                <Badge variant={rec.status === 'completed' || rec.status === 'success' ? 'success' : 'destructive'} className="text-xs capitalize">
                                                    {rec.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-500">{rec.paymentId || rec.transactionId || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {rechargeHistory.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">No recharge transaction records found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'calls' && (
                    <Card className="bg-[#161520] border-slate-800 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-base text-slate-200">Calls & Gifts History</CardTitle>
                            <CardDescription className="text-slate-400">Details for voice, video, and gift transactions during calls.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-slate-800 hover:bg-transparent">
                                        <TableHead>Date</TableHead>
                                        <TableHead>Caller</TableHead>
                                        <TableHead>Host</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>🪙 Coin Receiving</TableHead>
                                        <TableHead>💎 Diamond Sending</TableHead>
                                        <TableHead>Call Duration</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {callHistory.map((call) => (
                                        <TableRow key={call.id} className="border-slate-800/50 hover:bg-slate-900/20 text-slate-300">
                                            <TableCell className="text-xs">{new Date(call.date).toLocaleString()}</TableCell>
                                            <TableCell className="font-medium">{call.callerName}</TableCell>
                                            <TableCell className="font-medium text-fuchsia-400">{call.hostName}</TableCell>
                                            <TableCell className="capitalize text-xs">
                                                <Badge variant="outline" className={call.type === 'GIFT' ? 'border-pink-500/30 text-pink-400 bg-pink-500/5' : 'border-indigo-500/30 text-indigo-400 bg-indigo-500/5'}>
                                                    {call.type === 'VOICE_CALL' ? 'Voice Call' : call.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-yellow-400">🪙 {(call.voice || call.gift || 0).toLocaleString()}</TableCell>
                                            <TableCell className="font-bold text-sky-400">💎 {(call.hostEarning || 0).toLocaleString()}</TableCell>
                                            <TableCell className="text-xs text-slate-400 font-mono">{call.duration || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                    {callHistory.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-slate-500">No calls or gift logs found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
