'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import {
    Gem, Plus, TrendingUp, Users, DollarSign,
    Calendar, ShoppingBag, FileText, ArrowRight, RefreshCw, Loader2
} from "lucide-react";
import { apiClient } from '@/lib/apiClient';

export default function SellerDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        stockBalance: 0,
        todaySalesDiamonds: 0,
        todaySalesInr: 0,
        todayProfitInr: 0,
        monthlySalesDiamonds: 0,
        monthlySalesInr: 0,
        monthlyProfitInr: 0,
        totalCustomers: 0,
    });
    const [recentTransfers, setRecentTransfers] = useState<any[]>([]);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/api/seller/dashboard');
            if (res.success && res.data) {
                if (res.data.stats) {
                    setStats(res.data.stats);
                }
                if (res.data.recentTransactions) {
                    setRecentTransfers(res.data.recentTransactions);
                }
            }
        } catch (err: any) {
            console.error('Failed to load seller dashboard:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header & Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        Seller Dashboard
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">
                        Welcome back! Overview of your Diamond stock, sales performance, and quick transfers.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={fetchDashboard} disabled={loading} className="border-slate-800">
                        <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                    <Link href="/seller/stock">
                        <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 font-bold">
                            <ShoppingBag className="h-4 w-4 mr-2" /> Buy Stock
                        </Button>
                    </Link>
                    <Link href="/seller/recharge">
                        <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-600/20">
                            <Plus className="h-4 w-4 mr-2" /> Recharge User
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Available Stock Balance */}
                <Card className="glass-card border-cyan-500/30 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-cyan-400" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Available Stock Balance
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                            <Gem className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-cyan-300">
                            💎 {stats.stockBalance.toLocaleString()}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <span>Ready to transfer to users</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Today's Sales */}
                <Card className="glass-card border-emerald-500/30 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-emerald-400" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Today's Sales
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-emerald-300">
                            💎 {stats.todaySalesDiamonds.toLocaleString()}
                        </div>
                        <p className="text-xs text-emerald-400/90 mt-1 font-medium flex items-center justify-between">
                            <span>₹{stats.todaySalesInr.toLocaleString()} Total Revenue</span>
                            <span className="text-emerald-300 font-bold">+₹{stats.todayProfitInr.toLocaleString()} profit</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Monthly Sales */}
                <Card className="glass-card border-blue-500/30 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-blue-400" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Monthly Sales
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-blue-300">
                            💎 {stats.monthlySalesDiamonds.toLocaleString()}
                        </div>
                        <p className="text-xs text-blue-400/90 mt-1 font-medium flex items-center justify-between">
                            <span>₹{stats.monthlySalesInr.toLocaleString()} Total Revenue</span>
                            <span className="text-blue-300 font-bold">+₹{stats.monthlyProfitInr.toLocaleString()} profit</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Total Customers */}
                <Card className="glass-card border-purple-500/30 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-purple-400" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Recharged Customers
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                            <Users className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-extrabold text-purple-300">
                            {stats.totalCustomers} Users
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Unique user accounts
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Navigation Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link href="/seller/recharge">
                    <Card className="glass-card hover:border-cyan-500/50 transition-all cursor-pointer group">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">User Recharge</h4>
                                <p className="text-xs text-slate-400">Credit diamonds to user ID</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                                <Gem className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/seller/stock">
                    <Card className="glass-card hover:border-blue-500/50 transition-all cursor-pointer group">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">Buy Stock</h4>
                                <p className="text-xs text-slate-400">Purchase diamonds from admin</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/seller/history">
                    <Card className="glass-card hover:border-emerald-500/50 transition-all cursor-pointer group">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">Audit Logs</h4>
                                <p className="text-xs text-slate-400">View recharge transaction receipts</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                                <FileText className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/seller/ledger">
                    <Card className="glass-card hover:border-indigo-500/50 transition-all cursor-pointer group">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">Profit & Ledger</h4>
                                <p className="text-xs text-slate-400">Track 5% margin & stock statement</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Recent Recharges Section */}
            <Card className="glass-card border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Calendar className="h-5 w-5 text-cyan-400" />
                            Recent User Recharges
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs mt-0.5">
                            Latest Diamond allocations processed by your seller account
                        </CardDescription>
                    </div>
                    <Link href="/seller/history">
                        <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300">
                            View All Logs <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800">
                                <TableHead className="font-bold text-slate-300">Transaction ID</TableHead>
                                <TableHead className="font-bold text-slate-300">Target User ID</TableHead>
                                <TableHead className="font-bold text-slate-300">Type</TableHead>
                                <TableHead className="font-bold text-slate-300">Diamonds Credited</TableHead>
                                <TableHead className="font-bold text-slate-300">Rupees (₹)</TableHead>
                                <TableHead className="font-bold text-slate-300">Timestamp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransfers.map((tx, idx) => (
                                <TableRow key={tx.transactionId || tx.id || idx} className="hover:bg-slate-800/40 border-slate-800/50">
                                    <TableCell className="font-mono text-xs text-cyan-400 font-bold">{tx.transactionId || tx.id}</TableCell>
                                    <TableCell className="font-semibold text-slate-200">{tx.userId ? `User #${tx.userId}` : '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] uppercase border-cyan-500/20 text-cyan-400">
                                            {tx.transactionType || 'USER_RECHARGE'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-cyan-300">+{ (tx.diamonds || 0).toLocaleString() } 💎</TableCell>
                                    <TableCell className="font-bold text-slate-200">₹{ (tx.customerAmount || tx.inr || 0).toLocaleString() }</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : tx.date || '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {recentTransfers.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                        No recent transactions recorded yet.
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
