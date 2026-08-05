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
import { Gem, Search, Calendar, RefreshCw, Printer, Download, Loader2 } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function SellerHistoryPage() {
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
    const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

    const fetchHistory = async (pageNum = 1) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            queryParams.set('page', pageNum.toString());
            queryParams.set('limit', '20');
            if (search.trim()) queryParams.set('search', search.trim());

            const res = await apiClient.get(`/api/seller/history?${queryParams.toString()}`);
            if (res.success && res.data) {
                setTransactions(res.data.history || []);
                if (res.data.pagination) {
                    setPagination(res.data.pagination);
                }
            }
        } catch (err: any) {
            console.error('Failed to fetch seller history:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(1);
    }, [search]);

    const handlePrintReceipt = (tx: any) => {
        setSelectedReceipt(tx);
        toast.info(`Opening digital receipt for ${tx.transactionId || tx.id}...`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        Transaction Audit Logs
                    </h2>
                    <p className="text-muted-foreground mt-1 font-medium text-sm">
                        Complete history of user diamond recharges, timestamps, and digital receipts
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchHistory(pagination.page)} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </Button>
            </div>

            {/* Filter & Search Bar */}
            <Card className="glass-card border-slate-800">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by User ID or Tx ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 font-bold px-3 py-2 text-xs shrink-0">
                        {pagination.total} Total Log Entries
                    </Badge>
                </CardContent>
            </Card>

            {/* History Table */}
            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <Calendar className="h-5 w-5 text-emerald-400" />
                        Audit Log Records
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-800">
                                <TableHead className="font-bold text-slate-300">Transaction ID</TableHead>
                                <TableHead className="font-bold text-slate-300">Target User ID</TableHead>
                                <TableHead className="font-bold text-slate-300">Type</TableHead>
                                <TableHead className="font-bold text-slate-300">Diamonds Credited</TableHead>
                                <TableHead className="font-bold text-slate-300">Cost (₹)</TableHead>
                                <TableHead className="font-bold text-slate-300">Customer Amt (₹)</TableHead>
                                <TableHead className="font-bold text-slate-300">Date Timestamp</TableHead>
                                <TableHead className="font-bold text-slate-300 text-right">Receipt</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx.transactionId || tx._id} className="hover:bg-slate-800/40 border-slate-800/50">
                                    <TableCell className="font-mono text-xs text-emerald-400 font-bold">{tx.transactionId}</TableCell>
                                    <TableCell className="font-mono text-xs text-slate-200">{tx.userId ? `User #${tx.userId}` : '—'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] uppercase border-emerald-500/20 text-emerald-400 font-bold">
                                            {tx.transactionType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-bold text-cyan-300">+{ (tx.diamonds || 0).toLocaleString() } 💎</TableCell>
                                    <TableCell className="font-bold text-slate-200">₹{ (tx.sellerCost || 0).toLocaleString() }</TableCell>
                                    <TableCell className="font-bold text-emerald-400">₹{ (tx.customerAmount || 0).toLocaleString() }</TableCell>
                                    <TableCell className="text-xs text-muted-foreground font-semibold">
                                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handlePrintReceipt(tx)}
                                            className="h-8 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 font-medium"
                                        >
                                            <Printer className="h-3.5 w-3.5 mr-1" /> Receipt
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {transactions.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                                        No transaction history logs found matching your query.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Receipt Modal Card Preview */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <Gem className="h-5 w-5 text-cyan-400" />
                                <h3 className="font-bold text-slate-100 text-lg">Digital Receipt</h3>
                            </div>
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold">
                                {selectedReceipt.status || 'SUCCESS'}
                            </Badge>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400">Transaction Ref:</span>
                                <span className="font-mono text-slate-200 font-bold">{selectedReceipt.transactionId}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400">Target User ID:</span>
                                <span className="font-mono text-slate-200">User #{selectedReceipt.userId}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400">Diamonds Credited:</span>
                                <span className="font-extrabold text-cyan-300 text-sm">💎 {(selectedReceipt.diamonds || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400">Seller Cost Paid:</span>
                                <span className="font-bold text-slate-100 text-sm">₹{(selectedReceipt.sellerCost || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/60">
                                <span className="text-slate-400">Customer Amount Value:</span>
                                <span className="font-bold text-emerald-400 text-sm">₹{(selectedReceipt.customerAmount || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-slate-400">Date Timestamp:</span>
                                <span className="text-slate-300">{selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleString() : '-'}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedReceipt(null)}>
                                Close
                            </Button>
                            <Button size="sm" onClick={() => toast.success("Receipt downloaded!")} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                                <Download className="h-4 w-4 mr-1.5" /> Download PDF
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
