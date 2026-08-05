'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { TrendingUp, RefreshCw, Layers } from "lucide-react";
import { apiClient } from '@/lib/apiClient';

export default function SellerLedgerPage() {
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        currentStockBalance: 0,
        totalStockPurchased: 0,
        totalStockSold: 0,
        totalSellerCostInr: 0,
        totalCustomerAmountInr: 0,
        netProfitInr: 0,
    });
    const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);

    const fetchLedger = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/api/seller/ledger');
            if (res.success && res.data) {
                if (res.data.summary) {
                    setSummary(res.data.summary);
                }
                if (res.data.ledgerEntries) {
                    setLedgerEntries(res.data.ledgerEntries);
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch seller ledger:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Profit & Stock Ledger
                    </h2>
                    <p className="text-muted-foreground mt-1 font-medium text-sm">
                        Audit ledger statement, stock movement, and 5% Seller Margin earnings calculation
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchLedger} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
            </div>

            {/* Profit Margin Summary Banner */}
            <div className="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-300">
                        <TrendingUp className="h-5 w-5 text-indigo-400" />
                        <h3 className="font-bold text-base text-slate-100">Estimated Seller Net Profit (5% Rate Margin)</h3>
                    </div>
                    <p className="text-xs text-slate-300">
                        Calculated based on <strong>₹95 Seller Rate</strong> vs <strong>₹100 User Rate</strong> for 1,670 💎
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-extrabold text-emerald-400">
                        +₹{summary.netProfitInr.toLocaleString()}
                    </div>
                    <span className="text-[11px] text-slate-400 font-semibold">Net Profit Margin Earned</span>
                </div>
            </div>

            {/* 4 Stock Balance Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-card border-indigo-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Available Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-extrabold text-slate-200">
                            💎 {summary.currentStockBalance.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-blue-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Stock Purchased (+)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-extrabold text-blue-300">
                            +💎 {summary.totalStockPurchased.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-cyan-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Stock Sold (-)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-extrabold text-cyan-300">
                            -💎 {summary.totalStockSold.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card border-emerald-500/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Seller Cost Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-extrabold text-emerald-300">
                            ₹{summary.totalSellerCostInr.toLocaleString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ledger Audit Table */}
            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <Layers className="h-5 w-5 text-indigo-400" />
                        Stock Inventory Ledger Statement
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800">
                                <TableHead className="font-bold text-slate-300">Ledger ID</TableHead>
                                <TableHead className="font-bold text-slate-300">Transaction Type</TableHead>
                                <TableHead className="font-bold text-slate-300">Diamonds In (+)</TableHead>
                                <TableHead className="font-bold text-slate-300">Diamonds Out (-)</TableHead>
                                <TableHead className="font-bold text-slate-300">Opening Balance</TableHead>
                                <TableHead className="font-bold text-slate-300">Closing Balance</TableHead>
                                <TableHead className="font-bold text-slate-300">Date Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ledgerEntries.map((entry) => (
                                <TableRow key={entry.ledgerId || entry._id} className="hover:bg-slate-800/40 border-slate-800/50">
                                    <TableCell className="font-mono text-xs text-indigo-400 font-bold">{entry.ledgerId}</TableCell>
                                    <TableCell className="font-semibold text-slate-200">{entry.transactionType}</TableCell>
                                    <TableCell className="font-bold text-emerald-400">
                                        {entry.credit > 0 ? `+${entry.credit.toLocaleString()} 💎` : '—'}
                                    </TableCell>
                                    <TableCell className="font-bold text-cyan-400">
                                        {entry.debit > 0 ? `-${entry.debit.toLocaleString()} 💎` : '—'}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-400">
                                        💎 {(entry.openingBalance || 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-slate-200 font-bold">
                                        💎 {(entry.closingBalance || 0).toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {ledgerEntries.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                        No ledger records available yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
