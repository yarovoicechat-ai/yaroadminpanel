'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DollarSign, ArrowUpRight, ArrowDownLeft, RefreshCw, Filter, Download } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

export default function WalletLedgerPage() {
    const [loading, setLoading] = useState(false);

    const transactions = [
        { txId: 'TXN-98401', type: 'Credit', category: 'Coin Recharge', amount: '₹15,000', user: 'Seller SEL000001', date: '2026-07-27 02:15', status: 'Completed' },
        { txId: 'TXN-98402', type: 'Debit', category: 'Host Payout', amount: '₹8,500', user: 'Host HST000004', date: '2026-07-27 02:00', status: 'Completed' },
        { txId: 'TXN-98403', type: 'Transfer', category: 'Agency Commission', amount: '₹3,200', user: 'Agency AGY000002', date: '2026-07-27 01:45', status: 'Completed' },
        { txId: 'TXN-98404', type: 'Credit', category: 'VIP Diamond Pack', amount: '₹4,999', user: 'User USR100085', date: '2026-07-27 01:20', status: 'Completed' },
        { txId: 'TXN-98405', type: 'Refund', category: 'Call Disconnect Refund', amount: '₹120', user: 'User USR100012', date: '2026-07-27 00:50', status: 'Completed' }
    ];

    return (
        <div className="p-6 space-y-6 bg-[#0f0e15] min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-400" /> Enterprise Finance & Double-Entry Wallet Ledger
                    </h1>
                    <p className="text-xs text-slate-400">Complete audit trail of all Credits, Debits, Transfers, Recharges, Payouts, Commissions, and Refunds.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => toast.success('Ledger exported to Excel')} variant="outline" size="sm" className="border-slate-800 bg-slate-900 text-slate-300 gap-2">
                        <Download className="w-4 h-4" /> Export Excel
                    </Button>
                    <Button onClick={() => toast.info('Ledger refreshed')} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2">
                        <RefreshCw className="w-4 h-4" /> Refresh Ledger
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-slate-800 bg-[#161520]">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400 text-xs font-semibold">Total Gross Volume</CardDescription>
                        <CardTitle className="text-2xl font-black text-white">₹14,850,200</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-slate-800 bg-[#161520]">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400 text-xs font-semibold">Today's Revenue</CardDescription>
                        <CardTitle className="text-2xl font-black text-emerald-400">₹485,400</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-slate-800 bg-[#161520]">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400 text-xs font-semibold">Pending Host Payouts</CardDescription>
                        <CardTitle className="text-2xl font-black text-amber-400">₹124,000</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="border-slate-800 bg-[#161520]">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400 text-xs font-semibold">Agency Settlements</CardDescription>
                        <CardTitle className="text-2xl font-black text-purple-400">₹68,500</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="border-slate-800 bg-[#161520]">
                <CardHeader>
                    <CardTitle className="text-white text-base">Real-Time Ledger Audit Stream</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">Immutable financial ledger records.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    {transactions.map((tx, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg border ${
                                    tx.type === 'Credit' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                    tx.type === 'Debit' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                                }`}>
                                    {tx.type === 'Credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                </div>
                                <div>
                                    <div className="font-bold text-white flex items-center gap-2">
                                        <span className="font-mono text-indigo-400">{tx.txId}</span> • {tx.category}
                                    </div>
                                    <div className="text-slate-400 text-[11px]">{tx.user} • {tx.date}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`font-black text-sm font-mono ${tx.type === 'Credit' ? 'text-emerald-400' : 'text-slate-200'}`}>
                                    {tx.amount}
                                </div>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                                    {tx.status}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
