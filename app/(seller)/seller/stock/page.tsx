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
import { Gem, Plus, ShoppingBag, Clock, Loader2, RefreshCw } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

const ADMIN_STOCK_PACKAGES = [
    { id: 'S1', price: '₹950', diamonds: 16700, tag: 'Starter Stock' },
    { id: 'S2', price: '₹4,750', diamonds: 83500, tag: 'Standard Stock' },
    { id: 'S3', price: '₹9,500', diamonds: 167000, tag: 'Popular Stock', isPopular: true },
    { id: 'S4', price: '₹23,750', diamonds: 417500, tag: 'Pro Stock' },
    { id: 'S5', price: '₹47,500', diamonds: 835000, tag: 'Bulk Stock', isPopular: true },
    { id: 'S6', price: '₹95,000', diamonds: 1670000, tag: 'Wholesale Stock' },
];

export default function SellerBuyStockPage() {
    const [selectedPackage, setSelectedPackage] = useState<typeof ADMIN_STOCK_PACKAGES[0] | null>(ADMIN_STOCK_PACKAGES[2]);
    const [utrNumber, setUtrNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    const [stockRequests, setStockRequests] = useState<any[]>([]);

    const fetchStockRequests = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get('/api/seller/stock/requests');
            if (res.success && res.data && res.data.requests) {
                setStockRequests(res.data.requests);
            }
        } catch (err: any) {
            console.error('Failed to fetch seller stock requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStockRequests();
    }, []);

    const handleSubmitStockRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPackage) return toast.error("Please select a stock package");
        if (!utrNumber.trim()) return toast.error("Please enter UTR / Transaction Reference Number");

        const numPayable = Number(selectedPackage.price.replace(/[^\d]/g, ''));

        setSubmitting(true);
        try {
            const res = await apiClient.post('/api/seller/stock/request', {
                diamonds: selectedPackage.diamonds,
                payableAmount: numPayable,
                packageId: selectedPackage.id,
                paymentMethod: 'UPI',
                utrNumber: utrNumber.trim().toUpperCase(),
                notes
            });

            if (res.success) {
                toast.success(res.message || `Stock purchase request submitted successfully! Admin approval pending.`);
                setUtrNumber('');
                setNotes('');
                fetchStockRequests();
            } else {
                toast.error(res.message || 'Failed to submit request');
            }
        } catch (err: any) {
            const errMsg = err?.message || err?.error || 'Failed to submit request';
            toast.error(errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        Buy Diamond Stock
                    </h2>
                    <p className="text-muted-foreground mt-1 font-medium text-sm">
                        Purchase bulk Diamond stock inventory from Admin at special 5% discounted Seller rates
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchStockRequests} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh Requests
                </Button>
            </div>

            {/* Admin Stock Packages Cards */}
            <Card className="glass-card border-blue-500/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-300 text-lg">
                        <ShoppingBag className="h-5 w-5 text-blue-400" />
                        Admin Bulk Stock Packages (5% Discount Rate)
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                        Select a package below to request stock addition from admin
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ADMIN_STOCK_PACKAGES.map((pkg) => (
                            <div
                                key={pkg.id}
                                onClick={() => setSelectedPackage(pkg)}
                                className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                                    selectedPackage?.id === pkg.id
                                        ? 'bg-blue-950/70 border-blue-400 ring-2 ring-blue-400/50 shadow-lg'
                                        : 'bg-slate-900/60 border-slate-800 hover:border-blue-500/40'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{pkg.tag}</span>
                                    {pkg.isPopular && (
                                        <Badge className="bg-blue-500 text-[10px] text-slate-950 font-bold px-2 py-0">BEST SELLER</Badge>
                                    )}
                                </div>

                                <div className="my-3">
                                    <div className="text-2xl font-extrabold text-slate-100">{pkg.price}</div>
                                    <div className="text-lg font-bold text-cyan-300 flex items-center gap-1.5 mt-1">
                                        <span>💎</span>
                                        <span>{pkg.diamonds.toLocaleString()} Diamonds</span>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                                    <span>Seller Rate (₹95 / 1,670 💎)</span>
                                    {selectedPackage?.id === pkg.id ? (
                                        <Badge className="bg-blue-600 text-white font-bold">Selected</Badge>
                                    ) : (
                                        <span className="text-blue-400 font-semibold">Select</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Payment & Request Form */}
                <Card className="glass-card md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200 text-base">
                            <Plus className="h-5 w-5 text-blue-400" />
                            Submit Stock Purchase Request
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmitStockRequest} className="space-y-4">
                            {/* Selected Package Details Summary */}
                            {selectedPackage && (
                                <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/30 space-y-1 text-xs">
                                    <div className="flex items-center justify-between text-slate-300 font-semibold">
                                        <span>Selected Package:</span>
                                        <span className="text-slate-100">{selectedPackage.tag}</span>
                                    </div>
                                    <div className="flex items-center justify-between font-bold">
                                        <span className="text-slate-300">Amount Payable:</span>
                                        <span className="text-slate-100 text-sm">{selectedPackage.price}</span>
                                    </div>
                                    <div className="flex items-center justify-between font-extrabold text-cyan-300">
                                        <span>Stock Addition:</span>
                                        <span>💎 {selectedPackage.diamonds.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            {/* Payment Instructions Box */}
                            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs space-y-1.5">
                                <h4 className="font-bold text-slate-200">Payment Deposit Info (Admin Account):</h4>
                                <p className="text-slate-400">UPI ID: <strong className="text-slate-200">admin@meethichat.upi</strong></p>
                                <p className="text-slate-400">Bank: <strong className="text-slate-200">HDFC Bank (A/C: 5020008891024)</strong></p>
                            </div>

                            {/* UTR Reference Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">UTR / Transaction Reference No.</label>
                                <Input
                                    placeholder="Enter 12-digit UTR No."
                                    value={utrNumber}
                                    onChange={(e) => setUtrNumber(e.target.value)}
                                    required
                                    className="uppercase font-mono"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white"
                                disabled={submitting || !selectedPackage}
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting Request...</span>
                                ) : (
                                    'Submit Stock Request'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Stock Purchase Requests Audit Table */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Clock className="h-5 w-5 text-blue-400" />
                            Stock Purchase Audit Requests
                        </CardTitle>
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">
                            {stockRequests.length} Requests
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800">
                                    <TableHead className="font-bold text-slate-300">Request ID</TableHead>
                                    <TableHead className="font-bold text-slate-300">Diamonds Requested</TableHead>
                                    <TableHead className="font-bold text-slate-300">Amount (₹)</TableHead>
                                    <TableHead className="font-bold text-slate-300">UTR Number</TableHead>
                                    <TableHead className="font-bold text-slate-300">Status</TableHead>
                                    <TableHead className="font-bold text-slate-300">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stockRequests.map((req) => (
                                    <TableRow key={req.requestId || req.id} className="hover:bg-slate-800/40 border-slate-800/50">
                                        <TableCell className="font-mono text-xs text-blue-400 font-bold">{req.requestId || req.id}</TableCell>
                                        <TableCell className="font-bold text-cyan-300">💎 {(req.diamonds || 0).toLocaleString()}</TableCell>
                                        <TableCell className="font-bold text-slate-200">₹{(req.payableAmount || req.amount || 0).toLocaleString()}</TableCell>
                                        <TableCell className="font-mono text-xs text-slate-400">{req.utrNumber || req.utr}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="outline"
                                                className={`text-[10px] uppercase font-bold ${
                                                    req.status === 'APPROVED' || req.status === 'Approved'
                                                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                                                        : req.status === 'REJECTED' || req.status === 'Rejected'
                                                        ? 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                                                        : 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                                                }`}
                                            >
                                                {req.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {req.createdAt ? new Date(req.createdAt).toLocaleString() : req.date || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {stockRequests.length === 0 && !loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                            No stock purchase requests submitted yet.
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
